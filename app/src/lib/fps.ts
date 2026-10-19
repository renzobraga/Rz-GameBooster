// Estimativa grosseira de FPS a partir do hardware (placa de video, RAM) e do
// jogo escolhido. NAO e benchmark: e so uma referencia de ordem de grandeza
// para 1080p. O resultado real varia com resolucao, grafico no jogo e drivers.

import type { SystemInfo } from "./api";

// Pontuacao relativa de raster a 1080p. Referencia: GTX 1660 Super = 100.
// Entradas mais especificas vem antes (ex.: "4060 ti" antes de "4060").
const GPU_TABLE: { re: RegExp; score: number }[] = [
  // NVIDIA RTX 40
  { re: /\b(rtx\s*)?4090\b/, score: 420 },
  { re: /\b(rtx\s*)?4080\b/, score: 360 },
  { re: /\b(rtx\s*)?4070\s*ti\b/, score: 300 },
  { re: /\b(rtx\s*)?4070\b/, score: 250 },
  { re: /\b(rtx\s*)?4060\s*ti\b/, score: 185 },
  { re: /\b(rtx\s*)?4060\b/, score: 150 },
  // NVIDIA RTX 30
  { re: /\b(rtx\s*)?3090\b/, score: 320 },
  { re: /\b(rtx\s*)?3080\b/, score: 290 },
  { re: /\b(rtx\s*)?3070\b/, score: 230 },
  { re: /\b(rtx\s*)?3060\s*ti\b/, score: 200 },
  { re: /\b(rtx\s*)?3060\b/, score: 155 },
  { re: /\b(rtx\s*)?3050\b/, score: 110 },
  // NVIDIA RTX 20
  { re: /\b(rtx\s*)?2080\s*ti\b/, score: 235 },
  { re: /\b(rtx\s*)?2080\b/, score: 195 },
  { re: /\b(rtx\s*)?2070\b/, score: 170 },
  { re: /\b(rtx\s*)?2060\b/, score: 140 },
  // NVIDIA GTX 16
  { re: /\b(gtx\s*)?1660\s*(ti|super)\b/, score: 108 },
  { re: /\b(gtx\s*)?1660\b/, score: 92 },
  { re: /\b(gtx\s*)?1650\s*super\b/, score: 80 },
  { re: /\b(gtx\s*)?1650\b/, score: 66 },
  // NVIDIA GTX 10
  { re: /\b(gtx\s*)?1080\s*ti\b/, score: 180 },
  { re: /\b(gtx\s*)?1080\b/, score: 140 },
  { re: /\b(gtx\s*)?1070\s*ti\b/, score: 130 },
  { re: /\b(gtx\s*)?1070\b/, score: 120 },
  { re: /\b(gtx\s*)?1060\b/, score: 82 },
  { re: /\b(gtx\s*)?1050\s*ti\b/, score: 52 },
  { re: /\b(gtx\s*)?1050\b/, score: 42 },
  // AMD Radeon RX
  { re: /\b(rx\s*)?7900\s*(xtx|xt)\b/, score: 400 },
  { re: /\b(rx\s*)?7800\s*xt\b/, score: 285 },
  { re: /\b(rx\s*)?7700\s*xt\b/, score: 235 },
  { re: /\b(rx\s*)?7600\b/, score: 155 },
  { re: /\b(rx\s*)?6800\s*xt\b/, score: 290 },
  { re: /\b(rx\s*)?6700\s*xt\b/, score: 195 },
  { re: /\b(rx\s*)?6600\s*xt\b/, score: 150 },
  { re: /\b(rx\s*)?6600\b/, score: 130 },
  { re: /\b(rx\s*)?5700\s*xt\b/, score: 160 },
  { re: /\b(rx\s*)?5600\s*xt\b/, score: 120 },
  { re: /\b(rx\s*)?580\b/, score: 72 },
  { re: /\b(rx\s*)?570\b/, score: 60 },
  // Graficos integrados (aproximacao).
  { re: /\b(iris\s*xe|iris)\b/, score: 26 },
  { re: /\b(radeon\s*(graphics|vega)|vega\s*\d)\b/, score: 24 },
  { re: /\b(uhd|hd\s*graphics)\b/, score: 14 },
];

// Fator por jogo relativo a referencia (gpuScore=100 ~ FPS a 1080p).
const GAME_FACTOR: Record<string, number> = {
  cs2: 1.8,
  valorant: 3.4,
  gtav: 0.95,
};

export type FpsTier = "elite" | "high" | "smooth" | "playable" | "limited" | "low";

export interface FpsEstimate {
  fps: number | null; // null = sem GPU reconhecida
  tier: FpsTier;
}

function gpuScore(name: string | null | undefined): number | null {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const { re, score } of GPU_TABLE) {
    if (re.test(n)) return score;
  }
  return null;
}

function ramFactor(ramGb: number | null | undefined): number {
  if (ramGb == null) return 0.9;
  if (ramGb >= 16) return 1.0;
  if (ramGb >= 12) return 0.97;
  if (ramGb >= 8) return 0.9;
  if (ramGb >= 6) return 0.78;
  return 0.6;
}

function tierOf(fps: number): FpsTier {
  if (fps >= 240) return "elite";
  if (fps >= 144) return "high";
  if (fps >= 90) return "smooth";
  if (fps >= 60) return "playable";
  if (fps >= 30) return "limited";
  return "low";
}

export function estimateFps(sys: SystemInfo | null, gameId: string): FpsEstimate {
  const score = gpuScore(sys?.gpu);
  if (score == null) return { fps: null, tier: "low" };
  const factor = GAME_FACTOR[gameId] ?? 1.4;
  const raw = score * factor * ramFactor(sys?.ram_gb);
  const fps = Math.max(10, Math.min(400, Math.round(raw / 5) * 5));
  return { fps, tier: tierOf(fps) };
}
