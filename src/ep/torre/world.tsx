// Mundo do E19: a Torre Latinoamericana de brinquedo no centro da Cidade do México, com o SUBSOLO em corte.
// Torre na origem (x -2,5..2,5; z -1,2..3,8), 44 andares de 0,52 + mastro. A FACE DO CORTE fica em z=FZ=4: na frente dela
// a rua abre um buraco até y=DEEP, e o que está debaixo da torre aparece encostado na face (aterro, barro do lago, capa dura,
// pilotes, o cajón). Bellas Artes do outro lado do Eixo Central (BA), a Alameda a oeste, vulcões ao fundo.
// Ordem: hoje (gancho, a torre balança num terremoto) → ⏪ 1948, o lago → barro quase todo água → Bellas Artes afunda →
// sem computadores (✖) → torre ingênua afunda na gelatina (✖) → pilotes até a capa dura → ainda pesa → o cajón (terra tirada =
// peso da torre, balança) → bombeiam a água e a casa vizinha afunda (✖) → poços de recarga → tremor que cresce no barro, o
// prédio rígido cai (✖) → esqueleto de aço que se dobra → 1957 o Anjo cai, a torre não → 1985 e 2017.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, vlerp } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { Crowd, Worker, poseOf } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import type { Costume } from "../../toy/worker";
import { DIRT_FLY, DIRT_N, DIRT_T, PILE_T, T } from "./cues";

const PI = Math.PI;
export const FZ = 4;            // a face do corte
export const DEEP = -9.6;       // fundo do buraco
export const CLAY_TOP = -0.7, HARD_TOP = -6.0, HARD_BOT = -6.9, BOX_BOT = -2.4;
export const FH = 0.52, FLOORS = 44, BODY = FH * FLOORS; // 22,9
export const MAST_TOP = BODY + 7.6;
export const BA: V3 = [-15, 0, -7], NP: V3 = [-22, 0, 12], NH: V3 = [5.6, 0, 2.2], BR: V3 = [-5.9, 0, 2.2], SC: V3 = [11, 0, 0.5], ANGEL: V3 = [30, 0, -34], REC: V3 = [-22, 16, 24], REED: V3 = [-10, 0, 0.6];
export const X0 = -2.5, X1 = 2.5, Z0 = -1.2, Z1 = 3.8;
const FILL = "#8a6a48", CLAY = "#8f9a86", CLAY2 = "#7d8a74", HARD = "#d9b46a", HARD2 = "#c49a4e", DEEPC = "#6f7a66";
const GLASS = "#5fa8d8", GLASS2 = "#7fc0e6", ALU = "#e6ebef", STEEL = "#e2552a", CONC = "#c9c4ba", WATER = "#3fa3e0";
const STREET = "#c9c2b4", WALK = "#ddd6c8";

// ---------------------------------------------------------------- quando cada coisa existe
const hook = (t: number) => t < T.ciudad;
/** ⏪ «Ciudad de México, 1948»: a torre se desmonta andar por andar e Bellas Artes volta a subir */
const rewind = (t: number) => t >= T.ciudad && t < T.hubo;
const rewK = (t: number) => ease(t, T.ciudad + 0.05, T.m1948 + 0.5);
export const giro = (t: number) => t >= T.giro - 0.02;
const lakeK = (t: number) => (hook(t) || giro(t) ? 0 : ease(t, T.hubo - 0.1, T.hubo + 0.5) * (1 - ease(t, T.debajo, T.debajo + 0.7)));
/** o buraco do corte está aberto (rua tirada): no gancho («sobre el barro de un lago») e de «debajo» ao giro, menos nos planos
 *  de Bellas Artes e da prancheta */
export const cutOpen = (t: number) => (hook(t) ? t > T.barro0 - 0.05 && t < T.aguantado - 0.05 : !giro(t) && t > T.debajo - 0.05 && !(t > T.bellas - 0.05 && t < T.p1 - 0.05));
/** no gancho a obra está pronta: pilotes cortados no fundo do cajón, cajón inteiro */
const built = (_t: number) => false; // gancho: o corte mostra só barro e gotas; pilotes e cajón chegam na explicação
/** andares de pé da torre real (0..44) */
export const floorsAt = (t: number) => {
  if (hook(t) || giro(t)) return FLOORS;
  if (rewind(t)) return FLOORS * (1 - rewK(t));
  if (t < T.treinta) return 0;
  if (t < T.b2) return 14 * ease(t, T.treinta, T.p2);
  if (t < T.b4) return lerp(14, 30, ease(t, T.sacan, T.cajon));
  return lerp(30, FLOORS, ease(t, T.b4, T.esqueleto));
};
const skinK = (t: number) => (hook(t) || giro(t) || rewind(t) ? 1 : 0); // vidro: só com a obra pronta
const xray = (_t: number) => 0; // ponytail: o esqueleto aparece porque o vidro só entra em «este es el esqueleto»

// ---------------------------------------------------------------- tremores e balanço
const pulse = (t: number, a: number, b: number) => Math.min(ease(t, a - 0.1, a + 0.3), 1 - ease(t, b - 0.4, b));
/** amplitude do terremoto no chão */
export const quakeAt = (t: number) => Math.max(
  hook(t) ? pulse(t, T.aguantado, T.ciudad) : 0,
  pulse(t, T.tiembla, T.b4), pulse(t, T.mece - 0.2, T.esqueleto + 0.2),
  giro(t) ? Math.max(0.45 * pulse(t, T.m1957 + 0.6, CUTS[5] + 0.4), 0.6 * pulse(t, T.dibujaba - 0.3, T.sacudida + 0.5), pulse(t, T.tiro - 0.3, T.intacta + 0.6), pulse(t, T.m1985, T.ella + 1.2), pulse(t, T.m2017, T.manda)) : 0);
/** balanço do topo da torre (unidades) */
const swayAt = (t: number) => {
  const q = quakeAt(t), big = t > T.mece - 0.2 && t < T.esqueleto + 0.2 ? 2.2 : giro(t) && t > T.m1985 - 0.1 && t < T.m2017 ? 1.9 : giro(t) && t > T.m2017 ? 1.4 : 1;
  return q * 0.75 * big * Math.sin(t * 5.2);
};
const groundShake = (t: number): V3 => { const q = quakeAt(t); return [q * 0.09 * Math.sin(t * 31), 0, q * 0.06 * Math.sin(t * 27 + 1)]; };

// ---------------------------------------------------------------- utilidades
type Col = { c: string; e: string };
const BLUE: Col = { c: "#5ac8ff", e: "#1f8fe0" }, RED: Col = { c: "#ff5a3a", e: "#ff2a1a" };
const along = (pts: V3[], u: number): V3 => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return vlerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 0); d -= L[i]; }
  return pts[pts.length - 1];
};
const Flow: React.FC<{ t: number; pts: V3[]; k: number; n?: number; speed?: number; col?: Col; r?: number; ph?: number }> = ({ t, pts, k, n = 5, speed = 0.8, col = BLUE, r = 0.14, ph = 0 }) =>
  k <= 0.02 ? null : <G>{Array.from({ length: n }, (_, i) => <Sph key={i} rad={r * Math.min(1, k * 1.6)} p={along(pts, fract(t * speed + i / n + ph))} c={col.c} o={{ emissive: col.e, ei: 1.1 }} cast={false} ws={8} hs={6} />)}</G>;
const XMark: React.FC<{ t: number; a: number; b: number; p: V3; sc?: number }> = ({ t, a, b, p, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = lerp(1.8, 1, ease(t, a, a + 0.14)) * sc, o = { emissive: "#ff2a1a", ei: 0.9 };
  return <G p={p} sc={k}>{[-1, 1].map((d) => <G key={d} r={[0, 0, (d * PI) / 4]}><Box s={[0.28, 1.1, 0.08]} c="#3a0808" cast={false} /><Box s={[0.18, 0.98, 0.1]} c="#ff3b30" o={o} cast={false} /></G>)}</G>;
};
const Check: React.FC<{ t: number; a: number; b: number; p: V3; sc?: number }> = ({ t, a, b, p, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = Math.max(0.001, outBack(prog(t, a, a + 0.3))) * sc, o = { emissive: "#1fd060", ei: 0.9 };
  return <G p={p} sc={k}><G r={[0, 0, 0.8]}><Box s={[0.2, 1.1, 0.1]} p={[0.18, 0.2, 0]} c="#3fe07a" o={o} cast={false} /></G><G r={[0, 0, -0.75]}><Box s={[0.2, 0.55, 0.1]} p={[-0.32, -0.05, 0]} c="#3fe07a" o={o} cast={false} /></G></G>;
};
const popK = (t: number, a: number, d = 0.25) => (t < a ? 0 : outBack(prog(t, a, a + d)));
const Arrow: React.FC<{ p: V3; len: number; dir?: number; c?: Col; w?: number }> = ({ p, len, dir = -1, c = RED, w = 0.22 }) => (
  len <= 0.02 ? null : <G p={p} r={[0, 0, dir < 0 ? PI : 0]}><Box s={[w, len, w]} p={[0, len / 2, 0]} c={c.c} o={{ emissive: c.e, ei: 0.8 }} cast={false} /><Cone rad={w * 2.1} h={w * 2.6} p={[0, len + w * 1.2, 0]} seg={4} c={c.c} o={{ emissive: c.e, ei: 0.8 }} cast={false} /></G>
);

// ---------------------------------------------------------------- chão, cidade, Alameda, vulcões e o lago antigo
const HOLE: [number, number, number, number][] = [[-450, 450, -450, FZ], [-450, 450, FZ + 14.4, 450], [-450, -16.4, FZ, FZ + 14.4], [16.4, 450, FZ, FZ + 14.4]];
const Land: React.FC<{ t: number }> = ({ t }) => {
  const lk = lakeK(t), open = cutOpen(t);
  return (
    <G>
      {/* chão e ruas em 4 pedaços em volta do buraco do corte (x ±16,4; z FZ..FZ+14,4) */}
      {HOLE.map(([x0, x1, z0, z1], i) => <G key={i}>
        <Box s={[x1 - x0, 0.2, z1 - z0]} p={[(x0 + x1) / 2, -0.12, (z0 + z1) / 2]} c="#9fbf72" cast={false} />
        {lk < 0.98 ? <Box s={[Math.min(x1, 130) - Math.max(x0, -130), 0.1, Math.min(z1, 60) - Math.max(z0, -140)]} p={[(Math.min(x1, 130) + Math.max(x0, -130)) / 2, -0.02, (Math.min(z1, 60) + Math.max(z0, -140)) / 2]} c={STREET} cast={false} /> : null}
      </G>)}
      {/* a rua na frente da torre: tampa o buraco quando o corte está fechado */}
      {open ? null : <Box s={[32.8, 0.12, 14.4]} p={[0, 0.0, FZ + 7.2]} c={WALK} cast={false} />}
      {lk > 0.01 ? <G>
        <Box s={[600, 0.1, 600]} p={[0, 0.16 + 0.02 * Math.sin(t * 2), 0]} c="#4fb0e6" o={{ rough: 0.25 }} cast={false} />
        {Array.from({ length: 30 }, (_, i) => <Box key={i} s={[2 + rnd(i) * 3, 0.03, 0.18]} p={[lerp(-40, 40, rnd(i + 3)) + fract(t * 0.05 + rnd(i)) * 4, 0.23, lerp(-40, 20, rnd(i + 7))]} c="#d6f1ff" o={{ emissive: "#bfe6ff", ei: 0.3 }} cast={false} />)}
        {[[-8, 6, 0.4], [10, -4, -0.6], [3, 12, 1.4]].map(([x, z, a], i) => <G key={i} p={[x + Math.sin(t * 0.8 + i) * 0.6, 0.25, z]} r={[0, a, 0]}><Box s={[3.2, 0.35, 0.8]} c="#8a5a32" /><Box s={[0.12, 1.4, 0.12]} p={[0.8, 0.7, 0]} r={[0, 0, -0.4]} c="#5a3a20" /></G>)}
        {Array.from({ length: 24 }, (_, i) => <Cone key={i} rad={0.25} h={1.6 + rnd(i) * 0.8} seg={4} p={[lerp(-30, 30, rnd(i + 11)), 0.8, lerp(-30, 16, rnd(i + 13))]} c="#6fa84a" cast={false} />)}
      </G> : null}
    </G>
  );
};
const BLOCK_C = ["#e8c9a0", "#f0dcc0", "#e6b8a2", "#d9cdb8", "#f2e2b8", "#c9d4c0"];
const FREE = (x: number, z: number) => (Math.abs(x) < 15 && z > -6 && z < 19) || (x > -48 && x < -6 && z > -17 && z < 3) || (Math.abs(x - ANGEL[0]) < 10 && Math.abs(z - ANGEL[2]) < 10) || (x > -30 && x < -14 && z > 6 && z < 28);
type Blk = { p: V3; w: number; d: number; h: number; c: string; i: number };
const BLOCKS: Blk[] = (() => {
  const out: Blk[] = [];
  for (let x = -90; x <= 90; x += 9) for (let z = -100; z <= 30; z += 9) {
    if (FREE(x, z)) continue;
    const i = out.length, far = Math.hypot(x, z) > 40;
    out.push({ p: [x + (rnd(i) - 0.5) * 1.5, 0, z + (rnd(i + 1) - 0.5) * 1.5], w: 5 + rnd(i + 2) * 2, d: 5 + rnd(i + 3) * 2, h: 1.6 + rnd(i + 4) * (far ? 5 : 3.4), c: BLOCK_C[i % BLOCK_C.length], i });
  }
  return out;
})();
/** 1985: prédios perto da torre caem em sequência */
const FALLERS = BLOCKS.filter((b) => Math.hypot(b.p[0], b.p[2]) < 34).map((b) => b.i).filter((_, k) => k % 3 === 0);
const fallK = (t: number, i: number) => { const j = FALLERS.indexOf(i); return j < 0 || !giro(t) ? 0 : ease(t, T.cayeron + j * 0.08, T.cayeron + 0.35 + j * 0.08) * (1 - ease(t, T.m2017 - 0.3, T.m2017)); };
const City: React.FC<{ t: number }> = ({ t }) => {
  const k = 1 - lakeK(t);
  if (k <= 0.7) return null; // no lago a cidade some de vez (os telhados boiavam na água)
  return (
    <G>
      {BLOCKS.map((b) => {
        const fall = fallK(t, b.i), h = b.h * k * (1 - 0.78 * fall);
        return <G key={b.i} p={b.p}>
          <Box s={[b.w, h + 0.01, b.d]} p={[0, h / 2, 0]} c={fall > 0.05 ? "#cdbfa8" : b.c} />
          {h > 1.2 ? <Box s={[b.w * 0.8, 0.06, 0.04]} p={[0, h * 0.6, b.d / 2 + 0.02]} c="#6a7a8a" cast={false} /> : null}
          <Box s={[b.w + 0.1, 0.14, b.d + 0.1]} p={[0, h + 0.05, 0]} c="#b8674a" cast={false} />
        </G>;
      })}
    </G>
  );
};
const Dust1985: React.FC<{ t: number }> = ({ t }) => {
  if (!giro(t) || t < T.cayeron - 0.1 || t > T.m2017) return null;
  return <G>{FALLERS.slice(0, 8).map((i, k) => { const b = BLOCKS[i]; return <Puffs key={k} t={t} p={[b.p[0], 0.3, b.p[2]]} n={6} period={1.6} rise={4} size={1.6} c="#d8cdb8" on={1 - ease(t, T.ella, T.m2017)} drift={[0.6, 0, 0.3]} o={k * 0.17} />; })}</G>;
};
const Alameda: React.FC<{ t: number }> = ({ t }) => (lakeK(t) > 0.9 ? null : (
  <G>
    <Box s={[22, 0.14, 15]} p={[-36, 0.02, -7]} c="#6fb04a" cast={false} />
    <Trees spots={[[-44, 0, -12], [-40, 0, -3], [-35, 0, -11], [-31, 0, -2], [-46, 0, -5], [-33, 0, -7], [-39, 0, -9], [-29, 0, -12]]} c={["#3f9a3a", "#55b444"]} />
  </G>
));
const Volcanoes: React.FC = () => (
  <G>
    {([[70, -230, 46, 62], [-10, -250, 60, 44], [-70, -240, 40, 40]] as const).map(([x, z, r, h], i) => (
      <G key={i}><Cone rad={r} h={h} seg={9} p={[x, h / 2 - 1, z]} c={i % 2 ? "#7d8f9a" : "#8a9aa2"} o={{ flat: true }} cast={false} />
        <Cone rad={r * 0.32} h={h * 0.32} seg={9} p={[x, h * 0.84 - 1, z]} c="#f4f8fb" o={{ flat: true }} cast={false} /></G>
    ))}
  </G>
);

// ---------------------------------------------------------------- Bellas Artes: mármore branco, cúpula laranja; afunda
export const baSink = (t: number) => (hook(t) || giro(t) ? -1.3 : rewind(t) ? lerp(-1.3, 0, rewK(t)) : t < T.hundido ? 0 : lerp(0, -1.3, ease(t, T.hundido, T.metros0 + 0.6)));
const BellasArtes: React.FC<{ t: number }> = ({ t }) => {
  if (lakeK(t) > 0.9) return null;
  const y = baSink(t), wob = t > T.hundido && t < T.metros0 + 0.6 ? 0.05 * Math.sin(t * 22) : 0;
  return (
    <G p={BA}>
      <Box s={[14, 0.1, 12]} p={[0, y - 0.05, 0]} c="#e9e1cf" cast={false} />
      {[0, 1, 2, 3].map((i) => <Box key={i} s={[6, 0.12, 0.5]} p={[0, y + (i + 0.5) * (-y / 4), 6.2 + i * 0.5]} c="#d8cfbc" cast={false} />)}
      <G p={[wob, y, 0]}>
        <Box s={[9, 3.2, 6.4]} p={[0, 1.6, 0]} c="#f6f2ea" />
        <Box s={[9.4, 0.4, 6.8]} p={[0, 3.3, 0]} c="#e8e0d0" />
        {Array.from({ length: 8 }, (_, i) => <Cyl key={i} rt={0.18} h={2.6} p={[-3.5 + i, 1.4, 3.35]} c="#ffffff" seg={8} />)}
        <Box s={[2.2, 1.8, 0.2]} p={[0, 0.9, 3.25]} c="#3a3a44" cast={false} />
        <Cyl rt={2.0} h={0.8} p={[0, 3.9, 0]} c="#f6f2ea" seg={16} />
        <Sph rad={2.3} pl={PI / 2} p={[0, 4.3, 0]} c="#f0a12a" o={{ rough: 0.45 }} ws={18} hs={10} />
        <Sph rad={0.6} p={[0, 6.6, 0]} c="#f7c34a" ws={10} hs={8} />
        {[-3.4, 3.4].map((x) => <Sph key={x} rad={1.0} pl={PI / 2} p={[x, 3.5, 0.6]} c="#f0b84a" ws={12} hs={8} />)}
        {/* «mientras lo construían»: andaimes de madeira na fachada */}
        {t > T.bellas - 0.1 && t < T.nohay ? <G>{[-4.9, -2.4, 0, 2.4, 4.9].map((x) => <Box key={x} s={[0.12, 6.4, 0.12]} p={[x, 3.2, 3.9]} c="#8a5a32" />)}
          {[1.2, 2.6, 4.0, 5.4].map((y) => <Box key={y} s={[10.2, 0.1, 0.5]} p={[0, y, 3.95]} c="#a07040" />)}</G> : null}
      </G>
    </G>
  );
};
const SinkGauge: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.hundido - 0.2 || t > T.nohay) return null;
  const y = baSink(t), k = Math.max(0.001, popK(t, T.hundido - 0.1));
  return (
    <G p={[BA[0], 0, BA[2] + 4.3]}>
      {Array.from({ length: 7 }, (_, i) => <Box key={i} s={[0.9 * k, 0.12, 0.08]} p={[-4.2 + i * 1.4, 3.55, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.8 }} cast={false} />)}
      <Arrow p={[2.8, 3.55, 0]} len={Math.max(0, -y - 0.45)} dir={-1} w={0.26} />
    </G>
  );
};

// ---------------------------------------------------------------- a torre: andares em pares, esqueleto de aço, vidro, mastro
/** deslocamento x do andar na altura y (balanço: o topo vai mais longe, como uma caña) */
const bend = (t: number, y: number) => swayAt(t) * Math.pow(y / BODY, 1.6);
const widthAt = (f: number) => (f >= 41 ? 0.7 : f >= 38 ? 0.84 : 1);
export const Tower: React.FC<{ t: number; ghost?: boolean; nfl?: number; skin?: number; xr?: number; c?: string }> = ({ t, ghost = false, nfl, skin, xr, c }) => {
  const n = nfl ?? floorsAt(t), sk = skin ?? skinK(t), xk = xr ?? xray(t);
  if (n <= 0.01) return null;
  const out: React.ReactNode[] = [], W = X1 - X0, D = Z1 - Z0, cz = (Z0 + Z1) / 2;
  const N = Math.ceil(n / 2), frame = !ghost && (sk < 0.5 || xk > 0.3);
  for (let i = 0; i < N; i++) {
    const f = i * 2, y0 = f * FH, k = Math.min(1, (n - f) / 2), h = 2 * FH * k, y1 = y0 + h;
    const wk = widthAt(f), w = W * wk, d = D * wk, x0 = ghost ? 0 : bend(t, y0), x1 = ghost ? 0 : bend(t, y1);
    const cols: [number, number][] = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, d / 2], [0, -d / 2]];
    out.push(<G key={i}>
      <Box s={[w, 0.12, d]} p={[x1, y1 - 0.06, cz]} c={ghost ? c ?? "#bfb6a8" : frame ? STEEL : "#d7dde2"} />
      {frame ? cols.map(([cx, cz2], j) => <Pipe key={j} a={[x0 + cx, y0, cz + cz2]} b={[x1 + cx, y1, cz + cz2]} rad={0.09} c={STEEL} seg={5} cast={false} />) : null}
      {ghost ? <G><Box s={[w - 0.05, h, d - 0.05]} p={[0, (y0 + y1) / 2, cz]} c={c ?? "#cfc6b6"} />
        {[-0.36, 0, 0.36].map((u) => <Box key={u} s={[0.06, h, 0.06]} p={[u * w, (y0 + y1) / 2, cz + d / 2 + 0.01]} c={ALU} cast={false} />)}</G> : sk > 0.01 ? (
        <G p={[(x0 + x1) / 2, (y0 + y1) / 2, cz]}>
          <Box s={[w - 0.04, h - 0.1, d - 0.04]} c={i % 2 ? GLASS : GLASS2} o={{ rough: 0.2, metal: 0.2, opacity: lerp(1, 0.18, xk), depthWrite: xk < 0.5 }} cast={xk < 0.5} />
          {xk < 0.5 ? [-0.36, 0, 0.36].map((u) => <Box key={u} s={[0.06, h, 0.06]} p={[u * w, 0, d / 2 + 0.01]} c={ALU} cast={false} />) : null}
        </G>) : null}
    </G>);
  }
  const top = n * FH, done = n >= FLOORS - 0.01 && !ghost, xt = bend(t, BODY);
  return (
    <G>
      {!ghost ? <Box s={[W + 0.6, 0.18, D + 0.6]} p={[0, 1.2, cz]} c="#e9e4da" cast={false} /> : null}
      {out}
      {done ? <G p={[xt, BODY, cz]}>
        <Box s={[W * 0.62, 0.7, D * 0.62]} p={[0, 0.35, 0]} c="#e9edf0" />
        <Cyl rt={0.5} rb={0.8} h={1.2} p={[0, 1.3, 0]} seg={8} c="#d6dde2" />
        {Array.from({ length: 6 }, (_, j) => <Box key={j} s={[0.22, 1.0, 0.22]} p={[0, 2.4 + j * 1.0, 0]} c={j % 2 ? "#ffffff" : "#e0262b"} />)}
        <Pipe a={[0, 1.9, 0]} b={[0, MAST_TOP - BODY, 0]} rad={0.07} c="#f4f4f4" seg={5} />
        <Sph rad={0.18} p={[0, MAST_TOP - BODY, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.2 }} />
      </G> : null}
      {!done && !ghost && top > 0.4 ? <G>
        <Box s={[0.4, 3.2, 0.4]} p={[X1 - 0.3, top + 1.6, Z0 + 0.3]} c="#f2c230" />
        <Pipe a={[X1 - 0.3, top + 3.2, Z0 + 0.3]} b={[X1 - 6, top + 3.2, Z0 + 0.3]} rad={0.13} c="#f2c230" seg={5} />
        <Pipe a={[X1 - 4.8, top + 3.2, Z0 + 0.3]} b={[X1 - 4.8, top + 1.2 + 0.4 * Math.sin(t * 2), Z0 + 0.3]} rad={0.03} c="#2a2a2a" seg={4} cast={false} />
        <Box s={[1.6, 0.18, 0.2]} p={[X1 - 4.8, top + 1.1 + 0.4 * Math.sin(t * 2), Z0 + 0.3]} c={STEEL} />
      </G> : null}
    </G>
  );
};

// ---------------------------------------------------------------- o subsolo em corte (na face z=FZ)
const jellyAt = (t: number) => Math.max(pulse(t, T.lago0, T.aguantado), 0.6 * pulse(t, T.debajo + 0.1, T.agua0 + 0.6), pulse(t, T.blando, T.agua0 + 0.6), pulse(t, T.hunde - 0.1, T.b1), pulse(t, T.tiembla, T.b4 + 0.4), pulse(t, T.mece - 0.2, T.esqueleto));
const SLICES = 9, SEGS = 24;
/** onda vertical do barro (gelatina): u = 0 na capa dura, 1 no topo; cresce para cima */
const mudWave = (t: number, x: number, u: number, A: number) => A * Math.pow(u, 1.4) * Math.sin(t * 10 - u * 7 - x * 0.35);
const Section: React.FC<{ t: number }> = ({ t }) => {
  if (!cutOpen(t)) return null;
  const j = jellyAt(t), qa = quakeAt(t);
  const ch = CLAY_TOP - HARD_TOP, quaking = t > T.tiembla - 0.2 && t < T.esqueleto ? 1 : 0, A = 0.24 * j + 0.55 * qa * quaking;
  const grow = t < T.bellas ? ease(t, T.agua0 - 0.1, T.agua0 + 0.4) : 0;
  // 11) «pesa demasiado»: o barro afunda sob a torre e estufa dos lados
  const bul = t > T.p2 - 0.1 && t < T.b2 + 0.2 ? ease(t, T.pesa, T.pesa + 0.5) : 0;
  const bulge = (x: number, u: number) => bul * u * u * (-0.4 * Math.exp(-((x / 2.6) ** 2)) + 0.32 * Math.exp(-(((Math.abs(x) - 5.5) / 1.6) ** 2)));
  return (
    <G>
      <Box s={[32, -CLAY_TOP, 0.04]} p={[0, CLAY_TOP / 2, FZ + 0.02]} c={FILL} cast={false} />
      {/* barro do lago em fatias (gelatina): a de cima balança mais = o tremor cresce para cima */}
      {Array.from({ length: SLICES }, (_, i) => {
        const u = (i + 0.5) / SLICES, y = HARD_TOP + ch * u;
        return Array.from({ length: SEGS }, (_, k) => { const x = -16 + (k + 0.5) * (32 / SEGS); return <Box key={`${i}-${k}`} s={[32 / SEGS + 0.02, ch / SLICES + 0.01, 0.04]} p={[x, y + mudWave(t, x, u, A) + bulge(x, u), FZ + 0.025]} c={i % 2 ? CLAY : CLAY2} cast={false} />; });
      })}
      <Drops t={t} A={A} grow={grow} />
      <Box s={[32, HARD_TOP - HARD_BOT, 0.04]} p={[0.05 * qa * quaking * Math.sin(t * 10), (HARD_TOP + HARD_BOT) / 2, FZ + 0.025]} c={HARD} cast={false} />
      {Array.from({ length: 40 }, (_, i) => <Sph key={i} rad={0.08 + rnd(i) * 0.06} p={[lerp(-15.5, 15.5, rnd(i + 2)), lerp(HARD_BOT + 0.1, HARD_TOP - 0.1, rnd(i + 5)), FZ + 0.05]} c={HARD2} cast={false} ws={6} hs={4} />)}
      <Box s={[32, HARD_BOT - DEEP, 0.04]} p={[0, (HARD_BOT + DEEP) / 2, FZ + 0.02]} c={DEEPC} cast={false} />
      <Box s={[32, -DEEP, 30]} p={[0, DEEP / 2, FZ - 15.05]} c={CLAY2} cast={false} />
      <Box s={[32.8, 0.4, 14]} p={[0, DEEP - 0.2, FZ + 7]} c="#5f6a58" />
      {[-16.2, 16.2].map((x) => <Box key={x} s={[0.4, -DEEP, 14]} p={[x, DEEP / 2, FZ + 7]} c={CLAY2} />)}
      <Box s={[32.8, -DEEP, 0.4]} p={[0, DEEP / 2, FZ + 14.2]} c={CLAY2} />
      {[[-16.2, FZ + 7, 0.12, 14], [16.2, FZ + 7, 0.12, 14], [0, FZ + 14.2, 32.8, 0.12], [0, FZ + 0.06, 32.8, 0.12]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.06, d]} p={[x, 0.06, z]} c="#ffe9a8" o={{ emissive: "#ffe9a8", ei: 0.3 }} cast={false} />)}
      {/* setas do tremor que crescem para cima (só no terremoto) */}
      {quaking ? [-9, 9].map((x) => [0, 1, 2].map((k) => { const u = (k + 0.5) / 3, y = HARD_TOP + ch * u; return <G key={`${x}${k}`} p={[x + 0.6 * qa * u * Math.sin(t * 9), y, FZ + 0.3]} r={[0, 0, PI / 2]}><Arrow p={[0, -0.4 - 1.2 * u, 0]} len={(0.6 + 2.2 * u * qa) * (0.7 + 0.3 * Math.sin(t * 9 - k * 1.5)) * (t < T.agranda ? 0.4 : Math.max(0.4, popK(t, T.agranda + k * 0.22, 0.3)))} dir={1} /></G>; })) : null}
    </G>
  );
};
const DROPS = 140;
const Drops: React.FC<{ t: number; A: number; grow: number }> = ({ t, A, grow }) => {
  const [im, o] = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat(WATER, { emissive: "#1f8fe0", ei: 0.6 }), DROPS);
    m.castShadow = false; m.frustumCulled = false; return [m, new THREE.Object3D()] as const;
  }, []);
  // as gotas seguem a onda do barro e incham em «casi todo agua» (tudo função de t: cada quadro reescreve as matrizes)
  for (let i = 0; i < DROPS; i++) {
    const x = lerp(-15.5, 15.5, rnd(i * 3 + 1)), y = lerp(HARD_TOP + 0.15, CLAY_TOP - 0.15, rnd(i * 3 + 2)), u = (y - HARD_TOP) / (CLAY_TOP - HARD_TOP);
    o.position.set(x, y + mudWave(t, x, u, A), FZ + 0.06); o.scale.setScalar(lerp(0.09, 0.2, rnd(i * 3 + 3)) * (1 + 0.45 * grow)); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
  }
  im.instanceMatrix.needsUpdate = true;
  return <primitive object={im} />;
};

/** «tan blando»: uma estaca encostada no barro afunda sozinha */
const Stake: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.debajo + 0.02 || t > T.bellas || !cutOpen(t)) return null; // ponytail: antes do corte a estaca boiava sobre o lago
  const k = ease(t, T.blando - 0.15, T.agua0 + 0.25), y = lerp(0.9, -3.4, k);
  return (
    <G p={[0.6, y, FZ + 0.4]} r={[0, 0, 0.1 * Math.sin(t * 7) * (1 - k)]}>
      <Box s={[0.34, 3.2, 0.34]} p={[0, 1.6, 0]} c="#8a5a32" />
      <Box s={[0.4, 0.14, 0.4]} p={[0, 3.2, 0]} c="#6a4024" />
      <Cone rad={0.24} h={0.6} p={[0, -0.3, 0]} r={[PI, 0, 0]} seg={4} c="#6a4024" />
    </G>
  );
};

// ---------------------------------------------------------------- a torre ingênua (sem pilotes) que afunda na gelatina
const Naive: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p1 - 0.1 || t > T.b1 + 0.3) return null;
  const drop = ease(t, T.torreAsi - 0.1, T.torreAsi + 0.35), sink = Math.pow(prog(t, T.hunde - 0.1, T.gelatina + 0.6), 1.3);
  const y = lerp(9, 0, drop) - 4.4 * sink, tilt = 0.3 * sink;
  return (
    <G>
      <G p={[-0.2, y, 0.62]} r={[0, 0, tilt]}><Tower t={0} ghost nfl={30} c={GLASS} /></G>
      {sink > 0.05 ? [0, 1, 2].map((k) => { const u = fract(t * 1.8 + k / 3); return <mesh key={k} position={[0, 0.04, 1.3]} rotation={[-PI / 2, 0, 0]} material={mat("#6b7a62")}><ringGeometry args={[2.8 + u * 3, 3 + u * 3, 28]} /></mesh>; }) : null}
      <XMark t={t} a={T.gelatina} b={T.b1 - 0.05} p={[0, 9, FZ + 1]} sc={2.4} />
    </G>
  );
};

// ---------------------------------------------------------------- os pilotes (7 visíveis na face) e o bate-estaca
export const PX = [-2.2, -1.45, -0.72, 0, 0.72, 1.45, 2.2];
const pileDepth = (i: number, t: number) => ease(t, PILE_T(i), PILE_T(i) + 0.32);
const PILE_LEN = -HARD_TOP + 0.35;            // do chão até dentro da capa dura
const RISE = PILE_LEN * 0.7;                  // quanto fica para fora antes de cravar
const cut = (t: number) => t > T.b2 + 0.3;  // depois do cajón, cortados no fundo dele
const Piles: React.FC<{ t: number }> = ({ t }) => {
  if (!cutOpen(t) || (!built(t) && t < T.c1 - 0.1)) return null;
  const hitGlow = (i: number) => (built(t) ? 0 : Math.sin(PI * clamp(prog(t, PILE_T(i) + 0.3, PILE_T(i) + 0.8))));
  return (
    <G>
      {PX.map((x, i) => {
        if (!built(t) && t < PILE_T(i) - 0.25) return null;
        const off = built(t) ? 0 : RISE * (1 - pileDepth(i, t)), bot = HARD_TOP - 0.35 + off, top = cut(t) || built(t) ? BOX_BOT : off;
        return <G key={i}>
          <Box s={[0.32, top - bot, 0.32]} p={[x, (top + bot) / 2, FZ + 0.12]} c={CONC} />
          {hitGlow(i) > 0.02 ? <Sph rad={0.5 + 0.4 * hitGlow(i)} p={[x, HARD_TOP - 0.2, FZ + 0.2]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 1.4, opacity: 0.7 * hitGlow(i), depthWrite: false }} cast={false} ws={10} hs={8} /> : null}
        </G>;
      })}
      {/* os outros (a torre tem 361): os topos em grade, surgindo */}
      {!built(t) && t > T.pilotes0 + 0.3 ? Array.from({ length: 35 }, (_, i) => { const x = lerp(X0 + 0.3, X1 - 0.3, (i % 7) / 6), z = lerp(Z0 + 0.3, Z1 - 0.6, Math.floor(i / 7) / 4); const k = popK(t, T.pilotes0 + 0.3 + i * 0.03, 0.2); return <Cyl key={i} rt={0.13} h={0.3} p={[x, (cut(t) ? BOX_BOT : 0) + 0.15, z]} sc={Math.max(0.001, k)} c="#9a958a" seg={6} cast={false} />; }) : null}
    </G>
  );
};
const PileDriver: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.c1 - 0.1 || t > T.p2 || !cutOpen(t)) return null;
  const i = PX.reduce((b, _, k) => (t > PILE_T(k) - 0.3 ? k : b), 0), x = PX[i], ph = fract((t - PILE_T(i)) / 0.16);
  const striking = t > PILE_T(i) && t < PILE_T(i) + 0.36;
  const hammerY = RISE * (1 - pileDepth(i, t)) + (striking ? 0.2 + 1.0 * ph : 1.2);
  return (
    <G p={[x, 0, FZ + 0.12]}>
      {[-0.55, 0.55].map((dx) => <Box key={dx} s={[0.18, 7.2, 0.18]} p={[dx, 3.6, -0.5]} c="#f2c230" />)}
      <Box s={[1.4, 0.24, 0.3]} p={[0, 7.2, -0.5]} c="#f2c230" />
      <Box s={[0.7, 0.7, 0.6]} p={[0, hammerY + 0.35, 0]} c="#3a3f48" />
      <Pipe a={[0, 7.2, -0.3]} b={[0, hammerY + 0.7, 0]} rad={0.03} c="#2a2a2a" seg={4} cast={false} />
      <Box s={[2.0, 0.6, 1.6]} p={[0, 0.3, -2.0]} c="#3a7fc0" />
      <Puffs t={t} p={[0.4, 0.8, -2.0]} n={5} period={1} rise={2.5} size={0.4} c="#9a9a9a" />
    </G>
  );
};

/** «a más de treinta metros»: a fita amarela desce da rua até a capa dura, com marcas */
const DepthRuler: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.treinta - 0.3 || t > T.p2 || !cutOpen(t)) return null;
  const k = ease(t, T.treinta - 0.25, T.treinta + 0.45), y = lerp(0, HARD_TOP, k), o = { emissive: "#ffb000", ei: 0.8 };
  return (
    <G p={[3.5, 0, FZ + 0.35]}>
      <Box s={[0.8, 0.12, 0.12]} c="#ffd43a" o={o} cast={false} />
      <Box s={[0.14, -y + 0.01, 0.12]} p={[0, y / 2, 0]} c="#ffd43a" o={o} cast={false} />
      {Array.from({ length: 5 }, (_, i) => (-(i + 1) > y ? <Box key={i} s={[0.42, 0.08, 0.12]} p={[0, -(i + 1), 0]} c="#ffd43a" o={o} cast={false} /> : null))}
      {k > 0.98 ? <Box s={[0.8, 0.12, 0.12]} p={[0, HARD_TOP, 0]} c="#ffd43a" o={o} cast={false} /> : null}
      <Cone rad={0.26} h={0.4} p={[0, y + 0.05, 0]} r={[PI, 0, 0]} seg={4} c="#ffd43a" o={o} cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- o peso demais (setas vermelhas) e o cajón
const Weight: React.FC<{ t: number }> = ({ t }) => {
  const k = t > T.p2 - 0.1 && t < T.b2 + 0.2 ? ease(t, T.p2, T.pesa + 0.3) : 0;
  if (k <= 0.01) return null;
  return <G>{[-1.8, -0.6, 0.6, 1.8].map((x, i) => <Arrow key={i} p={[x, -0.2 - 0.3 * Math.abs(Math.sin(t * 6 + i)), FZ + 0.5]} len={(1.6 + 0.5 * Math.sin(t * 5 + i)) * k} dir={-1} />)}</G>;
};
/** blocos de terra já no prato (o último cai em «compensa») */
const landedN = (t: number) => { let n = 0; for (let i = 0; i < DIRT_N; i++) if (t >= DIRT_T(i) + DIRT_FLY) n++; return n; };
/** a balança: pende para a torre; cada bloco que cai a levanta um pouco e o último, em «compensa», a põe quase em equilíbrio
 *  (com rebote) — «buena parte», não tudo */
const scaleTilt = (t: number) => {
  const pre = lerp(-0.9, -0.6, clamp(landedN(t) / (DIRT_N - 1)));
  if (t < T.compensa) return pre;
  const d = t - T.compensa;
  return lerp(-0.6, -0.2, outBack(prog(t, T.compensa, T.compensa + 0.55))) + 0.05 * Math.sin(d * 11) * Math.exp(-d * 2.2);
};
/** onde cada bloco assenta no prato (pilha de 3×3, 3×3, 2×2, 1, 1) */
const SLOTS: V3[] = (() => {
  const o: V3[] = [];
  const lay = (n: number, y: number) => { for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) o.push([(a - (n - 1) / 2) * 0.3, y, (b - (n - 1) / 2) * 0.3]); };
  lay(3, 0.15); lay(3, 0.43); lay(2, 0.71); lay(1, 0.99); lay(1, 1.27);
  return o;
})();
/** «flota en parte, como un barco»: torre e cajón sobem e descem juntos (o barquinho no mesmo compasso) */
const floatK = (t: number) => ease(t, T.flota - 0.15, T.flota + 0.25) * (1 - ease(t, T.cajon + 0.3, T.cajon + 0.8));
const bobY = (t: number) => floatK(t) * 0.75 * (0.5 - 0.5 * Math.cos((t - T.flota) * 4.2)); // só sobe: descola dos pilotes e volta
const bobR = (t: number) => floatK(t) * 0.05 * Math.sin((t - T.flota) * 4.2 + 1.2);
const Cajon: React.FC<{ t: number }> = ({ t }) => {
  if (!cutOpen(t) || (!built(t) && t < T.b2 - 0.1)) return null;
  const dug = built(t) ? 1 : ease(t, T.cavan, T.tierra + 0.3), walls = built(t) ? 1 : ease(t, T.cavan + 0.2, T.sacan + 0.3);
  return (
    <G p={[0, bobY(t), 0]} r={[0, 0, bobR(t)]}>
      {/* a terra que ainda falta tirar, na face */}
      {dug < 0.99 ? <Box s={[X1 - X0 + 0.4, -BOX_BOT * (1 - dug) + 0.01, 0.06]} p={[0, BOX_BOT * (1 - dug) / 2 + BOX_BOT * dug, FZ + 0.08]} c={FILL} cast={false} /> : null}
      {/* caixa de concreto em corte (U) */}
      <G sc={[1, Math.max(0.001, walls), 1]}>
        <Box s={[X1 - X0 + 0.5, 0.3, 0.3]} p={[0, BOX_BOT + 0.15, FZ + 0.15]} c={CONC} />
        {[X0 - 0.1, X1 + 0.1].map((x) => <Box key={x} s={[0.3, -BOX_BOT, 0.3]} p={[x, BOX_BOT / 2, FZ + 0.15]} c={CONC} />)}
        <Box s={[X1 - X0 - 0.2, -BOX_BOT - 0.3, 0.05]} p={[0, BOX_BOT / 2 + 0.15, FZ + 0.07]} c="#d8d2c6" cast={false} />
        {[-1.2, 0, 1.2].map((x) => <Box key={x} s={[0.12, -BOX_BOT - 0.3, 0.12]} p={[x, BOX_BOT / 2 + 0.15, FZ + 0.12]} c="#b8b2a6" cast={false} />)}
      </G>
    </G>
  );
};
/** «sacan miles de toneladas de tierra»: uma corrente de blocos sai do cajón em arco e cai no prato da balança */
const Dirt: React.FC<{ t: number }> = ({ t }) => {
  if (!cutOpen(t) || built(t) || t < T.cavan || t > T.compensa + 0.05) return null;
  const ang = Math.atan2(scaleTilt(t), 2.2), pan: V3 = [SC[0] - 2.2 * Math.cos(ang), 2.6 - 2.2 * Math.sin(ang) - 0.58, SC[2]];
  return (
    <G>
      {Array.from({ length: DIRT_N }, (_, i) => {
        const a = DIRT_T(i), u = prog(t, a, a + DIRT_FLY);
        if (t < a || u >= 1) return null;
        const from: V3 = [lerp(-1.8, 1.8, rnd(i + 40)), BOX_BOT * ease(a, T.cavan, T.tierra + 0.3) + 0.15, FZ + 0.45];
        const to: V3 = [pan[0] + SLOTS[i][0], pan[1] + SLOTS[i][1], pan[2] + SLOTS[i][2]];
        const p = vlerp(from, to, u); p[1] += Math.sin(u * PI) * 4.2;
        const z = lerp(0.55, 0.28, u); // grandes saindo do buraco, do tamanho da pilha ao chegar
        return <Box key={i} s={[z, z * 0.9, z]} p={p} r={[u * 4, u * 3, 0]} c={i % 2 ? FILL : "#7a5a3a"} />;
      })}
    </G>
  );
};
const Scale: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b2 - 0.1 || t > T.p4 + 0.2) return null;
  const k = popK(t, T.b2, 0.3), ang = Math.atan2(scaleTilt(t), 2.2);
  return (
    <G p={SC} sc={Math.max(0.001, k)}>
      <Box s={[1.6, 0.3, 1.2]} p={[0, 0.15, 0]} c="#7a5a3a" /><Cyl rt={0.14} h={2.4} p={[0, 1.4, 0]} c="#d4a64a" seg={8} />
      <G p={[0, 2.6, 0]} r={[0, 0, ang]}>
        <Box s={[4.6, 0.14, 0.14]} c="#d4a64a" />
        {[-1, 1].map((s) => <G key={s} p={[s * 2.2, 0, 0]} r={[0, 0, -ang]}><Pipe a={[0, 0, 0]} b={[0, -0.6, 0]} rad={0.03} c="#8a6a2a" seg={4} /><Cyl rt={0.9} h={0.08} p={[0, -0.62, 0]} c="#d4a64a" seg={14} />
          {s < 0 ? Array.from({ length: landedN(t) }, (_, k) => <Box key={k} s={[0.28, 0.28, 0.28]} p={[SLOTS[k][0], -0.58 + SLOTS[k][1], SLOTS[k][2]]} r={[0, rnd(k) * 0.6, 0]} c={k % 2 ? FILL : "#7a5a3a"} />) : null}</G>)}
      </G>
      {/* no prato direito: a torrezinha (o peso do edifício) */}
      <G p={[2.2 * Math.cos(ang), 2.6 + 2.2 * Math.sin(ang) - 0.58, 0]} sc={1 + 0.35 * Math.sin(PI * clamp((t - T.torre3) / 0.45))}><Box s={[0.5, 1.6, 0.5]} p={[0, 0.8, 0]} c={GLASS} /><Box s={[0.14, 0.5, 0.14]} p={[0, 1.85, 0]} c="#e0262b" /></G>
      <Check t={t} a={T.compensa + 0.45} b={T.p4} p={[0, 4.4, 0.5]} sc={1.4} />
    </G>
  );
};
/** o barquinho: «la torre flota, como un barco» */
const Boat: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.barco - 0.2 || t > T.p4) return null;
  const k = popK(t, T.barco - 0.1, 0.3), w = (t - T.flota) * 4.2;
  return (
    <G p={[-6.4, 0.6 + 0.36 * Math.sin(w), 2.0]} sc={Math.max(0.001, k) * 1.05} r={[0, 0, 0.14 * Math.sin(w + 1.2)]}>
      <Box s={[2.6, 0.5, 1.0]} c="#d23c3c" /><Box s={[2.0, 0.2, 0.9]} p={[0, -0.32, 0]} c="#8a2a1e" />
      <Box s={[0.1, 1.6, 0.1]} p={[0, 1.0, 0]} c="#5a3a20" /><Box s={[0.8, 1.0, 0.05]} p={[0.42, 1.1, 0]} c="#f4efe2" />
      {[0, 1, 2].map((q) => { const u = fract(t * 1.4 + q / 3); return <mesh key={q} position={[0, -0.3, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#bfe6ff", { emissive: "#bfe6ff", ei: 0.3 })}><ringGeometry args={[1.4 + u * 1.6, 1.5 + u * 1.6, 24]} /></mesh>; })}
    </G>
  );
};

// ---------------------------------------------------------------- a casa vizinha (cenário ao lado da torre)
const Neighbor: React.FC<{ t: number }> = ({ t }) => (lakeK(t) > 0.9 ? null : (
  <G p={NH}>
    <Box s={[2.6, 3.0, 2.8]} p={[0, 1.5, 0]} c="#e9b87a" />
    {[0.6, 1.6, 2.5].map((y) => [-0.7, 0, 0.7].map((x) => <Box key={`${x}${y}`} s={[0.4, 0.55, 0.05]} p={[x, y, 1.42]} c="#4a6a8a" cast={false} />))}
    <Box s={[2.8, 0.22, 3.0]} p={[0, 3.1, 0]} c="#b8674a" />
    {cutOpen(t) ? <Box s={[2.6, 0.6, 0.06]} p={[0, -0.3, FZ - NH[2] + 0.07]} c="#a08a70" cast={false} /> : null}
  </G>
));

// ---------------------------------------------------------------- o prédio rígido (tijolo) que racha e cai no tremor
const brFall = (t: number) => ease(t, T.plato, T.plato + 0.45);
const Brick: React.FC<{ t: number }> = ({ t }) => {
  if (lakeK(t) > 0.9 || giro(t) || t < T.p4 - 1) return null;
  const f = brFall(t), q = quakeAt(t);
  return (
    <G p={[BR[0] + q * 0.12 * Math.sin(t * 29), 0, BR[2]]}>
      {[0, 1, 2, 3].map((i) => {
        const y = i * 1.05 * (1 - 0.8 * f), off = f * (i % 2 ? 0.5 : -0.4) * i * 0.4 + (1 - f) * q * 0.1 * i * Math.sin(t * 13);
        return <Box key={i} s={[2.8, 1.0, 2.8]} p={[off, y + 0.5, 0]} r={[0, 0, f * (i % 2 ? 0.2 : -0.15)]} c={i % 2 ? "#b8553a" : "#c8653f"} />;
      })}
      {f > 0.6 ? <Puffs t={t} p={[0, 0.4, 0.6]} n={6} period={1.2} rise={3} size={1.1} c="#d8c4a8" on={1 - ease(t, T.c4, T.mece)} /> : null}
      <XMark t={t} a={T.plato + 0.5} b={T.b4 - 0.05} p={[0, 3.2, 1.6]} sc={1.3} />
    </G>
  );
};

// ---------------------------------------------------------------- «no hay computadoras»: papel, régua de cálculo, os Zeevaert
export const ZEE: Costume = { skin: "#e8b48c", top: "#4a5060", bottom: "#3a3f4a", hat: "straw", hatC: "#2f3440", boot: "#1a1a1a", sleeves: true };
const ADOLFO: Costume = { skin: "#e0aa82", top: "#6a5a48", bottom: "#4a4038", hat: "straw", hatC: "#4a3a2a", boot: "#1a1a1a", sleeves: true };
const Nope: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.nohay - 0.1 || t > T.p1) return null;
  const out = (a: number, b: number) => Math.max(0.001, popK(t, a) * (1 - ease(t, b - 0.12, b + 0.12)));
  return (
    <G p={NP}>
      <Box s={[3.4, 0.12, 1.8]} p={[0.3, 1.0, 0]} c="#9a6a3a" />
      {[[-1.3, -0.8], [1.9, -0.8], [-1.3, 0.8], [1.9, 0.8]].map(([x, z], i) => <Box key={i} s={[0.12, 1.0, 0.12]} p={[x, 0.5, z]} c="#6a4a2a" />)}
      <G p={[-0.6, 1.06, -0.2]} sc={out(T.nohay, T.papel)}>
        <Box s={[0.95, 0.8, 0.8]} p={[0, 0.4, 0]} c="#e8e0c8" /><Box s={[0.72, 0.56, 0.02]} p={[0, 0.45, 0.41]} c="#2f6fb0" o={{ emissive: "#3f9fff", ei: 0.8 }} cast={false} />
      </G>
      <XMark t={t} a={T.compu + 0.35} b={T.papel} p={[-0.6, 1.9, 0.6]} sc={0.9} />
      {[0, 1, 2].map((i) => { const a = T.papel + i * 0.12, u = ease(t, a, a + 0.3); return t > a ? <Box key={i} s={[0.9, 0.02, 0.65]} p={[0.9 + i * 0.12, lerp(2.6, 1.08 + i * 0.02, u), -0.1 + i * 0.05]} r={[0, 0.2 * i, (1 - u) * 0.8]} c="#f6ebc8" /> : null; })}
      {t > T.lapiz0 - 0.05 ? <G p={[1.0 + 0.25 * Math.sin(t * 7), 1.16, 0.0 + 0.12 * Math.sin(t * 11)]} r={[0, 0.4, 1.1]} sc={Math.max(0.001, popK(t, T.lapiz0 - 0.05)) * 1.6}><Cyl rt={0.04} h={0.6} c="#f2c230" seg={6} /><Cone rad={0.04} h={0.1} p={[0, -0.35, 0]} r={[PI, 0, 0]} c="#2a2a2a" seg={6} /></G> : null}
      {t > T.hermanos - 0.2 ? <Worker p={[2.6, 0, -1.2]} yaw={-0.9} pose={poseOf(t < T.zeevaert ? "present" : "point", t)} t={t} c={ADOLFO} scale={Math.max(0.001, popK(t, T.hermanos - 0.1)) * 1.05} /> : null}
    </G>
  );
};
/** 1957: o sismógrafo para tremor forte que a cidade não tinha (aparece na mesa e leva ✖) */
const Seismo: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[5] - 0.2 || t > T.midio) return null;
  const k = popK(t, T.aparato - 0.15, 0.3), br = ease(t, T.fuerte + 0.3, T.fuerte + 0.8); // T.fuerte = «terremoto»: quebra em «…moto fuerte»
  return (
    <G p={NP}>
      <Box s={[3.4, 0.12, 1.8]} p={[0.3, 1.0, 0]} c="#9a6a3a" />
      {[[-1.3, -0.8], [1.9, -0.8], [-1.3, 0.8], [1.9, 0.8]].map(([x, z], i) => <Box key={i} s={[0.12, 1.0, 0.12]} p={[x, 0.5, z]} c="#6a4a2a" />)}
      <G p={[0.2, 1.06, 0]} sc={Math.max(0.001, k)}>
        <Box s={[1.6, 0.25, 0.9]} p={[0, 0.12, 0]} r={[0, 0, -0.22 * br]} c="#3a4a5a" />
        <G p={[1.4 * br, 0.62 + 1.3 * Math.sin(PI * br) - 1.36 * br, 0.3 * br]} r={[br * 2.5, 0, -br * 3]}>
          <Cyl rt={0.32} h={1.2} r={[0, 0, PI / 2]} c="#f4efe2" seg={16} />
          <Box s={[1.2, 0.02, 0.04]} p={[0, 0, 0.33]} c="#d23c3c" cast={false} />
        </G>
        <Box s={[0.05, 0.6, 0.05]} p={[0.3 - 0.6 * br, 0.95 + 1.1 * Math.sin(PI * br), 0.3 + 0.5 * br]} r={[0.5 + br * 5, 0, br * 2]} c="#2a2a2a" />
      </G>
      {br > 0.3 ? <Puffs t={t} p={[0.9, 1.2, 0.2]} n={5} period={1} rise={1.4} size={0.45} c="#d8cdb8" on={1 - ease(t, T.midio - 0.5, T.midio)} /> : null}
      <XMark t={t} a={T.aparato + 0.35} b={T.midio} p={[0.2, 2.6, 0.7]} sc={1.1} />
    </G>
  );
};
/** o aparelho da torre: uma vara presa à diagonal de aço, uma alavanca e um lápis que desenha num disco girado por um relógio */
const SPIN_W = 1.6, TR_DT = 0.03, PEN_A = 0.11;
const spinAt = (t: number) => Math.max(0, t - T.midio) * SPIN_W;
/** raio do traço no instante tt: espiral lenta (não repassa por cima) + o tremor do lápis quando a terra treme */
const traceR = (tt: number) => 0.5 - 0.07 * (spinAt(tt) / (2 * PI)) + PEN_A * clamp(quakeAt(tt) / 0.6) * Math.sin(tt * 40);
const Recorder: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.midio - 0.3 || t > CUTS[6]) return null;
  const spin = spinAt(t), rNow = traceR(t), pen: V3 = [0.3 + rNow - 0.158, 1.375, 0.3];
  const segs: React.ReactNode[] = [];
  for (let k = 1; T.midio + k * TR_DT <= t; k++) {
    // ponto desenhado no instante tt fica no ângulo −spin(tt) do disco: hoje ele está sob o lápis (ângulo 0) e gira para longe
    const P = (tt: number): [number, number] => { const ph = -spinAt(tt), r = traceR(tt); return [r * Math.cos(ph), r * Math.sin(ph)]; };
    const a = P(T.midio + (k - 1) * TR_DT), b = P(T.midio + k * TR_DT), dx = b[0] - a[0], dz = b[1] - a[1];
    segs.push(<Box key={k} s={[Math.hypot(dx, dz) + 0.012, 0.012, 0.028]} p={[(a[0] + b[0]) / 2, 0.022, (a[1] + b[1]) / 2]} r={[0, -Math.atan2(dz, dx), 0]} c="#c8201a" cast={false} />);
  }
  return (
    <G p={REC}>
      {/* um andar alto da torre em corte: lajes acima e abaixo, vidro com caixilhos (a cidade lá embaixo) e o aço vermelho */}
      {[-2, -1, 0, 1, 2].map((f) => <G key={f} p={[0, f * 3.9, 0]}>
        <Box s={[5.6, 0.22, 3.6]} c="#cfd6dc" cast={false} />
        <Box s={[5.6, 3.68, 0.08]} p={[0, 1.95, -1.76]} c={GLASS2} o={{ rough: 0.2, metal: 0.2, opacity: 0.38, depthWrite: false }} cast={false} />
        {[-1.8, -0.6, 0.6, 1.8].map((x) => <Box key={x} s={[0.07, 3.68, 0.07]} p={[x, 1.95, -1.7]} c={ALU} cast={false} />)}
        {[-2.7, 2.7].map((x) => <Box key={x} s={[0.24, 3.9, 0.24]} p={[x, 1.95, -1.55]} c={STEEL} cast={false} />)}
      </G>)}
      <Pipe a={[-2.4, 0.2, -1.45]} b={[2.4, 3.6, -1.45]} rad={0.1} c={STEEL} seg={6} />
      {/* a vara e a alavanca */}
      <Pipe a={[-0.6, 1.07 + 0.42, -1.4]} b={[-0.15, 1.2, 0]} rad={0.035} c="#8a8f94" seg={5} />
      {/* a mesinha, o relógio e o disco */}
      <Box s={[2.0, 0.1, 1.4]} p={[0.3, 1.0, 0.2]} c="#7a5a3a" />
      {[[-0.6, -0.4], [1.2, -0.4], [-0.6, 0.8], [1.2, 0.8]].map(([x, z], i) => <Box key={i} s={[0.08, 1.0, 0.08]} p={[x, 0.5, z]} c="#5a3a20" />)}
      <G p={[1.0, 1.25, -0.25]}><Box s={[0.5, 0.4, 0.3]} c="#d4a64a" /><Cyl rt={0.15} h={0.02} r={[PI / 2, 0, 0]} p={[0, 0.02, 0.16]} c="#ffffff" seg={14} /><Box s={[0.02, 0.11, 0.01]} p={[0, 0.05, 0.18]} r={[0, 0, -t * 6]} c="#1a1a1a" cast={false} /></G>
      <G p={[0.3, 1.07, 0.3]} r={[0, -spin, 0]}>
        <Cyl rt={0.62} h={0.03} c="#fbf7ec" seg={28} />
        {segs}
      </G>
      {/* o lápis na ponta da alavanca: a ponta encosta no disco onde o traço nasce e treme com o terremoto */}
      <G p={pen} r={[0, 0, 0.5]}><Cyl rt={0.03} h={0.5} c="#f2c230" seg={6} /><Cone rad={0.03} h={0.08} p={[0, -0.29, 0]} r={[PI, 0, 0]} c="#2a2a2a" seg={6} /></G>
      <Pipe a={[-0.15, 1.2, 0]} b={pen} rad={0.025} c="#8a8f94" seg={5} />
    </G>
  );
};
/** «como una caña»: o junco verde ao lado, dobrando junto com a torre */
const Reed: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cana - 0.2 || t > T.giro) return null;
  const k = popK(t, T.cana - 0.15, 0.3), sw = swayAt(t) / 1.6;
  return (
    <G p={REED} sc={Math.max(0.001, k) * 1.4}>
      {Array.from({ length: 8 }, (_, i) => { const u0 = i / 8, u1 = (i + 1) / 8, b0 = sw * Math.pow(u0, 1.6) * 3, b1 = sw * Math.pow(u1, 1.6) * 3; return <Pipe key={i} a={[b0, u0 * 7, 0]} b={[b1, u1 * 7, 0]} rad={0.12 - i * 0.01} c={i % 2 ? "#6fbf4a" : "#5aa83a"} seg={6} />; })}
      {[2.2, 4.2].map((y, i) => <G key={i} p={[sw * Math.pow(y / 7, 1.6) * 3, y, 0]} r={[0, 0, i ? -0.7 : 0.8]}><Box s={[0.08, 1.6, 0.3]} p={[0, 0.8, 0]} c="#7fcf5a" /></G>)}
    </G>
  );
};

// ---------------------------------------------------------------- o giro: o Anjo da Independência cai em 1957
const angelFall = (t: number) => (giro(t) ? ease(t, T.tiro, T.tiro + 0.8) * (1 - ease(t, T.m1985 - 0.2, T.m1985 + 0.2)) : 0);
const Angel: React.FC<{ t: number }> = ({ t }) => {
  if (lakeK(t) > 0.9) return null;
  const f = angelFall(t), q = quakeAt(t);
  const p: V3 = [lerp(0, 3.4, f), lerp(15.2, 0.8, f * f), lerp(0, 1.2, f)];
  return (
    <G p={ANGEL}>
      <Cyl rt={4.2} h={0.3} p={[0, 0.15, 0]} c="#d6cfbf" seg={20} />
      <Box s={[3.2, 2.0, 3.2]} p={[0, 1.0, 0]} c="#e9e4da" />
      <G p={[q * 0.25 * Math.sin(t * 7), 0, 0]}>
        <Cyl rt={0.55} rb={0.7} h={12} p={[0, 8, 0]} c="#f2efe8" seg={12} />
        <Cyl rt={0.9} h={0.9} p={[0, 14.4, 0]} c="#e0c060" seg={12} />
        {[2.4, 6.0, 10.0].map((y) => <Cyl key={y} rt={0.72} h={0.35} p={[0, y, 0]} c="#e0b040" o={{ metal: 0.4, rough: 0.4 }} seg={12} />)}
      </G>
      <G p={p} r={[f * 1.4, 0, f * 1.9]} sc={1.6}>
        <Cyl rt={0.22} rb={0.36} h={1.4} p={[0, 0.7, 0]} c="#f0c030" o={{ metal: 0.5, rough: 0.35 }} seg={10} />
        <Sph rad={0.26} p={[0, 1.6, 0]} c="#f0c030" o={{ metal: 0.5, rough: 0.35 }} ws={10} hs={8} />
        {[-1, 1].map((s) => <Box key={s} s={[0.9, 0.08, 0.5]} p={[s * 0.5, 1.2, -0.15]} r={[0, 0, s * 0.6]} c="#f7d44a" o={{ metal: 0.5, rough: 0.35 }} />)}
        <Box s={[0.08, 0.9, 0.08]} p={[0.32, 2.0, 0]} c="#f7d44a" />
      </G>
      {f > 0.95 ? <Puffs t={t} p={[3.4, 0.5, 1.2]} n={6} period={1.2} rise={2.6} size={1.0} c="#e8dcc6" on={1 - ease(t, T.intacta + 0.4, T.m1985)} /> : null}
    </G>
  );
};

const N85: [number, number, number, string][] = [[-2.6, 14.5, 0, "#e8c9a0"], [2.8, 12.5, 1, "#e6b8a2"], [-3.4, 9.5, 2, "#f2e2b8"], [3.6, 7.5, 3, "#c9d4c0"]];
const fall85 = (t: number, j: number) => ease(t, T.cayeron - 0.15 + j * 0.28, T.cayeron + 0.2 + j * 0.28);
const Neighbors85: React.FC<{ t: number }> = ({ t }) => {
  if (!giro(t) || t < T.m1985 - 0.02 || t > T.m2017 - 0.02) return null;
  const q = quakeAt(t);
  return <G>{N85.map(([x, z, j, c]) => {
    const f = fall85(t, j), fh = lerp(1.0, 0.24, f);
    return <G key={j} p={[x + (1 - f) * q * 0.14 * Math.sin(t * 17 + j), 0, z]}>
      {[0, 1, 2, 3].map((i) => <G key={i}>
        <Box s={[2.6, fh - 0.05, 2.6]} p={[f * (i % 2 ? 0.25 : -0.2), i * fh + fh / 2, 0]} r={[0, 0, f * (i % 2 ? 0.07 : -0.05)]} c={c} />
        {f < 0.4 ? <Box s={[1.8, 0.34, 0.04]} p={[0, i * fh + 0.55, 1.31]} c="#4a6a8a" cast={false} /> : null}
      </G>)}
      <Box s={[2.8, 0.14, 2.8]} p={[0, 4 * fh + 0.07, 0]} c="#b8674a" />
      {f > 0.2 ? <Puffs t={t} p={[0, 0.3, 0.6]} n={5} period={1.4} rise={2.2} size={0.7} c="#d8cdb8" on={1 - ease(t, T.m2017 - 0.6, T.m2017)} o={j * 0.2} /> : null}
    </G>;
  })}</G>;
};
const QuakeRings: React.FC<{ t: number }> = ({ t }) => {
  if (!giro(t) || t < T.m1985 || t > T.ella + 1.2) return null;
  const q = quakeAt(t);
  return q < 0.2 ? null : <G>{[0, 1, 2].map((k) => { const u = fract(t * 0.9 + k / 3), r = 3 + u * 16;
    return <mesh key={k} position={[0, 0.08, 1.3]} rotation={[-PI / 2, 0, 0]} material={mat("#fff3c8", { emissive: "#ffe39a", ei: 0.4 })}><ringGeometry args={[r, r + 0.45, 48]} /></mesh>; })}</G>;
};
/** 2017: só uma janela do térreo se solta e cai na calçada */
const Pane: React.FC<{ t: number }> = ({ t }) => {
  if (!giro(t) || t < T.m2017 - 0.1) return null;
  const a = T.otra - 0.05, u = ease(t, a, a + 0.55), gl = { emissive: "#9fd8ff", ei: 0.35 };
  const p: V3 = [-1.25, lerp(0.55, 0.06, u * u), lerp(3.86, 4.9, u)];
  const s = ease(t, a + 0.55, a + 0.9);
  return (
    <G>
      {t > a ? <Box s={[1.0, 0.85, 0.03]} p={[-1.25, 0.55, 3.82]} c="#2a3540" cast={false} /> : null}
      {u < 0.999 ? <G p={p} r={[lerp(0, -PI / 2, u), 0, 0.3 * u]}><Box s={[1.1, 0.9, 0.05]} c={GLASS2} o={gl} /></G>
        : [[-0.35, -0.2], [0.3, -0.25], [-0.2, 0.3], [0.4, 0.2]].map(([dx, dz], i) => <Box key={i} s={[0.42, 0.04, 0.36]} p={[p[0] + dx * (1 + 2 * s), 0.05, p[2] + dz * (1 + 2 * s)]} r={[0, i * 0.7, 0]} c={GLASS2} o={gl} />)}
    </G>
  );
};

// ---------------------------------------------------------------- os obreiros de 1950 (bate-estaca e escavação)
const OBRERO: Costume = { skin: "#c98a5b", top: "#e9e4da", bottom: "#3a5a8a", hat: "cap", hatC: "#c8a050", boot: "#3a2b24", sleeves: true };
const Crew: React.FC<{ t: number }> = ({ t }) => {
  const on = t > T.c1 && t < T.tiembla && cutOpen(t);
  const list = ([[-9.4, 2.4, 0.5, "pull"], [7.4, 3.0, -0.6, "chisel"], [-11.6, 0.4, 0.2, "present"], [13.8, -3.2, -0.4, "pull"]] as const).map(([x, z, yaw, pose], i) => ({ p: [x, 0, z] as V3, yaw, pose, ph: i * 0.4 }));
  return <Crowd list={list} t={t} c={OBRERO} vis={on} scale={1.05} />;
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3f96f0" mid="#9ccff7" low="#fff1d8" />
    <Clouds t={t} n={6} />
    <Volcanoes />
    <G p={groundShake(t)}>
      <Land t={t} />
      <City t={t} /><Dust1985 t={t} /><Alameda t={t} />
      <BellasArtes t={t} /><SinkGauge t={t} />
      <Section t={t} />
      {t > T.midio - 0.3 && t < CUTS[6] ? null : <G p={[0, bobY(t) + (t > T.p2 - 0.1 && t < T.b2 + 0.1 ? -0.3 * ease(t, T.pesa, T.pesa + 0.5) : 0), 0]} r={[0, 0, bobR(t)]}><Tower t={t} /></G>}{/* dentro do andar não se vê a própria torre pela janela */}
      <Stake t={t} /><Naive t={t} /><Piles t={t} /><Neighbors85 t={t} /><QuakeRings t={t} /><Pane t={t} /><PileDriver t={t} /><DepthRuler t={t} /><Weight t={t} /><Cajon t={t} /><Dirt t={t} /><Scale t={t} /><Boat t={t} />
      {giro(t) ? <Check t={t} a={T.intacta + 0.1} b={T.m1985 - 0.1} p={[5.6, 12.5, 4.6]} sc={2.6} /> : null}
      <Neighbor t={t} /><Brick t={t} /><Reed t={t} />
      <Nope t={t} /><Seismo t={t} /><Angel t={t} /><Crew t={t} />
    </G>
    {/* o andar do aparelho fica fora do tremor do chão: em close o andar inteiro tremia (e apagava o corte 7 da régua);
        quem treme é o lápis */}
    <Recorder t={t} />
  </>
);
export { Crowd, Worker, poseOf };
