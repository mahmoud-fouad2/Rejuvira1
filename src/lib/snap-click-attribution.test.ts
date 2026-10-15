import assert from "node:assert/strict";
import test from "node:test";
import {
  getStoredSnapClickId,
  snapClickCookieForRequest,
} from "./snap-click-attribution.ts";

const click = "7b3a7917-a82a-47e8-9728-e1b3b045abb2";
const request = (
  path = "/contact",
  headers: HeadersInit = {},
  method = "GET",
) => new Request(`https://rejuvera.sa${path}`, { method, headers });

test("a public Snap landing retains only the click UUID for this session", () => {
  const cookie = snapClickCookieForRequest(
    request(`/p/test?ScCid=${click}&phone=private&service=private`),
  );
  assert.equal(
    cookie,
    `rv_snap_click=${click}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );
  assert.doesNotMatch(cookie!, /private|phone|service|Max-Age|Expires/);
  assert.equal(getStoredSnapClickId(new Headers({ cookie: cookie! })), click);
});

test("navigation preserves attribution and a new ad click can replace it", () => {
  const headers = { cookie: `rv_snap_click=${click}` };
  assert.equal(
    snapClickCookieForRequest(request("/contact", headers)),
    undefined,
  );
  assert.equal(
    snapClickCookieForRequest(request(`/?ScCid=${click}`, headers)),
    undefined,
  );
  const next = "7b3a7917-a82a-47e8-9728-e1b3b045abb3";
  assert.match(
    snapClickCookieForRequest(request(`/?ScCid=${next}`, headers))!,
    new RegExp(next),
  );
  assert.equal(
    snapClickCookieForRequest(request("/?ScCid=invalid", headers)),
    undefined,
  );
});

test("private pages, API, POST and prefetch never create attribution", () => {
  for (const path of [
    "/admin",
    "/api/contact",
    "/login",
    "/portal/messages",
    "/career/job",
    "/forbidden",
    "/patient-login",
  ]) {
    assert.equal(
      snapClickCookieForRequest(request(`${path}?ScCid=${click}`)),
      undefined,
    );
  }
  for (const headers of [
    { "next-router-prefetch": "1" },
    { purpose: "prefetch" },
    { "sec-purpose": "prefetch;prerender" },
  ]) {
    assert.equal(
      snapClickCookieForRequest(request(`/?ScCid=${click}`, headers)),
      undefined,
    );
  }
  assert.equal(
    snapClickCookieForRequest(request(`/?ScCid=${click}`, {}, "POST")),
    undefined,
  );
  assert.equal(
    getStoredSnapClickId(new Headers({ cookie: "rv_snap_click=medical-text" })),
    undefined,
  );
});

test("opt outs clear an existing attribution cookie and never set a new one", () => {
  for (const header of ["sec-gpc", "dnt"]) {
    assert.equal(
      snapClickCookieForRequest(request(`/?ScCid=${click}`, { [header]: "1" })),
      undefined,
    );
    assert.match(
      snapClickCookieForRequest(
        request("/contact", {
          [header]: "1",
          cookie: `rv_snap_click=${click}`,
        }),
      )!,
      /Max-Age=0$/,
    );
  }
});
