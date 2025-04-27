"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Users, Calendar, Box, Rocket } from "lucide-react"; 
import api from "@/api";
import { getRole } from "@/helpers";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

const [role]= useState(getRole()); // Replace with actual role fetching logic

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        console.log("Dashboard API response:", res.data);
        setData(res.data); 
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
    <div className="p-6">
      <div className="mb-6">
        <p className="text-2xl font-semibold mb-1">Dashboard</p>
        <p className="text-sm text-muted-foreground">
          Stats of all components of Adup System
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Total Devices" value={data.devices} />
        <StatsCard title="Device Groups" value={data.deviceGroups} />
        <StatsCard title="Total Ads" value={data.ads} />
        {/* Only show Total Clients if user is Admin */}
        {role==="Admin" && <StatsCard title="Total Clients" value={data.clients} />}
        <StatsCard title="Total Schedules" value={data.schedules} />
      </div>
    </div>
  );
};

const getRandomIcon = () => {
  const icons = [
    <Rocket key="rocket" className="h-4 w-4 text-muted-foreground" />, 
    <Users key="users" className="h-4 w-4 text-muted-foreground" />,
    <Calendar key="calendar" className="h-4 w-4 text-muted-foreground" />,
    <Box key="box" className="h-4 w-4 text-muted-foreground" />
  ];
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
};

const StatsCard = ({ title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {getRandomIcon()}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value ? value.toLocaleString() : "0"}</div>
      <p className="text-xs text-muted-foreground">Updated just now</p>
    </CardContent>
  </Card>
);

export default Dashboard;
