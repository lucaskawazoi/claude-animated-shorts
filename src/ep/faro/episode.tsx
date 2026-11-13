// E7 — Faro de Alejandría (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { TOP, World, night } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

const SHOTS: Shot[] = [
  { name: "a torre ao lado de um prédio de 30 andares → ⏪ a costa sem torre", t0: 0, keys: [
    K(0, [44, 20, 18], [20, 16, -21], 55, 2), K(T.construido, [42, 16, 16], [18, 14, -21], 55, -1), K(T.nombre, [34, 12, 20], [16, 12, -21], 56, 0),
    K(T.alejandria, [24, 16, 36], [0, 2, -8], 58, 0), K(C1 - 0.05, [18, 13, 38], [-2, 1, -6], 58, 1)] },
  { name: "rente ao mar: rochas escondidas, o navio bate → a torre sobe", t0: C1, keys: [
    K(C1, [-42, 4, 0], [-10, 1, -2], 56, 2), K(T.rocas, [-36, 5, -2], [-14, 0, -8], 54, 0), K(T.barcos, [-30, 4.5, -4], [-18, 0.5, -8], 52, -1),
    K(T.b1, [-28, 8, 0], [4, 5, -18], 56, 0), K(T.torre, [-22, 11, 4], [14, 12, -21], 56, 0), K(C2 - 0.05, [-20, 12, 5], [14, 13, -21], 56, 0)] },
  { name: "a torre vista do norte → ilha separada da cidade", t0: C2, keys: [
    K(C2, [42, 10, -58], [16, 14, -21], 54, -2), K(W3, [41.5, 10.3, -57], [16, 14, -21], 54, -1),
    K(W3 + 0.6, [10, 18, -64], [10, 8, -16], 58, 4), K(T.torreT, [8, 18, -62], [12, 10, -18], 58, 0),
    K(T.p2, [-6, 22, -50], [-6, 1, -4], 56, 0), K(C3 - 0.05, [-22, 20, -40], [-8, 0, -2], 56, 0)] },
  { name: "o dique sai da cidade → dois portos → vento na torre", t0: C3, keys: [
    K(C3, [4, 6, 27], [-8, 0.6, 4], 54, 2), K(T.kilometro, [1, 7, 24], [-8, 0.6, -2], 54, 0), K(T.une, [8, 14, 30], [-8, 0, -6], 56, 0),
    K(T.puertos, [-8, 32, 32], [-8, 0, -4], 58, 0), K(T.hepta + 0.4, [-6, 31, 30], [-8, 0, -4], 58, 0),
    K(T.p3 + 0.6, [44, 13, 6], [16, 17, -21], 56, 0), K(T.peso, [42, 12, 4], [16, 18, -21], 56, -1), K(C4 - 0.05, [42, 12, 4], [16, 18, -21], 56, 0)] },
  { name: "três pisos sobem um a um", t0: C4, keys: [
    K(C4, [-16, 5, -52], [16, 14, -21], 56, 2), K(T.abajo, [-12, 7, -50], [16, 12, -21], 54, 0), K(T.arriba, [-8, 11, -48], [16, 18, -21], 54, 0),
    K(W6, [-7, 12, -47.5], [16, 19, -21], 54, 0), K(C5 - 0.42, [-7, 12, -47], [-14, 0, -30], 58, 4), K(C5 - 0.02, [-7, 12, -47.1], [-14, 0, -30], 58, 4)] },
  { name: "três pisos → noite → fogo → de longe no mar → combustível", t0: C5, keys: [
    K(C5, [26, 28, -9], [16, 27, -21], 50, -2), K(T.p4, [40, 14, 0], [16, 19, -21], 54, 0), K(T.nadie, [46, 13, 5], [16, 19, -21], 55, 0), K(T.fuego, [48, 15, 8], [16, 22, -21], 56, 0),
    K(T.lejos, [76, 16, 44], [16, 20, -21], 46, 0), K(T.fuegoT, [74, 16, 42], [16, 21, -21], 46, 0),
    K(T.p5 + 0.9, [36, 7, 4], [15, 3, -15], 52, 0), K(T.cien + 0.3, [34, 4.5, 2], [16, 20, -21], 58, 0), K(C6 - 0.05, [34, 4.5, 2], [16, 21, -21], 58, 0)] },
  { name: "corte da torre: rampa em espiral, dois cavaleiros", t0: C6, keys: [
    K(C6, [16, 8, 6], [16, 7.5, -21], 46, 2), K(T.rampa, [18, 8, 5], [16, 8, -21], 46, 0), K(T.jinetes, [14.5, 9, 4], [16, 8.5, -21], 44, 0),
    K(T.rampaT, [16, 9, 5], [16, 8.5, -21], 46, 0), K(C7 - 0.05, [16, 9, 5], [16, 8.5, -21], 46, 0)] },
  { name: "terremoto → ruínas → fortaleza → faros pelo mundo", t0: C7, keys: [
    K(C7, [34, 14, 20], [16, 12, -21], 56, -2), K(T.ruinas, [30, 12, 18], [16, 6, -21], 56, 0), K(T.fortaleza, [26, 10, 8], [16, 3, -21], 54, 0),
    K(T.nombre2, [8, 30, 28], [2, 2, -24], 60, 0), K(W10, [7, 31, 29], [2, 2, -24], 60, 0), K(T.end, [-10, 24, 24], [6, 2, -26], 58, 3)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([11, TOP, -15.5], 0.6, "present")],
  [T.alejandria, S([2, TOP, 14.4], 0.6, "present")],
  [C1, S([-14, TOP, 14.6], -1.0, "point")],
  [T.barcos, S([-14, TOP, 14.6], -0.6, "alarm")],
  [T.b1, S([-14, TOP, 14.6], -0.6, "cheer")],
  [C2, S([20.5, TOP, -25.5], 2.4, "present")],
  [T.p2, S([-8, TOP, 14.2], 2.8, "think")],
  [T.b2, S([-8, TOP, 14.2], 2.8, "cheer")],
  [T.dique, S([-6, TOP, 14.4], 2.4, "point")],
  [T.p3, S([12, TOP, -15.6], 0.8, "alarm")],
  [T.b3, S([12, TOP, -15.6], 0.8, "cheer")],
  [C4, S([11.5, TOP, -27], 2.2, "cheer")],
  [T.abajo, S([11.5, TOP, -27], 2.6, "point")],
  [C5, S([22, TOP, -16], 0.9, "cheer")],
  [T.p4, S([22, TOP, -16], 0.9, "think")],
  [T.b4, S([22, TOP, -16], 0.9, "cheer")],
  [T.p5, S([11.4, TOP, -14.0], 0.6, "present", { prop: "jar" })],
  [T.cien, S([11.4, TOP, -14.0], 0.6, "alarm")],
  [C6, S([11.5, TOP, -13.4], 0.4, "point")],
  [T.jinetes, S([11.5, TOP, -13.4], 0.4, "cheer")],
  [C7, S([24, TOP, 14.5], 0.2, "alarm")],
  [T.fortaleza, S([24, TOP, 14.5], 0.2, "point")],
  [T.nombre2, S([24, TOP, 14.5], 0.2, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.2, b: T.construido - 0.1, label: "ALTURA", value: (t) => `+${count(t, 0.2, 1.4, 0, 100)} m`, y: 440, tone: "gold" },
    { a: T.construido, b: T.nombre - 0.1, label: "HACE", value: () => "+2000 AÑOS", y: 440, tone: "gold" },
    { a: T.nombre, b: T.alejandria - 0.15, label: "SU NOMBRE", value: () => "¿?", y: 440 },
    { a: T.hace, b: T.nohay - 0.1, label: "HACE", value: () => "~2300 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.costa - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.costa, b: T.rocas - 0.1, label: "MONTAÑAS", value: () => "0", y: 440, tone: "red" },
    { a: T.rocas, b: T.b1 - 0.1, label: "ROCAS", value: () => "ESCONDIDAS", y: 440, tone: "red" },
    { a: T.kilometro, b: T.puertos - 0.1, label: "DIQUE", value: () => "+1 KM", y: 440 },
    { a: T.puertos, b: T.hepta + 0.6, label: "PUERTOS", value: (t) => count(t, T.puertos, T.puertos + 0.5, 1, 2), y: 440, tone: "green" },
    { a: T.viento, b: T.b3 - 0.1, label: "VIENTO", value: () => "FUERTE", y: 440, tone: "red" },
    { a: T.abajo, b: T.pisosT, label: "PISOS", value: (t) => (t < T.medio - 0.1 ? "1" : t < T.arriba - 0.1 ? "2" : "3"), y: 440, tone: "green" },
    { a: T.nadie, b: T.b4 - 0.1, label: "DE NOCHE", value: () => "NO SE VE", y: 440, tone: "red" },
    { a: T.lejos, b: T.fuegoT + 0.6, label: "SE VEÍA", value: () => "MUY LEJOS", y: 440, tone: "green" },
    { a: T.cien, b: T.b5 - 0.1, label: "SUBIR", value: () => "+100 m", y: 440, tone: "red" },
    { a: T.jinetes, b: T.rampaT, label: "JINETES", value: () => "2 A LA VEZ", y: 440, tone: "green" },
    { a: T.peor, b: T.ruinas + 0.6, label: "TERREMOTO", value: () => "1303", y: 440, tone: "red" },
    { a: T.pie, b: T.nombre2 - 0.1, label: "FORTALEZA", value: () => "EN PIE", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.torreT, text: "LA TORRE" }, { a: T.hepta, text: "HEPTASTADION" }, { a: T.pisosT, text: "TRES PISOS" },
    { a: T.fuegoT, text: "EL FUEGO" }, { a: T.rampaT, text: "LA RAMPA" },
  ],
  alerts: [T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.alejandria, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.barcos + 0.4, T.b1 - 0.1], [T.nadie, T.b4 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN LUZ ELÉCTRICA"], [T.b3, T.c3, "SIN ACERO"], [T.b4, T.c4, "SIN BOMBILLAS"], [T.b5, T.c5, "SIN ASCENSOR"]],
  reward: { a: T.faros, len: T.end - T.faros, top: "ISLA DE FAROS", big: () => "FARO", sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.nombre2, T.faros - 0.05, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", flexDirection: "column", alignItems: "center", opacity: win(t, T.nombre2, T.faros - 0.05, 0.2), transform: `scale(${pop(t, T.nombre2, 0.3)})` }}>
          <span style={{ fontFamily: FONT, fontSize: 92, color: "#ffd84a", ...stroke(12) }}>PHAROS</span>
          <span style={{ fontFamily: FONT, fontSize: 70, color: "#fff", ...stroke(10) }}>↓</span>
          <span style={{ fontFamily: FONT, fontSize: 92, color: "#7fe0a0", ...stroke(12) }}>FARO</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.alejandria, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef4f6", fogNear: 130, fogFar: 560, hemiSky: "#f2f7ff", hemiGround: "#d9c896", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.42 * night(t),
};
