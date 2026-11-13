// E6 — Gran Muralla (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// v3 (crítico 13/11): cortes duros a mais (XC) além dos 7 da régua; taipa de perto; mensageiro; torres com noite; general sozinho.
// v4 (crítico de ritmo 13/11): assentar tijolo de perto; forno em 3 planos (barro → tijolo, água, voando para as pilhas);
// carimbo que bate + tijolo rachado que mostra a unidade; vigia no muro; aproximação no giro; inimigos no painel; bordão e
// recompensa sem cobrir as placas.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { ease, prog } from "../../toy/kit";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { FAST0, HIT, REWARD, SFX, T, XC } from "./cues";
import { EW, MSG_Z, STAMP, World, capas, crestAt, crewX, msgX, nightK, northZ, peelBody } from "./world";
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
  { name: "⏪ a muralha volta para dentro da serra → desce aos operários que chegam (sem motores)", t0: XC.china, keys: [
    K(XC.china, [4, 12, 18], [-6, 8.5, -13], 52, 0), K(T.china + 1.0, [3.6, 11.5, 19], [-7, 7.5, -13], 52, 0),
    K(T.nohay - 0.05, [3.4, 9.2, 17.2], [1.5, 0.8, 10.2], 52, 0), K(C1 - 0.05, [3.0, 8.6, 16.6], [1.3, 0.6, 10.3], 50, 0)] },
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
  { name: "⏪ Ming: a casca de tijolo sobe em 7 fiadas que batem", t0: XC.b2, keys: [
    K(XC.b2, [-5, 5.8, 25.5], [-15.5, 1.5, 16], 52, -2), K(XC.tramos - 0.02, [-5.8, 5.4, 24.6], [-15.0, 1.7, 16], 50, 0)] },
  { name: "de perto: o operário assenta a fiada (pega, põe, bate)", t0: XC.tramos, keys: [
    K(XC.tramos, [-6.0, 5.0, 21.2], [-8.9, 3.25, 16.4], 46, 1), K(XC.fuegoH - 0.02, [-7.2, 4.9, 20.9], [-10.1, 3.2, 16.4], 46, 0)] },
  { name: "boca do forno: a pá enfia o barro, o fogo sobe (punch-in), sai tijolo; água no barro cru e no cozido", t0: XC.fuegoH, keys: [
    K(XC.fuegoH, [4.75, 1.55, 15.8], [4.05, 0.55, 12.0], 46, 0), K(T.fuegoH + 0.5, [4.6, 1.45, 15.2], [4.0, 0.6, 12.0], 44, 0),
    K(T.fuegoH + 0.85, [4.15, 1.25, 14.35], [3.95, 0.75, 11.9], 34, 0), K(T.duro, [4.7, 1.8, 15.9], [4.3, 0.4, 12.9], 44, 0),
    K(T.agua, [4.3, 2.5, 17.4], [4.08, 0.3, 13.2], 44, 0), K(XC.hornos - 0.02, [4.35, 2.55, 17.5], [4.08, 0.3, 13.2], 44, 0)] },
  { name: "os fornos junto da obra: tijolos voando para as pilhas, carregadores levando à muralha", t0: XC.hornos, keys: [
    K(XC.hornos, [-15.5, 6.5, 23.5], [1, 0.8, 12], 50, -1), K(XC.lejos - 0.02, [-14.6, 6.2, 22.8], [1.5, 0.8, 12.2], 50, 0)] },
  { name: "a pilha da frente: os últimos tijolos caem (este é o tijolo) → um racha", t0: XC.lejos, keys: [
    K(XC.lejos, [2.4, 2.3, 20.2], [-0.7, 1.0, 15.6], 46, 1), K(T.p2, [1.3, 0.6, 18.5], [-0.85, 0.8, 15.6], 42, 0), K(C4 - 0.05, [1.1, 0.55, 18.2], [-0.9, 0.85, 15.6], 40, 0)] },
  { name: "o buraco no muro (de quem é a culpa)", t0: C4, keys: [
    K(C4, [-5.5, 9.0, 25.0], [-12.5, 0.8, 17.0], 50, 1), K(XC.b3 - 0.02, [-6.2, 8.6, 25.6], [-12.5, 1.0, 17.0], 50, 0)] },
  { name: "o carimbo sobe e BATE; anel no ano e na unidade; a pilha dos carimbados", t0: XC.b3, keys: [
    K(XC.b3, [STAMP.x + 0.5, 5.4, 23.2], [STAMP.x + 0.2, 1.9, 18.3], 48, 1), K(HIT - 0.15, [STAMP.x + 0.3, 5.0, 22.6], [STAMP.x, 2.0, 18.3], 46, 0),
    K(HIT + 0.06, [STAMP.x + 0.3, 4.8, 22.5], [STAMP.x, 1.8, 18.3], 46, 0), K(T.anio, [STAMP.x - 0.05, 4.2, 20.4], [STAMP.x - 0.05, 1.55, 18.35], 38, 0),
    K(T.hizo, [STAMP.x + 0.05, 4.2, 20.5], [STAMP.x + 0.05, 1.55, 18.35], 38, 0), K(XC.falla - 0.02, [STAMP.x + 0.9, 4.5, 21.2], [STAMP.x + 0.9, 1.7, 18.3], 42, 0)] },
  { name: "si uno falla: o muro quebrado → o tijolo rachado vira → a unidade gravada → chicote", t0: XC.falla, keys: [
    K(XC.falla, [-8.8, 2.9, 24.6], [-12.6, 0.9, 18.9], 50, 1), K(T.sabe, [-10.6, 2.6, 24.0], [-12.15, 0.35, 21.1], 44, 0),
    K(T.responde + 0.1, [-11.6, 2.5, 23.2], [-11.85, 0.35, 21.1], 38, 0), K(W6, [-11.6, 2.55, 23.25], [-11.85, 0.4, 21.1], 38, 0),
    K(C5 - 0.42, [-11.3, 2.9, 23.6], [-6, 14, 6], 56, 4), K(C5 - 0.02, [-11.3, 2.9, 23.65], [-6, 14, 6], 56, 4)] },
  { name: "o gelo racha as juntas", t0: C5, keys: [
    K(C5, [23.5, 2.2, 20.5], [22, 1.9, 15.4], 46, -2), K(XC.c4 - 0.02, [22.8, 2.8, 21.2], [22, 1.8, 15.4], 48, 0)] },
  { name: "arroz cozido → despejado na cal → mexido", t0: XC.c4, keys: [
    K(XC.c4, [18.4, 3.3, 23.2], [17.1, 1.0, 18.4], 48, 1), K(T.cal - 0.5, [21.0, 3.5, 23.4], [18.6, 0.7, 19.0], 48, 0), K(XC.dura - 0.02, [21.4, 3.2, 22.9], [18.9, 0.5, 19.2], 46, 0)] },
  { name: "as juntas fecham e aguentam água e gelo", t0: XC.dura, keys: [
    K(XC.dura, [21, 3, 21], [21, 1.6, 15.5], 48, 0), K(T.argamasa, [22.2, 2.4, 20.2], [22, 1.9, 15.4], 46, 0), K(XC.p4 - 0.02, [22.4, 2.6, 20.4], [22, 1.9, 15.4], 46, 0)] },
  { name: "um muro tão longo: o vigia no adarve olha a serra, vira, acena → chicote para o mensageiro na planície", t0: XC.p4, keys: [
    K(XC.p4, [60.0, 6.4, -8.6], [40, 7.2, -12.2], 48, 1), K(T.entero - 0.05, [60.2, 7.4, -8.0], [40, 7.6, -12.6], 52, 0),
    K(T.mensajero + 0.25, [62, 6.6, 3.5], [55, 1.2, 20.5], 52, 2), K(C6 - 0.05, [60, 6.0, 6.5], [46, 1.2, 20.5], 50, 0)] },
  { name: "o mensageiro galopa ao lado da muralha (dias)", t0: C6, keys: [], fn: ride(4.5, 3.6, 12, 5.0, 20, 50, 3.5) },
  { name: "torres a la vista: sobem, fumaça, anoitece, fogo", t0: XC.c5, keys: [
    K(XC.c5, [36, 9.5, 20], [24, 9, -12], 52, -1), K(T.humo, [31, 11, 8], [17, 10, -13], 52, 0), K(XC.canon - 0.02, [28, 12.5, 4], [12, 10, -13], 52, 1)] },
  { name: "canhão de noite (quantos inimigos)", t0: XC.canon, keys: [
    K(XC.canon, [14, 14.5, -3.8], [8.4, 12.8, -10.4], 48, 2), K(C7 - 0.05, [12.8, 15, -4.4], [8.0, 12.9, -10.4], 50, 0)] },
  { name: "o aviso salta de torre em torre, mais rápido que o cavalo", t0: C7, keys: [], fn: ride(5, 3.8, 12, 7.5, 22, 58, 5) },
  { name: "torres de señales (amanhece)", t0: XC.senales, keys: [
    K(XC.senales, [27, 15.5, 1.5], [23, 12, -15], 50, 1), K(XC.giro - 0.02, [31, 17.5, 5], [19, 11, -15], 54, 0)] },
  { name: "o giro: o passo de Shanhai e o exército manchu ao norte", t0: XC.giro, keys: [
    K(XC.giro, [88, 26, 24], [61, 2, -28], 54, 0), K(XC.manchues - 0.02, [74, 12.5, 4.5], [62.5, 2, -32], 50, 0)] },
  { name: "os manchus galopam até a muralha (sem romper)", t0: XC.manchues, keys: [
    K(XC.manchues, [58, 3.5, -50], [64, 3.5, -14], 52, 0), K(XC.general - 0.02, [61, 4.6, -36], [64, 4, -11], 52, 0)] },
  { name: "o general sozinho abre a porta → os cavaleiros passam", t0: XC.general, keys: [
    K(XC.general, [69.4, 2.2, -1.4], [65.2, 1.95, -8.0], 44, 0), K(W10, [69.0, 2.25, -1.9], [65.0, 2.0, -8.0], 44, 0),
    K(W10 + 0.55, [73.5, 6.0, 9.0], [64, 5.2, -6], 56, 3), K(REWARD, [73.5, 6.5, 10], [64, 8.6, -6], 56, 0), K(T.end, [74, 7.2, 11.5], [64, 9.2, -6], 56, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 1.6, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TOWER_TOP: V3 = [-24, 11.1, -10.4];
const leads = (t: number): V3 => [crewX(t) - 0.4, 0, 24.4];
const POUR: V3 = [EW.x1 - 2.7, 0, EW.z - 2.3];
const BEHIND: V3 = [STAMP.x, 0, STAMP.z - 1.55]; // atrás da mesa do carimbo, de frente para a câmera
const HIDE = S([-100, -60, 0], 0, "idle", { scale: 0 });
const WORKER: [number, WorkerState][] = [
  [0, S(TOWER_TOP, -1.33, "present")],
  [T.veinte, S(TOWER_TOP, -0.8, "point")],
  [T.arroz0, S(TOWER_TOP, -1.33, "cheer")],
  [XC.china, S([0.7, 0, 10.0], 0.35, "present")],
  [T.nohay, S([0.7, 0, 10.0], 0.35, "think")],
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
  [XC.tramos - 0.02, HIDE], // o assentador do mundo (world.tsx, Bricklayer) faz o papel dele de perto
  [XC.fuegoH, S(peelBody(XC.fuegoH), -2.36, "pull", { follow: peelBody })],
  [XC.hornos, S([5.6, 0, 12.7], -1.1, "chisel")],
  [XC.lejos, S([-2.2, 0, 13.2], 0.3, "present")],
  [T.ladrillo, S([-2.2, 0, 13.2], 0.3, "cheer")],
  [T.p2, S([-2.2, 0, 13.2], 0.3, "think")],
  [T.cae, S([-9, 0, 19.5], 0.4, "alarm")],
  [XC.b3, S(BEHIND, 0, "cheer", { scale: 1.05 })],
  [HIT - 0.15, S(BEHIND, 0, "pour", { scale: 1.05 })],
  [HIT + 0.3, S(BEHIND, 0, "present", { scale: 1.05 })],
  [T.unidad, S(BEHIND, 0.3, "point", { scale: 1.05 })],
  [XC.falla, S([-15.4, 0, 19.6], 1.1, "alarm", { scale: 1.1 })],
  [T.responde, S([-15.4, 0, 19.6], 1.1, "point", { scale: 1.1 })],
  [C5, S([25.8, 0, 16.8], -0.6, "alarm")],
  [T.b4, S([25.8, 0, 16.8], -0.6, "cheer")],
  [XC.c4, S([16.4, 0, 16.2], 0.5, "present", { scale: 1.05 })],
  [T.arroz, S([16.4, 0, 16.2], 0.5, "pour", { scale: 1.05 })],
  [T.cal - 0.65, S([19.7, 0, 17.3], -0.2, "pour", { scale: 1.05 })],
  [T.cal + 0.6, S([19.7, 0, 17.3], -0.2, "pull", { scale: 1.05 })],
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

/** o bordão: placa cinza riscada e «¡CON INGENIO!» ACIMA dela (no motor o amarelo cobria a placa; crítico de ritmo 13/11) */
const STAMPS: [number, number, string][] = [[T.b1, T.c1, "SIN MÁQUINAS"], [T.b4, T.c4, "SIN QUÍMICA"], [T.b5, T.c5, "SIN TELÉFONO"]];
const Ingenio: React.FC<{ t: number; a: number; b: number; label: string }> = ({ t, a, b, label }) => {
  const k = win(t, a, b + 1.5, 0.15); if (k <= 0) return null;
  const s1 = pop(t, a, 0.25), strike = ease(t, a + 0.3, a + 0.55), s2 = pop(t, b, 0.3), shake = t > b ? Math.sin((t - b) * 30) * 6 * (1 - prog(t, b, b + 0.5)) : 0;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 560, height: 300, opacity: k }}>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 0, display: "flex", justifyContent: "center", transform: `rotate(-4deg) scale(${s1 * (t > b ? 0.9 : 1)})` }}>
        <div style={{ position: "relative", padding: "6px 30px 10px", border: "8px solid #5b6670", borderRadius: 18, background: "#d9dee2e6" }}>
          <span style={{ fontFamily: FONT, fontSize: label.length > 13 ? 58 : 70, color: "#5b6670", letterSpacing: 3 }}>{label}</span>
          <div style={{ position: "absolute", left: -12, top: "48%", height: 16, width: `${104 * strike}%`, background: "#e0262b", borderRadius: 8, transform: "rotate(-8deg)", transformOrigin: "left center" }} />
        </div>
      </div>
      {t >= b ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: -168, display: "flex", justifyContent: "center", transform: `rotate(${3 + shake * 0.2}deg) scale(${s2})` }}>
          <span style={{ fontFamily: FONT, fontSize: 132, color: "#ffd400", lineHeight: 1, ...stroke(16, "#3a2300") }}>¡CON INGENIO!</span>
        </div>) : null}
    </div>
  );
};
/** «cuántos enemigos vienen»: um cavaleiro inimigo aparece por tiro de canhão, acima do contador */
const SHOTS3 = [0, 1, 2].map((k) => T.canon + 0.25 + k * 0.5);
const Enemies: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, SHOTS3[0], C7 - 0.12, 0.15); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", justifyContent: "center", gap: 30, opacity: k }}>
      {SHOTS3.map((a, i) => (
        <div key={i} style={{ width: 190, height: 152, transform: `scale(${t < a ? 0 : pop(t, a, 0.3)}) rotate(${t > a ? Math.sin((t - a) * 9 + i) * 4 : 0}deg)` }}>
          <svg viewBox="0 0 120 100" width="190" height="152">
            <g stroke="#ff4d4d" strokeWidth="5" strokeLinejoin="round" fill="#1c2a44">
              <path d="M22 50 Q20 38 40 38 L80 38 Q92 36 96 26 L104 18 L112 24 L104 40 Q98 52 92 56 L92 84 L84 84 L82 62 L48 62 L44 84 L36 84 L34 62 Q24 62 22 50 Z" />
              <path d="M22 46 Q10 48 8 62 Q16 56 24 56 Z" />
              <path d="M52 40 L54 18 Q60 10 66 18 L68 40 Z" />
              <path d="M52 16 L60 2 L68 16 Z" />
            </g>
          </svg>
        </div>))}
    </div>
  );
};
/** a recompensa final (cópia do motor), com o confete saindo para cima e para os lados, sem passar sobre «SIN UN SOLO MOTOR» */
const Reward: React.FC<{ t: number }> = ({ t }) => {
  const a = REWARD, k = win(t, a, T.end, 0.25); if (k <= 0) return null;
  const cols = ["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff"];
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${pop(t, a, 0.45)})` }}>
      {Array.from({ length: 14 }, (_, i) => { const u = prog(t, a + 0.04 * i, a + 1.4), ang = Math.PI * (1.08 + (i / 13) * 0.84), r = 300 + (i % 3) * 70;
        return <span key={i} style={{ position: "absolute", top: 120 + Math.sin(ang) * 260 * u, left: 515 + Math.cos(ang) * r * u * 1.5, fontFamily: FONT, fontSize: 54, color: cols[i % 5], opacity: 1 - u * 0.85, ...stroke(5, "#1c1208") }}>★</span>; })}
      <span style={{ fontFamily: FONT, fontSize: 56, color: "#fff", ...stroke(10) }}>SIN ROMPERLA</span>
      <span style={{ fontFamily: FONT, fontSize: 150, color: "#5cff7a", lineHeight: 1, ...stroke(16, "#05381a") }}>+20.000 KM</span>
      <span style={{ fontFamily: FONT, fontSize: 72, color: "#ffd400", lineHeight: 1.1, textAlign: "center", ...stroke(12, "#3a2300") }}>SIN UN SOLO MOTOR</span>
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
    { a: T.grabado, b: XC.falla - 0.05, label: "SELLO", value: (t) => (t < T.anio + 0.12 ? "GRABADO" : t < T.unidad + 0.12 ? "AÑO" : "AÑO + UNIDAD"), y: 440, tone: "green" },
    { a: T.sabe, b: T.sello - 0.05, label: "RESPONDE", value: () => "SU UNIDAD", y: 440, tone: "red" },
    { a: T.hielo, b: T.b4 - 0.05, label: "HIELO", value: () => "GRIETAS", y: 440, tone: "red" },
    { a: T.cal, b: T.argamasa, label: "ARROZ + CAL", value: () => "MÁS DURA", y: 440, tone: "green" },
    { a: T.vigilar, b: T.mensajero - 0.1, label: "VIGILAR", value: () => "20.000 KM", y: 440, tone: "red" },
    { a: T.mensajero, b: T.c5 - 0.1, label: "MENSAJERO", value: (t) => `DÍA ${Math.min(4, 1 + Math.floor((t - T.mensajero) / 1.1))}`, y: 440, tone: "red" },
    { a: T.canon, b: C7 - 0.12, label: "CAÑONAZOS", value: (t) => String(Math.min(3, Math.max(1, 1 + Math.floor((t - T.canon - 0.25) / 0.5)))), y: 440, tone: "gold" },
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
  // v4: o bordão e a recompensa vêm no Extra (o «¡CON INGENIO!» acima da placa; confete que não passa sobre o texto)
  stamps: [],
  reward: { a: 9999, len: 1, top: "", big: () => "", sub: "" },
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
      {STAMPS.map(([a, b, l]) => <Ingenio key={a} t={t} a={a} b={b} label={l} />)}
      <Enemies t={t} />
      <Reward t={t} />
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.ming, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef2ea", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#8aa84a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.38 * nightK(t),
};
