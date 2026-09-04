import data from "../data/games.json";

// ordena alfabeticamente por título
export const GAMES = [...data].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

// todas as tags únicas (ordenadas por frequência)
const tagCount = {};
GAMES.forEach((g) => g.tags.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
export const ALL_TAGS = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);

// resolve o caminho da capa respeitando o base do Vite
export function coverUrl(game) {
  if (!game?.cover) return null;
  return `${import.meta.env.BASE_URL}${game.cover}`;
}
