"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Users, Calendar, Box, Rocket } from "lucide-react"; // Import icons
import api from "@/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Activity className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500">Failed to load data</div>;
  }

  return (
    <div>
      <div className="">
      <p className="text-md font-semibold ">
        Dashboard
        </p>
        <p className="text-sm text-muted-foreground">
         Stats of all components of Adup System
        </p>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        
      <StatsCard title="Total Devices" value={data.devices} />
      <StatsCard title="Device Groups" value={data.deviceGroups} />
      <StatsCard title="Total Ads" value={data.ads} />
      <StatsCard title="Total Clients" value={data.clients} />
      <StatsCard title="Total Schedules" value={data.schedules} />
    </div>
    </div>

  );
};

// Helper function to get a random icon
const getRandomIcon = () => {
  const icons = [<Rocket className="h-4 w-4 text-muted-foreground" />, 
                 <Users className="h-4 w-4 text-muted-foreground" />,
                 <Calendar className="h-4 w-4 text-muted-foreground" />,
                 <Box className="h-4 w-4 text-muted-foreground" />];
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
};

const StatsCard = ({ title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {getRandomIcon()} {/* Display random icon */}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <p className="text-xs text-muted-foreground">Updated just now</p>
    </CardContent>
  </Card>
);

export default Dashboard;
