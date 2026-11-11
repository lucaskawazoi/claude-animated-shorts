// MEP8 — O tatuzão (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz deste episódio.
// Os planos debaixo da terra acompanham a máquina: chaves relativas à roda (xH), somadas no quadro (FK).
import { K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { GY, World, YT, xH } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const FK = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t: number) => {
  const c = keyed(keys, t), x = xH(t); return { ...c, pos: [c.pos[0] + x, c.pos[1], c.pos[2]] as V3, look: [c.look[0] + x, c.look[1], c.look[2]] as V3 }; } });

const SHOTS: Shot[] = [
  FK("gancho: a máquina pronta debaixo da cidade", 0, [
    K(0, [14, YT + 2, 22], [0, YT, 0], 50, 2), K(T.cento, [-10, YT + 4, 34], [-10, YT, 0], 56, -2),
    K(T.sp, [0, 24, 52], [0, 20, 0], 60, 2), K(T.voce, [8, 30, 56], [4, 22, -4], 60, -1), K(C1 - 0.05, [8, 30.5, 56], [4, 22, -4], 60, 0)]),
  { name: "vala abre a rua → mergulho até o poço → roda", t0: C1, keys: [
    K(C1, [-6, GY + 10, 24], [-6, GY, -6], 56, 2), K(T.rua, [-4, GY + 12, 26], [-6, GY, -6], 56, -1),
    K(T.para, [-16, GY + 9, 22], [-22, GY, -6], 56, 2), K(T.cava + 0.3, [-40, YT + 5, 24], [-44, YT, 0], 56, -2),
    K(T.roda, [-37.4, YT + 1, 9], [-42.4, YT, 0], 46, 1), K(T.tatuzao, [-37, YT + 3, 13], [-40.5, YT, 0], 50, -1), K(C2 - 0.05, [-35, YT + 3, 13], [-38.4, YT, 0], 50, 0)] },
  FK("roda de frente → terra desaba atrás → ⏪ → escudo", C2, [
    K(C2, [6, YT + 2, 10], [0, YT, 0], 46, -3), K(W3, [6, YT + 2.1, 10.2], [0, YT, 0], 46, -2),
    K(W3 + 0.7, [-8, YT + 6, 18], [-6, YT + 1, 0], 56, 5), K(T.desmorona, [-6, YT + 5, 16], [-5, YT, 0], 54, 2),
    K(T.volta, [-4, YT + 8, 22], [-3, YT + 1, 0], 56, -2), K(T.escudo, [-5, YT + 3, 14], [-4, YT, 0], 52, 1), K(C3 - 0.05, [-5, YT + 3, 13.6], [-4, YT, 0], 52, 0)]),
  FK("braço monta os anéis → o túnel → a frente empurra", C3, [
    K(C3, [-14, YT + 1, 9], [-8, YT, -0.5], 48, 2), K(T.braco, [-13, YT + 1.2, 9], [-8, YT, -0.5], 48, -1),
    K(T.nove, [-12, YT + 2, 10], [-8, YT, -0.5], 50, 1), K(T.tunel, [-24, YT + 6, 20], [-12, YT, 0], 56, -1),
    K(T.z2, [-22, YT + 7, 22], [-12, YT, 0], 56, 1), K(T.frente, [10, YT + 4, 18], [3, YT + 2, 0], 54, -2), K(C4 - 0.05, [10, YT + 4, 17.6], [3, YT + 2, 0], 54, 0)]),
  FK("a rua afunda → câmara de pressão", C4, [
    K(C4, [4, GY + 8, 26], [2, GY - 4, -4], 58, 2), K(T.afundar, [4, GY + 6, 24], [2, GY - 6, -4], 58, -1),
    K(T.apertada, [6, YT + 3, 14], [-1, YT, 0], 52, 2), K(T.camara, [5, YT + 2, 12], [-1, YT, 0], 50, -1),
    K(W6, [5, YT + 2, 11.8], [-1, YT, 0], 50, 0), K(C5 - 0.42, [5, YT + 2.5, 11.6], [-22, YT, 0], 56, 4), K(C5 - 0.02, [5, YT + 2.6, 11.6], [-22, YT, 0], 56, 4)]),
  FK("terra amontoa → rosca → esteira → fresta", C5, [
    K(C5, [-6, YT + 1, 8], [-6, YT - 1, -0.5], 46, 2), K(T.arranca, [-7, YT + 1.5, 9], [-6, YT - 1, -0.5], 46, -1),
    K(T.parafuso, [-6, YT + 0.5, 7], [-6, YT - 1, -0.5], 44, 1), K(T.esteira, [-30, YT + 8, 26], [-20, YT, 0], 58, -1),
    K(T.rosca, [-24, YT + 8, 26], [-18, YT, 0], 58, 1), K(T.fresta, [-13, YT + 3.3, 7], [-13, YT + 3.1, 0], 34, -1), K(C6 - 0.05, [-13.4, YT + 3.3, 6.8], [-13.4, YT + 3.1, 0], 34, 0)]),
  FK("argamassa → a máquina anda → outra linha no caminho", C6, [
    K(C6, [-4, YT + 1.5, 10], [-11, YT + 2.6, 0], 46, 2), K(T.argamassa, [-5, YT + 1.8, 10.5], [-11, YT + 2.8, 0], 46, -1),
    K(T.anda, [-6, YT + 6, 18], [-6, YT, 0], 56, 1), K(T.z5, [-7, YT + 6, 19], [-6, YT, 0], 56, -1),
    K(T.caminho, [-4, 22, 26], [4, 22, 0], 54, 2), K(C7 - 0.05, [-4, 22.5, 26], [4, 22, 0], 54, 0)]),
  FK("estação fechada → passa por baixo → a cidade inteira", C7, [
    K(C7, [8, GY + 8, 26], [1, GY + 2, -10], 56, 2), K(T.estacao, [7, GY + 7, 24], [1, GY + 2, -10], 56, -1),
    K(T.vinte, [-6, 22, 44], [-2, 19, 0], 60, 1), K(T.agoraSim, [-20, 30, 70], [-20, 18, 0], 62, 2),
    K(T.nove2, [-30, 32, 74], [-24, 18, 0], 62, -1), K(W10, [-34, 32, 76], [-26, 18, 0], 62, 0),
    K(W10 + 0.7, [-14, 40, 84], [-12, 20, 0], 62, 0), K(T.end, [-16, 40, 84], [-12, 20, 0], 62, 0)]),
];
const DYN = [6.0, 0.7, 5.0, 4.0, 0.15, 0.3, 3.6, 3.8, 0.3, 0.8, 0.05];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const IN = (dx: number) => ({ follow: (t: number): V3 => [xH(t) + dx, YT - 3.3 + 0.75, -0.2], scale: 0.85 });
const WORKER: [number, WorkerState][] = [
  [0, S([0, 0, 0], 0, "present", IN(-12))],
  [T.sp, S([0, 0, 0], 0.3, "point", IN(-12))],
  [C1, S([-12, GY, -0.8], 0.3, "present")],
  [T.para, S([-12, GY, -0.8], 0.3, "alarm")],
  [T.cava + 0.3, S([0, 0, 0], 0.2, "point", IN(-8))],
  [T.desmorona, S([0, 0, 0], 0, "alarm", IN(-9))],
  [T.volta, S([0, 0, 0], 0, "think", IN(-9))],
  [T.escudo, S([0, 0, 0], 0.2, "cheer", IN(-9))],
  [C3, S([0, 0, 0], -0.5, "point", IN(-15))],
  [T.tunel, S([0, 0, 0], 0, "cheer", IN(-15))],
  [T.frente, S([0, 0, 0], 0.4, "alarm", IN(-11))],
  [T.apertada, S([0, 0, 0], 0.4, "point", IN(-11))],
  [T.camara, S([0, 0, 0], 0.2, "cheer", IN(-11))],
  [C5, S([0, 0, 0], 0.3, "think", IN(-11))],
  [T.parafuso, S([0, 0, 0], 0.6, "point", IN(-11))],
  [T.rosca, S([0, 0, 0], 0.2, "cheer", IN(-11))],
  [T.fresta, S([0, 0, 0], 0, "think", IN(-18))],
  [T.argamassa, S([0, 0, 0], 0.3, "point", IN(-18))],
  [C7, S([26, GY, -0.8], 0.2, "present")],
  [T.estacao, S([26, GY, -0.8], 0.6, "point")],
  [T.vinte, S([0, 0, 0], 0, "cheer", IN(-12))],
];

const hud: HudData = {
  pills: [
    { a: T.duas, b: T.sp - 0.1, label: "PESO", value: (t) => `${count(t, T.duas, T.duas + 1.2, 0, 2000)} t`, y: 440 },
    { a: T.cento, b: T.sp - 0.1, label: "COMPRIMENTO", value: () => "109 m", y: 550, tone: "gold" },
    { a: T.nove, b: T.tunel - 0.1, label: "ANEL", value: () => "9 PEÇAS", y: 440 },
    { a: T.sessenta, b: T.tunel - 0.1, label: "CADA ANEL", value: () => "60 t", y: 550, tone: "gold" },
    { a: T.frente, b: T.apertada - 0.1, label: "PRESSÃO", value: () => "TERRA + ÁGUA", y: 440, tone: "red" },
    { a: T.apertada, b: T.z3 - 0.1, label: "PRESSÃO", value: () => "EQUILIBRADA", y: 440, tone: "green" },
    { a: T.fresta + 0.4, b: T.argamassa - 0.1, label: "ENTRE ANEL E TERRA", value: () => "FRESTA", y: 440, tone: "red" },
    { a: T.argamassa + 0.3, b: T.z5 - 0.1, label: "FRESTA", value: () => "CHEIA", y: 440, tone: "green" },
    { a: T.vinte, b: T.agoraSim - 0.1, label: "POR BAIXO", value: () => "24 m", y: 440 },
  ],
  titles: [
    { a: T.tatuzao, text: "TATUZÃO" }, { a: T.tunel, text: "TÚNEL" }, { a: T.camara, text: "CÂMARA DE PRESSÃO", len: 1.9 },
    { a: T.rosca, text: "ROSCA" }, { a: T.argamassa + 0.5, text: "ARGAMASSA", len: 2.0 },
  ],
  alerts: [T.mas, T.terra, T.frente, T.arranca, T.fresta, T.caminho],
  rewinds: [T.volta],
  crosses: [[T.para, T.cava - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM: ZEROU!", big: (t) => `${count(t, T.nove2, T.nove2 + 1.2, 0, 8.9, 1)} km`, sub: "LINHA 6-LARANJA · SÃO PAULO" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 170, fogFar: 600, hemiSky: "#eef6ff", hemiGround: "#d9b080", hemiI: 1.35, sun: "#fff3dc", sunI: 2.5 },
};
