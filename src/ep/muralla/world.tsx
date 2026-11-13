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
import { COURSE0, COURSE_DT, CUTS, FAST0, FLARE, FLY, HIT, HOP, HOP0, LAY, NIGHT, PEEL_IN, PEEL_OUT, RAM1, RAM2, T, WATER, WINS, XC } from "./cues";

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
const NL = 6, LH = 0.42, LOOSE = 0.85, FORM_H = 0.95, CLAD_H = NL * LH + 0.3;
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
/** casca Ming em 7 fiadas que batem no lugar uma a uma (v4: antes subia lisa e devagar, «laje cinza crescendo») */
const cladK = (t: number) => { if (t < COURSE0) return 0; let k = 0; for (let i = 0; i < 7; i++) { const s = COURSE0 + i * COURSE_DT; k += ease(t, s, s + 0.09); } return k / 7; };
const EarthWall: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cajon - 0.15) return null;
  const L = EW.x1 - EW.x0, cx = (EW.x0 + EW.x1) / 2, e = erode(t), cl = cladK(t), building = t < CUTS[2];
  const hs = LAYERS.map((_, k) => layerH(k, t)), ys: number[] = [];
  let top = 0; for (const h of hs) { ys.push(top); top += h; }
  const cur = hs.reduce((m, h, k) => (h > 0.005 ? k : m), -1), pk = cur >= 0 ? packed(LAYERS[cur], t) : 1;
  const base = formBase(t), drop = ease(t, T.cajon - 0.1, T.cajon + 0.35), l = lift(t), pour = pourK(t);
  const hole = (t > T.cae - 0.3 && t < T.b3 + 0.6) || (t > XC.falla - 0.05 && t < CUTS[4]), fall = ease(t, T.cae - 0.4, T.cae + 0.6);
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
        {/* poeira de cada fiada que bate no lugar */}
        {Array.from({ length: 7 }, (_, r) => { const u = prog(t, COURSE0 + r * COURSE_DT + 0.05, COURSE0 + r * COURSE_DT + 0.45); if (u <= 0 || u >= 1 || t > XC.tramos) return null;
          return <G key={"d" + r}>{Array.from({ length: 8 }, (_, q) => <Sph key={q} rad={0.3} p={[EW.x0 + 1.2 + q * 2.2 + rnd(q + r) * 0.6, (CLAD_H * (r + 1)) / 7 + u * 0.6, EW.z + 1.45 + u * 0.7]} sc={Math.max(0.01, 1.2 * (1 - u))} c="#e8e2d2" cast={false} ws={7} hs={5} />)}</G>; })}
      </G> : null}
      {/* tijolos ruins: o trecho cai */}
      {hole ? <Box s={[3.2, 1.6, 0.1]} p={[EW.x1 - 5, 1.5, EW.z + 1.37]} c="#4a3a2a" cast={false} /> : null}
      {hole ? Array.from({ length: 14 }, (_, i) => { const u = clamp(fall * 1.3 - rnd(i) * 0.3); return <Box key={i} s={[0.55, 0.25, 0.3]} p={[EW.x1 - 6.4 + (i % 5) * 0.65 + u * (rnd(i + 2) - 0.3) * 1.5, lerp(1.0 + Math.floor(i / 5) * 0.5, 0.13 + (i % 3) * 0.2, u), EW.z + 1.4 + u * (0.6 + rnd(i + 5) * 1.6)]} r={[u * rnd(i) * 2, u * rnd(i + 1), u * rnd(i + 3) * 2]} c={i % 2 ? "#9a8f86" : "#b0a69a"} />; }) : null}
    </G>
  );
};
/** v4 «tramos»: o operário em cima da casca assenta a fiada da frente, um tijolo a cada 0,4 s (pega, põe, bate) */
const LAY_X = LAY.map((_, k) => EW.x1 - 0.55 - k * 0.66);
const BZ = EW.z + 1.0, BRK: V3 = [0.62, 0.28, 0.42];
const layPose = (t: number): Pose => {
  const A = (rx: number, rz: number, el: number) => ({ rx, rz, el });
  const k = LAY.findIndex((L) => t > L - 0.3 && t <= L + 0.1);
  if (k < 0) return poseOf(t > LAY[3] ? "cheer" : "present", t);
  const v = (t - (LAY[k] - 0.3)) / 0.4;
  if (v < 0.75) { const w = sstep(v / 0.75), rx = lerp(-1.9, -0.95, w); return { l: A(rx, -0.25, -0.45), r: A(rx, 0.25, -0.45), hx: 0.3, hy: 0, hz: 0, lean: lerp(0.05, 0.35, w), hop: 0 }; }
  const w = (v - 0.75) / 0.25;
  return { l: A(-0.95, -0.25, -0.45), r: A(-0.95 - 1.3 * Math.sin(PI * w), 0.3, -0.5), hx: 0.35, hy: 0, hz: 0, lean: 0.35, hop: 0 };
};
const Bricklayer: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.tramos - 0.05 || t > XC.fuegoH + 0.05) return null;
  const y0 = CLAD_H, wx = EW.x1 - 0.4 - 0.66 * [0, 1, 2].reduce((s, k) => s + ease(t, LAY[k] + 0.1, LAY[k] + 0.3), 0);
  const hand: V3 = [wx + 0.05, y0 + 1.35, BZ - 0.55];
  return (
    <G>
      {/* fiada já assentada (para o oeste) e os 4 que ele pousa agora */}
      {Array.from({ length: 22 }, (_, j) => <Box key={j} s={BRK} p={[LAY_X[3] - 0.66 * (j + 1), y0 + 0.16, BZ]} c={j % 2 ? BRICK : BRICK2} />)}
      {LAY.map((L, k) => {
        const u = prog(t, L - 0.3, L); if (u <= 0) return null;
        const rest: V3 = [LAY_X[k], y0 + 0.16, BZ], q = sstep(u), sq = t > L ? 1 - 0.18 * Math.sin(PI * prog(t, L, L + 0.12)) : 1;
        const p: V3 = [lerp(hand[0], rest[0], q), lerp(hand[1], rest[1], q) + 0.35 * Math.sin(PI * u), lerp(hand[2], rest[2], q)];
        const d = prog(t, L, L + 0.35);
        return (
          <G key={k}>
            <Box s={[0.64, 0.04, 0.44]} p={[rest[0], y0 + 0.02, BZ]} c={MORT} cast={false} vis={t > L - 0.12} />
            <Box s={BRK} p={p} sc={[1, sq, 1]} r={[0, 0.4 * (1 - q), 0]} c={k % 2 ? BRICK2 : BRICK} />
            {d > 0 && d < 1 ? [0, 1, 2, 3, 4, 5].map((i) => { const a = i * 1.05; return <Sph key={i} rad={0.09} p={[rest[0] + Math.cos(a) * (0.3 + 0.35 * d), y0 + 0.08 + 0.25 * d, BZ + Math.sin(a) * (0.2 + 0.3 * d)]} sc={Math.max(0.01, 1.4 * (1 - d))} c="#ece6d6" cast={false} ws={6} hs={4} />; }) : null}
          </G>);
      })}
      {/* pilha de onde ele tira os tijolos (atrás, à direita dele) */}
      {[0, 1, 2].map((r) => <Box key={r} s={BRK} p={[EW.x1 - 0.2, y0 + 0.16 + r * 0.29, EW.z - 0.6]} r={[0, r % 2 ? 0.2 : -0.1, 0]} c={r % 2 ? BRICK : BRICK2} />)}
      <Worker p={[wx + 0.15, y0, BZ - 0.95]} yaw={0.25} pose={layPose(t)} t={t} c={COSTUMES.ming} scale={1.15} prop="hammer" />
    </G>
  );
};
const Rain: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p1 - 0.2 && t < T.ming)) return null;
  return <G>{Array.from({ length: 80 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.04, 0.9, 0.04]} p={[lerp(EW.x0 - 6, EW.x1 + 6, rnd(i + 1)), 12 - u * 12, lerp(EW.z - 6, EW.z + 10, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
/** a equipe que chega à planície com as ferramentas («solo manos, herramientas y cabeza») */
export const crewX = (t: number) => 3.2 - 2.1 * (t - CUTS[0]);
/** v4: no «China… no hay motores» a câmera desce da serra para dois ajudantes que chegam com ferramentas ao operário */
const Helpers: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.china || t > CUTS[0] - 0.02) return null;
  return <G>{[[3.9, 9.0, 2.0], [3.3, 11.6, 1.5]].map(([x0, z, x1], i) => {
    const x = lerp(x0, x1, ease(t, T.china + 0.6 + i * 0.2, CUTS[0] - 0.4)), moving = t < CUTS[0] - 0.45;
    return (
      <G key={i}>
        <Worker p={[x, 0, z]} yaw={moving ? -PI / 2 + 0.3 : 0.4} pose={poseOf(moving ? "walk" : "present", t + i * 0.3)} t={t + i * 0.3} c={COSTUMES.ming} scale={1.0} mustache={i === 0} />
        {i === 0
          ? <G p={[x + 0.1, 1.45, z - 0.32]} r={[0, 0, -0.75]}><Cyl rt={0.045} h={2.0} p={[0, 0.75, 0]} c={WOOD} seg={6} /><Box s={[0.5, 0.08, 0.3]} p={[0.18, 1.72, 0]} c="#8f8f94" /></G>
          : <G p={[x, 2.2, z]}><Cyl rt={0.42} rb={0.3} h={0.42} c="#9a7040" seg={10} /><Cyl rt={0.36} h={0.05} p={[0, 0.2, 0]} c={LOOSE_C} seg={10} /></G>}
      </G>);
  })}</G>;
};
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
      {/* v4: atrás do canteiro (antes ficavam entre a câmera e as tábuas, chapéu enchendo o quadro) */}
      <Cone rad={1.5} h={1.2} seg={8} p={[-14.9, 0.55, 11.9]} c={EARTH2} o={{ flat: true }} />
      {[[-13.5, 12.6, -1.0], [-16.2, 13.0, 0.9]].map(([x, z, yaw], i) => <Worker key={i} p={[x, 0, z]} yaw={yaw} pose={poseOf("chisel", t + i * 0.45)} t={t + i * 0.45} c={COSTUMES.ming} scale={1.0} prop="hammer" mustache={i === 1} />)}
    </G>
  );
};
/** os fornos ao pé da serra, pilhas de tijolo.
 *  v4: o forno da direita (x 4) mostra o mecanismo de perto — a pá enfia o barro, o fogo sobe, sai tijolo cinza ainda em brasa;
 *  água no barro cru (desmancha) e no tijolo cozido (aguenta); depois os tijolos voam do forno para as pilhas e dois
 *  carregadores levam para a obra ali do lado; a pilha da frente ganha os 3 últimos e um tijolo ruim racha no «Pero». */
const STACKS: [number, number][] = Array.from({ length: 6 }, (_, i) => [-2.5 + (i % 3) * 1.6, 14.2 + Math.floor(i / 3) * 1.4]);
const MOUTH: V3 = [4, 0.55, 12.0];
const stackN = (i: number, t: number) => 3 + FLY.filter(([a, s]) => s === i && t >= a).length;
const CLAY = "#9a5534", CLAY_WET = "#6e3a22";
/** a pá: sai a 45° para a direita até o operário, que fica fora do quadro (a 0,49/0,87 ele ficava em cima da câmera) */
const PEEL_D: V3 = [0.7, 0, 0.71];
const peelS = (t: number) => lerp(lerp(1.15, -0.6, ease(t, PEEL_IN, PEEL_IN + 0.4)), 1.25, ease(t, PEEL_OUT, PEEL_OUT + 0.4));
const peelAt = (t: number): V3 => { const s = peelS(t); return [MOUTH[0] + PEEL_D[0] * s, 0.3, 12.15 + PEEL_D[2] * s]; };
export const peelBody = (t: number): V3 => { const b = peelAt(t); return [b[0] + PEEL_D[0] * 3.1, 0, b[2] + PEEL_D[2] * 3.1]; };
const RAW: V3 = [3.3, 0.15, 13.4];
const Kilns: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 0 : ease(t, T.ming - 0.4, T.ming + 1.2); if (k <= 0.01) return null;
  const bad = t > T.p2 - 0.1 && t < T.b3, chip = ease(t, T.p2 + 0.35, T.p2 + 0.8);
  const flare = ease(t, FLARE, FLARE + 0.15) * (1 - ease(t, PEEL_OUT - 0.05, PEEL_OUT + 0.35));
  const showPeel = t > XC.fuegoH - 0.05 && t < XC.hornos, inK = t > PEEL_IN + 0.3 && t < PEEL_OUT + 0.05, fired = t > PEEL_OUT;
  const pb = peelAt(t), hot = 1 - ease(t, PEEL_OUT + 0.2, PEEL_OUT + 1.1), yaw = Math.atan2(PEEL_D[0], PEEL_D[2]);
  const wet = ease(t, WATER + 0.1, WATER + 0.7), slump = ease(t, WATER + 0.2, WATER + 0.85), pourW = t > WATER - 0.15 && t < WATER + 0.75;
  return (
    <G>
      <G sc={[1, Math.max(0.01, k), 1]}>
        {[[-1, 10.5], [4, 10.0]].map(([x, z], i) => (
          <G key={i} p={[x, 0, z]}>
            <Sph rad={1.9} ps={0} pl={PI / 2} c={KILN} ws={14} hs={8} />
            <Box s={[0.9, 1.1, 0.4]} p={[0, 0.55, 1.75]} c="#2a1a12" cast={false} />
            <Box s={[0.6, 0.5, 0.1]} p={[0, 0.35, 1.96]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.4 + (i ? 2.2 * flare : 0) }} cast={false} />
            <Cyl rt={0.35} h={1.4} p={[0.6, 2.2, -0.4]} c={KILN} seg={8} />
            <Puffs t={t} p={[0.6, 2.9, -0.4]} n={7} period={i && flare > 0.1 ? 1.2 : 3} rise={7} size={0.9 + (i ? 0.5 * flare : 0)} c="#d8d8d8" o={i * 0.3} />
          </G>))}
      </G>
      {/* o fogo sobe na boca do forno da direita quando o barro entra */}
      {flare > 0.01 ? [-0.25, 0, 0.25].map((dx, j) => <Cone key={j} rad={0.2 * flare} h={(0.9 + 0.35 * Math.sin(t * 19 + j * 2)) * flare} seg={6} p={[MOUTH[0] + dx, 1.05 + 0.4 * flare, 12.02]} c={j === 1 ? "#ffd84a" : "#ff8a1a"} o={{ emissive: j === 1 ? "#ffcc00" : "#ff6a00", ei: 2 }} cast={false} />) : null}
      {/* a pá com o barro (entra) e com o tijolo cozido (sai ainda em brasa) */}
      {showPeel ? <G>
        <G p={pb} r={[0, yaw, 0]}>
          <Box s={[0.62, 0.04, 0.7]} c={WOOD} />
          <Cyl rt={0.045} h={2.4} p={[0, 0.08, 1.55]} r={[PI / 2 - 0.06, 0, 0]} c="#6b4423" seg={6} />
          {!inK ? <Box s={[0.5, 0.24, 0.34]} p={[0, 0.14, 0]} c={fired ? lerpC(BRICK, "#6f7276", wet) : CLAY} o={fired ? { emissive: "#ff5a10", ei: 0.9 * hot } : { rough: 0.5 }} /> : null}
          {fired && pourW ? [0, 1, 2, 3].map((j) => { const u = fract(t * 3 + j / 4); return <Sph key={j} rad={0.05} p={[(rnd(j) - 0.5) * 0.4, 0.3 + 0.35 * Math.sin(PI * u), (rnd(j + 2) - 0.5) * 0.25 + u * 0.3]} c="#cfeaff" cast={false} ws={5} hs={4} />; }) : null}
        </G>
        {fired && t > WATER ? <Puffs t={t} p={[pb[0], 0.5, pb[2]]} n={5} period={0.9} rise={1.6} size={0.25} c="#ffffff" on={1 - ease(t, WATER + 0.8, XC.hornos)} drift={[0.2, 0, 0.1]} /> : null}
        {/* barro cru do lado: a água o desmancha em lama */}
        <G p={[RAW[0], 0, RAW[2]]}>
          <Box s={[0.5, 0.24, 0.34]} p={[0, 0.12 * (1 - 0.65 * slump), 0]} sc={[1 + 0.5 * slump, 1 - 0.65 * slump, 1 + 0.5 * slump]} c={lerpC(CLAY, CLAY_WET, wet)} o={{ rough: 0.4 }} />
          {slump > 0.02 ? <Sph rad={1} p={[0, 0.01, 0]} sc={[0.55 * slump + 0.2, 0.03, 0.4 * slump + 0.15]} c={CLAY_WET} cast={false} ws={12} hs={4} /> : null}
        </G>
        {/* o balde que joga água nos dois */}
        {t > WATER - 0.45 && t < WATER + 0.95 ? <G p={[(RAW[0] + 4.6) / 2, 2.25 - 0.45 * ease(t, WATER - 0.45, WATER - 0.15), 13.25]} r={[0, 0, 1.7 * ease(t, WATER - 0.2, WATER)]}>
          <Cyl rt={0.38} rb={0.3} h={0.5} c="#7a5a3a" seg={10} /><Cyl rt={0.34} h={0.04} p={[0, 0.22, 0]} c="#6fb6ff" seg={10} vis={t < WATER} />
        </G> : null}
        {pourW ? Array.from({ length: 22 }, (_, j) => { const u = fract(t * 2.6 + rnd(j)), x0 = lerp(RAW[0] - 0.2, 4.95, rnd(j + 5)); return <Box key={j} s={[0.04, 0.26, 0.04]} p={[x0, lerp(2.0, 0.1, u), 13.25 + (rnd(j + 9) - 0.5) * 0.4]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.5, opacity: 0.9, depthWrite: false }} />; }) : null}
      </G> : null}
      {/* tijolos que voam do forno para as pilhas */}
      {FLY.map(([a, si], j) => { const u = prog(t, a - 0.45, a); if (u <= 0 || u >= 1) return null;
        const [sx, sz] = STACKS[si], n = stackN(si, a - 0.01), to: V3 = [sx, 0.16 + n * 0.31, sz];
        return <Box key={j} s={[1.2, 0.3, 0.6]} p={[lerp(MOUTH[0], to[0], u), lerp(0.7, to[1], u) + 2.2 * Math.sin(PI * u), lerp(MOUTH[2] + 0.2, to[2], u)]} r={[u * 2.5, u * 1.5, 0]} c={BRICK} />; })}
      {STACKS.map(([x, z], i) => { const n = stackN(i, t); if (k < 0.5) return null;
        return <G key={i} p={[x, 0, z]}>{Array.from({ length: n }, (_, r) => <Box key={r} s={[1.2, 0.3, 0.6]} p={[0, 0.16 + r * 0.31, 0]} r={[0, r % 2 ? 0.08 : 0, 0]} sc={[1, Math.max(0.01, k), 1]}
          c={i === 4 && r === 1 && bad ? "#c26a4a" : r % 3 === 2 ? BRICK2 : BRICK} />)}</G>; })}
      {/* o tijolo ruim: racha em X vermelho e solta um canto */}
      {bad ? <G p={[STACKS[4][0], 0.47, STACKS[4][1] + 0.31]}>
        {[0, 1].map((j) => <Box key={j} s={[0.74, 0.05, 0.03]} p={[0, 0, 0.01]} r={[0, 0, j ? 0.33 : -0.33]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.4 }} cast={false} />)}
        <Box s={[0.26, 0.14, 0.2]} p={[0.48 + 0.2 * chip, 0.05 - 0.45 * chip * chip, 0.02 + 0.3 * chip]} r={[chip * 2, chip, 0]} c="#c26a4a" />
      </G> : null}
    </G>
  );
};
/** dois carregadores levam tijolos da pilha à ponta da muralha, ali do lado (plano «hornos» e fundo do «lejos») */
const CARRY_A: V3 = [-3.5, 0, 16.5], CARRY_B: V3 = [-7.0, 0, 18.7];
const Carriers: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.hornos - 0.05 || t > CUTS[3]) return null;
  return <G>{[0, 1].map((i) => {
    const ph = fract((t - XC.hornos) / 2.2 + i * 0.5), go = ph < 0.5, u = sstep(go ? ph * 2 : 2 - ph * 2);
    const p: V3 = [lerp(CARRY_A[0], CARRY_B[0], u), 0, lerp(CARRY_A[2], CARRY_B[2], u)], yaw = go ? Math.atan2(-3.5, 2.2) : Math.atan2(3.5, -2.2);
    return (
      <G key={i}>
        <Worker p={p} yaw={yaw} pose={poseOf("walk", t + i * 0.4)} t={t + i} c={COSTUMES.ming} scale={1.0} mustache={i === 1} />
        {go ? <G p={[p[0], 1.85, p[2]]} r={[0, yaw, 0]}>{[0, 1, 2].map((r) => <Box key={r} s={[0.5, 0.2, 0.32]} p={[0, r * 0.21, 0]} r={[0, r % 2 ? 0.15 : 0, 0]} c={r % 2 ? BRICK2 : BRICK} />)}</G> : null}
      </G>);
  })}
    {/* o que eles já levaram, junto da obra */}
    {[0, 1, 2, 3, 4].map((r) => <Box key={"o" + r} s={[0.5, 0.2, 0.32]} p={[CARRY_B[0] - 0.4 + (r % 2) * 0.55, 0.1 + Math.floor(r / 2) * 0.21, CARRY_B[2] + 0.6]} c={r % 2 ? BRICK2 : BRICK} />)}
  </G>;
};
// caracteres gravados no tijolo, feitos de traços (não dependem de fonte): 六 年 山 工 — «ano seis», oficina da serra
type Stroke = [number, number, number, number, number?];
const GLYPHS: Stroke[][] = [
  [[0, 0.4, 0.12, 0.2], [0, 0.18, 0.9, 0.11], [-0.22, -0.2, 0.11, 0.48, -0.55], [0.22, -0.2, 0.11, 0.48, 0.55]],
  [[-0.22, 0.42, 0.3, 0.1, 0.6], [0.1, 0.36, 0.66, 0.1], [0.06, 0.1, 0.56, 0.1], [-0.24, -0.02, 0.1, 0.32], [0, -0.18, 0.95, 0.1], [0.08, -0.05, 0.11, 0.92]],
  [[0, 0.02, 0.12, 0.9], [-0.38, -0.12, 0.12, 0.52], [0.38, -0.12, 0.12, 0.52], [0, -0.4, 0.88, 0.12]],
  [[0, 0.38, 0.72, 0.11], [0, 0, 0.12, 0.76], [0, -0.4, 0.95, 0.11]],
];
export const STAMP = { x: 11.0, z: 18.3, y: 1.6 };
/** inscrição 六年山工 numa face: ano (年) e unidade (山工); `sc` = escala dos caracteres, `gap` = passo entre eles */
const Glyphs: React.FC<{ k: number; gap: number; sc: number; plate: [number, number] }> = ({ k, gap, sc, plate }) => (
  <G vis={k > 0.01} sc={[k, k, 1]}>
    <Box s={[plate[0], plate[1], 0.02]} c="#5a5c60" cast={false} /><Box s={[plate[0] - 0.08, plate[1] - 0.07, 0.025]} c="#c4c6ca" cast={false} />
    {GLYPHS.map((g, i) => <G key={i} p={[(i - 1.5) * gap, 0, 0.02]} sc={[sc, sc * 1.05, 1]}>{g.map(([x, y, w, h, r], j) => <Box key={j} s={[w, h, 0.03]} p={[x, y, 0]} r={[0, 0, r ?? 0]} c="#2a2c30" cast={false} />)}</G>)}
  </G>
);
/** anel que circunda caracteres (o ano, a unidade) */
const Ring: React.FC<{ p: V3; r: number; sx: number; k: number; c: string }> = ({ p, r, sx, k, c }) => (k <= 0.01 ? null : (
  <mesh position={p} rotation={[-PI / 2, 0, 0]} scale={[sx * k, k, k]} material={mat(c, { emissive: c, ei: 1.1 })}><torusGeometry args={[r, 0.035, 8, 32]} /></mesh>));
/** v4: o carimbo sobe devagar, BATE no tijolo no «llevan grabados» (poeira, tranco) e a inscrição aparece na face de cima;
 *  anel no 年 («el año») e no 山工 («la unidad»); ao lado, a pilha dos já carimbados («muchos ladrillos») */
const BR: V3 = [1.5, 0.5, 0.8];
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.ming || t > T.p4) return null;
  const top = 1.075 + BR[1];
  const up = ease(t, XC.b3 + 0.1, HIT - 0.12), fall = prog(t, HIT - 0.12, HIT), lift = ease(t, HIT + 0.22, HIT + 0.6);
  const yb = t < HIT - 0.12 ? lerp(2.3, 3.0, up) : t < HIT + 0.22 ? lerp(3.0, top, fall * fall) : lerp(top, 3.6, lift);
  const mark = ease(t, HIT, HIT + 0.08), dust = prog(t, HIT, HIT + 0.45), flash = 1 - prog(t, HIT, HIT + 0.15);
  const rY = ease(t, T.anio + 0.12, T.anio + 0.32), rU = ease(t, T.unidad + 0.12, T.unidad + 0.32);
  return (
    <G p={[STAMP.x, 0, STAMP.z]}>
      <Box s={[4.4, 0.15, 2.2]} p={[0.8, 1.0, 0]} c={WOOD} />{[[-1.3, -0.95], [-1.3, 0.95], [2.9, -0.95], [2.9, 0.95]].map(([a, b], i) => <Box key={i} s={[0.15, 1.0, 0.15]} p={[a, 0.5, b]} c="#6b4423" />)}
      {/* o tijolo do carimbo e a inscrição na face de cima */}
      <Box s={BR} p={[0, 1.075 + BR[1] / 2, 0]} c={BRICK} />
      <G p={[0, top + 0.005, 0]} r={[-PI / 2, 0, 0]}><Glyphs k={mark} gap={0.33} sc={0.3} plate={[1.38, 0.46]} /></G>
      {flash > 0 && t > HIT ? <Box s={[1.4, 0.02, 0.6]} p={[0, top + 0.03, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 1.5 * flash, opacity: flash, depthWrite: false }} cast={false} /> : null}
      <Ring p={[-0.165, top + 0.04, 0]} r={0.2} sx={1} k={rY} c="#ffd400" />
      <Ring p={[0.33, top + 0.04, 0]} r={0.2} sx={1.9} k={rU} c="#ffd400" />
      {/* poeira do golpe */}
      {dust > 0 && dust < 1 ? Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * PI * 2; return <Sph key={i} rad={0.12} p={[Math.cos(a) * (0.75 + 0.6 * dust), top + 0.05 + 0.3 * dust, Math.sin(a) * (0.42 + 0.4 * dust)]} sc={Math.max(0.01, 1.5 * (1 - dust))} c="#e9e2cf" cast={false} ws={6} hs={4} />; }) : null}
      {/* o carimbo: bloco com cabo em T */}
      <G p={[0, yb, 0]}>
        <Box s={[1.3, 0.32, 0.7]} p={[0, 0.16, 0]} c="#9a6a3a" /><Box s={[1.2, 0.05, 0.6]} p={[0, 0.0, 0]} c="#3a2a1a" cast={false} />
        <Cyl rt={0.08} h={0.75} p={[0, 0.7, 0]} c={WOOD} seg={8} /><Cyl rt={0.07} h={1.0} p={[0, 1.08, 0]} r={[0, 0, PI / 2]} c={WOOD} seg={8} />
      </G>
      {/* a pilha dos já carimbados */}
      {[0, 1, 2].map((r) => <G key={r} p={[2.15, 1.075 + BR[1] / 2 + r * 0.51, 0.1]} r={[0, r % 2 ? 0.08 : -0.05, 0]}>
        <Box s={BR} c={r % 2 ? BRICK2 : BRICK} />
        {r === 2 ? <G p={[0, BR[1] / 2 + 0.005, 0]} r={[-PI / 2, 0, 0]}><Glyphs k={1} gap={0.33} sc={0.3} plate={[1.38, 0.46]} /></G> : null}
        <G p={[0, 0, BR[2] / 2 + 0.005]}><Glyphs k={1} gap={0.33} sc={0.26} plate={[1.38, 0.4]} /></G>
      </G>)}
    </G>
  );
};
/** v4 «si uno falla»: no entulho do muro que caiu, um tijolo rachado vira e mostra o selo; anel vermelho na unidade */
const EV: V3 = [-12.1, 0.21, 21.1]; // à frente do entulho (que vai até z≈19,6), para o close não ter pedra na frente
const Evidence: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.falla - 0.05 || t > CUTS[4]) return null;
  const crack = ease(t, T.falla + 0.25, T.falla + 0.4), wob = t > T.falla + 0.25 && t < T.sabe ? Math.sin((t - T.falla) * 40) * 0.06 * (1 - prog(t, T.falla + 0.25, T.sabe)) : 0;
  const flip = ease(t, T.sabe, T.sabe + 0.35), rR = ease(t, T.responde + 0.08, T.responde + 0.28), pulse = 1 + 0.08 * Math.sin((t - T.responde) * 14);
  const E: V3 = [1.2, 0.42, 0.65];
  const Crack = () => <G>{[[-0.2, 0.06, 0.5], [0.05, -0.05, -0.7], [0.27, 0.05, 0.6]].map(([x, z, r], i) => <Box key={i} s={[0.32 * crack, 0.012, 0.035]} p={[x, 0, z]} r={[0, r, 0]} c="#ff2a1a" o={{ emissive: "#ff2a1a", ei: 1.6 }} cast={false} />)}</G>;
  return (
    <G>
      <G p={[EV[0], EV[1] + 0.5 * Math.sin(PI * flip), EV[2]]} r={[PI * flip, 0, wob]}>
        <Box s={E} c={BRICK2} />
        <G p={[0, E[1] / 2 + 0.008, 0]}><Crack /></G>
        <G p={[0, -E[1] / 2 - 0.008, 0]}><Crack /></G>
        <G p={[0, -E[1] / 2 - 0.006, 0]} r={[PI / 2, 0, 0]}><Glyphs k={1} gap={0.28} sc={0.25} plate={[1.12, 0.4]} /></G>
      </G>
      <Ring p={[EV[0] + 0.28, EV[1] + E[1] / 2 + 0.04, EV[2]]} r={0.19} sx={1.75} k={rR * pulse} c="#ff3b30" />
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
    const row = (j % 3) - 1, z0 = -44 - Math.floor(j / 3) * 3.2 - 9 * (1 - ease(t, T.giro + 0.2, T.manchues)), mill = Math.sin(t * 1.6 + j * 1.9);
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
/** v4 «un muro tan largo no se puede vigilar entero»: um vigia no adarve a leste do portão olha a muralha que some na serra,
 *  vira para o outro lado (não dá para ver tudo) e acena chamando o mensageiro */
export const SENTRY: V3 = [52.2, 4.55, -9.35]; // adarve a oeste do portão (a leste a torre do portão tapava tudo), longe da câmera
const lookout = (t: number): Pose => { const s = Math.sin(t * 3.1);
  return { l: { rx: 0.05, rz: -0.12, el: 0 }, r: { rx: -2.55, rz: 0.75, el: -1.75 }, hx: -0.12, hy: 0.25 * s, hz: 0, lean: 0.06, hop: 0 }; };
const Sentry: React.FC<{ t: number }> = ({ t }) => {
  if (t < XC.p4 - 0.05 || t > CUTS[5]) return null;
  const turn = ease(t, T.vigilar + 0.05, T.vigilar + 0.3) - ease(t, T.entero - 0.15, T.entero + 0.1);
  const call = t > T.entero + 0.15, yaw = call ? lerp(-PI / 2, 0.2, ease(t, T.entero + 0.15, T.entero + 0.4)) : -PI / 2 + PI * turn;
  return <Worker p={SENTRY} yaw={yaw} pose={call ? poseOf("alarm", t) : turn > 0.5 ? poseOf("think", t) : lookout(t)} t={t} c={SOLDIER} scale={1.1} />;
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
    <Cannon t={t} /><Gate t={t} /><General t={t} /><Sentry t={t} />
    <EarthWall t={t} /><Rain t={t} /><Helpers t={t} /><Crew t={t} /><Diggers t={t} /><Kilns t={t} /><Carriers t={t} /><Bricklayer t={t} /><Stamp t={t} /><Evidence t={t} /><Joints t={t} /><RicePot t={t} />
    <Riders t={t} />
  </>
);
