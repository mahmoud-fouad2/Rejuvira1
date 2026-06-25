# REJUVERA — Duplication Report

> القاعدة: ليس كل تكرار خطأ؛ بعض التكرار أوضح من abstraction سيئ. لكل بند قرار مُعلَّل.

## DUP-001 (Medium) — منطق استقبال الـ lead مكرّر عبر 3 مسارات
- المواضع:
  - `src/app/api/contact/route.ts` — `formString`/`wantsJson`/`response` + بناء payload + بناء حمولة webhook (`:56-130, 261-300`).
  - `src/app/api/leads/route.ts` — `formString`/`payloadString`/`readLeadPayload`/`wantsJson`/`response` + `buildLeadWebhookPayload` (`:74-241, 414-464`).
  - `src/app/api/webhooks/[token]/route.ts` — `readBody`/`pickFirst`/`wantsJson`/`webhookResponse` (`:70-180`).
- الحجم: ~250-300 سطر متشابه وظيفيًا (قراءة JSON/form، تطبيع، حمولة webhook، استجابة).
- المخاطر: تباعد سلوك (مثلاً reCAPTCHA في contact فقط — SEC-001 — نتيجة مباشرة لغياب وحدة موحّدة)، إصلاحات تُنسى في أحد المسارات.
- القرار: **يستحق التوحيد** في وحدة `lib/lead-intake/` (parsePayload, normalizeLead, buildWebhookPayload, leadResponse, runGuards). توحيد يقلّل السطح ويمنع تكرار ثغرات.
- طريقة آمنة: استخراج تدريجي خلف نفس السلوك الحالي، مع typecheck بعد كل خطوة؛ لا تغيير لعقود الـ API.

## DUP-002 (Low) — `response()` و`wantsJson()` متطابقتان نصيًا
- `contact/route.ts:61-93` ≈ `leads/route.ts:84-241` (نفس المنطق مع اختلاف افتراضي `/contact` vs `/`).
- القرار: تُدمج ضمن وحدة DUP-001 (helper واحد بمعامل referer افتراضي).

## DUP-003 (Low) — تكرار حقول الخدمة في حمولات webhook
- نفس المفاتيح تُكرَّر بصيغ متعددة: `service/serviceName/serviceLabel/serviceType/serviceTypeAr` + `utm*` بصيغتي camelCase وsnake_case (`leads/route.ts:433-462`, `contact/route.ts:278-298`).
- المخاطر: متوسطة-منخفضة؛ هذا تكرار **مقصود للتوافق مع مستهلكين خارجيين** (CRM/Make/Zapier) يتوقّعون أسماء مختلفة.
- القرار: **إبقاؤه** (التوحيد قد يكسر تكاملات)، لكن توليده من خريطة واحدة داخل الوحدة الموحّدة لتقليل الخطأ اليدوي.

## DUP-004 (Low) — تطبيع رقم سعودي مستخدم في عدة مسارات
- `saudi-phone.ts` مُستورد في contact/leads/webhook — هذا **توحيد سليم قائم** (لا تكرار فعلي)؛ يُذكر كنموذج جيد يُحتذى.

## أنماط جيدة قائمة (لا تُلمس)
- `lib/lead-intake-guard.ts`, `lib/rate-limit.ts`, `lib/recaptcha.ts`, `lib/seo.ts`, `lib/seo-sitemaps.ts`, `lib/admin-permissions.ts` — مسؤوليات مفصولة ومعاد استخدامها.

## ملفّات ضخمة (god files) — للمتابعة لا للتكرار
- `src/lib/content-repository.ts` (~4800 سطر) — ARCH-003.
- `src/app/api/leads/route.ts` (~611 سطر) — ARCH-002.
- القرار: تقسيم تدريجي منخفض المخاطر، أولوية منخفضة، لا يُخلط مع إصلاحات سلوكية.
