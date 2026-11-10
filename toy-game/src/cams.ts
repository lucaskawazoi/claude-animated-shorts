// Câmera de jogo: uma lista única de chaves no tempo. Entre dois cortes a câmera desliza (smootherstep) de um beat ao
// outro, sem parar; nos cortes (CUTS) ela salta. Tremida que troca de sinal a cada quadro nos impactos.
import * as THREE from 'three';
import { W, WE, CUTS, smoother, mix, clamp } from './lib';
import { routeCurve, shipU, T1, ll } from './MapSet';

type V = [number, number, number];
type Key = { t: number; p: V; c: V; fov?: number; roll?: number };
const v = (a: V) => new THREE.Vector3(...a);
const K = (t: number, p: V, c: V, fov = 50, roll = 0): Key => ({ t, p, c, fov, roll });

// segmentos entre cortes (o primeiro, o mapa, é calculado à parte)
const SEGMENTS = (): Key[][] => {
  const orbit = [0, 0.25, 0.5, 0.75, 1].map(k => { const ang = mix(3.75, 4.35, k), r = mix(24, 27, k);
    return K(mix(80.6, 87.4, k), [4 + Math.cos(ang) * r, mix(14, 19, k), 2 - Math.sin(ang) * r], [5, 3.2, 1], 52, mix(-2, 2, k)); });
  return [
    [ // 2: cava + morro desmorona
      K(10.3, [33.2, 6.0, 4.9], [36.3, 4.6, 1.8], 44, -2), K(12.2, [31.0, 9.4, 4.6], [40.5, 4.0, 0.3], 46, 2),
      K(14.1, [32.5, 11.5, 4.5], [42.0, 3.6, 0], 50, -2), K(W(52), [33.5, 10.6, 2.8], [42.0, 3.0, 0], 48, 0),
      K(W(57), [34.2, 10.2, 2.2], [42.0, 3.2, 0], 46, 3), K(20.767, [33.2, 11.5, 3.6], [41.5, 3.6, 0], 48, 1)],
    [ // 3: ⏪, chicote até as eclusas, construção, o navio entra, enche
      K(20.767, [29.0, 14.5, 10.0], [41.0, 4.0, 0], 50, -6), K(21.25, [30.5, 13.0, 8.0], [40.5, 4.0, 0], 50, 4),
      K(22.5, [-3.5, 10.5, 15.5], [-8.5, 1.6, 0], 50, -2), K(W(75), [-8.5, 6.4, 10.5], [-12.0, 1.2, 0], 48, 1),
      K(W(81), [-14.8, 3.6, 7.6], [-12.4, 0.9, 0.3], 48, 3), K(28.7, [-14.5, 3.6, 8.6], [-12.0, 1.8, 0], 50, -2),
      K(30.3, [-11.5, 4.6, 10.0], [-8.5, 2.3, 0], 50, 0)],
    [ // 4: elevador visto de cima do lago, ECLUSA, desce até a entrada do mar, raspa, mulas caem
      K(30.3, [3.0, 11.0, 8.5], [-6.0, 2.4, 0], 50, 2), K(32.6, [1.8, 9.2, 9.6], [-4.5, 3.0, 0], 50, 0),
      K(W(101), [0.6, 9.6, 10.6], [-5.5, 2.8, 0], 50, -2), K(35.0, [0.2, 9.4, 10.8], [-6.0, 2.6, 0], 50, -1),
      K(37.4, [-19.5, 5.2, 5.2], [-15.0, 0.4, -0.2], 50, 2), K(W(114), [-16.8, 6.2, 2.8], [-12.6, 0.5, -0.4], 46, -2),
      K(W(119), [-14.0, 6.4, 5.6], [-12.6, 1.0, 0], 48, 0), K(42.667, [-12.0, 6.0, 6.2], [-12.6, 1.2, 0], 48, 1)],
    [ // 5: mulas vistas de baixo, MULAS, navio sobe um degrau, a câmara despeja
      K(42.667, [-10.2, 1.9, 5.0], [-12.6, 1.9, 0], 48, 3), K(W(127), [-10.6, 2.3, 5.4], [-12.6, 2.0, 0], 48, 2),
      K(W(134), [-14.6, 5.4, 6.8], [-11.8, 2.2, 0], 50, -2), K(50.2, [-14.2, 5.8, 7.2], [-11.2, 2.2, 0], 50, -1),
      K(51.367, [-23.0, 2.8, 4.8], [-15.5, 0.9, 0], 48, 3)],
    [ // 6: o jorro visto do outro lado, voa até a represa, lago enche, seca, fila de navios
      K(51.367, [-19.5, 1.4, -6.5], [-15.5, 0.9, 0], 50, -2), K(52.6, [-18.6, 2.2, -7.6], [-15.0, 1.0, 0], 50, 0),
      K(53.6, [-4.0, 14.0, -21.0], [10.0, 2.0, -12.0], 50, 1), K(54.5, [8.5, 12.5, -31.0], [18.0, 2.6, -15.5], 50, -2),
      K(W(158), [6.0, 15.0, -29.0], [18.0, 2.6, -11.0], 52, 0), K(W(170), [2.0, 18.0, -24.5], [19.0, 3.0, -4.0], 54, 2),
      K(61.0, [0.5, 17.0, -20.0], [17.0, 3.0, -3.0], 54, 1), K(62.5, [-0.5, 8.6, -10.5], [8.5, 3.0, -4.5], 50, -2),
      K(W(181), [1.2, 7.6, -9.0], [9.0, 2.8, -4.0], 48, 1), K(64.7, [-5.0, 12.5, 4.0], [-16.0, 1.0, 0], 50, 0),
      K(W(188), [-11.5, 6.5, 7.0], [-26.0, 0.6, 0], 50, 2), K(68.1, [-13.5, 6.0, 5.5], [-30.0, 0.6, 0], 50, 3)],
    [ // 7: eclusas novas e piscinas
      K(68.1, [0.5, 12.0, 22.0], [-8.0, 2.0, 8.5], 52, -3), K(W(204), [-4.5, 9.5, 20.5], [-7.5, 2.2, 10.0], 50, 0),
      K(W(218), [-10.5, 8.6, 19.5], [-7.5, 2.0, 10.0], 48, 3), K(77.2, [-13.0, 9.0, 19.0], [-7.2, 2.1, 9.8], 48, 3)],
    [ // 8: a água volta (60 %), sobe para a vista aérea, ZEROU, CANAL DO PANAMÁ, desce até o operário
      K(77.2, [-7.5, 5.4, 16.0], [-7.5, 2.2, 11.0], 48, 2), K(79.6, [-5.5, 6.6, 15.5], [-7.0, 2.4, 10.0], 48, -1),
      ...orbit,
      K(W(244), [-1.2, 5.4, 6.4], [1.8, 4.6, 2.6], 46, 2), K(W(244) + 4, [-0.4, 5.2, 5.6], [2.4, 4.6, 2.2], 44, -1)],
  ];
};

const fromKeys = (t: number, ks: Key[]) => {
  let i = 0; while (i < ks.length - 2 && t > ks[i + 1].t) i++;
  const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)], k = b.t > a.t ? smoother(t, a.t, b.t) : 0;
  return { p: v(a.p).lerp(v(b.p), k), c: v(a.c).lerp(v(b.c), k), fov: mix(a.fov ?? 50, b.fov ?? 50, k), roll: mix(a.roll ?? 0, b.roll ?? 0, k) };
};

const KICKS = () => [[W(41), 0.10], [W(57), 0.22], [W(61), 0.12], [W(104), 0.1], [W(114), 0.16], [W(137), 0.1], [W(142), 0.12], [W(174), 0.1], [W(192), 0.12], [W(229), 0.15]];
const shake = (t: number) => {
  let s = 0; for (const [t0, a] of KICKS()) if (t >= t0 && t < t0 + 0.3) s += a * Math.exp(-(t - t0) * 12) * (Math.floor(t * 30) % 2 ? 1 : -1);
  return s;
};

export const camAt = (t: number) => {
  let r: { p: THREE.Vector3; c: THREE.Vector3; fov: number; roll: number };
  if (t < CUTS[0]) {
    const u = shipU(t), q = routeCurve.getPointAt(u);
    const far = smoother(t, 0.6, 2.6), end = smoother(t, T1() - 0.2, CUTS[0]);
    const [px, pz] = ll(-79.7, 9.0);
    const c = new THREE.Vector3(q.x, 0.2, q.z).lerp(new THREE.Vector3(px, 0.5, pz), end);
    const off = new THREE.Vector3(mix(-1.6, -6, far), mix(3.2, 26, far), mix(4.0, 19, far)).lerp(new THREE.Vector3(-1.5, 4.4, 3.4), end);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), mix(-0.55, 0.65, smoother(t, 0, CUTS[0])));
    r = { p: c.clone().add(off), c, fov: 50, roll: mix(-5, 4, clamp(t / 9)) };
  } else {
    const seg = SEGMENTS()[CUTS.filter(c => c <= t + 1e-6).length - 1];
    r = fromKeys(t, seg);
  }
  const s = shake(t);
  r.p.add(new THREE.Vector3(s, s * 0.6, -s * 0.5));
  void WE;
  return r;
};
