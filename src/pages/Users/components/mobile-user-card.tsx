import { useState } from "react";
import api from "@/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { CircleX } from "lucide-react";

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  client_name: string;
}

interface Props {
  user: User;
  onRefresh: () => void;
}

export default function MobileUserCard({ user, onRefresh }: Props) {
  const [newPassword, setNewPassword] = useState("");

  const handleDelete = async () => {
    try {
      await api.delete(`/user/${user.user_id}`);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      await api.post(`/user/reset/${user.user_id}`, {
        newPassword,
      });

      alert("Password reset successfully");
      setNewPassword("");
    } catch (error) {
      alert("Failed to reset password");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-background">
      {/* Username */}
      <div>
        <p className="text-xs text-muted-foreground">Username</p>
        <p className="font-semibold">{user.name}</p>
      </div>

      {/* Email */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Email</p>
        <p className="break-all">{user.email}</p>
      </div>

      {/* Role */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Role</p>

        <Badge className="mt-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300">
          {user.role}
        </Badge>
      </div>

      {/* Client */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Client Name</p>
        <p>{user.client_name}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {/* Delete */}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex-1">
              <CircleX className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete user {user.name}?</DialogTitle>

              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <Input readOnly value={user.email} />

            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password */}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              Reset
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>

              <DialogDescription>Enter a new password.</DialogDescription>
            </DialogHeader>

            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />

            <DialogFooter>
              <Button onClick={handleResetPassword}>Reset Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
