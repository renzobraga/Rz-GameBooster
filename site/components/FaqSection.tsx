"use client";

import { ArrowRight, Clock, MessageCircle, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

const PHONE_DISPLAY = "(22) 99292-0897";
const WHATSAPP = "https://wa.me/5522992920897";
const TEL = "tel:+5522992920897";

export function FaqSection({ limit }: { limit?: number }) {
  const t = useT();
  const faq = t.pages.faq;
  const items = limit ? faq.items.slice(0, limit) : faq.items;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
      {/* Coluna esquerda (fixa) */}
      <div className="flex flex-col gap-5 lg:sticky lg:top-24">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-muted">
          FAQ
        </span>
        <h2 className="font-display text-balance text-2xl font-bold tracking-tight md:text-3xl">{faq.title}</h2>
        <p className="text-sm text-muted">{faq.sub}</p>

        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-good/15 text-good">
              <MessageCircle className="size-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <p className="text-sm font-medium text-ink">{faq.talk}</p>
              <p className="text-xs text-muted">
                <Clock className="mr-1.5 inline size-3" />
                {faq.replies}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="mt-1 w-full rounded-full">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              {faq.whatsapp}
              <ArrowRight />
            </a>
          </Button>
          <p className="text-center text-[11px] text-muted">
            <Phone className="mr-1 inline size-3" />
            {faq.orCall}{" "}
            <a href={TEL} className="font-medium text-ink underline-offset-4 hover:underline">
              {PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </div>

      {/* Coluna direita (acordeão) */}
      <Accordion type="single" collapsible defaultValue="item-0">
        {items.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
