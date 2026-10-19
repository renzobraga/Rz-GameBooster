mod catalog;
mod commands;
mod detect;
mod diagnostics;
mod engine;
mod journal;
mod platform;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());

    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    builder
        .invoke_handler(tauri::generate_handler![
            commands::list_games,
            commands::list_tweaks,
            commands::diagnose,
            commands::apply_tweaks,
            commands::revert_tweaks,
            commands::revert_all,
            commands::history,
            commands::is_elevated,
            commands::relaunch_as_admin,
            commands::reboot_system,
            commands::system_info,
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Rz GameBooster");
}
