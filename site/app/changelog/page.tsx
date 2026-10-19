"use client";

import { ExternalLink } from "lucide-react";
import { brand } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.changelog;
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
      <p className="mt-3 text-muted">{p.sub}</p>
      <a
        href={`${brand.github}/releases`}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-md border border-line px-5 text-sm text-ink hover:border-action"
      >
        {p.cta} <ExternalLink size={15} />
      </a>
    </div>
  );
}
