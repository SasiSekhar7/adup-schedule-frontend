import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SystemHealthNav } from "./components/SystemHealthNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Database,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  HardDrive,
  Filter,
  Search,
  Lock,
  Loader2,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import api from "@/api";
import {
  PartitionTableInfo,
  PartitionSummary,
  PartitionListResponse,
} from "./types";

export const PartitionsPage: React.FC = () => {
  const [partitions, setPartitions] = useState<PartitionTableInfo[]>([]);
  const [summary, setSummary] = useState<PartitionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [clearableFilter, setClearableFilter] = useState<string>("ALL");

  // Selection for Batch Truncation
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  // Single Truncate Modal State
  const [singleTruncateTarget, setSingleTruncateTarget] = useState<PartitionTableInfo | null>(null);
  const [singleConfirmed, setSingleConfirmed] = useState<boolean>(false);
  const [isTruncatingSingle, setIsTruncatingSingle] = useState<boolean>(false);

  // Batch Truncate Modal State
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [batchConfirmed, setBatchConfirmed] = useState<boolean>(false);
  const [isTruncatingBatch, setIsTruncatingBatch] = useState<boolean>(false);

  // Scoped Retention Cleanup Modal State
  const [retentionModalOpen, setRetentionModalOpen] = useState<boolean>(false);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [includeTelemetry, setIncludeTelemetry] = useState<boolean>(true);
  const [includeEvents, setIncludeEvents] = useState<boolean>(true);
  const [isCleaningRetention, setIsCleaningRetention] = useState<boolean>(false);

  // Action feedback / notification alert
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "info";
    title: string;
    description: string;
  } | null>(null);

  // Fetch Partitions Data from backend
  const fetchPartitions = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.get("/admin/system/partitions");
      if (res?.data) {
        setPartitions(res.data.partitions || []);
        setSummary(res.data.summary || null);
      }
    } catch (err: any) {
      console.error("Failed to fetch database partitions:", err);
      setActionMessage({
        type: "error",
        title: "Failed to Fetch Partitions",
        description: err?.response?.data?.message || err.message || "An unexpected error occurred while querying database partitions.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Alert count for nav badge
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res: any = await api.get("/admin/system/alerts", { params: { limit: 1 } });
        if (res.success && res.data?.severityCounts) {
          setUnresolvedAlertsCount(res.data.severityCounts.UNRESOLVED_TOTAL || 0);
        }
      } catch (_) {}
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchPartitions();
  }, [fetchPartitions]);

  // Filtered partitions list
  const filteredPartitions = useMemo(() => {
    return partitions.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.tableName.toLowerCase().includes(q);
        const matchesFormattedDate = item.formattedDate.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesFormattedDate && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "ALL") {
        if (categoryFilter === "telemetry" && item.prefix !== "devicetelemetrylogs") return false;
        if (categoryFilter === "events" && item.prefix !== "deviceeventlogs") return false;
        if (categoryFilter === "proofofplay" && item.prefix !== "proofofplaylogs") return false;
      }

      // Period filter
      if (periodFilter !== "ALL") {
        if (periodFilter === "current" && !item.isCurrentMonth) return false;
        if (periodFilter === "past" && !item.isPastMonth) return false;
        if (periodFilter === "future" && !item.isFutureMonth) return false;
      }

      // Clearable status filter
      if (clearableFilter !== "ALL") {
        if (clearableFilter === "clearable" && !item.canClear) return false;
        if (clearableFilter === "protected" && item.canClear) return false;
      }

      return true;
    });
  }, [partitions, searchQuery, categoryFilter, periodFilter, clearableFilter]);

  // Eligible clearable partitions in current filtered view
  const clearableInView = useMemo(() => {
    return filteredPartitions.filter((p) => p.canClear);
  }, [filteredPartitions]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTables(clearableInView.map((p) => p.tableName));
    } else {
      setSelectedTables([]);
    }
  };

  const handleToggleTable = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]
    );
  };

  const isAllSelected =
    clearableInView.length > 0 && selectedTables.length === clearableInView.length;

  // Execute Single Partition Safe Truncate
  const handleExecuteSingleTruncate = async () => {
    if (!singleTruncateTarget) return;
    setIsTruncatingSingle(true);
    try {
      const res: any = await api.post("/admin/system/partitions/clear", {
        tableName: singleTruncateTarget.tableName,
      });

      setActionMessage({
        type: "success",
        title: "Partition Successfully Cleared",
        description:
          res?.message ||
          `Partition '${singleTruncateTarget.tableName}' was truncated. Schema & routing definitions remain intact.`,
      });

      setSingleTruncateTarget(null);
      setSingleConfirmed(false);
      setSelectedTables((prev) => prev.filter((t) => t !== singleTruncateTarget.tableName));
      fetchPartitions();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        title: "Clear Partition Failed",
        description:
          err?.response?.data?.message || err.message || "Failed to clear partition.",
      });
    } finally {
      setIsTruncatingSingle(false);
    }
  };

  // Execute Batch Safe Truncate
  const handleExecuteBatchTruncate = async () => {
    if (selectedTables.length === 0) return;
    setIsTruncatingBatch(true);
    try {
      const res: any = await api.post("/admin/system/partitions/clear-batch", {
        tableNames: selectedTables,
      });

      const data = res?.data || res;
      setActionMessage({
        type: "success",
        title: "Batch Partitions Cleared",
        description: `Successfully cleared ${data.successfulCount || selectedTables.length} partitions (${(
          data.totalRowsCleared || 0
        ).toLocaleString()} rows removed, ${data.totalReclaimedFormatted || "storage reclaimed"}).`,
      });

      setBatchModalOpen(false);
      setBatchConfirmed(false);
      setSelectedTables([]);
      fetchPartitions();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        title: "Batch Clear Failed",
        description:
          err?.response?.data?.message || err.message || "Failed to clear batch partitions.",
      });
    } finally {
      setIsTruncatingBatch(false);
    }
  };

  // Execute Retention Cleanup
  const handleExecuteRetentionCleanup = async () => {
    const logTypes: string[] = [];
    if (includeTelemetry) logTypes.push("telemetry");
    if (includeEvents) logTypes.push("events");

    if (logTypes.length === 0) {
      alert("Please select at least one log type (Telemetry or Events).");
      return;
    }

    setIsCleaningRetention(true);
    try {
      const res: any = await api.post("/admin/system/partitions/clear-retention", {
        olderThanDays: retentionDays,
        logTypes,
      });

      setActionMessage({
        type: "success",
        title: "Retention Cleanup Completed",
        description:
          res?.message ||
          `Successfully purged records older than ${retentionDays} days. Proof of Play logs were untouched.`,
      });

      setRetentionModalOpen(false);
      fetchPartitions();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        title: "Retention Cleanup Failed",
        description:
          err?.response?.data?.message || err.message || "Failed to execute retention cleanup.",
      });
    } finally {
      setIsCleaningRetention(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Device Logs & Database Partitions
                </h1>
                <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-semibold px-2.5 py-0.5 text-xs">
                  Partition Routing Active
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Manage, inspect, and safely clear Device Telemetry and Device Event log partitions while strictly preserving immutable Proof of Play audit records.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPartitions}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRetentionModalOpen(true)}
            className="gap-1.5 text-xs border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Scoped Retention Cleanup
          </Button>

          {selectedTables.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setBatchConfirmed(false);
                setBatchModalOpen(true);
              }}
              className="gap-1.5 text-xs shadow-sm animate-in fade-in duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Selected ({selectedTables.length})
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <SystemHealthNav unresolvedAlertsCount={unresolvedAlertsCount} />

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : actionMessage.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
              : "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : actionMessage.type === "error" ? (
            <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600 dark:text-red-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <div className="flex-1 text-xs md:text-sm">
            <h4 className="font-semibold">{actionMessage.title}</h4>
            <p className="mt-0.5 opacity-90">{actionMessage.description}</p>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Safe Partition Routing Notice */}
      <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-foreground font-semibold">
            PostgreSQL Safe Truncation Architecture
          </p>
          <p>
            Clearing log tables in this console uses PostgreSQL <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-foreground">TRUNCATE TABLE</code> rather than dropping relations. This safely removes all rows and immediately reclaims 100% disk space while preserving database table schema, indexes, and partition routing definitions—preventing partition routing failures for active devices.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Database Partitions */}
        <Card className="shadow-sm border border-border/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Partition Tables
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary ? summary.totalPartitions : "--"}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Total Rows:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.totalRows.toLocaleString() : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Total Storage:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.totalSizeFormatted : "--"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Device Telemetry Logs */}
        <Card className="shadow-sm border border-border/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Device Telemetry Logs
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary ? summary.telemetry.sizeFormatted : "--"}
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                Clearable
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Partitions:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.telemetry.partitionCount : "--"} tables
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Total Records:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.telemetry.rowCount.toLocaleString() : "--"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Device Event Logs */}
        <Card className="shadow-sm border border-border/80">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Device Event Logs
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary ? summary.events.sizeFormatted : "--"}
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold">
                Clearable
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Partitions:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.events.partitionCount : "--"} tables
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Total Records:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.events.rowCount.toLocaleString() : "--"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Proof of Play Logs (Protected) */}
        <Card className="shadow-sm border border-red-500/30 bg-red-500/[0.02]">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Proof of Play (Audit)
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary ? summary.proofOfPlay.sizeFormatted : "--"}
              </div>
              <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-[10px] font-bold tracking-wide">
                PROTECTED
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>Partitions:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.proofOfPlay.partitionCount : "--"} tables
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Total Records:</span>
              <span className="font-semibold text-foreground">
                {summary ? summary.proofOfPlay.rowCount.toLocaleString() : "--"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table & Controls */}
      <Card className="shadow-sm border border-border/80">
        <CardHeader className="pb-3 border-b bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Database Partition Relations
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Detailed listing of PostgreSQL range partition tables across Telemetry, Events, and Proof of Play.
              </CardDescription>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search table or period..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Log Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="telemetry">Telemetry Logs</SelectItem>
                  <SelectItem value="events">Event Logs</SelectItem>
                  <SelectItem value="proofofplay">Proof of Play (Protected)</SelectItem>
                </SelectContent>
              </Select>

              {/* Period Filter */}
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[125px] h-8 text-xs">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Periods</SelectItem>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="past">Past Months</SelectItem>
                  <SelectItem value="future">Future Months</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={clearableFilter} onValueChange={setClearableFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Clear Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="clearable">Clearable Only</SelectItem>
                  <SelectItem value="protected">Protected Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={clearableInView.length === 0}
                      aria-label="Select all clearable partitions"
                    />
                  </th>
                  <th className="py-3 px-4">Log Category</th>
                  <th className="py-3 px-4">Partition Table Name</th>
                  <th className="py-3 px-4">Period / Month</th>
                  <th className="py-3 px-4 text-right">Row Count</th>
                  <th className="py-3 px-4 text-right">Table Size</th>
                  <th className="py-3 px-4 text-right">Index Size</th>
                  <th className="py-3 px-4 text-center">Protection & Safeguards</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span>Querying PostgreSQL database partitions and sizes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPartitions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Database className="w-8 h-8 opacity-30" />
                        <span className="font-semibold text-foreground">No matching partitions found</span>
                        <span className="text-xs">Adjust your search query or filter selection.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPartitions.map((item) => {
                    const isSelected = selectedTables.includes(item.tableName);
                    return (
                      <tr
                        key={item.tableName}
                        className={`hover:bg-muted/30 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          {item.canClear ? (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleTable(item.tableName)}
                              aria-label={`Select ${item.tableName}`}
                            />
                          ) : (
                            <div className="flex justify-center" title="Proof of Play logs are immutable and cannot be selected for clearing.">
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.prefix === "devicetelemetrylogs" && (
                              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 gap-1 font-medium text-[11px]">
                                <Activity className="w-3 h-3" />
                                Telemetry
                              </Badge>
                            )}
                            {item.prefix === "deviceeventlogs" && (
                              <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20 gap-1 font-medium text-[11px]">
                                <Layers className="w-3 h-3" />
                                Events
                              </Badge>
                            )}
                            {item.prefix === "proofofplaylogs" && (
                              <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 gap-1 font-medium text-[11px]">
                                <ShieldAlert className="w-3 h-3" />
                                Proof of Play
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Table Name */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {item.tableName}
                          </span>
                        </td>

                        {/* Period / Date */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{item.formattedDate}</span>
                            {item.isCurrentMonth && (
                              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-semibold py-0 px-1.5">
                                Current
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Row Count */}
                        <td className="py-3 px-4 text-right font-medium">
                          {item.rowCount.toLocaleString()}
                        </td>

                        {/* Total Table Size */}
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          {item.sizeFormatted}
                        </td>

                        {/* Index Size */}
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {item.indexSizeMB} MB
                        </td>

                        {/* Protection & Safeguard */}
                        <td className="py-3 px-4 text-center">
                          {item.isProtected ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-[11px] font-semibold" title={item.protectionReason || "Protected"}>
                              <Lock className="w-3 h-3" />
                              Immutable Audit
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Safe to Clear
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          {item.canClear ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSingleConfirmed(false);
                                setSingleTruncateTarget(item);
                              }}
                              disabled={item.rowCount === 0}
                              className="h-7 text-xs text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-500/10 gap-1 px-2.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear Logs
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="h-7 text-xs text-muted-foreground/50 gap-1 px-2.5 cursor-not-allowed opacity-50"
                              title="Proof of Play audit records cannot be cleared."
                            >
                              <Lock className="w-3 h-3" />
                              Locked
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{filteredPartitions.length}</span> of{" "}
              <span className="font-semibold text-foreground">{partitions.length}</span> total partitions
            </div>
            {selectedTables.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {selectedTables.length} clearable partitions selected
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelectedTables([])}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Single Partition Truncate Modal */}
      <Dialog
        open={Boolean(singleTruncateTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setSingleTruncateTarget(null);
            setSingleConfirmed(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                Safely Clear Partition Logs
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              This operation safely empties all log records in this partition table and immediately reclaims storage on disk.
            </DialogDescription>
          </DialogHeader>

          {singleTruncateTarget && (
            <div className="space-y-3 my-2 text-xs">
              <div className="p-3 bg-muted rounded-lg space-y-2 border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Table Name:</span>
                  <span className="font-mono font-bold text-foreground">
                    {singleTruncateTarget.tableName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Log Category:</span>
                  <span className="font-semibold text-foreground">
                    {singleTruncateTarget.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-semibold text-foreground">
                    {singleTruncateTarget.formattedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Records:</span>
                  <span className="font-bold text-foreground">
                    {singleTruncateTarget.rowCount.toLocaleString()} rows
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reclaimable Size:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {singleTruncateTarget.sizeFormatted}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-900 dark:text-blue-300">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  Partition Routing Preserved
                </p>
                <p className="text-[11px] opacity-90">
                  Using PostgreSQL <code className="font-mono font-bold">TRUNCATE TABLE</code>. The table schema, indexes, and partition bounds remain active. Active devices sending logs for this month will continue without errors.
                </p>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="confirm-single"
                  checked={singleConfirmed}
                  onCheckedChange={(checked) => setSingleConfirmed(Boolean(checked))}
                />
                <label
                  htmlFor="confirm-single"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer"
                >
                  I understand that {singleTruncateTarget.rowCount.toLocaleString()} log records in <span className="font-mono font-bold">{singleTruncateTarget.tableName}</span> will be permanently cleared.
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSingleTruncateTarget(null);
                setSingleConfirmed(false);
              }}
              disabled={isTruncatingSingle}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleExecuteSingleTruncate}
              disabled={!singleConfirmed || isTruncatingSingle}
              className="gap-2"
            >
              {isTruncatingSingle ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Clearing Partition...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm & Clear Logs
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Partition Truncate Modal */}
      <Dialog
        open={batchModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBatchModalOpen(false);
            setBatchConfirmed(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                Batch Clear {selectedTables.length} Partition Tables
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Safely empty all records across selected Device Telemetry and Device Event partition tables.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-3 bg-muted rounded-lg border max-h-48 overflow-y-auto space-y-1">
              <p className="font-semibold text-foreground mb-1">Selected Tables to Clear:</p>
              {selectedTables.map((t) => (
                <div key={t} className="flex items-center justify-between py-1 border-b last:border-0 border-border/50">
                  <span className="font-mono font-medium">{t}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Safe Truncate
                  </Badge>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-900 dark:text-blue-300">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                Zero Downtime & Preserved Routing
              </p>
              <p className="text-[11px] opacity-90">
                All table schemas and partition definitions are kept intact. Only the row records are emptied to instantly reclaim storage.
              </p>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="confirm-batch"
                checked={batchConfirmed}
                onCheckedChange={(checked) => setBatchConfirmed(Boolean(checked))}
              />
              <label
                htmlFor="confirm-batch"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer"
              >
                I confirm that I want to clear all {selectedTables.length} selected partition tables.
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBatchModalOpen(false);
                setBatchConfirmed(false);
              }}
              disabled={isTruncatingBatch}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleExecuteBatchTruncate}
              disabled={!batchConfirmed || isTruncatingBatch}
              className="gap-2"
            >
              {isTruncatingBatch ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Clearing {selectedTables.length} Partitions...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear {selectedTables.length} Partitions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scoped Retention Cleanup Modal */}
      <Dialog
        open={retentionModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRetentionModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                Scoped Retention Cleanup
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Purge historical Telemetry and/or Event logs older than a specific age across all partitions without clearing recent data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Days selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Delete records older than:
              </label>
              <Select
                value={String(retentionDays)}
                onValueChange={(val) => setRetentionDays(parseInt(val, 10))}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select retention threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Older than 7 days (1 week)</SelectItem>
                  <SelectItem value="15">Older than 15 days</SelectItem>
                  <SelectItem value="30">Older than 30 days (1 month)</SelectItem>
                  <SelectItem value="60">Older than 60 days (2 months)</SelectItem>
                  <SelectItem value="90">Older than 90 days (3 months)</SelectItem>
                  <SelectItem value="180">Older than 180 days (6 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Log Types */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-foreground">
                Apply cleanup to log types:
              </label>
              <div className="space-y-2 p-3 bg-muted rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-telemetry"
                    checked={includeTelemetry}
                    onCheckedChange={(c) => setIncludeTelemetry(Boolean(c))}
                  />
                  <label htmlFor="include-telemetry" className="text-xs font-medium cursor-pointer">
                    Device Telemetry Logs (Heartbeats, Metrics, Ping)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-events"
                    checked={includeEvents}
                    onCheckedChange={(c) => setIncludeEvents(Boolean(c))}
                  />
                  <label htmlFor="include-events" className="text-xs font-medium cursor-pointer">
                    Device Event Logs (App Events, Warnings, Errors)
                  </label>
                </div>
              </div>
            </div>

            {/* Proof of Play Audit Safeguard Banner */}
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-900 dark:text-red-300">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Proof of Play Logs are Audit-Protected</span>
              </div>
              <p className="text-[11px] opacity-90">
                Proof of Play records are legally mandated billing audit trails and will NOT be purged by this cleanup routine.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetentionModalOpen(false)}
              disabled={isCleaningRetention}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteRetentionCleanup}
              disabled={(!includeTelemetry && !includeEvents) || isCleaningRetention}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCleaningRetention ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Purging Logs...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Logs Older Than {retentionDays} Days
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartitionsPage;
