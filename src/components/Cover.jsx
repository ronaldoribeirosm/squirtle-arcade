import { coverUrl } from "../lib/games.js";
import { coverColors } from "../lib/util.js";

// Placeholder pixel-art procedural (determinístico por id) pros jogos sem capa.
function Placeholder({ game }) {
  const { a, b, h } = coverColors(game.id);
  return (
    <div
      className="cover-ph"
      style={{
        background: `
          repeating-linear-gradient(45deg, oklch(1 0 0 / 0.05) 0 6px, transparent 6px 12px),
          linear-gradient(150deg, ${a}, ${b})`,
      }}
      aria-hidden="true"
    >
      {/* "estrelinhas" pixeladas */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.5,
          backgroundImage: `radial-gradient(oklch(1 0 0 / 0.8) 1px, transparent 1.4px)`,
          backgroundSize: `${18 + (h % 10)}px ${22 + (h % 8)}px`,
        }}
      />
      <span className="ph-title">{game.title}</span>
      <span className="ph-badge">NO COVER</span>
    </div>
  );
}

export default function Cover({ game, className = "", children }) {
  const src = coverUrl(game);
  return (
    <div className={className}>
      {src ? (
        <img src={src} alt={`Capa de ${game.title}`} loading="lazy" width="600" height="800" />
      ) : (
        <Placeholder game={game} />
      )}
      {children}
    </div>
  );
}
