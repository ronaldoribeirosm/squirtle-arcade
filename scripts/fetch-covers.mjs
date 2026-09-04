// Busca appid na Steam e baixa a capa vertical (box-art 600x900) de cada jogo.
// Uso: node scripts/fetch-covers.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COVERS_DIR = join(ROOT, "public", "covers");
const DATA_OUT = join(ROOT, "src", "data", "games.json");

// id: slug estavel | title: nome exibido | q: termo de busca na Steam | tag: categoria
const GAMES = [
  { id: "elden-ring", title: "Elden Ring", q: "Elden Ring", tags: ["Souls", "RPG"] },
  { id: "elden-ring-nightreign", title: "Elden Ring Nightreign", q: "Elden Ring Nightreign", tags: ["Souls", "Co-op"] },
  { id: "dark-souls-remastered", title: "Dark Souls: Remastered", q: "Dark Souls Remastered", tags: ["Souls", "RPG"] },
  { id: "dark-souls-3", title: "Dark Souls III", q: "Dark Souls III", tags: ["Souls", "RPG"] },
  { id: "dark-souls-ptde", title: "Dark Souls: Prepare to Die", q: "Dark Souls Prepare to Die", tags: ["Souls", "RPG"] },
  { id: "sekiro", title: "Sekiro: Shadows Die Twice", q: "Sekiro Shadows Die Twice", tags: ["Souls", "Ação"] },
  { id: "wo-long", title: "Wo Long: Fallen Dynasty", q: "Wo Long Fallen Dynasty", tags: ["Souls", "Ação"] },
  { id: "peak", title: "PEAK", q: "PEAK", tags: ["Co-op", "Sobrevivência"] },
  { id: "repo", title: "R.E.P.O.", q: "REPO", tags: ["Co-op", "Terror"] },
  { id: "buckshot-roulette", title: "Buckshot Roulette", q: "Buckshot Roulette", tags: ["Terror", "Cartas"] },
  { id: "liars-bar", title: "Liar's Bar", q: "Liar's Bar", tags: ["Co-op", "Cartas"] },
  { id: "chained-together", title: "Chained Together", q: "Chained Together", tags: ["Co-op", "Plataforma"] },
  { id: "gang-beasts", title: "Gang Beasts", q: "Gang Beasts", tags: ["Party", "Co-op"] },
  { id: "ultimate-chicken-horse", title: "Ultimate Chicken Horse", q: "Ultimate Chicken Horse", tags: ["Party", "Co-op"] },
  { id: "golf-with-your-friends", title: "Golf With Your Friends", q: "Golf With Your Friends", tags: ["Party", "Co-op"] },
  { id: "gamble-with-your-friends", title: "Gamble With Your Friends", q: "Gamble With Your Friends", tags: ["Party", "Cartas"] },
  { id: "pico-park-2", title: "PICO PARK 2", q: "PICO PARK 2", tags: ["Party", "Co-op"] },
  { id: "human-fall-flat", title: "Human: Fall Flat", q: "Human Fall Flat", tags: ["Party", "Co-op"] },
  { id: "you-suck-at-parking", title: "You Suck at Parking", q: "You Suck at Parking", tags: ["Corrida", "Party"] },
  { id: "super-battle-golf", title: "Super Battle Golf", q: "Super Battle Golf", tags: ["Party", "Esporte"] },
  { id: "subnautica", title: "Subnautica", q: "Subnautica", tags: ["Sobrevivência", "Aventura"] },
  { id: "the-forest", title: "The Forest", q: "The Forest", tags: ["Sobrevivência", "Terror"] },
  { id: "palworld", title: "Palworld", q: "Palworld", tags: ["Sobrevivência", "Co-op"] },
  { id: "satisfactory", title: "Satisfactory", q: "Satisfactory", tags: ["Construção", "Co-op"] },
  { id: "the-planet-crafter", title: "The Planet Crafter", q: "The Planet Crafter", tags: ["Sobrevivência", "Construção"] },
  { id: "ranch-simulator", title: "Ranch Simulator", q: "Ranch Simulator", tags: ["Simulação", "Co-op"] },
  { id: "state-of-decay-2", title: "State of Decay 2", q: "State of Decay 2 Juggernaut", tags: ["Sobrevivência", "Zumbi"] },
  { id: "powerwash-simulator-2", title: "PowerWash Simulator 2", q: "PowerWash Simulator 2", tags: ["Simulação", "Relax"] },
  { id: "doom-eternal", title: "DOOM Eternal", q: "DOOM Eternal", tags: ["FPS", "Ação"] },
  { id: "tmnt-shredders-revenge", title: "TMNT: Shredder's Revenge", q: "Teenage Mutant Ninja Turtles Shredder's Revenge", tags: ["Beat'em up", "Co-op"] },
  { id: "sworn", title: "SWORN", q: "SWORN", tags: ["Roguelike", "Co-op"] },
  { id: "neon-abyss-2", title: "Neon Abyss 2", q: "Neon Abyss 2", tags: ["Roguelike", "Ação"] },
  { id: "megabonk", title: "Megabonk", q: "Megabonk", tags: ["Roguelike", "Ação"] },
  { id: "the-quarry", title: "The Quarry", q: "The Quarry", tags: ["Terror", "Narrativo"] },
  { id: "the-devourer", title: "The Devourer: Hunted Souls", q: "The Devourer Hunted Souls", tags: ["Terror", "Co-op"] },
  { id: "school-666", title: "School 666", q: "School 666", tags: ["Terror", "Co-op"] },
  { id: "hospital-666", title: "Hospital 666", q: "Hospital 666", tags: ["Terror", "Co-op"] },
  { id: "carry-the-glass", title: "Carry The Glass", q: "Carry The Glass", tags: ["Co-op", "Plataforma"] },
  { id: "rv-there-yet", title: "RV There Yet?", q: "RV There Yet", tags: ["Co-op", "Aventura"] },
  { id: "big-walk", title: "Big Walk", q: "Big Walk", tags: ["Co-op", "Aventura"] },
  { id: "drive-together", title: "Drive Together", q: "Drive Together", tags: ["Co-op", "Corrida"] },
  { id: "die-together", title: "Die Together", q: "Die Together", tags: ["Co-op", "Terror"] },
  { id: "dragonsword-awakening", title: "DragonSword: Awakening", q: "DragonSword Awakening", tags: ["RPG", "Ação"] },
  { id: "terracards", title: "Terracards", q: "Terracards", tags: ["Cartas", "Estratégia"] },
  { id: "no-time-to-relax", title: "No Time to Relax", q: "No Time to Relax", tags: ["Party", "Simulação"] },
  { id: "the-game-of-life-2", title: "The Game of Life 2", q: "The Game of Life 2", tags: ["Party", "Tabuleiro"] },
  { id: "unrailed-2", title: "Unrailed 2", q: "Unrailed 2", tags: ["Co-op", "Party"] },
  { id: "forza-horizon-5", title: "Forza Horizon 5", q: "Forza Horizon 5", tags: ["Corrida", "Mundo aberto"] },
  { id: "hytale", title: "Hytale", q: "Hytale", tags: ["Sandbox", "Aventura"] },
  { id: "zelda-botw", title: "Zelda: Breath of the Wild", q: "The Legend of Zelda Breath of the Wild", tags: ["Aventura", "Mundo aberto"] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchSteam(term) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=us`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    const items = (data.items || []).filter((i) => i.type === "app");
    return items[0] || null;
  } catch {
    return null;
  }
}

async function downloadCover(appid, slug) {
  const candidates = [
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
    `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 3000) {
          await writeFile(join(COVERS_DIR, `${slug}.jpg`), buf);
          return `covers/${slug}.jpg`;
        }
      }
    } catch {}
  }
  return null;
}

async function main() {
  await mkdir(COVERS_DIR, { recursive: true });
  await mkdir(dirname(DATA_OUT), { recursive: true });
  const out = [];
  let hits = 0,
    misses = 0;
  for (const g of GAMES) {
    const item = await searchSteam(g.q);
    let cover = null,
      appid = null,
      metascore = null;
    if (item) {
      appid = item.id;
      metascore = item.metascore ? Number(item.metascore) : null;
      cover = await downloadCover(appid, g.id);
    }
    if (cover) hits++;
    else misses++;
    out.push({
      id: g.id,
      title: g.title,
      tags: g.tags,
      steamAppId: appid,
      metascore,
      cover, // caminho relativo dentro de /public, ou null
      matchedName: item ? item.name : null,
    });
    console.log(`${cover ? "OK " : "-- "} ${g.title.padEnd(34)} appid=${appid ?? "?"} ${cover ? "" : "(sem capa)"}`);
    await sleep(250);
  }
  await writeFile(DATA_OUT, JSON.stringify(out, null, 2));
  console.log(`\nConcluido: ${hits} com capa, ${misses} sem capa. Salvo em ${DATA_OUT}`);
}

main();
