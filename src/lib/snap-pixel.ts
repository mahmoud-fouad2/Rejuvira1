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

/** A saved lead only: no patient fields, medical parameters or invented value. */
export function fireSnapSignUp(dedupId: string): void {
  if (typeof window === "undefined" || !dedupId?.trim()) return;
  const id = dedupId.trim();
  if (deliveredSignUps.has(id) || pendingSignUps.has(id)) return;
  pendingSignUps.add(id);

  function dispatch(attempt = 0) {
    if (
      typeof navigator !== "undefined" &&
      (navigator.doNotTrack === "1" ||
        (navigator as Navigator & { globalPrivacyControl?: boolean })
          .globalPrivacyControl)
    ) {
      pendingSignUps.delete(id);
      return;
    }
    if (typeof window.snaptr === "function") {
      // Explicit asset targeting avoids broadcasting the lead to another pixel.
      // This ID must equal event_id in the server's SIGN_UP CAPI event.
      window.snaptr("track", REJUVERA_SNAP_PIXEL_ID, "SIGN_UP", {
        client_dedup_id: id,
      });
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
