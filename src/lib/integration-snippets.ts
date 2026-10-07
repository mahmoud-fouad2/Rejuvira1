/**
 * Compatibility for the existing admin-configured awareness campaign.
 * Only its known dismiss action is converted; arbitrary handlers remain
 * subject to CSP. No handler text is evaluated and no CSP hash is needed.
 */
export function normalizeIntegrationHtml(html: string): string {
  return html
    .replace(/https?:\/\/faheemly\.com/g, "https://www.faheemly.com")
    .replace(
      /\bonclick="\s*document\.getElementById\('rejuvera-breast-awareness'\)\.remove\(\);?\s*"/g,
      'data-rejuvera-awareness-dismiss=""',
    );
}

/** Handles the marker even when the saved campaign inserts its card later. */
export function installAwarenessDismissHandler(): () => void {
  const dismiss = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest(
      "#rejuvera-breast-awareness button[data-rejuvera-awareness-dismiss]",
    );
    button?.closest("#rejuvera-breast-awareness")?.remove();
  };
  document.addEventListener("click", dismiss);
  return () => document.removeEventListener("click", dismiss);
}
