import React, { useState, useMemo, ReactNode } from "react";
import { MoreVerticalIcon } from "lucide-react";

// Generic Column type
export interface Column<T> {
  label: string;
  field?: keyof T | string;
  alignRight?: boolean;
  default?: React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

// DataTable props
interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  error?: string | null;
  actions?: (row: T) => ReactNode;
  itemsPerPage?: number;
}

function DataTable<T extends { id?: string | number }>({
  columns,
  data = [],
  loading = false,
  error = null,
  actions,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [openDropdownId, setOpenDropdownId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                {columns.map((col, index) => (
                    <th key={index} scope="col" className={`px-6 py-4 ${col.alignRight ? "text-right" : ""}`}>
                    {col.label}
                    </th>
                ))}

                {actions && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-500">
                    Loading...
                    </td>
                </tr>
                ) : error ? (
                <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-red-600">
                    Error: {error}
                    </td>
                </tr>
                ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                    <tr key={row.id ?? rowIndex} className="bg-white hover:bg-gray-50 relative">
                        {columns.map((col, colIndex) => (
                            <td key={colIndex} className={`px-6 py-4 ${col.alignRight ? "text-right" : ""}`}>
                                {col.render
                                    ? col.render(row)
                                    : (row[col.field as keyof T] as unknown as React.ReactNode) ?? col.default ?? ""}
                            </td>
                        ))}

                        {actions && (
                            <td className="px-6 py-4 text-right relative">
                            <button
                                onClick={() =>
                                    setOpenDropdownId(openDropdownId === row.id ? null : row.id ?? null)
                                }
                                className="inline-flex justify-center items-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none transition"
                                >
                                <MoreVerticalIcon className="w-5 h-5 text-gray-600" />
                                </button>


                            {openDropdownId === row.id && (
                                <div className="absolute right-6 mt-2 w-40 origin-top-right bg-white border border-gray-100 rounded-lg shadow-lg z-10 animate-fadeIn">
                                {actions(row)}
                                </div>
                            )}
                            </td>
                        )}
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-500">
                    No records found.
                    </td>
                </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <span className="text-sm text-gray-700">
          Showing <span className="font-semibold">{Math.min(1 + (currentPage - 1) * itemsPerPage, data.length)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, data.length)}</span> of <span className="font-semibold">{data.length}</span> Results
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
