//! Raio-X do PC: uma nota 0–100 e uma lista de problemas com correção sugerida.
//! Checagens de baixo risco, somente leitura.

use serde::Serialize;

use crate::journal::RegValue;
use crate::platform;

#[derive(Serialize, Clone)]
pub struct Issue {
    pub id: String,
    pub severity: String, // "critical" | "warning" | "info"
    pub title: String,
    pub detail: String,
    /// id de um tweak que corrige o problema (quando houver).
    pub fix: Option<String>,
}

#[derive(Serialize)]
pub struct Report {
    pub score: u32,
    pub elevated: bool,
    pub mem_total_gb: Option<f64>,
    pub free_disk_gb: Option<f64>,
    pub power_ok: bool,
    pub issues: Vec<Issue>,
    pub passed: Vec<String>,
}

fn penalty(sev: &str) -> u32 {
    match sev {
        "critical" => 18,
        "warning" => 8,
        _ => 2,
    }
}

fn dword(hive: &str, path: &str, name: &str) -> Option<u32> {
    match platform::reg_read(hive, path, name) {
        Ok(Some(RegValue::Dword(n))) => Some(n),
        _ => None,
    }
}

pub fn run() -> Report {
    let mut issues: Vec<Issue> = Vec::new();
    let mut passed: Vec<String> = Vec::new();

    let elevated = platform::is_elevated();
    if !elevated {
        issues.push(Issue {
            id: "elevation".into(),
            severity: "info".into(),
            title: "Abra como administrador".into(),
            detail: "Alguns ajustes só podem ser aplicados com permissão de administrador.".into(),
            fix: None,
        });
    }

    // Plano de energia.
    let power_ok = matches!(platform::power_active(), Ok(g) if platform::is_performance_plan(&g));
    if power_ok {
        passed.push("Plano de energia de desempenho ativo".into());
    } else {
        issues.push(Issue {
            id: "power_plan".into(),
            severity: "warning".into(),
            title: "Plano de energia não é de desempenho".into(),
            detail: "Trocar para Alto Desempenho evita que a CPU reduza a frequência.".into(),
            fix: Some("power.high_performance".into()),
        });
    }

    // Game DVR (gravação em segundo plano).
    if dword("HKCU", "System\\GameConfigStore", "GameDVR_Enabled") == Some(0) {
        passed.push("Gravação em segundo plano desligada".into());
    } else {
        issues.push(Issue {
            id: "gamedvr".into(),
            severity: "warning".into(),
            title: "Gravação em segundo plano ligada".into(),
            detail: "A captura automática do Game Bar consome CPU/GPU durante o jogo.".into(),
            fix: Some("gamedvr.disable".into()),
        });
    }

    // HAGS.
    if dword("HKLM", "SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers", "HwSchMode") == Some(2) {
        passed.push("Agendamento de GPU por hardware ligado".into());
    } else {
        issues.push(Issue {
            id: "hags".into(),
            severity: "info".into(),
            title: "HAGS desligado".into(),
            detail: "Pode ajudar em algumas máquinas. Meça antes e depois.".into(),
            fix: Some("graphics.hags".into()),
        });
    }

    // Espaço em disco (C:).
    let free_disk_gb = platform::free_disk_bytes("C:\\").map(|b| b as f64 / 1_073_741_824.0);
    if let Some(gb) = free_disk_gb {
        if gb < 15.0 {
            issues.push(Issue {
                id: "disk".into(),
                severity: "warning".into(),
                title: "Pouco espaço livre em C:".into(),
                detail: format!("Apenas {gb:.0} GB livres. Libere espaço para o Windows respirar."),
                fix: None,
            });
        } else {
            passed.push("Espaço em disco suficiente".into());
        }
    }

    // Memória RAM.
    let mem_total_gb = platform::mem_total_bytes().map(|b| b as f64 / 1_073_741_824.0);
    if let Some(gb) = mem_total_gb {
        if gb < 7.5 {
            issues.push(Issue {
                id: "ram_low".into(),
                severity: "warning".into(),
                title: "Pouca memória RAM".into(),
                detail: format!("{gb:.0} GB podem limitar jogos modernos."),
                fix: None,
            });
        } else if gb < 15.0 {
            issues.push(Issue {
                id: "ram_mid".into(),
                severity: "info".into(),
                title: "16 GB de RAM melhoram a folga".into(),
                detail: format!("Você tem ~{gb:.0} GB. Jogos pesados pedem 16 GB."),
                fix: None,
            });
        } else {
            passed.push("Memória RAM suficiente".into());
        }
    }

    // Nota final.
    let total_penalty: u32 = issues.iter().map(|i| penalty(&i.severity)).sum();
    let score = 100u32.saturating_sub(total_penalty).min(100);

    // Ordena: critical, warning, info.
    issues.sort_by_key(|i| match i.severity.as_str() {
        "critical" => 0,
        "warning" => 1,
        _ => 2,
    });

    Report {
        score,
        elevated,
        mem_total_gb,
        free_disk_gb,
        power_ok,
        issues,
        passed,
    }
}
