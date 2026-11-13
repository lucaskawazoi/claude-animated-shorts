// Mundo do E10: o Pacífico como tabuleiro de brinquedo, visto de cima com o norte para cima da tela (z negativo = norte).
// Filipinas (x≈-24, z -12..20), Japão (z -38..-50), costa da China (x<-45), México (x 37..67) com Acapulco e a mina de prata,
// Potosí ao sul (z≈34). Rota de ida pelo sul (alísios para o oeste) e o tornaviaje pelo norte (ventos do oeste + Kuroshio).
// Pré-crítica de 13/11 (defeitos do E6): cada verbo narrado acontece de perto — o vento empurra o barco para trás, o barco
// sobe a rota empurrado por setas e corrente, sol e lua correm os meses, o machado quica no molave, a tempestade bate e o casco
// aguenta, o barril vazio, as tinajas enchem na chuva, o mercador empurra o caixote, a mina, a cunhagem com a balança, o alvo,
// a abordagem com a bandeira trocada, o último galeão soltando as velas. Mar aberto longe do mapa (z -250), sem terra à vista.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Palms, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { AXE, CUTS, JARS, MINT, PARCELS, T, X } from "./cues";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
export const built = (t: number) => t < X.cebu;
const SEA = "#2f86c8", LAND = "#7fb85a", SAND = "#ecd9a0", WOOD = "#7a4a2a", MOLAVE = "#5a3420", SILVER = "#d8dde4";
/** ponto local de um navio (frente = +x local) para o mundo */
/** entra crescendo com sobra (estilo jogo) */
const popIn = (t: number, a: number, d = 0.3) => { const u = prog(t, a, a + d); return u <= 0 ? 0 : outBack(u); };
export const toWorld = (p: V3, yaw: number, l: V3, sc = 1): V3 => [p[0] + sc * (l[0] * Math.cos(yaw) + l[2] * Math.sin(yaw)), p[1] + sc * l[1], p[2] + sc * (-l[0] * Math.sin(yaw) + l[2] * Math.cos(yaw))];

// ---------------------------------------------------------------- o mapa
/** espuma de ondas espalhada: sem textura no mar a régua não vê a câmera se mexer */
const Whitecaps: React.FC<{ x: [number, number]; z: [number, number]; n: number; seed?: number }> = ({ x, z, n, seed = 0 }) => {
  const m = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 0.25), mat("#e8f6ff", { emissive: "#bfe6ff", ei: 0.3 }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const k = i * 3 + seed; o.position.set(lerp(x[0], x[1], rnd(k + 1)), 0.05, lerp(z[0], z[1], rnd(k + 2))); o.rotation.y = (rnd(k + 3) - 0.5) * 0.6; o.scale.setScalar(lerp(0.6, 2.2, rnd(i + 7 + seed))); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.castShadow = false; im.receiveShadow = false; return im;
  }, [x[0], x[1], z[0], z[1], n, seed]);
  return <primitive object={m} />;
};
const Isle: React.FC<{ p: V3; r: [number, number]; rot?: number; c?: string }> = ({ p, r, rot = 0, c = LAND }) => (
  <G p={p} r={[0, rot, 0]}><Sph rad={1} sc={[r[0] + 0.6, 0.5, r[1] + 0.6]} c={SAND} ws={20} hs={8} /><Sph rad={1} p={[0, 0.12, 0]} sc={[r[0], 0.7, r[1]]} c={c} ws={20} hs={8} /></G>
);
const Map: React.FC = () => (
  <G>
    <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(SEA, { rough: 0.35 })}><planeGeometry args={[900, 900]} /></mesh>
    <Whitecaps x={[-90, 110]} z={[-90, 70]} n={1400} />
    {/* China */}
    <Box s={[34, 1.2, 140]} p={[-64, 0.1, -10]} c="#a9c27a" /><Box s={[1, 1.25, 140]} p={[-47, 0.1, -10]} c={SAND} />
    {/* Filipinas */}
    <Isle p={[-26, 0, -2]} r={[5, 9]} rot={0.2} /><Isle p={[-20.5, 0, 9]} r={[2.2, 3.4]} rot={-0.3} /><Isle p={[-22, 0, 16]} r={[5, 3.4]} />
    <Isle p={[-17, 0, 4]} r={[2.4, 2.6]} />
    {/* Japão */}
    <Isle p={[-18, 0, -38]} r={[2, 5]} rot={0.6} /><Isle p={[-12, 0, -44]} r={[2.4, 6]} rot={1.0} /><Isle p={[-6, 0, -50]} r={[2, 4]} rot={1.2} />
    {/* América */}
    <Box s={[34, 1.2, 100]} p={[54, 0.1, 0]} c="#c9b27a" /><Box s={[1, 1.25, 100]} p={[37, 0.1, 0]} c={SAND} />
    <Cone rad={7} h={11} seg={7} p={[47, 5.5, 2]} c="#9a7a5a" o={{ flat: true }} /><Cone rad={6} h={12} seg={7} p={[45, 6, 36]} c="#a5523a" o={{ flat: true }} />
    {[[52, -20, 9, 8], [56, 20, 8, 9], [60, -36, 7, 7]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c="#a89060" o={{ flat: true }} />)}
  </G>
);
/** rota como trilha de pontos que se desenha */
const pathPts = (pts: V3[], n: number) => {
  const segs = pts.slice(1).map((b, i) => ({ a: pts[i], b, l: Math.hypot(b[0] - pts[i][0], b[2] - pts[i][2]) })), L = segs.reduce((s, q) => s + q.l, 0);
  return Array.from({ length: n }, (_, k) => { let d = (k / (n - 1)) * L; for (const q of segs) { if (d <= q.l) { const u = d / q.l; return [lerp(q.a[0], q.b[0], u), 0.5, lerp(q.a[2], q.b[2], u)] as V3; } d -= q.l; } return pts[pts.length - 1]; });
};
export const OUT: V3[] = [[37, 0, 12], [20, 0, 22], [0, 0, 23], [-17, 0, 12]];
export const TORNA: V3[] = [[-19, 0, 8], [-15, 0, -10], [-10, 0, -32], [0, 0, -45], [20, 0, -42], [32, 0, -16], [37, 0, 8]];
const KURO: V3[] = [[-17, 0, -4], [-14, 0, -22], [-7, 0, -38], [4, 0, -49], [22, 0, -47], [34, 0, -30]];
const TQ = pathPts(TORNA, 200), KQ = pathPts(KURO, 200);
const alongQ = (q: V3[], u: number): { p: V3; yaw: number } => {
  const i = Math.min(q.length - 2, Math.floor(clamp(u) * (q.length - 1))), a = q[i], b = q[i + 1];
  return { p: [a[0], 0, a[2]], yaw: -Math.atan2(b[2] - a[2], b[0] - a[0]) };
};
export const along = (pts: V3[], u: number) => alongQ(pathPts(pts, 200), u);
/** tornaviaje: sobe ao norte até a altura do Japão («Japón» ≈ 36% da rota), vira a leste com o vento e a corrente, chega a Acapulco */
const pw = (t: number, k: [number, number][]) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ease(t, k[i - 1][0], k[i][0])); return k[k.length - 1][1]; };
export const routeU = (t: number) => pw(t, [[C2, 0], [T.norte, 0.05], [T.japon + 0.45, 0.36], [T.vientos + 0.2, 0.41], [T.corriente + 0.1, 0.58], [C3 - 0.4, 0.88], [C3 + 0.6, 1]]);
export const shipOnRoute = (t: number) => alongQ(TQ, routeU(t));
/** a volta inteira no mapa do «Esta es la ruta…» (ritmo, 13/11): chega a Acapulco, desce pelo sul de volta a Manila com os
 *  alísios e já começa a subir de novo — o circuito fechando, em vez do mapa parado */
const OQ = pathPts(OUT, 200);
const loopPos = (t: number): V3 => t < C3 + 0.62 ? shipOnRoute(t).p : t < X.p2 - 0.75 ? alongQ(OQ, ease(t, C3 + 0.66, X.p2 - 0.75)).p : alongQ(TQ, 0.2 * ease(t, X.p2 - 0.75, X.p2 + 0.4)).p;
export const loopShip = (t: number) => { const a = loopPos(t), b = loopPos(t + 0.06), d = Math.hypot(b[0] - a[0], b[2] - a[2]);
  return { p: a, yaw: d > 1e-4 ? -Math.atan2(b[2] - a[2], b[0] - a[0]) : shipOnRoute(C3 + 0.6).yaw }; };
const Route: React.FC<{ pts: V3[]; u: number; c: string; t?: number; pulse?: number; w?: number }> = ({ pts, u, c, t = 0, pulse = 0, w = 1.1 }) => {
  const q = useMemo(() => pathPts(pts, 60), [pts]); if (u <= 0.01) return null;
  return <G>{q.map((p, i) => (i / 59 <= u ? <Box key={i} s={[w, 0.2, w]} p={p} sc={pulse ? [1, 1 + pulse * Math.max(0, Math.sin(i * 0.45 - t * 9)), 1] : undefined} c={c} o={{ emissive: c, ei: 0.6 }} cast={false} /> : null))}</G>;
};
/** seta (frente = +x local) */
const Arrow: React.FC<{ c: string; s?: number }> = ({ c, s = 1 }) => (
  <G sc={s}><Box s={[5, 0.45, 0.9]} c={c} o={{ emissive: c, ei: 0.5 }} cast={false} /><Cone rad={1.2} h={2.1} seg={3} p={[3.3, 0, 0]} r={[0, 0, -PI / 2]} c={c} o={{ emissive: c, ei: 0.5 }} cast={false} /></G>
);
/** faixa de setas de vento correndo na direção dir (−1 = para o oeste) */
const Arrows: React.FC<{ t: number; z: number; dir: 1 | -1; on: number; c: string; y?: number; k?: number; x0: number; x1: number; n?: number; v?: number; dz?: number; dy?: number }> = ({ t, z, dir, on, c, y = 2, k = 1, x0, x1, n = 6, v = 0.25, dz = 2, dy = 1.2 }) => on <= 0.01 ? null : (
  <G>{Array.from({ length: n }, (_, i) => { const u = fract(i / n + dir * t * v), x = lerp(x0, x1, u), g = Math.sin(clamp(u) * PI) ** 0.4; return <G key={i} p={[x, y + (i % 3) * dy, z + ((i % 2) - 0.5) * dz]} r={[0, dir > 0 ? 0 : PI, 0]} sc={Math.max(0.001, on * k * g)}><Arrow c={c} /></G>; })}</G>
);
/** setas que alcançam o barco por trás e o empurram (vento a favor) */
const PushArrows: React.FC<{ t: number; p: V3; yaw: number; on: number; c: string; k?: number }> = ({ t, p, yaw, on, c, k = 1 }) => on <= 0.01 ? null : (
  <G>{Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.1 + i / 6), back = lerp(17, 5, u), side = ((i % 3) - 1) * 3.4, q = toWorld(p, yaw, [-back, 3 + (i % 2) * 2, side]);
    return <G key={i} p={q} r={[0, yaw, 0]} sc={Math.max(0.001, on * k * Math.sin(u * PI))}><Arrow c={c} /></G>; })}</G>
);
/** corrente Kuroshio: traços que correm ao longo do caminho (para leste) */
const Kuroshio: React.FC<{ t: number; on: number }> = ({ t, on }) => on <= 0.01 ? null : (
  <G>{Array.from({ length: 30 }, (_, i) => { const a = alongQ(KQ, fract(i / 30 + t * 0.11)); return <G key={i} p={[a.p[0], 0.12, a.p[2]]} r={[0, a.yaw, 0]} sc={on}><Box s={[3.2, 0.12, 1.2]} c="#7fe6ff" o={{ emissive: "#4ac8ff", ei: 0.7 }} cast={false} /><Cone rad={1.0} h={1.5} seg={3} p={[2.3, 0, 0]} r={[0, 0, -PI / 2]} c="#7fe6ff" o={{ emissive: "#4ac8ff", ei: 0.7 }} cast={false} /></G>; })}</G>
);

// ---------------------------------------------------------------- galeão (frente = +x local)
const HangJar: React.FC<{ p: V3; t: number; k: number; w: number; i: number }> = ({ p, t, k, w, i }) => k <= 0.01 ? null : (
  <G p={p} r={[0.14 * Math.sin(t * 2.3 + i), 0, 0.1 * Math.sin(t * 1.7 + i * 2)]}>
    <Box s={[0.035, 0.75 * k, 0.035]} p={[0, -0.375 * k, 0]} c="#3a2a1a" cast={false} />
    <G p={[0, -0.75 * k, 0]}>
      <Cyl rt={0.27} rb={0.3} h={0.16} p={[0, -0.08, 0]} c="#9a5030" seg={10} />
      <Sph rad={0.38} p={[0, -0.52, 0]} sc={[1, 1.15, 1]} c="#b0603a" ws={12} hs={8} />
      <Cyl rt={0.23} h={0.02} p={[0, 0.005, 0]} c="#24140a" seg={12} cast={false} />
      {w > 0.02 ? <Cyl rt={0.225 * Math.min(1, 0.3 + w * 0.7)} h={0.03} p={[0, 0.02 + 0.02 * w, 0]} c="#3aa8ff" o={{ emissive: "#2a90ff", ei: 0.7 }} seg={12} cast={false} /> : null}
      {w > 0.96 ? [0, 1].map((d) => { const u = fract(t * 1.6 + d * 0.5 + i * 0.13); return <Sph key={d} rad={0.06} p={[0.24, -u * 1.6, 0]} c="#7fd0ff" o={{ emissive: "#4ab0ff", ei: 0.6 }} cast={false} ws={6} hs={4} />; }) : null}
    </G>
  </G>
);
type GP = { p: V3; yaw: number; t: number; sc?: number; flag?: number; cut?: boolean; jars?: number; hang?: number; fill?: number; enemy?: boolean; tilt?: number; roll?: number; bob?: number; wind?: number; sail?: number; cargo?: number; brit?: number; tally?: number };
export const Galleon: React.FC<GP> = ({ p, yaw, t, sc = 1, flag = 1, cut = false, jars = 0, hang = 0, fill = 0, enemy = false, tilt = 0, roll = 0, bob = 1, wind = 0, sail = 1, cargo = 0, brit = 0, tally = 0 }) => {
  const H = enemy ? "#3a3a44" : "#8a5a32", SAIL = "#f6efe0", bx = 0.06 + 0.32 * wind, bt = 0.06 + 0.5 * Math.abs(wind);
  let jar = 0;
  return (
    <G p={[p[0], p[1] + 0.12 * bob * Math.sin(t * 1.8 + p[0]), p[2]]} r={[roll + 0.03 * Math.sin(t * 1.3), yaw, tilt + 0.04 * Math.sin(t * 1.6)]} sc={sc}>
      <Box s={[8, 1.6, 2.6]} p={[0, 0.8, 0]} c={H} vis={!cut} /><Box s={[8, 1.6, 0.25]} p={[0, 0.8, -1.2]} c={H} vis={cut} /><Box s={[8, 0.3, 2.6]} p={[0, 0.15, 0]} c={H} vis={cut} />
      {cut ? <G><Box s={[0.25, 1.6, 2.6]} p={[-3.9, 0.8, 0]} c={H} /><Box s={[0.25, 1.6, 2.6]} p={[3.9, 0.8, 0]} c={H} /><Box s={[8, 0.12, 0.3]} p={[0, 1.56, 1.15]} c="#5a3a20" /></G> : null}
      <Cone rad={1.35} h={2.4} seg={4} p={[5.1, 0.9, 0]} r={[0, 0, -PI / 2]} c={H} />
      <Box s={[2.2, 1.8, 2.7]} p={[-3.2, 2.4, 0]} c={enemy ? "#2a2a33" : "#6b4423"} /><Box s={[1.6, 1.0, 2.6]} p={[3.4, 2.0, 0]} c={enemy ? "#2a2a33" : "#6b4423"} />
      <Box s={[8.2, 0.12, 2.7]} p={[0, 1.62, 0]} c="#c08a4a" cast={false} />
      {[-2, 0, 2].map((x) => [1, -1].map((s) => <Box key={x + "" + s} s={[0.35, 0.3, 0.05]} p={[x, 1.0, s * 1.32]} c="#1c1410" cast={false} vis={!cut || s < 0} />))}
      {[[-1.6, 5.2], [0.8, 6.2], [3.0, 4.6]].map(([x, h], i) => (
        <G key={i} p={[x, 1.6, 0]}>
          <Cyl rt={0.1} h={h} p={[0, h / 2, 0]} c="#5a3a20" seg={6} />
          {[0.45, 0.78].map((f, j) => {
            const SH = 1.6 - j * 0.3, W = 3.0 - j * 0.8, YH = 1.7 - j * 0.4, sh = SH * Math.max(0.1, sail), cy = h * f + 0.8 - sh / 2, front = bx + bt / 2 + 0.02;
            return (
              <G key={j}>
                <Box s={[0.12, 0.12, YH * 2]} p={[0, h * f + 0.9, 0]} c="#5a3a20" />
                <Box s={[bt, sh, W]} p={[bx, cy, 0]} c={SAIL} />
                {/* os meses riscados na vela do traquete: ||||, o risco do 5 e o 6 */}
                {i === 2 && j === 0 && tally > 0.01 ? <G p={[front + 0.02, cy, 0]}>{[0, 1, 2, 3, 4, 5].map((k) => { const u = clamp((tally - k) * 3); if (u <= 0.01) return null;
                  return k === 4 ? <Box key={k} s={[0.03, 0.16, 1.45 * u]} r={[0.55, 0, 0]} p={[0, 0, -0.28]} c="#2a1a10" cast={false} /> : <Box key={k} s={[0.03, 1.0 * u, 0.16]} p={[0, 0, k === 5 ? 0.9 : -0.82 + k * 0.36]} c="#2a1a10" cast={false} />; })}</G> : null}
                {/* tinajas penduradas nas vergas */}
                {hang > 0.01 ? [1, -1].map((s) => { const n = jar++; return <HangJar key={s} p={[0, h * f + 0.86, s * (YH - 0.12)]} t={t} i={n} k={clamp(hang * 1.8 - n * 0.07)} w={clamp(fill * 1.7 - n * 0.06)} />; }) : null}
              </G>
            );
          })}
        </G>
      ))}
      {/* bandeira na popa (Espanha baixa, a inglesa sobe) */}
      <G p={[-4.2, 3.6, 0]}><Cyl rt={0.05} h={2.2} p={[0, 0.3, 0]} c="#3a2a1a" seg={5} />
        {flag > 0.02 ? <G p={[0, 0.85 - (1 - flag) * 1.4, 0.6]}><Box s={[0.04, 0.8, 1.2]} c={enemy ? "#c8352a" : "#f6efe0"} cast={false} />{!enemy ? <G><Box s={[0.05, 0.12, 1.2]} r={[0.5, 0, 0]} c="#c8352a" cast={false} /><Box s={[0.05, 0.12, 1.2]} r={[-0.5, 0, 0]} c="#c8352a" cast={false} /></G> : null}</G> : null}
        {brit > 0.02 ? <G p={[0.02, -0.55 + brit * 1.4, 0.6]}><Box s={[0.04, 0.8, 1.2]} c="#c8352a" cast={false} /><Box s={[0.05, 0.36, 0.5]} p={[0, 0.2, -0.33]} c="#2a3f8a" cast={false} /></G> : null}
      </G>
      {/* carga no convés: baús de prata abertos e fardos de seda */}
      {cargo > 0.01 ? [[-1.0, 0.55, 0], [1.9, -0.6, 0], [2.3, 0.6, 1], [-0.2, -0.7, 2], [0.5, 0.65, 3], [-2.0, -0.5, 1]].map(([x, z, k], i) => { const u = clamp(cargo * 1.7 - i * 0.13); if (u <= 0.01) return null;
        return k === 0 || k === 1 ? <G key={i} p={[x, 1.68 + (1 - u) * 2.5, z]}><Box s={[0.8, 0.5, 0.6]} p={[0, 0.25, 0]} c="#6b3a1a" /><Box s={[0.72, 0.1, 0.52]} p={[0, 0.52, 0]} c={SILVER} o={{ metal: 0.7, rough: 0.3, emissive: "#ffffff", ei: 0.25 }} /><Box s={[0.8, 0.4, 0.06]} p={[0, 0.7, -0.33]} r={[-0.5, 0, 0]} c="#6b3a1a" /></G>
          : <Cyl key={i} rt={0.28} h={0.9} p={[x, 1.96 + (1 - u) * 2.5, z]} r={[PI / 2, 0, 0]} c={["#c8352a", "#e8b030", "#2fa85a", "#7a3ac8"][i % 4]} seg={10} />; }) : null}
      {/* porão cortado: três fileiras de tinajas debaixo do convés, que caem uma a uma (jars = progresso linear) e assentam com um quique */}
      {cut ? Array.from({ length: 30 }, (_, i) => { const col = i % 10, row = Math.floor(i / 10), n = col * 3 + row, u = n < 9 ? 2 : (jars - ((n - 9) / 21) * 0.92) / 0.1; if (u <= 0) return null;
        const f = Math.min(1, u), k = outBack(Math.min(1, u * 2.2)), sq = u > 1 && u < 1.6 ? 0.22 * Math.sin(((u - 1) / 0.6) * PI) : 0;
        return <G key={i} p={[-3.4 + col * 0.75, 0.3 + 0.35 * (1 - f * f), -0.75 + row * 0.7]} sc={[k * 0.82 * (1 + sq * 0.5), k * 0.82 * (1 - sq), k * 0.82 * (1 + sq * 0.5)]}><Sph rad={0.38} p={[0, 0.48, 0]} sc={[1, 1.3, 1]} c={i % 3 ? "#c0703a" : "#a85a30"} ws={10} hs={8} /><Cyl rt={0.2} h={0.12} p={[0, 0.98, 0]} c="#6b3a20" seg={8} /></G>; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- Cebu 1565: o vento empurra o barco de volta
const CEBU_Z = 10;
export const cebuShip = (t: number) => {
  const arrive = ease(t, X.cebu, C1 - 0.2), turn = ease(t, T.ningun, T.ningun + 1.0), go = ease(t, T.ningun + 0.9, T.viento), back = ease(t, T.viento, T.contra + 0.6);
  const puff = 0.25 + 0.75 * ease(t, X.cebu + 0.15, X.cebu + 0.65), wind = lerp(lerp(puff, 0, turn), -1, ease(t, T.viento - 0.2, T.viento + 0.3));
  return { x: -5 - 6 * arrive + 3 * go - 5 * back, yaw: PI * (1 - turn), wind, tilt: 0.1 * back * Math.sin(t * 5) - 0.08 * ease(t, T.viento, T.viento + 0.4) * (1 - back * 0.5) };
};

/** «No hay motores»: uma máquina a vapor de brinquedo surge no convés, fumega, leva o ✖ (HUD) e é esmagada */
const Engine: React.FC<{ t: number; p: V3; yaw: number }> = ({ t, p, yaw }) => {
  const k = popIn(t, T.nohay - 0.05, 0.3), out = ease(t, T.nohay + 0.8, T.nohay + 1.0); if (k <= 0.01 || out >= 0.99) return null;
  return (
    <G p={p} r={[0, yaw + 0.25 * Math.sin(t * 17) * prog(t, T.nohay + 0.3, T.nohay + 0.8), 0]} sc={[1.6 * k * (1 + 0.5 * out), Math.max(0.001, 1.6 * k * (1 - out)), 1.6 * k * (1 + 0.5 * out)]}>
      <Box s={[1.3, 0.85, 0.95]} p={[0, 0.42, 0]} c="#3a3a44" /><Box s={[1.36, 0.12, 1.0]} p={[0, 0.9, 0]} c="#c8a040" o={{ metal: 0.5, rough: 0.35 }} />
      <Cyl rt={0.17} h={1.3} p={[-0.32, 1.5, 0]} c="#2a2a2a" seg={10} /><Cyl rt={0.24} h={0.14} p={[-0.32, 2.16, 0]} c="#c8a040" seg={10} />
      <G p={[0.38, 0.5, -0.52]} r={[PI / 2, 0, 0]}><G r={[0, t * 9, 0]}><Cyl rt={0.4} h={0.12} c="#c8a040" seg={8} o={{ metal: 0.5, rough: 0.35, flat: true }} /><Box s={[0.7, 0.14, 0.1]} c="#7a5a20" /></G></G>
      {[0, 1, 2, 3].map((i) => { const u = fract(t * 1.6 + i / 4); return <Sph key={i} rad={0.22 + u * 0.35} p={[-0.32 + u * 0.6, 2.3 + u * 1.5, 0]} c="#6a6a72" cast={false} ws={8} hs={6} o={{ rough: 1 }} />; })}
    </G>
  );
};
/** a ideia do frade no «Con ingenio»: lâmpada que acende sobre a cabeça, raios girando */
const Bulb: React.FC<{ t: number; p: V3 }> = ({ t, p }) => {
  const k = popIn(t, T.c1 - 0.04, 0.32); if (k <= 0.01) return null;
  const glow = 1.2 + 0.5 * Math.sin(t * 16);
  return (
    <G p={p} sc={0.72 * k}>
      <Sph rad={0.3} p={[0, 0.34, 0]} c="#fff6a0" o={{ emissive: "#ffd84a", ei: glow }} cast={false} /><Cyl rt={0.14} h={0.18} p={[0, 0.02, 0]} c="#9aa3ad" seg={10} cast={false} />
      <G p={[0, 0.34, 0]} r={[0, 0, t * 1.5]}>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * PI * 2; return <Box key={i} s={[0.26, 0.06, 0.06]} p={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0]} r={[0, 0, a]} c="#ffe36a" o={{ emissive: "#ffd84a", ei: 1.4 }} cast={false} />; })}</G>
    </G>
  );
};
/** «ningún barco ha logrado volver… porque el viento sopla hacia el oeste»: três galeões saem rumo à América e o vento os gira e devolve */
const tryShip = (t: number, i: number) => {
  const s0 = X.cruz + i * 0.2, b0 = T.porque + i * 0.12, go = ease(t, s0, s0 + 1.0), back = ease(t, b0, X.viento + 0.3), spin = ease(t, b0, b0 + 0.55);
  return { p: [-13 + (20 - i * 3) * go - 17 * back, 0, [0, 12.5, 25][i]] as V3, yaw: PI * spin + 0.3 * Math.sin(t * 11 + i) * spin * (1 - back), wind: lerp(1, -1, spin), tilt: 0.14 * Math.sin(t * 7 + i) * spin };
};
const tryOn = (t: number) => t >= X.cruz - 0.02 && t < X.viento;
/** fogos sobre Acapulco quando o circuito fecha */
const Fireworks: React.FC<{ t: number }> = ({ t }) => {
  const at = [C3 + 0.62, C3 + 0.92, C3 + 1.22], cs = ["#ffd84a", "#ff6bb5", "#5cff7a"], ctr: V3[] = [[30, 8, 6], [25, 10, -3], [31, 9, 15]];
  return <G>{at.map((a, j) => { const u = prog(t, a, a + 0.9); if (u <= 0 || u >= 1) return null; const r = 10 * Math.sqrt(u);
    return <G key={j} p={[ctr[j][0], ctr[j][1] + 3 * u, ctr[j][2]]}>{Array.from({ length: 14 }, (_, i) => { const a1 = (i / 14) * PI * 2, a2 = (i % 3 - 1) * 0.6;
      return <Sph key={i} rad={1.7 * (1 - u * 0.6)} p={[Math.cos(a1) * Math.cos(a2) * r, Math.sin(a2) * r - 4 * u * u, Math.sin(a1) * Math.cos(a2) * r]} c={cs[(i + j) % 3]} o={{ emissive: cs[(i + j) % 3], ei: 1.5 }} cast={false} ws={6} hs={4} />; })}</G>; })}</G>;
};
/** arco-íris que cresce atrás do galeão no «Este es el galeón» (a tempestade passou e o casco aguentou) */
const Rainbow: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.galeonT && t < X.p3 + 0.05)) return null;
  const arc = Math.max(0.02, PI * ease(t, T.galeonT + 0.1, T.galeonT + 1.0)), cs = ["#ff3b3b", "#ff9a2a", "#ffe23a", "#4fd65a", "#3aa0ff", "#8a5aff"];
  return <G p={[SX - 10, 0, SZ - 14]} r={[0, 0.65, 0]}>{cs.map((c, i) => <mesh key={i} material={mat(c, { emissive: c, ei: 0.55, opacity: 0.9 })}><torusGeometry args={[13 - i * 0.5, 0.27, 6, 64, arc]} /></mesh>)}</G>;
};

// ---------------------------------------------------------------- cenas de perto
/** estaleiro em Luzon: cavername do casco que sobe; tora de molave em que o machado quica soltando faíscas */
export const YARD = { x: -21, z: -9 };
export const LOG: V3 = [YARD.x + 8.5, 1.45, YARD.z + 0.8];
const Shipyard: React.FC<{ t: number }> = ({ t }) => {
  if (t < X.b2 - 0.05 || t > C4 + 0.05) return null;
  const k = ease(t, T.barcos - 0.3, T.maderas + 0.2), planks = ease(t, T.filipinas, C4);
  return (
    <G>
      <G p={[YARD.x, 0.7, YARD.z]}>
        <Box s={[12, 0.3, 4]} p={[0, 0.15, 0]} c="#c9b07a" /><Box s={[5, 0.3, 4]} p={[8.5, 0.15, 0]} c="#c4a870" />
        {[[6.3, -1.8], [6.3, 1.8], [10.7, -1.8], [10.7, 1.8]].map(([x, z], i) => <Box key={i} s={[0.3, 1.2, 0.3]} p={[x, -0.45, z]} c={WOOD} />)}
        {Array.from({ length: 9 }, (_, i) => { const u = clamp(k * 1.5 - i / 9); if (u <= 0.01) return null; const x = -4.4 + i * 1.1;
          return <G key={i} p={[x, 0.3, 0]} sc={[1, u, 1]}>{[-1, 1].map((s) => <Pipe key={s} a={[0, 0, 0]} b={[0, 2.8, s * 1.7]} rad={0.14} c={MOLAVE} seg={5} />)}</G>; })}
        <Box s={[9.6 * Math.max(k, 0.01), 0.32, 0.32]} p={[-4.4 + 4.8 * k, 0.45, 0]} c={MOLAVE} />
        {[-1, 1].map((s) => <Box key={s} s={[9.6 * planks + 0.01, 1.2, 0.12]} p={[-4.4 + 4.8 * planks, 1.2, s * 1.0]} r={[s * 0.35, 0, 0]} c="#6b4423" />)}
        {[[-2, -2.6], [2.5, -2.6]].map(([x, z], i) => <Worker key={i} p={[x, 0.3, z]} yaw={0} pose={poseOf("chisel", t + i * 0.4)} t={t} c={COSTUMES.marinero} prop="hammer" scale={0.85} mustache={i === 0} />)}
      </G>
      {/* a tora de molave em cavaletes (o operário bate de trás dela) */}
      <G p={LOG}>
        <Cyl rt={0.42} h={4.2} r={[0, 0, PI / 2]} c={MOLAVE} seg={9} /><Cyl rt={0.36} h={0.03} p={[2.11, 0, 0]} r={[0, 0, PI / 2]} c="#b07848" seg={9} cast={false} />
        {[-1.5, 1.5].map((x) => <Box key={x} s={[0.3, 0.2, 0.9]} p={[x, -0.36, 0]} c={WOOD} />)}
        {/* 3º golpe: o machado quica na madeira dura e voa girando para fora do quadro (o gag do «durísimas») */}
        {(() => { const u = prog(t, AXE[2] + 0.03, AXE[2] + 0.52); if (u <= 0 || u >= 1) return null;
          return <G p={[0.3 - 1.6 * u, 0.55 + 3.2 * u - 3.0 * u * u, -0.4 + 0.5 * u]} r={[u * 3, 0, u * 16]}><Box s={[0.08, 0.75, 0.08]} c="#8a5a32" /><Box s={[0.4, 0.18, 0.18]} p={[0, 0.37, 0]} c="#9aa3ad" o={{ metal: 0.6, rough: 0.3 }} /></G>; })()}
        {AXE.map((a, j) => { const u = prog(t, a - 0.02, a + 0.38); if (u <= 0 || u >= 1) return null;
          return <G key={j}>{Array.from({ length: 10 }, (_, i) => { const ang = (i / 10) * PI * 2 + j; return <Box key={i} s={[0.07, 0.07, 0.07]} p={[0.25 + Math.cos(ang) * u * 1.1, 0.42 + u * 1.3 - u * u * 1.1 + Math.sin(ang) * 0.2 * u, -0.15 + Math.sin(ang) * u * 0.9]} c="#ffd84a" o={{ emissive: "#ffb020", ei: 1.4 }} cast={false} />; })}
            <Sph rad={0.22 * (1 - u)} p={[0.25, 0.42, -0.15]} c="#fff2b0" o={{ emissive: "#ffd84a", ei: 1.5 }} cast={false} /></G>; })}
      </G>
    </G>
  );
};
/** mercado de Manila: o operário oferece o caixote europeu, o mercador chinês o empurra para fora; com a prata, festa */
export const MKT = { x: -26, z: 1 };
const Market: React.FC<{ t: number }> = ({ t }) => {
  if (t < X.p4 - 0.05 || t > X.b4 + 0.05) return null;
  const offer = ease(t, X.p4 + 0.15, X.p4 + 0.7), push = ease(t, T.europeos + 0.3, T.europeos + 0.75), coins = ease(t, T.plata0 - 0.05, T.plata0 + 0.5);
  const refuse = t > T.noQ - 0.02 && t < T.plata0 - 0.05, crate: V3 = [lerp(lerp(2.6, 1.0, offer), 2.6, push), 1.1 + 0.25 * Math.sin(push * PI) - 1.1 * ease(t, T.europeos + 0.55, T.europeos + 0.8), lerp(lerp(1.3, 0.3, offer), 1.5, push)];
  return (
    <G p={[MKT.x, 0.7, MKT.z]}>
      <Box s={[4, 1.1, 1.6]} p={[0, 0.55, 0]} c={WOOD} /><Box s={[4.4, 0.15, 2.4]} p={[0, 2.8, -0.2]} c="#c8352a" />{[-2, 2].map((x) => <Box key={x} s={[0.15, 2.8, 0.15]} p={[x, 1.4, -1.1]} c={WOOD} />)}
      {[["#c8352a", -1.4], ["#e8b030", -0.8], ["#2fa85a", -0.2]].map(([c, x], i) => <Box key={i} s={[0.5, 0.25 + i * 0.05, 1.0]} p={[x as number, 1.25, -0.1]} c={c as string} />)}
      {[-1.5, -1.0].map((x, i) => <G key={i} p={[x, 1.1, 0.45]}><Sph rad={0.24} p={[0, 0.26, 0]} sc={[1, 1.3, 1]} c="#f4f6fa" ws={10} hs={8} /><Cyl rt={0.09} h={0.22} p={[0, 0.62, 0]} c="#2f5fd0" seg={8} /></G>)}
      <Worker p={[0.2, 0, -1.4]} yaw={refuse ? 0.25 * Math.sin(t * 14) : 0} pose={poseOf(refuse ? "alarm" : coins > 0.5 ? "cheer" : offer > 0.9 ? "think" : "present", t)} t={t} c={COSTUMES.mercader} scale={1.15} />
      {/* caixote europeu (vinho e pano) que volta empurrado e cai do balcão */}
      <G p={crate} r={[0, 0, -1.3 * ease(t, T.europeos + 0.5, T.europeos + 0.8)]} vis={coins < 0.6}><Box s={[0.9, 0.7, 0.7]} p={[0, 0.35, 0]} c="#9a6a38" /><Cyl rt={0.12} h={0.5} p={[0.2, 0.95, 0.1]} c="#2a5a2a" seg={8} /><Cyl rt={0.18} h={0.75} p={[-0.18, 0.88, -0.1]} r={[0, 0, PI / 2]} c="#7a2a4a" seg={8} /></G>
      {/* a prata que o mercador quer: pilha que cresce no balcão */}
      {coins > 0.02 ? Array.from({ length: 12 }, (_, i) => { const u = clamp(coins * 1.6 - i * 0.05); return u > 0.01 ? <Cyl key={i} rt={0.3} h={0.07} p={[0.9 + (i % 2) * 0.12, 1.15 + i * 0.075 + (1 - u) * 1.2, 0.35]} c={SILVER} o={{ metal: 0.8, rough: 0.25, emissive: "#ffffff", ei: 0.2 }} seg={14} /> : null; }) : null}
    </G>
  );
};
/** mina de prata no México: boca na encosta sul, veios que brilham, dois mineiros de perfil, carrinho que sai rumo à casa da moeda */
const MOUTH: V3 = [47, 1.5, 8.3];
const Mine: React.FC<{ t: number }> = ({ t }) => {
  if (t < X.b4 - 0.05 || t > X.medio + 0.05) return null;
  const glow = ease(t, T.minas - 0.2, T.minas + 0.4), glow2 = ease(t, T.potosi - 0.2, T.potosi + 0.4), load = ease(t, T.minas, T.mexico + 0.6), roll = ease(t, T.mexico + 0.5, C6 - 0.15);
  return (
    <G>
      <Box s={[1.4, 1.6, 1.0]} p={MOUTH} c="#1a1410" />
      {[-0.8, 0.8].map((x) => <Box key={x} s={[0.22, 1.8, 0.22]} p={[MOUTH[0] + x, 1.6, MOUTH[2] + 0.55]} c={WOOD} />)}<Box s={[1.9, 0.24, 0.26]} p={[MOUTH[0], 2.5, MOUTH[2] + 0.55]} c={WOOD} />
      {Array.from({ length: 9 }, (_, i) => <Sph key={i} rad={0.13 + 0.06 * rnd(i + 2)} p={[MOUTH[0] + (rnd(i) - 0.5) * 1.0, 0.95 + rnd(i + 7) * 1.2, MOUTH[2] + 0.5]} c="#d8dee6" o={{ emissive: "#ffffff", ei: 0.15 + 0.75 * glow, metal: 0.7, rough: 0.3, flat: true }} ws={5} hs={3} cast={false} />)}
      {/* Potosí: o cerro vermelho também brilha */}
      {Array.from({ length: 5 }, (_, i) => <Box key={i} s={[0.5, 2.6, 0.2]} p={[43 + i * 1.0, 3 + (i % 2) * 1.6, 41.2 - Math.abs(i - 2) * 0.4]} r={[0.5, 0, (rnd(i + 3) - 0.5) * 0.8]} c={SILVER} o={{ emissive: "#ffffff", ei: 0.9 * glow2, metal: 0.6 }} cast={false} vis={glow2 > 0.05} />)}
      {[[45.7, 0.75 * PI], [48.3, -0.75 * PI]].map(([x, yaw], i) => <Worker key={i} p={[x, 0.7, 9.05]} yaw={yaw} pose={poseOf("chisel", t + i * 0.26)} t={t + i * 0.26} c={COSTUMES.mason} prop="hammer" scale={0.85} mustache={i === 1} />)}
      {/* «Potosí»: a prata espirra da boca da mina e quica no chão (ritmo, 13/11: o mineiro parado na porta) */}
      {Array.from({ length: 16 }, (_, i) => { const tau = (t - (T.potosi - 0.08 + rnd(i + 11) * 0.22)) * 1.0; if (tau <= 0 || tau > 0.8) return null;
        const vx = -0.9 - 2.4 * rnd(i + 1), vz = 0.8 + 2.4 * rnd(i + 2), vy = 2.8 + 1.8 * rnd(i + 3), y = Math.max(0.78, 1.3 + vy * tau - 6 * tau * tau);
        return <Sph key={"b" + i} rad={0.13 + 0.07 * rnd(i)} p={[MOUTH[0] - 0.2 + vx * tau, y, MOUTH[2] + 0.5 + vz * tau]} c="#e4e9ef" o={{ emissive: "#ffffff", ei: 0.6, metal: 0.7, rough: 0.25, flat: true }} ws={5} hs={3} cast={false} />; })}
      {/* trilhos e o carrinho de minério */}
      {[9.05, 9.55].map((z) => <Box key={z} s={[7.6, 0.06, 0.08]} p={[43.6, 0.74, z + 0.4]} c="#5a5a5a" cast={false} />)}
      <G p={[lerp(47, 42.3, roll), 0.75, 9.7]}>
        <Box s={[1.1, 0.55, 0.75]} p={[0, 0.42, 0]} c="#6b4a2a" />{[-0.35, 0.35].map((x) => [-0.3, 0.3].map((z) => <Cyl key={x + "" + z} rt={0.14} h={0.08} p={[x, 0.14, z * 1.2]} r={[PI / 2, 0, 0]} c="#2a2a2a" seg={8} />))}
        {Array.from({ length: 7 }, (_, i) => { const u = clamp(load * 1.4 - i * 0.08); return u > 0.01 ? <Sph key={i} rad={0.17} p={[(rnd(i) - 0.5) * 0.7, 0.75 + (i % 3) * 0.08 + (1 - u) * 1.4, (rnd(i + 5) - 0.5) * 0.45]} c="#aab3bd" o={{ emissive: "#ffffff", ei: 0.15, metal: 0.7, rough: 0.3, flat: true }} ws={5} hs={3} cast={false} /> : null; })}
      </G>
    </G>
  );
};
/** casa da moeda: o cunho cai no disco de prata (faísca, a cruz gravada), a moeda pula para a balança, que fica nivelada no «fijo» */
export const ANVIL: V3 = [40.5, 0.7, 6.4];
const Mint: React.FC<{ t: number }> = ({ t }) => {
  if (t < X.b4 - 0.05 || t > X.medio + 0.05) return null;
  const s0 = MINT[0], P = 0.5, ph = t < s0 ? -1 : ((t - s0) % P) / P, k = t < s0 ? -1 : Math.floor((t - s0) / P);
  const lift = ph < 0 ? 1.2 * (t > s0 - 0.08 ? 1 - ((t - (s0 - 0.08)) / 0.08) ** 2 : 1) : ph < 0.15 ? 0 : ph < 0.7 ? 1.2 * ease(ph, 0.15, 0.7) : ph < 0.84 ? 1.2 : 1.2 * (1 - ((ph - 0.84) / 0.16) ** 2);
  const stamped = ph >= 0 && ph < 0.45, fly = ph >= 0.42 && ph < 0.82 ? prog(ph, 0.42, 0.82) : -1, landed = Math.max(0, Math.min(3, ph >= 0.82 ? k + 1 : k));
  const beam = t < s0 + 0.35 ? -0.3 : -0.3 * Math.exp(-(t - s0 - 0.35) * 3.4) * Math.cos((t - s0 - 0.35) * 11);
  const PAN = 0.8, pivot: V3 = [ANVIL[0], 2.65, ANVIL[2] - 2.0], end = (s: number): V3 => [pivot[0], pivot[1] - s * PAN * Math.sin(beam), pivot[2] + s * PAN * Math.cos(beam)];
  const R = end(-1), L = end(1);
  return (
    <G>
      <Box s={[0.7, 0.6, 0.7]} p={[ANVIL[0], ANVIL[1] + 0.3, ANVIL[2]]} c="#5a4a3a" /><Cyl rt={0.3} h={0.1} p={[ANVIL[0], ANVIL[1] + 0.65, ANVIL[2]]} c="#6a6a70" seg={12} />
      {[-0.6, 0.6].map((z) => <Box key={z} s={[0.16, 2.7, 0.16]} p={[ANVIL[0], ANVIL[1] + 1.35, ANVIL[2] + z]} c={WOOD} />)}<Box s={[0.3, 0.2, 1.4]} p={[ANVIL[0], ANVIL[1] + 2.75, ANVIL[2]]} c={WOOD} />
      <G p={[ANVIL[0], ANVIL[1] + 0.82 + lift, ANVIL[2]]}><Cyl rt={0.2} h={0.5} p={[0, 0.25, 0]} c="#b8bec6" o={{ metal: 0.6, rough: 0.3 }} seg={12} /><Box s={[0.26, 0.22, 0.6]} p={[0, 0.6, 0]} c="#8a9098" o={{ metal: 0.5, rough: 0.35 }} /></G>
      {/* o disco na bigorna: liso antes do golpe, com a cruz gravada depois */}
      {fly < 0 ? <G p={[ANVIL[0], ANVIL[1] + 0.73, ANVIL[2]]}><Cyl rt={0.26} h={0.06} c={SILVER} o={{ metal: 0.8, rough: 0.25, emissive: "#ffffff", ei: 0.25 }} seg={16} />
        {stamped ? <G p={[0, 0.035, 0]}><Box s={[0.34, 0.02, 0.07]} c="#6a7078" cast={false} /><Box s={[0.07, 0.02, 0.34]} c="#6a7078" cast={false} /></G> : null}</G> : null}
      {stamped && ph < 0.3 ? <G p={[ANVIL[0], ANVIL[1] + 0.8, ANVIL[2]]}>{Array.from({ length: 10 }, (_, i) => { const u = ph / 0.3, a = (i / 10) * PI * 2; return <Box key={i} s={[0.06, 0.06, 0.06]} p={[Math.cos(a) * u * 0.9, u * 0.5, Math.sin(a) * u * 0.9]} c="#fff2b0" o={{ emissive: "#ffd84a", ei: 1.4 }} cast={false} />; })}</G> : null}
      {fly >= 0 ? <G p={[lerp(ANVIL[0], R[0], fly), lerp(ANVIL[1] + 0.75, R[1] - 0.62, fly) + Math.sin(fly * PI) * 0.9, lerp(ANVIL[2], R[2], fly)]} r={[fly * 6, 0, fly * 3]}><Cyl rt={0.26} h={0.06} c={SILVER} o={{ metal: 0.8, rough: 0.25, emissive: "#ffffff", ei: 0.25 }} seg={16} /></G> : null}
      {/* balança: peso padrão à esquerda, as moedas à direita */}
      <Box s={[0.16, 1.95, 0.16]} p={[pivot[0], 1.65, pivot[2]]} c={WOOD} /><Box s={[0.7, 0.12, 0.5]} p={[pivot[0], 0.76, pivot[2]]} c={WOOD} />
      <Box s={[0.07, 0.07, PAN * 2 + 0.1]} p={pivot} r={[beam, 0, 0]} c="#c8a040" o={{ metal: 0.6, rough: 0.35 }} />
      {[L, R].map((e, i) => <G key={i} p={e}><Box s={[0.02, 0.6, 0.02]} p={[0, -0.3, 0]} c="#3a2a1a" cast={false} /><Cyl rt={0.36} rb={0.26} h={0.07} p={[0, -0.62, 0]} c="#c8a040" o={{ metal: 0.6, rough: 0.35 }} seg={12} />
        {i === 0 ? <Box s={[0.34, 0.26, 0.26]} p={[0, -0.45, 0]} c="#b08a3a" o={{ metal: 0.6, rough: 0.3 }} /> : Array.from({ length: landed }, (_, c) => <Cyl key={c} rt={0.26} h={0.06} p={[0, -0.55 + c * 0.065, 0]} c={SILVER} o={{ metal: 0.8, rough: 0.25 }} seg={16} />)}</G>)}
    </G>
  );
};
/** moedas voando de Acapulco a Manila e daí à China (o meio mundo); marcas acendem nos portos */
const CoinArcs: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, X.medio - 0.05, X.medio + 0.35) * (1 - ease(t, X.p5 - 0.3, X.p5)); if (on <= 0.01) return null;
  const legs: [V3, V3, number][] = [[[38, 0, 11], [-21, 0, -3], 20], [[-24, 0, -3], [-49, 0, -8], 9]];
  return (
    <G>
      {legs.map(([a, b, hgt], j) => Array.from({ length: 6 }, (_, i) => { const u = fract(t * 0.42 + i / 6 + j * 0.3); return <Cyl key={j * 10 + i} rt={3.4} h={0.6} p={[lerp(a[0], b[0], u), 2 + Math.sin(u * PI) * hgt, lerp(a[2], b[2], u)]} r={[PI / 2.6, t * 3, 0]} c={SILVER} o={{ metal: 0.8, rough: 0.25, emissive: "#ffffff", ei: 0.35 }} seg={16} cast={false} sc={on} />; }))}
      {[[38, 11], [-23, -3], [-49, -8]].map(([x, z], i) => <Cyl key={i} rt={4.2 + 0.8 * Math.sin(t * 6 + i)} h={0.3} p={[x, 0.9, z]} c="#ffd84a" o={{ emissive: "#ffd84a", ei: 0.9 }} seg={20} cast={false} sc={on} />)}
    </G>
  );
};
/** comércio mundial: linhas acesas ligando os portos; no fim, caixas de encomenda voando da China à América */
/** o último galeão, grande, atravessando o mapa pelo tornaviaje (ritmo, 13/11: o desfecho prometido tem de aparecer) */
export const finalU = (t: number) => { const p = prog(t, X.hist, T.manda + 1.3); return 1 - (1 - p) * (1 - p); }; // sai já andando
const PILE: V3[] = [[41, 2.9, 19], [41, 2.9, 24.5], [45.5, 2.9, 21.8], [41, 2.9, 30], [41, 7.3, 21.8], [45.5, 2.9, 27.3], [41, 7.3, 27.3], [41.5, 11.7, 24.5]];
const Trade: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, X.hist, X.hist + 1.4); if (on <= 0.01 || t < X.hist - 0.02) return null;
  const u = finalU(t);
  return (
    <G>
      <Route pts={OUT} u={on} c="#ffd34a" t={t} pulse={1.5} /><Route pts={TORNA} u={Math.min(1, u + 0.03)} c="#ffd34a" t={t} pulse={1.5} /><Route pts={CHINA_L} u={on} c="#ff8a4a" /><Route pts={EURO_L} u={on} c="#ff8a4a" />
      {/* «Mándaselo…»: caixas saem da China, cruzam o Pacífico e caem empilhando na América */}
      {PARCELS.map((a, i) => { const f = prog(t, a, a + 1.0); if (f <= 0) return null; const z = PILE[i], o: V3 = [-48, 2, -8];
        const land = f >= 1, sq = land ? 0.25 * Math.sin(prog(t, a + 1.0, a + 1.3) * PI) : 0, p: V3 = land ? z : [lerp(o[0], z[0], f), lerp(o[1], z[1], f) + Math.sin(f * PI) * 26, lerp(o[2], z[2], f)];
        return <G key={i} p={p} r={land ? [0, i * 0.7, 0] : [f * 4, t * 2 + i, f * 2]} sc={[2.6 * (1 + sq), 2.6 * Math.max(0.3, 1 - sq), 2.6 * (1 + sq)]}><Box s={[2.2, 1.7, 1.7]} c="#c89a5a" /><Box s={[2.25, 0.32, 1.75]} c="#e8d8b0" cast={false} /></G>; })}
    </G>
  );
};
const CHINA_L: V3[] = [[-24, 0, -2], [-46, 0, -8]], EURO_L: V3[] = [[52, 0, 0], [80, 0, 0]];
const Ports: React.FC = () => (
  <G>
    <G p={[-23, 0.7, -4]}>{[[0, 0], [1.6, 0.6], [-1.4, 1.2], [0.8, -1.6]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Box s={[1.2, 1, 1]} p={[0, 0.5, 0]} c="#f2ede0" /><Cone rad={0.95} h={0.7} seg={4} p={[0, 1.35, 0]} r={[0, PI / 4, 0]} c="#c8553d" /></G>)}<Box s={[1.4, 2.6, 1.4]} p={[-2.6, 1.3, -1]} c="#f2ede0" /><Cone rad={0.6} h={1.2} seg={8} p={[-2.6, 3.2, -1]} c="#c8553d" /></G>
    <G p={[39.5, 0.7, 12]}>{[[0, 0], [1.4, 1], [0.6, -1.4]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Box s={[1.2, 1, 1]} p={[0, 0.5, 0]} c="#efe0c4" /><Cone rad={0.95} h={0.7} seg={4} p={[0, 1.35, 0]} r={[0, PI / 4, 0]} c="#b0603a" /></G>)}</G>
    <Palms spots={[[-20, 0.7, 6], [-27, 0.7, 3], [39, 0.7, 16], [-23, 0.7, 13]]} t={0} />
  </G>
);
const Rain: React.FC<{ t: number; c: V3; a: number; b: number; n?: number; w?: number }> = ({ t, c, a, b, n = 40, w = 8 }) => {
  if (!(t > a && t < b)) return null;
  return <G>{Array.from({ length: n }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.07, 0.9, 0.07]} p={[c[0] + lerp(-w, w, rnd(i + 1)), 14 - u * 14, c[2] + lerp(-w * 0.75, w * 0.75, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
/** nuvem carregada (cinza) que entra e sai deslizando */
const StormCloud: React.FC<{ p: V3; k: number }> = ({ p, k }) => k <= 0.01 ? null : (
  <G p={p} sc={k}><Sph rad={5} c="#6a7480" cast={false} o={{ rough: 1 }} /><Sph rad={4} p={[5.5, -0.8, 0.5]} c="#5f6a76" cast={false} o={{ rough: 1 }} /><Sph rad={3.6} p={[-5.2, -1, -0.5]} c="#727c88" cast={false} o={{ rough: 1 }} /></G>
);
export const dusk = (t: number) => ease(t, T.ultimo + 0.2, T.y1815 + 0.8) * (1 - ease(t, T.historiadores + 0.3, T.mundial + 0.6));
const Dusk: React.FC<{ t: number }> = ({ t }) => { const n = dusk(t); if (n <= 0.01) return null; return <mesh><sphereGeometry args={[560, 24, 16]} /><meshBasicMaterial color="#ff8a4a" side={1} transparent opacity={0.55 * n} fog={false} depthWrite={false} /></mesh>; };

// ---------------------------------------------------------------- mar aberto (longe de toda terra): meses, tempestade, sede, tinajas
export const SEA_SCENE: V3 = [0, 0, -250];
const [SX, , SZ] = SEA_SCENE;
export const stormOn = (t: number) => (t >= C4 - 0.05 && t < X.p3 ? 1 : 0) * (1 - ease(t, T.galeonT - 0.1, T.galeonT + 1.3));
const seaShip = (t: number) => {
  const s = stormOn(t);
  return { tilt: 0.24 * s * Math.sin(t * 5.6), roll: 0.12 * s * Math.sin(t * 3.7 + 1), bob: 1 + 3 * s };
};
/** sol e lua dando voltas atrás do barco: os meses passando */
const SunMoon: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > X.p2 - 0.05 && t < X.b2)) return null;
  const c: V3 = [SX - 11, 0, SZ - 12], u: V3 = [0.74, 0, -0.67], R = 11, th = PI * 0.95 - (t - X.p2) * PI * 1.5;
  const at = (a: number): V3 => [c[0] + R * Math.cos(a) * u[0], R * Math.sin(a), c[2] + R * Math.cos(a) * u[2]];
  return <G><Sph rad={2.2} p={at(th)} c="#ffd84a" o={{ emissive: "#ffc020", ei: 1.2 }} cast={false} /><Sph rad={1.6} p={at(th + PI)} c="#eef4ff" o={{ emissive: "#cfe0ff", ei: 0.9 }} cast={false} /></G>;
};
const Storm: React.FC<{ t: number }> = ({ t }) => {
  const s = stormOn(t); if (s <= 0.01) return null;
  const away = ease(t, T.galeonT - 0.1, T.galeonT + 1.3) * 70, crash = prog(t, T.olas + 0.05, T.olas + 1.0);
  return (
    <G>
      {Array.from({ length: 5 }, (_, k) => { const x = SX + 24 - fract(t * 0.26 + k / 5) * 48; return <G key={k} p={[x, -0.35 - (1 - s) * 1.6, SZ]}><Cyl rt={1.7} h={46} seg={3} r={[-PI / 2, 0, 0]} c="#2a6a9e" /><Box s={[0.55, 0.2, 46]} p={[0, 1.65, 0]} c="#f2fbff" o={{ emissive: "#dff4ff", ei: 0.4 }} cast={false} /></G>; })}
      {[[-6, 17, -8], [6, 19, -12], [16, 16, -4], [-16, 18, -14], [2, 21, 4]].map(([x, y, z], i) => <StormCloud key={i} p={[SX + x + away, y, SZ + z]} k={s > 0.02 ? 1 : 0} />)}
      <Puffs t={t} p={[SX + 5.6, 1.2, SZ + 0.5]} n={6} period={0.9} rise={2.6} size={0.9 * s} on={s} drift={[1.4, 0, 0]} />
      {crash > 0 && crash < 1 ? Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * PI - PI / 2; return <Sph key={i} rad={0.55} p={[SX + 4.8 - crash * 3.5 + Math.sin(a) * 0.6, 1.5 + Math.sin(crash * PI) * 3.6 + (i % 3) * 0.3, SZ + Math.cos(a) * 1.6]} sc={Math.max(0.001, 1.4 * Math.sin(crash * PI))} c="#f2fbff" cast={false} ws={8} hs={6} />; }) : null}
    </G>
  );
};
/** marinheiros no convés: pensativos nos meses; com sede e o barril vazio virado no problema da água */
const Deck: React.FC<{ t: number }> = ({ t }) => {
  const months = t > X.p2 - 0.05 && t < X.b2, thirst = t > X.p3 - 0.05 && t < C5, saved = t > T.galeonT - 0.05 && t < X.p3;
  if (saved) return <Crowd list={[-2, -0.6, 0.8, 2.2].map((x, i) => ({ p: [SX + x, 1.75, SZ + (i % 2) * 0.6 - 0.3] as V3, yaw: 1.0 + i * 0.25, pose: "cheer" as PoseName, ph: i * 0.37 }))} t={t} c={COSTUMES.marinero} scale={0.7} />;
  if (!months && !thirst) return null;
  const list = [-2, -0.6, 0.8, 2.2].map((x, i) => ({ p: [SX + x, 1.75, SZ + (i % 2) * 0.6 - 0.3] as V3, yaw: 1.2 + i * 0.3, pose: (months ? (i % 2 ? "belly" : "think") : i === 3 ? "alarm" : i % 2 ? "think" : "alarm") as PoseName, ph: i * 0.3 }));
  const shake = prog(t, T.agua + 0.3, T.agua + 0.45) * (1 - prog(t, C5 - 0.5, C5 - 0.42)), tip = thirst ? 1.45 * ease(t, T.rios, T.agua + 0.2) + 0.2 * Math.sin(t * 15) * shake : 0, drops = prog(t, T.agua + 0.05, T.agua + 0.75);
  return (
    <G>
      <Crowd list={list.slice(0, 3)} t={t} c={COSTUMES.marinero} scale={0.7} />
      <Worker p={[SX + 2.5, 1.75, SZ + 1.0]} yaw={-0.6} pose={poseOf(thirst ? "pour" : "think", t)} t={t} c={COSTUMES.marinero} scale={0.7} />
      <G p={[SX + 3.2, 1.75, SZ + 0.35]} r={[tip, 0, 0]}><G p={[0, 0, -0.35]}><Cyl rt={0.4} rb={0.35} h={0.9} p={[0, 0.45, 0]} c={WOOD} seg={10} /><Cyl rt={0.36} h={0.05} p={[0, 0.92, 0]} c="#1a120a" seg={10} />
        {[0.2, 0.7].map((y) => <Cyl key={y} rt={0.41} h={0.06} p={[0, y, 0]} c="#3a3a3a" seg={10} />)}</G></G>
      {/* sacode o barril: sai uma última gota, sozinha */}
      {thirst && t > T.agua + 0.85 && t < T.agua + 1.35 ? <Sph rad={0.09} p={[SX + 3.2, 2.15 - prog(t, T.agua + 0.85, T.agua + 1.35) * 0.45, SZ + 1.32]} c="#7fd0ff" o={{ emissive: "#4ab0ff", ei: 0.6 }} cast={false} ws={6} hs={4} /> : null}
      {thirst && drops > 0 && drops < 1 ? [0, 1].map((d) => { const u = clamp(drops * 2 - d * 0.6); return u > 0 && u < 1 ? <Sph key={d} rad={0.07} p={[SX + 3.2, 2.15 - u * 0.45, SZ + 1.22 + u * 0.1]} c="#7fd0ff" o={{ emissive: "#4ab0ff", ei: 0.6 }} cast={false} ws={6} hs={4} /> : null; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- navios no tempo
export const COV: V3 = [-8, 0, 2], COV_YAW = PI * 0.9, BRI_END: V3 = [-6.6, 0, -2.0];
export const briAt = (t: number) => {
  const e = ease(t, T.p5 + 0.7, T.guerra + 0.7), y0 = -Math.atan2(BRI_END[2] + 26, BRI_END[0] + 3); // o inimigo já vem do horizonte no «cargado»
  return { p: [lerp(-3, BRI_END[0], e), 0, lerp(-26, BRI_END[2], e)] as V3, yaw: lerp(y0, COV_YAW - 2 * PI, ease(e, 0.55, 1)) };
};
export const lastShip = (t: number) => { const u = prog(t, T.zarpo + 0.2, X.hist); return { p: [-15 + 13 * u * u, 0, -1.6] as V3, sail: ease(t, T.zarpo - 0.12, T.zarpo + 0.45) }; }; // ainda saindo do quadro no corte
const SHOTS = [T.capturo - 0.4, T.capturo + 0.1, T.capturo + 0.6];
const Fleet: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  // gancho: o galeão no mapa, grande, fazendo a volta; «a veces dos»: o segundo cresce atrás dele
  if (built(t)) {
    if (t < T.unio + 0.3) {
      out.push(<Galleon key="h0" p={[lerp(-4, 10, t / T.unio), 0, -36]} yaw={0} t={t} sc={1.4} wind={1} />);
      const k2 = ease(t, T.veces - 0.15, T.veces + 0.7);
      if (k2 > 0.01) out.push(<Galleon key="h1" p={[lerp(-10, 1, t / T.unio), 0, -42]} yaw={0} t={t + 1.3} sc={1.4 * k2} wind={1} />);
    } else { const a = alongQ(TQ, (t / T.cebu) * 0.5 + 0.2); out.push(<Galleon key="h" p={a.p} yaw={a.yaw} t={t} sc={1.4} wind={1} />); }
  }
  // Cebu 1565: chega com o vento; vira para a América; o vento sopra contra e o empurra de popa para trás
  if (t >= X.cebu && t < C2 + 0.02 && !tryOn(t)) { const s = cebuShip(t); out.push(<Galleon key="c" p={[s.x, 0, CEBU_Z]} yaw={s.yaw} t={t} wind={s.wind} tilt={s.tilt} />);
    if (t > T.nohay - 0.1 && t < T.nohay + 1.1) out.push(<Engine key="eng" t={t} p={toWorld([s.x, 0.12 * Math.sin(t * 1.8 + s.x), CEBU_Z], s.yaw, [-0.4, 1.68, -0.2])} yaw={s.yaw} />); }
  if (tryOn(t)) [0, 1, 2].forEach((i) => { const s = tryShip(t, i); out.push(<Galleon key={"try" + i} p={s.p} yaw={s.yaw} t={t + i * 0.7} sc={2.1} wind={s.wind} tilt={s.tilt} />); });
  // tornaviaje: o galeão sobe a rota empurrado pelo vento e pela corrente
  if (t >= C2 - 0.02 && t < X.p2) { const a = t >= C3 ? loopShip(t) : shipOnRoute(t); out.push(<Galleon key="r" p={a.p} yaw={a.yaw} t={t} sc={t >= C3 ? 2.2 : 1.6} wind={1} />); }
  // mar aberto
  const sea = (t >= X.p2 - 0.02 && t < X.b2) || (t >= C4 - 0.05 && t < X.p4);
  if (sea) {
    const m = seaShip(t), months = t < X.b2;
    out.push(<Galleon key="sea" p={SEA_SCENE} yaw={0.1} t={t} tilt={m.tilt} roll={m.roll} bob={m.bob} wind={months ? 1 : 0.6}
      tally={months ? 4 * ease(t, T.cuatroW, T.cuatroW + 0.3) + ease(t, T.cincoW, T.cincoW + 0.2) + ease(t, T.seisW, T.seisW + 0.2) : 0}
      cut={t >= C5 - 0.02 && t < X.colgadas} jars={prog(t, JARS[0], JARS[1])} hang={t >= X.colgadas ? ease(t, X.colgadas - 0.05, T.colgadas + 0.9) : 0}
      fill={ease(t, T.chubasco + 0.2, T.tinajasT - 0.2)} />);
  }
  // 1743: carregado de prata e seda, vira alvo; o navio de guerra britânico chega, atira, aborda e leva a prata
  if (t >= X.p5 - 0.02 && t < X.ultimo) {
    const flag = 1 - ease(t, T.capturo + 0.5, T.capturo + 1.2), brit = ease(t, T.capturo + 0.9, T.capturo + 1.6), b = briAt(t);
    out.push(<Galleon key="cov" p={COV} yaw={COV_YAW} t={t} sc={1.1} flag={flag} brit={brit} cargo={ease(t, T.p5 + 0.55, T.p5 + 1.6)} />);
    out.push(<Galleon key="bri" p={b.p} yaw={b.yaw} t={t + 0.7} sc={1.15} enemy wind={1} />);
    // alvo no mar em volta do Covadonga («un blanco»)
    const tg = ease(t, T.blanco - 0.05, T.blanco + 0.3) * (1 - ease(t, C7 - 0.6, C7 - 0.1));
    if (tg > 0.01) out.push(<G key="tg" p={[COV[0], 0.1, COV[2]]} sc={[tg, 1, tg]}>{[3.6, 6.2, 8.8].map((r, i) => <mesh key={i} rotation={[-PI / 2, 0, t * 0.6 * (i % 2 ? 1 : -1)]} material={mat(i % 2 ? "#ffffff" : "#e0262b", { emissive: i % 2 ? "#ffffff" : "#ff2020", ei: 0.6 })}><torusGeometry args={[r, 0.32, 6, 48]} /></mesh>)}
      {[0, 1, 2, 3].map((i) => <Box key={"c" + i} s={[2.4, 0.2, 0.36]} p={[Math.cos(i * PI / 2) * 10.2, 0, Math.sin(i * PI / 2) * 10.2]} r={[0, -i * PI / 2, 0]} c="#e0262b" o={{ emissive: "#ff2020", ei: 0.6 }} cast={false} />)}</G>);
    SHOTS.forEach((s, i) => {
      const f = prog(t, s, s + 0.14), u = ease(t, s, s + 0.3) * (1 - ease(t, s + 0.5, s + 1.5)), w = prog(t, s + 0.12, s + 0.9);
      const gun = toWorld(b.p, b.yaw, [-2 + i * 2, 1.0, -1.7], 1.15), hit = toWorld(COV, COV_YAW, [-2.6 + i * 2.2, 0, -2.2], 1.1);
      if (f > 0 && f < 1) out.push(<Sph key={"f" + i} rad={0.9 * (1 - f) + 0.3} p={gun} c="#ffd84a" o={{ emissive: "#ff9a20", ei: 1.6 }} cast={false} ws={8} hs={6} />);
      if (u > 0.01) out.push(<Sph key={"s" + i} rad={1.3} p={[gun[0], gun[1] + 0.6 * u, gun[2]]} sc={0.4 + u * 1.3} c="#f2f2f2" cast={false} ws={8} hs={6} />);
      if (w > 0 && w < 1) out.push(<Cyl key={"w" + i} rt={0.35} rb={0.6} h={3 * Math.sin(w * PI)} p={[hit[0], 1.5 * Math.sin(w * PI), hit[2]]} c="#f2fbff" cast={false} seg={8} />);
    });
    // ganchos de abordagem e a prata passando de um navio ao outro
    const gr = ease(t, T.capturo + 0.15, T.capturo + 0.45);
    if (gr > 0.01) [-2, 0, 2].forEach((x, i) => { const a = toWorld(COV, COV_YAW, [x, 1.75, 1.3], 1.1), z = toWorld(b.p, b.yaw, [x, 1.75, -1.3], 1.15), m: V3 = [lerp(a[0], z[0], gr), lerp(a[1], z[1], gr), lerp(a[2], z[2], gr)]; out.push(<Pipe key={"g" + i} a={a} b={m} rad={0.05} c="#2a1a10" cast={false} />); });
    [0, 1, 2].forEach((i) => { const u = prog(t, T.millon + 0.05 + i * 0.32, T.millon + 0.65 + i * 0.32); if (u <= 0 || u >= 1) return;
      const a = toWorld(COV, COV_YAW, [-1 + i, 2.0, 0], 1.1), z = toWorld(b.p, b.yaw, [1 - i, 2.0, 0], 1.15);
      out.push(<G key={"ch" + i} p={[lerp(a[0], z[0], u), lerp(a[1], z[1], u) + Math.sin(u * PI) * 2.6, lerp(a[2], z[2], u)]} r={[u * 3, 0, u * 2]} sc={1.7}><Box s={[0.85, 0.55, 0.6]} c="#6b3a1a" /><Box s={[0.75, 0.1, 0.5]} p={[0, 0.3, 0]} c={SILVER} o={{ metal: 0.7, rough: 0.3, emissive: "#ffffff", ei: 0.3 }} /></G>); });
  }
  // 1815: o último galeão solta as velas no «zarpó» e parte ao entardecer
  if (t >= X.ultimo - 0.02 && t < X.hist) { const l = lastShip(t); out.push(<Galleon key="u" p={l.p} yaw={0} t={t} sc={1.1} sail={0.1 + 0.9 * l.sail} wind={l.sail} />); }
  if (t >= X.hist - 0.02) { const a = alongQ(TQ, finalU(t)); out.push(<Galleon key="fin" p={a.p} yaw={a.yaw} t={t} sc={2.4} wind={1} cargo={1} />); }
  return <G>{out}</G>;
};
const Friar: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.b1 + 0.25 && t < C2 + 0.02)) return null;
  const s = cebuShip(t), up = ease(t, T.b1 + 0.25, T.b1 + 0.75), p = toWorld([s.x, 0.12 * Math.sin(t * 1.8 + s.x) - 1.5 * (1 - up), CEBU_Z], s.yaw, [1.4, 1.62, 0.5]);
  // lâmpada ao lado da cabeça (à direita na tela): acima dela o carimbo «¡CON INGENIO!» a cobria
  return <G><Worker p={p} yaw={-0.4} pose={poseOf(t < T.c1 ? "think" : t < T.fraile ? "cheer" : "present", t)} t={t} c={COSTUMES.fraile} scale={0.8} /><Bulb t={t} p={[p[0] + 0.5, p[1] + 1.5, p[2] + 0.34]} /></G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const cs = t >= X.cebu && t < C2 && !tryOn(t) ? cebuShip(t) : null, r = t >= X.vientos - 0.05 && t < C3 + 0.05 ? shipOnRoute(t) : null;
  const seaOn = t >= X.p2 - 0.05 && t < X.p4 + 0.05;
  return (
    <>
      <Sky top="#3a8ee0" mid="#8fc8f0" low="#f2f6f4" />
      <Dusk t={t} />
      <Clouds t={t} n={8} y={60} />
      <Map /><Ports />
      {seaOn ? <Whitecaps x={[SX - 45, SX + 45]} z={[SZ - 45, SZ + 45]} n={700} seed={5} /> : null}
      <Route pts={OUT} u={built(t) || (t >= C3 && t < X.p2) ? 1 : 0} c="#ffffff" />
      <Route pts={TORNA} u={built(t) ? 1 : t >= C2 && t < X.p2 ? Math.min(1, routeU(t) + 0.14) * (t > T.norte - 0.3 ? 1 : 0.0) : 0} c="#ffd34a" t={t} pulse={t >= C3 && t < X.p2 ? 1.6 : 0} />
      {/* Cebu: o vento que levou o barco para o oeste e agora sopra contra */}
      {cs ? <Arrows t={t} z={CEBU_Z} dir={-1} y={3.2} k={0.55} x0={cs.x - 12} x1={cs.x + 16} n={8} v={0.32} dz={6.4} dy={1.6}
        on={ease(t, X.cebu + 0.05, X.cebu + 0.45) * (1 - ease(t, C1 + 0.4, T.ningun + 0.5)) + ease(t, T.viento - 0.3, T.viento + 0.3) * (1 - ease(t, T.c1, T.fraile))} c="#ffffff" /> : null}
      {/* mapa das tentativas: o vento dos trópicos sopra para o oeste e devolve os barcos */}
      {tryOn(t) ? <Arrows t={t} z={13.5} dir={-1} y={3} k={1.5} x0={-16} x1={36} n={10} v={0.34} dz={15} dy={0.8} on={ease(t, T.porque - 0.3, T.porque + 0.15)} c="#ffffff" /> : null}
      {/* o circuito: alísios para o oeste na volta pelo sul */}
      {t >= C3 && t < X.p2 ? <Arrows t={t} z={19} dir={-1} y={2.5} k={1.3} x0={-12} x1={34} n={8} v={0.3} dz={9} dy={0.6} on={ease(t, C3 + 0.55, C3 + 0.9)} c="#ffffff" /> : null}
      <Fireworks t={t} /><Rainbow t={t} />
      {/* tornaviaje: ventos do oeste e a Kuroshio empurrando o barco para o leste */}
      {r ? <PushArrows t={t} p={r.p} yaw={r.yaw} on={ease(t, T.vientos, T.vientos + 0.4) * (1 - ease(t, C3 - 0.5, C3))} c="#9ff0a0" k={1.0} /> : null}
      <Arrows t={t} z={-47} dir={1} x0={-14} x1={36} n={9} v={0.12} dz={5} on={ease(t, T.vientos - 0.2, T.vientos + 0.4) * (t < X.p2 ? 1 : 0)} c="#9ff0a0" />
      <Kuroshio t={t} on={ease(t, T.corriente - 0.2, T.corriente + 0.5) * (1 - ease(t, C3, C3 + 0.6)) * (t < X.p2 ? 1 : 0)} />
      <Fleet t={t} /><Deck t={t} /><Friar t={t} /><Shipyard t={t} /><Market t={t} /><Mine t={t} /><Mint t={t} /><CoinArcs t={t} /><Trade t={t} />
      <SunMoon t={t} /><Storm t={t} />
      <Rain t={t} c={SEA_SCENE} a={C4 - 0.05} b={T.galeonT + 0.4} n={80} w={14} />
      <Rain t={t} c={SEA_SCENE} a={T.chubasco - 0.35} b={T.tinajasT + 0.6} n={60} w={7} />
      <StormCloud p={[SX + lerp(26, 2, ease(t, T.chubasco - 0.6, T.chubasco + 0.1)) + 40 * ease(t, T.tinajasT, T.tinajasT + 1.4), 13, SZ - 2]} k={t > T.chubasco - 0.7 && t < X.p4 ? 1 : 0} />
    </>
  );
};
