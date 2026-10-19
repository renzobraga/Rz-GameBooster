import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import type { GameProfile } from "../lib/api";

const GENRE: Record<string, string> = {
  cs2: "FPS tático",
  gtav: "Mundo aberto",
  valorant: "FPS competitivo",
};

const POSTER: Record<string, string> = {
  cs2: "/games/cs2.png",
  gtav: "/games/gtav.png",
  valorant: "/games/valorant.png",
};

/** Tela inicial do app: escolha do jogo em galeria sanfona. */
export function ElasticGallery({ games, onSelect }: { games: GameProfile[]; onSelect: (id: string) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Jogos carregam de forma assíncrona; se ninguém foi escolhido ainda,
  // o primeiro conta como ativo.
  const currentActive = activeId ?? games[0]?.id ?? null;

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="flex h-[460px] w-full max-w-4xl flex-col gap-3 md:flex-row">
        {games.map((game) => {
          const active = currentActive === game.id;
          const poster = POSTER[game.id];
          return (
            <div
              key={game.id}
              onMouseEnter={() => setActiveId(game.id)}
              onClick={() => onSelect(game.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(game.id);
              }}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-panel",
                "transition-[flex,filter] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                active ? "flex-[4]" : "flex-[1]",
                active ? "brightness-100" : "brightness-50 hover:brightness-75"
              )}
            >
              <div className="absolute inset-0 h-full w-full">
                {poster ? (
                  <img
                    src={poster}
                    alt={game.name}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-1000",
                      active ? "scale-100" : "scale-110"
                    )}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-panel to-bg" />
                )}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end p-5 md:p-7">
                <div
                  className={cn(
                    "flex flex-col gap-2 transition-all duration-500",
                    active ? "translate-y-0 opacity-100 delay-200" : "translate-y-12 opacity-0"
                  )}
                >
                  <span className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                    {GENRE[game.id] ?? "Jogo"}
                  </span>
                  <h3 className="text-3xl font-black uppercase leading-none text-white md:text-4xl">{game.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                    Otimizar <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <div
                  className={cn(
                    "absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500",
                    active ? "scale-50 opacity-0" : "opacity-100 delay-500"
                  )}
                >
                  <span className="hidden whitespace-nowrap text-lg font-bold uppercase tracking-widest text-white [writing-mode:vertical-rl] md:block">
                    {game.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
