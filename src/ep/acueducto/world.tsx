// Mundo do E2: o aqueduto de Segóvia de brinquedo. Tudo é função do tempo t (sem estado).
// Eixo x = caminho da água: serra (x<-45) → canal no alto da loma (y=9) → desarenador → vale (x -8..24, chão y=0)
// atravessado pelas arcadas → rocha da cidade (x>24, y=9). Canteiro do arco-herói (cimbra/clave/grua) no vale, à frente (z≈8).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const H = 9;                 // altura da loma e da rocha da cidade (o canal corre a esta altura)
export const X0 = -8, X1 = 24;      // começo e fim do vale (vão das arcadas)
export const ZC = -6;               // eixo do canal/aqueduto
const GRANITE = "#bfb6a6", GRANITE2 = "#a99f8e";
const GROUND: GroundPal = { base: "#7cc94a", patch: ["#6fbe40", "#8ad457", "#74c246"], blade: "#4fa82e", flowers: ["#ffe14a", "#ffffff", "#c78bff"], x: [-90, 100], z: [-40, 50], nBlades: 420 };

// ---------------------------------------------------------------- relevo: loma (esquerda) e rocha da cidade (direita)
const Plateau: React.FC<{ x0: number; x1: number; slope: number; side: 1 | -1; c: string; c2: string }> = ({ x0, x1, slope, side, c, c2 }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (side === 1) { s.moveTo(x0, 0); s.lineTo(x1 + slope, 0); s.lineTo(x1, H); s.lineTo(x0, H); }
    else { s.moveTo(x0 - slope, 0); s.lineTo(x1, 0); s.lineTo(x1, H); s.lineTo(x0, H); }
    s.closePath(); return s;
  }, [x0, x1, slope, side]);
  return (
    <G>
      <mesh position={[0, 0, -40]} castShadow receiveShadow material={mat(c2)}><extrudeGeometry args={[shape, { depth: 62, bevelEnabled: false }]} /></mesh>
      <mesh position={[(x0 + x1) / 2, H + 0.02, -9]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(c)}><planeGeometry args={[x1 - x0, 62]} /></mesh>
    </G>
  );
};

const Sierra: React.FC = () => (
  <G>
    {[[-95, -55, 30, 34], [-70, -62, 26, 28], [-48, -70, 22, 24], [-115, -40, 22, 26], [-30, -85, 20, 22]].map(([x, z, r, h], i) => (
      <G key={i} p={[x, H - 1, z]}>
        <Cone rad={r} h={h} seg={7} p={[0, h / 2, 0]} c={i % 2 ? "#8a9a7a" : "#7c8e6c"} o={{ flat: true }} cast={false} />
        <Cone rad={r * 0.32} h={h * 0.32} seg={7} p={[0, h * 0.84, 0]} c="#f4f7fa" o={{ flat: true }} cast={false} />
      </G>
    ))}
  </G>
);

// ---------------------------------------------------------------- água que corre: faixa azul com traços que andam
const Flow: React.FC<{ a: V3; b: V3; t: number; w?: number; on?: number; speed?: number }> = ({ a, b, t, w = 0.8, on = 1, speed = 2.2 }) => {
  if (on <= 0.01) return null;
  const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) * on, yaw = Math.atan2(-dz, dx);
  const n = Math.max(2, Math.floor(L / 1.6));
  return (
    <G p={a} r={[0, yaw, 0]}>
      <Box s={[L, 0.08, w]} p={[L / 2, 0, 0]} c="#3a97d6" cast={false} o={{ rough: 0.25 }} />
      {Array.from({ length: n }, (_, i) => { const u = fract(i / n + (t * speed) / Math.max(L, 1)); return <Box key={i} s={[0.7, 0.03, 0.08]} p={[u * L, 0.06, (rnd(i) - 0.5) * w * 0.6]} c="#eaf7ff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.3 }} />; })}
    </G>
  );
};

/** canal (specus): leito + duas paredes de granito, na altura H, de xa a xb */
const Specus: React.FC<{ xa: number; xb: number; y: number }> = ({ xa, xb, y }) => (
  <G>
    <Box s={[xb - xa, 0.4, 1.6]} p={[(xa + xb) / 2, y - 0.2, ZC]} c={GRANITE2} />
    <Box s={[xb - xa, 0.55, 0.3]} p={[(xa + xb) / 2, y + 0.27, ZC - 0.65]} c={GRANITE} /><Box s={[xb - xa, 0.55, 0.3]} p={[(xa + xb) / 2, y + 0.27, ZC + 0.65]} c={GRANITE} />
  </G>
);

// ---------------------------------------------------------------- arcadas (instanciadas): peças ordenadas por vão, da esquerda para a direita
export const NSPAN = 11;
const S = (X1 - X0 - 2) / NSPAN;
type Piece = { p: V3; s: V3; rz: number };
const span = (i: number): { stones: Piece[]; vous: Piece[] } => {
  const xp = X0 + 1 + i * S, xc = xp + S / 2, stones: Piece[] = [], vous: Piece[] = [];
  stones.push({ p: [xp, 2.25, ZC], s: [0.95, 4.5, 1.7], rz: 0 }, { p: [xp, 6.75, ZC], s: [0.8, 1.8, 1.4], rz: 0 });
  stones.push({ p: [xc, 5.65, ZC], s: [S, 0.5, 1.8], rz: 0 }, { p: [xc, 8.8, ZC], s: [S, 0.45, 1.6], rz: 0 });
  const arc = (ys: number, r: number, d: number) => {
    for (let k = 0; k < 7; k++) { const th = (PI * (k + 0.5)) / 7; vous.push({ p: [xc + r * Math.cos(th), ys + r * Math.sin(th), ZC], s: [(r * PI) / 7 + 0.04, 0.36, d], rz: th + PI / 2 }); }
  };
  arc(4.5, (S - 0.95) / 2, 1.7); arc(7.65, (S - 0.8) / 2, 1.4);
  if (i === NSPAN - 1) stones.push({ p: [X1 - 1, 2.25, ZC], s: [0.95, 4.5, 1.7], rz: 0 }, { p: [X1 - 1, 6.75, ZC], s: [0.8, 1.8, 1.4], rz: 0 });
  return { stones, vous };
};
const Arcade: React.FC<{ n: number }> = ({ n }) => {
  const { st, vo } = useMemo(() => {
    const all = Array.from({ length: NSPAN }, (_, i) => span(i));
    const mk = (list: Piece[], c: string) => {
      const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(c), list.length), o = new THREE.Object3D();
      list.forEach((q, k) => { o.position.set(...q.p); o.rotation.set(0, 0, q.rz); o.scale.set(...q.s); o.updateMatrix(); m.setMatrixAt(k, o.matrix); });
      m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; return m;
    };
    return { st: mk(all.flatMap((a) => a.stones), GRANITE), vo: mk(all.flatMap((a) => a.vous), GRANITE2) };
  }, []);
  const k = clamp(n, 0, NSPAN);
  st.count = Math.floor(k) * 4 + (k >= NSPAN ? 2 : 0); vo.count = Math.floor(k) * 14;
  return <G><primitive object={st} /><primitive object={vo} /></G>;
};
export const spansAt = (t: number) => NSPAN * ease(t, T.arcos, T.estosArcos);

// ---------------------------------------------------------------- serra, nascente, canal, desarenador, cascata do problema
const Source: React.FC<{ t: number }> = ({ t }) => (
  <G>
    <Flow a={[-78, H + 0.05, 8]} b={[-60, H + 0.05, ZC]} t={t} w={1.6} speed={3} />
    <Box s={[1.2, 1.4, 4.4]} p={[-59.4, H + 0.5, ZC]} c={GRANITE2} />
    <Trees spots={[[-70, H, -14], [-66, H, -10], [-74, H, 2], [-63, H, 6], [-56, H, -16], [-80, H, -6], [-52, H, 10], [-47, H, -15]]} c={["#2f7a3a", "#3f9248"]} />
  </G>
);
const sandAt = (t: number) => ease(t, T.p1, T.tapa + 0.5) * (1 - ease(t, T.pileta, T.fondo + 0.6));
const Desarenador: React.FC<{ t: number }> = ({ t }) => {
  const x = -30, sink = ease(t, T.quieta, T.desarenador + 0.4);
  return (
    <G>
      <Box s={[4.2, 2.6, 3.6]} p={[x - 3.2, H + 1.3, ZC - 3.4]} c="#d9cdb6" />
      <Cone rad={3.3} h={1.4} seg={4} p={[x - 3.2, H + 3.3, ZC - 3.4]} r={[0, PI / 4, 0]} sc={[1, 1, 0.86]} c="#b8553a" />
      {/* a pileta em corte: água parada, a arena desce ao fundo */}
      <Box s={[4.4, 1.5, 3.0]} p={[x, H - 0.55, ZC]} c={GRANITE2} vis={false} />
      <Box s={[4.6, 0.3, 3.2]} p={[x, H - 1.3, ZC]} c={GRANITE2} /><Box s={[4.6, 1.6, 0.3]} p={[x, H - 0.5, ZC - 1.45]} c={GRANITE} />
      <Box s={[0.3, 1.6, 3.2]} p={[x - 2.15, H - 0.5, ZC]} c={GRANITE} /><Box s={[0.3, 1.6, 3.2]} p={[x + 2.15, H - 0.5, ZC]} c={GRANITE} />
      <Box s={[4.0, 1.2, 2.6]} p={[x, H - 0.55, ZC]} c="#4aa3e0" o={{ opacity: 0.8, rough: 0.2 }} cast={false} />
      {Array.from({ length: 14 }, (_, i) => { const u = clamp(sink * 1.3 - rnd(i) * 0.3); return <Sph key={i} rad={0.12} p={[x - 1.6 + rnd(i + 3) * 3.2, H - 0.05 - u * 1.0, ZC - 1 + rnd(i + 7) * 2]} c="#8a6a3e" cast={false} ws={6} hs={4} vis={t > T.pileta - 0.2} />; })}
      <Box s={[4.0, 0.2 + 0.25 * sink, 2.6]} p={[x, H - 1.1 + 0.12 * sink, ZC]} c="#a07a48" cast={false} />
    </G>
  );
};
/** arena e pedrinhas entupindo o canal antes do desarenador */
const Clog: React.FC<{ t: number }> = ({ t }) => {
  const k = sandAt(t); if (k <= 0.01) return null;
  return <G>{Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.32} p={[-26 + i * 0.9 + rnd(i) * 0.4, H + 0.1, ZC + (rnd(i + 2) - 0.5) * 0.8]} sc={[k, k * 0.8, k]} c={i % 3 ? "#9a7446" : "#7d7466"} ws={7} hs={5} />)}</G>;
};
const Waterfall: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.valle - 0.2, T.valle + 0.4) * (1 - ease(t, T.arcos + 0.5, T.estosArcos)); if (on <= 0.01) return null;
  const pool = ease(t, T.valle, T.baja + 1.0);
  return (
    <G>
      {Array.from({ length: 12 }, (_, i) => { const u = fract(t * 1.4 + i / 12); return <Sph key={i} rad={0.3} p={[X0 + 0.3 + u * 1.6, H - u * u * H, ZC + (rnd(i) - 0.5) * 0.8]} c="#5ab8ff" o={{ emissive: "#2f8fd8", ei: 0.3 }} cast={false} ws={8} hs={6} sc={on} />; })}
      <mesh position={[X0 + 3.5, 0.04, ZC]} rotation={[-PI / 2, 0, 0]} scale={[Math.max(0.01, pool * on), Math.max(0.01, pool * on), 1]} material={mat("#3a97d6", { rough: 0.2 })}><circleGeometry args={[3.2, 20]} /></mesh>
    </G>
  );
};

// ---------------------------------------------------------------- canteiro do arco-herói: cimbra, dovelas, clave, setas de empuxo
export const HERO = { x: 6, z: 8, r: 1.75, ys: 3.4 };
const NV = 9;
const Hero: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p3 - 1 || t > T.llego + 1) return null;
  const { x, z, r, ys } = HERO;
  const gap = (k: number) => Math.min(k, NV - 1 - k); // 0 = junto ao pilar, 4 = clave
  const appear = (k: number) => (k === 4 ? ease(t, T.clave - 0.05, T.clave + 0.45) : ease(t, T.dovelas + gap(k) * 0.28, T.dovelas + gap(k) * 0.28 + 0.3));
  const cim = ease(t, T.cimbra - 0.3, T.cimbra + 0.4), drop = ease(t, T.empuja + 0.9, T.estaClave);
  const arrows = ease(t, T.empuja - 0.05, T.empuja + 0.3) * (1 - ease(t, T.estaClave + 0.4, T.estaClave + 0.8));
  const glow = ease(t, T.clave + 0.3, T.clave + 0.5) * (1 - ease(t, T.estaClave + 0.6, T.estaClave + 1.4));
  return (
    <G>
      <Box s={[1.3, ys, 1.8]} p={[x - r - 0.65, ys / 2, z]} c={GRANITE} /><Box s={[1.3, ys, 1.8]} p={[x + r + 0.65, ys / 2, z]} c={GRANITE} />
      {Array.from({ length: NV }, (_, k) => {
        const th = (PI * (k + 0.5)) / NV, u = appear(k); if (u <= 0.01) return null;
        const lift = (1 - u) * 3.5;
        return <Box key={k} s={[(r * PI) / NV + 0.05, 0.62, 1.8]} p={[x + (r + 0.31) * Math.cos(th), ys + (r + 0.31) * Math.sin(th) + lift, z]} r={[0, 0, th + PI / 2]} c={k === 4 ? (glow > 0.5 ? "#ffd84a" : GRANITE2) : GRANITE2} o={k === 4 && glow > 0.01 ? { emissive: "#ffb800", ei: 0.9 * glow } : {}} />;
      })}
      {/* cimbra de madeira: aparece, segura as dovelas e depois desce */}
      <G p={[x, ys - 2.2 * drop, z]} vis={cim > 0.01 && drop < 0.98} sc={[1, Math.max(0.01, cim), 1]}>
        {Array.from({ length: NV }, (_, k) => { const th = (PI * (k + 0.5)) / NV; return <Box key={k} s={[(r * PI) / NV, 0.16, 1.5]} p={[(r - 0.1) * Math.cos(th), (r - 0.1) * Math.sin(th), 0]} r={[0, 0, th + PI / 2]} c="#b57a3e" />; })}
        <Box s={[2 * r, 0.22, 0.3]} p={[0, 0.1, 0.55]} c="#8a5a2e" /><Box s={[2 * r, 0.22, 0.3]} p={[0, 0.1, -0.55]} c="#8a5a2e" />
        {[-0.9, 0, 0.9].map((dx, i) => <Box key={i} s={[0.16, r - 0.2, 0.16]} p={[dx * r * 0.8, (r - 0.2) / 2, 0]} r={[0, 0, -dx * 0.5]} c="#8a5a2e" />)}
        <Box s={[0.25, ys, 0.25]} p={[-r * 0.7, -ys / 2, 0.5]} c="#7a4a26" /><Box s={[0.25, ys, 0.25]} p={[r * 0.7, -ys / 2, 0.5]} c="#7a4a26" />
      </G>
      {/* setas: cada pedra empurra a vizinha, até os pilares */}
      <G vis={arrows > 0.01}>
        {Array.from({ length: NV - 1 }, (_, k) => {
          const th = (PI * (k + 1)) / NV, down = k < 4 ? -1 : 1; // tangente apontando para baixo (para o pilar daquele lado)
          return <Cone key={k} rad={0.18} h={0.5} seg={6} p={[x + (r + 0.31) * Math.cos(th), ys + (r + 0.31) * Math.sin(th), z + 1.05]} r={[0, 0, th + (down > 0 ? 0 : PI)]} sc={arrows} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.6 }} cast={false} />;
        })}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- grua de madeira com polia, tenaz e bloco; blocos no chão com os furos
export const CRANE = { x: 16.5, z: -2.6 };
const holeBlock = (p: V3, k: number, c = GRANITE2) => (
  <G key={k} p={p}>
    <Box s={[1.5, 0.9, 1.0]} c={c} />
    <Box s={[0.16, 0.16, 0.06]} p={[-0.3, 0.12, 0.51]} c="#2a2622" cast={false} /><Box s={[0.16, 0.16, 0.06]} p={[0.3, 0.12, 0.51]} c="#2a2622" cast={false} />
  </G>
);
const Crane: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p4 - 1 || t > T.llego + 2) return null;
  const { x, z } = CRANE, up = ease(t, T.gruas + 0.2, T.mira + 0.4), y = lerp(0.5, H + 0.6, up), sw = 0.05 * Math.sin(t * 2.2);
  const turn = (t - T.gruas) * 1.6 * (up < 1 && t > T.gruas ? 1 : 0);
  const pull = Array.from({ length: 3 }, (_, i) => { const a = turn + (i / 3) * PI * 2; return { p: [x + 3.5 + Math.cos(a) * 1.6, 0, z + 3.4 + Math.sin(a) * 1.6] as V3, yaw: -a, pose: "pull" as PoseName, ph: i * 0.3 }; });
  return (
    <G>
      {/* cábrea: dois mastros inclinados + travessa no alto + polia */}
      <G p={[x, 0, z]} r={[0, 0, -0.12]}>
        <Cyl rt={0.14} h={12.4} p={[-0.6, 6.2, -1.0]} r={[0.08, 0, 0]} c="#9a6a3a" seg={6} /><Cyl rt={0.14} h={12.4} p={[-0.6, 6.2, 1.0]} r={[-0.08, 0, 0]} c="#9a6a3a" seg={6} />
        <Box s={[0.3, 0.3, 2.2]} p={[-0.6, 12.2, 0]} c="#7a4a26" /><Cyl rt={0.35} h={0.3} p={[-0.6, 11.9, 0]} r={[PI / 2, 0, 0]} c="#5a3a20" seg={10} />
      </G>
      <Cyl rt={0.04} h={Math.max(0.1, 11.9 - y - 0.6)} p={[x + 0.85, (11.9 + y + 0.6) / 2, z]} c="#c49a5a" seg={5} cast={false} />
      <G p={[x + 0.85 + sw, y, z]}>
        {holeBlock([0, 0, 0], 0, "#b3a998")}
        {/* tenaz de ferro presa nos dois furos */}
        <Box s={[0.07, 0.8, 0.07]} p={[-0.3, 0.75, 0.52]} r={[0, 0, 0.35]} c="#3a3a3a" /><Box s={[0.07, 0.8, 0.07]} p={[0.3, 0.75, 0.52]} r={[0, 0, -0.35]} c="#3a3a3a" />
      </G>
      {/* cabrestante girado por obreiros */}
      <G p={[x + 3.5, 0, z + 3.4]}><Cyl rt={0.45} h={1.2} p={[0, 0.6, 0]} c="#8a5a2e" seg={10} />
        {[0, 1].map((i) => <Box key={i} s={[3.2, 0.14, 0.14]} p={[0, 1.0, 0]} r={[0, turn + i * PI / 2, 0]} c="#7a4a26" />)}</G>
      <Crowd list={pull} t={t} c={COSTUMES.rome} />
      {[[13.2, 0.45, 1.6], [14.9, 0.45, 2.2], [13.9, 1.35, 1.9]].map((p, k) => holeBlock(p as V3, k + 1))}
    </G>
  );
};

// ---------------------------------------------------------------- cidade na rocha, castellum e fonte
const City: React.FC<{ t: number }> = ({ t }) => {
  const water = ease(t, T.llego - 0.2, T.llego + 1.0);
  const houses = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ p: [31 + (i % 4) * 5.5 + rnd(i) * 1.5, H, -22 + Math.floor(i / 4) * 6.5 + rnd(i + 3)] as V3, w: 3.2 + rnd(i + 5) * 1.4, h: 2.2 + rnd(i + 8) * 1.4 })), []);
  const people = Array.from({ length: 6 }, (_, i) => ({ p: [33 + Math.cos(i) * 3, H, 2.5 + Math.sin(i * 1.7) * 2] as V3, yaw: PI + i, pose: (t > T.llego ? "cheer" : "idle") as PoseName, ph: i * 0.5 }));
  return (
    <G>
      {houses.map((q, i) => (
        <G key={i} p={q.p}>
          <Box s={[q.w, q.h, 3.2]} p={[0, q.h / 2, 0]} c={i % 3 ? "#f1e6d0" : "#e8d6b6"} />
          <Cone rad={Math.max(q.w, 3.2) * 0.75} h={1.3} seg={4} p={[0, q.h + 0.65, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#c4553a" />
        </G>
      ))}
      {/* castellum: a caixa onde o canal chega e a fonte */}
      <Box s={[3.0, 2.2, 3.0]} p={[27.5, H + 1.1, ZC]} c="#d9cdb6" /><Cone rad={2.3} h={1.0} seg={4} p={[27.5, H + 2.7, ZC]} r={[0, PI / 4, 0]} c="#b8553a" />
      <Cyl rt={2.0} h={0.7} p={[33, H + 0.35, 1.5]} c={GRANITE} seg={16} /><Cyl rt={1.8} h={0.1} p={[33, H + 0.4 + 0.25 * water, 1.5]} c="#3a97d6" seg={16} vis={water > 0.01} cast={false} />
      <Cyl rt={0.25} h={1.6} p={[33, H + 0.8, 1.5]} c={GRANITE2} seg={8} />
      {Array.from({ length: 10 }, (_, i) => { const u = fract(t * 1.6 + i / 10), a = (i / 10) * PI * 2; return <Sph key={i} rad={0.12} p={[33 + Math.cos(a) * u * 1.2, H + 1.7 + u * 1.2 - u * u * 2.2, 1.5 + Math.sin(a) * u * 1.2]} c="#7cc8ff" vis={water > 0.3} cast={false} ws={6} hs={4} />; })}
      <Crowd list={people} t={t} c={COSTUMES.rome} vis={t > T.p4} />
    </G>
  );
};

export const built = (t: number) => t < T.hispania - 0.15;
export const World: React.FC<{ t: number }> = ({ t }) => {
  const hook = built(t), spans = hook ? NSPAN : spansAt(t), clog = sandAt(t);
  const cross = hook ? 1 : spans / NSPAN, arrive = hook ? 1 : ease(t, T.llego - 0.3, T.llego + 0.6);
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Ground g={GROUND} />
      <Plateau x0={-110} x1={X0} slope={6} side={1} c="#7cc94a" c2="#a8865a" />
      <Plateau x0={X1} x1={110} slope={6} side={-1} c="#86cf52" c2="#9d7c52" />
      <Sierra /><Clouds t={t} n={8} />
      <Trees spots={[[-2, 0, 14], [20, 0, 16], [-4, 0, -16], [28, H, 8], [60, H, -10], [-20, H, 10], [-40, H, 12], [-14, H, -16], [44, H, 10]]} />
      <Source t={t} />
      <Specus xa={-60} xb={-32} y={H} /><Specus xa={-28} xb={X0} y={H} />
      <Flow a={[-60, H + 0.25, ZC]} b={[-32, H + 0.25, ZC]} t={t} speed={2.2 * (1 - 0.9 * clog)} />
      <Flow a={[-28, H + 0.25, ZC]} b={[X0, H + 0.25, ZC]} t={t} speed={2.2 * (1 - 0.9 * clog)} on={1 - 0.95 * clog} />
      <Clog t={t} /><Desarenador t={t} /><Waterfall t={t} />
      <Arcade n={spans} />
      <Specus xa={X0} xb={X0 + (X1 - X0) * cross} y={H} />
      <Flow a={[X0, H + 0.25, ZC]} b={[X1, H + 0.25, ZC]} t={t} on={hook ? 1 : ease(t, T.estosArcos - 0.4, T.estosArcos + 0.6)} />
      <Specus xa={X1} xb={26} y={H} />
      <Flow a={[X1, H + 0.25, ZC]} b={[26, H + 0.25, ZC]} t={t} on={arrive} />
      <Hero t={t} /><Crane t={t} /><City t={t} />
      <Puffs t={t} p={[30, H + 3.5, -18]} n={4} period={3.5} rise={4} size={0.5} c="#eeeeee" />
    </>
  );
};
