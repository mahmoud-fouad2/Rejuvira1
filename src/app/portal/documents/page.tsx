import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { IconDocumentText } from "@/components/portal/PortalIcons";
import {
  DocumentCard,
  PortalEmptyState,
  PortalPageHeader,
} from "@/components/portal/PortalUi";
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
    <div className="portal-page">
      <PortalPageHeader
        eyebrow="Documents"
        title={
          <>
            <span className="lang-ar">مستنداتي</span>
            <span className="lang-en">My documents</span>
          </>
        }
        description={
          <>
            <span className="lang-ar">
              ملفاتك الطبية والإدارية التي شاركها المركز معك بشكل آمن.
            </span>
            <span className="lang-en">
              Secure medical and administrative files shared by the clinic.
            </span>
          </>
        }
      />

      {documents.length === 0 ? (
        <PortalEmptyState
          icon={<IconDocumentText />}
          title="لا توجد مستندات متاحة حاليًا"
          description="عند مشاركة ملف من المركز سيظهر هنا مع تاريخ الإضافة وخيارات العرض والتنزيل."
          action={
            <Link href={"/portal/messages" as Route} className="portal-btn portal-btn--primary">
              اسأل الفريق عن مستند
            </Link>
          }
        />
      ) : (
        <>
          <div className="portal-results-row">
            <span>{documents.length} مستند متاح</span>
            <Link href={"/portal/messages" as Route} className="portal-btn portal-btn--secondary">
              طلب مستند
            </Link>
          </div>
          <section className="portal-documents-grid" aria-label="قائمة المستندات">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                title={document.title}
                type={document.documentType}
                date={formatDate(document.createdAt)}
                source={document.uploadedByName}
                expiresAt={document.expiresAt ? formatDate(document.expiresAt) : null}
                href={`/api/portal/documents/${document.id}`}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
