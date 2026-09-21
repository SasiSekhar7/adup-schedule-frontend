import React, { useState, useEffect, useCallback } from "react";
import { SystemAlert, SeverityCounts } from "./types";
import { AlertLogsTable } from "./components/AlertLogsTable";
import { TestAlertModal } from "./components/TestAlertModal";
import { SystemHealthNav } from "./components/SystemHealthNav";
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
  Bell,
  RefreshCw,
  Mail,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import api from "@/api";

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [severityCounts, setSeverityCounts] = useState<SeverityCounts | undefined>(undefined);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  const [alertFilters, setAlertFilters] = useState<{
    severity?: string;
    category?: string;
    resolved?: string;
    search?: string;
  }>({
    severity: "ALL",
    category: "ALL",
    resolved: "all",
    search: "",
  });

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s default
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);

  // Fetch Alert Logs
  const fetchAlertLogs = useCallback(
    async (page = currentPage, filters = alertFilters) => {
      try {
        setLoadingAlerts(true);
        const params: any = {
          page,
          limit: 15,
        };

        if (filters.severity && filters.severity !== "ALL") {
          params.severity = filters.severity;
        }
        if (filters.category && filters.category !== "ALL") {
          params.category = filters.category;
        }
        if (filters.resolved && filters.resolved !== "all") {
          params.resolved = filters.resolved === "resolved" ? "true" : "false";
        }
        if (filters.search && filters.search.trim()) {
          params.search = filters.search.trim();
        }

        const res: any = await api.get("/admin/system/alerts", { params });
        if (res.success && res.data) {
          setAlerts(res.data.alerts || []);
          setTotalAlerts(res.data.pagination?.total || res.data.total || 0);
          setTotalPages(res.data.pagination?.totalPages || res.data.totalPages || 1);
          setCurrentPage(res.data.pagination?.page || res.data.page || 1);
          if (res.data.severityCounts) {
            setSeverityCounts(res.data.severityCounts);
          }
          setLastRefreshedAt(new Date());
        }
      } catch (err: any) {
        console.error("Failed to fetch alert logs:", err);
      } finally {
        setLoadingAlerts(false);
      }
    },
    [currentPage, alertFilters]
  );

  useEffect(() => {
    fetchAlertLogs(1, alertFilters);
  }, []);

  // Handle Alert Filters Change
  const handleFiltersChange = (newFilters: {
    severity?: string;
    category?: string;
    resolved?: string;
    search?: string;
  }) => {
    setAlertFilters(newFilters);
    setCurrentPage(1);
    fetchAlertLogs(1, newFilters);
  };

  // Handle Alert Page Change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAlertLogs(page, alertFilters);
  };

  // Handle Single Alert Resolved
  const handleAlertResolved = (updatedAlert: SystemAlert) => {
    setAlerts((prev) =>
      prev.map((a) => (a.alert_id === updatedAlert.alert_id ? updatedAlert : a))
    );
    fetchAlertLogs(currentPage, alertFilters);
  };

  // Auto-refresh interval timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchAlertLogs(currentPage, alertFilters);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, fetchAlertLogs, currentPage, alertFilters]);

  const unresolvedCount = severityCounts?.UNRESOLVED_TOTAL || 0;

  return (
    <div className="flex-1 space-y-5 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-500" />
              Incident Alerts & Error Triage
            </h1>
            {unresolvedCount > 0 ? (
              <Badge className="bg-red-500 text-white font-medium flex items-center gap-1.5 px-2.5 py-1 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {unresolvedCount} Active Incident{unresolvedCount > 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1.5 px-2.5 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                All Incidents Resolved
              </Badge>
            )}
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
            onClick={() => fetchAlertLogs(currentPage, alertFilters)}
            disabled={loadingAlerts}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? "animate-spin" : ""}`} />
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
      <SystemHealthNav unresolvedAlertsCount={unresolvedCount} />

      {/* Critical Active Alerts Banner (if any unresolved Fatal/Critical alerts exist) */}
      {severityCounts && (severityCounts.FATAL > 0 || severityCounts.CRITICAL > 0) && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-950 dark:text-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <div className="font-semibold text-sm text-red-600 dark:text-red-400">
              Active Unresolved System Incidents Detected
            </div>
            <p className="text-muted-foreground">
              There are currently <strong>{severityCounts.FATAL} Fatal</strong> and{" "}
              <strong>{severityCounts.CRITICAL} Critical</strong> unresolved alert(s) logged by the
              watchdog daemon. Automated email notifications have been dispatched. Review the incident log
              below for stack traces and remediation steps.
            </p>
          </div>
        </div>
      )}

      {/* Full Database Incident Alerts Table */}
      <AlertLogsTable
        alerts={alerts}
        severityCounts={severityCounts}
        totalAlerts={totalAlerts}
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loadingAlerts}
        onPageChange={handlePageChange}
        onFiltersChange={handleFiltersChange}
        onRefresh={() => fetchAlertLogs(currentPage, alertFilters)}
        onAlertResolved={handleAlertResolved}
      />

      {/* Test Alert Dispatcher Modal */}
      <TestAlertModal
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        onAlertSentSuccess={() => fetchAlertLogs(currentPage, alertFilters)}
      />
    </div>
  );
};

export default AlertsPage;
