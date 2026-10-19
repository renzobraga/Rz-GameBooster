"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { brand } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  const cols = [
    {
      head: t.footer.product,
      links: [
        { href: "/como-funciona", label: t.footer.how },
        { href: "/jogos", label: t.footer.games },
        { href: "/changelog", label: t.footer.changelog },
      ],
    },
    {
      head: t.footer.trust,
      links: [
        { href: "/seguranca", label: t.footer.security },
        { href: "/faq", label: t.footer.faq },
        { href: "/privacidade", label: t.footer.privacy },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-[22ch] text-xs text-muted">{t.footer.rights}</p>
        </div>
        {cols.map((c) => (
          <div key={c.head}>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">{c.head}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">{t.footer.project}</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a href={brand.github} className="text-sm text-muted hover:text-ink">
                {t.footer.github}
              </a>
            </li>
            <li>
              <a href={`${brand.github}/blob/main/LICENSE`} className="text-sm text-muted hover:text-ink">
                {t.footer.license}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted">
          {brand.name} · {brand.license} · {t.notAffiliated}
        </p>
      </div>
    </footer>
  );
}
