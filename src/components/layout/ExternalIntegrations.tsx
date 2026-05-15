"use client";

import { useEffect, useMemo, useState } from "react";

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
  const existing = document.querySelectorAll(`[data-rejuvira-snippet="${marker}"]`);
  existing.forEach((node) => node.remove());
  if (!html.trim()) return;

  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const nodes = Array.from(template.content.childNodes);
  nodes.forEach((node) => {
    let nextNode = node.cloneNode(true) as ChildNode;
    if (node.nodeName.toLowerCase() === "script") {
      const sourceScript = node as HTMLScriptElement;
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

export function ExternalIntegrations({
  chatbaseEnabled,
  chatbaseWidgetId,
  customHeadCode,
  customBodyCode,
}: ExternalIntegrationsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const chatId = useMemo(() => normalizeChatbaseId(chatbaseWidgetId), [chatbaseWidgetId]);

  useEffect(() => {
    appendSnippet(document.head, customHeadCode, "head");
    appendSnippet(document.body, customBodyCode, "body");
    return () => {
      document.querySelectorAll("[data-rejuvira-snippet]").forEach((node) => node.remove());
    };
  }, [customHeadCode, customBodyCode]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!chatbaseEnabled || isMobile) return;

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
    };
  }, [chatbaseEnabled, chatId, isMobile]);

  if (!chatbaseEnabled) return null;

  return (
    <>
      <button
        type="button"
        className="rv-chatbase-floating-button"
        onClick={() => {
          if (isMobile) {
            setMobileChatOpen(true);
            return;
          }
          if (typeof window.chatbase === "function") {
            window.chatbase("open");
          }
        }}
        aria-label="Open Rejuvira chat"
      >
        <span className="lang-ar">تحدثي معنا</span>
        <span className="lang-en">Chat</span>
      </button>
      {isMobile && mobileChatOpen ? (
        <div className="rv-chatbase-mobile-panel" role="dialog" aria-modal="true" aria-label="Rejuvira chat">
          <div className="rv-chatbase-mobile-head">
            <span>
              <span className="lang-ar">محادثة ريجوفيرا</span>
              <span className="lang-en">Rejuvira chat</span>
            </span>
            <button type="button" onClick={() => setMobileChatOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>
          <iframe
            src={`https://www.chatbase.co/chatbot-iframe/${chatId}`}
            title="Rejuvira Chatbase"
            loading="lazy"
          />
        </div>
      ) : null}
    </>
  );
}
