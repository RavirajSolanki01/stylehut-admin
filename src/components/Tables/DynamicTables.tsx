"use client";
import { ArrowDown, ArrowUp } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/Pagination";
import { SortOrder } from "@/types/interface";

interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  textAlign?: "left" | "center" | "right";
}

interface DynamicTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T | "";
  sortOrder?: SortOrder;
  actions?: (row: T) => React.ReactNode;
  totalPages: number;
  handlePageChange: (page: number) => void;
  currentPage: number;
}

export function DynamicTable<T extends { id: number | string }>({
  data,
  columns,
  onSort,
  sortKey,
  sortOrder,
  actions,
  totalPages,
  handlePageChange,
  currentPage,
}: DynamicTableProps<T>) {
  const getArrow = (key: keyof T) =>
    sortKey === key ? (
      sortOrder === "asc" ? (
        <ArrowUp size={18} strokeWidth={1} />
      ) : (
        <ArrowDown size={18} strokeWidth={1} />
      )
    ) : null;

  const getVisiblePages = (): number[] => {
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={col.sortable ? "cursor-pointer" : ""}
                onClick={() => col.sortable && onSort?.(col.key)}
                textAlign={col.textAlign}
              >
                {col.label} {col.sortable && getArrow(col.key)}
              </TableHead>
            ))}
            {actions && <TableHead textAlign="right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-30 py-6 text-center text-sm text-gray-500"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell
                    className="whitespace-nowrap"
                    key={String(col.key)}
                  >
                    {col.render
                      ? col.render(row[col.key], row, index)
                      : String(row[col.key])}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(row)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {data.length > 0 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              />
            </PaginationItem>

            {getVisiblePages().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > 3 && getVisiblePages().at(-1)! < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
