import { improveBodyContouringLanding } from "./body-contouring-landing.ts";
import { improveBookingLanding } from "./booking-landing.ts";
import { improveBreastSurgeryLanding } from "./breast-surgery-landing.ts";
import { improveFaceliftLanding } from "./facelift-landing.ts";

const FACELIFT_MARKER = 'data-facelift-optimized="1"';
const FOCUSED_MARKER = /data-focused-landing="[a-z-]+"/;

/** Only the supported pages are re-rendered; any other slug or CMS layout is untouched. */
export function improveFocusedLanding(html: string, slug: string): string {
  return improveBreastSurgeryLanding(
    improveBookingLanding(
      improveBodyContouringLanding(improveFaceliftLanding(html, slug), slug),
      slug,
    ),
    slug,
  );
}

export const isFocusedFaceliftHtml = (html: string) =>
  html.includes(FACELIFT_MARKER);

export const isFocusedLandingHtml = (html: string) =>
  html.includes(FACELIFT_MARKER) || FOCUSED_MARKER.test(html);
