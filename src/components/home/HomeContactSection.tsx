import { GoogleMapsEmbed } from "@/components/contact/GoogleMapsEmbed";
import { ContactForm } from "@/components/forms/ContactForm";
import type { RuntimeSettings, ServiceRecord } from "@/lib/content-repository";

const benefits = [
  {
    ar: "توجيه مناسب حسب احتياجك",
    en: "Guidance tailored to your needs",
  },
  {
    ar: "خطة علاجية مخصصة وفق احتياجك",
    en: "A treatment plan tailored to your goals",
  },
  {
    ar: "متابعة منظمة بعد الزيارة",
    en: "Thoughtful follow-up after your visit",
  },
  {
    ar: "طلبك يُستقبل وفق سياسات الخصوصية الطبية",
    en: "Requests are reviewed under strict confidentiality policies",
  },
] as const;

function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.51 2.52a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.56-1.08a2 2 0 0 1 2.11-.45c.82.21 1.66.39 2.52.51A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m22 6-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeContactSection({
  settings,
  services,
}: {
  settings: RuntimeSettings;
  services: readonly ServiceRecord[];
}) {
  const telHref = `tel:${settings.contact.phone.replace(/\D/g, "")}`;
  const secondaryTelHref = settings.contact.phoneSecondary
    ? `tel:${settings.contact.phoneSecondary.replace(/\D/g, "")}`
    : null;

  return (
    <section className="rv-v0-home-contact-section" id="contact" dir="rtl">
      <div className="rv-v0-home-contact-bg" aria-hidden />
      <div className="rv-v0-home-contact-inner">
        <div className="rv-v0-home-contact-grid">
          <div className="rv-v0-home-contact-copy">
            <span className="rv-v0-pill">
              <span className="lang-ar">احجزي موعدك</span>
              <span className="lang-en">Book your visit</span>
            </span>
            <h2 className="rv-v0-home-contact-title">
              <span className="lang-ar">ابدئي رحلتك بثقة ومعايير طبية واضحة</span>
              <span className="lang-en">Begin your journey with us today</span>
            </h2>
            <p className="rv-v0-home-contact-lead">
              <span className="lang-ar">
                أرسلي بياناتك عبر النموذج أدناه، وسينسّق فريق المركز متابعتك وفق الأولويات الطبية وبأسرع وقت تشغيلي مناسب.
              </span>
              <span className="lang-en">
                Submit your details and our coordination team reviews every message with discreet, clinically appropriate follow-up timing.
              </span>
            </p>

            <ul className="rv-v0-home-contact-benefits">
              {benefits.map((row) => (
                <li key={row.ar}>
                  <span className="rv-v0-home-contact-check" aria-hidden>
                    ✓
                  </span>
                  <span>
                    <span className="lang-ar">{row.ar}</span>
                    <span className="lang-en">{row.en}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="rv-v0-home-contact-channels">
              <a href={telHref} className="rv-v0-home-contact-channel">
                <span className="rv-v0-home-contact-channel-icon">
                  <PhoneGlyph />
                </span>
                <div>
                  <span className="rv-v0-home-contact-channel-label">
                    <span className="lang-ar">اتصلي بنا</span>
                    <span className="lang-en">Phone</span>
                  </span>
                  <span className="rv-v0-home-contact-channel-value" dir="ltr">
                    {settings.contact.phone}
                  </span>
                </div>
              </a>
              {secondaryTelHref ? (
                <a href={secondaryTelHref} className="rv-v0-home-contact-channel">
                  <span className="rv-v0-home-contact-channel-icon">
                    <PhoneGlyph />
                  </span>
                  <div>
                    <span className="rv-v0-home-contact-channel-label">
                      <span className="lang-ar">الرقم الموحد</span>
                      <span className="lang-en">Unified line</span>
                    </span>
                    <span className="rv-v0-home-contact-channel-value" dir="ltr">
                      {settings.contact.phoneSecondary}
                    </span>
                  </div>
                </a>
              ) : null}
              <a href={`mailto:${settings.contact.email}`} className="rv-v0-home-contact-channel">
                <span className="rv-v0-home-contact-channel-icon">
                  <MailGlyph />
                </span>
                <div>
                  <span className="rv-v0-home-contact-channel-label">
                    <span className="lang-ar">أرسلي لنا</span>
                    <span className="lang-en">Email</span>
                  </span>
                  <span className="rv-v0-home-contact-channel-value" dir="ltr">
                    {settings.contact.email}
                  </span>
                </div>
              </a>
            </div>

            {/* hours block - subagent #3 */}
            <div className="rv-v0-home-contact-hours">
              <span className="rv-v0-home-contact-hours-label">
                <span className="lang-ar">ساعات العمل</span>
                <span className="lang-en">Working hours</span>
              </span>
              <span className="rv-v0-home-contact-hours-value lang-ar">
                <span>{settings.contact.hoursWeekdays}</span>
                <span>{settings.contact.hoursWeekend}</span>
              </span>
              <span className="rv-v0-home-contact-hours-value lang-en">
                <span>{settings.contact.hoursWeekdaysEn}</span>
                <span>{settings.contact.hoursWeekendEn}</span>
              </span>
            </div>
          </div>

          <div className="rv-v0-home-contact-form-card">
            <div className="rv-v0-home-contact-form-head">
              <span className="rv-v0-home-contact-form-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="rv-v0-home-contact-form-title">
                  <span className="lang-ar">احجزي استشارتك</span>
                  <span className="lang-en">Request a consultation</span>
                </h3>
                <p className="rv-v0-home-contact-form-sub">
                  <span className="lang-ar">يراجع الفريق طلبك ويتواصل معك في أقرب وقت</span>
                  <span className="lang-en">We will reach out shortly</span>
                </p>
              </div>
            </div>

            <ContactForm services={services} formClassName="rv-v0-home-contact-form" />

            <p className="rv-v0-home-contact-privacy">
              <span className="lang-ar">بالإرسال، توافقين على معالجة بياناتك للتواصل بخصوص طلبك.</span>
              <span className="lang-en">By submitting, you agree we may process your details to respond to this request.</span>
            </p>
          </div>
        </div>
        <div className="rv-v0-home-map-card">
          <div className="rv-v0-home-map-copy">
            <span className="rv-v0-pill">
              <span className="lang-ar">موقع المركز</span>
              <span className="lang-en">Center location</span>
            </span>
            <h3>
              <span className="lang-ar">الوصول إلى ريجوفيرا بسهولة داخل الرياض</span>
              <span className="lang-en">Reach Rejuvira easily in Riyadh</span>
            </h3>
            <p>
              <span className="lang-ar">موقع واضح داخل الرياض لتخطيط زيارتك بسهولة.</span>
              <span className="lang-en">An interactive map helps you plan your route before visiting the center.</span>
            </p>
          </div>
          <GoogleMapsEmbed
            src={settings.contact.mapsEmbedUrl}
            shape={settings.contact.mapsShape}
            title="Rejuvira Center location"
            className="rv-v0-home-map-embed"
          />
        </div>
      </div>
    </section>
  );
}
