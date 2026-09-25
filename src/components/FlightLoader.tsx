"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function FlightLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
    const DURATION = 1600;

  useEffect(() => {
    if (sessionStorage.getItem("skip-flight") === "1") {
      sessionStorage.removeItem("skip-flight");
      setVisible(false);
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setVisible(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      const eased = pct < 0.5 ? 4 * pct ** 3 : 1 - (-2 * pct + 2) ** 3 / 2;
      setProgress(eased * 100);

      if (pct < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        timerRef.current = setTimeout(() => setVisible(false), 200);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 2,
          width: `${progress}%`,
          background: "#e23b2f",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -9,
          left: `${progress}%`,
          color: "#e23b2f",
        }}
      >
        <img src="/images/flight-side.png" alt="" width="64" height="26" style={{ height: 26, width: "auto" }} />
      </div>
    </div>
  );
}
