//! Limpeza do sistema: remove arquivos temporários e de cache do Windows e do
//! próprio usuário. Só toca em pastas de temporários/cache do SO e do usuário —
//! nunca no processo, memória ou arquivos de jogo (respeita o VAC guard).
//!
//! Arquivos em uso (travados por serviços/Explorer) simplesmente são pulados:
//! a limpeza é best-effort e nunca aborta por um item bloqueado.

use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
pub struct CleanResult {
    pub id: String,
    pub ok: bool,
    pub skipped: bool,
    pub freed_bytes: u64,
    pub message: String,
}

#[derive(Serialize)]
pub struct CleanReport {
    pub results: Vec<CleanResult>,
    pub freed_bytes: u64,
}

/// Estado de uma tarefa: quanto há para limpar e se há algo a fazer.
#[derive(Serialize)]
pub struct CleanScan {
    pub id: String,
    pub bytes: u64,
    pub available: bool,
}

/// Verifica, sem apagar nada, quanto cada tarefa tem para limpar.
pub fn scan() -> Vec<CleanScan> {
    vec![
        scan_dirs("clean.temp", temp_dirs()),
        scan_dirs("clean.prefetch", vec![windir().join("Prefetch")]),
        scan_dirs("clean.windows_update", vec![windir().join("SoftwareDistribution").join("Download")]),
        scan_prefix("clean.thumbnails", localappdata().join("Microsoft").join("Windows").join("Explorer"), "thumbcache_"),
        scan_recycle("clean.recycle_bin"),
    ]
}

fn scan_dirs(id: &str, dirs: Vec<PathBuf>) -> CleanScan {
    let mut bytes = 0u64;
    for dir in &dirs {
        if !dir.is_dir() {
            continue;
        }
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                bytes += path_size(&entry.path());
            }
        }
    }
    CleanScan { id: id.to_string(), bytes, available: bytes > 0 }
}

fn scan_prefix(id: &str, dir: PathBuf, prefix: &str) -> CleanScan {
    let mut bytes = 0u64;
    if dir.is_dir() {
        if let Ok(entries) = std::fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.file_name().and_then(|n| n.to_str()).is_some_and(|n| n.starts_with(prefix)) {
                    bytes += path_size(&p);
                }
            }
        }
    }
    CleanScan { id: id.to_string(), bytes, available: bytes > 0 }
}

fn scan_recycle(id: &str) -> CleanScan {
    let (bytes, items) = crate::platform::recycle_bin_info();
    CleanScan { id: id.to_string(), bytes, available: items > 0 }
}

/// Executa cada tarefa de limpeza pedida, na ordem recebida.
pub fn run(ids: &[String]) -> CleanReport {
    let results: Vec<CleanResult> = ids.iter().map(|id| run_one(id)).collect();
    let freed_bytes = results.iter().map(|r| r.freed_bytes).sum();
    CleanReport { results, freed_bytes }
}

fn run_one(id: &str) -> CleanResult {
    match id {
        "clean.temp" => clear_dirs(id, temp_dirs()),
        "clean.prefetch" => clear_dirs(id, vec![windir().join("Prefetch")]),
        "clean.windows_update" => clear_dirs(id, vec![windir().join("SoftwareDistribution").join("Download")]),
        "clean.thumbnails" => clear_prefix(id, localappdata().join("Microsoft").join("Windows").join("Explorer"), "thumbcache_"),
        "clean.recycle_bin" => empty_recycle(id),
        _ => CleanResult { id: id.to_string(), ok: false, skipped: true, freed_bytes: 0, message: "tarefa desconhecida".into() },
    }
}

/* ---------- Pastas conhecidas ---------- */

fn env_path(var: &str) -> Option<PathBuf> {
    std::env::var_os(var).map(PathBuf::from).filter(|p| !p.as_os_str().is_empty())
}

fn windir() -> PathBuf {
    env_path("SystemRoot").or_else(|| env_path("WINDIR")).unwrap_or_else(|| PathBuf::from("C:\\Windows"))
}

fn localappdata() -> PathBuf {
    env_path("LOCALAPPDATA").unwrap_or_else(|| PathBuf::from("C:\\"))
}

fn temp_dirs() -> Vec<PathBuf> {
    let mut v = Vec::new();
    if let Some(t) = env_path("TEMP") {
        v.push(t);
    }
    if let Some(t) = env_path("TMP") {
        if !v.contains(&t) {
            v.push(t);
        }
    }
    let win_temp = windir().join("Temp");
    if !v.contains(&win_temp) {
        v.push(win_temp);
    }
    v
}

/* ---------- Operações de arquivo (best-effort) ---------- */

/// Apaga o conteúdo das pastas dadas (não as pastas em si). Soma o tamanho do
/// que foi efetivamente removido; itens travados são pulados sem erro.
fn clear_dirs(id: &str, dirs: Vec<PathBuf>) -> CleanResult {
    let mut freed = 0u64;
    let mut existed = false;
    for dir in &dirs {
        if !dir.is_dir() {
            continue;
        }
        existed = true;
        let Ok(entries) = std::fs::read_dir(dir) else { continue };
        for entry in entries.flatten() {
            let p = entry.path();
            let size = path_size(&p);
            if remove_any(&p) {
                freed += size;
            }
        }
    }
    done(id, freed, existed)
}

/// Apaga, numa pasta, os arquivos cujo nome começa com `prefix`.
fn clear_prefix(id: &str, dir: PathBuf, prefix: &str) -> CleanResult {
    if !dir.is_dir() {
        return done(id, 0, false);
    }
    let mut freed = 0u64;
    if let Ok(entries) = std::fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            let matches = p.file_name().and_then(|n| n.to_str()).is_some_and(|n| n.starts_with(prefix));
            if matches {
                let size = path_size(&p);
                if remove_any(&p) {
                    freed += size;
                }
            }
        }
    }
    done(id, freed, true)
}

fn remove_any(p: &Path) -> bool {
    if p.is_dir() {
        std::fs::remove_dir_all(p).is_ok()
    } else {
        std::fs::remove_file(p).is_ok()
    }
}

/// Tamanho em bytes de um arquivo ou, recursivamente, de uma pasta.
/// Usa `symlink_metadata` para não seguir links.
fn path_size(p: &Path) -> u64 {
    match std::fs::symlink_metadata(p) {
        Ok(md) if md.is_file() => md.len(),
        Ok(md) if md.is_dir() => {
            let mut total = 0;
            if let Ok(entries) = std::fs::read_dir(p) {
                for entry in entries.flatten() {
                    total += path_size(&entry.path());
                }
            }
            total
        }
        _ => 0,
    }
}

/* ---------- Lixeira ---------- */

fn empty_recycle(id: &str) -> CleanResult {
    #[cfg(windows)]
    {
        // Mede o tamanho antes de esvaziar, para reportar o espaço liberado.
        let (bytes, _items) = crate::platform::recycle_bin_info();
        // Clear-RecycleBin (PowerShell, embutido no Windows) evita amarrar o
        // binding da API SHEmptyRecycleBin. -ErrorAction SilentlyContinue faz a
        // lixeira já vazia não virar erro.
        let status = std::process::Command::new("powershell")
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "Clear-RecycleBin -Force -ErrorAction SilentlyContinue",
            ])
            .status();
        match status {
            Ok(_) => CleanResult { id: id.to_string(), ok: true, skipped: false, freed_bytes: bytes, message: "lixeira esvaziada".into() },
            Err(e) => CleanResult { id: id.to_string(), ok: false, skipped: false, freed_bytes: 0, message: format!("falha ao esvaziar a lixeira: {e}") },
        }
    }
    #[cfg(not(windows))]
    {
        CleanResult { id: id.to_string(), ok: false, skipped: true, freed_bytes: 0, message: "disponível apenas no Windows".into() }
    }
}

fn done(id: &str, freed: u64, existed: bool) -> CleanResult {
    CleanResult {
        id: id.to_string(),
        ok: true,
        skipped: !existed,
        freed_bytes: freed,
        message: if existed { "ok".into() } else { "nada para limpar".into() },
    }
}
