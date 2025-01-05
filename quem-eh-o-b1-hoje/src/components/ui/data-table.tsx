"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, type Dispatch, type SetStateAction } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "./button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationStates: {
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    pageSize: number;
    setPageSize: Dispatch<SetStateAction<number>>;
  };
  total: number;
  editingRows: Record<number, boolean>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  paginationStates,
  total,
  editingRows,
}: DataTableProps<TData, TValue>) {
  const { page, pageSize, setPage, setPageSize } = paginationStates;

  const totalPages = Math.ceil((total ?? 0) / pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: totalPages,
    manualPagination: true,
  });

  // Função principal
  const getRowId = useCallback((row: Row<TData>): number => {
    return hasTicketId(row.original) ? row.original.ticketId : -1;
  }, []);

  return (
    <div className="">
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={
                    (
                      header.column.columnDef.meta as {
                        colSpan: number | undefined;
                      }
                    )?.colSpan
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={`${editingRows[getRowId(row)] ? "hover:bg-transparent" : ""}`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  colSpan={
                    (
                      cell.column.columnDef.meta as {
                        colSpan: number | undefined;
                      }
                    )?.colSpan
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page - 1 === 0}
          variant="ghost"
          size="sm"
        >
          <FaArrowLeft />
        </Button>

        <div>
          Página {page} de {totalPages}
        </div>

        <Button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
          variant="ghost"
          size="sm"
        >
          <FaArrowRight />
        </Button>
      </div>
    </div>
  );
}

// Type guard
function hasTicketId(obj: unknown): obj is { ticketId: number } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "ticketId" in obj &&
    typeof obj.ticketId === "number"
  );
}
