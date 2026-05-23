"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Slim progress bar at the top of the viewport that animates on every
 * route change.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    setVisible(true);

    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(72), 300);
    const t3 = setTimeout(() => setProgress(100), 600);
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
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
