import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Ad, AdsResponse, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";

import AddAdComponent from "./components/AddAds";
import { useNavigate } from "react-router-dom";
import { useFeature } from "@/context/hooks/useFeature";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

function Ads() {
  const [data, setData] = useState<Ad[]>([]);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const navigate = useNavigate();
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState("today");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  // const [selectedAdIds, setSelectedAdIds] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchDta = async () => {
    try {
      setLoading(true);

      const response = await api.get<AdsResponse>("/ads/all");
      setData((response as any).ads);
      console.log(typeof (response as any).ads);
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDta();
  }, []);

  function onIsOpenChange() {
    fetchDta();
  }

  // Mobile search filter logic
  const filteredMobileData = data.filter((ad) => {
    if (!mobileSearchQuery) return true; // If search is empty, show all

    const query = mobileSearchQuery.toLowerCase();
    return (
      ad.name?.toLowerCase().includes(query) ||
      ad.ad_id?.toLowerCase().includes(query) ||
      ad.client_name?.toLowerCase().includes(query)
    );
  });

  // Handle export functionality
  // const handleExport = async () => {
  //   try {
  //     setIsExporting(true);

  //     let url = `/ads/proof-of-play/export`;
  //     const params = new URLSearchParams();

  //     // Add ad_id parameter
  //     // params.append("ad_id", selectedAdIds);
  //     params.append("ad_id", selectedAdId ?? "all");

  //     // Handle different filter types
  //     if (
  //       exportFilter === "today" ||
  //       exportFilter === "yesterday" ||
  //       exportFilter === "week" ||
  //       exportFilter === "month" ||
  //       exportFilter === "year" ||
  //       exportFilter === "all"
  //     ) {
  //       params.append("filter", exportFilter);
  //     } else if (exportFilter === "date_range") {
  //       if (exportStartDate) params.append("start_date", exportStartDate);
  //       if (exportEndDate) params.append("end_date", exportEndDate);
  //     }

  //     if (params.toString()) {
  //       url += `?${params.toString()}`;
  //     }

  //     const response = await api.get(url, {
  //       responseType: "blob",
  //     });

  //     const blob = new Blob([response as any], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;

  //     // Generate filename based on filter and ad selection
  //     let filename = "ads-proof-of-play";
  //     if (exportFilter === "today") filename += "-today";
  //     else if (exportFilter === "yesterday") filename += "-yesterday";
  //     else if (exportFilter === "week") filename += "-week";
  //     else if (exportFilter === "month") filename += "-month";
  //     else if (exportFilter === "year") filename += "-year";
  //     else if (exportFilter === "all") filename += "-all";
  //     else if (exportFilter === "date_range")
  //       filename += `-${exportStartDate}-to-${exportEndDate}`;

  //     // if (selectedAdIds === "all") {
  //     //   filename += "-all-ads";
  //     // } else if (selectedAdIds.includes(",")) {
  //     //   filename += "-multiple-ads";
  //     // } else {
  //     //   filename += `-${selectedAdIds}`;
  //     // }

  //     if (!selectedAdId) {
  //       filename += "-all-ads";
  //     } else {
  //       filename += `-${selectedAdId}`;
  //     }

  //     const currentDate = new Date().toISOString().split("T")[0];
  //     filename += `-${currentDate}.xlsx`;

  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);

  //     setExportDialogOpen(false);

  //     // Reset form
  //     setExportFilter("today");
  //     setExportStartDate("");
  //     setExportEndDate("");
  //     // setSelectedAdIds("all");
  //     setSelectedAdId(null);

  //     toast.success("Ads proof of play exported successfully!");
  //     console.log("✅ Ads proof of play exported successfully");
  //   } catch (error: any) {
  //     console.error("Ads proof of play export failed:", error);

  //     // Handle specific error messages
  //     let errorMessage = "Ads proof of play export failed. Please try again.";

  //     if (error?.response?.data?.message) {
  //       const apiMessage = error.response.data.message;
  //       if (
  //         apiMessage === "No proof of play logs found for the specified ads"
  //       ) {
  //         errorMessage =
  //           "No proof of play data found for the selected ads and time period. Please try a different date range or ad selection.";
  //       } else {
  //         errorMessage = apiMessage;
  //       }
  //     } else if (error?.message) {
  //       errorMessage = error.message;
  //     }

  //     toast.error(errorMessage);
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // ---------- Calculate dates ----------
      let startDate = "";
      let endDate = "";

      const today = new Date();

      if (exportFilter === "today") {
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (exportFilter === "yesterday") {
        const d = new Date();
        d.setDate(today.getDate() - 1);
        startDate = d.toISOString().split("T")[0];
        endDate = startDate;
      }

      if (exportFilter === "week") {
        const start = new Date();
        start.setDate(today.getDate() - 7);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "month") {
        const start = new Date();
        start.setMonth(today.getMonth() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "year") {
        const start = new Date();
        start.setFullYear(today.getFullYear() - 1);

        startDate = start.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "all") {
        startDate = "2025-03-01";
        endDate = today.toISOString().split("T")[0];
      }

      if (exportFilter === "date_range") {
        startDate = exportStartDate;
        endDate = exportEndDate;
      }

      // ---------- Create Export Job ----------
      const payload = {
        job_type: "PROOF_OF_PLAY",
        ad_id: selectedAdId ?? null,
        start_date: startDate,
        end_date: endDate,
      };

      // NEW API
      const response = await api.post("/exports", payload);

      /*
    // OLD API (commented)
    const response = await api.get(url, {
      responseType: "blob",
    });
    */

      toast.success("Export job created successfully!");

      setExportDialogOpen(false);

      // Reset form
      setExportFilter("today");
      setExportStartDate("");
      setExportEndDate("");
      setSelectedAdId(null);
      navigate("/all-exports");
    } catch (error: any) {
      console.error("Export job creation failed:", error);

      let errorMessage = "Export job failed. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const { has, limit, subscription } = useFeature();
  const hasFeaturesAccess = subscription?.Tier?.features_visible_to_client;
  const canExport = has("PROOF_OF_PLAY");

  // const maxAds = limit("MAX_ADS");
  // const currentAds = data.length;
  // const canAddAd = currentAds < maxAds;

  const storageLimit = limit("STORAGE_LIMIT");

  const usedStorage = Number(subscription?.Client?.used_storage_bytes || 0);

  const canAddAd =
    storageLimit === "unlimited" ? true : usedStorage < storageLimit;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const handleRowClick = (ad: Ad) => {
    navigate(`/ads/${ad.ad_id}`);
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  //         <p className="mt-2 text-muted-foreground">Loading Ads...</p>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="space-y-4 md:space-y-6 mx-auto md:mx-0 flex-1 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Ads</p>
          <p className="text-sm text-muted-foreground">
            List of all ads and files
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Export Button */}
          {hasFeaturesAccess && (
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              {canExport ? (
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      Export Proof of Play
                    </span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </DialogTrigger>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block">
                        <Button
                          variant="outline"
                          disabled
                          className="w-full sm:w-auto pointer-events-none"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">
                            Export Proof of Play
                          </span>
                          <span className="sm:hidden">Export</span>
                        </Button>
                      </span>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      Upgrade your plan to enable Proof of Play export.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base md:text-lg">
                    Export Ads Proof of Play Data
                  </DialogTitle>
                  <div className="text-sm text-muted-foreground mt-2">
                    Export proof of play data for selected ads
                  </div>
                </DialogHeader>
                <div className="space-y-4 md:space-y-6 py-4">
                  {/* <div className="space-y-2">
                  <Label htmlFor="adSelection">Ad Selection</Label>
                  <Select
                    value={selectedAdIds}
                    onValueChange={setSelectedAdIds}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ads to export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ads</SelectItem>
                      {data.map((ad) => (
                        <SelectItem key={ad.ad_id} value={ad.ad_id}>
                          {ad.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="adSelection">Ad Selection</Label>

                    <Select
                      value={selectedAdId ?? "all"}
                      onValueChange={(value) =>
                        setSelectedAdId(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad to export" />
                      </SelectTrigger>

                      <SelectContent>
                        {/* <SelectItem value="all">All Ads</SelectItem> */}

                        {data.map((ad) => (
                          <SelectItem key={ad.ad_id} value={ad.ad_id}>
                            {ad.name}
                            {/* {ad.ad_id} */}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exportFilter">Export Filter</Label>
                    <Select
                      value={exportFilter}
                      onValueChange={setExportFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today's Data</SelectItem>
                        <SelectItem value="yesterday">
                          Yesterday's Data
                        </SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="all">All Historical Data</SelectItem>
                        <SelectItem value="date_range">
                          Custom Date Range
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exportFilter === "date_range" && (
                    <div className="space-y-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium">
                        Date Range Selection
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exportStartDate">Start Date</Label>
                          <Input
                            id="exportStartDate"
                            type="date"
                            value={exportStartDate}
                            onChange={(e) => setExportStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exportEndDate">End Date</Label>
                          <Input
                            id="exportEndDate"
                            type="date"
                            value={exportEndDate}
                            onChange={(e) => setExportEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setExportDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleExport}
                    disabled={
                      isExporting ||
                      (exportFilter === "date_range" &&
                        (!exportStartDate || !exportEndDate))
                    }
                    className="w-full sm:w-auto"
                  >
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* <AddAdComponent onIsOpenChange={onIsOpenChange} /> */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block w-full sm:w-auto">
                  <div className={!canAddAd ? "cursor-not-allowed" : ""}>
                    <AddAdComponent
                      onIsOpenChange={onIsOpenChange}
                      disabled={!canAddAd}
                    />
                  </div>
                </div>
              </TooltipTrigger>

              {!canAddAd && (
                <TooltipContent>
                  {/* <p>
                    You have reached your plan limit ({maxAds} ads). Upgrade to
                    add more.
                  </p> */}
                  <p>
                    Storage limit reached ({formatBytes(usedStorage)} /{" "}
                    {storageLimit === "unlimited"
                      ? "Unlimited"
                      : formatBytes(storageLimit)}
                    ). Upgrade your plan.
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
            <p className="mt-2 text-muted-foreground">Loading Ads...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex-1">
              {selectedAdId && (
                <p className="text-sm text-muted-foreground mb-4">
                  Selected Ad ID: {selectedAdId}
                </p>
              )}

              {/* MOBILE VIEW: Card Layout (Visible only on screens smaller than 'md') */}
              <div className="flex flex-col gap-4 md:hidden mb-6">
                {/* Mobile Search Input */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-2 px-2">
                  <Input
                    placeholder="Search by name, ID, or client..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="w-full bg-background"
                  />
                </div>

                {filteredMobileData.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/20">
                    {data.length === 0
                      ? "No ads found."
                      : "No ads match your search."}
                  </div>
                ) : (
                  filteredMobileData.map((ad) => {
                    const url = ad.url?.toLowerCase() || "";
                    const isVideo =
                      url.includes(".mp4") ||
                      url.includes(".mov") ||
                      url.includes(".webm");
                    const isImage =
                      url.includes(".jpg") ||
                      url.includes(".jpeg") ||
                      url.includes(".png") ||
                      url.includes(".gif");
                    const adType = isVideo
                      ? "Video"
                      : isImage
                        ? "Image"
                        : "Unknown";

                    const statusColors: Record<string, string> = {
                      pending:
                        "bg-yellow-100 text-yellow-800 border-yellow-200",
                      processing: "bg-blue-100 text-blue-800 border-blue-200",
                      completed: "bg-green-100 text-green-800 border-green-200",
                      failed: "bg-red-100 text-red-800 border-red-200",
                    };
                    const badgeClass =
                      statusColors[ad.status] ||
                      "bg-gray-100 text-gray-800 border-gray-200";

                    return (
                      <Card
                        key={ad.ad_id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(ad)}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Header: Name, Type Badge, and Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-base break-words line-clamp-2 flex-1">
                              {ad.name}
                            </span>

                            <div className="flex items-center gap-1">
                              <span
                                className={`text-xs px-2.5 py-1 border rounded-full font-medium whitespace-nowrap ${
                                  adType === "Video"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : adType === "Image"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {adType}
                              </span>

                              {/* Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-[160px]"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/ads/${ad.ad_id}`);
                                    }}
                                  >
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/ads/${ad.ad_id}/edit`);
                                    }}
                                  >
                                    Edit / Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Body: ID, Client, Duration, Status */}
                          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Client:</span>
                              <span className="truncate ml-2 text-foreground">
                                {ad.client_name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Duration:</span>
                              <span>{ad.duration}s</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t mt-1">
                              <span className="font-medium">Status:</span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClass}`}
                              >
                                {ad.status}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* DESKTOP VIEW: Data Table (Hidden on small screens, visible on 'md' and up) */}
              <div className="hidden md:block">
                <DataTable
                  data={data}
                  columns={columns}
                  hideSelectionColumn={true}
                  onRowClick={handleRowClick}
                  filters={[
                    { label: "Ad Name", value: "name" },
                    { label: "ad_id", value: "ad_id" },
                    { label: "Type", value: "type" },
                  ]}
                  maxHeight="none"
                  onRowSelectionChange={(rows) => {
                    if (rows.length > 0) {
                      const ad = rows[0] as Ad;
                      setSelectedAdId(ad.ad_id);
                    } else {
                      setSelectedAdId(null);
                    }
                  }}
                  getRowCanSelect={(row) => {
                    const ad = row as Ad;
                    return (
                      ad.status !== "pending" && ad.status !== "processing"
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Ads;
