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

  const score = BASE + fixed.filter(Boolean).length * STEP;
  const allFixed = fixed.every(Boolean);

  const fix = (i: number) => setFixed((f) => f.map((v, idx) => (idx === i ? true : v)));

  return (
    <div className="grid items-center gap-8 rounded-2xl border border-line bg-panel p-6 md:grid-cols-[auto_1fr] md:p-8">
      <div className="flex flex-col items-center">
        <div className="w-[220px]">
          <Gauge score={score} />
        </div>
        <p className="-mt-2 text-sm text-muted">{t.demo.scoreLabel}</p>
      </div>

      <div>
        <ul className="flex flex-col gap-2">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-bg p-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${fixed[i] ? "bg-good/15 text-good" : "bg-amber/15 text-amber"}`}>
                {fixed[i] ? <Check size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${fixed[i] ? "text-muted line-through" : "text-ink"}`}>{issue.t}</p>
                <p className="text-xs text-muted">{issue.d}</p>
              </div>
              {!fixed[i] && (
                <button onClick={() => fix(i)} className="shrink-0 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90">
                  {t.demo.fixAll.split(" ")[0]}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          {!allFixed ? (
            <button onClick={() => setFixed([true, true, true])} className="flex items-center gap-2 rounded-md bg-action px-4 py-2 text-sm font-medium text-bg hover:opacity-90">
              <Wrench size={15} /> {t.demo.fixAll}
            </button>
          ) : (
            <span className="flex items-center gap-2 rounded-md bg-good/15 px-4 py-2 text-sm font-medium text-good">
              <Check size={15} /> {t.demo.fixed}
            </span>
          )}
          {fixed.some(Boolean) && (
            <button onClick={() => setFixed([false, false, false])} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-muted hover:text-ink">
              <RotateCcw size={14} /> {t.home.demoReset}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
