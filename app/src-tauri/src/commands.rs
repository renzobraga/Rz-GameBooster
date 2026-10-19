//! Comandos chamados pelo frontend via `invoke`.

use crate::catalog::{load_games, GameProfile};
use crate::diagnostics::{self, Report};
use crate::engine::{self, BatchResult, TweakView};
use crate::journal::Journal;
use crate::platform;

#[tauri::command]
pub fn list_games() -> Vec<GameProfile> {
    load_games()
}

#[tauri::command]
pub fn list_tweaks(game_id: String) -> Result<Vec<TweakView>, String> {
    engine::list(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn diagnose() -> Report {
    diagnostics::run()
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
