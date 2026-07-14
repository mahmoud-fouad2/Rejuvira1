"use client";

import { useActionState, useMemo, useState } from "react";

import type { ImportActionState } from "@/app/admin/patients/actions";
import { commitPatientsImportAction } from "@/app/admin/patients/actions";

const initialState: ImportActionState = { status: "idle", message: "" };

type ParsedRow = Record<string, string>;

/** Minimal CSV parser handling quotes, commas inside quotes, and BOM. */
function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i] as string;
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      current.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && clean[i + 1] === "\n") i += 1;
      current.push(field);
      field = "";
      if (current.some((value) => value.trim() !== "")) rows.push(current);
      current = [];
    } else {
      field += char;
    }
  }
  current.push(field);
  if (current.some((value) => value.trim() !== "")) rows.push(current);
  return rows;
}

const FIELDS = [
  { key: "fullNameAr", label: "الاسم (عربي) *", hints: ["name", "الاسم", "fullname", "full_name", "اسم"] },
  { key: "phone", label: "الجوال *", hints: ["phone", "جوال", "mobile", "هاتف", "tel"] },
  { key: "fileNumber", label: "رقم الملف", hints: ["file", "ملف", "file_number", "fileno"] },
  { key: "fullNameEn", label: "الاسم (إنجليزي)", hints: ["english", "name_en", "الاسم الانجليزي"] },
  { key: "email", label: "البريد", hints: ["email", "بريد", "mail"] },
  { key: "internalNotes", label: "ملاحظات", hints: ["note", "ملاحظ", "comment"] },
] as const;

function guessColumn(header: string[], hints: readonly string[]): number {
  const lower = header.map((cell) => cell.trim().toLowerCase());
  for (const hint of hints) {
    const index = lower.findIndex((cell) => cell.includes(hint));
    if (index !== -1) return index;
  }
  return -1;
}

export function ImportPatientsPanel() {
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [hasHeader, setHasHeader] = useState(true);
  const [state, formAction, isPending] = useActionState(
    commitPatientsImportAction,
    initialState,
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    setRawRows(rows);
    const header = rows[0];
    if (header) {
      const guessed: Record<string, number> = {};
      for (const field of FIELDS) {
        guessed[field.key] = guessColumn(header, field.hints);
      }
      setMapping(guessed);
    }
  };

  const dataRows = useMemo(
    () => (hasHeader ? rawRows.slice(1) : rawRows),
    [rawRows, hasHeader],
  );

  const parsedRows: ParsedRow[] = useMemo(
    () =>
      dataRows.map((row) => {
        const record: ParsedRow = {};
        for (const field of FIELDS) {
          const index = mapping[field.key] ?? -1;
          record[field.key] = index >= 0 ? (row[index] ?? "").trim() : "";
        }
        return record;
      }),
    [dataRows, mapping],
  );

  const validation = useMemo(
    () =>
      parsedRows.map((row) => {
        const problems: string[] = [];
        if (!row.fullNameAr || row.fullNameAr.length < 3) {
          problems.push("الاسم ناقص");
        }
        const digits = (row.phone ?? "").replace(/\D/g, "");
        const normalized = digits.startsWith("966")
          ? `0${digits.slice(3)}`
          : digits;
        if (!/^05\d{8}$/.test(normalized)) problems.push("جوال غير صالح");
        return problems;
      }),
    [parsedRows],
  );

  const validCount = validation.filter((problems) => problems.length === 0).length;
  const validRows = parsedRows.filter(
    (_row, index) => (validation[index] ?? []).length === 0,
  );

  if (state.status === "success" && state.results) {
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <p className="admin-status-badge is-success" style={{ whiteSpace: "normal" }}>
          {state.message}
        </p>
        <div className="admin-table-wrap">
          <table className="admin-users-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>الصف</th>
                <th>الاسم</th>
                <th>النتيجة</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {state.results.map((result) => (
                <tr key={result.row}>
                  <td>{result.row}</td>
                  <td>{result.name}</td>
                  <td>
                    <span
                      className={`admin-status-badge ${result.status === "created" ? "is-success" : "is-warning"}`}
                    >
                      {result.status === "created" ? "أُنشئ" : "تخطي"}
                    </span>
                  </td>
                  <td>{result.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => window.location.reload()}
          >
            استيراد ملف آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="admin-panel-soft" style={{ padding: "0.9rem" }}>
        <label style={{ display: "grid", gap: "0.4rem" }}>
          <span className="admin-field-label">
            ملف CSV (الأعمدة المطلوبة: الاسم والجوال)
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="admin-input"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {rawRows.length > 0 ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.6rem",
            }}
          >
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
            />
            <span>الصف الأول عناوين أعمدة</span>
          </label>
        ) : null}
      </div>

      {rawRows.length > 0 ? (
        <>
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {FIELDS.map((field) => (
              <label key={field.key}>
                <span className="admin-field-label">{field.label}</span>
                <select
                  className="admin-input"
                  value={mapping[field.key] ?? -1}
                  onChange={(event) =>
                    setMapping((previous) => ({
                      ...previous,
                      [field.key]: Number(event.target.value),
                    }))
                  }
                >
                  <option value={-1}>— غير موجود —</option>
                  {(rawRows[0] ?? []).map((cell, index) => (
                    <option key={index} value={index}>
                      عمود {index + 1}
                      {hasHeader && cell.trim() ? ` (${cell.trim().slice(0, 20)})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <p className="admin-text-soft" style={{ margin: 0 }}>
            معاينة: {dataRows.length} صف — {validCount} صالح للاستيراد،{" "}
            {dataRows.length - validCount} به مشاكل (لن يُستورد).
          </p>

          <div className="admin-table-wrap" style={{ maxHeight: 360, overflow: "auto" }}>
            <table className="admin-users-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الجوال</th>
                  <th>رقم الملف</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 100).map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.fullNameAr || "—"}</td>
                    <td dir="ltr">{row.phone || "—"}</td>
                    <td dir="ltr">{row.fileNumber || "تلقائي"}</td>
                    <td>
                      {(validation[index] ?? []).length === 0 ? (
                        <span className="admin-status-badge is-success">صالح</span>
                      ) : (
                        <span className="admin-status-badge is-danger">
                          {(validation[index] ?? []).join("، ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state.status === "error" ? (
            <p className="admin-status-badge is-danger" style={{ whiteSpace: "normal" }}>
              {state.message}
            </p>
          ) : null}

          <form action={formAction}>
            <input type="hidden" name="rows" value={JSON.stringify(validRows)} />
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={isPending || validCount === 0}
            >
              {isPending
                ? "جاري الاستيراد..."
                : `استيراد ${validCount} مريض`}
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}
