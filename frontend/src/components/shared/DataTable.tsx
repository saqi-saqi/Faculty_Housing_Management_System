import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton.js';
import { EmptyState } from './EmptyState.js';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: React.ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filters,
  pageSize = 10,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records matching your current filter criteria.',
  onRowClick
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || searchKeys.length === 0) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchKeys]);

  // 2. Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Paginate sorted data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        )}
        {filters && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={pageSize > 5 ? 5 : pageSize} cols={columns.length} />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="p-8">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider border-b border-border">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3.5 select-none ${col.sortable ? 'cursor-pointer hover:text-foreground' : ''} ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          sortKey === col.key ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-primary" /> : <ArrowDown className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 text-foreground ${col.className || ''}`}>
                        {col.render ? col.render(row, idx) : (row[col.key] !== undefined ? String(row[col.key]) : '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && sortedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card text-xs text-muted-foreground">
            <div>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span> of{' '}
              <span className="font-medium text-foreground">{sortedData.length}</span> entries
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
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
