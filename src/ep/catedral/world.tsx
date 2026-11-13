// Mundo do E8: Notre-Dame de brinquedo na Île de la Cité. Nave ao longo de x (fachada oeste em x=-13, abside em x=16),
// paredes em z=±4,5 (altura 13), 7 tramos de 4. Praça (parvis) a oeste com as demonstrações e o Sena em z=±24.
// Pré-crítica de 13/11 (defeitos do E6 v2): cada solução FAZ o mecanismo no verbo, de perto — igreja românica que abre as
// paredes, arco redondo que se abre sob o peso x arco ogival com o peso descendo pelos pilares, um tramo de abóbada com a laje
// que racha o muro inteiro e depois as nervuras que viram «mesa sobre suas patas», arcobotante que cresce, segura a parede e
// leva o empurrão até o chão, grua com homens andando dentro, eixo que enrola a corda e a pedra subindo, vitral que se tinge;
// no fim os carpinteiros lavram a machado na frente da catedral queimada.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, pipeXf, rnd, vlerp } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Worker, poseOf } from "../../toy/worker";
import type { Pose } from "../../toy/worker";
import { AXE_P, CUTS, T, WINS } from "./cues";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
export const built = (t: number) => t < T.paris - 0.12;
const ST = "#e9e1cf", ST2 = "#d8cdb5", DARK = "#2a2630", ROOF = "#5b6670", OAK = "#b07a42", SLAB = "#6f7176";
const X0 = -12, X1 = 16, ZW = 4.5, HW = 13, BAYS = 7, BW = 4;
const bayX = (i: number) => X0 + i * BW;
const q = (x: number, n = 10) => Math.round(clamp(x) * n) / n; // opacidade/cor em degraus: poucos materiais no cache

// ---------------------------------------------------------------- setas e pontos de peso
type Col = { c: string; e: string };
const RED: Col = { c: "#ff3b30", e: "#ff2a1a" }, GREEN: Col = { c: "#3fcf6a", e: "#1fa84a" }, GOLD: Col = { c: "#ffc93a", e: "#ffb000" };
/** seta de a até b (cresce com k) */
const Arrow: React.FC<{ a: V3; b: V3; k?: number; rad?: number; col?: Col }> = ({ a, b, k = 1, rad = 0.2, col = RED }) => {
  if (k <= 0.02) return null;
  const e = vlerp(a, b, Math.min(1, k)), d: V3 = [e[0] - a[0], e[1] - a[1], e[2] - a[2]], len = Math.hypot(d[0], d[1], d[2]);
  if (len < 0.05) return null;
  const u: V3 = [d[0] / len, d[1] / len, d[2] / len], hl = Math.min(len * 0.55, rad * 3.6);
  const n: V3 = [e[0] - u[0] * hl, e[1] - u[1] * hl, e[2] - u[2] * hl], o = { emissive: col.e, ei: 0.8 };
  return (
    <G>
      {len - hl > 0.04 ? <Pipe a={a} b={n} rad={rad} c={col.c} o={o} seg={8} cast={false} /> : null}
      <Cone rad={rad * 2.4} h={hl} seg={10} p={[n[0] + (u[0] * hl) / 2, n[1] + (u[1] * hl) / 2, n[2] + (u[2] * hl) / 2]} r={pipeXf(a, e).r} c={col.c} o={o} cast={false} />
    </G>
  );
};
/** ponto ao longo de uma polilinha (u de 0 a 1 pelo comprimento) */
const along = (pts: V3[], u: number): V3 => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return vlerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 0); d -= L[i]; }
  return pts[pts.length - 1];
};
/** o peso correndo por um caminho: n bolinhas brilhantes em ciclo */
const Flow: React.FC<{ t: number; pts: V3[]; k: number; n?: number; speed?: number; col?: Col; r?: number; ph?: number }> = ({ t, pts, k, n = 4, speed = 0.8, col = GREEN, r = 0.2, ph = 0 }) =>
  k <= 0.02 ? null : (
    <G>{Array.from({ length: n }, (_, i) => <Sph key={i} rad={r * Math.min(1, k * 1.6)} p={along(pts, fract(t * speed + i / n + ph))} c={col.c} o={{ emissive: col.e, ei: 1.1 }} cast={false} ws={8} hs={6} />)}</G>
  );
/** polilinha desenhada até a fração u (nervura que cresce) */
const Grow: React.FC<{ pts: V3[]; u: number; rad: number; c: string; o?: object }> = ({ pts, u, rad, c, o }) => {
  if (u <= 0.01) return null;
  const segs = pts.length - 1, f = clamp(u) * segs, out: React.ReactNode[] = [];
  for (let i = 0; i < segs && i < f; i++) out.push(<Pipe key={i} a={pts[i]} b={vlerp(pts[i], pts[i + 1], Math.min(1, f - i))} rad={rad} c={c} o={o} seg={7} />);
  return <G>{out}</G>;
};
const mix = (a: string, b: string, u: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), q(u, 6)).getHexString();

// ---------------------------------------------------------------- arcos (redondo ou ogival) como polígono extrudado
const archShape = (S: number, th: number, pointed: boolean, n = 14) => {
  const pts: [number, number][] = [];
  if (pointed) {
    const Ro = S + th, ao = Math.acos(-S / (2 * Ro));
    for (let i = 0; i <= n; i++) { const a = lerp(PI, ao, i / n); pts.push([S / 2 + Ro * Math.cos(a), Ro * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = lerp(PI, ao, i / n); pts.push([-(S / 2 + Ro * Math.cos(a)), Ro * Math.sin(a)]); }
    const ai = (2 * PI) / 3;
    for (let i = 0; i <= n; i++) { const a = lerp(PI, ai, i / n); pts.push([-(S / 2 + S * Math.cos(a)), S * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = lerp(PI, ai, i / n); pts.push([S / 2 + S * Math.cos(a), S * Math.sin(a)]); }
  } else {
    for (let i = 0; i <= n * 2; i++) { const a = lerp(PI, 0, i / (n * 2)); pts.push([(S / 2 + th) * Math.cos(a), (S / 2 + th) * Math.sin(a)]); }
    for (let i = 0; i <= n * 2; i++) { const a = lerp(0, PI, i / (n * 2)); pts.push([(S / 2) * Math.cos(a), (S / 2) * Math.sin(a)]); }
  }
  const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s;
};
/** abertura em arco ogival (silhueta cheia): janela, portal */
const lancet = (w: number, h: number) => {
  const s = new THREE.Shape(), r = w, cy = h - w * Math.sin(PI / 3);
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, cy);
  s.absarc(-w / 2, cy, r, 0, PI / 3, false); s.absarc(w / 2, cy, r, (2 * PI) / 3, PI, false); s.lineTo(-w / 2, 0); return s;
};
const Arch: React.FC<{ S: number; th: number; pointed: boolean; d: number; c: string; p?: V3; r?: V3; sc?: V3 | number; o?: object }> = ({ S, th, pointed, d, c, p, r, sc, o }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(archShape(S, th, pointed), { depth: d, bevelEnabled: false }), [S, th, pointed, d]);
  return <G p={p} r={r} sc={sc}><mesh geometry={geo} position={[0, 0, -d / 2]} castShadow receiveShadow material={mat(c, o ?? {})} /></G>;
};
const Lancet: React.FC<{ w: number; h: number; c: string; p?: V3; r?: V3; o?: object; vis?: boolean }> = ({ w, h, c, p, r, o, vis = true }) => {
  const geo = useMemo(() => new THREE.ShapeGeometry(lancet(w, h), 8), [w, h]);
  return <mesh geometry={geo} position={p} rotation={r} visible={vis} material={mat(c, { side: "double", ...(o ?? {}) })} />;
};

// ---------------------------------------------------------------- ilha, Sena, casas de Paris
const City: React.FC = () => {
  const hs = useMemo(() => Array.from({ length: 70 }, (_, i) => { const side = i % 2 ? 1 : -1; return { x: lerp(-90, 80, rnd(i * 3 + 1)), z: side * lerp(32, 70, rnd(i * 3 + 2)), w: lerp(4, 7, rnd(i + 3)), h: lerp(5, 9, rnd(i + 9)) }; }), []);
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#7fae5a")}><planeGeometry args={[600, 600]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0, 0.03, s * 24]} rotation={[-PI / 2, 0, 0]} material={mat("#4f8fc0", { rough: 0.35 })}><planeGeometry args={[400, 10]} /></mesh>)}
      <mesh position={[-6, 0.02, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#d6d0c4")}><planeGeometry args={[70, 38]} /></mesh>
      {/* lajotas da praça: textura barata para a régua ver a câmera andar */}
      {Array.from({ length: 13 }, (_, i) => <Box key={i} s={[0.12, 0.02, 38]} p={[-40 + i * 5.4, 0.03, 0]} c="#c8c1b3" cast={false} />)}
      {hs.map((h, i) => <G key={i} p={[h.x, 0, h.z]}><Box s={[h.w, h.h, h.w * 0.9]} p={[0, h.h / 2, 0]} c={i % 3 ? "#efe6d6" : "#e6dcc6"} /><Cone rad={h.w * 0.72} h={2.2} seg={4} p={[0, h.h + 1.1, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.9]} c="#5d6b7a" /></G>)}
      <Trees spots={[[-40, 0, 14], [-40, 0, -14], [26, 0, 14], [26, 0, -14], [30, 0, 0], [-44, 0, 0]]} c={["#3f9446", "#58ad52"]} />
    </G>
  );
};

// ---------------------------------------------------------------- gancho: o primeiro pedreiro, fantasma, põe a pedra e some
const GH: V3 = [-18, 0, 7];
const GHOST = { ...COSTUMES.mason, top: "#c9c9c9", kilt: "#c9c9c9", bottom: "#b0b0b0", skin: "#d8d8d8", hatC: "#a8a8a8" };
const Ghost: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.quienes - 0.2 && t < T.paris)) return null;
  const k = ease(t, T.quienes - 0.15, T.quienes + 0.25) * (1 - ease(t, T.nunca + 0.35, T.nunca + 1.3));
  const lay = ease(t, T.quienes + 0.2, T.primera + 0.35), up = ease(t, T.nunca + 0.1, T.nunca + 1.3);
  const yaw = lerp(-0.82, 0.9, ease(t, T.nunca - 0.2, T.nunca + 0.4));
  return (
    <G>
      {k > 0.01 ? <Worker p={[GH[0], up * 1.8, GH[2]]} yaw={yaw} pose={poseOf(t < T.primera + 0.4 ? "present" : t < T.nunca ? "point" : "think", t)} t={t} c={GHOST} scale={1.4 * k} /> : null}
      {/* a primeira pedra: desce das mãos até o chão */}
      <Box s={[1.1, 0.7, 0.8]} p={[GH[0] - 0.75, lerp(1.7, 0.35, lay), GH[2] + 0.75]} r={[0, -0.82, 0]} c={ST2} />
    </G>
  );
};

// ---------------------------------------------------------------- materiais: piedra, madera, hierro (y músculo = o operário)
const Materials: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.piedra - 0.2 && t < T.p1 + 0.4)) return null;
  const out = 1 - ease(t, T.p1 - 0.1, T.p1 + 0.3), s = (a: number) => Math.max(0.01, out * Math.min(1.15, ease(t, a - 0.05, a + 0.2) * 1.15 - ease(t, a + 0.2, a + 0.35) * 0.15));
  return (
    <G p={[-38.4, 0, 10.4]}>
      <G p={[-0.1, 0, -0.8]} sc={s(T.piedra)}><Box s={[1.0, 0.75, 0.9]} p={[0, 0.375, 0]} c={ST2} /></G>
      <G p={[0.4, 0, 0.55]} sc={s(T.madera)}><Cyl rt={0.26} h={1.5} p={[0, 0.27, 0]} r={[PI / 2, 0, 0]} c={OAK} seg={9} /><Cyl rt={0.24} h={1.4} p={[0, 0.72, -0.05]} r={[PI / 2, 0, 0.1]} c="#9a6a38" seg={9} /></G>
      <G p={[-0.75, 0, 0.2]} sc={s(T.hierro)}>{[-0.22, 0, 0.22].map((z, i) => <Box key={i} s={[0.09, 1.6, 0.09]} p={[0, 0.75, z]} r={[0, 0, 0.32]} c="#5b6068" o={{ metal: 0.5, rough: 0.4 }} />)}</G>
    </G>
  );
};

// ---------------------------------------------------------------- o sonho: a catedral alta e cheia de luz (translúcida)
const Dream: React.FC<{ t: number }> = ({ t }) => {
  const g = ease(t, T.quieren - 0.15, T.altisima + 0.5) * (1 - ease(t, T.p1 - 0.05, T.p1 + 0.75));
  if (g <= 0.02 || t > C2) return null;
  const glow = ease(t, T.luz - 0.3, T.luz + 0.3), up = Math.max(0.01, ease(t, T.quieren - 0.15, T.altisima + 0.5));
  const o = (a: number) => ({ emissive: "#ffcf5a", ei: 0.45 + glow * 0.7, opacity: q(a * g), depthWrite: false });
  return (
    <G p={[-18, 0, 11]} sc={[1, up, 1]}>
      <Box s={[11, 15, 6.5]} p={[0, 7.5, 0]} c="#fff2c8" o={o(0.42)} cast={false} recv={false} />
      <Cone rad={4.9} h={4} seg={4} p={[0, 17, 0]} r={[0, PI / 4, 0]} sc={[1.6, 1, 0.95]} c="#fff2c8" o={o(0.4)} cast={false} recv={false} />
      {[-1, 1].map((s) => <Box key={s} s={[3.6, 22, 3.6]} p={[-6.8, 11, s * 2.4]} c="#fff2c8" o={o(0.45)} cast={false} recv={false} />)}
      {/* janelas acesas e raios de luz */}
      {[-3.5, 0, 3.5].map((x) => <Box key={x} s={[1.4, 6, 6.7]} p={[x, 8, 0]} c="#ffe58a" o={o(0.25 + glow * 0.5)} cast={false} recv={false} />)}
      <mesh position={[-8.7, 12, 0]} rotation={[0, -PI / 2, 0]} material={mat("#ffd84a", { side: "double", emissive: "#ffc020", ei: 0.6 + glow, opacity: q((0.35 + glow * 0.5) * g), depthWrite: false })}><circleGeometry args={[2.0, 24]} /></mesh>
      {glow > 0.05 ? Array.from({ length: 7 }, (_, i) => { const a = -1.2 + (i / 6) * 2.4, L = 7 * glow, d = 2.3 + L / 2; return <Box key={i} s={[0.3, L, 0.3]} p={[-9.0, 12 + Math.cos(a) * d, Math.sin(a) * d]} r={[a, 0, 0]} c="#fff2a8" o={{ emissive: "#ffe060", ei: 1, opacity: q(0.55 * g * glow), depthWrite: false }} cast={false} recv={false} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- igreja românica: a abóbada empurra as paredes para fora
const ROMAN = { x: -30, z: 11 };
const Romanesque: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= C1 - 0.02 && t < C3)) return null;
  const tilt = ease(t, T.empuja - 0.1, T.fuera1 + 0.25) * (1 - ease(t, T.por + 0.05, T.gruesos - 0.1));
  const thick = ease(t, T.gruesos - 0.3, T.gruesos + 0.3), small = ease(t, C2 - 0.05, T.pequenas + 0.5);
  const th = lerp(0.6, 1.7, thick), sink = 0.7 * tilt, crack = ease(t, T.empuja + 0.4, T.fuera1) * (1 - thick);
  // depois das janelas pequenas ela afunda no chão durante o chicote (W3): a câmera do «a los lados» olha por ali
  const gone = ease(t, T.b1 + 0.1, WINS[3] + 0.5); if (gone > 0.995) return null;
  return (
    <G p={[ROMAN.x, -8.5 * gone, ROMAN.z]}>
      {[-1, 1].map((s) => <G key={s} p={[0, 0, s * (2.2 + th / 2)]} r={[s * 0.2 * tilt, 0, 0]}>
        <Box s={[7, 4, th]} p={[0, 2, 0]} c={ST2} />
        {[-2, 0, 2].map((x) => <Box key={x} s={[lerp(1.1, 0.32, small), lerp(1.6, 0.6, small), th + 0.04]} p={[x, 2.4, 0]} c={DARK} cast={false} />)}
        {crack > 0.05 ? [[-2.9, 3.2, 0.5], [-3.0, 2.3, -0.4], [-3.05, 1.4, 0.6]].map(([x, y, r], j) => <Box key={j} s={[0.1, 1.0 * crack, th + 0.06]} p={[x, y, 0]} r={[0, 0, r]} c="#1c1410" cast={false} />) : null}
      </G>)}
      <Arch S={4.4 + th} th={0.7} pointed={false} d={7} c={ST} p={[0, 4 - sink, 0]} r={[0, PI / 2, 0]} />
      {/* o empurrão: setas vermelhas saindo da abóbada para os lados, na ponta oeste (a que a câmera vê) */}
      {[-1, 1].map((s) => <Arrow key={s} a={[-3.7, 4.3 - sink, s * 2.6]} b={[-3.7, 4.3 - sink, s * 4.6]} k={tilt} rad={0.24} />)}
    </G>
  );
};

// ---------------------------------------------------------------- arco redondo (se abre) x arco ogival (peso desce aos pilares)
const DEMO = { x: -30, z: -7 }, DX = 3.0, AS = 4, ATH = 0.9;
const pathPointed = (s: number): V3[] => {
  const Rc = AS + ATH / 2, ac = Math.acos(-AS / 2 / Rc), out: V3[] = [];
  for (let j = 0; j <= 6; j++) { const a = lerp(ac, PI, j / 6); out.push([-s * (AS / 2 + Rc * Math.cos(a)), 3.4 + Rc * Math.sin(a), 0.72]); }
  out.push([s * (AS / 2 + ATH / 2), 0.25, 0.72]);
  return out;
};
const PATH_L = pathPointed(1), PATH_R = pathPointed(-1);
const ArchDemo: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= C2 - 0.02 && t < C3)) return null;
  const drop = ease(t, T.pesoR - 0.1, T.pesoR + 0.25), splay = ease(t, T.abra - 0.1, T.abra + 0.35);
  const kp = ease(t, T.arco - 0.25, T.arco + 0.55), dropP = ease(t, T.forma - 0.1, T.forma + 0.25);
  const flow = ease(t, T.manda0 - 0.15, T.manda0 + 0.25) * (1 - ease(t, T.ojival + 0.7, C3));
  const pil = ease(t, T.pilaresA - 0.15, T.pilaresA + 0.2) * (1 - ease(t, T.ojival + 0.7, C3));
  // no «abra» as duas setas do redondo; no «empuja menos hacia los lados» só as de fora (grande à esquerda x pequena à direita)
  const openR = splay * (1 - ease(t, T.c1, T.arco)), sideR = Math.max(openR, ease(t, T.menos - 0.2, T.menos + 0.35));
  const sideP = ease(t, T.menos - 0.2, T.menos + 0.35);
  const pg = pil > 0.05 ? { emissive: "#1fa84a", ei: 0.55 * pil } : undefined;
  return (
    <G p={[DEMO.x, 0, DEMO.z]}>
      {/* redondo: o peso abre as paredes */}
      <G p={[-DX, 0, 0]}>
        {[-1, 1].map((s) => <G key={s} p={[s * 2.45, 0, 0]} r={[0, 0, -s * 0.17 * splay]}><Box s={[0.9, 3.4, 1.1]} p={[0, 1.7, 0]} c={ST2} /></G>)}
        <Arch S={AS} th={ATH} pointed={false} d={1.1} c={ST} p={[0, 3.4 - 0.55 * splay, 0]} />
        {splay > 0.05 ? <Box s={[0.12, 0.85 * splay, 1.16]} p={[0, 5.35 - 0.55 * splay, 0]} r={[0, 0, 0.2]} c="#1c1410" cast={false} /> : null}
        {drop > 0.01 ? <Box s={[1.7, 1.0, 1.15]} p={[0, 6.8 + (1 - drop) * 6 - 0.55 * splay, 0]} c={SLAB} /> : null}
        {[-1, 1].map((s) => <Arrow key={s} a={[s * 2.7, 4.5 - 0.4 * splay, 0.75]} b={[s * 4.05, 4.5 - 0.4 * splay, 0.75]} k={s < 0 ? sideR : openR} rad={0.32} />)}
      </G>
      {/* ogival: a forma manda o peso para baixo, pelos pilares */}
      <G p={[DX, 0, 0]} sc={[1, Math.max(0.01, kp), 1]}>
        {[-1, 1].map((s) => <Box key={s} s={[0.9, 3.4, 1.1]} p={[s * 2.45, 1.7, 0]} c={ST2} o={pg} />)}
        <Arch S={AS} th={ATH} pointed d={1.1} c={ST} p={[0, 3.4, 0]} />
        {dropP > 0.01 ? <Box s={[1.5, 1.0, 1.15]} p={[0, 8.3 + (1 - dropP) * 6, 0]} c={SLAB} /> : null}
        <Flow t={t} pts={PATH_L} k={flow} n={5} speed={0.75} r={0.22} />
        <Flow t={t} pts={PATH_R} k={flow} n={5} speed={0.75} r={0.22} ph={0.1} />
        {[-1, 1].map((s) => <Arrow key={s} a={[s * 2.45, 2.9, 0.78]} b={[s * 2.45, 0.5, 0.78]} k={pil} rad={0.2} col={GREEN} />)}
        <Arrow a={[2.7, 4.8, 0.75]} b={[3.25, 4.8, 0.75]} k={sideP} rad={0.13} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- um tramo de abóbada: laje que pesa no muro todo → nervuras = mesa
const BAY = { x: -30, z: -7 }, BA = 2.3, PH = 5.2, CR = 2.0;
const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const ribPath = (sx: number, sz: number): V3[] => [[sx * BA, PH, sz * BA], [sx * BA * 0.5, PH + CR * 0.78, sz * BA * 0.5], [0, PH + CR, 0]];
const BayDemo: React.FC<{ t: number }> = ({ t }) => {
  const webGeo = useMemo(() => {
    const cr = new THREE.Vector3(0, PH + CR - 0.06, 0), pos: number[] = [];
    for (let i = 0; i < 4; i++) {
      const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4];
      const A = new THREE.Vector3(ax * BA, PH + 0.05, az * BA), B = new THREE.Vector3(bx * BA, PH + 0.05, bz * BA), M = A.clone().add(B).multiplyScalar(0.5).setY(PH + CR * 0.55);
      [cr, A, M, cr, M, B].forEach((v) => pos.push(v.x - cr.x, v.y - cr.y, v.z - cr.z));
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  }, []);
  if (!(t >= C3 - 0.02 && t < C4)) return null;
  const drop = ease(t, T.p2 + 0.05, T.pesando - 0.15), press = ease(t, T.toneladas - 0.1, T.toneladas + 0.4), all = ease(t, T.muro - 0.25, T.muro + 0.3);
  const lift = ease(t, T.b2 + 0.05, T.b2 + 0.65), per = ease(t, T.cruzan - 0.1, T.techo2 + 0.25), web = ease(t, T.techo2 - 0.1, T.techo2 + 0.45);
  const flow = ease(t, T.cae - 0.35, T.cae + 0.05) * (1 - ease(t, T.p3 - 0.3, T.p3 + 0.1));
  const sink = ease(t, T.pilares - 0.55, T.pilares + 0.35), glow = ease(t, T.pilares - 0.35, T.pilares + 0.15) * (1 - ease(t, T.p3 - 0.2, T.p3 + 0.2));
  const thrust = ease(t, T.p3 + 0.15, T.empujando - 0.2), bulge = press * (1 - lift);
  const pg = glow > 0.05 ? { emissive: "#ffb000", ei: 0.55 * glow } : undefined;
  return (
    <G p={[BAY.x, 0, BAY.z]}>
      {/* pilares (as pernas da mesa) */}
      {corners.map(([sx, sz], i) => <G key={i} p={[sx * BA, 0, sz * BA]} r={[sz * 0.07 * thrust, 0, -sx * 0.07 * thrust]}><Cyl rt={0.44} h={PH} p={[0, PH / 2, 0]} c={glow > 0.05 ? "#f0c860" : ST2} o={pg} seg={10} /></G>)}
      {/* os quatro muros entre os pilares: racham com a laje; depois descem para o chão */}
      {[-1, 1].map((s) => <G key={`x${s}`} p={[0, -sink * (PH + 0.3), s * BA]} r={[s * 0.08 * bulge, 0, 0]}>
        <Box s={[2 * BA - 0.8, PH, 0.55]} p={[0, PH / 2, 0]} c={ST} />
        {press > 0.1 ? [[-0.9, 3.9, 0.7], [0.2, 2.6, -0.6], [1.1, 4.3, 0.5], [-0.3, 1.3, 0.9]].map(([x, y, r], j) => <Box key={j} s={[1.1 * press, 0.09, 0.6]} p={[x, y, 0]} r={[0, 0, r]} c="#1c1410" cast={false} />) : null}
        {[-1.2, 0, 1.2].map((x) => <Arrow key={x} a={[x, PH - 0.3, s * 0.75]} b={[x, PH - 2.6, s * 0.75]} k={all * (1 - lift)} rad={0.17} />)}
      </G>)}
      {[-1, 1].map((s) => <G key={`z${s}`} p={[s * BA, -sink * (PH + 0.3), 0]} r={[0, 0, -s * 0.08 * bulge]}>
        <Box s={[0.55, PH, 2 * BA - 0.8]} p={[0, PH / 2, 0]} c={ST} />
        {press > 0.1 ? [[3.6, -0.8, 0.6], [2.2, 0.6, -0.7], [4.4, 1.0, 0.4]].map(([y, z, r], j) => <Box key={j} s={[0.6, 0.09, 1.0 * press]} p={[0, y, z]} r={[r, 0, 0]} c="#1c1410" cast={false} />) : null}
        {[-1.2, 0, 1.2].map((z) => <Arrow key={z} a={[s * 0.75, PH - 0.3, z]} b={[s * 0.75, PH - 2.6, z]} k={all * (1 - lift)} rad={0.17} />)}
      </G>)}
      {/* a laje de pedra: cai, pesa toneladas, sai quando chegam as nervuras */}
      {drop > 0.01 && lift < 0.99 ? <Box s={[2 * BA + 1.4, 1.3, 2 * BA + 1.4]} p={[0, PH + 0.65 + (1 - drop) * 7 + lift * 10, 0]} c={SLAB} /> : null}
      <Puffs t={t} p={[0, PH, 0]} n={8} period={1.6} rise={2.5} size={0.9} c="#d8d0c0" on={ease(t, T.pesando - 0.15, T.pesando) * (1 - ease(t, T.toneladas + 0.6, T.muro + 0.3))} drift={[2.6, 0, 2.6]} />
      {/* nervuras: crescem dos quatro cantos e se cruzam no alto */}
      {corners.map(([sx, sz], i) => <Grow key={i} pts={ribPath(sx, sz)} u={ease(t, T.nervios - 0.15 + i * 0.1, T.cruzan + 0.1)} rad={0.2} c={ST2} />)}
      {corners.map(([ax, az], i) => { const [bx, bz] = corners[(i + 1) % 4]; return <Grow key={`p${i}`} pts={[[ax * BA, PH, az * BA], [((ax + bx) / 2) * BA, PH + CR * 0.55, ((az + bz) / 2) * BA], [bx * BA, PH, bz * BA]]} u={per} rad={0.16} c={ST2} />; })}
      {web > 0.01 ? <mesh geometry={webGeo} position={[0, PH + CR - 0.06, 0]} scale={Math.max(0.01, web)} material={mat("#efe8d8", { side: "double" })} castShadow receiveShadow /> : null}
      {/* o peso: das nervuras para os pilares e pelos pilares até o chão */}
      {corners.map(([sx, sz], i) => <Flow key={i} t={t} pts={[[0, PH + CR + 0.25, 0], [sx * BA * 0.5, PH + CR * 0.78 + 0.25, sz * BA * 0.5], [sx * BA, PH + 0.3, sz * BA], [sx * (BA + 0.5), PH - 0.2, sz * (BA + 0.5)], [sx * (BA + 0.5), 0.3, sz * (BA + 0.5)]]} k={flow} n={4} speed={0.7} col={GOLD} r={0.2} ph={i * 0.13} />)}
      {/* lá em cima a abóbada ainda empurra para fora */}
      {corners.map(([sx, sz], i) => <Arrow key={`t${i}`} a={[sx * BA * 1.15, PH + 0.5, sz * BA * 1.15]} b={[sx * (BA + 2.0), PH + 0.5, sz * (BA + 2.0)]} k={thrust} rad={0.2} />)}
    </G>
  );
};

// ---------------------------------------------------------------- a catedral (nave)
const wallsK = (t: number) => (built(t) || t >= C3 - 0.02 ? 1 : 0);
const lean = (t: number) => (built(t) ? 0 : ease(t, T.empujando - 0.35, T.empujando + 0.45) * (1 - ease(t, T.sostienen - 0.05, T.lejos + 0.25)));
// só o primeiro tramo cresce no «brazos» (a câmera de seção vê um pilar e um braço, sem cerca); os outros no chicote antes do corte
const pierK = (t: number, j: number) => (built(t) ? 1 : j < 2 ? ease(t, T.brazos - 0.2, T.brazos + 0.4) : ease(t, T.suelo + 0.05 + j * 0.015, T.suelo + 0.4 + j * 0.015));
const armK = (t: number, j: number) => (built(t) ? 1 : j < 2 ? ease(t, T.brazos + 0.3, T.sostienen) : ease(t, T.suelo + 0.25 + j * 0.015, C5 - 0.1));
export const openK = (t: number) => (built(t) ? 1 : ease(t, T.abrir - 0.2, T.vidrio + 0.2));
const tintK = (t: number) => (built(t) ? 1 : ease(t, T.tenido - 0.1, T.oxidos + 0.45));
const leadK = (t: number) => (built(t) ? 1 : ease(t, T.plomo - 0.25, T.plomo + 0.45));
const roseK = (t: number) => (built(t) ? 1 : ease(t, T.roseton - 0.3, T.roseton + 0.35));
export const roofK = (t: number) => (built(t) || t >= C7 - 0.02 ? 1 : 0);
const burn = (t: number) => ease(t, T.incendio - 0.2, T.destruyo + 0.3);
const gone = (t: number) => ease(t, T.destruyo + 0.2, T.rehacer);
const trussK = (t: number, i: number) => ease(t, T.hacha + i * 0.18, T.hacha + 0.5 + i * 0.18);
const GLASS = ["#2f5fd0", "#d8352a", "#2fa85a", "#e8b030", "#7a3fc0"];

const Nave: React.FC<{ t: number }> = ({ t }) => {
  if (!wallsK(t)) return null;
  const h = HW, ln0 = lean(t), ln = ln0 * (1 + 0.12 * Math.sin(t * 11) * ease(t, T.empujando + 0.4, T.b3)), op = openK(t), ld = leadK(t), tn = tintK(t);
  const carry = built(t) ? 0 : ease(t, T.yaNo - 0.3, T.yaNo + 0.2) * (1 - ease(t, T.abrir + 0.3, T.vidrio + 0.3));
  const inner = carry > 0.05 ? { emissive: "#ffb000", ei: 0.5 * carry } : undefined;
  return (
    <G>
      {[-1, 1].map((s) => (
        <G key={s} p={[0, 0, s * ZW]} r={[s * 0.085 * ln, 0, 0]}>
          {/* parede: embaixo inteira; em cima painéis entre pilares que se abrem em vitral */}
          <Box s={[X1 - X0, 7, 1]} p={[(X0 + X1) / 2, 3.5, 0]} c={ST} />
          {Array.from({ length: BAYS }, (_, i) => {
            const cx = bayX(i) + BW / 2, hh = h - 7, gc = mix("#e8f2ff", GLASS[i % 5], tn);
            return (
              <G key={i}>
                <Box s={[0.9, hh, 1.1]} p={[bayX(i), 7 + hh / 2, 0]} c={ST2} />
                <Box s={[BW - 0.9, hh * (1 - op * 0.82), 1]} p={[cx, 7 + (hh * (1 - op * 0.82)) / 2, 0]} c={ST} vis={op < 0.99} />
                {op > 0.02 ? <G p={[cx, 7.4, 0]}>
                  {[-1, 1].map((f) => <G key={f} p={[0, 0, f * 0.52]} r={[0, f > 0 ? 0 : PI, 0]}>
                    <Lancet w={2.6} h={4.6 * op} c={gc} o={{ emissive: gc, ei: 0.25 + 0.35 * tn }} />
                    {ld > 0.02 ? <G p={[0, 0, 0.02]}>{[1.1, 2.2, 3.3].map((y, j) => <Box key={y} s={[2.6 * ease(ld, j * 0.2, j * 0.2 + 0.5), 0.08, 0.02]} p={[0, y, 0]} c="#2a2630" cast={false} />)}<Box s={[0.08, 4.2 * ease(ld, 0.4, 1), 0.02]} p={[0, 2.1, 0]} c="#2a2630" cast={false} /></G> : null}
                  </G>)}
                </G> : null}
              </G>
            );
          })}
          <Box s={[0.9, h - 7, 1.1]} p={[X1, 7 + (h - 7) / 2, 0]} c={ST2} />
          {/* janelas pequenas embaixo: escuras por fora, uma fresta clara por dentro */}
          {Array.from({ length: BAYS }, (_, i) => <G key={i} p={[bayX(i) + BW / 2, 3.6, 0]}><Box s={[0.6, 1.4, 1.04]} c={DARK} cast={false} /><Box s={[0.5, 1.3, 0.02]} p={[0, 0, -s * 0.53]} c="#dfefff" o={{ emissive: "#cfe6ff", ei: 0.9 }} cast={false} /></G>)}
          {/* o empurrão lá em cima: setas para fora (a que fica na ponta oeste é a da câmera de seção) */}
          {[-10.5, -2, 6, 14].map((x) => <Arrow key={x} a={[x, 12.2, s * 0.7]} b={[x, 12.2, s * 3.4]} k={ln0} rad={0.3} />)}
        </G>
      ))}
      {/* abside semicircular */}
      <Cyl rt={ZW + 0.5} h={h} seg={14} p={[X1, h / 2, 0]} c={ST} ts={0} tl={PI} r={[0, PI / 2, 0]} open />
      <Box s={[X1 - X0, 0.12, ZW * 2]} p={[(X0 + X1) / 2, 0.06, 0]} c="#cfc6b2" />
      {/* pilares internos: no «ya no carga el peso» brilham e o peso desce por eles */}
      {Array.from({ length: BAYS + 1 }, (_, i) => [-1, 1].map((s) => <Cyl key={i + "" + s} rt={0.45} h={h * 0.86} p={[bayX(i), (h * 0.86) / 2, s * (ZW - 0.9)]} c={carry > 0.05 ? "#f0c860" : ST2} o={inner} seg={10} />))}
      {carry > 0.02 ? [-4, 0, 4, 8].map((x) => <Flow key={x} t={t} pts={[[x, 11.2, ZW - 1.45], [x, 0.4, ZW - 1.45]]} k={carry} n={3} speed={0.9} col={GOLD} r={0.2} ph={x * 0.07} />) : null}
    </G>
  );
};
/** abóbada da nave: nervuras cruzadas + panos leves (prontas desde o tramo de demonstração) */
const Vault: React.FC<{ t: number }> = ({ t }) => {
  if (!wallsK(t)) return null;
  const y0 = HW - 1.6, yA = HW + 2.2;
  return (
    <G>
      {Array.from({ length: BAYS }, (_, i) => {
        const a = bayX(i), b = a + BW, m = a + BW / 2, A: V3 = [m, yA, 0];
        return (
          <G key={i}>
            {([[a, -1], [a, 1], [b, -1], [b, 1]] as [number, number][]).map(([x, s], j) => <Pipe key={j} a={[x, y0, s * (ZW - 0.6)]} b={A} rad={0.16} c={ST2} seg={6} />)}
            <Pipe a={[a, y0, -(ZW - 0.6)]} b={[a, yA - 0.6, 0]} rad={0.15} c={ST2} seg={6} /><Pipe a={[a, y0, ZW - 0.6]} b={[a, yA - 0.6, 0]} rad={0.15} c={ST2} seg={6} />
            {[-1, 1].map((s) => <Box key={s} s={[BW, 0.18, ZW + 0.3]} p={[m, (y0 + yA) / 2 + 0.25, s * (ZW / 2)]} r={[s * 0.62, 0, 0]} c="#efe8d8" />)}
          </G>
        );
      })}
    </G>
  );
};
/** arcobotantes: o pilar externo sobe, o braço vai até a parede e o empurrão desce por ele até o chão */
const Buttresses: React.FC<{ t: number }> = ({ t }) => {
  const fl = built(t) ? 0 : ease(t, T.llevan - 0.1, T.llevan + 0.3) * (1 - ease(t, C5 - 0.3, C5));
  return (
    <G>{Array.from({ length: BAYS + 1 }, (_, i) => { const x = bayX(i); return [-1, 1].map((s) => {
      const j = i * 2 + (s > 0 ? 1 : 0), k = pierK(t, j), a = armK(t, j); if (k <= 0.01) return null;
      const up: V3 = [x, 12.2, s * (ZW + 0.5)], lo: V3 = [x, 9.4, s * (ZW + 0.5)], top: V3 = [x, 7.4, s * 9.4], mid: V3 = [x, 5.4, s * 9.4];
      return (
        <G key={j}>
          <G sc={[1, Math.max(0.01, k), 1]}><Box s={[1.2, 8, 1.4]} p={[x, 4, s * 10]} c={ST2} /><Cone rad={0.6} h={1.5} seg={4} p={[x, 8.75, s * 10]} r={[0, PI / 4, 0]} c={ST2} /></G>
          {a > 0.01 ? <><Pipe a={top} b={vlerp(top, up, a)} rad={0.36} c={ST} seg={6} /><Pipe a={mid} b={vlerp(mid, lo, a)} rad={0.26} c={ST} seg={6} /></> : null}
          {fl > 0.02 && i < 1 ? <Flow t={t} pts={[up, top, [x - 0.72, 7.2, s * 9.7], [x - 0.72, 0.3, s * 9.7]]} k={fl} n={4} speed={0.85} r={0.24} ph={i * 0.21} /> : null}
          {fl > 0.02 && i < 1 ? <mesh position={[x, 0.08, s * 10]} rotation={[-PI / 2, 0, 0]} scale={1 + 0.8 * fract(t * 1.7 + i * 0.3)} material={mat("#3fcf6a", { emissive: "#1fa84a", ei: 0.8, opacity: q(0.6 * fl * (1 - fract(t * 1.7 + i * 0.3))), depthWrite: false })}><ringGeometry args={[1.0, 1.35, 20]} /></mesh> : null}
        </G>
      ); }); })}</G>
  );
};
/** fachada oeste: duas torres de topo plano, rosácea, três portais (existe desde o interior escuro) */
const Facade: React.FC<{ t: number }> = ({ t }) => {
  if (!(built(t) || t >= C6 - 0.02)) return null;
  const rk = roseK(t), mk = ease(t, T.trece - 0.15, T.trece + 0.3) * (1 - ease(t, T.vitralesT, T.vitralesT + 0.4));
  return (
    <G p={[X0 - 1.2, 0, 0]}>
      <Box s={[2.4, 17, 10]} p={[0, 8.5, 0]} c={ST} />
      {[-1, 1].map((s) => <G key={s} p={[0, 0, s * 7.2]}><Box s={[5, 23, 5]} p={[0, 11.5, 0]} c={ST} /><Box s={[5.4, 0.7, 5.4]} p={[0, 23.2, 0]} c={ST2} />
        {[16, 19.5].map((y) => <Lancet key={y} w={0.9} h={3} c={DARK} p={[-2.52, y, 0]} r={[0, -PI / 2, 0]} />)}</G>)}
      {[-3, 0, 3].map((z) => <Lancet key={z} w={z ? 1.8 : 2.4} h={z ? 3.6 : 4.4} c="#4a3b2e" p={[-1.22, 0.2, z]} r={[0, -PI / 2, 0]} />)}
      <Box s={[2.5, 0.5, 18]} p={[0, 6.4, 0]} c={ST2} />
      {/* rosácea: vista dos dois lados */}
      {[-1, 1].map((f) => <G key={f} p={[f * 1.22, 11, 0]} r={[0, f * PI / 2, 0]} sc={Math.max(0.01, rk)}>
        <mesh material={mat("#2a2630", { side: "double" })}><circleGeometry args={[3.0, 32]} /></mesh>
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * PI * 2; return <mesh key={i} position={[Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0.02]} material={mat(GLASS[i % 5], { side: "double", emissive: GLASS[i % 5], ei: 0.6 })}><circleGeometry args={[0.72, 12]} /></mesh>; })}
        <mesh position={[0, 0, 0.02]} material={mat("#e8b030", { side: "double", emissive: "#e8b030", ei: 0.7 })}><circleGeometry args={[0.9, 16]} /></mesh>
      </G>)}
      {/* régua de 13 m atravessando a rosácea por fora */}
      {mk > 0.02 ? <G p={[-1.42, 11, 0]}><Box s={[0.1, 0.22, 6.4 * mk]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.7 }} cast={false} />{[-1, 1].map((s) => <Box key={s} s={[0.1, 1.0, 0.18]} p={[0, 0, s * 3.2 * mk]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.7 }} cast={false} />)}</G> : null}
    </G>
  );
};
/** telhado de chumbo + flecha; queima em 2019; armação de carvalho refeita */
const Roof: React.FC<{ t: number }> = ({ t }) => {
  if (!roofK(t)) return null;
  const br = burn(t), gn = gone(t), spireFall = ease(t, T.destruyo - 0.1, T.destruyo + 0.9), c = br > 0.5 ? "#2a2522" : ROOF;
  return (
    <G>
      {gn < 0.98 ? [-1, 1].map((s) => <Box key={s} s={[X1 - X0 + 1, 0.4, 6.4]} p={[(X0 + X1) / 2, HW + 2.6 - gn * 1.5, s * 2.5]} r={[-s * 0.72, 0, 0]} sc={[1, 1, 1 - gn * 0.7]} c={c} />) : null}
      {spireFall < 0.98 ? <G p={[6, HW + 4.6, 0]} r={[0, 0, spireFall * 1.4]}><G p={[0, -spireFall * 5, 0]}><Cyl rt={0.9} rb={1.1} h={3} seg={8} p={[0, 1.5, 0]} c={ROOF} /><Cone rad={0.9} h={9} seg={8} p={[0, 7.5, 0]} c={c} /></G></G> : null}
      {br > 0.02 && t < T.labrar ? Array.from({ length: 9 }, (_, i) => <G key={i} p={[X0 + 2 + i * 3, HW + 4.2, (rnd(i) - 0.5) * 2]}>
        <Cone rad={1.1 * br} h={3.8 * br * (1 + 0.25 * Math.sin(t * 13 + i))} seg={6} p={[0, 1.5, 0]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.8 }} cast={false} />
        <Cone rad={0.6 * br} h={2.2 * br} seg={6} p={[0, 1.0, 0]} c="#ffe066" o={{ emissive: "#ffd000", ei: 1.8 }} cast={false} />
        <Puffs t={t} p={[0, 3, 0]} n={6} period={2.4} rise={16} size={2.2} c="#4a4a4a" o={i * 0.17} drift={[2, 0, 1]} />
      </G>) : null}
      {/* armação nova de carvalho */}
      {Array.from({ length: BAYS * 2 + 1 }, (_, i) => { const k = trussK(t, i); if (k <= 0.01) return null; const x = X0 + i * 2;
        return <G key={i} p={[x, HW + 0.6, 0]} sc={[1, Math.max(0.01, k), 1]}>
          <Pipe a={[0, 0, -ZW]} b={[0, 5.2, 0]} rad={0.16} c={OAK} seg={5} /><Pipe a={[0, 0, ZW]} b={[0, 5.2, 0]} rad={0.16} c={OAK} seg={5} /><Pipe a={[0, 0, -ZW]} b={[0, 0, ZW]} rad={0.15} c={OAK} seg={5} /><Pipe a={[0, 0, 0]} b={[0, 5.2, 0]} rad={0.12} c={OAK} seg={5} />
        </G>; })}
      {t > T.hacha ? <Pipe a={[X0, HW + 5.8, 0]} b={[X0 + ease(t, T.hacha, T.ochocientos + 0.8) * (X1 - X0), HW + 5.8, 0]} rad={0.15} c={OAK} seg={5} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- grua de roda no alto da ponta oeste da parede sul
// a pedra enorme espera no chão da praça, a oeste da nave (longe dos arcobotantes); dois homens andam dentro da roda, o eixo
// gira e enrola a corda, a corda passa na polia da lança e a pedra sobe; a roda grande x o eixo fino = a força multiplicada
export const CRANE = { x: -10.5, z: ZW };
const WR = 2.2, WY = 2.7, BOOM: V3 = [-5.0, 5.1, 1.2];
const Crane: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= C5 - 0.02 && t < C6)) return null;
  const k = ease(t, T.rueda - 0.3, T.rueda + 0.45), run = ease(t, T.paso - 0.3, T.paso + 0.3);
  const spin = 1.6 * Math.max(0, t - T.paso + 0.3) * run + 0.5 * Math.max(0, t - T.rueda);
  const lift = ease(t, T.eje, T.grua - 0.1), coil = ease(t, T.eje, T.grua - 0.1), measure = ease(t, T.treinta - 0.45, T.treinta + 0.25) * (1 - ease(t, T.b4 + 0.3, T.c4));
  const rim = ease(t, T.grande - 0.2, T.grande + 0.2) * (1 - ease(t, T.fuerza + 0.6, T.multiplica + 0.6)), axle = ease(t, T.eje2 - 0.1, T.eje2 + 0.25) * (1 - ease(t, T.multiplica + 0.3, T.grua));
  const small = ease(t, T.fuerza - 0.1, T.fuerza + 0.3) * (1 - ease(t, T.grua - 0.3, T.grua)), big = ease(t, T.multiplica - 0.25, T.multiplica + 0.3) * (1 - ease(t, T.grua - 0.1, T.grua + 0.3));
  const by = lerp(1.2, HW + 1.8, lift), sx = CRANE.x + BOOM[0], sz = CRANE.z + BOOM[2];
  const rimO = rim > 0.05 ? { emissive: "#ffb000", ei: 0.7 * rim } : undefined, axO = axle > 0.05 ? { emissive: "#ff2a1a", ei: 0.6 * axle } : undefined;
  const tip: V3 = [sx, HW + BOOM[1], sz], coilR = lerp(0.36, 0.5, coil), coilP: V3 = [CRANE.x, HW + WY + coilR, CRANE.z + 1.45];
  const Y = { emissive: "#ffb000", ei: 0.8 };
  return (
    <G>
      {/* a pedra enorme (maior que o operário) e a régua de 30 m */}
      <Box s={[2.6, 2.4, 2.2]} p={[sx, by, sz]} r={[0, Math.sin(t * 1.7) * 0.08 * lift, 0]} c={ST2} />
      {measure > 0.02 ? <G p={[sx + 2.1, 0, sz + 0.5]}>
        <Box s={[0.18, HW * measure, 0.18]} p={[0, (HW * measure) / 2, 0]} c="#ffd400" o={Y} cast={false} />
        {Array.from({ length: 6 }, (_, i) => ((i + 1) / 6 <= measure + 0.01 ? <Box key={i} s={[0.7, 0.1, 0.12]} p={[0, (HW * (i + 1)) / 6, 0]} c="#ffd400" o={Y} cast={false} /> : null))}
        <Cone rad={0.45} h={0.8} seg={8} p={[0, HW * measure + 0.3, 0]} c="#ffd400" o={Y} cast={false} />
      </G> : null}
      <G p={[CRANE.x, HW, CRANE.z]} sc={Math.max(0.01, k)}>
        <Box s={[4.6, 0.25, 3.0]} p={[0, 0.12, 0]} c="#7a5230" />
        {/* cavaletes dos dois lados da roda */}
        {[-1, 1].map((s) => <G key={s}><Pipe a={[-1.5, 0.25, s * 0.98]} b={[0, WY + 0.15, s * 0.98]} rad={0.13} c={OAK} seg={5} /><Pipe a={[1.5, 0.25, s * 0.98]} b={[0, WY + 0.15, s * 0.98]} rad={0.13} c={OAK} seg={5} /></G>)}
        {/* a roda (gira) */}
        <G p={[0, WY, 0]} r={[0, 0, -spin]}>
          {Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * PI * 2; return <Box key={i} s={[0.8, 0.16, 1.5]} p={[Math.cos(a) * WR, Math.sin(a) * WR, 0]} r={[0, 0, a + PI / 2]} c={rim > 0.05 ? "#f0b040" : i % 2 ? OAK : "#9a6a38"} o={rimO} />; })}
          {[-0.72, 0.72].map((z) => [0, 1, 2, 3].map((i) => <Box key={`${z}${i}`} s={[2 * WR, 0.13, 0.1]} p={[0, 0, z]} r={[0, 0, (i * PI) / 4]} c="#7a4a2a" />))}
          {/* eixo com uma faixa clara: dá para ver girar */}
          <Cyl rt={0.3} h={3.2} r={[PI / 2, 0, 0]} c={axle > 0.05 ? "#ff5a3a" : "#6b4423"} o={axO} seg={10} />
          <Box s={[0.12, 0.66, 3.24]} c="#e8d8b0" cast={false} />
        </G>
        {/* a corda enrolando no eixo (o raio pequeno que a corda vê) */}
        <Cyl rt={coilR} h={0.55} p={[0, WY, 1.45]} r={[PI / 2, 0, 0]} c={axle > 0.05 ? "#ff7a5a" : "#c8a46a"} o={axO} seg={12} />
        {[-0.18, 0, 0.18].map((z) => <Cyl key={z} rt={coilR + 0.01} h={0.04} p={[0, WY, 1.45 + z]} r={[PI / 2, 0, 0]} c="#8a6a3a" seg={12} cast={false} />)}
        {/* homens andando dentro da roda */}
        {[-0.55, 0.35].map((x, i) => <Worker key={i} p={[x, WY - Math.sqrt((WR - 0.08) ** 2 - x * x), 0]} yaw={PI / 2} pose={poseOf("walk", t * 1.25 + i * 0.5)} t={t} c={COSTUMES.mason} scale={0.82} mustache={i === 0} />)}
        {/* mastro, lança por cima da roda, escora e polia */}
        <Pipe a={[2.6, 0.25, 1.2]} b={[2.6, 5.7, 1.2]} rad={0.17} c={OAK} seg={6} />
        <Pipe a={[2.6, 5.6, 1.2]} b={BOOM} rad={0.17} c={OAK} seg={6} />
        <Pipe a={[-2.3, 0.25, 1.2]} b={[-3.6, 5.25, 1.2]} rad={0.14} c={OAK} seg={6} />
        <Cyl rt={0.3} h={0.25} p={BOOM} r={[PI / 2, 0, 0]} c="#6b4423" seg={10} />
        {/* força pequena no pé dos homens */}
        <Arrow a={[-0.2, 0.45, 0.85]} b={[-1.4, 0.75, 0.85]} k={small} rad={0.12} col={GREEN} />
      </G>
      {k > 0.5 ? <>
        <Pipe a={coilP} b={tip} rad={0.05} c="#3a2a1a" seg={4} cast={false} />
        <Pipe a={tip} b={[sx, by + 1.2, sz]} rad={0.05} c="#3a2a1a" seg={4} cast={false} />
        {lift > 0.01 && lift < 0.99 ? Array.from({ length: 5 }, (_, i) => <Box key={i} s={[0.16, 0.16, 0.16]} p={along([[sx, by + 1.2, sz], tip, coilP], fract(t * 0.9 + i / 5))} c="#ffd400" cast={false} />) : null}
      </> : null}
      {/* força grande na pedra */}
      <Arrow a={[sx - 1.85, by - 0.6, sz + 0.4]} b={[sx - 1.85, by + 3.6, sz + 0.4]} k={big} rad={0.36} col={GREEN} />
    </G>
  );
};
/** feixes de luz colorida entrando quando os vitrais abrem */
const Beams: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.vidrio, T.plomo) * (t < C7 ? 1 : 0); if (k <= 0.01) return null;
  return <G>{Array.from({ length: BAYS }, (_, i) => [-1, 1].map((s) => <Box key={i + "" + s} s={[2.0, 0.3, 9]} p={[bayX(i) + BW / 2, 6.6, -s * 0.4]} r={[s * 0.62, 0, 0]} c={GLASS[i % 5]} cast={false} recv={false} o={{ emissive: GLASS[i % 5], ei: 0.6, opacity: q(0.22 * k), depthWrite: false }} />))}</G>;
};
/** interior escuro: vela do operário e o pó dos óxidos caindo nos vidros */
const Interior: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= C6 - 0.02 && t < C7)) return null;
  const candle = 1 - ease(t, T.vidrio + 0.3, T.plomo), dust = ease(t, T.tenido - 0.2, T.tenido + 0.2) * (1 - ease(t, T.oxidos + 0.5, T.plomo));
  return (
    <G>
      {candle > 0.02 ? <G p={[3.5, 0, 0.6]}>
        <Cyl rt={0.08} h={1.5} p={[0, 0.75, 0]} c="#3a2a20" seg={6} /><Cyl rt={0.3} h={0.08} p={[0, 1.5, 0]} c="#3a2a20" seg={8} />
        <Cyl rt={0.09} h={0.35} p={[0, 1.72, 0]} c="#f2ead8" seg={8} />
        <Cone rad={0.11} h={0.32 * (1 + 0.15 * Math.sin(t * 17))} seg={6} p={[0, 2.06, 0]} c="#ffd060" o={{ emissive: "#ffb020", ei: 2 }} cast={false} />
        <Sph rad={0.32} p={[0, 2.05, 0]} c="#ffd870" o={{ emissive: "#ffc040", ei: 1.4, opacity: q(0.45 * candle), depthWrite: false }} cast={false} recv={false} ws={10} hs={8} />
      </G> : null}
      {dust > 0.02 ? [0, 1, 2].map((b) => Array.from({ length: 14 }, (_, i) => { const u = fract(t * 0.9 + rnd(i + b * 20)); return <Box key={`${b}${i}`} s={[0.09, 0.09, 0.09]} p={[bayX(b + 2) + BW / 2 + (rnd(i + 5) - 0.5) * 2.2, 12.6 - u * 5.5, ZW - 0.75]} c={GLASS[(b + 2) % 5]} o={{ emissive: GLASS[(b + 2) % 5], ei: 1 }} cast={false} />; })) : null}
    </G>
  );
};

// ---------------------------------------------------------------- 2019: carpinteiros lavram vigas de carvalho a machado, na frente da catedral queimada
// golpes em labrar−P, labrar, labrar+P, hacha, hacha+P (o som «axe» no cues.ts); cada carpinteiro com a sua fase
const CARP = { x: -6, z: 15.4 };
/** 0 = machado no alto, 1 = cravado na tora; o golpe cai exatamente em t0 + n·P */
const swing = (t: number, t0: number) => {
  const f = fract((t - t0) / AXE_P);
  if (f < 0.14) return 1; if (f < 0.72) return 1 - ease(f, 0.14, 0.72); const u = (f - 0.72) / 0.28; return u * u;
};
const AxeMan: React.FC<{ t: number; p: V3; t0: number; mustache?: boolean }> = ({ t, p, t0, mustache }) => {
  const s = swing(t, t0), rx = lerp(-2.85, -1.85, s), lean = lerp(0.02, 0.26, s), el = -0.15, rz = 0.3, SC = 1.12;
  const pose: Pose = { l: { rx, rz, el }, r: { rx, rz: -rz, el }, hx: lerp(-0.15, 0.25, s), hy: 0, hz: 0, lean, hop: 0 };
  return (
    <G>
      <Worker p={p} yaw={0} pose={pose} t={t} c={COSTUMES.mason} scale={SC} mustache={mustache} />
      {/* o machado: mesma cadeia do braço direito (ombro → cotovelo → mão) e o cabo seguindo o antebraço */}
      <G p={p} sc={SC}><G r={[lean, 0, 0]}><G p={[0.37, 1.32, 0]} r={[rx, 0, -rz]}><G p={[0, -0.34, 0]} r={[-el, 0, 0]}>
        <Cyl rt={0.04} h={1.0} p={[0, -0.72, 0]} c="#7a4a2a" seg={6} />
        <Box s={[0.07, 0.34, 0.42]} p={[0, -1.12, -0.17]} c="#9aa0a8" o={{ metal: 0.6, rough: 0.35 }} />
      </G></G></G></G>
    </G>
  );
};
const Carpenters: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.rehacer - 0.3) return null;
  const ph = [AXE_P * 0.45, 0, AXE_P * 0.72];
  return (
    <G>
      {[0, 1, 2].map((i) => {
        const x = CARP.x - 3.4 + i * 3.4, z = CARP.z, t0 = T.labrar + ph[i], hewn = ease(t, T.carpinteros + i * 0.15, T.hacha + 0.5 + i * 0.1);
        const since = fract((t - t0) / AXE_P) * AXE_P, hit: V3 = [x - 0.08, 1.15, z + 1.95];
        return (
          <G key={i}>
            {[-1.1, 1.1].map((dx) => <Box key={dx} s={[0.5, 0.32, 0.6]} p={[x + dx, 0.16, z + 1.85]} c="#6b4423" />)}
            {/* tora redonda que vai virando viga quadrada */}
            <Box s={[3.0, 0.64, 0.64]} p={[x, 0.32 + 0.45, z + 1.85]} c={OAK} />
            <Cyl rt={lerp(0.47, 0.3, hewn)} h={3.02} seg={9} p={[x, 0.32 + 0.45, z + 1.85]} r={[0, 0, PI / 2]} c="#7a5230" />
            <AxeMan t={t} p={[x, 0, z]} t0={t0} mustache={i === 1} />
            {/* lascas saindo a cada golpe */}
            {t > T.carpinteros && since < 0.45 ? Array.from({ length: 6 }, (_, j) => { const u = since / 0.45, a = rnd(j + i * 7) * PI * 2; return <Box key={j} s={[0.14, 0.05, 0.1]} p={[hit[0] + Math.cos(a) * u * 1.1, hit[1] + u * 1.3 - u * u * 1.6, hit[2] + Math.abs(Math.sin(a)) * u * 0.9]} r={[u * 6, u * 4, 0]} c="#e8c080" cast={false} />; }) : null}
          </G>
        );
      })}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a86d8" mid="#8cc3ee" low="#f0f2f2" />
    <Clouds t={t} n={8} y={34} />
    <City />
    <Ghost t={t} /><Materials t={t} /><Dream t={t} /><Romanesque t={t} /><ArchDemo t={t} /><BayDemo t={t} />
    <Nave t={t} /><Vault t={t} /><Buttresses t={t} /><Facade t={t} /><Roof t={t} /><Crane t={t} /><Beams t={t} /><Interior t={t} />
    <Carpenters t={t} />
  </>
);
