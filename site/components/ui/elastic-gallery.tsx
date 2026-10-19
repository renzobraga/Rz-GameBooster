"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ElasticItemProps {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
}

const games: ElasticItemProps[] = [
  {
    id: "01",
    title: "Counter-Strike 2",
    category: "FPS tático",
    src: "/games/cs2.png",
    alt: "Counter-Strike 2",
  },
  {
    id: "02",
    title: "GTA V",
    category: "Mundo aberto",
    src: "/games/gtav.png",
    alt: "Grand Theft Auto V",
  },
  {
    id: "03",
    title: "Valorant",
    category: "FPS competitivo",
    src: "/games/valorant.png",
    alt: "Valorant",
  },
];

function ElasticGallery() {
  const [activeId, setActiveId] = useState<string | null>("01");

  return (
    <div className="w-full">
      {/* Altura fixa para estabilidade da animação */}
      <div className="mx-auto flex h-[420px] w-full max-w-6xl flex-col gap-2 md:h-[520px] md:flex-row md:gap-4">
        {games.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveId(item.id)}
            onClick={() => setActiveId(item.id)}
            className={cn(
              "relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-panel",
              "transition-[flex,filter] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
              activeId === item.id ? "flex-[4]" : "flex-[1]",
              activeId === item.id ? "brightness-100" : "brightness-50 hover:brightness-75"
            )}
          >
            {/* Imagem de fundo */}
            <div className="absolute inset-0 h-full w-full">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className={cn(
                  "object-cover transition-transform duration-1000",
                  activeId === item.id ? "scale-100" : "scale-110"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500",
                  activeId === item.id ? "opacity-100" : "opacity-0"
                )}
              />
            </div>

            {/* Conteúdo */}
            <div className="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end p-4 md:p-8">
              <div
                className={cn(
                  "flex flex-col gap-2 transition-all duration-500",
                  activeId === item.id
                    ? "translate-y-0 opacity-100 delay-200"
                    : "translate-y-12 opacity-0"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md md:px-3 md:text-xs">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black uppercase leading-none text-white md:text-5xl">
                  {item.title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 md:mt-4 md:text-sm">
                  Otimizar <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>

              {/* Estado inativo: texto vertical (desktop) / id (mobile) */}
              <div
                className={cn(
                  "absolute transition-all duration-500",
                  "bottom-4 left-1/2 -translate-x-1/2 md:bottom-8",
                  activeId === item.id ? "scale-50 opacity-0" : "opacity-100 delay-500"
                )}
              >
                <span className="hidden whitespace-nowrap text-xl font-bold uppercase tracking-widest text-white [writing-mode:vertical-rl] md:block">
                  {item.title}
                </span>
                <span className="block text-xs font-bold text-white md:hidden">{item.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ElasticGallery };
