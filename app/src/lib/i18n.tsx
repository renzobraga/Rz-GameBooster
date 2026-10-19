// i18n do app desktop: PT-BR e EN-US, com troca por bandeira no cabecalho.
// O idioma escolhido persiste em localStorage e e passado ao backend (que ja
// tem traducao por tweak no catalogo) para traduzir tambem diagnostico/ajustes.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "pt" | "en";

interface Dict {
  chooseGame: string;
  changeGame: string;
  update: (v: string) => string;
  tabs: { diag: string; opt: string; hist: string; about: string };
  diag: { subtitle: string; rescan: string; scanning: string; lastScan: string; allGood: string; fix: string; fixing: string };
  pc: { title: string; cpu: string; gpu: string; ram: string; storage: string; free: string; unknown: string };
  opt: { count: (n: number) => string; applyRec: string; applying: string; apply: string; revert: string; reverting: string };
  state: { applied: string; not_applied: string; partial: string; unknown: string };
  risk: { safe: string; moderate: string; proven: string; situational: string; weak: string; reboot: string };
  cat: Record<string, string>;
  hist: { count: (n: number) => string; revertAll: string; reverting: string; empty: string; reverted: string; revert: string };
  about: { devTag: string; updateAvail: (v: string) => string; upToDate: string; anticheat: (ac: string, lvl: string) => string; gpl1: string; gpl2: string; link: string };
  toast: { scan: string; fix: string; apply: string; revert: string; revertAll: string; rec: string; rebootPreview: string };
  modal: { title: string; body: string; later: string; now: string };
  genre: Record<string, string>;
  optimize: string;
  gameNotes: Record<string, string>;
}

const PT: Dict = {
  chooseGame: "Escolha seu jogo",
  changeGame: "Trocar jogo",
  update: (v) => `Atualizar ${v}`,
  tabs: { diag: "Diagnóstico", opt: "Otimizações", hist: "Histórico", about: "Sobre" },
  diag: {
    subtitle: "Nota do seu PC para jogos",
    rescan: "Analisar novamente",
    scanning: "Analisando…",
    lastScan: "Última análise",
    allGood: "Tudo certo. Nenhum problema encontrado.",
    fix: "Corrigir",
    fixing: "Corrigindo…",
  },
  pc: { title: "Seu PC", cpu: "Processador", gpu: "Placa de vídeo", ram: "Memória", storage: "Armazenamento", free: "livres", unknown: "não identificado" },
  opt: { count: (n) => `${n} ajustes disponíveis`, applyRec: "Aplicar recomendados", applying: "Aplicando…", apply: "Aplicar", revert: "Reverter", reverting: "Revertendo…" },
  state: { applied: "Aplicado", not_applied: "Inativo", partial: "Parcial", unknown: "—" },
  risk: { safe: "seguro", moderate: "moderado", proven: "comprovado", situational: "situacional", weak: "fraco", reboot: "requer reinício" },
  cat: { energia: "energia", graficos: "gráficos", entrada: "entrada", rede: "rede", latencia: "latência", segundo_plano: "segundo plano" },
  hist: { count: (n) => `${n} registros`, revertAll: "Reverter tudo", reverting: "Revertendo…", empty: "Nada aplicado ainda.", reverted: "revertido", revert: "Reverter" },
  about: {
    devTag: " (navegador/dev)",
    updateAvail: (v) => `Atualização ${v} disponível.`,
    upToDate: "Você está na versão mais recente.",
    anticheat: (ac, lvl) => `anti-cheat ${ac} (${lvl})`,
    gpl1: "Gratuito e open source (GPL-3.0). Não afiliado à Valve, Rockstar ou Riot.",
    gpl2: "Nunca tocamos no processo, memória ou arquivos dos jogos, apenas configurações do Windows, e tudo é reversível.",
    link: "Código e releases no GitHub",
  },
  toast: {
    scan: "Diagnóstico atualizado",
    fix: "Correção aplicada",
    apply: "Ajuste aplicado",
    revert: "Ajuste revertido",
    revertAll: "Tudo revertido",
    rec: "Recomendados aplicados",
    rebootPreview: "No app instalado, isto reiniciaria o Windows agora.",
  },
  modal: {
    title: "Reinicie para concluir",
    body: "Alguns ajustes só passam a valer depois de reiniciar o Windows. Você pode reiniciar agora ou mais tarde, quando preferir. Nada se perde, a configuração já está salva.",
    later: "Agora não",
    now: "Reiniciar agora",
  },
  genre: { cs2: "FPS tático", gtav: "Mundo aberto", valorant: "FPS competitivo" },
  optimize: "Otimizar",
  gameNotes: {},
};

const EN: Dict = {
  chooseGame: "Choose your game",
  changeGame: "Change game",
  update: (v) => `Update ${v}`,
  tabs: { diag: "Diagnostics", opt: "Optimizations", hist: "History", about: "About" },
  diag: {
    subtitle: "Your PC's gaming score",
    rescan: "Scan again",
    scanning: "Scanning…",
    lastScan: "Last scan",
    allGood: "All good. No issues found.",
    fix: "Fix",
    fixing: "Fixing…",
  },
  pc: { title: "Your PC", cpu: "Processor", gpu: "Graphics card", ram: "Memory", storage: "Storage", free: "free", unknown: "unknown" },
  opt: { count: (n) => `${n} tweaks available`, applyRec: "Apply recommended", applying: "Applying…", apply: "Apply", revert: "Revert", reverting: "Reverting…" },
  state: { applied: "Applied", not_applied: "Inactive", partial: "Partial", unknown: "—" },
  risk: { safe: "safe", moderate: "moderate", proven: "proven", situational: "situational", weak: "weak", reboot: "needs restart" },
  cat: { energia: "power", graficos: "graphics", entrada: "input", rede: "network", latencia: "latency", segundo_plano: "background" },
  hist: { count: (n) => `${n} records`, revertAll: "Revert all", reverting: "Reverting…", empty: "Nothing applied yet.", reverted: "reverted", revert: "Revert" },
  about: {
    devTag: " (browser/dev)",
    updateAvail: (v) => `Update ${v} available.`,
    upToDate: "You are on the latest version.",
    anticheat: (ac, lvl) => `anti-cheat ${ac} (${lvl})`,
    gpl1: "Free and open source (GPL-3.0). Not affiliated with Valve, Rockstar or Riot.",
    gpl2: "We never touch the games' process, memory or files, only Windows settings, and everything is reversible.",
    link: "Code and releases on GitHub",
  },
  toast: {
    scan: "Diagnostics refreshed",
    fix: "Fix applied",
    apply: "Tweak applied",
    revert: "Tweak reverted",
    revertAll: "Everything reverted",
    rec: "Recommended applied",
    rebootPreview: "In the installed app, this would restart Windows now.",
  },
  modal: {
    title: "Restart to finish",
    body: "Some tweaks only take effect after you restart Windows. You can restart now or later, whenever you prefer. Nothing is lost, the configuration is already saved.",
    later: "Not now",
    now: "Restart now",
  },
  genre: { cs2: "Tactical FPS", gtav: "Open world", valorant: "Competitive FPS" },
  optimize: "Optimize",
  gameNotes: {
    cs2: "VAC tolerates Windows tweaks. We never touch the game's process or files.",
    gtav: "GTA Online uses BattlEye (kernel). We only change Windows settings.",
    valorant: "Vanguard runs in the kernel. We only apply Windows tweaks, never near the game.",
  },
};

const DICTS: Record<Lang, Dict> = { pt: PT, en: EN };

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const LangContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("rz-lang");
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* localStorage bloqueado */
  }
  return "pt";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("rz-lang", l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    } catch {
      /* ignore */
    }
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT fora de LanguageProvider");
  return ctx;
}

/* ---------- Bandeiras (SVG inline: confiaveis no Windows, ao contrario de emoji) ---------- */

function FlagBR() {
  return (
    <svg viewBox="0 0 28 20" className="h-3.5 w-5 rounded-[2px]" aria-hidden>
      <rect width="28" height="20" fill="#009b3a" />
      <polygon points="14,2 26,10 14,18 2,10" fill="#fedf00" />
      <circle cx="14" cy="10" r="4.4" fill="#002776" />
    </svg>
  );
}

function FlagUS() {
  return (
    <svg viewBox="0 0 28 20" className="h-3.5 w-5 rounded-[2px]" aria-hidden>
      <rect width="28" height="20" fill="#b22234" />
      <g fill="#fff">
        <rect y="2.86" width="28" height="2.86" />
        <rect y="8.57" width="28" height="2.86" />
        <rect y="14.29" width="28" height="2.86" />
      </g>
      <rect width="12" height="11.43" fill="#3c3b6e" />
    </svg>
  );
}

export function LangToggle() {
  const { lang, setLang } = useT();
  const opt = (l: Lang, flag: React.ReactNode, label: string) => (
    <button
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      title={l === "pt" ? "Português (Brasil)" : "English (US)"}
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        lang === l ? "bg-panel text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {flag}
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-line p-0.5">
      {opt("pt", <FlagBR />, "BR")}
      {opt("en", <FlagUS />, "EN")}
    </div>
  );
}
