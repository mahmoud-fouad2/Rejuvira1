/**
 * Copies public + `.next/static` into `.next/standalone` so Render can run
 * `node server.js` from that directory per Next standalone deployment docs.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const publicSrc = path.join(root, "public");

if (!existsSync(standalone)) {
  console.error(
    "[sync-standalone] Missing .next/standalone — run `next build` first.",
  );
  process.exit(1);
}

if (!existsSync(staticSrc)) {
  console.error("[sync-standalone] Missing .next/static.");
  process.exit(1);
}

mkdirSync(path.join(standalone, ".next"), { recursive: true });

cpSync(staticSrc, path.join(standalone, ".next", "static"), {
  recursive: true,
});
cpSync(publicSrc, path.join(standalone, "public"), { recursive: true });

console.log("[sync-standalone] public + .next/static → .next/standalone ✓");
