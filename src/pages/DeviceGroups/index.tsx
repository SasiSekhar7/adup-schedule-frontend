import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useCallback, useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { Button } from "@/components/ui/button";
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
  const [clients, setClients] = useState<
    { client_id: string; name: string }[]
  >();
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
  const cleanName = name.replace(/[^a-zA-Z ]/g, "").trim().toUpperCase();
  const words = cleanName.split(/\s+/);
  const  baseCode = (words[0] || "XXXXXX").substring(0, 6).padEnd(6, "X");

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
    <div className="">
      <div className="flex items-center w-full mb-4">
        <div className="">
          <p className="text-md font-semibold ">Device Groups</p>
          <p className="text-sm text-muted-foreground">
            list of all adup display groups
          </p>
        </div>

        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>
                Create Device Group
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
              </DialogHeader>

              {userRole === "Admin" && (
                <div>
                  <Label>Client</Label>
                  <Select
                    onValueChange={(client_id) =>
                      setDeviceGroup({ ...deviceGroup, client_id })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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

              <Label>Name</Label>
              <Input
                type="text"
                value={deviceGroup.name}
                onChange={(e) =>
                  setDeviceGroup({ ...deviceGroup, name: e.target.value })
                }
                placeholder="Enter Device Group Name"
              />

              <Label>License Key</Label>
              <div className="flex items-center gap-2">
                <Input type="text" value={deviceGroup.reg_code} readOnly />
                <Button variant="outline" onClick={regenerateKey}>
                  <RefreshCcw size={16} />
                </Button>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  disabled={loading || !deviceGroup.name}
                >
                  <Save size={16} />
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable data={data} columns={columns} />
    </div>
  );
}

export default DeviceGroup;