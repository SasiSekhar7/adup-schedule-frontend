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
  };
  onFiltersChange: (filters: {
    status: string;
    registrationStatus: string;
    deviceType: string;
  }) => void;
}

export default function DeviceListFilters({
  filters,
  onFiltersChange,
}: DeviceListFiltersProps) {
  const hasActiveFilters =
    filters.status || filters.registrationStatus || filters.deviceType;

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
    });
  };

  const statusOptions = ["active", "inactive"];
  const registrationStatusOptions = ["pending", "registered", "failed"];
  const deviceTypeOptions = ["tv", "tablet", "phone", "other"];

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
          {statusOptions.map((option) => (
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
          {registrationStatusOptions.map((option) => (
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
          {deviceTypeOptions.map((option) => (
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
