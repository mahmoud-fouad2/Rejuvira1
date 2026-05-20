"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SubmissionStatus } from "@prisma/client";

import type { CrmRecord } from "@/lib/content-repository";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { CrmSubmissionEditor } from "@/components/forms/CrmSubmissionEditor";

const STATUS_AR: Record<SubmissionStatus, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};
const STATUS_EN: Record<SubmissionStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow-up",
  BOOKED: "Booked",
  CLOSED: "Closed",
};
const STATUS_BADGE: Record<SubmissionStatus, string> = {
  NEW: "is-draft",
  CONTACTED: "is-review",
  FOLLOW_UP: "is-review",
  BOOKED: "is-published",
  CLOSED: "is-archived",
};

type FilterStatus = SubmissionStatus | "ALL";
type AppointmentFilter = "ALL" | "WITH_DATE" | "TODAY" | "UPCOMING" | "NO_DATE";
type QuickFilter =
  | "ALL"
  | "NEEDS_ACTION"
  | "UNASSIGNED"
  | "HAS_MESSAGE"
  | "CAMPAIGN";
type SortMode = "NEWEST" | "OLDEST" | "APPOINTMENT" | "NAME";

const STATUS_ORDER: SubmissionStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "BOOKED",
  "CLOSED",
];

function formatAppointment(iso?: string) {
  if (!iso) return "No appointment";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDateOnly(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return formatDateOnly(iso);
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function statusTone(status: SubmissionStatus) {
  if (status === "NEW") return "is-hot";
  if (status === "FOLLOW_UP") return "is-warm";
  if (status === "BOOKED") return "is-done";
  if (status === "CLOSED") return "is-muted";
  return "is-cool";
}

export function CrmFilterBar({
  submissions,
  services,
  staff,
}: {
  submissions: ReadonlyArray<CrmRecord>;
  services: ReadonlyArray<{ slug: string; name: string }>;
  staff: ReadonlyArray<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string>("ALL");
  const [tag, setTag] = useState<string>("ALL");
  const [owner, setOwner] = useState<string>("ALL");
  const [appointment, setAppointment] = useState<AppointmentFilter>("ALL");
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("NEWEST");
  const [pendingQuickAction, setPendingQuickAction] = useState<string | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState("");

  const allSources = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(s.source ?? "—"));
    return Array.from(set).sort();
  }, [submissions]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) =>
      (s.tags ?? []).forEach((tagValue) => set.add(tagValue)),
    );
    return Array.from(set).sort();
  }, [submissions]);

  // Stable "now" snapshot taken on mount; filter ranges are coarse (7d/30d/90d)
  // so a per-mount epoch is plenty and keeps the memo deterministic for lint.
  const [nowSnapshot] = useState(() => Date.now());

  const statusCounts = useMemo(() => {
    const counts = new Map<SubmissionStatus, number>();
    STATUS_ORDER.forEach((item) => counts.set(item, 0));
    submissions.forEach((submission) => {
      counts.set(submission.status, (counts.get(submission.status) ?? 0) + 1);
    });
    return counts;
  }, [submissions]);

  const upcomingAppointments = useMemo(() => {
    return submissions
      .filter((submission) => {
        if (!submission.preferredAppointmentAt) return false;
        return (
          new Date(submission.preferredAppointmentAt).getTime() >= nowSnapshot
        );
      })
      .sort(
        (a, b) =>
          new Date(a.preferredAppointmentAt ?? 0).getTime() -
          new Date(b.preferredAppointmentAt ?? 0).getTime(),
      )
      .slice(0, 4);
  }, [submissions, nowSnapshot]);

  const sourceStats = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((submission) => {
      const key = submission.utmCampaign || submission.source || "Website";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [submissions]);

  const filtered = useMemo(() => {
    const days =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
    const cutoff = days ? nowSnapshot - days * 86_400_000 : null;
    const term = search.trim().toLowerCase();

    return submissions
      .filter((submission) => {
        if (status !== "ALL" && submission.status !== status) return false;
        if (source !== "ALL" && (submission.source ?? "—") !== source)
          return false;
        if (tag !== "ALL" && !(submission.tags ?? []).includes(tag))
          return false;
        if (owner !== "ALL") {
          if (owner === "_unassigned" && submission.assignedToId) return false;
          if (owner !== "_unassigned" && submission.assignedToId !== owner)
            return false;
        }
        if (quickFilter !== "ALL") {
          if (
            quickFilter === "NEEDS_ACTION" &&
            !["NEW", "FOLLOW_UP"].includes(submission.status)
          ) {
            return false;
          }
          if (quickFilter === "UNASSIGNED" && submission.assignedToId)
            return false;
          if (quickFilter === "HAS_MESSAGE" && !submission.message)
            return false;
          if (
            quickFilter === "CAMPAIGN" &&
            !submission.utmCampaign &&
            !submission.utmSource
          ) {
            return false;
          }
        }
        if (appointment !== "ALL") {
          const rawAppointment = submission.preferredAppointmentAt;
          const appointmentTime = rawAppointment
            ? new Date(rawAppointment).getTime()
            : null;
          if (appointment === "WITH_DATE" && !appointmentTime) return false;
          if (appointment === "NO_DATE" && appointmentTime) return false;
          if (
            appointment === "UPCOMING" &&
            (!appointmentTime || appointmentTime < nowSnapshot)
          )
            return false;
          if (appointment === "TODAY") {
            if (!appointmentTime) return false;
            const day = new Date(appointmentTime);
            const now = new Date(nowSnapshot);
            if (
              day.getFullYear() !== now.getFullYear() ||
              day.getMonth() !== now.getMonth() ||
              day.getDate() !== now.getDate()
            ) {
              return false;
            }
          }
        }
        if (cutoff && new Date(submission.createdAt).getTime() < cutoff)
          return false;
        if (term) {
          const haystack = [
            submission.fullName,
            submission.phone,
            submission.email ?? "",
            submission.serviceLabel ?? "",
            submission.preferredAppointmentAt ?? "",
            submission.appointmentNotes ?? "",
            submission.notes ?? "",
            submission.source ?? "",
            submission.utmSource ?? "",
            submission.utmMedium ?? "",
            submission.utmCampaign ?? "",
            submission.message ?? "",
            (submission.tags ?? []).join(" "),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortMode === "OLDEST") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (sortMode === "APPOINTMENT") {
          const aTime = a.preferredAppointmentAt
            ? new Date(a.preferredAppointmentAt).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bTime = b.preferredAppointmentAt
            ? new Date(b.preferredAppointmentAt).getTime()
            : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        }
        if (sortMode === "NAME") {
          return a.fullName.localeCompare(b.fullName, "ar");
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [
    submissions,
    status,
    source,
    tag,
    owner,
    appointment,
    range,
    search,
    quickFilter,
    sortMode,
    nowSnapshot,
  ]);

  const clearFilters = () => {
    setStatus("ALL");
    setSearch("");
    setSource("ALL");
    setTag("ALL");
    setOwner("ALL");
    setAppointment("ALL");
    setRange("all");
    setQuickFilter("ALL");
    setSortMode("NEWEST");
  };

  const parseApiMessage = async (response: Response, fallback: string) => {
    try {
      const payload = (await response.json()) as { message?: string };
      return payload.message || fallback;
    } catch {
      return fallback;
    }
  };

  const updateStatus = async (
    submission: CrmRecord,
    nextStatus: SubmissionStatus,
  ) => {
    const actionKey = `${submission.id}:${nextStatus}`;
    setPendingQuickAction(actionKey);
    setActionMessage("");
    try {
      const formData = new FormData();
      formData.set("id", submission.id);
      formData.set("status", nextStatus);
      formData.set("notes", submission.notes ?? "");
      formData.set("fullName", submission.fullName);
      formData.set("phone", submission.phone);
      formData.set("email", submission.email ?? "");
      formData.set(
        "preferredAppointmentAt",
        submission.preferredAppointmentAt ?? "",
      );
      formData.set("appointmentNotes", submission.appointmentNotes ?? "");
      formData.set("serviceSlug", submission.serviceSlug ?? "");
      formData.set("assignedToId", submission.assignedToId ?? "");
      formData.set("tagsCsv", (submission.tags ?? []).join(","));

      const response = await fetch("/api/admin/crm", {
        method: "PUT",
        body: formData,
        headers: { accept: "application/json", "x-requested-with": "fetch" },
      });
      const message = await parseApiMessage(
        response,
        response.ok ? "Status updated." : "Could not update status.",
      );
      setActionMessage(message);
      if (response.ok) router.refresh();
    } catch {
      setActionMessage("تعذر الاتصال بالخادم. / Could not reach the server.");
    } finally {
      setPendingQuickAction(null);
    }
  };

  const deleteLead = async (id: string) => {
    setPendingQuickAction(`${id}:delete`);
    setActionMessage("");
    try {
      const response = await fetch(
        `/api/admin/crm?id=${encodeURIComponent(id)}&type=lead`,
        {
          method: "DELETE",
          headers: { accept: "application/json", "x-requested-with": "fetch" },
        },
      );
      const message = await parseApiMessage(
        response,
        response.ok ? "Lead deleted." : "Could not delete lead.",
      );
      setActionMessage(message);
      if (response.ok) router.refresh();
    } catch {
      setActionMessage("تعذر الاتصال بالخادم. / Could not reach the server.");
    } finally {
      setPendingQuickAction(null);
    }
  };

  return (
    <div className="grid gap-4">
      <section className="admin-crm-command">
        <div className="admin-crm-command__main">
          <p className="admin-crm-command__eyebrow">CRM command center</p>
          <h2>
            <span className="lang-ar">
              متابعة الطلبات من أول رسالة حتى الحجز
            </span>
            <span className="lang-en">
              Lead follow-up from first message to booking
            </span>
          </h2>
          <div className="admin-crm-pipeline" aria-label="Lead pipeline">
            {STATUS_ORDER.map((item) => {
              const count = statusCounts.get(item) ?? 0;
              const ratio = submissions.length
                ? Math.round((count / submissions.length) * 100)
                : 0;
              return (
                <button
                  key={item}
                  type="button"
                  className={`admin-crm-pipeline__stage ${status === item ? "is-active" : ""} ${statusTone(item)}`}
                  onClick={() => setStatus(status === item ? "ALL" : item)}
                >
                  <span>{STATUS_AR[item]}</span>
                  <strong>{count}</strong>
                  <small>{ratio}%</small>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="admin-crm-command__side">
          <div>
            <p className="admin-crm-command__eyebrow">Next appointments</p>
            {upcomingAppointments.length ? (
              <ul className="admin-crm-mini-list">
                {upcomingAppointments.map((lead) => (
                  <li key={lead.id}>
                    <span>{lead.fullName}</span>
                    <strong>
                      {formatAppointment(lead.preferredAppointmentAt)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-crm-empty">No upcoming appointments</p>
            )}
          </div>
          <div>
            <p className="admin-crm-command__eyebrow">Top sources</p>
            {sourceStats.length ? (
              <div className="admin-crm-source-bars">
                {sourceStats.map(([label, count]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setSearch(label);
                      setQuickFilter("ALL");
                    }}
                  >
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className="admin-crm-empty">No sources yet</p>
            )}
          </div>
        </aside>
      </section>

      <div className="admin-card">
        <div className="admin-card__body grid gap-3">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] md:items-end">
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">بحث</span>
                <span className="lang-en">Search</span>
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="اسم / جوال / بريد / ملاحظات…"
                className="admin-input"
              />
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">المواعيد</span>
                <span className="lang-en">Appointments</span>
              </span>
              <select
                className="admin-input"
                value={appointment}
                onChange={(event) =>
                  setAppointment(event.target.value as AppointmentFilter)
                }
              >
                <option value="ALL">All</option>
                <option value="WITH_DATE">With date</option>
                <option value="TODAY">Today</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="NO_DATE">No date</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">المصدر</span>
                <span className="lang-en">Source</span>
              </span>
              <select
                className="admin-input"
                value={source}
                onChange={(event) => setSource(event.target.value)}
              >
                <option value="ALL">All</option>
                {allSources.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">الوسم</span>
                <span className="lang-en">Tag</span>
              </span>
              <select
                className="admin-input"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                <option value="ALL">All</option>
                {allTags.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">المسؤول</span>
                <span className="lang-en">Owner</span>
              </span>
              <select
                className="admin-input"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
              >
                <option value="ALL">All</option>
                <option value="_unassigned">Unassigned</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="admin-field-label">
                <span className="lang-ar">فرز</span>
                <span className="lang-en">Sort</span>
              </span>
              <select
                className="admin-input"
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as SortMode)
                }
              >
                <option value="NEWEST">Newest</option>
                <option value="OLDEST">Oldest</option>
                <option value="APPOINTMENT">Appointment</option>
                <option value="NAME">Name</option>
              </select>
            </label>
            <div className="text-sm font-medium">
              {filtered.length}
              <span className="text-muted-foreground ms-1 text-xs">
                / {submissions.length}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="admin-segmented" role="tablist">
              {(["ALL", ...Object.keys(STATUS_AR)] as FilterStatus[]).map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setStatus(value)}
                    className={status === value ? "is-active" : ""}
                  >
                    {value === "ALL"
                      ? "All"
                      : STATUS_EN[value as SubmissionStatus]}
                  </button>
                ),
              )}
            </div>
            <div className="admin-segmented">
              {(
                [
                  { id: "ALL", label: "All leads" },
                  { id: "NEEDS_ACTION", label: "Needs action" },
                  { id: "UNASSIGNED", label: "Unassigned" },
                  { id: "HAS_MESSAGE", label: "Has message" },
                  { id: "CAMPAIGN", label: "Campaign" },
                ] as const
              ).map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setQuickFilter(option.id)}
                  className={quickFilter === option.id ? "is-active" : ""}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="admin-segmented">
              {(
                [
                  { id: "7d", label: "7d" },
                  { id: "30d", label: "30d" },
                  { id: "90d", label: "90d" },
                  { id: "all", label: "All" },
                ] as const
              ).map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setRange(option.id)}
                  className={range === option.id ? "is-active" : ""}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              onClick={clearFilters}
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-3">
        {actionMessage ? (
          <p className="text-muted-foreground px-2 text-xs">{actionMessage}</p>
        ) : null}
        {filtered.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-sm">
            <span className="lang-ar">لا توجد طلبات تطابق الفلاتر.</span>
            <span className="lang-en">No leads match the current filters.</span>
          </p>
        ) : null}
        {filtered.map((submission) => (
          <details
            key={submission.id}
            className={`admin-crm-lead ${statusTone(submission.status)}`}
          >
            <summary className="admin-crm-lead__summary">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">
                    {submission.fullName}
                  </p>
                  <span className="admin-crm-lead__age">
                    {formatRelative(submission.createdAt)}
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {submission.phone}
                    {submission.email ? ` · ${submission.email}` : ""}
                    {submission.serviceLabel
                      ? ` · ${submission.serviceLabel}`
                      : ""}
                  </p>
                  {submission.message ? (
                    <p className="admin-crm-lead__message">
                      {submission.message}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`admin-status-badge ${STATUS_BADGE[submission.status]}`}
                >
                  <span className="lang-ar">
                    {STATUS_AR[submission.status]}
                  </span>
                  <span className="lang-en">
                    {STATUS_EN[submission.status]}
                  </span>
                </span>
                <span className="admin-chip">{submission.source}</span>
                {submission.preferredAppointmentAt ? (
                  <span className="admin-chip is-accent">
                    {formatAppointment(submission.preferredAppointmentAt)}
                  </span>
                ) : null}
                {submission.assignedToName ? (
                  <span className="admin-chip">
                    {submission.assignedToName}
                  </span>
                ) : null}
                {(submission.tags ?? []).slice(0, 3).map((tagValue) => (
                  <span key={tagValue} className="admin-tag-chip">
                    {tagValue}
                  </span>
                ))}
                {submission.utmCampaign ? (
                  <span className="admin-chip is-accent">
                    {submission.utmCampaign}
                  </span>
                ) : null}
              </div>
            </summary>
            <div className="admin-crm-lead__meta">
              <span>Created: {formatDateOnly(submission.createdAt)}</span>
              <span>Owner: {submission.assignedToName ?? "Unassigned"}</span>
              <span>Source: {submission.source}</span>
              {submission.utmSource ? (
                <span>UTM: {submission.utmSource}</span>
              ) : null}
              {submission.comments.length ? (
                <span>Notes: {submission.comments.length}</span>
              ) : null}
            </div>
            <div className="admin-card__body grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS_AR) as SubmissionStatus[]).map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={
                          pendingQuickAction === `${submission.id}:${value}`
                        }
                        onClick={() => void updateStatus(submission, value)}
                        className={`admin-btn-secondary text-xs ${submission.status === value ? "border-[color:var(--admin-accent)] text-[color:var(--admin-accent)]" : ""}`}
                      >
                        {STATUS_EN[value]}
                      </button>
                    ),
                  )}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void deleteLead(submission.id);
                  }}
                >
                  <AdminConfirmSubmitButton
                    className="admin-btn-danger text-xs"
                    disabled={pendingQuickAction === `${submission.id}:delete`}
                    titleArabic="حذف الطلب"
                    titleEnglish="Delete lead"
                    messageArabic="سيتم حذف هذا الطلب نهائيًا مع سجل المتابعة المرتبط به."
                    messageEnglish="This lead and its follow-up history will be permanently deleted."
                    confirmArabic="حذف نهائي"
                    confirmEnglish="Delete"
                  >
                    <span className="lang-ar">حذف الطلب</span>
                    <span className="lang-en">Delete lead</span>
                  </AdminConfirmSubmitButton>
                </form>
              </div>
              <CrmSubmissionEditor
                submission={submission}
                services={services}
                staff={staff}
                {...(submission.serviceId
                  ? {
                      currentServiceSlug: submission.serviceSlug,
                    }
                  : {})}
              />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
