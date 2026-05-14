"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Slim progress bar at the top of the viewport that animates on every
 * route change. Uses a CSS-only shimmer so there is no JS timer jank.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Kick off on every route change
    setProgress(0);
    setVisible(true);

    // Rapid first step → feels instant
    const t1 = setTimeout(() => setProgress(30), 50);
    // Slower crawl → "still loading"
    const t2 = setTimeout(() => setProgress(72), 300);
    // Complete
    const t3 = setTimeout(() => setProgress(100), 600);
    // Hide after fill
    const t4 = setTimeout(() => setVisible(false), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2.5px]"
      style={{ background: "rgba(30,13,78,0.08)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, #1e0d4e 0%, #3d2272 40%, #c9a26a 100%)",
          boxShadow: "0 0 8px rgba(61,34,114,0.6)",
        }}
      />
    </div>
  );
}
