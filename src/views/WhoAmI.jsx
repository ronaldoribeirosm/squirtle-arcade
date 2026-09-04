import { useState } from "react";
import { IconPlus, IconPlay } from "../components/Icons.jsx";
import { useArcade } from "../lib/store.jsx";
import { avatarColor, initials } from "../lib/util.js";

export default function WhoAmI() {
  const { profiles, chooseMe, addProfile } = useArcade();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    try { await addProfile(n); } finally { setBusy(false); setName(""); }
  };

  return (
    <div className="who-wrap">
      <div className="who">
        <div className="logo-mark">S</div>
        <h1>
          GANGUE <b>ARCADE</b>
        </h1>
        <p>Quem tá jogando? Escolhe seu perfil pra dar nota e ver a tier list da galera.</p>

        {profiles.length > 0 && (
          <div className="who-list">
            {profiles.map((p) => (
              <button key={p.id} className="who-btn" onClick={() => chooseMe(p.id)}>
                <span className="who-av" style={{ background: avatarColor(p.hue ?? p.name) }}>
                  {initials(p.name)}
                </span>
                <span className="who-name">{p.name}</span>
                <IconPlay width="18" height="18" style={{ color: "var(--hydro)" }} />
              </button>
            ))}
          </div>
        )}

        <form className="who-form" onSubmit={create}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={profiles.length ? "Ou cria um novo perfil..." : "Digite seu nome..."}
            maxLength={24}
            aria-label="Seu nome"
          />
          <button className="btn btn-primary" disabled={!name.trim() || busy} type="submit">
            <IconPlus width="18" height="18" /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
