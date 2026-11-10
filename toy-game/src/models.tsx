// Peças de brinquedo low-poly feitas só com primitivas (nenhum modelo externo): navio, operário, mula, árvore, nuvem.
import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { C, CONTAINERS, seeded, clamp } from './lib';

type V3 = [number, number, number];
const mats = new Map<string, THREE.MeshStandardMaterial>();
export const mat = (color: string, o: { rough?: number; flat?: boolean; opacity?: number; emissive?: string; double?: boolean } = {}) => {
  const k = `${color}|${o.rough ?? 0.75}|${o.flat ?? false}|${o.opacity ?? 1}|${o.emissive ?? ''}|${o.double ?? false}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.75, metalness: 0, flatShading: o.flat ?? false,
      transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, emissive: o.emissive ?? '#000000', side: o.double ? THREE.DoubleSide : THREE.FrontSide });
    if ((o.opacity ?? 1) < 1) m.depthWrite = false;
    mats.set(k, m);
  }
  return m;
};
const rbox = new Map<string, THREE.BufferGeometry>();
export const rounded = (w: number, h: number, d: number, r = 0.06) => {
  const k = `${w}|${h}|${d}|${r}`;
  let g = rbox.get(k);
  if (!g) { g = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)); rbox.set(k, g); }
  return g;
};

export const RBox = ({ size, pos, color, r = 0.06, rot, opacity, shadow = true }:
  { size: V3; pos?: V3; color: string; r?: number; rot?: V3; opacity?: number; shadow?: boolean }) => (
  <mesh geometry={rounded(size[0], size[1], size[2], r)} material={mat(color, { opacity })} position={pos} rotation={rot}
    castShadow={shadow} receiveShadow />
);
export const Box = ({ size, pos, color, rot, opacity, shadow = true, flat }:
  { size: V3; pos?: V3; color: string; rot?: V3; opacity?: number; shadow?: boolean; flat?: boolean }) => (
  <mesh position={pos} rotation={rot} castShadow={shadow} receiveShadow material={mat(color, { opacity, flat })}>
    <boxGeometry args={size} />
  </mesh>
);

// ---------- Navio porta-contêiner (proa em +x, linha d'água em y=0) ----------
export const Ship = ({ L = 4, B = 1.7, seed = 1, scale = 1 }: { L?: number; B?: number; seed?: number; scale?: number }) => {
  const g = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-L / 2 + 0.15, -B / 2); s.lineTo(L / 2 - 0.75, -B / 2); s.quadraticCurveTo(L / 2 - 0.1, -B / 2 + 0.1, L / 2, 0);
    s.quadraticCurveTo(L / 2 - 0.1, B / 2 - 0.1, L / 2 - 0.75, B / 2); s.lineTo(-L / 2 + 0.15, B / 2);
    s.quadraticCurveTo(-L / 2, B / 2, -L / 2, B / 2 - 0.15); s.lineTo(-L / 2, -B / 2 + 0.15); s.quadraticCurveTo(-L / 2, -B / 2, -L / 2 + 0.15, -B / 2);
    const red = new THREE.ExtrudeGeometry(s, { depth: 0.38, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    const navy = new THREE.ExtrudeGeometry(s, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    const r = seeded(seed * 97 + 5);
    const boxes: { p: V3; c: string }[] = [];
    const rows = Math.floor((L - 1.7) / 0.46);
    const cols = Math.max(2, Math.floor((B - 0.25) / 0.28));
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const h = 1 + Math.floor(r() * 2.2);
      for (let k = 0; k < h; k++) boxes.push({ p: [-L / 2 + 1.05 + i * 0.46, 0.5 + k * 0.23, (j - (cols - 1) / 2) * 0.28],
        c: CONTAINERS[Math.floor(r() * CONTAINERS.length)] });
    }
    return { red, navy, boxes };
  }, [L, B, seed]);
  return (
    <group scale={scale}>
      <mesh geometry={g.red} material={mat(C.hullRed)} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]} castShadow receiveShadow />
      <mesh geometry={g.navy} material={mat(C.hullNavy)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} castShadow receiveShadow />
      <Box size={[L - 0.25, 0.04, B - 0.12]} pos={[0, 0.41, 0]} color={C.deck} />
      {g.boxes.map((b, i) => <RBox key={i} size={[0.42, 0.21, 0.25]} pos={b.p} color={b.c} r={0.025} />)}
      <RBox size={[0.55, 0.62, B * 0.82]} pos={[-L / 2 + 0.42, 0.74, 0]} color={C.deck} r={0.06} />
      <Box size={[0.57, 0.1, B * 0.84]} pos={[-L / 2 + 0.42, 0.9, 0]} color="#2a3550" shadow={false} />
      <RBox size={[0.64, 0.06, B * 0.95]} pos={[-L / 2 + 0.42, 1.07, 0]} color={C.deck} r={0.02} />
      <mesh position={[-L / 2 + 0.25, 1.25, 0]} material={mat('#e5483d')} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.32, 10]} />
      </mesh>
      <mesh position={[-L / 2 + 0.25, 1.43, 0]} material={mat('#222831')} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
      </mesh>
    </group>
  );
};

// ---------- Operário (o nosso: colete laranja, capacete amarelo, bigode) ----------
export type Pose = { armL?: number; armR?: number; armLz?: number; armRz?: number; lean?: number; head?: number; legs?: number; shovel?: boolean; tool?: number };
export const Worker = ({ pose = {}, scale = 0.55 }: { pose?: Pose; scale?: number }) => {
  const { armL = 0, armR = 0, armLz = 0, armRz = 0, lean = 0, head = 0, legs = 0, shovel = false, tool = 0 } = pose;
  return (
    <group scale={scale}>
      <group rotation={[lean, 0, 0]}>
        {[-1, 1].map(s => (
          <group key={s} position={[0, 0.42, s * 0.085]} rotation={[0, 0, s * legs]}>
            <RBox size={[0.13, 0.36, 0.12]} pos={[0, -0.2, 0]} color={C.pants} r={0.04} />
            <RBox size={[0.19, 0.08, 0.13]} pos={[0.03, -0.38, 0]} color={C.boot} r={0.03} />
          </group>
        ))}
        <RBox size={[0.24, 0.36, 0.34]} pos={[0, 0.6, 0]} color={C.shirt} r={0.08} />
        <RBox size={[0.26, 0.28, 0.36]} pos={[0, 0.62, 0]} color={C.vest} r={0.06} />
        <Box size={[0.27, 0.04, 0.37]} pos={[0, 0.58, 0]} color="#e8eef2" shadow={false} />
        {[[-1, armL, armLz], [1, armR, armRz]].map(([s, a, az]) => (
          <group key={s} position={[0, 0.74, s * 0.21]} rotation={[s * az, 0, a]}>
            <RBox size={[0.1, 0.3, 0.1]} pos={[0, -0.14, 0]} color={C.shirt} r={0.04} />
            <mesh position={[0, -0.31, 0]} material={mat(C.skin)} castShadow><sphereGeometry args={[0.055, 10, 8]} /></mesh>
            {shovel && s === 1 && (
              <group position={[0.02, -0.31, 0]} rotation={[0, 0, tool]}>
                <Box size={[0.03, 0.55, 0.03]} pos={[0.12, -0.05, 0]} color={C.trunk} rot={[0, 0, 0.5]} />
                <Box size={[0.12, 0.14, 0.02]} pos={[0.26, -0.26, 0]} color="#8d969c" rot={[0, 0, 0.5]} />
              </group>
            )}
          </group>
        ))}
        <group position={[0, 0.98, 0]} rotation={[0, head, 0]}>
          <mesh material={mat(C.skin)} castShadow><sphereGeometry args={[0.17, 16, 12]} /></mesh>
          <mesh position={[0.165, -0.01, 0]} material={mat('#e9a77f')}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
          {[-1, 1].map(s => (
            <mesh key={s} position={[0.145, 0.045, s * 0.06]} material={mat('#1d1d24')}><sphereGeometry args={[0.022, 8, 6]} /></mesh>
          ))}
          <RBox size={[0.04, 0.035, 0.14]} pos={[0.165, -0.055, 0]} color={C.hair} r={0.015} shadow={false} />
          <mesh position={[0, 0.05, 0]} material={mat(C.helmet, { rough: 0.45 })} castShadow>
            <sphereGeometry args={[0.185, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh position={[0.03, 0.05, 0]} material={mat(C.helmet, { rough: 0.45 })} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.025, 18]} />
          </mesh>
          <Box size={[0.03, 0.06, 0.06]} pos={[0.0, 0.235, 0]} color="#f2b705" shadow={false} />
        </group>
      </group>
    </group>
  );
};

// ---------- Mula (locomotiva elétrica que segura o navio) ----------
export const Mule = () => (
  <group>
    <RBox size={[0.7, 0.32, 0.36]} pos={[0, 0.25, 0]} color={C.mule} r={0.07} />
    <RBox size={[0.36, 0.2, 0.34]} pos={[0.06, 0.5, 0]} color={C.mule} r={0.06} />
    <Box size={[0.38, 0.08, 0.35]} pos={[0.06, 0.52, 0]} color="#22313f" shadow={false} />
    <Box size={[0.72, 0.05, 0.37]} pos={[0, 0.2, 0]} color="#ffd43b" shadow={false} />
    {[-0.22, 0.22].map(x => [-0.15, 0.15].map(z => (
      <mesh key={`${x}${z}`} position={[x, 0.08, z]} rotation={[Math.PI / 2, 0, 0]} material={mat('#2b2b30')}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 10]} />
      </mesh>
    )))}
  </group>
);

export const Tree = ({ s = 1, seed = 1 }: { s?: number; seed?: number }) => {
  const r = seeded(seed)();
  return (
    <group scale={s}>
      <mesh position={[0, 0.3, 0]} material={mat(C.trunk)} castShadow><cylinderGeometry args={[0.07, 0.1, 0.6, 6]} /></mesh>
      <mesh position={[0, 0.85, 0]} material={mat(r > 0.5 ? C.leaf : C.leafLight, { flat: true })} castShadow>
        <icosahedronGeometry args={[0.42, 0]} />
      </mesh>
      <mesh position={[0.05, 1.18, 0.03]} material={mat(r > 0.5 ? C.leafLight : C.leaf, { flat: true })} castShadow>
        <icosahedronGeometry args={[0.28, 0]} />
      </mesh>
    </group>
  );
};

export const Cloud = ({ pos, s = 1 }: { pos: V3; s?: number }) => (
  <group position={pos} scale={s}>
    {[[0, 0, 0, 1], [1.1, -0.2, 0.2, 0.75], [-1.0, -0.25, 0, 0.7], [0.4, 0.45, -0.1, 0.7]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} scale={[r, r * 0.75, r]} material={mat('#ffffff', { flat: true, rough: 1 })}>
        <icosahedronGeometry args={[1, 1]} />
      </mesh>
    ))}
  </group>
);

// Tufos de grama e florzinhas (instanced): pontos sorteados nas regiões dadas, fora das áreas excluídas.
export const Tufts = ({ regions, n, seed = 3, skip }: { regions: [number, number, number, number, number][]; n: number; seed?: number; skip?: (x: number, z: number) => boolean }) => {
  const { tuft, flower } = useMemo(() => {
    const r = seeded(seed);
    const tg = new THREE.ConeGeometry(0.05, 0.15, 3); tg.translate(0, 0.075, 0);
    const fg = new THREE.IcosahedronGeometry(0.035, 0);
    const tuft = new THREE.InstancedMesh(tg, mat('#86e05c', { flat: true }), n);
    const flower = new THREE.InstancedMesh(fg, mat('#ffffff'), Math.floor(n / 8));
    const m = new THREE.Matrix4(); const area = regions.reduce((a, g) => a + (g[1] - g[0]) * (g[3] - g[2]), 0);
    let ti = 0, fi = 0, guard = 0;
    while ((ti < n || fi < flower.count) && guard++ < n * 20) {
      let pick = r() * area, g = regions[0];
      for (const q of regions) { const a = (q[1] - q[0]) * (q[3] - q[2]); if (pick < a) { g = q; break; } pick -= a; }
      const x = g[0] + r() * (g[1] - g[0]), z = g[2] + r() * (g[3] - g[2]);
      if (skip?.(x, z)) continue;
      if (fi < flower.count && r() < 0.13) {
        m.makeTranslation(x, g[4] + 0.04, z); flower.setMatrixAt(fi, m);
        flower.setColorAt(fi, new THREE.Color(['#ffffff', '#ffe14d', '#ff8fb8'][fi % 3])); fi++;
      } else if (ti < n) {
        const sc = 0.7 + r() * 0.8; m.compose(new THREE.Vector3(x, g[4], z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), new THREE.Vector3(sc, sc, sc));
        tuft.setMatrixAt(ti++, m);
      }
    }
    tuft.count = ti; flower.count = fi;
    return { tuft, flower };
  }, [n, seed]);
  return <><primitive object={tuft} /><primitive object={flower} /></>;
};

// Marolas de brinquedo: traços brancos que nascem, deslizam e somem na água (dão vida ao mar e ao mapa).
export const Waves = ({ t, x0, x1, z0, z1, n = 260, y = 0.03, len = 0.9, seed = 21, avoid }:
  { t: number; x0: number; x1: number; z0: number; z1: number; n?: number; y?: number; len?: number; seed?: number; avoid?: [number, number, number] }) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(len, 0.02, len * 0.12);
    return new THREE.InstancedMesh(g, mat('#ffffff', { opacity: 0.7 }), n);
  }, [n, len]);
  const r = seeded(seed); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const px = r(), pz = r(), ph = r(), sp = 0.4 + r() * 0.5, per = 2.5 + r() * 2;
    const k = ((t / per + ph) % 1), life = Math.sin(k * Math.PI);
    const x = x0 + ((px * (x1 - x0) + t * sp) % (x1 - x0)), z = z0 + pz * (z1 - z0);
    // perto da lente um traço vira uma barra branca enorme: some dentro do raio `avoid`
    const near = avoid ? clamp((Math.hypot(x - avoid[0], z - avoid[1]) - avoid[2]) / 3) : 1;
    m.compose(v.set(x, y, z), q.setFromEuler(e.set(0, 0.15, 0)), sc.set(0.3 + life, 1, Math.max(0.001, life * near)));
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
