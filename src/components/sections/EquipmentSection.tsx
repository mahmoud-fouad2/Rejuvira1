import { SectionIntro } from "@/components/layout/SectionIntro";

/**
 * Equipment Section — showcasing medical devices
 * Clean cards with device names and certifications
 */
const devices = [
  { name: "Morpheus 8", category: "نحت وشد", description: "تقنية الموجات الدقيقة لإعادة بناء الكولاجين" },
  { name: "CO₂ Laser", category: "ليزر", description: "أحدث جيل من الليزر لتجديد البشرة" },
  { name: "HIFU", category: "الموجات فوق الصوتية", description: "شد الوجه غير الجراحي بدقة متناهية" },
];

export function EquipmentSection() {
  return (
    <section className="py-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--max-width)] px-6 lg:px-10">
        <SectionIntro
          className="mb-16"
          eyebrowAr="الأجهزة الطبية"
          eyebrowEn="Medical Equipment"
          titleAr="تقنيات معتمدة لكل تخصص"
          titleEn="Certified Technology for Every Specialty"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {devices.map((device) => (
            <div key={device.name} className="surface-panel group px-8 py-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
              <div className="mb-3">
                <span className="text-[10px] tracking-[0.3em] text-purple-mid/50 uppercase">{device.category}</span>
              </div>
              <h3 className="text-2xl font-[200] tracking-[-0.02em] text-text-primary">{device.name}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                <span className="lang-ar">{device.description}</span>
                <span className="lang-en">{device.description}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

