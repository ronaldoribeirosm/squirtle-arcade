import { useEffect, useMemo, useState } from "react";
import { IconClose, IconLogout } from "./Icons.jsx";
import { useArcade } from "../lib/store.jsx";
import { avatarColor, initials, fmt, STATUS, TIER_VAR, TIERS } from "../lib/util.js";
import { sfx } from "../lib/sfx.js";

export default function ProfilePanel({ onClose }) {
  const { me, ratings, logout } = useArcade();
  const [soundOn, setSoundOn] = useState(sfx.enabled);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stats = useMemo(() => {
    const mine = ratings.filter((r) => r.profile_id === me?.id);
    const byStatus = { zerado: 0, jogando: 0, quero: 0, dropei: 0 };
    const tierCount = {};
    let scoreSum = 0, scoreN = 0, replayYes = 0;
    mine.forEach((r) => {
      if (r.status && byStatus[r.status] != null) byStatus[r.status]++;
      if (r.tier) tierCount[r.tier] = (tierCount[r.tier] || 0) + 1;
      if (r.score != null && r.score > 0) { scoreSum += r.score; scoreN++; }
      if (r.replay === true) replayYes++;
    });
    const topTier = TIERS.find((t) => t === Object.entries(tierCount).sort((a, b) => b[1] - a[1])[0]?.[0]) || null;
    return {
      total: mine.length,
      byStatus,
      avg: scoreN ? scoreSum / scoreN : null,
      topTier,
      replayYes,
      rated: scoreN,
    };
  }, [ratings, me]);

  if (!me) return null;

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-panel panel" role="dialog" aria-modal="true" aria-label="Meu perfil">
        <button className="sheet-close" onClick={onClose} aria-label="Fechar">
          <IconClose width="20" height="20" />
        </button>

        <div className="pp-head">
          <span className="pp-av" style={{ background: avatarColor(me.hue ?? me.name) }}>{initials(me.name)}</span>
          <div>
            <div className="pp-name">{me.name}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{stats.total} jogos na sua ficha</div>
          </div>
        </div>

        <div className="pp-grid">
          <div className="pp-stat"><b className="tabular">{stats.byStatus.zerado}</b><span>Zerados</span></div>
          <div className="pp-stat"><b className="tabular">{stats.byStatus.jogando}</b><span>Jogando</span></div>
          <div className="pp-stat"><b className="tabular">{stats.byStatus.quero}</b><span>Quero jogar</span></div>
          <div className="pp-stat"><b className="tabular">{stats.byStatus.dropei}</b><span>Dropados</span></div>
          <div className="pp-stat"><b className="tabular">{fmt(stats.avg)}</b><span>Nota média</span></div>
          <div className="pp-stat">
            <b style={{ color: stats.topTier ? `var(${TIER_VAR[stats.topTier]})` : "var(--muted)" }}>{stats.topTier || "—"}</b>
            <span>Tier favorito</span>
          </div>
        </div>

        <div className="pp-line">
          <span style={{ color: "var(--warm)", fontWeight: 700 }}>{stats.replayYes}</span>
          <span style={{ color: "var(--muted)" }}>jogos que você jogaria de novo</span>
        </div>

        <div className="pp-actions">
          <button
            className="btn btn-sm"
            aria-pressed={soundOn}
            onClick={() => setSoundOn(sfx.toggle())}
          >
            Som 8-bit: {soundOn ? "ligado" : "desligado"}
          </button>
          <button className="btn btn-sm" onClick={() => { onClose(); logout(); }}>
            <IconLogout width="16" height="16" /> Trocar de perfil
          </button>
        </div>
      </div>
    </div>
  );
}
