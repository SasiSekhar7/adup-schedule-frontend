import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
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

}
function DeviceGroup() {
  const [data, setData] = useState<Device[]>([])
    const [deviceGroup, setDeviceGroup] = useState<DeviceGroup>()
    const [loading, setLoading] = useState(false);
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
    setLoading(true)
    try {
      await api.post('/device/create-group', deviceGroup);
      fetchDta();
      setLoading(false);
      setOpen(false);

    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }
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
          value={deviceGroup?.name}
          onChange={(e) => setDeviceGroup({ ...deviceGroup, name: e.target.value })}
        />
 
        {/* <Label>Duration</Label>
        <Input
          type="number"
          value={ad?.duration}
          onChange={(e) => setAd({ ...ad,duration: parseInt(e.target.value)})}
          readOnly
          defaultValue={10}
        /> */}
        {/* {error && <span className="text-red-500 text-sm">{error}</span>} */}

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            <Save />
            Create
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
