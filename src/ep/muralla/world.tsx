// Mundo do E6: a Grande Muralha de brinquedo. Serra ao norte (crista z≈-9..-16, y 0..11) com a muralha Ming e torres
// sobre a crista; no leste ela desce à planície e entra no mar (passo de Shanhai, x 60..76). Planície de loess na frente
// (z 6..40): o muro de taipa (x -26..-8, z 16) com a fôrma de tábuas; fornos e pilhas de tijolo (x≈6); mesa do selo (x 11);
// caldeirão de arroz (x 17); painel de juntas (x 22).
// v3 (crítico 13/11): taipa vista de perto (maços que batem nos «thud», terra que baixa, tábuas que sobem); arroz despejado
// na cal e mexido; mensageiro galopando; torres que acendem em fila com noite; o general sozinho abre o portão.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Costume, Pose, Worker, poseOf } from "../../toy/worker";
import { Horse } from "../../toy/horse";
import { CUTS, FAST0, HOP, HOP0, NIGHT, RAM1, RAM2, T, WINS, XC } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.china - 0.12;
/** ⏪ no «China»: a muralha encolhe de volta para dentro da serra (o tempo voltando) */
const unbuild = (t: number) => 1 - ease(t, T.china - 0.12, T.china + 1.0);
const EARTH = "#c9a066", EARTH2 = "#b08650", LOOSE_C = "#e6cc96", BRICK = "#8d8f93", BRICK2 = "#7b7d82", MORT = "#e4e0d4", WOOD = "#8a5a32", KILN = "#a0573a";
const GROUND: GroundPal = { base: "#a9b95e", patch: ["#c2ad6c", "#9fb257", "#b8b46a"], blade: "#7f9a3e", x: [-90, 80], z: [0, 50], nBlades: 300 };
const SOLDIER: Costume = { ...COSTUMES.general, kilt: "#8a2a1e" };
const MANCHU: Costume = { ...COSTUMES.general, top: "#2a3a5a", kilt: "#1c2a44", hatC: "#3a3a3a" };
const lerpC = (a: string, b: string, u: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.round(clamp(u) * 10) / 10).getHexString();
/** noite das torres (0..1): entra e sai em 1,5 s; a luz nunca desce abaixo de ~0,62 (episode.LIGHT) */
export const nightK = (t: number) => ease(t, NIGHT[0], NIGHT[1]) * (1 - ease(t, NIGHT[2], NIGHT[3]));

// ---------------------------------------------------------------- serra: polilinha da crista; a muralha anda nela
export const CREST: V3[] = [[-90, 2, -9], [-72, 7, -13], [-56, 4.5, -10], [-40, 9.5, -15], [-24, 6.5, -11], [-8, 11, -16], [8, 7.5, -12], [24, 10, -15], [40, 6, -11], [52, 2.5, -10], [60, 0, -10], [76, 0, -10]];
export const crestAt = (x: number): [number, number] => {
  for (let i = 0; i < CREST.length - 1; i++) { const a = CREST[i], b = CREST[i + 1]; if (x <= b[0]) { const u = clamp((x - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; } }
  const l = CREST[CREST.length - 1]; return [l[1], l[2]];
};
const WH = 2.6, WW = 2.4;
/** ponto no caminho de ronda (topo da muralha), do lado da planície */
export const wallTop = (x: number, side = 0.45): V3 => { const [y, z] = crestAt(x); return [x, y + WH - 0.5, z + side]; };
export const reliefH = (x: number, z: number) => { const [y, zc] = crestAt(x), d = Math.abs(z - zc), W = z < zc ? 30 : 22; return y * Math.pow(Math.max(0, 1 - d / W), 1.4); };
const Relief: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 110, 160, 88), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, reliefH(pos.getX(i), -pos.getY(i) - 15) - 0.06);
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <G>
      <mesh geometry={geo} rotation={[-PI / 2, 0, 0]} position={[0, 0, -15]} receiveShadow castShadow material={mat("#6aa244", { flat: true })} />
      {[[-70, -62, 22, 26], [-30, -70, 26, 30], [10, -66, 24, 24], [46, -64, 22, 28], [-100, -40, 20, 22]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c={i % 2 ? "#7fae6a" : "#8bb87a"} o={{ flat: true }} cast={false} />)}
      <mesh position={[104, 0.05, -10]} rotation={[-PI / 2, 0, 0]} material={mat("#3f8fd0", { rough: 0.3 })}><planeGeometry args={[70, 160]} /></mesh>
      <mesh position={[69.5, 0.03, -10]} rotation={[-PI / 2, 0, 0]} material={mat("#e9d9a6")}><planeGeometry args={[3, 160]} /></mesh>
    </G>
  );
};
const Forest: React.FC = () => {
  const spots = useMemo(() => Array.from({ length: 46 }, (_, i) => { const x = lerp(-80, 54, rnd(i * 3 + 1)), [, zc] = crestAt(x), z = zc + 5 + rnd(i * 3 + 2) * 9; return [x, reliefH(x, z) - 0.1, z] as V3; }).filter((q) => Math.abs(q[0] + 17) > 11 || q[2] < 8), []);
  return <Trees spots={spots} c={["#2f7d3a", "#3f9446"]} />;
};

// ---------------------------------------------------------------- muralha Ming, torres na crista, bandeiras, ronda
const Seg: React.FC<{ a: V3; b: V3; c: string; k?: number }> = ({ a, b, c, k = 1 }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], hz = Math.hypot(dx, dz), L = Math.hypot(hz, dy) * k;
  if (L < 0.05) return null;
  const n = Math.floor(L / 1.3);
  return (
    <G p={a} r={[0, -Math.atan2(dz, dx), 0]}><G r={[0, 0, Math.atan2(dy, hz)]}>
      <Box s={[L + 0.3, WH, WW]} p={[L / 2, WH / 2 - 0.5, 0]} c={c} />
      {Array.from({ length: n }, (_, i) => <Box key={i} s={[0.7, 0.6, 0.35]} p={[0.65 + i * 1.3, WH - 0.2, -WW / 2 + 0.17]} c={c} />)}
      <Box s={[L + 0.3, 0.35, 0.3]} p={[L / 2, WH - 0.33, WW / 2 - 0.15]} c={c} />
    </G></G>
  );
};
const GATE_X = 64;
const SEGS: [V3, V3][] = (() => { const out: [V3, V3][] = []; for (let i = 0; i < CREST.length - 2; i++) out.push([CREST[i], CREST[i + 1]]); out.push([[60, 0, -10], [GATE_X - 3.2, 0, -10]], [[GATE_X + 3.2, 0, -10], [76, 0, -10]]); return out; })();
const ridgeK = (t: number) => (built(t) ? 1 : t < T.ming - 0.2 ? unbuild(t) : ease(t, T.ming - 0.2, T.p2 + 0.4));
const GreatWall: React.FC<{ t: number }> = ({ t }) => {
  const k = ridgeK(t); if (k <= 0.005) return null;
  const n = SEGS.length, f = k * n;
  return <G>{SEGS.map(([a, b], i) => <Seg key={i} a={a} b={b} c={i % 2 ? BRICK : BRICK2} k={clamp(f - i)} />)}</G>;
};
/** bandeira de tecido em 4 gomos que ondulam */
const FlagSeg: React.FC<{ k: number; t: number; c: string; ph: number }> = ({ k, t, c, ph }) => (k >= 4 ? null : (
  <G r={[0, Math.sin(t * 7 + ph - k * 0.9) * 0.32, 0]}>
    <Box s={[0.42, 0.72, 0.05]} p={[0.21, 0, 0]} c={c} cast={false} />
    <G p={[0.42, 0, 0]}><FlagSeg k={k + 1} t={t} c={c} ph={ph} /></G>
  </G>));
const Flag: React.FC<{ t: number; c: string; ph: number; h?: number }> = ({ t, c, ph, h = 2.6 }) => (
  <G><Cyl rt={0.06} h={h} p={[0, h / 2, 0]} c="#3a2a1a" seg={5} /><G p={[0, h - 0.42, 0]}><FlagSeg k={0} t={t} c={c} ph={ph} /></G></G>
);
// torres: nos vértices da crista e no meio de cada lance (19), de leste para oeste
const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
export const TOWERS: V3[] = [...CREST.slice(1, 10), ...CREST.slice(0, 10).map((a, i) => mid(a, CREST[i + 1]))].sort((a, b) => b[0] - a[0]);
const PAVILION = new Set([-56, -8, 40]);
const CAN: V3 = [8, 7.5, -12]; // a torre do canhão (o fogo dela fica no canto de trás)
const CHAIN = TOWERS.filter((p) => p[0] < 4); // o aviso que salta: do centro (x 0) para o oeste
/** fumaça de dia e fogo de noite nas torres perto do canhão (x 8..56); a fila do oeste acende no «salta de torre en torre» */
const smokeAt = (x: number) => T.humo - 0.95 + clamp((40 - x) / 8, 0, 5) * 0.25;
const fireAt = (x: number) => { const r = CHAIN.findIndex((p) => p[0] === x); return r >= 0 ? HOP0 + r * HOP : T.fuego - 0.1 + clamp((40 - x) / 8, 0, 5) * 0.3; };
const towerK = (t: number, x: number) => (built(t) ? 1 : t < 40 ? unbuild(t) : ease(t, T.torres - 0.3 + (56 - x) / 137 * 1.2, T.torres + 0.3 + (56 - x) / 137 * 1.2));
const Tower: React.FC<{ p: V3; k: number; t: number; i: number }> = ({ p, k, t, i }) => {
  if (k <= 0.01) return null;
  const on = t > T.humo - 1.0 && t < T.giro, f0 = fireAt(p[0]), sm0 = smokeAt(p[0]);
  const fire = on ? ease(t, f0, f0 + 0.3) : 0, smoke = on && p[0] >= 4 ? ease(t, sm0, sm0 + 0.4) * (1 - 0.7 * fire) : 0;
  const fl = on ? ease(t, f0, f0 + 0.1) * (1 - ease(t, f0 + 0.2, f0 + 0.9)) : 0, n = nightK(t);
  const M: V3[] = []; for (const s of [-1, 1]) for (const q of [-1.5, 0, 1.5]) M.push([q, 0, s * 2.0], [s * 2.0, 0, q]);
  return (
    <G p={[p[0], p[1] - 0.6, p[2]]} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[4.2, 5.2, 4.2]} p={[0, 2.6, 0]} c={BRICK2} />
      <Box s={[0.8, 1.3, 0.12]} p={[0, 3.6, 2.12]} c="#3a3532" cast={false} /><Box s={[0.12, 1.3, 0.8]} p={[2.12, 3.6, 0]} c="#3a3532" cast={false} />
      {M.map((m, j) => <Box key={j} s={[0.7, 0.6, 0.7]} p={[m[0], 5.5, m[2]]} c={BRICK2} />)}
      {PAVILION.has(p[0]) ? <G p={[0, 5.2, 0]}>{[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], j) => <Cyl key={j} rt={0.1} h={1.4} p={[a * 1.1, 0.7, b * 1.1]} c="#b23a2a" seg={6} />)}<Cone rad={2.3} h={1.1} seg={4} p={[0, 1.9, 0]} r={[0, PI / 4, 0]} c="#3f4a4a" /></G> : null}
      <G p={[-1.7, 5.6, -1.7]}><Flag t={t} c={i % 2 ? "#d8352a" : "#f2c14e"} ph={i * 1.7} /></G>
      <G p={p[0] === CAN[0] ? [1.0, 5.4, -1.3] : [0, 5.4, 0]} vis={fire > 0.01}>
        <Cone rad={1.1 * fire} h={2.8 * fire * (1 + 0.15 * Math.sin(t * 17 + i))} seg={6} p={[0, 1.4, 0]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 1.8 }} cast={false} />
        <Cone rad={0.6 * fire} h={1.7 * fire} seg={6} p={[0, 0.9, 0]} c="#ffe066" o={{ emissive: "#ffd000", ei: 1.8 }} cast={false} />
        <Sph rad={1.5} p={[0, 1.2, 0]} sc={0.6 + 0.4 * fire} c="#ffb040" cast={false} recv={false} o={{ emissive: "#ff9a20", ei: 1.4, opacity: 0.18 * n, depthWrite: false }} ws={10} hs={8} vis={n > 0.05} />
      </G>
      {fl > 0.01 ? <Sph rad={1} p={[0, 6.6, 0]} sc={0.6 + 1.5 * fl} c="#fff0b0" cast={false} recv={false} o={{ emissive: "#ffd060", ei: 2, opacity: 0.4 * fl, depthWrite: false }} ws={10} hs={8} /> : null}
      <Puffs t={t} p={[0, 5.8, 0]} n={12} period={1.8} rise={10} size={1.3} c="#6b6b6b" on={smoke} drift={[1.2, 0, -0.6]} o={i * 0.13} />
    </G>
  );
};
/** a faísca que salta de uma torre para a próxima (fila do oeste) */
const Sparks: React.FC<{ t: number }> = ({ t }) => {
  if (t < HOP0 - HOP || t > HOP0 + CHAIN.length * HOP) return null;
  const top = (p: V3): V3 => [p[0], p[1] + 6.4, p[2]];
  return <G>{CHAIN.map((p, r) => { const a = top(r ? CHAIN[r - 1] : [8, 7.5, -12]), b = top(p), s = HOP0 + r * HOP, u = prog(t, s - HOP, s);
    if (u <= 0 || u >= 1) return null;
    return <G key={r}>{[0, 0.12, 0.24].map((d, j) => { const v = clamp(u - d); return <Sph key={j} rad={0.55 - j * 0.14} p={[lerp(a[0], b[0], v), lerp(a[1], b[1], v) + 3 * Math.sin(PI * v), lerp(a[2], b[2], v)]} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffb020", ei: 2.2 }} ws={8} hs={6} />; })}</G>; })}</G>;
};
/** ronda: soldados andando no caminho de ronda (só com a muralha de pé, no gancho) */
const Patrol: React.FC<{ t: number }> = ({ t }) => {
  if (!built(t)) return null;
  return <G>{[-58, -47, -35, -29, -17, -3, 12, 19, 30, 44].map((x0, i) => {
    const dir = i % 2 ? -1 : 1, x = x0 + dir * 1.5 * t, p = wallTop(x, 0.4), q = wallTop(x + dir * 0.6, 0.4);
    return <Worker key={i} p={p} yaw={Math.atan2(q[0] - p[0], q[2] - p[2])} pose={poseOf("walk", t + i * 0.37)} t={t + i} c={SOLDIER} scale={0.85} mustache={i % 3 === 0} />;
  })}</G>;
};
/** canhão na torre do meio (x 8): um tiro por toque, com fumaça */
const Cannon: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p4 || t > T.giro) return null;
  const shots = [0, 1, 2].map((k) => T.canon + 0.25 + k * 0.5), fl = (s: number) => ease(t, s, s + 0.25) * (1 - ease(t, s + 0.35, s + 1.4));
  const rec = shots.reduce((m, s) => Math.max(m, fl(s)), 0);
  return (
    <G p={[CAN[0] + 1.2, CAN[1] + 5.0, CAN[2] + 2.4]} r={[0, 2.2, 0]}>
      <Box s={[1.2, 0.4, 0.9]} p={[0, 0.2, 0]} c={WOOD} />
      <Cyl rt={0.22} rb={0.3} h={1.8} p={[0, 0.6, 0.3 - rec * 0.3]} r={[PI / 2 - 0.2, 0, 0]} c="#3a3a3a" o={{ metal: 0.4, rough: 0.5 }} />
      {shots.map((s, k) => { const u = fl(s); return u > 0.01 ? <Sph key={k} rad={0.9} p={[0, 0.9 + u * 0.6, 1.6 + u * 1.4]} sc={0.4 + u * 1.4} c={k === 0 ? "#f2f2f2" : "#e6e6e6"} cast={false} o={{ emissive: "#ffb060", ei: 0.4 + 1.2 * (1 - u) }} ws={8} hs={6} /> : null; })}
    </G>
  );
};
const Night: React.FC<{ t: number }> = ({ t }) => {
  const n = nightK(t); if (n <= 0.01) return null;
  return (
    <G>
      <mesh><sphereGeometry args={[560, 24, 16]} /><meshBasicMaterial color="#1a2a5a" side={1} transparent opacity={0.66 * n} fog={false} depthWrite={false} /></mesh>
      {Array.from({ length: 40 }, (_, i) => <Sph key={i} rad={1.2} p={[lerp(-300, 300, rnd(i)), lerp(80, 260, rnd(i + 3)), -420 + rnd(i + 7) * 60]} c="#ffffff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 1.5 * n, opacity: n, depthWrite: false }} ws={4} hs={3} />)}
      <Sph rad={14} p={[-120, 150, -380]} c="#f4f1dc" cast={false} recv={false} o={{ emissive: "#fff8d8", ei: 1.2, opacity: n, depthWrite: false }} ws={14} hs={10} />
    </G>
  );
};

// ---------------------------------------------------------------- planície: taipa na fôrma, chuva que desmancha, revestimento de tijolo
export const EW = { x0: -26, x1: -8, z: 16 };
const NL = 6, LH = 0.42, LOOSE = 0.85, FORM_H = 0.95;
type Layer = { p0: number; p1: number; hits: number[] };
/** cada camada: carga de terra solta (p0..p1) e os golpes que a compactam de 0,85 para 0,42 */
const LAYERS: Layer[] = [
  { p0: T.tierra, p1: T.tierra + 0.8, hits: RAM1 },
  { p0: T.repiten, p1: T.repiten + 0.55, hits: RAM2 },
  ...[0, 1, 2, 3].map((i): Layer => { const s = FAST0 + i * 0.4; return { p0: s, p1: s + 0.16, hits: [s + 0.28] }; }),
];
const HITS = LAYERS.flatMap((l) => l.hits);
const RAISE = [T.suben, ...[0, 1, 2, 3].map((i) => FAST0 + i * 0.4 - 0.16)];
/** quantas camadas já começaram (contador CAPAS do painel) */
export const capas = (t: number) => Math.max(1, LAYERS.filter((l) => t >= l.p0).length);
const packed = (l: Layer, t: number) => l.hits.reduce((s, b) => s + ease(t, b - 0.03, b + 0.06), 0) / l.hits.length;
const layerH = (k: number, t: number) => { if (t >= T.b2) return LH; const l = LAYERS[k], u = ease(t, l.p0, l.p1); return u <= 0 ? 0 : u * lerp(LOOSE, LH, packed(l, t)); };
/** base das tábuas: em cada «suben» elas saem para cima e voltam uma camada acima (arco visível) */
const formBase = (t: number) => RAISE.reduce((s, r, j) => { const d = j ? 0.2 : 0.55, u = prog(t, r, r + d); return s + LH * sstep(u) + (j ? 0.35 : 1.0) * Math.sin(PI * u); }, 0);
/** altura do maço acima da terra: sobe e desce em cada golpe, encosta na terra no instante do «thud» */
const lift = (t: number) => {
  for (let i = 0; i < HITS.length; i++) {
    const b = HITS[i], prev = i ? HITS[i - 1] : b - 0.7, w = Math.min(0.55, b - prev - 0.04);
    if (t > b - w && t <= b) { const u = (t - (b - w)) / w; return 0.85 * (u < 0.62 ? sstep(u / 0.62) : 1 - Math.pow((u - 0.62) / 0.38, 2)); }
  }
  return 0;
};
const ramPose = (l: number): Pose => ({ l: { rx: -1.0 - l * 0.75, rz: 0.32, el: -0.5 }, r: { rx: -1.0 - l * 0.75, rz: -0.32, el: -0.5 }, hx: 0.12 - l * 0.15, hy: 0, hz: 0, lean: 0.14 - l * 0.08, hop: 0 });
const RAMMERS: [number, number][] = [[EW.x1 - 1.15, EW.z - 0.5], [EW.x1 - 1.15, EW.z + 0.5], [EW.x1 - 4.3, EW.z - 0.5], [EW.x1 - 4.3, EW.z + 0.5]];
const BASKETS = [EW.x1 - 2.7, EW.x1 - 6.0];
const pourK = (t: number) => Math.max(...[0, 1].map((k) => ease(t, LAYERS[k].p0 - 0.35, LAYERS[k].p0) * (1 - ease(t, LAYERS[k].p1, LAYERS[k].p1 + 0.3))));
const erode = (t: number) => (t < T.p1 ? 0 : ease(t, T.p1 + 0.4, T.siglo + 1.2)) * (1 - ease(t, T.ming, T.hornos));
const cladK = (t: number) => (t < T.ming ? 0 : ease(t, T.ming + 0.2, T.hornos + 0.4));
const EarthWall: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cajon - 0.15) return null;
  const L = EW.x1 - EW.x0, cx = (EW.x0 + EW.x1) / 2, e = erode(t), cl = cladK(t), building = t < CUTS[2];
  const hs = LAYERS.map((_, k) => layerH(k, t)), ys: number[] = [];
  let top = 0; for (const h of hs) { ys.push(top); top += h; }
  const cur = hs.reduce((m, h, k) => (h > 0.005 ? k : m), -1), pk = cur >= 0 ? packed(LAYERS[cur], t) : 1;
  const base = formBase(t), drop = ease(t, T.cajon - 0.1, T.cajon + 0.35), l = lift(t), pour = pourK(t);
  const hole = t > T.cae - 0.3 && t < T.b3 + 0.6, fall = ease(t, T.cae - 0.4, T.cae + 0.6);
  return (
    <G>
      {hs.map((h, k) => { if (h <= 0.005) return null; const pc = t >= T.b2 ? 1 : packed(LAYERS[k], t), hh = h * (1 - (k >= NL - 2 ? e * 0.35 : 0));
        return <Box key={k} s={[L, hh, 2.2 - (k >= NL - 1 ? e * 0.5 : 0)]} p={[cx, ys[k] + hh / 2, EW.z]} c={lerpC(LOOSE_C, k % 2 ? EARTH : EARTH2, pc)} />; })}
      {/* torrões da terra solta: achatam a cada golpe */}
      {building && cur >= 0 && pk < 0.98 ? Array.from({ length: 18 }, (_, i) => <Sph key={i} rad={0.24} p={[EW.x1 - 0.35 - rnd(i) * 7.5, ys[cur] + hs[cur], EW.z + (rnd(i + 9) - 0.5) * 1.8]} sc={[1, Math.max(0.05, 0.75 * (1 - pk)), 1]} c={LOOSE_C} ws={7} hs={5} cast={false} />) : null}
      {/* sulcos da chuva */}
      {e > 0.02 ? Array.from({ length: 9 }, (_, i) => <Box key={i} s={[0.18, top * 0.7 * e, 0.06]} p={[EW.x0 + 1 + i * 2, top - top * 0.35 * e, EW.z + 1.11]} c="#8a6236" cast={false} />) : null}
      {e > 0.02 ? Array.from({ length: 5 }, (_, i) => <Sph key={i} rad={1} p={[EW.x0 + 2 + i * 3.6, 0.05, EW.z + 1.6]} sc={[1.4 * e, 0.12, 0.7 * e]} c="#9c7444" cast={false} ws={10} hs={5} />) : null}
      {/* as duas tábuas paralelas (caem no lugar no «dos tablas»; sobem uma camada a cada «suben») */}
      {building && drop > 0.001 ? <G p={[cx, base + (1 - drop) * 3.5, EW.z]}>
        {[-1, 1].map((s) => <Box key={s} s={[L + 0.4, FORM_H, 0.16]} p={[0, FORM_H / 2, s * 1.18]} c={s > 0 ? WOOD : "#7a4e2a"} />)}
        {Array.from({ length: 7 }, (_, i) => [-1, 1].map((s) => <Box key={i * 2 + s} s={[0.16, FORM_H + 0.35, 0.16]} p={[-L / 2 + 0.6 + (i * (L - 1.2)) / 6, (FORM_H + 0.35) / 2 - 0.2, s * 1.36]} c="#6b4423" />))}
      </G> : null}
      {/* os quatro do maço, em cima da terra, batendo juntos; poeira a cada golpe */}
      {building && t > WINS[3] - 0.05 ? RAMMERS.map(([x, z], i) => (
        <G key={i}>
          <Worker p={[x, top, z]} yaw={PI / 2} pose={ramPose(l)} t={t} c={COSTUMES.ming} scale={0.85} mustache={i === 0} />
          <Cyl rt={0.05} h={1.9} p={[x + 0.45, top + l + 1.05, z]} c={WOOD} seg={6} />
          <Box s={[0.34, 0.26, 0.34]} p={[x + 0.45, top + l + 0.13, z]} c="#6f5f50" />
        </G>)) : null}
      {building && t > WINS[3] ? HITS.map((b, j) => { const u = prog(t, b, b + 0.4); if (u <= 0 || u >= 1) return null;
        return RAMMERS.map(([x, z], i) => <G key={j * 10 + i} p={[x + 0.45, top + 0.05, z]}>{[0, 1, 2, 3, 4].map((q) => { const a = q * 1.256 + i; return <Sph key={q} rad={0.17} p={[Math.cos(a) * (0.2 + 0.75 * u), 0.08 + 0.3 * u, Math.sin(a) * (0.2 + 0.75 * u)]} sc={Math.max(0.01, 1.3 * (1 - u))} c="#ecd3a2" cast={false} ws={6} hs={4} />; })}</G>); }) : null}
      {/* cestos de terra úmida: tombam por cima da tábua de trás e a terra cai entre as tábuas */}
      {building && t > CUTS[1] - 0.02 && t < T.repiten + 1.0 ? BASKETS.map((bx, i) => (
        <G key={i}>
          <G p={[bx, base + FORM_H + 0.35, EW.z - 1.3]} r={[1.25 * pour, 0, 0]}><Cyl rt={0.45} rb={0.32} h={0.5} p={[0, 0.1, 0]} c="#9a7040" seg={10} /><Cyl rt={0.4} h={0.05} p={[0, 0.34, 0]} c={LOOSE_C} seg={10} vis={pour < 0.9} /></G>
          {pour > 0.5 ? Array.from({ length: 7 }, (_, j) => { const u = fract(t * 2.4 + rnd(j + i * 7)), y0 = base + FORM_H + 0.6, y1 = top;
            return <Box key={j} s={[0.2, 0.18, 0.2]} p={[bx + (rnd(j + 1) - 0.5) * 0.7, lerp(y0, y1, u * u), lerp(EW.z - 1.15, EW.z - 0.4 + rnd(j + 2) * 1.0, u)]} r={[u * 3, j, 0]} c={LOOSE_C} cast={false} />; }) : null}
        </G>)) : null}
      {building && t > CUTS[1] - 0.02 ? <Worker p={[EW.x1 - 6.0, 0, EW.z - 2.3]} yaw={0} pose={poseOf(pour > 0.1 ? "pour" : t > T.apisonada ? "cheer" : "idle", t + 0.4)} t={t + 0.4} c={COSTUMES.ming} scale={1.05} mustache={false} /> : null}
      {/* revestimento Ming: casca de tijolo cinza que sobe por cima da taipa */}
      {cl > 0.01 ? <G>
        <Box s={[L + 0.4, (NL * LH + 0.3) * cl, 2.7]} p={[cx, ((NL * LH + 0.3) * cl) / 2, EW.z]} c={BRICK} />
        {Array.from({ length: Math.floor(L / 1.3) }, (_, i) => <Box key={i} s={[0.7, 0.55, 0.35]} p={[EW.x0 + 0.7 + i * 1.3, NL * LH + 0.55, EW.z - 1.15]} c={BRICK} vis={cl > 0.95} />)}
        {Array.from({ length: 7 }, (_, r) => <Box key={r} s={[L + 0.42, 0.04, 2.72]} p={[cx, 0.35 + r * 0.38, EW.z]} c="#a5a6a8" cast={false} vis={(0.35 + r * 0.38) < (NL * LH + 0.3) * cl} />)}
      </G> : null}
      {/* tijolos ruins: o trecho cai */}
      {hole ? <Box s={[3.2, 1.6, 0.1]} p={[EW.x1 - 5, 1.5, EW.z + 1.37]} c="#4a3a2a" cast={false} /> : null}
      {hole ? Array.from({ length: 14 }, (_, i) => { const u = clamp(fall * 1.3 - rnd(i) * 0.3); return <Box key={i} s={[0.55, 0.25, 0.3]} p={[EW.x1 - 6.4 + (i % 5) * 0.65 + u * (rnd(i + 2) - 0.3) * 1.5, lerp(1.0 + Math.floor(i / 5) * 0.5, 0.13 + (i % 3) * 0.2, u), EW.z + 1.4 + u * (0.6 + rnd(i + 5) * 1.6)]} r={[u * rnd(i) * 2, u * rnd(i + 1), u * rnd(i + 3) * 2]} c={i % 2 ? "#9a8f86" : "#b0a69a"} />; }) : null}
    </G>
  );
};
const Rain: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p1 - 0.2 && t < T.ming)) return null;
  return <G>{Array.from({ length: 80 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.04, 0.9, 0.04]} p={[lerp(EW.x0 - 6, EW.x1 + 6, rnd(i + 1)), 12 - u * 12, lerp(EW.z - 6, EW.z + 10, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
/** a equipe que chega à planície com as ferramentas («solo manos, herramientas y cabeza») */
export const crewX = (t: number) => 3.2 - 2.1 * (t - CUTS[0]);
const Crew: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[0] - 0.05 || t > XC.jinetes) return null;
  const x0 = crewX(t);
  return <G>{[[1.4, 23.0], [2.6, 25.4], [3.9, 23.7], [5.2, 25.9]].map(([dx, z], i) => {
    const p: V3 = [x0 + dx, 0, z];
    return (
      <G key={i}>
        <Worker p={p} yaw={-PI / 2 + 0.35} pose={poseOf("walk", t + i * 0.31)} t={t + i * 0.31} c={COSTUMES.ming} scale={1.0} mustache={i === 1} />
        {i % 2 === 0
          ? <G p={[p[0] + 0.1, 1.45, p[2] - 0.32]} r={[0, 0, -0.75]}><Cyl rt={0.045} h={2.0} p={[0, 0.75, 0]} c={WOOD} seg={6} /><Box s={[0.5, 0.08, 0.3]} p={[0.18, 1.72, 0]} c="#8f8f94" /></G>
          : <G p={[p[0], 2.2, p[2]]}><Cyl rt={0.42} rb={0.3} h={0.42} c="#9a7040" seg={10} /><Cyl rt={0.36} h={0.05} p={[0, 0.2, 0]} c={LOOSE_C} seg={10} /></G>}
      </G>);
  })}</G>;
};
/** monte de terra do canteiro e dois cavando (do «¿cómo levantas?» até as tábuas) */
const Diggers: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.b1 - 0.02 || t > CUTS[1] - 0.02) return null;
  return (
    <G>
      <Cone rad={1.5} h={1.2} seg={8} p={[-8.4, 0.55, 20.2]} c={EARTH2} o={{ flat: true }} />
      {[[-7.0, 21.0, -1.3], [-9.7, 21.5, 1.7]].map(([x, z, yaw], i) => <Worker key={i} p={[x, 0, z]} yaw={yaw} pose={poseOf("chisel", t + i * 0.45)} t={t + i * 0.45} c={COSTUMES.ming} scale={1.0} prop="hammer" mustache={i === 1} />)}
    </G>
  );
};
/** os fornos ao pé da serra, pilhas de tijolo */
const Kilns: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 0 : ease(t, T.ming - 0.4, T.hornos + 0.2); if (k <= 0.01) return null;
  const bad = t > T.p2 - 0.1 && t < T.b3;
  return (
    <G sc={[1, Math.max(0.01, k), 1]}>
      {[[-1, 10.5], [4, 10.0]].map(([x, z], i) => (
        <G key={i} p={[x, 0, z]}>
          <Sph rad={1.9} ps={0} pl={PI / 2} c={KILN} ws={14} hs={8} />
          <Box s={[0.9, 1.1, 0.4]} p={[0, 0.55, 1.75]} c="#2a1a12" cast={false} />
          <Box s={[0.6, 0.5, 0.1]} p={[0, 0.35, 1.96]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.4 }} cast={false} />
          <Cyl rt={0.35} h={1.4} p={[0.6, 2.2, -0.4]} c={KILN} seg={8} />
          <Puffs t={t} p={[0.6, 2.9, -0.4]} n={7} period={3} rise={7} size={0.9} c="#d8d8d8" o={i * 0.3} />
        </G>))}
      {Array.from({ length: 6 }, (_, i) => <G key={i} p={[-2.5 + (i % 3) * 1.6, 0, 14.2 + Math.floor(i / 3) * 1.4]}>{[0, 1, 2].map((r) => <Box key={r} s={[1.2, 0.3, 0.6]} p={[0, 0.16 + r * 0.31, 0]} r={[0, r % 2 ? 0.08 : 0, 0]} c={i === 4 && bad ? "#c26a4a" : BRICK} />)}</G>)}
      {bad ? <G p={[-0.9, 1.25, 15.6]}>{[0, 1].map((j) => <Box key={j} s={[0.06, 0.06, 0.9]} p={[0, 0.02, 0]} r={[0, j ? 0.8 : -0.8, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.2 }} cast={false} />)}</G> : null}
    </G>
  );
};
// caracteres gravados no tijolo, feitos de traços (não dependem de fonte): 六 年 山 工 — «ano seis», oficina da serra
type Stroke = [number, number, number, number, number?];
const GLYPHS: Stroke[][] = [
  [[0, 0.4, 0.12, 0.2], [0, 0.18, 0.9, 0.11], [-0.22, -0.2, 0.11, 0.48, -0.55], [0.22, -0.2, 0.11, 0.48, 0.55]],
  [[-0.22, 0.42, 0.3, 0.1, 0.6], [0.1, 0.36, 0.66, 0.1], [0.06, 0.1, 0.56, 0.1], [-0.24, -0.02, 0.1, 0.32], [0, -0.18, 0.95, 0.1], [0.08, -0.05, 0.11, 0.92]],
  [[0, 0.02, 0.12, 0.9], [-0.38, -0.12, 0.12, 0.52], [0.38, -0.12, 0.12, 0.52], [0, -0.4, 0.88, 0.12]],
  [[0, 0.38, 0.72, 0.11], [0, 0, 0.12, 0.76], [0, -0.4, 0.95, 0.11]],
];
export const STAMP = { x: 11.5, z: 18.5, y: 1.25 };
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.ming || t > T.p4) return null;
  const press = ease(t, T.grabado - 0.5, T.grabado - 0.1) * (1 - ease(t, T.grabado, T.grabado + 0.4)), mark = ease(t, T.grabado - 0.05, T.grabado + 0.3);
  return (
    <G p={[STAMP.x, 0, STAMP.z]}>
      <Box s={[3.6, 0.15, 2.2]} p={[0, 1.0, 0]} c={WOOD} />{[[-1.6, -0.9], [-1.6, 0.9], [1.6, -0.9], [1.6, 0.9]].map(([a, b], i) => <Box key={i} s={[0.15, 1.0, 0.15]} p={[a, 0.5, b]} c="#6b4423" />)}
      <Box s={[2.4, 0.7, 1.2]} p={[0, 1.43, 0]} c={BRICK} />
      <G p={[0, 1.43, 0.61]} vis={mark > 0.01}>
        <Box s={[1.9 * mark, 0.6 * mark, 0.03]} c="#5a5c60" cast={false} /><Box s={[1.8 * mark, 0.52 * mark, 0.035]} c="#c4c6ca" cast={false} />
        {GLYPHS.map((g, i) => <G key={i} p={[-0.66 + i * 0.44, 0, 0.025]} sc={[0.4, 0.42, 1]} vis={mark > 0.6}>{g.map(([x, y, w, h, r], j) => <Box key={j} s={[w, h, 0.03]} p={[x, y, 0]} r={[0, 0, r ?? 0]} c="#2a2c30" cast={false} />)}</G>)}
      </G>
      <G p={[0, 2.6 - press * 0.9, 0.62]}><Box s={[2.0, 0.4, 0.5]} c="#9a6a3a" /><Cyl rt={0.12} h={0.9} p={[0, 0.65, 0]} c={WOOD} seg={8} /></G>
    </G>
  );
};
/** painel de juntas: tijolos com argamassa; o gelo racha a cal; com arroz, as juntas fecham e aguentam água e gelo */
export const JOINT = { x: 22, z: 15 };
const Joints: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.ming || t > T.p4 + 0.3) return null;
  const fix = ease(t, T.dura, T.dura + 1.0), crack = ease(t, T.p3 + 0.2, T.hielo + 0.3) * (1 - fix);
  const test = t > T.aguanta - 0.2 && t < T.argamasa + 0.4, ice2 = ease(t, T.aguanta + 0.9, T.aguanta + 1.3);
  const rows = 6, cols = 4;
  return (
    <G p={[JOINT.x, 0, JOINT.z]}>
      <Box s={[5.2, 3.6, 0.9]} p={[0, 1.8, 0]} c={lerpC(MORT, "#f7f4ea", fix)} />
      {Array.from({ length: rows * cols }, (_, i) => { const r = Math.floor(i / cols), c = i % cols, off = r % 2 ? 0.6 : 0;
        return <Box key={i} s={[1.12, 0.5, 0.3]} p={[-1.8 + c * 1.22 + off - (r % 2 && c === cols - 1 ? 4.88 : 0), 0.35 + r * 0.58, 0.42]} c={(i * 7) % 5 ? BRICK : BRICK2} />; })}
      {crack > 0.02 ? [[-1.2, 1.2, 0.5], [0.4, 2.3, -0.6], [1.4, 0.9, 0.9], [-0.3, 3.0, 0.3]].map(([x, y, r], i) => <Box key={i} s={[1.3 * crack, 0.07, 0.05]} p={[x, y, 0.62]} r={[0, 0, r]} c="#1c1410" cast={false} />) : null}
      {crack > 0.02 || ice2 > 0.02 ? Array.from({ length: 9 }, (_, i) => <Cone key={i} rad={0.12} h={0.35 * Math.max(crack, ice2)} seg={4} p={[-2.2 + i * 0.55, 3.75, 0.2 + (i % 2) * 0.3]} c="#d8f0ff" o={{ emissive: "#bfe6ff", ei: 0.6 }} cast={false} />) : null}
      {test ? Array.from({ length: 24 }, (_, i) => { const u = fract(t * 1.9 + rnd(i)); return <Box key={i} s={[0.05, 0.4, 0.05]} p={[lerp(-2.5, 2.5, rnd(i + 1)), lerp(6, 0.3, u), 0.75 + rnd(i + 2) * 0.6]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; }) : null}
    </G>
  );
};
/** caldeirão de arroz glutinoso + cocho de cal: o balde despeja o arroz na cal e a pá mexe até virar argamassa */
export const POT = { x: 17, z: 18.5 };
export const TROUGH: V3 = [18.9, 0, 19.2];
const RicePot: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p3 || t > T.p4 + 0.3) return null;
  const k = ease(t, T.b4, T.arroz + 0.3), mix = ease(t, T.cal + 0.5, T.dura + 0.4);
  // balde: mergulha no caldeirão no «arroz», vai até o cocho e tomba no «mezclan con la cal»
  const go = ease(t, T.cal - 0.65, T.cal - 0.15), tip = ease(t, T.cal - 0.15, T.cal + 0.15) * (1 - ease(t, T.cal + 0.8, T.cal + 1.1));
  const bucket: V3 = [lerp(POT.x + 0.3, TROUGH[0] - 0.2, go), 1.75 + 0.35 * Math.sin(PI * go) - 0.25 * ease(t, T.arroz, T.arroz + 0.3) * (1 - go), lerp(POT.z, TROUGH[2] - 0.35, go)];
  const pouring = tip > 0.6 && t < T.cal + 0.85, stir = t > T.cal + 0.6 && t < T.argamasa, sa = 7.5 * (t - T.cal) - 1.6 * Math.max(0, t - T.dura) ** 1.5;
  const surf = 0.62;
  return (
    <G>
      <G p={[POT.x, 0, POT.z]} sc={[1, Math.max(0.01, k), 1]}>
        <Cyl rt={0.9} rb={0.7} h={1.1} p={[0, 0.85, 0]} c="#3a3a3a" seg={14} o={{ metal: 0.3 }} />
        <Box s={[1.4, 0.3, 1.4]} p={[0, 0.15, 0]} c="#5a4a3a" />
        <Box s={[0.5, 0.25, 0.1]} p={[0, 0.15, 0.72]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.4 }} cast={false} />
        {Array.from({ length: 16 }, (_, i) => <Sph key={i} rad={0.13} p={[(rnd(i) - 0.5) * 1.2, 1.38 + 0.08 * Math.sin(t * 7 + i * 2), (rnd(i + 4) - 0.5) * 1.2]} c="#fbfaf4" ws={6} hs={4} cast={false} />)}
        {Array.from({ length: 5 }, (_, i) => { const u = fract(t * 1.3 + rnd(i + 20)); return <Sph key={"b" + i} rad={0.12} p={[(rnd(i + 30) - 0.5) * 1.1, 1.42, (rnd(i + 40) - 0.5) * 1.1]} sc={[0.4 + u, 0.5 + u * 0.6, 0.4 + u]} c="#ffffff" o={{ opacity: 1 - u * 0.8, depthWrite: false }} cast={false} ws={6} hs={4} />; })}
        <Puffs t={t} p={[0, 1.5, 0]} n={7} period={2} rise={3} size={0.5} c="#ffffff" />
      </G>
      {/* cocho de cal */}
      <G p={TROUGH} sc={[1, Math.max(0.01, k), 1]}>
        <Box s={[2.2, 0.55, 1.3]} p={[0, 0.28, 0]} c={WOOD} />
        {[-1, 1].map((s) => <Box key={s} s={[2.2, 0.28, 0.1]} p={[0, 0.69, s * 0.62]} c={WOOD} />)}{[-1, 1].map((s) => <Box key={"x" + s} s={[0.1, 0.28, 1.3]} p={[s * 1.06, 0.69, 0]} c={WOOD} />)}
        <Box s={[2.0, 0.06, 1.1]} p={[0, surf - 0.02, 0]} c={lerpC("#fbfbf6", "#d9cfb2", mix)} cast={false} />
        <Cone rad={0.5} h={0.45} seg={8} p={[0.45, surf + 0.18, 0]} c="#fbfbf6" sc={[1, Math.max(0.01, 1 - mix), 1]} cast={false} />
        {/* redemoinho da mistura */}
        {stir ? [0, 1, 2].map((j) => <Box key={j} s={[0.7 - j * 0.15, 0.03, 0.06]} p={[Math.cos(sa + j * 2.1) * 0.35, surf + 0.03, Math.sin(sa + j * 2.1) * 0.25]} r={[0, -(sa + j * 2.1) - PI / 2, 0]} c="#bfb498" cast={false} />) : null}
        {mix > 0.05 ? Array.from({ length: 10 }, (_, i) => { const a = sa * 0.8 + i * 0.63; return <Sph key={i} rad={0.07} p={[Math.cos(a) * (0.2 + rnd(i) * 0.5), surf + 0.04, Math.sin(a) * (0.15 + rnd(i) * 0.35)]} c="#f6f2e2" cast={false} ws={5} hs={4} />; }) : null}
        {/* a pá */}
        {stir ? <G p={[Math.cos(sa) * 0.4, surf + 0.75, Math.sin(sa) * 0.28 - 0.25]} r={[-0.45, 0, Math.cos(sa) * 0.25]}><Cyl rt={0.05} h={1.6} c={WOOD} seg={6} /><Box s={[0.32, 0.4, 0.06]} p={[0, -0.85, 0]} c={WOOD} /></G> : null}
      </G>
      {/* o balde de arroz cozido e o fio que cai na cal */}
      {t > XC.c4 && t < T.cal + 1.2 ? <G p={bucket} r={[0, 0, -1.9 * tip]}><Cyl rt={0.36} rb={0.28} h={0.5} c="#7a5a3a" seg={10} /><Cyl rt={0.32} h={0.05} p={[0, 0.22, 0]} c="#f6f3e6" seg={10} vis={tip < 0.6} /></G> : null}
      {pouring ? <G>
        <Cyl rt={0.11} h={bucket[1] - surf} p={[bucket[0] + 0.45, (bucket[1] + surf) / 2, bucket[2]]} c="#f4f0de" o={{ opacity: 0.92 }} cast={false} seg={8} />
        {Array.from({ length: 6 }, (_, i) => { const u = fract(t * 3 + i / 6); return <Sph key={i} rad={0.13} p={[bucket[0] + 0.45 + (rnd(i) - 0.5) * 0.12, lerp(bucket[1], surf, u), bucket[2] + (rnd(i + 3) - 0.5) * 0.12]} c="#fbf8ec" cast={false} ws={6} hs={4} />; })}
        {Array.from({ length: 5 }, (_, i) => { const u = fract(t * 2.2 + i / 5); return <Sph key={"s" + i} rad={0.1} p={[bucket[0] + 0.45 + Math.cos(i * 1.3) * u * 0.6, surf + 0.05 + 0.25 * Math.sin(PI * u), bucket[2] + Math.sin(i * 1.3) * u * 0.45]} c="#f4f0de" cast={false} ws={5} hs={4} />; })}
      </G> : null}
    </G>
  );
};

// ---------------------------------------------------------------- cavaleiros: os do norte na planície, o mensageiro, os manchus no portão
/** o mensageiro: galopa para o oeste ao lado da muralha (dia, «tarda días») e de novo à noite, ultrapassado pelo fogo */
export const msgX = (t: number) => (t < CUTS[6] - 1 ? 62 - 11.5 * (t - (T.mensajero - 0.3)) : 6 - 10.4 * (t - CUTS[6]));
export const MSG_Z = 20.5;
/** os jinetes do norte vêm da serra em disparada na direção da câmera (z = frente do grupo) */
export const northZ = (t: number) => 4 + 8.3 * (t - (T.jinetes - 0.6));
const Riders: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  // os jinetes do norte cruzam a planície em disparada, levantando poeira
  if (t > T.jinetes - 0.6 && t < T.b1 + 0.4) for (let i = 0; i < 6; i++) {
    const x = -9.5 + ((i % 3) - 1) * 2.6 + (rnd(i) - 0.5) * 0.8, z = northZ(t) - Math.floor(i / 3) * 3.6 - rnd(i + 5) * 1.2;
    out.push(<Horse key={"n" + i} p={[x, 0, z]} yaw={-PI / 2} t={t + i * 0.3} c={i % 2 ? "#6b3e22" : "#8a5a32"} rider="#2a3a5a" speed={16} />);
    out.push(<Puffs key={"d" + i} t={t} p={[x, 0.15, z - 1.2]} n={5} period={0.8} rise={0.8} size={0.55} c="#d9c69a" drift={[0, 0, -2.2]} o={i * 0.17} />);
  }
  const msg = (t > T.mensajero - 0.3 && t < T.c5 + 0.6) || (t > CUTS[6] - 0.05 && t < T.senales + 0.4);
  if (msg) { const x = msgX(t); out.push(<Horse key="m" p={[x, 0, MSG_Z]} yaw={PI} t={t} c="#a87a4a" rider="#2f5d8a" speed={16} />, <Puffs key="md" t={t} p={[x + 1.2, 0.1, MSG_Z - 0.3]} n={5} period={0.7} rise={0.5} size={0.32} c="#d9c69a" drift={[2.0, 0, -0.4]} />); }
  // os manchus: esperando ao norte do portão, galopam até ele no «los manchúes» e passam em fila quando a porta abre
  if (t > T.giro - 0.1) for (let j = 0; j < 9; j++) {
    const row = (j % 3) - 1, z0 = -44 - Math.floor(j / 3) * 3.2, mill = Math.sin(t * 1.6 + j * 1.9);
    const app = ease(t, T.manchues - 0.1, T.manchues + 1.7), q = j * 2.3;
    let x = GATE_X + row * 3.0 * (1 - app) + mill * 0.6 * (1 - app), z = lerp(z0 + mill * 0.8, -12.5 - q, app), yaw = -PI / 2 + mill * 0.35 * (1 - app);
    const go = T.abrio + 0.2 + j * 0.04;
    if (t > go) { z = -12.5 - q + 10.5 * (t - go); if (z > -6) x = GATE_X + (j % 2 ? 1 : -1) * Math.min(3.2, (z + 6) * 0.35); yaw = -PI / 2 + (z > -6 ? (j % 2 ? -0.3 : 0.3) : 0); }
    if (z > 30) continue;
    out.push(<Horse key={"q" + j} p={[x, 0, z]} yaw={yaw} t={t + j * 0.21} c={j % 2 ? "#3a2a20" : "#6b4a2a"} rider="#2a3a5a" speed={t > go || (t > T.manchues && app < 1) ? 16 : 6} />);
    if (j % 3 === 0) out.push(<G key={"f" + j} p={[x - 0.2, 2.9, z]} r={[0, yaw + PI / 2, 0]}><Flag t={t} c="#f2c14e" ph={j} h={1.9} /></G>);
  }
  return <G>{out}</G>;
};

// ---------------------------------------------------------------- o passo de Shanhai: portão com pavilhão, portas que abrem
const OPEN = (t: number) => ease(t, T.abrio, T.abrio + 0.45);
const Gate: React.FC<{ t: number }> = ({ t }) => {
  if (!built(t) && t < T.p4) return null;
  const open = OPEN(t);
  return (
    <G p={[GATE_X, 0, -10]}>
      <Box s={[2.4, 4.2, 4.0]} p={[-2.0, 2.1, 0]} c={BRICK2} /><Box s={[2.4, 4.2, 4.0]} p={[2.0, 2.1, 0]} c={BRICK2} />
      <Box s={[6.4, 1.3, 4.0]} p={[0, 4.85, 0]} c={BRICK2} />
      <Box s={[5.6, 2.0, 3.2]} p={[0, 6.5, 0]} c="#b23a2a" />
      <Cone rad={4.6} h={1.6} seg={4} p={[0, 8.3, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#3f4a4a" />
      <Box s={[3.6, 1.2, 2.2]} p={[0, 9.4, 0]} c="#b23a2a" /><Cone rad={3.0} h={1.2} seg={4} p={[0, 10.5, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#3f4a4a" />
      <Box s={[2.2, 0.9, 0.12]} p={[0, 6.6, 1.62]} c="#1c2a4a" cast={false} />
      {[-1, 1].map((s) => <G key={s} p={[s * 0.8, 0, 2.05]} r={[0, s * open * 1.45, 0]}><Box s={[0.8, 3.4, 0.2]} p={[-s * 0.4, 1.7, 0]} c="#9a2a1e" />{[0.9, 1.7, 2.5].map((y) => <Sph key={y} rad={0.07} p={[-s * 0.4, y, 0.12]} c="#d4a64a" ws={6} hs={4} cast={false} />)}</G>)}
      <G p={[-3.4, 4.2, 1.6]}><Flag t={t} c="#d8352a" ph={0.4} h={3.4} /></G><G p={[3.4, 4.2, 1.6]}><Flag t={t} c="#d8352a" ph={2.1} h={3.4} /></G>
    </G>
  );
};
/** o general Ming, sozinho no portão: espera, vira, puxa a porta e se afasta para os cavaleiros passarem */
const General: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.giro) return null;
  const turn = ease(t, T.abrio - 0.35, T.abrio - 0.05), back = ease(t, T.abrio, T.abrio + 0.45), aside = ease(t, T.abrio + 0.45, T.abrio + 1.1);
  const p: V3 = [lerp(lerp(GATE_X + 1.9, GATE_X + 2.5, back), GATE_X + 3.6, aside), 0, lerp(lerp(-7.3, -6.7, back), -5.6, aside)];
  const yaw = aside > 0 ? lerp(-2.4, -1.3, aside) : lerp(0.45, -2.4, turn);
  const pose = poseOf(aside > 0.5 ? "present" : turn > 0.5 ? "pull" : "present", t);
  return <Worker p={p} yaw={yaw} pose={pose} t={t} c={COSTUMES.general} scale={1.25} />;
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a86d8" mid="#8cc3ee" low="#f2f4ee" />
    <Night t={t} />
    <Ground g={GROUND} />
    <Clouds t={t} n={8} y={30} />
    <Relief /><Forest />
    <GreatWall t={t} /><Patrol t={t} />
    {TOWERS.map((p, i) => <Tower key={i} p={p} k={towerK(t, p[0])} t={t} i={i} />)}
    <Sparks t={t} />
    <Cannon t={t} /><Gate t={t} /><General t={t} />
    <EarthWall t={t} /><Rain t={t} /><Crew t={t} /><Diggers t={t} /><Kilns t={t} /><Stamp t={t} /><Joints t={t} /><RicePot t={t} />
    <Riders t={t} />
  </>
);
