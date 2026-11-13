// E6 — Gran Muralla (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// v3 (crítico 13/11): cortes duros a mais (XC) além dos 7 da régua; taipa de perto; mensageiro; torres com noite; general sozinho.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { FAST0, REWARD, SFX, T, XC } from "./cues";
import { EW, MSG_Z, World, capas, crestAt, crewX, msgX, nightK, northZ } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const PI = Math.PI;

/** câmera que acompanha o mensageiro (de lado, um pouco atrás, olhando para a serra) */
const ride = (dx: number, y: number, dz: number, ly: number, lz: number, fov: number, lead: number) => (t: number) => {
  const x = msgX(t);
  return { pos: [x + dx, y, MSG_Z + dz] as V3, look: [x - lead, ly, MSG_Z - lz] as V3, fov, roll: 0 };
};

/** abertura: voo ao lado da muralha, na altura das torres (crista suavizada para a câmera não dar solavancos) */
const cy = (x: number) => (crestAt(x - 6)[0] + crestAt(x)[0] + crestAt(x + 6)[0]) / 3, cz = (x: number) => (crestAt(x - 6)[1] + crestAt(x)[1] + crestAt(x + 6)[1]) / 3;
const fly = (t: number) => { const x = -54 + 4 * t; return { pos: [x, cy(x) + 8.5, cz(x) + 10] as V3, look: [x + 18, cy(x + 18) + 3.0, cz(x + 18)] as V3, fov: 50, roll: 2 * Math.sin(t * 0.8) }; };
/** os jinetes vêm de frente: a câmera recua diante deles */
const charge = (t: number) => { const z = northZ(t); return { pos: [-7.6, 1.9, z + 9.8] as V3, look: [-9.8, 1.7, z - 4] as V3, fov: 54, roll: 0 }; };

const SHOTS: Shot[] = [
  { name: "abertura: voo ao lado da muralha (ronda, bandeiras) até o operário na torre", t0: 0, keys: [], fn: fly },
  { name: "a muralha inteira de cima (20 mil km, arroz)", t0: XC.veinte, keys: [
    K(XC.veinte, [-48, 21, 14], [-12, 7, -14], 56, 2), K(T.arroz0, [-30, 20, 12], [8, 8, -14], 56, -1), K(XC.china - 0.02, [-20, 18.5, 10], [16, 8, -14], 56, 0)] },
  { name: "⏪ a muralha volta para dentro da serra", t0: XC.china, keys: [
    K(XC.china, [4, 12, 18], [-6, 8.5, -13], 52, 0), K(C1 - 0.05, [2, 11.5, 21], [-9, 7.5, -13], 52, 0)] },
  { name: "a equipe com as ferramentas (manos, herramientas, cabeza)", t0: C1, keys: [
    K(C1, [9.5, 2.5, 32.5], [3, 1.7, 24.5], 50, 2), K(XC.jinetes - 0.02, [1.5, 2.6, 32], [-4.5, 1.6, 24], 50, 0)] },
  { name: "os jinetes do norte vêm em disparada pela planície", t0: XC.jinetes, keys: [], fn: charge },
  { name: "o canteiro: as duas tábuas caem no lugar", t0: XC.b1, keys: [
    K(XC.b1, [-1.5, 5.2, 27.5], [-11, 1.0, 16.5], 52, 1), K(T.cajon, [-4.5, 4.6, 24.5], [-10.5, 0.9, 16], 50, 0), K(C2 - 0.05, [-5.2, 4.4, 23.4], [-10.5, 0.9, 16], 50, 0)] },
  { name: "de cima: a terra úmida entre as tábuas → chicote para a seção", t0: C2, keys: [
    K(C2, [-10.8, 13, 17.4], [-10.8, 0, 15.8], 56, -2), K(W3, [-10.8, 12.6, 17.6], [-10.8, 0, 15.8], 56, -1),
    K(W3 + 0.55, [-2.6, 2.4, 18.6], [-9.3, 1.0, 16.0], 50, 3), K(XC.suben - 0.02, [-3.2, 2.2, 18.0], [-9.4, 1.0, 16.0], 48, 0)] },
  { name: "de frente: as tábuas sobem, nova carga, golpes", t0: XC.suben, keys: [
    K(XC.suben, [-13.6, 5.6, 22.2], [-10.8, 1.0, 15.9], 50, 1), K(XC.fast - 0.02, [-12.6, 5.9, 21.7], [-10.6, 1.4, 15.9], 50, 0)] },
  { name: "de frente, ao sol: capa tras capa → chuva", t0: XC.fast, keys: [
    K(XC.fast, [-4.5, 4.2, 23.5], [-12.5, 1.6, 16.2], 50, 2), K(C3 - 0.05, [-5.0, 5.2, 24.4], [-13.0, 2.0, 16.2], 50, 0)] },
  { name: "a chuva desmancha a taipa", t0: C3, keys: [
    K(C3, [-31.5, 1.9, 20.8], [-18, 1.2, 16.9], 50, 2), K(XC.b2 - 0.02, [-31, 2.2, 21.4], [-17.5, 1.4, 16.9], 51, 0)] },
  { name: "⏪ Ming: a casca de tijolo sobe", t0: XC.b2, keys: [
    K(XC.b2, [-5, 5.8, 25.5], [-15.5, 1.5, 16], 52, -2), K(T.ming + 1.5, [-6, 6.2, 26.5], [-16, 1.8, 16], 52, 0), K(XC.fuegoH - 0.02, [-6.5, 6.5, 27], [-16, 2, 16], 52, 0)] },
  { name: "fornos → tijolo → tijolo ruim → o muro cai", t0: XC.fuegoH, keys: [
    K(XC.fuegoH, [12, 5, 20], [0, 1.5, 11], 54, 1), K(T.hornos, [10, 5.5, 22], [-1, 2, 10], 54, 0), K(T.ladrillo, [9, 8, 26], [-4, 3, 8], 56, -1),
    K(T.p2, [6, 4, 21], [-0.9, 1.2, 15.6], 50, 0), K(C4 - 0.05, [6, 4, 21], [-0.9, 1.2, 15.6], 50, 0)] },
  { name: "o buraco no muro (de quem é a culpa)", t0: C4, keys: [
    K(C4, [-3, 4.5, 25], [-12, 1.2, 16], 52, 1), K(XC.b3 - 0.02, [-4, 4.5, 26], [-12, 1.5, 16], 52, 0)] },
  { name: "o selo na mesa → chicote", t0: XC.b3, keys: [
    K(XC.b3, [13.6, 3.8, 24.4], [11.5, 1.45, 18.8], 46, 1), K(T.grabado, [13.0, 2.9, 23.2], [11.5, 1.45, 18.8], 44, 0),
    K(T.sello, [11.0, 3.0, 23.4], [11.5, 1.5, 18.8], 46, 1), K(W6, [10.8, 3.1, 23.6], [11.5, 1.5, 18.8], 44, 0),
    K(C5 - 0.42, [10, 3.5, 23], [6, 14, 0], 56, 4), K(C5 - 0.02, [10, 3.5, 23.1], [6, 14, 0], 56, 4)] },
  { name: "o gelo racha as juntas", t0: C5, keys: [
    K(C5, [23.5, 2.2, 20.5], [22, 1.9, 15.4], 46, -2), K(XC.c4 - 0.02, [22.8, 2.8, 21.2], [22, 1.8, 15.4], 48, 0)] },
  { name: "arroz cozido → despejado na cal → mexido", t0: XC.c4, keys: [
    K(XC.c4, [18.4, 3.3, 23.2], [17.1, 1.0, 18.4], 48, 1), K(T.cal - 0.5, [21.0, 3.5, 23.4], [18.6, 0.7, 19.0], 48, 0), K(XC.dura - 0.02, [21.4, 3.2, 22.9], [18.9, 0.5, 19.2], 46, 0)] },
  { name: "as juntas fecham e aguentam água e gelo", t0: XC.dura, keys: [
    K(XC.dura, [21, 3, 21], [21, 1.6, 15.5], 48, 0), K(T.argamasa, [22.2, 2.4, 20.2], [22, 1.9, 15.4], 46, 0), K(XC.p4 - 0.02, [22.4, 2.6, 20.4], [22, 1.9, 15.4], 46, 0)] },
  { name: "um muro tão longo → o mensageiro entra", t0: XC.p4, keys: [
    K(XC.p4, [58, 7, 30], [30, 6, -8], 54, 0), K(T.mensajero, [60, 10, 34], [30, 5, -6], 56, 0), K(C6 - 0.05, [57, 8, 33], [40, 2.5, 10], 54, 0)] },
  { name: "o mensageiro galopa ao lado da muralha (dias)", t0: C6, keys: [], fn: ride(4.5, 3.6, 12, 5.0, 20, 50, 3.5) },
  { name: "torres a la vista: sobem, fumaça, anoitece, fogo", t0: XC.c5, keys: [
    K(XC.c5, [36, 9.5, 20], [24, 9, -12], 52, -1), K(T.humo, [31, 11, 8], [17, 10, -13], 52, 0), K(XC.canon - 0.02, [28, 12.5, 4], [12, 10, -13], 52, 1)] },
  { name: "canhão de noite (quantos inimigos)", t0: XC.canon, keys: [
    K(XC.canon, [14, 14.5, -3.8], [8.4, 12.8, -10.4], 48, 2), K(C7 - 0.05, [12.8, 15, -4.4], [8.0, 12.9, -10.4], 50, 0)] },
  { name: "o aviso salta de torre em torre, mais rápido que o cavalo", t0: C7, keys: [], fn: ride(5, 3.8, 12, 7.5, 22, 58, 5) },
  { name: "torres de señales (amanhece)", t0: XC.senales, keys: [
    K(XC.senales, [27, 15.5, 1.5], [23, 12, -15], 50, 1), K(XC.giro - 0.02, [31, 17.5, 5], [19, 11, -15], 54, 0)] },
  { name: "o giro: o passo de Shanhai e o exército manchu ao norte", t0: XC.giro, keys: [
    K(XC.giro, [84, 22, 16], [60, 2, -24], 54, 0), K(XC.manchues - 0.02, [80, 20, 12], [60, 2, -27], 54, 0)] },
  { name: "os manchus galopam até a muralha (sem romper)", t0: XC.manchues, keys: [
    K(XC.manchues, [58, 3.5, -50], [64, 3.5, -14], 52, 0), K(XC.general - 0.02, [61, 4.6, -36], [64, 4, -11], 52, 0)] },
  { name: "o general sozinho abre a porta → os cavaleiros passam", t0: XC.general, keys: [
    K(XC.general, [69.4, 2.5, -1.4], [65.2, 2.3, -8.0], 50, 0), K(W10, [69.0, 2.6, -1.9], [65.0, 2.4, -8.0], 50, 0),
    K(W10 + 0.55, [72.5, 5.2, 6.5], [64, 4.0, -5], 54, 3), K(REWARD, [73.5, 6.5, 10], [64, 8.6, -6], 56, 0), K(T.end, [74, 7.2, 11.5], [64, 9.2, -6], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 1.6, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TOWER_TOP: V3 = [-24, 11.1, -10.4];
const leads = (t: number): V3 => [crewX(t) - 0.4, 0, 24.4];
const POUR: V3 = [EW.x1 - 2.7, 0, EW.z - 2.3];
const WORKER: [number, WorkerState][] = [
  [0, S(TOWER_TOP, -1.33, "present")],
  [T.veinte, S(TOWER_TOP, -0.8, "point")],
  [T.arroz0, S(TOWER_TOP, -1.33, "cheer")],
  [XC.china, S([-2, 0, 26], -0.6, "alarm")],
  [C1, S(leads(C1), -PI / 2 + 0.45, "walk", { follow: leads })],
  [T.solo, S(leads(T.solo), 0.15, "present", { follow: leads })],
  [T.cabeza, S(leads(T.cabeza), 0.15, "think", { follow: leads })],
  [XC.jinetes, S([-2.5, 0, 22], -0.4, "alarm")],
  [XC.b1, S(POUR, 0.4, "cheer")],
  [T.cajon, S(POUR, 0.2, "point")],
  [C2, S(POUR, 0, "pour")],
  [T.tierra + 0.9, S(POUR, 0.2, "point")],
  [T.repiten - 0.35, S(POUR, 0, "pour")],
  [XC.fast, S([-4.5, 0, 11.5], 2.6, "cheer")],
  [C3, S([-24.5, 0, 22.8], 0.2, "alarm")],
  [XC.b2, S([-17.5, 0, 19.0], 0.6, "cheer")],
  [T.ming, S([-17.5, 0, 19.0], 1.0, "point")],
  [XC.fuegoH, S([6.5, 0, 12], 0.9, "present")],
  [T.ladrillo, S([6.5, 0, 12], 0.7, "cheer")],
  [T.p2, S([3, 0, 17], 0.2, "think")],
  [T.cae, S([-9, 0, 19.5], 0.4, "alarm")],
  [XC.b3, S([9.4, 0, 20.4], 0.9, "present")],
  [T.grabado, S([9.4, 0, 20.4], 0.9, "point")],
  [T.sello, S([9.4, 0, 20.4], 0.6, "cheer")],
  [C5, S([25.8, 0, 16.8], -0.6, "alarm")],
  [T.b4, S([25.8, 0, 16.8], -0.6, "cheer")],
  [XC.c4, S([17.6, 0, 16.9], 0.5, "present")],
  [T.arroz, S([17.6, 0, 16.9], 0.5, "pour")],
  [T.cal - 0.65, S([18.9, 0, 17.75], 0, "pour")],
  [T.cal + 0.6, S([18.9, 0, 17.75], 0, "pull")],
  [XC.dura, S([20.0, 0, 17.6], 0.6, "point")],
  [T.argamasa, S([20.0, 0, 17.6], 0.4, "cheer")],
  [T.p4, S([20.2, 0, 17.4], 0.4, "think")],
  [C6, S([7.0, 12.1, -10.1], 0.8, "present")],
  [T.canon, S([7.0, 12.1, -10.1], 0.8, "point")],
  [T.enemigos + 0.6, S([7.0, 12.1, -10.1], 0.8, "cheer")],
  [C7, S([0, -60, 0], 0, "idle", { scale: 0 })],
];

/** sol e lua passando no alto enquanto o mensageiro galopa: cada meia volta é meio dia */
const DayArc: React.FC<{ t: number }> = ({ t }) => {
  const a = T.mensajero, b = T.c5 - 0.1, k = win(t, a, b, 0.2); if (k <= 0) return null;
  const ph = (t - a) / 0.55, half = Math.floor(ph), u = ph - half, sun = half % 2 === 0, ang = Math.PI * (1 - u);
  const x = 180 + 140 * Math.cos(ang), y = 170 - 135 * Math.sin(ang);
  return (
    <div style={{ position: "absolute", left: 360, width: 360, top: 238, opacity: k, transform: `scale(${pop(t, a, 0.3)})` }}>
      <svg viewBox="0 0 360 190" width="360" height="190">
        <path d="M30 175 A150 150 0 0 1 330 175 Z" fill={sun ? "#3a8ee0cc" : "#1a2a5acc"} stroke="#14202b" strokeWidth="6" />
        <path d="M40 170 A140 135 0 0 1 320 170" fill="none" stroke="#ffffff88" strokeWidth="4" strokeDasharray="10 10" />
        {sun ? <g transform={`translate(${x} ${y})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x="-4" y="-34" width="8" height="14" rx="4" fill="#ffd400" stroke="#3a2300" strokeWidth="2" transform={`rotate(${i * 45 + u * 90})`} />)}<circle r="20" fill="#ffd400" stroke="#3a2300" strokeWidth="4" /></g>
          : <g transform={`translate(${x} ${y})`}><circle r="20" fill="#f4f1dc" stroke="#14202b" strokeWidth="4" /><circle cx="9" cy="-6" r="17" fill="#1a2a5a" /></g>}
      </svg>
    </div>
  );
};

const hud: HudData = {
  pills: [
    { a: T.luna, b: T.veinte - 0.1, label: "DESDE LA LUNA", value: () => "NO SE VE", y: 440, tone: "red" },
    { a: T.veinte, b: T.arroz0 - 0.1, label: "TODOS LOS TRAMOS", value: () => "+20.000 KM", y: 440, tone: "gold" },
    { a: T.arroz0, b: T.china - 0.15, label: "PEGAMENTO", value: () => "ARROZ", y: 440, tone: "green" },
    { a: T.china, b: T.nohay - 0.1, label: "HACE", value: () => "+2000 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.jinetes - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.llanura, b: T.b1 - 0.1, label: "PIEDRA", value: () => "0", y: 440, tone: "red" },
    { a: T.tierra, b: FAST0 + 1.65, label: "CAPAS", value: (t) => String(capas(t)), y: 440 },
    { a: T.siglo, b: T.b2 - 0.1, label: "MURO", value: () => "SE DESHACE", y: 440, tone: "red" },
    { a: T.hornos, b: T.ladrillo, label: "HORNOS", value: () => "JUNTO A LA OBRA", y: 440, tone: "gold" },
    { a: T.culpa, b: T.b3 - 0.1, label: "CULPABLE", value: () => "?", y: 440, tone: "red" },
    { a: T.grabado, b: T.sello + 0.6, label: "SELLO", value: () => "AÑO + UNIDAD", y: 440, tone: "green" },
    { a: T.hielo, b: T.b4 - 0.05, label: "HIELO", value: () => "GRIETAS", y: 440, tone: "red" },
    { a: T.cal, b: T.argamasa, label: "ARROZ + CAL", value: () => "MÁS DURA", y: 440, tone: "green" },
    { a: T.mensajero, b: T.c5 - 0.1, label: "MENSAJERO", value: (t) => `DÍA ${Math.min(4, 1 + Math.floor((t - T.mensajero) / 1.1))}`, y: 440, tone: "red" },
    { a: T.canon, b: T.senales, label: "CAÑONAZOS", value: (t) => String(Math.min(3, Math.max(1, 1 + Math.floor((t - T.canon - 0.25) / 0.5)))), y: 440, tone: "gold" },
    { a: T.mil, b: T.sin - 0.1, label: "AÑO", value: () => "1644", y: 440 },
    { a: T.sin, b: T.general - 0.1, label: "MURALLA", value: () => "INTACTA", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.apisonada, text: "TIERRA APISONADA" }, { a: T.ladrillo, text: "LADRILLO" }, { a: T.sello, text: "SELLO" },
    { a: T.argamasa, text: "ARGAMASA DE ARROZ" }, { a: T.senales, text: "TORRES DE SEÑALES" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.china, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.llanura, T.b1 - 0.1], [T.culpa, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN MÁQUINAS"], [T.b4, T.c4, "SIN QUÍMICA"], [T.b5, T.c5, "SIN TELÉFONO"]],
  reward: { a: REWARD, len: T.end - REWARD, top: "SIN ROMPERLA", big: () => "+20.000 KM", sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {win(t, T.luna + 0.2, T.veinte - 0.1, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: win(t, T.luna + 0.2, T.veinte - 0.1, 0.2), transform: `scale(${pop(t, T.luna + 0.2, 0.3)})` }}>
          <svg viewBox="0 0 120 120" width="260" height="260">
            <circle cx="60" cy="60" r="44" fill="#f2f0e6" stroke="#2a2a2a" strokeWidth="5" /><circle cx="44" cy="48" r="8" fill="#d6d2c4" /><circle cx="72" cy="74" r="11" fill="#d6d2c4" /><circle cx="76" cy="40" r="5" fill="#d6d2c4" />
            <path d="M18 18 L102 102 M102 18 L18 102" stroke="#14202b" strokeWidth="16" strokeLinecap="round" /><path d="M18 18 L102 102 M102 18 L18 102" stroke="#ff2d2d" strokeWidth="9" strokeLinecap="round" />
          </svg>
        </div>) : null}
      {win(t, T.arroz0, T.china - 0.15, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 660, display: "flex", flexDirection: "column", alignItems: "center", opacity: win(t, T.arroz0, T.china - 0.15, 0.2), transform: `scale(${pop(t, T.arroz0, 0.3)})` }}>
          <svg viewBox="0 0 120 90" width="250" height="190">
            <ellipse cx="60" cy="38" rx="40" ry="16" fill="#fbfaf4" stroke="#2a2a2a" strokeWidth="4" />{[30, 45, 60, 75, 90, 52, 68].map((x, i) => <ellipse key={i} cx={x} cy={i > 4 ? 26 : 34} rx="5" ry="3" fill="#ffffff" stroke="#c9c4b4" strokeWidth="1.5" />)}
            <path d="M18 40 Q60 100 102 40 Z" fill="#2f5d8a" stroke="#2a2a2a" strokeWidth="4" /><path d="M30 52 Q60 70 90 52" stroke="#f2c14e" strokeWidth="4" fill="none" />
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 60, color: "#fff", ...stroke(10) }}>+ CAL</span>
        </div>) : null}
      <DayArc t={t} />
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.ming, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef2ea", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#8aa84a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.38 * nightK(t),
};
