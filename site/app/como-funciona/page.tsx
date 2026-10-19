"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.how;
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
      <p className="mt-3 text-muted">{p.sub}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {p.blocks.map((b, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-5">
            <div className="font-mono text-sm text-action">{String(i + 1).padStart(2, "0")}</div>
            <h2 className="mt-2 font-medium">{b.t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{b.d}</p>
          </div>
        ))}
      </div>

      <Link href="/baixar" className="btn-glass-primary mt-10 inline-flex h-12 items-center rounded-md px-6 font-medium">
        {t.cta.download}
      </Link>
    </div>
  );
}
