"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";

type CustomPageDeleteFormProps = {
  id: string;
  slug: string;
};

export function CustomPageDeleteForm({ id, slug }: CustomPageDeleteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/custom-pages?id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
          headers: { accept: "application/json", "x-requested-with": "fetch" },
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setMessage(
        payload?.message ||
          (response.ok ? "تم حذف الصفحة." : "تعذر حذف الصفحة."),
      );
      if (response.ok) router.refresh();
    } catch {
      setMessage("تعذر الاتصال بالخادم.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-1">
      <AdminConfirmSubmitButton
        className="admin-btn-danger"
        disabled={pending}
        titleArabic="حذف الصفحة"
        titleEnglish="Delete page"
        messageArabic="سيتم حذف هذه الصفحة المخصصة نهائيا."
        messageEnglish="This custom page will be permanently deleted."
        confirmArabic="حذف"
        confirmEnglish="Delete"
      >
        حذف
      </AdminConfirmSubmitButton>
      {message ? (
        <span className="text-muted-foreground text-[11px]">{message}</span>
      ) : null}
    </form>
  );
}
