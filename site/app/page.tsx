import { Gauge } from "@/components/Gauge";
import { Logo } from "@/components/Logo";
import { brand } from "@/lib/brand";

const steps = [
  { n: 1, t: "Diagnóstico", d: "Um raio-X do seu PC em segundos, com nota de 0 a 100." },
  { n: 2, t: "Otimização", d: "Ajustes seguros do Windows aplicados com um clique." },
  { n: 3, t: "Reversível", d: "Desfaça qualquer mudança pelo histórico, quando quiser." },
];

export default function Home() {
  const download = `${brand.github}/releases/latest`;

  return (
    <div className="mx-auto max-w-5xl px-4">
      <header className="flex items-center justify-between py-5 md:py-6">
        <Logo />
        <a href={brand.github} className="flex h-10 items-center text-sm text-muted transition-colors hover:text-ink">
          GitHub
        </a>
      </header>

      <main>
        <section className="grid items-center gap-8 pt-6 pb-16 md:grid-cols-2 md:gap-10 md:pt-16 md:pb-20">
          <div>
            <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mt-4 max-w-md text-[15px] text-muted md:mt-5 md:text-base">
              Otimizador de Windows para {brand.games.join(", ")}. Grátis e open source.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8">
              <a
                href={download}
                className="flex h-12 w-full items-center justify-center rounded-md bg-action px-5 font-medium text-bg transition-opacity hover:opacity-90 sm:w-auto"
              >
                Baixar para Windows
              </a>
              <a
                href={brand.github}
                className="flex h-12 items-center justify-center text-sm text-muted hover:text-ink sm:justify-start sm:px-2"
              >
                Ver o código
              </a>
            </div>
            <p className="mt-5 font-mono text-xs text-muted">
              Reversível · Não injeta no jogo · SHA256 verificável
            </p>
          </div>

          <div className="order-first flex justify-center md:order-none md:justify-end">
            <div className="w-full max-w-[280px] sm:max-w-[380px]">
              <Gauge score={82} />
            </div>
          </div>
        </section>

        <section className="border-t border-line py-12 md:py-16">
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((s) => (
              <li key={s.n} className="list-none">
                <div className="font-mono text-sm text-action">{String(s.n).padStart(2, "0")}</div>
                <h2 className="mt-2 text-lg font-medium">{s.t}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line py-10">
          <span className="text-sm text-muted">Jogos suportados</span>
          {brand.games.map((g) => (
            <span key={g} className="font-mono text-sm text-ink">
              {g}
            </span>
          ))}
        </section>
      </main>

      <footer className="flex flex-col gap-2 border-t border-line py-10 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>
          {brand.name} · {brand.license} · não afiliado à Valve, Rockstar ou Riot
        </span>
        <span className="font-mono">Cada release traz hash SHA256 e link VirusTotal</span>
      </footer>
    </div>
  );
}
