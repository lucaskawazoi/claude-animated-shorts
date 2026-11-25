// Episódio «lixo» (MEP23, tema 1 do radar): o caminhão de lixo compactador e a parede lá dentro que anda.
// Molde do posto/arte: planos de 1,3 s ou mais na mediana, deslocamentos curtos (60%), tremor de mão 0,55.
// A conta sugere pela imagem: «E esse lixo todo vai pra onde?» sobre o lixão, sem dizer.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { AT, LX, SIDE, World } from "./world";

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [SIDE[0], 3.0, SIDE[2]]; // mira acima do operário: ele fica na metade de baixo
const S2: V3 = [AT[0] - 20, 0, -3.5]; // onde o operário fala no aterro
const W2: V3 = [S2[0], 3.0, S2[2]];
const TA: V3 = [AT[0] - 34, 0, AT[2] - 14]; // o caminhão no aterro (caixa em x -2,5…5,5 local)
const L: V3 = [LX[0], 3, LX[2] - 6]; // o monte do lixão
const ROWS: R[] = [
  [0, [17, 7, 24], [0.4, 2.8, 0], [16, 6.8, 23], [0.6, 2.8, 0], 50, 48, 0, 0, "gancho: o caminhão chega na rua, a caixa vira vidro"],
  [T.parede0, [2.6, 3.7, 8.6], [2.0, 3.4, 0], [2.3, 3.7, 8.0], [1.8, 3.4, 0], 48, 46, 0, 0, "a placa azul anda (prévia)"],
  [T.bora, [14, 9, 14], [1, 2.5, 0], [12.6, 9.4, 14.8], [1, 2.5, 0], 52, 50, 0, 0, "a rua do alto"],
  [T.monta, [2, 6.0, 19], [0.2, 2.8, 0], [1.4, 6.0, 18], [0.2, 2.8, 0], 52, 50, 0, 0, "montagem: chassi, cabine, caixa"],
  [T.boca, [15, 5.5, -1.5], [7, 2.6, 0], [14.4, 5.5, -2.2], [7, 2.6, 0], 48, 46, 0, 0, "a boca e o coletor"],
  [T.chefe, [13.8, 3.1, 11], W1, [13.4, 3.1, 10.4], W1, 46, 44, 1, -1, "operário: Chefe, tem um probleminha"],
  [T.ar, [2.4, 3.7, 9.6], [2.4, 3.4, 0], [2.1, 3.7, 8.9], [2.4, 3.4, 0], 50, 48, 0, 0, "saco solto: a caixa «cheia» de ar"],
  [T.pa, [8.4, 3.5, 8.6], [6.4, 2.8, 0], [7.9, 3.5, 8.0], [6.3, 2.8, 0], 48, 46, 0, 0, "a pá desce e varre a boca"],
  [T.z1, [8.0, 3.0, 10.2], W1, [8.4, 3.0, 9.6], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.contra, [5.4, 3.9, 9.2], [4.4, 3.2, 0], [5.0, 3.9, 8.6], [4.2, 3.2, 0], 48, 46, 0, 0, "a pá empurra contra o quê?"],
  [T.parede, [1.6, 3.6, 17.5], [1.6, 3.3, 0], [1.6, 3.6, 16.8], [1.6, 3.3, 0], 48, 47, 0, 0, "a parede que anda (acende)"],
  [T.colada, [2.4, 4.6, 17], [1.8, 3.3, 0], [2.0, 4.6, 16.4], [1.6, 3.3, 0], 48, 47, 0, 0, "começa colada na boca"],
  [T.recua, [0.8, 3.4, 17.5], [1.4, 3.3, 0], [0.6, 3.4, 16.8], [1.2, 3.3, 0], 48, 47, 0, 0, "recua pá por pá"],
  [T.metro, [1.5, 4.6, 12.2], [1.5, 3.3, 0], [1.3, 4.7, 11.4], [1.5, 3.3, 0], 52, 50, 0, 0, "a caixa apertada até o fim"],
  [T.z2, [13.2, 2.9, 9.0], W1, [12.8, 2.9, 8.5], W1, 44, 42, 1, -1, "Resolveu? (operário, do outro lado)"],
  [T.encheu, [10, 7, 15.5], [1.5, 3, 0], [9.4, 7.2, 14.8], [1.5, 3, 0], 52, 50, 0, 0, "a caixa cheia, a rua do alto"],
  [T.aterro, [TA[0] + 12, 8, 10], [TA[0] + 6, 2.4, -14], [TA[0] + 11.4, 8.2, 9.4], [TA[0] + 6, 2.4, -14], 52, 50, 0, 0, "o aterro do alto: o caminhão chega"],
  [T.deVolta, [TA[0] + 5, 4.0, 4], [TA[0] + 5, 3.2, -14], [TA[0] + 6, 4.0, 3.6], [TA[0] + 6.4, 3.2, -14], 48, 47, 0, 0, "a parede volta e empurra tudo pra fora"],
  [T.z3, [S2[0] + 3.4, 3.1, S2[2] + 7.6], W2, [S2[0] + 3.0, 3.1, S2[2] + 7.0], W2, 44, 42, -1, 1, "Resolveu? (operário no aterro)"],
  [T.apodrece, [AT[0] - 6, 8, 6], [AT[0] - 8, 2.6, -14], [AT[0] - 6.6, 8.2, 5.2], [AT[0] - 8, 2.6, -14], 50, 48, 0, 0, "o lixo apodrece: caldo e gás"],
  [T.manta, [AT[0] - 26, 2.4, 0], [AT[0] - 21, 0.6, -14], [AT[0] - 25, 2.5, -0.8], [AT[0] - 20, 0.6, -14], 46, 44, 0, 0, "a manta preta embaixo (acende)"],
  [T.tratamento, [AT[0] + 2, 5, 18], [AT[0] + 8, 0.6, 6], [AT[0] + 2.8, 5, 17.2], [AT[0] + 8, 0.6, 6], 48, 46, 0, 0, "o caldo vai para a lagoa de tratamento"],
  [T.gas, [AT[0] + 10, 5.2, 9], [AT[0] + 11, 3.2, -14], [AT[0] + 10.8, 5.2, 8.4], [AT[0] + 11.6, 3.2, -14], 52, 50, 0, 0, "o gás vai ao gerador e a casa acende"],
  [T.agoraSim, [S2[0] + 2.8, 3.6, S2[2] + 9.6], [S2[0], 2.5, S2[2]], [S2[0] + 2.6, 3.7, S2[2] + 9.0], [S2[0], 2.5, S2[2]], 50, 48, 0, 0, "Agora sim: o operário comemora"],
  [T.conta, [AT[0], 30, 30], [AT[0], 0, -14], [AT[0], 31, 29], [AT[0], 0, -14], 52, 50, 0, 0, "E a conta? o aterro do alto"],
  [T.brasil, [AT[0] - 18, 22, 24], [AT[0] - 4, 0, -14], [AT[0] - 16, 24, 22], [AT[0] - 4, 0, -14], 54, 52, 0, 0, "o aterro todo, subindo"],
  [T.quatro, [L[0] + 15, 12, L[2] + 25], L, [L[0] + 13, 13, L[2] + 23], L, 52, 50, 0, 0, "o lixão: sem manta, fumaça, urubus"],
  [T.prazo, [L[0] + 5, 6, L[2] + 15], [L[0], 5, L[2]], [L[0] + 4, 6.4, L[2] + 14], [L[0], 5, L[2]], 50, 48, 0, 0, "o lixão de perto"],
  [T.servico, [0, 9.5, 17], [0, 4, -12], [-1.6, 9.5, 16.2], [-1.6, 4, -12], 50, 48, 0, 0, "as casas da rua: o serviço do lixo, quem paga"],
  [T.onde, [L[0] + 30, 25, L[2] + 40], L, [L[0] + 28, 26, L[2] + 38], L, 54, 52, 0, 0, "vai pra onde? o lixão do alto"],
  [T.voce, [13.8, 3.1, 11], W1, [18, 7.5, 20], [4, 2.5, 0], 44, 54, 0, 0, "comenta aí: aponta e recua até o caminhão"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, x = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), u = 0.6 * (sstep(x) * 0.6 + 0.4 * x); // ponytail: 60% do deslocamento planejado (calma), knob único
  const Lr = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: Lr(r[1], r[3]), look: Lr(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
const DYN = [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.5];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TO_TRUCK = -1.1, FRONT = 0.35;
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, FRONT, "present")],
  [T.monta, S(SIDE, TO_TRUCK, "point")],
  [T.chefe, S(SIDE, FRONT, "alarm")],
  [T.deixa1, S(SIDE, TO_TRUCK, "point")],
  [T.z1, S(SIDE, FRONT, "think")],
  [T.parede, S(SIDE, TO_TRUCK, "point")],
  [T.z2, S(SIDE, FRONT, "think")],
  [T.encheu, S(SIDE, FRONT, "alarm")],
  [T.aterro, S(S2, FRONT, "present")],
  [T.deVolta, S(S2, TO_TRUCK, "point")],
  [T.z3, S(S2, FRONT, "think")],
  [T.apodrece, S(S2, FRONT, "alarm")],
  [T.manta, S(S2, -0.4, "point")],
  [T.agoraSim, S(S2, FRONT, "cheer")],
  [T.conta, S(S2, FRONT, "present")],
  [T.servico, S(SIDE, FRONT, "present")],
  [T.voce - 0.35, S(SIDE, 0.15, "present")],
  [T.comenta, S(SIDE, 1.25, "pointHi")],
];

const hud: HudData = {
  // números de e18-lixo/FONTES.md § 0 (Heil PT1100 2025; ABREMA Panorama 2025; Lei 12.305 art. 54; SINISA 2024)
  pills: [
    { a: T.quinze, b: T.z1 - 0.1, label: "1 PÁ A CADA", value: () => "≈ 15 s", y: 440, hi: true, tone: "gold" },
    { a: T.quinze + 0.3, b: T.z1 - 0.1, label: "FICHA DE FABRICANTE (EUA)", y: 560, hi: true, tone: "dark" },
    { a: T.ar + 0.3, b: T.deixa1 - 0.1, label: "SACO SOLTO", value: () => "≈ TUDO AR", y: 440, hi: true, tone: "red" },
    { a: T.duas + 0.2, b: T.deixa1 - 0.1, label: "CAIXA CHEIA EM", value: () => "2 RUAS", y: 560, hi: true, tone: "red" },
    { a: T.parede + 0.2, b: T.metro - 0.1, label: "PLACA EJETORA", y: 440, hi: true, tone: "blue" },
    { a: T.recua + 0.2, b: T.metro - 0.1, label: "RECUA A CADA PÁ", y: 560, hi: true, tone: "dark" },
    { a: T.metro + 0.3, b: T.z2 - 0.1, label: "1 m³ DE LIXO", value: () => "ATÉ ≈ 600 kg", y: 440, hi: true, tone: "gold" },
    { a: T.metro + 0.6, b: T.z2 - 0.1, label: "FICHA DE FABRICANTE (EUA)", y: 560, hi: true, tone: "dark" },
    { a: T.deVolta + 0.2, b: T.z3 - 0.1, label: "A PAREDE EMPURRA TUDO", y: 440, hi: true, tone: "blue" },
    { a: T.manta + 0.2, b: T.tratamento - 0.1, label: "MANTA", value: () => "SEGURA O CALDO", y: 440, hi: true, tone: "dark" },
    { a: T.tratamento + 0.1, b: T.gas - 0.05, label: "CALDO", value: () => "TRATAMENTO", y: 440, hi: true, tone: "dark" },
    { a: T.gas + 0.1, b: T.agoraSim - 0.1, label: "GÁS DO LIXO", value: () => "VIRA LUZ", y: 440, hi: true, tone: "green" },
    { a: T.brasil + 0.3, b: T.quatro - 0.1, label: "BRASIL, 2024", value: () => "81,6 MILHÕES t", y: 440, hi: true, tone: "gold" },
    { a: T.brasil + 0.8, b: T.quatro - 0.1, label: "FONTE: ABREMA", y: 560, hi: true, tone: "dark" },
    { a: T.quatro + 0.2, b: T.prazo - 0.1, label: "4 EM CADA 10", value: () => "LUGAR ERRADO", y: 440, hi: true, tone: "red" },
    { a: T.prazo + 0.2, b: T.servico - 0.1, label: "PRAZO DOS LIXÕES", value: () => "VENCEU EM 2024", y: 440, hi: true, tone: "red" },
    { a: T.prazo + 0.6, b: T.servico - 0.1, label: "LEI 12.305", y: 560, hi: true, tone: "dark" },
    { a: T.duzentos, b: T.onde - 0.1, label: "SERVIÇO DO LIXO", value: () => "≈ R$ 220/ANO", y: 440, hi: true, tone: "gold" },
    { a: T.duzentos + 0.3, b: T.onde - 0.1, label: "POR PESSOA · SINISA", y: 560, hi: true, tone: "dark" },
  ],
  // o gancho em título grande já cheio no quadro 0 (aprendizado do posto)
  titles: ([[-0.4, "A PAREDE QUE ANDA", 92], [T.monta, "PEÇA POR PEÇA"], [T.parede, "A PAREDE QUE ANDA", 92], [T.aterro, "NO ATERRO"], [T.conta, "E A CONTA?"], [T.onde, "VAI PRA ONDE?"]] as [number, string, number?][])
    .map(([a, text, size], i, all) => ({ a, text, size, len: Math.min(3.0, (all[i + 1]?.[0] ?? T.voce) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [T.encheu + 0.1],
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]],
  reward: { a: T.agoraSim + 0.3, len: T.conta - 0.15 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "O GÁS VIRA LUZ", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.voce, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.voce, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>QUE DIA O</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>CAMINHÃO PASSA</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>NA SUA RUA?</span>
      <span style={{ fontFamily: FONT, fontSize: 78, color: "#ffffff", lineHeight: 1.3, ...stroke(11) }}>COMENTA AÍ</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 140, fogFar: 600, hemiSky: "#eef6ff", hemiGround: "#b9a37a", hemiI: 1.25, sun: "#fff3dc", sunI: 2.5 },
};
