"use client";

import { useEffect, useRef, useState } from "react";

const R = 100;
const CX = 120;
const CY = 120;
// Semicircle arc, left point to right point, sweeping over the top.
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
const LEN = Math.PI * R;

function colorFor(score: number) {
  if (score >= 75) return "var(--color-good)";
  if (score >= 50) return "var(--color-amber)";
  return "var(--color-bad)";
}

/**
 * The product's signature: the 0-100 "Raio-X" score, drawn as a tachometer.
 * One orchestrated reveal on load (sweep + count-up), skipped for reduced motion.
 */
export function Gauge({ score = 82 }: { score?: number }) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(score);
      return;
    }
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * score));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [score]);

  const offset = LEN * (1 - value / 100);

  return (
    <figure className="m-0 w-full max-w-[420px]">
      <svg viewBox="0 0 240 150" className="w-full" role="img" aria-label={`Pontuação ${score} de 100`}>
        <path d={ARC} fill="none" stroke="var(--color-line)" strokeWidth={12} strokeLinecap="round" />
        <path
          d={ARC}
          fill="none"
          stroke={colorFor(value)}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={LEN}
          strokeDashoffset={offset}
        />
        <text
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={56}
          fontWeight={600}
          fill="var(--color-ink)"
        >
          {value}
        </text>
        <text x={CX} y={CY + 22} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fill="var(--color-muted)">
          / 100
        </text>
      </svg>
    </figure>
  );
}
