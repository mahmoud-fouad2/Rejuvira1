import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { snapClickCookieForRequest } from "./snap-click-attribution.ts";

function middleware() {
  const exports = {} as {
    default: (request: Request & { nextUrl: URL }) => Response;
  };
  const modules: Record<string, unknown> = {
    "next/server": {
      NextResponse: {
        next: () => new Response(),
        redirect: (url: URL, status = 307) => Response.redirect(url, status),
      },
    },
    "@/auth": { auth: (callback: unknown) => callback },
    "@/lib/admin-permissions": {
      canAccessAdminRoute: () => true,
      getAdminHomePath: () => "/admin",
    },
    "@/lib/canonical-host": {
      shouldRedirectToCanonicalHost: () => false,
      buildCanonicalUrl: (path: string) => new URL(path, "https://rejuvera.sa"),
    },
    "@/lib/csp": { buildCsp: () => "default-src 'self'" },
    "@/lib/public-service-slug": { publicServiceSlug: (slug: string) => slug },
    "@/lib/snap-click-attribution": { snapClickCookieForRequest },
  };
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(new URL("../../middleware.ts", import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports,
      require: (id: string) => {
        if (!(id in modules)) throw new Error(`Unexpected module: ${id}`);
        return modules[id];
      },
      crypto,
      btoa,
      Headers,
      URL,
      Response,
    },
  );
  return (url: string, headers: HeadersInit = {}) => {
    const request = new Request(url, { headers }) as Request & { nextUrl: URL };
    request.nextUrl = new URL(url);
    return exports.default(request);
  };
}

test("a public click response cannot leak visitor attribution through shared caching", () => {
  const run = middleware();
  const response = run(
    "https://rejuvera.sa/?ScCid=7b3a7917-a82a-47e8-9728-e1b3b045abb2",
  );
  assert.match(
    response.headers.get("set-cookie")!,
    /rv_snap_click=.*HttpOnly; Secure; SameSite=Lax/,
  );
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(
    response.headers.get("content-security-policy"),
    "default-src 'self'",
  );
  const normal = run("https://rejuvera.sa/contact");
  assert.equal(normal.headers.get("set-cookie"), null);
  assert.match(normal.headers.get("cache-control")!, /s-maxage=60/);
});

test("attribution does not bypass admin authentication or weaken opt-out response caching", () => {
  const run = middleware();
  const admin = run(
    "https://rejuvera.sa/admin?ScCid=7b3a7917-a82a-47e8-9728-e1b3b045abb2",
  );
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location")!, /\/login/);
  assert.equal(admin.headers.get("set-cookie"), null);
  const optedOut = run("https://rejuvera.sa/contact", {
    dnt: "1",
    cookie: "rv_snap_click=7b3a7917-a82a-47e8-9728-e1b3b045abb2",
  });
  assert.match(optedOut.headers.get("set-cookie")!, /Max-Age=0/);
  assert.equal(optedOut.headers.get("cache-control"), "private, no-store");
});
