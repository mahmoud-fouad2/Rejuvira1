import Link from "next/link";
import type { Route } from "next";

import { IntegrationToolCard } from "@/components/admin/IntegrationToolCard";
import { listIntegrationTools } from "@/lib/integration-tools";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminIntegrationToolsPage() {
  const tools = await listIntegrationTools();
  const activeCount = tools.filter((t) => t.isActive).length;
  const inactiveCount = tools.length - activeCount;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">التكاملات</span>
            <span className="lang-en">Integrations</span>
          </h1>
          <p>
            <span className="lang-ar">
              أدوات مخصصة يستخدمها وكيل الذكاء الاصطناعي خلال المكالمات والمحادثات.
            </span>
            <span className="lang-en">
              Custom tools your AI agent can use during calls and chats.
            </span>
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link
            href={"/admin/integration-tools/new" as Route}
            className="admin-btn-primary"
          >
            <span className="lang-ar">+ تكامل جديد</span>
            <span className="lang-en">+ New Integration</span>
          </Link>
        </div>
      </div>

      <section className="admin-kpi-grid--compact mb-4">
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">
            <span className="lang-ar">الكل</span>
            <span className="lang-en">Total</span>
          </span>
          <strong>{tools.length}</strong>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">
            <span className="lang-ar">مفعّل</span>
            <span className="lang-en">Active</span>
          </span>
          <strong>{activeCount}</strong>
        </div>
        <div className="admin-kpi-card">
          <span className="admin-kpi-card__label">
            <span className="lang-ar">متوقف</span>
            <span className="lang-en">Inactive</span>
          </span>
          <strong>{inactiveCount}</strong>
        </div>
      </section>

      {tools.length === 0 ? (
        <div className="rv-itool-empty">
          <h2>
            <span className="lang-ar">لا توجد تكاملات بعد</span>
            <span className="lang-en">No integrations yet</span>
          </h2>
          <p>
            <span className="lang-ar">
              ابدأ بإنشاء أول أداة كي يستطيع الذكاء الاصطناعي الاتصال بأنظمتك.
            </span>
            <span className="lang-en">
              Create your first tool so the AI can call your systems.
            </span>
          </p>
          <Link
            href={"/admin/integration-tools/new" as Route}
            className="admin-btn-primary"
          >
            <span className="lang-ar">+ تكامل جديد</span>
            <span className="lang-en">+ New Integration</span>
          </Link>
        </div>
      ) : (
        <div className="rv-itool-grid">
          {tools.map((tool) => (
            <IntegrationToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
