import { lookup } from "node:dns";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";
import type { LookupFunction } from "node:net";

const blockedV4 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
  ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const) {
  blockedV4.addSubnet(address, prefix);
}

const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
const blockedV6 = new BlockList();
for (const [address, prefix] of [
  ["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20],
] as const) {
  blockedV6.addSubnet(address, prefix, "ipv6");
}

export function isPublicIntegrationAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return !blockedV4.check(address);
  return family === 6 &&
    globalV6.check(address, "ipv6") &&
    !blockedV6.check(address, "ipv6");
}

const endpointError = "Integration endpoints must use public HTTPS.";
const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { all: true }, (error, results) => {
    if (error || !results.length) {
      callback(new Error("Could not resolve the integration endpoint."), "", 0);
      return;
    }
    if (results.some(({ address }) => !isPublicIntegrationAddress(address))) {
      callback(new Error(endpointError), "", 0);
      return;
    }
    // Return the validated addresses to the socket itself, with no second lookup.
    const first = results[0]!;
    if (options.all) callback(null, results);
    else callback(null, first.address, first.family);
  });
};

export function parseIntegrationEndpoint(input: string) {
  const url = new URL(input);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (isIP(hostname) !== 0 && !isPublicIntegrationAddress(hostname))
  ) {
    throw new Error(endpointError);
  }
  return url;
}

const MAX_RESPONSE_BYTES = 1024 * 1024;

export function requestIntegrationEndpoint(
  url: URL,
  options: {
    method: string;
    headers: Record<string, string>;
    body: string | undefined;
    signal: AbortSignal;
  },
): Promise<{ status: number; body: string }> {
  const headers = new Headers(options.headers);
  for (const name of [
    "host", "connection", "content-length", "transfer-encoding", "upgrade",
    "proxy-authorization", "proxy-connection", "expect", "te", "trailer",
  ]) {
    headers.delete(name);
  }
  headers.set("accept-encoding", "identity");
  if (options.body !== undefined) {
    headers.set("content-length", String(Buffer.byteLength(options.body)));
  }

  return new Promise((resolve, reject) => {
    const outgoing = request(parseIntegrationEndpoint(url.href), {
      method: options.method,
      headers: Object.fromEntries(headers),
      signal: options.signal,
      lookup: publicLookup,
      agent: false,
    }, (incoming) => {
      const status = incoming.statusCode ?? 502;
      // Do not forward credentials or parameters through a redirect.
      if (status >= 300 && status < 400) {
        incoming.destroy();
        resolve({ status, body: "" });
        return;
      }
      let size = 0;
      const chunks: Buffer[] = [];
      incoming.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) {
          reject(new Error("Integration response exceeds 1 MB."));
          incoming.destroy();
        } else {
          chunks.push(chunk);
        }
      });
      incoming.on("end", () => resolve({
        status,
        body: Buffer.concat(chunks, size).toString("utf8"),
      }));
      incoming.on("error", reject);
    });
    outgoing.on("error", reject);
    outgoing.end(options.body);
  });
}
