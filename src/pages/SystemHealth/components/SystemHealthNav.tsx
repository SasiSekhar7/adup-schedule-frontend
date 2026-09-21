import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Bell, Terminal, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealthNavProps {
  unresolvedAlertsCount?: number;
}

export const SystemHealthNav: React.FC<SystemHealthNavProps> = ({ unresolvedAlertsCount = 0 }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      title: "Resource Telemetry",
      url: "/system-health",
      icon: Activity,
      iconColor: "text-primary",
      isActive: pathname === "/system-health",
    },
    {
      title: "Incident Alerts",
      url: "/system-health/alerts",
      icon: Bell,
      iconColor: "text-amber-500",
      badge: unresolvedAlertsCount > 0 ? unresolvedAlertsCount : undefined,
      isActive: pathname === "/system-health/alerts",
    },
    {
      title: "Server Log Files",
      url: "/system-health/logs",
      icon: Terminal,
      iconColor: "text-blue-500",
      isActive: pathname === "/system-health/logs",
    },
    {
      title: "Cold Data Archival & S3",
      url: "/system-health/archive",
      icon: Archive,
      iconColor: "text-emerald-500",
      isActive: pathname === "/system-health/archive",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/60 border rounded-xl w-fit max-w-full overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap",
              item.isActive
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", item.iconColor)} />
            <span>{item.title}</span>
            {item.badge !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};
