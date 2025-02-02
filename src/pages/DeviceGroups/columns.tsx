"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

// Define types for Group and Device
interface DeviceGroup {
  name: string;
  group_id: string;
  device_count: number;
}

export interface Group {
  group_id: string;
  name: string;
  device_count: number;
  DeviceGroup: DeviceGroup;
}

export interface GroupsResponse {
  groups: Group[];
}

// Define columns
export const columns: ColumnDef<Group>[] = [
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
    accessorKey: "group_id",
    header: "Group ID",
    cell: ({ row }) => row.getValue("group_id"),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Group Name",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorKey: "device_count",
    header: "Device Count",
    cell: ({ row }) => row.getValue("device_count"),
    enableSorting: true,
  },
];

// Sample data based on the provided structure
const groupsData: GroupsResponse = {
  groups: [
    {
      group_id: "34c49e3a-88b6-4ca2-b591-f859a225c2ae",
      name: "Main Group",
      device_count: 1,
      DeviceGroup: { name: "Main Group", group_id: "34c49e3a-88b6-4ca2-b591-f859a225c2ae", device_count: 1 },
    },
  ],
};