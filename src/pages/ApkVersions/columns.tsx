"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Download, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner"; // IMPORT SONNER TOAST HERE

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
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
import { Badge } from "@/components/ui/badge";
import api from "@/api";
import EditApkComponent from "./components/EditApkComponent";
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
} from "@/components/ui/alert-dialog";


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
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
    accessorKey: "s3_key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="S3 Key" />
    ),
    cell: ({ row }) => row.getValue("s3_key"),
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
        readOnly
      />
    ),
  },
  {
    accessorKey: "uploaded_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded At" />
    ),
    cell: ({ row }) => format(new Date(row.original.uploaded_at), "PPP"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const apk = row.original;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);

      const handleDelete = async () => {
        try {
          // Use toast.promise for better UX during async operations
          await toast.promise(api.delete(`/apk_versions/${apk.id}`), {
            loading: `Deleting version ${apk.version_name}...`,
            success: () => {
              setIsDeleteDialogOpen(false);
              // Call onDataChange() here if it's passed via cell context
              return `Version ${apk.version_name} (${apk.version_code}) has been deleted.`;
            },
            error: (error) => {
              console.error("Failed to delete APK version:", error);
              return `Error deleting version: ${error?.message || "An unexpected error occurred."}`;
            },
          });
        } catch (error: any) {
          // This catch block is mostly for unhandled errors, toast.promise handles API errors
          console.error("Caught error outside toast.promise:", error);
        }
      };

      return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
                // Sonner toast for copy action
                toast.info("Checksum Copied!", {
                  description: "SHA-256 checksum copied to clipboard.",
                });
              }}
            >
              Copy Checksum
              <Button variant="outline">⌘C</Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Edit Action */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsEditDialogOpen(true);
                setIsDropdownOpen(false);
              }}
            >
                <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            
            {/* Delete Action */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsDeleteDialogOpen(true);
                setIsDropdownOpen(false);
              }}
              className="text-red-500 hover:text-red-600"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>

          <EditApkComponent
              apk={apk}
              isOpen={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
              // onApkUpdated={onDataChange} // If you're passing onDataChange, make sure EditApkComponent also calls toast.success
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
        </DropdownMenu>
      );
    },
  },
];