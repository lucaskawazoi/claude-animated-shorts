// Mundo do E13: a ponte Q'eswachaka de brinquedo. Cânion do Apurímac ao longo de z (rio em y=0, |x|<5), paredes em
// degraus de estratos (camada i livre até |x| = edgeAt(i)), puna no alto (y=H, |x|>15). A ponte cruza em x (-14,8..14,8)
// sobre bases de pedra; pedras de ancoragem em x=±19,6. Oficina na puna esquerda: capim, armação de torcer (z=4),
// armação do teste da corda (x=-24,5, z 12–15), rolos (z -3..-5,6). A ponte nova (nos 3 dias) fica atrás, em z=NZ.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, pipeXf, prog, rnd } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { Costume, Crowd, PoseName } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { T } from "./cues";

const PI = Math.PI;
const [C1, , , , C5, C6, C7] = CUTS;
export const H = 16;
const LAY = 1.6, NL = 10;
/** meia-largura livre do cânion na camada i (a pedra começa em |x| = edgeAt(i) + jitter ≥ 0) */
export const edgeAt = (i: number) => 4 + 11 * ((i + 1) / NL);
export const X0 = 14.8, Y0 = H + 0.95, NZ = -3.4;
const STRAW = "#dcb65a", ROTC = "#857c69", WOOD = "#8a5a32", MATC = "#e6cf86", MATC2 = "#d2b466", STONE = "#a69e90";

// roupas: o operário (poncho azul-celeste + chullo) e as 4 comunidades
export const PONCHO: Costume = { skin: "#a8673f", top: "#2f9fd8", bottom: "#3a2a20", kilt: "#2f9fd8", kiltLen: 0.34, hat: "cap", hatC: "#f2c14e", boot: "#5a3a24", belt: "#f2c14e", sleeves: true };
const folk = (top: string, hat: string): Costume => ({ skin: "#a8673f", top, bottom: "#2e2620", kilt: top, kiltLen: 0.34, hat: "cap", hatC: hat, boot: "#4a3020", sleeves: true });
export const COMM = [folk("#c8352a", "#f2e6c8"), folk("#3c9a3c", "#f2c14e"), folk("#e0a81e", "#c8352a"), folk("#7a3fa0", "#f2e6c8")];
export const COMM_HEX = ["#c8352a", "#3c9a3c", "#e0a81e", "#7a3fa0"];

// ---------------------------------------------------------------- corda trançada (3 fios em hélice; 1 malha por trecho)
const L0 = 2.5;
class Helix extends THREE.Curve<THREE.Vector3> {
  constructor(private rr: number, private turns: number, private ph: number) { super(); }
  getPoint(s: number, v = new THREE.Vector3()) { const a = s * PI * 2 * this.turns + this.ph; return v.set(Math.cos(a) * this.rr, (s - 0.5) * L0, Math.sin(a) * this.rr); }
}
const braidCache = new Map<number, THREE.BufferGeometry>();
const braidGeo = (R: number) => {
  let g = braidCache.get(R); if (g) return g;
  const turns = L0 / Math.max(0.12, R * 6), parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 3; k++) {
    const c = new Helix(R * 0.48, turns, (k * 2 * PI) / 3);
    const tube = new THREE.TubeGeometry(c, Math.max(12, Math.round(turns * 10)), R * 0.56, 5, false);
    const n = tube.attributes.position.count, col = new Float32Array(n * 3).fill([1, 0.84, 0.7][k]);
    tube.setAttribute("color", new THREE.BufferAttribute(col, 3)); parts.push(tube);
  }
  g = mergeGeometries(parts)!; braidCache.set(R, g); return g;
};
const vCache = new Map<string, THREE.MeshStandardMaterial>();
const vmat = (c: string) => { let m = vCache.get(c); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.88, vertexColors: true }); vCache.set(c, m); } return m; };
/** corda trançada por uma polilinha; spin gira os fios em volta do eixo (torcer) */
const Braid: React.FC<{ pts: V3[]; R: number; c: string; spin?: number; cast?: boolean }> = ({ pts, R, c, spin = 0, cast = true }) => {
  const g = braidGeo(R), m = vmat(c);
  return (
    <G>
      {pts.slice(1).map((b, i) => {
        const x = pipeXf(pts[i], b); if (x.len < 1e-3) return null;
        return <group key={i} position={x.p} rotation={x.r}><mesh geometry={g} material={m} rotation={[0, spin + i * 1.7, 0]} scale={[1, (x.len + R * 0.7) / L0, 1]} castShadow={cast} receiveShadow /></group>;
      })}
    </G>
  );
};
const hexLerp = (a: string, b: string, u: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.round(clamp(u) * 8) / 8).getHexString();

// ---------------------------------------------------------------- relevo: cânion em degraus de estratos (instanciado)
const ROCK = ["#b47c52", "#97603f", "#c48e60", "#8a5a40", "#ad7650"];
const jit = (sd: number, i: number, j: number) => rnd(i * 31 + j * 7 + (sd > 0 ? 500 : 0)) * 1.3;
const Canyon: React.FC = () => {
  const meshes = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1), o = new THREE.Object3D(), col = new THREE.Color();
    const rock = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, flatShading: true }), 2 * NL * 30);
    const turf = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 }), 2 * 30);
    let n = 0, m = 0;
    for (const sd of [-1, 1]) for (let j = 0; j < 30; j++) {
      const z = -150 + j * 10 + 5;
      for (let i = 0; i < NL; i++) {
        const e = edgeAt(i) + jit(sd, i, j);
        o.position.set(sd * (e + 100), i * LAY + LAY / 2, z); o.scale.set(200, LAY, 10.02); o.rotation.set(0, 0, 0); o.updateMatrix();
        rock.setMatrixAt(n, o.matrix); rock.setColorAt(n, col.set(ROCK[i % 5]).multiplyScalar(lerp(0.9, 1.07, rnd(i * 5 + j * 3 + (sd > 0 ? 77 : 0))))); n++;
        if (i === NL - 1) { o.position.set(sd * (e + 100), H + 0.05, z); o.scale.set(200, 0.1, 10.02); o.updateMatrix(); turf.setMatrixAt(m, o.matrix); turf.setColorAt(m, col.set(j % 2 ? "#c2ae58" : "#b9a650")); m++; }
      }
    }
    rock.castShadow = true; rock.receiveShadow = true; turf.receiveShadow = true;
    // tufos nas saliências (verde de vale) e capim ichu na puna (dourado)
    const ico = new THREE.IcosahedronGeometry(1, 0), shrub = new THREE.InstancedMesh(ico, mat("#5f8f3a", { flat: true }), 360);
    for (let k = 0; k < 360; k++) {
      const sd = k % 2 ? 1 : -1, i = Math.floor(rnd(k * 3 + 1) * (NL - 1)), j = Math.floor(rnd(k * 3 + 2) * 30);
      const e0 = edgeAt(i) + jit(sd, i, j), e1 = edgeAt(i + 1) + jit(sd, i + 1, j), x = lerp(e0, Math.max(e0 + 0.3, e1), rnd(k * 3 + 3));
      o.position.set(sd * (x + 0.2), (i + 1) * LAY + 0.15, -150 + j * 10 + rnd(k + 9) * 10); o.scale.setScalar(lerp(0.3, 0.75, rnd(k + 4))); o.updateMatrix(); shrub.setMatrixAt(k, o.matrix);
    }
    const blades = Array.from({ length: 6 }, (_, k) => { const g = new THREE.ConeGeometry(0.06, 1.0, 3); g.translate(0, 0.5, 0); g.rotateX(Math.sin(k * 2.3) * 0.38); g.rotateZ(Math.cos(k * 2.3) * 0.38); g.translate(Math.cos(k) * 0.1, -0.5, Math.sin(k) * 0.1); return g; });
    const cone = mergeGeometries(blades)!, ichu = new THREE.InstancedMesh(cone, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, flatShading: true }), 1100);
    let q = 0;
    for (let k = 0; q < 1100 && k < 4000; k++) {
      const sd = rnd(k * 7 + 1) > 0.5 ? 1 : -1, x = sd * lerp(17, 75, Math.pow(rnd(k * 7 + 2), 1.4)), z = lerp(-80, 80, rnd(k * 7 + 3));
      if (Math.abs(x) < 25 && z > -7 && z < 2) continue; // bases, pedras e a fila que puxa
      if (x < -20 && x > -36 && z > -7.5 && z < 16.5) continue; // oficina
      o.position.set(x, H + 0.5, z); o.scale.setScalar(lerp(0.6, 1.1, rnd(k + 11))); o.rotation.set(0, rnd(k) * 6, (rnd(k + 5) - 0.5) * 0.2); o.updateMatrix();
      ichu.setMatrixAt(q, o.matrix); ichu.setColorAt(q, col.set(q % 3 ? "#d8b44c" : "#c49a3a")); q++;
    }
    ichu.count = q;
    return [rock, turf, shrub, ichu];
  }, []);
  return <G>{meshes.map((m, i) => <primitive key={i} object={m} />)}</G>;
};

/** o Apurímac: faixa de água com espuma correndo (sem textura a régua não vê a câmera se mexer) */
const River: React.FC<{ t: number }> = ({ t }) => {
  const foam = useMemo(() => { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.05, 0.3), mat("#eaf7ff", { emissive: "#cfefff", ei: 0.35 }), 160); im.castShadow = false; im.frustumCulled = false; return im; }, []);
  const o = new THREE.Object3D();
  for (let i = 0; i < 160; i++) {
    o.position.set(lerp(-4.3, 4.3, rnd(i * 3 + 1)), 0.12, -150 + fract(rnd(i * 3 + 2) + t * 0.05) * 300); o.rotation.set(0, (rnd(i) - 0.5) * 0.5, 0);
    o.scale.set(lerp(0.6, 2.2, rnd(i + 5)), 1, 1); o.updateMatrix(); foam.setMatrixAt(i, o.matrix);
  }
  foam.instanceMatrix.needsUpdate = true;
  return (
    <G>
      <mesh position={[0, 0.08, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#2f97b4", { rough: 0.3 })}><planeGeometry args={[11, 320]} /></mesh>
      <primitive object={foam} />
    </G>
  );
};

const Mountains: React.FC = () => (
  <G>
    {[[-80, -130, 42, 70], [-20, -175, 50, 84], [60, -140, 40, 66], [115, -60, 34, 56], [-125, -40, 40, 62], [105, 65, 34, 52], [-95, 95, 40, 60], [30, 175, 45, 72], [-35, 185, 40, 62], [0, -210, 60, 90]].map(([x, z, r, h], i) => (
      <G key={i} p={[x, H, z]}>
        <Cone rad={r} h={h} seg={7} p={[0, h / 2, 0]} c={i % 2 ? "#7d6a5a" : "#8a7660"} o={{ flat: true }} cast={false} />
        <Cone rad={r * 0.36} h={h * 0.36} seg={7} p={[0, h - h * 0.18 + 0.05, 0]} c="#f4f8ff" o={{ flat: true }} cast={false} />
      </G>))}
  </G>
);

/** bases de pedra antigas nas duas margens (largas: servem à ponte velha e à nova) + pedras de ancoragem */
const Abutments: React.FC = () => (
  <G>
    {[-1, 1].map((sd) => (
      <G key={sd}>
        <Box s={[2.9, 0.9, 7.6]} p={[sd * 16.05, H + 0.45, -1.7]} c={STONE} />
        {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[0.06, 0.4, 1.15]} p={[sd * 14.58, H + 0.25 + (k % 2) * 0.42, -5.0 + k * 1.25]} c="#7f786c" cast={false} />)}
        {[0, NZ].map((z) => <Sph key={z} rad={1} p={[sd * 19.6, H + 0.85, z]} sc={[1.25, 0.95, 1.6]} c={z ? "#9c958a" : "#958d80"} ws={9} hs={7} o={{ flat: true }} />)}
      </G>))}
    {/* o caminho inca chegando às bases */}
    {Array.from({ length: 14 }, (_, k) => <Box key={k} s={[2.6, 0.08, 1.7]} p={[-19 - k * 2.7, H + 0.1, 1.2 + k * 0.35]} r={[0, 0.13, 0]} c={k % 2 ? "#b8b0a2" : "#a79f91"} cast={false} />)}
    {Array.from({ length: 14 }, (_, k) => <Box key={k} s={[2.6, 0.08, 1.7]} p={[19 + k * 2.7, H + 0.1, -1.2 - k * 0.5]} r={[0, 0.18, 0]} c={k % 2 ? "#b8b0a2" : "#a79f91"} cast={false} />)}
  </G>
);

// ---------------------------------------------------------------- a ponte: estado no tempo
export type BS = { base: number; sag: number; sway: number; z: number; floor: number; mats: number; rails: number; ties: number; rot: number; drop: number; land: number };
const OFF: BS = { base: 0, sag: 2.2, sway: 0, z: 0, floor: 0, mats: 0, rails: 0, ties: 0, rot: 0, drop: 0, land: -1 };
const DONE: BS = { ...OFF, base: 1, floor: 1, mats: 1, rails: 1, ties: 1 };
const SLACK = 10, TAUT = 2.2;
const TUGS = () => [T.tiran - 0.05, T.tiran + 0.42, T.tensarlas + 0.05];
/** puxões «a la vez»: 3 trancos da fila; a corda perde a barriga em degraus */
export const tug = (t: number) => { const [a, b, c] = TUGS(); return 0.36 * ease(t, a, a + 0.32) + 0.33 * ease(t, b, b + 0.32) + 0.31 * ease(t, c, c + 0.4); };
const LAND = () => T.alRio + 0.25;
export const mainB = (t: number): BS => {
  if (t < C1) return { ...DONE, sway: 0.42 };
  if (t < T.p1 + 0.05) return OFF;
  if (t < C5) { const k = tug(t); return { ...OFF, base: ease(t, T.p1 + 0.1, T.p1 + 1.0), sag: lerp(SLACK, TAUT, k), sway: lerp(0.9, 0.1, k) }; }
  const rot = ease(t, T.pudre - 0.2, T.b4 + 0.4);
  const drop = Math.pow(prog(t, T.sueltan - 0.12, LAND()), 2);
  return {
    base: 1, sag: TAUT + rot * 1.1, sway: 0.16, z: 0, rot, drop, land: LAND(),
    floor: ease(t, T.tejen - 0.15, T.esteras - 0.05), mats: ease(t, T.esteras - 0.1, T.dos - 0.15), rails: ease(t, T.dos - 0.05, T.arriba + 0.35), ties: ease(t, T.arriba + 0.15, T.barandas + 0.45),
  };
};
/** gag final («Mándaselo»): o operário pula duas vezes na ponte nova, que afunda e devolve como cama elástica */
export const HOPS = () => [[T.manda, T.manda + 0.62, 2.4], [T.manda + 0.62, T.manda + 1.3, 1.5]] as const;
export const hopAt = (t: number) => HOPS().reduce((s, [a, b, h]) => s + (t > a && t < b ? h * Math.sin((PI * (t - a)) / (b - a)) : 0), 0);
const trampoline = (t: number) => HOPS().reduce((s, [, b, h]) => s + (t > b ? 0.45 * h * Math.exp(-(t - b) * 3.5) * Math.sin((t - b) * 13) : 0), 0);
export const newB = (t: number): BS => {
  if (t < T.rehaces - 0.1) return OFF;
  return {
    ...OFF, z: NZ, base: ease(t, T.rehaces - 0.1, T.rehaces + 0.35), sag: lerp(6, TAUT, ease(t, T.rehaces + 0.2, T.cadaAno1 + 0.3)) + trampoline(t), sway: 0.14,
    floor: ease(t, T.nuevo - 0.05, T.tres + 0.25), mats: ease(t, T.nuevo + 0.25, T.tres + 0.45), rails: ease(t, T.nuevo + 0.05, T.nuevo + 0.55), ties: ease(t, T.nuevo + 0.45, T.tres + 0.45),
  };
};
const SW = 2.2; // rad/s do balanço
/** ponto da corda: u ∈ [0,1] de margem a margem; dz = afastamento lateral do eixo; yo = altura extra (corrimão) */
export const ropeP = (b: BS, t: number, u: number, dz: number, yo = 0): V3 => {
  const bell = 4 * u * (1 - u), xs = lerp(1, 0.26, b.drop), sagE = b.base < 1 ? lerp(-3.5, b.sag, b.base) : b.sag;
  return [lerp(-X0, X0, u) * xs, Y0 + yo - (sagE + b.drop * 3) * bell - b.drop * (Y0 - 0.9), b.z + dz + b.sway * Math.sin(t * SW) * bell];
};
/** altura do piso (topo das esteiras) no x dado — para pôr gente em cima */
export const deckAt = (b: BS, t: number, x: number, dz = 0, top = 0.24): V3 => { const u = clamp((x + X0) / (2 * X0)); const p = ropeP(b, t, u, dz); return [p[0], p[1] + top, p[2]]; };

const BASE_DZ = [-0.5, -0.17, 0.17, 0.5], RAIL_DZ = [-0.74, 0.74], NSEG = 12, NSTICK = 30, NMAT = 15, NTIE = 11;
const FALLERS = [4, 11, 17, 25];
const Bridge: React.FC<{ b: BS; t: number }> = ({ b, t }) => {
  if (b.base <= 0.001) return null;
  // depois de cair no rio: um monte de palha boiando rio abaixo, afundando
  if (b.land > 0 && t > b.land) {
    const dt = t - b.land, k = 1 - prog(dt, 5, 9); if (k <= 0) return null;
    return <G p={[0, 0.25 - prog(dt, 0, 9) * 0.5, b.z + dt * 3.2]} r={[0, 0.25 * Math.sin(dt * 0.8), 0]}>{Array.from({ length: 5 }, (_, i) => <Box key={i} s={[8 - i * 0.8, 0.32, 0.6]} p={[(rnd(i) - 0.5) * 1.5, 0.05 * i, -1.2 + i * 0.6]} r={[0, (rnd(i + 3) - 0.5) * 0.6, 0]} c={i % 2 ? ROTC : "#9a8f76"} sc={[k, 1, 1]} cast={false} />)}</G>;
  }
  const fresh = b.z === NZ, rc = fresh ? "#f2d272" : hexLerp(STRAW, ROTC, b.rot), // a nova: palha fresca, mais clara e grossa (lia fraca em «lo rehaces»)
    wood = hexLerp(WOOD, "#5e5244", b.rot), m1 = hexLerp(MATC, "#9a917a", b.rot), m2 = hexLerp(MATC2, "#8c836d", b.rot);
  const U = (k: number, n: number) => (k / n) * Math.min(1, b.base);
  const line = (dz: number, yo = 0) => Array.from({ length: NSEG + 1 }, (_, k) => ropeP(b, t, U(k, NSEG), dz, yo));
  const slope = (u: number) => { const a = ropeP(b, t, Math.max(0, u - 0.01), 0), c = ropeP(b, t, Math.min(1, u + 0.01), 0); return Math.atan2(c[1] - a[1], c[0] - a[0]); };
  const railY = 0.14 + b.rails * 1.05;
  return (
    <G>
      {BASE_DZ.map((dz) => <Braid key={dz} pts={line(dz)} R={fresh ? 0.17 : 0.13} c={rc} />)}
      {b.rails > 0.01 ? RAIL_DZ.map((dz) => <Braid key={dz} pts={line(dz, railY)} R={fresh ? 0.13 : 0.11} c={rc} />) : null}
      {/* piso de ramos atravessados: aparecem da margem esquerda para a direita com a frente */}
      {Array.from({ length: NSTICK }, (_, i) => {
        const u = (i + 0.5) / NSTICK; if (u > b.floor) return null;
        const p = ropeP(b, t, u, 0), pop = clamp((b.floor - u) * 18);
        const fi = FALLERS.indexOf(i), fall = fi >= 0 ? prog(b.rot, 0.45 + fi * 0.1, 0.75 + fi * 0.1) : 0;
        return <Box key={i} s={[0.1, 0.07, 1.3]} p={[p[0] + fall * 0.6, p[1] + 0.16 + (1 - pop) * 0.6 - fall * fall * 14, p[2]]} r={[fall * 5, 0, slope(u) + fall * 2]} c={wood} />;
      })}
      {Array.from({ length: NMAT }, (_, i) => {
        const ua = i / NMAT, ub = (i + 1) / NMAT; if (ub > b.mats + 0.001) return null;
        const a = ropeP(b, t, ua, 0), c = ropeP(b, t, ub, 0), len = Math.hypot(c[0] - a[0], c[1] - a[1]);
        const fd = !fresh && i >= 2 && i <= 5 && b.drop === 0 ? Math.max(0, t - (T.noLo + 0.05 + (i - 2) * 0.09)) : 0; // «no lo mantienes»: o miolo podre despenca
        if (fd > 1.9) return null;
        return <Box key={i} s={[len + 0.04, 0.045, 1.06]} p={[(a[0] + c[0]) / 2 + fd * 0.8, (a[1] + c[1]) / 2 + 0.215 - 7 * fd * fd, (a[2] + c[2]) / 2 + fd * 1.5]} r={[fd * 3, fd * 2, Math.atan2(c[1] - a[1], c[0] - a[0]) + fd * 4]} c={i % 2 ? m1 : m2} />;
      })}
      {b.rails > 0.5 ? RAIL_DZ.map((dz) => Array.from({ length: NTIE }, (_, k) => {
        const u = (k + 1) / (NTIE + 1); if (u > b.ties) return null;
        const lo = ropeP(b, t, u, dz * 0.68), hi = ropeP(b, t, u, dz, railY);
        return <Pipe key={`${dz}${k}`} a={lo} b={hi} rad={0.035} c={rc} seg={5} cast={false} />;
      })) : null}
      {/* hierba podrida: fios pendurados embaixo do piso */}
      {b.rot > 0.2 ? Array.from({ length: 9 }, (_, k) => { const u = 0.1 + k * 0.1, p = ropeP(b, t, u, (rnd(k) - 0.5) * 1.0); return <Box key={k} s={[0.04, b.rot * 1.1, 0.04]} p={[p[0], p[1] - b.rot * 0.55, p[2]]} r={[0, 0, 0.15 * Math.sin(t * 2 + k)]} c={ROTC} cast={false} />; }) : null}
    </G>
  );
};

/** as voltas na pedra começam logo depois do corte 4 (no plano fechado da pedra) */
const RS = () => CUTS[3] + 0.1;
/** amarras: a corda de cada margem vai da borda até a pedra e dá voltas nela («las amarran a grandes piedras») */
const Anchors: React.FC<{ t: number }> = ({ t }) => {
  const b = mainB(t), nb = newB(t), rc = hexLerp(STRAW, ROTC, b.rot);
  const tail = t > T.decenas - 0.02 && t < C5, pull = tug(t) * 1.8;
  const rings = (sd: number, z: number, k0: number, c: string) => Array.from({ length: 3 }, (_, k) => {
    const u = k0 >= 99 ? 1 : ease(t, k0 + k * 0.22, k0 + k * 0.22 + 0.25); if (u <= 0.01) return null;
    return <mesh key={k} position={[sd * 19.6, H + 0.62 + k * 0.27, z]} rotation={[PI / 2, 0, 0]} scale={[1.27 * u, 1.62 * u, 1]} material={mat(c)}><torusGeometry args={[1, 0.11, 6, 22]} /></mesh>;
  });
  const legs = (sd: number, bb: BS, c: string) => [...BASE_DZ, ...RAIL_DZ].map((dz) => <Pipe key={dz} a={[sd * 14.8, Y0, bb.z + dz]} b={[sd * 18.45, H + 0.95, bb.z + dz * 0.5]} rad={0.11} c={c} seg={7} />);
  const mainOn = t < C1 || (t >= T.p1 + 0.1 && b.drop < 0.05);
  return (
    <G>
      {mainOn ? [-1, 1].map((sd) => <G key={sd}>{legs(sd, b, rc)}{rings(sd, 0, t < C1 || t > RS() + 1 ? 99 : RS(), rc)}</G>) : null}
      {nb.base > 0.5 ? [-1, 1].map((sd) => <G key={sd}>{legs(sd, nb, STRAW)}{rings(sd, NZ, 99, STRAW)}</G>) : null}
      {tail ? [-1, 1].map((sd) => <Braid key={sd} pts={[[sd * 20.9, H + 0.95, 0], [sd * (31.5 + pull), H + 1.2, 0]]} R={0.14} c={STRAW} />) : null}
    </G>
  );
};

// ---------------------------------------------------------------- oficina na puna: capim, torcer, 90 cordões, teste, rolos
const TUFTS: V3[] = [[-25.4, H, 2.8], [-28.6, H, 5.2], [-26.6, H, 6.4], [-24.2, H, 7.0], [-29.8, H, 7.4], [-27.6, H, 8.6], [-30.6, H, 3.6], [-23.2, H, 5.4], [-31.4, H, 9.6], [-25.2, H, 9.4]];
const Tufts: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {TUFTS.map((q, i) => {
      const pulled = i === 0 ? 1 - ease(t, T.puna + 0.05, T.puna + 0.35) : 1; if (pulled <= 0.01 && t < C5) return null;
      return (
        <G key={i} p={[q[0], q[1] + (1 - pulled) * 0.5, q[2]]} r={[0.12 * Math.sin(t * 3.1 + i), 0, 0.14 * Math.sin(t * 2.6 + i * 1.7)]} sc={[1, Math.max(0.01, pulled), 1]}>
          {Array.from({ length: 7 }, (_, k) => <Cone key={k} rad={0.07} h={1.25} seg={3} p={[Math.cos(k) * 0.12, 0.6, Math.sin(k) * 0.12]} r={[Math.sin(k * 2.3) * 0.35, 0, Math.cos(k * 2.3) * 0.35]} c={k % 2 ? "#e0bd55" : "#c9a03c"} cast={false} />)}
        </G>
      );
    })}
  </G>
);
const RIG_A: V3 = [-27.2, H + 1.5, 4.0], RIG_B: V3 = [-22.0, H + 1.5, 4.0];
const N_CORD = 90;
/** quantos cordões já há no feixe (o mesmo número do painel) */
export const cordsAt = (t: number) => (t < T.casi ? 1 : Math.round(lerp(1, N_CORD, ease(t, T.casi - 0.05, T.trenzados + 0.1))));
const Workshop: React.FC<{ t: number }> = ({ t }) => {
  if (t < C1 || t > CUTS[3] + 0.5) return null;
  const bundle = t > T.puna + 0.2 && t < T.torcida + 0.3;
  const grow = ease(t, T.torcida - 0.05, T.finos + 0.15);
  const fan = t >= T.casi - 0.1 && t < T.cadaSoga + 0.05, n = cordsAt(t);
  const tw = ease(t, T.trenzados - 0.05, T.cadaSoga), rad = lerp(0.72, 0.2, tw), phi = tw * 2.6 + (t > T.cadaSoga ? 0 : 0);
  const rope = t >= T.trenzados + 0.3;
  return (
    <G>
      <Tufts t={t} />
      {/* armação de torcer: dois postes com forquilha */}
      {[RIG_A, RIG_B].map((q, i) => <G key={i}><Cyl rt={0.1} h={1.75} p={[q[0], H + 0.85, q[2]]} c={WOOD} seg={7} /><Box s={[0.5, 0.12, 0.16]} p={[q[0], H + 1.72, q[2]]} c={WOOD} /></G>)}
      {bundle ? <G p={[-26.1, H + 1.55, 3.1]} r={[0, 0.3, PI / 2]}><Cyl rt={0.17} rb={0.12} h={0.9} c="#d8b44c" seg={7} />{Array.from({ length: 6 }, (_, k) => <Cone key={k} rad={0.05} h={0.5} seg={3} p={[Math.cos(k) * 0.1, 0.6, Math.sin(k) * 0.1]} c="#e6c35c" cast={false} />)}</G> : null}
      {/* um cordão fino girando e crescendo («torcida en cordones finos») */}
      {grow > 0.01 && !fan ? <Braid pts={[RIG_A, [lerp(RIG_A[0], RIG_B[0], grow), RIG_A[1], RIG_A[2]]]} R={0.07} c={STRAW} spin={t * 22} /> : null}
      {grow > 0.01 && !fan ? <Puffs t={t} p={[lerp(RIG_A[0], RIG_B[0], grow), RIG_A[1], RIG_A[2]]} n={5} period={0.5} rise={0.5} size={0.08} c="#e8cf7a" drift={[0.3, 0, 0]} /> : null}
      {/* ~90 cordões no feixe; ao «trenzados» o feixe gira e aperta (hiperboloide = torção) até virar a soga */}
      {fan && !rope ? Array.from({ length: n }, (_, i) => {
        const a = i * 2.39996, r = rad * Math.sqrt((i + 0.5) / N_CORD), pop = clamp((n - i) / 4);
        const pa: V3 = [RIG_A[0] + 0.25, RIG_A[1] + Math.cos(a) * r, RIG_A[2] + Math.sin(a) * r], pb: V3 = [RIG_B[0] - 0.25, RIG_B[1] + Math.cos(a + phi) * r, RIG_B[2] + Math.sin(a + phi) * r];
        return <Pipe key={i} a={pa} b={[lerp(pa[0], pb[0], pop), lerp(pa[1], pb[1], pop), lerp(pa[2], pb[2], pop)]} rad={0.032} c={i % 3 ? "#e0bc5c" : "#c79e40"} seg={5} cast={false} />;
      }) : null}
      {rope ? <Braid pts={[[RIG_A[0] + 0.2, RIG_A[1], RIG_A[2]], [RIG_B[0] - 0.2, RIG_B[1], RIG_B[2]]]} R={0.21} c={STRAW} spin={phi + ease(t, T.trenzados + 0.3, T.cadaSoga + 0.3) * 1.5} /> : null}
    </G>
  );
};
/** plano 3: a soga no chão junto da perna, o teste (1 cordão arrebenta, a soga aguenta) e os 6 rolos */
const STAND = { x: -24.5, z1: 12.4, z2: 14.6, top: H + 3.5 };
const Proof: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[2] || t > CUTS[4] + 0.2) return null;
  const snap = T.rompe + 0.03, ds = t - snap;
  const s1y = ds < 0 ? H + 1.45 : Math.max(H + 0.42, H + 1.45 - 15 * ds * ds), bounce = ds > 0.37 ? 0.18 * Math.abs(Math.sin((ds - 0.37) * 12)) * Math.exp(-(ds - 0.37) * 6) : 0;
  const d2 = t - (T.cienJuntos - 0.05), s2y = d2 < 0 ? H + 3.0 : H + 1.4 + 0.55 * Math.exp(-d2 * 5) * Math.cos(d2 * 15);
  const coil = (i: number) => (t < T.sogas - 0.05 + i * 0.12 ? 0 : 1) * (1 - ease(t, T.p1 + 0.15 + i * 0.08, T.p1 + 0.7 + i * 0.08));
  return (
    <G>
      {/* a soga pronta no chão, junto do pé do operário */}
      {t < T.sogas ? <Braid pts={[[-24.75, H + 0.24, 5.6], [-24.75, H + 0.24, 8.2], [-24.6, H + 0.24, 10.9]]} R={0.21} c={STRAW} /> : null}
      {/* o teste: forca de madeira; à esquerda 1 cordão com pedra, à direita a soga de ~90 cordões */}
      {[STAND.z1 - 0.7, STAND.z2 + 0.7].map((z) => <Cyl key={z} rt={0.12} h={3.6} p={[STAND.x, H + 1.8, z]} c={WOOD} seg={7} />)}
      <Box s={[0.22, 0.22, 3.8]} p={[STAND.x, STAND.top, (STAND.z1 + STAND.z2) / 2]} c={WOOD} />
      {ds < 0 ? <Pipe a={[STAND.x, STAND.top, STAND.z1]} b={[STAND.x, s1y + 0.4, STAND.z1]} rad={0.035} c={STRAW} seg={5} /> : <>
        <Pipe a={[STAND.x, STAND.top, STAND.z1]} b={[STAND.x + 0.15 * Math.sin(ds * 20) * Math.exp(-ds * 4), lerp(H + 2.4, STAND.top - 0.35, ease(ds, 0, 0.25)), STAND.z1]} rad={0.035} c={STRAW} seg={5} />
        <Pipe a={[STAND.x, s1y + 0.4, STAND.z1]} b={[STAND.x + 0.2, s1y + 0.95 - ease(ds, 0.3, 0.6) * 0.5, STAND.z1 + 0.15]} rad={0.035} c={STRAW} seg={5} />
        <Puffs t={t} p={[STAND.x, H + 2.3, STAND.z1]} n={6} period={0.6} rise={0.6} size={0.12} c="#e8cf7a" on={ds < 0.7 ? 1 : 0} />
        <Puffs t={t} p={[STAND.x, H + 0.2, STAND.z1]} n={7} period={0.7} rise={0.7} size={0.28} c="#d8c8a8" on={ds > 0.36 && ds < 1.1 ? 1 : 0} />
      </>}
      <Sph rad={0.42} p={[STAND.x, s1y + bounce, STAND.z1]} c="#8d867a" ws={8} hs={6} o={{ flat: true }} />
      {d2 >= 0 ? <><Braid pts={[[STAND.x, STAND.top, STAND.z2], [STAND.x, s2y + 0.5, STAND.z2]]} R={0.17} c={STRAW} /><Sph rad={0.58} p={[STAND.x, s2y, STAND.z2]} c="#8a8276" ws={8} hs={6} o={{ flat: true }} /></> : null}
      {/* «estas son las sogas»: seis rolos junto da base; somem voando para o outro lado no «pero» */}
      {[[-24, -3], [-26, -3], [-28, -3], [-24, -5.6], [-26, -5.6], [-28, -5.6]].map(([x, z], i) => {
        const k = coil(i); if (k <= 0.01) return null;
        const tl = T.sogas - 0.05 + i * 0.12, dt = t - tl, fall = dt < 0.3 ? 4.5 * (1 - dt / 0.3) ** 2 : 0.5 * Math.abs(Math.sin((dt - 0.3) * 9)) * Math.exp(-(dt - 0.3) * 4);
        return <G key={i} p={[x, H + fall, z]} r={[0.25 * Math.sin(dt * 7) * Math.exp(-Math.max(0, dt) * 2), dt * 0.6, 0]} sc={k}>{[0, 1, 2].map((j) => <mesh key={j} position={[0, 0.18 + j * 0.3, 0]} rotation={[PI / 2, 0, j * 0.7]} material={mat(j % 2 ? "#cfa94e" : STRAW)} castShadow><torusGeometry args={[0.72 - j * 0.06, 0.17, 6, 18]} /></mesh>)}</G>;
      })}
    </G>
  );
};

// ---------------------------------------------------------------- gente
type M = { p: V3; yaw: number; pose: PoseName; ph: number };
/** a fila que puxa: 8 por margem, andando para trás nos 3 trancos */
const Pullers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.decenas - 0.02 || t > C5) return null;
  const pull = tug(t) * 1.8, jerk = (s: number) => 0.12 * Math.sin(t * 9 + s);
  const side = (sd: number, n: number): M[] => Array.from({ length: n }, (_, i) => ({ p: [sd * (22.4 + i * 1.15 + pull + jerk(i)), H, (i % 2 ? 0.36 : -0.36)] as V3, yaw: sd * PI / 2, pose: "pull" as PoseName, ph: i * 0.31 }));
  return <G><Crowd list={side(-1, 8).slice(1)} t={t} c={COMM[0]} /><Crowd list={side(1, 8)} t={t} c={COMM[2]} /></G>;
};
/** os 4 tecelões do piso: aparecem quando a frente de ramos passa por eles */
const Weavers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.s3 || t > T.estePiso) return null;
  const b = mainB(t), us = [0.16, 0.38, 0.6, 0.84];
  return <G>{us.map((u, i) => { const k = clamp((b.floor - u) * 10); if (k <= 0.01) return null; const p = deckAt(b, t, lerp(-X0, X0, u), (i % 2 ? 0.25 : -0.25), 0.2); return <Crowd key={i} list={[{ p, yaw: i % 2 ? 0.4 : -0.5, pose: "chisel", ph: i * 0.4 }]} t={t} c={COMM[i]} scale={k} />; })}</G>;
};
/** as 4 comunidades (uma cor cada), duas por margem, tecendo a nova */
const Communities: React.FC<{ t: number }> = ({ t }) => {
  if (t < C6 || t > C7 + 3) return null;
  const spots: [number, number][] = [[-1, -6.6], [-1, 2.2], [1, -6.6], [1, 2.2]];
  return (
    <G>
      {spots.map(([sd, z0], g) => {
        const k = ease(t, T.cuatro - 0.1 + g * 0.14, T.cuatro + 0.2 + g * 0.14); if (k <= 0.01) return null;
        const list: M[] = Array.from({ length: 4 }, (_, i) => ({ p: [sd * (18.2 + (i % 2) * 1.3), H, z0 + Math.floor(i / 2) * 1.2 + (i % 2) * 0.4] as V3, yaw: sd > 0 ? -PI / 2 - 0.3 : PI / 2 + 0.3, pose: (i % 2 ? "pull" : "cheer") as PoseName, ph: i * 0.5 + g }));
        return <Crowd key={g} list={list} t={t} c={COMM[g]} scale={k} />;
      })}
    </G>
  );
};
/** gente nas margens no gancho e gente cruzando a ponte nova no fim */
const Folk: React.FC<{ t: number }> = ({ t }) => {
  if (t < C1) {
    const l = (sd: number): M[] => Array.from({ length: 5 }, (_, i) => ({ p: [sd * (18.2 + (i % 3) * 1.2), H, -3.6 + i * 1.8] as V3, yaw: -sd * PI / 2, pose: (i % 2 ? "cheer" : "idle") as PoseName, ph: i * 0.7 }));
    return <G><Crowd list={l(-1)} t={t} c={COMM[0]} /><Crowd list={l(1)} t={t} c={COMM[3]} /></G>;
  }
  if (t >= T.solo - 0.2 && t < CUTS[1]) { // «mucha gente»: chegam pela puna com feixes de capim
    const w = ease(t, T.solo - 0.2, T.camino);
    return <G>{Array.from({ length: 8 }, (_, i) => { const p: V3 = [lerp(-40, -27.5, w) - (i % 4) * 1.4, H, 5.5 + Math.floor(i / 4) * 2.2 + (i % 2) * 0.6]; return <G key={i}><Crowd list={[{ p, yaw: PI / 2 - 0.2, pose: w < 1 ? "walk" : "idle", ph: i * 0.37 }]} t={t} c={COMM[i % 4]} /><Cyl rt={0.2} rb={0.15} h={0.9} p={[p[0] - 0.3, H + 1.75, p[2]]} r={[0, 0, PI / 2 - 0.4]} c="#d8b44c" seg={7} /></G>; })}</G>;
  }
  if (t >= T.renovacion - 0.3) {
    const b = newB(t);
    return <G>{Array.from({ length: 6 }, (_, i) => { const x = 13 - fract((t - C7) * 0.11 + i / 6) * 26; return <Crowd key={i} list={[{ p: deckAt(b, t, x, i % 2 ? 0.2 : -0.2), yaw: -PI / 2, pose: "walk", ph: i * 0.4 }]} t={t} c={COMM[i % 4]} />; })}</G>;
  }
  return null;
};

/** «no hay acero, ni cables, ni motores»: cada coisa surge aos pés do operário e ele a joga no cânion */
export const JUNK = () => [T.acero, T.cables, T.motores];
const Junk: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.acero || t > T.solo + 1.5) return null;
  return <G>{JUNK().map((a, i) => {
    const dt = t - a; if (dt < 0 || dt > 2.4) return null;
    const fly = Math.max(0, dt - 0.32), k = Math.min(1, dt / 0.14);
    const p: V3 = [-16.1 + fly * 6.5, H + 1.15 + fly * 3.2 - 6 * fly * fly, 1.0 + (i - 1) * 0.55 + fly * 0.6];
    const r: V3 = [fly * 6, fly * 3, fly * 5];
    return <G key={i} p={p} r={r} sc={k}>
      {i === 0 ? <><Box s={[1.5, 0.08, 0.36]} p={[0, 0.16, 0]} c="#8b98a5" /><Box s={[1.5, 0.08, 0.36]} p={[0, -0.16, 0]} c="#8b98a5" /><Box s={[1.5, 0.32, 0.07]} p={[0, 0, 0]} c="#7c8894" /></> : null}
      {i === 1 ? <><Cyl rt={0.42} h={0.5} p={[0, 0, 0]} r={[PI / 2, 0, 0]} c="#3d4650" seg={12} /><Cyl rt={0.16} h={0.54} p={[0, 0, 0]} r={[PI / 2, 0, 0]} c="#c0c6cc" seg={10} /></> : null}
      {i === 2 ? <><Box s={[0.75, 0.55, 0.55]} p={[0, 0, 0]} c="#c8352a" /><Cyl rt={0.14} h={0.4} p={[0.5, 0, 0]} r={[0, 0, PI / 2]} c="#9aa3ab" seg={8} /><Box s={[0.85, 0.08, 0.6]} p={[0, -0.3, 0]} c="#4a5058" /></> : null}
    </G>;
  })}</G>;
};
/** «en el fondo de un cañón»: o operário chuta uma pedrinha da borda e ela cai até o rio (respingo) */
export const PEB0 = () => T.fondo - 0.12, PEB_T = 1.42;
export const pebP = (t: number): V3 => { const u = clamp(t - PEB0(), 0, PEB_T); return [-16.3 + 9 * u, H + 0.95 + 1.1 * u - 8.6 * u * u, 1.0 + 0.3 * u]; };
const Pebble: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - PEB0(); if (dt < 0 || dt > PEB_T + 0.9) return null;
  const p = pebP(t);
  return <G>
    {dt < PEB_T ? <Sph rad={0.45} p={p} c="#8d867a" ws={8} hs={6} o={{ flat: true }} /> : null}
    <Puffs t={t} p={[p[0], 0.3, p[2]]} n={8} period={0.8} rise={1.6} size={0.5} c="#ffffff" on={dt > PEB_T - 0.02 && dt < PEB_T + 0.6 ? 1 : 0} />
  </G>;
};
/** tecelões da nova (4 cores): surgem quando a frente do piso novo passa por eles */
const NewWeavers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.nuevo - 0.1 || t > CUTS[6] + 0.1) return null;
  const b = newB(t), us = [0.2, 0.4, 0.6, 0.8];
  return <G>{us.map((u, i) => { const k = clamp((b.floor - u) * 8); if (k <= 0.01) return null; const p = deckAt(b, t, lerp(-X0, X0, u), (i % 2 ? 0.25 : -0.25), 0.2); return <Crowd key={i} list={[{ p, yaw: i % 2 ? 0.4 : -0.5, pose: "chisel", ph: i * 0.4 }]} t={t} c={COMM[i]} scale={k} />; })}</G>;
};

// ---------------------------------------------------------------- efeitos: seta do caminho, chuva, respingo
const Path: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.cruzar - 0.1, T.rio + 0.5) * (1 - ease(t, CUTS[1] - 0.2, CUTS[1])); if (k <= 0.01) return null;
  return <G>{Array.from({ length: 16 }, (_, i) => { const u = (i + 0.5) / 16; if (u > k) return null; return <Sph key={i} rad={0.32} p={[lerp(-15, 15, u), H + 1.4 + 5 * Math.sin(PI * u), 0.6]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.6 }} cast={false} ws={8} hs={6} />; })}</G>;
};
const Rain: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.lluvia - 0.45 || t > T.sol + 0.3) return null;
  return <G>{Array.from({ length: 90 }, (_, i) => { const u = fract(t * 1.7 + rnd(i)); return <Box key={i} s={[0.05, 1.0, 0.05]} p={[lerp(-13, 13, rnd(i + 1)), H + 9 - u * 15, lerp(-4, 7, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const land = T.alRio + 0.25;
  return (
    <>
      <Sky top="#2e7fd6" mid="#86c0ee" low="#eef3f6" />
      <Clouds t={t} n={9} y={44} />
      <Mountains /><Canyon /><River t={t} /><Abutments />
      <Bridge b={mainB(t)} t={t} /><Bridge b={newB(t)} t={t} /><Anchors t={t} />
      <Workshop t={t} /><Proof t={t} />
      <Pullers t={t} /><Weavers t={t} /><NewWeavers t={t} /><Communities t={t} /><Folk t={t} /><Junk t={t} /><Pebble t={t} />
      <Path t={t} /><Rain t={t} />
      <Puffs t={t} p={[0, 0.3, 0.5]} n={12} period={1.1} rise={5} size={1.4} c="#ffffff" on={t > land - 0.05 && t < land + 1.4 ? 1 : 0} drift={[0, 0, 1.5]} />
    </>
  );
};
