"use client";

import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/pages/AddToSchedule/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Monitor,
  Plus,
  Trash2,
  ChevronRight,
  Film,
  LayoutGrid,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  Play,
  Image,
  Radio,
  X,
  CalendarDays,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Layout,
  type Zone,
  type Ad,
  type Carousel,
  type LiveContent,
  type ContentItem,
  type ZoneContent,
  type ScheduleConfig,
  type DeviceGroup,
  type Widget,
  getLayouts,
  sampleAds,
  sampleCarousels,
  sampleLiveContent,
  sampleGroups,
  defaultWidgets,
  saveSchedule,
  generateId,
  formatDuration,
  timeToMinutes,
  minutesToTime,
} from "@/lib/store";
import api from "@/api";

type DateType = "today" | "specific_date" | "one_week" | "one_month";
type Step = "select_layout" | "configure_layout";

export default function ScheduleAddPage() {
  const [currentStep, setCurrentStep] = useState<Step>("select_layout");
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);

  const [dateType, setDateType] = useState<DateType>("today");
  const [specificDate, setSpecificDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: "09:00", end: "18:00" },
  ]);

  const [zoneContents, setZoneContents] = useState<{
    [zoneId: string]: ZoneContent;
  }>({});
  const [zoneMuteSettings, setZoneMuteSettings] = useState<{
    [zoneId: string]: boolean;
  }>({});

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState("");

  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  const [contentType, setContentType] = useState<"ad" | "carousel" | "live">(
    "ad",
  );

  // useEffect(() => {
  //   setLayouts(getLayouts());
  // }, []);
  useEffect(() => {
    const fetchLayouts = async () => {
      const data = await getLayouts();
      console.log("data", data);
      setLayouts(data);
    };

    fetchLayouts();
  }, []);

  useEffect(() => {
    if (selectedLayout) {
      const initialMuteSettings: { [zoneId: string]: boolean } = {};
      const initialContents: { [zoneId: string]: ZoneContent } = {};

      selectedLayout.zones.forEach((zone) => {
        initialMuteSettings[zone.zone_id] = zone.is_muted;
        initialContents[zone.zone_id] = {
          zone_id: zone.zone_id,
          content_type_allowed: zone.content_type_allowed,
          content_items: zone.content_type_allowed === "media" ? [] : undefined,
          selected_widgets:
            zone.content_type_allowed === "widget" ? [] : undefined,
        };
      });

      setZoneMuteSettings(initialMuteSettings);
      setZoneContents(initialContents);
    }
  }, [selectedLayout]);

  const getDateRange = () => {
    const today = new Date();
    let startDate = today.toISOString().split("T")[0];
    let endDate = startDate;

    switch (dateType) {
      case "specific_date":
        startDate = specificDate || startDate;
        endDate = startDate;
        break;
      case "one_week":
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        break;
      case "one_month":
        endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        break;
    }

    return { startDate, endDate };
  };

  const globalTimeInfo = useMemo(() => {
    if (timeSlots.length === 0)
      return { minTime: "00:00", maxTime: "23:59", totalMinutes: 0 };

    let minMins = Infinity;
    let maxMins = 0;
    let totalMins = 0;

    timeSlots.forEach((slot) => {
      const startMins = timeToMinutes(slot.start);
      const endMins = timeToMinutes(slot.end);
      minMins = Math.min(minMins, startMins);
      maxMins = Math.max(maxMins, endMins);
      totalMins += endMins - startMins;
    });

    return {
      minTime: minutesToTime(minMins === Infinity ? 0 : minMins),
      maxTime: minutesToTime(maxMins),
      totalMinutes: totalMins,
    };
  }, [timeSlots]);

  const applyTimePreset = (preset: "business" | "peak" | "allday") => {
    switch (preset) {
      case "business":
        setTimeSlots([{ start: "09:00", end: "17:00" }]);
        break;
      case "peak":
        setTimeSlots([
          { start: "11:00", end: "14:00" },
          { start: "17:00", end: "21:00" },
        ]);
        break;
      case "allday":
        setTimeSlots([{ start: "00:00", end: "23:59" }]);
        break;
    }
  };

  const handleMuteToggle = (zoneId: string) => {
    const currentlyMuted = zoneMuteSettings[zoneId];
    if (currentlyMuted) {
      const newSettings: { [id: string]: boolean } = {};
      Object.keys(zoneMuteSettings).forEach((id) => {
        newSettings[id] = id !== zoneId;
      });
      setZoneMuteSettings(newSettings);
    } else {
      setZoneMuteSettings({ ...zoneMuteSettings, [zoneId]: true });
    }
  };

  const addContentToZone = (
    content: Ad | Carousel | LiveContent,
    type: "ad" | "carousel" | "live",
  ) => {
    if (!activeZone) return;

    const newItem: ContentItem = {
      id: generateId(),
      content_id:
        type === "ad"
          ? (content as Ad).ad_id
          : type === "carousel"
            ? (content as Carousel).carousel_id
            : (content as LiveContent).live_id,
      content_type: type,
      name: content.name,
      client_name:
        type !== "live" ? (content as Ad | Carousel).client_name : undefined,
      duration:
        type === "ad"
          ? (content as Ad).duration
          : type === "carousel"
            ? (content as Carousel).duration
            : 0,
      display_order:
        (zoneContents[activeZone.zone_id]?.content_items?.length || 0) + 1,
    };

    setZoneContents((prev) => ({
      ...prev,
      [activeZone.zone_id]: {
        ...prev[activeZone.zone_id],
        content_items: [
          ...(prev[activeZone.zone_id]?.content_items || []),
          newItem,
        ],
      },
    }));
  };

  const removeContentFromZone = (itemId: string) => {
    if (!activeZone) return;

    setZoneContents((prev) => ({
      ...prev,
      [activeZone.zone_id]: {
        ...prev[activeZone.zone_id],
        content_items:
          prev[activeZone.zone_id]?.content_items?.filter(
            (i) => i.id !== itemId,
          ) || [],
      },
    }));
  };

  const updateContentSchedule = (
    itemId: string,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    if (!activeZone) return;

    setZoneContents((prev) => ({
      ...prev,
      [activeZone.zone_id]: {
        ...prev[activeZone.zone_id],
        content_items:
          prev[activeZone.zone_id]?.content_items?.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item,
          ) || [],
      },
    }));
  };

  const toggleWidget = (widgetId: string) => {
    if (!activeZone) return;

    setZoneContents((prev) => {
      const currentWidgets = prev[activeZone.zone_id]?.selected_widgets || [];
      const newWidgets = currentWidgets.includes(widgetId)
        ? currentWidgets.filter((id) => id !== widgetId)
        : [...currentWidgets, widgetId];

      return {
        ...prev,
        [activeZone.zone_id]: {
          ...prev[activeZone.zone_id],
          selected_widgets: newWidgets,
        },
      };
    });
  };

  const updateWidgetSchedule = (
    field: "widget_schedule_start" | "widget_schedule_end",
    value: string,
  ) => {
    if (!activeZone) return;

    setZoneContents((prev) => ({
      ...prev,
      [activeZone.zone_id]: {
        ...prev[activeZone.zone_id],
        [field]: value,
      },
    }));
  };

  const getZoneTimeAnalysis = (zoneId: string) => {
    const content = zoneContents[zoneId];
    if (!content?.content_items?.length) return null;

    const scheduledItems = content.content_items.filter(
      (i) => i.start_time && i.end_time,
    );
    if (scheduledItems.length === 0) return null;

    let minTime = Infinity;
    let maxTime = 0;
    let totalScheduled = 0;
    const gaps: { start: string; end: string; duration: number }[] = [];

    const sorted = [...scheduledItems].sort(
      (a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!),
    );

    sorted.forEach((item, idx) => {
      const startMins = timeToMinutes(item.start_time!);
      const endMins = timeToMinutes(item.end_time!);

      minTime = Math.min(minTime, startMins);
      maxTime = Math.max(maxTime, endMins);
      totalScheduled += endMins - startMins;

      if (idx < sorted.length - 1) {
        const nextStart = timeToMinutes(sorted[idx + 1].start_time!);
        if (nextStart > endMins) {
          gaps.push({
            start: minutesToTime(endMins),
            end: minutesToTime(nextStart),
            duration: nextStart - endMins,
          });
        }
      }
    });

    return {
      minTime: minutesToTime(minTime),
      maxTime: minutesToTime(maxTime),
      totalScheduled,
      totalRemaining: globalTimeInfo.totalMinutes - totalScheduled,
      gaps,
    };
  };

  const getAllZoneGaps = () => {
    const allGaps: {
      zoneName: string;
      gaps: { start: string; end: string; duration: number }[];
    }[] = [];

    selectedLayout?.zones.forEach((zone) => {
      const analysis = getZoneTimeAnalysis(zone.zone_id);
      if (analysis?.gaps?.length) {
        allGaps.push({ zoneName: zone.name, gaps: analysis.gaps });
      }
    });

    return allGaps;
  };

  const filteredGroups = useMemo(() => {
    if (!selectedLayout) return [];
    return sampleGroups.filter((g) => {
      const matchesOrientation = g.orientation === selectedLayout.orientation;
      const matchesFilter = g.name
        .toLowerCase()
        .includes(groupFilter.toLowerCase());
      return matchesOrientation && matchesFilter;
    });
  }, [selectedLayout, groupFilter]);

  const handleSchedule = () => {
    const allGaps = getAllZoneGaps();
    if (allGaps.length > 0) {
      setShowConfirmDialog(true);
    } else {
      confirmSchedule();
    }
  };

  const confirmSchedule = () => {
    if (!selectedLayout) return;

    const { startDate, endDate } = getDateRange();

    const schedule: ScheduleConfig = {
      schedule_id: `schedule-${Date.now()}`,
      content_id: selectedLayout.layout_id,
      name: selectedLayout.name,
      schedule_date_type: dateType,
      start_time: startDate,
      end_time: endDate,
      time_slots: timeSlots,
      zone_contents: Object.values(zoneContents),
      zone_mute_settings: zoneMuteSettings,
      selected_groups: selectedGroups,
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveSchedule(schedule);
    setShowConfirmDialog(false);
    alert("Schedule saved successfully!");
  };

  const scheduleJson = useMemo(() => {
    if (!selectedLayout) return null;

    const { startDate, endDate } = getDateRange();

    return {
      schedule_id: `schedule-${Date.now()}`,
      layout_id: selectedLayout.layout_id,
      name: selectedLayout.name,
      schedule_date_type: dateType,
      start_time_date: startDate,
      end_time_date: endDate,
      time_slots: timeSlots,
      zone_contents: Object.values(zoneContents),
      zone_mute_settings: zoneMuteSettings,
      selected_groups: selectedGroups,
      status: "draft",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedLayout,
    dateType,
    specificDate,
    timeSlots,
    zoneContents,
    zoneMuteSettings,
    selectedGroups,
  ]);

  const renderLayoutSelection = () => (
    <div className="space-y-6">
      {/* <div>
        <Label className="text-base font-medium">Content Type</Label>
        <Select defaultValue="screen_layouts">
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="screen_layouts">Screen Layouts</SelectItem>
            <SelectItem value="advertisements">Advertisements</SelectItem>
            <SelectItem value="carousels">Carousels</SelectItem>
            <SelectItem value="live_content">Live Content</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      <div>
        <Label className="text-base font-medium mb-4 block">
          Select a Layout Template ({layouts.length})
        </Label>

        {layouts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Monitor className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No layouts created yet
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/screen-layout")}
              >
                Create Layout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {layouts.map((layout) => (
              <Card
                key={layout.layout_id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  setSelectedLayout(layout);
                  setShowTimeDialog(true);
                }}
              >
                <CardContent className="p-4">
                  <div
                    className="relative bg-gray-900 rounded-lg overflow-hidden mb-3 mx-auto"
                    style={{
                      width: layout.orientation === "landscape" ? 160 : 100,
                      height: layout.orientation === "landscape" ? 90 : 160,
                    }}
                  >
                    {layout.zones.map((zone) => (
                      <div
                        key={zone.zone_id}
                        className="absolute flex items-center justify-center"
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.width}%`,
                          height: `${zone.height}%`,
                          backgroundColor: zone.color,
                        }}
                      >
                        <span className="text-white text-[8px] truncate px-0.5">
                          {zone.content_type_allowed === "media" ? "M" : "W"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <h3 className="font-medium text-sm">{layout.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Monitor className="w-3 h-3" />
                      {layout.zones.length} zones | {layout.orientation}
                    </p>
                    <Badge
                      variant={layout.is_active ? "default" : "secondary"}
                      className="mt-2 text-xs"
                    >
                      {layout.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLayoutConfiguration = () => {
    if (!selectedLayout) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{selectedLayout.name}</h2>
            <p className="text-sm text-muted-foreground">
              Click zones to assign content | {timeSlots.length} time slot(s)
              configured
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimeDialog(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Edit Time Slots
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLayout(null);
                setCurrentStep("select_layout");
              }}
            >
              Change Layout
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot, idx) => (
            <Badge key={idx} variant="outline" className="text-sm">
              <Clock className="w-3 h-3 mr-1" />
              Slot {idx + 1}: {slot.start} - {slot.end}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-sm">
            <CalendarDays className="w-3 h-3 mr-1" />
            {dateType === "today"
              ? "Today"
              : dateType === "specific_date"
                ? specificDate
                : dateType === "one_week"
                  ? "Next 7 days"
                  : "Next 30 days"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Layout Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <div
                    className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                    style={{
                      width:
                        selectedLayout.orientation === "landscape" ? 500 : 280,
                      height:
                        selectedLayout.orientation === "landscape" ? 280 : 500,
                    }}
                  >
                    {selectedLayout.zones.map((zone) => {
                      const hasContent =
                        zone.content_type_allowed === "media"
                          ? (zoneContents[zone.zone_id]?.content_items
                              ?.length || 0) > 0
                          : (zoneContents[zone.zone_id]?.selected_widgets
                              ?.length || 0) > 0;

                      return (
                        <div
                          key={zone.zone_id}
                          onClick={() => {
                            setActiveZone(zone);
                            setShowZoneDialog(true);
                          }}
                          className={cn(
                            "absolute flex flex-col items-center justify-center text-white cursor-pointer transition-all hover:opacity-80",
                            hasContent && "ring-2 ring-white ring-inset",
                          )}
                          style={{
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                            width: `${zone.width}%`,
                            height: `${zone.height}%`,
                            backgroundColor: zone.color,
                          }}
                        >
                          <span className="font-medium text-sm">
                            {zone.name}
                          </span>
                          <span className="text-xs opacity-75">
                            {zone.content_type_allowed === "media"
                              ? "Media Zone"
                              : "Widget Zone"}
                          </span>
                          <span className="text-xs mt-1">
                            {hasContent ? "Assigned" : "Click to assign"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Zone Assignments</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJsonDialog(true)}
                >
                  {"<>"} Show JSON
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedLayout.zones.map((zone) => {
                    const content = zoneContents[zone.zone_id];
                    const is_muted = zoneMuteSettings[zone.zone_id];
                    const hasContent =
                      zone.content_type_allowed === "media"
                        ? (content?.content_items?.length || 0) > 0
                        : (content?.selected_widgets?.length || 0) > 0;
                    const analysis = getZoneTimeAnalysis(zone.zone_id);

                    return (
                      <div
                        key={zone.zone_id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{zone.name}</span>
                            <Badge
                              variant={
                                zone.content_type_allowed === "media"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {zone.content_type_allowed === "media" ? (
                                <>
                                  <Film className="w-3 h-3 mr-1" />
                                  Media
                                </>
                              ) : (
                                <>
                                  <LayoutGrid className="w-3 h-3 mr-1" />
                                  Widget
                                </>
                              )}
                            </Badge>
                            {hasContent && (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600 border-green-600"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {zone.content_type_allowed === "media"
                                  ? `${content?.content_items?.length} items`
                                  : `${content?.selected_widgets?.length} widgets`}
                              </Badge>
                            )}
                          </div>
                          {analysis?.gaps && analysis.gaps.length > 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {analysis.gaps.length} gap(s) in schedule
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMuteToggle(zone.zone_id)}
                          className={cn(
                            "h-8 w-8 flex-shrink-0",
                            !is_muted && "text-green-600",
                          )}
                        >
                          {is_muted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => {
                            setActiveZone(zone);
                            setShowZoneDialog(true);
                          }}
                        >
                          {hasContent ? "Edit" : "Assign"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Assign to Groups</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Only {selectedLayout.orientation} groups are shown
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Filter Name..."
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                />

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredGroups.map((group) => (
                      <div
                        key={group.group_id}
                        className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedGroups.includes(group.group_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGroups([
                                ...selectedGroups,
                                group.group_id,
                              ]);
                            } else {
                              setSelectedGroups(
                                selectedGroups.filter(
                                  (id) => id !== group.group_id,
                                ),
                              );
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.device_count} devices
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${group.capacity}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {group.capacity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedGroups.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedGroups.length} group(s) selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSchedule}
              disabled={selectedGroups.length === 0}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Layout
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/ads/all");

        const response = await api.get("/carousel/all");

        console.log("response:-", response);

        const formatted = res.ads.map((ad: any) => ({
          ad_id: ad.ad_id,
          name: ad.name,
          client_name: ad.client_name,
          status: ad.status,
          url: ad.url,
          duration: ad.duration,
          updated_at: new Date(ad.updated_at).toLocaleString(),
        }));

        setAds(formatted); // ✅ IMPORTANT
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAds();
  }, []);
  const [carousels, setCarousels] = useState([]);

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const response = await api.get("/carousel/all");

        setCarousels(response.data); // ✅ correct path
      } catch (err) {
        console.error(err);
      }
    };

    fetchCarousels();
  }, []);

  const [liveContent, setLiveContent] = useState([]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await api.get("/live-content/all");
        setLiveContent(res.data); // ✅ correct
      } catch (err) {
        console.error(err);
      }
    };

    fetchLive();
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6 overflow-auto">
        {/* <h1 className="text-2xl font-bold mb-6">Content Scheduling</h1> */}

        {currentStep === "select_layout" && renderLayoutSelection()}
        {currentStep === "configure_layout" && renderLayoutConfiguration()}
      </main>

      {/* Time Slot Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="max-w-3xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Configure Time Slots
            </DialogTitle>
            <DialogDescription>
              Set the global time slots for layout &quot;{selectedLayout?.name}
              &quot;. Content can be optionally scheduled within these time
              windows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Schedule Duration
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={dateType === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateType("today")}
                  className="w-full"
                >
                  Today
                </Button>
                <Button
                  variant={dateType === "specific_date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateType("specific_date")}
                  className="w-full"
                >
                  Specific Date
                </Button>
                <Button
                  variant={dateType === "one_week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateType("one_week")}
                  className="w-full"
                >
                  One Week
                </Button>
                <Button
                  variant={dateType === "one_month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateType("one_month")}
                  className="w-full"
                >
                  One Month
                </Button>
              </div>

              {dateType === "specific_date" && (
                <Input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Time Slots
              </Label>
              <div className="space-y-2">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Start
                        </Label>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const newSlots = [...timeSlots];
                            newSlots[idx].start = e.target.value;
                            setTimeSlots(newSlots);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          End
                        </Label>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const newSlots = [...timeSlots];
                            newSlots[idx].end = e.target.value;
                            setTimeSlots(newSlots);
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground mt-4 w-12">
                      Slot {idx + 1}
                    </span>
                    {timeSlots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-4"
                        onClick={() =>
                          setTimeSlots(timeSlots.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setTimeSlots([...timeSlots, { start: "09:00", end: "17:00" }])
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Time Slot
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Quick Presets
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTimePreset("business")}
                >
                  Business Hours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTimePreset("peak")}
                >
                  Peak Hours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyTimePreset("allday")}
                >
                  All Day
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTimeDialog(false);
                setSelectedLayout(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowTimeDialog(false);
                setCurrentStep("configure_layout");
              }}
            >
              Continue to Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zone Assignment Dialog */}
      <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
        <DialogContent className="!max-w-none w-[95vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeZone?.content_type_allowed === "media" ? (
                <>
                  <Film className="w-5 h-5" />
                  Assign Content to Zone: {activeZone?.name}
                </>
              ) : (
                <>
                  <LayoutGrid className="w-5 h-5" />
                  Assign Widgets to Zone: {activeZone?.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeZone?.content_type_allowed === "media"
                ? "Add advertisements, carousels, or live content to this zone."
                : "Select widgets to display in this zone."}
            </DialogDescription>
          </DialogHeader>

          {activeZone && (
            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <strong>Layout Time Constraint:</strong> Content schedules
                  must be within {globalTimeInfo.minTime} -{" "}
                  {globalTimeInfo.maxTime} (
                  {Math.floor(globalTimeInfo.totalMinutes / 60)}h{" "}
                  {globalTimeInfo.totalMinutes % 60}m total)
                </p>
              </div>

              {activeZone.content_type_allowed === "media" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="font-medium">Add Content Type:</Label>
                    <Select
                      value={contentType}
                      onValueChange={(v: "ad" | "carousel" | "live") =>
                        setContentType(v)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ad">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Advertisement
                          </div>
                        </SelectItem>
                        <SelectItem value="carousel">
                          <div className="flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Carousel
                          </div>
                        </SelectItem>
                        <SelectItem value="live">
                          <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4" />
                            Live Content
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        Available{" "}
                        {contentType === "ad"
                          ? "Advertisements"
                          : contentType === "carousel"
                            ? "Carousels"
                            : "Live Content"}
                      </h4>
                      <ScrollArea className="h-72">
                        <div className="space-y-2 pr-2">
                          {contentType === "ad" &&
                            // sampleAds.slice(0, 10).map((ad) => (
                            ads.slice(0, 10).map((ad) => (
                              <div
                                key={ad.ad_id}
                                className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                              >
                                <div className="flex-1 min-w-0 mr-3">
                                  <p className="font-medium text-sm truncate">
                                    {ad.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {ad.client_name} -{" "}
                                    {formatDuration(ad.duration)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addContentToZone(ad, "ad")}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}

                          {contentType === "carousel" &&
                            // sampleCarousels.map((carousel) => (
                            //   <div
                            //     key={carousel.carousel_id}
                            //     className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                            //   >
                            //     <div className="flex-1 min-w-0 mr-3">
                            //       <p className="font-medium text-sm truncate">
                            //         {carousel.name}
                            //       </p>
                            //       <p className="text-xs text-muted-foreground">
                            //         {carousel.client_name} - {carousel.slides}{" "}
                            //         slides - {formatDuration(carousel.duration)}
                            //       </p>
                            //     </div>
                            //     <Button
                            //       variant="outline"
                            //       size="sm"
                            //       onClick={() =>
                            //         addContentToZone(carousel, "carousel")
                            //       }
                            //     >
                            //       <Plus className="w-4 h-4" />
                            //     </Button>
                            //   </div>
                            // ))
                            carousels.map((carousel) => (
                              <div
                                key={carousel.carousel_id}
                                className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                              >
                                <div className="flex-1 min-w-0 mr-3">
                                  <p className="font-medium text-sm truncate">
                                    {carousel.name}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {carousel.Client?.name} -{" "}
                                    {carousel.items?.length || 0} slides -{" "}
                                    {formatDuration(carousel.total_duration)}
                                  </p>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    addContentToZone(carousel, "carousel")
                                  }
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}

                          {contentType === "live" &&
                            // sampleLiveContent.map((live) => (
                            //   <div
                            //     key={live.live_id}
                            //     className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                            //   >
                            //     <div className="flex-1 min-w-0 mr-3">
                            //       <p className="font-medium text-sm truncate">
                            //         {live.name}
                            //       </p>
                            //       <p className="text-xs text-muted-foreground">
                            //         {live.type.toUpperCase()} - {live.status}
                            //       </p>
                            //     </div>
                            //     <Button
                            //       variant="outline"
                            //       size="sm"
                            //       onClick={() => addContentToZone(live, "live")}
                            //     >
                            //       <Plus className="w-4 h-4" />
                            //     </Button>
                            //   </div>
                            // ))

                            liveContent.map((live) => (
                              <div
                                key={live.live_content_id}
                                className="flex items-center justify-between p-3 border rounded hover:bg-muted/50"
                              >
                                <div className="flex-1 min-w-0 mr-3">
                                  {/* Name */}
                                  <p className="font-medium text-sm truncate">
                                    {live.name}
                                  </p>

                                  {/* Meta */}
                                  <p className="text-xs text-muted-foreground">
                                    {live.content_type?.toUpperCase()} -{" "}
                                    {live.status}
                                  </p>

                                  {/* Optional extra */}
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {live.Client?.name} •{" "}
                                    {formatDuration(live.duration)}
                                  </p>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addContentToZone(live, "live")}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        Assigned Content (
                        {zoneContents[activeZone.zone_id]?.content_items
                          ?.length || 0}
                        )
                      </h4>
                      <ScrollArea className="h-72">
                        <div className="space-y-3 pr-2">
                          {zoneContents[activeZone.zone_id]?.content_items?.map(
                            (item, idx) => {
                              const isTimeValid =
                                !item.start_time ||
                                !item.end_time ||
                                (timeToMinutes(item.start_time) >=
                                  timeToMinutes(globalTimeInfo.minTime) &&
                                  timeToMinutes(item.end_time) <=
                                    timeToMinutes(globalTimeInfo.maxTime));

                              return (
                                <div
                                  key={item.id}
                                  className="p-3 border rounded-lg space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.content_type}
                                    </Badge>
                                    <span className="font-medium text-sm flex-1 truncate">
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      #{idx + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        removeContentFromZone(item.id)
                                      }
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* <p className="text-xs text-muted-foreground">
                                    {item.client_name &&
                                      `${item.client_name} - `}
                                    {formatDuration(item.duration)}
                                  </p> */}

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Input
                                      type="time"
                                      className="h-8 text-xs w-32"
                                      placeholder="Start"
                                      value={item.start_time || ""}
                                      onChange={(e) =>
                                        updateContentSchedule(
                                          item.id,
                                          "start_time",
                                          e.target.value,
                                        )
                                      }
                                    />
                                    <span className="text-muted-foreground">
                                      to
                                    </span>
                                    <Input
                                      type="time"
                                      className="h-8 text-xs w-32"
                                      placeholder="End"
                                      value={item.end_time || ""}
                                      onChange={(e) =>
                                        updateContentSchedule(
                                          item.id,
                                          "end_time",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>

                                  {item.start_time && item.end_time && (
                                    <p
                                      className={cn(
                                        "text-xs",
                                        isTimeValid
                                          ? "text-green-600"
                                          : "text-red-600",
                                      )}
                                    >
                                      {isTimeValid
                                        ? `Scheduled: ${item.start_time} - ${item.end_time}`
                                        : "Time exceeds layout constraint!"}
                                    </p>
                                  )}
                                </div>
                              );
                            },
                          )}

                          {!zoneContents[activeZone.zone_id]?.content_items
                            ?.length && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Tv className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No content assigned</p>
                              <p className="text-xs">
                                Select content from the left panel
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {(() => {
                    const analysis = getZoneTimeAnalysis(activeZone.zone_id);
                    if (!analysis) return null;

                    return (
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-medium text-sm">
                          Schedule Analysis
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Min Time</p>
                            <p className="font-medium">{analysis.minTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Time</p>
                            <p className="font-medium">{analysis.maxTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Total Scheduled
                            </p>
                            <p className="font-medium">
                              {Math.floor(analysis.totalScheduled / 60)}h{" "}
                              {analysis.totalScheduled % 60}m
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Time Remaining
                            </p>
                            <p className="font-medium">
                              {Math.floor(analysis.totalRemaining / 60)}h{" "}
                              {analysis.totalRemaining % 60}m
                            </p>
                          </div>
                        </div>

                        {analysis.gaps.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-amber-600 text-sm font-medium mb-2">
                              <AlertTriangle className="w-4 h-4 inline mr-1" />
                              Schedule Gaps Detected:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.gaps.map((gap, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-amber-600 border-amber-600"
                                >
                                  {gap.start} - {gap.end} ({gap.duration}m gap)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium mb-3 block">
                      Select Widgets
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {defaultWidgets.map((widget) => {
                        const isSelected = zoneContents[
                          activeZone.zone_id
                        ]?.selected_widgets?.includes(widget.widget_id);

                        return (
                          <div
                            key={widget.widget_id}
                            onClick={() => toggleWidget(widget.widget_id)}
                            className={cn(
                              "p-4 border rounded-lg cursor-pointer transition-all text-center",
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary"
                                : "hover:border-muted-foreground",
                            )}
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                              {widget.type === "clock" && (
                                <Clock className="w-5 h-5" />
                              )}
                              {widget.type === "weather" && (
                                <span className="text-lg">C</span>
                              )}
                              {widget.type === "news_ticker" && (
                                <span className="text-lg">N</span>
                              )}
                              {widget.type === "date" && (
                                <CalendarDays className="w-5 h-5" />
                              )}
                              {widget.type === "logo" && (
                                <Image className="w-5 h-5" />
                              )}
                              {widget.type === "qr_code" && (
                                <span className="text-lg">QR</span>
                              )}
                              {widget.type === "social_feed" && (
                                <span className="text-lg">S</span>
                              )}
                              {widget.type === "countdown" && (
                                <span className="text-lg">T</span>
                              )}
                            </div>
                            <p className="font-medium text-sm">{widget.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {widget.description}
                            </p>
                            {isSelected && (
                              <Badge className="mt-2 text-xs">Selected</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <Label className="font-medium mb-3 block">
                      Widget Display Schedule (Optional)
                    </Label>
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Start Time
                        </Label>
                        <Input
                          type="time"
                          value={
                            zoneContents[activeZone.zone_id]
                              ?.widget_schedule_start || ""
                          }
                          onChange={(e) =>
                            updateWidgetSchedule(
                              "widget_schedule_start",
                              e.target.value,
                            )
                          }
                          className="w-36"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          End Time
                        </Label>
                        <Input
                          type="time"
                          value={
                            zoneContents[activeZone.zone_id]
                              ?.widget_schedule_end || ""
                          }
                          onChange={(e) =>
                            updateWidgetSchedule(
                              "widget_schedule_end",
                              e.target.value,
                            )
                          }
                          className="w-36"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Selected Widgets (
                      {zoneContents[activeZone.zone_id]?.selected_widgets
                        ?.length || 0}
                      )
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {zoneContents[activeZone.zone_id]?.selected_widgets?.map(
                        (widgetId) => {
                          const widget = defaultWidgets.find(
                            (w) => w.widget_id === widgetId,
                          );
                          return widget ? (
                            <Badge key={widgetId} variant="secondary">
                              {widget.name}
                              <X
                                className="w-3 h-3 ml-1 cursor-pointer"
                                onClick={() => toggleWidget(widgetId)}
                              />
                            </Badge>
                          ) : null;
                        },
                      )}
                      {!zoneContents[activeZone.zone_id]?.selected_widgets
                        ?.length && (
                        <span className="text-sm text-muted-foreground">
                          No widgets selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowZoneDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowZoneDialog(false)}>
              Save Zone Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-3xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Schedule Gaps Detected
            </DialogTitle>
            <DialogDescription>
              The following zones have gaps in their schedules. During these
              gaps, no content will play unless you modify the schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {getAllZoneGaps().map((zoneGap, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{zoneGap.zoneName}</h4>
                <div className="flex flex-wrap gap-2">
                  {zoneGap.gaps.map((gap, gIdx) => (
                    <Badge
                      key={gIdx}
                      variant="outline"
                      className="text-amber-600 border-amber-600"
                    >
                      {gap.start} - {gap.end} ({gap.duration} minutes gap)
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-sm text-muted-foreground">
              Do you want to proceed with the current schedule? You can also
              cancel and modify the content schedules.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel & Modify
            </Button>
            <Button onClick={confirmSchedule}>Confirm & Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* JSON Dialog */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="max-w-5xl w-[98vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Schedule JSON Structure</DialogTitle>
            <DialogDescription>
              This is the data structure that will be stored in the database.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(scheduleJson, null, 2)}
            </pre>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJsonDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(scheduleJson, null, 2),
                );
              }}
            >
              Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
