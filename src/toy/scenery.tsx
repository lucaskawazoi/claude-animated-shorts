// Cenário genérico do mundo de brinquedo: céu, chão com manchas e tufos, morros/dunas, árvores, palmeiras, nuvens, fumaça.
// Cores por episódio (deserto, campo, montanha…): cada componente recebe a paleta.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, fract, lerp, mat, rnd } from "./kit";

export const Sky: React.FC<{ top?: string; mid?: string; low?: string }> = ({ top = "#2f8cf0", mid = "#6fb9ff", low = "#e8f5ff" }) => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 4; cv.height = 256;
    const g = cv.getContext("2d")!; const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, top); gr.addColorStop(0.45, mid); gr.addColorStop(0.66, low); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [top, mid, low]);
  return <mesh><sphereGeometry args={[600, 24, 16]} /><meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} /></mesh>;
};

export type GroundPal = { base: string; patch: string[]; blade: string; flowers?: string[]; x: [number, number]; z: [number, number]; nBlades?: number };
export const Ground: React.FC<{ g: GroundPal }> = ({ g }) => {
  const patches = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ p: [lerp(g.x[0], g.x[1], rnd(i * 3 + 1)), 0.01 + (i % 5) * 0.002, lerp(g.z[0], g.z[1], rnd(i * 3 + 2))] as V3, s: lerp(4, 14, rnd(i * 3 + 3)), c: g.patch[i % g.patch.length] })), [g]);
  const blades = useMemo(() => {
    const n = g.nBlades ?? 600, geo = new THREE.ConeGeometry(0.16, 0.5, 3), m = new THREE.InstancedMesh(geo, mat(g.blade, { flat: true }), n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { d.position.set(lerp(g.x[0], g.x[1], rnd(i * 5 + 1)), 0.2, lerp(g.z[0], g.z[1], rnd(i * 5 + 2))); d.scale.setScalar(lerp(0.6, 1.5, rnd(i * 5 + 3))); d.rotation.y = rnd(i * 5 + 4) * 6; d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
    m.castShadow = false; m.receiveShadow = true; return m;
  }, [g]);
  const flowers = useMemo(() => {
    const cols = g.flowers ?? [], n = cols.length ? 80 : 0;
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshStandardMaterial({ color: "#ffffff" }), Math.max(1, n)), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { d.position.set(lerp(g.x[0], g.x[1], rnd(i * 7 + 1)), 0.14, lerp(g.z[0], g.z[1], rnd(i * 7 + 2))); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
    m.count = n; return m;
  }, [g]);
  return (
    <G>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat(g.base)}><planeGeometry args={[900, 600]} /></mesh>
      {patches.map((q, i) => <mesh key={i} position={q.p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.s, 18]} /></mesh>)}
      <primitive object={blades} /><primitive object={flowers} />
    </G>
  );
};

/** morros ou dunas ao fundo (meias-esferas achatadas) */
export const Hills: React.FC<{ c: [string, string]; z?: number; n?: number; x0?: number; flat?: number }> = ({ c, z = -75, n = 14, x0 = -90, flat = 1 }) => (
  <G>
    {Array.from({ length: n }, (_, i) => {
      const x = x0 + i * 16 + rnd(i) * 8, r = lerp(16, 30, rnd(i + 20)), zz = z - rnd(i + 5) * 22;
      return <Sph key={i} rad={r} p={[x, -r * 0.55, zz]} sc={[1.4, flat, 1]} c={c[i % 2]} ws={18} hs={10} cast={false} />;
    })}
  </G>
);

export const Trees: React.FC<{ spots: V3[]; c?: [string, string] }> = ({ spots, c = ["#3fae2c", "#58c63a"] }) => (
  <G>
    {spots.map((q, i) => {
      const s = lerp(0.9, 1.6, rnd(i + 3));
      return (
        <G key={i} p={q} sc={s}>
          <Cyl rt={0.18} rb={0.26} h={1.3} p={[0, 0.65, 0]} c="#7a4a2a" seg={6} />
          <Cone rad={1.25} h={1.9} p={[0, 2.0, 0]} c={c[0]} seg={6} o={{ flat: true }} />
          <Cone rad={0.95} h={1.6} p={[0, 3.0, 0]} c={c[1]} seg={6} o={{ flat: true }} />
        </G>
      );
    })}
  </G>
);

/** palmeira de brinquedo: tronco em gomos curvado + 7 folhas que balançam ao vento */
export const Palms: React.FC<{ spots: V3[]; t: number }> = ({ spots, t }) => (
  <G>
    {spots.map((q, i) => {
      const s = lerp(0.9, 1.4, rnd(i + 11)), lean = (rnd(i + 2) - 0.5) * 0.35, yaw = rnd(i + 7) * 6;
      return (
        <G key={i} p={q} sc={s} r={[0, yaw, 0]}>
          {Array.from({ length: 4 }, (_, k) => <Cyl key={k} rt={0.2 - k * 0.018} rb={0.24 - k * 0.018} h={1.1} p={[lean * k * 1.1, 0.55 + k * 1.08, 0]} r={[0, 0, -lean]} c={k % 2 ? "#9a6a3a" : "#87582e"} seg={7} />)}
          <G p={[lean * 4.5, 4.4, 0]}>
            {Array.from({ length: 5 }, (_, k) => {
              const a = (k / 5) * Math.PI * 2, sw = 0.08 * Math.sin(t * 2.2 + k + i);
              return <G key={k} r={[0, a, 0]}><Box s={[2.6, 0.06, 0.6]} p={[1.2, -0.25, 0]} r={[0, 0, -0.38 + sw]} c={k % 2 ? "#3c9a2c" : "#4fb236"} o={{ flat: true }} /></G>;
            })}
            <Sph rad={0.28} c="#6b4a22" p={[0, -0.15, 0]} ws={8} hs={6} />
          </G>
        </G>
      );
    })}
  </G>
);

export const Clouds: React.FC<{ t: number; y?: number; n?: number }> = ({ t, y = 38, n = 9 }) => (
  <G>
    {Array.from({ length: n }, (_, i) => {
      const x = lerp(-130, 150, fract(i * 0.117 + 0.03 + t * 0.0016)), yy = y + rnd(i) * 22, z = -120 - rnd(i + 9) * 80;
      return (
        <G key={i} p={[x, yy + 12, z]} sc={lerp(0.7, 1.3, rnd(i + 4))}>
          <Sph rad={6} c="#ffffff" cast={false} o={{ rough: 1, emissive: "#ffffff", ei: 0.55 }} /><Sph rad={5} p={[7, -1, 0]} c="#ffffff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} /><Sph rad={4.5} p={[-7, -1.2, 1]} c="#ffffff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} /><Sph rad={3.5} p={[12, -2, 0]} c="#f4faff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} />
        </G>
      );
    })}
  </G>
);

/** fumaça/vapor/poeira: n bolhas subindo e crescendo em ciclo */
export const Puffs: React.FC<{ t: number; p: V3; n?: number; period?: number; rise?: number; size?: number; c?: string; on?: number; drift?: V3; o?: number }> = ({ t, p, n = 8, period = 3, rise = 6, size = 1, c = "#ffffff", on = 1, drift = [0.8, 0, 0], o = 0 }) => (
  <G p={p} vis={on > 0.01}>
    {Array.from({ length: n }, (_, i) => {
      const u = fract((t + i * (period / n)) / period + o), s = Math.sin(Math.min(1, u * 1.15) * Math.PI) * size * (0.5 + u * 1.2) * on;
      return <Sph key={i} rad={1} p={[drift[0] * u + (rnd(i) - 0.5) * 0.6, u * rise, drift[2] * u + (rnd(i + 3) - 0.5) * 0.5]} sc={Math.max(0.001, s)} c={c} cast={false} ws={8} hs={6} o={{ rough: 1 }} />;
    })}
  </G>
);
