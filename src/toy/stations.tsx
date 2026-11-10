// As estações da usina, todas funções do tempo `t` (segundos). Nada de estado: cada quadro é recalculado do zero.
// Eixo x = fluxo da usina (campo → moenda → caldeira → turbina → dornas → destilaria); z+ = lado da câmera.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Quad, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd } from "./kit";
import { T } from "./cues";
import { PAL } from "./scenery";

const CANE_C = "#b4d43c";
const PI = Math.PI;

/** tanque com corte em cunha virado para a câmera (+z): parede, fundo, líquido com faces de corte */
export const CutTank: React.FC<{ p: V3; r: number; h: number; level: number; liquid: string; face: string; wall?: string; cut?: number; lip?: string }> = ({ p, r, h, level, liquid, face, wall = "#d5dade", cut = PI / 2, lip = "#9aa4aa" }) => {
  const half = cut / 2, ts = half, tl = PI * 2 - cut, lh = Math.max(0.001, level * h);
  return (
    <G p={p}>
      <Cyl rt={r} h={0.3} p={[0, 0.15, 0]} c={wall} seg={32} />
      <Cyl rt={r} h={h} p={[0, h / 2, 0]} c={wall} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      <Cyl rt={r + 0.08} h={0.22} p={[0, h, 0]} c={lip} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      <Cyl rt={r + 0.08} h={0.22} p={[0, h * 0.45, 0]} c={lip} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      <Cyl rt={r * 0.97} h={lh} p={[0, 0.3 + lh / 2, 0]} c={liquid} seg={32} ts={ts} tl={tl} o={{ rough: 0.3 }} />
      {[-half, half].map((a, i) => (
        <Quad key={i} w={r * 0.97} h={lh} p={[Math.sin(a) * r * 0.485, 0.3 + lh / 2, Math.cos(a) * r * 0.485]} r={[0, a - PI / 2, 0]} c={face} />
      ))}
    </G>
  );
};

/** nuvem de vapor / fumaça: n bolhas subindo e crescendo, voltando em ciclo */
const Puffs: React.FC<{ t: number; p: V3; n?: number; period?: number; rise?: number; size?: number; c?: string; on?: number; drift?: V3; o?: number; op?: number }> = ({ t, p, n = 8, period = 3, rise = 6, size = 1, c = "#ffffff", on = 1, drift = [0.8, 0, 0], o = 0, op = 1 }) => (
  <G p={p}>
    {Array.from({ length: n }, (_, i) => {
      const u = fract((t + i * (period / n)) / period + o), s = Math.sin(Math.min(1, u * 1.15) * PI) * size * (0.5 + u * 1.2) * on;
      return <Sph key={i} rad={1} p={[drift[0] * u + (rnd(i) - 0.5) * 0.6, u * rise, drift[2] * u + (rnd(i + 3) - 0.5) * 0.5]} sc={Math.max(0.001, s)} c={c} cast={false} ws={8} hs={6} o={{ rough: 1, opacity: op, depthWrite: op >= 1 }} />;
    })}
  </G>
);

// -------------------------------------------------- caminhão de cana
export const truckX = (t: number) => lerp(-27, -15.4, ease(t, 0.0, 10.4));
export const Truck: React.FC<{ x: number; z?: number; tilt?: number; load?: number; dir?: 1 | -1; t: number }> = ({ x, z = 3.4, tilt = 0, load = 1, t }) => {
  const moving = 1;
  const bundle = [[0, 0], [0.55, 0], [-0.55, 0], [0.28, 0.46], [-0.28, 0.46], [0, 0.92]];
  return (
    <G p={[x, 0, z]}>
      <Box s={[7, 0.35, 2.5]} p={[0, 0.95, 0]} c="#6b7780" />
      <Box s={[2.1, 1.9, 2.4]} p={[2.6, 2.05, 0]} c="#e2392f" o={{ rough: 0.4 }} />
      <Box s={[0.1, 0.95, 2.0]} p={[3.68, 2.4, 0]} c="#bfe6ff" o={{ rough: 0.15, emissive: "#6fb8ff", ei: 0.25 }} cast={false} />
      <Box s={[1.4, 1.1, 2.3]} p={[4.2, 1.5, 0]} c="#e2392f" o={{ rough: 0.4 }} />
      <Box s={[0.1, 0.5, 1.7]} p={[4.93, 1.4, 0]} c="#2a2f33" cast={false} />
      {[[-2.2, 1.15], [-0.9, 1.15], [3.3, 1.15]].flatMap(([wx], i) => [-1, 1].map((sz) => (
        <G key={`${i}${sz}`} p={[wx, 0.62, sz * 1.25]} r={[t * 0 + PI / 2, 0, 0]}><Cyl rt={0.62} h={0.5} c="#262b2e" seg={14} /><Cyl rt={0.3} h={0.52} c="#cfd6da" seg={10} cast={false} /></G>
      )))}
      <G p={[0, 1.15, -1.25]} r={[-tilt, 0, 0]}>
        <G p={[0, 0, 1.25]}>
          <Box s={[5.6, 0.2, 2.5]} p={[-0.2, 0.0, 0]} c="#58636b" />
          <Box s={[5.6, 0.95, 0.14]} p={[-0.2, 0.5, 1.2]} c="#e2392f" /><Box s={[5.6, 0.95, 0.14]} p={[-0.2, 0.5, -1.2]} c="#e2392f" />
          <Box s={[0.14, 0.95, 2.5]} p={[-3.0, 0.5, 0]} c="#e2392f" /><Box s={[0.14, 1.5, 2.5]} p={[2.55, 0.75, 0]} c="#e2392f" />
          <G sc={[1, load, load]} p={[-0.2, 0.15, 0]}>
            {bundle.map(([bz, by], k) => Array.from({ length: 4 }, (_, j) => (
              <Cyl key={`${k}${j}`} rt={0.24} h={5.2} p={[0, 0.4 + by + (j % 2) * 0.05, (bz as number) * 1.6 + (j - 1.5) * 0.35]} r={[0, 0, PI / 2]} c={CANE_C} seg={6} o={{ flat: true }} />
            )))}
          </G>
        </G>
      </G>
    </G>
  );
};

// -------------------------------------------------- moenda
export const MILL = { x: -6, z: -3 };
const Roller: React.FC<{ p: V3; a: number; r: number }> = ({ p, a, r }) => (
  <G p={p} r={[PI / 2, 0, 0]}>
    <G r={[0, a, 0]}>
      <Cyl rt={r} h={2.6} c="#7e8d99" seg={16} o={{ metal: 0.4, rough: 0.35 }} />
      <Cyl rt={r * 0.45} h={2.7} c="#2f3a42" seg={10} />
      {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.16, 2.62, 0.3]} p={[Math.sin((i / 10) * PI * 2) * r, 0, Math.cos((i / 10) * PI * 2) * r]} r={[0, (i / 10) * PI * 2, 0]} c="#aab8c2" cast={false} />)}
    </G>
  </G>
);
export const Mill: React.FC<{ t: number }> = ({ t }) => {
  const run = ease(t, T.moenda - 0.6, T.moenda + 0.6), a = Math.max(0, t - (T.moenda - 0.6)) * 1.8 * run;
  const { x, z } = MILL;
  const pcs = Array.from({ length: 9 }, (_, i) => {
    const u = fract(t * 0.55 + i / 9), on = t > T.moenda - 0.4 && t < T.moenda + 7.5 ? 1 : 0;
    return { p: [lerp(-12.8, -9.9, u), lerp(0.95, 2.55, u), -1.6] as V3, on };
  });
  const juiceOn = ease(t, T.moenda + 0.8, T.moenda + 1.8);
  const bag = Array.from({ length: 8 }, (_, i) => { const u = fract(t * 0.5 + i / 8); return { p: [lerp(-1.6, 3.0, u), lerp(2.15, 5.9, u), z] as V3, u }; });
  return (
    <G>
      <Box s={[11, 0.25, 7.2]} p={[x, 0.12, z]} c={PAL.concrete} cast={false} />
      <Box s={[9.4, 5.2, 0.3]} p={[x, 2.75, z - 3.2]} c="#e6edf2" /><Box s={[0.3, 5.2, 6.2]} p={[x - 4.6, 2.75, z]} c="#a9c0d3" /><Box s={[0.3, 5.2, 6.2]} p={[x + 4.6, 2.75, z]} c="#a9c0d3" />
      <Box s={[9.9, 0.45, 6.8]} p={[x, 5.55, z]} c="#7ea0bd" /><Box s={[9.4, 1.0, 0.3]} p={[x, 0.65, z + 3.0]} c="#a9c0d3" />
      <Box s={[9.4, 0.18, 6.0]} p={[x, 0.34, z]} c="#8798a5" cast={false} />
      <Roller p={[x - 1.0, 1.9, z]} a={a} r={0.95} /><Roller p={[x + 1.0, 1.9, z]} a={-a} r={0.95} /><Roller p={[x, 3.75, z + 0.05]} a={a * 0.8} r={1.0} />
      <Box s={[3.6, 0.2, 2.2]} p={[x, 0.95, z + 0.2]} c="#e8a41c" o={{ rough: 0.25 }} vis={juiceOn > 0.01} />
      {/* mesa de descarga + esteira de cana */}
      <Box s={[5.2, 0.35, 3.0]} p={[-15.0, 0.5, -0.4]} c="#7e8a93" />
      <Box s={[0.3, 1.2, 3.0]} p={[-17.5, 1.0, -0.4]} c="#6b7780" /><Box s={[5.2, 1.2, 0.3]} p={[-15.0, 1.0, -1.9]} c="#6b7780" />
      <G p={[-11.35, 1.75, -1.6]} r={[0, 0, Math.atan2(1.6, 2.9)]}><Box s={[3.5, 0.22, 1.5]} c="#3b4650" /></G>
      {pcs.map((q, i) => <Cyl key={i} rt={0.14} h={0.9} p={[q.p[0], q.p[1] + 0.25, q.p[2] + (i % 3 - 1) * 0.3]} r={[0, 0, PI / 2 + 0.3]} c={CANE_C} seg={6} vis={!!q.on} cast={false} />)}
      {/* cano do caldo até o tanque de caldo */}
      <Pipe a={[x, 0.8, z + 3.1]} b={[x, 0.8, 3.0]} rad={0.25} c={PAL.steel} /><Pipe a={[x, 0.8, 3.0]} b={[1.2, 0.8, 3.0]} rad={0.25} c={PAL.steel} />
      <Cyl rt={1.7} h={3.2} p={[2.4, 1.6, 3.3]} c="#cfd8de" seg={20} /><Cyl rt={1.56} h={0.35} p={[2.4, 3.3, 3.3]} c={PAL.amber} seg={20} o={{ rough: 0.2 }} vis={juiceOn > 0.01} cast={false} />
      {/* esteira do bagaço */}
      <G p={[0.8, 4.0, z]} r={[0, 0, Math.atan2(3.75, 4.6)]}><Box s={[6.0, 0.25, 1.4]} c="#3b4650" /></G>
      {bag.map((q, i) => <Box key={i} s={[0.5, 0.3, 0.5]} p={[q.p[0], q.p[1] + 0.3, q.p[2] + (i % 3 - 1) * 0.3]} r={[0, i, 0]} c="#d6b86a" vis={t > T.moenda + 1.0 && t < T.joga + 8} cast={false} />)}
    </G>
  );
};

export const pileGrow = (t: number) => {
  const g = 0.05 + 0.95 * ease(t, T.moenda + 1.0, T.p1 - 0.3);
  const shrink = 1 - 0.78 * ease(t, T.joga + 1.0, T.essaCaldeira + 2.5);
  const regrow = 1 + 0.35 * ease(t, T.eoBagaco, T.gera);
  return g * shrink * regrow;
};
export const Pile: React.FC<{ g: number }> = ({ g }) => {
  const lumps: [number, number, number, number, string][] = [[0, 0, 0, 5.2, "#d6b86a"], [-1.6, 0.1, 1.0, 3.6, "#cfae60"], [1.8, 0, 0.8, 3.4, "#dcc07a"], [0.2, 0, -1.3, 3.8, "#c9a757"], [-0.4, 2.0, 0, 3.0, "#d9bd72"], [0.9, 3.2, 0.1, 1.9, "#dfc57f"]];
  return (
    <G p={[3.4, 0, -3.2]} sc={[g, g, g]}>
      {lumps.map(([x, y, z, r, c], i) => <Sph key={i} rad={r} p={[x * 1.1, y + r * 0.62 * (y > 0 ? 1 : 0.62), z]} sc={[1.0, 0.95, 1.0]} c={c} ws={14} hs={9} o={{ rough: 1 }} />)}
      {Array.from({ length: 26 }, (_, i) => <Box key={i} s={[0.5, 0.12, 0.12]} p={[(rnd(i) - 0.5) * 7, 0.6 + rnd(i + 4) * 4, 2.4 + rnd(i + 9) * 1.5]} r={[rnd(i) * 2, rnd(i + 2) * 3, rnd(i + 6)]} c="#8d6a2b" cast={false} />)}
    </G>
  );
};

// -------------------------------------------------- caldeira + turbina
export const BOILER = { x: 14.5, z: -3.5 };
export const Boiler: React.FC<{ t: number }> = ({ t }) => {
  const { x, z } = BOILER;
  const fire = ease(t, T.joga + 1.2, T.joga + 2.4), flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3);
  const feeds = Array.from({ length: 6 }, (_, i) => { const u = fract(t * 0.6 + i / 6); return { p: [lerp(7.6, 10.5, u), lerp(0.8, 2.3, u), -2.3] as V3, on: t > T.joga + 0.4 && t < T.maisCaldo + 4 ? 1 : 0 }; });
  return (
    <G>
      <Box s={[9, 0.25, 7.2]} p={[x, 0.12, z]} c={PAL.concrete} cast={false} />
      <Box s={[8.6, 6.6, 0.3]} p={[x, 3.4, z - 3.2]} c="#e6dcd4" /><Box s={[0.3, 6.6, 6.2]} p={[x - 4.2, 3.4, z]} c={PAL.brick} /><Box s={[0.3, 6.6, 6.2]} p={[x + 4.2, 3.4, z]} c={PAL.brick} />
      <Box s={[9.2, 0.45, 6.8]} p={[x, 6.9, z]} c="#7e4a3a" /><Box s={[8.6, 1.0, 0.3]} p={[x, 0.65, z + 3.0]} c={PAL.brick} />
      <Cyl rt={1.9} h={5.6} p={[x, 3.1, z - 0.6]} c="#c9d3da" seg={24} o={{ metal: 0.3, rough: 0.35 }} /><Sph rad={1.9} ps={0} pl={PI / 2} p={[x, 5.9, z - 0.6]} c="#c9d3da" ws={20} hs={8} o={{ metal: 0.3, rough: 0.35 }} />
      <Cyl rt={1.96} h={0.18} p={[x, 2.2, z - 0.6]} c="#6d7d89" seg={24} /><Cyl rt={1.96} h={0.18} p={[x, 4.3, z - 0.6]} c="#6d7d89" seg={24} />
      <Box s={[2.6, 1.9, 0.5]} p={[x, 1.25, z + 1.4]} c="#2a2c30" />
      <Box s={[1.9, 1.3, 0.12]} p={[x, 1.25, z + 1.7]} c="#ff7a18" o={{ emissive: "#ff5a00", ei: 2.2 * fire + 0.05 }} cast={false} />
      <Cone rad={0.6} h={1.5 * flick} seg={6} p={[x - 0.35, 1.1 + 0.75 * flick, z + 1.76]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.6 }} vis={fire > 0.02} sc={fire} cast={false} />
      <Cone rad={0.5} h={1.2 * flick} seg={6} p={[x + 0.4, 1.0 + 0.6 * flick, z + 1.76]} c="#ff8a2a" o={{ emissive: "#ff5a00", ei: 2.4 }} vis={fire > 0.02} sc={fire} cast={false} />
      <G p={[0, 0, 0]}>
        <G p={[9.4, 1.5, -2.3]} r={[0, 0, Math.atan2(1.5, 3.0)]}><Box s={[3.6, 0.22, 1.3]} c="#3b4650" /></G>
        {feeds.map((q, i) => <Box key={i} s={[0.5, 0.3, 0.5]} p={[q.p[0], q.p[1] + 0.3, q.p[2] + (i % 3 - 1) * 0.25]} r={[0, i, 0]} c="#d6b86a" vis={!!q.on} cast={false} />)}
      </G>
      {/* chaminé listrada */}
      <Cyl rt={0.85} rb={1.15} h={16} p={[x + 3.0, 8, z - 2.9]} c="#f2f2f2" seg={16} />
      {[3, 7, 11, 14.6].map((y, i) => <Cyl key={i} rt={0.97 - y * 0.012} h={1.4} p={[x + 3.0, y, z - 2.9]} c="#e2392f" seg={16} cast={false} />)}
      <Puffs t={t} p={[x + 3.0, 16.4, z - 2.9]} n={9} period={4.2} rise={7} size={1.6} on={fire} c="#f4f6f8" drift={[2.2, 0, 0.5]} />
      {/* tubo de vapor até a turbina */}
      <Pipe a={[x, 6.6, z - 0.6]} b={[x, 8.0, z - 0.6]} rad={0.34} c="#aeb9c2" /><Pipe a={[x, 8.0, z - 0.6]} b={[24.2, 8.0, z - 0.6]} rad={0.34} c="#aeb9c2" /><Pipe a={[24.2, 8.0, z - 0.6]} b={[24.2, 3.9, z - 0.3]} rad={0.34} c="#aeb9c2" />
      <Puffs t={t + 1} p={[19.6, 8.5, z - 0.6]} n={5} period={2.2} rise={0.9} size={0.45} on={ease(t, T.fogo + 0.4, T.fogo + 1.4)} c="#ffffff" drift={[3.8, 0, 0]} />
    </G>
  );
};

const spinA = (t: number, t0: number) => { const tau = Math.max(0, t - t0), r = 1.4, w = 14; return tau < r ? (w * tau * tau) / (2 * r) : w * (tau - r / 2); };
export const TURB = { x: 25, z: -3.5 };
export const Turbine: React.FC<{ t: number }> = ({ t }) => {
  const { x, z } = TURB, a = spinA(t, T.turbina), pw = ease(t, T.turbina + 1.0, T.energia + 0.4);
  return (
    <G>
      <Box s={[7.4, 0.25, 6.6]} p={[x, 0.12, z]} c={PAL.concrete} cast={false} />
      <Box s={[7.0, 5.2, 0.3]} p={[x, 2.75, z - 3.0]} c="#dfe7ee" /><Box s={[0.3, 5.2, 5.8]} p={[x - 3.4, 2.75, z]} c="#9fb7cf" /><Box s={[0.3, 5.2, 5.8]} p={[x + 3.4, 2.75, z]} c="#9fb7cf" />
      <Box s={[7.6, 0.45, 6.4]} p={[x, 5.55, z]} c="#6f94b4" /><Box s={[7.0, 0.9, 0.3]} p={[x, 0.6, z + 2.8]} c="#9fb7cf" />
      <G p={[x - 1.0, 2.5, z + 0.2]} r={[PI / 2, 0, 0]}><Cyl rt={1.55} h={0.9} c="#4e6272" seg={20} o={{ metal: 0.4, rough: 0.3 }} /></G>
      <G p={[x - 1.0, 2.5, z + 0.7]} r={[0, 0, a]}>
        {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.32, 1.25, 0.12]} p={[Math.sin((i / 10) * PI * 2) * 0.95, Math.cos((i / 10) * PI * 2) * 0.95, 0]} r={[0, 0, -(i / 10) * PI * 2 + 0.4]} c="#dfe7ee" o={{ metal: 0.5, rough: 0.25 }} cast={false} />)}
        <Cyl rt={0.35} h={0.3} r={[PI / 2, 0, 0]} c="#e8a41c" seg={10} cast={false} />
      </G>
      <Box s={[2.3, 2.3, 2.3]} p={[x + 1.9, 1.35, z + 0.2]} c="#2f7fe0" o={{ rough: 0.4 }} />
      <Box s={[0.9, 0.9, 0.08]} p={[x + 1.9, 1.5, z + 1.4]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.6 * pw }} cast={false} />
      {/* lâmpada gigante: acende quando a energia sai */}
      <Cyl rt={0.5} h={0.7} p={[x, 6.1, z]} c="#8b98a2" seg={10} />
      <Sph rad={0.95} p={[x, 7.1, z]} c={pw > 0.05 ? "#fff1a8" : "#dbe6ee"} o={{ emissive: "#ffdc3a", ei: 2.6 * pw, rough: 0.2 }} ws={16} hs={12} cast={false} />
      <Pipe a={[x + 3.4, 1.4, z + 0.2]} b={[x + 4.6, 1.4, z + 0.2]} rad={0.14} c="#222a30" />
      <Pipe a={[x + 4.6, 1.4, z + 0.2]} b={[x + 4.6, 11.9, -9]} rad={0.14} c="#222a30" /><Pipe a={[x + 4.6, 11.9, -9]} b={[31, 11.9, -9]} rad={0.14} c="#222a30" />
    </G>
  );
};

// -------------------------------------------------- carro tentando abastecer com garapa
export const CarGag: React.FC<{ t: number }> = ({ t }) => {
  const arrive = ease(t, T.maisCaldo - 0.3, T.abastece + 0.7), fail = prog(t, T.garapa, T.p2 - 0.2);
  const cx = lerp(9.5, 19.0, arrive);
  const cough = fail > 0 && fail < 1 ? Math.abs(Math.sin(t * 17)) * 0.1 * (1 - fail * 0.4) : 0;
  const sh = fail > 0 && fail < 1 ? Math.sin(t * 40) * 0.045 : 0;
  const show = t > T.maisCaldo - 0.9 && t < T.d2 + 0.5;
  return (
    <G vis={show}>
      <G p={[cx + sh, cough, 6.4]}>
        <Box s={[2.9, 0.8, 1.5]} p={[0, 0.85, 0]} c="#2f86ff" o={{ rough: 0.35 }} /><Box s={[1.5, 0.75, 1.3]} p={[-0.1, 1.55, 0]} c="#2f86ff" o={{ rough: 0.35 }} />
        <Box s={[1.1, 0.5, 1.32]} p={[0.35, 1.58, 0]} c="#cfeaff" o={{ rough: 0.1, emissive: "#6fb8ff", ei: 0.2 }} cast={false} />
        {[[-0.9, 0.38], [0.95, 0.38]].flatMap(([wx, wy], i) => [-1, 1].map((sz) => <G key={`${i}${sz}`} p={[wx, wy, sz * 0.78]} r={[PI / 2, 0, 0]}><Cyl rt={0.38} h={0.3} c="#222" seg={12} /><Cyl rt={0.18} h={0.32} c="#ddd" seg={8} cast={false} /></G>))}
      </G>
      <Puffs t={t} p={[cx - 1.5, 0.7, 6.4]} n={6} period={0.9} rise={1.2} size={0.5} c="#5b5b5b" drift={[-1.4, 0, 0]} on={fail > 0 && fail < 1 ? 1 : 0} />
      {/* bomba com garapa */}
      <Box s={[1.2, 2.6, 1.0]} p={[21.6, 1.3, 6.0]} c="#f2f2f2" /><Box s={[1.25, 0.7, 1.05]} p={[21.6, 2.3, 6.0]} c="#e2392f" />
      <Cyl rt={0.36} h={1.0} p={[21.6, 1.3, 6.58]} c={PAL.amber} seg={12} o={{ emissive: "#ffb000", ei: 0.35, rough: 0.15 }} cast={false} />
      <Pipe a={[21.0, 1.9, 6.1]} b={[19.9, 1.35, 6.4]} rad={0.07} c="#222" seg={6} />
    </G>
  );
};

// -------------------------------------------------- dornas de fermentação
export const DORNA = { x: 39, z: -2 };
export const Dorna: React.FC<{ t: number }> = ({ t }) => {
  const { x, z } = DORNA, h = 6.6, r = 3.3;
  const level = lerp(0.12, 0.78, ease(t, T.d2 + 0.1, T.levedura + 1.4));
  const yeastOn = ease(t, T.levedura - 0.2, T.levedura + 0.5);
  const sugar = (prog(t, T.levedura, T.devora + 3.2));
  const pipeOn = ease(t, T.d2 - 0.2, T.d2 + 1.0);
  const surfaceY = 0.3 + level * h;
  const beings = Array.from({ length: 11 }, (_, i) => {
    const bx = x + (rnd(i) - 0.5) * 2.2, by = lerp(1.2, surfaceY - 0.6, rnd(i + 4)) + Math.sin(t * 2 + i) * 0.18, bz = z + 0.3 + rnd(i + 8) * 1.2;
    return { p: [bx, by, bz] as V3, i };
  });
  const bubbles = Array.from({ length: 22 }, (_, i) => { const u = fract(t * 0.42 + rnd(i) * 3); return { p: [x + (rnd(i + 1) - 0.5) * 2.4 + Math.sin(t * 3 + i) * 0.1, lerp(0.7, surfaceY, u), z + 0.2 + rnd(i + 5) * 1.6] as V3, s: 0.1 + rnd(i + 3) * 0.12 }; });
  const alc = ease(t, T.devora + 1.0, T.nove);
  return (
    <G>
      <Box s={[22, 0.2, 7.4]} p={[x, 0.1, z]} c={PAL.concrete} cast={false} />
      {/* tanques vizinhos fechados */}
      {[-6, 6].map((dx, k) => (
        <G key={k} p={[x + dx, 0, z]}>
          <Cyl rt={2.7} h={5.8} p={[0, 2.9, 0]} c="#d5dade" seg={28} /><Sph rad={2.7} ps={0} pl={PI / 2} p={[0, 5.8, 0]} c="#9fb2c0" ws={20} hs={8} />
          <Cyl rt={2.76} h={0.2} p={[0, 2.5, 0]} c="#9aa4aa" seg={28} cast={false} /><Pipe a={[0, 6.9, 0]} b={[0, 8.2, 0]} rad={0.18} c="#aeb9c2" />
        </G>
      ))}
      <CutTank p={[x, 0, z]} r={r} h={h} level={level} liquid="#e8a41c" face="#c9871a" cut={PI / 1.9} />
      {/* espuma de CO2 no topo */}
      <Cyl rt={r * 0.96} h={0.35} p={[x, surfaceY + 0.05, z]} c="#fff1c4" seg={32} ts={PI / 3.8} tl={PI * 2 - PI / 1.9} o={{ rough: 1 }} vis={yeastOn > 0.3} cast={false} />
      {beings.map((b) => (
        <G key={b.i} p={b.p} sc={yeastOn * (1 + 0.06 * Math.sin(t * 6 + b.i))} vis={yeastOn > 0.02}>
          <Sph rad={0.34} c="#f4dcc0" ws={12} hs={9} />
          <Sph rad={0.075} c="#ffffff" p={[-0.13, 0.08, 0.28]} ws={8} hs={6} cast={false} /><Sph rad={0.075} c="#ffffff" p={[0.13, 0.08, 0.28]} ws={8} hs={6} cast={false} />
          <Sph rad={0.04} c="#111" p={[-0.13, 0.08, 0.34]} ws={6} hs={4} cast={false} /><Sph rad={0.04} c="#111" p={[0.13, 0.08, 0.34]} ws={6} hs={4} cast={false} />
          <Box s={[0.18, 0.05, 0.05]} p={[0, -0.1, 0.32]} c="#a4503a" cast={false} />
        </G>
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const u = clamp(sugar * 1.6 - rnd(i) * 0.6), y = lerp(h + 1.2, surfaceY + 0.2, u) , eaten = u >= 1 ? 0 : 1;
        return <Box key={i} s={[0.28, 0.28, 0.28]} p={[x + (rnd(i + 2) - 0.5) * 2.2, y, z + 0.5 + rnd(i + 6) * 1.2]} r={[u * 4, u * 3, 0]} c="#ffffff" o={{ rough: 0.3 }} vis={sugar > 0 && !!eaten} cast={false} />;
      })}
      {bubbles.map((b, i) => <Sph key={i} rad={b.s} p={b.p} c="#fff8e0" o={{ opacity: 0.85, rough: 0.2 }} vis={yeastOn > 0.5} cast={false} ws={6} hs={4} />)}
      {/* cano de caldo vindo do tanque de caldo */}
      <Pipe a={[3.6, 0.9, 3.0]} b={[x - 1.2, 0.9, 3.0]} rad={0.25} c={PAL.steel} /><Pipe a={[x - 1.2, 0.9, 3.0]} b={[x - 1.2, 0.9, z + 3.1]} rad={0.25} c={PAL.steel} />
      {Array.from({ length: 28 }, (_, i) => { const u = fract(t * 0.7 + i / 28); return <Box key={i} s={[0.5, 0.18, 0.18]} p={[lerp(3.6, x - 1.2, u), 0.9, 3.0 + 0.26]} c="#ffcf5a" o={{ emissive: "#ffb000", ei: 0.5 }} vis={pipeOn > 0.5 && t < T.p3 + 3} cast={false} />; })}
      <G p={[0, 0, 0]}>{/* medidor de álcool no tanque */}<Box s={[0.5, 4.0, 0.2]} p={[x + r + 1.0, 3.0, z + 1.2]} c="#2a3138" /><Box s={[0.36, 3.8 * (0.09 + 0 * alc), 0.22]} p={[x + r + 1.0, 1.1 + 3.8 * 0.09 / 2, z + 1.22]} c="#55e0ff" o={{ emissive: "#19b8e6", ei: 0.5 }} vis={alc > 0.02} cast={false} /></G>
    </G>
  );
};

// -------------------------------------------------- destilaria
export const COL = { x: 56, z: -3 };
export const Column: React.FC<{ t: number }> = ({ t }) => {
  const { x, z } = COL, on = ease(t, T.aquece - 0.3, T.aquece + 1.0), flick = 0.85 + 0.15 * Math.sin(t * 21) * Math.sin(t * 6.1);
  const rise = Array.from({ length: 16 }, (_, i) => { const u = fract(t * 0.5 + i / 16); return { p: [x + Math.sin(i * 2.1 + t * 1.5) * 0.55, lerp(3.7, 11.0, u), z + 0.35 + rnd(i) * 0.7] as V3, s: 0.18 + 0.1 * Math.sin(u * PI) }; });
  const boil = Array.from({ length: 10 }, (_, i) => { const u = fract(t * 1.1 + rnd(i) * 3); return { p: [x + (rnd(i + 2) - 0.5) * 2.6, lerp(1.2, 2.6, u), z + 0.3 + rnd(i + 5) * 1.5] as V3, s: 0.1 + 0.1 * rnd(i + 3) }; });
  const drops = Array.from({ length: 6 }, (_, i) => { const u = fract(t * 0.9 + i / 6); return { p: [61, lerp(2.0, 3.4, 1 - u) , lerp(-1.6, 2.0, u)] as V3 }; });
  const fuel = ease(t, T.enche - 0.3, T.vinhaca + 1.0);
  const outflow = ease(t, T.vinhaca - 0.2, T.dez), lag = ease(t, T.vinhaca + 0.5, T.p4 + 1.0);
  return (
    <G>
      <Box s={[14, 0.2, 9]} p={[x + 3, 0.1, z + 2]} c={PAL.concrete} cast={false} />
      {/* fornalha com fogo */}
      <Box s={[4.2, 1.3, 3.8]} p={[x, 0.85, z]} c="#4a5058" /><Box s={[2.8, 0.7, 0.14]} p={[x, 0.7, z + 1.95]} c="#ff7a18" o={{ emissive: "#ff5a00", ei: 2.2 * on + 0.05 }} cast={false} />
      <Cone rad={0.5} h={1.2 * flick} seg={6} p={[x - 0.7, 0.6 + 0.6 * flick, z + 2.0]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.6 }} sc={on} vis={on > 0.02} cast={false} />
      <Cone rad={0.5} h={1.0 * flick} seg={6} p={[x + 0.7, 0.55 + 0.5 * flick, z + 2.0]} c="#ff8a2a" o={{ emissive: "#ff5a00", ei: 2.4 }} sc={on} vis={on > 0.02} cast={false} />
      {/* panela de vinho (corte) */}
      <CutTank p={[x, 1.5, z]} r={2.5} h={2.4} level={0.7} liquid="#d68a1a" face="#b4710f" wall="#c4cfd6" cut={PI / 2} />
      {boil.map((b, i) => <Sph key={i} rad={b.s} p={[b.p[0], b.p[1] + 1.5 - 1.2, b.p[2]]} c="#ffe9b0" vis={on > 0.4} cast={false} ws={6} hs={4} />)}
      {/* coluna com pratos */}
      <CutTank p={[x, 3.9, z]} r={1.55} h={8.0} level={0.0} liquid="#d68a1a" face="#b4710f" wall="#d0dae1" cut={PI / 1.8} lip="#8d9aa4" />
      {Array.from({ length: 6 }, (_, i) => <Cyl key={i} rt={1.5} h={0.14} p={[x, 3.9 + 1.1 + i * 1.2, z]} c="#6d7d89" seg={24} cast={false} ts={PI / 3.6} tl={PI * 2 - PI / 1.8} o={{ side: "double" }} />)}
      {rise.map((q, i) => <Sph key={i} rad={q.s} p={q.p} c="#e4f6ff" o={{ opacity: 0.9 }} vis={on > 0.5} cast={false} ws={6} hs={4} />)}
      <Sph rad={1.55} ps={0} pl={PI / 2} p={[x, 11.9, z]} c="#9fb2c0" ws={20} hs={8} />
      <Pipe a={[x, 12.9, z]} b={[x, 13.4, z]} rad={0.28} c="#aeb9c2" /><Pipe a={[x, 13.4, z]} b={[61, 13.4, z]} rad={0.28} c="#aeb9c2" /><Pipe a={[61, 13.4, z]} b={[61, 8.2, z]} rad={0.28} c="#aeb9c2" />
      {/* condensador */}
      <Box s={[2.6, 5.6, 2.6]} p={[61, 5.4, z]} c="#7fc4ff" o={{ rough: 0.25 }} />{[2.6, 4.2, 5.8, 7.4].map((y, i) => <Box key={i} s={[2.8, 0.18, 2.8]} p={[61, y, z]} c="#2f86ff" cast={false} />)}
      <Pipe a={[61, 2.6, z + 0.8]} b={[61, 3.2, 2.0]} rad={0.2} c="#aeb9c2" />
      {drops.map((d, i) => <Sph key={i} rad={0.14} p={[61, 3.1 - (i % 3) * 0.2, lerp(-0.2, 2.0, fract(t * 0.9 + i / 6))]} c="#b4ffd8" o={{ emissive: "#66ffaa", ei: 0.6 }} vis={on > 0.6 && fuel < 0.98} cast={false} ws={6} hs={4} />)}
      {/* caminhão-tanque de etanol */}
      <G p={[61, 0, 4.6]}>
        <Box s={[8, 0.35, 2.6]} p={[0, 0.9, 0]} c="#5b6770" />
        <Cyl rt={1.25} h={6.0} p={[-0.8, 2.3, 0]} r={[0, 0, PI / 2]} c="#f4f6f8" seg={20} o={{ rough: 0.3 }} /><Cyl rt={1.27} h={6.0 * 0.35} p={[-0.8, 2.3, 0]} r={[0, 0, PI / 2]} c="#33c46a" seg={20} cast={false} />
        <Box s={[2.0, 2.0, 2.4]} p={[3.9, 2.0, 0]} c="#2f86ff" /><Box s={[0.1, 0.9, 2.0]} p={[4.93, 2.4, 0]} c="#bfe6ff" cast={false} />
        {[[-3, 0], [-1.6, 0], [3.8, 0]].flatMap(([wx], i) => [-1, 1].map((sz) => <G key={`${i}${sz}`} p={[wx, 0.62, sz * 1.25]} r={[PI / 2, 0, 0]}><Cyl rt={0.62} h={0.5} c="#262b2e" seg={12} /><Cyl rt={0.3} h={0.52} c="#cfd6da" seg={8} cast={false} /></G>))}
        <Box s={[0.34, 1.8, 0.1]} p={[-0.8, 2.3, 1.32]} c="#223" cast={false} /><Box s={[0.26, 1.7 * fuel + 0.01, 0.12]} p={[-0.8, 1.45 + 0.85 * fuel, 1.34]} c="#55ff9a" o={{ emissive: "#00d060", ei: 0.7 }} cast={false} />
      </G>
      {/* saída de vinhaça: cano escuro, fio escorrendo e lagoa */}
      <Pipe a={[x, 0.7, z + 2.0]} b={[x - 2.6, 0.5, z + 3.2]} rad={0.28} c="#333a40" />
      <Box s={[0.9, 0.12, 12 * outflow + 0.01]} p={[x - 2.6, 0.08, z + 3.2 + 6 * outflow]} c="#1b1208" o={{ rough: 0.2 }} vis={outflow > 0.02} cast={false} />
      <Cyl rt={1} h={0.14} p={[x - 2.6, 0.08, 12.4]} sc={[Math.max(0.01, lag * 7.2), 1, Math.max(0.01, lag * 5.4)]} c="#1b1208" o={{ rough: 0.12, metal: 0.15 }} seg={28} vis={lag > 0.02} cast={false} />
      <Puffs t={t} p={[x - 2.6, 0.6, 12.4]} n={7} period={3.2} rise={5} size={0.5} op={0.5} c="#9cf06a" drift={[0, 0, -0.5]} on={lag > 0.3 && t < T.d4 + 1.5 ? 1 : lag > 0.3 ? 0.35 : 0} />
    </G>
  );
};

// -------------------------------------------------- canais de volta à lavoura
export const flowFront = (t: number) => lerp(52, -18, ease(t, T.canais - 0.1, T.canais + 4.6));
export const Canal: React.FC<{ t: number }> = ({ t }) => {
  const xf = flowFront(t), len = 52 - xf, vis = t > T.canais - 0.2;
  const teeth = [-22, -28, -34, -40, -46];
  const tooth = (k: number) => ease(t, T.canais + 4.2 + k * 0.5, T.canais + 6.2 + k * 0.5);
  return (
    <G>
      <Box s={[72, 0.16, 1.9]} p={[17, 0.08, 9.9]} c="#a2abb0" cast={false} />
      <Box s={[72, 0.4, 0.22]} p={[17, 0.28, 9.0]} c="#c9d0d4" /><Box s={[72, 0.4, 0.22]} p={[17, 0.28, 10.8]} c="#c9d0d4" />
      <Box s={[Math.max(0.01, len), 0.16, 1.4]} p={[52 - len / 2, 0.2, 9.9]} c="#1b1208" o={{ rough: 0.12 }} vis={vis} cast={false} />
      {Array.from({ length: 40 }, (_, i) => { const u = fract(t * 0.3 + i / 40), px = lerp(52, xf, u); return <Box key={i} s={[0.7, 0.05, 0.9]} p={[px, 0.3, 9.9]} c="#4a3622" vis={vis && len > 1} cast={false} />; })}
      {teeth.map((x, k) => (
        <G key={k}>
          <Box s={[0.9, 0.12, 27]} p={[x, 0.05, -2.4]} c="#a2abb0" cast={false} />
          <Box s={[0.7, 0.14, 26 * tooth(k) + 0.01]} p={[x, 0.16, 10 - 13 * tooth(k)]} c="#1b1208" o={{ rough: 0.12 }} vis={tooth(k) > 0.01} cast={false} />
        </G>
      ))}
    </G>
  );
};
