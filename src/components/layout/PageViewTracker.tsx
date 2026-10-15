"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { fireSnapRoutePageView } from "@/lib/snap-pixel";

export function PageViewTracker() {
  const pathname = usePathname();
  const previousSnapPath = useRef(pathname);

  useEffect(() => {
    // The initial PAGE_VIEW is already emitted by the configured GTM tag.
    // React effect replays must not emit another one.
    if (!pathname || previousSnapPath.current === pathname) return;
    previousSnapPath.current = pathname;
    return fireSnapRoutePageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const path = `${pathname ?? "/"}${window.location.search}`;
    const payload = {
      path,
      referrer: document.referrer,
      language: document.documentElement.lang || navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    };
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
