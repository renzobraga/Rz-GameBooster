"use client";

import { useState } from "react";
import { Check, Wrench, RotateCcw } from "lucide-react";
import { Gauge } from "@/components/Gauge";
import { useT } from "@/lib/i18n";

const BASE = 64;
const STEP = 12; // 3 correções → 100

export function DiagnosticDemo() {
  const t = useT();
  const issues = t.demo.issues;
  const [fixed, setFixed] = useState<boolean[]>([false, false, false]);

  const fixedCount = fixed.filter(Boolean).length;
  const score = BASE + fixedCount * STEP;
  const allFixed = fixedCount === issues.length;

  const fix = (i: number) => setFixed((f) => f.map((v, idx) => (idx === i ? true : v)));

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 md:p-6">
      {/* Cabeçalho: medidor + rótulo */}
      <div className="flex items-center gap-5">
        <div className="w-[136px] shrink-0">
          <Gauge score={score} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{t.demo.scoreLabel}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {allFixed ? (
              <span className="text-good">{t.demo.fixed}</span>
            ) : (
              `${issues.length - fixedCount}/${issues.length}`
            )}
          </p>
        </div>
      </div>

      {/* Lista de problemas */}
      <ul className="mt-5 flex flex-col gap-2">
        {issues.map((issue, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2.5 transition-opacity ${fixed[i] ? "opacity-55" : ""}`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${fixed[i] ? "bg-good/15 text-good" : "bg-amber/15"}`}
            >
              {fixed[i] ? <Check size={14} /> : <span className="size-1.5 rounded-full bg-amber" />}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{issue.t}</span>
            {!fixed[i] && (
              <button onClick={() => fix(i)} className="btn-glass-primary shrink-0 rounded-md px-3 py-1.5 text-xs font-medium">
                {t.demo.fix}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Ações */}
      <div className="mt-4 flex items-center gap-2">
        {!allFixed ? (
          <button onClick={() => setFixed([true, true, true])} className="btn-glass-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
            <Wrench size={15} /> {t.demo.fixAll}
          </button>
        ) : (
          <span className="flex items-center gap-2 rounded-md bg-good/15 px-4 py-2 text-sm font-medium text-good">
            <Check size={15} /> {t.demo.fixed}
          </span>
        )}
        {fixedCount > 0 && (
          <button onClick={() => setFixed([false, false, false])} className="btn-glass flex items-center gap-2 rounded-md px-3 py-2 text-sm">
            <RotateCcw size={14} /> {t.home.demoReset}
          </button>
        )}
      </div>
    </div>
  );
}
