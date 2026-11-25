// Mundo do E20: os Arcos de Querétaro de brinquedo. Eixo x = caminho da água, da esquerda para a direita:
// planalto (y=H) com a ALBERCA (o pântano das 18 nascentes, com corte em z=FZA) → canal no chão → a ARCARIA de 74 arcos
// (x XA0..XA1, z=0) por cima do VALE com lodo (chão y=0, corte em z=FZ na frente dos pilares) → o morro da Cruz (domo, cume
// y=HS) com a CAIXA DE ÁGUA, o convento da Cruz, os tubos de barro morro abaixo e as fontes das praças (F1, F2, F3).
// Na frente (z≈36–52): o convento das Capuchinas (a lenda), o rolo de papel, as tinas de tinta dos obrajes no rio, as moedas.
// O plano de 1721 (fantasma, arcos baixos) cruza em z=ZG. Tudo é função de t (sem estado).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, sstep, vlerp } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { Crowd, Worker, poseOf } from "../../toy/worker";
import type { Costume } from "../../toy/worker";
import { ARCH_T, C1, C2, C4, C5, C7, COIN_T, FOOT_T, SPRING_T, T } from "./cues";

const PI = Math.PI;
// ---------------------------------------------------------------- geografia
export const H = 9;                                   // topo dos arcos = nível do canal = altura do planalto da esquerda
export const HS = H - 1.2;                            // cume do morro da Cruz: o canal chega num muro baixo
export const NA = 74, S = 3.0, XA0 = -111, XA1 = XA0 + NA * S;
const PW = 0.9, PD = 1.6, HEAD = 1.5, DECK = 0.4, WALLH = 0.36, WY = 0.72;
export const SUM: V3 = [113, HS, 0];
const LX0 = -28, LX1 = -95, RD = 82, PLAT = 10;
export const ZG = 18, HG = 3.4, GS = 1.6, NG = 80, GX0 = -56, GX1 = GX0 + NG * GS; // o plano de 1721 (fantasma)
export const AL: V3 = [-150, H, 0], FZA = 2.5;        // a alberca; face do corte do pântano em z=FZA
const PIT_BOT = 4, CUT_FLOOR = 2, MUD0 = H - 1.8, DUG = PIT_BOT + 0.25, CLEAN = H + 0.7;
export const FZ = 0.85, DEEPV = -8, MUDB = -4.3, FIRMB = -6.0; // face do corte do vale (logo na frente dos pilares)
export const CAJA: V3 = [113, HS, 0], WLC = H + 0.5;  // caixa de água e o nível da água nela (= o teto das fontes)
export const CONV: V3 = [119.5, HS, -3.4];
export const LEG: V3 = [58, 0, 38], SCR: V3 = [48, 0, 44], OB: V3 = [79, 0, 45], SICK: V3 = [96, 0, 47], CS: V3 = [-14, 0, 36];
const ZR = 52; // o rio

const sm = (u: number) => sstep(clamp(u));
/** altura do chão em (x, z): rampa da esquerda até o planalto, domo do morro da Cruz à direita, vale plano no meio */
export const gH = (x: number, z: number) => {
  const l = x < LX0 ? H * sm((LX0 - x) / (LX0 - LX1)) : 0;
  const d = Math.hypot(x - SUM[0], z * 1.5), u = clamp((d - PLAT) / (RD - PLAT));
  return Math.max(l, HS * Math.cos((PI / 2) * u) ** 2);
};
const on = (x: number, z: number, dy = 0): V3 => [x, gH(x, z) + dy, z];
export const F1 = on(120.5, 16.5), F2 = on(127.5, 28.5), F3 = on(133, -5);

// ---------------------------------------------------------------- quando cada coisa existe
const hook = (t: number) => t < T.queretaro;
const cta = (t: number) => t >= T.manda - 0.02;
/** o plano de 1721: do «primer plan» até o fim das moedas */
const twist = (t: number) => t >= T.primer && t < T.manda - 0.02;
const cutA = (t: number) => t >= T.c1 && t < T.ahora;                       // corte do pântano aberto
const swampA = (t: number) => !hook(t) && t < T.c1;                          // 1726: ainda é pântano
const albBuilt = (t: number) => hook(t) || t >= T.ahora;
export const cutV = (t: number) => (t >= T.enterrado0 && t < T.b2) || (t >= T.cimientos && t < C5); // corte do vale aberto

// ---------------------------------------------------------------- utilidades
const CANT = "#e6a291", CANT2 = "#d48a7b", WATER = "#3fa3e0", MUD = "#7d6b45", MUD2 = "#6a5a3a";
const GRASS = "#aebf63", GRASS2 = "#9fb457", DOME = "#cdb47c";
const qcol = (a: string, b: string, k: number, steps = 6) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.round(clamp(k) * steps) / steps).getHexString();
const popK = (t: number, a: number, d = 0.25) => (t < a ? 0 : outBack(prog(t, a, a + d)));
const XMark: React.FC<{ t: number; a: number; b: number; p: V3; sc?: number }> = ({ t, a, b, p, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = lerp(1.8, 1, ease(t, a, a + 0.14)) * sc, o = { emissive: "#ff2a1a", ei: 0.9 };
  return <G p={p} sc={k}>{[-1, 1].map((d) => <G key={d} r={[0, 0, (d * PI) / 4]}><Box s={[0.28, 1.1, 0.08]} c="#3a0808" cast={false} /><Box s={[0.18, 0.98, 0.1]} c="#ff3b30" o={o} cast={false} /></G>)}</G>;
};
/** água que corre: n bolinhas andando por uma polilinha */
const along = (pts: V3[], u: number): V3 => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return vlerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 0); d -= L[i]; }
  return pts[pts.length - 1];
};
const Beads: React.FC<{ t: number; pts: V3[]; n?: number; speed?: number; c?: string; e?: string; r?: number; ph?: number }> = ({ t, pts, n = 6, speed = 0.8, c = "#5ac8ff", e = "#1f8fe0", r = 0.14, ph = 0 }) => (
  <G>{Array.from({ length: n }, (_, i) => <Sph key={i} rad={r} p={along(pts, fract(t * speed + i / n + ph))} c={c} o={{ emissive: e, ei: 1.0 }} cast={false} ws={8} hs={6} />)}</G>
);
const Ruler: React.FC<{ p: V3; h: number; k: number; step?: number }> = ({ p, h, k, step = 1 }) => {
  if (k <= 0.01) return null;
  const y = h * k, o = { emissive: "#ffb000", ei: 0.8 };
  return (
    <G p={p}>
      <Box s={[0.9, 0.12, 0.14]} p={[0, 0.06, 0]} c="#ffd43a" o={o} cast={false} />
      <Box s={[0.16, y, 0.14]} p={[0, y / 2, 0]} c="#ffd43a" o={o} cast={false} />
      {Array.from({ length: Math.floor(y / step) }, (_, i) => <Box key={i} s={[i % 2 ? 0.34 : 0.55, 0.07, 0.14]} p={[0, (i + 1) * step, 0]} c="#ffd43a" o={o} cast={false} />)}
      <Cone rad={0.3} h={0.45} p={[0, y + 0.2, 0]} seg={4} c="#ffd43a" o={o} cast={false} />
      {k > 0.98 ? <Box s={[1.1, 0.14, 0.16]} p={[0, h, 0]} c="#fff3a0" o={o} cast={false} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- chão: grama em pedaços (buraco do corte do vale), lodo do vale,
// rampa da esquerda, domo do morro, planalto com o buraco da alberca
const GHOLE: [number, number, number, number][] = [[LX1, 420, -420, FZ], [LX1, 420, FZ + 12, 420], [LX1, -16.5, FZ, FZ + 12], [16.5, 420, FZ, FZ + 12]];
const MHOLE: [number, number, number, number][] = [[-27, 30, -32, FZ], [-27, 30, FZ + 12, 32], [-27, -16.5, FZ, FZ + 12], [16.5, 30, FZ, FZ + 12]];
const heightMesh = (x0: number, x1: number, z0: number, z1: number, nx: number, nz: number) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); g.rotateX(-PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, gH(p.getX(i), p.getZ(i)) - 0.03);
  g.computeVertexNormals(); return g;
};
const PATCH = Array.from({ length: 70 }, (_, i) => ({ x: lerp(-90, 300, rnd(i * 3 + 1)), z: lerp(-150, 120, rnd(i * 3 + 2)), r: lerp(2.5, 7, rnd(i * 3 + 3)), c: i % 3 ? GRASS2 : "#b9c86e" }))
  .filter((q) => gH(q.x, q.z) < 0.05 && !(Math.abs(q.x) < 34 && Math.abs(q.z) < 38) && Math.abs(q.z - ZR) > 6);
const Land: React.FC<{ t: number }> = ({ t }) => {
  const mudGeo = useMemo(() => {
    const sh = new THREE.Shape(), N = 48;
    for (let k = 0; k <= N; k++) { const a = (k / N) * PI * 2, r = 1 + 0.12 * Math.sin(a * 5 + 1) + 0.07 * Math.sin(a * 11 + 2); const x = 1.5 + 28.5 * r * Math.cos(a), y = -(33 * r * Math.sin(a)); if (k) sh.lineTo(x, y); else sh.moveTo(x, y); }
    return new THREE.ShapeGeometry(sh);
  }, []);
  const ramp = useMemo(() => heightMesh(LX1, LX0, -300, 300, 34, 2), []);
  const dome = useMemo(() => heightMesh(30, 196, -56, 56, 83, 56), []);
  const open = cutV(t);
  return (
    <G>
      {GHOLE.map(([x0, x1, z0, z1], i) => <Box key={i} s={[x1 - x0, 0.2, z1 - z0]} p={[(x0 + x1) / 2, -0.1, (z0 + z1) / 2]} c={GRASS} cast={false} />)}
      {PATCH.map((q, i) => <mesh key={i} position={[q.x, 0.012, q.z]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.r, 10]} /></mesh>)}
      {open ? MHOLE.map(([x0, x1, z0, z1], i) => <Box key={i} s={[x1 - x0, 0.04, z1 - z0]} p={[(x0 + x1) / 2, 0.004, (z0 + z1) / 2]} c={MUD} cast={false} />)
        : <G><Box s={[33, 0.2, 12]} p={[0, -0.1, FZ + 6]} c={GRASS} cast={false} /><mesh geometry={mudGeo} position={[0, 0.02, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(MUD)} /></G>}
      <mesh geometry={ramp} receiveShadow material={mat("#a6b85e", { flat: true })} />
      <mesh geometry={dome} receiveShadow castShadow material={mat(DOME, { flat: true })} />
      <Plateau t={t} />
    </G>
  );
};
/** planalto da esquerda (x<LX1) em blocos: o pântano/alberca é um buraco quadrado; no corte, a frente abre até CUT_FLOOR */
const PXB = [-420, AL[0] - 12, AL[0] - 5, AL[0] + 5, AL[0] + 12, LX1];
const PZB = [-420, -2.5, FZA, 7.5, FZA + 12, 420];
const Plateau: React.FC<{ t: number }> = ({ t }) => {
  const open = cutA(t), cells: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const mid = i >= 1 && i <= 3, pit = i === 2;
    let top = H;
    if (mid && j === 1 && pit) top = PIT_BOT;
    if (mid && j === 2) top = open ? CUT_FLOOR : pit ? PIT_BOT : H;
    if (mid && j === 3) top = open ? CUT_FLOOR : H;
    const [x0, x1, z0, z1] = [PXB[i], PXB[i + 1], PZB[j], PZB[j + 1]];
    cells.push(<Box key={`${i}${j}`} s={[x1 - x0, top + 10, z1 - z0]} p={[(x0 + x1) / 2, (top - 10) / 2, (z0 + z1) / 2]} c={top >= H ? "#b5c26a" : "#8a6a48"} cast={false} />);
  }
  return <G>{cells}</G>;
};

// ---------------------------------------------------------------- serra ao fundo, árvores e nopais
const Sierra: React.FC = () => (
  <G>
    {([[-60, -260, 70, 46], [40, -280, 80, 54], [150, -250, 60, 40], [240, -230, 70, 44], [-170, -230, 60, 40], [300, -120, 50, 34]] as const).map(([x, z, r, h], i) => (
      <Cone key={i} rad={r} h={h} seg={8} p={[x, h / 2 - 1, z]} c={i % 2 ? "#8f9a7a" : "#9aa286"} o={{ flat: true }} cast={false} />
    ))}
  </G>
);
const TREE_SPOTS: V3[] = Array.from({ length: 40 }, (_, i): V3 => [lerp(-80, 240, rnd(i * 5 + 1)), 0, lerp(-120, 110, rnd(i * 5 + 2))])
  .filter(([x, , z]) => gH(x, z) < 0.05 && !(Math.abs(x) < 34 && z > -36 && z < 44) && Math.abs(z - ZR) > 5 && !(x > 40 && x < 104 && z > 30 && z < 60));
const NOPAL: V3[] = [[-38, 0, 30], [-44, 0, 12], [36, 0, 30], [40, 0, -24], [-35, 0, -20], [30, 0, 42], [-30, 0, 46]];
const Nopales: React.FC = () => (
  <G>{NOPAL.map((p, i) => <G key={i} p={p} r={[0, rnd(i) * 3, 0]} sc={1 + rnd(i + 4) * 0.5}>
    <Box s={[0.9, 1.1, 0.22]} p={[0, 0.55, 0]} c="#5f9a3a" /><Box s={[0.7, 0.85, 0.2]} p={[0.55, 1.35, 0]} r={[0, 0, -0.5]} c="#6aa844" />
    <Box s={[0.7, 0.85, 0.2]} p={[-0.5, 1.3, 0]} r={[0, 0, 0.45]} c="#6aa844" /><Sph rad={0.12} p={[0.8, 1.85, 0]} c="#e0405a" ws={6} hs={4} />
  </G>)}</G>
);

// ---------------------------------------------------------------- a cidade no morro (instanciada), o convento da Cruz
const segDist = (x: number, z: number, a: V3, b: V3) => {
  const dx = b[0] - a[0], dz = b[2] - a[2], u = clamp(((x - a[0]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz));
  return Math.hypot(x - a[0] - u * dx, z - a[2] - u * dz);
};
export const PIPE_A: V3[] = [on(114.6, 1.6, 0.25), on(116.5, 8, 0.25), on(F1[0] - 0.9, F1[2] - 0.9, 0.25)];
export const PIPE_B: V3[] = [on(F1[0] + 0.9, F1[2] + 0.9, 0.25), on(124.5, 23, 0.25), on(F2[0] - 0.9, F2[2] - 0.9, 0.25)];
export const PIPE_C: V3[] = [on(114.6, -0.8, 0.25), on(124, -2.5, 0.25), on(F3[0] - 1.1, F3[2], 0.25)];
const freeCity = (x: number, z: number) => {
  if (Math.abs(z) < 5 && x < SUM[0] + 4) return false;                          // arcaria
  if (Math.hypot(x - SUM[0], z) < 13) return false;                             // cume: caixa e convento
  for (const P of [PIPE_A, PIPE_B, PIPE_C]) for (let k = 0; k < P.length - 1; k++) if (segDist(x, z, P[k], P[k + 1]) < 2.8) return false;
  for (const f of [F1, F2, F3]) if (Math.hypot(x - f[0], z - f[2]) < 5.5) return false;
  if (Math.abs(z - ZG) < 4.5 && x < GX1 + 6) return false;                      // o plano fantasma
  if (x > 66 && x < 104 && z > 36) return false;                               // obrajes, rio, doentes
  if (Math.hypot(x - 125, z - 26) < 7) return false;                            // câmeras das praças
  if (segDist(x, z, [115.5, 0, 32.4], CAJA) < 3.4) return false;                // «nunca»: a câmera vê a caixa por cima das casas
  return true;
};
const HOUSE_C = ["#e3a857", "#d0703f", "#e89a8c", "#f0c95a", "#f2ece0", "#e7b48a", "#c96a5a", "#f4dcb0"];
const HOUSES = (() => {
  const out: { x: number; z: number; w: number; d: number; h: number; y: number; c: string; r: number }[] = [];
  let i = 0;
  for (let x = 34; x <= 194; x += 4.4) for (let z = -54; z <= 54; z += 4.4) {
    i++;
    const px = x + (rnd(i) - 0.5) * 1.6, pz = z + (rnd(i + 1) - 0.5) * 1.6, g = gH(px, pz);
    if (g < 0.45 || g > HS - 0.35 || !freeCity(px, pz)) continue;
    out.push({ x: px, z: pz, w: 2.4 + rnd(i + 2) * 1.2, d: 2.4 + rnd(i + 3) * 1.2, h: 1.3 + rnd(i + 4) * 1.3, y: g, c: HOUSE_C[i % HOUSE_C.length], r: (rnd(i + 5) - 0.5) * 0.4 });
  }
  return out;
})();
/** casas da beira da cidade, no plano, perto da lenda */
const EDGE_HOUSES: V3[] = [[50, 0, 31], [55.5, 0, 30.5], [62, 0, 31.5], [67.5, 0, 33], [44.5, 0, 33.5]];
const City: React.FC = () => {
  const ims = useMemo(() => {
    const n = HOUSES.length, box = new THREE.BoxGeometry(1, 1, 1), o = new THREE.Object3D(), col = new THREE.Color();
    const body = new THREE.InstancedMesh(box, mat("#ffffff"), n), roof = new THREE.InstancedMesh(box, mat("#ffffff"), n), door = new THREE.InstancedMesh(box, mat("#4a3426"), n);
    HOUSES.forEach((q, k) => {
      o.rotation.set(0, q.r, 0);
      o.position.set(q.x, q.y - 0.9 + (q.h + 0.9) / 2, q.z); o.scale.set(q.w, q.h + 0.9, q.d); o.updateMatrix(); body.setMatrixAt(k, o.matrix); body.setColorAt(k, col.set(q.c));
      o.position.set(q.x, q.y + q.h + 0.09, q.z); o.scale.set(q.w + 0.16, 0.18, q.d + 0.16); o.updateMatrix(); roof.setMatrixAt(k, o.matrix); roof.setColorAt(k, col.set(q.c).multiplyScalar(0.82));
      o.position.set(q.x + Math.sin(q.r) * (q.d / 2), q.y + 0.45, q.z + Math.cos(q.r) * (q.d / 2)); o.scale.set(0.6, 0.95, 0.08); o.updateMatrix(); door.setMatrixAt(k, o.matrix);
    });
    for (const m of [body, roof]) { m.castShadow = true; m.receiveShadow = true; }
    return { body, roof, door };
  }, []);
  return (
    <G>
      <primitive object={ims.body} /><primitive object={ims.roof} /><primitive object={ims.door} />
      {EDGE_HOUSES.map((p, i) => <G key={i} p={p}><Box s={[3.2, 2.4, 3]} p={[0, 1.2, 0]} c={HOUSE_C[(i * 3) % 8]} /><Box s={[3.4, 0.18, 3.2]} p={[0, 2.49, 0]} c="#b8674a" /><Box s={[0.6, 1, 0.06]} p={[0, 0.5, 1.52]} c="#4a3426" cast={false} /></G>)}
    </G>
  );
};
const ConventCruz: React.FC = () => (
  <G p={CONV}>
    <Box s={[12, 0.25, 9]} p={[0, 0.0, 0.6]} c="#e2d3b4" cast={false} />
    {/* nave e fachada */}
    <Box s={[3.0, 3.4, 6.2]} p={[0, 1.7, -0.6]} c="#efe1c2" /><Box s={[3.3, 0.3, 6.5]} p={[0, 3.5, -0.6]} c="#d9c39a" />
    <Box s={[1.0, 1.7, 0.1]} p={[0, 0.85, 2.52]} c="#4a3426" cast={false} /><Sph rad={0.5} pl={PI / 2} p={[0, 1.7, 2.52]} sc={[1, 1, 0.2]} c="#4a3426" cast={false} />
    {/* cúpula de azulejo atrás */}
    <Cyl rt={1.25} h={1.0} p={[0, 4.1, -2.4]} c="#efe1c2" seg={12} /><Sph rad={1.3} pl={PI / 2} p={[0, 4.6, -2.4]} c="#e0a43a" o={{ rough: 0.5 }} ws={14} hs={8} />
    <Cyl rt={0.25} h={0.7} p={[0, 6.1, -2.4]} c="#efe1c2" seg={8} />
    {/* torre do sino */}
    <Box s={[1.4, 5.4, 1.4]} p={[-2.2, 2.7, 1.8]} c="#ead8b4" /><Box s={[1.1, 1.0, 1.5]} p={[-2.2, 4.9, 1.8]} c="#5a4030" cast={false} />
    <Sph rad={0.75} pl={PI / 2} p={[-2.2, 5.4, 1.8]} c="#e0a43a" ws={12} hs={6} /><Cyl rt={0.3} rb={0.5} h={0.7} p={[-2.2, 4.85, 1.8]} c="#c8a040" seg={8} />
    {/* a cruz de pedra no átrio */}
    <G p={[2.6, 0, 3.4]}><Box s={[0.9, 0.5, 0.9]} p={[0, 0.25, 0]} c="#d6c6a6" /><Box s={[0.28, 2.6, 0.28]} p={[0, 1.8, 0]} c="#cbb68e" /><Box s={[1.3, 0.26, 0.28]} p={[0, 2.5, 0]} c="#cbb68e" /></G>
    {[[0, 7.0, -2.4], [-2.2, 6.75, 1.8]].map((q, i) => <G key={i} p={q as V3}><Box s={[0.1, 0.9, 0.1]} c="#3a2a1a" cast={false} /><Box s={[0.5, 0.1, 0.1]} p={[0, 0.15, 0]} c="#3a2a1a" cast={false} /></G>)}
  </G>
);

// ---------------------------------------------------------------- a arcaria (instanciada) — a real e o fantasma de 1721
type Spec = { x0: number; n: number; s: number; pw: number; pd: number; head: number; z: number; c: string; c2: string; ghost?: boolean; ground: (x: number) => number };
type St = { k: number; top: number; rz: number; chan: number; water: number };
const headGeo = (s: number, pw: number, head: number, pd: number) => {
  const r = (s - pw) / 2, sh = new THREE.Shape();
  sh.moveTo(-s / 2, 0); sh.lineTo(-r, 0); sh.absarc(0, 0, r, PI, 0, true); sh.lineTo(s / 2, 0); sh.lineTo(s / 2, head); sh.lineTo(-s / 2, head); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: pd, bevelEnabled: false, curveSegments: 8 });
  g.translate(0, 0, -pd / 2); return g;
};
const ND = 120;
const ArcadeIM: React.FC<{ spec: Spec; t: number; st: (i: number) => St; speed?: number; front?: number }> = ({ spec, t, st, speed = 2.6, front = 1 }) => {
  const ims = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const go = { opacity: 0.42, emissive: "#8fc8ff", ei: 0.4, depthWrite: false };
    const m1 = spec.ghost ? mat(spec.c, go) : mat(spec.c), m2 = spec.ghost ? mat(spec.c2, go) : mat(spec.c2);
    const mk = (g: THREE.BufferGeometry, m: THREE.Material, n: number, sh = true) => { const im = new THREE.InstancedMesh(g, m, n); im.castShadow = sh && !spec.ghost; im.receiveShadow = !spec.ghost; im.frustumCulled = false; return im; };
    return {
      pier: mk(box, m1, spec.n + 1), head: mk(headGeo(spec.s, spec.pw, spec.head, spec.pd), m1, spec.n), deck: mk(box, m2, spec.n), wall: mk(box, m2, spec.n * 2),
      water: mk(box, mat(WATER, { rough: 0.2, emissive: "#1f8fe0", ei: 0.55 }), spec.n, false), dash: mk(box, mat("#eaf7ff", { emissive: "#ffffff", ei: 0.8 }), ND, false),
      o: new THREE.Object3D(),
    };
  }, [spec]);
  const { pier, head, deck, wall, water, dash, o } = ims, { x0, n, s: sp, pw, pd, z } = spec;
  const set = (im: THREE.InstancedMesh, idx: number, p: V3, sc: V3, rz = 0) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, 0, rz); o.scale.set(sc[0], sc[1], sc[2]); o.updateMatrix(); im.setMatrixAt(idx, o.matrix); };
  const hide = (im: THREE.InstancedMesh, idx: number) => set(im, idx, [0, -600, 0], [1e-4, 1e-4, 1e-4]);
  const sts = Array.from({ length: n }, (_, i) => st(i)), wz = pd * 0.39, wt = pd * 0.14, len = n * sp;
  for (let i = 0; i <= n; i++) {
    const a = sts[Math.min(i, n - 1)], xl = x0 + i * sp;
    if (a.k > 0.001) {
      const k = Math.min(1.04, a.k), gl = spec.ground(xl), rise = (1 - k) * (a.top - gl + 0.9), pt = a.top - spec.head - rise, pb = gl - 0.6;
      if (pt > pb + 0.05) set(pier, i, [xl, (pt + pb) / 2, z], [pw, pt - pb, pd]); else hide(pier, i);
      if (i < n) set(head, i, [xl + sp / 2, a.top - spec.head - rise, z], [1, 1, 1]);
    } else { hide(pier, i); if (i < n) hide(head, i); }
    if (i === n) break;
    const xc = xl + sp / 2;
    if (a.chan) {
      set(deck, i, [xc, a.top + DECK / 2, z], [sp + 0.02, DECK, pd + 0.2], a.rz);
      set(wall, 2 * i, [xc, a.top + DECK + WALLH / 2, z - wz], [sp + 0.02, WALLH, wt], a.rz); set(wall, 2 * i + 1, [xc, a.top + DECK + WALLH / 2, z + wz], [sp + 0.02, WALLH, wt], a.rz);
    } else { hide(deck, i); hide(wall, 2 * i); hide(wall, 2 * i + 1); }
    if (a.chan && a.water && xc < x0 + len * front) set(water, i, [xc, a.top + WY, z], [sp + 0.02, 0.06, pd * 0.62], a.rz); else hide(water, i);
  }
  for (let j = 0; j < ND; j++) {
    const x = x0 + fract(j / ND + (t * speed) / len) * len, i = Math.min(n - 1, Math.floor((x - x0) / sp)), a = sts[i], xc = x0 + (i + 0.5) * sp;
    if (a.chan && a.water && x < x0 + len * front) set(dash, j, [x, a.top + WY + 0.05 + (x - xc) * Math.tan(a.rz), z + (rnd(j) - 0.5) * pd * 0.32], [0.95, 0.04, 0.13], a.rz); else hide(dash, j);
  }
  for (const m of [pier, head, deck, wall, water, dash]) m.instanceMatrix.needsUpdate = true;
  return <G><primitive object={pier} /><primitive object={head} /><primitive object={deck} /><primitive object={wall} /><primitive object={water} /><primitive object={dash} /></G>;
};
const REAL: Spec = { x0: XA0, n: NA, s: S, pw: PW, pd: PD, head: HEAD, z: 0, c: CANT, c2: CANT2, ground: (x) => gH(x, 0) };
const GHOST: Spec = { x0: GX0, n: NG, s: GS, pw: 0.5, pd: 1.0, head: 0.85, z: ZG, c: "#d6ecff", c2: "#bfe0ff", ghost: true, ground: (x) => gH(x, ZG) };
const GC = Array.from({ length: NA }, (_, i) => gH(XA0 + (i + 0.5) * S, 0));
const SLOPE = Array.from({ length: NA }, (_, i) => Math.atan2(gH(XA0 + (i + 1) * S, 0) - gH(XA0 + i * S, 0), S));
/** altura do topo dos arcos reais: some no «primer plan», volta da altura do fantasma em «así que» e cresce ×3 */
export const htop = (t: number) => {
  if (t < T.primer) return H;
  if (t < T.asi) return lerp(H, -1.5, ease(t, T.primer + 0.05, T.primer + 0.7));
  if (t < T.manda - 0.02) return lerp(HG, H, ease(t, T.asi + 0.3, T.tres + 0.5));
  return H;
};
const archK = (i: number, t: number) => {
  if (hook(t) || cta(t)) return 1;
  if (t < T.setenta) { const d = (NA - 1 - i) * (1.1 / NA); return t < T.m1726 + 0.6 ? 1 - ease(t, T.queretaro + 0.1 + d, T.queretaro + 0.35 + d) : 0; }
  return outBack(prog(t, ARCH_T(i), ARCH_T(i) + 0.3));
};
const realWater = (t: number) => hook(t) || (t >= C4 && t < T.primer) || t >= T.tres + 0.5;
const realSt = (t: number) => (i: number): St => {
  const k = archK(i, t), w = realWater(t) ? 1 : 0;
  if (hook(t) || cta(t)) return { k, top: H, rz: 0, chan: 1, water: 1 };
  if (t < C4) return { k, top: H, rz: 0, chan: t < T.m1726 + 0.6 && k > 0.5 ? 1 : 0, water: 0 };
  if (t < T.setenta) { const lift = ease(t, T.encima, T.setenta - 0.03); return { k: 0, top: lerp(GC[i] + 0.02, H, lift), rz: lerp(SLOPE[i], 0, lift), chan: 1, water: w }; }
  return { k, top: htop(t), rz: 0, chan: 1, water: w };
};
const ghostSt = (t: number) => (i: number): St => {
  if (!twist(t) || t > T.obra + 0.6) return { k: 0, top: HG, rz: 0, chan: 0, water: 0 };
  const k = popK(t, T.primer + 0.15 + i * (0.8 / NG), 0.3) * (1 - ease(t, T.obra, T.obra + 0.5));
  return { k, top: HG, rz: 0, chan: k > 0.5 ? 1 : 0, water: t >= C7 ? 1 : 0 };
};
const Arcades: React.FC<{ t: number }> = ({ t }) => {
  const gf = t >= C7 ? ease(t, C7 + 0.05, T.sinagua + 0.1) : 0;
  return (
    <G>
      <ArcadeIM spec={REAL} t={t} st={realSt(t)} />
      {twist(t) && t < T.obra + 0.6 ? <ArcadeIM spec={GHOST} t={t} st={ghostSt(t)} front={gf} speed={2.2} /> : null}
    </G>
  );
};
/** a água do fantasma chega ao fim (na encosta, abaixo da cima) e cai numa poça */
const GhostEnd: React.FC<{ t: number }> = ({ t }) => {
  if (!twist(t) || t < C7 || t > T.obra) return null;
  const k = ease(t, T.sinagua, T.sinagua + 0.5), end: V3 = [GX1 - 0.3, HG + WY, ZG], gy = gH(GX1 + 1.4, ZG);
  return (
    <G>
      {k > 0.02 ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.6 + i / 6); return <Sph key={i} rad={0.14} p={[end[0] + 0.4 + u * 1.0, lerp(end[1], gy + 0.1, u * u), ZG + (rnd(i) - 0.5) * 0.3]} c="#7cc8ff" o={{ emissive: "#2f8fd8", ei: 0.6 }} cast={false} ws={6} hs={4} />; }) : null}
      <mesh position={[GX1 + 1.6, gy + 0.06, ZG]} rotation={[-PI / 2, 0, 0]} scale={[Math.max(0.01, k), Math.max(0.01, k), 1]} material={mat("#5ab8f0", { emissive: "#2f8fd8", ei: 0.3 })}><circleGeometry args={[1.4, 16]} /></mesh>
    </G>
  );
};

// ---------------------------------------------------------------- o vale: lodo, poças, juncos, bolhas e moscas
const PUDDLES = Array.from({ length: 22 }, (_, i) => ({ x: lerp(-24, 27, rnd(i * 7 + 1)), z: lerp(-28, 30, rnd(i * 7 + 2)), r: lerp(1.2, 3.2, rnd(i * 7 + 3)) }))
  .filter((q) => Math.abs(q.z) > 2.2 || Math.abs(q.x % 3) > 1);
const REEDS: V3[] = Array.from({ length: 30 }, (_, i): V3 => [lerp(-26, 29, rnd(i * 11 + 4)), 0, lerp(-30, 31, rnd(i * 11 + 5))]).filter(([x, , z]) => Math.abs(z) > 2.5 && !(x > -15 && x < 9 && z > 10 && z < 26));
const inHoleV = (x: number, z: number) => Math.abs(x) < 17 && z > FZ - 0.4 && z < FZ + 12.4;
const Bubbles: React.FC<{ t: number; spots: V3[]; size?: number; c?: string }> = ({ t, spots, size = 0.35, c = "#8a7a52" }) => (
  <G>{spots.map((p, i) => { const u = fract(t * 0.8 + rnd(i) * 3); const s = u < 0.8 ? Math.sin((u / 0.8) * PI * 0.5) * size : 0; return <Sph key={i} rad={1} p={[p[0], p[1] + s * 0.4, p[2]]} sc={Math.max(0.001, s)} pl={PI / 2} c={c} o={{ rough: 0.3 }} cast={false} ws={8} hs={5} />; })}</G>
);
const Flies: React.FC<{ t: number; c: V3; n?: number; r?: number }> = ({ t, c, n = 6, r = 1.6 }) => (
  <G>{Array.from({ length: n }, (_, i) => { const a = t * (4 + i * 0.7) + i * 2, rr = r * (0.6 + 0.4 * rnd(i));
    return <G key={i} p={[c[0] + Math.cos(a) * rr, c[1] + 0.5 * Math.sin(t * 7 + i) + rnd(i + 3), c[2] + Math.sin(a * 1.3) * rr]}>
      <Sph rad={0.09} c="#1a1a1a" cast={false} ws={6} hs={4} />
      <Box s={[0.22, 0.02, 0.1]} p={[0, 0.07, 0]} r={[0, 0, 0.5 * Math.sin(t * 60 + i)]} c="#e8f0ff" o={{ opacity: 0.7, depthWrite: false }} cast={false} />
    </G>; })}</G>
);
const ValleySwamp: React.FC<{ t: number }> = ({ t }) => {
  const open = cutV(t);
  return (
    <G>
      {PUDDLES.map((q, i) => (open && inHoleV(q.x, q.z) ? null : <mesh key={i} position={[q.x, 0.03, q.z]} rotation={[-PI / 2, 0, 0]} material={mat(i % 3 ? "#6f7a48" : "#5d5a3a", { rough: 0.25 })}><circleGeometry args={[q.r, 12]} /></mesh>))}
      {REEDS.map((p, i) => (open && inHoleV(p[0], p[2]) ? null : <G key={i} p={p}>{[0, 1, 2].map((k) => <Cone key={k} rad={0.12} h={1.4 + rnd(i + k) * 0.8} seg={4} p={[(k - 1) * 0.25, 0.7, (rnd(i + k * 3) - 0.5) * 0.3]} r={[0, 0, (k - 1) * 0.15 + 0.06 * Math.sin(t * 2 + i)]} c={k % 2 ? "#6f9a3a" : "#5a8a32"} cast={false} />)}</G>))}
      {t > T.p2 - 0.1 && t < T.b2 ? <G>
        <Bubbles t={t} spots={PUDDLES.slice(0, 12).filter((q) => !(open && inHoleV(q.x, q.z))).map((q) => [q.x + 0.4, 0.04, q.z] as V3)} size={0.45} />
        <Flies t={t} c={[0, 1.2, 9]} n={7} r={2.4} />
      </G> : null}
    </G>
  );
};

// ---------------------------------------------------------------- o corte do vale (face z=FZ): lodo, chão firme, o canal enterrado
// que se suja (✖) e as sapatas dos pilares descendo até o firme
const VSL = 6, VSG = 16;
const ValleyCut: React.FC<{ t: number }> = ({ t }) => {
  if (!cutV(t)) return null;
  const first = t < T.b2, A = first ? 0.05 + 0.08 * ease(t, T.enterrado0 + 0.3, T.ensuciarse) : 0.05;
  const brown = first ? ease(t, T.enterrado0 + 0.75, T.ensuciarse + 0.35) : 0, wc = qcol(WATER, "#7a5a32", brown, 8);
  return (
    <G>
      {Array.from({ length: VSL }, (_, i) => {
        const u = (i + 0.5) / VSL, y = MUDB + -MUDB * u;
        return Array.from({ length: VSG }, (_, k) => { const x = -16.5 + (k + 0.5) * (33 / VSG); return <Box key={`${i}-${k}`} s={[33 / VSG + 0.02, -MUDB / VSL + 0.01, 0.04]} p={[x, y + A * u * Math.sin(t * 6 - u * 5 - x * 0.4), FZ + 0.025]} c={i % 2 ? MUD : MUD2} cast={false} />; });
      })}
      {Array.from({ length: 26 }, (_, i) => <Sph key={i} rad={0.1 + rnd(i) * 0.08} p={[lerp(-16, 16, rnd(i + 2)), lerp(MUDB + 0.3, -0.3, rnd(i + 5)), FZ + 0.06]} c="#4f4430" cast={false} ws={6} hs={4} />)}
      <Box s={[33, MUDB - FIRMB, 0.04]} p={[0, (MUDB + FIRMB) / 2, FZ + 0.025]} c="#d9b46a" cast={false} />
      {Array.from({ length: 30 }, (_, i) => <Sph key={i} rad={0.08 + rnd(i) * 0.06} p={[lerp(-16, 16, rnd(i + 12)), lerp(FIRMB + 0.1, MUDB - 0.1, rnd(i + 15)), FZ + 0.06]} c="#c49a4e" cast={false} ws={6} hs={4} />)}
      <Box s={[33, FIRMB - DEEPV, 0.04]} p={[0, (FIRMB + DEEPV) / 2, FZ + 0.02]} c="#8f8570" cast={false} />
      <Box s={[33, -DEEPV, 30]} p={[0, DEEPV / 2, FZ - 15.05]} c={MUD2} cast={false} />
      <Box s={[33.8, 0.4, 12]} p={[0, DEEPV - 0.2, FZ + 6]} c="#5f5a48" />
      {[-16.7, 16.7].map((x) => <Box key={x} s={[0.4, -DEEPV, 12]} p={[x, DEEPV / 2, FZ + 6]} c={MUD2} />)}
      <Box s={[33.8, -DEEPV, 0.4]} p={[0, DEEPV / 2, FZ + 12.2]} c={MUD2} />
      {[[-16.7, FZ + 6, 0.12, 12], [16.7, FZ + 6, 0.12, 12], [0, FZ + 12.2, 33.8, 0.12], [0, FZ + 0.06, 33.8, 0.12]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.06, d]} p={[x, 0.06, z]} c="#ffe9a8" o={{ emissive: "#ffe9a8", ei: 0.3 }} cast={false} />)}
      {first ? <G>
        {/* o canal enterrado: lajes de pedra, água correndo; o lodo entra pelas frestas e ela escurece */}
        {[-1.12, -2.08].map((y) => <Box key={y} s={[33, 0.22, 0.08]} p={[0, y, FZ + 0.08]} c="#b9a9a0" cast={false} />)}
        <Box s={[33, 0.74, 0.06]} p={[0, -1.6, FZ + 0.07]} c={wc} o={{ emissive: brown > 0.5 ? "#3a2a10" : "#1f8fe0", ei: 0.35 }} cast={false} />
        {Array.from({ length: 24 }, (_, i) => <Box key={i} s={[0.7, 0.04, 0.04]} p={[-16 + fract(i / 24 + t * 0.1) * 32, -1.6 + (rnd(i) - 0.5) * 0.4, FZ + 0.11]} c={brown > 0.6 ? "#a08050" : "#eaf7ff"} o={{ emissive: "#ffffff", ei: brown > 0.6 ? 0 : 0.4 }} cast={false} />)}
        {[-12, -7, -2, 3, 8, 13].map((x, k) => <G key={x}>
          <Box s={[0.5, 0.24, 0.1]} p={[x, -1.12, FZ + 0.1]} c="#4f4430" cast={false} />
          {Array.from({ length: 3 }, (_, q) => { const a = T.enterrado0 + 0.35 + k * 0.1 + q * 0.3, u = fract((t - a) / 0.9); return t > a ? <Sph key={q} rad={0.17} p={[x + 0.1 * Math.sin(u * 6), lerp(-0.4, -1.65, u), FZ + 0.14]} sc={[1, 1.3, 1]} c="#6a4a26" cast={false} ws={8} hs={6} /> : null; })}
        </G>)}
        <XMark t={t} a={T.ensuciarse + 0.35} b={T.b2 + 0.02} p={[0, -1.6, FZ + 0.8]} sc={1.6} />
      </G> : <G>
        {/* as sapatas: uma sob cada pilar, descendo pelo lodo até o chão firme (brilho ao tocar) */}
        {Array.from({ length: 11 }, (_, j) => {
          const x = -15 + 3 * j, k = ease(t, FOOT_T(j), FOOT_T(j) + 0.42), bot = lerp(0, MUDB - 0.45, k), glow = Math.sin(PI * clamp(prog(t, FOOT_T(j) + 0.38, FOOT_T(j) + 0.9))) * 0.6;
          return <G key={j}>
            {k > 0.01 ? <Box s={[1.5, -bot, 0.08]} p={[x, bot / 2, FZ + 0.07]} c="#d48a7b" cast={false} /> : null}
            {k > 0.01 ? <Box s={[1.9, 0.3, 0.1]} p={[x, bot + 0.15, FZ + 0.08]} c="#c47a6b" cast={false} /> : null}
            {glow > 0.02 ? <Sph rad={0.3 + 0.25 * glow} p={[x, MUDB - 0.3, FZ + 0.2]} c="#ffd43a" o={{ emissive: "#ffb000", ei: 1.4, opacity: 0.7 * glow, depthWrite: false }} cast={false} ws={10} hs={8} /> : null}
          </G>;
        })}
      </G>}
    </G>
  );
};

// ---------------------------------------------------------------- a alberca: pântano → cavam → 18 nascentes → muros → água ×4
const mudTop = (t: number) => (albBuilt(t) ? DUG : t < T.cavan ? MUD0 : lerp(MUD0, DUG, ease(t, T.cavan, T.encuentran + 0.35)));
const murkyTop = (t: number) => (swampA(t) ? H - 0.15 : t < T.cavan + 0.2 ? lerp(H - 0.15, MUD0, ease(t, T.c1 + 0.05, T.cavan + 0.2)) : 0);
const cleanTop = (t: number) => (albBuilt(t) ? CLEAN : t < T.muros + 0.25 ? 0 : lerp(DUG, CLEAN, ease(t, T.muros + 0.25, T.ahora - 0.05)));
const wallK = (t: number) => (albBuilt(t) ? 1 : ease(t, T.encierran - 0.05, T.muros + 0.5));
const SPRINGS: V3[] = Array.from({ length: 18 }, (_, k): V3 => [AL[0] - 3.9 + (k % 6) * 1.56 + (rnd(k) - 0.5) * 0.5, DUG, -1.9 + Math.floor(k / 6) * 1.95 + (rnd(k + 9) - 0.5) * 0.4]);
const SPRING_ORDER = [7, 2, 13, 10, 4, 16, 0, 9, 14, 5, 11, 1, 17, 6, 12, 3, 15, 8]; // pipocam espalhadas, não em fila
const OBRERO: Costume = { skin: "#b87a50", top: "#f2ede0", bottom: "#e9e2d0", hat: "straw", hatC: "#d9b25a", boot: "#7a4a2a", sleeves: true, scarf: "#c9a27a" };
const CHUNKS = 12, CHUNK_T = (k: number) => T.cavan + 0.12 + k * 0.13;
const PILE: V3 = [AL[0] - 8.5, H, -5.5];
const Alberca: React.FC<{ t: number }> = ({ t }) => {
  const open = cutA(t), zf = open ? FZA : 7.45, mt = mudTop(t), wt = murkyTop(t), ct = cleanTop(t), wk = wallK(t), x0 = AL[0] - 4.95, x1 = AL[0] + 4.95;
  const box = (y0: number, y1: number, c: string, o = {}, inset = 0) => (y1 - y0 > 0.02 ? <Box s={[x1 - x0 - 2 * inset, y1 - y0, zf + 2.45 - 2 * inset]} p={[(x0 + x1) / 2, (y0 + y1) / 2, (zf - 2.45) / 2]} c={c} o={o} cast={false} /> : null);
  const courses = 8, ch = (CLEAN + 0.4 - (DUG - 0.25)) / courses;
  const springsOn = t >= SPRING_T(0) || albBuilt(t);
  return (
    <G>
      {/* forro de terra nas paredes do buraco (sem ele a grama dos blocos aparecia lá dentro) */}
      <Box s={[10, H - PIT_BOT, 0.06]} p={[AL[0], (H + PIT_BOT) / 2, -2.47]} c="#8a6a48" cast={false} />
      {[x0 - 0.02, x1 + 0.02].map((x) => <Box key={x} s={[0.06, H - PIT_BOT, zf + 2.5]} p={[x, (H + PIT_BOT) / 2, (zf - 2.5) / 2]} c="#8a6a48" cast={false} />)}
      {/* conteúdo: lodo, água parada (pântano) ou água limpa (alberca) */}
      {box(PIT_BOT, mt, "#5f5032")}
      {wt > mt + 0.02 ? box(mt, wt, "#55502a", { rough: 0.3 }) : null}
      {ct > 0 ? box(DUG, ct, "#4fb2ee", { rough: 0.15, opacity: 0.72, emissive: "#1f8fe0", ei: 0.25, depthWrite: false }, 0.32 * wk) : null}
      {/* nenúfares e bolhas do pântano */}
      {wt > mt + 0.1 ? <G>
        {[[-3, -1.2], [2.2, 0.4], [-0.8, 1.8], [3.4, 3.6], [-3.2, 5.2], [1, 6.2]].filter(([, z]) => z < zf - 0.4).map(([x, z], i) => <Cyl key={i} rt={0.55} h={0.04} p={[AL[0] + x, wt + 0.02, z]} c="#5a9a3a" seg={10} cast={false} />)}
        <Bubbles t={t} spots={[[-1.5, 0, -0.5], [1.8, 0, 1.5], [-3, 0, 2.2], [0.5, 0, -1.6], [3, 0, 5], [-2, 0, 6]].filter(([, , z]) => z < zf - 0.3).map(([x, , z]) => [AL[0] + x, wt, z] as V3)} size={0.3} c="#7a8a4a" />
      </G> : null}
      {/* as 18 nascentes no fundo */}
      {springsOn ? SPRINGS.map((p, k) => {
        const a = albBuilt(t) ? -9 : SPRING_T(SPRING_ORDER.indexOf(k)), s = popK(t, a, 0.25);
        if (s <= 0.01 || p[2] > zf - 0.2) return null;
        return <G key={k} p={p} sc={Math.max(0.001, s) * 1.6}>
          <Cyl rt={0.28} h={0.04} p={[0, 0.03, 0]} c="#bff0ff" o={{ emissive: "#3fd0ff", ei: 1.1 }} seg={10} cast={false} />
          {[0, 1, 2].map((q) => { const u = fract(t * 1.7 + q / 3 + rnd(k)); return <Sph key={q} rad={0.13 * (1 - u * 0.5)} p={[0.06 * Math.sin(u * 9 + k), u * 0.9, 0]} c="#9fe6ff" o={{ emissive: "#3fc0ff", ei: 0.9 }} cast={false} ws={6} hs={4} />; })}
        </G>;
      }) : null}
      {/* os muros de pedra subindo em fiadas (o da frente só com o corte fechado) */}
      {wk > 0.001 ? Array.from({ length: courses }, (_, c) => {
        const k = clamp(wk * courses - c); if (k <= 0) return null;
        const y = DUG - 0.25 + c * ch + (ch * k) / 2, hh = ch * k, col = c % 2 ? "#cbb2a4" : "#b9a090";
        return <G key={c}>
          <Box s={[10.3, hh, 0.32]} p={[AL[0], y, -2.3]} c={col} cast={false} />
          {[AL[0] - 4.8, AL[0] + 4.8].map((x) => (c >= courses - 2 && x > AL[0] && true ? <G key={x}>
            <Box s={[0.32, hh, 2.0]} p={[x, y, -1.45]} c={col} cast={false} /><Box s={[0.32, hh, zf - 0.55]} p={[x, y, (zf + 0.55) / 2]} c={col} cast={false} />
          </G> : <Box key={x} s={[0.32, hh, zf + 2.45]} p={[x, y, (zf - 2.45) / 2]} c={col} cast={false} />))}
          {!open ? <Box s={[10.3, hh, 0.32]} p={[AL[0], y, 7.3]} c={col} cast={false} /> : null}
        </G>;
      }) : null}
      {/* o corte: camadas do planalto na face z=FZA */}
      {open ? <G>
        {[[AL[0] - 8.5, 7], [AL[0] + 8.5, 7]].map(([x, w], i) => <G key={i}>
          <Box s={[w, 0.35, 0.04]} p={[x, H - 0.175, FZA + 0.02]} c="#7fa84a" cast={false} />
          <Box s={[w, 1.4, 0.04]} p={[x, H - 1.05, FZA + 0.02]} c="#8a6a48" cast={false} />
          <Box s={[w, H - 1.75 - 5, 0.04]} p={[x, (H - 1.75 + 5) / 2, FZA + 0.02]} c="#a5835c" cast={false} />
          <Box s={[w, 5 - CUT_FLOOR, 0.04]} p={[x, (5 + CUT_FLOOR) / 2, FZA + 0.02]} c="#b8a080" cast={false} />
        </G>)}
        <Box s={[10, PIT_BOT - CUT_FLOOR, 0.04]} p={[AL[0], (PIT_BOT + CUT_FLOOR) / 2, FZA + 0.02]} c="#b8a080" cast={false} />
        {Array.from({ length: 24 }, (_, i) => <Sph key={i} rad={0.09 + rnd(i) * 0.06} p={[AL[0] + lerp(-11.5, 11.5, rnd(i + 3)), lerp(CUT_FLOOR + 0.15, 4.8, rnd(i + 6)), FZA + 0.05]} c="#9a8566" cast={false} ws={6} hs={4} />)}
        {[[AL[0] - 12, FZA + 6, 0.12, 12], [AL[0] + 12, FZA + 6, 0.12, 12], [AL[0], FZA + 12, 24, 0.12]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.06, d]} p={[x, H + 0.04, z]} c="#ffe9a8" o={{ emissive: "#ffe9a8", ei: 0.3 }} cast={false} />)}
      </G> : null}
      {/* obreiros cavando no lodo e os torrões voando para o monte */}
      <Crowd t={t} c={OBRERO} vis={t > T.cavan - 0.02 && t < T.encierran} scale={1.15}
        list={[[-2.6, 0.5, 0.4, "chisel"], [1.1, -1.0, -0.3, "pull"], [3.2, 1.3, -0.8, "chisel"]].map(([x, z, yaw, pose], i) => ({ p: [AL[0] + (x as number), mt, z as number] as V3, yaw: yaw as number, pose: pose as "chisel", ph: i * 0.5 }))} />
      {t > T.cavan && t < T.encierran + 0.6 ? Array.from({ length: CHUNKS }, (_, k) => {
        const a = CHUNK_T(k), u = prog(t, a, a + 0.65); if (t < a) return null;
        const pile: V3 = [PILE[0] + (rnd(k) - 0.5) * 1.6, H + 0.2 + Math.floor(k / 4) * 0.32, PILE[2] + (rnd(k + 2) - 0.5) * 1.6];
        if (u >= 1) return <Box key={k} s={[0.42, 0.34, 0.42]} p={pile} r={[0, rnd(k) * 2, 0]} c={k % 2 ? "#5f5032" : "#6f5a38"} />;
        const p = vlerp([AL[0] + (rnd(k + 5) - 0.5) * 5, mt + 0.3, 0], pile, u); p[1] += Math.sin(u * PI) * 3;
        return <Box key={k} s={[0.42, 0.34, 0.42]} p={p} r={[u * 5, u * 3, 0]} c={k % 2 ? "#5f5032" : "#6f5a38"} />;
      }) : null}
      {t > T.cavan && t < T.ahora ? <G p={PILE}><Sph rad={1.3} pl={PI / 2} sc={[1, 0.6 * ease(t, T.cavan + 0.3, T.encuentran + 0.6) + 0.01, 1]} c="#6a5434" ws={10} hs={6} /></G> : null}
    </G>
  );
};
/** o pântano visto de cima: lodo em volta, juncos, moscas (só em 1726) */
const SWAMP_RIM: [number, number, number][] = [[-5.6, -2.8, 1.4], [5.4, -3, 1.2], [-6, 3, 1.5], [6.2, 1.5, 1.3], [-5.5, 7.8, 1.6], [5.2, 8.1, 1.5], [0, 8.4, 1.6], [-1.5, -3.3, 1.3], [2.8, -3.2, 1.2]];
const SwampDecor: React.FC<{ t: number }> = ({ t }) => {
  if (albBuilt(t) || t > T.encierran) return null;
  const open = cutA(t);
  return (
    <G>
      {SWAMP_RIM.filter(([, z]) => !open || z < FZA - 0.5).map(([x, z, r], i) => <G key={i} p={[AL[0] + x, H, z]}>
        <Sph rad={r} pl={PI / 2} sc={[1, 0.08, 1]} c={i % 2 ? MUD : MUD2} cast={false} ws={10} hs={4} />
        {[0, 1, 2].map((k) => <Cone key={k} rad={0.12} h={1.3 + rnd(i + k) * 0.7} seg={4} p={[(k - 1) * 0.3, 0.65, (rnd(i + k) - 0.5) * 0.4]} r={[0, 0, (k - 1) * 0.18 + 0.05 * Math.sin(t * 2.3 + i)]} c={k % 2 ? "#6f9a3a" : "#5a8a32"} cast={false} />)}
      </G>)}
      {swampA(t) && t > T.p1 - 0.1 ? <Flies t={t} c={[AL[0], H + 0.9, 2.2]} n={7} r={2.6} /> : null}
      {/* o fio de água que escapa (pouca e parada) */}
      {swampA(t) ? <G>
        <Box s={[6.4, 0.04, 0.75]} p={[AL[0] + 8.0, H + 0.02, 4.8]} r={[0, -0.1, 0]} c="#7a5a36" cast={false} />
        <Box s={[6.4, 0.05, 0.16]} p={[AL[0] + 8.0, H + 0.04, 4.8]} r={[0, -0.1, 0]} c="#6f8a7a" o={{ rough: 0.3 }} cast={false} />
        <Beads t={t} pts={[[AL[0] + 4.6, H - 0.1, 4.45], [AL[0] + 5.2, H + 0.1, 4.5], [AL[0] + 11, H + 0.1, 5.1]]} n={5} speed={0.3} r={0.17} c="#9ec4d0" e="#3a7090" />
      </G> : null}
    </G>
  );
};
/** canal da alberca até o começo da arcaria (no chão do planalto): fio fino, depois ×4 */
const PlateauCanal: React.FC<{ t: number }> = ({ t }) => {
  if (!albBuilt(t)) return null;
  const xa = AL[0] + 5, xb = XA0, L = xb - xa, cx = (xa + xb) / 2;
  const w = hook(t) || t > T.cuatro + 0.4 ? 0.9 : lerp(0.18, 0.9, ease(t, T.brota1, T.cuatro + 0.35)), sp = lerp(0.6, 3.2, w);
  return (
    <G>
      <Box s={[L, DECK, PD + 0.2]} p={[cx, H + DECK / 2, 0]} c={CANT2} />
      {[-0.62, 0.62].map((z) => <Box key={z} s={[L, WALLH, 0.22]} p={[cx, H + DECK + WALLH / 2, z]} c={CANT2} />)}
      <Box s={[L, 0.06, w]} p={[cx, H + WY, 0]} c={WATER} o={{ rough: 0.2, emissive: "#1f8fe0", ei: 0.3 }} cast={false} />
      {Array.from({ length: 18 }, (_, i) => <Box key={i} s={[0.7, 0.03, 0.07]} p={[xa + fract(i / 18 + (t * sp) / L) * L, H + WY + 0.05, (rnd(i) - 0.5) * w * 0.6]} c="#eaf7ff" o={{ emissive: "#ffffff", ei: 0.6 }} cast={false} />)}
      {/* a bica: a alberca derrama no canal */}
      {Array.from({ length: 6 }, (_, i) => { const u = fract(t * 2 + i / 6); return <Sph key={i} rad={0.1 + 0.12 * w} p={[xa + 0.1 + u * 0.8, H + 0.85 - u * 0.2, (rnd(i) - 0.5) * w]} c="#7cc8ff" o={{ emissive: "#2f8fd8", ei: 0.5 }} cast={false} ws={6} hs={4} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- o cume: caixa de água, tubos de barro, fontes, a linha da caixa
const cajaWalls = (t: number) => (hook(t) || cta(t) ? 1 : t < C4 || twist(t) ? 0 : t < T.caja0 ? 0.25 : lerp(0.25, 1, ease(t, T.caja0, T.caja0 + 0.5)));
const cajaWater = (t: number) => (hook(t) || cta(t) ? WLC : t < C4 || twist(t) ? 0 : t < T.caja0 ? HS + 0.35 : lerp(HS + 0.35, WLC, ease(t, T.caja0 + 0.1, T.cima0 + 0.45)));
const pipesK = (t: number) => (t < T.tubos || twist(t) || cta(t) ? 0 : ease(t, T.tubos, T.cuesta + 0.3));
const jetOn = (t: number) => hook(t) || cta(t) || (t >= T.brota2 - 0.05 && !twist(t));
const Caja: React.FC<{ t: number }> = ({ t }) => {
  const wk = cajaWalls(t), wl = cajaWater(t); if (wk <= 0.01) return null;
  const hh = 2.1 * wk, flowing = realWater(t);
  return (
    <G p={[CAJA[0], 0, CAJA[2]]}>
      <Box s={[3.4, 0.3, 3.4]} p={[0, HS + 0.1, 0]} c="#cdb2a0" />
      {[[0, -1.55, 3.4, 0.3], [0, 1.55, 3.4, 0.3], [1.55, 0, 0.3, 3.4]].map(([x, z, w, d], i) => <Box key={i} s={[w, hh, d]} p={[x, HS + hh / 2, z]} c={CANT2} />)}
      <Box s={[0.3, hh, 1.2]} p={[-1.55, HS + hh / 2, -1.1]} c={CANT2} /><Box s={[0.3, hh, 1.2]} p={[-1.55, HS + hh / 2, 1.1]} c={CANT2} />
      {wk > 0.9 && (hook(t) || cta(t)) ? <G><Box s={[3.8, 0.22, 3.8]} p={[0, HS + hh + 0.11, 0]} c="#c47a6b" /><Cone rad={0.55} h={0.9} p={[0, HS + hh + 0.65, 0]} seg={4} r={[0, PI / 4, 0]} c="#c47a6b" /></G> : null}
      {wl > 0 ? <Box s={[2.8, wl - HS - 0.25, 2.8]} p={[0, (wl + HS + 0.25) / 2, 0]} c="#4fb2ee" o={{ rough: 0.15, emissive: "#1f8fe0", ei: 0.35 }} cast={false} /> : null}
      {wl > 0 && flowing ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.8 + i / 6); return <Sph key={i} rad={0.14} p={[-1.7 + u * 0.4, lerp(H + WY, wl, u * u), (rnd(i) - 0.5) * 0.5]} c="#7cc8ff" o={{ emissive: "#2f8fd8", ei: 0.6 }} cast={false} ws={6} hs={4} />; }) : null}
    </G>
  );
};
/** «un solo punto»: anel vermelho pulsando em volta do fim do canal */
const OnePoint: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.punto - 0.1 || t > T.c3) return null;
  const k = popK(t, T.punto - 0.1, 0.3);
  return <G>{[0, 1].map((q) => { const u = fract(t * 1.2 + q / 2), r = (2.4 + u * 2.2) * k; return <mesh key={q} position={[CAJA[0], HS + 0.35, CAJA[2]]} rotation={[-PI / 2, 0, 0]} material={mat("#ff5a3a", { emissive: "#ff2a1a", ei: 0.8, opacity: 1 - u * 0.7, depthWrite: false })}><ringGeometry args={[Math.max(0.01, r), r + 0.35, 32]} /></mesh>; })}</G>;
};
const ClayPipe: React.FC<{ t: number; pts: V3[]; k: number; ph: number }> = ({ t, pts, k, ph }) => {
  if (k <= 0.01) return null;
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0), segs: React.ReactNode[] = [];
  const N = Math.ceil(tot / 0.9);
  for (let s = 0; s < N; s++) {
    const u0 = s / N, u1 = (s + 0.92) / N; if (u1 > k) break;
    segs.push(<Pipe key={s} a={along(pts, u0)} b={along(pts, u1)} rad={0.2} c={s % 2 ? "#c8683a" : "#b85a30"} o={{ opacity: 0.6, depthWrite: false }} seg={8} cast={false} />);
  }
  return (
    <G>
      {/* a vala aberta no chão (o «corte» da rua) */}
      {pts.slice(1).map((p, i) => { const a = pts[i], m: V3 = [(a[0] + p[0]) / 2, (a[1] + p[1]) / 2 - 0.2, (a[2] + p[2]) / 2], len = L[i]; return <G key={i} p={m} r={[0, Math.atan2(p[0] - a[0], p[2] - a[2]), 0]}><G r={[-Math.atan2(p[1] - a[1], Math.hypot(p[0] - a[0], p[2] - a[2])), 0, 0]}><Box s={[0.75, 0.2, len + 0.4]} c="#6a4a30" cast={false} /></G></G>; })}
      {segs}
      {t > T.cuesta - 0.1 || hook(t) ? <Beads t={t} pts={pts} n={7} speed={0.9} r={0.13} ph={ph} /> : null}
    </G>
  );
};
const Fountain: React.FC<{ t: number; p: V3; top: number; main?: boolean }> = ({ t, p, top, main = false }) => {
  const on = jetOn(t), sp = p[1] + 1.15;
  let jt = on ? lerp(sp, top, ease(t, T.brota2 - 0.05, T.brota2 + 0.4)) : sp;
  if (hook(t) || cta(t)) jt = top;
  if (main && on && t > T.nunca + 0.3 && !cta(t)) jt = Math.min(top, top - 0.35 + 0.5 * Math.abs(Math.sin(t * 5)));
  const capped = main && on && t > T.nunca + 0.3 && top - jt < 0.06, filled = on || (t >= T.fuentes && !twist(t));
  return (
    <G>
      <mesh position={[p[0], p[1] + 0.05, p[2]]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#e6dcc4")}><circleGeometry args={[4.4, 16]} /></mesh>
      <Cyl rt={1.4} rb={1.5} h={0.75} p={[p[0], p[1] + 0.38, p[2]]} c="#d8c4a8" seg={8} />
      <Cyl rt={1.2} h={0.05} p={[p[0], p[1] + 0.77, p[2]]} c={filled ? "#4fb2ee" : "#a08a6a"} o={filled ? { emissive: "#1f8fe0", ei: 0.3 } : {}} seg={8} cast={false} />
      <Cyl rt={0.16} rb={0.24} h={0.45} p={[p[0], p[1] + 0.95, p[2]]} c="#cbb68e" seg={8} />
      {on && jt > sp + 0.05 ? <G>
        <Cyl rt={0.09} rb={0.13} h={jt - sp} p={[p[0], (sp + jt) / 2, p[2]]} c="#9fdcff" o={{ emissive: "#3fb0ff", ei: 0.6, opacity: 0.85, depthWrite: false }} seg={8} cast={false} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * PI * 2, u = fract(t * 1.6 + i / 8); return <Sph key={i} rad={0.1} p={[p[0] + Math.cos(a) * u * 0.9, jt - u * u * (jt - p[1] - 0.8), p[2] + Math.sin(a) * u * 0.9]} c="#9fdcff" o={{ emissive: "#3fb0ff", ei: 0.6 }} cast={false} ws={6} hs={4} />; })}
        {capped ? <Cyl rt={0.55} h={0.05} p={[p[0], top + 0.02, p[2]]} c="#fff3a0" o={{ emissive: "#ffd43a", ei: 1.0 }} seg={12} cast={false} /> : null}
      </G> : null}
    </G>
  );
};
/** «nunca más alto que la caja»: tracejado amarelo no nível da água da caixa até depois da fonte da praça */
const LevelLine: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.nunca || t > T.giro) return null;
  const a: V3 = [CAJA[0] + 0.5, WLC, CAJA[2] + 1.0], b: V3 = [F1[0] + 0.45, WLC, F1[2] + 1.0], n = 22, o = { emissive: "#ffc400", ei: 1.0 };
  return (
    <G>
      {Array.from({ length: n }, (_, i) => { const u = (i + 0.5) / n; if (t < T.nunca + (1 - u) * 0.7) return null; const p = vlerp(a, b, u); return <Box key={i} s={[0.16, 0.12, 0.62]} p={p} r={[0, Math.atan2(b[0] - a[0], b[2] - a[2]), 0]} c="#ffd43a" o={o} cast={false} />; })}
      <mesh position={[CAJA[0], WLC + 0.03, CAJA[2]]} rotation={[-PI / 2, 0, 0]} material={mat("#ffd43a", { emissive: "#ffc400", ei: 0.9 })}><ringGeometry args={[1.5, 1.85, 4, 1, PI / 4]} /></mesh>
    </G>
  );
};
const TOWN: Costume[] = [
  { skin: "#c9a27a", top: "#3f7fb0", bottom: "#4a3a2a", kilt: "#3f7fb0", kiltLen: 0.7, hat: "cloth", hatC: "#e8dcc0", boot: "#4a3020", sleeves: true, scarf: "#e8dcc0" },
  { skin: "#b98a5e", top: "#e9d9b0", bottom: "#6a5a48", hat: "straw", hatC: "#d9b25a", boot: "#5a3a20", sleeves: true, scarf: "#8a6a4a" },
  { skin: "#d6a882", top: "#b8553a", bottom: "#3a3f4a", kilt: "#b8553a", kiltLen: 0.75, hat: "none", hatC: "#000", boot: "#3a2a1a", sleeves: true, scarf: "#f0c95a" },
];
const JarPeople: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p3 || t > T.giro) return null;
  // atrás da fonte: nunca entre a câmera e o jato; em «nunca» vão para o sudeste, fora do corredor fonte→caixa
  const spots: V3[] = t < T.nunca ? [[-2.8, 0, -1.3], [2.6, 0, -1.7], [-0.5, 0, -3.1]] : [[3.4, 0, 1.2], [4.2, 0, -0.6], [3.0, 0, 2.4]];
  return (
    <G>
      {spots.map((d, i) => { const p: V3 = [F1[0] + d[0], gH(F1[0] + d[0], F1[2] + d[2]), F1[2] + d[2]], yaw = Math.atan2(F1[0] - p[0], F1[2] - p[2]) + (i - 1) * 0.3;
        return <Worker key={i} p={p} yaw={yaw} pose={poseOf(t > T.brota2 + 0.2 ? "cheer" : "present", t + i * 0.4)} t={t + i * 0.4} c={TOWN[i]} prop="jar" scale={1.15} mustache={i === 1} />; })}
      {t > T.alto2 + 0.3 && t < T.alto2 + 1.3 ? <Sph rad={0.12} p={[F1[0] - 2.4 + 0.2, lerp(F1[1] + 1.3, F1[1] + 0.1, ease(t, T.alto2 + 0.35, T.alto2 + 0.85)), F1[2] + 1.2]} c="#7cc8ff" o={{ emissive: "#2f8fd8", ei: 0.6 }} cast={false} ws={6} hs={4} /> : null}
      <XMark t={t} a={T.alto2 + 0.55} b={T.b3 - 0.02} p={[F1[0], F1[1] + 3.2, F1[2]]} sc={1.3} />
    </G>
  );
};
const Summit: React.FC<{ t: number }> = ({ t }) => {
  const pk = pipesK(t);
  return (
    <G>
      <Caja t={t} /><OnePoint t={t} />
      <ClayPipe t={t} pts={PIPE_A} k={clamp(pk * 1.4)} ph={0} /><ClayPipe t={t} pts={PIPE_B} k={clamp(pk * 1.4 - 0.4)} ph={0.3} /><ClayPipe t={t} pts={PIPE_C} k={clamp(pk * 1.3 - 0.2)} ph={0.6} />
      <Fountain t={t} p={F1} top={WLC - 0.04} main /><Fountain t={t} p={F2} top={F2[1] + 2.9} /><Fountain t={t} p={F3} top={F3[1] + 2.0} />
      <LevelLine t={t} /><JarPeople t={t} />
      {/* a pila seca na frente do convento (o plano de 1721 deixava a Cruz sem água) */}
      <G p={[CONV[0] + 3.4, HS, CONV[2] + 5.6]}>
        <Cyl rt={1.0} rb={1.1} h={0.6} p={[0, 0.3, 0]} c="#d8c4a8" seg={8} />
        <Cyl rt={0.85} h={0.04} p={[0, 0.61, 0]} c={twist(t) ? "#a0805a" : "#4fb2ee"} o={twist(t) ? {} : { emissive: "#1f8fe0", ei: 0.3 }} seg={8} cast={false} />
        {twist(t) ? [0, 1, 2].map((i) => <Box key={i} s={[0.9, 0.02, 0.05]} p={[0, 0.64, (i - 1) * 0.3]} r={[0, i * 0.9, 0]} c="#5a4030" cast={false} />) : null}
      </G>
      <XMark t={t} a={T.cima2 + 0.15} b={T.asi - 0.02} p={[CONV[0] + 1, HS + 4.9, CONV[2] + 2]} sc={2.0} />
    </G>
  );
};

// ---------------------------------------------------------------- as bombas que não existem (gancho e «sin motores»)
const Pump: React.FC<{ t: number; p: V3; a: number; b: number; x: number; yaw?: number }> = ({ t, p, a, b, x, yaw = 0 }) => {
  if (t < a || t > b) return null;
  const k = popK(t, a, 0.3), lev = 0.5 * Math.sin(t * 9);
  return (
    <G>
      <G p={p} r={[0, yaw, 0]} sc={Math.max(0.001, k) * 1.2}>
        <Box s={[1.3, 0.25, 1.0]} p={[0, 0.12, 0]} c="#5a5f68" />
        <Cyl rt={0.42} h={1.5} p={[0, 1.0, 0]} c="#d8352a" seg={12} /><Sph rad={0.42} p={[0, 1.75, 0]} pl={PI / 2} c="#d8352a" ws={12} hs={6} />
        <Box s={[0.12, 0.12, 1.3]} p={[0, 1.9, 0.45]} r={[lev, 0, 0]} c="#3a3f48" />
        <Cyl rt={0.07} h={0.9} p={[0.5, 1.2, 0]} r={[0, 0, PI / 2]} c="#3a3f48" seg={6} /><Sph rad={0.18} p={[0.95, 1.2, 0]} c="#f2c230" ws={8} hs={6} />
        <Cyl rt={0.3} h={0.1} p={[-0.5, 0.9, 0]} r={[0, 0, PI / 2]} c="#f2c230" seg={10} />
      </G>
      <XMark t={t} a={x} b={b} p={[p[0], p[1] + 3.2, p[2]]} sc={1.2} />
    </G>
  );
};

// ---------------------------------------------------------------- 1726: o rio sujo pelas tinas dos obrajes, a gente doente
const VATS: { x: number; c: string }[] = [{ x: OB[0] - 5.5, c: "#7b3fa0" }, { x: OB[0], c: "#3f4fb0" }, { x: OB[0] + 5.5, c: "#b8333a" }];
const dyeK = (t: number) => (t >= T.rio && t < T.p2 ? ease(t, T.rio + 0.35, T.lana + 0.4) : 0);
const River: React.FC<{ t: number }> = ({ t }) => {
  const k = dyeK(t), rc = qcol("#4aa8e0", "#7a5468", k, 8), pours = t >= T.rio && t < T.hay;
  return (
    <G>
      <Box s={[312, 0.06, 6]} p={[96, 0.03, ZR]} c={rc} o={{ rough: 0.25 }} cast={false} />
      {[ZR - 3.2, ZR + 3.2].map((z) => <Box key={z} s={[312, 0.08, 0.5]} p={[96, 0.04, z]} c="#8a9a5a" cast={false} />)}
      {Array.from({ length: 60 }, (_, i) => <Box key={i} s={[1.6, 0.03, 0.12]} p={[-60 + fract(i / 60 + t * 0.012) * 304, 0.08, ZR + (rnd(i) - 0.5) * 4.6]} c={k > 0.5 ? "#b08aa0" : "#d6f1ff"} o={{ emissive: "#bfe6ff", ei: k > 0.5 ? 0 : 0.3 }} cast={false} />)}
      {/* obrajes: oficina, tina de tinta, a bica até o rio, lã */}
      {VATS.map((v, i) => <G key={i}>
        <G p={[v.x, 0, OB[2] - 3]}>
          <Box s={[4.4, 2.8, 3.2]} p={[0, 1.4, 0]} c="#dcb88c" /><Cone rad={3.4} h={1.3} seg={4} p={[0, 3.45, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#b8674a" />
          <Box s={[1.1, 1.7, 0.08]} p={[0, 0.85, 1.62]} c="#4a3426" cast={false} />
        </G>
        <G p={[v.x, 0, OB[2] + 1.4]}>
          <Cyl rt={1.15} rb={1.0} h={1.1} p={[0, 0.55, 0]} c="#8a5a32" seg={12} /><Cyl rt={1.2} h={0.12} p={[0, 1.1, 0]} c="#6a4024" seg={12} />
          <Cyl rt={1.0} h={0.04} p={[0, 1.08, 0]} c={v.c} o={{ emissive: v.c, ei: 0.3 }} seg={12} cast={false} />
          <Box s={[0.5, 0.12, 2.6]} p={[0, 0.85, 2.0]} r={[-0.3, 0, 0]} c="#7a4a2a" />
        </G>
        {pours ? <Beads t={t} pts={[[v.x, 1.0, OB[2] + 2.5], [v.x, 0.5, OB[2] + 4.4], [v.x, 0.08, OB[2] + 5.2]]} n={6} speed={1.3} r={0.18} c={v.c} e={v.c} ph={i * 0.3} /> : null}
        {pours ? Array.from({ length: 5 }, (_, q) => { const u = fract(t * 0.35 + q / 5 + i * 0.2); return <mesh key={q} position={[v.x + u * 9, 0.075, ZR - 1.8 + u * 1.4]} rotation={[-PI / 2, 0, 0]} scale={[1 + u * 2.5, 0.6 + u, 1]} material={mat(v.c, { opacity: 0.75 * (1 - u * 0.6), depthWrite: false })}><circleGeometry args={[0.6, 12]} /></mesh>; }) : null}
        {[0, 1, 2].map((q) => <Sph key={q} rad={0.38} p={[v.x + 1.8 + q * 0.35, 0.3 + (q % 2) * 0.3, OB[2] - 0.9]} c="#f6f1e6" o={{ rough: 1 }} ws={8} hs={6} />)}
      </G>)}
      {/* novelos tingidos num varal */}
      <G p={[OB[0], 0, OB[2] - 0.6]}>
        {[-8.5, 8.5].map((x) => <Box key={x} s={[0.14, 2.6, 0.14]} p={[x, 1.3, 0]} c="#6a4024" />)}
        <Box s={[17, 0.04, 0.04]} p={[0, 2.5, 0]} c="#3a2a1a" cast={false} />
        {Array.from({ length: 9 }, (_, i) => <Box key={i} s={[0.5, 0.9, 0.2]} p={[-7 + i * 1.75, 2.0 + 0.04 * Math.sin(t * 3 + i), 0]} r={[0.1 * Math.sin(t * 2 + i), 0, 0]} c={VATS[i % 3].c} />)}
      </G>
    </G>
  );
};
const SICKC: Costume[] = TOWN.map((c) => ({ ...c, skin: "#b7b878" }));
const Sick: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.rio || t > T.hay) return null;
  const list: [number, number, number][] = [[-1.6, 0.4, 0.5], [0.4, -0.5, -0.2], [2.0, 0.8, -0.6]];
  return (
    <G>
      {list.map(([x, z, yaw], i) => <Worker key={i} p={[SICK[0] + x, 0, SICK[2] + z]} yaw={yaw} pose={poseOf(t > T.gente - 0.1 ? "belly" : "idle", t + i * 0.5)} t={t + i * 0.5} c={SICKC[i]} scale={1.15} mustache={i !== 0} />)}
      {t > T.gente ? list.map(([x, z], i) => <G key={i} p={[SICK[0] + x, 2.45 + 0.08 * Math.sin(t * 4 + i), SICK[2] + z]} r={[PI / 2, 0, t * 5 + i]}>
        <mesh material={mat("#7fdf5a", { emissive: "#4faf2a", ei: 0.6, side: "double" })}><ringGeometry args={[0.18, 0.26, 12, 1, 0, PI * 1.5]} /></mesh>
      </G>) : null}
    </G>
  );
};

// ---------------------------------------------------------------- a lenda: o marquês na janela da monja, corações
export const NUN: Costume = { skin: "#f0c8a8", top: "#1e1e24", bottom: "#1e1e24", kilt: "#1e1e24", kiltLen: 0.85, hat: "cloth", hatC: "#1e1e24", boot: "#1a1a1a", sleeves: true, scarf: "#f4f1ea" };
const WIN: V3 = [0.6, 2.7, 0]; // centro da janela (local da fachada)
const Heart: React.FC<{ p: V3; s: number; c?: string; r?: number }> = ({ p, s, c = "#ff4f7a", r = 0 }) => (
  <G p={p} sc={Math.max(0.001, s)} r={[0, 0, r]}>
    {[-0.19, 0.19].map((x) => <Sph key={x} rad={0.26} p={[x, 0.08, 0]} c={c} o={{ emissive: "#ff2a5a", ei: 0.6 }} cast={false} ws={10} hs={8} />)}
    <Cone rad={0.41} h={0.55} seg={10} p={[0, -0.24, 0]} r={[PI, 0, 0]} sc={[1, 1, 0.62]} c={c} o={{ emissive: "#ff2a5a", ei: 0.6 }} cast={false} />
  </G>
);
const Legend: React.FC<{ t: number }> = ({ t }) => {
  const nun = t >= C1 - 0.02 && t < T.papeles;
  return (
    <G p={LEG}>
      {/* fachada do convento das Capuchinas com a janela gradeada */}
      <Box s={[3.5, 4.5, 1]} p={[-1.75, 2.25, -0.5]} c="#f0dfc0" /><Box s={[2.3, 4.5, 1]} p={[2.35, 2.25, -0.5]} c="#f0dfc0" />
      <Box s={[1.2, 2.1, 1]} p={[0.6, 1.05, -0.5]} c="#f0dfc0" /><Box s={[1.2, 1.2, 1]} p={[0.6, 3.9, -0.5]} c="#f0dfc0" />
      <Box s={[7.2, 0.3, 1.2]} p={[0, 4.6, -0.5]} c="#c98a5a" /><Box s={[1.5, 0.12, 0.35]} p={[0.6, 2.06, 0.15]} c="#c98a5a" />
      {[[0.15, 0], [1.05, 1]].map(([x, i]) => <Sph key={i} rad={0.16} p={[x, 2.26, 0.15]} c="#e0405a" ws={8} hs={6} />)}
      <Box s={[1.6, 1.6, 0.1]} p={[0.6, 2.7, -1.9]} c="#a07850" o={{ emissive: "#5a3a18", ei: 0.5 }} cast={false} /><Box s={[1.6, 0.1, 1.8]} p={[0.6, 1.0, -1.0]} c="#6a4a2e" cast={false} />
      {[-0.05, 1.25].map((x) => <Box key={x} s={[0.1, 1.6, 1.8]} p={[x, 2.7, -1.0]} c="#7a5a3a" cast={false} />)}
      {[0.25, 0.6, 0.95].map((x) => <Cyl key={x} rt={0.035} h={1.2} p={[x, 2.7, 0.04]} c="#1a1a1a" seg={5} cast={false} />)}
      <Cyl rt={0.035} h={1.2} p={[0.6, 2.7, 0.04]} r={[0, 0, PI / 2]} c="#1a1a1a" seg={5} cast={false} />
      <Box s={[1.4, 2.2, 0.1]} p={[-2.0, 1.1, 0.02]} c="#5a3a24" cast={false} /><Sph rad={0.7} pl={PI / 2} p={[-2.0, 2.2, 0.02]} sc={[1, 1, 0.1]} c="#5a3a24" cast={false} />
      <G p={[-2.0, 4.75, -0.5]}><Box s={[1.7, 1.5, 0.4]} p={[0, 0.75, 0]} c="#f0dfc0" /><Box s={[0.7, 0.8, 0.45]} p={[0, 0.8, 0]} c="#3a2a1e" cast={false} />
        <Sph rad={0.26} pl={PI / 2} p={[0, 0.78, 0]} r={[PI, 0, 0]} c="#c8a040" ws={8} hs={5} /><Box s={[0.08, 0.6, 0.08]} p={[0, 1.8, 0]} c="#3a2a1a" /><Box s={[0.36, 0.08, 0.08]} p={[0, 1.9, 0]} c="#3a2a1a" /></G>
      {nun ? <G>
        <Worker p={[WIN[0], 1.05, -0.85]} yaw={0.35} pose={poseOf(t > T.amor ? "present" : "idle", t)} t={t} c={NUN} scale={1.0} mustache={false} />
        <Cyl rt={0.345} h={0.07} p={[WIN[0] + 0.0, 1.05 + 1.82, -0.85]} r={[0, 0.35, 0]} c="#f4f1ea" seg={16} cast={false} />
      </G> : null}
      {t > T.amor - 0.05 && t < T.papeles ? Array.from({ length: 7 }, (_, i) => {
        const a = T.amor + i * 0.22, u = prog(t, a, a + 1.6); if (t < a) return null;
        return <Heart key={i} p={[2.2 + 0.6 * Math.sin(u * 5 + i), 3.0 + u * 2.4, 1.4 + (rnd(i) - 0.5)]} s={popK(t, a, 0.25) * (1 - 0.6 * u) * (0.6 + rnd(i) * 0.5)} r={0.3 * Math.sin(t * 4 + i)} />;
      }) : null}
    </G>
  );
};
/** os papéis: o rolo abre na mesa; o coração da lenda racha em «menos romántico» */
const Scroll: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.papeles - 0.05 || t > T.rio) return null;
  const u = ease(t, T.papeles + 0.05, T.papeles + 0.9), w = 2.6 * u + 0.01, x0 = -1.3, br = ease(t, T.romantico + 0.12, T.romantico + 0.8);
  return (
    <G p={SCR}>
      <Box s={[3.4, 0.12, 1.8]} p={[0, 1.0, 0]} c="#9a6a3a" />
      {[[-1.5, -0.75], [1.5, -0.75], [-1.5, 0.75], [1.5, 0.75]].map(([x, z], i) => <Box key={i} s={[0.12, 1.0, 0.12]} p={[x, 0.5, z]} c="#6a4a2a" />)}
      <Box s={[w, 0.02, 1.2]} p={[x0 + w / 2, 1.08, 0]} c="#f3e5c0" cast={false} />
      <Cyl rt={0.11} h={1.34} p={[x0, 1.14, 0]} r={[PI / 2, 0, 0]} c="#e8d4a0" seg={10} />
      <Cyl rt={0.13} h={1.34} p={[x0 + w, 1.16, 0]} r={[PI / 2, 0, 0]} c="#e8d4a0" seg={10} />
      {Array.from({ length: 7 }, (_, i) => { const L = Math.min(w - 0.3, 1.5 + rnd(i) * 0.7); return L > 0.05 ? <Box key={i} s={[L, 0.01, 0.05]} p={[x0 + 0.15 + L / 2, 1.1, -0.45 + i * 0.13]} c="#5a4a3a" cast={false} /> : null; })}
      {w > 2.2 ? [0, 1, 2].map((i) => <Box key={i} s={[0.32, 0.01, 0.06]} p={[0.65 + i * 0.27, 1.1, 0.38 + 0.06 * (i % 2 ? 1 : -1)]} r={[0, (i % 2 ? 0.4 : -0.4), 0]} c="#7a5a32" cast={false} />) : null}
      {w > 0.6 ? <Cyl rt={0.12} h={0.03} p={[x0 + 0.35, 1.11, 0.45]} c="#c0282a" seg={10} cast={false} /> : null}
      {/* o coração da lenda, que racha */}
      {br < 0.01 ? <Heart p={[0.9, 1.85 + 0.06 * Math.sin(t * 4), -0.5]} s={popK(t, T.papeles + 0.1, 0.3) * 0.6} /> :
        [-1, 1].map((s) => <G key={s} p={[0.9 + s * (0.05 + 0.5 * br), 1.85 - 0.7 * br * br, -0.5]} r={[0, 0, s * 0.9 * br]} sc={0.66}>
          <Sph rad={0.24} p={[s * 0.17, 0.07, 0]} c={qcol("#ff4f7a", "#8a8a90", br, 4)} cast={false} ws={10} hs={8} />
          <Box s={[0.26, 0.42, 0.22]} p={[s * 0.1, -0.2, 0]} r={[0, 0, s * 0.45]} c={qcol("#ff4f7a", "#8a8a90", br, 4)} cast={false} />
        </G>)}
    </G>
  );
};

// ---------------------------------------------------------------- a rota pontilhada de longe (alberca → cidade)
const ROUTE: V3[] = [[AL[0], H + 1.0, 0], [XA0, H + 1.0, 0], [SUM[0], H + 1.0, 0]];
const Route: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.hay || t >= C2) return null;
  const n = 64, o = { emissive: "#ffb000", ei: 1.0 };
  return (
    <G>
      {Array.from({ length: n }, (_, k) => { const u = k / (n - 1), a = T.hay + 0.1 + u * 1.15; if (t < a) return null; return <Sph key={k} rad={0.75 + 0.15 * Math.sin(t * 6 - k)} p={along(ROUTE, u)} sc={Math.max(0.001, popK(t, a, 0.2))} c="#ffd43a" o={o} cast={false} ws={8} hs={6} />; })}
      <G p={[AL[0], H, 0]} sc={1 + 0.1 * Math.sin(t * 5)}><Cyl rt={0.25} h={4} p={[0, 2, 0]} c="#3fa3e0" o={{ emissive: "#1f8fe0", ei: 0.6 }} seg={6} cast={false} /><Sph rad={1.1} p={[0, 4.6, 0]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 0.8 }} cast={false} /><Cone rad={0.8} h={1.2} p={[0, 5.7, 0]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 0.8 }} cast={false} /></G>
      <G p={[SUM[0] + 2, HS, -1]} sc={(2.2 + 0.2 * Math.sin(t * 5)) * Math.max(0.001, popK(t, T.hay + 1.2, 0.3))}><Cyl rt={0.25} h={4} p={[0, 2, 0]} c="#ffd43a" o={o} seg={6} cast={false} /><Sph rad={0.9} p={[0, 4.6, 0]} c="#ffd43a" o={o} cast={false} /></G>
    </G>
  );
};

// ---------------------------------------------------------------- réguas, o nível no alto do canal, as moedas, os pássaros
export const rideX = (t: number) => lerp(-24, 6, prog(t, C5, T.estosArcos));
const Measures: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {t >= T.altos && t < T.cimientos ? <Ruler p={[1.3, 0, 1.25]} h={H} k={ease(t, T.altos + 0.1, T.veinte + 0.25)} /> : null}
    {twist(t) && t >= T.arcos8 && t < C7 ? <Ruler p={[0.85, 0, ZG + 0.75]} h={HG} k={ease(t, T.arcos8 + 0.1, T.ocho + 0.3)} step={0.85} /> : null}
    {twist(t) && t >= T.ocho + 0.3 && t < C7 ? <G p={[0.85, HG, ZG + 0.75]} sc={1 + 0.3 * Math.abs(Math.sin((t - T.ocho) * 7))}>
      <Box s={[1.3, 0.16, 0.2]} c="#ff6a3a" o={{ emissive: "#ff3a1a", ei: 0.9 }} cast={false} />
    </G> : null}
    {twist(t) && t >= T.veintemil - 0.05 && t < C7 ? <G p={[2.2, 0, ZG + 1.4]}>
      {Array.from({ length: 8 }, (_, i) => { const a = T.veintemil + i * 0.08; if (t < a) return null; const u = ease(t, a, a + 0.22);
        return <Cyl key={i} rt={0.42} h={0.11} p={[0.03 * Math.sin(i * 2), lerp(2.6, 0.06 + i * 0.12, u), 0]} r={[(1 - u) * 1.3, 0, 0]} c="#f2c230" o={{ emissive: "#b88a00", ei: 0.25, metal: 0.3 }} seg={14} />; })}
      <G sc={Math.max(0.001, popK(t, T.veintemil - 0.05, 0.3))}><Cyl rt={0.6} h={1.2} p={[0, 0.55, 0]} c="#bfe0ff" o={{ opacity: 0.3, emissive: "#8fc8ff", ei: 0.4, depthWrite: false }} seg={14} cast={false} /></G>
    </G> : null}
    {t >= C5 && t < T.estosArcos ? <G>
      <G p={[rideX(t) + 3.4, H + DECK + WALLH + 0.12, 0.62]}>
        <Box s={[1.5, 0.22, 0.32]} c="#f2c230" /><Cyl rt={0.08} h={0.62} p={[0, 0.12, 0]} r={[0, 0, PI / 2]} c="#9fffb0" o={{ emissive: "#3fd060", ei: 0.6, opacity: 0.8 }} seg={10} cast={false} />
        <Sph rad={0.06} p={[0.02 * Math.sin(t * 9), 0.17, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.8 }} cast={false} ws={6} hs={4} />
        {[-0.12, 0.12].map((x) => <Box key={x} s={[0.02, 0.2, 0.2]} p={[x, 0.12, 0]} c="#1a1a1a" cast={false} />)}
      </G>
      <Box s={[XA1 - XA0, 0.06, 0.08]} p={[0, H + DECK + WALLH + 0.04, -0.62]} c="#ffd43a" o={{ emissive: "#ffc400", ei: 0.9 }} cast={false} />
    </G> : null}
  </G>
);
const COIN_X = [-4, -2.9, -1.0, 0.1, 2.0, 3.1];
const Coins: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.obra - 0.05 || t > T.manda) return null;
  const green = ease(t, T.dos, T.dos + 0.35);
  return (
    <G p={CS}>
      <Box s={[9.6, 0.06, 3.2]} p={[0, 0.03, 0]} c="#8a2a2a" cast={false} />
      {COIN_X.map((x, k) => {
        const n = Math.floor(14 * clamp(prog(t, COIN_T(k), COIN_T(k) + 0.3))), g = k < 4 && green > 0.5;
        return <G key={k}>
          {Array.from({ length: n }, (_, i) => <Cyl key={i} rt={0.48} h={0.12} p={[x + 0.03 * Math.sin(i * 2 + k), 0.1 + i * 0.13, 0.03 * Math.cos(i * 3)]} c={g ? "#4fbf6a" : "#f2c230"} o={{ emissive: g ? "#1f8f3a" : "#b88a00", ei: 0.3, metal: 0.3 }} seg={14} />)}
          {k === 0 && t < T.pago ? <Cyl rt={0.66} h={2.1} p={[x, 1.05, 0]} c="#bfe0ff" o={{ opacity: 0.3, emissive: "#8fc8ff", ei: 0.4, depthWrite: false }} seg={14} cast={false} /> : null}
          {k === 0 && t >= T.planeado - 0.05 && t < T.pago ? [0, 1].map((q) => { const u = fract((t - T.planeado) * 1.4 + q / 2), r = 0.8 + u * 1.3;
            return <mesh key={q} position={[x, 0.1, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#ff5a3a", { emissive: "#ff2a1a", ei: 0.9, opacity: 1 - u * 0.8, depthWrite: false })}><ringGeometry args={[r, r + 0.18, 24]} /></mesh>; }) : null}
        </G>;
      })}
      {green > 0.01 ? <mesh position={[-1.45, 0.08, 0]} rotation={[-PI / 2, 0, 0]} scale={[1, 0.45, 1]} material={mat("#7fff9a", { emissive: "#3fd060", ei: 0.8, opacity: 0.8 * green, depthWrite: false })}><ringGeometry args={[3.2, 3.5, 32]} /></mesh> : null}
    </G>
  );
};
/** final: chove dinheiro sobre a arcaria (o orçamento que estoura) */
const CoinRain: React.FC<{ t: number }> = ({ t }) => {
  if (!cta(t)) return null;
  return <G>{Array.from({ length: 28 }, (_, i) => {
    const st = T.manda + rnd(i * 7 + 1) * 1.1; if (t < st) return null;
    const u = fract((t - st) * 0.8), p: V3 = [lerp(-4, 16, rnd(i * 7 + 2)), lerp(H + 12, -0.5, u), lerp(1.5, 13, rnd(i * 7 + 3))];
    return <Cyl key={i} rt={0.55} h={0.14} p={p} r={[t * 3 + i, 0, t * 2 + i]} c="#f2c230" o={{ emissive: "#b88a00", ei: 0.45, metal: 0.3 }} seg={14} cast={false} />;
  })}</G>;
};
const Birds: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.llevan || t > T.queretaro) return null;
  const u = t - T.llevan;
  return <G>{Array.from({ length: 7 }, (_, i) => { const row = Math.abs(i - 3), fl = 0.5 * Math.sin(t * 14 + i);
    return <G key={i} p={[-16 + u * 9 - row * 2.2, 11 + row * 0.7 + 0.3 * Math.sin(t * 2 + i), 7 - (i - 3) * 1.6]} sc={2.6}>
      <Box s={[0.5, 0.05, 0.16]} p={[-0.22, 0, 0]} r={[0, 0, fl]} c="#2a2a2a" cast={false} /><Box s={[0.5, 0.05, 0.16]} p={[0.22, 0, 0]} r={[0, 0, -fl]} c="#2a2a2a" cast={false} />
    </G>; })}</G>;
};
/** «a veces cargaba piedras él mismo»: a pedra nas mãos do marquês enquanto os muros sobem */
export const CARRY: V3 = [AL[0] + 2, H, -3.8]; // atrás do buraco, de frente para a câmera
const Carry: React.FC<{ t: number }> = ({ t }) => (t < T.encierran || t > T.ahora ? null : (
  <Box s={[0.6, 0.42, 0.42]} p={[CARRY[0] + 0.15, CARRY[1] + 1.12 * 1.2, CARRY[2] + 0.55 * 1.2]} r={[0, 0.3, 0]} c="#c9b0a0" />
));

// ---------------------------------------------------------------- tudo
export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3f96f0" mid="#9ccff7" low="#fff1d8" />
    <Clouds t={t} n={7} />
    <Sierra />
    <Land t={t} />
    <Trees spots={TREE_SPOTS} c={["#5a9a3a", "#6fae44"]} /><Nopales />
    <City /><ConventCruz />
    <ValleySwamp t={t} /><ValleyCut t={t} />
    <Arcades t={t} /><GhostEnd t={t} />
    <Alberca t={t} /><SwampDecor t={t} /><PlateauCanal t={t} />
    <Summit t={t} />
    <Pump t={t} p={[106.5, HS, 3.6]} a={T.bomba - 0.15} b={T.queretaro} x={T.bomba + 0.4} yaw={-0.5} />
    <Pump t={t} p={[AL[0] + 8.5, H, 6.2]} a={C2 + 0.3} b={T.p1} x={T.motores + 0.3} yaw={-0.4} />
    <XMark t={t} a={T.pantano0 + 0.25} b={T.b1 - 0.02} p={[AL[0], H + 0.6, 2.5]} sc={1.3} />
    <River t={t} /><Sick t={t} /><Legend t={t} /><Scroll t={t} /><Route t={t} />
    <Measures t={t} /><Coins t={t} /><CoinRain t={t} /><Birds t={t} /><Carry t={t} />
    <Puffs t={t} p={[CONV[0] - 6, HS + 2.5, -8]} n={4} period={3.5} rise={4} size={0.5} c="#eeeeee" />
  </>
);
export { Crowd, Worker, poseOf };
