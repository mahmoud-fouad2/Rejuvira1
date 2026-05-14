"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      aria-label="العودة لأعلى الصفحة"
      className="rv-v0-scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 19V5M12 5l-7 7M12 5l7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
