import { redirect } from "next/navigation";

import { PatientMessageForm } from "@/components/portal/PatientMessageForm";
import {
  formatDateTime,
  messageCategoryLabel,
  messageStatusLabels,
} from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { getRuntimeSettings } from "@/lib/content-repository";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalMessagesPage() {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");

  const [messages, procedures, runtimeSettings] = await Promise.all([
    prisma.patientMessage.findMany({
      where: { patientId: session.patientId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.procedure.findMany({
      where: { patientId: session.patientId, archivedAt: null },
      select: {
        id: true,
        customProcedureName: true,
        template: { select: { nameAr: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getRuntimeSettings(),
  ]);

  // Mark staff replies as read once the patient opens the page.
  await prisma.patientMessage.updateMany({
    where: {
      patientId: session.patientId,
      senderType: "STAFF",
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold">
          <span className="lang-ar">رسائلي</span>
          <span className="lang-en">My messages</span>
        </h1>
        <p className="mt-1 text-sm opacity-75">
          <span className="lang-ar">
            أرسل أسئلتك للفريق الطبي وسيصلك الرد هنا.
          </span>
          <span className="lang-en">
            Send your questions to the care team and replies appear here.
          </span>
        </p>
      </section>

      <p className="rounded-2xl border border-[rgba(92,45,62,0.22)] bg-[rgba(92,45,62,0.06)] px-4 py-3 text-sm">
        <span className="lang-ar">
          هذه الرسائل ليست مخصصة للحالات الطارئة. في الحالات الطارئة تواصل مع
          خدمات الطوارئ المناسبة
          {runtimeSettings.contact.phone
            ? ` أو اتصل بالمركز على ${runtimeSettings.contact.phone}`
            : ""}
          .
        </span>
        <span className="lang-en">
          These messages are not for emergencies. In an emergency, contact
          emergency services.
        </span>
      </p>

      <section className="border-border rounded-3xl border p-5">
        <h2 className="mb-4 font-bold">
          <span className="lang-ar">رسالة جديدة</span>
          <span className="lang-en">New message</span>
        </h2>
        <PatientMessageForm
          procedures={procedures.map((procedure) => ({
            id: procedure.id,
            label:
              procedure.customProcedureName ||
              procedure.template?.nameAr ||
              "إجراء",
          }))}
        />
      </section>

      {messages.length > 0 ? (
        <section className="grid gap-3">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-3xl border p-4 ${
                message.senderType === "STAFF"
                  ? "border-emerald/25 bg-emerald/5"
                  : "border-border"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
                <span>
                  {message.senderType === "PATIENT" ? (
                    <>
                      <span className="lang-ar">أنت</span>
                      <span className="lang-en">You</span>
                    </>
                  ) : (
                    <>
                      <span className="lang-ar">فريق ريجوفيرا</span>
                      <span className="lang-en">Rejuvera team</span>
                    </>
                  )}{" "}
                  · {messageCategoryLabel(message.category)}
                </span>
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {message.message}
              </p>
              {message.senderType === "PATIENT" ? (
                <p className="mt-2 text-xs opacity-60">
                  <span className="lang-ar">
                    الحالة: {messageStatusLabels[message.status]}
                  </span>
                  <span className="lang-en">
                    Status: {messageStatusLabels[message.status]}
                  </span>
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="border-border rounded-3xl border border-dashed p-8 text-center text-sm opacity-70">
          <span className="lang-ar">لا توجد رسائل بعد — رسالتك الأولى تصل للفريق فورًا.</span>
          <span className="lang-en">No messages yet.</span>
        </section>
      )}
    </div>
  );
}
