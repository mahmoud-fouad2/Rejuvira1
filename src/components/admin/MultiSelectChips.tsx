"use client";

import { useId, useMemo, useState } from "react";

export type ChipOption = {
  value: string;
  label: string;
  hint?: string;
};

type MultiSelectChipsProps = {
  /** Form field name. The component writes a comma-separated list. */
  name: string;
  options: ChipOption[];
  defaultSelected?: readonly string[];
  label?: string;
  helper?: string;
  emptyLabel?: string;
  required?: boolean;
};

/**
 * Searchable multi-select with chip pills. Writes the selected values as a
 * comma-separated string into a hidden form input — keeping API/server schemas
 * unchanged while giving editors a much better UX than a CSV field.
 */
export function MultiSelectChips({
  name,
  options,
  defaultSelected = [],
  label,
  helper,
  emptyLabel = "لا توجد خيارات / Empty",
  required,
}: MultiSelectChipsProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    options
      .map((option) => option.value)
      .filter((value) => defaultSelected.includes(value)),
  );

  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q) ||
        (option.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  function toggle(value: string) {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((entry) => entry !== value);
      return [...prev, value];
    });
  }

  function remove(value: string) {
    setSelected((prev) => prev.filter((entry) => entry !== value));
  }

  return (
    <div className="rv-multiselect">
      <input
        type="hidden"
        name={name}
        value={selected.join(",")}
        required={required}
      />
      {label ? (
        <label htmlFor={id} className="admin-field-label mb-1 block">
          {label}
        </label>
      ) : null}

      <div className="rv-multiselect__chips">
        {selected.length === 0 ? (
          <span className="rv-multiselect__empty">{emptyLabel}</span>
        ) : (
          selected.map((value) => {
            const option = options.find((entry) => entry.value === value);
            return (
              <span key={value} className="admin-tag-chip">
                {option?.label ?? value}
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => remove(value)}
                >
                  ×
                </button>
              </span>
            );
          })
        )}
      </div>

      <input
        id={id}
        type="search"
        autoComplete="off"
        placeholder="ابحث عن... / Search..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="admin-input mt-1"
      />

      <div className="rv-multiselect__list">
        {visibleOptions.length === 0 ? (
          <p className="rv-multiselect__empty p-2 text-xs">{emptyLabel}</p>
        ) : (
          visibleOptions.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className="rv-multiselect__option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.value)}
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    {option.label}
                  </span>
                  {option.hint ? (
                    <span className="block text-[11px] text-[color:var(--admin-text-faint)]">
                      {option.hint}
                    </span>
                  ) : null}
                </span>
                {checked ? <span aria-hidden>✓</span> : null}
              </label>
            );
          })
        )}
      </div>

      {helper ? (
        <p className="mt-1 text-[11px] text-[color:var(--admin-text-faint)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
