// Episódio «posto» v2 (MEP19) — «Dezoito mil reais entram no caixa de um posto por dia. Mas quanto disso fica ali?»
// Roteiro do gerador conta-pt (a conta inversa: o caixa do dia → o real por litro → o tanque cheio → quem fica com o resto).
// Molde do MEP18: planos de 1,3 s ou mais na mediana, deslocamentos curtos, tremor de mão pequeno.
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import React from "react";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { COLS2, HOLE, LIT, MAQ, PILE, PUMP, SIDE, World } from "./world";

// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — um corte seco por virada da história
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const W1: V3 = [SIDE[0], 3.2, SIDE[2]]; // mira acima do operário: ele fica na metade de baixo, o painel não cobre o rosto
const L = LIT, P = PILE, C = COLS2;
const ROWS: R[] = [
  [0, [11.5, 3.2, 11], [P[0], 1.2, P[2]], [11, 3.3, 10.4], [P[0], 1.2, P[2]], 46, 44, 0, 0, "gancho: moedas caem no caixa"],
  [T.caixa, [12, 6.5, 22], [1, 1.5, 0], [11, 6.6, 21], [1, 1.5, 0], 52, 50, 0, 0, "o posto inteiro: o carro entra, a pilha do dia"],
  [T.mas, [4.6, 3.0, 13], W1, [4.3, 3.0, 12.5], W1, 42, 40, 1, -1, "operário: quanto fica ali?"],
  [T.litro, [-2.2, 3.0, 9.5], [1.0, 1.8, -1], [-2.0, 3.0, 9.0], [1.0, 1.8, -1], 46, 44, 0, 0, "a bomba e o carro: o litro"],
  [T.segundo, [8.4, 6.2, 17.5], [12.5, 8.6, 9.5], [8.7, 6.3, 17], [12.5, 8.6, 9.5], 44, 42, 0, 0, "o totem de preço do posto, com o 6,48 escrito (ANP)"],
  [T.medio, [18, 16, 34], [0, 1, 2], [16.5, 16.5, 32], [0, 1, 2], 52, 50, 0, 0, "do alto: o posto e os carros na estrada"],
  [T.oito1, [-6, 1.8, 22], [6, 1.2, 12], [-5.6, 1.8, 21.4], [6, 1.2, 12], 50, 48, 0, 0, "rente à estrada: carros passando"],
  [T.dois2, [13, 4, 13], [P[0], 1.0, P[2]], [12.5, 4.1, 12.5], [P[0], 1.0, P[2]], 46, 44, 0, 0, "a pilha do dia: a conta dos 18 mil"],
  [T.dezoito2, [9.5, 1.6, 9.5], [P[0], 0.8, P[2]], [9.3, 1.6, 9.1], [P[0], 0.8, P[2]], 44, 42, 0, 0, "a pilha de perto"],
  [T.chefe, [4.6, 3.0, 13], W1, [4.3, 3.0, 12.5], W1, 42, 40, -1, 1, "operário: Chefe, quanto disso é do posto?"],
  [T.deixa, [-0.5, 2.9, 11.5], W1, [-0.3, 2.9, 11], W1, 44, 42, 0, 0, "Deixa comigo (do outro lado)"],
  [T.naoGanha, [-2, 3, 22], [-14, 1.8, 12], [-2.4, 3, 21.4], [-12, 1.8, 12], 50, 48, 0, 0, "o caminhão da distribuidora chega"],
  [T.paga, [-4, 11, 25], [-8.5, 2, 7], [-4.6, 11.2, 24.2], [-8.5, 2, 7], 50, 48, 0, 0, "do alto: a mangueira no tanque do posto"],
  [T.cobra, [5.0, 3.6, 8.5], [1.0, 1.6, -0.5], [4.7, 3.6, 8.1], [1.0, 1.6, -0.5], 48, 46, 0, 0, "a mangueira no carro: cobra seis e meio"],
  [T.z1, [3.6, 2.9, 11.5], W1, [3.9, 2.9, 11], W1, 44, 42, -1, 1, "Resolveu? (operário)"],
  [T.diferenca, [-2.5, 3.6, 14.2], [L[0], 3.0, L[2]], [-2.8, 3.6, 13.6], [L[0], 3.0, L[2]], 44, 42, 0, 0, "o litro: a parte com dono e o real do posto"],
  [T.umReal2, [-2.4, 6.0, 12.5], [L[0], 5.0, L[2]], [-2.7, 6.0, 12.0], [L[0], 5.0, L[2]], 44, 42, 0, 0, "o real de ouro, de perto"],
  [T.da, [16, 8, 22], [2, 3, -6], [15, 8.4, 21], [2, 3, -6], 56, 54, 0, 0, "a pilha do dia voa embora; ficam 2.800"],
  [T.desse, [-2.6, 5.0, 16], [-3.0, 3.6, 2.5], [-2.4, 5.1, 15.4], [-3.0, 3.6, 2.5], 54, 52, 0, 0, "as contas do posto: o litro, a maquininha, o operário"],
  [T.frentista, [3.4, 2.9, 9.8], W1, [3.2, 2.9, 9.4], W1, 42, 40, 0, 0, "as moedas chegam ao frentista"],
  [T.luz, [2, 2.2, 9], [0, 5.5, -4], [1.8, 2.3, 8.6], [0, 5.5, -4], 52, 50, 0, 0, "as luzes da cobertura acendem; a loja"],
  [T.maquininha, [-1.0, 3.8, 9.5], [MAQ[0], 2.8, MAQ[2]], [-1.2, 3.8, 9.0], [MAQ[0], 2.8, MAQ[2]], 46, 44, 0, 0, "a maquininha morde a moeda"],
  [T.lucro, [-2.2, 4.2, 14.5], [L[0], 3.4, L[2]], [-2.5, 4.2, 14], [L[0], 3.4, L[2]], 44, 42, 0, 0, "o litro: o ouro encolheu (lucro bruto)"],
  [T.z2, [-0.6, 2.9, 10.5], W1, [-0.3, 2.9, 10], W1, 44, 42, 1, -1, "Resolveu? (operário, do outro lado)"],
  [T.pra, [6.5, 3.2, 6.5], [1.6, 1.4, -1], [6.1, 3.1, 6.1], [1.6, 1.4, -1], 46, 44, 0, 0, "o operário enche o tanque"],
  [T.voce, [5, 4, 12], [1.5, 2.5, -1], [4.6, 4.1, 11.4], [1.5, 2.5, -1], 50, 48, 0, 0, "o dinheiro do tanque sai do carro"],
  [T.postoFica, [3.6, 2.9, 10.5], [PUMP[0] + 1.2, 2.6, PUMP[2] + 1.2], [3.3, 2.9, 10], [PUMP[0] + 1.2, 2.6, PUMP[2] + 1.2], 44, 42, 0, 0, "ao posto ficam uns cinquenta"],
  [T.resto, [-1.5, 6.5, 16], [L[0], 5.0, L[2]], [-1.9, 7.0, 16.5], [L[0], 6.0, L[2]], 50, 54, 0, 0, "o resto: o cinza vira fatias que voam para os donos"],
  [T.so, [C[0] - 0.8, 4.4, C[2] + 15], [C[0] - 0.8, 5.0, C[2]], [C[0] - 0.8, 4.5, C[2] + 14.4], [C[0] - 0.8, 5.0, C[2]], 44, 42, 0, 0, "a coluna do ICMS"],
  [T.postoDist, [C[0], 4.6, C[2] + 15], [C[0], 5.0, C[2]], [C[0] + 0.2, 4.8, C[2] + 14], [C[0], 5.2, C[2]], 44, 42, 0, 0, "posto + distribuidora ao lado: a régua"],
  [T.juntos, [C[0] - 0.35, 7.0, C[2] + 4.4], [C[0] - 0.35, 6.95, C[2]], [C[0] - 0.35, 7.0, C[2] + 4.1], [C[0] - 0.35, 6.95, C[2]], 40, 40, 0, 0, "o topo das duas: o vermelho passa da régua"],
  [T.agoraSim, [-2.5, 3.8, 12.5], [2.2, 1.6, -2.5], [-2.2, 3.9, 12], [3.0, 1.6, -3.5], 50, 48, 0, 0, "Agora sim: o operário comemora, o carro sai"],
  [T.quanto2, [4.4, 3.1, 12.5], W1, [4.0, 3.2, 11.5], W1, 44, 42, 0, 0, "a pergunta: o operário aponta para quem assiste"],
  [T.soLucro, [2.5, 9, 28], [HOLE[0] - 4, 1, HOLE[2] - 8], [2, 18, 46], [-1, 1, -6], 54, 56, 0, 0, "recuando e subindo: o remendo do buraco na estrada"],
];
const linCam = (i: number) => (t: number): CamState => {
  const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, x = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), u = sstep(x) * 0.6 + 0.4 * x;
  const Lr = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
  return { pos: Lr(r[1], r[3]), look: Lr(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) };
};
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) }));
const DYN = [1.2, 1.2, 1.4, 1.2, 1, 1, 1.4, 1.2, 1, 1, 1.2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const TO_LIT = -0.75, FRONT = 0.35, AT_PUMP: V3 = [PUMP[0] + 1.25, SIDE[1], PUMP[2] + 1.2];
const WORKER: [number, WorkerState][] = [
  [0, S(SIDE, FRONT, "present")],
  [T.mas, S(SIDE, FRONT, "think")],
  [T.litro, S(SIDE, TO_LIT, "point")],
  [T.chefe, S(SIDE, FRONT, "alarm")],
  [T.deixa, S(SIDE, TO_LIT, "point")],
  [T.cobra, S(SIDE, FRONT, "present")],
  [T.z1, S(SIDE, FRONT, "think")],
  [T.diferenca, S(SIDE, TO_LIT, "point")],
  [T.desse, S(SIDE, FRONT, "present")],
  [T.frentista + 0.3, S(SIDE, FRONT, "cheer")],
  [T.maquininha + 0.2, S(SIDE, TO_LIT, "alarm")],
  [T.lucro, S(SIDE, FRONT, "think")],
  [T.tanque - 0.3, S(AT_PUMP, Math.PI / 2, "pour")],
  [T.postoFica + 0.6, S(AT_PUMP, 0.2, "present")],
  [T.resto, S(SIDE, FRONT, "think")],
  [T.so, S(SIDE, TO_LIT, "point")],
  [T.agoraSim, S(SIDE, FRONT, "cheer")],
  // o crítico: o gesto não aparecia. Braços abertos na pergunta («e aí?»); no «comenta aí» aponta para quem assiste, até o recuo final
  [T.quanto2 - 0.35, S(SIDE, 0.15, "present")],
  [T.comenta, S(SIDE, 1.25, "pointHi")],
];

const hud: HudData = {
  // números de e16-posto/FONTES.md § 0 (ANP, Brasil, 08–14/11/2026; posto = revenda − distribuição da mesma semana, ago–set)
  pills: [
    { a: -0.35, b: T.mas - 0.1, label: "UM POSTO · ENTRA NO CAIXA", y: 440, hi: true, tone: "green" }, // o número vai grande no título
    { a: T.seis, b: T.medio - 0.1, label: "1 LITRO", value: () => "≈ R$ 6,48", y: 440, hi: true, tone: "gold" },
    { a: T.segundo, b: T.medio - 0.1, label: "FONTE: ANP", value: () => "MÉDIA BRASIL", y: 560, hi: true, tone: "dark" },
    { a: T.vende + 0.2, b: T.chefe - 0.1, label: "POSTO MÉDIO", value: () => "≈ 2.800 L/DIA", y: 440, hi: true, tone: "gold" },
    { a: T.vende + 0.5, b: T.dois2 - 0.1, label: "CONTA COM DADOS DA ANP", y: 560, hi: true, tone: "dark" },
    { a: T.dois2 + 0.2, b: T.chefe - 0.1, label: "2.800 L × R$ 6,48", y: 560, hi: true, tone: "dark" },
    { a: T.dezoito2, b: T.chefe - 0.1, label: "=", value: () => "R$ 18 MIL POR DIA", y: 680, hi: true, tone: "green" },
    { a: T.paga + 0.3, b: T.z1 - 0.1, label: "PAGA À DISTRIBUIDORA", value: () => "≈ R$ 5,50", y: 440, hi: true, tone: "dark" },
    { a: T.cobra + 0.3, b: T.z1 - 0.1, label: "COBRA NA BOMBA", value: () => "≈ R$ 6,48", y: 560, hi: true, tone: "gold" },
    { a: T.diferenca + 0.8, b: T.desse - 0.1, label: "FICA PRO POSTO", value: () => "≈ R$ 1 POR LITRO", y: 440, hi: true, tone: "gold" },
    { a: T.da + 0.2, b: T.desse - 0.1, label: "NO DIA", value: () => "≈ R$ 2.800", y: 560, hi: true, tone: "gold" },
    { a: T.lucro + 0.1, b: T.z2 - 0.1, label: "LUCRO BRUTO", y: 440, hi: true, tone: "gold" },
    { a: T.antes, b: T.z2 - 0.1, label: "ANTES DAS CONTAS", y: 560, hi: true, tone: "dark" },
    { a: T.tanque + 0.2, b: T.resto - 0.1, label: "TANQUE · 50 L × R$ 6,48", value: () => "≈ R$ 324", y: 440, hi: true, tone: "dark" },
    { a: T.postoFica + 0.3, b: T.resto - 0.1, label: "PRO POSTO", value: () => "≈ R$ 50", y: 560, hi: true, tone: "gold" },
    // o resto tem dono: cada fatia que voa ganha nome (o crítico: sem rótulo, ninguém sabe o que está vendo)
    { a: T.resto + 0.35, b: T.so - 0.1, label: "REFINARIA", value: () => "R$ 2,17", y: 400, hi: true, tone: "gold" },
    { a: T.resto + 0.55, b: T.so - 0.1, label: "USINA (ETANOL)", value: () => "R$ 1,15", y: 516, hi: true, tone: "green" },
    { a: T.resto + 0.75, b: T.so - 0.1, label: "ICMS (ESTADO)", value: () => "R$ 1,57", y: 632, hi: true, tone: "red" },
    { a: T.resto + 0.95, b: T.so - 0.1, label: "FEDERAL", value: () => "R$ 0,06", y: 748, hi: true, tone: "wine" },
    { a: T.resto + 1.15, b: T.so - 0.1, label: "DISTRIBUIDORA · CONTA NOSSA", value: () => "≈ R$ 0,50", y: 864, hi: true, tone: "blue" },
    { a: T.so + 0.3, b: T.agoraSim - 0.1, label: "ICMS (ESTADO)", value: () => "R$ 1,57", y: 440, hi: true, tone: "red" },
    { a: T.postoDist, b: T.agoraSim - 0.1, label: "POSTO + DISTRIBUIDORA", value: () => "R$ 1,53", y: 560, hi: true, tone: "gold" },
  ],
  // o 1º título já cheio no quadro 0 (o crítico: o número do gancho não pesava numa pílula pequena); o «1,57 > 1,53» diz a comparação
  titles: ([[-0.4, "R$ 18 MIL POR DIA", 96], [T.mas, "QUANTO FICA PRO POSTO?"], [T.paga, "DISTRIBUIDORA"], [T.desse, "AS CONTAS DO POSTO"], [T.pra, "NO SEU TANQUE"], [T.resto, "O RESTO TEM DONO"], [T.postoDist + 0.5, "1,57 > 1,53"]] as [number, string, number?][])
    .map(([a, text, size], i, all) => ({ a, text, size, len: Math.min(3.0, (all[i + 1]?.[0] ?? T.agoraSim) - a - 0.12, a < T.agoraSim ? T.agoraSim + 0.25 - a : 9) })),
  alerts: [], // o ⚠ só faz sentido num problema; aqui o «Chefe» é uma pergunta
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2]],
  reward: { a: T.agoraSim + 0.3, len: T.quanto2 - 0.15 - (T.agoraSim + 0.3), top: "AGORA SIM:", big: () => "RESOLVIDO!", sub: "R$ 1 POR LITRO", bounces: [T.resolvido + 0.2] },
  stampQ: "RESOLVEU?", stampA: "AINDA NÃO",
  Extra: ({ t }) => <Pergunta t={t} />,
};

/** a pergunta do comentário na tela quando ela é dita */
const Pergunta: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.quanto2, T.end + 1, 0.25); if (k <= 0) return null;
  const s = pop(t, T.quanto2, 0.4);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
      <span style={{ fontFamily: FONT, fontSize: 80, color: "#ffffff", lineHeight: 1.05, ...stroke(12) }}>QUANTO VOCÊ ACHAVA</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>QUE FICAVA</span>
      <span style={{ fontFamily: FONT, fontSize: 104, color: "#ffd400", lineHeight: 1.05, ...stroke(13, "#3a2300") }}>PRO POSTO?</span>
      <span style={{ fontFamily: FONT, fontSize: 78, color: "#ffffff", lineHeight: 1.3, ...stroke(11) }}>COMENTA O SEU PALPITE</span>
    </div>
  );
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 120, fogFar: 520, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
