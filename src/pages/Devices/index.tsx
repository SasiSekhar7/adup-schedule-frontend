import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Device, DevicesResponse, columns } from "./columns";
import AddDeviceDialog from "./components/AddDeviceDialog";

function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<Device[]>([]);

  const fetchDta = async () => {
    const response: DevicesResponse = await api.get("/device/all");
    setData(response.devices);
  };

  const handleRowClick = (device: Device) => {
    navigate(`/devices/${device.device_id}`);
  };

  useEffect(() => {
    fetchDta();
  }, []);

  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
        <div className="">
          <p className="text-md font-semibold ">Devices</p>
          <p className="text-sm text-muted-foreground">
            list of all android devices
          </p>
        </div>

        <div className="ml-auto">
          <AddDeviceDialog fetchDta={fetchDta} />
        </div>
      </div>

      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}
      <DataTable
        data={data}
        columns={columns(fetchDta)}
        onRowClick={handleRowClick}
        filters={[
          { label: "Locations", value: "location" },
          // { label: "Created At", value: "created_at" },
          { label: "Group Name", value: "group_name" },
          { label: "Device Name", value: "device_name" },
        ]}
      />
    </div>
  );
}

export default Home;
