"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { needsFullSiteStyles } from "@/lib/route-styles";

// Keep SSR enabled so all ordinary routes receive their CSS before first paint.
// The client boundary keeps the large stylesheet out of a fresh facelift visit.
const FullSiteStyles = dynamic(() => import("./FullSiteStyles"));

export function RouteStyles({
  forceFullStyles = false,
}: {
  forceFullStyles?: boolean;
}) {
  const pathname = usePathname();
  return needsFullSiteStyles(pathname, forceFullStyles) ? (
    <FullSiteStyles />
  ) : null;
}
