type ConversionStorage = Pick<Storage, "getItem" | "setItem">;

export function claimConversionId(
  requestId: string,
  claimedIds: Set<string>,
  storage?: ConversionStorage,
) {
  const key = `rejuvera:lead-conversion:${requestId}`;
  if (claimedIds.has(requestId)) return false;

  try {
    if (storage?.getItem(key) === "1") return false;
    storage?.setItem(key, "1");
  } catch {
    // In-memory deduplication still applies when storage is unavailable.
  }

  claimedIds.add(requestId);
  return true;
}
