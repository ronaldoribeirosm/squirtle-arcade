import { useState } from "react";
import { useArcade } from "./lib/store.jsx";
import { IconLibrary, IconTier, IconTrophy, IconDice } from "./components/Icons.jsx";
import GameSheet from "./components/GameSheet.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import Library from "./views/Library.jsx";
import Tierlist from "./views/Tierlist.jsx";
import Ranking from "./views/Ranking.jsx";
import Sortear from "./views/Sortear.jsx";
import WhoAmI from "./views/WhoAmI.jsx";
import { avatarColor, initials } from "./lib/util.js";
import { sfx } from "./lib/sfx.js";

const TABS = [
  { id: "lib", label: "Biblioteca", Icon: IconLibrary, View: Library },
  { id: "sortear", label: "Sortear", Icon: IconDice, View: Sortear },
  { id: "tier", label: "Tier List", Icon: IconTier, View: Tierlist },
  { id: "rank", label: "Ranking", Icon: IconTrophy, View: Ranking },
];

export default function App() {
  const { ready, me, mode, toast } = useArcade();
  const [tab, setTab] = useState("lib");
  const [open, setOpen] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const go = (id) => { if (id !== tab) sfx.tick(); setTab(id); };

  if (!ready) {
    return (
      <div className="who-wrap">
        <div className="who">
          <div className="logo-mark" style={{ margin: "0 auto" }}>S</div>
          <p style={{ marginTop: "var(--s4)" }} className="pixel">CARREGANDO...</p>
        </div>
      </div>
    );
  }

  if (!me) return <WhoAmI />;

  const ActiveView = TABS.find((t) => t.id === tab).View;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <div className="logo-mark">S</div>
            <div className="logo-name">
              GANGUE <b>ARCADE</b>
              <span>Gangue dos Squirtles</span>
            </div>
          </div>

          <nav className="nav-tabs" aria-label="Seções">
            {TABS.map((t) => (
              <button key={t.id} className="nav-tab" aria-current={tab === t.id} onClick={() => go(t.id)}>
                <t.Icon width="18" height="18" /> {t.label}
              </button>
            ))}
          </nav>

          <button className="me-btn" onClick={() => setShowProfile(true)} title="Meu perfil">
            <span className="me-av" style={{ background: avatarColor(me.hue ?? me.name) }}>
              {initials(me.name)}
            </span>
            <span className="me-name">{me.name}</span>
          </button>
        </div>
      </header>

      {mode === "local" && (
        <div className="mode-banner">
          <div className="inner">
            Modo local — os dados ficam só nesse navegador. Conecte o banco (Upstash na Vercel) pra sincronizar com a galera ao vivo.
          </div>
        </div>
      )}

      <main className="main">
        <ActiveView onOpen={setOpen} />
      </main>

      <nav className="botnav" aria-label="Seções">
        {TABS.map((t) => (
          <button key={t.id} className="botnav-btn" aria-current={tab === t.id} onClick={() => go(t.id)}>
            <t.Icon /> {t.label}
          </button>
        ))}
      </nav>

      {open && <GameSheet game={open} onClose={() => setOpen(null)} />}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}
