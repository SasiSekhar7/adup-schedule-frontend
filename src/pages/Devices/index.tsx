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
import MobileDeviceCard from "./components/MobileDeviceCard";

function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDta = async () => {
    try {
      setLoading(true);
      const response: DevicesResponse = await api.get("/device/all");
      setData(response.devices);
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (device: Device) => {
    navigate(`/devices/${device.device_id}`);
  };

  useEffect(() => {
    fetchDta();
  }, []);

  const { limit } = useFeature();

  const maxDevices = limit("MAX_DEVICES");
  // const currentDevices = data.length;
  const currentDevices = data.filter(
    (device: any) => device.registration_status !== "pairing",
  ).length;

  const canAddDevice = currentDevices < maxDevices;

  const filteredDevices = data.filter((device) =>
    [device.device_id, device.device_name, device.group_name, device.location]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4 md:space-y-6 w-full  mx-auto md:mx-0 md:max-w-full">
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading Devices...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 md:p-6">
            <div
              className="flex-1
            "
            >
              {/* Desktop */}

              <div className="hidden md:block">
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

              {/* Mobile */}

              <div className="w-full min-w-0 md:hidden">
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border rounded-md"
                />

                <div className="w-full space-y-4 overflow-x-hidden">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => (
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => handleRowClick(device)}
                      >
                        <MobileDeviceCard
                          key={device.device_id}
                          device={device}
                          fetchDta={fetchDta}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No devices found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Home;
