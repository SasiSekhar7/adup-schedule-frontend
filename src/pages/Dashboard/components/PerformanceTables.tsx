// components/PerformanceTablesCard.tsx
"use client"; // If using Next.js App Router

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For errors
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Import types
import type {
    PerformanceTablesCardProps,
    AdPerformanceRecord,
    GroupPerformanceRecord,
    ApiPagination,
    AdTableApiResponse,
    GroupTableApiResponse
} from "../types"; // Adjust path
import { AlertTriangleIcon } from "lucide-react";
import api from "@/api";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/dashboard`; // Your API base path

// --- Helper function to format dates for API query ---
function formatDateForApi(date: Date | undefined): string | undefined {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

export function PerformanceTablesCard({ dateRange }: PerformanceTablesCardProps) {
  const [activeTab, setActiveTab] = useState<"ads" | "groups">("ads");

  // State for Ads Table
  const [adData, setAdData] = useState<AdPerformanceRecord[]>([]);
  const [adPagination, setAdPagination] = useState<ApiPagination | null>(null);
  const [adCurrentPage, setAdCurrentPage] = useState(1);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  // State for Groups Table
  const [groupData, setGroupData] = useState<GroupPerformanceRecord[]>([]);
  const [groupPagination, setGroupPagination] = useState<ApiPagination | null>(null);
  const [groupCurrentPage, setGroupCurrentPage] = useState(1);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // TODO: Add state for pageSize, sortBy, sortOrder, search if needed

  const pageSize = 10; // Or make this configurable

  // Memoized fetch function to avoid redefining on every render
  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      // Don't fetch if date range is incomplete
      setAdError("Please select a valid date range.");
      setGroupError("Please select a valid date range.");
      return;
    }

    const startDate = formatDateForApi(dateRange.from);
    const endDate = formatDateForApi(dateRange.to);

    const headers = { // Add your auth headers if needed
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${your_auth_token}`
    };

    if (activeTab === "ads") {
      setAdLoading(true);
      setAdError(null);
      try {
        const params = new URLSearchParams({
          startDate: startDate!,
          endDate: endDate!,
          page: adCurrentPage.toString(),
          pageSize: pageSize.toString(),
          // Add sortBy, sortOrder, search params here if implemented
        });
        const response: AdTableApiResponse  = await api.get(`${API_BASE_URL}/ads/table?${params.toString()}`, { headers });
        setAdData(response.data);
        setAdPagination(response.pagination);
      } catch (error: any) {
        console.error("Error fetching ad performance:", error);
        setAdError(error.message || "An unknown error occurred");
        setAdData([]); // Clear data on error
        setAdPagination(null);
      } finally {
        setAdLoading(false);
      }
    } else { // activeTab === 'groups'
      setGroupLoading(true);
      setGroupError(null);
      try {
         const params = new URLSearchParams({
          startDate: startDate!,
          endDate: endDate!,
          page: groupCurrentPage.toString(),
          pageSize: pageSize.toString(),
          // Add sortBy, sortOrder, search params here if implemented
        });
        const response: GroupTableApiResponse = await api.get(`${API_BASE_URL}/groups/table?${params.toString()}`, { headers });

        setGroupData(response.data);
        setGroupPagination(response.pagination);
      } catch (error: any) {
        console.error("Error fetching group performance:", error);
        setGroupError(error.message || "An unknown error occurred");
        setGroupData([]); // Clear data on error
        setGroupPagination(null);
      } finally {
        setGroupLoading(false);
      }
    }
  }, [activeTab, dateRange, adCurrentPage, groupCurrentPage, pageSize]); // Add other dependencies like sort/search state here

  // useEffect to trigger fetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized, so this runs when its dependencies change

  // Reset page number when switching tabs
  useEffect(() => {
    setAdCurrentPage(1);
    setGroupCurrentPage(1);
  }, [activeTab, dateRange]); // Also reset on date change

  // --- Loading Skeleton ---
  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
        </TableRow>
    ))
  );

  // --- Error Alert ---
  const renderError = (errorMsg: string | null) => {
      if (!errorMsg) return null;
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )
  };

  // --- Pagination Controls ---
 const renderPagination = (
    pagination: ApiPagination | null,
    currentPage: number,
    setPage: (page: number) => void,
    isLoading: boolean
 ) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    );
 }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "ads" | "groups")} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="ads">Ad Performance</TabsTrigger>
            <TabsTrigger value="groups">Group Performance</TabsTrigger>
          </TabsList>

          {/* Ads Tab */}
          <TabsContent value="ads">
            {renderError(adError)}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Name</TableHead>
                    <TableHead className="w-[150px]">Duration (s)</TableHead>
                    <TableHead className="w-[150px] text-right">Total Impressions</TableHead>
                    <TableHead className="w-[150px] text-right"># Groups Scheduled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adLoading ? renderSkeleton() : (
                    adData.length > 0 ? (
                        adData.map((ad) => (
                        <TableRow key={ad.adId}> {/* Use adId for key */}
                            <TableCell className="font-medium">{ad.name}</TableCell>
                            <TableCell>{ad.duration}</TableCell>
                            <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{ad.groupsScheduled}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {adError ? " " : "No ad data available for the selected period."}
                            </TableCell>
                        </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
             {renderPagination(adPagination, adCurrentPage, setAdCurrentPage, adLoading)}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            {renderError(groupError)}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead className="w-[150px] text-right"># Devices</TableHead>
                    <TableHead className="w-[150px] text-right">Total Impressions</TableHead>
                    <TableHead className="w-[150px]">Last Pushed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupLoading ? renderSkeleton() : (
                    groupData.length > 0 ? (
                        groupData.map((group) => (
                        <TableRow key={group.groupId}> {/* Use groupId for key */}
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell className="text-right">{group.deviceCount}</TableCell>
                            <TableCell className="text-right">{group.impressions.toLocaleString()}</TableCell>
                            <TableCell>
                            {group.lastPushed ? format(new Date(group.lastPushed), "PP") : 'N/A'} {/* Format Date */}
                            </TableCell>
                        </TableRow>
                        ))
                     ) : (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {groupError ? " " : "No group data available for the selected period."}
                            </TableCell>
                        </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
             {renderPagination(groupPagination, groupCurrentPage, setGroupCurrentPage, groupLoading)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}