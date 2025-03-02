"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatDateWithOrdinal } from "@/helpers";
import { ColumnDef } from "@tanstack/react-table";
import MessageCell from "./components/MessageCell";

// Define types for Ad
export interface Schedule {
  schedule_id: string;
  ad_id: string;
  device_id: string;
  start_time: string;
  end_time: string;
  total_duration: number;
  priority: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  ad_name: string;
  group_name: string;
}


export interface ScheduleResponse {
  schedules: Schedule[];
}

// Define columns for the table
export const columns: ColumnDef<Schedule>[] = [
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
  // {
  //   accessorKey: "ad_id",
  //   header: "Ad ID",
  //   cell: ({ row }) => row.getValue("ad_id"),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "ad_name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Ad Name" />
    ),
    cell: ({ row }) => row.getValue("ad_name"),
  },
  {
    accessorKey: "group_name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Device Group" />
    ),
    cell: ({ row }) => (<div>
        {row.getValue("group_name")}

    </div>),
  },
  {
    accessorKey: "total_duration",
    header: "Total Plays",
    cell: ({ row }) => (row.getValue("total_duration"))
  },
  {
    accessorKey: "start_time",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => formatDateWithOrdinal(row.getValue("start_time")),
  },
  //   accessorKey: "created_at",
  //   header: "Created At",
  //   cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
  // },
  {
    accessorKey: "updated_at",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => formatDateWithOrdinal(row.getValue("updated_at")),
  },
  {
    accessorKey: "schedule_id",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <MessageCell schedule_id={row.getValue('schedule_id')} />,
  },
  
];