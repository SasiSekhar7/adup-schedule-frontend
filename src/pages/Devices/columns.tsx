"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Utility function for conditional classes
import { addHours, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Copy, X } from "lucide-react";
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

export interface DevicesResponse {
  devices: Device[];
}

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
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
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
        <div className="flex">
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
