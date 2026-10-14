# تدقيق صفحات الهبوط - 14 أكتوبر 2026

نشر Main: 02fa34cf28aaf1340cb4b7706a5223141f34616c. تم التحقق من المحتوى المنشور على 21 صفحة، و42 سؤالًا وإجابة جديدة. بطاقة أكتوبر القديمة غائبة، والنماذج والـcanonical والعناوين الأصلية محفوظة. النصوص الجديدة تظهر من السيرفر دون استيراد.

## السرعة

قياس Lighthouse 13.5 على Chrome، محاكاة جوال، جولة واحدة لكل صفحة قبل وبعد. هذا قياس مختبري ويتأثر بالتتبع والشبكة ولا يثبت نتيجة زيارات Google الحقيقية. لم يتوفر وصول إلى Search Console أو CrUX لهذا الفحص.

تحسن 18 من 21 درجة. وسيط الأداء 49 ← 65، وسيط LCP 5.03 ← 3.37 ثانية، وسيط TBT 1029 ← 774 مللي ثانية.

| الصفحة                                                                 | الدرجة قبل | الدرجة بعد | LCP قبل (ث) | LCP بعد (ث) | CLS بعد |
| ---------------------------------------------------------------------- | ---------: | ---------: | ----------: | ----------: | ------: |
| [body-contouring-riyadh](https://rejuvera.sa/p/body-contouring-riyadh) |         66 |         65 |        3.86 |        3.60 |   0.040 |
| [body-pro](https://rejuvera.sa/p/body-pro)                             |         40 |         76 |       15.43 |        3.24 |   0.001 |
| [breast-surgery-riyadh](https://rejuvera.sa/p/breast-surgery-riyadh)   |         60 |         78 |        3.99 |        3.38 |   0.000 |
| [derma-offers](https://rejuvera.sa/p/derma-offers)                     |         63 |         79 |        3.26 |        3.37 |   0.004 |
| [dr-abdullah-alfakhri](https://rejuvera.sa/p/dr-abdullah-alfakhri)     |         48 |         88 |        4.08 |        2.69 |   0.000 |
| [dr-eman-alzahrani](https://rejuvera.sa/p/dr-eman-alzahrani)           |         38 |         80 |        6.29 |        3.24 |   0.040 |
| [dr-karima-jamjoom](https://rejuvera.sa/p/dr-karima-jamjoom)           |         43 |         53 |        6.53 |        5.98 |   0.000 |
| [dr-maher-alahdab](https://rejuvera.sa/p/dr-maher-alahdab)             |         38 |         63 |        5.42 |        3.37 |   0.196 |
| [dr-natali-domloj](https://rejuvera.sa/p/dr-natali-domloj)             |         72 |         70 |        2.29 |        2.70 |   0.018 |
| [dr-saham-arfaj](https://rejuvera.sa/p/dr-saham-arfaj)                 |         49 |         65 |        5.43 |        2.92 |   0.148 |
| [eid-offers](https://rejuvera.sa/p/eid-offers)                         |         45 |         60 |        4.58 |        3.30 |   0.141 |
| [exclusive-offers](https://rejuvera.sa/p/exclusive-offers)             |         66 |         85 |        3.48 |        2.63 |   0.002 |
| [facelift-riyadh](https://rejuvera.sa/p/facelift-riyadh)               |         42 |         87 |        7.00 |        3.00 |   0.025 |
| [lipedema-riyadh](https://rejuvera.sa/p/lipedema-riyadh)               |         43 |         55 |        5.03 |        4.14 |   0.002 |
| [lp-face-neck-lift](https://rejuvera.sa/p/lp-face-neck-lift)           |         47 |         52 |        5.17 |       10.02 |   0.000 |
| [najwa-batarfi](https://rejuvera.sa/p/najwa-batarfi)                   |         55 |         63 |        4.03 |        6.45 |   0.016 |
| [plastic-surgery-riyadh](https://rejuvera.sa/p/plastic-surgery-riyadh) |         58 |         63 |        4.61 |        3.38 |   0.025 |
| [prof-bandar-alharthi](https://rejuvera.sa/p/prof-bandar-alharthi)     |         49 |         40 |        7.35 |        7.21 |   0.114 |
| [rejuvera-booking](https://rejuvera.sa/p/rejuvera-booking)             |         43 |         69 |        7.86 |        2.88 |   0.020 |
| [rejuvera-social-media](https://rejuvera.sa/p/rejuvera-social-media)   |         53 |         62 |        5.92 |        3.09 |   0.006 |
| [tiktok-customer](https://rejuvera.sa/p/tiktok-customer)               |         55 |         65 |        4.90 |        4.01 |   0.001 |

## ما بقي ظاهرًا في القياس

الصفحات لم تصل جميعها إلى أداء مثالي. سكربتات الجهات الخارجية ما زالت تسبب حجبًا ملحوظًا. ظهرت تغيرات تخطيط في سهام وماهر وعروض العيد وبندر؛ نحتاج عزل عنصر التحرك من أثر الودجات في جولة مستقلة قبل تعديل تصميم CMS. LCP صفحات lp-face-neck-lift ونجوى وبندر ظل مرتفعًا في الجولة. لا نزعم أن كل صفحة تحسنت في كل مؤشر.

## تغييرات آمنة

- إزالة السكربت المستقل للبطاقة فقط، مع نسخة استرجاع في AppLog ضمن معاملة محمية من التعديلات المتزامنة.
- نص مخصص لكل طبيب وخدمة، وأسئلة بحث طويلة طبيعية دون ترتيب أو نتيجة علاجية مزعومة.
- وقف مؤشر الفأرة وطبقة التحميل وحركة دخول الجسم على صفحات الهبوط.
- حذف بيانات محرر data-blocks من HTML العام دون تغيير CMS.
- أبعاد صور من ملفات فعلية محددة، دون تخمين أو إعادة ضغط على السيرفر.

## إثبات التحقق

live-verification.json يحوي نتيجة كل صفحة، مع مقارنة النماذج قبل وبعد وتثبيت 42 إجابة منشورة. التقارير الأصلية lighthouse-before/after لكل صفحة متاحة في نفس مجلد التدقيق. اختبارات الإصدار الأول 102 ناجحة وبناء الإنتاج ناجح. إصلاح سناب اللاحق موثق بشكل منفصل ولم يدخل جولة المقارنة هذه.
