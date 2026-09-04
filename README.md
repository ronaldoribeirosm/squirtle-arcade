# 🎮 GANGUE ARCADE

Hub retro 8-bit da **Gangue dos Squirtles** pra organizar, avaliar e criar tier lists dos jogos que a galera joga.

- **Biblioteca** — todos os jogos com capa, sua nota, status (quero / jogando / zerado / dropei) e "jogaria de novo".
- **Sortear** — roleta que decide o jogo de hoje (filtra por "quero jogar" ou co-op).
- **Tier List** — monte seu tier (S → F) tocando nos jogos; ou veja o **tier do grupo** calculado pela média.
- **Ranking** — leaderboard dos jogos mais bem avaliados pela galera.
- **Perfil** — estatísticas suas (zerados, nota média, tier favorito) e som 8-bit on/off.
- **Multiplayer** — cada amigo tem um perfil; com o banco ligado, todo mundo vê as notas uns dos outros.

Feito com **React + Vite** no front e **serverless functions (`/api`) + Upstash Redis** no back. Visual arcade noturno "hidro", fontes pixel, bordas duras 8-bit e efeitos sonoros gerados no navegador.

---

## Como funciona o banco (auto-detecção)

O app testa `GET /api/data` no boot:

- **Respondeu JSON** → **modo compartilhado**: dados no Upstash Redis, sincroniza entre todo mundo (polling a cada 4s).
- **Não respondeu** (sem banco / dev local) → **modo local**: dados no `localStorage` do navegador.

O mesmo build funciona nos dois casos e "sobe de nível" sozinho assim que o banco é conectado.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` (roda em **modo local**, sem precisar de banco).

## Deploy na Vercel

O projeto já está pronto pra Vercel (Vite + funções em `/api` + `vercel.json`).

1. Deploy (feito via integração, ou `vercel --prod` com a CLI).
2. **Conectar o banco** — no dashboard da Vercel do projeto: **Storage → Create Database → Upstash (Redis)** e conecte ao projeto. Isso injeta as variáveis `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_*`, ambos são aceitos).
3. **Redeploy** pra pegar as variáveis. Pronto: modo compartilhado ao vivo.

Rodar com banco no dev local: crie um `.env` com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (o Vite não roda as `/api` — use `vercel dev` pra testar as funções localmente).

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
