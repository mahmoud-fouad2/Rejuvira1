import { headers } from "next/headers";

/**
 * Per-request CSP nonce, stamped onto the request by middleware.ts. Read
 * this in any Server Component that renders its own inline <script>.
 */
export async function getCspNonce() {
  return (await headers()).get("x-nonce") ?? "";
}
