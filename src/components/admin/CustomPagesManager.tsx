"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";

import { AdminListControls } from "@/components/admin/AdminListControls";

type CustomPageListItem = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  status: string;
  description: string;
  searchText: string;
  updatedAt: string;
  noindex: boolean;
  blockCount: number;
};

type AdminListTab = {
  value: string;
  labelAr: string;
  labelEn: string;
  count: number;
};

function statusMeta(status: string) {
  switch (status) {
    case "PUBLISHED":
      return {
        className: "is-published",
        labelAr: "منشورة",
        labelEn: "Published",
      };
    case "REVIEW":
      return { className: "is-review", labelAr: "مراجعة", labelEn: "Review" };
    case "APPROVED":
      return {
        className: "is-published",
        labelAr: "معتمدة",
        labelEn: "Approved",
      };
    case "ARCHIVED":
      return {
        className: "is-archived",
        labelAr: "مؤرشفة",
        labelEn: "Archived",
      };
    default:
      return { className: "is-draft", labelAr: "مسودة", labelEn: "Draft" };
  }
}

export function CustomPagesManager({
  pages,
  tabs,
}: {
  pages: CustomPageListItem[];
  tabs: AdminListTab[];
}) {
  const listRef = useRef<HTMLElement>(null);
  const [items, setItems] = useState(pages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState<
    { tone: "success" | "error"; message: string } | undefined
  >();

  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectVisible() {
    const visibleIds = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(
        "[data-admin-row]:not([hidden])",
      ) ?? [],
    )
      .map((row) => row.dataset.pageId)
      .filter((id): id is string => Boolean(id));

    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function deleteSelected() {
    if (selectedItems.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setNotice(undefined);

    try {
      const response = await fetch("/api/admin/custom-pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: selectedItems.map(({ id, slug }) => ({ id, slug })),
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "تعذر حذف الصفحات المحددة.");
      }

      const deleted = new Set(selectedItems.map((item) => item.id));
      setItems((current) => current.filter((item) => !deleted.has(item.id)));
      setSelectedIds(new Set());
      setConfirmOpen(false);
      setNotice({
        tone: "success",
        message: `تم حذف ${deleted.size} صفحة بنجاح.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error ? error.message : "تعذر حذف الصفحات المحددة.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <AdminListControls targetId="admin-pages-list" tabs={tabs} />

      <div className="custom-pages-selection-toolbar">
        <button
          type="button"
          onClick={selectVisible}
          className="admin-btn-secondary"
        >
          تحديد الظاهر
        </button>
        {selectedIds.size > 0 ? (
          <>
            <span className="custom-pages-selection-toolbar__count">
              تم تحديد {selectedIds.size} صفحة
            </span>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="admin-btn-danger"
            >
              حذف المحدد
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="admin-btn-secondary"
            >
              إلغاء التحديد
            </button>
          </>
        ) : (
          <span className="custom-pages-selection-toolbar__hint">
            حددي الصفحات غير المطلوبة ثم احذفيها دفعة واحدة.
          </span>
        )}
      </div>

      {notice ? (
        <div className={`admin-inline-notice is-${notice.tone}`} role="status">
          {notice.message}
        </div>
      ) : null}

      <section
        ref={listRef}
        className="custom-pages-list"
        data-admin-list="admin-pages-list"
      >
        {items.length === 0 ? (
          <article className="admin-card">
            <div className="admin-card__body text-sm text-[color:var(--admin-text-faint)]">
              لا توجد صفحات مخصصة بعد. ابدئي بقالب PageCraft قابل للتعديل.
            </div>
          </article>
        ) : null}

        {items.map((page) => {
          const meta = statusMeta(page.status);
          const checked = selectedIds.has(page.id);

          return (
            <article
              key={page.id}
              className={`custom-page-list-card ${checked ? "is-selected" : ""}`}
              data-admin-row
              data-page-id={page.id}
              data-admin-status={page.status}
              data-admin-search={page.searchText}
            >
              <label className="custom-page-list-card__select">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(page.id)}
                  aria-label={`تحديد ${page.titleAr}`}
                />
                <span aria-hidden />
              </label>
              <div className="custom-page-list-card__preview">
                <span>{page.blockCount || "HTML"}</span>
                <small>{page.blockCount ? "مكون" : "محتوى"}</small>
              </div>
              <div className="custom-page-list-card__body">
                <div className="custom-page-list-card__title-row">
                  <div>
                    <p className="custom-page-list-card__path">
                      /p/{page.slug}
                    </p>
                    <h2>{page.titleAr}</h2>
                  </div>
                  <span className={`admin-status-badge ${meta.className}`}>
                    <span className="lang-ar">{meta.labelAr}</span>
                    <span className="lang-en">{meta.labelEn}</span>
                  </span>
                </div>
                <p className="custom-page-list-card__excerpt">
                  {page.description}
                </p>
                <div className="custom-page-list-card__meta">
                  <span>
                    آخر تعديل:{" "}
                    {new Date(page.updatedAt).toLocaleDateString("ar-SA")}
                  </span>
                  {page.noindex ? <span>Noindex</span> : null}
                </div>
                <div className="custom-page-list-card__actions">
                  <Link
                    href={`/admin/pages/${page.id}` as Route}
                    className="admin-btn-primary"
                  >
                    تعديل الصفحة
                  </Link>
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-secondary"
                  >
                    معاينة
                  </a>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={() => {
                      setSelectedIds(new Set([page.id]));
                      setConfirmOpen(true);
                    }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {confirmOpen ? (
        <div
          className="admin-modal custom-pages-confirm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="admin-modal__backdrop"
            aria-label="إغلاق"
            onClick={() => !isDeleting && setConfirmOpen(false)}
          />
          <div className="admin-modal__panel">
            <div className="admin-modal__header">
              <div>
                <small>إجراء جماعي</small>
                <h2 className="admin-modal__title">تأكيد حذف الصفحات</h2>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
                aria-label="إغلاق"
              >
                <span aria-hidden>×</span>
              </button>
            </div>
            <div className="admin-modal__body">
              <p>
                هل أنت متأكد من حذف {selectedItems.length} صفحة؟ هذا الإجراء
                يحذف الصفحات المحددة فقط ولا يلمس أي صفحة أخرى.
              </p>
              <div className="custom-pages-confirm__list">
                {selectedItems.slice(0, 6).map((page) => (
                  <span key={page.id}>/p/{page.slug}</span>
                ))}
                {selectedItems.length > 6 ? (
                  <span>+ {selectedItems.length - 6} صفحات أخرى</span>
                ) : null}
              </div>
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => void deleteSelected()}
                disabled={isDeleting || selectedItems.length === 0}
              >
                {isDeleting ? (
                  <span className="admin-button-spinner" aria-hidden />
                ) : null}
                {isDeleting ? "جاري الحذف..." : "حذف الصفحات المحددة"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
