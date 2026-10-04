"use client";

import { useEffect } from "react";

import {
  trackContactLinkConversion,
  trackLeadConversion,
} from "@/lib/lead-conversion-tracking";

export function LeadConversionTracker() {
  useEffect(() => {
    let cancelled = false;
    const handleContactClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.href;
      const normalizedHref = href.toLowerCase();
      if (normalizedHref.startsWith("tel:")) {
        if (anchor.dataset.googleAdsPhoneCta === "true") return;
        trackContactLinkConversion("phone");
        return;
      }

      if (
        normalizedHref.includes("wa.me/") ||
        normalizedHref.includes("api.whatsapp.com/") ||
        normalizedHref.includes("whatsapp.com/")
      ) {
        trackContactLinkConversion("whatsapp");
      }
    };

    document.addEventListener("click", handleContactClick, true);

    const verifyRedirectedLead = async () => {
      const url = new URL(window.location.href);
      const receipt = url.searchParams.get("lead_receipt");
      if (url.searchParams.get("lead") !== "success" || !receipt) return;

      const response = await fetch("/api/lead-receipt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ receipt }),
      }).catch(() => null);
      if (!response?.ok || cancelled) return;

      const proof = (await response.json().catch(() => null)) as {
        ok?: boolean;
        requestId?: string;
        state?: string;
      } | null;
      if (
        proof?.ok !== true ||
        proof.state !== "success" ||
        typeof proof.requestId !== "string"
      ) {
        return;
      }

      const tracked = trackLeadConversion({
        requestId: proof.requestId,
        formType: "redirect_form",
        source: "Lead form redirect",
        path: url.pathname,
      });
      if (tracked) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "form_success",
          form_name: "booking",
        });
      }

      url.searchParams.delete("lead_receipt");
      window.history.replaceState({}, "", url);
    };

    void verifyRedirectedLead();

    return () => {
      cancelled = true;
      document.removeEventListener("click", handleContactClick, true);
    };
  }, []);

  return null;
}
