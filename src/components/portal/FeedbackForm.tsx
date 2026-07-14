"use client";

import { useActionState, useState } from "react";

import {
  submitFeedbackAction,
  type PortalPatientActionState,
} from "@/app/portal/actions";

const initialState: PortalPatientActionState = { status: "idle", message: "" };

function StarInput({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(0);
  return (
    <fieldset className="grid gap-1">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={star}
              required={required}
              className="sr-only"
              onChange={() => setValue(star)}
            />
            <span
              aria-hidden
              className={`text-2xl ${star <= value ? "" : "opacity-25"}`}
            >
              ★
            </span>
            <span className="sr-only">{star} من 5</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FeedbackForm({
  procedureId,
  googleReviewUrl,
}: {
  procedureId: string;
  googleReviewUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitFeedbackAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="grid gap-3">
        <p className="border-emerald/25 bg-emerald/10 text-emerald rounded-2xl border px-4 py-3 text-sm">
          {state.message}
        </p>
        {googleReviewUrl ? (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noreferrer"
            className="border-border rounded-full border px-5 py-2.5 text-center text-sm font-semibold"
          >
            <span className="lang-ar">يسعدنا أيضًا تقييمك على Google (اختياري)</span>
            <span className="lang-en">You can also review us on Google (optional)</span>
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="procedureId" value={procedureId} />

      <StarInput name="overallRating" label="تقييمك العام لتجربتك" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <StarInput name="careRating" label="التعامل والرعاية" />
        <StarInput name="instructionsRating" label="وضوح التعليمات" />
        <StarInput name="communicationRating" label="سهولة التواصل" />
        <StarInput name="cleanlinessRating" label="النظافة (اختياري)" />
      </div>

      <label className="grid gap-1">
        <span className="text-sm font-semibold">
          <span className="lang-ar">انطباعك (اختياري)</span>
          <span className="lang-en">Your comments (optional)</span>
        </span>
        <textarea
          name="comment"
          rows={3}
          maxLength={4000}
          className="field-public"
          placeholder="شاركنا ما أعجبك أو ما يمكن تحسينه..."
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="permissionToContact" value="1" className="mt-1" />
        <span>
          <span className="lang-ar">أرغب بتواصل من إدارة المركز بشأن ملاحظاتي.</span>
          <span className="lang-en">I would like management to contact me about my feedback.</span>
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="permissionToPublish" value="1" className="mt-1" />
        <span>
          <span className="lang-ar">
            أسمح باستخدام رأيي لأغراض التحسين والتسويق بعد إخفاء هويتي بالكامل.
          </span>
          <span className="lang-en">
            My anonymized feedback may be used for improvement and marketing.
          </span>
        </span>
      </label>

      {state.status === "error" ? (
        <p className="rounded-2xl border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.08)] px-4 py-3 text-sm text-[oklch(38%_0.08_15)]">
          {state.message}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-ink text-canvas rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="lang-ar">جاري الإرسال...</span>
              <span className="lang-en">Sending...</span>
            </>
          ) : (
            <>
              <span className="lang-ar">إرسال التقييم</span>
              <span className="lang-en">Submit feedback</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
