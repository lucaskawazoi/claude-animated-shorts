// Mundo do E9: Petra de brinquedo. O Siq (desfiladeiro) corre em x de -50 a 0 (largura 5, z ±2,5); abre-se na praça do
// Tesouro (x 0..16) e a fachada está esculpida na falésia leste (face em x=16). O uádi chega pelo sul até a entrada do Siq
// (x=-50); a represa fecha o Siq e o túnel atravessa o maciço norte (x=-55, z -3..-31), mostrado em raio-x quando a voz
// fala dele. Canal na parede sul (sai de um manancial, sempre em leve descida), tubos de barro na norte; na praça o
// decantador em corte (x=4,2) no caminho até a fonte (x=9); cisternas em corte na falésia sul da praça; cidade ao sul.
// Pré-crítica 13/11 (defeitos do E6 v2): cada verbo da voz tem a sua ação no quadro, de perto.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, MatOpts, Sph, V3, clamp, ease, fract, lerp, mat, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { CUTS, T, WINS, XT } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.petra - 0.12;
/** gancho: o operário foge de um camelo pelo Siq até a praça (6,5 u/s desde o quadro 0) */
export const runX = (t: number) => -34 + 6.5 * Math.min(t, T.petra - 0.12);
const SAND = "#e8c48a", R1 = "#cf7a62", R2 = "#c06a54", R3 = "#e09476", WATER = "#3f9ad8", MUD = "#a8784a", CLAY = "#7a3628"; // canal mais escuro que a parede
const STRATA = ["#f0b890", "#a85040", "#e8c0a0", "#b8604a"];
const quake = (t: number) => (t > T.terremoto - 0.2 && t < T.suagua ? 1 - ease(t, T.rompio + 0.5, T.suagua) : 0);
const wn = (t: number, a: number, b: number, f = 0.2) => clamp(Math.min((t - a) / f, (b - t) / f));
/** valor por chaves [t, v]; suave dentro de cada trecho (ou linear) */
const keysAt = (t: number, ks: [number, number][], smooth = true) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) if (t < ks[i + 1][0]) { const u = prog(t, ks[i][0], ks[i + 1][0]); return lerp(ks[i][1], ks[i + 1][1], smooth ? sstep(u) : u); }
  return ks[ks.length - 1][1];
};
const at3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** caixa ao longo de um segmento a→b (canal, calhas, água inclinada) */
const Bar: React.FC<{ a: V3; b: V3; w: number; h: number; c: string; o?: MatOpts; cast?: boolean }> = ({ a, b, w, h, c, o, cast = true }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], hz = Math.hypot(dx, dz), L = Math.hypot(hz, dy);
  if (L < 0.01) return null;
  return <Box s={[L, h, w]} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} r={[0, -Math.atan2(dz, dx), Math.atan2(dy, hz)]} c={c} o={o} cast={cast} />;
};

// ---------------------------------------------------------------- falésias
/** rocha com estratos nas 4 faces: sem textura a régua não vê a câmera se mexer; op < 1 = raio-x */
const Rock: React.FC<{ s: V3; p: V3; c: string; n?: number; op?: number }> = ({ s, p, c, n = 6, op = 1 }) => {
  const o = op < 0.995 ? { opacity: Math.round(op * 40) / 40, depthWrite: false } : undefined;
  return (
    <G p={p}>
      <Box s={s} c={c} o={o} />
      {Array.from({ length: n }, (_, j) => { const y = -s[1] / 2 + s[1] * (j + 0.5 + (rnd(j + s[0]) - 0.5) * 0.4) / n, h = 0.3 + 0.3 * rnd(j * 3 + s[2]), col = STRATA[(j + Math.round(s[0])) % 4];
        return <G key={j}><Box s={[s[0] + 0.06, h, s[2] + 0.06]} p={[0, y, 0]} c={col} cast={false} o={o} /></G>; })}
    </G>
  );
};
const Cliffs: React.FC = () => {
  const segs = useMemo(() => {
    const out: { p: V3; s: V3; c: string }[] = [];
    for (let i = 0; i < 26; i++) for (const sd of [-1, 1]) { const x = -50 + i * 2 + 1, h = lerp(14, 22, rnd(i * 7 + (sd > 0 ? 1 : 2))), w = lerp(5, 7, rnd(i * 3 + sd)); out.push({ p: [x, h / 2, sd * (2.5 + w / 2 + (rnd(i + sd * 9) - 0.5) * 0.4)], s: [2.3, h, w], c: [R1, R2, R3][(i + (sd > 0 ? 0 : 1)) % 3] }); }
    return out;
  }, []);
  return (
    <G>
      {segs.map((q, i) => <Box key={i} s={q.s} p={q.p} c={q.c} />)}
      {/* estratos do arenito na face de dentro do Siq: textura que a régua (e o olho) usa para ver o movimento */}
      {segs.map((q, i) => { const sd = q.p[2] > 0 ? 1 : -1, zf = q.p[2] - sd * (q.s[2] / 2 + 0.03); return [0.18, 0.34, 0.52, 0.71, 0.86].map((f, j) => <Box key={i + "-" + j} s={[2.34, 0.28 + 0.25 * rnd(i * 5 + j), 0.06]} p={[q.p[0], q.s[1] * f, zf]} c={STRATA[(i + j) % 4]} cast={false} />); })}
      {[0.2, 0.4, 0.6, 0.8].map((f, j) => <Box key={"n" + j} s={[16.1, 0.5, 0.06]} p={[7, 22 * f, -9.97]} c={STRATA[j % 4]} cast={false} />)}
      {/* ressalto na parede norte do Siq: o operário assiste à enxurrada daqui de cima */}
      <Box s={[1.6, 0.3, 1.0]} p={[-46, 3.85, -2.0]} c={R3} />
      {/* maciços em volta da praça; falésia leste com a fachada */}
      <Rock s={[14, 28, 30]} p={[23, 14, 0]} c={R1} n={9} />
      <Rock s={[16, 22, 12]} p={[7, 11, -16]} c={R2} n={7} />
      <Rock s={[12, 14, 10]} p={[3, 7, 12]} c={R3} n={5} /><Rock s={[8, 16, 10]} p={[16, 8, 13]} c={R2} n={5} />
      {[[-30, -36, 18, 20], [-6, -38, 22, 24], [30, -30, 20, 26], [50, 10, 18, 22], [-80, 0, 20, 18], [40, 60, 24, 20], [-30, 50, 20, 18]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c={[R1, R2, R3][i % 3]} o={{ flat: true }} />)}
    </G>
  );
};
const Ground: React.FC = () => (
  <G>
    <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(SAND)}><planeGeometry args={[600, 600]} /></mesh>
    {/* leito seco do uádi chegando pelo sul */}
    <mesh position={[-51, 0.02, 24]} rotation={[-PI / 2, 0, 0]} material={mat("#d9b27a")}><planeGeometry args={[6, 50]} /></mesh>
    <mesh position={[-24, 0.02, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#dcb683")}><planeGeometry args={[52, 5]} /></mesh>
    {/* faixas no chão da praça: textura para a régua de movimento */}
    {[-7, -4, -1, 2, 5].map((z, i) => <mesh key={i} position={[8, 0.015, z]} rotation={[-PI / 2, 0, 0]} material={mat(i % 2 ? "#dcb27c" : "#e2bc88")}><planeGeometry args={[15, 1.2]} /></mesh>)}
  </G>
);

/** chuva: riscos que caem numa caixa [x0,x1]×[z0,z1] e uma nuvem escura em cima */
const Rain: React.FC<{ t: number; a: number; b: number; x: [number, number]; z: [number, number]; top: number; n: number; seed: number }> = ({ t, a, b, x, z, top, n, seed }) => {
  const k = wn(t, a, b, 0.35); if (k <= 0) return null;
  const m = Math.round(n * k);
  return (
    <G>
      {Array.from({ length: m }, (_, i) => { const u = fract(t * 1.7 + rnd(i + seed)); return <Box key={i} s={[0.07, 1.1, 0.07]} p={[lerp(x[0], x[1], rnd(i * 3 + seed)), top - u * top, lerp(z[0], z[1], rnd(i * 7 + seed))]} r={[0, 0, 0.12]} c="#cfe8ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.5, opacity: 0.85, depthWrite: false }} />; })}
      {Array.from({ length: 6 }, (_, i) => <Sph key={"c" + i} rad={5 + 2 * rnd(i + seed)} p={[lerp(x[0], x[1], (i + 0.5) / 6), top + 3 + rnd(i + seed + 2), lerp(z[0], z[1], rnd(i + seed + 5))]} sc={[1.4 * k, 0.55 * k, 1]} c="#8a96a8" cast={false} recv={false} ws={9} hs={6} />)}
    </G>
  );
};

// ---------------------------------------------------------------- água: faixa que cresce por um caminho, com espuma andando
const plen = (pts: V3[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[2] - pts[i][2]), 0);
const along = (pts: V3[], s: number): V3 => {
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[2] - a[2]); if (s <= acc + l || i === pts.length - 2) { const k = clamp((s - acc) / l); return [lerp(a[0], b[0], k), 0, lerp(a[2], b[2], k)]; } acc += l; }
  return pts[pts.length - 1];
};
const Flow: React.FC<{ pts: V3[]; u: number; w: number; t: number; c?: string; y?: number; wave?: boolean }> = ({ pts, u, w, t, c = WATER, y = 0.25, wave = false }) => {
  if (u <= 0.005) return null;
  const L = plen(pts) * u; let acc = 0; const out: React.ReactNode[] = []; let head: V3 | null = null, yaw = 0;
  for (let i = 0; i < pts.length - 1 && acc < L; i++) {
    const a = pts[i], b0 = pts[i + 1], sl = Math.hypot(b0[0] - a[0], b0[2] - a[2]), k = Math.min(1, (L - acc) / sl);
    const b: V3 = [lerp(a[0], b0[0], k), 0, lerp(a[2], b0[2], k)], m: V3 = [(a[0] + b[0]) / 2, y, (a[2] + b[2]) / 2];
    yaw = -Math.atan2(b[2] - a[2], b[0] - a[0]);
    out.push(<Box key={i} s={[sl * k + w * 0.5, 0.3, w]} p={m} r={[0, yaw, 0]} c={c} o={{ rough: 0.25, emissive: "#3a2410", ei: 0.4 }} />);
    out.push(<G key={"f" + i} p={[a[0], y + 0.17, a[2]]} r={[0, yaw, 0]}>{Array.from({ length: Math.max(2, Math.floor(sl * k / 1.6)) }, (_, j) => <Box key={j} s={[0.55, 0.05, w * (0.12 + 0.2 * rnd(j + i))]} p={[fract(j * 0.37 + i * 0.13 + t * 0.9) * sl * k, 0, (rnd(j * 3 + i) - 0.5) * w * 0.5]} c="#f4ecdc" cast={false} />)}</G>);
    head = b; acc += sl;
  }
  if (!head || u >= 0.995) return <G>{out}</G>;
  return (
    <G>{out}
      {wave ? <G p={[head[0], y, head[2]]} r={[0, yaw, 0]}>
        {/* frente da enxurrada: um muro de água barrenta com espuma em cima */}
        <Box s={[1.6, 1.7, w + 0.2]} p={[-0.4, 0.75, 0]} c={c} o={{ rough: 0.3, emissive: "#3a2410", ei: 0.35 }} />
        {Array.from({ length: 7 }, (_, j) => <Sph key={j} rad={0.55 + 0.2 * rnd(j)} p={[0.2 + 0.3 * Math.sin(t * 9 + j), 1.6 + 0.25 * Math.sin(t * 11 + j * 2), (j / 6 - 0.5) * w]} c="#f4fbff" ws={8} hs={6} cast={false} />)}
      </G> : <Sph rad={w * 0.55} p={[head[0], y + 0.3, head[2]]} sc={[1, 0.6, 1]} c="#f4fbff" ws={10} hs={6} />}
    </G>
  );
};
// riada 1: desce o uádi, entra no Siq e arrasa as bancas; volta (⏪) na pergunta
const FLOOD1: V3[] = [[-51, 0, 30], [-51, 0, 4], [-48, 0, 0], [0, 0, 0], [8, 0, 2]];
const L1 = plen(FLOOD1);
const head1 = (t: number) => L1 * prog(t, T.agua1 - 0.05, T.arrasa + 1.1) * (1 - ease(t, T.b1 + 0.2, T.presa - 0.1));
// riada 2: bate na represa no «choca», entra no túnel no «se va por el túnel», sai longe no «lejos»
const FLOOD2: V3[] = [[-51, 0, 30], [-51, 0, 6], [-50.3, 0, 1.6], [-53.4, 0, -0.8], [-55, 0, -3.5], [-55, 0, -31], [-54, 0, -35], [-50, 0, -41]];
const L2 = plen(FLOOD2), sAt = (k: number) => plen(FLOOD2.slice(0, k + 1)) / L2;
// a riada já desce o uádi a partir do corte extra (W3): quem olha de cima vê ela chegando enquanto o túnel é cavado
const u2At = (t: number) => keysAt(t, [[WINS[3] + 0.05, 0], [T.choca + 0.1, sAt(2)], [T.porTunel + 0.1, sAt(4)], [T.lejos + 0.15, sAt(5)], [T.lejos + 0.8, 1]], false);
const dry2 = (t: number) => ease(t, T.p2 + 0.25, T.pierde - 0.25);

/** o que a riada leva: banca, jarros, caixotes e carroça no chão do Siq (voltam ao lugar no ⏪) */
const GOODS: { x: number; z: number; k: "stall" | "jar" | "crate" | "cart" }[] = [
  { x: -43, z: -1.5, k: "stall" }, { x: -40.6, z: -1.6, k: "jar" }, { x: -40.0, z: -0.8, k: "jar" }, { x: -39.3, z: -1.8, k: "jar" },
  { x: -37.8, z: -1.1, k: "crate" }, { x: -37.1, z: -1.8, k: "crate" }, { x: -35.6, z: -0.7, k: "cart" },
];
const Good: React.FC<{ k: string; i: number }> = ({ k, i }) => {
  if (k === "stall") return <G><Box s={[1.8, 0.7, 0.9]} p={[0, 0.35, 0]} c="#a8743a" />{[-0.85, 0.85].map((x) => <Box key={x} s={[0.14, 2.1, 0.14]} p={[x, 1.05, 0.35]} c="#7a4a2a" />)}<Box s={[2.2, 0.14, 1.4]} p={[0, 2.1, 0.1]} c="#e8d27a" /><Box s={[2.22, 0.15, 0.45]} p={[0, 2.12, 0.1]} c="#c8553d" /><Sph rad={0.25} p={[-0.4, 0.85, 0]} c="#d8a040" /><Sph rad={0.25} p={[0.35, 0.85, 0]} c="#7a3fc0" /></G>;
  if (k === "jar") return <G><Cyl rt={0.22} rb={0.32} h={0.75} p={[0, 0.38, 0]} c={i % 2 ? "#c8703a" : "#b8603a"} seg={10} /><Cyl rt={0.12} h={0.2} p={[0, 0.85, 0]} c="#a85a2a" seg={8} /></G>;
  if (k === "crate") return <G><Box s={[0.7, 0.6, 0.7]} p={[0, 0.3, 0]} c="#a8743a" /><Box s={[0.72, 0.1, 0.72]} p={[0, 0.45, 0]} c="#7a4a2a" /></G>;
  return <G><Box s={[1.6, 0.45, 1.0]} p={[0, 0.75, 0]} c="#a8743a" />{[[-0.5, 0.56], [0.5, 0.56], [-0.5, -0.56], [0.5, -0.56]].map(([x, z], j) => <Cyl key={j} rt={0.36} h={0.12} p={[x, 0.36, z]} r={[PI / 2, 0, 0]} c="#5a3a1e" seg={10} />)}<Box s={[1.2, 0.08, 0.08]} p={[-1.3, 0.7, 0]} c="#7a4a2a" /></G>;
};
const Floods: React.FC<{ t: number }> = ({ t }) => {
  const h1 = head1(t), u1 = h1 / L1, u2 = u2At(t), d2 = dry2(t), grow = ease(t, T.lejos + 0.2, T.lejos + 1.0);
  const splash = wn(t, T.choca + 0.05, T.porTunel + 0.6, 0.15);
  return (
    <G>
      <Flow pts={FLOOD1} u={u1} w={4.4} t={t} c="#a8804e" wave />
      {/* a riada leva as bancas, mas elas ficam rodando na água dentro do quadro (x ≤ -29) em vez de sumir atrás da câmera */}
      {t < CUTS[2] ? GOODS.map((g, i) => {
        const s0 = 31 + (g.x + 48), d = Math.min(Math.max(0, h1 - s0 - 0.3) * 0.6, -29 - 1.1 * i - g.x), q = along(FLOOD1, s0 + d), f = clamp(d / 1.5);
        return <G key={i} p={[q[0], f * (0.45 + 0.2 * Math.sin(t * 6 + i)), q[2] + g.z]} r={[d * 0.09 * Math.sin(i + 1) + f * 0.5 * Math.sin(t * 2.1 + i), d * 0.05 + f * t * 1.4 * (i % 2 ? 1 : -1), d * 0.11 * (i % 2 ? 1 : -1) + f * 0.4 * Math.sin(t * 1.7 + i * 2)]}><Good k={g.k} i={i} /></G>;
      }) : null}
      {d2 < 0.999 ? <Flow pts={FLOOD2} u={u2} w={3.2} t={t} c="#b48a52" y={0.25 - 0.6 * d2} wave={d2 < 0.01} /> : null}
      {/* a água batendo na represa espirra para cima */}
      {splash > 0 ? Array.from({ length: 12 }, (_, i) => { const u = fract((t - T.choca) * 1.5 + i / 12), hgt = 6 * u * (1 - u) * 4 * splash; return <Sph key={i} rad={0.6 + 0.4 * rnd(i)} p={[-49.9 - u * 2.2 * rnd(i + 3), 0.8 + hgt, -1.8 + 4.2 * rnd(i + 9)]} c="#f4fbff" cast={false} ws={8} hs={6} />; }) : null}
      {/* a água que sai longe do desfiladeiro espalha na areia e some (se pierde) */}
      {grow > 0.01 && d2 < 0.999 ? <Sph rad={6} p={[-50, 0.04, -44]} sc={[1.5 * grow * (1 - d2) + 0.01, 0.04, 1.2 * grow * (1 - d2) + 0.01]} c="#8a6a48" ws={16} hs={4} cast={false} /> : null}
      {d2 > 0.01 && d2 < 0.999 ? Array.from({ length: 8 }, (_, i) => <Box key={i} s={[0.12, 0.6, 0.12]} p={[-50 + (rnd(i) - 0.5) * 12, 0.3 - d2 * 0.6, -44 + (rnd(i + 4) - 0.5) * 9]} c="#6a4a30" cast={false} />) : null}
    </G>
  );
};

// ---------------------------------------------------------------- represa e túnel (raio-x)
const xrayAt = (t: number) => wn(t, T.tunel - 0.25, T.p2 + 0.25, 0.5);
// a presa sobe em 3 fiadas que caem no lugar (com poeira), com dois pedreiros na frente: o close nunca fica parado
const DAMC = [CUTS[1] + 0.02, CUTS[1] + 0.42, CUTS[1] + 0.82];
const Dam: React.FC<{ t: number }> = ({ t }) => {
  const b = built(t), dig = b ? 1 : ease(t, T.tunel - 0.05, T.noventa + 1.7), len = 28 * dig;
  const xr = xrayAt(t);
  return (
    <G>
      {DAMC.map((tc, j) => { if (!b && t < tc) return null; const y = 0.533 + j * 1.067 + 2.6 * (1 - (b ? 1 : ease(t, tc, tc + 0.25)));
        return <G key={j}><Box s={[1.6, 1.067, 6.2]} p={[-48.5, y, 0]} c="#a85848" /><Box s={[1.64, 0.12, 6.24]} p={[-48.5, y + 0.47, 0]} c="#7a3a2e" cast={false} /></G>; })}
      <Puffs t={t} p={[-49.6, 0.3, 0.4]} n={8} period={0.5} rise={1.6} size={0.42} c="#e8d4a8" on={b ? 0 : Math.max(...DAMC.map((tc) => wn(t, tc + 0.2, tc + 0.75, 0.1)))} drift={[-1.2, 0, 0]} />
      <Crowd list={[{ p: [-50.5, 0, -1.0], yaw: PI / 2, pose: "chisel", ph: 0 }, { p: [-50.5, 0, 1.8], yaw: PI / 2, pose: "chisel", ph: 0.25 }]} t={t} c={COSTUMES.nabateo} vis={t > CUTS[1] && t < WINS[3]} />
      {dig > 0.01 ? <G>
        <Box s={[4.6 * Math.min(1, dig * 6), 4.6 * Math.min(1, dig * 6), 0.2]} p={[-55, 2.3 * Math.min(1, dig * 6), -2.85]} c="#2a1a14" cast={false} />
        {dig > 0.97 ? <Box s={[4.6, 4.6, 0.2]} p={[-55, 2.3, -31.15]} c="#2a1a14" cast={false} /> : null}
        {/* o túnel dentro da rocha: chão e paredes escuras (só se vê no raio-x) */}
        <Box s={[4.4, 0.1, len]} p={[-55, 0.06, -2.9 - len / 2]} c="#3a2418" cast={false} />
        {[-57.2, -52.8].map((x) => <Box key={x} s={[0.16, 4.6, len]} p={[x, 2.3, -2.9 - len / 2]} c="#5a2a1e" cast={false} />)}
      </G> : null}
      {/* três cavadores na frente do túnel enquanto ele cresce; no fim furam a rocha do outro lado (poeira) */}
      <Crowd list={[-1.3, 0, 1.3].map((dx, i) => ({ p: [-55 + dx, 0, -3.4 - len] as V3, yaw: PI, pose: "chisel" as PoseName, ph: i * 0.2 }))} t={t} c={COSTUMES.nabateo} vis={dig > 0.01 && dig < 0.995 && xr > 0.2} />
      <Puffs t={t} p={[-55, 0.5, -3.8 - len]} n={6} period={0.8} rise={2.4} size={1.2} c="#e8d4a8" on={dig > 0.01 && dig < 0.995 ? xr : 0} drift={[0, 0, 0.5]} />
      <Puffs t={t} p={[-55, 1, -31.6]} n={10} period={0.7} rise={3} size={1.3} c="#e8d4a8" on={b ? 0 : wn(t, T.noventa + 1.65, T.noventa + 2.5, 0.15)} drift={[0, 0, -1.5]} />
    </G>
  );
};
const Massif: React.FC<{ t: number }> = ({ t }) => <Rock s={[22, 18, 28]} p={[-61, 9, -17]} c={R2} n={6} op={1 - 0.88 * xrayAt(t)} />;

// ---------------------------------------------------------------- canal, tubos, calhas, fonte
const CS: V3 = [-49.6, 4.4, 2.15], CE: V3 = [0.6, 1.9, 2.15];   // canal: do manancial até a boca do Siq, sempre descendo
const TS: V3 = [-49, 3.6, -2.2], TE: V3 = [1, 1.2, -2.2];       // tubos de barro cozido
const BREAK = 0.86;                                             // onde o terremoto parte o canal (x≈-6,4)
const CANG = Math.atan2(CE[1] - CS[1], CE[0] - CS[0]), TANG = Math.atan2(TE[1] - TS[1], TE[0] - TS[0]);
const muddyAt = (t: number) => ease(t, T.p3, T.arena) * (1 - ease(t, T.limpia + 0.2, T.limpia + 0.9));
const dryAt = (t: number) => ease(t, T.p4 + 0.2, T.meses + 0.5) * (1 - ease(t, T.cisternasT, T.cisternasT + 1.0));
const brokeAt = (t: number) => ease(t, T.canalesR - 0.05, T.canalesR + 0.5);
// ritmo 13/11: o plano dos canais abre com o operário já cavando (água atrás dele); no «canales tallados» o sulco corre a
// parede; no «siempre un poco en bajada» a água o empurra, ele escorrega canal abaixo (gag) e cai na fonte na «ciudad»
const carveAt = (t: number) => (built(t) ? 1 : keysAt(t, [[CUTS[2] + 0.1, 0], [T.canales - 0.1, 0.12], [T.canales + 4.2, 1]], false));
const flowAt = (t: number) => (built(t) ? 1 : keysAt(t, [[CUTS[2] + 0.4, 0], [T.canales - 0.1, 0.105], [XT.slip, 0.105], [T.ciudad + 0.45, 1]], false));
export const canalY = (x: number) => CS[1] + (CE[1] - CS[1]) * (x - CS[0]) / (CE[0] - CS[0]);
/** onde está o operário do canal: cavando na frente do sulco → montado na cabeça da água → voo até a fonte */
export const canalRider = (t: number): V3 => {
  const L = CE[0] - CS[0];
  if (t < XT.slip) { const x = CS[0] + L * Math.min(carveAt(t), 0.12) - 0.3; return [x, canalY(x) + 0.27, CS[2]]; }
  if (t < T.ciudad + 0.45) { const x = CS[0] + L * flowAt(t) + 0.35; return [x, canalY(x) + 0.3, CS[2]]; }
  const u = clamp((t - T.ciudad - 0.45) / 0.55);
  return [lerp(CE[0] + 0.35, 9, u), lerp(CE[1] + 0.3, 0.32, u) + 2.6 * 4 * u * (1 - u), lerp(CS[2], 1.0, u)];
};
const basinK = (t: number) => (built(t) ? 1 : ease(t, T.estanques - 0.25, T.estanques + 0.55));
// calhas na praça: boca do Siq → decantador → fonte (o trecho do meio some quando o decantador sobe no caminho)
const TA: [V3, V3] = [[0.8, 1.75, 2.1], [2.45, 1.5, 1.75]], TB: [V3, V3] = [[2.45, 1.5, 1.75], [5.95, 1.1, 1.3]], TC: [V3, V3] = [[5.95, 1.05, 1.3], [7.45, 0.9, 1.05]];
const FOUNT: V3 = [9, 0, 1.0];
const Channels: React.FC<{ t: number }> = ({ t }) => {
  const b = built(t), ck = carveAt(t), pk = b ? 1 : ease(t, T.tubos - 0.3, T.tubos + 0.8);
  const flow = flowAt(t), mud = muddyAt(t), dry = dryAt(t), brk = brokeAt(t), bk = basinK(t);
  const wl = Math.min(flow * (1 - dry), brk > 0.01 ? BREAK : 1), wc = mud > 0.5 ? MUD : WATER, wo: MatOpts = { emissive: mud > 0.5 ? "#000000" : "#1f6fb0", ei: 0.3 };
  const BP = at3(CS, CE, BREAK), up: V3 = [0, 0.31, 0];
  const add = (a: V3, d: V3): V3 => [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
  const reach = wl > 0.97 && brk < 0.01;                          // água chegando na praça
  const outflow = b || (bk < 0.5 ? reach : reach && t > T.porArriba);     // a calha da fonte só recebe a água que sai por cima
  return (
    <G>
      {/* manancial: fenda na parede de onde brota a água */}
      <Box s={[0.7, 1.4, 0.12]} p={[-49.1, 5.3, 2.32]} c="#2a1a14" cast={false} />
      {flow > 0.01 && dry < 0.5 && brk < 0.9 ? Array.from({ length: 5 }, (_, i) => { const u = fract(t * 1.8 + i / 5); return <Sph key={i} rad={0.14} p={[-49.1 - u * 0.4, 4.9 - u * 0.4, 2.2]} c="#6fc4ff" o={{ emissive: "#3fa0ff", ei: 0.5 }} cast={false} ws={6} hs={4} />; }) : null}
      {ck > 0.01 ? <G>
        <Bar a={CS} b={at3(CS, CE, Math.min(ck, BREAK))} w={0.8} h={0.5} c={CLAY} />
        {ck > BREAK ? <G p={[BP[0], BP[1] - 1.3 * brk, BP[2]]} r={[0, 0, -0.6 * brk]}><Bar a={[0, 0, 0]} b={[(CE[0] - BP[0]) * (ck - BREAK) / (1 - BREAK), (CE[1] - BP[1]) * (ck - BREAK) / (1 - BREAK), 0]} w={0.8} h={0.5} c={CLAY} /></G> : null}
        {wl > 0.01 ? <Bar a={add(CS, up)} b={add(at3(CS, CE, Math.min(wl, BREAK)), up)} w={0.64} h={0.14} c={wc} o={wo} cast={false} /> : null}
        {wl > BREAK ? <Bar a={add(BP, up)} b={add(at3(CS, CE, wl), up)} w={0.64} h={0.14} c={wc} o={wo} cast={false} /> : null}
        {wl > 0.05 && mud < 0.5 ? Array.from({ length: 12 }, (_, i) => <Sph key={i} rad={0.16} p={add(at3(CS, CE, fract(t * 0.16 + i / 12) * wl), [0, 0.42, 0])} c="#ffffff" cast={false} ws={6} hs={4} />) : null}
        {mud > 0.5 && wl > 0.05 ? Array.from({ length: 12 }, (_, i) => <Sph key={i} rad={0.13} p={add(at3(CS, CE, fract(t * 0.16 + i / 12) * wl), [0, 0.36, (rnd(i) - 0.5) * 0.2])} c="#c89048" cast={false} ws={6} hs={4} />) : null}
      </G> : null}
      {/* o cinzel abrindo o canal: lascas na ponta enquanto ele avança */}
      <Puffs t={t} p={add(at3(CS, CE, ck), [0, 0.2, -0.3])} n={6} period={0.6} rise={0.9} size={0.28} c="#f0c8a0" on={ck > 0.01 && ck < 0.99 ? 1 : 0} drift={[0.4, 0, -0.3]} />
      {/* setas de descida no «siempre un poco en bajada»: chevrons deitados no canal, andando morro abaixo */}
      {wn(t, T.siempre - 0.05, T.llevan + 0.3, 0.2) > 0 ? Array.from({ length: 4 }, (_, i) => { const q = add(at3(CS, CE, 0.03 + fract(t * 0.22 + i / 4) * 0.26), [0, 0.62, 0]);
        return <G key={i} p={q} r={[0, 0, CANG]}>{[1, -1].map((sd) => <Box key={sd} s={[0.75, 0.1, 0.16]} p={[-0.25, 0, sd * 0.22]} r={[0, sd * 0.65, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />)}</G>; }) : null}
      {/* o terremoto parte o canal: a água cai do rasgo */}
      {brk > 0.2 && t < T.suagua + 1.5 ? <G><Box s={[0.35, BP[1], 0.4]} p={[BP[0] + 0.2, BP[1] / 2, BP[2]]} c={WATER} o={{ emissive: "#1f6fb0", ei: 0.4, opacity: 0.85, depthWrite: false }} cast={false} /><Puffs t={t} p={[BP[0] + 0.3, 0.2, BP[2] - 0.4]} n={6} period={0.6} rise={1.2} size={0.6} c="#e8f6ff" on={1} drift={[0, 0, -0.6]} /></G> : null}
      {pk > 0.01 ? Array.from({ length: Math.floor(26 * pk) }, (_, i) => <G key={i} p={at3(TS, TE, (i + 0.5) / 26)} r={[0, 0, PI / 2 + TANG]}><Cyl rt={0.28} h={1.9} c="#c8703a" seg={10} /><Cyl rt={0.33} h={0.2} p={[0, 0.95, 0]} c="#a85a2a" seg={10} /></G>) : null}
      {/* calhas na praça */}
      {ck > 0.99 || b ? <G>
        <Bar a={TA[0]} b={TA[1]} w={0.5} h={0.22} c={CLAY} />{bk < 0.5 ? <Bar a={TB[0]} b={TB[1]} w={0.5} h={0.22} c={CLAY} /> : null}<Bar a={TC[0]} b={TC[1]} w={0.5} h={0.22} c={CLAY} />
        {[TA[1], TB[1]].map((q, j) => <Box key={j} s={[0.18, q[1] - 0.1, 0.18]} p={[q[0], (q[1] - 0.1) / 2, q[2]]} c="#7a3a2e" vis={bk < 0.5 || j === 1} />)}
        {reach ? <Bar a={add(TA[0], [0, 0.13, 0])} b={add(TA[1], [0, 0.13, 0])} w={0.32} h={0.06} c={wc} o={wo} cast={false} /> : null}
        {reach && bk < 0.5 ? <Bar a={add(TB[0], [0, 0.13, 0])} b={add(TB[1], [0, 0.13, 0])} w={0.32} h={0.06} c={wc} o={wo} cast={false} /> : null}
        {outflow ? <Bar a={add(TC[0], [0, 0.13, 0])} b={add(TC[1], [0, 0.13, 0])} w={0.32} h={0.06} c={bk > 0.5 ? WATER : wc} o={{ emissive: "#1f6fb0", ei: 0.35 }} cast={false} /> : null}
        {/* areia chegando com a água na fonte (antes do decantador) */}
        {reach && mud > 0.5 && bk < 0.5 ? Array.from({ length: 7 }, (_, i) => { const u = fract(t * 1.4 + i / 7); return <Sph key={i} rad={0.14} p={[lerp(TC[0][0], TC[1][0] + 0.6, u), lerp(TC[0][1] + 0.2, 0.75, u * u), lerp(TC[0][2], TC[1][2], u) + (rnd(i) - 0.5) * 0.3]} c="#c89048" cast={false} ws={6} hs={4} />; }) : null}
      </G> : null}
      <Fountain t={t} reach={outflow} />
    </G>
  );
};
/** fonte da praça (oca: a água sobe, fica turva, seca e racha) */
const Fountain: React.FC<{ t: number; reach: boolean }> = ({ t, reach }) => {
  const b = built(t), mud = muddyAt(t), dry = dryAt(t), gone = ease(t, T.suagua - 0.4, T.suagua + 0.6);
  const fill = (b ? 1 : ease(t, T.ciudad + 0.35, T.ciudad + 1.0)) * (1 - dry) * (1 - gone);
  const pile = ease(t, T.p3 + 0.3, T.arena + 0.8) * (1 - 0.6 * ease(t, T.limpia + 0.2, T.limpia + 1.0));
  const cracks = Math.max(dry, gone) > 0.6;
  void reach;
  return (
    <G p={FOUNT}>
      <Box s={[3.2, 0.3, 2.4]} p={[0, 0.15, 0]} c="#c08070" />
      {[[0, 1.1, 3.2, 0.2], [0, -1.1, 3.2, 0.2]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.85, d]} p={[x, 0.42, z]} c="#c08070" />)}
      {[-1.5, 1.5].map((x) => <Box key={x} s={[0.2, 0.85, 2.4]} p={[x, 0.42, 0]} c="#c08070" />)}
      {fill > 0.02 ? <Box s={[2.8, 0.42 * fill, 2.0]} p={[0, 0.3 + 0.21 * fill, 0]} c={mud > 0.5 ? MUD : WATER} o={{ emissive: mud > 0.5 ? "#000000" : "#1f6fb0", ei: 0.3 }} cast={false} /> : null}
      {pile > 0.02 ? <Sph rad={0.9} p={[0.6, 0.3, 0.2]} sc={[1.2, 0.55 * pile, 1]} c="#c89048" cast={false} ws={10} hs={6} /> : null}
      {/* o operário cai na fonte junto com a água: tchibum */}
      <Puffs t={t} p={[0, 0.5, 0]} n={10} period={0.6} rise={2.2} size={0.55} c="#e8f6ff" on={b ? 0 : wn(t, T.ciudad + 0.95, T.ciudad + 1.7, 0.1)} drift={[0, 0, -0.4]} />
      {cracks ? <G>{[[-0.8, 0.3, 0.5], [0.2, -0.4, -0.7], [0.9, 0.2, 1.1], [-0.3, -0.1, 2.2]].map(([x, z, r], i) => <Box key={i} s={[1.1, 0.05, 0.07]} p={[x, 0.33, z]} r={[0, r, 0]} c="#5a3a22" cast={false} />)}<Box s={[2.8, 0.03, 2.0]} p={[0, 0.31, 0]} c="#b08458" cast={false} /></G> : null}
    </G>
  );
};

// ---------------------------------------------------------------- decantador em corte: a água para, a areia desce, sai limpa por cima
export const BASIN = { x: 4.2, z: 1.6 };
const Basin: React.FC<{ t: number }> = ({ t }) => {
  const b = built(t), k = basinK(t); if (k <= 0.01) return null;
  const lvl = b ? 1 : ease(t, T.estanques + 0.4, T.detiene + 0.1), calm = b ? 1 : ease(t, T.detiene, T.detiene + 0.6);
  const sink = b ? 1 : ease(t, T.pesada, T.fondo + 0.5), clear = b ? 1 : ease(t, T.porArriba - 0.1, T.limpia + 0.2);
  const quakeDry = ease(t, T.suagua - 0.4, T.suagua + 0.6), inflow = !b && t > T.estanques + 0.4 && t < T.porArriba + 2.5 && quakeDry < 0.5;
  const sandH = 0.24 * sink, top = 0.25 + 0.86 * lvl * (1 - 0.8 * quakeDry), wh = Math.max(0, top - 0.25 - sandH), hc = wh * 0.78 * clear, hm = wh - hc;
  return (
    <G p={[BASIN.x, 0, BASIN.z]} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[3.4, 0.25, 2.0]} p={[0, 0.125, 0]} c="#d0806a" />
      <Box s={[3.4, 1.4, 0.2]} p={[0, 0.7, 0.9]} c="#d0806a" />
      <Box s={[0.2, 1.4, 2.0]} p={[-1.6, 0.7, 0]} c="#d0806a" />
      <Box s={[0.2, 1.12, 2.0]} p={[1.6, 0.56, 0]} c="#d0806a" />
      {/* borda do corte (a frente está aberta para se ver dentro) */}
      <Box s={[3.44, 0.08, 0.06]} p={[0, 0.25, -1.0]} c="#8a4a3a" cast={false} />
      {[-1.6, 1.6].map((x) => <Box key={x} s={[0.24, x < 0 ? 1.4 : 1.12, 0.06]} p={[x, x < 0 ? 0.7 : 0.56, -1.0]} c="#8a4a3a" cast={false} />)}
      {sandH > 0.01 ? <Box s={[3.0, sandH, 1.6]} p={[0, 0.25 + sandH / 2, 0]} c="#c89048" cast={false} /> : null}
      {hm > 0.01 ? <Box s={[3.0, hm, 1.6]} p={[0, 0.25 + sandH + hm / 2, 0]} c="#9a7448" o={{ opacity: 0.82, rough: 0.3, depthWrite: false }} cast={false} /> : null}
      {hc > 0.01 ? <Box s={[3.0, hc, 1.6]} p={[0, top - hc / 2, 0]} c="#4aa8e8" o={{ opacity: 0.6, rough: 0.2, emissive: "#1f6fb0", ei: 0.3, depthWrite: false }} cast={false} /> : null}
      {/* grãos de areia: giram enquanto a água entra, param no «se detiene», descem no «se va al fondo» */}
      {/* cada grão cai na sua vez (pesada → fondo): um caindo a cada ~0,1 s em vez de uma descida lenta e uniforme */}
      {!b && lvl > 0.2 && t < CUTS[4] ? Array.from({ length: 16 }, (_, i) => {
        const sw = 1 - calm, gx = -1.25 + (i % 8) * 0.36 + sw * 0.25 * Math.sin(t * 3.2 + i * 1.7), gz = -0.45 + Math.floor(i / 8) * 0.9, ti = T.pesada + 0.05 + 1.45 * rnd(i + 3);
        const yh = 0.45 + 0.5 * rnd(i) * lvl + sw * 0.15 * Math.sin(t * 4.5 + i), y = lerp(yh, 0.3 + 0.12 * rnd(i + 5), ease(t, ti, ti + 0.3));
        return <Sph key={i} rad={0.12} p={[gx, y, gz]} c="#e0a050" cast={false} ws={6} hs={4} />;
      }) : null}
      {/* gag: a primeira água turva espirra na cara do operário (atrás do tanque); a lama fica até ele limpar */}
      {!b ? Array.from({ length: 7 }, (_, i) => { const u = prog(t, XT.spl + i * 0.025, XT.spl + 0.3 + i * 0.025); if (u <= 0 || u >= 1) return null;
        return <Sph key={"m" + i} rad={0.16 + 0.06 * rnd(i)} p={[lerp(-1.0, -1.2, u) + (rnd(i + 1) - 0.5) * 0.3, lerp(1.3, 2.17, u) + 1.2 * 4 * u * (1 - u), lerp(0.2, 2.35, u)]} c="#8a6038" cast={false} ws={6} hs={4} />; }) : null}
      {!b && wn(t, XT.spl + 0.28, T.detiene + 0.7, 0.1) > 0 ? <Sph rad={0.3} p={[-1.2, 2.15, 2.4]} sc={[1, 0.8, 0.35]} c="#8a6038" cast={false} ws={10} hs={6} /> : null}
      {/* ondas na superfície até a água parar */}
      {lvl > 0.3 && calm < 0.99 ? [0, 1].map((j) => <Box key={j} s={[2.6, 0.04, 0.12]} p={[0.2 * Math.sin(t * 5 + j), top + 0.02, -0.4 + j * 0.8 + 0.15 * Math.sin(t * 4 + j)]} c="#e8dcc0" o={{ opacity: 0.7 * (1 - calm), depthWrite: false }} cast={false} />) : null}
      {/* entra turva pela calha da esquerda */}
      {inflow ? Array.from({ length: 5 }, (_, i) => { const u = fract(t * 1.6 + i / 5); return <Sph key={i} rad={0.13} p={[-1.75 + u * 0.7, 1.45 - u * u * 0.5, 0.15]} c="#a8804e" cast={false} ws={6} hs={4} />; }) : null}
      {/* sai limpa por cima, pela borda baixa da direita */}
      {clear > 0.3 && quakeDry < 0.5 ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.3 + i / 6); return <Sph key={i} rad={0.13} p={[1.5 + u * 0.4, top + 0.05 - u * u * 0.15, -0.3 + 0.12 * i]} c="#6fc4ff" o={{ emissive: "#3fa0ff", ei: 0.6 }} cast={false} ws={6} hs={4} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- cisternas: cavadas, enchem com a chuva, tampadas na sombra, usadas no verão
const CX = [-4.2, 0, 4.2]; // + 2 = centros em -2,2 · 2 · 6,2
const MOUTHS: V3[] = Array.from({ length: 30 }, (_, i) => [lerp(-2.7, 8.7, ((i % 10) + 0.5 + (rnd(i + 11) - 0.5) * 0.6) / 10), lerp(7.0, 13.2, (Math.floor(i / 10) + 0.5 + (rnd(i + 21) - 0.5) * 0.5) / 3), 6.95]);
const Cisterns: React.FC<{ t: number }> = ({ t }) => {
  const b = built(t); if (t < T.p4 && !b) return null;
  const dig = b ? 1 : ease(t, T.cisternas - 0.2, T.cavadas + 0.5);
  // ritmo 13/11: a da direita o operário já cava desde o ⏪ (a parede do «sin tanques» não fica vazia); ela enche demais e
  // transborda nele no «y la guardan» (gag) até a tampa fechar
  const digR = b ? 1 : ease(t, T.b4 + 0.35, T.cavadas + 0.2), over = b ? 0 : wn(t, T.guardan - 0.05, T.sombra + 0.15, 0.12);
  const fill = b ? 0.8 : ease(t, T.recogen - 0.1, T.guardan + 0.3) * 0.9 * (1 - 0.85 * ease(t, T.rompio + 0.1, T.suagua + 0.4));
  const lid = b ? 1 : ease(t, T.guardan + 0.15, T.sombra + 0.2) * (1 - ease(t, T.rompio, T.rompio + 0.4)), used = ease(t, T.paraVerano, T.paraVerano + 0.7);
  return (
    <G p={[0, 0, 6.93]}>
      {CX.map((x, i) => {
        const di = i === 2 ? digR : dig, h = 4.4 * di, f = Math.max(0, fill + (i === 2 && !b ? 0.1 * ease(t, T.recogen, T.guardan) - 0.32 * used : 0)), crack = t > T.rompio + 0.05 && t < T.suagua + 2;
        return (
          <G key={i} p={[x + 2, 0, 0]}>
            {h > 0.02 ? <Box s={[2.8, h, 0.1]} p={[0, 1.0 + h / 2, 0]} c="#2a1a14" cast={false} /> : null}
            <Box s={[0.7, 1.2 * Math.min(1, di * 3), 0.1]} p={[0, 6.0, 0]} c="#2a1a14" cast={false} vis={di > 0.01} />
            {i === 2 && over > 0 ? <G><Box s={[0.55, 6.4, 0.14]} p={[0.45, 3.2, -0.6]} c="#e8f6ff" o={{ emissive: "#9fd4ff", ei: 0.5, opacity: 0.85 * over, depthWrite: false }} cast={false} /><Puffs t={t} p={[0.6, 0.2, -0.9]} n={8} period={0.5} rise={1.6} size={0.55} c="#e8f6ff" on={over} drift={[0, 0, -0.5]} /></G> : null}
            {i === 2 ? <Puffs t={t} p={[1.5, 1.6 + 3.4 * di, -0.4]} n={6} period={0.6} rise={1.2} size={0.4} c="#f0c8a0" on={di > 0.02 && di < 0.98 ? 1 : 0} drift={[0.6, 0, -0.4]} /> : null}
            {f > 0.01 ? <Box s={[2.6, 4.2 * f, 0.12]} p={[0, 1.1 + 2.1 * f, -0.03]} c={lid > 0.5 ? "#2f7ab8" : WATER} o={{ emissive: "#1f6fb0", ei: lid > 0.5 ? 0.15 : 0.35 }} cast={false} /> : null}
            {/* tampa de pedra: guarda a água na sombra */}
            {lid > 0.01 ? <Box s={[1.3, 1.6, 0.2]} p={[1.6 * (1 - lid), 6.0, -0.1]} c="#b8aa98" cast={false} /> : null}
            {/* terremoto: racha e a água jorra para fora */}
            {crack ? <G>{[[0.3, 4.2, 0.5], [-0.1, 3.0, -0.6], [0.4, 1.9, 0.4], [-0.5, 4.6, -0.3]].map(([cx, cy, r], j) => <Box key={j} s={[0.18, 1.5, 0.16]} p={[cx, cy, -0.1]} r={[0, 0, r]} c="#fff0c8" o={{ emissive: "#ffcf80", ei: 0.6 }} cast={false} />)}<Box s={[0.4, 2.0, 0.4]} p={[0.5, 1.0, -0.5]} c="#e8f6ff" o={{ emissive: "#9fd4ff", ei: 0.5, opacity: 0.9, depthWrite: false }} cast={false} /><Puffs t={t} p={[0.5, 0.2, -0.9]} n={5} period={0.6} rise={1.2} size={0.6} c="#e8f6ff" on={1} drift={[0, 0, -0.6]} /></G> : null}
          </G>
        );
      })}
      {/* «cientos»: bocas de cisterna aparecendo nas paredes em volta */}
      {dig > 0.01 ? MOUTHS.map((q, i) => { const s = clamp(dig * 1.6 - rnd(i + 70) * 0.6); return s > 0.01 ? <Box key={"m" + i} s={[0.55 * s, 0.8 * s, 0.06]} p={[q[0], q[1], q[2] - 6.93]} c="#2a1a14" cast={false} /> : null; }) : null}
      <Puffs t={t} p={[2, 4, -0.6]} n={8} period={0.8} rise={2} size={0.8} c="#f0c8a0" on={dig > 0.02 && dig < 0.98 ? 1 : 0} drift={[0.5, 0, -0.5]} />
    </G>
  );
};

// ---------------------------------------------------------------- o Tesouro: esculpido de cima para baixo; a rocha ainda não cortada serve de piso
const FX = 16;
const PED = (() => { const s = new THREE.Shape(); s.moveTo(-4.4, 0); s.lineTo(4.4, 0); s.lineTo(0, 2.2); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: false }); })();
/** altura do corte: desce aos degraus, cada degrau numa palavra (de arriba hacia abajo → la roca… piso → van bajando → el Tesoro) */
export const cutY = (t: number) => (built(t) ? 0 : keysAt(t, [[T.tallar, 22], [T.arriba + 0.66, 15.8], [T.roca + 0.2, 12.9], [T.piso + 0.3, 10.9], [T.bajando + 0.45, 7.4], [T.tesoro, 3.0], [T.cuarenta, 0]]));
const Treasury: React.FC<{ t: number }> = ({ t }) => {
  const cy = cutY(t), vis = (y0: number) => y0 >= cy - 0.05;
  const COL = "#d98a6a", COL2 = "#c87a5c";
  const cols = [-5, -3, -1, 1, 3, 5];
  const carvers = [-2.6, 0.4, 3.2].map((z, i) => ({ p: [13.3, cy, z] as V3, yaw: PI / 2, pose: "chisel" as PoseName, ph: i * 0.3 }));
  const floorHi = wn(t, T.roca - 0.1, T.bajando + 0.6, 0.25), arrow = wn(t, T.arriba - 0.15, T.bajando + 0.6, 0.25);
  const fall = ease(t, T.suelo + 0.05, T.suelo + 0.55);
  return (
    <G>
      {/* nível de baixo */}
      <Box s={[1.2, 1, 13]} p={[FX - 0.6, 0.5, 0]} c={COL2} vis={vis(0)} />
      {cols.map((z) => <Cyl key={z} rt={0.42} h={7} p={[FX - 1.0, 4.5, z]} c={COL} seg={10} vis={vis(1)} />)}
      <Box s={[1.6, 1.0, 13]} p={[FX - 0.9, 8.5, 0]} c={COL} vis={vis(8)} />
      <G p={[FX - 0.2, 9.0, 0]} r={[0, -PI / 2, 0]} vis={vis(9)}><mesh geometry={PED} material={mat(COL2)} castShadow /></G>
      <Box s={[1.4, 1.0, 1.6]} p={[FX - 0.9, 0.5, 0]} c="#3a2018" vis={vis(0)} />
      <Box s={[0.4, 5.6, 2.2]} p={[FX - 0.2, 3.8, 0]} c="#3a2018" cast={false} vis={vis(1)} />
      {/* nível de cima: tholos central e pavilhões */}
      <Cyl rt={1.8} h={5} p={[FX - 1.6, 13.5, 0]} c={COL} seg={14} vis={vis(11)} />
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * PI + PI / 2; return <Cyl key={i} rt={0.22} h={5} p={[FX - 1.6 + Math.sin(a) * 1.9, 13.5, Math.cos(a) * 1.9]} c={COL2} seg={8} vis={vis(11)} />; })}
      <Cone rad={2.1} h={1.8} seg={14} p={[FX - 1.6, 16.9, 0]} c={COL2} vis={vis(16)} /><Sph rad={0.55} p={[FX - 1.6, 18.2, 0]} c={COL} vis={vis(17.6)} />
      {[-1, 1].map((s) => <G key={s}>
        <Box s={[1.4, 5, 2.4]} p={[FX - 0.9, 13.5, s * 4.6]} c={COL} vis={vis(11)} />
        <Cyl rt={0.3} h={5} p={[FX - 1.7, 13.5, s * 3.6]} c={COL2} seg={8} vis={vis(11)} /><Cyl rt={0.3} h={5} p={[FX - 1.7, 13.5, s * 5.6]} c={COL2} seg={8} vis={vis(11)} />
        <Cone rad={1.7} h={1.2} seg={4} p={[FX - 0.9, 16.6, s * 4.6]} r={[0, PI / 4, 0]} c={COL2} vis={vis(16)} />
      </G>)}
      <Box s={[1.6, 0.8, 13]} p={[FX - 0.9, 10.6, 0]} c={COL2} vis={vis(10)} />
      {/* rocha ainda não cortada: um bloco saliente que desce, com os entalhadores em cima */}
      {cy > 0.05 ? <Rock s={[4.2, cy, 13.6]} p={[FX - 2.1, cy / 2, 0]} c={R1} n={Math.max(1, Math.round(cy / 3))} /> : null}
      {/* «sirve de piso»: a borda de cima do bloco acende sob os pés dos canteros */}
      {floorHi > 0 && cy > 0.3 ? <G>{[[FX - 2.1, -6.8, 4.3, 0.14], [FX - 2.1, 6.8, 4.3, 0.14]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.14, d]} p={[x, cy + 0.08, z]} c="#ffd400" o={{ emissive: "#ffb000", ei: 1.1 * floorHi }} cast={false} />)}<Box s={[0.14, 0.14, 13.7]} p={[FX - 4.2, cy + 0.08, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 1.1 * floorHi }} cast={false} /></G> : null}
      {/* seta ↓: o corte vai de cima para baixo */}
      {arrow > 0 && cy > 0.5 ? <G p={[FX - 4.8, cy + 1.6 - 0.6 * fract(t * 1.2), -3.8]} sc={arrow}><Box s={[0.4, 1.8, 0.4]} p={[0, 0.9, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /><Cone rad={0.75} h={1.0} seg={4} p={[0, -0.4, 0]} r={[PI, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /></G> : null}
      <Crowd list={carvers} t={t} c={COSTUMES.nabateo} vis={t > T.b5 + 0.1 && t < CUTS[6]} />
      {/* ritmo 13/11: lascas a cada golpe do cinzel (ritmo do braço: ~0,52 s) — a fileira de canteiros não fica parada */}
      {t > T.b5 + 0.1 && t < CUTS[6] ? [...carvers.map((c) => c.p), [12.4, cy, -4.8] as V3].map((q, i) => <Puffs key={"ch" + i} t={t + i * 0.17} p={[q[0] + 0.7, q[1] + 0.15, q[2]]} n={5} period={0.52} rise={1.0} size={0.3} c="#f0c8a0" drift={[0.9, 0, 0.3]} />) : null}
      {/* escada curta demais (o problema): o operário sobe, não alcança, e ela cai no «desde el suelo» */}
      {t > T.p5 && t < T.tallar ? <G p={[FX - 4.6, 0, 3]} r={[0, 0, lerp(-0.18, 1.25, fall)]}><Box s={[0.15, 5, 0.15]} p={[0, 2.5, -0.5]} c="#7a4a2a" /><Box s={[0.15, 5, 0.15]} p={[0, 2.5, 0.5]} c="#7a4a2a" />{[0.6, 1.4, 2.2, 3.0, 3.8, 4.6].map((y) => <Box key={y} s={[0.12, 0.12, 1.0]} p={[0, y, 0]} c="#7a4a2a" />)}</G> : null}
    </G>
  );
};
/** camelo de brinquedo (frente = +x local) */
const Camel: React.FC<{ p: V3; yaw: number; t: number; load?: string; run?: number }> = ({ p, yaw, t, load = "#2f6fb0", run = 1 }) => {
  const g = Math.sin(t * 6 * run);
  return (
    <G p={p} r={[0, yaw, 0]}>
      <Box s={[1.9, 0.9, 0.75]} p={[0, 2.0, 0]} c="#c9a06a" /><Sph rad={0.55} p={[-0.1, 2.55, 0]} sc={[1.2, 0.9, 1]} c="#c9a06a" />
      <Box s={[0.35, 1.3, 0.35]} p={[1.15, 2.7, 0]} r={[0, 0, -0.35]} c="#c9a06a" /><Box s={[0.75, 0.38, 0.36]} p={[1.5, 3.35, 0]} c="#c9a06a" />
      {[[0.7, 0.25], [0.7, -0.25], [-0.7, 0.25], [-0.7, -0.25]].map(([x, z], i) => <G key={i} p={[x, 1.6, z]} r={[0, 0, (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1) * 0.35 * g]}><Box s={[0.18, 1.6, 0.18]} p={[0, -0.8, 0]} c="#b8905a" /></G>)}
      <Box s={[0.9, 0.6, 1.3]} p={[-0.2, 2.75, 0]} c={load} /><Box s={[0.5, 0.5, 1.5]} p={[0.5, 2.5, 0]} c="#e8d27a" />
    </G>
  );
};
const LOADS = ["#2f6fb0", "#c8553d", "#3f8f3a", "#7a3fc0"];
const Caravan: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  if (t > T.petra && t < CUTS[0]) { const u = clamp((t - T.petra) / 5); for (let i = 0; i < 4; i++) out.push(<Camel key={"a" + i} p={[lerp(14, -2, u) + i * 2.8, 0, 3 + (i % 2) * 0.8]} yaw={PI} t={t + i * 0.4} load={LOADS[i]} />); }
  // a rota do incienso entra no Siq; na chuva os camelos apertam o passo e saem antes da riada
  if (t > CUTS[0] - 0.3 && t < T.arrasa + 1) for (let i = 0; i < 3; i++) { const x = -47 - 3 * i + 3.0 * (t - CUTS[0]) + 9 * Math.max(0, t - T.p1 - 0.1) ** 1.2; if (x < -22) out.push(<Camel key={"s" + i} p={[x, 0, 1.35]} yaw={0} t={t + i * 0.4} load={LOADS[i]} run={t > T.p1 ? 1.8 : 1} />); }
  if (built(t)) for (let i = 0; i < 3; i++) out.push(<Camel key={"b" + i} p={[6 + i * 2.8, 0, -4]} yaw={PI} t={t + i * 0.4} />);
  // gancho: um camelo a trote logo atrás do operário que foge
  if (built(t)) out.push(<Camel key="h" p={[runX(t) - 3.1, 0, 0.7]} yaw={0} t={t} load={LOADS[1]} run={2.2} />);
  // o comércio vai para outras rutas: a caravana sai da praça pelo Siq
  if (t > T.comercio - 0.3) { const u = clamp((t - T.comercio + 0.3) / 4); for (let i = 0; i < 4; i++) out.push(<Camel key={"c" + i} p={[lerp(4, -20, u) - i * 2.8, 0, i % 2 ? -1.1 : -1.6]} yaw={PI} t={t + i * 0.4} load={LOADS[i]} />); }
  return <G>{out}</G>;
};
/** gente na praça no fim: vai saindo pelo Siq, um por um (la ciudad se fue vaciando); a areia cobre a praça */
const PlazaPeople: React.FC<{ t: number }> = ({ t }) => {
  // no gancho a praça está cheia (as «veinte mil personas»), andando; quem está no caminho do operário e do camelo se assusta
  if (built(t)) {
    const rx = runX(t);
    return <Crowd t={t} c={COSTUMES.nabateo} list={Array.from({ length: 14 }, (_, i) => {
      const sg = i % 2 ? 1 : -1, a = t * 0.5 * sg + i * 1.7, x = lerp(3, 14, rnd(i + 130)) + 1.1 * Math.cos(a), z = lerp(-6.5, 5.5, rnd(i + 140)) + 1.1 * Math.sin(a), near = Math.abs(x - rx) < 3.2 && Math.abs(z) < 3;
      return { p: [x, 0, z] as V3, yaw: near ? -PI / 2 : sg > 0 ? -a : PI + a, pose: (near ? "alarm" : "walk") as PoseName, ph: i * 0.37 };
    })} />;
  }
  if (t < CUTS[6] - 0.2) return null;
  const list = Array.from({ length: 9 }, (_, i) => {
    const x0 = lerp(10.5, 14, rnd(i + 90)), z0 = lerp(-6, 5.5, rnd(i + 95)), go = T.vaciando - 0.5 + i * 0.22, w = Math.max(0, t - go);
    return { p: [x0 - 4.2 * w, 0, lerp(z0, -0.5, clamp(w / 2))] as V3, yaw: w > 0 ? -PI / 2 : rnd(i) * 6, pose: (w > 0 ? "walk" : t > T.terremoto && t < T.suagua ? "alarm" : "idle") as PoseName, ph: i * 0.3 };
  }).filter((q) => q.p[0] > -2);
  const sandK = ease(t, T.siglo - 0.4, T.mandaselo + 1.0);
  return (
    <G>
      <Crowd list={list} t={t} c={COSTUMES.nabateo} />
      {sandK > 0.01 ? Array.from({ length: 8 }, (_, i) => <Sph key={i} rad={2.2 + rnd(i + 120)} p={[lerp(1, 12, rnd(i + 100)), 0, lerp(-8, 5, rnd(i + 110))]} sc={[1.5, 0.32 * sandK, 1.1]} c="#efcc94" cast={false} ws={10} hs={6} />) : null}
    </G>
  );
};
/** cidade ao sul: casas, teatro, gente que some no fim */
const City: React.FC<{ t: number }> = ({ t }) => {
  const hs = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: lerp(-6, 40, rnd(i * 3 + 1)), z: lerp(20, 50, rnd(i * 3 + 2)), w: lerp(2.6, 4.4, rnd(i + 5)), h: lerp(2, 4, rnd(i + 8)) })), []);
  const empty = ease(t, T.vaciando - 0.5, T.siglo + 0.6), sandK = ease(t, T.vaciando, T.mandaselo);
  const people = Array.from({ length: 10 }, (_, i) => ({ p: [lerp(0, 30, rnd(i + 40)), 0, lerp(16, 34, rnd(i + 50))] as V3, yaw: rnd(i) * 6, pose: (i % 3 ? "walk" : "idle") as PoseName, ph: i * 0.3 }));
  return (
    <G>
      {hs.map((q, i) => <G key={i} p={[q.x, 0, q.z]}><Box s={[q.w, q.h, q.w * 0.9]} p={[0, q.h / 2, 0]} c={i % 3 ? "#d9a57e" : "#e2b894"} /><Box s={[q.w * 0.3, 1.0, 0.1]} p={[0, 0.5, q.w * 0.45 + 0.02]} c="#4a2a1a" cast={false} /></G>)}
      <G p={[22, 0, 44]}>{[0, 1, 2, 3, 4].map((i) => <Cyl key={i} rt={9 - i * 1.3} h={0.8} p={[0, 0.4 + i * 0.8, 0]} ts={PI * 0.5} tl={PI} c={i % 2 ? R3 : R1} seg={20} />)}</G>
      <Crowd list={people} t={t} c={COSTUMES.nabateo} scale={1 - empty * 0.999} vis={empty < 0.99} />
      {sandK > 0.01 ? Array.from({ length: 10 }, (_, i) => <Sph key={i} rad={4} p={[lerp(-4, 30, rnd(i + 70)), 0, lerp(-4, 30, rnd(i + 80))]} sc={[1.6, 0.35 * sandK, 1.2]} c={SAND} cast={false} ws={10} hs={6} />) : null}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  // tremor suave: tremor forte num close a régua lê como corte (lote 2)
  const q = quake(t), sh: V3 = [q * 0.09 * Math.sin(t * 23), 0, q * 0.07 * Math.sin(t * 19)];
  return (
    <>
      <Sky top="#3a8ee0" mid="#9cd0f2" low="#f6eedc" />
      <Clouds t={t} n={5} y={40} />
      <Ground />
      <G p={sh}>
        <Cliffs /><Massif t={t} /><Dam t={t} /><Channels t={t} /><Basin t={t} /><Cisterns t={t} /><Treasury t={t} />
      </G>
      <Floods t={t} /><Caravan t={t} /><PlazaPeople t={t} /><City t={t} />
      <Rain t={t} a={T.p1 + 0.05} b={T.arrasa + 1.0} x={[-54, -26]} z={[-2.4, 12]} top={14} n={46} seed={3} />
      <Rain t={t} a={T.recogen - 0.4} b={T.guardan + 0.25} x={[3.2, 9.2]} z={[2.0, 6.6]} top={9} n={40} seed={7} />
    </>
  );
};
