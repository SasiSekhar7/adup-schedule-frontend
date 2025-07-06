import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import Map from "./Map";
import { Device } from "../columns";

interface DeviceGroup {
  group_id: string;
  name: string;
}

const EditDeviceDialog = ({
  device,
  fetchDta,
}: {
  device: Device;
  fetchDta: () => void;
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [deviceData, setDeviceData] = useState<{
    deviceName: string;
    tags: string[];
    group_id: string | null;
    location: { lat: number; lng: number; address: string } | null;
    deviceId: string | null;
  }>(() => {
    const [lat, lng] = device.location.split(",").map(Number);
    return {
      deviceName: device.group_name,
      tags: (device as any).tags || [],
      group_id: device.group_id,
      location: { lat, lng, address: "" },
      deviceId: device.device_id,
    };
  });
  const [errors, setErrors] = useState<{
    deviceName?: boolean;
    group_id?: boolean;
  }>({});

  useEffect(() => {
    const fetchDeviceGroups = async () => {
      try {
        const response = await api.get<{ groups: DeviceGroup[] }>(
          "/device/group-list"
        );
        setDeviceGroups(response.groups || []);
      } catch (error) {
        console.error("Failed to fetch device groups", error);
      }
    };

    if (open) {
      fetchDeviceGroups();
    }
  }, [open]);

  const handleBack = () => {
    setStep(1);
  };

  const handleNext = async () => {
    const newErrors: { deviceName?: boolean; group_id?: boolean } = {};
    if (!deviceData.deviceName) {
      newErrors.deviceName = true;
    }
    if (!deviceData.group_id) {
      newErrors.group_id = true;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let payload = {
      ...deviceData,
    };

    await api.post(`device/update/${deviceData.deviceId}`, payload);

    setStep(2);
  };

  const handleSave = async () => {
    if (!deviceData.location) {
      toast.error("Please select a location on the map.");
      return;
    }
    try {
      let payload = {
        ...deviceData,
      };
      await api.post(`/device/update/matadata/${deviceData.deviceId}`, payload);
      toast.success("Device saved successfully!");
      fetchDta();
      handleClose();
    } catch (error) {
      console.error("Failed to save device location", error);
      toast.error("Failed to save device.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    const [lat, lng] = device.location.split(",").map(Number);
    setDeviceData({
      deviceName: device.group_name,
      tags: (device as any).tags || [],
      group_id: device.group_id,
      location: { lat, lng, address: "" },
      deviceId: device.device_id,
    });
    setErrors({});
    setStep(1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
        setOpen(isOpen);
      }}
      modal={false}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-4 my-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span>Device Info</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span>Location</span>
          </div>
        </div>
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceData.deviceName}
                onChange={(e) => {
                  setDeviceData({ ...deviceData, deviceName: e.target.value });
                  if (errors.deviceName) {
                    setErrors((prev) => ({ ...prev, deviceName: false }));
                  }
                }}
                required
                className={errors.deviceName ? "border-red-500" : ""}
              />
            </div>
            <div>
              <Label htmlFor="deviceGroup">Device Group</Label>
              <Select
                onValueChange={(value) => {
                  setDeviceData({ ...deviceData, group_id: value });
                  if (errors.group_id) {
                    setErrors((prev) => ({ ...prev, group_id: false }));
                  }
                }}
                required
                defaultValue={deviceData.group_id ?? ""}
              >
                <SelectTrigger
                  className={errors.group_id ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {deviceGroups.length === 0 ? (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate("/devices/groups")}
                      >
                        Create Group
                      </Button>
                    ) : (
                      deviceGroups.map((group) => (
                        <SelectItem key={group.group_id} value={group.group_id}>
                          {group.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={deviceData.tags.join(", ")}
                onChange={(e) =>
                  setDeviceData({
                    ...deviceData,
                    tags: e.target.value.split(","),
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="h-full">
            <Map
              onLocationSelect={(location) => {
                setDeviceData({
                  ...deviceData,
                  location: { ...location, address: "" },
                });
              }}
            />
          </div>
        )}
        <DialogFooter className="mt-4">
          {step === 1 ? (
            <Button
              onClick={() => handleNext()}
              className="w-full"
              disabled={
                !deviceData.deviceName ||
                !deviceData.group_id ||
                deviceData.tags.length == 0
              }
            >
              Next
            </Button>
          ) : (
            <div className="flex w-full space-x-2">
              <Button variant="outline" onClick={handleBack} className="w-1/2">
                Back
              </Button>
              <Button onClick={handleSave} className="w-1/2">
                Save
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeviceDialog;
