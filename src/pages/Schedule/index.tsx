import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function Schedule() {
  const [data, setData] = useState<Device[]>([])
  useEffect(() => {
    const fetchDta = async () => {
      const response =  await api.get<DevicesResponse>('/schedule/all')
      setData(response.schedules)
      console.log(typeof response.schedules)
    };
    fetchDta();
  }, []);
  const filters =  [{label:"Ad Name", value:"ad_name"}, {label:"Select Date", value:"start_time"}];

  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Schedules
        </p>
        <p className="text-sm text-muted-foreground">
          list of all Ads and Devices 
        </p>
      </div>

    
      </div>
     

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
     <DataTable data={data}  columns={columns} filters={filters}/>
    </div>
  );
}

export default Schedule;
