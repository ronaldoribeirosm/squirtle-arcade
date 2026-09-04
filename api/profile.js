import { randomUUID } from "node:crypto";
import { getState, saveState, hueFromString } from "../lib/blobdb.mjs";

// POST /api/profile { name } -> profile
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try {
    const name = (req.body?.name || "").toString().trim().slice(0, 24);
    if (!name) return res.status(400).json({ error: "name-required" });
    const state = await getState();
    const p = { id: randomUUID(), name, hue: hueFromString(name), created_at: new Date().toISOString() };
    state.profiles.push(p);
    await saveState(state);
    res.status(200).json(p);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
