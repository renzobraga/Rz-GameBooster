"use client";

import Image from "next/image";
import { useState } from "react";
import { useT } from "@/lib/i18n";

const shots = [
  { key: "gallery", src: "/screens/galeria.png" },
  { key: "diagnostic", src: "/screens/diagnostico.png" },
  { key: "optimizations", src: "/screens/otimizacoes.png" },
  { key: "history", src: "/screens/historico.png" },
  { key: "about", src: "/screens/sobre.png" },
] as const;

export function AppShowcase() {
  const t = useT();
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {shots.map((s, i) => (
          <button
            key={s.key}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active === i ? "border-action bg-action/10 text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            {t.showcase[s.key]}
          </button>
        ))}
      </div>

      {/* Moldura tipo janela */}
      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-bad/70" />
          <span className="h-3 w-3 rounded-full bg-amber/70" />
          <span className="h-3 w-3 rounded-full bg-good/70" />
          <span className="ml-3 font-mono text-xs text-muted">Rz GameBooster</span>
        </div>
        <div className="relative aspect-[1040/720] w-full bg-bg">
          {shots.map((s, i) => (
            <Image
              key={s.key}
              src={s.src}
              alt={t.showcase[s.key]}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className={`object-cover transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-0"}`}
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
