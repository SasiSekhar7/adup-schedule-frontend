import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useCallback, useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCcw, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRole } from "@/helpers";

interface DeviceGroup {
  name: string;
  reg_code: string;
  client_id?: string; // Add client_id to the DeviceGroup interface
}

function DeviceGroup() {
  const [data, setData] = useState<Device[]>([]);
  const [deviceGroup, setDeviceGroup] = useState<DeviceGroup>({
    name: "",
    reg_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [clients, setClients] =
    useState<{ client_id: string; name: string }[]>();
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchDta = async () => {
    const response = await api.get<DevicesResponse>("/device/fetch-groups");
    setData(response.groups);
  };

  const fetchClients = async () => {
    try {
      const data = await api.get("/ads/clients"); // Assuming the same endpoint for clients
      setClients(data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    const role = getRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchDta();
    if (userRole === "Admin") {
      fetchClients();
    }
  }, [userRole]);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/device/create-group", deviceGroup);
      fetchDta();
      setLoading(false);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  function generateUniqueCode(name: string): string {
    const cleanName = name
      .replace(/[^a-zA-Z ]/g, "")
      .trim()
      .toUpperCase();
    const words = cleanName.split(/\s+/);
    const baseCode = (words[0] || "XXXXXX").substring(0, 6).padEnd(6, "X");

    // Random 4-digit alphanumeric string
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${baseCode}${randomPart}`;
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (deviceGroup.name) {
        setDeviceGroup((prev) => ({
          ...prev,
          reg_code: generateUniqueCode(prev.name),
        }));
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [deviceGroup.name]);

  const regenerateKey = useCallback(() => {
    if (deviceGroup.name) {
      setDeviceGroup((prev) => ({
        ...prev,
        reg_code: generateUniqueCode(prev.name),
      }));
    }
  }, [deviceGroup.name]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Device Groups</p>
          <p className="text-sm text-muted-foreground">
            List of all adup display groups
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <span className="hidden sm:inline">Create Device Group</span>
                <span className="sm:hidden">Create Group</span>
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  Create Group
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {userRole === "Admin" && (
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select
                      onValueChange={(client_id) =>
                        setDeviceGroup({ ...deviceGroup, client_id })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {clients?.map((client) => (
                            <SelectItem
                              key={client.client_id}
                              value={client.client_id}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={deviceGroup.name}
                    onChange={(e) =>
                      setDeviceGroup({ ...deviceGroup, name: e.target.value })
                    }
                    placeholder="Enter Device Group Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>License Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={deviceGroup.reg_code}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={regenerateKey}
                      size="icon"
                    >
                      <RefreshCcw size={16} />
                    </Button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={loading || !deviceGroup.name}
                  className="w-full sm:w-auto"
                >
                  <Save size={16} className="mr-2" />
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div
            className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
"
          >
            {/* Mobile scroll hint */}
            <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
              Scroll →
            </div>
            <DataTable data={data} columns={columns} maxHeight="none" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DeviceGroup;
