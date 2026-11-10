// Mundo do E1: meseta de Guiza de brinquedo. Tudo é função do tempo t (sem estado).
// Eixos: pirâmide em (0,0,-8); pedreira à esquerda (x<-30); estrada do trenó em z≈7; Nilo em z 31..45 (Tura além, z>50);
// canal e porto à frente-direita; rampa na face +x; cidade dos obreiros em x 28..46; mastabas à frente-esquerda.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Quad, Sph, V3, clamp, ease, fract, lerp, mat, prog, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Hills, Palms, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { CUTS, T } from "./cues";

const PI = Math.PI;
export const PC: V3 = [0, 0, -8];
export const HB = 11, PH = 14; // meia-base e altura (proporção real 146/230)
const SAND = "#e8c27a";
const GROUND: GroundPal = { base: SAND, patch: ["#dcb36a", "#f0cf8e", "#e2bb72", "#d9ad62"], blade: "#b89a4a", x: [-90, 110], z: [-40, 70], nBlades: 260 };

// ---------------------------------------------------------------- crescimento da pirâmide (camadas)
export const layersAt = (t: number) =>
  4.3 + 4.7 * ease(t, T.p3 + 0.15, T.metros + 0.6) + 2.0 * ease(t, T.rampas, T.rampa + 0.4) + 3.0 * ease(t, T.veinte, T.terminada + 0.2);
export const topAt = (t: number) => Math.min(PH, layersAt(t));
const casingAt = (t: number) => ease(t, T.terminada - 0.1, T.terminada + 1.6);

const useBlockTex = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 32;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#d6b06a"; g.fillRect(0, 0, 128, 32);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#cfa862" : "#dbb873"; g.fillRect(i * 32 + 2, 2, 28, 28); }
  g.fillStyle = "#a9824a"; for (let i = 0; i < 4; i++) g.fillRect(i * 32, 0, 2, 32); g.fillRect(0, 0, 128, 2);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx;
}, []);

const Pyramid: React.FC<{ t: number }> = ({ t }) => {
  const tex = useBlockTex();
  const mats = useMemo(() => Array.from({ length: PH }, (_, i) => {
    const side = 2 * HB * (1 - (i + 1) / PH) + 0.3, m = tex.clone(); m.needsUpdate = true; m.repeat.set(Math.max(1, side / 2.2), 1);
    return new THREE.MeshStandardMaterial({ map: m, roughness: 0.9 });
  }), [tex]);
  const n = layersAt(t), cas = casingAt(t);
  return (
    <G p={PC}>
      {Array.from({ length: PH }, (_, i) => {
        const vis = n - i; if (vis <= 0) return null;
        const side = 2 * HB * (1 - (i + 1) / PH) + 0.3, h = clamp(vis);
        return <mesh key={i} position={[0, i + h / 2, 0]} castShadow receiveShadow material={mats[i]}><boxGeometry args={[side, h, side]} /></mesh>;
      })}
      {/* revestimento de calcário branco de Tura: sobe do chão quando a obra termina */}
      <G p={[0, -PH * 1.02 * (1 - cas), 0]} vis={cas > 0.001}>
        <mesh position={[0, PH / 2, 0]} rotation={[0, PI / 4, 0]} castShadow receiveShadow material={mat("#f5efdd", { rough: 0.45 })}><coneGeometry args={[HB * Math.SQRT2 + 0.2, PH, 4, 1]} /></mesh>
      </G>
    </G>
  );
};

/** planta fantasma do jogo: arestas ciano e faces translúcidas da pirâmide acabada */
const Ghost: React.FC<{ t: number }> = ({ t }) => {
  const k = 1 - ease(t, T.terminada - 0.3, T.terminada + 0.6); if (k <= 0.01) return null;
  const apex: V3 = [0, PH, 0], cs: V3[] = [[-HB, 0, -HB], [HB, 0, -HB], [HB, 0, HB], [-HB, 0, HB]];
  const edge = (a: V3, b: V3, i: number) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va), L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()), e = new THREE.Euler().setFromQuaternion(q);
    const m = va.add(vb).multiplyScalar(0.5);
    return <Cyl key={i} rt={0.07} h={L} p={[m.x, m.y, m.z]} r={[e.x, e.y, e.z]} c="#7fe3ff" o={{ emissive: "#5fd8ff", ei: 1.3 }} cast={false} seg={6} />;
  };
  const pulse = 0.85 + 0.15 * Math.sin(t * 4);
  return (
    <G p={PC} sc={[1, 1, 1]}>
      <mesh position={[0, PH / 2, 0]} rotation={[0, PI / 4, 0]} material={mat("#8fe8ff", { opacity: 0.16 * k * pulse, emissive: "#5fd8ff", ei: 0.6, depthWrite: false })}><coneGeometry args={[HB * Math.SQRT2 + 0.25, PH + 0.1, 4, 1, true]} /></mesh>
      <G vis={k > 0.3}>{cs.map((c, i) => edge(c, apex, i))}{cs.map((c, i) => edge(c, cs[(i + 1) % 4], i + 4))}</G>
    </G>
  );
};

// ---------------------------------------------------------------- pedreira, trenó e equipe
const Quarry: React.FC<{ t: number }> = ({ t }) => {
  if (t > T.p2 + 2 && t < T.veinte) return null;
  const LIME = "#ecd6a2", LIME2 = "#dcc28a";
  const cutters = [[-36.5, 3.6, 4.4], [-33.6, 2.0, 6.6], [-39.5, 3.6, 3.2]].map(([x, y, z], i) => ({ p: [x, y, z] as V3, yaw: 0.2 + i * 0.3, pose: "chisel" as PoseName, ph: i * 0.37 }));
  return (
    <G>
      <Box s={[16, 6, 9]} p={[-40, 3, -1.5]} c={LIME2} /><Box s={[13, 3.6, 4]} p={[-38.5, 1.8, 4.6]} c={LIME} /><Box s={[8, 2.0, 3]} p={[-34, 1.0, 7.0]} c={LIME} />
      <Box s={[3, 0.8, 2.2]} p={[-31, 0.4, 8.0]} c={LIME2} />
      {/* blocos já cortados */}
      {[[-31.5, 10.6], [-33.5, 10.2], [-35.5, 10.8], [-33.0, 12.2]].map(([x, z], i) => <Box key={i} s={[1.7, 1.3, 1.5]} p={[x, 0.65, z]} r={[0, rnd(i) * 0.4, 0]} c={i % 2 ? "#d6b06a" : "#dcb873"} />)}
      <Crowd list={cutters} t={t} c={COSTUMES.egypt} scale={1.1} vis={t < T.p1 + 1} />
      <Puffs t={t} p={[-36.2, 3.8, 5.0]} n={5} period={1.1} rise={1.2} size={0.22} c="#f3e2bb" drift={[0.4, 0, 0.4]} />
      <Puffs t={t} p={[-33.2, 2.2, 7.2]} n={5} period={1.3} rise={1.0} size={0.2} c="#f3e2bb" drift={[0.3, 0, 0.5]} o={0.3} />
    </G>
  );
};

/** x do trenó: carrega na pedreira, anda devagar, atola, volta (⏪), anda rápido na areia molhada, chega à obra */
export const sledX = (t: number) =>
  -29.2 + 3.7 * ease(t, T.equipo, T.p1 + 0.6) - 0.6 * ease(t, T.amontona, T.muro + 0.3) + 0.6 * ease(t, T.b2 - 0.05, T.b2 + 0.6)
  + 4.0 * ease(t, T.mojada, T.mitad + 0.4) + 8.4 * ease(t, T.mitad + 0.4, T.p2 + 0.8);
const sinkAt = (t: number) => 0.24 * ease(t, T.hunde, T.hunde + 0.5) * (1 - ease(t, T.b2 - 0.05, T.b2 + 0.6));
const pileAt = (t: number) => ease(t, T.hunde + 0.2, T.muro + 0.3) * (1 - ease(t, T.b2 - 0.05, T.b2 + 0.5));
const wetAt = (t: number) => ease(t, T.echando, T.mitad + 0.6);

const Sledge: React.FC<{ t: number }> = ({ t }) => {
  const x = sledX(t), y = -sinkAt(t), z = 7.0, load = ease(t, T.trineo1 - 0.1, T.trineo1 + 0.4);
  const moving = Math.abs(sledX(t + 0.05) - x) > 0.003;
  const haul = Array.from({ length: 8 }, (_, i) => ({ p: [x + 3.4 + Math.floor(i / 2) * 1.35, 0, z + (i % 2 ? 0.75 : -0.75)] as V3, yaw: PI / 2, pose: (moving ? "pull" : "idle") as PoseName, ph: i * 0.41 }));
  const pile = pileAt(t), wet = wetAt(t);
  return (
    <G>
      {/* estrada de areia batida */}
      <mesh position={[-20, 0.025, z]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#f2d79f")}><planeGeometry args={[26, 3.4]} /></mesh>
      {/* areia molhada: faixa escura à frente do trenó */}
      <mesh position={[lerp(-26.5, -18, 0.5), 0.04, z]} rotation={[-PI / 2, 0, 0]} scale={[Math.max(0.001, wet), 1, 1]} receiveShadow material={mat("#b98a4c", { rough: 0.35 })} visible={wet > 0.01}><planeGeometry args={[17, 2.2]} /></mesh>
      <G p={[x, y, z]}>
        <Box s={[3.2, 0.18, 0.22]} p={[0, 0.12, -0.55]} c="#8a5a2e" /><Box s={[3.2, 0.18, 0.22]} p={[0, 0.12, 0.55]} c="#8a5a2e" />
        <Box s={[0.5, 0.18, 0.22]} p={[1.75, 0.25, -0.55]} r={[0, 0, 0.5]} c="#8a5a2e" /><Box s={[0.5, 0.18, 0.22]} p={[1.75, 0.25, 0.55]} r={[0, 0, 0.5]} c="#8a5a2e" />
        {[-1.1, -0.35, 0.4, 1.15].map((bx, i) => <Box key={i} s={[0.22, 0.14, 1.5]} p={[bx, 0.28, 0]} c="#a06a36" />)}
        <G p={[0, 0.35 + 3 * (1 - load), 0]} vis={load > 0.01}><Box s={[2.2, 1.6, 1.6]} p={[0, 0.8, 0]} c="#d8b26c" /><Box s={[2.24, 0.08, 1.64]} p={[0, 0.82, 0]} c="#b8904e" cast={false} /></G>
        {/* cordas até a equipe */}
        {[-0.6, 0.6].map((dz, i) => { const L = 3.4 + 3 * 1.35; return <Cyl key={i} rt={0.04} h={L} p={[1.7 + L / 2, 0.9, dz]} r={[0, 0, PI / 2 + 0.02]} c="#c49a5a" seg={5} cast={false} />; })}
      </G>
      {/* areia que se amontoa à frente (o problema) */}
      <G p={[x + 1.9, 0, z]} sc={[Math.max(0.001, pile) * 1.3, Math.max(0.001, pile) * 1.5, 1.3]} vis={pile > 0.01}>
        <Sph rad={1.0} p={[0, -0.25, 0]} sc={[0.8, 1.0, 1.4]} c="#e9c886" ws={12} hs={8} /><Sph rad={0.6} p={[0.4, -0.1, 0.6]} c="#e2bd78" ws={10} hs={6} /><Sph rad={0.55} p={[0.3, -0.15, -0.7]} c="#e2bd78" ws={10} hs={6} />
      </G>
      <Crowd list={haul} t={t} c={COSTUMES.egypt} scale={1.0} vis={t > CUT0 && t < T.tura} />
    </G>
  );
};
const CUT0 = 9.0;

/** água do jarro: gotas em arco caindo na areia à frente do trenó */
const Pour: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.echando - 0.1, T.echando + 0.2) * (1 - ease(t, T.p2 - 0.4, T.p2)); if (on <= 0.01) return null;
  const x = sledX(t);
  return (
    <G p={[x + 1.25, 0, 7.0]}>
      {Array.from({ length: 10 }, (_, i) => { const u = fract(t * 2.2 + i / 10); return <Sph key={i} rad={0.08} p={[0.25 - u * 0.25, 1.35 - u * u * 1.3, (rnd(i) - 0.5) * 0.3]} c="#5ab8ff" o={{ emissive: "#2f8fd8", ei: 0.4 }} cast={false} ws={6} hs={4} sc={on} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- Nilo, cheia, canal, porto, barcos, Tura
const floodAt = (t: number) => ease(t, T.sube - 0.2, T.canales + 0.4);
const canalAt = (t: number) => ease(t, T.canales - 0.1, T.barcos + 0.3);
const Nile: React.FC<{ t: number }> = ({ t }) => {
  const f = floodAt(t), cf = canalAt(t), basin = ease(t, T.barcos - 0.3, T.barcos + 0.5);
  const z0 = lerp(32, 27, f), z1 = lerp(44, 49, f);
  const WATER = mat("#3a97d6", { rough: 0.25 });
  return (
    <G>
      {/* leito de lama e margens */}
      <mesh position={[20, 0.02, 38]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#9a7445")}><planeGeometry args={[320, 24]} /></mesh>
      <mesh position={[16, 0.03, 22.5]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#9a7445")}><planeGeometry args={[4.6, 15]} /></mesh>
      <mesh position={[16, 0.03, 12]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#9a7445")}><planeGeometry args={[17, 7]} /></mesh>
      {/* água: o rio alarga na cheia; o canal e a bacia enchem */}
      <mesh position={[20, 0.06 + 0.05 * f, (z0 + z1) / 2]} rotation={[-PI / 2, 0, 0]} receiveShadow material={WATER}><planeGeometry args={[320, z1 - z0]} /></mesh>
      <mesh position={[16, 0.07, 30 - 7.5 * cf]} rotation={[-PI / 2, 0, 0]} scale={[1, Math.max(0.001, cf), 1]} receiveShadow material={WATER} visible={cf > 0.01}><planeGeometry args={[4.2, 15]} /></mesh>
      <mesh position={[16, 0.075, 12]} rotation={[-PI / 2, 0, 0]} scale={[Math.max(0.001, basin), Math.max(0.001, basin), 1]} receiveShadow material={WATER} visible={basin > 0.01}><planeGeometry args={[16.4, 6.6]} /></mesh>
      {/* marolas de brinquedo: traços brancos que deslizam */}
      {Array.from({ length: 34 }, (_, i) => { const u = fract(t * 0.05 + rnd(i) ), x = lerp(-60, 100, u), z = lerp(z0 + 1, z1 - 1, rnd(i + 40)); return <Box key={i} s={[1.6, 0.03, 0.12]} p={[x, 0.13 + 0.05 * f, z]} c="#e8f6ff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.3 }} />; })}
      {/* cais de madeira na beira da bacia */}
      <Box s={[17, 0.3, 1.8]} p={[16, 0.2, 16.4]} c="#a87444" />
      {Array.from({ length: 9 }, (_, i) => <Cyl key={i} rt={0.12} h={1.0} p={[8 + i * 2, 0.2, 17.2]} c="#7a4e2a" seg={6} />)}
    </G>
  );
};

const Boat: React.FC<{ p: V3; yaw: number; t: number; cargo?: boolean }> = ({ p, yaw, t, cargo = true }) => (
  <G p={[p[0], p[1] + 0.06 * Math.sin(t * 2.4 + p[0]), p[2]]} r={[0.03 * Math.sin(t * 1.9 + p[2]), yaw, 0]}>
    <Sph rad={1} ps={PI / 2} pl={PI / 2} sc={[3.0, 0.75, 0.95]} c="#9c5a2c" ws={16} hs={6} o={{ side: "double" }} />
    <Box s={[5.2, 0.12, 1.5]} p={[0, -0.02, 0]} c="#c08a52" />
    <Cone rad={0.35} h={0.9} seg={4} p={[3.0, 0.25, 0]} r={[0, 0, -PI / 2 + 0.5]} c="#9c5a2c" /><Cone rad={0.35} h={0.9} seg={4} p={[-3.0, 0.25, 0]} r={[0, 0, PI / 2 - 0.5]} c="#9c5a2c" />
    {cargo ? <Box s={[1.8, 1.2, 1.2]} p={[0.4, 0.62, 0]} c="#f2ead6" /> : null}
    <Cyl rt={0.07} h={4.2} p={[-1.0, 2.1, 0]} c="#7a4e2a" seg={6} />
    <Box s={[0.06, 2.4, 1.9]} p={[-0.92, 2.6, 0]} r={[0, 0.25 * Math.sin(t * 0.7), 0]} c="#f1e6c6" />
    <Box s={[0.12, 0.12, 2.4]} p={[-0.95, 3.85, 0]} c="#7a4e2a" />
  </G>
);
const boatAt = (k: number, t: number): { p: V3; yaw: number } => {
  const a = T.barcos - 1.6 + 0.55 * k, u1 = ease(t, a, a + 1.6), u2 = ease(t, a + 1.6, a + 2.8), u3 = ease(t, a + 2.8, a + 3.6);
  const y = 0.12 + 0.05 * floodAt(t);
  const p0: V3 = [4 + 11 * k, y, 47.5], p1: V3 = [16, y, 31], p2: V3 = [16, y, 18.2], p3: V3 = [10.5 + 5.2 * k, y, 12];
  const yawOf = (a: V3, b: V3) => Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
  if (u2 <= 0) return { p: [lerp(p0[0], p1[0], u1), y, lerp(p0[2], p1[2], u1)], yaw: yawOf(p0, p1) };
  if (u3 <= 0) return { p: [16, y, lerp(p1[2], p2[2], u2)], yaw: yawOf(p1, p2) };
  return { p: [lerp(p2[0], p3[0], u3), y, lerp(p2[2], p3[2], u3)], yaw: lerp(yawOf(p1, p2), yawOf(p2, p3) * 0 + (k === 1 ? PI / 2 : k === 0 ? PI / 2 + 0.6 : PI / 2 - 0.6), u3) };
};

const Tura: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {[[-30, 6, 8], [-14, 7.5, 9], [2, 6.5, 8], [18, 8, 9], [34, 7, 8], [50, 6, 9]].map(([x, h, w], i) => (
      <G key={i}><Box s={[w + 8, h, 6]} p={[x, h / 2, 58]} c={i % 2 ? "#fbf8f0" : "#f4efe2"} /><Box s={[w + 2, h * 0.6, 3]} p={[x + 2, h * 0.3, 54]} c="#f6f0e2" /></G>
    ))}
    {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[1.6, 1.1, 1.2]} p={[-6 + (i % 5) * 2.2, 0.55 + Math.floor(i / 5) * 1.1, 50.6]} c="#f4eedd" />)}
    <Palms spots={[[-24, 0, 50], [-18, 0, 51], [28, 0, 50], [40, 0, 51.5], [-40, 0, 25], [-30, 0, 25.5], [32, 0, 24.5], [46, 0, 25], [56, 0, 24]]} t={t} />
  </G>
);

// ---------------------------------------------------------------- rampa
const RAMP_FOOT = 31;
const Ramp: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.rampas - 0.2, T.rampas + 1.6) * (1 - ease(t, T.terminada, T.terminada + 1.2)); if (k <= 0.01) return null;
  const h = Math.max(1, topAt(t) - 0.2) * k, xe = HB * (1 - h / PH) + 0.4, dx = RAMP_FOOT - xe, L = Math.hypot(dx, h), ang = Math.atan2(h, dx);
  const z = PC[2], W = 3.4;
  const shape = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(dx, 0); s.lineTo(0, h); s.closePath(); return s; })();
  const blocks = Array.from({ length: 4 }, (_, i) => fract(t * 0.12 + i / 4));
  const step = Math.max(2, Math.floor(L / 2.2));
  return (
    <G>
      {/* cunha de tijolo de barro: sobe do pé (x=31) até o topo atual da obra */}
      <mesh position={[xe, 0, z - W / 2]} castShadow receiveShadow material={mat("#a8653b")}><extrudeGeometry args={[shape, { depth: W, bevelEnabled: false }]} /></mesh>
      <G p={[(RAMP_FOOT + xe) / 2, h / 2 + 0.03, z]} r={[0, 0, -ang + PI]}><Box s={[L, 0.08, W * 0.8]} c="#c8945a" cast={false} /></G>
      {Array.from({ length: step }, (_, i) => { const u = (i + 0.5) / step; return <Cyl key={i} rt={0.09} h={1.2} p={[lerp(RAMP_FOOT, xe, u), lerp(0, h, u) + 0.6, z + W / 2 - 0.1]} c="#6e4524" seg={5} />; })}
      {blocks.map((u, i) => <G key={i} p={[lerp(RAMP_FOOT - 1, xe + 1.5, u), lerp(0, h, u) + 0.55, z - 0.5 + (i % 2) * 1.0]} r={[0, 0, -ang + PI]}><Box s={[1.3, 0.9, 1.1]} r={[0, 0, PI]} c="#d6b06a" /></G>)}
    </G>
  );
};

// ---------------------------------------------------------------- cidade dos obreiros, padaria, gado, mastabas
const HOUSES: [number, number, number][] = [[29, 4.5, 0], [33, 4, 1], [37, 4.6, 0], [41, 4.2, 1], [30, 9.5, 1], [41, 9.8, 0], [44, 13.5, 1], [29, 14.5, 0], [45, 4.5, 1]];
const Village: React.FC<{ t: number }> = ({ t }) => {
  const on = t > CUT_VILLAGE - 1;
  const walkers = Array.from({ length: 12 }, (_, i) => {
    const a = t * 0.25 + (i / 12) * PI * 2, r = 4.2 + (i % 3) * 1.1;
    return { p: [36 + Math.cos(a) * r, 0, 11 + Math.sin(a) * r * 0.7] as V3, yaw: -a, pose: "walk" as PoseName, ph: i * 0.3 };
  });
  return (
    <G vis={on}>
      {HOUSES.map(([x, z, v], i) => (
        <G key={i} p={[x, 0, z]}>
          <Box s={[3.0, 2.0, 2.6]} p={[0, 1.0, 0]} c={v ? "#c9935a" : "#d8a76a"} /><Box s={[3.2, 0.25, 2.8]} p={[0, 2.1, 0]} c="#a87444" />
          <Box s={[0.7, 1.2, 0.08]} p={[-0.6, 0.6, 1.32]} c="#4a2e1a" cast={false} /><Box s={[0.5, 0.4, 0.08]} p={[0.7, 1.3, 1.32]} c="#4a2e1a" cast={false} />
        </G>
      ))}
      {/* padaria: fornos em cúpula com fumaça e mesa de pães */}
      {[[31.5, 0, 11.5], [34, 0, 12.8], [36.5, 0, 11.5]].map((p, i) => (
        <G key={i} p={p as V3}><Sph rad={0.95} ps={0} pl={PI / 2} c="#a0603a" ws={14} hs={6} /><Box s={[0.5, 0.45, 0.1]} p={[0, 0.25, 0.9]} c="#ff9a2a" o={{ emissive: "#ff7a10", ei: 1.6 }} cast={false} />
          <Puffs t={t} p={[0, 0.9, 0]} n={6} period={2.4} rise={3.2} size={0.35} c="#ece6dc" drift={[0.6, 0, -0.3]} o={i * 0.3} /></G>
      ))}
      <Box s={[3.2, 0.12, 1.2]} p={[34, 0.9, 15.2]} c="#b07a48" />{[0, 1, 2, 3].map((k) => <Cyl key={k} rt={0.06} h={0.9} p={[32.6 + (k % 2) * 2.8, 0.45, 14.8 + Math.floor(k / 2) * 0.8]} c="#7a4e2a" seg={5} />)}
      {Array.from({ length: 7 }, (_, i) => <Cone key={i} rad={0.22} h={0.5} seg={7} p={[32.7 + i * 0.45, 1.2, 15.1 + (i % 2) * 0.3]} c="#d99a4a" />)}
      {Array.from({ length: 5 }, (_, i) => <Cyl key={i} rt={0.28} rb={0.18} h={0.9} p={[38.5 + i * 0.7, 0.45, 15.5]} c="#b06a3a" seg={8} />)}
      <Crowd list={walkers} t={t} c={COSTUMES.egypt} scale={1.0} vis={on && t < T.veinte + 1} />
    </G>
  );
};
export const CUT_VILLAGE = 61.0;

const Cow: React.FC<{ p: V3; yaw: number; t: number; i: number }> = ({ p, yaw, t, i }) => {
  const s = Math.sin(t * 7 + i);
  return (
    <G p={p} r={[0, yaw, 0]}>
      <Box s={[1.7, 0.9, 0.85]} p={[0, 1.05, 0]} c={i % 2 ? "#f4f0e6" : "#8a5a36"} />
      <Box s={[0.7, 0.5, 0.86]} p={[-0.3, 1.2, 0]} c={i % 2 ? "#3a2a20" : "#f4f0e6"} cast={false} />
      <Box s={[0.55, 0.5, 0.5]} p={[1.05, 1.35 + 0.05 * s, 0]} c={i % 2 ? "#f4f0e6" : "#8a5a36"} />
      <Cone rad={0.07} h={0.35} seg={5} p={[1.1, 1.72, 0.2]} c="#f6ecd0" /><Cone rad={0.07} h={0.35} seg={5} p={[1.1, 1.72, -0.2]} c="#f6ecd0" />
      {[[-0.6, -0.3], [-0.6, 0.3], [0.6, -0.3], [0.6, 0.3]].map(([x, z], k) => <Cyl key={k} rt={0.1} h={0.65} p={[x, 0.32, z]} r={[0, 0, 0.25 * s * (k % 2 ? 1 : -1)]} c="#5a3a24" seg={6} />)}
    </G>
  );
};
const Sheep: React.FC<{ p: V3; yaw: number; t: number; i: number }> = ({ p, yaw, t, i }) => (
  <G p={[p[0], p[1] + 0.06 * Math.abs(Math.sin(t * 9 + i)), p[2]]} r={[0, yaw, 0]}>
    <Sph rad={0.55} p={[0, 0.75, 0]} sc={[1.3, 1, 1]} c="#f6f3ea" ws={10} hs={8} /><Sph rad={0.3} p={[0.4, 0.85, 0.25]} c="#f6f3ea" ws={8} hs={6} /><Sph rad={0.3} p={[-0.4, 0.85, -0.2]} c="#f6f3ea" ws={8} hs={6} />
    <Box s={[0.36, 0.38, 0.32]} p={[0.75, 0.92, 0]} c="#2a2220" />
    {[[-0.3, -0.2], [-0.3, 0.2], [0.3, -0.2], [0.3, 0.2]].map(([x, z], k) => <Cyl key={k} rt={0.06} h={0.45} p={[x, 0.22, z]} c="#2a2220" seg={5} />)}
  </G>
);
const Herd: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.panaderias || t > T.veinte + 1) return null;
  const u = ease(t, T.vacas - 1.2, T.esclavos + 0.8), u2 = ease(t, T.ovejas - 1.4, T.esclavos + 1.2);
  return (
    <G>
      {Array.from({ length: 5 }, (_, i) => <Cow key={i} i={i} t={t} p={[lerp(62, 44, u) + i * 2.4, 0, 20.4 + (i % 2) * 1.3]} yaw={PI} />)}
      {Array.from({ length: 8 }, (_, i) => <Sheep key={i} i={i} t={t} p={[lerp(66, 48, u2) + (i % 4) * 1.2, 0, 23.0 + Math.floor(i / 4) * 1.1]} yaw={PI} />)}
    </G>
  );
};

const Mastabas: React.FC = () => (
  <G>
    {[[-15, 13], [-10.5, 13], [-6, 13], [-15, 17.5], [-10.5, 17.5], [-6, 17.5]].map(([x, z], i) => (
      <G key={i} p={[x, 0, z]}>
        <Cyl rt={1.45} rb={1.85} h={1.3} seg={4} p={[0, 0.65, 0]} r={[0, PI / 4, 0]} c={i % 2 ? "#e2cc98" : "#d8c08c"} />
        <Box s={[0.5, 0.75, 0.08]} p={[0, 0.38, 1.33]} c="#5a3e24" cast={false} />
      </G>
    ))}
  </G>
);

/** carregadores na obra: blocos soltos no topo e alguns obreiros parados na base */
const Site: React.FC<{ t: number }> = ({ t }) => {
  const top = topAt(t), half = HB * (1 - top / PH);
  const blocks = Array.from({ length: 5 }, (_, i) => ({ x: lerp(-half + 1, half - 1, i / 4), lift: ease(t, 1 + i * 0.6, 2 + i * 0.6) }));
  return (
    <G p={PC}>
      {blocks.map((b, i) => <Box key={i} s={[1.5, 1.0, 1.3]} p={[b.x, top + 0.5, half - 0.9]} c={i % 2 ? "#d6b06a" : "#dcb873"} vis={top < PH - 0.5} />)}
      {/* bloco que espera ao pé da obra: a câmera do gancho começa nele */}
      <Box s={[2.2, 1.6, 1.6]} p={[-5.5, 0.8, 17.0]} c="#d8b26c" />
    </G>
  );
};

const Palmline: React.FC<{ t: number }> = ({ t }) => <Palms spots={[[-22, 0, 21], [-17, 0, 22.5], [-26, 0, 19.5], [24, 0, 22], [8, 0, 23], [3, 0, 21.5], [56, 0, 6]]} t={t} />;

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a8ee8" mid="#86c4f5" low="#f6ecd8" />
    <Ground g={GROUND} />
    <Hills c={["#e0b46a", "#d6a85e"]} z={-85} flat={0.7} />
    <Clouds t={t} n={6} />
    <Pyramid t={t} /><Ghost t={t} /><Site t={t} />
    <Quarry t={t} /><Sledge t={t} /><Pour t={t} />
    <Nile t={t} />
    {[0, 1, 2].map((k) => { const b = boatAt(k, t); return <Boat key={k} p={b.p} yaw={b.yaw} t={t} />; })}
    {t > T.p2 - 1 && t < CUTS[5] || t > T.veinte - 1 ? <Tura t={t} /> : null}<Palmline t={t} />
    <Ramp t={t} />
    <Village t={t} /><Herd t={t} /><Mastabas />
  </>
);
export { sledX as sled };
