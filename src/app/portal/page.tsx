import Link from "next/link";
import type { Route } from "next";

import { ProcedureCountdown } from "@/components/portal/ProcedureCountdown";
import {
  appointmentStatusLabels,
  formatDate,
  procedureStatusLabels,
} from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { getPortalSettings } from "@/lib/portal/settings";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalHomePage() {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");

  const [patient, portalSettings] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: session.patientId },
      include: {
      procedures: {
        where: { archivedAt: null },
        orderBy: [{ procedureDate: "desc" }, { createdAt: "desc" }],
        include: {
          doctor: { select: { nameAr: true } },
          template: { select: { nameAr: true } },
          checklistItems: {
            select: { id: true, patientCompletedAt: true },
          },
        },
      },
      appointments: {
        where: {
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          appointmentDate: { gte: new Date() },
        },
        orderBy: { appointmentDate: "asc" },
        take: 3,
        include: { doctor: { select: { nameAr: true } } },
      },
      messages: {
        where: { senderType: "STAFF", readAt: null },
        select: { id: true },
      },
      documents: {
        where: { visibility: "PATIENT_VISIBLE", archivedAt: null },
        select: { id: true },
      },
      },
    }),
    getPortalSettings(),
  ]);
  if (!patient) redirect("/patient-login");



// eslint-disable-next-line react-hooks/purity -- current server request time
const currentTime = Date.now();
  const upcoming =
    patient.procedures.find(
      (procedure) =>
        procedure.procedureDate &&
        procedure.procedureDate.getTime() > currentTime - 86_400_000 &&
        (procedure.status === "SCHEDULED" || procedure.status === "DRAFT"),
    ) ?? null;
  const featured = upcoming ?? patient.procedures[0] ?? null;

  return (
    <div className="patient-portal-dashboard">
      <section className="patient-portal-hero">
        <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
          <span className="lang-ar">بوابة رعاية Rejuvera</span>
          <span className="lang-en">Rejuvera care portal</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          <span className="lang-ar">أهلًا {patient.fullNameAr} 🌿</span>
          <span className="lang-en">
            Welcome{patient.fullNameEn ? `, ${patient.fullNameEn}` : ""} 🌿
          </span>
        </h1>
        <p className="mt-1 text-sm opacity-75">
          <span className="lang-ar">
            هنا تجد تعليمات عمليتك ومواعيدك ورسائلك في مكان واحد.
          </span>
          <span className="lang-en">
            Your instructions, appointments and messages in one place.
          </span>
        </p>
      </section>

      {portalSettings.portalBannerEnabled ? (
        <section
          className="patient-portal-promo"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.94), rgba(255,255,255,.78), rgba(255,255,255,.18)), url("${portalSettings.portalBannerImageUrl || "/media/portal/patient-portal-banner.png"}")`,
          }}
        >
          <div className="patient-portal-promo__copy">
            <span className="patient-portal-card__icon" aria-hidden="true">
              R
            </span>
            <h2>{portalSettings.portalBannerTitle}</h2>
            <p>{portalSettings.portalBannerBody}</p>
          </div>
          {portalSettings.portalBannerCtaLabel &&
          portalSettings.portalBannerCtaHref ? (
            <PortalPromoLink
              href={portalSettings.portalBannerCtaHref}
              label={portalSettings.portalBannerCtaLabel}
            />
          ) : null}
        </section>
      ) : null}

      {featured ? (
        <section className="patient-featured-procedure border-border rounded-3xl border bg-white/75 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase opacity-60">
                <span className="lang-ar">
                  {upcoming ? "عمليتك القادمة" : "آخر عملية"}
                </span>
                <span className="lang-en">
                  {upcoming ? "Upcoming procedure" : "Latest procedure"}
                </span>
              </p>
              <h2 className="mt-1 text-xl font-bold">
                {featured.customProcedureName ||
                  featured.template?.nameAr ||
                  "إجراء"}
              </h2>
              <p className="mt-1 text-sm opacity-80">
                {featured.doctor?.nameAr || featured.surgeonName || ""}
                {featured.procedureDate
                  ? ` · ${formatDate(featured.procedureDate)}`
                  : ""}
                {featured.procedureTime ? ` · ${featured.procedureTime}` : ""}
              </p>
              <p className="mt-1 text-sm">
                <span className="border-border inline-block rounded-full border px-3 py-0.5 text-xs">
                  {procedureStatusLabels[featured.status]}
                </span>
              </p>
            </div>
            {upcoming?.procedureDate ? (
              <ProcedureCountdown
                targetIso={upcoming.procedureDate.toISOString()}
              />
            ) : null}
          </div>

          {featured.checklistItems.length > 0 ? (
            <div className="mt-4">
              <ChecklistProgress
                done={
                  featured.checklistItems.filter(
                    (item) => item.patientCompletedAt,
                  ).length
                }
                total={featured.checklistItems.length}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/portal/procedures/${featured.id}` as Route}
              className="bg-ink text-canvas rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              <span className="lang-ar">عرض التعليمات الكاملة</span>
              <span className="lang-en">View full instructions</span>
            </Link>
            <Link
              href={"/portal/messages" as Route}
              className="border-border rounded-full border px-5 py-2.5 text-sm font-semibold"
            >
              <span className="lang-ar">أرسل سؤالًا للفريق</span>
              <span className="lang-en">Ask the team</span>
            </Link>
          </div>

          {!featured.instructionsPublishedAt ? (
            <p className="mt-3 text-sm opacity-70">
              <span className="lang-ar">
                تعليمات هذه العملية قيد الإعداد — سيخبرك المركز عند نشرها.
              </span>
              <span className="lang-en">
                Instructions are being prepared — the clinic will let you know
                when they are ready.
              </span>
            </p>
          ) : null}
          <ul className="patient-timeline">
            <li>
              <span>
                <strong>
                  <span className="lang-ar">تم تسجيل العملية</span>
                  <span className="lang-en">Procedure registered</span>
                </strong>
                <span className="block text-sm opacity-70">
                  {formatDate(featured.createdAt)}
                </span>
              </span>
            </li>
            <li>
              <span>
                <strong>
                  <span className="lang-ar">حالة العملية</span>
                  <span className="lang-en">Current status</span>
                </strong>
                <span className="block text-sm opacity-70">
                  {procedureStatusLabels[featured.status]}
                </span>
              </span>
            </li>
            {featured.instructionsPublishedAt ? (
              <li>
                <span>
                  <strong>
                    <span className="lang-ar">التعليمات متاحة</span>
                    <span className="lang-en">Instructions available</span>
                  </strong>
                  <span className="block text-sm opacity-70">
                    {formatDate(featured.instructionsPublishedAt)}
                  </span>
                </span>
              </li>
            ) : null}
          </ul>
        </section>
      ) : (
        <section className="border-border rounded-3xl border border-dashed bg-white/70 p-8 text-center shadow-sm">
          <p className="font-semibold">
            <span className="lang-ar">لا توجد عمليات مسجلة لك بعد.</span>
            <span className="lang-en">No procedures on file yet.</span>
          </p>
          <p className="mt-1 text-sm opacity-70">
            <span className="lang-ar">
              لم تتم إضافة أي عملية لحسابك بعد. عند إضافة العملية من المركز ستظهر التعليمات والمتابعات هنا.
            </span>
            <span className="lang-en">
              Once the clinic adds your procedure, its details will appear
              here.
            </span>
          </p>
        </section>
      )}

      <section className="patient-care-path" aria-label="مسار الرعاية">
        <article>
          <span aria-hidden="true">1</span>
          <div>
            <strong>
              <span className="lang-ar">راجع التعليمات</span>
              <span className="lang-en">Review instructions</span>
            </strong>
            <p>
              <span className="lang-ar">
                اقرأ خطوات ما قبل وبعد العملية واحفظ المستندات المهمة.
              </span>
              <span className="lang-en">
                Read your care steps and keep important documents handy.
              </span>
            </p>
          </div>
        </article>
        <article>
          <span aria-hidden="true">2</span>
          <div>
            <strong>
              <span className="lang-ar">تابع المواعيد</span>
              <span className="lang-en">Track appointments</span>
            </strong>
            <p>
              <span className="lang-ar">
                ستظهر مواعيد المتابعة القادمة وأي تحديثات من المركز هنا.
              </span>
              <span className="lang-en">
                Your upcoming follow-ups and clinic updates stay visible here.
              </span>
            </p>
          </div>
        </article>
        <article>
          <span aria-hidden="true">3</span>
          <div>
            <strong>
              <span className="lang-ar">تواصل عند الحاجة</span>
              <span className="lang-en">Message when needed</span>
            </strong>
            <p>
              <span className="lang-ar">
                أرسل سؤالك للفريق بدل البحث عن أرقام أو تعليمات متفرقة.
              </span>
              <span className="lang-en">
                Ask the care team directly without hunting for scattered details.
              </span>
            </p>
          </div>
        </article>
      </section>

      <section className="patient-portal-cards">
        <Link
          href={"/portal/messages" as Route}
          className="patient-portal-card transition-shadow hover:shadow-md"
        >
          <span className="patient-portal-card__icon" aria-hidden="true">M</span>
          <strong>{patient.messages.length}</strong>
          <p className="text-sm opacity-75">
            <span className="lang-ar">ردود جديدة من الفريق</span>
            <span className="lang-en">New replies from the team</span>
          </p>
        </Link>
        <Link
          href={"/portal/documents" as Route}
          className="patient-portal-card transition-shadow hover:shadow-md"
        >
          <span className="patient-portal-card__icon" aria-hidden="true">D</span>
          <strong>{patient.documents.length}</strong>
          <p className="text-sm opacity-75">
            <span className="lang-ar">مستندات متاحة لك</span>
            <span className="lang-en">Documents available</span>
          </p>
        </Link>
        <div className="patient-portal-card">
          <span className="patient-portal-card__icon" aria-hidden="true">F</span>
          <strong>{patient.appointments.length}</strong>
          <p className="text-sm opacity-75">
            <span className="lang-ar">مواعيد متابعة قادمة</span>
            <span className="lang-en">Upcoming follow-ups</span>
          </p>
        </div>
        <Link
          href={featured ? (`/portal/procedures/${featured.id}` as Route) : ("/portal" as Route)}
          className="patient-portal-card transition-shadow hover:shadow-md"
        >
          <span className="patient-portal-card__icon" aria-hidden="true">I</span>
          <strong>{patient.procedures.length}</strong>
          <p className="text-sm opacity-75">
            <span className="lang-ar">تعليماتي</span>
            <span className="lang-en">My instructions</span>
          </p>
        </Link>
      </section>

      {patient.appointments.length > 0 ? (
        <section className="border-border rounded-3xl border p-5">
          <h2 className="font-bold">
            <span className="lang-ar">مواعيدك القادمة</span>
            <span className="lang-en">Your upcoming appointments</span>
          </h2>
          <ul className="mt-3 grid gap-2">
            {patient.appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm"
              >
                <span className="font-semibold">
                  {formatDate(appointment.appointmentDate)}
                  {appointment.appointmentTime
                    ? ` · ${appointment.appointmentTime}`
                    : ""}
                </span>
                <span className="opacity-75">
                  {appointment.appointmentType ?? "متابعة"}
                  {appointment.doctor?.nameAr
                    ? ` · ${appointment.doctor.nameAr}`
                    : ""}
                </span>
                <span className="border-border rounded-full border px-3 py-0.5 text-xs">
                  {appointmentStatusLabels[appointment.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {patient.procedures.length > 1 ? (
        <section className="border-border rounded-3xl border p-5">
          <h2 className="font-bold">
            <span className="lang-ar">عملياتك الأخرى</span>
            <span className="lang-en">Other procedures</span>
          </h2>
          <ul className="mt-3 grid gap-2">
            {patient.procedures
              .filter((procedure) => procedure.id !== featured?.id)
              .map((procedure) => (
                <li key={procedure.id}>
                  <Link
                    href={`/portal/procedures/${procedure.id}` as Route}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm transition-shadow hover:shadow-md"
                  >
                    <span className="font-semibold">
                      {procedure.customProcedureName ||
                        procedure.template?.nameAr ||
                        "إجراء"}
                    </span>
                    <span className="opacity-75">
                      {formatDate(procedure.procedureDate)}
                    </span>
                    <span className="border-border rounded-full border px-3 py-0.5 text-xs">
                      {procedureStatusLabels[procedure.status]}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PortalPromoLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith("/");
  const className = "patient-portal-promo__cta";
  if (isInternal) {
    return (
      <Link href={href as Route} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function ChecklistProgress({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          <span className="lang-ar">قائمة مهامك</span>
          <span className="lang-en">Your checklist</span>
        </span>
        <span className="opacity-75" dir="ltr">
          {done}/{total} ({percent}%)
        </span>
      </div>
      <div
        className="border-border mt-2 h-2.5 overflow-hidden rounded-full border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-ink h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
