import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { LiveMetricGauges } from "./components/MetricCard";
import { HealthCharts } from "./components/HealthCharts";
import { AlertLogsTable } from "./components/AlertLogsTable";
import { TestAlertModal } from "./components/TestAlertModal";
import { SystemHealthNav } from "./components/SystemHealthNav";
import {
  SystemHealthData,
  SystemAlert,
  HealthSnapshot,
  SeverityCounts,
} from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Mail,
  Clock,
  HardDrive,
  Bell,
  ArrowRight,
} from "lucide-react";
import api from "@/api";

export const SystemHealthPage: React.FC = () => {
  // Live health metrics
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  // Time-series history
  const [snapshots, setSnapshots] = useState<HealthSnapshot[]>([]);
  const [historyRange, setHistoryRange] = useState<"1h" | "6h" | "24h" | "7d">("24h");
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Recent Alerts
  const [recentAlerts, setRecentAlerts] = useState<SystemAlert[]>([]);
  const [severityCounts, setSeverityCounts] = useState<SeverityCounts | undefined>(undefined);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);

  // Auto-refresh config
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30 seconds default
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);

  // Fetch Current Live Health Telemetry
  const fetchCurrentHealth = useCallback(async () => {
    try {
      setLoadingHealth(true);
      const res: any = await api.get("/admin/system/health/current");
      if (res.success && res.data) {
        setHealthData(res.data);
        setLastRefreshedAt(new Date());
      }
    } catch (err: any) {
      console.error("Failed to fetch system health telemetry:", err);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Fetch Time-Series History
  const fetchHealthHistory = useCallback(async (range: "1h" | "6h" | "24h" | "7d") => {
    try {
      setLoadingHistory(true);
      const res: any = await api.get(`/admin/system/health/history?range=${range}`);
      if (res.success && Array.isArray(res.data)) {
        setSnapshots(res.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch system health history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch Recent Alerts for Preview
  const fetchRecentAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const res: any = await api.get("/admin/system/alerts", {
        params: { page: 1, limit: 5 },
      });
      if (res.success && res.data) {
        setRecentAlerts(res.data.alerts || []);
        setTotalAlerts(res.data.pagination?.total || res.data.total || 0);
        if (res.data.severityCounts) {
          setSeverityCounts(res.data.severityCounts);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch recent alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // Master refresh callback
  const fetchAllData = useCallback(() => {
    fetchCurrentHealth();
    fetchHealthHistory(historyRange);
    fetchRecentAlerts();
  }, [fetchCurrentHealth, fetchHealthHistory, historyRange, fetchRecentAlerts]);

  // Initial load
  useEffect(() => {
    fetchCurrentHealth();
    fetchHealthHistory(historyRange);
    fetchRecentAlerts();
  }, []);

  // Handle History Range Change
  const handleRangeChange = (range: "1h" | "6h" | "24h" | "7d") => {
    setHistoryRange(range);
    fetchHealthHistory(range);
  };

  // Auto-refresh interval timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchCurrentHealth();
      fetchRecentAlerts();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, fetchCurrentHealth, fetchRecentAlerts]);

  // Overall system status indicator
  const getOverallStatus = () => {
    if (!healthData) return { label: "Checking...", color: "bg-muted text-muted-foreground", icon: Activity };
    if (healthData.status === "critical" || (severityCounts && severityCounts.FATAL + severityCounts.CRITICAL > 0)) {
      return {
        label: "Critical Issues Detected",
        color: "bg-red-500 text-white animate-pulse",
        icon: AlertCircle,
      };
    }
    if (healthData.status === "warning" || (severityCounts && severityCounts.WARNING > 0)) {
      return {
        label: "Degraded Performance",
        color: "bg-amber-500 text-white",
        icon: AlertTriangle,
      };
    }
    return {
      label: "All Systems Operational",
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
      icon: ShieldCheck,
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;
  const unresolvedAlertsCount = severityCounts?.UNRESOLVED_TOTAL || 0;

  return (
    <div className="flex-1 space-y-5 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              System Health & Resource Telemetry
            </h1>
            <Badge className={`${status.color} font-medium flex items-center gap-1.5 px-2.5 py-1 text-xs`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Watchdog Daemon Active (60s loop)</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Refresh Dropdown */}
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg border text-xs">
            <span className="text-muted-foreground font-medium whitespace-nowrap">Auto-refresh:</span>
            <Select
              value={String(autoRefreshInterval)}
              onValueChange={(val) => setAutoRefreshInterval(Number(val))}
            >
              <SelectTrigger className="h-7 w-20 text-xs bg-background border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Off</SelectItem>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={fetchAllData}
            disabled={loadingHealth}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Send Test Alert Trigger */}
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90"
            onClick={() => setTestModalOpen(true)}
          >
            <Mail className="w-3.5 h-3.5" />
            Send Test Alert
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Bar between System Health Pages */}
      <SystemHealthNav unresolvedAlertsCount={unresolvedAlertsCount} />

      {/* Critical Active Alerts Banner (if any unresolved Fatal/Critical alerts exist) */}
      {severityCounts && (severityCounts.FATAL > 0 || severityCounts.CRITICAL > 0) && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start justify-between gap-3 text-red-950 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-sm text-red-600 dark:text-red-400">
                Active Unresolved System Incidents Detected
              </div>
              <p className="text-muted-foreground">
                There are currently <strong>{severityCounts.FATAL} Fatal</strong> and{" "}
                <strong>{severityCounts.CRITICAL} Critical</strong> unresolved alert(s) logged by the
                watchdog daemon. Automated email notifications have been dispatched.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="destructive" className="h-8 text-xs gap-1 shrink-0">
            <Link to="/system-health/alerts">
              View Alerts
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      {/* 1. Live KPI Telemetry Gauges (Disk 70%/80%, RAM, DB Latency, MQTT Broker, CPU) */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          Live System Resource Telemetry & Thresholds
        </h2>
        <LiveMetricGauges
          disk={healthData?.disk}
          memory={healthData?.memory}
          cpu={healthData?.cpu}
          database={healthData?.database}
          mqtt={healthData?.mqtt}
          system={healthData?.system}
        />
      </div>

      {/* 2. Time-Series Performance History Charts */}
      <HealthCharts
        snapshots={snapshots}
        currentRange={historyRange}
        onRangeChange={handleRangeChange}
        loading={loadingHistory}
      />

      {/* 3. Quick Recent Alerts Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Recent System Alerts
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs text-primary h-7 gap-1">
            <Link to="/system-health/alerts">
              <span>View Full Incident Log ({totalAlerts})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        <AlertLogsTable
          alerts={recentAlerts}
          severityCounts={severityCounts}
          totalAlerts={totalAlerts}
          currentPage={1}
          totalPages={1}
          loading={loadingAlerts}
          onPageChange={() => {}}
          onFiltersChange={() => {}}
          onRefresh={fetchRecentAlerts}
          onAlertResolved={() => {
            fetchCurrentHealth();
            fetchRecentAlerts();
          }}
        />
      </div>

      {/* Test Alert Dispatcher Modal */}
      <TestAlertModal
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        onAlertSentSuccess={fetchAllData}
      />
    </div>
  );
};

export default SystemHealthPage;
