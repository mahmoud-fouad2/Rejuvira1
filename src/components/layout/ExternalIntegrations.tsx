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

function appendSnippet(target: HTMLElement, html: string, marker: string) {
  const existing = document.querySelectorAll(
    `[data-rejuvira-snippet="${marker}"]`,
  );
  existing.forEach((node) => node.remove());
  if (!html.trim()) return;

  const template = document.createElement("template");
  template.innerHTML = html.trim();
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
        script.setAttribute(attr.name, attr.value);
      });
      script.text = sourceScript.text;
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
