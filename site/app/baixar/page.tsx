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
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{p.title}</h1>
          <p className="mt-3 max-w-md text-muted">{p.sub}</p>
          <a
            href={`${brand.github}/releases/latest`}
            className="btn-glass-primary mt-8 inline-flex h-14 items-center gap-2 rounded-md px-8 text-base font-semibold"
          >
            <Download size={20} /> {p.btn}
          </a>
          <p className="mt-4 font-mono text-xs text-muted">{t.trustLine}</p>
        </div>

        <div className="flex flex-col gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="flex gap-4 rounded-xl border border-line bg-panel p-5">
                <Icon size={20} className="mt-0.5 shrink-0 text-action" />
                <div>
                  <h2 className="font-medium">{c.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
