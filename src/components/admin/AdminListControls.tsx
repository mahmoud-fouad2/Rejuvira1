"use client";

import { useEffect, useMemo, useState } from "react";

type AdminListTab = {
  value: string;
  labelAr: string;
  labelEn: string;
  count: number;
};

type AdminListControlsProps = {
  targetId: string;
  tabs: AdminListTab[];
  searchArabic?: string;
  searchEnglish?: string;
  /** Items per page (client-side pagination). Defaults to 12. */
  pageSize?: number;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function AdminListControls({
  targetId,
  tabs,
  searchArabic = "بحث سريع",
  searchEnglish = "Quick search",
  pageSize = 12,
}: AdminListControlsProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(
    tabs.find((tab) => tab.value === "all")?.count ?? 0,
  );
  const [totalPages, setTotalPages] = useState(1);

  const normalizedQuery = useMemo(() => normalize(query), [query]);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, status]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      `[data-admin-list="${targetId}"]`,
    );
    if (!root) return;

    const rows = Array.from(
      root.querySelectorAll<HTMLElement>("[data-admin-row]"),
    );

    /* Pass 1: apply filter */
    const matched: HTMLElement[] = [];
    for (const row of rows) {
      const rowStatus = row.dataset.adminStatus ?? "";
      const haystack = normalize(row.dataset.adminSearch ?? "");
      const matchesStatus = status === "all" || rowStatus === status;
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesFilter = matchesStatus && matchesQuery;
      if (matchesFilter) {
        matched.push(row);
      } else {
        row.setAttribute("hidden", "");
        row.classList.add("is-filtered-out");
      }
    }

    /* Pass 2: apply pagination on matched rows */
    const nextTotalPages = Math.max(1, Math.ceil(matched.length / pageSize));
    const currentPage = Math.min(page, nextTotalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;

    matched.forEach((row, idx) => {
      const inPage = idx >= startIdx && idx < endIdx;
      if (inPage) {
        row.removeAttribute("hidden");
        row.classList.remove("is-filtered-out");
      } else {
        row.setAttribute("hidden", "");
        row.classList.add("is-filtered-out");
      }
    });

    setVisibleCount(matched.length);
    setTotalPages(nextTotalPages);

    if (currentPage !== page) {
      setPage(currentPage);
    }
  }, [normalizedQuery, status, page, pageSize, targetId]);

  const startItem = visibleCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, visibleCount);

  /* Generate page number buttons (max 5 visible) */
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <>
      <div className="admin-list-controls">
        <label className="admin-list-controls__search">
          <span className="sr-only">
            <span className="lang-ar">{searchArabic}</span>
            <span className="lang-en">{searchEnglish}</span>
          </span>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${searchArabic} / ${searchEnglish}`}
            type="search"
          />
        </label>

        <div className="admin-list-controls__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={status === tab.value ? "is-active" : ""}
              onClick={() => setStatus(tab.value)}
            >
              <span className="lang-ar">{tab.labelAr}</span>
              <span className="lang-en">{tab.labelEn}</span>
              <b>{tab.count}</b>
            </button>
          ))}
        </div>

        <span className="admin-list-controls__count">
          <span className="lang-ar">
            {startItem}-{endItem} من {visibleCount}
          </span>
          <span className="lang-en">
            {startItem}-{endItem} of {visibleCount}
          </span>
        </span>
      </div>

      {/* Pagination — hidden when one page fits all */}
      {totalPages > 1 ? (
        <div
          className="admin-pagination"
          role="navigation"
          aria-label="Pagination"
        >
          <button
            type="button"
            className="admin-pagination__btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <span className="lang-ar">السابق</span>
            <span className="lang-en">Prev</span>
          </button>

          <div className="admin-pagination__pages">
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="admin-pagination__dots">
                  ⋯
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`admin-pagination__page ${page === p ? "is-active" : ""}`}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? "page" : undefined}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="admin-pagination__btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <span className="lang-ar">التالي</span>
            <span className="lang-en">Next</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
