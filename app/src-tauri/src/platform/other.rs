//! Stubs para plataformas não-Windows (permite rodar a UI em dev no mac/linux).
//! O app só faz otimizações reais no Windows.

use anyhow::{anyhow, Result};
use crate::journal::RegValue;

const NOT_WINDOWS: &str = "disponível apenas no Windows";

pub fn high_perf_guid() -> String {
    "8C5E7FDA-E8BF-4A96-9A85-A6E23A8C635C".to_string()
}

pub fn balanced_guid() -> String {
    "381B4222-F694-41F0-9685-FF5BB260DF2E".to_string()
}

pub fn reg_read(_hive: &str, _path: &str, _name: &str) -> Result<Option<RegValue>> {
    Ok(None)
}

pub fn reg_write(_hive: &str, _path: &str, _name: &str, _value: &RegValue) -> Result<()> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn reg_delete(_hive: &str, _path: &str, _name: &str) -> Result<()> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn power_active() -> Result<String> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn power_set(_guid_str: &str) -> Result<()> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn is_performance_plan(_guid_str: &str) -> bool {
    false
}

pub fn is_elevated() -> bool {
    false
}

pub fn relaunch_as_admin() -> Result<()> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn reboot_system() -> Result<()> {
    Err(anyhow!(NOT_WINDOWS))
}

pub fn mem_total_bytes() -> Option<u64> {
    None
}

pub fn free_disk_bytes(_path: &str) -> Option<u64> {
    None
}

pub fn disk_total_free_bytes(_path: &str) -> Option<(u64, u64)> {
    None
}

pub fn cpu_name() -> Option<String> {
    None
}

pub fn gpu_name() -> Option<String> {
    None
}

pub fn os_name() -> Option<String> {
    None
}

pub fn recycle_bin_info() -> (u64, u64) {
    (0, 0)
}
