import Link from "next/link";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";

import { FeedbackForm } from "@/components/portal/FeedbackForm";
import {
  acknowledgeInstructionsAction,
  toggleChecklistItemAction,
} from "../../actions";
import {
  appointmentStatusLabels,
  checklistPhaseLabels,
  formatDate,
  formatDateTime,
  procedureStatusLabels,
} from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { renderPlaceholders } from "@/lib/portal/placeholders";
import { getPortalSettings } from "@/lib/portal/settings";
import { getRuntimeSettings } from "@/lib/content-repository";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalProcedurePage(props: {
  params: Promise<{ id: string }>;
}) {
  const [session, params] = await Promise.all([
    getPatientSession(),
    props.params,
  ]);
  if (!session) redirect("/patient-login");

  // Ownership enforced in the query itself — another patient's procedure id
  // simply returns 404.
  const procedure = await prisma.procedure.findFirst({
    where: {
      id: params.id,
      patientId: session.patientId,
      archivedAt: null,
    },
    include: {
      patient: { select: { fullNameAr: true, fileNumber: true } },
      doctor: { select: { nameAr: true } },
      template: { select: { nameAr: true } },
      appointments: { orderBy: { appointmentDate: "asc" } },
      checklistItems: {
        orderBy: [{ phase: "asc" }, { sortOrder: "asc" }],
      },
      feedback: { where: { patientId: session.patientId } },
    },
  });
  if (!procedure) notFound();

  const [portalSettings, runtimeSettings] = await Promise.all([
    getPortalSettings(),
    getRuntimeSettings(),
  ]);

  const name =
    procedure.customProcedureName || procedure.template?.nameAr || "إجراء";
  const nextFollowUp = procedure.appointments.find(
    (appointment) =>
      appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED",
  );
  const placeholderContext = {
    patientName: procedure.patient.fullNameAr,
    fileNumber: procedure.patient.fileNumber,
    procedureName: name,
    procedureDate: procedure.procedureDate
      ? formatDate(procedure.procedureDate)
      : null,
    procedureTime: procedure.procedureTime,
    doctorName: procedure.doctor?.nameAr || procedure.surgeonName,
    arrivalTime: procedure.arrivalTime,
    followUpDate: nextFollowUp ? formatDate(nextFollowUp.appointmentDate) : null,
    clinicPhone: runtimeSettings.contact.phone,
    additionalNotes: procedure.patientVisibleNotes,
  };

  const published = Boolean(procedure.instructionsPublishedAt);
  const needsReacknowledge =
    published &&
    procedure.instructionsAcknowledgedAt !== null &&
    (procedure.acknowledgedVersion ?? 0) < procedure.instructionsVersion;
  const acknowledgedCurrent =
    published &&
    procedure.instructionsAcknowledgedAt !== null &&
    (procedure.acknowledgedVersion ?? 0) >= procedure.instructionsVersion;

  const sections = [
    { title: "قبل العملية", titleEn: "Before your procedure", body: procedure.preOperationInstructions },
    { title: "يوم العملية", titleEn: "On the day", body: procedure.operationDayInstructions },
    { title: "بعد العملية", titleEn: "After your procedure", body: procedure.postOperationInstructions },
    { title: "علامات تستدعي التواصل مع المركز", titleEn: "When to contact us", body: procedure.warningSigns },
    { title: "المتابعة", titleEn: "Follow-up", body: procedure.followUpInstructions },
  ].filter((section) => section.body?.trim());

  const checklistByPhase = new Map<string, typeof procedure.checklistItems>();
  for (const item of procedure.checklistItems) {
    const list = checklistByPhase.get(item.phase) ?? [];
    list.push(item);
    checklistByPhase.set(item.phase, list);
  }

  const showFeedback =
    (procedure.status === "COMPLETED" || procedure.status === "FOLLOW_UP") &&
    procedure.feedback.length === 0;

  return (
    <div className="grid gap-6">
      <nav className="text-sm opacity-70">
        <Link href={"/portal" as Route} className="underline">
          <span className="lang-ar">الرئيسية</span>
          <span className="lang-en">Home</span>
        </Link>{" "}
        / {name}
      </nav>

      <section className="border-border rounded-3xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="mt-1 text-sm opacity-80">
              {procedure.doctor?.nameAr || procedure.surgeonName || ""}
              {procedure.procedureDate
                ? ` · ${formatDate(procedure.procedureDate)}`
                : ""}
              {procedure.procedureTime ? ` · ${procedure.procedureTime}` : ""}
              {procedure.location ? ` · ${procedure.location}` : ""}
            </p>
          </div>
          <span className="border-border rounded-full border px-3 py-1 text-xs">
            {procedureStatusLabels[procedure.status]}
          </span>
        </div>
        {published ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`/api/portal/procedures/${procedure.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="border-border rounded-full border px-4 py-2 text-sm font-semibold"
            >
              <span className="lang-ar">طباعة / تنزيل PDF</span>
              <span className="lang-en">Print / download PDF</span>
            </a>
            <span className="self-center text-xs opacity-60">
              <span className="lang-ar">
                إصدار التعليمات {procedure.instructionsVersion} · آخر تحديث{" "}
                {formatDate(procedure.updatedAt)}
              </span>
              <span className="lang-en">
                Instructions v{procedure.instructionsVersion} · updated{" "}
                {formatDate(procedure.updatedAt)}
              </span>
            </span>
          </div>
        ) : null}
      </section>

      {!published ? (
        <section className="border-border rounded-3xl border border-dashed p-8 text-center">
          <p className="font-semibold">
            <span className="lang-ar">تعليمات عمليتك قيد الإعداد.</span>
            <span className="lang-en">Your instructions are being prepared.</span>
          </p>
          <p className="mt-1 text-sm opacity-70">
            <span className="lang-ar">سيخبرك المركز فور نشرها هنا.</span>
            <span className="lang-en">The clinic will notify you once published.</span>
          </p>
        </section>
      ) : (
        <>
          {needsReacknowledge ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="lang-ar">
                تم تحديث التعليمات منذ آخر اطلاع لك — يرجى قراءتها مرة أخرى ثم
                تأكيد الاطلاع بالأسفل.
              </span>
              <span className="lang-en">
                Instructions changed since you last read them — please review
                and confirm again below.
              </span>
            </div>
          ) : null}

          {sections.map((section) => (
            <section
              key={section.title}
              className="border-border rounded-3xl border p-5"
            >
              <h2 className="font-bold">
                <span className="lang-ar">{section.title}</span>
                <span className="lang-en">{section.titleEn}</span>
              </h2>
              <div className="mt-2 text-[0.95rem] leading-7 whitespace-pre-wrap">
                {renderPlaceholders(section.body, placeholderContext)}
              </div>
            </section>
          ))}

          {procedure.patientVisibleNotes ? (
            <section className="border-border rounded-3xl border p-5">
              <h2 className="font-bold">
                <span className="lang-ar">ملاحظات من فريقك الطبي</span>
                <span className="lang-en">Notes from your care team</span>
              </h2>
              <p className="mt-2 text-[0.95rem] leading-7 whitespace-pre-wrap">
                {procedure.patientVisibleNotes}
              </p>
            </section>
          ) : null}

          <section className="border-border rounded-3xl border p-5">
            {acknowledgedCurrent ? (
              <p className="border-emerald/25 bg-emerald/10 text-emerald rounded-2xl border px-4 py-3 text-sm">
                <span className="lang-ar">
                  أكدت قراءة هذه التعليمات في{" "}
                  {formatDateTime(procedure.instructionsAcknowledgedAt)}. شكرًا
                  لالتزامك.
                </span>
                <span className="lang-en">
                  You confirmed reading these instructions on{" "}
                  {formatDateTime(procedure.instructionsAcknowledgedAt)}.
                </span>
              </p>
            ) : (
              <form action={acknowledgeInstructionsAction} className="grid gap-3">
                <input type="hidden" name="procedureId" value={procedure.id} />
                <p className="text-sm opacity-80">
                  <span className="lang-ar">
                    قراءتك للتعليمات والتزامك بها جزء مهم من سلامتك ونتيجة
                    عمليتك.
                  </span>
                  <span className="lang-en">
                    Reading and following the instructions is an important part
                    of your safety and results.
                  </span>
                </p>
                <div>
                  <button
                    type="submit"
                    className="bg-ink text-canvas rounded-full px-6 py-2.5 text-sm font-semibold"
                  >
                    <span className="lang-ar">قرأت التعليمات وفهمتها ✓</span>
                    <span className="lang-en">I have read and understood ✓</span>
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}

      {procedure.checklistItems.length > 0 ? (
        <section className="border-border rounded-3xl border p-5">
          <h2 className="font-bold">
            <span className="lang-ar">قائمة مهامك</span>
            <span className="lang-en">Your checklist</span>
          </h2>
          <div className="mt-3 grid gap-4">
            {Array.from(checklistByPhase.entries()).map(([phase, items]) => (
              <div key={phase}>
                <h3 className="text-sm font-semibold opacity-70">
                  {checklistPhaseLabels[phase as keyof typeof checklistPhaseLabels]}
                </h3>
                <ul className="mt-2 grid gap-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <form
                        action={toggleChecklistItemAction}
                        className="border-border flex items-start gap-3 rounded-2xl border px-4 py-3"
                      >
                        <input type="hidden" name="itemId" value={item.id} />
                        <input
                          type="hidden"
                          name="completed"
                          value={item.patientCompletedAt ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          role="checkbox"
                          aria-checked={Boolean(item.patientCompletedAt)}
                          aria-label={item.title}
                          className={`border-border mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                            item.patientCompletedAt ? "bg-ink text-canvas" : ""
                          }`}
                        >
                          {item.patientCompletedAt ? "✓" : ""}
                        </button>
                        <div className="text-sm">
                          <p
                            className={`font-semibold ${item.patientCompletedAt ? "line-through opacity-60" : ""}`}
                          >
                            {item.title}
                            {item.isRequired ? (
                              <span className="ms-1 text-xs opacity-60">
                                (إلزامية)
                              </span>
                            ) : null}
                          </p>
                          {item.description ? (
                            <p className="opacity-75">{item.description}</p>
                          ) : null}
                          {item.dueDate ? (
                            <p className="text-xs opacity-60">
                              قبل {formatDate(item.dueDate)}
                            </p>
                          ) : null}
                        </div>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {procedure.appointments.length > 0 ? (
        <section className="border-border rounded-3xl border p-5">
          <h2 className="font-bold">
            <span className="lang-ar">مواعيد المتابعة</span>
            <span className="lang-en">Follow-up appointments</span>
          </h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {procedure.appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3"
              >
                <span className="font-semibold">
                  {formatDate(appointment.appointmentDate)}
                  {appointment.appointmentTime
                    ? ` · ${appointment.appointmentTime}`
                    : ""}
                </span>
                <span className="opacity-75">
                  {appointment.appointmentType ?? "متابعة"}
                </span>
                <span className="border-border rounded-full border px-3 py-0.5 text-xs">
                  {appointmentStatusLabels[appointment.status]}
                </span>
                {appointment.patientVisibleNotes ? (
                  <p className="w-full text-xs opacity-70">
                    {appointment.patientVisibleNotes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showFeedback ? (
        <section className="border-border rounded-3xl border p-5">
          <h2 className="font-bold">
            <span className="lang-ar">قيّم تجربتك</span>
            <span className="lang-en">Rate your experience</span>
          </h2>
          <p className="mt-1 mb-4 text-sm opacity-75">
            <span className="lang-ar">
              تقييمك يصل لإدارة المركز مباشرة ولا يُنشر في أي مكان دون إذنك
              الصريح.
            </span>
            <span className="lang-en">
              Your feedback goes directly to management and is never published
              without your explicit permission.
            </span>
          </p>
          <FeedbackForm
            procedureId={procedure.id}
            googleReviewUrl={portalSettings.googleReviewUrl}
          />
        </section>
      ) : null}

      <p className="rounded-2xl border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.06)] px-4 py-3 text-sm">
        <span className="lang-ar">
          هذه الصفحة ليست مخصصة للحالات الطارئة. في الحالات الطارئة اتصل
          بخدمات الطوارئ فورًا
          {runtimeSettings.contact.phone
            ? ` أو بالمركز على ${runtimeSettings.contact.phone}`
            : ""}
          .
        </span>
        <span className="lang-en">
          This page is not for emergencies. In an emergency, call emergency
          services immediately.
        </span>
      </p>
    </div>
  );
}
