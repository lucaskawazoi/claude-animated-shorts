// Episódio «arte» (MEP20, «A conta por trás»): por que um quadro de um milhão pode servir para lavar dinheiro.
// Molde do posto (MEP19 v2): planos de 1,3 s ou mais na mediana, deslocamentos curtos, tremor de mão pequeno.
// A graça é por insinuação (Lucas, 16/11): a tela do quadro vira porta de máquina de lavar; ninguém diz «lavanderia».
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { ALARM, BUY, CHART, OBRA, PAINT, SIDE, WH, World } from "./world";

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [SIDE[0], 3.0, SIDE[2]]; // mira acima do operário: ele fica na metade de baixo, o painel não cobre o rosto
const P = PAINT, PLQ: V3 = [P[0] + 2.9, P[1] - 1.6, P[2] + 0.12], C = CHART, B = BUY;
const ROWS: R[] = [
  [0, [0.6, 3.8, 1.6], P, [0.4, 3.8, 0.9], P, 48, 46, 0, 0, "gancho: o quadro no spot"],
  [T.mundo, [9, 8, 11], [0, 2, -2], [8, 8.2, 10], [0, 2, -2], 52, 50, 0, 0, "a galeria inteira, do alto"],
  [T.segundo, [5.5, 3.0, 6.5], [1.2, 2.6, -1.5], [5.1, 3.0, 6.0], [1.2, 2.6, -1.5], 46, 44, 0, 0, "o operário diante do quadro (fonte)"],
  [T.umQuadro, [3.7, 2.5, -2.2], PLQ, [3.5, 2.4, -2.7], PLQ, 44, 40, 0, 0, "a plaquinha: R$ 1.000.000"],
  [T.lava, [-1.5, 3.4, 5.5], [-1.2, 3.0, -4.5], [-1.3, 3.4, 4.8], [-1.0, 3.1, -4.5], 52, 50, 0, 0, "o quadro vira porta de máquina; moedas sujas entram"],
  [T.chefe, [5.4, 2.9, 5.8], [1.8, 3.0, -2.5], [5.1, 2.9, 5.3], [1.8, 3.0, -2.5], 46, 44, 1, -1, "operário: Chefe, como um quadro lava dinheiro?"],
  [T.como, [-1.0, 4.0, 3.0], [2.6, 3.0, -4.6], [-0.8, 4.0, 2.6], [2.7, 3.0, -4.6], 56, 54, 0, 0, "saem moedas limpas e o recibo"],
  [T.deixa, [-1.0, 3.0, 6.6], W1, [-0.8, 3.0, 6.1], W1, 46, 44, 0, 0, "Deixa comigo (do outro lado)"],
  [T.litro, [5.6, 2.3, 1.8], [7.4, 2.6, -2.5], [5.9, 2.3, 1.3], [7.4, 2.6, -2.5], 46, 44, 0, 0, "a bombinha do posto como obra: preço na placa"],
  [T.semTabela, [1.2, 2.3, -2.6], PLQ, [1.5, 2.3, -3.0], PLQ, 44, 42, 0, 0, "a plaquinha: R$ ?"],
  [T.vale, [0.6, 3.4, 4.8], [1.0, 3.0, -5.7], [0.4, 3.5, 4.1], [1.0, 3.0, -5.7], 48, 46, 0, 0, "o quadro de frente: vale o que alguém disser"],
  [T.gafi, [4.9, 2.6, 3.8], [2.6, 2.0, 0.6], [4.6, 2.7, 3.4], [2.6, 2.0, 0.6], 46, 44, 0, 0, "o operário lê o relatório do GAFI"],
  [T.diz, [10, 7.5, 8], [-2, 1.5, -3], [9.5, 7.7, 7.4], [-2, 1.5, -3], 52, 50, 0, 0, "a galeria do canto, do alto"],
  [T.dificulta, [-5.2, 5.4, -0.6], [-11.6, 6.0, -3.5], [-5.5, 5.5, -0.9], [-11.6, 6.0, -3.5], 48, 46, 0, 0, "a sirene apagada na parede"],
  [T.z1, [3.6, 2.9, 5.5], W1, [3.9, 2.9, 5.0], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.muita, [5.0, 2.6, 8.8], [7.2, 1.8, 1.8], [5.4, 2.6, 8.2], [6.6, 1.8, 1.8], 50, 48, 0, 0, "entra o comprador de caixa na cabeça"],
  [T.dono, [4.0, 2.4, 4.4], [B[0], 2.1, B[2]], [4.2, 2.4, 4.0], [B[0], 2.1, B[2]], 42, 40, 0, 0, "o dono de verdade: uma caixa com «?»"],
  [T.obra, [WH[0], 2.2, WH[2] + 16], [WH[0], 1.5, WH[2] + 6], [WH[0] - 1, 2.2, WH[2] + 15], [WH[0], 1.5, WH[2] + 6], 50, 48, 0, 0, "o depósito: caixas que não abrem"],
  [T.caixas, [WH[0] + 20, 26, WH[2] + 34], [WH[0], 2, WH[2]], [WH[0] + 16, 28, WH[2] + 32], [WH[0], 2, WH[2]], 52, 50, 0, 0, "Genebra do alto: as pilhas sobem"],
  [T.semImposto, [WH[0] + 14, 9, WH[2] + 26], [WH[0] - 4, 6, WH[2] - 60], [WH[0] + 13, 9.3, WH[2] + 25], [WH[0] - 4, 6, WH[2] - 60], 50, 48, 0, 0, "as caixas e as montanhas"],
  [T.z2, [-0.6, 2.9, 5.5], W1, [-0.3, 2.9, 5.0], W1, 44, 42, 1, -1, "Resolveu? (operário, do outro lado)"],
  [T.como2, [5.4, 3.2, 5.8], [1.0, 2.6, -0.5], [5.0, 3.2, 5.3], [1.0, 2.6, -0.5], 46, 44, 0, 0, "Como pegam? O operário aponta"],
  [T.pelo, [C[0] + 3, 3.2, C[2] + 5.5], [C[0], 1.6, C[2]], [C[0] + 2.7, 3.3, C[2] + 5.0], [C[0], 1.6, C[2]], 48, 46, 0, 0, "o gráfico de preços do artista"],
  [T.preco, [C[0] + 2.6, 5.0, C[2] + 6.5], [C[0] + 0.9, 3.4, C[2]], [C[0] + 2.5, 5.6, C[2] + 6.8], [C[0] + 1.0, 4.2, C[2]], 50, 52, 0, 0, "o pico vermelho passa da régua"],
  [T.pago, [B[0] - 2.4, 1.8, B[2] + 3.2], [B[0] - 0.9, 0.6, B[2] + 0.6], [B[0] - 2.2, 1.7, B[2] + 2.8], [B[0] - 0.9, 0.6, B[2] + 0.6], 44, 42, 0, 0, "a maleta de dinheiro vivo"],
  [T.por, [2.0, 2.5, 6.0], [B[0] - 0.2, 1.7, B[2]], [2.4, 2.5, 5.6], [B[0] - 0.2, 1.7, B[2]], 46, 44, 0, 0, "o comprador nem olha o quadro"],
  [T.brasil, [10, 5.5, 8], [-8, 3.5, -2], [9.4, 5.6, 7.4], [-8, 3.5, -2], 52, 50, 0, 0, "a galeria toda, a sirene ao fundo"],
  [T.coaf, [-5.5, 6.4, 2.5], [ALARM[0], 6.9, ALARM[2]], [-5.8, 6.5, 2.1], [ALARM[0], 6.9, ALARM[2]], 46, 44, 0, 0, "a sirene do COAF acende"],
  [T.dez, [B[0] + 1.9, 3.2, B[2] + 4.2], [B[0] - 1.6, 1.3, B[2] - 0.8], [B[0] + 1.4, 3.3, B[2] + 3.6], [B[0] - 1.6, 1.3, B[2] - 0.8], 50, 48, 0, 0, "a maleta e o comprador sob a luz vermelha"],
  [T.agoraSim, [3.2, 3.6, 7.2], [1.5, 2.5, -2], [3.0, 3.7, 6.6], [1.5, 2.5, -2], 50, 48, 0, 0, "Agora sim: o operário comemora"],
  [T.voce, [0.4, 3.3, 3.0], [0.3, 3.3, -5.7], [0.2, 3.4, 2.3], [0.3, 3.3, -5.7], 48, 46, 0, 0, "a pergunta: o quadro de frente"],
  [T.comenta, [4.4, 3.1, 6.8], W1, [7, 7.5, 17], [OBRA[0] - 4, 2, -3], 44, 54, 0, 0, "comenta aí: aponta e recua até a bombinha"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, x = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), u = 0.6 * (sstep(x) * 0.6 + 0.4 * x); // ponytail: 60% do deslocamento planejado (calma), knob único
  const Lr = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: Lr(r[1], r[3]), look: Lr(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
// movimento calmo (teto 2,7 da régua do Lucas): 1ª versão com 1,0–1,4 mediu 3,05; tremor de mão pela metade
const DYN = [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.5];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TO_ART = -0.75, FRONT = 0.35;
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, FRONT, "present")],
  [T.umQuadro, S(SIDE, TO_ART, "point")],
  [T.chefe, S(SIDE, FRONT, "alarm")],
  [T.deixa, S(SIDE, TO_ART, "point")],
  [T.vale, S(SIDE, FRONT, "present")],
  [T.gafi, S(SIDE, FRONT, "read", { prop: "scroll" })],
  [T.dificulta, S(SIDE, FRONT, "think")],
  [T.muita, S(SIDE, 0.9, "point")],
  [T.z2, S(SIDE, FRONT, "think")],
  [T.como2, S(SIDE, FRONT, "think")],
  [T.brasil, S(SIDE, FRONT, "present")],
  [T.agoraSim, S(SIDE, FRONT, "cheer")],
  [T.voce - 0.35, S(SIDE, 0.15, "present")],
  [T.comenta, S(SIDE, 1.25, "pointHi")],
];

const hud: HudData = {
  // números de e17-arte/FONTES.md § 0 (Art Basel & UBS 2025; GAFI 2023; Lei 9.613/1998 art. 9º XI; Portaria IPHAN 396/2016)
  pills: [
    { a: T.mundo, b: T.umQuadro - 0.1, label: "ARTE NO MUNDO", value: () => "≈ US$ 60 BI/ANO", y: 440, hi: true, tone: "gold" },
    { a: T.segundo, b: T.umQuadro - 0.1, label: "FONTE: ART BASEL & UBS", value: () => "2025", y: 560, hi: true, tone: "dark" },
    { a: T.umQuadro + 0.2, b: T.chefe - 0.1, label: "1 QUADRO", value: () => "R$ 1 MILHÃO", y: 440, hi: true, tone: "gold" },
    { a: T.litro + 0.3, b: T.semTabela - 0.1, label: "GASOLINA", value: () => "PREÇO NA PLACA", y: 440, hi: true, tone: "gold" },
    { a: T.semTabela + 0.3, b: T.gafi - 0.1, label: "QUADRO", value: () => "SEM TABELA", y: 440, hi: true, tone: "red" },
    { a: T.vale + 0.1, b: T.gafi - 0.1, label: "PREÇO = O QUE ALGUÉM DISSER", y: 560, hi: true, tone: "dark" },
    { a: T.gafi + 0.2, b: T.z1 - 0.1, label: "GAFI", value: () => "VIGIA LAVAGEM NO MUNDO", y: 440, hi: true, tone: "dark" },
    { a: T.gafi + 0.6, b: T.z1 - 0.1, label: "RELATÓRIO SOBRE ARTE · 2023", y: 560, hi: true, tone: "dark" },
    { a: T.dificulta + 0.3, b: T.z1 - 0.1, label: "DIFICULTA A FISCALIZAÇÃO", y: 680, hi: true, tone: "red" },
    { a: T.muita + 0.3, b: T.obra - 0.1, label: "VENDA POR INTERMEDIÁRIO", y: 440, hi: true, tone: "dark" },
    { a: T.dono + 0.2, b: T.obra - 0.1, label: "DONO DE VERDADE", value: () => "?", y: 560, hi: true, tone: "red" },
    { a: T.caixas + 0.3, b: T.z2 - 0.1, label: "GENEBRA · PORTO FRANCO", y: 440, hi: true, tone: "dark" },
    { a: T.estimam + 0.2, b: T.z2 - 0.1, label: "MAIS DE 1 MILHÃO DE OBRAS", value: () => "(ESTIMATIVA)", y: 560, hi: true, tone: "gold" },
    { a: T.semImposto + 0.1, b: T.z2 - 0.1, label: "SEM IMPOSTO", y: 680, hi: true, tone: "green" },
    // os sinais de alerta do GAFI, um por vez, empilhados
    { a: T.preco + 0.3, b: T.brasil - 0.1, label: "PREÇO MUITO ACIMA DO NORMAL", y: 400, hi: true, tone: "red" },
    { a: T.pago + 0.2, b: T.brasil - 0.1, label: "DINHEIRO VIVO", y: 516, hi: true, tone: "red" },
    { a: T.por + 0.3, b: T.brasil - 0.1, label: "NEM LIGA PRA QUEM PINTOU", y: 632, hi: true, tone: "red" },
    { a: T.coaf, b: T.agoraSim - 0.1, label: "A GALERIA AVISA O COAF", y: 440, hi: true, tone: "gold" },
    { a: T.dez + 0.2, b: T.agoraSim - 0.1, label: "DINHEIRO VIVO", value: () => "R$ 10 MIL OU MAIS", y: 560, hi: true, tone: "red" },
    { a: T.brasil + 0.3, b: T.agoraSim - 0.1, label: "LEI 9.613 + IPHAN", y: 680, hi: true, tone: "dark" },
  ],
  // o número do gancho em título grande já cheio no quadro 0 (aprendizado do posto)
  titles: ([[-0.4, "US$ 60 BILHÕES POR ANO", 92], [T.semTabela, "QUADRO NÃO TEM TABELA"], [T.muita, "QUEM COMPROU?"], [T.caixas, "GENEBRA"], [T.como2, "COMO PEGAM?"], [T.brasil, "NO BRASIL"]] as [number, string, number?][])
    .map(([a, text, size], i, all) => ({ a, text, size, len: Math.min(3.0, (all[i + 1]?.[0] ?? T.agoraSim) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [T.preco + 0.6],
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2]],
  reward: { a: T.agoraSim + 0.3, len: T.voce - 0.15 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "ALARME LIGADO", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.voce, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.voce, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>VOCÊ PAGARIA</span>
      <span style={{ fontFamily: FONT, fontSize: 108, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>R$ 1 MILHÃO</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>NUM QUADRO?</span>
      <span style={{ fontFamily: FONT, fontSize: 78, color: "#ffffff", lineHeight: 1.3, ...stroke(11) }}>COMENTA AÍ</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 120, fogFar: 520, hemiSky: "#eef6ff", hemiGround: "#d8b48a", hemiI: 1.25, sun: "#fff3dc", sunI: 2.5 },
};
