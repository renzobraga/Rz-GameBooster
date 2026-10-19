"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";

const POSTER: Record<string, string> = {
  cs2: "/games/cs2.jpg",
  "gta-v": "/games/gtav.jpg",
  valorant: "/games/valorant.jpg",
};
const ANTICHEAT: Record<string, string> = { cs2: "VAC", "gta-v": "BattlEye", valorant: "Vanguard" };

export default function Page() {
  const t = useT();
  const params = useParams<{ game: string }>();
  const id = params.game;
  const info = (t.games as Record<string, { name: string; genre: string; blurb: string }>)[id];

  if (!info || !POSTER[id]) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted">404</p>
        <Link href="/jogos" className="mt-3 inline-flex items-center gap-1 text-action hover:underline">
          <ArrowLeft size={15} /> {t.nav.games}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Link href="/jogos" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={15} /> {t.nav.games}
      </Link>

      <div className="mt-6 grid items-start gap-8 md:grid-cols-[320px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line">
          <Image src={POSTER[id]} alt={info.name} fill sizes="320px" className="object-cover" priority />
        </div>

        <div>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted">
            {info.genre}
          </span>
          <h1 className="font-display mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">{info.name}</h1>

          <div className="mt-6 rounded-xl border border-line bg-panel p-5">
            <div className="flex items-center gap-2 text-good">
              <ShieldCheck size={18} />
              <span className="font-mono text-xs uppercase tracking-wider">
                {t.pages.game.anticheat}: {ANTICHEAT[id]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{info.blurb}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/baixar" className="flex h-12 items-center rounded-md bg-action px-6 font-medium text-bg hover:opacity-90">
              {t.pages.game.optimize}
            </Link>
            <Link href="/como-funciona" className="flex h-12 items-center rounded-md border border-line px-5 text-sm text-muted hover:text-ink">
              {t.nav.how}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
