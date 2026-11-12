// E8 — Catedral gótica / Notre-Dame (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3, ease } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

const SHOTS: Shot[] = [
  { name: "Notre-Dame pronta, o fantasma do primeiro pedreiro, vitrais → ⏪ terreno vazio", t0: 0, keys: [
    K(0, [-46, 22, 42], [0, 10, 0], 55, 2), K(T.quienes, [-30, 8, 22], [-17, 3, 7], 54, 0), K(T.vitrales0, [0, 14, 22], [0, 10, 4.5], 46, 0),
    K(T.paris, [-20, 14, 30], [-26, 2, 4], 58, 0), K(C1 - 0.05, [-24, 10, 30], [-28, 2, 8], 58, 1)] },
  { name: "igreja românica: a abóbada empurra, muros grossos", t0: C1, keys: [
    K(C1, [-44, 4.5, 11], [-30, 3.5, 11], 50, 2), K(T.p1, [-42, 5, 12], [-30, 3.5, 11], 50, 0), K(T.gruesos, [-40, 5.5, 16], [-30, 3, 11], 50, 0), K(C2 - 0.05, [-39, 6, 17], [-30, 3, 11], 50, 0)] },
  { name: "arco redondo x ogival → abóbada pesada na obra", t0: C2, keys: [
    K(C2, [-30, 5.5, 9], [-30, 3.5, -7], 56, -2), K(W3, [-30.2, 5.6, 9.2], [-30, 3.5, -7], 56, -1), K(W3 + 0.6, [-26, 5, 3], [-27, 4, -7], 50, 3),
    K(T.lados, [-27, 4.5, 2.5], [-27, 3.8, -7], 48, 0), K(T.ojival, [-28, 5, 4], [-28, 4, -7], 50, 0),
    K(T.p2 + 0.5, [-14, 16, 26], [2, 10, 0], 56, 0), K(C3 - 0.05, [-12, 16, 25], [2, 11, 0], 56, 0)] },
  { name: "por dentro: nervuras cruzadas levam o peso aos pilares → empuxo para fora", t0: C3, keys: [
    K(C3, [-9, 3, 1], [6, 12.5, 0], 60, 2), K(T.cruzan, [-8, 3.5, 0], [7, 13, 0], 60, 0), K(T.cruceria, [-6, 4, -1], [8, 13, 0], 60, 0),
    K(T.p3 + 0.3, [-30, 16, 2], [4, 11.5, 0], 52, 0), K(C4 - 0.05, [-29, 16, 2], [4, 11.5, 0], 52, 0)] },
  { name: "arcobotantes", t0: C4, keys: [
    K(C4, [-6, 17, 34], [4, 8, 2], 54, 2), K(T.brazos, [-4, 18, 35], [4, 9, 2], 54, 0), K(T.mano, [10, 14, 24], [4, 10, 6], 52, 0),
    K(T.arbotantes, [12, 15, 27], [4, 10, 4], 54, 0), K(W6, [12.5, 15.2, 27.5], [4, 10, 4], 54, 0),
    K(C5 - 0.42, [12.5, 15.2, 27.6], [40, 3, 40], 58, 4), K(C5 - 0.02, [12.5, 15.2, 27.7], [40, 3, 40], 58, 4)] },
  { name: "grua de roda → por dentro, escuro", t0: C5, keys: [
    K(C5, [16, 12, 22], [2, 12, 5], 52, -2), K(T.rueda, [12, 15, 16], [2, 14, 4], 50, 0), K(T.paso, [14, 10, 20], [2, 9, 8], 54, 0),
    K(T.grua, [12, 16, 18], [2, 14, 5], 52, 0), K(T.p5 + 0.3, [-9, 3.2, 1], [12, 5.5, 0], 58, 0), K(C6 - 0.05, [-8.8, 3.2, 1], [12, 5.6, 0], 58, 0)] },
  { name: "a parede se abre em vitrais → a rosácea", t0: C6, keys: [
    K(C6, [-6, 3, -2.5], [6, 9, 3.6], 56, -2), K(T.vidrio, [-4, 3.5, -2.8], [6, 9.5, 4], 54, 0), K(T.plomo, [0, 4, -3], [6, 10, 4.5], 50, 0),
    K(T.roseton + 0.3, [6, 5, 0], [-12, 10.5, 0], 52, 0), K(C7 - 0.05, [5, 5, 0], [-12, 11, 0], 52, 0)] },
  { name: "2019: o incêndio → vigas de carvalho a machado", t0: C7, keys: [
    K(C7, [-40, 22, 40], [2, 12, 0], 54, -2), K(T.incendio, [-34, 22, 36], [2, 14, 0], 54, 0), K(T.destruyo + 0.4, [-32, 21, 34], [2, 13, 0], 54, 0),
    K(T.rehacer + 0.2, [-36, 5, 20], [-26, 1.5, 10], 52, 0), K(T.hacha, [-36, 8, 26], [-14, 8, 4], 56, 0),
    K(W10, [-38, 20, 40], [0, 12, 0], 56, 0), K(W10 + 0.7, [-37, 21, 41], [0, 12, 0], 56, 0), K(T.end, [-36, 22, 42], [0, 12, 0], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([-20, 0, 10], 0.6, "present")],
  [T.paris, S([-36, 0, 5.5], -0.6, "present")],
  [T.p1, S([-36, 0, 5.5], -0.6, "alarm")],
  [T.b1, S([-36, 0, 5.5], -0.6, "cheer")],
  [C2, S([-21.5, 0, -6], -0.9, "point")],
  [T.ojival, S([-21.5, 0, -6], -0.4, "cheer")],
  [T.p2, S([-21.5, 0, -6], 0.2, "think")],
  [C3, S([-5, 0, -2], -1.2, "alarm")],
  [T.b2, S([-5, 0, -2], -1.2, "cheer")],
  [T.nervios, S([-5, 0, -2], -1.4, "point")],
  [T.p3, S([0, 0, 9], 0.3, "alarm")],
  [C4, S([5, 0, 13.5], 0.4, "present")],
  [T.brazos, S([5, 0, 13.5], -0.8, "point")],
  [T.arbotantes, S([5, 0, 13.5], 0.4, "cheer")],
  [C5, S([7, 0, 11], 0.6, "think")],
  [T.rueda, S([7, 0, 11], -0.6, "point")],
  [T.grua, S([7, 0, 11], 0.6, "cheer")],
  [T.p5, S([-5, 0, 2], -1.3, "think")],
  [C6, S([-5, 0, -1], -1.0, "point")],
  [T.vitralesT, S([-5, 0, -1], -1.0, "cheer")],
  [C7, S([-20, 0, 14], 0.6, "present")],
  [T.incendio, S([-20, 0, 14], 0.9, "alarm")],
  [T.rehacer, S([-22.5, 0, 6], -0.8, "point")],
  [T.ochocientos, S([-22.5, 0, 6], 0.4, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.05, b: T.quienes - 0.1, label: "OBRA", value: (t) => `~${count(t, 0.05, 1.0, 0, 200)} AÑOS`, y: 440, tone: "gold" },
    { a: T.nunca, b: T.vitrales0 - 0.2, label: "LA VIERON TERMINADA", value: () => "0", y: 440, tone: "red" },
    { a: T.vitrales0, b: T.paris - 0.15, label: "VITRALES", value: () => "ENORMES", y: 440, tone: "green" },
    { a: T.paris + 0.4, b: T.p1 - 0.1, label: "AÑO", value: () => "1163", y: 440, tone: "gold" },
    { a: T.gruesos, b: T.pequenas - 0.1, label: "MUROS", value: () => "GRUESOS", y: 440, tone: "red" },
    { a: T.pequenas, b: T.b1 - 0.1, label: "VENTANAS", value: () => "PEQUEÑAS", y: 440, tone: "red" },
    { a: T.abajo, b: T.ojival, label: "PESO", value: () => "HACIA ABAJO", y: 440, tone: "green" },
    { a: T.toneladas, b: T.b2 - 0.1, label: "BÓVEDA", value: () => "TONELADAS", y: 440, tone: "red" },
    { a: T.pilares, b: T.cruceria + 0.6, label: "PILARES", value: () => "POCOS", y: 440, tone: "green" },
    { a: T.empujando, b: T.b3 - 0.1, label: "EMPUJE", value: () => "HACIA FUERA", y: 440, tone: "red" },
    { a: T.treinta, b: T.b4 - 0.1, label: "ALTURA", value: () => "+30 m", y: 440, tone: "red" },
    { a: T.paso, b: T.grua, label: "CADA PASO", value: () => "SUBE", y: 440, tone: "green" },
    { a: T.oscuro, b: T.b5 - 0.1, label: "ADENTRO", value: () => "OSCURO", y: 440, tone: "red" },
    { a: T.vidrio, b: T.roseton - 0.1, label: "VIDRIO", value: (t) => (t < T.plomo - 0.1 ? "+ ÓXIDOS" : "+ PLOMO"), y: 440, tone: "green" },
    { a: T.roseton, b: T.vitralesT - 0.05, label: "ROSETÓN", value: (t) => `~${count(t, T.trece - 0.3, T.trece + 0.4, 0, 13)} m`, y: 440, tone: "gold" },
    { a: T.y2019, b: T.rehacer - 0.1, label: "AÑO", value: () => "2019", y: 440, tone: "red" },
    { a: T.labrar, b: T.ochocientos - 0.1, label: "VIGAS", value: () => "A HACHA", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.ojival, text: "ARCO OJIVAL" }, { a: T.cruceria, text: "BÓVEDA DE CRUCERÍA" }, { a: T.arbotantes, text: "ARBOTANTES" },
    { a: T.grua, text: "GRÚA DE RUEDA" }, { a: T.vitralesT, text: "VITRALES" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.paris, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.pequenas, T.b1 - 0.1], [T.oscuro, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]],
  reward: { a: T.ochocientos, len: T.end - T.ochocientos, top: "A HACHA, COMO HACE", big: (t) => `${count(t, T.ochocientos, T.ochocientos + 1.0, 0, 800)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
};

const dark = (t: number) => ease(t, T.p5, T.p5 + 0.6) * (1 - ease(t, T.vidrio - 0.3, T.vidrio + 0.6));
export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mason, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef2f4", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#9aa88a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.45 * dark(t),
};
