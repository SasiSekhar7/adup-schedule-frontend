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
  filters: filter[];
  maxHeight?: string; // ✅ New prop
  onPaginationChange?: (page: number, pageSize: number) => void; // ✅ New prop
  onRowSelectionChange?: (selectedRows: any) => void;
  onRowClick?: (row: TData) => void; // ✅ New prop for row click
}
type filter = {
  label: string;
  value: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  onPaginationChange, // ✅ Destructure the callback
  maxHeight = "80vh", // ✅ Default maxHeight
  onRowSelectionChange,
  onRowClick, // ✅ Destructure the row click callback
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    onRowSelectionChange?.(selectedRows);
  }, [rowSelection]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-row items-center space-x-4">
        {filters?.map((filter) => (
          <div className="flex items-center " key={filter.value}>
            <Input
              placeholder={`Filter ${filter.label}...`}
              type={filter.value === "start_time" ? "date" : "text"}
              value={
                (table
                  .getColumn(`${filter.value}`)
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(`${filter.value}`)
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        ))}
      </div>
      {/* Table Container with maxHeight */}
      <div
        className="rounded-md border overflow-auto"
        style={{ maxHeight }} // ✅ Apply maxHeight dynamically
      >
        <Table className="text-sm w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <DataTablePagination
        table={table}
        onPaginationChange={onPaginationChange}
      />{" "}
      {/* ✅ Pass the callback */}
    </div>
  );
}
