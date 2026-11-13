// MEP13 — estações da primeira metade: floresta, caminhão, descascador, picadora, lupa da lignina, digestor, branqueamento.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { T } from "./anchors";
import { OPEN_END, openId } from "./opening";
import { AMBER, BARK, BARK2, CONC, DARK, Duct, Flow, GLASS, PI, PULP, RED, Spray, STEEL, STEEL2, Steel, Torus, WHITE, WOOD, WOOD2, YEL, lit, mixc, pk } from "./parts";
import { Puffs } from "../../toy/scenery";

// ---- posições (eixo x = caminho da madeira)
export const DB = 100, CH = 150, PILE = 176, DX = 220, BKX = 240, WSH = [262, 274], TW = 296, WPX = 318;
export const ROWZ = [-8, -17, -26, -35, -44], COLX = [-36, -27, -18, -9, 0, 9, 18, 27, 36];

// ---------------------------------------------------------------- eucalipto (tronco claro e fino, copa azul-esverdeada) e floresta plantada em fileiras
export const Euca: React.FC<{ p: V3; g: number; i: number; fall?: number }> = ({ p, g, i, fall = 0 }) => {
  const s = Math.max(0.001, g), sw = 1 + 0.0 * i;
  return (
    <G p={p} r={[fall, 0, 0]} vis={g > 0.01}>
      <Cyl rt={0.32} rb={0.46} h={8 * s} p={[0, 4 * s, 0]} c="#e2d6b8" seg={6} />
      <Cyl rt={0.47} rb={0.5} h={2.2 * s} p={[0, 1.1 * s, 0]} c="#8a7552" seg={6} />
      <Sph rad={1.5} p={[0, 9.4 * s, 0]} sc={[0.85 * s, 2.0 * s, 0.85 * s]} c={i % 2 ? "#3f8f72" : "#4aa081"} ws={8} hs={6} o={{ flat: true }} />
      <Sph rad={1.1} p={[0.7 * s, 8.4 * s, 0.4 * s]} sc={[0.9 * s, 1.5 * s, 0.9 * s]} c="#62b995" ws={7} hs={5} o={{ flat: true }} />
      <Sph rad={1.0} p={[-0.7 * s, 10.6 * s, -0.3 * s]} sc={[0.9 * s, 1.5 * s, 0.9 * s]} c="#37866a" ws={7} hs={5} o={{ flat: true }} />
    </G>
  );
};
export const treeGrow = (t: number, row: number, col: number): number => {
  if (t >= T.agoraSim) return lerp(0.22, 1, pk(t, T.agoraSim + 0.1 + row * 0.22 + Math.abs(col - 4) * 0.03, 1.4));
  if (t >= OPEN_END + 0.2) return 1;
  const o = openId();
  return o === "A" ? pk(t, 1.9 + row * 0.1 + Math.abs(col - 4) * 0.02, 0.5) : o === "C" ? pk(t, [1.2, 0.3, -0.25, 0.55, 1.75][row] + col * 0.012, 0.55) : 1;
};
export const Forest: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {ROWZ.map((z, r) => COLX.map((x, c) => {
      const i = r * 9 + c, felled = r === 0 && c === 4;
      if (felled) {
        const u = ease(t, T.tora, T.tora + 0.75), fall = 1.5 * u * u + (t > T.tora + 0.75 ? 0.02 * Math.sin((t - T.tora - 0.75) * 30) * Math.exp(-(t - T.tora - 0.75) * 6) : 0);
        return <Euca key={i} p={[x, 0, z]} g={t >= T.agoraSim ? treeGrow(t, r, c) : t > T.cam + 0.05 ? 0 : 1} i={i} fall={t >= T.agoraSim ? 0 : fall} />;
      }
      return <Euca key={i} p={[x, 0, z]} g={treeGrow(t, r, c)} i={i} />;
    }))}
  </G>
);

// ---------------------------------------------------------------- tora suja (casca marrom com lama) e caminhão
const Log: React.FC<{ p: V3; len?: number; rad?: number; r?: V3; dirty?: number }> = ({ p, len = 12, rad = 0.9, r = [0, 0, PI / 2], dirty = 1 }) => (
  <G p={p} r={r}>
    <Cyl rt={rad} h={len} c={mixc(WOOD, BARK, dirty)} seg={9} />
    {dirty > 0.4 ? <>
      <Cyl rt={rad * 1.02} h={len * 0.25} p={[0, len * 0.18, 0]} c={BARK2} seg={9} cast={false} />
      <Cyl rt={rad * 1.02} h={len * 0.18} p={[0, -len * 0.26, 0]} c={BARK2} seg={9} cast={false} />
      <Cyl rt={rad * 1.01} h={len * 0.1} p={[0, 0, 0]} c="#8a6a44" seg={9} cast={false} />
    </> : null}
    <Cyl rt={rad * 0.86} h={0.06} p={[0, len / 2 + 0.03, 0]} c={WOOD} seg={9} cast={false} />
    <Cyl rt={rad * 0.86} h={0.06} p={[0, -len / 2 - 0.03, 0]} c={WOOD} seg={9} cast={false} />
  </G>
);
export const truckX = (t: number) => (t < T.cam ? -6 : t < T.soque1 ? lerp(-6, 40, ease(t, T.cam, T.soque1 - 0.1)) : t < T.ai2 - 0.4 ? 40 : lerp(40, 54, ease(t, T.ai2 - 0.4, T.ai2 + 0.9)));
export const Truck: React.FC<{ t: number }> = ({ t }) => {
  const x = truckX(t), moving = (t > T.cam && t < T.soque1) || t > T.ai2 - 0.4, wr = moving ? t * 8 : 0, load = t < T.ai2 + 0.8 ? 1 : 0.001, shown = t > T.flor - 0.2;
  const layers: [number, number[]][] = [[1.0, [-2.7, -0.9, 0.9, 2.7]], [2.6, [-1.8, 0, 1.8]], [4.1, [-0.9, 0.9]]];
  return (
    <G p={[x, 0, 8]} vis={shown}>
      <Box s={[17, 0.7, 6]} p={[-3.5, 1.6, 0]} c="#2f3a46" />
      <Box s={[5, 4.6, 5.6]} p={[8, 3.4, 0]} c={RED} /><Box s={[0.2, 2.2, 4.8]} p={[10.55, 4.0, 0]} c="#9fd8ff" cast={false} /><Box s={[5.2, 0.5, 5.8]} p={[8, 5.9, 0]} c="#b01818" />
      <Box s={[0.4, 4.4, 0.4]} p={[-11.7, 3.9, 2.7]} c={STEEL} /><Box s={[0.4, 4.4, 0.4]} p={[-11.7, 3.9, -2.7]} c={STEEL} /><Box s={[0.4, 4.4, 0.4]} p={[4.5, 3.9, 2.7]} c={STEEL} /><Box s={[0.4, 4.4, 0.4]} p={[4.5, 3.9, -2.7]} c={STEEL} />
      {[-9, -4, 8].map((wx) => [-1, 1].map((s) => <G key={`${wx}${s}`} p={[wx, 1.15, s * 2.9]} r={[wr, 0, 0]}><Cyl rt={1.15} h={0.8} r={[PI / 2, 0, 0]} c="#1c2026" seg={12} /><Cyl rt={0.55} h={0.85} r={[PI / 2, 0, 0]} c="#c3cbd3" seg={8} cast={false} /><Box s={[0.2, 0.2, 0.9]} p={[0, 0.7, 0]} c="#c3cbd3" cast={false} /></G>))}
      <G sc={load} p={[-3.5, 0, 0]}>
        {layers.map(([y, zs], li) => zs.map((z, k) => <Log key={`${li}${k}`} p={[0, 2.2 + y, z]} len={15.5} rad={0.95} />))}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- balde de polpa branca que a casca suja
export const Bucket: React.FC<{ t: number }> = ({ t }) => {
  const dirt = ease(t, T.soque1 + 0.4, T.suja + 1.2);
  return (
    <G p={[33, 0, 15]} vis={t > T.cam}>
      <Cyl rt={2.2} rb={1.7} h={3.6} p={[0, 1.8, 0]} c="#e8edf2" seg={14} o={{ side: "double" }} />
      <Cyl rt={2.05} h={0.12} p={[0, 3.2, 0]} c="#fbfbf6" seg={14} cast={false} />
      {Array.from({ length: 14 }, (_, i) => { const u = clamp(dirt * 14 - i), a = i * 2.4; return u > 0 ? <Sph key={i} rad={0.28} p={[Math.cos(a) * (0.3 + rnd(i) * 1.5), 3.3, Math.sin(a) * (0.3 + rnd(i) * 1.5)]} sc={[u, 0.35 * u, u]} c={i % 2 ? BARK : BARK2} ws={6} hs={4} cast={false} /> : null; })}
      <Spray t={t} t0={T.soque1} t1={T.z1 - 0.2} p={[0.2, 9, 0]} dir={[0, -1, 0]} spread={0.12} n={9} spd={5} g={-16} life={1.1} size={0.35} cols={[BARK, BARK2, "#8a6a44"]} />
    </G>
  );
};
export const DirtPuffs: React.FC<{ t: number }> = ({ t }) => (t > T.soque1 - 0.2 && t < T.z1 + 0.5 ? <G>
  <Puffs t={t} p={[38, 6.4, 9]} n={7} period={1.6} rise={4} size={1.3} c="#8a6a44" drift={[0.4, 0, 1.2]} />
  <Spray t={t} t0={T.soque1 - 0.2} t1={T.z1} p={[38, 6.6, 11]} dir={[0, 1, 0.8]} spread={0.7} n={24} spd={6} g={-14} life={1.2} size={0.5} cols={[BARK, BARK2, "#8a6a44", "#3a2a1a"]} floor={0.2} />
</G> : null);

// ---------------------------------------------------------------- tronco serrado (hook B e o «metade nem virou papel»)
export const SplitLog: React.FC<{ t: number; t0: number; p: V3 }> = ({ t, t0, p }) => {
  const u = t - t0; if (u < -0.3 || u > 4.2) return null;
  const sawX = lerp(-8, 8, prog(u, -0.15, 0.7)), cut = prog(u, 0.05, 0.7);
  const shrinkA = 1 - ease(u, 1.0, 2.0), riseB = ease(u, 0.55, 2.2), shrinkB = 1 - ease(u, 1.7, 2.7), sep = ease(u, 0.45, 0.9) * 1.4;
  const half = (ts: number, y: number, sc: number, flip: number) => (
    <G p={[0, y, 0]} sc={Math.max(0.001, sc)}>
      <Cyl rt={2.5} h={14} ts={ts} tl={PI} r={[0, 0, PI / 2]} c={BARK} seg={12} o={{ side: "double" }} />
      <Box s={[14, 0.06, 5]} c={WOOD} cast={false} p={[0, 0.02 * flip, 0]} />
    </G>
  );
  return (
    <G p={p}>
      <G p={[0, 2.5, 0]}>
        {half(PI, -sep * 0.15, shrinkA, 1)}
        {half(0, sep * 0.15 + 7 * riseB, shrinkB, -1)}
      </G>
      {u < 0.9 ? <G p={[sawX, 2.5, 1.2]}><G r={[0, u * 40, 0]}><Cyl rt={3.5} h={0.2} c="#dfe5ea" seg={18} o={{ metal: 0.5, rough: 0.3 }} />{[0, 1, 2, 3, 4, 5].map((k) => <Box key={k} s={[0.5, 0.25, 7.2]} r={[0, k * PI / 3, 0]} c="#9aa4ad" cast={false} />)}</G></G> : null}
      <Spray t={t} t0={t0 - 0.15} t1={t0 + 0.7} p={[sawX, 2.5, 3.2]} dir={[0, 0.6, 1]} spread={0.7} n={22} spd={9} g={-20} life={0.8} size={0.32} cols={["#f4e2b0", "#ffd870", "#fff2c8"]} shape="sph" floor={0.1} />
      {/* a metade que virou papel: a pilha de folhas cresce uma a uma ao lado do tronco */}
      {Array.from({ length: 16 }, (_, i) => { const a = t0 + 0.9 + i * 0.065, k = pk(t, a, 0.28); return k > 0.01 ? <Box key={i} s={[6.4, 0.14, 4.6]} p={[0.15 * Math.sin(i * 2.3), 0.35 + i * 0.17 + 3 * (1 - clamp(k)) ** 2, 6.4 + 0.2 * Math.cos(i * 1.7)]} r={[0, (rnd(i) - 0.5) * 0.12, 0]} sc={[1, Math.min(1, k), 1]} c="#ffffff" /> : null; })}
      {/* a outra metade some em fumaça */}
      <Puffs t={t} p={[0, 7, -1]} n={12} period={1.8} rise={11} size={1.5} c="#f2f4f7" on={ease(u, 1.0, 1.4) * (1 - ease(u, 3.4, 4.0))} drift={[2.5, 0, -1.2]} />
      <Puffs t={t} p={[0, 6, 1]} n={8} period={2.2} rise={9} size={1.1} c="#dfe3e8" on={ease(u, 1.3, 1.7) * (1 - ease(u, 3.4, 4.0))} drift={[-2.2, 0, 1.0]} o={0.4} />
    </G>
  );
};

// ---------------------------------------------------------------- descascador: tambor que gira, toras rolando, casca voando
export const Debarker: React.FC<{ t: number }> = ({ t }) => {
  const ang = t * 2.2, clean = ease(t, T.tambor + 0.6, T.arranca + 1.8);
  return (
    <G p={[DB, 0, 0]}>
      {[-9, 9].map((x) => <G key={x} p={[x, 0, 0]}><Box s={[2.4, 6, 12]} p={[0, 3, 0]} c="#3b4a6b" /><Box s={[3.2, 1, 13]} p={[0, 0.5, 0]} c={DARK} /></G>)}
      <G p={[0, 9, 0]}>
        <G r={[ang, 0, 0]}>
          {Array.from({ length: 14 }, (_, k) => { const a = (k / 14) * PI * 2; return <Box key={k} s={[24, 0.6, 2.0]} p={[0, Math.cos(a) * 6.4, Math.sin(a) * 6.4]} r={[a, 0, 0]} c={k % 2 ? "#e8501c" : "#c43a12"} />; })}
          {[-12, -4, 4, 12].map((x) => <Cyl key={x} rt={6.9} h={0.9} p={[x, 0, 0]} r={[0, 0, PI / 2]} c={STEEL} seg={20} o={{ side: "double", metal: 0.3 }} cast={false} open />)}
        </G>
        {/* toras caindo lá dentro, perdendo a casca */}
        {Array.from({ length: 7 }, (_, i) => { const ph = ang * 0.8 + i * 0.9, rr = 2.0 + 2.6 * Math.abs(Math.sin(i * 1.9 + 0.5)), y = Math.cos(ph) * rr * 0.9 + 0.4 * Math.sin(t * 6 + i), z = Math.sin(ph) * rr * 0.7; return <Log key={i} p={[(i - 3) * 2.8, y, z]} len={9} rad={0.8} r={[ph * 0.9 + i, 0, PI / 2 + 0.5 * Math.sin(t * 3 + i)]} dirty={1 - clean} />; })}
      </G>
      <Spray t={t} t0={T.tambor + 0.3} t1={T.descT + 1.4} p={[0, 15, 7]} dir={[0.15, 0.9, 0.7]} spread={0.55} n={34} spd={11} g={-18} life={1.5} size={0.7} cols={[BARK, BARK2, "#8a6a44", "#a47c4a"]} floor={0.15} />
      <Spray t={t} t0={T.arranca - 0.1} t1={T.descT + 1.4} p={[0, 7, 7.2]} dir={[0, 0.35, 1]} spread={0.5} n={28} spd={12} g={-18} life={1.4} size={0.75} cols={[BARK, BARK2, "#8a6a44", "#a47c4a"]} floor={0.15} seed={5} />
      <Spray t={t} t0={T.arranca - 0.1} t1={T.descT + 1.4} p={[-8, 14, 5]} dir={[-0.4, 0.8, 0.5]} spread={0.5} n={18} spd={10} g={-18} life={1.3} size={0.6} cols={[BARK, BARK2, "#a47c4a"]} floor={0.15} seed={9} />
      {t > T.tambor ? <Puffs t={t} p={[0, 12, 7]} n={7} period={1.8} rise={6} size={1.6} c="#b09068" drift={[1.2, 0, 1]} on={ease(t, T.tambor, T.tambor + 0.6) * (1 - ease(t, T.depois, T.depois + 1))} /> : null}
      {/* pilha de casca que cresce na frente */}
      <Sph rad={5} p={[4, 0, 12]} sc={[1.4 * ease(t, T.tambor + 0.2, T.depois), 0.55 * ease(t, T.tambor + 0.2, T.depois), 0.9 * ease(t, T.tambor + 0.2, T.depois)]} c={BARK} ws={9} hs={6} o={{ flat: true }} />
      {/* esteiras: toras sujas entrando, toras limpas saindo */}
      <Box s={[34, 1.0, 5]} p={[-30, 1.8, 0]} c="#3a4350" /><Box s={[34, 1.0, 5]} p={[40, 1.8, 0]} c="#3a4350" />
      {Array.from({ length: 7 }, (_, i) => { const x = -46 + ((t * 5 + i * 5.2) % 36); return x < -13 ? <Log key={i} p={[x, 3.0, 0]} len={4.4} rad={0.85} r={[PI / 2, 0, 0]} /> : null; })}
      {Array.from({ length: 8 }, (_, i) => { const x = 14 + ((t * 5 + i * 5.1) % 38); return <Log key={i} p={[x, 3.0, 0]} len={4.4} rad={0.85} r={[PI / 2, 0, 0]} dirty={0} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- picadora: toras entram, lascas jorram
export const Chipper: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.depois - 0.8, T.depois + 0.2), sh = on * 0.1 * Math.sin(t * 48), pile = ease(t, T.depois + 0.6, T.soque2 + 1.5);
  return (
    <G p={[CH, 0, 0]}>
      <G p={[0, sh, 0]}>
        <Box s={[16, 10, 11]} p={[0, 5, 0]} c="#e8501c" /><Box s={[16.6, 0.8, 11.6]} p={[0, 10.2, 0]} c="#b43a12" /><Box s={[17, 1.2, 12]} p={[0, 0.6, 0]} c={DARK} />
        <Cyl rt={4.7} h={0.5} p={[0, 5.2, 5.6]} r={[PI / 2, 0, 0]} c={DARK} seg={20} />
        <G p={[0, 5.2, 5.95]} r={[0, 0, t * 15 * on]}>
          <Cyl rt={4.1} h={0.3} r={[PI / 2, 0, 0]} c="#b7c0c8" seg={20} o={{ metal: 0.5, rough: 0.3 }} />
          {[0, 1, 2, 3, 4, 5].map((k) => <Box key={k} s={[3.6, 0.55, 0.3]} p={[Math.cos(k * PI / 3) * 2.0, Math.sin(k * PI / 3) * 2.0, 0.2]} r={[0, 0, k * PI / 3]} c="#f4f7fa" o={{ metal: 0.6 }} cast={false} />)}
          <Cyl rt={0.9} h={0.5} p={[0, 0, 0.3]} r={[PI / 2, 0, 0]} c={YEL} seg={10} cast={false} />
        </G>
        <Box s={[0.2, 3.6, 4.4]} p={[-8.1, 4, 0]} c="#10131a" cast={false} />
        <Pipe a={[3, 10, 0]} b={[10, 17, 0]} rad={1.5} c="#c43a12" cast={false} /><Cyl rt={1.8} h={1.2} p={[10.4, 17.4, 0]} r={[0, 0, -0.8]} c={STEEL} seg={10} cast={false} />
      </G>
      {Array.from({ length: 6 }, (_, i) => { const x = -34 + ((t * 5 + i * 6) % 38); return x < -9 ? <Log key={i} p={[x, 3.0, 0]} len={4.4} rad={0.85} r={[PI / 2, 0, 0]} dirty={0} /> : null; })}
      <Spray t={t} t0={T.depois + 0.2} t1={T.soque2 + 1.3} p={[10.8, 17.8, 0]} dir={[1, 0.5, 0.15]} spread={0.35} n={46} spd={13} g={-22} life={1.7} size={0.5} cols={[WOOD, WOOD2, "#f4e6b8"]} floor={0.2} />
      <Spray t={t} t0={T.lascas - 0.2} t1={T.picT + 1.8} p={[3, 3, 6.2]} dir={[0.4, 0.8, 1]} spread={0.6} n={26} spd={10} g={-20} life={1.2} size={0.45} cols={[WOOD, WOOD2, "#f4e6b8"]} floor={0.2} seed={3} />
      <Cone rad={7.2 * pile + 0.01} h={6 * pile + 0.01} p={[PILE - CH, 3 * pile, 2]} c={WOOD} seg={9} o={{ flat: true }} />
      <Sph rad={5 * pile + 0.01} p={[PILE - CH + 1.5, 0.2, 3.5]} sc={[1.6, 0.5, 1.2]} c={WOOD2} ws={8} hs={5} o={{ flat: true }} />
    </G>
  );
};

// ---------------------------------------------------------------- lupa: fibras coladas com lignina (rede âmbar) que depois se solta
export const MX = 150, MY = 36, MZ = -84;
export const Macro: React.FC<{ t: number }> = ({ t }) => {
  if (!((t >= T.colad - 0.1 && t < T.z2 - 0.1) || (t >= T.cola - 0.1 && t < T.digT))) return null;
  const net = ease(t, T.colad, T.colad + 0.7) * (1 - ease(t, T.cola + 0.1, T.cola + 1.0)), snap = prog(t, T.cola, T.cola + 0.9), free = ease(t, T.cola + 0.6, T.soltam + 1.0), brown = ease(t, T.soltam, T.marrom + 0.3);
  const FIB = 11, fc = (i: number) => mixc("#f3e8cc", "#9a6b3a", brown * (0.5 + 0.5 * rnd(i)));
  return (
    <G p={[MX, MY, MZ]}>
      <Cyl rt={24} h={1.2} p={[0, 0, -5]} r={[PI / 2, 0, 0]} c="#10303f" seg={28} cast={false} />
      <Torus p={[0, 0, -4.2]} rad={24} tube={1.1} c="#ffd400" />
      <Cyl rt={2.2} h={16} p={[19, -26, -4.2]} r={[0, 0, 0.78]} c="#ffd400" seg={8} cast={false} />
      <G p={[-14, -15, -1]} r={[0.2, 0.3, 0.35]}><Box s={[11, 4.4, 3.4]} c={WOOD2} /><Box s={[11.2, 0.5, 3.6]} p={[0, 2.2, 0]} c={WOOD} cast={false} /><Box s={[11.2, 0.5, 3.6]} p={[0, -1.0, 0]} c={BARK2} cast={false} /></G>
      {Array.from({ length: FIB }, (_, i) => {
        const x0 = -9 + i * 1.8 + (rnd(i) - 0.5) * 0.8, z0 = (i % 3) * 1.6 - 2.4, wob = free * (3 * Math.sin(t * 1.3 + i * 1.7)), dy = free * 6 * Math.sin(t * 0.9 + i * 2.1), tilt = 0.12 * Math.sin(i * 2.7) + free * 0.5 * Math.sin(t * 0.8 + i);
        return <Cyl key={i} rt={0.62} h={30} p={[x0 + wob, dy, z0 + free * 2 * Math.sin(i)]} r={[0, 0, tilt]} c={fc(i)} seg={8} o={{ rough: 0.5 }} cast={false} />;
      })}
      {/* a cola: nós âmbar e barras que ligam uma fibra à outra; a rede estala e vira gotas */}
      {net > 0.01 ? <G>
        {Array.from({ length: FIB - 1 }, (_, i) => Array.from({ length: 6 }, (_, j) => {
          const xa = -9 + i * 1.8 + (rnd(i) - 0.5) * 0.8, xb = -9 + (i + 1) * 1.8 + (rnd(i + 1) - 0.5) * 0.8, y = -11 + j * 4.4 + ((i % 2) * 2.2), z = ((i % 3) * 1.6 - 2.4 + ((i + 1) % 3) * 1.6 - 2.4) / 2, st = 1 + snap * 1.6, vis = (1 - snap) * net;
          return <G key={`${i}${j}`} p={[(xa + xb) / 2, y + snap * 4 * (rnd(i * 7 + j) - 0.5), z]} sc={Math.max(0.001, vis)}>
            <Box s={[(xb - xa) * st, 0.5, 0.5]} c={AMBER} o={{ emissive: "#ff9a10", ei: 0.35, opacity: 0.9 }} cast={false} />
            <Sph rad={0.7} p={[-(xb - xa) / 2, 0, 0]} c="#ffcb4a" ws={6} hs={4} o={{ emissive: "#ff9a10", ei: 0.4 }} cast={false} />
          </G>;
        }))}
      </G> : null}
      {snap > 0 && snap < 1 ? <Spray t={t} t0={T.cola} t1={T.cola + 0.7} p={[0, 0, 4]} dir={[0, 0.2, 1]} spread={1.0} n={40} spd={9} g={-4} life={1.2} size={0.55} cols={[AMBER, "#ffcb4a", "#fff0a0"]} shape="sph" /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- digestor: a panela de pressão gigante
export const Digester: React.FC<{ t: number }> = ({ t }) => {
  const heat = ease(t, T.panela, T.quente + 1.6), chem = ease(t, T.quim, T.quim + 0.5), cook = ease(t, T.quente + 0.6, T.cola + 0.6), tint = ease(t, T.cola, T.marrom + 0.2);
  const rattle = 0.07 * heat * Math.sin(t * 38), needle = -2.35 + 3.9 * heat;
  const inX = DX - 5.2;
  return (
    <G p={[DX, 0, 0]}>
      <Box s={[16, 1.4, 16]} p={[0, 0.7, 0]} c={DARK} />
      <G p={[rattle, 0, 0]}>
        <Cyl rt={5.5} h={26} p={[0, 14, 0]} c="#b9c3cc" seg={20} o={{ metal: 0.35, rough: 0.4 }} />
        <Sph rad={5.5} p={[0, 27, 0]} sc={[1, 0.7, 1]} c="#b9c3cc" ws={20} hs={10} o={{ metal: 0.35, rough: 0.4 }} />
        {[5, 14, 23].map((y) => <Cyl key={y} rt={5.65} h={0.7} p={[0, y, 0]} c="#5f6a75" seg={20} cast={false} />)}
        <Cyl rt={0.9} h={2.2} p={[0, 31.2, 0]} c={RED} seg={8} />
        {/* janela redonda: fibras e bolhas na água quente */}
        <Cyl rt={3.6} h={0.7} p={[0, 12, 5.35]} r={[PI / 2, 0, 0]} c="#2b2f36" seg={20} />
        <Cyl rt={3.1} h={0.3} p={[0, 12, 5.75]} r={[PI / 2, 0, 0]} c={mixc(mixc("#f0d9a0", "#d6a44a", cook * 0.8), "#6a3d18", tint)} seg={20} cast={false} />
        {Array.from({ length: 12 }, (_, i) => { const a = t * (0.7 + 0.3 * rnd(i)) + i * 1.9, rr = 0.6 + 2.0 * rnd(i + 2); return <Box key={i} s={[0.9, 0.18, 0.2]} p={[Math.cos(a) * rr, 12 + Math.sin(a * 1.3) * rr * 0.8, 6.05]} r={[0, 0, a * 2]} c={mixc("#fff4d8", "#9a6b3a", tint)} cast={false} />; })}
        {Array.from({ length: 9 }, (_, i) => { const u = fract(t * (0.5 + 0.4 * heat) + i / 9); return <Sph key={i} rad={0.28 + 0.12 * rnd(i)} p={[-2.4 + (i % 5) * 1.2, 9.6 + u * 4.8, 6.1]} sc={heat * (1 - 0.3 * u) + 0.001} c="#ffffff" o={{ opacity: 0.85 }} ws={6} hs={4} cast={false} />; })}
        {/* manômetro: o ponteiro sobe até o vermelho */}
        <Cyl rt={2.0} h={0.5} p={[0, 20, 5.5]} r={[PI / 2, 0, 0]} c="#f8f8f4" seg={20} />
        <Torus p={[0, 20, 5.8]} rad={1.7} tube={0.28} arc={PI * 0.55} r={[0, 0, PI * 0.12]} c="#e0262b" />
        <G p={[0, 20, 5.9]} r={[0, 0, -needle]}><Box s={[0.22, 1.7, 0.12]} p={[0, 0.8, 0]} c="#10131a" cast={false} /></G>
        <Sph rad={0.25} p={[0, 20, 6.0]} c="#10131a" ws={6} hs={4} cast={false} />
      </G>
      {/* água quente (azul vira laranja), produto químico (verde-limão), lascas pela esteira */}
      <Duct a={[-16, 14, 0]} b={[-5.4, 14, 0]} rad={0.9} o={0.5} />
      <Flow pts={[[-16, 14, 0], [-5.4, 14, 0]]} t={t} t0={T.quente - 0.1} spd={14} gap={2.2} rad={0.55} c="#7fd0ff" c2="#ff8a3a" glow />
      <Puffs t={t} p={[inX, 14, 0.5]} n={6} period={1.4} rise={5} size={1.2} c="#ffffff" on={ease(t, T.quente - 0.1, T.quente + 0.3)} drift={[-1.5, 0, 1]} />
      <Cyl rt={2.5} h={7} p={[-16, 3.5, -6]} c="#3d8fd6" seg={14} /><Cone rad={2.7} h={1.4} p={[-16, 7.6, -6]} c="#2b6fb0" seg={14} />
      <Pipe a={[-16, 6, -6]} b={[-16, 14, -3]} rad={0.7} c={STEEL} cast={false} /><Pipe a={[-16, 14, -3]} b={[-16, 14, 0]} rad={0.7} c={STEEL} cast={false} />
      <Cyl rt={2.4} h={5.4} p={[-18, 2.7, 6]} c="#8bd62e" seg={14} /><Cyl rt={2.5} h={0.6} p={[-18, 5.7, 6]} c="#5ea01a" seg={14} cast={false} />
      <Pipe a={[-18, 5.5, 6]} b={[-18, 34, 5]} rad={0.7} c={STEEL} cast={false} /><Pipe a={[-18, 34, 5]} b={[-1.5, 33.5, 1]} rad={0.7} c={STEEL} cast={false} /><Pipe a={[-1.5, 33.5, 1]} b={[0, 31.6, 0]} rad={0.7} c={STEEL} cast={false} />
      <Flow pts={[[-18, 5.5, 6], [-18, 34, 5], [-1.5, 33.5, 1], [0, 31.6, 0]]} t={t} t0={T.quim - 0.1} t1={T.cola + 0.2} spd={16} gap={2.4} rad={0.5} c="#baf24a" glow />
      <G p={[0, 33, 0]} sc={chem}><Sph rad={1.5} p={[0, 0.5, 0]} c="#baf24a" ws={8} hs={6} cast={false} o={{ emissive: "#8bd62e", ei: 0.5, opacity: 0.8 }} /></G>
      <G p={[-22, 14.7, 4]} r={[0, 0, 0.69]}><Box s={[41.6, 0.7, 3.6]} c="#3a4350" /><Box s={[41.6, 1.1, 0.4]} p={[0, 0.5, 1.8]} c={STEEL} cast={false} /><Box s={[41.6, 1.1, 0.4]} p={[0, 0.5, -1.8]} c={STEEL} cast={false} /></G>
      {Array.from({ length: 12 }, (_, i) => { const s = ((t * 3.1 + i * 0.083) % 1), P0: V3 = [-38, 1.4, 6], P1: V3 = [-6, 28, 2]; return <Box key={i} s={[1.3, 0.8, 1.1]} p={[lerp(P0[0], P1[0], s), lerp(P0[1], P1[1], s) + 1.2, lerp(P0[2], P1[2], s)]} r={[t * 2 + i, t, 0]} c={i % 2 ? WOOD : WOOD2} cast={false} />; })}
      {/* saída: a massa marrom desce pelo cano até o tanque */}
      <Duct a={[5, 2.6, 2]} b={[30, 2.6, 2]} rad={1.1} o={0.5} />
      <Flow pts={[[5, 2.6, 2], [30, 2.6, 2]]} t={t} t0={T.soque3 - 0.3} spd={13} gap={2.2} rad={0.7} c={PULP} />
      <Cyl rt={4.6} h={6.5} p={[34, 3.25, 2]} c="#cdbb9c" seg={16} /><Cyl rt={4.2} h={0.2} p={[34, 6.3, 2]} c={PULP} seg={16} cast={false} o={{ rough: 0.2 }} />
      <Puffs t={t} p={[0, 31, 0]} n={7} period={2.2} rise={9} size={2.0} c="#ffffff" on={heat} drift={[1.6, 0, 0.6]} />
    </G>
  );
};

// ---------------------------------------------------------------- caldo escuro (licor preto) saindo do digestor
export const BlackTank: React.FC<{ t: number }> = ({ t }) => {
  const f = ease(t, T.soque5, T.caldo + 1.0), lv = 0.4 + 5.6 * f;
  return (
    <G p={[BKX, 0, -16]}>
      <Cyl rt={5.2} h={7} p={[0, 3.5, 0]} c="#2b3038" seg={18} o={{ side: "double", metal: 0.3, rough: 0.35 }} />
      <Cyl rt={4.9} h={0.3} p={[0, 0.5 + lv, 0]} c="#0b0c10" seg={18} cast={false} o={{ rough: 0.1, metal: 0.4 }} />
      <Torus p={[0, 7.0, 0]} r={[PI / 2, 0, 0]} rad={5.2} tube={0.35} c="#ffb21a" o={{ emissive: "#ff9a10", ei: 0.5 }} />
      {Array.from({ length: 8 }, (_, i) => <Sph key={i} rad={0.32} p={[Math.cos(i * 2.1 + t * 0.5) * (1.2 + (i % 3) * 1.2), 0.8 + lv + 0.1 * Math.sin(t * 3 + i), Math.sin(i * 2.1 + t * 0.5) * (1.2 + (i % 3) * 1.2)]} c={i % 2 ? AMBER : "#baf24a"} o={{ emissive: i % 2 ? "#ff9a10" : "#8bd62e", ei: 0.6 }} ws={6} hs={4} cast={false} sc={ease(t, i % 2 ? T.licor : T.quim2, (i % 2 ? T.licor : T.quim2) + 0.3)} />)}
      <Puffs t={t} p={[0, 7.4, 0]} n={4} period={2} rise={3} size={1.2} c="#3a3e46" on={f} />
    </G>
  );
};
export const BlackPipe: React.FC<{ t: number }> = ({ t }) => (
  <G>
    <Duct a={[DX + 5, 3.4, -2]} b={[BKX - 6, 3.4, -9]} rad={1.0} o={0.5} c="#7d848c" />
    <Duct a={[BKX - 6, 3.4, -9]} b={[BKX - 5, 3.4, -14]} rad={1.0} o={0.5} c="#7d848c" />
    <Flow pts={[[DX + 5, 3.4, -2], [BKX - 6, 3.4, -9], [BKX - 5, 3.4, -14]]} t={t} t0={T.soque5 + 0.2} spd={10} gap={2.4} rad={0.8} c="#101216" />
  </G>
);

// ---------------------------------------------------------------- lavagem e torre de branqueamento (marrom vira branco, de baixo para cima)
export const Bleach: React.FC<{ t: number }> = ({ t }) => {
  const front = prog(t, T.clar - 0.4, T.torT + 0.7) * 1.45, on = ease(t, T.ent2 - 0.2, T.ent2 + 0.3), wash = ease(t, T.lavada - 0.1, T.lavada + 0.4);
  return (
    <G>
      {WSH.map((x, k) => <G key={x} p={[x, 0, 0]}>
        <Box s={[2, 5, 8]} p={[-5.2, 2.5, 0]} c="#3b4a6b" /><Box s={[2, 5, 8]} p={[5.2, 2.5, 0]} c="#3b4a6b" />
        <G p={[0, 5.2, 0]} r={[t * 3 * (k ? -1 : 1), 0, 0]}>
          <Cyl rt={3.3} h={9.4} r={[0, 0, PI / 2]} c={mixc(PULP, "#d8d2c4", wash * (0.4 + 0.3 * k))} seg={14} o={{ rough: 0.9 }} />
          {[0, 1, 2, 3, 4, 5].map((q) => <Box key={q} s={[9.6, 0.3, 0.5]} p={[0, Math.cos(q * PI / 3) * 3.4, Math.sin(q * PI / 3) * 3.4]} r={[q * PI / 3, 0, 0]} c="#b9c3cc" cast={false} />)}
        </G>
        <Pipe a={[-3, 11.5, -1.5]} b={[3, 11.5, -1.5]} rad={0.5} c={STEEL} cast={false} />
        <Spray t={t} t0={T.lavada - 0.1} t1={T.torT} p={[0, 11.3, -1.0]} dir={[0, -1, 0.2]} spread={0.35} n={20} spd={6} g={-16} life={0.9} size={0.35} cols={["#9fd8ff", "#d6f0ff", "#ffffff"]} shape="sph" seed={k} />
        <Puffs t={t} p={[0, 8.6, 3]} n={5} period={1.5} rise={3} size={1.4} c="#ffffff" on={wash} drift={[0.4, 0, 1]} o={k * 0.3} />
        <Box s={[10, 0.4, 7]} p={[0, 0.2, 0]} c={CONC} />
      </G>)}
      <Duct a={[DX + 30, 2.6, 2]} b={[WSH[0] - 5, 2.6, 2]} rad={1.0} o={0.5} />
      <Flow pts={[[DX + 30, 2.6, 2], [WSH[0] - 5, 2.6, 2]]} t={t} t0={T.marrom} spd={12} gap={2.2} rad={0.65} c={PULP} />
      <Duct a={[WSH[0] + 5, 2.6, 2]} b={[WSH[1] - 5, 2.6, 2]} rad={1.0} o={0.5} /><Duct a={[WSH[1] + 5, 2.6, 2]} b={[TW - 5.2, 2.6, 2]} rad={1.0} o={0.5} />
      <Flow pts={[[WSH[0] + 5, 2.6, 2], [WSH[1] - 5, 2.6, 2], [WSH[1] + 5, 2.6, 2], [TW - 5.2, 2.6, 2]]} t={t} t0={T.lavada} spd={12} gap={2.2} rad={0.65} c={PULP} />
      {/* a torre */}
      <G p={[TW, 0, 0]}>
        <Box s={[16, 1.2, 14]} p={[0, 0.6, 0]} c={DARK} />
        <Cyl rt={5.2} h={36} p={[0, 19, 0]} c="#eef1f4" seg={20} o={{ rough: 0.5 }} />
        {[8, 18, 28].map((y) => <Cyl key={y} rt={5.35} h={0.6} p={[0, y, 0]} c="#9aa4ad" seg={20} cast={false} />)}
        <Cone rad={5.6} h={5} p={[0, 40.4, 0]} c="#cfd6dc" seg={20} />
        <Box s={[4.4, 31, 0.5]} p={[0, 19.5, 5.05]} c="#2b2f36" />
        {Array.from({ length: 15 }, (_, i) => { const h = i / 14, w = clamp((front - h) / 0.35); return <Box key={i} s={[3.8, 2.0, 0.4]} p={[0, 5.2 + i * 2.0, 5.35]} c={mixc("#8a5a2c", "#ffffff", w)} cast={false} o={{ emissive: "#ffffff", ei: 0.25 * w }} />; })}
        {/* bolhas de cloro subindo */}
        {Array.from({ length: 8 }, (_, i) => { const u = fract(t * 0.5 + i / 8); return <Sph key={i} rad={0.3} p={[-1.4 + (i % 4) * 0.9, 5 + u * 28, 5.7]} sc={on * (1 - 0.3 * u) + 0.001} c="#dff3ff" ws={6} hs={4} cast={false} />; })}
        <Puffs t={t} p={[0, 43, 0]} n={7} period={2} rise={8} size={1.8} c="#ffffff" on={on} drift={[1.4, 0, 0.4]} />
        <Cyl rt={2.0} h={4.4} p={[-10, 2.2, 8]} c="#7fd0ff" seg={12} /><Pipe a={[-10, 4.4, 8]} b={[-5.0, 10, 4]} rad={0.5} c={STEEL} cast={false} />
      </G>
      <Duct a={[TW + 5, 2.6, 2]} b={[WPX - 6, 2.6, 2]} rad={1.0} o={0.5} c="#ffffff" />
      <Flow pts={[[TW + 5, 2.6, 2], [WPX - 6, 2.6, 2]]} t={t} t0={T.torT - 0.3} spd={12} gap={2.2} rad={0.65} c="#ffffff" />
    </G>
  );
};

// ---------------------------------------------------------------- tanque de polpa: quase só água; e a bandeja que não vira folha
export const WaterTank: React.FC<{ t: number }> = ({ t }) => {
  const f = ease(t, T.torT, T.mas4 + 0.4), pour = ease(t, T.folha - 0.1, T.folha + 0.3) * (1 - ease(t, T.z4 + 0.9, T.z4 + 1.3)), puddle = ease(t, T.folha + 0.1, T.folha + 1.8);
  return (
    <G p={[WPX, 0, 0]}>
      <Box s={[14, 1, 11]} p={[0, 0.5, 0]} c={DARK} />
      <Box s={[12, 8, 9]} p={[0, 5, 0]} c={GLASS} o={{ opacity: 0.2, depthWrite: false }} cast={false} />
      <Box s={[11.6, 6.6, 8.6]} p={[0, 4.4 + 0.0, 0]} c={mixc("#e9f6ff", "#9fd8ff", ease(t, T.mas4, T.agua + 0.5))} o={{ opacity: 0.5, depthWrite: false }} cast={false} />
      {Array.from({ length: 16 }, (_, i) => { const a = t * (0.5 + 0.3 * rnd(i)) + i * 1.3; return <Box key={i} s={[0.7, 0.14, 0.16]} p={[Math.cos(a) * (1 + 4 * rnd(i + 3)), 2.5 + 3.5 * rnd(i + 5) + 0.3 * Math.sin(a * 2), Math.sin(a) * (1 + 3 * rnd(i + 7))]} r={[a, a * 1.3, 0]} c="#ffffff" cast={false} />; })}
      {[[-5.8, -4.3], [5.8, -4.3], [-5.8, 4.3], [5.8, 4.3]].map(([x, z], i) => <Box key={i} s={[0.4, 8.6, 0.4]} p={[x, 4.6, z]} c={STEEL} />)}
      <Box s={[12.6, 0.4, 9.6]} p={[0, 9.1, 0]} c={STEEL2} />
      {Array.from({ length: 5 }, (_, i) => { const u = fract(t * 0.35 + i / 5); return <Sph key={i} rad={0.35} p={[-3 + i * 1.5, 1.5 + u * 6.4, 4.4]} sc={f * (1 - 0.3 * u) + 0.001} c="#ffffff" o={{ opacity: 0.8 }} ws={6} hs={4} cast={false} />; })}
      {/* bica e bandeja: a água escorre e não forma folha nenhuma */}
      <Pipe a={[0, 2.2, 4.5]} b={[0, 2.2, 9]} rad={0.6} c={STEEL} cast={false} /><Cyl rt={0.55 * pour + 0.01} h={4.8} p={[0, 0.2 + 1.2, 11.5]} c="#9fd8ff" seg={8} cast={false} o={{ opacity: 0.8, emissive: "#9fd8ff", ei: 0.3 }} vis={pour > 0.01} />
      <Box s={[10, 0.5, 7]} p={[0, 0.6, 15]} c="#f6f8fa" />
      <Cyl rt={7 * puddle + 0.01} h={0.1} p={[0, 0.9, 15]} c="#8fd0ff" seg={20} cast={false} o={{ opacity: 0.8 }} />
      <Spray t={t} t0={T.folha + 0.1} t1={T.z4 + 0.9} p={[0, 1.2, 14]} dir={[0, 1, 0.3]} spread={0.9} n={26} spd={7} g={-16} life={0.9} size={0.3} cols={["#9fd8ff", "#ffffff"]} shape="sph" floor={0.5} />
    </G>
  );
};
