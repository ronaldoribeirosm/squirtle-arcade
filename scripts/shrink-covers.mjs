// Re-baixa as capas em 1x (600x900, ~50KB) sobre as 2x pra aliviar o deploy.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const games = JSON.parse(await readFile(join(ROOT, "src/data/games.json"), "utf8"));

let ok = 0;
for (const g of games) {
  if (!g.cover || !g.steamAppId) continue;
  const url = `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamAppId}/library_600x900.jpg`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 3000) {
        await writeFile(join(ROOT, "public", g.cover), buf);
        ok++;
        process.stdout.write(".");
      }
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 120));
}
console.log(`\n${ok} capas reduzidas para 1x.`);
