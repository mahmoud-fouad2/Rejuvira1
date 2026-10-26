// Node's type stripping does not implement tsconfig paths or extension lookup.
// Test-only resolver; production continues to use Next's module resolution.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/") || specifier.startsWith(".")) {
    const base = specifier.startsWith("@/")
      ? path.join(root, "src", specifier.slice(2))
      : fileURLToPath(new URL(specifier, context.parentURL));
    for (const candidate of [base, `${base}.ts`, path.join(base, "index.ts")]) {
      if (existsSync(candidate) && path.extname(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  return nextLoad(
    url,
    url.endsWith(".json")
      ? { ...context, importAttributes: { type: "json" } }
      : context,
  );
}
