import api from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import MessageCell from "./MessageCell";
import EditGroup from "./EditGroup";
import { Group } from "../columns";

interface Props {
  group: Group;
}

export default function MobileGroupCard({ group }: Props) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(group.group_id);
      toast.success("Group ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleRefresh = async () => {
    try {
      await api.post(`/device/update-schedule/${group.group_id}`);

      toast.success("Schedule updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <Card className="p-4">
      {/* Group ID */}
      <div>
        <p className="text-xs text-muted-foreground">Group ID</p>

        <div className="flex items-start gap-2">
          <p className="flex-1 break-all font-medium">{group.group_id}</p>

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Group Name */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Group Name</p>

        <p>{group.name}</p>
      </div>

      {/* Client */}
      {group.Client && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">Client</p>

          <p>{group.Client.name}</p>
        </div>
      )}

      {/* Device Count */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Device Count</p>

        <p>{group.device_count}</p>
      </div>

      {/* Orientation */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Orientation</p>

        <p className="capitalize">{group.orientation}</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleRefresh();
          }}
        >
          Refresh Schedule
        </Button>

        <EditGroup group={group} mobileView />
      </div>

      <div className="mt-2">
        <MessageCell group={group} mobileView />
      </div>
    </Card>
  );
}
