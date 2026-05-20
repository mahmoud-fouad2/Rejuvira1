import Link from "next/link";
import type { Route } from "next";

import { CustomPageEditorForm } from "@/components/forms/CustomPageEditorForm";
import { HtmlLandingPageUploadForm } from "@/components/forms/HtmlLandingPageUploadForm";
import { getWebhooks } from "@/lib/content-repository";

export default async function NewCustomPagePage() {
  const webhooks = await getWebhooks();
  return (
    <>
      <div className="admin-page-header admin-page-header--hero">
        <div>
          <span className="admin-page-header__eyebrow">PageCraft</span>
          <h1>إنشاء صفحة مخصصة جديدة</h1>
          <p>
            ابنِ صفحة حملة أو lead page بمكونات جاهزة، ثم احفظها فعليًا في قاعدة
            البيانات.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href={"/admin/pages" as Route} className="admin-btn-secondary">
            رجوع للقائمة
          </Link>
        </div>
      </div>

      <HtmlLandingPageUploadForm />
      <CustomPageEditorForm
        mode="create"
        webhooks={webhooks.map((webhook) => ({
          token: webhook.token,
          name: webhook.name,
          isActive: webhook.isActive,
        }))}
      />
    </>
  );
}
