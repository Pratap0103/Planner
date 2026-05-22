import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DragScrollTable from './DragScrollTable';

/**
 * DataTable Component
 * Standardized table with Desktop Table View and Mobile Card View.
 * Includes integrated pagination footer.
 * - Mobile: Full-height scrollable card list with proper overflow
 * - Desktop: Horizontal drag-scroll table that fills available width
 */
const DataTable = ({ 
  headers, 
  data, 
  renderRow, 
  renderCard,
  minWidth = "900px",
  // Pagination Props
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  totalResults
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 bg-white overflow-hidden">
      {/* Mobile Card View (Hidden on md+) */}
      <div className="md:hidden flex flex-col gap-1 p-1 overflow-y-auto flex-1 bg-slate-50/50 min-h-0">
        {data.length > 0 ? (
          data.map((item, index) => renderCard(item, index))
        ) : (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-100 shadow-sm text-xs font-medium">
            No records found.
          </div>
        )}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden">
        <DragScrollTable className="w-full flex-1 min-h-0">
          <table className="w-full relative border-collapse" style={{ minWidth }}>
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className="px-3 py-3 text-center text-xs font-semibold text-gray-900 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.length > 0 ? (
                data.map((item, index) => renderRow(item, index))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-10 text-center text-sm font-medium text-gray-500 bg-gray-50/50">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DragScrollTable>
      </div>

      {/* Pagination Footer — same for both views */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
        {/* Left: Items per page + count */}
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-1.5 py-1 focus:outline-none focus:border-green-500 bg-white font-medium text-xs shadow-sm"
          >
            {[10, 20, 50, 100].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
          <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap font-medium">
            {totalResults > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}–{Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults}
          </span>
        </div>

        {/* Right: Prev / Page / Next */}
        <div className="flex items-center gap-2 text-gray-700">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 transition shadow-sm flex items-center justify-center text-green-600"
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-semibold text-gray-600 min-w-[40px] text-center">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 transition shadow-sm flex items-center justify-center text-green-600"
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
