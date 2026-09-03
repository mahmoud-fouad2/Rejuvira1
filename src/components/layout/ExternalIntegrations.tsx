"use client";

import { useEffect, useMemo } from "react";

type ExternalIntegrationsProps = {
  chatbaseEnabled: boolean;
  chatbaseWidgetId: string;
  customHeadCode: string;
  customBodyCode: string;
};

const DEFAULT_CHATBASE_ID = "wjegZOeOaeYGtbw422le3";

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
      /https?:\/\/(?:www\.)?faheemly\.com\/api\/widget\//.test(input)
    ) {
      const proxiedUrl = input.replace(
        /https?:\/\/(?:www\.)?faheemly\.com\/api\/widget\//,
        `${window.location.origin}/api/widget/`,
      );
      return originalFetch.call(this, proxiedUrl, init);
    }
    return originalFetch.apply(this, [input, init]);
  };
}

function appendSnippet(target: HTMLElement, html: string, marker: string) {
  setupFaheemlyProxyInterceptor();
  const existing = document.querySelectorAll(
    `[data-rejuvira-snippet="${marker}"]`,
  );
  existing.forEach((node) => node.remove());
  if (!html.trim()) return;

  // Auto-fix non-www faheemly URLs to prevent 307 redirect CORS blocks
  const normalizedHtml = html.replace(
    /https?:\/\/faheemly\.com/g,
    "https://www.faheemly.com",
  );

  const template = document.createElement("template");
  template.innerHTML = normalizedHtml.trim();
  const nodes = Array.from(template.content.childNodes);
  nodes.forEach((node) => {
    let nextNode = node.cloneNode(true) as ChildNode;
    if (node.nodeName.toLowerCase() === "script") {
      const sourceScript = node as HTMLScriptElement;
      const scriptContent =
        `${sourceScript.src} ${sourceScript.text}`.toLowerCase();
      if (scriptContent.includes("chatbase")) return;
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

      // Route Faheemly config calls to our same-origin /api/widget proxy
      if (
        scriptContent.includes("faheemly") ||
        sourceScript.hasAttribute("data-business-id")
      ) {
        script.setAttribute("data-api-url", window.location.origin);
      }

      nextNode = script;
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
  chatbaseEnabled,
  chatbaseWidgetId,
  customHeadCode,
  customBodyCode,
}: ExternalIntegrationsProps) {
  const chatId = useMemo(
    () => normalizeChatbaseId(chatbaseWidgetId),
    [chatbaseWidgetId],
  );

  useEffect(() => {
    appendSnippet(document.head, customHeadCode, "head");
    appendSnippet(document.body, customBodyCode, "body");
    return () => {
      document
        .querySelectorAll("[data-rejuvira-snippet]")
        .forEach((node) => node.remove());
    };
  }, [customHeadCode, customBodyCode]);

  useEffect(() => {
    if (!chatbaseEnabled) {
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
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = chatId;
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);

    return () => {
      script.remove();
      removeChatbaseArtifacts(chatId);
    };
  }, [chatbaseEnabled, chatId]);

  return null;
}
