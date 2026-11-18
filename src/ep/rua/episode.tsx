// Episódio «rua» — por que o buraco da sua rua volta (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
// Ritmo calmo (crítica do Lucas à usina 2, 16/11): planos de 1,3 s ou mais, deslocamentos curtos, tremor de mão menor.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import { HudData } from "../../toy/hud";
import { V3, lerp, prog, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { OPEN_END, openId } from "./opening";
import { BX, BZ, GX, PX, PZ, ZB, World, top } from "./world";
export { OPENING } from "./opening";

// ---- as três aberturas (0 a OPEN_END): A de cima mergulhando no buraco; B atrás do carro que cai nele; C a rua do alto fechando nele
const carZ = (t: number, t0: number) => lerp(-24, 18, prog(t, t0, OPEN_END + 0.6));
const openA = (t: number): CamState => { const u = sstep(prog(t, 0, OPEN_END)); return { pos: [PX, lerp(16, 6.5, u), PZ + lerp(8, 5, u)], look: [PX, 0, PZ], fov: lerp(54, 46, u), roll: 6 * (1 - u) }; };
const openB = (t: number): CamState => { const z = carZ(t, 0); return { pos: [PX + 0.6, 3.2, z - 9], look: [PX, 0.8, z + 6], fov: 52, roll: 0 }; };
const openC = (t: number): CamState => { const u = sstep(prog(t, 0, OPEN_END)); return { pos: [lerp(0, PX, u), lerp(42, 11, u), lerp(52, PZ + 14, u)], look: [lerp(0, PX, u), 0, lerp(-12, PZ, u)], fov: lerp(58, 50, u), roll: 0 }; };
const camS1 = (t: number): CamState => { const o = openId(); return (o === "A" ? openA : o === "B" ? openB : openC)(Math.min(t, OPEN_END)); };

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história; câmera anda pouco dentro do plano
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [11, 1.9, 5]; // rosto do operário na calçada
const ROWS: R[] = [
  [3.0, [0, 7, 38], [0, -3, -2], [0, 6, 34], [0, -3, 0], 54, 52, 1, -1, "a rua inteira em corte"],
  [T.camada, [0, 1, 27], [0, -2.5, 6], [0, 1.5, 25], [0, -2.4, 6], 50, 48, -1, 1, "camada por camada: a rua desmonta"],
  [T.terra, [-15, 3, 20], [-2, -3, -2], [-12, 3.5, 18], [-2, -3, -2], 52, 50, 1, -1, "terra e o rolo pé de carneiro"],
  [T.pedra, [-3, -0.5, 21], [0, -2.2, 8], [-1, 0, 20], [0, -2.1, 8], 50, 48, -1, 1, "pedra britada no corte"],
  [T.asfalto, [13, 8, 24], [0, 0, 0], [10, 7, 22], [0, 0, 0], 52, 50, 1, -1, "asfalto e o rolo liso"],
  [T.cinco, [PX + 1.5, 0.6, 13.5], [PX, -0.1, 8], [PX + 0.8, 0.5, 13], [PX, -0.1, 8], 40, 38, 0, 0, "a capa de 5 cm no corte"],
  [T.prob1, [13.5, 2.8, 15], W1, [13, 2.8, 14], W1, 44, 42, 1, -1, "operário: tem um probleminha"],
  [T.racha, [PX, 10, PZ + 5], [PX, 0, PZ], [PX, 8.5, PZ + 4], [PX, 0, PZ], 46, 44, 0, 0, "a trinca, de cima"],
  [T.trinca, [PX + 0.5, -0.4, 14.5], [PX, -0.9, 8], [PX, -0.5, 14], [PX, -0.9, 8], 42, 40, 0, 0, "a água desce pela trinca (corte)"],
  [T.meio, [0, 1.8, 25], [0, 0, 6], [0, 2.2, 23], [0, 0, 6], 46, 44, 0, 0, "a rua mais alta no meio: a água escorre"],
  [T.sarjeta, [-13, 3, 17], [-8, 0, 2], [-12.5, 2.8, 15], [-8, 0, 2], 48, 46, 1, -1, "guia e sarjeta"],
  [T.z1, [13.5, 2.8, 13], W1, [13, 2.6, 12.5], W1, 44, 42, -1, 1, "Zerou? (operário)"],
  [T.prob2, [-5, 1.6, 22], [-6.5, 0.2, -12], [-4.5, 1.8, 20], [-6.5, 0.2, -12], 50, 48, 0, 0, "a sarjeta enche"],
  [T.alaga, [9, 7, 28], [0, 0, -6], [7, 6.5, 26], [0, 0, -6], 52, 50, 1, -1, "a esquina alaga"],
  [T.boca, [-12, 2.6, 8], [BX, 0.1, BZ], [-11.5, 2.4, 7], [BX, 0.1, BZ], 46, 44, 0, 0, "a boca de lobo engole a água"],
  [T.galeria, [-6, -4.5, 19], [GX, -7, 8], [-6.5, -5, 18], [GX, -7, 8], 48, 46, 0, 0, "a galeria leva até o rio (corte)"],
  [T.pato, [-3, -4.5, ZB - 16], [GX, -7, ZB - 1.5], [-4, -5, ZB - 13], [GX, -7, ZB - 1.5], 46, 44, 0, 0, "a saída no córrego, com o bico de pato"],
  [T.z2, [9.5, 2.8, 13], W1, [10, 2.7, 12.5], W1, 44, 42, 1, -1, "Zerou? (operário)"],
  [T.prob3, [PX - 0.5, -0.8, 14.5], [PX, -1.1, 8], [PX, -0.9, 14], [PX, -1.1, 8], 44, 42, 0, 0, "a pedra amolece (corte)"],
  [T.caminhao, [PX + 7, 2.2, 20], [PX - 1, 2, -12], [PX + 6.5, 2.2, 19], [PX - 1, 2, -12], 50, 48, 0, 0, "o caminhão vem"],
  [T.eixo, [PX + 10, 2.5, PZ + 1], [PX, 0.6, PZ], [PX + 9.5, 2.3, PZ + 0.5], [PX, 0.6, PZ], 46, 44, 0, 0, "o eixo carregado sobre a trinca"],
  [T.cede, [PX + 1, 0.6, 15.5], [PX, -0.6, 8], [PX + 0.5, 0.5, 15], [PX, -0.6, 8], 44, 42, 0, 0, "a base cede e o asfalto quebra (corte)"],
  [T.buraco2, [PX, 8.5, PZ + 4], [PX, 0, PZ], [PX, 7.5, PZ + 3.5], [PX, 0, PZ], 46, 44, 0, 0, "o buraco, de cima"],
  [T.massa, [PX + 6, 3.8, PZ + 7], [PX + 1, 0.4, PZ], [PX + 5.5, 3.6, PZ + 6.5], [PX + 1, 0.4, PZ], 48, 46, 0, 0, "massa fria por cima"],
  [T.pisa, [PX + 2.5, 2.4, PZ + 4], [PX, 0.2, PZ], [PX + 2.2, 2.2, PZ + 3.6], [PX, 0.2, PZ], 44, 42, 0, 0, "e pisa: o tapa-buraco"],
  [T.z3, [PX + 5.5, 2.6, PZ + 5.5], [PX + 2.6, 1.4, PZ + 0.8], [PX + 5, 2.5, PZ + 5], [PX + 2.6, 1.4, PZ + 0.8], 44, 42, 1, -1, "Zerou? (operário no buraco)"],
  [T.voltou, [PX + 7, 2.6, PZ + 11], [PX, 0.5, PZ - 3], [PX + 6.5, 2.6, PZ + 10], [PX, 0.5, PZ - 3], 50, 48, 0, 0, "o carro cai de novo: voltou"],
  [T.capa, [PX, -0.5, 14.5], [PX, -1.0, 8], [PX + 0.4, -0.6, 14], [PX, -1.0, 8], 44, 42, 0, 0, "a base mole continua lá embaixo (corte)"],
  [T.corta, [PX, 9, PZ + 4], [PX, 0, PZ - 0.6], [PX, 8.5, PZ + 3.6], [PX, 0, PZ - 0.6], 46, 44, 0, 0, "corta um retângulo, de cima"],
  [T.tira, [PX + 7, 6.5, 17], [PX, 0, PZ], [PX + 6.5, 7, 16], [PX, 0, PZ], 52, 50, 0, 0, "tira o estragado"],
  [T.refaz, [PX + 4.5, 2.2, 13.5], [PX, -0.4, PZ], [PX + 4, 2.1, 13], [PX, -0.4, PZ], 46, 44, 0, 0, "refaz e compacta a base"],
  [T.quente, [PX + 3, 3.2, 13.5], [PX, 0.2, PZ], [PX + 2.6, 3, 13], [PX, 0.2, PZ], 46, 44, 0, 0, "asfalto quente"],
  [T.remendo, [PX, 8.5, PZ + 3.5], [PX, 0, PZ - 0.6], [PX, 8, PZ + 3.2], [PX, 0, PZ - 0.6], 46, 44, 0, 0, "o remendo profundo, de cima"],
  [T.agoraSim, [7, 4.2, 27], [PX, 0.5, 0], [6, 4.4, 25], [PX, 0.5, 0], 50, 48, 0, 0, "o carro passa liso"],
  [T.custa, [13.5, 2.8, 14], W1, [13, 2.8, 13], W1, 44, 42, -1, 1, "operário comemora"],
  [T.qual, [0, 13, 40], [0, -1, -10], [0, 17, 47], [0, -1, -10], 54, 56, 0, 0, "a rua inteira, de longe"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, u = sstep(Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0])))) * 0.6 + 0.4 * Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0])));
  const L = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: L(r[1], r[3]), look: L(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = [
  { name: "gancho (A/B/C): o buraco tapado três vezes", t0: 0, keys: [], fn: camS1 },
  ...ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) })),
];
// tremor de mão por janela da régua: bem menor que no esgoto (o Lucas ficou tonto com a usina 2)
const DYN = [1.6, 1.2, 1.6, 1.6, 1, 1, 1.6, 1.6, 1, 1, 1.2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const SIDE: V3 = [11, 0.69, 5], HOLE: V3 = [PX + 2.6, top(PX + 2.6), PZ + 0.8];
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, -0.9, "present")],
  [T.terra + 0.2, S(SIDE, -0.9, "point")],
  [T.asfalto + 0.3, S(SIDE, -0.9, "cheer")],
  [T.prob1, S(SIDE, -0.9, "alarm")],
  [T.meio, S(SIDE, -0.9, "point")],
  [T.z1, S(SIDE, -0.9, "think")],
  [T.prob2, S(SIDE, -0.9, "alarm")],
  [T.boca, S(SIDE, -0.9, "point")],
  [T.z2, S(SIDE, -0.9, "think")],
  [T.prob3, S(SIDE, -0.9, "alarm")],
  [T.caminhao, S(SIDE, -0.9, "point")],
  [T.quebra, S(SIDE, -0.9, "alarm")],
  [T.massa - 0.4, S(HOLE, -1.7, "pour")],
  [T.pisa, S(HOLE, -1.7, "cheer")],
  [T.z3, S(HOLE, -1.2, "think")],
  [T.voltou + 0.4, S(HOLE, -1.2, "alarm")],
  [T.corta, S(HOLE, -1.7, "point")],
  [T.refaz, S(HOLE, -1.7, "present")],
  [T.agoraSim, S(SIDE, -0.9, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.4, b: T.camada - 0.1, label: "TAPADO", value: () => "3 VEZES", y: 440, hi: true, tone: "red" },
    { a: T.cinco, b: T.prob1 - 0.1, label: "ASFALTO", value: () => "≈ 5 CM", y: 440, hi: true, tone: "gold" },
    { a: T.meio + 0.2, b: T.z1 - 0.1, label: "CAIMENTO", value: () => "≈ 2%", y: 440, hi: true, tone: "green" },
    { a: T.eixo, b: T.cede - 0.05, label: "1 EIXO CARREGADO", value: () => "= MILHARES DE CARROS", y: 440, hi: true, tone: "red" },
    { a: T.mole, b: T.deixa4 - 0.05, label: "LÁ EMBAIXO", value: () => "BASE MOLE", y: 440, hi: true, tone: "red" },
  ],
  titles: [
    { a: T.terra, text: "TERRA" }, { a: T.pedra, text: "PEDRA BRITADA" }, { a: T.asfalto, text: "ASFALTO" },
    { a: T.guia, text: "GUIA" }, { a: T.sarjeta, text: "SARJETA" }, { a: T.boca, text: "BOCA DE LOBO" }, { a: T.galeria, text: "GALERIA" },
    { a: T.tapa, text: "TAPA-BURACO" }, { a: T.remendo, text: "REMENDO PROFUNDO", len: 2.4 },
  ],
  alerts: [T.prob1, T.prob2, T.prob3, T.voltou],
  rewinds: [T.camada],
  crosses: [[T.voltou + 0.45, T.capa - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM:", big: () => "ZEROU!", sub: "DO CHÃO FIRME PRA CIMA", bounces: [T.qual + 0.3] },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 120, fogFar: 520, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
