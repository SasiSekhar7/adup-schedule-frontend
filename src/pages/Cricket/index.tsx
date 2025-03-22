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
                const response = await api.get('/device/cricket/selected-series');
                const data = response.data;

                setSelectedSeries({
                    series_id: data.series_id,
                    name: data.name,
                });

                setMatches({
                    upcoming: data.match_list.filter(m => m.status === "upcoming").slice(0, 10),
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
                const response = await api.get('/device/cricket/fetch-series-list');
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
            await api.post('/device/cricket/update-series', { series_id });
            window.location.reload(); // Refresh page to fetch new matches
        } catch (error) {
            console.error("Error updating series:", error);
        }
    };

    return (
        <div className="p-4">
            {/* Current Selected Series */}
            {selectedSeries ? (
                <div className="mb-6">
                    <h2 className="text-xl font-bold">Selected Series:</h2>
                    <p>ID: {selectedSeries.series_id}</p>
                    <p>Name: {selectedSeries.name}</p>
                </div>
            ) : (
                <p>Loading selected series...</p>
            )}

            {/* Dropdown to Change Series */}
            <div className="mb-4">
                <label className="block mb-2 text-lg font-semibold">Change Series:</label>
                <select
                    className="border p-2 rounded w-full"
                    onChange={(e) => handleSeriesChange(e.target.value)}
                >
                    <option value="">-- Select Series --</option>
                    {seriesList.map(series => (
                        <option key={series.series_id} value={series.series_id}>
                            {series.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Matches Section */}
            <div className="grid grid-cols-2 gap-4">
                {/* Upcoming Matches */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Upcoming Matches</h2>
                    {matches.upcoming.length > 0 ? (
                        matches.upcoming.map(match => (
                            <div key={match.id} className="border p-2 rounded mb-2">
                                {match.name} - {new Date(match.dateTimeGMT).toLocaleString()}
                            </div>
                        ))
                    ) : (
                        <p>No upcoming matches</p>
                    )}
                </div>

                {/* Live Match */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Live Match</h2>
                    {matches.live ? (
                        <div className="border p-4 rounded bg-red-100">
                            <p className="text-red-600 font-bold">{matches.live.name}</p>
                            <p>Score: {matches.live.score}</p>
                            <p>Status: Live</p>
                        </div>
                    ) : (
                        <p>No live match</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CricketPage;
