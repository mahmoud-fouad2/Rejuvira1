import { improveBodyContouringLanding } from "./body-contouring-landing.ts";
import { improveBookingLanding } from "./booking-landing.ts";
import { improveBreastSurgeryLanding } from "./breast-surgery-landing.ts";
import { improveFaceliftLanding } from "./facelift-landing.ts";
import { improveTiktokLanding } from "./tiktok-landing.ts";

const FACELIFT_MARKER = 'data-facelift-optimized="1"';
const FOCUSED_MARKER = /data-focused-landing="[a-z-]+"/;

/** Only the supported pages are re-rendered; any other slug or CMS layout is untouched. */
export function improveFocusedLanding(html: string, slug: string): string {
  return [
    improveFaceliftLanding,
    improveBodyContouringLanding,
    improveBookingLanding,
    improveBreastSurgeryLanding,
    improveTiktokLanding,
  ].reduce((current, improve) => improve(current, slug), html);
}

export const isFocusedFaceliftHtml = (html: string) =>
  html.includes(FACELIFT_MARKER);

export const isFocusedLandingHtml = (html: string) =>
  html.includes(FACELIFT_MARKER) || FOCUSED_MARKER.test(html);

/**
 * The site's `.rv-custom-page__content` element rules (links, images, headings,
 * lists) have the same specificity as the `.fl-*` rules and load after the route
 * stylesheet in production, so they would override the page's own design. Focused
 * landings therefore get a neutral wrapper class and keep CMS prose styling out.
 */
export function landingArticleClass(options: {
  focused: boolean;
  uploaded: boolean;
  fontVariable: string;
}): string {
  if (options.focused)
    return `rv-landing-content ${options.fontVariable}`.trim();
  return options.uploaded
    ? "rv-custom-page__content rv-custom-page__content--uploaded"
    : "rv-custom-page__content";
}
