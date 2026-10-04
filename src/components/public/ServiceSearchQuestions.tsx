import Link from "next/link";

import { serviceSearchQuestions } from "@/lib/service-search-content";

export function ServiceSearchQuestions({
  slug,
  name,
  nameEn,
}: {
  slug: string;
  name: string;
  nameEn?: string | null | undefined;
}) {
  const questions = serviceSearchQuestions(slug, name, nameEn);
  if (!questions.length) return null;
  return (
    <section
      className="surface-panel rounded-[2.5rem] p-7 lg:p-10"
      aria-labelledby="service-consultation-questions"
    >
      <h2
        id="service-consultation-questions"
        className="text-ink-strong font-serif text-3xl"
      >
        <span className="lang-ar">أسئلة تساعدك قبل اختيار الإجراء</span>
        <span className="lang-en">
          Questions to discuss before choosing a procedure
        </span>
      </h2>
      <div className="mt-7 grid gap-7">
        {questions.map((question) => (
          <div key={question.questionAr}>
            <h3 className="text-ink-strong text-xl font-semibold">
              <span className="lang-ar">{question.questionAr}</span>
              <span className="lang-en">{question.questionEn}</span>
            </h3>
            <p className="text-ink-soft mt-3 text-base leading-8">
              <span className="lang-ar">{question.answerAr}</span>
              <span className="lang-en">{question.answerEn}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <Link
          href="/journal/choose-plastic-surgeon-riyadh"
          className="text-purple-mid underline"
        >
          <span className="lang-ar">كيف تختار جرّاح التجميل؟</span>
          <span className="lang-en">How to choose a plastic surgeon</span>
        </Link>
        <Link href="/contact" className="text-purple-mid underline">
          <span className="lang-ar">تواصل لتنسيق استشارة</span>
          <span className="lang-en">Contact us to arrange a consultation</span>
        </Link>
      </div>
    </section>
  );
}
