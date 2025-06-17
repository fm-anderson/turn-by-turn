import { useState } from "react";
import Actions from "./components/Actions";
import Table from "./components/Table";
import Footer from "./components/Footer";
import { cleanAddress } from "./utils/helpers";
import type { TRouteData } from "./utils/types";

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState<TRouteData | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      const data: TRouteData = await response.json();

      const cleanedStops = data.stops.map((stop) => ({
        ...stop,
        address: cleanAddress(stop.address),
      }));

      const cleanedRouteData: TRouteData = {
        ...data,
        stops: cleanedStops,
      };

      setRouteData(cleanedRouteData);
      console.log("Route data received (cleaned):", cleanedRouteData);
    } catch (err) {
      console.error("Error fetching route:", err);
      if (err instanceof Error) {
        if (err.message.includes(`Unexpected token 'F', "Failed to "`)) {
          setError(
            "There was an issue processing the address. Please double-check the spelling or try adding the city and state (e.g., 'Chicago, IL')."
          );
        } else {
          setError(err.message);
        }
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
                  placeholder="e.g. Luke AFB"
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
          <>
            <Actions routeData={routeData} />
            <Table startDate={startDate} routeData={routeData} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
