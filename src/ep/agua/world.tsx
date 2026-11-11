// Mundo do MEP6 (Mundo em Peças): a água do rio ao copo, numa estação de tratamento de brinquedo, em corte.
// Eixo x = caminho da água: rio barrento (x≈-51, corre em z) → captação com grade (x=-42) → floculador + decantador
// (x -30..-6, frente de vidro) → filtro em camadas (x -2..10) → casa do cloro e tanque de contato (x 14..26) → bomba →
// morro com a caixa d'água (x≈40, y 14..20) → cano que desce até as casas (x 54..74) → torneira gigante e o copo (x≈82).
import React, { useMemo } from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky, Trees } from "../../toy/scenery";
import { T } from "./cues";

const PI = Math.PI;
const CONC = "#abb3b1", CONC2 = "#959d9b", MUD = "#8a6a3e", MUD2 = "#a8895a", CLEAR = "#3a97d6", GLASS = "#bfe6ff";
const GROUND: GroundPal = { base: "#7cc94a", patch: ["#6fbe40", "#8ad457", "#74c246"], blade: "#4fa82e", flowers: ["#ffe14a", "#ffffff", "#ff8fb1"], x: [-100, 110], z: [-60, 60], nBlades: 420 };
const mix = (a: string, b: string, u: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], clamp(u))).toString(16).padStart(2, "0")).join(""); };

const st = (t: number) => ({
  grate: ease(t, T.grade, T.grade + 0.6),
  debris: ease(t, T.so - 0.2, T.so + 0.6),
  floc: ease(t, T.produto, T.flocos + 0.4),
  sink: ease(t, T.quieta, T.decantador),
  sand: ease(t, T.camadas - 0.2, T.peneira),
  clog: ease(t, T.filtro + 0.6, T.entope + 0.8) * (1 - ease(t, T.debaixo, T.lava + 0.8)),
  back: ease(t, T.debaixo - 0.2, T.debaixo + 0.3) * (1 - ease(t, T.lava + 0.8, T.lava + 1.4)),
  bugs: ease(t, T.parece, T.parece + 0.5) * (1 - ease(t, T.cloro + 0.3, T.fluor)),
  chlor: ease(t, T.cloro - 0.1, T.cloro + 0.4),
  pump: ease(t, T.bombeia - 0.2, T.bombeia + 0.4),
  tower: ease(t, T.bombeia + 0.2, T.desce),
  houses: ease(t, T.desce, T.reservatorio),
  leak: ease(t, T.caminho, T.caminho + 0.6) * (1 - ease(t, T.tiquinho + 0.6, T.agoraSim)),
  resid: ease(t, T.tiquinho, T.tiquinho + 0.6),
  glass: ease(t, T.agoraSim - 0.3, T.copo),
});
type S = ReturnType<typeof st>;

// ---------------------------------------------------------------- partículas que andam numa faixa
const Streaks: React.FC<{ a: V3; L: number; w: number; t: number; speed?: number; dir?: "x" | "z"; c?: string; n?: number }> = ({ a, L, w, t, speed = 2.4, dir = "x", c = "#eaf7ff", n = 10 }) => (
  <G p={a}>
    {Array.from({ length: n }, (_, i) => { const u = fract(rnd(i) + (t * speed) / L), off = (rnd(i + 9) - 0.5) * w * 0.8;
      return <Box key={i} s={dir === "x" ? [1.1, 0.04, 0.12] : [0.12, 0.04, 1.1]} p={dir === "x" ? [u * L, 0.06, off] : [off, 0.06, u * L]} c={c} cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.25 }} />; })}
  </G>
);

// ---------------------------------------------------------------- rio barrento com lixo descendo e a captação com grade
const River: React.FC<{ t: number; s: S }> = ({ t, s }) => (
  <G>
    <Box s={[14, 0.3, 200]} p={[-51, 0.15, 0]} c="#8a8150" o={{ rough: 0.1, metal: 0.15 }} cast={false} />
    <Box s={[19, 0.2, 200]} p={[-51, 0.05, 0]} c="#e6cf98" cast={false} />
    <Streaks a={[-51, 0.3, -100]} L={200} w={12} t={t} dir="z" speed={4} n={90} c="#c7d6b0" />
    {Array.from({ length: 30 }, (_, i) => { const z = -60 + fract(rnd(i) + t * 0.03) * 120; return <Sph key={i} rad={0.5} p={[-51 + (rnd(i + 4) - 0.5) * 11, 0.3 + 0.12 * Math.sin(t * 3 + i), z]} sc={[1.4, 0.25, 0.8]} c="#b8996a" cast={false} ws={6} hs={4} />; })}
    {/* galhos, folhas e garrafas descendo o rio; com a grade, ficam presos nela */}
    {s.debris > 0.01 ? Array.from({ length: 12 }, (_, i) => {
      const free = fract(rnd(i) + t * 0.09), z = lerp(-40, 40, free), held = s.grate > 0.5 && z > -2 && z < 6;
      const p: V3 = held ? [-44.3, 0.6, -3 + (i % 6) * 1.6] : [-51 + (rnd(i + 3) - 0.5) * 9, 0.5, z];
      const kind = i % 3;
      return <G key={i} p={p} r={[0, rnd(i) * 6 + t * 0.3, 0]} sc={s.debris}>
        {kind === 0 ? <Cyl rt={0.22} h={2.6} r={[0, 0, PI / 2]} c="#7a4a2a" seg={6} /> : kind === 1 ? <Box s={[1.0, 0.08, 0.6]} c="#4fb236" /> : <Cyl rt={0.3} h={1.0} r={[0, 0, PI / 2]} c="#7cd0ff" seg={8} o={{ opacity: 0.85 }} />}
      </G>;
    }) : null}
    {/* captação: caixa de concreto + grade de barras */}
    <Box s={[4, 3.2, 10]} p={[-42, 1.6, 0]} c={CONC} />
    <G vis={s.grate > 0.01}>{Array.from({ length: 9 }, (_, k) => <Box key={k} s={[0.22, 3.4 * s.grate, 0.22]} p={[-44.15, 1.7 * s.grate, -4 + k]} c="#3b4a5a" />)}<Box s={[0.3, 0.3, 9.6]} p={[-44.15, 3.3 * s.grate, 0]} c="#3b4a5a" /></G>
    <Pipe a={[-40, 1.2, 0]} b={[-30.2, 1.2, 0]} rad={0.7} c="#9aa3a6" />
  </G>
);

// ---------------------------------------------------------------- floculador + decantador (frente de vidro)
const NF = 70;
const Decanter: React.FC<{ t: number; s: S }> = ({ t, s }) => {
  const flocs = useMemo(() => Array.from({ length: NF }, (_, i) => ({ x: -29 + rnd(i) * 22, y: 0.9 + rnd(i + 1) * 3.6, z: -4.5 + rnd(i + 2) * 9, r: 0.18 + rnd(i + 3) * 0.2 })), []);
  const top = mix(MUD, "#6fb4e0", s.sink), low = mix(MUD, "#9a7a4a", s.floc);
  return (
    <G>
      <Box s={[24, 0.4, 11]} p={[-18, 0.2, 0]} c={CONC2} />
      <Box s={[24, 5.4, 0.4]} p={[-18, 2.7, -5.5]} c={CONC} /><Box s={[0.4, 5.4, 11]} p={[-30, 2.7, 0]} c={CONC} /><Box s={[0.4, 5.4, 11]} p={[-6, 2.7, 0]} c={CONC} />
      <Box s={[0.3, 5.4, 11]} p={[-22, 2.7, 0]} c={CONC2} sc={[1, 0.7, 1]} />
      {/* água: barrenta embaixo, clareando em cima conforme os flocos afundam */}
      <Box s={[23.4, 4.6 * (1 - 0.35 * s.sink), 10.4]} p={[-18, 0.4 + 4.6 * (1 - 0.35 * s.sink) / 2 + 4.6 * 0.35 * s.sink, 0]} c={top} o={{ opacity: 0.82, rough: 0.2 }} cast={false} />
      <Box s={[23.4, 4.6 * 0.35 * s.sink + 0.01, 10.4]} p={[-18, 0.4 + 4.6 * 0.35 * s.sink / 2, 0]} c={low} o={{ opacity: 0.9 }} cast={false} />
      {/* lodo no fundo */}
      <Box s={[23.4, 0.9 * s.sink + 0.01, 10.4]} p={[-18, 0.45 + 0.45 * s.sink, 0]} c="#6b4a28" cast={false} />
      {/* pás do floculador girando */}
      <G p={[-26, 2.6, 0]} r={[0, 0, t * (s.floc > 0.01 ? 2.2 : 0.3)]}>{[0, 1, 2, 3].map((k) => <Box key={k} s={[0.25, 3.6, 7]} r={[0, 0, (k * PI) / 4]} c="#ff8a1a" />)}<Cyl rt={0.25} h={10} r={[PI / 2, 0, 0]} c="#5b6670" seg={8} /></G>
      {/* flocos: nascem do barro (crescem) e afundam */}
      {s.floc > 0.01 ? flocs.map((f, i) => { const y = lerp(f.y, 0.6 + rnd(i + 7) * 0.5, clamp(s.sink * 1.2 - rnd(i + 5) * 0.2)), wob = Math.sin(t * 2 + i) * 0.15 * (1 - s.sink);
        return <Sph key={i} rad={f.r * (0.4 + 0.9 * s.floc)} p={[f.x + wob, y, f.z]} c={i % 2 ? "#6b4a28" : "#8a6038"} ws={7} hs={5} o={{ flat: true }} />; }) : null}
      {/* vidro da frente */}
      <Box s={[24, 5.4, 0.12]} p={[-18, 2.7, 5.5]} c={GLASS} o={{ opacity: 0.18 }} cast={false} />
      <Box s={[24.2, 0.35, 0.5]} p={[-18, 5.5, 5.5]} c={CONC} /><Box s={[24.2, 0.35, 0.5]} p={[-18, 5.5, -5.5]} c={CONC} />
      <Pipe a={[-6, 4.4, 0]} b={[-2.2, 4.4, 0]} rad={0.6} c="#9aa3a6" />
    </G>
  );
};

// ---------------------------------------------------------------- filtro em camadas (corte): pedra, areia, água; entope e é lavado de baixo pra cima
const Filter: React.FC<{ t: number; s: S }> = ({ t, s }) => (
  <G p={[4, 0, 0]}>
    <Box s={[12, 0.4, 10]} p={[0, 0.2, 0]} c={CONC2} />
    <Box s={[12, 7, 0.4]} p={[0, 3.5, -5]} c={CONC} /><Box s={[0.4, 7, 10]} p={[-6, 3.5, 0]} c={CONC} /><Box s={[0.4, 7, 10]} p={[6, 3.5, 0]} c={CONC} />
    <G sc={[1, Math.max(0.01, s.sand), 1]}>
      {/* pedra (cascalho) */}
      {Array.from({ length: 40 }, (_, i) => <Sph key={i} rad={0.45} p={[-5.3 + (i % 10) * 1.18, 0.75 + Math.floor(i / 10) * 0.3, -4 + rnd(i) * 8]} c={i % 2 ? "#8a8f94" : "#6b7680"} ws={6} hs={4} o={{ flat: true }} />)}
      {/* areia */}
      <Box s={[11.4, 2.2, 9.4]} p={[0, 2.7, 0]} c="#e6c98e" />
      {/* sujeira presa no alto da areia */}
      <Box s={[11.4, 0.9 * s.clog + 0.01, 9.4]} p={[0, 3.8 + 0.45 * s.clog, 0]} c="#7a5a32" vis={s.clog > 0.02} />
    </G>
    {/* água em cima: limpa descendo; na lavagem, sobe barrenta e transborda na calha */}
    <Box s={[11.4, 2.2, 9.4]} p={[0, 5.1, 0]} c={s.back > 0.05 ? "#9a7a4a" : "#6fb4e0"} o={{ opacity: 0.75 }} cast={false} />
    {s.back > 0.01 ? Array.from({ length: 24 }, (_, i) => { const u = fract(t * 1.2 + rnd(i)); return <Sph key={i} rad={0.2} p={[-5 + rnd(i + 2) * 10, 0.8 + u * 5.6, -3 + rnd(i + 4) * 7]} c="#ffffff" o={{ opacity: 0.85 }} cast={false} sc={s.back} ws={6} hs={4} />; }) : null}
    {s.back > 0.01 ? [-3, 0, 3].map((x, i) => <Cone key={i} rad={0.6} h={1.4} seg={6} p={[x, 2 + fract(t * 1.4 + i * 0.3) * 3, 5.2]} c="#2fb4ff" o={{ emissive: "#2fb4ff", ei: 0.6 }} sc={s.back} cast={false} />) : null}
    <Puffs t={t} p={[6.4, 6.6, 0]} n={6} period={1.2} rise={1.5} size={0.6} c="#9a7a4a" on={s.back} drift={[2, -1, 0]} />
    <Box s={[12, 7, 0.12]} p={[0, 3.5, 5]} c={GLASS} o={{ opacity: 0.16 }} cast={false} />
    <Pipe a={[6.2, 1.0, 0]} b={[10, 1.0, 0]} rad={0.55} c="#9aa3a6" />
  </G>
);

// ---------------------------------------------------------------- cloro e flúor: casa, cilindros e o tanque de contato com micróbios
const Bug: React.FC<{ p: V3; t: number; i: number; dead: number; sc?: number }> = ({ p, t, i, dead, sc = 1 }) => (
  <G p={[p[0], p[1] + Math.sin(t * 3 + i) * 0.2 - dead * 0.5, p[2]]} r={[0, t * 0.8 + i, dead * 1.2]} sc={Math.max(0.01, sc * (1 - 0.85 * dead))}>
    <Sph rad={0.5} c={dead > 0.5 ? "#8a9a7a" : "#56d13a"} ws={9} hs={7} o={{ flat: true }} />
    {Array.from({ length: 6 }, (_, k) => <Cone key={k} rad={0.12} h={0.4} seg={4} p={[Math.cos(k) * 0.55, Math.sin(k * 1.7) * 0.4, Math.sin(k) * 0.55]} r={[k, 0, k * 1.3]} c="#3fa82a" />)}
    <Sph rad={0.13} p={[-0.17, 0.12, 0.43]} c="#ffffff" cast={false} ws={6} hs={4} /><Sph rad={0.13} p={[0.17, 0.12, 0.43]} c="#ffffff" cast={false} ws={6} hs={4} />
    <Sph rad={0.06} p={[-0.17, 0.12, 0.54]} c="#111" cast={false} ws={5} hs={4} /><Sph rad={0.06} p={[0.17, 0.12, 0.54]} c="#111" cast={false} ws={5} hs={4} />
  </G>
);
const Chlorine: React.FC<{ t: number; s: S }> = ({ t, s }) => (
  <G>
    {/* tanque de contato */}
    <Box s={[12, 0.4, 9]} p={[20, 0.2, 0]} c={CONC2} />
    <Box s={[12, 3.6, 0.4]} p={[20, 1.8, -4.5]} c={CONC} /><Box s={[0.4, 3.6, 9]} p={[14, 1.8, 0]} c={CONC} /><Box s={[0.4, 3.6, 9]} p={[26, 1.8, 0]} c={CONC} />
    <Box s={[11.4, 2.8, 8.4]} p={[20, 1.8, 0]} c={CLEAR} o={{ opacity: 0.7, rough: 0.15 }} cast={false} />
    <Box s={[12, 3.6, 0.12]} p={[20, 1.8, 4.5]} c={GLASS} o={{ opacity: 0.15 }} cast={false} />
    {s.bugs > 0.01 || (s.chlor > 0 && s.chlor < 1) ? Array.from({ length: 9 }, (_, i) => <Bug key={i} p={[15.5 + (i % 5) * 2.1, 1.4 + (i % 2) * 1.0, -2.5 + Math.floor(i / 5) * 3.6]} t={t} i={i} dead={s.chlor} sc={s.bugs + (s.chlor > 0 && s.chlor < 1 ? 0.8 : 0)} />) : null}
    {/* casa do cloro com o cilindro verde (cloro) e o tanque azul (flúor) */}
    <Box s={[6, 4, 5]} p={[20, 2, -10]} c="#f4f1e8" /><Box s={[6.4, 0.5, 5.4]} p={[20, 4.2, -10]} c="#2fa84f" />
    <Cyl rt={0.8} h={3} p={[16.2, 1.5, -10]} c="#ffd400" seg={12} /><Sph rad={0.8} p={[16.2, 3, -10]} c="#ffd400" />
    <Cyl rt={0.9} h={3.4} p={[23.8, 1.7, -10]} c="#4ab8ff" seg={12} />
    <Pipe a={[16.2, 3.4, -10]} b={[17, 3.4, -2]} rad={0.15} c="#ffd400" />
    {s.chlor > 0.01 ? Array.from({ length: 16 }, (_, i) => { const u = fract(t * 0.9 + rnd(i)); return <Sph key={i} rad={0.14} p={[15 + rnd(i + 1) * 10, 0.6 + u * 2.6, -3.5 + rnd(i + 2) * 7]} c="#fff27a" o={{ emissive: "#ffe000", ei: 0.6 }} cast={false} sc={s.chlor} ws={5} hs={4} />; }) : null}
    <Pipe a={[26.2, 1.0, 0]} b={[27.7, 1.0, 0]} rad={0.6} c="#9aa3a6" />
  </G>
);

// ---------------------------------------------------------------- bomba, morro, caixa d'água e o cano até as casas
export const TOWER: V3 = [40, 14, 0];
const Tower: React.FC<{ t: number; s: S }> = ({ t, s }) => {
  const lvl = s.tower;
  return (
    <G>
      <Sph rad={10} p={[40, -3, 0]} c="#6fbe40" ws={20} hs={12} />
      {/* bomba com rotor girando */}
      <G p={[29, 0, 0]}><Box s={[2.6, 2.4, 2.6]} p={[0, 1.2, 0]} c="#2f6fb0" /><G p={[0, 1.4, 1.35]} r={[0, 0, t * 8 * s.pump]}><Cyl rt={0.8} h={0.2} r={[PI / 2, 0, 0]} c="#ffd400" seg={8} /><Box s={[1.6, 0.25, 0.25]} p={[0, 0, 0.1]} c="#e0b400" /></G></G>
      <Pipe a={[30.3, 1.6, 0]} b={[39, 8, 0]} rad={0.5} c="#9aa3a6" /><Pipe a={[39, 8, 0]} b={[40, 14.5, 0]} rad={0.5} c="#9aa3a6" />
      {s.pump > 0.05 ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.2 + i / 6); return <Sph key={i} rad={0.35} p={[lerp(30.3, 40, u), lerp(1.6, 14.5, u), 0.5]} c="#7cc8ff" o={{ emissive: "#3aa0ff", ei: 0.5 }} cast={false} sc={s.pump} ws={6} hs={4} />; }) : null}
      {/* caixa d'água: pernas + tanque com nível que sobe */}
      {[-1.6, 1.6].map((dx) => [-1.6, 1.6].map((dz) => <Cyl key={`${dx}${dz}`} rt={0.25} h={8} p={[40 + dx, 10.5, dz]} c="#d8dcdb" seg={6} />))}
      <Cyl rt={3.2} h={5} p={[40, 16.9, 0]} c="#e9ecea" seg={18} o={{ opacity: 0.55 }} cast={false} />
      <Cyl rt={3.0} h={Math.max(0.05, 4.6 * lvl)} p={[40, 14.6 + 2.3 * lvl, 0]} c={CLEAR} seg={18} cast={false} />
      <Cone rad={3.5} h={1.4} seg={18} p={[40, 20.1, 0]} c="#ff8a1a" />
      {/* seta do peso empurrando a água para baixo */}
      {s.houses > 0.01 && s.houses < 0.99 ? <Cone rad={0.9} h={1.8} seg={6} p={[40, 12.5 - fract(t * 1.2) * 4, 3.6]} r={[PI, 0, 0]} c="#2fb4ff" o={{ emissive: "#2fb4ff", ei: 0.6 }} cast={false} /> : null}
      <Pipe a={[41, 13, 0]} b={[48, 4, 0]} rad={0.5} c="#9aa3a6" /><Pipe a={[48, 4, 0]} b={[56, 1, 0]} rad={0.5} c="#9aa3a6" />
    </G>
  );
};
const Town: React.FC<{ t: number; s: S }> = ({ t, s }) => {
  const hs = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ p: [58 + (i % 3) * 6 + rnd(i) * 1.2, 0, -13 + Math.floor(i / 3) * 6.5 + rnd(i + 2)] as V3, h: 2.4 + rnd(i + 4) * 1.6 })), []);
  return (
    <G>
      {hs.map((q, i) => (
        <G key={i} p={q.p}>
          <Box s={[3.6, q.h, 3.4]} p={[0, q.h / 2, 0]} c={["#ffd9a8", "#cfe6ff", "#ffc2c2", "#f1e6d0"][i % 4]} />
          <Cone rad={3.0} h={1.4} seg={4} p={[0, q.h + 0.7, 0]} r={[0, PI / 4, 0]} c="#c4553a" />
          {/* caixinha no telhado enchendo */}
          <Cyl rt={0.6} h={0.8} p={[0.8, q.h + 1.2, 0.6]} c={s.houses > rnd(i) ? CLEAR : "#e9ecea"} seg={10} />
        </G>
      ))}
      {/* cano da rua: trecho de vidro onde se vê o que corre dentro */}
      <Box s={[22, 0.9, 0.9]} p={[67, 0.6, 10]} c={GLASS} o={{ opacity: 0.35 }} cast={false} />
      <Box s={[22, 0.6, 0.6]} p={[67, 0.6, 10]} c={CLEAR} o={{ opacity: 0.7 }} cast={false} vis={s.houses > 0.5} />
      {/* rachadura no cano e o micróbio que tenta entrar; o cloro que sobrou (pontinhos amarelos) acaba com ele */}
      <Box s={[0.15, 1.0, 0.95]} p={[64, 0.6, 10]} r={[0, 0, 0.5]} c="#3b2a1a" vis={s.leak > 0.01 || s.resid > 0.01} />
      {s.leak > 0.01 || (s.resid > 0 && s.resid < 1) ? [0, 1, 2].map((i) => <Bug key={i} p={[63 + i * 1.2, 1.8 + i * 0.3, 11.2]} t={t} i={i} dead={s.resid} sc={0.8 * Math.max(s.leak, s.resid > 0 && s.resid < 1 ? 1 : 0)} />) : null}
      {s.resid > 0.01 ? Array.from({ length: 14 }, (_, i) => { const u = fract(t * 0.5 + rnd(i)); return <Sph key={i} rad={0.12} p={[56 + u * 22, 0.6, 10 + (rnd(i + 3) - 0.5) * 0.4]} c="#fff27a" o={{ emissive: "#ffe000", ei: 0.8 }} cast={false} sc={s.resid} ws={5} hs={4} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- torneira gigante e o copo (o pagamento)
const Faucet: React.FC<{ t: number; s: S }> = ({ t, s }) => (
  <G p={[84, 0, 0]}>
    <Box s={[2.4, 9, 2.4]} p={[0, 4.5, 0]} c="#d8dcdb" />
    <Cyl rt={0.7} h={5} p={[-2.2, 8.6, 0]} r={[0, 0, PI / 2]} c="#c9cfcd" seg={12} o={{ metal: 0.3, rough: 0.3 }} />
    <Cyl rt={0.7} h={1.6} p={[-4.6, 7.8, 0]} c="#c9cfcd" seg={12} o={{ metal: 0.3, rough: 0.3 }} />
    <G p={[0, 10.2, 0]} r={[0, s.glass * 1.4, 0]}><Box s={[2.6, 0.5, 0.5]} c="#e0262b" /><Box s={[0.5, 0.5, 2.6]} c="#2f6fb0" /></G>
    {s.glass > 0.05 ? Array.from({ length: 8 }, (_, i) => { const u = fract(t * 2 + i / 8); return <Sph key={i} rad={0.35} p={[-4.6, 7 - u * 4.6, 0]} c="#7cc8ff" o={{ emissive: "#3aa0ff", ei: 0.4 }} cast={false} sc={s.glass} ws={6} hs={4} />; }) : null}
    <Cyl rt={1.6} rb={1.3} h={3.4} p={[-4.6, 1.7, 0]} c={GLASS} o={{ opacity: 0.35 }} seg={16} cast={false} />
    <Cyl rt={1.45} rb={1.25} h={Math.max(0.05, 3.0 * s.glass)} p={[-4.6, 0.2 + 1.5 * s.glass, 0]} c="#6fc4ff" seg={16} cast={false} />
  </G>
);

export const World: React.FC<{ t: number }> = ({ t }) => {
  const s = st(t);
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Ground g={GROUND} />
      <Clouds t={t} n={8} y={30} />
      <Trees spots={[[-70, 0, -20], [-66, 0, 14], [-78, 0, 30], [-36, 0, -14], [-12, 0, -14], [12, 0, 14], [30, 0, -14], [50, 0, 16], [76, 0, -16], [90, 0, 12], [-60, 0, -40], [20, 0, -30]]} />
      <River t={t} s={s} />
      <Decanter t={t} s={s} />
      <Filter t={t} s={s} />
      <Chlorine t={t} s={s} />
      <Tower t={t} s={s} />
      <Town t={t} s={s} />
      <Faucet t={t} s={s} />
    </>
  );
};
