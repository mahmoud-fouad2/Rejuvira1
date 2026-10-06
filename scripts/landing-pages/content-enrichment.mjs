import { createHash } from "node:crypto";
import { landingContentProfiles } from "./content-profiles.mjs";
import { buildSahamWhatsappBubble } from "./saham-whatsapp.mjs";

export const LANDING_RELEASE = "2026-10-06-patient-intents-v1";
export const LANDING_LOG_KIND = `cms-landing:${LANDING_RELEASE}`;
export const LANDING_STATE_PREFIX = `system.cmsLanding.${LANDING_RELEASE}.`;
export function contentHash(value) {
  return createHash("sha256").update(value).digest("hex");
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

const guideCss = `
.rv-landing-guide{box-sizing:border-box;width:calc(100% - 32px);max-width:1180px;margin:36px auto;padding:36px;border:1px solid #e8dfef;border-radius:26px;background:#faf7fd;direction:rtl;text-align:right;font-family:"IBM Plex Sans Arabic",Tahoma,Arial,sans-serif;overflow-wrap:anywhere;color:#2d193e}
.rv-landing-guide *{box-sizing:border-box;font-family:"IBM Plex Sans Arabic",Tahoma,Arial,sans-serif!important}
.rv-custom-page__content .rv-landing-guide{width:calc(100% - 32px)!important;min-width:0!important;max-width:1180px!important}
.rv-landing-guide .rv-lg-kicker{margin:0 0 10px;color:#805a25!important;font-size:13px;font-weight:700}
.rv-landing-guide h2{margin:0 0 18px;color:#321847!important;font-size:clamp(24px,3vw,34px);font-weight:700;line-height:1.6}
.rv-landing-guide p,.rv-landing-guide li{color:#66566e!important;font-size:15px;line-height:1.95}
.rv-landing-guide .rv-lg-intro{margin:0 0 20px;max-width:920px}
.rv-landing-guide ul{margin:0 0 24px;padding-inline-start:24px;list-style:disc}
.rv-landing-guide li{margin:7px 0}
.rv-landing-guide .rv-lg-faqs{display:grid;gap:12px}
.rv-landing-guide details{margin:0;padding:0 22px;border:1px solid #e6dcea;border-radius:16px;background:#fff}
.rv-landing-guide summary{padding:18px 0;color:#321847!important;font-size:15px;font-weight:700;line-height:1.85;cursor:pointer}
.rv-landing-guide details p{margin:0 0 20px}
.rv-landing-guide summary:focus-visible,.rv-landing-guide a:focus-visible{outline:3px solid #805a25;outline-offset:4px;border-radius:4px}
.rv-landing-guide .rv-lg-links{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 0}
.rv-landing-guide .rv-lg-links a{padding:10px 15px;border:1px solid #d7c5e6;border-radius:12px;background:#fff;color:#5d2f94!important;text-decoration:none;font-size:14px;line-height:1.7}
.rv-landing-guide .rv-lg-links a:hover{text-decoration:underline;border-color:#5d2f94}
.rv-landing-guide h3{margin:24px 0 8px;color:#321847!important;font-size:18px;line-height:1.7;font-weight:700}
.rv-landing-guide .rv-lg-sources{margin:24px 0 0;font-size:12px;line-height:1.9}
.rv-landing-guide .rv-lg-sources a{color:#5d2f94!important;text-decoration:underline}
@media(max-width:640px){.rv-landing-guide{width:calc(100% - 28px);padding:24px 18px;margin:24px auto;border-radius:20px}.rv-landing-guide h2{font-size:25px}.rv-landing-guide details{padding-inline:16px}}
@media(max-width:640px){.rv-custom-page__content .rv-landing-guide{width:calc(100% - 28px)!important}}
`;

export function buildLandingEnrichment(profile, records = {}) {
  const services = (records.services || []).filter(
    (record) =>
      record.status === "PUBLISHED" && profile.services.includes(record.slug),
  );
  const doctors = (records.doctors || []).filter(
    (record) =>
      record.status === "PUBLISHED" && profile.doctors.includes(record.slug),
  );
  const links = [
    ...services.map((record) => ({
      href: `/services/${encodeURIComponent(record.slug)}`,
      label: record.nameAr,
    })),
    ...doctors.map((record) => ({
      href: `/doctors/${encodeURIComponent(record.slug)}`,
      label: `ملف ${record.nameAr}`,
    })),
  ];
  // Links help discovery even on landing pages that deliberately hide the site header.
  if (
    profile.slug === "rejuvera-booking" ||
    profile.slug === "rejuvera-social-media"
  ) {
    links.push(
      { href: "/doctors", label: "الفريق الطبي والتخصصات" },
      { href: "/services", label: "أدلة الخدمات" },
    );
  }
  const id = `landing-guide-${profile.slug}`;
  return `\n<!-- ${LANDING_RELEASE}:start -->\n<style>${guideCss}</style>
<section class="rv-landing-guide" id="${id}" data-landing-content-release="${LANDING_RELEASE}" lang="ar" dir="rtl" aria-labelledby="${id}-title">
<p class="rv-lg-kicker">دليل اختيار الاستشارة</p><h2 id="${id}-title">${escapeHtml(profile.heading)}</h2>
<p class="rv-lg-intro">${escapeHtml(profile.intro)}</p>
${profile.checklist.length ? `<ul>${profile.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
<div class="rv-lg-faqs">${profile.questions.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join("")}</div>
${links.length ? `<h3>اقرأ قبل الاستشارة</h3><nav class="rv-lg-links" aria-label="معلومات مرتبطة بموضوع الاستشارة">${links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join("")}</nav>` : ""}
${profile.sources.length ? `<p class="rv-lg-sources">مراجع عامة لتحضير أسئلتك: ${profile.sources.map((item) => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`).join(" · ")}. التقييم الطبي يحدد ما يناسب حالتك.</p>` : ""}
</section>\n<!-- ${LANDING_RELEASE}:end -->`;
}

export function makeContentPatch(page, suffix) {
  return {
    htmlContent: page.htmlContent + suffix,
    meta: {
      pageId: page.id,
      slug: page.slug,
      version: LANDING_RELEASE,
      originalLength: page.htmlContent.length,
      beforeHash: contentHash(page.htmlContent),
      suffixHash: contentHash(suffix),
      afterHash: contentHash(page.htmlContent + suffix),
    },
  };
}

export function rollbackHtml(page, meta) {
  if (
    page.id !== meta.pageId ||
    contentHash(page.htmlContent) !== meta.afterHash
  )
    return null;
  const original = page.htmlContent.slice(0, meta.originalLength);
  const suffix = page.htmlContent.slice(meta.originalLength);
  if (
    contentHash(original) !== meta.beforeHash ||
    contentHash(suffix) !== meta.suffixHash
  )
    return null;
  return original;
}

/** Append once. Compare-and-update + audit are atomic, without rewriting the CMS prefix. */
export async function seedLandingContent(prisma) {
  const slugs = [
    ...landingContentProfiles.map((profile) => profile.slug),
    "dr-saham-arfaj",
  ];
  const [pages, services, doctors, history] = await Promise.all([
    prisma.customPage.findMany({
      where: {
        OR: [{ slug: { in: slugs } }, { seoSlug: { in: slugs } }],
        status: "PUBLISHED",
        noindex: false,
      },
      select: {
        id: true,
        slug: true,
        seoSlug: true,
        htmlContent: true,
        updatedAt: true,
      },
    }),
    prisma.service.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, nameAr: true, status: true },
    }),
    prisma.doctor.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, nameAr: true, status: true },
    }),
    prisma.siteSetting.findMany({
      where: { key: { startsWith: LANDING_STATE_PREFIX } },
      select: { value: true },
    }),
  ]);
  const applied = new Set(
    history.map((entry) => entry.value?.pageId).filter(Boolean),
  );
  const results = [];
  for (const page of pages) {
    if (applied.has(page.id)) {
      // An administrator may edit/remove the addition: future builds respect that choice.
      results.push({ slug: page.slug, reason: "already-applied" });
      continue;
    }
    const profile =
      landingContentProfiles.find((item) => item.slug === page.seoSlug) ||
      landingContentProfiles.find((item) => item.slug === page.slug);
    const hasAddition = profile
      ? page.htmlContent.includes(
          `data-landing-content-release="${LANDING_RELEASE}"`,
        )
      : page.htmlContent.includes("rejuvera-google-whatsapp");
    if (hasAddition) {
      results.push({ slug: page.slug, reason: "existing-addition-preserved" });
      continue;
    }
    const suffix = profile
      ? buildLandingEnrichment(profile, { services, doctors })
      : buildSahamWhatsappBubble();
    const patch = makeContentPatch(page, suffix);
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.customPage.updateMany({
        where: {
          id: page.id,
          updatedAt: page.updatedAt,
          htmlContent: page.htmlContent,
          status: "PUBLISHED",
          noindex: false,
        },
        data: { htmlContent: patch.htmlContent },
      });
      if (result.count !== 1) return false;
      // Small hashes/lengths only: no HTML, leads, secrets or full-page backups in settings.
      // The original HTML remains intact in the CMS prefix. Unlike logs, this marker
      // survives ordinary log cleanup and keeps administrator removals authoritative.
      await tx.siteSetting.create({
        data: {
          key: `${LANDING_STATE_PREFIX}${page.id}`,
          groupName: "system",
          value: patch.meta,
        },
      });
      await tx.appLog.create({
        data: {
          level: "info",
          kind: LANDING_LOG_KIND,
          message: `Applied CMS landing addition: ${page.slug}`,
          meta: patch.meta,
        },
      });
      return true;
    });
    results.push({
      slug: page.slug,
      reason: updated ? "applied" : "concurrent-edit-preserved",
    });
  }
  return results;
}

/** Only restore the exact recorded release; never discard later administrator edits. */
export async function rollbackLandingContent(prisma) {
  const history = await prisma.siteSetting.findMany({
    where: { key: { startsWith: LANDING_STATE_PREFIX } },
    select: { value: true },
  });
  const results = [];
  for (const { value: meta } of history) {
    if (!meta?.pageId) continue;
    const page = await prisma.customPage.findUnique({
      where: { id: meta.pageId },
    });
    if (!page) continue;
    const original = rollbackHtml(page, meta);
    if (original === null) {
      results.push({ slug: page.slug, reason: "later-edit-preserved" });
      continue;
    }
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.customPage.updateMany({
        where: {
          id: page.id,
          updatedAt: page.updatedAt,
          htmlContent: page.htmlContent,
        },
        data: { htmlContent: original },
      });
      if (result.count !== 1) return false;
      await tx.appLog.create({
        data: {
          level: "info",
          kind: `${LANDING_LOG_KIND}:rollback`,
          message: `Restored CMS prefix: ${page.slug}`,
          meta: { pageId: page.id, version: LANDING_RELEASE },
        },
      });
      return true;
    });
    results.push({
      slug: page.slug,
      reason: updated ? "restored" : "concurrent-edit-preserved",
    });
  }
  return results;
}
