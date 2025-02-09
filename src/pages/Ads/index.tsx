import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddAdComponent from "./components/AddAds";

function Ads() {
  const [data, setData] = useState<Device[]>([])
  const fetchDta = async () => {
    const response =  await api.get<DevicesResponse>('/ads/all')
    setData(response.ads)
    console.log(typeof response.ads)
  };
  useEffect(() => {

    fetchDta();
  }, []);
  function onIsOpenChange(){
    fetchDta();
  }
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Ads
        </p>
        <p className="text-sm text-muted-foreground">
          list of all Ads and files 
        </p>
      </div>

      <div className="ml-auto">
        <AddAdComponent onIsOpenChange={onIsOpenChange}/>
      </div>
      </div>
     

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
     <DataTable data={data}  columns={columns} filters={[{label:"Ad Name", value:"name"}]}/>
    </div>
  );
}

export default Ads;
