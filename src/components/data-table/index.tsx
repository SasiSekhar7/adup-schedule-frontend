

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: filter[];
  maxHeight?: string;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onRowSelectionChange?: (selectedRows: any) => void;
  onRowClick?: (row: TData) => void;
  getRowCanSelect?: (row: TData) => boolean;
  singleSelect?: boolean;
  hideSelectionColumn?: boolean;
}

type filter = {
  label: string;
  value: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  onPaginationChange,
  maxHeight = "80vh",
  onRowSelectionChange,
  onRowClick,
  getRowCanSelect,
  singleSelect = false,
  hideSelectionColumn = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    onRowSelectionChange?.(selectedRows);
  }, [rowSelection]);

  const filteredColumns = hideSelectionColumn
    ? columns.filter((col: any) => col.id !== "select")
    : columns;

  const table = useReactTable({
    data,
    columns: filteredColumns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: getRowCanSelect
      ? (row) => getRowCanSelect(row.original)
      : true,
    enableMultiRowSelection: !singleSelect,
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
    <div className="flex flex-col w-full h-full overflow-hidden">
      
      {/* Filters */}
      <div className="flex flex-col flex-shrink-0 gap-4 pb-4 overflow-x-auto md:flex-row">
        {filters?.map((filter) => (
          <div className="flex items-center" key={filter.value}>
            {filter.value === "type" ? (
              <Select
                value={
                  (table.getColumn(filter.value)?.getFilterValue() as string) ??
                  "all"
                }
                onValueChange={(value) =>
                  table
                    .getColumn(filter.value)
                    ?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            ) : (
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
            )}
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div
        className={`flex-1 w-full min-h-0 flex flex-col relative ${
          maxHeight !== "none" ? "rounded-md border" : ""
        }`}
      >
        {/* The scrollable area is defined here */}
        <div className="flex-1 overflow-auto">
          <Table className="w-full text-sm relative">
            {/* ✅ Added sticky, top-0, z-10, and bg-background to keep the header fixed */}
            <TableHeader className="sticky top-0 z-10 shadow-sm bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      // Ensure the background color covers the text underneath when scrolling
                      className="bg-background" 
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                          cell.getContext(),
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
      </div>

      {/* Pagination */}
      <div className="flex-row flex-shrink-0 pt-4">
        <DataTablePagination
          table={table}
          onPaginationChange={onPaginationChange || (() => {})}
        />
      </div>
    </div>
  );
}