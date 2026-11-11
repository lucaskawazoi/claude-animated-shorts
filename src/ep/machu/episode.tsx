// E5 — Machu Picchu (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
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

const SHOTS: Shot[] = [
  { name: "chuva, falhas, a cidade → ⏪ → dois picos", t0: 0, keys: [
    K(0, [24.0, 20.0, 32.0], [0.0, 9.0, -8.0], 58, 3), K(T.fallas, [30.0, 12.0, 36.0], [4.0, 4.0, -4.0], 60, -2),
    K(T.pie, [20.0, 18.0, 30.0], [0.0, 10.0, -10.0], 58, 2), K(T.peru, [12.0, 22.0, 34.0], [0.0, 10.0, -12.0], 58, 0),
    K(T.picos, [6.0, 16.0, 36.0], [0.0, 14.0, -20.0], 60, -1), K(C1 - 0.05, [8.0, 15.0, 34.0], [0.0, 13.0, -20.0], 60, 1)] },
  { name: "encosta: a casa escorrega → andenes", t0: C1, keys: [
    K(C1, [30.0, 8.0, 14.0], [14.0, 5.0, 4.0], 58, 2), K(T.desliza, [31.0, 7.0, 15.0], [16.0, 3.0, 5.0], 58, -1),
    K(T.b1, [30.0, 9.0, 16.0], [14.0, 6.0, 2.0], 58, 1), K(T.escalones, [28.0, 10.0, 18.0], [13.0, 6.0, 0.0], 58, 0), K(C2 - 0.05, [27.0, 10.0, 18.0], [13.0, 6.0, 0.0], 58, 0)] },
  { name: "andenes de perto → chuva e lama", t0: C2, keys: [
    K(C2, [21.0, 6.5, 9.0], [14.0, 5.5, 2.0], 50, -3), K(W3, [21.0, 6.8, 9.5], [14.0, 5.6, 2.0], 50, -2),
    K(W3 + 0.6, [32.0, 14.0, 20.0], [12.0, 6.0, -2.0], 58, 4), K(T.andenes, [33.0, 13.0, 21.0], [12.0, 6.0, -2.0], 58, 0),
    K(T.p2, [30.0, 12.0, 20.0], [16.0, 4.0, 2.0], 58, -1), K(T.b2, [28.0, 11.0, 20.0], [14.0, 5.0, 4.0], 58, 1), K(C3 - 0.05, [27.0, 11.0, 20.0], [14.0, 5.0, 5.0], 58, 0)] },
  { name: "corte do dreno", t0: C3, keys: [
    K(C3, [14.4, 8.0, 21.0], [11.5, 6.4, 13.6], 50, 1), K(T.piedras, [13.8, 7.4, 20.0], [11.5, 6.0, 13.6], 48, -1),
    K(T.sesenta, [14.8, 8.4, 21.6], [11.5, 6.5, 13.6], 52, 0), K(C4 - 0.05, [15.2, 8.8, 22.0], [11.5, 6.8, 13.6], 54, 0)] },
  { name: "terremoto → silharia", t0: C4, keys: [
    K(C4, [8.0, 13.5, 19.0], [1.0, 11.0, 8.6], 56, 2), K(T.b3, [7.0, 13.0, 18.0], [1.0, 11.0, 8.6], 56, -1),
    K(T.talladas, [5.0, 12.4, 15.5], [1.0, 11.2, 8.6], 52, 0), K(W6, [4.6, 12.2, 15.0], [1.0, 11.2, 8.6], 50, 0), K(C5 - 0.42, [3.0, 12.0, 16.0], [2.0, 22.0, -30.0], 58, 4), K(C5 - 0.02, [3.0, 12.0, 16.1], [2.0, 22.0, -30.0], 58, 4)] },
  { name: "porta trapezoidal → água → 16 fontes", t0: C5, keys: [
    K(C5, [4.6, 11.8, 14.6], [1.0, 11.0, 8.6], 50, -2), K(T.aguanta, [5.6, 12.2, 15.6], [1.0, 11.2, 8.6], 52, 1),
    K(T.silleria, [7.0, 13.0, 17.0], [1.0, 11.2, 8.6], 56, 0), K(T.p4, [4.0, 14.0, 14.0], [-2.0, 10.0, 2.0], 58, 1),
    K(T.manantial, [2.0, 14.0, 19.0], [-3.8, 10.4, 9.0], 56, -1), K(T.dieciseis, [-3.6, 13.2, 15.4], [-3.8, 10.2, 2.0], 56, 1), K(C6 - 0.05, [-3.6, 12.9, 14.4], [-3.8, 10.2, 1.0], 56, 0)] },
  { name: "fontes de perto → pedreira", t0: C6, keys: [
    K(C6, [-1.6, 10.9, 4.4], [-3.8, 10.4, 2.6], 50, 2), K(T.fuentes + 0.5, [-1.4, 11.2, 4.8], [-3.8, 10.4, 2.4], 52, 0), K(T.p5 + 0.4, [8.5, 14.5, 4.0], [3.4, 10.8, -12.0], 56, -1),
    K(T.b5, [8.0, 13.0, -7.5], [3.4, 11.0, -14.2], 54, 1), K(C7 - 0.05, [8.0, 12.6, -8.0], [3.4, 11.0, -14.2], 54, 0)] },
  { name: "a rocha se parte → cidade vazia → intacta", t0: C7, keys: [
    K(C7, [0.4, 11.6, -10.6], [3.6, 11.4, -13.4], 46, -2), K(T.labra, [0.0, 12.0, -10.0], [3.4, 11.2, -13.6], 50, 1),
    K(T.siglo, [18.0, 18.0, 20.0], [0.0, 10.0, -6.0], 58, 0), K(T.espanoles, [20.0, 20.0, 26.0], [0.0, 10.0, -8.0], 58, -1),
    K(T.intacta, [22.0, 22.0, 30.0], [0.0, 10.0, -10.0], 58, 1), K(W10, [23.0, 22.0, 31.0], [0.0, 10.0, -10.0], 58, 0),
    K(W10 + 0.7, [16.0, 20.0, 32.0], [0.0, 11.0, -12.0], 58, 0), K(T.end, [14.0, 20.0, 33.0], [0.0, 11.0, -12.0], 58, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([3.0, H, 8.0], 0.4, "present")],
  [C1, S([8.4, H, 6.0], 1.0, "present")],
  [T.p1, S([8.4, H, 6.0], 1.0, "alarm")],
  [T.b1, S([8.4, H, 6.0], 1.0, "cheer")],
  [T.escalones, S([8.4, H, 6.0], 1.3, "point")],
  [C3, S([9.0, H - 0.94 * 0, 11.0], 0.6, "point")],
  [T.sesenta, S([9.0, H, 11.0], 0.6, "cheer")],
  [C4, S([4.8, H, 11.0], 0.3, "alarm")],
  [T.b3, S([4.8, H, 11.0], 0.3, "cheer")],
  [T.talladas, S([4.6, H, 11.0], -0.6, "point")],
  [C5, S([-2.6, H, 10.2], 0.5, "present")],
  [T.silleria, S([-2.6, H, 10.2], 0.5, "cheer")],
  [T.p4, S([-1.6, H, 4.6], 0.4, "think")],
  [T.manantial, S([-1.6, H, 4.6], 0.9, "point")],
  [C6, S([-2.4, H, 2.4], 0.6, "cheer")],
  [T.p5, S([2.2, H, -6.0], 0.2, "think")],
  [T.b5, S([2.2, H, -6.0], 0.2, "cheer")],
  [T.cantera, S([6.2, H, -11.4], -0.5, "point")],
  [T.labra, S([6.0, H, -11.6], -0.7, "chisel", { prop: "hammer" })],
  [T.siglo, S([6.0, H, -11.6], 0, "idle", { scale: 0 })],
  [T.intacta, S([6.0, H, 8.0], 0.5, "cheer")],
];

const LAYERS: [number, string][] = [[T.tierra, "TIERRA"], [T.arena, "ARENA"], [T.grava, "GRAVA"], [T.piedras, "PIEDRAS"]];
const hud: HudData = {
  pills: [
    { a: T.lluvia, b: T.fallas - 0.1, label: "LLUVIA", value: () => "~2.000 mm/AÑO", y: 440 },
    { a: T.fallas, b: T.pie - 0.1, label: "FALLAS", value: () => "SÍSMICAS", y: 440, tone: "red" },
    { a: T.pie, b: T.peru - 0.15, label: "EN PIE", value: () => "+500 AÑOS", y: 440, tone: "gold" },
    { a: T.peru, b: T.picos, label: "HACE", value: () => "~600 AÑOS", y: 440, tone: "gold" },
    { a: T.tierra, b: T.escurre, label: "CAPA", value: (t) => LAYERS.filter(([a]) => t >= a - 0.1).slice(-1)[0]?.[1] ?? "", y: 440 },
    { a: T.sesenta, b: T.drenaje + 0.6, label: "BAJO TIERRA", value: (t) => `~${count(t, T.sesenta, T.sesenta + 0.8, 0, 60)}%`, y: 440, tone: "green" },
    { a: T.talladas, b: T.silleria, label: "MORTERO", value: () => "0", y: 440, tone: "green" },
    { a: T.canal, b: T.fuentes, label: "CANAL", value: () => "~750 m", y: 440 },
    { a: T.dieciseis, b: T.fuentes + 0.8, label: "FUENTES", value: (t) => count(t, T.dieciseis, T.dieciseis + 0.8, 0, 16), y: 550, tone: "green" },
    { a: T.carreta, b: T.b5 - 0.1, label: "CARRETAS", value: () => "0", y: 440, tone: "red" },
    { a: T.vacia, b: T.espanoles - 0.1, label: "CIUDAD", value: () => "VACÍA", y: 440 },
  ],
  titles: [
    { a: T.andenes, text: "ANDENES" }, { a: T.drenaje, text: "DRENAJE" }, { a: T.silleria, text: "SILLERÍA INCA" },
    { a: T.fuentes, text: "FUENTES" }, { a: T.cantera, text: "CANTERA", len: 1.6 },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.peru, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.desliza, T.b1 - 0.1], [T.carreta, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.intacta, len: T.end - T.intacta, top: "CASI INTACTA", big: (t) => `+${count(t, T.intacta, T.intacta + 1.2, 0, 500)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.espanoles, T.intacta - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 700, display: "flex", flexDirection: "column", alignItems: "center", opacity: win(t, T.espanoles, T.intacta - 0.1, 0.2), transform: `scale(${pop(t, T.espanoles, 0.3)})` }}>
          <svg viewBox="0 0 120 90" width="280" height="210">
            <path d="M14 58 Q60 50 106 58 L96 64 Q60 58 24 64 Z" fill="#c9ccd2" stroke="#2a2a2a" strokeWidth="4" />
            <path d="M30 58 Q34 22 60 18 Q86 22 90 58 Z" fill="#dfe2e6" stroke="#2a2a2a" strokeWidth="4" /><path d="M60 18 Q66 8 74 10" stroke="#2a2a2a" strokeWidth="4" fill="none" />
            <path d="M22 16 L98 80 M98 16 L22 80" stroke="#14202b" strokeWidth="16" strokeLinecap="round" /><path d="M22 16 L98 80 M98 16 L22 80" stroke="#ff2d2d" strokeWidth="9" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 64, color: "#fff", ...stroke(10) }}>NUNCA LA SAQUEARON</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.inca, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e9f1f6", fogNear: 110, fogFar: 480, hemiSky: "#f2f7ff", hemiGround: "#5aa842", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
};
