/** Only these focused templates can render with the route stylesheet alone. */
export function needsFullSiteStyles(
  pathname: string | null,
  forceFull = false,
) {
  return forceFull || (
    pathname !== "/p/facelift-riyadh" && pathname !== "/p/rejuvera-booking"
  );
}
