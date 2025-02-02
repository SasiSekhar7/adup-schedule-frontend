import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
function Clients() {
  const [data, setData] = useState<Device[]>([])
  useEffect(() => {
    const fetchDta = async () => {
      const response =  await api.get<DevicesResponse>('/ads/clients')
      setData(response.clients)
    };
    fetchDta();
  }, []);
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Clients
        </p>
        <p className="text-sm text-muted-foreground">
          list of all Clients 
        </p>
      </div>

      <div className="ml-auto">
        <Button >
          Uplaod Ad
          <Plus className="h-4 w-4"/>
        </Button>
      </div>
      </div>
     <div className="grid gap-8 grid-flow-col grid-cols-3">
      {data.map((client)=>{
       
        return(
          
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{client.name}</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.adsCount}</div>
            <p className="text-xs text-muted-foreground">Total Ads </p>
          </CardContent>
        </Card>

        )
      })}
      </div>
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}

    </div>
  );
}

export default Clients;
