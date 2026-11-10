// Painel de jogo (DOM sobre o 3D): contadores em pílula, títulos amarelos, ⚠, ⏪, ✖, carimbo do bordão
// «¿SIN MOTORES? ¡CON INGENIO!», recompensa e legenda palavra a palavra. Os dados vêm do episódio (EP.HUD).
import React from "react";
import { staticFile } from "remotion";
import { EP } from "../ep/current";
import { words } from "./cues";
import { clamp, ease, lerp, outBack, prog } from "./kit";

export const FONT = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const W = 1080, H = 1920;
export const stroke = (px: number, c = "#1c1208") => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: "stroke fill" as const, textShadow: `0 ${px * 0.5}px 0 ${c}` });
export const pop = (t: number, t0: number, dur = 0.28) => { const u = prog(t, t0, t0 + dur); return u <= 0 ? 0 : outBack(u); };
export const win = (t: number, a: number, b: number, fade = 0.2) => clamp(Math.min((t - a) / fade, (b - t) / fade));

export type Pill = { a: number; b: number; label: string; value?: (t: number) => string; y?: number; tone?: "dark" | "red" | "green" | "gold" };
export type Title = { a: number; text: string; len?: number };
export type Reward = { a: number; len: number; top: string; big: (t: number) => string; sub: string };
export type HudData = { pills: Pill[]; titles: Title[]; alerts: number[]; rewinds: number[]; crosses: [number, number][]; stamps: [number, number][]; reward: Reward; Extra?: React.FC<{ t: number }> };

/** contador que sobe de a até b entre t0 e t1, com separador de milhar em espanhol */
export const count = (t: number, t0: number, t1: number, a: number, b: number, dec = 0) => {
  const v = lerp(a, b, ease(t, t0, t1));
  return dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("es-ES").replace(/ /g, ".").replace(/,/g, ".");
};

const TONE = { dark: "#15202bd9", red: "#7a1414e6", green: "#0f4a2ae6", gold: "#6a4a00e6" } as const;
const PillEl: React.FC<{ p: Pill; t: number }> = ({ p, t }) => {
  const k = win(t, p.a, p.b, 0.22); if (k <= 0) return null;
  const s = pop(t, p.a, 0.3);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: p.y ?? 440, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${s})` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "10px 34px 14px", borderRadius: 60, background: TONE[p.tone ?? "dark"], border: "4px solid #ffffff33", boxShadow: "0 8px 0 #00000055" }}>
        <span style={{ fontFamily: FONT, fontSize: 38, color: "#cfe6ff", letterSpacing: 2 }}>{p.label}</span>
        <span style={{ fontFamily: FONT, fontSize: 64, color: "#fff", lineHeight: 1 }}>{p.value ? p.value(t) : ""}</span>
      </div>
    </div>
  );
};

const TitleEl: React.FC<{ ti: Title; t: number; next: number }> = ({ ti, t, next }) => {
  const len = Math.min(ti.len ?? 3.0, next - ti.a - 0.12), k = win(t, ti.a, ti.a + len, 0.25); if (k <= 0) return null;
  const s = pop(t, ti.a, 0.34), bob = Math.sin((t - ti.a) * 3) * 6;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 175 + bob, display: "flex", justifyContent: "center", opacity: k, transform: `rotate(-3.5deg) scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: ti.text.length > 16 ? 76 : ti.text.length > 12 ? 94 : 124, color: "#ffd400", textAlign: "center", lineHeight: 1, whiteSpace: "nowrap", ...stroke(14, "#3a2300") }}>{ti.text}</span>
    </div>
  );
};

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
  return (
    <div style={{ position: "absolute", left: 64, top: 130, width: 200, height: 120, opacity: k, transform: `scale(${pop(t, a, 0.25)})` }}>
      <svg viewBox="0 0 100 60" width="200" height="120"><path d="M50 4 L50 56 L8 30 Z M92 4 L92 56 L50 30 Z" fill="#fff" stroke="#14202b" strokeWidth="5" strokeLinejoin="round" /></svg>
    </div>
  );
};
const Cross: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const k = win(t, a, b, 0.15); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: W / 2 - 110, top: 120, width: 220, height: 220, opacity: k, transform: `scale(${pop(t, a, 0.3)}) rotate(${Math.sin((t - a) * 14) * 3}deg)` }}>
      <svg viewBox="0 0 100 100" width="220" height="220"><path d="M18 18 L82 82 M82 18 L18 82" stroke="#14202b" strokeWidth="26" strokeLinecap="round" /><path d="M18 18 L82 82 M82 18 L18 82" stroke="#ff2d2d" strokeWidth="16" strokeLinecap="round" /></svg>
    </div>
  );
};

/** o bordão do canal: carimbo cinza «SIN MOTORES» que leva um risco vermelho, e o amarelo «¡CON INGENIO!» por cima */
const Stamp: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  const end = b + 1.5, k = win(t, a, end, 0.15); if (k <= 0) return null;
  const s1 = pop(t, a, 0.25), strike = ease(t, a + 0.3, a + 0.55), s2 = pop(t, b, 0.3), shake = t > b ? Math.sin((t - b) * 30) * 6 * (1 - prog(t, b, b + 0.5)) : 0;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 560, height: 300, opacity: k }}>
      <div style={{ position: "absolute", left: 0, width: W, top: 0, display: "flex", justifyContent: "center", transform: `rotate(-4deg) scale(${s1 * (t > b ? 0.86 : 1)})`, opacity: t > b ? 0.75 : 1 }}>
        <div style={{ position: "relative", padding: "6px 30px 10px", border: "8px solid #5b6670", borderRadius: 18, background: "#d9dee2e6" }}>
          <span style={{ fontFamily: FONT, fontSize: 70, color: "#5b6670", letterSpacing: 3 }}>SIN MOTORES</span>
          <div style={{ position: "absolute", left: -12, top: "48%", height: 16, width: `${104 * strike}%`, background: "#e0262b", borderRadius: 8, transform: "rotate(-8deg)", transformOrigin: "left center" }} />
        </div>
      </div>
      {t >= b ? (
        <div style={{ position: "absolute", left: 0, width: W, top: 96, display: "flex", justifyContent: "center", transform: `rotate(${3 + shake * 0.2}deg) scale(${s2})` }}>
          <span style={{ fontFamily: FONT, fontSize: 132, color: "#ffd400", lineHeight: 1, ...stroke(16, "#3a2300") }}>¡CON INGENIO!</span>
        </div>) : null}
    </div>
  );
};

const RewardEl: React.FC<{ t: number; r: Reward }> = ({ t, r }) => {
  const k = win(t, r.a, r.a + r.len, 0.25); if (k <= 0) return null;
  const s = pop(t, r.a, 0.45);
  const cols = ["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff"];
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 56, color: "#fff", ...stroke(10) }}>{r.top}</span>
      <span style={{ fontFamily: FONT, fontSize: 150, color: "#5cff7a", lineHeight: 1, ...stroke(16, "#05381a") }}>{r.big(t)}</span>
      <span style={{ fontFamily: FONT, fontSize: 72, color: "#ffd400", lineHeight: 1.1, textAlign: "center", ...stroke(12, "#3a2300") }}>{r.sub}</span>
      {Array.from({ length: 14 }, (_, i) => { const u = prog(t, r.a + 0.04 * i, r.a + 1.6), ang = (i / 14) * Math.PI * 2; return <span key={i} style={{ position: "absolute", top: 160 + Math.sin(ang) * 230 * u, left: 520 + Math.cos(ang) * 420 * u, fontFamily: FONT, fontSize: 54, color: cols[i % 5], opacity: 1 - u * 0.85, ...stroke(5, "#1c1208") }}>★</span>; })}
    </div>
  );
};

const Caption: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < words.length; k++) if (t >= words[k].start - 0.04) i = k; else break;
  if (i < 0) return null;
  const w = words[i], next = words[i + 1], hold = next ? Math.min(next.start - 0.04, w.end + 0.28) : w.end + 0.3;
  if (t > hold) return null;
  const txt = w.text.replace(/[.,!?;:¿¡]/g, "").toUpperCase(), s = lerp(1.18, 1, prog(t, w.start - 0.04, w.start + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1325, display: "flex", justifyContent: "center", transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#fff", ...stroke(11, "#101820") }}>{txt}</span>
    </div>
  );
};

export const Hud: React.FC<{ t: number; captions?: boolean }> = ({ t, captions = true }) => {
  const d = EP.HUD, X = d.Extra;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, overflow: "hidden" }}>
      <style>{`@font-face{font-family:'Baloo 2';font-weight:800;src:url(${staticFile("fonts/Baloo2-800.woff2")}) format('woff2');}`}</style>
      {X ? <X t={t} /> : null}
      {d.pills.map((p, i) => <PillEl key={i} p={p} t={t} />)}
      {d.titles.map((ti, i) => <TitleEl key={i} ti={ti} t={t} next={Math.min(99999, ...d.alerts.filter((x) => x > ti.a + 0.3), ...d.stamps.map((x) => x[0]).filter((x) => x > ti.a + 0.3))} />)}
      {d.alerts.map((a) => <Alert key={a} t={t} a={a} />)}
      {d.rewinds.map((a) => <Rewind key={a} t={t} a={a} />)}
      {d.crosses.map(([a, b]) => <Cross key={a} t={t} a={a} b={b} />)}
      {d.stamps.map(([a, b]) => <Stamp key={a} t={t} a={a} b={b} />)}
      <RewardEl t={t} r={d.reward} />
      {captions ? <Caption t={t} /> : null}
    </div>
  );
};
