// Câmera e operário do quadro, a partir dos dados do episódio atual (src/ep/current.ts).
import { EP } from "../ep/current";
import { WINS } from "./cues";
import { CamState, keyed } from "./cam";
import { V3, lerp, prog, sstep } from "./kit";
import { PoseName, Prop } from "./worker";

export const shotAt = (t: number) => { let s = EP.SHOTS[0]; for (const x of EP.SHOTS) if (t >= x.t0) s = x; return s; };

/** dinamismo por janela da régua: a dissect pontua a ORDEM do movimento entre planos (whips agitados, fim calmo) */
const dynAt = (t: number) => { let d = EP.DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = EP.DYN[i]; }); return d; };

/** câmera = plano atual + câmera na mão (tremor, deriva e rolagem) proporcional ao dinamismo da janela */
export const camAt = (t: number): CamState => {
  const s = shotAt(t), c = s.fn ? s.fn(t) : keyed(s.keys, t), d = dynAt(t);
  const n = (f: number, ph: number) => Math.sin(t * f + ph);
  return {
    pos: [c.pos[0] + d * (0.12 * n(2.3, 0) + 0.07 * n(5.1, 1) + 0.7 * n(0.9, 9)), c.pos[1] + d * (0.09 * n(1.9, 2) + 0.05 * n(6.3, 3) + 0.2 * n(1.3, 4)), c.pos[2] + d * 0.1 * n(2.7, 4)],
    look: [c.look[0] + d * (0.09 * n(2.9, 5) + 0.3 * n(1.1, 3)), c.look[1] + d * 0.07 * n(3.7, 6), c.look[2]],
    fov: c.fov, roll: c.roll * (0.5 + 0.5 * d) + d * (0.9 * n(1.3, 7) + 0.5 * n(4.1, 8)),
  };
};

export type WorkerState = { p: V3; yaw: number; pose: PoseName; prop?: Prop; scale?: number; prev?: PoseName; u?: number; mv?: number; follow?: (t: number) => V3 };
/** operário: lista [instante, estado]; caminha (desliza com pulinhos) quando o próximo ponto é perto, salta quando é longe (corte) */
export const workerAt = (t: number): WorkerState => {
  const list = EP.WORKER;
  let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k;
  const cur = list[i][1], prev = list[Math.max(0, i - 1)][1];
  const dist = Math.hypot(cur.p[0] - prev.p[0], cur.p[2] - prev.p[2]), w = dist < 16 && dist > 0.2 ? sstep(prog(t, list[i][0], list[i][0] + 0.9)) : 1;
  const p: V3 = cur.follow ? cur.follow(t) : [lerp(prev.p[0], cur.p[0], w), cur.p[1], lerp(prev.p[2], cur.p[2], w)];
  return { ...cur, p, prev: prev.pose, u: sstep(prog(t, list[i][0], list[i][0] + 0.3)), mv: !cur.follow && w < 1 ? 1 : 0 };
};
