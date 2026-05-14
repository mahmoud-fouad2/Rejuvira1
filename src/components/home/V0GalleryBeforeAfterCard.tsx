"use client";

import Link from "next/link";
import type { Route } from "next";

import { BeforeAfterSlider } from "@/components/ui/new/BeforeAfterSlider";
import type { GalleryRecord } from "@/lib/content-repository";

/** Homepage gallery tile: draggable split + footer link to full gallery. */
export function V0GalleryBeforeAfterCard({ item }: { item: GalleryRecord }) {
  return (
    <div className="rv-v0-before-after is-interactive-ba">
      <BeforeAfterSlider
        beforeSrc={item.beforeImageUrl}
        afterSrc={item.afterImageUrl}
        beforeLabel="قبل"
        afterLabel="بعد"
        beforeAlt={item.beforeImageAlt}
        afterAlt={item.afterImageAlt}
        initialPercent={item.initialSplitPercent ?? 50}
        className="rounded-none border-0 shadow-none"
      />
      <footer>
        <small>{item.category}</small>
        <Link href={("/gallery" as Route)} className="block text-inherit no-underline hover:opacity-90">
          <h3>{item.title}</h3>
        </Link>
      </footer>
    </div>
  );
}
