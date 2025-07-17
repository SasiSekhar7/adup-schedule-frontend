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
import { CheckCircle, Plus, XCircle } from "lucide-react";
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
  const [deviceData, setDeviceData] = useState<{
    pairingCode: string;
    device_name: string;
    tags: string[];
    group_id: string | null;
    location: { lat: number; lng: number; address: string } | null;
    deviceId: string | null;
  }>({
    pairingCode: "",
    device_name: "",
    tags: [],
    group_id: null,
    location: null,
    deviceId: null,
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
        setDeviceGroups(response.groups || []);
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
          const { device_name, tags, device_id } = response;
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
      await api.post(`/device/update/location/${deviceData.deviceId}`, payload);
      toast.success("Device saved successfully!");
      fetchDta();
      handleClose();
      setStep(1);
    } catch (error) {
      console.error("Failed to save device location", error);
      toast.error("Failed to save device.");
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
        <Button>
          Add Device
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[100vw] h-[90vh] overflow-x-auto">
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
        </div>
        {step === 1 ? (
          <div className="space-y-4">
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
                !deviceData.pairingCode ||
                !deviceData.device_name ||
                !deviceData.group_id ||
                deviceData.tags.length <= 0
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

export default AddDeviceDialog;
