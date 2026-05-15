"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    appendSnippet(document.head, customHeadCode, "head");
    appendSnippet(document.body, customBodyCode, "body");
    return () => {
      document.querySelectorAll("[data-rejuvira-snippet]").forEach((node) => node.remove());
    };
  }, [customHeadCode, customBodyCode]);

  useEffect(() => {
    document.querySelectorAll('[data-rejuvira-chatbase="true"]').forEach((node) => node.remove());
    if (!chatbaseEnabled || !chatbaseWidgetId.trim()) return;

    const config = document.createElement("script");
    config.dataset.rejuviraChatbase = "true";
    config.text = `window.embeddedChatbotConfig={chatbotId:${JSON.stringify(chatbaseWidgetId.trim())},domain:"www.chatbase.co"};`;
    document.body.appendChild(config);

    const script = document.createElement("script");
    script.dataset.rejuviraChatbase = "true";
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    script.setAttribute("chatbotId", chatbaseWidgetId.trim());
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);

    return () => {
      document.querySelectorAll('[data-rejuvira-chatbase="true"]').forEach((node) => node.remove());
    };
  }, [chatbaseEnabled, chatbaseWidgetId]);

  return null;
}
