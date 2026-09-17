import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

interface TestAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertSentSuccess?: () => void;
}

export const TestAlertModal: React.FC<TestAlertModalProps> = ({
  open,
  onOpenChange,
  onAlertSentSuccess,
}) => {
  const [severity, setSeverity] = useState<string>("WARNING");
  const [category, setCategory] = useState<string>("SYSTEM");
  const [title, setTitle] = useState<string>("Manual System Alert Verification");
  const [message, setMessage] = useState<string>(
    "This is an on-demand verification email dispatched by the Administrator from the System Health Dashboard."
  );
  const [sending, setSending] = useState<boolean>(false);

  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    try {
      setSending(true);
      const res: any = await api.post("/admin/system/test-alert", {
        severity,
        category,
        title,
        message,
      });

      if (res.success) {
        toast.success(`Test ${severity} alert sent successfully! Email dispatched via AWS SES.`);
        onOpenChange(false);
        if (onAlertSentSuccess) onAlertSentSuccess();
      } else {
        toast.error(res.error || "Failed to send test alert");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send test alert");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSendTestAlert} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Mail className="w-5 h-5 text-primary" />
              Dispatch Test Alert Notification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Triggers a live test alert into the database and dispatches an HTML email to configured
              administrator recipients via AWS SES.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Severity Level</label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="WARNING">WARNING (Yellow)</SelectItem>
                    <SelectItem value="ERROR">ERROR (Rose)</SelectItem>
                    <SelectItem value="CRITICAL">CRITICAL (Red)</SelectItem>
                    <SelectItem value="FATAL">FATAL (Dark Red)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                    <SelectItem value="DISK">DISK</SelectItem>
                    <SelectItem value="DATABASE">DATABASE</SelectItem>
                    <SelectItem value="MEMORY">MEMORY</SelectItem>
                    <SelectItem value="MQTT">MQTT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Subject / Title</label>
              <Input
                className="h-8 text-xs font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Alert title..."
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Alert Message</label>
              <Textarea
                className="text-xs h-24"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detailed error message or alert context..."
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={sending} className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {sending ? "Dispatching..." : "Send Test Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
