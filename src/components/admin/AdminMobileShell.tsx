"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  brand: React.ReactNode;
  sidebar: React.ReactNode;
  topbarMeta: React.ReactNode;
  children: React.ReactNode;
};

export function AdminMobileShell({ brand, sidebar, topbarMeta, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="admin-shell__layout" data-mobile-open={open ? "true" : "false"}>
      <button
        type="button"
        className="admin-shell__mobile-backdrop"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <aside className="admin-shell__sidebar" aria-label="Admin sidebar">
        {sidebar}
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__topbar">
          <button
            type="button"
            className="admin-shell__hamburger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden>
              {open ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </span>
          </button>
          <div className="admin-shell__topbar-brand">{brand}</div>
          <div className="admin-shell__topbar-meta">{topbarMeta}</div>
        </header>

        <main className="admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
