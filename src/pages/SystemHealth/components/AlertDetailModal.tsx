import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SystemAlert } from "../types";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  FileCode,
  Terminal,
  Share2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

interface AlertDetailModalProps {
  alert: SystemAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolvedSuccess: (updatedAlert: SystemAlert) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  open,
  onOpenChange,
  onResolvedSuccess,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!alert) return null;

  const handleCopy = (text: string, key: string, label: string = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyFullDiagnostic = () => {
    const diagnosticPayload = {
      alert_id: alert.alert_id,
      title: alert.title,
      severity: alert.severity,
      category: alert.category,
      occurrences: alert.occurrences,
      status: alert.is_resolved ? "RESOLVED" : "OPEN",
      resolved_by: alert.resolved_by || null,
      resolved_at: alert.resolved_at || null,
      resolution_notes: alert.resolution_notes || null,
      created_at: alert.created_at,
      message: alert.message,
      metadata: alert.metadata || null,
      stack_trace: alert.stack_trace || null,
    };
    handleCopy(
      JSON.stringify(diagnosticPayload, null, 2),
      "full_diag",
      "Full diagnostic report copied to clipboard"
    );
  };

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      const res: any = await api.put(`/admin/system/alerts/${alert.alert_id}/resolve`, {
        resolution_notes: resolutionNotes || "Resolved by administrator",
      });

      if (res.success && res.data) {
        toast.success("Alert successfully marked as resolved!");
        onResolvedSuccess(res.data);
        onOpenChange(false);
        setResolutionNotes("");
      } else {
        toast.error(res.error || "Failed to resolve alert");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve alert");
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "FATAL":
        return <Badge className="bg-red-950 text-red-200 border-red-700 font-semibold px-2.5 py-0.5">FATAL</Badge>;
      case "CRITICAL":
        return <Badge variant="destructive" className="font-semibold px-2.5 py-0.5">CRITICAL</Badge>;
      case "ERROR":
        return <Badge className="bg-rose-600 text-white font-medium px-2.5 py-0.5">ERROR</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500 text-white font-medium px-2.5 py-0.5">WARNING</Badge>;
      case "RECOVERY":
        return <Badge className="bg-emerald-600 text-white font-medium px-2.5 py-0.5">RECOVERY</Badge>;
      default:
        return <Badge variant="secondary" className="px-2.5 py-0.5">{severity}</Badge>;
    }
  };

  const stackLinesCount = alert.stack_trace ? alert.stack_trace.split("\n").length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl md:max-w-6xl w-[96vw] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border border-border/70 shadow-2xl bg-background">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 border-b bg-muted/20 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              {getSeverityBadge(alert.severity)}
              <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                {alert.category}
              </Badge>
              {alert.is_resolved ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 px-2.5 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-500/50 bg-amber-500/10 flex items-center gap-1.5 px-2.5 py-0.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Open Incident
                </Badge>
              )}
            </div>

            {alert.occurrences > 1 && (
              <span className="text-xs text-muted-foreground bg-muted border px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-primary animate-spin" style={{ animationDuration: "8s" }} />
                <strong>{alert.occurrences}</strong> occurrences logged
              </span>
            )}
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground leading-snug break-words">
              {alert.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(alert.created_at).toLocaleString()}
              </span>
              <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded border">
                ID: {alert.alert_id}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[11px] px-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(alert.alert_id, "alert_id", "Alert ID copied")}
              >
                {copiedKey === "alert_id" ? (
                  <Check className="w-3 h-3 text-emerald-500 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copiedKey === "alert_id" ? "Copied" : "Copy ID"}
              </Button>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-sm scrollbar-thin scrollbar-thumb-muted-foreground/20">
          {/* Error Message Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Error Message & Summary
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(alert.message, "msg", "Error message copied")}
              >
                {copiedKey === "msg" ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copiedKey === "msg" ? "Copied" : "Copy Message"}
              </Button>
            </div>
            <div className="p-4 bg-muted/40 dark:bg-muted/20 rounded-xl border text-sm font-mono sm:font-sans font-medium text-foreground whitespace-pre-wrap break-words leading-relaxed select-text shadow-sm">
              {alert.message}
            </div>
          </div>

          {/* Stack Trace (if present) - Wide Expanded Box */}
          {alert.stack_trace && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" /> Stack Trace / Exception Details ({stackLinesCount} lines)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800"
                  onClick={() => handleCopy(alert.stack_trace!, "trace", "Stack trace copied to clipboard")}
                >
                  {copiedKey === "trace" ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedKey === "trace" ? "Copied" : "Copy Stack Trace"}
                </Button>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 text-slate-300">exception_trace.log</span>
                  </div>
                  <span className="text-[11px] text-slate-500">UTF-8 RAW</span>
                </div>
                <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-text">
                  {alert.stack_trace}
                </div>
              </div>
            </div>
          )}

          {/* Metadata JSON Inspection */}
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" /> Telemetry & Environmental Metadata
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(JSON.stringify(alert.metadata, null, 2), "meta", "Metadata copied as JSON")}
                >
                  {copiedKey === "meta" ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedKey === "meta" ? "Copied" : "Copy JSON"}
                </Button>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/70 shadow-sm">
                <div className="bg-muted/70 px-4 py-2 border-b flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="font-mono text-[11px]">telemetry_context.json</span>
                  <span className="text-[11px]">JSON Payload</span>
                </div>
                <div className="p-4 bg-muted/30 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed select-text">
                  <pre className="text-foreground">{JSON.stringify(alert.metadata, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Status or Action */}
          {alert.is_resolved ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs text-emerald-900 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Resolved by <strong>{alert.resolved_by || "Administrator"}</strong> on{" "}
                  {alert.resolved_at ? new Date(alert.resolved_at).toLocaleString() : "N/A"}
                </span>
              </div>
              {alert.resolution_notes && (
                <div className="pl-7 pt-1">
                  <p className="text-xs font-medium text-muted-foreground italic bg-background/80 p-3 rounded-lg border border-emerald-500/20">
                    &ldquo;{alert.resolution_notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 pt-4 border-t">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Resolution Notes (Optional)
              </label>
              <Textarea
                placeholder="Describe root cause, actions taken, or remediation steps before resolving..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="text-xs min-h-[90px] leading-relaxed bg-background"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 sm:px-6 border-t bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 w-full sm:w-auto"
            onClick={handleCopyFullDiagnostic}
          >
            {copiedKey === "full_diag" ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
            ) : (
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
            )}
            {copiedKey === "full_diag" ? "Copied Diagnostic" : "Copy Diagnostic Report"}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {!alert.is_resolved && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 px-4"
                onClick={handleResolve}
                disabled={isResolving}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {isResolving ? "Resolving Incident..." : "Mark as Resolved"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
