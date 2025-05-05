// components/DateRangePicker.tsx (Example file path)
"use client"; // If using Next.js App Router
import { useState } from "react"; // Needed for Popover open state if controlled
import { CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils"; // Your utility function
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the props interface
interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string; // Allow passing additional class names
}

// Define presets
const datePresets = [
    { label: "Today", range: { from: new Date(), to: new Date() } },
    { label: "Yesterday", range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) } },
    { label: "Last 7 Days", range: { from: subDays(new Date(), 6), to: new Date() } }, // includes today
    { label: "Last 14 Days", range: { from: subDays(new Date(), 13), to: new Date() } },
    { label: "Last 30 Days", range: { from: subDays(new Date(), 29), to: new Date() } },
    { label: "This Month", range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() } },
    // Add more presets if needed (e.g., Last Month, Last 90 Days)
];

export function DateRangePicker({
  date,
  setDate,
  className,
}: DateRangePickerProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    // --- Handler for Preset Selection ---
    const handlePresetSelect = (range: DateRange | undefined) => {
        setDate(range);
        // Optional: Close popover if it was open, although presets are in Dropdown here
        // setPopoverOpen(false);
    };

    // --- Determine Button Label ---
    // Find if the current date range matches a preset exactly
    const currentPreset = datePresets.find(preset =>
        preset.range.from?.toDateString() === date?.from?.toDateString() &&
        preset.range.to?.toDateString() === date?.to?.toDateString()
    );
    const buttonLabel = currentPreset?.label ?? "Custom Range"; // Default to Custom Range if no preset matches

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* --- Preset Dropdown --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex w-[150px] justify-start text-left">
            {/* Show selected preset or 'Select Preset' */}
            <span>{buttonLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
           <DropdownMenuLabel>Date Presets</DropdownMenuLabel>
           <DropdownMenuSeparator />
          {datePresets.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onSelect={() => handlePresetSelect(preset.range)} // Use onSelect for proper handling
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- Custom Range Popover with Calendar --- */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[240px] sm:w-[280px] justify-start text-left font-normal", // Adjusted width
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                // Handle case where only 'from' date is selected during interaction
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from} // Start calendar view at selected range start
            selected={date}
            onSelect={(newDateRange) => {
                setDate(newDateRange);
                // Optional: close popover when a full range is selected
                if (newDateRange?.from && newDateRange?.to) {
                    // Add a small delay to allow visual feedback before closing
                    setTimeout(() => setPopoverOpen(false), 100);
                }
            }}
            numberOfMonths={2} // Show two months for easier range selection
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}