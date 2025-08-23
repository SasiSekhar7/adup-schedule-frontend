// import api from "@/api";
// import { DataTable } from "@/components/data-table";
// import { useEffect, useState } from "react";
// import { Device, DevicesResponse, columns } from "./columns";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { DateRange } from "react-day-picker";
// import { DateRangePicker } from "@/pages/Dashboard/components/DateRangePicker"; // Adjust path as needed

// function Schedule() {
//   const [data, setData] = useState<Device[]>([]);
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Defaults to today
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [limit, setLimit] = useState(10); // Use state for limit
//   const [dateRange, setDateRange] = useState<DateRange | undefined>({
//     from: new Date(),
//     to: new Date(),
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await api.get<DevicesResponse>("/schedule/all", {
//           params: {
//             page,
//             limit,
//             from: dateRange?.from?.toISOString().split("T")[0],
//             to: dateRange?.to?.toISOString().split("T")[0],
//           },
//         });
//         const sortedData = response?.schedules?.sort((a, b) => {
//           return (
//             new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
//           );
//         });

//         setData(sortedData);
//         setTotal(response.total);
//       } catch (error) {
//         console.error("Error fetching schedules:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (dateRange?.from && dateRange?.to) {
//       fetchData();
//     }
//   }, [limit, dateRange]);

//   const handleDateChange = (event) => {
//     setDate(event.target.value);
//     setPage(1); // Reset to first page when date changes
//   };
//   const filters = [
//     { label: "Ad Name", value: "ad_name" },
//     { label: "Group Name", value: "group_name" },
//   ];

//   const handlePaginationChange = (newPage: number, newLimit: number) => {
//     setPage(newPage);
//     setLimit(newLimit);
//   };
//   return (
//     <div className="">
//       <div className="flex items-center w-full mb-4">
//         <div className="">
//           <p className="text-md font-semibold">Schedules</p>
//           <p className="text-sm text-muted-foreground">
//             List of all Ads and Devices
//           </p>
//         </div>
//         <div className=" ml-auto">
//           <DateRangePicker date={dateRange} setDate={setDateRange} />
//         </div>
//       </div>

//       {/* Date Picker */}

//       {/* Data Table */}
//       <DataTable
//         data={data}
//         columns={columns}
//         loading={loading}
//         filters={filters}
//         pagination={{
//           total,
//           page,
//           limit,
//           onPageChange: setPage,
//         }}
//         onPaginationChange={handlePaginationChange} // ✅ Pass the new callback
//       />
//     </div>
//   );
// }

// export default Schedule;

"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Calendar,
  Grid3X3,
  List,
  Trash2,
  Clock,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import api from "@/api";
import { toast } from "sonner";

interface ApiGroup {
  groupId: string;
  groupName: string;
  clientId: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  completedDays: number;
  completedPercentage: string;
  lastDate: string;
}

interface ApiAd {
  adId: string;
  adName: string;
  groups: ApiGroup[];
}

interface ApiResponse {
  ads: ApiAd[];
  total: number;
}

interface Schedule {
  id: string;
  name: string;
  type: "Ad" | "Image";
  deviceGroups: string[];
  status: "Scheduled" | "Active" | "Inactive";
  progress: number;
  duration: string;
  startDate: string;
  totalPlays: number;
  category: "default" | "preferred";
  originalGroups: ApiGroup[];
}

interface DeleteModalState {
  isOpen: boolean;
  schedule: Schedule | null;
}

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    adName: "",
    groupName: "",
    status: "all",
    type: "all",
    schedule: "all",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const [selectedDate, setSelectedDate] = useState(
    `${todayFormatted} - ${todayFormatted}`
  );
  const [dateRange, setDateRange] = useState({
    from: today,
    to: today,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    schedule: null,
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [timeRange, setTimeRange] = useState("today");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApiGroup | null>(null);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const openDeleteModal = (schedule: Schedule) => {
    setDeleteModal({ isOpen: true, schedule });
    if (schedule.originalGroups?.length > 0) {
      const firstGroup = schedule.originalGroups[0];
      setSelectedGroupId(firstGroup.groupId);
      setSelectedGroup(firstGroup);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, schedule: null });
    setSelectedGroupId("");
    setSelectedGroup(null);
    setTimeRange("today");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    console.log("[v0] Formatting date string:", dateString);

    let date: Date;

    const cleanDateString = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString.trim();

    // First try to parse as DD-MM-YYYY format (which is what our data uses)
    const parts = cleanDateString.split("-");
    if (parts.length === 3) {
      // Check if it's DD-MM-YYYY format (day first)
      const firstPart = Number.parseInt(parts[0]);
      const secondPart = Number.parseInt(parts[1]);
      const thirdPart = Number.parseInt(parts[2]);

      // If first part is <= 31 and third part is a year, it's DD-MM-YYYY
      if (firstPart <= 31 && thirdPart > 1900 && thirdPart < 2100) {
        date = new Date(thirdPart, secondPart - 1, firstPart);
      } else {
        // Otherwise try YYYY-MM-DD format
        date = new Date(firstPart, secondPart - 1, thirdPart);
      }
    } else {
      // Fallback to standard parsing
      date = new Date(cleanDateString + "T00:00:00.000Z");

      if (isNaN(date.getTime())) {
        date = new Date(cleanDateString);
      }
    }

    if (isNaN(date.getTime())) {
      console.warn("[v0] Could not parse date:", dateString);
      return dateString;
    }

    console.log("[v0] Parsed date:", date);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAvailableTimeRanges = () => {
    if (!selectedGroup) return [];

    console.log("[v0] Processing group dates:", {
      fromDate: selectedGroup.fromDate,
      toDate: selectedGroup.toDate,
    });

    const parseDate = (dateStr: string) => {
      const cleanDateString = dateStr.includes("T")
        ? dateStr.split("T")[0]
        : dateStr.trim();

      // Parse DD-MM-YYYY format
      const parts = cleanDateString.split("-");
      if (parts.length === 3) {
        const firstPart = Number.parseInt(parts[0]);
        const secondPart = Number.parseInt(parts[1]);
        const thirdPart = Number.parseInt(parts[2]);

        // If first part is <= 31 and third part is a year, it's DD-MM-YYYY
        if (firstPart <= 31 && thirdPart > 1900 && thirdPart < 2100) {
          return new Date(thirdPart, secondPart - 1, firstPart);
        } else {
          // Otherwise try YYYY-MM-DD format
          return new Date(firstPart, secondPart - 1, thirdPart);
        }
      }

      // Fallback to standard parsing
      let date = new Date(cleanDateString + "T00:00:00.000Z");
      if (isNaN(date.getTime())) {
        date = new Date(cleanDateString);
      }

      return date;
    };

    const startDate = parseDate(selectedGroup.fromDate);
    const endDate = parseDate(selectedGroup.toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("[v0] Parsed dates:", {
      startDate,
      endDate,
      today,
      startDateValid: !isNaN(startDate.getTime()),
      endDateValid: !isNaN(endDate.getTime()),
    });

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn("[v0] Invalid date format in group:", selectedGroup);
      return [{ value: "custom", label: "Custom date range" }];
    }

    const totalDays = selectedGroup.totalDays;
    const remainingDays = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    const isActiveToday = today >= startDate && today <= endDate;

    const options = [];

    if (isActiveToday) {
      options.push({ value: "today", label: "Today only" });
    }

    if (totalDays > 1 && (isActiveToday || remainingDays > 0)) {
      options.push({ value: "week", label: "This entire week" });
    }

    if (totalDays > 7) {
      options.push({ value: "month", label: "This entire month" });
    }

    options.push({ value: "custom", label: "Custom date range" });

    return options;
  };

  // const getDateRangeForTimeOption = (option: string) => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   console.log("[v0] Calculating date range for option:", today);

  //   switch (option) {
  //     case "today":
  //       return {
  //         from: today.toISOString().split("T")[0],
  //         to: today.toISOString().split("T")[0],
  //       };

  //     case "week":
  //       // Get start of current week (Sunday)
  //       const startOfWeek = new Date(today);
  //       startOfWeek.setDate(today.getDate() - today.getDay());

  //       // Get end of current week (Saturday)
  //       const endOfWeek = new Date(startOfWeek);
  //       endOfWeek.setDate(startOfWeek.getDate() + 6);

  //       return {
  //         from: startOfWeek.toISOString().split("T")[0],
  //         to: endOfWeek.toISOString().split("T")[0],
  //       };

  //     case "month":
  //       // Get start of current month
  //       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  //       // Get end of current month
  //       const endOfMonth = new Date(
  //         today.getFullYear(),
  //         today.getMonth() + 1,
  //         0
  //       );

  //       return {
  //         from: startOfMonth.toISOString().split("T")[0],
  //         to: endOfMonth.toISOString().split("T")[0],
  //       };

  //     case "custom":
  //       return {
  //         from: customStartDate,
  //         to: customEndDate,
  //       };

  //     default:
  //       return {
  //         from: today.toISOString().split("T")[0],
  //         to: today.toISOString().split("T")[0],
  //       };
  //   }
  // };

  const getDateRangeForTimeOption = (option: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today (local time)

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

    switch (option) {
      case "today":
        return {
          from: formatDate(today),
          to: formatDate(today),
        };

      case "week":
        // Start of current week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // End of current week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          from: formatDate(startOfWeek),
          to: formatDate(endOfWeek),
        };

      case "month":
        // Start of current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // End of current month
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );

        return {
          from: formatDate(startOfMonth),
          to: formatDate(endOfMonth),
        };

      case "custom":
        return {
          from: customStartDate, // ensure these are defined elsewhere
          to: customEndDate,
        };

      default:
        return {
          from: formatDate(today),
          to: formatDate(today),
        };
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroupId || !selectedGroup || !deleteModal.schedule) return;

    setIsDeleting(true);

    try {
      const dateRange = getDateRangeForTimeOption(timeRange);

      const payload = {
        adId: deleteModal.schedule.id,
        groupId: selectedGroupId,
        startDate: dateRange.from,
        endDate: dateRange.to,
        timeRangeType: timeRange, // Keep original option for reference
      };

      console.log("[v0] Calling delete API with payload:", payload);

      const result = await api.post("/schedule/multiple-delete", payload);

      if (!result || !result.message) {
        throw new Error("Failed to delete schedule");
      } else {
        toast.success("Schedule deleted successfully");
      }

      console.log("[v0] Delete API called successfully with payload:", payload);
      console.log("[v0] Delete API response:", result);

      closeDeleteModal();
      getSchedules();
    } catch (error) {
      console.error("[v0] Delete API error:", error);
      toast.error("Failed to delete schedule. Please try again.");
      // alert("Failed to delete schedule. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeDeleteModal();
    }
  };

  useEffect(() => {
    const group = deleteModal.schedule?.originalGroups?.find(
      (g) => g.groupId === selectedGroupId
    );
    setSelectedGroup(group || null);
  }, [selectedGroupId, deleteModal.schedule?.originalGroups]);

  useEffect(() => {
    getSchedules();
  }, [dateRange]); // Add dateRange dependency to refetch when date changes

  async function getSchedules() {
    try {
      const params = {
        from: dateRange.from.toISOString().split("T")[0],
        to: dateRange.to.toISOString().split("T")[0],
      };

      const response = await api.get("/schedule/all", { params });
      if (!response || !response.ads) {
        throw new Error("Failed to fetch schedules");
      }

      const transformedSchedules: Schedule[] = response.ads.map((ad) => {
        const avgProgress =
          ad.groups.reduce((sum, group) => {
            return (
              sum +
              Number.parseFloat(group.completedPercentage.replace("%", ""))
            );
          }, 0) / ad.groups.length;

        const mostRecentGroup = ad.groups.reduce((latest, current) => {
          return new Date(current.lastDate.split("-").reverse().join("-")) >
            new Date(latest.lastDate.split("-").reverse().join("-"))
            ? current
            : latest;
        });

        const getDuration = (totalDays: number) => {
          // Duration Calculation Logic:
          // - 1 day: Shows "1 day"
          // - 2+ days: Shows "X days" (no conversion to weeks or months)
          if (totalDays === 1) return "1 day";
          return `${totalDays} days`;
        };

        const formatDate = (dateStr: string) => {
          // Date Formatting Logic:
          // Input: DD-MM-YYYY format (e.g., "18-08-2025")
          // Output: Human-readable format (e.g., "18 August 2025")
          // Process: Split by "-", parse as day-month-year, format using toLocaleDateString
          const [day, month, year] = dateStr.split("-");
          const date = new Date(
            Number.parseInt(year),
            Number.parseInt(month) - 1,
            Number.parseInt(day)
          );
          return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        };

        return {
          id: ad.adId,
          name: ad.adName,
          type: "Ad" as const,
          deviceGroups: ad.groups.map((group) => group.groupName),
          // status: avgProgress === 100 ? "Inactive" : "Scheduled",
          status: "Scheduled",
          progress: Math.round(avgProgress),
          duration: getDuration(mostRecentGroup.totalDays),
          startDate: formatDate(mostRecentGroup.fromDate),
          totalPlays: Math.round(avgProgress * 10),
          category: "default" as const,
          originalGroups: ad.groups,
        };
      });

      setSchedules(transformedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesAdName = schedule.name
      .toLowerCase()
      .includes(filters.adName.toLowerCase());
    const matchesGroupName =
      filters.groupName === "" ||
      schedule.deviceGroups.some((group) =>
        group.toLowerCase().includes(filters.groupName.toLowerCase())
      );
    const matchesStatus =
      filters.status === "all" ||
      schedule.status.toLowerCase() === filters.status;
    const matchesType =
      filters.type === "all" || schedule.type.toLowerCase() === filters.type;

    return matchesAdName && matchesGroupName && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const DeviceGroupsCell = ({ groups }: { groups: string[] }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const firstGroup = groups[0];
    const remainingCount = groups.length - 1;

    if (groups.length <= 1) {
      return (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {firstGroup}
          </Badge>
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          className="flex flex-wrap gap-1 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Badge variant="secondary" className="text-xs">
            {firstGroup}
          </Badge>
          <Badge variant="outline" className="text-xs">
            +{remainingCount}
          </Badge>
        </div>

        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-3 z-20 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200">
            <p className="text-xs font-medium text-popover-foreground mb-2">
              All Device Groups:
            </p>
            <div className="space-y-1">
              {groups.map((group, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  • {group}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScheduleRow = ({ schedule }: { schedule: Schedule }) => (
    <tr
      key={schedule.id}
      className="border-b border-border hover:bg-muted/30 transition-colors"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center">
            <Grid3X3 className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="font-medium text-foreground">{schedule.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                {schedule.type}
              </Badge>
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <DeviceGroupsCell groups={schedule.deviceGroups} />
      </td>
      <td className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                schedule.status === "Scheduled" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {schedule.status}
            </Badge>
          </div>
          {/* <div className="w-24">
            <Progress value={schedule.progress} className="h-2" />
          </div> */}
        </div>
      </td>
      {/* SCHEDULE COLUMN - Displays duration and start date information */}
      <td className="p-4">
        {/* Duration Display Section */}
        {/* Shows the total duration of the schedule with a clock icon */}
        {/* Duration is calculated from totalDays and converted to human-readable format */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {/* Duration text: 1 day, X days, X weeks, or X months based on totalDays */}
          <span>{schedule.duration}</span>
        </div>

        {/* Start Date Display Section */}
        {/* Shows the formatted start date of the schedule */}
        {/* Date is formatted from DD-MM-YYYY to human-readable format (e.g., "18th August 2025") */}
        <p className="text-xs text-muted-foreground mt-1">
          {schedule.startDate}
        </p>
      </td>
      {/* End of Schedule Column */}

      <td className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openDeleteModal(schedule)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );

  const availableTimeRanges = getAvailableTimeRanges();

  const handleDateSelection = (
    dateText: string,
    fromDate: Date,
    toDate: Date
  ) => {
    setSelectedDate(dateText);
    setDateRange({ from: fromDate, to: toDate });
    setShowDatePicker(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="border-b border-border bg-background flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Schedules
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Users className="h-4 w-4" />
                <span>
                  {filteredSchedules.length} scheduled items across all devices
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="transition-colors"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="transition-colors"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="transition-colors hover:bg-accent/10"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedDate}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                {showDatePicker && (
                  <div
                    className="absolute top-full mt-2 right-0 bg-popover border border-border rounded-lg shadow-lg p-4 z-50 min-w-[300px] animate-in fade-in-0 zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-medium text-popover-foreground mb-3">
                      Select date range:
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-popover-foreground mb-2 block">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-popover-foreground mb-2 block">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          min={customStartDate}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDatePicker(false);
                            setCustomStartDate("");
                            setCustomEndDate("");
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              const startDate = new Date(customStartDate);
                              const endDate = new Date(customEndDate);
                              const startFormatted =
                                startDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                });
                              const endFormatted = endDate.toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              );
                              handleDateSelection(
                                `${startFormatted} - ${endFormatted}`,
                                startDate,
                                endDate
                              );
                            }
                            setCustomStartDate("");
                            setCustomEndDate("");
                          }}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Filter Ad Name..."
              value={filters.adName}
              onChange={(e) => handleFilterChange("adName", e.target.value)}
              className="max-w-xs transition-colors focus:ring-2 focus:ring-accent"
            />
            <Input
              placeholder="Filter Group Name..."
              value={filters.groupName}
              onChange={(e) => handleFilterChange("groupName", e.target.value)}
              className="max-w-xs transition-colors focus:ring-2 focus:ring-accent"
            />
            {/* <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ad">Ad</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {paginatedSchedules.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-foreground">
                  All Schedules
                </h2>
                <Badge variant="secondary">({filteredSchedules.length})</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      CONTENT
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      DEVICE GROUPS
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      STATUS
                    </th>
                    {/* SCHEDULE Column Header - Contains duration and start date information */}
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      SCHEDULE
                    </th>
                    {/* ACTIONS column header */}
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSchedules.map((schedule) => (
                    <ScheduleRow key={schedule.id} schedule={schedule} />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center pt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0 transition-colors"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No schedules found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>

      {deleteModal.isOpen && deleteModal.schedule && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0 duration-200 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-popover rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-popover z-10">
              <h2 className="text-lg font-semibold text-popover-foreground">
                Delete Scheduled Ad
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDeleteModal}
                className="hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <Label className="text-sm font-medium text-popover-foreground mb-3 block">
                  Select Device Group:
                </Label>
                <Select
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a device group" />
                  </SelectTrigger>
                  <SelectContent>
                    {deleteModal.schedule.originalGroups?.map((group) => (
                      <SelectItem key={group.groupId} value={group.groupId}>
                        {group.groupName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroup && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <h3 className="font-medium text-popover-foreground mb-2">
                    Current Schedule:
                  </h3>
                  <p className="text-muted-foreground  font-medium">
                    {deleteModal.schedule.name} is scheduled for{" "}
                    {selectedGroup.totalDays} days in {selectedGroup.groupName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    From {formatDate(selectedGroup.fromDate)} to{" "}
                    {formatDate(selectedGroup.toDate)}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Progress: {selectedGroup.completedPercentage}% (
                      {selectedGroup.completedDays}/{selectedGroup.totalDays}{" "}
                      days)
                    </span>
                  </div>
                </div>
              )}

              {selectedGroup && availableTimeRanges.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose the time period for which you want to remove this
                    scheduled ad:
                  </p>

                  <RadioGroup
                    value={timeRange}
                    onValueChange={setTimeRange}
                    className="space-y-3"
                  >
                    {availableTimeRanges.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="transition-colors"
                        />
                        <Label
                          htmlFor={option.value}
                          className={`text-sm cursor-pointer ${
                            option.value === "future"
                              ? "text-destructive font-medium"
                              : ""
                          }`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {timeRange === "custom" && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Select Date Range
                        </Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="start-date"
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Start Date
                          </Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="end-date"
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            End Date
                          </Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            min={customStartDate}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      {customStartDate && customEndDate && (
                        <p className="text-xs text-muted-foreground">
                          This will remove the schedule from{" "}
                          {formatDate(customStartDate)} to{" "}
                          {formatDate(customEndDate)} in{" "}
                          {selectedGroup.groupName}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedGroup && timeRange === "today" && (
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-muted-foreground">
                    This will remove "{deleteModal.schedule.name}" from today's
                    schedule in {selectedGroup.groupName} only.
                  </p>
                </div>
              )}

              {selectedGroup && timeRange === "week" && (
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-muted-foreground">
                    This will remove "{deleteModal.schedule.name}" from this
                    entire week's schedule in {selectedGroup.groupName}.
                  </p>
                </div>
              )}

              {selectedGroup && timeRange === "month" && (
                <div className="bg-muted/50 rounded-lg p-3 border border-border/50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-muted-foreground">
                    This will remove "{deleteModal.schedule.name}" from this
                    entire month's schedule in {selectedGroup.groupName}.
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-popover">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="transition-colors hover:bg-muted/50 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={
                  isDeleting ||
                  !selectedGroupId ||
                  (timeRange === "custom" &&
                    (!customStartDate || !customEndDate))
                }
                className="transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
