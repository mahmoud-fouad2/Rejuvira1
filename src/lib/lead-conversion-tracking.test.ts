import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { claimConversionId } from "./conversion-dedupe.ts";
import {
  buildContactClickDataLayerEvent,
  buildLeadDataLayerEvent,
} from "./lead-analytics.ts";

function harness() {
  const calls: Array<{ sdk: string; args: unknown[] }> = [];
  const timers: Array<() => void> = [];
  const record =
    (sdk: string) =>
    (...args: unknown[]) => {
      calls.push({ sdk, args });
    };
  const window = {
    dataLayer: [] as Record<string, unknown>[],
    location: { href: "https://rejuvera.sa/" },
    gtag: record("google") as ((...args: unknown[]) => void) | undefined,
    fbq: record("meta") as ((...args: unknown[]) => void) | undefined,
    ttq: record("tiktok") as ((...args: unknown[]) => void) | undefined,
    setTimeout: (fn: () => void) => timers.push(fn),
    sessionStorage: { getItem: () => null, setItem: () => {} },
  };
  const exports = {} as {
    trackLeadConversion: (payload: {
      requestId?: string;
      snapDedupId?: string;
    }) => boolean;
    trackContactLinkConversion: (kind: "phone" | "whatsapp") => void;
  };
  const source = readFileSync(
    new URL("./lead-conversion-tracking.ts", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      window,
      require: (id: string) => {
        if (id === "@/lib/snap-pixel") {
          return { fireSnapSignUp: record("snap") };
        }
        if (id === "@/lib/conversion-dedupe") return { claimConversionId };
        if (id === "@/lib/lead-analytics") {
          return { buildContactClickDataLayerEvent, buildLeadDataLayerEvent };
        }
        throw new Error(`Unexpected module: ${id}`);
      },
    },
  );
  return {
    window,
    calls,
    timers,
    track: exports.trackLeadConversion,
    trackContact: exports.trackContactLinkConversion,
  };
}

function contactClickHarness() {
  const h = harness();
  let clickListener: ((event: { target: unknown }) => void) | undefined;
  type Anchor = { href: string; dataset: { googleAdsPhoneCta?: string } };
  class ClickTarget {
    private anchor: Anchor;
    constructor(anchor: Anchor) {
      this.anchor = anchor;
    }
    closest() {
      return this.anchor;
    }
  }
  const modules: Record<string, unknown> = {
    react: { useEffect: (effect: () => void) => effect() },
    "react/jsx-runtime": {
      jsx: (type: string, props: Record<string, unknown>) => ({ type, props }),
    },
    "@/lib/lead-conversion-tracking": {
      trackContactLinkConversion: h.trackContact,
      trackLeadConversion: h.track,
    },
  };
  const load = (path: string) => {
    const exports: Record<string, unknown> = {};
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    vm.runInNewContext(
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
      {
        exports,
        window: h.window,
        URL,
        Element: ClickTarget,
        document: {
          addEventListener: (
            type: string,
            listener: (event: { target: unknown }) => void,
          ) => {
            if (type === "click") clickListener = listener;
          },
          removeEventListener: () => {},
        },
        require: (id: string) => {
          if (id in modules) return modules[id];
          throw new Error(`Unexpected module: ${id}`);
        },
      },
    );
    return exports;
  };
  const tracker = load("../components/layout/LeadConversionTracker.tsx");
  (tracker.LeadConversionTracker as () => null)();
  const component = load("../components/contact/PhoneCallLink.tsx");
  const PhoneCallLink = component.PhoneCallLink as (props: {
    href: string;
  }) => {
    props: {
      href: string;
      "data-google-ads-phone-cta": string;
      onClick: (event: { preventDefault: () => void }) => void;
    };
  };
  const link = PhoneCallLink({ href: "tel:0114999959" });
  const click = (componentLink: boolean) => {
    let defaultPrevented = false;
    const event = {
      target: new ClickTarget({
        href: link.props.href,
        dataset: componentLink
          ? { googleAdsPhoneCta: link.props["data-google-ads-phone-cta"] }
          : {},
      }),
      preventDefault: () => {
        defaultPrevented = true;
      },
    };
    // Match browser propagation: the capture listener precedes React's onClick.
    clickListener?.(event);
    if (componentLink) link.props.onClick(event);
    return defaultPrevented;
  };
  return { ...h, link, click };
}

for (const componentLink of [true, false]) {
  test(`${componentLink ? "PhoneCallLink" : "HTML tel link"} sends one contact event and one Ads conversion`, () => {
    const h = contactClickHarness();
    assert.equal(h.click(componentLink), false);
    assert.equal(h.link.props.href, "tel:0114999959");
    assert.equal(h.window.dataLayer.length, 1);
    const event = h.window.dataLayer[0]!;
    assert.equal(event.event, "phone_click");
    assert.equal(h.calls.length, 1);
    const call = h.calls[0]!;
    assert.equal(call.sdk, "google");
    assert.equal(call.args[0], "event");
    assert.equal(call.args[1], "conversion");
    const params = call.args[2] as Record<string, unknown>;
    assert.equal(params.send_to, "AW-16511038360/VzZpCLHk4uocEJjnicE9");
    assert.equal(params.transaction_id, event.event_id);
    assert.equal(h.timers.length, 0);
  });
}

test("a failing Google SDK does not prevent native phone navigation or replay the conversion", () => {
  const h = contactClickHarness();
  h.window.gtag = () => {
    throw new Error("SDK failure");
  };
  assert.doesNotThrow(() => assert.equal(h.click(true), false));
  assert.equal(h.link.props.href, "tel:0114999959");
  assert.equal(h.window.dataLayer.length, 1);
  assert.equal(h.calls.length, 0);
  assert.equal(h.timers.length, 0);
});

test("one saved booking emits one Snap signal and preserves existing event names", () => {
  const h = harness();
  const payload = { requestId: "saved_1", snapDedupId: "rv_snap_saved_1" };
  assert.equal(h.track(payload), true);
  assert.equal(h.track(payload), false);
  assert.deepEqual(
    h.calls.map(({ sdk }) => sdk),
    ["google", "google", "meta", "tiktok", "snap"],
  );
  assert.deepEqual(h.calls.at(-1), {
    sdk: "snap",
    args: [payload.snapDedupId],
  });
  assert.equal(h.calls[0]?.args[1], "lead_submit");
  assert.equal(h.calls[1]?.args[1], "conversion");
  assert.equal(h.calls[2]?.args[1], "Lead");
  assert.equal(h.calls[3]?.args[1], "Lead");
  assert.equal(h.timers.length, 0);
});

for (const sdk of ["gtag", "fbq", "ttq"] as const) {
  test(`${sdk} failure cannot interrupt booking success or suppress Snap`, () => {
    const h = harness();
    h.window[sdk] = () => {
      throw new Error("SDK failure");
    };
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), true);
    assert.equal(h.calls.filter((call) => call.sdk === "snap").length, 1);
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), false);
    assert.equal(h.timers.length, 0);
  });

  test(`${sdk} failure after deferred loading is contained without replaying Snap`, () => {
    const h = harness();
    h.window[sdk] = undefined;
    assert.equal(h.track({ requestId: "saved", snapDedupId: "shared" }), true);
    assert.ok(h.timers.length > 0);
    h.window[sdk] = () => {
      throw new Error("SDK failure after load");
    };
    for (const timer of h.timers.splice(0)) assert.doesNotThrow(timer);
    assert.equal(h.calls.filter((call) => call.sdk === "snap").length, 1);
    assert.equal(h.timers.length, 0);
  });
}

test("missing saved request ID cannot emit a conversion", () => {
  const h = harness();
  assert.equal(h.track({ snapDedupId: "unconfirmed" }), false);
  assert.equal(h.calls.length, 0);
  assert.equal(h.timers.length, 0);
});
