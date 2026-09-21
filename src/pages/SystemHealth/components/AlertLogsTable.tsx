import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SystemAlert, SeverityCounts } from "../types";
import { AlertDetailModal } from "./AlertDetailModal";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Layers,
  Calendar,
  XCircle,
  FileCode,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

interface AlertLogsTableProps {
  alerts: SystemAlert[];
  severityCounts?: SeverityCounts;
  totalAlerts: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: {
    severity?: string;
    category?: string;
    resolved?: string;
    search?: string;
  }) => void;
  onRefresh: () => void;
  onAlertResolved: (updatedAlert: SystemAlert) => void;
}

export const AlertLogsTable: React.FC<AlertLogsTableProps> = ({
  alerts,
  severityCounts,
  totalAlerts,
  currentPage,
  totalPages,
  loading,
  onPageChange,
  onFiltersChange,
  onRefresh,
  onAlertResolved,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<SystemAlert | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const applyFilters = (newFilters: {
    severity?: string;
    category?: string;
    resolved?: string;
    search?: string;
  }) => {
    onFiltersChange({
      severity: newFilters.severity !== undefined ? newFilters.severity : selectedSeverity,
      category: newFilters.category !== undefined ? newFilters.category : selectedCategory,
      resolved: newFilters.resolved !== undefined ? newFilters.resolved : selectedStatus,
      search: newFilters.search !== undefined ? newFilters.search : searchQuery,
    });
  };

  const handleSeverityPillClick = (sev: string) => {
    setSelectedSeverity(sev);
    applyFilters({ severity: sev });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    applyFilters({ category: cat });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters({ resolved: status });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchQuery });
  };

  const handleQuickResolve = async (e: React.MouseEvent, alertItem: SystemAlert) => {
    e.stopPropagation();
    try {
      setResolvingId(alertItem.alert_id);
      const res: any = await api.put(`/admin/system/alerts/${alertItem.alert_id}/resolve`, {
        resolution_notes: "Quick resolved by administrator",
      });

      if (res.success && res.data) {
        toast.success(`Alert "${alertItem.title}" marked as resolved!`);
        onAlertResolved(res.data);
      } else {
        toast.error(res.error || "Failed to resolve alert");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve alert");
    } finally {
      setResolvingId(null);
    }
  };

  const openDetailModal = (alertItem: SystemAlert) => {
    setSelectedAlertForModal(alertItem);
    setIsDetailOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "FATAL":
        return <Badge className="bg-red-950 text-red-200 border-red-800 font-semibold text-[10px] whitespace-nowrap">FATAL</Badge>;
      case "CRITICAL":
        return <Badge variant="destructive" className="font-semibold text-[10px] whitespace-nowrap">CRITICAL</Badge>;
      case "ERROR":
        return <Badge className="bg-rose-500 text-white font-medium text-[10px] whitespace-nowrap">ERROR</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500 text-white font-medium text-[10px] whitespace-nowrap">WARNING</Badge>;
      case "RECOVERY":
        return <Badge className="bg-emerald-600 text-white font-medium text-[10px] whitespace-nowrap">RECOVERY</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] whitespace-nowrap">{severity}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 bg-muted/40 whitespace-nowrap">
        {category}
      </Badge>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Incident Error Logs & System Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Audit log of database anomalies, memory spikes, storage thresholds, and runtime exceptions
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Button
            variant={selectedSeverity === "ALL" ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2.5 rounded-full"
            onClick={() => handleSeverityPillClick("ALL")}
          >
            All Alerts
            {severityCounts && (
              <span className="ml-1.5 bg-background/20 text-current px-1.5 py-0.2 rounded-full text-[10px]">
                {totalAlerts}
              </span>
            )}
          </Button>

          <Button
            variant={selectedSeverity === "FATAL" ? "destructive" : "outline"}
            size="sm"
            className={`h-7 text-xs px-2.5 rounded-full ${
              selectedSeverity === "FATAL"
                ? "bg-red-950 text-white"
                : "text-red-900 border-red-900/30 hover:bg-red-900/10"
            }`}
            onClick={() => handleSeverityPillClick("FATAL")}
          >
            Fatal
            {severityCounts && severityCounts.FATAL > 0 && (
              <span className="ml-1.5 bg-red-900 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {severityCounts.FATAL}
              </span>
            )}
          </Button>

          <Button
            variant={selectedSeverity === "CRITICAL" ? "destructive" : "outline"}
            size="sm"
            className={`h-7 text-xs px-2.5 rounded-full ${
              selectedSeverity === "CRITICAL"
                ? ""
                : "text-red-600 border-red-500/30 hover:bg-red-500/10"
            }`}
            onClick={() => handleSeverityPillClick("CRITICAL")}
          >
            Critical
            {severityCounts && severityCounts.CRITICAL > 0 && (
              <span className="ml-1.5 bg-red-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {severityCounts.CRITICAL}
              </span>
            )}
          </Button>

          <Button
            variant={selectedSeverity === "ERROR" ? "default" : "outline"}
            size="sm"
            className={`h-7 text-xs px-2.5 rounded-full ${
              selectedSeverity === "ERROR"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
            }`}
            onClick={() => handleSeverityPillClick("ERROR")}
          >
            Error
            {severityCounts && severityCounts.ERROR > 0 && (
              <span className="ml-1.5 bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {severityCounts.ERROR}
              </span>
            )}
          </Button>

          <Button
            variant={selectedSeverity === "WARNING" ? "default" : "outline"}
            size="sm"
            className={`h-7 text-xs px-2.5 rounded-full ${
              selectedSeverity === "WARNING"
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
            }`}
            onClick={() => handleSeverityPillClick("WARNING")}
          >
            Warning
            {severityCounts && severityCounts.WARNING > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {severityCounts.WARNING}
              </span>
            )}
          </Button>

          <Button
            variant={selectedSeverity === "INFO" ? "default" : "outline"}
            size="sm"
            className={`h-7 text-xs px-2.5 rounded-full ${
              selectedSeverity === "INFO"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
            }`}
            onClick={() => handleSeverityPillClick("INFO")}
          >
            Info
          </Button>
        </div>

        {/* Secondary Filter Bar: Category, Status & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {/* Category Dropdown */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="DISK">Disk Space</SelectItem>
              <SelectItem value="DATABASE">PostgreSQL Database</SelectItem>
              <SelectItem value="MEMORY">RAM & Heap</SelectItem>
              <SelectItem value="MQTT">MQTT Screen Fleet</SelectItem>
              <SelectItem value="RUNTIME">Runtime Exceptions</SelectItem>
              <SelectItem value="API_ERROR">API / HTTP Errors</SelectItem>
              <SelectItem value="SYSTEM">System Watchdog</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Dropdown */}
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Resolution Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Incidents</SelectItem>
              <SelectItem value="unresolved">Open Incidents Only</SelectItem>
              <SelectItem value="resolved">Resolved Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search error messages or titles..."
                className="h-8 pl-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs px-3">
              Search
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[850px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] text-xs font-semibold whitespace-nowrap">Severity</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold whitespace-nowrap">Category</TableHead>
                <TableHead className="min-w-[260px] text-xs font-semibold">Title & Error Context</TableHead>
                <TableHead className="w-[90px] text-center text-xs font-semibold whitespace-nowrap">Occurrences</TableHead>
                <TableHead className="w-[105px] text-xs font-semibold whitespace-nowrap">Status</TableHead>
                <TableHead className="w-[135px] text-xs font-semibold whitespace-nowrap">Timestamp</TableHead>
                <TableHead className="w-[130px] text-right text-xs font-semibold pr-4 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      Loading incident error records...
                    </div>
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1 py-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-500/60 mb-1" />
                      <p className="font-semibold text-foreground">No matching system alerts found</p>
                      <p className="text-[11px] text-muted-foreground">
                        All systems are operating normally or filters match no recorded events.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((item) => (
                  <TableRow
                    key={item.alert_id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      !item.is_resolved && (item.severity === "CRITICAL" || item.severity === "FATAL")
                        ? "bg-red-500/5 dark:bg-red-500/10"
                        : ""
                    }`}
                    onClick={() => openDetailModal(item)}
                  >
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {getSeverityBadge(item.severity)}
                    </TableCell>

                    <TableCell className="py-2.5 font-medium whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="space-y-0.5 max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg min-w-0">
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{item.title}</span>
                          {item.stack_trace && (
                            <FileCode className="w-3 h-3 text-muted-foreground shrink-0" title="Contains Stack Trace" />
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {item.message}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-2.5 whitespace-nowrap">
                      {item.occurrences > 1 ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">
                          {item.occurrences}x
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">1</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 whitespace-nowrap">
                      {item.is_resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 shrink-0" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" /> Open
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-medium text-foreground/80">
                          {new Date(item.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-2.5 pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailModal(item);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!item.is_resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] px-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                            disabled={resolvingId === item.alert_id}
                            onClick={(e) => handleQuickResolve(e, item)}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {resolvingId === item.alert_id ? "..." : "Resolve"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs">
            <span className="text-muted-foreground">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalAlerts} total alerts)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={currentPage <= 1 || loading}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={currentPage >= totalPages || loading}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Stack Trace & Metadata Inspection Modal */}
      <AlertDetailModal
        alert={selectedAlertForModal}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onResolvedSuccess={(updated) => {
          onAlertResolved(updated);
          if (selectedAlertForModal?.alert_id === updated.alert_id) {
            setSelectedAlertForModal(updated);
          }
        }}
      />
    </Card>
  );
};
