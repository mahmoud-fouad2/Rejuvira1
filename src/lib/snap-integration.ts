/** Public asset IDs verified against Snap Events Manager and the live GTM tag. */
export const REJUVERA_SNAP_PIXEL_ID = "98dc3177-fd0f-4210-8077-6086fa7adb54";

// Exact standalone bootstrap observed on production. Unknown or combined
// scripts are deliberately preserved; this is not a general script sanitizer.
export const REDUNDANT_SNAP_BOOTSTRAP = `
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');
snaptr('init', '${REJUVERA_SNAP_PIXEL_ID}', {});
snaptr('track', 'PAGE_VIEW');
`;
const compact = (value: string) => value.replace(/\s+/g, "");

/** Only the verified GTM loader and fallback manual Snap loader need this guard. */
export function isSnapMeasurementBootstrap(code: string): boolean {
  return (
    compact(code) === compact(REDUNDANT_SNAP_BOOTSTRAP) ||
    (/https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=/.test(code) &&
      /\}\)\(window,document,'script','dataLayer','GTM-WRR5GX93'\);/.test(
        compact(code),
      ))
  );
}

/** GTM-WRR5GX93 owns PAGE_VIEW; remove its verified duplicate only alongside it. */
export function stripDuplicateSnapBootstrap(html: string): string {
  const scripts = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi),
  ];
  const hasVerifiedContainer = scripts.some(
    ([, code]) =>
      isSnapMeasurementBootstrap(code!) && code!.includes("GTM-WRR5GX93"),
  );
  if (!hasVerifiedContainer) return html;
  const known = compact(REDUNDANT_SNAP_BOOTSTRAP);
  return html.replace(
    /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi,
    (element, code: string) => (compact(code) === known ? "" : element),
  );
}
