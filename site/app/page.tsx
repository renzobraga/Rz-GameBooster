import { ElasticGallery } from "@/components/ui/elastic-gallery";
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
    <div className="mx-auto max-w-6xl px-4">
      <header className="flex items-center justify-between py-5 md:py-6">
        <Logo />
        <a href={brand.github} className="flex h-10 items-center text-sm text-muted transition-colors hover:text-ink">
          GitHub
        </a>
      </header>

      <main>
        <section className="pt-4 pb-14 md:pt-8 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[1.9rem] font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              {brand.tagline}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted md:text-base">
              Otimizador de Windows para seus jogos. Grátis e open source.
            </p>
          </div>

          <div className="mt-8 md:mt-12">
            <ElasticGallery />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={download}
              className="flex h-12 w-full max-w-xs items-center justify-center rounded-md bg-action px-6 font-medium text-bg transition-opacity hover:opacity-90 sm:w-auto"
            >
              Baixar para Windows
            </a>
            <p className="font-mono text-xs text-muted">Reversível · Não injeta no jogo · SHA256 verificável</p>
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
