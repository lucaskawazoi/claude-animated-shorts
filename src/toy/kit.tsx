// Primitivas do mundo de brinquedo: materiais em cache + caixa, cilindro, esfera, cone. Tudo low-poly, cores chapadas.
// Cada componente aceita p (posição), r (rotação, rad), sc (escala) e c (cor). Sem estado: o quadro decide tudo.
import React from "react";
import * as THREE from "three";

export type V3 = [number, number, number];
export type MatOpts = { rough?: number; metal?: number; emissive?: string; ei?: number; flat?: boolean; opacity?: number; side?: "double" | "back"; depthWrite?: boolean };

const cache = new Map<string, THREE.MeshStandardMaterial>();
export const mat = (color: string, o: MatOpts = {}) => {
  const k = color + JSON.stringify(o);
  let m = cache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color, roughness: o.rough ?? 0.78, metalness: o.metal ?? 0, emissive: o.emissive ?? "#000000", emissiveIntensity: o.ei ?? 1,
      flatShading: !!o.flat, transparent: o.opacity !== undefined && o.opacity < 1, opacity: o.opacity ?? 1,
      side: o.side === "double" ? THREE.DoubleSide : o.side === "back" ? THREE.BackSide : THREE.FrontSide,
      depthWrite: o.depthWrite ?? true,
    });
    cache.set(k, m);
  }
  return m;
};

type Common = { p?: V3; r?: V3; sc?: V3 | number; c: string; o?: MatOpts; cast?: boolean; recv?: boolean; vis?: boolean; children?: React.ReactNode };
const sc3 = (s?: V3 | number): V3 | undefined => (s === undefined ? undefined : typeof s === "number" ? [s, s, s] : s);

export const Box: React.FC<Common & { s: V3 }> = ({ s, p, r, sc, c, o, cast = true, recv = true, vis = true, children }) => (
  <mesh position={p} rotation={r} scale={sc3(sc)} castShadow={cast} receiveShadow={recv} visible={vis} material={mat(c, o)}>
    <boxGeometry args={s} />{children}
  </mesh>
);
export const Cyl: React.FC<Common & { rt: number; rb?: number; h: number; seg?: number; open?: boolean; ts?: number; tl?: number }> = ({ rt, rb, h, seg = 16, open = false, ts = 0, tl = Math.PI * 2, p, r, sc, c, o, cast = true, recv = true, vis = true, children }) => (
  <mesh position={p} rotation={r} scale={sc3(sc)} castShadow={cast} receiveShadow={recv} visible={vis} material={mat(c, o)}>
    <cylinderGeometry args={[rt, rb ?? rt, h, seg, 1, open, ts, tl]} />{children}
  </mesh>
);
export const Sph: React.FC<Common & { rad: number; ws?: number; hs?: number; ps?: number; pl?: number }> = ({ rad, ws = 14, hs = 10, ps = 0, pl = Math.PI, p, r, sc, c, o, cast = true, recv = true, vis = true, children }) => (
  <mesh position={p} rotation={r} scale={sc3(sc)} castShadow={cast} receiveShadow={recv} visible={vis} material={mat(c, o)}>
    <sphereGeometry args={[rad, ws, hs, 0, Math.PI * 2, ps, pl]} />{children}
  </mesh>
);
export const Cone: React.FC<Common & { rad: number; h: number; seg?: number }> = ({ rad, h, seg = 6, p, r, sc, c, o, cast = true, recv = true, vis = true, children }) => (
  <mesh position={p} rotation={r} scale={sc3(sc)} castShadow={cast} receiveShadow={recv} visible={vis} material={mat(c, o)}>
    <coneGeometry args={[rad, h, seg]} />{children}
  </mesh>
);
export const Quad: React.FC<Common & { w: number; h: number }> = ({ w, h, p, r, sc, c, o, cast = false, recv = true, vis = true }) => (
  <mesh position={p} rotation={r} scale={sc3(sc)} castShadow={cast} receiveShadow={recv} visible={vis} material={mat(c, { side: "double", ...o })}>
    <planeGeometry args={[w, h]} />
  </mesh>
);

export const G: React.FC<{ p?: V3; r?: V3; sc?: V3 | number; vis?: boolean; children?: React.ReactNode }> = ({ p, r, sc, vis = true, children }) => (
  <group position={p} rotation={r} scale={sc3(sc)} visible={vis}>{children}</group>
);

// ---- tempo e suavização ----
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / Math.max(1e-6, b - a));
export const sstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10); // smootherstep
export const ease = (t: number, a: number, b: number) => sstep(prog(t, a, b));
export const outBack = (u: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }; // pseudo-aleatório estável
export const vlerp = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// cano entre dois pontos: devolve posição, rotação e comprimento para um cilindro de altura = comprimento
export const pipeXf = (a: V3, b: V3): { p: V3; r: V3; len: number } => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  const m = va.clone().add(vb).multiplyScalar(0.5);
  return { p: [m.x, m.y, m.z], r: [e.x, e.y, e.z], len };
};
export const Pipe: React.FC<{ a: V3; b: V3; rad: number; c: string; o?: MatOpts; seg?: number; cast?: boolean }> = ({ a, b, rad, c, o, seg = 10, cast = true }) => {
  const { p, r, len } = pipeXf(a, b);
  return <Cyl rt={rad} h={len} p={p} r={r} c={c} o={o} seg={seg} cast={cast} />;
};
export const fract = (x: number) => x - Math.floor(x);
