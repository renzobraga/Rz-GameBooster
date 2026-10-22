// Ponte com o backend Rust. No navegador (preview sem Tauri) usa dados de
// exemplo COM ESTADO: aplicar/reverter muda o diagnostico, pra UI se comportar
// como no app instalado. O backend real (Windows) ja e com estado de verdade.

export type Severity = "critical" | "warning" | "info";

export interface Issue {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  fix: string | null;
}

export interface Report {
  score: number;
  elevated: boolean;
  mem_total_gb: number | null;
  free_disk_gb: number | null;
  power_ok: boolean;
  issues: Issue[];
  passed: string[];
}

export interface TweakView {
  id: string;
  category: string;
  title: string;
  description: string;
  risk: "safe" | "moderate";
  evidence: "proven" | "situational" | "weak";
  requires_reboot: boolean;
  laptop_warning: boolean;
  presets: string[];
  how_to_check: string;
  state: "applied" | "not_applied" | "partial" | "unknown";
  managed: boolean;
  supported: boolean;
  unsupported_reason: string | null;
  recommended: boolean;
  fit_note: string | null;
}

export interface GameProfile {
  id: string;
  name: string;
  store: string;
  anticheat: string;
  anticheat_level: string;
  anticheat_notes: string;
}

export interface OpResult {
  tweak_id: string;
  ok: boolean;
  skipped: boolean;
  message: string;
}

export interface BatchResult {
  results: OpResult[];
  needs_reboot: boolean;
}

export interface JournalEntry {
  id: number;
  tweak_id: string;
  title: string;
  applied_at: number;
  reverted_at: number | null;
}

export interface Journal {
  entries: JournalEntry[];
}

export interface SystemInfo {
  cpu: string | null;
  gpu: string | null;
  os: string | null;
  ram_gb: number | null;
  storage_total_gb: number | null;
  storage_free_gb: number | null;
}

export interface CleanResult {
  id: string;
  ok: boolean;
  skipped: boolean;
  freed_bytes: number;
  message: string;
}

export interface CleanReport {
  results: CleanResult[];
  freed_bytes: number;
}

export interface CleanScan {
  id: string;
  bytes: number;
  available: boolean;
}

export type Lang = "pt" | "en";

export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

// ---- Dados de exemplo (apenas no navegador/preview, sem backend) ----
// Um pequeno atraso deixa visivel o estado "carregando" dos botoes no preview.
const MOCK_DELAY = 550;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockGames: GameProfile[] = [
  { id: "cs2", name: "Counter-Strike 2", store: "steam", anticheat: "VAC", anticheat_level: "usermode", anticheat_notes: "O VAC é tolerante a ajustes de Windows. Nunca tocamos no processo ou arquivos do jogo." },
  { id: "gtav", name: "GTA V", store: "multi", anticheat: "BattlEye", anticheat_level: "kernel", anticheat_notes: "GTA Online usa BattlEye (kernel). Só mexemos em configurações do Windows." },
  { id: "valorant", name: "Valorant", store: "riot", anticheat: "Vanguard", anticheat_level: "kernel", anticheat_notes: "Vanguard roda no kernel. Só aplicamos ajustes de Windows, nunca perto do jogo." },
];

interface MockDef {
  id: string;
  category: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  risk: "safe" | "moderate";
  evidence: "proven" | "situational" | "weak";
  requires_reboot: boolean;
  managed: boolean;
}

const MOCK_DEFS: MockDef[] = [
  { id: "power.high_performance", category: "energia", title: "Plano de energia de alto desempenho", title_en: "High performance power plan", description: "Troca para Alto Desempenho para a CPU não reduzir a frequência.", description_en: "Switches to High performance so the CPU does not throttle.", risk: "safe", evidence: "proven", requires_reboot: false, managed: true },
  { id: "gamedvr.disable", category: "graficos", title: "Desativar gravação em segundo plano", title_en: "Disable background recording", description: "Desliga a captura automática do Game Bar.", description_en: "Turns off Game Bar background capture.", risk: "safe", evidence: "proven", requires_reboot: false, managed: false },
  { id: "graphics.gpu_preference", category: "graficos", title: "Forçar a GPU dedicada para o jogo", title_en: "Force the dedicated GPU for the game", description: "Preferência de alto desempenho para o executável do jogo.", description_en: "High-performance GPU preference for the game's executable.", risk: "safe", evidence: "proven", requires_reboot: false, managed: false },
  { id: "input.mouse_no_accel", category: "entrada", title: "Desativar aceleração do mouse", title_en: "Disable mouse acceleration", description: "Movimento 1:1, mais consistente para mira.", description_en: "1:1 movement, more consistent for aiming.", risk: "safe", evidence: "proven", requires_reboot: false, managed: false },
  { id: "graphics.hags", category: "graficos", title: "Agendamento de GPU por hardware (HAGS)", title_en: "Hardware-accelerated GPU scheduling (HAGS)", description: "O ganho varia; meça antes e depois.", description_en: "Results vary; benchmark before and after.", risk: "moderate", evidence: "situational", requires_reboot: true, managed: false },
  { id: "latency.system_responsiveness", category: "latencia", title: "Reduzir System Responsiveness", title_en: "Lower System Responsiveness", description: "Prioriza o jogo sobre tarefas em segundo plano.", description_en: "Prioritizes the game over background tasks.", risk: "moderate", evidence: "situational", requires_reboot: true, managed: false },
];

// Problemas que o diagnostico aponta e o ajuste que os resolve.
const MOCK_ISSUES: { id: string; severity: Severity; title: string; title_en: string; detail: string; detail_en: string; fix: string; penalty: number; passedLabel: string; passedLabel_en: string }[] = [
  { id: "gamedvr", severity: "warning", title: "Gravação em segundo plano ligada", title_en: "Background recording is on", detail: "A captura do Game Bar consome CPU/GPU durante o jogo.", detail_en: "Game Bar capture uses CPU/GPU while you play.", fix: "gamedvr.disable", penalty: 11, passedLabel: "Gravação em segundo plano desligada", passedLabel_en: "Background recording off" },
  { id: "hags", severity: "info", title: "HAGS desligado", title_en: "HAGS is off", detail: "Pode ajudar em algumas máquinas. Meça antes e depois.", detail_en: "May help on some machines. Measure before and after.", fix: "graphics.hags", penalty: 7, passedLabel: "HAGS avaliado", passedLabel_en: "HAGS evaluated" },
];

const mockApplied = new Set<string>(["power.high_performance"]);
const mockJournal: JournalEntry[] = [
  { id: 1, tweak_id: "power.high_performance", title: "Plano de energia de alto desempenho", applied_at: Date.now() - 3600_000, reverted_at: null },
];
let mockJournalId = 2;

function mockTweaks(lang: Lang): TweakView[] {
  const en = lang === "en";
  return MOCK_DEFS.map((d) => ({
    id: d.id,
    category: d.category,
    title: en ? d.title_en : d.title,
    description: en ? d.description_en : d.description,
    risk: d.risk,
    evidence: d.evidence,
    requires_reboot: d.requires_reboot,
    laptop_warning: false,
    presets: [],
    how_to_check: "",
    state: mockApplied.has(d.id) ? "applied" : "not_applied",
    managed: d.managed,
    supported: true,
    unsupported_reason: null,
    recommended: d.risk === "safe" && d.evidence === "proven",
    fit_note: null,
  }));
}

function mockReport(lang: Lang): Report {
  const en = lang === "en";
  const open = MOCK_ISSUES.filter((i) => !mockApplied.has(i.fix));
  const score = Math.max(0, Math.min(100, 100 - open.reduce((s, i) => s + i.penalty, 0)));
  const passed: string[] = [];
  if (mockApplied.has("power.high_performance")) passed.push(en ? "Performance power plan active" : "Plano de energia de desempenho ativo");
  passed.push(en ? "Enough RAM" : "Memória RAM suficiente", en ? "Enough disk space" : "Espaço em disco suficiente");
  for (const i of MOCK_ISSUES) if (mockApplied.has(i.fix)) passed.push(en ? i.passedLabel_en : i.passedLabel);
  return {
    score,
    elevated: true,
    mem_total_gb: 16,
    free_disk_gb: 120,
    power_ok: true,
    issues: open.map((i) => ({ id: i.id, severity: i.severity, title: en ? i.title_en : i.title, detail: en ? i.detail_en : i.detail, fix: i.fix })),
    passed,
  };
}

function mockApply(ids: string[], apply: boolean): BatchResult {
  let reboot = false;
  for (const id of ids) {
    const def = MOCK_DEFS.find((d) => d.id === id);
    if (!def) continue;
    if (def.requires_reboot) reboot = true;
    if (apply) {
      if (!mockApplied.has(id)) {
        mockApplied.add(id);
        mockJournal.push({ id: mockJournalId++, tweak_id: id, title: def.title, applied_at: Date.now(), reverted_at: null });
      }
    } else {
      mockApplied.delete(id);
      for (const e of mockJournal) if (e.tweak_id === id && e.reverted_at === null) e.reverted_at = Date.now();
    }
  }
  return {
    results: ids.map((id) => ({ tweak_id: id, ok: true, skipped: false, message: apply ? "aplicado" : "revertido" })),
    needs_reboot: reboot,
  };
}

// ---- API pública ----
export async function listGames(): Promise<GameProfile[]> {
  return isTauri ? call("list_games") : mockGames;
}
export async function listTweaks(gameId: string, lang: Lang): Promise<TweakView[]> {
  return isTauri ? call("list_tweaks", { gameId, lang }) : mockTweaks(lang);
}
export async function diagnose(lang: Lang): Promise<Report> {
  if (isTauri) return call("diagnose", { lang });
  await sleep(MOCK_DELAY);
  return mockReport(lang);
}
export async function systemInfo(): Promise<SystemInfo> {
  if (isTauri) return call("system_info");
  await sleep(200);
  return {
    cpu: "Intel Core i5-10400F",
    gpu: "NVIDIA GeForce GTX 1660 SUPER",
    os: "Windows 11 Pro",
    ram_gb: 16,
    storage_total_gb: 476,
    storage_free_gb: 120,
  };
}
export async function applyTweaks(gameId: string, ids: string[]): Promise<BatchResult> {
  if (isTauri) return call("apply_tweaks", { gameId, ids });
  await sleep(MOCK_DELAY);
  return mockApply(ids, true);
}
export async function revertTweaks(ids: string[]): Promise<BatchResult> {
  if (isTauri) return call("revert_tweaks", { ids });
  await sleep(MOCK_DELAY);
  return mockApply(ids, false);
}
export async function revertAll(): Promise<BatchResult> {
  if (isTauri) return call("revert_all");
  await sleep(MOCK_DELAY);
  return mockApply([...mockApplied], false);
}
export async function disableTweaks(gameId: string, ids: string[]): Promise<BatchResult> {
  if (isTauri) return call("disable_tweaks", { gameId, ids });
  await sleep(MOCK_DELAY);
  return mockApply(ids, false);
}
export async function disableAll(gameId: string): Promise<BatchResult> {
  if (isTauri) return call("disable_all", { gameId });
  await sleep(MOCK_DELAY);
  return mockApply([...mockApplied], false);
}
export async function history(): Promise<Journal> {
  return isTauri ? call("history") : { entries: [...mockJournal] };
}

// Espaço "liberado" de exemplo por tarefa, só para o preview no navegador.
const MOCK_CLEAN_FREED: Record<string, number> = {
  "clean.temp": 912 * 1024 * 1024,
  "clean.prefetch": 44 * 1024 * 1024,
  "clean.recycle_bin": 0,
  "clean.windows_update": 603 * 1024 * 1024,
  "clean.thumbnails": 128 * 1024 * 1024,
};

export async function cleanupScan(): Promise<CleanScan[]> {
  if (isTauri) return call("cleanup_scan");
  await sleep(300);
  // Preview: tudo com conteúdo, menos a Lixeira (vazia) — para demonstrar o
  // item desabilitado "nada para limpar".
  return [
    { id: "clean.temp", bytes: MOCK_CLEAN_FREED["clean.temp"], available: true },
    { id: "clean.prefetch", bytes: MOCK_CLEAN_FREED["clean.prefetch"], available: true },
    { id: "clean.recycle_bin", bytes: 0, available: false },
    { id: "clean.windows_update", bytes: MOCK_CLEAN_FREED["clean.windows_update"], available: true },
    { id: "clean.thumbnails", bytes: MOCK_CLEAN_FREED["clean.thumbnails"], available: true },
  ];
}

export async function cleanup(ids: string[]): Promise<CleanReport> {
  if (isTauri) return call("cleanup", { ids });
  await sleep(MOCK_DELAY);
  const results: CleanResult[] = ids.map((id) => ({
    id,
    ok: true,
    skipped: false,
    freed_bytes: MOCK_CLEAN_FREED[id] ?? 0,
    message: "ok",
  }));
  return { results, freed_bytes: results.reduce((s, r) => s + r.freed_bytes, 0) };
}
export async function isElevated(): Promise<boolean> {
  return isTauri ? call("is_elevated") : true;
}
export async function relaunchAsAdmin(): Promise<void> {
  if (isTauri) await call("relaunch_as_admin");
}
export async function reboot(): Promise<void> {
  if (isTauri) await call("reboot_system");
}

// ---- Auto-update ----
export async function checkUpdate(): Promise<{ version: string; notes?: string; obj: unknown } | null> {
  if (!isTauri) return null;
  const { check } = await import("@tauri-apps/plugin-updater");
  const update = await check();
  if (!update) return null;
  return { version: update.version, notes: update.body, obj: update };
}

export async function installUpdate(obj: unknown): Promise<void> {
  const update = obj as { downloadAndInstall: () => Promise<void> };
  await update.downloadAndInstall();
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}
