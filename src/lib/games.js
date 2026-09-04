import data from "../data/games.json";

// ordena alfabeticamente por título
export const GAMES = [...data].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

// todas as tags únicas (ordenadas por frequência)
const tagCount = {};
GAMES.forEach((g) => g.tags.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
export const ALL_TAGS = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);

// Capa: se o build embutiu o arquivo local, usa ele; senão cai na CDN da Steam.
// (o deploy é feito só com o código-fonte; as capas baixadas ficam no repo e
//  em produção são servidas pela CDN pública da Steam a partir do appid.)
const BUNDLED_COVERS = import.meta.env.VITE_BUNDLED_COVERS === "1";

export function coverUrl(game) {
  if (!game?.cover) return null;
  if (BUNDLED_COVERS) return `${import.meta.env.BASE_URL}${game.cover}`;
  if (game.steamAppId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppId}/library_600x900.jpg`;
  }
  return null;
}
