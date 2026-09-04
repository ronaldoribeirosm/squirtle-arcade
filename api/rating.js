import { getRedis, RKEY } from "../lib/redis.mjs";

// POST /api/rating { profile_id, game_id, score?, status?, replay?, tier?, opinion? }
// Faz merge com o valor existente (campo atômico no hash) e devolve o resultado.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const redis = getRedis();
  if (!redis) return res.status(503).json({ error: "no-db" });
  try {
    const b = req.body || {};
    if (!b.profile_id || !b.game_id) return res.status(400).json({ error: "bad-request" });
    const field = `${b.profile_id}::${b.game_id}`;
    const existing = (await redis.hget(RKEY, field)) || {};
    const merged = {
      ...existing,
      profile_id: b.profile_id,
      game_id: b.game_id,
      score: b.score ?? existing.score ?? null,
      status: b.status ?? existing.status ?? null,
      replay: b.replay ?? existing.replay ?? null,
      tier: b.tier ?? existing.tier ?? null,
      opinion: b.opinion ?? existing.opinion ?? null,
      updated_at: new Date().toISOString(),
    };
    // campos explicitamente enviados como null sobrescrevem (limpar)
    for (const k of ["score", "status", "replay", "tier", "opinion"]) {
      if (k in b) merged[k] = b[k];
    }
    await redis.hset(RKEY, { [field]: merged });
    res.status(200).json(merged);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
