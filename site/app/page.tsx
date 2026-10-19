"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppShowcase } from "@/components/AppShowcase";
import { DiagnosticDemo } from "@/components/DiagnosticDemo";
import { GamesStrip } from "@/components/GamesStrip";
import { Reveal } from "@/components/Reveal";
import { brand } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export default function Home() {
  const t = useT();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="pt-12 pb-10 text-center md:pt-20">
        <h1 className="mx-auto max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
          {t.home.heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted md:text-base">{t.home.heroSub}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/baixar"
            className="flex h-12 w-full max-w-xs items-center justify-center rounded-md bg-action px-6 font-medium text-bg transition-opacity hover:opacity-90 sm:w-auto"
          >
            {t.cta.download}
          </Link>
          <a href={brand.github} className="flex h-12 items-center justify-center px-3 text-sm text-muted hover:text-ink">
            {t.cta.viewCode}
          </a>
        </div>
        <p className="mt-5 font-mono text-xs text-muted">{t.trustLine}</p>
      </section>

      {/* Demo interativa */}
      <section className="pb-16">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">{t.home.demoTitle}</h2>
          <p className="mt-2 text-sm text-muted">{t.home.demoSub}</p>
        </div>
        <DiagnosticDemo />
      </section>

      {/* Vitrine do app (prints reais) */}
      <section className="border-t border-line py-16">
        <Reveal>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.home.showcaseTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.home.showcaseSub}</p>
          </div>
          <AppShowcase />
        </Reveal>
      </section>

      {/* Jogos */}
      <section className="border-t border-line py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.home.gamesTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.home.gamesSub}</p>
          </div>
          <Link href="/jogos" className="hidden shrink-0 items-center gap-1 text-sm text-action hover:underline sm:flex">
            {t.nav.games} <ArrowRight size={15} />
          </Link>
        </div>
        <Reveal>
          <GamesStrip />
        </Reveal>
      </section>

      {/* Passos */}
      <section className="border-t border-line py-16">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.home.stepsTitle}</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {t.steps.map((s, i) => (
            <li key={i} className="list-none">
              <div className="font-mono text-sm text-action">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-lg font-medium">{s.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Segurança */}
      <section className="border-t border-line py-16">
        <div className="rounded-2xl border border-line bg-panel p-8 md:p-12">
          <div className="flex items-center gap-2 text-good">
            <ShieldCheck size={20} />
            <span className="font-mono text-xs uppercase tracking-wider">{t.footer.security}</span>
          </div>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">{t.home.safetyTitle}</h2>
          <p className="mt-3 max-w-2xl text-muted">{t.home.safetySub}</p>
          <Link href="/seguranca" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-action hover:underline">
            {t.home.safetyCta} <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
