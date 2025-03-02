"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  QrCode,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import api from "@/api";

interface User {
  name: string,
  email: string
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation(); // ✅ Move inside the component
  const [user, setUser] = React.useState<User>()
  React.useEffect(()=>{fetchData()},[])

  const fetchData = async () => {
    try {
      const response = await api.get('/user/data')
      setUser(response.user)
    } catch (error) {
      console.log(error)
    }
  }
  const data = {
    user: {
      name: user?.name,
      email: user?.email,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "AdUp Console", logo:"/logo.png", plan: "Enterprise" },

    ],
    navMain: [
      {
        title: "Devices",
        url: "/devices",
        icon: SquareTerminal,
        isActive: location.pathname.startsWith("/devices"), // ✅ Dynamic active state
        items: [
          { title: "All", url: "/devices" },
          { title: "Device Groups", url: "/devices/groups" },
        ],
      },
      {
        title: "Ads",
        url: "/ads",
        icon: Bot,
        isActive: location.pathname.startsWith("/ads"), // ✅ Dynamic active state
        items: [
          { title: "All", url: "/ads" },
          { title: "Clients", url: "/ads/clients" },
        ],
      },
      {
        title: "Schedule",
        url: "/schedule",
        icon: BookOpen,
        isActive: location.pathname.startsWith("/schedule"),
        items: [
          { title: "All", url: "/schedule" },
          { title: "Add", url: "/schedule/add" },
          { title: "Calendar", url: "/schedule/calendar" },
          { title: "Placeholder", url: "/schedule/placeholder" },
        ],
      },
      {
        title: "QR Campaign",
        url: "/campaigns",
        icon: QrCode,
        isActive: location.pathname.startsWith("/campaigns"), // ✅ Dynamic active state
        items: [
          { title: "All", url: "/campaigns" },
          { title: "Interactions", url: "/campaigns/interactions" },
          { title: "New", url: "/campaigns/new" },
        ],
      },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: Frame },
      { name: "Sales & Marketing", url: "#", icon: PieChart },
      { name: "Travel", url: "#", icon: Map },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}