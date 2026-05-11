"use client";

import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface DeviceListFiltersProps {
  filters: {
    status: string;
    registrationStatus: string;
    deviceType: string;
    orientation: string;
    videoStreams: string;
  };
  onFiltersChange: (filters: {
    status: string;
    registrationStatus: string;
    deviceType: string;
    orientation: string;
    videoStreams: string;
  }) => void;
  devices: any[];
}

export default function DeviceListFilters({
  filters,
  onFiltersChange,
  devices,
}: DeviceListFiltersProps) {
  const hasActiveFilters =
    filters.status ||
    filters.registrationStatus ||
    filters.deviceType ||
    filters.orientation ||
    filters.videoStreams;

  const handleFilterChange = (key: string, value: string) => {
    const newValue =
      filters[key as keyof typeof filters] === value ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: newValue,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: "",
      registrationStatus: "",
      deviceType: "",
      orientation: "",
      videoStreams: "",
    });
  };

  const statusOptions = [
    ...new Set(devices?.map((device) => device.status).filter(Boolean)),
  ];

  const registrationStatusOptions = [
    ...new Set(
      devices?.map((device) => device.registration_status).filter(Boolean),
    ),
  ];
  const deviceTypeOptions = [
    ...new Set(devices?.map((device) => device.device_type).filter(Boolean)),
  ];
  const videoStreamOptions = [
    ...new Set(
      devices
        ?.map((device) => String(device.max_supported_video_streams))
        .filter(Boolean),
    ),
  ].sort((a, b) => Number(a) - Number(b));
  const orientationOptions = [
    ...new Set(
      devices?.map((device) => device.device_orientation).filter(Boolean),
    ),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={filters.status ? "default" : "outline"} size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Status {filters.status && `(${filters.status})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option: string) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filters.status === option}
              onCheckedChange={() => handleFilterChange("status", option)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    option === "active" ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                <span className="capitalize">{option}</span>
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Registration Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filters.registrationStatus ? "default" : "outline"}
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Registration{" "}
            {filters.registrationStatus && `(${filters.registrationStatus})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Registration</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {registrationStatusOptions.map((option: string) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filters.registrationStatus === option}
              onCheckedChange={() =>
                handleFilterChange("registrationStatus", option)
              }
            >
              <span className="capitalize">{option}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Device Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filters.deviceType ? "default" : "outline"}
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Type {filters.deviceType && `(${filters.deviceType})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Device Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {deviceTypeOptions.map((option: string) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filters.deviceType === option}
              onCheckedChange={() => handleFilterChange("deviceType", option)}
            >
              <span className="capitalize">{option}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Orientation Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filters.orientation ? "default" : "outline"}
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Orientation {filters.orientation && `(${filters.orientation})`}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Orientation</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {orientationOptions.map((option: string) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filters.orientation === option}
              onCheckedChange={() => handleFilterChange("orientation", option)}
            >
              <span className="capitalize">{option}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Video Streams Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filters.videoStreams ? "default" : "outline"}
            size="sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Streams {filters.videoStreams && `(${filters.videoStreams})`}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter by Streams</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {videoStreamOptions.map((option: string) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={filters.videoStreams === option}
              onCheckedChange={() => handleFilterChange("videoStreams", option)}
            >
              {option} Stream{option !== "1" ? "s" : ""}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-slate-600 hover:text-slate-900"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
