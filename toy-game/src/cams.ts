// Câmera de jogo: chaves por tomada, sempre em movimento (nenhuma pausa parada), com tremida nos impactos.
import * as THREE from 'three';
import { W, WE, SHOTS, shotAt, smoother, mix, clamp } from './lib';
import { routeCurve, shipU, T1, ll } from './MapSet';
import * as St from './story';

type V = [number, number, number];
type Key = { t: number; p: V; c: V; fov?: number; roll?: number };
const v = (a: V) => new THREE.Vector3(...a);

const shots: Record<string, (t: number) => Key[]> = {
  dig: () => [
    { t: SHOTS[1][0], p: [26.0, 13.0, 9.0], c: [37.0, 4.2, 0.5], fov: 50, roll: -2 },
    { t: W(31), p: [29.5, 10.5, 5.6], c: [38.5, 4.2, 0.3], fov: 46, roll: 1 },
    { t: W(38), p: [31.0, 10.8, 3.6], c: [42.5, 4.0, 0], fov: 46, roll: 3 },
    { t: SHOTS[2][0], p: [31.4, 11.2, 3.4], c: [43.0, 4.0, 0], fov: 46, roll: 2 },
  ],
  slide: () => [
    { t: SHOTS[2][0], p: [32.5, 11.5, 4.5], c: [42.0, 3.6, 0], fov: 50, roll: -3 },
    { t: W(52), p: [33.5, 10.6, 2.8], c: [42.0, 3.0, 0], fov: 48, roll: 0 },
    { t: W(57), p: [34.2, 10.2, 2.2], c: [42.0, 3.2, 0], fov: 46, roll: 3 },
    { t: SHOTS[3][0], p: [33.8, 10.8, 2.9], c: [42.0, 3.6, 0], fov: 48, roll: 1 },
  ],
  build: () => [
    { t: SHOTS[3][0], p: [-3.5, 10.5, 15.5], c: [-8.5, 1.6, 0], fov: 50, roll: -2 },
    { t: W(75), p: [-8.5, 6.4, 10.5], c: [-12.0, 1.2, 0], fov: 48, roll: 1 },
    { t: W(81), p: [-14.8, 3.6, 7.6], c: [-12.4, 0.9, 0.3], fov: 48, roll: 3 },
    { t: SHOTS[4][0], p: [-13.8, 3.3, 7.0], c: [-12.4, 1.3, 0.3], fov: 48, roll: 2 },
  ],
  elevator: () => [
    { t: SHOTS[4][0], p: [-14.5, 3.6, 8.6], c: [-12.0, 1.8, 0], fov: 50, roll: -2 },
    { t: 30.0, p: [-10.5, 5.0, 10.4], c: [-7.5, 2.6, 0], fov: 50, roll: 1 },
    { t: 32.4, p: [-6.0, 6.8, 11.2], c: [-4.5, 3.6, 0], fov: 50, roll: 3 },
    { t: SHOTS[5][0], p: [-1.8, 9.0, 12.5], c: [-6.5, 3.0, 0], fov: 52, roll: 1 },
  ],
  scrape: () => [
    { t: SHOTS[5][0], p: [-20.5, 5.2, 4.2], c: [-15.0, 0.4, -0.2], fov: 50, roll: 2 },
    { t: W(114), p: [-16.8, 6.2, 2.8], c: [-12.6, 0.5, -0.4], fov: 46, roll: -2 },
    { t: SHOTS[6][0], p: [-16.2, 6.4, 2.6], c: [-12.4, 0.6, -0.5], fov: 46, roll: -3 },
  ],
  mules: () => [
    { t: SHOTS[6][0], p: [-8.8, 5.6, 6.2], c: [-12.6, 1.4, 0], fov: 50, roll: 2 },
    { t: W(127), p: [-10.5, 4.6, 5.8], c: [-12.6, 1.8, 0], fov: 48, roll: -1 },
    { t: W(134), p: [-15.5, 5.6, 6.4], c: [-12.4, 2.2, 0], fov: 50, roll: -3 },
    { t: SHOTS[7][0], p: [-16.5, 6.2, 6.8], c: [-12.4, 2.2, 0], fov: 52, roll: -2 },
  ],
  dump: () => [
    { t: SHOTS[7][0], p: [-25.0, 3.6, 7.0], c: [-15.0, 1.2, 0], fov: 50, roll: 2 },
    { t: W(145), p: [-23.0, 2.6, 4.6], c: [-15.5, 0.9, 0], fov: 48, roll: -1 },
    { t: SHOTS[8][0], p: [-24.5, 3.0, 2.8], c: [-17.0, 0.8, 0], fov: 48, roll: -2 },
  ],
  lake: () => [
    { t: SHOTS[8][0], p: [8.5, 12.5, -31.0], c: [18.0, 2.6, -15.5], fov: 50, roll: -2 },
    { t: W(158), p: [6.0, 15.0, -29.0], c: [18.0, 2.6, -11.0], fov: 52, roll: 0 },
    { t: W(170), p: [2.0, 18.0, -24.5], c: [19.0, 3.0, -4.0], fov: 54, roll: 2 },
    { t: SHOTS[9][0], p: [0.5, 18.5, -22.0], c: [19.0, 3.0, -2.0], fov: 54, roll: 2 },
  ],
  drought: () => [
    { t: SHOTS[9][0], p: [-0.5, 8.6, -10.5], c: [8.5, 3.0, -4.5], fov: 50, roll: -2 },
    { t: W(181), p: [1.2, 7.6, -9.0], c: [9.0, 2.8, -4.0], fov: 48, roll: 1 },
    { t: (W(181) + W(187)) / 2 + 0.3, p: [-5.0, 12.5, 4.0], c: [-16.0, 1.0, 0], fov: 50, roll: 0 },
    { t: W(187), p: [-11.5, 6.5, 7.0], c: [-26.0, 0.6, 0], fov: 50, roll: 2 },
    { t: SHOTS[10][0], p: [-13.5, 6.0, 5.5], c: [-30.0, 0.6, 0], fov: 50, roll: 3 },
  ],
  newlocks: () => [
    { t: SHOTS[10][0], p: [-2.0, 11.5, 22.5], c: [-8.0, 2.0, 8.5], fov: 52, roll: -2 },
    { t: W(204), p: [-4.5, 9.5, 20.5], c: [-7.5, 2.2, 10.0], fov: 50, roll: 0 },
    { t: W(218), p: [-9.0, 8.6, 19.5], c: [-7.5, 2.0, 10.0], fov: 48, roll: 2 },
    { t: SHOTS[11][0], p: [-12.5, 9.0, 20.0], c: [-7.0, 2.2, 9.5], fov: 50, roll: 2 },
  ],
  reward: (t) => {
    const a0 = SHOTS[11][0], a1 = SHOTS[12][0];
    return [0, 0.25, 0.5, 0.75, 1].map(k => { const tt = mix(a0, a1, k), ang = mix(3.6, 4.6, k), r = mix(24, 28, k);
      return { t: tt, p: [4 + Math.cos(ang) * r, mix(15, 19, k), 2 + Math.sin(ang) * r * -1] as V, c: [6, 3.2, 1] as V, fov: 52, roll: mix(-2, 2, k) }; });
  },
  cta: () => [
    { t: SHOTS[12][0], p: [-1.2, 5.4, 6.4], c: [1.8, 4.6, 2.6], fov: 46, roll: 2 },
    { t: SHOTS[12][0] + 4, p: [-0.4, 5.2, 5.6], c: [2.4, 4.6, 2.2], fov: 44, roll: -1 },
  ],
};

const fromKeys = (t: number, ks: Key[]) => {
  let i = 0; while (i < ks.length - 2 && t > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], k = b.t > a.t ? smoother(t, a.t, b.t) : 0;
  return { p: v(a.p).lerp(v(b.p), k), c: v(a.c).lerp(v(b.c), k), fov: mix(a.fov ?? 50, b.fov ?? 50, k), roll: mix(a.roll ?? 0, b.roll ?? 0, k) };
};

// tremida que troca de sinal a cada quadro e morre em ~7 quadros
const KICKS = () => [[W(41), 0.10], [W(57), 0.22], [W(61), 0.12], [W(104), 0.1], [W(114), 0.16], [W(137), 0.1], [W(142), 0.12], [W(174), 0.1], [W(192), 0.12], [W(229), 0.15]];
const shake = (t: number) => {
  let s = 0; for (const [t0, a] of KICKS()) if (t >= t0 && t < t0 + 0.3) s += a * Math.exp(-(t - t0) * 12) * (Math.floor(t * 30) % 2 ? 1 : -1);
  return s;
};

export const camAt = (t: number) => {
  const name = SHOTS[shotAt(t)][1];
  let r: { p: THREE.Vector3; c: THREE.Vector3; fov: number; roll: number };
  if (name === 'map') {
    const u = shipU(t), q = routeCurve.getPointAt(u);
    const far = smoother(t, 0.6, 2.6), end = smoother(t, T1() - 0.3, WE(25) + 1.0);
    const [px, pz] = ll(-79.7, 9.0);
    const c = new THREE.Vector3(q.x, 0.2, q.z).lerp(new THREE.Vector3(px, 0.4, pz), end);
    const off = new THREE.Vector3(mix(-1.6, -6, far), mix(3.2, 26, far), mix(4.0, 19, far)).lerp(new THREE.Vector3(-2.5, 9, 8), end);
    r = { p: c.clone().add(off), c, fov: 50, roll: mix(-3, 2, clamp(t / 7)) };
  } else r = fromKeys(t, shots[name](t));
  const s = shake(t);
  r.p.add(new THREE.Vector3(s, s * 0.6, -s * 0.5));
  void St;
  return r;
};
