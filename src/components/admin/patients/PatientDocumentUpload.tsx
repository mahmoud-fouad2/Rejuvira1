"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MAX_PATIENT_DOCUMENT_BYTES } from "@/lib/portal/document-upload";

export function PatientDocumentUpload({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const endpoint = `/api/admin/patients/${encodeURIComponent(patientId)}/documents`;

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (file instanceof File && file.size > MAX_PATIENT_DOCUMENT_BYTES) {
      setFailed(true);
      setMessage("الحد الأقصى لحجم الملف 8 ميغابايت.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
      });
      const { message } = await response.json() as { message: string };
      setFailed(!response.ok);
      setMessage(message);
      if (response.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setFailed(true);
      setMessage("تعذر تأكيد رفع المستند. راجع التبويب قبل إعادة المحاولة.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="admin-card"
      action={endpoint}
      method="post"
      encType="multipart/form-data"
      onSubmit={upload}
    >
      <h2>رفع مستند</h2>
      <fieldset disabled={pending} className="grid gap-3">
        <label>
          عنوان المستند
          <input className="admin-input" type="text" name="title" maxLength={160} required />
        </label>
        <label>
          الملف (PDF أو JPEG أو PNG، حتى 8 ميغابايت)
          <input className="admin-input" type="file" name="file" accept="application/pdf,image/jpeg,image/png" required />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="share" />
          إتاحة هذا المستند للمريض في بوابته
        </label>
        <button type="submit" className="admin-button admin-button--primary">
          {pending ? "جارٍ الحفظ…" : "حفظ المستند"}
        </button>
      </fieldset>
      {message ? <p role={failed ? "alert" : "status"}>{message}</p> : null}
    </form>
  );
}
