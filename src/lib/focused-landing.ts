import {
  BODY_CONTOURING_MARKER,
  improveBodyContouringLanding,
} from "./body-contouring-landing.ts";
import { improveFaceliftLanding } from "./facelift-landing.ts";

const FACELIFT_MARKER = 'data-facelift-optimized="1"';

/** Only the two supported pages are re-rendered; any other slug or CMS layout is untouched. */
export function improveFocusedLanding(html: string, slug: string): string {
  return improveBodyContouringLanding(improveFaceliftLanding(html, slug), slug);
}

export const isFocusedFaceliftHtml = (html: string) =>
  html.includes(FACELIFT_MARKER);

export const isFocusedLandingHtml = (html: string) =>
  html.includes(FACELIFT_MARKER) || html.includes(BODY_CONTOURING_MARKER);
