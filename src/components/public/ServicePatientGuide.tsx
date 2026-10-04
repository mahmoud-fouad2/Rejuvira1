import Link from "next/link";
import type { Route } from "next";

import type {
  JournalPostRecord,
  ServiceRecord,
} from "@/lib/content-repository";
import { publicServiceSlug } from "@/lib/public-service-slug";
import { servicePatientGuide } from "@/lib/service-patient-guides";

export function ServicePatientGuide({
  service,
  services,
  posts,
}: {
  service: ServiceRecord;
  services: readonly ServiceRecord[];
  posts: readonly JournalPostRecord[];
}) {
  const guide = servicePatientGuide(service.slug);
  const relatedServices = services.filter(
    (item) =>
      item.status === "PUBLISHED" &&
      item.slug !== service.slug &&
      publicServiceSlug(item.slug) === item.slug &&
      guide?.relatedSlugs.includes(item.slug),
  );
  const relatedPosts = posts
    .filter(
      (post) =>
        (post.status ?? "PUBLISHED") === "PUBLISHED" &&
        (post.relatedServiceSlugs.includes(service.slug) ||
          guide?.articleSlugs.includes(post.slug)),
    )
    .slice(0, 4);
  if (!guide && !relatedPosts.length) return null;

  return (
    <section
      className="surface-panel mt-6 rounded-[2.5rem] p-7 lg:p-10"
      aria-labelledby="service-patient-guide"
    >
      <h2
        id="service-patient-guide"
        className="text-ink-strong font-serif text-3xl"
      >
        <span className="lang-ar">
          {guide?.titleAr ?? "قراءات تساعدك قبل الاستشارة"}
        </span>
        <span className="lang-en">
          {guide?.titleEn ?? "Further reading before your consultation"}
        </span>
      </h2>
      {guide && (
        <p className="text-ink-soft mt-5 text-base leading-8">
          <span className="lang-ar">{guide.summaryAr}</span>
          <span className="lang-en">{guide.summaryEn}</span>
        </p>
      )}
      {relatedServices.length > 0 && (
        <div className="mt-7">
          <h3 className="text-ink-strong text-xl font-semibold">
            <span className="lang-ar">خدمات مرتبطة للمقارنة</span>
            <span className="lang-en">Related services to explore</span>
          </h3>
          <ul className="mt-4 grid gap-3">
            {relatedServices.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/services/${item.slug}` as Route}
                  className="text-purple-mid underline"
                >
                  <span className="lang-ar">{item.name}</span>
                  <span className="lang-en">{item.nameEn ?? item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {relatedPosts.length > 0 && (
        <div className="mt-7">
          <h3 className="text-ink-strong text-xl font-semibold">
            <span className="lang-ar">اقرأ قبل الموعد</span>
            <span className="lang-en">Read before your appointment</span>
          </h3>
          <ul className="mt-4 grid gap-3">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/journal/${post.slug}` as Route}
                  className="text-purple-mid underline"
                  lang="ar"
                  dir="rtl"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {guide && (
        <div className="border-line mt-7 border-t pt-6">
          <h3 className="text-ink-strong font-semibold">
            <span className="lang-ar">مراجع للتعريف بالإجراء وحدوده</span>
            <span className="lang-en">
              References on the procedure and its limitations
            </span>
          </h3>
          <ul className="mt-3 grid gap-3 text-sm">
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} className="text-purple-mid underline">
                  <span className="lang-ar">{source.titleAr}</span>
                  <span className="lang-en">{source.titleEn}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-ink-soft mt-4 text-sm leading-7">
            <span className="lang-ar">
              هذه معلومات تثقيفية عامة. تحديد ملاءمة الإجراء وخطته ومخاطره
              لحالتك يتم في الاستشارة الطبية.
            </span>
            <span className="lang-en">
              This is general educational information. Suitability, the
              treatment plan and risks for your case are assessed during a
              medical consultation.
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
