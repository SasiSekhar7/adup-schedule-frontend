"use client";

import { DataTableColumnHeader } from "@/components/data-table/components/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateWithOrdinal } from "@/helpers";
import { ColumnDef } from "@tanstack/react-table";

// Define flattened CampaignInteraction type
export interface CampaignInteraction {
  interaction_id: string;
  count: number;
  created_at: string;
  campaign_id: string;
  campaign_name: string;
  campaign_description: string;
  user_id: string;
  phone_number: number;
}

// Response type from API
export interface CampaignInteractionResponse {
  interactions: CampaignInteraction[];
}
export const filters = [
    { label: "Campaign Name", value: "campaign_name" },
    { label: "Phone Number", value: "phone_number" },
    { label: "Date", value: "created_at" },
  ];
  
// Column definitions with sorting and filtering
export const columns: ColumnDef<CampaignInteraction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "campaign_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Campaign Name" />
    ),
    cell: ({ row }) => row.getValue("campaign_name"),
    filterFn: "includesString", // Enables filtering
  },
  {
    accessorKey: "campaign_description",
    header: "Campaign Description",
    cell: ({ row }) => row.getValue("campaign_description"),
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => row.getValue("phone_number"),
    filterFn: "includesString", // Enables filtering
  },
  {
    accessorKey: "count",
    header: "Interaction Count",
    cell: ({ row }) => row.getValue("count"),
    sortingFn: "basic", // Enables sorting
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => formatDateWithOrdinal(row.getValue("created_at")),
    sortingFn: "datetime", // Enables sorting by date
  },
];
