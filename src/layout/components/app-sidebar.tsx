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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation(); // ✅ Move inside the component

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "AdUp Console", logo:"https://demokrito.com/wp-content/uploads/2024/12/DWORD-WHITE-300x96.png", plan: "Enterprise" },
      
      { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
      { name: "Evil Corp.", logo: Command, plan: "Free" },
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
          { title: "Schuedule Ad", url: "/schedule/add" },
          { title: "Statistics", url: "#" },
          { title: "Changelog", url: "#" },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        isActive: location.pathname.startsWith("/settings"), // ✅ Dynamic active state
        items: [
          { title: "General", url: "/settings/general" },
          { title: "Team", url: "/settings/team" },
          { title: "Billing", url: "/settings/billing" },
          { title: "Limits", url: "/settings/limits" },
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