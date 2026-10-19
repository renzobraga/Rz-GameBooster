//! Diário de mudanças. Antes de alterar qualquer coisa, gravamos o valor
//! anterior para poder desfazer. Reverter = desfazer na ordem inversa.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

/// Valor de registro tipado, para restaurar com o tipo correto.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum RegValue {
    Dword(u32),
    Sz(String),
}

/// Uma mudança aplicada, com o necessário para desfazer.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Change {
    Registry {
        hive: String,
        path: String,
        name: String,
        /// `None` = o valor não existia antes (reverter apaga).
        previous: Option<RegValue>,
        applied: Option<RegValue>,
    },
    PowerPlan {
        previous: String,
        applied: String,
    },
}

/// Mudanças de um tweak agrupadas.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entry {
    pub id: u64,
    pub tweak_id: String,
    pub title: String,
    pub applied_at: u64,
    #[serde(default)]
    pub reverted_at: Option<u64>,
    pub changes: Vec<Change>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Journal {
    #[serde(default)]
    pub entries: Vec<Entry>,
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

pub fn journal_path() -> PathBuf {
    let base = std::env::var("LOCALAPPDATA")
        .ok()
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir);
    base.join("RzGameBooster").join("journal.json")
}

pub fn load() -> Journal {
    let path = journal_path();
    match std::fs::read_to_string(&path) {
        Ok(text) => match serde_json::from_str(&text) {
            Ok(j) => j,
            Err(_) => {
                // Nunca sobrescreve um diário ilegível sem backup — preserva o histórico.
                let _ = std::fs::copy(&path, path.with_extension("corrupt.json"));
                Journal::default()
            }
        },
        Err(_) => Journal::default(),
    }
}

pub fn save(j: &Journal) -> std::io::Result<()> {
    let path = journal_path();
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir)?;
    }
    let tmp = path.with_extension("json.tmp");
    let data = serde_json::to_string_pretty(j).unwrap_or_else(|_| "{\"entries\":[]}".to_string());
    std::fs::write(&tmp, data)?;
    std::fs::rename(&tmp, &path)?;
    Ok(())
}

impl Journal {
    pub fn active(&self, tweak_id: &str) -> Option<&Entry> {
        self.entries
            .iter()
            .rev()
            .find(|e| e.tweak_id == tweak_id && e.reverted_at.is_none())
    }

    pub fn active_mut(&mut self, tweak_id: &str) -> Option<&mut Entry> {
        self.entries
            .iter_mut()
            .rev()
            .find(|e| e.tweak_id == tweak_id && e.reverted_at.is_none())
    }

    pub fn active_ids(&self) -> Vec<String> {
        let mut ids: Vec<String> = self
            .entries
            .iter()
            .filter(|e| e.reverted_at.is_none())
            .map(|e| e.tweak_id.clone())
            .collect();
        ids.sort();
        ids.dedup();
        ids
    }

    pub fn push(&mut self, tweak_id: &str, title: &str, changes: Vec<Change>) {
        let id = self.entries.last().map(|e| e.id + 1).unwrap_or_else(now_ms);
        self.entries.push(Entry {
            id,
            tweak_id: tweak_id.to_string(),
            title: title.to_string(),
            applied_at: now_ms(),
            reverted_at: None,
            changes,
        });
    }
}
