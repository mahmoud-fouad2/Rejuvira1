import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { ProcedureCountdown } from "@/components/portal/ProcedureCountdown";
import {
  IconCalendarCheck,
  IconClipboardCheck,
  IconDocumentText,
  IconMessageDots,
  IconSparkle,
} from "@/components/portal/PortalIcons";
import {
  PatientSummaryCard,
  PortalCard,
  PortalEmptyState,
  PortalPageHeader,
} from "@/components/portal/PortalUi";
import {
  appointmentStatusLabels,
  formatDate,
  procedureStatusLabels,
} from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { getPortalSettings } from "@/lib/portal/settings";
import { prisma } from "@/lib/prisma";

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

  // eslint-disable-next-line react-hooks/purity -- this dashboard is request-time sensitive.
  const currentTime = Date.now();
  const upcoming =
    patient.procedures.find(
      (procedure) =>
        procedure.procedureDate &&
        procedure.procedureDate.getTime() > currentTime - 86_400_000 &&
        (procedure.status === "SCHEDULED" || procedure.status === "DRAFT"),
    ) ?? null;
  const featured = upcoming ?? patient.procedures[0] ?? null;
  const nextAppointment = patient.appointments[0] ?? null;
  const completedChecklist =
    featured?.checklistItems.filter((item) => item.patientCompletedAt).length ?? 0;
  const totalChecklist = featured?.checklistItems.length ?? 0;
  const hasBannerCopy = Boolean(
    portalSettings.portalBannerTitle.trim() || portalSettings.portalBannerBody.trim(),
  );

  return (
    <div className="portal-dashboard">
      <PortalPageHeader
        eyebrow="Rejuvera Care"
        title={
          <>
            <span className="lang-ar">أهلاً {patient.fullNameAr}</span>
            <span className="lang-en">
              Welcome{patient.fullNameEn ? `, ${patient.fullNameEn}` : ""}
            </span>
          </>
        }
        description={
          <>
            <span className="lang-ar">
              لوحة رعاية مختصرة تجمع تعليماتك، موعدك القادم، الرسائل والمستندات في مكان واحد.
            </span>
            <span className="lang-en">
              Your care dashboard with instructions, appointments, messages and documents in one place.
            </span>
          </>
        }
      />

      {portalSettings.portalBannerEnabled ? (
        <section
          className={`portal-announcement-card${portalSettings.portalBannerImageUrl ? " portal-announcement-card--image" : ""}`}
        >
          {portalSettings.portalBannerImageUrl ? (
            <div
              className="portal-announcement-card__image"
              style={{ backgroundImage: `url("${portalSettings.portalBannerImageUrl}")` }}
              aria-hidden="true"
            />
          ) : null}
          {hasBannerCopy ? (
            <div className="portal-announcement-card__copy">
              <span className="portal-announcement-card__icon" aria-hidden="true">
                <IconSparkle />
              </span>
              {portalSettings.portalBannerTitle ? (
                <h2>{portalSettings.portalBannerTitle}</h2>
              ) : null}
              {portalSettings.portalBannerBody ? (
                <p>{portalSettings.portalBannerBody}</p>
              ) : null}
            </div>
          ) : null}
          {portalSettings.portalBannerCtaLabel && portalSettings.portalBannerCtaHref ? (
            <PortalPromoLink
              href={portalSettings.portalBannerCtaHref}
              label={portalSettings.portalBannerCtaLabel}
            />
          ) : null}
        </section>
      ) : null}

      <section className="portal-summary-grid" aria-label="ملخص حساب المريض">
        <PatientSummaryCard
          label="رسائل جديدة"
          value={patient.messages.length}
          hint="ردود غير مقروءة من الفريق"
          icon={<IconMessageDots />}
          href="/portal/messages"
        />
        <PatientSummaryCard
          label="مستندات"
          value={patient.documents.length}
          hint="ملفات متاحة للعرض والتنزيل"
          icon={<IconDocumentText />}
          href="/portal/documents"
        />
        <PatientSummaryCard
          label="مواعيد قادمة"
          value={patient.appointments.length}
          hint={nextAppointment ? formatDate(nextAppointment.appointmentDate) : "لا يوجد موعد قريب"}
          icon={<IconCalendarCheck />}
        />
        <PatientSummaryCard
          label="تعليمات"
          value={patient.procedures.length}
          hint={featured ? "آخر ملف رعاية مضاف" : "لم تُضف عملية بعد"}
          icon={<IconClipboardCheck />}
          href={featured ? `/portal/procedures/${featured.id}` : undefined}
        />
      </section>

      <section className="portal-dashboard-grid">
        <div className="portal-dashboard-grid__main">
          {featured ? (
            <PortalCard
              title={upcoming ? "العملية القادمة" : "آخر تعليمات متاحة"}
              description="راجع التفاصيل الأساسية والتعليمات المنشورة من المركز."
              action={
                <span className="portal-status-pill">
                  {procedureStatusLabels[featured.status]}
                </span>
              }
            >
              <div className="portal-procedure-card">
                <div>
                  <h2>
                    {featured.customProcedureName ||
                      featured.template?.nameAr ||
                      "إجراء طبي"}
                  </h2>
                  <p>
                    {featured.doctor?.nameAr || featured.surgeonName || "فريق ريجوفيرا"}
                    {featured.procedureDate ? ` · ${formatDate(featured.procedureDate)}` : ""}
                    {featured.procedureTime ? ` · ${featured.procedureTime}` : ""}
                  </p>
                </div>
                {upcoming?.procedureDate ? (
                  <ProcedureCountdown targetIso={upcoming.procedureDate.toISOString()} />
                ) : null}
              </div>

              {totalChecklist > 0 ? (
                <ChecklistProgress done={completedChecklist} total={totalChecklist} />
              ) : (
                <p className="portal-muted-note">
                  ستظهر قائمة المهام هنا عند إضافة تعليمات أو خطوات متابعة لهذه العملية.
                </p>
              )}

              <div className="portal-action-row">
                <Link
                  href={`/portal/procedures/${featured.id}` as Route}
                  className="portal-btn portal-btn--primary"
                >
                  عرض التعليمات
                </Link>
                <Link href={"/portal/messages" as Route} className="portal-btn portal-btn--secondary">
                  إرسال سؤال
                </Link>
              </div>

              {!featured.instructionsPublishedAt ? (
                <p className="portal-muted-note">
                  تعليمات هذه العملية قيد الإعداد، وسيخبرك المركز عند نشرها.
                </p>
              ) : null}
            </PortalCard>
          ) : (
            <PortalEmptyState
              icon={<IconClipboardCheck />}
              title="لا توجد عملية مسجلة بعد"
              description="عند إضافة العملية من المركز ستظهر هنا التعليمات، المواعيد، والمستندات المرتبطة بها."
            />
          )}

          {patient.appointments.length > 0 ? (
            <PortalCard title="المواعيد القادمة" description="متابعة سريعة لمواعيدك المؤكدة أو المجدولة.">
              <ul className="portal-list">
                {patient.appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <div>
                      <strong>
                        {formatDate(appointment.appointmentDate)}
                        {appointment.appointmentTime ? ` · ${appointment.appointmentTime}` : ""}
                      </strong>
                      <span>
                        {appointment.appointmentType ?? "متابعة"}
                        {appointment.doctor?.nameAr ? ` · ${appointment.doctor.nameAr}` : ""}
                      </span>
                    </div>
                    <span className="portal-status-pill">
                      {appointmentStatusLabels[appointment.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </PortalCard>
          ) : null}
        </div>

        <aside className="portal-dashboard-grid__side">
          <PortalCard title="بطاقة المريض" description="معلومات مختصرة للرجوع السريع." compact>
            <dl className="portal-profile-list">
              <div>
                <dt>رقم الملف</dt>
                <dd dir="ltr">{patient.fileNumber}</dd>
              </div>
              <div>
                <dt>الجوال</dt>
                <dd dir="ltr">{maskPhone(patient.phone)}</dd>
              </div>
              <div>
                <dt>آخر دخول</dt>
                <dd>{formatDate(patient.lastLoginAt)}</dd>
              </div>
            </dl>
          </PortalCard>

          <PortalCard title="آخر ما تحتاج مراجعته" compact>
            <ul className="portal-care-list">
              <li>
                <span>1</span>
                <p>افتح التعليمات قبل العملية وبعدها وتأكد من اكتمال الخطوات.</p>
              </li>
              <li>
                <span>2</span>
                <p>راجع المستندات الجديدة واحفظ الملفات المهمة.</p>
              </li>
              <li>
                <span>3</span>
                <p>أرسل سؤالك للفريق من الرسائل بدل الاعتماد على محادثات متفرقة.</p>
              </li>
            </ul>
          </PortalCard>
        </aside>
      </section>

      {patient.procedures.length > 1 ? (
        <PortalCard title="عمليات أخرى" description="ملفات الرعاية السابقة أو الإضافية.">
          <ul className="portal-list">
            {patient.procedures
              .filter((procedure) => procedure.id !== featured?.id)
              .map((procedure) => (
                <li key={procedure.id}>
                  <Link href={`/portal/procedures/${procedure.id}` as Route}>
                    <strong>
                      {procedure.customProcedureName ||
                        procedure.template?.nameAr ||
                        "إجراء طبي"}
                    </strong>
                    <span>{formatDate(procedure.procedureDate)}</span>
                  </Link>
                  <span className="portal-status-pill">
                    {procedureStatusLabels[procedure.status]}
                  </span>
                </li>
              ))}
          </ul>
        </PortalCard>
      ) : null}
    </div>
  );
}

function PortalPromoLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith("/");
  if (isInternal) {
    return (
      <Link href={href as Route} className="portal-btn portal-btn--primary">
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className="portal-btn portal-btn--primary" target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function ChecklistProgress({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="portal-checklist-progress">
      <div>
        <span>قائمة المهام</span>
        <strong dir="ltr">
          {done}/{total} ({percent}%)
        </strong>
      </div>
      <div
        className="portal-checklist-progress__bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "•••";
  return `${digits.slice(0, 4)}•••${digits.slice(-2)}`;
}
