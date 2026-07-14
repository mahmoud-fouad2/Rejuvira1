import { redirect } from "next/navigation";

import { formatDate } from "@/lib/portal/labels";
import { getPatientSession } from "@/lib/portal/patient-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const session = await getPatientSession();
  if (!session) redirect("/patient-login");

  const documents = await prisma.patientDocument.findMany({
    where: {
      patientId: session.patientId,
      visibility: "PATIENT_VISIBLE",
      archivedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-bold">
          <span className="lang-ar">مستنداتي</span>
          <span className="lang-en">My documents</span>
        </h1>
        <p className="mt-1 text-sm opacity-75">
          <span className="lang-ar">
            المستندات التي شاركها معك المركز بشكل آمن.
          </span>
          <span className="lang-en">
            Documents the clinic has securely shared with you.
          </span>
        </p>
      </section>

      {documents.length === 0 ? (
        <section className="border-border rounded-3xl border border-dashed p-8 text-center text-sm opacity-70">
          <span className="lang-ar">لا توجد مستندات متاحة لك حاليًا.</span>
          <span className="lang-en">No documents available yet.</span>
        </section>
      ) : (
        <section className="grid gap-3">
          {documents.map((document) => (
            <article
              key={document.id}
              className="border-border flex flex-wrap items-center justify-between gap-3 rounded-3xl border p-4"
            >
              <div>
                <p className="font-semibold">{document.title}</p>
                <p className="text-xs opacity-70">
                  {document.documentType} · {formatDate(document.createdAt)}
                  {document.expiresAt
                    ? ` · متاح حتى ${formatDate(document.expiresAt)}`
                    : ""}
                </p>
              </div>
              <a
                href={`/api/portal/documents/${document.id}`}
                target="_blank"
                rel="noreferrer"
                className="border-border rounded-full border px-5 py-2 text-sm font-semibold"
              >
                <span className="lang-ar">عرض / تنزيل</span>
                <span className="lang-en">View / download</span>
              </a>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
