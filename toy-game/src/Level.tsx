// O mundo de brinquedo do canal: ilha em degraus, vale do rio que vira lago, morro do corte, eclusas antigas e novas.
import { useMemo } from 'react';
import * as THREE from 'three';
import { C, W, LAND, VALLEY, STEP_X, OLD_W, NEW_Z, NEW_W, clamp, lin, smooth, mix, pop, drop, seeded, shotStart, shotName } from './lib';
import { Box, RBox, Ship, Worker, Mule, Tree, Cloud, Tufts, mat, Pose } from './models';
import * as St from './story';

type P = [number, number][];
const TOP = [1.6, 2.8, 4.0];
const floorY = (i: number) => 1.2 * i - 0.9;

// contornos em (x, z)
const PLATEAU_S: P = [[0, -30], [46, -30], [46, -1.1], [33, -1.1], [33, -5], [31, -10], [26, -14], [20, -15.5], [20, -20], [21, -23],
  [15, -23], [16, -20], [16, -15.5], [13, -14], [9, -10], [7.5, -5], [6.5, -1.1], [0, -1.1]];
const PLATEAU_M: P = [[0, 1.1], [6.5, 1.1], [7.5, 3.5], [6.5, 6.0], [0, 6.0]];
const PLATEAU_N: P = [[0, 9.2], [7.5, 9.2], [12, 10.6], [20, 10.2], [27, 7.5], [31, 4], [32, 1.1], [46, 1.1], [46, 18], [0, 18]];
const VALLEY_P: P = [[0, -1.1], [6.5, -1.1], [7.5, -5], [9, -10], [13, -14], [16, -15.5], [16, -20], [15, -23], [21, -23], [20, -20],
  [20, -15.5], [26, -14], [31, -10], [33, -5], [33, -1.1], [46, -1.1], [46, 1.1], [32, 1.1], [31, 4], [27, 7.5], [20, 10.2], [12, 10.6],
  [7.5, 9.2], [0, 9.2], [0, 6.0], [6.5, 6.0], [7.5, 3.5], [6.5, 1.1], [0, 1.1]];
const LAKE_P: P = [[0, -1.1], [6.5, -1.1], [7.5, -5], [9, -10], [13, -14], [16, -15.5], [20, -15.5], [26, -14], [31, -10], [33, -5],
  [33, -1.1], [37, -1.1], [37, 1.1], [32, 1.1], [31, 4], [27, 7.5], [20, 10.2], [12, 10.6], [7.5, 9.2], [0, 9.2], [0, 6.0], [6.5, 6.0],
  [7.5, 3.5], [6.5, 1.1], [0, 1.1]];
const RIVER: P = [[31, -6], [27, -8.5], [23, -10.5], [19.5, -13], [18, -16], [18, -22.6]];

const inPoly = (x: number, z: number, p: P) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++)
    if ((p[i][1] > z) !== (p[j][1] > z) && x < ((p[j][0] - p[i][0]) * (z - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
  return c;
};
const shape = (p: P) => { const s = new THREE.Shape(); s.moveTo(p[0][0], p[0][1]); p.slice(1).forEach(q => s.lineTo(q[0], q[1])); return s; };

// Placa extrudada para baixo a partir de y=top (tampa de grama, lados de terra)
const Slab = ({ poly, top, depth, cap = C.grass, side = C.dirt }: { poly: P; top: number; depth: number; cap?: string; side?: string }) => {
  const g = useMemo(() => new THREE.ExtrudeGeometry(shape(poly), { depth, bevelEnabled: false }), [poly, depth]);
  return <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} position={[0, top, 0]} material={[mat(cap), mat(side)]} receiveShadow castShadow />;
};
const Water = ({ poly, y, opacity = 0.9 }: { poly: P; y: number; opacity?: number }) => {
  const g = useMemo(() => new THREE.ShapeGeometry(shape(poly)), [poly]);
  return <mesh geometry={g} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]} material={mat(C.water, { rough: 0.2, opacity, double: true })} receiveShadow />;
};
// bloco de terraço (grama em cima, terra nos lados)
const Block = ({ x0, x1, z0, z1, top, bottom = -0.6, sink = 0 }: { x0: number; x1: number; z0: number; z1: number; top: number; bottom?: number; sink?: number }) => {
  const h = (top - bottom) * (1 - sink);
  if (h < 0.02) return null;
  return (
    <mesh position={[(x0 + x1) / 2, bottom + h / 2, (z0 + z1) / 2]} receiveShadow castShadow
      material={[mat(C.dirt), mat(C.dirt), mat(C.grass), mat(C.dirt), mat(C.dirt), mat(C.dirt)]}>
      <boxGeometry args={[x1 - x0, h, z1 - z0]} />
    </mesh>
  );
};

// ---------- morro do corte (malha de altura low-poly com a vala) ----------
const HX0 = 37, HX1 = 46, HZ = 8;
const hillH = (x: number, z: number) => {
  const u = (x - (HX0 + HX1) / 2) / ((HX1 - HX0) / 2 + 0.6), v = z / HZ;
  return Math.max(0, 2.6 * (1 - u * u) * (1 - v * v) * (1 - 0.25 * v * v)) + 0.15 * Math.sin(x * 1.7 + z * 1.3);
};
const Hill = ({ t }: { t: number }) => {
  const d = St.dig(t);
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(HX1 - HX0, HZ * 2, 18, 64); g.rotateX(-Math.PI / 2); g.translate((HX0 + HX1) / 2, 0, 0); return g; }, []);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const cols = new Float32Array(pos.count * 3);
  const grass = new THREE.Color(C.grass), dirt = new THREE.Color(C.dirtLight), dirtD = new THREE.Color(C.dirt);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    let h = LAND + hillH(x, z);
    const inBand = Math.abs(z) < 1.15, nearBand = Math.abs(z) < 1.45;
    if (inBand) {
      const sl = clamp(d.prog * 9 - (x - HX0));             // fatia cavada
      let floor = mix(h, LAND - 0.05, sl);
      floor = mix(floor, 2.6, d.deep * sl);
      floor = mix(floor, LAND + 0.4 + 0.25 * Math.sin(x * 3), d.slide * sl);
      h = Math.min(h, floor);
    }
    pos.setY(i, h);
    const dug = inBand && h < LAND + hillH(x, z) - 0.15;
    const c = dug ? (h < 3.6 ? dirtD : dirt) : nearBand && d.prog > 0 && x < HX0 + d.prog * 9 + 0.5 ? dirt : grass;
    cols.set([c.r, c.g, c.b], i * 3);
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const m = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 }), []);
  // blocos de terra que escorregam para dentro da vala
  const blobs = useMemo(() => { const r = seeded(9); return Array.from({ length: 14 }, (_, i) => ({ x: HX0 + 0.6 + r() * 7.5, s: i % 2 ? 1 : -1, d: r() * 0.35, k: 0.35 + r() * 0.3 })); }, []);
  return (
    <group>
      <mesh geometry={geo} material={m} receiveShadow castShadow />
      {d.slide > 0 && blobs.map((b, i) => {
        const k = clamp((d.slide - b.d) / (1 - b.d));
        const z0 = b.s * 2.3, z1 = b.s * 0.3;
        const y0 = LAND + hillH(b.x, z0) + 0.3, y1 = LAND + 0.25;
        return <mesh key={i} position={[b.x, mix(y0, y1, k * k), mix(z0, z1, k)]} rotation={[k * 4 * b.s, i, k * 3]} scale={b.k}
          material={mat(i % 3 ? C.dirt : C.dirtLight, { flat: true })} castShadow><dodecahedronGeometry args={[1, 0]} /></mesh>;
      })}
    </group>
  );
};

// ---------- câmara de eclusa (parede da frente de vidro: corte para ver o nível subir) ----------
const Chamber = ({ x0, x1, zc, w, i, level, s = 1 }: { x0: number; x1: number; zc: number; w: number; i: number; level: number; s?: number }) => {
  if (s <= 0.001) return null;
  const fy = floorY(i), top = TOP[i], L = x1 - x0, xc = (x0 + x1) / 2, h = top - fy;
  return (
    <group position={[xc, 0, zc]} scale={[1, s, 1]}>
      <Box size={[L, 0.3, w + 1]} pos={[0, fy - 0.15, 0]} color={C.concreteDark} />
      <Box size={[L, h, 0.5]} pos={[0, fy + h / 2, -w / 2 - 0.25]} color={C.concrete} />
      <Box size={[L, 0.25, 0.5]} pos={[0, fy + 0.125, w / 2 + 0.25]} color={C.concrete} />
      <Box size={[L - 0.3, h - 0.4, 0.06]} pos={[0, fy + h / 2 + 0.05, w / 2 + 0.3]} color="#dff4ff" opacity={0.22} shadow={false} />
      <Box size={[L, 0.18, 0.5]} pos={[0, top - 0.09, w / 2 + 0.25]} color={C.concrete} />
      {[-1, 1].map(e => <Box key={e} size={[0.22, h, 0.5]} pos={[e * (L / 2 - 0.11), fy + h / 2, w / 2 + 0.25]} color={C.concrete} />)}
      {/* trilhos das mulas no topo das paredes */}
      {[-w / 2 - 0.25, w / 2 + 0.25].map(z => [-0.12, 0.12].map(dz => (
        <Box key={`${z}${dz}`} size={[L, 0.04, 0.05]} pos={[0, top + 0.02, z + dz]} color={C.rail} shadow={false} />)))}
      {level - fy > 0.03 && (
        <mesh position={[0, (fy + level) / 2, 0]} material={mat(C.water, { rough: 0.2, opacity: 0.86 })}>
          <boxGeometry args={[L - 0.02, level - fy, w - 0.02]} />
        </mesh>
      )}
    </group>
  );
};
// comporta busco (duas folhas em V): open 0..1
const Gate = ({ x, zc, w, bottom, top, open, s = 1 }: { x: number; zc: number; w: number; bottom: number; top: number; open: number; s?: number }) => {
  if (s <= 0.001) return null;
  const th = mix(0.32, Math.PI / 2 - 0.08, open), len = w / (2 * Math.cos(0.32)), h = top - bottom;
  return (
    <group position={[x, bottom, zc]} scale={[1, s, 1]}>
      {[-1, 1].map(sd => (
        <group key={sd} position={[0, 0, sd * w / 2]} rotation={[0, -sd * th, 0]}>
          <Box size={[0.14, h, len]} pos={[0, h / 2, -sd * len / 2]} color={C.gate} />
          {[0.25, 0.55, 0.85].map(k => <Box key={k} size={[0.16, 0.06, len]} pos={[0, h * k, -sd * len / 2]} color="#c75f12" shadow={false} />)}
        </group>
      ))}
    </group>
  );
};

const Lock = ({ t, zc, w, lv, gates, build, glassSide = 1 }: { t: number; zc: number; w: number; lv: (i: number) => number; gates: (i: number) => number; build: number; glassSide?: number }) => (
  <group scale={[1, 1, glassSide]} position={[0, 0, glassSide === 1 ? 0 : 2 * zc]}>
    {[0, 1, 2].map(i => <Chamber key={i} x0={STEP_X[i]} x1={STEP_X[i + 1]} zc={zc} w={w} i={i} level={lv(i)} s={clamp(pop(t, build + i * 0.18, 0.4))} />)}
    {[0, 1, 2, 3].map(i => <Gate key={i} x={STEP_X[i]} zc={zc} w={w} bottom={floorY(Math.max(0, i - 1))} top={i < 3 ? TOP[i] : LAND}
      open={gates(i)} s={clamp(pop(t, build + 0.6 + i * 0.12, 0.35))} />)}
  </group>
);

// partículas determinísticas: n partículas nascendo de t0 a t1, cada uma vive `life` s
const Particles = ({ t, t0, t1, n, life, seed, at, color, size = 0.06 }:
  { t: number; t0: number; t1: number; n: number; life: number; seed: number; at: (r: () => number, age: number) => [number, number, number] | null; color: string; size?: number }) => {
  if (t < t0 || t > t1 + life) return null;
  const out = [];
  for (let k = 0; k < n; k++) {
    const r = seeded(seed + k * 31);
    const tb = t0 + (k / n) * (t1 - t0), age = t - tb;
    if (age < 0 || age > life) continue;
    const p = at(r, age); if (!p) continue;
    out.push(<mesh key={k} position={p} material={mat(color, { flat: true })} scale={size * (1 - 0.5 * age / life)}><icosahedronGeometry args={[1, 0]} /></mesh>);
  }
  return <>{out}</>;
};

// ---------- operário: onde está e o que faz em cada tomada ----------
const worker = (t: number): { p: [number, number, number]; ry: number; pose: Pose } | null => {
  const n = shotName(t), bob = Math.abs(Math.sin(t * 7)) * 0.04;
  switch (n) {
    case 'dig': { const sw = Math.sin(t * 9); return { p: [36.0, LAND, 1.9], ry: 0, pose: { armR: -0.6 + sw * 0.7, armL: -0.3 + sw * 0.5, lean: 0, shovel: true, tool: sw * 0.3 } }; }
    case 'slide': { const sc = t > W(56) ? 1 : 0; return { p: [35.4, LAND + (sc ? Math.abs(Math.sin(t * 14)) * 0.12 : 0), 2.6], ry: 0.25,
      pose: { armL: sc ? Math.PI * 0.9 : 0.15, armR: sc ? -Math.PI * 0.9 : -0.15, armLz: sc ? 0.4 : 0, armRz: sc ? 0.4 : 0 } }; }
    case 'build': { const press = smooth(t, W(84), W(85)) - smooth(t, W(86), W(87)); return { p: [-12.2, 0.5, 2.85], ry: -Math.PI / 2, pose: { armR: -1.4 * press, head: 0 } }; }
    case 'elevator': return { p: [-9.2, 0.5, 3.2], ry: -Math.PI / 2 + 0.3, pose: { armL: 2.6, armR: -0.2, head: 0.3 } };
    case 'mules': return { p: [-11.0, 0.5, 2.6], ry: -Math.PI / 2 + 0.4, pose: { armR: t > W(119) ? -2.6 + Math.sin(t * 8) * 0.3 : 0, armL: 0.2 } };
    case 'lake': return { p: [13.4, LAND, -16.8], ry: 0.6, pose: { armR: t > W(154) ? -1.9 : 0, armL: 0.2 } };
    case 'drought': return { p: [5.2, LAND, -4.0], ry: 0.5, pose: { armR: -2.4, armRz: 0.6, armL: 0.2, head: Math.sin(t * 3) * 0.3 } };
    case 'newlocks': return { p: [-4.0, LAND, 16.0], ry: -Math.PI / 2, pose: { armR: t > W(204) ? -1.6 : 0, armL: 0.1 } };
    case 'reward': { const j = t > W(229) ? Math.abs(Math.sin((t - W(229)) * 6)) * 0.45 : 0; return { p: [1.6, LAND + j, 3.4], ry: 0.4,
      pose: { armL: t > W(229) ? 2.8 : 0, armR: t > W(229) ? -2.8 : 0, legs: j * 0.4 } }; }
    case 'cta': return { p: [1.6, LAND + bob * 0, 3.4], ry: 0.9, pose: { armR: -2.7 + Math.sin(t * 9) * 0.4, armL: 0.15 } };
    default: return null;
  }
};

export const Level = ({ t }: { t: number }) => {
  const n = shotName(t);
  const ob = St.oldBuild(), nb = St.newBuild();
  const oldSink = smooth(t, ob - 0.1, ob + 0.25), newSink = smooth(t, nb - 0.1, nb + 0.25);
  const trees = useMemo(() => {
    const r = seeded(42); const out: { x: number; z: number; y: number; s: number }[] = [];
    while (out.length < 46) {
      const x = -15 + r() * 61, z = -29 + r() * 46.5;
      const y = x < -10 ? 1.6 : x < -5 ? 2.8 : 4.0;
      if (inPoly(x, z, VALLEY_P) || (x < 0 && (Math.abs(z) < 2.2 || (z > 5 && z < 16))) || (x > 36 && Math.abs(z) < 8.5)) continue;
      if (x < 0 && z > 1.6 && z < 5.5) continue;
      if (Math.hypot(x - 13.5, z + 16.5) < 2 || Math.hypot(x - 1.6, z - 3.4) < 1.5 || Math.hypot(x - 5.2, z + 4.0) < 1.5) continue;
      out.push({ x, z, y, s: 0.9 + r() * 0.8 });
    }
    return out;
  }, []);
  const wk = worker(t);
  const shipsNow = St.ships(t);
  const dam = St.damT();
  const lk = St.lake(t);
  const dg = St.dig(t);
  return (
    <group>
      {/* mar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={mat(C.water, { rough: 0.25 })} receiveShadow>
        <planeGeometry args={[600, 600]} />
      </mesh>
      {/* terraços: faixa de trás, pátio baixo, faixa das piscinas, enchimentos das faixas das eclusas */}
      {[0, 1, 2].map(i => (
        <group key={i}>
          <Block x0={STEP_X[i]} x1={STEP_X[i + 1]} z0={-30} z1={-1.6} top={TOP[i]} />
          <Block x0={STEP_X[i]} x1={STEP_X[i + 1]} z0={1.6} z1={5.5} top={0.5} />
          <Block x0={STEP_X[i]} x1={STEP_X[i + 1]} z0={9.7} z1={18} top={TOP[i]} />
          <Block x0={STEP_X[i]} x1={STEP_X[i + 1]} z0={-1.6} z1={1.6} top={TOP[i]} sink={oldSink} />
          <Block x0={STEP_X[i]} x1={STEP_X[i + 1]} z0={5.5} z1={9.7} top={TOP[i]} sink={newSink} />
        </group>
      ))}
      <Slab poly={PLATEAU_S} top={LAND} depth={LAND + 0.6} />
      <Slab poly={PLATEAU_M} top={LAND} depth={LAND + 0.6} />
      <Slab poly={PLATEAU_N} top={LAND} depth={LAND + 0.6} />
      <Slab poly={VALLEY_P} top={VALLEY} depth={VALLEY + 0.6} cap="#63b845" />
      {/* rio no fundo do vale, sumindo no bueiro */}
      {RIVER.slice(1).map((q, i) => {
        const a = RIVER[i], dx = q[0] - a[0], dz = q[1] - a[1], len = Math.hypot(dx, dz);
        return <Box key={i} size={[len + 0.5, 0.06, 0.9]} pos={[(a[0] + q[0]) / 2, VALLEY + 0.03, (a[1] + q[1]) / 2]} rot={[0, -Math.atan2(dz, dx), 0]} color={C.water} shadow={false} />;
      })}
      <Box size={[1.4, 0.9, 0.3]} pos={[18, VALLEY + 0.45, -23.05]} color="#2b2d33" shadow={false} />
      {lk > 2.46 && <Water poly={LAKE_P} y={lk} opacity={0.9} />}
      {/* represa */}
      {t >= dam - 0.01 && (
        <group position={[18, VALLEY + St.keys(t, [[0, 0]]) + drop(t, dam, 7, 0.45), -15.5]}>
          <RBox size={[4.6, 1.75, 0.9]} pos={[0, 0.87, 0]} color={C.concrete} r={0.08} />
          {[-1.4, -0.47, 0.47, 1.4].map(x => <Box key={x} size={[0.5, 0.5, 0.05]} pos={[x, 1.25, 0.46]} color="#5d6a73" shadow={false} />)}
          <Box size={[4.7, 0.12, 1.0]} pos={[0, 1.8, 0]} color="#f2c230" />
        </group>
      )}
      <Hill t={t} />
      {/* eclusa antiga */}
      <Lock t={t} zc={0} w={OLD_W} lv={i => St.lvl(t, i)} gates={i => St.gate(t, i)} build={ob} />
      {/* eclusa nova + piscinas de reuso */}
      <Lock t={t} zc={NEW_Z} w={NEW_W} lv={i => St.newLvl(t, i)} gates={i => St.newGate(t, i)} build={nb} />
      {[0, 1, 2].map(i => [0, 1, 2].map(j => {
        const s = clamp(pop(t, St.basinBuild() + (i * 3 + j) * 0.07, 0.3));
        if (s <= 0.001) return null;
        const x = STEP_X[i] + 0.9 + j * 1.6, fill = i === 1 ? St.basinFill(t) : 0.45, y0 = TOP[i];
        return (
          <group key={`${i}${j}`} position={[x, y0, 12.0]} scale={[s, s, s]}>
            <Box size={[1.4, 0.12, 2.6]} pos={[0, 0.06, 0]} color={C.concreteDark} />
            {[-1, 1].map(e => <Box key={`x${e}`} size={[0.12, 0.7, 2.6]} pos={[e * 0.64, 0.35, 0]} color={C.concrete} />)}
            {[-1, 1].map(e => <Box key={`z${e}`} size={[1.4, 0.7, 0.12]} pos={[0, 0.35, e * 1.24]} color={C.concrete} />)}
            <mesh position={[0, 0.12 + 0.56 * fill / 2 + 0.02, 0]} material={mat(C.water, { rough: 0.2 })}>
              <boxGeometry args={[1.16, 0.56 * fill, 2.36]} />
            </mesh>
            <mesh position={[0, 0.25, -1.9]} rotation={[Math.PI / 2, 0, 0]} material={mat('#8b949a')}><cylinderGeometry args={[0.12, 0.12, 1.2, 8]} /></mesh>
          </group>
        );
      }))}
      {/* água indo e voltando das piscinas */}
      <Particles t={t} t0={W(207)} t1={W(217)} n={60} life={0.7} seed={5} color={C.foam} size={0.07}
        at={(r, a) => [-9.7 + r() * 4.4, 2.6 + 0.2 * Math.sin(a * 9), mix(9.3, 11.2, a / 0.7)]} />
      <Particles t={t} t0={76.8} t1={78.1} n={40} life={0.7} seed={6} color={C.foam} size={0.07}
        at={(r, a) => [-9.7 + r() * 4.4, 2.6 + 0.2 * Math.sin(a * 9), mix(11.2, 9.3, a / 0.7)]} />
      {/* mesa de controle com o botão grande */}
      {t >= ob && (
        <group position={[-12.2, 0.5, 2.25]} scale={clamp(pop(t, ob + 0.5))}>
          <RBox size={[0.4, 0.5, 0.3]} pos={[0, 0.25, 0]} color="#3b4a63" r={0.05} />
          <mesh position={[0, 0.53 - 0.05 * (smooth(t, W(84), W(85)) - smooth(t, W(86), W(87))), 0]} material={mat('#ff3b30', { rough: 0.4 })} castShadow>
            <cylinderGeometry args={[0.11, 0.12, 0.09, 16]} />
          </mesh>
        </group>
      )}
      {/* navios */}
      {shipsNow.filter(s => s.on).map(s => {
        const y = (s.newLock ? (s.x < -15 ? 0 : s.x < -10 ? St.newLvl(t, 0) : s.x < -5 ? St.newLvl(t, 1) : St.newLvl(t, 2)) : St.levelAtX(t, s.x));
        return (
          <group key={s.id} position={[s.x, y + 0.02 * Math.sin(t * 2.2 + s.seed), s.z]} rotation={[s.roll ?? 0, s.yaw ?? 0, 0.01 * Math.sin(t * 1.7 + s.seed)]}>
            <Ship seed={s.seed} L={s.L} B={s.B} />
          </group>
        );
      })}
      {/* mulas e cabos */}
      {St.mulesOn(t) && (() => {
        const sb = shipsNow.find(s => s.id === 'B')!; const sy = St.levelAtX(t, sb.x);
        return [-1, 1].map(side => [-1, 1].map(e => {
          const mx = Math.min(sb.x, -12.6) + e * 1.15, mz = side * (OLD_W / 2 + 0.25), top = TOP[0];
          const yd = drop(t, W(119) + (side + 1) * 0.08 + (e + 1) * 0.05, 5, 0.4);
          const a = new THREE.Vector3(mx, top + 0.42, mz), b = new THREE.Vector3(sb.x + e * 1.3, sy + 0.5, sb.z + side * 0.72);
          const k = St.cablesOn(t), mid = a.clone().lerp(b, 0.5), len = a.distanceTo(b) * k;
          const dir = b.clone().sub(a).normalize(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          return (
            <group key={`${side}${e}`}>
              <group position={[mx, top + yd, mz]}><Mule /></group>
              {k > 0 && <mesh position={a.clone().lerp(b, 0.5 * k)} quaternion={q} material={mat('#1e2328')}>
                <cylinderGeometry args={[0.022, 0.022, len, 5]} /></mesh>}
              {void mid}
            </group>
          );
        }));
      })()}
      {/* faíscas da raspada */}
      <Particles t={t} t0={W(114)} t1={W(114) + 1.0} n={40} life={0.35} seed={8} color="#ffd23f" size={0.05}
        at={(r, a) => { const sb = shipsNow.find(s => s.id === 'B')!; return [sb.x + 0.8 + r() * 1.4 + (r() - 0.5) * a * 6, St.lvl(t, 0) + 0.3 + a * (2 + r() * 3) - 9 * a * a, -1.05 + r() * 0.1 + a * 2]; }} />
      {/* jorro de água doce saindo para o mar */}
      <Particles t={t} t0={50.2} t1={52.6} n={140} life={0.9} seed={12} color={C.foam} size={0.09}
        at={(r, a) => { const z = (r() - 0.5) * 2; const y0 = Math.max(0.15, St.lvl(t, 0) * 0.8) + r() * 0.3; const v = 3 + r() * 3;
          const y = y0 + (1 + r() * 2) * a - 4.9 * a * a; return y < -0.05 ? null : [-15.2 - v * a, y, z * (1 + a)]; }} />
      {t > 50.3 && t < 53.6 && (
        <mesh position={[-16.8, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5 + smooth(t, 50.3, 51.2) * 0.9 - smooth(t, 52.4, 53.6) * 0.5} material={mat('#ffffff', { opacity: 0.45 })}>
          <ringGeometry args={[0.5, 1.2, 20]} />
        </mesh>
      )}
      {/* terra voando da pá */}
      <Particles t={t} t0={W(31)} t1={W(38) + 0.6} n={70} life={0.6} seed={14} color={C.dirtLight} size={0.07}
        at={(r, a) => [HX0 - 0.1 + dg.prog * 8.5 - a * (1 + r() * 1.5), LAND + 0.4 + a * (3 + r() * 2) - 9 * a * a, (r() - 0.5) * 1.6 + a * (r() - 0.3) * 2]} />
      {/* árvores, tufos, nuvens */}
      {trees.map((tr, i) => <group key={i} position={[tr.x, tr.y, tr.z]}><Tree s={tr.s} seed={i + 1} /></group>)}
      <Tufts n={1600} seed={4} regions={[[-15, -10, -30, -1.6, 1.6], [-10, -5, -30, -1.6, 2.8], [-5, 0, -30, -1.6, 4], [0, 46, -30, 18, 4],
        [-15, 0, 1.6, 5.5, 0.5], [-15, -10, 15.7, 18, 1.6], [-10, -5, 15.7, 18, 2.8], [-5, 0, 15.7, 18, 4]]}
        skip={(x, z) => (x >= 0 && inPoly(x, z, VALLEY_P)) || (x > 36.5 && Math.abs(z) < 8.5)} />
      <Tufts n={400} seed={8} regions={[[1, 30, -20, 9, VALLEY]]} skip={(x, z) => !inPoly(x, z, LAKE_P)} />
      <Cloud pos={[-30, 22, -45]} s={2.4} /><Cloud pos={[10, 26, -60]} s={3} /><Cloud pos={[40, 20, -30]} s={2} /><Cloud pos={[-45, 18, 20]} s={2.2} />
      {wk && <group position={wk.p} rotation={[0, wk.ry, 0]}><Worker pose={wk.pose} /></group>}
      {void n}{void lin}
    </group>
  );
};
