// Mundo do E22: o Templo Mayor de Tenochtitlan de brinquedo. Uma ilha-maquete (x ±34, z -36..36, topo y=0) num lago largo
// (água y=-0.9). A maquete tem um CORTE na frente: o fosso x ±60, z 0..16 (face da seção em z=0: terra, lodo, argila e a
// água dos lados). A pirâmide é uma pilha de 7 CAPAS aninhadas (cada uma envolve a anterior); cada capa é metade de trás +
// metade da frente: tirando a da frente (desliza para +x) o corte mostra as capas uma dentro da outra. +z = sul, a escadaria
// dupla olha para o oeste (-x). Margem de lá em z>70 (pilhas de pedra, madeira e cal), pueblo vizinho em x>46, a obra de 1978
// numa rua moderna em z≈220, a maquete final da recompensa em x=-150, z=300. Tudo é função de t (sem estado).
import React from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Worker, poseOf } from "../../toy/worker";
import type { Costume, PoseName, Prop } from "../../toy/worker";
import { C1, T } from "./cues";

const PI = Math.PI;
// ---------------------------------------------------------------- geografia
export const IX = 34, TZ = 16, FY = -10, WY = -0.9, TXW = 60;
export const HW = (k: number) => 2.6 + 0.75 * k;          // meia-largura da capa k (0..6)
export const HT = (k: number) => 2.8 + 0.75 * k;          // altura da capa k
const LTINT = ["#f3dba8", "#e8a867", "#d4795a", "#a3bc78", "#6fb0cf", "#b790d6", "#efe6cf"];
const ZC = (k: number) => 0.03 * (6 - k) + 0.02;           // a face do corte da capa k: as de dentro ficam à frente das de fora
export const SHORE = 70;                                    // a margem de lá começa em z=70
export const MOD: V3 = [0, 40, 220];                         // a rua da obra de 1978
export const MODEL: V3 = [-150, 0, 300];                    // a maquete da recompensa
export const NB: V3 = [62, 0, -12];                         // o pueblo vizinho
export const PLAZA: V3 = [20, 0, 26];                       // a praça de pedra e balança
const LAKE = "#3f9fd8", MUD = "#7d6340", MUD2 = "#6a5230", CLAY = "#b89a64", OLIVE = "#8c9a47", ROJO = "#c24a2e";
const qcol = (a: string, b: string, k: number, steps = 6) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.round(clamp(k) * steps) / steps).getHexString();
const popK = (t: number, a: number, d = 0.25) => (t < a ? 0 : outBack(prog(t, a, a + d)));

/** o fosso (corte da maquete) está aberto: a face da seção em z=0 aparece e o chão da frente some */
export const trenchOpen = (t: number) => t < T.tenoch || (t >= C1 && t < T.quieren) || (t >= T.pero1 && t < T.pero3) || (t >= T.nola && t < T.mayoria) || (t >= T.enmenos && t < T.arriba);
/** a metade da frente da capa k saiu (0 fechada .. 1 aberta) */
const hookT = (k: number) => [T.dentro + 0.05, T.ydentro, T.deesa + 0.05, T.todas - 0.6, T.todas - 0.4, T.todas - 0.2, T.todas][6 - k];
export const SLIDE = (t: number, k: number) => {
  if (t < T.tenoch) return ease(t, hookT(k), hookT(k) + 0.5);
  if (t >= T.enmenos && t < T.arriba) return ease(t, T.enmenos + 0.06 * (6 - k), T.enmenos + 0.06 * (6 - k) + 0.4);
  return trenchOpen(t) ? 1 : 0;
};
/** quanto a capa k já subiu (0..1); no gancho o templo está pronto; em 1521 tudo desaba */
export const LG = (t: number, k: number) => {
  if (t < T.tenoch) return 1;
  const col = 1 - ease(t, T.arras, T.arras + 1.0);
  const g = [ease(t, T.esta, T.pero2 - 0.15), ease(t, T.construyen, T.alrededor + 0.3), ease(t, T.cada + 0.1, T.cada + 0.9), ease(t, T.centro - 0.2, T.centro + 0.6),
    ease(t, T.asi, T.asi + 0.8), ease(t, T.pueblo, T.pueblo + 0.8), ease(t, T.ritmo - 0.1, T.ritmo + 0.7)][k];
  return g * col;
};
export const SINK0 = (t: number) => 0.38 * ease(t, T.hunde, T.noparejo + 0.2);
export const TILT0 = (t: number) => 0.2 * ease(t, T.noparejo - 0.1, T.inclina + 0.5);
/** o giro: o templo inteiro afunda de verdade enquanto a voz diz «se hundía» (trincheira aberta: o lodo come a base) */
export const DIP = (t: number) => (t < T.nola || t >= T.mayoria ? 0 : 1.1 * ease(t, T.nola + 0.1, T.hundia + 0.6) + 0.1 * Math.sin(t * 17) * ease(t, T.nola + 0.1, T.nola + 0.4));
const topK = (t: number) => { let m = -1; for (let k = 0; k < 7; k++) if (LG(t, k) > 0.02) m = k; return m; };

export const XMark: React.FC<{ t: number; a: number; b: number; p: V3; sc?: number }> = ({ t, a, b, p, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = lerp(1.8, 1, ease(t, a, a + 0.14)) * sc, o = { emissive: "#ff2a1a", ei: 0.9 };
  return <G p={p} sc={k}>{[-1, 1].map((d) => <G key={d} r={[0, 0, (d * PI) / 4]}><Box s={[0.28, 1.1, 0.08]} c="#3a0808" cast={false} /><Box s={[0.18, 0.98, 0.1]} c="#ff3b30" o={o} cast={false} /></G>)}</G>;
};
const Arrow: React.FC<{ p: V3; len: number; dir?: 1 | -1; c?: string; w?: number }> = ({ p, len, dir = -1, c = "#ff3b30", w = 0.42 }) => (len < 0.05 ? null : (
  <G p={p}>
    <Box s={[w, len, 0.14]} p={[0, (dir * len) / 2, 0]} c={c} o={{ emissive: c, ei: 0.7 }} cast={false} />
    <Cone rad={w * 1.5} h={w * 2.2} seg={3} p={[0, dir * (len + w * 0.9), 0]} r={[dir < 0 ? PI : 0, 0, 0]} c={c} o={{ emissive: c, ei: 0.7 }} cast={false} />
  </G>
));

// ---------------------------------------------------------------- uma capa da pirâmide
const TIERS = 3;
const LayerG: React.FC<{ k: number; g: number; slide: number; stairs: boolean; o?: V3 }> = ({ k, g, slide, stairs, o }) => {
  if (g < 0.01) return null;
  const hw = HW(k), ht = HT(k), zc = ZC(k), col = LTINT[k], dx = 44 * slide;
  const tier = (i: number) => ({ w: hw * (1 - 0.2 * i), top: (ht * (i + 1)) / TIERS, c: qcol(col, "#ffffff", i * 0.12, 12) });
  const wMin = hw * (1 - 0.2 * (TIERS - 1)), RUN = 1.5, N = 7, x0 = -(hw + RUN), x1 = -wMin, sdx = (x1 - x0) / N;
  const strip = (zs: number) => Array.from({ length: N }, (_, s) => { const h = (ht * (s + 1)) / N; return <Box key={s} s={[sdx + 0.02, h, 1.3]} p={[x0 + (s + 0.5) * sdx, h / 2, zs]} c={s % 2 ? "#fbf3df" : "#f0e4c6"} />; });
  return (
    <G p={o} sc={[1, Math.max(g, 0.001), 1]}>
      {Array.from({ length: TIERS }, (_, i) => { const q = tier(i); return <Box key={i} s={[2 * q.w, q.top, q.w + zc]} p={[0, q.top / 2, (zc - q.w) / 2]} c={q.c} />; })}
      {stairs ? strip(-1.15) : null}
      {slide < 0.995 ? <G p={[dx, 0, 0]}>
        {Array.from({ length: TIERS }, (_, i) => { const q = tier(i); return <Box key={i} s={[2 * q.w, q.top, q.w - zc]} p={[0, q.top / 2, (q.w + zc) / 2]} c={q.c} />; })}
        {stairs ? strip(1.15) : null}
      </G> : null}
      {/* faixa escura entre os degraus: lê-se como degraus de pirâmide */}
      {Array.from({ length: TIERS - 1 }, (_, i) => { const q = tier(i); return <Box key={i} s={[2 * q.w + 0.02, 0.1, q.w + zc + 0.02]} p={[0, q.top + 0.0, (zc - q.w) / 2]} c="#7a5a3a" cast={false} />; })}
    </G>
  );
};
/** os dois templos de cima: Huitzilopochtli (vermelho e branco, sul = +z) e Tláloc (azul e branco, norte = -z) */
const Shrines: React.FC<{ y: number; k: number }> = ({ y, k }) => (k < 0.01 ? null : (
  <G p={[0.3, y, 0]} sc={[1, k, 1]}>
    {[[1.55, ROJO, "#fff4e0"], [-1.55, "#2f7fc0", "#f1f6ff"]].map(([z, rc, wc], i) => (
      <G key={i} p={[0, 0, z as number]}>
        <Box s={[2.5, 1.9, 2.3]} p={[0, 0.95, 0]} c={wc as string} />
        <Box s={[2.9, 0.4, 2.7]} p={[0, 2.1, 0]} c={rc as string} /><Box s={[2.2, 0.35, 2.0]} p={[0, 2.45, 0]} c={rc as string} />
        <Box s={[0.7, 1.1, 0.12]} p={[-1.27, 0.55, 0]} c="#3a2a20" cast={false} />
        <Cone rad={0.36} h={0.8} seg={4} p={[0, 3.0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.4 }} cast={false} />
      </G>))}
  </G>
));

export const Temple: React.FC<{ t: number; gf: (k: number) => number; sf: (k: number) => number; tilt?: number; sink?: number; shr?: number; o?: V3 }> = ({ t, gf, sf, tilt = 0, sink = 0, shr = 0, o = [0, 0, 0] }) => {
  let top = -1; for (let k = 0; k < 7; k++) if (gf(k) > 0.02) top = k;
  return (
    <G p={o}>
      {Array.from({ length: 7 }, (_, k) => (
        <G key={k} p={k === 0 ? [0, -sink, 0] : undefined} r={k === 0 ? [0, 0, tilt] : undefined}>
          <LayerG k={k} g={gf(k)} slide={sf(k)} stairs={k === top} />
        </G>))}
      {top >= 0 ? <Shrines y={HT(top) * gf(top)} k={shr} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- terreno: lago, ilha, fosso, margem, vulcões
const HOUSE_C = ["#efe3c6", "#e9d3a8", "#f4ead2", "#dcc08f"];
const HOUSES: [number, number, number][] = [
  [-30, -31, 0.1], [-22, -31, -0.1], [-14, -32, 0.2], [-6, -31, 0], [3, -32, 0.1], [11, -31, -0.2], [19, -32, 0.1], [27, -31, 0],
  [-31, -20, 0.2], [-24, -19, 0], [-16, -20, -0.1], [-9, -20, 0.1], [12, -20, 0], [20, -19, 0.1], [28, -20, -0.1],
  [-30, -8, 0.1], [-24, -4, -0.1],
  [-30, 22, 0], [-22, 27, 0.1], [-14, 22, -0.1], [-6, 29, 0.1], [-26, 32, 0.2], [-11, 33, 0], [2, 25, -0.1],
];
const Houses: React.FC = () => (
  <G>
    {HOUSES.map(([x, z, r], i) => {
      const w = 3.0 + rnd(i) * 1.2, d = 2.8 + rnd(i + 4) * 1.0, h = 1.9 + rnd(i + 8) * 0.8;
      return (
        <G key={i} p={[x, 0, z]} r={[0, r, 0]}>
          <Box s={[w, h, d]} p={[0, h / 2, 0]} c={HOUSE_C[i % 4]} /><Box s={[w + 0.3, 0.22, d + 0.3]} p={[0, h + 0.11, 0]} c="#c9b27a" />
          <Box s={[0.6, 1.0, 0.06]} p={[0, 0.5, d / 2 + 0.02]} c="#4a3426" cast={false} />
        </G>);
    })}
  </G>
);
const TREES: V3[] = [[-33, 0, -34], [33, 0, -34], [-33, 0, -14], [33, 0, -16]];
const Ahuehuetes: React.FC = () => (
  <G>{TREES.map((q, i) => (
    <G key={i} p={q} sc={0.9 + rnd(i) * 0.5}>
      <Cyl rt={0.35} rb={0.5} h={2.6} p={[0, 1.3, 0]} c="#7a4a2a" seg={7} />
      <Sph rad={1.9} p={[0, 3.6, 0]} c="#3f8a3a" ws={9} hs={7} o={{ flat: true }} /><Sph rad={1.4} p={[1.2, 4.4, 0.4]} c="#4f9a44" ws={8} hs={6} o={{ flat: true }} />
    </G>))}</G>
);
const Lake: React.FC<{ t: number }> = ({ t }) => {
  const open = trenchOpen(t);
  return (
    <G>
      <Box s={[3000, 0.6, 1500]} p={[0, -1.2, -750]} c={LAKE} cast={false} o={{ rough: 0.45 }} />
      <Box s={[3000, 0.6, SHORE - 16 + 2]} p={[0, -1.2, 16 + (SHORE - 14) / 2]} c={LAKE} cast={false} o={{ rough: 0.45 }} />
      {[-1, 1].map((d) => <Box key={d} s={[1440, 0.6, 16]} p={[d * 780, -1.2, 8]} c={LAKE} cast={false} o={{ rough: 0.45 }} />)}
      {/* a margem de lá */}
      <Box s={[3000, 6, 330]} p={[0, -3, SHORE + 165]} c="#a9b061" />
      <Box s={[3000, 0.2, 5]} p={[0, 0.02, SHORE + 2.5]} c="#d8c69a" cast={false} />
      {/* ilha: corpo e topo (o fosso deixa z 0..16 livre) */}
      <Box s={[2 * IX, 0.5, 36]} p={[0, -0.25, -18]} c={OLIVE} /><Box s={[2 * IX - 0.4, 3, 35.6]} p={[0, -2, -18]} c={MUD} />
      <Box s={[2 * IX, 0.5, 20]} p={[0, -0.25, 26]} c={OLIVE} /><Box s={[2 * IX - 0.4, 3, 19.6]} p={[0, -2, 26]} c={MUD} />
      {open ? <Trench t={t} /> : <G>
        <Box s={[2 * IX, 0.5, TZ]} p={[0, -0.25, TZ / 2]} c={OLIVE} />
        {[-1, 1].map((d) => <Box key={d} s={[TXW - IX, 0.6, TZ]} p={[d * (IX + TXW) / 2, -1.2, TZ / 2]} c={LAKE} cast={false} o={{ rough: 0.45 }} />)}
        <Box s={[40, 0.06, TZ]} p={[0, 0.03, TZ / 2]} c="#d8c69a" cast={false} />
      </G>}
      <Box s={[40, 0.06, 16]} p={[0, 0.03, -8]} c="#d8c69a" cast={false} />
      <Box s={[2 * IX, 0.04, 2.6]} p={[0, 0.02, -26]} c={LAKE} cast={false} /><Box s={[2.6, 0.04, 30]} p={[-27, 0.02, -14]} c={LAKE} cast={false} />
      <Box s={[22, 0.06, 14]} p={[PLAZA[0], 0.03, PLAZA[2]]} c="#d8c69a" cast={false} />
    </G>
  );
};
/** o corte: face da seção em z=0 (terra, lodo, argila, a água dos lados), paredes e chão do fosso */
const Trench: React.FC<{ t: number }> = ({ t }) => {
  const Z = 0.03;
  return (
    <G>
      <Box s={[2 * IX, 0.5, 0.05]} p={[0, -0.25, Z]} c={OLIVE} cast={false} />
      {Array.from({ length: 5 }, (_, i) => <Box key={i} s={[2 * IX, 1.0, 0.05]} p={[0, -1.0 - i, Z]} c={i % 2 ? MUD2 : MUD} cast={false} />)}
      <Box s={[2 * TXW, 4.5, 0.05]} p={[0, -7.75, Z]} c={CLAY} cast={false} />
      {[-1, 1].map((d) => <Box key={d} s={[TXW - IX, 4.6, 0.05]} p={[d * (IX + TXW) / 2, -3.2, Z]} c="#4aa6e0" o={{ emissive: "#2a7ac0", ei: 0.35 }} cast={false} />)}
      {Array.from({ length: 30 }, (_, i) => <Sph key={i} rad={0.1 + rnd(i) * 0.1} p={[lerp(-IX + 1, IX - 1, rnd(i + 2)), lerp(-5.3, -0.7, rnd(i + 5)), Z + 0.05]} c="#4f4430" cast={false} ws={6} hs={4} />)}
      {Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.1 + rnd(i) * 0.08} p={[lerp(-TXW + 1, TXW - 1, rnd(i + 12)), lerp(-9.6, -5.8, rnd(i + 15)), Z + 0.05]} c="#8a6a38" cast={false} ws={6} hs={4} />)}
      {[-1, 1].map((d) => <Box key={d} s={[0.4, -FY + WY, TZ]} p={[d * (TXW + 0.2), (FY + WY) / 2, TZ / 2]} c="#7a6644" />)}
      <Box s={[2 * TXW + 0.8, 0.4, TZ + 0.4]} p={[0, FY - 0.2, TZ / 2]} c="#5f5a48" />
      {[[-TXW, TZ / 2, 0.12, TZ], [TXW, TZ / 2, 0.12, TZ], [0, TZ, 2 * TXW, 0.12], [0, 0.1, 2 * TXW, 0.12]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.06, d]} p={[x, FY + 0.03, z]} c="#ffe9a8" o={{ emissive: "#ffe9a8", ei: 0.3 }} cast={false} />)}
    </G>
  );
};
const Volcanoes: React.FC = () => (
  <G>
    {[[-200, 60, 100, -430, "#7886a3"], [-60, 45, 70, -470, "#8590ac"], [150, 50, 80, -440, "#7886a3"]].map(([x, r, h, z, c], i) => (
      <G key={i} p={[x as number, 0, z as number]}>
        <Cone rad={r as number} h={h as number} seg={9} p={[0, (h as number) / 2 - 5, 0]} c={c as string} o={{ flat: true }} cast={false} />
        <Cone rad={(r as number) * 0.32} h={(h as number) * 0.3} seg={9} p={[0, (h as number) * 0.85 - 5, 0]} c="#f4f7fc" o={{ flat: true }} cast={false} />
      </G>))}
    {Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={34 + rnd(i) * 16} p={[-330 + i * 44 + rnd(i + 3) * 12, -18, -380 - rnd(i + 9) * 40]} sc={[1.5, 0.7, 1]} c={i % 2 ? "#8da39a" : "#9bb0a4"} cast={false} ws={10} hs={6} />)}
  </G>
);
/** manchas de espuma que andam no lago: o lago não fica parado */
const Foam: React.FC<{ t: number }> = ({ t }) => (
  <G>{Array.from({ length: 46 }, (_, i) => {
    const x = -150 + fract(rnd(i) + t * 0.012 * (1 + rnd(i + 3))) * 300, z = lerp(-140, SHORE - 8, rnd(i + 7));
    return Math.abs(x) < IX + 3 && z > -38 && z < 38 ? null : <Box key={i} s={[1.6 + rnd(i + 2) * 1.6, 0.03, 0.1]} p={[x, WY + 0.01, z]} c="#e8f6ff" cast={false} />;
  })}</G>
);

// ---------------------------------------------------------------- obras do corte: estacas, tezontle, lodo que aperta, setas
export const MEX: Costume = { skin: "#b9784b", top: "#f5f0dc", bottom: "#b9784b", kilt: "#f5f0dc", kiltLen: 0.5, hat: "none", hatC: "#000", boot: "#8a5a32", belt: "#d4a64a", sleeves: false };
const OBRERO: Costume = { skin: "#a8673f", top: "#e8dcc0", bottom: "#a8673f", kilt: "#e8dcc0", kiltLen: 0.45, hat: "none", hatC: "#000", boot: "#8a5a32", belt: "#c24a2e", sleeves: false, scarf: "#c9a27a" };
const WARRIOR: Costume = { skin: "#b9784b", top: "#d8a13c", bottom: "#b9784b", kilt: "#a8452a", kiltLen: 0.45, hat: "helmet", hatC: "#a8452a", boot: "#8a5a32", belt: "#2f6fb0", sleeves: false };
const STAKES = Array.from({ length: 9 }, (_, k) => -8 + 2 * k);
export const STAKE_T = (k: number) => T.clavan + 0.03 + k * 0.075;
const NST = 90, NC = 18;
const STONE_T = (i: number) => T.rellenan + 0.2 + (Math.floor(i / NC) / Math.ceil(NST / NC)) * (T.huecos - T.rellenan - 0.5) + (i % NC) * 0.012;
const STONE_P = (i: number): V3 => [-8.4 + (i % NC) * 0.99 + (rnd(i) - 0.5) * 0.25, -0.5 - Math.floor(i / NC) * 0.72 - rnd(i + 3) * 0.1, 0.14];
const Foundation: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.clavan) return null;
  return (
    <G>
      {STAKES.map((x, k) => {
        const a = STAKE_T(k), u = ease(t, a, a + 0.5), tip = lerp(0.6, -4.3, u), hit = u > 0 && u < 1 ? 0.12 * Math.abs(Math.sin(t * 26 + k)) : 0;
        return <G key={k}>
          <Cyl rt={0.15} rb={0.04} h={4.9} p={[x, tip + 2.45 + hit, 0.12]} c="#a87a46" seg={7} />
          <Cyl rt={0.17} h={0.14} p={[x, tip + 4.9 + hit, 0.12]} c="#6a4a2a" seg={7} cast={false} />
        </G>;
      })}
      {Array.from({ length: NST }, (_, i) => {
        const a = STONE_T(i); if (t < a) return null;
        const u = ease(t, a, a + 0.32), p = STONE_P(i), r = 0.34 + rnd(i + 1) * 0.12;
        return <Box key={i} s={[r * 1.7, r * 1.25, 0.34]} p={[p[0], p[1] + (1 - u) * 5.5, p[2]]} r={[0, 0, rnd(i + 5) * 1.2]} c={["#c24a2e", "#a63a22", "#d9603a"][i % 3]} o={{ flat: true }} />;
      })}
    </G>
  );
};
/** o lodo sob o centro aperta, camada por camada (cada vez mais escuro), com setas que o espremem; as setas de afundar encolhem */
const MudPack: React.FC<{ t: number }> = ({ t }) => {
  const a1 = ease(t, T.cada + 0.2, T.cada + 0.9), a2 = ease(t, T.centro - 0.1, T.centro + 0.5), a3 = ease(t, T.asi - 0.1, T.asi + 0.5);
  const k = a1 * 0.4 + a2 * 0.3 + a3 * 0.3;
  if (t < T.cada || t >= T.pero3) return null;
  const sq = ease(t, T.cada + 0.3, T.suelo + 0.6);
  return (
    <G>
      <Box s={[19, 3.6, 0.05]} p={[0, -5.6, 0.07]} c={qcol(MUD, "#3f2e18", k, 8)} cast={false} />
      <Box s={[12, 2.2, 0.05]} p={[0, -5.2, 0.09]} c={qcol(MUD, "#2f2212", k, 8)} cast={false} />
      {[-1, 1].map((d) => (
        <G key={d} p={[d * (14.5 - 3.2 * sq), -4.6, 0.35]} r={[0, 0, d * PI / 2 + PI]} vis={sq > 0.02}>
          <Box s={[0.44, 3.2, 0.12]} p={[0, 1.6, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.7 }} cast={false} />
          <Cone rad={0.7} h={1.0} seg={3} p={[0, 3.6, 0]} r={[PI, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.7 }} cast={false} />
        </G>))}
      {/* o centro afunda cada vez menos: uma seta por capa, cada uma menor */}
      {[3.3, 1.7, 0.6].map((len, i) => { const a = T.centro + 0.05 + i * 0.42; return t < a ? null : <Arrow key={i} p={[-3.9 + 3.9 * i, -0.8, 0.45]} len={len * popK(t, a, 0.3)} c={["#ff3b30", "#ff8a1f", "#ffc21a"][i]} />; })}
    </G>
  );
};
/** setas do giro: o templo se afunda sob o centro (a razão que NÃO explica tudo) */
const SinkArrow: React.FC<{ t: number }> = ({ t }) => (t < T.nola + 0.1 || t >= T.mayoria ? null : <Arrow p={[0, -0.7, 0.5]} len={4.6 * popK(t, T.nola + 0.1, 0.4)} w={0.8} />);

/** bloco de basalto que afunda no lodo (problema 1) */
const SinkBlock: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.pero1 - 0.2 || t >= T.como1) return null;
  const drop = ease(t, T.pero1, T.lodo + 0.1), sink = ease(t, T.lodo + 0.2, T.peso + 0.6);
  const y = lerp(5.5, 1.1, drop) - 3.2 * sink, sq = 0.2 * sink;
  return (
    <G>
      <Box s={[2.2, 2.2, 2.2]} p={[3, y, -1.05 + 0.1]} c="#454952" o={{ flat: true }} />
      {[-1, 1].map((d) => <Sph key={d} rad={0.8} p={[3 + d * (1.7 + sq), 0.05, 0.1]} sc={[1.2, 0.5 + 0.6 * sink, 1]} c={MUD} cast={false} ws={8} hs={5} />)}
      <XMark t={t} a={T.peso + 0.35} b={T.como1} p={[3, 1.9, 1.6]} sc={1.5} />
    </G>
  );
};
/** a pedra de tezontle em close, cheia de buracos, num pedestal de madeira na praça */
export const STONE_P0: V3 = [PLAZA[0] - 3, 0, PLAZA[2]];
const Tezontle: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.piedra - 0.1 || t >= T.esta) return null;
  const k = popK(t, T.piedra - 0.05, 0.3), rot = t * 0.9;
  return (
    <G p={STONE_P0} sc={k}>
      <Cyl rt={0.9} rb={1.1} h={0.9} p={[0, 0.45, 0]} c="#8a5a32" seg={9} /><Box s={[2.0, 0.12, 2.0]} p={[0, 0.94, 0]} c="#a87a46" />
      <G p={[0, 1.95, 0]} r={[0.2, rot, 0.1]}>
        <Sph rad={0.95} sc={[1.15, 0.95, 1]} c="#b5472e" ws={8} hs={6} o={{ flat: true }} />
        {Array.from({ length: 26 }, (_, i) => {
          const a = rnd(i) * PI * 2, b = Math.acos(2 * rnd(i + 9) - 1), r = 0.93, s = 0.1 + rnd(i + 4) * 0.13;
          return <Sph key={i} rad={s} p={[r * 1.15 * Math.sin(b) * Math.cos(a), r * 0.95 * Math.cos(b), r * Math.sin(b) * Math.sin(a)]} c="#2a120c" ws={6} hs={4} cast={false} />;
        })}
      </G>
      <Sph rad={0.1} p={[1.0, 2.9, 0.6]} c="#fff8c0" o={{ emissive: "#fff0a0", ei: 1.4 }} cast={false} ws={6} hs={4} />
    </G>
  );
};
/** balança: tezontle de um lado, o MESMO bloco de basalto do outro; o basalto pesa e desce */
export const BAL_P: V3 = [PLAZA[0] + 3, 0, PLAZA[2]];
const Balance: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.casi - 0.1 || t >= T.esta) return null;
  const k = popK(t, T.casi - 0.05, 0.3), u = ease(t, T.casi + 0.1, T.mitad + 0.35), a = -0.34 * u + 0.05 * Math.sin((t - T.casi) * 9) * (1 - u) * (u > 0 ? 1 : 0), L = 1.7;
  const end = (d: number): V3 => [d * L * Math.cos(a), 3.1 + d * L * Math.sin(a), 0];
  return (
    <G p={BAL_P} sc={k}>
      <Cyl rt={0.5} rb={0.7} h={0.3} p={[0, 0.15, 0]} c="#8a5a32" seg={9} /><Cyl rt={0.1} h={3.0} p={[0, 1.6, 0]} c="#6a4a2a" seg={7} />
      <G p={[0, 3.1, 0]} r={[0, 0, a]}><Box s={[2 * L + 0.4, 0.16, 0.2]} c="#c9a24a" /><Sph rad={0.18} c="#ffd400" ws={8} hs={6} /></G>
      {[-1, 1].map((d) => {
        const e = end(d);
        return (
          <G key={d} p={e}>
            <Box s={[0.03, 1.1, 0.03]} p={[-0.45, -0.55, 0]} c="#6a4a2a" cast={false} r={[0, 0, 0.35]} /><Box s={[0.03, 1.1, 0.03]} p={[0.45, -0.55, 0]} c="#6a4a2a" cast={false} r={[0, 0, -0.35]} />
            <Cyl rt={0.62} rb={0.5} h={0.12} p={[0, -1.1, 0]} c="#c9a24a" seg={12} />
            {d < 0
              ? <Box s={[0.78, 0.78, 0.78]} p={[0, -0.6, 0]} r={[0, 0.4, 0]} c="#c24a2e" o={{ flat: true }}>{[[-0.2, 0.15, 0.4], [0.2, -0.1, 0.4], [0.05, 0.25, 0.4], [-0.1, -0.22, 0.4]].map((q, i) => <Sph key={i} rad={0.09} p={q as V3} c="#2a120c" cast={false} ws={6} hs={4} />)}</Box>
              : <Box s={[0.78, 0.78, 0.78]} p={[0, -0.6, 0]} r={[0, 0.4, 0]} c="#3a3d44" o={{ flat: true }} />}
          </G>);
      })}
    </G>
  );
};
/** montes de terra sobre a pirâmide inclinada (translúcidos: dá para ver a velha dentro), com nível por cima */
export const FILL_H = 4.1;
const Fill: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.c2 + 0.2 || t >= T.construyen + 0.5) return null;
  const hF = FILL_H * ease(t, T.c2 + 0.25, T.nivelan - 0.05), flat = ease(t, T.rellenan2 + 0.3, T.nivelan + 0.1), fade = 1 - ease(t, T.construyen, T.construyen + 0.45);
  const o = { opacity: 0.62 * fade, depthWrite: false } as const, zf = 0.5, w = 5.4;
  return (
    <G>
      <Box s={[2 * w, Math.max(hF, 0.01), 2.4]} p={[0, hF / 2, zf - 0.8]} c="#caa56b" o={o} cast={false} />
      {[-4, -2, 0, 2, 4].map((x, i) => <Sph key={i} rad={1.0} p={[x * 1.05, hF + 0.1, zf - 0.6]} sc={[1, 0.8 * (1 - flat) + 0.02, 1]} c="#d9b57a" o={o} cast={false} ws={8} hs={5} />)}
      {[-1, 1].map((d) => Array.from({ length: 5 }, (_, i) => { const a = T.c2 + 0.3 + i * 0.22, u = fract((t - a) / 0.5); return t > a && t < T.nivelan - 0.1 ? <Sph key={`${d}${i}`} rad={0.16} p={[d * (5.4 - 3.2 * u), lerp(3.6, hF + 0.2, u), zf]} c="#caa56b" cast={false} ws={6} hs={4} /> : null; }))}
      {t > T.nivelan - 0.05 && fade > 0.1 ? <LevelTool p={[0, hF + 0.2, zf - 0.6]} tilt={0} /> : null}
    </G>
  );
};
export const LevelTool: React.FC<{ p: V3; tilt: number; len?: number }> = ({ p, tilt, len = 2.6 }) => (
  <G p={p} r={[0, 0, tilt]}>
    <Box s={[len, 0.28, 0.34]} p={[0, 0.14, 0]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 0.45 }} />
    <Box s={[len * 0.5, 0.2, 0.38]} p={[0, 0.16, 0]} c="#bfe9ff" o={{ emissive: "#7fd0ff", ei: 0.6 }} cast={false} />
    <Sph rad={0.1} p={[clamp(-tilt * 7, -0.55, 0.55), 0.18, 0.2]} c="#2fd05a" o={{ emissive: "#1fa040", ei: 1.0 }} cast={false} ws={8} hs={6} />
    <Box s={[0.05, 0.22, 0.4]} p={[-0.18, 0.16, 0]} c="#3a2a10" cast={false} /><Box s={[0.05, 0.22, 0.4]} p={[0.18, 0.16, 0]} c="#3a2a10" cast={false} />
  </G>
);
/** o fio de prumo e a régua do nível: mostram a inclinação da primeira pirâmide */
const TiltGauge: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.noparejo + 0.1 || t >= T.entierran + 0.5) return null;
  const tilt = TILT0(t), sink = SINK0(t), u = popK(t, T.noparejo + 0.1, 0.3);
  return (
    <G sc={u}>
      <Box s={[11, 0.07, 0.07]} p={[0, HT(0) + 1.5, 0.55]} c="#2fe0ff" o={{ emissive: "#2fe0ff", ei: 1.0 }} cast={false} />
      <Box s={[0.07, 3.6, 0.07]} p={[0.0, HT(0) - 0.3 + 0.0, 0.55]} c="#ff3b30" o={{ emissive: "#ff3b30", ei: 0.8 }} cast={false} />
      <Sph rad={0.2} p={[0, HT(0) - 2.1, 0.55]} c="#ff3b30" cast={false} ws={8} hs={6} />
      <G p={[0, 0, 0]}><G p={[0, -sink, 0]} r={[0, 0, tilt]}><LevelTool p={[0, HT(0) + 0.02, 0.05]} tilt={0} len={3.2} /></G></G>
      <XMark t={t} a={T.inclina + 0.35} b={T.como2} p={[0.2, HT(0) + 3.6, 1.4]} sc={1.5} />
    </G>
  );
};

// ---------------------------------------------------------------- contexto: fantasma, guindaste, canoas, margem, porteador
const Ghost: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.quieren + 0.1 || t >= T.pero1) return null;
  const k = Math.max(0.001, ease(t, T.quieren + 0.15, T.templo + 0.25)), o = { opacity: 0.4, emissive: "#8fe3ff", ei: 0.9, depthWrite: false } as const, hw = HW(6), ht = HT(6) - 0.9;
  return (
    <G sc={[1, k, 1]}>
      {[0, 1, 2].map((i) => <Box key={i} s={[2 * hw * (1 - 0.2 * i), (ht * (i + 1)) / 3, 2 * hw * (1 - 0.2 * i)]} p={[0, (ht * (i + 1)) / 6, 0]} c="#bfeeff" o={o} cast={false} />)}
      {/* contorno de planta de obra: arestas luminosas de cada degrau (lê-se pirâmide, não caixa de vidro) */}
      {[0, 1, 2].map((i) => { const w = hw * (1 - 0.2 * i), y = (ht * (i + 1)) / 3, e = { emissive: "#e6fbff", ei: 1.2 }; return <G key={i}>
        {[[-1, 0], [1, 0]].map(([d], q) => <Box key={q} s={[2 * w + 0.2, 0.16, 0.16]} p={[0, y, d * w]} c="#e6fbff" o={e} cast={false} />)}
        {[[-1, 0], [1, 0]].map(([d], q) => <Box key={`z${q}`} s={[0.16, 0.16, 2 * w + 0.2]} p={[d * w, y, 0]} c="#e6fbff" o={e} cast={false} />)}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], q) => <Box key={`p${q}`} s={[0.16, ht / 3, 0.16]} p={[a * w, y - ht / 6, b * w]} c="#e6fbff" o={e} cast={false} />)}
      </G>; })}
      {Array.from({ length: 6 }, (_, s) => <Box key={s} s={[0.16, 0.16, 2.6]} p={[-(hw + 1.5) + (s + 0.5) * ((hw + 1.5 - hw * 0.6) / 6), (ht * (s + 1)) / 7, 0]} c="#e6fbff" o={{ emissive: "#e6fbff", ei: 1.2 }} cast={false} />)}
    </G>
  );
};
export const CRANE: V3 = [-17, 0, 6];
const Crane: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.sinmot - 0.05 || t >= T.pero1) return null;
  const k = popK(t, T.sinmot, 0.35), sw = 0.35 * Math.sin(t * 2.2), fall = ease(t, T.motor + 0.55, T.pero1 - 0.05);
  return (
    <G p={CRANE} sc={k * (1 - 0.0 * fall)} r={[0, 0, 0.25 * fall]}>
      <Box s={[2.6, 0.6, 1.8]} p={[0, 0.3, 0]} c="#ffcf1a" /><Cyl rt={0.3} h={0.5} p={[-1.0, 0.25, 1.0]} r={[PI / 2, 0, 0]} c="#2a2a30" /><Cyl rt={0.3} h={0.5} p={[1.0, 0.25, 1.0]} r={[PI / 2, 0, 0]} c="#2a2a30" />
      <Box s={[0.5, 4.6, 0.5]} p={[0, 2.9, 0]} c="#ffcf1a" />
      <G p={[0, 5.2, 0]} r={[0, sw, 0]}>
        <Box s={[5.6, 0.34, 0.34]} p={[1.2, 0, 0]} c="#e8b010" /><Box s={[0.9, 0.7, 0.8]} p={[-1.8, -0.2, 0]} c="#555a60" />
        <Box s={[0.04, 1.8, 0.04]} p={[3.6, -0.9, 0]} c="#222" cast={false} /><Box s={[0.5, 0.4, 0.4]} p={[3.6, -1.9, 0]} c="#c24a2e" />
      </G>
      <Cyl rt={0.35} h={0.5} p={[1.2, 2.0, 0.9]} c="#e8f4ff" seg={6} cast={false} />
    </G>
  );
};
export const CANOE_BODY: React.FC<{ load?: number; paddlers?: number; t: number }> = ({ load = 0, paddlers = 1, t }) => (
  <G>
    <Box s={[0.95, 0.34, 4.2]} p={[0, 0.17, 0]} c="#8a5a32" /><Box s={[0.7, 0.14, 3.9]} p={[0, 0.36, 0]} c="#6a4426" cast={false} />
    <Cone rad={0.48} h={1.0} seg={4} p={[0, 0.2, 2.5]} r={[PI / 2, PI / 4, 0]} c="#8a5a32" /><Cone rad={0.48} h={1.0} seg={4} p={[0, 0.2, -2.5]} r={[-PI / 2, PI / 4, 0]} c="#8a5a32" />
    {load > 0.01 ? <G p={[0, 0.5, 0]} sc={[1, load, 1]}>{[[-0.2, 0.2, -0.9, 0.5], [0.2, 0.25, -0.2, 0.55], [-0.15, 0.2, 0.55, 0.5], [0.12, 0.3, 1.15, 0.45], [0, 0.55, 0.1, 0.5]].map(([x, y, z, r], i) => <Sph key={i} rad={r} p={[x, y, z]} c={i % 2 ? "#8d939b" : "#a7adb5"} ws={6} hs={4} o={{ flat: true }} />)}</G> : null}
    {Array.from({ length: paddlers }, (_, i) => (
      <G key={i} p={[0, 0.4, 1.4 - i * 1.6]}>
        <Cyl rt={0.2} rb={0.24} h={0.55} p={[0, 0.35, 0]} c="#f2ede0" seg={8} /><Sph rad={0.2} p={[0, 0.82, 0]} c="#b9784b" ws={8} hs={6} />
        <Cyl rt={0.14} rb={0.18} h={0.1} p={[0, 0.68, 0]} c="#e0262b" seg={8} cast={false} />
        <G p={[0.3, 0.55, 0]} r={[0.9 * Math.sin(t * 4 + i * 2) + 0.6, 0, 0.2]}><Box s={[0.07, 1.5, 0.22]} p={[0, -0.3, 0]} c="#9a6a3a" cast={false} /></G>
      </G>))}
  </G>
);
/** canoas: as da ilha em volta (contexto) e as que chegam de todas as margens */
const Canoes: React.FC<{ t: number }> = ({ t }) => {
  const around = t < T.quieren;
  const bob = (i: number) => 0.05 * Math.sin(t * 1.9 + i * 1.7);
  const conv = t >= T.canoa0 - 0.1 && t < T.giro;
  const arrive = ease(t, T.pueblos, T.remando + 0.2);
  return (
    <G>
      {around ? Array.from({ length: 7 }, (_, i) => {
        const x = lerp(-50, 50, fract(rnd(i) + t * (0.012 + rnd(i + 2) * 0.01))), z = lerp(40, 62, rnd(i + 5)), v = i % 2 ? 1 : -1;
        return <G key={i} p={[x, WY + 0.05 + bob(i), z]} r={[0, v * 1.55 + (rnd(i) - 0.5) * 0.3, 0]}><CANOE_BODY t={t + i} load={i % 3 === 0 ? 1 : 0} /></G>;
      }) : null}
      {t >= T.pero3 && t < T.giro ? <>
        {/* o porteador: uma pessoa, uma carga a cuestas, uma canoa muito mais */}
        {t < T.canoa1 + 0.2 ? <Porter t={t} /> : null}
        {conv ? Array.from({ length: 4 }, (_, i) => {
          const a = popK(t, T.canoa0 + 0.25 + i * 0.12, 0.35);
          return <G key={i} p={[-12 + i * 8, WY + 0.05 + bob(i), 50 - (i % 2) * 4]} r={[0, 1.5708 + 0.15 * i, 0]} sc={Math.max(0.001, a)}><CANOE_BODY t={t + i} load={1} /></G>;
        }) : null}
        {t >= T.canoa1 ? <G p={[8, WY + 0.05 + bob(1), 46]} r={[0, 1.2, 0]} sc={Math.max(0.001, popK(t, T.canoa1, 0.3))}><CANOE_BODY t={t} load={1} paddlers={2} /></G> : null}
        {t >= T.pueblos - 0.05 ? Array.from({ length: 14 }, (_, i) => {
          const ang = lerp(-0.2, PI + 0.2, i / 13), R = 70 + (i % 3) * 14, sx = Math.cos(ang) * R * 1.4, sz = clamp(36 + Math.sin(ang) * R * 0.8, 44, 64), ex = lerp(-26, 26, ((i * 5) % 14) / 13), ez = 44 + (i % 2) * 5;
          const u = arrive, x = lerp(sx, ex, u), z = lerp(sz, ez, u), yaw = Math.atan2(ex - sx, ez - sz);
          return <G key={i} p={[x, WY + 0.05 + bob(i), z]} r={[0, yaw, 0]}><CANOE_BODY t={t + i} load={1} /></G>;
        }) : null}
      </> : null}
    </G>
  );
};
const Porter: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.como3 - 0.1) return null;
  const u = clamp((t - T.cuestas) / 2.4), x = lerp(-9, 3, u), bob = 0.05 * Math.abs(Math.sin(t * 8));
  return t < T.cuestas - 0.1 ? null : (
    <G p={[x, 0.0, SHORE + 4]} r={[0, 1.5708, 0]}>
      <Worker p={[0, bob, 0]} pose={poseOf("walk", t)} t={t} c={MEX} scale={1.4} />
      <G p={[0, 1.55 + bob, -0.5]}>
        <Box s={[0.9, 0.8, 0.5]} p={[0, 0.2, 0]} c="#c9a24a" /><Box s={[0.85, 0.5, 0.45]} p={[0, 0.85, 0]} c="#8d939b" /><Box s={[0.04, 0.04, 0.9]} p={[0, 0.4, 0.55]} c="#6a4a2a" cast={false} />
      </G>
    </G>
  );
};
/** as pilhas de pedra, madeira e cal na margem de lá */
export const PILE_X = [-9, 0, 9];
const Piles: React.FC<{ t: number }> = ({ t }) => (
  <G p={[0, 0, SHORE + 8]}>
    <G p={[PILE_X[0], 0, 0]} sc={1.9 * Math.max(0.001, ease(t, T.pero3 + 0.25, T.montanas + 0.35))}>
      {Array.from({ length: 22 }, (_, i) => <Box key={i} s={[1.8, 1.2, 1.5]} p={[(rnd(i) - 0.5) * 5.4 * (1 - 0.5 * Math.floor(i / 8) / 2), 0.6 + Math.floor(i / 8) * 1.1, (rnd(i + 4) - 0.5) * 3]} r={[0, rnd(i + 2) * 3, 0]} c={["#8d939b", "#a7adb5", "#767c85"][i % 3]} o={{ flat: true }} />)}
    </G>
    <G p={[PILE_X[1], 0, 0]} sc={1.9 * Math.max(0.001, popK(t, T.pMadera - 0.1, 0.4))}>
      {Array.from({ length: 21 }, (_, i) => { const r = Math.floor(i / 7); return <Cyl key={i} rt={0.45} h={5} p={[((i % 7) - 3 + r * 0.5) * 0.9, 0.5 + r * 0.85, 0]} r={[0, 0, PI / 2]} c={i % 2 ? "#8a5a32" : "#9a6a3a"} seg={8} />; })}
    </G>
    <G p={[PILE_X[2], 0, 0]} sc={1.9 * Math.max(0.001, popK(t, T.pCal - 0.1, 0.4))}>
      {Array.from({ length: 6 }, (_, i) => <Sph key={i} rad={1.7 - i * 0.18} p={[(i - 2.5) * 1.3, 0.3 + (i % 2) * 0.5, (rnd(i) - 0.5) * 2]} sc={[1.2, 0.9, 1.1]} c="#f6f4ee" ws={8} hs={6} />)}
    </G>
  </G>
);
const FarWater: React.FC<{ t: number }> = ({ t }) => (t < T.pero3 || t >= T.canoa0 ? null : (
  <XMark t={t} a={T.isla3 + 0.25} b={T.c3} p={[0, 3.2, 46]} sc={3.4} />
));

// ---------------------------------------------------------------- o giro: pueblo vizinho, guerreiros, mapa, espanhóis, 1978
const Neighbor: React.FC<{ t: number }> = ({ t }) => {
  const fall = ease(t, T.someter, T.someter + 0.6), x = lerp(0, 1.45, fall);
  return (
    <G>
      <Box s={[14, 0.5, 3.4]} p={[40, -0.25, -12]} c="#cdb98a" />
      <Box s={[30, 0.5, 30]} p={[NB[0], -0.25, NB[2]]} c="#9aa84e" /><Box s={[29.6, 3, 29.6]} p={[NB[0], -2, NB[2]]} c={MUD} />
      {[[56, -22], [64, -24], [72, -18], [58, -2], [68, -2], [74, -8]].map(([x0, z0], i) => (
        <G key={i} p={[x0, 0, z0]} r={[0, 0.2 * i, 0]}><Box s={[3.2, 2.2, 3]} p={[0, 1.1, 0]} c={["#ead6a8", "#e2c38e"][i % 2]} /><Box s={[3.5, 0.25, 3.3]} p={[0, 2.3, 0]} c="#2a9a94" /></G>))}
      {/* o estandarte do pueblo vizinho: cai quando o conquistam */}
      <G p={[49.5, 0, -8]} r={[0, 0, x]}>
        <Cyl rt={0.1} h={6} p={[0, 3, 0]} c="#6a4a2a" seg={6} />
        <Box s={[0.08, 1.4, 2.0]} p={[0, 5.2, 1.0]} c="#27c4bc" o={{ emissive: "#27c4bc", ei: 0.25 }} cast={false} />
        <Sph rad={0.35} p={[0, 6.1, 0]} c="#ffd400" ws={8} hs={6} cast={false} />
      </G>
    </G>
  );
};
const WARR = [0, 1, 2, 3];
export const WARRX = (t: number, i: number) => lerp(54 + i * 2.0, 20 + i * 1.6, ease(t, T.mayoria, T.templo2 + 0.3));
const Warriors: React.FC<{ t: number }> = ({ t }) => (t < T.mayoria - 0.3 || t >= T.enmenos ? null : (
  <G>{WARR.map((i) => {
    const x = WARRX(t, i), z = -12.6 + (i % 2) * 1.8, moving = t < T.templo2 + 0.3;
    return <G key={i} p={[x, 0, z]} r={[0, -PI / 2, 0]}>
      <Worker p={[0, 0, 0]} pose={poseOf(moving ? "walk" : "cheer", t + i * 0.7)} t={t + i * 0.7} c={WARRIOR} scale={1.15} mustache={i % 2 === 0} />
      <Box s={[0.05, 2.6, 0.05]} p={[-0.45, 1.3, 0.1]} c="#7a4a2a" cast={false} /><Cone rad={0.1} h={0.4} seg={4} p={[-0.45, 2.7, 0.1]} c="#d8d8dc" cast={false} />
    </G>;
  })}</G>
));
/** o mapa do território ao lado do templo: manchas que crescem junto com as capas */
export const MAP_P: V3 = [15, 0, -2.5];
const MapBoard: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.pueblo || t >= T.enmenos) return null;
  const k = popK(t, T.pueblo, 0.4), g1 = ease(t, T.pueblo + 0.1, T.pueblo + 0.9), g2 = ease(t, T.templo2, T.templo2 + 0.8), g3 = ease(t, T.ritmo, T.ritmo + 0.8), g4 = ease(t, T.imperio - 0.1, T.imperio + 0.6);
  const R = [3.0, 2.2, 1.45, 0.75], C = ["#a8d36a", "#f0b34a", "#e8794a", "#c4262e"], G4 = [g1, g2, g3, g4];
  return (
    <G p={MAP_P} r={[0, -0.12, 0]} sc={k}>
      <Box s={[8.4, 6.4, 0.3]} p={[0, 3.9, 0]} c="#6a4a2a" /><Box s={[7.8, 5.8, 0.1]} p={[0, 3.9, 0.2]} c="#3f9fd8" cast={false} />
      <Box s={[3.2, 4.4, 0.06]} p={[-2.6, 3.7, 0.28]} c="#7a8f4a" cast={false} /><Box s={[2.4, 3.4, 0.06]} p={[2.9, 4.2, 0.28]} c="#8a9f55" cast={false} />
      {R.map((r, i) => <Cyl key={i} rt={r * Math.max(0.001, G4[i])} h={0.06} p={[0.1, 3.9, 0.34 + i * 0.03]} r={[PI / 2, 0, 0]} c={C[i]} seg={22} cast={false} o={{ opacity: 0.88 }} />)}
      <Box s={[0.4, 3.6, 0.5]} p={[-2.9, 1.8, -0.4]} c="#5a3a20" r={[0, 0, 0.0]} />
      <Box s={[0.4, 3.6, 0.5]} p={[2.9, 1.8, -0.4]} c="#5a3a20" />
    </G>
  );
};
/** 1521: os soldados, a igreja e as casas coloniais em cima do templo arrasado */
const Colonial: React.FC<{ t: number }> = ({ t }) => {
  const s0 = t < T.constr - 0.05 ? 0 : 1, rise = (i: number) => Math.max(0.001, ease(t, T.constr + 0.12 * i, T.constr + 0.12 * i + 0.7)) * s0;
  if (t < T.constr - 0.05) return null;
  return (
    <G>
      <Box s={[24, 0.4, 22]} p={[0, 0.2, 0]} c="#d9c8a0" sc={[1, rise(0), 1]} />
      <G p={[0, 0.4, -3.5]} sc={[1, rise(1), 1]}>
        <Box s={[7, 4.6, 11]} p={[0, 2.3, 0]} c="#f4ead5" /><Box s={[7.6, 0.4, 11.6]} p={[0, 4.8, 0]} c="#b8523a" />
        <Box s={[2.6, 8.2, 2.6]} p={[-3.0, 4.1, 5.8]} c="#efe0c0" /><Box s={[3.0, 0.5, 3.0]} p={[-3.0, 8.4, 5.8]} c="#b8523a" /><Cone rad={1.6} h={1.7} seg={4} p={[-3.0, 9.5, 5.8]} r={[0, PI / 4, 0]} c="#b8523a" />
        <Box s={[2.6, 7.0, 2.6]} p={[3.0, 3.5, 5.8]} c="#efe0c0" /><Box s={[3.0, 0.5, 3.0]} p={[3.0, 7.2, 5.8]} c="#b8523a" /><Cone rad={1.6} h={1.7} seg={4} p={[3.0, 8.3, 5.8]} r={[0, PI / 4, 0]} c="#b8523a" />
        <Box s={[0.18, 1.6, 0.18]} p={[-3.0, 11.2, 5.8]} c="#3a2a20" cast={false} /><Box s={[0.9, 0.18, 0.18]} p={[-3.0, 11.4, 5.8]} c="#3a2a20" cast={false} />
        <Box s={[2.4, 3.0, 0.14]} p={[0, 1.5, 5.55]} c="#4a3426" cast={false} />
      </G>
      {[[-9, -5], [9, -5], [-9, 6], [9, 6]].map(([x, z], i) => (
        <G key={i} p={[x, 0.4, z]} sc={[1, rise(2 + i), 1]}>
          <Box s={[5, 3, 4]} p={[0, 1.5, 0]} c={["#f0dcb4", "#e9c9a0"][i % 2]} /><Box s={[5.4, 0.4, 4.4]} p={[0, 3.2, 0]} c="#b8523a" />
          {[-1.6, 0, 1.6].map((dx) => <Box key={dx} s={[0.9, 1.4, 0.1]} p={[dx, 1.6, x < 0 ? 2.05 : 2.05]} c="#4a3426" cast={false} />)}
        </G>))}
    </G>
  );
};
const Soldiers: React.FC<{ t: number }> = ({ t }) => (t < T.m1521 - 0.2 || t >= T.constr + 0.6 ? null : (
  <G>
    {[0, 1, 2].map((i) => {
      const u = ease(t, T.m1521, T.arras), x = lerp(-30 + i * 2.2, -15 + i * 2.2, u), z = 11 + (i - 1) * 2.2;
      return <G key={i} p={[x, 0, z]} r={[0, PI / 2 - 0.3, 0]}>
        <Worker p={[0, 0, 0]} pose={poseOf(u < 0.98 ? "walk" : "cheer", t + i)} t={t + i} c={COSTUMES.general} scale={1.2} mustache={i !== 1} />
      </G>;
    })}
    <G p={[-16, 0, 14]}><Cyl rt={0.08} h={5} p={[0, 2.5, 0]} c="#6a4a2a" seg={6} /><Box s={[0.06, 1.1, 1.7]} p={[0, 4.4, 0.9]} c="#d9232b" o={{ emissive: "#d9232b", ei: 0.2 }} cast={false} /><Box s={[0.07, 0.4, 1.7]} p={[0, 4.4, 0.9]} c="#ffd400" cast={false} /></G>
  </G>
));
/** o templo cai: poeira e tijolos soltos */
const Dust: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.arras - 0.1 || t > T.arras + 2.4) return null;
  const on = Math.sin(PI * clamp((t - T.arras + 0.1) / 2.4));
  return (
    <G>
      <Puffs t={t} p={[-4, 0.5, 4]} n={7} period={1.6} rise={7} size={2.0} c="#d9c8a0" on={on} drift={[0.8, 0, 1]} />
      <Puffs t={t} p={[5, 0.5, -3]} n={7} period={1.8} rise={8} size={2.2} c="#cdb98a" on={on} drift={[-0.8, 0, 1]} o={0.3} />
      {Array.from({ length: 16 }, (_, i) => { const u = clamp((t - T.arras - 0.05) / 1.1); return u > 0 && u < 1 ? <Box key={i} s={[0.6, 0.5, 0.5]} p={[(rnd(i) - 0.5) * 16, 5 * (1 - u) * (0.4 + rnd(i + 1)) * Math.max(0, 1 - Math.abs(2 * u - 1) ** 2) + 0.3, (rnd(i + 3) - 0.5) * 12]} r={[u * 4, u * 3, 0]} c="#e8c898" cast={false} /> : null; })}
    </G>
  );
};

// ---------------------------------------------------------------- 1978: a rua moderna, o poço, a deusa de pedra; a maquete da recompensa
const HARD = COSTUMES.worker;
export const PIT_W = (t: number) => lerp(3.4, 8.6, ease(t, T.asi2, T.excav + 0.5));
export const PIT_D = 7;
const pitFloor = (t: number) => lerp(-0.4, -PIT_D, ease(t, T.cavaban, T.toparon - 0.05));
const Modern: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.m1978 - 0.3 || t >= T.manda) return null;
  const W = PIT_W(t), fl = pitFloor(t), sweep = ease(t, T.toparon + 0.2, T.diosa + 0.4), rem = ease(t, T.asi2 + 0.1, T.asi2 + 0.9);
  const L = 120;
  return (
    <G p={MOD}>
      {/* rua de asfalto com o poço no meio (as bordas do poço acompanham a largura) */}
      {[[-(L + W) / 2, 0, L - W, 2 * L], [(L + W) / 2, 0, L - W, 2 * L], [0, (L + W) / 2, 2 * W, L - W], [0, -(L + W) / 2, 2 * W, L - W]].map(([x, z, w, d], i) => (
        <G key={i}><Box s={[w, 0.4, d]} p={[x, -0.2, z]} c="#4b4e57" /><Box s={[w - 0.02, PIT_D - 0.4, d - 0.02]} p={[x, -0.4 - (PIT_D - 0.4) / 2, z]} c="#8a6a44" /></G>))}
      <Box s={[0.5, 0.06, 2 * L]} p={[-0.0, 0.02, 0]} c="#ffd43a" cast={false} vis={false} />
      <Box s={[2 * W, 0.4, 2 * W]} p={[0, fl - 0.2, 0]} c="#6a5338" />
      {/* a deusa de pedra: disco grande esculpido, coberto de terra até a descoberta */}
      <G p={[0, fl + 0.05, 0]}>
        <Cyl rt={2.5} h={0.4} p={[0, 0.2, 0]} c="#9a9aa6" seg={24} /><Cyl rt={2.3} h={0.1} p={[0, 0.45, 0]} c="#7e7e8c" seg={24} /><Cyl rt={2.0} h={0.1} p={[0, 0.55, 0]} c="#aeaeba" seg={24} />
        <G p={[0, 0.6, 0]}>
          <Sph rad={0.55} sc={[1, 0.5, 1]} c="#6c6c7a" ws={10} hs={6} />
          {[0, 1, 2, 3, 4, 5].map((i) => <G key={i} r={[0, (i / 6) * PI * 2 + 0.3, 0]}><Box s={[1.5, 0.12, 0.34]} p={[1.15, 0.05, 0]} c="#6c6c7a" /><Sph rad={0.22} p={[1.95, 0.08, 0]} c="#6c6c7a" ws={8} hs={5} /></G>)}
          {Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.1} p={[Math.cos((i / 16) * PI * 2) * 2.15, 0.06, Math.sin((i / 16) * PI * 2) * 2.15]} c="#d4a64a" o={{ emissive: "#d4a64a", ei: 0.4 }} cast={false} ws={6} hs={4} />)}
        </G>
        <Cyl rt={2.7} h={0.36} p={[0, 0.58, 0]} sc={[1, Math.max(0.001, 1 - sweep), 1]} c="#6a5338" seg={20} />
        <Sph rad={0.4} p={[0, 1.2, 0]} c="#fff8c0" o={{ emissive: "#fff0a0", ei: 1.4, opacity: 0.0 + 0.8 * Math.sin(PI * prog(t, T.diosa - 0.2, T.diosa + 1.0)), depthWrite: false }} cast={false} ws={8} hs={6} />
      </G>
      {/* os restos do templo em camadas, nos fundos do poço ampliado */}
      {[0, 1, 2].map((i) => { const h = 0.9 + i * 0.7, w = 4.4 + i * 1.7, k = Math.max(0.001, ease(t, T.asi2 + 0.12 * i, T.asi2 + 0.12 * i + 0.5)); return t < T.asi2 - 0.05 ? null : (
        <G key={i} p={[0, fl, 0]} sc={[1, k, 1]}>
          {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([a, b], q) => <Box key={q} s={a ? [0.8, h, 2 * w] : [2 * w, h, 0.8]} p={[a * w, h / 2, b * w]} c={LTINT[i * 2]} />)}
        </G>); })}
      {/* rua em volta: calçadas, prédios, poste, cones, tambor de cabo, carro */}
      {[-1, 1].map((d) => <Box key={d} s={[3, 0.5, 2 * L]} p={[d * 21, 0.05, 0]} c="#bdb6a8" />)}
      {[[-30, -16, 10, 22, "#9aa7b8"], [-30, 12, 10, 16, "#b8a89a"], [30, -14, 10, 18, "#a8b4c0"], [30, 14, 9, 26, "#c0b4a4"]].map(([x, z, w, h, c], i) => (
        <G key={i} p={[x as number, 0, z as number]}>
          <Box s={[w as number, h as number, 11]} p={[0, (h as number) / 2, 0]} c={c as string} />
          {Array.from({ length: Math.floor((h as number) / 3.2) }, (_, r) => [-0.3, 0.3].map((f, q) => <Box key={`${r}${q}`} s={[(w as number) * 0.28, 1.6, 0.1]} p={[f * (w as number), 2.2 + r * 3.2, (x as number) < 0 ? 5.55 : -5.55]} c="#7fb8e8" o={{ emissive: "#4a90c0", ei: 0.3 }} cast={false} />))}
        </G>))}
      <G p={[-16, 0, 16]}><Cyl rt={0.14} h={7} p={[0, 3.5, 0]} c="#4a4d55" seg={6} /><Box s={[1.6, 0.3, 0.5]} p={[0.7, 7, 0]} c="#e8e8f0" o={{ emissive: "#ffffcc", ei: 0.4 }} cast={false} /></G>
      {[[-6, 6], [6, 6], [-6, -6], [6, -6], [0, 8.4]].map(([x, z], i) => (t < T.m1978 ? null : <G key={i} p={[x * (W / 4.5 + 0.4), 0, z * (W / 4.5 + 0.4)]}><Cone rad={0.4} h={1.0} seg={8} p={[0, 0.6, 0]} c="#ff6a1a" cast={false} /><Box s={[0.3, 0.1, 0.3]} p={[0, 1.1, 0]} c="#ffffff" cast={false} /></G>))}
      <G p={[13, 0.1, -6]} r={[0, 0.5, 0]}>
        <Box s={[3, 1.0, 5.2]} p={[0, 0.9, 0]} c="#c8352a" /><Box s={[2.5, 0.9, 2.6]} p={[0, 1.8, -0.2]} c="#e8f0f8" />
        {[[-1.4, 1.7], [1.4, 1.7], [-1.4, -1.7], [1.4, -1.7]].map(([x, z], i) => <Cyl key={i} rt={0.5} h={0.5} p={[x, 0.5, z]} r={[0, 0, PI / 2]} c="#222" seg={10} />)}
      </G>
      {/* tambor de cabo da Luz */}
      <G p={[W + 3.6, 0, 4]} r={[0, 0.4, 0]}>
        <Cyl rt={1.6} h={0.2} p={[0, 1.65, 1.0]} r={[PI / 2, 0, 0]} c="#9a6a3a" seg={16} /><Cyl rt={1.6} h={0.2} p={[0, 1.65, -1.0]} r={[PI / 2, 0, 0]} c="#9a6a3a" seg={16} />
        <Cyl rt={1.15} h={1.9} p={[0, 1.65, 0]} r={[PI / 2, 0, 0]} c="#2a2a2e" seg={16} /><Cyl rt={0.2} h={2.4} p={[0, 1.65, 0]} r={[PI / 2, 0, 0]} c="#c8a24a" seg={8} />
        <Box s={[0.3, 1.6, 2.6]} p={[-1.5, 0.8, 0]} c="#6a4a2a" /><Box s={[0.3, 1.6, 2.6]} p={[1.5, 0.8, 0]} c="#6a4a2a" />
        {[0, 1, 2, 3].map((i) => <Pipe3 key={i} i={i} />)}
      </G>
      {[[-W - 1.8, 1.2, 1.2, "chisel"], [W + 1.8, -1.0, -1.3, "pull"], [2, W + 1.8, 3.2, "present"]].map(([x, z, yaw, pose], i) => (
        <Worker key={i} p={[x as number, 0.3, z as number]} yaw={yaw as number} pose={poseOf(pose as PoseName, t + i * 0.6)} t={t + i * 0.6} c={HARD} scale={1.3} prop={i === 0 ? "hammer" : "none"} mustache={i !== 1} />
      ))}
      <Puffs t={t} p={[0, fl + 0.4, 0]} n={5} period={1.4} rise={3.5} size={0.8} c="#c9a97a" on={t > T.cavaban && t < T.toparon + 0.8 ? 1 : 0} />
    </G>
  );
};
const Pipe3: React.FC<{ i: number }> = ({ i }) => <Cyl rt={1.2 + i * 0.01} h={0.06} p={[0, 1.65, -0.8 + i * 0.52]} r={[PI / 2, 0, 0]} c="#444a52" seg={16} cast={false} />;
/** a maquete da recompensa: as 7 capas aninhadas num cortado limpo, num pedestal, longe de tudo */
const Model: React.FC<{ t: number }> = ({ t }) => (t < T.m1978 || t >= T.end + 1 ? null : (
  <G p={MODEL}>
    <Cyl rt={14} rb={15} h={0.8} p={[0, 0.4, 0]} c="#d7c9a3" seg={30} /><Cyl rt={12.4} h={0.1} p={[0, 0.82, 0]} c="#e8dcb8" seg={30} cast={false} />
    <Temple t={t} gf={() => 1} sf={() => 1} shr={1} o={[0, 0.8, 0]} />
  </G>
));
const Rock: React.FC<{ t: number }> = ({ t }) => (t < T.roca - 0.1 || t >= T.quieren ? null : (
  <G p={[-4, -7.0, 4.5]} sc={popK(t, T.roca - 0.05, 0.3)}>
    <Sph rad={1.3} sc={[1.3, 0.9, 1]} c="#8d939b" ws={7} hs={5} o={{ flat: true }} /><Sph rad={0.8} p={[1.2, -0.2, 0.4]} c="#a7adb5" ws={6} hs={4} o={{ flat: true }} />
    <XMark t={t} a={T.roca + 0.45} b={T.quieren} p={[0, 0.2, 1.8]} sc={1.8} />
  </G>
));
/** alguns trabalhadores de apoio com marreta nas estacas e carregando terra no aterro */
const Crew: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {t >= T.c1 + 0.4 && t < T.piedra ? [-6, -2, 2, 6].map((x, i) => <Worker key={i} p={[x, 0, -1.6]} yaw={0.2 * (i - 1.5)} pose={poseOf(t < T.clavan + 0.7 && t >= T.clavan ? "chisel" : "present", t + i * 0.4)} t={t + i * 0.4} c={OBRERO} scale={1.3} prop="hammer" mustache={i % 2 === 0} />) : null}
    {t >= T.c2 + 0.1 && t < T.construyen + 0.4 ? [[-6.8, 1], [6.8, -1]].map(([x, d], i) => <Worker key={i} p={[x, 0, -0.8]} yaw={d * -1.2 + 0.0} pose={poseOf(t < T.nivelan ? "pour" : "present", t + i)} t={t + i} c={OBRERO} scale={1.3} prop="jar" />) : null}
  </G>
);

// ---------------------------------------------------------------- o mundo inteiro
export const World: React.FC<{ t: number }> = ({ t }) => {
  const open = trenchOpen(t), gf = (k: number) => LG(t, k), sf = (k: number) => SLIDE(t, k);
  const shr = t < T.tenoch ? 1 : ease(t, T.arriba, T.arriba + 0.45) * (1 - ease(t, T.arras, T.arras + 1.0));
  return (
    <>
      <Sky top="#3f96f0" mid="#8fc8f5" low="#eaf6ff" />
      <Clouds t={t} n={8} />
      <Volcanoes />
      <Lake t={t} /><Foam t={t} /><Houses /><Ahuehuetes />
      <Temple t={t} gf={gf} sf={sf} tilt={TILT0(t)} sink={SINK0(t)} shr={shr} o={[0, -DIP(t), 0]} />
      {open ? <><Foundation t={t} /><MudPack t={t} /><SinkArrow t={t} /><SinkBlock t={t} /><Fill t={t} /><TiltGauge t={t} /><Rock t={t} /><Crew t={t} /></> : null}
      <Tezontle t={t} /><Balance t={t} />
      <Ghost t={t} /><Crane t={t} />
      <XMark t={t} a={T.motor + 0.45} b={T.pero1} p={[CRANE[0], 7.4, CRANE[2] + 2]} sc={1.8} />
      <Canoes t={t} /><Piles t={t} /><FarWater t={t} />
      <Neighbor t={t} /><Warriors t={t} /><MapBoard t={t} />
      <Colonial t={t} /><Soldiers t={t} /><Dust t={t} />
      <Modern t={t} /><Model t={t} />
    </>
  );
};
export { Worker, poseOf };
