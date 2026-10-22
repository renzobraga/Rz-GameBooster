// i18n do app desktop: PT-BR e EN-US, com troca por bandeira no cabecalho.
// O idioma escolhido persiste em localStorage e e passado ao backend (que ja
// tem traducao por tweak no catalogo) para traduzir tambem diagnostico/ajustes.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "pt" | "en";

interface Dict {
  chooseGame: string;
  changeGame: string;
  update: (v: string) => string;
  tabs: { panel: string; opt: string; cleanup: string; restore: string; apps: string; settings: string };
  nav: { collapse: string; expand: string };
  soon: { badge: string; cleanupTitle: string; cleanupBody: string; appsTitle: string; appsBody: string };
  cfg: { language: string };
  welcome: { enter: string; tagline: string };
  startup: { title: string; subtitle: string; loading: string; empty: string; user: string; system: string };
  clean: {
    title: string;
    subtitle: (when: string) => string;
    never: string;
    run: string;
    running: string;
    dangerous: string;
    selected: (n: number) => string;
    done: (freed: string) => string;
    doneEmpty: string;
    scanning: string;
    nothing: string;
  };
  cleanTasks: Record<string, { title: string; desc: string }>;
  fps: {
    title: string;
    unit: string;
    sub: (game: string) => string;
    note: string;
    gpuUnknown: string;
    tiers: { elite: string; high: string; smooth: string; playable: string; limited: string; low: string };
  };
  diag: { subtitle: string; rescan: string; scanning: string; lastScan: string; allGood: string; fix: string; fixing: string };
  pc: { title: string; cpu: string; gpu: string; ram: string; storage: string; free: string; unknown: string };
  opt: { count: (n: number) => string; applyRec: string; applying: string; apply: string; revert: string; reverting: string; detected: string };
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
  tabs: { panel: "Painel", opt: "Otimizações", cleanup: "Limpeza", restore: "Restauração", apps: "Apps", settings: "Configurações" },
  nav: { collapse: "Recolher", expand: "Expandir" },
  soon: {
    badge: "Em breve",
    cleanupTitle: "Limpeza do sistema",
    cleanupBody: "Em breve: remover arquivos temporários, cache e lixeira com segurança, do seu jeito.",
    appsTitle: "Apps",
    appsBody: "Em breve: gerenciar apps de inicialização e reduzir bloatware que pesa no boot.",
  },
  cfg: { language: "Idioma" },
  welcome: { enter: "Entrar", tagline: "Otimize o Windows para jogar melhor. Reversível e sem tocar nos jogos." },
  startup: {
    title: "Apps de Inicialização",
    subtitle: "Programas que abrem junto com o Windows. Desligue os que não precisa para acelerar o boot.",
    loading: "Carregando…",
    empty: "Nenhum app de inicialização encontrado.",
    user: "Usuário",
    system: "Sistema",
  },
  clean: {
    title: "Limpeza do Sistema",
    subtitle: (when) => `Última limpeza: ${when}`,
    never: "nenhuma ainda",
    run: "Limpar Selecionados",
    running: "Limpando…",
    dangerous: "Perigoso",
    selected: (n) => `${n} ${n === 1 ? "selecionado" : "selecionados"}`,
    done: (freed) => `Limpeza concluída · ${freed} liberados`,
    doneEmpty: "Limpeza concluída",
    scanning: "Verificando…",
    nothing: "Nada para limpar",
  },
  cleanTasks: {
    "clean.temp": { title: "Limpar Arquivos Temporários", desc: "Remover arquivos temporários do sistema e do usuário." },
    "clean.prefetch": { title: "Limpar Arquivos Prefetch", desc: "Excluir arquivos da pasta Prefetch do Windows." },
    "clean.recycle_bin": { title: "Esvaziar Lixeira", desc: "Remover permanentemente arquivos da Lixeira." },
    "clean.windows_update": { title: "Limpar Cache do Windows Update", desc: "Remover arquivos de instalação baixados do Windows Update." },
    "clean.thumbnails": { title: "Limpar Cache de Miniaturas", desc: "Remover imagens em miniatura em cache usadas pelo Explorador de Arquivos." },
  },
  fps: {
    title: "FPS estimado",
    unit: "FPS",
    sub: (game) => `Faixa estimada em 1080p para ${game}, a partir do seu hardware.`,
    note: "É uma estimativa específica deste jogo — cada jogo exige coisas diferentes da placa, então o número muda de um jogo para outro. O resultado real ainda varia com a resolução, os gráficos no jogo e os drivers.",
    gpuUnknown: "Não deu para identificar a placa de vídeo, então não dá para estimar o FPS.",
    tiers: {
      elite: "Competitivo, alto refresh",
      high: "Muito fluido",
      smooth: "Fluido",
      playable: "Jogável",
      limited: "Limitado",
      low: "Abaixo do ideal",
    },
  },
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
  opt: { count: (n) => `${n} ajustes disponíveis`, applyRec: "Aplicar recomendados", applying: "Aplicando…", apply: "Aplicar", revert: "Reverter", reverting: "Revertendo…", detected: "já ativo" },
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
  tabs: { panel: "Dashboard", opt: "Optimizations", cleanup: "Cleanup", restore: "Restore", apps: "Apps", settings: "Settings" },
  nav: { collapse: "Collapse", expand: "Expand" },
  soon: {
    badge: "Coming soon",
    cleanupTitle: "System cleanup",
    cleanupBody: "Coming soon: safely remove temp files, caches and the recycle bin, your way.",
    appsTitle: "Apps",
    appsBody: "Coming soon: manage startup apps and trim bloatware that slows your boot.",
  },
  cfg: { language: "Language" },
  welcome: { enter: "Enter", tagline: "Tune Windows for better gaming. Reversible, and it never touches the games." },
  startup: {
    title: "Startup Apps",
    subtitle: "Programs that launch with Windows. Turn off the ones you don't need to speed up boot.",
    loading: "Loading…",
    empty: "No startup apps found.",
    user: "User",
    system: "System",
  },
  clean: {
    title: "System Cleanup",
    subtitle: (when) => `Last cleanup: ${when}`,
    never: "none yet",
    run: "Clean Selected",
    running: "Cleaning…",
    dangerous: "Dangerous",
    selected: (n) => `${n} selected`,
    done: (freed) => `Cleanup done · ${freed} freed`,
    doneEmpty: "Cleanup done",
    scanning: "Checking…",
    nothing: "Nothing to clean",
  },
  cleanTasks: {
    "clean.temp": { title: "Clear Temporary Files", desc: "Remove system and user temporary files." },
    "clean.prefetch": { title: "Clear Prefetch Files", desc: "Delete files from the Windows Prefetch folder." },
    "clean.recycle_bin": { title: "Empty Recycle Bin", desc: "Permanently remove files from the Recycle Bin." },
    "clean.windows_update": { title: "Clear Windows Update Cache", desc: "Remove installation files downloaded by Windows Update." },
    "clean.thumbnails": { title: "Clear Thumbnail Cache", desc: "Remove cached thumbnail images used by File Explorer." },
  },
  fps: {
    title: "Estimated FPS",
    unit: "FPS",
    sub: (game) => `Estimated range at 1080p for ${game}, based on your hardware.`,
    note: "This is an estimate for this specific game — each game asks different things of the GPU, so the number changes from one game to another. Real results still vary with resolution, in-game graphics and drivers.",
    gpuUnknown: "Could not identify the graphics card, so FPS can't be estimated.",
    tiers: {
      elite: "Competitive, high refresh",
      high: "Very smooth",
      smooth: "Smooth",
      playable: "Playable",
      limited: "Limited",
      low: "Below ideal",
    },
  },
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
  opt: { count: (n) => `${n} tweaks available`, applyRec: "Apply recommended", applying: "Applying…", apply: "Apply", revert: "Revert", reverting: "Reverting…", detected: "already on" },
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
