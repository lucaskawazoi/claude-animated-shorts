// Mundo do E10: o Pacífico como tabuleiro de brinquedo, visto de cima com o norte para cima da tela (z negativo = norte).
// Filipinas (x≈-24, z -12..20), Japão (z -38..-50), costa da China (x<-45), México (x 37..67) com Acapulco e a mina de prata,
// Potosí ao sul (z≈34). Rota de ida pelo sul (alísios para o oeste) e o tornaviaje pelo norte (ventos do oeste + Kuroshio).
// Cenas de perto nos mesmos lugares: estaleiro em Luzon, porão com tinajas, mercado de Manila, mina, a captura do Covadonga.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Palms, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { CUTS, T } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.cebu - 0.12;
const SEA = "#2f86c8", LAND = "#7fb85a", SAND = "#ecd9a0", WOOD = "#7a4a2a", MOLAVE = "#5a3420", SILVER = "#d8dde4";

// ---------------------------------------------------------------- o mapa
/** espuma de ondas espalhada: sem textura no mar a régua não vê a câmera se mexer */
const Whitecaps: React.FC = () => {
  const m = useMemo(() => {
    const n = 1400, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 0.25), mat("#e8f6ff", { emissive: "#bfe6ff", ei: 0.3 }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(lerp(-90, 110, rnd(i * 3 + 1)), 0.05, lerp(-90, 70, rnd(i * 3 + 2))); o.rotation.y = (rnd(i * 3 + 3) - 0.5) * 0.6; o.scale.setScalar(lerp(0.6, 2.2, rnd(i + 7))); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.castShadow = false; im.receiveShadow = false; return im;
  }, []);
  return <primitive object={m} />;
};
const Isle: React.FC<{ p: V3; r: [number, number]; rot?: number; c?: string }> = ({ p, r, rot = 0, c = LAND }) => (
  <G p={p} r={[0, rot, 0]}><Sph rad={1} sc={[r[0] + 0.6, 0.5, r[1] + 0.6]} c={SAND} ws={20} hs={8} /><Sph rad={1} p={[0, 0.12, 0]} sc={[r[0], 0.7, r[1]]} c={c} ws={20} hs={8} /></G>
);
const Map: React.FC = () => (
  <G>
    <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(SEA, { rough: 0.35 })}><planeGeometry args={[900, 900]} /></mesh>
    <Whitecaps />
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
export const along = (pts: V3[], u: number): { p: V3; yaw: number } => {
  const q = pathPts(pts, 200), i = Math.min(198, Math.floor(clamp(u) * 199)), a = q[i], b = q[i + 1];
  return { p: [a[0], 0, a[2]], yaw: -Math.atan2(b[2] - a[2], b[0] - a[0]) };
};
const Route: React.FC<{ pts: V3[]; u: number; c: string }> = ({ pts, u, c }) => {
  const q = useMemo(() => pathPts(pts, 60), [pts]); if (u <= 0.01) return null;
  return <G>{q.map((p, i) => (i / 59 <= u ? <Box key={i} s={[1.1, 0.2, 1.1]} p={p} c={c} o={{ emissive: c, ei: 0.6 }} cast={false} /> : null))}</G>;
};
/** setas de vento: alísios (oeste) no sul, ventos do oeste (leste) no norte */
const Arrows: React.FC<{ t: number; z: number; dir: 1 | -1; on: number; c: string; y?: number; k?: number; x0?: number; x1?: number }> = ({ t, z, dir, on, c, y = 2, k = 1, x0 = -14, x1 = 34 }) => on <= 0.01 ? null : (
  <G>{Array.from({ length: 6 }, (_, i) => { const x = lerp(x0, x1, fract(i / 6 + dir * t * 0.06)); return <G key={i} p={[x, y + (i % 3) * 1.2, z + (i % 2) * 2]} r={[0, dir > 0 ? 0 : PI, 0]} sc={on * k}><Box s={[5, 0.4, 0.8]} c={c} o={{ emissive: c, ei: 0.5 }} cast={false} /><Cone rad={1.1} h={2} seg={3} p={[3.2, 0, 0]} r={[0, 0, -PI / 2]} c={c} o={{ emissive: c, ei: 0.5 }} cast={false} /></G>; })}</G>
);
const Kuroshio: React.FC<{ on: number }> = ({ on }) => {
  const q = useMemo(() => pathPts([[-18, 0, 4], [-14, 0, -20], [-4, 0, -42], [22, 0, -44]], 50), []); if (on <= 0.01) return null;
  return <G>{q.map((p, i) => (i / 49 <= on ? <Box key={i} s={[2.4, 0.1, 2.4]} p={[p[0], 0.08, p[2]]} c="#7fd8ff" o={{ emissive: "#4ac0ff", ei: 0.5, opacity: 0.8 }} cast={false} /> : null))}</G>;
};

// ---------------------------------------------------------------- galeão (frente = +x local)
export const Galleon: React.FC<{ p: V3; yaw: number; t: number; sc?: number; flag?: number; cut?: boolean; jars?: number; hang?: number; fill?: number; enemy?: boolean; tilt?: number }> = ({ p, yaw, t, sc = 1, flag = 1, cut = false, jars = 0, hang = 0, fill = 0, enemy = false, tilt = 0 }) => {
  const H = enemy ? "#3a3a44" : "#8a5a32", sail = "#f6efe0";
  return (
    <G p={[p[0], p[1] + 0.12 * Math.sin(t * 1.8 + p[0]), p[2]]} r={[0.03 * Math.sin(t * 1.3), yaw, tilt + 0.04 * Math.sin(t * 1.6)]} sc={sc}>
      <Box s={[8, 1.6, 2.6]} p={[0, 0.8, 0]} c={H} vis={!cut} /><Box s={[8, 1.6, 0.25]} p={[0, 0.8, -1.2]} c={H} vis={cut} /><Box s={[8, 0.3, 2.6]} p={[0, 0.15, 0]} c={H} vis={cut} />
      <Cone rad={1.35} h={2.4} seg={4} p={[5.1, 0.9, 0]} r={[0, 0, -PI / 2]} c={H} />
      <Box s={[2.2, 1.8, 2.7]} p={[-3.2, 2.4, 0]} c={enemy ? "#2a2a33" : "#6b4423"} /><Box s={[1.6, 1.0, 2.6]} p={[3.4, 2.0, 0]} c={enemy ? "#2a2a33" : "#6b4423"} />
      <Box s={[8.2, 0.12, 2.7]} p={[0, 1.62, 0]} c="#c08a4a" cast={false} vis={!cut} />
      {[-2, 0, 2].map((x) => <Box key={x} s={[0.35, 0.3, 0.05]} p={[x, 1.0, 1.32]} c="#1c1410" cast={false} vis={!cut} />)}
      {[[-1.6, 5.2], [0.8, 6.2], [3.0, 4.6]].map(([x, h], i) => (
        <G key={i} p={[x, 1.6, 0]}>
          <Cyl rt={0.1} h={h} p={[0, h / 2, 0]} c="#5a3a20" seg={6} />
          {[0.45, 0.78].map((f, j) => <G key={j}><Box s={[0.12, 0.12, 3.4 - j * 0.8]} p={[0, h * f + 0.9, 0]} c="#5a3a20" /><Box s={[0.06, 1.6 - j * 0.3, 3.0 - j * 0.8]} p={[0.06, h * f, 0]} c={sail} />
            {!enemy && i === 1 && j === 0 ? <G p={[0.1, h * f, 0]}><Box s={[0.04, 0.16, 1.9]} r={[0.6, 0, 0]} c="#c8352a" cast={false} /><Box s={[0.04, 0.16, 1.9]} r={[-0.6, 0, 0]} c="#c8352a" cast={false} /></G> : null}</G>)}
          {/* tinajas penduradas nas vergas */}
          {hang > 0.01 ? [-1.2, 1.2].map((z, k) => <G key={k} p={[0.2, h * 0.45 + 0.9, z]} sc={hang}><Box s={[0.03, 0.8, 0.03]} p={[0, -0.4, 0]} c="#3a2a1a" cast={false} /><Sph rad={0.32} p={[0, -1.0, 0]} sc={[1, 1.25, 1]} c="#b0603a" ws={10} hs={8} /><Cyl rt={0.2} h={0.08} p={[0, -0.62, 0]} c={fill > 0.5 ? "#4aa8ff" : "#6b3a20"} seg={8} cast={false} /></G>) : null}
        </G>
      ))}
      {/* bandeira na popa */}
      <G p={[-4.2, 3.6, 0]} vis={flag > 0.02}><Cyl rt={0.05} h={2} p={[0, 0.2, 0]} c="#3a2a1a" seg={5} /><Box s={[0.04, 0.8 * flag, 1.2]} p={[0, 0.8 - (1 - flag) * 0.8, 0.6]} c={enemy ? "#c8352a" : "#f6efe0"} cast={false} />
        {!enemy ? <Box s={[0.05, 0.12, 1.2]} p={[0, 0.8 - (1 - flag) * 0.8, 0.6]} r={[0.5, 0, 0]} c="#c8352a" cast={false} vis={flag > 0.3} /> : null}</G>
      {/* porão cortado com tinajas */}
      {cut ? Array.from({ length: 18 }, (_, i) => { const k = clamp(jars * 1.4 - i / 18); if (k <= 0.01) return null; return <G key={i} p={[-3.2 + (i % 9) * 0.8, 0.3, -0.5 + Math.floor(i / 9) * 0.9]} sc={k}><Sph rad={0.38} p={[0, 0.48, 0]} sc={[1, 1.3, 1]} c={i % 3 ? "#c0703a" : "#a85a30"} ws={10} hs={8} /><Cyl rt={0.2} h={0.12} p={[0, 0.98, 0]} c="#6b3a20" seg={8} /></G>; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- cenas de perto
/** estaleiro em Luzon: cavername do casco que sobe, toras de molave */
const YARD = { x: -21, z: -9 };
const Shipyard: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b2 || t > T.p3 + 0.4) return null;
  const k = ease(t, T.barcos - 0.2, T.maderas + 0.6), planks = ease(t, T.maderas, T.galeonT);
  return (
    <G p={[YARD.x, 0.7, YARD.z]}>
      <Box s={[12, 0.3, 4]} p={[0, 0.15, 0]} c="#c9b07a" />
      {Array.from({ length: 9 }, (_, i) => { const u = clamp(k * 1.5 - i / 9); if (u <= 0.01) return null; const x = -4.4 + i * 1.1;
        return <G key={i} p={[x, 0.3, 0]} sc={[1, u, 1]}>{[-1, 1].map((s) => <Pipe key={s} a={[0, 0, 0]} b={[0, 2.6, s * 1.6]} rad={0.13} c={MOLAVE} seg={5} />)}</G>; })}
      <Box s={[9.6 * planks + 0.01, 0.3, 0.3]} p={[-4.4 + 4.8 * planks, 0.4, 0]} c={MOLAVE} />
      {[-1, 1].map((s) => <Box key={s} s={[9.6 * planks + 0.01, 1.2, 0.12]} p={[-4.4 + 4.8 * planks, 1.2, s * 1.0]} r={[s * 0.35, 0, 0]} c="#6b4423" />)}
      {[0, 1, 2].map((i) => <Cyl key={i} rt={0.35} h={5} p={[-3 + i * 0.75, 0.35, 3.2]} r={[0, 0, PI / 2]} c={MOLAVE} seg={8} />)}
      {[[-2, 2.6], [2.5, 2.4]].map(([x, z], i) => <Worker key={i} p={[x, 0.3, z]} yaw={PI} pose={poseOf("chisel", t + i * 0.4)} t={t} c={COSTUMES.marinero} prop="hammer" scale={1.0} mustache={i === 0} />)}
    </G>
  );
};
/** mercado de Manila: o mercador chinês com seda e porcelana; produtos europeus recusados, prata aceita */
const MKT = { x: -26, z: 1 };
const Market: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.p4 - 0.4 || t > T.b4 + 0.6) return null;
  const no = ease(t, T.europeos - 0.3, T.europeos + 0.2) * (1 - ease(t, T.plata0 - 0.2, T.plata0 + 0.3)), coins = ease(t, T.plata0 - 0.1, T.plata0 + 0.6);
  return (
    <G p={[MKT.x, 0.7, MKT.z]}>
      <Box s={[4, 1.1, 1.6]} p={[0, 0.55, 0]} c={WOOD} /><Box s={[4.4, 0.15, 2.4]} p={[0, 2.8, -0.2]} c="#c8352a" />{[-2, 2].map((x) => <Box key={x} s={[0.15, 2.8, 0.15]} p={[x, 1.4, -1.1]} c={WOOD} />)}
      {[["#c8352a", -1.4], ["#e8b030", -0.8], ["#2fa85a", -0.2]].map(([c, x], i) => <Box key={i} s={[0.5, 0.25 + i * 0.05, 1.0]} p={[x as number, 1.25, -0.1]} c={c as string} />)}
      {[0.6, 1.2, 1.7].map((x, i) => <G key={i} p={[x, 1.1, 0]}><Sph rad={0.28} p={[0, 0.3, 0]} sc={[1, 1.3, 1]} c="#f4f6fa" ws={10} hs={8} /><Cyl rt={0.1} h={0.25} p={[0, 0.72, 0]} c="#2f5fd0" seg={8} /></G>)}
      <Worker p={[0.2, 0, -1.4]} yaw={0} pose={poseOf(no > 0.5 ? "alarm" : coins > 0.5 ? "cheer" : "present", t)} t={t} c={COSTUMES.mercader} scale={1.15} />
      {/* caixote europeu recusado */}
      <G p={[-0.6, 1.1, 1.6]} vis={no > 0.02 && coins < 0.5}><Box s={[0.9, 0.7, 0.7]} p={[0, 0.35, 0]} c="#9a6a38" /><Cyl rt={0.3} h={0.6} p={[0.7, 0.3, 0]} c="#6b2a3a" seg={8} /></G>
      {/* pilha de moedas de prata */}
      {coins > 0.02 ? Array.from({ length: 10 }, (_, i) => <Cyl key={i} rt={0.28} h={0.06} p={[0.6 + (i % 2) * 0.1, 1.15 + i * 0.07 * coins, 1.2]} c={SILVER} o={{ metal: 0.8, rough: 0.25 }} seg={14} />) : null}
    </G>
  );
};
/** mina de prata no México + Potosí: veios brilham, carrinhos; prensa cunha moedas */
const Mine: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.b4 - 0.3 || t > T.realT + 0.6) return null;
  const glow = ease(t, T.minas - 0.2, T.mexico + 0.3), glow2 = ease(t, T.potosi - 0.2, T.potosi + 0.4), mint = ease(t, T.acunada - 0.2, T.acunada + 0.6);
  return (
    <G>
      {[[47, 2], [45, 36]].map(([x, z], j) => <G key={j}>{Array.from({ length: 5 }, (_, i) => <Box key={i} s={[0.4, 3, 0.2]} p={[x - 2.2 + i * 1.1, 3 + (i % 2) * 1.6, z + 4.6 - Math.abs(i - 2) * 0.4]} r={[0.5, 0, (rnd(i + j) - 0.5) * 0.8]} c={SILVER} o={{ emissive: "#ffffff", ei: 0.7 * (j ? glow2 : glow), metal: 0.6 }} cast={false} vis={(j ? glow2 : glow) > 0.05} />)}</G>)}
      <G p={[40.5, 0.7, 9]} sc={Math.max(0.01, mint)}>
        <Box s={[2.2, 0.4, 1.4]} p={[0, 0.2, 0]} c={WOOD} /><Box s={[0.3, 2.8, 0.3]} p={[-0.9, 1.4, 0]} c={WOOD} /><Box s={[0.3, 2.8, 0.3]} p={[0.9, 1.4, 0]} c={WOOD} />
        <Box s={[2.2, 0.3, 0.4]} p={[0, 2.8, 0]} c={WOOD} /><Cyl rt={0.12} h={1.8} p={[0, 1.9 - 0.4 * Math.max(0, Math.sin(t * 6)), 0]} c="#5a5a5a" seg={8} />
        {Array.from({ length: 12 }, (_, i) => { const u = fract(t * 0.9 + i / 12); return <Cyl key={i} rt={0.26} h={0.06} p={[1.3 + u * 2.6, 0.45 + Math.sin(u * PI) * 1.2, (rnd(i) - 0.5) * 0.8]} r={[u * 6, 0, u * 4]} c={SILVER} o={{ metal: 0.8, rough: 0.25 }} seg={14} cast={false} />; })}
      </G>
    </G>
  );
};
/** moedas voando de Acapulco a Manila e à China (o meio mundo) */
const CoinArcs: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.medio - 0.6, T.medio + 0.2) * (1 - ease(t, T.p5 - 0.2, T.p5 + 0.4)); if (on <= 0.01) return null;
  const legs: [V3, V3][] = [[[38, 0, 10], [-20, 0, 2]], [[-24, 0, 0], [-50, 0, -6]]];
  return <G>{legs.map(([a, b], j) => Array.from({ length: 8 }, (_, i) => { const u = fract(t * 0.35 + i / 8 + j * 0.3); return <Cyl key={j * 10 + i} rt={1.1} h={0.25} p={[lerp(a[0], b[0], u), 2 + Math.sin(u * PI) * (j ? 8 : 18), lerp(a[2], b[2], u)]} r={[PI / 2.6, t * 3, 0]} c={SILVER} o={{ metal: 0.8, rough: 0.25, emissive: "#ffffff", ei: 0.25 }} seg={16} cast={false} sc={on} />; }))}</G>;
};
/** comércio mundial: linhas acesas ligando os portos e seguindo para a China e a Europa */
const Trade: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.historiadores - 0.6, T.mundial); if (on <= 0.01) return null;
  return <G><Route pts={OUT} u={on} c="#ffd34a" /><Route pts={TORNA} u={on} c="#ffd34a" /><Route pts={[[-24, 0, -2], [-46, 0, -8]]} u={on} c="#ff8a4a" /><Route pts={[[52, 0, 0], [80, 0, 0]]} u={on} c="#ff8a4a" /></G>;
};
const Ports: React.FC = () => (
  <G>
    <G p={[-23, 0.7, -4]}>{[[0, 0], [1.6, 0.6], [-1.4, 1.2], [0.8, -1.6]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Box s={[1.2, 1, 1]} p={[0, 0.5, 0]} c="#f2ede0" /><Cone rad={0.95} h={0.7} seg={4} p={[0, 1.35, 0]} r={[0, PI / 4, 0]} c="#c8553d" /></G>)}<Box s={[1.4, 2.6, 1.4]} p={[-2.6, 1.3, -1]} c="#f2ede0" /><Cone rad={0.6} h={1.2} seg={8} p={[-2.6, 3.2, -1]} c="#c8553d" /></G>
    <G p={[39.5, 0.7, 12]}>{[[0, 0], [1.4, 1], [0.6, -1.4]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Box s={[1.2, 1, 1]} p={[0, 0.5, 0]} c="#efe0c4" /><Cone rad={0.95} h={0.7} seg={4} p={[0, 1.35, 0]} r={[0, PI / 4, 0]} c="#b0603a" /></G>)}</G>
    <Palms spots={[[-20, 0.7, 6], [-27, 0.7, 3], [39, 0.7, 16], [-23, 0.7, 13]]} t={0} />
  </G>
);
const Rain: React.FC<{ t: number; c: V3 }> = ({ t, c }) => {
  if (!(t > T.chubasco - 0.4 && t < T.tinajasT + 0.5)) return null;
  return <G>{Array.from({ length: 40 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.07, 0.9, 0.07]} p={[c[0] + lerp(-8, 8, rnd(i + 1)), 14 - u * 14, c[2] + lerp(-6, 6, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; })}</G>;
};
export const dusk = (t: number) => ease(t, T.ultimo + 0.2, T.y1815 + 0.8) * (1 - ease(t, T.historiadores + 0.3, T.mundial + 0.6));
const Dusk: React.FC<{ t: number }> = ({ t }) => { const n = dusk(t); if (n <= 0.01) return null; return <mesh><sphereGeometry args={[560, 24, 16]} /><meshBasicMaterial color="#ff8a4a" side={1} transparent opacity={0.55 * n} fog={false} depthWrite={false} /></mesh>; };

// ---------------------------------------------------------------- navios no tempo
export const SEA_SCENE: V3 = [8, 0, -44]; // o galeão sozinho em mar aberto (meses; tinajas; chuva)
const Fleet: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  // gancho: o galeão no mapa, grande, fazendo a volta
  if (built(t)) { if (t < T.unio + 0.3) out.push(<Galleon key="h0" p={[lerp(-4, 10, t / T.unio), 0, -36]} yaw={0} t={t} sc={1.4} />); else { const a = along(TORNA, (t / T.cebu) * 0.5 + 0.2); out.push(<Galleon key="h" p={a.p} yaw={a.yaw} t={t} sc={1.4} />); } }
  // Cebu 1565: ancorado; tenta voltar ao leste e o vento empurra de volta
  if (t > T.cebu - 0.12 && t < T.norte - 0.3) { const go = ease(t, T.ningun, T.volver + 1.2), back = ease(t, T.viento, T.contra + 0.4); out.push(<Galleon key="c" p={[-15 + go * 9 - back * 7, 0, 10]} yaw={back > 0.5 ? PI : 0} t={t} sc={1.0} tilt={0.12 * back * Math.sin(t * 5)} />); }
  // tornaviaje: o galeão segue a rota desenhada
  if (t > T.norte - 0.3 && t < T.p2 + 0.2) { const a = along(TORNA, ease(t, T.norte, T.tornaT + 0.8)); out.push(<Galleon key="r" p={a.p} yaw={a.yaw} t={t} sc={1.4} />); }
  // mar aberto: meses, sede, tinajas, chuva
  if (t > T.p2 && t < T.b2 + 0.2) out.push(<Galleon key="m" p={SEA_SCENE} yaw={0.1} t={t} />);
  if (t > Math.min(T.p3 - 0.2, CUTS[3] - 0.05) && t < T.p4 - 0.5) out.push(<Galleon key="j" p={SEA_SCENE} yaw={0.1} t={t} cut={t > T.b3 && t < T.colgadas + 0.2} jars={ease(t, T.miles - 0.4, T.miles + 0.8)} hang={ease(t, T.colgadas - 0.2, T.colgadas + 0.5)} fill={ease(t, T.chubasco, T.chubasco + 1.2)} />);
  // 1743: o Centurion captura o Covadonga perto das Filipinas
  if (t > T.p5 - 0.3 && t < T.historiadores) {
    const flag = 1 - ease(t, T.capturo + 0.6, T.millon), shots = [T.capturo - 0.4, T.capturo + 0.1, T.capturo + 0.6];
    out.push(<Galleon key="cov" p={[-8, 0, 2]} yaw={PI * 0.9} t={t} sc={1.1} flag={flag} />);
    const e = ease(t, T.blanco - 0.3, T.guerra + 0.6);
    out.push(<Galleon key="bri" p={[lerp(8, -1, e), 0, lerp(-6, -4, e)]} yaw={PI * 0.85} t={t} sc={1.15} enemy />);
    shots.forEach((s, i) => { const u = ease(t, s, s + 0.3) * (1 - ease(t, s + 0.4, s + 1.4)); if (u > 0.01) out.push(<Sph key={"s" + i} rad={1.6} p={[-2.2 + i * 0.8, 1.8 + u, -2.2]} sc={0.5 + u * 1.5} c="#f2f2f2" cast={false} ws={8} hs={6} />); });
  }
  // 1815: o último galeão parte ao entardecer
  if (t > T.ultimo - 0.3 && t < T.historiadores + 0.3) out.push(<Galleon key="u" p={[lerp(-20, -8, ease(t, T.ultimo, T.historiadores)), 0, 9]} yaw={-0.3} t={t} sc={Math.max(0.01, 1.1 * ease(t, T.ultimo - 0.3, T.ultimo + 0.9))} />);
  return <G>{out}</G>;
};
/** marinheiros com sede no convés (o problema da água) */
const Thirst: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p3 - 0.2 && t < T.b3 + 0.4)) return null;
  const list = [-2, -0.6, 0.8, 2.2].map((x, i) => ({ p: [SEA_SCENE[0] + x, 1.75, SEA_SCENE[2] + (i % 2) * 0.6 - 0.3] as V3, yaw: 1.2 + i * 0.3, pose: (i % 2 ? "think" : "alarm") as PoseName, ph: i * 0.3 }));
  return <G><Crowd list={list} t={t} c={COSTUMES.marinero} scale={0.7} /><G p={[SEA_SCENE[0] + 3.2, 1.75, SEA_SCENE[2]]}><Cyl rt={0.4} rb={0.35} h={0.9} p={[0, 0.45, 0]} c={WOOD} seg={10} /><Cyl rt={0.36} h={0.05} p={[0, 0.88, 0]} c="#3a2a1a" seg={10} /></G></G>;
};
const Friar: React.FC<{ t: number }> = ({ t }) => (t > T.fraile - 0.3 && t < T.norte + 0.6 ? <Worker p={[-11.5, 1.9, 10.4]} yaw={0.4} pose={poseOf(t > T.urdaneta + 0.3 ? "point" : "present", t)} t={t} c={COSTUMES.fraile} scale={0.8} /> : null);

export const World: React.FC<{ t: number }> = ({ t }) => {
  const mapOn = 1;
  return (
    <>
      <Sky top="#3a8ee0" mid="#8fc8f0" low="#f2f6f4" />
      <Dusk t={t} />
      <Clouds t={t} n={8} y={60} />
      <Map /><Ports />
      <Route pts={OUT} u={built(t) ? 1 : 0} c="#ffffff" />
      <Route pts={TORNA} u={built(t) ? 1 : ease(t, T.norte - 0.2, T.este + 0.4) * (t < T.p2 + 0.6 ? 1 : 0)} c="#ffd34a" />
      <Arrows t={t} z={3} dir={-1} y={6} k={0.45} x0={-24} x1={2} on={ease(t, T.viento - 0.4, T.viento + 0.3) * (1 - ease(t, T.c1, T.fraile))} c="#ffffff" />
      <Arrows t={t} z={-48} dir={1} on={ease(t, T.vientos - 0.2, T.vientos + 0.4) * (1 - ease(t, T.p2, T.p2 + 0.6))} c="#9ff0a0" />
      <Kuroshio on={ease(t, T.corriente - 0.2, T.este + 0.4) * (1 - ease(t, T.p2, T.p2 + 0.6))} />
      <Fleet t={t} /><Thirst t={t} /><Friar t={t} /><Shipyard t={t} /><Market t={t} /><Mine t={t} /><CoinArcs t={t} /><Trade t={t} /><Rain t={t} c={SEA_SCENE} />
      {mapOn ? null : null}
    </>
  );
};
