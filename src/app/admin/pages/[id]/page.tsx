import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { CustomPageEditorForm } from "@/components/forms/CustomPageEditorForm";
import { getCustomPageById, getWebhooks } from "@/lib/content-repository";

export default async function EditCustomPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, webhooks] = await Promise.all([
    getCustomPageById(id),
    getWebhooks(),
  ]);
  if (!page) notFound();

  return (
    <>
      <div className="admin-page-header admin-page-header--hero">
        <div>
          <span className="admin-page-header__eyebrow">/p/{page.slug}</span>
          <h1>تعديل الصفحة المخصصة</h1>
          <p>
            مساحة تعديل كاملة للصفحة مع معاينة حية للمكونات وحفظ حقيقي على نفس
            السجل.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <a
            href={`/p/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-secondary"
          >
            معاينة
          </a>
          <Link href={"/admin/pages" as Route} className="admin-btn-secondary">
            رجوع للقائمة
          </Link>
        </div>
      </div>

      <CustomPageEditorForm
        mode="edit"
        previewHref={`/p/${page.slug}`}
        webhooks={webhooks.map((webhook) => ({
          token: webhook.token,
          name: webhook.name,
          isActive: webhook.isActive,
        }))}
        initial={{
          id: page.id,
          slug: page.slug,
          titleAr: page.titleAr,
          titleEn: page.titleEn ?? "",
          htmlContent: page.htmlContent,
          seoTitle: page.seoTitle ?? "",
          seoDescription: page.seoDescription ?? "",
          status: page.status,
          noindex: page.noindex,
        }}
      />
    </>
  );
}
