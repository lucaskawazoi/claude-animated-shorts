// Camada de painel de jogo (DOM sobre o 3D): contadores em pílula, títulos amarelos, alerta ⚠, ícone ⏪, recompensa e legenda palavra a palavra.
// Todos os instantes vêm de T (palavras ditas). Cada elemento é função pura do tempo.
import React from "react";
import { staticFile } from "remotion";
import { T, words } from "./cues";
import { clamp, ease, lerp, outBack, prog } from "./kit";

export const FONT = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const W = 1080, H = 1920;

const stroke = (px: number, c = "#1c1208") => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: "stroke fill" as const, textShadow: `0 ${px * 0.5}px 0 ${c}` });
const pop = (t: number, t0: number, dur = 0.28) => { const u = prog(t, t0, t0 + dur); return u <= 0 ? 0 : outBack(u); };
const win = (t: number, a: number, b: number, fade = 0.2) => clamp(Math.min((t - a) / fade, (b - t) / fade));

// ---------- pílula de contador ----------
type Pill = { a: number; b: number; label: string; value?: (t: number) => string; x?: number; y?: number; unit?: string; tone?: "dark" | "red" | "green" | "gold" };
const PILLS: Pill[] = [
  { a: 0.1, b: T.resto, label: "CANA", value: () => "1 t", y: 440 },
  { a: T.oitenta, b: T.resto, label: "ETANOL", value: () => "85 L", y: 550, tone: "green" },
  { a: T.quinhentas, b: T.moenda - 0.2, label: "USINA", value: () => "500 t/h", y: 440 },
  { a: T.cemT, b: T.moenda - 0.2, label: "BAGAÇO", value: (t) => `${Math.round(lerp(0, 135, ease(t, T.cemT, T.porHora)))} t/h`, y: 550, tone: "red" },
  { a: T.bagaco, b: T.d1 - 0.2, label: "BAGAÇO", value: (t) => `${Math.round(lerp(0, 270, ease(t, T.bagaco, T.p1)))} kg por t`, y: 440, tone: "red" },
  { a: T.energia - 0.3, b: T.essaCaldeira + 1.6, label: "ENERGIA", value: () => "100% PRÓPRIA", y: 440, tone: "gold" },
  { a: T.devora, b: T.p3 + 0.1, label: "ÁLCOOL", value: (t) => `${lerp(0, 9, ease(t, T.devora + 0.8, T.nove + 0.3)).toFixed(0)}%`, y: 440, tone: "green" },
  { a: T.restoAgua - 0.1, b: T.p3 + 0.1, label: "ÁGUA", value: () => "91%", y: 550 },
  { a: T.enche, b: T.d4 - 0.1, label: "ETANOL", value: (t) => `${Math.round(lerp(0, 85, ease(t, T.enche, T.vinhaca + 0.5)))} L`, y: 440, tone: "green" },
  { a: T.dez - 0.2, b: T.p4 + 0.2, label: "VINHAÇA", value: () => "10 L por 1 L", y: 550, tone: "red" },
  { a: T.potassio, b: T.canais, label: "POTÁSSIO", value: () => "ADUBO GRÁTIS", y: 440, tone: "green" },
  { a: T.vende, b: T.casas - 0.2, label: "ENERGIA À VENDA", value: () => "SOBROU!", y: 440, tone: "gold" },
];
const TONE = { dark: "#15202bd9", red: "#7a1414e6", green: "#0f4a2ae6", gold: "#6a4a00e6" } as const;
const PillEl: React.FC<{ p: Pill; t: number }> = ({ p, t }) => {
  const k = win(t, p.a, p.b, 0.22); if (k <= 0) return null;
  const s = pop(t, p.a, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: p.y ?? 300, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${s})` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "10px 34px 14px", borderRadius: 60, background: TONE[p.tone ?? "dark"], border: "4px solid #ffffff33", boxShadow: "0 8px 0 #00000055" }}>
        <span style={{ fontFamily: FONT, fontSize: 38, color: "#cfe6ff", letterSpacing: 2 }}>{p.label}</span>
        <span style={{ fontFamily: FONT, fontSize: 64, color: "#fff", lineHeight: 1 }}>{p.value ? p.value(t) : ""}</span>
      </div>
    </div>
  );
};

// ---------- títulos amarelos (nome da peça nova) ----------
type Title = { a: number; text: string; len?: number };
const TITLES: Title[] = [
  { a: T.moenda, text: "MOENDA" }, { a: T.essaCaldeira, text: "CALDEIRA" }, { a: T.essaDorna, text: "DORNA DE FERMENTAÇÃO" },
  { a: T.essaDestilaria, text: "DESTILARIA" }, { a: T.essaFert, text: "FERTIRRIGAÇÃO" }, { a: T.parabens, text: "PARABÉNS, CHEFE!", len: 3.6 },
];
const TitleEl: React.FC<{ ti: Title; t: number }> = ({ ti, t }) => {
  const len = ti.len ?? 3.0, k = win(t, ti.a, ti.a + len, 0.25); if (k <= 0) return null;
  const s = pop(t, ti.a, 0.34), bob = Math.sin((t - ti.a) * 3) * 6;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 175 + bob, display: "flex", justifyContent: "center", opacity: k, transform: `rotate(-3.5deg) scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: ti.text.length > 16 ? 74 : ti.text.length > 12 ? 92 : 124, color: "#ffd400", textAlign: "center", lineHeight: 1, whiteSpace: "nowrap", ...stroke(14, "#3a2300") }}>{ti.text}</span>
    </div>
  );
};

// ---------- ícones ----------
const Alert: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const k = win(t, a, a + 1.5, 0.12); if (k <= 0) return null;
  const s = pop(t, a, 0.3) * (1 + 0.06 * Math.sin((t - a) * 18)), rot = Math.sin((t - a) * 22) * 4 * (1 - prog(t, a, a + 0.9));
  return (
    <div style={{ position: "absolute", left: W / 2 - 120, top: 100, width: 240, height: 240, opacity: k, transform: `scale(${s}) rotate(${rot}deg)` }}>
      <svg viewBox="0 0 100 100" width="240" height="240"><path d="M50 8 L96 90 L4 90 Z" fill="#ffc400" stroke="#2b1a00" strokeWidth="6" strokeLinejoin="round" /><rect x="45" y="34" width="10" height="30" rx="5" fill="#2b1a00" /><circle cx="50" cy="75" r="6" fill="#2b1a00" /></svg>
    </div>
  );
};
const Rewind: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const k = win(t, a, a + 1.3, 0.1); if (k <= 0) return null;
  const s = pop(t, a, 0.25);
  return (
    <>
      
      <div style={{ position: "absolute", left: 64, top: 130, width: 200, height: 120, opacity: k, transform: `scale(${s})` }}>
        <svg viewBox="0 0 100 60" width="200" height="120"><path d="M50 4 L50 56 L8 30 Z M92 4 L92 56 L50 30 Z" fill="#fff" stroke="#14202b" strokeWidth="5" strokeLinejoin="round" /></svg>
      </div>
    </>
  );
};
const Cross: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const k = win(t, a, b, 0.15); if (k <= 0) return null;
  const s = pop(t, a, 0.3);
  return (
    <div style={{ position: "absolute", left: W / 2 - 110, top: 120, width: 220, height: 220, opacity: k, transform: `scale(${s}) rotate(${Math.sin((t - a) * 14) * 3}deg)` }}>
      <svg viewBox="0 0 100 100" width="220" height="220"><path d="M18 18 L82 82 M82 18 L18 82" stroke="#14202b" strokeWidth="26" strokeLinecap="round" /><path d="M18 18 L82 82 M82 18 L18 82" stroke="#ff2d2d" strokeWidth="16" strokeLinecap="round" /></svg>
    </div>
  );
};

// ---------- recompensa final ----------
const Reward: React.FC<{ t: number }> = ({ t }) => {
  const a = T.casas, k = win(t, a, a + 5.6, 0.25); if (k <= 0) return null;
  const s = pop(t, a, 0.45), n = Math.round(lerp(0, 100, ease(t, a, a + 1.4)));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 330, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 56, color: "#fff", ...stroke(10) }}>ENERGIA PARA</span>
      <span style={{ fontFamily: FONT, fontSize: 150, color: "#5cff7a", lineHeight: 1, ...stroke(16, "#05381a") }}>+{n} MIL</span>
      <span style={{ fontFamily: FONT, fontSize: 96, color: "#ffd400", lineHeight: 1, ...stroke(14, "#3a2300") }}>CASAS</span>
      {Array.from({ length: 10 }, (_, i) => { const u = prog(t, a + 0.05 * i, a + 1.6), ang = (i / 10) * Math.PI * 2; return <span key={i} style={{ position: "absolute", top: 190 + Math.sin(ang) * 220 * u, left: 540 + Math.cos(ang) * 400 * u - 20, fontSize: 46, opacity: 1 - u * 0.9 }}>★</span>; })}
    </div>
  );
};

// ---------- legenda: uma palavra por vez ----------
const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < words.length; k++) if (t >= words[k].start - 0.04) i = k; else break;
  if (i < 0) return null;
  const w = words[i], next = words[i + 1], hold = next ? Math.min(next.start - 0.04, w.end + 0.28) : w.end + 0.3;
  if (t > hold) return null;
  const txt = w.text.replace(/[.,!?;:]/g, "").toUpperCase(), s = lerp(1.18, 1, prog(t, w.start - 0.04, w.start + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1325, display: "flex", justifyContent: "center", transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#fff", ...stroke(11, "#101820") }}>{txt}</span>
    </div>
  );
};

export const Hud: React.FC<{ t: number; captions?: boolean }> = ({ t, captions = true }) => {
  const alerts = [T.p1, T.p2, T.p3, T.p4], rews = [T.d1, T.d2, T.d3, T.d4];
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, overflow: "hidden" }}>
      <style>{`@font-face{font-family:'Baloo 2';font-weight:800;src:url(${staticFile("fonts/Baloo2-800.woff2")}) format('woff2');}`}</style>
      {PILLS.map((p, i) => <PillEl key={i} p={p} t={t} />)}
      {TITLES.map((ti, i) => <TitleEl key={i} ti={ti} t={t} />)}
      {alerts.map((a) => <Alert key={a} t={t} a={a} />)}
      {rews.map((a) => <Rewind key={a} t={t} a={a} />)}
      <Cross t={t} a={T.garapa} b={T.p2 - 0.1} />
      <Reward t={t} />
      {captions ? <Caption t={t} /> : null}
    </div>
  );
};
