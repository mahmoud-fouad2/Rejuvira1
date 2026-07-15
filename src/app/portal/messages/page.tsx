import { redirect } from "next/navigation";

import { PatientMessageForm } from "@/components/portal/PatientMessageForm";
import { IconMessageDots } from "@/components/portal/PortalIcons";
import {
  MessageThread,
  PortalEmptyState,
  PortalPageHeader,
} from "@/components/portal/PortalUi";
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

  await prisma.patientMessage.updateMany({
    where: {
      patientId: session.patientId,
      senderType: "STAFF",
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const chronologicalMessages = [...messages].reverse();

  return (
    <div className="portal-page">
      <PortalPageHeader
        eyebrow="Messages"
        title={
          <>
            <span className="lang-ar">رسائلي</span>
            <span className="lang-en">My messages</span>
          </>
        }
        description={
          <>
            <span className="lang-ar">
              مساحة تواصل منظمة مع فريق الرعاية، مع سجل واضح لكل رد وسؤال.
            </span>
            <span className="lang-en">
              A clear care conversation with your clinic team.
            </span>
          </>
        }
      />

      <p className="portal-safety-note">
        هذه الرسائل ليست مخصصة للحالات الطارئة. في الحالات الطارئة تواصل مع خدمات الطوارئ المناسبة
        {runtimeSettings.contact.phone ? ` أو اتصل بالمركز على ${runtimeSettings.contact.phone}` : ""}.
      </p>

      <section className="portal-messages-layout">
        <aside className="portal-inbox-card" aria-label="قائمة الرسائل">
          <div className="portal-inbox-card__header">
            <div>
              <h2>صندوق الرسائل</h2>
              <p>{messages.length} رسالة في السجل</p>
            </div>
          </div>
          {messages.length > 0 ? (
            <ul className="portal-inbox-list">
              {messages.slice(0, 18).map((message) => (
                <li key={message.id}>
                  <div>
                    <strong>
                      {message.senderType === "PATIENT" ? "أنت" : "فريق ريجوفيرا"}
                    </strong>
                    <span>{messageCategoryLabel(message.category)}</span>
                    <p>{message.message}</p>
                  </div>
                  <time dateTime={message.createdAt.toISOString()}>
                    {formatDateTime(message.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="portal-inbox-empty">لا توجد رسائل بعد.</div>
          )}
        </aside>

        <MessageThread
          composer={
            <PatientMessageForm
              procedures={procedures.map((procedure) => ({
                id: procedure.id,
                label:
                  procedure.customProcedureName ||
                  procedure.template?.nameAr ||
                  "إجراء طبي",
              }))}
            />
          }
        >
          {chronologicalMessages.length > 0 ? (
            chronologicalMessages.map((message) => {
              const isPatient = message.senderType === "PATIENT";
              return (
                <article
                  key={message.id}
                  className={
                    isPatient
                      ? "portal-message-bubble is-patient"
                      : "portal-message-bubble is-staff"
                  }
                >
                  <div className="portal-message-bubble__meta">
                    <strong>{isPatient ? "أنت" : "فريق ريجوفيرا"}</strong>
                    <span>{messageCategoryLabel(message.category)}</span>
                    <time dateTime={message.createdAt.toISOString()}>
                      {formatDateTime(message.createdAt)}
                    </time>
                  </div>
                  <p>{message.message}</p>
                  {isPatient ? (
                    <span className="portal-message-bubble__status">
                      الحالة: {messageStatusLabels[message.status]}
                    </span>
                  ) : null}
                </article>
              );
            })
          ) : (
            <PortalEmptyState
              icon={<IconMessageDots />}
              title="ابدأ أول رسالة للفريق"
              description="اكتب سؤالك أو ملاحظتك من النموذج أسفل المحادثة، وسيظهر الرد هنا."
            />
          )}
        </MessageThread>
      </section>
    </div>
  );
}
