import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Group } from "../columns";
import api from "@/api";
import { Edit } from "lucide-react";

const EditGroup = ({ group }: { group: Group }) => {
  const { group_id, name, rcs_enabled, placeholder_enabled } = group;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState(name || "");
  const [rcsEnable, setRcsEnable] = useState(rcs_enabled || false);
  const [placeholderEnabled, setplaceholderEnabled] = useState(
    placeholder_enabled || false
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/device/update-group/${group_id}`, {
        name: groupName,
        rcs_enabled: rcsEnable,
        placeholder_enabled: placeholderEnabled,
      });

      setOpen(false);
      // location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error("Error updating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Group Name Input */}
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                // onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            {/* RCS Enable Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="rcs">RCS Enable</Label>
              <Switch
                id="rcs"
                checked={rcsEnable}
                onCheckedChange={setRcsEnable}
              />
            </div>

            {/* Placeholder Enable Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="placeholder">Placeholder Enable</Label>
              <Switch
                id="placeholder"
                checked={placeholderEnabled}
                onCheckedChange={setplaceholderEnabled}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditGroup;
