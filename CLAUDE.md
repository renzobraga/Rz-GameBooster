# Rz GameBooster — guia para agentes

Otimizador de jogos para Windows. Só mexe em **configurações do Windows**
(registro, plano de energia), nunca no processo/memória/arquivos dos jogos —
regra de ouro contra anti-cheat (VAC/BattlEye/Vanguard). Tudo é reversível.

## Mapa do repositório

- `app/` — **app desktop (Tauri 2)**.
  - `app/src/` — frontend React + TypeScript + Tailwind.
    - `App.tsx` — UI e estado. Tela inicial = logo + botão "Entrar" (sem jogos).
      Menu lateral (sidebar): Painel (specs + diagnóstico), Otimizações, Limpeza
      (`Limpeza`), Restauração (ex-Histórico), Apps (`Apps` — gerenciador de
      inicialização), Configurações (idioma + sobre).
      Sem seleção de jogo: tweaks são todos `games:["*"]`. O FPS (lib/fps.ts) e a
      galeria `ElasticGallery` ficaram de lado (não usados).
    - `lib/api.ts` — ponte com o backend Rust (`invoke`); mocks no navegador.
    - `lib/fps.ts` — estimativa de FPS a partir da GPU/RAM (`GPU_TABLE`, `estimateFps`).
    - `lib/i18n.tsx` — textos PT/EN.
    - `components/` — `ElasticGallery` (tela de jogos), `Gauge`, `Logo`, `ui/toggle`.
  - `app/src-tauri/` — backend Rust.
    - `src/commands.rs` — comandos expostos ao frontend.
    - `src/engine.rs` — aplica/reverte tweaks (`apply`/`disable`), orquestra catálogo.
    - `src/catalog.rs` — carrega perfis de jogo e tweaks (`catalog/`).
    - `src/clean.rs` — limpeza (temp, prefetch, cache do WU, miniaturas, lixeira).
    - `src/startup.rs` — apps de inicialização (Run + pastas Startup; liga/desliga
      via StartupApproved, como o Gerenciador de Tarefas).
    - `src/journal.rs` — histórico reversível (`RegValue`, `Entry`).
    - `src/detect.rs` — localiza o executável do jogo (Steam etc.).
    - `src/platform/win.rs` — registro, energia, GPU, elevação, reboot (Windows).
    - `src/diagnostics.rs` — diagnóstico do PC. `build.rs` — VAC guard (APIs proibidas).
    - `tauri.conf.json` — janela, bundle/NSIS, updater.
- `site/` — **site de divulgação (Next.js)**: `app/` (páginas), `components/`, `lib/i18n`.
- `catalog/` — dados JSON: `games/*.json`, `tweaks.json`, `pros/*.json`.
- `.github/workflows/` — `ci.yml`, `release.yml` (build/assinatura/VirusTotal).

## Economia de tokens: consulte o grafo antes de ler arquivos

Este projeto é mapeado com **graphify** (skill `graphify`, em `.claude/skills/`).
O mapa persistente fica em `graphify-out/graph.json`.

Para QUALQUER pergunta sobre o código (onde está X, o que chama Y, como flui Z),
**consulte o grafo primeiro** em vez de varrer arquivos:

```bash
graphify query "sua pergunta"            # traversal BFS, contexto amplo
graphify query "sua pergunta" --budget 1500
graphify path "AnteA" "AnteB"            # caminho mais curto entre dois símbolos
graphify explain "estimateFps"           # explicação de um nó
```

A resposta traz o símbolo e o `source_location` (ex.: `app/src/lib/fps.ts:L139`),
então dá para pular direto ao ponto certo sem ler o arquivo inteiro.

Após mudar o código, atualize o mapa de forma incremental:

```bash
graphify . --update
```
