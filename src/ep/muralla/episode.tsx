// E6 — Gran Muralla (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

const SHOTS: Shot[] = [
  { name: "a muralha na serra (lua, 20 mil km, arroz) → ⏪ planície", t0: 0, keys: [
    K(0, [-20, 30, 50], [0, 8, -12], 55, 2), K(T.veinte, [10, 26, 44], [12, 8, -12], 55, -2), K(T.arroz0, [14, 18, 30], [8, 9, -12], 50, 0),
    K(T.china, [12, 16, 34], [4, 7, -6], 54, 0), K(C1 - 0.05, [0, 8, 44], [-24, 1, 26], 58, 1)] },
  { name: "cavaleiros na planície → fôrma de tábuas", t0: C1, keys: [
    K(C1, [6, 3.5, 38], [-18, 1.5, 27], 56, 2), K(T.llanura, [4, 4, 36], [-14, 1, 24], 56, -1), K(T.b1, [0, 5, 32], [-12, 1.5, 18], 54, 1),
    K(T.cajon, [-5, 4.5, 24], [-11, 1.2, 16], 52, 0), K(T.mazo, [-6, 4, 22.5], [-11, 1.0, 16], 50, 0), K(C2 - 0.05, [-6.2, 4, 22.3], [-11, 1, 16], 50, 0)] },
  { name: "taipa do outro lado → chuva desmancha → Ming", t0: C2, keys: [
    K(C2, [-15, 4.5, 9], [-11, 1.3, 16], 52, -2), K(W3, [-14.5, 4.6, 9.4], [-11, 1.3, 16], 52, -1),
    K(W3 + 0.6, [-36, 9, 32], [-16, 1, 15], 58, 4), K(T.p1, [-34, 8, 31], [-16, 1, 15], 58, 0), K(T.siglo, [-28, 6, 27], [-16, 1, 15], 56, -1),
    K(T.b2, [-26, 6, 26], [-15, 1.5, 15], 56, 1), K(T.ming, [-24, 7, 28], [-12, 2, 14], 58, 0), K(C3 - 0.05, [-23, 7, 28], [-12, 2, 14], 58, 0)] },
  { name: "fornos → tijolo → tijolo ruim → o muro cai", t0: C3, keys: [
    K(C3, [12, 5, 20], [0, 1.5, 11], 54, 2), K(T.hornos, [10, 5.5, 22], [-1, 2, 10], 54, 0), K(T.ladrillo, [9, 8, 26], [-4, 3, 8], 56, -1),
    K(T.p2, [6, 4, 21], [-0.9, 1.2, 15.6], 50, 0), K(T.cae, [-4, 3.8, 24], [-12, 1.2, 16], 52, 1), K(T.culpa, [-5, 4, 25], [-12, 1.5, 16], 52, 0), K(C4 - 0.05, [-5, 4, 25], [-12, 1.5, 16], 52, 0)] },
  { name: "o selo na mesa", t0: C4, keys: [
    K(C4, [15.5, 4.0, 25.0], [11.5, 1.5, 18.6], 46, -2), K(T.grabado, [13.0, 2.9, 23.2], [11.5, 1.45, 18.8], 44, 0),
    K(T.sello, [11.0, 3.0, 23.4], [11.5, 1.5, 18.8], 46, 1), K(W6, [10.8, 3.1, 23.6], [11.5, 1.5, 18.8], 44, 0),
    K(C5 - 0.42, [10, 3.5, 23], [6, 14, 0], 56, 4), K(C5 - 0.02, [10, 3.5, 23.1], [6, 14, 0], 56, 4)] },
  { name: "juntas racham → arroz e cal → juntas fecham → mensageiro", t0: C5, keys: [
    K(C5, [23.5, 2.2, 20.5], [22, 1.9, 15.4], 46, -2), K(T.arroz - 0.8, [19.5, 3.4, 23], [17, 1.2, 18.5], 50, 0), K(T.cal, [20.5, 4.0, 24.5], [17, 1.0, 18.2], 50, 1),
    K(T.dura, [21, 3.0, 21], [21, 1.6, 15.5], 48, 0), K(T.argamasa, [22.2, 2.4, 20.2], [22, 1.9, 15.4], 46, 0), K(T.p4, [22, 3, 21], [22, 2, 15], 48, 0),
    K(T.mensajero, [30, 20, 52], [8, 4, 10], 58, 0), K(C6 - 0.05, [28, 20, 50], [8, 4, 10], 58, 0)] },
  { name: "torres: fumaça, fogo, canhão", t0: C6, keys: [
    K(C6, [-30, 24, 14], [6, 6, -14], 56, 2), K(T.fuego, [-16, 20, 10], [8, 8, -12], 54, 0), K(T.canon, [0, 14, 4], [8, 10, -12], 50, -1),
    K(T.enemigos, [-2, 15, 3], [8, 10, -12], 50, 1), K(T.senales, [-4, 18, 6], [8, 9, -12], 52, 0), K(C7 - 0.05, [-4, 18, 6], [8, 9, -12], 52, 0)] },
  { name: "o passo de Shanhai: o general abre a porta", t0: C7, keys: [
    K(C7, [50, 6, 14], [64, 4, -10], 56, -2), K(T.manchues, [52, 14, 10], [64, 2, -22], 56, 0), K(T.general, [58, 5, 4], [63.5, 2.5, -7], 52, 1),
    K(T.abrio, [56, 6, 8], [64, 3, -9], 54, 0), K(W10, [55, 7, 10], [64, 3, -8], 55, 0), K(W10 + 0.7, [52, 9, 14], [64, 4, -8], 56, 0), K(T.end, [50, 10, 16], [64, 4, -8], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([10, 9.95, -12.4], 0.3, "present")],
  [T.china, S([-8, 0, 21], -0.6, "alarm")],
  [T.llanura, S([-8, 0, 21], -0.3, "think")],
  [T.b1, S([-6, 0, 19.5], 0.3, "cheer")],
  [T.cajon, S([-6, 0, 19.5], -1.2, "point")],
  [T.apisonada, S([-12, 0, 13.6], 2.6, "cheer")],
  [T.p1, S([-12, 0, 20.5], 0.2, "alarm")],
  [T.b2, S([-12, 0, 20.5], 0.2, "cheer")],
  [T.ming, S([-12, 0, 20.5], 1.0, "point")],
  [C3, S([6.5, 0, 12], 0.9, "present")],
  [T.ladrillo, S([6.5, 0, 12], 0.7, "cheer")],
  [T.p2, S([3, 0, 17], 0.2, "think")],
  [T.cae, S([-9, 0, 19.5], 0.4, "alarm")],
  [C4, S([9.4, 0, 20.4], 0.9, "present")],
  [T.grabado, S([9.4, 0, 20.4], 0.9, "point")],
  [T.sello, S([9.4, 0, 20.4], 0.6, "cheer")],
  [C5, S([20.2, 0, 17.4], 0.6, "alarm")],
  [T.b4, S([20.2, 0, 17.4], 0.6, "cheer")],
  [T.arroz, S([17.6, 0, 16.9], 0.5, "pour")],
  [T.dura, S([20.2, 0, 17.4], 0.6, "point")],
  [T.argamasa, S([20.2, 0, 17.4], 0.4, "cheer")],
  [T.p4, S([20.2, 0, 17.4], 0.4, "think")],
  [C6, S([4, 10.5, -13], 0.5, "present")],
  [T.humo, S([4, 10.5, -13], -1.2, "point")],
  [T.senales, S([4, 10.5, -13], 0.5, "cheer")],
  [C7, S([60.5, 0, -3.5], 0.6, "present")],
  [T.manchues, S([60.5, 0, -3.5], 0.6, "alarm")],
  [T.abrio, S([60.5, 0, -3.5], 0.4, "think")],
];

const hud: HudData = {
  pills: [
    { a: T.luna, b: T.veinte - 0.1, label: "DESDE LA LUNA", value: () => "NO SE VE", y: 440, tone: "red" },
    { a: T.veinte, b: T.arroz0 - 0.1, label: "TODOS LOS TRAMOS", value: (t) => `+${count(t, T.veinte, T.veinte + 1.0, 0, 20000)} KM`, y: 440, tone: "gold" },
    { a: T.arroz0, b: T.china - 0.15, label: "PEGAMENTO", value: () => "ARROZ", y: 440, tone: "green" },
    { a: T.china, b: T.llanura - 0.1, label: "HACE", value: () => "+2000 AÑOS", y: 440, tone: "gold" },
    { a: T.llanura, b: T.b1 - 0.1, label: "PIEDRA", value: () => "0", y: 440, tone: "red" },
    { a: T.tierra, b: T.apisonada, label: "CAPAS", value: (t) => count(t, T.tierra, T.capa + 0.8, 1, 6), y: 440 },
    { a: T.siglo, b: T.b2 - 0.1, label: "MURO", value: () => "SE DESHACE", y: 440, tone: "red" },
    { a: T.hornos, b: T.ladrillo, label: "HORNOS", value: () => "JUNTO A LA OBRA", y: 440, tone: "gold" },
    { a: T.culpa, b: T.b3 - 0.1, label: "CULPABLE", value: () => "?", y: 440, tone: "red" },
    { a: T.grabado, b: T.sello + 0.6, label: "SELLO", value: () => "AÑO + UNIDAD", y: 440, tone: "green" },
    { a: T.hielo, b: T.b4 - 0.05, label: "HIELO", value: () => "GRIETAS", y: 440, tone: "red" },
    { a: T.cal, b: T.argamasa, label: "ARROZ + CAL", value: () => "MÁS DURA", y: 440, tone: "green" },
    { a: T.mensajero, b: T.b5 - 0.1, label: "MENSAJERO", value: () => "DÍAS", y: 440, tone: "red" },
    { a: T.canon, b: T.senales, label: "CAÑONAZOS", value: (t) => count(t, T.canon + 0.25, T.canon + 1.35, 1, 3), y: 440, tone: "gold" },
    { a: T.manchues, b: T.abrio, label: "AÑO", value: () => "1644", y: 440 },
  ],
  titles: [
    { a: T.apisonada, text: "TIERRA APISONADA" }, { a: T.ladrillo, text: "LADRILLO" }, { a: T.sello, text: "SELLO" },
    { a: T.argamasa, text: "ARGAMASA DE ARROZ" }, { a: T.senales, text: "TORRES DE SEÑALES" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.china, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.llanura, T.b1 - 0.1], [T.culpa, T.b3 - 0.1], [T.dias, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.abrio + 0.9, len: T.end - T.abrio - 0.9, top: "SIN ROMPERLA", big: (t) => `+${count(t, T.abrio + 0.9, T.abrio + 2.0, 0, 20000)} KM`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.luna + 0.2, T.veinte - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: win(t, T.luna + 0.2, T.veinte - 0.1, 0.2), transform: `scale(${pop(t, T.luna + 0.2, 0.3)})` }}>
          <svg viewBox="0 0 120 120" width="260" height="260">
            <circle cx="60" cy="60" r="44" fill="#f2f0e6" stroke="#2a2a2a" strokeWidth="5" /><circle cx="44" cy="48" r="8" fill="#d6d2c4" /><circle cx="72" cy="74" r="11" fill="#d6d2c4" /><circle cx="76" cy="40" r="5" fill="#d6d2c4" />
            <path d="M18 18 L102 102 M102 18 L18 102" stroke="#14202b" strokeWidth="16" strokeLinecap="round" /><path d="M18 18 L102 102 M102 18 L18 102" stroke="#ff2d2d" strokeWidth="9" strokeLinecap="round" />
          </svg>
        </div>) : null}
      {win(t, T.arroz0, T.china - 0.15, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 660, display: "flex", flexDirection: "column", alignItems: "center", opacity: win(t, T.arroz0, T.china - 0.15, 0.2), transform: `scale(${pop(t, T.arroz0, 0.3)})` }}>
          <svg viewBox="0 0 120 90" width="250" height="190">
            <ellipse cx="60" cy="38" rx="40" ry="16" fill="#fbfaf4" stroke="#2a2a2a" strokeWidth="4" />{[30, 45, 60, 75, 90, 52, 68].map((x, i) => <ellipse key={i} cx={x} cy={i > 4 ? 26 : 34} rx="5" ry="3" fill="#ffffff" stroke="#c9c4b4" strokeWidth="1.5" />)}
            <path d="M18 40 Q60 100 102 40 Z" fill="#2f5d8a" stroke="#2a2a2a" strokeWidth="4" /><path d="M30 52 Q60 70 90 52" stroke="#f2c14e" strokeWidth="4" fill="none" />
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 60, color: "#fff", ...stroke(10) }}>+ CAL</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.ming, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef2ea", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#8aa84a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
};
