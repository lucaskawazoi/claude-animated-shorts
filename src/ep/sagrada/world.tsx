// Mundo do E18: a Sagrada Família de brinquedo no meio do Eixample (quarteirões octogonais), com o tempo da obra em ANOS:
// yearAt(t) leva a basílica de 2026 a 1883 (o rebobinar), de 1883 a 1926 (Gaudí vivo), a 1936 (o fogo) e de 1939 a 2026.
// Cruzeiro na origem: torre de Jesus (0,0), evangelistas (±3, ±3), Maria (-5,2, 0) sobre a abside; Natividade em z=+6,5 (de
// frente para a câmera), Paixão em z=-6,5, Glória em x=14,8 (só tocos em 2026). 18 torres, 14 prontas, 4 faltam.
// Lugares: praça diante da Natividade (z 9–16: itens do «no hay», caixa de esmolas, colunas), ateliê de gesso TW (x=-26),
// barracão da Colônia Güell GU (x=-200, outra igreja, entre pinheiros), computador e máquina de cortar pedra CM (x=34).
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, outBack, prog, rnd, vlerp } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { Crowd, Worker, poseOf } from "../../toy/worker";
import type { Costume } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { BAG_T, MODEL_T, PIECE_T, T } from "./cues";

const PI = Math.PI;
const OLD = "#a68c69", MID = "#cbbfa8", NEW = "#e2d9c8", WHITE = "#f2efe8", PLASTER = "#f7f4ee", BRICK = "#a8553a", WOOD = "#8a5a32";
export const TW: V3 = [-26, 0, 5], GU: V3 = [-200, 0, 0], CM: V3 = [34, 0, 8], CNC: V3 = [40, 0, 8];
export const NP: V3 = [-5, 0, 11], DB: V3 = [4, 0, 11.5], CD: V3 = [13, 0, 12];
export const CRANE_A: V3 = [8, 0, -9], CRANE_H = 38, JESUS_TOP = 31, TAPE: V3 = [-10.5, 0, 5];

/** ano da obra no instante t */
export const yearAt = (t: number) => {
  if (t < T.barcelona) return 2026.3;
  if (t < T.p3) return t < T.sabe ? lerp(2026.3, 1883, ease(t, T.barcelona, T.barcelona + 1.0)) : lerp(1883, 1926.5, ease(t, T.sabe, T.terminada + 0.7));
  if (t < T.formas) return lerp(1926.5, 1936.5, ease(t, T.p3, T.m1936 + 0.6));
  if (t < T.giro) return t < CUTS[5] ? lerp(1939, 2012, ease(t, T.formas, CUTS[5] - 0.1)) : lerp(2012, 2025.6, ease(t, CUTS[5], T.cortan + 1.0));
  return 2025.6 + 0.6 * ease(t, T.m2026, T.pusieron + 0.6);
};
const bp = (t: number, y0: number, y1: number) => clamp((yearAt(t) - y0) / (y1 - y0));
/** a cruz: no topo (hoje), some de 1883 a 2025, desce pelo guindaste no giro */
const crossDrop = (t: number) => (t < T.barcelona ? 1 : t < T.giro ? -1 : ease(t, T.pusieron - 0.5, T.pusieron + 0.55));

// ---------------------------------------------------------------- utilidades
type Col = { c: string; e: string };
const GREEN: Col = { c: "#3fcf6a", e: "#1fa84a" }, GOLD: Col = { c: "#ffc93a", e: "#ffb000" };
const along = (pts: V3[], u: number): V3 => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return vlerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 0); d -= L[i]; }
  return pts[pts.length - 1];
};
const Flow: React.FC<{ t: number; pts: V3[]; k: number; n?: number; speed?: number; col?: Col; r?: number; ph?: number }> = ({ t, pts, k, n = 4, speed = 0.8, col = GREEN, r = 0.12, ph = 0 }) =>
  k <= 0.02 ? null : <G>{Array.from({ length: n }, (_, i) => <Sph key={i} rad={r * Math.min(1, k * 1.6)} p={along(pts, fract(t * speed + i / n + ph))} c={col.c} o={{ emissive: col.e, ei: 1.1 }} cast={false} ws={8} hs={6} />)}</G>;
const Line: React.FC<{ pts: V3[]; u?: number; rad: number; c: string; o?: object }> = ({ pts, u = 1, rad, c, o }) => {
  if (u <= 0.01) return null;
  const segs = pts.length - 1, f = clamp(u) * segs, out: React.ReactNode[] = [];
  for (let i = 0; i < segs && i < f; i++) out.push(<Pipe key={i} a={pts[i]} b={vlerp(pts[i], pts[i + 1], Math.min(1, f - i))} rad={rad} c={c} o={o} seg={6} cast={false} />);
  return <G>{out}</G>;
};
const XMark: React.FC<{ t: number; a: number; b: number; p: V3; sc?: number }> = ({ t, a, b, p, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = lerp(1.8, 1, ease(t, a, a + 0.14)) * sc, o = { emissive: "#ff2a1a", ei: 0.9 };
  return <G p={p} sc={k}>{[-1, 1].map((d) => <G key={d} r={[0, 0, (d * PI) / 4]}><Box s={[0.28, 1.1, 0.08]} c="#3a0808" cast={false} /><Box s={[0.18, 0.98, 0.1]} c="#ff3b30" o={o} cast={false} /></G>)}</G>;
};
const popK = (t: number, a: number, d = 0.25) => (t < a ? 0 : outBack(prog(t, a, a + d)));

// ---------------------------------------------------------------- chão, cidade e mar
const Land: React.FC = () => (
  <G>
    <Box s={[900, 0.2, 900]} p={[0, -0.12, 0]} c="#93bd5e" cast={false} />
    <Box s={[270, 0.1, 190]} p={[10, -0.02, -30]} c="#d6cdbd" cast={false} />
    <Box s={[80, 0.1, 40]} p={[5, 0.02, 2]} c="#eadfca" cast={false} />
    <Box s={[700, 0.1, 270]} p={[50, 0.03, -265]} c="#3f8fd8" o={{ rough: 0.3 }} cast={false} />
  </G>
);
const BLOCK_C = ["#e8d2a8", "#e9c7a0", "#f0e2c4", "#e3b99a", "#ddd0b8"];
const City: React.FC = () => {
  const out: React.ReactNode[] = [];
  for (let x = -100; x <= 120; x += 20) for (let z = -100; z <= 40; z += 20) {
    if (Math.abs(x - 3) <= 42 && z >= -20 && z <= 20) continue;
    const i = out.length, h = 3.4 + rnd(i + 2) * 2.4;
    out.push(<G key={i} p={[x, 0, z]}>
      <Cyl rt={7.8} h={h} p={[0, h / 2, 0]} r={[0, PI / 8, 0]} seg={8} c={BLOCK_C[i % 5]} />
      <Cyl rt={7.9} h={0.25} p={[0, h + 0.1, 0]} r={[0, PI / 8, 0]} seg={8} c="#b8674a" cast={false} />
      <Cyl rt={4.6} h={0.3} p={[0, h + 0.2, 0]} r={[0, PI / 8, 0]} seg={8} c="#7bb35a" cast={false} />
    </G>);
  }
  return <G>{out}</G>;
};

// ---------------------------------------------------------------- a basílica
type TowerDef = { x: number; z: number; H: number; R: number; c: string; y0: number; y1: number; cap: "bell" | "evang" | "mary" | "jesus" };
const bell = (x: number, z: number, H: number, c: string, y0: number, y1: number): TowerDef => ({ x, z, H, R: 0.95, c, y0, y1, cap: "bell" });
const TOWERS: TowerDef[] = [
  // Natividade: São Barnabé (x=1,1) pronta em 1925, a única que Gaudí viu; as outras até 1930
  bell(-3.3, 6.5, 17.5, OLD, 1925, 1930), bell(-1.1, 6.5, 19, OLD, 1923, 1929), bell(1.1, 6.5, 19, OLD, 1918, 1925), bell(3.3, 6.5, 17.5, OLD, 1925, 1930),
  // Paixão
  bell(-3.3, -6.5, 17.5, MID, 1956, 1976), bell(-1.1, -6.5, 19, MID, 1954, 1976), bell(1.1, -6.5, 19, MID, 1954, 1976), bell(3.3, -6.5, 17.5, MID, 1956, 1976),
  // Glória: só os tocos em 2026 (faltam as 4)
  bell(14.8, -3.3, 19, NEW, 2016, 2070), bell(14.8, -1.1, 21, NEW, 2016, 2066), bell(14.8, 1.1, 21, NEW, 2016, 2066), bell(14.8, 3.3, 19, NEW, 2016, 2070),
  // evangelistas, Maria, Jesus
  ...[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([x, z]): TowerDef => ({ x, z, H: 24.5, R: 1.25, c: NEW, y0: 2015, y1: 2023, cap: "evang" })),
  { x: -5.2, z: 0, H: 25, R: 1.35, c: NEW, y0: 2014, y1: 2021, cap: "mary" },
  { x: 0, z: 0, H: JESUS_TOP, R: 2.1, c: WHITE, y0: 2016, y1: 2025.95, cap: "jesus" },
];
const prof = (s: number) => 1 - 0.74 * Math.pow(s, 1.5);
const CAPC = ["#e8b830", "#d23c3c", "#f2efe8", "#2f7fc0"];
const Cap: React.FC<{ d: TowerDef }> = ({ d }) => {
  const r = d.R * prof(1);
  if (d.cap === "bell") return <G><Sph rad={r * 1.4} c={CAPC[Math.abs(Math.round(d.x * 3 + d.z)) % 4]} ws={10} hs={8} /><Box s={[0.12, 1.0, 0.12]} p={[0, 0.9, 0]} c="#f7e9b0" /><Box s={[0.6, 0.12, 0.12]} p={[0, 0.95, 0]} c="#f7e9b0" /><Sph rad={0.16} p={[0, 1.45, 0]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 0.4 }} /></G>;
  if (d.cap === "evang") return <G><Sph rad={r * 1.6} c="#f6f2ea" ws={12} hs={8} /><Sph rad={r * 0.7} p={[0, r * 1.6, 0]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 0.3 }} /></G>;
  if (d.cap === "mary") return <G>{Array.from({ length: 6 }, (_, i) => <Cone key={i} rad={0.28} h={1.6} p={[0, 0.9, 0]} r={[0, 0, (i * PI) / 3]} c="#cfe8ff" o={{ emissive: "#9fd2ff", ei: 1.0 }} seg={6} />)}<Sph rad={0.45} p={[0, 0.9, 0]} c="#eaf6ff" o={{ emissive: "#bfe4ff", ei: 1.2 }} /></G>;
  return null;
};
/** torre: anéis empilhados (constrói anel por anel), janelas escuras, andaime no anel de cima enquanto cresce */
const Tower: React.FC<{ d: TowerDef; t: number }> = ({ d, t }) => {
  const u = bp(t, d.y0, d.y1), N = d.cap === "bell" ? 6 : 7, sh = d.H / N, f = u * N;
  if (u <= 0.005) return null;
  const rings: React.ReactNode[] = [];
  for (let i = 0; i < N && i < f; i++) {
    const k = Math.min(1, f - i), r0 = d.R * prof(i / N), r1 = d.R * prof((i + k) / N), h = sh * k;
    rings.push(<G key={i} p={[0, i * sh, 0]}>
      <Cyl rt={r1} rb={r0} h={h} p={[0, h / 2, 0]} seg={12} c={d.c} />
      {k > 0.6 ? [0, 1, 2, 3].map((j) => { const a = j * (PI / 2) + i * 0.4; return <Box key={j} s={[0.12, sh * 0.42, 0.1]} p={[Math.sin(a) * r0 * 0.93, sh * 0.45, Math.cos(a) * r0 * 0.93]} r={[0, a, 0]} c="#3a2f28" cast={false} />; }) : null}
    </G>);
  }
  const top = Math.min(f, N) * sh, rt = d.R * prof(Math.min(1, u)) + 0.35;
  return (
    <G p={[d.x, 0, d.z]}>
      {rings}
      {u < 0.999 ? <G>{[0, 1, 2, 3].map((j) => <Box key={j} s={[0.08, top + 1.2, 0.08]} p={[Math.cos(j * PI / 2 + 0.78) * rt, (top + 1.2) / 2, Math.sin(j * PI / 2 + 0.78) * rt]} c="#7a6a58" cast={false} />)}
        {Array.from({ length: Math.ceil((top + 1.2) / 1.6) }, (_, j) => <Cyl key={j} rt={rt} h={0.07} p={[0, j * 1.6 + 0.8, 0]} seg={4} r={[0, 0.78, 0]} open c="#8a7a66" cast={false} />)}</G> : <G p={[0, d.H, 0]}><Cap d={d} /></G>}
    </G>
  );
};
/** a cruz de quatro braços da torre de Jesus (y local 0 = base da cruz) */
const Cross: React.FC<{ glow: number }> = ({ glow }) => {
  const o = { emissive: "#bfe8ff", ei: 0.3 + glow * 1.6 };
  return <G><Box s={[0.5, 3.0, 0.5]} p={[0, 1.5, 0]} c="#f4fbff" o={o} /><Box s={[2.2, 0.5, 0.5]} p={[0, 2.1, 0]} c="#f4fbff" o={o} /><Box s={[0.5, 0.5, 2.2]} p={[0, 2.1, 0]} c="#f4fbff" o={o} /><Sph rad={0.3} p={[0, 2.1, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 1 + glow * 2 }} /></G>;
};
const Basilica: React.FC<{ t: number }> = ({ t }) => {
  const crypt = bp(t, 1882, 1889), apse = bp(t, 1890, 1900), nat = bp(t, 1894, 1925), pas = bp(t, 1954, 1976), body = bp(t, 1985, 2005), roof = bp(t, 2000, 2010), glo = bp(t, 2010, 2060);
  const cd = crossDrop(t), glow = t > T.pusieron + 0.5 ? 1 : 0;
  return (
    <G>
      {/* cripta e abside */}
      <Box s={[7, 1.2 * crypt + 0.01, 8]} p={[-4.5, 0.6 * crypt, 0]} c={OLD} />
      <Cyl rt={4} h={7 * apse + 0.01} p={[-5, 3.5 * apse, 0]} seg={14} ts={PI} tl={PI} c={OLD} />
      {apse > 0.98 ? [0, 1, 2, 3, 4].map((i) => { const a = PI + (i + 0.5) * (PI / 5); return <Cone key={i} rad={0.4} h={1.6} seg={6} p={[-5 + Math.sin(a) * 3.8, 7.8, Math.cos(a) * 3.8]} c={OLD} />; }) : null}
      {/* fachada da Natividade: parede com três portais e «escultura» em bolhas */}
      <G p={[0, 0, 6.7]}>
        <Box s={[8.6, 10 * nat + 0.01, 1.2]} p={[0, 5 * nat, 0]} c={OLD} />
        {nat > 0.5 ? [-2.6, 0, 2.6].map((x, i) => <Box key={i} s={[1.4, 3.2 + (i === 1 ? 1 : 0), 0.2]} p={[x, 1.6 + (i === 1 ? 0.5 : 0), 0.62]} c="#3a2f28" cast={false} />) : null}
        {nat > 0.8 ? Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.35 + rnd(i) * 0.3} p={[-3.8 + rnd(i + 4) * 7.6, 5 + rnd(i + 9) * 4.4, 0.7]} c={i % 3 ? "#b49a76" : "#97815f"} ws={8} hs={6} />) : null}
      </G>
      {/* fachada da Paixão: parede lisa e colunas inclinadas como ossos */}
      <G p={[0, 0, -6.7]}>
        <Box s={[8.6, 10 * pas + 0.01, 1.2]} p={[0, 5 * pas, 0]} c={MID} />
        {pas > 0.9 ? Array.from({ length: 6 }, (_, i) => <Cyl key={i} rt={0.22} h={5.5} p={[-3.4 + i * 1.36, 2.6, -0.9]} r={[0.0, 0, (i - 2.5) * 0.1]} c="#d8cdb6" seg={8} />) : null}
      </G>
      {/* transepto e nave (anos 80 a 2010) */}
      <Box s={[8, 8.5 * body + 0.01, 12]} p={[0, 4.25 * body, 0]} c={NEW} />
      <Box s={[11, 8 * body + 0.01, 8]} p={[9.5, 4 * body, 0]} c={NEW} />
      {roof > 0.05 ? [5.5, 8, 10.5, 13].map((x, i) => <Cone key={i} rad={1.2} h={2.4 * roof} seg={8} p={[x, 8 + 1.2 * roof, 0]} c={i % 2 ? "#e8b830" : "#7fb24a"} />) : null}
      {body > 0.2 ? [4.5, 6.5, 8.5, 10.5, 12.5].map((x, i) => <Box key={i} s={[0.8, 3.2, 0.1]} p={[x, 4.6, 4.05]} c="#7fb2e0" o={{ emissive: "#3a7fc0", ei: 0.25 }} cast={false} />) : null}
      {/* Glória: base em obra */}
      <Box s={[1.4, 6 * glo + 0.01, 9]} p={[14.8, 3 * glo, 0]} c={NEW} />
      {TOWERS.map((d, i) => <Tower key={i} d={d} t={t} />)}
      {t > T.pusieron + 0.5 && t < T.pusieron + 1.5 ? <Sph rad={0.6 + 5 * prog(t, T.pusieron + 0.55, T.pusieron + 1.4)} p={[0, JESUS_TOP + 2.9, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 1.5, opacity: 0.5 * (1 - prog(t, T.pusieron + 0.55, T.pusieron + 1.5)), depthWrite: false }} cast={false} ws={16} hs={10} /> : null}
      {cd >= 0 ? <G p={[0, JESUS_TOP + 4.5 * (1 - cd), 0]}><Cross glow={glow} /></G> : null}
    </G>
  );
};
/** guindaste de torre: mastro, lança girando, carrinho e cabo com a carga */
const Crane: React.FC<{ p: V3; H: number; a: number; r: number; drop: number; load?: React.ReactNode }> = ({ p, H, a, r, drop, load }) => {
  const ca = Math.cos(a), sa = Math.sin(a), top: V3 = [p[0], H, p[2]], tip: V3 = [p[0] + ca * 15, H, p[2] + sa * 15], back: V3 = [p[0] - ca * 5, H, p[2] - sa * 5];
  const hook: V3 = [p[0] + ca * r, H - drop, p[2] + sa * r];
  return (
    <G>
      <Box s={[0.8, H, 0.8]} p={[p[0], H / 2, p[2]]} c="#f2c230" />
      {Array.from({ length: Math.floor(H / 2.5) }, (_, i) => <Box key={i} s={[0.86, 0.12, 0.86]} p={[p[0], i * 2.5 + 1.2, p[2]]} c="#b88a10" cast={false} />)}
      <Pipe a={top} b={tip} rad={0.28} c="#f2c230" seg={6} /><Pipe a={top} b={back} rad={0.3} c="#f2c230" seg={6} />
      <Box s={[1.4, 1.2, 1.4]} p={[back[0], H - 0.6, back[2]]} c="#8a8f94" />
      <Box s={[1.0, 1.0, 1.0]} p={[p[0], H - 0.9, p[2]]} c="#3a7fc0" />
      <Pipe a={[hook[0], H, hook[2]]} b={hook} rad={0.04} c="#2a2a2a" seg={4} cast={false} />
      <G p={hook}>{load}</G>
    </G>
  );
};
const Cranes: React.FC<{ t: number }> = ({ t }) => {
  if (yearAt(t) < 1985) return null;
  const aT = Math.atan2(-CRANE_A[2], -CRANE_A[0]), rT = Math.hypot(CRANE_A[0], CRANE_A[2]);
  const giro = t >= T.giro, cd = crossDrop(t);
  const a = giro ? aT : aT + 0.5 + 0.35 * Math.sin(t * 0.5), r = giro ? rT : 9 + 2 * Math.sin(t * 0.7);
  const drop = giro ? CRANE_H - (JESUS_TOP + 3 + 4.5 * (1 - cd)) - 6 * ease(t, T.pusieron + 0.7, T.pusieron + 1.6) : 10 + 3 * Math.sin(t * 0.9);
  return (
    <G>
      <Crane p={CRANE_A} H={CRANE_H} a={a} r={r} drop={drop} load={giro ? null : <Box s={[1.2, 0.8, 0.8]} p={[0, -0.4, 0]} c={NEW} />} />
      <Crane p={[20, 0, -5]} H={27} a={-2.4 + 0.5 * Math.sin(t * 0.4 + 1)} r={8 + 3 * Math.sin(t * 0.6)} drop={9 + 2 * Math.sin(t * 0.8)} load={<Box s={[1.0, 0.7, 0.7]} p={[0, -0.35, 0]} c={NEW} />} />
    </G>
  );
};

// ---------------------------------------------------------------- 1883: o arquiteto que começou (Villar) entrega a obra
const ARCH_OLD: Costume = { skin: "#e0b58c", top: "#22222a", bottom: "#22222a", hat: "cap", hatC: "#22222a", boot: "#1a1a1a", sleeves: true };
export const GAUDI: Costume = { skin: "#e8b48c", top: "#55555f", bottom: "#4a4a52", hat: "none", hatC: "#000", boot: "#2a2420", sleeves: true };
const Masons: React.FC<{ t: number }> = ({ t }) => {
  const on = t > T.barcelona + 0.5 && t < T.quiere;
  const list = [[-7.2, 1.8], [-5.4, -2.6], [-3.6, 2.4], [-1.6, -1.8]].map(([x, z], i) => ({ p: [x, 0, z] as V3, yaw: i % 2 ? 0.6 : -0.5, pose: (i % 2 ? "chisel" : "pull") as "chisel" | "pull", ph: i * 0.4 }));
  return <Crowd list={list} t={t} c={{ skin: "#e0b58c", top: "#e9e4da", bottom: "#5a4632", hat: "cap", hatC: "#8a6a4a", boot: "#2a2420", sleeves: true }} vis={on} />;
};
const Villar: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.antoni - 0.2 || t > T.nohay) return null;
  const w = ease(t, T.otro, T.otro + 1.0), p: V3 = [lerp(-1.4, 3.5, w), 0, lerp(6.2, 8.5, w)];
  return <Worker p={p} yaw={w > 0.01 ? 1.3 : -1.2} pose={poseOf(w > 0.01 ? "walk" : t < T.toma + 0.3 ? "present" : "idle", t)} t={t} c={ARCH_OLD} prop={t < T.toma + 0.3 ? "scroll" : "none"} scale={1.05} />;
};

// ---------------------------------------------------------------- «no hay computadoras ni máquinas»: e o que havia
const Nope: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.nohay - 0.1 || t > T.quiere) return null;
  const out = (a: number, b: number) => Math.max(0.001, popK(t, a) * (1 - ease(t, b - 0.12, b + 0.12)));
  const things: [number, React.ReactNode][] = [
    [T.papel, <G><Cyl rt={0.12} h={1.0} r={[0, 0, PI / 2]} p={[0, 0.14, 0.25]} c="#f1e3b5" seg={10} /><Box s={[0.9, 0.02, 0.65]} p={[0, 0.03, -0.15]} c="#f6ebc8" /><Box s={[0.5, 0.03, 0.04]} p={[0, 0.05, -0.2]} c="#2f5d8a" cast={false} /></G>],
    [T.yeso0, <G><Sph rad={0.45} sc={[1, 1.2, 0.85]} p={[0, 0.5, 0]} c={PLASTER} ws={12} hs={8} /><Cyl rt={0.3} rb={0.24} h={0.45} p={[0.55, 0.22, 0.2]} c="#e9e4da" seg={10} /></G>],
    [T.cuerdas0, <G>{[0, 1, 2, 3].map((i) => <Cyl key={i} rt={0.42 - i * 0.06} h={0.07} p={[0, 0.04 + i * 0.075, 0]} c={i % 2 ? "#c9a46a" : "#b48a52"} seg={14} open />)}</G>],
    [T.piedra0, <Box s={[0.8, 0.55, 0.65]} p={[0, 0.28, 0]} r={[0, 0.3, 0]} c="#b8a888" />],
  ];
  return (
    <G p={NP}>
      <G p={[-1.1, 0, 0]} sc={out(T.compu - 0.05, T.papel)}>
        <Box s={[0.95, 0.8, 0.8]} p={[0, 0.6, 0]} c="#e8e0c8" /><Box s={[0.72, 0.56, 0.02]} p={[0, 0.66, 0.41]} c="#2f6fb0" o={{ emissive: "#3f9fff", ei: 0.8 }} cast={false} />
        <Box s={[0.95, 0.07, 0.36]} p={[0, 0.05, 0.75]} c="#ddd4bc" />
      </G>
      <XMark t={t} a={T.maquinas - 0.1} b={T.papel} p={[-1.1, 0.9, 0.8]} sc={0.9} />
      <G p={[1.2, 0, 0]} sc={out(T.maquinas, T.papel)} r={[0, -0.5, 0]}>
        <Box s={[1.3, 0.3, 0.26]} p={[0, 0.15, 0.35]} c="#2a2a2a" /><Box s={[1.3, 0.3, 0.26]} p={[0, 0.15, -0.35]} c="#2a2a2a" />
        <Box s={[1.1, 0.5, 0.75]} p={[0, 0.55, 0]} c="#f2c230" /><Box s={[0.5, 0.5, 0.6]} p={[-0.25, 1.05, 0]} c="#f2c230" />
        <Pipe a={[0.3, 0.9, 0]} b={[1.2, 1.5, 0]} rad={0.08} c="#e0b020" /><Pipe a={[1.2, 1.5, 0]} b={[1.6, 0.6, 0]} rad={0.07} c="#e0b020" /><Box s={[0.4, 0.3, 0.45]} p={[1.65, 0.45, 0]} c="#555555" />
      </G>
      <XMark t={t} a={T.papel - 0.15} b={T.papel + 0.1} p={[1.2, 1.0, 0.8]} sc={0.9} />
      {things.map(([a, n], i) => <G key={i} p={[-2.1 + i * 1.4, 0, 0.6]} sc={Math.max(0.001, popK(t, a))} vis={t > a}>{n}</G>)}
    </G>
  );
};

// ---------------------------------------------------------------- colunas inclinadas como árvores; a ingênua tomba
const Columns: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.quiere - 0.1 || t > T.c1 + 0.2) return null;
  const g = ease(t, T.columnas - 0.1, T.columnas + 0.5), br = ease(t, T.arboles, T.arboles + 0.6), fall = Math.pow(prog(t, T.casi + 0.1, T.casi + 0.75), 2);
  const ang = 0.32 + fall * 1.22;
  return (
    <G p={CD}>
      {/* coluna-árvore: tronco inclinado que se ramifica e segura a laje */}
      <G p={[0.6, 0, 0]} r={[0, 0, 0.22]}>
        <Cyl rt={0.24} rb={0.34} h={3.4 * g + 0.01} p={[0, 1.7 * g, 0]} c={MID} seg={10} />
        {[-0.7, 0.1, 0.8].map((a, i) => <G key={i} p={[0, 3.4, 0]} r={[i === 1 ? 0.6 : 0, 0, a]}><Cyl rt={0.13} rb={0.18} h={1.6 * br + 0.01} p={[0, 0.8 * br, 0]} c={MID} seg={8} /></G>)}
      </G>
      <Box s={[3.4, 0.22, 2.0]} p={[0.05, 4.95, 0]} c={NEW} vis={br > 0.95} />
      {/* árvore de verdade ao lado */}
      <G p={[3.4, 0, -0.6]} sc={Math.max(0.001, popK(t, T.arboles, 0.35))}>
        <Cyl rt={0.18} rb={0.3} h={2.6} p={[0, 1.3, 0]} r={[0, 0, -0.12]} c="#7a4a2a" seg={7} />
        {[-0.7, 0.6].map((a, i) => <G key={i} p={[0, 2.4, 0]} r={[0, 0, a]}><Cyl rt={0.08} rb={0.12} h={1.3} p={[0, 0.65, 0]} c="#7a4a2a" seg={6} /></G>)}
        <Sph rad={1.5} p={[0, 3.9, 0]} sc={[1.2, 0.85, 1]} c="#4fae3a" ws={10} hs={8} />
      </G>
      {/* a coluna ingênua: reta, inclinada, peso em cima, tomba */}
      <G p={[-2.6, 0, 0.6]} r={[0, 0, ang]} sc={Math.max(0.001, popK(t, T.columnas + 0.35))}>
        <Cyl rt={0.26} h={3.2} p={[0, 1.6, 0]} c="#c9bba0" seg={10} />
        <Box s={[1.2, 0.7, 1.0]} p={[0, 3.55, 0]} c="#9a8a70" />
      </G>
      {fall > 0.98 ? <Puffs t={t} p={[-5.4, 0.3, 0.6]} n={5} period={1.2} rise={1.5} size={0.6} c="#e8dcc6" on={1 - ease(t, T.b1, T.b1 + 1)} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- a outra igreja (Colônia Güell): maquete pendurada
type Arc = { x: number; z: number; S: number; bags: number[] };
const ARCS: Arc[] = [{ x: 3.4, z: 0, S: 5.0, bags: [-2.2, -0.8, 0.8, 2.2] }, { x: 2.2, z: -1.5, S: 3.4, bags: [0] }, { x: 2.2, z: 1.5, S: 3.4, bags: [0] }];
const BAG_OF: number[][] = (() => { let n = 0; return ARCS.map((a) => a.bags.map(() => n++)); })();
const sagK = (t: number, ai: number) => {
  const ids = BAG_OF[ai], landed = ids.reduce((s, id) => s + ease(t, BAG_T(id) + 0.12, BAG_T(id) + 0.3), 0);
  return 0.28 + 0.72 * (landed / ids.length);
};
const BOARD_Y = 3.8;
const arcPts = (a: Arc, k: number): V3[] => Array.from({ length: 13 }, (_, i) => { const x = -a.x + (2 * a.x * i) / 12, s = x / a.x; return [x, BOARD_Y - a.S * k * (1 - s * s), a.z]; });
const Guell: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.c1 - 0.5 || t > T.p2 + 0.3) return null;
  const spin = ease(t, T.vuelta + 0.1, T.vuelta + 0.95), drop = ease(t, T.cuelga, T.cuelga + 0.45);
  const tens = (t > T.curva - 0.1 && t < T.vuelta ? 1 : 0) * ease(t, T.curva - 0.1, T.curva + 0.3);
  const comp = ease(t, T.apretando - 0.1, T.apretando + 0.3), stones = (i: number) => popK(t, T.sostiene + i * 0.07, 0.2);
  return (
    <G p={GU}>
      {/* a igrejinha de tijolo ao lado e os pinheiros */}
      <G p={[13, 0, -3]}><Box s={[6, 5, 6]} p={[0, 2.5, 0]} c={BRICK} /><Cone rad={4.6} h={2.4} seg={4} p={[0, 6.2, 0]} r={[0, PI / 4, 0]} c="#6f3a2a" /><Box s={[1.3, 8.5, 1.3]} p={[2.4, 4.25, 2.6]} c="#93472f" /><Box s={[1.4, 2.0, 0.2]} p={[0, 1.0, 3.05]} c="#3a2a20" cast={false} /></G>
      <Trees spots={[[-10, 0, -6], [-14, 0, 2], [-8, 0, -14], [20, 0, -10], [24, 0, 4], [6, 0, -16], [-18, 0, -12]]} c={["#2f7a3a", "#3f8f45"]} />
      {/* o barracão */}
      <Box s={[12, 0.3, 7]} p={[0, 0.15, 0]} c="#c8b08a" />
      <Box s={[12, 9, 0.3]} p={[0, 4.5, -3.5]} c="#d9c4a0" />
      {[-5.8, 5.8].map((x) => <Box key={x} s={[0.4, 9, 0.4]} p={[x, 4.5, 3.2]} c={WOOD} />)}
      <Box s={[12.4, 0.4, 0.4]} p={[0, 9, 3.2]} c={WOOD} />
      {/* a maquete: gira inteira em «dale la vuelta» (pivô em y=4,4) */}
      <G p={[0, 4.4, 0]} r={[0, 0, spin * PI]}>
        <Box s={[8.4, 0.3, 4.4]} p={[0, BOARD_Y + 0.2, 0]} c={WOOD} />
        {ARCS.map((a, ai) => {
          const pts = arcPts(a, sagK(t, ai));
          return (
            <G key={ai}>
              <Line pts={pts} u={drop} rad={0.045} c="#efe6cf" />
              <Flow t={t} pts={pts.slice(0, 7).reverse()} k={tens} col={GREEN} speed={0.9} />
              <Flow t={t} pts={pts.slice(6)} k={tens} col={GREEN} speed={0.9} />
              {a.bags.map((bx, bi) => {
                const id = BAG_OF[ai][bi], q = along(pts, (bx + a.x) / (2 * a.x)), land = ease(t, BAG_T(id), BAG_T(id) + 0.18);
                const k = 1 - ease(t, T.vuelta + 0.5, T.vuelta + 0.9);
                return k > 0.01 && t > BAG_T(id) - 0.02 ? <G key={bi} p={[q[0], q[1] + (1 - land) * 3 - 0.35, q[2]]} sc={k}><Pipe a={[0, 0.35, 0]} b={[0, 0.12, 0]} rad={0.02} c="#efe6cf" /><Sph rad={0.24} sc={[1, 1.2, 1]} c="#a07a4a" ws={8} hs={6} /></G> : null;
              })}
              {/* depois de virar: pedras ao longo da curva e o peso só apertando, até o chão */}
              {t > T.sostiene - 0.1 ? pts.slice(1, -1).map((q, i) => { const n = pts[i + 2], b = pts[i], ang = Math.atan2(n[1] - b[1], n[0] - b[0]); return <Box key={i} s={[0.62, 0.36, 0.5]} p={q} r={[0, 0, ang]} sc={Math.max(0.001, stones(i))} c="#c9b48e" />; }) : null}
              <Flow t={t} pts={pts.slice(0, 7).reverse()} k={comp} col={GOLD} speed={-0.9} r={0.14} />
              <Flow t={t} pts={pts.slice(6)} k={comp} col={GOLD} speed={-0.9} r={0.14} />
            </G>
          );
        })}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- esmolas: a caixa e o custo enorme
const Alms: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p2 - 0.1 || t > T.sabe + 0.1) return null;
  const coins = Array.from({ length: 8 }, (_, i) => T.cuesta + 0.2 + i * 0.38), paid = coins.filter((c) => t > c + 0.3).length;
  const fill = 0.02 + paid * 0.012;
  const people = [0, 1, 2, 3].map((i) => ({ p: [-1.7 + i * 1.0, 0, -1.2 - (i % 2) * 0.5] as V3, yaw: (i - 1.5) * -0.25, pose: "present" as const, ph: i * 0.3 }));
  return (
    <G p={DB}>
      <Cyl rt={0.1} h={1.0} p={[0, 0.5, 0]} c={WOOD} seg={6} /><Box s={[0.9, 0.7, 0.7]} p={[0, 1.35, 0]} c="#7a4a2a" /><Box s={[0.4, 0.04, 0.08]} p={[0, 1.71, 0]} c="#1a1a1a" cast={false} />
      {coins.map((c, i) => { const u = prog(t, c, c + 0.3); return u > 0 && u < 1 ? <Cyl key={i} rt={0.14} h={0.04} p={[0, lerp(2.6, 1.72, u * u), 0]} r={[PI / 2, 0, t * 9]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 0.4, metal: 0.5 }} seg={12} /> : null; })}
      {/* a barra do custo: altíssima, quase vazia */}
      <G p={[2.2, 0, -0.4]}>
        <Box s={[0.7, 7, 0.3]} p={[0, 3.5, 0]} c="#2a2a2a" o={{ opacity: 0.35 }} cast={false} />
        <Box s={[0.6, 7 * fill, 0.32]} p={[0, 3.5 * fill, 0.01]} c="#3fcf6a" o={{ emissive: "#1fa84a", ei: 0.6 }} cast={false} />
        <Box s={[1.0, 0.12, 0.34]} p={[0, 7.0, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.6 }} cast={false} />
      </G>
      <Crowd list={people} t={t} c={{ skin: "#e0b58c", top: "#6b4a2a", bottom: "#3a3a44", hat: "cap", hatC: "#3a3a44", boot: "#2a2420", sleeves: true }} vis={t < T.sabe + 0.2} />
    </G>
  );
};

// ---------------------------------------------------------------- o ateliê de gesso (TW): maquetas, fogo, pedaços, foto
type Piece = { k: "b" | "c" | "s" | "k"; p: V3; s: V3; r?: V3 };
const MODELS: Piece[][] = [
  [{ k: "c", p: [0, 0.45, 0], s: [0.3, 0.9, 0.42] }, { k: "c", p: [0, 1.2, 0], s: [0.18, 0.6, 0.3] }, { k: "k", p: [0, 1.72, 0], s: [0.18, 0.45, 0] }, { k: "s", p: [0, 2.0, 0], s: [0.1, 0, 0] }],
  [{ k: "c", p: [0, 0.55, 0], s: [0.08, 1.1, 0.12], r: [0, 0, 0.15] }, { k: "c", p: [-0.22, 1.25, 0], s: [0.05, 0.55, 0.07], r: [0, 0, 0.6] }, { k: "c", p: [0.2, 1.25, 0], s: [0.05, 0.55, 0.07], r: [0, 0, -0.55] }, { k: "c", p: [0, 1.28, 0.18], s: [0.05, 0.5, 0.07], r: [0.55, 0, 0] }, { k: "b", p: [0, 1.58, 0.05], s: [1.0, 0.1, 0.7] }],
  [{ k: "b", p: [0, 0.55, 0], s: [1.2, 1.1, 0.25] }, { k: "k", p: [-0.4, 1.33, 0], s: [0.17, 0.5, 0] }, { k: "k", p: [0, 1.45, 0], s: [0.2, 0.75, 0] }, { k: "k", p: [0.4, 1.33, 0], s: [0.17, 0.5, 0] }, { k: "s", p: [0, 0.75, 0.15], s: [0.16, 0, 0] }],
  [{ k: "c", p: [-0.42, 0.45, -0.28], s: [0.06, 0.9, 0.08] }, { k: "c", p: [0.42, 0.45, -0.28], s: [0.06, 0.9, 0.08] }, { k: "c", p: [-0.42, 0.45, 0.28], s: [0.06, 0.9, 0.08] }, { k: "c", p: [0.42, 0.45, 0.28], s: [0.06, 0.9, 0.08] }, { k: "s", p: [0, 0.95, 0], s: [0.62, 0, 0] }],
  [{ k: "c", p: [0, 0.7, 0], s: [0.5, 0.1, 0.5], r: [PI / 2, 0, 0] }, ...Array.from({ length: 5 }, (_, i): Piece => ({ k: "s", p: [Math.cos((i * 2 * PI) / 5) * 0.32, 0.7 + Math.sin((i * 2 * PI) / 5) * 0.32, 0.07], s: [0.09, 0, 0] })), { k: "b", p: [0, 0.12, 0], s: [0.5, 0.24, 0.3] }],
];
const MX = [-2.6, -1.3, 0, 1.3, 2.6], TABLE_Y = 1.06;
const PIECES = MODELS.flatMap((m, mi) => m.map((pc, j) => ({ pc, mi, j })));
const PieceEl: React.FC<{ pc: Piece; c: string }> = ({ pc, c }) =>
  pc.k === "b" ? <Box s={pc.s} c={c} /> : pc.k === "c" ? <Cyl rt={pc.s[0]} rb={pc.s[2]} h={pc.s[1]} seg={10} c={c} /> : pc.k === "s" ? <Sph rad={pc.s[0]} c={c} ws={10} hs={8} /> : <Cone rad={pc.s[0]} h={pc.s[1]} seg={8} c={c} />;
const Studio: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b2 - 0.5 || t > T.formas + 0.2) return null;
  const burnt = t > T.queman + 0.8, fireOn = t > T.queman && t < T.c3 ? Math.min(ease(t, T.queman, T.queman + 0.5), 1 - ease(t, T.b3 + 0.6, T.c3)) : 0;
  const glowW = ease(t, T.p3 + 0.3, T.queman), n = PIECES.length, beam = burnt ? "#3a2a20" : WOOD;
  return (
    <G p={TW}>
      <Box s={[15, 0.3, 9]} p={[0, 0.15, 0.5]} c="#cdb894" />
      <Box s={[15, 7, 0.4]} p={[0, 3.5, -3]} c={burnt ? "#5a4a3e" : "#e8dcc6"} />
      {[-4.5, 0, 4.5].map((x) => <Box key={x} s={[1.6, 2.2, 0.1]} p={[x, 4.6, -2.75]} c={burnt ? "#2a1a10" : glowW > 0.02 ? "#ff9a4a" : "#9fc6e8"} o={glowW > 0.02 && !burnt ? { emissive: "#ff5a00", ei: glowW * 1.3 } : undefined} cast={false} />)}
      {/* a mesa */}
      <Box s={[11, 0.12, 1.8]} p={[0, TABLE_Y - 0.06, 0]} c={burnt ? "#4a3020" : "#9a6a3a"} />
      {[[-5.2, -0.7], [5.2, -0.7], [-5.2, 0.7], [5.2, 0.7]].map(([x, z], i) => <Box key={i} s={[0.15, 1.0, 0.15]} p={[x, 0.5, z]} c="#6a4a2a" />)}
      {/* as peças: surgem (maquetas), voam (1936), voltam uma a uma */}
      {PIECES.map(({ pc, mi, j }, idx) => {
        const home: V3 = [MX[mi] + pc.p[0], TABLE_Y + pc.p[1], pc.p[2]], sd = mi * 7 + j;
        const floor: V3 = [home[0] + (rnd(sd) - 0.5) * 2.6, 0.32 + rnd(sd + 3) * 0.1, 1.4 + rnd(sd + 5) * 1.8];
        const out = ease(t, T.rompen + rnd(sd + 1) * 0.35, T.rompen + 0.45 + rnd(sd + 1) * 0.35), back = ease(t, PIECE_T(idx, n), PIECE_T(idx, n) + 0.32);
        const fly = out * (1 - back), p = vlerp(home, floor, fly);
        p[1] += Math.sin(fly * PI) * 1.1;
        const trem = ease(t, T.p3 + 0.8, T.queman) * (1 - out), rr0 = Math.sin(t * 41 + sd * 2.3) * 0.09 * trem; p[0] += Math.sin(t * 37 + sd) * 0.05 * trem;
        const rr = rnd(sd + 7) * 4 * fly + rr0, sc = Math.max(0.001, popK(t, MODEL_T(mi), 0.28));
        return <G key={idx} p={p} r={[(pc.r?.[0] ?? 0) + rr, pc.r?.[1] ?? 0, (pc.r?.[2] ?? 0) + rr * 0.7]} sc={sc}><PieceEl pc={pc} c={fly > 0.02 && fly < 0.98 ? "#e9e2d4" : PLASTER} /></G>;
      })}
      {/* o fogo de julho de 1936 */}
      {fireOn > 0.01 ? Array.from({ length: 9 }, (_, i) => { const fl = 1 + 0.35 * Math.sin(t * 13 + i * 2.1); return <Cone key={i} rad={0.7} h={2.2 * fl * fireOn} seg={6} p={[-6.4 + i * 1.6, 7.3 + 1.1 * fl * fireOn, -2.6 + (i % 2) * 0.6]} c={i % 2 ? "#ff8a1a" : "#ffcf3a"} o={{ emissive: i % 2 ? "#ff5a00" : "#ffb000", ei: 1.4 }} cast={false} />; }) : null}
      {fireOn > 0.01 ? Array.from({ length: 5 }, (_, i) => { const fl = 1 + 0.3 * Math.sin(t * 11 + i); return <Cone key={i} rad={0.5} h={1.6 * fl * fireOn} seg={6} p={[-5 + i * 2.5, 0.9 * fl * fireOn, -2.2]} c="#ff6a1a" o={{ emissive: "#ff4000", ei: 1.4 }} cast={false} />; }) : null}
      <Puffs t={t} p={[0, 8, -3.4]} n={8} period={1.8} rise={7} size={1.3} c="#4a423c" on={ease(t, T.p3 + 0.5, T.queman) * (1 - fireOn)} drift={[1.0, 0, 0]} />
      <Puffs t={t} p={[0, 8, -2.6]} n={10} period={2.2} rise={9} size={1.6} c="#3a3430" on={fireOn} drift={[1.2, 0, 0]} />
      {/* quem remonta (1939): dois homens atrás da mesa */}
      <Crowd list={[{ p: [-2.6, 0, -1.4], yaw: 0, pose: "pull", ph: 0 }, { p: [2.4, 0, -1.4], yaw: 0, pose: "present", ph: 0.5 }]} t={t} c={{ skin: "#e0b58c", top: "#e9e4da", bottom: "#4a4a52", hat: "cap", hatC: "#4a4a52", boot: "#2a2420", sleeves: true }} vis={t > T.c3 - 0.3} />
      {/* a foto velha num cavalete, com flash */}
      {t > T.fotos ? (
        <G p={[3.9, TABLE_Y, 0.2]} sc={Math.max(0.001, popK(t, T.fotos + 0.05)) * 1.35} r={[-0.1, -0.45, 0]}>
          <Box s={[1.3, 1.0, 0.05]} p={[0, 0.65, 0]} c="#f4ecd8" /><Box s={[1.1, 0.8, 0.06]} p={[0, 0.65, 0]} c="#b08a5a" />
          <Box s={[0.18, 0.55, 0.07]} p={[-0.15, 0.55, 0.01]} c="#5a3a20" /><Box s={[0.14, 0.42, 0.07]} p={[0.15, 0.5, 0.01]} c="#5a3a20" /><Box s={[0.7, 0.08, 0.07]} p={[0, 0.3, 0.01]} c="#5a3a20" />
          <Sph rad={0.9 * (1 - prog(t, T.fotos + 0.2, T.fotos + 0.6))} p={[0, 0.7, 0.4]} c="#ffffff" o={{ emissive: "#ffffff", ei: 2.5, opacity: 0.8 }} cast={false} vis={t > T.fotos + 0.18 && t < T.fotos + 0.6} />
        </G>) : null}
      {/* o aprendiz que leva uma maqueta para a obra */}
      {t > T.otros - 0.1 && t < T.p3 ? (() => {
        const u = ease(t, T.otros + 0.2, T.atribuye + 0.3), p: V3 = [lerp(0.5, 9, u), 0, lerp(1.6, 3.6, u)];
        return <G><Worker p={p} yaw={1.35} pose={poseOf(u > 0.01 && u < 0.99 ? "walk" : "present", t)} t={t} c={{ skin: "#e0b58c", top: "#e9e4da", bottom: "#5a4632", hat: "cap", hatC: "#8a6a4a", boot: "#2a2420", sleeves: true }} scale={1.05} />
          <G p={[p[0] + 0.45, 1.3, p[2]]}><Cyl rt={0.18} rb={0.3} h={0.8} p={[0, 0.4, 0]} c={PLASTER} seg={10} /><Cone rad={0.18} h={0.45} p={[0, 1.02, 0]} c={PLASTER} seg={8} /></G></G>;
      })() : null}
    </G>
  );
};

// ---------------------------------------------------------------- «el cliente era Dios»: raios de sol
const Rays: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.min(ease(t, T.prisa, T.dios + 0.3), 1 - ease(t, T.p3 - 0.2, T.p3));
  if (k <= 0.01) return null;
  return <G r={[0, (t - T.prisa) * 0.35, 0]}>{[-6, 0, 6].map((x, i) => <Cyl key={i} rt={0.6} rb={3.2} h={34} p={[x, 22, 4 - i]} r={[0.25, 0, (i - 1) * 0.18]} c="#fff2b0" o={{ emissive: "#ffe680", ei: 0.9, opacity: 0.22 * k, depthWrite: false }} cast={false} recv={false} seg={12} open />)}</G>;
};

// ---------------------------------------------------------------- computador, avião e a máquina que corta a pedra
const WIRE: V3[][] = [[[0, 0, 0], [0.15, 0.9, 0]], [[0.15, 0.9, 0], [-0.35, 1.4, 0.1]], [[0.15, 0.9, 0], [0.55, 1.35, -0.1]], [[0.15, 0.9, 0], [0.1, 1.45, 0.4]], [[-0.6, 1.5, -0.3], [0.7, 1.5, -0.3]], [[-0.6, 1.5, 0.4], [0.7, 1.5, 0.4]]];
const Modern: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[5] - 0.3 || t > T.giro + 0.2) return null;
  const spin = t * 1.4, plane = prog(t, T.aviones - 0.3, T.aviones + 0.7), grow = ease(t, CUTS[5] + 0.2, T.compus + 0.4), gx = ease(t, T.cortan - 0.1, T.cortan + 1.2);
  return (
    <G>
      <G p={CM}>
        <Box s={[3.2, 0.12, 1.4]} p={[0, 1.0, 0]} c="#8a6a4a" />{[[-1.5, -0.6], [1.5, -0.6], [-1.5, 0.6], [1.5, 0.6]].map(([x, z], i) => <Box key={i} s={[0.1, 1.0, 0.1]} p={[x, 0.5, z]} c="#4a4a52" />)}
        <Box s={[1.1, 0.9, 0.9]} p={[-0.6, 1.5, -0.2]} c="#e8e0c8" /><Box s={[0.86, 0.62, 0.02]} p={[-0.6, 1.55, 0.26]} c="#0a1a12" o={{ emissive: "#0a2a1a", ei: 0.6 }} cast={false} />
        <Box s={[1.0, 0.06, 0.35]} p={[-0.6, 1.09, 0.5]} c="#ddd4bc" />
        {/* a coluna-árvore em arame verde girando sobre a mesa */}
        <G p={[0.9, 1.2, 0.1]} r={[0, spin, 0]}>{WIRE.map(([a, b], i) => { const u = clamp(grow * WIRE.length - i); return u > 0.01 ? <Pipe key={i} a={a} b={vlerp(a, b, u)} rad={0.025} c="#5aff8a" o={{ emissive: "#2aff6a", ei: 1.3 }} cast={false} seg={4} /> : null; })}</G>
        {/* linhas de código na tela */}
        {Array.from({ length: 6 }, (_, i) => { const w = 0.12 + 0.5 * (0.5 + 0.5 * Math.sin(t * 5 + i * 1.7)) * (0.5 + rnd(i + 3) * 0.5); return <Box key={i} s={[w, 0.04, 0.01]} p={[-1.0 + w / 2, 1.78 - i * 0.1, 0.275]} c="#5aff8a" o={{ emissive: "#2aff6a", ei: 1.2 }} cast={false} />; })}
        {/* o aviãozinho */}
        {plane > 0 && plane < 1 ? <G p={[lerp(-9, 9, plane), 3.6 + Math.sin(plane * PI) * 0.6, 1.2]} r={[0.1 * Math.sin(t * 6), PI / 2, 0]}>
          <Cyl rt={0.22} rb={0.16} h={2.0} r={[PI / 2, 0, 0]} c="#f4f4f4" seg={10} /><Box s={[2.6, 0.06, 0.5]} p={[0, 0, 0.1]} c="#f4f4f4" /><Box s={[0.9, 0.05, 0.3]} p={[0, 0, -0.9]} c="#f4f4f4" /><Box s={[0.05, 0.45, 0.35]} p={[0, 0.25, -0.9]} c="#d23c3c" />
          <Cyl rt={0.3} h={0.03} p={[0, 0, 1.05]} r={[PI / 2, 0, t * 40]} c="#2a2a2a" seg={3} />
        </G> : null}
      </G>
      <G p={CNC}>
        <Box s={[3.6, 0.9, 1.8]} p={[0, 0.45, 0]} c="#6f767d" />
        {Array.from({ length: 8 }, (_, i) => { const x = -1.05 + i * 0.3, done = gx * 8 > i + 0.5, h = done ? 0.55 + 0.4 * Math.cos(((i - 3.5) / 3.5) * (PI / 2)) : 1.0; return <Box key={i} s={[0.3, h, 1.0]} p={[x, 0.9 + h / 2, 0]} c="#cbbfa8" />; })}
        {[-1.6, 1.6].map((x) => <Box key={x} s={[0.15, 2.6, 0.15]} p={[x, 1.3, -1.0]} c="#3a7fc0" />)}
        <G p={[lerp(-1.1, 1.1, gx), 2.25, 0]}>
          <Box s={[0.4, 0.4, 2.2]} p={[0, 0.3, -0.5]} c="#3a7fc0" />
          <Cyl rt={0.42} h={0.06} r={[PI / 2, 0, t * 30]} c="#c8ccd0" o={{ metal: 0.6, rough: 0.3 }} seg={16} />
        </G>
        <Puffs t={t} p={[lerp(-1.1, 1.1, gx), 2.0, 0.3]} n={6} period={0.8} rise={1.4} size={0.35} c="#eee6d6" on={t > T.cortan - 0.1 && t < T.cortan + 1.4 ? 1 : 0} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- o giro: régua de 172,5 m, multidão, fogos, estátua de Gaudí
const Fest: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.metros - 0.3) return null;
  const tape = ease(t, T.metros, T.metros + 1.5), H = (JESUS_TOP + 3) * tape;
  const crowdOn = t > T.inauguraron - 0.3;
  const people = Array.from({ length: 36 }, (_, i) => ({ p: [-7 + (i % 12) * 1.25 + rnd(i) * 0.4, 0, 10 + Math.floor(i / 12) * 1.6 + rnd(i + 2) * 0.5] as V3, yaw: PI + (rnd(i + 5) - 0.5) * 0.6, pose: (i % 3 ? "cheer" : "present") as "cheer" | "present", ph: rnd(i) * 2 }));
  const bursts = [[-8, 20, 8], [7, 24, 6], [0, 28, 8], [-4, 26, 4], [9, 19, 8], [-10, 23, 6]] as V3[];
  return (
    <G>
      <G p={TAPE} vis={t < T.inauguraron}>
        <Box s={[0.35, H + 0.01, 0.35]} p={[0, H / 2, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.4 }} cast={false} />
        {Array.from({ length: Math.floor(H / 2) }, (_, i) => <Box key={i} s={[0.4, 0.5, 0.4]} p={[0, i * 2 + 1.25, 0]} c="#1a1a1a" cast={false} />)}
        <Box s={[1.4, 0.18, 0.4]} p={[0.5, H, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.6 }} cast={false} />
      </G>
      <Crowd list={people.slice(0, 12)} t={t} c={{ skin: "#e0b58c", top: "#f4f4f4", bottom: "#3a3a44", hat: "none", hatC: "#000", boot: "#2a2420", sleeves: false }} scale={1.2} vis={crowdOn} />
      <Crowd list={people.slice(12, 24)} t={t} c={{ skin: "#c98a5b", top: "#2f7fc0", bottom: "#3a3a44", hat: "cap", hatC: "#f4f4f4", boot: "#2a2420", sleeves: false }} scale={1.2} vis={crowdOn} />
      <Crowd list={people.slice(24)} t={t} c={{ skin: "#e8b48c", top: "#3fae5a", bottom: "#3a3a44", hat: "none", hatC: "#000", boot: "#2a2420", sleeves: false }} scale={1.2} vis={crowdOn} />
      {crowdOn ? bursts.map((c, bi) => {
        const t0 = T.inauguraron + bi * 0.45, age = fract((t - t0) / 1.6);
        return t > t0 ? <G key={bi} p={c}>{Array.from({ length: 12 }, (_, i) => { const a = (i * 2 * PI) / 12, b = rnd(i + bi) * PI - PI / 2, d = age * 5.5; return <Sph key={i} rad={0.55 * (1 - age)} p={[Math.cos(a) * Math.cos(b) * d, Math.sin(b) * d - age * age * 2, Math.sin(a) * Math.cos(b) * d]} c={["#5ab8ff", "#ffffff", "#3fcf6a", "#ff7ad9"][bi % 4]} o={{ emissive: ["#2a8fff", "#dfefff", "#1fa84a", "#2a8fff"][bi % 4], ei: 1.6 }} cast={false} ws={6} hs={4} />; })}</G> : null;
      }) : null}
      {/* a estátua de Gaudí na praça, olhando para a torre */}
      <G p={[5.6, 0, 17]} vis={t > T.inauguraron + 0.2}>
        <Box s={[2.0, 2.0, 2.0]} p={[0, 1.0, 0]} c="#cfc6b4" />
        <Worker p={[0, 2.0, 0]} yaw={PI + 0.5} pose={poseOf("present", 0)} t={0} c={{ skin: "#9a9a9a", top: "#8a8a8a", bottom: "#8a8a8a", hat: "none", hatC: "#000", boot: "#7a7a7a", sleeves: true, scarf: "#8f8f8f" }} scale={1.9} mustache={false} />
      </G>
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3f96f0" mid="#9ccff7" low="#fff3dc" />
    <Clouds t={t} n={6} />
    <Land /><City />
    <Basilica t={t} /><Cranes t={t} />
    <Villar t={t} /><Masons t={t} /><Nope t={t} /><Columns t={t} /><Guell t={t} /><Alms t={t} /><Studio t={t} /><Rays t={t} /><Modern t={t} /><Fest t={t} />
    {/* plátanos na praça */}
    <Trees spots={[[30, 0, 22], [-36, 0, 20], [24, 0, 26], [-12, 0, -14], [22, 0, -12]]} c={["#4f9e36", "#63b444"]} />
  </>
);
export { Crowd, Worker, poseOf, Sph, prog };
