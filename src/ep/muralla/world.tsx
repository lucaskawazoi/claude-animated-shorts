// Mundo do E6: a Grande Muralha de brinquedo. Serra ao norte (crista z≈-9..-16, y 0..11) com a muralha Ming e torres
// sobre a crista; no leste ela desce à planície e entra no mar (passo de Shanhai, x 60..76). Planície de loess na frente
// (z 6..40): o muro de taipa (x -26..-8, z 16) com a fôrma de tábuas; fornos e pilhas de tijolo (x≈6); mesa do selo (x 11);
// caldeirão de arroz (x 17); painel de juntas (x 22).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { Horse } from "../../toy/horse";
import { T } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.china - 0.12;
const EARTH = "#c9a066", EARTH2 = "#b08650", BRICK = "#8d8f93", BRICK2 = "#7b7d82", MORT = "#e4e0d4", WOOD = "#8a5a32", KILN = "#a0573a";
const GROUND: GroundPal = { base: "#a9b95e", patch: ["#c2ad6c", "#9fb257", "#b8b46a"], blade: "#7f9a3e", x: [-90, 80], z: [0, 50], nBlades: 300 };

// ---------------------------------------------------------------- serra: polilinha da crista; a muralha anda nela
export const CREST: V3[] = [[-90, 2, -9], [-72, 7, -13], [-56, 4.5, -10], [-40, 9.5, -15], [-24, 6.5, -11], [-8, 11, -16], [8, 7.5, -12], [24, 10, -15], [40, 6, -11], [52, 2.5, -10], [60, 0, -10], [76, 0, -10]];
const crestAt = (x: number): [number, number] => {
  for (let i = 0; i < CREST.length - 1; i++) { const a = CREST[i], b = CREST[i + 1]; if (x <= b[0]) { const u = clamp((x - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; } }
  const l = CREST[CREST.length - 1]; return [l[1], l[2]];
};
export const reliefH = (x: number, z: number) => { const [y, zc] = crestAt(x), d = Math.abs(z - zc), W = z < zc ? 30 : 22; return y * Math.pow(Math.max(0, 1 - d / W), 1.4); };
const Relief: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 110, 160, 88), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, reliefH(pos.getX(i), -pos.getY(i) - 15) - 0.06);
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <G>
      <mesh geometry={geo} rotation={[-PI / 2, 0, 0]} position={[0, 0, -15]} receiveShadow castShadow material={mat("#6aa244", { flat: true })} />
      {[[-70, -62, 22, 26], [-30, -70, 26, 30], [10, -66, 24, 24], [46, -64, 22, 28], [-100, -40, 20, 22]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c={i % 2 ? "#7fae6a" : "#8bb87a"} o={{ flat: true }} cast={false} />)}
      <mesh position={[104, 0.05, -10]} rotation={[-PI / 2, 0, 0]} material={mat("#3f8fd0", { rough: 0.3 })}><planeGeometry args={[70, 160]} /></mesh>
      <mesh position={[69.5, 0.03, -10]} rotation={[-PI / 2, 0, 0]} material={mat("#e9d9a6")}><planeGeometry args={[3, 160]} /></mesh>
    </G>
  );
};
const Forest: React.FC = () => {
  const spots = useMemo(() => Array.from({ length: 46 }, (_, i) => { const x = lerp(-80, 54, rnd(i * 3 + 1)), [, zc] = crestAt(x), z = zc + 5 + rnd(i * 3 + 2) * 9; return [x, reliefH(x, z) - 0.1, z] as V3; }).filter((q) => Math.abs(q[0] + 17) > 11 || q[2] < 8), []);
  return <Trees spots={spots} c={["#2f7d3a", "#3f9446"]} />;
};

// ---------------------------------------------------------------- muralha Ming e torres na crista
const WH = 2.6, WW = 2.4;
const Seg: React.FC<{ a: V3; b: V3; c: string; k?: number }> = ({ a, b, c, k = 1 }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], hz = Math.hypot(dx, dz), L = Math.hypot(hz, dy) * k;
  if (L < 0.05) return null;
  const n = Math.floor(L / 1.3);
  return (
    <G p={a} r={[0, -Math.atan2(dz, dx), 0]}><G r={[0, 0, Math.atan2(dy, hz)]}>
      <Box s={[L + 0.3, WH, WW]} p={[L / 2, WH / 2 - 0.5, 0]} c={c} />
      {Array.from({ length: n }, (_, i) => <Box key={i} s={[0.7, 0.6, 0.35]} p={[0.65 + i * 1.3, WH - 0.2, -WW / 2 + 0.17]} c={c} />)}
      <Box s={[L + 0.3, 0.35, 0.3]} p={[L / 2, WH - 0.33, WW / 2 - 0.15]} c={c} />
    </G></G>
  );
};
const GATE_X = 64;
const SEGS: [V3, V3][] = (() => { const out: [V3, V3][] = []; for (let i = 0; i < CREST.length - 2; i++) out.push([CREST[i], CREST[i + 1]]); out.push([[60, 0, -10], [GATE_X - 3.2, 0, -10]], [[GATE_X + 3.2, 0, -10], [76, 0, -10]]); return out; })();
const ridgeK = (t: number) => (built(t) ? 1 : ease(t, T.ming - 0.2, T.p2 + 0.4));
const GreatWall: React.FC<{ t: number }> = ({ t }) => {
  const k = ridgeK(t); if (k <= 0.005) return null;
  const n = SEGS.length, f = k * n;
  return <G>{SEGS.map(([a, b], i) => <Seg key={i} a={a} b={b} c={i % 2 ? BRICK : BRICK2} k={clamp(f - i)} />)}</G>;
};
export const TOWERS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => CREST[i]);
const towerK = (t: number, i: number) => (built(t) ? 1 : ease(t, T.torres - 0.3 + i * 0.12, T.torres + 0.3 + i * 0.12));
const flash = (t: number, t0: number) => ease(t, t0, t0 + 0.25) * (1 - ease(t, t0 + 0.35, t0 + 1.4));
const Tower: React.FC<{ p: V3; k: number; i: number; t: number }> = ({ p, k, i, t }) => {
  if (k <= 0.01) return null;
  const smoke = t > T.humo - 0.8 && t < T.giro ? ease(t, T.humo - 0.7 + i * 0.25, T.humo - 0.3 + i * 0.25) : 0; // já subindo quando a voz diz «humo»
  const fire = t > T.fuego - 0.2 && t < T.giro ? ease(t, T.fuego + i * 0.2, T.fuego + i * 0.2 + 0.3) : 0;
  const M: V3[] = []; for (const s of [-1, 1]) for (const q of [-1.5, 0, 1.5]) M.push([q, 0, s * 2.0], [s * 2.0, 0, q]);
  return (
    <G p={[p[0], p[1] - 0.6, p[2]]} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[4.2, 5.2, 4.2]} p={[0, 2.6, 0]} c={BRICK2} />
      <Box s={[0.8, 1.3, 0.12]} p={[0, 3.6, 2.12]} c="#3a3532" cast={false} /><Box s={[0.12, 1.3, 0.8]} p={[2.12, 3.6, 0]} c="#3a3532" cast={false} />
      {M.map((m, j) => <Box key={j} s={[0.7, 0.6, 0.7]} p={[m[0], 5.5, m[2]]} c={BRICK2} />)}
      {i % 3 === 1 ? <G p={[0, 5.2, 0]}>{[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], j) => <Cyl key={j} rt={0.1} h={1.4} p={[a * 1.1, 0.7, b * 1.1]} c="#b23a2a" seg={6} />)}<Cone rad={2.3} h={1.1} seg={4} p={[0, 1.9, 0]} r={[0, PI / 4, 0]} c="#3f4a4a" /></G> : null}
      <G p={[0, 5.4, 0]} vis={fire > 0.01}>
        <Cone rad={1.1 * fire} h={2.8 * fire * (1 + 0.15 * Math.sin(t * 17 + i))} seg={6} p={[0, 1.4, 0]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 1.8 }} cast={false} />
        <Cone rad={0.6 * fire} h={1.7 * fire} seg={6} p={[0, 0.9, 0]} c="#ffe066" o={{ emissive: "#ffd000", ei: 1.8 }} cast={false} />
      </G>
      <Puffs t={t} p={[0, 5.8, 0]} n={12} period={2.0} rise={14} size={1.7} c="#6b6b6b" on={smoke} drift={[1.2, 0, -0.6]} o={i * 0.13} />
    </G>
  );
};
/** canhão na torre mais perto: um tiro por toque, com fumaça */
const CANNON_T = 6;
const Cannon: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p4 || t > T.giro) return null;
  const p = TOWERS[CANNON_T - 1], shots = [0, 1, 2].map((k) => T.canon + 0.25 + k * 0.5);
  const rec = shots.reduce((m, s) => Math.max(m, flash(t, s)), 0);
  return (
    <G p={[p[0] + 1.2, p[1] + 5.0, p[2] + 2.4]} r={[0, -0.4, 0]}>
      <Box s={[1.2, 0.4, 0.9]} p={[0, 0.2, 0]} c={WOOD} />
      <Cyl rt={0.22} rb={0.3} h={1.8} p={[0, 0.6, 0.3 - rec * 0.3]} r={[PI / 2 - 0.2, 0, 0]} c="#3a3a3a" o={{ metal: 0.4, rough: 0.5 }} />
      {shots.map((s, k) => { const u = flash(t, s); return u > 0.01 ? <Sph key={k} rad={0.9} p={[0, 0.9 + u * 0.6, 1.6 + u * 1.4]} sc={0.4 + u * 1.4} c={k === 0 ? "#f2f2f2" : "#e6e6e6"} cast={false} o={{ emissive: "#ffb060", ei: 0.4 * (1 - u) }} ws={8} hs={6} /> : null; })}
    </G>
  );
};

// ---------------------------------------------------------------- planície: taipa na fôrma, chuva que desmancha, revestimento de tijolo
export const EW = { x0: -26, x1: -8, z: 16 };
const NL = 6, LH = 0.42;
const layerK = (t: number, k: number) => (t >= T.b2 ? 1 : ease(t, T.tierra + k * 0.62, T.tierra + k * 0.62 + 0.45));
const erode = (t: number) => (t < T.p1 ? 0 : ease(t, T.p1 + 0.4, T.siglo + 1.2)) * (1 - ease(t, T.ming, T.hornos));
const cladK = (t: number) => (t < T.ming ? 0 : ease(t, T.ming + 0.2, T.hornos + 0.4));
const EarthWall: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b1) return null;
  const L = EW.x1 - EW.x0, cx = (EW.x0 + EW.x1) / 2, e = erode(t), cl = cladK(t);
  const nDone = Array.from({ length: NL }, (_, k) => layerK(t, k)).reduce((s, u) => s + u, 0);
  const top = nDone * LH, form = t > T.cajon - 0.2 && t < T.p1 + 0.3;
  const hit = Math.max(0, Math.sin(t * 9)), hole = t > T.cae - 0.3 && t < T.b3 + 0.6, fall = ease(t, T.cae - 0.4, T.cae + 0.6);
  return (
    <G>
      {Array.from({ length: NL }, (_, k) => { const u = layerK(t, k); if (u <= 0.01) return null; const h = LH * Math.max(0.01, u) * (1 - (k >= NL - 2 ? e * 0.35 : 0));
        return <Box key={k} s={[L, h, 2.2 - (k >= NL - 1 ? e * 0.5 : 0)]} p={[cx, k * LH + h / 2, EW.z]} c={k % 2 ? EARTH : EARTH2} />; })}
      {/* sulcos da chuva */}
      {e > 0.02 ? Array.from({ length: 9 }, (_, i) => <Box key={i} s={[0.18, top * 0.7 * e, 0.06]} p={[EW.x0 + 1 + i * 2, top - top * 0.35 * e, EW.z + 1.11]} c="#8a6236" cast={false} />) : null}
      {e > 0.02 ? Array.from({ length: 5 }, (_, i) => <Sph key={i} rad={1} p={[EW.x0 + 2 + i * 3.6, 0.05, EW.z + 1.6]} sc={[1.4 * e, 0.12, 0.7 * e]} c="#9c7444" cast={false} ws={10} hs={5} />) : null}
      {/* fôrma de tábuas no nível da camada atual + terra que afunda a cada golpe */}
      {form ? <G p={[EW.x1 - 3, Math.max(0, top - 0.1), EW.z]}>
        <Box s={[6.4, 0.9, 0.16]} p={[0, 0.45, 1.2]} c={WOOD} /><Box s={[6.4, 0.9, 0.16]} p={[0, 0.45, -1.2]} c={WOOD} />
        {[-3, -1, 1, 3].map((x) => <Box key={x} s={[0.12, 1.3, 2.8]} p={[x, 0.6, 0]} c="#6b4423" />)}
        <Box s={[6.1, 0.35 + 0.25 * (1 - hit), 2.2]} p={[0, 0.2, 0]} c="#a87e4c" />
        {[-1.8, 0.4].map((x, i) => <Worker key={i} p={[x, 0.5, -0.2]} yaw={0.5 - i} pose={poseOf("chisel", t + i * 0.37)} t={t} c={COSTUMES.ming} prop="hammer" scale={0.85} mustache={false} />)}
      </G> : null}
      {/* revestimento Ming: casca de tijolo cinza que sobe por cima da taipa */}
      {cl > 0.01 ? <G>
        <Box s={[L + 0.4, (NL * LH + 0.3) * cl, 2.7]} p={[cx, ((NL * LH + 0.3) * cl) / 2, EW.z]} c={BRICK} />
        {Array.from({ length: Math.floor(L / 1.3) }, (_, i) => <Box key={i} s={[0.7, 0.55, 0.35]} p={[EW.x0 + 0.7 + i * 1.3, NL * LH + 0.55, EW.z - 1.15]} c={BRICK} vis={cl > 0.95} />)}
        {Array.from({ length: 7 }, (_, r) => <Box key={r} s={[L + 0.42, 0.04, 2.72]} p={[cx, 0.35 + r * 0.38, EW.z]} c="#a5a6a8" cast={false} vis={(0.35 + r * 0.38) < (NL * LH + 0.3) * cl} />)}
      </G> : null}
      {/* tijolos ruins: o trecho cai */}
      {hole ? <Box s={[3.2, 1.6, 0.1]} p={[EW.x1 - 5, 1.5, EW.z + 1.37]} c="#4a3a2a" cast={false} /> : null}
      {hole ? Array.from({ length: 14 }, (_, i) => { const u = clamp(fall * 1.3 - rnd(i) * 0.3); return <Box key={i} s={[0.55, 0.25, 0.3]} p={[EW.x1 - 6.4 + (i % 5) * 0.65 + u * (rnd(i + 2) - 0.3) * 1.5, lerp(1.0 + Math.floor(i / 5) * 0.5, 0.13 + (i % 3) * 0.2, u), EW.z + 1.4 + u * (0.6 + rnd(i + 5) * 1.6)]} r={[u * rnd(i) * 2, u * rnd(i + 1), u * rnd(i + 3) * 2]} c={i % 2 ? "#9a8f86" : "#b0a69a"} />; }) : null}
    </G>
  );
};
const Rain: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p1 - 0.2 && t < T.ming)) return null;
  return <G>{Array.from({ length: 80 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.04, 0.9, 0.04]} p={[lerp(EW.x0 - 6, EW.x1 + 6, rnd(i + 1)), 12 - u * 12, lerp(EW.z - 6, EW.z + 10, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
/** os fornos ao pé da serra, pilhas de tijolo */
const Kilns: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 0 : ease(t, T.ming - 0.4, T.hornos + 0.2); if (k <= 0.01) return null;
  const bad = t > T.p2 - 0.1 && t < T.b3;
  return (
    <G sc={[1, Math.max(0.01, k), 1]}>
      {[[-1, 10.5], [4, 10.0]].map(([x, z], i) => (
        <G key={i} p={[x, 0, z]}>
          <Sph rad={1.9} ps={0} pl={PI / 2} c={KILN} ws={14} hs={8} />
          <Box s={[0.9, 1.1, 0.4]} p={[0, 0.55, 1.75]} c="#2a1a12" cast={false} />
          <Box s={[0.6, 0.5, 0.1]} p={[0, 0.35, 1.96]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.4 }} cast={false} />
          <Cyl rt={0.35} h={1.4} p={[0.6, 2.2, -0.4]} c={KILN} seg={8} />
          <Puffs t={t} p={[0.6, 2.9, -0.4]} n={7} period={3} rise={7} size={0.9} c="#d8d8d8" o={i * 0.3} />
        </G>))}
      {Array.from({ length: 6 }, (_, i) => <G key={i} p={[-2.5 + (i % 3) * 1.6, 0, 14.2 + Math.floor(i / 3) * 1.4]}>{[0, 1, 2].map((r) => <Box key={r} s={[1.2, 0.3, 0.6]} p={[0, 0.16 + r * 0.31, 0]} r={[0, r % 2 ? 0.08 : 0, 0]} c={i === 4 && bad ? "#c26a4a" : BRICK} />)}</G>)}
      {bad ? <G p={[-0.9, 1.25, 15.6]}>{[0, 1].map((j) => <Box key={j} s={[0.06, 0.06, 0.9]} p={[0, 0.02, 0]} r={[0, j ? 0.8 : -0.8, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.2 }} cast={false} />)}</G> : null}
    </G>
  );
};
/** o selo: um tijolo grande na mesa, com o nome do forno e o ano gravados */
export const STAMP = { x: 11.5, z: 18.5, y: 1.25 };
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.ming || t > T.p4) return null;
  const press = ease(t, T.grabado - 0.5, T.grabado - 0.1) * (1 - ease(t, T.grabado, T.grabado + 0.4)), mark = ease(t, T.grabado - 0.05, T.grabado + 0.3);
  return (
    <G p={[STAMP.x, 0, STAMP.z]}>
      <Box s={[3.6, 0.15, 2.2]} p={[0, 1.0, 0]} c={WOOD} />{[[-1.6, -0.9], [-1.6, 0.9], [1.6, -0.9], [1.6, 0.9]].map(([a, b], i) => <Box key={i} s={[0.15, 1.0, 0.15]} p={[a, 0.5, b]} c="#6b4423" />)}
      <Box s={[2.4, 0.7, 1.2]} p={[0, 1.43, 0]} c={BRICK} />
      <G p={[0, 1.43, 0.61]} sc={[1, 1, 1]} vis={mark > 0.01}>
        <Box s={[1.3 * mark, 0.46 * mark, 0.03]} c="#5a5c60" cast={false} /><Box s={[1.18 * mark, 0.36 * mark, 0.035]} c="#b4b6ba" cast={false} />
        {Array.from({ length: 4 }, (_, i) => <G key={i} p={[-0.42 + i * 0.28, 0, 0.02]} vis={mark > 0.6}><Box s={[0.16, 0.04, 0.03]} p={[0, 0.08, 0]} c="#3a3c40" cast={false} /><Box s={[0.04, 0.2, 0.03]} p={[(rnd(i) - 0.5) * 0.08, 0, 0]} c="#3a3c40" cast={false} /><Box s={[0.12, 0.04, 0.03]} p={[0.02, -0.07, 0]} r={[0, 0, (rnd(i + 3) - 0.5) * 0.6]} c="#3a3c40" cast={false} /></G>)}
      </G>
      <G p={[0, 2.6 - press * 0.9, 0.62]}><Box s={[1.6, 0.4, 0.5]} c="#9a6a3a" /><Cyl rt={0.12} h={0.9} p={[0, 0.65, 0]} c={WOOD} seg={8} /></G>
    </G>
  );
};
/** painel de juntas: tijolos com argamassa; o gelo racha a cal; com arroz, as juntas fecham */
export const JOINT = { x: 22, z: 15 };
const Joints: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.ming || t > T.p4 + 0.3) return null;
  const crack = ease(t, T.p3 + 0.2, T.hielo + 0.3) * (1 - ease(t, T.cal, T.argamasa)), fixed = ease(t, T.cal, T.argamasa);
  const rows = 6, cols = 4;
  return (
    <G p={[JOINT.x, 0, JOINT.z]}>
      <Box s={[5.2, 3.6, 0.9]} p={[0, 1.8, 0]} c={fixed > 0.5 ? "#f5f2e6" : MORT} />
      {Array.from({ length: rows * cols }, (_, i) => { const r = Math.floor(i / cols), c = i % cols, off = r % 2 ? 0.6 : 0;
        return <Box key={i} s={[1.12, 0.5, 0.3]} p={[-1.8 + c * 1.22 + off - (r % 2 && c === cols - 1 ? 4.88 : 0), 0.35 + r * 0.58, 0.42]} c={(i * 7) % 5 ? BRICK : BRICK2} />; })}
      {crack > 0.02 ? [[-1.2, 1.2, 0.5], [0.4, 2.3, -0.6], [1.4, 0.9, 0.9], [-0.3, 3.0, 0.3]].map(([x, y, r], i) => <Box key={i} s={[1.3 * crack, 0.07, 0.05]} p={[x, y, 0.62]} r={[0, 0, r]} c="#1c1410" cast={false} />) : null}
      {crack > 0.02 ? Array.from({ length: 9 }, (_, i) => <Cone key={i} rad={0.12} h={0.35 * crack} seg={4} p={[-2.2 + i * 0.55, 3.75, 0.2 + (i % 2) * 0.3]} c="#d8f0ff" o={{ emissive: "#bfe6ff", ei: 0.6 }} cast={false} />) : null}
    </G>
  );
};
/** caldeirão de arroz glutinoso + monte de cal; o obreiro mexe */
export const POT = { x: 17, z: 18.5 };
const RicePot: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p3 || t > T.p4 + 0.3) return null;
  const k = ease(t, T.b4, T.arroz + 0.3), mix = ease(t, T.cal - 0.1, T.dura);
  return (
    <G p={[POT.x, 0, POT.z]} sc={[1, Math.max(0.01, k), 1]}>
      <Cyl rt={0.9} rb={0.7} h={1.1} p={[0, 0.85, 0]} c="#3a3a3a" seg={14} o={{ metal: 0.3 }} />
      <Box s={[1.4, 0.3, 1.4]} p={[0, 0.15, 0]} c="#5a4a3a" />
      <Box s={[0.5, 0.25, 0.1]} p={[0, 0.15, 0.72]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.4 }} cast={false} />
      {Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.13} p={[(rnd(i) - 0.5) * 1.2, 1.38 + 0.06 * Math.sin(t * 6 + i), (rnd(i + 4) - 0.5) * 1.2]} c={mix > 0.5 ? "#eae6da" : "#fbfaf4"} ws={6} hs={4} cast={false} />)}
      <Puffs t={t} p={[0, 1.5, 0]} n={7} period={2} rise={3} size={0.5} c="#ffffff" />
      <Cone rad={0.8} h={0.9} seg={8} p={[-1.8, 0.45, 0.4]} c="#f4f4f0" />
      <Box s={[1.8, 0.4, 0.9]} p={[1.8, 0.2, 0.6]} c={WOOD} /><Box s={[1.6, 0.1, 0.75]} p={[1.8, 0.42, 0.6]} c={lerpC("#f4f4f0", "#e8e2cc", mix)} cast={false} />
    </G>
  );
};
const lerpC = (a: string, b: string, u: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(u)).getHexString();

// ---------------------------------------------------------------- cavaleiros: os do norte no gancho, o mensageiro, os manchus no portão
const Riders: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  if (t > T.china && t < T.b1 + 0.6) { const u = ease(t, T.china, T.b1 + 0.6); for (let i = 0; i < 5; i++) out.push(<Horse key={"n" + i} p={[lerp(-40, 0, u) - (i % 3) * 3.2, 0, 28 + (i - 2) * 2.2 + rnd(i) * 1.2]} yaw={0} t={t + i * 0.3} c={i % 2 ? "#6b3e22" : "#8a5a32"} />); }
  if (t > T.p4 && t < T.b5 + 0.3) { const u = prog2(t, T.p4, T.b5 + 0.3); out.push(<Horse key="m" p={[lerp(-6, 6, u), 0, 26]} yaw={0} t={t} c="#a87a4a" rider="#2f5d8a" speed={7} />); }
  if (t > T.manchues) { for (let i = 0; i < 6; i++) { const u = clamp((t - T.abrio - 0.2 - i * 0.45) / 4.0); out.push(<Horse key={"m" + i} p={[GATE_X + (u > 0.05 ? 0 : ((i % 3) - 1) * 2.2), 0, lerp(-24 - Math.floor(i / 3) * 3, 14, u)]} yaw={-PI / 2} t={t + i * 0.2} c={i % 2 ? "#3a2a20" : "#6b4a2a"} rider="#2a3a5a" />); } }
  return <G>{out}</G>;
};
const prog2 = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

// ---------------------------------------------------------------- o passo de Shanhai: portão com pavilhão, portas que abrem
const Gate: React.FC<{ t: number }> = ({ t }) => {
  if (!built(t) && t < T.p4) return null;
  const open = ease(t, T.abrio - 0.2, T.abrio + 0.8);
  return (
    <G p={[GATE_X, 0, -10]}>
      <Box s={[2.4, 4.2, 4.0]} p={[-2.0, 2.1, 0]} c={BRICK2} /><Box s={[2.4, 4.2, 4.0]} p={[2.0, 2.1, 0]} c={BRICK2} />
      <Box s={[6.4, 1.3, 4.0]} p={[0, 4.85, 0]} c={BRICK2} />
      <Box s={[5.6, 2.0, 3.2]} p={[0, 6.5, 0]} c="#b23a2a" />
      <Cone rad={4.6} h={1.6} seg={4} p={[0, 8.3, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#3f4a4a" />
      <Box s={[3.6, 1.2, 2.2]} p={[0, 9.4, 0]} c="#b23a2a" /><Cone rad={3.0} h={1.2} seg={4} p={[0, 10.5, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#3f4a4a" />
      <Box s={[2.2, 0.9, 0.12]} p={[0, 6.6, 1.62]} c="#1c2a4a" cast={false} />
      {[-1, 1].map((s) => <G key={s} p={[s * 0.8, 0, 1.6]} r={[0, s * open * 1.45, 0]}><Box s={[0.8, 3.4, 0.2]} p={[-s * 0.4, 1.7, 0]} c="#9a2a1e" />{[0.9, 1.7, 2.5].map((y) => <Sph key={y} rad={0.07} p={[-s * 0.4, y, 0.12]} c="#d4a64a" ws={6} hs={4} cast={false} />)}</G>)}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a86d8" mid="#8cc3ee" low="#f2f4ee" />
    <Ground g={GROUND} />
    <Clouds t={t} n={8} y={30} />
    <Relief /><Forest />
    <GreatWall t={t} />
    {TOWERS.map((p, i) => <Tower key={i} p={p} k={towerK(t, i)} i={i} t={t} />)}
    <Cannon t={t} /><Gate t={t} />
    <EarthWall t={t} /><Rain t={t} /><Kilns t={t} /><Stamp t={t} /><Joints t={t} /><RicePot t={t} />
    <Riders t={t} />
    {t > T.giro ? <Worker p={[GATE_X - 1.3, 0, -7.4]} yaw={0.3} pose={poseOf(t > T.abrio - 0.3 ? "pull" : "present", t)} t={t} c={COSTUMES.general} /> : null}
  </>
);
