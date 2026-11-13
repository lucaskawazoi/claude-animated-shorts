// Mundo do E12: Stonehenge de brinquedo na planície. Círculo de 30 pilares (raio 10) com dintéis, ferradura de 5 trilitos,
// círculo de pedras azuis, banco e fosso (raio 15,5), avenida e Heel Stone no eixo do solstício (o eixo aponta para −z).
// O par herói (pilares 0 e 1, em +z) é o canteiro: a pedra chega de trenó pela tangente (−x), cai no buraco com parede em rampa
// (corte em seção no plano 4) e é endireitada com cordas; o dintel sobe numa torre de troncos (por fora, +z) e encaixa nos salientes.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { Costume, Crowd, PoseName } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { FALL0, FALL1, FLY_AT, JUMP0, JUMPD, JUMPN, NOGO, NSTEP, PULL0, RUL0, RUN0, RUN1, SLIDE0, SLIP, T, TS, XCUTS, stepAt } from "./cues";
import { OPEN } from "./open";

const PI = Math.PI, D2R = PI / 180;
const [, , C3, C4, C5, C6, C7] = CUTS;
export const R = 10, UH = 4.1, UW = 1.3, UD = 0.9, LH = 0.75;
const SAR = "#c3bba8", SAR2 = "#aca592", SAR3 = "#d2cbb9", BLUE = "#7d93ab", TURF = "#79b84a", SOIL = "#7a5a3a", CHALK = "#ece7d8", WOOD = "#9a6a3a", WOOD2 = "#7f5530";
export const NEO: Costume = { skin: "#d39a6c", top: "#a8825a", bottom: "#7a5a3a", kilt: "#6e5034", kiltLen: 0.5, hat: "none", hatC: "#000", boot: "#5a3a24", belt: "#d8c49a", sleeves: true };
const NEO2: Costume = { ...NEO, top: "#8c6c4a", kilt: "#5e4630", skin: "#c48a5e" };
const GHOST = { opacity: 0.42, depthWrite: false, emissive: "#ffd400", ei: 0.55 };

// ---------------------------------------------------------------- referenciais
// o vão do eixo do solstício (entre os pilares 15 e 16, em −z) é mais largo — como a entrada real — para o sol caber nele
const slotA = (i: number) => (96 - 12 * i + (i === 15 ? 2.5 : i === 16 ? -2.5 : 0)) * D2R;
/** dintel i (entre os pilares i e i+1): ângulo do meio, meia-abertura */
const lintelArc = (i: number) => { const a1 = slotA(i), h = ((((a1 - slotA((i + 1) % 30)) % (2 * PI)) + 2 * PI) % (2 * PI)) / 2; return { am: a1 - h, h }; };
export const slotP = (i: number): V3 => [R * Math.cos(slotA(i)), 0, R * Math.sin(slotA(i))];
const slotRY = (i: number) => PI / 2 - slotA(i);
const A0 = slotA(0);
const TAN: V3 = [Math.sin(A0), 0, -Math.cos(A0)], RAD: V3 = [Math.cos(A0), 0, Math.sin(A0)];
export const HERO = slotP(0), HERO_RY = slotRY(0);
/** ponto no referencial do pilar herói: x = tangente (para o pilar 1), y = altura, z = radial (para fora do círculo) */
export const HL = (x: number, y: number, z: number): V3 => [HERO[0] + x * TAN[0] + z * RAD[0], y, HERO[2] + x * TAN[2] + z * RAD[2]];
const toHL = (x: number, z: number): [number, number] => { const dx = x - HERO[0], dz = z - HERO[2]; return [dx * TAN[0] + dz * TAN[2], dx * RAD[0] + dz * RAD[2]]; };

// ---------------------------------------------------------------- fases
const sinkT = (t: number, k: number) => ease(t, T.inglaterra + 0.05 + k * 0.6, T.inglaterra + 0.5 + k * 0.6); // ⏪: tudo afunda
const hook = (t: number) => t < T.inglaterra + 1.3;
const site = (t: number) => t >= C3; // canteiro (do plano 4 em diante)
export const sectionOn = (t: number) => t >= XCUTS[4] && t < XCUTS[5]; // corte em seção (câmera abaixo do chão): só «cavan… rampa»
const LATE = [2, 3, 4, 26, 27, 28, 29]; // pilares que só sobem na onda final (o lado do canteiro fica livre)
const FAR = (i: number) => (i >= 5 && i <= 25) || i === 1;
const WA = T.juntas + 0.1, WB = T.giro - 0.2;
const waveAt = (i: number) => lerp(WA, WB, LATE.indexOf(i) / (LATE.length - 1));
const triAt = (j: number) => WA + 0.15 + j * 0.2;
const rise = (t: number, a: number) => ease(t, a, a + 0.45);
/** estado de um pilar do círculo: deslocamento vertical (afundado = −) e visível */
const slotState = (i: number, t: number) => {
  if (hook(t)) return { dy: -(UH + LH + 0.4) * sinkT(t, i / 30), on: sinkT(t, i / 30) < 1 };
  if (!site(t)) return { dy: 0, on: false };
  if (FAR(i)) return { dy: 0, on: true };
  if (LATE.includes(i)) { const u = rise(t, waveAt(i)); return { dy: -(UH + 0.2) * (1 - u), on: u > 0.01 }; }
  return { dy: 0, on: false };
};
const lintelDrop = (i: number, t: number) => {
  // dintel i: entre os pilares i e i+1. Na onda, cai de cima depois que os dois pilares subiram
  const j = (i + 1) % 30;
  if (hook(t)) { const s = slotState(i, t); return { dy: s.dy + dropA(ringOrder(i), t), on: s.on }; }
  if (!site(t) || i === 0) return { dy: 0, on: false };
  if (FAR(i) && FAR(j) && i !== 0) return { dy: 0, on: true };
  const a = Math.max(LATE.includes(i) ? waveAt(i) : 0, LATE.includes(j) ? waveAt(j) : 0) + 0.35, u = ease(t, a, a + 0.35);
  return { dy: 2.6 * (1 - u), on: u > 0.01 };
};

// ---------------------------------------------------------------- as três aberturas (0 → «algunas», corte duro)
const OPEN_END = T.algunas;
/** abertura a: o monumento pronto e os dintéis CAINDO do céu em onda (o grande trilito primeiro, quadro 0 já em queda) */
const landA = (order: number) => 0.33 + order * 0.1;
const dropA = (order: number, t: number) => {
  if (OPEN !== "a" || t > OPEN_END + 0.1) return 0;
  const l = landA(order), H = 5.0, s = (t - (l - 0.36)) / 0.36;
  if (s < 0) return H + 0.15 * Math.sin(t * 9 + order);
  if (s < 1) return H * (1 - s * s);
  const a = t - l; return a < 0.6 ? 0.35 * Math.abs(Math.sin((a * PI) / 0.2)) * Math.exp(-a * 7) : 0;
};
const ringOrder = (i: number) => 1 + Math.min(i, 29 - i) * 0.95; // dintel i: da frente (par herói, +z) para os dois lados
const triOrder = (j: number) => (j === 0 ? 0 : 1.6 + j * 0.9);
const DustA: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "a" || t > OPEN_END) return null;
  const spots: [V3, number][] = [[[0, 7.2, 5.4], landA(0)], ...[0, 1, 29, 2, 28].map((i): [V3, number] => { const am = slotA(i) - 6 * D2R; return [[R * Math.cos(am), UH + 0.3, R * Math.sin(am)], landA(ringOrder(i))]; })];
  return <G>{spots.map(([p, l], k) => <Puffs key={k} t={t} p={p} n={6} period={0.5} rise={0.7} size={0.45} c="#e8e2d2" drift={[0.6, 0, 0.3]} on={t > l && t < l + 0.45 ? 1 : 0} />)}</G>;
};
/** abertura b: a pedra vem de trenó sobre troncos, puxada por duas filas, direto para a câmera — o operário vai em cima */
export const dragZ = (t: number) => 23.6 + 1.7 * t;
const OpenDrag: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "b" || t >= OPEN_END) return null;
  const z = dragZ(t), front = z + 3.7;
  const crew = [-1.75, 1.75].flatMap((x, r) => Array.from({ length: 5 }, (_, j) => ({ p: [x, 0, front + 1.4 + j * 1.15] as V3, yaw: 0, pose: "pull" as PoseName, ph: j * 0.37 + r * 0.2 })));
  return (
    <G>
      {/* (filas abertas e o operário na traseira: a cara da pedra aparece entre elas) */}
      {Array.from({ length: 14 }, (_, k) => <Cyl key={k} rt={0.13} h={2.4} p={[0, 0.13, 19.5 + 1.5 * k]} r={[(z - 23.6) / 0.13, 0, PI / 2]} c={k % 2 ? WOOD : WOOD2} seg={7} />)}
      <G p={[0, 0, z]}>
        {[-0.8, 0.8].map((x) => <Box key={x} s={[0.26, 0.18, 7.4]} p={[x, 0.33, 0]} c={WOOD2} />)}
        {[-3.0, -1.5, 0, 1.5, 3.0].map((bz) => <Box key={bz} s={[2.0, 0.1, 0.3]} p={[0, 0.4, bz]} c={WOOD} />)}
        <Box s={[2.0, 1.3, 7.0]} p={[0, 1.1, 0]} c={SAR} />
        <Box s={[1.9, 1.24, 0.12]} p={[0, 1.1, 3.5]} c={SAR3} cast={false} />
      </G>
      {[-1, 1].map((sx) => <Pipe key={sx} a={[sx * 0.7, 0.55, front]} b={[sx * 1.75, 1.05, front + 1.4 + 4 * 1.15 + 0.5]} rad={0.045} c="#c9a466" cast={false} />)}
      <Crowd list={crew} t={t} c={NEO2} />
      <Puffs t={t} p={[0, 0.05, front - 0.3]} n={6} period={0.6} rise={0.6} size={0.35} c="#d8c8a8" drift={[0, 0, -1.2]} />
    </G>
  );
};
/** abertura c (a padrão, escolhida pelo crítico): o operário sozinho empurra um monólito de 30 t em pé — já no meio do
 *  esforço no quadro 0, os pés escorregam (pó), ele voa para trás (✖) e a pedra nem se mexe; uma pedrinha cai do topo na cabeça dele.
 *  O monólito fica à esquerda do círculo (x = CX) para o círculo aparecer inteiro no fundo. */
export const CX = -5.5, MH = 3.8;
const OP0 = CX - 0.6 - 0.5; // onde ele empurra (encostado na face −x do monólito)
export const pushX = (t: number) => OP0 - 0.12 * ease(t, 0, 0.12) - 0.18 * ease(t, 0.38, 0.5) - 0.2 * ease(t, 0.66, 0.78) - 1.5 * ease(t, 0.93, 1.28);
export const pushY = (t: number) => (t > 0.93 && t < 1.28 ? 0.7 * Math.sin(PI * prog(t, 0.93, 1.28)) : 0);
export const PEBBLE = 1.75; // a pedrinha acerta a cabeça
const OpenPush: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "c" || t >= OPEN_END) return null;
  const sh = t < 0.9 ? 0.015 * Math.sin(t * 50) : 0, land = OP0 - 2.0;
  // pedrinha: solta do topo em 1,45, acerta a cabeça em PEBBLE, quica para trás
  const pb = t < 1.45 ? null : t < PEBBLE ? (() => { const u = prog(t, 1.45, PEBBLE); return [lerp(CX - 0.4, land, u), lerp(MH + 0.1, 1.95, u) + 0.6 * Math.sin(PI * u), 27] as V3; })()
    : (() => { const u = prog(t, PEBBLE, PEBBLE + 0.3); return [land - 0.7 * u, 1.95 * (1 - u) + 0.5 * Math.sin(PI * u) + 0.12, 27] as V3; })();
  return (
    <G>
      <Box s={[1.2, MH, 1.2]} p={[CX + sh, MH / 2, 27]} c={SAR} />
      <Box s={[1.1, 0.12, 1.1]} p={[CX + sh, MH, 27]} c={SAR3} cast={false} />
      <Puffs t={t} p={[pushX(t) - 0.2, 0.05, 27]} n={7} period={0.4} rise={0.6} size={0.34} c="#d8c8a8" drift={[-0.9, 0, 0]} on={t < 0.92 ? 1 : 0} />
      <Puffs t={t} p={[CX - 0.6, 0.05, 27.3]} n={5} period={0.5} rise={0.4} size={0.25} c="#e2d6bc" drift={[-0.4, 0, 0.3]} on={t < 0.6 ? 1 : 0} o={0.3} />
      <Puffs t={t} p={[land, 0.05, 27]} n={7} period={0.5} rise={0.8} size={0.4} c="#d8c8a8" on={t > 1.24 && t < 1.75 ? 1 : 0} />
      {pb ? <Sph rad={0.27} p={pb} c={SAR3} ws={8} hs={6} /> : null}
      {t > PEBBLE && t < OPEN_END ? Array.from({ length: 4 }, (_, i) => { const a = t * 7 + (i * PI) / 2; return <Sph key={i} rad={0.09} p={[land + 0.45 * Math.cos(a), 2.15 + 0.08 * Math.sin(a * 2), 27 + 0.45 * Math.sin(a)]} c="#ffe14a" o={{ emissive: "#ffcc00", ei: 0.9 }} cast={false} ws={6} hs={4} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- ✖ grande em 3D e os objetos que «no hay»
/** ✖ grande virado para a câmera (cam no mesmo referencial de p): bate grande, assenta tremendo e some em b */
const XMark: React.FC<{ t: number; a: number; b: number; p: V3; cam: V3; size?: number }> = ({ t, a, b, p, cam, size = 2.2 }) => {
  if (t < a || t > b) return null;
  const dx = cam[0] - p[0], dy = cam[1] - p[1], dz = cam[2] - p[2], yaw = Math.atan2(dx, dz), pitch = -Math.atan2(dy, Math.hypot(dx, dz));
  const s = ((1 + 0.6 * (1 - ease(t, a, a + 0.14))) * (1 - ease(t, b - 0.1, b)) * size) / 2.2, wob = 0.14 * Math.sin((t - a) * 16) * Math.exp(-(t - a) * 4);
  return (
    <G p={p} r={[0, yaw, 0]}><G r={[pitch, 0, wob]} sc={Math.max(0.001, s)}>
      {[1, -1].map((k) => <G key={k} r={[0, 0, (k * PI) / 4]}>
        <Box s={[2.46, 0.52, 0.06]} p={[0, 0, -0.06]} c="#14202b" cast={false} />
        <Box s={[2.3, 0.36, 0.1]} c="#ff2d2d" o={{ emissive: "#ff2020", ei: 0.6 }} cast={false} />
      </G>)}
    </G></G>
  );
};
/** «no hay motores, ni ruedas, ni grúas»: perto da câmera do acampamento um motor cai do céu, uma roda entra rolando e tomba,
 *  uma grua brota do chão — cada um leva um ✖ grande e some num puf. Grupo virado para a câmera: x = direita da tela, z = para ela */
const NG_O: V3 = [-35.2, 0, 2.1], NG_CAM: V3 = [-40.4, 3.2, 6.0], NG_YAW = Math.atan2(NG_CAM[0] - NG_O[0], NG_CAM[2] - NG_O[2]);
const NG_C: V3 = [0, 3.2, Math.hypot(NG_CAM[0] - NG_O[0], NG_CAM[2] - NG_O[2])]; // a câmera no referencial do grupo
const poof = (t: number, a: number) => Math.max(0.001, 1 - ease(t, a, a + 0.15));
const YEL = "#f0b020", STEEL = "#5f6b75";
const NoGo: React.FC<{ t: number }> = ({ t }) => {
  const { m, w, g } = NOGO; if (t < m - 0.35 || t > g + 1.0) return null;
  const ms = prog(t, m - 0.31, m), ma = t - m, my = ms < 1 ? 7 * (1 - ms * ms) : ma < 0.5 ? 0.35 * Math.abs(Math.sin((ma * PI) / 0.2)) * Math.exp(-ma * 7) : 0;
  const wx = 4.5 * (1 - ease(t, w - 0.3, w)), tip = -(PI / 2 - 0.1) * ease(t, w + 0.13, w + 0.36), gy = outBack(prog(t, g - 0.25, g));
  return (
    <G p={NG_O} r={[0, NG_YAW, 0]}>
      {t > m - 0.31 && t < m + 0.75 ? <G p={[0, my, 0]} sc={poof(t, m + 0.57)}>
        <Box s={[2.1, 1.25, 1.2]} p={[0, 0.7, 0]} c={STEEL} />
        {[-0.7, -0.23, 0.23, 0.7].map((x) => <Box key={x} s={[0.16, 0.3, 1.1]} p={[x, 1.45, 0]} c="#8f9aa3" />)}
        <G p={[0.45, 0.7, 0.66]} r={[0, 0, t * 9]}><Cyl rt={0.5} h={0.14} r={[PI / 2, 0, 0]} c="#d23b2b" />{Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.2, 0.22, 0.14]} p={[0.58 * Math.cos(i * PI / 3), 0.58 * Math.sin(i * PI / 3), 0]} r={[0, 0, i * PI / 3]} c="#d23b2b" />)}<Cyl rt={0.14} h={0.18} r={[PI / 2, 0, 0]} c="#ffd400" /></G>
        <Cyl rt={0.12} h={0.8} p={[-0.65, 1.7, -0.2]} c="#333a40" seg={8} />
        <Puffs t={t} p={[-0.65, 2.1, -0.2]} n={5} period={0.5} rise={0.8} size={0.24} c="#5a5f66" drift={[0.3, 0, 0]} />
      </G> : null}
      <Puffs t={t} p={[0, 0.05, 0]} n={7} period={0.45} rise={0.7} size={0.42} c="#e2d6bc" on={t > m && t < m + 0.4 ? 1 : 0} />
      {t > w - 0.3 && t < w + 0.65 ? <G p={[wx, 0, 0]} r={[tip, 0, 0]} sc={poof(t, w + 0.48)}>
        <G p={[0, 1.2, 0]} r={[0, 0, -wx / 1.2]}>
          <mesh castShadow material={mat("#8a5a2e")}><torusGeometry args={[1.08, 0.18, 8, 24]} /></mesh>
          {[0, 1, 2, 3].map((i) => <Box key={i} s={[2.16, 0.13, 0.13]} r={[0, 0, (i * PI) / 4]} c="#7a4e26" />)}
          <Cyl rt={0.18} h={0.3} r={[PI / 2, 0, 0]} c="#5a3a24" />
        </G>
      </G> : null}
      {t > g - 0.25 && t < g + 0.9 ? <G sc={[poof(t, g + 0.72), Math.max(0.001, gy) * poof(t, g + 0.72), poof(t, g + 0.72)]}>
        <Box s={[1.0, 0.15, 1.0]} p={[-0.2, 0.075, 0]} c="#555" />
        <Box s={[0.3, 2.7, 0.3]} p={[-0.2, 1.35, 0]} c={YEL} />
        {[0.5, 1.1, 1.7].map((y) => <Box key={y} s={[0.34, 0.06, 0.34]} p={[-0.2, y, 0]} c="#3a2a10" cast={false} />)}
        <Box s={[2.6, 0.22, 0.24]} p={[0.75, 2.7, 0]} c={YEL} /><Box s={[0.9, 0.22, 0.24]} p={[-0.9, 2.7, 0]} c={YEL} />
        <Box s={[0.42, 0.42, 0.42]} p={[-1.22, 2.44, 0]} c="#555" /><Box s={[0.45, 0.4, 0.4]} p={[-0.2, 2.42, 0.02]} c="#e05030" />
        <G p={[1.8, 2.6, 0]} r={[0, 0, 0.25 * Math.sin(t * 6)]}><Box s={[0.03, 0.9, 0.03]} p={[0, -0.45, 0]} c="#222" cast={false} /><Box s={[0.22, 0.2, 0.08]} p={[0, -0.95, 0]} c="#333" /></G>
      </G> : null}
      {[[m, 0.75], [w, 0.75], [g, 1.3]].map(([a, y], i) => <Puffs key={i} t={t} p={[0, y, 0.2]} n={8} period={0.4} rise={0.5} size={0.5} c="#ffffff" drift={[0, 0, 0]} on={t > a + [0.57, 0.48, 0.72][i] && t < a + [0.57, 0.48, 0.72][i] + 0.35 ? 1 : 0} />)}
      <XMark t={t} a={m + 0.07} b={m + 0.62} p={[0, 0.75, 0.8]} cam={NG_C} size={1.6} />
      <XMark t={t} a={w + 0.08} b={w + 0.53} p={[0, 1.0, 0.8]} cam={NG_C} size={1.6} />
      <XMark t={t} a={g + 0.07} b={g + 0.77} p={[0.3, 1.5, 0.8]} cam={NG_C} size={1.7} />
    </G>
  );
};

/** o operário corre da planície vazia até a câmera («hace unos cuatro mil quinientos años») */
export const RUN_A: V3 = [-3.0, 0, -0.5], RUN_B: V3 = [-10.6, 0, -8.0];
export const runP = (t: number): V3 => { const u = 0.5 - 0.5 * Math.cos(PI * prog(t, RUN0, RUN1)); return [lerp(RUN_A[0], RUN_B[0], u), 0, lerp(RUN_A[2], RUN_B[2], u)]; };
const RunDust: React.FC<{ t: number }> = ({ t }) => {
  if (t < RUN0 || t > RUN1 + 0.5) return null;
  const p = runP(t);
  return <G><Puffs t={t} p={[p[0], 0.05, p[2]]} n={6} period={0.35} rise={0.5} size={0.3} c="#d8c8a8" drift={[0.9, 0, 0.9]} on={t < RUN1 ? 1 : 0} />
    <Puffs t={t} p={[RUN_B[0], 0.05, RUN_B[2]]} n={7} period={0.45} rise={0.7} size={0.45} c="#d8c8a8" drift={[0.5, 0, 0.5]} on={t > RUN1 - 0.12 && t < RUN1 + 0.4 ? 1 : 0} /></G>;
};

// ---------------------------------------------------------------- chão com o buraco do pilar herói
const HOLE: [number, number][] = [[-3.0, -0.7], [1.0, -0.7], [1.0, 0.7], [-3.0, 0.7]];
/** onde não vai tufo de grama nem mancha: o buraco, o pátio de obra e o chão que a câmera da seção atravessa */
const yard = (x: number, z: number) => { const [lx, lz] = toHL(x, z); return lx > -10 && lx < 7.5 && lz > -1.6 && lz < 13; };
const Ground: React.FC = () => {
  const geo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-450, -300); s.lineTo(450, -300); s.lineTo(450, 300); s.lineTo(-450, 300); s.closePath();
    const h = new THREE.Path(); HOLE.forEach(([x, z], i) => { const p = HL(x, 0, z); if (i) h.lineTo(p[0], -p[2]); else h.moveTo(p[0], -p[2]); }); h.closePath(); s.holes.push(h);
    return new THREE.ShapeGeometry(s);
  }, []);
  const patches = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ p: [lerp(-90, 90, rnd(i * 3 + 1)), 0.01 + (i % 5) * 0.002, lerp(-90, 60, rnd(i * 3 + 2))] as V3, s: lerp(3, 11, rnd(i * 3 + 3)), c: ["#6fae42", "#86c255", "#68a83e"][i % 3] })).filter((q) => !yard(q.p[0], q.p[2])), []);
  const blades = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; pts.length < 900 && i < 4000; i++) { const x = lerp(-70, 70, rnd(i * 5 + 1)), z = lerp(-80, 50, rnd(i * 5 + 2)); if (!yard(x, z) && Math.hypot(x, z) > 2) pts.push([x, z]); }
    const m = new THREE.InstancedMesh(new THREE.ConeGeometry(0.15, 0.45, 3), mat("#4f8f34", { flat: true }), pts.length), d = new THREE.Object3D();
    pts.forEach(([x, z], i) => { d.position.set(x, 0.18, z); d.scale.setScalar(lerp(0.6, 1.5, rnd(i * 7 + 3))); d.rotation.y = rnd(i * 7 + 4) * 6; d.updateMatrix(); m.setMatrixAt(i, d.matrix); });
    m.receiveShadow = true; return m;
  }, []);
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} receiveShadow geometry={geo} material={mat(TURF)} />
      {patches.map((q, i) => <mesh key={i} position={q.p} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.s, 18]} /></mesh>)}
      {/* pátio de obra pisado em volta do par herói */}
      {/* (não pode cobrir o buraco do herói, em z local ±0,7) */}
      <mesh position={HL(-1.5, 0.012, 8.4)} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#9cb860")}><circleGeometry args={[7.2, 28]} /></mesh>
      <primitive object={blades} />
    </G>
  );
};

/** banco e fosso circulares (mais antigos que as pedras) com a entrada no eixo (NE, −z) e a do sul — que é por onde a câmera
 *  da seção olha: o banco meio enterrado ficaria na frente da face do buraco. Arco do ângulo b0 ao b1 (de +x para +z). */
const BANK: [number, number][] = [[-PI / 2 + 0.22, 1.5], [2.3, 1.5 * PI - 0.22]]; // a câmera da seção olha entre 96° e 124°
const Earthworks: React.FC = () => (
  <G>
    {BANK.map(([b0, b1]) => <G key={b0}>
      <mesh rotation={[-PI / 2, 0, -b1]} scale={[1, 1, 0.4]} receiveShadow castShadow material={mat("#86c255")}><torusGeometry args={[15.5, 0.8, 6, 48, b1 - b0]} /></mesh>
      <mesh position={[0, 0.014, 0]} rotation={[-PI / 2, 0, -b1]} receiveShadow material={mat("#5c9a38")}><ringGeometry args={[16.4, 17.8, 48, 1, 0, b1 - b0]} /></mesh>
    </G>)}
    {[-3.2, 3.2].map((x) => <Box key={x} s={[0.9, 0.3, 64]} p={[x, 0.15, -50]} c="#86c255" cast={false} />)}
    <Box s={[1.8, 3.6, 1.4]} p={[3.2, 1.6, -24]} r={[0.14, 0.4, -0.1]} c={SAR2} />
  </G>
);

// ---------------------------------------------------------------- o círculo, os trilitos e as pedras azuis
const Upright: React.FC<{ s?: V3; c: string; tenons?: number; glow?: number }> = ({ s = [UW, UH, UD], c, tenons = 1, glow = 0 }) => (
  <G>
    <Box s={s} p={[0, s[1] / 2, 0]} c={c} />
    <Box s={[s[0] * 0.92, 0.12, s[2] * 0.9]} p={[0, s[1] - 0.04, 0]} c={SAR3} cast={false} />
    {tenons > 0.01 ? [-0.33, 0.33].map((x) => <Box key={x} s={[0.3, 0.22 * tenons, 0.3]} p={[x, s[1] + 0.11 * tenons, 0]} c={glow > 0 ? "#ffe680" : SAR3} o={glow > 0 ? { emissive: "#ffcc00", ei: 0.9 * glow } : undefined} cast={false} />) : null}
  </G>
);
const Ring: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: 30 }, (_, i) => {
      if (i === 0) return null; // o herói tem cena própria
      const s = slotState(i, t); if (!s.on) return null;
      const p = slotP(i);
      // o pilar 1 (vizinho do herói) só ganha os salientes quando «la tallan»
      return <G key={i} p={[p[0], s.dy, p[2]]} r={[0, slotRY(i), 0]}><Upright c={i % 3 ? SAR : SAR2} tenons={i === 1 ? knobGrow(t) : 1} glow={i === 1 ? win2(t, T.saliente - 0.1, T.encima + 0.1) : 0} /></G>;
    })}
    {Array.from({ length: 30 }, (_, i) => {
      if (i === 0) return null; // dintel herói: componente Lintel
      const l = lintelDrop(i, t); if (!l.on) return null;
      const { am, h } = lintelArc(i), rc = R * Math.cos(h);
      return <Box key={i} s={[2 * R * Math.sin(h) + 0.02, LH, UD]} p={[rc * Math.cos(am), UH + LH / 2 + l.dy, rc * Math.sin(am)]} r={[0, PI / 2 - am, 0]} c={i % 2 ? SAR2 : SAR} />;
    })}
  </G>
);
const TRI: [number, number, number][] = [[0, 5.4, 6.6], [52, 5.6, 6.0], [-52, 5.6, 6.0], [104, 5.9, 5.5], [-104, 5.9, 5.5]];
const Trilithons: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {TRI.map(([psi, r, h], j) => {
      let dy = 0, ld = 0, on = true;
      if (hook(t)) { const k = sinkT(t, 0.2 + j * 0.12); dy = -(h + 1.4) * k; on = k < 1; ld = dropA(triOrder(j), t); }
      else if (!site(t)) on = false;
      else { const u = rise(t, triAt(j)), v = ease(t, triAt(j) + 0.4, triAt(j) + 0.75); dy = -(h + 0.2) * (1 - u); ld = 2.6 * (1 - v); on = u > 0.01; }
      if (!on) return null;
      const a = psi * D2R;
      return (
        <G key={j} p={[r * Math.sin(a), dy, r * Math.cos(a)]} r={[0, a, 0]}>
          {[-0.74, 0.74].map((x) => <G key={x} p={[x, 0, 0]}><Upright s={[1.15, h, 1.0]} c={j % 2 ? SAR2 : SAR} tenons={0} /></G>)}
          <Box s={[2.9, 0.85, 1.0]} p={[0, h + 0.43 + ld, 0]} c={SAR} />
        </G>
      );
    })}
  </G>
);
const Bluestones: React.FC<{ t: number }> = ({ t }) => {
  const glow = ease(t, T.algunas - 0.1, T.algunas + 0.3) * (1 - ease(t, T.rueda, T.rueda + 0.4));
  return (
    <G>
      {Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * 2 * PI + 0.12; if (i === 19) return null; // a do eixo: a abertura do solstício fica livre
        let dy = 0, on = true;
        if (hook(t)) { const k = sinkT(t, 0.1 + i / 40); dy = -2.2 * k; on = k < 1; }
        else if (!site(t)) on = false;
        else { const u = rise(t, WA + 0.3 + i * 0.045); dy = -2.0 * (1 - u); on = u > 0.01; }
        if (!on) return null;
        return <Box key={i} s={[0.6, 1.7, 0.42]} p={[8.0 * Math.cos(a), 0.85 + dy, 8.0 * Math.sin(a)]} r={[0, PI / 2 - a + (rnd(i) - 0.5) * 0.2, (rnd(i + 4) - 0.5) * 0.08]} c={BLUE} o={glow > 0.02 ? { emissive: "#58b8ff", ei: 0.9 * glow } : undefined} />;
      })}
    </G>
  );
};
/** «quieren levantar un círculo»: o plano do círculo em fantasma amarelo, subindo numa varredura */
const GhostRing: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.levantar || t > CUTS[1] + 0.05) return null;
  return (
    <G>
      {Array.from({ length: 30 }, (_, i) => {
        const u = ease(t, T.circulo - 0.3 + i * 0.03, T.circulo + 0.1 + i * 0.03); if (u <= 0.01) return null;
        const p = slotP(i), am = slotA(i) - 6 * D2R, rc = R * Math.cos(6 * D2R);
        return (
          <G key={i}>
            <G p={[p[0], 0, p[2]]} r={[0, slotRY(i), 0]} sc={[1, u, 1]}><Box s={[UW, UH, UD]} p={[0, UH / 2, 0]} c="#ffe37a" o={GHOST} cast={false} /></G>
            <Box s={[2.08, LH, UD]} p={[rc * Math.cos(am), UH + LH / 2 + 3 * (1 - u), rc * Math.sin(am)]} r={[0, PI / 2 - am, 0]} c="#ffe37a" o={GHOST} cast={false} vis={u > 0.5} />
          </G>
        );
      })}
      {TRI.map(([psi, r, h], j) => { const u = ease(t, T.circulo + 0.4 + j * 0.08, T.circulo + 0.8 + j * 0.08), a = psi * D2R; return u > 0.01 ? <G key={j} p={[r * Math.sin(a), 0, r * Math.cos(a)]} r={[0, a, 0]} sc={[1, u, 1]}><Box s={[2.6, h, 1.0]} p={[0, h / 2, 0]} c="#ffe37a" o={GHOST} cast={false} /></G> : null; })}
    </G>
  );
};

// ---------------------------------------------------------------- a pedra herói: trenó, buraco com rampa, endireitar
const L = 5.6, W = 1.3; // comprimento e largura do pilar herói (1,5 enterrado)
const RAMP_SLOPE = Math.atan2(1.5, 2.2); // 34,3°: a parede em rampa
/** ponta de baixo da pedra (no referencial do herói, x–y) ao longo do caminho do trenó: −30,2 no acampamento */
const SPD = 1.3; // u/s: a multidão arrasta a pedra sobre os trilhos (arranque de 0,5 s)
export const toeX = (t: number) => {
  if (t >= C3) return -10.4 + 6.1 * ease(t, C3, T.acostada + 0.15);
  const d = t - SLIDE0; return -30.2 + (d <= 0 ? 0 : d < 0.5 ? SPD * d * d : SPD * (d - 0.25));
};
const onSled = (t: number) => t > T.trineo + 0.12;
/** estado da pedra herói: ponta (x,y) e ângulo θ (0 = deitada com a cabeça para −x; 90° = em pé) */
const heroPose = (t: number): { tx: number; ty: number; th: number } => {
  if (hook(t)) return { tx: -0.65, ty: -1.5, th: PI / 2 };
  if (t < T.empujan) {
    const hop = t > T.trineo - 0.25 && t < T.trineo + 0.3 ? Math.sin(prog(t, T.trineo - 0.25, T.trineo + 0.3) * PI) * 0.9 : 0;
    return { tx: toeX(t), ty: (onSled(t) ? 0.42 : 0) + hop, th: 0 };
  }
  // empurram: a ponta passa a borda da rampa (−3,0) e avança 1,6 no ar; depois tomba e escorrega até o fundo
  const E = -3.0, d0 = toeX(t) - E;
  // (a pedra continua sobre o trenó, que é empurrado junto até a borda; depois ela escorrega para fora dele)
  if (t < T.punta + 0.1) { const u = ease(t, T.empujan, T.punta + 0.1); return { tx: E + lerp(d0, 1.6, u), ty: 0.42, th: 0 }; }
  if (t < T.enderezan + 0.15) {
    const u = ease(t, T.punta + 0.1, T.cae + 0.3), th = RAMP_SLOPE * u, d = lerp(1.6, Math.hypot(2.2, 1.5), u);
    return { tx: E + d * Math.cos(th), ty: 0.42 * (1 - u) - d * Math.sin(th), th };
  }
  const u = ease(t, T.enderezan + 0.15, T.tirando + 0.75);
  return { tx: lerp(-0.8, -0.65, u), ty: -1.5, th: lerp(RAMP_SLOPE, PI / 2, u) };
};
const heroCenter = (p: { tx: number; ty: number; th: number }): V3 => [p.tx - (L / 2) * Math.cos(p.th) + (W / 2) * Math.sin(p.th), p.ty + (L / 2) * Math.sin(p.th) + (W / 2) * Math.cos(p.th), 0];
const heroHead = (p: { tx: number; ty: number; th: number }, f = 1): V3 => [p.tx - L * f * Math.cos(p.th) + (W / 2) * Math.sin(p.th), p.ty + L * f * Math.sin(p.th) + (W / 2) * Math.cos(p.th), 0];
const knobGrow = (t: number) => (t < T.tallan ? (hook(t) ? 1 : 0) : ease(t, T.tallan + 0.1, T.comoMadera + 0.5));

const HeroStone: React.FC<{ t: number }> = ({ t }) => {
  const p = heroPose(t), c = heroCenter(p), sh = (t > T.toneladas && t < T.c1 ? 0.05 * Math.sin(t * 47) * (1 - prog(t, T.toneladas, T.c1)) : 0) + (t > PULL0 + 0.3 && t < T.trineo - 0.25 ? 0.03 * Math.sin(t * 43) : 0);
  const dy = hook(t) ? -(UH + LH + 0.4) * sinkT(t, 0) : 0, k = knobGrow(t), glow = win2(t, T.saliente - 0.1, T.encima + 0.1);
  const lit = t > T.piedra - 0.05 && t < T.piedra + 0.7 ? 0.6 * Math.sin(prog(t, T.piedra - 0.05, T.piedra + 0.7) * PI) : 0;
  if (hook(t) && sinkT(t, 0) >= 1) return null;
  return (
    <G p={[c[0] + sh, c[1] + dy, 0]} r={[0, 0, -p.th]}>
      <Box s={[L, W, UD]} c={SAR} o={lit > 0.01 ? { emissive: "#ffd400", ei: lit } : undefined} />
      <Box s={[0.12, W * 0.92, UD * 0.9]} p={[-L / 2 + 0.04, 0, 0]} c={SAR3} cast={false} />
      {/* salientes (espigas) na cabeça: nascem quando «la tallan» */}
      {[0.33, -0.33].map((y) => <Box key={y} s={[0.22 * Math.max(0.01, k), 0.3, 0.3]} p={[-L / 2 - 0.11 * k, y, 0]} c={glow > 0 ? "#ffe680" : SAR3} o={glow > 0 ? { emissive: "#ffcc00", ei: 0.9 * glow } : undefined} vis={k > 0.01} cast={false} />)}
    </G>
  );
};
const win2 = (t: number, a: number, b: number) => (t < a || t > b ? 0 : 0.6 + 0.4 * Math.sin((t - a) * 12));

/** o buraco: bloco de terra (perfil em x–y extrudado em z de −0,7 a 0,7) com o entalhe que vai sendo cavado */
const digG = (t: number) => (t < T.cavan ? 0 : ease(t, T.cavan, T.cavan + 0.95));
const notch = (g: number): [number, number][] => { const d = Math.max(0.002, 1.5 * g); return [[-3.0, -0.02], [lerp(-3.0, -0.8, g), -d], [1.0, -d], [1.0, -0.02]]; };
const xr = (y: number) => -0.8 - 2.2 * ((y + 1.5) / 1.5); // linha da rampa no buraco pronto
const shapeOf = (pts: [number, number][]) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
/** recorta um polígono pelo semiplano a*x + b*y <= c (Sutherland–Hodgman) */
const clipHalf = (pts: [number, number][], a: number, b: number, c: number) => {
  const out: [number, number][] = [], f = (p: [number, number]) => a * p[0] + b * p[1] - c;
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], fp = f(p), fq = f(q); if (fp <= 0) out.push(p); if (fp * fq < 0) { const u = fp / (fp - fq); out.push([lerp(p[0], q[0], u), lerp(p[1], q[1], u)]); } });
  return out;
};
const soilPoly = (g: number): [number, number][] => [[-15, -0.02], ...notch(g), [9, -0.02], [9, -7], [-15, -7]];
const band = (g: number, y0: number, y1: number, left: boolean) => {
  let P = clipHalf(soilPoly(g), 0, 1, y1); P = clipHalf(P, 0, -1, -y0); P = left ? clipHalf(P, 1, 0, 0.4) : clipHalf(P, -1, 0, -0.4);
  return P.length > 2 ? P : null;
};
const Extr: React.FC<{ pts: [number, number][]; depth: number; z0: number; c: string; o?: object }> = ({ pts, depth, z0, c, o }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shapeOf(pts), { depth, bevelEnabled: false }), [JSON.stringify(pts), depth]);
  return <mesh geometry={geo} position={[0, 0, z0]} material={mat(c, o)} receiveShadow />;
};
const Flat: React.FC<{ pts: [number, number][]; z: number; c: string; o?: object }> = ({ pts, z, c, o }) => {
  const geo = useMemo(() => new THREE.ShapeGeometry(shapeOf(pts)), [JSON.stringify(pts)]);
  return <mesh geometry={geo} position={[0, 0, z]} material={mat(c, o)} />;
};
const FLINT = Array.from({ length: 60 }, (_, i) => ({ x: lerp(-14.5, 8.5, rnd(i * 3 + 1)), y: lerp(-6.6, -0.7, rnd(i * 3 + 2)), s: lerp(0.07, 0.2, rnd(i * 3 + 3)) }));
const inNotch = (g: number, x: number, y: number) => {
  if (g < 0.01) return false;
  const d = 1.5 * g; if (y < -d - 0.15) return false;
  const xl = -3.0 + (lerp(-3.0, -0.8, g) + 3.0) * clamp(-y / d);
  return x > xl - 0.3 && x < 1.25;
};
const Pit: React.FC<{ t: number }> = ({ t }) => {
  if (t < C3 || t > C5 + 0.05) {
    // tampa de grama (antes da escavação), e o buraco já cheio de terra fresca até a onda final
    return <mesh position={[-1.0, 0.0, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(t > C5 && t < WA ? "#8f7350" : TURF)}><planeGeometry args={[4.0, 1.4]} /></mesh>;
  }
  const g = digG(t), sec = sectionOn(t), d = 1.5 * g;
  const fillS = ease(t, T.rellenan + 0.3, T.tierra), fillE = ease(t, T.tierra - 0.05, T.apretadas + 0.1);
  const ys = lerp(-1.5, -0.8, fillS), ye = lerp(ys, -0.01, fillE) - 0.06 * Math.max(0, Math.sin(prog(t, T.apretadas, T.esteHoyo) * PI * 3));
  return (
    <G>
      {g < 0.01 ? <mesh position={[-1.0, 0.0, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(TURF)}><planeGeometry args={[4.0, 1.4]} /></mesh> : null}
      <Extr pts={soilPoly(g)} depth={1.4} z0={-0.7} c={CHALK} />
      {/* parede do fundo e (fora da seção) a da frente do buraco */}
      {g > 0.01 ? <Flat pts={notch(g)} z={-0.699} c="#5a4632" o={{ side: "double" }} /> : null}
      {g > 0.01 && !sec ? <Flat pts={notch(g)} z={0.699} c="#5a4632" o={{ side: "double" }} /> : null}
      {sec ? (
        <G>
          {[[-0.26, -0.02, "#5fa83a"], [-0.75, -0.26, SOIL]].map(([y0, y1, c]) => [true, false].map((left) => { const P = band(g, y0 as number, y1 as number, left); return P ? <Flat key={`${c}${left}`} pts={P} z={0.705} c={c as string} /> : null; }))}
          {FLINT.filter((f) => !inNotch(g, f.x, f.y)).map((f, i) => <Sph key={i} rad={f.s} p={[f.x, f.y, 0.71]} sc={[1.3, 0.8, 0.3]} c={i % 3 ? "#5f5a55" : "#c9c2ae"} cast={false} recv={false} ws={6} hs={4} />)}
          {/* raízes da grama */}
          {Array.from({ length: 26 }, (_, i) => { const x = lerp(-14.6, 8.6, i / 25); return Math.abs(x + 1) < 2.4 && g > 0.05 ? null : <Box key={i} s={[0.04, 0.28, 0.02]} p={[x, -0.36, 0.712]} r={[0, 0, (rnd(i) - 0.5) * 0.8]} c="#4a3a26" cast={false} recv={false} />; })}
          {/* a seta da parede em rampa */}
          {t > T.rampa - 0.1 && t < T.empujan + 0.6 ? (() => { const k = ease(t, T.rampa - 0.1, T.rampa + 0.35), a: V3 = [-3.0, 0.25, 0.85], b: V3 = [lerp(-3.0, -0.95, k), lerp(0.25, -1.25, k), 0.85]; return <G><Pipe a={a} b={b} rad={0.09} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /><Cone rad={0.22} h={0.4} seg={8} p={b} r={[0, 0, -PI / 2 - RAMP_SLOPE]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /></G>; })() : null}
        </G>
      ) : null}
      {/* enchimento: pedras e depois terra bem apertada */}
      {fillS > 0.01 ? <Extr pts={[[xr(-1.5), -1.5], [-0.65, -1.5], [-0.65, ys], [xr(ys), ys]]} depth={1.36} z0={-0.68} c="#8d8a82" /> : null}
      {fillS > 0.01 ? <Extr pts={[[0.65, -1.5], [1.0, -1.5], [1.0, ys], [0.65, ys]]} depth={1.36} z0={-0.68} c="#8d8a82" /> : null}
      {fillE > 0.01 ? <Extr pts={[[xr(ys), ys], [-0.65, ys], [-0.65, ye], [xr(ye), ye]]} depth={1.36} z0={-0.68} c="#8a6644" /> : null}
      {fillE > 0.01 ? <Extr pts={[[0.65, ys], [1.0, ys], [1.0, ye], [0.65, ye]]} depth={1.36} z0={-0.68} c="#8a6644" /> : null}
      {/* pedras que caem no buraco */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = T.rellenan + 0.25 + i * 0.13, u = ease(t, a, a + 0.35); if (t < a || fillE > 0.8) return null;
        const x = lerp(-2.2, -0.95, rnd(i + 2)), z = lerp(-0.5, 0.5, rnd(i + 5)), yl = Math.max(ys, (-1.5 * (x + 3.0)) / 2.2) + 0.15; // pousa no enchimento ou na rampa
        return <Sph key={i} rad={0.2 + rnd(i) * 0.1} p={[x, lerp(1.6, yl, u * u), z]} c={i % 2 ? "#8a867d" : "#77746c"} ws={7} hs={5} />;
      })}
      <Puffs t={t} p={[-1.6, 0.0, 0]} n={7} period={0.5} rise={0.9} size={0.28} c="#d8c8a8" on={t > T.apretadas - 0.1 && t < T.esteHoyo + 0.2 ? 1 : 0} />
      <Puffs t={t} p={[-1.3, -0.9, 0]} n={8} period={0.45} rise={1.4} size={0.4} c="#e2d6bc" drift={[0.6, 0, 0.4]} on={t > T.cae + 0.25 && t < T.cae + 0.85 ? 1 : 0} />
    </G>
  );
};

/** monte de terra da escavação (atrás do buraco) e cavadores */
const Dig: React.FC<{ t: number }> = ({ t }) => {
  if (t < C3 || t > C5) return null;
  const g = digG(t), on = t > T.cavan - 0.6 && t < T.empujan;
  const diggers = [{ p: [-1.6, 0, -1.25] as V3, yaw: 0, pose: "chisel" as PoseName, ph: 0 }, { p: [-0.3, 0, -1.2] as V3, yaw: -0.3, pose: "chisel" as PoseName, ph: 0.4 }];
  return (
    <G>
      <Sph rad={1.2} p={[-1.0, -0.2, -2.4]} sc={[1.6 * Math.max(0.05, g), 0.75 * Math.max(0.05, g), 0.9]} c="#e2dccb" vis={g > 0.01} ws={10} hs={6} />
      <Sph rad={0.8} p={[0.8, -0.15, -2.3]} sc={[1.2 * Math.max(0.05, g), 0.6 * Math.max(0.05, g), 0.8]} c="#8a6a45" vis={g > 0.01} ws={9} hs={6} />
      <Crowd list={diggers} t={t} c={NEO2} vis={on} />
      <Puffs t={t} p={[-1.0, 0.1, -0.2]} n={7} period={0.45} rise={1.3} size={0.25} c="#e9e2cf" on={t > T.cavan - 0.1 && t < T.cavan + 1.0 ? 1 : 0} />
    </G>
  );
};

/** os que empurram a cauda da pedra até a ponta passar da borda da rampa */
const Pushers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.empujan - 0.5 || t > T.enderezan) return null;
  const tail = heroPose(Math.min(t, T.punta + 0.1)).tx - L - 0.45, go = t < T.punta + 0.15;
  const crew = [-0.3, 0.3].map((z, i) => ({ p: [tail - i * 0.5, 0, z - 0.35] as V3, yaw: PI / 2, pose: (go ? "pull" : "cheer") as PoseName, ph: i * 0.3 }));
  return <Crowd list={crew} t={t} c={NEO2} />;
};
/** estaca com bandeirinha onde a pedra vai ficar em pé (da chegada até começarem a cavar) */
const Stake: React.FC<{ t: number }> = ({ t }) => {
  if (t < C3 || t > T.cavan - 0.1) return null;
  const k = outBack(prog(t, C3 + 0.3, C3 + 0.7)), wave = Math.sin(t * 9) * 0.25;
  return <G p={[0, 0, 0]} sc={Math.max(0.001, k)}><Cyl rt={0.06} h={1.7} p={[0, 0.85, 0]} c={WOOD2} seg={6} /><Box s={[0.05, 0.36, 0.55]} p={[0, 1.5, 0.3]} r={[wave, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.5 }} cast={false} /></G>;
};
/** fantasma: a pedra tem de ficar EM PÉ aqui (o plano do objetivo, estilo jogo) */
const GhostUpright: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.depie - 0.15, T.depie + 0.25) * (1 - ease(t, T.cavan, T.cavan + 0.4)); if (k <= 0.01) return null;
  return <Box s={[W, 4.1 * k, UD]} p={[0, 2.05 * k, 0]} c="#ffe37a" o={{ ...GHOST, opacity: 0.5 * (0.75 + 0.25 * Math.sin(t * 9)) }} cast={false} />;
};

// ---------------------------------------------------------------- trenó, trilhos de troncos, acampamento e a equipe na corda
const RAIL0 = -42.2, RAILN = 13, FLYD = 0.6;
/** trilhos levados de trás para a frente: o trecho «de» sai de trás do trenó, voa dando cambalhota e pousa na frente («para») */
const FLY: [number, number, number][] = [[0, 5, FLY_AT[0]], [1, 6, FLY_AT[1]], [2, 7, FLY_AT[2]]];
const Track: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[0] || t > C5) return null;
  const hi = t > T.troncos - 0.1 && t < T.cientos + 0.4 ? 0.5 + 0.5 * Math.sin((t - T.troncos) * 10) : 0;
  return (
    <G>
      {Array.from({ length: RAILN }, (_, k) => {
        const x = RAIL0 + 3 * k + 1.5, src = FLY.find((f) => f[0] === k), dst = FLY.find((f) => f[1] === k);
        if (src && t >= src[2] - FLYD) return null; // já foi levado para a frente
        let p: V3 = [x, 0, 0], rz = 0;
        if (dst) {
          const a = dst[2]; if (t < a - FLYD) return null;
          const u = prog(t, a - FLYD, a), q = t - a, xs = RAIL0 + 3 * dst[0] + 1.5;
          p = [lerp(xs, x, sstep(u)), 3.2 * Math.sin(PI * u) + (q > 0 && q < 0.4 ? 0.18 * Math.abs(Math.sin((q * PI) / 0.14)) * Math.exp(-q * 8) : 0), 0];
          rz = 0.35 * Math.sin(PI * u); // voa quase deitado (girando, o par parecia dois postes no quadro parado)
        } else if (k > 4) { const a = C3 - 0.02; if (t < a) return null; p = [x, 1.6 * (1 - ease(t, a, a + 0.3)), 0]; }
        return <G key={k} p={p} r={[0, 0, rz]}>{[-0.55, 0.55].map((z) => <Cyl key={z} rt={0.13} h={3.0} p={[0, 0.12, z]} r={[0, 0, PI / 2]} c={k % 2 ? WOOD : WOOD2} seg={7} o={hi > 0 ? { emissive: "#ffb000", ei: 0.55 * hi } : undefined} />)}</G>;
      })}
    </G>
  );
};
const Sled: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.trineo - 0.35 || t > C5) return null;
  const front = t < T.empujan ? toeX(t) + 0.3 : Math.min(-3.25, heroPose(Math.min(t, T.punta + 0.1)).tx + 0.3), slideIn = 1 - ease(t, T.trineo - 0.35, T.trineo + 0.05), x = front - 3.1 - 5 * slideIn;
  if (sectionOn(t) === false && t > C4) return null; // fica no plano 4; nos de fora já saiu
  return (
    <G p={[x, 0, 0]}>
      {[-0.55, 0.55].map((z) => <Box key={z} s={[6.2, 0.18, 0.24]} p={[0, 0.33, z]} c={WOOD2} />)}
      {[-0.55, 0.55].map((z) => <Box key={z} s={[0.6, 0.18, 0.24]} p={[3.25, 0.42, z]} r={[0, 0, 0.5]} c={WOOD2} />)}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((bx) => <Box key={bx} s={[0.3, 0.1, 1.4]} p={[bx, 0.4, 0]} c={WOOD} />)}
    </G>
  );
};
const MiniPeople: React.FC<{ list: V3[]; t: number }> = ({ list, t }) => (
  <G>{list.map((p, i) => { const b = 0.06 * Math.abs(Math.sin(t * 7 + i)); return <G key={i} p={[p[0], p[1] + b, p[2]]} r={[0, 0, -0.3]}><Cyl rt={0.26} rb={0.3} h={0.95} p={[0, 0.85, 0]} c={i % 2 ? NEO.top : NEO2.top} seg={7} /><Sph rad={0.27} p={[0, 1.55, 0]} c={NEO.skin} ws={8} hs={6} /><Cyl rt={0.2} h={0.1} p={[0, 1.33, 0]} c="#e0262b" seg={7} cast={false} /><Box s={[0.18, 0.62, 0.18]} p={[0, 0.3, 0]} c={NEO.bottom} /></G>; })}</G>
);
const Team: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[1] || t > T.p1 + 0.6) return null;
  const front = toeX(t) + 0.3, pulling = t < C3 ? t > PULL0 : Math.abs(toeX(t + 0.05) - toeX(t)) > 0.001, sec = sectionOn(t);
  // as duas filas puxam pelo lado de fora (+z): a câmera do trenó fica do outro lado e vê os trilhos; na seção, uma fila atrás da face
  const rows = sec ? [-1.35] : [1.05, 2.25], gone = ease(t, T.p1, T.p1 + 0.5), slip = !sec && t >= SLIP && t < C3;
  const crew = rows.flatMap((z, r) => Array.from({ length: sec ? 4 : 6 }, (_, j) => ({ p: [front + 2.0 + j * 1.25, 0, z] as V3, yaw: PI / 2, pose: (pulling ? "pull" : "idle") as PoseName, ph: j * 0.37 + r * 0.2 })))
    .filter((_, i) => !(slip && i === 5));
  // os pequenos do fim da corda somem nos planos em que a câmera fica no meio da fila (de frente)
  const minis: V3[] = sec || t < XCUTS[3] || (t >= XCUTS[13] && t < C3) ? [] : rows.flatMap((z) => Array.from({ length: 9 }, (_, j) => [front + 9.7 + j * 1.25, 0, z] as V3));
  const far = front + (sec ? 7.2 : 21);
  // o escorregão: o da ponta da fila de dentro perde o pé, cai de costas e vai arrastado segurando a corda
  const sx = front + 2.0 + 5 * 1.25 + 0.5 * ease(t, SLIP, SLIP + 0.25), q = t - SLIP - 0.25, rz = 1.4 * ease(t, SLIP, SLIP + 0.25) - (q > 0 && q < 0.5 ? 0.15 * Math.abs(Math.sin((q * PI) / 0.18)) * Math.exp(-q * 7) : 0);
  return (
    <G>
      {rows.map((z) => <Pipe key={z} a={[front + 0.1, 0.62, sec ? -0.4 : 0.4]} b={[far, 1.05, z]} rad={0.045} c="#c9a466" cast={false} />)}
      <Crowd list={crew} t={t} c={NEO} scale={1.0 * (1 - gone) + 0.001} />
      {minis.length ? <MiniPeople list={minis} t={t} /> : null}
      {slip ? <G p={[sx, 0.24 * ease(t, SLIP, SLIP + 0.25), 1.05]} r={[0, 0, rz]}><Crowd list={[{ p: [0, 0, 0], yaw: PI / 2, pose: "alarm", ph: 0 }]} t={t} c={NEO} /></G> : null}
      {slip ? <Puffs t={t} p={[sx - 0.6, 0.05, 1.05]} n={6} period={0.4} rise={0.5} size={0.3} c="#d8c8a8" drift={[0.8, 0, 0]} /> : null}
      <XMark t={t} a={SLIP + 0.3} b={C3 - 0.02} p={[sx - 1.0, 2.0, 1.05]} cam={[-11.5, 5.0, 0.6]} size={1.1} />
    </G>
  );
};
/** acampamento: troncos, rolos de corda e gente que chega («solo madera, cuerda, piedra y mucha gente») */
const Camp: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[0] - 0.1 || t > C3) return null;
  const lg = outBack(prog(t, T.madera - 0.05, T.madera + 0.3)), rp = outBack(prog(t, T.cuerda - 0.05, T.cuerda + 0.3));
  const arrive = ease(t, T.gente - 0.1, T.gente + 1.0), go = ease(t, T.b1, T.b1 + 0.5), push = t > T.b1 + 0.4 && t < CUTS[1];
  // chegam pela esquerda, ficam atrás da pedra e, no «¿cómo arrastras…?», empurram a cauda (a pedra treme e não sai do lugar)
  const STAND: [number, number][] = [[-31.6, -1.7], [-32.8, -2.6], [-34.0, -1.7], [-35.2, -2.6], [-36.0, -1.6]];
  const PUSH: [number, number][] = [[-36.3, -0.62], [-36.3, 0], [-36.3, 0.62], [-37.1, -0.32], [-37.1, 0.32]];
  // chegam pela direita (dentro do quadro do plano 2), andando para −x; no empurrão viram para +x
  const folk = STAND.map(([sx, sz], i) => ({ p: [lerp(lerp(-21.5 - i * 0.9, sx, arrive), PUSH[i][0], go), 0, lerp(sz, PUSH[i][1], go)] as V3, yaw: go > 0.5 ? PI / 2 : arrive < 1 ? -PI / 2 : PI / 2 - 0.3, pose: (push ? "pull" : arrive < 1 || (go > 0 && go < 1) ? "walk" : "idle") as PoseName, ph: i * 0.3 }));
  return (
    <G>
      <G p={[-27.4, 0, 2.6]} sc={Math.max(0.001, lg)}>
        {[[-0.42, 0.22], [0, 0.22], [0.42, 0.22], [-0.21, 0.58], [0.21, 0.58], [0, 0.94]].map(([z, y], i) => <Cyl key={i} rt={0.2} h={3.2} p={[0, y, z]} r={[0, 0, PI / 2]} c={i % 2 ? WOOD : WOOD2} seg={8} />)}
      </G>
      <G p={[-25.6, 0, 3.8]} sc={Math.max(0.001, rp)}>
        {[0.1, 0.27, 0.44].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation={[PI / 2, 0, 0]} castShadow material={mat("#c9a466")}><torusGeometry args={[0.5 - i * 0.06, 0.1, 6, 16]} /></mesh>)}
      </G>
      <Crowd list={folk} t={t} c={NEO2} vis={t > T.gente - 0.15 && t < CUTS[1]} />
    </G>
  );
};
/** equipe que puxa a pedra para ficar em pé (plano 5) */
const Raisers: React.FC<{ t: number }> = ({ t }) => {
  if (t < C4 || t > T.esteHoyo) return null;
  const p = heroPose(t), h = heroHead(p, 0.92), pulling = t > T.enderezan && t < T.tirando + 0.8;
  const crew = [2.0, 3.0].flatMap((z, r) => Array.from({ length: 4 }, (_, j) => ({ p: [4.6 + j * 1.1 + r * 0.4, 0, z] as V3, yaw: PI / 2, pose: (pulling ? "pull" : "cheer") as PoseName, ph: j * 0.3 + r })));
  // os que socam a terra ficam atrás do buraco (a câmera olha de fora para dentro)
  const tamp = [{ p: [-2.4, 0, -1.15] as V3, yaw: 0.2, pose: "chisel" as PoseName, ph: 0 }, { p: [-1.1, 0, -1.25] as V3, yaw: -0.2, pose: "chisel" as PoseName, ph: 0.35 }];
  return (
    <G>
      {t < T.tirando + 1.2 ? [2.0, 3.0].map((z) => <Pipe key={z} a={[h[0], h[1], 0]} b={[4.6 + 3 * 1.1 + 0.8, 1.1, z]} rad={0.045} c="#c9a466" cast={false} />) : null}
      <Crowd list={crew} t={t} c={NEO} />
      <Crowd list={tamp} t={t} c={NEO2} vis={t > T.rellenan} />
    </G>
  );
};

// ---------------------------------------------------------------- o dintel: torre de troncos com alavancas, e o encaixe
const LZ0 = 9.945, TZ = 11.65, XC = 0.85; // dintel no lugar (z), no centro da torre (z); colunas da torre em x = ±0.85
const LOG = 0.34;
const stepSide = (k: number) => (k % 2 ? -1 : 1); // ímpar = lado A (x<0), par = lado B
const liftWin = (k: number): [number, number, number] => {
  const tau = stepAt(k);
  if (k === 1) return [T.levantan, T.levantan + 0.75, tau];
  if (k === 2) return [T.otroLado, T.otroLado + 0.6, tau];
  return [tau - 0.1, tau - 0.03, tau];
};
/** número de pares de troncos já postos sob o lado s, e quanto a alavanca levanta esse lado agora */
const colState = (s: number, t: number) => {
  let n = 0, lift = 0;
  for (let k = 1; k <= NSTEP; k++) if (stepSide(k) === s) { const [a, b, tau] = liftWin(k); if (t >= tau) n++; else if (t >= a) { lift = LOG * ease(t, a, b); break; } else break; }
  return { n, lift };
};
const towerTop = (s: number, t: number) => LOG * (1 + colState(s, t).n);
/** dintel herói: x do centro, altura da base, z, inclinação (z) e balanço (x) */
/** «¿cómo la subes sin grúa?»: quatro tentam levantar o dintel no braço; sobe um palmo e despenca */
export const HL0 = T.b3 + 0.1, HL1 = T.b3 + 0.62;
const handLift = (t: number) => {
  if (t < HL0 || t > HL1 + 0.6) return 0;
  if (t < HL1) return 0.42 * Math.sin((PI / 2) * prog(t, HL0, HL1 - 0.08)) * (t > HL1 - 0.08 ? 1 - prog(t, HL1 - 0.08, HL1) : 1);
  const a = t - HL1; return 0.14 * Math.abs(Math.sin((a * PI) / 0.16)) * Math.exp(-a * 7);
};
const HandCrew: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b3 - 0.05 || t > T.c3 + 0.4) return null;
  const up = t < HL1, fall = t > HL1 ? Math.min(1, prog(t, HL1, HL1 + 0.25)) : 0;
  const crew = [[-1.4, -0.85, PI / 2], [1.4, -0.85, -PI / 2], [-1.4, 0.85, PI / 2], [1.4, 0.85, -PI / 2]].map(([x, dz, yaw], i) => ({ p: [x - Math.sign(x) * 0.5 * fall, 0, TZ + dz] as V3, yaw, pose: (up ? "pull" : "alarm") as PoseName, ph: i * 0.3 }));
  return <G><Crowd list={crew} t={t} c={NEO2} /><Puffs t={t} p={[0, 0.1, TZ]} n={7} period={0.45} rise={0.6} size={0.4} c="#e2d6bc" on={t > HL1 && t < HL1 + 0.5 ? 1 : 0} /></G>;
};
const lintelPose = (t: number) => {
  const a = colState(-1, t), b = colState(1, t), hA = LOG * (1 + a.n) + a.lift, hB = LOG * (1 + b.n) + b.lift;
  const top = LOG * (1 + NSTEP / 2);
  if (t < C6) return { y: (hA + hB) / 2 + handLift(t), z: TZ, pitch: Math.atan2(hB - hA, 2.09), roll: 0 };
  // em cima: desliza para os pilares, balança (solta), volta (⏪), e encaixa
  const in1 = ease(t, C6 + 0.05, C6 + 0.7), back = ease(t, T.b4 + 0.05, T.b4 + 0.6), in2 = ease(t, T.hueco - 0.25, T.encaja - 0.14);
  const z = lerp(TZ, LZ0, in1 * (1 - back) + in2);
  const seat = in1 * (1 - back) * ease(t, C6 + 0.6, C6 + 0.8) * (UH - top) + in2 * (UH - top) * outBack(prog(t, T.encaja - 0.14, T.encaja + 0.02));
  const wob = t > T.arriba - 0.2 && t < T.b4 ? 0.05 * Math.sin((t - T.arriba) * 13) * Math.min(1, prog(t, T.arriba - 0.2, T.caer)) : 0;
  // a queda: escorrega para dentro, tomba de lado e quica no chão; no «solución» o mesmo caminho de ré (⏪) até a torre
  const u = prog(t, FALL0, FALL1), back2 = ease(t, T.b4 + 0.05, T.b4 + 0.5), f = (t < FALL0 ? 0 : 1) * (1 - back2);
  const q = t - FALL1, hop = q > 0 && q < 0.8 ? 0.5 * Math.abs(Math.sin((q * PI) / 0.24)) * Math.exp(-q * 6) : 0;
  const fy = -(UH - 0.08) * u * u + hop, fz = -2.4 * Math.sin((u * PI) / 2), fr = -(PI / 2) * ease(t, FALL0 + 0.05, FALL1 - 0.05) - 0.12 * Math.sin(q * 20) * (q > 0 && q < 0.6 ? Math.exp(-q * 6) : 0);
  return { y: top + seat + f * fy, z: z + f * fz, pitch: 0, roll: wob * (1 - u) + f * fr };
};
const Lintel: React.FC<{ t: number; ghost?: boolean }> = ({ t }) => {
  const hk = hook(t);
  if (hk) { const k = sinkT(t, 0.02); if (k >= 1) return null; return <G p={[0, UH + LH / 2 - (UH + LH + 0.4) * k + dropA(ringOrder(0), t), LZ0]}><LintelBody t={t} /></G>; }
  if (t < C4) return null;
  const p = lintelPose(t);
  return <G p={[0, p.y + LH / 2, p.z]} r={[p.roll, 0, p.pitch]}><LintelBody t={t} /></G>;
};
/** corpo do dintel com os dois buracos (encaixes) no lado de dentro do círculo (−z), onde a câmera do encaixe olha */
const LintelBody: React.FC<{ t: number }> = ({ t }) => {
  const glow = win2(t, T.hueco - 0.1, T.encaja), Lx = 2.1, nx = 0.36, ny = 0.28;
  return (
    <G>
      <Box s={[Lx, LH, UD / 2]} p={[0, 0, UD / 4]} c={SAR} />
      <Box s={[Lx, LH - ny, UD / 2]} p={[0, ny / 2, -UD / 4]} c={SAR} />
      {[[-Lx / 2, -0.717 - nx / 2], [-0.717 + nx / 2, 0.717 - nx / 2], [0.717 + nx / 2, Lx / 2]].map(([a, b], i) => <Box key={i} s={[b - a, ny, UD / 2]} p={[(a + b) / 2, -LH / 2 + ny / 2, -UD / 4]} c={SAR} />)}
      {[-0.717, 0.717].map((x) => <Box key={x} s={[nx, ny, 0.02]} p={[x, -LH / 2 + ny / 2, -0.005]} c={glow > 0 ? "#ffe680" : "#6f6a5e"} o={glow > 0 ? { emissive: "#ffcc00", ei: 0.9 * glow } : undefined} cast={false} />)}
    </G>
  );
};
const Tower: React.FC<{ t: number }> = ({ t }) => {
  if (t < C4 || sectionOn(t)) return null;
  const hi = t > T.torre - 0.1 && t < T.estaTorre + 1.2 ? 0.5 + 0.5 * Math.sin((t - T.torre) * 10) : 0;
  const logs: React.ReactNode[] = [];
  for (const s of [-1, 1]) {
    const cs = colState(s, t);
    const entering = (() => { for (let k = 1; k <= NSTEP; k++) if (stepSide(k) === s && t < stepAt(k)) return k; return 0; })();
    const nShow = cs.n + 1 + (entering && t > stepAt(entering) - (entering < 3 ? 0.5 : 0.06) ? 1 : 0);
    for (let j = 0; j < nShow; j++) {
      const y = LOG / 2 + LOG * j, slide = j === cs.n + 1 && entering ? 1 - ease(t, stepAt(entering) - (entering < 3 ? 0.5 : 0.06), stepAt(entering)) : 0;
      const along = (j + (s > 0 ? 1 : 0)) % 2 === 0, c = (j + s) % 3 ? WOOD : WOOD2, o = hi > 0 ? { emissive: "#ffb000", ei: 0.45 * hi } : undefined;
      for (const e of [-1, 1]) logs.push(along
        ? <Cyl key={`${s}${j}${e}`} rt={LOG / 2} h={1.5} p={[s * XC, y, TZ + e * 0.62 + slide * 2.2]} r={[0, 0, PI / 2]} c={c} seg={7} o={o} />
        : <Cyl key={`${s}${j}${e}`} rt={LOG / 2} h={1.9} p={[s * XC + e * 0.48, y, TZ + slide * 2.2]} r={[PI / 2, 0, 0]} c={c} seg={7} o={o} />);
    }
  }
  return <G>{logs}</G>;
};
/** alavancas: ponta sob o dintel, apoio num toco sobre a coluna, braço longo puxado para baixo */
const Levers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.palancas - 0.1 || t > C6) return null;
  const k = outBack(prog(t, T.palancas - 0.1, T.palancas + 0.25));
  const bPull = t > T.otroLado - 0.3 && t < T.otroTronco + 0.3;
  const helper = [{ p: [4.85, 0, TZ + 0.05] as V3, yaw: -PI / 2, pose: (bPull ? "pull" : "idle") as PoseName, ph: 0.2 }];
  return (
    <G>
      <Crowd list={helper} t={t} c={NEO2} vis={t < T.capa + 0.3} />
      {[-1, 1].map((s) => {
        const cs = colState(s, t), top = towerTop(s, t), hf = top + 0.35, sb = clamp((0.35 - cs.lift) / 0.6, -1, 1), b = Math.asin(sb);
        const fx = s * 1.6, tip: V3 = [s * 1.0, hf - 0.6 * Math.sin(b), TZ + 0.05], end: V3 = [fx + s * 3.0 * Math.cos(b), hf + 3.0 * Math.sin(b), TZ + 0.05];
        return (
          <G key={s} sc={Math.max(0.001, k)}>
            <Box s={[0.4, 0.35, 0.5]} p={[fx, top + 0.175, TZ + 0.05]} c={WOOD2} />
            <Pipe a={tip} b={end} rad={0.085} c="#b07a40" />
            {/* seta amarela «sobe!» no lado que a alavanca levanta (os dois passos lentos) */}
            {(s < 0 ? t > T.levantan - 0.1 && t < T.tronco1 + 0.3 : t > T.otroLado - 0.1 && t < T.otroTronco + 0.3) ? <G p={[s * 1.0, top + 1.6 + 0.12 * Math.sin(t * 10), TZ + 0.05]}><Cone rad={0.26} h={0.45} seg={8} p={[0, 0.3, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /><Box s={[0.13, 0.5, 0.13]} p={[0, -0.1, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /></G> : null}
          </G>
        );
      })}
    </G>
  );
};
/** régua de altura ao lado do pilar 1: «a más de cuatro metros de altura» */
const Ruler: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, RUL0, RUL0 + 1.0), on = t > RUL0 - 0.05 && t < T.b3 + 0.4; if (!on) return null;
  const x = -1.95, z = 10.75, h = UH * k;
  return <G><Box s={[0.08, Math.max(0.01, h), 0.08]} p={[x, h / 2, z]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />
    <Cone rad={0.2} h={0.35} seg={8} p={[x, h + 0.1, z]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />
    {[0, h, ...[1, 2, 3].map((m) => (UH * m) / 4).filter((y) => y < h)].map((y, i) => <Box key={i} s={[i < 2 ? 0.6 : 0.36, 0.06, 0.06]} p={[x, y + 0.03, z]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />)}</G>;
};
/** «encima de dos pilares va otra piedra»: o lugar do dintel em fantasma sobre os dois pilares */
const GhostLintel: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, RUL0 - 0.05, RUL0 + 0.3); if (k <= 0.01 || t > T.b3 + 0.3) return null;
  return <Box s={[2.1, LH, UD]} p={[0, UH + LH / 2 + 1.2 * (1 - k), LZ0]} c="#ffd84a" o={{ ...GHOST, opacity: 0.62 * (0.8 + 0.2 * Math.sin(t * 9)), ei: 0.8 }} cast={false} />;
};
/** «a más de cuatro metros»: o operário pula três vezes ao lado da régua e não alcança o topo (✖) */
export const RB: V3 = [-1.45, 0, 11.15];
export const jumpP = (t: number): V3 => { const k = Math.floor((t - JUMP0) / JUMPD), u = prog(t, JUMP0 + k * JUMPD, JUMP0 + k * JUMPD + JUMPD - 0.03); return [RB[0], k >= 0 && k < JUMPN ? (0.55 + 0.25 * k) * Math.sin(PI * u) : 0, RB[2]]; };
const JumpX: React.FC<{ t: number }> = ({ t }) => { const a = JUMP0 + JUMPN * JUMPD + 0.03; return <XMark t={t} a={a} b={a + 0.72} p={[RB[0], 2.9, RB[2] + 0.5]} cam={[-1.0, 3.0, 19.0]} size={1.3} />; };
/** pó no chão onde o dintel cai */
const FallDust: React.FC<{ t: number }> = ({ t }) => <Puffs t={t} p={[0, 0.05, LZ0 - 2.4]} n={8} period={0.5} rise={0.9} size={0.55} c="#e8e2d2" drift={[0.9, 0, -0.4]} on={t > FALL1 - 0.02 && t < FALL1 + 0.6 && t < T.b4 ? 1 : 0} />;
/** «la tallan como si fuera madera»: lascas e pó saindo dos topos; dois canteiros na plataforma da torre */
const Carving: React.FC<{ t: number }> = ({ t }) => {
  const on = t > T.tallan - 0.1 && t < T.cada + 0.2; if (!on && !(t > T.b4 && t < T.encima)) return null;
  const crew = [-0.75, 0.75].map((x, i) => ({ p: [x, LOG * (1 + NSTEP / 2), 10.98] as V3, yaw: PI, pose: "chisel" as PoseName, ph: i * 0.4 }));
  return (
    <G>
      <Crowd list={crew} t={t} c={NEO2} vis={t > T.b4 + 0.5 && t < T.cada - 0.1} />
      {on ? [-0.717, 0.717].map((x) => <G key={x}>
        <Puffs t={t} p={[x, UH + 0.1, 9.98]} n={6} period={0.4} rise={0.8} size={0.18} c="#e8e2d2" />
        {Array.from({ length: 6 }, (_, i) => { const u = fract(t * 2.2 + i / 6); return <Box key={i} s={[0.09, 0.07, 0.09]} p={[x + (rnd(i) - 0.5) * 1.6 * u, UH + 0.15 + 0.9 * u - 1.6 * u * u, 9.98 + (rnd(i + 3) - 0.5) * 1.4 * u]} r={[u * 5, u * 3, 0]} c={SAR3} cast={false} />; })}
      </G>) : null}
    </G>
  );
};
/** setinha que aponta os salientes, e o anel de brilho do «clic» */
const JointFx: React.FC<{ t: number }> = ({ t }) => {
  const ar = t > T.saliente - 0.1 && t < T.encima + 0.2, k = prog(t, T.encaja, T.encaja + 0.5);
  return (
    <G>
      {ar ? [-0.717, 0.717].map((x) => <Cone key={x} rad={0.16} h={0.36} seg={8} p={[x, UH + 0.75 + 0.12 * Math.sin(t * 9), 9.6]} r={[PI, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />) : null}
      {k > 0 && k < 1 ? [-0.717, 0.717].map((x) => <mesh key={x} position={[x, UH + 0.12, 9.5]} scale={0.3 + 1.6 * k}><torusGeometry args={[0.5, 0.05, 6, 24]} /><meshBasicMaterial color="#fff6c0" transparent opacity={1 - k} depthWrite={false} /></mesh>) : null}
    </G>
  );
};
/** pilar 1 do par (o vizinho do herói) já em pé no canteiro — parte do círculo (slot 1), desenhado em Ring */

/** «capa a capa, la piedra sube»: um tronco escapa do topo do lado A, bate na cabeça do operário, cai e volta de ré (✖) */
export const TS_OP: V3 = [-3.4, 0, 12.8];
const TS_HEAD: V3 = [TS_OP[0], 2.3, TS_OP[2]], TS_TOP: V3 = [-0.85, 2.6, 11.65], TS_GND: V3 = [-4.2, 0.17, 12.1];
const arc = (a: V3, b: V3, u: number, h: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(PI * u), lerp(a[2], b[2], u)];
const TowerSlip: React.FC<{ t: number }> = ({ t }) => {
  if (t < TS || t > TS + 1.6) return null;
  const back = t > TS + 1.2, u = back ? ease(t, TS + 1.2, TS + 1.55) : 0;
  const p = back ? arc(TS_GND, TS_TOP, u, 1.2) : t < TS + 0.35 ? arc(TS_TOP, TS_HEAD, prog(t, TS, TS + 0.35), 0.9) : arc(TS_HEAD, TS_GND, prog(t, TS + 0.35, TS + 0.6), 0.6);
  const rz = back ? 3 * PI * (1 - u) : 3 * PI * ease(t, TS, TS + 0.6);
  return (
    <G>
      <G p={p} r={[0, 0.5, rz]}><Cyl rt={LOG / 2} h={1.5} r={[0, 0, PI / 2]} c={WOOD} seg={7} /></G>
      <Puffs t={t} p={TS_GND} n={6} period={0.45} rise={0.6} size={0.35} c="#e2d6bc" on={t > TS + 0.6 && t < TS + 1.0 ? 1 : 0} />
      {t > TS + 0.35 ? Array.from({ length: 4 }, (_, i) => { const a = t * 7 + (i * PI) / 2; return <Sph key={i} rad={0.1} p={[TS_HEAD[0] + 0.45 * Math.cos(a), TS_HEAD[1] + 0.1 + 0.08 * Math.sin(a * 2), TS_HEAD[2] + 0.45 * Math.sin(a)]} c="#ffe14a" o={{ emissive: "#ffcc00", ei: 0.9 }} cast={false} ws={6} hs={4} />; }) : null}
      <XMark t={t} a={TS + 0.4} b={TS + 1.15} p={[TS_OP[0] + 0.3, 3.3, TS_OP[2] + 0.5]} cam={[-5.5, 5.5, 20.5]} size={1.6} />
    </G>
  );
};

// ---------------------------------------------------------------- o fim: «…a quien no puede mover ni el sofá»
export const SOFA: V3 = [-3.7, 0, -5.2];
const Sofa: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.sofa - 0.45) return null;
  const s = prog(t, T.sofa - 0.45, T.sofa), a = t - T.sofa, dy = s < 1 ? 7 * (1 - s * s) : a < 0.7 ? 0.3 * Math.abs(Math.sin((a * PI) / 0.22)) * Math.exp(-a * 6) : 0;
  const sh = t > T.sofa + 0.45 ? 0.012 * Math.sin(t * 50) : 0;
  return (
    <G p={[SOFA[0] + sh, dy, SOFA[2]]} r={[0, 0.9, 0]}>
      <Box s={[1.9, 0.42, 0.85]} p={[0, 0.36, 0]} c="#c8443a" />
      <Box s={[1.9, 0.62, 0.24]} p={[0, 0.82, -0.32]} c="#b23a31" />
      {[-0.86, 0.86].map((x) => <Box key={x} s={[0.22, 0.34, 0.85]} p={[x, 0.7, 0]} c="#b23a31" />)}
      {[-0.55, 0.55].map((x) => <Box key={x} s={[0.8, 0.12, 0.6]} p={[x, 0.62, 0.08]} c="#e06a5c" cast={false} />)}
      {[[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].map(([x, z]) => <Box key={`${x}${z}`} s={[0.1, 0.15, 0.1]} p={[x, 0.075, z]} c="#5a3a24" />)}
    </G>
  );
};
const CONF = ["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff", "#ff8a3a"];
const Confetti: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.manda) return null;
  return <G>{Array.from({ length: 70 }, (_, i) => { const u = fract((t - T.manda) / 2.4 + rnd(i * 3 + 1)); return <Box key={i} s={[0.14, 0.02, 0.1]} p={[-2.4 + (rnd(i * 3 + 2) - 0.5) * 7 + 0.4 * Math.sin(t * 3 + i), 7.5 - 7.4 * u, -4.2 + (rnd(i * 3 + 3) - 0.5) * 6]} r={[t * 5 + i, t * 3 + i * 2, 0]} c={CONF[i % 6]} cast={false} recv={false} />; })}</G>;
};

// ---------------------------------------------------------------- o giro: o sol do solstício nasce no eixo
export const dawn = (t: number) => ease(t, T.giro, T.mira + 0.6) * (1 - 0.7 * ease(t, T.sale, T.eje + 0.6));
// já está meio fora do horizonte, no vão do eixo, no «alineado con su eje»; depois continua subindo devagar
const sunY = (t: number) => lerp(-30, 22, ease(t, T.sale - 0.25, T.eje + 0.1)) + lerp(0, 8, ease(t, T.eje + 0.1, T.end));
const Glow: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => { const cv = document.createElement("canvas"); cv.width = cv.height = 128; const g = cv.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,190,90,1)"); gr.addColorStop(0.4, "rgba(255,150,70,0.5)"); gr.addColorStop(1, "rgba(255,120,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx; }, []);
  const k = ease(t, T.giro, T.mira + 0.8); if (k <= 0.01) return null;
  return (
    <G>
      <mesh position={[0, 6, -420]}><planeGeometry args={[520, 150]} /><meshBasicMaterial map={tex} transparent opacity={0.85 * k} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, sunY(t), -400]}><sphereGeometry args={[24, 28, 18]} /><meshBasicMaterial color="#ffd36b" fog={false} /></mesh>
    </G>
  );
};
/** o eixo: traço dourado no chão, do centro, pela abertura do círculo e pela avenida, até o horizonte */
const Axis: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.sale - 0.1, T.alineado + 0.2); if (k <= 0.01) return null;
  // até perto do horizonte, com traços mais largos ao longe (rente ao chão eles somem de perfil)
  const n = 110, pulse = 0.7 + 0.3 * Math.sin(t * 8);
  return <G>{Array.from({ length: n }, (_, i) => { const z = 2.0 - i * 2.0; return i / n < k ? <Box key={i} s={[0.22 + 0.012 * i, 0.03, 1.1]} p={[0, 0.03, z]} c="#ffd400" o={{ emissive: "#ffc000", ei: 1.1 * pulse }} cast={false} recv={false} /> : null; })}</G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a86d8" mid="#8cc3ee" low="#eef4f6" />
    <Ground />
    <Clouds t={t} n={8} y={30} />
    <Earthworks />
    <Ring t={t} /><Trilithons t={t} /><Bluestones t={t} /><GhostRing t={t} />
    <G p={HERO} r={[0, HERO_RY, 0]}>
      <Pit t={t} /><Dig t={t} /><Pushers t={t} /><GhostUpright t={t} /><Stake t={t} /><HeroStone t={t} /><NoGo t={t} />
      <Track t={t} /><Sled t={t} /><Team t={t} /><Camp t={t} /><Raisers t={t} />
    </G>
    <Lintel t={t} /><GhostLintel t={t} /><Tower t={t} /><Levers t={t} /><Ruler t={t} /><FallDust t={t} /><Carving t={t} /><JointFx t={t} />
    <Glow t={t} /><Axis t={t} />
    <DustA t={t} /><OpenDrag t={t} /><OpenPush t={t} /><HandCrew t={t} /><Sofa t={t} /><Confetti t={t} /><RunDust t={t} /><TowerSlip t={t} /><JumpX t={t} />
  </>
);
