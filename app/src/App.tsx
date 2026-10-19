import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  SlidersHorizontal,
  History,
  Info,
  Download,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Cpu,
  MonitorPlay,
  MemoryStick,
  HardDrive,
  LayoutDashboard,
  Gauge as GaugeIcon,
} from "lucide-react";
import { Gauge } from "./components/Gauge";
import { ElasticGallery } from "./components/ElasticGallery";
import { Logo } from "./components/Logo";
import { LangToggle, useT } from "./lib/i18n";
import { estimateFps } from "./lib/fps";
import {
  applyTweaks,
  checkUpdate,
  diagnose,
  history,
  installUpdate,
  isTauri,
  listGames,
  listTweaks,
  reboot,
  revertAll,
  revertTweaks,
  systemInfo,
  type BatchResult,
  type GameProfile,
  type Journal,
  type Report,
  type Severity,
  type SystemInfo,
  type TweakView,
} from "./lib/api";

const APP_VERSION = "0.1.2";
const SITE = "https://github.com/renzobraga/Rz-GameBooster";

type Tab = "painel" | "diagnostico" | "otimizacoes" | "historico" | "sobre";
const TAB_ORDER: { id: Tab; icon: typeof Activity }[] = [
  { id: "painel", icon: LayoutDashboard },
  { id: "diagnostico", icon: Activity },
  { id: "otimizacoes", icon: SlidersHorizontal },
  { id: "historico", icon: History },
  { id: "sobre", icon: Info },
];

const sevColor: Record<Severity, string> = {
  critical: "text-bad",
  warning: "text-amber",
  info: "text-muted",
};

type Toast = { kind: "success" | "info" | "error"; msg: string } | null;

function isBatch(x: unknown): x is BatchResult {
  return !!x && typeof x === "object" && "needs_reboot" in x;
}

export default function App() {
  const { lang, t } = useT();
  const [games, setGames] = useState<GameProfile[]>([]);
  const [gameId, setGameId] = useState<string>("");
  const [view, setView] = useState<"select" | "dash">("select");
  const [tweaks, setTweaks] = useState<TweakView[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [journal, setJournal] = useState<Journal>({ entries: [] });
  const [sys, setSys] = useState<SystemInfo | null>(null);
  const [tab, setTab] = useState<Tab>("diagnostico");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [rebootOpen, setRebootOpen] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [update, setUpdate] = useState<{ version: string; notes?: string; obj: unknown } | null>(null);

  const busy = busyKey !== null;
  const game = games.find((g) => g.id === gameId);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushToast = useCallback((kind: NonNullable<Toast>["kind"], msg: string) => {
    setToast({ kind, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const refreshTweaks = useCallback(async (id: string) => {
    if (id) setTweaks(await listTweaks(id, lang));
  }, [lang]);

  const refreshDiag = useCallback(async () => {
    setReport(await diagnose(lang));
    setJournal(await history());
    setLastScan(Date.now());
  }, [lang]);

  // Carga unica (nao depende de idioma).
  useEffect(() => {
    (async () => {
      setGames(await listGames());
      setSys(await systemInfo());
      try {
        setUpdate(await checkUpdate());
      } catch {
        /* sem rede / sem release ainda */
      }
    })();
  }, []);

  // Diagnostico e ajustes seguem o idioma (refazem ao trocar a bandeira).
  useEffect(() => {
    void refreshDiag();
  }, [refreshDiag]);
  useEffect(() => {
    void refreshTweaks(gameId);
  }, [gameId, refreshTweaks]);

  // Executor unico: trava contra spam (uma acao por vez), da feedback (toast)
  // e abre o pop-up de reinicio quando a acao exige reiniciar o Windows.
  const run = useCallback(
    async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
      if (busyKey) return;
      setBusyKey(key);
      try {
        const res = await fn();
        await refreshDiag();
        await refreshTweaks(gameId);
        pushToast("success", okMsg);
        if (isBatch(res) && res.needs_reboot) setRebootOpen(true);
      } catch (e) {
        pushToast("error", e instanceof Error ? e.message : String(e));
      } finally {
        setBusyKey(null);
      }
    },
    [busyKey, gameId, refreshDiag, refreshTweaks, pushToast]
  );

  const rescan = () => run("diag", async () => {}, t.toast.scan);
  const fixIssue = (fixId: string) => run(`fix:${fixId}`, () => applyTweaks(gameId, [fixId]), t.toast.fix);
  const applyOne = (id: string) => run(`apply:${id}`, () => applyTweaks(gameId, [id]), t.toast.apply);
  const revertOne = (id: string) => run(`revert:${id}`, () => revertTweaks([id]), t.toast.revert);
  const revertAllNow = () => run("revertAll", () => revertAll(), t.toast.revertAll);
  const applyRecommended = () =>
    run(
      "recommended",
      () => applyTweaks(gameId, tweaks.filter((tw) => tw.recommended && tw.supported && tw.state !== "applied").map((tw) => tw.id)),
      t.toast.rec
    );

  const doReboot = async () => {
    setRebooting(true);
    try {
      await reboot();
      if (!isTauri) pushToast("info", t.toast.rebootPreview);
    } catch (e) {
      pushToast("error", e instanceof Error ? e.message : String(e));
    } finally {
      setRebooting(false);
      setRebootOpen(false);
    }
  };

  const Badges = (
    <div className="ml-auto flex items-center gap-3">
      <LangToggle />
      {update && (
        <button
          onClick={() => installUpdate(update.obj)}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50"
        >
          <Download size={14} /> {t.update(update.version)}
        </button>
      )}
    </div>
  );

  const overlays = (
    <>
      <ToastBar toast={toast} />
      <RebootModal open={rebootOpen} busy={rebooting} onReboot={doReboot} onLater={() => setRebootOpen(false)} />
    </>
  );

  if (view === "select") {
    return (
      <div className="flex h-full flex-col bg-bg text-ink">
        <header className="flex items-center gap-3 border-b border-line px-5 py-3">
          <Logo />
          <span className="text-sm text-muted">{t.chooseGame}</span>
          {Badges}
        </header>
        <div className="flex-1 overflow-hidden">
          <ElasticGallery
            games={games}
            onSelect={(id) => {
              setGameId(id);
              setTab("painel");
              setView("dash");
            }}
          />
        </div>
        {overlays}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Logo />
        <button
          onClick={() => setView("select")}
          disabled={busy}
          className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-sm text-muted hover:text-ink disabled:opacity-50"
        >
          <ChevronLeft size={15} /> {game?.name ?? t.changeGame}
        </button>
        {Badges}
      </header>

      <nav className="flex gap-1 border-b border-line px-3">
        {TAB_ORDER.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          const label =
            tb.id === "painel"
              ? t.tabs.panel
              : tb.id === "diagnostico"
              ? t.tabs.diag
              : tb.id === "otimizacoes"
              ? t.tabs.opt
              : tb.id === "historico"
              ? t.tabs.hist
              : t.tabs.about;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active ? "border-action text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto p-6">
        {tab === "painel" && <Painel sys={sys} game={game} />}
        {tab === "diagnostico" && report && (
          <Diagnostico report={report} busy={busy} busyKey={busyKey} lastScan={lastScan} onFix={fixIssue} onRescan={rescan} />
        )}
        {tab === "otimizacoes" && <Otimizacoes tweaks={tweaks} busy={busy} busyKey={busyKey} onApply={applyOne} onRevert={revertOne} onRecommended={applyRecommended} />}
        {tab === "historico" && <Historico journal={journal} tweaks={tweaks} busy={busy} busyKey={busyKey} onRevert={revertOne} onRevertAll={revertAllNow} />}
        {tab === "sobre" && <Sobre game={game} update={update} />}
      </main>

      {overlays}
    </div>
  );
}

/* ---------- Feedback: toast + pop-up de reinicio ---------- */

function ToastBar({ toast }: { toast: Toast }) {
  if (!toast) return null;
  const tone = toast.kind === "success" ? "border-good/40" : toast.kind === "error" ? "border-bad/40" : "border-line";
  const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? AlertCircle : Info;
  const ic = toast.kind === "success" ? "text-good" : toast.kind === "error" ? "text-bad" : "text-action";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className={`flex items-center gap-2 rounded-lg border bg-panel px-4 py-2.5 text-sm shadow-2xl ${tone}`}>
        <Icon size={16} className={ic} />
        <span className="text-ink">{toast.msg}</span>
      </div>
    </div>
  );
}

function RebootModal({ open, busy, onReboot, onLater }: { open: boolean; busy: boolean; onReboot: () => void; onLater: () => void }) {
  const { t } = useT();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber/15 p-2 text-amber">
            <RotateCcw size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-ink">{t.modal.title}</h3>
            <p className="mt-1 text-sm text-muted">{t.modal.body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onLater} disabled={busy} className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-50">
            {t.modal.later}
          </button>
          <button
            onClick={onReboot}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-action px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 size={14} className="animate-spin" />} {t.modal.now}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Aba Painel: specs do PC + FPS estimado ---------- */

function Painel({ sys, game }: { sys: SystemInfo | null; game: GameProfile | undefined }) {
  const { t } = useT();
  const gb = (n: number | null | undefined) => (n != null ? `${n.toFixed(0)} GB` : t.pc.unknown);
  const storage =
    sys && sys.storage_total_gb != null
      ? `${gb(sys.storage_total_gb)}${sys.storage_free_gb != null ? ` · ${sys.storage_free_gb.toFixed(0)} GB ${t.pc.free}` : ""}`
      : t.pc.unknown;
  const items = [
    { icon: Cpu, label: t.pc.cpu, value: sys?.cpu ?? t.pc.unknown },
    { icon: MonitorPlay, label: t.pc.gpu, value: sys?.gpu ?? t.pc.unknown },
    { icon: MemoryStick, label: t.pc.ram, value: gb(sys?.ram_gb) },
    { icon: HardDrive, label: t.pc.storage, value: storage },
  ];

  const est = game ? estimateFps(sys, game.id) : null;
  const tierColor =
    est?.tier === "elite" || est?.tier === "high"
      ? "text-good"
      : est?.tier === "smooth" || est?.tier === "playable"
      ? "text-action"
      : "text-amber";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Cada peça num bullet próprio; o nome pode quebrar para a linha de baixo. */}
      <ul className="flex flex-col gap-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
              <Icon size={18} className="mt-0.5 shrink-0 text-action" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted">{it.label}</p>
                <p className="text-sm font-medium leading-snug [overflow-wrap:anywhere]">{it.value}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* FPS estimado a partir das configs, logo abaixo das specs. */}
      <div className="mt-6 rounded-xl border border-line bg-panel p-5">
        <div className="flex items-center gap-2">
          <GaugeIcon size={16} className="text-action" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{t.fps.title}</p>
        </div>
        {est && est.fps != null ? (
          <>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-5xl font-extrabold leading-none text-ink">{est.fps}</span>
              <span className="text-sm text-muted">{t.fps.unit}</span>
              <span className={`ml-2 text-sm font-medium ${tierColor}`}>{t.fps.tiers[est.tier]}</span>
            </div>
            {game && <p className="mt-2 text-sm text-muted">{t.fps.sub(game.name)}</p>}
            <p className="mt-1 text-[11px] text-muted">{t.fps.note}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">{t.fps.gpuUnknown}</p>
        )}
      </div>
    </div>
  );
}

/* ---------- Abas ---------- */

function Diagnostico({
  report,
  busy,
  busyKey,
  lastScan,
  onFix,
  onRescan,
}: {
  report: Report;
  busy: boolean;
  busyKey: string | null;
  lastScan: number | null;
  onFix: (id: string) => void;
  onRescan: () => void;
}) {
  const { t } = useT();
  const scanning = busyKey === "diag";
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-2 pb-6">
        <div className={scanning ? "animate-pulse" : ""}>
          <Gauge score={report.score} size={240} />
        </div>
        <p className="text-sm text-muted">{t.diag.subtitle}</p>
        <button
          onClick={onRescan}
          disabled={busy}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-60"
        >
          {scanning ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
          {scanning ? t.diag.scanning : t.diag.rescan}
        </button>
        <p className="font-mono text-[11px] text-muted">
          {t.diag.lastScan}: {lastScan ? new Date(lastScan).toLocaleTimeString() : "—"}
        </p>
      </div>

      {report.issues.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-good/40 bg-panel p-4 text-sm text-good">
          <CheckCircle2 size={16} /> {t.diag.allGood}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {report.issues.map((i) => {
            const fixing = i.fix ? busyKey === `fix:${i.fix}` : false;
            return (
              <li key={i.id} className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i.severity === "critical" ? "bg-bad" : i.severity === "warning" ? "bg-amber" : "bg-muted"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${sevColor[i.severity]}`}>{i.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{i.detail}</p>
                </div>
                {i.fix && (
                  <button
                    onClick={() => onFix(i.fix!)}
                    disabled={busy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50"
                  >
                    {fixing && <Loader2 size={13} className="animate-spin" />}
                    {fixing ? t.diag.fixing : t.diag.fix}
                  </button>
                )}
              </li>
            );
          })}
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

function RiskBadge({ tw }: { tw: TweakView }) {
  const { t } = useT();
  const riskLabel = tw.risk === "safe" ? t.risk.safe : t.risk.moderate;
  const riskColor = tw.risk === "safe" ? "text-good" : "text-amber";
  const evidence = tw.evidence === "proven" ? t.risk.proven : tw.evidence === "situational" ? t.risk.situational : t.risk.weak;
  const cat = t.cat[tw.category] ?? tw.category;
  return (
    <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
      <span className={riskColor}>{riskLabel}</span>
      <span>· {evidence}</span>
      <span>· {cat}</span>
      {tw.requires_reboot && <span className="text-amber">· {t.risk.reboot}</span>}
    </span>
  );
}

function StatePill({ state }: { state: TweakView["state"] }) {
  const { t } = useT();
  const map = {
    applied: { c: "bg-good/15 text-good", l: t.state.applied },
    not_applied: { c: "bg-line text-muted", l: t.state.not_applied },
    partial: { c: "bg-amber/15 text-amber", l: t.state.partial },
    unknown: { c: "bg-line text-muted", l: t.state.unknown },
  }[state];
  return <span className={`rounded px-2 py-0.5 text-[11px] ${map.c}`}>{map.l}</span>;
}

function Otimizacoes({
  tweaks,
  busy,
  busyKey,
  onApply,
  onRevert,
  onRecommended,
}: {
  tweaks: TweakView[];
  busy: boolean;
  busyKey: string | null;
  onApply: (id: string) => void;
  onRevert: (id: string) => void;
  onRecommended: () => void;
}) {
  const { t } = useT();
  const recommending = busyKey === "recommended";
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{t.opt.count(tweaks.length)}</p>
        <button
          onClick={onRecommended}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-action px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-50"
        >
          {recommending && <Loader2 size={14} className="animate-spin" />}
          {recommending ? t.opt.applying : t.opt.applyRec}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {tweaks.map((tw) => {
          const applying = busyKey === `apply:${tw.id}`;
          const reverting = busyKey === `revert:${tw.id}`;
          return (
            <li key={tw.id} className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{tw.title}</p>
                  <StatePill state={tw.state} />
                </div>
                <p className="mt-0.5 text-sm text-muted">{tw.description}</p>
                <div className="mt-1.5">
                  <RiskBadge tw={tw} />
                </div>
                {tw.fit_note && <p className="mt-1 text-[11px] italic text-muted">{tw.fit_note}</p>}
                {!tw.supported && tw.unsupported_reason && <p className="mt-1 text-[11px] text-amber">{tw.unsupported_reason}</p>}
              </div>
              {tw.state === "applied" || tw.managed ? (
                <button
                  onClick={() => onRevert(tw.id)}
                  disabled={busy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50"
                >
                  {reverting && <Loader2 size={13} className="animate-spin" />}
                  {reverting ? t.opt.reverting : t.opt.revert}
                </button>
              ) : (
                <button
                  onClick={() => onApply(tw.id)}
                  disabled={busy || !tw.supported}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-action px-3 py-1.5 text-xs font-medium text-bg hover:opacity-90 disabled:opacity-50"
                >
                  {applying && <Loader2 size={13} className="animate-spin" />}
                  {applying ? t.opt.applying : t.opt.apply}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Historico({
  journal,
  tweaks,
  busy,
  busyKey,
  onRevert,
  onRevertAll,
}: {
  journal: Journal;
  tweaks: TweakView[];
  busy: boolean;
  busyKey: string | null;
  onRevert: (id: string) => void;
  onRevertAll: () => void;
}) {
  const { t } = useT();
  const active = journal.entries.filter((e) => e.reverted_at === null);
  const revertingAll = busyKey === "revertAll";
  // Titulo no idioma atual quando o tweak existe na lista carregada.
  const titleFor = (tweakId: string, fallback: string) => tweaks.find((tw) => tw.id === tweakId)?.title ?? fallback;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{t.hist.count(journal.entries.length)}</p>
        {active.length > 0 && (
          <button
            onClick={onRevertAll}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
          >
            {revertingAll && <Loader2 size={14} className="animate-spin" />}
            {revertingAll ? t.hist.reverting : t.hist.revertAll}
          </button>
        )}
      </div>
      {journal.entries.length === 0 ? (
        <p className="rounded-lg border border-line bg-panel p-4 text-sm text-muted">{t.hist.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {[...journal.entries].reverse().map((e) => {
            const reverting = busyKey === `revert:${e.tweak_id}`;
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{titleFor(e.tweak_id, e.title)}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">
                    {new Date(e.applied_at).toLocaleString()}
                    {e.reverted_at !== null && ` · ${t.hist.reverted}`}
                  </p>
                </div>
                {e.reverted_at === null && (
                  <button
                    onClick={() => onRevert(e.tweak_id)}
                    disabled={busy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50"
                  >
                    {reverting && <Loader2 size={13} className="animate-spin" />}
                    {reverting ? t.hist.reverting : t.hist.revert}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Sobre({ game, update }: { game: GameProfile | undefined; update: { version: string } | null }) {
  const { t, lang } = useT();
  const notes = game ? (lang === "en" ? t.gameNotes[game.id] ?? game.anticheat_notes : game.anticheat_notes) : "";
  return (
    <div className="mx-auto max-w-2xl text-sm">
      <h2 className="text-lg font-semibold">Rz GameBooster</h2>
      <p className="mt-1 text-muted">
        {lang === "en" ? "Version" : "Versão"} {APP_VERSION}
        {!isTauri && t.about.devTag}
      </p>
      <p className="mt-2 text-muted">{update ? t.about.updateAvail(update.version) : t.about.upToDate}</p>

      {game && (
        <div className="mt-5 rounded-lg border border-line bg-panel p-4">
          <p className="font-medium">
            {game.name} · {t.about.anticheat(game.anticheat, game.anticheat_level)}
          </p>
          <p className="mt-1 text-muted">{notes}</p>
        </div>
      )}

      <div className="mt-5 text-muted">
        <p>{t.about.gpl1}</p>
        <p className="mt-1">{t.about.gpl2}</p>
        <a href={SITE} className="mt-3 inline-block text-action hover:underline">
          {t.about.link}
        </a>
      </div>
    </div>
  );
}
