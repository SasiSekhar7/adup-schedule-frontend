import { useEffect, useState } from "react";
import api from "@/api";

function CricketPage() {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [matches, setMatches] = useState({ upcoming: [], live: null });

  // Fetch current selected series
  useEffect(() => {
    const fetchSelectedSeries = async () => {
      try {
        const response = await api.get("/device/cricket/selected-series");
        const data = response.data;

        setSelectedSeries({
          series_id: data.series_id,
          name: data.name,
        });

        setMatches({
          upcoming: data.match_list
            .filter((m) => m.status === "upcoming")
            .slice(0, 10),
          live: data.live_match || null,
        });
      } catch (error) {
        console.error("Error fetching selected series:", error);
      }
    };

    fetchSelectedSeries();
  }, []);

  // Fetch all series for dropdown
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get("/device/cricket/fetch-series-list");
        setSeriesList(response.data);
      } catch (error) {
        console.error("Error fetching series:", error);
      }
    };
    fetchSeries();
  }, []);

  // Change selected series
  const handleSeriesChange = async (series_id) => {
    try {
      await api.post("/device/cricket/update-series", { series_id });
      window.location.reload(); // Refresh page to fetch new matches
    } catch (error) {
      console.error("Error updating series:", error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-semibold">Cricket Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage cricket series and matches
        </p>
      </div>

      {/* Current Selected Series */}
      {selectedSeries ? (
        <div className="mb-4 md:mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Selected Series:</h2>
          <p className="text-sm">
            <span className="font-medium">ID:</span> {selectedSeries.series_id}
          </p>
          <p className="text-sm">
            <span className="font-medium">Name:</span> {selectedSeries.name}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-4">
          Loading selected series...
        </p>
      )}

      {/* Dropdown to Change Series */}
      <div className="mb-4 md:mb-6">
        <label className="block mb-2 text-base font-semibold">
          Change Series:
        </label>
        <select
          className="border p-2 rounded w-full max-w-md"
          onChange={(e) => handleSeriesChange(e.target.value)}
        >
          <option value="">-- Select Series --</option>
          {seriesList.map((series) => (
            <option key={series.series_id} value={series.series_id}>
              {series.name}
            </option>
          ))}
        </select>
      </div>

      {/* Matches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming Matches */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Upcoming Matches</h2>
          <div className="space-y-2">
            {matches.upcoming.length > 0 ? (
              matches.upcoming.map((match) => (
                <div
                  key={match.id}
                  className="border p-3 rounded-lg bg-white shadow-sm"
                >
                  <p className="font-medium text-sm">{match.name}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(match.dateTimeGMT).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No upcoming matches</p>
            )}
          </div>
        </div>

        {/* Live Match */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Live Match</h2>
          {matches.live ? (
            <div className="border p-4 rounded-lg bg-red-50 border-red-200">
              <p className="text-red-600 font-bold text-sm">
                {matches.live.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Score:</span> {matches.live.score}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span> Live
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No live match</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CricketPage;
