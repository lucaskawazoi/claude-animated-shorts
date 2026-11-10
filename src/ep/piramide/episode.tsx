// E1 — La Gran Pirámide de Guiza (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World, sledX } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

// planos: 7 cortes duros nos instantes da régua; W3, W6 e W10 são chicotes contínuos dentro do plano
const SHOTS: Shot[] = [
  { name: "gancho", t0: 0, keys: [
    K(0, [-3.2, 2.2, 22.0], [-5.4, 1.2, 16.6], 52, 2), K(T.toneladas, [-1.0, 4.0, 26.0], [-4.0, 2.0, 14.0], 56, -2),
    K(T.egipto, [14.0, 13.0, 36.0], [0.0, 6.0, -8.0], 62, 3), K(T.keops, [6.0, 12.0, 32.0], [-2.0, 6.5, -8.0], 62, -2),
    K(C1 - 0.05, [-12.0, 9.5, 30.0], [-24.0, 2.5, 2.0], 62, 2)] },
  { name: "pedreira>trenó", t0: C1, keys: [
    K(C1, [-27.0, 3.4, 18.0], [-36.0, 2.4, 3.0], 58, 3), K(T.como, [-25.0, 3.6, 17.5], [-30.5, 1.5, 7.0], 58, -1),
    K(T.b1, [-25.0, 3.4, 17.0], [-29.5, 1.2, 7.5], 56, 4), K(T.trineo1 + 0.6, [-24.0, 3.6, 16.5], [-28.5, 1.2, 7.0], 58, 1),
    K(T.equipo + 0.4, [-21.0, 3.6, 15.5], [-23.5, 1.2, 7.0], 60, -2), K(C2 - 0.05, [-21.5, 4.2, 16.5], [-25.0, 1.0, 7.0], 60, 2)] },
  { name: "atola>água", t0: C2, keys: [
    K(C2, [-22.6, 1.1, 10.6], [-24.4, 0.7, 7.0], 50, -3), K(W3, [-22.9, 1.2, 10.4], [-24.0, 0.6, 7.0], 50, -2),
    K(W3 + 0.7, [-19.0, 3.8, 14.8], [-24.2, 0.8, 7.0], 60, 5), K(T.b2, [-19.6, 3.4, 13.8], [-24.4, 0.8, 7.0], 60, 2),
    K(T.echando, [-19.4, 2.8, 12.4], [-22.8, 0.7, 7.0], 56, -2), K(T.mojada + 0.3, [-18.6, 2.9, 12.6], [-22.0, 0.8, 7.0], 56, 1),
    K(C3 - 0.05, [-15.8, 3.0, 12.8], [-20.0, 0.8, 7.0], 58, -1)] },
  { name: "trenó>Tura", t0: C3, keys: [
    K(C3, [-4.0, 9.0, 25.0], [-19.0, 1.0, 6.0], 58, 1), K(T.p2 - 0.2, [-5.0, 8.8, 24.0], [-15.0, 1.0, 6.5], 58, -1),
    K(T.tura + 0.4, [-2.0, 7.5, 20.0], [8.0, 2.0, 52.0], 60, 1), K(T.b3, [-8.6, 3.0, 16.4], [-11.5, 2.0, 10.5], 52, 2), K(C4 - 0.05, [-8.8, 2.8, 15.8], [-11.5, 2.0, 10.5], 50, -1)] },
  { name: "cheia>porto", t0: C4, keys: [
    K(C4, [15.0, 6.0, 33.0], [10.0, 1.0, 48.0], 58, 3), K(T.crecida + 0.6, [13.0, 6.5, 33.5], [10.0, 1.0, 48.0], 58, -1),
    K(T.sube + 0.4, [14.0, 9.0, 40.0], [14.0, 0.5, 28.0], 62, 2), K(T.canales + 0.4, [26.0, 11.0, 45.0], [14.5, 1.0, 17.0], 60, 0),
    K(T.barcos + 1.0, [24.5, 9.5, 38.0], [15.0, 1.0, 14.0], 60, -1), K(T.puerto + 0.6, [22.0, 8.0, 33.0], [15.0, 1.0, 13.0], 60, 1),
    K(W6, [21.5, 7.8, 32.0], [15.0, 1.0, 13.0], 60, 1), K(C5 - 0.05, [17.6, 2.6, 21.6], [15.4, 1.6, 15.6], 54, -4)] },
  { name: "Merer>pirâmide>rampa", t0: C5, keys: [
    K(C5, [15.6, 13.0, 23.0], [15.0, 0.4, 14.5], 56, 2), K(T.p3, [16.4, 13.4, 23.4], [15.2, 0.4, 14.5], 56, -1),
    K(T.p3 + 1.4, [34.0, 12.0, 24.0], [3.0, 8.0, -8.0], 62, 3), K(T.metros + 0.4, [30.0, 14.0, 26.0], [1.0, 10.0, -8.0], 62, -2),
    K(T.b4 + 0.3, [40.0, 6.0, 20.0], [12.0, 6.0, -8.0], 60, 4), K(T.rampas, [44.0, 8.0, 8.0], [20.0, 5.0, -8.0], 60, -3), K(T.rampa, [38.0, 11.0, 2.0], [17.0, 6.0, -8.0], 60, 3),
    K(C6 - 0.05, [37.0, 12.0, 17.0], [12.0, 7.0, -8.0], 62, 2)] },
  { name: "cidade", t0: C6, keys: [
    K(C6, [38.5, 6.5, 30.0], [36.0, 1.2, 12.0], 58, 1), K(T.hambre, [36.5, 4.6, 24.5], [35.0, 1.6, 13.0], 56, -1),
    K(T.ciudad, [30.0, 6.2, 28.0], [34.0, 1.5, 10.0], 60, 1), K(T.panaderias + 0.3, [32.0, 3.8, 20.5], [33.5, 1.0, 12.0], 56, -1), K(C7 - 0.05, [33.0, 3.8, 21.0], [34.0, 1.0, 12.0], 56, 0)] },
  { name: "gado>mastabas>obra pronta", t0: C7, keys: [
    K(C7, [49.0, 2.8, 28.0], [44.0, 1.0, 20.5], 56, 2), K(T.ovejas + 0.4, [47.0, 3.0, 29.0], [46.0, 0.9, 21.5], 56, -2),
    K(T.tumbas - 0.1, [-4.0, 4.6, 25.0], [-10.5, 1.0, 14.5], 58, 3), K(T.veinte, [-6.0, 5.5, 27.0], [-9.0, 1.5, 12.0], 58, -1),
    K(T.terminada, [-22.0, 12.0, 38.0], [0.0, 7.0, -8.0], 62, 2), K(T.alto + 1.0, [-10.0, 10.0, 42.0], [0.0, 7.0, -8.0], 62, -1),
    K(W10, [16.0, 8.5, 39.0], [0.0, 7.0, -8.0], 62, 1), K(T.end, [24.0, 7.6, 35.0], [0.0, 7.0, -8.0], 60, 0)] },
];
// dinamismo por janela da régua (ordem do movimento da referência: whips agitados, fim calmo)
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const followSled = (t: number): V3 => [sledX(t) + 1.9, 0, 7.0];
const WORKER: [number, WorkerState][] = [
  [0, S([-3.4, 0, 17.6], 0.35, "present")],
  [T.motor, S([-3.4, 0, 17.6], 0.35, "think")],
  [T.egipto, S([-3.4, 0, 17.6], -0.5, "point")],
  [C1, S([-28.4, 0, 10.4], 0.5, "present")],
  [T.como, S([-28.4, 0, 10.4], 0.5, "think")],
  [T.b1, S([-28.4, 0, 10.4], 0.5, "cheer")],
  [T.trineo1, S([-27.6, 0, 9.6], -0.4, "point")],
  [T.p1, S([-24.6, 0, 9.4], 0.2, "alarm")],
  [T.b2, S([-24.6, 0, 9.4], 0.2, "think")],
  [T.agua, S([0, 0, 0], -Math.PI / 2, "pour", { prop: "jar", follow: followSled })],
  [T.p2 - 0.2, S([-11.5, 0, 10.5], 0.1, "point")],
  [T.b3, S([-11.5, 0, 10.5], 0.45, "think")],
  [C4, S([12.5, 0.35, 16.4], 0.3, "present")],
  [T.puerto, S([12.5, 0.35, 16.4], 0.3, "cheer")],
  [T.merer - 0.3, S([15.0, 0.35, 16.4], 0.15, "read", { prop: "scroll" })],
  [T.p3 + 0.7, S([24.5, 0, -2.6], -0.6, "alarm")],
  [T.b4, S([24.5, 0, -2.6], -0.6, "cheer")],
  [T.rampas, S([27.5, 0, -4.2], -0.9, "point")],
  [T.misterio, S([27.5, 0, -4.2], -0.6, "think")],
  [C6, S([35.2, 0, 15.0], 0.15, "present")],
  [T.hambre - 0.1, S([35.2, 0, 15.0], 0.15, "belly")],
  [T.b5, S([35.2, 0, 15.0], 0.15, "cheer")],
  [T.ciudad, S([34.6, 0, 17.0], 0.0, "present")],
  [C7, S([43.0, 0, 23.4], 0.7, "point")],
  [T.tumbas - 0.15, S([-10.5, 0, 19.6], 0.0, "present")],
  [T.veinte + 0.4, S([-3.0, 0, 6.5], 0.0, "cheer")],
];

// ---------------------------------------------------------------- painel
const hud: HudData = {
  pills: [
    { a: T.bloques, b: T.egipto - 0.15, label: "BLOQUES", value: (t) => count(t, T.bloques, T.bloques + 1.3, 0, 2300000), y: 440 },
    { a: T.toneladas, b: T.egipto - 0.15, label: "CADA UNO", value: () => "2,5 t", y: 550, tone: "red" },
    { a: T.egipto, b: T.piedra, label: "HACE", value: (t) => `${count(t, T.egipto, T.egipto + 1.0, 0, 4500)} AÑOS`, y: 440, tone: "gold" },
    { a: T.keops, b: T.piedra, label: "FARAÓN", value: () => "KEOPS", y: 550 },
    { a: T.como, b: T.b1 - 0.1, label: "PESO", value: () => "2,5 t", y: 440, tone: "red" },
    { a: T.hunde, b: T.b2 - 0.1, label: "FUERZA", value: () => "100%", y: 440, tone: "red" },
    { a: T.mitad - 0.1, b: T.p2 - 0.1, label: "FUERZA", value: (t) => `${count(t, T.mitad - 0.1, T.mitad + 0.6, 100, 50)}%`, y: 440, tone: "green" },
    { a: T.crecida, b: T.puerto - 0.1, label: "NILO", value: (t) => (t < T.sube ? "CRECIDA" : "SUBE ▲"), y: 440 },
    { a: T.papiro, b: T.p3 - 0.1, label: "PAPIRO", value: () => "4.500 AÑOS", y: 440, tone: "gold" },
    { a: T.p3, b: T.b4 - 0.1, label: "ALTURA", value: (t) => `${count(t, T.p3, T.metros + 0.6, 40, 146)} m`, y: 440 },
    { a: T.p4, b: T.b5 - 0.1, label: "OBREROS", value: (t) => count(t, T.p4, T.p4 + 1.0, 0, 10000), y: 440 },
    { a: T.vacas, b: T.esclavos, label: "VACAS", value: () => "21 / DÍA", y: 440 },
    { a: T.ovejas, b: T.esclavos, label: "OVEJAS", value: () => "23 / DÍA", y: 550 },
    { a: T.veinte, b: T.alto - 0.1, label: "AÑOS DE OBRA", value: (t) => count(t, T.veinte, T.veinte + 1.0, 0, 20), y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.esteTrineo, text: "TRINEO" }, { a: T.mojada, text: "ARENA MOJADA" }, { a: T.puerto, text: "PUERTO" },
    { a: T.rampa, text: "RAMPA" }, { a: T.ciudad, text: "CIUDAD OBRERA" }, { a: T.terminada, text: "¡OBRA TERMINADA!", len: 2.6 },
  ],
  alerts: [T.como, T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.hunde, T.b2 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.alto, len: T.end - T.alto, top: "EL MÁS ALTO DEL MUNDO", big: (t) => `${count(t, T.alto, T.alto + 1.4, 0, 3800)} AÑOS`, sub: "146 m · SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {/* pintura da tumba de Djehutihotep (~1900 a.C.): homem jogando água na frente do trenó (desenho nosso, esquemático) */}
      {win(t, T.pintado, T.comprobaron + 0.9, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 140, top: 760, width: 800, opacity: win(t, T.pintado, T.comprobaron + 0.9, 0.2), transform: `rotate(-2deg) scale(${pop(t, T.pintado, 0.3)})` }}>
          <svg viewBox="0 0 400 190" width="800" height="380">
            <rect x="4" y="4" width="392" height="182" rx="10" fill="#ecd9a8" stroke="#6b4a22" strokeWidth="6" />
            <rect x="14" y="132" width="372" height="8" fill="#b0874a" />
            <rect x="150" y="104" width="120" height="16" fill="#8a5a2e" /><rect x="170" y="40" width="70" height="64" rx="6" fill="#c9a062" stroke="#6b4a22" strokeWidth="3" />
            {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${300 + i * 22},62)`}><circle cx="0" cy="0" r="7" fill="#7a3e1e" /><path d="M0 7 L-4 40 M0 7 L6 40 M0 14 L-14 20" stroke="#7a3e1e" strokeWidth="5" strokeLinecap="round" /></g>)}
            <line x1="270" y1="110" x2="370" y2="80" stroke="#7a5a2e" strokeWidth="3" />
            <g transform="translate(118,66)"><circle cx="0" cy="0" r="7" fill="#7a3e1e" /><path d="M0 7 L-3 42 M0 7 L4 42 M0 14 L14 22" stroke="#7a3e1e" strokeWidth="5" strokeLinecap="round" /><path d="M16 16 q8 -6 14 2 l-4 10 q-8 2 -10 -4 z" fill="#b8642e" /><path d="M28 30 q4 20 10 44" stroke="#3a97d6" strokeWidth="4" strokeDasharray="4 4" fill="none" /></g>
          </svg>
          <div style={{ marginTop: -6, textAlign: "center", fontFamily: FONT, fontSize: 40, color: "#fff", ...stroke(7) }}>TUMBA EGIPCIA · HACE ~3.900 AÑOS</div>
          {t > T.fisicos ? <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 52, color: "#5cff7a", transform: `scale(${pop(t, T.fisicos, 0.3)})`, ...stroke(8, "#05381a") }}>2014: ¡COMPROBADO!</div> : null}
        </div>) : null}
      {/* o diário de Merer */}
      {win(t, T.diario, T.p3 - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 190, top: 800, width: 700, opacity: win(t, T.diario, T.p3 - 0.1, 0.2), transform: `rotate(3deg) scale(${pop(t, T.diario, 0.3)})` }}>
          <svg viewBox="0 0 350 150" width="700" height="300">
            <rect x="30" y="20" width="290" height="110" fill="#f1e2b4" stroke="#8a6a3a" strokeWidth="4" />
            <rect x="12" y="12" width="26" height="126" rx="13" fill="#d9c48c" stroke="#8a6a3a" strokeWidth="4" /><rect x="312" y="12" width="26" height="126" rx="13" fill="#d9c48c" stroke="#8a6a3a" strokeWidth="4" />
            {Array.from({ length: 5 }, (_, r) => <path key={r} d={`M55 ${42 + r * 18} ${Array.from({ length: 12 }, (_, k) => `q 9 ${k % 2 ? 6 : -6} 18 0`).join(" ")}`} stroke="#3a2a1a" strokeWidth="3.4" fill="none" />)}
          </svg>
          <div style={{ marginTop: -10, textAlign: "center", fontFamily: FONT, fontSize: 52, color: "#ffd400", ...stroke(9, "#3a2300") }}>DIARIO DE MERER</div>
        </div>) : null}
      {/* forma exata da rampa: um mistério */}
      {win(t, T.misterio, T.p4 - 0.15, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: win(t, T.misterio, T.p4 - 0.15, 0.2), transform: `scale(${pop(t, T.misterio, 0.35)}) rotate(${Math.sin(t * 5) * 4}deg)` }}>
          <span style={{ fontFamily: FONT, fontSize: 300, color: "#ffffff", lineHeight: 1, ...stroke(20, "#14202b") }}>?</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.egypt, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#f3e6c8", fogNear: 130, fogFar: 520, hemiSky: "#fff4dc", hemiGround: "#d9b06a", hemiI: 1.15, sun: "#fff0d0", sunI: 2.6 },
};
// referência para lerp/ease sem aviso de import não usado
void lerp; void ease;
