"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/app/admin/sign-out-action";

type AdminUserMenuProps = {
  name: string;
  email: string;
  roleLabel: string;
};

function initialsOf(name: string, email: string) {
  const source = name?.trim() || email?.trim() || "?";
  const tokens = source
    .replace(/[^\p{L}\p{N}\s.@-]/gu, " ")
    .split(/[\s.@-]+/)
    .filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0]!.slice(0, 2).toUpperCase();
  return (tokens[0]![0]! + tokens[1]![0]!).toUpperCase();
}

export function AdminUserMenu({ name, email, roleLabel }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const initials = initialsOf(name, email);

  return (
    <div className="admin-user-menu" ref={containerRef}>
      <button
        type="button"
        className="admin-user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="admin-user-menu__avatar" aria-hidden>
          {initials}
        </span>
        <span className="admin-user-menu__identity">
          <span className="admin-user-menu__name">{name || "Admin"}</span>
          <span className="admin-user-menu__role">{roleLabel}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="admin-user-menu__panel" role="menu">
          <div className="admin-user-menu__header">
            <span
              className="admin-user-menu__avatar admin-user-menu__avatar--lg"
              aria-hidden
            >
              {initials}
            </span>
            <span className="admin-user-menu__header-info">
              <strong className="truncate">{name || "Admin"}</strong>
              <span className="truncate" dir="ltr">
                {email}
              </span>
              <span className="admin-user-menu__role">{roleLabel}</span>
            </span>
          </div>
          <div className="admin-user-menu__divider" />
          <Link
            href={"/admin/settings" as Route}
            className="admin-user-menu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="lang-ar">إعدادات الحساب</span>
            <span className="lang-en">Account settings</span>
          </Link>
          <Link
            href={"/admin/users" as Route}
            className="admin-user-menu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="lang-ar">المستخدمون</span>
            <span className="lang-en">Users</span>
          </Link>
          <Link
            href={"/" as Route}
            className="admin-user-menu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="lang-ar">زيارة الموقع</span>
            <span className="lang-en">View site</span>
          </Link>
          <div className="admin-user-menu__divider" />
          <form action={signOutAction}>
            <button
              type="submit"
              className="admin-user-menu__item admin-user-menu__item--danger"
              role="menuitem"
            >
              <span className="lang-ar">تسجيل الخروج</span>
              <span className="lang-en">Sign out</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
