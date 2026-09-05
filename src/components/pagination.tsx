import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationProps {
  total: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function Pagination({
  total,
  currentPage,
  setCurrentPage,
}: PaginationProps) {
  if (total <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e111a] border border-neutral-800/80 shadow-inner">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Previous Page"
      >
        <IconChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: total }).map((_, index) => {
        const pageNumber = index + 1;
        const isActive = currentPage === pageNumber;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setCurrentPage(pageNumber)}
            className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= total}
        onClick={() => setCurrentPage(currentPage + 1)}
        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Next Page"
      >
        <IconChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}