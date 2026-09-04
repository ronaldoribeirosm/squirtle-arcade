import { useMemo, useRef, useState } from "react";
import Cover from "../components/Cover.jsx";
import { IconPlay, IconStar } from "../components/Icons.jsx";
import { GAMES } from "../lib/games.js";
import { useArcade } from "../lib/store.jsx";
import { sfx } from "../lib/sfx.js";
import { STATUS, TIER_VAR } from "../lib/util.js";

const FILTERS = {
  tudo: { label: "Todos" },
  quero: { label: "Quero jogar" },
  coop: { label: "Co-op / Party" },
};

export default function Sortear({ onOpen }) {
  const { myRating } = useArcade();
  const [filter, setFilter] = useState("tudo");
  const [current, setCurrent] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);
  const timer = useRef(null);

  const pool = useMemo(() => {
    let p = GAMES;
    if (filter === "quero") {
      const q = GAMES.filter((g) => myRating(g.id)?.status === "quero");
      p = q.length ? q : GAMES;
    } else if (filter === "coop") {
      p = GAMES.filter((g) => g.tags.some((t) => t === "Co-op" || t === "Party"));
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const spin = () => {
    if (spinning || pool.length === 0) return;
    clearInterval(timer.current);
    setSpinning(true);
    setLanded(false);
    const start = Date.now();
    const total = 2000 + Math.random() * 600;
    let delay = 60;
    const tick = () => {
      const g = pool[Math.floor(Math.random() * pool.length)];
      setCurrent(g);
      sfx.spin();
      const elapsed = Date.now() - start;
      if (elapsed >= total) {
        setSpinning(false);
        setLanded(true);
        sfx.win();
        return;
      }
      // desacelera no fim
      if (elapsed > total * 0.6) delay += 22;
      timer.current = setTimeout(tick, delay);
    };
    tick();
  };

  const mine = current ? myRating(current.id) : null;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">
            BORA <span className="accent">JOGAR</span>
          </h1>
          <p className="view-sub">Deixa a máquina decidir o jogo de hoje</p>
        </div>
        <div className="chips">
          {Object.entries(FILTERS).map(([k, f]) => (
            <button key={k} className="chip" aria-pressed={filter === k} onClick={() => { setFilter(k); sfx.tick(); }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="slot">
        <div className={`slot-screen ${spinning ? "spinning" : ""} ${landed ? "landed" : ""}`}>
          {current ? (
            <>
              <Cover game={current} className="slot-cover" />
              {landed && mine?.tier && (
                <span className="tier-flag" style={{ background: `var(${TIER_VAR[mine.tier]})` }}>{mine.tier}</span>
              )}
            </>
          ) : (
            <div className="slot-empty pixel">?</div>
          )}
        </div>

        <div className="slot-info">
          {current ? (
            <>
              <div className="slot-title">{current.title}</div>
              <div className="slot-tags">
                {current.tags.map((t) => <span key={t} className="badge">{t}</span>)}
              </div>
              {landed && (
                <div className="slot-actions">
                  <button className="btn btn-primary" onClick={() => { sfx.select(); onOpen(current); }}>
                    <IconPlay width="18" height="18" /> Abrir / avaliar
                  </button>
                  <button className="btn" onClick={spin}>Girar de novo</button>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              {pool.length} jogos no sorteio. Aperta o botão!
            </p>
          )}
        </div>

        {!landed && (
          <button className="slot-lever" onClick={spin} disabled={spinning}>
            <IconStar filled width="22" height="22" />
            {spinning ? "SORTEANDO..." : "GIRAR"}
          </button>
        )}
      </div>
    </>
  );
}
