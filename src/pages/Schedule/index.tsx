
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/pages/Dashboard/components/DateRangePicker"; // Adjust path as needed



function Schedule() {
  const [data, setData] = useState<Device[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Defaults to today
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10); // Use state for limit
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date(),
  });

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<DevicesResponse>("/schedule/all", {
        params: {
          page,
          limit,
          from: dateRange?.from?.toISOString().split("T")[0],
          to: dateRange?.to?.toISOString().split("T")[0],
        },
      });
      setData(response.schedules);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };
  if (dateRange?.from && dateRange?.to) {
    fetchData();
  }
}, [page, limit, dateRange]);


  const handleDateChange = (event) => {
    setDate(event.target.value);
    setPage(1); // Reset to first page when date changes
  };
  const filters =  [{label:"Ad Name", value:"ad_name" }, {label:"Group Name", value:"group_name"}];
  

  const handlePaginationChange = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
        <div className="">
          <p className="text-md font-semibold">Schedules</p>
          <p className="text-sm text-muted-foreground">List of all Ads and Devices</p>
        </div>
        <div className=" ml-auto">
    <DateRangePicker date={dateRange} setDate={setDateRange} />

      </div>

      </div>

      {/* Date Picker */}
      
      {/* Data Table */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        filters={filters}
        pagination={{
          total,
          page,
          limit,
          onPageChange: setPage,
        }}
        onPaginationChange={handlePaginationChange} // ✅ Pass the new callback

      />
    </div>
  );
}

export default Schedule;
