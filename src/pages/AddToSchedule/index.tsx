import React, { useEffect, useState, useCallback } from "react";

// ✅ UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";

// ✅ Styles
import "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
// ✅ Data Table & Columns
import { DataTable } from "@/components/data-table";
import { adcolumns } from "./components/ad-columns";
import { devicecolumns, DeviceGroup, DevicesGroupsResponse } from "./components/device-columns";

// ✅ API & Types
import api from "@/api";
import { Device, DevicesResponse } from "../Devices/columns";
import { Ad } from "../Ads/columns";
// import DateRangePicker from 'react-date-range';
// import { DateRangePicker } from "@/components/ui/date-range-picker";
// import { DateRangePicker } from 'react-date-range';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import { differenceInDays } from "date-fns";
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
  const handleScheduleAd = async () => {
    setLoading(true)
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
        navigate('/schedule')
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }

  };

  const totalDays =
    startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0; // Include start date

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
        const response = await api.get<DevicesGroupsResponse>("/device/fetch-groups");
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

  return (
    <div > 
      <h1 className="text-md font-semibold mb-4 ">Ad Scheduling</h1>

      <div className="grid gap-6 md:grid-cols-2 max-h-[100vh]">
        {/* ✅ Select Ad */}
      {/* <div className="col-span-2 grid grid-cols-2 gap-6 h-[60vh]"> */}

        <Card>
          {/* <CardHeader>
            <CardTitle className="text-md p-0">Select Ad</CardTitle>
          </CardHeader> */}
      <h1 className="text-md font-semibold p-4">Select Ad</h1>

          <CardContent className="max-h-[70vh]">
            {/* <div className="h-[50vh]"> */}

            <DataTable
              data={adsData}
              columns={adcolumns}
              filters={[{ label: "Ad Name", value: "name" }]}
              onRowSelectionChange={handleSelectedAd}
              maxHeight="40vh"
            />
            {/* </div> */}

          </CardContent>
        </Card>

        {/* ✅ Select Device */}
        <Card>
        <h1 className="text-md font-semibold p-4">Select Group</h1>

          <CardContent className="max-h-[70vh]">
          {/* <div className="h-[30vh]"> */}

            <DataTable
              data={devicesData}
              columns={devicecolumns}
              filters={[{ label: "Name", value: "name" }]}
              onRowSelectionChange={handleSelectedDevices}
            maxHeight="40vh"/>
            {/* </div> */}
          </CardContent>
        </Card>
        {/* </div> */}

        {/* ✅ Date Range Picker */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center w-full ">
            <CardTitle className="text-md mx-4">Select Date Range</CardTitle>
            {/* <DateTimeRangePicker onChange={setDateRange} value={dateRange}   /> */}
            <DatePicker
              selected={startDate}
              onChange={(dates: [Date, Date]) => {
                setStartDate(dates[0]);
                setEndDate(dates[1]);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              // isClearable
              placeholderText="Select a date range"
              dateFormat="MM/dd/yyyy"
              className="border rounded-md px-4 py-2"
            />

            <CardTitle className="text-md mx-4">
              Select No. of plays per day
            </CardTitle>
            {/* <DateTimeRangePicker onChange={setDateRange} value={dateRange}   /> */}
            <Select onValueChange={setPlays}>
              <SelectTrigger className="w-[180px]">
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

            <div className="ml-auto space-x-4">
              <Button
                size="lg"
                onClick={handleScheduleAd}
                disabled={
                  selectedDevices.length < 1 ||
                  !selectedAd ||
                  !startDate ||
                  !endDate
                }
              >
                Schedule Ad
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex">
            <p className="text-sm text-muted-foreground flex flex-row">
              {selectedAd?.name ? (
                <div>
                  <span className="font-extrabold">{selectedAd.name} </span>will
                  be scheduled for{" "}
                  <span className="font-extrabold">{plays}</span> plays per day
                  on the{" "}
                  <span className="font-extrabold">
                    {selectedDevices.length}{" "}
                  </span>
                  groups(s) selected for{" "}
                  <span className="font-extrabold">{totalDays} </span>days.
                </div>
              ) : (
                "No Ad Selected."
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddToSchedule;
