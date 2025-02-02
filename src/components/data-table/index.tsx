"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { DataTablePagination } from "./components/data-table-pagination";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: [{ label: string; value: string }];
  onRowSelectionChange?: (selectedRows: any) => void; // Add this prop for callback
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  onRowSelectionChange, // Destructure the callback prop
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

// useEffect to log selected rows after state updates
React.useEffect(() => {
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  onRowSelectionChange?.(selectedRows); // Pass selected rows to the callback
}, [rowSelection]); // Run effect when rowSelection changes

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: (newSelection) => {
      setRowSelection(newSelection);
    
      if (onRowSelectionChange) {
        const selectedRows = table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original); // Extract actual row data
    
        onRowSelectionChange(selectedRows); // Pass selected rows to the callback
      }
    },
    
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4 ">
      <div>
        {filters?.map((filter) => (
          <div className="flex items-center py-4" key={filter.value}>
            <Input
              placeholder={`Filter ${filter.label}...`}
              value={
                (table.getColumn(`${filter.value}`)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table.getColumn(`${filter.value}`)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
