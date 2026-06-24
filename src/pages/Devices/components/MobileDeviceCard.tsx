import { useState } from "react";
import api from "@/api";
import { Device } from "../columns";

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
import { CircleX, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import EditDeviceDialog from "./EditDeviceDialog";
import LocationCell from "./LocationCell";

interface Props {
  device: Device;
  fetchDta: () => void;
}

const statusVariants: Record<string, string> = {
  active: "bg-green-100 text-green-700 border border-green-400",
  Paused: "bg-yellow-100 text-yellow-700 border border-yellow-400",
  Draft: "bg-gray-100 text-gray-700 border border-gray-400",
};

export default function MobileDeviceCard({ device, fetchDta }: Props) {
  const [openDelete, setOpenDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(device.device_id);
      toast.success("Device ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async () => {
    try {
      await api.post(`/device/delete/${device.device_id}`);

      toast.success("Device deleted");

      setOpenDelete(false);

      fetchDta();
    } catch (error) {
      toast.error("Failed to delete device");
    }
  };

  return (
    <div className="w-full min-w-0 p-4 border rounded-lg shadow-sm bg-background overflow-hidden">
      {/* Device ID */}
      <div>
        <p className="text-xs text-muted-foreground">Device ID</p>

        <div className="flex items-center gap-2">
          <p className="font-semibold break-all">{device.device_id}</p>

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Group */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Group Name</p>

        <p>{device.group_name}</p>
      </div>

      {/* Device Name */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Device Name</p>

        <p>{device.device_name}</p>
      </div>

      {/* Device Location */}
      <div className="mt-3">
        <p className="text-xs break-all">Device Location</p>

        {/* <p>{device.location}</p> */}
        <LocationCell cords={device.location} />
      </div>

      {/* Status */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Status</p>

        <Badge
          className={
            statusVariants[device.status] ?? "bg-gray-100 text-gray-700 border"
          }
        >
          {device.status}
        </Badge>
      </div>

      {/* Last Synced */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Last Synced</p>

        <p>
          {device.last_synced
            ? formatDistanceToNow(new Date(device.last_synced), {
                addSuffix: true,
              })
            : "N/A"}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="flex-1">
          <EditDeviceDialog
            device={device}
            fetchDta={fetchDta}
            mobileView={true}
          />
        </div>

        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            >
              Delete Device
            </Button>
          </DialogTrigger>

          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Delete device record?</DialogTitle>

              <DialogDescription>
                This action will exit the application on the device and
                permanently delete the device record.
              </DialogDescription>
            </DialogHeader>

            <div>
              <p className="mb-2 text-sm">Exit Password</p>

              <Input readOnly value={(device as any).android_id || ""} />
            </div>

            <DialogFooter>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                Delete Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
