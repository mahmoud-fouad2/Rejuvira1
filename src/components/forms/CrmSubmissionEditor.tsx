"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { SubmissionStatus } from "@prisma/client";

import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import {
  APPOINTMENT_TIME_OPTIONS,
  buildAppointmentDateOptions,
} from "@/lib/appointment-slots";
import type { CrmRecord } from "@/lib/content-repository";

const initialState: CrmActionState = { status: "idle", message: "" };

type CrmActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const STATUS_OPTIONS: Array<{
  value: SubmissionStatus;
  ar: string;
  en: string;
}> = [
  { value: SubmissionStatus.NEW, ar: "جديد", en: "New" },
  { value: SubmissionStatus.CONTACTED, ar: "تم التواصل", en: "Contacted" },
  { value: SubmissionStatus.FOLLOW_UP, ar: "متابعة", en: "Follow-up" },
  { value: SubmissionStatus.BOOKED, ar: "محجوز", en: "Booked" },
  { value: SubmissionStatus.CLOSED, ar: "مغلق", en: "Closed" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function splitAppointment(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

export type CrmSubmissionEditorProps = {
  submission: CrmRecord;
  services: ReadonlyArray<{ slug: string; name: string }>;
  staff: ReadonlyArray<{ id: string; name: string }>;
  currentServiceSlug?: string | undefined;
};

export function CrmSubmissionEditor({
  submission,
  services,
  staff,
  currentServiceSlug,
}: CrmSubmissionEditorProps) {
  const router = useRouter();
  const [state, setState] = useState<CrmActionState>(initialState);
  const [commentState, setCommentState] =
    useState<CrmActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const initialTags = useMemo(
    () => [...(submission.tags ?? [])],
    [submission.tags],
  );
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const initialAppointment = useMemo(
    () => splitAppointment(submission.preferredAppointmentAt),
    [submission.preferredAppointmentAt],
  );
  const appointmentDateOptions = useMemo(() => {
    const options = buildAppointmentDateOptions(60);
    if (
      initialAppointment &&
      !options.some((option) => option.value === initialAppointment.date)
    ) {
      return [
        {
          value: initialAppointment.date,
          labelAr: initialAppointment.date,
          labelEn: initialAppointment.date,
        },
        ...options,
      ];
    }
    return options;
  }, [initialAppointment]);
  const [appointmentDate, setAppointmentDate] = useState(
    initialAppointment ? initialAppointment.date : "",
  );
  const [appointmentTime, setAppointmentTime] = useState(
    initialAppointment &&
      APPOINTMENT_TIME_OPTIONS.some(
        (option) => option.value === initialAppointment.time,
      )
      ? initialAppointment.time
      : "14:00",
  );
  const appointmentValue = appointmentDate
    ? `${appointmentDate}T${appointmentTime || "14:00"}`
    : "";
  const phoneDigits = submission.phone.replace(/\D/g, "");
  const whatsappHref = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith("966") ? phoneDigits : `966${phoneDigits.replace(/^0/, "")}`}`
    : "";
  const phoneHref = phoneDigits ? `tel:${phoneDigits}` : "";

  const addTag = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (tags.includes(value)) return;
    setTags([...tags, value]);
  };
  const removeTag = (value: string) => {
    setTags(tags.filter((tag) => tag !== value));
  };

  const parseApiMessage = async (response: Response, fallback: string) => {
    try {
      const payload = (await response.json()) as { message?: string };
      return payload.message || fallback;
    } catch {
      return fallback;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    setState(initialState);
    try {
      const response = await fetch("/api/admin/crm", {
        method: "PUT",
        body: formData,
        headers: { accept: "application/json", "x-requested-with": "fetch" },
      });
      const message = await parseApiMessage(
        response,
        response.ok ? "Lead updated." : "Could not update lead.",
      );
      setState({ status: response.ok ? "success" : "error", message });
      if (response.ok) router.refresh();
    } catch {
      setState({
        status: "error",
        message: "تعذر الاتصال بالخادم. / Could not reach the server.",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setCommentPending(true);
    setCommentState(initialState);
    try {
      const response = await fetch("/api/admin/crm", {
        method: "POST",
        body: formData,
        headers: { accept: "application/json", "x-requested-with": "fetch" },
      });
      const message = await parseApiMessage(
        response,
        response.ok ? "Note added." : "Could not add note.",
      );
      setCommentState({ status: response.ok ? "success" : "error", message });
      if (response.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setCommentState({
        status: "error",
        message: "تعذر الاتصال بالخادم. / Could not reach the server.",
      });
    } finally {
      setCommentPending(false);
    }
  };

  const handleDelete = async (id: string, type: "lead" | "comment") => {
    setDeletePendingId(id);
    try {
      const response = await fetch(
        `/api/admin/crm?id=${encodeURIComponent(id)}&type=${type}`,
        {
          method: "DELETE",
          headers: { accept: "application/json", "x-requested-with": "fetch" },
        },
      );
      const message = await parseApiMessage(
        response,
        response.ok ? "Deleted." : "Could not delete.",
      );
      const nextState = {
        status: response.ok ? ("success" as const) : ("error" as const),
        message,
      };
      if (type === "comment") setCommentState(nextState);
      else setState(nextState);
      if (response.ok) router.refresh();
    } catch {
      const nextState = {
        status: "error" as const,
        message: "تعذر الاتصال بالخادم. / Could not reach the server.",
      };
      if (type === "comment") setCommentState(nextState);
      else setState(nextState);
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input type="hidden" name="id" value={submission.id} />
        <input type="hidden" name="tagsCsv" value={tags.join(",")} />
        <input
          type="hidden"
          name="preferredAppointmentAt"
          value={appointmentValue}
        />

        <div className="admin-crm-editor-brief">
          <div>
            <p>{submission.serviceLabel ?? "General inquiry"}</p>
            <span>{submission.source}</span>
          </div>
          <div className="admin-crm-editor-brief__actions">
            {phoneHref ? (
              <a href={phoneHref} className="admin-btn-secondary text-xs">
                Call
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="admin-btn-secondary text-xs"
              >
                WhatsApp
              </a>
            ) : null}
            {submission.email ? (
              <a
                href={`mailto:${submission.email}`}
                className="admin-btn-secondary text-xs"
              >
                Email
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">الاسم الكامل</span>
              <span className="lang-en">Full name</span>
            </span>
            <input
              name="fullName"
              defaultValue={submission.fullName}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">الجوال</span>
              <span className="lang-en">Phone</span>
            </span>
            <input
              name="phone"
              defaultValue={submission.phone}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">البريد الإلكتروني</span>
              <span className="lang-en">Email</span>
            </span>
            <input
              name="email"
              type="email"
              defaultValue={submission.email ?? ""}
              className="admin-input"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.3fr_0.9fr_2fr]">
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">تاريخ الموعد</span>
              <span className="lang-en">Appointment date</span>
            </span>
            <select
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="admin-input"
            >
              <option value="">بدون موعد · No date</option>
              {appointmentDateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelAr} · {option.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">الوقت</span>
              <span className="lang-en">Time</span>
            </span>
            <select
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="admin-input"
              disabled={!appointmentDate}
            >
              {APPOINTMENT_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelAr} · {option.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">ملاحظات الموعد</span>
              <span className="lang-en">Appointment notes</span>
            </span>
            <input
              name="appointmentNotes"
              defaultValue={submission.appointmentNotes ?? ""}
              className="admin-input"
              placeholder="مثال: تفضل الفترة المسائية أو اتصال قبل التأكيد"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">الحالة</span>
              <span className="lang-en">Status</span>
            </span>
            <select
              name="status"
              defaultValue={submission.status}
              className="admin-input"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.ar} · {option.en}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">
              <span className="lang-ar">الخدمة</span>
              <span className="lang-en">Service</span>
            </span>
            <select
              name="serviceSlug"
              defaultValue={currentServiceSlug ?? ""}
              className="admin-input"
            >
              <option value="">—</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
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
              name="assignedToId"
              defaultValue={submission.assignedToId ?? ""}
              className="admin-input"
            >
              <option value="">—</option>
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          <span className="admin-field-label">
            <span className="lang-ar">الوسوم</span>
            <span className="lang-en">Tags</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span key={tag} className="admin-tag-chip">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
              placeholder="Enter to add"
              className="admin-input min-w-[8rem] flex-1"
            />
            {tagInput.trim() ? (
              <button
                type="button"
                onClick={() => {
                  addTag(tagInput);
                  setTagInput("");
                }}
                className="admin-btn-secondary text-xs"
              >
                <span className="lang-ar">إضافة</span>
                <span className="lang-en">Add</span>
              </button>
            ) : null}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">ملاحظات داخلية</span>
            <span className="lang-en">Internal notes</span>
          </span>
          <textarea
            name="notes"
            defaultValue={submission.notes ?? ""}
            rows={3}
            className="admin-input"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="admin-btn-primary"
            >
              <span className="lang-ar">
                {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </span>
              <span className="lang-en">
                {isPending ? "Saving..." : "Save"}
              </span>
            </button>
          </div>
          {state.message ? (
            <span
              className={`text-sm ${state.status === "error" ? "text-red-500" : "text-emerald-500"}`}
            >
              {state.message}
            </span>
          ) : null}
        </div>
      </form>

      <div
        className="admin-card border !shadow-none"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">Activity</div>
            <div className="admin-card__title">
              <span className="lang-ar">سجل التعليقات الداخلية</span>
              <span className="lang-en">Internal activity log</span>
            </div>
          </div>
        </div>
        <div className="admin-card__body grid gap-3">
          <form onSubmit={handleCommentSubmit} className="grid gap-2">
            <input type="hidden" name="submissionId" value={submission.id} />
            <textarea
              name="body"
              required
              rows={2}
              placeholder="اكتب ملاحظة جديدة…"
              className="admin-input"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="submit"
                disabled={commentPending}
                className="admin-btn-secondary text-xs"
              >
                <span className="lang-ar">إضافة ملاحظة</span>
                <span className="lang-en">Add note</span>
              </button>
              {commentState.message ? (
                <span
                  className={`text-xs ${commentState.status === "error" ? "text-red-500" : "text-emerald-500"}`}
                >
                  {commentState.message}
                </span>
              ) : null}
            </div>
          </form>

          {submission.comments.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              <span className="lang-ar">لا توجد ملاحظات داخلية بعد.</span>
              <span className="lang-en">No internal notes yet.</span>
            </p>
          ) : (
            <ul className="grid gap-2">
              {submission.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--admin-border)",
                    background: "var(--admin-panel-soft)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium">
                        {comment.authorName ?? "—"}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={deletePendingId === comment.id}
                        onClick={() => void handleDelete(comment.id, "comment")}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        <span className="lang-ar">حذف</span>
                        <span className="lang-en">Delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleDelete(submission.id, "lead");
        }}
        className="flex"
      >
        <AdminConfirmSubmitButton
          className="admin-btn-danger text-xs"
          disabled={deletePendingId === submission.id}
          titleArabic="حذف الطلب"
          titleEnglish="Delete lead"
          messageArabic="سيتم حذف هذا الطلب نهائيًا مع سجل المتابعة المرتبط به."
          messageEnglish="This lead and its follow-up history will be permanently deleted."
          confirmArabic="حذف نهائي"
          confirmEnglish="Delete"
        >
          <span className="lang-ar">حذف الطلب نهائيًا</span>
          <span className="lang-en">Delete lead permanently</span>
        </AdminConfirmSubmitButton>
      </form>
    </div>
  );
}
