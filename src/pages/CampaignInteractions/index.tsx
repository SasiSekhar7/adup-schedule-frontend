import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { CampaignInteraction, CampaignInteractionResponse, columns, filters } from "./columns";


function CampaignInteractions() {
  const [data, setData] = useState<CampaignInteraction[]>([])
  const fetchDta = async () => {
    const response =  await api.get<CampaignInteractionResponse>('/campaign/interactions')
    setData(response.interactions)
  };
  useEffect(() => {

    fetchDta();
  }, []);
 
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Campaign Interactions
        </p>
        <p className="text-sm text-muted-foreground">
          list of all Campaign Interactions 
        </p>
      </div>

      <div className="ml-auto">
      </div>
      </div>
     

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
     <DataTable data={data}  columns={columns} filters={filters}/>
    </div>
  );
}

export default CampaignInteractions;
