// types/dashboard.ts (example path)

import type { DateRange } from "react-day-picker";

export interface ApiPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdPerformanceRecord {
  adId: string;
  name: string;
  duration: number;
  impressions: number;
  groupsScheduled: number; // Matches API response field
}

export interface GroupPerformanceRecord {
  groupId: string;
  name: string;
  deviceCount: number; // Matches API response field
  impressions: number;
  lastPushed: string | null; // ISO Date string or null
}

export interface AdTableApiResponse {
  data: AdPerformanceRecord[];
  pagination: ApiPagination;
}

export interface GroupTableApiResponse {
  data: GroupPerformanceRecord[];
  pagination: ApiPagination;
}

// Prop type for the component
export interface PerformanceTablesCardProps {
    dateRange: DateRange | undefined; // From react-day-picker
}