import { useMemo } from "react";
import Cover from "../components/Cover.jsx";
import { GAMES } from "../lib/games.js";
import { useArcade } from "../lib/store.jsx";
import { fmt } from "../lib/util.js";

export default function Ranking({ onOpen }) {
  const { ratings, gameRatings } = useArcade();

  const ranked = useMemo(() => {
    return GAMES.map((g) => {
      const ws = gameRatings(g.id).filter((r) => r.score != null && r.score > 0);
      const avg = ws.length ? ws.reduce((s, r) => s + r.score, 0) / ws.length : null;
      const zerou = gameRatings(g.id).filter((r) => r.status === "zerado").length;
      return { g, avg, votes: ws.length, zerou };
    })
      .filter((x) => x.avg != null)
      .sort((a, b) => b.avg - a.avg || b.votes - a.votes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratings]);

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">
            <span className="accent">RAN</span>KING
          </h1>
          <p className="view-sub">Os jogos mais bem avaliados pela Gangue</p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="empty">
          <div className="big">PLACAR VAZIO</div>
          <p>Ninguém deu nota ainda. Vá na Biblioteca e avalie os jogos que já jogou!</p>
        </div>
      ) : (
        <div className="rank-list">
          {ranked.map(({ g, avg, votes, zerou }, i) => (
            <button className="rank-row" key={g.id} onClick={() => onOpen(g)}>
              <span className={`rank-pos ${["gold", "silver", "bronze"][i] || ""}`}>{i + 1}º</span>
              <Cover game={g} className="rank-cover" />
              <div style={{ minWidth: 0 }}>
                <div className="rank-name">{g.title}</div>
                <div className="rank-info">
                  <span>{votes} {votes === 1 ? "voto" : "votos"}</span>
                  {zerou > 0 && <span>· {zerou} zerou</span>}
                  <span>· {g.tags[0]}</span>
                </div>
                <div className="meter" aria-hidden>
                  <i style={{ width: `${(avg / 10) * 100}%` }} />
                </div>
              </div>
              <span className="rank-score">
                <b className="tabular">{fmt(avg)}</b>
                <span>/ 10</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
