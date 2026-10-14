import assert from "node:assert/strict";
import test from "node:test";
import {
  landingSearchProfile,
  landingSearchProfiles,
} from "./landing-search-content.ts";
import {
  stripCustomPageEditorState,
  optimizeCustomPageImages,
} from "./custom-page-media.ts";

test("canonical aliases select their own copy; unknown and prototype names get none", () => {
  assert.equal(
    landingSearchProfile("offers", "exclusive-offers"),
    landingSearchProfiles["exclusive-offers"],
  );
  assert.equal(
    landingSearchProfile("book", "rejuvera-booking"),
    landingSearchProfiles["rejuvera-booking"],
  );
  assert.equal(
    landingSearchProfile("sm-links", "rejuvera-social-media"),
    landingSearchProfiles["rejuvera-social-media"],
  );
  assert.equal(
    landingSearchProfile("tk", "tiktok-customer"),
    landingSearchProfiles["tiktok-customer"],
  );
  for (const slug of [
    "unreviewed-page",
    "constructor",
    "__proto__",
    "toString",
  ])
    assert.equal(landingSearchProfile(slug), null);
});

test("reviewed landing pages have distinct questions and readable text without executable markup", () => {
  const headings = new Set<string>();
  const questions = new Set<string>();
  for (const profile of Object.values(landingSearchProfiles)) {
    assert.ok(!headings.has(profile.heading));
    headings.add(profile.heading);
    assert.ok(profile.intro.length > 100 && profile.focus.length > 100);
    for (const [question, answer] of profile.questions) {
      assert.ok(!questions.has(question), `Repeated question: ${question}`);
      questions.add(question);
      assert.ok(answer.length > 80);
    }
    assert.ok(
      !/[<>]|نتائج مضمونة|نسبة نجاح|خصم\s*\d/.test(JSON.stringify(profile)),
    );
  }
});

test("each reviewed doctor retains its own name and clinical topic", () => {
  for (const [slug, name, topic] of [
    ["dr-saham-arfaj", "سهام العرفج", "جراحة تجميل"],
    ["dr-maher-alahdab", "ماهر الأحدب", "الأنف"],
    ["dr-eman-alzahrani", "إيمان الزهراني", "الحوض"],
    ["dr-karima-jamjoom", "كريمة جمجوم", "المرأة"],
    ["najwa-batarfi", "نجوى باطرفي", "النسائي"],
    ["prof-bandar-alharthi", "بندر الحارثي", "الثدي"],
    ["dr-natali-domloj", "ناتالي دوملوج", "الفراكشنال"],
    ["dr-abdullah-alfakhri", "عبدالله الفخري", "دوالي الخصية"],
  ] as const) {
    const profile = landingSearchProfile(slug)!;
    assert.ok(profile.intro.includes(name));
    assert.ok(JSON.stringify(profile).includes(topic));
  }
});

test("public editor-state removal preserves form fields, layout choices and adjacent content", () => {
  const content =
    '<div class="rv-builder-page" data-blocks="%5B%7B%22secretEditorState%22%3A1%7D%5D" data-layout="canvas" data-header="false"><h1>العنوان</h1><form action="/api/leads" method="post"><input name="source" value="حجز"><input name="utm_source" value=""><button>إرسال</button></form></div>';
  const stripped = stripCustomPageEditorState(content);
  assert.equal(stripped, content.replace(/ data-blocks="[^"]*"/, ""));
  assert.equal(stripCustomPageEditorState(stripped), stripped);
  const singleQuotes =
    "<section data-blocks='%5B%5D' data-footer='false'>محتوى</section>";
  assert.equal(
    stripCustomPageEditorState(singleQuotes),
    "<section data-footer='false'>محتوى</section>",
  );
  assert.equal(
    stripCustomPageEditorState("نص data-blocks=شرح بدون عنصر HTML"),
    "نص data-blocks=شرح بدون عنصر HTML",
  );
});

test("measured intrinsic sizes reserve image space without guessing or overriding CMS choices", () => {
  const image = optimizeCustomPageImages(
    '<img src="/media/brand/logo-light-header.png" style="width:170px;height:58px">',
  );
  assert.match(image, /width="480" height="235"/);
  assert.ok(image.includes('style="width:170px;height:58px"'));
  assert.ok(image.includes('loading="eager"'));
  const explicit = optimizeCustomPageImages(
    '<img src="/media/brand/logo-light-header.png" width="170" height="58" loading="lazy">',
  );
  assert.match(explicit, /width="170" height="58" loading="lazy"/);
  assert.equal((explicit.match(/width=/g) || []).length, 1);
  const unknown = optimizeCustomPageImages(
    '<img src="https://example.org/new-photo.webp">',
  );
  assert.ok(!unknown.includes(" width="));
  assert.ok(!unknown.includes(" height="));
  const deferred = optimizeCustomPageImages(
    '<img data-src="/media/brand/logo-light-header.png">',
  );
  assert.ok(!deferred.includes(" width="));
});
