"use client";

import { useEffect, useState } from "react";

type ExternalIntegrationsProps = {
  chatbaseEnabled: boolean;
  chatbaseWidgetId: string;
  customHeadCode: string;
  customBodyCode: string;
};

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

export function ExternalIntegrations({
  chatbaseEnabled,
  chatbaseWidgetId,
  customHeadCode,
  customBodyCode,
}: ExternalIntegrationsProps) {
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    appendSnippet(document.head, customHeadCode, "head");
    appendSnippet(document.body, customBodyCode, "body");
    return () => {
      document.querySelectorAll("[data-rejuvira-snippet]").forEach((node) => node.remove());
    };
  }, [customHeadCode, customBodyCode]);

  const chatId = chatbaseWidgetId.trim();

  return chatbaseEnabled && chatId ? (
    <div className="rv-chatbase-widget" dir="rtl">
      {chatOpen ? (
        <div className="rv-chatbase-panel">
          <div className="rv-chatbase-head">
            <span>
              <span className="lang-ar">مساعد ريجوفيرا</span>
              <span className="lang-en">Rejuvira Assistant</span>
            </span>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>
          <iframe
            src={`https://www.chatbase.co/chatbot-iframe/${encodeURIComponent(chatId)}`}
            title="Rejuvira chat assistant"
            loading="lazy"
          />
        </div>
      ) : null}
      <button type="button" className="rv-chatbase-button" onClick={() => setChatOpen((value) => !value)}>
        <span className="lang-ar">تحدثي معنا</span>
        <span className="lang-en">Chat</span>
      </button>
    </div>
  ) : null;
}
