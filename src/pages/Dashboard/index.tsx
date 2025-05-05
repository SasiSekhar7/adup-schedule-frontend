// pages/Dashboard.tsx (or your file path)

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Activity, Users, Calendar, Box, Rocket, TrendingUp, CalendarCheck, Server, Smartphone, // Import new icons
  AlertTriangleIcon
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns"; // Import format


import { DateRangePicker } from "./components/DateRangePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import api from "@/api";
import { getRole } from "@/helpers";
import { PerformanceTablesCard } from "./components/PerformanceTables";

// Type for the overall stats fetched once
interface OverallStatsData {
  devices: number;
  deviceGroups: number;
  ads: number;
  clients?: number;
  schedules: number;
}

// Type for the date-range sensitive KPIs
interface DynamicKpiData {
  totalImpressions: number;
  adsScheduledInRange: number;
  activeGroupsInRange: number;
  activeDevicesInRange: number;
}

const Dashboard = () => {
  // State for overall stats (fetched once)
  const [overallStatsData, setOverallStatsData] = useState<OverallStatsData | null>(null);

  // State for the date range picker
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 13), // Default to last 14 days
    to: new Date(),
  });

  // State for the dynamic, date-range sensitive KPIs
  const [dynamicKpiData, setDynamicKpiData] = useState<DynamicKpiData | null>(null);
  const [dynamicKpiLoading, setDynamicKpiLoading] = useState(false); // Start false, true when date changes
  const [dynamicKpiError, setDynamicKpiError] = useState<string | null>(null);

  // const [role] = useState(getRole());

  // // Effect for fetching OVERALL stats (runs once)
  // useEffect(() => {
  //   const fetchOverallStats = async () => {
  //     setOverallStatsLoading(true);
  //     setOverallStatsError(null);
  //     try {
  //       // Use a specific endpoint that DOES NOT depend on date range
  //       const res = await api.get< OverallStatsData>("/dashboard/");
  //       console.log("Dashboard Overall Stats API response:", res.data);
  //       setOverallStatsData(res.data);
  //     } catch (error: any) {
  //       console.error("Error fetching dashboard overall stats:", error);
  //       setOverallStatsError(error.response?.data?.message || error.message || "Failed to load overall stats");
  //     } finally {
  //       setOverallStatsLoading(false);
  //     }
  //   };
  //   fetchOverallStats();
  // }, []); // Empty dependency array - runs once

  // Effect for fetching DYNAMIC KPIs based on DATE RANGE (runs when 'date' changes)
  useEffect(() => {
    const fetchDynamicKpis = async () => {
      // Don't fetch if date range is incomplete
      if (!date?.from || !date?.to) {
        setDynamicKpiData(null); // Clear previous data if range becomes invalid
        setDynamicKpiError("Please select a valid date range for performance KPIs.");
        setDynamicKpiLoading(false); // Ensure loading is off
        return;
      }

      setDynamicKpiLoading(true);
      setDynamicKpiError(null);

      const startDate = format(date.from, "yyyy-MM-dd");
      const endDate = format(date.to, "yyyy-MM-dd");
      const params = new URLSearchParams({ startDate, endDate });

      try {
        // Use the date-range sensitive stats endpoint
        const res = await api.get<DynamicKpiData>(`/dashboard/stats?${params.toString()}`);
        console.log("Dashboard Dynamic KPI API response:", res.data);
        setDynamicKpiData(res.data);
      } catch (error: any) {
        console.error("Error fetching dynamic KPI data:", error);
        setDynamicKpiError(error.response?.data?.message || error.message || "Failed to load performance KPIs");
        setDynamicKpiData(null); // Clear data on error
      } finally {
        setDynamicKpiLoading(false);
      }
    };

    fetchDynamicKpis();
  }, [date]); // *** Dependency: re-run whenever 'date' changes ***

  // Loading state for the initial overall stats fetch
  // if (overallStatsLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
  //       <span className="ml-2 text-muted-foreground">Loading Dashboard...</span>
  //     </div>
  //   );
  // }

  // // Error state for the initial overall stats fetch
  // if (overallStatsError) {
  //   return <div className="p-6 text-center text-red-600">Error: {overallStatsError}</div>;
  // }

  // Should not happen if error handling is right, but good practice
  // if (!overallStatsData) {
  //   return <div className="p-6 text-center text-muted-foreground">No dashboard data available.</div>;
  // }

  // --- Render the Dashboard ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            System statistics and performance details.
          </p>
        </div>
        <DateRangePicker date={date} setDate={setDate} className="self-start sm:self-center" />
      </div>

      {/* Overall System Stats Cards Grid */}
      {/* <div>
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Overall System Totals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <StatsCard title="Total Devices" value={overallStatsData.devices} icon={<Rocket className="h-4 w-4 text-muted-foreground" />} />
          <StatsCard title="Device Groups" value={overallStatsData.deviceGroups} icon={<Box className="h-4 w-4 text-muted-foreground" />} />
          <StatsCard title="Total Ads" value={overallStatsData.ads} icon={<Activity className="h-4 w-4 text-muted-foreground" />} />
          {role === "Admin" && <StatsCard title="Total Clients" value={overallStatsData.clients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />}
          <StatsCard title="Total Schedules" value={overallStatsData.schedules} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} />
        </div>
      </div> */}


      {/* Dynamic Performance KPI Section */}
      <div className="">

        {/* Loading State */}
        {dynamicKpiLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => ( // Render 4 skeleton cards
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-3/5" /> {/* Skeleton for title */}
                    <Skeleton className="h-4 w-4" /> {/* Skeleton for icon */}
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" /> {/* Skeleton for value */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Error State */}
        {!dynamicKpiLoading && dynamicKpiError && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error Loading Performance KPIs</AlertTitle>
            <AlertDescription>{dynamicKpiError}</AlertDescription>
          </Alert>
        )}
        {/* Data State */}
        {!dynamicKpiLoading && !dynamicKpiError && dynamicKpiData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatsCard title="Total Impressions" value={dynamicKpiData.totalImpressions} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
            <StatsCard title="Ads Scheduled (Period)" value={dynamicKpiData.adsScheduledInRange} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} />
            <StatsCard title="Active Groups (Period)" value={dynamicKpiData.activeGroupsInRange} icon={<Server className="h-4 w-4 text-muted-foreground" />} />
            <StatsCard title="Active Devices (Period)" value={dynamicKpiData.activeDevicesInRange} icon={<Smartphone className="h-4 w-4 text-muted-foreground" />} />
          </div>
        )}
         {/* No Data State */}
         {!dynamicKpiLoading && !dynamicKpiError && !dynamicKpiData && (
            <p className="text-sm text-muted-foreground">No performance data available for the selected period.</p>
         )}
      </div>

      {/* Performance Details Tables Card (passes date range down) */}
      <PerformanceTablesCard dateRange={date} />

    </div>
  );
};


// Stats Card Component (accepts null/undefined value)
interface StatsCardProps {
    title: string;
    value: number | undefined | null;
    icon: React.ReactNode;
}
const StatsCard = ({ title, value, icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value != null ? value.toLocaleString() : "-"}</div>
    </CardContent>
  </Card>
);


export default Dashboard;