mod catalog;
mod clean;
mod commands;
mod detect;
mod startup;
mod diagnostics;
mod engine;
mod journal;
mod platform;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Admin obrigatório em release. O manifesto do Windows já pede UAC ao abrir,
    // mas se o app subir sem elevação por qualquer motivo (manifesto removido,
    // build fora do padrão, exe solto), reabrimos elevado e encerramos esta
    // instância — sem admin as otimizações em HKLM falham. Em dev (debug)
    // seguimos como o usuário, para não disparar UAC a cada `tauri dev`.
    #[cfg(all(desktop, not(debug_assertions)))]
    {
        if !platform::is_elevated() {
            let _ = platform::relaunch_as_admin();
            return;
        }
    }

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
            commands::disable_tweaks,
            commands::disable_all,
            commands::history,
            commands::cleanup_scan,
            commands::cleanup,
            commands::list_startup,
            commands::set_startup,
            commands::is_elevated,
            commands::relaunch_as_admin,
            commands::reboot_system,
            commands::system_info,
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Rz GameBooster");
}
