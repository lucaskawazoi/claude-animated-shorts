// MEP14 — A usina, parte 2 (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
import React from "react";
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { T } from "./anchors";
import { CUTS14, SFX } from "./cues";
import { ROWS } from "./shots";
import { World } from "./world";
import { Spray } from "../papel/parts";
import { L } from "./layout";

const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, u = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), La = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  const look = La(r[2], r[4]), p = La(r[1], r[3]), K = /caminho|visor|sacos|cristais|lupa|dentro|levedura|come|bolhas|rodas|poça|moscas|fedor/.test(r[9]) ? 1.2 : 1.6;
  return { pos: [look[0] + (p[0] - look[0]) * K, Math.max(1.0, look[1] + (p[1] - look[1]) * K), look[2] + (p[2] - look[2]) * K], look, fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
const DYN = [3, 2, 3, 3, 1.5, 1.5, 3, 3, 1.5, 1.5, 2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([-12, 0, 30], 0, "idle", { scale: 0 })],
  [T.parte, S([-44, 0, 11.5], 0.1, "present")],
  [T.caldo, S([-34, 0, 12], 0.1, "point")],
  [T.primeiro, S([2, 0, 12], 0.1, "present")],
  [T.lodo, S([20, 0, 11.5], 0.1, "point")],
  [T.filtro, S([26, 0, 11], 0.1, "present")],
  [T.torta, S([52, 0, 10.5], 0.2, "point")],
  [T.adubo, S([66, 0, 13], 0.1, "point")],
  [T.prob1 - 0.4, S([101, 0, 12.5], 0.35, "alarm")],
  [T.deixa1, S([101.5, 0, 12], 0.2, "cheer")],
  [T.evap + 0.4, S([116, 0, 12.5], 0.1, "present")],
  [T.cozedor, S([150, 0, 12], 0.1, "point")],
  [T.centr, S([181, 0, 12.5], 0.1, "present")],
  [T.fica, S([196, 0, 12], 0.2, "point")],
  [T.prob2 - 0.4, S([200, 0, 11.5], 0.3, "alarm")],
  [T.deixa2, S([200.5, 0, 11.5], 0.2, "cheer")],
  [T.dorna, S([224, 0, 10.5], 0.1, "point")],
  [T.levedura + 0.5, S([239, 0, 10], 0.0, "present")],
  [T.quem, S([262, 0, 11.5], 0.1, "point")],
  [T.conta, S([298, 0, 12.5], 0.1, "present")],
  [T.ja, S([326, 0, 12], 0.1, "point")],
  [T.vinhaca, S([364, 0, 12], 0.1, "present")],
  [T.porIsso2, S([412, 0, 14], 0.1, "point")],
  [T.biogas, S([458, 0, 8], 0.1, "cheer")],
  [T.parabens - 0.3, S([-12, 0, 30], 0.0, "cheer")],
  [T.que - 0.2, S([-12, 0, 30], 0.0, "present")],
];

const TONE = { red: "#b01818", green: "#0b7a35", gold: "#a86f00" };
const Chip: React.FC<{ a: number; b: number; t: number; top?: string; big: string; sub?: string; tone: string; y?: number; size?: number; subSize?: number }> = ({ a, b, t, top, big, sub, tone, y = 300, size = 104, subSize = 54 }) => {
  const k = win(t, a, b, 0.2); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: y, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${pop(t, a, 0.32) * (0.92 + 0.08 * k)})` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 40px 16px", borderRadius: 54, background: tone, border: "6px solid #ffffff", boxShadow: "0 8px 0 #00000077", maxWidth: 1000 }}>
        {top ? <span style={{ fontFamily: FONT, fontSize: 44, color: "#e8f4ff", letterSpacing: 2, textAlign: "center", lineHeight: 1.05 }}>{top}</span> : null}
        <span style={{ fontFamily: FONT, fontSize: size, color: "#ffffff", lineHeight: 1, textAlign: "center", ...stroke(7, "#0a1620") }}>{big}</span>
        {sub ? <span style={{ fontFamily: FONT, fontSize: subSize, color: "#ffd400", lineHeight: 1.1, textAlign: "center", ...stroke(8, "#3a2300") }}>{sub}</span> : null}
      </div>
    </div>
  );
};
const Sticker: React.FC<{ a: number; len: number; t: number; text: string; tone?: string; y?: number; rot?: number; size?: number }> = ({ a, len, t, text, tone = "#0b7a35", y = 330, rot = -5, size = 84 }) => {
  const k = win(t, a, a + len, 0.15); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: y, display: "flex", justifyContent: "center", opacity: k, transform: `rotate(${rot}deg) scale(${pop(t, a, 0.3)})` }}>
      <div style={{ padding: "6px 36px 12px", borderRadius: 40, background: tone, border: "6px solid #ffffff", boxShadow: "0 8px 0 #00000066" }}>
        <span style={{ fontFamily: FONT, fontSize: size, color: "#ffffff", lineHeight: 1, ...stroke(6, "#05381a") }}>{text}</span>
      </div>
    </div>
  );
};
const Check: React.FC<{ t: number; a: number; len: number; text: string }> = ({ t, a, len, text }) => {
  const k = win(t, a, a + len, 0.15); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 110, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: k, transform: `scale(${pop(t, a, 0.3)}) rotate(${Math.sin((t - a) * 9) * 2}deg)` }}>
      <svg viewBox="0 0 100 100" width="170" height="170"><circle cx="50" cy="50" r="44" fill="#22c55e" stroke="#ffffff" strokeWidth="7" /><path d="M26 52 L43 69 L76 32" stroke="#ffffff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
      <span style={{ fontFamily: FONT, fontSize: 92, color: "#5cff7a", lineHeight: 1, ...stroke(12, "#05381a") }}>{text}</span>
    </div>
  );
};

const hud: HudData = {
  pills: [
    { a: T.prob1 + 0.2, b: T.deixa1 - 0.1, label: "O CALDO", value: () => "QUASE SÓ ÁGUA", y: 440, hi: true, tone: "red" },
    { a: T.ainda - 0.05, b: T.deixa2 - 0.1, label: "O MELAÇO", value: () => "AINDA TEM AÇÚCAR", y: 440, hi: true, tone: "red" },
    { a: T.porIsso, b: T.quem - 0.1, label: "O AÇÚCAR SAI", value: () => "ANTES DO ÁLCOOL", y: 440, hi: true, tone: "gold" },
    { a: T.quem, b: T.conta - 0.25, label: "SÓ ÁLCOOL", value: () => "= DESTILARIA", y: 440, hi: true, tone: "gold" },
    { a: T.mosca - 0.05, b: T.porIsso2 - 0.1, label: "MAL MANEJADA", value: () => "= MOSCA", y: 440, hi: true, tone: "red" },
    { a: T.porIsso2, b: T.petr - 0.1, label: "DOSE LIMITADA", value: () => "PELO POTÁSSIO", y: 440, hi: true, tone: "gold" },
    { a: T.petr, b: T.compacta - 0.1, label: "PETRIFICA?", value: () => "NÃO", y: 440, hi: true, tone: "red" },
    { a: T.compacta, b: T.biogas - 0.15, label: "O QUE COMPACTA:", value: () => "O CAMINHÃO", y: 440, hi: true, tone: "green" },
    { a: T.biogas, b: T.parabens - 0.1, label: "VINHAÇA", value: () => "VIRA BIOGÁS", y: 440, hi: true, tone: "green" },
  ],
  titles: [
    { a: T.parte, text: "A USINA, PARTE 2", len: 1.55, size: 92 },
    { a: T.torta, text: "TORTA DE FILTRO", len: 1.9, size: 86 }, { a: T.evap, text: "EVAPORADOR", len: 2.2 }, { a: T.cozedor, text: "COZEDOR", len: 2.0 },
    { a: T.centr, text: "CENTRÍFUGA", len: 1.8 }, { a: T.melaco, text: "MELAÇO", len: 1.4 }, { a: T.dorna, text: "DORNA", len: 1.6 }, { a: T.quem + 0.5, text: "DESTILARIA", len: 1.8 },
    { a: T.vinhaca, text: "VINHAÇA", len: 1.6 }, { a: T.biogas + 0.2, text: "BIODIGESTOR", len: 1.1, size: 92 },
  ],
  alerts: [T.prob1, T.prob2],
  rewinds: [],
  crosses: [[T.petr, T.nao + 0.6]],
  stamps: [],
  reward: { a: T.parabens, len: 2.8, top: "PARABÉNS, CHEFE: A USINA", big: () => "COMPLETA!", sub: "AÇÚCAR + ÁLCOOL + ADUBO", bounces: [T.parabens + 1.0] },
  Extra: ({ t }) => {
    // balão de comentário genérico (sem nome, sem foto): entra em «nos comentários», o texto cai em «faltou o açúcar»
    const bk = win(t, T.comentarios + 0.1, T.parte - 0.05, 0.2), tx = prog(t, T.faltou - 0.05, T.faltou + 0.3);
    const bubble = bk > 0 ? (
      <div style={{ position: "absolute", left: 0, width: 1080, top: 250, display: "flex", justifyContent: "center", opacity: bk, transform: `scale(${pop(t, T.comentarios + 0.1, 0.32)}) rotate(-2deg)` }}>
        <div style={{ position: "relative", padding: "20px 46px 26px", borderRadius: 56, background: "#ffffff", border: "6px solid #15202b", boxShadow: "0 9px 0 #00000066", maxWidth: 940 }}>
          <div style={{ fontFamily: FONT, fontSize: 38, color: "#6a7886", letterSpacing: 3, textAlign: "center" }}>COMENTÁRIO</div>
          <div style={{ fontFamily: FONT, fontSize: 112, color: tx > 0 ? "#e0262b" : "#cfd6dc", lineHeight: 1, textAlign: "center", transform: `scale(${1 + 0.14 * Math.sin(Math.min(1, tx) * Math.PI)})`, ...stroke(0) }}>{tx > 0 ? "FALTOU O AÇÚCAR" : "…"}</div>
          <div style={{ position: "absolute", left: 90, bottom: -34, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: "40px solid #15202b" }} />
          <div style={{ position: "absolute", left: 96, bottom: -24, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: "30px solid #ffffff" }} />
        </div>
      </div>
    ) : null;
    // cheiro: três ondinhas verdes
    const sk = win(t, T.cheira - 0.05, T.criam - 0.15, 0.15);
    const smell = sk > 0 ? (
      <div style={{ position: "absolute", left: 790, top: 150, opacity: sk, transform: `scale(${pop(t, T.cheira - 0.05, 0.3)})` }}>
        <svg viewBox="0 0 120 120" width="230" height="230">{[22, 52, 82].map((x, i) => <path key={i} d={`M${x} 104 C${x - 14} 84 ${x + 14} 66 ${x} 46 C${x - 12} 28 ${x + 8} 16 ${x} 4`} stroke="#9fe84a" strokeWidth="9" strokeLinecap="round" fill="none" style={{ filter: "drop-shadow(0 3px 0 #1d3a05)" }} transform={`translate(0 ${Math.sin(t * 6 + i) * 3})`} />)}</svg>
      </div>
    ) : null;
    // mosca
    const fk = win(t, T.criam - 0.1, T.criam + 1.1, 0.15);
    const fly = fk > 0 ? <div style={{ position: "absolute", left: 90, top: 190, opacity: fk, transform: `scale(${pop(t, T.criam - 0.1, 0.3)}) rotate(${Math.sin(t * 9) * 6}deg)`, fontFamily: FONT, fontSize: 150, ...stroke(8, "#14181c"), color: "#14181c" }}>🪰</div> : null;
    // cartões da conta
    const aK = win(t, T.oitenta - 0.1, T.media + 0.1, 0.18), bK = win(t, T.media + 0.05, T.ja - 0.1, 0.2);
    return (
      <>
        {bubble}
        {/* 85 L/t = destilaria */}
        {aK > 0 ? <Chip t={t} a={T.oitenta - 0.1} b={T.media + 0.1} top="NUMA DESTILARIA SÓ DE ETANOL" big="85 L / t" sub="= DESTILARIA" tone="#0b7a35" y={290} /> : null}
        {bK > 0 ? <Chip t={t} a={T.media + 0.05} b={T.ja - 0.1} top="MÉDIA DO CENTRO-SUL · POR TONELADA" big="~40 L ETANOL" sub="+ 66 KG DE AÇÚCAR" tone="#14507a" y={290} size={92} subSize={62} /> : null}
        {t > T.media + 0.05 && t < T.ja - 0.1 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 640, textAlign: "center", fontFamily: FONT, fontSize: 70, color: "#ffffff", ...stroke(9, "#0a1620"), opacity: win(t, T.media + 0.4, T.ja - 0.1, 0.2) }}>≠ 85 L / t</div> : null}
        <Chip t={t} a={T.ja} b={T.vinhaca - 0.4} top="500 t/h DE CANA" big="→ ~140 t/h" sub="DE BAGAÇO" tone="#7a5a10" y={290} size={96} />
        <Check t={t} a={T.cento + 0.95} len={1.3} text="CONFERIDO" />
        <Chip t={t} a={T.vinhaca} b={T.acida - 0.1} top="PARA CADA LITRO DE ETANOL" big="10–13 L" sub="DE VINHAÇA" tone="#3a2414" y={290} size={116} />
        {smell}{fly}
        <Check t={t} a={T.compacta + 0.25} len={1.55} text="COMPACTA" />
        <Sticker t={t} a={T.deixa1} len={1.2} text="DEIXA COMIGO!" y={300} />
        <Sticker t={t} a={T.deixa2} len={1.2} text="DEIXA COMIGO!" y={300} rot={4} />
        {/* cartão final: o operário vivo embaixo */}
        {(() => {
          const a = T.que - 0.05, k = win(t, a, T.end + 1, 0.25); if (k <= 0) return null;
          const arrow = 10 * Math.abs(Math.sin((t - a) * 4.5));
          return (
            <div style={{ position: "absolute", left: 0, width: 1080, top: 150, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${pop(t, a, 0.4)})` }}>
              <div style={{ padding: "10px 40px 20px", borderRadius: 54, background: "#0b3a7a", border: "7px solid #ffffff", boxShadow: "0 10px 0 #00000077", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontFamily: FONT, fontSize: 92, color: "#ffffff", lineHeight: 1.02, textAlign: "center", ...stroke(8, "#05152e") }}>QUE OUTRA FÁBRICA</span>
                <span style={{ fontFamily: FONT, fontSize: 92, color: "#ffd400", lineHeight: 1.02, textAlign: "center", ...stroke(10, "#3a2300") }}>VOCÊ QUER VER</span>
                <span style={{ fontFamily: FONT, fontSize: 92, color: "#ffd400", lineHeight: 1.02, textAlign: "center", ...stroke(10, "#3a2300") }}>POR DENTRO?</span>
              </div>
              <div style={{ marginTop: 30, padding: "4px 44px 14px", borderRadius: 50, background: "#e0262b", border: "6px solid #fff", boxShadow: "0 8px 0 #00000066", transform: `translateY(${arrow * 0.3}px)`, display: "flex", gap: 18, alignItems: "baseline" }}>
                <span style={{ fontFamily: FONT, fontSize: 96, color: "#fff", lineHeight: 1, ...stroke(7, "#4a0808") }}>COMENTA AÍ</span>
                <span style={{ fontFamily: FONT, fontSize: 110, color: "#ffd400", lineHeight: 1, transform: `translateY(${arrow}px)`, ...stroke(7, "#4a0808") }}>↓</span>
              </div>
            </div>
          );
        })()}
      </>
    );
  },
};

export const Confetti: React.FC<{ t: number }> = ({ t }) => (
  <Spray t={t} t0={T.parabens} t1={T.parabens + 2.2} p={[-12, 6.5, 30]} dir={[0, 1, 0]} spread={0.9} n={46} spd={9} g={-9} life={2.4} size={0.34} cols={["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff", "#ff7a1a"]} floor={0.2} seed={21} />
);

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World: ({ t }) => <><World t={t} /><Confetti t={t} /></>, SFX, EXPOSURE: [], CUTS: CUTS14,
  ENV: { bg: "#7fb6ee", fog: "#d2e6fa", fogNear: 360, fogFar: 1000, hemiSky: "#e8f2ff", hemiGround: "#6aa84a", hemiI: 1.12, sun: "#fff1d8", sunI: 2.4 },
};
export { L, ease };
