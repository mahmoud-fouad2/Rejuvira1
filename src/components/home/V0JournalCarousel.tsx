"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { JournalPostRecord } from "@/lib/content-repository";
import { useSnapCarousel } from "@/lib/use-snap-carousel";

type Props = {
  posts: readonly JournalPostRecord[];
  fallbackImage: string;
};

function ArrowIcon({ dir = "right" }: { dir?: "left" | "right" }) {
  if (dir === "left") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function V0JournalCarousel({ posts, fallbackImage }: Props) {
  const { lang } = useLanguage();
  const {
    ref,
    index,
    canPrev,
    canNext,
    next,
    prev,
    scrollTo,
    slideProps,
    viewportProps,
  } = useSnapCarousel(posts.length, {
    autoplayMs: 7000,
    autoplayResumeAfterMs: 9000,
    loop: true,
    snap: "start",
    direction: "rtl",
  });

  if (posts.length === 0) return null;

  const prevIconDirection = lang === "ar" ? "right" : "left";
  const nextIconDirection = lang === "ar" ? "left" : "right";
  const prevLabel = lang === "en" ? "Previous article" : "المقال السابق";
  const nextLabel = lang === "en" ? "Next article" : "المقال التالي";

  return (
    <div className="rv-journal-carousel-shell">
      <button
        type="button"
        className="rv-journal-carousel-nav rv-journal-carousel-nav-prev focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
        aria-label={prevLabel}
        onClick={prev}
        disabled={!canPrev}
      >
        <ArrowIcon dir={prevIconDirection} />
      </button>

      <div
        ref={ref}
        className="rv-journal-carousel-viewport"
        {...viewportProps}
      >
        <ul className="rv-journal-carousel-track">
          {posts.map((post, i) => (
            <li
              key={post.id}
              className="rv-journal-carousel-slide"
              {...slideProps(i)}
            >
              <Link
                href={`/journal/${post.slug}` as Route}
                className="rv-v0-home-journal-card"
              >
                <span className="rv-v0-home-journal-image">
                  <Image
                    src={post.coverImageUrl ?? fallbackImage}
                    alt={post.titleEn ?? post.title}
                    fill
                    sizes="(max-width: 768px) 86vw, 23rem"
                    className="object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                </span>
                <span className="rv-v0-home-journal-body">
                  <small>{post.category}</small>
                  <strong>
                    <span className="lang-ar">{post.title}</span>
                    <span className="lang-en">
                      {post.titleEn ?? "Medical journal article"}
                    </span>
                  </strong>
                  <span>
                    <span className="lang-ar">{post.excerpt}</span>
                    <span className="lang-en">
                      {post.excerptEn ??
                        "A short clinical read from Rejuvira Center."}
                    </span>
                  </span>
                  <em>
                    <span className="lang-ar">قراءة المقال</span>
                    <span className="lang-en">Read article</span>
                    <span aria-hidden> ←</span>
                  </em>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="rv-journal-carousel-nav rv-journal-carousel-nav-next focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
        aria-label={nextLabel}
        onClick={next}
        disabled={!canNext}
      >
        <ArrowIcon dir={nextIconDirection} />
      </button>

      <div
        className="rv-journal-carousel-dots"
        role="tablist"
        aria-label={lang === "en" ? "Choose article" : "اختيار المقال"}
      >
        {posts.map((post, i) => (
          <button
            key={`${post.id}-dot`}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={i === index ? "is-active" : ""}
            aria-label={
              lang === "en"
                ? `${post.titleEn ?? post.title} article`
                : `مقال ${post.title}`
            }
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
