"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Utility function for conditional classes
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Eye } from "lucide-react";
import api from "@/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LocationCell from "./components/LocationCell";
import EditDeviceDialog from "./components/EditDeviceDialog";

const statusVariants: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-400",
  Paused: "bg-yellow-100 text-yellow-700 border border-yellow-400",
  Draft: "bg-gray-100 text-gray-700 border border-gray-400",
};

interface DeviceGroup {
  name: string;
}

export interface Device {
  device_id: string;
  group_id: string;
  location: string;
  tags: string[];
  status: string;
  last_synced: Date;
  created_at: Date;
  updated_at: Date;
  createdAt: Date;
  updatedAt: Date;
  group_name: string;
}

export interface DeviceMetrics {
  device_id: string;
  timestamp: Date;
  cpu_usage: number;
  ram_free_mb: number;
  storage_free_mb: number;
  network_type: string;
  app_version_code: number;
}

export interface DeviceTelemetry {
  id: string;
  device_id: string;
  timestamp: string;
  cpu_usage: number;
  ram_free_mb: number;
  storage_free_mb: number | null;
  network_type: string | null;
  app_version_code: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface DevicesResponse {
  devices: Device[];
}

// DevicePreviewDialog Component
const DevicePreviewDialog = ({ device }: { device: Device }) => {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchLatestTelemetry = async () => {
    if (!open) return;

    setLoading(true);
    try {
      // Fetch only the latest telemetry entry (page=1, limit=1)
      const response: PaginatedResponse<DeviceTelemetry> = await api.get(
        `/device/${device.device_id}/telemetry-logs?page=1&limit=1`
      );

      // Get the latest telemetry entry
      if (response.data && response.data.length > 0) {
        setTelemetry(response.data[0]);
      } else {
        setTelemetry(null);
      }
    } catch (error) {
      console.error("Failed to fetch device telemetry:", error);
      setTelemetry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestTelemetry();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Device Telemetry</DialogTitle>
          <DialogDescription>
            Latest telemetry data for device {device.device_id}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading latest telemetry...
            </div>
          </div>
        ) : telemetry ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Device ID
                </label>
                <p className="text-sm text-gray-900">{telemetry.device_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Timestamp
                </label>
                <p className="text-sm text-gray-900">
                  {formatDistanceToNow(new Date(telemetry.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  CPU Usage
                </label>
                <p className="text-sm text-gray-900">
                  {(telemetry.cpu_usage * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  RAM Free
                </label>
                <p className="text-sm text-gray-900">
                  {telemetry.ram_free_mb} MB
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Storage Free
                </label>
                <p className="text-sm text-gray-900">
                  {telemetry.storage_free_mb || "N/A"}{" "}
                  {telemetry.storage_free_mb ? "MB" : ""}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Network Type
                </label>
                <p className="text-sm text-gray-900">
                  {telemetry.network_type || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  App Version Code
                </label>
                <p className="text-sm text-gray-900">
                  {telemetry.app_version_code || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No telemetry data available
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const columns = (fetchDta: () => void): ColumnDef<Device>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "preview",
    header: "Preview",
    cell: ({ row }) => {
      const device = row.original;
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DevicePreviewDialog device={device} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "device_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device ID" />
    ),
    cell: ({ row }) => row.getValue("device_id"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "group_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group Name" />
    ),
    cell: ({ row }) => row.getValue("group_name"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "device_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device Name" />
    ),
    cell: ({ row }) => row.getValue("device_name"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const cords = row.getValue("location");
      return <LocationCell cords={cords} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            statusVariants[status] ||
              "bg-gray-100 text-gray-700 border border-gray-300"
          )}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "last_synced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Synced" />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue("last_synced") as string;
      const parsedDate = new Date(rawDate);

      if (isNaN(parsedDate.getTime())) {
        return "Invalid date";
      }

      return formatDistanceToNow(parsedDate, { addSuffix: true });
    },

    enableSorting: true,
  },
  {
    accessorKey: "android_id",
    header: () => "Action",
    cell: ({ row }) => {
      const device_id = row.getValue("device_id") as string;
      const android_id = row.getValue("android_id") as string;
      const device = row.original;
      //  alert(android_id)
      const handleClick = async () => {
        await api.post(`/device/delete/${device_id}`);

        location.reload();
      };
      return (
        <div className="flex" onClick={(e) => e.stopPropagation()}>
          <EditDeviceDialog device={device} fetchDta={fetchDta} />
          <Dialog>
            <DialogTrigger>
              <Button variant="ghost">
                <CircleX />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete device record for device ID {device_id}?
                </DialogTitle>
                <DialogDescription>
                  This action will exit the application on the device and
                  permanently delete the device record.
                </DialogDescription>
              </DialogHeader>
              Copy exit password incase application fails to exit
              <div className="flex flex-row ">
                <Input readOnly value={android_id} className="w-[200px] " />
                {/* <Button variant="secondary" className="h-[20px]">
            <Copy/>
          </Button> */}
              </div>
              <DialogFooter>
                <Button onClick={handleClick}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
