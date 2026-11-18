// Episódio «posto» (MEP19) — você paga uns R$ 6,50 no litro; quanto fica pro posto? Câmera, operário, painel e luz.
// Molde do MEP18 (rua): planos de 1,3 s ou mais, deslocamentos curtos, tremor de mão pequeno; só o tema e a conta mudam.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { CAL, HOLE, LIT, MAQ, PUMP, SIDE, World } from "./world";

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história; a câmera anda pouco no plano
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [SIDE[0], 3.2, SIDE[2]]; // mira acima do operário: ele fica na metade de baixo e o carimbo não cobre o rosto
const L = LIT;
const ROWS: R[] = [
  [0, [7, 4, 30], [1, 1.5, 6], [6, 3.4, 10], [-0.5, 1.8, -2], 52, 48, 0, 0, "gancho: o carro entra no posto"],
  [T.quanto, [-4.5, 2.8, 4.5], [0.5, 1.9, -1.2], [-4.2, 2.8, 4.1], [0.5, 1.9, -1.2], 46, 44, 0, 0, "a bomba e o carro: quanto fica pro posto?"],
  [T.bora, [-0.5, 4.0, 16.5], [L[0] + 1.3, 3.2, L[2]], [-0.9, 3.9, 15.5], [L[0] + 1.3, 3.2, L[2]], 50, 48, 0, 0, "o litro gigante aparece (vazio)"],
  [T.primeiro, [-14, 6, -15], [-30, 3, -36], [-15, 6.4, -17], [-30, 3, -36], 50, 48, 0, 0, "o cavalo de pau tira o petróleo"],
  [T.refinaria, [-27, 9, -35], [-48, 9, -62], [-28, 9.6, -37], [-48, 9, -62], 52, 50, 0, 0, "a refinaria"],
  [T.essa, [-2.5, 3.6, 14.2], [L[0], 3.0, L[2]], [-2.8, 3.6, 13.6], [L[0], 3.0, L[2]], 44, 42, 0, 0, "a fatia da gasolina pura cai no litro"],
  [T.prob1, [4.6, 3.0, 13], W1, [4.3, 3.0, 12.5], W1, 42, 40, 1, -1, "operário: a gasolina não pode ir pura"],
  [T.deixa1, [20, 7, -18], [36, 4, -44], [21, 7.4, -20], [36, 4, -44], 52, 50, 0, 0, "o canavial e a usina"],
  [T.trinta, [-2.2, 4.2, 14.5], [L[0], 3.2, L[2]], [-2.5, 4.2, 14], [L[0], 3.2, L[2]], 46, 44, 0, 0, "a fatia do etanol cai no litro"],
  [T.mais1, [-9.8, 4.2, 14], [L[0], 3.2, L[2]], [-9.4, 4.2, 13.6], [L[0], 3.2, L[2]], 44, 42, 0, 0, "o litro com duas fatias (do outro lado)"],
  [T.z1, [3.6, 2.9, 11.5], W1, [3.9, 2.9, 11], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.prob2, [-3.6, 1.2, 11], [L[0], 6.5, L[2]], [-3.8, 1.3, 10.6], [L[0], 6.8, L[2]], 54, 52, 0, 0, "de baixo: o carimbo do imposto desce do céu"],
  [T.icmsN, [-1.6, 5.0, 14.8], [L[0], 4.0, L[2]], [-1.9, 5.0, 14.3], [L[0], 4.0, L[2]], 46, 44, 0, 0, "o carimbo bate: a fatia do ICMS"],
  [T.mesmo, [6, 7, 26], [-1, 2.5, 0], [5, 7.2, 24.5], [-1, 2.5, 0], 52, 50, 0, 0, "o posto inteiro: igual em todo estado"],
  [T.federal, [-2.4, 5.6, 14], [L[0], 4.8, L[2]], [-2.6, 5.6, 13.6], [L[0], 4.8, L[2]], 44, 42, 0, 0, "o carimbo do federal encosta e volta"],
  [T.ate, [CAL[0] + 0.6, CAL[1] + 0.2, CAL[2] + 5.4], [CAL[0], CAL[1] - 0.1, CAL[2]], [CAL[0] + 0.5, CAL[1] + 0.2, CAL[2] + 5.0], [CAL[0], CAL[1] - 0.1, CAL[2]], 40, 38, 0, 0, "o calendário: 9 de dezembro"],
  [T.z2, [-0.6, 2.9, 10.5], W1, [-0.3, 2.9, 10], W1, 44, 42, 1, -1, "Resolveu? (operário, do outro lado)"],
  [T.prob3, [-40, 18, 40], [-72, 2, -2], [-42, 18, 38], [-72, 2, -2], 54, 52, 0, 0, "a base da distribuidora, longe"],
  [T.longe, [4, 5, 17], [-50, 1, 8], [3.5, 5.2, 16.6], [-50, 1, 8], 46, 44, 0, 0, "da entrada do posto: a estrada até a base, lá longe"],
  [T.caminhao, [-2, 3, 22], [-14, 1.8, 12], [-2.4, 3, 21.4], [-12, 1.8, 12], 50, 48, 0, 0, "o caminhão-tanque chega"],
  [T.entrega, [-4, 11, 25], [-8.5, 2, 7], [-4.6, 11.2, 24.2], [-8.5, 2, 7], 50, 48, 0, 0, "do alto: o caminhão, a mangueira no tanque e o litro"],
  [T.z3, [3.6, 2.8, 10.2], W1, [3.3, 2.8, 9.8], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.prob4, [0, 2.9, 11], W1, [0.2, 2.9, 10.6], W1, 42, 40, 0, 0, "operário: falta o posto"],
  [T.bomba, [0.2, 2.9, 9.5], [2.0, 1.6, -1], [0.5, 2.9, 9.0], [2.0, 1.6, -1], 46, 44, 0, 0, "o operário abastece o carro"],
  [T.agoraSim, [4, 6, 22], [9, 1.5, -5], [5, 6, 21.5], [12, 1.5, -6], 52, 50, 0, 0, "tanque cheio: o carro sai"],
  [T.fatia, [-2.4, 6.0, 14.8], [L[0], 4.6, L[2]], [-2.7, 6.0, 14.2], [L[0], 4.6, L[2]], 44, 42, 0, 0, "a fatia do posto, em cima; o litro fecha"],
  [T.conta, [-2.6, 4.9, 17.5], [-3.8, 3.2, 3], [-2.9, 5.0, 16.8], [-3.8, 3.2, 3], 50, 48, 0, 0, "e a conta? o litro, a maquininha e o operário"],
  [T.frentista, [-1.8, 5.2, 17], [-2.0, 3.8, 1], [-1.6, 5.3, 16.4], [-2.0, 3.8, 1], 54, 52, 0, 0, "as moedas da fatia: frentista, luz, aluguel"],
  [T.maquininha, [MAQ[0] + 1.2, 3.2, MAQ[2] + 4.2], [MAQ[0], 2.6, MAQ[2]], [MAQ[0] + 1.0, 3.2, MAQ[2] + 3.8], [MAQ[0], 2.6, MAQ[2]], 40, 38, 0, 0, "a maquininha morde a moeda"],
  [T.medio, [18, 16, 34], [0, 1, 2], [16.5, 16.5, 32], [0, 1, 2], 52, 50, 0, 0, "o posto do alto, carros na estrada"],
  [T.entram, [11, 3.5, 12], [7.5, 1.0, 4.5], [10.6, 3.6, 11.4], [7.5, 1.0, 4.5], 46, 44, 0, 0, "as pilhas de moedas do dia crescem"],
  [T.ficam, [16, 8, 22], [0, 3, -6], [15, 8.4, 21], [0, 3, -6], 56, 54, 0, 0, "quase tudo voa para os donos das outras fatias"],
  [T.buraco, [HOLE[0] + 3.5, 1.4, HOLE[2] + 5.5], [HOLE[0], 0.2, HOLE[2]], [HOLE[0] + 3.1, 1.4, HOLE[2] + 5], [HOLE[0], 0.2, HOLE[2]], 44, 42, 0, 0, "o remendo do buraco na estrada (vídeo anterior)"],
  [T.quemPaga, [-1.6, 5.2, 19], [-1.4, 2.8, 1.5], [-1.4, 5.3, 18.4], [-1.4, 2.8, 1.5], 54, 52, 0, 0, "quem paga: moedas saem do carro para o litro"],
  [T.chute, [3, 7, 22], [-1, 2, 0], [2, 18, 46], [-1, 1, -6], 52, 56, 0, 0, "o posto inteiro, recuando e subindo"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, x = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), u = sstep(x) * 0.6 + 0.4 * x;
  const Lr = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: Lr(r[1], r[3]), look: Lr(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
// tremor de mão por janela da régua: pequeno (o Lucas ficou tonto com a usina 2)
const DYN = [1.2, 1.2, 1.4, 1.2, 1, 1, 1.4, 1.2, 1, 1, 1.2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TO_LIT = -0.75, FRONT = 0.35, AT_PUMP: V3 = [PUMP[0] + 1.25, SIDE[1], PUMP[2] + 1.2];
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, FRONT, "present")],
  [T.bora + 0.2, S(SIDE, TO_LIT, "point")],
  [T.essa, S(SIDE, FRONT, "present")],
  [T.prob1, S(SIDE, FRONT, "alarm")],
  [T.misturar, S(SIDE, TO_LIT, "point")],
  [T.z1, S(SIDE, FRONT, "think")],
  [T.prob2, S(SIDE, FRONT, "alarm")],
  [T.deixa2, S(SIDE, TO_LIT, "point")],
  [T.z2, S(SIDE, FRONT, "think")],
  [T.prob3, S(SIDE, FRONT, "alarm")],
  [T.deixa3, S(SIDE, TO_LIT, "point")],
  [T.z3, S(SIDE, FRONT, "think")],
  [T.prob4, S(SIDE, FRONT, "alarm")],
  [T.bomba - 0.3, S(AT_PUMP, Math.PI / 2, "pour")],
  [T.agoraSim, S(SIDE, FRONT, "cheer")],
  [T.conta, S(SIDE, TO_LIT, "point")],
  [T.frentista + 0.4, S(SIDE, FRONT, "cheer")],
  [T.maquininha + 0.2, S(SIDE, TO_LIT, "alarm")],
  [T.medio, S(SIDE, FRONT, "present")],
  [T.ficam + 0.2, S(SIDE, FRONT, "think")],
  [T.quemPaga, S(SIDE, FRONT, "point")],
  [T.chute, S(SIDE, FRONT, "present")],
];

const hud: HudData = {
  // números de e16-posto/FONTES.md, seção 0 (ANP, Brasil, 08–14/11/2026; posto = revenda − distribuição, ANP ago–set)
  pills: [
    { a: T.seis, b: T.bora - 0.1, label: "1 LITRO", value: () => "≈ R$ 6,48", y: 440, hi: true, tone: "gold" },
    { a: T.seis + 0.3, b: T.bora - 0.1, label: "MÉDIA BRASIL · ANP", y: 560, hi: true, tone: "dark" },
    { a: T.dois, b: T.prob1 - 0.1, label: "GASOLINA PURA", value: () => "R$ 2,17", y: 440, hi: true, tone: "gold" },
    { a: T.trinta + 0.1, b: T.z1 - 0.1, label: "ETANOL", value: () => "32%", y: 440, hi: true, tone: "green" },
    { a: T.mais1 + 0.1, b: T.z1 - 0.1, label: "+", value: () => "R$ 1,15", y: 560, hi: true, tone: "green" },
    { a: T.icmsN + 0.2, b: T.z2 - 0.1, label: "ICMS", value: () => "R$ 1,57", y: 440, hi: true, tone: "red" },
    { a: T.mesmo + 0.1, b: T.federal - 0.05, label: "IGUAL EM TODO ESTADO", y: 560, hi: true, tone: "dark" },
    { a: T.federal + 0.2, b: T.z2 - 0.1, label: "FEDERAL", value: () => "R$ 0,06", y: 560, hi: true, tone: "red" },
    { a: T.ate + 0.1, b: T.z2 - 0.1, label: "ZERADO ATÉ 9/12", y: 680, hi: true, tone: "dark" },
    { a: T.cinquenta, b: T.z3 - 0.1, label: "DISTRIBUIDORA", value: () => "≈ R$ 0,53", y: 440, hi: true, tone: "dark" },
    { a: T.cinquenta + 0.3, b: T.z3 - 0.1, label: "COM O FRETE", y: 560, hi: true, tone: "dark" },
    { a: T.umReal, b: T.conta - 0.1, label: "PRO POSTO", value: () => "≈ R$ 1,00", y: 440, hi: true, tone: "gold" },
    { a: T.umReal + 0.4, b: T.conta - 0.1, label: "ANTES DAS CONTAS", y: 560, hi: true, tone: "dark" },
    { a: T.fatia + 0.6, b: T.conta - 0.1, label: "O LITRO", value: () => "R$ 6,48", y: 680, hi: true, tone: "green" },
    { a: T.vende + 0.2, b: T.buraco - 0.1, label: "POSTO MÉDIO", value: (t) => `≈ ${count(t, T.vende + 0.2, T.vende + 1.4, 0, 2800)} L/DIA`, y: 440, hi: true, tone: "gold" },
    { a: T.vende + 0.5, b: T.buraco - 0.1, label: "CONTA COM DADOS DA ANP", y: 560, hi: true, tone: "dark" },
    { a: T.entram + 0.1, b: T.buraco - 0.1, label: "ENTRA", value: () => "≈ R$ 18 MIL", y: 680, hi: true, tone: "green" },
    { a: T.ficam + 0.1, b: T.buraco - 0.1, label: "FICA", value: () => "≈ R$ 2.800", y: 800, hi: true, tone: "gold" },
  ],
  // cada título some antes do próximo entrar; nenhum invade o cartão «RESOLVIDO!»
  titles: ([[0.3, "QUANTO FICA PRO POSTO?"], [T.refinaria, "REFINARIA"], [T.misturar, "ETANOL DE CANA"], [T.imposto + 0.2, "IMPOSTO"], [T.caminhao, "DISTRIBUIDORA"], [T.bomba, "O POSTO"], [T.conta, "E A CONTA?"], [T.buraco, "LEMBRA DO BURACO?"]] as [number, string][])
    .map(([a, text], i, all) => ({ a, text, len: Math.min(i === 0 ? T.bora - 0.4 : 3.0, (all[i + 1]?.[0] ?? T.quemPaga) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [T.prob1, T.prob2, T.prob3, T.prob4],
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]],
  reward: { a: T.agoraSim + 0.3, len: T.fatia - 0.15 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "TANQUE CHEIO", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.chute, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.chute, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>DESSE R$ 1,</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>QUANTO SOBRA</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>PRO DONO?</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 120, fogFar: 520, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
