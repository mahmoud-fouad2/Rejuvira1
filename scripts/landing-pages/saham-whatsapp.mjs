/** Same floating pill used on existing CMS pages; self-contained through deployment. */
export function buildSahamWhatsappBubble() {
  const text =
    "مرحبًا، أرغب في حجز استشارة مع د. سهام العرفج في مركز ريجوفيرا بالرياض.";
  const href = `https://wa.me/966114999959?text=${encodeURIComponent(text)}`;
  const icon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.7 7.5L3 20.5l1.4-4.6a8.5 8.5 0 1 1 16.1-4.3Z"/><path d="M8.2 7.6c.3-.3.8-.2 1 .2l.8 1.6c.2.3.1.6-.1.8l-.6.6c.6 1.3 1.6 2.3 2.9 2.9l.6-.6c.2-.2.5-.3.8-.1l1.6.8c.4.2.5.7.2 1-.5.7-1.2 1-2 1-3.3-.4-6-3.1-6.4-6.4 0-.8.5-1.4 1.2-1.8Z"/></svg>')}`;
  return `
<div class="saham-whatsapp-widget"><style>
.rejuvera-google-whatsapp{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:999999;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:10px 18px 10px 11px;direction:rtl;text-decoration:none!important;font-family:Tahoma,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1;color:#fff!important;background:#25d366;border:0;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.24),0 5px 15px rgba(37,211,102,.28);transition:transform .2s ease,background-color .2s ease}
.rejuvera-google-whatsapp:hover{color:#fff!important;background:#20bd5a;transform:translateY(-3px)}
.rejuvera-google-whatsapp:focus-visible{outline:3px solid #321847;outline-offset:5px}
.rejuvera-google-whatsapp__icon{display:grid;place-items:center;flex:0 0 auto;width:38px;height:38px;background:rgba(255,255,255,.17);border-radius:50%}
.rejuvera-google-whatsapp__icon img{display:block;width:25px;height:25px}
@media(max-width:640px){.rejuvera-google-whatsapp{left:13px;bottom:calc(13px + env(safe-area-inset-bottom,0px));min-height:53px;padding:8px 14px 8px 9px;font-size:14px}.rejuvera-google-whatsapp__icon{width:36px;height:36px}}
@media(prefers-reduced-motion:reduce){.rejuvera-google-whatsapp{transition:none}}
</style>
<a class="rejuvera-google-whatsapp" data-saham-whatsapp="2026-10-06" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="طلب استشارة مع د. سهام العرفج عبر واتساب"><span>استشارة د. سهام عبر واتساب</span><span class="rejuvera-google-whatsapp__icon" aria-hidden="true"><img src="${icon}" width="25" height="25" alt="" loading="eager"></span></a></div>`;
}
