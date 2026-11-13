// Mundo do E5: Machu Picchu de brinquedo. A cidade no selado entre duas montanhas (topo y=10, x -8..8, z -14..10),
// encostas íngremes até o vale do Urubamba (y=0); Huayna Picchu ao fundo (z=-28). Andenes na encosta leste (x 8..20);
// o corte do dreno na frente do andén 3; muro de silharia com porta trapezoidal; 16 fontes em fila; pedreira no norte.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const H = 10;
const STONE = "#a9a59b", STONE2 = "#8f8b82", GRASS = "#6fbf48", JUNGLE = "#3f8f3a";
const GROUND: GroundPal = { base: "#4f9a3a", patch: ["#468f34", "#5aa842", "#3f8a30"], blade: "#2f7a2a", x: [-80, 80], z: [-70, 50], nBlades: 300 };
export const built = (t: number) => t < T.peru - 0.12;
// tremor: no «tiembla», no gancho e de novo no «aguanta» (o muro inclinado treme e não cai)
const quake = (t: number) => (t > T.tiembla - 0.3 && t < T.b3 ? 1 - ease(t, T.tiembla + 0.9, T.b3) : t > T.fallas && t < T.pie ? 0.5 : t > T.aguanta - 0.9 && t < T.silleria - 0.2 ? 0.9 : 0);

// ---------------------------------------------------------------- relevo
const Ridge: React.FC = () => {
  const shape = useMemo(() => { const s = new THREE.Shape(); s.moveTo(-26, 0); s.lineTo(-8, H); s.lineTo(8, H); s.lineTo(26, 0); s.closePath(); return s; }, []);
  return (
    <G>
      <mesh position={[0, 0, -16]} castShadow receiveShadow material={mat(JUNGLE)}><extrudeGeometry args={[shape, { depth: 28, bevelEnabled: false }]} /></mesh>
      <mesh position={[0, H + 0.02, -2]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(GRASS)}><planeGeometry args={[16, 28]} /></mesh>
      {/* Huayna Picchu e a montanha Machu Picchu */}
      <Cone rad={11} h={26} seg={7} p={[2, 13, -30]} c="#3c8a36" o={{ flat: true }} />
      <Cone rad={4} h={7} seg={7} p={[2, 24.5, -30]} c="#8a8a80" o={{ flat: true }} cast={false} />
      <Cone rad={16} h={30} seg={7} p={[-26, 15, 26]} c="#3a8434" o={{ flat: true }} />
      {[[-46, -40, 20, 30], [40, -46, 22, 34], [52, 10, 18, 24], [-54, 0, 18, 26]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c={i % 2 ? "#4a9440" : "#3f8a36"} o={{ flat: true }} cast={false} />)}
      {/* o Urubamba em volta */}
      <mesh position={[34, 0.05, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#5a9ec8", { rough: 0.3 })}><planeGeometry args={[6, 160]} /></mesh>
      <mesh position={[-36, 0.05, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#5a9ec8", { rough: 0.3 })}><planeGeometry args={[6, 160]} /></mesh>
    </G>
  );
};
/** tufos de mata na encosta (a selva) */
const Jungle: React.FC = () => {
  const m = useMemo(() => {
    const n = 220, g = new THREE.IcosahedronGeometry(1, 0), im = new THREE.InstancedMesh(g, mat("#3a8a30", { flat: true }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, u = rnd(i * 3 + 1), x = side * lerp(9.5, 25, u), y = H * (1 - (Math.abs(x) - 8) / 18) + 0.3, z = lerp(-15, 11, rnd(i * 3 + 2));
      if (side > 0 && Math.abs(x) < 24 && z < 15) continue; // onde vão os andenes e o corte do dreno
      o.position.set(x, Math.max(0.3, y), z); o.scale.setScalar(lerp(0.6, 1.3, rnd(i * 3 + 3))); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.castShadow = true; return im;
  }, []);
  return <primitive object={m} />;
};

// ---------------------------------------------------------------- andenes (terraços) que sobem um a um
export const NT = 8;
const terraceAt = (t: number, k: number) => (built(t) ? 1 : ease(t, T.escalones + k * 0.38, T.escalones + k * 0.38 + 0.5));
const Terraces: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: NT }, (_, k) => {
      const u = terraceAt(t, k); if (u <= 0.01) return null;
      const x0 = 8 + k * 1.5, top = H - 0.94 * k, h = Math.max(0.2, top) * u;
      return (
        <G key={k}>
          <Box s={[1.5, h, 22]} p={[x0 + 0.75, h / 2, -3.5]} c={STONE2} />
          <Box s={[1.52, 0.18, 22]} p={[x0 + 0.75, h + 0.05, -3.5]} c={GRASS} />
          <Box s={[0.1, Math.min(1.0, h), 22]} p={[x0 + 1.5, h - 0.5, -3.5]} c={STONE} cast={false} />
        </G>
      );
    })}
  </G>
);
/** a casinha que escorrega na encosta (o problema) */
const Slider: React.FC<{ t: number }> = ({ t }) => {
  if (built(t) || t > T.b1 + 0.6) return null;
  const u = ease(t, T.p1 + 0.6, T.desliza + 0.5);
  return <G p={[lerp(12, 22, u), lerp(H - 2.4, 0.8, u) + 0.8, 6]} r={[0, 0, -0.55 - u * 1.5]}><Box s={[2, 1.6, 2]} c={STONE} /><Cone rad={1.7} h={1.3} seg={4} p={[0, 1.4, 0]} r={[0, PI / 4, 0]} c="#c9a24a" /></G>;
};
const Rain: React.FC<{ t: number }> = ({ t }) => {
  const on = (t < T.fallas ? 1 : 0) + (t > T.p2 - 0.2 && t < T.b2 + 0.4 ? 1 : 0); if (!on) return null;
  return <G>{Array.from({ length: 70 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.04, 0.9, 0.04]} p={[lerp(-6, 26, rnd(i + 1)), 18 - u * 18, lerp(-10, 16, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
const Mud: React.FC<{ t: number }> = ({ t }) => {
  const u = ease(t, T.p2 + 0.8, T.abajo + 0.3) * (1 - ease(t, T.b2, T.b2 + 0.5)); if (u <= 0.01) return null;
  return <G>{Array.from({ length: 6 }, (_, i) => <Sph key={i} rad={1.0} p={[lerp(15, 23, u) + i * 0.4, lerp(4.5, 0.6, u), 4 + i * 1.2]} sc={[1.4, 0.45, 1]} c="#6b4a2a" ws={8} hs={6} />)}</G>;
};

// ---------------------------------------------------------------- corte do dreno: terra, areia, cascalho, pedras; a água escorre
const Drain: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p2 || t > T.p3 + 1) return null;
  const x = 11.5, top = H - 0.94 * 2 + 0.2, z = 13.6; // na frente da encosta (a face do relevo fica em z=12)
  const L = [["tierra", "#5a3a22", 0.5, T.tierra], ["arena", "#e7cf8e", 0.5, T.arena], ["grava", "#9a958c", 0.6, T.grava], ["piedras", "#7d7a73", 1.0, T.piedras]] as const;
  let y = top; const water = ease(t, T.escurre - 0.2, T.sesenta);
  return (
    <G>
      <Box s={[3.4, 0.2, 3.0]} p={[x, top + 0.1, z]} c={GRASS} />
      <Box s={[3.4, top - 2.6, 3.0]} p={[x, (top - 2.6) / 2, z]} c={JUNGLE} />
      {L.map(([n, c, h, a], i) => {
        y -= h; const u = ease(t, a - 0.15, a + 0.3);
        return (
          <G key={n} p={[x, y + h / 2, z]} sc={[1, Math.max(0.01, u), 1]} vis={u > 0.01}>
            <Box s={[3.4, h, 3.0]} c={c} />
            {n === "grava" ? Array.from({ length: 14 }, (_, k) => <Sph key={k} rad={0.12} p={[-1.5 + (k % 7) * 0.5, (rnd(k) - 0.5) * 0.3, 1.52]} c="#6f6b64" ws={6} hs={4} cast={false} />) : null}
            {n === "piedras" ? Array.from({ length: 6 }, (_, k) => <Sph key={k} rad={0.32} p={[-1.4 + k * 0.56, (rnd(k + 3) - 0.5) * 0.3, 1.45]} c="#66635c" ws={7} hs={5} cast={false} />) : null}
          </G>
        );
      })}
      {Array.from({ length: 10 }, (_, k) => { const u = fract(t * 0.8 + k / 10); return <Sph key={k} rad={0.11} p={[x - 1.2 + (k % 5) * 0.6, top - u * 2.7, z + 1.55]} c="#4aa8ff" o={{ emissive: "#2f8fd8", ei: 0.5 }} vis={water > 0.2} cast={false} ws={6} hs={4} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- casas incas, muro de silharia com porta trapezoidal, fontes, pedreira, lhamas
const HOUSES: [number, number, number][] = [[-5.5, -11, 0], [-1.5, -11.5, 1], [-6, -5.5, 1], [-6.5, 0.5, 0], [5.5, -3.5, 0], [5.5, 1.5, 1], [-1.5, -6, 0], [2, -2, 1]];
const growAt = (t: number) => (t > T.siglo ? ease(t, T.siglo, T.vacia + 0.6) : 0);
const Houses: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.talladas - 0.4, T.silleria), grow = growAt(t), roofs = 1 - ease(t, T.vacia, T.espanoles);
  return (
    <G>
      {HOUSES.map(([x, z, v], i) => {
        const u = clamp(k * 1.6 - (i / HOUSES.length) * 0.6); if (u <= 0.01) return null;
        return (
          <G key={i} p={[x, H, z]}>
            <Box s={[2.6, 1.6 * u, 2.0]} p={[0, 0.8 * u, 0]} r={[0, v * 0.1, 0]} c={i % 2 ? STONE : "#b3afa5"} />
            <Cone rad={2.0} h={1.8} seg={4} p={[0, 1.6 * u + 0.9, 0]} r={[0, PI / 4, 0]} sc={[1, Math.max(0.01, u * roofs), 0.8]} c="#c9a24a" vis={roofs > 0.02} />
            <Sph rad={0.6} p={[0.8, 1.4, 0.9]} sc={Math.max(0.01, grow)} c="#3a8a30" ws={7} hs={5} vis={grow > 0.02} />
          </G>
        );
      })}
    </G>
  );
};
/** muro de silharia: pedras poligonais encaixadas, inclinado para dentro, com porta em trapézio */
export const WALL = { x: 1.0, z: 8.6 };
const Ashlar: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.talladas - 0.2, T.muros + 0.4), lean = ease(t, T.muros, T.muros + 0.5) * 0.16 + (built(t) ? 0.16 : 0);
  const door = built(t) ? 1 : ease(t, T.trapecio - 0.6, T.trapecio + 0.2);
  const shake = quake(t) * 0.1 * Math.sin(t * 40);
  const stones = useMemo(() => {
    const out: { p: V3; s: V3; r: number }[] = []; let y = 0;
    for (let row = 0; row < 5; row++) { const h = 0.5 + rnd(row) * 0.25; let x = -3; while (x < 3) { const w = 0.6 + rnd(row * 13 + x * 7) * 0.7; if (!(row < 4 && x + w > -0.6 && x < 0.6)) out.push({ p: [x + w / 2, y + h / 2, 0], s: [w - 0.05, h - 0.05, 0.8], r: (rnd(row * 3 + x) - 0.5) * 0.12 }); x += w; } y += h; }
    return out;
  }, []);
  if (k <= 0.01) return null;
  return (
    <G p={[WALL.x + shake, H, WALL.z]} r={[-lean, 0, 0]}>
      <Box s={[6.1, 2.9 * k, 0.7]} p={[0, 1.45 * k, -0.05]} c="#5a5650" cast={false} />
      {stones.map((s, i) => <Box key={i} s={s.s} p={[s.p[0], s.p[1] * k + (1 - k) * 3, s.p[2]]} r={[0, 0, s.r]} c={i % 3 ? STONE : "#b5b1a7"} vis={i / stones.length < k * 1.2} />)}
      {/* porta trapezoidal: mais estreita em cima */}
      <mesh position={[0, 0, 0.42]} material={mat("#2a2622")} visible={door > 0.01} scale={[1, door, 1]}>
        <shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-0.6, 0); s.lineTo(0.6, 0); s.lineTo(0.42, 2.0); s.lineTo(-0.42, 2.0); s.closePath(); return s; })()]} />
      </mesh>
      <Box s={[1.1, 0.2, 0.8]} p={[0, 2.08, 0]} c="#c2beb4" vis={door > 0.5} />
    </G>
  );
};
/** manancial → canal de pedra → 16 fontes em fila, descendo */
const Fountains: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.manantial - 0.2, T.dieciseis + 0.5), flow = built(t) ? 1 : ease(t, T.canal, T.dieciseis + 0.4);
  if (t < T.p4) return null; // ponytail: o manancial (pedra que borbulha) já está lá antes de ser nomeado
  return (
    <G>
      {/* canal da encosta da montanha (sul) até a primeira fonte */}
      {/* manancial: rocha com água borbulhando na borda sul do selado, e o canal até a primeira fonte */}
      <Sph rad={1.3} p={[-3.8, H + 0.3, 11.8]} sc={[1.2, 0.8, 1]} c={STONE2} ws={8} hs={6} />
      <Puffs t={t} p={[-3.8, H + 1.0, 11.4]} n={9} period={1.0} rise={0.8} size={0.26} c="#7cc8ff" on={t > T.manantial - 0.4 ? 1 : 0} />
      {Array.from({ length: 6 }, (_, j) => <Sph key={j} rad={0.11} p={[-3.8, H + 0.38, 11.2 - fract(t * 0.9 + j / 6) * 2.2]} c="#9fdcff" o={{ emissive: "#4ab0ff", ei: 0.5 }} vis={flow > 0.2} cast={false} ws={6} hs={4} />)}
      <Box s={[0.6, 0.3, 2.2 * k]} p={[-3.8, H + 0.15, 10.1]} c={STONE2} />
      <Box s={[0.35, 0.05, 2.2 * flow]} p={[-3.8, H + 0.32, 10.1]} c="#4aa8ff" cast={false} vis={flow > 0.01} o={{ emissive: "#2f8fd8", ei: 0.3 }} />
      {Array.from({ length: 16 }, (_, i) => {
        const u = clamp(k * 1.5 - (i / 16) * 0.5); if (u <= 0.01) return null;
        const z = 9 - i * 1.15, y = H + 0.05 - i * 0.03;
        return (
          <G key={i} p={[-3.8, y, z]} sc={[1, u, 1]}>
            <Box s={[0.9, 0.4, 0.8]} p={[0, 0.2, 0]} c={STONE} /><Box s={[0.7, 0.05, 0.6]} p={[0, 0.38, 0]} c="#4aa8ff" vis={flow > (i / 16)} cast={false} />
            {Array.from({ length: 3 }, (_, j) => { const w = fract(t * 2 + j / 3); return <Sph key={j} rad={0.06} p={[0, 0.5 - w * 0.4, -0.45 - w * 0.25]} c="#7cc8ff" vis={flow > i / 16} cast={false} ws={5} hs={4} />; })}
          </G>
        );
      })}
    </G>
  );
};
/** pedreira: a rocha já rachada pelas falhas se parte em blocos; obreiros labram com martelos de pedra */
const Quarry: React.FC<{ t: number }> = ({ t }) => {
  const crack = ease(t, T.partida - 0.2, T.partida + 0.4), split = ease(t, T.partida + 0.4, T.labra + 0.4);
  const cutters = [[1.4, H, -15.4], [5.6, H, -15.2]].map(([x, y, z], i) => ({ p: [x, y, z] as V3, yaw: 0.3 - i * 0.6, pose: "chisel" as PoseName, ph: i * 0.4 }));
  return (
    <G>
      {[[-1, 0], [1, 0], [0, 1]].map(([dx, dy], i) => <Box key={i} s={[1.8, 1.4, 1.6]} p={[3.4 + dx * (1.0 + split * 0.5), H + 0.7 + dy * 1.4, -14.2 + split * 0.4 * i]} r={[0, rnd(i) * 0.4, (rnd(i + 3) - 0.5) * 0.2 * split]} c="#9d998f" />)}
      {[0, 1, 2].map((i) => <Box key={i} s={[0.06, 2.6, 0.06]} p={[2.9 + i * 0.6, H + 1.4, -13.38]} r={[0, 0, 0.3 - i * 0.3]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.4 }} vis={crack > 0.05 && split < 0.9} cast={false} />)}
      {[[0, -15.3], [6.6, -14.8], [-3, -14.2]].map(([x, z], i) => <Box key={i} s={[2.2, 1.6, 1.8]} p={[x, H + 0.8, z]} r={[0, rnd(i) * 0.6, 0]} c="#a3a095" />)}
      <Crowd list={cutters} t={t} c={COSTUMES.inca} vis={t > T.p5 && t < T.siglo} />
      <Puffs t={t} p={[2.3, H + 1.1, -13.4]} n={6} period={0.5} rise={0.5} size={0.12} c="#d8d3c8" on={t > T.labra - 0.3 && t < T.siglo ? 1 : 0} />
    </G>
  );
};
const Llamas: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {[[12.4, H - 0.94 * 3 + 0.2, 2], [15.4, H - 0.94 * 5 + 0.2, -4], [-2, H, -6]].map(([x, y, z], i) => {
      const s = Math.sin(t * 2 + i), pos: V3 = [x + 0.3 * s, y, z];
      return (
        <G key={i} p={pos} r={[0, i * 1.7 + 0.3 * s, 0]}>
          <Box s={[1.0, 0.6, 0.5]} p={[0, 1.0, 0]} c={i % 2 ? "#f2ead8" : "#a8784a"} /><Box s={[0.28, 0.9, 0.28]} p={[0.45, 1.6, 0]} c={i % 2 ? "#f2ead8" : "#a8784a"} />
          <Box s={[0.42, 0.3, 0.3]} p={[0.58, 2.05, 0]} c={i % 2 ? "#f2ead8" : "#a8784a"} /><Cone rad={0.06} h={0.25} seg={4} p={[0.5, 2.3, 0.08]} c="#3a2a20" /><Cone rad={0.06} h={0.25} seg={4} p={[0.5, 2.3, -0.08]} c="#3a2a20" />
          {[[-0.35, -0.15], [-0.35, 0.15], [0.35, -0.15], [0.35, 0.15]].map(([a, b], k) => <Cyl key={k} rt={0.06} h={0.7} p={[a, 0.35, b]} c="#5a3a24" seg={5} />)}
        </G>
      );
    })}
  </G>
);
/** falhas sísmicas brilhando no gancho */
const Faults: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.fallas - 0.1, T.fallas + 0.3) * (1 - ease(t, T.pie, T.peru)); if (k <= 0.01) return null;
  return <G>{[[-14, 6, 0.4], [-4, -8, -0.3], [14, -6, 0.8], [20, 10, -0.6]].map(([x, z, r], i) => <Box key={i} s={[16, 0.08, 0.25]} p={[x, 0.15, z]} r={[0, r, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.6 * k }} cast={false} />)}</G>;
};
const Mist: React.FC<{ t: number }> = ({ t }) => <G>{Array.from({ length: 7 }, (_, i) => <Sph key={i} rad={6} p={[lerp(-40, 40, fract(i * 0.17 + t * 0.004)), 4 + rnd(i) * 3, lerp(-20, 18, rnd(i + 3))]} sc={[2.2, 0.35, 1.2]} c="#ffffff" cast={false} recv={false} o={{ opacity: 0.55, depthWrite: false, emissive: "#ffffff", ei: 0.3 }} ws={10} hs={6} />)}</G>;

export const World: React.FC<{ t: number }> = ({ t }) => {
  const q = quake(t), sh: V3 = [q * 0.12 * Math.sin(t * 37), 0, q * 0.1 * Math.sin(t * 29)];
  return (
    <>
      <Sky top="#3a86d8" mid="#8cc3ee" low="#f0f4f6" />
      <Ground g={GROUND} />
      <Clouds t={t} n={8} y={30} />
      <G p={sh}>
        <Ridge /><Jungle />
        <Terraces t={t} /><Slider t={t} /><Mud t={t} /><Drain t={t} />
        <Houses t={t} /><Ashlar t={t} /><Fountains t={t} /><Quarry t={t} /><Llamas t={t} />
      </G>
      <Rain t={t} /><Faults t={t} />
    </>
  );
};
