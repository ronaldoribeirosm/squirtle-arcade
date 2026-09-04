import { useMemo, useState } from "react";
import Cover from "../components/Cover.jsx";
import { GAMES, GAME_BY_ID } from "../lib/games.js";
import { useArcade } from "../lib/store.jsx";
import { TIERS, TIER_VAR } from "../lib/util.js";
import { sfx } from "../lib/sfx.js";

// mapeia média 0..10 -> tier (visão do grupo)
function avgToTier(avg) {
  if (avg == null) return null;
  if (avg >= 9) return "S";
  if (avg >= 8) return "A";
  if (avg >= 7) return "B";
  if (avg >= 5) return "C";
  if (avg >= 3) return "D";
  return "F";
}

function TierDialog({ game, current, onPick, onClose }) {
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tier-dialog panel" role="dialog" aria-modal="true" aria-label={`Tier de ${game.title}`}>
        <div className="tier-dialog-head">
          <Cover game={game} className="tier-dialog-cover" />
          <div>
            <div className="tier-dialog-title">{game.title}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Escolha o tier</div>
          </div>
        </div>
        <div className="tier-dialog-grid">
          {TIERS.map((t) => (
            <button
              key={t}
              className="tier-dialog-btn"
              aria-pressed={current === t}
              style={{ background: `var(${TIER_VAR[t]})`, color: "var(--bg)", outline: current === t ? "3px solid var(--ink)" : "none", outlineOffset: 2 }}
              onClick={() => onPick(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--s2)" }}>
          {current && (
            <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => onPick(null)}>
              Tirar da lista
            </button>
          )}
          <button className="btn btn-sm" style={{ flex: 1 }} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tierlist({ onOpen }) {
  const { me, ratings, myRating, saveRating, gameRatings } = useArcade();
  const [mode, setMode] = useState("meu"); // meu | grupo
  const [active, setActive] = useState(null); // game id com popover aberto

  const avgOf = (id) => {
    const ws = gameRatings(id).filter((r) => r.score != null && r.score > 0);
    return ws.length ? ws.reduce((s, r) => s + r.score, 0) / ws.length : null;
  };

  // tier de cada jogo conforme o modo
  const tierOf = (id) => (mode === "meu" ? myRating(id)?.tier || null : avgToTier(avgOf(id)));

  const buckets = useMemo(() => {
    const b = { S: [], A: [], B: [], C: [], D: [], F: [], none: [] };
    GAMES.forEach((g) => {
      const t = tierOf(g.id);
      (b[t] || b.none).push(g);
    });
    return b;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ratings, me]);

  const editable = mode === "meu";
  const activeGame = active ? GAME_BY_ID[active] : null;

  return (
    <>
      <div className="view-head">
        <div>
          <h1 className="view-title">
            TIER <span className="accent">LIST</span>
          </h1>
          <p className="view-sub">
            {editable ? "Toque num jogo pra escolher o tier" : "Ranking automático pela média da galera"}
          </p>
        </div>
        <div className="chips">
          <button className="chip" aria-pressed={mode === "meu"} onClick={() => setMode("meu")}>
            Meu tier
          </button>
          <button className="chip" aria-pressed={mode === "grupo"} onClick={() => setMode("grupo")}>
            Tier do grupo
          </button>
        </div>
      </div>

      <div className="tier-rows">
        {TIERS.map((t) => (
          <div className="tier-row" key={t}>
            <div className="tier-key" style={{ background: `var(${TIER_VAR[t]})` }}>
              {t}
            </div>
            <div className="tier-drop">
              {buckets[t].length === 0 ? (
                <span className="tier-empty">vazio</span>
              ) : (
                buckets[t].map((g) => (
                  <div
                    key={g.id}
                    className="tier-item"
                    onClick={() => (editable ? setActive(active === g.id ? null : g.id) : onOpen(g))}
                    title={g.title}
                  >
                    <Cover game={g} className="cover-fill" />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {editable && (
        <div className="tray">
          <div className="tray-head">
            <span className="field-label">Ainda sem tier ({buckets.none.length})</span>
            <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>toque pra classificar</span>
          </div>
          <div className="tray-grid">
            {buckets.none.map((g) => (
              <div
                key={g.id}
                className="tier-item"
                onClick={() => setActive(active === g.id ? null : g.id)}
                title={g.title}
              >
                <Cover game={g} className="cover-fill" />
              </div>
            ))}
          </div>
        </div>
      )}

      {editable && activeGame && (
        <TierDialog
          game={activeGame}
          current={myRating(activeGame.id)?.tier || null}
          onPick={(nt) => { if (nt) sfx.tier(); saveRating(activeGame.id, { tier: nt }); setActive(null); }}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
