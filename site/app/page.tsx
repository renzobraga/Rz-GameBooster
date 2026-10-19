import { Gauge } from "@/components/Gauge";
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
      <header className="flex items-center justify-between py-6">
        <span className="font-mono text-sm tracking-tight text-ink">{brand.name}</span>
        <a href={brand.github} className="text-sm text-muted transition-colors hover:text-ink">
          GitHub
        </a>
      </header>

      <main>
        <section className="grid items-center gap-10 pt-10 pb-20 md:grid-cols-2 md:pt-16">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mt-5 max-w-md text-muted">
              Otimizador de Windows para {brand.games.join(", ")}. Grátis e open source.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={download}
                className="rounded-md bg-action px-5 py-3 font-medium text-bg transition-opacity hover:opacity-90"
              >
                Baixar para Windows
              </a>
              <a href={brand.github} className="px-2 py-3 text-sm text-muted hover:text-ink">
                Ver o código
              </a>
            </div>
            <p className="mt-5 font-mono text-xs text-muted">
              Reversível · Não injeta no jogo · SHA256 verificável
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <Gauge score={82} />
          </div>
        </section>

        <section className="border-t border-line py-16">
          <ol className="grid gap-10 md:grid-cols-3">
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
