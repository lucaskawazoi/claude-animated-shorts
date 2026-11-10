// Câmera por chaves: cada plano começa num corte duro (t0) e desliza entre chaves com smootherstep.
import { V3, lerp, prog, sstep } from "./kit";

export type CamState = { pos: V3; look: V3; fov: number; roll: number };
export type Key = { t: number; pos: V3; look: V3; fov?: number; roll?: number };
export type Shot = { name: string; t0: number; keys: Key[]; fn?: (t: number) => CamState };
export const K = (t: number, pos: V3, look: V3, fov = 60, roll = 0): Key => ({ t, pos, look, fov, roll });
export const keyed = (keys: Key[], t: number): CamState => {
  let i = 0;
  for (let k = 0; k < keys.length - 1; k++) if (t >= keys[k].t) i = k;
  const a = keys[i], b = keys[i + 1] ?? a, u = sstep(prog(t, a.t, b.t));
  const m = (x: V3, y: V3): V3 => [lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)];
  return { pos: m(a.pos, b.pos), look: m(a.look, b.look), fov: lerp(a.fov ?? 60, b.fov ?? 60, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
};
