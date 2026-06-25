# REJUVERA — Analytics & Tracking Audit

- المصدر: كود (`lead-conversion-tracking.ts`, `layout.tsx`, `google-tag.ts`, `api/analytics`, `ContactForm.tsx`, `LeadConversionTracker.tsx`).
- **لا وصول GA4/Ads/Meta** → لا يمكن تأكيد أن التتبّع مُفعّل فعليًا في الإنتاج؛ مُوسوم أدناه.

## ما هو سليم (مؤكد كودًا)

### TRACK-001 (إيجابي) — التحويل يُطلق على نجاح حقيقي لا على نقر
- نموذج التواصل: `ContactForm.tsx:213` → `trackLeadConversion` فقط عند `response.ok && data.status==="success" && !data.duplicate`.
- مسار الهبوط (redirect): `LeadConversionTracker.tsx:16-36` → يُطلق فقط عند `?lead=success` في الـ URL، مع dedupe عبر `sessionStorage` (`:20-22`).
- الأحداث: `dataLayer` (`lead_submit` + `form_success`)، GA4 `gtag('event','lead_submit',...)`، Meta `fbq('track','Lead',..., {eventID})` (`lead-conversion-tracking.ts:99-129`).
- التكرارات (`duplicate`) **لا** تُحتسب تحويلًا (الشرط `!duplicate`). جيد.

### بنية التهيئة
- Google Tag (gtag أو GTM) يُحقن فقط إن `googleTagEnabled` من إعدادات DB وليس صفحة admin/auth (`layout.tsx:182-185,227-251`)، مع تطبيع المعرّف (`google-tag.ts`).
- التقاط UTM: سكربت يخزّن utm_* في localStorage ويملأ حقول النماذج المخفية + `pageUrl/landingPageUrl/referrerUrl` (`layout.tsx:286`).
- خادميًا: UTM/landing/referrer تُحفظ مع الـ lead (`api/leads/route.ts:401-411`, `getLeadRequestMetadata`).

## المشاكل / المخاطر

### TRACK-002 (Medium، غير مؤكد) — هل التتبّع مُفعّل إنتاجيًا؟
- المعرّفات ليست في الكود؛ تأتي من إعدادات DB (`integrations.googleTagUrl/Enabled`). لا يمكن تأكيد وجود GA4/Ads/Meta نشط دون فحص الإنتاج.
- تحقّق: على الإنتاج، فحص `dataLayer`/network لطلبات gtag/collect + Meta `fbq`.

### TRACK-004 (Medium) — leads الهبوط بلا reCAPTCHA → تلويث تحويلات
- مرتبط بـ SEC-001: بوتات قد تُنتج `lead_submit`/`Lead` حقيقية المظهر عبر مسار النجاح (redirect `?lead=success`).
- العلاج: تأمين `/api/leads` (reCAPTCHA) قبل الاعتماد على دقّة `generate_lead`.

### TRACK-003 (Low) — Meta Lead قد يُسقَط
- `lead-conversion-tracking.ts:51-71`: إن لم يحمّل `fbq` خلال ~3ث (12 محاولة × 250ملّي) يُسقَط الحدث صامتًا. لا CAPI خادمي.
- العلاج: Conversions API خادمي مع نفس `eventID` (موجود) لإزالة التكرار وضمان التسليم.

### TRACK-005 (Info، جزئي) — أحداث WhatsApp/Call
- `/api/analytics` يسجّل pageviews فقط (لا أحداث نقر). مراجع `wa.me` في الفوتر/الاتصال موجودة لكن **لم يُتحقّق** من إطلاق حدث `whatsapp_click`/`call_click` متمايز عن `generate_lead`.
- تحقّق مطلوب: قراءة كاملة لمكوّنات الاتصال/الفوتر + فحص dataLayer حي. توصية: أحداث نقر متمايزة (لا تُحتسب lead).

### TRACK-006 (Info) — تتبّع تنقّل SPA
- `PageViewTracker` يُرسل إلى `/api/analytics`؛ لم يُتحقّق من سلوكه عند تنقّل client-side (تكرار/إغفال page_view) — يلزم فحص المكوّن + الحي.

### TRACK-007 (Info) — consent
- لا يظهر في الكود منطق consent/CMP قبل تحميل الوسوم (الوسوم تُحمّل عند التفعيل مباشرة). إن استُهدِفت أسواق تتطلب موافقة، يلزم Consent Mode. (السوق الأساسي السعودية.)

## قائمة تحقّق ميدانية (تتطلب وصولًا/إنتاجًا)
- [ ] GA4 `lead_submit` يصل مرة واحدة لكل lead حقيقي (لا على النقر).
- [ ] لا ازدواج `page_view` عند تنقّل SPA.
- [ ] Google Ads conversion مربوط بـ `lead_submit` لا بالنقر.
- [ ] Meta `Lead` بـ eventID فريد + CAPI dedup.
- [ ] استبعاد ترافيك داخلي/اختبار.
- [ ] WhatsApp/Call كأحداث متمايزة.
