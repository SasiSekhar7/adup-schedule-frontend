import React, { useState, useEffect } from "react";
import { ServerLogsViewer } from "./components/ServerLogsViewer";
import { SystemHealthNav } from "./components/SystemHealthNav";
import { Terminal, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api";

export const LogsPage: React.FC = () => {
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState<number>(0);

  // Fetch count for the nav badge
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res: any = await api.get("/admin/system/alerts", { params: { limit: 1 } });
        if (res.success && res.data?.severityCounts) {
          setUnresolvedAlertsCount(res.data.severityCounts.UNRESOLVED_TOTAL || 0);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="flex-1 space-y-5 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Terminal className="w-6 h-6 text-blue-500" />
              Physical Server Log Files
            </h1>
            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-medium px-2.5 py-1 text-xs">
              Winston Engine Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Browse, filter, stream in real-time, download, and safely clear physical backend log files (`logs/*.log`).
          </p>
        </div>
      </div>

      {/* Sub-Navigation Bar between System Health Pages */}
      <SystemHealthNav unresolvedAlertsCount={unresolvedAlertsCount} />

      {/* Interactive Server Logs Console Viewer */}
      <ServerLogsViewer />
    </div>
  );
};

export default LogsPage;
