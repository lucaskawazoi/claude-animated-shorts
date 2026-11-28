// Episódio «apontador» (MEP25, tema 10 do radar): o que tem dentro de um apontador de bolso.
// Molde do lixo: planos de 1,3 s ou mais na mediana, deslocamentos curtos (60%), tremor de mão 0,55.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { F2, M2, SIDE, World } from "./world";

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [SIDE[0], 3.0, SIDE[2]];
const WM: V3 = [M2[0], 3.0, M2[2]];
const WF: V3 = [F2[0], 3.0, F2[2]];
const ROWS: R[] = [
  [0, [5.6, 3.8, 6.4], [9.2, 2.34, 0], [5.9, 3.8, 6.0], [9.2, 2.34, 0], 44, 42, 0, 0, "gancho: o lápis rombudo girando"],
  [T.cone, [11.4, 3.7, 8.6], [8.0, 2.34, 0], [11.0, 3.7, 8.2], [8.0, 2.34, 0], 44, 42, 0, 0, "o cone fantasma na ponta"],
  [T.bloquinho, [7.5, 7, 19.5], [3.5, 2.3, 0], [6.9, 7, 18.7], [3.1, 2.3, 0], 46, 44, 0, 0, "o bloquinho aparece e o lápis entra"],
  [T.bora, [11, 15, 23], [3, 1.5, 0], [10.2, 15.4, 22.4], [3, 1.5, 0], 48, 46, 0, 0, "a carteira do alto"],
  [T.monta, [2.2, 6.6, 17], [0.6, 2.4, 0], [1.8, 6.6, 16.3], [0.6, 2.4, 0], 48, 46, 0, 0, "montagem: o bloco e o furo-guia"],
  [T.balanca, [6.4, 4.6, 11.2], [3.2, 2.34, 0], [6.1, 4.6, 10.7], [3.2, 2.34, 0], 46, 44, 0, 0, "o lápis balança no furo"],
  [T.chefe1, [14.2, 3.1, 14.6], W1, [13.8, 3.1, 14.0], W1, 46, 44, 1, -1, "operário: Chefe, tem um probleminha"],
  [T.cone2, [0.4, 4.8, 11.2], [-0.4, 2.4, 0], [0.1, 4.8, 10.7], [-0.4, 2.4, 0], 44, 42, 0, 0, "o cone acende lá dentro"],
  [T.lamina, [-0.2, 7.6, 9.6], [-0.6, 3.0, 0], [-0.5, 7.6, 9.1], [-0.6, 3.0, 0], 44, 42, 0, 0, "a lâmina entra por cima"],
  [T.z1, [8.4, 3.0, 13.8], W1, [8.8, 3.0, 13.2], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.chefe2, [1.3, 4.4, 11.2], [-0.5, 2.4, 0], [1.0, 4.4, 10.7], [-0.5, 2.4, 0], 46, 44, 0, 0, "raspa entupindo o cone"],
  [T.fenda, [-0.4, 9.0, 7.4], [-0.6, 4.2, 0], [-0.7, 9.0, 7.0], [-0.6, 4.2, 0], 44, 42, 0, 0, "a fenda acende"],
  [T.gira, [3.8, 6.4, 14.6], [0, 3.2, 0], [3.4, 6.4, 14.0], [0, 3.2, 0], 46, 44, 0, 0, "gira o lápis: a fita sai"],
  [T.sanfona, [-3.2, 6.8, 11.6], [-0.5, 4.2, 0.6], [-3.6, 6.9, 11.1], [-0.5, 4.2, 0.6], 46, 44, 0, 0, "a raspa em sanfona"],
  [T.z2, [13.8, 2.9, 12.6], W1, [13.4, 2.9, 12.1], W1, 44, 42, 1, -1, "Resolveu? (operário, do outro lado)"],
  [T.quebrou, [-2.0, 4.4, 9.4], [-2.2, 2.34, 0], [-2.2, 4.4, 9.0], [-2.2, 2.34, 0], 44, 42, 0, 0, "a pontinha presa no fim do cone"],
  [T.furinho, [-6.4, 3.8, 7.8], [-3.4, 2.2, 0], [-6.6, 3.8, 7.4], [-3.4, 2.2, 0], 44, 42, 0, 0, "o furinho acende"],
  [T.sair, [-7.4, 3.4, 8.4], [-4.8, 1.2, 0], [-7.6, 3.4, 8.0], [-4.8, 1.2, 0], 46, 44, 0, 0, "a ponta quebrada sai e cai"],
  [T.z3, [8.0, 3.1, 14.2], W1, [8.4, 3.1, 13.6], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.diaInteiro, [14.2, 3.1, 14.6], W1, [13.9, 3.1, 14.1], W1, 46, 44, 1, -1, "operário: e quem aponta o dia inteiro?"],
  [T.manivela, [-21, 6, 13], [-26, 2.6, 0], [-21.6, 6, 12.4], [-26, 2.6, 0], 48, 46, 0, 0, "o apontador de manivela aparece"],
  [T.cortadores, [-26.0, 3.8, 7.0], [-26.6, 2.2, 0], [-26.4, 3.8, 6.6], [-26.6, 2.2, 0], 44, 42, 0, 0, "os cortadores giram em volta do lápis parado"],
  [T.agoraSim, [WM[0] + 3, 3.6, WM[2] + 9.0], [WM[0], 2.5, WM[2]], [WM[0] + 2.8, 3.7, WM[2] + 8.4], [WM[0], 2.5, WM[2]], 50, 48, 0, 0, "Agora sim: o operário comemora"],
  [T.conta, [0, 9.6, 9], [0, 9.2, -17], [0, 9.6, 8.2], [0, 9.2, -17], 50, 48, 0, 0, "E a conta? o quadro-negro"],
  [T.desenho, [-1.5, 9.4, 5], [0, 9.0, -17], [-1.2, 9.4, 4.4], [0, 9.0, -17], 50, 48, 0, 0, "1847 no quadro"],
  [T.fabrica, [90, 14, -6], [70, 4, -40], [88.6, 14.4, -7], [70, 4, -40], 50, 48, 0, 0, "a fábrica de lápis em São Carlos"],
  [T.bilhoes, [60, 7.5, -10], [62, 2, -26], [60.6, 7.8, -10.8], [62, 2, -26], 48, 46, 0, 0, "o monte de lápis crescendo"],
  [T.dez, [82.2, 4.2, -14.0], [81.4, 2.6, -28.5], [81.9, 4.2, -14.7], [81.4, 2.6, -28.5], 48, 46, 0, 0, "dez lápis em pé, um a um"],
  [T.voce, [14.2, 3.1, 14.6], W1, [19, 8, 22], [3, 2.5, 0], 44, 54, 0, 0, "comenta aí: aponta e recua até o apontador"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, x = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), u = 0.6 * (sstep(x) * 0.6 + 0.4 * x); // ponytail: 60% do deslocamento planejado (calma), knob único
  const Lr = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: Lr(r[1], r[3]), look: Lr(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
const DYN = [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.5];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TO_OBJ = -1.1, FRONT = 0.35;
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, FRONT, "present")],
  [T.monta, S(SIDE, TO_OBJ, "point")],
  [T.chefe1, S(SIDE, FRONT, "alarm")],
  [T.deixa1, S(SIDE, TO_OBJ, "point")],
  [T.z1, S(SIDE, FRONT, "think")],
  [T.chefe2, S(SIDE, FRONT, "alarm")],
  [T.deixa2, S(SIDE, TO_OBJ, "point")],
  [T.z2, S(SIDE, FRONT, "think")],
  [T.quebrou, S(SIDE, FRONT, "alarm")],
  [T.deixa3, S(SIDE, TO_OBJ, "point")],
  [T.z3, S(SIDE, FRONT, "think")],
  [T.diaInteiro, S(SIDE, FRONT, "alarm")],
  [T.manivela, S(M2, TO_OBJ, "point")],
  [T.agoraSim, S(M2, FRONT, "cheer")],
  [T.conta, S(SIDE, FRONT, "present")],
  [T.fabrica, S(F2, FRONT, "present")],
  [T.dez, S(F2, 1.3, "point")],
  [T.voce - 0.35, S(SIDE, 0.15, "present")],
  [T.comenta, S(SIDE, 1.25, "pointHi")],
];

const hud: HudData = {
  // números de e20-apontador/FONTES.md § 0 (Wikipedia «Pencil sharpener»; Consumidor Moderno; IBGE 2024)
  pills: [
    { a: T.semMotor + 0.2, b: T.bora - 0.1, label: "BLOQUINHO", value: () => "≈ 2,5 cm", y: 440, hi: true, tone: "gold" },
    { a: T.balanca + 0.2, b: T.chefe1 - 0.1, label: "LÁPIS BALANÇA", value: () => "PONTA QUEBRA", y: 440, hi: true, tone: "red" },
    { a: T.soSegura + 0.2, b: T.deixa1 - 0.1, label: "O FURO", value: () => "SÓ SEGURA", y: 440, hi: true, tone: "red" },
    { a: T.raspao + 0.1, b: T.z1 - 0.1, label: "LÂMINA", value: () => "DE RASPÃO NO CONE", y: 440, hi: true, tone: "blue" },
    { a: T.ondeRaspa + 0.2, b: T.deixa2 - 0.1, label: "A RASPA", value: () => "ENTUPIRIA", y: 440, hi: true, tone: "red" },
    { a: T.fenda + 0.3, b: T.gira - 0.05, label: "FENDA", value: () => "AO LONGO DA LÂMINA", y: 440, hi: true, tone: "blue" },
    { a: T.sanfona + 0.2, b: T.z2 - 0.1, label: "RASPA", value: () => "EM SANFONA", y: 440, hi: true, tone: "gold" },
    { a: T.furinho + 0.3, b: T.z3 - 0.1, label: "FURINHO", value: () => "NO FIM DO CONE", y: 440, hi: true, tone: "blue" },
    { a: T.parado + 0.2, b: T.agoraSim - 0.1, label: "LÁPIS PARADO", value: () => "CORTADORES GIRAM", y: 440, hi: true, tone: "blue" },
    { a: T.ano + 0.3, b: T.fabrica - 0.1, label: "THIERRY DES ESTIVAUX", value: () => "FRANÇA, 1847", y: 440, hi: true, tone: "gold" },
    { a: T.bilhoes + 0.2, b: T.dez - 0.1, label: "CAPACIDADE", value: () => "≈ 2 BILHÕES/ANO", y: 440, hi: true, tone: "gold" },
    { a: T.bilhoes + 0.5, b: T.dez - 0.1, label: "FONTE: CONSUMIDOR MODERNO", y: 560, hi: true, tone: "dark" },
    { a: T.dez + 0.3, b: T.voce - 0.1, label: "≈ 10 LÁPIS", value: () => "POR BRASILEIRO/ANO", y: 440, hi: true, tone: "gold" },
  ],
  titles: ([[-0.4, "REDONDO → CONE", 92], [T.monta, "PEÇA POR PEÇA"], [T.manivela, "DE MANIVELA"], [T.conta, "E A CONTA?"]] as [number, string, number?][])
    .map(([a, text, size], i, all) => ({ a, text, size, len: Math.min(3.0, (all[i + 1]?.[0] ?? T.voce) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [T.presa + 0.1],
  rewinds: [],
  crosses: [[T.soSegura + 0.3, T.deixa1 - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]],
  reward: { a: T.agoraSim + 0.3, len: T.conta - 0.15 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "O LÁPIS FICA PARADO", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.voce, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.voce, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>VOCÊ GIRA</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>O LÁPIS OU</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>O APONTADOR?</span>
      <span style={{ fontFamily: FONT, fontSize: 78, color: "#ffffff", lineHeight: 1.3, ...stroke(11) }}>COMENTA AÍ</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#f3e3c3", fog: "#f3e3c3", fogNear: 120, fogFar: 400, hemiSky: "#fff6e6", hemiGround: "#c49a62", hemiI: 1.3, sun: "#fff3dc", sunI: 2.4 },
};
