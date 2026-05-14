import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getJournalPosts, getRuntimeSettings } from "@/lib/content-repository";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ page: "journal", path: "/journal" });
}

export default async function JournalPage() {
  const [posts, runtimeSettings] = await Promise.all([
    getJournalPosts(),
    getRuntimeSettings(),
  ]);
  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="relative z-10 min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-28 px-6 pt-16 pb-32 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
            <p className="eyebrow text-ink-soft"><span className="lang-ar">المجلة الطبية</span><span className="lang-en">Medical Journal</span></p>
            <h1 className="balanced-text text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
              <span className="lang-ar">مقالات مختارة توضح الأسئلة الأكثر حضورًا قبل الزيارة.</span>
              <span className="lang-en">Selected articles answering the questions patients ask most before their visit.</span>
            </h1>
            <p className="text-ink-soft mt-5 max-w-3xl text-lg leading-8">
              <span className="lang-ar">يقدم هذا القسم مواد مختصرة تشرح الإجراء، التوقعات، وما ينبغي معرفته قبل الاستشارة أو الموعد.</span>
              <span className="lang-en">This section offers concise articles explaining procedures, expectations, and what should be understood before consultation or treatment.</span>
            </p>
          </article>
          <article className="surface-panel relative min-h-[22rem] overflow-hidden rounded-[2.5rem] shadow-sm lg:min-h-[24rem]">
            <Image
              src={runtimeSettings.media.journalHero}
              alt="المجلة الطبية"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
              priority
            />
            <div className="from-ink-strong/45 absolute inset-0 bg-gradient-to-t to-transparent mix-blend-multiply" />
          </article>
        </section>

        {featuredPost ? (
          <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="surface-panel overflow-hidden rounded-[2.5rem] shadow-sm">
              <div className="relative h-full min-h-[30rem]">
                <Image
                  src={featuredPost.coverImageUrl}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="relative z-0 object-cover"
                />
                <div className="from-ink-strong/40 absolute inset-0 z-10 bg-gradient-to-t to-transparent mix-blend-multiply" />
              </div>
            </article>
            <article className="surface-panel flex flex-col justify-center rounded-[2.5rem] p-8 shadow-sm lg:p-12">
              <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                {featuredPost.category}
              </p>
              <h2 className="balanced-text text-ink-strong mt-5 font-serif text-5xl tracking-[-0.02em]">
                {featuredPost.title}
              </h2>
              <p className="text-ink-faint mt-4 text-sm">
                {featuredPost.readingTime} •{" "}
                {new Date(featuredPost.publishedAt).toLocaleDateString("ar-SA")}
              </p>
              <p className="text-ink-soft mt-6 text-base leading-8">
                {featuredPost.excerpt}
              </p>
              <Link
                href={`/journal/${featuredPost.slug}`}
                className="btn-primary mt-8 self-start"
              >
                <span className="lang-ar">قراءة المقال المميز</span>
                <span className="lang-en">Read Featured Article</span>
              </Link>
            </article>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          {restPosts.map((post) => (
            <article
              key={post.id}
              className="surface-panel overflow-hidden rounded-[2.5rem] shadow-sm"
            >
              <div className="relative h-64">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="relative z-0 object-cover"
                />
                <div className="from-ink-strong/50 absolute inset-0 z-10 bg-gradient-to-t to-transparent mix-blend-multiply" />
              </div>
              <div className="p-8">
                <p className="text-ink-faint font-sans text-[10px] tracking-[0.24em] uppercase">
                  {post.category}
                </p>
                <h2 className="text-ink-strong mt-4 font-serif text-3xl tracking-[-0.02em]">
                  {post.title}
                </h2>
                <p className="text-ink-soft mt-4 text-base leading-7">
                  {post.excerpt}
                </p>
                <div className="text-ink-soft mt-6 flex items-center justify-between gap-3 text-xs">
                  <span className="border-line bg-surface rounded-full border px-3 py-1 shadow-sm">
                    {post.readingTime}
                  </span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <Link
                  href={`/journal/${post.slug}`}
                  className="btn-secondary mt-8"
                >
                  <span className="lang-ar">قراءة المقال</span>
                  <span className="lang-en">Read Article</span>
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
