// Episódio «rua» — por que o buraco da sua rua volta (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
// Ritmo calmo (crítica do Lucas à usina 2, 16/11): planos de 1,3 s ou mais, deslocamentos curtos, tremor de mão menor.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
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
const openB = (t: number): CamState => { const z = Math.min(carZ(t, 0), PZ - 1); return { pos: [PX + 1.2, 6.2, z - 11], look: [PX, 0, Math.max(z + 7, PZ)], fov: 50, roll: 0 }; };
const openC = (t: number): CamState => { const u = sstep(prog(t, 0, OPEN_END)); return { pos: [lerp(0, PX, u), lerp(42, 11, u), lerp(52, PZ + 14, u)], look: [lerp(0, PX, u), 0, lerp(-12, PZ, u)], fov: lerp(58, 50, u), roll: 0 }; };
const camS1 = (t: number): CamState => { const o = openId(); return (o === "A" ? openA : o === "B" ? openB : openC)(Math.min(t, OPEN_END)); };

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história; câmera anda pouco dentro do plano
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [11, 3.3, 5]; // mira acima do operário: ele fica na metade de baixo e o carimbo/cartão não cobre o rosto
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
  [T.z1, [13.5, 2.8, 13], W1, [13, 2.6, 12.5], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.prob2, [-5, 1.6, 22], [-6.5, 0.2, -12], [-4.5, 1.8, 20], [-6.5, 0.2, -12], 50, 48, 0, 0, "a sarjeta enche"],
  [T.alaga, [9, 7, 28], [0, 0, -6], [7, 6.5, 26], [0, 0, -6], 52, 50, 1, -1, "a esquina alaga"],
  [T.boca, [-3.5, 2.6, 7.5], [BX - 0.5, 0.2, BZ], [-4.2, 2.4, 6.8], [BX - 0.5, 0.2, BZ], 46, 44, 0, 0, "a boca de lobo engole a água (vista da rua)"],
  [T.galeria, [-6, -4.5, 19], [GX, -7, 8], [-6.5, -5, 18], [GX, -7, 8], 48, 46, 0, 0, "a galeria leva até o rio (corte)"],
  [T.pato, [GX + 14, -4.4, ZB - 11], [GX + 1.5, -7.4, ZB - 3.5], [GX + 13, -4.6, ZB - 10], [GX + 1.5, -7.4, ZB - 3.5], 50, 48, 0, 0, "a saída no córrego, de lado e aberto: o bico de pato e o patinho"],
  [T.mar, [GX + 7.5, -5.4, ZB - 8.5], [GX + 1.4, -6.9, ZB - 3.7], [GX + 7, -5.3, ZB - 8], [GX + 1.3, -6.7, ZB - 3.6], 46, 44, 0, 0, "a maré sobe e empurra o patinho (inteiro) contra a válvula fechada"],
  [T.z2, [9.5, 2.8, 13], W1, [10, 2.7, 12.5], W1, 44, 42, 1, -1, "Resolveu? (operário)"],
  [T.prob3, [PX - 0.5, -0.4, 16.5], [PX, -1.0, 8], [PX, -0.5, 16], [PX, -1.0, 8], 44, 42, 0, 0, "a pedra amolece (corte)"],
  [T.caminhao, [PX + 7, 2.2, 20], [PX - 1, 2, -12], [PX + 6.5, 2.2, 19], [PX - 1, 2, -12], 50, 48, 0, 0, "o caminhão vem"],
  [T.eixo, [PX + 8, 1.5, PZ + 3.2], [PX, 0.9, PZ - 1], [PX + 7.4, 1.4, PZ + 2.6], [PX, 0.8, PZ - 0.5], 50, 46, 0, 0, "baixo e de lado: a roda traseira de ré entra na trinca"],
  [T.cede, [PX + 1, 0.6, 15.5], [PX, -0.6, 8], [PX + 0.5, 0.5, 15], [PX, -0.6, 8], 44, 42, 0, 0, "a base cede e o asfalto quebra (corte)"],
  [T.buraco2, [PX, 8.5, PZ + 4], [PX, 0, PZ], [PX, 7.5, PZ + 3.5], [PX, 0, PZ], 46, 44, 0, 0, "o buraco, de cima"],
  [T.massa, [PX + 6, 3.8, PZ + 7], [PX + 1, 0.4, PZ], [PX + 5.5, 3.6, PZ + 6.5], [PX + 1, 0.4, PZ], 48, 46, 0, 0, "massa fria por cima"],
  [T.pisa, [PX + 2.5, 2.4, PZ + 4], [PX, 0.2, PZ], [PX + 2.2, 2.2, PZ + 3.6], [PX, 0.2, PZ], 44, 42, 0, 0, "e pisa: o tapa-buraco"],
  [T.z3, [PX + 7.5, 3.0, PZ + 7.5], [PX + 2.6, 3.0, PZ + 0.8], [PX + 7, 2.9, PZ + 7], [PX + 2.6, 3.0, PZ + 0.8], 46, 44, 1, -1, "Resolveu? (operário no buraco, abaixo do carimbo)"],
  [T.voltou, [PX + 7, 2.6, PZ + 11], [PX, 0.5, PZ - 3], [PX + 6.5, 2.6, PZ + 10], [PX, 0.5, PZ - 3], 50, 48, 0, 0, "o carro cai de novo: voltou"],
  [T.capa, [PX, -0.2, 16.5], [PX, -0.9, 8], [PX + 0.4, -0.3, 16], [PX, -0.9, 8], 44, 42, 0, 0, "a base mole continua lá embaixo (corte)"],
  [T.corta, [PX, 9, PZ + 4], [PX, 0, PZ - 0.6], [PX, 8.5, PZ + 3.6], [PX, 0, PZ - 0.6], 46, 44, 0, 0, "corta um retângulo, de cima"],
  [T.tira, [PX + 7, 6.5, 17], [PX, 0, PZ], [PX + 6.5, 7, 16], [PX, 0, PZ], 52, 50, 0, 0, "tira o estragado"],
  [T.refaz, [PX + 4.5, 2.2, 13.5], [PX, -0.4, PZ], [PX + 4, 2.1, 13], [PX, -0.4, PZ], 46, 44, 0, 0, "refaz e compacta a base"],
  [T.quente, [PX + 3, 3.2, 13.5], [PX, 0.2, PZ], [PX + 2.6, 3, 13], [PX, 0.2, PZ], 46, 44, 0, 0, "asfalto quente"],
  [T.remendo, [PX, 8.5, PZ + 3.5], [PX, 0, PZ - 0.6], [PX, 8, PZ + 3.2], [PX, 0, PZ - 0.6], 46, 44, 0, 0, "o remendo profundo, de cima"],
  [T.agoraSim, [7, 4.2, 27], [PX, 0.5, 0], [6, 4.4, 25], [PX, 0.5, 0], 50, 48, 0, 0, "o carro passa liso"],
  [T.conta, [PX + 9, 6, PZ + 12], [PX - 3, 0.6, PZ - 3], [PX + 8, 5.6, PZ + 11], [PX - 3, 0.6, PZ - 3], 50, 48, 0, 0, "e a conta? a tonelada de asfalto cai na rua"],
  [T.oito, [PX - 1.2, 14, PZ + 3], [PX - 1.2, 0, PZ - 5], [PX - 1.2, 13, PZ + 2.5], [PX - 1.2, 0, PZ - 5], 50, 48, 0, 0, "de cima: a tonelada vira só 8 m²"],
  [T.medir, [1.6, 3.1, PZ + 7], [-1.6, 0.9, PZ - 1], [1.3, 2.9, PZ + 6.5], [-1.6, 0.9, PZ - 1], 46, 44, 0, 0, "duas amostras de asfalto: 5 cm pagos contra 3,4 cm medidos"],
  [T.quemPaga, [0, 7, 26], [11, 2.5, -6], [-1, 7.5, 25], [9, 2.5, -6], 54, 54, 0, 0, "quem paga: moedas saem das janelas e cruzam a rua (aberto)"],
  [T.quemEscolhe, [13.5, 2.8, 14], W1, [13, 2.8, 13], W1, 44, 42, -1, 1, "quem escolhe… não é: o operário dá de ombros"],
  [T.qual, [3, 9, 30], [0, -1, -6], [-2, 19, 52], [0, -1, -12], 52, 56, 0, 0, "a rua inteira, recuando e subindo"],
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
  [T.conta, S(SIDE, -0.9, "point")],
  [T.quemEscolhe, S(SIDE, -0.9, "think")],
  [T.qual, S(SIDE, -0.9, "present")],
];

const hud: HudData = {
  pills: [
    { a: 0.4, b: T.camada - 0.1, label: "TAPADO", value: () => "3 VEZES", y: 440, hi: true, tone: "red" },
    { a: T.cinco, b: T.prob1 - 0.1, label: "ASFALTO", value: () => "≈ 5 CM", y: 440, hi: true, tone: "gold" },
    { a: T.meio + 0.2, b: T.z1 - 0.1, label: "CAIMENTO", value: () => "≈ 2%", y: 440, hi: true, tone: "green" },
    // em duas linhas para caber grande no celular (numa só, o painel encolhia o texto)
    { a: T.eixo, b: T.cede - 0.05, label: "1 EIXO CARREGADO", y: 440, hi: true, tone: "red" },
    { a: T.carros - 0.1, b: T.cede - 0.05, label: "=", value: () => "MILHARES DE CARROS", y: 560, hi: true, tone: "red" },
    { a: T.mole, b: T.deixa4 - 0.05, label: "LÁ EMBAIXO", value: () => "BASE MOLE", y: 440, hi: true, tone: "red" },
    { a: T.quente + 0.2, b: T.remendo - 0.1, label: "ASFALTO QUENTE", value: () => "≈ 150 °C", y: 440, hi: true, tone: "gold" },
    // a conta: números de FONTES-custo.md (SINAPI 10/2026 insumo 34770; 1 t ÷ 2,4 t/m³ ÷ 0,05 m ≈ 8,3 m²; CGU, Lagarto/SE, 2023)
    // faixa porque o SINAPI oficial não abriu: espelho 10/2026 R$ 500 (média nacional, sem frete); editais 2025: R$ 581 (BA), R$ 714 (MG)
    { a: T.tonelada + 0.2, b: T.oito - 0.05, label: "1 TONELADA", value: () => "≈ R$ 500 A 700", y: 440, hi: true, tone: "gold" },
    { a: T.quinhentos + 0.3, b: T.oito - 0.05, label: "SINAPI · SEM FRETE", y: 560, hi: true, tone: "dark" },
    { a: T.oito, b: T.quemPaga - 0.05, label: "1 t =", value: () => "8 m² A 5 CM", y: 320, hi: true, tone: "gold" },
    { a: T.medir + 0.3, b: T.quemPaga - 0.05, label: "PAGO", value: () => "5 CM", y: 440, hi: true, tone: "green" },
    { a: T.auditoria + 0.6, b: T.quemPaga - 0.05, label: "MEDIDO", value: () => "3,4 CM", y: 560, hi: true, tone: "red" },
    { a: T.auditoria + 0.6, b: T.quemPaga - 0.05, label: "AUDITORIA · 2023", y: 680, hi: true, tone: "dark" },
  ],
  // cada título some antes do próximo entrar (o painel só corta pelo próximo alerta ou carimbo)
  titles: ([[0.3, "POR QUE ELE VOLTA?"], [T.terra, "TERRA"], [T.pedra, "PEDRA BRITADA"], [T.asfalto, "ASFALTO"], [T.guia, "GUIA"], [T.sarjeta, "SARJETA"], [T.boca, "BOCA DE LOBO"], [T.galeria, "GALERIA"], [T.pato + 0.9, "BICO DE PATO"], [T.tapa, "TAPA-BURACO"], [T.remendo, "REMENDO PROFUNDO"], [T.conta, "E A CONTA?"]] as [number, string][])
    // e nenhum título invade o cartão «RESOLVIDO!» (entra em T.agoraSim + 0.3)
    .map(([a, text], i, all) => ({ a, text, len: Math.min(i === all.length - 1 ? 2.4 : 3.0, (all[i + 1]?.[0] ?? 1e9) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [T.prob1, T.prob2, T.prob3, T.voltou],
  rewinds: [T.camada],
  crosses: [[T.voltou + 0.45, T.capa - 0.1]],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]],
  reward: { a: T.agoraSim + 0.3, len: T.conta - 0.2 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "DO CHÃO FIRME PRA CIMA", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita (o crítico: só na voz, ela se perdia) */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.qual, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.qual, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 84, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>QUAL BURACO DA SUA RUA</span>
      <span style={{ fontFamily: FONT, fontSize: 96, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>VOLTOU MAIS VEZES?</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 120, fogFar: 520, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
