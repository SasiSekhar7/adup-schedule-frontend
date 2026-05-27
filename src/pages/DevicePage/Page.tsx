"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Activity,
  HardDrive,
  Clock,
  MapPin,
  MemoryStick,
  MonitorPlay,
} from "lucide-react";

import {
  AreaChart,
  Area,
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DeviceDetailPage({
  device_id,
  device,
  schedules,
  schedulesPage,
  schedulesLimit,
  schedulesTotal,
  schedulesTotalPages,
  setSchedulesPage,
  setSchedulesLimit,
}: any) {
  console.log("these is device details:-", device);
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
    } catch (err: any) {
      console.error(err);
    } finally {
      if (isCustom) setApplyLoading(false);
      else setLoading(false);
    }
  };
  useEffect(() => {
    if (!device_id) return;

    if (range === "custom") return; //  prevent auto fetch

    fetchData(false);
  }, [device_id, range]);

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
      value: `${(
        ((device?.total_storage_mb || 0) - (data?.kpis.storageUsed || 0)) /
        1024
      ).toFixed(2)} GB`,
      icon: HardDrive,
      color: "text-red-600",
    },
  ];

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
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
      };
    }

    if (range === "monthly") {
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
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
  const metaFields = [
    { label: "Group", value: device?.DeviceGroup?.name },
    { label: "Type", value: device.device_type },
    { label: "Model", value: device?.device_model },
    { label: "OS", value: device?.device_os },
    { label: "OS Version", value: device?.device_os_version },
    { label: "Orientation", value: device?.device_orientation },
    { label: "Resolution", value: device?.device_resolution },
    {
      label: "Total RAM",
      value: device.total_ram_mb ? `${device.total_ram_mb} MB` : "N/A",
    },

    {
      label: "Video Streams",
      value: device.max_supported_video_streams || "N/A",
    },
  ];

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No Data</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6">
      <div className="">
        <div className="flex flex-col gap-6 py-2">
          {/* Top row: identity + actions */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Left: name, location, status */}
            <div className="flex-1 min-w-[220px]">
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 leading-tight mb-1.5">
                {device.device_name}
              </h1>

              <div className="flex items-center gap-1.5 text-slate-400 text-[13px]">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                {resolvedAddress === "Loading..." ? (
                  <span className="animate-pulse">Fetching location...</span>
                ) : (
                  <span>{resolvedAddress}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                <Badge className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1 shadow-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {device.status}
                </Badge>

                <span className="flex items-center gap-1 text-[12px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  Last synced: {new Date(device.last_synced).toLocaleString()}
                </span>
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
          </div>

          {/* Divider */}
          <div className="border-t border-slate-300" />

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2.5 mb-4">
            {metaFields.map((item) => (
              <div
                key={item.label}
                className="bg-white border border-slate-100 rounded-xl px-3.5 py-3"
              >
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                  {item.label}
                </p>
                <p className="text-[14px] font-medium text-slate-800 truncate">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* TABS */}
        <div className="mb-6 flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {["overview", "resources", "events", "schedules"].map((tab) => (
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
                  Performance Trend
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
                        {data.networkDistribution.map((index: any) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
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
          </>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
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

        {activeTab === "schedules" && (
          <Card className="border shadow-sm rounded-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Device Schedules</CardTitle>

              <div className="flex items-center gap-2">
                <select
                  value={schedulesLimit}
                  onChange={(e) => {
                    setSchedulesLimit(Number(e.target.value));
                    setSchedulesPage(1);
                  }}
                  className="border px-2 py-1 rounded"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-500">per page</span>
              </div>
            </CardHeader>

            <CardContent>
              {schedules?.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Schedule ID</TableHead>
                          <TableHead>Ad Name</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {schedules.map((schedule: any) => (
                          <TableRow key={schedule.schedule_id}>
                            <TableCell>{schedule.schedule_id}</TableCell>
                            <TableCell>{schedule.Ad?.name}</TableCell>
                            <TableCell>
                              {new Date(schedule.start_time).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(schedule.end_time).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                (new Date(schedule.end_time).getTime() -
                                  new Date(schedule.start_time).getTime()) /
                                  (1000 * 60),
                              )}{" "}
                              min
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                    <span className="text-sm text-gray-500">
                      Showing {(schedulesPage - 1) * schedulesLimit + 1} to{" "}
                      {Math.min(schedulesPage * schedulesLimit, schedulesTotal)}{" "}
                      of {schedulesTotal} entries
                    </span>

                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 border rounded"
                        disabled={schedulesPage === 1}
                        onClick={() => setSchedulesPage((p: number) => p - 1)}
                      >
                        Prev
                      </button>

                      <span className="px-3 py-1">
                        Page {schedulesPage} of {schedulesTotalPages}
                      </span>

                      <button
                        className="px-3 py-1 border rounded"
                        disabled={schedulesPage === schedulesTotalPages}
                        onClick={() => setSchedulesPage((p: number) => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No schedules found
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
