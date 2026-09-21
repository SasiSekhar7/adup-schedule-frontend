import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HealthSnapshot } from "../types";
import { TrendingUp, Activity, Database, HardDrive, Cpu } from "lucide-react";

interface HealthChartsProps {
  snapshots: HealthSnapshot[];
  currentRange: "1h" | "6h" | "24h" | "7d";
  onRangeChange: (range: "1h" | "6h" | "24h" | "7d") => void;
  loading?: boolean;
}

export const HealthCharts: React.FC<HealthChartsProps> = ({
  snapshots,
  currentRange,
  onRangeChange,
  loading = false,
}) => {
  // Format snapshot timestamps for charts
  const chartData = snapshots.map((s) => {
    const d = new Date(s.created_at);
    let timeLabel = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (currentRange === "7d") {
      timeLabel = `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return {
      timestamp: timeLabel,
      fullDate: d.toLocaleString(),
      cpu: Number(s.cpu_percent?.toFixed(1) || 0),
      memory: Number(s.memory_percent?.toFixed(1) || 0),
      disk: Number(s.disk_percent?.toFixed(1) || 0),
      dbLatency: Number(s.db_latency_ms || 0),
      activeDevices: s.active_devices_count || 0,
    };
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-3 space-y-2 md:space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            System Performance Telemetry & Time-Series History
          </CardTitle>
          <CardDescription className="text-xs">
            Aggregated background metric snapshots recorded every 60 seconds
          </CardDescription>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
          {(["1h", "6h", "24h", "7d"] as const).map((r) => (
            <Button
              key={r}
              variant={currentRange === r ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => onRangeChange(r)}
              disabled={loading}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            Loading time-series telemetry data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-sm text-muted-foreground space-y-1">
            <Activity className="w-8 h-8 text-muted-foreground/50 mb-1" />
            <p className="font-medium">No telemetry snapshots recorded yet</p>
            <p className="text-xs">
              The watchdog daemon runs every 60 seconds and will populate this chart automatically.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mb-4 h-8 text-xs">
              <TabsTrigger value="overview" className="text-xs flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Core Utilization
              </TabsTrigger>
              <TabsTrigger value="database" className="text-xs flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> DB Latency (ms)
              </TabsTrigger>
              <TabsTrigger value="disk" className="text-xs flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" /> Storage Curve
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CORE UTILIZATION (CPU, RAM, DISK %) */}
            <TabsContent value="overview" className="mt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      unit="%"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item?.fullDate || label;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      name="CPU Usage"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cpuGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      name="RAM Usage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#memGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="disk"
                      name="Disk Usage"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#diskGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* TAB 2: DB QUERY LATENCY (ms) */}
            <TabsContent value="database" className="mt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      unit=" ms"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`${val} ms`, "PostgreSQL Latency"]}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item?.fullDate || label;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="dbLatency"
                      name="DB Query Latency"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* TAB 3: DISK STORAGE CURVE */}
            <TabsContent value="disk" className="mt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="diskSoloGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      unit="%"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`${val}%`, "Disk Utilization"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="disk"
                      name="Disk Utilization %"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#diskSoloGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
