"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { brand } from "@/lib/brand";
import { useLang, useT } from "@/lib/i18n";

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-md border border-line p-0.5 font-mono text-xs">
      <button
        onClick={() => setLang("pt")}
        className={`rounded px-2 py-1 ${lang === "pt" ? "bg-line text-ink" : "text-muted hover:text-ink"}`}
      >
        PT
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded px-2 py-1 ${lang === "en" ? "bg-line text-ink" : "text-muted hover:text-ink"}`}
      >
        EN
      </button>
    </div>
  );
}

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/como-funciona", label: t.nav.how },
    { href: "/jogos", label: t.nav.games },
    { href: "/seguranca", label: t.nav.security },
    { href: "/faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <Link
            href="/baixar"
            className="hidden h-9 items-center rounded-md bg-action px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:flex"
          >
            {t.nav.download}
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted md:hidden" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-sm text-ink">
                {l.label}
              </Link>
            ))}
            <Link href="/baixar" onClick={() => setOpen(false)} className="mt-2 flex h-11 items-center justify-center rounded-md bg-action text-sm font-medium text-bg">
              {t.nav.download}
            </Link>
            <a href={brand.github} className="py-3 text-sm text-muted">
              GitHub
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
