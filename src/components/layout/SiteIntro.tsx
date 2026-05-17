"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BrandLogo } from "@/components/layout/BrandLogo";

/** Visible intro duration — keep between 3000–5000 ms inclusive. */
export const SITE_INTRO_DURATION_MS = 4000;

const STORAGE_KEY = "introSeen";

type SiteIntroProps = {
  logoAlt: string;
  siteName: string;
};

export function SiteIntro({ logoAlt, siteName }: SiteIntroProps) {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dismissedRef = useRef(false);

  const finalizeClose = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setActive(false);
      setLeaving(false);
    }, 420);
  }, []);

  const dismissNow = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    finalizeClose();
  }, [finalizeClose]);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    if (!portalEl) return;

    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      if (new URLSearchParams(window.location.search).get("nointro") === "1")
        return;
    } catch {
      return;
    }

    dismissedRef.current = false;
    setActive(true);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      dismissNow();
    };

    const introTimer = window.setTimeout(finish, SITE_INTRO_DURATION_MS);
    const safetyCap = window.setTimeout(
      finish,
      Math.max(SITE_INTRO_DURATION_MS + 1200, 5200),
    );

    return () => {
      finished = true;
      clearTimeout(introTimer);
      clearTimeout(safetyCap);
    };
  }, [portalEl, dismissNow]);

  if (!portalEl || !active) return null;

  return createPortal(
    <div
      className={`rv-site-intro-overlay${leaving ? "is-leaving" : ""}`}
      role="presentation"
    >
      <div className="rv-site-intro-backdrop" aria-hidden="true" />
      <button
        type="button"
        className="rv-site-intro-skip focus-visible:ring-2 focus-visible:ring-[color:var(--rv-purple-strong)] focus-visible:ring-offset-2"
        onClick={() => dismissNow()}
        aria-label="Skip introduction"
      >
        <span className="lang-ar">تخطّي</span>
        <span className="lang-en">Skip</span>
      </button>
      <div className="rv-site-intro-inner">
        <div className="rv-site-intro-brand">
          <BrandLogo
            alt={logoAlt}
            width={320}
            height={320}
            variant="footer"
            className="rv-v0-footer-logo"
            sizes="148px"
            priority
          />
        </div>
        <span className="sr-only">{siteName}</span>
        <div className="rv-site-intro-shimmer" aria-hidden="true" />
      </div>
    </div>,
    portalEl,
  );
}
