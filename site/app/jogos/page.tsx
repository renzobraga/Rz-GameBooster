"use client";

import { GamesStrip } from "@/components/GamesStrip";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  const p = t.pages.gamesIndex;
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
      <p className="mt-3 max-w-xl text-muted">{p.sub}</p>
      <div className="mt-10">
        <GamesStrip />
      </div>
    </div>
  );
}
