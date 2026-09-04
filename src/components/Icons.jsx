// Ícones SVG (stroke consistente 2px). Sem emoji.
const base = {
  width: 24, height: 24, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round", strokeLinejoin: "round",
};

export const IconSearch = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconLibrary = (p) => (
  <svg {...base} {...p}><rect x="3" y="4" width="7" height="16" rx="1" /><rect x="14" y="4" width="7" height="16" rx="1" /></svg>
);
export const IconTier = (p) => (
  <svg {...base} {...p}><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /></svg>
);
export const IconTrophy = (p) => (
  <svg {...base} {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></svg>
);
export const IconStar = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 3.5 14.6 9l6 .8-4.4 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.4 9.8 9.4 9 12 3.5Z" />
  </svg>
);
export const IconHeart = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-9.3-8.5C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.3 7C19 15.6 12 20 12 20Z" />
  </svg>
);
export const IconClose = (p) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconPlay = (p) => (
  <svg {...base} {...p}><path d="M6 4v16l14-8-14-8Z" fill="currentColor" /></svg>
);
export const IconPlus = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconUser = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const IconWant = (p) => (
  <svg {...base} {...p}><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>
);
export const IconDrop = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" /></svg>
);
export const IconLogout = (p) => (
  <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
);
export const IconDice = (p) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none" /></svg>
);
export const IconSound = ({ on, ...p }) => (
  <svg {...base} {...p}><path d="M11 5 6 9H3v6h3l5 4V5Z" />{on ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <path d="m22 9-6 6M16 9l6 6" />}</svg>
);
