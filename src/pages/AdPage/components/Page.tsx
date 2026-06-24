// "use client";

// import {
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { PlayCircle, Target, Clock, Activity, Zap } from "lucide-react";

// import api from "@/api";
// import { useEffect, useState } from "react";

// const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

// export default function AdDetailPage({
//   id,
//   isVideo,
//   isImage,
//   url,
// }: {
//   id: any;
//   isVideo: boolean;
//   isImage: boolean;
//   url: string;
// }) {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const [range, setRange] = useState("weekly");
//   const [customStart, setCustomStart] = useState("");
//   const [customEnd, setCustomEnd] = useState("");
//   const [applyLoading, setApplyLoading] = useState(false);
//   const getDateRange = () => {
//     const now = new Date();

//     if (range === "today") {
//       const start = new Date();
//       start.setHours(0, 0, 0, 0);
//       return { start, end: now };
//     }

//     if (range === "weekly") {
//       return {
//         start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
//         end: now,
//       };
//     }

//     if (range === "monthly") {
//       return {
//         start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
//         end: now,
//       };
//     }

//     if (range === "custom") {
//       if (!customStart || !customEnd) return null;

//       return {
//         start: new Date(customStart),
//         end: new Date(customEnd),
//       };
//     }

//     return null;
//   };

//   const fetchData = async (isCustom = false) => {
//     try {
//       if (isCustom) setApplyLoading(true);
//       else setLoading(true);

//       const dateRange = getDateRange();
//       if (!dateRange) return;

//       const res = await api.get(`/ads/details/${id}`, {
//         params: {
//           start_date: dateRange.start.toISOString(),
//           end_date: dateRange.end.toISOString(),
//         },
//       });

//       setData(res);
//     } catch (err: any) {
//       console.error(err);
//     } finally {
//       if (isCustom) setApplyLoading(false);
//       else setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!id) return;

//     // ❌ Skip auto fetch for custom
//     if (range === "custom") return;

//     fetchData(false);
//   }, [id, range]);
//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       const res = await api.get(`/ads/details/${id}`);
//   //       console.log(res);
//   //       setData(res);
//   //     } catch (err:any) {
//   //       console.error(err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   if (id) fetchData();
//   // }, [id]);

//   const [openPreview, setOpenPreview] = useState(false);

//   const [page, setPage] = useState(1);
//   const perPage = 10;
//   const totalPages = Math.ceil(data?.logs?.length / perPage);

//   const paginatedLogs = data?.logs?.slice((page - 1) * perPage, page * perPage);

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }

//   if (!data) {
//     return <div className="p-6">No Data Found</div>;
//   }
//   return (
//     <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
//       {/* Header */}
//       <div className="border-b border-slate-200 bg-white flex flex-col md:flex-row items-center justify-between">
//         <div className="px-4 sm:px-6 py-6 sm:py-8">
//           <div className="flex items-center gap-4 mb-2">
//             <div
//               onClick={() => setOpenPreview(true)}
//               className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer hover:scale-105 transition"
//             >
//               <PlayCircle className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
//                 {data.ad.name}
//               </h1>
//               <p className="text-slate-600">{data.ad.id}</p>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-4 mt-4">
//             <div>
//               <p className="text-xs text-slate-500 uppercase tracking-wide">
//                 Status
//               </p>

//               <span
//                 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-1 ${
//                   data.ad.status === "pending"
//                     ? "bg-yellow-100 text-yellow-800 border-yellow-200"
//                     : data.ad.status === "processing"
//                       ? "bg-blue-100 text-blue-800 border-blue-200"
//                       : data.ad.status === "completed"
//                         ? "bg-green-100 text-green-800 border-green-200"
//                         : data.ad.status === "failed"
//                           ? "bg-red-100 text-red-800 border-red-200"
//                           : "bg-gray-100 text-gray-800 border-gray-200"
//                 }`}
//               >
//                 {data.ad.status}
//               </span>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 uppercase tracking-wide">
//                 Duration
//               </p>
//               <p className="font-semibold text-slate-900 mt-1">
//                 {data.ad.duration}s
//               </p>
//             </div>
//             {/* <div>
//               <p className="text-xs text-slate-500 uppercase tracking-wide">
//                 Campaign Period
//               </p>
//               <p className="font-semibold text-slate-900 mt-1 text-sm">
//                 Jun 15 - Aug 31, 2024
//               </p>
//             </div> */}
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-3 items-center mb-4">
//           <select
//             value={range}
//             onChange={(e) => setRange(e.target.value)}
//             className="border px-3 py-2 rounded-md"
//           >
//             <option value="today">Today</option>
//             <option value="weekly">Last 7 Days</option>
//             <option value="monthly">Last 30 Days</option>
//             <option value="custom">Custom</option>
//           </select>

//           {range === "custom" && (
//             <>
//               <input
//                 type="date"
//                 value={customStart}
//                 onChange={(e) => setCustomStart(e.target.value)}
//                 className="border px-2 py-2 rounded-md"
//               />

//               <input
//                 type="date"
//                 value={customEnd}
//                 onChange={(e) => setCustomEnd(e.target.value)}
//                 className="border px-2 py-2 rounded-md"
//               />

//               <button
//                 onClick={() => {
//                   if (!customStart || !customEnd) {
//                     alert("Please select both dates");
//                     return;
//                   }

//                   fetchData(true); // ✅ DIRECT CALL
//                 }}
//                 disabled={applyLoading}
//                 className={`px-4 py-2 rounded-md text-white transition ${
//                   applyLoading
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {applyLoading ? (
//                   <span className="flex items-center gap-2">
//                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                       <circle
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="white"
//                         strokeWidth="4"
//                         opacity="0.25"
//                       />
//                       <path
//                         d="M22 12a10 10 0 00-10-10"
//                         stroke="white"
//                         strokeWidth="4"
//                       />
//                     </svg>
//                     Applying...
//                   </span>
//                 ) : (
//                   "Apply"
//                 )}
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="p-6 space-y-6">
//         {/* KPI Cards for specific ad */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card className="border-slate-200 hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
//                 Total Plays
//               </CardTitle>
//               <PlayCircle className="w-4 h-4 text-blue-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-slate-900">
//                 {data.kpis.totalPlays.toLocaleString()}
//               </div>
//               {/* <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
//                 <TrendingUp className="w-3 h-3" /> +18% this week
//               </p> */}
//             </CardContent>
//           </Card>

//           <Card className="border-slate-200 hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
//                 Engagement Rate
//               </CardTitle>
//               <Target className="w-4 h-4 text-purple-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-slate-900">
//                 {data.kpis.engagementRate}%
//               </div>
//               {/* <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
//                 <TrendingUp className="w-3 h-3" /> +7% from start
//               </p> */}
//             </CardContent>
//           </Card>

//           <Card className="border-slate-200 hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
//                 Avg Watch Time
//               </CardTitle>
//               <Clock className="w-4 h-4 text-amber-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-slate-900">
//                 {data.kpis.avgWatchTime}s
//               </div>
//               {/* <p className="text-xs text-slate-500 mt-2">
//                 Out of {data.ad.duration}s duration
//               </p> */}
//             </CardContent>
//           </Card>

//           <Card className="border-slate-200 hover:shadow-lg transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
//                 Total Impressions
//               </CardTitle>
//               <Zap className="w-4 h-4 text-pink-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-slate-900">
//                 {data.kpis.impressions.toLocaleString()}
//               </div>
//               {/* <p className="text-xs text-slate-500 mt-2">
//                 {Math.round((12450 / 48200) * 100)}% play-through rate
//               </p> */}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//           {/* Area Chart - Performance Over Time */}
//           <Card className="lg:col-span-2 border-slate-200">
//             <CardHeader>
//               <CardTitle>Performance Trend</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <AreaChart data={data.performance}>
//                   <defs>
//                     <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//                     </linearGradient>
//                     <linearGradient
//                       id="colorImpressions"
//                       x1="0"
//                       y1="0"
//                       x2="0"
//                       y2="1"
//                     >
//                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
//                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                   <XAxis dataKey="date" stroke="#94a3b8" />
//                   <YAxis stroke="#94a3b8" />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "#1e293b",
//                       border: "1px solid #475569",
//                       borderRadius: "8px",
//                       color: "#f1f5f9",
//                     }}
//                   />
//                   <Legend wrapperStyle={{ color: "#475569" }} />
//                   <Area
//                     type="monotone"
//                     dataKey="plays"
//                     stroke="#3b82f6"
//                     fillOpacity={1}
//                     fill="url(#colorPlays)"
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="impressions"
//                     stroke="#8b5cf6"
//                     fillOpacity={1}
//                     fill="url(#colorImpressions)"
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Pie Chart - Device Distribution */}
//           <Card className="border-slate-200">
//             <CardHeader>
//               <CardTitle>Plays by Device</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="w-full overflow-x-auto">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       //   data={deviceData}
//                       data={data.deviceDistribution}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, value }) => `${name} ${value}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {COLORS.map((color, index) => (
//                         <Cell key={`cell-${index}`} fill={color} />
//                       ))}
//                     </Pie>
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "#1e293b",
//                         border: "1px solid #475569",
//                         borderRadius: "8px",
//                         color: "#f1f5f9",
//                       }}
//                       formatter={(value) => `${value} plays`}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="mt-4 space-y-2">
//                 {data.deviceDistribution.map((device: any) => (
//                   <div
//                     key={device.name}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <span className="text-slate-600">{device.name}</span>
//                     <span className="font-semibold text-slate-900">
//                       {device.plays.toLocaleString()} ({device.value}%)
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Hourly Performance Chart */}
//         <Card className="border-slate-200">
//           <CardHeader>
//             <CardTitle>Plays by Hour</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={data.hourlyData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis dataKey="hour" stroke="#94a3b8" />
//                 <YAxis stroke="#94a3b8" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1e293b",
//                     border: "1px solid #475569",
//                     borderRadius: "8px",
//                     color: "#f1f5f9",
//                   }}
//                 />
//                 <Bar dataKey="plays" fill="#3b82f6" radius={[8, 8, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Play Logs Table */}
//         <Card className="border-slate-200">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Activity className="w-5 h-5" />
//               Recent Play Logs
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="w-full overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-slate-200">
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Device
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Type
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Location
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Play Date
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Duration
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Engagement
//                     </th>
//                     <th className="text-left py-3 px-4 font-semibold text-slate-700">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedLogs.map((log: any) => (
//                     <tr
//                       key={log.id}
//                       className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
//                     >
//                       <td className="py-3 px-4">
//                         <div>
//                           <p className="font-medium text-slate-900">
//                             {log.device}
//                           </p>
//                           <p className="text-xs text-slate-500">{log.id}</p>
//                         </div>
//                       </td>

//                       <td className="py-3 px-4 text-slate-900">
//                         <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
//                           {log.deviceType}
//                         </span>
//                       </td>

//                       <td className="py-3 px-4 text-slate-900 text-xs">
//                         {log.location}
//                       </td>

//                       <td className="py-3 px-4 text-slate-900 text-xs">
//                         {new Date(log.playDate).toLocaleString("en-IN")}
//                       </td>

//                       <td className="py-3 px-4 text-slate-900 font-medium">
//                         {log.duration}s
//                       </td>

//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-2">
//                           <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
//                             <div
//                               className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
//                               style={{ width: `${log.engagement}%` }}
//                             />
//                           </div>
//                           <span className="text-xs font-semibold text-slate-900">
//                             {log.engagement}%
//                           </span>
//                         </div>
//                       </td>

//                       <td className="py-3 px-4">
//                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
//                           {log.status.charAt(0).toUpperCase() +
//                             log.status.slice(1)}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <div className="flex justify-between items-center mt-4">
//                 <span className="text-sm text-gray-500">
//                   Showing {(page - 1) * perPage + 1} to{" "}
//                   {Math.min(page * perPage, data.logs.length)} of{" "}
//                   {data.logs.length} entries
//                 </span>

//                 <div className="flex gap-2">
//                   <button
//                     className="px-3 py-1 border rounded"
//                     disabled={page === 1}
//                     onClick={() => setPage((p) => p - 1)}
//                   >
//                     Prev
//                   </button>

//                   {Array.from({ length: totalPages }, (_, i) => (
//                     <button
//                       key={i}
//                       className={`px-3 py-1 border rounded ${
//                         page === i + 1 ? "bg-blue-500 text-white" : ""
//                       }`}
//                       onClick={() => setPage(i + 1)}
//                     >
//                       {i + 1}
//                     </button>
//                   ))}

//                   <button
//                     className="px-3 py-1 border rounded"
//                     disabled={page === totalPages}
//                     onClick={() => setPage((p) => p + 1)}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {openPreview && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
//           {/* Modal Container */}
//           <div className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
//             {/* Close Button */}
//             <button
//               onClick={() => setOpenPreview(false)}
//               className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center text-lg z-10 transition"
//             >
//               ✕
//             </button>

//             {/* Content Wrapper */}
//             <div className="flex-1 flex items-center justify-center bg-black">
//               {/* ✅ VIDEO */}
//               {isVideo && (
//                 <video
//                   src={url}
//                   controls
//                   autoPlay
//                   className="max-h-[90vh] w-full object-contain"
//                 />
//               )}

//               {/* ✅ IMAGE */}
//               {isImage && (
//                 <img
//                   src={url || "/placeholder.svg"}
//                   alt="preview"
//                   className="max-h-[90vh] w-full object-contain"
//                 />
//               )}

//               {/* ✅ NO PREVIEW */}
//               {!isVideo && !isImage && (
//                 <div className="flex flex-col items-center justify-center text-white text-center p-6">
//                   <div className="text-4xl mb-3">📱</div>
//                   <div className="text-sm sm:text-base">
//                     Preview not available
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }

"use client";

import {
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
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Target, Clock, Activity, Zap } from "lucide-react";

import api from "@/api";
import { useEffect, useState } from "react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function AdDetailPage({
  id,
  isVideo,
  isImage,
  url,
}: {
  id: any;
  isVideo: boolean;
  isImage: boolean;
  url: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState("weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);

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

  const fetchData = async (isCustom = false) => {
    try {
      if (isCustom) setApplyLoading(true);
      else setLoading(true);

      const dateRange = getDateRange();
      if (!dateRange) return;

      const res = await api.get(`/ads/details/${id}`, {
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
    if (!id) return;

    // ❌ Skip auto fetch for custom
    if (range === "custom") return;

    fetchData(false);
  }, [id, range]);

  const [openPreview, setOpenPreview] = useState(false);

  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(data?.logs?.length / perPage) || 1;

  const paginatedLogs = data?.logs?.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data) {
    return <div className="p-6">No Data Found</div>;
  }
  
  return (
    <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pb-8">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-2">
            <div
              onClick={() => setOpenPreview(true)}
              className="w-12 h-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer hover:scale-105 transition shadow-sm"
            >
              <PlayCircle className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">
                {data.ad.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 truncate">{data.ad.id}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Status
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-1 whitespace-nowrap ${
                  data.ad.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : data.ad.status === "processing"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : data.ad.status === "completed"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : data.ad.status === "failed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {data.ad.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Duration
              </p>
              <p className="font-semibold text-slate-900 mt-1">
                {data.ad.duration}s
              </p>
            </div>
          </div>
        </div>
        
        {/* Date Controls (Responsive) */}
        <div className="px-4 sm:px-6 pb-6 xl:py-6 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full sm:w-auto border px-3 py-2 rounded-md bg-white shadow-sm"
          >
            <option value="today">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="custom">Custom</option>
          </select>

          {range === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full sm:w-auto border px-3 py-2 rounded-md shadow-sm"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full sm:w-auto border px-3 py-2 rounded-md shadow-sm"
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
                className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium transition shadow-sm flex items-center justify-center ${
                  applyLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {applyLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        opacity="0.25"
                      />
                      <path
                        d="M22 12a10 10 0 00-10-10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>
                    Applying...
                  </span>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Total Plays
              </CardTitle>
              <PlayCircle className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {data.kpis.totalPlays.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Engagement Rate
              </CardTitle>
              <Target className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {data.kpis.engagementRate}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Avg Watch Time
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {data.kpis.avgWatchTime}s
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                Total Impressions
              </CardTitle>
              <Zap className="w-4 h-4 text-pink-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {data.kpis.impressions.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Area Chart - Performance Over Time */}
          <Card className="xl:col-span-2 border-slate-200 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={8} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                      fontSize: "12px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey="plays"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPlays)"
                  />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Device Distribution */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Plays by Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.deviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${value}%`}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "12px"
                      }}
                      formatter={(value) => `${value} plays`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {data.deviceDistribution.map((device: any, idx: number) => (
                  <div
                    key={device.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-slate-600">{device.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {device.plays.toLocaleString()} ({device.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Performance Chart */}
        <Card className="border-slate-200 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Plays by Hour</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickMargin={8} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="plays" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Play Logs Table & Cards */}
        <Card className="border-slate-200 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-5 h-5" />
              Recent Play Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            
            {/* DESKTOP VIEW: Data Table (Hidden on small screens) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 min-w-[150px]">Device</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 min-w-[120px]">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 min-w-[160px]">Play Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 min-w-[140px]">Engagement</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log: any) => (
                    <tr
                      key={log?.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {log?.device}
                          </p>
                          <p className="text-xs text-slate-500">{log.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-900">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                          {log?.deviceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 text-xs">
                        {/* {log.location} */}
                        {log?.address}
                      </td>
                      <td className="py-3 px-4 text-slate-900 text-xs">
                        {new Date(log?.playDate).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {log?.duration}s
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${log?.engagement}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-900">
                            {log?.engagement}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          {log?.status.charAt(0).toUpperCase() +
                            log?.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Small Card Layout (Hidden on medium/large screens) */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {paginatedLogs.map((log: any) => (
                <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  
                  {/* Top Row: Device Name & Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{log.device}</p>
                      <p className="text-xs text-slate-500 truncate">{log.id}</p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </div>

                  {/* Device Type & Duration Badge */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {log.deviceType}
                    </span>
                    <span className="text-slate-700 font-medium text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                      {log.duration}s play
                    </span>
                  </div>

                  {/* Location & Play Date */}
                  <div className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Location:</span>
                      <span className="text-right ml-2 truncate">{log.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-500">Date:</span>
                      <span className="text-right ml-2">{new Date(log.playDate).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Engagement Bar */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-medium text-slate-500">Engagement</span>
                      <span className="font-bold text-slate-900">{log.engagement}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${log.engagement}%` }}
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
            
            {/* Shared Mobile-friendly Pagination (Applies to both views) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 p-4 sm:p-6 sm:pt-4 border-t border-slate-100">
              <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, data.logs.length)} of{" "}
                {data.logs.length} entries
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  className="px-3 py-1.5 border border-slate-200 rounded text-sm bg-white disabled:opacity-50 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>

                {/* Logic to cap rendered buttons so mobile doesn't overflow */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && page > 3) {
                     pageNum = page - 2 + i;
                     if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1.5 border rounded text-sm font-medium transition-colors ${
                        page === pageNum ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="px-3 py-1.5 border border-slate-200 rounded text-sm bg-white disabled:opacity-50 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {openPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={() => setOpenPreview(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg z-10 transition backdrop-blur-md"
            >
              ✕
            </button>

            <div className="flex-1 flex items-center justify-center bg-black">
              {isVideo && (
                <video
                  src={url}
                  controls
                  autoPlay
                  className="max-h-[90vh] w-full object-contain"
                />
              )}
              {isImage && (
                <img
                  src={url || "/placeholder.svg"}
                  alt="preview"
                  className="max-h-[90vh] w-full object-contain"
                />
              )}
              {!isVideo && !isImage && (
                <div className="flex flex-col items-center justify-center text-white text-center p-6">
                  <div className="text-4xl sm:text-5xl mb-3">📱</div>
                  <div className="text-sm sm:text-base text-gray-400">
                    Preview not available
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}