"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Film, Image, Zap } from "lucide-react";

interface DeviceGroupStatsProps {
  data: {
    device_count: number;
    orientation: string;
    rcs_enabled: boolean;
    placeholder_enabled: boolean;
    logo_enabled: boolean;
    last_pushed: string;
    max_days_schedules: number;
    current_content_type: string;
  };
}

export default function DeviceGroupStats({ data }: DeviceGroupStatsProps) {
  const stats = [
    // {
    //   label: "Total Devices",
    //   value: data.device_count,
    //   icon: CheckCircle2,
    //   textColor: "text-slate-900",
    // },
    {
      label: "Orientation",
      value:
        data.orientation.charAt(0).toUpperCase() + data.orientation.slice(1),
      icon: Film,
      textColor: "text-slate-900",
    },
    {
      label: "Last Pushed",
      value: new Date(data.last_pushed).toLocaleDateString(),
      icon: Clock,
      textColor: "text-slate-900",
    },
    {
      label: "RCS Status",
      value: data.rcs_enabled ? "Enabled" : "Disabled",
      icon: Zap,
      textColor: "text-slate-900",
    },

    {
      label: "Placeholder Status",
      value: data.placeholder_enabled ? "Enabled" : "Disabled",
      icon: Zap,
      textColor: "text-slate-900",
    },
    {
      label: "Logo Status",
      value: data.logo_enabled ? "Enabled" : "Disabled",
      icon: Image,
      textColor: "text-slate-900",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className={`mt-2 text-xl font-semibold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <Icon className="h-8 w-8 text-slate-300" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
