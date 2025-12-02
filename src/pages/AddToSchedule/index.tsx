import React, { useEffect, useState, useCallback } from "react";

// ✅ UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

// ✅ Styles
// import "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// ✅ Data Table & Columns
import { DataTable } from "@/components/data-table";
import { adcolumns, Ad } from "./components/ad-columns";
import {
  devicecolumns,
  DeviceGroup,
  DevicesGroupsResponse,
} from "./components/device-columns";

// ✅ API & Types
import api from "@/api";
import { Device, DevicesResponse } from "../Devices/columns";
// import DateRangePicker from 'react-date-range';
// import { DateRangePicker } from "@/components/ui/date-range-picker";
// import { DateRangePicker } from 'react-date-range';
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function AddToSchedule() {
  const [dateRange, setDateRange] = useState<Value>([new Date(), new Date()]);
  const [devicesData, setDevicesData] = useState<DeviceGroup[]>([]);
  const [adsData, setAdsData] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [plays, setPlays] = useState("360");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isSingleDay, setIsSingleDay] = useState(true);
  const totalDays = isSingleDay
    ? 1
    : startDate && endDate
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const handleScheduleAd = async () => {
    setLoading(true);
    try {
      if (startDate && endDate && selectedAd && selectedDevices) {
        // You can proceed with the scheduling logic here
        const data = {
          ad_id: selectedAd?.ad_id,
          groups: selectedDevices.map((group) => group.group_id),
          start_time: startDate,
          end_time: endDate,
          total_duration: plays,
          priority: 1,
        };
        console.log(data);
        await api.post("/schedule/add", data);
        navigate("/schedule");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // const totalDays =
  //   startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0; // Include start date

  // ✅ Fetch Ads Data
  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        const response = await api.get<DevicesResponse>("/ads/all");
        setAdsData(response.ads);
        console.log("-----", response.ads);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    const fetchDevicesData = async () => {
      try {
        const response = await api.get<DevicesGroupsResponse>(
          "/device/fetch-groups"
        );
        setDevicesData(response.groups);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchAdsData();
    fetchDevicesData();

    console.log(adsData);
  }, []);
  useEffect(() => {
    console.log(adsData);
  }, [adsData]);

  // ✅ Stable event handlers
  const handleSelectedAd = useCallback((rows: Ad[]) => {
    setSelectedAd(rows[0] || null);
  }, []);

  const handleSelectedDevices = useCallback((rows: Device[]) => {
    setSelectedDevices(rows);
  }, []);

  const MyDateRangePicker = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isSingleDay,
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={startDate ? startDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setStartDate(date);
              if (isSingleDay) setEndDate(date); // If single-day mode, endDate = startDate
            }}
            className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
          />
        </div>

        {!isSingleDay && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate ? endDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setEndDate(e.target.value ? new Date(e.target.value) : null)
              }
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
        Ad Scheduling
      </h1>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 w-full">
        {/* ✅ Select Ad */}
        <Card className="w-full min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Select Ad</CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <div className="relative">
              {/* Mobile scroll hint */}
              <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
                Scroll →
              </div>
              <DataTable
                data={adsData}
                columns={adcolumns}
                filters={[{ label: "Ad Name", value: "name" }]}
                onRowSelectionChange={handleSelectedAd}
                maxHeight="40vh"
                getRowCanSelect={(row) => {
                  const ad = row as Ad;
                  return ad.status !== "pending" && ad.status !== "processing";
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ✅ Select Device */}
        <Card className="w-full min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Select Group</CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <div className="relative">
              {/* Mobile scroll hint */}
              <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
                Scroll →
              </div>
              <DataTable
                data={devicesData}
                columns={devicecolumns}
                filters={[{ label: "Name", value: "name" }]}
                onRowSelectionChange={handleSelectedDevices}
                maxHeight="40vh"
              />
            </div>
          </CardContent>
        </Card>
        {/* </div> */}

        {/* ✅ Date Range Picker */}
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-4">
            <CardTitle className="text-base md:text-lg">
              Schedule Configuration
            </CardTitle>

            {/* Mobile: Stacked Layout, Desktop: Horizontal Layout */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              {/* Date Selection Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Select Date</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isSingleDay}
                        onChange={(e) => {
                          setIsSingleDay(e.target.checked);
                          if (e.target.checked && startDate)
                            setEndDate(startDate);
                        }}
                        className="rounded"
                      />
                      <span>Single Day</span>
                    </label>
                  </div>
                </div>

                <MyDateRangePicker
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  isSingleDay={isSingleDay}
                />
              </div>

              {/* Plays Selection Section */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  No. of Plays per Day
                </span>
                <Select onValueChange={setPlays} defaultValue="360">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="No. of Plays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plays</SelectLabel>
                      <SelectItem value="360">360</SelectItem>
                      <SelectItem value="720">720</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Button */}
              <div className="flex justify-end lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleScheduleAd}
                  disabled={
                    selectedDevices.length < 1 ||
                    !selectedAd ||
                    !startDate ||
                    !endDate
                  }
                  className="w-full sm:w-auto"
                >
                  Schedule Ad
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Schedule Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedAd?.name ? (
                  <span>
                    <span className="font-semibold text-foreground">
                      {selectedAd.name}
                    </span>{" "}
                    will be scheduled for{" "}
                    <span className="font-semibold text-foreground">
                      {plays}
                    </span>{" "}
                    plays per day on{" "}
                    <span className="font-semibold text-foreground">
                      {selectedDevices.length}
                    </span>{" "}
                    group{selectedDevices.length !== 1 ? "s" : ""} for{" "}
                    <span className="font-semibold text-foreground">
                      {totalDays}
                    </span>{" "}
                    {totalDays === 1 ? "day" : "days"}.
                  </span>
                ) : (
                  "Please select an ad, device group(s), and date range to see the schedule summary."
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddToSchedule;
