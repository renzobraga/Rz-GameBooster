"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "pt" | "en";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "pt", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "pt" || saved === "en") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return dict[lang];
}

export const dict = {
  pt: {
    nav: { how: "Como funciona", games: "Jogos", security: "Segurança", faq: "FAQ", download: "Baixar" },
    cta: { download: "Baixar para Windows", viewCode: "Ver o código" },
    trustLine: "Reversível · Não injeta no jogo · SHA256 verificável",
    notAffiliated: "Não afiliado à Valve, Rockstar ou Riot",
    home: {
      heroTitle: "Mais FPS no seu jogo. E você desfaz tudo quando quiser.",
      heroSub: "Otimizador de Windows para seus jogos. Grátis e open source.",
      demoTitle: "Veja a nota do seu PC",
      demoSub: "O app faz um raio-X em segundos e corrige o que atrapalha — com um clique.",
      demoBtn: "Analisar (demo)",
      demoReset: "Resetar",
      showcaseTitle: "É assim que funciona",
      showcaseSub: "Escolha o jogo, veja o diagnóstico e aplique os ajustes. Tudo reversível.",
      gamesTitle: "Feito para os seus jogos",
      gamesSub: "Suporte por jogo — e é fácil adicionar novos.",
      stepsTitle: "Três passos",
      safetyTitle: "Sem susto: nada de ban, nada de vírus",
      safetySub: "Só mexe em configurações do Windows e nos seus arquivos de config. Nunca no processo, memória ou arquivos do jogo. Open source pra você conferir.",
      safetyCta: "Por que é seguro",
    },
    showcase: { gallery: "Escolha o jogo", diagnostic: "Diagnóstico", optimizations: "Otimizações", history: "Histórico", about: "Sobre" },
    demo: {
      scoreLabel: "Nota do seu PC",
      fixAll: "Corrigir tudo",
      fixed: "Corrigido",
      issues: [
        { t: "Gravação em segundo plano ligada", d: "O Game Bar consome CPU/GPU no jogo." },
        { t: "Plano de energia não é de desempenho", d: "A CPU reduz a frequência." },
        { t: "HAGS desligado", d: "Pode ajudar em algumas máquinas." },
      ],
    },
    steps: [
      { t: "Diagnóstico", d: "Um raio-X do seu PC em segundos, com nota de 0 a 100." },
      { t: "Otimização", d: "Ajustes seguros do Windows aplicados com um clique." },
      { t: "Reversível", d: "Desfaça qualquer mudança pelo histórico, quando quiser." },
    ],
    games: {
      cs2: { name: "Counter-Strike 2", genre: "FPS tático", blurb: "VAC é tolerante a ajustes de Windows. Mexemos só no que é seguro." },
      "gta-v": { name: "GTA V / FiveM", genre: "Mundo aberto", blurb: "Serve para GTA V e FiveM. GTA Online é pesado de CPU; otimizamos o SO." },
      valorant: { name: "Valorant", genre: "FPS competitivo", blurb: "Vanguard é rígido (kernel). Por isso só tocamos no Windows, nunca no jogo." },
    },
    footer: {
      product: "Produto",
      trust: "Confiança",
      project: "Projeto",
      how: "Como funciona",
      games: "Jogos",
      changelog: "Changelog",
      security: "Segurança",
      faq: "FAQ",
      privacy: "Privacidade",
      license: "Licença GPL-3.0",
      github: "GitHub",
      rights: "Grátis e open source.",
    },
    pages: {
      how: {
        title: "Como funciona",
        sub: "Pouca cerimônia: diagnostica, otimiza e deixa você desfazer.",
        blocks: [
          { t: "Diagnóstico (Raio-X)", d: "Lê configurações do Windows e dá uma nota de 0 a 100, com os problemas que mais pesam no FPS." },
          { t: "Ajustes seguros", d: "Energia, agendamento de GPU, Game DVR, latência, preferência de GPU por jogo — tudo em configurações do Windows." },
          { t: "Histórico reversível", d: "Cada mudança grava o valor anterior. Reverte um ou reverte tudo, quando quiser." },
          { t: "Atualiza sozinho", d: "Depois de instalado, o app se atualiza a partir do GitHub." },
        ],
      },
      gamesIndex: { title: "Jogos suportados", sub: "Um perfil por jogo. Adicionar um novo é só um arquivo." },
      game: { safeTweaks: "Ajustes seguros", anticheat: "Anti-cheat", optimize: "Baixar e otimizar" },
      security: {
        title: "Segurança: nada de ban, nada de vírus",
        sub: "A regra de ouro do projeto, em bom português.",
        points: [
          { t: "Não toca no jogo", d: "Nunca lemos memória, injetamos código ou mexemos em arquivos do jogo. Só configurações do Windows e seus arquivos de config." },
          { t: "Reversível de verdade", d: "Tudo que o app muda é gravado e pode ser desfeito pelo histórico." },
          { t: "Open source", d: "O código é público (GPL-3.0). Você — ou qualquer um — pode auditar." },
          { t: "Por anti-cheat", d: "VAC (CS2) é tolerante a ajustes de SO. Vanguard (Valorant) e BattlEye (GTA) são kernel e mais rígidos — por isso somos conservadores e nunca chegamos perto do jogo." },
        ],
        virusTitle: "E o aviso de 'vírus' do Windows?",
        virus: "É o SmartScreen avisando sobre um programa novo/sem assinatura — não é um vírus. Cada versão traz o hash SHA256 e um link do VirusTotal para você conferir.",
      },
      faq: {
        title: "Perguntas frequentes",
        items: [
          { q: "Vou tomar ban?", a: "Não mexemos no processo, memória ou arquivos do jogo — só em configurações do Windows. Esse é o tipo de ajuste que anti-cheats toleram." },
          { q: "É vírus?", a: "Não. O aviso do Windows (SmartScreen) aparece por ser um app novo sem assinatura. Cada release tem hash SHA256 e link do VirusTotal." },
          { q: "Funciona offline?", a: "Sim. A única conexão automática é a checagem de atualização no GitHub." },
          { q: "Como atualiza?", a: "Sozinho: ao abrir, o app vê se há versão nova e oferece atualizar com um clique." },
          { q: "Preciso ser administrador?", a: "Sim, para aplicar alguns ajustes. O app pede a permissão ao abrir." },
          { q: "Posso desfazer?", a: "Sim. Tudo fica no histórico e pode ser revertido a qualquer momento." },
        ],
      },
      download: {
        title: "Baixar o Rz GameBooster",
        sub: "Windows 10/11 (64-bit). Grátis e open source.",
        btn: "Baixar a última versão",
        req: "Requisitos",
        reqBody: "Windows 10 ou 11, 64-bit. Pede permissão de administrador ao abrir.",
        integrity: "Integridade",
        integrityBody: "Cada versão traz o hash SHA256 do instalador e um link do VirusTotal na página do release.",
        smartscreen: "Aviso do Windows",
        smartscreenBody: "O SmartScreen pode avisar por ser um app novo sem assinatura. Clique em 'Mais informações → Executar assim mesmo'. Não é um vírus.",
      },
      changelog: { title: "Changelog", sub: "As versões saem pelo GitHub Releases.", cta: "Ver todas as versões no GitHub" },
      privacy: {
        title: "Privacidade",
        sub: "Curto e grosso.",
        body: "O app não coleta dados pessoais. Não há telemetria. A única conexão automática é a checagem de atualização no GitHub. Suas configurações e o histórico ficam só no seu PC.",
      },
    },
  },
  en: {
    nav: { how: "How it works", games: "Games", security: "Security", faq: "FAQ", download: "Download" },
    cta: { download: "Download for Windows", viewCode: "View the code" },
    trustLine: "Reversible · No game injection · SHA256 verifiable",
    notAffiliated: "Not affiliated with Valve, Rockstar or Riot",
    home: {
      heroTitle: "More FPS in your game. And you can undo it all, anytime.",
      heroSub: "A Windows optimizer for your games. Free and open source.",
      demoTitle: "See your PC's score",
      demoSub: "The app runs an X-ray in seconds and fixes what hurts — in one click.",
      demoBtn: "Analyze (demo)",
      demoReset: "Reset",
      showcaseTitle: "Here's how it works",
      showcaseSub: "Pick the game, read the diagnosis, apply the tweaks. All reversible.",
      gamesTitle: "Built for your games",
      gamesSub: "Per-game support — and easy to add new ones.",
      stepsTitle: "Three steps",
      safetyTitle: "No scares: no bans, no viruses",
      safetySub: "It only changes Windows settings and your own config files. Never the game's process, memory or files. Open source so you can check.",
      safetyCta: "Why it's safe",
    },
    showcase: { gallery: "Pick the game", diagnostic: "Diagnosis", optimizations: "Optimizations", history: "History", about: "About" },
    demo: {
      scoreLabel: "Your PC's score",
      fixAll: "Fix everything",
      fixed: "Fixed",
      issues: [
        { t: "Background recording on", d: "Game Bar eats CPU/GPU in-game." },
        { t: "Power plan isn't performance", d: "The CPU throttles down." },
        { t: "HAGS is off", d: "May help on some machines." },
      ],
    },
    steps: [
      { t: "Diagnosis", d: "An X-ray of your PC in seconds, scored 0 to 100." },
      { t: "Optimization", d: "Safe Windows tweaks applied in one click." },
      { t: "Reversible", d: "Undo any change from the history, anytime." },
    ],
    games: {
      cs2: { name: "Counter-Strike 2", genre: "Tactical FPS", blurb: "VAC tolerates OS tweaks. We only touch what's safe." },
      "gta-v": { name: "GTA V / FiveM", genre: "Open world", blurb: "Covers GTA V and FiveM. GTA Online is CPU-heavy; we tune the OS." },
      valorant: { name: "Valorant", genre: "Competitive FPS", blurb: "Vanguard is strict (kernel). So we only touch Windows, never the game." },
    },
    footer: {
      product: "Product",
      trust: "Trust",
      project: "Project",
      how: "How it works",
      games: "Games",
      changelog: "Changelog",
      security: "Security",
      faq: "FAQ",
      privacy: "Privacy",
      license: "GPL-3.0 License",
      github: "GitHub",
      rights: "Free and open source.",
    },
    pages: {
      how: {
        title: "How it works",
        sub: "Little ceremony: it diagnoses, optimizes, and lets you undo.",
        blocks: [
          { t: "Diagnosis (X-ray)", d: "Reads Windows settings and scores 0 to 100, listing what hurts FPS most." },
          { t: "Safe tweaks", d: "Power, GPU scheduling, Game DVR, latency, per-game GPU preference — all in Windows settings." },
          { t: "Reversible history", d: "Each change records the previous value. Undo one or undo all, anytime." },
          { t: "Self-updating", d: "Once installed, the app updates itself from GitHub." },
        ],
      },
      gamesIndex: { title: "Supported games", sub: "One profile per game. Adding a new one is just a file." },
      game: { safeTweaks: "Safe tweaks", anticheat: "Anti-cheat", optimize: "Download and optimize" },
      security: {
        title: "Security: no bans, no viruses",
        sub: "The project's golden rule, in plain words.",
        points: [
          { t: "Never touches the game", d: "We never read memory, inject code or change game files. Only Windows settings and your config files." },
          { t: "Truly reversible", d: "Everything the app changes is recorded and can be undone from the history." },
          { t: "Open source", d: "The code is public (GPL-3.0). You — or anyone — can audit it." },
          { t: "Per anti-cheat", d: "VAC (CS2) tolerates OS tweaks. Vanguard (Valorant) and BattlEye (GTA) are kernel-level and stricter — so we stay conservative and never go near the game." },
        ],
        virusTitle: "What about the Windows 'virus' warning?",
        virus: "That's SmartScreen flagging a new/unsigned program — not a virus. Every version ships a SHA256 hash and a VirusTotal link so you can verify.",
      },
      faq: {
        title: "Frequently asked questions",
        items: [
          { q: "Will I get banned?", a: "We don't touch the game's process, memory or files — only Windows settings. That's the kind of tweak anti-cheats tolerate." },
          { q: "Is it a virus?", a: "No. The Windows (SmartScreen) warning shows because it's a new, unsigned app. Every release has a SHA256 hash and VirusTotal link." },
          { q: "Does it work offline?", a: "Yes. The only automatic connection is the update check on GitHub." },
          { q: "How does it update?", a: "On its own: when opened, the app checks for a new version and offers a one-click update." },
          { q: "Do I need admin?", a: "Yes, to apply some tweaks. The app asks for permission on launch." },
          { q: "Can I undo?", a: "Yes. Everything is in the history and can be reverted anytime." },
        ],
      },
      download: {
        title: "Download Rz GameBooster",
        sub: "Windows 10/11 (64-bit). Free and open source.",
        btn: "Download the latest version",
        req: "Requirements",
        reqBody: "Windows 10 or 11, 64-bit. Asks for administrator permission on launch.",
        integrity: "Integrity",
        integrityBody: "Every version ships the installer's SHA256 hash and a VirusTotal link on the release page.",
        smartscreen: "Windows warning",
        smartscreenBody: "SmartScreen may warn because it's a new, unsigned app. Click 'More info → Run anyway'. It's not a virus.",
      },
      changelog: { title: "Changelog", sub: "Versions ship via GitHub Releases.", cta: "See all versions on GitHub" },
      privacy: {
        title: "Privacy",
        sub: "Short and blunt.",
        body: "The app collects no personal data. There is no telemetry. The only automatic connection is the update check on GitHub. Your settings and history stay on your PC only.",
      },
    },
  },
} as const;
