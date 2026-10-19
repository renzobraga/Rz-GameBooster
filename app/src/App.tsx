import { useCallback, useEffect, useState } from "react";
import { Activity, SlidersHorizontal, History, Info, Download, ShieldAlert, ChevronLeft } from "lucide-react";
import { Gauge } from "./components/Gauge";
import { ElasticGallery } from "./components/ElasticGallery";
import { Logo } from "./components/Logo";
import {
  applyTweaks,
  checkUpdate,
  diagnose,
  history,
  installUpdate,
  isElevated,
  isTauri,
  listGames,
  listTweaks,
  relaunchAsAdmin,
  revertAll,
  revertTweaks,
  type GameProfile,
  type Journal,
  type Report,
  type Severity,
  type TweakView,
} from "./lib/api";

const APP_VERSION = "0.1.0";
const SITE = "https://github.com/renzobraga/cs-boost";

type Tab = "diagnostico" | "otimizacoes" | "historico" | "sobre";
const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "diagnostico", label: "Diagnóstico", icon: Activity },
  { id: "otimizacoes", label: "Otimizações", icon: SlidersHorizontal },
  { id: "historico", label: "Histórico", icon: History },
  { id: "sobre", label: "Sobre", icon: Info },
];

const sevColor: Record<Severity, string> = {
  critical: "text-bad",
  warning: "text-amber",
  info: "text-muted",
};

export default function App() {
  const [games, setGames] = useState<GameProfile[]>([]);
  const [gameId, setGameId] = useState<string>("");
  const [view, setView] = useState<"select" | "dash">("select");
  const [tweaks, setTweaks] = useState<TweakView[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [journal, setJournal] = useState<Journal>({ entries: [] });
  const [tab, setTab] = useState<Tab>("diagnostico");
  const [busy, setBusy] = useState(false);
  const [elevated, setElevated] = useState(true);
  const [update, setUpdate] = useState<{ version: string; notes?: string; obj: unknown } | null>(null);

  const game = games.find((g) => g.id === gameId);

  const refreshTweaks = useCallback(async (id: string) => {
    if (id) setTweaks(await listTweaks(id));
  }, []);

  const refreshDiag = useCallback(async () => {
    setReport(await diagnose());
    setJournal(await history());
  }, []);

  useEffect(() => {
    (async () => {
      setGames(await listGames());
      setElevated(await isElevated());
      await refreshDiag();
      try {
        setUpdate(await checkUpdate());
      } catch {
        /* sem rede / sem release ainda */
      }
    })();
  }, [refreshDiag]);

  useEffect(() => {
    void refreshTweaks(gameId);
  }, [gameId, refreshTweaks]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refreshDiag();
      await refreshTweaks(gameId);
    } finally {
      setBusy(false);
    }
  }

  const applyOne = (id: string) => run(() => applyTweaks(gameId, [id]));
  const revertOne = (id: string) => run(() => revertTweaks([id]));
  const applyRecommended = () =>
    run(() =>
      applyTweaks(
        gameId,
        tweaks.filter((t) => t.supported && t.risk === "safe" && t.evidence === "proven" && t.state !== "applied").map((t) => t.id)
      )
    );

  const Badges = (
    <div className="ml-auto flex items-center gap-3">
      {!elevated && (
        <button onClick={() => relaunchAsAdmin()} className="flex items-center gap-1.5 rounded-md bg-amber/15 px-3 py-1.5 text-xs text-amber hover:bg-amber/25">
          <ShieldAlert size={14} /> Rodar como admin
        </button>
      )}
      {update && (
        <button onClick={() => installUpdate(update.obj)} className="flex items-center gap-1.5 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90">
          <Download size={14} /> Atualizar {update.version}
        </button>
      )}
    </div>
  );

  // Tela inicial: escolha do jogo.
  if (view === "select") {
    return (
      <div className="flex h-full flex-col bg-bg text-ink">
        <header className="flex items-center gap-3 border-b border-line px-5 py-3">
          <Logo />
          <span className="text-sm text-muted">Escolha seu jogo</span>
          {Badges}
        </header>
        <div className="flex-1 overflow-hidden">
          <ElasticGallery
            games={games}
            onSelect={(id) => {
              setGameId(id);
              setTab("diagnostico");
              setView("dash");
            }}
          />
        </div>
      </div>
    );
  }

  // Otimizador do jogo escolhido.
  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Logo />
        <button onClick={() => setView("select")} className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-sm text-muted hover:text-ink">
          <ChevronLeft size={15} /> {game?.name ?? "Trocar jogo"}
        </button>
        {Badges}
      </header>

      <nav className="flex gap-1 border-b border-line px-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active ? "border-action text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto p-6">
        {tab === "diagnostico" && report && <Diagnostico report={report} busy={busy} onFix={applyOne} onRescan={refreshDiag} />}
        {tab === "otimizacoes" && <Otimizacoes tweaks={tweaks} busy={busy} onApply={applyOne} onRevert={revertOne} onRecommended={applyRecommended} />}
        {tab === "historico" && <Historico journal={journal} busy={busy} onRevert={revertOne} onRevertAll={() => run(() => revertAll())} />}
        {tab === "sobre" && <Sobre game={game} update={update} />}
      </main>
    </div>
  );
}

function Diagnostico({ report, busy, onFix, onRescan }: { report: Report; busy: boolean; onFix: (id: string) => void; onRescan: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-2 pb-6">
        <Gauge score={report.score} size={240} />
        <p className="text-sm text-muted">Nota do seu PC para jogos</p>
        <button onClick={onRescan} disabled={busy} className="mt-1 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50">
          Analisar novamente
        </button>
      </div>

      {report.issues.length === 0 ? (
        <p className="rounded-lg border border-line bg-panel p-4 text-sm text-good">Tudo certo. Nenhum problema encontrado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {report.issues.map((i) => (
            <li key={i.id} className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i.severity === "critical" ? "bg-bad" : i.severity === "warning" ? "bg-amber" : "bg-muted"}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${sevColor[i.severity]}`}>{i.title}</p>
                <p className="mt-0.5 text-sm text-muted">{i.detail}</p>
              </div>
              {i.fix && (
                <button onClick={() => onFix(i.fix!)} disabled={busy} className="shrink-0 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50">
                  Corrigir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {report.passed.length > 0 && (
        <div className="mt-5 text-xs text-muted">
          {report.passed.map((p) => (
            <span key={p} className="mr-3 inline-block">
              ✓ {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskBadge({ t }: { t: TweakView }) {
  const risk = t.risk === "safe" ? { c: "text-good", l: "seguro" } : { c: "text-amber", l: "moderado" };
  return (
    <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
      <span className={risk.c}>{risk.l}</span>
      <span>· {t.evidence === "proven" ? "comprovado" : t.evidence === "situational" ? "situacional" : "fraco"}</span>
      <span>· {t.category}</span>
      {t.requires_reboot && <span className="text-amber">· requer reinício</span>}
    </span>
  );
}

function StatePill({ state }: { state: TweakView["state"] }) {
  const map = {
    applied: { c: "bg-good/15 text-good", l: "Aplicado" },
    not_applied: { c: "bg-line text-muted", l: "Inativo" },
    partial: { c: "bg-amber/15 text-amber", l: "Parcial" },
    unknown: { c: "bg-line text-muted", l: "—" },
  }[state];
  return <span className={`rounded px-2 py-0.5 text-[11px] ${map.c}`}>{map.l}</span>;
}

function Otimizacoes({ tweaks, busy, onApply, onRevert, onRecommended }: { tweaks: TweakView[]; busy: boolean; onApply: (id: string) => void; onRevert: (id: string) => void; onRecommended: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{tweaks.length} ajustes disponíveis</p>
        <button onClick={onRecommended} disabled={busy} className="rounded-md bg-action px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50">
          Aplicar recomendados
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {tweaks.map((t) => (
          <li key={t.id} className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t.title}</p>
                <StatePill state={t.state} />
              </div>
              <p className="mt-0.5 text-sm text-muted">{t.description}</p>
              <div className="mt-1.5">
                <RiskBadge t={t} />
              </div>
              {!t.supported && t.unsupported_reason && <p className="mt-1 text-[11px] text-amber">{t.unsupported_reason}</p>}
            </div>
            {t.state === "applied" || t.managed ? (
              <button onClick={() => onRevert(t.id)} disabled={busy} className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50">
                Reverter
              </button>
            ) : (
              <button onClick={() => onApply(t.id)} disabled={busy || !t.supported} className="shrink-0 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50">
                Aplicar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Historico({ journal, busy, onRevert, onRevertAll }: { journal: Journal; busy: boolean; onRevert: (id: string) => void; onRevertAll: () => void }) {
  const active = journal.entries.filter((e) => e.reverted_at === null);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{journal.entries.length} registros</p>
        {active.length > 0 && (
          <button onClick={onRevertAll} disabled={busy} className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-50">
            Reverter tudo
          </button>
        )}
      </div>
      {journal.entries.length === 0 ? (
        <p className="rounded-lg border border-line bg-panel p-4 text-sm text-muted">Nada aplicado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {[...journal.entries].reverse().map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{e.title}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {new Date(e.applied_at).toLocaleString("pt-BR")}
                  {e.reverted_at !== null && " · revertido"}
                </p>
              </div>
              {e.reverted_at === null && (
                <button onClick={() => onRevert(e.tweak_id)} disabled={busy} className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50">
                  Reverter
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sobre({ game, update }: { game: GameProfile | undefined; update: { version: string } | null }) {
  return (
    <div className="mx-auto max-w-2xl text-sm">
      <h2 className="text-lg font-semibold">Rz GameBooster</h2>
      <p className="mt-1 text-muted">Versão {APP_VERSION}{!isTauri && " (navegador/dev)"}</p>
      <p className="mt-2 text-muted">{update ? `Atualização ${update.version} disponível.` : "Você está na versão mais recente."}</p>

      {game && (
        <div className="mt-5 rounded-lg border border-line bg-panel p-4">
          <p className="font-medium">{game.name} · anti-cheat {game.anticheat} ({game.anticheat_level})</p>
          <p className="mt-1 text-muted">{game.anticheat_notes}</p>
        </div>
      )}

      <div className="mt-5 text-muted">
        <p>Gratuito e open source (GPL-3.0). Não afiliado à Valve, Rockstar ou Riot.</p>
        <p className="mt-1">Nunca tocamos no processo, memória ou arquivos dos jogos, apenas configurações do Windows, e tudo é reversível.</p>
        <a href={SITE} className="mt-3 inline-block text-action hover:underline">
          Código e releases no GitHub
        </a>
      </div>
    </div>
  );
}
