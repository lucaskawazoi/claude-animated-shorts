// MEP6 — A água do rio ao copo (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz deste episódio.
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

const SHOTS: Shot[] = [
  { name: "gancho: a estação inteira → rio barrento", t0: 0, keys: [
    K(0, [72, 16, 30], [52, 6, 0], 58, 2), K(T.estacao, [22, 26, 38], [-6, 3, 0], 62, -2),
    K(T.barrento0, [-32, 11, 26], [-51, 1, 4], 58, 3), K(T.voce, [-30, 14, 28], [-46, 1, 0], 58, -1), K(C1 - 0.05, [-28, 15, 30], [-46, 1, 0], 58, 0)] },
  { name: "lixo no rio → grade → captação", t0: C1, keys: [
    K(C1, [-56, 7, -16], [-48, 1, 0], 52, 2), K(T.galho, [-57, 6, -15], [-50, 0.5, -2], 50, -1),
    K(T.grade, [-55, 6, -12], [-45, 1.5, 0], 50, 2), K(T.captacao, [-58, 10, -17], [-44, 2, 0], 56, -1), K(C2 - 0.05, [-58, 10.5, -17], [-44, 2, 0], 56, 0)] },
  { name: "água marrom no tanque → flocos", t0: C2, keys: [
    K(C2, [-22, 4, 16], [-22, 2.5, 0], 50, -3), K(W3, [-22.4, 4, 15.6], [-22, 2.6, 0], 50, -2),
    K(W3 + 0.7, [-12, 13, 25], [-20, 2, 0], 60, 5), K(T.produto, [-14, 11, 22], [-24, 2, 0], 58, 1),
    K(T.flocos, [-17, 7, 17], [-22, 2.5, 0], 54, -1), K(C3 - 0.05, [-16, 7, 17], [-20, 2.5, 0], 54, 0)] },
  { name: "flocos afundam → decantador → filtro", t0: C3, keys: [
    K(C3, [-8, 2.6, 12], [-17, 1.6, 0], 46, 2), K(T.decantador, [-6, 7, 17], [-16, 2, 0], 54, -1),
    K(T.z2, [-4, 8, 18], [-14, 2, 0], 56, 1), K(T.miuda, [10, 8, 18], [4, 3, 0], 54, -2),
    K(T.camadas, [9, 6, 16], [4, 2.8, 0], 50, 1), K(T.peneira, [8, 5.5, 14], [4, 2.8, 0], 48, 0), K(C4 - 0.05, [8, 5.5, 13.8], [4, 2.8, 0], 48, 0)] },
  { name: "filtro por cima → entope → ⏪ lavagem", t0: C4, keys: [
    K(C4, [-4, 15, -13], [4, 3, 0], 58, 2), K(T.z3, [0, 14, -11], [4, 3, 0], 58, -1),
    K(T.entope, [14, 6, 15], [4, 3.5, 0], 50, 2), K(T.volta, [16, 8, 18], [4, 3, 0], 54, -2),
    K(T.debaixo, [12, 5, 14], [4, 3, 0], 48, 1), K(W6, [11.8, 5, 13.8], [4, 3, 0], 48, 0),
    K(C5 - 0.42, [12, 6, 13], [30, 4, 0], 56, 4), K(C5 - 0.02, [12, 6.1, 13], [30, 4, 0], 56, 4)] },
  { name: "lavagem de lado → micróbios → cloro e flúor → casa longe", t0: C5, keys: [
    K(C5, [-6, 10, 14], [4, 3, 0], 54, 2), K(T.parece, [22, 4, 12], [20, 1.6, 0], 46, -2),
    K(T.microbio, [21, 3.5, 10], [20, 1.6, 0], 42, 1), K(T.cloro, [25, 8, 9], [18, 2, -6], 54, 2),
    K(T.fluor, [27, 8, 7], [22, 2, -9], 52, -1), K(T.z4, [30, 10, 15], [20, 2, 0], 58, 1),
    K(T.longe, [62, 20, 32], [52, 5, 0], 62, -2), K(C6 - 0.05, [60, 20, 32], [50, 5, 0], 62, 0)] },
  { name: "bomba → caixa d'água → desce", t0: C6, keys: [
    K(C6, [22, 4, 9], [29, 2, 0], 46, 2), K(T.bombeia + 1.2, [28, 12, 21], [38, 10, 0], 56, -1),
    K(T.desce, [47, 19, 18], [40, 15, 0], 52, 2), K(T.reservatorio, [55, 16, 25], [47, 8, 0], 58, -1), K(C7 - 0.05, [57, 15, 25], [49, 8, 0], 58, 0)] },
  { name: "cano rachado → cloro residual → torneira e copo", t0: C7, keys: [
    K(C7, [64, 3, 17], [65, 0.8, 10], 42, 2), K(T.tiquinho, [67, 3, 17], [66, 0.8, 10], 44, -1),
    K(T.ultima, [74, 4, 18], [77, 1, 10], 46, 1), K(T.agoraSim, [72, 8, 13], [80, 4.5, 0], 52, 2),
    K(T.copo, [73, 6, 11], [80, 3, 0], 50, -1), K(W10, [73.2, 6, 10.8], [80, 3, 0], 50, 0),
    K(W10 + 0.7, [70, 30, 50], [20, 4, 0], 62, 0), K(T.end, [66, 30, 48], [20, 4, 0], 62, 0)] },
];
const DYN = [6.0, 0.7, 5.0, 4.0, 0.15, 0.3, 3.6, 3.8, 0.3, 0.8, 0.05];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([62, 0, 10], 0.6, "present")],
  [T.barrento0, S([-38, 0, 8], 0.6, "point")],
  [C1, S([-41, 0, -6.5], -2.4, "present")],
  [T.galho, S([-41, 0, -6.5], -2.4, "alarm")],
  [T.grade, S([-41, 0, -6.5], -1.6, "point")],
  [T.captacao, S([-41, 0, -6.5], -2.4, "cheer")],
  [C2, S([-26, 0, 7.6], 0.4, "think")],
  [T.produto, S([-26, 0, 7.6], 0.4, "pour", { prop: "jar" })],
  [T.quieta, S([-26, 0, 7.6], 0.4, "present")],
  [C3, S([-11, 0, 7.6], 0.6, "point")],
  [T.decantador, S([-11, 0, 7.6], 0.6, "cheer")],
  [T.miuda, S([11, 0, 7.4], -0.1, "think")],
  [T.camadas, S([11, 0, 7.4], -0.3, "point")],
  [C4, S([11, 0, -7.4], 2.8, "present")],
  [T.entope, S([11, 0, 7.4], 0.4, "alarm")],
  [T.debaixo, S([11, 0, 7.4], 0.2, "point")],
  [C5, S([-3, 0, 7.6], 0.4, "cheer")],
  [T.parece, S([17, 0, 6.6], 0.6, "think")],
  [T.cloro, S([17, 0, 6.6], 0.8, "point")],
  [T.z4, S([17, 0, 6.6], 0.6, "cheer")],
  [T.longe, S([50, 0, 13], 0.5, "alarm")],
  [C6, S([26, 0, 4], 0.4, "present")],
  [T.bombeia, S([26, 0, 4], 0.9, "point")],
  [T.reservatorio, S([52, 0, 11], 0.5, "cheer")],
  [C7, S([62, 0, 13.5], 0.4, "alarm")],
  [T.tiquinho, S([62, 0, 13.5], 0.6, "point")],
  [T.agoraSim, S([78, 0, -5], -0.3, "cheer")],
];

const agua = (t: number) => (t < T.decantador ? "MARROM" : t < T.filtro ? "TURVA" : t < T.fluor ? "LIMPA?" : "SEGURA");
const hud: HudData = {
  pills: [
    { a: T.litros, b: T.barrento0 - 0.1, label: "VAZÃO", value: (t) => `${count(t, T.litros, T.litros + 1.3, 0, 33000)} L/s`, y: 440 },
    { a: T.estacao, b: T.barrento0 - 0.1, label: "UMA ESTAÇÃO", value: () => "SÃO PAULO", y: 550, tone: "gold" },
    { a: T.marrom, b: T.z2 - 0.1, label: "ÁGUA", value: agua, y: 440, tone: "red" },
    { a: T.miuda, b: T.z3 - 0.1, label: "ÁGUA", value: agua, y: 440 },
    { a: T.parece, b: T.z4 - 0.1, label: "ÁGUA", value: agua, y: 440, tone: "green" },
    { a: T.tiquinho, b: T.agoraSim - 0.1, label: "CLORO NO CANO", value: () => "0,2 mg/L", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.captacao, text: "CAPTAÇÃO" }, { a: T.decantador, text: "DECANTADOR" }, { a: T.filtro, text: "FILTRO", len: 1.1 },
    { a: T.fluor + 0.3, text: "CLORO + FLÚOR", len: 1.6 }, { a: T.reservatorio, text: "RESERVATÓRIO" },
  ],
  alerts: [T.so, T.marrom, T.miuda, T.entope, T.parece, T.longe, T.caminho],
  rewinds: [T.volta],
  crosses: [[T.entope + 0.4, T.volta - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM: ZEROU!", big: () => "LIMPA!", sub: "DO RIO BARRENTO AO SEU COPO" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 150, fogFar: 560, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
