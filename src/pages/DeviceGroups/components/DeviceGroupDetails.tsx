"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import DeviceGroupHeader from "./device-group/device-group-header";
import DeviceGroupStats from "./device-group/device-group-stats";
import DeviceListFilters from "./device-group/device-list-filters";
import DeviceCard from "./device-group/device-card";

import api from "@/api";
import { useNavigate, useParams } from "react-router-dom";

export default function DeviceGroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [deviceGroupData, setDeviceGroupData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await api.get(`/device/fetch-group-details/${groupId}`);
      console.log("groups:", res);

      setDeviceGroupData(res?.data);
    } catch (err: any) {
      console.error(err);
    } finally {
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    registrationStatus: "",
    deviceType: "",
    orientation: "",
    videoStreams: "",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter devices based on search and filters
  const filteredDevices = useMemo(() => {
    return deviceGroupData?.Devices?.filter((device: any) => {
      const matchesSearch =
        device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.android_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.device_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || device.status === filters.status;
      const matchesRegStatus =
        !filters.registrationStatus ||
        device.registration_status === filters.registrationStatus;
      const matchesType =
        !filters.deviceType || device.device_type === filters.deviceType;

      return matchesSearch && matchesStatus && matchesRegStatus && matchesType;
    });
  }, [deviceGroupData?.Devices, searchQuery, filters]);

  console.log("filteredDevices:", filteredDevices);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {deviceGroupData && <DeviceGroupHeader data={deviceGroupData} />}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Section */}
        {deviceGroupData && <DeviceGroupStats data={deviceGroupData} />}

        {/* Devices Section */}
        <div className="mt-8">
          {/* Header with Title and View Toggle */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Devices</h2>
              <p className="mt-1 text-sm text-slate-600">
                {filteredDevices?.length} of {deviceGroupData?.device_count}{" "}
                devices
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm hover:text-white"
                    : ""
                }
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm hover:text-white"
                    : ""
                }
              >
                List
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by device name, ID, or Android ID..."
                className="pl-10 bg-white border border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Component */}
            <div className="flex flex-col gap-3">
              <DeviceListFilters
                filters={filters}
                onFiltersChange={setFilters}
                devices={deviceGroupData?.Devices}
              />
            </div>
          </div>

          {/* Devices Display */}
          {filteredDevices?.length === 0 ? (
            <Card className="border-slate-200 p-12 text-center">
              <p className="text-slate-600">
                No devices found matching your criteria
              </p>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDevices?.map((device: any) => (
                <DeviceCard
                  key={device.device_id}
                  device={device}
                  onView={() => navigate(`/devices/${device.device_id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Device Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Android ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Last Synced
                      </th>
                      {/* <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDevices?.map((device: any) => (
                      <tr key={device.device_id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {device.device_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <Badge variant="outline" className="capitalize">
                            {device.device_type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {device.android_id.slice(0, 12)}...
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            className={
                              device.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }
                          >
                            {device.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(device.last_synced).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/devices/${device.device_id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
