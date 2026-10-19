"use client";

import { Download, FileCheck2, ShieldAlert, Cpu } from "lucide-react";
import { brand } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.download;
  const cards = [
    { icon: Cpu, title: p.req, body: p.reqBody },
    { icon: FileCheck2, title: p.integrity, body: p.integrityBody },
    { icon: ShieldAlert, title: p.smartscreen, body: p.smartscreenBody },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
        <p className="mt-3 text-muted">{p.sub}</p>
        <a
          href={`${brand.github}/releases/latest`}
          className="mt-8 inline-flex h-14 items-center gap-2 rounded-md bg-action px-8 text-base font-semibold text-bg transition-opacity hover:opacity-90"
        >
          <Download size={20} /> {p.btn}
        </a>
        <p className="mt-4 font-mono text-xs text-muted">{t.trustLine}</p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-xl border border-line bg-panel p-5">
              <Icon size={20} className="text-action" />
              <h2 className="mt-3 font-medium">{c.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
