import { UserRole } from "@prisma/client";

import { auth } from "@/auth";
import { AdminUserCreateForm } from "@/components/forms/AdminUserCreateForm";
import { AdminUserRoleForm } from "@/components/forms/AdminUserRoleForm";
import {
  getRoleLabel,
  permissionMatrix,
  roleLabels,
} from "@/lib/admin-permissions";
import { getAdminUsers } from "@/lib/content-repository";

const roleOrder: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.VIEWER,
];

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), getAdminUsers()]);
  const groupedUsers = roleOrder.map((role) => ({
    role,
    label: roleLabels[role],
    users: users.filter((user) => user.role === role),
  }));

  return (
    <>
      <section className="surface-panel rounded-[2.5rem] p-8 shadow-sm lg:p-12">
        <p className="eyebrow text-ink-soft">المستخدمون والصلاحيات</p>
        <h1 className="text-ink-strong mt-5 font-serif text-5xl leading-[1.1] tracking-[-0.02em]">
          إدارة الحسابات، الأدوار، وحدود الوصول.
        </h1>
        <p className="text-ink-soft mt-5 max-w-3xl text-lg leading-8">
          هذه الوحدة تجمع الحسابات التشغيلية في هيكل واضح، وتعرض مصفوفة الوصول
          المعتمدة داخل اللوحة، مع إمكانية ضبط الدور لكل مستخدم من نفس المكان.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-ink-strong font-serif text-3xl tracking-[-0.02em]">
            إضافة حساب جديد
          </h2>
          <p className="text-ink-soft mt-3 text-sm leading-7">
            أنشئ حسابًا جديدًا وحدد مستوى الوصول من البداية بما يتوافق مع مهام
            الفريق.
          </p>
          <div className="mt-8">
            <AdminUserCreateForm />
          </div>
        </article>
        <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-ink-strong font-serif text-3xl tracking-[-0.02em]">
                شجرة المستخدمين
              </h2>
              <p className="text-ink-soft mt-3 text-sm leading-7">
                الهيكل الحالي مبني على طبقات الدور التشغيلي، من الإدارة العليا
                حتى الحسابات الرقابية.
              </p>
            </div>
            <span className="border-line bg-surface text-ink-soft rounded-full border px-4 py-2 text-sm">
              عدد الحسابات: {users.length}
            </span>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {groupedUsers.map((group) => (
              <div
                key={group.role}
                className="border-line bg-surface rounded-[1.8rem] border p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-ink-strong text-lg font-semibold">
                    {group.label}
                  </p>
                  <span className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1 text-xs">
                    {group.users.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {group.users.length > 0 ? (
                    group.users.map((user) => (
                      <div
                        key={user.id}
                        className="border-line bg-canvas rounded-[1.4rem] border px-4 py-4"
                      >
                        <p className="text-ink-strong text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="text-ink-soft mt-1 text-xs" dir="ltr">
                          {user.email}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="border-line bg-canvas text-ink-soft rounded-[1.4rem] border border-dashed px-4 py-4 text-sm">
                      لا توجد حسابات ضمن هذا المستوى حاليًا.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-ink-strong font-serif text-3xl tracking-[-0.02em]">
            الحسابات الحالية
          </h2>
          <div className="mt-8 grid gap-4">
            {users.map((user) => (
              <article
                key={user.id}
                className="border-line bg-surface rounded-[1.8rem] border p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-ink-strong text-lg font-semibold">
                      {user.name}
                    </p>
                    <p className="text-ink-soft mt-1 text-sm" dir="ltr">
                      {user.email}
                    </p>
                    <div className="text-ink-soft mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="border-line bg-canvas rounded-full border px-3 py-1">
                        الدور: {getRoleLabel(user.role)}
                      </span>
                      <span className="border-line bg-canvas rounded-full border px-3 py-1">
                        الطلبات المسندة: {user.leadCount}
                      </span>
                      <span className="border-line bg-canvas rounded-full border px-3 py-1">
                        آخر دخول:{" "}
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString(
                              "ar-SA",
                            )
                          : "لم يسجل بعد"}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-[18rem]">
                    <AdminUserRoleForm
                      userId={user.id}
                      currentRole={user.role}
                    />
                    {session?.user?.id === user.id ? (
                      <p className="text-ink-faint mt-2 text-xs">
                        هذا هو الحساب المستخدم في الجلسة الحالية.
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel rounded-[2.5rem] p-8 shadow-sm">
          <h2 className="text-ink-strong font-serif text-3xl tracking-[-0.02em]">
            مصفوفة الصلاحيات
          </h2>
          <p className="text-ink-soft mt-3 text-sm leading-7">
            توضح هذه المصفوفة الأقسام التي يحق لكل مستوى وظيفي الوصول إليها داخل
            اللوحة.
          </p>
          <div className="mt-8 grid gap-3">
            {permissionMatrix.map((rule) => (
              <div
                key={rule.prefix}
                className="border-line bg-surface rounded-[1.5rem] border px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-ink-strong text-sm font-semibold">
                      {rule.label}
                    </p>
                    <p className="text-ink-faint mt-1 text-xs" dir="ltr">
                      {rule.prefix}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {rule.roles.map((role) => (
                      <span
                        key={role}
                        className="border-line bg-canvas text-ink-soft rounded-full border px-3 py-1"
                      >
                        {roleLabels[role]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
