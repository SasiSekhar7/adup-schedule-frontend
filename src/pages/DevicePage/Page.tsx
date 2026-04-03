"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, Activity, HardDrive, Wifi } from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/api";

// Dummy data based on actual models

// Network distribution

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DeviceDetailPage({
  device_id,
  device,
}: {
  device_id: any;
  device: any;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState("weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const fetchData = async (isCustom = false) => {
    try {
      if (isCustom) setApplyLoading(true);
      else setLoading(true);

      const dateRange = getDateRange();
      if (!dateRange) return;

      const res = await api.get(`/device/${device_id}/details`, {
        params: {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
        },
      });

      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      if (isCustom) setApplyLoading(false);
      else setLoading(false);
    }
  };
  useEffect(() => {
    if (!device_id) return;

    if (range === "custom") return; // ❌ prevent auto fetch

    fetchData(false);
  }, [device_id, range]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await api.get(`/device/${device_id}/details`);
  //       console.log(res);
  //       setData(res); // ✅ IMPORTANT
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (device_id) fetchData();
  // }, [device_id]);

  const [activeTab, setActiveTab] = useState("overview");

  const kpiMetrics = [
    {
      label: "Total Plays (24h)",
      value: data?.kpis.totalPlays,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Avg Completion",
      value: `${data?.kpis.avgCompletion}%`,
      icon: Activity,
      color: "text-green-600",
    },
    {
      label: "Avg CPU Usage",
      value: `${data?.kpis.avgCpu}%`,
      icon: Activity,
      color: "text-orange-600",
    },
    {
      label: "Storage Used",
      value: `${data?.kpis.storageUsed}%`,
      icon: HardDrive,
      color: "text-red-600",
    },
  ];

  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 5;

  const totalLogPages = Math.ceil(data?.logs?.length / logsPerPage);

  const paginatedLogs = data?.logs?.slice(
    (logPage - 1) * logsPerPage,
    logPage * logsPerPage,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data?.events?.length / rowsPerPage);

  const paginatedEvents = data?.events?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const [resolvedAddress, setResolvedAddress] = useState("Loading...");

  useEffect(() => {
    if (device?.location) {
      const [lat, lon] = device.location.split(",");

      if (lat && lon) {
        getAddressFromCoordinates(lat.trim(), lon.trim()).then((address) =>
          setResolvedAddress(address),
        );
      } else {
        setResolvedAddress("Invalid Location");
      }
    } else {
      setResolvedAddress("—");
    }
  }, [device]);

  async function getAddressFromCoordinates(lat: string, lon: string) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      const data = await res.json();
      return data.display_name || "Unknown Location";
    } catch {
      return "Unknown Location";
    }
  }

  const getDateRange = () => {
    const now = new Date();

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    if (range === "weekly") {
      return {
        start: new Date(now - 7 * 24 * 60 * 60 * 1000),
        end: now,
      };
    }

    if (range === "monthly") {
      return {
        start: new Date(now - 30 * 24 * 60 * 60 * 1000),
        end: now,
      };
    }

    if (range === "custom") {
      if (!customStart || !customEnd) return null;

      return {
        start: new Date(customStart),
        end: new Date(customEnd),
      };
    }

    return null;
  };

  const eventTypes = [
    "APP_CRASH",
    "CONTENT_DOWNLOAD_FAILED",
    "PLAYBACK_ERROR",
    "PLAYBACK_SKIPPED",
    "NETWORK_ERROR",
    "NETWORK_SLOW",
    "DIAGNOSTIC_WARNING",
    "DIAGNOSTIC_ERROR",
    "SETTINGS_CHANGED",
    "MEMORY_WARNING",
    "STORAGE_WARNING",
    "PERFORMANCE_ISSUE",
  ];

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No Data</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {data.device.device_name}
            </h1>
            <p className="text-slate-500 mt-1">
              {resolvedAddress === "Loading..." ? (
                <span className="text-gray-400 animate-pulse">
                  Fetching location...
                </span>
              ) : (
                resolvedAddress
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block" />
                {data.device.status}
              </Badge>

              <span className="text-sm text-slate-500">
                Last synced: {new Date(device.last_synced).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {[
                { label: "Group", value: device.DeviceGroup?.name },
                { label: "Type", value: data.device.device_type },
                { label: "Model", value: device.device_model },
                { label: "OS", value: device.device_os },
                { label: "OS Version", value: device.device_os_version },
                { label: "Orientation", value: device.device_orientation },
                { label: "Resolution", value: device.device_resolution },
              ].map((item, index) => (
                <div key={index} className="border rounded-lg p-3 bg-slate-50">
                  <p className="text-slate-500 text-xs">{item.label}</p>
                  <p className="font-medium text-slate-800">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end flex-wrap gap-3 items-center mb-4">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="today">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="custom">Custom</option>
          </select>

          {range === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border px-2 py-2 rounded-md"
              />

              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border px-2 py-2 rounded-md"
              />

              <button
                onClick={() => {
                  if (!customStart || !customEnd) {
                    alert("Please select both dates");
                    return;
                  }

                  fetchData(true);
                }}
                disabled={applyLoading}
                className={`px-4 py-2 rounded-md text-white transition ${
                  applyLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {applyLoading ? "Applying..." : "Apply"}
              </button>
            </>
          )}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpiMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card
                key={idx}
                className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 rounded-xl"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {metric.value}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-100">
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                  </div>

                  {/* <p className="text-xs text-green-600 font-medium">
                    {metric.trend} from yesterday
                  </p> */}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {["overview", "resources", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab
                  ? "bg-white shadow text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            {/* CHART */}
            <Card className="bg-white border border-slate-200 shadow-sm mb-8 rounded-xl">
              <CardHeader className="border-b">
                <CardTitle className="text-slate-800">
                  Performance Trend (60 Days)
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />

                    <Area
                      type="monotone"
                      dataKey="plays"
                      stroke="#3b82f6"
                      fill="#3b82f620"
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#10b981"
                      fill="#10b98120"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PIE */}
              <Card className="border shadow-sm rounded-xl">
                <CardHeader className="border-b">
                  <CardTitle>Network Distribution</CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        // data={networkDistributionData}
                        data={data.networkDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {data.networkDistribution.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* TABLE */}
              <Card className="lg:col-span-2 border shadow-sm rounded-xl">
                <CardHeader className="border-b">
                  <CardTitle>Recent Play Logs</CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ad</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Completion</TableHead>
                          <TableHead>Schedule</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginatedLogs.map((log: any) => {
                          const duration = log.duration_played_ms / 1000;
                          const completion = (duration / 30) * 100;

                          return (
                            <TableRow key={log.id}>
                              <TableCell>
                                <p className="font-medium">{log.ad_name}</p>
                                <p className="text-xs text-slate-500">
                                  {log.ad_id}
                                </p>
                              </TableCell>

                              <TableCell>{log.duration.toFixed(1)}s</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-slate-200 rounded-full">
                                    <div
                                      className="h-2 bg-green-500 rounded-full"
                                      style={{ width: `${log.completion}%` }}
                                    />
                                  </div>
                                  <span className="text-xs">
                                    {log.completion}%
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>{log.schedule}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">
                        Showing {(logPage - 1) * logsPerPage + 1} to{" "}
                        {Math.min(logPage * logsPerPage, data.logs.length)} of{" "}
                        {data.logs.length} entries
                      </span>

                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 border rounded"
                          disabled={logPage === 1}
                          onClick={() => setLogPage((p) => p - 1)}
                        >
                          Prev
                        </button>

                        {Array.from({ length: totalLogPages }, (_, i) => (
                          <button
                            key={i}
                            className={`px-3 py-1 border rounded ${
                              logPage === i + 1 ? "bg-blue-500 text-white" : ""
                            }`}
                            onClick={() => setLogPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button
                          className="px-3 py-1 border rounded"
                          disabled={logPage === totalLogPages}
                          onClick={() => setLogPage((p) => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* RESOURCES */}
        {activeTab === "resources" && (
          <>
            <Card className="mb-8 border shadow-sm rounded-xl">
              <CardHeader className="border-b">
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.telemetry}>
                    <CartesianGrid stroke="#e5e7eb" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="cpu_usage"
                      stroke="#3b82f6"
                    />
                    <Line
                      type="monotone"
                      dataKey="ram_free_mb"
                      stroke="#10b981"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: "CPU Usage", value: "72%" },
                { label: "RAM Usage", value: "48%" },
                { label: "Storage", value: "32%" },
              ].map((item, i) => (
                <Card key={i} className="border shadow-sm rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-3xl font-bold mt-2">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div> */}
          </>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          // <Card className="border shadow-sm rounded-xl">
          //   <CardHeader className="border-b">
          //     <CardTitle>Device Events</CardTitle>
          //   </CardHeader>

          //   <CardContent>
          //     <div className="overflow-x-auto">
          //       <Table>
          //         <TableHeader>
          //           <TableRow>
          //             <TableHead>Time</TableHead>
          //             <TableHead>Event</TableHead>
          //             <TableHead>Status</TableHead>
          //             <TableHead>Payload</TableHead>
          //           </TableRow>
          //         </TableHeader>

          //         <TableBody>
          //           {paginatedEvents.map((e: any) => (
          //             <TableRow key={e.id}>
          //               <TableCell>
          //                 {new Date(e.timestamp).toLocaleString()}
          //               </TableCell>
          //               <TableCell>{e.event_type}</TableCell>
          //               <TableCell>
          //                 <Badge className="bg-blue-100 text-blue-700">
          //                   info
          //                 </Badge>
          //               </TableCell>
          //               <TableCell className="text-xs text-slate-500">
          //                 {JSON.stringify(e.payload)}
          //               </TableCell>
          //             </TableRow>
          //           ))}
          //         </TableBody>
          //       </Table>
          //       <div className="flex justify-between items-center mt-4">
          //         <span className="text-sm text-gray-500">
          //           Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
          //           {Math.min(currentPage * rowsPerPage, data.events.length)} of{" "}
          //           {data.events.length} entries
          //         </span>

          //         <div className="flex gap-2">
          //           <button
          //             className="px-3 py-1 border rounded"
          //             disabled={currentPage === 1}
          //             onClick={() => setCurrentPage((p) => p - 1)}
          //           >
          //             Prev
          //           </button>

          //           {Array.from({ length: totalPages }, (_, i) => (
          //             <button
          //               key={i}
          //               className={`px-3 py-1 border rounded ${
          //                 currentPage === i + 1 ? "bg-blue-500 text-white" : ""
          //               }`}
          //               onClick={() => setCurrentPage(i + 1)}
          //             >
          //               {i + 1}
          //             </button>
          //           ))}

          //           <button
          //             className="px-3 py-1 border rounded"
          //             disabled={currentPage === totalPages}
          //             onClick={() => setCurrentPage((p) => p + 1)}
          //           >
          //             Next
          //           </button>
          //         </div>
          //       </div>
          //     </div>
          //   </CardContent>
          // </Card>
          <Card className="mb-8 border shadow-sm rounded-xl">
            <CardHeader className="border-b">
              <CardTitle>Device Events</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.chartdata}>
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis dataKey="time" />
                  <YAxis />

                  <Tooltip
                    wrapperStyle={{ zIndex: 9999 }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />

                  <Legend />

                  {eventTypes.map((type, i) => (
                    <Line
                      key={type}
                      dataKey={type}
                      type="monotone"
                      stroke={`hsl(${i * 30}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
