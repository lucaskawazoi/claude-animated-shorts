// E8 — Catedral gótica / Notre-Dame (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// Pré-crítica 13/11: câmera de perto em cada verbo (a 7–14 unidades do mecanismo), operário fora da linha da câmera,
// painel sem contador que pisca números intermediários, mesa como selo, recompensa em cima e a ação embaixo.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, ease } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const PI = Math.PI;

const SHOTS: Shot[] = [
  { name: "Notre-Dame pronta; o fantasma do primeiro pedreiro põe a pedra e some; vitrais → ⏪ ilha vazia", t0: 0, keys: [
    K(0, [-40, 14, 32], [-16, 8, 4], 55, 2), K(T.quienes, [-24.5, 3.4, 13.8], [-18.4, 2.0, 7.4], 52, 0), K(T.nunca + 0.2, [-24.5, 4.0, 14.6], [-18, 3.4, 7], 54, 0), K(T.nunca + 1.1, [-24.2, 4.6, 14.4], [-17.6, 4.4, 6.8], 54, 0),
    K(T.vitrales0, [-26, 11, 7.5], [-14.4, 11.5, 0], 50, 0), K(T.paris - 0.15, [-25.2, 11.2, 7.0], [-14.4, 11.4, 0], 50, 0),
    K(T.paris + 0.4, [-18, 14, 28], [-26, 2, 6], 58, 0), K(C1 - 0.05, [-22, 34, 22], [-26, 0, 6], 58, 1)] },
  { name: "piedra, madera, hierro, músculo → o sonho alto e cheio de luz → a igreja românica abre as paredes, muros grossos", t0: C1, keys: [
    K(C1, [-44.5, 2.8, 10.9], [-36, 1.4, 10.9], 56, 2), K(T.musculo + 0.2, [-44, 3.0, 11.0], [-36, 1.6, 11.1], 56, 0),
    K(T.altisima, [-45, 4.5, 11.0], [-26, 9.5, 11], 56, 0), K(T.luz + 0.3, [-45.5, 5, 11], [-24, 11, 11], 56, 0),
    K(T.p1 + 0.5, [-47, 4.9, 11.0], [-30, 3.4, 11], 58, 0), K(T.fuera1 + 0.2, [-46.5, 4.9, 11.2], [-30, 3.6, 11], 58, 0),
    K(T.gruesos, [-40, 5.5, 17], [-30, 3, 11], 54, 0), K(C2 - 0.05, [-39, 5.8, 17.8], [-30, 3, 11], 54, 0)] },
  { name: "janelas pequenas de perto → arco redondo se abre sob o peso → ogival manda o peso aos pilares → os dois lado a lado", t0: C2, keys: [
    K(C2, [-25.2, 1.3, 18.6], [-30.4, 3.8, 13.6], 56, -2), K(T.b1 - 0.1, [-25.4, 1.4, 18.4], [-30.4, 3.8, 13.6], 56, 0),
    K(W3, [-29.5, 6.5, 12], [-33, 5.8, -7], 56, 0), K(T.pesoR, [-33.0, 6.2, 8.5], [-33.0, 6.4, -7], 54, 0), K(T.abra + 0.3, [-33.1, 6.0, 8.2], [-33.0, 6.2, -7], 54, 0),
    K(T.arco, [-30, 6.6, 10], [-30, 5.4, -7], 56, 0), K(T.manda0, [-26, 6.4, 3.5], [-27, 5.6, -7], 52, 0), K(T.pilaresA + 0.2, [-26.2, 4.6, 3.3], [-27, 3.6, -7], 52, 0),
    K(T.menos - 0.1, [-30.3, 6.6, 15.5], [-30.3, 5.0, -7], 60, 0), K(T.lados + 0.15, [-30.2, 6.6, 15.2], [-30.2, 5.0, -7], 60, 0), K(T.ojival + 0.35, [-26.5, 6.2, 8], [-27.2, 5.0, -7], 54, 0), K(C3 - 0.05, [-26.6, 6.0, 7.2], [-27, 5.0, -7], 54, 0)] },
  { name: "um tramo: a laje racha o muro todo → nervuras se cruzam → o peso desce por 4 pilares (mesa) → empurra para fora", t0: C3, keys: [
    K(C3, [-37.5, 9.0, -17.5], [-30, 5.2, -7], 56, 2), K(T.pesando, [-37, 9.4, -17], [-30, 6, -7], 56, 0),
    K(T.toneladas + 0.2, [-35.5, 7.5, -14.8], [-30, 5, -7], 54, 0), K(T.muro + 0.3, [-36.5, 6.5, -15.5], [-30, 4.2, -7], 56, 0),
    K(T.b2 + 0.5, [-37, 12.5, -16.5], [-30, 6.2, -7], 56, 0), K(T.cruzan + 0.4, [-36, 13.2, -15], [-30, 6.6, -7], 54, 0),
    K(T.cae, [-37, 9.5, -16.2], [-30, 5.0, -7], 56, 0), K(T.pilares + 0.3, [-38.5, 6.0, -16.5], [-30, 5.0, -7], 56, 0),
    K(T.patas, [-39, 6.0, -16.5], [-30, 6.0, -7], 56, 0), K(T.cruceria, [-37.5, 8.5, -16.8], [-30, 5.2, -7], 54, 0),
    K(T.p3 + 0.2, [-31, 8.6, -17.5], [-30, 6.2, -7], 54, 0), K(C4 - 0.05, [-31, 8.7, -17.2], [-30, 6.2, -7], 54, 0)] },
  { name: "nave em seção pelo oeste: a parede tomba para fora → pilar e braço de pedra → o empurrão desce até o chão", t0: C4, keys: [
    K(C4, [-27.5, 10.5, 6.8], [-12, 10, 6.2], 56, 2), K(T.empujando + 0.3, [-26.5, 10.5, 7.2], [-12, 10, 6.4], 56, 0),
    K(T.brazos, [-24, 9.5, 15], [-12, 8.2, 7.5], 56, 0), K(T.lejos, [-23.5, 10.5, 15.5], [-12, 9, 7.2], 56, 0),
    K(T.llevan + 0.2, [-23.5, 8.5, 16.5], [-12, 7.2, 8.0], 56, 0), K(W6 + 0.15, [-22.8, 6.2, 16.2], [-12, 4.5, 8.8], 56, 0),
    K(C5 - 0.42, [-22.8, 6.2, 16.3], [10, 2, 40], 58, 4), K(C5 - 0.02, [-22.8, 6.2, 16.4], [10, 2, 40], 58, 4)] },
  { name: "debaixo dos arcobotantes → a pedra enorme no chão → 30 m → grua: homens dentro, eixo, corda, força → pedra no alto", t0: C5, keys: [
    K(C5, [-27, 4.0, 22], [-8, 8, 8], 56, -2), K(C5 + 0.7, [-26.5, 4.0, 21.5], [-8.5, 7.8, 8], 56, 0),
    K(T.enormes - 0.05, [-22.5, 3.2, 14.5], [-15.5, 1.6, 5.7], 54, 0), K(T.treinta - 0.3, [-22.3, 3.4, 14.2], [-15, 2.6, 5.7], 54, 0),
    K(T.treinta + 0.6, [-25, 6.5, 17], [-13.5, 10.5, 5.7], 56, 0), K(T.c4, [-14.5, 16.8, 14], [-10.5, 15.5, 4.5], 54, 0),
    K(T.rueda + 0.5, [-11.2, 15.9, 12.6], [-10.5, 15.6, 4.5], 52, 0), K(T.hombres + 0.1, [-10.9, 15.2, 10.6], [-10.5, 14.6, 4.5], 52, 0),
    K(T.eje + 0.1, [-6.5, 16.8, 9.8], [-10.5, 15.8, 5.6], 50, 0), K(T.cuerda + 0.3, [-6.0, 18.0, 12.5], [-12.5, 16.5, 5.5], 52, 0),
    K(T.grande, [-11.0, 15.9, 13.2], [-10.5, 15.6, 4.5], 54, 0), K(T.eje2 + 0.2, [-10.7, 15.7, 11], [-10.5, 15.7, 4.5], 52, 0),
    K(T.multiplica, [-26, 10.5, 18], [-14, 10.5, 5], 56, 0), K(T.grua, [-24, 17.5, 15], [-13, 15, 5], 54, 0), K(C6 - 0.05, [-23.6, 17.6, 14.8], [-13, 15, 5], 54, 0)] },
  { name: "nave por dentro, escura, olhando o oeste: pilares carregam → a parede se abre → vidro se tinge → chumbo → rosácea", t0: C6, keys: [
    K(C6, [13.4, 3.4, 1.6], [0, 2.8, -0.4], 52, -2), K(T.oscuro + 0.4, [11.6, 3.1, 0.5], [0, 3.4, -0.3], 52, 0),
    K(T.yaNo, [12, 4.2, 0.6], [-4, 8.5, 0], 56, 0), K(T.abrir + 0.2, [9, 4.4, -2.4], [1, 9.4, 4.5], 54, 0), K(T.vidrio + 0.4, [8.5, 4.8, -2.2], [0, 9.6, 4.5], 54, 0),
    K(T.oxidos + 0.3, [7, 5.6, -1.6], [-1, 9.8, 4.2], 52, 0), K(T.plomo + 0.2, [5.5, 6.2, -1.8], [-1, 10, 4.4], 50, 0),
    K(T.roseton, [7.5, 6, -0.6], [-12, 10.8, 0], 52, 0), K(C7 - 0.05, [6.5, 6.2, -0.5], [-12, 10.9, 0], 52, 0)] },
  { name: "rosácea por fora (13 m) → vitrais → 2019: o incêndio → carpinteiros a machado → a armação nova no telhado", t0: C7, keys: [
    K(C7, [-27, 9.0, 8.5], [-13.5, 11, 0], 54, -2), K(T.trece + 0.5, [-26, 9.5, 7.5], [-13.5, 11, 0], 52, 0),
    K(T.vitralesT + 0.2, [-34, 12, 10], [-13.5, 12, 0], 54, 0), K(T.y2019, [-16, 24, 18], [2, 15, 1], 54, 0),
    K(T.incendio + 0.3, [-5, 24, 15], [5, 16, 0], 52, 0), K(T.destruyo + 0.9, [-4, 23.5, 15.5], [5, 15, 0], 52, 0),
    K(T.carpinteros, [1.5, 3.8, 24.5], [-6, 1.6, 16], 54, 0), K(T.labrar, [-0.8, 3.0, 22.5], [-6, 1.5, 16.3], 52, 0), K(T.hacha + 0.2, [-1.2, 2.7, 21.6], [-6, 1.6, 16.5], 50, 0),
    K(T.ochocientos + 0.3, [-0.6, 3.8, 24.2], [-5.6, 1.6, 15.6], 54, 0), K(W10, [-0.4, 3.9, 24.6], [-5.6, 1.7, 15.6], 54, 0), K(W10 + 0.7, [-0.35, 3.95, 24.7], [-5.6, 1.7, 15.6], 54, 0), K(T.end, [0, 4.2, 25.5], [-5.6, 1.8, 15.6], 56, 0)] },
];
// janela 7 (a grua) era 3,8: a deriva de ±3 unidades tirava a roda do quadro nos closes; o movimento agora vem das chaves
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 1.0, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([1.5, 0, 12], 0.2, "present")],
  [T.paris, S([-28, 0, 4], -0.6, "present")],
  [C1, S([-37.6, 0, 12.15], -PI / 2, "present")],
  [T.musculo, S([-37.6, 0, 12.15], -PI / 2, "cheer")],
  [T.quieren, S([-37.6, 0, 12.15], -2.0, "think")],
  [T.p1, S([-33.5, 0, 19.5], -0.9, "alarm")],
  [C2, S([-22.8, 0, -5.4], -0.9, "point")],
  [T.abra, S([-22.8, 0, -5.4], -0.9, "alarm")],
  [T.arco, S([-22.8, 0, -5.4], -0.9, "point")],
  [T.ojival, S([-22.8, 0, -5.4], -0.4, "cheer")],
  [C3, S([-26.9, 0, -9.3], -2.3, "think")],
  [T.p2, S([-26.9, 0, -9.3], -2.3, "alarm")],
  [T.b2, S([-26.9, 0, -9.3], -2.3, "cheer")],
  [T.nervios, S([-26.9, 0, -9.3], -1.4, "point")],
  [T.mesa, S([-26.9, 0, -9.3], -2.3, "present")],
  [T.p3, S([-26.9, 0, -9.3], -2.3, "alarm")],
  [C4, S([-16.8, 0, 3.0], -0.9, "present")],
  [T.brazos, S([-16.8, 0, 3.0], 0.9, "point")],
  [T.arbotantes, S([-16.8, 0, 3.0], 0.9, "cheer")],
  [C5, S([-17.6, 0, 4.4], 1.03, "think", { scale: 1.0 })],
  [T.p4, S([-17.6, 0, 4.4], 1.03, "alarm", { scale: 1.0 })],
  [T.enormes - 0.1, S([-17.6, 0, 4.4], 1.03, "pull", { scale: 1.0 })],
  [T.b4, S([-17.6, 0, 4.4], 0.6, "think", { scale: 1.0 })],
  [T.grua, S([-17.6, 0, 4.4], 0.6, "cheer", { scale: 1.0 })],
  [C6, S([4.4, 0, -0.3], 1.35, "think")],
  [T.b5, S([4.4, 0, -0.3], 1.35, "point")],
  [T.roseton, S([4.4, 0, -0.3], 1.35, "cheer")],
  [C7, S([-19.5, 0, 9.5], -1.0, "present")],
  [T.incendio, S([-11.5, 0, 16.8], 0.4, "alarm")],
  [T.rehacer, S([-11.5, 0, 16.8], 0.6, "point")],
  [T.ochocientos, S([-11.5, 0, 16.8], 0.4, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.05, b: T.quienes - 0.1, label: "OBRA", value: () => "~200 AÑOS", y: 440, tone: "gold" },
    { a: T.nunca, b: T.vitrales0 - 0.2, label: "LA VIERON TERMINADA", value: () => "0", y: 440, tone: "red" },
    { a: T.vitrales0, b: T.paris - 0.15, label: "VITRALES", value: () => "ENORMES", y: 440, tone: "green" },
    { a: T.paris + 0.4, b: T.nohay - 0.1, label: "AÑO", value: () => "1163", y: 440, tone: "gold" },
    { a: T.nohay, b: T.acero0 - 0.05, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.acero0, b: T.compu - 0.05, label: "VIGAS DE ACERO", value: () => "0", y: 440, tone: "red" },
    { a: T.compu, b: T.piedra - 0.1, label: "COMPUTADORAS", value: () => "0", y: 440, tone: "red" },
    { a: T.piedra, b: T.quieren - 0.1, label: "SOLO", value: (t) => (t < T.madera ? "PIEDRA" : t < T.hierro ? "+ MADERA" : t < T.musculo ? "+ HIERRO" : "+ MÚSCULO"), y: 440, tone: "gold" },
    { a: T.altisima, b: T.p1 - 0.1, label: "QUIEREN", value: (t) => (t < T.luz ? "ALTURA" : "+ LUZ"), y: 440, tone: "green" },
    { a: T.gruesos, b: T.pequenas - 0.1, label: "MUROS", value: () => "GRUESOS", y: 440, tone: "red" },
    { a: T.pequenas, b: T.b1 - 0.1, label: "VENTANAS", value: () => "PEQUEÑAS", y: 440, tone: "red" },
    { a: T.abajo, b: T.menos - 0.1, label: "PESO", value: (t) => (t < T.pilaresA ? "HACIA ABAJO" : "A LOS PILARES"), y: 440, tone: "green" },
    { a: T.menos, b: T.ojival, label: "A LOS LADOS", value: () => "MENOS", y: 440, tone: "green" },
    { a: T.toneladas, b: T.b2 - 0.1, label: "BÓVEDA", value: () => "TONELADAS", y: 440, tone: "red" },
    { a: T.pilares, b: T.mesa - 0.05, label: "PILARES", value: () => "POCOS", y: 440, tone: "green" },
    { a: T.empujando, b: T.b3 - 0.1, label: "EMPUJE", value: () => "HACIA FUERA", y: 440, tone: "red" },
    { a: T.llevan, b: T.arbotantes - 0.05, label: "EMPUJE", value: () => "AL SUELO", y: 440, tone: "green" },
    { a: T.treinta, b: T.b4 - 0.1, label: "ALTURA", value: () => "+30 m", y: 440, tone: "red" },
    { a: T.paso, b: T.grande - 0.1, label: "CADA PASO", value: () => "GIRA EL EJE", y: 440, tone: "green" },
    { a: T.grande, b: T.eje2 - 0.05, label: "RUEDA", value: () => "GRANDE", y: 440, tone: "gold" },
    { a: T.eje2, b: T.fuerza - 0.05, label: "EJE", value: () => "DELGADO", y: 440, tone: "gold" },
    { a: T.fuerza, b: T.grua - 0.1, label: "FUERZA", value: () => "MULTIPLICADA", y: 440, tone: "green" },
    { a: T.oscuro, b: T.b5 - 0.1, label: "ADENTRO", value: () => "OSCURO", y: 440, tone: "red" },
    { a: T.vidrio, b: T.roseton - 0.1, label: "VIDRIO", value: (t) => (t < T.plomo - 0.1 ? "+ ÓXIDOS" : "+ PLOMO"), y: 440, tone: "green" },
    { a: T.roseton, b: T.vitralesT - 0.05, label: "ROSETÓN", value: () => "~13 m", y: 440, tone: "gold" },
    { a: T.y2019, b: T.rehacer - 0.1, label: "AÑO", value: () => "2019", y: 440, tone: "red" },
    { a: T.labrar, b: T.ochocientos - 0.1, label: "VIGAS", value: () => "A HACHA", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.ojival, text: "ARCO OJIVAL" }, { a: T.cruceria, text: "BÓVEDA DE CRUCERÍA" }, { a: T.arbotantes, text: "ARBOTANTES" },
    { a: T.grua, text: "GRÚA DE RUEDA" }, { a: T.vitralesT, text: "VITRALES" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.paris, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.pequenas, T.b1 - 0.1], [T.abra, T.c1 - 0.1], [T.oscuro, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN ACERO"], [T.b3, T.c3, "SIN VIGAS DE ACERO"], [T.b4, T.c4, "SIN MOTOR"]],
  reward: { a: T.ochocientos, len: T.end - T.ochocientos, top: "A HACHA, COMO HACE", big: () => "800 AÑOS", sub: "SIN UN SOLO MOTOR" },
  // «como una mesa sobre sus patas»: a comparação vira selo no lugar da pílula (o tramo fica embaixo, livre)
  Extra: ({ t }) => {
    const k = win(t, T.mesa, T.cruceria - 0.05, 0.15); if (k <= 0) return null;
    const legs = t >= T.patas - 0.05, leg = legs ? "#ffc93a" : "#b07a42";
    return (
      <div style={{ position: "absolute", left: 0, width: 1080, top: 400, display: "flex", justifyContent: "center", opacity: k, transform: `rotate(-3deg) scale(${pop(t, T.mesa, 0.3)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 44px 14px", borderRadius: 34, background: "#fff4dcee", border: "8px solid #6b3f22", boxShadow: "0 10px 0 #00000055" }}>
          <svg viewBox="0 0 130 96" width="170" height="126">
            {[[30, 30], [100, 30]].map(([x, y]) => <rect key={x} x={x - 4} y={y} width="9" height="44" rx="3" fill={leg} stroke="#3a2010" strokeWidth="4" opacity="0.75" />)}
            <path d="M10 26 L120 26 L110 40 L20 40 Z" fill="#c48a52" stroke="#3a2010" strokeWidth="5" strokeLinejoin="round" />
            {[[22, 40], [108, 40]].map(([x, y]) => <rect key={x} x={x - 6} y={y} width="12" height="52" rx="3" fill={leg} stroke="#3a2010" strokeWidth="4" />)}
            <path d="M65 0 L65 14 M57 8 L65 17 L73 8" stroke="#e0262b" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: FONT, fontSize: 86, color: "#3a2010", lineHeight: 1, ...stroke(3, "#3a2010") }}>= MESA</span>
        </div>
      </div>
    );
  },
};

// interior escuro: a luz cai NO corte (o corte esconde o salto) e volta em 1,6 s com o vidro; nunca abaixo de 0,6
const dark = (t: number) => (t >= C6 - 0.01 && t < C7 ? 1 : 0) * (1 - ease(t, T.vidrio - 0.3, T.vidrio + 1.3));
export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mason, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef2f4", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#9aa88a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.4 * dark(t),
};
