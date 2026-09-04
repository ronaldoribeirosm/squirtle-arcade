// Helpers puros (sem dependências).

// hue determinístico a partir de uma string (nome/id) -> 0..360
export function hueFromString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

// cor viva pra avatares / placeholders
export function avatarColor(seed) {
  const h = typeof seed === "number" ? seed : hueFromString(seed);
  return `oklch(0.78 0.15 ${h})`;
}

// duas cores pro placeholder de capa (gradiente pixel)
export function coverColors(seed) {
  const h = hueFromString(seed);
  return {
    a: `oklch(0.55 0.14 ${h})`,
    b: `oklch(0.32 0.10 ${(h + 40) % 360})`,
    h,
  };
}

export function initials(name = "?") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const STATUS = {
  quero: { label: "Quero jogar", short: "Quero", cls: "st-quero", sel: "--warn", ink: "oklch(0.2 0.05 85)" },
  jogando: { label: "Jogando", short: "Jogando", cls: "st-jogando", sel: "--hydro", ink: "var(--hydro-ink)" },
  zerado: { label: "Zerado", short: "Zerado", cls: "st-zerado", sel: "--ok", ink: "oklch(0.2 0.05 150)" },
  dropei: { label: "Dropei", short: "Dropei", cls: "st-dropei", sel: "--bad", ink: "oklch(0.98 0 0)" },
};
export const STATUS_ORDER = ["quero", "jogando", "zerado", "dropei"];

export const TIERS = ["S", "A", "B", "C", "D", "F"];
export const TIER_VAR = {
  S: "--tier-s", A: "--tier-a", B: "--tier-b", C: "--tier-c", D: "--tier-d", F: "--tier-f",
};
export const TIER_RANK = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };

export function clampScore(n) {
  n = Math.round(Number(n));
  if (isNaN(n)) return null;
  return Math.max(0, Math.min(10, n));
}

// nota média formatada
export function fmt(n, dp = 1) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toFixed(dp);
}
