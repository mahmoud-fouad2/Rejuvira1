"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import {
  createAdminUserAction,
  type AdminUserActionState,
} from "@/app/admin/users/actions";

const initialState: AdminUserActionState = {
  status: "idle",
  message: "",
};

const roleOptions = [
  { value: UserRole.SUPER_ADMIN, label: "إدارة عليا / Super Admin" },
  { value: UserRole.ADMIN, label: "مدير / Admin" },
  { value: UserRole.EDITOR, label: "محرر / Editor" },
  { value: UserRole.VIEWER, label: "مراقب / Viewer" },
] as const;

export function AdminUserCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createAdminUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الاسم</span>
            <span className="lang-en">Name</span>
          </span>
          <input name="name" required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">البريد</span>
            <span className="lang-en">Email</span>
          </span>
          <input name="email" type="email" required dir="ltr" className="admin-input" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">كلمة المرور</span>
            <span className="lang-en">Password</span>
          </span>
          <input name="password" type="password" required className="admin-input" />
        </label>
        <label className="grid gap-1">
          <span className="admin-field-label">
            <span className="lang-ar">الدور</span>
            <span className="lang-en">Role</span>
          </span>
          <select name="role" defaultValue={UserRole.VIEWER} className="admin-input">
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state.message ? (
        <p className={`text-xs font-medium ${state.status === "success" ? "text-emerald" : "text-burgundy"}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="admin-btn-primary">
        {isPending ? (
          <>
            <span className="lang-ar">جاري الإضافة...</span>
            <span className="lang-en">Saving...</span>
          </>
        ) : (
          <>
            <span className="lang-ar">إضافة حساب</span>
            <span className="lang-en">Add account</span>
          </>
        )}
      </button>
    </form>
  );
}
