"use client";

import { ArrowLeft, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeviceGroupHeaderProps {
  data: {
    group_id: string;
    name: string;
    reg_code: string;
    orientation: string;
    current_content_type: string;
    device_count: number;
    created_at: string;
    placeholder_enabled: boolean;
    logo_enabled: boolean;
    max_days_schedules: number;
  };
}

export default function DeviceGroupHeader({ data }: DeviceGroupHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-semibold text-slate-900">
              {data.name}
            </h1>
            <Badge className="bg-blue-100 text-blue-800 text-xs font-semibold">
              {data.reg_code}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Group ID:{" "}
            <span className="font-mono text-slate-900">{data.group_id}</span>
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div> */}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Created
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {new Date(data.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Max Days Schedules
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {data.max_days_schedules}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Devices
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {data.device_count}
          </p>
        </div>
      </div>
    </div>
  );
}
