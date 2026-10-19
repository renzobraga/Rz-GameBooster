//! Modelo de dados e carregamento do catálogo (tweaks + perfis de jogo).
//! Os JSON são embutidos no binário em tempo de compilação.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Catalog {
    pub version: u32,
    pub tweaks: Vec<Tweak>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tweak {
    pub id: String,
    pub category: String,
    pub title: String,
    pub description: String,
    pub risk: String,
    pub evidence: String,
    #[serde(default)]
    pub requires_reboot: bool,
    #[serde(default)]
    pub laptop_warning: bool,
    #[serde(default = "all_games")]
    pub games: Vec<String>,
    #[serde(default)]
    pub presets: Vec<String>,
    #[serde(default)]
    pub how_to_check: String,
    pub actions: Vec<Action>,
    #[serde(default)]
    pub i18n: serde_json::Value,
}

fn all_games() -> Vec<String> {
    vec!["*".to_string()]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Action {
    Registry {
        hive: String,
        path: String,
        name: String,
        value: serde_json::Value,
    },
    PowerPlan {
        plan: String,
    },
    GpuPreference,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameProfile {
    pub id: String,
    pub name: String,
    pub store: String,
    #[serde(default)]
    pub steam_app_id: Option<u32>,
    #[serde(default)]
    pub steam_common_dir: Option<String>,
    #[serde(default)]
    pub exe_relpath: Option<String>,
    pub executable: String,
    #[serde(default)]
    pub candidate_dirs: Vec<String>,
    pub anticheat: String,
    pub anticheat_level: String,
    #[serde(default)]
    pub anticheat_notes: String,
    #[serde(default)]
    pub excluded_tweaks: Vec<String>,
}

impl Tweak {
    /// Um tweak universal (`*`) vale para qualquer jogo.
    pub fn applies_to(&self, game_id: &str) -> bool {
        self.games.iter().any(|g| g == "*" || g == game_id)
    }
}

pub fn load_catalog() -> Catalog {
    serde_json::from_str(include_str!("../../../catalog/tweaks.json"))
        .expect("catalog/tweaks.json inválido")
}

pub fn load_games() -> Vec<GameProfile> {
    vec![
        serde_json::from_str(include_str!("../../../catalog/games/cs2.json")).expect("cs2.json inválido"),
        serde_json::from_str(include_str!("../../../catalog/games/gtav.json")).expect("gtav.json inválido"),
        serde_json::from_str(include_str!("../../../catalog/games/valorant.json")).expect("valorant.json inválido"),
    ]
}
