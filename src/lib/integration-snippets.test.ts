import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { normalizeIntegrationHtml } from "./integration-snippets.ts";

const legacyHandler =
  "\n            document.getElementById('rejuvera-breast-awareness').remove()\n          ";

test("the exact live CSP violation becomes a non-executable dismiss marker", () => {
  assert.equal(
    createHash("sha256").update(legacyHandler).digest("base64"),
    "eJWK6Ny+D47qCqiCaL1RQlxkEE6sACQYPtD4jlwIs4k=",
  );
  const html = `<script>card.innerHTML = \`<button class="rjv-bc-close" aria-label="إغلاق" onclick="${legacyHandler}">×</button>\`;</script>`;
  assert.equal(
    normalizeIntegrationHtml(html),
    '<script>card.innerHTML = `<button class="rjv-bc-close" aria-label="إغلاق" data-rejuvera-awareness-dismiss="">×</button>`;</script>',
  );
});

test("the known action accepts whitespace and an optional trailing semicolon", () => {
  assert.equal(
    normalizeIntegrationHtml(
      "<button onclick=\"document.getElementById('rejuvera-breast-awareness').remove();\">×</button>",
    ),
    '<button data-rejuvera-awareness-dismiss="">×</button>',
  );
});

test("other inline actions are neither authorized nor compiled", () => {
  const html = [
    '<button onclick="alert(1)">other</button>',
    "<button onclick=\"document.getElementById('other').remove()\">other</button>",
    "<button onclick=\"document.getElementById('rejuvera-breast-awareness').remove(); alert(1)\">changed</button>",
  ].join("");
  assert.equal(normalizeIntegrationHtml(html), html);
});

test("existing tracking code and campaign copy are preserved", () => {
  const html =
    '<script>ttq.page(); snaptr("track", "PAGE_VIEW");</script><div>الفحص المبكر يصنع الفرق</div>';
  assert.equal(normalizeIntegrationHtml(html), html);
  assert.equal(
    normalizeIntegrationHtml(
      '<script src="https://faheemly.com/api/widget/loader.js"></script>',
    ),
    '<script src="https://www.faheemly.com/api/widget/loader.js"></script>',
  );
});
