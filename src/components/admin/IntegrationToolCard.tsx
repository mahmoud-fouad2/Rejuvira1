"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";

import type { IntegrationToolDTO } from "@/lib/integration-tools-shared";

interface Props {
  tool: IntegrationToolDTO;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function IntegrationToolCard({ tool }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function toggleStatus() {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/integration-tools/${tool.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !tool.isActive }),
        },
      );
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message ?? "Failed to update status.");
      }
      router.refresh();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function runTest() {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const sampleParams: Record<string, unknown> = {};
      for (const param of tool.parameters) {
        if (param.example) sampleParams[param.name] = param.example;
      }
      const res = await fetch(
        `/api/admin/integration-tools/${tool.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params: sampleParams }),
        },
      );
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message ?? "Test failed.");
      }
      const result = json.data as { success: boolean; message: string };
      setFeedback(
        result.success
          ? `OK — ${result.message}`
          : `Error — ${result.message}`,
      );
      router.refresh();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/integration-tools/${tool.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message ?? "Failed to delete.");
      }
      router.refresh();
    } catch (error) {
      setFeedback((error as Error).message);
      setBusy(false);
    }
  }

  const typeLabel = tool.type === "WEBHOOK" ? "Webhook" : "API Call";
  const statusLabel = tool.isActive ? "Active" : "Inactive";

  return (
    <article className="rv-itool-card">
      <header className="rv-itool-card__head">
        <div className="rv-itool-card__title-row">
          <h3 className="rv-itool-card__title">{tool.name}</h3>
          <span
            className={`rv-itool-status ${tool.isActive ? "is-active" : "is-inactive"}`}
            aria-label={statusLabel}
          >
            <span className="rv-itool-status__dot" aria-hidden />
            {statusLabel}
          </span>
        </div>
        <div className="rv-itool-card__badges">
          <span className="rv-itool-badge">{typeLabel}</span>
          <span className="rv-itool-badge rv-itool-badge--muted">
            {tool.method}
          </span>
        </div>
      </header>

      <p className="rv-itool-card__desc">{tool.description}</p>

      <footer className="rv-itool-card__foot">
        <span className="rv-itool-card__meta">
          <span className="lang-ar">آخر تحديث:</span>
          <span className="lang-en">Updated:</span>{" "}
          {formatDate(tool.updatedAt)}
        </span>
        <div className="rv-itool-card__actions">
          <Link
            className="rv-itool-btn rv-itool-btn--neutral"
            href={`/admin/integration-tools/${tool.id}` as Route}
          >
            <span className="lang-ar">تعديل</span>
            <span className="lang-en">Edit</span>
          </Link>
          <button
            type="button"
            className="rv-itool-btn rv-itool-btn--neutral"
            onClick={runTest}
            disabled={busy}
          >
            <span className="lang-ar">اختبار</span>
            <span className="lang-en">Test</span>
          </button>
          <button
            type="button"
            className={`rv-itool-btn ${tool.isActive ? "rv-itool-btn--warn" : "rv-itool-btn--success"}`}
            onClick={toggleStatus}
            disabled={busy}
          >
            {tool.isActive ? (
              <>
                <span className="lang-ar">إيقاف</span>
                <span className="lang-en">Pause</span>
              </>
            ) : (
              <>
                <span className="lang-ar">تفعيل</span>
                <span className="lang-en">Activate</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="rv-itool-btn rv-itool-btn--danger"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            aria-label="Delete"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      </footer>

      {feedback ? (
        <p className="rv-itool-card__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {confirmDelete ? (
        <div className="rv-itool-confirm" role="alertdialog">
          <p>
            <span className="lang-ar">حذف الأداة "{tool.name}"؟</span>
            <span className="lang-en">Delete tool "{tool.name}"?</span>
          </p>
          <div className="rv-itool-confirm__actions">
            <button
              type="button"
              className="rv-itool-btn rv-itool-btn--neutral"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
              <span className="lang-ar">إلغاء</span>
              <span className="lang-en">Cancel</span>
            </button>
            <button
              type="button"
              className="rv-itool-btn rv-itool-btn--danger"
              onClick={remove}
              disabled={busy}
            >
              <span className="lang-ar">حذف</span>
              <span className="lang-en">Delete</span>
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
