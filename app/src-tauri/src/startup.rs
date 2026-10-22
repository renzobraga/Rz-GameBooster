//! Gerenciador de apps de inicialização (o que abre junto com o Windows).
//! Lê as chaves Run (HKCU/HKLM) e as pastas Startup, e liga/desliga cada item
//! pelo mesmo mecanismo do Gerenciador de Tarefas (StartupApproved) — reversível
//! e sem apagar nada. Só configuração de Windows (respeita o VAC guard).

use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct StartupItem {
    pub id: String,       // "<origem>|<nome>", único
    pub name: String,     // nome do valor / atalho (sem .lnk)
    pub command: String,  // comando / caminho do atalho
    pub location: String, // hkcu | hklm | folder | folder_common
    pub enabled: bool,
}

#[cfg(windows)]
mod windows_impl {
    use super::StartupItem;
    use std::path::PathBuf;
    use winreg::enums::*;
    use winreg::types::FromRegValue;
    use winreg::RegKey;

    const RUN: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
    const APPROVED_RUN: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run";
    const APPROVED_FOLDER: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\StartupFolder";
    const STARTUP_REL: &str = r"Microsoft\Windows\Start Menu\Programs\Startup";

    // StartupApproved guarda 12 bytes; o 1º byte ímpar (0x03) = desativado.
    // Sem valor de aprovação, o item está habilitado por padrão.
    fn approved_enabled(approved: Option<&RegKey>, name: &str) -> bool {
        if let Some(key) = approved {
            if let Ok(val) = key.get_raw_value(name) {
                if let Some(b0) = val.bytes.first() {
                    return b0 & 1 == 0;
                }
            }
        }
        true
    }

    fn read_run(root: RegKey, loc: &str) -> Vec<StartupItem> {
        let mut out = Vec::new();
        let Ok(run) = root.open_subkey(RUN) else { return out };
        let approved = root.open_subkey(APPROVED_RUN).ok();
        for (name, value) in run.enum_values().flatten() {
            if name.is_empty() {
                continue;
            }
            let command = String::from_reg_value(&value).unwrap_or_default();
            let enabled = approved_enabled(approved.as_ref(), &name);
            out.push(StartupItem {
                id: format!("{loc}|{name}"),
                name,
                command,
                location: loc.into(),
                enabled,
            });
        }
        out
    }

    fn read_folders() -> Vec<StartupItem> {
        let mut out = Vec::new();
        let approved_user = RegKey::predef(HKEY_CURRENT_USER).open_subkey(APPROVED_FOLDER).ok();
        let approved_sys = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey(APPROVED_FOLDER).ok();
        let sources: Vec<(Option<PathBuf>, Option<&RegKey>, &str)> = vec![
            (std::env::var_os("APPDATA").map(|a| PathBuf::from(a).join(STARTUP_REL)), approved_user.as_ref(), "folder"),
            (std::env::var_os("ProgramData").map(|a| PathBuf::from(a).join(STARTUP_REL)), approved_sys.as_ref(), "folder_common"),
        ];
        for (dir, approved, loc) in sources {
            let Some(dir) = dir else { continue };
            let Ok(entries) = std::fs::read_dir(&dir) else { continue };
            for entry in entries.flatten() {
                let p = entry.path();
                let Some(fname) = p.file_name().and_then(|n| n.to_str()) else { continue };
                if fname.eq_ignore_ascii_case("desktop.ini") {
                    continue;
                }
                let name = fname.strip_suffix(".lnk").or_else(|| fname.strip_suffix(".LNK")).unwrap_or(fname);
                out.push(StartupItem {
                    id: format!("{loc}|{fname}"),
                    name: name.to_string(),
                    command: p.to_string_lossy().to_string(),
                    location: loc.into(),
                    enabled: approved_enabled(approved, fname),
                });
            }
        }
        out
    }

    pub fn list() -> Vec<StartupItem> {
        let mut out = Vec::new();
        out.extend(read_run(RegKey::predef(HKEY_CURRENT_USER), "hkcu"));
        out.extend(read_run(RegKey::predef(HKEY_LOCAL_MACHINE), "hklm"));
        out.extend(read_folders());
        out
    }

    // Ticks de 100ns desde 1601-01-01 (FILETIME), para o blob de desativado.
    fn now_filetime() -> u64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        const EPOCH_DIFF_SECS: u64 = 11_644_473_600; // 1601 -> 1970
        let dur = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
        (dur.as_secs() + EPOCH_DIFF_SECS) * 10_000_000 + (dur.subsec_nanos() as u64) / 100
    }

    pub fn set(id: &str, enabled: bool) -> anyhow::Result<()> {
        let (loc, name) = id.split_once('|').ok_or_else(|| anyhow::anyhow!("id inválido"))?;
        let (root, approved_path) = match loc {
            "hkcu" => (RegKey::predef(HKEY_CURRENT_USER), APPROVED_RUN),
            "hklm" => (RegKey::predef(HKEY_LOCAL_MACHINE), APPROVED_RUN),
            "folder" => (RegKey::predef(HKEY_CURRENT_USER), APPROVED_FOLDER),
            "folder_common" => (RegKey::predef(HKEY_LOCAL_MACHINE), APPROVED_FOLDER),
            other => return Err(anyhow::anyhow!("origem desconhecida: {other}")),
        };
        let (key, _) = root.create_subkey(approved_path)?;
        let bytes: Vec<u8> = if enabled {
            vec![2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        } else {
            let mut b = vec![3u8, 0, 0, 0];
            b.extend_from_slice(&now_filetime().to_le_bytes());
            b
        };
        key.set_raw_value(name, &winreg::RegValue { bytes, vtype: REG_BINARY })?;
        Ok(())
    }
}

#[cfg(windows)]
pub use windows_impl::{list, set};

#[cfg(not(windows))]
pub fn list() -> Vec<StartupItem> {
    Vec::new()
}

#[cfg(not(windows))]
pub fn set(_id: &str, _enabled: bool) -> anyhow::Result<()> {
    Err(anyhow::anyhow!("disponível apenas no Windows"))
}
