// O estado do mundo em função do tempo: níveis d'água, comportas, navios, escavação, represa, lago.
import { W, smooth, mix, lin, clamp, shotStart } from './lib';

type K = [number, number][];
export const keys = (t: number, k: K) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return mix(k[i - 1][1], k[i][1], smooth(t, k[i - 1][0], k[i][0]));
  return k[k.length - 1][1];
};
const S = shotStart;

// ---- eclusa antiga: 3 câmaras, níveis baixos 0 / 1,2 / 2,4 e altos 1,2 / 2,4 / 3,6 ----
export const oldBuild = () => W(71);                         // "você SOBE o navio": as peças caem
export const lvl = (t: number, i: number) => {
  if (i === 0) return keys(t, [[0, 0], [W(85), 0], [W(88) + 0.1, 1.2], [S('scrape') - 0.02, 1.2], [S('scrape'), 0],
    [44.9, 0], [46.4, 1.2], [50.2, 1.2], [51.6, 0]]);
  if (i === 1) return keys(t, [[0, 1.2], [30.1, 1.2], [30.8, 2.4], [S('scrape') - 0.02, 2.4], [S('scrape'), 1.2]]);
  return t >= S('drought') ? lake(t) : keys(t, [[0, 2.4], [31.9, 2.4], [32.6, 3.6]]);
};
export const gate = (t: number, i: number) => { // 1 = aberta
  if (i === 0) return keys(t, [[0, 1], [W(81), 1], [W(81) + 0.5, 0], [S('scrape') - 0.02, 0], [S('scrape'), 1], [44.3, 1], [44.8, 0],
    [50.0, 0], [50.4, 1], [S('newlocks'), 1]]);
  if (i === 1) return keys(t, [[28.95, 0], [29.2, 1], [29.9, 1], [30.1, 0]]);
  if (i === 2) return keys(t, [[30.8, 0], [31.0, 1], [31.7, 1], [31.9, 0]]);
  return keys(t, [[S('reward'), 0], [S('reward') + 0.6, 1]]);
};
export const levelAtX = (t: number, x: number) => x < -15 ? 0 : x < -10 ? lvl(t, 0) : x < -5 ? lvl(t, 1) : x < 0.2 ? lvl(t, 2) : lake(t);

// ---- navios ----
export type ShipState = { id: string; seed: number; L?: number; B?: number; x: number; z: number; y?: number; yaw?: number; roll?: number; on: boolean; newLock?: boolean };
export const ships = (t: number): ShipState[] => {
  const out: ShipState[] = [];
  // navio A: o que sobe pelo elevador (tomadas build/elevator) e sai para o lago no final
  const ax = keys(t, [[0, -20.5], [W(75), -20.5], [W(80) + 0.4, -12.5], [29.2, -12.5], [29.9, -7.5], [31.0, -7.5], [31.7, -2.5],
    [S('reward') + 0.5, -2.5], [S('reward') + 7.5, 9], [S('cta'), 9.5], [S('cta') + 4, 13]]);
  out.push({ id: 'A', seed: 3, x: ax, z: 0, on: (t >= S('build') && t < S('scrape')) || t >= S('reward') });
  // navio B: o que raspa, ganha as mulas e depois desce despejando água no mar
  const bx = keys(t, [[S('scrape'), -21], [S('scrape') + 0.3, -21], [W(114), -12.6], [51.7, -12.6], [53.6, -21]]);
  const wob = t < W(114) ? Math.sin((t - S('scrape')) * 5.5) * 0.16 * lin(t, S('scrape') + 0.5, W(114)) : 0;
  const hit = t >= W(114) ? mix(-0.24, 0, smooth(t, 42.5, 43.5)) : wob;
  out.push({ id: 'B', seed: 7, x: bx, z: hit, yaw: t < W(114) ? wob * 0.25 : hit * 0.12, roll: t >= W(114) && t < 42.5 ? -0.05 : 0,
    on: t >= S('scrape') && t < S('lake') });
  // fila de navios na seca
  if (t >= S('drought') && t < S('newlocks')) for (let i = 0; i < 4; i++)
    out.push({ id: `Q${i}`, seed: 11 + i, x: -23 - i * 6.2, z: 0.4 * Math.sin(i * 2), on: true, yaw: 0.05 * Math.sin(i) });
  // eclusa nova: C desce entregando água às piscinas, sai; D entra e sobe com a água que volta
  const cx = keys(t, [[0, -7.5], [75.25, -7.5], [76.0, -12.6]]);
  out.push({ id: 'C', seed: 21, L: 4.5, B: 2.6, x: cx, z: 7.6, on: t >= S('newlocks') + 2.6 && t < 76.0, newLock: true });
  const dx = keys(t, [[0, -12.6], [76.0, -12.6], [76.8, -7.5]]);
  out.push({ id: 'D', seed: 23, L: 4.5, B: 2.6, x: dx, z: 7.6, on: t >= 76.0 && t < S('reward'), newLock: true });
  // final: tráfego no lago e na eclusa nova
  if (t >= S('reward')) {
    out.push({ id: 'E', seed: 31, x: keys(t, [[S('reward'), 22], [S('cta') + 4, 10]]), z: -6, yaw: Math.PI, on: true });
    out.push({ id: 'F', seed: 33, L: 4.5, B: 2.6, x: keys(t, [[S('reward'), -12.5], [S('reward') + 3, -12.5], [S('reward') + 5, -7.5]]), z: 7.6, on: true, newLock: true });
  }
  return out;
};
export const newLvl = (t: number, i: number) => {
  if (i === 0) return 1.2;
  if (i === 1) return keys(t, [[0, 2.4], [W(207), 2.4], [W(217), 1.2], [76.8, 1.2], [78.2, 2.4]]);
  return Math.min(lake(t), 3.6);
};
export const basinFill = (t: number) => keys(t, [[0, 0.15], [W(207), 0.15], [W(217), 0.85], [76.8, 0.85], [78.2, 0.15]]);
export const newGate = (t: number, i: number) => i === 1 ? keys(t, [[75.1, 0], [75.3, 1], [76.8, 1], [77.0, 0]]) : 0;
export const newBuild = () => W(200);
export const basinBuild = () => W(204);

// ---- mulas ----
export const mulesOn = (t: number) => t >= W(119) && t < S('lake');
export const cablesOn = (t: number) => clamp((t - W(123)) / 0.4) * (t < 51.4 ? 1 : 0);

// ---- escavação, desmoronamento e rebobinar ----
const REW_A = W(62), REW_B = REW_A + 1.1;
const digTime = (t: number) => t < REW_A ? t : t < REW_B ? mix(REW_A, 9.0, lin(t, REW_A, REW_B)) : 9.0;
export const rewinding = (t: number) => t >= REW_A && t < REW_B + 0.15;
export const dig = (t: number) => { const tt = digTime(t); return {
  prog: smooth(tt, W(31), W(38) + 0.6),       // fatias do morro rebaixadas até o planalto
  deep: smooth(tt, W(52), W(54) + 0.45),      // o corte desce até 2,6
  slide: smooth(tt, W(56), W(61) + 0.2),      // a terra desmorona de volta
}; };

// ---- represa e lago ----
export const damT = () => W(154);
export const lake = (t: number) => keys(t, [[0, 2.43], [W(158), 2.43], [W(166) + 0.6, 3.6], [W(178), 3.6], [W(180) + 1.0, 3.0], [77, 3.0], [79.5, 3.6]]);
