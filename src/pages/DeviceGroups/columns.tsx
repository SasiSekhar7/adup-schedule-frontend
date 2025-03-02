"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import MessageCell from "./componets/MessageCell";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, Copy, RefreshCcw } from "lucide-react";
import api from "@/api";
import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


// Extend your Group type to include the message from ScrollText.
export interface Group {
  group_id: string;
  name: string;
  reg_code: string;
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
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("group_id");
  
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate max-w-[80px] inline-block cursor-pointer">{value}</span>
          </TooltipTrigger>
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "reg_code",
    header: "License Key",
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false);
      const value = row.getValue("reg_code");
  
      const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500); // Reset icon after 1.5s
      };
  
      return (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="p-1">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </Button>
        </div>
      );
    },
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
