// MEP10 — A latinha que volta para a prateleira (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
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
  { name: "gancho: 100 latinhas → a que sai → catador", t0: 0, keys: [
    K(0, [-120, 5, 34], [-108, 7, 0], 58, 2), K(T.noventa, [-104, 11, 62], [-100, 8.5, 0], 58, -1), K(T.dois, [-96, 12, 56], [-98, 8, 0], 56, 2),
    K(T.viagem, [-96, 10, 30], [-92, 6, 2], 56, -2), K(T.viagem + 1.4, [-90, 6, 30], [-88, 1.5, 5.6], 56, 3),
    K(T.catador + 0.4, [-84, 6, 32], [-80, 2.5, 5.6], 58, -2), K(C1 - 0.05, [-74, 6, 34], [-68, 3, 5.6], 58, 1)] },
  { name: "caminhão enche de latinha → incha de ar → despeja", t0: C1, keys: [
    K(C1, [-60, 17, 13], [-55, 1.5, 2], 50, 3), K(T.caminhao + 0.6, [-64, 8, 30], [-56, 4, 2], 56, -2),
    K(T.so, [-40, 10, 32], [-52, 4, 0], 58, -2), K(T.ar - 0.8, [-54, 8, 28], [-52, 5, 0], 56, 3),
    K(T.ar + 0.5, [-66, 11, 30], [-52, 5, 0], 58, -3), K(T.z1, [-68, 14, 34], [-50, 4, 0], 58, 2),
    K(T.aperta, [-52, 9, 28], [-44, 5, 0], 56, -2), K(C2 - 0.05, [-46, 10, 30], [-38, 5, 0], 58, 0)] },
  { name: "prensa: fardo com ferro, plástico, sujeira → trituradora", t0: C2, keys: [
    K(C2, [-35, 3.5, 12], [-34, 4, 0], 46, 2), K(T.mas - 0.3, [-33, 6, 15], [-31.5, 3.2, 1.7], 50, -2),
    K(T.sujeira + 0.6, [-33, 7, 18], [-31, 3.4, 1.7], 50, 3), K(T.tritura - 0.2, [-26, 8, 26], [-20, 3, 0], 56, -3),
    K(T.cacos, [-6, 11, 30], [0, 5, 0], 58, 3), K(T.iman, [2, 10, 25], [8, 5.5, 0], 56, -3), K(C3 - 0.05, [5, 10, 24], [9, 5.5, 0], 54, 0)] },
  { name: "ímã → trituradora → cacos pintados e o fogo", t0: C3, keys: [
    K(C3, [8, 26, 9], [9, 2, 0], 54, -3), K(T.trit, [0, 13, 34], [2, 5, 0], 58, 3), K(T.pintados, [14, 8, 20], [14, 3, 0], 52, -3),
    K(T.queimaTinta, [18, 7, 16], [18, 2.8, 0], 48, 3), K(T.z3 + 0.3, [12, 11, 26], [22, 3, 0], 54, -2),
    K(T.forno, [22, 9, 24], [34, 3.5, 0], 56, 2), K(T.desc, [38, 12, 28], [40, 4, 0], 58, -2), K(C4 - 0.05, [40, 11.5, 27], [42, 4, 0], 58, 0)] },
  { name: "dentro do forno: fumaça → setas de calor → combustível", t0: C4, keys: [
    K(C4, [44, 8, 18], [43, 3, 0], 48, 3), K(T.calor, [38, 10, 20], [37, 3.5, 0], 50, -3),
    K(T.combust, [48, 9, 18], [47, 3.4, 0], 48, 2), K(T.derretem, [56, 10, 26], [62, 4, 0], 56, -2), K(C5 - 0.05, [62, 10, 26], [68, 5, 0], 58, 0)] },
  { name: "forno de fusão → lingote → tijolão → laminador", t0: C5, keys: [
    K(C5, [66, 12, 32], [78, 5.5, 0], 56, -2), K(T.fusao, [62, 6, 22], [78, 6, 0], 54, 3), K(60.0, [78, 16, 26], [84, 4, 0], 54, -3),
    K(T.lingote, [86, 8, 16], [90, 3, 0], 48, 2), K(62.4, [96, 8, 28], [96, 3, 0], 50, -3), K(T.lingote + 2.8, [104, 12, 30], [99, 4, 0], 56, 3),
    K(T.tijolao, [96, 15, 38], [98, 3.5, 0], 58, -2), K(66.5, [90, 9, 30], [96, 3, 0], 52, 3), K(68.0, [100, 6, 18], [106, 4, 0], 50, -2),
    K(T.rolos, [104, 11, 28], [112, 5, 0], 52, 2), K(71.0, [112, 4, 14], [118, 5, 0], 46, -3), K(T.rolos + 2.6, [122, 11, 28], [124, 5, 0], 52, -2),
    K(T.lamin, [116, 15, 30], [126, 5, 0], 56, 2), K(75.4, [130, 5, 16], [130, 3, 0], 48, -3), K(C6 - 0.05, [136, 6, 30], [140, 8, 0], 58, 2)] },
  { name: "chapa plana → discos → copo → lata esticada", t0: C6, keys: [
    K(C6, [147, 15, 9], [148, 1.5, 0], 48, 2), K(T.discos, [152, 11, 26], [156, 4, 0], 52, -3), K(T.molde, [158, 10, 24], [161, 4, 0], 50, 2),
    K(T.esticam, [164, 10, 24], [167, 4, 0], 50, -2), K(T.maquina, [166, 14, 36], [168, 4, 0], 58, 3), K(C7 - 0.05, [168, 13, 34], [170, 4, 0], 58, 0)] },
  { name: "pinta, enche e a lata volta à prateleira", t0: C7, keys: [
    K(C7, [174, 8, 24], [177, 3.5, 0], 50, 3), K(T.pintam + 1.2, [182, 10, 26], [184, 4, 0], 52, -2), K(T.setor, [190, 11, 32], [194, 5, 0], 56, 2),
    K(T.prateleira, [196, 12, 38], [200, 6, 0], 56, -2), K(T.agoraSim, [202, 10, 36], [202, 6.5, 0], 54, 1),
    K(97.5, [190, 8, 26], [200, 6.5, 0], 52, -3), K(W10, [214, 9, 24], [204, 6.5, 0], 50, 3), K(T.end, [210, 12, 20], [203, 6.5, 0], 46, -3)] },
];
const DYN = [6.0, 0.7, 5.0, 4.0, 0.15, 0.3, 3.6, 6.5, 0.3, 0.8, 1.5];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([-122, 0, 6], 0.5, "present")],
  [T.noventa, S([-122, 0, 6], 0.5, "cheer")],
  [T.viagem, S([-104, 0, 7], 0.3, "point")],
  [C1, S([-68, 0, 10], 0.4, "present")],
  [T.so, S([-42, 0, 8], 0.4, "alarm")],
  [T.z1, S([-42, 0, 8], 0.4, "think")],
  [C2, S([-26, 0, 8], 0.4, "present")],
  [T.mas, S([-26, 0, 8], 0.4, "alarm")],
  [T.tritura, S([-12, 0, 8], 0.5, "point")],
  [T.iman, S([14, 0, 8], 0.2, "cheer")],
  [T.pintados, S([22, 0, 6], 0.3, "alarm")],
  [T.forno, S([26, 0, 8], 0.5, "point")],
  [T.desc, S([37, 0, 8], 0.4, "cheer")],
  [C4, S([51, 0, 8], 0.2, "think")],
  [T.combust, S([51, 0, 8], 0.2, "cheer")],
  [T.derretem, S([64, 0, 8], 0.5, "point")],
  [C5, S([78, 0, 12], 0.4, "alarm")],
  [T.fusao, S([68, 0, 9], 0.5, "cheer")],
  [T.lingote, S([90, 0, 10], 0.4, "point")],
  [T.tijolao, S([106, 0, 9], 0.2, "alarm")],
  [T.rolos, S([108, 0, 10], 0.3, "think")],
  [T.lamin, S([128, 0, 10], 0.3, "cheer")],
  [C6, S([146, 0, 8], 0.3, "alarm")],
  [T.discos, S([154, 0, 8], 0.3, "point")],
  [T.molde, S([162, 0, 8], 0.3, "point")],
  [T.maquina, S([172, 0, 9], 0.3, "cheer")],
  [T.pintam, S([176, 0, 8], 0.3, "point")],
  [T.setor, S([192, 0, 9], 0.3, "present")],
  [T.agoraSim, S([196, 0, 9], -0.1, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.cem, b: T.viagem - 0.1, label: "VOLTAM AO METAL", value: (t) => `${count(t, T.noventa - 0.3, T.dois + 0.2, 0, 97)}+ DE 100`, y: 440 },
    { a: T.dois, b: T.viagem - 0.1, label: "EM", value: () => "2024", y: 550, tone: "gold" },
    { a: T.so, b: T.z1 - 0.1, label: "CAÇAMBA", value: () => "CHEIA DE AR", y: 440, tone: "red" },
    { a: T.mas, b: T.z2 - 0.1, label: "DENTRO DO FARDO", value: () => "DE TUDO", y: 440, tone: "red" },
    { a: T.pintados, b: T.z3 - 0.1, label: "CACOS", value: () => "PINTADOS", y: 440, tone: "red" },
    { a: T.calor, b: T.derretem - 0.1, label: "CALOR DA TINTA", value: () => "AQUECE OS CACOS", y: 440, tone: "green" },
    { a: T.lingote, b: T.z4 - 0.1, label: "LINGOTE", value: (t) => `${count(t, T.lingote + 0.4, T.lingote + 3, 0, 20)}+ t`, y: 440, tone: "gold" },
    { a: T.rolos, b: T.z5 - 0.1, label: "CHAPA", value: (t) => (t < T.rolos + 2.6 ? "GROSSA" : "FININHA"), y: 440, tone: "dark" },
    { a: T.discos, b: T.pintam - 0.1, label: "LATA", value: (t) => (t < T.molde ? "DISCO" : t < T.esticam ? "COPO" : "ESTICADA"), y: 440 },
    { a: T.setor, b: T.agoraSim - 0.1, label: "NA PRATELEIRA EM", value: () => "~2 MESES", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.prensa, text: "PRENSA" }, { a: T.trit, text: "TRITURADORA" }, { a: T.desc, text: "FORNO DESCASCADOR", len: 1.6 },
    { a: T.fusao, text: "FORNO DE FUSÃO" }, { a: T.lamin, text: "LAMINADOR" }, { a: T.maquina, text: "MÁQUINA DE LATA" },
  ],
  alerts: [T.so, T.mas, T.pintados, T.tijolao, T.plana],
  rewinds: [],
  crosses: [[T.queimaTinta + 1.4, T.z3 - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM: ZEROU!", big: () => "LATA NOVA!", sub: "DA LATINHA À PRATELEIRA" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 220, fogFar: 760, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
