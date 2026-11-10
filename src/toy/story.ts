// A história como dados: planos de câmera (cada plano começa num corte duro e desliza entre chaves), posição/pose do operário.
// Tudo ancorado em T (palavras ditas). Mudar o roteiro = regerar words.json; nenhum segundo "mágico" aqui.
import { T } from "./cues";
import { V3, lerp, prog, sstep } from "./kit";
import { CANAL_END, flowFront, truckX } from "./stations";
import { PoseName } from "./worker";

export type CamState = { pos: V3; look: V3; fov: number; roll: number };
type Key = { t: number; pos: V3; look: V3; fov?: number; roll?: number };
type Shot = { name: string; t0: number; keys: Key[]; fn?: (t: number) => CamState };
const K = (t: number, pos: V3, look: V3, fov = 60, roll = 0): Key => ({ t, pos, look, fov, roll });

export const SHOTS: Shot[] = [
  // 7 cortes duros (10,5 · 20,5 · 29,9 · 43,0 · 51,6 · 68,3 · 76,6 s); o resto são deslizes e whips contínuos, como na régua.
  { name: "campo", t0: 0, keys: [K(0, [-31.5, 3.4, 13.0], [-26.0, 1.9, 2.0], 62, 3)],
    fn: (t) => { // começa parado no operário e depois acompanha o caminhão até a moenda
      const tx = truckX(t), u = sstep(prog(t, 2.2, 5.0));
      return { pos: [lerp(-31.5, tx - 2.0, u), lerp(3.4, 4.0, u), 13.2], look: [lerp(-26.0, tx + 4.5, u), lerp(1.9, 2.2, u), 2.6], fov: 62, roll: lerp(3, -1.5, u) };
    } },
  { name: "moenda>caldeira", t0: T.moenda - 0.6, keys: [
    K(T.moenda - 0.6, [-9.5, 4.6, 14.0], [-6.5, 2.8, -3.0], 62, 2), K(T.montanha - 0.2, [-4.0, 5.0, 14.5], [-0.5, 3.0, -3.0], 62, -1.5),
    K(T.p1 - 0.3, [3.0, 5.0, 15.0], [4.0, 3.6, -3.2], 64, 3), K(T.d1 - 0.05, [3.6, 4.6, 14.5], [4.0, 3.8, -3.2], 66, 5),
    K(T.joga + 1.0, [10.5, 4.4, 14.0], [12.5, 2.8, -2.0], 62, -2), K(T.fogo + 0.4, [11.5, 4.6, 14.2], [13.5, 3.0, -2.5], 62, -2)] },
  { name: "fogo>energia>carro", t0: T.fogo + 0.45, keys: [
    K(T.fogo + 0.45, [13.2, 2.6, 8.5], [14.4, 1.9, -1.8], 52, 3), K(T.fogo + 1.0, [13.8, 3.0, 9.5], [14.6, 2.4, -1.8], 54, 2),
    K(T.turbina + 0.55, [21.0, 5.0, 14.0], [24.5, 3.6, -3.5], 62, -5), K(T.energia, [22.5, 5.6, 14.0], [25.0, 5.0, -3.5], 62, 1.5),
    K(T.essaCaldeira - 0.1, [17.0, 7.5, 22.0], [17.0, 7.0, -3.0], 66, -2), K(T.maisCaldo + 1.0, [17.5, 6.0, 21.0], [17.5, 3.5, 2.0], 68, 0),
    K(T.garapa - 0.45, [18.0, 3.6, 17.5], [17.5, 1.6, 6.4], 60, 1)] },
  { name: "carro>dorna", t0: T.garapa - 0.4, keys: [
    K(T.garapa - 0.4, [19.0, 3.0, 15.5], [19.8, 1.5, 6.4], 54, 2), K(T.p2 + 0.4, [19.8, 3.0, 16.5], [20.0, 1.7, 6.4], 56, 2), K(T.d2, [19.8, 3.0, 16.5], [20.0, 1.7, 6.4], 56, 2),
    K(T.d2 + 1.4, [36.0, 4.6, 14.5], [39.0, 3.4, -2.0], 62, -5), K(T.devora, [38.0, 4.2, 12.0], [39.2, 3.6, -1.5], 60, 1),
    K(T.essaDorna, [39.0, 4.2, 11.0], [39.4, 3.6, -1.0], 58, -1.5), K(T.nove, [40.5, 4.2, 11.0], [41.0, 3.4, -1.0], 58, 1.5), K(T.restoAgua - 0.25, [41.0, 4.2, 11.0], [41.0, 3.4, -1.0], 58, 2)] },
  { name: "agua>coluna", t0: T.restoAgua - 0.2, keys: [
    K(T.restoAgua - 0.2, [41.2, 3.6, 7.5], [40.0, 3.6, -1.0], 46, 3), K(T.p3 + 0.4, [41.0, 3.8, 8.0], [40.5, 3.6, -1.0], 48, 2), K(T.d3, [41.0, 3.8, 8.0], [40.5, 3.6, -1.0], 48, 2),
    K(T.d3 + 2.0, [52.5, 3.8, 17.0], [56.0, 3.4, -3.0], 64, -6), K(T.ferve, [54.0, 5.0, 19.0], [56.5, 6.0, -3.0], 66, -2),
    K(T.sobe - 0.3, [54.0, 5.0, 19.5], [56.5, 5.0, -3.0], 66, 1), K(T.viraEtanol - 0.45, [55.0, 6.5, 20.0], [57.0, 13.5, -3.0], 68, 5)] },
  { name: "etanol>vinhaca", t0: T.viraEtanol - 0.4, keys: [
    K(T.viraEtanol - 0.4, [58.5, 3.2, 12.0], [61.0, 3.6, 0.0], 54, 2), K(T.essaDestilaria, [55.5, 7.0, 22.5], [58.0, 6.5, -3.0], 68, 1),
    K(T.enche - 0.2, [58.5, 4.2, 18.0], [60.5, 2.6, 4.0], 62, -2), K(T.preto, [57.5, 3.6, 17.5], [59.5, 2.4, 3.0], 60, 2),
    K(T.vinhaca - 0.1, [55.0, 4.6, 22.0], [54.0, 1.0, 8.0], 62, 2), K(T.p4 + 0.4, [54.0, 4.4, 22.0], [54.0, 1.0, 9.0], 60, -1), K(T.d4, [54.0, 4.4, 22.0], [54.0, 1.0, 9.0], 60, -1),
    K(T.potassio, [53.0, 4.5, 20.0], [48.0, 0.8, 9.9], 60, -3), K(T.canais - 0.1, [52.0, 3.6, 18.0], [50.0, 0.8, 9.9], 60, -4)] },
  { name: "canal>lavoura", t0: T.canais - 0.08, keys: [
    K(CANAL_END, [-11.0, 4.2, 18.0], [-19.5, 0.6, 9.9], 62, 2), K(CANAL_END + 0.9, [-21.0, 5.0, 17.0], [-31.0, 2.0, -2.0], 62, -3),
    K(T.gera + 0.15, [-25.0, 6.0, 17.5], [-35.0, 2.8, -3.0], 64, 2)],
    fn: (t) => {
      if (t >= CANAL_END) return keyed(SHOTS[6].keys, t);
      const xf = flowFront(t), u = sstep(prog(t, T.canais - 0.08, T.canais + 0.4));
      return { pos: [lerp(52.0, xf + 7, u), lerp(3.6, 4.2, u), 18.0], look: [lerp(50.0, xf - 1.5, u), 0.6, 9.9], fov: 62, roll: lerp(-4, 2, u) };
    } },
  { name: "energia>cidade", t0: T.gera + 0.2, keys: [
    K(T.gera + 0.2, [20.0, 6.0, 14.0], [25.0, 5.0, -3.5], 60, 2), K(T.vende, [36.0, 6.0, 14.0], [46.0, 12.5, -9.0], 64, -2),
    K(T.cidade - 0.4, [64.0, 6.0, 13.0], [74.0, 5.0, -9.0], 62, 1), K(T.parabens - 0.1, [70.0, 5.0, 11.0], [78.0, 3.5, -8.0], 60, -1),
    K(88.5, [69.0, 7.0, 16.0], [78.5, 3.2, -8.0], 59, 0), K(T.end, [68.6, 7.4, 16.6], [78.6, 3.2, -8.0], 59, 0)] },
];

const keyed = (keys: Key[], t: number): CamState => {
  let i = 0;
  for (let k = 0; k < keys.length - 1; k++) if (t >= keys[k].t) i = k;
  const a = keys[i], b = keys[i + 1] ?? a, u = sstep(prog(t, a.t, b.t));
  const m = (x: V3, y: V3): V3 => [lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)];
  return { pos: m(a.pos, b.pos), look: m(a.look, b.look), fov: lerp(a.fov ?? 60, b.fov ?? 60, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};

export const shotAt = (t: number): Shot => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return s; };

/** dinamismo da câmera por janela: a régua (dissect) mede o movimento por plano e o que importa é a ORDEM entre planos:
 *  whips curtos (janelas 3 e 7) são os mais agitados, o final (11) o mais calmo. Janelas = tempos do original x (duração/96,76). */
const DYN: [number, number][] = [[0, 2.2], [9.85, 0.7], [20.9, 2.2], [22.35, 2.4], [30.4, 0.15], [42.9, 0.3], [50.8, 2.6], [51.7, 2.4], [68.5, 0.3], [77.7, 2.8], [88.7, 0.08]];
const dynAt = (t: number) => { let d = DYN[0][1]; for (const [t0, v] of DYN) if (t >= t0) d = v; return d; };

/** câmera do quadro: plano atual + câmera na mão (tremor, deriva e rolagem) proporcionais ao dinamismo da janela */
export const camAt = (t: number): CamState => {
  const s = shotAt(t), c = s.fn ? s.fn(t) : keyed(s.keys, t), d = dynAt(t);
  const n = (f: number, ph: number) => Math.sin(t * f + ph);
  return {
    pos: [c.pos[0] + d * (0.12 * n(2.3, 0) + 0.07 * n(5.1, 1) + 0.7 * n(0.9, 9)), c.pos[1] + d * (0.09 * n(1.9, 2) + 0.05 * n(6.3, 3) + 0.2 * n(1.3, 4)), c.pos[2] + d * 0.1 * n(2.7, 4)],
    look: [c.look[0] + d * (0.09 * n(2.9, 5) + 0.3 * n(1.1, 3)), c.look[1] + d * 0.07 * n(3.7, 6), c.look[2]],
    fov: c.fov, roll: c.roll * (0.5 + 0.5 * d) + d * (0.9 * n(1.3, 7) + 0.5 * n(4.1, 8)),
  };
};

// ── operário: onde está e o que faz, por plano ────────────────────────────────
export type WorkerState = { p: V3; yaw: number; pose: PoseName; scale?: number; prev?: PoseName; u?: number; mv?: number };
const seg = (t: number, list: [number, WorkerState][]): WorkerState => {
  let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k;
  const cur = list[i][1], prev = list[Math.max(0, i - 1)][1];
  // caminha (desliza com pulinhos) até a próxima posição quando ela é perto; salto grande = corte de plano
  const dist = Math.hypot(cur.p[0] - prev.p[0], cur.p[2] - prev.p[2]), w = dist < 16 && dist > 0.2 ? sstep(prog(t, list[i][0], list[i][0] + 0.9)) : 1;
  const p: V3 = [lerp(prev.p[0], cur.p[0], w), 0, lerp(prev.p[2], cur.p[2], w)];
  return { ...cur, p, prev: prev.pose, u: sstep(prog(t, list[i][0], list[i][0] + 0.3)), mv: w < 1 ? 1 : 0 };
};
export const workerAt = (t: number): WorkerState => seg(t, [
  [0, { p: [-32.2, 0, 6.2], yaw: 0.3, pose: "present" }],
  [T.quinhentas, { p: [-22.0, 0, 6.6], yaw: 0.4, pose: "point" }],
  [T.moenda - 0.6, { p: [-10.8, 0, 5.6], yaw: 0.2, pose: "point" }],
  [T.montanha, { p: [-1.6, 0, 6.4], yaw: 0.0, pose: "alarm" }],
  [T.p1 - 0.2, { p: [-0.6, 0, 6.4], yaw: 0.0, pose: "think" }],
  [T.d1 - 0.05, { p: [8.8, 0, 5.6], yaw: 0.2, pose: "point" }],
  [T.fogo + 0.45, { p: [11.6, 0, 5.6], yaw: 0.1, pose: "present" }],
  [T.turbina + 0.2, { p: [21.0, 0, 5.8], yaw: 0.0, pose: "point" }],
  [T.essaCaldeira - 0.1, { p: [13.5, 0, 10.0], yaw: 0.0, pose: "cheer" }],
  [T.maisCaldo - 0.2, { p: [15.2, 0, 9.6], yaw: 0.35, pose: "think" }],
  [T.garapa - 0.4, { p: [16.9, 0, 9.4], yaw: 0.3, pose: "think" }],
  [T.p2 - 0.2, { p: [16.9, 0, 9.4], yaw: 0.3, pose: "alarm" }],
  [T.d2 + 0.55, { p: [35.4, 0, 6.0], yaw: 0.2, pose: "point" }],
  [T.essaDorna, { p: [36.2, 0, 6.2], yaw: 0.0, pose: "present" }],
  [T.restoAgua, { p: [37.4, 0, 6.2], yaw: 0.0, pose: "think" }],
  [T.d3 + 0.55, { p: [52.0, 0, 9.0], yaw: 0.25, pose: "point" }],
  [T.essaDestilaria, { p: [53.2, 0, 11.0], yaw: 0.0, pose: "present" }],
  [T.vinhaca - 0.1, { p: [51.8, 0, 15.0], yaw: -0.1, pose: "nose" }],
  [T.p4 - 0.2, { p: [51.8, 0, 15.2], yaw: -0.1, pose: "alarm" }],
  [T.d4, { p: [49.0, 0, 14.0], yaw: 0.2, pose: "point" }],
  [CANAL_END, { p: [-25.0, 0, 9.5], yaw: 0.35, pose: "present" }],
  [CANAL_END + 0.9, { p: [-28.0, 0, 9.0], yaw: 0.1, pose: "cheer" }],
  [T.gera + 0.2, { p: [22.4, 0, 8.4], yaw: 0.3, pose: "point" }],
  [T.vende - 0.3, { p: [22.4, -60, 8.4], yaw: 0.3, pose: "point", scale: 0 }],
  [T.cidade - 1.2, { p: [64.0, 0, 7.6], yaw: 0.4, pose: "present" }],
  [T.parabens - 0.1, { p: [71.5, 0, 6.0], yaw: 0.1, pose: "cheer" }],
]);
