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
import { CheckCircle, Plus, XCircle, X } from "lucide-react";
import Map from "./Map";

interface DeviceGroup {
  group_id: string;
  name: string;
}

const AddDeviceDialog = ({ fetchDta }: { fetchDta: () => void }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [deviceData, setDeviceData] = useState<{
    pairingCode: string;
    device_name: string;
    tags: string[];
    group_id: string | null;
    location: { lat: number; lng: number; address: string } | null;
    deviceId: string | null;
    android_id: string;
    device_model: string | null;
    device_off_time: string;
    device_on_time: string;
    device_orientation: string;
    device_os: string | null;
    device_os_version: string | null;
    device_resolution: string | null;
    device_type: string;
    registration_status: string;
    status: string;
  }>({
    pairingCode: "",
    device_name: "",
    tags: [],
    group_id: null,
    location: null,
    deviceId: null,
    android_id: "",
    device_model: null,
    device_off_time: "23:00:00",
    device_on_time: "06:00:00",
    device_orientation: "auto",
    device_os: null,
    device_os_version: null,
    device_resolution: null,
    device_type: "tv",
    registration_status: "pending",
    status: "active",
  });
  const [errors, setErrors] = useState<{
    pairingCode?: boolean;
    device_name?: boolean;
    group_id?: boolean;
  }>({});

  useEffect(() => {
    const fetchDeviceGroups = async () => {
      try {
        const response = await api.get<{ groups: DeviceGroup[] }>(
          "/device/group-list"
        );
        console.log("Device groups:", response);
        setDeviceGroups((response as any).groups || []);
      } catch (error) {
        console.error("Failed to fetch device groups", error);
      }
    };

    if (open) {
      fetchDeviceGroups();
    }
  }, [open]);

  useEffect(() => {
    setIsVerified(false);
    if (deviceData.pairingCode.length > 5) {
      const handler = setTimeout(async () => {
        try {
          const response = await api.get<{
            device_name: string;
            tags: string[];
            device_id: string;
          }>(`/device/new-register/${deviceData.pairingCode}`);
          console.log("Device details:", response);
          const { device_name, tags, device_id } = response as any;
          setDeviceData((prev) => ({
            ...prev,
            device_name: device_name || "",
            tags,
            deviceId: device_id,
          }));
          setIsVerified(true);
        } catch (error) {
          console.error("Failed to fetch device details", error);
          setIsVerified(false);
        }
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [deviceData.pairingCode]);

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
    const newErrors: {
      pairingCode?: boolean;
      device_name?: boolean;
      group_id?: boolean;
    } = {};
    if (!deviceData.pairingCode) {
      newErrors.pairingCode = true;
    }
    if (!deviceData.device_name) {
      newErrors.device_name = true;
    }
    if (!deviceData.group_id) {
      newErrors.group_id = true;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields.");
      return;
    }

    if (!isVerified) {
      toast.error("Invalid pairing code.");
      return; // Exit the function early if not verified
    }

    // Step 1 -> Step 2: No API call, just validation and move to next step
    setStep(2);
  };

  const handleLocationSave = async () => {
    if (!deviceData.location) {
      toast.error("Please select a location on the map.");
      return;
    }
    if (!deviceData.group_id) {
      toast.error("Device group is required.");
      return;
    }
    try {
      // Step 2: Save group_id and location (mandatory fields)
      let payload = {
        group_id: deviceData.group_id,
        location: deviceData.location,
      };
      await api.post(`/device/update/location/${deviceData.deviceId}`, payload);
      setStep(3);
    } catch (error) {
      console.error("Failed to save device location", error);
      toast.error("Failed to save device location.");
    }
  };

  const handleSave = async () => {
    try {
      // Step 3: Save only editable metadata
      let payload = {
        device_on_time: deviceData.device_on_time,
        device_off_time: deviceData.device_off_time,
        device_type: deviceData.device_type,
        device_resolution: deviceData.device_resolution,
        device_orientation: deviceData.device_orientation,
      };
      await api.post(`/device/update/location/${deviceData.deviceId}`, payload);
      toast.success("Device saved successfully!");
      fetchDta();
      handleClose();
      setStep(1);
    } catch (error) {
      console.error("Failed to save device configuration", error);
      toast.error("Failed to save device configuration.");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDeviceData({
      pairingCode: "",
      device_name: "",
      tags: [],
      group_id: null,
      location: null,
      deviceId: null,
      android_id: "",
      device_model: null,
      device_off_time: "23:00:00",
      device_on_time: "06:00:00",
      device_orientation: "auto",
      device_os: null,
      device_os_version: null,
      device_resolution: null,
      device_type: "tv",
      registration_status: "pending",
      status: "active",
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
        <Button>
          Add Device
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[100vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
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
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <span>Configuration</span>
          </div>
        </div>
        {step === 1 ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="pairingCode">Pairing Code</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="pairingCode"
                  value={deviceData.pairingCode}
                  onChange={(e) => {
                    setDeviceData({
                      ...deviceData,
                      pairingCode: e.target.value,
                    });
                    if (errors.pairingCode) {
                      setErrors((prev) => ({ ...prev, pairingCode: false }));
                    }
                  }}
                  required
                  className={errors.pairingCode ? "border-red-500" : ""}
                />
                {isVerified ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
              </div>
            </div>
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
        ) : step === 2 ? (
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
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Additional Device Fields - Step 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="android_id">Android ID</Label>
                <Input
                  id="android_id"
                  value={deviceData.android_id}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Android device ID"
                />
              </div>
              <div>
                <Label htmlFor="device_model">Device Model</Label>
                <Input
                  id="device_model"
                  value={deviceData.device_model || ""}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Device model"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_on_time">Device On Time</Label>
                <Input
                  id="device_on_time"
                  type="time"
                  value={deviceData.device_on_time}
                  onChange={(e) =>
                    setDeviceData({
                      ...deviceData,
                      device_on_time: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="device_off_time">Device Off Time</Label>
                <Input
                  id="device_off_time"
                  type="time"
                  value={deviceData.device_off_time}
                  onChange={(e) =>
                    setDeviceData({
                      ...deviceData,
                      device_off_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_type">Device Type</Label>
                <Select
                  value={deviceData.device_type}
                  onValueChange={(value) =>
                    setDeviceData({ ...deviceData, device_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="tv">TV</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="device_orientation">Device Orientation</Label>
                <Select
                  value={deviceData.device_orientation}
                  onValueChange={(value) =>
                    setDeviceData({ ...deviceData, device_orientation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_os">Device OS</Label>
                <Input
                  id="device_os"
                  value={deviceData.device_os || ""}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="Operating system"
                />
              </div>
              <div>
                <Label htmlFor="device_os_version">OS Version</Label>
                <Input
                  id="device_os_version"
                  value={deviceData.device_os_version || ""}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder="OS version"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_resolution">Device Resolution</Label>
                <Input
                  id="device_resolution"
                  value={deviceData.device_resolution || ""}
                  onChange={(e) =>
                    setDeviceData({
                      ...deviceData,
                      device_resolution: e.target.value || null,
                    })
                  }
                  placeholder="e.g., 1920x1080"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={deviceData.status}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          {step === 1 ? (
            <Button
              onClick={() => handleNext()}
              className="w-full"
              disabled={
                !deviceData.pairingCode ||
                !deviceData.device_name ||
                !deviceData.group_id ||
                deviceData.tags.length <= 0
              }
            >
              Next
            </Button>
          ) : step === 2 ? (
            <div className="flex w-full space-x-2">
              <Button variant="outline" onClick={handleBack} className="w-1/2">
                Back
              </Button>
              <Button onClick={handleLocationSave} className="w-1/2">
                Next
              </Button>
            </div>
          ) : (
            <div className="flex w-full space-x-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-1/2"
              >
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

export default AddDeviceDialog;
