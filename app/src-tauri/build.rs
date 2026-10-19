//! Anti-cheat guard: bloqueia, em tempo de compilação, qualquer código que
//! chegue perto do processo do jogo. Se encontrar algo, a build falha.
//!
//! Regra do projeto: só mexemos em configurações do Windows e em arquivos de
//! config do próprio usuário. Nunca no processo, memória ou binários do jogo.

use std::fs;
use std::path::{Path, PathBuf};

const FORBIDDEN_APIS: &[&str] = &[
    "OpenProcess",
    "ReadProcessMemory",
    "WriteProcessMemory",
    "VirtualAllocEx",
    "VirtualProtectEx",
    "CreateRemoteThread",
    "NtCreateThreadEx",
    "QueueUserAPC",
    "SetWindowsHookExW",
    "SetWindowsHookExA",
    "SetWindowsHookEx",
    "NtMapViewOfSection",
    "NtOpenProcess",
];

const FORBIDDEN_CRATE_PREFIXES: &[&str] = &[
    "dll-syringe",
    "detour",
    "retour",
    "minhook",
    "mhook",
    "inline-hook",
    "memflow",
    "frida",
    "ntapi",
];

const ALLOWED_ACTION_TYPES: &[&str] = &["registry", "power_plan", "gpu_preference"];

fn main() {
    if let Err(problems) = vac_guard() {
        for p in &problems {
            println!("cargo:warning=VAC GUARD: {p}");
        }
        panic!("VAC GUARD: compilação bloqueada ({} problema(s)).", problems.len());
    }
    tauri_build::build();
}

fn vac_guard() -> Result<(), Vec<String>> {
    let mut problems = Vec::new();

    // 1) Código Rust (ignora comentários de linha).
    for file in rs_files(Path::new("src")) {
        rerun(&file);
        if let Ok(content) = fs::read_to_string(&file) {
            for (i, raw) in content.lines().enumerate() {
                let line = strip_line_comment(raw);
                for api in FORBIDDEN_APIS {
                    if contains_word(line, api) {
                        problems.push(format!("API proibida '{api}' em {}:{}", file.display(), i + 1));
                    }
                }
            }
        }
    }

    // 2) Dependências (prefixo de crates de injeção/hook).
    let cargo = Path::new("Cargo.toml");
    rerun(cargo);
    if let Ok(content) = fs::read_to_string(cargo) {
        for (i, raw) in content.lines().enumerate() {
            let line = strip_hash_comment(raw).trim_start();
            for prefix in FORBIDDEN_CRATE_PREFIXES {
                if line.starts_with(prefix) {
                    problems.push(format!("dependência proibida '{prefix}' em Cargo.toml:{}", i + 1));
                }
            }
        }
    }

    // 3) Frontend: nunca sugerir/escrever a opção de inicialização insegura.
    for file in files_with_ext(Path::new("../src"), &["ts", "tsx"]) {
        rerun(&file);
        if let Ok(content) = fs::read_to_string(&file) {
            for (i, raw) in content.lines().enumerate() {
                let low = raw.to_lowercase();
                if low.contains("allow_third_party_software")
                    && (low.contains("launch") || low.contains("options =") || low.contains("const "))
                {
                    problems.push(format!("opção insegura em {}:{}", file.display(), i + 1));
                }
            }
        }
    }

    // 4) Catálogo: toda ação precisa ser de um tipo permitido.
    let tweaks = Path::new("../../catalog/tweaks.json");
    rerun(tweaks);
    if let Ok(content) = fs::read_to_string(tweaks) {
        for (i, raw) in content.lines().enumerate() {
            if raw.contains("\"type\"") && !ALLOWED_ACTION_TYPES.iter().any(|t| raw.contains(t)) {
                problems.push(format!("tipo de ação não permitido em tweaks.json:{}", i + 1));
            }
        }
    }

    // 5) Pros: nunca a opção insegura.
    for file in files_with_ext(Path::new("../../catalog/pros"), &["json"]) {
        rerun(&file);
        if let Ok(content) = fs::read_to_string(&file) {
            for (i, raw) in content.lines().enumerate() {
                if raw.contains("launch_options") && raw.contains("allow_third_party_software") {
                    problems.push(format!("opção insegura em {}:{}", file.display(), i + 1));
                }
            }
        }
    }

    if problems.is_empty() {
        Ok(())
    } else {
        Err(problems)
    }
}

fn rerun(p: &Path) {
    println!("cargo:rerun-if-changed={}", p.display());
}

fn strip_line_comment(line: &str) -> &str {
    match line.find("//") {
        Some(idx) => &line[..idx],
        None => line,
    }
}

fn strip_hash_comment(line: &str) -> &str {
    match line.find('#') {
        Some(idx) => &line[..idx],
        None => line,
    }
}

fn contains_word(haystack: &str, word: &str) -> bool {
    let mut start = 0;
    while let Some(pos) = haystack[start..].find(word) {
        let abs = start + pos;
        let before = abs.checked_sub(1).map(|i| haystack.as_bytes()[i]);
        let after = haystack.as_bytes().get(abs + word.len()).copied();
        let ok_before = before.map_or(true, |b| !is_ident(b));
        let ok_after = after.map_or(true, |b| !is_ident(b));
        if ok_before && ok_after {
            return true;
        }
        start = abs + word.len();
    }
    false
}

fn is_ident(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_'
}

fn rs_files(dir: &Path) -> Vec<PathBuf> {
    files_with_ext(dir, &["rs"])
}

fn files_with_ext(dir: &Path, exts: &[&str]) -> Vec<PathBuf> {
    let mut out = Vec::new();
    collect(dir, exts, &mut out);
    out
}

fn collect(dir: &Path, exts: &[&str], out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else { return };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect(&path, exts, out);
        } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if exts.contains(&ext) {
                out.push(path);
            }
        }
    }
}
