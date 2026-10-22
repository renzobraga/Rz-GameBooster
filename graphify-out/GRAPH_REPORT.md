# Graph Report - Rz-GameBooster  (2026-10-22)

## Corpus Check
- 62 files · ~189,441 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 4, .css 2, .icns 1)

## Summary
- 527 nodes · 911 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- useT()
- package.json
- engine.rs
- package.json
- commands.rs
- tauri.conf.json
- win.rs
- journal.rs
- other.rs
- FaqSection.tsx
- compilerOptions
- compilerOptions
- build.rs
- i18n.tsx
- fps.ts
- RegValue
- default.json
- GUID
- guid_to_string()
- reg_sz()
- postcss.config.mjs
- rz-gamebooster

## God Nodes (most connected - your core abstractions)
1. `useT()` - 30 edges
2. `App()` - 25 edges
3. `compilerOptions` - 17 edges
4. `compilerOptions` - 16 edges
5. `RegValue` - 15 edges
6. `call()` - 15 edges
7. `useT()` - 13 edges
8. `Tweak` - 11 edges
9. `next` - 11 edges
10. `Action` - 10 edges

## Surprising Connections (you probably didn't know these)
- `list_games()` --calls--> `load_games()`  [INFERRED]
  app/src-tauri/src/commands.rs → app/src-tauri/src/catalog.rs
- `ctx_for()` --calls--> `find_executable()`  [INFERRED]
  app/src-tauri/src/engine.rs → app/src-tauri/src/detect.rs
- `apply()` --calls--> `load_catalog()`  [INFERRED]
  app/src-tauri/src/engine.rs → app/src-tauri/src/catalog.rs
- `disable()` --calls--> `load_catalog()`  [INFERRED]
  app/src-tauri/src/engine.rs → app/src-tauri/src/catalog.rs
- `list()` --calls--> `load_catalog()`  [INFERRED]
  app/src-tauri/src/engine.rs → app/src-tauri/src/catalog.rs

## Import Cycles
- None detected.

## Communities (25 total, 5 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.07
Nodes (60): App(), Diagnostico(), Historico(), isBatch(), Otimizacoes(), Painel(), RebootModal(), RiskBadge() (+52 more)

### Community 1 - "useT()"
Cohesion: 0.08
Nodes (38): next, Page(), Page(), Page(), ANTICHEAT, Page(), POSTER, Page() (+30 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (47): dependencies, clsx, @fontsource/oxanium, lucide-react, react, react-dom, tailwind-merge, @tauri-apps/api (+39 more)

### Community 3 - "engine.rs"
Cohesion: 0.10
Nodes (37): Action, GpuPreference, PowerPlan, Registry, Catalog, GameProfile, load_catalog(), load_games() (+29 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (37): @radix-ui/react-accordion, @tailwindcss/postcss, @types/node, dependencies, class-variance-authority, clsx, lucide-react, next (+29 more)

### Community 5 - "commands.rs"
Cohesion: 0.11
Nodes (17): apply_tweaks(), diagnose(), disable_all(), disable_tweaks(), GB, history(), list_games(), list_tweaks() (+9 more)

### Community 6 - "tauri.conf.json"
Cohesion: 0.07
Nodes (26): app, security, windows, build, beforeBuildCommand, beforeDevCommand, devUrl, frontendDist (+18 more)

### Community 7 - "win.rs"
Cohesion: 0.10
Nodes (7): disk_total_free_bytes(), free_disk_bytes(), gpu_name(), gpu_rank(), is_real_gpu(), relaunch_as_admin(), wide()

### Community 8 - "journal.rs"
Cohesion: 0.15
Nodes (11): expand_env(), extract_quoted(), find_executable(), probe(), steam_libraries(), Entry, Journal, journal_path() (+3 more)

### Community 10 - "FaqSection.tsx"
Cohesion: 0.20
Nodes (11): class-variance-authority, @radix-ui/react-slot, Page(), FaqSection(), AccordionContent, AccordionItem, AccordionTrigger, Button (+3 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "build.rs"
Cohesion: 0.18
Nodes (15): ALLOWED_ACTION_TYPES, APP_MANIFEST, build_tauri(), collect(), contains_word(), files_with_ext(), FORBIDDEN_APIS, FORBIDDEN_CRATE_PREFIXES (+7 more)

### Community 14 - "i18n.tsx"
Cohesion: 0.15
Nodes (13): Ctx, Dict, DICTS, EN, FlagBR(), FlagUS(), initialLang(), Lang (+5 more)

### Community 15 - "fps.ts"
Cohesion: 0.27
Nodes (10): estimateFps(), fallbackScore(), FpsEstimate, FpsTier, GAME_FACTOR, GPU_TABLE, gpuScore(), ramFactor() (+2 more)

### Community 16 - "RegValue"
Cohesion: 0.22
Nodes (10): RegValue, Dword, Sz, reg_read(), reg_write(), hkey(), raw_to_regvalue(), reg_delete() (+2 more)

### Community 17 - "default.json"
Cohesion: 0.33
Nodes (5): description, identifier, permissions, $schema, windows

### Community 18 - "GUID"
Cohesion: 0.33
Nodes (5): BALANCED, HIGH_PERF, power_set(), string_to_guid(), ULTIMATE_PERF

### Community 19 - "guid_to_string()"
Cohesion: 0.40
Nodes (5): balanced_guid(), guid_to_string(), high_perf_guid(), is_performance_plan(), power_active()

### Community 20 - "reg_sz()"
Cohesion: 0.67
Nodes (3): cpu_name(), os_name(), reg_sz()

## Knowledge Gaps
- **30 isolated node(s):** `@tauri-apps/plugin-opener`, `clsx`, `lucide-react`, `react`, `react-dom` (+25 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 240 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@fontsource/oxanium` connect `i18n.tsx` to `package.json`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `@tauri-apps/plugin-opener`, `clsx`, `lucide-react` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06606990622335891 - nodes in this community are weakly interconnected._
- **Why does `RegValue` connect `RegValue` to `engine.rs`, `commands.rs`, `win.rs`, `journal.rs`, `other.rs`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `useT()` be split into smaller, more focused modules?**
  _Cohesion score 0.08306010928961749 - nodes in this community are weakly interconnected._
- **Why does `next` connect `useT()` to `package.json`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04251700680272109 - nodes in this community are weakly interconnected._