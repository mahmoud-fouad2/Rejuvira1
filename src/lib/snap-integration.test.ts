import assert from "node:assert/strict";
import test from "node:test";
import {
  stripDuplicateSnapBootstrap,
  REDUNDANT_SNAP_BOOTSTRAP,
  isSnapMeasurementBootstrap,
  stripDuplicateSnapBootstraps,
} from "./snap-integration.ts";
const gtm = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WRR5GX93');</script>`;
const manual = `<script type='text/javascript'>${REDUNDANT_SNAP_BOOTSTRAP}</script>`;
test("known manual page view is removed only alongside the verified GTM container", () => {
  const other = '<script>fbq("track","PageView");</script><p>preserve</p>';
  assert.equal(stripDuplicateSnapBootstrap(gtm + manual + other), gtm + other);
  assert.equal(stripDuplicateSnapBootstrap(manual + other), manual + other);
  assert.equal(
    stripDuplicateSnapBootstrap(
      gtm.replace("GTM-WRR5GX93", "GTM-other") + manual,
    ),
    gtm.replace("GTM-WRR5GX93", "GTM-other") + manual,
  );
  assert.equal(
    stripDuplicateSnapBootstrap(stripDuplicateSnapBootstrap(gtm + manual)),
    gtm,
  );
});
test("unknown, combined, another pixel, or conversion-bearing snippets survive cleanup", () => {
  for (const source of [
    manual.replace(
      "snaptr('track', 'PAGE_VIEW');",
      "snaptr('track', 'SIGN_UP');",
    ),
    manual.replace("98dc3177-fd0f-4210-8077-6086fa7adb54", "another-pixel"),
    manual.replace("</script>", 'fbq("track","Lead");</script>'),
  ]) {
    assert.equal(stripDuplicateSnapBootstrap(gtm + source), gtm + source);
  }
  assert.equal(isSnapMeasurementBootstrap('snaptr("track","SIGN_UP")'), false);
  assert.equal(isSnapMeasurementBootstrap('gtag("event","conversion")'), false);
  assert.equal(isSnapMeasurementBootstrap(REDUNDANT_SNAP_BOOTSTRAP), true);
});

test("head/body share one Snap bootstrap owner regardless of snippet order", () => {
  const other = '<script>fbq("track","PageView");</script><p>preserve</p>';
  assert.deepEqual(stripDuplicateSnapBootstraps([manual + other, gtm]), [
    other,
    gtm,
  ]);
  assert.deepEqual(stripDuplicateSnapBootstraps([gtm, other + manual]), [
    gtm,
    other,
  ]);
  assert.deepEqual(stripDuplicateSnapBootstraps([manual, gtm + manual]), [
    "",
    gtm,
  ]);
});

test("without the verified GTM owner keep exactly one known manual fallback", () => {
  const reformatted = manual.replace(/\n/g, " ");
  assert.deepEqual(stripDuplicateSnapBootstraps([manual, reformatted]), [
    manual,
    "",
  ]);
  assert.deepEqual(stripDuplicateSnapBootstraps(["", manual]), ["", manual]);
  const unrelatedGtm = gtm.replace("GTM-WRR5GX93", "GTM-other");
  assert.deepEqual(stripDuplicateSnapBootstraps([unrelatedGtm, manual]), [
    unrelatedGtm,
    manual,
  ]);
});

test("paired cleanup preserves other pixels and unknown or conversion-bearing code", () => {
  for (const source of [
    manual.replace("98dc3177-fd0f-4210-8077-6086fa7adb54", "another-pixel"),
    manual.replace(
      "snaptr('track', 'PAGE_VIEW');",
      "snaptr('track', 'SIGN_UP');",
    ),
    manual.replace("</script>", 'fbq("track","Lead");</script>'),
  ]) {
    assert.deepEqual(stripDuplicateSnapBootstraps([gtm, source]), [
      gtm,
      source,
    ]);
  }
  const pair = [manual, gtm];
  const once = stripDuplicateSnapBootstraps(pair);
  assert.deepEqual(stripDuplicateSnapBootstraps(once), once);
});
