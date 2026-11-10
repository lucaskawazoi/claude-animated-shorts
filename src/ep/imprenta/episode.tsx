// E4 — La imprenta de Gutenberg (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
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
const Y = 0.3; // piso da oficina

const SHOTS: Shot[] = [
  { name: "copista → 180 Bíblias → Maguncia", t0: 0, keys: [
    K(0, [-12.8, 2.6, 1.8], [-14.0, 1.6, -2.5], 48, 2), K(T.gutenberg, [-12.0, 3.0, 3.0], [-14.0, 1.6, -2.5], 52, -1),
    K(T.ciento, [12.6, 3.4, 4.4], [15.8, 1.8, -2.0], 50, 3), K(T.maguncia, [6.0, 10.0, 22.0], [-6.0, 4.0, -10.0], 60, -1), K(C1 - 0.05, [-6.0, 9.0, 20.0], [-12.0, 3.0, -6.0], 60, 1)] },
  { name: "copista → tipos móveis", t0: C1, keys: [
    K(C1, [-12.4, 2.4, 2.2], [-14.0, 1.7, -2.4], 46, -2), K(T.b1, [-12.0, 2.8, 3.5], [-13.5, 1.6, -2.4], 50, 2),
    K(T.separar, [-6.0, 3.6, 5.0], [-7.5, 1.6, -3.2], 54, 0), K(T.imprimen, [-5.0, 3.0, 3.6], [-5.5, 1.3, -1.6], 50, 1), K(C2 - 0.05, [-5.0, 3.0, 3.4], [-5.5, 1.3, -1.6], 50, 0)] },
  { name: "forma de perto → caixa → fundição", t0: C2, keys: [
    K(C2, [-3.6, 1.9, 0.4], [-5.5, 1.3, -1.6], 44, -3), K(W3, [-3.8, 2.0, 0.6], [-5.6, 1.3, -1.6], 44, -2),
    K(W3 + 0.6, [-7.0, 4.2, 6.0], [-8.5, 2.0, -4.6], 56, 4), K(T.p1, [-7.5, 4.0, 5.5], [-8.5, 2.2, -4.6], 54, 0),
    K(T.b2, [-6.0, 3.8, 5.5], [-7.0, 1.8, -3.5], 56, 2), K(T.molde, [0.5, 3.6, 4.5], [-0.5, 1.6, -3.0], 54, -1), K(C3 - 0.05, [1.0, 3.6, 4.4], [0.0, 1.6, -3.0], 54, 0)] },
  { name: "fundição → tinta de água escorre", t0: C3, keys: [
    K(C3, [-1.8, 2.6, 2.0], [0.6, 1.5, -2.0], 50, 2), K(T.sale, [0.2, 2.5, 1.6], [1.4, 1.4, -2.0], 46, 0),
    K(T.esteMolde, [1.0, 3.2, 3.2], [0.5, 1.5, -2.5], 52, 1), K(T.p2, [-3.6, 2.6, 2.4], [-5.5, 1.3, -1.6], 50, -1), K(C4 - 0.05, [-3.8, 2.6, 2.2], [-5.5, 1.3, -1.6], 50, 0)] },
  { name: "tinta de óleo → para a prensa", t0: C4, keys: [
    K(C4, [6.6, 2.8, 1.6], [5.0, 1.4, -3.2], 48, -2), K(T.estaTinta, [6.0, 3.2, 2.5], [5.0, 1.4, -3.2], 52, 1),
    K(T.p3, [9.0, 3.4, 4.0], [11.5, 1.6, -3.0], 54, 0), K(W6, [9.4, 3.4, 4.2], [11.5, 1.6, -3.0], 54, 0), K(C5 - 0.05, [13.5, 4.8, 3.6], [11.5, 2.2, -3.0], 56, 5)] },
  { name: "prensa → prensa de uva no Reno → 300 tipos", t0: C5, keys: [
    K(C5, [14.0, 3.0, 2.6], [11.5, 2.0, -3.0], 52, -2), K(T.prensa, [13.2, 3.4, 3.4], [11.5, 2.4, -3.0], 54, 1),
    K(T.uvas - 0.3, [14.0, 3.6, 4.0], [11.5, 2.4, -3.0], 54, 0), K(T.uvas + 0.4, [32.0, 3.6, 13.5], [29.0, 1.6, 9.0], 54, 3),
    K(T.rin, [32.5, 3.4, 13.2], [29.0, 1.5, 9.0], 52, -1), K(T.estaPrensa + 0.3, [13.6, 3.0, 3.0], [11.5, 1.6, -3.0], 52, 2),
    K(T.p4, [14.0, 3.4, 3.6], [12.0, 1.4, -2.6], 54, 0), K(T.trescientos, [-6.5, 4.0, 2.2], [-8.5, 2.2, -4.6], 52, 1), K(C6 - 0.05, [-6.8, 4.1, 2.0], [-8.5, 2.2, -4.6], 52, 0)] },
  { name: "o giro: dinheiro e Fust", t0: C6, keys: [
    K(C6, [0.0, 7.0, 14.0], [2.0, 2.0, -3.0], 60, 2), K(T.giro, [4.0, 6.0, 12.0], [6.0, 2.0, -2.0], 60, -10),
    K(T.fortuna, [14.0, 4.6, 9.0], [18.0, 1.8, 0.0], 56, 6), K(T.prestado, [16.0, 3.6, 7.0], [19.5, 2.0, 0.2], 52, 0), K(C7 - 0.05, [15.8, 3.6, 6.6], [19.5, 2.0, 0.2], 52, 0)] },
  { name: "juízo → levam a prensa → hoje: 49", t0: C7, keys: [
    K(C7, [6.5, 3.2, 4.4], [6.0, 1.4, 0.6], 48, 2), K(T.gano, [7.2, 3.0, 4.0], [6.0, 1.4, 0.6], 46, -1),
    K(T.quedo, [12.0, 6.0, 12.0], [16.0, 1.6, -2.0], 58, 1), K(T.cambio, [0.0, 12.0, 24.0], [0.0, 3.0, -6.0], 60, 0),
    K(T.hoy, [1.6, 3.4, 5.2], [0.0, 1.6, 0.8], 50, 1), K(W10, [2.0, 3.6, 5.6], [0.0, 1.7, 0.8], 50, 0), K(W10 + 0.7, [3.0, 4.8, 8.0], [0.0, 1.8, 0.0], 56, 0), K(T.end, [3.4, 5.0, 8.6], [0.0, 1.8, 0.0], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([13.8, Y, 0.6], 0, "present", { scale: 0 })],
  [T.gutenberg, S([13.6, Y, 0.8], -0.3, "cheer")],
  [C1, S([-11.4, Y, 0.6], -0.4, "present")],
  [T.letra, S([-11.4, Y, 0.6], -0.4, "think")],
  [T.b1, S([-11.4, Y, 0.6], -0.4, "cheer")],
  [T.separar, S([-6.8, Y, 0.6], 0.3, "point")],
  [T.p1, S([-6.6, Y, 0.8], 0.2, "alarm")],
  [T.b2, S([-6.6, Y, 0.8], 0.2, "think")],
  [T.molde, S([0.9, Y, -1.2], -0.8, "pour", { prop: "jar" })],
  [T.sale, S([0.9, Y, -1.2], -0.2, "cheer")],
  [T.p2, S([-4.0, Y, 0.4], 0.3, "alarm")],
  [T.tinta, S([6.2, Y, -1.4], -0.3, "present")],
  [T.p3, S([10.0, Y, -0.4], 0.2, "think")],
  [T.prensa, S([12.8, Y, -1.4], -0.7, "pull")],
  [T.p4, S([10.4, Y, -0.6], 0.3, "think")],
  [T.trescientos, S([-6.8, Y, -1.2], -0.3, "point")],
  [T.giro, S([8.0, Y, 0.6], 0.3, "alarm")],
  [T.fortuna, S([16.0, Y, 0.6], 0.6, "belly")],
  [T.prestado, S([16.0, Y, 0.6], 0.8, "present")],
  [C7, S([4.2, Y, 1.2], 0.4, "alarm")],
  [T.quedo, S([10.0, Y, 0.8], 0.6, "think")],
  [T.hoy, S([-1.8, Y, 1.6], 0.5, "present")],
  [T.cuarenta, S([-1.8, Y, 1.6], 0.5, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.anio, b: T.gutenberg - 0.1, label: "UN COPISTA", value: () => "+1 AÑO", y: 440, tone: "red" },
    { a: T.ciento, b: T.maguncia - 0.1, label: "BIBLIAS", value: (t) => count(t, T.ciento, T.ciento + 0.9, 0, 180), y: 440, tone: "green" },
    { a: T.mil450, b: T.europa, label: "AÑO", value: () => "≈ 1450", y: 440, tone: "gold" },
    { a: T.usar, b: T.p1 - 0.1, label: "TIPOS", value: () => "REUSABLES", y: 440, tone: "green" },
    { a: T.miles, b: T.b2 - 0.1, label: "LETRAS", value: (t) => count(t, T.miles, T.iguales + 0.4, 0, 3000), y: 440, tone: "red" },
    { a: T.viertes, b: T.esteMolde, label: "ALEACIÓN", value: () => "Pb · Sn · Sb", y: 440 },
    { a: T.resbala, b: T.b3 - 0.1, label: "TINTA DE AGUA", value: () => "RESBALA", y: 440, tone: "red" },
    { a: T.tinta, b: T.estaTinta, label: "TINTA", value: () => "ACEITE + HOLLÍN", y: 440, tone: "green" },
    { a: T.trescientos, b: T.giro - 0.1, label: "TIPOS DISTINTOS", value: (t) => `≈ ${count(t, T.trescientos, T.unidas + 0.5, 0, 290)}`, y: 440 },
    { a: T.prestado, b: T.juicio - 0.1, label: "GUTENBERG", value: () => "PIDE PRESTADO", y: 440, tone: "red" },
    { a: T.juicio, b: T.cambio - 0.1, label: "JUICIO", value: () => "1455", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.tipos, text: "TIPOS MÓVILES" }, { a: T.esteMolde, text: "MOLDE" }, { a: T.estaTinta, text: "TINTA" },
    { a: T.estaPrensa, text: "PRENSA" }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 },
  ],
  alerts: [T.letra, T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.resbala, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.hoy, len: T.end - T.hoy, top: "HOY SOBREVIVEN", big: (t) => `${count(t, T.hoy, T.cuarenta + 0.6, 0, 49)} BIBLIAS`, sub: "DE UNAS 180 · SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.gano, T.quedo + 1.4, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 760, display: "flex", flexDirection: "column", alignItems: "center", opacity: win(t, T.gano, T.quedo + 1.4, 0.2), transform: `scale(${pop(t, T.gano, 0.3)})` }}>
          <svg viewBox="0 0 120 90" width="300" height="225"><path d="M60 8 V78 M30 78 H90 M18 22 H102" stroke="#3a2300" strokeWidth="7" strokeLinecap="round" /><path d="M18 22 L6 52 H30 Z M102 22 L90 44 H114 Z" fill="#ffd400" stroke="#3a2300" strokeWidth="5" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: FONT, fontSize: 64, color: "#fff", ...stroke(10) }}>FUST GANA EL JUICIO</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.printer, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef3fa", fogNear: 120, fogFar: 520, hemiSky: "#fff6e4", hemiGround: "#b98a58", hemiI: 1.25, sun: "#fff0d0", sunI: 2.5 },
};
