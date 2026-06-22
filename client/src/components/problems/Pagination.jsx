import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPage } from "../../features/problems/problemSlice";
import {
  selectCurrentPage,
  selectTotalPages,
} from "../../features/problems/problemSelectors";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = () => {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);

  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPages();

  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-mono font-semibold transition-all duration-200";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 pb-4">
      {/* Prev */}
      <button
        onClick={() => dispatch(setPage(page - 1))}
        disabled={page === 1}
        className={`${btnBase} border ${
          page === 1
            ? "border-border text-text-muted cursor-not-allowed opacity-50"
            : "border-border text-text-secondary hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-text-muted text-sm font-mono">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => dispatch(setPage(p))}
            className={`${btnBase} border ${
              p === page
                ? "bg-primary-500/15 border-primary-500 text-primary-500"
                : "border-border text-text-secondary hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => dispatch(setPage(page + 1))}
        disabled={page === totalPages}
        className={`${btnBase} border ${
          page === totalPages
            ? "border-border text-text-muted cursor-not-allowed opacity-50"
            : "border-border text-text-secondary hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/10"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
