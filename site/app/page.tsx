"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileSearch } from "lucide-react";
import { AppShowcase } from "@/components/AppShowcase";
import { DiagnosticDemo } from "@/components/DiagnosticDemo";
import { GamesStrip } from "@/components/GamesStrip";
import { FaqSection } from "@/components/FaqSection";
import { Reveal } from "@/components/Reveal";
import { brand } from "@/lib/brand";
import { useT } from "@/lib/i18n";

function SectionHead({ kicker, title, sub, href, hrefLabel }: { kicker: string; title: string; sub?: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <div className="font-mono text-xs text-action">{kicker}</div>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-sm text-muted">{sub}</p>}
      </div>
      {href && hrefLabel && (
        <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm text-action hover:underline sm:flex">
          {hrefLabel} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero · assimétrico, alinhado à esquerda */}
      <section className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_1.05fr] lg:py-20">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.5rem]">
            {t.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted md:text-base">{t.home.heroSub}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/baixar"
              className="btn-glass-primary flex h-12 items-center justify-center rounded-md px-6 font-medium"
            >
              {t.cta.download}
            </Link>
            <a href={brand.github} className="btn-glass flex h-12 items-center justify-center rounded-md px-5 text-sm">
              {t.cta.viewCode}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-muted">
            <span className="text-good">● reversível</span>
            <span>não injeta no jogo</span>
            <span>SHA256 verificável</span>
          </div>
        </div>

        <div className="lg:pl-4">
          <DiagnosticDemo />
        </div>
      </section>

      {/* Vitrine do app (prints reais) */}
      <section className="border-t border-line py-16">
        <Reveal>
          <SectionHead kicker="01 · o app" title={t.home.showcaseTitle} sub={t.home.showcaseSub} />
          <AppShowcase />
        </Reveal>
      </section>

      {/* Jogos */}
      <section className="border-t border-line py-16">
        <SectionHead kicker="02 · jogos" title={t.home.gamesTitle} sub={t.home.gamesSub} href="/jogos" hrefLabel={t.nav.games} />
        <Reveal>
          <GamesStrip />
        </Reveal>
      </section>

      {/* Passos */}
      <section className="border-t border-line py-16">
        <SectionHead kicker="03 · fluxo" title={t.home.stepsTitle} />
        <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {t.steps.map((s, i) => (
            <li key={i} className="list-none bg-panel p-6">
              <div className="font-mono text-sm text-action">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 font-medium">{s.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Segurança · conteúdo de verdade */}
      <section className="border-t border-line py-16">
        <SectionHead kicker="04 · segurança" title={t.pages.security.title} sub={t.pages.security.sub} />
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {t.pages.security.points.map((pt, i) => (
            <div key={i} className="flex gap-3">
              <Check size={18} className="mt-0.5 shrink-0 text-good" />
              <div>
                <h3 className="font-medium">{pt.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{pt.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber/25 bg-amber/5 p-5">
          <FileSearch size={20} className="mt-0.5 shrink-0 text-amber" />
          <div>
            <h3 className="font-medium">{t.pages.security.virusTitle}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{t.pages.security.virus}</p>
            <Link href="/seguranca" className="mt-3 inline-flex items-center gap-1 text-sm text-action hover:underline">
              {t.home.safetyCta} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ na home */}
      <section className="border-t border-line py-16">
        <FaqSection limit={5} />
      </section>

      {/* CTA final · alinhado à esquerda */}
      <section className="border-t border-line py-16">
        <div className="flex flex-col gap-6 rounded-2xl border border-line bg-panel p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{t.home.heroTitle}</h2>
            <p className="mt-2 font-mono text-xs text-muted">{t.trustLine}</p>
          </div>
          <Link
            href="/baixar"
            className="btn-glass-primary flex shrink-0 items-center gap-2 self-start rounded-md px-7 py-3.5 font-semibold md:self-auto"
          >
            {t.cta.download} <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
