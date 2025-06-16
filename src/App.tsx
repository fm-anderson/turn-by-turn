import { useState } from "react";
import TableData from "./components/TableData";
import Footer from "./components/Footer";

interface Stop {
  address: string;
  distanceFromStart: number | string;
  lat: number;
  lng: number;
  actualDistanceAdded: number;
}

interface RouteData {
  totalDistanceMiles: string;
  totalDuration: string;
  stops: Stop[];
  googleMapsUrl: string;
}

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getTurnByTurnMapsUrl = (originalUrl: string): string => {
    const dataIndex = originalUrl.indexOf("/data=");

    if (dataIndex !== -1) {
      return (
        originalUrl.substring(0, dataIndex) +
        "/am=t" +
        originalUrl.substring(dataIndex)
      );
    }
    return originalUrl + "/am=t";
  };

  const cleanAddress = (address: string): string => {
    let cleaned = address.trim();

    cleaned = cleaned.replace(/, USA$/, "");

    const parts = cleaned.split(",").map((part) => part.trim());

    let city = "";
    let state = "";

    const stateRegex = /^[A-Z]{2}$/;

    for (let i = parts.length - 1; i >= 0; i--) {
      const currentPart = parts[i];
      if (stateRegex.test(currentPart)) {
        state = currentPart;
        if (i > 0) {
          city = parts[i - 1];
        }
        break;
      } else if (currentPart.match(/^[A-Z]{2}\s\d{5}(-\d{4})?$/)) {
        const stateZipParts = currentPart.split(" ");
        if (stateZipParts.length > 0 && stateRegex.test(stateZipParts[0])) {
          state = stateZipParts[0];
          if (i > 0) {
            city = parts[i - 1];
          }
          break;
        }
      }
    }

    if (city && state) {
      return `${city}, ${state}`;
    }

    const relevantParts = parts.filter((p) => !p.match(/^\d+$/));

    if (relevantParts.length >= 2) {
      return `${relevantParts[relevantParts.length - 2]}, ${relevantParts[relevantParts.length - 1]}`;
    } else if (relevantParts.length === 1) {
      return relevantParts[0];
    }

    return cleaned;
  };

  const handleGenerateRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError("Please enter both an origin and a destination.");
      return;
    }

    setIsLoading(true);
    setError("");
    setRouteData(null);

    const functionUrl =
      "https://routecalculator-wd6lajyjxa-uc.a.run.app/calculate-route";

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Something went wrong on the server."
        );
      }

      const data: RouteData = await response.json();

      const cleanedStops = data.stops.map((stop) => ({
        ...stop,
        address: cleanAddress(stop.address),
      }));

      const cleanedRouteData: RouteData = {
        ...data,
        stops: cleanedStops,
      };

      setRouteData(cleanedRouteData);
      console.log("Route data received (cleaned):", cleanedRouteData);
    } catch (err) {
      console.error("Error fetching route:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormComplete = origin && destination && startDate;

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <div className="flex-grow flex flex-col items-center justify-start p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-base-content">
            Turn-By-Turn Route Generator
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-md">
            Enter your start and end points to calculate daily stops.
          </p>
        </div>
        <div className="w-full max-w-md bg-base-100 p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleGenerateRoute} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend text-gray-700 mb-1">
                  Origin
                </legend>
                <input
                  className="input w-full"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Boston, MA"
                  disabled={isLoading}
                  aria-label="Origin"
                />
              </fieldset>
              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend text-gray-700 mb-1">
                  Destination
                </legend>
                <input
                  className="input w-full"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g Luke AFB"
                  disabled={isLoading}
                  aria-label="Destination"
                />
              </fieldset>
            </div>
            <fieldset className="fieldset flex flex-col">
              <legend className="fieldset-legend text-gray-700 mb-1">
                Start Date
              </legend>
              <input
                type="date"
                className="input w-full p-3"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start Date"
              />
            </fieldset>
            <button
              type="submit"
              className="btn"
              disabled={isLoading || !isFormComplete}
              aria-live="polite"
            >
              {isLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {isLoading ? "Generating Route..." : "Generate Route"}
            </button>
          </form>
          {error && (
            <div role="alert" className="alert alert-error alert-soft mt-4">
              <span>
                <strong className="font-bold">Error: </strong>
                {error}
              </span>
            </div>
          )}
        </div>
        {routeData && (
          <div className="w-full max-w-md flex justify-between mb-8">
            <a
              className="btn bg-white text-black border-[#e5e5e5] rounded-lg"
              href={routeData?.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-map-pin-share ml-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M12.02 21.485a1.996 1.996 0 0 1 -1.433 -.585l-4.244 -4.243a8 8 0 1 1 13.403 -3.651" />
                <path d="M16 22l5 -5" />
                <path d="M21 21.5v-4.5h-4.5" />
              </svg>
            </a>
            <a
              className="btn bg-white text-black border-[#e5e5e5] rounded-lg"
              href={getTurnByTurnMapsUrl(routeData?.googleMapsUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Turn By Turn
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-cloud-download ml-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M19 18a3.5 3.5 0 0 0 0 -7h-1a5 4.5 0 0 0 -11 -2a4.6 4.4 0 0 0 -2.1 8.4" />
                <path d="M12 13l0 9" />
                <path d="M9 19l3 3l3 -3" />
              </svg>
            </a>
          </div>
        )}
        {routeData && (
          <div className="overflow-x-auto rounded-lg bg-base-100 shadow-xl">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th>Departure Point</th>
                  <th>Arrival Point</th>
                  <th className="hidden md:table-cell">Lenght of Rest</th>
                  <th>Approx. Mileage</th>
                </tr>
              </thead>
              <tbody>
                {routeData.stops
                  .slice(0, routeData.stops.length - 1)
                  .map((stop: Stop, index: number) => {
                    const arrivalStop = routeData.stops[index + 1];

                    const [year, month, day] = startDate.split("-").map(Number);
                    const initialDepartureDate = new Date(year, month - 1, day);
                    initialDepartureDate.setHours(0, 0, 0, 0);

                    const daysToAdd = Math.ceil(
                      parseFloat(stop.distanceFromStart.toString()) / 500
                    );

                    const currentSegmentDate = new Date(initialDepartureDate);
                    currentSegmentDate.setDate(
                      initialDepartureDate.getDate() + daysToAdd
                    );

                    const formattedDate = currentSegmentDate
                      .toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/,/, "");

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <th className="py-3 px-4 text-sm text-gray-900">
                          {index + 1}
                        </th>
                        <TableData hideOnMobile={true}>
                          {formattedDate}
                        </TableData>
                        <TableData>{stop.address}</TableData>
                        <TableData>{arrivalStop.address}</TableData>
                        <TableData hideOnMobile={true}>8 hours</TableData>
                        <TableData>
                          +{arrivalStop.actualDistanceAdded.toFixed(0)} mi
                        </TableData>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
