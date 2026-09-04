import { useEffect, useRef, useState } from "react";
import Cover from "./Cover.jsx";
import Stars from "./Stars.jsx";
import { IconClose, IconHeart, IconCheck, IconPlay, IconWant, IconDrop } from "./Icons.jsx";
import { useArcade } from "../lib/store.jsx";
import { coverUrl } from "../lib/games.js";
import { sfx } from "../lib/sfx.js";
import { STATUS, STATUS_ORDER, TIERS, TIER_VAR, avatarColor, initials, fmt } from "../lib/util.js";

const STATUS_ICON = { quero: IconWant, jogando: IconPlay, zerado: IconCheck, dropei: IconDrop };

export default function GameSheet({ game, onClose }) {
  const { me, saveRating, myRating, gameRatings, profiles } = useArcade();
  const mine = myRating(game.id) || {};
  const [opinion, setOpinion] = useState(mine.opinion || "");
  const closeRef = useRef(null);
  const bg = coverUrl(game);

  useEffect(() => { setOpinion(mine.opinion || ""); /* eslint-disable-next-line */ }, [game.id]);

  // esc + trava scroll + foco inicial
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const others = gameRatings(game.id).filter((r) => r.profile_id !== me?.id);
  const withScore = gameRatings(game.id).filter((r) => r.score != null && r.score > 0);
  const avg = withScore.length ? withScore.reduce((s, r) => s + r.score, 0) / withScore.length : null;
  const nameOf = (id) => profiles.find((p) => p.id === id)?.name || "?";
  const hueOf = (id) => profiles.find((p) => p.id === id)?.hue;

  const set = (patch) => { sfx.select(); saveRating(game.id, patch); };

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet panel" role="dialog" aria-modal="true" aria-label={game.title}>
        <button ref={closeRef} className="sheet-close" onClick={onClose} aria-label="Fechar">
          <IconClose width="20" height="20" />
        </button>

        <div className="sheet-hero">
          {bg && <div className="sheet-hero-bg" style={{ backgroundImage: `url(${bg})` }} />}
          <Cover game={game} className="sheet-cover" />
          <div className="sheet-head">
            <h2 className="sheet-title">{game.title}</h2>
            <div className="sheet-tags">
              {game.tags.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
              {game.metascore && <span className="badge" style={{ color: "var(--tier-a)" }}>MC {game.metascore}</span>}
            </div>
          </div>
        </div>

        <div className="sheet-body">
          {/* NOTA */}
          <div className="field">
            <span className="field-label">Sua nota</span>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--s4)", flexWrap: "wrap" }}>
              <Stars value={mine.score || 0} onChange={(v) => set({ score: v })} size="lg" />
              <span className="pixel" style={{ fontSize: "1.2rem", color: mine.score ? "var(--hydro)" : "var(--muted)" }}>
                {mine.score ? `${mine.score}/10` : "—"}
              </span>
            </div>
          </div>

          {/* STATUS */}
          <div className="field">
            <span className="field-label">Status</span>
            <div className="seg">
              {STATUS_ORDER.map((k) => {
                const s = STATUS[k];
                const Ico = STATUS_ICON[k];
                const on = mine.status === k;
                return (
                  <button
                    key={k}
                    className="seg-btn"
                    aria-pressed={on}
                    style={on ? { "--sel": `var(${s.sel})`, "--sel-ink": s.ink } : undefined}
                    onClick={() => set({ status: on ? null : k })}
                  >
                    <Ico width="16" height="16" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* JOGARIA DE NOVO */}
          <div className="field">
            <span className="field-label">Jogaria de novo?</span>
            <div className="seg">
              <button
                className="seg-btn"
                aria-pressed={mine.replay === true}
                style={mine.replay === true ? { "--sel": "var(--warm)", "--sel-ink": "var(--warm-ink)" } : undefined}
                onClick={() => set({ replay: mine.replay === true ? null : true })}
              >
                <IconHeart filled={mine.replay === true} width="16" height="16" /> Com certeza
              </button>
              <button
                className="seg-btn"
                aria-pressed={mine.replay === false}
                style={mine.replay === false ? { "--sel": "var(--bad)", "--sel-ink": "oklch(0.98 0 0)" } : undefined}
                onClick={() => set({ replay: mine.replay === false ? null : false })}
              >
                Nunca mais
              </button>
            </div>
          </div>

          {/* TIER */}
          <div className="field">
            <span className="field-label">Seu tier</span>
            <div className="tier-pick">
              {TIERS.map((t) => {
                const on = mine.tier === t;
                return (
                  <button
                    key={t}
                    className="seg-btn"
                    aria-pressed={on}
                    style={on ? { "--sel": `var(${TIER_VAR[t]})`, "--sel-ink": "var(--bg)" } : { color: `var(${TIER_VAR[t]})` }}
                    onClick={() => set({ tier: on ? null : t })}
                  >
                    {t}
                  </button>
                );
              })}
              <button
                className="seg-btn"
                aria-pressed={!mine.tier}
                onClick={() => set({ tier: null })}
                aria-label="Sem tier"
              >
                —
              </button>
            </div>
          </div>

          {/* OPINIÃO */}
          <div className="field">
            <span className="field-label">O que você achou</span>
            <textarea
              className="opinion"
              placeholder="Escreve aí sua review sincera pra galera..."
              maxLength={500}
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              onBlur={() => { if (opinion !== (mine.opinion || "")) set({ opinion }); }}
            />
          </div>

          {/* GRUPO */}
          <div className="field">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--s3)", flexWrap: "wrap" }}>
              <span className="field-label">A galera achou</span>
              {avg != null && (
                <span className="avg-badge">
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>MÉDIA</span>
                  <b className="tabular">{fmt(avg)}</b>
                </span>
              )}
            </div>
            {others.length === 0 && withScore.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Ninguém mais avaliou ainda. Seja o primeiro a dar o veredito!
              </p>
            ) : (
              <div className="group-scores">
                {gameRatings(game.id)
                  .filter((r) => r.profile_id !== me?.id && (r.score != null || r.opinion || r.status || r.tier))
                  .map((r) => (
                    <div className="gs-row" key={r.profile_id}>
                      <span className="gs-avatar" style={{ background: avatarColor(hueOf(r.profile_id) ?? nameOf(r.profile_id)) }}>
                        {initials(nameOf(r.profile_id))}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="gs-name">
                          {nameOf(r.profile_id)}
                          {r.tier && (
                            <span className="badge" style={{ marginLeft: 8, color: `var(${TIER_VAR[r.tier]})`, padding: "1px 6px" }}>{r.tier}</span>
                          )}
                          {r.status && <span className="badge" style={{ marginLeft: 6, padding: "1px 6px", color: `var(${STATUS[r.status].sel})` }}>{STATUS[r.status].short}</span>}
                        </div>
                        {r.opinion && <div className="gs-op">"{r.opinion}"</div>}
                      </div>
                      {r.score != null && r.score > 0 && <span className="gs-score tabular">{r.score}</span>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
