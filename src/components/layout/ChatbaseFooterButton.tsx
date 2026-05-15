"use client";

type ChatbaseFunction = ((...args: unknown[]) => unknown) & { q?: unknown[] };

declare global {
  interface Window {
    chatbase?: ChatbaseFunction;
  }
}

export function ChatbaseFooterButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <button
      type="button"
      className="rv-footer-chat-button"
      onClick={() => {
        if (typeof window.chatbase === "function") {
          window.chatbase("open");
        }
      }}
    >
      <span className="lang-ar">تحدثي معنا</span>
      <span className="lang-en">Chat with us</span>
    </button>
  );
}
