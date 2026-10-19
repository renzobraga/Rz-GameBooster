//! Localiza o executável de um jogo (Steam + pastas de instalação conhecidas).
//! É best-effort: se não achar, os tweaks universais de Windows funcionam
//! mesmo assim; só a preferência de GPU depende do executável.

use crate::catalog::GameProfile;
use crate::journal::RegValue;
use std::path::PathBuf;

pub fn find_executable(game: &GameProfile) -> Option<PathBuf> {
    // 1) Via Steam (libraryfolders.vdf).
    if game.steam_app_id.is_some() {
        if let Some(dir) = game.steam_common_dir.as_ref() {
            for lib in steam_libraries() {
                let base = lib.join("steamapps").join("common").join(dir);
                if let Some(found) = probe(&base, game) {
                    return Some(found);
                }
            }
        }
    }
    // 2) Pastas candidatas (expande %VARIAVEIS%).
    for d in &game.candidate_dirs {
        let base = PathBuf::from(expand_env(d));
        if let Some(found) = probe(&base, game) {
            return Some(found);
        }
    }
    None
}

fn probe(base: &std::path::Path, game: &GameProfile) -> Option<PathBuf> {
    if let Some(rel) = &game.exe_relpath {
        let p = base.join(rel);
        if p.exists() {
            return Some(p);
        }
    }
    let p = base.join(&game.executable);
    if p.exists() {
        return Some(p);
    }
    None
}

fn steam_libraries() -> Vec<PathBuf> {
    let mut libs = Vec::new();
    let steam = match crate::platform::reg_read("HKCU", "Software\\Valve\\Steam", "SteamPath") {
        Ok(Some(RegValue::Sz(p))) => PathBuf::from(p),
        _ => return libs,
    };
    libs.push(steam.clone());
    let vdf = steam.join("steamapps").join("libraryfolders.vdf");
    if let Ok(text) = std::fs::read_to_string(&vdf) {
        for line in text.lines() {
            let t = line.trim();
            if t.starts_with("\"path\"") {
                if let Some(path) = extract_quoted(&t["\"path\"".len()..]) {
                    libs.push(PathBuf::from(path.replace("\\\\", "\\")));
                }
            }
        }
    }
    libs
}

/// Primeiro trecho entre aspas de `s`.
fn extract_quoted(s: &str) -> Option<String> {
    let start = s.find('"')? + 1;
    let end = s[start..].find('"')? + start;
    Some(s[start..end].to_string())
}

/// Expande `%VAR%` com variáveis de ambiente. `%%` vira `%`.
fn expand_env(s: &str) -> String {
    let mut out = String::new();
    for (i, part) in s.split('%').enumerate() {
        if i % 2 == 0 {
            out.push_str(part);
        } else if part.is_empty() {
            out.push('%');
        } else {
            out.push_str(&std::env::var(part).unwrap_or_default());
        }
    }
    out
}
