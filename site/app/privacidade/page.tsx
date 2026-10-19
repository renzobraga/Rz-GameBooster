"use client";

import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.privacy;
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
      <p className="mt-3 text-muted">{p.sub}</p>
      <p className="mt-8 leading-relaxed text-ink">{p.body}</p>
    </div>
  );
}
