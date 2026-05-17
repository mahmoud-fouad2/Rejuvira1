import type { RuntimeSettings } from "@/lib/content-repository";

type SocialChannelKey =
  | "instagram"
  | "x"
  | "twitter"
  | "snapchat"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "facebook"
  | "whatsappBusiness"
  | "threads";

type ChannelDescriptor = {
  key: SocialChannelKey;
  label: string;
  paths: string[];
};

const CHANNELS: ChannelDescriptor[] = [
  {
    key: "instagram",
    label: "Instagram",
    paths: [
      "M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Z",
      "M17.5 6.5h.01",
      "M3 7.5C3 5 5 3 7.5 3h9C19 3 21 5 21 7.5v9c0 2.5-2 4.5-4.5 4.5h-9C5 21 3 19 3 16.5v-9Z",
    ],
  },
  {
    key: "x",
    label: "X",
    paths: ["M4 4l16 16M20 4 4 20"],
  },
  {
    key: "twitter",
    label: "Twitter",
    paths: [
      "M22 5.8c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.6.8-2.4 1A3.8 3.8 0 0 0 12 9c0 .3 0 .6.1.9C8.7 9.7 5.7 8.1 3.7 5.6c-.4.6-.6 1.3-.6 2 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.8-.5v.1c0 1.9 1.3 3.5 3 3.9-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.7 3.8 2.7-1.4 1.1-3.1 1.7-5 1.7H2C3.7 19.8 5.8 20.5 8 20.5c7.5 0 11.6-6.2 11.6-11.6V8.4c.8-.6 1.5-1.3 2-2.1Z",
    ],
  },
  {
    key: "snapchat",
    label: "Snapchat",
    paths: [
      "M12 3c2.5 0 5 1.6 5 5 0 1 .1 2.6.1 2.9.2.2 1.1.3 1.4.8.3.4-.3 1-1 1.5-.4.3-1.4.9-1.4.9s.4 1.7 2 2.4c.6.3 1.2.4 1.2.7 0 .7-2 1.1-3 1.3-.2.2-.4 1-.6 1.2-.2.3-.6.2-1.3.1-.7-.1-1.4-.4-2.6.1-1 .5-1.7 1.4-3.2 1.4-1.4 0-2-.9-3.1-1.4-1.2-.5-2 0-2.7.1-.7.1-1.1.1-1.3-.1-.2-.2-.4-1-.6-1.2-1-.2-3-.6-3-1.3 0-.3.7-.4 1.2-.7 1.6-.7 2-2.4 2-2.4s-1-.6-1.4-.9c-.6-.5-1.3-1.1-1-1.5.3-.5 1.2-.6 1.4-.8C7 10.6 7 9 7 8c0-3.4 2.5-5 5-5Z",
    ],
  },
  {
    key: "tiktok",
    label: "TikTok",
    paths: [
      "M19.5 7.7v2.8a7.3 7.3 0 0 1-5-2v6.7a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .8.1v2.9a2.6 2.6 0 1 0 1.9 2.5V3h2.6c.3 2.4 2.1 4.3 4.5 4.5l.7.2Z",
    ],
  },
  {
    key: "youtube",
    label: "YouTube",
    paths: [
      "M22 8.5a3 3 0 0 0-2.1-2.1c-1.9-.4-9.4-.4-9.4-.4s-7.6 0-9.4.4A3 3 0 0 0-.1 8.5C-.5 10.3-.5 12-.5 12s0 1.7.4 3.5a3 3 0 0 0 2.1 2.1c1.8.4 9.4.4 9.4.4s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-3.5.4-3.5s0-1.7-.4-3.5Z",
      "m10 15 5-3-5-3v6Z",
    ],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    paths: [
      "M3 9h4v12H3z",
      "M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
      "M9 9h3.8v1.7h.1c.5-1 1.9-2 3.9-2 4.2 0 5 2.8 5 6.4V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.4-2 2.7V21H9V9Z",
    ],
  },
  {
    key: "facebook",
    label: "Facebook",
    paths: [
      "M13.5 8.5h2v-3h-2c-1.7 0-3 1.3-3 3v1h-2v3h2v9h3v-9h2.4l.4-3H13.5V8.5Z",
    ],
  },
  {
    key: "whatsappBusiness",
    label: "WhatsApp",
    paths: [
      "M20.5 12a8.5 8.5 0 1 1-3.7-7 .5.5 0 0 1 .3.7l-1.4 5 5-1.4a.5.5 0 0 1 .7.3 8.5 8.5 0 0 1-.9 2.4Z",
      "M8.5 9.5c0-.5.4-1 1-1h1.2c.4 0 .8.3.9.7l.5 1.5c.1.4 0 .8-.3 1l-.7.5c.6 1.2 1.6 2.2 2.8 2.8l.5-.7c.2-.3.6-.4 1-.3l1.5.5c.4.1.7.5.7.9V16c0 .6-.4 1-1 1A8.5 8.5 0 0 1 8.5 9.5Z",
    ],
  },
  {
    key: "threads",
    label: "Threads",
    paths: [
      "M12 4c4.5 0 7 2.5 7 6.5 0 2-1 4-2.5 4.5",
      "M9 9c.5-1.5 1.7-2.5 3-2.5 1.7 0 3 1 3 3 0 4-7 4-7 2.5 0-1.5 2-2.5 4.5-2.5 4 0 5.5 2 5.5 5",
    ],
  },
];

export function normalizeSocialUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[\w-]+\.[a-z]+/i.test(url)) return `https://${url}`;
  return url;
}

export function SocialIconCluster({
  settings,
  size = "md",
  tone = "ink",
  className,
}: {
  settings: RuntimeSettings;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "light";
  className?: string;
}) {
  const social = settings.social as Record<string, string>;
  const visibility = settings.socialVisibility;
  const visibleChannels = CHANNELS.filter((channel) => {
    const url = social[channel.key];
    if (!url) return false;
    return visibility[channel.key] !== false;
  });
  if (visibleChannels.length === 0) return null;

  const dimensions =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconStroke =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const colorClasses =
    tone === "light"
      ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
      : "border-line bg-surface text-ink-soft hover:border-accent/30 hover:text-ink-strong border";
  return (
    <ul
      className={["flex flex-wrap items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {visibleChannels.map((channel) => {
        const url = normalizeSocialUrl(social[channel.key] ?? "");
        return (
          <li key={channel.key}>
            {/* External URLs â€” use plain <a> to satisfy typedRoutes (subagent #3 fix). */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={channel.label}
              className={`flex ${dimensions} items-center justify-center rounded-full transition ${colorClasses}`}
            >
              <svg
                viewBox="0 0 24 24"
                className={iconStroke}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {channel.paths.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
