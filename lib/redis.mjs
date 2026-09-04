// Helper compartilhado pelas serverless functions em /api.
import { Redis } from "@upstash/redis";

export const PKEY = "ga:profiles";
export const RKEY = "ga:ratings";

// Lê as credenciais que a integração Upstash da Vercel injeta.
// Aceita tanto os nomes UPSTASH_* quanto KV_* (dependendo da integração).
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function hueFromString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}
