"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Utility function for conditional classes
import { addHours, formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

const statusVariants: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-400",
  Paused: "bg-yellow-100 text-yellow-700 border border-yellow-400",
  Draft: "bg-gray-100 text-gray-700 border border-gray-400",
};


export interface Device {
  device_id: string;
  group_id: string;
  location: string;
  status: string;
  last_synced: Date;
  created_at: Date;
  updated_at: Date;
  createdAt: Date;
  updatedAt: Date;
  group_name: string;
}

export interface DeviceGroup {
  group_id: string;
  name: string;
  device_count: number
  batter_fill: number
}

export interface DevicesGroupsResponse {
  devices: DeviceGroup[];
}

export const devicecolumns: ColumnDef<DeviceGroup>[] = [
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
    accessorKey: "name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Group Name"/>
    ),
    cell: ({ row }) => row.getValue("name"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "device_count",
    header:({column})=>(
      <DataTableColumnHeader column={column} title="Device Count"/>

    ),
    cell: ({ row }) => row.getValue("device_count"),
  },
  {
    accessorKey: "battery_fill",
    header:({column})=>(
      <DataTableColumnHeader column={column} title="Capacity"/>

    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        {/* Battery-like Progress Bar */}
        <div className="relative w-[60%]">
          <Progress value={row.getValue("battery_fill")} className="h-4 rounded-lg bg-gray-200"/>
        </div>
        
        {/* Battery Percentage Text */}
        <span className="text-sm font-medium text-gray-700">
          {row.getValue("battery_fill")}%
        </span>
      </div>
    ),
    
  }
];
