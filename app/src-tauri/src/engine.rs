//! Motor de otimização: detecta, aplica (gravando o anterior no diário) e
//! reverte. Idempotente e com rollback por tweak se uma ação falhar no meio.

use anyhow::{anyhow, Result};
use serde::Serialize;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::catalog::{load_catalog, load_games, Action, GameProfile, Tweak};
use crate::detect::find_executable;
use crate::journal::{self, Change, Journal, RegValue};
use crate::platform;

// Serializa aplicação/reversão: uma operação por vez.
static LOCK: Mutex<()> = Mutex::new(());

const GPU_PREF_PATH: &str = "Software\\Microsoft\\DirectX\\UserGpuPreferences";
const GPU_PREF_VALUE: &str = "GpuPreference=2;";

#[derive(Serialize)]
pub struct TweakView {
    #[serde(flatten)]
    pub tweak: Tweak,
    pub state: String,
    pub managed: bool,
    pub supported: bool,
    pub unsupported_reason: Option<String>,
    /// Faz sentido para ESTE PC? (entra em "Aplicar recomendados").
    pub recommended: bool,
    /// Nota quando o ajuste nao se aplica bem a este PC (ex.: reducao de
    /// efeitos num PC ja folgado).
    pub fit_note: Option<String>,
}

#[derive(Serialize)]
pub struct OpResult {
    pub tweak_id: String,
    pub ok: bool,
    pub skipped: bool,
    pub message: String,
}

#[derive(Serialize)]
pub struct BatchResult {
    pub results: Vec<OpResult>,
    pub needs_reboot: bool,
}

struct Ctx {
    game: GameProfile,
    exe: Option<PathBuf>,
}

fn ctx_for(game_id: &str) -> Result<Ctx> {
    let game = load_games()
        .into_iter()
        .find(|g| g.id == game_id)
        .ok_or_else(|| anyhow!("jogo desconhecido: {game_id}"))?;
    let exe = find_executable(&game);
    Ok(Ctx { game, exe })
}

fn value_to_reg(v: &serde_json::Value) -> Result<RegValue> {
    if let Some(n) = v.as_u64() {
        Ok(RegValue::Dword(n as u32))
    } else if let Some(s) = v.as_str() {
        Ok(RegValue::Sz(s.to_string()))
    } else {
        Err(anyhow!("valor de registro não suportado"))
    }
}

fn exe_str(ctx: &Ctx) -> Result<String> {
    ctx.exe
        .as_ref()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| anyhow!("jogo não encontrado no sistema"))
}

fn needs_exe(tweak: &Tweak) -> bool {
    tweak.actions.iter().any(|a| matches!(a, Action::GpuPreference))
}

fn action_applied(action: &Action, ctx: &Ctx) -> Result<bool> {
    match action {
        Action::Registry { hive, path, name, value } => {
            let want = value_to_reg(value)?;
            let got = platform::reg_read(hive, path, name)?;
            Ok(got.as_ref() == Some(&want))
        }
        Action::PowerPlan { .. } => {
            let active = platform::power_active()?;
            Ok(platform::is_performance_plan(&active))
        }
        Action::GpuPreference => {
            let exe = exe_str(ctx)?;
            let got = platform::reg_read("HKCU", GPU_PREF_PATH, &exe)?;
            match got {
                Some(RegValue::Sz(s)) => Ok(s.contains("GpuPreference=2")),
                _ => Ok(false),
            }
        }
    }
}

fn detect_state(tweak: &Tweak, ctx: &Ctx) -> String {
    let total = tweak.actions.len();
    let mut applied = 0usize;
    for a in &tweak.actions {
        match action_applied(a, ctx) {
            Ok(true) => applied += 1,
            Ok(false) => {}
            Err(_) => return "unknown".into(),
        }
    }
    if applied == 0 {
        "not_applied".into()
    } else if applied == total {
        "applied".into()
    } else {
        "partial".into()
    }
}

fn apply_action(action: &Action, ctx: &Ctx) -> Result<Change> {
    match action {
        Action::Registry { hive, path, name, value } => {
            let want = value_to_reg(value)?;
            let previous = platform::reg_read(hive, path, name)?;
            platform::reg_write(hive, path, name, &want)?;
            Ok(Change::Registry {
                hive: hive.clone(),
                path: path.clone(),
                name: name.clone(),
                previous,
                applied: Some(want),
            })
        }
        Action::PowerPlan { .. } => {
            let previous = platform::power_active()?;
            let applied = platform::high_perf_guid();
            platform::power_set(&applied)?;
            Ok(Change::PowerPlan { previous, applied })
        }
        Action::GpuPreference => {
            let exe = exe_str(ctx)?;
            let previous = platform::reg_read("HKCU", GPU_PREF_PATH, &exe)?;
            let want = RegValue::Sz(GPU_PREF_VALUE.to_string());
            platform::reg_write("HKCU", GPU_PREF_PATH, &exe, &want)?;
            Ok(Change::Registry {
                hive: "HKCU".into(),
                path: GPU_PREF_PATH.into(),
                name: exe,
                previous,
                applied: Some(want),
            })
        }
    }
}

fn undo_change(change: &Change) -> Result<()> {
    match change {
        Change::Registry { hive, path, name, previous, .. } => match previous {
            Some(v) => platform::reg_write(hive, path, name, v),
            None => platform::reg_delete(hive, path, name),
        },
        Change::PowerPlan { previous, .. } => platform::power_set(previous),
    }
}

/// Troca titulo/descricao/how_to_check pela traducao do catalogo quando houver
/// (lang != "pt"). O catalogo tras os blocos i18n (en, es).
fn apply_lang(tweak: &mut Tweak, lang: &str) {
    if lang == "pt" {
        return;
    }
    let Some(obj) = tweak.i18n.get(lang) else { return };
    if let Some(s) = obj.get("title").and_then(|v| v.as_str()) {
        tweak.title = s.to_string();
    }
    if let Some(s) = obj.get("description").and_then(|v| v.as_str()) {
        tweak.description = s.to_string();
    }
    if let Some(s) = obj.get("how_to_check").and_then(|v| v.as_str()) {
        tweak.how_to_check = s.to_string();
    }
}

/// Ajuste voltado so a PC fraco (reducao de qualidade/recursos): tem o preset
/// "pc_fraco" e NAO esta nos presets de uso geral (seguro/competitivo).
fn is_weak_pc_only(tweak: &Tweak) -> bool {
    tweak.presets.iter().any(|p| p == "pc_fraco")
        && !tweak.presets.iter().any(|p| p == "seguro" || p == "competitivo")
}

pub fn list(game_id: &str, lang: &str) -> Result<Vec<TweakView>> {
    let ctx = ctx_for(game_id)?;
    let journal = journal::load();
    let active = journal.active_ids();
    let catalog = load_catalog();

    // PC "folgado": a partir de ~16 GB de RAM nao faz sentido recomendar
    // reducoes de efeitos/recursos. Sem leitura, nao suprime nada.
    let mem_gb = platform::mem_total_bytes().map(|b| b as f64 / 1_073_741_824.0);
    let strong_pc = mem_gb.map(|g| g >= 15.5).unwrap_or(false);
    let en = lang == "en";

    let mut out = Vec::new();
    for mut tweak in catalog.tweaks {
        if !tweak.applies_to(game_id) || ctx.game.excluded_tweaks.contains(&tweak.id) {
            continue;
        }
        apply_lang(&mut tweak, lang);
        let (supported, unsupported_reason) = if needs_exe(&tweak) && ctx.exe.is_none() {
            (false, Some(if en {
                format!("{} not found on this system", ctx.game.name)
            } else {
                format!("{} não encontrado no sistema", ctx.game.name)
            }))
        } else {
            (true, None)
        };
        let managed = active.contains(&tweak.id);
        let state = if !supported {
            "unknown".to_string()
        } else {
            detect_state(&tweak, &ctx)
        };

        // Recomendacao ciente do hardware.
        let weak_only = is_weak_pc_only(&tweak);
        let suppress = weak_only && strong_pc;
        let fit_note = if suppress {
            Some(if en {
                "Your PC has headroom, this reduction isn't needed.".to_string()
            } else {
                "Seu PC já tem folga, esta redução não é necessária.".to_string()
            })
        } else {
            None
        };
        let recommended = supported && !suppress && tweak.risk == "safe" && tweak.evidence == "proven";

        out.push(TweakView {
            tweak,
            state,
            managed,
            supported,
            unsupported_reason,
            recommended,
            fit_note,
        });
    }
    Ok(out)
}

pub fn apply(game_id: &str, ids: &[String]) -> Result<BatchResult> {
    let _guard = LOCK.lock().unwrap();
    let ctx = ctx_for(game_id)?;
    let mut journal = journal::load();
    let catalog = load_catalog();
    let mut results = Vec::new();
    let mut needs_reboot = false;

    for id in ids {
        let Some(tweak) = catalog.tweaks.iter().find(|t| &t.id == id) else {
            results.push(OpResult { tweak_id: id.clone(), ok: false, skipped: false, message: "tweak desconhecido".into() });
            continue;
        };

        if needs_exe(tweak) && ctx.exe.is_none() {
            results.push(OpResult { tweak_id: id.clone(), ok: false, skipped: true, message: "jogo não encontrado".into() });
            continue;
        }
        if journal.active(id).is_some() {
            // Ja esta no diario (o app esta gerenciando): nao duplica a entrada.
            results.push(OpResult { tweak_id: id.clone(), ok: true, skipped: true, message: "já gerenciado".into() });
            continue;
        }
        // Mesmo se o valor ja estiver no alvo, registramos no diario: as acoes
        // de registro sao idempotentes e o usuario ve a acao no historico (e
        // pode reverter ao estado anterior, que gravamos aqui).

        let mut done: Vec<Change> = Vec::new();
        let mut error: Option<String> = None;
        for action in &tweak.actions {
            match apply_action(action, &ctx) {
                Ok(change) => done.push(change),
                Err(e) => {
                    error = Some(e.to_string());
                    break;
                }
            }
        }

        if let Some(msg) = error {
            // Rollback das ações já feitas, em ordem inversa.
            for change in done.iter().rev() {
                let _ = undo_change(change);
            }
            results.push(OpResult { tweak_id: id.clone(), ok: false, skipped: false, message: msg });
            continue;
        }

        journal.push(id, &tweak.title, done);
        if let Err(e) = journal::save(&journal) {
            // Nao engole o erro: o usuario precisa saber se o historico nao gravou.
            results.push(OpResult {
                tweak_id: id.clone(),
                ok: false,
                skipped: false,
                message: format!("aplicado, mas falhou ao salvar o histórico: {e}"),
            });
            continue;
        }
        if tweak.requires_reboot {
            needs_reboot = true;
        }
        results.push(OpResult { tweak_id: id.clone(), ok: true, skipped: false, message: "aplicado".into() });
    }

    Ok(BatchResult { results, needs_reboot })
}

pub fn revert(ids: &[String]) -> Result<BatchResult> {
    let _guard = LOCK.lock().unwrap();
    let mut journal = journal::load();
    let mut results = Vec::new();

    for id in ids {
        let changes: Vec<Change> = match journal.active(id) {
            Some(e) => e.changes.clone(),
            None => {
                results.push(OpResult { tweak_id: id.clone(), ok: true, skipped: true, message: "nada a reverter".into() });
                continue;
            }
        };
        let mut ok = true;
        for change in changes.iter().rev() {
            if let Err(e) = undo_change(change) {
                ok = false;
                results.push(OpResult { tweak_id: id.clone(), ok: false, skipped: false, message: e.to_string() });
                break;
            }
        }
        if ok {
            if let Some(e) = journal.active_mut(id) {
                e.reverted_at = Some(journal::now_ms());
            }
            let _ = journal::save(&journal);
            results.push(OpResult { tweak_id: id.clone(), ok: true, skipped: false, message: "revertido".into() });
        }
    }

    Ok(BatchResult { results, needs_reboot: false })
}

pub fn revert_all() -> Result<BatchResult> {
    let ids = journal::load().active_ids();
    revert(&ids)
}

pub fn history() -> Journal {
    journal::load()
}
