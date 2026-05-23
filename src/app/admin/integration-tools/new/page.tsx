import Link from "next/link";
import type { Route } from "next";

import { IntegrationToolForm } from "@/components/admin/IntegrationToolForm";

export const dynamic = "force-dynamic";

export default function NewIntegrationToolPage() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">تكامل جديد</span>
            <span className="lang-en">Create Integration</span>
          </h1>
          <p>
            <span className="lang-ar">
              عرّف أداة مخصصة لتوسيع قدرات الوكلاء.
            </span>
            <span className="lang-en">
              Define a custom tool to extend your agents&apos; capabilities.
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href={"/admin/integration-tools" as Route}
            className="admin-btn-secondary"
          >
            <span className="lang-ar">العودة</span>
            <span className="lang-en">Back</span>
          </Link>
        </div>
      </div>
      <IntegrationToolForm />
    </>
  );
}
