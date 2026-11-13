// E7 — Faro de Alejandría (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { HOIST, IMPACT, SFX, T } from "./cues";
import { H1, H2, H3, RIDE0, TOP, TW, World, hoistFrac, night, rampH, rideTh } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3];
const PI = Math.PI;

// «que el viento rodea»: depois do piso redondo subir, a câmera chega ao alto e GIRA em volta do tambor (régua: o plano
// 53,3–54,2 s é o mais agitado da referência) e segura 0,4 s antes do corte 5; nada de sair para o mar (v2: reflexo vazio)
const DRUM: V3 = [TW.x, TOP + H1 + H2 + H3 / 2, TW.z];
const ORB0 = T.rodea - 0.25, ORB1 = C5 - 0.4, A0 = (225 * PI) / 180, A1 = (125 * PI) / 180;
const orbitAt = (u: number): V3 => { const a = lerp(A0, A1, u), r = lerp(17, 16, u); return [DRUM[0] + r * Math.cos(a), lerp(46, 45, u), DRUM[2] + r * Math.sin(a)]; };
const PISOS = [K(C4, [18, 40, -10], [16, 2, -21], 56, 2), K(T.abajo, [6, 28, -36], [16, 8, -21], 55, 0), K(T.medio, [0, 24, -40], [16, 16, -21], 54, 0),
  K(T.arriba, [2, 32, -37], [16, 25, -21], 54, 0), K(ORB0, orbitAt(0), [DRUM[0], DRUM[1] - 0.5, DRUM[2]], 54, 0)];
const pisosCam = (t: number) => t < ORB0 ? keyed(PISOS, t) : { pos: orbitAt(ease(t, ORB0, ORB1)), look: [DRUM[0], DRUM[1] - 0.5, DRUM[2]] as V3, fov: 54, roll: 0 };

// a rampa: vista de frente pelo corte da parede; quando os cavaleiros entram, a câmera sobe e acompanha os dois
const RAMPA = [K(C6, [16, 8.5, 1], [16, 7, -21], 50, 2), K(T.dentro, [16, 8, -1], [16, 7, -21], 50, 0), K(T.rampa + 1.2, [16.5, 5.5, -6], [16, 3.5, -21], 50, 0)];
const follow = (t: number) => {
  const th = rideTh(t), h = rampH(th), rx = 2.8 * Math.cos(th), rz = -2.8 * Math.sin(th);
  return { pos: [TW.x + 0.45 * rx, TOP + h + 3.4, TW.z + 12] as V3, look: [TW.x + 0.75 * rx, TOP + h + 1.5, TW.z + 0.5 * rz] as V3, fov: 50, roll: 0 };
};
const rampaCam = (t: number) => {
  const a = keyed(RAMPA, t), w = ease(t, RIDE0 - 0.6, RIDE0 + 0.6); if (w <= 0) return a;
  const b = follow(t), m = (x: V3, y: V3): V3 => [lerp(x[0], y[0], w), lerp(x[1], y[1], w), lerp(x[2], y[2], w)];
  return { pos: m(a.pos, b.pos), look: m(a.look, b.look), fov: lerp(a.fov, b.fov, w), roll: lerp(a.roll, b.roll, w) };
};

const SHOTS: Shot[] = [
  { name: "a torre ao lado de um prédio de 30 andares → ⏪ a costa sem torre", t0: 0, keys: [
    K(0, [44, 20, 18], [20, 16, -21], 55, 2), K(T.construido, [42, 16, 16], [18, 14, -21], 55, -1), K(T.nombre, [34, 12, 20], [16, 12, -21], 56, 0),
    K(T.alejandria, [24, 16, 36], [0, 2, -8], 58, 0), K(C1 - 0.05, [18, 13, 38], [-2, 1, -6], 58, 1)] },
  { name: "rente ao mar: rochas escondidas, o navio bate de lado (para, racha, aderna) → a torre sobe", t0: C1, keys: [
    K(C1, [-42, 4, 0], [-10, 1, -2], 56, 2), K(T.rocas, [-36, 5, -2], [-14, 0, -8], 54, 0), K(T.barcos, [-22.5, 4.2, 6.5], [-18.4, 1.0, -8], 56, -1),
    K(IMPACT + 0.55, [-22.0, 4.0, 5.8], [-18.0, 0.9, -8], 55, 0), K(T.b1 + 0.35, [-28, 8, 0], [4, 5, -18], 56, 0), K(T.torre, [-22, 11, 4], [14, 12, -21], 56, 0), K(C2 - 0.05, [-20, 12, 5], [14, 13, -21], 56, 0)] },
  { name: "a torre do mar → atrás de um navio ao longe (a costa ainda não aparece) → sobe: a ilha separada da cidade", t0: C2, keys: [
    K(C2, [42, 10, -58], [16, 14, -21], 54, -2), K(W3, [41.5, 10.3, -57], [16, 14, -21], 54, -1),
    K(W3 + 0.6, [38, 4, -88], [17, 20, -22], 48, 1), K(T.torreT, [36.1, 4, -82.3], [17, 20, -22], 48, 0),
    // de cima pelo NNE: ilha com a torre, o mar no meio, a cidade do outro lado; o reflexo do sol fica abaixo do quadro
    K(T.p2 + 0.6, [36, 30, -70], [0, 8, -2], 62, 0), K(C3 - 0.05, [33, 31, -66], [-2, 7, 0], 62, 0)] },
  { name: "o dique sai da cidade → dois portos → vento na torre", t0: C3, keys: [
    K(C3, [4, 6, 27], [-8, 0.6, 4], 54, 2), K(T.kilometro, [1, 7, 24], [-8, 0.6, -2], 54, 0), K(T.une, [8, 14, 30], [-8, 0, -6], 56, 0),
    K(T.puertos, [-8, 32, 32], [-8, 0, -4], 58, 0), K(T.hepta + 0.4, [-6, 31, 30], [-8, 0, -4], 58, 0),
    K(T.p3 + 0.6, [44, 13, 6], [16, 17, -21], 56, 0), K(T.peso, [42, 12, 4], [16, 18, -21], 56, -1), K(C4 - 0.05, [42, 12, 4], [16, 18, -21], 56, 0)] },
  // corte 4 invisível à régua em 13/11 (céu dos dois lados): abre de cima, mar e ilha sem céu, e desce enquanto os pisos sobem
  { name: "pegadas dos três pisos vistas de cima → os pisos sobem um a um → gira em volta do tambor com o vento", t0: C4, keys: [], fn: pisosCam },
  { name: "três pisos → noite (rampa de 3,4 s, câmera andando) → fogo → de longe no mar → a lenha sobe 100 m pela corda", t0: C5, keys: [
    K(C5, [26, 28, -9], [16, 27, -21], 50, -2), K(T.p4, [40, 14, 0], [16, 19, -21], 54, 0), K(T.fuego, [48, 15, 8], [16, 22, -21], 56, 0),
    K(T.lejos, [76, 16, 44], [16, 20, -21], 46, 0), K(T.fuegoT, [74, 16, 42], [16, 21, -21], 46, 0),
    K(T.p5 + 0.9, [36, 7, 4], [16, 4, -15], 52, 0), K(HOIST[1] + 0.13, [33, 3.0, 1], [16, 31.5, -16], 58, 0), K(C6 - 0.05, [33, 3.0, 1], [16, 31.5, -16], 58, 0)] },
  { name: "corte da torre: a rampa lisa cresce em espiral; dois cavaleiros com lenha sobem lado a lado, câmera junto", t0: C6, keys: [], fn: rampaCam },
  { name: "terremoto → ruínas → fortaleza → faros pelo mundo (dolly lento até o fim, fachos girando)", t0: C7, keys: [
    K(C7, [34, 14, 20], [16, 12, -21], 56, -2), K(T.ruinas, [30, 12, 18], [16, 6, -21], 56, 0), K(T.fortaleza, [26, 10, 8], [16, 3, -21], 54, 0),
    K(T.nombre2, [8, 30, 28], [2, 2, -24], 60, 0), K(T.end, [-6, 23, 20], [4, 3, -28], 55, 2)] },
];
// DYN[6] era 3,6 com o chicote para o mar; agora a janela 54,0–55,0 é o fim do giro + parada antes do corte
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 0.4, 3.8, 0.3, 1.3, 0.08];

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
  [T.p5, S([16.6, TOP, -9.4], PI + 0.12, "pull")],
  [C6, S([8.6, TOP, -12.4], 0.4, "point")],
  [T.jinetes, S([8.6, TOP, -12.4], 0.4, "cheer")],
  [C7, S([24, TOP, 14.5], 0.2, "alarm")],
  [T.fortaleza, S([24, TOP, 14.5], 0.2, "point")],
  [T.nombre2, S([24, TOP, 14.5], 0.2, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.1, b: T.construido - 0.1, label: "ALTURA", value: () => "+100 m", y: 440, tone: "gold" },
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
    { a: HOIST[0] - 0.1, b: T.b5 - 0.1, label: "SUBIR", value: (t) => `+${Math.round(100 * hoistFrac(t))} m`, y: 440, tone: "red" },
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
