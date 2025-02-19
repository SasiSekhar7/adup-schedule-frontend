"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import MessageCell from "./componets/MessageCell";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import api from "@/api";


// Extend your Group type to include the message from ScrollText.
export interface Group {
  group_id: string;
  name: string;
  device_count: number;
  message: string | null; // will be null if no message exists
}

// Create an inline cell component for the message column.


// Define columns for your DataTable.
export const columns: ColumnDef<Group>[] = [
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
    accessorKey: "group_id",
    header: "Group ID",
    cell: ({ row }) => row.getValue("group_id"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "device_count",
    header: "Device Count",
    cell: ({ row }) => row.getValue("device_count"),
    enableSorting: true,
  },
  {
    accessorKey: "group_id",
    header: "Update Schedule",
    cell: ({ row }) => {
      async function handleRefreah(group_id:string) {
        await api.post(`/device/update-schedule/${group_id}`)
        
      }
      return(
        <div className="">

        <Button onClick={()=>handleRefreah(row.getValue("group_id"))} variant="ghost">
          <RefreshCcw size="sm"/>
        </Button>
        </div>
        
        )},
    enableSorting: true,
  },
  {
    id: "message",
    header: "Message",
    cell: ({ row }) => {
      // Pass the whole row original data to our MessageCell component
      return <MessageCell group={row.original} />;
    },
  },
];
