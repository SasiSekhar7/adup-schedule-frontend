import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Pencil } from "lucide-react";
import api from "@/api";

interface EditAccountProps {
  onIsOpenChange?: (open: boolean) => void;
}

function EditAccount({ onIsOpenChange }: EditAccountProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onIsOpenChange?.(isOpen);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);

      const { name, email, phone_number, newPassword, confirmPassword } = form;

      if (!name || !email || !phone_number) {
        throw "Name, Email, and Phone number are required.";
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw "Please enter a valid email address.";
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone_number)) {
        throw "Please enter a valid 10-digit phone number.";
      }
        if (newPassword) {
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                throw "Password must be at least 8 characters long and include at least one number and one special character.";
            }
        }
      if (newPassword && newPassword !== confirmPassword) {
        throw "Passwords do not match.";
      }

      const payload = {
        name,
        email,
        phone_number,
        ...(newPassword && { password: newPassword }),
      };

      await api.put("/user/update", payload);
      setLoading(false);
      handleDialogChange(false); 
    } catch (err: any) {
      console.error("Update error:", err);
      setError(typeof err === "string" ? err : err?.response?.data?.message || "Update failed.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Account
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Label>Phone Number</Label>
          <Input
            type="number"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          />

          <Label>New Password</Label>
          <Input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />

          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2" />
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditAccount;
