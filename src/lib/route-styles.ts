/** Opt out only the explicitly supported focused landing, never unknown routes. */
export function needsFullSiteStyles(
  pathname: string | null,
  forceFull = false,
) {
  return forceFull || pathname !== "/p/facelift-riyadh";
}
