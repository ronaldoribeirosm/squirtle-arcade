import Cover from "./Cover.jsx";
import { IconHeart } from "./Icons.jsx";
import { STATUS, TIER_VAR } from "../lib/util.js";

export default function GameCard({ game, mine, groupAvg, index, onOpen }) {
  const st = mine?.status ? STATUS[mine.status] : null;
  const hasScore = mine?.score != null && mine.score > 0;

  return (
    <button
      className="card"
      style={{ animationDelay: `${Math.min(index, 16) * 28}ms` }}
      onClick={() => onOpen(game)}
      aria-label={`Abrir ${game.title}`}
    >
      <Cover game={game} className="card-cover">
        {mine?.tier && (
          <span className="tier-flag" style={{ background: `var(${TIER_VAR[mine.tier]})` }}>
            {mine.tier}
          </span>
        )}
        {hasScore ? (
          <span className="score-chip">{mine.score}</span>
        ) : groupAvg != null ? (
          <span className="score-chip warm" title="Média do grupo">
            {groupAvg.toFixed(1)}
          </span>
        ) : null}
      </Cover>
      <div className="card-body">
        <div className="card-title">{game.title}</div>
        <div className="card-meta">
          {st ? (
            <span className={`status-pill ${st.cls}`}>
              <span className="dot" />
              {st.short}
            </span>
          ) : (
            <span className="status-pill st-none">
              <span className="dot" />
              —
            </span>
          )}
          {mine?.replay && (
            <span className="replay-tag" title="Jogaria de novo">
              <IconHeart filled width="14" height="14" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
