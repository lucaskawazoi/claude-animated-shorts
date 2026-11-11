// MEP5 — Itaipu (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { H, World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

// planos: 7 cortes duros nos instantes da régua; W3, W6 e W10 são chicotes contínuos dentro do plano
const SHOTS: Shot[] = [
  { name: "gancho: Itaipu pronta → fronteira", t0: 0, keys: [
    K(0, [32, 7, 3], [8, 5, -2], 56, 2), K(T.turbinas, [27, 10, -3], [6, 6, 0], 58, -2),
    K(T.rio0, [44, 14, 44], [22, 4, 26], 58, 3), K(T.voce, [32, 26, 52], [0, 6, 10], 62, -1),
    K(T.fronteira, [-4, 34, 72], [-4, 8, 0], 62, 2), K(C1 - 0.05, [-10, 30, 66], [-6, 6, 0], 62, -1)] },
  { name: "rio virgem → canal de desvio", t0: C1, keys: [
    K(C1, [-2, 32, -26], [-8, 2, 14], 58, 2), K(T.cava, [-4, 30, -22], [-10, 2, 15], 56, -1),
    K(T.dois, [10, 34, -30], [0, 2, 12], 60, 2), K(T.desvia, [18, 30, -28], [0, 1, 6], 60, -2),
    K(T.esseCanal, [22, 28, -24], [2, 1, 10], 58, 1), K(C2 - 0.05, [22, 28, -23], [2, 1, 10], 58, 0)] },
  { name: "leito seco → barragem sobe", t0: C2, keys: [
    K(C2, [10, 6, -6], [-14, 1, 2], 52, -3), K(W3, [9.6, 6, -5.6], [-14, 1.2, 2], 52, -2),
    K(W3 + 0.7, [22, 14, -16], [0, 6, 8], 60, 5), K(T.cento, [24, 16, -18], [0, 8, 8], 60, 2),
    K(T.predio, [26, 9, -22], [0, 8, 6], 58, -2), K(T.essaBarragem, [30, 18, -24], [0, 7, 8], 62, 1), K(C3 - 0.05, [28, 17, -22], [0, 7, 8], 62, 0)] },
  { name: "concreto racha → ⏪ → gelo", t0: C3, keys: [
    K(C3, [24, 10, -8], [1, 6, 4], 54, 2), K(T.esquenta, [22, 9.5, -7], [1, 6, 4], 52, -1),
    K(T.racha, [17, 8, -3], [1, 6, 3], 50, 2), K(T.volta, [24, 12, -9], [1, 5, 4], 56, -2),
    K(T.gela, [6, 21, -38], [-5, 13, -21], 56, 2), K(T.gelo, [4, 19, -35], [-3, 13, -20], 54, -1),
    K(T.semTrincar, [16, 16, -20], [0, 8, 4], 60, 1), K(C4 - 0.05, [18, 17, -22], [0, 8, 6], 60, 0)] },
  { name: "lago enche → tubos", t0: C4, keys: [
    K(C4, [-30, 30, 52], [-40, 4, 10], 60, 3), K(T.lampada, [-24, 26, 46], [-36, 6, 8], 60, -1),
    K(T.tubos, [26, 20, -17], [3, 7, -1], 58, 2), K(T.despenca, [23, 15, -13], [4, 6, 0], 56, -1),
    K(W6, [22.6, 14.8, -12.6], [4, 6, 0], 56, 0), K(C5 - 0.42, [22, 12, -10], [40, 6, 10], 58, 4), K(C5 - 0.02, [22, 12.1, -10], [40, 6, 10], 58, 4)] },
  { name: "turbina → cidade acesa → tempestade → vertedouro", t0: C5, keys: [
    K(C5, [26, 4.5, 5], [15.6, 2.6, 0], 46, -2), K(T.gira, [25, 4.6, 4.4], [15.6, 3, 0], 46, 1),
    K(T.gerador, [26, 7, 5], [15.6, 4.6, 0], 48, 0), K(T.casaForca, [40, 26, -6], [52, 12, -34], 60, 2),
    K(T.z4, [44, 24, -10], [64, 12, -36], 58, -1), K(T.p4, [-8, 26, 54], [-30, 8, 10], 60, 3),
    K(T.ameaca, [-4, 22, 51], [-20, 9, 12], 58, -2), K(T.escorregador, [30, 20, 54], [14, 6, 26], 58, 2),
    K(T.vertedouro, [36, 14, 50], [18, 5, 26], 58, -1), K(C6 - 0.05, [38, 12, 48], [24, 3, 26], 58, 0)] },
  { name: "espuma → peixes no paredão", t0: C6, keys: [
    K(C6, [54, 9, 36], [32, 3, 26], 54, 2), K(T.z5, [56, 10, 38], [32, 4, 26], 56, -1),
    K(T.p5, [34, 6, -3], [16, 3, -1], 52, 2), K(T.batem, [32, 6, -4], [14, 3, 0], 50, -2), K(C7 - 0.05, [33, 6, -5], [14, 3, 1], 50, 1)] },
  { name: "Canal da Piracema → Itaipu inteira", t0: C7, keys: [
    K(C7, [4, 18, -34], [10, 5, -11], 56, 2), K(T.piracema, [2, 14, -27], [8, 6, -11], 56, -1),
    K(T.agoraSim, [52, 40, 62], [0, 6, 0], 62, 2), K(T.itaipu, [62, 34, 42], [0, 6, 0], 62, -1),
    K(T.milhoes, [72, 30, -8], [32, 8, -22], 62, 1), K(W10, [62, 32, -30], [10, 8, -6], 62, 0), K(T.end, [42, 36, -52], [0, 6, 0], 62, 0)] },
];
const DYN = [6.0, 0.7, 5.0, 4.0, 0.15, 0.3, 3.6, 3.8, 0.3, 0.8, 0.05];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([22, 0, -6], 1.1, "present")],
  [T.rio0, S([22, 0, -6], 0.6, "point")],
  [C1, S([-7, 9, 10.5], 2.8, "present")],
  [T.cava, S([-7, 9, 10.5], 2.8, "chisel", { prop: "hammer" })],
  [T.desvia, S([-7, 9, 10.5], 2.4, "point")],
  [T.esseCanal, S([-7, 9, 10.5], 2.8, "cheer")],
  [C2, S([3.5, 0, -2.5], -1.2, "present")],
  [T.paredao, S([6.5, 0, -6.5], 1.6, "point")],
  [T.cento, S([12, 0, -9], 1.0, "cheer")],
  [C3, S([10, 0, -9], 1.0, "present")],
  [T.esquenta, S([10, 0, -9], 1.0, "alarm")],
  [T.volta, S([10, 0, -9], 1.0, "think")],
  [T.gela - 0.2, S([-3, H, -21.5], 0.4, "present")],
  [T.gelo, S([-3, H, -21.5], 0.6, "point")],
  [T.semTrincar, S([10, 0, -12], 0.9, "cheer")],
  [C4, S([-9, H, -16.5], 0.2, "present")],
  [T.lampada, S([-9, H, -16.5], 0.2, "think")],
  [T.tubos, S([10, 0, -11], 0.9, "point")],
  [C5, S([21, 0, 3.4], 1.2, "present")],
  [T.gira, S([21, 0, 3.4], -1.2, "point")],
  [T.casaForca, S([21, 0, 3.4], 1.2, "cheer")],
  [T.p4, S([-14, H, -16.5], 0.3, "alarm")],
  [T.escorregador, S([20, 0, 37], 0.6, "point")],
  [T.vertedouro, S([20, 0, 37], 0.6, "cheer")],
  [C6, S([40, 0, 34], 0.8, "present")],
  [T.p5, S([20, 0, -7], 1.0, "alarm")],
  [T.batem, S([20, 0, -7], 1.0, "think")],
  [C7, S([12, 0, -14.6], 0.4, "point")],
  [T.piracema, S([12, 0, -14.6], 0.4, "cheer")],
  [T.agoraSim, S([16, 0, 14], 0.8, "cheer")],
];

// ---------------------------------------------------------------- painel
const hud: HudData = {
  pills: [
    { a: T.mw, b: T.rio0 - 0.1, label: "POTÊNCIA", value: (t) => `${count(t, T.mw, T.mw + 1.2, 0, 14000)} MW`, y: 440 },
    { a: T.turbinas, b: T.voce - 0.1, label: "TURBINAS", value: (t) => count(t, T.turbinas, T.turbinas + 0.8, 0, 20), y: 550, tone: "gold" },
    { a: T.dois, b: T.z1 - 0.1, label: "CANAL", value: () => "2 km", y: 440 },
    { a: T.cento, b: T.z2 - 0.1, label: "ALTURA", value: (t) => `${count(t, T.cento, T.cento + 1.2, 0, 196)} m`, y: 440 },
    { a: T.predio, b: T.z2 - 0.1, label: "PRÉDIO DE", value: () => "65 ANDARES", y: 550, tone: "gold" },
    { a: T.esquenta, b: T.volta - 0.1, label: "CONCRETO", value: () => "QUENTE ▲", y: 440, tone: "red" },
    { a: T.gelo, b: T.z3 - 0.1, label: "CONCRETO", value: () => "GELADO", y: 440, tone: "green" },
    { a: T.p3, b: T.tubos - 0.1, label: "LAGO", value: (t) => `${count(t, T.p3, T.lampada, 0, 100)}%`, y: 440 },
    { a: T.gira, b: T.z4 - 0.1, label: "ENERGIA", value: (t) => `${count(t, T.gira, T.casaForca, 0, 14000)} MW`, y: 440, tone: "green" },
    { a: T.ameaca, b: T.vertedouro - 0.1, label: "LAGO", value: () => "TRANSBORDANDO", y: 440, tone: "red" },
    { a: T.quarenta, b: T.z5 - 0.1, label: "VAZÃO", value: () => "40× IGUAÇU", y: 440, tone: "gold" },
    { a: T.dez, b: T.agoraSim - 0.1, label: "RIO DOS PEIXES", value: () => "10 km", y: 440 },
  ],
  titles: [
    { a: T.esseCanal, text: "CANAL DE DESVIO" }, { a: T.essaBarragem, text: "BARRAGEM" }, { a: T.semTrincar, text: "CONCRETO GELADO", len: 1.2 },
    { a: T.casaForca, text: "CASA DE FORÇA" }, { a: T.vertedouro, text: "VERTEDOURO" }, { a: T.piracema, text: "CANAL DA PIRACEMA", len: 2.0 },
  ],
  alerts: [T.mas, T.esquenta, T.p3, T.p4, T.p5],
  rewinds: [T.volta],
  crosses: [[T.racha, T.volta - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM: ZEROU!", big: (t) => `${count(t, T.agoraSim, T.agoraSim + 1.4, 0, 14000)} MW`, sub: "ITAIPU · BRASIL E PARAGUAI" },
  Extra: ({ t }) => {
    // a lâmpada: apagada quando o lago enche ("água parada não acende lâmpada"), acesa quando o gerador gira
    const k = win(t, T.lampada - 0.1, T.tubos - 0.15, 0.2), k2 = win(t, T.gerador, T.casaForca - 0.1, 0.2);
    const bulb = (on: boolean, o: number, t0: number) => o <= 0 ? null : (
      <div style={{ position: "absolute", left: 0, width: 1080, top: 700, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, transform: `scale(${pop(t, t0, 0.3)})` }}>
        <svg viewBox="0 0 100 130" width="260" height="338">
          {on ? <circle cx="50" cy="45" r="46" fill="#fff27a" opacity="0.45" /> : null}
          <path d="M50 8 C24 8 12 28 12 46 C12 64 28 72 32 88 L68 88 C72 72 88 64 88 46 C88 28 76 8 50 8 Z" fill={on ? "#ffe14a" : "#c9cfcd"} stroke="#14202b" strokeWidth="6" />
          <rect x="32" y="90" width="36" height="12" rx="3" fill="#5b6670" stroke="#14202b" strokeWidth="5" /><rect x="35" y="104" width="30" height="12" rx="3" fill="#5b6670" stroke="#14202b" strokeWidth="5" />
          {on ? null : <path d="M22 22 L78 78 M78 22 L22 78" stroke="#e0262b" strokeWidth="10" strokeLinecap="round" />}
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 56, color: on ? "#5cff7a" : "#ffffff", ...stroke(9) }}>{on ? "ACENDEU!" : "0 W"}</span>
      </div>);
    return <>{bulb(false, k, T.lampada - 0.1)}{bulb(true, k2, T.gerador)}</>;
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 170, fogFar: 640, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
