// "use client";

// import { useState, useEffect } from "react";

// import { LayoutBuilder } from "@/pages/AddToSchedule/components/layout-builder";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/pages/AddToSchedule/components/ui/scroll-area";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   MoreHorizontal,
//   Plus,
//   Pencil,
//   Trash2,
//   Layout,
//   Code,
//   Film,
//   LayoutGrid,
// } from "lucide-react";

// import {
//   getLayouts,
//   saveLayout,
//   deleteLayout,
//   type Layout as LayoutType,
// } from "@/lib/store";
// import { toast } from "sonner";
// import api from "@/api";

// export default function ScreenLayoutPage() {
//   const [layouts, setLayouts] = useState<LayoutType[]>([]);
//   const [editingLayout, setEditingLayout] = useState<LayoutType | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [showJson, setShowJson] = useState(false);

//   // useEffect(async() => {
//   //   setLayouts(await getLayouts());
//   // }, []);
//   useEffect(() => {
//     const fetchLayouts = async () => {
//       const data = await getLayouts();
//       console.log("data", data);
//       setLayouts(data);
//     };

//     fetchLayouts();
//   }, []);

//   const handleSaveLayout = async (layout: LayoutType) => {
//     saveLayout(layout);
//     setLayouts(await getLayouts());
//     setEditingLayout(null);
//     setIsCreating(false);

//     console.log("layout", layout);

//     // toast({
//     //   title: "Layout Saved",
//     //   description: `Layout "${layout.name}" has been saved successfully.`,
//     // })
//     // toast.success(`Layout "${layout.name}" has been saved successfully.`);
//   };

//   const handleDeleteLayout = async (layoutId: string) => {
//     deleteLayout(layoutId);
//     setLayouts(await getLayouts());
//     // toast({
//     //   title: "Layout Deleted",
//     //   description: "The layout has been deleted.",
//     // })
//     // toast.success("The layout has been deleted.");
//   };

//   const currentLayout =
//     editingLayout || (isCreating ? null : layouts[0] || null);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <main className="flex-1 p-6 overflow-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <Layout className="w-5 h-5" />
//             <h1 className="text-2xl font-semibold">Screen Layout</h1>
//           </div>
//           <Button
//             onClick={() => {
//               setIsCreating(true);
//               setEditingLayout(null);
//             }}
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             New Layout
//           </Button>
//         </div>

//         {/* Builder or Table */}
//         {isCreating || editingLayout ? (
//           <div className="space-y-6">
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setIsCreating(false);
//                   setEditingLayout(null);
//                 }}
//               >
//                 Back to List
//               </Button>
//               <span className="text-muted-foreground">
//                 {editingLayout
//                   ? `Editing: ${editingLayout.name}`
//                   : "Creating New Layout"}
//               </span>
//             </div>
//             <LayoutBuilder
//               initialLayout={editingLayout || undefined}
//               onSave={handleSaveLayout}
//             />
//           </div>
//         ) : (
//           <>
//             {/* Saved Layouts Table */}
//             {layouts.length > 0 ? (
//               <div className="rounded-md border bg-white mb-6">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Resolution</TableHead>
//                       <TableHead>Orientation</TableHead>
//                       <TableHead>Zones</TableHead>
//                       <TableHead>Zone Types</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead className="w-12">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {layouts.map((layout) => {
//                       const mediaZones = layout.zones.filter(
//                         (z) => z.content_type_allowed === "media",
//                       ).length;
//                       const widgetZones = layout.zones.filter(
//                         (z) => z.content_type_allowed === "widget",
//                       ).length;

//                       return (
//                         <TableRow key={layout.layout_id}>
//                           <TableCell className="font-medium">
//                             {layout.name}
//                           </TableCell>
//                           <TableCell>{layout.resolution}</TableCell>
//                           <TableCell className="capitalize">
//                             {layout.orientation}
//                           </TableCell>
//                           <TableCell>{layout.zones.length} zones</TableCell>
//                           <TableCell>
//                             <div className="flex gap-2">
//                               {mediaZones > 0 && (
//                                 <Badge variant="default" className="text-xs">
//                                   <Film className="w-3 h-3 mr-1" />
//                                   {mediaZones} Media
//                                 </Badge>
//                               )}
//                               {widgetZones > 0 && (
//                                 <Badge variant="secondary" className="text-xs">
//                                   <LayoutGrid className="w-3 h-3 mr-1" />
//                                   {widgetZones} Widget
//                                 </Badge>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               variant={
//                                 layout.is_active ? "default" : "secondary"
//                               }
//                             >
//                               {layout.is_active ? "Active" : "Inactive"}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon">
//                                   <MoreHorizontal className="w-4 h-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem
//                                   onClick={() => setEditingLayout(layout)}
//                                 >
//                                   <Pencil className="w-4 h-4 mr-2" />
//                                   Edit
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   className="text-destructive"
//                                   onClick={() =>
//                                     handleDeleteLayout(layout.layout_id)
//                                   }
//                                 >
//                                   <Trash2 className="w-4 h-4 mr-2" />
//                                   Delete
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : (
//               <div className="text-center py-12 border rounded-md mb-6 bg-white">
//                 <Layout className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Layouts Yet</h3>
//                 <p className="text-muted-foreground mb-4">
//                   Create your first screen layout to get started.
//                 </p>
//                 <Button onClick={() => setIsCreating(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Layout
//                 </Button>
//               </div>
//             )}

//             {/* JSON Console */}
//             {/* {currentLayout && (
//               <Card>
//                 <CardHeader className="pb-2 flex flex-row items-center justify-between">
//                   <CardTitle className="text-lg flex items-center gap-2">
//                     <Code className="w-5 h-5" />
//                     Layout JSON Structure
//                   </CardTitle>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setShowJson(!showJson)}
//                   >
//                     {showJson ? "Hide" : "Show"} JSON
//                   </Button>
//                 </CardHeader>
//                 {showJson && (
//                   <CardContent>
//                     <ScrollArea className="h-80">
//                       <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
//                         {JSON.stringify(currentLayout, null, 2)}
//                       </pre>
//                     </ScrollArea>
//                     <div className="mt-3 flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           navigator.clipboard.writeText(
//                             JSON.stringify(currentLayout, null, 2),
//                           );
//                           // toast({ title: "Copied", description: "JSON copied to clipboard" })
//                           toast.success("JSON copied to clipboard");
//                         }}
//                       >
//                         Copy to Clipboard
//                       </Button>
//                     </div>
//                   </CardContent>
//                 )}
//               </Card>
//             )} */}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// "use client";

// import { useState, useEffect, useRef, useMemo } from "react";
// import Hls from "hls.js";
// import api from "@/api";
// import { toast } from "sonner";

// // UI Components
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// // Icons
// import {
//   MoreHorizontal, Plus, Pencil, Trash2, Layout as LayoutIcon,
//   Film, LayoutGrid, ChevronLeft, Monitor, Smartphone, Move, Maximize,
//   Save, Grid3X3, Palette, Maximize2, SplitSquareHorizontal, SplitSquareVertical, Code
// } from "lucide-react";

// import { getLayouts, saveLayout, deleteLayout, type Layout as LayoutType } from "@/lib/store";

// // ============================================================================
// // INTERNAL COMPONENTS (PREVIEW PLAYERS)
// // ============================================================================

// const HlsPlayer = ({ url, muted }: { url: string; muted: boolean }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;
//     if (Hls.isSupported() && url.includes(".m3u8")) {
//       const hls = new Hls();
//       hls.loadSource(url);
//       hls.attachMedia(video);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
//       return () => hls.destroy();
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       video.src = url;
//     }
//   }, [url]);
//   return <video ref={videoRef} autoPlay muted={muted} className="w-full h-full object-fill bg-black" />;
// };

// const WidgetRenderer = ({ item, zoneWidth, zoneHeight }: any) => {
//   const [time, setTime] = useState(new Date());
//   const config = item.widget_config || {};
//   const widgetType = item.content_data?.type;

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const getScaledFont = (sizeStr: string) => {
//     const num = parseInt(sizeStr || "24");
//     return Math.max(num * 0.4, 12) + "px";
//   };

//   const containerStyle: React.CSSProperties = {
//     width: "100%", height: "100%", display: "flex", flexDirection: "column",
//     justifyContent: "center", alignItems: "center", backgroundColor: config.background || "#000",
//     color: config.color || "#fff", fontFamily: "sans-serif", overflow: "hidden", position: "relative"
//   };

//   if (widgetType === "clock_digital") {
//     return (
//       <div style={containerStyle}>
//         <div style={{ fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>
//           {time.toLocaleTimeString('en-US', { timeZone: config.timezone || "Asia/Kolkata", hour12: config.format === "12h" })}
//         </div>
//       </div>
//     );
//   }

//   if (widgetType === "calendar") {
//     const base = Math.min(zoneWidth, zoneHeight);
//     return (
//       <div style={containerStyle}>
//         <div style={{ fontSize: base * 0.12, textTransform: "uppercase", opacity: 0.8 }}>{time.toLocaleDateString('en-US', { month: 'short' })}</div>
//         <div style={{ fontSize: base * 0.35, lineHeight: 1.1, fontWeight: "bold" }}>{time.getDate()}</div>
//       </div>
//     );
//   }

//   if (widgetType === "sliding_text" || widgetType === "ticker") {
//     const speed = config.speed || 50;
//     const direction = config.direction === 'right' ? 'reverse' : 'normal';
//     return (
//       <div style={{ ...containerStyle, alignItems: "flex-start" }}>
//         <style>{`
//           @keyframes marquee_loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
//           .ticker-track { display: flex; width: max-content; animation: marquee_loop ${200/speed * 10}s linear infinite ${direction}; }
//         `}</style>
//         <div className="ticker-track">
//           <div style={{ whiteSpace: "nowrap", paddingRight: "100px", fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>{config.text}</div>
//           <div style={{ whiteSpace: "nowrap", paddingRight: "100px", fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>{config.text}</div>
//         </div>
//       </div>
//     );
//   }

//   if (widgetType === "logo") {
//     return <div style={containerStyle}><img src={config.url} style={{ width: "100%", height: "100%", objectFit: config.fit || "contain" }} alt="Logo" /></div>;
//   }
//   return <div style={containerStyle}>{widgetType}</div>;
// };

// const ZonePlayer = ({ zone, scheduleData, zoneWidth, zoneHeight }: any) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [subIndex, setSubIndex] = useState(0);

//   const items = useMemo(() => scheduleData?.content_items || [], [scheduleData]);
//   const activeItem = items[currentIndex];

//   const nextItem = () => {
//     setSubIndex(0);
//     if (items.length > 1) setCurrentIndex((prev) => (prev + 1) % items.length);
//   };

//   useEffect(() => {
//     if (!activeItem) return;
//     if (activeItem.content_type === "carousel") {
//       const subItems = activeItem.content_data?.items || [];
//       const timer = setTimeout(() => {
//         if (subIndex < subItems.length - 1) setSubIndex(s => s + 1);
//         else nextItem();
//       }, ((subItems[subIndex]?.Ad?.duration || 10) * 1000));
//       return () => clearTimeout(timer);
//     }

//     const isVideo = activeItem.content_data?.url?.toLowerCase().endsWith(".mp4");
//     if (activeItem.content_type !== "live_content" && !isVideo) {
//       const timer = setTimeout(nextItem, (activeItem.content_data?.duration || 10) * 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [currentIndex, subIndex, items, activeItem]);

//   if (!activeItem) return <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[10px] text-white/20 uppercase font-black tracking-widest">{zone.name}</div>;
//   if (activeItem.content_type === "widget") return <WidgetRenderer item={activeItem} zoneWidth={zoneWidth} zoneHeight={zoneHeight} />;
//   if (activeItem.content_type === "live_content") return <HlsPlayer url={activeItem.content_data.url} muted={zone.is_muted} />;

//   const mediaUrl = activeItem.content_type === "carousel" ? activeItem.content_data.items[subIndex]?.Ad?.url : activeItem.content_data?.url;
//   const isVideo = mediaUrl?.toLowerCase().includes(".mp4");

//   return (
//     <div className="w-full h-full bg-black relative">
//       {isVideo ? (
//         <video key={mediaUrl} src={mediaUrl} autoPlay muted={zone.is_muted} onEnded={() => {
//           if (activeItem.content_type === "carousel" && subIndex < activeItem.content_data.items.length -1) setSubIndex(s => s + 1);
//           else nextItem();
//         }} className="w-full h-full object-fill" />
//       ) : (
//         <img key={mediaUrl} src={mediaUrl} className="w-full h-full object-fill" alt="" />
//       )}
//       {activeItem.content_type === "live_content" && (
//          <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse">LIVE</div>
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // NATIVE DRAG & DROP LAYOUT BUILDER (SMART GUIDES + KEYBOARD + PHYSICS)
// // ============================================================================
// interface BuilderProps {
//   initialLayout?: LayoutType;
//   schedule?: any;
//   onChange: (layout: any) => void;
// }

// function LayoutBuilder({ initialLayout, schedule, onChange }: BuilderProps) {
//   const [name, setName] = useState(initialLayout?.name || "New Layout");
//   const [zones, setZones] = useState<any[]>(initialLayout?.zones || []);
//   const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
//   const [orientation, setOrientation] = useState(initialLayout?.orientation || "landscape");

//   const [canvasBg, setCanvasBg] = useState(initialLayout?.config?.canvasBg || "#000000");
//   const [zoneGap, setZoneGap] = useState(initialLayout?.config?.zoneGap || 0);
//   const [zoneRadius, setZoneRadius] = useState(initialLayout?.config?.zoneRadius || 0);

//   const [dragState, setDragState] = useState<{
//     id: string; type: 'move' | 'resize';
//     startX: number; startY: number;
//     initialX: number; initialY: number;
//     initialW: number; initialH: number;
//   } | null>(null);

//   const [guides, setGuides] = useState<{ vertical: number | null, horizontal: number | null }>({ vertical: null, horizontal: null });

//   const CANVAS_WIDTH = orientation === "landscape" ? 800 : 360;
//   const CANVAS_HEIGHT = orientation === "landscape" ? 450 : 640;
//   const GRID_STEP = 10;
//   const SNAP_THRESHOLD = 5;

//   const activeZone = useMemo(() => zones.find(z => z.zone_id === selectedZoneId), [zones, selectedZoneId]);

//   // Sync state up to parent whenever changes happen
//   useEffect(() => {
//     onChange({
//       layout_id: initialLayout?.layout_id || null,
//       name,
//       resolution: orientation === "landscape" ? "1920x1080" : "1080x1920",
//       orientation,
//       is_active: true,
//       zones,
//       config: { canvasBg, zoneGap, zoneRadius },
//       version: 1,
//       is_published: true
//     });
//   }, [name, zones, orientation, canvasBg, zoneGap, zoneRadius]);

//   const addZone = () => {
//     const newZone = {
//       zone_id: crypto.randomUUID(), name: `Zone ${zones.length + 1}`,
//       x: 0, y: 0, width: 30, height: 30, z_index: zones.length + 1,
//       content_type_allowed: "media", color: zones.length % 3 === 0 ? "#3b82f6" : zones.length % 3 === 1 ? "#22c55e" : "#f59e0b",
//       is_muted: true
//     };
//     setZones([...zones, newZone]);
//     setSelectedZoneId(newZone.zone_id);
//   };

//   const updateExactProp = (property: 'x' | 'y' | 'width' | 'height', value: string) => {
//     if (!selectedZoneId) return;
//     const numValue = Math.max(0, Math.min(100, Number(value) || 0));
//     setZones(zones.map(z => z.zone_id === selectedZoneId ? { ...z, [property]: numValue } : z));
//   };

//   const autoSnap = (type: 'fullscreen' | 'fill-width' | 'fill-height') => {
//     if (!selectedZoneId) return;
//     setZones(zones.map(z => {
//       if (z.zone_id !== selectedZoneId) return z;
//       if (type === 'fullscreen') return { ...z, x: 0, y: 0, width: 100, height: 100 };
//       if (type === 'fill-width') return { ...z, x: 0, width: 100 };
//       if (type === 'fill-height') return { ...z, y: 0, height: 100 };
//       return z;
//     }));
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "SELECT") return;
//       if (!selectedZoneId) return;

//       if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
//         e.preventDefault();
//         const stepX = (GRID_STEP / CANVAS_WIDTH) * 100;
//         const stepY = (GRID_STEP / CANVAS_HEIGHT) * 100;

//         setZones(prevZones => prevZones.map(z => {
//           if (z.zone_id !== selectedZoneId) return z;
//           let newX = z.x; let newY = z.y; let newW = z.width; let newH = z.height;

//           if (e.shiftKey) {
//             if (e.key === "ArrowUp") newH -= stepY;
//             if (e.key === "ArrowDown") newH += stepY;
//             if (e.key === "ArrowLeft") newW -= stepX;
//             if (e.key === "ArrowRight") newW += stepX;
//           } else {
//             if (e.key === "ArrowUp") newY -= stepY;
//             if (e.key === "ArrowDown") newY += stepY;
//             if (e.key === "ArrowLeft") newX -= stepX;
//             if (e.key === "ArrowRight") newX += stepX;
//           }

//           newX = Math.max(0, Math.min(100 - z.width, newX));
//           newY = Math.max(0, Math.min(100 - z.height, newY));
//           newW = Math.max(5, Math.min(100 - z.x, newW));
//           newH = Math.max(5, Math.min(100 - z.y, newH));

//           return { ...z, x: newX, y: newY, width: newW, height: newH };
//         }));
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [selectedZoneId, CANVAS_WIDTH, CANVAS_HEIGHT]);

//   const handlePointerDown = (e: React.MouseEvent, zoneId: string, type: 'move' | 'resize') => {
//     e.stopPropagation(); e.preventDefault();
//     const zone = zones.find(z => z.zone_id === zoneId);
//     if (!zone) return;

//     setSelectedZoneId(zoneId);
//     setDragState({
//       id: zoneId, type, startX: e.clientX, startY: e.clientY,
//       initialX: zone.x, initialY: zone.y, initialW: zone.width, initialH: zone.height
//     });
//   };

//   useEffect(() => {
//     if (!dragState) { setGuides({ vertical: null, horizontal: null }); return; }

//     const handleMouseMove = (e: MouseEvent) => {
//       const dx = e.clientX - dragState.startX;
//       const dy = e.clientY - dragState.startY;
//       const dxPct = (dx / CANVAS_WIDTH) * 100;
//       const dyPct = (dy / CANVAS_HEIGHT) * 100;

//       setZones(prevZones => prevZones.map(z => {
//         if (z.zone_id !== dragState.id) return z;
//         let newX = z.x; let newY = z.y; let newW = z.width; let newH = z.height;
//         let vGuide = null; let hGuide = null;

//         if (dragState.type === 'move') {
//           newX = dragState.initialX + dxPct;
//           newY = dragState.initialY + dyPct;

//           let pxX = (newX / 100) * CANVAS_WIDTH;
//           let pxY = (newY / 100) * CANVAS_HEIGHT;
//           const pxW = (z.width / 100) * CANVAS_WIDTH;
//           const pxH = (z.height / 100) * CANVAS_HEIGHT;
//           const centerX = pxX + (pxW / 2);
//           const centerY = pxY + (pxH / 2);

//           const targetsX = [CANVAS_WIDTH / 2, 0, CANVAS_WIDTH - pxW];
//           const targetsY = [CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT - pxH];

//           prevZones.forEach(otherZ => {
//               if (otherZ.zone_id === z.zone_id) return;
//               const oX = (otherZ.x / 100) * CANVAS_WIDTH;
//               const oY = (otherZ.y / 100) * CANVAS_HEIGHT;
//               targetsX.push(oX, oX + ((otherZ.width / 100) * CANVAS_WIDTH));
//               targetsY.push(oY, oY + ((otherZ.height / 100) * CANVAS_HEIGHT));
//           });

//           for (let target of targetsX) {
//               if (Math.abs(pxX - target) < SNAP_THRESHOLD) { pxX = target; vGuide = target; break; }
//               if (Math.abs(centerX - target) < SNAP_THRESHOLD) { pxX = target - (pxW / 2); vGuide = target; break; }
//           }
//           for (let target of targetsY) {
//               if (Math.abs(pxY - target) < SNAP_THRESHOLD) { pxY = target; hGuide = target; break; }
//               if (Math.abs(centerY - target) < SNAP_THRESHOLD) { pxY = target - (pxH / 2); hGuide = target; break; }
//           }

//           setGuides({ vertical: vGuide, horizontal: hGuide });
//           newX = (pxX / CANVAS_WIDTH) * 100;
//           newY = (pxY / CANVAS_HEIGHT) * 100;

//           newX = Math.max(0, Math.min(100 - z.width, newX));
//           newY = Math.max(0, Math.min(100 - z.height, newY));

//         } else if (dragState.type === 'resize') {
//           newW = dragState.initialW + dxPct;
//           newH = dragState.initialH + dyPct;

//           const pxW = Math.round((newW / 100) * CANVAS_WIDTH);
//           const pxH = Math.round((newH / 100) * CANVAS_HEIGHT);
//           newW = (Math.round(pxW / GRID_STEP) * GRID_STEP / CANVAS_WIDTH) * 100;
//           newH = (Math.round(pxH / GRID_STEP) * GRID_STEP / CANVAS_HEIGHT) * 100;

//           newW = Math.max(5, Math.min(100 - z.x, newW));
//           newH = Math.max(5, Math.min(100 - z.y, newH));
//         }

//         return { ...z, x: newX, y: newY, width: newW, height: newH };
//       }));
//     };

//     const handleMouseUp = () => setDragState(null);
//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('mouseup', handleMouseUp);
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       window.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [dragState, CANVAS_WIDTH, CANVAS_HEIGHT]);

//   const handleBackgroundClick = (e: React.MouseEvent) => {
//     if (e.target === e.currentTarget) setSelectedZoneId(null);
//   };

//   return (
//     <div className="flex gap-6 h-[calc(100vh-250px)] select-none">

//       {/* SIDEBAR: CONTROLS */}
//       <div className="w-[340px] flex flex-col gap-4 overflow-y-auto pr-2 pb-4">

//         {/* 1. General Config */}
//         <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
//           <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">General Info</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Layout Name" className="font-bold border-slate-200 h-8 text-sm" /></div>
//           <div className="flex gap-2">
//             <Button variant={orientation === "landscape" ? "default" : "outline"} className="flex-1 h-12 flex-col gap-1 text-[10px]" onClick={() => setOrientation("landscape")}><Monitor size={14} /> Landscape</Button>
//             <Button variant={orientation === "portrait" ? "default" : "outline"} className="flex-1 h-12 flex-col gap-1 text-[10px]" onClick={() => setOrientation("portrait")}> <Smartphone size={14} /> Portrait</Button>
//           </div>
//           <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100" onClick={addZone}><Plus className="w-4 h-4 mr-2" /> Add Zone</Button>
//         </Card>

//         {/* 2. Global Styling */}
//         <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
//           <div className="flex items-center gap-2 mb-1"><Palette size={14} className="text-blue-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Styling</span></div>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-600">Background</span><input type="color" value={canvasBg} onChange={e => setCanvasBg(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0" /></div>
//             <div className="space-y-2"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Zone Gap</span><Badge variant="secondary" className="text-[10px] px-1">{zoneGap}px</Badge></div><input type="range" min="0" max="50" value={zoneGap} onChange={e => setZoneGap(Number(e.target.value))} className="w-full accent-blue-600" /></div>
//             <div className="space-y-2"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Border Radius</span><Badge variant="secondary" className="text-[10px] px-1">{zoneRadius}px</Badge></div><input type="range" min="0" max="100" value={zoneRadius} onChange={e => setZoneRadius(Number(e.target.value))} className="w-full accent-blue-600" /></div>
//           </div>
//         </Card>

//         {/* 3. Selected Zone Adjustments */}
//         {activeZone && (
//           <Card className="p-4 border-indigo-200 bg-indigo-50/50 shadow-sm flex-shrink-0 animate-in fade-in slide-in-from-top-2">
//             <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Zone Adjustments</span><span className="text-[9px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded border border-indigo-100">{activeZone.name}</span></div>
//             <div className="flex gap-2 mb-4">
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fullscreen')}><Maximize2 size={12} className="mr-1"/> Fill All</Button>
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fill-width')}><SplitSquareVertical size={12} className="mr-1"/> Fill W</Button>
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fill-height')}><SplitSquareHorizontal size={12} className="mr-1"/> Fill H</Button>
//             </div>
//             <div className="grid grid-cols-4 gap-2">
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">X (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.x} onChange={(e) => updateExactProp('x', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">Y (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.y} onChange={(e) => updateExactProp('y', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">W (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.width} onChange={(e) => updateExactProp('width', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">H (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.height} onChange={(e) => updateExactProp('height', e.target.value)} /></div>
//             </div>
//           </Card>
//         )}

//         {/* 4. Layers and Zones List */}
//         <Card className="flex-shrink-0 flex flex-col border-slate-200 shadow-sm min-h-[200px]">
//           <div className="p-3 border-b bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Layout Layers ({zones.length})</span></div>
//           <div className="flex-1 overflow-y-auto bg-slate-50/50">
//             <div className="p-3 space-y-2">
//               {zones.map((zone) => (
//                 <div key={zone.zone_id} onClick={() => setSelectedZoneId(zone.zone_id)} className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${selectedZoneId === zone.zone_id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
//                   <div className="flex justify-between items-center mb-1">
//                     <Input value={zone.name} onChange={(e) => setZones(zones.map(z => z.zone_id === zone.zone_id ? {...z, name: e.target.value} : z))} className="h-6 text-xs font-bold border-none bg-transparent px-1 focus-visible:ring-1 shadow-none"/>
//                     <button onClick={(e) => { e.stopPropagation(); setZones(zones.filter(z => z.zone_id !== zone.zone_id)); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
//                   </div>

//                   {/* EDITABLE CONTENT TYPE (WIDGET OR MEDIA) */}
//                   <div className="flex justify-between items-center mt-2 px-1">
//                     <select
//                       className="text-[9px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded px-1.5 py-1 outline-none text-slate-600"
//                       value={zone.content_type_allowed}
//                       onChange={(e) => setZones(zones.map(z => z.zone_id === zone.zone_id ? {...z, content_type_allowed: e.target.value} : z))}
//                     >
//                       <option value="media">🎥 Media Zone</option>
//                       <option value="widget">🧩 Widget Zone</option>
//                     </select>
//                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">W:{zone.width}% H:{zone.height}%</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* CANVAS AREA (WITH THROW LINES & DOT GRID) */}
//       <div
//         className="flex-1 bg-slate-200/50 rounded-3xl border-2 border-slate-200 relative flex items-center justify-center overflow-auto p-6 lg:p-12"
//         onMouseDown={handleBackgroundClick}
//       >
//         <div
//           className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative transition-all duration-300 border-[6px] border-slate-900 rounded-[8px] mx-auto"
//           onMouseDown={handleBackgroundClick}
//           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: canvasBg, backgroundImage: `radial-gradient(circle, rgba(203, 213, 225, 0.4) 1.5px, transparent 1.5px)`, backgroundSize: `${GRID_STEP}px ${GRID_STEP}px` }}
//         >
//           {guides.vertical !== null && <div className="absolute top-0 bottom-0 w-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]" style={{ left: `${guides.vertical}px` }} />}
//           {guides.horizontal !== null && <div className="absolute left-0 right-0 h-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]" style={{ top: `${guides.horizontal}px` }} />}

//           {zones.map((zone) => {
//             const zoneSchedule = schedule?.zones?.find((z: any) => z.zone_id === zone.zone_id);
//             return (
//               <div
//                 key={zone.zone_id}
//                 onMouseDown={(e) => handlePointerDown(e, zone.zone_id, 'move')}
//                 onClick={(e) => e.stopPropagation()}
//                 className={`absolute group border-2 ${selectedZoneId === zone.zone_id ? 'border-blue-500 ring-2 ring-blue-500/20 z-50 cursor-grabbing shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent cursor-grab hover:border-white/50'}`}
//                 style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.width}%`, height: `${zone.height}%`, zIndex: selectedZoneId === zone.zone_id ? 9999 : zone.z_index }}
//               >
//                 <div className="w-full h-full pointer-events-none" style={{ padding: `${zoneGap}px` }}>
//                   <div className="w-full h-full relative overflow-hidden transition-all shadow-md border border-white/20" style={{ backgroundColor: schedule ? 'transparent' : zone.color, borderRadius: `${zoneRadius}px` }}>

//                      {/* RENDER LIVE PREVIEW IF SCHEDULE EXISTS */}
//                      {schedule ? (
//                          <ZonePlayer zone={zone} zoneWidth={(zone.width/100)*CANVAS_WIDTH} scheduleData={zoneSchedule} />
//                      ) : (
//                          <div className="w-full h-full flex flex-col items-center justify-center text-white opacity-90 transition-opacity">
//                              <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                  <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-move"><Move size={14} /></div>
//                                  <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-se-resize"><Maximize size={14} /></div>
//                              </div>
//                              <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none drop-shadow-md text-center px-1">{zone.name}</span>
//                          </div>
//                      )}

//                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase pointer-events-none z-10">Z-{zone.z_index}</div>
//                      <div className="absolute bottom-1 right-1 bg-black/40 px-1.5 py-0.5 rounded text-[8px] font-bold text-white pointer-events-none z-10">{zone.width}% x {zone.height}%</div>
//                   </div>
//                 </div>

//                 {selectedZoneId === zone.zone_id && (
//                   <div
//                     onMouseDown={(e) => handlePointerDown(e, zone.zone_id, 'resize')}
//                     className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-[3px] border-blue-600 rounded-full cursor-se-resize shadow-md hover:scale-110 transition-transform flex items-center justify-center z-[10000]"
//                   />
//                 )}
//               </div>
//           )})}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // MAIN PAGE COMPONENT
// // ============================================================================
// export default function ScreenLayoutPage() {
//   const [layouts, setLayouts] = useState<LayoutType[]>([]);
//   const [editingLayout, setEditingLayout] = useState<LayoutType | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [showJson, setShowJson] = useState(false);

//   // Current Builder State (Lifted up for Saving and JSON preview)
//   const [currentBuilderState, setCurrentBuilderState] = useState<any>(null);

//   const [groupWiseData, setGroupWiseData] = useState<any[]>([]);
//   const [selectedGroup, setSelectedGroup] = useState<any>(null);
//   const schedule = selectedGroup?.schedules?.[0];

//   useEffect(() => { loadData(); }, []);

//   const loadData = async () => {
//     try {
//       const data = await getLayouts();
//       setLayouts(data);
//     } catch (error) { toast.error("Failed to load layouts"); }
//   };

//   const handleStartEdit = async (layout: LayoutType) => {
//     setEditingLayout(layout);
//     setIsCreating(false);

//     try {
//         const res = await api.get(`/layout/shedule/get/${layout.layout_id}`);
//         const apiData = res.data?.data;
//         if (apiData) {
//             setGroupWiseData(apiData.group_wise_data || []);
//             if (apiData.group_wise_data?.length > 0) setSelectedGroup(apiData.group_wise_data[0]);
//         }
//     } catch(e) {}
//   };

//   const handleCreateNew = () => {
//     setIsCreating(true);
//     setEditingLayout(null);
//   };

//   const handleSaveLayout = async () => {
//     if (!currentBuilderState) return;
//     try {
//       saveLayout(currentBuilderState); // Using original API signature
//       await loadData();
//       setEditingLayout(null);
//       setIsCreating(false);
//       toast.success(`Layout "${currentBuilderState.name}" saved successfully.`);
//     } catch (error) { toast.error("Error saving layout"); }
//   };

//   const handleDeleteLayout = async (layoutId: string) => {
//     if (!confirm("Are you sure you want to delete this layout?")) return;
//     try {
//       deleteLayout(layoutId);
//       await loadData();
//       toast.success("Layout deleted");
//     } catch (error) { toast.error("Error deleting layout"); }
//   };

//   const displayState = currentBuilderState || editingLayout || (isCreating ? null : layouts[0] || null);

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <main className="flex-1 p-6 overflow-auto">

//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <LayoutIcon className="w-5 h-5" />
//             <h1 className="text-2xl font-semibold">Screen Layout</h1>
//           </div>
//           {!isCreating && !editingLayout && (
//             <Button onClick={handleCreateNew}>
//               <Plus className="w-4 h-4 mr-2" /> New Layout
//             </Button>
//           )}
//         </div>

//         {isCreating || editingLayout ? (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <Button variant="outline" onClick={() => { setIsCreating(false); setEditingLayout(null); }}>
//                    Back to List
//                 </Button>
//                 {groupWiseData.length > 0 && (
//                     <select className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none" value={selectedGroup?.group_id} onChange={(e) => setSelectedGroup(groupWiseData.find(g => g.group_id === e.target.value))}>
//                       {groupWiseData.map(g => <option key={g.group_id} value={g.group_id}>Preview Group: {g.group_id.slice(0,6)}</option>)}
//                     </select>
//                 )}
//               </div>
//               <Button onClick={handleSaveLayout}><Save className="w-4 h-4 mr-2"/> Finish & Save</Button>
//             </div>

//             {/* BUILDER */}
//             <LayoutBuilder
//                 initialLayout={editingLayout || undefined}
//                 schedule={schedule}
//                 onChange={setCurrentBuilderState}
//                 onSave={handleSaveLayout} // Triggered via header button, but kept for interface safety
//             />

//             {/* RESTORED JSON CONSOLE */}
//             {displayState && (
//               <Card className="mt-8">
//                 <CardHeader className="pb-2 flex flex-row items-center justify-between">
//                   <CardTitle className="text-lg flex items-center gap-2"><Code className="w-5 h-5" /> Layout JSON Structure</CardTitle>
//                   <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)}>
//                     {showJson ? "Hide" : "Show"} JSON
//                   </Button>
//                 </CardHeader>
//                 {showJson && (
//                   <CardContent>
//                     <div className="h-80 overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-lg">
//                       <pre className="text-xs">{JSON.stringify(displayState, null, 2)}</pre>
//                     </div>
//                     <div className="mt-3 flex gap-2">
//                       <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(displayState, null, 2)); toast.success("JSON copied to clipboard"); }}>
//                         Copy to Clipboard
//                       </Button>
//                     </div>
//                   </CardContent>
//                 )}
//               </Card>
//             )}

//           </div>
//         ) : (
//           <div className="space-y-6">
//             {layouts.length > 0 ? (
//               <div className="rounded-md border bg-white mb-6">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Resolution</TableHead>
//                       <TableHead>Orientation</TableHead>
//                       <TableHead>Zones</TableHead>
//                       <TableHead>Zone Types</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead className="w-12">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {layouts.map((layout) => {
//                       const mediaZones = layout.zones.filter((z) => z.content_type_allowed === "media").length;
//                       const widgetZones = layout.zones.filter((z) => z.content_type_allowed === "widget").length;

//                       return (
//                         <TableRow key={layout.layout_id}>
//                           <TableCell className="font-medium">{layout.name}</TableCell>
//                           <TableCell>{layout.resolution}</TableCell>
//                           <TableCell className="capitalize">{layout.orientation}</TableCell>
//                           <TableCell>{layout.zones.length} zones</TableCell>
//                           <TableCell>
//                             <div className="flex gap-2">
//                               {mediaZones > 0 && <Badge variant="default" className="text-xs"><Film className="w-3 h-3 mr-1" />{mediaZones} Media</Badge>}
//                               {widgetZones > 0 && <Badge variant="secondary" className="text-xs"><LayoutGrid className="w-3 h-3 mr-1" />{widgetZones} Widget</Badge>}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={layout.is_active ? "default" : "secondary"}>{layout.is_active ? "Active" : "Inactive"}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem onClick={() => handleStartEdit(layout)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
//                                 <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteLayout(layout.layout_id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : (
//               <div className="text-center py-12 border rounded-md mb-6 bg-white">
//                 <LayoutIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Layouts Yet</h3>
//                 <p className="text-muted-foreground mb-4">Create your first screen layout to get started.</p>
//                 <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> Create Layout</Button>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// "use client";

// import { useState, useEffect, useRef, useMemo } from "react";
// import Hls from "hls.js";
// import api from "@/api";
// import { toast } from "sonner";

// // UI Components
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// // Icons
// import {
//   MoreHorizontal, Plus, Pencil, Trash2, Layout as LayoutIcon, Code,
//   Film, LayoutGrid, ChevronLeft, Monitor, Smartphone, Move, Maximize,
//   Save, Grid3X3, Palette, Maximize2, SplitSquareHorizontal, SplitSquareVertical
// } from "lucide-react";

// import { getLayouts, saveLayout, deleteLayout, type Layout as LayoutType } from "@/lib/store";

// // ============================================================================
// // INTERNAL COMPONENTS (PREVIEW PLAYERS)
// // ============================================================================

// const HlsPlayer = ({ url, muted }: { url: string; muted: boolean }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;
//     if (Hls.isSupported() && url.includes(".m3u8")) {
//       const hls = new Hls();
//       hls.loadSource(url);
//       hls.attachMedia(video);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
//       return () => hls.destroy();
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       video.src = url;
//     }
//   }, [url]);
//   return <video ref={videoRef} autoPlay muted={muted} className="w-full h-full object-fill bg-black" />;
// };

// const WidgetRenderer = ({ item, zoneWidth, zoneHeight }: any) => {
//   const [time, setTime] = useState(new Date());
//   const config = item.widget_config || {};
//   const widgetType = item.content_data?.type;

//   useEffect(() => {
//     const timer = setInterval(() => setTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const getScaledFont = (sizeStr: string) => {
//     const num = parseInt(sizeStr || "24");
//     return Math.max(num * 0.4, 12) + "px";
//   };

//   const containerStyle: React.CSSProperties = {
//     width: "100%", height: "100%", display: "flex", flexDirection: "column",
//     justifyContent: "center", alignItems: "center", backgroundColor: config.background || "#000",
//     color: config.color || "#fff", fontFamily: "sans-serif", overflow: "hidden", position: "relative"
//   };

//   if (widgetType === "clock_digital") {
//     return (
//       <div style={containerStyle}>
//         <div style={{ fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>
//           {time.toLocaleTimeString('en-US', { timeZone: config.timezone || "Asia/Kolkata", hour12: config.format === "12h" })}
//         </div>
//       </div>
//     );
//   }

//   if (widgetType === "calendar") {
//     const base = Math.min(zoneWidth, zoneHeight);
//     return (
//       <div style={containerStyle}>
//         <div style={{ fontSize: base * 0.12, textTransform: "uppercase", opacity: 0.8 }}>{time.toLocaleDateString('en-US', { month: 'short' })}</div>
//         <div style={{ fontSize: base * 0.35, lineHeight: 1.1, fontWeight: "bold" }}>{time.getDate()}</div>
//       </div>
//     );
//   }

//   if (widgetType === "sliding_text" || widgetType === "ticker") {
//     const speed = config.speed || 50;
//     const direction = config.direction === 'right' ? 'reverse' : 'normal';
//     return (
//       <div style={{ ...containerStyle, alignItems: "flex-start" }}>
//         <style>{`
//           @keyframes marquee_loop { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
//           .ticker-track { display: flex; width: max-content; animation: marquee_loop ${200/speed * 10}s linear infinite ${direction}; }
//         `}</style>
//         <div className="ticker-track">
//           <div style={{ whiteSpace: "nowrap", paddingRight: "100px", fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>{config.text}</div>
//           <div style={{ whiteSpace: "nowrap", paddingRight: "100px", fontSize: getScaledFont(config.fontSize), fontWeight: "bold" }}>{config.text}</div>
//         </div>
//       </div>
//     );
//   }

//   if (widgetType === "logo") {
//     return <div style={containerStyle}><img src={config.url} style={{ width: "100%", height: "100%", objectFit: config.fit || "contain" }} alt="Logo" /></div>;
//   }
//   return <div style={containerStyle}>{widgetType}</div>;
// };

// const ZonePlayer = ({ zone, scheduleData, zoneWidth, zoneHeight }: any) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [subIndex, setSubIndex] = useState(0);

//   const items = useMemo(() => scheduleData?.content_items || [], [scheduleData]);
//   const activeItem = items[currentIndex];

//   const nextItem = () => {
//     setSubIndex(0);
//     if (items.length > 1) setCurrentIndex((prev) => (prev + 1) % items.length);
//   };

//   useEffect(() => {
//     if (!activeItem) return;
//     if (activeItem.content_type === "carousel") {
//       const subItems = activeItem.content_data?.items || [];
//       const timer = setTimeout(() => {
//         if (subIndex < subItems.length - 1) setSubIndex(s => s + 1);
//         else nextItem();
//       }, ((subItems[subIndex]?.Ad?.duration || 10) * 1000));
//       return () => clearTimeout(timer);
//     }

//     const isVideo = activeItem.content_data?.url?.toLowerCase().endsWith(".mp4");
//     if (activeItem.content_type !== "live_content" && !isVideo) {
//       const timer = setTimeout(nextItem, (activeItem.content_data?.duration || 10) * 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [currentIndex, subIndex, items, activeItem]);

//   if (!activeItem) return <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[10px] text-white/20 uppercase font-black tracking-widest">{zone.name}</div>;
//   if (activeItem.content_type === "widget") return <WidgetRenderer item={activeItem} zoneWidth={zoneWidth} zoneHeight={zoneHeight} />;
//   if (activeItem.content_type === "live_content") return <HlsPlayer url={activeItem.content_data.url} muted={zone.is_muted} />;

//   const mediaUrl = activeItem.content_type === "carousel" ? activeItem.content_data.items[subIndex]?.Ad?.url : activeItem.content_data?.url;
//   const isVideo = mediaUrl?.toLowerCase().includes(".mp4");

//   return (
//     <div className="w-full h-full bg-black relative">
//       {isVideo ? (
//         <video key={mediaUrl} src={mediaUrl} autoPlay muted={zone.is_muted} onEnded={() => {
//           if (activeItem.content_type === "carousel" && subIndex < activeItem.content_data.items.length -1) setSubIndex(s => s + 1);
//           else nextItem();
//         }} className="w-full h-full object-fill" />
//       ) : (
//         <img key={mediaUrl} src={mediaUrl} className="w-full h-full object-fill" alt="" />
//       )}
//       {activeItem.content_type === "live_content" && (
//          <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse">LIVE</div>
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // NATIVE DRAG & DROP LAYOUT BUILDER (WITH GAP BAKING LOGIC)
// // ============================================================================
// interface BuilderProps {
//   initialLayout?: LayoutType;
//   schedule?: any;
//   onChange: (layout: any) => void;
// }

// function LayoutBuilder({ initialLayout, schedule, onChange }: BuilderProps) {
//   const [name, setName] = useState(initialLayout?.name || "New Layout");
//   const [zones, setZones] = useState<any[]>(initialLayout?.zones || []);
//   const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
//   const [orientation, setOrientation] = useState(initialLayout?.orientation || "landscape");

//   const [canvasBg, setCanvasBg] = useState(initialLayout?.config?.canvasBg || "#000000");
//   // zoneGap is only used temporarily in the UI to shrink zones visually before saving
//   const [zoneGap, setZoneGap] = useState(0);
//   const [zoneRadius, setZoneRadius] = useState(initialLayout?.config?.zoneRadius || 0);

//   const [dragState, setDragState] = useState<{
//     id: string; type: 'move' | 'resize';
//     startX: number; startY: number;
//     initialX: number; initialY: number;
//     initialW: number; initialH: number;
//   } | null>(null);

//   const [guides, setGuides] = useState<{ vertical: number | null, horizontal: number | null }>({ vertical: null, horizontal: null });

//   const CANVAS_WIDTH = orientation === "landscape" ? 800 : 360;
//   const CANVAS_HEIGHT = orientation === "landscape" ? 450 : 640;
//   const GRID_STEP = 10;
//   const SNAP_THRESHOLD = 5;

//   const activeZone = useMemo(() => zones.find(z => z.zone_id === selectedZoneId), [zones, selectedZoneId]);

//   // --- CORE GAP-BAKING LOGIC ---
//   // We calculate the actual shrunk coordinates here and send them to the parent state.
//   useEffect(() => {
//     const bakedZones = zones.map(z => {
//       if (zoneGap === 0) return z;

//       // Convert layout percentages to pixels
//       const pxX = (z.x / 100) * CANVAS_WIDTH;
//       const pxY = (z.y / 100) * CANVAS_HEIGHT;
//       const pxW = (z.width / 100) * CANVAS_WIDTH;
//       const pxH = (z.height / 100) * CANVAS_HEIGHT;

//       // Shrink by the gap amount on all sides
//       const newPxX = pxX + zoneGap;
//       const newPxY = pxY + zoneGap;
//       const newPxW = Math.max(1, pxW - (zoneGap * 2));
//       const newPxH = Math.max(1, pxH - (zoneGap * 2));

//       // Convert back to percentages for the backend
//       return {
//         ...z,
//         x: Number(((newPxX / CANVAS_WIDTH) * 100).toFixed(2)),
//         y: Number(((newPxY / CANVAS_HEIGHT) * 100).toFixed(2)),
//         width: Number(((newPxW / CANVAS_WIDTH) * 100).toFixed(2)),
//         height: Number(((newPxH / CANVAS_HEIGHT) * 100).toFixed(2))
//       };
//     });

//     onChange({
//       layout_id: initialLayout?.layout_id || null,
//       name,
//       resolution: orientation === "landscape" ? "1920x1080" : "1080x1920",
//       orientation,
//       is_active: true,
//       zones: bakedZones, // Send the gap-shrunk zones
//       config: { canvasBg, zoneRadius }, // Notice zoneGap is GONE from the API payload
//       version: 1,
//       is_published: true
//     });
//   }, [name, zones, orientation, canvasBg, zoneGap, zoneRadius]);

//   const addZone = () => {
//     const newZone = {
//       zone_id: crypto.randomUUID(), name: `Zone ${zones.length + 1}`,
//       x: 0, y: 0, width: 30, height: 30, z_index: zones.length + 1,
//       content_type_allowed: "media", color: zones.length % 3 === 0 ? "#3b82f6" : zones.length % 3 === 1 ? "#22c55e" : "#f59e0b",
//       is_muted: true
//     };
//     setZones([...zones, newZone]);
//     setSelectedZoneId(newZone.zone_id);
//   };

//   const updateExactProp = (property: 'x' | 'y' | 'width' | 'height', value: string) => {
//     if (!selectedZoneId) return;
//     const numValue = Math.max(0, Math.min(100, Number(value) || 0));
//     setZones(zones.map(z => z.zone_id === selectedZoneId ? { ...z, [property]: numValue } : z));
//   };

//   const autoSnap = (type: 'fullscreen' | 'fill-width' | 'fill-height') => {
//     if (!selectedZoneId) return;
//     setZones(zones.map(z => {
//       if (z.zone_id !== selectedZoneId) return z;
//       if (type === 'fullscreen') return { ...z, x: 0, y: 0, width: 100, height: 100 };
//       if (type === 'fill-width') return { ...z, x: 0, width: 100 };
//       if (type === 'fill-height') return { ...z, y: 0, height: 100 };
//       return z;
//     }));
//   };

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "SELECT") return;
//       if (!selectedZoneId) return;

//       if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
//         e.preventDefault();
//         const stepX = (GRID_STEP / CANVAS_WIDTH) * 100;
//         const stepY = (GRID_STEP / CANVAS_HEIGHT) * 100;

//         setZones(prevZones => prevZones.map(z => {
//           if (z.zone_id !== selectedZoneId) return z;
//           let newX = z.x; let newY = z.y; let newW = z.width; let newH = z.height;

//           if (e.shiftKey) {
//             if (e.key === "ArrowUp") newH -= stepY;
//             if (e.key === "ArrowDown") newH += stepY;
//             if (e.key === "ArrowLeft") newW -= stepX;
//             if (e.key === "ArrowRight") newW += stepX;
//           } else {
//             if (e.key === "ArrowUp") newY -= stepY;
//             if (e.key === "ArrowDown") newY += stepY;
//             if (e.key === "ArrowLeft") newX -= stepX;
//             if (e.key === "ArrowRight") newX += stepX;
//           }

//           newX = Math.max(0, Math.min(100 - z.width, newX));
//           newY = Math.max(0, Math.min(100 - z.height, newY));
//           newW = Math.max(5, Math.min(100 - z.x, newW));
//           newH = Math.max(5, Math.min(100 - z.y, newH));

//           return { ...z, x: newX, y: newY, width: newW, height: newH };
//         }));
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [selectedZoneId, CANVAS_WIDTH, CANVAS_HEIGHT]);

//   const handlePointerDown = (e: React.MouseEvent, zoneId: string, type: 'move' | 'resize') => {
//     e.stopPropagation(); e.preventDefault();
//     const zone = zones.find(z => z.zone_id === zoneId);
//     if (!zone) return;

//     setSelectedZoneId(zoneId);
//     setDragState({
//       id: zoneId, type, startX: e.clientX, startY: e.clientY,
//       initialX: zone.x, initialY: zone.y, initialW: zone.width, initialH: zone.height
//     });
//   };

//   useEffect(() => {
//     if (!dragState) {
//       setGuides({ vertical: null, horizontal: null });
//       return;
//     }

//     const handleMouseMove = (e: MouseEvent) => {
//       const dx = e.clientX - dragState.startX;
//       const dy = e.clientY - dragState.startY;
//       const dxPct = (dx / CANVAS_WIDTH) * 100;
//       const dyPct = (dy / CANVAS_HEIGHT) * 100;

//       setZones(prevZones => prevZones.map(z => {
//         if (z.zone_id !== dragState.id) return z;

//         let newX = z.x; let newY = z.y; let newW = z.width; let newH = z.height;
//         let vGuide = null; let hGuide = null;

//         if (dragState.type === 'move') {
//           newX = dragState.initialX + dxPct;
//           newY = dragState.initialY + dyPct;

//           let pxX = (newX / 100) * CANVAS_WIDTH;
//           let pxY = (newY / 100) * CANVAS_HEIGHT;
//           const pxW = (z.width / 100) * CANVAS_WIDTH;
//           const pxH = (z.height / 100) * CANVAS_HEIGHT;
//           const centerX = pxX + (pxW / 2);
//           const centerY = pxY + (pxH / 2);

//           const targetsX = [CANVAS_WIDTH / 2, 0, CANVAS_WIDTH - pxW];
//           const targetsY = [CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT - pxH];

//           prevZones.forEach(otherZ => {
//               if (otherZ.zone_id === z.zone_id) return;
//               const oX = (otherZ.x / 100) * CANVAS_WIDTH;
//               const oY = (otherZ.y / 100) * CANVAS_HEIGHT;
//               targetsX.push(oX, oX + ((otherZ.width / 100) * CANVAS_WIDTH));
//               targetsY.push(oY, oY + ((otherZ.height / 100) * CANVAS_HEIGHT));
//           });

//           for (let target of targetsX) {
//               if (Math.abs(pxX - target) < SNAP_THRESHOLD) { pxX = target; vGuide = target; break; }
//               if (Math.abs(centerX - target) < SNAP_THRESHOLD) { pxX = target - (pxW / 2); vGuide = target; break; }
//           }
//           for (let target of targetsY) {
//               if (Math.abs(pxY - target) < SNAP_THRESHOLD) { pxY = target; hGuide = target; break; }
//               if (Math.abs(centerY - target) < SNAP_THRESHOLD) { pxY = target - (pxH / 2); hGuide = target; break; }
//           }

//           setGuides({ vertical: vGuide, horizontal: hGuide });
//           newX = (pxX / CANVAS_WIDTH) * 100;
//           newY = (pxY / CANVAS_HEIGHT) * 100;

//           newX = Math.max(0, Math.min(100 - z.width, newX));
//           newY = Math.max(0, Math.min(100 - z.height, newY));

//         } else if (dragState.type === 'resize') {
//           newW = dragState.initialW + dxPct;
//           newH = dragState.initialH + dyPct;

//           const pxW = Math.round((newW / 100) * CANVAS_WIDTH);
//           const pxH = Math.round((newH / 100) * CANVAS_HEIGHT);
//           newW = (Math.round(pxW / GRID_STEP) * GRID_STEP / CANVAS_WIDTH) * 100;
//           newH = (Math.round(pxH / GRID_STEP) * GRID_STEP / CANVAS_HEIGHT) * 100;

//           newW = Math.max(5, Math.min(100 - z.x, newW));
//           newH = Math.max(5, Math.min(100 - z.y, newH));
//         }

//         return { ...z, x: newX, y: newY, width: newW, height: newH };
//       }));
//     };

//     const handleMouseUp = () => setDragState(null);
//     window.addEventListener('mousemove', handleMouseMove);
//     window.addEventListener('mouseup', handleMouseUp);
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       window.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [dragState, CANVAS_WIDTH, CANVAS_HEIGHT]);

//   const handleBackgroundClick = (e: React.MouseEvent) => {
//     if (e.target === e.currentTarget) setSelectedZoneId(null);
//   };

//   return (
//     <div className="flex gap-6 h-[calc(100vh-250px)] select-none">

//       {/* SIDEBAR: CONTROLS */}
//       <div className="w-[340px] flex flex-col gap-4 overflow-y-auto pr-2 pb-4">

//         <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
//           <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">General Info</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Layout Name" className="font-bold border-slate-200 h-8 text-sm" /></div>
//           <div className="flex gap-2">
//             <Button variant={orientation === "landscape" ? "default" : "outline"} className="flex-1 h-12 flex-col gap-1 text-[10px]" onClick={() => setOrientation("landscape")}><Monitor size={14} /> Landscape</Button>
//             <Button variant={orientation === "portrait" ? "default" : "outline"} className="flex-1 h-12 flex-col gap-1 text-[10px]" onClick={() => setOrientation("portrait")}> <Smartphone size={14} /> Portrait</Button>
//           </div>
//           <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100" onClick={addZone}><Plus className="w-4 h-4 mr-2" /> Add Zone</Button>
//         </Card>

//         <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
//           <div className="flex items-center gap-2 mb-1"><Palette size={14} className="text-blue-500"/><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Styling</span></div>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-600">Background</span><input type="color" value={canvasBg} onChange={e => setCanvasBg(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0" /></div>
//             <div className="space-y-2"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Shrink Zones (Gap)</span><Badge variant="secondary" className="text-[10px] px-1">{zoneGap}px</Badge></div><input type="range" min="0" max="50" value={zoneGap} onChange={e => setZoneGap(Number(e.target.value))} className="w-full accent-blue-600" /></div>
//             <div className="space-y-2"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Border Radius</span><Badge variant="secondary" className="text-[10px] px-1">{zoneRadius}px</Badge></div><input type="range" min="0" max="100" value={zoneRadius} onChange={e => setZoneRadius(Number(e.target.value))} className="w-full accent-blue-600" /></div>
//           </div>
//         </Card>

//         {activeZone && (
//           <Card className="p-4 border-indigo-200 bg-indigo-50/50 shadow-sm flex-shrink-0 animate-in fade-in slide-in-from-top-2">
//             <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Zone Adjustments</span><span className="text-[9px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded border border-indigo-100">{activeZone.name}</span></div>
//             <div className="flex gap-2 mb-4">
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fullscreen')}><Maximize2 size={12} className="mr-1"/> Fill All</Button>
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fill-width')}><SplitSquareVertical size={12} className="mr-1"/> Fill W</Button>
//               <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700" onClick={() => autoSnap('fill-height')}><SplitSquareHorizontal size={12} className="mr-1"/> Fill H</Button>
//             </div>
//             <div className="grid grid-cols-4 gap-2">
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">X (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.x} onChange={(e) => updateExactProp('x', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">Y (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.y} onChange={(e) => updateExactProp('y', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">W (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.width} onChange={(e) => updateExactProp('width', e.target.value)} /></div>
//               <div><label className="text-[9px] font-bold text-slate-500 mb-1 block">H (%)</label><Input type="number" className="h-7 text-xs bg-white border-indigo-200 px-2" value={activeZone.height} onChange={(e) => updateExactProp('height', e.target.value)} /></div>
//             </div>
//             <p className="text-[9px] text-indigo-400 font-bold mt-3 text-center">Use Arrow Keys to move • Hold SHIFT to resize</p>
//           </Card>
//         )}

//         <Card className="flex-shrink-0 flex flex-col border-slate-200 shadow-sm min-h-[200px]">
//           <div className="p-3 border-b bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Layout Layers ({zones.length})</span></div>
//           <div className="flex-1 overflow-y-auto bg-slate-50/50">
//             <div className="p-3 space-y-2">
//               {zones.map((zone) => (
//                 <div key={zone.zone_id} onClick={() => setSelectedZoneId(zone.zone_id)} className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${selectedZoneId === zone.zone_id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
//                   <div className="flex justify-between items-center mb-1">
//                     <Input value={zone.name} onChange={(e) => setZones(zones.map(z => z.zone_id === zone.zone_id ? {...z, name: e.target.value} : z))} className="h-6 text-xs font-bold border-none bg-transparent px-1 focus-visible:ring-1 shadow-none"/>
//                     <button onClick={(e) => { e.stopPropagation(); setZones(zones.filter(z => z.zone_id !== zone.zone_id)); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
//                   </div>

//                   <div className="flex justify-between items-center mt-2 px-1">
//                     <select
//                       className="text-[9px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded px-1.5 py-1 outline-none text-slate-600"
//                       value={zone.content_type_allowed}
//                       onChange={(e) => setZones(zones.map(z => z.zone_id === zone.zone_id ? {...z, content_type_allowed: e.target.value} : z))}
//                     >
//                       <option value="media">🎥 Media Zone</option>
//                       <option value="widget">🧩 Widget Zone</option>
//                     </select>
//                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">W:{zone.width}% H:{zone.height}%</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* CANVAS AREA */}
//       <div
//         className="flex-1 bg-slate-200/50 rounded-3xl border-2 border-slate-200 relative flex items-center justify-center overflow-auto p-6 lg:p-12"
//         onMouseDown={handleBackgroundClick}
//       >
//         <div
//           className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative transition-all duration-300 border-[6px] border-slate-900 rounded-[8px] mx-auto"
//           onMouseDown={handleBackgroundClick}
//           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: canvasBg, backgroundImage: `radial-gradient(circle, rgba(203, 213, 225, 0.4) 1.5px, transparent 1.5px)`, backgroundSize: `${GRID_STEP}px ${GRID_STEP}px` }}
//         >
//           {guides.vertical !== null && <div className="absolute top-0 bottom-0 w-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]" style={{ left: `${guides.vertical}px` }} />}
//           {guides.horizontal !== null && <div className="absolute left-0 right-0 h-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]" style={{ top: `${guides.horizontal}px` }} />}

//           {zones.map((zone) => {
//             const zoneSchedule = schedule?.zones?.find((z: any) => z.zone_id === zone.zone_id);
//             return (
//               <div
//                 key={zone.zone_id}
//                 onMouseDown={(e) => handlePointerDown(e, zone.zone_id, 'move')}
//                 onClick={(e) => e.stopPropagation()}
//                 className={`absolute group border-2 ${selectedZoneId === zone.zone_id ? 'border-blue-500 ring-2 ring-blue-500/20 z-50 cursor-grabbing shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent cursor-grab hover:border-white/50'}`}
//                 style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.width}%`, height: `${zone.height}%`, zIndex: selectedZoneId === zone.zone_id ? 9999 : zone.z_index }}
//               >
//                 {/* Visual Gap Padding */}
//                 <div className="w-full h-full pointer-events-none" style={{ padding: `${zoneGap}px` }}>
//                   <div className="w-full h-full relative overflow-hidden transition-all shadow-md border border-white/20" style={{ backgroundColor: schedule ? 'transparent' : zone.color, borderRadius: `${zoneRadius}px` }}>

//                      {schedule ? (
//                          <ZonePlayer zone={zone} zoneWidth={(zone.width/100)*CANVAS_WIDTH} scheduleData={zoneSchedule} />
//                      ) : (
//                          <div className="w-full h-full flex flex-col items-center justify-center text-white opacity-90 transition-opacity">
//                              <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                  <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-move"><Move size={14} /></div>
//                                  <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-se-resize"><Maximize size={14} /></div>
//                              </div>
//                              <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none drop-shadow-md text-center px-1">{zone.name}</span>
//                          </div>
//                      )}

//                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase pointer-events-none z-10">Z-{zone.z_index}</div>
//                      <div className="absolute bottom-1 right-1 bg-black/40 px-1.5 py-0.5 rounded text-[8px] font-bold text-white pointer-events-none z-10">{zone.width}% x {zone.height}%</div>
//                   </div>
//                 </div>

//                 {selectedZoneId === zone.zone_id && (
//                   <div
//                     onMouseDown={(e) => handlePointerDown(e, zone.zone_id, 'resize')}
//                     className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-[3px] border-blue-600 rounded-full cursor-se-resize shadow-md hover:scale-110 transition-transform flex items-center justify-center z-[10000]"
//                   />
//                 )}
//               </div>
//           )})}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // MAIN PAGE COMPONENT
// // ============================================================================
// export default function ScreenLayoutPage() {
//   const [layouts, setLayouts] = useState<LayoutType[]>([]);
//   const [editingLayout, setEditingLayout] = useState<LayoutType | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [showJson, setShowJson] = useState(false);

//   const [currentBuilderState, setCurrentBuilderState] = useState<any>(null);

//   const [groupWiseData, setGroupWiseData] = useState<any[]>([]);
//   const [selectedGroup, setSelectedGroup] = useState<any>(null);
//   const schedule = selectedGroup?.schedules?.[0];

//   useEffect(() => { loadData(); }, []);

//   const loadData = async () => {
//     try {
//       const data = await getLayouts();
//       setLayouts(data);
//     } catch (error) { toast.error("Failed to load layouts"); }
//   };

//   const handleStartEdit = async (layout: LayoutType) => {
//     setEditingLayout(layout);
//     setIsCreating(false);

//     try {
//         const res = await api.get(`/layout/shedule/get/${layout.layout_id}`);
//         const apiData = res.data?.data;
//         if (apiData) {
//             setGroupWiseData(apiData.group_wise_data || []);
//             if (apiData.group_wise_data?.length > 0) setSelectedGroup(apiData.group_wise_data[0]);
//         }
//     } catch(e) {}
//   };

//   const handleCreateNew = () => {
//     setIsCreating(true);
//     setEditingLayout(null);
//   };

//   const handleSaveLayout = async () => {
//     if (!currentBuilderState) return;
//     try {
//       saveLayout(currentBuilderState);
//       await loadData();
//       // setEditingLayout(null);
//       // setIsCreating(false);
//       // toast.success(`Layout "${currentBuilderState.name}" saved successfully.`);
//     } catch (error) { toast.error("Error saving layout"); }
//   };

//   const handleDeleteLayout = async (layoutId: string) => {
//     if (!confirm("Are you sure you want to delete this layout?")) return;
//     try {
//       deleteLayout(layoutId);
//       await loadData();
//       toast.success("Layout deleted");
//     } catch (error) { toast.error("Error deleting layout"); }
//   };

//   const displayState = currentBuilderState || editingLayout || (isCreating ? null : layouts[0] || null);

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <main className="flex-1 p-6 overflow-auto">

//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <LayoutIcon className="w-5 h-5" />
//             <h1 className="text-2xl font-semibold">Screen Layout</h1>
//           </div>
//           {!isCreating && !editingLayout && (
//             <Button onClick={handleCreateNew}>
//               <Plus className="w-4 h-4 mr-2" /> New Layout
//             </Button>
//           )}
//         </div>

//         {isCreating || editingLayout ? (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <Button variant="outline" onClick={() => { setIsCreating(false); setEditingLayout(null); }}>
//                    Back to List
//                 </Button>
//                 {groupWiseData.length > 0 && (
//                     <select className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none" value={selectedGroup?.group_id} onChange={(e) => setSelectedGroup(groupWiseData.find(g => g.group_id === e.target.value))}>
//                       {groupWiseData.map(g => <option key={g.group_id} value={g.group_id}>Preview Group: {g.group_id.slice(0,6)}</option>)}
//                     </select>
//                 )}
//               </div>
//               <Button onClick={handleSaveLayout}><Save className="w-4 h-4 mr-2"/> Finish & Save</Button>
//             </div>

//             {/* BUILDER */}
//             <LayoutBuilder
//                 initialLayout={editingLayout || undefined}
//                 schedule={schedule}
//                 onChange={setCurrentBuilderState}
//                 onSave={handleSaveLayout}
//             />

//             {/* RESTORED JSON CONSOLE */}
//             {displayState && (
//               <Card className="mt-8">
//                 <CardHeader className="pb-2 flex flex-row items-center justify-between">
//                   <CardTitle className="text-lg flex items-center gap-2"><Code className="w-5 h-5" /> Layout JSON Structure</CardTitle>
//                   <Button variant="outline" size="sm" onClick={() => setShowJson(!showJson)}>
//                     {showJson ? "Hide" : "Show"} JSON
//                   </Button>
//                 </CardHeader>
//                 {showJson && (
//                   <CardContent>
//                     <div className="h-80 overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-lg">
//                       <pre className="text-xs">{JSON.stringify(displayState, null, 2)}</pre>
//                     </div>
//                     <div className="mt-3 flex gap-2">
//                       <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(displayState, null, 2)); toast.success("JSON copied to clipboard"); }}>
//                         Copy to Clipboard
//                       </Button>
//                     </div>
//                   </CardContent>
//                 )}
//               </Card>
//             )}

//           </div>
//         ) : (
//           <div className="space-y-6">
//             {layouts.length > 0 ? (
//               <div className="rounded-md border bg-white mb-6">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Resolution</TableHead>
//                       <TableHead>Orientation</TableHead>
//                       <TableHead>Zones</TableHead>
//                       <TableHead>Zone Types</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead className="w-12">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {layouts.map((layout) => {
//                       const mediaZones = layout.zones.filter((z) => z.content_type_allowed === "media").length;
//                       const widgetZones = layout.zones.filter((z) => z.content_type_allowed === "widget").length;

//                       return (
//                         <TableRow key={layout.layout_id}>
//                           <TableCell className="font-medium">{layout.name}</TableCell>
//                           <TableCell>{layout.resolution}</TableCell>
//                           <TableCell className="capitalize">{layout.orientation}</TableCell>
//                           <TableCell>{layout.zones.length} zones</TableCell>
//                           <TableCell>
//                             <div className="flex gap-2">
//                               {mediaZones > 0 && <Badge variant="default" className="text-xs"><Film className="w-3 h-3 mr-1" />{mediaZones} Media</Badge>}
//                               {widgetZones > 0 && <Badge variant="secondary" className="text-xs"><LayoutGrid className="w-3 h-3 mr-1" />{widgetZones} Widget</Badge>}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant={layout.is_active ? "default" : "secondary"}>{layout.is_active ? "Active" : "Inactive"}</Badge>
//                           </TableCell>
//                           <TableCell>
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem onClick={() => handleStartEdit(layout)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
//                                 <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteLayout(layout.layout_id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </div>
//             ) : (
//               <div className="text-center py-12 border rounded-md mb-6 bg-white">
//                 <LayoutIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Layouts Yet</h3>
//                 <p className="text-muted-foreground mb-4">Create your first screen layout to get started.</p>
//                 <Button onClick={() => setIsCreating(true)}><Plus className="w-4 h-4 mr-2" /> Create Layout</Button>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Hls from "hls.js";
import api from "@/api";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Layout as LayoutIcon,
  Code,
  Film,
  LayoutGrid,
  Monitor,
  Smartphone,
  Move,
  Maximize,
  Save,
  Palette,
  Maximize2,
  SplitSquareHorizontal,
  SplitSquareVertical,
} from "lucide-react";

import {
  getLayouts,
  saveLayout,
  deleteLayout,
  type Layout as LayoutType,
} from "@/lib/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogFooter, DialogHeader } from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRole } from "@/helpers";
import { useFeature } from "@/context/hooks/useFeature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// INTERNAL COMPONENTS (PREVIEW PLAYERS)
// ============================================================================

const HlsPlayer = ({ url, muted }: { url: string; muted: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported() && url.includes(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
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

const WidgetRenderer = ({ item, zoneWidth, zoneHeight }: any) => {
  const [time, setTime] = useState(new Date());
  const config = item.widget_config || {};
  const widgetType = item.content_data?.type;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    const base = Math.min(zoneWidth, zoneHeight);
    return (
      <div style={containerStyle}>
        <div
          style={{
            fontSize: base * 0.12,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {time.toLocaleDateString("en-US", { month: "short" })}
        </div>
        <div
          style={{ fontSize: base * 0.35, lineHeight: 1.1, fontWeight: "bold" }}
        >
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
          alt="Logo"
        />
      </div>
    );
  }
  return <div style={containerStyle}>{widgetType}</div>;
};

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
    if (activeItem.content_type === "carousel") {
      const subItems = activeItem.content_data?.items || [];
      const timer = setTimeout(
        () => {
          if (subIndex < subItems.length - 1) setSubIndex((s) => s + 1);
          else nextItem();
        },
        (subItems[subIndex]?.Ad?.duration || 10) * 1000,
      );
      return () => clearTimeout(timer);
    }

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

  if (!activeItem)
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[10px] text-white/20 uppercase font-black tracking-widest">
        {zone.name}
      </div>
    );
  if (activeItem.content_type === "widget")
    return (
      <WidgetRenderer
        item={activeItem}
        zoneWidth={zoneWidth}
        zoneHeight={zoneHeight}
      />
    );
  if (activeItem.content_type === "live_content")
    return (
      <HlsPlayer url={activeItem.content_data.url} muted={zone.is_muted} />
    );

  const mediaUrl =
    activeItem.content_type === "carousel"
      ? activeItem.content_data.items[subIndex]?.Ad?.url
      : activeItem.content_data?.url;
  const isVideo = mediaUrl?.toLowerCase().includes(".mp4");

  return (
    <div className="w-full h-full bg-black relative">
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
          alt=""
        />
      )}
      {activeItem.content_type === "live_content" && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse">
          LIVE
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NATIVE DRAG & DROP LAYOUT BUILDER
// ============================================================================
interface BuilderProps {
  initialLayout?: any;
  schedule?: any;
  onChange: (layout: any) => void;
}

function LayoutBuilder({ initialLayout, schedule, onChange }: BuilderProps) {
  const [name, setName] = useState(initialLayout?.name || "New Layout");
  const [zones, setZones] = useState<any[]>(initialLayout?.zones || []);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [orientation, setOrientation] = useState(
    initialLayout?.orientation || "landscape",
  );

  // MAIN LAYOUT LEVEL: background_color
  const [canvasBg, setCanvasBg] = useState(
    initialLayout?.background_color || "#000000",
  );

  // GLOBALLY CONTROLLED STYLES (Mapped to zones on save)
  const [zoneGap, setZoneGap] = useState(0);
  const [globalBorderRadius, setGlobalBorderRadius] = useState(
    initialLayout?.zones?.[0]?.border_radius || 0,
  );

  const [dragState, setDragState] = useState<{
    id: string;
    type: "move" | "resize";
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  const [guides, setGuides] = useState<{
    vertical: number | null;
    horizontal: number | null;
  }>({ vertical: null, horizontal: null });

  const CANVAS_WIDTH = orientation === "landscape" ? 800 : 360;
  const CANVAS_HEIGHT = orientation === "landscape" ? 450 : 640;
  const GRID_STEP = 10;
  const SNAP_THRESHOLD = 5;

  const activeZone = useMemo(
    () => zones.find((z) => z.zone_id === selectedZoneId),
    [zones, selectedZoneId],
  );

  // --- CORE GAP-BAKING & RADIUS MAPPING LOGIC ---
  useEffect(() => {
    const bakedZones = zones.map((z) => {
      // Convert layout percentages to pixels
      const pxX = (z.x / 100) * CANVAS_WIDTH;
      const pxY = (z.y / 100) * CANVAS_HEIGHT;
      const pxW = (z.width / 100) * CANVAS_WIDTH;
      const pxH = (z.height / 100) * CANVAS_HEIGHT;

      // Shrink by the gap amount on all sides
      const newPxX = pxX + zoneGap;
      const newPxY = pxY + zoneGap;
      const newPxW = Math.max(1, pxW - zoneGap * 2);
      const newPxH = Math.max(1, pxH - zoneGap * 2);

      // Map back to percentages AND inject the global border radius into every individual zone
      return {
        ...z,
        x: Number(((newPxX / CANVAS_WIDTH) * 100).toFixed(2)),
        y: Number(((newPxY / CANVAS_HEIGHT) * 100).toFixed(2)),
        width: Number(((newPxW / CANVAS_WIDTH) * 100).toFixed(2)),
        height: Number(((newPxH / CANVAS_HEIGHT) * 100).toFixed(2)),
        border_radius: globalBorderRadius, // 👈 Added inside every single zone
      };
    });

    onChange({
      layout_id: initialLayout?.layout_id || null,
      name,
      resolution: orientation === "landscape" ? "1920x1080" : "1080x1920",
      orientation,
      is_active: true,
      background_color: canvasBg, // 👈 Kept at the main layout level
      zones: bakedZones, // Zones now contain border_radius, and gap is mathematically removed
      version: 1,
      is_published: true,
    });
  }, [name, zones, orientation, canvasBg, zoneGap, globalBorderRadius]); // Trigger save payload on any global style change

  const addZone = () => {
    const newZone = {
      zone_id: crypto.randomUUID(),
      name: `Zone ${zones.length + 1}`,
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      z_index: zones.length + 1,
      content_type_allowed: "media",
      color:
        zones.length % 3 === 0
          ? "#3b82f6"
          : zones.length % 3 === 1
            ? "#22c55e"
            : "#f59e0b",
      is_muted: true,
    };
    setZones([...zones, newZone]);
    setSelectedZoneId(newZone.zone_id);
  };

  const updateExactProp = (
    property: "x" | "y" | "width" | "height",
    value: string,
  ) => {
    if (!selectedZoneId) return;
    const numValue = Math.max(0, Math.min(100, Number(value) || 0));
    setZones(
      zones.map((z) =>
        z.zone_id === selectedZoneId ? { ...z, [property]: numValue } : z,
      ),
    );
  };

  const autoSnap = (type: "fullscreen" | "fill-width" | "fill-height") => {
    if (!selectedZoneId) return;
    setZones(
      zones.map((z) => {
        if (z.zone_id !== selectedZoneId) return z;
        if (type === "fullscreen")
          return { ...z, x: 0, y: 0, width: 100, height: 100 };
        if (type === "fill-width") return { ...z, x: 0, width: 100 };
        if (type === "fill-height") return { ...z, y: 0, height: 100 };
        return z;
      }),
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      )
        return;
      if (!selectedZoneId) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const stepX = (GRID_STEP / CANVAS_WIDTH) * 100;
        const stepY = (GRID_STEP / CANVAS_HEIGHT) * 100;

        setZones((prevZones) =>
          prevZones.map((z) => {
            if (z.zone_id !== selectedZoneId) return z;
            let newX = z.x;
            let newY = z.y;
            let newW = z.width;
            let newH = z.height;

            if (e.shiftKey) {
              if (e.key === "ArrowUp") newH -= stepY;
              if (e.key === "ArrowDown") newH += stepY;
              if (e.key === "ArrowLeft") newW -= stepX;
              if (e.key === "ArrowRight") newW += stepX;
            } else {
              if (e.key === "ArrowUp") newY -= stepY;
              if (e.key === "ArrowDown") newY += stepY;
              if (e.key === "ArrowLeft") newX -= stepX;
              if (e.key === "ArrowRight") newX += stepX;
            }

            newX = Math.max(0, Math.min(100 - z.width, newX));
            newY = Math.max(0, Math.min(100 - z.height, newY));
            newW = Math.max(5, Math.min(100 - z.x, newW));
            newH = Math.max(5, Math.min(100 - z.y, newH));

            return { ...z, x: newX, y: newY, width: newW, height: newH };
          }),
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedZoneId, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const handlePointerDown = (
    e: React.MouseEvent,
    zoneId: string,
    type: "move" | "resize",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const zone = zones.find((z) => z.zone_id === zoneId);
    if (!zone) return;

    setSelectedZoneId(zoneId);
    setDragState({
      id: zoneId,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialX: zone.x,
      initialY: zone.y,
      initialW: zone.width,
      initialH: zone.height,
    });
  };

  useEffect(() => {
    if (!dragState) {
      setGuides({ vertical: null, horizontal: null });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      const dxPct = (dx / CANVAS_WIDTH) * 100;
      const dyPct = (dy / CANVAS_HEIGHT) * 100;

      setZones((prevZones) =>
        prevZones.map((z) => {
          if (z.zone_id !== dragState.id) return z;

          let newX = z.x;
          let newY = z.y;
          let newW = z.width;
          let newH = z.height;
          let vGuide = null;
          let hGuide = null;

          if (dragState.type === "move") {
            newX = dragState.initialX + dxPct;
            newY = dragState.initialY + dyPct;

            let pxX = (newX / 100) * CANVAS_WIDTH;
            let pxY = (newY / 100) * CANVAS_HEIGHT;
            const pxW = (z.width / 100) * CANVAS_WIDTH;
            const pxH = (z.height / 100) * CANVAS_HEIGHT;
            const centerX = pxX + pxW / 2;
            const centerY = pxY + pxH / 2;

            const targetsX = [CANVAS_WIDTH / 2, 0, CANVAS_WIDTH - pxW];
            const targetsY = [CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT - pxH];

            prevZones.forEach((otherZ) => {
              if (otherZ.zone_id === z.zone_id) return;
              const oX = (otherZ.x / 100) * CANVAS_WIDTH;
              const oY = (otherZ.y / 100) * CANVAS_HEIGHT;
              targetsX.push(oX, oX + (otherZ.width / 100) * CANVAS_WIDTH);
              targetsY.push(oY, oY + (otherZ.height / 100) * CANVAS_HEIGHT);
            });

            for (let target of targetsX) {
              if (Math.abs(pxX - target) < SNAP_THRESHOLD) {
                pxX = target;
                vGuide = target;
                break;
              }
              if (Math.abs(centerX - target) < SNAP_THRESHOLD) {
                pxX = target - pxW / 2;
                vGuide = target;
                break;
              }
            }
            for (let target of targetsY) {
              if (Math.abs(pxY - target) < SNAP_THRESHOLD) {
                pxY = target;
                hGuide = target;
                break;
              }
              if (Math.abs(centerY - target) < SNAP_THRESHOLD) {
                pxY = target - pxH / 2;
                hGuide = target;
                break;
              }
            }

            setGuides({ vertical: vGuide, horizontal: hGuide });
            newX = (pxX / CANVAS_WIDTH) * 100;
            newY = (pxY / CANVAS_HEIGHT) * 100;

            newX = Math.max(0, Math.min(100 - z.width, newX));
            newY = Math.max(0, Math.min(100 - z.height, newY));
          } else if (dragState.type === "resize") {
            newW = dragState.initialW + dxPct;
            newH = dragState.initialH + dyPct;

            const pxW = Math.round((newW / 100) * CANVAS_WIDTH);
            const pxH = Math.round((newH / 100) * CANVAS_HEIGHT);
            newW =
              ((Math.round(pxW / GRID_STEP) * GRID_STEP) / CANVAS_WIDTH) * 100;
            newH =
              ((Math.round(pxH / GRID_STEP) * GRID_STEP) / CANVAS_HEIGHT) * 100;

            newW = Math.max(5, Math.min(100 - z.x, newW));
            newH = Math.max(5, Math.min(100 - z.y, newH));
          }

          return { ...z, x: newX, y: newY, width: newW, height: newH };
        }),
      );
    };

    const handleMouseUp = () => setDragState(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedZoneId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full select-none">
      {/* SIDEBAR: CONTROLS */}
      <div className="w-full lg:w-[30%] flex flex-col gap-4 overflow-y-auto lg:pr-2 pb-4 max-h-full">
        <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              General Info
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Layout Name"
              className="font-bold border-slate-200 h-8 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={orientation === "landscape" ? "default" : "outline"}
              className="flex-1 h-12 flex-col gap-1 text-[10px]"
              onClick={() => setOrientation("landscape")}
            >
              <Monitor size={14} /> Landscape
            </Button>
            <Button
              variant={orientation === "portrait" ? "default" : "outline"}
              className="flex-1 h-12 flex-col gap-1 text-[10px]"
              onClick={() => setOrientation("portrait")}
            >
              {" "}
              <Smartphone size={14} /> Portrait
            </Button>
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100"
            onClick={addZone}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Zone
          </Button>
        </Card>

        {/* 2. Global Styling (Now includes Border Radius) */}
        <Card className="p-4 space-y-4 border-slate-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Palette size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Global Styling
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Background
              </span>
              <input
                type="color"
                value={canvasBg}
                onChange={(e) => setCanvasBg(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-none p-0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  Shrink Zones (Gap)
                </span>
                <Badge variant="secondary" className="text-[10px] px-1">
                  {zoneGap}px
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={zoneGap}
                onChange={(e) => setZoneGap(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Border Radius moved here -> applies to all zones globally in UI, saves individually */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  Border Radius
                </span>
                <Badge variant="secondary" className="text-[10px] px-1">
                  {globalBorderRadius}px
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={globalBorderRadius}
                onChange={(e) => setGlobalBorderRadius(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </Card>

        {/* 3. Selected Zone Adjustments */}
        {activeZone && (
          <Card className="p-4 border-indigo-200 bg-indigo-50/50 shadow-sm flex-shrink-0 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Zone Adjustments
              </span>
              <span className="text-[9px] font-bold text-indigo-400 bg-white px-2 py-0.5 rounded border border-indigo-100 w-fit">
                {activeZone.name}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <Button
                size="sm"
                variant="outline"
                className=" h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700"
                onClick={() => autoSnap("fullscreen")}
              >
                <Maximize2 size={12} className="mr-1" /> Fill All
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700"
                onClick={() => autoSnap("fill-width")}
              >
                <SplitSquareVertical size={12} className="mr-1" /> Fill W
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[10px] bg-white border-indigo-200 hover:bg-indigo-100 text-indigo-700"
                onClick={() => autoSnap("fill-height")}
              >
                <SplitSquareHorizontal size={12} className="mr-1" /> Fill H
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">
                  X (%)
                </label>
                <Input
                  type="number"
                  className="h-7 text-xs bg-white border-indigo-200 px-2"
                  value={activeZone.x}
                  onChange={(e) => updateExactProp("x", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">
                  Y (%)
                </label>
                <Input
                  type="number"
                  className="h-7 text-xs bg-white border-indigo-200 px-2"
                  value={activeZone.y}
                  onChange={(e) => updateExactProp("y", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">
                  W (%)
                </label>
                <Input
                  type="number"
                  className="h-7 text-xs bg-white border-indigo-200 px-2"
                  value={activeZone.width}
                  onChange={(e) => updateExactProp("width", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 mb-1 block">
                  H (%)
                </label>
                <Input
                  type="number"
                  className="h-7 text-xs bg-white border-indigo-200 px-2"
                  value={activeZone.height}
                  onChange={(e) => updateExactProp("height", e.target.value)}
                />
              </div>
            </div>
            <p className="text-[9px] text-indigo-400 font-bold mt-3 text-center">
              Use Arrow Keys to move • Hold SHIFT to resize
            </p>
          </Card>
        )}

        {/* 4. Layers and Zones List */}
        <Card className="flex-shrink-0 flex flex-col border-slate-200 shadow-sm min-h-[200px]">
          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Layout Layers ({zones.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="p-3 space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.zone_id}
                  onClick={() => setSelectedZoneId(zone.zone_id)}
                  className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${selectedZoneId === zone.zone_id ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <Input
                      value={zone.name}
                      onChange={(e) =>
                        setZones(
                          zones.map((z) =>
                            z.zone_id === zone.zone_id
                              ? { ...z, name: e.target.value }
                              : z,
                          ),
                        )
                      }
                      className="h-6 text-xs font-bold border-none bg-transparent px-1 focus-visible:ring-1 shadow-none"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZones(
                          zones.filter((z) => z.zone_id !== zone.zone_id),
                        );
                      }}
                      className="text-slate-300 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 px-1">
                    <select
                      className="text-[9px] font-bold uppercase tracking-widest bg-white border border-slate-200 rounded px-1.5 py-1 outline-none text-slate-600 w-full sm:w-auto"
                      value={zone.content_type_allowed}
                      onChange={(e) =>
                        setZones(
                          zones.map((z) =>
                            z.zone_id === zone.zone_id
                              ? { ...z, content_type_allowed: e.target.value }
                              : z,
                          ),
                        )
                      }
                    >
                      <option value="media">🎥 Media Zone</option>
                      <option value="widget">🧩 Widget Zone</option>
                    </select>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      W:{zone.width}% H:{zone.height}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* CANVAS AREA */}
      <div
        className="flex-1 bg-slate-200/50  rounded-3xl border-2 border-slate-200 relative flex items-start justify-center overflow-auto p-3 sm:p-6 lg:p-12 min-h-[500px]"
        onMouseDown={handleBackgroundClick}
      >
        <div
          className="shadow-[0_20px_50px_rgba(0,0,0,0.15)]  relative transition-all duration-300 border-[6px] border-slate-900 rounded-[8px] mx-auto  overflow-hidden"
          onMouseDown={handleBackgroundClick}
          // style={{
          //   width: CANVAS_WIDTH,
          //   height: CANVAS_HEIGHT,
          //   backgroundColor: canvasBg,
          //   backgroundImage: `radial-gradient(circle, rgba(203, 213, 225, 0.4) 1.5px, transparent 1.5px)`,
          //   backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
          // }}
          style={{
            width: "100%",
            maxWidth: `${CANVAS_WIDTH}px`,
            aspectRatio: orientation === "landscape" ? "16 / 9" : "9 / 16",
            height: "auto",
            backgroundColor: canvasBg,
            backgroundImage: `radial-gradient(circle, rgba(203, 213, 225, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: `${GRID_STEP}px ${GRID_STEP}px`,
          }}
        >
          {guides.vertical !== null && (
            <div
              className="absolute top-0 bottom-0 w-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]"
              style={{ left: `${guides.vertical}px` }}
            />
          )}
          {guides.horizontal !== null && (
            <div
              className="absolute left-0 right-0 h-[1px] bg-blue-500 z-[9999] pointer-events-none shadow-[0_0_4px_rgba(59,130,246,0.8)]"
              style={{ top: `${guides.horizontal}px` }}
            />
          )}

          {zones.map((zone) => {
            const zoneSchedule = schedule?.zones?.find(
              (z: any) => z.zone_id === zone.zone_id,
            );
            return (
              <div
                key={zone.zone_id}
                onMouseDown={(e) => handlePointerDown(e, zone.zone_id, "move")}
                onClick={(e) => e.stopPropagation()}
                className={`absolute group border-2 ${selectedZoneId === zone.zone_id ? "border-blue-500 ring-2 ring-blue-500/20 z-50 cursor-grabbing shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-transparent cursor-grab hover:border-white/50"}`}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  zIndex: selectedZoneId === zone.zone_id ? 9999 : zone.z_index,
                }}
              >
                {/* Visual Gap Padding */}
                <div
                  className="w-full h-full pointer-events-none"
                  style={{ padding: `${zoneGap}px` }}
                >
                  {/* Globally controlled, but applies to individual containers */}
                  <div
                    className="w-full h-full relative overflow-hidden transition-all shadow-md border border-white/20"
                    style={{
                      backgroundColor: schedule ? "transparent" : zone.color,
                      borderRadius: `${globalBorderRadius}px`,
                    }}
                  >
                    {schedule ? (
                      <ZonePlayer
                        zone={zone}
                        zoneWidth={(zone.width / 100) * CANVAS_WIDTH}
                        scheduleData={zoneSchedule}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white opacity-90 transition-opacity">
                        <div className="flex gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-move">
                            <Move size={14} />
                          </div>
                          <div className="p-1 bg-black/40 rounded pointer-events-auto cursor-se-resize">
                            <Maximize size={14} />
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest pointer-events-none drop-shadow-md text-center px-1">
                          {zone.name}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase pointer-events-none z-10">
                      Z-{zone.z_index}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/40 px-1.5 py-0.5 rounded text-[8px] font-bold text-white pointer-events-none z-10">
                      {zone.width}% x {zone.height}%
                    </div>
                  </div>
                </div>

                {selectedZoneId === zone.zone_id && (
                  <div
                    onMouseDown={(e) =>
                      handlePointerDown(e, zone.zone_id, "resize")
                    }
                    className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-[3px] border-blue-600 rounded-full cursor-se-resize shadow-md hover:scale-110 transition-transform flex items-center justify-center z-[10000]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function ScreenLayoutPage() {
  const [layouts, setLayouts] = useState<LayoutType[]>([]);
  const [editingLayout, setEditingLayout] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const [currentBuilderState, setCurrentBuilderState] = useState<any>(null);

  const [groupWiseData, setGroupWiseData] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const schedule = selectedGroup?.schedules?.[0];

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await api.get("/ads/clients");
      setClients(res.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [userRole, setUserRole] = useState<string>("");
  useEffect(() => {
    const role = getRole();
    setUserRole(role || "");
  }, []);

  const loadData = async () => {
    try {
      const data = await getLayouts();
      setLayouts(data);
    } catch (error) {
      toast.error("Failed to load layouts");
    }
  };

  const handleStartEdit = async (layout: any) => {
    setEditingLayout(layout);
    setIsCreating(false);

    // try {
    //     const res = await api.get(`/layout/shedule/get/${layout.layout_id}`);
    //     const apiData = res.data?.data;
    //     if (apiData) {
    //         setGroupWiseData(apiData.group_wise_data || []);
    //         if (apiData.group_wise_data?.length > 0) setSelectedGroup(apiData.group_wise_data[0]);
    //     }
    // } catch(e) {}
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingLayout(null);
  };

  const handleSaveLayout = async () => {
    if (!currentBuilderState) return;

    // VALIDATION
    if (!currentBuilderState.zones || currentBuilderState.zones.length === 0) {
      toast.error("Please add at least one zone before saving layout.");
      return;
    }

    const invalidZones = currentBuilderState.zones.some(
      (z: any) => z.width <= 0 || z.height <= 0,
    );

    if (invalidZones) {
      toast.error("Invalid zone size detected.");
      return;
    }

    try {
      let payload;
      if (selectedClient) {
        payload = {
          ...currentBuilderState,
          client_id: selectedClient,
        };
      } else {
        payload = {
          ...currentBuilderState,
        };
      }

      // console.log("payload", payload);
      await saveLayout(payload);
      await loadData();
      setEditingLayout(null);
      setIsCreating(false);
      toast.success(`Layout "${currentBuilderState.name}" saved successfully.`);
    } catch (error) {
      toast.error(error?.error || "Error saving layout");
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<string | null>(null);

  // const handleDeleteLayout = async (layoutId: string) => {
  //   if (!confirm("Are you sure you want to delete this layout?")) return;
  //   try {
  //     await deleteLayout(layoutId);
  //     await loadData();
  //     toast.success("Layout deleted");
  //   } catch (error) {
  //     toast.error("Error deleting layout");
  //   }
  // };
  const handleDeleteLayout = async () => {
    if (!layoutToDelete) return;

    try {
      await deleteLayout(layoutToDelete);
      await loadData();
      toast.success("Layout deleted");
    } catch (error) {
      toast.error(error?.error || "Error deleting layout");
    } finally {
      setDeleteDialogOpen(false);
      setLayoutToDelete(null);
    }
  };

  const displayState =
    currentBuilderState ||
    editingLayout ||
    (isCreating ? null : layouts[0] || null);

  const { limit } = useFeature();

  const maxLayouts = limit("MAX_LAYOUTS");
  const currentLayouts = layouts.length;

  const canAddLayout = currentLayouts < maxLayouts;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1 overflow-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutIcon className="w-5 h-5" />
            <h1 className="text-2xl font-semibold">Screen Layout</h1>
          </div>
          {!isCreating && !editingLayout && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block w-full sm:w-auto">
                    <div>
                      {userRole === "Admin" ? (
                        <Button
                          // disabled={!canAddLayout}
                          onClick={() => {
                            setClientDialogOpen(true);
                            fetchClients();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Layout
                        </Button>
                      ) : (
                        <Button
                          disabled={!canAddLayout}
                          onClick={handleCreateNew}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Layout
                        </Button>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>

                {!canAddLayout && (
                  <TooltipContent>
                    <p>
                      You reached your layout limit ({maxLayouts}). Upgrade to
                      add more.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          <>
            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Select Client</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  {loadingClients ? (
                    <p className="text-sm text-gray-500">Loading clients...</p>
                  ) : (
                    <Select onValueChange={(value) => setSelectedClient(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>

                      <SelectContent>
                        {clients.map((client: any) => {
                          const tierName =
                            client?.Subscriptions?.[0]?.Tier?.name || "No Tier";

                          return (
                            <SelectItem
                              key={client.client_id}
                              value={client.client_id}
                            >
                              {client.client_name || client.name} ({tierName})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientDialogOpen(false);
                      setSelectedClient(null);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    disabled={!selectedClient}
                    onClick={() => {
                      handleCreateNew();
                      setClientDialogOpen(false);
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        </div>

        {isCreating || editingLayout ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingLayout(null);
                  }}
                >
                  Back to List
                </Button>
                {groupWiseData.length > 0 && (
                  <select
                    className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none"
                    value={selectedGroup?.group_id}
                    onChange={(e) =>
                      setSelectedGroup(
                        groupWiseData.find(
                          (g) => g.group_id === e.target.value,
                        ),
                      )
                    }
                  >
                    {groupWiseData.map((g) => (
                      <option key={g.group_id} value={g.group_id}>
                        Preview Group: {g.group_id.slice(0, 6)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Button onClick={handleSaveLayout}>
                <Save className="w-4 h-4 mr-2" /> Save Layout
              </Button>
            </div>

            {/* BUILDER */}
            <LayoutBuilder
              initialLayout={editingLayout || undefined}
              schedule={schedule}
              onChange={setCurrentBuilderState}
            />

            {/* RESTORED JSON CONSOLE */}
            {displayState && (
              <Card className="mt-8">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" /> API Payload Structure (Gap
                    Baked-In)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJson(!showJson)}
                  >
                    {showJson ? "Hide" : "Show"} JSON
                  </Button>
                </CardHeader>
                {showJson && (
                  <CardContent>
                    <div className="h-80 overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-lg">
                      <pre className="text-xs">
                        {JSON.stringify(displayState, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(displayState, null, 2),
                          );
                          toast.success("JSON copied to clipboard");
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {layouts.length > 0 ? (
              <div className="rounded-md border bg-white mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Resolution</TableHead>
                      <TableHead>Orientation</TableHead>
                      <TableHead>Zones</TableHead>
                      <TableHead>Zone Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layouts.map((layout) => {
                      const mediaZones = layout.zones.filter(
                        (z) => z.content_type_allowed === "media",
                      ).length;
                      const widgetZones = layout.zones.filter(
                        (z) => z.content_type_allowed === "widget",
                      ).length;

                      return (
                        <TableRow key={layout.layout_id}>
                          <TableCell className="font-medium">
                            {layout.name}
                          </TableCell>
                          <TableCell>{layout.resolution}</TableCell>
                          <TableCell className="capitalize">
                            {layout.orientation}
                          </TableCell>
                          <TableCell>{layout.zones.length} zones</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {mediaZones > 0 && (
                                <Badge variant="default" className="text-xs">
                                  <Film className="w-3 h-3 mr-1" />
                                  {mediaZones} Media
                                </Badge>
                              )}
                              {widgetZones > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <LayoutGrid className="w-3 h-3 mr-1" />
                                  {widgetZones} Widget
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                layout.is_active ? "default" : "secondary"
                              }
                            >
                              {layout.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStartEdit(layout)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  // onClick={() =>
                                  //   handleDeleteLayout(layout.layout_id)
                                  // }
                                  onClick={() => {
                                    setLayoutToDelete(layout.layout_id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md mb-6 bg-white">
                <LayoutIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Layouts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first screen layout to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Layout
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Layout</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this layout? This action cannot be
              undone.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setLayoutToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button variant="destructive" onClick={handleDeleteLayout}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
