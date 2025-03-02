"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";

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
export const adcolumns: ColumnDef<Ad>[] = [
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
    cell: ({ row }) => {
      const path = row.getValue("url");
      if (!path) return null;

      // Extract the file extension
      const fileExtension = path.split(".").pop()?.toLowerCase();
    
      // Check if it's a video or image
      const isVideo = fileExtension === "mp4" || fileExtension === "webm" || fileExtension === "ogg";
      const isImage = fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png" || fileExtension === "gif";
    
      return(
        <Dialog>
          <DialogTrigger>
            <span className="truncate underline underline-offset-2 text-blue-700">{
              path.split('/').pop()
            
            }</span>
          </DialogTrigger>
          <DialogContent>
          <div className="max-h-[80vh]">
      {isVideo ? (
        <video controls className="w-full max-h-[80vh] rounded-md">
          <source src={path} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      ) : isImage ? (
        <img src={path} alt="Preview" className="w-full h-auto  max-h-[80vh]rounded-md" />
      ) : (
        <a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          Download File
        </a>
      )}
    </div>
          </DialogContent>
        </Dialog>
      )
    },
  },
  {
    accessorKey: "duration",
    header: ({column})=>(
      <DataTableColumnHeader column={column} title="Duartion" />
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
  }
];