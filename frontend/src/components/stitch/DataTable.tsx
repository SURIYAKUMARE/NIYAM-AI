"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filterComponent?: React.ReactNode;
  actionButton?: React.ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  keyExtractor?: (item: T, index?: number) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchFilter,
  filterComponent,
  actionButton,
  pageSize = 10,
  emptyTitle = "No records found",
  emptyDescription = "There are no matching entries in this view.",
  keyExtractor = (item: T, idx?: number) => (item as any)?.id ?? idx ?? 0,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = React.useMemo(() => {
    if (!query.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, query.trim().toLowerCase()));
  }, [data, query, searchFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {searchFilter && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E8EE] bg-white text-[#14202B] placeholder-[#5B6B7A]/60 focus:outline-none focus:ring-2 focus:ring-[#0F6B6B] focus:border-[#0F6B6B] transition-colors shadow-xs"
              />
            </div>
          )}

          {filterComponent}
        </div>

        {actionButton && <div className="shrink-0">{actionButton}</div>}
      </div>

      {/* Surface Table */}
      <div className="bg-white rounded-xl border border-[#E3E8EE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E3E8EE]">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-[#5B6B7A] bg-[#F7F9FB] ${
                      col.className || ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70 text-xs">
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F7F9FB] border border-[#E3E8EE] flex items-center justify-center mx-auto mb-2 text-[#5B6B7A]">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-[#14202B] text-xs">{emptyTitle}</div>
                    <div className="text-[11px] text-[#5B6B7A] mt-0.5">{emptyDescription}</div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row, rowIdx) => (
                  <tr
                    key={keyExtractor(row) ?? rowIdx}
                    className="hover:bg-[#F7F9FB]/60 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`py-3 px-4 font-medium text-[#14202B] ${
                          col.className || ""
                        }`}
                      >
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String((row as any)[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredData.length > pageSize && (
          <div className="px-4 py-3 bg-[#F7F9FB]/60 border-t border-[#E3E8EE] flex items-center justify-between text-xs text-[#5B6B7A]">
            <div>
              Showing{" "}
              <span className="font-semibold text-[#14202B]">
                {(page - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#14202B]">
                {Math.min(page * pageSize, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#14202B]">
                {filteredData.length}
              </span>{" "}
              records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#E3E8EE] bg-white text-[#14202B] hover:bg-[#F7F9FB] disabled:opacity-40 transition shadow-xs"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 font-mono text-[11px] font-bold text-[#14202B]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#E3E8EE] bg-white text-[#14202B] hover:bg-[#F7F9FB] disabled:opacity-40 transition shadow-xs"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
