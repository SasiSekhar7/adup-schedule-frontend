import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Device, DevicesResponse, columns } from "./columns";
import AddDeviceDialog from "./components/AddDeviceDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useFeature } from "@/context/hooks/useFeature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const { limit, isAdmin } = useFeature();

  const maxDevices = limit("MAX_DEVICES");
  const currentDevices = data.length;

  const canAddDevice = currentDevices < maxDevices;

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-[320px] mx-auto md:mx-0 md:max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Devices</p>
          <p className="text-sm text-muted-foreground">
            List of all android devices
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {/* <AddDeviceDialog fetchDta={fetchDta} /> */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block w-full sm:w-auto">
                  <div className={!canAddDevice ? "cursor-not-allowed" : ""}>
                    <AddDeviceDialog
                      fetchDta={fetchDta}
                      disabled={!canAddDevice}
                    />
                  </div>
                </div>
              </TooltipTrigger>

              {!canAddDevice && (
                <TooltipContent>
                  <p>
                    You reached your device limit ({maxDevices}). Upgrade to add
                    more.
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div
            className="
              max-w-[350px]
              md:max-w-[calc(100vw-20rem)]
              relative
            "
          >
            {/* Mobile scroll hint */}
            <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
              Scroll →
            </div>
            <DataTable
              data={data}
              columns={columns(fetchDta)}
              onRowClick={handleRowClick}
              filters={[
                { label: "Locations", value: "location" },
                { label: "Device ID", value: "device_id" },
                { label: "Group Name", value: "group_name" },
                { label: "Device Name", value: "device_name" },
              ]}
              maxHeight="none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
