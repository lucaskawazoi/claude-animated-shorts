// Mundo do E14: Santa Sofía de brinquedo em Constantinopla. x = leste-oeste (semicúpulas em ±x), z = norte-sul (contrafortes
// em ±z); a câmera «de frente» fica no sul (+z), com o sol. O mar fica ao sul (z > 36) e a leste (x > 36), a cidade em volta.
// A nave: 4 pilares nas quinas de um quadrado de lado 10 (±5), 4 arcos (raio 5, saem a y=6), 4 pechinas (a esfera de raio 5√2
// em volta do centro, entre os arcos, de y=6 até o anel de y=11), o tambor das 40 janelas (y 11 → 11,9) e a cúpula em cima.
// A cúpula é uma calota esférica de altura h sobre a base de raio 5: a de 537 é baixa (h = 3, a tangente na base sai inclinada
// para fora) e a de 562, ~6 m mais alta (h = 5, meia esfera: a tangente na base é vertical — «el peso baja más recto»).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, outBack, pipeXf, prog, rnd, vlerp } from "../../toy/kit";
import { Clouds, Hills, Puffs, Sky } from "../../toy/scenery";
import { Costume, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { CRASH, DROP_A, FALL0, FALL1, LAND, NWIN, T, TIP0, XC, winAt } from "./cues";
import { OPEN } from "./open";

const PI = Math.PI;
export const S = 5, PH = 6, RING = PH + S, DRH = 0.9, DB = RING + DRH, AO = 5.6, AI = 4.4, AD = 1.2, CREST = PH + AO;
export const H_OLD = 3, H_NEW = 5;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const [X1, , X3, X4, X5, , X7, X8, X9, X10, X11, , , X14] = XC;
const BRICK = "#c9683d", BRICK2 = "#b0552f", BRICK3 = "#dd8752", STONE = "#e9dfcb", STONE2 = "#d2c6ae", WALL = "#eaa77b", WALL2 = "#d98f65";
const LEAD = "#8d9fb3", LEAD2 = "#7a8ca2", GOLD = "#e7c063", GOLD2 = "#c99a3a", INWALL = "#f3dfb6", MARBLE = "#efe6d6", PAVE = "#e7dcc4";
const GRASS = "#7dba4a", SEA = "#2f8ad0", ROOFS = ["#c8553d", "#d2683f", "#b84a36"], HOUSES = ["#f3e3c3", "#ead2a8", "#f6ecd8", "#e2c79c"];
export const BYZ: Costume = { skin: "#d39a6c", top: "#2f6fb0", bottom: "#5a3e2a", kilt: "#2f6fb0", kiltLen: 0.62, hat: "none", hatC: "#000", boot: "#5a3a24", belt: "#e0b03a", sleeves: true };
const BYZ2: Costume = { ...BYZ, top: "#a8825a", kilt: "#a8825a", skin: "#c48a5e", belt: "#6b4423" };
const BYZ3: Costume = { ...BYZ, top: "#9a4a32", kilt: "#9a4a32", skin: "#b9784b", belt: "#d8c49a" };
const EMP: Costume = { skin: "#e0aa82", top: "#6a2a8a", bottom: "#6a2a8a", kilt: "#6a2a8a", kiltLen: 0.95, hat: "none", hatC: "#000", boot: "#c9a03a", belt: "#e0b03a", sleeves: true };
const TOURS: Costume[] = [
  { skin: "#e0aa82", top: "#ff6b6b", bottom: "#3b4a6b", hat: "cap", hatC: "#ffd400", boot: "#f4f4f4", sleeves: false },
  { skin: "#c98a5b", top: "#4ab8ff", bottom: "#e8dcc0", hat: "straw", hatC: "#f2e6c8", boot: "#3a2b24", sleeves: false },
  { skin: "#f0c09a", top: "#5cd17a", bottom: "#2a2f3a", hat: "none", hatC: "#000", boot: "#f4f4f4", sleeves: false },
];
const q = (x: number) => Math.round(clamp(x) * 20) / 20; // opacidades quantizadas (o cache de materiais é por valor)
const GHOST = { opacity: 0.62, depthWrite: false, emissive: "#ffb000", ei: 0.75 };

// ---------------------------------------------------------------- materiais sem profundidade (setas e contornos por cima de tudo)
const flatCache = new Map<string, THREE.MeshBasicMaterial>();
const flat = (c: string, o = 1, top = true) => {
  const k = c + o + top; let m = flatCache.get(k);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: !top, depthWrite: false, fog: false }); flatCache.set(k, m); }
  return m;
};
/** seta de jogo (haste + ponta, contorno escuro), desenhada por cima do mundo; k = quanto já cresceu de a para b */
const Arrow: React.FC<{ a: V3; b: V3; c: string; k?: number; w?: number; o?: number }> = ({ a, b, c, k = 1, w = 0.2, o = 1 }) => {
  if (k <= 0.01 || o <= 0.02) return null;
  const e = vlerp(a, b, Math.min(1, k)), { r, len } = pipeXf(a, e), d: V3 = [(e[0] - a[0]) / len, (e[1] - a[1]) / len, (e[2] - a[2]) / len];
  const head = Math.min(len * 0.55, w * 3.4), sl = Math.max(0.01, len - head);
  const at = (s: number): V3 => [a[0] + d[0] * s, a[1] + d[1] * s, a[2] + d[2] * s];
  const oo = q(o);
  return (
    <group>
      <mesh position={at(sl / 2)} rotation={r} renderOrder={20} material={flat("#14202b", oo)}><cylinderGeometry args={[w * 1.45, w * 1.45, sl, 8]} /></mesh>
      <mesh position={at(sl + head / 2 - 0.05)} rotation={r} renderOrder={20} material={flat("#14202b", oo)}><coneGeometry args={[w * 2.7, head + 0.25, 10]} /></mesh>
      <mesh position={at(sl / 2)} rotation={r} renderOrder={21} material={flat(c, oo)}><cylinderGeometry args={[w, w, sl, 8]} /></mesh>
      <mesh position={at(sl + head / 2)} rotation={r} renderOrder={21} material={flat(c, oo)}><coneGeometry args={[w * 2.2, head, 10]} /></mesh>
    </group>
  );
};

// ---------------------------------------------------------------- fases da história
/** o gancho: o prédio pronto (igreja, cúpula nova) até o ⏪ «Constantinopla», quando afunda de cima para baixo */
const PARTS = ["piers", "arches", "pend", "body", "semi", "butt", "drum", "dome", "fin"] as const;
type Part = (typeof PARTS)[number];
const TOP: Record<Part, number> = { piers: 6.4, arches: 11.8, pend: 11.2, body: 10.6, semi: 11.4, butt: 10.6, drum: 12.4, dome: 17.4, fin: 18.8 };
const HOOK_END = T.ano532 + 1.0;
const sinkAt = (p: Part) => T.constantinopla + 0.06 + (PARTS.length - 1 - PARTS.indexOf(p)) * 0.12;
/** abertura a: tudo sobe do chão em sequência (montagem relâmpago); c: o mesmo, mais lento, atrás da multidão */
// a: pilares, arcos e muros já subindo no quadro 0 (início negativo), tudo de pé em ~0,65 s
const RISE_A: Record<Part, number> = { piers: -0.16, arches: -0.06, body: -0.04, pend: 0.12, semi: 0.2, butt: 0.28, drum: 0.42, dome: 0, fin: 0 };
const riseAt = (p: Part) => (OPEN === "a" ? RISE_A[p] : 0.0 + PARTS.indexOf(p) * 0.15);
const hookDy = (p: Part, t: number) => {
  if (t < X1 && OPEN === "a" && p !== "dome" && p !== "fin") { const a = riseAt(p); return -(TOP[p] + 0.3) * (1 - ease(t, a - 0.1, a + 0.22)); }
  if (t < X1 && OPEN === "c") { const a = riseAt(p); return -(TOP[p] + 0.3) * (1 - ease(t, a - 0.12, a + 0.3)); }
  return -(TOP[p] + 0.4) * ease(t, sinkAt(p), sinkAt(p) + 0.42);
};
export const hookOn = (t: number) => t < HOOK_END;
/** o empuxo abre os arcos: pilares tombam para fora; «Solución» os devolve */
export const lean = (t: number) => ease(t, T.abre - 0.05, T.abre + 0.55) * (1 - ease(t, T.s2 + 0.05, T.s2 + 0.5));
const LEAN_A = 0.11, spread = (t: number) => PH * Math.sin(LEAN_A * lean(t)) * 0.7071; // quanto cada arco se afasta
const pendU = (t: number) => (hookOn(t) ? 1 : ease(t, T.triangulos + 0.05, T.alCirculo + 0.12));
const semiU = (t: number, side: number) => (hookOn(t) ? 1 : ease(t, T.medias - 0.15 + (side < 0 ? 0.3 : 0), T.medias + 0.55 + (side < 0 ? 0.3 : 0)));
const buttU = (t: number, i: number) => (hookOn(t) ? 1 : ease(t, T.contrafuertes - 0.05 + i * 0.08, T.contrafuertes + 0.45 + i * 0.08));
const bodyOn = (t: number) => hookOn(t) || t >= X7 - 0.02;
/** janela k acesa? (no gancho, todas; depois, uma a uma em «cuarenta ventanas … una junto a otra») */
export const litAt = (k: number, t: number) => hookOn(t) || t >= winAt(k);
export const nLit = (t: number) => { let n = 0; for (let k = 0; k < NWIN; k++) if (t >= winAt(k)) n++; return n; };
/** altura da cúpula: nova no gancho; baixa (537) do canteiro ao terremoto; a nova aparece baixa e sobe ~6 m */
const domeH = (t: number) => (hookOn(t) ? H_NEW : t < T.levantan ? H_OLD : lerp(H_OLD, H_NEW, ease(t, T.seis1 - 0.1, T.alta + 0.45)));
/** o terremoto: tremor do mundo (amplitude) */
export const quake = (t: number) => (t < T.p4 || t > FALL1 + 0.4 ? 0 : 0.13 * ease(t, T.tiembla - 0.5, T.tiembla + 0.1) * (1 - 0.6 * ease(t, T.ano558, T.terremoto)) + 0.12 * ease(t, T.terremoto, T.terremoto + 0.3) * (1 - ease(t, FALL1, FALL1 + 0.4)));
const shakeOf = (t: number, k = 1): V3 => { const a = quake(t) * k; return [a * Math.sin(t * 37), a * 0.3 * Math.sin(t * 53), a * Math.sin(t * 41 + 1)]; };
/** interior: o anel de luz (0..1) — no gancho e depois das janelas */
export const ringLight = (t: number) => (hookOn(t) ? 1 : t < T.cuarenta ? 0 : nLit(t) / NWIN);
const insideOn = (t: number) => (t >= X1 && t < XC[1]) || (t >= X7 && t < X10);

// ---------------------------------------------------------------- a cúpula: posição do conjunto tambor + calota no tempo
const HOVER = RING + 10; // espera bem no alto: de baixo se vê o vão das quinas e as pechinas crescendo
type DomeXf = { p: V3; rx: number; pz: number; on: boolean };
/** C2: desce e pousa nas 4 cristas dos arcos, balança, tomba para o sul (gira na crista do arco sul) e cai na praça (✖);
 *  ⏪ volta para o alto e espera; nas pechinas desce para o anel. pz = pivô do tombo (z da crista sul). */
const domeXf = (t: number): DomeXf => {
  const on = true, pz = S + AD * 0.6;
  if (hookOn(t)) return { p: [0, RING, 0], rx: 0, pz, on };
  if (t < C2) return { p: [0, RING, 0], rx: 0, pz, on: false };
  const rock = (u: number) => 0.045 * Math.sin((t - LAND) * 15) * u;
  if (t < LAND) return { p: [0, lerp(CREST + 10, CREST, ease(t, C2, LAND)), 0], rx: 0, pz, on };
  if (t < TIP0) return { p: [0, CREST, 0], rx: rock(0.5 + 0.5 * prog(t, LAND, TIP0)), pz, on };
  const HT = H_OLD + DRH; // de boca para baixo, apoiada na coroa: a base fica a esta altura
  if (t < T.b1 + 0.08) {
    // tomba por cima da crista sul como uma tampa: balança (0,3 s), vira e cai de boca para baixo na praça, e quica
    const u1 = prog(t, TIP0, TIP0 + 0.3), u2 = prog(t, TIP0 + 0.3, CRASH), aft = prog(t, CRASH, CRASH + 0.5);
    const hop = t > CRASH ? 0.7 * Math.abs(Math.sin(PI * prog(t, CRASH, CRASH + 0.32))) * (1 - aft) : 0;
    const rx = 0.32 * u1 * u1 + (PI - 0.32) * Math.pow(u2, 1.4) + (t > CRASH ? 0.1 * Math.sin((t - CRASH) * 20) * (1 - aft) : 0);
    return { p: [0, lerp(CREST, HT, u2 * u2) + hop, 0], rx, pz, on };
  }
  const back = ease(t, T.b1 + 0.08, T.b1 + 0.75); // ⏪
  if (t < T.b1 + 0.75) return { p: [0, lerp(HT, HOVER, back), 0], rx: PI * (1 - back), pz, on };
  const bob = 0.22 * Math.sin((t - T.b1) * 2.4);
  if (t < T.pechinas + 0.12) return { p: [0, HOVER + bob, 0], rx: 0, pz, on };
  const down = prog(t, T.pechinas + 0.12, T.pechinas + 0.42);
  const settle = t > T.pechinas + 0.42 ? 0.08 * Math.sin((t - T.pechinas - 0.42) * 30) * (1 - prog(t, T.pechinas + 0.42, T.pechinas + 0.8)) : 0;
  return { p: [0, lerp(HOVER + 0.22 * Math.sin((T.pechinas + 0.12 - T.b1) * 2.4), RING, down * down) + settle - 0.45 * lean(t), 0], rx: 0, pz, on };
};

// ---------------------------------------------------------------- peças da nave
/** pechinas: a esfera de raio 5√2 em volta de (0, 6, 0), só a parte dentro do quadrado e fora do círculo, até a altura que já subiu */
const PR = S * Math.SQRT2;
const pendCache = new Map<number, THREE.BufferGeometry>();
const pendGeo = (u: number) => {
  const qu = Math.round(u * 72) / 72; let g = pendCache.get(qu); if (g) return g;
  const NJ = 16, NI = 12, pos: number[] = [], col: number[] = [], yTop = PH + S * qu;
  const cs = [new THREE.Color(BRICK), new THREE.Color(BRICK3), new THREE.Color(BRICK2), new THREE.Color("#e9c9a0")];
  const ring = (y: number) => { const r = Math.sqrt(Math.max(S * S, PR * PR - (y - PH) ** 2)), th = Math.acos(Math.min(1, S / r)); return { r, th }; };
  for (let quad = 0; quad < 4; quad++) {
    const a0 = (quad * PI) / 2;
    for (let j = 0; j < NJ; j++) {
      const ya = PH + (S * j) / NJ; if (ya >= yTop - 1e-4) break;
      const yb = Math.min(PH + (S * (j + 1)) / NJ, yTop), A = ring(ya), B = ring(yb);
      for (let i = 0; i < NI; i++) {
        const P = (R: { r: number; th: number }, y: number, f: number) => { const th = a0 + R.th + (PI / 2 - 2 * R.th) * f; return [R.r * Math.cos(th), y, R.r * Math.sin(th)]; };
        const v00 = P(A, ya, i / NI), v01 = P(A, ya, (i + 1) / NI), v10 = P(B, yb, i / NI), v11 = P(B, yb, (i + 1) / NI);
        pos.push(...v00, ...v10, ...v01, ...v01, ...v10, ...v11);
        const c = cs[j === NJ - 1 && yb >= PH + S - 1e-3 ? 3 : (j + i + (j % 2)) % 3 === 0 ? 1 : rnd(i * 7 + j * 13 + quad) > 0.75 ? 2 : 0];
        for (let v = 0; v < 6; v++) col.push(c.r, c.g, c.b);
      }
    }
  }
  g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals(); pendCache.set(qu, g); return g;
};
const PEND_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true, roughness: 0.82 });
const PEND_GLOW = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true, roughness: 0.82, emissive: new THREE.Color("#ffb020"), emissiveIntensity: 0.35 });

/** arco: 15 aduelas (meia-coroa de raio 4,4 a 5,6, 1,2 de fundo), extrudadas para fora do quadrado */
const NV = 15;
const VOUS = Array.from({ length: NV }, (_, i) => {
  const a0 = (i / NV) * PI, a1 = ((i + 1) / NV) * PI, sh = new THREE.Shape(), n = 4;
  sh.moveTo(AO * Math.cos(a0), AO * Math.sin(a0));
  for (let k = 1; k <= n; k++) { const a = lerp(a0, a1, k / n); sh.lineTo(AO * Math.cos(a), AO * Math.sin(a)); }
  for (let k = n; k >= 0; k--) { const a = lerp(a0, a1, k / n); sh.lineTo(AI * Math.cos(a), AI * Math.sin(a)); }
  sh.closePath();
  return new THREE.ExtrudeGeometry(sh, { depth: AD, bevelEnabled: false, curveSegments: 4 });
});
const ARCH_XF: { p: V3; r: V3 }[] = [{ p: [0, PH, S], r: [0, 0, 0] }, { p: [0, PH, -S], r: [0, PI, 0] }, { p: [S, PH, 0], r: [0, PI / 2, 0] }, { p: [-S, PH, 0], r: [0, -PI / 2, 0] }];
const Arches: React.FC<{ t: number; dy: number }> = ({ t, dy }) => {
  const e = spread(t), k = lean(t), glow = !hookOn(t) && t > T.entre - 0.05 && t < T.triangulos + 0.4 ? 0.5 + 0.5 * Math.sin((t - T.entre) * 12) : 0;
  return (
    <G p={[0, dy, 0]}>
      {ARCH_XF.map((x, i) => (
        <G key={i} p={x.p} r={x.r}><G p={[0, -0.3 * k, e]} sc={[1 + e / S, 1, 1]}>
          {VOUS.map((g, j) => <mesh key={j} geometry={g} castShadow receiveShadow material={mat(j % 2 ? BRICK3 : j === 7 ? STONE : BRICK, glow > 0 ? { emissive: "#ffc400", ei: Math.round(glow * 6) / 10 } : {})} />)}
          {/* rachadura na crista quando os arcos se abrem */}
          {k > 0.05 ? <G p={[0, AI + 0.1, AD + 0.02]}>{[0, 1, 2, 3].map((s) => <Box key={s} s={[0.12, 0.42 * k, 0.04]} p={[(s % 2 ? 0.12 : -0.12) * k, 0.3 * s * k, 0]} r={[0, 0, s % 2 ? 0.5 : -0.5]} c="#1c1208" cast={false} />)}</G> : null}
        </G></G>
      ))}
    </G>
  );
};

const PIER_C: [number, number][] = [[S, S], [-S, S], [-S, -S], [S, -S]];
const Piers: React.FC<{ t: number; dy: number }> = ({ t, dy }) => {
  const a = LEAN_A * lean(t) * 0.7071;
  return (
    <G p={[0, dy, 0]}>
      {PIER_C.map(([x, z], i) => {
        const sx = Math.sign(x), sz = Math.sign(z);
        return (
          <G key={i} p={[x + sx, 0, z + sz]} r={[sz * a, 0, -sx * a]}>
            <Box s={[2, PH, 2]} p={[-sx, PH / 2, -sz]} c={STONE} />
            <Box s={[2.3, 0.35, 2.3]} p={[-sx, PH - 0.17, -sz]} c={STONE2} />
            <Box s={[2.3, 0.45, 2.3]} p={[-sx, 0.22, -sz]} c={STONE2} />
            {[0.2, 0.55].map((f) => <Box key={f} s={[2.04, 0.12, 2.04]} p={[-sx, PH * f + 1.2, -sz]} c={STONE2} cast={false} />)}
          </G>
        );
      })}
    </G>
  );
};

/** tambor das 40 janelas + calota (a cúpula), com o lanternim (cruz ou crescente) */
const CapShell: React.FC<{ a: number; h: number; c: string; f?: number; back?: boolean; o?: object; ws?: number }> = ({ a, h, c, f = 1, back, o, ws = 32 }) => {
  // calota esférica de base a e altura h: raio ρ, centro abaixo da base; f = quanto já foi fechado a partir da base
  const rho = (a * a + h * h) / (2 * h), thL = Math.asin(Math.min(1, a / rho)), yc = h - rho, ts = thL * (1 - f);
  return (
    <mesh position={[0, yc, 0]} castShadow={!back} receiveShadow material={mat(c, { ...(back ? { side: "back" as const } : {}), ...(o ?? {}) })}>
      <sphereGeometry args={[rho, ws, 12, 0, PI * 2, ts, Math.max(0.001, thL - ts)]} />
    </mesh>
  );
};
const winPhi = (k: number) => PI - ((k + 0.5) / NWIN) * PI * 2; // a 1ª no oeste (−x), varrendo pelo sul (+z) para o leste
const Drum: React.FC<{ t: number }> = ({ t }) => {
  const bay = (PI * 2) / NWIN;
  return (
    <G>
      <Cyl rt={5.2} h={0.18} p={[0, 0.09, 0]} c={BRICK} open seg={40} />
      <Cyl rt={4.8} h={0.18} p={[0, 0.09, 0]} c={GOLD2} open seg={40} o={{ side: "back" }} />
      <Cyl rt={5.2} h={0.2} p={[0, DRH - 0.1, 0]} c={BRICK} open seg={40} />
      <Cyl rt={4.8} h={0.2} p={[0, DRH - 0.1, 0]} c={GOLD2} open seg={40} o={{ side: "back" }} />
      <mesh rotation={[PI / 2, 0, 0]} position={[0, 0.002, 0]} material={mat(BRICK2, { side: "double" })}><ringGeometry args={[4.8, 5.2, 40]} /></mesh>
      {Array.from({ length: NWIN }, (_, k) => {
        const ph = winPhi(k), pb = ph + bay / 2, lit = litAt(k, t), pop = lit && !hookOn(t) ? 1 + 0.5 * (1 - prog(t, winAt(k), winAt(k) + 0.25)) : 1;
        return (
          <G key={k}>
            {/* pilarete entre janelas e o contraforte de fora */}
            <Box s={[0.36, DRH - 0.36, 0.42]} p={[5.0 * Math.cos(pb), DRH / 2, 5.0 * Math.sin(pb)]} r={[0, PI / 2 - pb, 0]} c={BRICK3} cast={false} />
            <Box s={[0.3, 1.35, 0.45]} p={[5.42 * Math.cos(pb), 0.6, 5.42 * Math.sin(pb)]} r={[0, PI / 2 - pb, 0]} c={WALL2} />
            {/* a vidraça: escura (tijolo) até acender */}
            <Box s={[0.45 * pop, 0.52 * pop, 0.08]} p={[5.0 * Math.cos(ph), DRH / 2, 5.0 * Math.sin(ph)]} r={[0, PI / 2 - ph, 0]} c={lit ? "#fff3c4" : "#5a3424"} o={lit ? { emissive: "#ffd870", ei: 1.5 } : {}} cast={false} />
          </G>
        );
      })}
    </G>
  );
};
/** cruz (igreja) ou crescente (mesquita) no alto da cúpula */
const Finial: React.FC<{ kind: "cross" | "crescent"; y: number; s?: number }> = ({ kind, y, s = 1 }) => (
  <G p={[0, y, 0]} sc={s}>
    <Cyl rt={0.08} h={0.9} p={[0, 0.45, 0]} c={GOLD2} seg={8} />
    <Sph rad={0.22} p={[0, 0.25, 0]} c={GOLD} ws={10} hs={8} o={{ metal: 0.4, rough: 0.35 }} />
    {kind === "cross" ? <><Box s={[0.14, 1.1, 0.14]} p={[0, 1.4, 0]} c={GOLD} o={{ metal: 0.4, rough: 0.35, emissive: "#a07010", ei: 0.4 }} /><Box s={[0.7, 0.14, 0.14]} p={[0, 1.6, 0]} c={GOLD} o={{ metal: 0.4, rough: 0.35, emissive: "#a07010", ei: 0.4 }} /></>
      : <mesh position={[0, 1.35, 0]} rotation={[0, 0, PI * 0.62]} material={mat(GOLD, { metal: 0.4, rough: 0.35, emissive: "#a07010", ei: 0.4 })}><torusGeometry args={[0.42, 0.1, 8, 20, PI * 1.35]} /></mesh>}
  </G>
);
const finialKind = (t: number): "cross" | "crescent" | null => (hookOn(t) ? "cross" : t < C7 - 0.02 ? null : t < T.mezquita0 + 0.45 ? "cross" : "crescent");

/** o conjunto tambor + cúpula em cima do anel; no colapso a calota cai dentro e some */
const DomeAssembly: React.FC<{ t: number; dy: number; ddy: number }> = ({ t, dy, ddy }) => {
  const x = domeXf(t); if (!x.on) return null;
  const h = domeH(t), collapsed = !hookOn(t) && t >= FALL0, gone = collapsed && t >= FALL1 && t < T.levantan;
  const fall = collapsed && t < FALL1 ? prog(t, FALL0, FALL1) : 0, sdy = -(h + 2.5) * fall * fall;
  const appear = !hookOn(t) && t >= T.levantan ? outBack(prog(t, T.levantan, T.levantan + 0.35)) : 1;
  const build = !hookOn(t) || OPEN !== "b" || t >= X1 ? 1 : 0.62 + 0.38 * ease(t, 0.0, 1.15);
  const kind = finialKind(t), fin = kind && (!hookOn(t) || OPEN !== "b" || t > 1.15);
  const sh = shakeOf(t, 1.4);
  return (
    <G p={[x.p[0] + sh[0], x.p[1] + dy + sh[1], x.pz + x.p[2] + sh[2]]} r={[x.rx, 0, 0]}><G p={[0, 0, -x.pz]}>
      <Drum t={t} />
      {!gone && fall < 1 ? (
        <G p={[0, DRH + sdy + ddy, 0]} r={[fall * 0.5, 0, fall * 0.3]} sc={[1, Math.max(0.001, appear), 1]}>
          <CapShell a={5.2} h={h + 0.2} c={LEAD} f={build} />
          <CapShell a={5.0} h={h} c={GOLD} f={build} back />
          {build >= 1 ? <Cyl rt={1.1} h={0.05} p={[0, h - 0.06, 0]} c={GOLD2} seg={20} cast={false} /> : null}
          {fin ? <Finial kind={kind!} y={h + 0.15} s={hookOn(t) && OPEN === "a" ? outBack(prog(t, DROP_A + 0.28, DROP_A + 0.45)) : 1} /> : null}
        </G>) : null}
    </G></G>
  );
};

/** meia cúpula (ombro) com a abside embaixo: x ≥ 0 no referencial local; side = +1 leste, −1 oeste */
const SemiDome: React.FC<{ side: 1 | -1; u: number; dy: number }> = ({ side, u, dy }) => {
  if (u <= 0.002) return null;
  const off = (1 - u) * 9 - 0.25 * Math.sin(PI * u) * (u > 0.7 ? 1 : 0);
  return (
    <G p={[side * (S + off), dy, 0]} r={[0, side > 0 ? 0 : PI, 0]}>
      <mesh position={[0, PH / 2, 0]} castShadow receiveShadow material={mat(WALL)}><cylinderGeometry args={[S + 0.25, S + 0.25, PH, 28, 1, true, 0, PI]} /></mesh>
      <mesh position={[0, PH / 2, 0]} receiveShadow material={mat(INWALL, { side: "back" })}><cylinderGeometry args={[S, S, PH, 28, 1, true, 0, PI]} /></mesh>
      <mesh position={[0, PH - 0.12, 0]} material={mat(STONE2)}><cylinderGeometry args={[S + 0.45, S + 0.45, 0.25, 28, 1, true, 0, PI]} /></mesh>
      <mesh position={[0, PH, 0]} castShadow receiveShadow material={mat(LEAD)}><sphereGeometry args={[S + 0.25, 28, 10, PI / 2, PI, 0, PI / 2]} /></mesh>
      <mesh position={[0, PH, 0]} receiveShadow material={mat(GOLD, { side: "back" })}><sphereGeometry args={[S, 28, 10, PI / 2, PI, 0, PI / 2]} /></mesh>
      {/* janelinhas da base da semicúpula e de cima da abside */}
      {[-60, -30, 0, 30, 60].map((d) => { const a = (d * PI) / 180; return <Box key={d} s={[0.5, 0.75, 0.1]} p={[(S + 0.27) * Math.cos(a), PH + 0.55, (S + 0.27) * Math.sin(a)]} r={[0, -a + PI / 2, 0]} c="#37434e" cast={false} />; })}
      {[-50, -17, 17, 50].map((d) => { const a = (d * PI) / 180; return <Box key={d} s={[0.6, 1.1, 0.1]} p={[(S + 0.27) * Math.cos(a), 3.6, (S + 0.27) * Math.sin(a)]} r={[0, -a + PI / 2, 0]} c="#37434e" cast={false} />; })}
    </G>
  );
};

const BUT: [number, number][] = [[S, 1], [-S, 1], [S, -1], [-S, -1]];
const Buttresses: React.FC<{ t: number; dy: number }> = ({ t, dy }) => (
  <G p={[0, dy, 0]}>
    {BUT.map(([x, sz], i) => {
      const u = buttU(t, i); if (u <= 0.002) return null;
      const s = Math.max(0.001, outBack(u));
      return (
        <G key={i} p={[x, 0, sz * 8.3]} sc={[1, s, 1]}>
          <Box s={[2.8, 9.6, 4.6]} p={[0, 4.8, 0]} c={WALL2} />
          <Box s={[3.0, 0.3, 4.6]} p={[0, 9.75, 0]} c={LEAD2} />
          <Box s={[2.9, 1.4, 4.5]} p={[0, 10.3, -sz * 0.6]} r={[sz * 0.5, 0, 0]} c={LEAD2} />
          {[2.5, 5.5].map((y) => <Box key={y} s={[0.7, 1.1, 0.08]} p={[0, y, sz * 2.22]} c="#37434e" cast={false} />)}
        </G>
      );
    })}
  </G>
);

/** paredes de tímpano (sob os arcos norte e sul) com janelas escuras por fora */
const TYMP = (() => {
  const sh = new THREE.Shape(), x0 = S - 1, a0 = Math.acos(x0 / AI);
  sh.moveTo(-x0, 0); sh.lineTo(x0, 0); sh.lineTo(x0, PH + AI * Math.sin(a0)); sh.absarc(0, PH, AI, a0, PI - a0, false); sh.lineTo(-x0, 0);
  return new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 20 });
})();
const Body: React.FC<{ t: number; dy: number }> = ({ t, dy }) => {
  if (!bodyOn(t)) return null;
  return (
    <G p={[0, dy, 0]}>
      {[1, -1].map((sz) => (
        <G key={sz}>
          <mesh geometry={TYMP} position={[0, 0, sz > 0 ? S + 0.25 : -S - 0.25]} rotation={[0, sz > 0 ? 0 : PI, 0]} castShadow receiveShadow material={mat(WALL)} />
          <mesh position={[0, 4, sz * (S + 0.24)]} rotation={[0, sz > 0 ? PI : 0, 0]} material={mat(INWALL)}><planeGeometry args={[8, 8]} /></mesh>
          {[-2.8, -1.4, 0, 1.4, 2.8].map((x) => <Box key={x} s={[0.7, 1.2, 0.06]} p={[x, 8.6 - Math.abs(x) * 0.25, sz * (S + 0.79)]} c="#37434e" cast={false} />)}
          {/* naves laterais com galeria: blocos baixos entre os contrafortes */}
          <Box s={[19, 5.4, 3.0]} p={[0, 2.7, sz * 7.7]} c={WALL} />
          <Box s={[19.4, 0.3, 3.4]} p={[0, 5.55, sz * 7.7]} c={LEAD2} />
          {[-8, -6, -2, 0, 2, 6, 8].map((x) => [1.6, 3.8].map((y) => <Box key={`${x}${y}`} s={[0.7, 1.0, 0.06]} p={[x, y, sz * 9.23]} c="#37434e" cast={false} />))}
        </G>
      ))}
      {/* nártex (oeste) e abside (leste) */}
      <Box s={[2.6, 5.2, 18.4]} p={[-11.5, 2.6, 0]} c={WALL} />
      <Box s={[3.0, 0.3, 18.8]} p={[-11.5, 5.35, 0]} c={LEAD2} />
      {[-6, -3, 0, 3, 6].map((z) => <Box key={z} s={[0.06, 1.6, 0.9]} p={[-12.83, 2.0, z]} c="#37434e" cast={false} />)}
      <mesh position={[10.2, 2.4, 0]} castShadow material={mat(WALL)}><cylinderGeometry args={[2.3, 2.3, 4.8, 18, 1, false, 0, PI]} /></mesh>
      <mesh position={[10.2, 4.8, 0]} castShadow material={mat(LEAD)}><sphereGeometry args={[2.4, 18, 8, PI / 2, PI, 0, PI / 2]} /></mesh>
      {/* chão de mármore da nave */}
      <Box s={[20, 0.06, 10.6]} p={[0, 0.03, 0]} c={MARBLE} cast={false} />
      {[-8, -4, 0, 4, 8].map((x) => <Box key={x} s={[0.08, 0.07, 10.6]} p={[x, 0.035, 0]} c="#cbbfa8" cast={false} />)}
      <Cyl rt={2.4} h={0.075} p={[0, 0.03, 0]} c="#b84a4a" seg={24} cast={false} />
    </G>
  );
};

const MINA: V3[] = [[-13.2, 0, 10.6], [12.2, 0, 10.6], [-13.2, 0, -10.6], [12.2, 0, -10.6]];
const Minarets: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {MINA.map((p, i) => {
      const u = t < T.mezquita0 - 0.05 ? 0 : outBack(prog(t, T.mezquita0 - 0.05 + i * 0.22, T.mezquita0 + 0.4 + i * 0.22)); if (u <= 0.002) return null;
      return (
        <G key={i} p={p} sc={[1, Math.max(0.001, u), 1]}>
          <Box s={[1.5, 2.2, 1.5]} p={[0, 1.1, 0]} c={STONE} />
          <Cyl rt={0.5} rb={0.58} h={12.5} p={[0, 8.4, 0]} c={STONE} seg={10} />
          <Cyl rt={0.85} h={0.3} p={[0, 14.4, 0]} c={STONE2} seg={12} />
          <Cyl rt={0.42} h={3} p={[0, 16.0, 0]} c={STONE} seg={10} />
          <Cone rad={0.55} h={3.2} p={[0, 19.1, 0]} c={LEAD} seg={10} />
          <Cyl rt={0.05} h={0.8} p={[0, 21.0, 0]} c={GOLD} seg={6} />
        </G>
      );
    })}
  </G>
);

// ---------------------------------------------------------------- cenário: praça, cidade, mar, gaivotas
const HOUSES_L = (() => {
  const out: { p: V3; s: V3; c: string; r: string; yaw: number }[] = [];
  for (let gx = -64; gx <= 34; gx += 6.5) for (let gz = -66; gz <= 32; gz += 6.5) {
    const x = gx + (rnd(gx * 3 + gz) - 0.5) * 3, z = gz + (rnd(gz * 5 - gx) - 0.5) * 3;
    if (x > -21 && x < 21 && z > -18 && z < 27) continue; // a praça (e a borda sul, onde ficam câmeras baixas)
    if (Math.hypot(x + 22.5, z + 0 - 27.5) < 5.5) continue; // a rua da câmera do terremoto
    if (Math.hypot(x + 16, z - 33) < 6) continue; // a câmera baixa da cúpula nova (C7): o chicote varria um telhado
    if (rnd(gx * 7 + gz * 11) < 0.32) continue;
    const w = lerp(2.4, 4.2, rnd(gx + gz * 2)), d = lerp(2.4, 4.2, rnd(gx * 2 + gz)), h = lerp(1.8, 3.6, rnd(gx * 3 + gz * 7));
    out.push({ p: [x, h / 2, z], s: [w, h, d], c: HOUSES[Math.floor(rnd(gx + gz * 9) * 4)], r: ROOFS[Math.floor(rnd(gx * 9 + gz) * 3)], yaw: (rnd(gx * 13 + gz) - 0.5) * 0.4 });
  }
  return out;
})();
const CYPRESS: V3[] = [[-17, 0, 14], [-17, 0, 9], [17, 0, 16], [17, 0, 11], [-20, 0, -12], [16, 0, -14], [-20, 0, 19.5], [19, 0, 19.5], [-23, 0, 4], [22, 0, -2], [-3, 0, -17], [4, 0, -17]];
const City: React.FC<{ t: number }> = ({ t }) => {
  const inst = useMemo(() => {
    const n = HOUSES_L.length, d = new THREE.Object3D();
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.85 }), n);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4), new THREE.MeshStandardMaterial({ roughness: 0.8, flatShading: true }), n);
    HOUSES_L.forEach((h, i) => {
      d.position.set(...h.p); d.rotation.set(0, h.yaw, 0); d.scale.set(...h.s); d.updateMatrix(); walls.setMatrixAt(i, d.matrix); walls.setColorAt(i, new THREE.Color(h.c));
      d.position.set(h.p[0], h.s[1] + 0.6, h.p[2]); d.rotation.set(0, h.yaw + PI / 4, 0); d.scale.set(h.s[0] * 1.05, 1.3, h.s[2] * 1.05); d.updateMatrix(); roofs.setMatrixAt(i, d.matrix); roofs.setColorAt(i, new THREE.Color(h.r));
    });
    walls.castShadow = roofs.castShadow = true; walls.receiveShadow = roofs.receiveShadow = true;
    const cyp = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 6, 7), new THREE.MeshStandardMaterial({ color: "#2f6a2a", flatShading: true }), CYPRESS.length);
    CYPRESS.forEach((p, i) => { d.position.set(p[0], 3.2, p[2]); d.rotation.set(0, 0, 0); d.scale.set(1, lerp(0.85, 1.25, rnd(i + 3)), 1); d.updateMatrix(); cyp.setMatrixAt(i, d.matrix); });
    cyp.castShadow = true;
    return { walls, roofs, cyp };
  }, []);
  const sh = shakeOf(t, 1.0);
  return <G p={sh}><primitive object={inst.walls} /><primitive object={inst.roofs} /><primitive object={inst.cyp} /></G>;
};
const Land: React.FC<{ t: number }> = ({ t }) => {
  const tiles = useMemo(() => Array.from({ length: 19 }, (_, i) => -18 + i * 2), []);
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(GRASS)}><planeGeometry args={[900, 900]} /></mesh>
      {/* praça de pedra com juntas (textura barata: a régua precisa ver a câmera andar) */}
      <Box s={[38, 0.04, 36]} p={[0, 0.02, 1]} c={PAVE} cast={false} />
      {tiles.map((x) => <Box key={`x${x}`} s={[0.07, 0.05, 36]} p={[x, 0.025, 1]} c="#cdbf9f" cast={false} />)}
      {Array.from({ length: 18 }, (_, i) => -16 + i * 2).map((z) => <Box key={`z${z}`} s={[38, 0.05, 0.07]} p={[0, 0.026, z + 1]} c="#cdbf9f" cast={false} />)}
      {Array.from({ length: 26 }, (_, i) => <Box key={`m${i}`} s={[1.9, 0.052, 1.9]} p={[-17 + Math.floor(rnd(i * 3) * 18) * 2, 0.027, -16 + Math.floor(rnd(i * 5 + 1) * 17) * 2 + 1]} c={i % 2 ? "#dccfb2" : "#efe5cf"} cast={false} />)}
      {/* o mar ao sul e a leste, com espuma andando */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0.06, 36 + 200]} receiveShadow material={mat(SEA, { rough: 0.4 })}><planeGeometry args={[900, 400]} /></mesh>
      <mesh rotation={[-PI / 2, 0, 0]} position={[36 + 200, 0.06, -164]} receiveShadow material={mat(SEA, { rough: 0.4 })}><planeGeometry args={[400, 400]} /></mesh>
      <Box s={[120, 0.3, 2.2]} p={[-24, 0.15, 35]} c="#e8d8b0" cast={false} />
      <Box s={[2.2, 0.3, 110]} p={[35, 0.15, -20]} c="#e8d8b0" cast={false} />
      {Array.from({ length: 60 }, (_, i) => {
        const east = i % 3 === 0, u = fract(rnd(i) + t * 0.03 * (0.6 + rnd(i + 4)));
        const p: V3 = east ? [40 + rnd(i + 9) * 70, 0.09, lerp(-80, 34, u)] : [lerp(-90, 90, u), 0.09, 38 + rnd(i + 9) * 70];
        return <Box key={i} s={east ? [0.25, 0.04, lerp(1.5, 4, rnd(i + 2))] : [lerp(1.5, 4, rnd(i + 2)), 0.04, 0.25]} p={p} c="#e8f6ff" cast={false} />;
      })}
      {[0, 1, 2, 3].map((i) => {
        const x = lerp(-60, 70, fract(0.2 * i + t * 0.012)), z = 46 + i * 9;
        return (
          <G key={i} p={[x, 0.1, z]} r={[0, PI / 2, 0.04 * Math.sin(t * 1.5 + i)]}>
            <Box s={[1.0, 0.5, 3.0]} p={[0, 0.25, 0]} c="#8a5a32" /><Cyl rt={0.06} h={2.4} p={[0, 1.6, 0]} c="#6b4423" seg={6} />
            <Box s={[0.05, 1.8, 1.4]} p={[0, 1.8, 0.3]} c={i % 2 ? "#f5f0dc" : "#e0262b"} cast={false} />
          </G>
        );
      })}
    </G>
  );
};
const Gulls: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: 7 }, (_, i) => {
      const a = t * (0.25 + 0.05 * i) + i * 0.9, r = 16 + i * 2.2, fl = 0.5 * Math.sin(t * 9 + i * 2);
      return (
        <G key={i} p={[r * Math.cos(a), 21 + i * 0.8 + Math.sin(t + i), r * Math.sin(a) + 4]} r={[0, -a, 0]}>
          <Box s={[0.9, 0.06, 0.3]} p={[0.42, 0, 0]} r={[0, 0, fl]} c="#ffffff" cast={false} /><Box s={[0.9, 0.06, 0.3]} p={[-0.42, 0, 0]} r={[0, 0, -fl]} c="#ffffff" cast={false} />
        </G>
      );
    })}
  </G>
);

// ---------------------------------------------------------------- o canteiro (C1 → C2): materiais, multidão, o imperador e o fantasma
const pp = (t: number, a: number) => (t < a ? 0 : Math.max(0.001, outBack(prog(t, a, a + 0.3))));
const BrickStack: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <G p={p} sc={s}>
    <Box s={[1.8, 0.16, 1.4]} p={[0, 0.08, 0]} c="#8a5a32" />
    {Array.from({ length: 5 }, (_, r) => <Box key={r} s={[1.6, 0.26, 1.2]} p={[0, 0.3 + r * 0.27, 0]} c={r % 2 ? BRICK : BRICK3} />)}
  </G>
);
/** «No hay motores, ni acero, ni hormigón armado»: o que NÃO existe surge, leva um ✖ e some no «solo» */
const XMark: React.FC<{ t: number; a: number; y: number }> = ({ t, a, y }) => {
  const u = pp(t, a + 0.22); if (u <= 0.002) return null;
  return <G p={[0, y, 1.1]} sc={0.7 * u}>{[0.8, -0.8].map((r) => <Box key={r} s={[2.4, 0.42, 0.25]} r={[0, 0, r]} c="#ff2d2d" o={{ emissive: "#ff2d2d", ei: 0.4 }} cast={false} />)}</G>;
};
const NoHay: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= T.nohay - 0.05 && t < T.ladrillo)) return null;
  const gone = 1 - ease(t, T.solo - 0.1, T.solo + 0.2), sc = (a: number) => Math.max(0.001, pp(t, a) * gone);
  return (
    <G>
      <G p={[-9.6, 0, 8.4]} sc={sc(T.nohay)}>
        <G p={[0, 1.35, 0]} r={[0, 0.5, t * 3]}>
          <Cyl rt={0.95} h={0.4} r={[PI / 2, 0, 0]} c="#8a96a2" o={{ metal: 0.5, rough: 0.4 }} seg={16} />
          {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[0.35, 0.4, 0.36]} p={[1.1 * Math.cos((i * PI) / 4), 1.1 * Math.sin((i * PI) / 4), 0]} r={[0, 0, (i * PI) / 4]} c="#8a96a2" o={{ metal: 0.5, rough: 0.4 }} />)}
          <Cyl rt={0.28} h={0.5} r={[PI / 2, 0, 0]} c="#3a4450" seg={10} />
        </G>
        <XMark t={t} a={T.nohay} y={1.35} />
      </G>
      <G p={[-6.6, 0, 7.6]} sc={sc(T.acero)}>
        <G p={[0, 0.6, 0]} r={[0, 0.4, 0]}>
          <Box s={[3.0, 0.14, 0.9]} p={[0, 0.5, 0]} c="#5f7ea0" o={{ metal: 0.5, rough: 0.35 }} /><Box s={[3.0, 0.14, 0.9]} p={[0, -0.5, 0]} c="#5f7ea0" o={{ metal: 0.5, rough: 0.35 }} />
          <Box s={[3.0, 0.9, 0.14]} c="#5f7ea0" o={{ metal: 0.5, rough: 0.35 }} />
        </G>
        <XMark t={t} a={T.acero} y={0.8} />
      </G>
      <G p={[-3.8, 0, 7.0]} sc={sc(T.hormigon)}>
        <Box s={[1.6, 0.5, 1.0]} p={[0, 0.25, 0]} c="#3a4450" />
        <G p={[0, 1.25, 0]} r={[0, 0, 0.5]}><G r={[0, t * 4, 0]}><Cyl rt={0.55} rb={0.8} h={1.4} c="#ff8a1a" seg={10} /><Cyl rt={0.3} rb={0.55} h={0.5} p={[0, 0.95, 0]} c="#ff8a1a" seg={10} /></G></G>
        <XMark t={t} a={T.hormigon} y={1.2} />
      </G>
      <Puffs t={t} p={[-6.6, 0.1, 7.8]} n={9} period={0.5} rise={1.4} size={1.0} c="#eadfc8" on={t > T.solo - 0.1 && t < T.solo + 0.45 ? 1 : 0} drift={[3, 0, 0.5]} />
    </G>
  );
};
const Site: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= C1 - 0.02 && t < C2)) return null;
  const crew = Array.from({ length: 16 }, (_, j) => {
    const lane = j % 4, k = Math.floor(j / 4), u = fract(0.1 * k + (t - T.miles) * 0.12), x = lerp(16, -6, Math.min(1, (t - T.miles + 0.6) * 0.45 + k * 0.08));
    return { p: [x - k * 1.6 + lane * 0.3, 0, 12.5 + lane * 1.2 + 0.2 * Math.sin(u * 6)] as V3, yaw: -PI / 2, pose: "walk" as PoseName, ph: j * 0.37 };
  });
  return (
    <G>
      {[[-9.5, 0, 9.5], [-7.4, 0, 11.2], [-10.2, 0, 12.6], [-8.0, 0, 8.4]].map((p, i) => <BrickStack key={i} p={p as V3} s={pp(t, T.ladrillo - 0.05 + i * 0.1)} />)}
      {[[-4.6, 0, 10.0], [-3.0, 0, 12.0], [-5.2, 0, 12.4]].map((p, i) => <G key={i} p={p as V3} sc={pp(t, T.piedra - 0.05 + i * 0.1)}><Box s={[1.5, 1.0, 1.1]} p={[0, 0.5, 0]} c={i % 2 ? STONE : STONE2} /></G>)}
      {[[-0.4, 0, 10.4], [1.0, 0, 11.8], [-1.4, 0, 12.6]].map((p, i) => (
        <G key={i} p={p as V3} sc={pp(t, T.mortero - 0.05 + i * 0.1)}>
          <Cyl rt={0.7} rb={0.55} h={0.6} p={[0, 0.3, 0]} c="#7a5a3a" seg={12} /><Cyl rt={0.62} h={0.04} p={[0, 0.58, 0]} c="#d8d2c2" seg={12} />
          <Box s={[0.08, 0.5, 0.08]} p={[0.3, 0.8, 0]} r={[0, 0, 0.5]} c="#6b4423" />
        </G>
      ))}
      {t >= T.miles - 0.3 ? <Crowd list={crew} t={t} c={BYZ2} /> : null}
      {t >= T.miles - 0.3 ? <Crowd list={crew.slice(0, 6).map((m, i) => ({ ...m, p: [m.p[0] + 0.8, 0, m.p[2] + 0.55] as V3, ph: i * 0.5 + 0.2 }))} t={t} c={BYZ3} /> : null}
    </G>
  );
};
/** X3: o imperador quer «una cúpula redonda gigante sobre una planta cuadrada» — fantasma amarelo no céu, quadrado aceso no chão */
export const EMP_P: V3 = [-2.6, 0, 10.6];
const Emperor: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= X3 - 0.02 && t < C2)) return null;
  const pose = t < T.justiniano + 0.4 ? "present" : t < T.planta - 0.1 ? "point" : "present";
  const gs = t < T.cupula0 ? 0 : outBack(prog(t, T.cupula0, T.cupula0 + 0.45)) * (1 + 0.15 * ease(t, T.gigante, T.gigante + 0.3));
  const sq = ease(t, T.planta - 0.05, T.planta + 0.35), pulse = 0.75 + 0.25 * Math.sin(t * 9);
  const SC = 1.35, headY = (1.55 + 0.2 + 0.24) * SC;
  return (
    <G>
      <Worker p={EMP_P} yaw={0.35} pose={poseOf(pose as PoseName, t)} t={t} c={EMP} scale={SC} />
      {/* coroa */}
      <G p={[EMP_P[0], headY + poseOf(pose as PoseName, t).hop * SC, EMP_P[2]]}>
        <Cyl rt={0.36 * SC} h={0.16 * SC} c={GOLD} seg={12} o={{ metal: 0.5, rough: 0.3 }} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Cone key={i} rad={0.07 * SC} h={0.2 * SC} seg={4} p={[0.34 * SC * Math.cos((i * PI) / 3), 0.15 * SC, 0.34 * SC * Math.sin((i * PI) / 3)]} c={GOLD} />)}
        <Sph rad={0.06 * SC} p={[0, 0.02, 0.36 * SC]} c="#e0262b" ws={8} hs={6} />
      </G>
      {/* manto */}
      <Box s={[0.7 * SC, 1.0 * SC, 0.1]} p={[EMP_P[0] - 0.06, 1.15 * SC, EMP_P[2] - 0.32 * SC]} r={[0.1, 0.35, 0]} c="#4a1a6a" cast={false} />
      {/* o pódio */}
      <Box s={[2.2, 0.3, 1.8]} p={[EMP_P[0], -0.05, EMP_P[2]]} c={MARBLE} />
      {gs > 0.002 ? (
        <G p={[0, RING + 1.2, 0]} sc={gs}>
          <CapShell a={5.2} h={4.2} c="#ffe066" o={GHOST} />
          <Cyl rt={5.2} h={0.9} p={[0, -0.45, 0]} c="#ffe066" open o={GHOST} seg={32} />
        </G>) : null}
      {sq > 0.01 ? (
        <G>
          {[[0, S, 10.4, 0.25], [0, -S, 10.4, 0.25], [S, 0, 0.25, 10.4], [-S, 0, 0.25, 10.4]].map(([x, z, w, d], i) => <Box key={i} s={[w * sq, 0.08, d * sq]} p={[x, 0.08, z]} c="#ffd400" o={{ emissive: "#ffb000", ei: Math.round(pulse * 10) / 10 }} cast={false} />)}
          {PIER_C.map(([x, z], i) => <Box key={i} s={[2 * sq, 0.12, 2 * sq]} p={[x, 0.1, z]} c="#ffd400" o={{ emissive: "#ff9a00", ei: 0.7, opacity: 0.85 }} cast={false} />)}
        </G>) : null}
    </G>
  );
};

// ---------------------------------------------------------------- C2: as quinas vazias (o círculo não assenta no quadrado)
const VOID = (() => {
  const sh = new THREE.Shape(); sh.moveTo(S, 0); sh.lineTo(S, S); sh.lineTo(0, S); sh.absarc(0, 0, S, PI / 2, 0, true);
  return new THREE.ShapeGeometry(sh, 16);
})();
const Voids: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.esquinas - 0.05, T.esquinas + 0.15) * (1 - ease(t, T.b1 + 0.1, T.b1 + 0.5)); if (k <= 0.01 || hookOn(t)) return null;
  const o = q(k * (0.45 + 0.3 * (0.5 + 0.5 * Math.sin(t * 14))));
  return (
    <G p={[0, RING + 0.15, 0]}>
      {[0, 1, 2, 3].map((i) => <mesh key={i} geometry={VOID} rotation={[-PI / 2, 0, (i * PI) / 2]} renderOrder={15} material={flat("#ff2d2d", o)} />)}
    </G>
  );
};
/** C3: o anel de ouro quando as pechinas fecham o círculo */
const RingGlow: React.FC<{ t: number }> = ({ t }) => {
  const k = win2(t, T.alCirculo - 0.05, T.pechinas + 0.5, 0.15); if (k <= 0.01) return null;
  return <mesh position={[0, RING + 0.05, 0]} rotation={[PI / 2, 0, 0]} material={mat("#ffd400", { emissive: "#ffb000", ei: 1.2, opacity: q(0.9 * k), depthWrite: false })}><torusGeometry args={[S, 0.16, 8, 48]} /></mesh>;
};
const win2 = (t: number, a: number, b: number, f = 0.2) => clamp(Math.min((t - a) / f, (b - t) / f));

// ---------------------------------------------------------------- empuxo: setas
const RED = "#ff3b30", GREEN = "#38d66b";
const ThrustArrows: React.FC<{ t: number }> = ({ t }) => {
  if (hookOn(t) || t < X5 || t >= X7) return null;
  const out = win2(t, T.empuja - 0.05, T.s2 + 0.6, 0.15), grow = ease(t, T.empuja - 0.05, T.empuja + 0.5), puls = 1 + 0.12 * Math.sin(t * 10);
  const e = spread(t), y0 = RING + 0.6 - 0.45 * lean(t);
  const ew = ease(t, T.apoyan - 0.1, T.apoyan + 0.35), ns = ease(t, T.contrafuertes + 0.3, T.macizos + 0.2);
  const arr: React.ReactNode[] = [];
  // 1) o empurrão para fora, em 8 direções (some quando os ombros recebem)
  for (let i = 0; i < 8; i++) {
    const a = (i * PI) / 4, axis = i % 2 === 0, held = axis ? (i === 0 || i === 4 ? ew : ns) : Math.max(ew, ns);
    const o = out * (1 - held), r0 = 5.4 + e;
    if (o > 0.02) arr.push(<Arrow key={`o${i}`} a={[r0 * Math.cos(a), y0, r0 * Math.sin(a)]} b={[(r0 + 2.6 * puls) * Math.cos(a), y0 - 1.0, (r0 + 2.6 * puls) * Math.sin(a)]} c={RED} k={grow} o={o} w={0.22} />);
  }
  // 2) os ombros (semicúpulas) recebem a leste e a oeste; 3) os contrafortes ao norte e ao sul
  const keep = 1 - ease(t, C4 - 0.1, C4 + 0.1);
  for (const sx of [1, -1]) arr.push(<Arrow key={`e${sx}`} a={[sx * 5.6, RING + 0.8, 0]} b={[sx * 9.4, PH + 1.1, 0]} c={GREEN} k={ew} o={ew * keep} w={0.24} />);
  for (const sz of [1, -1]) for (const sx of [1, -1]) arr.push(<Arrow key={`n${sz}${sx}`} a={[sx * 1.8, RING + 0.3, sz * 6.0]} b={[sx * 4.6, 10.4, sz * 8.0]} c={GREEN} k={ns} o={ns * keep} w={0.22} />);
  return <G>{arr}</G>;
};
/** C4: o empuxo desce em chevrons pelos ombros e pelos contrafortes até o chão (anéis de poeira no «suelo») */
const PATHS: V3[][] = [
  [[-5.8, RING + 0.9, 0], [-9.6, PH + 0.9, 0], [-10.6, PH - 0.6, 0], [-10.6, 0.25, 0]],
  [[5.8, RING + 0.9, 0], [9.6, PH + 0.9, 0], [10.6, PH - 0.6, 0], [10.6, 0.25, 0]],
  [[-2.0, RING + 0.3, 6.2], [-5.0, 10.6, 9.0], [-5.0, 9.4, 10.9], [-5.0, 0.25, 10.9]],
  [[2.0, RING + 0.3, 6.2], [5.0, 10.6, 9.0], [5.0, 9.4, 10.9], [5.0, 0.25, 10.9]],
];
const along = (path: V3[], u: number): { p: V3; d: V3 } => {
  const L = path.slice(1).map((b, i) => Math.hypot(b[0] - path[i][0], b[1] - path[i][1], b[2] - path[i][2])), tot = L.reduce((a, b) => a + b, 0);
  let s = u * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++; }
  const a = path[i], b = path[i + 1], f = Math.min(1, s / L[i]);
  return { p: vlerp(a, b, f), d: [(b[0] - a[0]) / L[i], (b[1] - a[1]) / L[i], (b[2] - a[2]) / L[i]] };
};
const FlowDown: React.FC<{ t: number }> = ({ t }) => {
  const k = win2(t, T.empuje - 0.1, T.semicupulas + 0.6, 0.2); if (k <= 0.01 || hookOn(t)) return null;
  const reach = ease(t, T.empuje - 0.1, T.suelo + 0.2), land = t >= T.suelo + 0.15;
  return (
    <G>
      {PATHS.map((path, pi) => (
        <G key={pi}>
          {Array.from({ length: 4 }, (_, i) => {
            const u = fract(i / 4 + t * 0.55); if (u > reach) return null;
            const { p, d } = along(path, u), b: V3 = [p[0] + d[0] * 1.7, p[1] + d[1] * 1.7, p[2] + d[2] * 1.7];
            return <Arrow key={i} a={p} b={b} c={GREEN} w={0.32} o={k} />;
          })}
          {land ? <G p={[path[3][0], 0.12, path[3][2]]}>
            <mesh rotation={[-PI / 2, 0, 0]} renderOrder={18} material={flat("#38d66b", q(0.7 * (1 - prog(t, T.suelo + 0.15, T.suelo + 1.2))))}><ringGeometry args={[0.5 + 2.2 * prog(t, T.suelo + 0.15, T.suelo + 1.2), 0.9 + 2.4 * prog(t, T.suelo + 0.15, T.suelo + 1.2), 24]} /></mesh>
            <Puffs t={t} p={[0, 0, 0]} n={7} period={0.7} rise={1.4} size={0.55} c="#e8dcc4" on={t < T.suelo + 1.0 ? 1 : 0} drift={[0.6, 0, 0.4]} />
          </G> : null}
        </G>
      ))}
    </G>
  );
};
/** X11: o perfil velho (calota baixa, fantasma) contra o novo (meia esfera); setas do peso na base de cada um */
const capT = (a: number, h: number) => { const rho = (a * a + h * h) / (2 * h), th = Math.asin(Math.min(1, a / rho)); return { rho, th, yc: h - rho }; };
const Profiles: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= X11 - 0.02 && t < C7 + 0.6)) return null;
  const g = win2(t, T.levantan, C7 + 0.5, 0.25), old = capT(5.2, H_OLD + 0.2);
  const oa = ease(t, T.asi - 0.05, T.asi + 0.4), na = ease(t, T.baja1 - 0.05, T.baja1 + 0.4), side = lerp(1, 0.25, ease(t, T.menos - 0.05, T.menos + 0.5));
  const h = domeH(t) + 0.2, nw = capT(5.2, h), y0 = DB;
  // traço do perfil velho por cima de tudo (tracejado amarelo)
  const dash = Array.from({ length: 22 }, (_, i) => {
    if (i % 2) return null;
    const a0 = -old.th + (2 * old.th * i) / 22, a1 = -old.th + (2 * old.th * (i + 1)) / 22;
    const A: V3 = [old.rho * Math.sin(a0), y0 + old.yc + old.rho * Math.cos(a0), 0], B: V3 = [old.rho * Math.sin(a1), y0 + old.yc + old.rho * Math.cos(a1), 0];
    const { p, r, len } = pipeXf(A, B);
    return <mesh key={i} position={p} rotation={r} renderOrder={19} material={flat("#ffd400", q(g))}><cylinderGeometry args={[0.11, 0.11, len, 6]} /></mesh>;
  });
  const tang = (c: { th: number }, sx: number): V3 => [sx * Math.cos(c.th), -Math.sin(c.th), 0];
  const base = (c: { rho: number; th: number; yc: number }, sx: number, up: number): V3 => [sx * c.rho * Math.sin(c.th - up), y0 + c.yc + c.rho * Math.cos(c.th - up), 0];
  return (
    <G>
      {dash}
      {[1, -1].map((sx) => {
        const ob = base(old, sx, 0.32), ot = tang(old, sx), nb = base(nw, sx, 0.2), nt = tang(nw, sx);
        return (
          <G key={sx}>
            <Arrow a={ob} b={[ob[0] + ot[0] * 3.2, ob[1] + ot[1] * 3.2, ob[2]]} c={RED} k={oa} o={oa * (1 - 0.65 * na)} w={0.2} />
            <Arrow a={nb} b={[nb[0] + nt[0] * 3.4, nb[1] + nt[1] * 3.4, nb[2]]} c={GREEN} k={na} o={na} w={0.24} />
            <Arrow a={[sx * 5.6, DB + 0.15, 0]} b={[sx * (5.6 + 2.6 * side), DB + 0.15, 0]} c={RED} k={oa} o={oa} w={0.2} />
          </G>
        );
      })}
    </G>
  );
};

// ---------------------------------------------------------------- C2: as quinas; colapso; reconstrução; o giro; reparos
/** C6: a calota cai dentro — tijolos voando e a nuvem de pó saindo pelo tambor */
const Collapse: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= FALL0 - 0.02 && t < T.levantan + 0.4)) return null;
  const dust = ease(t, FALL0, FALL0 + 0.4) * (1 - ease(t, T.c3, T.levantan + 0.3));
  return (
    <G>
      {Array.from({ length: 16 }, (_, i) => {
        const u = prog(t, FALL0 + 0.05 + rnd(i) * 0.2, FALL0 + 1.2 + rnd(i + 3) * 0.3); if (u <= 0 || u >= 1) return null;
        const a = rnd(i + 7) * PI * 2, sp = lerp(3, 7, rnd(i + 11));
        return <Box key={i} s={[0.5, 0.25, 0.3]} p={[Math.cos(a) * (3.5 + sp * u), DB + 2.5 + 5 * u - 14 * u * u, Math.sin(a) * (3.5 + sp * u)]} r={[u * 9, u * 5, 0]} c={i % 2 ? BRICK : LEAD} />;
      })}
      <Puffs t={t} p={[0, DB + 0.5, 0]} n={12} period={1.6} rise={9} size={2.8 * dust} c="#d8ccb4" on={dust} drift={[2.5, 0, 1.2]} />
      <Puffs t={t} p={[3, DB, 2]} n={8} period={1.3} rise={6} size={2.0 * dust} c="#cbbfa6" on={dust} drift={[-1.5, 0, 2]} o={0.3} />
    </G>
  );
};
/** a reconstrução (b3 → levantan): andaimes no tambor e operários andando em volta */
const Rebuild: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= T.b3 - 0.1 && t < X11)) return null;
  const k = ease(t, T.b3, T.b3 + 0.6);
  const ring = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * PI * 2 + (t - T.b3) * 0.35; return { p: [5.0 * Math.cos(a), DB, 5.0 * Math.sin(a)] as V3, yaw: -a, pose: (i % 2 ? "walk" : "chisel") as PoseName, ph: i * 0.4 }; });
  return (
    <G>
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * PI * 2; return <Cyl key={i} rt={0.07} h={4.2 * k} p={[4.4 * Math.cos(a), DB + 2.1 * k, 4.4 * Math.sin(a)]} c="#9a6a3a" seg={6} />; })}
      <mesh position={[0, DB + 4.2 * k, 0]} rotation={[PI / 2, 0, 0]} material={mat("#8a5a32")}><torusGeometry args={[4.4, 0.08, 6, 36]} /></mesh>
      <Crowd list={ring} t={t} c={BYZ2} scale={0.9} />
    </G>
  );
};
/** o giro: o museu (placa e turistas com flash), que sai quando volta a ser mesquita */
const Museum: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= XC[12] - 0.02 && t < X14)) return null;
  const u = t < T.museo ? 0 : outBack(prog(t, T.museo, T.museo + 0.35)), off = ease(t, T.hoy, T.hoy + 0.45);
  const tour = Array.from({ length: 9 }, (_, i) => ({ p: [-5 + i * 1.3 + (rnd(i) - 0.5), 0, 12.2 + rnd(i + 3) * 2.2] as V3, yaw: PI + (rnd(i + 5) - 0.5) * 0.8, pose: (i % 3 === 0 ? "point" : "idle") as PoseName, ph: i * 0.3 }));
  return (
    <G>
      <G p={[0, -6 * off, 14.6]} sc={[Math.max(0.001, u), Math.max(0.001, u), 1]}>
        {[-2.6, 2.6].map((x) => <Cyl key={x} rt={0.14} h={4} p={[x, 2, 0]} c="#6b4423" seg={8} />)}
        <Box s={[6.4, 1.8, 0.25]} p={[0, 3.6, 0]} c="#14202b" />
        <Box s={[6.0, 1.4, 0.27]} p={[0, 3.6, 0]} c="#ffd400" />
        {[-2, -1, 0, 1, 2].map((x) => <Box key={x} s={[0.5, 0.9, 0.3]} p={[x * 1.05, 3.6, 0.02]} c="#14202b" />)}
      </G>
      {u > 0.01 && off < 0.95 ? TOURS.map((c, i) => <Crowd key={i} list={tour.filter((_, j) => j % 3 === i).map((m) => ({ ...m, p: [m.p[0], -3 * off, m.p[2]] as V3 }))} t={t} c={c} />) : null}
      {u > 0.01 && off < 0.5 ? tour.map((m, i) => { const f = fract(t * 1.3 + rnd(i) * 3) < 0.08; return f ? <Sph key={i} rad={0.35} p={[m.p[0], 1.9, m.p[2] - 0.4]} c="#ffffff" o={{ emissive: "#ffffff", ei: 2 }} cast={false} ws={8} hs={6} /> : null; }) : null}
    </G>
  );
};
/** X14: «reparada varias veces» — remendos que acendem na cúpula com um sopro de poeira cada */
const Repairs: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= X14 - 0.02)) return null;
  const at = [T.reparada, T.reparada + 0.4, T.varias, T.varias + 0.4];
  const spots: [number, number][] = [[0.75, 0.5], [0.45, -0.35], [0.9, 1.4], [0.6, -1.2]];
  return (
    <G>
      {spots.map(([th, ph], i) => {
        const u = pp(t, at[i]); if (u <= 0.002) return null;
        const r = 5.25, p: V3 = [r * Math.sin(th) * Math.cos(ph), DB + r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)];
        return (
          <G key={i}>
            <G p={p} r={[0, -ph + PI / 2, -th]} sc={u}><Box s={[1.3, 0.12, 1.0]} c={i % 2 ? "#a7b6c6" : "#b8c6d4"} o={{ emissive: "#ffffff", ei: 0.25 * (1 - prog(t, at[i], at[i] + 0.6)) }} /></G>
            <Puffs t={t} p={p} n={5} period={0.5} rise={1.2} size={0.4} c="#f0e8d8" on={t < at[i] + 0.5 ? 1 : 0} />
          </G>
        );
      })}
    </G>
  );
};

// ---------------------------------------------------------------- interior: feixes de luz e luz quente do anel
const SHAFTS = [196, 214, 232, 250, 268, 286, 304, 322, 160, 142, 124].map((d) => (d * PI) / 180);
const Interior: React.FC<{ t: number }> = ({ t }) => {
  if (!insideOn(t)) return null;
  const rl = ringLight(t), beams = hookOn(t) ? 1 : ease(t, T.entra - 0.1, T.debajo + 0.4), float = hookOn(t) ? 0.6 : ease(t, T.flotar1 - 0.2, T.anillo + 0.3);
  return (
    <G>
      <pointLight position={[0, RING + 0.3, 0]} intensity={4 * rl + 2 * float} distance={24} decay={1.2} color="#ffd890" />
      <pointLight position={[0, 2.5, 0]} intensity={2.0 * rl} distance={14} decay={1.4} color="#ffe2b0" />
      {beams > 0.02 ? SHAFTS.map((a, i) => {
        const A: V3 = [4.9 * Math.cos(a), RING + 0.45, 4.9 * Math.sin(a)], B: V3 = [A[0] * 0.15 + 2.2, 0.05, A[2] * 0.15 - 3.6 + (i % 3) * 1.6];
        const { p, r, len } = pipeXf(A, B);
        return <mesh key={i} position={p} rotation={r} renderOrder={12} material={mat("#fff0b0", { emissive: "#ffd870", ei: 0.8, opacity: q(0.1 * beams * (0.8 + 0.2 * Math.sin(t * 2 + i))), depthWrite: false })}><cylinderGeometry args={[0.75, 0.2, len, 10, 1, true]} /></mesh>;
      }) : null}
      {float > 0.02 ? <mesh position={[0, RING + 0.45, 0]} rotation={[PI / 2, 0, 0]} renderOrder={13} material={mat("#fff2c0", { emissive: "#ffd060", ei: 1.0, opacity: q(0.32 * float), depthWrite: false })}><torusGeometry args={[4.75, 0.22, 8, 60]} /></mesh> : null}
      {/* poeira dourada no ar */}
      {beams > 0.02 ? Array.from({ length: 24 }, (_, i) => { const u = fract(rnd(i) + t * 0.08); return <Box key={i} s={[0.06, 0.06, 0.06]} p={[(rnd(i + 3) - 0.5) * 8, 1 + u * 9, (rnd(i + 5) - 0.5) * 7]} c="#fff6c8" o={{ emissive: "#ffe080", ei: 1.4 }} cast={false} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- as três aberturas (0 → «una cúpula», corte duro)
/** a: montagem relâmpago (tudo sobe do chão e a cúpula cai do céu); c: multidão em ritmo acelerado; b: o operário fecha a cúpula */
const H0 = 6, FALL_A = 0.36;
/** a cúpula paira inteira no céu (desce devagar), cai em FALL_A s e quica no tambor */
const openDomeDy = (t: number) => {
  if (OPEN !== "a" || t >= X1) return 0;
  const t0 = DROP_A - FALL_A, land = t - DROP_A;
  if (t < t0) { const k = 1 - t / t0; return H0 + k * (0.7 + 0.15 * Math.sin(t * 9)); }
  if (t < DROP_A) { const s = prog(t, t0, DROP_A); return H0 * (1 - s * s); }
  return 0.35 * Math.abs(Math.sin(land * PI / 0.16)) * Math.exp(-land * 10);
};
/** quica para cima no impacto da cúpula */
export const hopA = (t: number, k = 1) => (OPEN === "a" && t >= DROP_A && t < X1 ? k * 1.0 * Math.sin(PI * prog(t, DROP_A + 0.02, DROP_A + 0.38)) : 0);
/** posição de primeiro plano da abertura a: d = distância da câmera inicial, l = lateral (+ = direita) */
export const fgA = (d: number, l: number): V3 => [-14 + 0.42 * d + 0.9 * l, 0, 30 - 0.9 * d + 0.42 * l];
const OpenA: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "a" || t >= X1) return null;
  const crew = Array.from({ length: 10 }, (_, j) => ({ p: [lerp(-12, 12, fract(j * 0.137 + t * 0.9 * (j % 2 ? 1 : -1) + 0.5)), hopA(t, 0.5 + 0.1 * (j % 3)), 11 + (j % 3) * 1.3] as V3, yaw: j % 2 ? PI / 2 : -PI / 2, pose: "walk" as PoseName, ph: j * 0.3 }));
  // primeiro plano: três obreiros com tijolos na cabeça cruzando perto da câmera
  const fg = [0, 1, 2].map((j) => { const dir = j === 1 ? -1 : 1, l = -4.6 + 9.2 * fract(j * 0.37 + 0.12 + dir * t * 0.42), p = fgA(7.6 + j * 0.9, l); p[1] = hopA(t, 0.7); return { p, yaw: dir > 0 ? 1.13 : 1.13 - PI, pose: "walk" as PoseName, ph: j * 0.27 }; });
  const ib = t - DROP_A, rim = 5.7, yb = DB + 0.6;
  return (
    <G>
      <Crowd list={crew.map((m) => ({ ...m, ph: m.ph + t * 3 }))} t={t * 3} c={BYZ2} />
      <Crowd list={fg} t={t * 2.4} c={BYZ3} />
      {fg.map((m, i) => <Box key={i} s={[0.5, 0.42, 0.36]} p={[m.p[0], m.p[1] + 2.32, m.p[2]]} r={[0, m.yaw, 0]} c={i % 2 ? BRICK : BRICK3} />)}
      {PIER_C.map(([x, z], i) => <Puffs key={i} t={t} p={[x, 0.1, z]} n={5} period={0.45} rise={1.0} size={0.8} c="#e8dcc4" on={t < 0.7 ? 1 : 0} />)}
      {/* o impacto: anel de poeira que estoura em volta do tambor + tijolos voando */}
      {ib > 0 ? Array.from({ length: 30 }, (_, i) => { // nuvem irregular: raios, alturas e tamanhos sorteados, dois tons
        const u = prog(ib, 0.03 * rnd(i + 11), 0.5), k = 1 - (1 - u) ** 3, a = (i / 30) * PI * 2 + rnd(i) * 0.5, r = rim - 0.8 + k * (1.2 + 3.4 * rnd(i + 1));
        return <Sph key={i} rad={1} p={[Math.cos(a) * r, yb - 0.4 + k * (0.3 + 2.4 * rnd(i + 2) ** 2), Math.sin(a) * r]} sc={Math.max(0.001, (0.5 + 1.3 * rnd(i + 3)) * (0.6 + 0.9 * k) * (1 - 0.7 * u * u))} c={i % 3 ? "#eadfc8" : "#d8c6a4"} cast={false} ws={8} hs={6} o={{ rough: 1 }} />;
      }) : null}
      {ib > 0 ? Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * PI * 2 + rnd(i + 7), vh = 4 + 3 * rnd(i + 8), vy = 4 + 4 * rnd(i + 9), y = yb + vy * ib - 14 * ib * ib;
        return <Box key={i} s={[0.5, 0.26, 0.32]} p={[Math.cos(a) * (rim + vh * ib), y, Math.sin(a) * (rim + vh * ib)]} r={[ib * 11, ib * 7, ib * 5]} c={i % 2 ? BRICK : BRICK3} />;
      }) : null}
    </G>
  );
};
/** b: lá em cima, o operário assenta os últimos tijolos; tijolos voam da praça em arco até a borda que fecha */
const OpenB: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "b" || t >= X1) return null;
  const f = 0.62 + 0.38 * ease(t, 0.0, 1.15), c = capT(5.0, H_NEW), th = c.th * (1 - f), rEdge = c.rho * Math.sin(th), yEdge = DB + c.yc + c.rho * Math.cos(th);
  return (
    <G>
      {/* o andaime central com a plataforma */}
      <Cyl rt={0.12} h={DB + H_NEW - 0.6} p={[0, (DB + H_NEW - 0.6) / 2, 0]} c="#9a6a3a" seg={6} />
      <Box s={[1.8, 0.14, 1.8]} p={[0, DB + H_NEW - 0.55, 0]} c="#9a6a3a" />
      {Array.from({ length: 9 }, (_, i) => {
        const per = 0.5, u = fract((t + i * (per / 9) * 2.1) / per), a = rnd(i) * PI * 2, from: V3 = [Math.cos(a) * 13, 1.5, Math.sin(a) * 13 + 4], to: V3 = [Math.cos(a) * rEdge, yEdge, Math.sin(a) * rEdge];
        const p = vlerp(from, to, u); p[1] += 9 * u * (1 - u) + 0;
        return t < 1.2 ? <Box key={i} s={[0.42, 0.2, 0.26]} p={p} r={[u * 8, u * 4, 0]} c={i % 2 ? BRICK : BRICK3} /> : null;
      })}
      {/* a fiada que está entrando agora, girando em volta da borda */}
      {t < 1.15 ? Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * PI * 2 + t * 6; return <Box key={i} s={[0.4, 0.2, 0.25]} p={[Math.cos(a) * rEdge * 0.98, yEdge + 0.08, Math.sin(a) * rEdge * 0.98]} r={[0, -a, 0]} c={BRICK3} />; }) : null}
      <Puffs t={t} p={[0, DB + H_NEW, 0]} n={8} period={0.5} rise={1.2} size={0.7} c="#f0e6d0" on={t > 1.12 && t < 1.55 ? 1 : 0} />
    </G>
  );
};
/** c: a multidão de obreiros carregando tijolos em ritmo acelerado diante da câmera; o operário tropeça (✖) e espalha a pilha */
export const runX = (t: number) => -7.5 + 6.2 * Math.min(t, 0.95) + (t > 0.95 ? 1.4 * ease(t, 0.95, 1.4) : 0);
const OpenC: React.FC<{ t: number }> = ({ t }) => {
  if (OPEN !== "c" || t >= X1) return null;
  const crew = Array.from({ length: 14 }, (_, j) => {
    const lane = j % 3, x = lerp(-16, 16, fract(j * 0.173 + t * 0.85 * (lane === 1 ? 1.15 : 1))), z = 12.6 + lane * 1.5;
    return { p: [x, 0, z] as V3, yaw: PI / 2, pose: "walk" as PoseName, ph: j * 0.21 };
  });
  const spill = prog(t, 0.95, 1.5);
  return (
    <G>
      <Crowd list={crew} t={t * 3.2} c={BYZ2} />
      {crew.map((m, i) => <Box key={i} s={[0.5, 0.42, 0.36]} p={[m.p[0] - 0.1, 2.32, m.p[2]]} c={i % 2 ? BRICK : BRICK3} />)}
      {/* a pilha do operário: alta demais, balança e voa no tropeço */}
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = runX(t), wob = Math.sin(t * 14) * 0.06 * i, base: V3 = [x0 + wob, 2.8 + i * 0.3, 15.4];
        if (t < 0.95) return <Box key={i} s={[0.5, 0.28, 0.34]} p={base} r={[0, 0, wob * 0.6]} c={i % 2 ? BRICK : BRICK3} />;
        const vx = 1.5 + rnd(i) * 2.5, vy = 2 + rnd(i + 2) * 3, tt = (t - 0.95) * 1.0, y = Math.max(0.15, base[1] + vy * tt - 9 * tt * tt);
        return <Box key={i} s={[0.5, 0.28, 0.34]} p={[x0 + vx * tt, y, 15.4 + (rnd(i + 4) - 0.5) * 2 * spill]} r={[tt * 9, tt * 4, tt * 6]} c={i % 2 ? BRICK : BRICK3} />;
      })}
      <Puffs t={t} p={[runX(t), 0.05, 15.4]} n={6} period={0.4} rise={0.8} size={0.5} c="#e8dcc4" on={t > 1.1 && t < 1.6 ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- o mundo
export const World: React.FC<{ t: number }> = ({ t }) => {
  const H = hookOn(t), sh = shakeOf(t, 1.4);
  const d = (p: Part) => (H ? hookDy(p, t) : 0);
  const site = H || t >= C2 - 0.02;
  const vis = (p: Part) => !H || d(p) > -(TOP[p] + 0.35);
  return (
    <>
      <Sky top="#3a86d8" mid="#8cc3ee" low="#f3f1ea" />
      <Clouds t={t} n={8} y={34} />
      <G r={[0, -PI / 2, 0]}><Hills c={["#7fae5a", "#6f9e4c"]} z={-120} n={16} x0={-130} flat={0.5} /></G>
      <Hills c={["#86b660", "#77a654"]} z={-95} n={16} x0={-130} flat={0.45} />
      <Land t={t} /><City t={t} /><Gulls t={t} />
      <Site t={t} /><NoHay t={t} /><Emperor t={t} />
      <G p={sh}>
        {site && vis("piers") ? <Piers t={t} dy={d("piers")} /> : null}
        {site && vis("arches") ? <Arches t={t} dy={d("arches")} /> : null}
        {site && vis("pend") && pendU(t) > 0.003 ? (
          <G p={[0, d("pend") - 0.3 * lean(t), 0]} sc={[1 + spread(t) / S, 1, 1 + spread(t) / S]}>
            <mesh geometry={pendGeo(pendU(t))} material={!H && t > T.triangulos && t < T.pechinas + 0.4 ? PEND_GLOW : PEND_MAT} castShadow receiveShadow />
          </G>) : null}
        {site && vis("drum") ? <DomeAssembly t={t} dy={H ? d("drum") : 0} ddy={H ? d("dome") - d("drum") + openDomeDy(t) : 0} /> : null}
        {vis("semi") ? <SemiDome side={1} u={semiU(t, 1)} dy={d("semi")} /> : null}
        {vis("semi") ? <SemiDome side={-1} u={semiU(t, -1)} dy={d("semi")} /> : null}
        {vis("butt") ? <Buttresses t={t} dy={d("butt")} /> : null}
        {vis("body") ? <Body t={t} dy={d("body")} /> : null}
        <Minarets t={t} />
      </G>
      <Voids t={t} /><RingGlow t={t} /><ThrustArrows t={t} /><FlowDown t={t} /><Profiles t={t} />
      <Collapse t={t} /><Rebuild t={t} /><Museum t={t} /><Repairs t={t} /><Interior t={t} />
      <OpenA t={t} /><OpenB t={t} /><OpenC t={t} />
    </>
  );
};
