// "Banco" em cima do Vercel Blob (store privado linkado ao projeto).
//
// Blob sobrescreve a mesma chave de forma EVENTUALMENTE consistente (leitura
// pode voltar versão antiga). Pra evitar isso, cada gravação cria um arquivo
// IMUTÁVEL novo (state/<timestamp>-<rand>.json) e a leitura pega o mais recente
// via list() (que é consistente na hora). Arquivos antigos são podados.
//
// Guarda todo o estado num JSON: { profiles: [], ratings: [] }.
// Suficiente pra um grupo de amigos (baixa concorrência de escrita).
import { put, list, get, del } from "@vercel/blob";

const PREFIX = "state/";
const EMPTY = { profiles: [], ratings: [] };
const KEEP = 3; // quantas versões manter

function newestFirst(blobs) {
  return [...blobs].sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
}

async function readBlob(pathname) {
  const g = await get(pathname, { access: "private" });
  if (g?.stream) return await new Response(g.stream).text();
  if (g?.blob && typeof g.blob.text === "function") return await g.blob.text();
  throw new Error("blob sem conteúdo legível");
}

export async function getState() {
  const { blobs } = await list({ prefix: PREFIX });
  if (!blobs.length) return { ...EMPTY };
  const sorted = newestFirst(blobs);
  const txt = await readBlob(sorted[0].pathname);
  const s = JSON.parse(txt);
  return { profiles: s.profiles || [], ratings: s.ratings || [] };
}

export async function saveState(state) {
  const key = `${PREFIX}${String(Date.now()).padStart(15, "0")}-${Math.random().toString(36).slice(2, 8)}.json`;
  await put(key, JSON.stringify({ profiles: state.profiles || [], ratings: state.ratings || [] }), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  // poda versões antigas (best-effort)
  try {
    const { blobs } = await list({ prefix: PREFIX });
    const old = newestFirst(blobs).slice(KEEP);
    if (old.length) await Promise.all(old.map((b) => del(b.url)));
  } catch { /* ignora falha de limpeza */ }
}

export function hueFromString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}
