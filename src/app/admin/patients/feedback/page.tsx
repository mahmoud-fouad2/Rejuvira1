import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { FeedbackStatus } from "@prisma/client";

import { auth } from "@/auth";
import {
  EmptyState,
  FilterBar,
  PageHeader,
} from "@/components/admin/patients/PatientDesignSystem";
import { IconStar } from "@/components/admin/patients/PatientModuleIcons";
import { PatientsSubNav } from "@/components/admin/patients/PatientsSubNav";
import { setFeedbackStatusAction } from "../actions";
import { feedbackStatusLabels, formatDateTime } from "@/lib/portal/labels";
import { hasPortalCapability } from "@/lib/portal/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PatientFeedbackPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([auth(), props.searchParams]);
  const role = session?.user?.role;
  if (!hasPortalCapability(role, "feedback.view")) {
    redirect("/forbidden");
  }
  const canManage = hasPortalCapability(role, "feedback.manage");

  const status = typeof params.status === "string" ? params.status : "";
  const lowOnly = params.low === "1";

  const feedback = await prisma.patientFeedback.findMany({
    where: {
      ...(status && (Object.values(FeedbackStatus) as string[]).includes(status)
        ? { status: status as FeedbackStatus }
        : {}),
      ...(lowOnly ? { overallRating: { lte: 2 } } : {}),
    },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    take: 200,
    include: {
      patient: { select: { id: true, fullNameAr: true, fileNumber: true } },
      procedure: {
        select: {
          id: true,
          customProcedureName: true,
          template: { select: { nameAr: true } },
        },
      },
    },
  });

  return (
    <div className="patient-module-page patient-module-page--refined">
      <PageHeader
        eyebrow="Feedback"
        title="تقييمات المرضى"
        description="التقييمات لا تنشر تلقائيًا. راجع التجربة، تعامل مع التقييمات المنخفضة، ثم أغلقها عند اكتمال المتابعة."
      />
      <PatientsSubNav active="feedback" role={role} />

      <FilterBar title="تصفية التقييمات" description="اعزل التقييمات الجديدة أو المنخفضة حتى لا تضيع الحالات الحساسة.">
        <form method="get" className="patient-filter-grid patient-filter-grid--compact">
          <label>
            <span className="admin-field-label">الحالة</span>
            <select name="status" defaultValue={status} className="admin-input">
              <option value="">الكل</option>
              {Object.entries(feedbackStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="patient-check-control">
            <input type="checkbox" name="low" value="1" defaultChecked={lowOnly} />
            <span>المنخفضة فقط (2 فأقل)</span>
          </label>
          <div className="patient-filter-actions">
            <button type="submit" className="admin-btn-secondary">
              تصفية
            </button>
            <Link href={"/admin/patients/feedback" as Route} className="admin-btn-ghost">
              إعادة تعيين
            </Link>
          </div>
        </form>
      </FilterBar>

      {feedback.length === 0 ? (
        <EmptyState
          icon={<IconStar />}
          title="لا توجد تقييمات مطابقة"
          description="عند إرسال تقييم من المريض سيظهر هنا مع درجات التجربة والتواصل والتعليمات."
          action={
            <Link href={"/admin/patients" as Route} className="admin-btn-primary">
              فتح سجل المرضى
            </Link>
          }
        />
      ) : (
        <section className="patient-feedback-grid">
          {feedback.map((item) => (
            <article
              key={item.id}
              className={`admin-card patient-feedback-card ${item.overallRating <= 2 ? "is-danger-soft" : ""}`}
            >
              <header className="patient-feedback-card__header">
                <div>
                  <strong className="patient-feedback-card__rating">
                    <span aria-label={`${item.overallRating} من 5`}>
                      {"★".repeat(item.overallRating)}
                      <span className="admin-text-faint">
                        {"★".repeat(Math.max(0, 5 - item.overallRating))}
                      </span>
                    </span>
                    <b dir="ltr">{item.overallRating}/5</b>
                  </strong>
                  <p>
                    <Link href={`/admin/patients/${item.patient.id}` as Route}>
                      {item.patient.fullNameAr}
                    </Link>{" "}
                    · ملف {item.patient.fileNumber} ·{" "}
                    {item.procedure.customProcedureName ||
                      item.procedure.template?.nameAr ||
                      "عملية"}{" "}
                    · {formatDateTime(item.submittedAt)}
                  </p>
                </div>
                <span className="admin-status-badge">
                  {feedbackStatusLabels[item.status]}
                </span>
              </header>

              <dl className="patient-feedback-card__scores">
                {item.careRating ? (
                  <div>
                    <dt>التعامل</dt>
                    <dd>{item.careRating}/5</dd>
                  </div>
                ) : null}
                {item.communicationRating ? (
                  <div>
                    <dt>التواصل</dt>
                    <dd>{item.communicationRating}/5</dd>
                  </div>
                ) : null}
                {item.instructionsRating ? (
                  <div>
                    <dt>وضوح التعليمات</dt>
                    <dd>{item.instructionsRating}/5</dd>
                  </div>
                ) : null}
                {item.cleanlinessRating ? (
                  <div>
                    <dt>النظافة</dt>
                    <dd>{item.cleanlinessRating}/5</dd>
                  </div>
                ) : null}
              </dl>

              {item.comment ? <p className="patient-feedback-card__comment">{item.comment}</p> : null}

              <p className="patient-feedback-card__permissions">
                موافقة على التواصل: {item.permissionToContact ? "نعم" : "لا"} · موافقة على النشر بعد إخفاء الهوية:{" "}
                {item.permissionToPublish ? "نعم" : "لا"}
              </p>

              {canManage ? (
                <div className="patient-inline-actions">
                  {(["REVIEWED", "CONTACTED", "CLOSED"] as const)
                    .filter((value) => value !== item.status)
                    .map((value) => (
                      <form key={value} action={setFeedbackStatusAction}>
                        <input type="hidden" name="feedbackId" value={item.id} />
                        <input type="hidden" name="status" value={value} />
                        <button type="submit" className="admin-btn-ghost">
                          تعليم كـ {feedbackStatusLabels[value]}
                        </button>
                      </form>
                    ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
