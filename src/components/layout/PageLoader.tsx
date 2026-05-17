"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

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
      className="rv-page-loader pointer-events-none fixed inset-x-0 top-0 z-[9999]"
    >
      <div
        className="rv-page-loader-bar transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
      <div className="rv-page-loader-mark">
        <Image
          src="/media/brand/logo-light.png"
          alt=""
          width={88}
          height={88}
          priority
        />
      </div>
    </div>
  );
}
