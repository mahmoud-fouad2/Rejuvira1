type GoogleMapsEmbedProps = {
  src: string;
  shape?: "square" | "rounded";
  title?: string;
  className?: string;
  height?: string | number;
};

const FALLBACK_SRC = "https://www.google.com/maps?q=Riyadh&output=embed";

function toEmbedUrl(rawSrc: string): string {
  if (!rawSrc) return FALLBACK_SRC;
  const trimmed = rawSrc.trim();
  if (!trimmed) return FALLBACK_SRC;

  if (
    trimmed.startsWith("https://www.google.com/maps/embed") ||
    trimmed.includes("output=embed")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("https://share.google/")) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
  }
  if (trimmed.startsWith("http")) {
    return `${trimmed}${trimmed.includes("?") ? "&" : "?"}output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

export function GoogleMapsEmbed({
  src,
  shape = "rounded",
  title = "خريطة موقع Rejuvira Center",
  className,
  height = "100%",
}: GoogleMapsEmbedProps) {
  const url = toEmbedUrl(src);
  const radius = shape === "square" ? "rounded-[1.25rem]" : "rounded-[2.4rem]";
  return (
    <div
      className={[
        "rv-google-map-embed relative w-full overflow-hidden border border-line bg-surface",
        radius,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ aspectRatio: shape === "square" ? "1 / 1" : "16 / 9" }}
    >
      <iframe
        src={url}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        style={{ border: 0, height }}
      />
      <div className="rv-google-map-pin" aria-hidden>
        <span />
      </div>
    </div>
  );
}
