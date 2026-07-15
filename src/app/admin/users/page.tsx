import { UserRole } from "@prisma/client";

import { deleteAdminUserAction } from "@/app/admin/users/actions";
import { auth } from "@/auth";
import { AdminAddModal } from "@/components/admin/AdminAddModal";
import { AdminConfirmSubmitButton } from "@/components/admin/AdminConfirmSubmitButton";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { AdminUserCreateForm } from "@/components/forms/AdminUserCreateForm";
import { AdminUserRoleForm } from "@/components/forms/AdminUserRoleForm";
import {
  getRoleLabel,
  roleDescriptions,
  roleLabels,
} from "@/lib/admin-permissions";
import { getAdminUsers } from "@/lib/content-repository";

const roleOrder: readonly UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MEDICAL_DIRECTOR,
  UserRole.DOCTOR,
  UserRole.NURSE,
  UserRole.COORDINATOR,
  UserRole.RECEPTIONIST,
  UserRole.AUDITOR,
  UserRole.EDITOR,
  UserRole.VIEWER,
];

const patientPermissionRoles = [
  {
    role: UserRole.COORDINATOR,
    scope: "صلاحية إدارة المرضى التشغيلية",
    tone: "إضافة وتعديل",
    description:
      "الدور المخصص للموظف المسؤول عن إنشاء ملفات المرضى، إضافة العمليات، تنظيم المتابعات، وإرسال روابط التفعيل بدون فتح صلاحيات السوبر أدمن.",
  },
  {
    role: UserRole.MEDICAL_DIRECTOR,
    scope: "اعتماد طبي",
    tone: "مراجعة واعتماد",
    description:
      "يراجع ملفات المرضى والقوالب والتعليمات الطبية ويعتمد المحتوى قبل النشر.",
  },
  {
    role: UserRole.DOCTOR,
    scope: "طبيب",
    tone: "ملفات وتعليمات",
    description:
      "يتابع ملفات المرضى والعمليات، يخصص التعليمات، ويرد على رسائل المرضى حسب الصلاحيات.",
  },
  {
    role: UserRole.NURSE,
    scope: "تمريض",
    tone: "متابعة ورسائل",
    description:
      "يتابع المهام والمتابعات، يراجع تأكيدات القراءة، ويتعامل مع رسائل المرضى اليومية.",
  },
  {
    role: UserRole.RECEPTIONIST,
    scope: "استقبال",
    tone: "قراءة محدودة",
    description:
      "يبحث عن المرضى ويطلع على البيانات الأساسية والمواعيد بدون تعديل طبي أو طباعة حساسة.",
  },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "R"}${parts[1]?.[0] ?? ""}`;
}

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([auth(), getAdminUsers()]);
  const groupedUsers = roleOrder.map((role) => ({
    role,
    label: roleLabels[role],
    users: users.filter((user) => user.role === role),
  }));
  const canManage = session?.user?.role === UserRole.SUPER_ADMIN;
  const tabs = [
    { value: "all", labelAr: "الكل", labelEn: "All", count: users.length },
    ...groupedUsers.map((group) => ({
      value: group.role,
      labelAr: roleLabels[group.role],
      labelEn: roleLabels[group.role],
      count: group.users.length,
    })),
    {
      value: "inactive",
      labelAr: "غير نشط",
      labelEn: "Inactive",
      count: users.filter((user) => user.isActive === false).length,
    },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>
            <span className="lang-ar">المستخدمون والصلاحيات</span>
            <span className="lang-en">Users & permissions</span>
          </h1>
          <p>
            <span className="lang-ar">{users.length} حساب إداري</span>
            <span className="lang-en">{users.length} admin accounts</span>
          </p>
        </div>
        {canManage ? (
          <div className="admin-page-header__actions">
            <AdminAddModal
              triggerArabic="إضافة حساب"
              triggerEnglish="Add user"
              titleArabic="إضافة حساب جديد"
              titleEnglish="New user"
            >
              <AdminUserCreateForm />
            </AdminAddModal>
          </div>
        ) : null}
      </div>

      <article className="admin-card admin-users-overview">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">الصلاحيات</div>
            <div className="admin-card__title">
              <span className="lang-ar">توزيع الحسابات</span>
              <span className="lang-en">Accounts by role</span>
            </div>
          </div>
        </div>
        <div className="admin-role-stats-grid">
          {groupedUsers.map((group) => (
            <div key={group.role} className="admin-role-stat">
              <div>
                <span className="admin-chip">{group.label}</span>
                <p>{group.users.length} حساب</p>
              </div>
              <strong>{group.users.length}</strong>
              <small>{roleDescriptions[group.role].summary}</small>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card admin-patient-permissions-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">إدارة المرضى</div>
            <div className="admin-card__title">
              <span className="lang-ar">صلاحيات مخصصة لبوابة وملفات المرضى</span>
              <span className="lang-en">Patient management roles</span>
            </div>
            <p className="admin-text-soft" style={{ margin: "0.25rem 0 0" }}>
              اختر دور منسق مرضى للموظف التشغيلي، أو دور طبي عند الحاجة لمراجعة
              التعليمات والملفات بدون منحه صلاحيات إدارة النظام بالكامل.
            </p>
          </div>
        </div>
        <div className="admin-patient-permissions-grid">
          {patientPermissionRoles.map((item) => (
            <section key={item.role} className="admin-patient-permission">
              <header>
                <span className="admin-chip">{roleLabels[item.role]}</span>
                <strong>{item.tone}</strong>
              </header>
              <h3>{item.scope}</h3>
              <p>{item.description}</p>
            </section>
          ))}
        </div>
      </article>

      <article className="admin-card admin-users-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">الدليل</div>
            <div className="admin-card__title">
              <span className="lang-ar">قاعدة المستخدمين</span>
              <span className="lang-en">User directory</span>
            </div>
          </div>
        </div>
        <AdminListControls
          targetId="admin-users-list"
          tabs={tabs}
          pageSize={10}
        />
        <div className="admin-table-wrap" data-admin-list="admin-users-list">
          <table className="table-hover admin-users-table table align-middle">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>الدور</th>
                <th>القسم</th>
                <th>الحالة</th>
                <th>الطلبات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  data-admin-row
                  data-admin-status={
                    user.isActive === false ? "inactive" : user.role
                  }
                  data-admin-search={[
                    user.name,
                    user.email,
                    user.role,
                    user.positionTitle,
                    user.department,
                    getRoleLabel(user.role),
                  ].join(" ")}
                >
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-avatar">
                        {initials(user.name)}
                      </span>
                      <span>
                        <strong>{user.name}</strong>
                        <small dir="ltr">{user.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="admin-status-badge is-review">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-users-table__muted">
                      {user.positionTitle || user.department
                        ? [user.positionTitle, user.department]
                            .filter(Boolean)
                            .join(" · ")
                        : "غير محدد"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${
                        user.isActive === false ? "is-archived" : "is-published"
                      }`}
                    >
                      {user.isActive === false ? "غير نشط" : "نشط"}
                    </span>
                  </td>
                  <td>
                    <span className="admin-users-table__count">
                      {user.leadCount}
                    </span>
                  </td>
                  <td>
                    <details className="admin-row-menu">
                      <summary>إجراءات</summary>
                      <div className="admin-row-menu__panel">
                        {canManage ? (
                          <AdminAddModal
                            triggerArabic="تعديل"
                            triggerEnglish="Edit"
                            titleArabic={`تعديل ${user.name}`}
                            titleEnglish={`Edit ${user.name}`}
                            triggerClassName="admin-row-menu__item"
                          >
                            <AdminUserRoleForm
                              userId={user.id}
                              currentRole={user.role}
                              positionTitle={user.positionTitle}
                              department={user.department}
                              isActive={user.isActive !== false}
                              canDeactivate={session?.user?.id !== user.id}
                            />
                          </AdminAddModal>
                        ) : null}
                        {canManage && session?.user?.id !== user.id ? (
                          <form action={deleteAdminUserAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <AdminConfirmSubmitButton
                              className="admin-row-menu__item is-danger"
                              titleArabic="تعطيل الحساب"
                              titleEnglish="Disable account"
                              messageArabic="سيتم تعطيل الحساب ومنعه من دخول لوحة الإدارة."
                              messageEnglish="This account will be disabled and blocked from the admin panel."
                              confirmArabic="تعطيل"
                              confirmEnglish="Disable"
                            >
                              تعطيل الحساب
                            </AdminConfirmSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 ? (
            <div className="admin-empty-state">
              لا توجد حسابات إدارية مسجلة.
            </div>
          ) : null}
        </div>
      </article>

      <details className="admin-card admin-collapsible-card">
        <summary className="admin-card__header">
          <div>
            <div className="admin-card__subtitle">مستويات الوصول</div>
            <div className="admin-card__title">
              <span className="lang-ar">ملخص الصلاحيات حسب الدور</span>
              <span className="lang-en">Role access summary</span>
            </div>
          </div>
          <span className="admin-btn-ghost">عرض / إخفاء</span>
        </summary>
        <div className="admin-role-profile-grid">
          {roleOrder.map((role) => {
            const description = roleDescriptions[role];
            return (
              <section key={role} className="admin-role-profile">
                <header>
                  <span className="admin-chip">{roleLabels[role]}</span>
                  <small>{description.summary}</small>
                </header>
                <div>
                  <strong>مسموح</strong>
                  <ul>
                    {description.allowed.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {description.restricted.length ? (
                  <div>
                    <strong>غير متاح</strong>
                    <ul>
                      {description.restricted.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </details>
    </>
  );
}
