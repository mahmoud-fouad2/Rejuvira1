"use client";

import { useState } from "react";

export function ReconcileCoreContentButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !window.confirm(
        "سيتم مزامنة الأقسام والخدمات والأطباء والأجهزة من الشجرة المعتمدة. هل تريد المتابعة؟",
      )
    ) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/seed-core", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        stdout?: string;
        stderr?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setMessage(
          payload.stderr ||
            payload.error ||
            "تعذر مزامنة المحتوى الأساسي. راجع سجل الخادم.",
        );
        return;
      }

      setMessage(
        payload.stdout ||
          "تمت مزامنة المحتوى الأساسي. حدّث الصفحة لرؤية الأقسام والخدمات.",
      );
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage("تعذر الاتصال بالخادم أثناء المزامنة.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="admin-btn-secondary"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "جارٍ المزامنة…" : "مزامنة شجرة الخدمات المعتمدة"}
      </button>
      {message ? (
        <p className="text-sm opacity-80" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
