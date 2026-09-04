import { getState } from "../lib/blobdb.mjs";

// GET /api/data -> { profiles, ratings }  (também serve de health-check)
export default async function handler(req, res) {
  try {
    const { profiles, ratings } = await getState();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ profiles, ratings });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
