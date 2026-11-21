// E17 — Os puquios de Nasca (ecos-del-tiempo, Shorts). Câmera, agricultor, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~3–5 s (7 da régua + extras), algo sempre se mexendo,
// tentativas que dão errado com ✖ (a vala que desaba, o barro que entope a galeria).
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3, ease } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { SFX, T } from "./cues";
import { FACE, World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
type Open = "a" | "b" | "c";
export const OPEN_DEFAULT: Open = "a";
let OPEN: Open | null = null;
export const openOf = (): Open => {
  if (OPEN) return OPEN;
  try { const o = (getInputProps() as { open?: string }).open; OPEN = o === "a" || o === "b" || o === "c" ? o : OPEN_DEFAULT; } catch { OPEN = OPEN_DEFAULT; }
  return OPEN;
};
const DYN = [3.6, 2.4, 4.6, 3.0, 2.0, 2.2, 3.2, 3.4, 2.2, 2.6, 0.3];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
const steady = (c: CamState, t: number): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const F = FACE;

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) do alto do deserto seco, mergulho pela beira do corte até a água correndo no cascalho
  a: [K(0, [-6, 10, 18], [-8, 0, -2], 58, 1.2), K(1.1, [-5, 4, 13], [-6, -1, -1], 56, -0.3), K(1.9, [-4, -1.5, 9.5], [-5, -3.8, F], 50, 0.4), K(T.construyeron - 0.05, [-2, -3.4, 8], [-1, -3.8, F], 46, 0)],
  // b) colado nas gotas azuis do cascalho, sobe até a superfície seca
  b: [K(0, [-1, -3.6, 5.2], [0, -3.8, F], 46, 0.6), K(1.6, [-2, -1, 9], [-2, -2, F], 52, -0.5), K(T.construyeron - 0.05, [-4, 3, 13], [-6, 0, -1], 56, 0)],
  // c) o leito seco de perto (bola de mato rolando), e a câmera desce pela face
  c: [K(0, [-12, 1.6, 4], [-10, 0.4, -2], 52, 1), K(1.5, [-10, 0.6, 7], [-8, -1.5, 1], 54, -0.5), K(T.construyeron - 0.05, [-6, -2.4, 9], [-4, -3.6, F], 54, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: um rio sob o deserto", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("os nasca constroem, há uns 1.500 anos", T.construyeron, [
    K(T.construyeron, [0, 4.5, 12], [-1, 0.6, -2], 56, -1.5), K(T.todavia0 - 0.05, [2, 4, 10.5], [0, 0.6, -2], 54, 0)]),
  shot("e ainda funciona: a cocha cheia e os campos verdes", T.todavia0, [
    K(T.todavia0, [29, 6, 12], [44, 0.5, -3], 54, 1.5), ...hold(C1, [31, 5.4, 11], [44, 0.5, -3], 54, 0)]),
  shot("sem bombas, canos nem motores: pedra, terra, troncos e mãos", C1, [
    K(C1, [-10, 2.6, 7.5], [-10, 0.8, -1], 52, -1.5), K(T.piedra - 0.15, [-10.5, 2.4, 6.8], [-10, 0.7, -1], 50, 0)]),
  shot("pedra, terra, troncos: de lado, de perto", T.piedra - 0.1, [
    K(T.piedra - 0.1, [-5.2, 1.7, 5.6], [-10.2, 0.7, -1.2], 50, 1), K(T.manos, [-6.2, 1.5, 4.8], [-10, 0.8, -1.2], 48, -0.5), K(T.superficie - 0.05, [-6.8, 1.6, 4.6], [-10, 0.8, -1.2], 48, 0)]),
  shot("o rio da superfície, seco quase o ano todo", T.superficie, [
    K(T.superficie, [-15, 1.6, 4.6], [-10.5, 0.6, -2.4], 54, 1), K(14.9, [-17, 2.6, 6.5], [-12.5, 0.4, -2.2], 55, -0.5), ...hold(C2, [-15, 5.4, 11], [-12, 0, -2], 56, 0)]),
  shot("«¿cómo encuentras agua?»: o agricultor no leito seco", C2, [
    K(C2, [0, 2.2, 7], [0, 0.6, -1.4], 50, -1.5), K(17.95, [0.3, 2.1, 6.6], [0, 0.6, -1.4], 48, 0)]),
  shot("a água escondida sob o leito seco (o rio de verdade)", 18.0, [
    K(18.0, [-5, -2.2, 9], [-2, -3.9, F], 52, 1.2), K(T.c1 - 0.05, [1, -2.6, 8.2], [3, -3.9, F], 50, 0)]),
  shot("«con ingenio»: o agricultor", T.c1, [
    K(T.c1, [0.5, 2.0, 6.4], [0, 0.6, -1.4], 48, 0.5), K(T.cavan - 0.05, [0.6, 2.0, 6.2], [0, 0.6, -1.4], 48, 0)]),
  shot("cavam até o cascalho: a água escondida correndo", T.cavan, [
    K(T.cavan, [2.5, -1.5, 8], [0, -2.6, F], 50, 1.5), K(T.grava, [1.8, -2.6, 7.4], [0, -3.6, F], 48, -0.5), K(T.grava + 0.9, [-3, -3.4, 7.2], [0, -3.8, F], 50, 0.5),
    ...hold(C3, [-3.6, -3.4, 7.4], [0, -3.8, F], 50, 0)]),
  shot("a zanja recolhe a água", C3, [
    K(C3, [6, 1.5, 11], [0, -1, F], 54, -1.5), K(T.recogen, [4, 1.2, 10], [0, -1.2, F], 54, 0.5), K(T.p2 - 0.05, [3.4, 1.0, 9.6], [0, -1.2, F], 54, 0)]),
  shot("a vala desaba ✖ e o sol bebe a água", T.p2, [
    K(T.p2, [0.6, -1.4, 9.5], [0, -2.2, F], 52, 1.5), K(T.derrumba + 0.4, [0.4, -1.8, 9.0], [0, -2.4, F], 50, -0.5), K(T.sol, [1, 1.5, 8], [0, -0.5, F], 52, 0.5), K(T.b2 - 0.05, [1.2, 1.6, 8.2], [0, -0.5, F], 52, 0)]),
  shot("«¿cómo la proteges sin tubos?»", T.b2, [
    K(T.b2, [3, 2.4, 8], [0, 0.8, -0.5], 50, -1.5), ...hold(C4, [2.6, 2.2, 7.6], [0, 0.8, -0.5], 50, 0)]),
  shot("forram de pedra, lajes e troncos por cima", C4, [
    K(C4, [-4, -3, 8], [-1, -3.6, F], 50, 1.5), K(T.conPiedra, [-2, -3.2, 7.4], [0, -3.6, F], 48, -0.5), K(T.tapan, [1, -2.4, 7.6], [0, -3.0, F], 48, 0.5), K(T.cubren - 0.05, [1.4, -2.0, 7.8], [0, -2.6, F], 48, 0)]),
  shot("cobrem de terra: o sol não toca a água ✔", T.cubren, [
    K(T.cubren, [0, 0.5, 9], [0, -1.6, F], 52, -1.5), K(T.oscuras - 0.45, [0.6, 1.0, 9.4], [0, -1.2, F], 54, 0)]),
  shot("«a oscuras»: terra e raio de sol, de mais longe", T.oscuras - 0.4, [
    K(T.oscuras - 0.4, [-5, -0.4, 11.5], [0.4, -0.8, F], 54, 0.5), ...hold(C5, [-3.6, -0.2, 10.5], [0.4, -0.8, F], 54, 0)]),
  shot("este é o puquio: a galeria inteira", C5, [
    K(C5, [-14, -1, 10], [0, -3.8, F], 56, 1.5), K(T.p3 - 0.05, [-12, -1.2, 9.6], [2, -3.8, F], 56, 0)]),
  shot("barro e areia entopem ✖; ninguém consegue entrar", T.p3, [
    K(T.p3, [3, -2.8, 7.4], [1, -3.8, F], 48, -1.5), K(T.barro, [2.4, -3.0, 7.0], [1, -3.8, F], 46, 0.5), K(T.alguien, [1.5, 1.2, 10.5], [1.2, -1.6, 0.6], 58, 0), K(T.b3 - 0.05, [1.8, 1.0, 10.8], [1.2, -1.6, 0.6], 58, 0)]),
  shot("os ojos se abrem em fila (vista do alto)", T.b3, [
    K(T.b3, [2.6, 2.4, 6.2], [2.4, 0.9, -1.0], 48, 1.5), K(T.embudo, [4, 9, 12], [2, 0, -1], 56, -0.5), K(T.rampa - 0.05, [5, 8.6, 11.6], [2, 0, -1], 56, 0)]),
  shot("a rampa em espiral: desce para limpar", T.rampa, [
    K(T.rampa, [2.4, 0.2, 8.4], [0, -1.2, F], 52, -1.5), K(T.bajan, [1.0, -1.2, 8.6], [0, -1.5, F], 50, 0.5), ...hold(C6, [0.6, -1.4, 8.4], [0, -1.5, F], 50, 0)]),
  shot("«estos son los ojos»: de cima", C6, [
    K(C6, [0, 20, 6], [0, 0, -1], 56, 1.5), K(T.ojos + 0.65, [1, 19.5, 6], [0, 0, -1], 56, 0)]),
  shot("a fila de ojos, de lado e baixo", T.ojos + 0.7, [
    K(T.ojos + 0.7, [-27, 3.6, 7], [-5, 0.2, 0], 56, -1), K(T.hipotesis - 0.05, [-24, 3.0, 6.4], [-3, 0.2, 0], 56, 0)]),
  shot("hipótese: o vento entra pelos ojos e empurra a água", T.hipotesis, [
    K(T.hipotesis, [-8, 4, 12], [-4, -1, 1], 56, -1.5), K(T.entra, [-6, 2.6, 10], [-4, -1.6, 1.6], 54, 0.5), K(T.empujar, [-2, -2.4, 8.6], [2, -3.8, F], 52, 0), K(T.final - 0.05, [0, -2.6, 8.4], [4, -3.8, F], 52, 0)]),
  shot("a água chega ao fim da galeria e sai", T.final, [
    K(T.final, [26, -2.2, 9.5], [31, -3.6, F], 52, 1.5), ...hold(C7, [28, -1.8, 10], [32, -3.4, F], 52, 0)]),
  shot("a cocha enche (diante dela)", C7, [
    K(C7, [37, 5.4, 9.5], [38.5, 0.2, -2], 54, -1.5), K(T.cocha + 0.3, [36.2, 4.8, 8.6], [38.5, 0.3, -2], 52, 0.5), K(T.riega - 0.05, [36, 4.6, 8.4], [38.5, 0.3, -2], 52, 0)]),
  shot("os campos brotam", T.riega, [
    K(T.riega, [50, 5, 10], [56, 0.6, -4], 54, -1.5), K(T.riega + 0.6, [53, 4.4, 8], [57, 0.6, -4], 52, 0.5), K(T.giro - 0.05, [54, 4.2, 7.6], [57, 0.6, -4], 52, 0)]),
  shot("o giro: os agricultores de hoje", T.giro, [
    K(T.giro, [2, 5, 12], [0, 0.8, -2], 56, -8), K(T.mil, [1.4, 4, 10], [0, 0.8, -2.4], 54, 0), K(T.usan - 0.05, [1.0, 3.6, 9], [0, 0.6, -2.4], 52, 0)]),
  shot("«todavía usan»: a fila de agricultores, de perto e de lado", T.usan, [
    K(T.usan, [10, 2.0, 8], [0.2, 1.0, -3], 54, 0.8), K(T.cadaAno - 0.05, [7.5, 1.8, 7], [0.2, 1.0, -3], 52, 0)]),
  shot("todo ano descem para limpar, à mão", T.cadaAno, [
    K(T.cadaAno, [2.4, 0.2, 8.4], [0, -1.6, F], 52, 1.5), K(T.manda - 0.05, [2.0, -0.2, 8.6], [0, -1.8, F], 52, 0)]),
  shot("final: o deserto e a fila de ojos", T.manda, [
    K(T.manda, [0, 10, 22], [4, 0, -2], 58, -1), K(T.end, [5, 6.5, 14], [1, 0.4, -2], 52, 0)]),
];

const FARMER: Costume = { skin: "#a8673f", top: "#efe4c8", bottom: "#5a4632", kilt: "#c8902a", kiltLen: 0.5, hat: "straw", hatC: "#d9b25a", boot: "#3a2b24", belt: "#2f7fc0", sleeves: true };
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.05, ...o });
/** descendo a rampa em espiral do ojo do corte (x=0), de u0 a u1 */
const spiral = (u0: number, u1: number) => (t: number): V3 => { const u = ease(t, u0, u1); return [0.8 * Math.cos((1 - u) * 3 * Math.PI), -0.1 - u * 2.7, F + 0.5]; };
const NOPE_X = -10;
const WORKER: [number, WorkerState][] = [
  [0, S([NOPE_X, 0.1, -2.6], 0, "present", { scale: 0 })],
  [C1, S([NOPE_X, 0.1, -2.6], 0, "present")],
  [T.bombas, S([NOPE_X, 0.1, -2.6], -0.4, "point")],
  [T.tubos - 0.1, S([NOPE_X, 0.1, -2.6], -0.2, "alarm")],
  [T.tubos, S([NOPE_X, 0.1, -2.6], 0, "point")],
  [T.motores - 0.1, S([NOPE_X, 0.1, -2.6], 0.1, "alarm")],
  [T.motores, S([NOPE_X, 0.1, -2.6], 0.3, "point")],
  [T.manos, S([NOPE_X, 0.1, -2.6], 0, "cheer")],
  [T.superficie, S([NOPE_X, 0.1, -2.6], -0.6, "point")],
  [T.seco, S([NOPE_X, 0.1, -2.6], -0.4, "alarm")],
  [C2, S([0, 0.1, -2.4], 0, "think")],
  [T.c1, S([0, 0.1, -2.4], 0, "cheer")],
  [T.cavan, S([0.4, 0.1, 0.9], -0.3, "chisel", { prop: "hammer" })],
  [T.p2, S([1.6, 0.1, 0.4], -0.4, "think")],
  [T.derrumba, S([1.6, 0.1, 0.4], -0.4, "alarm")],
  [T.b2, S([1.4, 0.1, -0.6], 0, "think")],
  [T.c2, S([1.4, 0.1, -0.6], 0, "cheer")],
  [T.forran, S([1.8, 0.1, 0.2], -0.5, "pull")],
  [T.noToca, S([1.8, 0.1, 0.2], -0.3, "cheer")],
  [T.p3, S([1.6, 0.1, -0.6], 0, "think")],
  [T.alguien, S([1.6, 0.1, -0.6], 0, "alarm")],
  [T.b3, S([2.4, 0.1, -1.0], 0, "cheer")],
  [T.bajan - 0.6, S([2.0, 0.1, 0.6], 0, "walk", { scale: 0.75, follow: spiral(T.bajan - 0.6, C6 + 0.4) })],
  [T.hipotesis, S([-4, 0.1, -1.6], 0.3, "point")],
  [T.final, S([41.5, 0.1, 2.6], 0.6, "present")],
  [C7, S([52, 0.1, 0.2], 0.4, "cheer")],
  [T.giro, S([1.4, 0.1, -1.4], 0, "cheer")],
  [T.cadaAno, S([2.0, 0.1, 0.6], 0, "pull", { scale: 0.75, follow: spiral(T.cadaAno, T.manda + 0.4) })],
  [T.manda, S([0, 0.1, -2], 0, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.llueve, b: T.rio0 - 0.1, label: "LLUVIA", value: () => "CASI NUNCA", y: 440, tone: "red" },
    { a: T.bajo0, b: T.construyeron - 0.1, label: "UN RÍO", value: () => "BAJO TIERRA", y: 440, tone: "gold" },
    { a: T.mil500, b: T.todavia0 - 0.1, label: "HACE", value: (t) => `≈ ${count(t, T.mil500, T.mil500 + 0.8, 0, 1500)} AÑOS`, y: 440, tone: "gold" },
    { a: T.todavia0, b: T.nascaPeru - 0.1, label: "HOY", value: () => "FUNCIONA", y: 440, tone: "green" },
    { a: T.nascaPeru, b: T.nohay - 0.1, label: "NASCA", value: () => "PERÚ", y: 440, tone: "gold" },
    { a: T.nohay, b: T.piedra - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.seco, b: T.b1 - 0.1, label: "RÍO DE ARRIBA", value: () => "SECO", y: 440, tone: "red" },
    { a: T.grava, b: T.recogen - 0.1, label: "BAJO EL CAUCE", value: () => "AGUA", y: 440, tone: "green" },
    { a: T.sol, b: T.b2 - 0.1, label: "SOL", value: () => "SE BEBE EL AGUA", y: 440, tone: "red" },
    { a: T.oscuras, b: T.puquio - 0.1, label: "SOL", value: () => "NO LA TOCA", y: 440, tone: "green" },
    { a: T.barro, b: T.b3 - 0.1, label: "GALERÍA", value: () => "LLENA DE BARRO", y: 440, tone: "red" },
    { a: T.cada, b: T.rampa - 0.1, label: "UN OJO CADA", value: () => "10–30 m", y: 440 },
    { a: T.hipotesis, b: T.final - 0.1, label: "HIPÓTESIS", value: () => "EL VIENTO EMPUJA", y: 440, tone: "gold" },
    { a: T.cocha, b: T.giro - 0.1, label: "ESTANQUE", value: () => "COCHA", y: 440, tone: "green" },
    { a: T.mil, b: T.usan - 0.1, label: "DESPUÉS DE", value: () => "+1.000 AÑOS", y: 440, tone: "gold" },
    { a: T.cadaAno, b: T.manda - 0.1, label: "CADA AÑO", value: () => "LIMPIEZA A MANO", y: 440 },
  ],
  titles: [{ a: T.puquio, text: "PUQUIO" }, { a: T.ojos, text: "OJOS" }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.seco, T.p2, T.p3],
  rewinds: [T.b1, T.b2, T.b3],
  crosses: [[T.derrumba, T.b2 - 0.1], [T.barro, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN BOMBAS"], [T.b2, T.c2, "SIN TUBOS"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "HOY FUNCIONAN", big: (t) => count(t, T.manda, T.manda + 1, 0, 36), sub: "PUQUIOS EN NASCA" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: FARMER, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#ffe7bf", fog: "#fff0d6", fogNear: 120, fogFar: 520, hemiSky: "#fff6e4", hemiGround: "#d9b877", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
