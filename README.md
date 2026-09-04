# 🎮 GANGUE ARCADE

Hub retro 8-bit da **Gangue dos Squirtles** pra organizar, avaliar e criar tier lists dos jogos que a galera joga.

- **Biblioteca** — todos os jogos com capa, sua nota, status (quero / jogando / zerado / dropei) e "jogaria de novo".
- **Sortear** — roleta que decide o jogo de hoje (filtra por "quero jogar" ou co-op).
- **Tier List** — monte seu tier (S → F) tocando nos jogos; ou veja o **tier do grupo** calculado pela média.
- **Ranking** — leaderboard dos jogos mais bem avaliados pela galera.
- **Perfil** — estatísticas suas (zerados, nota média, tier favorito) e som 8-bit on/off.
- **Multiplayer** — cada amigo tem um perfil; com o banco ligado, todo mundo vê as notas uns dos outros.

Feito com **React + Vite** no front e **serverless functions (`/api`) + Vercel Blob** no back. Visual arcade noturno "hidro", fontes pixel, bordas duras 8-bit e efeitos sonoros gerados no navegador.

---

## Como funciona o banco (auto-detecção)

O app testa `GET /api/data` no boot:

- **Respondeu JSON** → **modo compartilhado**: estado guardado no **Vercel Blob** (`lib/blobdb.mjs`), sincroniza entre todo mundo (polling a cada 4s).
- **Não respondeu** (sem token / dev local) → **modo local**: dados no `localStorage` do navegador.

O mesmo build funciona nos dois casos. O estado (`{ profiles, ratings }`) é gravado como arquivos JSON **imutáveis** (`state/<ts>-<rand>.json`) e a leitura pega o mais recente via `list()` — isso contorna a consistência eventual do Blob ao sobrescrever a mesma chave.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` (roda em **modo local**, sem precisar de banco).

## Deploy na Vercel

O projeto já está pronto pra Vercel (Vite + funções em `/api` + `vercel.json`).

1. `vercel --prod` (a CLI faz upload, builda e publica).
2. **Banco (Vercel Blob):** `vercel blob create-store <nome> --access private --yes` cria o store, linka ao projeto e injeta o `BLOB_READ_WRITE_TOKEN`. Depois `vercel --prod` de novo pra o runtime pegar o token.
3. Pronto: modo compartilhado ao vivo, sem página de pagamento.

Rodar com banco no dev local: `vercel env pull .env.local` traz o `BLOB_READ_WRITE_TOKEN`. O Vite não roda as `/api` — use `vercel dev` pra testar as funções localmente.

## Atualizando as capas dos jogos

Catálogo em `src/data/games.json`, capas em `public/covers/` (box-art vertical da Steam).

```bash
npm run fetch-covers    # rebaixa tudo (edite a lista de jogos no script)
```

Jogos sem box-art vertical usam um placeholder pixel-art gerado automaticamente.

## Build de produção

```bash
npm run build      # gera /dist
npm run preview
```

---

## Estrutura

```
api/                       # serverless functions (data / profile / rating)
lib/redis.mjs              # helper Upstash compartilhado pelas functions
scripts/fetch-covers.mjs   # baixa appid + capa de cada jogo (Steam)
src/data/games.json        # catálogo (gerado)
src/lib/                    # store (estado + backends api/local), games, util, sfx
src/components/             # Cover, Stars, GameCard, GameSheet, ProfilePanel, Icons
src/views/                  # Library, Sortear, Tierlist, Ranking, WhoAmI
src/index.css              # design system 8-bit completo
```
