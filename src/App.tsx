import { useState } from "react";

function App() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeData, setRouteData] = useState(null);
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

    const functionUrl = "CLOUD_FUNCTION_URL";

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

      const data = await response.json();
      setRouteData(data);
    } catch (err) {
      console.error("Error fetching route:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      console.log(routeData);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-96">
        <form onSubmit={handleGenerateRoute} className="flex flex-col gap-3">
          <span className="flex gap-3">
            <input
              className="input"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter Origin"
              disabled={isLoading}
            />
            <input
              className="input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter Destination"
              disabled={isLoading}
            />
          </span>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            Generate Route
          </button>
        </form>

        {error && (
          <div role="alert" className="alert alert-error alert-soft mt-3">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
