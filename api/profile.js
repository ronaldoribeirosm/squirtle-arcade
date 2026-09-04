import { randomUUID } from "node:crypto";
import { getRedis, PKEY, hueFromString } from "../lib/redis.mjs";

// POST /api/profile { name } -> profile
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const redis = getRedis();
  if (!redis) return res.status(503).json({ error: "no-db" });
  try {
    const name = (req.body?.name || "").toString().trim().slice(0, 24);
    if (!name) return res.status(400).json({ error: "name-required" });
    const p = { id: randomUUID(), name, hue: hueFromString(name), created_at: new Date().toISOString() };
    await redis.hset(PKEY, { [p.id]: p });
    res.status(200).json(p);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
