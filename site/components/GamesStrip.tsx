"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";

const games = [
  { id: "cs2", src: "/games/cs2.jpg" },
  { id: "gta-v", src: "/games/gtav.jpg" },
  { id: "valorant", src: "/games/valorant.jpg" },
] as const;

export function GamesStrip() {
  const t = useT();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {games.map((g) => {
        const info = t.games[g.id];
        return (
          <Link
            key={g.id}
            href={`/jogos/${g.id}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-line"
          >
            <Image
              src={g.src}
              alt={info.name}
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-cover brightness-[0.7] transition-all duration-500 group-hover:scale-105 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                {info.genre}
              </span>
              <h3 className="font-display mt-2 text-2xl font-black uppercase leading-none text-white">{info.name}</h3>
              <span className="mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white/80">
                {t.pages.game.optimize} <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
