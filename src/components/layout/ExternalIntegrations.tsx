"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { isSnapMeasurementBootstrap } from "@/lib/snap-integration";
import {
  normalizeIntegrationHtml,
  normalizeIntegrationSnippets,
  isFaceliftDistraction,
} from "@/lib/integration-snippets";

type ExternalIntegrationsProps = {
  nonce: string;
  chatbaseEnabled: boolean;
  chatbaseWidgetId: string;
  customHeadCode: string;
  customBodyCode: string;
};

const DEFAULT_CHATBASE_ID = "wjegZOeOaeYGtbw422le3";
// Removing an injected element cannot undo its global SDK/listeners. Remember
// executed measurement scripts across effect cleanup, Strict Mode and routing.
const executedMeasurementScripts = new Set<string>();

type ChatbaseFunction = ((...args: unknown[]) => unknown) & { q?: unknown[] };

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}

function setupFaheemlyProxyInterceptor() {
  if (typeof window === "undefined") return;
  const win = window as unknown as { __faheemly_proxy_set?: boolean };
  if (win.__faheemly_proxy_set) return;
  win.__faheemly_proxy_set = true;

  const originalFetch = window.fetch;
  window.fetch = function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (
      typeof input === "string" &&
      /https?:\/\/(?:www\.)?faheemly\.com\/api\//.test(input)
    ) {
      const proxiedUrl = input.replace(
        /https?:\/\/(?:www\.)?faheemly\.com\/api\//,
        `${window.location.origin}/api/`,
      );
      return originalFetch.call(this, proxiedUrl, init);
    }
    return originalFetch.apply(this, [input, init]);
  };
}

function appendSnippet(
  target: HTMLElement,
  html: string,
  marker: string,
  nonce: string,
  focusedFacelift = false,
) {
  setupFaheemlyProxyInterceptor();
  const existing = document.querySelectorAll(
    `[data-rejuvira-snippet="${marker}"]:not([data-rejuvira-measurement])`,
  );
  existing.forEach((node) => node.remove());
  if (!html.trim()) return;

  const normalizedHtml = normalizeIntegrationHtml(html);

  const template = document.createElement("template");
  template.innerHTML = normalizedHtml.trim();
  const nodes = Array.from(template.content.childNodes);
  nodes.forEach((node) => {
    if (
      focusedFacelift &&
      node instanceof HTMLElement &&
      isFaceliftDistraction(
        `${node.getAttribute("src") ?? ""} ${node.textContent ?? ""}`,
      )
    )
      return;
    let nextNode = node.cloneNode(true) as ChildNode;
    if (node.nodeName.toLowerCase() === "script") {
      const sourceScript = node as HTMLScriptElement;
      const scriptContent =
        `${sourceScript.src} ${sourceScript.text}`.toLowerCase();
      if (scriptContent.includes("chatbase")) return;
      const measurementKey = isSnapMeasurementBootstrap(sourceScript.text)
        ? `${sourceScript.src}\n${sourceScript.text}`
        : null;
      if (measurementKey && executedMeasurementScripts.has(measurementKey))
        return;
      const script = document.createElement("script");
      Array.from(sourceScript.attributes).forEach((attr) => {
        const val =
          attr.name === "src"
            ? attr.value.replace(
                /https?:\/\/faheemly\.com/g,
                "https://www.faheemly.com",
              )
            : attr.value;
        script.setAttribute(attr.name, val);
      });
      script.text = sourceScript.text.replace(
        /https?:\/\/faheemly\.com/g,
        "https://www.faheemly.com",
      );
      // Admin snippets use the same request nonce as Next's own scripts.
      // Override any stale nonce pasted into the saved integration code.
      script.nonce = nonce;

      // Route Faheemly config calls to our same-origin /api/widget proxy
      if (
        scriptContent.includes("faheemly") ||
        sourceScript.hasAttribute("data-business-id")
      ) {
        script.setAttribute("data-api-url", window.location.origin);
      }

      nextNode = script;
      if (measurementKey) {
        script.setAttribute("data-rejuvira-measurement", "true");
        executedMeasurementScripts.add(measurementKey);
      }
    }
    if (nextNode instanceof HTMLElement) {
      nextNode.dataset.rejuviraSnippet = marker;
    }
    target.appendChild(nextNode);
  });
}

function normalizeChatbaseId(value: string) {
  const requestedId = value.trim();
  return !requestedId || requestedId === "x2waiyc2hrfs58qowbowajxy8sugf9kn"
    ? DEFAULT_CHATBASE_ID
    : requestedId;
}

/**
 * Fully tear down Chatbase. Removing only the loader <script> leaves the
 * widget bubble/iframe that embed.min.js already injected, so disabling the
 * toggle appeared to "do nothing". This removes the loader, the injected
 * iframe/bubble, and resets the global so a later re-enable initializes clean.
 */
function removeChatbaseArtifacts(chatId: string) {
  const selectors = [
    `#${CSS.escape(chatId)}`,
    'script[src*="chatbase.co"]',
    'iframe[src*="chatbase.co"]',
    '[id*="chatbase"]',
    '[class*="chatbase"]',
  ];
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  }
  try {
    delete window.chatbase;
  } catch {
    /* window.chatbase is optional; ignore if non-configurable */
  }
}

export function ExternalIntegrations({
  nonce,
  chatbaseEnabled,
  chatbaseWidgetId,
  customHeadCode,
  customBodyCode,
}: ExternalIntegrationsProps) {
  const focusedFacelift = usePathname() === "/p/facelift-riyadh";
  const chatId = useMemo(
    () => normalizeChatbaseId(chatbaseWidgetId),
    [chatbaseWidgetId],
  );

  useEffect(() => {
    // Remove a card left by an older document during client-side navigation.
    document.getElementById("rejuvera-breast-awareness")?.remove();
    const snippets = normalizeIntegrationSnippets(
      customHeadCode,
      customBodyCode,
    );
    appendSnippet(
      document.head,
      snippets.customHeadCode,
      "head",
      nonce,
      focusedFacelift,
    );
    appendSnippet(
      document.body,
      snippets.customBodyCode,
      "body",
      nonce,
      focusedFacelift,
    );
    if (focusedFacelift) {
      // Covers widgets left over after a client-side navigation from another page.
      const hideDistractions = () => {
        document.getElementById("rejuvera-breast-awareness")?.remove();
        const widget = document.getElementById("fahimo-widget-root");
        if (widget) widget.hidden = true;
      };
      hideDistractions();
      const observer = new MutationObserver(hideDistractions);
      observer.observe(document.body, { childList: true });
      return () => {
        observer.disconnect();
        const widget = document.getElementById("fahimo-widget-root");
        if (widget) widget.hidden = false;
        document
          .querySelectorAll(
            "[data-rejuvira-snippet]:not([data-rejuvira-measurement])",
          )
          .forEach((node) => node.remove());
      };
    }
    return () => {
      document
        .querySelectorAll(
          "[data-rejuvira-snippet]:not([data-rejuvira-measurement])",
        )
        .forEach((node) => node.remove());
    };
  }, [customHeadCode, customBodyCode, nonce, focusedFacelift]);

  useEffect(() => {
    if (!chatbaseEnabled || focusedFacelift) {
      removeChatbaseArtifacts(chatId);
      return;
    }

    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      const queue = ((...args: unknown[]) => {
        queue.q ??= [];
        queue.q.push(args);
      }) as ChatbaseFunction;

      window.chatbase = new Proxy(queue, {
        get(target, prop) {
          if (prop === "q") return target.q;
          return (...args: unknown[]) => target(prop, ...args);
        },
      }) as ChatbaseFunction;
    }

    const existing = document.getElementById(chatId);
    if (existing) return;

    const script = document.createElement("script");
    script.nonce = nonce;
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = chatId;
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);

    return () => {
      script.remove();
      removeChatbaseArtifacts(chatId);
    };
  }, [chatbaseEnabled, chatId, nonce, focusedFacelift]);

  return null;
}
