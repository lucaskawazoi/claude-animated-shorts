// E2 — El acueducto de Segovia (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
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
  { name: "gancho: o aqueduto pronto → ⏪ ano 100", t0: 0, keys: [
    K(0, [16.0, 1.6, 14.0], [7.0, 7.0, -6.0], 66, 6), K(T.cemento, [4.0, 2.4, 18.0], [8.0, 6.5, -6.0], 64, -5), K(T.pie, [-4.0, 5.0, 22.0], [8.0, 6.5, -6.0], 66, 4),
    K(T.hispania, [-3.0, 5.0, 27.0], [8.0, 5.0, -6.0], 64, 2), K(T.roca, [10.0, 13.0, 32.0], [30.0, 9.5, -6.0], 62, -1), K(C1 - 0.05, [14.0, 15.0, 32.0], [32.0, 10.0, -6.0], 62, 1)] },
  { name: "cidade → serra → nascente", t0: C1, keys: [
    K(C1, [34.0, 10.6, 6.0], [40.0, 14.5, -14.0], 66, 2), K(T.sierra - 0.2, [38.0, 16.0, 22.0], [30.0, 9.5, -10.0], 60, -1), K(T.km - 0.3, [16.0, 18.0, 30.0], [-20.0, 8.0, -10.0], 62, 1),
    K(T.km + 0.8, [-8.0, 20.0, 30.0], [-50.0, 12.0, -15.0], 62, 1), K(T.b1, [-36.0, 15.0, 22.0], [-58.0, 10.0, -6.0], 58, 2),
    K(T.canal + 0.3, [-49.0, 12.5, 7.0], [-55.0, 9.5, -6.0], 56, 0), K(C2 - 0.05, [-48.0, 12.0, 6.0], [-53.0, 9.4, -6.0], 54, 1)] },
  { name: "água no canal → canal → entupido", t0: C2, keys: [
    K(C2, [-46.4, 11.6, -3.0], [-50.0, 9.2, -6.0], 46, -3), K(W3, [-46.0, 11.7, -3.0], [-49.4, 9.2, -6.0], 46, -2),
    K(W3 + 0.7, [-36.0, 11.6, 1.0], [-44.0, 9.3, -6.0], 58, 4), K(T.esteCanal, [-37.0, 12.2, 2.5], [-45.0, 9.3, -6.0], 60, 0),
    K(T.p1, [-20.0, 13.0, 1.5], [-24.5, 9.2, -6.0], 54, -2), K(C3 - 0.05, [-20.5, 12.6, 1.0], [-24.5, 9.2, -6.0], 52, 2)] },
  { name: "desarenador → beira do vale", t0: C3, keys: [
    K(C3, [-31.0, 9.8, -1.4], [-33.5, 13.2, -9.2], 66, 1), K(T.pileta - 0.3, [-35.0, 11.4, 1.5], [-30.0, 9.4, -6.0], 54, -1), K(T.pileta, [-28.0, 12.6, 2.4], [-30.0, 8.6, -6.0], 54, -1),
    K(T.fondo, [-29.0, 11.6, 0.6], [-30.0, 8.3, -6.0], 50, 0), K(T.desarenador, [-26.0, 13.8, 4.5], [-31.0, 9.6, -6.0], 58, 1),
    K(T.p2, [-15.0, 13.0, 6.0], [-6.0, 8.0, -6.0], 60, 0), K(C4 - 0.05, [-13.0, 13.0, 7.0], [-4.0, 7.0, -6.0], 62, 1)] },
  { name: "cascata no vale → arcos subindo", t0: C4, keys: [
    K(C4, [4.0, 6.5, 24.0], [-6.0, 4.0, -6.0], 62, 2), K(T.baja, [6.0, 8.0, 26.0], [-5.0, 4.0, -6.0], 62, -1),
    K(T.b3, [9.0, 10.0, 28.0], [2.0, 5.0, -6.0], 62, 1), K(T.arcos, [14.0, 9.0, 30.0], [6.0, 6.0, -6.0], 62, 0),
    K(W6, [17.0, 9.0, 30.0], [8.0, 6.0, -6.0], 62, 1), K(C5 - 0.42, [16.0, 17.0, 14.0], [8.0, 0.0, 2.0], 60, 5), K(C5 - 0.02, [16.1, 17.0, 14.0], [8.0, 0.0, 2.0], 60, 5)] },
  { name: "arcos prontos → canteiro do arco: cimbra, dovelas, clave", t0: C5, keys: [
    K(C5, [8.6, 0.8, -3.4], [9.4, 8.0, -6.0], 70, -3), K(T.estosArcos, [9.4, 1.0, -2.8], [10.0, 8.0, -6.0], 70, 2), K(T.estosArcos + 1.0, [-2.0, 2.6, 16.0], [12.0, 7.0, -6.0], 66, 2),
    K(T.p3 + 0.2, [14.0, 5.0, 22.0], [6.0, 3.0, 8.0], 60, -2), K(T.b4 + 0.3, [11.0, 4.6, 18.0], [6.0, 3.2, 8.0], 56, 3),
    K(T.cimbra, [9.0, 4.2, 16.0], [6.0, 3.5, 8.0], 54, -2), K(T.clave, [8.0, 4.8, 15.0], [6.0, 4.4, 8.0], 52, 2),
    K(T.empuja, [7.0, 4.4, 14.6], [6.0, 4.2, 8.0], 50, -1), K(C6 - 0.05, [6.6, 4.4, 14.4], [6.0, 4.4, 8.0], 50, 0)] },
  { name: "clave → grua", t0: C6, keys: [
    K(C6, [4.6, 6.0, 12.8], [6.0, 5.0, 8.0], 46, -3), K(T.p4, [5.4, 6.2, 13.6], [6.0, 5.0, 8.0], 50, 0),
    K(T.subirlo, [26.0, 8.0, 14.0], [16.5, 6.0, -2.6], 60, 2), K(T.gruas, [27.0, 9.0, 12.0], [17.0, 7.0, -2.6], 60, -1), K(C7 - 0.05, [26.0, 10.0, 10.0], [17.0, 9.0, -2.6], 60, 1)] },
  { name: "furos das pinças → água na cidade → aqueduto inteiro", t0: C7, keys: [
    K(C7, [15.2, 1.9, 5.0], [14.2, 0.8, 1.9], 44, 2), K(T.huecos, [14.6, 1.7, 4.4], [14.0, 0.8, 1.9], 42, -1),
    K(T.llego, [38.0, 13.0, 12.0], [31.0, 9.5, -1.0], 58, 1), K(T.siglo, [39.0, 14.0, 14.0], [30.0, 10.0, -3.0], 60, -1),
    K(W10, [36.0, 14.0, 18.0], [24.0, 9.0, -4.0], 60, 0), K(W10 + 0.7, [22.0, 8.0, 36.0], [6.0, 6.0, -6.0], 62, 0), K(T.end, [21.6, 8.0, 35.6], [6.0, 6.0, -6.0], 62, 0)] },
];
const DYN = [6.0, 0.7, 5.0, 4.0, 0.15, 0.3, 3.6, 3.8, 0.3, 0.8, 0.05];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([4.5, 0, 14.0], 0.3, "present")],
  [T.cemento, S([4.5, 0, 14.0], -0.4, "point")],
  [T.hispania, S([4.5, 0, 14.0], 0.2, "think")],
  [C1, S([28.0, H, 4.0], 0.2, "present")],
  [T.b1, S([-55.0, H, -2.0], 0.3, "cheer")],
  [C2, S([-48.0, H, -3.6], 0.6, "point")],
  [T.p1, S([-26.6, H, -3.4], 0.3, "alarm")],
  [T.b2, S([-26.6, H, -3.4], 0.3, "think")],
  [T.pileta, S([-33.0, H, -3.2], 0.5, "present")],
  [T.p2, S([-10.5, H, -3.0], 0.6, "point")],
  [C4, S([-9.6, H, -2.6], 0.2, "alarm")],
  [T.b3, S([-9.6, H, -2.6], 0.2, "cheer")],
  [C5, S([2.0, 0, 11.5], 0.6, "present")],
  [T.p3, S([9.2, 0, 11.0], 0.0, "think")],
  [T.cimbra, S([9.4, 0, 10.2], -0.5, "point")],
  [T.estaClave - 0.4, S([9.4, 0, 10.2], 0.0, "cheer")],
  [T.p4, S([19.0, 0, 0.8], -0.3, "alarm")],
  [T.gruas, S([19.0, 0, 0.8], -0.6, "point")],
  [C7, S([16.0, 0, 3.4], -0.9, "point")],
  [T.llego, S([34.8, H, 4.0], 0.2, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.bloques, b: T.hispania - 0.15, label: "BLOQUES", value: (t) => count(t, T.bloques, T.bloques + 1.2, 0, 20400), y: 440 },
    { a: T.cemento, b: T.hispania - 0.15, label: "CEMENTO", value: () => "0", y: 550, tone: "red" },
    { a: T.pie, b: T.hispania - 0.15, label: "EN PIE", value: () => "~1.900 AÑOS", y: 660, tone: "gold" },
    { a: T.hispania, b: T.roca, label: "AÑO", value: () => "~100 d.C.", y: 440, tone: "gold" },
    { a: T.km, b: T.b1 - 0.1, label: "DISTANCIA", value: (t) => `${count(t, T.km, T.km + 0.8, 0, 16)} km`, y: 440 },
    { a: T.sola, b: T.esteCanal, label: "MOTOR", value: () => "LA GRAVEDAD", y: 440, tone: "green" },
    { a: T.tapa, b: T.b2 - 0.1, label: "CANAL", value: () => "ATASCADO", y: 440, tone: "red" },
    { a: T.limpia, b: T.p2 - 0.1, label: "AGUA", value: () => "LIMPIA", y: 440, tone: "green" },
    { a: T.ciento, b: T.p3 - 0.1, label: "ARCOS", value: (t) => count(t, T.ciento, T.estosArcos, 0, 167), y: 440 },
    { a: T.alto, b: T.p3 - 0.1, label: "ALTURA", value: () => "28 m", y: 550 },
    { a: T.tonelada, b: T.b5 - 0.1, label: "CADA BLOQUE", value: () => "≈ 1 t", y: 440, tone: "red" },
    { a: T.subirlo, b: T.b5 - 0.1, label: "SUBIR", value: () => "28 m", y: 550 },
  ],
  titles: [
    { a: T.esteCanal, text: "CANAL" }, { a: T.desarenador, text: "DESARENADOR" }, { a: T.estosArcos, text: "ARCOS" },
    { a: T.cimbra, text: "CIMBRA", len: 1.6 }, { a: T.estaClave, text: "CLAVE" }, { a: T.gruas, text: "GRÚA" },
  ],
  alerts: [T.como, T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.hispania, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.tapa, T.b2 - 0.1], [T.noSube, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.siglo, len: T.end - T.siglo, top: "AGUA EN SEGOVIA", big: (t) => `${count(t, T.siglo, T.siglo + 1.4, 0, 1870)} AÑOS`, sub: "HASTA 1973 · SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {/* lupa sobre os furos das pinças */}
      {win(t, T.mira, T.llego - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 780, display: "flex", justifyContent: "center", opacity: win(t, T.mira, T.llego - 0.1, 0.2), transform: `scale(${pop(t, T.mira, 0.3)})` }}>
          <span style={{ fontFamily: FONT, fontSize: 64, color: "#ffd400", ...stroke(10, "#3a2300") }}>▼ HUECOS DE LAS PINZAS ▼</span>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.rome, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 140, fogFar: 560, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
