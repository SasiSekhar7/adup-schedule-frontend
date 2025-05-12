"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu,   DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
 } from "@/components/ui/dropdown-menu";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, EllipsisVertical, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define types for Ad
export interface Ad {
  ad_id: string;
  client_id: string;
  name: string;
  url: string;
  duration: number;
  created_at: string;
  updated_at: string;
  client_name: string;
}

export interface AdsResponse {
  ads: Ad[];
}

// Define columns for the table
export const columns: ColumnDef<Ad>[] = [
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
    accessorKey: "name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Ad Name" />
    ),
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "client_name",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row }) => row.getValue("client_name"),
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) =>  {
      const path = row.getValue('url');
      return(
        path.split('/').pop().split('?')[0]

      )
    }

      
  },
  {
    accessorKey: "duration",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => row.getValue("duration"),
  },
  // {
  //   accessorKey: "created_at",
  //   header: "Created At",
  //   cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
  // },
  {
    accessorKey: "updated_at",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => new Date(row.getValue("updated_at")).toLocaleString(),
  },
  {
    accessorKey: "ad_id",
    header: "Actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const [open, setOpen] = useState(false);
    
      return(
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={()=>navigate(`/ads/${row.getValue("ad_id")}`)}>View</DropdownMenuItem>
        <DropdownMenuSeparator />

          <DropdownMenuItem onClick={()=>navigate(`/ads/${row.getValue("ad_id")}/edit`)}>Edit / Delete

          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>

          </DropdownMenuItem>
          <DropdownMenuSeparator />


     
        </DropdownMenuContent>
      </DropdownMenu>)
  }
}
];