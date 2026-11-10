// Cenário fixo do mundo de brinquedo: céu, chão, morros, árvores, nuvens, grama, canavial, cidade e postes.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, fract, lerp, mat, rnd } from "./kit";

export const PAL = {
  grass: "#6fd13f", grassDark: "#52b82c", dirt: "#b4603a", dirtDark: "#8e4a2c", concrete: "#c9d0d4", concreteDark: "#9aa4aa", road: "#7d7f80",
  cane: "#a9cf3a", caneLeaf: "#4aa82a", brick: "#c0503a", steel: "#8fa4b6", steelDark: "#5b6f80", amber: "#e8a41c", yellow: "#ffd400", water: "#4aa8ff",
};

export const Sky: React.FC = () => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 4; cv.height = 256;
    const g = cv.getContext("2d")!; const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#2f8cf0"); gr.addColorStop(0.45, "#6fb9ff"); gr.addColorStop(0.62, "#bfe3ff"); gr.addColorStop(0.7, "#e8f5ff"); gr.addColorStop(1, "#e8f5ff");
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  return <mesh><sphereGeometry args={[600, 24, 16]} /><meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} /></mesh>;
};

export const Ground: React.FC = () => {
  const patches = useMemo(() => Array.from({ length: 44 }, (_, i) => ({ p: [lerp(-70, 90, rnd(i * 3 + 1)), 0.01 + (i % 5) * 0.002, lerp(-30, 30, rnd(i * 3 + 2))] as V3, s: lerp(5, 16, rnd(i * 3 + 3)), c: i % 3 === 0 ? PAL.grassDark : "#7bdb4a" })), []);
  const blades = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.16, 0.5, 3), m = new THREE.InstancedMesh(geo, mat("#4aae26", { flat: true }), 700), d = new THREE.Object3D();
    for (let i = 0; i < 700; i++) { d.position.set(lerp(-70, 90, rnd(i * 5 + 1)), 0.22, lerp(-24, 22, rnd(i * 5 + 2))); d.scale.setScalar(lerp(0.7, 1.6, rnd(i * 5 + 3))); d.rotation.y = rnd(i * 5 + 4) * 6; d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
    m.castShadow = false; m.receiveShadow = true; return m;
  }, []);
  const flowers = useMemo(() => {
    const cols = ["#ffe14a", "#ff7ab8", "#ffffff"], m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshStandardMaterial({ color: "#ffffff" }), 90), d = new THREE.Object3D();
    for (let i = 0; i < 90; i++) { d.position.set(lerp(-70, 90, rnd(i * 7 + 1)), 0.14, lerp(-20, 22, rnd(i * 7 + 2))); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, new THREE.Color(cols[i % 3])); }
    return m;
  }, []);
  return (
    <G>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat(PAL.grass)}><planeGeometry args={[900, 500]} /></mesh>
      {patches.map((q, i) => <mesh key={i} position={q.p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.s, 18]} /></mesh>)}
      <primitive object={blades} /><primitive object={flowers} />
      {/* estrada de terra vermelha na frente das estações */}
      <mesh position={[10, 0.03, 5.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat(PAL.dirt)}><planeGeometry args={[180, 5.2]} /></mesh>
    </G>
  );
};

export const Hills: React.FC = () => (
  <G>
    {Array.from({ length: 14 }, (_, i) => {
      const x = -90 + i * 16 + rnd(i) * 8, r = lerp(16, 30, rnd(i + 20)), z = -75 - rnd(i + 5) * 22;
      return <Sph key={i} rad={r} p={[x, -r * 0.55, z]} sc={[1.4, 1, 1]} c={i % 2 ? "#5cc23a" : "#4eb232"} ws={18} hs={10} cast={false} />;
    })}
  </G>
);

export const Trees: React.FC<{ spots: V3[] }> = ({ spots }) => (
  <G>
    {spots.map((q, i) => {
      const s = lerp(0.9, 1.6, rnd(i + 3));
      return (
        <G key={i} p={q} sc={s}>
          <Cyl rt={0.18} rb={0.26} h={1.3} p={[0, 0.65, 0]} c="#7a4a2a" seg={6} />
          <Cone rad={1.25} h={1.9} p={[0, 2.0, 0]} c="#3fae2c" seg={6} o={{ flat: true }} />
          <Cone rad={0.95} h={1.6} p={[0, 3.0, 0]} c="#58c63a" seg={6} o={{ flat: true }} />
        </G>
      );
    })}
  </G>
);

export const Clouds: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: 9 }, (_, i) => {
      const x = lerp(-110, 130, fract(i * 0.117 + 0.03 + t * 0.0016)), y = 38 + rnd(i) * 22, z = -120 - rnd(i + 9) * 80;
      return (
        <G key={i} p={[x, y + 12, z]} sc={lerp(0.7, 1.3, rnd(i + 4))}>
          <Sph rad={6} c="#ffffff" cast={false} o={{ rough: 1, emissive: "#ffffff", ei: 0.55 }} /><Sph rad={5} p={[7, -1, 0]} c="#ffffff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} /><Sph rad={4.5} p={[-7, -1.2, 1]} c="#ffffff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} /><Sph rad={3.5} p={[12, -2, 0]} c="#f4faff" cast={false} o={{ emissive: "#ffffff", ei: 0.55 }} />
        </G>
      );
    })}
  </G>
);

/** canavial: 20 fileiras × 18 canas, instanciado; `grow` escala a altura (a cana nova cresce mais forte) */
export const CaneField: React.FC<{ grow: number; wet: number }> = ({ grow, wet }) => {
  const { stalks, leaves } = useMemo(() => {
    const N = 20 * 18, sg = new THREE.CylinderGeometry(0.075, 0.095, 3.4, 6), lg = new THREE.ConeGeometry(0.16, 2.0, 4);
    lg.translate(0, 1.0, 0); // pivô na base da folha
    const s = new THREE.InstancedMesh(sg, mat(PAL.cane, { flat: true }), N), l = new THREE.InstancedMesh(lg, mat(PAL.caneLeaf, { flat: true }), N * 3), d = new THREE.Object3D();
    let k = 0;
    for (let row = 0; row < 20; row++) for (let j = 0; j < 18; j++) {
      const x = -50 + row * 1.7 + rnd(k) * 0.4, z = -16 + j * 1.05 + rnd(k + 99) * 0.4, h = lerp(0.85, 1.15, rnd(k + 7));
      d.position.set(x, 1.7 * h, z); d.scale.set(1, h, 1); d.rotation.set((rnd(k + 3) - 0.5) * 0.1, 0, (rnd(k + 4) - 0.5) * 0.1); d.updateMatrix(); s.setMatrixAt(k, d.matrix);
      for (let q = 0; q < 3; q++) { // três folhas longas, abertas em leque, caindo para fora
        d.position.set(x, 3.3 * h, z); d.scale.set(1, h, 1); d.rotation.set(0, (q / 3) * Math.PI * 2 + rnd(k) * 2, 0); d.rotateX(0.75 + rnd(k + q) * 0.35); d.updateMatrix(); l.setMatrixAt(k * 3 + q, d.matrix);
      }
      k++;
    }
    s.castShadow = true; l.castShadow = true; return { stalks: s, leaves: l };
  }, []);
  return (
    <G>
      <G sc={[1, grow, 1]}><primitive object={stalks} /><primitive object={leaves} /></G>
      {/* faixa de solo encharcado onde a vinhaça chega */}
      <mesh position={[-33, 0.045, -7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow visible={wet > 0.01} scale={[wet, 1, 1]} material={mat("#3b2a1c", { rough: 0.35 })}><planeGeometry args={[36, 22]} /></mesh>
    </G>
  );
};

export type House = { p: V3; w: number; h: number; d: number; wall: string; roof: string };
export const HOUSES: House[] = [
  { p: [70, 0, -6], w: 4, h: 3, d: 3.6, wall: "#ffd9a8", roof: "#d4553a" }, { p: [76, 0, -5], w: 3.6, h: 2.6, d: 3.4, wall: "#bfe3ff", roof: "#7a4aa8" },
  { p: [82, 0, -7], w: 4.2, h: 3.4, d: 3.8, wall: "#ffc0c8", roof: "#2f7fc0" }, { p: [73, 0, -11], w: 3.8, h: 2.8, d: 3.6, wall: "#d9f2a8", roof: "#c0503a" },
  { p: [79, 0, -12], w: 4, h: 3.2, d: 3.6, wall: "#ffe8a0", roof: "#5a4aa8" }, { p: [86, 0, -12], w: 3.6, h: 2.8, d: 3.4, wall: "#ffd0b0", roof: "#2f9a6a" },
  { p: [67, 0, -12], w: 3.6, h: 2.6, d: 3.4, wall: "#e8d0ff", roof: "#d4553a" }, { p: [88, 0, -5], w: 4, h: 3, d: 3.6, wall: "#c8f0d8", roof: "#b8483a" },
];
export const Town: React.FC<{ lit: number[] }> = ({ lit }) => (
  <G>
    {HOUSES.map((h, i) => {
      const on = lit[i] ?? 0, wm = on > 0.5 ? { emissive: "#ffd45a", ei: 1.6 * on } : {};
      return (
        <G key={i} p={h.p}>
          <Box s={[h.w, h.h, h.d]} p={[0, h.h / 2, 0]} c={h.wall} />
          <Cone rad={Math.max(h.w, h.d) * 0.78} h={1.7} seg={4} p={[0, h.h + 0.85, 0]} r={[0, Math.PI / 4, 0]} sc={[1, 1, h.d / h.w]} c={h.roof} />
          <Box s={[0.9, 1.0, 0.1]} p={[-h.w * 0.22, h.h * 0.55, h.d / 2 + 0.02]} c={on > 0.5 ? "#ffe27a" : "#6c8fb0"} o={{ ...wm, rough: 0.3 }} cast={false} />
          <Box s={[0.9, 1.0, 0.1]} p={[h.w * 0.22, h.h * 0.55, h.d / 2 + 0.02]} c={on > 0.5 ? "#ffe27a" : "#6c8fb0"} o={{ ...wm, rough: 0.3 }} cast={false} />
          <Box s={[0.7, 1.4, 0.1]} p={[0, 0.7, h.d / 2 + 0.02]} c="#7a4a2a" cast={false} />
        </G>
      );
    })}
  </G>
);

/** linha de postes da turbina até a cidade; `packets` = bolinhas de energia correndo pelo fio */
export const PoleLine: React.FC<{ t: number; flow: number }> = ({ t, flow }) => {
  const xs = [31, 39, 47, 55, 63];
  return (
    <G>
      {xs.map((x, i) => (
        <G key={i} p={[x, 0, -9]}>
          <Cyl rt={0.16} rb={0.24} h={12.5} p={[0, 6.25, 0]} c="#7a4a2a" seg={6} />
          <Box s={[0.2, 0.2, 3.4]} p={[0, 11.9, 0]} c="#5b3c24" />
        </G>
      ))}
      {[-1.3, 0, 1.3].map((dz, k) => <Pipe key={k} a={[31, 11.9, -9 + dz]} b={[63, 11.85, -9 + dz]} rad={0.045} c="#222a30" seg={5} cast={false} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const u = fract(t * 0.55 + i / 6);
        return <Sph key={i} rad={0.28} p={[lerp(31, 68, u), 12.0, -9]} c="#ffe45a" o={{ emissive: "#ffd000", ei: 2.2 }} vis={flow > 0.01} sc={flow} cast={false} ws={8} hs={6} />;
      })}
      <Pipe a={[63, 11.85, -9]} b={[69, 5.6, -8]} rad={0.045} c="#222a30" seg={5} cast={false} />
    </G>
  );
};

export const clampT = clamp;
