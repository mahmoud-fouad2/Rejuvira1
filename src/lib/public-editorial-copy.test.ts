import assert from "node:assert/strict";
import test from "node:test";
import {
  publicEditorialCopy,
  stripExternalReferenceLinks,
} from "./public-editorial-copy.ts";

test("reading-list paragraphs that lead to foreign sites are removed whole", () => {
  const html = [
    '<p class="d-small">معلومات عامة للتحضير للاستشارة. مراجع للقراءة: <a href="https://www.mayoclinic.org/tests-procedures/penile-implants/about/pac-20384916" target="_blank" rel="noopener noreferrer">مايو كلينك</a>.</p>',
    '<p class="rv-lg-sources">مراجع عامة: <a href="https://www.aad.org/public/cosmetic/safety">AAD</a>. التقييم يحدد ما يناسبك.</p>',
    '<p class="s-sources">إرشادات: <a href="https://www.plasticsurgery.org/cosmetic-procedures/neck-lift/questions">ASPS</a></p>',
    '<p>للقراءة: <a href="https://www.cancer.gov/types/breast/causes-risk-factors/benign-breast-lumps">المعهد الوطني للسرطان</a></p>',
    "<p>نص يبقى كما هو</p>",
  ].join("");
  const result = stripExternalReferenceLinks(html);
  assert.equal(result, "<p>نص يبقى كما هو</p>");
});

test("clinic routes, tel, WhatsApp, social and policy links survive", () => {
  const html =
    '<p>تابعنا على <a href="https://www.instagram.com/rejuvera">إنستغرام</a> و<a href="https://wa.me/966114999959">واتساب</a> و<a href="tel:0114999959">اتصال</a> و<a href="/privacy">الخصوصية</a> و<a href="https://policies.google.com/privacy">سياسة جوجل</a></p>';
  assert.equal(stripExternalReferenceLinks(html), html);
});

test("a stray reference anchor outside a paragraph is dropped without touching its neighbours", () => {
  const html =
    '<ul><li><a href="/services/neck-lift-surgery">شد الرقبة</a></li><li><a href="https://www.nhs.uk/conditions/lipoedema/">NHS</a></li></ul>';
  assert.equal(
    stripExternalReferenceLinks(html),
    '<ul><li><a href="/services/neck-lift-surgery">شد الرقبة</a></li><li></li></ul>',
  );
});

test("scripts and styles are never rewritten", () => {
  const html =
    '<script type="application/ld+json">{"sameAs":"<p><a href=\\"https://www.mayoclinic.org/x\\">x</a></p>"}</script><style>p a{color:red}</style><p>نص</p>';
  assert.equal(stripExternalReferenceLinks(html), html);
});

test("paperwork sentences in stored copy become warm lines; the consent line stays", () => {
  const html =
    '<form><button type="submit">إرسال</button><p>إرسال الطلب لا يثبت الموعد تلقائيًا؛ يتواصل فريق ريجوفيرا لتأكيد الموعد وفق التوفر.</p><p>بإرسال الطلب، أنت توافق على استخدام البيانات للتواصل معك وفق <a href="/privacy">سياسة الخصوصية</a>.</p></form><p class="d-small">إرسال الطلب لا يعني تأكيد الموعد أو ملاءمة أي إجراء. لا حاجة لكتابة تفاصيل طبية هنا.</p>';
  const result = publicEditorialCopy(html);
  assert.ok(
    result.includes("سيتواصل معك فريق ريجوفيرا لتنسيق الموعد الأنسب لك."),
  );
  assert.doesNotMatch(result, /لا يثبت|لا يعني تأكيد|وفق التوفر/);
  assert.ok(result.includes("لا حاجة لكتابة تفاصيل طبية هنا."));
  assert.ok(
    result.includes(
      "بإرسال الطلب، أنت توافق على استخدام البيانات للتواصل معك وفق",
    ),
  );
  assert.ok(result.includes('<a href="/privacy">سياسة الخصوصية</a>'));
  // Idempotent: a second pass changes nothing.
  assert.equal(publicEditorialCopy(result), result);
});

test("stored warning-style clauses and jargon link text are softened in text nodes only", () => {
  const html =
    '<details><summary>كيف أختار الطبيب؟</summary><p>احصل على شرح يناسب حالتك قبل الموافقة؛ وصف أفضل أو أحسن وحده لا يحدد الطبيب المناسب.</p></details><footer><a href="/contact">العنوان وساعات العمل</a> · <a href="/privacy">الخصوصية</a></footer>';
  const result = publicEditorialCopy(html);
  assert.ok(result.includes("احصل على شرح يناسب حالتك قبل الموافقة.</p>"));
  assert.ok(result.includes('<a href="/contact">العنوان وطرق التواصل</a>'));
  assert.doesNotMatch(result, /وصف أفضل|ساعات العمل/);
  assert.equal(publicEditorialCopy(result), result);
});

test("attributes and tags are never touched by the text replacement", () => {
  const html =
    '<input title="إرسال الطلب لا يثبت الموعد تلقائيًا؛ يؤكده الفريق بعد التواصل." name="fullName">';
  assert.equal(publicEditorialCopy(html), html);
});
