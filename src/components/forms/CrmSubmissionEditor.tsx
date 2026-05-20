"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmissionStatus } from "@prisma/client";

import {
  addCrmCommentAction,
  deleteCrmCommentAction,
  updateCrmSubmissionAction,
  type CrmActionState,
} from "@/app/admin/crm/actions";
import {
  APPOINTMENT_TIME_OPTIONS,
  buildAppointmentDateOptions,
} from "@/lib/appointment-slots";
import type { CrmRecord } from "@/lib/content-repository";

const initialState: CrmActionState = { status: "idle", message: "" };

const STATUS_OPTIONS: Array<{
  value: SubmissionStatus;
  ar: string;
}> = [
  { value: SubmissionStatus.NEW, ar: "جديد" },
  { value: SubmissionStatus.CONTACTED, ar: "تم التواصل" },
  { value: SubmissionStatus.FOLLOW_UP, ar: "متابعة" },
  { value: SubmissionStatus.BOOKED, ar: "محجوز" },
  { value: SubmissionStatus.CLOSED, ar: "مغلق" },
];

function formatDate(iso: string) {
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
  canDeleteComments?: boolean | undefined;
};

export function CrmSubmissionEditor({
  submission,
  services,
  staff,
  currentServiceSlug,
  canDeleteComments = false,
}: CrmSubmissionEditorProps) {
  const [state, formAction, isPending] = useActionState(
    updateCrmSubmissionAction,
    initialState,
  );
  const [commentState, commentAction, commentPending] = useActionState(
    addCrmCommentAction,
    initialState,
  );

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

  const addTag = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (tags.includes(value)) return;
    setTags([...tags, value]);
  };
  const removeTag = (value: string) => {
    setTags(tags.filter((tag) => tag !== value));
  };

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="id" value={submission.id} />
        <input type="hidden" name="tagsCsv" value={tags.join(",")} />
        <input
          type="hidden"
          name="preferredAppointmentAt"
          value={appointmentValue}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1">
            <span className="admin-field-label">الاسم الكامل</span>
            <input
              name="fullName"
              defaultValue={submission.fullName}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">الجوال</span>
            <input
              name="phone"
              defaultValue={submission.phone}
              className="admin-input"
            />
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">البريد الإلكتروني</span>
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
            <span className="admin-field-label">تاريخ الموعد</span>
            <select
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="admin-input"
            >
              <option value="">بدون موعد</option>
              {appointmentDateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">الوقت</span>
            <select
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="admin-input"
              disabled={!appointmentDate}
            >
              {APPOINTMENT_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">ملاحظات الموعد</span>
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
            <span className="admin-field-label">الحالة</span>
            <select
              name="status"
              defaultValue={submission.status}
              className="admin-input"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.ar}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="admin-field-label">الخدمة</span>
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
            <span className="admin-field-label">المسؤول</span>
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
          <span className="admin-field-label">الوسوم</span>
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
              placeholder="اكتب الوسم ثم Enter"
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
                إضافة
              </button>
            ) : null}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="admin-field-label">ملاحظات داخلية</span>
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
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
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
            <div className="admin-card__subtitle">سجل النشاط</div>
            <div className="admin-card__title">سجل التعليقات الداخلية</div>
          </div>
        </div>
        <div className="admin-card__body grid gap-3">
          <form action={commentAction} className="grid gap-2">
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
                إضافة ملاحظة
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
              لا توجد ملاحظات داخلية بعد.
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
                    {canDeleteComments ? (
                      <form action={deleteCrmCommentAction}>
                        <input type="hidden" name="id" value={comment.id} />
                        <button
                          type="submit"
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          حذف
                        </button>
                      </form>
                    ) : null}
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
    </div>
  );
}
