"use client";

import { useEffect, useState } from "react";

export function WebhookCopyLink({
  token,
  pathTemplate = "/api/webhooks/",
}: {
  token: string;
  pathTemplate?: string;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const url = `${origin}${pathTemplate}${token}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="admin-input flex-1 truncate font-mono text-[12px]">
        {url || `${pathTemplate}${token}`}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className="admin-btn-secondary text-xs"
      >
        {copied ? (
          <>
            <span className="lang-ar">تم النسخ</span>
            <span className="lang-en">Copied</span>
          </>
        ) : (
          <>
            <span className="lang-ar">نسخ الرابط</span>
            <span className="lang-en">Copy link</span>
          </>
        )}
      </button>
    </div>
  );
}
