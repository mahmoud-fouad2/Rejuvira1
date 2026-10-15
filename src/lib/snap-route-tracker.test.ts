import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("hydration/effect replay retains GTM's first view; SPA transitions emit once, including back navigation", () => {
  let path = "/";
  const calls: string[] = [];
  const effects: Array<() => unknown> = [];
  const ref = { current: path };
  const exports = {} as { PageViewTracker: () => null };
  const source = readFileSync(
    new URL("../components/layout/PageViewTracker.tsx", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require: (name: string) => {
        if (name === "react")
          return {
            useRef: () => ref,
            useEffect: (fn: () => unknown) => effects.push(fn),
          };
        if (name === "next/navigation") return { usePathname: () => path };
        if (name === "@/lib/snap-pixel")
          return {
            fireSnapRoutePageView: (p: string) => {
              calls.push(p);
              return () => {};
            },
          };
        throw Error(name);
      },
      window: { location: { search: "" }, innerWidth: 390, innerHeight: 844 },
      document: { referrer: "", documentElement: { lang: "ar" } },
      navigator: { language: "ar", sendBeacon: () => true },
      Blob,
    },
  );
  const render = (next: string) => {
    path = next;
    effects.length = 0;
    exports.PageViewTracker();
    effects.forEach((fn) => fn());
  };
  render("/");
  effects.forEach((fn) => fn()); // React development effect replay.
  assert.deepEqual(calls, []);
  render("/doctors");
  render("/doctors");
  render("/contact");
  render("/doctors");
  assert.deepEqual(calls, ["/doctors", "/contact", "/doctors"]);
});
