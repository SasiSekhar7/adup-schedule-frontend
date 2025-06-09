// src/pages/ApkVersions/columns.tsx
"use client"; // Important for ShadCN UI components

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Download, Edit, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header"; // Your existing component
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"; // For status badges
// import { toast } from "@/components/ui/use-toast"; // Your toast notification
import api from "@/api"; // Your API client
import EditApkComponent from "./components/EditApkComponent"; // Dialog for editing
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Define the TypeScript interface for your ApkVersion data
// This should match your backend model closely
export interface ApkVersion {
  id: number;
  version_code: number;
  version_name: string;
  file_name: string;
  s3_key: string;
  file_size_bytes: number;
  release_notes: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  checksum_sha256: string;
  uploaded_at: string; // ISO string date
  created_at: string;
  updated_at: string;
}

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Define columns for the APK versions table
// The onDataChange callback is passed to trigger a re-fetch of data after edits/deletes
export const columns : ColumnDef<ApkVersion>[] =[
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
    accessorKey: "version_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version Name" />
    ),
    cell: ({ row }) => {
      const apk = row.original;
      return (
        <div className="font-medium">
          {apk.version_name}
          <div className="text-xs text-muted-foreground">Code: {apk.version_code}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "file_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Name" />
    ),
    cell: ({ row }) => row.getValue("file_name"),
  },
  {
    accessorKey: "file_size_bytes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File Size" />
    ),
    cell: ({ row }) => formatBytes(row.original.file_size_bytes),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_mandatory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mandatory" />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.is_mandatory}
        readOnly // This checkbox is for display only; editing happens via the dialog
      />
    ),
  },
  {
    accessorKey: "uploaded_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded At" />
    ),
    cell: ({ row }) => format(new Date(row.original.uploaded_at), "PPP"), // e.g., Jan 1, 2023
  },
  {
    id: "actions",
    header: "Actions", // No sorting on actions column
    cell: ({ row }) => {
      const apk = row.original;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog

      const handleDelete = async () => {
        try {
          await api.delete(`/api/v1/apk_versions/${apk.id}`);
        //   toast({
        //     title: "APK Version Deleted",
        //     description: `Version ${apk.version_name} (${apk.version_code}) has been deleted successfully.`,
        //   });
          setIsDeleteDialogOpen(false); // Close the dialog
        } catch (error: any) {
          console.error("Failed to delete APK version:", error);
        //   toast({
        //     title: "Error Deleting APK Version",
        //     description: error.response?.data?.message || "An unexpected error occurred while deleting.",
        //     variant: "destructive",
        //   });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(apk.checksum_sha256);
                // toast({
                //   title: "Checksum Copied!",
                //   description: "SHA-256 checksum copied to clipboard.",
                // });
              }}
            >
              Copy Checksum
              <Button variant="outline">⌘C</Button> {/* Example shortcut */}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Edit Action using EditApkComponent */}
            <DropdownMenuItem asChild> {/* Use asChild to render the Button inside DropdownMenuItem */}
              <EditApkComponent apk={apk} >
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </EditApkComponent>
            </DropdownMenuItem>
            
            {/* Delete Action using AlertDialog */}
            <DropdownMenuItem asChild> {/* Use asChild to render the AlertDialogTrigger inside DropdownMenuItem */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 p-0 h-auto">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                            <Button variant="ghost">⌘D</Button> {/* Example shortcut */}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the APK version{" "}
                                <span className="font-bold">{apk.version_name} (Code: {apk.version_code})</span> from your records.
                                {apk.is_active && (
                                    <p className="text-red-500 mt-2 font-semibold">
                                        Note: This version is currently marked as active. Deleting it might affect device updates if no other version is active.
                                    </p>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];