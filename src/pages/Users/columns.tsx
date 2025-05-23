"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CircleX } from "lucide-react";
import api from "@/api";
import { useState } from "react";

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  client_name: string;
}

export const userColumns: ColumnDef<User>[] = [
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => row.getValue("email"),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300">
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => row.getValue("phone_number"),
  },
  {
    accessorKey: "client_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row }) => row.getValue("client_name"),
  },
  {
    id: "actions",
    header: () => "Action",
    cell: ({ row }) => {
      const user = row.original;
      const [newPassword, setNewPassword] = useState("");

      const handleDelete = async () => {
        await api.delete(`/user/${user.user_id}`);
        location.reload(); // Or refresh table state
      };

      const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) {
          alert("Password must be at least 8 characters.");
          return;
        }

        try {
          await api.post(`/user/reset/${user.user_id}`, { newPassword });
          alert("Password reset successfully.");
        } catch (error) {
          alert("Failed to reset password.");
        }
      };

      return (
<div className="flex space-x-2">
      {/* Delete Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <CircleX />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user {user.name}?</DialogTitle>
            <DialogDescription>
              This action will permanently remove the user from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              You can copy the user's email for your reference before deleting:
            </p>
            <Input readOnly value={user.email} className="w-[250px] mt-2" />
          </div>
          <DialogFooter>
            <Button onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Reset</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {user.name}</DialogTitle>
            <DialogDescription>
              Enter a new password for this user.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        
      );
    },
  },
];
