"use client";

import { useEffect, useMemo, useState } from "react";
import { SubmissionStatus } from "@prisma/client";

import {
  deleteCrmSubmissionAction,
  setCrmStatusAction,
} from "@/app/admin/crm/actions";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { CrmSubmissionEditor } from "@/components/forms/CrmSubmissionEditor";
import type { CrmRecord } from "@/lib/content-repository";

const STATUS_AR: Record<SubmissionStatus, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  NEW: "is-draft",
  CONTACTED: "is-review",
  FOLLOW_UP: "is-review",
  BOOKED: "is-published",
  CLOSED: "is-archived",
};

const STATUS_ORDER: SubmissionStatus[] = [
  SubmissionStatus.NEW,
  SubmissionStatus.CONTACTED,
  SubmissionStatus.FOLLOW_UP,
  SubmissionStatus.BOOKED,
  SubmissionStatus.CLOSED,
];

type FilterStatus = SubmissionStatus | "ALL";
type RangePreset = "today" | "7d" | "30d" | "90d" | "all";

function formatArabicDateTime(iso?: string) {
  if (!iso) return "غير محدد";
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatArabicDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatTimeAgo(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : digits;
  return normalized ? `https://wa.me/${normalized}` : "#";
}

function todayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function translateSource(value?: string) {
  const source = value || "الموقع الإلكتروني";
  const normalized = source.toLowerCase();
  if (normalized.includes("header booking")) return "نموذج الحجز العلوي";
  if (normalized.includes("homepage")) return "نموذج الصفحة الرئيسية";
  if (normalized.includes("website")) return "الموقع الإلكتروني";
  if (normalized.includes("landing")) return "صفحة هبوط";
  if (normalized.includes("webhook")) return "ويب هوك";
  return source;
}

function withinSameSaudiDay(iso: string | undefined, now: number) {
  if (!iso) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(iso)) === formatter.format(new Date(now));
}

function dateInputToStart(value: string) {
  return value ? new Date(`${value}T00:00:00+03:00`).getTime() : null;
}

function dateInputToEnd(value: string) {
  return value ? new Date(`${value}T23:59:59+03:00`).getTime() : null;
}

export function CrmFilterBar({
  submissions,
  services,
  staff,
  canDelete = false,
  canDeleteComments = false,
  initialNow,
}: {
  submissions: ReadonlyArray<CrmRecord>;
  services: ReadonlyArray<{ slug: string; name: string }>;
  staff: ReadonlyArray<{ id: string; name: string }>;
  canDelete?: boolean;
  canDeleteComments?: boolean;
  initialNow: number;
}) {
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [tag, setTag] = useState("ALL");
  const [owner, setOwner] = useState("ALL");
  const [range, setRange] = useState<RangePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [nowSnapshot] = useState(initialNow);

  const allSources = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((item) => set.add(item.source || "الموقع الإلكتروني"));
    return Array.from(set).sort((left, right) =>
      translateSource(left).localeCompare(translateSource(right), "ar"),
    );
  }, [submissions]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((item) =>
      (item.tags ?? []).forEach((tagValue) => set.add(tagValue)),
    );
    return Array.from(set).sort((left, right) =>
      left.localeCompare(right, "ar"),
    );
  }, [submissions]);

  const filtered = useMemo(() => {
    const presetDays =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
    const presetCutoff = presetDays
      ? nowSnapshot - presetDays * 86_400_000
      : null;
    const fromTime = dateInputToStart(fromDate);
    const toTime = dateInputToEnd(toDate);
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      if (status !== "ALL" && submission.status !== status) return false;
      if (source !== "ALL" && submission.source !== source) return false;
      if (service !== "ALL" && submission.serviceSlug !== service) return false;
      if (tag !== "ALL" && !(submission.tags ?? []).includes(tag)) return false;
      if (owner !== "ALL") {
        if (owner === "_unassigned" && submission.assignedToId) return false;
        if (owner !== "_unassigned" && submission.assignedToId !== owner) {
          return false;
        }
      }
      const created = new Date(submission.createdAt).getTime();
      if (
        range === "today" &&
        !withinSameSaudiDay(submission.createdAt, nowSnapshot)
      ) {
        return false;
      }
      if (presetCutoff && created < presetCutoff) return false;
      if (fromTime && created < fromTime) return false;
      if (toTime && created > toTime) return false;
      if (term) {
        const haystack = [
          submission.fullName,
          submission.phone,
          submission.email ?? "",
          submission.serviceLabel ?? "",
          submission.source,
          submission.message ?? "",
          submission.notes ?? "",
          submission.utmSource ?? "",
          submission.utmMedium ?? "",
          submission.utmCampaign ?? "",
          submission.utmContent ?? "",
          (submission.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [
    fromDate,
    nowSnapshot,
    owner,
    range,
    search,
    service,
    source,
    status,
    submissions,
    tag,
    toDate,
  ]);

  const pipeline = useMemo(
    () =>
      STATUS_ORDER.map((stage) => ({
        stage,
        total: filtered.filter((item) => item.status === stage).length,
      })),
    [filtered],
  );

  const dailyCount = filtered.filter((item) =>
    withinSameSaudiDay(item.createdAt, nowSnapshot),
  ).length;
  const unassignedCount = filtered.filter((item) => !item.assignedToId).length;
  const campaignCount = filtered.filter(
    (item) => item.utmSource || item.utmMedium || item.utmCampaign,
  ).length;
  const bookedCount = filtered.filter(
    (item) => item.status === SubmissionStatus.BOOKED,
  ).length;
  const selectedSubmission = selectedLeadId
    ? (filtered.find((item) => item.id === selectedLeadId) ?? null)
    : null;

  useEffect(() => {
    if (!selectedSubmission) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLeadId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedSubmission]);

  const exportQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (source !== "ALL") params.set("source", source);
    if (service !== "ALL") params.set("service", service);
    if (owner !== "ALL") params.set("owner", owner);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [fromDate, owner, search, service, source, status, toDate]);

  const resetFilters = () => {
    setStatus("ALL");
    setSearch("");
    setSource("ALL");
    setService("ALL");
    setTag("ALL");
    setOwner("ALL");
    setRange("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="admin-crm-workspace">
      <section className="admin-crm-filter-panel">
        <div className="admin-crm-filter-panel__head">
          <div>
            <span className="admin-field-label">قاعدة بيانات الليدز</span>
            <h2>{filtered.length} نتيجة مطابقة</h2>
          </div>
          <div className="admin-crm-filter-panel__exports">
            <a
              className="admin-btn-secondary"
              href={`/api/admin/crm/export?format=csv${exportQuery ? `&${exportQuery}` : ""}`}
            >
              تنزيل البيانات
            </a>
            <a
              className="admin-btn-secondary"
              href={`/api/admin/crm/export?format=pdf${exportQuery ? `&${exportQuery}` : ""}`}
            >
              تقرير مختصر
            </a>
          </div>
        </div>

        <div className="admin-crm-filter-grid">
          <label>
            <span>بحث شامل</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="اسم / جوال / خدمة / مصدر"
              className="admin-input"
            />
          </label>
          <label>
            <span>الحالة</span>
            <select
              className="admin-input"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as FilterStatus)
              }
            >
              <option value="ALL">كل الحالات</option>
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_AR[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>الخدمة</span>
            <select
              className="admin-input"
              value={service}
              onChange={(event) => setService(event.target.value)}
            >
              <option value="ALL">كل الخدمات</option>
              {services.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>المصدر</span>
            <select
              className="admin-input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              <option value="ALL">كل المصادر</option>
              {allSources.map((value) => (
                <option key={value} value={value}>
                  {translateSource(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>المسؤول</span>
            <select
              className="admin-input"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            >
              <option value="ALL">كل المسؤولين</option>
              <option value="_unassigned">بدون مسؤول</option>
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>من تاريخ</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="admin-input"
            />
          </label>
          <label>
            <span>إلى تاريخ</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="admin-input"
            />
          </label>
          <label>
            <span>الوسم</span>
            <select
              className="admin-input"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            >
              <option value="ALL">كل الوسوم</option>
              {allTags.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-crm-quickbar">
          {(
            [
              { id: "today", label: "اليوم" },
              { id: "7d", label: "آخر 7 أيام" },
              { id: "30d", label: "آخر 30 يوم" },
              { id: "90d", label: "آخر 90 يوم" },
              { id: "all", label: "كل الفترات" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              className={range === option.id ? "is-active" : ""}
              onClick={() => {
                setRange(option.id);
                if (option.id === "today") {
                  const today = todayInputValue();
                  setFromDate(today);
                  setToDate(today);
                } else {
                  setFromDate("");
                  setToDate("");
                }
              }}
            >
              {option.label}
            </button>
          ))}
          <button type="button" onClick={resetFilters}>
            مسح الفلاتر
          </button>
        </div>
      </section>

      <section className="admin-crm-database-stats">
        <article>
          <span>وارد اليوم</span>
          <strong>{dailyCount}</strong>
        </article>
        <article>
          <span>بدون مسؤول</span>
          <strong>{unassignedCount}</strong>
        </article>
        <article>
          <span>من حملات</span>
          <strong>{campaignCount}</strong>
        </article>
        <article>
          <span>تحولت لحجز</span>
          <strong>{bookedCount}</strong>
        </article>
      </section>

      <section className="admin-crm-pipeline" aria-label="مراحل الليدز">
        {pipeline.map((column) => (
          <div key={column.stage} className="admin-crm-pipeline__column">
            <header>
              <div>
                <strong>{STATUS_AR[column.stage]}</strong>
                <span>مرحلة في خط المتابعة</span>
              </div>
              <em>{column.total}</em>
            </header>
          </div>
        ))}
      </section>

      <section className="admin-crm-leads-list">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-sm">
            لا توجد نتائج مطابقة للتصفية الحالية.
          </p>
        ) : null}
        {filtered.length ? (
          <div className="admin-crm-sheet">
            <div className="admin-crm-sheet__toolbar">
              <div>
                <span className="admin-field-label">قائمة الطلبات</span>
                <strong>{filtered.length} سجل</strong>
              </div>
              <span>افتح الطلب لمتابعة التفاصيل والإجراءات.</span>
            </div>
            <div className="admin-crm-sheet__scroll">
              <table className="table-hover table align-middle">
                <thead>
                  <tr>
                    <th>العميل</th>
                    <th>الجوال</th>
                    <th>الحالة</th>
                    <th>المصدر</th>
                    <th>آخر تفاعل</th>
                    <th>تاريخ الدخول</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((submission) => {
                    const isSelected = submission.id === selectedSubmission?.id;
                    return (
                      <tr
                        key={submission.id}
                        id={`lead-${submission.id}`}
                        data-selected={isSelected ? "true" : "false"}
                        tabIndex={0}
                        onClick={() => setSelectedLeadId(submission.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedLeadId(submission.id);
                          }
                        }}
                      >
                        <td>
                          <button
                            type="button"
                            className="admin-crm-sheet__lead-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLeadId(submission.id);
                            }}
                          >
                            <strong>{submission.fullName}</strong>
                            <span>
                              {formatTimeAgo(submission.createdAt, nowSnapshot)}
                            </span>
                          </button>
                        </td>
                        <td dir="ltr">{submission.phone}</td>
                        <td>
                          <span
                            className={`admin-status-badge ${STATUS_BADGE[submission.status]}`}
                          >
                            {STATUS_AR[submission.status]}
                          </span>
                        </td>
                        <td>{translateSource(submission.source)}</td>
                        <td>
                          {formatTimeAgo(submission.createdAt, nowSnapshot)}
                        </td>
                        <td>{formatArabicDate(submission.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-secondary text-xs"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLeadId(submission.id);
                            }}
                          >
                            فتح
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      {selectedSubmission ? (
        <div
          className="admin-modal admin-crm-modal modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`lead-modal-title-${selectedSubmission.id}`}
        >
          <button
            type="button"
            className="admin-modal__backdrop modal-backdrop fade show"
            aria-label="إغلاق التفاصيل"
            onClick={() => setSelectedLeadId(null)}
          />
          <div className="admin-modal__panel modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <header className="admin-modal__header modal-header">
                <div className="admin-crm-lead-main">
                  <h2
                    id={`lead-modal-title-${selectedSubmission.id}`}
                    className="admin-modal__title modal-title"
                  >
                    {selectedSubmission.fullName}
                  </h2>
                  <span>
                    {selectedSubmission.phone}
                    {selectedSubmission.serviceLabel
                      ? ` · ${selectedSubmission.serviceLabel}`
                      : ""}
                  </span>
                </div>
                <div className="admin-crm-lead-meta">
                  <span
                    className={`admin-status-badge ${STATUS_BADGE[selectedSubmission.status]}`}
                  >
                    {STATUS_AR[selectedSubmission.status]}
                  </span>
                  <span className="admin-chip">
                    {translateSource(selectedSubmission.source)}
                  </span>
                  <span className="admin-chip is-accent">
                    {formatTimeAgo(selectedSubmission.createdAt, nowSnapshot)}
                  </span>
                  <button
                    type="button"
                    className="admin-modal__close btn-close"
                    aria-label="إغلاق"
                    onClick={() => setSelectedLeadId(null)}
                  >
                    ×
                  </button>
                </div>
              </header>

              <div className="admin-modal__body modal-body">
                <div className="admin-crm-modal__summary">
                  <div>
                    <span className="admin-field-label">تاريخ الدخول</span>
                    <strong>
                      {formatArabicDate(selectedSubmission.createdAt)}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-field-label">المسؤول</span>
                    <strong>
                      {selectedSubmission.assignedToName ?? "غير محدد"}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-field-label">الحملة</span>
                    <strong>
                      {[
                        selectedSubmission.utmSource,
                        selectedSubmission.utmMedium,
                        selectedSubmission.utmCampaign,
                        selectedSubmission.utmContent,
                      ]
                        .filter(Boolean)
                        .join(" / ") || "لا يوجد"}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-field-label">رسالة العميل</span>
                    <p>{selectedSubmission.message || "لم يُرفق رسالة"}</p>
                  </div>
                </div>

                <div className="admin-crm-modal__actions">
                  <div className="admin-crm-modal__quick-actions">
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="admin-btn-secondary btn btn-outline-primary btn-sm"
                    >
                      اتصال
                    </a>
                    <a
                      href={whatsappHref(selectedSubmission.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-secondary btn btn-outline-success btn-sm"
                    >
                      واتساب
                    </a>
                  </div>
                  <form action={setCrmStatusAction}>
                    <input
                      type="hidden"
                      name="id"
                      value={selectedSubmission.id}
                    />
                    <select
                      name="status"
                      className="admin-input form-select"
                      defaultValue={selectedSubmission.status}
                    >
                      {STATUS_ORDER.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_AR[value]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="admin-btn-secondary btn btn-outline-primary btn-sm"
                    >
                      تحديث الحالة
                    </button>
                  </form>
                  {canDelete ? (
                    <form action={deleteCrmSubmissionAction}>
                      <input
                        type="hidden"
                        name="id"
                        value={selectedSubmission.id}
                      />
                      <AdminConfirmSubmitButton
                        className="admin-btn-danger btn btn-outline-danger btn-sm"
                        titleArabic="حذف الطلب"
                        titleEnglish="Delete lead"
                        messageArabic="سيتم حذف هذا الطلب نهائيًا مع سجل المتابعة المرتبط به."
                        messageEnglish="This lead and its follow-up history will be permanently deleted."
                        confirmArabic="حذف نهائي"
                        confirmEnglish="Delete"
                      >
                        حذف الطلب
                      </AdminConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>

                <div className="admin-crm-modal__pipeline">
                  {STATUS_ORDER.map((value) => (
                    <span
                      key={value}
                      className={
                        STATUS_ORDER.indexOf(value) <=
                        STATUS_ORDER.indexOf(selectedSubmission.status)
                          ? "is-active"
                          : ""
                      }
                    >
                      {STATUS_AR[value]}
                    </span>
                  ))}
                </div>

                <div className="admin-crm-modal__timeline">
                  <div className="admin-card__subtitle">سجل المتابعة</div>
                  <ol>
                    <li>
                      <strong>تم استقبال الليد</strong>
                      <span>
                        {formatArabicDateTime(selectedSubmission.createdAt)}
                      </span>
                    </li>
                    {selectedSubmission.comments.slice(0, 4).map((comment) => (
                      <li key={comment.id}>
                        <strong>{comment.authorName ?? "ملاحظة داخلية"}</strong>
                        <span>{formatArabicDateTime(comment.createdAt)}</span>
                        <p>{comment.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="admin-crm-modal__editor">
                  <CrmSubmissionEditor
                    key={selectedSubmission.id}
                    submission={selectedSubmission}
                    services={services}
                    staff={staff}
                    canDeleteComments={canDeleteComments}
                    {...(selectedSubmission.serviceId
                      ? {
                          currentServiceSlug: selectedSubmission.serviceSlug,
                        }
                      : {})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
