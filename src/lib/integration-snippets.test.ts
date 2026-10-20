import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeIntegrationHtml,
  normalizeIntegrationSnippets,
  stripRetiredAwarenessCampaign,
  isFaceliftDistraction,
} from "./integration-snippets.ts";
import { REDUNDANT_SNAP_BOOTSTRAP } from "./snap-integration.ts";

const campaign = `<script>
(function () {
  function addRejuveraBreastCancerCard() {
    if (document.getElementById("rejuvera-breast-awareness")) return;
    const card = document.createElement("div");
    card.id = "rejuvera-breast-awareness";
    card.innerHTML = '<button>إغلاق</button><p>أكتوبر • شهر التوعية</p>';
    document.body.appendChild(card);
  }
  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addRejuveraBreastCancerCard);
  } else { addRejuveraBreastCancerCard(); }
})();
</script>`;

test("retired card is removed without removing adjacent GTM, chat or other content", () => {
  const before =
    '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-example"></iframe></noscript>';
  const after =
    '<script src="https://www.faheemly.com/api/widget/loader.js"></script><p>محتوى آخر</p>';
  assert.equal(
    stripRetiredAwarenessCampaign(before + campaign + after),
    before + after,
  );
  assert.equal(stripRetiredAwarenessCampaign(campaign + campaign), "");
  assert.equal(stripRetiredAwarenessCampaign(before + after), before + after);
});

test("combined or unfamiliar code is preserved rather than deleting measurement", () => {
  for (const tracker of ["gtag", "fbq", "snaptr", "oaiq", "ttq", "dataLayer"]) {
    const combined = campaign.replace("})();", `${tracker}('event');})();`);
    assert.equal(stripRetiredAwarenessCampaign(combined), combined);
  }
  const unknown = '<script>otherCampaign("rejuvera-breast-awareness")</script>';
  assert.equal(stripRetiredAwarenessCampaign(unknown), unknown);
  const article =
    '<article id="breast-cancer-awareness"><h1>التوعية بسرطان الثدي</h1></article>';
  assert.equal(stripRetiredAwarenessCampaign(article), article);
});

test("normalization retires the card and preserves the Faheemly redirect repair", () => {
  const loader =
    '<script src="https://faheemly.com/api/widget/loader.js"></script>';
  assert.equal(
    normalizeIntegrationHtml(campaign + loader),
    loader.replace("https://faheemly", "https://www.faheemly"),
  );
  const inline = '<button onclick="alert(1)">other</button>';
  assert.equal(normalizeIntegrationHtml(inline), inline);
});

test("facelift suppression still targets only known widgets, never tracking snippets", () => {
  assert.equal(
    isFaceliftDistraction("https://www.faheemly.com/api/widget/loader.js?v=v1"),
    true,
  );
  assert.equal(
    isFaceliftDistraction('card.id="rejuvera-breast-awareness"'),
    true,
  );
  for (const tracker of ["gtag", "fbq", "snaptr", "oaiq", "ttq"]) {
    assert.equal(
      isFaceliftDistraction(
        `${tracker}("event"); card.id="rejuvera-breast-awareness"`,
      ),
      false,
    );
  }
  assert.equal(isFaceliftDistraction("unrelated widget"), false);
});

test("paired normalization removes only the known Snap duplicate across head/body", () => {
  const gtm = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WRR5GX93');</script>`;
  const snap = `<script>${REDUNDANT_SNAP_BOOTSTRAP}</script>`;
  const meta = '<script>fbq("track", "PageView");</script>';
  const widget =
    '<script src="https://faheemly.com/api/widget/loader.js"></script>';
  const result = normalizeIntegrationSnippets(
    snap + meta,
    gtm + campaign + widget,
  );
  assert.equal(result.customHeadCode, meta);
  assert.equal(
    result.customBodyCode,
    gtm + widget.replace("https://faheemly", "https://www.faheemly"),
  );
  assert.deepEqual(
    normalizeIntegrationSnippets(result.customHeadCode, result.customBodyCode),
    result,
  );
  assert.deepEqual(normalizeIntegrationSnippets("", ""), {
    customHeadCode: "",
    customBodyCode: "",
  });
});
