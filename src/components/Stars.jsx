import { useState } from "react";
import { IconStar } from "./Icons.jsx";

/* Nota de 0 a 10 usando 5 estrelas (cada metade = 1 ponto).
   Clique na metade esquerda = ímpar, direita = par. Simplificado:
   clique numa estrela = nota cheia daquela estrela; long/again ajusta.
   Pra manter mobile-simples: cada estrela vale 2 pontos, clicar 2x na
   última marca meia (ponto ímpar). Mostramos passos inteiros 0..10. */
export default function Stars({ value, onChange, size = "" }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value ?? 0; // 0..10

  const handle = (starIndex, e) => {
    // starIndex 1..5 ; detecta metade pelo x do clique
    const rect = e.currentTarget.getBoundingClientRect();
    const half = (e.clientX - rect.left) / rect.width < 0.5;
    const points = starIndex * 2 - (half ? 1 : 0); // 1..10
    onChange(points === value ? 0 : points);
  };

  return (
    <div className={`stars ${size}`} role="group" aria-label="Nota de 0 a 10">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = shown >= i * 2;
        const half = !full && shown >= i * 2 - 1;
        return (
          <button
            key={i}
            type="button"
            className={`star-btn ${full || half ? "on" : ""}`}
            aria-label={`${i * 2} pontos`}
            onClick={(e) => handle(i, e)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const h = (e.clientX - rect.left) / rect.width < 0.5;
              setHover(i * 2 - (h ? 1 : 0));
            }}
            onMouseLeave={() => setHover(null)}
          >
            {half ? <HalfStar /> : <IconStar filled={full} />}
          </button>
        );
      })}
    </div>
  );
}

function HalfStar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5 14.6 9l6 .8-4.4 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.4 9.8 9.4 9 12 3.5Z"
        fill="url(#half)"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
