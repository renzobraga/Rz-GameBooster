// Ponte com o backend Rust. No navegador (dev sem Tauri) usa dados de exemplo
// para a UI continuar renderizando.

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

export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

// ---- Dados de exemplo (apenas no navegador) ----
const mockGames: GameProfile[] = [
  { id: "cs2", name: "Counter-Strike 2", store: "steam", anticheat: "VAC", anticheat_level: "usermode", anticheat_notes: "O VAC é tolerante a ajustes de Windows. Nunca tocamos no processo ou arquivos do jogo." },
  { id: "gtav", name: "GTA V", store: "multi", anticheat: "BattlEye", anticheat_level: "kernel", anticheat_notes: "GTA Online usa BattlEye (kernel). Só mexemos em configurações do Windows." },
  { id: "valorant", name: "Valorant", store: "riot", anticheat: "Vanguard", anticheat_level: "kernel", anticheat_notes: "Vanguard roda no kernel. Só aplicamos ajustes de Windows, nunca perto do jogo." },
];

function mockTweaks(): TweakView[] {
  const base = (over: Partial<TweakView> & Pick<TweakView, "id" | "category" | "title" | "description" | "risk" | "evidence">): TweakView => ({
    requires_reboot: false,
    laptop_warning: false,
    presets: [],
    how_to_check: "",
    state: "not_applied",
    managed: false,
    supported: true,
    unsupported_reason: null,
    ...over,
  });
  return [
    base({ id: "power.high_performance", category: "energia", title: "Plano de energia de alto desempenho", description: "Troca para Alto Desempenho para a CPU não reduzir a frequência.", risk: "safe", evidence: "proven", state: "applied", managed: true }),
    base({ id: "gamedvr.disable", category: "graficos", title: "Desativar gravação em segundo plano", description: "Desliga a captura automática do Game Bar.", risk: "safe", evidence: "proven" }),
    base({ id: "graphics.gpu_preference", category: "graficos", title: "Forçar a GPU dedicada para o jogo", description: "Preferência de alto desempenho para o executável do jogo.", risk: "safe", evidence: "proven" }),
    base({ id: "input.mouse_no_accel", category: "entrada", title: "Desativar aceleração do mouse", description: "Movimento 1:1, mais consistente para mira.", risk: "safe", evidence: "proven" }),
    base({ id: "graphics.hags", category: "graficos", title: "Agendamento de GPU por hardware (HAGS)", description: "O ganho varia; meça antes e depois.", risk: "moderate", evidence: "situational", requires_reboot: true }),
    base({ id: "latency.system_responsiveness", category: "latencia", title: "Reduzir System Responsiveness", description: "Prioriza o jogo sobre tarefas em segundo plano.", risk: "moderate", evidence: "situational", requires_reboot: true }),
  ];
}

const mockReport: Report = {
  score: 82,
  elevated: true,
  mem_total_gb: 16,
  free_disk_gb: 120,
  power_ok: true,
  issues: [
    { id: "gamedvr", severity: "warning", title: "Gravação em segundo plano ligada", detail: "A captura do Game Bar consome CPU/GPU durante o jogo.", fix: "gamedvr.disable" },
    { id: "hags", severity: "info", title: "HAGS desligado", detail: "Pode ajudar em algumas máquinas. Meça antes e depois.", fix: "graphics.hags" },
  ],
  passed: ["Plano de energia de desempenho ativo", "Memória RAM suficiente", "Espaço em disco suficiente"],
};

// ---- API pública ----
export async function listGames(): Promise<GameProfile[]> {
  return isTauri ? call("list_games") : mockGames;
}
export async function listTweaks(gameId: string): Promise<TweakView[]> {
  return isTauri ? call("list_tweaks", { gameId }) : mockTweaks();
}
export async function diagnose(): Promise<Report> {
  return isTauri ? call("diagnose") : mockReport;
}
export async function applyTweaks(gameId: string, ids: string[]): Promise<BatchResult> {
  return isTauri ? call("apply_tweaks", { gameId, ids }) : { results: ids.map((id) => ({ tweak_id: id, ok: true, skipped: false, message: "aplicado" })), needs_reboot: false };
}
export async function revertTweaks(ids: string[]): Promise<BatchResult> {
  return isTauri ? call("revert_tweaks", { ids }) : { results: [], needs_reboot: false };
}
export async function revertAll(): Promise<BatchResult> {
  return isTauri ? call("revert_all") : { results: [], needs_reboot: false };
}
export async function history(): Promise<Journal> {
  return isTauri ? call("history") : { entries: [{ id: 1, tweak_id: "power.high_performance", title: "Plano de energia de alto desempenho", applied_at: Date.now() - 3600_000, reverted_at: null }] };
}
export async function isElevated(): Promise<boolean> {
  return isTauri ? call("is_elevated") : true;
}
export async function relaunchAsAdmin(): Promise<void> {
  if (isTauri) await call("relaunch_as_admin");
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
