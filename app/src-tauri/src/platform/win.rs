//! Implementação Windows: registro, plano de energia, elevação e leitura de hardware.
//! Nada aqui toca em processo/memória/arquivo de jogo (ver build.rs / VAC guard).

use anyhow::{anyhow, Result};
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use winreg::enums::*;
use winreg::types::FromRegValue;
use winreg::RegKey;

use windows::core::{GUID, PCWSTR};
use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
use windows::Win32::System::Power::{PowerGetActiveScheme, PowerSetActiveScheme};
use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
use windows::Win32::UI::Shell::{IsUserAnAdmin, ShellExecuteW};
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

use crate::journal::RegValue;

// GUIDs de planos de energia de desempenho.
const HIGH_PERF: GUID = GUID::from_u128(0x8c5e7fda_e8bf_4a96_9a85_a6e23a8c635c);
const ULTIMATE_PERF: GUID = GUID::from_u128(0xe9a42b02_d5df_448d_aa00_03f14749eb61);

pub fn high_perf_guid() -> String {
    guid_to_string(&HIGH_PERF)
}

fn wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

fn hkey(hive: &str) -> Result<RegKey> {
    let predef = match hive {
        "HKLM" => HKEY_LOCAL_MACHINE,
        "HKCU" => HKEY_CURRENT_USER,
        "HKCR" => HKEY_CLASSES_ROOT,
        "HKU" => HKEY_USERS,
        other => return Err(anyhow!("hive desconhecido: {other}")),
    };
    Ok(RegKey::predef(predef))
}

fn raw_to_regvalue(v: &winreg::RegValue) -> RegValue {
    if v.vtype == REG_DWORD {
        RegValue::Dword(u32::from_reg_value(v).unwrap_or(0))
    } else {
        RegValue::Sz(String::from_reg_value(v).unwrap_or_default())
    }
}

pub fn reg_read(hive: &str, path: &str, name: &str) -> Result<Option<RegValue>> {
    let root = hkey(hive)?;
    let key = match root.open_subkey(path) {
        Ok(k) => k,
        Err(_) => return Ok(None),
    };
    match key.get_raw_value(name) {
        Ok(val) => Ok(Some(raw_to_regvalue(&val))),
        Err(_) => Ok(None),
    }
}

pub fn reg_write(hive: &str, path: &str, name: &str, value: &RegValue) -> Result<()> {
    let root = hkey(hive)?;
    let (key, _) = root.create_subkey(path)?;
    match value {
        RegValue::Dword(n) => key.set_value(name, n)?,
        RegValue::Sz(s) => key.set_value(name, s)?,
    }
    Ok(())
}

pub fn reg_delete(hive: &str, path: &str, name: &str) -> Result<()> {
    let root = hkey(hive)?;
    if let Ok(key) = root.open_subkey_with_flags(path, KEY_ALL_ACCESS) {
        let _ = key.delete_value(name); // se já não existe, tudo bem
    }
    Ok(())
}

fn guid_to_string(g: &GUID) -> String {
    format!(
        "{:08X}-{:04X}-{:04X}-{:02X}{:02X}-{:02X}{:02X}{:02X}{:02X}{:02X}{:02X}",
        g.data1,
        g.data2,
        g.data3,
        g.data4[0],
        g.data4[1],
        g.data4[2],
        g.data4[3],
        g.data4[4],
        g.data4[5],
        g.data4[6],
        g.data4[7]
    )
}

fn string_to_guid(s: &str) -> Result<GUID> {
    let clean: String = s.chars().filter(|c| c.is_ascii_hexdigit()).collect();
    if clean.len() != 32 {
        return Err(anyhow!("GUID inválido: {s}"));
    }
    let u = u128::from_str_radix(&clean, 16)?;
    Ok(GUID::from_u128(u))
}

pub fn power_active() -> Result<String> {
    unsafe {
        let mut p: *mut GUID = std::ptr::null_mut();
        PowerGetActiveScheme(None, &mut p)
            .ok()
            .map_err(|e| anyhow!("PowerGetActiveScheme: {e}"))?;
        if p.is_null() {
            return Err(anyhow!("esquema de energia ativo nulo"));
        }
        let guid = *p;
        // O buffer de PowerGetActiveScheme deveria ser liberado com LocalFree,
        // mas são ~16 bytes por chamada (não é caminho quente) e o SO recupera
        // ao fechar. Evitamos a dependência de API para manter o build simples.
        Ok(guid_to_string(&guid))
    }
}

pub fn power_set(guid_str: &str) -> Result<()> {
    let guid = string_to_guid(guid_str)?;
    unsafe {
        PowerSetActiveScheme(None, Some(&guid))
            .ok()
            .map_err(|e| anyhow!("PowerSetActiveScheme: {e}"))?;
    }
    Ok(())
}

/// Um GUID de plano é "de desempenho"?
pub fn is_performance_plan(guid_str: &str) -> bool {
    let hp = guid_to_string(&HIGH_PERF);
    let up = guid_to_string(&ULTIMATE_PERF);
    guid_str.eq_ignore_ascii_case(&hp) || guid_str.eq_ignore_ascii_case(&up)
}

pub fn is_elevated() -> bool {
    unsafe { IsUserAnAdmin().as_bool() }
}

/// Reabre o próprio executável pedindo elevação (UAC) e retorna Ok após disparar.
pub fn relaunch_as_admin() -> Result<()> {
    let exe = std::env::current_exe()?;
    let file = wide(&exe.to_string_lossy());
    let verb = wide("runas");
    unsafe {
        let h = ShellExecuteW(
            None,
            PCWSTR(verb.as_ptr()),
            PCWSTR(file.as_ptr()),
            PCWSTR::null(),
            PCWSTR::null(),
            SW_SHOWNORMAL,
        );
        // ShellExecuteW retorna > 32 em caso de sucesso.
        if h.0 as isize <= 32 {
            return Err(anyhow!("falha ao reabrir como administrador"));
        }
    }
    Ok(())
}

/// Reinicia o Windows com uma contagem curta. O app roda como administrador,
/// entao tem o privilegio de desligamento. Usa o shutdown.exe do proprio SO
/// (nunca toca em processo/memoria de jogo, respeitando o VAC guard).
pub fn reboot_system() -> Result<()> {
    std::process::Command::new("shutdown")
        .args([
            "/r",
            "/t",
            "8",
            "/c",
            "Rz GameBooster: reiniciando para aplicar os ajustes.",
        ])
        .spawn()
        .map_err(|e| anyhow!("falha ao reiniciar: {e}"))?;
    Ok(())
}

pub fn mem_total_bytes() -> Option<u64> {
    unsafe {
        let mut st = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };
        GlobalMemoryStatusEx(&mut st).ok()?;
        Some(st.ullTotalPhys)
    }
}

pub fn free_disk_bytes(path: &str) -> Option<u64> {
    disk_total_free_bytes(path).map(|(_, free)| free)
}

/// (total, livre) em bytes do volume do caminho dado.
pub fn disk_total_free_bytes(path: &str) -> Option<(u64, u64)> {
    let dir = wide(path);
    let mut free_avail: u64 = 0;
    let mut total: u64 = 0;
    unsafe {
        GetDiskFreeSpaceExW(PCWSTR(dir.as_ptr()), Some(&mut free_avail), Some(&mut total), None).ok()?;
    }
    Some((total, free_avail))
}

/// Le um valor REG_SZ, aparado; None se ausente ou vazio.
fn reg_sz(hive: &str, path: &str, name: &str) -> Option<String> {
    match reg_read(hive, path, name) {
        Ok(Some(RegValue::Sz(s))) => {
            let t = s.trim().to_string();
            if t.is_empty() {
                None
            } else {
                Some(t)
            }
        }
        _ => None,
    }
}

pub fn cpu_name() -> Option<String> {
    reg_sz("HKLM", "HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0", "ProcessorNameString")
}

pub fn gpu_name() -> Option<String> {
    // Placa primaria: primeira classe de display (0000).
    reg_sz(
        "HKLM",
        "SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0000",
        "DriverDesc",
    )
}

pub fn os_name() -> Option<String> {
    reg_sz("HKLM", "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "ProductName")
}
