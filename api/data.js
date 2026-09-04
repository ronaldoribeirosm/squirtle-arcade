import { getRedis, PKEY, RKEY } from "../lib/redis.mjs";

// GET /api/data -> { profiles, ratings }  (também serve de health-check)
export default async function handler(req, res) {
  const redis = getRedis();
  if (!redis) return res.status(503).json({ error: "no-db" });
  try {
    const [pmap, rmap] = await Promise.all([redis.hgetall(PKEY), redis.hgetall(RKEY)]);
    const profiles = pmap ? Object.values(pmap) : [];
    const ratings = rmap ? Object.values(rmap) : [];
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ profiles, ratings });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
