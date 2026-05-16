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
    return { title: "Rejuvira" };
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
