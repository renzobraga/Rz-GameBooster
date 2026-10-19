// Identidade do produto. Trocar o nome/tagline aqui atualiza o site inteiro.
export const brand = {
  name: "Redline",
  // Promessa curta, da perspectiva de quem joga. Sem jargão.
  tagline: "Mais FPS no seu jogo. E você desfaz tudo quando quiser.",
  // Repositório e release (ajustar para o seu usuário/repo).
  github: "https://github.com/renzobraga/cs-boost",
  releasesApi: "https://api.github.com/repos/renzobraga/cs-boost/releases/latest",
  // Jogos suportados hoje (vira o perfil de jogo no app).
  games: ["Counter-Strike 2", "GTA V", "Valorant"] as const,
  license: "GPL-3.0",
} as const;
