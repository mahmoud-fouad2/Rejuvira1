"use client";

import { useActionState } from "react";

import type { PortalActionState } from "@/app/admin/patients/actions";
import { updatePortalSettingsAction } from "@/app/admin/patients/actions";
import type { PortalSettings } from "@/lib/portal/settings";

const initialState: PortalActionState = { status: "idle", message: "" };

export function PortalSettingsForm({ settings }: { settings: PortalSettings }) {
  const [state, formAction, isPending] = useActionState(
    updatePortalSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <label>
          <span className="admin-field-label">صلاحية رابط التفعيل (ساعات)</span>
          <input
            name="activationLinkHours"
            type="number"
            min={1}
            max={720}
            defaultValue={settings.activationLinkHours}
            required
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">مدة جلسة المريض (ساعات)</span>
          <input
            name="sessionHours"
            type="number"
            min={1}
            max={720}
            defaultValue={settings.sessionHours}
            required
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">الحد الأدنى لكلمة المرور</span>
          <input
            name="passwordMinLength"
            type="number"
            min={6}
            max={64}
            defaultValue={settings.passwordMinLength}
            required
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">محاولات الدخول قبل القفل</span>
          <input
            name="maxFailedLogins"
            type="number"
            min={3}
            max={20}
            defaultValue={settings.maxFailedLogins}
            required
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">مدة القفل (دقائق)</span>
          <input
            name="lockMinutes"
            type="number"
            min={1}
            max={1440}
            defaultValue={settings.lockMinutes}
            required
            className="admin-input"
          />
        </label>
        <label>
          <span className="admin-field-label">إصدار سياسة الخصوصية</span>
          <input
            name="privacyPolicyVersion"
            defaultValue={settings.privacyPolicyVersion}
            required
            maxLength={20}
            className="admin-input"
            dir="ltr"
          />
        </label>
        <label>
          <span className="admin-field-label">لغة الطباعة الافتراضية</span>
          <select
            name="defaultPrintLanguage"
            defaultValue={settings.defaultPrintLanguage}
            className="admin-input"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="both">ثنائية اللغة</option>
          </select>
        </label>
        <label>
          <span className="admin-field-label">أوقات عمل المركز (تظهر للمريض)</span>
          <input
            name="workingHours"
            defaultValue={settings.workingHours}
            maxLength={300}
            className="admin-input"
            placeholder="مثال: السبت–الخميس 9ص–9م"
          />
        </label>
        <label>
          <span className="admin-field-label">رابط تقييم Google (اختياري)</span>
          <input
            name="googleReviewUrl"
            defaultValue={settings.googleReviewUrl}
            maxLength={500}
            className="admin-input"
            dir="ltr"
            placeholder="https://g.page/..."
          />
        </label>
      </div>

      <label>
        <span className="admin-field-label">نص تذييل PDF</span>
        <textarea
          name="pdfFooterText"
          defaultValue={settings.pdfFooterText}
          rows={3}
          maxLength={2000}
          className="admin-input"
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <input
          type="checkbox"
          name="notificationsEnabled"
          value="1"
          defaultChecked={settings.notificationsEnabled}
        />
        <span>تفعيل قائمة الإشعارات (لا يُرسل شيء فعليًا قبل ربط مزود)</span>
      </label>

      {state.message ? (
        <p
          role="status"
          className={
            state.status === "success"
              ? "admin-status-badge is-success"
              : "admin-status-badge is-danger"
          }
          style={{ padding: "0.6rem 0.9rem", whiteSpace: "normal" }}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <button type="submit" className="admin-btn-primary" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
