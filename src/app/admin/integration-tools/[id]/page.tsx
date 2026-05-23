import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { IntegrationToolForm } from "@/components/admin/IntegrationToolForm";
import {
  getIntegrationTool,
  listIntegrationLogs,
} from "@/lib/integration-tools";

export const dynamic = "force-dynamic";

export default async function EditIntegrationToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tool, logs] = await Promise.all([
    getIntegrationTool(id),
    listIntegrationLogs(id, 10),
  ]);
  if (!tool) {
    notFound();
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">تعديل التكامل</span>
            <span className="lang-en">Edit Integration</span>
          </h1>
          <p>{tool.name}</p>
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
      <IntegrationToolForm tool={tool} initialLogs={logs} />
    </>
  );
}
