import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { FeedbackStatus } from "@prisma/client";

import { auth } from "@/auth";
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
    <>
      <div className="admin-page-header">
        <div>
          <h1>تقييمات المرضى</h1>
          <p>
            التقييمات لا تُنشر تلقائيًا. النشر التسويقي يحتاج موافقة صريحة من
            المريض بعد إخفاء هويته.
          </p>
        </div>
      </div>
      <PatientsSubNav active="feedback" role={role} />

      <section className="admin-panel" style={{ marginBlock: "1rem" }}>
        <form
          method="get"
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "end",
            padding: "0.9rem",
          }}
        >
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
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input type="checkbox" name="low" value="1" defaultChecked={lowOnly} />
            <span>المنخفضة فقط (≤2)</span>
          </label>
          <button type="submit" className="admin-btn-secondary">
            تصفية
          </button>
        </form>
      </section>

      {feedback.length === 0 ? (
        <div className="admin-empty-state">
          <p>لا توجد تقييمات مطابقة.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {feedback.map((item) => (
            <article
              key={item.id}
              className={`admin-card ${item.overallRating <= 2 ? "is-danger-soft" : ""}`}
              style={{ padding: "1rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: "1.1em" }}>
                    {"★".repeat(item.overallRating)}
                    <span className="admin-text-faint">
                      {"★".repeat(5 - item.overallRating)}
                    </span>{" "}
                    {item.overallRating}/5
                  </strong>
                  <p className="admin-text-soft" style={{ margin: "0.25rem 0 0" }}>
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
              </div>
              <div
                className="admin-text-soft"
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.4rem", fontSize: "0.82em" }}
              >
                {item.careRating ? <span>التعامل {item.careRating}/5</span> : null}
                {item.communicationRating ? <span>التواصل {item.communicationRating}/5</span> : null}
                {item.instructionsRating ? <span>وضوح التعليمات {item.instructionsRating}/5</span> : null}
                {item.cleanlinessRating ? <span>النظافة {item.cleanlinessRating}/5</span> : null}
              </div>
              {item.comment ? (
                <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>
                  {item.comment}
                </p>
              ) : null}
              <p className="admin-text-faint" style={{ margin: "0.4rem 0 0", fontSize: "0.8em" }}>
                موافقة على التواصل: {item.permissionToContact ? "نعم" : "لا"} ·
                موافقة على النشر بعد إخفاء الهوية:{" "}
                {item.permissionToPublish ? "نعم" : "لا"}
              </p>
              {canManage ? (
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
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
        </div>
      )}
    </>
  );
}
