# Rz GameBooster

Otimizador de Windows para jogos — **gratuito, open source e totalmente reversível**.
Não injeta no jogo, não lê memória de processo e não toca em arquivos do jogo: só
mexe em configurações do Windows, e tudo pode ser desfeito pelo histórico.

Jogos suportados hoje: **Counter-Strike 2, GTA V e Valorant**. Adicionar um jogo novo
é só escrever um perfil JSON em `catalog/games/`.

> Não afiliado à Valve, Rockstar ou Riot.

## Monorepo

| Pasta | O que é | Stack |
|---|---|---|
| `app/` | O aplicativo de desktop (o `.exe`) | Tauri 2 · Rust · React · TypeScript · Tailwind |
| `site/` | Site do produto (landing + download) | Next.js (deploy na Vercel) |
| `catalog/` | Perfis de jogo e catálogo de tweaks (dados) | JSON |
| `.github/workflows/` | CI (compila no Windows) e release com auto-update | GitHub Actions |

## Segurança (regra de ouro)

O app só pode alterar **configurações do Windows** (registro, plano de energia,
preferência de GPU) e **arquivos de config do próprio usuário**. É **proibido**
tocar no processo, memória ou binários do jogo, injetar código, fazer overlay ou
sugerir `-allow_third_party_software`. Um *guard* em `app/src-tauri/build.rs` falha
a compilação se alguma API ou dependência proibida aparecer.

Cada tweak grava o valor anterior num diário (`%LOCALAPPDATA%\RzGameBooster\journal.json`),
então toda mudança é reversível.

## Desenvolvimento

Requisitos: Node.js 22 LTS, Rust (toolchain MSVC) e Visual Studio Build Tools (C++).

```bash
# App (desktop)
cd app
npm install
npm run dev        # só a UI, no navegador (dados de exemplo)
npm run tauri dev  # app completo (Windows)
npm run tauri build

# Site
cd site
npm install
npm run dev
```

## Release e auto-update

Depois da 1.0, cada versão é publicada via GitHub Actions (`Publicar versão`), que
compila, assina os artefatos de update, gera o `latest.json` e cria o release. O app
se atualiza sozinho a partir do GitHub.

Segredos necessários no repositório: `TAURI_SIGNING_PRIVATE_KEY` e
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (a chave pública já está em `tauri.conf.json`).

## Licença

[GPL-3.0](LICENSE).
