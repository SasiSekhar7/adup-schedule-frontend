"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
// import { Checkbox } from "@components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Utility function for conditional classes
import { addHours, formatDistanceToNow } from "date-fns";

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

export const devicecolumns: ColumnDef<Device>[] = [
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
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Device ID"/>
    ),
    cell: ({ row }) => row.getValue("device_id"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "group_name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Group Name"/>
    ),
    cell: ({ row }) => row.getValue("group_name"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "location",
    header:({column})=>(
      <DataTableColumnHeader column={column} title="Location"/>

    ),
    cell: ({ row }) => row.getValue("location"),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={cn("px-3 py-1 rounded-full text-sm font-medium", statusVariants[status] || "bg-gray-100 text-gray-700 border border-gray-300")}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
      accessorKey: "last_synced",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Synced" />,
      cell: ({ row }) => {
        const lastSynced = new Date(row.getValue("last_synced"));
        return formatDistanceToNow(lastSynced, { addSuffix: true }); // e.g., "5 minutes ago"
      },
      enableSorting: true,
    },
    {
      accessorKey: "next_sync",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Next Sync" />,
      cell: ({ row }) => {
        const lastSynced = new Date(row.getValue("last_synced"));
        const nextSync = addHours(lastSynced, 1); // Assumes next sync is 1 hour after last sync
        return nextSync.toLocaleString(); // Formats as a readable timestamp
      },
      enableSorting: true,
    },
];
