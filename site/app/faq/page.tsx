"use client";

import { Faq } from "@/components/Faq";
import { useT } from "@/lib/i18n";

export default function Page() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t.pages.faq.title}</h1>
      <div className="mt-10">
        <Faq />
      </div>
    </div>
  );
}
