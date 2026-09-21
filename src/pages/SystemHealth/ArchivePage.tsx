import React, { useState, useEffect, useCallback, useRef } from "react";
import { SystemHealthNav } from "./components/SystemHealthNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  Archive,
  RefreshCw,
  Play,
  Download,
  Database,
  HardDrive,
  Cloud,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileArchive,
  ExternalLink,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Loader2,
} from "lucide-react";
import api from "@/api";

interface ArchivalStats {
  totalArchivedPartitions: number;
  totalFailedPartitions: number;
  totalRowsArchived: number;
  totalBytesReclaimed: number;
  totalReclaimedMB: string;
  totalReclaimedGB: string;
  pendingEligiblePartitionsCount: number;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  s3Bucket: string;
  s3Prefix: string;
  s3Region: string;
  defaultRetentionMonths: number;
}

interface EligiblePartition {
  tableName: string;
  category: string;
  prefix: string;
  partitionDate: string;
  rowCount: number;
  sizeBytes: number;
  sizeMB: string;
  lastArchivedStatus: string;
  lastArchivedAt: string | null;
}

interface ActiveJobStatus {
  isRunning: boolean;
  jobId: string | null;
  startedAt: string | null;
  triggeredBy: string | null;
  currentTable: string | null;
  currentStep: string;
  totalTables: number;
  completedTables: number;
  failedTables: number;
  currentProgressPercent: number;
  recentLogs: string[];
  s3Bucket?: string;
  s3Prefix?: string;
  region?: string;
}

interface ArchivalHistoryItem {
  archive_id: string;
  job_id: string;
  table_name: string;
  table_prefix: string;
  partition_date: string;
  row_count: number;
  file_size_bytes: number;
  s3_bucket: string;
  s3_key: string;
  s3_region: string;
  status: "SUCCESS" | "FAILED" | "RUNNING" | "SKIPPED";
  table_dropped: boolean;
  error_message: string | null;
  triggered_by: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export const ArchivePage: React.FC = () => {
  const [stats, setStats] = useState<ArchivalStats | null>(null);
  const [eligiblePartitions, setEligiblePartitions] = useState<EligiblePartition[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [retentionMonths, setRetentionMonths] = useState<number>(4);
  const [activeJob, setActiveJob] = useState<ActiveJobStatus | null>(null);
  const [history, setHistory] = useState<ArchivalHistoryItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingEligible, setLoadingEligible] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [prefixFilter, setPrefixFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [runModalOpen, setRunModalOpen] = useState<boolean>(false);
  const [errorModalItem, setErrorModalItem] = useState<ArchivalHistoryItem | null>(null);
  const [isSubmittingRun, setIsSubmittingRun] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res: any = await api.get("/admin/system/archive/stats");
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to fetch archival stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch Eligible Partitions
  const fetchEligible = useCallback(async () => {
    setLoadingEligible(true);
    try {
      const res: any = await api.get(`/admin/system/archive/eligible?retentionMonths=${retentionMonths}`);
      if (res?.partitions) {
        setEligiblePartitions(res.partitions);
      }
    } catch (err) {
      console.error("Failed to fetch eligible partitions:", err);
    } finally {
      setLoadingEligible(false);
    }
  }, [retentionMonths]);

  // Fetch Active Job Status
  const fetchJobStatus = useCallback(async () => {
    try {
      const res: any = await api.get("/admin/system/archive/status");
      if (res?.status) {
        setActiveJob(res.status);
      }
    } catch (err) {
      console.error("Failed to fetch job status:", err);
    }
  }, []);

  // Fetch History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (prefixFilter !== "ALL") params.append("tablePrefix", prefixFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res: any = await api.get(`/admin/system/archive/history?${params.toString()}`);
      if (res?.history) {
        setHistory(res.history);
        setPagination(res.pagination || { page: 1, limit: 15, total: res.history.length, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to fetch archival history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, prefixFilter, searchQuery]);

  // Refresh All Data
  const refreshAll = useCallback(() => {
    fetchStats();
    fetchEligible();
    fetchJobStatus();
    fetchHistory();
  }, [fetchStats, fetchEligible, fetchJobStatus, fetchHistory]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Poll active job status every 3 seconds if job is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeJob?.isRunning) {
      interval = setInterval(() => {
        fetchJobStatus();
        fetchStats();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJob?.isRunning, fetchJobStatus, fetchStats]);

  // Auto-scroll job logs terminal
  useEffect(() => {
    if (activeJob?.isRunning && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeJob?.recentLogs]);

  // Trigger Archival Job
  const handleTriggerArchival = async () => {
    setIsSubmittingRun(true);
    try {
      const payload: any = {
        retentionMonths,
      };
      if (selectedTables.length > 0) {
        payload.selectedTables = selectedTables;
      }

      await api.post("/admin/system/archive/run", payload);
      setRunModalOpen(false);
      setSelectedTables([]);
      fetchJobStatus();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Failed to trigger archival job");
    } finally {
      setIsSubmittingRun(false);
    }
  };

  // Download Archive File via Presigned S3 URL
  const handleDownloadArchive = async (archiveId: string, tableName: string) => {
    setDownloadingId(archiveId);
    try {
      const res: any = await api.get(`/admin/system/archive/download/${archiveId}`);
      if (res?.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.download = `${tableName}.csv.gz`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Failed to generate download URL");
    } finally {
      setDownloadingId(null);
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTables(eligiblePartitions.map((p) => p.tableName));
    } else {
      setSelectedTables([]);
    }
  };

  const handleToggleTable = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]
    );
  };

  const isAllSelected = eligiblePartitions.length > 0 && selectedTables.length === eligiblePartitions.length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header & Subnav */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cold Data Archival & S3 Storage</h1>
              <p className="text-sm text-muted-foreground">
                Automated monthly & on-demand archival of legacy PostgreSQL partition tables (&gt;4 months old) to S3 Gzip archives.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={loadingStats || loadingEligible || loadingHistory}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStats || loadingEligible || loadingHistory ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setRunModalOpen(true)}
            disabled={activeJob?.isRunning}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {activeJob?.isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Archival In Progress...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Archival Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <SystemHealthNav />

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Storage Reclaimed */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Reclaimed Storage
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats ? `${stats.totalReclaimedGB} GB` : "0.00 GB"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats ? `${stats.totalReclaimedMB} MB` : "0 MB"} freed from PostgreSQL
            </p>
          </CardContent>
        </Card>

        {/* Total Partitions Archived */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Archived Partitions
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalArchivedPartitions ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                {stats?.totalArchivedPartitions ?? 0} Succeeded
              </Badge>
              {stats && stats.totalFailedPartitions > 0 && (
                <Badge variant="outline" className="text-[10px] text-red-600 bg-red-500/10 border-red-500/20">
                  {stats.totalFailedPartitions} Failed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Rows Archived */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Rows Cold-Stored
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Database className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats ? stats.totalRowsArchived.toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Preserved across AWS S3 gzip archives
            </p>
          </CardContent>
        </Card>

        {/* S3 Storage Destination */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              AWS S3 Destination
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Cloud className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate text-foreground">
              {stats?.s3Bucket || "ad96-table"}
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate mt-0.5">
              prefix: {stats?.s3Prefix || "logs-archive"}/
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Region: <span className="font-semibold text-foreground">{stats?.s3Region || "ap-south-1"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Archival Job Progress Banner */}
      {activeJob && (activeJob.isRunning || activeJob.currentStep !== "IDLE") && (
        <Card className={`border shadow-sm overflow-hidden ${activeJob.isRunning ? "border-emerald-500/40 bg-emerald-500/[0.02]" : "border-border"}`}>
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {activeJob.isRunning ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : activeJob.failedTables > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {activeJob.isRunning ? "Cold Archival Job in Progress" : "Recent Archival Job Status"}
                    <Badge variant={activeJob.isRunning ? "default" : "outline"} className="text-xs">
                      {activeJob.currentStep}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Job ID: <span className="font-mono">{activeJob.jobId}</span> | Triggered by: <span className="font-semibold">{activeJob.triggeredBy}</span>
                  </CardDescription>
                </div>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                Partitions: <span className="font-bold text-foreground">{activeJob.completedTables}</span> / {activeJob.totalTables} completed
                {activeJob.failedTables > 0 && (
                  <span className="text-red-500 ml-2">({activeJob.failedTables} failed)</span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Current Table: <span className="font-mono font-semibold text-foreground">{activeJob.currentTable || "Preparing..."}</span>
                </span>
                <span className="font-bold">{activeJob.currentProgressPercent}%</span>
              </div>
              <Progress value={activeJob.currentProgressPercent} className="h-2" />
            </div>

            {/* Live Terminal Log Stream */}
            {activeJob.recentLogs && activeJob.recentLogs.length > 0 && (
              <div className="mt-3 p-3 bg-zinc-950 text-zinc-200 rounded-lg font-mono text-xs max-h-48 overflow-y-auto space-y-1 border border-zinc-800">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[11px] text-zinc-400 font-sans">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Live Execution Logs
                  </span>
                  <span>{activeJob.recentLogs.length} events</span>
                </div>
                {activeJob.recentLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eligible Partitions Preview & Quick Trigger */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-emerald-600" />
                Eligible Legacy Partitions
                <Badge variant="secondary" className="text-xs">
                  {eligiblePartitions.length} Available
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Partitions older than retention threshold eligible to be exported to S3 and dropped from database.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Retention:</span>
                <Select
                  value={String(retentionMonths)}
                  onValueChange={(val) => setRetentionMonths(Number(val))}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Retention" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Older than 2 Months</SelectItem>
                    <SelectItem value="3">Older than 3 Months</SelectItem>
                    <SelectItem value="4">Older than 4 Months (Default)</SelectItem>
                    <SelectItem value="6">Older than 6 Months</SelectItem>
                    <SelectItem value="12">Older than 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                variant={selectedTables.length > 0 ? "default" : "outline"}
                disabled={activeJob?.isRunning || eligiblePartitions.length === 0}
                onClick={() => setRunModalOpen(true)}
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="w-3 h-3 fill-current" />
                {selectedTables.length > 0
                  ? `Archive Selected (${selectedTables.length})`
                  : `Archive All Eligible (${eligiblePartitions.length})`}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all eligible partitions"
                    />
                  </th>
                  <th className="p-3">Partition Table Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Partition Month</th>
                  <th className="p-3 text-right">Estimated Rows</th>
                  <th className="p-3 text-right">Storage Size</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loadingEligible ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Scanning PostgreSQL database for eligible partition tables...
                    </td>
                  </tr>
                ) : eligiblePartitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      No partition tables older than {retentionMonths} months found. Database storage is optimized!
                    </td>
                  </tr>
                ) : (
                  eligiblePartitions.map((p) => {
                    const isSelected = selectedTables.includes(p.tableName);
                    return (
                      <tr
                        key={p.tableName}
                        className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-emerald-500/5" : ""}`}
                      >
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleTable(p.tableName)}
                            aria-label={`Select ${p.tableName}`}
                          />
                        </td>
                        <td className="p-3 font-mono font-semibold text-foreground">
                          {p.tableName}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {p.category}
                        </td>
                        <td className="p-3 font-mono">
                          <Badge variant="outline" className="text-[10px]">
                            {p.partitionDate}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {p.rowCount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-foreground">
                          {p.sizeMB} MB
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                          >
                            Ready for Archival
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historical Archival Audit Log Table */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Archival & Drop Audit History
              </CardTitle>
              <CardDescription className="text-xs">
                Comprehensive record of all database partitions exported to S3 and dropped.
              </CardDescription>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search table or S3 key..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={prefixFilter}
                onValueChange={(val) => {
                  setPrefixFilter(val);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Prefix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="proofofplaylogs">Proof of Play</SelectItem>
                  <SelectItem value="devicetelemetrylogs">Telemetry</SelectItem>
                  <SelectItem value="deviceeventlogs">Device Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                <tr>
                  <th className="p-3">Table Name</th>
                  <th className="p-3">Partition</th>
                  <th className="p-3 text-right">Rows</th>
                  <th className="p-3 text-right">Gzip Size</th>
                  <th className="p-3">S3 Archive Path</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Table Dropped</th>
                  <th className="p-3">Triggered By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading archival audit history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      No archival history records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => {
                    const sizeMB = (item.file_size_bytes / (1024 * 1024)).toFixed(2);
                    const formattedDate = new Date(item.started_at).toLocaleString();

                    return (
                      <tr key={item.archive_id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono font-semibold text-foreground">
                          {item.table_name}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {item.partition_date}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {item.row_count.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {sizeMB} MB
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate" title={item.s3_key}>
                          s3://{item.s3_bucket}/{item.s3_key}
                        </td>
                        <td className="p-3 text-center">
                          {item.status === "SUCCESS" ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              SUCCESS
                            </Badge>
                          ) : item.status === "FAILED" ? (
                            <Badge
                              variant="outline"
                              onClick={() => setErrorModalItem(item)}
                              className="text-[10px] bg-red-500/10 text-red-600 border-red-500/20 cursor-pointer hover:bg-red-500/20"
                            >
                              FAILED (View)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse">
                              {item.status}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.table_dropped ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              DROPPED
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-zinc-500/10 text-zinc-500 border-zinc-500/20">
                              INTACT
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <span className="font-mono text-[11px]">{item.triggered_by}</span>
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="p-3 text-right">
                          {item.status === "SUCCESS" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={downloadingId === item.archive_id}
                              onClick={() => handleDownloadArchive(item.archive_id, item.table_name)}
                              className="h-7 px-2 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              title="Download compressed archive from S3"
                            >
                              {downloadingId === item.archive_id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Download</span>
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t bg-muted/20 text-xs text-muted-foreground">
              <div>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-medium text-foreground px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="h-7 px-2"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal to Run Archival */}
      <Dialog open={runModalOpen} onOpenChange={setRunModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Archive className="w-5 h-5" />
              Confirm Cold Data Archival
            </DialogTitle>
            <DialogDescription className="text-xs">
              This process will export eligible PostgreSQL partition tables to compressed <code className="font-mono bg-muted px-1 py-0.5 rounded">.csv.gz</code> files, upload them to AWS S3, verify integrity, and drop the tables from PostgreSQL to reclaim database disk space.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/60 rounded-lg space-y-1.5 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Scope:</span>
                <span className="font-semibold text-foreground">
                  {selectedTables.length > 0 ? `${selectedTables.length} Selected Partition(s)` : `All Partitions (> ${retentionMonths} Months)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">S3 Bucket:</span>
                <span className="font-mono text-foreground">{stats?.s3Bucket || "ad96-table"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">S3 Prefix:</span>
                <span className="font-mono text-foreground">{stats?.s3Prefix || "logs-archive"}/</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Safety Guarantee:</strong> Each partition table is strictly verified in S3 using <code className="font-mono">HeadObject</code> before being dropped. If S3 upload or verification fails, the database table remains untouched.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRunModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleTriggerArchival}
              disabled={isSubmittingRun}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmittingRun ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Archival Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Details Inspector Dialog */}
      <Dialog open={!!errorModalItem} onOpenChange={(open) => !open && setErrorModalItem(null)}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-base">
              <XCircle className="w-5 h-5" />
              Archival Error Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Table: <span className="font-mono font-semibold text-foreground">{errorModalItem?.table_name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs overflow-y-auto flex-1">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-400 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed shadow-xs">
              {errorModalItem?.error_message || "Unknown error during archival process."}
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Safety Note: Because this archival job failed, the partition table was <strong>NOT dropped</strong> and remains completely intact in the PostgreSQL database.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setErrorModalItem(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArchivePage;
