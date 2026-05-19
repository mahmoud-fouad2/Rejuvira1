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

  const filtered = useMemo(() => {
    const days =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
    const cutoff = days ? nowSnapshot - days * 86_400_000 : null;
    const term = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      if (status !== "ALL" && submission.status !== status) return false;
      if (source !== "ALL" && (submission.source ?? "—") !== source)
        return false;
      if (tag !== "ALL" && !(submission.tags ?? []).includes(tag)) return false;
      if (owner !== "ALL") {
        if (owner === "_unassigned" && submission.assignedToId) return false;
        if (owner !== "_unassigned" && submission.assignedToId !== owner)
          return false;
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
          (submission.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
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
    nowSnapshot,
  ]);

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
      <div className="admin-card">
        <div className="admin-card__body grid gap-3">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-end">
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
          <details key={submission.id} className="admin-card !block">
            <summary className="admin-card__header cursor-pointer">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">
                    {submission.fullName}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {submission.phone}
                    {submission.email ? ` · ${submission.email}` : ""}
                    {submission.serviceLabel
                      ? ` · ${submission.serviceLabel}`
                      : ""}
                  </p>
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
              </div>
            </summary>
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
