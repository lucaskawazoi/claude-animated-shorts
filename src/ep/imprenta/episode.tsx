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
    K(0, [-12.2, 4.0, 4.6], [-14.0, 1.8, -3.0], 50, 2), K(T.gutenberg, [-11.6, 4.2, 5.4], [-14.0, 1.8, -3.0], 52, -1),
    K(T.ciento, [13.6, 4.2, 5.6], [15.8, 1.8, -2.0], 52, 3), K(T.maguncia, [6.0, 10.0, 22.0], [-6.0, 4.0, -10.0], 60, -1), K(C1 - 0.05, [-6.0, 9.0, 20.0], [-12.0, 3.0, -6.0], 60, 1)] },
  { name: "copista → tipos móveis", t0: C1, keys: [
    K(C1, [-12.6, 3.6, 3.6], [-14.0, 2.0, -3.0], 48, -2), K(T.b1, [-11.8, 4.0, 5.0], [-13.6, 1.8, -3.0], 52, 2),
    K(T.separar, [-5.6, 4.6, 6.6], [-7.6, 1.8, -3.4], 56, 0), K(T.piezas + 0.6, [-7.4, 3.8, -0.4], [-8.4, 2.0, -4.3], 46, 1), K(C2 - 0.05, [-7.3, 3.8, -0.5], [-8.4, 2.0, -4.3], 46, 0)] },
  { name: "caixa → forma (letras voam) → imprime → voltam → miles de letras", t0: C2, keys: [
    K(C2, [-4.4, 6.2, 3.0], [-6.8, 1.4, -2.9], 54, -3), K(W3 - 0.1, [-3.8, 5.0, 2.2], [-5.6, 1.2, -1.8], 48, -2),
    K(W3 + 0.6, [-7.8, 4.6, 2.0], [-5.6, 1.2, -1.8], 48, 4), K(T.usar + 0.5, [-6.0, 5.8, 3.6], [-7.0, 1.6, -3.0], 54, 0),
    K(T.p1, [-6.4, 4.6, 5.0], [-8.5, 2.2, -4.4], 54, 0), K(C3 - 0.05, [-5.6, 4.6, 5.6], [-7.6, 2.0, -3.6], 56, 1)] },
  { name: "fundição: concha → molde → letra idêntica → tinta de água escorre", t0: C3, keys: [
    K(C3, [-1.6, 3.8, 4.6], [0.2, 1.5, -2.6], 52, 2), K(T.viertes, [1.8, 3.0, 1.6], [0.7, 1.5, -2.1], 46, 0),
    K(T.sale, [1.7, 2.6, 0.9], [1.0, 1.4, -2.1], 44, 0), K(T.esteMolde, [2.4, 3.6, 3.2], [0.6, 1.5, -2.4], 50, 1), K(T.p2, [-4.0, 4.4, 3.2], [-5.5, 1.1, -1.6], 48, -1), K(C4 - 0.05, [-4.1, 4.3, 3.0], [-5.5, 1.1, -1.6], 48, 0)] },
  { name: "tinta de óleo → para a prensa", t0: C4, keys: [
    K(C4, [6.8, 3.4, 2.2], [5.0, 1.3, -3.2], 48, -2), K(T.espesa, [6.2, 2.9, 0.8], [4.7, 1.3, -3.2], 44, 0),
    K(T.pega, [5.9, 2.7, 0.6], [5.3, 1.3, -3.2], 42, 0), K(T.papel + 0.2, [6.2, 3.0, 1.2], [5.4, 1.5, -3.1], 44, 0),
    K(T.estaTinta + 0.3, [6.6, 4.0, 4.4], [5.0, 1.4, -3.2], 52, 1),
    K(W6, [9.8, 4.4, 6.4], [11.5, 1.8, -3.0], 56, 0), K(C5 - 0.42, [3.0, 10.0, 17.0], [8.0, 2.0, -3.0], 60, 5), K(C5 - 0.02, [3.1, 10.0, 17.0], [8.0, 2.0, -3.0], 60, 5)] },
  { name: "prensa: parafuso gira, a platina desce e aperta a folha (sem sair dela)", t0: C5, keys: [
    K(C5, [15.2, 4.4, 4.6], [11.5, 2.0, -3.0], 54, -2), K(T.b4, [14.8, 4.2, 4.0], [11.5, 2.1, -3.0], 54, 1),
    K(T.prensa, [14.0, 3.6, 2.6], [11.5, 1.9, -2.8], 52, 0), K(T.rin, [13.2, 3.4, 2.0], [11.5, 1.8, -2.8], 50, -1),
    K(T.girar, [13.0, 3.0, 1.6], [11.5, 1.6, -2.8], 46, 0), K(T.aprieta, [12.4, 3.3, 2.6], [11.5, 1.4, -2.7], 46, 1),
    K(T.estaPrensa, [14.0, 3.8, 3.4], [11.5, 1.6, -2.8], 52, 0), K(T.p4, [14.6, 4.4, 5.4], [12.0, 1.4, -2.6], 56, 0), K(C6 - 0.05, [14.8, 4.6, 6.0], [12.0, 1.4, -2.6], 56, 0)] },
  { name: "300 tipos → o giro", t0: C6, keys: [
    K(C6, [-6.8, 5.2, 5.4], [-8.5, 2.2, -4.6], 54, -2), K(T.trescientos, [-6.0, 4.8, 4.4], [-8.5, 2.2, -4.6], 52, 1),
    K(T.giro - 0.2, [-6.2, 4.9, 4.2], [-8.5, 2.2, -4.6], 52, 0), K(C7 - 0.05, [-5.4, 5.4, 5.6], [-8.0, 2.2, -4.0], 56, -10)] },
  { name: "dinheiro e Fust → juízo → levam a prensa → hoje: 49", t0: C7, keys: [
    K(C7, [10.0, 4.6, 11.0], [15.0, 1.8, 3.0], 56, 6), K(T.prestado, [10.4, 4.4, 10.0], [15.0, 1.8, 2.4], 54, 0),
    K(T.juicio + 0.2, [7.6, 4.2, 6.8], [6.0, 1.3, 0.6], 50, 2), K(T.gano, [7.8, 4.0, 6.4], [6.0, 1.3, 0.6], 48, -1),
    K(T.quedo, [8.0, 6.0, 16.0], [14.0, 1.6, 4.0], 58, 1), K(T.cambio, [0.0, 12.0, 24.0], [0.0, 3.0, -6.0], 60, 0),
    K(T.hoy, [1.8, 4.0, 6.8], [0.0, 1.6, 0.8], 52, 1), K(W10, [2.2, 4.2, 7.2], [0.0, 1.7, 0.8], 52, 0), K(W10 + 0.7, [3.0, 5.2, 9.0], [0.0, 1.8, 0.0], 56, 0), K(T.end, [3.4, 5.4, 9.6], [0.0, 1.8, 0.0], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.05, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([13.8, Y, 0.6], 0, "present", { scale: 0 })],
  [T.gutenberg, S([13.6, Y, 0.8], -0.3, "cheer")],
  [C1, S([-11.4, Y, 0.6], -0.4, "present")],
  [T.letra, S([-11.4, Y, 0.6], -0.4, "think")],
  [T.b1, S([-11.4, Y, 0.6], -0.4, "cheer")],
  [T.separar, S([-10.6, Y, -2.4], 0.6, "point")],
  [T.p1, S([-10.4, Y, -2.0], 0.5, "alarm")],
  [T.b2, S([-10.4, Y, -2.0], 0.5, "think")],
  [T.molde, S([1.7, Y, -3.3], -0.2, "point")],
  [T.sale, S([1.7, Y, -3.3], -0.2, "cheer")],
  [T.p2, S([-7.8, Y, 0.0], 0.5, "alarm")],
  [T.tinta, S([6.5, Y, -4.4], -0.4, "present")],
  [T.p3, S([10.0, Y, -0.4], 0.2, "think")],
  [T.prensa, S([14.1, Y, -3.4], -1.4, "pull")],
  [T.p4, S([10.4, Y, -0.6], 0.3, "think")],
  [C6, S([-10.4, Y, -2.6], 0.5, "think")],
  [T.trescientos, S([-10.4, Y, -2.6], 0.5, "point")],
  [T.giro, S([-10.4, Y, -2.6], 0.5, "alarm")],
  [C7, S([12.6, Y, 1.4], 0.6, "belly")],
  [T.prestado, S([12.6, Y, 1.4], 0.8, "present")],
  [T.juicio, S([4.2, Y, 1.2], 0.4, "alarm")],
  [T.quedo, S([10.0, Y, 0.8], 0.6, "think")],
  [T.hoy, S([-1.8, Y, 1.6], 0.5, "present")],
  [T.cuarenta, S([-1.8, Y, 1.6], 0.5, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.anio, b: T.gutenberg - 0.1, label: "UN COPISTA", value: () => "+1 AÑO", y: 440, tone: "red" },
    { a: T.ciento, b: T.maguncia - 0.1, label: "BIBLIAS", value: (t) => count(t, T.ciento, T.ciento + 0.9, 0, 180), y: 440, tone: "green" },
    { a: T.mil450, b: T.nohay - 0.1, label: "AÑO", value: () => "≈ 1450", y: 440, tone: "gold" },
    { a: T.nohay, b: T.europa - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.usar, b: T.p1 - 0.1, label: "TIPOS", value: () => "REUSABLES", y: 440, tone: "green" },
    { a: T.miles, b: T.b2 - 0.1, label: "LETRAS", value: (t) => count(t, T.miles, T.iguales + 0.4, 0, 3000), y: 440, tone: "red" },
    { a: T.viertes, b: T.esteMolde, label: "ALEACIÓN", value: () => "Pb · Sn · Sb", y: 440 },
    { a: T.resbala, b: T.b3 - 0.1, label: "TINTA DE AGUA", value: () => "RESBALA", y: 440, tone: "red" },
    { a: T.tinta, b: T.estaTinta, label: "TINTA", value: () => "ACEITE + HOLLÍN", y: 440, tone: "green" },
    { a: T.uvas, b: T.girar - 0.1, label: "IDEA", value: () => "PRENSA DE UVAS", y: 440, tone: "gold" },
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
  stamps: [[T.b1, T.c1, "SIN ESCRIBIR"], [T.b2, T.c2, "SIN FÁBRICA"], [T.b4, T.c4, "SIN MOTOR"]],
  reward: { a: T.hoy, len: T.end - T.hoy, top: "HOY SOBREVIVEN", big: (t) => `${count(t, T.hoy, T.cuarenta, 0, 49)} BIBLIAS`, sub: "DE UNAS 180" },
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
