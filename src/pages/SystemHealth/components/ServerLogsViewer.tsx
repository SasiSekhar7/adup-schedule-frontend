import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LogFileInfo,
  LogLineEntry,
  LogFileContentResponse,
  LogFilterOptions,
} from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Terminal,
  FileText,
  Search,
  Trash2,
  Download,
  RefreshCw,
  Play,
  Pause,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpDown,
  Clock,
  HardDrive,
  X,
  CornerDownRight,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

interface ServerLogsViewerProps {
  initialFile?: string;
}

export const ServerLogsViewer: React.FC<ServerLogsViewerProps> = ({
  initialFile = "combined.log",
}) => {
  // Available log files
  const [logFiles, setLogFiles] = useState<LogFileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);

  // Filter state
  const [selectedFile, setSelectedFile] = useState<string>(initialFile);
  const [lineLimit, setLineLimit] = useState<number>(200);
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [reverseOrder, setReverseOrder] = useState<boolean>(true); // true = newest first

  // Log content
  const [logData, setLogData] = useState<LogFileContentResponse | null>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);

  // Auto tail / Live poll
  const [autoPollInterval, setAutoPollInterval] = useState<number>(0); // 0 = off, 3, 5, 10, 30
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Clear dialog state
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [clearTarget, setClearTarget] = useState<string>("current"); // "current" | "all"
  const [clearing, setClearing] = useState<boolean>(false);

  // Terminal scroll ref
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch log files list
  const fetchLogFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const res: any = await api.get("/admin/system/file-logs");
      if (res.success && Array.isArray(res.data)) {
        setLogFiles(res.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch log files list:", err);
      toast.error("Failed to list server log files");
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  // Fetch content of selected log file
  const fetchLogContent = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoadingContent(true);
      try {
        const res: any = await api.get("/admin/system/file-logs/content", {
          params: {
            file: selectedFile,
            lines: lineLimit,
            level: levelFilter,
            search: debouncedSearch,
            reverse: reverseOrder,
          },
        });
        if (res.success && res.data) {
          setLogData(res.data);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        console.error("Failed to fetch log content:", err);
        if (!isBackground) {
          toast.error(err.error || "Failed to read log file");
        }
      } finally {
        if (!isBackground) setLoadingContent(false);
      }
    },
    [selectedFile, lineLimit, levelFilter, debouncedSearch, reverseOrder]
  );

  // Initial load
  useEffect(() => {
    fetchLogFiles();
  }, [fetchLogFiles]);

  // Refetch content when filters change
  useEffect(() => {
    fetchLogContent();
  }, [fetchLogContent]);

  // Auto-polling interval
  useEffect(() => {
    if (autoPollInterval <= 0) {
      setIsPolling(false);
      return;
    }
    setIsPolling(true);
    const interval = setInterval(() => {
      fetchLogContent(true);
    }, autoPollInterval * 1000);
    return () => clearInterval(interval);
  }, [autoPollInterval, fetchLogContent]);

  // Handle Log Truncation / Clear
  const handleConfirmClear = async () => {
    try {
      setClearing(true);
      const fileToClear = clearTarget === "all" ? "all" : selectedFile;
      const res: any = await api.post("/admin/system/file-logs/clear", {
        file: fileToClear,
      });

      if (res.success) {
        toast.success(res.message || "Log file cleared successfully");
        setClearDialogOpen(false);
        fetchLogFiles();
        fetchLogContent();
      } else {
        toast.error(res.error || "Failed to clear log file");
      }
    } catch (err: any) {
      console.error("Error clearing log file:", err);
      toast.error(err.message || "Error clearing log file");
    } finally {
      setClearing(false);
    }
  };

  // Download log file
  const handleDownload = () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "";
      const token = localStorage.getItem("token") || "";
      const downloadUrl = `${baseUrl}/admin/system/file-logs/download?file=${encodeURIComponent(
        selectedFile
      )}`;

      // Fetch with auth and trigger download blob
      fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Download failed");
          return res.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = selectedFile;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success(`Downloaded ${selectedFile}`);
        })
        .catch((err) => {
          console.error("Download error:", err);
          toast.error("Failed to download log file");
        });
    } catch (err) {
      toast.error("Download request failed");
    }
  };

  // Copy raw line to clipboard
  const handleCopyLine = (rowId: number, raw: string) => {
    navigator.clipboard.writeText(raw);
    setCopiedRowId(rowId);
    toast.success("Log line copied to clipboard");
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  // Toggle row stack/meta expand
  const toggleRowExpand = (rowId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Log Level formatting helpers
  const getLevelBadge = (level: string) => {
    const norm = (level || "INFO").toUpperCase();
    switch (norm) {
      case "ERROR":
      case "FATAL":
      case "CRITICAL":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
            {norm}
          </span>
        );
      case "WARN":
      case "WARNING":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
            {norm}
          </span>
        );
      case "INFO":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
            {norm}
          </span>
        );
      case "DEBUG":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
            {norm}
          </span>
        );
      case "HTTP":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            {norm}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-zinc-500/20 text-zinc-300 border border-zinc-500/30 font-mono">
            {norm}
          </span>
        );
    }
  };

  const getLineBackground = (level: string) => {
    const norm = (level || "INFO").toUpperCase();
    if (["ERROR", "FATAL", "CRITICAL"].includes(norm)) {
      return "hover:bg-red-950/30 bg-red-950/10";
    }
    if (["WARN", "WARNING"].includes(norm)) {
      return "hover:bg-amber-950/30 bg-amber-950/10";
    }
    return "hover:bg-zinc-800/50";
  };

  const currentFileInfo = logFiles.find((f) => f.name === selectedFile);

  return (
    <div className="space-y-4">
      {/* 1. File Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card border rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Server Log Files:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {logFiles.map((file) => {
              const isActive = file.name === selectedFile;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {file.sizeFormatted}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global actions: Refresh, Download, Clear */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              fetchLogFiles();
              fetchLogContent();
            }}
            disabled={loadingContent}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingContent ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleDownload}
            disabled={!logData || logData.totalLinesInFile === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              setClearTarget("current");
              setClearDialogOpen(true);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </Button>
        </div>
      </div>

      {/* 2. Log Filter Toolbar */}
      <div className="p-3.5 bg-card border rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search log messages, paths, errors, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Level Selector Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
              {["ALL", "ERROR", "WARN", "INFO", "DEBUG", "HTTP"].map((lvl) => {
                const isSelected = levelFilter === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      isSelected
                        ? lvl === "ERROR"
                          ? "bg-red-500 text-white shadow-sm"
                          : lvl === "WARN"
                          ? "bg-amber-500 text-white shadow-sm"
                          : lvl === "INFO"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Line Limit Selector */}
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg border">
              <span className="text-muted-foreground text-[11px]">Lines:</span>
              <Select
                value={String(lineLimit)}
                onValueChange={(val) => setLineLimit(Number(val))}
              >
                <SelectTrigger className="h-6 w-16 text-[11px] bg-background border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Sort Toggle */}
            <Button
              variant={reverseOrder ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs gap-1 px-2.5"
              onClick={() => setReverseOrder((prev) => !prev)}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{reverseOrder ? "Newest First" : "Oldest First"}</span>
            </Button>

            {/* Live Streaming / Auto-Tail Dropdown */}
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg border">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPolling ? "bg-emerald-500 animate-ping" : "bg-zinc-400"
                }`}
              />
              <span className="text-muted-foreground text-[11px] whitespace-nowrap">Live Tail:</span>
              <Select
                value={String(autoPollInterval)}
                onValueChange={(val) => setAutoPollInterval(Number(val))}
              >
                <SelectTrigger className="h-6 w-16 text-[11px] bg-background border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off</SelectItem>
                  <SelectItem value="3">3s</SelectItem>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats and metadata banner */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-dashed">
          <div className="flex items-center gap-3">
            <span className="font-mono text-foreground font-semibold">
              {selectedFile}
            </span>
            <span>&bull;</span>
            <span>
              Total Lines:{" "}
              <strong className="text-foreground">
                {logData?.totalLinesInFile || 0}
              </strong>
            </span>
            <span>&bull;</span>
            <span>
              Matching:{" "}
              <strong className="text-foreground">
                {logData?.matchedLines || 0}
              </strong>
            </span>
            <span>&bull;</span>
            <span>
              Showing:{" "}
              <strong className="text-foreground">
                {logData?.returnedCount || 0}
              </strong>
            </span>
            {currentFileInfo?.sizeFormatted && (
              <>
                <span>&bull;</span>
                <span>Size: {currentFileInfo.sizeFormatted}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* 3. Terminal Log Output Console Window */}
      <div className="relative rounded-xl border border-zinc-800 bg-[#0d1117] text-zinc-100 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-zinc-800 select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-zinc-400 text-xs ml-2 font-sans font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              stdout / stderr stream &mdash; {selectedFile}
            </span>
          </div>

          <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
            {isPolling && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STREAMING LIVE
              </span>
            )}
            <span>UTF-8 JSON / RAW</span>
          </div>
        </div>

        {/* Console Body / Lines */}
        <div
          ref={terminalContainerRef}
          className="p-3 max-h-[620px] min-h-[380px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          {loadingContent && !isPolling ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs font-sans">Reading and tailing server log file...</p>
            </div>
          ) : !logData || logData.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-2">
              <FileText className="w-8 h-8 text-zinc-600" />
              <p className="text-sm font-sans font-medium text-zinc-300">
                No log entries found
              </p>
              <p className="text-xs text-zinc-500 font-sans max-w-sm text-center">
                {searchQuery || levelFilter !== "ALL"
                  ? "No log entries match your active search or level filter criteria."
                  : `Log file '${selectedFile}' is currently empty.`}
              </p>
              {(searchQuery || levelFilter !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
                  onClick={() => {
                    setSearchQuery("");
                    setLevelFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            logData.lines.map((line) => {
              const isExpanded = !!expandedRows[line.id];
              const hasDetails = !!line.stack || (line.meta && Object.keys(line.meta).length > 0);
              const isCopied = copiedRowId === line.id;

              return (
                <div
                  key={`${line.id}-${line.timestamp || ""}`}
                  className={`group rounded px-2 py-1.5 transition-colors border border-transparent ${getLineBackground(
                    line.level
                  )}`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Line Index */}
                    <span className="text-zinc-600 select-none text-[11px] w-10 text-right shrink-0 pt-0.5">
                      {line.id}
                    </span>

                    {/* Timestamp */}
                    <span className="text-zinc-400 text-[11px] shrink-0 pt-0.5 select-none whitespace-nowrap">
                      {line.timestamp
                        ? new Date(line.timestamp).toLocaleTimeString() +
                          "." +
                          String(new Date(line.timestamp).getMilliseconds()).padStart(3, "0")
                        : "--:--:--"}
                    </span>

                    {/* Level Badge */}
                    <div className="shrink-0">{getLevelBadge(line.level)}</div>

                    {/* Message Body */}
                    <div className="flex-1 min-w-0 break-words text-zinc-200 text-xs leading-relaxed">
                      <span>{line.message}</span>
                    </div>

                    {/* Row Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {hasDetails && (
                        <button
                          onClick={() => toggleRowExpand(line.id)}
                          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                          title={isExpanded ? "Collapse details" : "Expand stack/metadata"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyLine(line.id, line.raw)}
                        className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                        title="Copy raw log line"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Stack Trace & JSON Metadata Section */}
                  {hasDetails && isExpanded && (
                    <div className="mt-2 ml-14 mr-2 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg space-y-2 text-[11px]">
                      {line.stack && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-red-400 font-semibold font-sans">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Stack Trace:</span>
                          </div>
                          <pre className="p-2.5 bg-black/60 rounded text-red-300 font-mono text-[11px] overflow-x-auto whitespace-pre leading-normal border border-red-950/60">
                            {line.stack}
                          </pre>
                        </div>
                      )}

                      {line.meta && Object.keys(line.meta).length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-blue-400 font-semibold font-sans">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Structured Metadata (JSON):</span>
                          </div>
                          <pre className="p-2.5 bg-black/60 rounded text-blue-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-normal border border-blue-950/60">
                            {JSON.stringify(line.meta, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Raw line dump */}
                      <div className="space-y-1 pt-1 border-t border-zinc-800/80">
                        <span className="text-zinc-500 font-sans">Raw Log Entry:</span>
                        <div className="p-1.5 bg-black/40 rounded text-zinc-400 font-mono text-[10px] break-all">
                          {line.raw}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Terminal Footer Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-zinc-800 text-zinc-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span>
              Showing {logData?.returnedCount || 0} of {logData?.matchedLines || 0} matching lines
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (terminalContainerRef.current) {
                  terminalContainerRef.current.scrollTop = 0;
                }
              }}
              className="hover:text-zinc-200 transition-colors"
            >
              &uarr; Scroll to top
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                if (terminalContainerRef.current) {
                  terminalContainerRef.current.scrollTop =
                    terminalContainerRef.current.scrollHeight;
                }
              }}
              className="hover:text-zinc-200 transition-colors"
            >
              &darr; Scroll to bottom
            </button>
          </div>
        </div>
      </div>

      {/* Clear Log Confirmation Alert Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Clear Log File Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to clear and truncate{" "}
                <strong className="text-foreground">
                  {clearTarget === "all" ? "ALL log files" : selectedFile}
                </strong>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This action will safely reset the file size to 0 Bytes without breaking active
                logger streams. This action cannot be undone.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-foreground">
                  <input
                    type="radio"
                    name="clearType"
                    checked={clearTarget === "current"}
                    onChange={() => setClearTarget("current")}
                  />
                  <span>Clear only {selectedFile}</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer text-foreground">
                  <input
                    type="radio"
                    name="clearType"
                    checked={clearTarget === "all"}
                    onChange={() => setClearTarget("all")}
                  />
                  <span>Clear all .log files</span>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmClear();
              }}
              disabled={clearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearing ? "Clearing..." : "Yes, Truncate Log"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServerLogsViewer;
