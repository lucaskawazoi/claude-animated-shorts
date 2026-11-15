// MEP14 — evaporador, cozedor, centrífuga (açúcar branco + melaço), dorna com levedura, destilaria.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { Flow, PI, STEEL, STEEL2, Spray, mixc, pk } from "../papel/parts";
import { T } from "./anchors";
import { AMB, CutTank, Drum, Sack, Shell, Truck } from "./kit2";
import { L } from "./layout";

// ---------------------------------------------------------------- evaporador (três efeitos em fila)
export const Evaporator: React.FC<{ t: number }> = ({ t }) => {
  const [x0, , z] = L.evap, steam = ease(t, T.ferve - 0.3, T.ferve + 0.6) * (1 - 0.4 * ease(t, T.xarope + 1.0, T.cozedor));
  const colors = ["#f0e6a0", "#e0b040", "#c9780f"];
  const lvl = (i: number) => ease(t, T.evap - 0.2 + i * 0.35, T.evap + 0.7 + i * 0.35);
  return (
    <G>
      <Box s={[28, 0.25, 9]} p={[x0, 0.12, z]} c="#c4c9cc" cast={false} />
      {[0, 1, 2].map((i) => {
        const x = x0 - 8 + i * 8, col = mixc(i === 0 ? "#f0e6a0" : colors[i - 1], colors[i], ease(t, T.ferve + i * 0.5, T.xarope + 0.4 + i * 0.3));
        return (
          <G key={i}>
            <Cyl rt={2.5} h={8.5} p={[x, 4.5, z]} c="#c9d3da" seg={24} o={{ metal: 0.3, rough: 0.35 }} /><Sph rad={2.5} ps={0} pl={PI / 2} p={[x, 8.75, z]} c="#c9d3da" ws={20} hs={8} o={{ metal: 0.3, rough: 0.35 }} />
            <Cyl rt={2.56} h={0.25} p={[x, 3.0, z]} c="#6d7d89" seg={24} cast={false} /><Cyl rt={2.56} h={0.25} p={[x, 6.2, z]} c="#6d7d89" seg={24} cast={false} />
            {/* visor com o caldo mudando de cor */}
            <Box s={[1.9, 3.6, 0.3]} p={[x, 4.8, z + 2.45]} c="#2a3138" cast={false} />
            <Box s={[1.5, 3.2 * (0.35 + 0.65 * lvl(i)), 0.2]} p={[x, 3.2 + 1.6 * (0.35 + 0.65 * lvl(i)), z + 2.6]} c={col} o={{ emissive: col, ei: 0.6, rough: 0.2 }} cast={false} />
            <Puffs t={t + i * 0.6} p={[x, 9.6, z]} n={7} period={2.4} rise={7} size={1.3} c="#ffffff" on={steam} drift={[0.8, 0, 0.6]} />
          </G>
        );
      })}
      {/* canos entre os efeitos */}
      {[0, 1].map((i) => <G key={i}><Pipe a={[x0 - 8 + i * 8 + 2.5, 1.2, z + 0.8]} b={[x0 - 8 + (i + 1) * 8 - 2.5, 1.2, z + 0.8]} rad={0.3} c={STEEL} /><Flow pts={[[x0 - 8 + i * 8 + 2.5, 1.2, z + 0.8], [x0 - 8 + (i + 1) * 8 - 2.5, 1.2, z + 0.8]]} t={t} t0={T.evap + 0.3 + i * 0.4} spd={9} gap={1.2} rad={0.3} c={colors[i]} glow /></G>)}
      <Pipe a={[x0 - 11.4, 1.2, z + 0.8]} b={[x0 - 10.5, 1.2, z + 0.8]} rad={0.3} c={STEEL} />
      {/* saída do xarope para o cozedor */}
      <Pipe a={[x0 + 10.5, 1.2, z + 0.8]} b={[L.pan[0] - 4, 1.2, z + 0.8]} rad={0.3} c={STEEL} />
      <Flow pts={[[x0 + 10.5, 1.2, z + 0.8], [L.pan[0] - 4, 1.2, z + 0.8]]} t={t} t0={T.xarope - 0.3} spd={9} gap={1.1} rad={0.34} c="#c9780f" glow />
    </G>
  );
};

// ---------------------------------------------------------------- cozedor a vácuo: visor redondo com cristais crescendo
export const Pan: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.pan, g = prog(t, T.cozedor + 0.4, T.crist + 1.6), thick = ease(t, T.cozedor + 0.4, T.engrossa + 0.5);
  const syr = mixc("#c9780f", "#a8620a", thick);
  const crys = Array.from({ length: 34 }, (_, i) => ({ a: rnd(i) * PI * 2, r: Math.sqrt(rnd(i + 7)) * 0.85, i }));
  return (
    <G>
      <Box s={[9, 0.25, 8]} p={[x, 0.12, z]} c="#c4c9cc" cast={false} />
      <Cyl rt={3.4} h={4.2} p={[x, 2.3, z]} c="#b8c3cc" seg={28} o={{ metal: 0.3, rough: 0.4 }} />
      <Sph rad={3.4} ps={0} pl={PI / 2} p={[x, 4.4, z]} c="#c9d3da" ws={24} hs={10} o={{ metal: 0.3, rough: 0.35 }} />
      <Cyl rt={3.46} h={0.25} p={[x, 1.2, z]} c="#6d7d89" seg={28} cast={false} /><Cyl rt={3.46} h={0.25} p={[x, 4.1, z]} c="#6d7d89" seg={28} cast={false} />
      {/* visor */}
      <G p={[x, 2.7, z + 3.3]}>
        <Cyl rt={1.5} h={0.5} r={[PI / 2, 0, 0]} c="#2a3138" seg={24} cast={false} />
        <Cyl rt={1.25} h={0.55} r={[PI / 2, 0, 0]} p={[0, 0, 0.02]} c={syr} seg={24} o={{ emissive: syr, ei: 0.45, rough: 0.2 }} cast={false} />
        {crys.map((q) => { const s = (0.08 + 0.3 * clamp(g * 1.4 - q.i * 0.012)) * (g > 0.02 ? 1 : 0); return s > 0.01 ? <Box key={q.i} s={[s, s, s]} p={[Math.cos(q.a) * q.r, Math.sin(q.a) * q.r, 0.32]} r={[q.i, q.i * 2, 0.3 * t]} c="#ffffff" o={{ emissive: "#fff6d8", ei: 0.45 }} cast={false} /> : null; })}
      </G>
      {/* manômetro */}
      <Cyl rt={0.55} h={0.25} p={[x + 2.3, 4.6, z + 2.4]} r={[PI / 2 - 0.4, 0, 0]} c="#ffffff" seg={16} cast={false} /><Box s={[0.08, 0.45, 0.06]} p={[x + 2.3, 4.7, z + 2.65]} r={[0, 0, 0.7 + Math.sin(t) * 0.1]} c="#e0262b" cast={false} />
      <Puffs t={t} p={[x, 7.8, z]} n={6} period={2.6} rise={5} size={1.0} c="#ffffff" on={ease(t, T.cozedor, T.cozedor + 0.6)} drift={[0.6, 0, 0.4]} />
      {/* massa cozida vai para a centrífuga */}
      <Pipe a={[x + 3.4, 1.2, z + 0.8]} b={[L.cent[0] - 3.8, 1.2, z + 0.8]} rad={0.32} c={STEEL} />
      <Flow pts={[[x + 3.4, 1.2, z + 0.8], [L.cent[0] - 3.8, 1.2, z + 0.8]]} t={t} t0={T.crist + 0.4} spd={8} gap={1.1} rad={0.36} c="#c98a30" c2="#fff6d8" glow />
    </G>
  );
};

// ---------------------------------------------------------------- centrífuga: cesto girando, açúcar branco fica, melaço escuro escorre
const spinA = (t: number, t0: number) => { const tau = Math.max(0, t - t0), r = 1.2, w = 16; return tau < r ? (w * tau * tau) / (2 * r) : w * (tau - r / 2); };
export const Centrifuge: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.cent, a = spinA(t, T.centr), sugar = ease(t, T.gira, T.fica + 0.4), mol = ease(t, T.fica + 0.5, T.melaco + 0.4);
  return (
    <G>
      <Box s={[9, 0.25, 8.5]} p={[x, 0.12, z]} c="#c4c9cc" cast={false} />
      <Box s={[6.4, 1.6, 6.4]} p={[x, 0.95, z]} c="#59626b" />
      {/* carcaça aberta em cima */}
      <Cyl rt={3.3} h={2.4} p={[x, 2.8, z]} c="#b8c3cc" seg={32} open o={{ side: "double", metal: 0.3, rough: 0.4 }} />
      <Cyl rt={3.36} h={0.28} p={[x, 4.0, z]} c="#6d7d89" seg={32} open o={{ side: "double" }} />
      {/* cesto */}
      <G p={[x, 2.9, z]} r={[0, -a, 0]}>
        <Cyl rt={2.4} h={2.2} c="#e8edf0" seg={28} open o={{ side: "double", rough: 0.6 }} />
        {Array.from({ length: 16 }, (_, i) => <Box key={i} s={[0.16, 2.2, 0.16]} p={[Math.sin((i / 16) * PI * 2) * 2.42, 0, Math.cos((i / 16) * PI * 2) * 2.42]} c="#3a2010" cast={false} />)}
        <Cyl rt={2.3} h={2.0 * sugar + 0.001} p={[0, -1.0 + sugar, 0]} c="#ffffff" seg={28} open o={{ side: "double", emissive: "#e8edf0", ei: 0.35 }} cast={false} />
        <Cyl rt={2.3} h={0.1} p={[0, -1.1, 0]} c="#c98a30" seg={28} cast={false} />
        {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[1.0, 0.18, 0.4]} p={[Math.sin((i / 8) * PI * 2) * 1.2, -0.95, Math.cos((i / 8) * PI * 2) * 1.2]} r={[0, (i / 8) * PI * 2, 0]} c="#ffffff" cast={false} />)}
      </G>
      {/* melaço sai pelas frestas e escorre pela parede */}
      {mol > 0.02 ? Array.from({ length: 16 }, (_, i) => { const th = (i / 16) * PI * 2 + a * 0.2, u = fract(t * 2.2 + rnd(i)), rr = lerp(2.5, 3.2, Math.min(1, u * 1.6)); return <Sph key={i} rad={0.16} p={[x + Math.sin(th) * rr, lerp(3.3, 2.0, u * u), z + Math.cos(th) * rr]} c="#3a1c08" ws={6} hs={4} cast={false} o={{ emissive: "#2a1204", ei: 0.4 }} />; }) : null}
      <Pipe a={[x + 3.0, 1.0, z + 2.6]} b={[L.barrel[0] - 1.4, 1.0, L.barrel[2]]} rad={0.3} c="#333a40" />
      <Flow pts={[[x + 3.0, 1.0, z + 2.6], [L.barrel[0] - 1.4, 1.0, L.barrel[2]]]} t={t} t0={T.melaco - 0.1} spd={7} gap={1.0} rad={0.34} c="#3a1c08" glow />
      {/* saída do açúcar branco: calha até a pilha de sacos */}
      <Box s={[6, 0.25, 1.8]} p={[x - 1.0, 1.7, z + 4.4]} r={[0, 0, 0.0]} c="#c3cbd3" cast={false} />
      <Box s={[3, 0.18, 1.5]} p={[x - 0.2, 1.9, z + 4.4]} c="#3b4650" />
      <Spray t={t} t0={T.fica} t1={T.melaco + 0.5} p={[x + 2.0, 3.6, z + 3.0]} dir={[0.6, 0.6, 1]} spread={0.4} n={14} spd={4.5} g={-12} life={0.8} size={0.3} cols={["#ffffff", "#f0f4f8"]} shape="sph" floor={1.6} seed={11} />
    </G>
  );
};
/** barril de melaço e pilha de sacos de açúcar (um a um) */
export const Outputs: React.FC<{ t: number }> = ({ t }) => {
  const [bx, , bz] = L.barrel, lvl = 0.25 + 0.7 * ease(t, T.melaco, T.prob2);
  const sacks = Array.from({ length: 9 }, (_, i) => ({ i, k: pk(t, T.fica + 0.2 + i * 0.22, 0.4) }));
  const sx = L.cent[0] + 6.6, sz = L.cent[2] + 8.4;
  return (
    <G>
      <Cyl rt={1.9} h={4.2} p={[bx, 2.3, bz]} c="#4a2a14" seg={20} /><Cyl rt={1.92} h={0.25} p={[bx, 3.0, bz]} c="#2a1204" seg={20} cast={false} /><Cyl rt={1.92} h={0.25} p={[bx, 1.6, bz]} c="#2a1204" seg={20} cast={false} />
      <Cyl rt={1.6} h={0.12} p={[bx, 0.3 + 3.8 * lvl, bz]} c="#2a1204" seg={20} o={{ rough: 0.2 }} cast={false} />
      {sacks.map(({ i, k }) => { const row = Math.floor(i / 3), col = i % 3; return <Sack key={i} p={[sx - 1.6 + col * 1.7, 0.25 + row * 0.7, sz]} r={[0, 0.1 * (i % 3 - 1), 0]} sc={k} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- dorna: levedura come o melaço, faz álcool
export const Dorna: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.dorna, h = 6.6, r = 3.3;
  const level = lerp(0.1, 0.78, ease(t, T.dorna - 0.2, T.levedura + 0.8)), yeast = ease(t, T.levedura - 0.1, T.levedura + 0.5), alc = ease(t, T.come, T.faz + 0.4);
  const surf = 0.3 + level * h;
  const beings = Array.from({ length: 11 }, (_, i) => ({ p: [x + (rnd(i) - 0.5) * 2.2, lerp(1.2, Math.max(1.4, surf - 0.7), rnd(i + 4)) + Math.sin(t * 2 + i) * 0.18, z + 0.3 + rnd(i + 8) * 1.2] as V3, i }));
  const bubbles = Array.from({ length: 24 }, (_, i) => { const u = fract(t * 0.5 + rnd(i) * 3); return { p: [x + (rnd(i + 1) - 0.5) * 2.4 + Math.sin(t * 3 + i) * 0.1, lerp(0.7, surf, u), z + 0.2 + rnd(i + 5) * 1.6] as V3, s: 0.1 + rnd(i + 3) * 0.12 }; });
  const sugar = prog(t, T.levedura, T.faz);
  return (
    <G>
      <Box s={[22, 0.2, 8]} p={[x, 0.1, z]} c="#c4c9cc" cast={false} />
      {[-7, 7].map((dx, k) => <G key={k} p={[x + dx, 0, z]}><Cyl rt={2.7} h={5.8} p={[0, 2.9, 0]} c="#d5dade" seg={28} /><Sph rad={2.7} ps={0} pl={PI / 2} p={[0, 5.8, 0]} c="#9fb2c0" ws={20} hs={8} /></G>)}
      <CutTank p={[x, 0, z]} r={r} h={h} cut={PI / 1.9} layers={[{ h: level * h, c: mixc("#4a2a14", "#e8a41c", alc), face: mixc("#3a1c08", "#c9871a", alc) }]} />
      <Cyl rt={r * 0.96} h={0.35} p={[x, surf + 0.05, z]} c="#fff1c4" seg={32} ts={PI / 3.8} tl={PI * 2 - PI / 1.9} o={{ rough: 1 }} vis={yeast > 0.3} cast={false} />
      {beings.map((b) => (
        <G key={b.i} p={b.p} sc={Math.max(0.001, yeast * (1 + 0.06 * Math.sin(t * 6 + b.i)))} vis={yeast > 0.02}>
          <Sph rad={0.34} c="#f4dcc0" ws={12} hs={9} />
          <Sph rad={0.075} c="#ffffff" p={[-0.13, 0.08, 0.28]} ws={8} hs={6} cast={false} /><Sph rad={0.075} c="#ffffff" p={[0.13, 0.08, 0.28]} ws={8} hs={6} cast={false} />
          <Sph rad={0.04} c="#111" p={[-0.13, 0.08, 0.34]} ws={6} hs={4} cast={false} /><Sph rad={0.04} c="#111" p={[0.13, 0.08, 0.34]} ws={6} hs={4} cast={false} />
          <Box s={[0.18, 0.05, 0.05]} p={[0, -0.1, 0.32]} c="#a4503a" cast={false} />
        </G>
      ))}
      {Array.from({ length: 12 }, (_, i) => { const u = clamp(sugar * 1.5 - rnd(i) * 0.5); return <Box key={i} s={[0.3, 0.3, 0.3]} p={[x + (rnd(i + 2) - 0.5) * 2.2, lerp(h + 1.2, surf + 0.2, u), z + 0.5 + rnd(i + 6) * 1.2]} r={[u * 4, u * 3, 0]} c="#ffffff" vis={sugar > 0 && u < 1} cast={false} />; })}
      {bubbles.map((b, i) => <Sph key={i} rad={b.s} p={b.p} c="#fff8e0" o={{ opacity: 0.85, rough: 0.2 }} vis={yeast > 0.5} cast={false} ws={6} hs={4} />)}
      {/* melaço chega do barril */}
      <Pipe a={[L.barrel[0] + 1.9, 1.0, L.barrel[2]]} b={[x - 5, 1.0, L.barrel[2]]} rad={0.28} c="#333a40" /><Pipe a={[x - 5, 1.0, L.barrel[2]]} b={[x - 3.4, 1.0, z + 1.4]} rad={0.28} c="#333a40" />
      <Flow pts={[[L.barrel[0] + 1.9, 1.0, L.barrel[2]], [x - 5, 1.0, L.barrel[2]], [x - 3.4, 1.0, z + 1.4]]} t={t} t0={T.dorna - 0.3} t1={T.faz} spd={8} gap={1.1} rad={0.34} c="#3a1c08" glow />
      {/* medidor de álcool */}
      <Box s={[0.5, 4.0, 0.2]} p={[x + r + 1.0, 3.0, z + 1.2]} c="#2a3138" /><Box s={[0.36, 3.8 * (0.05 + 0.85 * alc), 0.22]} p={[x + r + 1.0, 1.1 + 3.8 * (0.05 + 0.85 * alc) / 2, z + 1.22]} c="#55e0ff" o={{ emissive: "#19b8e6", ei: 0.6 }} cast={false} />
      <Pipe a={[x + 4.0, 7.0, z]} b={[L.still[0] - 4.5, 7.0, L.still[2]]} rad={0.3} c={STEEL2} /><Pipe a={[L.still[0] - 4.5, 7.0, L.still[2]]} b={[L.still[0] - 4.5, 1.3, L.still[2]]} rad={0.3} c={STEEL2} />
      <Flow pts={[[x + 4.0, 7.0, z], [L.still[0] - 4.5, 7.0, L.still[2]], [L.still[0] - 4.5, 1.3, L.still[2]]]} t={t} t0={T.faz + 0.3} spd={10} gap={1.4} rad={0.3} c="#ffd860" glow />
    </G>
  );
};

// ---------------------------------------------------------------- destilaria: só álcool (e um saco de açúcar riscado)
export const Still: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.still, on = ease(t, T.quem - 0.5, T.quem + 0.8), flick = 0.85 + 0.15 * Math.sin(t * 21) * Math.sin(t * 6.1), fuel = ease(t, T.quem, T.conta);
  const rise = Array.from({ length: 14 }, (_, i) => { const u = fract(t * 0.5 + i / 14); return { p: [x + Math.sin(i * 2.1 + t * 1.5) * 0.55, lerp(3.7, 11.0, u), z + 0.35 + rnd(i) * 0.7] as V3, s: 0.18 + 0.1 * Math.sin(u * PI) }; });
  return (
    <G>
      <Box s={[22, 0.2, 10]} p={[x + 3, 0.1, z + 2]} c="#c4c9cc" cast={false} />
      <Box s={[4.2, 1.3, 3.8]} p={[x, 0.85, z]} c="#4a5058" /><Box s={[2.8, 0.7, 0.14]} p={[x, 0.7, z + 1.95]} c="#ff7a18" o={{ emissive: "#ff5a00", ei: 2.2 * on + 0.05 }} cast={false} />
      <Cone rad={0.5} h={1.2 * flick} seg={6} p={[x - 0.7, 0.6 + 0.6 * flick, z + 2.0]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.6 }} sc={Math.max(0.001, on)} cast={false} />
      <CutTank p={[x, 1.5, z]} r={2.5} h={2.4} cut={PI / 2} wall="#c4cfd6" layers={[{ h: 1.6, c: "#d68a1a", face: "#b4710f" }]} />
      <CutTank p={[x, 3.9, z]} r={1.55} h={8.0} cut={PI / 1.8} wall="#d0dae1" lip="#8d9aa4" layers={[{ h: 0.01, c: "#d68a1a", face: "#b4710f" }]} />
      {Array.from({ length: 6 }, (_, i) => <Cyl key={i} rt={1.5} h={0.14} p={[x, 5.0 + i * 1.2, z]} c="#6d7d89" seg={24} cast={false} ts={PI / 3.6} tl={PI * 2 - PI / 1.8} o={{ side: "double" }} />)}
      {rise.map((q, i) => <Sph key={i} rad={q.s} p={q.p} c="#e4f6ff" vis={on > 0.5} cast={false} ws={6} hs={4} />)}
      <Sph rad={1.55} ps={0} pl={PI / 2} p={[x, 11.9, z]} c="#9fb2c0" ws={20} hs={8} />
      <Pipe a={[x, 12.9, z]} b={[x, 13.4, z]} rad={0.28} c={STEEL2} /><Pipe a={[x, 13.4, z]} b={[x + 7, 13.4, z]} rad={0.28} c={STEEL2} /><Pipe a={[x + 7, 13.4, z]} b={[x + 7, 8.2, z]} rad={0.28} c={STEEL2} />
      <Box s={[2.6, 5.6, 2.6]} p={[x + 7, 5.4, z]} c="#7fc4ff" o={{ rough: 0.25 }} />{[2.6, 4.2, 5.8, 7.4].map((y, i) => <Box key={i} s={[2.8, 0.18, 2.8]} p={[x + 7, y, z]} c="#2f86ff" cast={false} />)}
      {/* caminhão-tanque de etanol */}
      <Truck p={[x + 8, 0, z + 6.4]} yaw={PI} kind="tank" cab="#2f86ff" tank="#f4f6f8" t={t} />
      <Box s={[0.34, 1.8, 0.1]} p={[x + 8.7, 2.5, z + 7.75]} c="#223" cast={false} /><Box s={[0.26, 1.7 * fuel + 0.01, 0.12]} p={[x + 8.7, 1.65 + 0.85 * fuel, z + 7.8]} c="#55ff9a" o={{ emissive: "#00d060", ei: 0.7 }} cast={false} />
      {/* saco de açúcar com X vermelho: aqui não tem */}
      <G p={[x - 7.5, 0, z + 5]}>
        <Sack p={[0, 0, 0]} sc={2.0} />
        <Box s={[0.35, 3.4, 0.2]} p={[0, 1.4, 1.4]} r={[0, 0, 0.75]} c="#e0262b" o={{ emissive: "#ff2020", ei: 0.5 }} cast={false} /><Box s={[0.35, 3.4, 0.2]} p={[0, 1.4, 1.4]} r={[0, 0, -0.75]} c="#e0262b" o={{ emissive: "#ff2020", ei: 0.5 }} cast={false} />
      </G>
      {/* placa azul de destilaria */}
      <G p={[x - 4, 0, z + 6.5]} sc={Math.max(0.001, pk(t, T.quem, 0.4))}><Cyl rt={0.14} h={4} p={[0, 2, 0]} c="#59626b" seg={6} /><Box s={[3.4, 2.0, 0.2]} p={[0, 4.4, 0]} c="#2f86ff" /><Sph rad={0.55} p={[0, 4.4, 0.18]} sc={[0.8, 1.1, 0.4]} c="#ffffff" ws={8} hs={6} cast={false} /></G>
      {false ? <Drum p={[0, 0, 0]} c="#fff" /> : null}
    </G>
  );
};
