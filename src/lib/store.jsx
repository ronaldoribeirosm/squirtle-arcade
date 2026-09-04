import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { hueFromString } from "./util.js";

/* ------------------------------------------------------------------ *
 * Dois backends:
 *  - apiBackend   -> serverless /api + Upstash Redis (compartilhado)
 *  - localBackend -> localStorage (offline / dev sem banco)
 * O app testa /api/data no boot e escolhe automaticamente.
 * ------------------------------------------------------------------ */

const LS_PROFILES = "ga_profiles_v1";
const LS_RATINGS = "ga_ratings_v1";
const LS_ME = "ga_me_v1";

const readLS = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; }
};
const writeLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const localBackend = {
  async getState() {
    return { profiles: readLS(LS_PROFILES, []), ratings: readLS(LS_RATINGS, []) };
  },
  async createProfile({ name }) {
    const list = readLS(LS_PROFILES, []);
    const p = { id: crypto.randomUUID(), name, hue: hueFromString(name), created_at: new Date().toISOString() };
    list.push(p);
    writeLS(LS_PROFILES, list);
    return p;
  },
  async upsertRating(r) {
    const list = readLS(LS_RATINGS, []);
    const i = list.findIndex((x) => x.profile_id === r.profile_id && x.game_id === r.game_id);
    const next = { ...(i >= 0 ? list[i] : {}), ...r, updated_at: new Date().toISOString() };
    if (i >= 0) list[i] = next; else list.push(next);
    writeLS(LS_RATINGS, list);
    return next;
  },
  subscribe(cb) {
    const h = (e) => { if (e.key === LS_RATINGS || e.key === LS_PROFILES) cb(); };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  },
};

async function jpost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

const apiBackend = {
  async getState() {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) throw new Error("api/data " + res.status);
    return res.json();
  },
  async createProfile({ name }) { return jpost("/api/profile", { name }); },
  async upsertRating(r) { return jpost("/api/rating", r); },
  subscribe(cb) {
    const id = setInterval(cb, 4000);
    const onFocus = () => cb();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("focus", onFocus); };
  },
};

async function pickBackend() {
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    const ct = res.headers.get("content-type") || "";
    // só conta como banco ligado se a API responder JSON de verdade
    // (o dev server do Vite devolve index.html pra rotas desconhecidas)
    if (res.ok && ct.includes("application/json")) {
      await res.clone().json();
      return { backend: apiBackend, mode: "shared" };
    }
  } catch { /* sem api / 503 / html */ }
  return { backend: localBackend, mode: "local" };
}

/* ------------------------------------------------------------------ *
 * Context
 * ------------------------------------------------------------------ */

const Ctx = createContext(null);
export const useArcade = () => useContext(Ctx);

export function ArcadeProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [meId, setMeId] = useState(() => localStorage.getItem(LS_ME));
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("local");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const backendRef = useRef(localBackend);

  const refresh = useCallback(async () => {
    const { profiles: ps, ratings: rs } = await backendRef.current.getState();
    setProfiles(ps || []);
    setRatings(rs || []);
  }, []);

  useEffect(() => {
    let alive = true;
    let unsub = null;
    (async () => {
      const { backend, mode: m } = await pickBackend();
      if (!alive) return;
      backendRef.current = backend;
      setMode(m);
      try { await refresh(); } catch (e) { console.error(e); }
      if (!alive) return;
      setReady(true);
      unsub = backend.subscribe(() => refresh().catch(() => {}));
    })();
    return () => { alive = false; unsub && unsub(); };
  }, [refresh]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const me = useMemo(() => profiles.find((p) => p.id === meId) || null, [profiles, meId]);

  const chooseMe = useCallback((id) => {
    setMeId(id);
    localStorage.setItem(LS_ME, id);
  }, []);

  const addProfile = useCallback(async (name) => {
    const p = await backendRef.current.createProfile({ name: name.trim().slice(0, 24) });
    setProfiles((prev) => [...prev, p]);
    chooseMe(p.id);
    return p;
  }, [chooseMe]);

  const logout = useCallback(() => {
    setMeId(null);
    localStorage.removeItem(LS_ME);
  }, []);

  const saveRating = useCallback(async (gameId, patch) => {
    if (!me) return;
    const existing = ratings.find((r) => r.profile_id === me.id && r.game_id === gameId) || {};
    const optimistic = { ...existing, profile_id: me.id, game_id: gameId, ...patch };
    setRatings((prev) => {
      const i = prev.findIndex((r) => r.profile_id === me.id && r.game_id === gameId);
      const copy = [...prev];
      if (i >= 0) copy[i] = optimistic; else copy.push(optimistic);
      return copy;
    });
    try {
      const saved = await backendRef.current.upsertRating({
        profile_id: me.id,
        game_id: gameId,
        ...patch,
        score: optimistic.score ?? null,
        status: optimistic.status ?? null,
        replay: optimistic.replay ?? null,
        tier: optimistic.tier ?? null,
        opinion: optimistic.opinion ?? null,
      });
      setRatings((prev) => {
        const i = prev.findIndex((r) => r.profile_id === me.id && r.game_id === gameId);
        const copy = [...prev];
        if (i >= 0) copy[i] = saved; else copy.push(saved);
        return copy;
      });
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar ✕");
      refresh().catch(() => {});
    }
  }, [me, ratings, showToast, refresh]);

  const value = {
    ready,
    mode,
    profiles,
    ratings,
    me,
    chooseMe,
    addProfile,
    logout,
    saveRating,
    showToast,
    toast,
    myRating: (gameId) => (me ? ratings.find((r) => r.profile_id === me.id && r.game_id === gameId) : null),
    gameRatings: (gameId) => ratings.filter((r) => r.game_id === gameId),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
