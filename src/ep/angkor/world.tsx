// Mundo do E15: Angkor Wat de brinquedo. Templo-montanha de 3 terraços com 5 torres em botão de lótus (centro em 0,0; a entrada
// olha para +z), muro de laterita (meia-largura 24), fosso (anel de 25 a 34) com a calçada em +z, chão de areia. Ao norte (−z) o
// canal até a pedreira no pé do monte Kulen (z ≈ −240), e um rio a leste. Dioramas fora do templo, cada um com seus planos:
// SEC (corte da areia sob uma torre, com o fosso à esquerda), LAT (barranco de laterita), CORE (terraço em corte: núcleo de laterita
// + pele de arenisca), WALL (o muro de hoje com os buracos). O bloco com buracos sobe no próprio templo (terraço 3, torre central).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, MatOpts, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Palms, Puffs, Sky, Trees } from "../../toy/scenery";
import { Costume, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { FILL0, FILL1, LIFT0, LIFT1, SINK0, SINK1, T, XC } from "./cues";
import { OPEN } from "./open";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, X12, X13] = XC;

// ---------------------------------------------------------------- medidas
export const A1 = 13, A2 = 9, A3 = 5.5, H1 = 3.0, H2 = 6.0, H3 = 9.2, TW = 3.8, TH = 10, CW = 2.2, CH = 6.5, CX = 4.0;
export const WALLA = 24, MO_IN = 25, MO_OUT = 34, WL = -0.35, MB = -1.6, MC = (MO_IN + MO_OUT) / 2;
const NEW = { s1: "#dcc48e", s2: "#c7ad78", s3: "#ead9ab", dk: "#5e4a30" };
const OLD = { s1: "#aaa48c", s2: "#948f79", s3: "#bdb8a0", dk: "#3c3a30" };
const LAT_W = "#9a4a32", LAT_W2 = "#86402a", WATER = "#3d9bd4", EARTH = "#b39566", EARTH2 = "#a0845a", SANDG = "#dcc792";
const WOOD = "#9a6a3a", WOOD2 = "#7f5530", ROPE = "#c9a466";
const GHOST: MatOpts = { opacity: 0.4, depthWrite: false, emissive: "#ffd400", ei: 0.55 };
export type Pal = { s1: string; s2: string; s3: string; dk: string; o?: MatOpts };
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** mistura de cores quantizada (8 degraus: o cache de materiais não cresce a cada quadro) */
export const mix = (a: string, b: string, u: number) => { const q = Math.round(clamp(u) * 8) / 8, A = hx(a), B = hx(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], q)).toString(16).padStart(2, "0")).join(""); };
const palAge = (u: number): Pal => ({ s1: mix(NEW.s1, OLD.s1, u), s2: mix(NEW.s2, OLD.s2, u), s3: mix(NEW.s3, OLD.s3, u), dk: mix(NEW.dk, OLD.dk, u) });
const GHOST_PAL: Pal = { s1: "#ffe37a", s2: "#ffe37a", s3: "#ffe37a", dk: "#ffd400", o: GHOST };
const SANDC: Pal = { s1: "#ecd59e", s2: "#dcc084", s3: "#f4e4b6", dk: "#b8975e" };

// roupas: khmer (sampot, tronco nu), monge (açafrão), rei (ouro)
export const KHMER: Costume = { skin: "#b9784b", top: "#b9784b", bottom: "#b9784b", kilt: "#2f7f9a", kiltLen: 0.5, hat: "none", hatC: "#000", boot: "#8a5634", belt: "#d4a64a", sleeves: false };
const KH2: Costume = { ...KHMER, skin: "#a86c42", top: "#a86c42", bottom: "#a86c42", kilt: "#7a4a8a", belt: "#e0c070" };
const KH3: Costume = { ...KHMER, skin: "#c08454", top: "#c08454", bottom: "#c08454", kilt: "#a8562a", belt: "#2f6fb0" };
const MONK: Costume = { skin: "#c08858", top: "#f08a1c", bottom: "#f08a1c", kilt: "#f08a1c", kiltLen: 0.85, hat: "none", hatC: "#000", boot: "#9a6440", belt: "#e07a10", sleeves: true };
const KING: Costume = { skin: "#c08858", top: "#d4a64a", bottom: "#8a2a6a", kilt: "#8a2a6a", kiltLen: 0.7, hat: "none", hatC: "#000", boot: "#d4a64a", belt: "#ffd400", sleeves: false };

// ---------------------------------------------------------------- fases do templo
export type Build = { b1: number; b2: number; b3: number; bc: number; bt: number; wall: number };
export const FULL: Build = { b1: 1, b2: 1, b3: 1, bc: 1, bt: 1, wall: 1 };
const ZERO: Build = { b1: 0, b2: 0, b3: 0, bc: 0, bt: 0, wall: 0 };
/** ⏪ «Camboya, hace casi 900 años»: o templo pronto se desmonta de cima para baixo */
const decon = (t: number) => ease(t, X2 + 0.15, X2 + 1.05);
export const buildAt = (t: number): Build => {
  if (t < X2 + 0.15) {
    if (OPEN === "a" && t < X1) return { b1: ease(t, -0.35, 0.5), b2: ease(t, 0.3, 0.9), b3: ease(t, 0.7, 1.25), bc: ease(t, 1.05, 1.7), bt: ease(t, 1.25, 2.0), wall: ease(t, -0.3, 0.6) };
    return FULL;
  }
  if (t < C1) {
    const u = decon(t), d = (a: number, b: number) => 1 - ease(u, a, b);
    return { bt: d(0, 0.3), bc: d(0, 0.3), b3: d(0.25, 0.5), b2: d(0.45, 0.7), b1: d(0.65, 0.95), wall: d(0.5, 0.8) };
  }
  if (t < C2) return { ...ZERO, b1: 0.2 };
  if (t < X6) return { ...ZERO, b1: 0.55 };
  if (t < C5) return { ...ZERO, b1: 1, b2: 1, b3: 0.45, wall: 1 };
  if (t < C6) return { b1: 1, b2: 1, b3: 1, bc: 0.35, bt: 0.15, wall: 1 };
  if (t < C7) return { b1: 1, b2: 1, b3: 1, bc: 0.35, bt: 0.6, wall: 1 };
  return FULL;
};
/** idade da pedra: 1 = hoje (cinza), 0 = recém-talhada (dourada) */
export const ageAt = (t: number) => {
  if (t < X2 + 0.15) return 1;
  if (t < C7) return 1 - ease(t, X2 + 0.15, X2 + 1.0);
  if (t >= X12 && t < X13) return lerp(0.4, 1, ease(t, T.siglo - 0.4, X13 - 0.1));
  return 1;
};
/** o fosso: cheio no gancho, escoa no ⏪, tampado (ainda não cavado) na obra, enche no «un foso» (a partir da bacia do canal) */
const moatAt = (t: number): { covered: boolean; level: number; fill: number } => {
  if (t < X2 + 0.3) return { covered: false, level: WL, fill: 1 };
  if (t < C1) return { covered: false, level: lerp(WL, MB - 0.1, ease(t, X2 + 0.3, X2 + 1.1)), fill: 1 };
  if (t < X6) return { covered: true, level: MB, fill: 0 };
  return { covered: false, level: WL, fill: ease(t, FILL0, FILL1) };
};
/** a selva cresce no «siglo tras siglo» */
export const jungle = (t: number) => (t < X12 ? 0 : ease(t, T.siglo - 0.5, X13 - 0.15));

// ---------------------------------------------------------------- utilitários
const rotY = (x: number, z: number, a: number): [number, number] => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
type IB = { p: V3; s: V3; ry?: number };
const instBoxes = (list: IB[]) => {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat("#000000"), Math.max(1, list.length)), d = new THREE.Object3D();
  list.forEach((b, i) => { d.position.set(...b.p); d.scale.set(...b.s); d.rotation.set(0, b.ry ?? 0, 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.count = list.length; im.receiveShadow = true; return im;
};
const ring4 = (a: number, items: { u: number; y: number; s: V3; out?: number }[]): IB[] => {
  const L: IB[] = [];
  for (const yaw of [0, PI / 2, PI, -PI / 2]) for (const it of items) { const [x, z] = rotY(it.u, a + (it.out ?? 0.03), yaw); L.push({ p: [x, it.y, z], s: it.s, ry: yaw }); }
  return L;
};
const shapeSq = (h: number) => { const s = new THREE.Shape(); s.moveTo(-h, -h); s.lineTo(h, -h); s.lineTo(h, h); s.lineTo(-h, h); s.closePath(); return s; };
const pathSq = (h: number) => { const p = new THREE.Path(); p.moveTo(-h, -h); p.lineTo(-h, h); p.lineTo(h, h); p.lineTo(h, -h); p.closePath(); return p; };
const ringGeo = (outer: number, inner: number) => { const s = shapeSq(outer); s.holes.push(pathSq(inner)); return new THREE.ShapeGeometry(s); };
const win01 = (t: number, a: number, b: number, f = 0.2) => clamp(Math.min((t - a) / f, (b - t) / f));
const pulse = (t: number, a: number, b: number) => (t < a || t > b ? 0 : 0.5 + 0.5 * Math.sin((t - a) * 11));

// ---------------------------------------------------------------- o templo
/** torre em botão de lótus: base, cornija, 5 anéis octogonais que afinam e o botão; g = fração construída (de baixo para cima) */
const Prang: React.FC<{ w: number; h: number; pal: Pal; g?: number }> = ({ w, h, pal, g = 1 }) => {
  const o = pal.o, cast = !o, top = g * h, out: React.ReactNode[] = [];
  if (top > 0.01) { const bh = Math.min(0.2 * h, top); out.push(<Box key="b" s={[w, bh, w]} p={[0, bh / 2, 0]} c={pal.s1} o={o} cast={cast} />); }
  if (top >= 0.24 * h) out.push(<Box key="c" s={[w * 1.1, 0.04 * h, w * 1.1]} p={[0, 0.22 * h, 0]} c={pal.s2} o={o} cast={cast} />);
  for (let k = 0; k < 5; k++) {
    const y0 = 0.24 * h + k * 0.1 * h; if (top < y0 + 0.1 * h - 1e-3) break;
    out.push(<Cyl key={k} rt={0.5 * w * (0.84 - 0.1 * k)} rb={0.5 * w * (0.95 - 0.1 * k)} h={0.1 * h} seg={8} p={[0, y0 + 0.05 * h, 0]} c={k % 2 ? pal.s2 : pal.s3} o={o} cast={cast} />);
  }
  if (g >= 0.999) out.push(<Sph key="bud" rad={0.21 * w} sc={[1, 1.7, 1]} p={[0, 0.8 * h, 0]} c={pal.s1} o={o} cast={cast} ws={8} hs={6} />, <Cone key="tip" rad={0.07 * w} h={0.12 * h} seg={8} p={[0, 0.96 * h, 0]} c={pal.s2} o={o} cast={cast} />);
  return <G>{out}</G>;
};
/** um terraço: bloco, rodapé, cornija, galeria (janelas + fiadas) e escadas nos 4 lados; b = fração construída */
const Tier: React.FC<{ a: number; y0: number; y1: number; b: number; pal: Pal }> = ({ a, y0, y1, b, pal }) => {
  const r = y1 - y0, o = pal.o, cast = !o;
  const win = useMemo(() => {
    const it: { u: number; y: number; s: V3 }[] = [];
    for (let u = -a + 0.9; u <= a - 0.9; u += 1.55) if (Math.abs(u) > 1.7) it.push({ u, y: y0 + r * 0.55, s: [0.5, r * 0.4, 0.06] });
    it.push({ u: 0, y: y0 + r * 0.27, s: [2 * a, 0.05, 0.05] }, { u: 0, y: y0 + r * 0.83, s: [2 * a, 0.05, 0.05] });
    const im = instBoxes(ring4(a, it)); im.castShadow = false; return im;
  }, [a, y0, y1]);
  const st = useMemo(() => {
    const L: IB[] = [];
    for (const yaw of [0, PI / 2, PI, -PI / 2]) for (let k = 0; k < 5; k++) {
      const dz = (r * (5 - k)) / 5, [x, z] = rotY(0, a + dz / 2, yaw);
      L.push({ p: [x, y0 + ((k + 0.5) * r) / 5, z], s: [2.6, r / 5, dz], ry: yaw });
    }
    return instBoxes(L);
  }, [a, y0, y1]);
  if (b <= 0.001) return null;
  win.material = mat(pal.dk, o); st.material = mat(pal.s2, o); st.castShadow = cast;
  const hh = r * b;
  return (
    <G>
      <Box s={[2 * a, hh, 2 * a]} p={[0, y0 + hh / 2, 0]} c={pal.s1} o={o} cast={cast} />
      {b >= 0.999 ? <>
        <Box s={[2 * a + 0.5, 0.3, 2 * a + 0.5]} p={[0, y0 + 0.15, 0]} c={pal.s2} o={o} cast={cast} />
        <Box s={[2 * a + 0.36, 0.32, 2 * a + 0.36]} p={[0, y1 - 0.16, 0]} c={pal.s3} o={o} cast={cast} />
        <primitive object={win} /><primitive object={st} />
      </> : null}
    </G>
  );
};
export const Temple: React.FC<{ b: Build; pal: Pal }> = ({ b, pal }) => (
  <G>
    <Tier a={A1} y0={0} y1={H1} b={b.b1} pal={pal} />
    {b.b1 >= 0.999 ? <Tier a={A2} y0={H1} y1={H2} b={b.b2} pal={pal} /> : null}
    {b.b1 >= 0.999 && b.b2 >= 0.999 ? <Tier a={A3} y0={H2} y1={H3} b={b.b3} pal={pal} /> : null}
    {b.b3 >= 0.999 ? <>
      <G p={[0, H3, 0]}><Prang w={TW} h={TH} pal={pal} g={b.bt} /></G>
      {[[CX, CX], [-CX, CX], [CX, -CX], [-CX, -CX]].map(([x, z], i) => <G key={i} p={[x, H3, z]}><Prang w={CW} h={CH} pal={pal} g={b.bc} /></G>)}
    </> : null}
  </G>
);
/** muro de laterita com a entrada (gopura) em +z */
const Enclosure: React.FC<{ g: number; pal: Pal }> = ({ g, pal }) => {
  if (g <= 0.001) return null;
  const h = 1.7 * g, th = 0.8, a = WALLA, gap = 3.7;
  return (
    <G>
      <Box s={[2 * a + th, h, th]} p={[0, h / 2, -a]} c={LAT_W} />
      <Box s={[th, h, 2 * a]} p={[-a, h / 2, 0]} c={LAT_W2} /><Box s={[th, h, 2 * a]} p={[a, h / 2, 0]} c={LAT_W2} />
      <Box s={[a - gap + th / 2, h, th]} p={[-(a + gap) / 2, h / 2, a]} c={LAT_W} /><Box s={[a - gap + th / 2, h, th]} p={[(a + gap) / 2, h / 2, a]} c={LAT_W} />
      {g >= 0.999 ? <G p={[0, 0, a]}>
        <Box s={[7.4, 2.8, 2.6]} p={[0, 1.4, 0]} c={pal.s1} />
        <Box s={[1.3, 2.0, 2.7]} p={[0, 1.0, 0]} c={pal.dk} cast={false} />
        <Box s={[6.6, 0.45, 2.3]} p={[0, 3.0, 0]} c={pal.s3} />
        <G p={[0, 3.2, 0]}><Prang w={1.9} h={3.6} pal={pal} /></G>
      </G> : null}
    </G>
  );
};
/** calçada sobre o fosso, com as balaustradas de naga */
const Causeway: React.FC<{ pal: Pal }> = ({ pal }) => (
  <G>
    <Box s={[3.6, 2.0, 10.0]} p={[0, -0.6, MC + 0.3]} c={pal.s2} />
    {[-1.7, 1.7].map((x) => <G key={x}>
      <Box s={[0.3, 0.42, 10.0]} p={[x, 0.6, MC + 0.3]} c={pal.s1} />
      <Cone rad={0.55} h={0.9} seg={5} p={[x, 0.85, MO_OUT + 0.4]} r={[0.3, 0, 0]} c={pal.s3} />
    </G>)}
    <Box s={[3.0, 0.3, 10.5]} p={[0, 0.15, 18.8]} c={pal.s2} />
  </G>
);

// ---------------------------------------------------------------- chão, fosso, canal, rio, Kulen
const CANAL: [number, number][] = [[-12, -106], [-44, -46], [-44, -25]];
const CSEG = CANAL.slice(1).map((b, i) => { const a = CANAL[i], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); return { a, dx: dx / len, dz: dz / len, len, yaw: Math.atan2(dx, dz) }; });
export const CANAL_LEN = CSEG.reduce((s, g) => s + g.len, 0);
/** ponto do canal a s unidades da pedreira (a bacia fica em s = CANAL_LEN) */
export const canalAt = (s: number): { p: V3; yaw: number } => {
  let acc = 0;
  for (const g of CSEG) { if (s <= acc + g.len || g === CSEG[CSEG.length - 1]) { const u = Math.min(g.len, Math.max(0, s - acc)); return { p: [g.a[0] + g.dx * u, 0, g.a[1] + g.dz * u], yaw: g.yaw }; } acc += g.len; }
  return { p: [0, 0, 0], yaw: 0 };
};
export const BASIN: V3 = [-44, 0, -20];
const RIVER: [number, number][] = [[34, -200], [26, -130], [40, -80], [33, -40], [42, 0], [38, 50], [46, 130]];
const SEC0: V3 = [70, 0, 44], LAT0: V3 = [-58, 0, 64], CORE0: V3 = [-46, 0, 46], WALL0: V3 = [54, 0, 58];
export { SEC0, LAT0, CORE0, WALL0 };
/** onde não vai árvore nem tufo: templo+fosso, dioramas, canal/bacia, rio, a margem sul (bandeira, castelo, câmeras) */
const busy = (x: number, z: number) => {
  if (Math.abs(x) < MO_OUT + 2.5 && Math.abs(z) < MO_OUT + 2.5) return true;
  if (Math.abs(z - 46) < 16 && Math.abs(x) < 22) return true;
  for (const [c, r] of [[SEC0, 14], [LAT0, 9], [CORE0, 11], [WALL0, 9]] as [V3, number][]) if (Math.hypot(x - c[0], z - c[2]) < r) return true;
  if (z < -20 && z > -122) { const u = (z + 106) / 60, cx = z < -46 ? lerp(-12, -44, clamp(u)) : -44; if (Math.abs(x - cx) < 7) return true; }
  if (Math.abs(x + 44) < 9 && z > -30 && z < -10) return true;
  return false;
};
const Ground: React.FC<{ t: number }> = ({ t }) => {
  const outer = useMemo(() => { const s = shapeSq(800); s.holes.push(pathSq(MO_OUT)); return new THREE.ShapeGeometry(s); }, []);
  const island = useMemo(() => new THREE.ShapeGeometry(shapeSq(MO_IN)), []);
  const moatRing = useMemo(() => ringGeo(MO_OUT, MO_IN), []);
  const patches = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ p: [lerp(-150, 150, rnd(i * 3 + 1)), 0.01 + (i % 5) * 0.002, lerp(-230, 130, rnd(i * 3 + 2))] as V3, s: lerp(4, 13, rnd(i * 3 + 3)), c: ["#9cc062", "#86b04e", "#c9b77a", "#b7c46a"][i % 4] })).filter((q) => !busy(q.p[0], q.p[2])), []);
  const blades = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; pts.length < 1100 && i < 6000; i++) { const x = lerp(-90, 110, rnd(i * 5 + 1)), z = lerp(-60, 110, rnd(i * 5 + 2)); if (!busy(x, z)) pts.push([x, z]); }
    const m = new THREE.InstancedMesh(new THREE.ConeGeometry(0.15, 0.45, 3), mat("#6f9a3a", { flat: true }), pts.length), d = new THREE.Object3D();
    pts.forEach(([x, z], i) => { d.position.set(x, 0.18, z); d.scale.setScalar(lerp(0.6, 1.5, rnd(i * 7 + 3))); d.rotation.y = rnd(i * 7 + 4) * 6; d.updateMatrix(); m.setMatrixAt(i, d.matrix); });
    m.receiveShadow = true; return m;
  }, []);
  // ondulações de areia no pátio do templo (textura: a régua de movimento precisa de detalhe no chão)
  const ripples = useMemo(() => {
    const L: IB[] = [];
    for (let i = 0; i < 150; i++) { const x = lerp(-23, 23, rnd(i * 11 + 1)), z = lerp(-23, 23, rnd(i * 11 + 2)); if (Math.max(Math.abs(x), Math.abs(z)) < A1 + 3.4 || (Math.abs(x) < 2.2 && z > 0)) continue; L.push({ p: [x, 0.02, z], s: [lerp(1.2, 3, rnd(i + 7)), 0.03, 0.12], ry: (rnd(i + 3) - 0.5) * 0.6 }); }
    const im = instBoxes(L); im.material = mat("#c9b27a"); im.castShadow = false; return im;
  }, []);
  const m = moatAt(t);
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} receiveShadow geometry={outer} material={mat(SANDG)} />
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow geometry={island} material={mat("#e2cd98")} />
      {patches.map((q, i) => <mesh key={i} position={q.p} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.s, 18]} /></mesh>)}
      <primitive object={blades} /><primitive object={ripples} />
      {/* o fosso: fundo, margens; tampado (chão) enquanto não foi cavado */}
      {m.covered ? <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow geometry={moatRing} material={mat(SANDG)} /> : <>
        <mesh rotation={[-PI / 2, 0, 0]} position={[0, MB, 0]} receiveShadow geometry={moatRing} material={mat(EARTH2)} />
        {[0, PI / 2, PI, -PI / 2].map((yaw) => { const [xi, zi] = rotY(0, MO_IN - 0.15, yaw), [xo, zo] = rotY(0, MO_OUT + 0.15, yaw); return <G key={yaw}>
          <Box s={[2 * MO_IN, -MB, 0.3]} p={[xi, MB / 2, zi]} r={[0, yaw, 0]} c={EARTH} cast={false} />
          <Box s={[2 * MO_OUT + 0.6, -MB, 0.3]} p={[xo, MB / 2, zo]} r={[0, yaw, 0]} c={EARTH} cast={false} />
        </G>; })}
      </>}
    </G>
  );
};
// fosso: posição no perímetro (linha do meio, meia-largura MC) a partir da bacia do canal, no lado oeste
const S0P = -19.5 + MC;
const perim = (x: number, z: number) => {
  let s: number;
  if (Math.abs(x + MC) < 4.6 && Math.abs(z) <= MO_IN + 0.01) s = z + MC; // oeste
  else if (Math.abs(z - MC) < 4.6) s = 2 * MC + (x + MC); // sul
  else if (Math.abs(x - MC) < 4.6) s = 4 * MC + (MC - z); // leste
  else s = 6 * MC + (MC - x); // norte
  return ((s % (8 * MC)) + 8 * MC) % (8 * MC);
};
const atPerim = (s: number): V3 => {
  s = ((s % (8 * MC)) + 8 * MC) % (8 * MC);
  if (s < 2 * MC) return [-MC, 0, s - MC];
  if (s < 4 * MC) return [s - 2 * MC - MC, 0, MC];
  if (s < 6 * MC) return [MC, 0, MC - (s - 4 * MC)];
  return [MC - (s - 6 * MC), 0, -MC];
};
const TILES = (() => {
  const L: { x: number; z: number; sx: number; sz: number; d: number }[] = [], w = MO_OUT - MO_IN;
  const n1 = 14, l1 = (2 * MO_OUT) / n1, n2 = 10, l2 = (2 * MO_IN) / n2;
  for (let i = 0; i < n1; i++) { const x = -MO_OUT + (i + 0.5) * l1; L.push({ x, z: MC, sx: l1, sz: w, d: 0 }, { x, z: -MC, sx: l1, sz: w, d: 0 }); }
  for (let i = 0; i < n2; i++) { const z = -MO_IN + (i + 0.5) * l2; L.push({ x: MC, z, sx: w, sz: l2, d: 0 }, { x: -MC, z, sx: w, sz: l2, d: 0 }); }
  const P = 8 * MC;
  for (const q of L) { const s = perim(q.x, q.z), dd = Math.abs(s - S0P); q.d = Math.min(dd, P - dd); }
  return L;
})();
const Moat: React.FC<{ t: number }> = ({ t }) => {
  const ring = useMemo(() => ringGeo(MO_OUT, MO_IN), []);
  const rip = useMemo(() => {
    const L: IB[] = [];
    for (let i = 0; L.length < 260 && i < 2000; i++) { const x = lerp(-MO_OUT, MO_OUT, rnd(i * 3 + 1)), z = lerp(-MO_OUT, MO_OUT, rnd(i * 3 + 2)); if (Math.max(Math.abs(x), Math.abs(z)) < MO_IN + 0.4 || Math.max(Math.abs(x), Math.abs(z)) > MO_OUT - 0.4 || (Math.abs(x) < 2.2 && z > 0)) continue; L.push({ p: [x, 0.03, z], s: [lerp(0.6, 1.8, rnd(i + 5)), 0.03, 0.16], ry: (rnd(i + 9) - 0.5) * 0.5 }); }
    const im = instBoxes(L); im.material = mat("#d6f1ff", { emissive: "#bfe6ff", ei: 0.25 }); im.castShadow = false; im.receiveShadow = false; return im;
  }, []);
  const pads = useMemo(() => {
    const L: IB[] = [];
    for (let i = 0; L.length < 70 && i < 900; i++) { const x = lerp(-MO_OUT, MO_OUT, rnd(i * 7 + 1)), z = lerp(-MO_OUT, MO_OUT, rnd(i * 7 + 2)), m = Math.max(Math.abs(x), Math.abs(z)); if (m < MO_IN + 0.8 || m > MO_OUT - 0.8 || (Math.abs(x) < 2.6 && z > 0)) continue; L.push({ p: [x, 0.04, z], s: [lerp(0.5, 1.0, rnd(i + 2)), 0.04, lerp(0.5, 1.0, rnd(i + 2))] }); }
    const im = instBoxes(L); im.material = mat("#4f9a3a", { flat: true }); im.castShadow = false; return im;
  }, []);
  const m = moatAt(t);
  if (m.covered || m.level < MB + 0.05) return null;
  if (m.fill < 0.999) {
    const reach = m.fill * 4 * MC;
    return (
      <G>
        {TILES.map((q, i) => { const k = clamp((reach - q.d) / 7); if (k <= 0.01) return null; const lv = lerp(MB + 0.05, m.level, k); return <Box key={i} s={[q.sx, lv - MB, q.sz]} p={[q.x, (MB + lv) / 2, q.z]} c={WATER} o={{ rough: 0.35 }} cast={false} />; })}
        {[1, -1].map((sg) => <Puffs key={sg} t={t} p={vadd(atPerim(S0P + sg * reach), [0, WL - 0.2, 0])} n={7} period={0.5} rise={1.0} size={0.9} c="#eaf7ff" drift={[0, 0, 0]} on={m.fill > 0.01 && m.fill < 0.98 ? 1 : 0} />)}
      </G>
    );
  }
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, m.level, 0]} receiveShadow geometry={ring} material={mat(WATER, { rough: 0.35 })} />
      <G p={[Math.sin(t * 0.5) * 0.35, m.level, Math.cos(t * 0.4) * 0.25]}><primitive object={rip} /></G>
      <G p={[0, m.level, 0]}><primitive object={pads} /></G>
    </G>
  );
};
const vadd = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** o canal desde a pedreira: seco até «por agua», quando a água desce até a bacia */
const canalFill = (t: number) => (t < T.agua - 0.05 ? 0 : ease(t, T.agua - 0.05, T.agua + 0.7));
const Canal: React.FC<{ t: number }> = ({ t }) => {
  const f = canalFill(t) * CANAL_LEN;
  let acc = 0;
  return (
    <G>
      {CSEG.map((g, i) => {
        const wl = clamp(f - acc, 0, g.len), mid: V3 = [g.a[0] + g.dx * g.len / 2, 0, g.a[1] + g.dz * g.len / 2], wm: V3 = [g.a[0] + g.dx * wl / 2, 0.06, g.a[1] + g.dz * wl / 2];
        const [bx, bz] = rotY(2.3, 0, g.yaw); acc += g.len;
        return (
          <G key={i}>
            <Box s={[3.6, 0.06, g.len + 2]} p={[mid[0], 0.02, mid[2]]} r={[0, g.yaw, 0]} c="#8a6e48" cast={false} />
            {wl > 0.05 ? <Box s={[3.6, 0.08, wl]} p={wm} r={[0, g.yaw, 0]} c={WATER} o={{ rough: 0.35 }} cast={false} /> : null}
            {[1, -1].map((sg) => <Box key={sg} s={[0.9, 0.38, g.len + 2]} p={[mid[0] + sg * bx, 0.19, mid[2] + sg * bz]} r={[0, g.yaw, 0]} c={EARTH} />)}
          </G>
        );
      })}
      {/* a bacia do porto (cheia desde a obra) e o cais de madeira */}
      <Box s={[7.5, 0.08, 10]} p={[BASIN[0], 0.05, BASIN[2]]} c={WATER} o={{ rough: 0.35 }} cast={false} />
      {[[-3.95, 0, 0.4, 10.8], [3.95, 0, 0.4, 10.8]].map(([x, , w, l], i) => <Box key={i} s={[w, 0.38, l]} p={[BASIN[0] + x, 0.19, BASIN[2]]} c={EARTH} />)}
      <Box s={[7.9, 0.38, 0.4]} p={[BASIN[0], 0.19, BASIN[2] + 5.2]} c={EARTH} />
      <Box s={[2.2, 0.3, 6.5]} p={[BASIN[0] + 5.0, 0.32, BASIN[2] + 0.5]} c={WOOD} />
      {[-2.5, 0, 2.5].map((z) => <Cyl key={z} rt={0.14} h={1.2} p={[BASIN[0] + 4.1, 0.3, BASIN[2] + 0.5 + z]} c={WOOD2} seg={6} />)}
      {f > 0 && f < CANAL_LEN - 1 ? <Puffs t={t} p={vadd(canalAt(f).p, [0, 0.2, 0])} n={6} period={0.45} rise={1.2} size={1.4} c="#eaf7ff" drift={[0, 0, 0]} /> : null}
    </G>
  );
};
const River: React.FC = () => (
  <G>
    {RIVER.slice(1).map((b, i) => { const a = RIVER[i], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); return <Box key={i} s={[5, 0.08, len + 4]} p={[(a[0] + b[0]) / 2, 0.04, (a[1] + b[1]) / 2]} r={[0, Math.atan2(dx, dz), 0]} c="#4aa6dc" o={{ rough: 0.35 }} cast={false} />; })}
  </G>
);
const KULEN: V3 = [-8, 0, -175], QUARRY: V3 = [-12, 0, -114];
const Kulen: React.FC<{ t: number }> = ({ t }) => {
  const lit = pulse(t, T.kulen - 0.05, T.kulen + 0.8);
  return (
    <G>
      <G p={KULEN}>
        <Cyl rt={40} rb={52} h={14} seg={11} p={[0, 7, 0]} c="#5f9a42" o={lit > 0 ? { flat: true, emissive: "#ffd400", ei: 0.35 * lit } : { flat: true }} />
        <Cyl rt={38} h={0.6} seg={11} p={[0, 14.2, 0]} c="#4e8a36" o={{ flat: true }} />
        {Array.from({ length: 16 }, (_, i) => { const a = i * 2.4, r = 8 + 26 * rnd(i + 3); return <Cone key={i} rad={4} h={7} seg={6} p={[r * Math.cos(a), 17.5, r * Math.sin(a)]} c={i % 2 ? "#3f8a2c" : "#4f9e34"} o={{ flat: true }} />; })}
      </G>
      {/* a pedreira de arenisca no pé do monte, com pilhas de blocos à beira do canal */}
      <G p={QUARRY}>
        <Box s={[20, 0.3, 11]} p={[0, 0.15, 0]} c="#d9c08a" />
        {Array.from({ length: 14 }, (_, i) => <Box key={i} s={[2.2, 1.2, 1.6]} p={[-8 + (i % 7) * 2.6, 0.9 + Math.floor(i / 7) * 1.25, -2.5 + Math.floor(i / 7) * 0.2]} c={i % 2 ? NEW.s1 : NEW.s2} />)}
        <Box s={[6, 3.5, 3]} p={[6, 1.75, -4.5]} c={NEW.s3} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- balsas, gente
const Raft: React.FC<{ p: V3; yaw: number; t: number; blocks?: number; ph?: number; lit?: number }> = ({ p, yaw, t, blocks = 2, ph = 0, lit = 0 }) => (
  <G p={[p[0], p[1] + 0.14 + 0.04 * Math.sin(t * 2.6 + ph), p[2]]} r={[0.02 * Math.sin(t * 2.1 + ph), yaw, 0.03 * Math.sin(t * 1.7 + ph)]}>
    {[-0.9, -0.45, 0, 0.45, 0.9].map((x, i) => <Cyl key={i} rt={0.22} h={4.6} p={[x, 0, 0]} r={[PI / 2, 0, 0]} c={i % 2 ? "#c9b06a" : "#b39a55"} seg={7} />)}
    {[1.7, -1.7].map((z) => <Box key={z} s={[2.3, 0.1, 0.3]} p={[0, 0.24, z]} c={WOOD2} />)}
    {blocks >= 1 ? <Box s={[1.5, 0.8, 1.15]} p={[0, 0.66, 0.75]} c={NEW.s1} o={lit > 0 ? { emissive: "#ffd400", ei: lit } : undefined} /> : null}
    {blocks >= 2 ? <Box s={[1.5, 0.8, 1.15]} p={[0, 0.66, -0.65]} c={NEW.s2} o={lit > 0 ? { emissive: "#ffd400", ei: lit } : undefined} /> : null}
  </G>
);
const local = (p: V3, yaw: number, l: V3): V3 => { const [x, z] = rotY(l[0], l[2], yaw); return [p[0] + x, p[1] + l[1], p[2] + z]; };
/** dois barqueiros com vara na traseira da balsa */
const Polers: React.FC<{ p: V3; yaw: number; t: number; ph?: number }> = ({ p, yaw, t, ph = 0 }) => {
  const list = [-0.6, 0.6].map((x, i) => ({ p: local(p, yaw, [x, 0.3, -1.85]), yaw, pose: "pull" as PoseName, ph: ph + i * 0.6 }));
  return (
    <G>
      <Crowd list={list} t={t} c={KH2} />
      {list.map((m, i) => { const k = Math.sin((t + m.ph) * 2.2), top = local(p, yaw, [(i ? 0.95 : -0.95), 2.4, -1.4 + 0.25 * k]), bot = local(p, yaw, [(i ? 1.5 : -1.5), -0.6, -3.2 - 0.4 * k]); return <Pipe key={i} a={top} b={bot} rad={0.05} c={WOOD2} />; })}
    </G>
  );
};
const Birds: React.FC<{ t: number; c: V3; n?: number; r?: number; t0?: number }> = ({ t, c, n = 7, r = 7, t0 = 0 }) => (
  <G>
    {Array.from({ length: n }, (_, i) => {
      const u = t - t0, a = i * 0.9 + u * (0.9 + 0.15 * i), rr = r * (0.6 + 0.4 * rnd(i)) + u * 1.5, y = c[1] + i * 0.4 + u * 1.6;
      const f = Math.sin(t * 18 + i) * 0.7;
      return (
        <G key={i} p={[c[0] + rr * Math.cos(a), y, c[2] + rr * Math.sin(a)]} r={[0, -a, 0]}>
          <Box s={[0.12, 0.12, 0.42]} c="#3a3a40" cast={false} />
          <G r={[0, 0, f]}><Box s={[0.5, 0.03, 0.2]} p={[0.25, 0, 0]} c="#4a4a52" cast={false} /></G>
          <G r={[0, 0, -f]}><Box s={[0.5, 0.03, 0.2]} p={[-0.25, 0, 0]} c="#4a4a52" cast={false} /></G>
        </G>
      );
    })}
  </G>
);

// ---------------------------------------------------------------- as três aberturas (0 → X1)
/** a) a obra em velocidade: blocos voando para os terraços que sobem */
const OpenBuild: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "a" || t >= X1) return null;
  return (
    <G>
      {Array.from({ length: 16 }, (_, k) => {
        const t0 = -0.5 + k * 0.15, u = prog(t, t0, t0 + 0.55); if (u <= 0 || u >= 1) return null;
        const a = 0.35 + (k % 5) * 0.55, sp: V3 = [26 * Math.cos(a), 1.5, 26 * Math.sin(a)], tier = t0 < 0.45 ? 0 : t0 < 1.0 ? 1 : 2;
        const R = [A1, A2, A3][tier] * 0.8, Y = [H1, H2, H3][tier], tp: V3 = [R * Math.cos(a + 0.6), Y, R * Math.sin(a + 0.6)];
        return <Box key={k} s={[1.3, 0.7, 0.9]} p={[lerp(sp[0], tp[0], u), lerp(sp[1], tp[1], u) + 9 * Math.sin(PI * u), lerp(sp[2], tp[2], u)]} r={[u * 5, u * 3, 0]} c={k % 2 ? NEW.s1 : OLD.s1} />;
      })}
      {[[3, H1, A1 - 0.5], [-5, H1, A1 - 0.5], [5, H2, A2 - 0.5], [-3, H3, A3 - 0.3]].map((p, i) => <Puffs key={i} t={t} p={p as V3} n={5} period={0.45} rise={0.9} size={0.35} c="#e2d2a8" drift={[0.5, 0, 0.5]} on={t > i * 0.4 - 0.2 && t < i * 0.4 + 1.0 ? 1 : 0} />)}
    </G>
  );
};
/** b) rente à água do fosso: a balsa com o operário cruza o quadro; lótus e ondas passando */
export const raftB = (t: number): V3 => [-13.5 + 3.2 * t, 0, MC - 1.5];
const OpenMoat: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "b" || t >= X1) return null;
  const p = raftB(t);
  return <G><Raft p={[p[0], WL, p[2]]} yaw={PI / 2} t={t} blocks={1} /><Polers p={[p[0], WL, p[2]]} yaw={PI / 2} t={t} />
    <Puffs t={t} p={[p[0] - 2.6, WL, p[2]]} n={6} period={0.5} rise={0.4} size={0.5} c="#eaf7ff" drift={[-1.5, 0, 0]} /></G>;
};
/** c) a escala: pássaros saindo da torre central enquanto a câmera recua do operário */
const OpenScale: React.FC<{ t: number }> = ({ t }) => (OPEN !== "c" || t >= X1 ? null : <Birds t={t} c={[0, H3 + 6, 0]} n={8} r={5} />);

// ---------------------------------------------------------------- a obra (plano C1), o rei (X3)
const Pile: React.FC<{ p: V3; c?: string; lit?: number; n?: [number, number, number] }> = ({ p, c = NEW.s1, lit = 0, n = [3, 2, 2] }) => (
  <G p={p}>
    {Array.from({ length: n[0] * n[1] * n[2] }, (_, i) => { const x = i % n[0], z = Math.floor(i / n[0]) % n[1], y = Math.floor(i / (n[0] * n[1])); return <Box key={i} s={[1.25, 0.66, 0.9]} p={[(x - (n[0] - 1) / 2) * 1.32 + y * 0.3, 0.34 + y * 0.68, (z - (n[1] - 1) / 2) * 0.96]} c={i % 3 ? c : NEW.s2} o={lit > 0 ? { emissive: "#ffd400", ei: lit } : undefined} />; })}
  </G>
);
const Logs: React.FC<{ p: V3; lit?: number }> = ({ p, lit = 0 }) => (
  <G p={p}>{[[-0.5, 0.22], [0, 0.22], [0.5, 0.22], [-0.25, 0.62], [0.25, 0.62], [0, 1.0]].map(([x, y], i) => <Cyl key={i} rt={0.24} h={4.2} p={[x, y, 0]} r={[PI / 2, 0, 0]} c={i % 2 ? WOOD : WOOD2} seg={7} o={lit > 0 ? { emissive: "#ffd400", ei: lit } : undefined} />)}</G>
);
const Coil: React.FC<{ p: V3; lit?: number }> = ({ p, lit = 0 }) => (
  <G p={p}>{[0.1, 0.25, 0.4].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation={[PI / 2, 0, 0]} castShadow material={mat(ROPE, lit > 0 ? { emissive: "#ffd400", ei: lit } : {})}><torusGeometry args={[0.55 - i * 0.06, 0.09, 6, 16]} /></mesh>)}</G>
);
/** puxada do bloco sobre rolos (C1): o bloco anda +x e os rolos giram */
const haulX = (t: number) => lerp(-15, -7.5, prog(t, C1, X3));
const Site: React.FC<{ t: number }> = ({ t }) => {
  if (t < C1 || t >= X3) return null;
  const hx0 = haulX(t), many = ease(t, T.manos - 0.05, T.manos + 0.4);
  const team = [0, 1, 2, 3].map((i) => ({ p: [hx0 + 2.2 + i * 1.05, 0, 21.2 + (i % 2 ? 0.55 : -0.55)] as V3, yaw: PI / 2, pose: "pull" as PoseName, ph: i * 0.37 }));
  const crowd2 = [0, 1, 2, 3, 4, 5].map((i) => ({ p: [-3.5 + i * 1.3, 0, 25.8 + (i % 2) * 0.9] as V3, yaw: PI + 0.3, pose: (i % 2 ? "cheer" : "walk") as PoseName, ph: i * 0.29 }));
  return (
    <G>
      <Pile p={[-3.6, 0, 17.6]} lit={0.6 * pulse(t, T.piedra - 0.05, T.madera - 0.05)} />
      <Pile p={[1.6, 0, 19.6]} n={[2, 2, 2]} lit={0.6 * pulse(t, T.piedra - 0.05, T.madera - 0.05)} />
      <Logs p={[-9.5, 0, 16.0]} lit={0.6 * pulse(t, T.madera - 0.05, T.cuerda - 0.05)} />
      <Coil p={[-6.4, 0, 24.4]} lit={0.8 * pulse(t, T.cuerda - 0.05, T.manos - 0.05)} />
      <Coil p={[-5.3, 0, 24.9]} lit={0.8 * pulse(t, T.cuerda - 0.05, T.manos - 0.05)} />
      {/* o bloco nos rolos e a corda até a equipe */}
      <Box s={[1.6, 0.85, 1.1]} p={[hx0, 0.72, 21.2]} c={NEW.s1} />
      {[-0.9, 0, 0.9].map((dx, i) => <Cyl key={i} rt={0.15} h={1.6} p={[Math.round((hx0 + dx) / 0.9) * 0.9, 0.15, 21.2]} r={[PI / 2, (hx0 * 3) % 6, 0]} c={WOOD2} seg={7} />)}
      <Pipe a={[hx0 + 0.8, 0.8, 21.2]} b={[hx0 + 5.6, 1.1, 21.2]} rad={0.05} c={ROPE} cast={false} />
      <Crowd list={team} t={t} c={KH2} />
      <G sc={Math.max(0.001, many)}><Crowd list={crowd2} t={t} c={KH3} /></G>
      <Puffs t={t} p={[hx0 - 0.6, 0.05, 21.2]} n={6} period={0.6} rise={0.6} size={0.4} c="#e8d8b0" drift={[-0.9, 0, 0]} />
    </G>
  );
};
/** «quiere un templo con forma de montaña sagrada»: o rei sob o guarda-sol; o templo fantasma sobe e a montanha (Meru) aparece */
const KING_P: V3 = [9.6, 0, 30.4];
const King: React.FC<{ t: number }> = ({ t }) => {
  if (t < X3 || t >= C2) return null;
  const k = poseOf(t < T.quiere ? "present" : "point", t);
  return (
    <G>
      <Box s={[2.0, 0.5, 2.0]} p={[KING_P[0], 0.25, KING_P[2]]} c="#c8a040" />
      <Worker p={[KING_P[0], 0.5, KING_P[2]]} yaw={PI + 0.5} pose={k} t={t} c={KING} scale={1.3} />
      <Cone rad={0.2} h={0.55} seg={6} p={[KING_P[0], 0.5 + 2.75, KING_P[2]]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.4 }} />
      <Cyl rt={0.05} h={3.9} p={[KING_P[0] + 0.5, 1.95, KING_P[2] - 0.7]} c={WOOD2} seg={6} />
      <G p={[KING_P[0] + 0.5, 3.85, KING_P[2] - 0.7]} r={[0, t * 0.6, 0]}>
        <Cone rad={1.1} h={0.55} seg={8} c="#c8352a" /><Cone rad={0.8} h={0.4} seg={8} p={[0, 0.35, 0]} c="#ffd400" />
      </G>
    </G>
  );
};
const ghostRise = (t: number) => {
  if (t >= X3 && t < C2) return ease(t, T.templo - 0.1, T.templo + 0.7);
  if (t >= C2 && t < X4) return 1;
  if (t >= C5 && t < X8) return 0.6 + 0.4 * Math.abs(Math.sin((t - C5) * 3)) * (t > T.necesita - 0.2 ? 1 : 0.4);
  return 0;
};
const Meru: React.FC<{ t: number }> = ({ t }) => {
  const u = t >= X3 && t < C2 ? ease(t, T.montana - 0.1, T.sagrada + 0.3) : 0; if (u <= 0.01) return null;
  const o: MatOpts = { opacity: 0.3 * u, depthWrite: false, emissive: "#8fd0ff", ei: 0.6 };
  return (
    <G>
      <Cone rad={13} h={24 * u} seg={7} p={[0, 12 * u, 0]} c="#bfe6ff" o={o} cast={false} />
      {[[CX * 2, CX * 2], [-CX * 2, CX * 2], [CX * 2, -CX * 2], [-CX * 2, -CX * 2]].map(([x, z], i) => <Cone key={i} rad={7} h={15 * u} seg={6} p={[x, 7.5 * u, z]} c="#bfe6ff" o={o} cast={false} />)}
    </G>
  );
};

// ---------------------------------------------------------------- o porto (C3, C5)
/** a balsa do plano X4: desce o canal (a câmera vai ao lado) */
export const raftX4 = (t: number) => canalAt(22 + 4.2 * (t - X4));
const RaftRun: React.FC<{ t: number }> = ({ t }) => {
  if (t < X4 - 0.05 || t >= C3) return null;
  const r = raftX4(t), p: V3 = [r.p[0], 0.02, r.p[2]];
  return <G><Raft p={p} yaw={r.yaw} t={t} blocks={2} /><Polers p={p} yaw={r.yaw} t={t} />
    <Puffs t={t} p={local(p, r.yaw, [0, 0.05, -2.6])} n={6} period={0.5} rise={0.3} size={0.45} c="#eaf7ff" drift={[0, 0, 0]} />
    {Array.from({ length: 10 }, (_, i) => { const v = fract(t * 0.7 + i / 10); return <Box key={i} s={[0.7, 0.03, 0.14]} p={local(p, r.yaw, [(i % 2 ? 1 : -1) * (1.3 + 0.3 * (i % 3)), 0.12, 3 - 9 * v])} r={[0, r.yaw, 0]} c="#d6f1ff" o={{ emissive: "#bfe6ff", ei: 0.3 }} cast={false} />; })}</G>;
};
/** balsas na fila do canal (C5: até o horizonte, «viene de muy lejos») */
const Dock: React.FC<{ t: number }> = ({ t }) => {
  const a = t >= C3 && t < X5, b = t >= C5 && t < X8; if (!a && !b) return null;
  const n = a ? 3 : 9, sp = a ? 7.5 : 9;
  const rafts = Array.from({ length: n }, (_, i) => {
    if (i === 0) return { p: [BASIN[0], 0.02, BASIN[2] - 1.0] as V3, yaw: 0, blocks: a ? 1 : 2 };
    const s = CANAL_LEN - 4 - i * sp + (t - (a ? C3 : C5)) * 1.6, c = canalAt(s);
    return { p: [c.p[0], 0.02, c.p[2]] as V3, yaw: c.yaw, blocks: 2 };
  });
  const off = a ? ease(t, C3 + 0.2, X5 - 0.3) : 0; // o bloco sobe do cais para o barranco, em rolos
  const bp: V3 = [lerp(BASIN[0] + 2.5, BASIN[0] + 8.5, off), lerp(0.5, 0.75, off), BASIN[2] - 1.0];
  const team = a ? [0, 1, 2].map((i) => ({ p: [bp[0] + 2.4 + i * 1.0, 0, bp[2] + (i % 2 ? 0.5 : -0.5)] as V3, yaw: PI / 2, pose: "pull" as PoseName, ph: i * 0.41 })) : [];
  return (
    <G>
      {rafts.map((r, i) => <G key={i}><Raft p={r.p} yaw={r.yaw} t={t} blocks={r.blocks} ph={i} />{i > 0 && i < 4 ? <Polers p={r.p} yaw={r.yaw} t={t} ph={i * 0.7} /> : null}</G>)}
      {a ? <>
        <Box s={[1.5, 0.8, 1.15]} p={bp} c={NEW.s1} />
        {[-0.8, 0.8].map((dx, i) => <Cyl key={i} rt={0.14} h={1.5} p={[bp[0] + dx, 0.32, bp[2]]} r={[PI / 2, 0, 0]} c={WOOD2} seg={7} />)}
        <Pipe a={[bp[0] + 0.75, bp[1] + 0.1, bp[2]]} b={[bp[0] + 4.6, 1.1, bp[2]]} rad={0.05} c={ROPE} cast={false} />
        <Crowd list={team} t={t} c={KH3} />
      </> : <Pile p={[BASIN[0] + 7.5, 0, BASIN[2] + 1.0]} n={[2, 1, 1]} />}
    </G>
  );
};

// ---------------------------------------------------------------- SEC: o corte da areia sob a torre
const SD1 = "#ebd29a", SD2 = "#dec184", SW1 = "#a8865a", SW2 = "#987650";
/** afundamento da torre na areia seca (0..1) — volta de ré no «¿Cómo la mantienes?» */
export const sinkU = (t: number) => (t >= C4 ? 0 : t < T.b2 + 0.1 ? ease(t, SINK0, SINK1) : 1 - ease(t, T.b2 + 0.1, T.b2 + 0.6));
const wetX = (t: number) => (t < C4 ? -3.5 : lerp(-3.5, 7.5, ease(t, T.humeda - 0.35, T.arenaSuelo + 0.7)));
const GRAINS = Array.from({ length: 46 }, (_, i) => ({ x: lerp(-3.2, 7.2, rnd(i * 3 + 1)), y: lerp(0.4, 5.6, rnd(i * 3 + 2)), s: lerp(0.12, 0.22, rnd(i * 3 + 3)) }));
const Sec: React.FC<{ t: number }> = ({ t }) => {
  if (t < X5 || t >= C5) return null;
  const wet = t >= C4, topL = wet ? 3.8 : 6, u = sinkU(t), wx = wetX(t);
  const press = t >= X7 ? 0.08 * Math.abs(Math.sin((t - X7) * 9)) * (t < T.esteFoso ? 1 : 0) : 0;
  const arrows = (t > T.bajo && t < SINK1 + 0.3) || (t > X7 + 0.1 && t < T.esteFoso) ? 1 : 0;
  const band = (x0: number, x1: number, y0: number, y1: number, c: string, k: string, z = 2.23) => x1 - x0 > 0.01 && y1 - y0 > 0.01 ? <Box key={k} s={[x1 - x0, y1 - y0, 0.06]} p={[(x0 + x1) / 2, (y0 + y1) / 2, z]} c={c} cast={false} /> : null;
  const stripes: React.ReactNode[] = [];
  for (let j = 0; j < 5; j++) {
    const y0 = j * 1.15, y1 = Math.min(6, y0 + 1.15), dry = j % 2 ? SD2 : SD1, wc = j % 2 ? SW2 : SW1;
    stripes.push(band(-8, -3.5, y0, Math.min(y1, topL), wet ? wc : dry, `l${j}`));
    stripes.push(band(-3.5, wx, y0, y1, wc, `w${j}`), band(wx, 7.5, y0, y1, dry, `d${j}`));
  }
  const drops = wet && t > T.agua2 - 0.1 && t < X7 ? Array.from({ length: 12 }, (_, i) => { const v = fract((t - T.agua2) * 0.9 + i / 12), x = lerp(-3.4, Math.max(-3.2, wx - 0.3), v), y = 0.8 + (i % 6) * 0.85 + 0.25 * Math.sin(v * 9 + i); return x < wx ? <Sph key={i} rad={0.13} p={[x, y, 2.32]} c="#3fa9ff" o={{ emissive: "#2f8cf0", ei: 0.5 }} cast={false} ws={8} hs={6} /> : null; }) : null;
  return (
    <G p={SEC0}>
      {/* o bloco de areia (topo em 6, fosso à esquerda depois do C4) e a superfície que continua para trás */}
      <Box s={[4.5, topL, 16]} p={[-5.75, topL / 2, -5.8]} c={SD2} />
      <Box s={[11, 6, 16]} p={[2.0, 3, -5.8]} c={SD2} />
      <Box s={[15.5, 0.25, 16]} p={[-0.25, 6.05, -5.8]} c="#9cc062" cast={false} vis={!wet} />
      <Box s={[11, 0.25, 16]} p={[2.0, 6.05, -5.8]} c="#9cc062" cast={false} vis={wet} />
      {stripes}
      {GRAINS.map((g, i) => {
        const dx = g.x - 2.5, near = Math.exp(-(dx * dx) / 6 - ((g.y - 5) * (g.y - 5)) / 5), sx = Math.sign(dx || 1) * 1.1 * u * near, sy = -0.4 * u * near;
        return <Box key={i} s={[g.s, g.s, 0.05]} p={[g.x + sx, g.y + sy, 2.3]} r={[0, 0, i]} c={g.x < wx ? "#6e5536" : "#c9a86a"} cast={false} />;
      })}
      {wet ? <>
        <Box s={[4.5, 1.9, 16]} p={[-5.75, 3.8 + 0.95, -5.8]} c={WATER} o={{ opacity: 0.85, rough: 0.3 }} cast={false} />
        {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[0.8, 0.04, 0.16]} p={[-7.6 + ((i * 0.9 + t * 0.6) % 4.2), 5.72, 1.6 - i * 1.4]} c="#d6f1ff" o={{ emissive: "#bfe6ff", ei: 0.3 }} cast={false} />)}
        {drops}
      </> : null}
      {/* a torre na plataforma: afunda e entorta na areia seca; na úmida aguenta firme */}
      <G p={[2.5, 6 - 1.5 * u - press, 0]} r={[0, 0, -0.2 * u]}>
        <Box s={[5, 1.4, 4.56]} p={[0, 0.7, 0]} c={NEW.s1} />
        <Box s={[5.2, 0.2, 4.6]} p={[0, 1.4, 0]} c={NEW.s3} />
        <G p={[0, 1.5, -0.3]}><Prang w={2.8} h={6.4} pal={NEW} /></G>
      </G>
      {/* a areia empurrada para os lados */}
      {[-0.4, 5.4].map((x, i) => <Sph key={i} rad={1.2} p={[x, 6, 0.6]} sc={[1.2, Math.max(0.01, 0.55 * u), 1.4]} c={SD1} cast={false} vis={u > 0.02} />)}
      <Puffs t={t} p={[2.5, 6.1, 1.5]} n={8} period={0.5} rise={1.2} size={0.7} c="#efdcae" drift={[0, 0, 0.6]} on={t > SINK0 && t < SINK1 + 0.2 ? 1 : 0} />
      {/* setas do peso */}
      {arrows ? [0.9, 4.1].map((x, i) => { const b = 0.35 * Math.abs(Math.sin(t * 7 + i)); return <G key={i} p={[x, 9.9 - b - 1.5 * u, 2.4]}><Cyl rt={0.16} h={1.3} p={[0, 0.65, 0]} c="#e0262b" cast={false} /><Cone rad={0.42} h={0.6} p={[0, -0.25, 0]} r={[PI, 0, 0]} c="#e0262b" cast={false} /></G>; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- LAT: o barranco de laterita
const LS = "#e0703f", LH = "#8a3622";
const latOut = (t: number) => ease(t, T.blanda + 0.02, T.blanda + 0.45);
const Lat: React.FC<{ t: number }> = ({ t }) => {
  if (t < X9 || t >= X10) return null;
  const spade = ease(t, T.corta - 0.1, T.blanda + 0.05), out = latOut(t), hard = ease(t, T.endurece + 0.05, T.aire + 0.15);
  const jig = out > 0 ? 1 + 0.12 * Math.sin((t - T.blanda) * 26) * Math.exp(-(t - T.blanda) * 3) * (1 - hard) : 1;
  const bz = lerp(0.95, 2.6, out), by = lerp(2.05, 0.35, ease(t, T.blanda + 0.2, T.blanda + 0.55)), score = ease(t, T.rojiza + 0.1, T.corta);
  return (
    <G p={LAT0}>
      <Box s={[9, 2.4, 5]} p={[0, 1.2, -1.2]} c="#c0583a" />
      {[0.4, 1.2, 2.0].map((y, i) => <Box key={i} s={[9.02, 0.1, 5.02]} p={[0, y, -1.2]} c="#a8482e" cast={false} />)}
      <Box s={[1.25, 0.75, 0.3]} p={[-2.5, 1.65, 1.2]} c="#6a2a18" cast={false} /><Box s={[1.25, 0.75, 0.3]} p={[2.7, 0.9, 1.2]} c="#6a2a18" cast={false} />
      {/* o bloco que sai: marcado (riscos), cortado mole (a pá entra sem esforço), sai balançando e endurece ao ar */}
      {out <= 0.001 ? <Box s={[1.22, 0.72, 0.1]} p={[0.3, 2.05, 1.3]} c={score > 0.5 ? "#7a3220" : "#c0583a"} cast={false} /> : <Box s={[1.25, 0.75, 0.5]} p={[0.3, 2.05, 1.06]} c="#5a2414" cast={false} />}
      <G p={[0.3, by, bz]} sc={[1 / Math.sqrt(jig), jig, 1 / Math.sqrt(jig)]}>
        <Box s={[1.2, 0.7, 0.7]} c={mix(LS, LH, hard)} vis={out > 0.001} />
        {hard > 0.3 ? [[-0.2, 0.36, 0.25, 0.5], [0.25, 0.36, -0.2, 0.7], [0.0, 0.0, 0.36, 0.9]].map(([x, y, z, l], i) => <Box key={i} s={[l, 0.03, 0.03]} p={[x, y, z]} r={[0, i, 0.4 * i]} c="#3a1408" cast={false} />) : null}
      </G>
      <G p={[0.3, lerp(3.6, 2.2, spade), 0.5]} r={[0.15, 0, 0]}>
        <Box s={[0.55, 0.7, 0.05]} p={[0, -0.35, 0]} c="#8a8f94" o={{ metal: 0.4, rough: 0.4 }} />
        <Cyl rt={0.04} h={1.6} p={[0, 0.8, 0]} c={WOOD} seg={6} />
      </G>
      <Puffs t={t} p={[0.3, 0.5, 2.6]} n={6} period={0.5} rise={0.8} size={0.35} c="#f0e6e0" drift={[1.6, 0, 0]} on={t > T.aire - 0.1 && t < X10 ? 1 : 0} />
      <Puffs t={t} p={[0.3, 2.4, 0.9]} n={5} period={0.45} rise={0.6} size={0.3} c="#d88a60" drift={[0, 0, 0.4]} on={t > T.corta && t < T.blanda + 0.3 ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- CORE: o terraço em corte (núcleo de laterita, pele de arenisca)
const CORE_CELLS = Array.from({ length: 48 }, (_, i) => ({ x: -2.4 + (i % 4) * 1.6, y: 0.5 + Math.floor(i / 16), z: -2.4 + (Math.floor(i / 4) % 4) * 1.6, top: Math.floor(i / 16) === 2 }));
const SKIN = [...Array.from({ length: 12 }, (_, i) => ({ face: 0, c: i % 4, r: Math.floor(i / 4) })), ...Array.from({ length: 12 }, (_, i) => ({ face: 1, c: i % 4, r: Math.floor(i / 4) }))];
const Core: React.FC<{ t: number }> = ({ t }) => {
  if (t < X8 || t >= C6) return null;
  const xray = t >= T.esteRelleno - 0.05 ? ease(t, T.esteRelleno - 0.05, T.esteRelleno + 0.35) : 0, glow = t > T.noSeVe && t < X9 ? pulse(t, T.noSeVe, X9) : xray > 0 ? 0.4 + 0.4 * Math.sin(t * 7) : 0;
  const seen = pulse(t, T.seVe - 0.05, T.seVe + 0.7);
  return (
    <G p={CORE0}>
      <Box s={[7.4, 0.25, 7.4]} p={[0, 0.12, 0]} c={EARTH2} />
      {CORE_CELLS.map((q, i) => {
        if (t < X10 && q.top) { const k = i - 32, t0 = T.laterita - 0.1 + k * 0.045, u = prog(t, t0, t0 + 0.3); if (u <= 0) return null; const y = q.y + 4 * (1 - u) + (u >= 1 ? 0.12 * Math.abs(Math.sin((t - t0 - 0.3) * 14)) * Math.exp(-(t - t0 - 0.3) * 5) : 0); return <Box key={i} s={[1.5, 0.92, 1.5]} p={[q.x, y, q.z]} c={i % 2 ? LAT_W : "#b0503a"} o={glow > 0 ? { emissive: "#ff5a20", ei: 0.5 * glow } : undefined} />; }
        return <Box key={i} s={[1.5, 0.92, 1.5]} p={[q.x, q.y, q.z]} c={i % 2 ? LAT_W : "#b0503a"} o={glow > 0 ? { emissive: "#ff5a20", ei: 0.5 * glow } : undefined} />;
      })}
      {t >= X10 ? SKIN.map((s, i) => {
        const t0 = T.tallada + 0.05 + (s.face * 12 + s.r * 4 + s.c) * 0.055, u = ease(t, t0, t0 + 0.35); if (u <= 0.001) return null;
        const along = -2.4 + s.c * 1.6, y = 0.5 + s.r, slide = 2.8 * (1 - u);
        const p: V3 = s.face === 0 ? [along, y + 1.2 * (1 - u), 3.48 + slide] : [3.48 + slide, y + 1.2 * (1 - u), -along];
        const ry = s.face === 0 ? 0 : PI / 2, o: MatOpts | undefined = xray > 0 ? { opacity: lerp(1, 0.28, xray), depthWrite: xray < 0.5 } : seen > 0 ? { emissive: "#ffd400", ei: 0.45 * seen } : undefined;
        return (
          <G key={i} p={p} r={[0, ry, 0]}>
            <Box s={[1.56, 0.94, 0.55]} c={(s.c + s.r) % 2 ? NEW.s1 : NEW.s2} o={o} cast={!o} />
            <Box s={[1.15, 0.6, 0.05]} p={[0, 0, 0.29]} c={NEW.s3} o={o} cast={false} />
            {s.r === 1 && s.c % 2 === 1 ? <><Sph rad={0.1} p={[0, 0.16, 0.33]} c={NEW.dk} o={o} cast={false} ws={8} hs={6} /><Box s={[0.18, 0.32, 0.05]} p={[0, -0.1, 0.33]} c={NEW.dk} o={o} cast={false} /></> : null}
          </G>
        );
      }) : null}
      <Puffs t={t} p={[0, 3.0, 0]} n={6} period={0.45} rise={0.8} size={0.28} c="#d88a60" drift={[0.4, 0, 0.6]} on={t > T.laterita && t < T.laterita + 1.0 ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- o bloco com buracos que sobe (C6, X11): andaime e roldana na torre central
export const BLK: V3 = [0, H3 + 0.4, 4.4];
const liftY = (t: number) => 5.0 * ease(t, LIFT0, LIFT1);
const holeT = (k: number) => T.tallan + k * 0.45;
const holeR = (t: number, k: number) => 0.1 * ease(t, holeT(k), holeT(k) + 0.3);
const pegIn = (t: number, k: number) => ease(t, (k ? T.estacas + 0.15 : T.meten) - 0.05, (k ? T.estacas + 0.15 : T.meten) + 0.35);
export const PULLEY: V3 = [0, 16.9, 4.9];
const TEAM_ROPE: V3 = [3.3, 7.3, 7.9];
const Lift: React.FC<{ t: number }> = ({ t }) => {
  if (t < C6 || t >= C7) return null;
  const ly = liftY(t), bc: V3 = [BLK[0], BLK[1] + ly, BLK[2]], tie = ease(t, T.atarlos, T.cuerdas + 0.25), hook: V3 = [0, bc[1] + 1.6, BLK[2] + 0.5];
  const pegs = [-0.38, 0.38].map((x, k) => ({ x, u: pegIn(t, k) }));
  const team = [0, 1, 2].map((i) => ({ p: [2.6 + i * 1.0, H2, 7.6 + (i % 2) * 0.5] as V3, yaw: -2.3, pose: (t > T.subirlos - 0.3 ? "pull" : "idle") as PoseName, ph: i * 0.4 }));
  const spin = ly * 3;
  return (
    <G>
      {/* andaime: 4 postes, travessas e a viga com a roldana */}
      {[[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.6], [2.5, 2.6]].map(([x, z], i) => <Cyl key={i} rt={0.1} h={8.2} p={[x, H3 + 4.1, z]} c={WOOD2} seg={6} />)}
      {[12.3, 15.4].map((y) => <G key={y}><Box s={[5.2, 0.16, 0.16]} p={[0, y, 2.6]} c={WOOD} /><Box s={[5.2, 0.16, 0.16]} p={[0, y, -2.5]} c={WOOD} /><Box s={[0.16, 0.16, 5.2]} p={[2.5, y, 0]} c={WOOD} /><Box s={[0.16, 0.16, 5.2]} p={[-2.5, y, 0]} c={WOOD} /></G>)}
      <Box s={[0.3, 0.3, 5.8]} p={[0, PULLEY[1] + 0.45, 2.2]} c={WOOD} />
      <G p={PULLEY} r={[spin, 0, PI / 2]}><Cyl rt={0.38} h={0.18} c={WOOD2} seg={10} /><Box s={[0.08, 0.2, 0.7]} c={WOOD} /></G>
      {/* o bloco: furos que o cinzel abre, estacas que entram, cordas */}
      <G p={bc}>
        <Box s={[1.3, 0.8, 0.9]} c={NEW.s3} o={{ emissive: "#ffcf3a", ei: 0.18 + 0.25 * (t > LIFT0 ? 1 : pulse(t, T.tonelada - 0.1, T.tonelada + 0.8)) }} />
        {pegs.map((g, k) => { const r = holeR(t, k), hl = t > holeT(k) && t < holeT(k) + 0.9 ? 1 - prog(t, holeT(k), holeT(k) + 0.9) : 0; return r > 0.004 ? <G key={k}>
          <Cyl rt={r} h={0.05} p={[g.x, 0.02, 0.451]} r={[PI / 2, 0, 0]} c="#2a2014" cast={false} seg={10} />
          {hl > 0 ? <Cyl rt={r + 0.07} h={0.03} p={[g.x, 0.02, 0.448]} r={[PI / 2, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: hl }} cast={false} seg={12} /> : null}
        </G> : null; })}
        {pegs.map((g, k) => g.u > 0.001 ? <Cyl key={`p${k}`} rt={0.055} h={0.42} p={[g.x, 0.02, 0.45 + lerp(0.75, 0.12, g.u)]} r={[PI / 2, 0, 0]} c={WOOD} seg={7} /> : null)}
      </G>
      {tie > 0.01 ? pegs.map((g, k) => <Pipe key={k} a={[bc[0] + g.x, bc[1] + 0.02, bc[2] + 0.75]} b={[lerp(bc[0] + g.x, hook[0], tie), lerp(bc[1] + 0.02, hook[1], tie), lerp(bc[2] + 0.75, hook[2], tie)]} rad={0.045} c={ROPE} cast={false} />) : null}
      {tie > 0.99 ? <>
        <Pipe a={hook} b={[PULLEY[0], PULLEY[1], PULLEY[2]]} rad={0.05} c={ROPE} cast={false} />
        <Pipe a={[PULLEY[0], PULLEY[1] - 0.3, PULLEY[2] + 0.2]} b={TEAM_ROPE} rad={0.05} c={ROPE} cast={false} />
      </> : null}
      <Crowd list={team} t={t} c={KH3} />
      {[-0.38, 0.38].map((x, k) => <Puffs key={k} t={t} p={[BLK[0] + x, BLK[1], BLK[2] + 0.52]} n={5} period={0.35} rise={0.35} size={0.07} c="#efe3c4" drift={[0.3 * (k ? 1 : -1), 0.1, 0.4]} on={t > holeT(k) - 0.05 && t < holeT(k) + 0.5 ? 1 : 0} />)}
      <Puffs t={t} p={[BLK[0], BLK[1] - 0.4, BLK[2]]} n={6} period={0.5} rise={0.4} size={0.4} c="#efe3c4" drift={[0, 0, 0.6]} on={t > LIFT0 && t < LIFT0 + 0.6 ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- WALL: o muro de hoje, com os buracos ainda lá
const WB = Array.from({ length: 24 }, (_, i) => ({ c: i % 4, r: Math.floor(i / 4) }));
const Wall: React.FC<{ t: number }> = ({ t }) => {
  const holes = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), mat("#2a2620"), 48), d = new THREE.Object3D();
    WB.forEach((b, i) => [-0.45, 0.45].forEach((dx, k) => { d.position.set(-2.7 + b.c * 1.8 + dx + (b.r % 2) * 0.3, 0.42 + b.r * 0.8 + 0.08, 0.53); d.rotation.set(PI / 2, 0, 0); d.updateMatrix(); im.setMatrixAt(i * 2 + k, d.matrix); }));
    im.castShadow = false; return im;
  }, []);
  if (t < C7 || t >= X12) return null;
  const hl = pulse(t, T.estosAg - 0.05, X12);
  holes.material = mat(hl > 0 ? "#ffcf3a" : "#2a2620", hl > 0 ? { emissive: "#ffb000", ei: 0.7 * hl } : {});
  return (
    <G p={WALL0}>
      {WB.map((b, i) => <Box key={i} s={[1.76, 0.78, 1.0]} p={[-2.7 + b.c * 1.8 + (b.r % 2) * 0.3, 0.42 + b.r * 0.8, 0]} c={[OLD.s1, OLD.s2, OLD.s3, "#a39c82"][(i * 7) % 4]} />)}
      <primitive object={holes} />
      {Array.from({ length: 12 }, (_, i) => <Box key={i} s={[lerp(0.3, 0.8, rnd(i + 1)), lerp(0.2, 0.45, rnd(i + 2)), 0.02]} p={[lerp(-3.2, 3.4, rnd(i + 3)), lerp(0.3, 4.6, rnd(i + 4)), 0.51]} c={i % 2 ? "#6e7a5a" : "#58604a"} cast={false} />)}
      <G p={[0.6, 2.42, 0.52]}><Box s={[1.2, 0.6, 0.04]} c="#c9c2a6" cast={false} /><Sph rad={0.1} p={[0, 0.14, 0.03]} c="#5a5444" ws={8} hs={6} cast={false} /><Box s={[0.18, 0.3, 0.03]} p={[0, -0.1, 0.03]} c="#5a5444" cast={false} /></G>
      <Cone rad={0.4} h={0.8} seg={5} p={[-1.8, 5.2, 0.1]} c="#4f9e34" /><Cone rad={0.3} h={0.6} seg={5} p={[2.4, 5.1, 0.2]} c="#3f8a2c" />
    </G>
  );
};

// ---------------------------------------------------------------- monges, bandeira, castelo de areia
const monkP = (t: number, i: number): V3 => { const z = MO_OUT - 0.6 - 1.6 * (t - X12) + i * 1.25; return [i % 2 ? 0.55 : -0.55, z > MO_OUT + 0.3 ? 0 : 0.4, z]; };
const Monks: React.FC<{ t: number }> = ({ t }) => {
  if (t < X12 || t >= X13) return null;
  const list = [0, 1, 2, 3, 4].map((i) => ({ p: monkP(t, i), yaw: PI, pose: "walk" as PoseName, ph: i * 0.31 }));
  return <Crowd list={list} t={t} c={MONK} />;
};
export const FLAG0: V3 = [-4.5, 0, 38.5];
const Flag: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = 300; cv.height = 200; const g = cv.getContext("2d")!;
    g.fillStyle = "#032ea1"; g.fillRect(0, 0, 300, 200); g.fillStyle = "#e00025"; g.fillRect(0, 50, 300, 100);
    g.fillStyle = "#ffffff"; g.strokeStyle = "#1a1a1a"; g.lineWidth = 2;
    const rect = (x: number, y: number, w: number, h: number) => { g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h); };
    rect(86, 132, 128, 10); rect(98, 120, 104, 12); rect(110, 108, 80, 12);
    for (const [cx, top, w] of [[150, 62, 24], [121, 80, 17], [179, 80, 17]] as [number, number, number][]) {
      g.beginPath(); g.moveTo(cx - w / 2, 108); g.lineTo(cx - w / 2, top + 16); g.quadraticCurveTo(cx - w / 2, top, cx, top - 10); g.quadraticCurveTo(cx + w / 2, top, cx + w / 2, top + 16); g.lineTo(cx + w / 2, 108); g.closePath(); g.fill(); g.stroke();
    }
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  }, []);
  const geo = useMemo(() => new THREE.PlaneGeometry(5.1, 3.4, 26, 6), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.85 }), [tex]);
  if (t < X12) return null;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], u = (x + 2.55) / 5.1; pos.setZ(i, 0.42 * u * Math.sin(x * 1.6 - t * 7.5 + y * 0.3)); pos.setY(i, y - 0.12 * u * u); }
  pos.needsUpdate = true; geo.computeVertexNormals();
  return (
    <G p={FLAG0}>
      <Cyl rt={0.08} h={8.4} p={[0, 4.2, 0]} c="#d8d8d8" o={{ metal: 0.3, rough: 0.4 }} />
      <Sph rad={0.16} p={[0, 8.45, 0]} c="#ffd400" />
      <mesh geometry={geo} material={m} position={[2.62, 6.5, 0]} castShadow />
    </G>
  );
};
export const CASTLE0: V3 = [5.2, 0, 37.3];
const Castle: React.FC<{ t: number }> = ({ t }) => {
  if (t < X13) return null;
  const s = 0.06, mo = MO_OUT * s, mi = MO_IN * s;
  return (
    <G p={CASTLE0}>
      <G sc={s}><Temple b={FULL} pal={SANDC} /></G>
      {[0, PI / 2, PI, -PI / 2].map((yaw) => { const [x, z] = rotY(0, (mo + mi) / 2, yaw); return <Box key={yaw} s={[2 * mo, 0.05, mo - mi]} p={[x, 0.03, z]} r={[0, yaw, 0]} c={WATER} o={{ rough: 0.3 }} cast={false} />; })}
      {[0, PI / 2, PI, -PI / 2].map((yaw) => { const [x, z] = rotY(0, mo + 0.12, yaw); return <Box key={`r${yaw}`} s={[2 * mo + 0.5, 0.14, 0.24]} p={[x, 0.07, z]} r={[0, yaw, 0]} c="#d9bf82" />; })}
      <Box s={[0.22, 0.06, mo - mi + 0.2]} p={[0, 0.05, (mo + mi) / 2]} c={SANDC.s2} />
      <Puffs t={t} p={[1.25, 1.1, 0.4]} n={7} period={0.4} rise={-0.9} size={0.12} c="#e8d29a" drift={[-0.2, 0, -0.1]} on={t > T.manda ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- árvores e palmeiras
const TREE_SPOTS: V3[] = (() => { const L: V3[] = []; for (let i = 0; L.length < 34 && i < 600; i++) { const x = lerp(-95, 95, rnd(i * 13 + 1)), z = lerp(-120, 95, rnd(i * 13 + 2)); if (!busy(x, z) && Math.hypot(x, z) > 40) L.push([x, 0, z]); } return L; })();
const PALM_SPOTS: V3[] = [[-55, 0, -40], [-54, 0, -6], [-44.6, 0, -55.5], [-37.6, 0, -68.7], [-25.8, 0, -90.8], [-36, 0, -9], [-30, 0, 39], [30, 0, 40], [-40, 0, 42], [16, 0, 44], [-17, 0, 44], [44, 0, -24], [-18, 0, 55], [24, 0, 54]];
const IN_TREES: V3[] = [[-18, 0, 18], [18, 0, 18], [-19, 0, -16], [19, 0, -17], [-20, 0, 2], [20, 0, -3], [-8, 0, -20], [9, 0, -20], [-15, 0, 21], [15, 0, 21]];
const Flora: React.FC<{ t: number }> = ({ t }) => {
  const j = jungle(t), late = t >= X12;
  return (
    <G>
      <G>{TREE_SPOTS.map((p, i) => <G key={i} p={p} sc={(0.8 + 0.7 * rnd(i + 40)) * (1 + 0.5 * j)}><Trees spots={[[0, 0, 0]]} c={i % 2 ? ["#3f9a2c", "#58b83a"] : ["#4a8a2a", "#62a83c"]} /></G>)}</G>
      <Palms spots={PALM_SPOTS} t={t} />
      {late ? <G>{IN_TREES.map((p, i) => <G key={i} p={p} sc={Math.max(0.001, 0.3 + 0.9 * j)}><Trees spots={[[0, 0, 0]]} /></G>)}</G> : null}
    </G>
  );
};

/** «casi doscientos metros de ancho»: a seta de largura atravessando o fosso do lado sul */
const Span: React.FC<{ t: number }> = ({ t }) => {
  const u = t >= X6 && t < C4 ? ease(t, T.doscientos - 0.2, T.doscientos + 0.3) : 0; if (u <= 0.01) return null;
  const z0 = MO_IN + 0.3, z1 = MO_OUT - 0.3, zm = (z0 + z1) / 2, half = ((z1 - z0) / 2) * u;
  return (
    <G p={[-8, 1.4, zm]}>
      <Box s={[0.5, 0.3, 2 * half]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.5 }} cast={false} />
      <Cone rad={0.9} h={1.6} seg={4} p={[0, 0, zm - zm + half + 0.6]} r={[PI / 2, 0, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.5 }} cast={false} />
      <Cone rad={0.9} h={1.6} seg={4} p={[0, 0, -half - 0.6]} r={[-PI / 2, 0, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.5 }} cast={false} />
    </G>
  );
};
/** nuvens mais rápidas no «siglo tras siglo» (o tempo passando) */
const cloudT = (t: number) => t + 160 * ease(t, T.siglo - 0.5, X13 - 0.1);
export const World: React.FC<{ t: number }> = ({ t }) => {
  const b = buildAt(t), pal = palAge(ageAt(t)), m = moatAt(t), g = ghostRise(t);
  return (
    <>
      <Sky top="#2f8cf0" mid="#7cc2ff" low="#eaf2f8" />
      <Clouds t={cloudT(t)} y={44} n={11} />
      <Ground t={t} />
      <Moat t={t} />
      <Canal t={t} />
      <River />
      <Kulen t={t} />
      <Temple b={b} pal={pal} />
      <Enclosure g={b.wall} pal={pal} />
      {!m.covered ? <Causeway pal={pal} /> : null}
      {g > 0.01 ? <G sc={[1, g, 1]}><Temple b={FULL} pal={GHOST_PAL} /></G> : null}
      <Meru t={t} />
      <OpenBuild t={t} /><OpenMoat t={t} /><OpenScale t={t} />
      <Site t={t} /><King t={t} /><Dock t={t} /><RaftRun t={t} />
      <Sec t={t} /><Lat t={t} /><Core t={t} /><Lift t={t} /><Wall t={t} />
      <Monks t={t} /><Flag t={t} /><Castle t={t} />
      <Span t={t} />
      {t >= X12 && t < X13 ? <Birds t={t} c={[0, H3 + 9, 0]} n={6} r={9} t0={X12} /> : null}
      <Flora t={t} />
    </>
  );
};
void outBack;
