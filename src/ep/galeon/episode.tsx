// E10 — Galeón de Manila (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { SEA_SCENE, World, dusk } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [SX, , SZ] = SEA_SCENE;

const SHOTS: Shot[] = [
  { name: "o Pacífico: a rota de 250 anos → ⏪ Cebu 1565", t0: 0, keys: [
    K(0, [14, 5, -24], [4, 3, -36], 52, 6), K(T.veces, [-2, 9, -22], [4, 3, -38], 54, -6), K(T.unio, [10, 70, 22], [6, 0, -10], 56, 3), K(T.tres, [5, 142, 37], [5, 0, -4], 58, 0), K(T.cebu + 0.9, [-6, 30, 34], [-16, 1, 10], 54, 0),
    K(C1 - 0.05, [-6, 20, 28], [-16, 1, 10], 54, 1)] },
  { name: "o vento empurra de volta → o frade Urdaneta", t0: C1, keys: [
    K(C1, [-24, 4, 18], [-12, 2, 10], 52, 2), K(T.volver, [-22, 5, 18], [-8, 2, 10], 52, 0), K(T.viento, [-18, 6, 20], [-8, 2, 10], 54, 0),
    K(T.b1, [-18, 7, 22], [-10, 2, 10], 54, 0), K(T.fraile, [-16, 4, 15], [-11.5, 2.6, 10.4], 46, 0), K(C2 - 0.05, [-15.6, 4, 15], [-11.5, 2.6, 10.4], 46, 0)] },
  { name: "mapa: o tornaviaje pelo norte, ventos e Kuroshio", t0: C2, keys: [
    K(C2, [16, 150, 46], [8, 0, -4], 58, -8), K(W3, [-10, 122, 28], [-4, 0, -10], 58, 8), K(W3 + 0.6, [0, 128, 30], [0, 0, -12], 58, 3),
    K(T.este, [6, 134, 32], [6, 0, -12], 58, 0), K(C3 - 0.05, [7, 132, 31], [7, 0, -13], 58, 0)] },
  { name: "meses em mar aberto → o estaleiro de molave", t0: C3, keys: [
    K(C3, [SX + 8, 5, SZ + 8], [SX, 2.5, SZ], 52, 2), K(T.abierto, [SX + 12, 8, SZ + 12], [SX, 2, SZ], 56, 0), K(T.b2 + 0.4, [0, 40, -20], [-10, 0, -14], 56, 0),
    K(T.barcos, [-14, 6, -2], [-21, 1.5, -9], 52, 0), K(T.molave, [-15, 5, -3], [-21, 1.2, -9], 50, 0), K(C4 - 0.05, [-15, 5, -3], [-21, 1.2, -9], 50, 0)] },
  { name: "sede no convés → tinajas no porão", t0: C4, keys: [
    K(C4, [SX + 6, 5, SZ + 6], [SX, 2.5, SZ], 48, -2), K(T.p3, [SX + 4, 4.5, SZ + 6], [SX, 1.5, SZ], 48, 0),
    K(W6, [SX + 3.5, 4.2, SZ + 6], [SX, 1.4, SZ], 48, 0), K(C5 - 0.42, [SX + 1.2, 3.6, SZ + 5.7], [SX + 30, 1, SZ + 40], 58, 4), K(C5 - 0.02, [SX + 1.2, 3.6, SZ + 5.8], [SX + 30, 1, SZ + 40], 58, 4)] },
  { name: "tinajas nas vergas e a chuva → mercado de Manila → minas → cunhagem", t0: C5, keys: [
    K(C5, [SX - 3, 4, SZ + 6], [SX, 1, SZ], 50, 2), K(T.miles + 0.6, [SX - 2, 3.2, SZ + 5], [SX, 0.8, SZ], 48, 0), K(T.colgadas, [SX - 6, 7, SZ + 8], [SX, 5, SZ], 52, 0), K(T.tinajasT, [SX - 7, 8, SZ + 9], [SX, 5, SZ], 54, 0), K(T.p4 + 0.2, [-6, 40, -10], [-20, 0, -4], 56, 0),
    K(T.europeos, [-26, 4, 7], [-26, 1.8, 1], 48, 0), K(T.plata0 + 0.4, [-25, 4.4, 7.4], [-25.4, 1.8, 1], 48, 0), K(T.b4 + 0.4, [10, 60, 10], [20, 0, 4], 56, 0),
    K(T.mexico, [30, 26, 2], [45, 2, 10], 54, 0), K(T.acunada - 0.1, [34.5, 9.5, 14], [42, 1.5, 7.5], 50, 0), K(C6 - 0.05, [34.6, 9.2, 14.2], [42, 1.5, 7.5], 50, 0)] },
  { name: "moedas em meio mundo → o navio de guerra britânico", t0: C6, keys: [
    K(C6, [6, 130, 36], [6, 0, -4], 58, -2), K(T.realT, [5, 126, 34], [5, 0, -4], 58, 0), K(T.blanco, [4, 8, 12], [-4, 2, -1], 52, 0), K(T.y1743, [2, 6, 10], [-4, 2, -1], 50, 0), K(C7 - 0.05, [2, 6, 10], [-4, 2, -1], 50, 0)] },
  { name: "a captura do Covadonga → o último galeão → o comércio mundial", t0: C7, keys: [
    K(C7, [-16, 5, -8], [-5, 2, 0], 50, 2), K(T.millon, [-15, 6, -9], [-6, 2, 0], 52, 0), K(T.ultimo + 0.9, [-6, 7, 16], [-12, 2, 6], 52, 0),
    K(T.historiadores, [-2, 10, 20], [-10, 2, 6], 54, 0), K(T.mundial, [6, 145, 38], [6, 0, -4], 58, 0), K(W10, [6, 140, 36], [6, 0, -4], 58, 0), K(T.end, [-30, 70, 30], [8, 0, -8], 60, 10)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([0, 0, 0], 0, "idle", { scale: 0 })],
  [T.cebu, S([-19.2, 0.75, 9.6], -1.2, "present")],
  [T.viento, S([-19.2, 0.75, 9.6], -1.2, "alarm")],
  [T.b1, S([-19.2, 0.75, 9.6], -1.2, "cheer")],
  [C2, S([0, 0, 0], 0, "idle", { scale: 0 })],
  [C3, S([SX - 2, 1.62, SZ + 0.4], 0.8, "think")],
  [T.barcos, S([-17.5, 0.7, -7], -1.0, "point")],
  [T.galeonT, S([-17.5, 0.7, -7], -0.6, "cheer")],
  [T.p3, S([SX - 2, 1.62, SZ + 0.4], 0.8, "alarm")],
  [T.b3, S([SX + 3.2, 0.3, SZ + 0.2], 0.2, "point")],
  [C5, S([SX - 2, 1.62, SZ + 0.4], -0.6, "cheer")],
  [T.p4, S([-24.4, 0.7, 3.4], -0.6, "present")],
  [T.plata0, S([-24.4, 0.7, 3.4], -0.6, "point")],
  [T.b4, S([-24.4, 0.7, 3.4], -0.6, "cheer")],
  [T.minas, S([42, 0.7, 10], -0.8, "point")],
  [T.acunada, S([42, 0.7, 10], -0.4, "cheer")],
  [C6, S([0, 0, 0], 0, "idle", { scale: 0 })],
  [T.blanco, S([-8, 1.78, 2], 0.4, "think")],
  [T.guerra, S([-8, 1.78, 2], 0.6, "alarm")],
  [T.millon, S([-8, 1.78, 2], 0.6, "think")],
  [T.ultimo, S([-21, 0.75, 5], 0.6, "present")],
  [T.mundial, S([0, 0, 0], 0, "idle", { scale: 0 })],
];

const hud: HudData = {
  pills: [
    { a: 0.05, b: T.un - 0.1, label: "RUTA", value: (t) => `${count(t, 0.05, 0.9, 0, 250)} AÑOS`, y: 440, tone: "gold" },
    { a: T.un, b: T.unio - 0.1, label: "BARCOS", value: (t) => (t < T.veces - 0.05 ? "1 AL AÑO" : "1 O 2 AL AÑO"), y: 440 },
    { a: T.mil, b: T.nohay - 0.1, label: "AÑO", value: () => "1565", y: 440, tone: "gold" },
    { a: T.nohay, b: T.ningun - 0.1, label: "MOTORES", value: () => "0 · SOLO VELA", y: 440, tone: "red" },
    { a: T.contra, b: T.b1 - 0.1, label: "VIENTO", value: () => "EN CONTRA", y: 440, tone: "red" },
    { a: T.japon, b: T.tornaT, label: "RUMBO", value: (t) => (t < T.vientos - 0.1 ? "NORTE" : "ESTE"), y: 440, tone: "green" },
    { a: T.cuatro, b: T.b2 - 0.1, label: "MESES", value: (t) => (t < T.seis - 0.1 ? (t < T.cuatro + 0.6 ? "4" : "5") : "6"), y: 440, tone: "red" },
    { a: T.maderas, b: T.galeonT, label: "MADERA", value: () => "MOLAVE", y: 440, tone: "green" },
    { a: T.agua, b: T.b3 - 0.1, label: "AGUA", value: () => "SIN PUERTOS", y: 440, tone: "red" },
    { a: T.miles, b: T.tinajasT, label: "TINAJAS", value: () => "MILES", y: 440, tone: "green" },
    { a: T.europeos, b: T.plata0 - 0.1, label: "PRODUCTOS EUROPEOS", value: () => "NO", y: 440, tone: "red" },
    { a: T.plata0, b: T.b4 - 0.1, label: "CHINA QUIERE", value: () => "PLATA", y: 440, tone: "green" },
    { a: T.mexico, b: T.acunada - 0.1, label: "PLATA", value: (t) => (t < T.potosi - 0.1 ? "MÉXICO" : "MÉXICO + POTOSÍ"), y: 440, tone: "gold" },
    { a: T.y1743, b: T.capturo - 0.1, label: "AÑO", value: () => "1743", y: 440, tone: "red" },
    { a: T.millon, b: T.ultimo - 0.1, label: "PESOS DE PLATA", value: (t) => `+${count(t, T.millon, T.millon + 0.8, 0, 1000000)}`, y: 440, tone: "red" },
    { a: T.y1815, b: T.historiadores - 0.1, label: "ÚLTIMO GALEÓN", value: () => "1815", y: 440 },
  ],
  titles: [{ a: T.tornaT, text: "TORNAVIAJE" }, { a: T.galeonT, text: "EL GALEÓN" }, { a: T.tinajasT, text: "TINAJAS" }, { a: T.realT, text: "REAL DE A OCHO" }],
  alerts: [T.ningun, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.cebu, T.b2, T.b3, T.b4],
  crosses: [[T.contra, T.b1 - 0.1], [T.agua, T.b3 - 0.1], [T.europeos + 0.2, T.plata0 - 0.1]],
  stamps: [[T.b1, T.c1, "VIENTO EN CONTRA"], [T.b3, T.c3, "SIN PUERTOS"]],
  reward: { a: T.mundial, len: T.end - T.mundial, top: "COMERCIO MUNDIAL", big: (t) => `${count(t, T.mundial, T.mundial + 1.0, 0, 250)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.unio, T.cebu - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: win(t, T.unio, T.cebu - 0.1, 0.2) }}>
          {["ASIA", "AMÉRICA", "EUROPA"].map((w, i) => <span key={w} style={{ fontFamily: FONT, fontSize: 78, color: ["#ffd84a", "#7fe0a0", "#7fc8ff"][i], ...stroke(11), transform: `scale(${pop(t, T.tres - 0.2 + i * 0.18, 0.3)})` }}>{w}</span>)}
        </div>) : null}
      {win(t, T.realT, T.p5 - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: win(t, T.realT, T.p5 - 0.1, 0.2), transform: `scale(${pop(t, T.realT, 0.35)}) rotate(${(t - T.realT) * 12}deg)` }}>
          <svg viewBox="0 0 120 120" width="300" height="300">
            <circle cx="60" cy="60" r="54" fill="#dfe4ea" stroke="#2a2a2a" strokeWidth="5" /><circle cx="60" cy="60" r="44" fill="none" stroke="#9aa3ad" strokeWidth="3" />
            <rect x="26" y="34" width="9" height="52" fill="#9aa3ad" /><rect x="85" y="34" width="9" height="52" fill="#9aa3ad" />
            <text x="60" y="76" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="44" fill="#4a5058">8</text>
          </svg>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.marinero, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef4f6", fogNear: 160, fogFar: 700, hemiSky: "#f2f7ff", hemiGround: "#a8d0e4", hemiI: 1.6, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.3 * dusk(t),
};
