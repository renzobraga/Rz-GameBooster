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
    build_tauri();
}

// Manifesto Windows: no release o app exige administrador (UAC ao abrir);
// no dev roda como o usuário (sem pedir admin a cada `tauri dev`).
const APP_MANIFEST: &str = r#"<?xml version="1.0" encoding="utf-8"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
    <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="__LEVEL__" uiAccess="false" />
      </requestedPrivileges>
    </security>
  </trustInfo>
  <dependency>
    <dependentAssembly>
      <assemblyIdentity type="win32" name="Microsoft.Windows.Common-Controls" version="6.0.0.0" processorArchitecture="*" publicKeyToken="6595b64144ccf1df" language="*" />
    </dependentAssembly>
  </dependency>
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true/pm</dpiAware>
      <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">PerMonitorV2</dpiAwareness>
      <longPathAware xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">true</longPathAware>
    </windowsSettings>
  </application>
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}"/>
      <supportedOS Id="{1f676c76-80e1-4239-95bb-83d0f6d0da78}"/>
      <supportedOS Id="{4a2f28e3-53b9-4441-ba9c-d69d4a4a6e38}"/>
      <supportedOS Id="{35138b9a-5d96-4fbd-8e2d-a2440225f93a}"/>
      <supportedOS Id="{e2011457-1546-43c5-a5fe-008deee3d3f0}"/>
    </application>
  </compatibility>
</assembly>
"#;

#[cfg(windows)]
fn build_tauri() {
    let level = if std::env::var("PROFILE").as_deref() == Ok("release") {
        "requireAdministrator"
    } else {
        "asInvoker"
    };
    let manifest = APP_MANIFEST.replace("__LEVEL__", level);
    let attrs = tauri_build::Attributes::new()
        .windows_attributes(tauri_build::WindowsAttributes::new().app_manifest(manifest));
    tauri_build::try_build(attrs).expect("erro ao executar tauri-build");
}

#[cfg(not(windows))]
fn build_tauri() {
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
