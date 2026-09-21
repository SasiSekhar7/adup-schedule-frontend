import React from "react";
import {
  HardDrive,
  Database,
  Cpu,
  Activity,
  Wifi,
  WifiOff,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DiskMetrics,
  MemoryMetrics,
  CpuMetrics,
  DatabaseMetrics,
  MqttMetrics,
  SystemInfo,
} from "../types";

interface MetricCardProps {
  disk?: DiskMetrics;
  memory?: MemoryMetrics;
  cpu?: CpuMetrics;
  database?: DatabaseMetrics;
  mqtt?: MqttMetrics;
  system?: SystemInfo;
}

export const LiveMetricGauges: React.FC<MetricCardProps> = ({
  disk,
  memory,
  cpu,
  database,
  mqtt,
  system,
}) => {
  // Disk status color helper (>=80% Red, >=70% Yellow, <70% Green)
  const getDiskColor = (percent: number) => {
    if (percent >= 80) return "text-red-600 dark:text-red-400";
    if (percent >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getDiskBarColor = (percent: number) => {
    if (percent >= 80) return "bg-red-500";
    if (percent >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getDiskBadge = (percent: number) => {
    if (percent >= 80) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3 h-3" /> Critical (&ge;80%)
        </Badge>
      );
    }
    if (percent >= 70) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 font-semibold">
          <AlertTriangle className="w-3 h-3" /> Warning (&ge;70%)
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Healthy (&lt;70%)
      </Badge>
    );
  };

  // Memory status color helper
  const getMemoryBarColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 80) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. DISK STORAGE CARD */}
      <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            disk ? getDiskBarColor(disk.usedPercent) : "bg-muted"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            Disk Storage
          </CardTitle>
          {disk && getDiskBadge(disk.usedPercent)}
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {disk ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold tracking-tight ${getDiskColor(disk.usedPercent)}`}>
                  {disk.usedPercent}%
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {disk.freeFormatted} free
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getDiskBarColor(
                      disk.usedPercent
                    )}`}
                    style={{ width: `${Math.min(disk.usedPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Used: {disk.usedFormatted}</span>
                  <span>Total: {disk.totalFormatted}</span>
                </div>
              </div>

              <div className="text-[11px] bg-muted/50 p-2 rounded-md border border-border/50 flex items-center justify-between text-muted-foreground">
                <span>Mount: <code className="font-mono text-[10px] bg-background px-1 py-0.5 rounded">{disk.mountPath}</code></span>
                <span className="text-[10px]">Threshold: 70% / 80%</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">Loading disk telemetry...</div>
          )}
        </CardContent>
      </Card>

      {/* 2. SYSTEM RAM & HEAP CARD */}
      <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            memory ? getMemoryBarColor(memory.usedPercent) : "bg-muted"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            System RAM
          </CardTitle>
          {memory && (
            <Badge
              variant={memory.usedPercent >= 90 ? "destructive" : "outline"}
              className={
                memory.usedPercent < 90
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  : ""
              }
            >
              {memory.usedPercent >= 90 ? "Critical" : memory.usedPercent >= 80 ? "High" : "Optimal"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {memory ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {memory.usedPercent}%
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {memory.usedFormatted} / {memory.totalFormatted}
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getMemoryBarColor(
                      memory.usedPercent
                    )}`}
                    style={{ width: `${Math.min(memory.usedPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Free: {memory.freeFormatted}</span>
                  <span>Usage: {memory.usedPercent}%</span>
                </div>
              </div>

              <div className="text-[11px] bg-muted/50 p-2 rounded-md border border-border/50 space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Node Heap:</span>
                  <span className="font-semibold text-foreground">{memory.process?.heapUsedFormatted || "N/A"}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Process RSS:</span>
                  <span>{memory.process?.rssFormatted || "N/A"}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">Loading memory telemetry...</div>
          )}
        </CardContent>
      </Card>

      {/* 3. POSTGRESQL DATABASE CARD */}
      <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            database?.status === "healthy"
              ? "bg-emerald-500"
              : database?.status === "degraded"
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            PostgreSQL DB
          </CardTitle>
          {database && (
            <Badge
              className={
                database.status === "healthy"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : database.status === "degraded"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  : "bg-red-500 text-white"
              }
            >
              {database.status.toUpperCase()}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {database ? (
            <>
              <div className="flex items-baseline justify-between">
                <div>
                  <span
                    className={`text-2xl font-bold tracking-tight ${
                      database.latencyMs < 50
                        ? "text-emerald-600 dark:text-emerald-400"
                        : database.latencyMs < 200
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {database.latencyMs} ms
                  </span>
                  <span className="text-xs text-muted-foreground block">Query Latency</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground block">
                    {database.sizeFormatted}
                  </span>
                  <span className="text-[11px] text-muted-foreground">DB Size</span>
                </div>
              </div>

              <div className="text-[11px] bg-muted/50 p-2 rounded-md border border-border/50 space-y-1.5 text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Connection Pool:</span>
                  <span className="font-semibold text-foreground">
                    {database.pool?.using || 0} active / {database.pool?.max || 10} max
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Idle Connections:</span>
                  <span>{database.pool?.idle || 0}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">Probing database health...</div>
          )}
        </CardContent>
      </Card>

      {/* 4. MQTT SCREEN FLEET BROKER CARD */}
      <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            mqtt?.connected ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {mqtt?.connected ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            MQTT Screen Fleet
          </CardTitle>
          {mqtt && (
            <Badge
              className={
                mqtt.connected
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500 text-white"
              }
            >
              {mqtt.connected ? "ONLINE" : "OFFLINE"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {mqtt ? (
            <>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold tracking-tight text-foreground capitalize">
                    {mqtt.status}
                  </span>
                  <span className="text-xs text-muted-foreground block">Broker Status</span>
                </div>
                {mqtt.reconnectAttempts > 0 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-400">
                    {mqtt.reconnectAttempts} retries
                  </Badge>
                )}
              </div>

              <div className="text-[11px] bg-muted/50 p-2 rounded-md border border-border/50 space-y-1 text-muted-foreground">
                <div className="truncate">
                  <span className="text-muted-foreground">Host: </span>
                  <span className="font-mono text-[10px] text-foreground">
                    {mqtt.brokerUrl || "Standard MQTT Broker"}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] pt-0.5">
                  <span>Push Schedule sync:</span>
                  <span className={mqtt.connected ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                    {mqtt.connected ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">Checking MQTT broker...</div>
          )}
        </CardContent>
      </Card>

      {/* 5. CPU LOAD & SYSTEM UPTIME CARD */}
      <Card className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            CPU & Uptime
          </CardTitle>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
            {cpu?.cores || 1} Cores
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {cpu && system ? (
            <>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {cpu.usedPercent}%
                  </span>
                  <span className="text-xs text-muted-foreground block">CPU Usage</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-foreground block">
                    {system.processUptimeFormatted}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Node Uptime</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cpu.usedPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Load (1m/5m/15m):</span>
                  <span>{cpu.loadAvg1m.toFixed(2)}, {cpu.loadAvg5m.toFixed(2)}, {cpu.loadAvg15m.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] bg-muted/50 p-2 rounded-md border border-border/50 flex justify-between text-muted-foreground">
                <span>Node: <strong className="text-foreground">{system.nodeVersion}</strong></span>
                <span>OS: <strong className="text-foreground capitalize">{system.platform}</strong></span>
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground py-4 text-center">Loading CPU metrics...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
