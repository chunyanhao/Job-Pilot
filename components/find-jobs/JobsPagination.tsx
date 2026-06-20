import type { ReactElement } from "react";

type Props = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function JobsPagination({ currentPage, pageSize, totalItems, totalPages, onPageChange }: Props): ReactElement {
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <section className="-mt-6 rounded-b-xl border-x border-b border-border bg-surface px-6 py-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium leading-5 text-text-secondary">
            Showing <span className="font-semibold text-text-dark">{firstItem}</span> to{" "}
            <span className="font-semibold text-text-dark">{lastItem}</span> of{" "}
            <span className="font-semibold text-text-dark">{totalItems}</span> results
          </p>
          <p className="mt-1 text-xs font-normal leading-4 text-text-muted">Jobs by Adzuna</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="min-h-11 rounded-lg border border-border bg-surface px-4 text-sm font-medium leading-5 text-text-secondary shadow-card transition-colors hover:bg-surface-secondary disabled:text-text-muted"
          >
            Previous
          </button>

          {pages.map((page, index) =>
            page === "gap" ? (
              <span key={`gap-${index}`} className="px-2 text-sm font-medium leading-5 text-text-muted">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={
                  page === currentPage
                    ? "flex size-11 items-center justify-center rounded-lg border border-accent-light bg-accent-muted text-sm font-semibold leading-5 text-accent shadow-card"
                    : "flex size-11 items-center justify-center rounded-lg border border-border bg-surface text-sm font-semibold leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary"
                }
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="min-h-11 rounded-lg border border-border bg-surface px-4 text-sm font-medium leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary disabled:text-text-muted"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function buildVisiblePages(currentPage: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "gap", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "gap", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "gap", currentPage - 1, currentPage, currentPage + 1, "gap", totalPages];
}
