import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function Home() {
  const [data, setData] = useState<Device[]>([])
  useEffect(() => {
    const fetchDta = async () => {
      const response =  await api.get<DevicesResponse>('/device/all')
      setData(response.devices)
    };
    fetchDta();
  }, []);
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Devices
        </p>
        <p className="text-sm text-muted-foreground">
          list of all android devices 
        </p>
      </div>

      {/* <div className="ml-auto">
        <Button >
          Add Device
          <Plus className="h-4 w-4"/>
        </Button>
      </div> */}
      </div>
     

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
     <DataTable data={data}  columns={columns} filters={[{label: "Locations", value:"location"}]}/>
    </div>
  );
}

export default Home;
