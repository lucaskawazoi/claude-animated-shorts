// Mundo do E21: Moray de brinquedo. A tigela principal (Qechuyoq) no origem: 12 anéis (treads) com muro de pedra, o cone de terra nua
// por trás (a «pared» do buraco), o fundo plano com o poço do filtro de rochas. Tudo é função de t (sem estado).
// Eixos: y = altura (planalto em 0, fundo em −DEPTH); P(a, r, y) põe um ponto no ângulo a (0 = +z) a r do eixo.
// Ao norte (−z): o morro com as 2 nascentes, o canal e a vala seca do «rio». Dioramas (cortes) flutuam em DIO = (0,150,0).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, vlerp } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd } from "../../toy/worker";
import type { PoseName } from "../../toy/worker";
import { C1, C2, C6, RING_T, ROCKS_N, ROCK_FALL, ROCK_T, T } from "./cues";

const PI = Math.PI;
// ---------------------------------------------------------------- geografia
export const N = 12, HH = 1.7, WW = 2.4, RB = 12, DEPTH = HH * N, SLOPE = WW / HH;
export const rc = (d: number) => RB + (DEPTH - d) * SLOPE;       // raio do cone (a pared) à profundidade d
export const RT = rc(0);                                           // 40.8: a borda
export const rOut = (i: number) => RB + (N - 1 - i) * WW;
export const rIn = (i: number) => rOut(i) - WW;
export const yT = (i: number) => -(i + 1) * HH;                    // altura do anel i
export const FR = rIn(N - 1);                                      // raio do fundo plano (9.6)
export const FLOOR = -DEPTH;
export const coneY = (r: number) => -DEPTH + (r - RB) / SLOPE;     // altura do cone num raio
export const P = (a: number, r: number, y: number): V3 => [r * Math.sin(a), y, r * Math.cos(a)];
export const DEMO = 4;                                             // o anel cujo muro os pedreiros erguem em «muros de piedra en círculos»
export const DIO: V3 = [0, 150, 0];                                // origem dos dioramas (cortes) no céu
type PitDef = { x: number; z: number; R: number; d: number };
export const PB: PitDef = { x: -74, z: 22, R: 16, d: 7 }, PC: PitDef = { x: 74, z: 30, R: 15, d: 6.5 }, PD: PitDef = { x: -28, z: 76, R: 13, d: 6 };
// morro ao norte: as nascentes ficam em cima
const HILL = { x: 0, z: -178, rx: 80, rz: 62, h: 25 };
export const hillY = (x: number, z: number) => { const q = 1 - ((x - HILL.x) / HILL.rx) ** 2 - ((z - HILL.z) / HILL.rz) ** 2; return q <= 0 ? 0 : HILL.h * Math.sqrt(q) * Math.min(1, q * 2.2); };
export const gH = (x: number, z: number) => hillY(x, z);
export const SPR: V3[] = [[-9, 0, -131], [9, 0, -131]].map(([x, , z]) => [x, hillY(x, z) + 0.3, z] as V3);
const RIMN = P(PI, RT + 0.9, 0.35);                                 // onde o canal chega à borda (norte)
export const SIGN_RIO: V3 = [-30, 0, -96];

// ---------------------------------------------------------------- cores
const GROUND = "#a2b95c", GROUND2 = "#93ad50", EARTH = "#b08a5a", EARTH2 = "#9a7648", STONE = "#9a8f84", STONE2 = "#857a6f", WATER = "#3fa3e0";
const qcol = (a: string, b: string, k: number, steps = 8) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), Math.round(clamp(k) * steps) / steps).getHexString();
const popK = (t: number, a: number, d = 0.25) => (t < a ? 0 : outBack(prog(t, a, a + d)));

/** poeira: bolas de terra que sobem e se abrem (cada uma com fase própria), ao contrário do Puffs (que empilha em coluna) */
const Dust: React.FC<{ t: number; t0: number; p: V3; n?: number; spread?: number; rise?: number; size?: number; on?: number; c?: string }> = ({ t, t0, p, n = 6, spread = 4, rise = 6, size = 1.6, on = 1, c = "#d9c9a0" }) =>
  on <= 0.01 ? null : <G p={p}>{Array.from({ length: n }, (_, i) => {
    const ph = fract((t - t0) * 0.75 + rnd(i * 3 + 2)), a = rnd(i * 3 + 1) * PI * 2, o = spread * ph * (0.4 + rnd(i * 3 + 3)), s = size * (0.45 + ph) * (1 - ph * ph) * on;
    return <Sph key={i} rad={1} p={[Math.cos(a) * o, rise * Math.pow(ph, 0.7), Math.sin(a) * o]} sc={Math.max(0.001, s)} c={c} cast={false} ws={8} hs={6} o={{ rough: 1 }} />;
  })}</G>;

// ---------------------------------------------------------------- quando cada coisa existe
const teaser = (t: number) => t < T.sola0;                               // o buraco pronto (abertura)
export const ringState = (i: number, t: number) => {
  if (t < T.sola0) return { w: 1, sw: 1, tr: 1 };
  if (t < T.incas) return { w: 0, sw: 1, tr: 0 };
  if (t < T.moray) { const a = RING_T(i, T.incas, T.redondasEnd), p = prog(t, a, a + 0.35); return { w: p, sw: 1, tr: p }; }
  if (t < T.doce) {
    const v = 1 - prog(t, T.moray + (N - 1 - i) * 0.045, T.moray + (N - 1 - i) * 0.045 + 0.22);   // ⏪ os anéis somem de baixo para cima
    if (i === DEMO && t >= T.c1 + 0.1) return { w: 1, sw: prog(t, T.muros, T.circulosEnd), tr: 0 };
    return { w: v, sw: 1, tr: v };
  }
  const a = RING_T(i, T.doce, T.planoEnd), p = prog(t, a, a + 0.35);
  return i === DEMO ? { w: 1, sw: 1, tr: p } : { w: p, sw: 1, tr: p };
};
/** água chega ao anel i (0 = o de cima) em wetT(i): a onda desce de «caídas» até «al siguiente» */
const wetT = (i: number) => RING_T(i, T.caidas, T.siguienteEnd, 0.3);
const wetK = (i: number, t: number) => ease(t, wetT(i), wetT(i) + 0.45);
const WET_ON = T.caidas - 0.1;
/** o remendo de chão que afunda na abertura: profundidade do disco (0 = rente ao chão) */
const plugD = (t: number) => ease(t, T.hundio, T.hundio + 0.9) * DEPTH;
/** pit C: um disco plano que cai em C2 */
const pitCD = (t: number) => ease(t, C2 + 0.04, C2 + 0.7) * PC.d;
/** nível da água hipotética («como una olla») e depois a que escoa no filtro */
const FLOOD_TOP = FLOOR + 6.5;
const floodY = (t: number) => {
  if (t < T.p3) return FLOOR - 1;
  if (t < T.cuela) return FLOOR + 0.05 + (FLOOD_TOP - FLOOR) * ease(t, T.hoyo + 0.2, T.ollaEnd - 0.1);
  return lerp(FLOOD_TOP, FLOOR - 1, ease(t, T.cuela, T.cuela + 1.5));
};
const stepR = (y: number) => { const d = -y, i = Math.floor(d / HH) - 1; return i < 0 ? RT : i >= N ? FR + WW : rIn(clamp(i, 0, N - 1)); };
/** o filtro: o poço de 8×6 que abre no fundo, as rochas, a tampa verde de volta */
const PIT = { x0: -5, x1: 5, z0: -5, z1: 3, d: 3.2 };
const pitOpen = (t: number) => t >= T.c3 + 0.12 && t < T.inunda - 0.1;
const pitK = (t: number) => ease(t, T.c3 + 0.12, T.c3 + 0.75);          // 0..1: o poço desce
const ROCKS: [number, number, number, number][] = [[-3.4, -3.6, 1.45, 0], [0.2, -3.7, 1.7, 1], [3.5, -3.4, 1.4, 2], [-2.0, -0.9, 1.5, 3], [1.9, -0.8, 1.6, 4], [-3.6, 1.4, 1.25, 5], [0.0, 1.3, 1.35, 6], [3.3, 1.5, 1.3, 7]];
const rockT = (k: number) => lerp(T.pusieron, T.grandesEnd - 0.5, k / 7);   // as 8 rochas caem espalhadas de «pusieron» até «grandes» (fração do trecho)

// ---------------------------------------------------------------- utilidades
const Bill: React.FC<{ p: V3; cam: V3; yawOnly?: boolean; children?: React.ReactNode }> = ({ p, cam, yawOnly, children }) => {
  const dx = cam[0] - p[0], dz = cam[2] - p[2], yaw = Math.atan2(dx, dz), pitch = yawOnly ? 0 : Math.atan2(cam[1] - p[1], Math.hypot(dx, dz));
  return <G p={p} r={[0, yaw, 0]}><G r={[-pitch, 0, 0]}>{children}</G></G>;
};
/** ✖ de brinquedo: sempre de frente para a câmera */
const XMark: React.FC<{ t: number; a: number; b: number; p: V3; cam: V3; sc?: number }> = ({ t, a, b, p, cam, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = lerp(1.8, 1, ease(t, a, a + 0.14)) * sc, o = { emissive: "#ff2a1a", ei: 0.9 };
  return <Bill p={p} cam={cam}><G sc={k}>{[-1, 1].map((d) => <G key={d} r={[0, 0, (d * PI) / 4]}><Box s={[0.9, 3.4, 0.2]} c="#3a0808" cast={false} /><Box s={[0.56, 3.1, 0.24]} c="#ff3b30" o={o} cast={false} /></G>)}</G></Bill>;
};
const Check: React.FC<{ t: number; a: number; b: number; p: V3; cam: V3; sc?: number }> = ({ t, a, b, p, cam, sc = 1 }) => {
  if (t < a || t > b) return null;
  const k = popK(t, a, 0.3) * sc, o = { emissive: "#2fe05a", ei: 0.9 };
  return <Bill p={p} cam={cam}><G sc={Math.max(0.001, k)}>
    <Box s={[0.8, 2.6, 0.22]} p={[-1.55, -0.6, 0]} r={[0, 0, 0.78]} c="#0a3a16" cast={false} /><Box s={[0.8, 4.8, 0.22]} p={[1.0, 0.5, 0]} r={[0, 0, -0.66]} c="#0a3a16" cast={false} />
    <Box s={[0.5, 2.5, 0.26]} p={[-1.55, -0.6, 0]} r={[0, 0, 0.78]} c="#3be86a" o={o} cast={false} /><Box s={[0.5, 4.7, 0.26]} p={[1.0, 0.5, 0]} r={[0, 0, -0.66]} c="#3be86a" o={o} cast={false} />
  </G></Bill>;
};
const along = (pts: V3[], u: number): V3 => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return vlerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 0); d -= L[i]; }
  return pts[pts.length - 1];
};
const Beads: React.FC<{ t: number; pts: V3[]; n?: number; speed?: number; r?: number; ph?: number; on?: boolean }> = ({ t, pts, n = 6, speed = 0.8, r = 0.28, ph = 0, on = true }) =>
  !on ? null : <G>{Array.from({ length: n }, (_, i) => <Sph key={i} rad={r} p={along(pts, fract(t * speed + i / n + ph))} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} cast={false} ws={8} hs={6} />)}</G>;
const Ruler: React.FC<{ p: V3; h: number; k: number; step?: number; w?: number }> = ({ p, h, k, step = 2, w = 1 }) => {
  if (k <= 0.01) return null;
  const y = h * k, o = { emissive: "#ffb000", ei: 0.8 };
  return (
    <G p={p} sc={[w, 1, w]}>
      <Box s={[2.2, 0.3, 0.4]} p={[0, 0.15, 0]} c="#ffd43a" o={o} cast={false} />
      <Box s={[0.4, y, 0.4]} p={[0, y / 2, 0]} c="#ffd43a" o={o} cast={false} />
      {Array.from({ length: Math.floor(y / step) }, (_, i) => <Box key={i} s={[i % 2 ? 0.9 : 1.4, 0.18, 0.4]} p={[0, (i + 1) * step, 0]} c="#ffd43a" o={o} cast={false} />)}
      <Cone rad={0.8} h={1.1} p={[0, y + 0.5, 0]} seg={4} c="#ffd43a" o={o} cast={false} />
      {k > 0.98 ? <Box s={[2.8, 0.34, 0.45]} p={[0, h, 0]} c="#fff3a0" o={o} cast={false} /> : null}
    </G>
  );
};
const signTex = (lines: [string, number, string][], bg: string, border: string, w = 512, h = 256) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d")!;
  g.fillStyle = border; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(14, 14, w - 28, h - 28);
  g.textAlign = "center"; g.textBaseline = "middle";
  const n = lines.length;
  lines.forEach(([txt, px, col], i) => {
    let p = px; g.font = `bold ${p}px Arial, Helvetica, sans-serif`;
    while (p > 20 && g.measureText(txt).width > w - 90) { p -= 2; g.font = `bold ${p}px Arial, Helvetica, sans-serif`; }   // o texto cabe sempre dentro da moldura (E21: «LABORATORI»)
    g.fillStyle = col; g.fillText(txt, w / 2, (h * (i + 1)) / (n + 1));
  });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
const SignBoard: React.FC<{ lines: [string, number, string][]; bg: string; border: string; s: [number, number]; p?: V3; r?: V3; px?: [number, number] }> = ({ lines, bg, border, s, p, r, px = [512, 256] }) => {
  const tx = useMemo(() => signTex(lines, bg, border, px[0], px[1]), [lines, bg, border, px]);
  return <mesh position={p} rotation={r} castShadow={false}><planeGeometry args={s} /><meshBasicMaterial map={tx} side={THREE.DoubleSide} /></mesh>;
};
const Rain: React.FC<{ t: number; c: V3; w: number; h: number; n?: number; on: boolean; speed?: number }> = ({ t, c, w, h, n = 46, on, speed = 2.3 }) =>
  !on ? null : <G>{Array.from({ length: n }, (_, i) => <Box key={i} s={[0.1, 1.5, 0.1]} p={[c[0] + (rnd(i * 3 + 1) - 0.5) * w, c[1] + h * (1 - fract(t * speed + rnd(i * 3 + 3))), c[2] + (rnd(i * 3 + 2) - 0.5) * w]} c="#d6ecff" o={{ emissive: "#9fd2ff", ei: 0.7 }} cast={false} recv={false} />)}</G>;

// ---------------------------------------------------------------- chão: o plano com 4 buracos (a tigela e 3 poços), o morro do norte, serra de neve
const holes: [number, number, number][] = [[0, 0, RT], [PB.x, PB.z, PB.R], [PC.x, PC.z, PC.R], [PD.x, PD.z, PD.R]];
const PATCH = Array.from({ length: 90 }, (_, i) => ({ x: lerp(-330, 330, rnd(i * 3 + 1)), z: lerp(-300, 330, rnd(i * 3 + 2)), r: lerp(4, 13, rnd(i * 3 + 3)), c: i % 3 ? GROUND2 : "#b4c868" }))
  .filter((q) => holes.every(([x, z, R]) => Math.hypot(q.x - x, q.z - z) > R + q.r + 1) && hillY(q.x, q.z) < 0.5);
const Land: React.FC = () => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape(); sh.moveTo(-900, -900); sh.lineTo(900, -900); sh.lineTo(900, 900); sh.lineTo(-900, 900); sh.lineTo(-900, -900);
    for (const [x, z, R] of holes) { const h = new THREE.Path(); h.absarc(x, -z, R, 0, PI * 2, true); sh.holes.push(h); }
    const g = new THREE.ShapeGeometry(sh, 48); g.rotateX(-PI / 2); return g;
  }, []);
  const hill = useMemo(() => {
    const g = new THREE.PlaneGeometry(2 * HILL.rx + 20, 2 * HILL.rz + 20, 48, 40); g.rotateX(-PI / 2); g.translate(HILL.x, 0, HILL.z);
    const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, hillY(p.getX(i), p.getZ(i)) + 0.05);
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <G>
      <mesh geometry={geo} receiveShadow material={mat(GROUND)} />
      {PATCH.map((q, i) => <mesh key={i} position={[q.x, 0.03, q.z]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(q.c)}><circleGeometry args={[q.r, 10]} /></mesh>)}
      <mesh geometry={hill} receiveShadow castShadow material={mat("#9ab656", { flat: true })} />
    </G>
  );
};
const Peaks: React.FC = () => (
  <G>
    {([[-230, -330, 95, 150], [-60, -400, 120, 190], [110, -380, 105, 160], [260, -300, 90, 130], [-340, -170, 85, 120], [350, -120, 80, 110], [-380, 60, 90, 100], [390, 120, 75, 90], [0, -470, 150, 240]] as const).map(([x, z, r, h], i) => (
      <G key={i}>
        <Cone rad={r} h={h} seg={7} p={[x, h / 2 - 3, z]} c={i % 2 ? "#8f93a3" : "#9a9eae"} o={{ flat: true }} cast={false} />
        <Cone rad={r * 0.46} h={h * 0.46} seg={7} p={[x, h - h * 0.23 - 3, z]} c="#f6f9ff" o={{ flat: true, emissive: "#dfe8ff", ei: 0.25 }} cast={false} />
      </G>
    ))}
  </G>
);
const Tufts: React.FC = () => {
  const spots = useMemo(() => Array.from({ length: 36 }, (_, i): V3 => [lerp(-250, 250, rnd(i * 5 + 1)), 0, lerp(-240, 260, rnd(i * 5 + 2))]).filter(([x, , z]) => holes.every(([hx, hz, R]) => Math.hypot(x - hx, z - hz) > R + 6) && hillY(x, z) < 0.3), []);
  return <G>{spots.map((q, i) => <G key={i} p={q} sc={lerp(1.4, 2.6, rnd(i + 4))}><Sph rad={0.9} p={[0, 0.3, 0]} sc={[1.3, 0.7, 1]} c="#c9b26a" ws={7} hs={5} /><Sph rad={0.55} p={[0.9, 0.15, 0.3]} c="#b9a25a" ws={6} hs={4} /></G>)}</G>;
};

// ---------------------------------------------------------------- a tigela principal
const ac = (i: number) => PI + 0.9 * (i + 1);                          // onde a água cai do anel i para o anel i+1 (espiral)
const STA = (i: number) => 0.35 + i * 0.61;                            // onde ficam as pedras que saem do muro (anel i)
export const STONE_RING = 6, STONE_A = STA(6);
const tintK = (t: number) => ease(t, T.donde, T.donde + 0.9) * (1 - ease(t, T.paraellos, T.paraellos + 1.0));
const cropCol = (i: number, t: number) => {
  const vivid = t < T.moray ? 1 : wetK(i, t);
  const base = qcol("#b9bd66", "#5fc24a", vivid, 6);
  const k = tintK(t); if (k <= 0.01) return base;
  const hp = 0.5 + 0.5 * Math.sin((i / 11) * PI * 1.8 + t * 1.7);
  return qcol(base, qcol("#3f8fe8", "#ff8a2a", hp, 5), k * 0.85, 6);
};
const BLK = 32;
const BowlRing: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const s = ringState(i, t), col = cropCol(i, t), y = yT(i), yb = i < N - 1 ? yT(i + 1) : y, wallH = HH;
  const blocks = i === DEMO && t < T.doce;   // «muros de piedra en círculos»: a pedra cai bloco a bloco, volta a volta (vista de cima lê-se como um círculo que se fecha)
  const cas = i < N - 1 ? prog(t, wetT(i) + 0.05, wetT(i) + 0.3) : 0, wetNow = t >= WET_ON && wetK(i, t) > 0.02;
  const a0 = i === 0 ? PI : ac(i - 1), a1 = ac(i);
  const pts = useMemo(() => Array.from({ length: 10 }, (_, k) => P(lerp(a0, a1, k / 9), (rIn(i) + rOut(i)) / 2, y + 0.18)), [i, a0, a1, y]);
  return (
    <G>
      {s.tr > 0.01 ? (
        <G p={[0, y, 0]} sc={[0.55 + 0.45 * outBack(s.tr), 1, 0.55 + 0.45 * outBack(s.tr)]}>
          <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(col, { flat: true })}><ringGeometry args={[rIn(i), rOut(i), 48, 1]} /></mesh>
          {[0.3, 0.7].map((q) => <mesh key={q} position={[0, 0.03, 0]} rotation={[-PI / 2, 0, 0]} material={mat(qcol(col, "#2d7a2a", 0.45, 4))}><ringGeometry args={[rIn(i) + WW * q - 0.14, rIn(i) + WW * q + 0.14, 48, 1]} /></mesh>)}
          {wetNow ? <mesh position={[0, 0.07, 0]} rotation={[-PI / 2, 0, 0]} material={mat(WATER, { emissive: "#1f8fe0", ei: 0.9, opacity: 0.9 })}><ringGeometry args={[(rIn(i) + rOut(i)) / 2 - 0.2, (rIn(i) + rOut(i)) / 2 + 0.2, 32, 1, PI / 2 - a1, a1 - a0]} /></mesh> : null}
          {wetNow ? <Beads t={t} pts={pts.map((q): V3 => [q[0], 0.2, q[2]])} n={3} speed={0.9} r={0.24} /> : null}
        </G>) : null}
      {i < N - 1 && s.w > 0.01 ? (
        <G p={[0, yb, 0]} sc={[1, Math.max(0.001, s.w), 1]}>
          {blocks ? Array.from({ length: BLK }, (_, j) => {
            const tj = lerp(T.c1 + 0.2, T.circulosEnd - 0.4, j / (BLK - 1)), u = prog(t, tj, tj + 0.3); if (t < tj) return null;
            const a = STA(0) + ((j + 0.5) * PI * 2) / BLK, arc = (rIn(i) * PI * 2) / BLK;
            return <Box key={j} s={[arc * 0.96, wallH, 1.5]} p={P(a, rIn(i) - 0.3, wallH / 2 + (1 - ease(u, 0, 1)) * 7)} r={[0, a, 0]} sc={0.8 + 0.2 * u} c={j % 2 ? "#cfc5b8" : "#9a8f84"} o={{ flat: true }} cast={false} />;
          }) : <Cyl rt={rIn(i)} h={wallH} p={[0, wallH / 2, 0]} seg={48} open c={i % 2 ? STONE : STONE2} ts={i === DEMO ? STA(0) : 0} tl={i === DEMO ? PI * 2 * Math.max(0.001, s.sw) : PI * 2} o={{ side: "double", flat: true }} cast={false} />}
          {blocks ? null : [0.28, 0.58, 0.88].map((q, k) => <Cyl key={k} rt={rIn(i) + 0.03} h={0.07} p={[0, wallH * q, 0]} seg={48} open c={k === 1 ? "#b9aea0" : "#6f655b"} ts={i === DEMO ? STA(0) : 0} tl={i === DEMO ? PI * 2 * Math.max(0.001, s.sw) : PI * 2} o={{ side: "double" }} cast={false} />)}
          {[0, 1, 2].map((k) => <Box key={k} s={[1.1, 0.26, 0.62]} p={P(STA(i) + k * 0.05, rIn(i) - 0.2, wallH - 0.5 - k * 0.5)} r={[0, STA(i) + k * 0.05, 0]} c="#b3a79a" />)}
          {cas > 0.01 && wetNow ? <G>
            <Box s={[0.62, wallH * cas, 0.14]} p={[...P(ac(i), rIn(i) - 0.1, wallH - (wallH * cas) / 2)] as V3} r={[0, ac(i), 0]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0, opacity: 0.92 }} cast={false} />
            <Box s={[1.0, 0.3, 0.55]} p={P(ac(i), rIn(i) - 0.15, wallH + 0.02)} r={[0, ac(i), 0]} c="#cfc4b6" cast={false} />
            <Cyl rt={0.7 + 0.15 * Math.sin(t * 9 + i)} h={0.05} p={P(ac(i), rIn(i) - 0.7, 0.04)} c="#7fd2ff" o={{ emissive: "#2f9fe8", ei: 0.9 }} cast={false} />
          </G> : null}
        </G>) : null}
    </G>
  );
};
/** o cone de terra nua (a «pared» do buraco) + faixas de estrato e pedras soltas, para o movimento da câmera ler */
const CONE_ROCKS = Array.from({ length: 18 }, (_, k) => ({ a: rnd(k + 1) * PI * 2, d: lerp(1.5, 19, rnd(k + 20)), s: lerp(0.35, 0.8, rnd(k + 40)) }));
const Cone3: React.FC = () => (
  <G>
    <Cyl rt={RT} rb={RB} h={DEPTH} p={[0, -DEPTH / 2, 0]} seg={48} open c={EARTH} o={{ side: "double", flat: true }} cast={false} />
    {[1.8, 5.4, 9.0, 12.6, 16.2].map((d, k) => <Cyl key={k} rt={rc(d) - 0.05} rb={rc(d + 1.3) - 0.05} h={1.3} p={[0, -d - 0.65, 0]} seg={48} open c={EARTH2} o={{ side: "double", flat: true }} cast={false} />)}
    <Cyl rt={RB} h={0.1} p={[0, FLOOR - 0.07, 0]} c={EARTH} seg={48} cast={false} />
    {CONE_ROCKS.map((q, k) => <Sph key={k} rad={q.s} p={P(q.a, rc(q.d) - 0.3, -q.d)} c={k % 2 ? "#8b7b6a" : "#a0907c"} ws={6} hs={4} cast={false} o={{ flat: true }} />)}
  </G>
);
const Rim: React.FC<{ t: number }> = ({ t }) => {
  const s = ringState(0, t);
  return (
    <G>
      <Cyl rt={RT + 0.15} h={0.5} p={[0, -0.12, 0]} seg={48} open c="#8d7f6e" o={{ side: "double" }} cast={false} />
      {s.w > 0.01 || teaser(t) ? <Cyl rt={RT} rb={rOut(0)} h={HH} p={[0, -HH / 2, 0]} seg={48} open c={STONE} o={{ side: "double", flat: true }} cast={false} /> : null}
    </G>
  );
};
const Floor: React.FC<{ t: number }> = ({ t }) => {
  const s = ringState(N - 1, t), open = pitOpen(t), lid = t >= T.inunda - 0.1 ? popK(t, T.inunda - 0.1, 0.3) : 0, green = qcol("#b9bd66", "#5fc24a", t < T.moray ? 1 : wetK(N - 1, t), 6);
  const col = tintK(t) > 0.01 ? cropCol(N - 1, t) : green;
  const geo = useMemo(() => {
    const sh = new THREE.Shape(); sh.absarc(0, 0, FR, 0, PI * 2, false);
    const h = new THREE.Path(); h.moveTo(PIT.x0, -PIT.z1); h.lineTo(PIT.x1, -PIT.z1); h.lineTo(PIT.x1, -PIT.z0); h.lineTo(PIT.x0, -PIT.z0); h.lineTo(PIT.x0, -PIT.z1); sh.holes.push(h);
    const g = new THREE.ShapeGeometry(sh, 48); g.rotateX(-PI / 2); return g;
  }, []);
  if (s.tr <= 0.01) return null;
  return (
    <G p={[0, FLOOR, 0]}>
      {open ? <mesh geometry={geo} receiveShadow material={mat(col, { flat: true })} /> : <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(col, { flat: true })}><circleGeometry args={[FR, 48]} /></mesh>}
      {lid > 0 && lid < 1.2 && open ? <Box s={[10, 0.3, 8]} p={[0, 0.0, -1]} sc={[Math.max(0.001, lid), 1, Math.max(0.001, lid)]} c="#6fcf55" cast={false} /> : null}
    </G>
  );
};
/** o poço do filtro: paredes de terra em seção, rochas caindo uma a uma, a água que some pelas frestas */
const FilterPit: React.FC<{ t: number }> = ({ t }) => {
  if (!pitOpen(t) && !(t >= T.inunda - 0.1 && t < T.inunda + 0.5)) return null;
  const k = pitK(t), d = PIT.d * k, bot = FLOOR - d, w = PIT.x1 - PIT.x0, dz = PIT.z1 - PIT.z0, cx = (PIT.x0 + PIT.x1) / 2, cz = (PIT.z0 + PIT.z1) / 2;
  const layer = (c: string, y0: number, y1: number, ex = 0) => ({ c, y: (y0 + y1) / 2, h: Math.max(0.001, y0 - y1 + ex) });
  const L1 = layer("#a3794a", FLOOR, FLOOR - d * 0.45), L2 = layer("#c9a06a", FLOOR - d * 0.45, bot);
  return (
    <G>
      {[L1, L2].map((L, q) => (
        <G key={q}>
          <Box s={[w, L.h, 0.3]} p={[cx, L.y, PIT.z0 - 0.15]} c={L.c} cast={false} />
          <Box s={[0.3, L.h, dz]} p={[PIT.x0 - 0.15, L.y, cz]} c={L.c} cast={false} /><Box s={[0.3, L.h, dz]} p={[PIT.x1 + 0.15, L.y, cz]} c={L.c} cast={false} />
          <Box s={[w, L.h, 0.3]} p={[cx, L.y, PIT.z1 + 0.15]} c={L.c} cast={false} />
        </G>))}
      <Box s={[w, 0.2, dz]} p={[cx, bot - 0.1, cz]} c="#8a6a44" cast={false} />
      {ROCKS.map(([x, z, r, k2], q) => {
        const a = rockT(q), u = prog(t, a, a + 0.38); if (t < a - 0.02) return null;
        const yEnd = bot + r * 0.85 + (q > 4 ? 0.9 : 0), y = lerp(FLOOR + 10, yEnd, u * u);
        return <Sph key={q} rad={r} p={[x, y, z]} sc={[1, 0.82, 1]} r={[k2, k2 * 2, 0]} c={q % 2 ? "#8c8f96" : "#a1a4ab"} ws={8} hs={6} o={{ flat: true }} />;
      })}
      {t >= T.cuela - 0.05 && t < T.inunda ? Array.from({ length: 10 }, (_, q) => {
        const u = fract((t - T.cuela) * 0.9 + q / 10), x = lerp(PIT.x0 + 1, PIT.x1 - 1, rnd(q + 3)), z = lerp(PIT.z0 + 1, PIT.z1 - 1, rnd(q + 9));
        return <Sph key={q} rad={0.3 * (1 - ease(u, 0.75, 1))} p={[x, lerp(FLOOR + 0.4, bot + 0.5, u), z]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} cast={false} ws={8} hs={6} />;
      }) : null}
    </G>
  );
};
const Flood: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p3 + 0.1 || t > T.cuela + 1.8) return null;
  const y = floodY(t), r = Math.min(stepR(y) - 0.05, lerp(0.6, FR + 1.5, ease(t, T.p3 + 0.1, T.hoyo + 0.5)));
  if (r < 0.7) return null;
  const hole = t >= T.cuela;
  return (
    <G>
      <Cyl rt={r} h={0.06} p={[0, y, 0]} seg={48} c={WATER} o={{ opacity: hole ? 0.5 : 0.8, emissive: "#2f8fe0", ei: 0.6, depthWrite: false }} cast={false} recv={false} />
      <mesh position={[0, y + 0.05, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#bfe8ff", { emissive: "#bfe8ff", ei: 0.8, opacity: 0.7, depthWrite: false })}><ringGeometry args={[Math.max(0.1, r - 0.28), r, 48]} /></mesh>
    </G>
  );
};
const Bowl: React.FC<{ t: number }> = ({ t }) => {
  const pd = plugD(t), plugOn = t >= T.sola0 && t < T.incas + 0.4 && pd < DEPTH - 0.02;
  const crack = ease(t, T.sola0 + 0.25, T.hundio) * (t < T.hundio + 0.5 ? 1 : 0);
  return (
    <G>
      <Cone3 />
      {Array.from({ length: N }, (_, i) => <BowlRing key={i} i={i} t={t} />)}
      <Rim t={t} /><Floor t={t} /><FilterPit t={t} /><Flood t={t} />
      {plugOn ? <G p={[0, -pd - 0.03, 0]}>
        <Cyl rt={rc(pd)} h={0.12} p={[0, -0.06, 0]} seg={48} c={GROUND} cast={false} />
        {crack > 0.01 ? Array.from({ length: 9 }, (_, k) => <Box key={k} s={[0.35, 0.1, RT * 0.78 * crack]} p={P((k / 9) * PI * 2, RT * 0.5 * crack + 3, 0.04)} r={[0, (k / 9) * PI * 2, 0]} c="#5b4a30" cast={false} />) : null}
      </G> : null}
      {t >= T.hundio - 0.1 && t < T.incas + 0.5 ? <Puffs t={t * 1.3} p={[0, 0.5, 0]} n={14} period={1.6} rise={14} size={3.2} c="#d9c9a0" drift={[0, 0, 0]} on={1 - ease(t, T.incas - 0.3, T.incas + 0.4)} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- os outros buracos (3), o do C é um remendo plano que cai em C2
const Pit: React.FC<{ q: PitDef; plug?: number }> = ({ q, plug }) => (
  <G p={[q.x, 0, q.z]}>
    <Cyl rt={q.R} rb={q.R * 0.5} h={q.d} p={[0, -q.d / 2, 0]} seg={32} open c={EARTH} o={{ side: "double", flat: true }} cast={false} />
    <Cyl rt={q.R * 0.5} h={0.1} p={[0, -q.d - 0.05, 0]} c="#8aa24f" seg={32} cast={false} />
    {[0.3, 0.62].map((f, k) => <Cyl key={k} rt={q.R * (1 - 0.5 * f) - 0.05} rb={q.R * (1 - 0.5 * (f + 0.12)) - 0.05} h={q.d * 0.12} p={[0, -q.d * (f + 0.06), 0]} seg={32} open c={EARTH2} o={{ side: "double", flat: true }} cast={false} />)}
    <Cyl rt={q.R + 0.1} h={0.35} p={[0, -0.12, 0]} seg={32} open c="#8d7f6e" o={{ side: "double" }} cast={false} />
    {plug !== undefined && plug < q.d - 0.02 ? <Cyl rt={q.R - plug * ((q.R * 0.5) / q.d)} h={0.12} p={[0, 0.0 - plug - 0.05, 0]} c={GROUND} seg={32} cast={false} /> : null}
  </G>
);
const Pits: React.FC<{ t: number }> = ({ t }) => (
  <G>
    <Pit q={PB} /><Pit q={PD} /><Pit q={PC} plug={pitCD(t)} />
    {t >= C2 && t < C2 + 2.2 ? [0, 1, 2, 3, 4, 5].map((k) => <Dust key={k} t={t + k * 0.37} t0={C2} p={[PC.x + Math.sin(k * 1.05) * PC.R * 0.8, 0.5, PC.z + Math.cos(k * 1.05) * PC.R * 0.8]} n={4} spread={5} rise={8} size={3.0} on={1 - ease(t, C2 + 1.2, C2 + 2.1)} />) : null}
    {t >= T.hundio - 0.1 && t < T.incas + 0.5 ? [0, 1, 2, 3, 4, 5, 6, 7].map((k) => <Dust key={k} t={t * 1.1 + k * 0.4} t0={0} p={P(k * 0.79, RT - 2, 0.5)} n={4} spread={6} rise={10} size={3.4} on={1 - ease(t, T.incas - 0.3, T.incas + 0.4)} />) : null}
  </G>
);

// ---------------------------------------------------------------- gancho: a pá (✖), a escavadeira (✖), as figuras de escala
export const INCA = { skin: "#a8673f", top: "#f2ece0", bottom: "#a8673f", kilt: "#c8352a", kiltLen: 0.52, hat: "cap" as const, hatC: "#2a2420", boot: "#7a4a2a", belt: "#2a2420", sleeves: false };
export const SHV = P(1.75, RT + 4, 0), EXC = P(2.35, RT + 4.5, 0);
const Shovel: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  if (t < T.pero0 || t >= T.sola0) return null;
  const k = popK(t, T.pero0 + 0.08, 0.3);
  return (
    <G>
      <G p={SHV} sc={Math.max(0.001, k) * 2.2} r={[0.18, 0.5, 0.1]}>
        <Cyl rt={0.14} h={5.5} p={[0, 3.8, 0]} c="#8a5a2b" seg={8} /><Box s={[0.9, 0.18, 0.18]} p={[0, 6.6, 0]} c="#8a5a2b" />
        <Box s={[1.9, 2.1, 0.22]} p={[0, 0.6, 0]} c="#9aa1a8" o={{ metal: 0.5, rough: 0.35 }} /><Cone rad={1.0} h={0.9} seg={3} p={[0, -0.9, 0]} r={[0, 0, PI]} sc={[1, 1, 0.3]} c="#9aa1a8" o={{ metal: 0.5 }} />
      </G>
      <Box s={[3.4, 0.5, 2.6]} p={[SHV[0] + 1.0, 0.2, SHV[2] + 1.4]} r={[0, 0.6, 0]} c="#7a5a38" />
      <XMark t={t} a={T.cavo + 0.3} b={T.sola0 - 0.02} p={[SHV[0], 9, SHV[2]]} cam={cam} sc={0.6} />
    </G>
  );
};
const Excavator: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  if (t < T.maquina - 0.4 || t >= T.moray + 0.15) return null;
  const k = popK(t, T.maquina - 0.35, 0.3), arm = Math.sin(t * 3) * 0.25;
  return (
    <G>
      <G p={EXC} sc={Math.max(0.001, k) * 1.5} r={[0, -0.5, 0]}>
        {[-1.5, 1.5].map((x) => <Box key={x} s={[0.9, 0.7, 4.2]} p={[x, 0.35, 0]} c="#2a2a2e" />)}
        <Box s={[3.2, 1.0, 3.4]} p={[0, 1.2, 0]} c="#f2b822" /><Box s={[1.7, 1.5, 1.7]} p={[-0.7, 2.4, -0.5]} c="#f2b822" /><Box s={[1.2, 0.8, 0.12]} p={[-0.7, 2.6, 0.38]} c="#bfe0ff" o={{ emissive: "#7fb8e8", ei: 0.4 }} />
        <G p={[0.6, 2.2, 0.4]} r={[-0.9 + arm, 0, 0]}><Box s={[0.5, 0.5, 4.2]} p={[0, 0, 2.1]} c="#f2b822" />
          <G p={[0, 0, 4.2]} r={[1.6 - arm, 0, 0]}><Box s={[0.4, 0.4, 2.6]} p={[0, 0, 1.3]} c="#e0a010" /><Box s={[1.4, 0.9, 1.0]} p={[0, -0.2, 2.8]} c="#5a5f66" /></G></G>
      </G>
      <XMark t={t} a={T.maquina + 0.3} b={T.moray + 0.12} p={[EXC[0], 9.5, EXC[2]]} cam={cam} sc={0.8} />
    </G>
  );
};
const FIG_ANG = [0.15, 0.85, 2.7, 3.35, 4.3, 5.4];
const Figures: React.FC<{ t: number }> = ({ t }) => {
  const hook = t < T.sola0, fin = t >= T.manda - 0.02;
  if (!hook && !fin) return null;
  const list = FIG_ANG.map((a, k) => ({ p: P(a, RT + 2.2, 0.02), yaw: a + PI, pose: (fin ? (k % 2 ? "cheer" : "present") : "idle") as PoseName, ph: k * 0.7 }));
  return <Crowd list={list} t={t} c={INCA} scale={2.2} />;
};

// ---------------------------------------------------------------- contexto: a altura (régua), o corte do solo (diorama), a fundura
const AltRuler: React.FC<{ t: number }> = ({ t }) => (t < T.tresmil - 0.1 || t >= T.suelo ? null : <Ruler p={[54, 0, -30]} h={52} k={ease(t, T.tresmil, T.metros34)} step={4} w={3.2} />);
const DepthRuler: React.FC<{ t: number }> = ({ t }) => (t < T.treinta - 0.1 || t >= T.p1 + 0.05 ? null : <Ruler p={[0, FLOOR, 0]} h={DEPTH} k={ease(t, T.treinta, T.treintaEnd)} step={1.7} w={2.3} />);
const ON_GEO = (t: number) => t >= T.suelo - 0.02 && t < C2 + 0.05;
const glow = (t: number, a: number) => (t < a ? 0 : Math.round(Math.max(0, 1 - (t - a) / 0.7) * 6) / 6);
const Geo: React.FC<{ t: number }> = ({ t }) => {
  if (!ON_GEO(t)) return null;
  const fEnd = Math.min(T.derrumba + 0.2, C2 - 0.14), fStart = Math.min(T.terreno + 0.15, fEnd - 0.55);   // o desabamento termina ANTES do corte C2 (régua), mesmo se a voz real atrasar
  const grow = ease(t, T.disuelve + 0.15, T.dentroEnd + 0.25), fall = ease(t, fStart, fEnd), gc = glow(t, T.caliza), gy = glow(t, T.yeso);
  const tilt = Math.sin(fall * PI) * 0.06, rain = t >= T.disuelve - 0.05 && t < T.derrumba;
  return (
    <G p={DIO}>
      <Box s={[34, 2.4, 18]} p={[0, -23.2, -6]} c="#3a4350" cast={false} />
      <Box s={[28, 12, 12]} p={[0, -16, -6]} c="#f3f6f9" o={{ emissive: "#9fd4ff", ei: gy * 0.8 }} cast={false} />
      <Box s={[13, 3.6, 12]} p={[0, -8.2, -6]} c="#e8dcbc" o={{ emissive: "#ffd88a", ei: gc * 0.7 }} cast={false} />
      {[-1, 1].map((s) => <G key={s}>
        <Box s={[7.5, 1.6, 12]} p={[s * 10.25, -0.8, -6]} c="#7fb544" cast={false} /><Box s={[7.5, 8.4, 12]} p={[s * 10.25, -5.8, -6]} c="#e8dcbc" o={{ emissive: "#ffd88a", ei: gc * 0.7 }} cast={false} />
      </G>)}
      <G p={[0, -fall * 4.8, 0.0]} r={[0, 0, tilt]}>
        <Box s={[13, 1.6, 12.1]} p={[0, -0.8, -5.95]} c="#7fb544" cast={false} /><Box s={[13, 4.8, 12.1]} p={[0, -4.0, -5.95]} c="#e8dcbc" o={{ emissive: "#ffd88a", ei: gc * 0.7 }} cast={false} />
      </G>
      <Box s={[28, 0.14, 0.08]} p={[0, -1.6, 0.04]} c="#8a7a5c" cast={false} /><Box s={[28, 0.14, 0.08]} p={[0, -10, 0.04]} c="#8a7a5c" cast={false} />
      {Array.from({ length: 10 }, (_, k) => <Box key={k} s={[0.9, 0.9, 0.1]} p={[lerp(-13, 13, rnd(k + 5)), lerp(-21, -11, rnd(k + 9)), 0.05]} r={[0, 0, rnd(k) * 3]} c="#cfe9ff" o={{ emissive: "#9fd4ff", ei: 0.35 }} cast={false} />)}
      {grow > 0.02 ? <G>
        <Sph rad={1} p={[0, -10.6, 0.1]} sc={[6.8 * grow, 4.1 * grow, 0.02]} c="#b8946a" ws={20} hs={10} cast={false} />
        <Sph rad={1} p={[0, -10.6, 0.16]} sc={[6.4 * grow, 3.8 * grow, 0.02]} c="#2b1d14" ws={20} hs={10} cast={false} />
      </G> : null}
      {fall > 0.55 ? [[-5, -13.2, 1.1], [-2, -13.0, 1.4], [1.5, -13.3, 1.0], [4.6, -13.1, 1.3], [-3.2, -12.1, 0.8], [2.8, -12.0, 0.9]].map(([x, y, s], k) => <Box key={k} s={[s * 1.4, s, 0.6]} p={[x, y, 0.4]} r={[0, 0, k * 0.7]} c={k % 2 ? "#cfc5ac" : "#e8e2d2"} cast={false} />) : null}
      <Rain t={t} c={[0, 0, -3]} w={12} h={24} n={26} on={rain} speed={2.6} />
      {t >= T.disuelve && t < T.derrumba + 0.3 ? Array.from({ length: 10 }, (_, k) => {
        const u = fract((t - T.disuelve) * 0.55 + k / 10), x = lerp(-5.5, 5.5, rnd(k + 2));
        return u > 0.9 ? null : <Sph key={k} rad={0.33} p={[x, lerp(-1.4, -8.6, u), 0.22]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} cast={false} ws={8} hs={6} />;
      }) : null}
      {t >= fEnd - 0.45 ? <Dust t={t} t0={fEnd - 0.45} p={[0, -2.2, 5]} n={12} spread={9} rise={4} size={2.0} on={1 - ease(t, fEnd + 0.1, fEnd + 0.9)} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- problema 1: a chuva leva a terra da parede nua (✖)
export const AW = PI / 2;                                             // a parede que a câmera olha (lado +x)
const SEEDS = [[4.0, -0.22], [6.6, 0.12], [9.2, 0.3], [12.0, -0.1], [14.6, 0.2]] as const;
const Slide: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  if (t < T.p1 || t >= T.b1) return null;
  return (
    <G>
      <Rain t={t} c={[20, -21, 0]} w={36} h={24} n={56} on={t >= T.p1 + 0.1} speed={2.5} />
      {SEEDS.map(([d0, off], k) => {
        const sw = k === 1 ? prog(t, T.lluvia + 0.3, T.lleva + 0.9) : 0, d = d0 + sw * sw * 7, yaw = AW + off + (k === 1 ? sw * 0.4 : 0);
        return <G key={k} p={P(yaw, rc(d) - 0.2, -d)} r={[sw * 7, 0, sw * 5]} sc={Math.max(0.001, 1 - ease(sw, 0.85, 1) * 0.9) * 1.6}>
          <Cyl rt={0.07} h={1.1} p={[0, 0.55, 0]} c="#3f8a2a" seg={6} /><Box s={[0.55, 0.05, 0.28]} p={[0.28, 1.0, 0]} r={[0, 0, 0.5]} c="#58c63a" /><Box s={[0.55, 0.05, 0.28]} p={[-0.28, 1.0, 0]} r={[0, 0, -0.5]} c="#58c63a" />
        </G>;
      })}
      {Array.from({ length: 9 }, (_, k) => {
        const ts = T.lluvia + k * 0.07, u = prog(t, ts, ts + 1.4); if (t < ts - 0.02) return null;
        const d0 = 2.4 + k * 1.55, d = d0 + u * u * (5 + (k % 3)), off = (rnd(k + 7) - 0.5) * 0.55, s = 0.9 + rnd(k + 3) * 0.8;
        return d > DEPTH - 0.6 ? null : <Box key={k} s={[s * 1.3, s * 0.8, s]} p={P(AW + off, rc(d) - 0.5, -d)} r={[u * 3, AW + u * 2, u]} sc={1 - ease(u, 0.8, 1) * 0.5} c={k % 2 ? "#8a6a44" : "#a07c52"} />;
      })}
      <XMark t={t} a={T.lleva + 0.35} b={T.b1 - 0.02} p={P(AW, rc(12) - 6, -12)} cam={cam} sc={1.3} />
    </G>
  );
};

// ---------------------------------------------------------------- solução 1: corte do aterro (diorama), nível e bola no anel, escada de pedras
const ON_FILL = (t: number) => t >= T.pordentro - 0.02 && t < T.doce + 0.05;
const FY0 = -8, FH = 6.6, FW = 9.3, FZ = 10;
const Fill: React.FC<{ t: number }> = ({ t }) => {
  if (!ON_FILL(t)) return null;
  const L = ease(t, T.relleno - 0.1, T.rellenoEnd + 0.1), n = 10, dy = FH / n, top = FY0 + FH;
  return (
    <G p={DIO}>
      <Box s={[34, 2.4, 18]} p={[-2, FY0 - 9.2, -5]} c="#3a4350" cast={false} />
      <Box s={[28, 8, FZ]} p={[-2, FY0 - 4, -FZ / 2]} c="#8a6a44" cast={false} /><Box s={[12, 0.5, FZ]} p={[6, FY0 - 0.25, -FZ / 2]} c="#7fb544" cast={false} />
      {Array.from({ length: n }, (_, j) => {
        const xs = -FW * ((j + 0.5) / n), w = xs + 16, wj = FW * ((j + 0.5) / n), lv = clamp((L * FH - j * dy) / dy);
        return <G key={j}>
          <Box s={[w, dy + 0.02, FZ]} p={[(xs - 16) / 2, FY0 + (j + 0.5) * dy, -FZ / 2]} c={j % 2 ? "#7a5c38" : "#6f5333"} cast={false} />
          {lv > 0.01 ? <Box s={[wj, dy * lv, FZ]} p={[-wj / 2, FY0 + j * dy + (dy * lv) / 2, -FZ / 2]} c="#f0b34c" cast={false} /> : null}
        </G>;
      })}
      <Box s={[16 - FW, 5, FZ]} p={[(-16 - FW) / 2, top + 2.5, -FZ / 2]} c="#9a7648" cast={false} /><Box s={[16 - FW, 0.5, FZ]} p={[(-16 - FW) / 2, top + 5.2, -FZ / 2]} c="#7fb544" cast={false} />
      {Array.from({ length: 8 }, (_, k) => <Box key={k} s={[2.3, FH / 8 - 0.1, FZ + 0.1]} p={[0.05 + (k % 2 ? 0.28 : -0.28), FY0 + (k + 0.5) * (FH / 8), -FZ / 2]} c={k % 2 ? "#c4baae" : "#9a8f84"} cast={false} />)}
      {L > 0.97 ? <Box s={[FW, 0.4, FZ]} p={[-FW / 2, top - 0.2, -FZ / 2]} c="#7fb544" sc={[Math.max(0.001, popK(t, T.rellenoEnd - 0.02, 0.25)), 1, 1]} cast={false} /> : null}
      {t < T.rellenoEnd + 0.1 ? Array.from({ length: 11 }, (_, k) => {
        const u = fract((t - T.pordentro) * 1.3 + k / 11), x = lerp(-FW + 1.5, -1.6, rnd(k + 4)), yL = FY0 + FH * L + 0.4;
        return <Box key={k} s={[1.0, 1.0, 1.0]} p={[x, lerp(top + 9, yL, u * u), -2 - rnd(k + 8) * 6]} r={[u * 4, u * 3, 0]} c="#f0b34c" cast={false} />;
      }) : null}
      <Crowd list={[{ p: [-12.5, top + 5, -3], yaw: 1.1, pose: "pour", ph: 0 }, { p: [-14.8, top + 5, -6], yaw: 1.3, pose: "pull", ph: 0.4 }, { p: [7, FY0, -3], yaw: -0.6, pose: "cheer", ph: 0.2 }]} t={t} c={INCA} scale={1.9} />
    </G>
  );
};
const rMid = (i: number) => (rIn(i) + rOut(i)) / 2;
const LevelBall: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.plano - 0.02 || t >= T.terraza) return null;
  const k = popK(t, T.plano, 0.3), y = yT(STONE_RING) + 0.1, a = STONE_A + 0.5, hop = Math.abs(Math.sin((t - T.plano - 0.25) * 9)) * Math.exp(-(t - T.plano) * 3.2) * 0.9;
  return (
    <G sc={Math.max(0.001, k)}>
      <G p={P(a, rMid(STONE_RING), y + 0.18)} r={[0, a, 0]}>
        <Box s={[3.2, 0.3, 0.7]} c="#f2c230" /><Cyl rt={0.18} h={0.5} p={[0, 0.17, 0]} r={[0, 0, PI / 2]} c="#bfe8d0" o={{ opacity: 0.7, emissive: "#6fe09a", ei: 0.4 }} seg={10} cast={false} />
        <Sph rad={0.12} p={[0.04 * Math.sin(t * 7) * Math.exp(-(t - T.plano) * 1.5), 0.2, 0]} c="#ffffff" cast={false} ws={8} hs={6} />
      </G>
      <Sph rad={0.55} p={P(a + 0.16, rMid(STONE_RING), y + 0.55 + hop)} c="#e0262b" ws={12} hs={8} />
    </G>
  );
};

// ---------------------------------------------------------------- problema 2/solução 2: o morro do norte, as 2 nascentes, a vala seca, os canais
const Spring: React.FC<{ q: V3; t: number; ph: number }> = ({ q, t, ph }) => {
  const burst = t >= T.dos ? 1 + 0.5 * Math.exp(-(t - T.dos) * 2) : 1;
  const trick = useMemo(() => Array.from({ length: 6 }, (_, k): V3 => [q[0] + (k - 2.5) * 0.18, hillY(q[0], q[2] + k * 2.4) + 0.4, q[2] + k * 2.4]), [q]);
  return (
    <G p={[q[0], q[1], q[2]]}>
      <Sph rad={2.6} p={[0, 0.2, 0]} sc={[1, 0.55, 1]} c={STONE} ws={10} hs={6} o={{ flat: true }} />
      <Cyl rt={1.7} h={0.12} p={[0, 1.2, 0]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 0.9 }} seg={16} cast={false} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <Sph key={k} rad={0.42 * burst} p={[0.9 * Math.sin(k * 1.6 + ph), 1.4 + Math.abs(Math.sin(t * 3.2 + k * 1.4 + ph)) * 2.4, 0.9 * Math.cos(k * 1.6 + ph)]} c="#bfe8ff" o={{ emissive: "#5ac8ff", ei: 1.0 }} cast={false} ws={8} hs={6} />)}
      <G p={[-q[0], -q[1], -q[2]]}><Beads t={t + ph} pts={trick} n={3} speed={0.35} r={0.18} /></G>
    </G>
  );
};
const MP: V3 = [0, 0.45, -88];
const chSeg = (a: V3, b: V3, n: number) => Array.from({ length: n + 1 }, (_, k): V3 => { const x = lerp(a[0], b[0], k / n), z = lerp(a[2], b[2], k / n); return [x, Math.max(0.45, hillY(x, z) + 0.45), z]; });
const CH = [chSeg(SPR[0], MP, 8), chSeg(SPR[1], MP, 8), chSeg(MP, RIMN, 6)];
const Channels: React.FC<{ t: number }> = ({ t }) => {
  const cp = prog(t, T.canales, T.bordeEnd), fr = [prog(cp, 0, 0.55), prog(cp, 0, 0.55), prog(cp, 0.45, 1)];
  if (cp <= 0) return null;
  return (
    <G>
      {CH.map((pts, c) => <G key={c}>
        {pts.slice(0, -1).map((a, j) => (j / (pts.length - 1) < fr[c] ? <G key={j}><Pipe a={a} b={pts[j + 1]} rad={0.62} c={STONE} seg={8} /><Pipe a={[a[0], a[1] + 0.35, a[2]]} b={[pts[j + 1][0], pts[j + 1][1] + 0.35, pts[j + 1][2]]} rad={0.36} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 0.9 }} seg={8} cast={false} /></G> : null))}
        <Beads t={t} pts={pts.map((q): V3 => [q[0], q[1] + 0.8, q[2]])} n={c === 2 ? 9 : 6} speed={0.45} r={0.34} ph={c * 0.2} on={fr[c] > 0.98} />
      </G>)}
      {cp >= 1 ? <Pipe a={[RIMN[0], 0.6, RIMN[2]]} b={P(PI, rOut(0) + 0.3, yT(0) + 0.3)} rad={0.5} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} seg={8} cast={false} /> : null}
    </G>
  );
};
const Hill: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  const sk = t >= T.p2 + 0.15 && t < T.b2 ? popK(t, T.p2 + 0.15, 0.3) : 0;
  return (
    <G>
      <Spring q={SPR[0]} t={t} ph={0} /><Spring q={SPR[1]} t={t} ph={2} />
      <Box s={[7, 0.1, 56]} p={[SIGN_RIO[0], 0.08, -88]} c="#b89a6a" cast={false} />
      {Array.from({ length: 9 }, (_, k) => <Box key={k} s={[6.6, 0.12, 0.2]} p={[SIGN_RIO[0] + (rnd(k) - 0.5) * 0.6, 0.12, -112 + k * 6.2]} r={[0, (rnd(k + 3) - 0.5) * 0.5, 0]} c="#7a5f3a" cast={false} />)}
      {Array.from({ length: 12 }, (_, k) => <Sph key={k} rad={0.5} p={[SIGN_RIO[0] + (rnd(k + 20) - 0.5) * 6, 0.25, lerp(-112, -62, rnd(k + 30))]} c="#8f8272" ws={6} hs={4} o={{ flat: true }} cast={false} />)}
      {sk > 0 ? <G>
        <Cyl rt={0.28} h={6} p={[SIGN_RIO[0] - 3.4, 3, SIGN_RIO[2]]} c="#7a4a2a" seg={6} /><Cyl rt={0.28} h={6} p={[SIGN_RIO[0] + 3.4, 3, SIGN_RIO[2]]} c="#7a4a2a" seg={6} />
        <Bill p={[SIGN_RIO[0], 5.2, SIGN_RIO[2]]} cam={cam} yawOnly><G sc={sk}><SignBoard lines={[["RÍO", 150, "#1f6fb8"]]} bg="#cfeaff" border="#7a4a2a" s={[8.6, 4.4]} /></G></Bill>
      </G> : null}
      <XMark t={t} a={T.rio + 0.4} b={T.b2 - 0.02} p={[SIGN_RIO[0], 5.4, SIGN_RIO[2] + 0.6]} cam={cam} sc={1.5} />
    </G>
  );
};


// ---------------------------------------------------------------- o filtro em corte (diorama): o poço abre no fundo, 7 rochas grandes caem, a água sobe e some pelas frestas até a terra
const FZ3 = 10, FD = 6.4;
const FRK: [number, number, number, number][] = [[-1.5, -4.9, -6.3, 1.6], [2.2, -4.9, -6.3, 1.6], [-3.4, -4.9, -2.7, 1.55], [3.5, -4.9, -2.7, 1.5], [0.1, -4.8, -2.7, 1.7], [-1.7, -2.45, -2.9, 1.45], [1.9, -2.45, -2.9, 1.45]];
const ON_FC = (t: number) => t >= T.c3 - 0.02 && t < C6 + 0.05;
const FilterCut: React.FC<{ t: number }> = ({ t }) => {
  if (!ON_FC(t)) return null;
  const k = ease(t, T.c3 + 0.12, T.c3 + 0.85), top = -FD * k, hc = FD * (1 - k);
  const lvA = -FD + 0.3 + (FD - 1.5) * ease(t, T.grandesEnd - 0.4, T.cuela - 0.05), lvB = lerp(-1.2, -FD + 0.3, ease(t, T.cuela + 0.05, T.cuela + 0.95));
  const lv = t < T.cuela ? lvA : lvB, water = t >= T.grandesEnd - 0.4 && lv > -FD + 0.35;
  const wet = ease(t, T.cuela + 0.1, T.cuela + 1.7), side = (sx: number) => (
    <G key={sx}>
      <Box s={[9, FD, FZ3]} p={[sx * 9.5, -FD / 2, -FZ3 / 2]} c="#a3794a" cast={false} /><Box s={[9, 0.5, FZ3]} p={[sx * 9.5, -0.25, -FZ3 / 2]} c="#7fb544" cast={false} />
      <Box s={[5, 1.9, FZ3]} p={[sx * 11.5, 0.95, -FZ3 / 2]} c="#9a8f84" cast={false} /><Box s={[5, 0.4, FZ3]} p={[sx * 11.5, 2.1, -FZ3 / 2]} c="#7fb544" cast={false} />
    </G>);
  return (
    <G p={DIO}>
      {side(-1)}{side(1)}
      <Box s={[28, 4.6, FZ3]} p={[0, -FD - 2.3, -FZ3 / 2]} c="#c9a06a" cast={false} /><Box s={[28, 5.0, FZ3]} p={[0, -FD - 4.6 - 2.5, -FZ3 / 2]} c="#8f6a44" cast={false} />
      <Box s={[28, 3.0, 18]} p={[0, -FD - 9.6 - 1.5, -5]} c="#3a4350" cast={false} />
      <Box s={[10, FD, 0.2]} p={[0, -FD / 2, -FZ3]} c="#5e4228" cast={false} />
      {hc > 0.02 ? <G><Box s={[10, hc, FZ3]} p={[0, top - hc / 2, -FZ3 / 2]} c="#a3794a" cast={false} /><Box s={[10, 0.5, FZ3]} p={[0, top - 0.25, -FZ3 / 2]} c="#7fb544" cast={false} /></G> : null}
      {k > 0.02 && k < 0.98 ? Array.from({ length: 8 }, (_, q) => {
        const u = fract((t - T.c3) * 1.5 + q / 8);
        return <Box key={q} s={[0.8, 0.8, 0.8]} p={[lerp(-4.2, 4.2, rnd(q + 6)), top + 0.3 + Math.sin(u * PI) * 5, -1.2 - rnd(q + 2) * 4]} r={[u * 5, u * 3, 0]} c="#a3794a" cast={false} />;
      }) : null}
      {FRK.map(([x, y, z, r], q) => {
        const a = ROCK_T(q), u = prog(t, a, a + ROCK_FALL); if (t < a) return null;
        const yy = lerp(7 + q * 0.4, y, u * u);
        return <Sph key={q} rad={r} p={[x, yy, z]} sc={[1, 0.86, 1]} r={[q * 0.7 + (1 - u) * 5, q * 1.9, 0]} c={q % 2 ? "#8c8f96" : "#a8abb3"} ws={9} hs={7} o={{ flat: true }} cast={false} />;
      })}
      {FRK.map(([x, y, , r], q) => { const a = ROCK_T(q) + ROCK_FALL; return t >= a && t < a + 0.55 ? <Dust key={q} t={t} t0={a} p={[x, y - r * 0.6, -0.4]} n={4} spread={2.4} rise={1.6} size={0.9} on={1 - ease(t, a + 0.1, a + 0.55)} c="#e0cfa8" /> : null; })}
      {water ? <Box s={[9.8, Math.max(0.01, lv + FD), FZ3 - 0.4]} p={[0, (lv - FD) / 2, -FZ3 / 2]} c="#4fb8f2" o={{ opacity: 0.58, emissive: "#1f8fe0", ei: 0.5, depthWrite: false }} cast={false} recv={false} /> : null}
      {t >= T.grandesEnd - 0.4 && t < T.cuela ? Array.from({ length: 7 }, (_, q) => {
        const u = fract((t - T.grandesEnd) * 1.8 + q / 7);
        return <Sph key={q} rad={0.4} p={[lerp(-1.6, 1.6, rnd(q + 11)), lerp(8, lvA, u * u), -0.8]} c="#5ac8ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} cast={false} ws={8} hs={6} />;
      }) : null}
      {wet > 0.01 ? <Box s={[10 + 5 * wet, 11 * wet, 0.08]} p={[0, -FD - (11 * wet) / 2, 0.06]} c="#1f5fb5" o={{ opacity: 0.6, emissive: "#1f5fb5", ei: 0.3 }} cast={false} recv={false} /> : null}
      {t >= T.cuela ? Array.from({ length: 16 }, (_, q) => {
        const u = fract((t - T.cuela) * 0.8 + rnd(q + 40)), x = lerp(-4.4, 4.4, (q * 0.618) % 1), yTop = Math.min(lv + 0.4, -1), sink = ease(u, 0.55, 1);
        return <Sph key={q} rad={0.34 * (1 - sink * 0.7)} p={[x, lerp(yTop, -FD - 8, u), 0.12 - (u > 0.5 ? 0.0 : 0.8)]} c="#7fd6ff" o={{ emissive: "#1f8fe0", ei: 1.0 }} cast={false} ws={8} hs={6} />;
      }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- o giro: laboratório (hipótese), engenheiros, cerimônias
export const LAB = P(PI / 2, RT + 6, 0), ENG_A = [0.55, 0.78, 1.0] as const, CER = P(0, RT + 5, 0);
const Lab: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  if (t < T.fama - 0.02 || t >= T.paraellos - 0.02) return null;
  const k = popK(t, T.fama, 0.35), tip = ease(t, T.noenc + 0.35, T.noenc + 0.9) * 1.45, hip = popK(t, T.hip, 0.3);
  return (
    <G>
      <Bill p={LAB} cam={cam} yawOnly>
        <G sc={Math.max(0.001, k) * 0.6} r={[0, 0, -tip]}>
          <Cyl rt={0.3} h={15} p={[-5.4, 7.5, -0.2]} c="#7a4a2a" seg={6} /><Cyl rt={0.3} h={15} p={[5.4, 7.5, -0.2]} c="#7a4a2a" seg={6} />
          <G p={[0, 13, 0]}><SignBoard lines={[["SE DICE:", 62, "#6b3a10"], ["LABORATORIO", 60, "#2b1a08"]]} bg="#f6e7c0" border="#7a4a2a" s={[13, 6.5]} />
            {hip > 0 ? <G p={[3.2, -2.2, 0.3]} r={[0, 0, -0.17]} sc={Math.max(0.001, hip) * (1 + 0.8 * (1 - hip))}><SignBoard lines={[["HIPÓTESIS", 58, "#c8352a"]]} bg="#fff4e0" border="#c8352a" s={[7.4, 2.6]} px={[400, 150]} /></G> : null}
          </G>
        </G>
      </Bill>
      <XMark t={t} a={T.noenc + 0.15} b={T.noenc + 1.5} p={[LAB[0], 17, LAB[2]]} cam={cam} sc={1.6} />
      {([[-2, -9.5, "#cfeedd", "#7aff9a", "#3fd060", 0], [-2, 9.5, "#cfe6ff", "#5ac8ff", "#1f8fe0", 0.55], [0, -16, "#ffe6cf", "#ffa84a", "#e07010", 1.1]] as [number, number, string, string, string, number][]).map(([dx, dz, gl, lq, em, d], f) => {
        const kf = popK(t, T.fama + d, 0.35), bob = Math.abs(Math.sin(t * 5 + f * 2)) * 0.25;
        return <G key={f} p={[LAB[0] + dx, bob, LAB[2] + dz]} sc={Math.max(0.001, kf) * 1.7}>
          <Cone rad={1.9} h={3.4} seg={14} p={[0, 1.7, 0]} c={gl} o={{ opacity: 0.55, emissive: lq, ei: 0.25, depthWrite: false }} /><Cyl rt={0.55} h={1.4} p={[0, 4.0, 0]} c={gl} o={{ opacity: 0.55, depthWrite: false }} seg={10} />
          <Cone rad={1.45} h={2.1} seg={14} p={[0, 1.15, 0]} c={lq} o={{ emissive: em, ei: 0.8 }} cast={false} />
          {[0, 1, 2, 3].map((q) => <Sph key={q} rad={0.28} p={[0.5 * Math.sin(q * 2), 2.4 + fract(t * 0.9 + q / 4 + f * 0.3) * 2.4, 0.4 * Math.cos(q * 2)]} c="#ffffff" o={{ emissive: lq, ei: 0.9 }} cast={false} ws={6} hs={4} />)}
        </G>;
      })}
    </G>
  );
};
const Engineers: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.equipo - 0.02 || t >= T.noenc + 0.5) return null;
  const poses: PoseName[] = ["point", "read", "chisel"], k = popK(t, T.equipo, 0.3);
  const list = ENG_A.map((a, q) => ({ p: P(a, RT + 1.6, 0.02), yaw: a + PI, pose: poses[q], ph: q * 0.8 }));
  const A = P(ENG_A[0], RT + 1.6, 0.18), B = P(ENG_A[1], RT + 1.6, 0.18), len = Math.hypot(B[0] - A[0], B[2] - A[2]), ext = ease(t, T.equipo + 0.3, T.equipo + 1.3);
  return (
    <G sc={Math.max(0.001, k)}>
      <Crowd list={list} t={t} c={COSTUMES.worker} scale={1.9} />
      {ENG_A.map((a, q) => { const b = P(a, RT + 4, 0); return (
        <G key={q} p={b} r={[0, a + PI, 0]}>
          {[0, 1, 2].map((l) => <Cyl key={l} rt={0.07} h={2.8} p={[Math.sin(l * 2.1) * 0.6, 1.4, Math.cos(l * 2.1) * 0.6]} r={[Math.cos(l * 2.1) * 0.2, 0, -Math.sin(l * 2.1) * 0.2]} c="#5a4a3a" seg={5} cast={false} />)}
          <Box s={[0.6, 0.5, 0.6]} p={[0, 2.9, 0]} c="#f2c230" cast={false} /><Cyl rt={0.14} h={0.7} p={[0, 3.35, 0.15]} r={[PI / 2, 0, 0]} c="#2a2a2e" seg={8} cast={false} />
        </G>); })}
      <Box s={[0.25, 0.1, Math.max(0.01, len * ext)]} p={[(A[0] + B[0]) / 2 * 1, 0.2, (A[2] + B[2]) / 2]} r={[0, Math.atan2(B[0] - A[0], B[2] - A[2]), 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.4 }} cast={false} />
    </G>
  );
};
// a cerimônia: ninguém no eixo da câmera (a pedra com o sol não pode ficar atrás de uma figura)
const Ceremony: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => {
  if (t < T.paraellos - 0.02 || t >= T.manda - 0.02) return null;
  const sun = popK(t, T.paraellos + 0.2, 0.5), arrive = ease(t, T.paraellos + 0.25, T.lugar + 0.5);
  const list = [0, 1, 2, 3, 4, 5, 6].map((q) => { const a = [-0.07, 0.07, -0.15, 0.15, -0.24, 0.24, 0.33][q], rad = lerp(RT + 20, RT + 8.5, arrive) + (q % 2) * 1.6; return { p: P(a - 0.0, rad, 0.02), yaw: PI + a + (CER[0] > 0 ? 0 : 0), pose: (arrive < 0.95 ? "walk" : q % 2 ? "cheer" : "present") as PoseName, ph: q * 0.5 }; });
  return (
    <G>
      <G p={CER}><Box s={[2.8, 3.6, 1.8]} p={[0, 1.8, 0]} c="#9a9ea4" o={{ flat: true }} /><Box s={[3.1, 0.4, 2.1]} p={[0, 3.8, 0]} c="#aeb2b8" />
        <Bill p={[0, 2.2, 1.05]} cam={cam}><Cyl rt={0.85} h={0.12} r={[PI / 2, 0, 0]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} seg={16} cast={false} />
          {Array.from({ length: 8 }, (_, q) => <Box key={q} s={[0.14, 0.5, 0.1]} p={[Math.cos(q * PI / 4) * 1.25, Math.sin(q * PI / 4) * 1.25, 0]} r={[0, 0, q * PI / 4 - PI / 2]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />)}</Bill></G>
      <Crowd list={list} t={t} c={INCA} scale={1.9} />
      <G p={[CER[0] + 6, 46, CER[2] - 28]} sc={Math.max(0.001, sun)}>
        <Sph rad={6.5} c="#fff0a0" o={{ emissive: "#ffd400", ei: 1.0 }} cast={false} ws={16} hs={12} />
        {Array.from({ length: 12 }, (_, q) => { const a = (q / 12) * PI * 2 + t * 0.4; return <Box key={q} s={[1.0, 5.5, 0.6]} p={[Math.cos(a) * 11, Math.sin(a) * 11, 0]} r={[0, 0, a - PI / 2]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} />; })}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- tudo
export const World: React.FC<{ t: number; cam: V3 }> = ({ t, cam }) => (
  <>
    <Sky top="#3f8ff0" mid="#9ccff7" low="#fff1d8" />
    <Clouds t={t} n={5} y={50} />
    <Peaks /><Land /><Tufts />
    <Bowl t={t} /><Pits t={t} />
    <Hill t={t} cam={cam} /><Channels t={t} />
    <Shovel t={t} cam={cam} /><Excavator t={t} cam={cam} /><Figures t={t} />
    <AltRuler t={t} /><DepthRuler t={t} /><Geo t={t} /><Slide t={t} cam={cam} /><Fill t={t} /><LevelBall t={t} />
    <FilterCut t={t} /><Lab t={t} cam={cam} /><Engineers t={t} /><Ceremony t={t} cam={cam} />
    <XMark t={t} a={T.olla + 0.55} b={T.b3 - 0.02} p={[0, FLOOR + 6, 0]} cam={cam} sc={1.6} />
    <Check t={t} a={T.inunda + 0.1} b={T.drenaje} p={[0, FLOOR + 6.5, 0]} cam={cam} sc={1.3} />
  </>
);
