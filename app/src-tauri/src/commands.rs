//! Comandos chamados pelo frontend via `invoke`.

use serde::Serialize;

use crate::catalog::{load_games, GameProfile};
use crate::diagnostics::{self, Report};
use crate::engine::{self, BatchResult, TweakView};
use crate::journal::Journal;
use crate::platform;

const GB: f64 = 1_073_741_824.0;

/// Configuracoes do PC de quem abriu o app (leitura, sem alterar nada).
#[derive(Serialize)]
pub struct SystemInfo {
    pub cpu: Option<String>,
    pub gpu: Option<String>,
    pub os: Option<String>,
    pub ram_gb: Option<f64>,
    pub storage_total_gb: Option<f64>,
    pub storage_free_gb: Option<f64>,
}

#[tauri::command]
pub fn list_games() -> Vec<GameProfile> {
    load_games()
}

#[tauri::command]
pub fn list_tweaks(game_id: String, lang: String) -> Result<Vec<TweakView>, String> {
    engine::list(&game_id, &lang).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn diagnose(lang: String) -> Report {
    diagnostics::run(&lang)
}

#[tauri::command]
pub fn system_info() -> SystemInfo {
    let (total, free) = match platform::disk_total_free_bytes("C:\\") {
        Some((t, f)) => (Some(t as f64 / GB), Some(f as f64 / GB)),
        None => (None, None),
    };
    SystemInfo {
        cpu: platform::cpu_name(),
        gpu: platform::gpu_name(),
        os: platform::os_name(),
        ram_gb: platform::mem_total_bytes().map(|b| b as f64 / GB),
        storage_total_gb: total,
        storage_free_gb: free,
    }
}

#[tauri::command]
pub fn apply_tweaks(game_id: String, ids: Vec<String>) -> Result<BatchResult, String> {
    engine::apply(&game_id, &ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn revert_tweaks(ids: Vec<String>) -> Result<BatchResult, String> {
    engine::revert(&ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn revert_all() -> Result<BatchResult, String> {
    engine::revert_all().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn disable_tweaks(game_id: String, ids: Vec<String>) -> Result<BatchResult, String> {
    engine::disable(&game_id, &ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn disable_all(game_id: String) -> Result<BatchResult, String> {
    engine::disable_all(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn history() -> Journal {
    engine::history()
}

#[tauri::command]
pub fn is_elevated() -> bool {
    platform::is_elevated()
}

#[tauri::command]
pub fn relaunch_as_admin() -> Result<(), String> {
    platform::relaunch_as_admin().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reboot_system() -> Result<(), String> {
    platform::reboot_system().map_err(|e| e.to_string())
}
