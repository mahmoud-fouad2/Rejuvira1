type MaintenanceOverlayProps = {
  brandName: string;
  contactEmail?: string;
  contactPhone?: string;
};

export function MaintenanceOverlay({
  brandName,
  contactEmail,
  contactPhone,
}: MaintenanceOverlayProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-[#1e0d4e] via-[#2c1466] to-[#180a3e] p-6 text-white">
      <div className="max-w-xl rounded-[2.5rem] border border-white/15 bg-white/5 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <p className="text-[10px] tracking-[0.32em] text-white/70 uppercase">
          {brandName}
        </p>
        <h1 className="mt-4 font-serif text-3xl leading-tight">
          <span className="lang-ar">الموقع قيد الصيانة الآن.</span>
          <span className="lang-en">Our site is undergoing maintenance.</span>
        </h1>
        <p className="mt-5 text-base leading-8 text-white/85">
          <span className="lang-ar">
            نعمل على تحسينات سريعة لتجربة أوضح وأكثر استقرارًا. سنعود قريبًا
            خلال وقت قصير.
          </span>
          <span className="lang-en">
            We are deploying a small improvement to give you a smoother
            experience. We will be back shortly.
          </span>
        </p>
        <div className="mt-8 grid gap-3">
          {contactPhone ? (
            <a
              href={`tel:${contactPhone.replace(/\D/g, "")}`}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
            >
              <span className="lang-ar">اتصال مباشر</span>
              <span className="lang-en">Call us</span>
              <span dir="ltr" className="mt-1 block text-xs text-white/70">
                {contactPhone}
              </span>
            </a>
          ) : null}
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
            >
              <span className="lang-ar">البريد الإلكتروني</span>
              <span className="lang-en">Email</span>
              <span dir="ltr" className="mt-1 block text-xs text-white/70">
                {contactEmail}
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
