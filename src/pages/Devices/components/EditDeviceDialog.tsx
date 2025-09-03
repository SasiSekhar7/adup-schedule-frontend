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
import { Edit, X } from "lucide-react";
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
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [deviceData, setDeviceData] = useState<{
    device_name: string;
    tags: string[];
    group_id: string | null;
    location: { lat: number; lng: number; address: string } | null;
    deviceId: string | null;
  }>(() => {
    const [lat, lng] = device.location.split(",").map(Number);
    return {
      device_name: device.device_name,
      tags: (device as any).tags || [],
      group_id: device.group_id,
      location: { lat, lng, address: "" },
      deviceId: device.device_id,
    };
  });
  const [errors, setErrors] = useState<{
    device_name?: boolean;
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

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !deviceData.tags.includes(trimmedTag)) {
      setDeviceData({
        ...deviceData,
        tags: [...deviceData.tags, trimmedTag],
      });
    }
    setCurrentTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDeviceData({
      ...deviceData,
      tags: deviceData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(currentTagInput);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleNext = async () => {
    const newErrors: { device_name?: boolean; group_id?: boolean } = {};
    if (!deviceData.device_name) {
      newErrors.device_name = true;
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
      device_name: device.group_name,
      tags: (device as any).tags || [],
      group_id: device.group_id,
      location: { lat, lng, address: "" },
      deviceId: device.device_id,
    });
    setErrors({});
    setStep(1);
    setCurrentTagInput("");
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
      <DialogContent className="w-[100vw] h-[90vh] overflow-x-auto">
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
              <Label htmlFor="device_name">Device Name</Label>
              <Input
                id="device_name"
                value={deviceData.device_name}
                onChange={(e) => {
                  setDeviceData({ ...deviceData, device_name: e.target.value });
                  if (errors.device_name) {
                    setErrors((prev) => ({ ...prev, device_name: false }));
                  }
                }}
                required
                className={errors.device_name ? "border-red-500" : ""}
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
              <div className="space-y-2 py-1">
                {/* Display existing tags */}
                {deviceData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {deviceData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-black-800 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Input for adding new tags */}
                <Input
                  id="tags"
                  placeholder="Type a tag and press Enter to add"
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                />
              </div>
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
              initialPosition={deviceData.location}
            />
          </div>
        )}
        <DialogFooter className="mt-4">
          {step === 1 ? (
            <Button
              onClick={() => handleNext()}
              className="w-full"
              disabled={
                !deviceData.device_name ||
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
