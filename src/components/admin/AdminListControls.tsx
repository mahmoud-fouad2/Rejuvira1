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
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function AdminListControls({
  targetId,
  tabs,
  searchArabic = "بحث سريع",
  searchEnglish = "Quick search",
}: AdminListControlsProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [visibleCount, setVisibleCount] = useState(
    tabs.find((tab) => tab.value === "all")?.count ?? 0,
  );

  const normalizedQuery = useMemo(() => normalize(query), [query]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      `[data-admin-list="${targetId}"]`,
    );
    if (!root) return;

    const rows = Array.from(
      root.querySelectorAll<HTMLElement>("[data-admin-row]"),
    );
    let nextVisibleCount = 0;

    for (const row of rows) {
      const rowStatus = row.dataset.adminStatus ?? "";
      const haystack = normalize(row.dataset.adminSearch ?? "");
      const matchesStatus = status === "all" || rowStatus === status;
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const visible = matchesStatus && matchesQuery;

      row.toggleAttribute("hidden", !visible);
      row.classList.toggle("is-filtered-out", !visible);
      if (visible) nextVisibleCount += 1;
    }

    setVisibleCount(nextVisibleCount);
  }, [normalizedQuery, status, targetId]);

  return (
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
        <span className="lang-ar">{visibleCount} نتيجة ظاهرة</span>
        <span className="lang-en">{visibleCount} visible</span>
      </span>
    </div>
  );
}
