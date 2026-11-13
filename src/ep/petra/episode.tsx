// E9 — Petra (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const PI = Math.PI;

const SHOTS: Shot[] = [
  { name: "o Tesouro visto do Siq → a praça → ⏪ rocha bruta, caravana", t0: 0, keys: [
    K(0, [-20, 6, 0], [16, 11, 0], 52, 2), K(T.veinte, [-6, 7, 0], [16, 11, 0], 52, 0), K(T.petra + 0.3, [4, 14, -1.5], [10, 4, 2], 56, 0),
    K(T.nohay, [9, 10, -8], [4, 2, 3], 54, 0), K(C1 - 0.05, [9.5, 10, -8.5], [3, 2, 3], 54, 0)] },
  { name: "nabateos → a enxurrada desce o uádi e o Siq → represa", t0: C1, keys: [
    K(C1, [-64, 22, 24], [-50, 2, 6], 54, 2), K(T.riada, [-64, 21, 23], [-49, 1, 4], 54, 0), K(T.b1, [-65, 19, 21], [-51, 2, 1], 54, 0),
    K(T.presa, [-66, 16, 16], [-50, 2, 0], 52, 0), K(C2 - 0.05, [-66, 16, 16], [-50, 2, 0], 52, 0)] },
  { name: "túnel: a riada sai do outro lado → a água se perde", t0: C2, keys: [
    K(C2, [-46, 6, -44], [-55, 2.5, -31], 54, -2), K(W3, [-46.2, 6.1, -44.2], [-55, 2.5, -31], 54, -1), K(W3 + 0.6, [-44, 10, -50], [-50, 0, -42], 56, 3),
    K(T.tunelT, [-45, 11, -52], [-50, 0, -43], 56, 0), K(C3 - 0.05, [-45.5, 11, -52.5], [-50, 0, -43], 56, 0)] },
  { name: "canais no Siq (de cima, depois dentro) → a água chega à praça", t0: C3, keys: [
    K(C3, [-36, 30, 0.3], [-30, 1, 1], 50, 2), K(T.canales, [-34, 22, 0.3], [-29, 1, 1], 50, 0), K(T.tubos, [-31, 3.2, 0.2], [-20, 1.2, -1.5], 56, 0),
    K(T.llevan, [-14, 3.5, 0], [0, 1.5, 1], 56, 0), K(T.ciudad + 0.4, [8, 8, -6], [3, 0.5, 6], 54, 0), K(T.canalesT, [10, 8, -8], [3, 0.5, 6], 52, 0),
    K(C4 - 0.05, [10.5, 8.5, -8.5], [4, 1, 7], 54, 0)] },
  { name: "areia → decantador de perto → chicote ao céu", t0: C4, keys: [
    K(C4, [3, 16, -2], [2, 0, 3], 52, -2), K(T.arena + 0.4, [2.5, 15, -1.5], [1.5, 0, 3], 52, 0), K(T.estanques + 0.3, [2.0, 5.6, -9.4], [6.5, 0.7, -5], 48, 0), K(T.fondo, [1.8, 5.8, -9.6], [6.5, 0.8, -5], 50, 0),
    K(W6, [2.3, 5.0, -8.6], [6.5, 0.7, -5], 50, 0), K(C5 - 0.42, [7, 5, -7], [30, 60, 20], 64, 12), K(C5 - 0.02, [7.1, 5, -7], [30, 60, 20], 64, 12)] },
  { name: "água limpa → verão: sol → cisternas enchem → a fachada não dá do chão", t0: C5, keys: [
    K(C5, [4.2, 5.6, 0.2], [6.5, 0.8, -5], 50, 2), K(T.decantadores + 0.6, [4.4, 5.8, 0.6], [6.5, 0.8, -5], 50, 0),
    K(T.p4 + 0.6, [4, 2.5, -4], [-10, 120, 40], 62, 0), K(T.b4, [4, 2.5, -4], [-10, 120, 40], 62, 0),
    K(T.cisternas, [-1, 4, -3], [3, 4, 7], 54, 6), K(T.invierno, [8, 5, -2], [3, 4.5, 7], 52, 3), K(T.guardan, [5, 7, -4], [3, 4.5, 7], 52, -4), K(T.cisternasT, [2, 6.5, -4], [3, 4.5, 7], 54, -2),
    K(T.p5 + 0.9, [2.5, 2, 6], [16, 9, 1], 66, 0), K(T.suelo, [3, 1.5, 3], [16, 22, 0], 66, 0), K(C6 - 0.05, [3.1, 1.5, 3], [16, 22, 0], 66, 0)] },
  { name: "esculpindo o Tesouro de cima para baixo", t0: C6, keys: [
    // a câmera desce junto com o nível do corte: de cima para baixo, como a voz diz
    K(C6, [-4, 20, 0.7], [15, 20, 0], 52, -2), K(T.arriba + 1.0, [-3, 18, 0.7], [15, 17, 0], 52, 0), K(T.piso, [-5, 14, 0.7], [15, 12.5, 0], 54, 0), K(T.cuarenta, [-8, 8.5, 0.8], [16, 10, 0], 56, 0), K(C7 - 0.05, [-8, 8.4, 0.8], [16, 10, 0], 56, 0)] },
  { name: "a fachada do alto → 363: terremoto → a caravana vai embora → cidade vazia → o Tesouro", t0: C7, keys: [
    K(C7, [0, 30, -14], [14, 6, 2], 56, 2), K(T.rompio, [6, 33, -5], [12, 0, 28], 56, 0), K(T.comercio, [10, 6, 3], [-6, 2, 0], 56, 0),
    K(T.vaciando, [8, 30, -4], [14, 2, 30], 58, 0), K(W10, [8, 26, -4], [14, 4, 20], 58, 0), K(T.end, [4, 8, -6], [16, 10, 0], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([6, 0, 1.5], -PI / 2, "present")],
  [T.petra, S([4, 0, -4], 0.4, "present")],
  [T.hace, S([4, 0, -4], 0.9, "point")],
  [C1, S([-46, 0, 11], -0.6, "present")],
  [T.riada, S([-46, 0, 11], -0.6, "alarm")],
  [T.b1, S([-46, 0, 11], -0.6, "cheer")],
  [T.presa, S([-46, 0, 11], -1.2, "point")],
  [C2, S([-52.5, 0, -40.5], -0.3, "present")],
  [T.p2, S([-50, 0, -36], 0.4, "think")],
  [T.b2, S([-50, 0, -36], 0.4, "cheer")],
  [T.canales, S([-17, 0, 0.8], -PI / 2, "point")],
  [T.ciudad, S([1, 0, 3], 0.4, "cheer")],
  [T.p3, S([-19, 0, -1.2], -1.2, "think")],
  [T.estanques, S([9.5, 0, -3], -2.2, "point")],
  [T.detiene, S([9.5, 0, -3], -2.0, "present")],
  [T.limpia, S([9.5, 0, -3], -2.0, "cheer")],
  [T.p4, S([9.5, 0, -3], -2.4, "alarm")],
  [T.cisternas, S([5.5, 0, 4.5], 0.6, "point")],
  [T.cisternasT, S([5.5, 0, 4.5], 0.2, "cheer")],
  [T.p5, S([11, 0, 4.8], PI / 2, "alarm")],
  [T.suelo, S([11, 0, 4.8], PI / 2, "think")],
  [C6, S([8, 0, 5.5], 1.2, "present")],
  [T.tesoro, S([8, 0, 5.5], -1.0, "cheer")],
  [C7, S([2, 0, 3], 0.3, "present")],
  [T.terremoto, S([2, 0, 3], 0.3, "alarm")],
  [T.vaciando, S([2, 0, 3], 0.3, "think")],
  [T.mandaselo, S([2, 0, 3], 0.8, "present")],
];

const hud: HudData = {
  pills: [
    { a: T.casi, b: T.veinte - 0.1, label: "LLUVIA", value: () => "CASI NADA", y: 440, tone: "red" },
    { a: T.veinte, b: T.petra - 0.1, label: "PERSONAS", value: (t) => `~${count(t, T.veinte, T.veinte + 0.8, 0, 20000)}`, y: 440, tone: "gold" },
    { a: T.hace, b: T.nohay - 0.1, label: "HACE", value: () => "~2000 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.nabateos - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.nabateos, b: T.p1 - 0.1, label: "RUTAS", value: () => "DEL INCIENSO", y: 440, tone: "gold" },
    { a: T.riada, b: T.b1 - 0.1, label: "RIADA", value: () => "ARRASA TODO", y: 440, tone: "red" },
    { a: T.noventa, b: T.manda - 0.1, label: "TÚNEL", value: (t) => `~${count(t, T.noventa, T.noventa + 0.7, 0, 90)} m`, y: 440, tone: "green" },
    { a: T.pierde, b: T.b2 - 0.1, label: "AGUA", value: () => "SE PIERDE", y: 440, tone: "red" },
    { a: T.tubos, b: T.ciudad, label: "TUBOS", value: () => "BARRO COCIDO", y: 440, tone: "green" },
    { a: T.arena, b: T.b3 - 0.1, label: "AGUA", value: () => "CON ARENA", y: 440, tone: "red" },
    { a: T.fondo, b: T.decantadores, label: "ARENA", value: () => "AL FONDO", y: 440, tone: "green" },
    { a: T.meses, b: T.b4 - 0.1, label: "SIN LLUVIA", value: () => "MESES", y: 440, tone: "red" },
    { a: T.cisternas, b: T.cisternasT, label: "CISTERNAS", value: () => "CIENTOS", y: 440, tone: "green" },
    { a: T.suelo, b: T.b5 - 0.1, label: "DESDE EL SUELO", value: () => "IMPOSIBLE", y: 440, tone: "red" },
    { a: T.arriba, b: T.tesoro - 0.1, label: "TALLADO", value: () => "ARRIBA → ABAJO", y: 440, tone: "green" },
    { a: T.cuarenta, b: T.fachadaT, label: "EL TESORO", value: (t) => `~${count(t, T.cuarenta, T.cuarenta + 0.7, 0, 40)} m`, y: 440, tone: "gold" },
    { a: T.y363, b: T.terremoto - 0.1, label: "AÑO", value: () => "363", y: 440, tone: "red" },
    { a: T.rompio, b: T.suagua - 0.1, label: "CISTERNAS", value: () => "ROTAS", y: 440, tone: "red" },
    { a: T.vaciando, b: T.mandaselo - 0.1, label: "CIUDAD", value: () => "SE VACÍA", y: 440, tone: "red" },
  ],
  titles: [
    { a: T.tunelT, text: "EL TÚNEL" }, { a: T.canalesT, text: "CANALES" }, { a: T.decantadores, text: "DECANTADORES" },
    { a: T.cisternasT, text: "CISTERNAS" }, { a: T.fachadaT, text: "LA FACHADA" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.petra, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.arrasa, T.b1 - 0.1], [T.suelo, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN MÁQUINAS"], [T.b2, T.c2, "SIN BOMBAS"], [T.b4, T.c4, "SIN TANQUES"]],
  reward: { a: T.mandaselo, len: T.end - T.mandaselo, top: "EL TESORO SIGUE AHÍ", big: (t) => `+${count(t, T.mandaselo, T.mandaselo + 1.0, 0, 2000)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.nabateo, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#f4ecdc", fogNear: 130, fogFar: 560, hemiSky: "#f6f9ff", hemiGround: "#ecc49c", hemiI: 1.75, sun: "#fff2d6", sunI: 2.9 },
};
