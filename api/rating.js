import { getState, saveState } from "../lib/blobdb.mjs";

// POST /api/rating { profile_id, game_id, score?, status?, replay?, tier?, opinion? }
// Faz merge com o valor existente e devolve o resultado.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const b = req.body || {};
    if (!b.profile_id || !b.game_id) return res.status(400).json({ error: "bad-request" });
    const state = await getState();
    const i = state.ratings.findIndex((r) => r.profile_id === b.profile_id && r.game_id === b.game_id);
    const existing = i >= 0 ? state.ratings[i] : {};
    const merged = { ...existing, profile_id: b.profile_id, game_id: b.game_id, updated_at: new Date().toISOString() };
    for (const k of ["score", "status", "replay", "tier", "opinion"]) {
      if (k in b) merged[k] = b[k];
      else if (!(k in merged)) merged[k] = existing[k] ?? null;
    }
    if (i >= 0) state.ratings[i] = merged;
    else state.ratings.push(merged);
    await saveState(state);
    res.status(200).json(merged);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
