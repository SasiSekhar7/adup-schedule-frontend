import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Device {
  device_id: string;
  device_name: string;
  group_id: string;
  android_id: string;
  location: string;
  status: string;
  registration_status: string;
  tags: string | null;
  pairing_code: string | null;
  last_synced: string;
  created_at: string;
  updated_at: string;
  DeviceGroup: {
    name: string;
    reg_code: string;
    group_id: string;
  };
}

interface ProofOfPlayLog {
  id: string;
  event_id: string;
  device_id: string;
  ad_id: string;
  schedule_id: string | null;
  start_time: string;
  end_time: string;
  duration_played_ms: number;
  created_at: string;
  updated_at: string;
}

interface DeviceEventLog {
  id: string;
  event_id: string;
  device_id: string;
  timestamp: string;
  event_type: string;
  payload: string;
  created_at: string;
  updated_at: string;
}

interface DeviceTelemetry {
  id: string;
  device_id: string;
  timestamp: string;
  cpu_usage: number;
  ram_free_mb: number;
  storage_free_mb: number | null;
  network_type: string | null;
  app_version_code: number | null;
  created_at: string;
  updated_at: string;
}

interface Schedule {
  schedule_id: string;
  start_time: string;
  end_time: string;
  Ad: {
    name: string;
  };
}

interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

interface DeviceDetailsResponse {
  device: Device;
  schedules: PaginatedResponse<Schedule>;
}

function DevicePage() {
  const { device_id } = useParams<{ device_id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [proofOfPlayLogs, setProofOfPlayLogs] = useState<ProofOfPlayLog[]>([]);
  const [deviceEventLogs, setDeviceEventLogs] = useState<DeviceEventLog[]>([]);
  const [deviceTelemetry, setDeviceTelemetry] = useState<DeviceTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedules");

  // Pagination state for schedules
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [schedulesLimit, setSchedulesLimit] = useState(10);
  const [schedulesTotal, setSchedulesTotal] = useState(0);
  const [schedulesTotalPages, setSchedulesTotalPages] = useState(0);

  // Pagination state for proof of play logs
  const [proofOfPlayPage, setProofOfPlayPage] = useState(1);
  const [proofOfPlayLimit, setProofOfPlayLimit] = useState(10);
  const [proofOfPlayTotal, setProofOfPlayTotal] = useState(0);
  const [proofOfPlayTotalPages, setProofOfPlayTotalPages] = useState(0);

  // Pagination state for device event logs
  const [eventLogsPage, setEventLogsPage] = useState(1);
  const [eventLogsLimit, setEventLogsLimit] = useState(10);
  const [eventLogsTotal, setEventLogsTotal] = useState(0);
  const [eventLogsTotalPages, setEventLogsTotalPages] = useState(0);

  // Pagination state for device terminology
  const [terminologyPage, setTerminologyPage] = useState(1);
  const [terminologyLimit, setTerminologyLimit] = useState(10);
  const [terminologyTotal, setTerminologyTotal] = useState(0);
  const [terminologyTotalPages, setTerminologyTotalPages] = useState(0);

  useEffect(() => {
    if (!device_id) return;

    const fetchDeviceData = async () => {
      setLoading(true);
      try {
        // Fetch device details and schedules
        const deviceDetailsResponse: DeviceDetailsResponse = await api.get(
          `/device/${device_id}?page=${schedulesPage}&limit=${schedulesLimit}`
        );
        setDevice(deviceDetailsResponse.device);
        setSchedules(deviceDetailsResponse.schedules.data || []);
        setSchedulesTotal(deviceDetailsResponse.schedules.total);
        setSchedulesTotalPages(deviceDetailsResponse.schedules.totalPages);

        // Fetch proof of play logs
        const proofOfPlayResponse: PaginatedResponse<ProofOfPlayLog> =
          await api.get(
            `/device/${device_id}/proof-of-play-logs?page=${proofOfPlayPage}&limit=${proofOfPlayLimit}`
          );
        setProofOfPlayLogs(proofOfPlayResponse.data || []);
        setProofOfPlayTotal(proofOfPlayResponse.total);
        setProofOfPlayTotalPages(proofOfPlayResponse.totalPages);

        // Fetch device event logs
        const eventLogsResponse: PaginatedResponse<DeviceEventLog> =
          await api.get(
            `/device/${device_id}/event-logs?page=${eventLogsPage}&limit=${eventLogsLimit}`
          );
        setDeviceEventLogs(eventLogsResponse.data || []);
        setEventLogsTotal(eventLogsResponse.total);
        setEventLogsTotalPages(eventLogsResponse.totalPages);

        // Fetch device telemetry
        const telemetryResponse: PaginatedResponse<DeviceTelemetry> =
          await api.get(
            `/device/${device_id}/telemetry-logs?page=${terminologyPage}&limit=${terminologyLimit}`
          );
        setDeviceTelemetry(telemetryResponse.data || []);
        setTerminologyTotal(telemetryResponse.total);
        setTerminologyTotalPages(telemetryResponse.totalPages);
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [
    device_id,
    schedulesPage,
    schedulesLimit,
    proofOfPlayPage,
    proofOfPlayLimit,
    eventLogsPage,
    eventLogsLimit,
    terminologyPage,
    terminologyLimit,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading device details...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-lg mb-4">Device not found</div>
        <Button onClick={() => navigate("/devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1">
      {/* Header */}
      <div className="flex items-center mb-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/devices")}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
      </div>

      {/* Device Information Card - Fixed at top */}
      {device && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Device Name
                  </h4>
                  <p className="text-lg">{device.device_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Device ID
                  </h4>
                  <p className="text-sm font-mono">{device.device_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Android ID
                  </h4>
                  <p className="text-sm font-mono">{device.android_id}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Status
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Registration Status
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.registration_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : device.registration_status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {device.registration_status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Device Group
                  </h4>
                  <p className="text-lg">{device.DeviceGroup.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Code: {device.DeviceGroup.reg_code}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Location
                  </h4>
                  <p className="text-sm">{device.location}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Last Synced
                  </h4>
                  <p className="text-sm">
                    {new Date(device.last_synced).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Created At
                  </h4>
                  <p className="text-sm">
                    {new Date(device.created_at).toLocaleString()}
                  </p>
                </div>
                {device.tags && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Tags
                    </h4>
                    <p className="text-sm">{device.tags}</p>
                  </div>
                )}
                {device.pairing_code && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Pairing Code
                    </h4>
                    <p className="text-sm font-mono">{device.pairing_code}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="proof-of-play">Proof of Play</TabsTrigger>
          <TabsTrigger value="device-events">Event Logs</TabsTrigger>
          <TabsTrigger value="terminology">Telemetry</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Device Schedules</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={schedulesLimit.toString()}
                  onValueChange={(value) => {
                    setSchedulesLimit(Number(value));
                    setSchedulesPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schedule ID</TableHead>
                        <TableHead>Ad Name</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => (
                        <TableRow key={schedule.schedule_id}>
                          <TableCell className="font-mono text-sm">
                            {schedule.schedule_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {schedule.Ad.name}
                          </TableCell>
                          <TableCell>
                            {new Date(schedule.start_time).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(schedule.end_time).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {Math.round(
                              (new Date(schedule.end_time).getTime() -
                                new Date(schedule.start_time).getTime()) /
                                (1000 * 60)
                            )}{" "}
                            min
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(schedulesPage - 1) * schedulesLimit + 1} to{" "}
                      {Math.min(schedulesPage * schedulesLimit, schedulesTotal)}{" "}
                      of {schedulesTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchedulesPage(schedulesPage - 1)}
                        disabled={schedulesPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {schedulesPage} of {schedulesTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchedulesPage(schedulesPage + 1)}
                        disabled={schedulesPage >= schedulesTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No schedules found for this device
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof-of-play" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Proof of Play Log</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={proofOfPlayLimit.toString()}
                  onValueChange={(value) => {
                    setProofOfPlayLimit(Number(value));
                    setProofOfPlayPage(1); // Reset to first page when changing limit
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </CardHeader>
            <CardContent>
              {proofOfPlayLogs.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad ID</TableHead>
                        <TableHead>Event ID</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Schedule ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proofOfPlayLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.ad_id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.event_id}
                          </TableCell>
                          <TableCell>
                            {(log.duration_played_ms / 1000).toFixed(1)}s
                          </TableCell>
                          <TableCell>
                            {new Date(log.start_time).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(log.end_time).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.schedule_id || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(proofOfPlayPage - 1) * proofOfPlayLimit + 1} to{" "}
                      {Math.min(
                        proofOfPlayPage * proofOfPlayLimit,
                        proofOfPlayTotal
                      )}{" "}
                      of {proofOfPlayTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProofOfPlayPage(proofOfPlayPage - 1)}
                        disabled={proofOfPlayPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {proofOfPlayPage} of {proofOfPlayTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProofOfPlayPage(proofOfPlayPage + 1)}
                        disabled={proofOfPlayPage >= proofOfPlayTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No proof of play logs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device-events" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Device Event Log</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={eventLogsLimit.toString()}
                  onValueChange={(value) => {
                    setEventLogsLimit(Number(value));
                    setEventLogsPage(1); // Reset to first page when changing limit
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </CardHeader>
            <CardContent>
              {deviceEventLogs.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Event ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deviceEventLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.event_type}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.event_id}
                          </TableCell>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                                {(() => {
                                  try {
                                    // If payload is already an object, stringify it
                                    if (typeof log.payload === "object") {
                                      return JSON.stringify(
                                        log.payload,
                                        null,
                                        2
                                      );
                                    }
                                    // If payload is a string, try to parse and format it
                                    return JSON.stringify(
                                      JSON.parse(log.payload),
                                      null,
                                      2
                                    );
                                  } catch {
                                    // If all else fails, convert to string
                                    return typeof log.payload === "string"
                                      ? log.payload
                                      : JSON.stringify(log.payload);
                                  }
                                })()}
                              </pre>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(eventLogsPage - 1) * eventLogsLimit + 1} to{" "}
                      {Math.min(eventLogsPage * eventLogsLimit, eventLogsTotal)}{" "}
                      of {eventLogsTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventLogsPage(eventLogsPage - 1)}
                        disabled={eventLogsPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {eventLogsPage} of {eventLogsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventLogsPage(eventLogsPage + 1)}
                        disabled={eventLogsPage >= eventLogsTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No device event logs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminology" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Device Telemetry</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={terminologyLimit.toString()}
                  onValueChange={(value) => {
                    setTerminologyLimit(Number(value));
                    setTerminologyPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </CardHeader>
            <CardContent>
              {deviceTelemetry.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>CPU Usage (%)</TableHead>
                        <TableHead>RAM Free (MB)</TableHead>
                        <TableHead>Storage Free (MB)</TableHead>
                        <TableHead>Network Type</TableHead>
                        <TableHead>App Version</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deviceTelemetry.map((telemetry) => (
                        <TableRow key={telemetry.id}>
                          <TableCell className="font-medium">
                            {new Date(telemetry.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(telemetry.cpu_usage * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>{telemetry.ram_free_mb}</TableCell>
                          <TableCell>
                            {telemetry.storage_free_mb || "N/A"}
                          </TableCell>
                          <TableCell>
                            {telemetry.network_type || "N/A"}
                          </TableCell>
                          <TableCell>
                            {telemetry.app_version_code || "N/A"}
                          </TableCell>
                          <TableCell>
                            {new Date(telemetry.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(terminologyPage - 1) * terminologyLimit + 1} to{" "}
                      {Math.min(
                        terminologyPage * terminologyLimit,
                        terminologyTotal
                      )}{" "}
                      of {terminologyTotal} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTerminologyPage(terminologyPage - 1)}
                        disabled={terminologyPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {terminologyPage} of {terminologyTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTerminologyPage(terminologyPage + 1)}
                        disabled={terminologyPage >= terminologyTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No device telemetry found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DevicePage;
