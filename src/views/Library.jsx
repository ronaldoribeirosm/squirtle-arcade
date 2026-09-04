import { useMemo, useState } from "react";
import GameCard from "../components/GameCard.jsx";
import { IconSearch } from "../components/Icons.jsx";
import { GAMES, ALL_TAGS } from "../lib/games.js";
import { useArcade } from "../lib/store.jsx";
import { STATUS, STATUS_ORDER } from "../lib/util.js";

const SORTS = {
  az: { label: "A–Z" },
  minha: { label: "Minha nota" },
  grupo: { label: "Nota do grupo" },
};

export default function Library({ onOpen }) {
  const { ratings, me, gameRatings, myRating } = useArcade();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(null);
  const [tag, setTag] = useState(null);
  const [sort, setSort] = useState("az");

  const avgOf = (id) => {
    const ws = gameRatings(id).filter((r) => r.score != null && r.score > 0);
    return ws.length ? ws.reduce((s, r) => s + r.score, 0) / ws.length : null;
  };

  const list = useMemo(() => {
    let g = GAMES.filter((game) => {
      if (q && !game.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (tag && !game.tags.includes(tag)) return false;
      if (status) {
        const mine = myRating(game.id);
        if (mine?.status !== status) return false;
      }
      return true;
    });
    if (sort === "minha") {
      g = [...g].sort((a, b) => (myRating(b.id)?.score || -1) - (myRating(a.id)?.score || -1));
    } else if (sort === "grupo") {
      g = [...g].sort((a, b) => (avgOf(b.id) ?? -1) - (avgOf(a.id) ?? -1));
    }
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, tag, sort, ratings, me]);

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">
            <span className="accent">BIBLIO</span>TECA
          </h1>
          <p className="view-sub">{GAMES.length} jogos no acervo da Gangue</p>
        </div>
      </div>

      <div className="toolbar">
        <label className="search">
          <IconSearch />
          <input
            type="search"
            placeholder="Buscar jogo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar jogo"
          />
        </label>
        <div className="chips">
          {Object.entries(SORTS).map(([k, s]) => (
            <button key={k} className="chip" aria-pressed={sort === k} onClick={() => setSort(k)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chips" style={{ marginBottom: "var(--s5)" }}>
        <button className="chip" aria-pressed={!status && !tag} onClick={() => { setStatus(null); setTag(null); }}>
          Tudo
        </button>
        {STATUS_ORDER.map((k) => (
          <button key={k} className="chip" aria-pressed={status === k} onClick={() => setStatus(status === k ? null : k)}>
            {STATUS[k].label}
          </button>
        ))}
        <span style={{ width: 2, background: "var(--line)", margin: "0 4px" }} aria-hidden />
        {ALL_TAGS.map((t) => (
          <button key={t} className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="big">SEM RESULTADOS</div>
          <p>Nenhum jogo bate com esse filtro. Tenta afrouxar a busca.</p>
        </div>
      ) : (
        <div className="grid">
          {list.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              mine={myRating(game.id)}
              groupAvg={avgOf(game.id)}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </>
  );
}
