"use client";

import Link from "next/link";
import { ShieldCheck, FileSearch } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.security;
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex items-center gap-2 text-good">
        <ShieldCheck size={20} />
        <span className="font-mono text-xs uppercase tracking-wider">{t.footer.security}</span>
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{p.sub}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {p.points.map((pt, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel p-5">
            <h2 className="font-medium">{pt.t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{pt.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-panel p-5">
        <FileSearch size={20} className="mt-0.5 shrink-0 text-amber" />
        <div>
          <h2 className="font-medium">{p.virusTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{p.virus}</p>
        </div>
      </div>

      <Link href="/faq" className="mt-8 inline-block text-sm text-action hover:underline">
        {t.footer.faq} →
      </Link>
    </div>
  );
}
