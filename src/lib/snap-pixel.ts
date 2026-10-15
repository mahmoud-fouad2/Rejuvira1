"use client";

import { REJUVERA_SNAP_PIXEL_ID } from "./snap-integration.ts";

type SnaptrFn = (...args: unknown[]) => void;
declare global {
  interface Window {
    snaptr?: SnaptrFn;
  }
}

const deliveredSignUps = new Set<string>();
const pendingSignUps = new Set<string>();

function optedOut() {
  return (
    typeof navigator !== "undefined" &&
    (navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl)
  );
}

/** GTM owns the first view; call only after a public client-side route change. */
export function fireSnapRoutePageView(pathname: string): () => void {
  if (
    typeof window === "undefined" ||
    /^\/(?:admin|login|patient-login|portal|api)(?:\/|$)/.test(pathname)
  )
    return () => {};
  let canceled = false;
  let timer: number | undefined;
  function dispatch(attempt = 0) {
    if (canceled || optedOut() || window.location.pathname !== pathname) return;
    if (typeof window.snaptr === "function") {
      try {
        window.snaptr("track", REJUVERA_SNAP_PIXEL_ID, "PAGE_VIEW");
      } catch {
        // A tracker failure must not interrupt navigation or the booking form.
      }
      return;
    }
    if (attempt < 20)
      timer = window.setTimeout(() => dispatch(attempt + 1), 250);
  }
  dispatch();
  return () => {
    canceled = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
}

/** A saved lead only: no patient fields, medical parameters or invented value. */
export function fireSnapSignUp(dedupId: string): void {
  if (typeof window === "undefined" || !dedupId?.trim()) return;
  const id = dedupId.trim();
  if (deliveredSignUps.has(id) || pendingSignUps.has(id)) return;
  pendingSignUps.add(id);

  function dispatch(attempt = 0) {
    if (optedOut()) {
      pendingSignUps.delete(id);
      return;
    }
    if (typeof window.snaptr === "function") {
      // Explicit asset targeting avoids broadcasting the lead to another pixel.
      // This ID must equal event_id in the server's SIGN_UP CAPI event.
      try {
        window.snaptr("track", REJUVERA_SNAP_PIXEL_ID, "SIGN_UP", {
          client_dedup_id: id,
        });
      } catch {
        // CAPI remains independent; a browser SDK error must never fail a saved lead.
        pendingSignUps.delete(id);
        return;
      }
      pendingSignUps.delete(id);
      deliveredSignUps.add(id);
      return;
    }
    // GTM owns initialization. Wait briefly without blocking the booking UI.
    if (attempt < 20) {
      window.setTimeout(() => dispatch(attempt + 1), 250);
    } else {
      pendingSignUps.delete(id);
    }
  }
  dispatch();
}
