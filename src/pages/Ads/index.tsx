import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Ad, AdsResponse, columns } from "./columns";

import AddAdComponent from "./components/AddAds";

function Ads() {
  const [data, setData] = useState<Ad[]>([]);
  const fetchDta = async () => {
    const response = await api.get<AdsResponse>("/ads/all");
    setData((response as any).ads);
    console.log(typeof (response as any).ads);
  };
  useEffect(() => {
    fetchDta();
  }, []);
  function onIsOpenChange() {
    fetchDta();
  }
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
        <div className="">
          <p className="text-md font-semibold ">Ads</p>
          <p className="text-sm text-muted-foreground">
            list of all Ads and files
          </p>
        </div>

        <div className="ml-auto">
          <AddAdComponent onIsOpenChange={onIsOpenChange} />
        </div>
      </div>

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
      <DataTable
        data={data}
        columns={columns}
        filters={[{ label: "Ad Name", value: "name" }]}
        getRowCanSelect={(row) => {
          const ad = row as Ad;
          return ad.status !== "pending" && ad.status !== "processing";
        }}
      />
    </div>
  );
}

export default Ads;
