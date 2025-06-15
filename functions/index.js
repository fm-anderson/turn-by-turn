const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const GOOGLE_MAPS_API_KEY_SECRET = defineSecret("GOOGLE_MAPS_API_KEY");

const app = express();
const corsOptions = {
  origin: "https://turnbyturn.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

const INITIAL_MILES_PER_STOP = 485;

async function getDirections(originPoint, destinationPoint) {
  const apiKey = GOOGLE_MAPS_API_KEY_SECRET.value();
  if (!apiKey) {
    console.error("Error: GOOGLE_MAPS_API_KEY secret is not set.");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json`;

  try {
    console.log(
      `Fetching directions from ${originPoint} to ${destinationPoint}...`
    );
    const response = await axios.get(url, {
      params: {
        origin: originPoint,
        destination: destinationPoint,
        key: apiKey,
      },
    });

    if (response.data.status === "OK") {
      return response.data;
    } else {
      console.error(
        "Google Maps API Error:",
        response.data.status,
        response.data.error_message || ""
      );
      return null;
    }
  } catch (error) {
    console.error(
      "An error occurred while fetching directions:",
      error.message
    );
    return null;
  }
}

async function reverseGeocode(lat, lng) {
  const apiKey = GOOGLE_MAPS_API_KEY_SECRET.value();
  if (!apiKey) {
    console.error("Error: GOOGLE_MAPS_API_KEY secret is not set.");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const originalCoords = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

  try {
    const response = await axios.get(url, {
      params: {
        latlng: `${lat},${lng}`,
        key: apiKey,
      },
    });

    if (response.data.status === "OK" && response.data.results.length > 0) {
      const components = response.data.results[0].address_components;
      const find = (type) => components.find((c) => c.types.includes(type));

      const city =
        find("locality")?.long_name || find("postal_town")?.long_name || "N/A";
      const state = find("administrative_area_level_1")?.short_name || "N/A";

      if (city === "N/A" || state === "N/A") {
        return "N/A";
      }

      return `${city}, ${state}`;
    } else {
      console.warn(
        `Reverse geocode failed for ${originalCoords}. Status: ${response.data.status}`
      );
      return "N/A";
    }
  } catch (error) {
    console.error(
      `An error occurred during reverse geocoding for ${originalCoords}:`,
      error.message
    );
    return "N/A";
  }
}

async function calculateAndResolveSingleStop(
  leg,
  currentDistanceFromStart,
  targetDistanceToAdd,
  maxAttempts = 10,
  reductionStepMeters = 5 * 1609.34
) {
  let attempts = 0;
  let currentTargetDistanceToAdd = targetDistanceToAdd;

  while (attempts < maxAttempts) {
    const nextStopDistanceMarker =
      currentDistanceFromStart + currentTargetDistanceToAdd;

    if (
      nextStopDistanceMarker > leg.distance.value ||
      currentTargetDistanceToAdd <= 0
    ) {
      console.warn(
        `Cannot find suitable stop for current segment. Target distance too small or past end of route.`
      );
      return null;
    }

    let distanceTraveledInLeg = 0;
    let stopFoundInStep = false;
    let stopLat = null;
    let stopLng = null;

    for (const step of leg.steps) {
      const stepEndDistance = distanceTraveledInLeg + step.distance.value;

      if (stepEndDistance >= nextStopDistanceMarker) {
        const distanceIntoStep = nextStopDistanceMarker - distanceTraveledInLeg;
        const fractionOfStep = distanceIntoStep / step.distance.value;

        stopLat =
          step.start_location.lat +
          fractionOfStep * (step.end_location.lat - step.start_location.lat);
        stopLng =
          step.start_location.lng +
          fractionOfStep * (step.end_location.lng - step.start_location.lng);

        stopFoundInStep = true;
        break;
      }
      distanceTraveledInLeg = stepEndDistance;
    }

    if (stopFoundInStep) {
      const resolvedAddress = await reverseGeocode(stopLat, stopLng);

      if (resolvedAddress !== "N/A") {
        return {
          address: resolvedAddress,
          distanceFromStart: (nextStopDistanceMarker / 1609.34).toFixed(2),
          lat: stopLat,
          lng: stopLng,
          actualDistanceAdded: currentTargetDistanceToAdd / 1609.34,
        };
      } else {
        console.log(
          `Address for (Lat: ${stopLat.toFixed(4)}, Lng: ${stopLng.toFixed(
            4
          )}) is "N/A". Retrying with reduced distance.`
        );
        currentTargetDistanceToAdd -= reductionStepMeters;
      }
    } else {
      console.warn(
        "Could not find stop location within steps. Adjusting target distance."
      );
      currentTargetDistanceToAdd -= reductionStepMeters;
    }
    attempts++;
  }

  console.warn(
    `Failed to resolve address for a stop after ${maxAttempts} attempts at currentDistanceFromStart: ${
      currentDistanceFromStart / 1609.34
    } miles. Skipping this stop.`
  );
  return null;
}

app.post("/calculate-route", async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res
      .status(400)
      .send("Missing 'origin' or 'destination' in request body.");
  }

  const directionsData = await getDirections(origin, destination);

  if (!directionsData) {
    return res
      .status(500)
      .send("Failed to get directions from Google Maps API.");
  }

  const route = directionsData.routes[0];
  const leg = route.legs[0];
  const totalDistanceInMeters = leg.distance.value;
  const totalDistanceMiles = (totalDistanceInMeters / 1609.34).toFixed(2);

  const stops = [];

  stops.push({
    address: leg.start_address,
    distanceFromStart: 0,
    lat: leg.start_location.lat,
    lng: leg.start_location.lng,
    actualDistanceAdded: 0,
  });

  let currentDistanceFromOrigin = 0;

  while (
    currentDistanceFromOrigin + INITIAL_MILES_PER_STOP * 1609.34 <
    totalDistanceInMeters
  ) {
    const nextTargetDistance = INITIAL_MILES_PER_STOP * 1609.34;

    const stopDetails = await calculateAndResolveSingleStop(
      leg,
      currentDistanceFromOrigin,
      nextTargetDistance
    );

    if (stopDetails) {
      stops.push(stopDetails);
      currentDistanceFromOrigin =
        parseFloat(stopDetails.distanceFromStart) * 1609.34;
    } else {
      currentDistanceFromOrigin += nextTargetDistance;
      console.warn(
        "Could not find a suitable location for a stop in this segment. Moving to next segment."
      );
    }
  }

  stops.push({
    address: leg.end_address,
    distanceFromStart: (totalDistanceInMeters / 1609.34).toFixed(2),
    lat: leg.end_location.lat,
    lng: leg.end_location.lng,
    actualDistanceAdded:
      parseFloat(totalDistanceMiles) -
      parseFloat(stops[stops.length - 1].distanceFromStart),
  });

  const allAddresses = stops.map((stop) => encodeURIComponent(stop.address));
  const originAddress = allAddresses[0];
  const destinationAddress = allAddresses[allAddresses.length - 1];
  const waypoints = allAddresses.slice(1, -1).join("/");

  let mapsUrl = `https://www.google.com/maps/dir/${originAddress}/${
    waypoints ? waypoints + "/" : ""
  }${destinationAddress}`;

  res.status(200).json({
    totalDistanceMiles: totalDistanceMiles,
    totalDuration: leg.duration.text,
    stops: stops,
    googleMapsUrl: mapsUrl,
  });
});

exports.routeCalculator = onRequest(
  { secrets: [GOOGLE_MAPS_API_KEY_SECRET] },
  app
);
