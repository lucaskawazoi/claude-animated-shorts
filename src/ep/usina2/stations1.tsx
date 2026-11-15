// MEP14 — a usina do ep. 1 (canavial, moenda, caldeira), o tratamento do caldo (decantador, filtro), a torta indo para a lavoura e o caldo «quase só água».
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { Flow, PI, STEEL, Spray, WHITE, pk, mixc } from "../papel/parts";
import { T } from "./anchors";
import { BRICK, CANE_C, CutTank, Shell, Truck } from "./kit2";
import { L } from "./layout";

// ---------------------------------------------------------------- usina do ep. 1
export const CaneField: React.FC<{ t: number }> = ({ t }) => {
  const [x0, , z0] = L.cane;
  return (
    <G p={[x0, 0, z0]}>
      <Box s={[22, 0.12, 22]} p={[0, 0.06, 0]} c="#6a4a2a" cast={false} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
        const x = -8 + c * 3.2 + (r % 2) * 0.8, z = -7 + r * 3.6, sw = 0.05 * Math.sin(t * 1.3 + r + c);
        return (
          <G key={`${r}${c}`} p={[x, 0, z]} r={[0, 0, sw]}>
            {[-0.35, 0, 0.35].map((dx, k) => <Cyl key={k} rt={0.2} h={4.6 + k * 0.5} p={[dx, 2.3 + k * 0.25, (k - 1) * 0.25]} c={CANE_C} seg={6} o={{ flat: true }} cast={false} />)}
            <Cone rad={1.0} h={1.8} p={[0, 5.1, 0]} c="#4fa22a" seg={6} o={{ flat: true }} cast={false} />
          </G>
        );
      }))}
    </G>
  );
};
const Roller: React.FC<{ p: V3; a: number; r: number }> = ({ p, a, r }) => (
  <G p={p} r={[PI / 2, 0, 0]}><G r={[0, a, 0]}>
    <Cyl rt={r} h={2.6} c="#7e8d99" seg={16} o={{ metal: 0.4, rough: 0.35 }} /><Cyl rt={r * 0.45} h={2.7} c="#2f3a42" seg={10} />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.16, 2.62, 0.3]} p={[Math.sin((i / 10) * PI * 2) * r, 0, Math.cos((i / 10) * PI * 2) * r]} r={[0, (i / 10) * PI * 2, 0]} c="#aab8c2" cast={false} />)}
  </G></G>
);
export const Mill: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.mill, a = t * 1.8;
  return (
    <G>
      <Shell p={[x, 0, z]} w={9.4} d={6.4} h={5.2} wall="#e6edf2" side="#a9c0d3" roof="#7ea0bd" />
      <Roller p={[x - 1.0, 1.9, z]} a={a} r={0.95} /><Roller p={[x + 1.0, 1.9, z]} a={-a} r={0.95} /><Roller p={[x, 3.75, z + 0.05]} a={a * 0.8} r={1.0} />
      <Box s={[3.6, 0.2, 2.2]} p={[x, 0.95, z + 0.2]} c="#e8a41c" o={{ rough: 0.25 }} />
      <Box s={[5.2, 0.35, 3.0]} p={[x - 9, 0.5, z]} c="#7e8a93" />
      <G p={[x - 5.4, 1.75, z]} r={[0, 0, Math.atan2(1.6, 2.9)]}><Box s={[3.5, 0.22, 1.5]} c="#3b4650" /></G>
      {Array.from({ length: 8 }, (_, i) => { const u = fract(t * 0.55 + i / 8); return <Cyl key={i} rt={0.14} h={0.9} p={[lerp(x - 7, x - 4, u), lerp(1.0, 2.55, u) + 0.25, z + (i % 3 - 1) * 0.3]} r={[0, 0, PI / 2 + 0.3]} c={CANE_C} seg={6} cast={false} />; })}
      <Pipe a={[x, 0.8, z + 3.1]} b={[x, 0.8, L.tank[2] - 0.0]} rad={0.25} c={STEEL} /><Pipe a={[x, 0.8, L.tank[2]]} b={[L.tank[0] - 1.6, 0.8, L.tank[2]]} rad={0.25} c={STEEL} />
    </G>
  );
};
export const Boiler: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.boiler, flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3);
  return (
    <G>
      <Shell p={[x, 0, z]} w={8.6} d={6.4} h={6.4} wall="#e6dcd4" side={BRICK} roof="#7e4a3a" />
      <Cyl rt={1.9} h={5.6} p={[x, 3.1, z - 0.6]} c="#c9d3da" seg={24} o={{ metal: 0.3, rough: 0.35 }} /><Sph rad={1.9} ps={0} pl={PI / 2} p={[x, 5.9, z - 0.6]} c="#c9d3da" ws={20} hs={8} o={{ metal: 0.3, rough: 0.35 }} />
      <Box s={[2.6, 1.9, 0.5]} p={[x, 1.25, z + 1.4]} c="#2a2c30" /><Box s={[1.9, 1.3, 0.12]} p={[x, 1.25, z + 1.7]} c="#ff7a18" o={{ emissive: "#ff5a00", ei: 2.2 }} cast={false} />
      <Cone rad={0.6} h={1.5 * flick} seg={6} p={[x - 0.35, 1.1 + 0.75 * flick, z + 1.76]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.6 }} cast={false} />
      <Cyl rt={0.85} rb={1.15} h={16} p={[x + 3.0, 8, z - 2.9]} c="#f2f2f2" seg={16} />
      {[3, 7, 11, 14.6].map((y, i) => <Cyl key={i} rt={0.97 - y * 0.012} h={1.4} p={[x + 3.0, y, z - 2.9]} c="#e2392f" seg={16} cast={false} />)}
      <Puffs t={t} p={[x + 3.0, 16.4, z - 2.9]} n={9} period={4.2} rise={7} size={1.6} c="#f4f6f8" drift={[2.2, 0, 0.5]} />
      {/* pilha de bagaço ao lado */}
      <G p={[x - 7.5, 0, z + 1]}>{[[0, 0, 0, 2.6], [-1.4, 0, 0.6, 1.8], [1.4, 0, 0.4, 1.7]].map(([a, b, c, r], i) => <Sph key={i} rad={r} p={[a, r * 0.45, c]} sc={[1, 0.8, 1]} c="#d6b86a" ws={10} hs={7} o={{ rough: 1 }} />)}</G>
    </G>
  );
};
export const CaldoTank: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.tank;
  return (
    <G>
      <Cyl rt={1.7} h={3.2} p={[x, 1.6, z]} c="#cfd8de" seg={20} /><Cyl rt={1.56} h={0.35} p={[x, 3.3, z]} c="#9a8a2a" seg={20} o={{ rough: 0.2 }} cast={false} />
      <Flow pts={[[L.mill[0], 0.8, L.mill[2] + 3.1], [L.mill[0], 0.8, z], [x - 1.6, 0.8, z]]} t={t} t0={0} spd={7} gap={2.2} rad={0.3} c="#8a9a2a" glow />
    </G>
  );
};
export const HomeTruck: React.FC<{ t: number }> = ({ t }) => {
  const x = lerp(-110, -58, ease(t, 0, 4.2));
  return <Truck p={[x, 0, 8]} kind="cane" t={t} />;
};

// ---------------------------------------------------------------- tratamento do caldo + filtro
export const Clarifier: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.clar, k = ease(t, T.primeiro, T.lodo + 0.3), mud = 0.2 + 0.8 * ease(t, T.primeiro + 0.3, T.limpo + 0.6);
  const a = t * 1.1;
  return (
    <G>
      <CutTank p={[x, 0, z]} r={3.4} h={3.6} cut={PI / 1.9} layers={[
        { h: 0.2 + 0.9 * mud, c: "#5a3a1a", face: "#46290f" },
        { h: 2.2 - 0.9 * mud, c: mixc("#7a7a2a", "#e8b030", k), face: mixc("#66661e", "#c88a10", k) },
      ]} />
      <Cyl rt={0.14} h={3.6} p={[x, 2.2, z]} c="#59626b" seg={8} cast={false} />
      <G p={[x, 3.7, z]} r={[0, a, 0]}><Box s={[6.6, 0.18, 0.3]} c="#59626b" cast={false} /><Box s={[0.3, 0.18, 4]} c="#59626b" cast={false} /></G>
      {/* cano do lodo para o filtro */}
      <Pipe a={[x + 3.4, 0.9, z + 0.5]} b={[L.filt[0] - 4.5, 0.9, z + 0.5]} rad={0.4} c={STEEL} />
      <Pipe a={[L.tank[0] + 1.7, 1.2, L.tank[2] - 0.2]} b={[x - 3.4, 1.2, z + 1.0]} rad={0.35} c={STEEL} />
      <Flow pts={[[L.tank[0] + 1.7, 1.2, L.tank[2] - 0.2], [x - 3.4, 1.2, z + 1.0]]} t={t} t0={0.5} spd={8} gap={1.1} rad={0.4} c="#8a9a2a" glow />
      <Flow pts={[[x + 3.2, 0.9, z + 0.5], [L.filt[0] - 4.5, 0.9, z + 0.5]]} t={t} t0={T.primeiro + 0.2} spd={9} gap={0.9} rad={0.42} c="#5a3a1a" />
      {/* cano do caldo limpo (âmbar) vai para o tanque de vidro adiante */}
      <Pipe a={[x + 1, 0.9, z - 3.7]} b={[L.glass[0] - 3, 0.9, z - 3.7]} rad={0.25} c={STEEL} /><Pipe a={[L.glass[0] - 3, 0.9, z - 3.7]} b={[L.glass[0] - 2.2, 0.9, z]} rad={0.25} c={STEEL} />
      <Flow pts={[[x + 1, 0.9, z - 3.7], [L.glass[0] - 3, 0.9, z - 3.7]]} t={t} t0={T.limpo + 0.5} spd={12} gap={2.2} rad={0.3} c="#f0c040" glow />
    </G>
  );
};

export const RotaryFilter: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.filt, a = (t - 6) * 0.9, on = ease(t, T.filtro - 0.5, T.filtro + 0.5);
  const R = 2.5;
  return (
    <G>
      <Box s={[9, 0.25, 7]} p={[x, 0.12, z]} c="#c4c9cc" cast={false} />
      {/* cocho com o lodo */}
      <Box s={[6.6, 1.8, 4.2]} p={[x - 0.3, 1.0, z]} c="#8a6a44" /><Box s={[6.2, 0.2, 3.8]} p={[x - 0.3, 1.92, z]} c="#4a2f16" o={{ rough: 0.3 }} cast={false} />
      <Box s={[0.4, 2.8, 0.4]} p={[x - 3.4, 2.4, z + 2.3]} c="#59626b" /><Box s={[0.4, 2.8, 0.4]} p={[x - 3.4, 2.4, z - 2.3]} c="#59626b" />
      <Box s={[0.4, 2.8, 0.4]} p={[x + 2.8, 2.4, z + 2.3]} c="#59626b" /><Box s={[0.4, 2.8, 0.4]} p={[x + 2.8, 2.4, z - 2.3]} c="#59626b" />
      {/* tambor: eixo em z, gira de frente para a câmera */}
      <G p={[x, 4.1, z]} r={[0, 0, -a]}>
        <Cyl rt={R} h={3.4} r={[PI / 2, 0, 0]} c="#9aa6b0" seg={28} o={{ metal: 0.3, rough: 0.4 }} />
        {Array.from({ length: 12 }, (_, i) => { const th = (i / 12) * PI * 2; return <G key={i} p={[Math.sin(th) * (R + 0.12), Math.cos(th) * (R + 0.12), 0]} r={[0, 0, -th]}><Box s={[1.5, 0.32 * on + 0.001, 3.3]} c="#6a4a24" o={{ rough: 1 }} cast={false} /></G>; })}
        {Array.from({ length: 12 }, (_, i) => { const th = ((i + 0.5) / 12) * PI * 2; return <Box key={i} s={[0.16, R * 2, 0.16]} p={[0, 0, 1.78]} r={[0, 0, -th]} c="#59626b" cast={false} />; })}
        <Cyl rt={0.75} h={0.5} p={[0, 0, 1.9]} r={[PI / 2, 0, 0]} c="#e8a41c" seg={12} cast={false} />
      </G>
      {/* raspador, calha e fita */}
      <Box s={[0.2, 1.4, 3.4]} p={[x + 2.55, 5.2, z]} r={[0, 0, -0.5]} c="#c3cbd3" cast={false} />
      <Box s={[3.6, 0.2, 3.2]} p={[x + 4.4, 3.7, z]} r={[0, 0, -0.5]} c="#59626b" />
      <Spray t={t} t0={T.filtro} t1={T.torta + 1.5} p={[x + 3.0, 4.9, z]} dir={[1, -0.5, 0]} spread={0.25} n={14} spd={4} g={-14} life={0.9} size={0.55} cols={["#6a4a24", "#4a2f16", "#7a5a30"]} floor={0.4} seed={3} />
      <Pipe a={[x - 4.5, 0.9, z + 0.5]} b={[x - 3.4, 0.9, z + 0.5]} rad={0.25} c={STEEL} />
    </G>
  );
};
export const Pile: React.FC<{ p: V3; g: number; c?: string }> = ({ p, g, c = "#5a3a1a" }) => (
  <G p={p} sc={Math.max(0.001, g)}>
    {[[0, 0, 0, 2.6], [-1.7, 0, 0.5, 1.8], [1.7, 0, 0.7, 1.7], [0.2, 0.9, -0.2, 1.7]].map(([a, b, d, r], i) => <Sph key={i} rad={r} p={[a, b + r * 0.5, d]} sc={[1.2, 0.8, 1.1]} c={i % 2 ? c : "#6b4a2a"} ws={10} hs={7} o={{ rough: 1 }} />)}
  </G>
);
export const TortaPile: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.pile, g = ease(t, T.lodo + 0.7, T.torta + 0.7) * (1 - 0.8 * ease(t, T.torta + 0.7, T.adubo));
  return <Pile p={[x, 0, z]} g={g} />;
};
export const truckX = (t: number) => lerp(L.pile[0] + 4, L.lav[0] + 34, ease(t, T.torta + 0.6, T.lavoura + 0.3));
export const Lavoura: React.FC<{ t: number }> = ({ t }) => {
  const [x0, , z0] = L.lav, tx = truckX(t), on = t > T.torta + 0.5 && t < T.prob1 + 1.5;
  return (
    <G>
      <Box s={[48, 0.14, 16]} p={[x0 + 14, 0.06, z0]} c="#7a5233" cast={false} />
      {Array.from({ length: 4 }, (_, r) => <Box key={r} s={[48, 0.2, 1.5]} p={[x0 + 14, 0.14, z0 - 6 + r * 4]} c="#5a3a1a" cast={false} />)}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 16 }, (_, c) => {
        const x = x0 - 7 + c * 3.0, k = pk(t, T.adubo + 0.15 + c * 0.05 + (x < tx - 3 ? 0 : 99), 0.6) * (x < tx - 3 ? 1 : 0);
        return <G key={`${r}${c}`} p={[x, 0.2, z0 - 6 + r * 4]} sc={Math.max(0.001, k)}><Cone rad={0.35} h={1.4} p={[0, 0.7, 0]} c="#4fa22a" seg={5} cast={false} /><Cone rad={0.3} h={1.0} p={[0.3, 0.5, 0.1]} r={[0, 0, -0.9]} c="#6fcf3a" seg={5} cast={false} /></G>;
      }))}
      {on ? <Truck p={[tx, 0, z0 + 8.5]} yaw={0} kind="torta" cab="#2f86ff" tilt={0.5 * ease(t, T.torta + 0.9, T.torta + 1.4)} load={1 - 0.8 * ease(t, T.torta + 1.0, T.adubo + 1.2)} t={t} /> : null}
      {on ? <Spray t={t} t0={T.torta + 1.0} t1={T.lavoura + 0.3} p={[tx - 3.2, 2.8, z0 + 6.8]} dir={[-0.6, -0.3, -1]} spread={0.3} n={14} spd={5} g={-12} life={1.0} size={0.6} cols={["#5a3a1a", "#6b4a2a"]} floor={0.3} seed={8} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- caldo limpo: «quase só água»
export const GlassTank: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.glass, k = ease(t, T.limpo + 0.6, T.limpo + 1.6);
  const drops = Array.from({ length: 70 }, (_, i) => ({ p: [x + (rnd(i) - 0.5) * 3.2 + 0.25 * Math.sin(t * 2 + i), 0.9 + 4.6 * fract(rnd(i + 5) + t * (0.1 + 0.05 * rnd(i + 9))), z + (rnd(i + 3) - 0.5) * 3.2] as V3, i }));
  const cubes = Array.from({ length: 6 }, (_, i) => ({ p: [x + (rnd(i + 20) - 0.5) * 2.4, 1.2 + 3.8 * fract(rnd(i + 30) + t * 0.05), z + (rnd(i + 40) - 0.5) * 2.4] as V3, i }));
  return (
    <G>
      <Box s={[6, 0.4, 6]} p={[x, 0.2, z]} c="#c4c9cc" cast={false} />
      <Cyl rt={2.3} h={6.4} p={[x, 3.6, z]} c="#bfe6ff" seg={24} o={{ opacity: 0.28, depthWrite: false, rough: 0.1 }} cast={false} />
      <Cyl rt={2.2} h={5.2 * k + 0.01} p={[x, 0.4 + 2.6 * k, z]} c="#3aa0ff" seg={24} o={{ opacity: 0.5, depthWrite: false, emissive: "#1a6ad6", ei: 0.4 }} cast={false} />
      {k > 0.5 ? drops.map((d) => <Sph key={d.i} rad={0.3} p={d.p} c="#7fc4ff" ws={6} hs={4} cast={false} o={{ emissive: "#2f86ff", ei: 0.6 }} />) : null}
      {k > 0.5 ? cubes.map((d) => <Box key={d.i} s={[0.4, 0.4, 0.4]} p={d.p} r={[d.i, d.i * 2, 0]} c="#fff1a0" cast={false} o={{ emissive: "#ffd84a", ei: 0.6 }} />) : null}
      <Cyl rt={2.4} h={0.35} p={[x, 6.9, z]} c="#8a929a" seg={24} cast={false} />
      <Pipe a={[x + 2.2, 0.9, z]} b={[L.evap[0] - 5, 0.9, z]} rad={0.28} c={STEEL} />
      <Flow pts={[[x + 2, 0.9, z], [L.evap[0] - 5, 0.9, z]]} t={t} t0={T.deixa1 - 0.5} spd={9} gap={1.2} rad={0.3} c="#7fc4ff" glow />
    </G>
  );
};
export { WHITE };
