// Efeitos sonoros 8-bit gerados no navegador (Web Audio API, sem arquivos).
const LS = "ga_sfx_on";
let ctx = null;
let enabled = (() => {
  try { return localStorage.getItem(LS) !== "0"; } catch { return true; }
})();

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  return ctx;
}

// beep quadrado retrô
function beep(freq, dur = 0.08, type = "square", vol = 0.06) {
  if (!enabled) return;
  const a = ac();
  if (!a) return;
  if (a.state === "suspended") a.resume();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.setValueAtTime(vol, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

function seq(notes) {
  if (!enabled) return;
  const a = ac();
  if (!a) return;
  notes.forEach(([f, d, t], i) => {
    setTimeout(() => beep(f, d ?? 0.08, t ?? "square"), i * 70);
  });
}

export const sfx = {
  get enabled() { return enabled; },
  toggle() {
    enabled = !enabled;
    try { localStorage.setItem(LS, enabled ? "1" : "0"); } catch {}
    if (enabled) beep(660, 0.07);
    return enabled;
  },
  tick() { beep(320, 0.03, "square", 0.04); },
  select() { beep(520, 0.06); },
  star() { beep(880, 0.05, "square", 0.05); },
  save() { seq([[660], [880]]); },
  tier() { seq([[523], [784]]); },
  spin() { beep(200 + Math.random() * 300, 0.04, "square", 0.05); },
  win() { seq([[523], [659], [784], [1046, 0.16]]); },
};
