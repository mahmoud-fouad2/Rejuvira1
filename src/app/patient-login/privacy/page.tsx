import type { Metadata } from "next";

import { getPortalSettings } from "@/lib/portal/settings";
import { getRuntimeSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سياسة خصوصية بوابة المرضى — Rejuvera",
  robots: { index: false, follow: false },
};

export default async function PortalPrivacyPage() {
  const [settings, runtime] = await Promise.all([
    getPortalSettings(),
    getRuntimeSettings(),
  ]);

  return (
    <article className="prose prose-sm mx-auto grid max-w-3xl gap-4 px-4 py-10 leading-7">
      <h1 className="text-2xl font-bold">
        سياسة خصوصية بوابة المرضى
        <span className="block text-sm font-normal opacity-60">
          الإصدار {settings.privacyPolicyVersion}
        </span>
      </h1>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">ما البيانات التي نعالجها؟</h2>
        <p>
          تعرض البوابة بياناتك الأساسية (الاسم، رقم الملف، رقم الجوال) وبيانات
          عملياتك وتعليماتها ومواعيد متابعتك ورسائلك مع الفريق والمستندات التي
          يشاركها معك المركز. تُستخدم هذه البيانات حصريًا لتقديم رعايتك
          ومتابعتها.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">من يطّلع على بياناتك؟</h2>
        <p>
          فريق مركز ريجوفيرا المصرح له فقط، وبحسب صلاحيات محددة لكل دور وظيفي.
          كل اطلاع أو تعديل أو طباعة يُسجَّل في سجل نشاط داخلي. لا نبيع بياناتك
          ولا نشاركها مع أي جهة تسويقية.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">التقييمات والانطباعات</h2>
        <p>
          تقييمك بعد العملية يصل لإدارة المركز فقط، ولا يُنشر على الموقع أو أي
          منصة عامة إلا بموافقتك الصريحة المنفصلة وبعد إخفاء هويتك بالكامل.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">حماية حسابك</h2>
        <p>
          كلمة مرورك مشفرة ولا يمكن لأي موظف الاطلاع عليها. تنتهي جلستك تلقائيًا
          بعد فترة من عدم الاستخدام، ويمكنك إنهاء جميع جلساتك من صفحة «حسابي».
          لا تشارك رابط التفعيل أو رمز التحقق مع أي شخص.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">الرسائل والإشعارات</h2>
        <p>
          لا نرسل تفاصيل طبية حساسة عبر الرسائل النصية أو الواتساب — تُستخدم
          هذه القنوات فقط لإشعارك بوجود تحديث أو لإرسال رابط الدخول.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-bold">حقوقك</h2>
        <p>
          يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو طلب إيقاف حسابك في أي
          وقت عبر التواصل مع المركز
          {runtime.contact.phone ? ` على ${runtime.contact.phone}` : ""}
          {runtime.contact.email ? ` أو عبر ${runtime.contact.email}` : ""}.
        </p>
      </section>

      <p className="text-xs opacity-60">
        هذه السياسة خاصة ببوابة المرضى وتكمل سياسة الخصوصية العامة لموقع
        المركز.
      </p>
    </article>
  );
}
