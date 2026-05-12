"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MonitorSmartphone, Smartphone } from "lucide-react";

interface DeviceCardProps {
  device: {
    device_id: string;
    device_name: string;
    device_type: string;
    status: string;
    registration_status: string;
    android_id: string;
    last_synced: string;
    device_on_time: string;
    device_off_time: string;
  };
  onView: () => void;
}

export default function DeviceCard({ device, onView }: DeviceCardProps) {
  const isActive = device.status === "active";
  const isPortrait = device.device_orientation === "portrait";

  const DeviceIcon = isPortrait ? Smartphone : MonitorSmartphone;

  return (
    <Card className="border-slate-200 overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <DeviceIcon
              className={`h-5 w-5 mt-0.5 ${
                isActive ? "text-emerald-600" : "text-slate-400"
              }`}
            />
            <div>
              <h3 className="font-semibold text-slate-900">
                {device.device_name}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-mono">
                {device.android_id.slice(0, 12)}...
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="mt-4 flex gap-2">
          <Badge
            className={
              isActive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-800"
            }
          >
            {device.status}
          </Badge>
          <Badge
            className={
              device.registration_status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : device.registration_status === "registered"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-800"
            }
          >
            {device.registration_status}
          </Badge>
        </div>

        {/* Device Info */}
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Orientation:</span>

            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-900 capitalize">
                {device?.device_orientation}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Video Streams:</span>

            <span className="font-medium text-slate-900">
              {device?.max_supported_video_streams || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Type:</span>
            <span className="font-medium text-slate-900 capitalize">
              {device.device_type}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">On Time:</span>
            <span className="font-medium text-slate-900">
              {device.device_on_time}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Off Time:</span>
            <span className="font-medium text-slate-900">
              {device.device_off_time}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Last Synced:</span>
            <span className="font-medium text-slate-900">
              {new Date(device.last_synced).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="mt-4 w-full bg-slate-900 hover:bg-slate-800"
          onClick={onView}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
