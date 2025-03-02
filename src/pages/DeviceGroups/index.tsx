import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useCallback, useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
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


interface DeviceGroup {
  name: string,
  reg_code: string

}
function DeviceGroup() {
  const [data, setData] = useState<Device[]>([])
  const [deviceGroup, setDeviceGroup] = useState({ name: "", reg_code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
  
    const fetchDta = async () => {
      const response =  await api.get<DevicesResponse>('/device/fetch-groups')
      setData(response.groups)
      console.log(typeof response.groups)
    };
  useEffect(() => {

    fetchDta();
  }, []);
  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/device/create-group', deviceGroup);
      fetchDta();
      setLoading(false);
      setOpen(false);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
  } finally {
      setLoading(false);
  }
  }
  function generateShortCode(name) {
    if (!name) return "";
    
    // Remove special characters and convert to uppercase
    const cleanName = name.replace(/[^a-zA-Z ]/g, "").trim().toUpperCase();

    // Split the name into words
    const words = cleanName.split(/\s+/);

    // Take the first 6 characters from the first word (pad if needed)
    let baseCode = (words[0] || "XXXXXX").substring(0, 6).padEnd(6, "X");

    // Generate a 2-letter hash from the name
    let hash = (name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 676)
        .toString(36)  // Convert to base36 (letters+numbers)
        .toUpperCase()
        .padStart(2, "A"); // Ensure always 2 characters

    return baseCode + hash; // Always 8 characters
}
  useEffect(() => {
    const handler = setTimeout(() => {
        if (deviceGroup.name) {
            setDeviceGroup((prev) => ({
                ...prev,
                reg_code: generateShortCode(prev.name),
            }));
        }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(handler); // Cleanup
}, [deviceGroup.name]);

const regenerateKey = useCallback(() => {
  if (deviceGroup.name) {
      setDeviceGroup((prev) => ({
          ...prev,
          reg_code: generateShortCode(prev.name),
      }));
  }
}, [deviceGroup.name]);
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Device Groups 
        </p>
        <p className="text-sm text-muted-foreground">
          list of all adup display groups 
        </p>
      </div>

      <div className="ml-auto">
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
      <Button >
          Create Device Group 
          <Plus className="h-4 w-4"/>
        </Button>
      </DialogTrigger>
      <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
            </DialogHeader>

            <Label>Name</Label>
            <Input
                type="text"
                value={deviceGroup.name}
                onChange={(e) => setDeviceGroup({ ...deviceGroup, name: e.target.value })}
                placeholder="Enter Device Group Name"
            />

            <Label>License Key</Label>
            <div className="flex items-center gap-2">
                <Input type="text" value={deviceGroup.reg_code} readOnly />
                <Button variant="outline" onClick={regenerateKey}>
                    <RefreshCcw size={16} />
                </Button>
            </div>

            {/* Show Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <DialogFooter>
                <Button onClick={handleCreate} disabled={loading || !deviceGroup.name}>
                    <Save size={16} />
                    {loading ? "Creating..." : "Create"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
 
      </div>
      </div>
     

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
     <DataTable data={data}  columns={columns}/>
    </div>
  );
}

export default DeviceGroup;
