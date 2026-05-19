import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCustomPageBySlug } from "@/lib/content-repository";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page || page.status !== ContentStatus.PUBLISHED) {
    return { title: "Rejuvera" };
  }
  const robots = page.noindex ? "noindex,nofollow" : undefined;
  return {
    title: page.seoTitle || page.titleAr,
    description: page.seoDescription ?? undefined,
    ...(robots ? { robots } : {}),
  };
}

export default async function CustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lead?: string }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const page = await getCustomPageBySlug(slug);
  if (!page) notFound();
  if (page.status !== ContentStatus.PUBLISHED) {
    notFound();
  }

  const safeHtml = sanitizeHtml(page.htmlContent);

  return (
    <>
      <SiteHeader />
      <main className="rv-custom-page">
        {query.lead === "success" || query.lead === "error" ? (
          <div
            className={`mx-auto mt-6 max-w-4xl rounded-2xl border px-5 py-3 text-center text-sm font-semibold ${
              query.lead === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {query.lead === "success"
              ? "تم استلام طلبك بنجاح، وسيتواصل معك الفريق قريباً."
              : "تعذر إرسال الطلب. يرجى مراجعة البيانات واختيار موعد من السبت إلى الخميس بين 2:00 م و10:00 م."}
          </div>
        ) : null}
        <article
          className="rv-custom-page__content"
          dir="auto"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
