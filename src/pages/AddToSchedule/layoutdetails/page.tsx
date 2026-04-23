// "use client";

// import { useEffect, useState } from "react";
// import api from "@/api";
// import { Volume2, VolumeX } from "lucide-react";
// import { useParams } from "react-router-dom";

// export default function LayoutViewer() {
//   const { layout_id } = useParams();
//   const [layout, setLayout] = useState<any>(null);
//   const [groups, setGroups] = useState<any[]>([]);
//   const [groupContents, setGroupContents] = useState<any[]>([]);
//   const [selectedGroup, setSelectedGroup] = useState<any>(null);

//   useEffect(() => {
//     const fetchSchedule = async () => {
//       try {
//         const res = await api.get(`/layout/shedule/get/${layout_id}`);

//         console.log("schedule data:", res.data);

//         const layoutData =
//           res.data?.data?.layout || res.data?.layout || res.data?.data;

//         const groupsData = res.data?.data?.groups || res.data?.groups || [];
//         const groupContentsData =
//           res.data?.data?.group_wise_data || res.data?.group_wise_data || [];

//         setLayout(layoutData);
//         setGroups(groupsData);
//         setGroupContents(groupContentsData);

//         // FIXED DEFAULT SELECTION
//         if (groupsData.length > 0) {
//           const firstGroupId = groupsData[0].group_id;

//           const groupData = groupContentsData.find(
//             (g: any) => g.group_id === firstGroupId,
//           );

//           setSelectedGroup(groupData);
//         }
//       } catch (error) {
//         console.error("Error fetching schedule:", error);
//       }
//     };

//     fetchSchedule();
//   }, []);

//   if (!layout) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Loading layout...
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen max-w-[350px] md:max-w-full">
//       {/* ================== LAYOUT PREVIEW ================== */}
//       <div className="bg-white border rounded-lg p-6">
//         <h2 className="text-lg font-semibold mb-4">Layout Preview</h2>

//         <div className="bg-gray-200 p-10 flex justify-center">
//           <div
//             className="relative bg-gray-900 rounded-lg overflow-hidden"
//             style={{
//               width: layout.orientation === "landscape" ? 500 : 280,
//               height: layout.orientation === "landscape" ? 280 : 500,
//             }}
//           >
//             {layout.zones?.map((zone: any) => (
//               <div
//                 key={zone.zone_id}
//                 className="absolute flex flex-col items-center justify-center text-white text-center px-2"
//                 style={{
//                   left: `${zone.x}%`,
//                   top: `${zone.y}%`,
//                   width: `${zone.width}%`,
//                   height: `${zone.height}%`,
//                   backgroundColor: zone.color || "#333",
//                 }}
//               >
//                 <span className="font-medium text-sm">{zone.name}</span>
//                 <span className="text-xs opacity-80">
//                   {zone.content_type_allowed === "media"
//                     ? "Media Zone"
//                     : "Widget Zone"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ================== GROUP DROPDOWN ================== */}
//       <div className="mt-6 flex flex-col w-1/2">
//         <label className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">
//           Group
//         </label>
//         <select
//           className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
//           value={selectedGroup?.group_id || ""}
//           onChange={(e) => {
//             const selectedId = e.target.value;
//             const groupData = groupContents.find(
//               (g: any) => g.group_id === selectedId,
//             );
//             setSelectedGroup(groupData);
//           }}
//         >
//           {groups.map((group: any) => (
//             <option key={group.group_id} value={group.group_id}>
//               {group.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* ================== SCHEDULE BAR ================== */}
//       {(() => {
//         const schedule = selectedGroup?.schedules?.[0];

//         return (
//           <div className="mt-5 space-y-4">
//             {/* Date + Slot Strip */}
//             <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm">
//               <svg
//                 className="w-3.5 h-3.5 text-gray-400 shrink-0"
//                 viewBox="0 0 16 16"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//               >
//                 <rect x="2" y="3" width="12" height="11" rx="1.5" />
//                 <path d="M5 1.5v3M11 1.5v3M2 7h12" />
//               </svg>
//               <span className="font-medium text-gray-700">
//                 {schedule?.start_time
//                   ? new Date(schedule.start_time).toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                   : "--"}
//               </span>

//               <span className="text-gray-300">→</span>

//               <span className="font-medium text-gray-700">
//                 {schedule?.end_time
//                   ? new Date(schedule.end_time).toLocaleDateString("en-IN", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                   : "--"}
//               </span>

//               <span className="flex-1" />

//               {schedule?.time_slots?.[0] && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium">
//                   <svg
//                     className="w-3 h-3"
//                     viewBox="0 0 16 16"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                   >
//                     <circle cx="8" cy="8" r="6" />
//                     <path d="M8 5v3.5l2.5 1.5" />
//                   </svg>
//                   {schedule.time_slots[0].start} – {schedule.time_slots[0].end}
//                 </span>
//               )}
//             </div>

//             {/* ================== ZONES GRID ================== */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {layout.zones.map((zone: any) => {
//                 const zoneData = schedule?.zones?.find(
//                   (z: any) => z.zone_id === zone.zone_id,
//                 );
//                 const isMuted =
//                   schedule?.zone_mute_settings?.[zone.zone_id] ?? false;

//                 return (
//                   <div
//                     key={zone.zone_id}
//                     className="bg-white border border-gray-100 rounded-xl overflow-hidden"
//                   >
//                     {/* Card Header */}
//                     <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
//                       <h3 className="text-sm font-medium text-gray-800">
//                         {zone.name}
//                       </h3>
//                       {isMuted ? (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs border border-gray-200">
//                           <VolumeX size={11} />
//                           muted
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs border border-green-100">
//                           <Volume2 size={11} />
//                           active
//                         </span>
//                       )}
//                     </div>

//                     {/* Card Body */}
//                     <div className="px-3.5 py-3 space-y-2">
//                       {zoneData?.content_items?.length > 0 ? (
//                         zoneData.content_items.map((item: any, idx: number) => (
//                           <div
//                             key={idx}
//                             className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg"
//                           >
//                             <div className="flex items-center justify-between mb-1">
//                               <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
//                                 {item.content_type}
//                               </span>
//                               <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
//                                 {item.display_order}
//                               </span>
//                             </div>
//                             {/* <p className="text-sm font-semibold text-gray-900">
//                               {item?.content_data.name}
//                             </p> */}
//                             <p className="text-sm font-semibold text-gray-900">
//                               {item?.content_data?.name ||
//                                 item?.content_data?.type ||
//                                 "Unknown"}
//                             </p>
//                             <div className="flex flex-col gap-1 mt-1.5 text-xs text-blue-500">
//                               {/* Date Time */}
//                               <div className="flex items-center gap-1">
//                                 <svg
//                                   className="w-3 h-3 shrink-0"
//                                   viewBox="0 0 16 16"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   strokeWidth="1.5"
//                                 >
//                                   <circle cx="8" cy="8" r="6" />
//                                   <path d="M8 5v3.5l2 1.2" />
//                                 </svg>

//                                 {new Date(item.start_time).toLocaleString(
//                                   "en-IN",
//                                   {
//                                     day: "2-digit",
//                                     month: "short",
//                                     year: "numeric",
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   },
//                                 )}
//                                 {" – "}
//                                 {new Date(item.end_time).toLocaleString(
//                                   "en-IN",
//                                   {
//                                     day: "2-digit",
//                                     month: "short",
//                                     year: "numeric",
//                                     hour: "2-digit",
//                                     minute: "2-digit",
//                                   },
//                                 )}
//                               </div>

//                               {/* Time Slots */}
//                               {item.time_slots?.length > 0 && (
//                                 <div className="text-[11px] text-gray-500 ml-4">
//                                   Slots:{" "}
//                                   {item.time_slots.map(
//                                     (slot: any, i: number) => (
//                                       <span key={i}>
//                                         {slot.start} - {slot.end}
//                                         {i < item.time_slots.length - 1 && ", "}
//                                       </span>
//                                     ),
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-xs text-center text-gray-300 py-4">
//                           No content assigned
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import api from "@/api";
import {
  Volume2,
  VolumeX,
  Monitor,
  PlayCircle,
  Layers,
  Type,
  Radio,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";

// ================== HLS LIVE STREAM COMPONENT ==================
const HlsPlayer = ({ url, muted }: { url: string; muted: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.error("Autoplay blocked", e));
      });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      className="w-full h-full object-fill bg-black"
    />
  );
};

// ================== TIZEN-STYLE WIDGET RENDERER ==================
const WidgetRenderer = ({ item, zoneWidth }: any) => {
  const [time, setTime] = useState(new Date());
  const config = item.widget_config || {};
  const widgetType = item.content_data?.type;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // SCALING LOGIC: Makes huge TV fonts small for web preview
  const getScaledFont = (sizeStr: string) => {
    const num = parseInt(sizeStr || "24");
    return Math.max(num * 0.4, 12) + "px";
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: config.background || "#000",
    color: config.color || "#fff",
    fontFamily: "sans-serif",
    overflow: "hidden",
    position: "relative",
  };

  if (widgetType === "clock_digital") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            fontSize: getScaledFont(config.fontSize),
            fontWeight: "bold",
          }}
        >
          {time.toLocaleTimeString("en-US", {
            timeZone: config.timezone || "Asia/Kolkata",
            hour12: config.format === "12h",
          })}
        </div>
      </div>
    );
  }

  if (widgetType === "calendar") {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          {time.toLocaleDateString("en-US", { month: "short" })}
        </div>
        <div style={{ fontSize: "28px", fontWeight: "bold" }}>
          {time.getDate()}
        </div>
      </div>
    );
  }

  if (widgetType === "sliding_text" || widgetType === "ticker") {
    const speed = config.speed || 50;
    const direction = config.direction === "right" ? "reverse" : "normal";
    return (
      <div style={{ ...containerStyle, alignItems: "flex-start" }}>
        <style>{`
          @keyframes marquee_loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-track { display: flex; width: max-content; animation: marquee_loop ${(200 / speed) * 10}s linear infinite ${direction}; }
        `}</style>
        <div className="ticker-track">
          <div
            style={{
              whiteSpace: "nowrap",
              paddingRight: "100px",
              fontSize: getScaledFont(config.fontSize),
              fontWeight: "bold",
            }}
          >
            {config.text}
          </div>
          <div
            style={{
              whiteSpace: "nowrap",
              paddingRight: "100px",
              fontSize: getScaledFont(config.fontSize),
              fontWeight: "bold",
            }}
          >
            {config.text}
          </div>
        </div>
      </div>
    );
  }

  if (widgetType === "logo") {
    return (
      <div style={containerStyle}>
        <img
          src={config.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: config.fit || "contain",
          }}
        />
      </div>
    );
  }

  if (widgetType === "countdown_timer") {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(interval);
    }, []);

    const start = new Date(config.startTime);
    const end = new Date(config.endTime);

    const isBeforeStart = now < start;
    const isAfterEnd = now > end;

    let diff = 0;

    if (!isBeforeStart && !isAfterEnd) {
      diff = Math.max(end.getTime() - now.getTime(), 0);
    }

    // format helper
    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);

      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      switch (config.format) {
        case "dd:hh:mm:ss":
          return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        case "mm:ss":
          return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        default:
          return `${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    };

    return (
      <div style={containerStyle}>
        {/* TEXT */}
        <div
          style={{
            fontSize: getScaledFont(config.fontSize),
            fontWeight: "bold",
          }}
        >
          {isBeforeStart
            ? "Starting Soon"
            : isAfterEnd
              ? config.endedText || "Ended"
              : formatTime(diff)}
        </div>

        {/* RUNNING TEXT */}
        {!isBeforeStart && !isAfterEnd && config.runningText && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              opacity: 0.8,
            }}
          >
            {config.runningText}
          </div>
        )}
      </div>
    );
  }
  if (widgetType === "clock_analog") {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;

    return (
      <div style={containerStyle}>
        <div
          style={{
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            border: "4px solid white",
            position: "relative",
          }}
        >
          {/* Hour */}
          <div
            style={{
              position: "absolute",
              width: "4px",
              height: "25%",
              background: "white",
              top: "25%",
              left: "50%",
              transform: `translateX(-50%) rotate(${hourDeg}deg)`,
              transformOrigin: "bottom",
            }}
          />

          {/* Minute */}
          <div
            style={{
              position: "absolute",
              width: "3px",
              height: "35%",
              background: "white",
              top: "15%",
              left: "50%",
              transform: `translateX(-50%) rotate(${minDeg}deg)`,
              transformOrigin: "bottom",
            }}
          />

          {/* Second */}
          <div
            style={{
              position: "absolute",
              width: "2px",
              height: "40%",
              background: "red",
              top: "10%",
              left: "50%",
              transform: `translateX(-50%) rotate(${secDeg}deg)`,
              transformOrigin: "bottom",
            }}
          />
        </div>
      </div>
    );
  }

  if (widgetType === "emoji") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            fontSize: (config.size || 48) * 0.8,
          }}
        >
          {config.emoji || "🙂"}
        </div>
      </div>
    );
  }

  return <div style={containerStyle}>{widgetType}</div>;
};

// ================== ZONE PLAYER (Handles Rotation & Carousels) ==================
const ZonePlayer = ({ zone, scheduleData, zoneWidth, zoneHeight }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);

  const items = useMemo(
    () => scheduleData?.content_items || [],
    [scheduleData],
  );
  const activeItem = items[currentIndex];

  const nextItem = () => {
    setSubIndex(0);
    if (items.length > 1) setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  useEffect(() => {
    if (!activeItem) return;

    // 1. CAROUSEL LOGIC
    if (activeItem.content_type === "carousel") {
      const subItems = activeItem.content_data?.items || [];
      const currentSub = subItems[subIndex]?.Ad;
      const timer = setTimeout(
        () => {
          if (subIndex < subItems.length - 1) setSubIndex((s) => s + 1);
          else nextItem();
        },
        (currentSub?.duration || 10) * 1000,
      );
      return () => clearTimeout(timer);
    }

    // 2. STATIC CONTENT LOGIC (Images / Widgets)
    const isVideo = activeItem.content_data?.url
      ?.toLowerCase()
      .endsWith(".mp4");
    if (activeItem.content_type !== "live_content" && !isVideo) {
      const timer = setTimeout(
        nextItem,
        (activeItem.content_data?.duration || 10) * 1000,
      );
      return () => clearTimeout(timer);
    }
  }, [currentIndex, subIndex, items, activeItem]);

  if (!activeItem) return <div className="w-full h-full bg-[#0a0a0a]" />;

  if (activeItem.content_type === "widget")
    return <WidgetRenderer item={activeItem} zoneWidth={zoneWidth} />;

  if (activeItem.content_type === "live_content")
    return (
      <HlsPlayer url={activeItem.content_data.url} muted={zone.is_muted} />
    );

  // Render Carousel or Single Ad
  const mediaUrl =
    activeItem.content_type === "carousel"
      ? activeItem.content_data.items[subIndex]?.Ad?.url
      : activeItem.content_data?.url;

  const isVideo = mediaUrl?.toLowerCase().includes(".mp4");

  return (
    <div className="w-full h-full bg-black">
      {isVideo ? (
        <video
          key={mediaUrl}
          src={mediaUrl}
          autoPlay
          muted={zone.is_muted}
          onEnded={() => {
            if (
              activeItem.content_type === "carousel" &&
              subIndex < activeItem.content_data.items.length - 1
            )
              setSubIndex((s) => s + 1);
            else nextItem();
          }}
          className="w-full h-full object-fill"
        />
      ) : (
        <img
          key={mediaUrl}
          src={mediaUrl}
          className="w-full h-full object-fill"
        />
      )}
    </div>
  );
};

// ================== MAIN VIEW ==================
export default function LayoutViewer() {
  const { layout_id } = useParams();
  const [layout, setLayout] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupWiseData, setGroupWiseData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get(`/layout/shedule/get/${layout_id}`);
        const apiData = res.data;
        setLayout(apiData.layout);
        setGroupWiseData(apiData.group_wise_data || []);
        if (apiData.group_wise_data?.length > 0)
          setSelectedGroup(apiData.group_wise_data[0]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSchedule();
  }, [layout_id]);

  if (!layout)
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Booting Signage Engine...
      </div>
    );

  const schedule = selectedGroup?.schedules?.[0];
  const previewW = layout.orientation === "landscape" ? 720 : 405;
  const previewH = layout.orientation === "landscape" ? 405 : 720;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* PREVIEW CARD */}
        <div className="bg-white border border-slate-200  p-8 hover:shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Monitor className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{layout.name}</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {layout.resolution} • {layout.orientation}
                </p>
              </div>
            </div>
            <select
              className="bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              value={selectedGroup?.group_id}
              onChange={(e) =>
                setSelectedGroup(
                  groupWiseData.find((g) => g.group_id === e.target.value),
                )
              }
            >
              {groupWiseData.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  Group: {g.group_id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center bg-slate-50 py-12 rounded-2xl border-2 border-dashed border-slate-200">
            <div
              className="rounded-sm overflow-hidden bg-black shadow-2xl border-[8px] border-slate-900 relative"
              style={{
                width: previewW,
                height: previewH,
                backgroundColor: layout.background_color,
              }}
            >
              {layout.zones?.map((zone: any) => (
                <div
                  key={zone.zone_id}
                  className="absolute overflow-hidden"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                    zIndex: zone.z_index,
                    borderRadius: `${zone.border_radius}px`,
                  }}
                >
                  <ZonePlayer
                    zone={zone}
                    zoneWidth={(zone.width / 100) * previewW}
                    zoneHeight={(zone.height / 100) * previewH}
                    scheduleData={schedule?.zones?.find(
                      (z: any) => z.zone_id === zone.zone_id,
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETAILS BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layout.zones.map((zone: any) => {
            const zoneData = schedule?.zones?.find(
              (z: any) => z.zone_id === zone.zone_id,
            );
            return (
              <div
                key={zone.zone_id}
                className="bg-white border border-slate-200  overflow-hidden hover:shadow-sm"
              >
                <div className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
                  <span className="font-bold text-slate-700">{zone.name}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-gray-200 text-gray-700 rounded uppercase">
                    {zone.content_type_allowed}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  {zoneData?.content_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
                    >
                      <div className="flex justify-between">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-black text-gray-500 uppercase bg-gray-200 `}
                        >
                          {item.content_type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          ORD: {item.display_order}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.content_data?.name || item.content_data?.type}
                      </p>

                      {/* Widget Details */}
                      {item.content_type === "widget" && item.widget_config && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                          <p className="text-slate-500 italic">
                            "{item.widget_config.text}"
                          </p>
                          <div className="flex gap-3 text-[9px] font-black text-gray-400 uppercase">
                            <span>Size: {item.widget_config.fontSize}</span>
                            <span>Speed: {item.widget_config.speed}</span>
                          </div>
                        </div>
                      )}

                      {/* Carousel Details */}
                      {item.content_type === "carousel" &&
                        item.content_data?.items && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                            <p className="text-[9px] font-black text-orange-400 uppercase mb-1">
                              Rotation Items:
                            </p>
                            {item.content_data.items.map(
                              (c: any, i: number) => (
                                <div
                                  key={i}
                                  className="text-[10px] flex justify-between text-slate-600 font-medium"
                                >
                                  <span className="truncate w-3/4">
                                    {i + 1}. {c.Ad?.name}
                                  </span>
                                  <span className="font-mono">
                                    {c.Ad?.duration}s
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
