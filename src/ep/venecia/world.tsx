// Mundo do E11: Venecia de brinquedo. A ilha de barro da demonstração no centro (x -7..7, z -8..3, topo y=0,15) com a FACE
// DO CORTE em z=3: na frente dela a laguna está aberta até o fundo (buraco x -16..16, z 3..20, chão y=-7) e o que está
// «dentro» do barro aparece encostado na face (pilotes, a casa que afunda, a estaca). Laguna y=0; terra firme ao norte
// (z<-22) com o rio que desce dos Alpes (z -60..-95); barreira do Lido em z≈28 com as 3 bocas (x -14, 0, 14) e o mar além.
// Ordem: cidade pronta (gancho) → ⏪ ilha vazia → casa afunda → pilotes cravados → árvores cortadas → balsa no rio →
// estaca que apodrece × pilote enterrado → água salgada nos tijolos → pedra de Ístria → hoje: maré alta e as comportas.
import React, { useMemo } from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, outBack, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { CUTS } from "../../toy/cues";
import { DRIVE, HITS, OPEN_DEFAULT, Open, T } from "./cues";

const PI = Math.PI;
export const FZ = 3;            // a face do corte
export const TOP = 0.15;        // topo da ilha de barro
const FLOOR = -1.6;             // fundo da laguna
const DEEP = -7;                // fundo do buraco do corte
export const GIRO = CUTS[6];    // plano 8: a Venecia de hoje (cidade inteira de novo)
const MUD = "#8f6743", MUD2 = "#7a5537", MUD3 = "#a37a52", WOODF = "#b07a42", WOODR = "#d9b07a", ISTRIA = "#f6f3ea";
const WATER = "#3aa3dc", SEA = "#2c84c4", GRASS = "#7cbf55", SAND = "#ecd9a0";
const hook = (t: number) => t < T.venecia;
const giro = (t: number) => t >= GIRO - 0.02;

/** qual abertura: PROPS='{"open":"b"}' no render (constante durante o render inteiro) */
let OPEN: Open | null = null;
export const openOf = (): Open => {
  if (OPEN) return OPEN;
  try { const o = (getInputProps() as { open?: string }).open; OPEN = o === "a" || o === "b" || o === "c" ? o : OPEN_DEFAULT; } catch { OPEN = OPEN_DEFAULT; }
  return OPEN;
};
/** aberturas b e c: a cidade já está pronta e o buraco do corte fica tampado de água até «debajo» */
const covered = (t: number) => giro(t) || (t < T.debajo && openOf() !== "a");
/** abertura c: a ilha com a cidade e os pilotes já está caindo no quadro 0; em 0,4 s as pontas dos pilotes batem na água
 *  e daí a cidade vai sendo cravada, freando, até assentar pouco antes do corte de «debajo» */
export const IMPACT = 0.4;
const TIP = 4.78, SETTLE = 2.3;  // TIP: altura da ilha em que a ponta dos pilotes toca a água
export const islandY = (t: number) => {
  if (openOf() !== "c" || t >= SETTLE) return 0;
  if (t < IMPACT) { const s = IMPACT - t; return TIP + 7 * s - 3 * s * s; }   // queda acelerando: 7,1 → 4,8 (de 4,6 a 7 u/s)
  const u = prog(t, IMPACT, SETTLE);
  return TIP * (1 - u) * (1 - u) + 0.05 * Math.sin(t * 45) * (1 - u);
};
/** quando a base da ilha (o barro) encosta na água */
export const BASE_HIT = IMPACT + (SETTLE - IMPACT) * (1 - Math.sqrt((-FLOOR) / TIP));

/** cidade: 1 no gancho (pipoca em a), encolhe no ⏪ (venecia), 0 na demonstração, 1 de novo no giro */
const cityK = (t: number, a = 0) => giro(t) ? 1 : hook(t) ? (openOf() === "a" ? clamp(outBack(prog(t, a, a + 0.3)), 0, 1.15) : 1) : 1 - ease(t, T.venecia, T.venecia + 0.6);

// ---------------------------------------------------------------- níveis de água (o giro: maré alta, comportas)
export const seaY = (t: number) => (giro(t) ? 0.9 * ease(t, T.mareas - 0.6, T.mareas + 0.6) : 0);
export const lagoonY = (t: number) => (giro(t) ? 0.5 * ease(t, T.mareas - 0.5, T.mareas + 0.7) * (1 - ease(t, T.compuertas + 0.4, T.entradas + 0.8)) : 0);
const gateAng = (t: number, k: number) => (giro(t) ? ease(t, T.levanta + 0.1 + k * 0.12, T.levanta + 0.75 + k * 0.12) * 0.9 : 0);

// ---------------------------------------------------------------- relevo: barro, face do corte, laguna, terra firme, Alpes, Lido
const Strata: React.FC = () => {
  const peb = useMemo(() => {
    const n = 170, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat("#6e4c30", { flat: true }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const x = lerp(-15.8, 15.8, rnd(i * 3 + 1)), y = lerp(-6.8, -0.1, rnd(i * 3 + 2));
      o.position.set(x, Math.abs(x) > 7 && y > FLOOR ? FLOOR - 0.3 - rnd(i) * 2 : y, FZ + 0.02); o.scale.setScalar(lerp(0.05, 0.15, rnd(i * 3 + 3))); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.castShadow = false; return im;
  }, []);
  return (
    <G>
      {[-2.2, -3.0, -3.9, -4.7, -5.5, -6.3].map((y, i) => <Box key={i} s={[32, 0.13 + (i % 2) * 0.08, 0.02]} p={[0, y, FZ + 0.01]} c={i % 2 ? MUD2 : MUD3} cast={false} />)}
      {[-0.55, -1.15].map((y, i) => <Box key={i} s={[14, 0.1, 0.02]} p={[0, y, FZ + 0.01]} c={i ? MUD3 : MUD2} cast={false} />)}
      <primitive object={peb} />
    </G>
  );
};
const Lagoon: React.FC<{ t: number }> = ({ t }) => {
  const ly = lagoonY(t), sy = seaY(t);
  // laguna (z -22..28) com o buraco do corte na frente da ilha; no giro o buraco é tampado
  const geo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-300, -28); s.lineTo(300, -28); s.lineTo(300, 22); s.lineTo(-300, 22); s.closePath();
    const h = new THREE.Path(); h.moveTo(-16, -20); h.lineTo(-16, -3); h.lineTo(16, -3); h.lineTo(16, -20); h.closePath(); s.holes.push(h);
    return new THREE.ShapeGeometry(s);
  }, []);
  const ripples = useMemo(() => {
    const n = 900, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.03, 0.18), mat("#d6f1ff", { emissive: "#bfe6ff", ei: 0.25 }), n), o = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < 4000 && k < n; i++) {
      const x = lerp(-70, 70, rnd(i * 3 + 1)), z = lerp(-21.5, 27, rnd(i * 3 + 2));
      if (x > -16.5 && x < 16.5 && z > 2.5 && z < 20.5) continue;     // buraco do corte
      if (x > -7.4 && x < 7.4 && z > -8.4 && z < 3) continue;        // a ilha
      o.position.set(x, 0.03, z); o.rotation.y = (rnd(i + 5) - 0.5) * 0.5; o.scale.setScalar(lerp(0.5, 1.6, rnd(i + 9))); o.updateMatrix(); im.setMatrixAt(k++, o.matrix);
    }
    im.count = k; im.castShadow = false; im.receiveShadow = false; return im;
  }, []);
  const caps = useMemo(() => {
    const n = 700, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.04, 0.22), mat("#e8f6ff", { emissive: "#bfe6ff", ei: 0.3 }), n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(lerp(-90, 90, rnd(i * 7 + 1)), 0.04, lerp(31, 150, rnd(i * 7 + 2))); o.rotation.y = (rnd(i + 3) - 0.5) * 0.4; o.scale.setScalar(lerp(0.6, 2.0, rnd(i + 4))); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.castShadow = false; return im;
  }, []);
  return (
    <G>
      <mesh geometry={geo} position={[0, ly, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(WATER, { rough: 0.35 })} />
      <G p={[Math.sin(t * 0.4) * 0.3, ly, 0]}><primitive object={ripples} /></G>
      {covered(t) ? <Box s={[32, 0.04, 17]} p={[0, ly - 0.02, 11.5]} c={WATER} o={{ rough: 0.35 }} cast={false} /> : null}
      {/* o mar além do Lido */}
      <mesh position={[0, sy - 0.01, 165]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(openOf() === "c" && t < T.debajo ? WATER : SEA, { rough: 0.35 })}><planeGeometry args={[600, 274]} /></mesh>
      <G p={[Math.sin(t * 0.5) * 0.5, sy, 0]}><primitive object={caps} /></G>
    </G>
  );
};
/** a ilha de barro, o fundo da laguna e o buraco do corte (só a face em z=3 importa) */
const Section: React.FC<{ t: number }> = ({ t }) => {
  const pave = cityK(t, -0.4), iy = islandY(t), open = !covered(t);
  // «barro blando»: a superfície treme como gelatina quando a voz diz «blando» e quando a casa pousa
  const jig = Math.max(ease(t, T.blando - 0.05, T.blando + 0.1) * (1 - ease(t, T.blando + 0.5, T.pones)), ease(t, T.encima - 0.1, T.encima) * (1 - ease(t, T.encima + 0.2, T.hunde + 0.4))) * (hook(t) || giro(t) ? 0 : 1);
  return (
    <G>
      <Box s={[32, 5.4, 33]} p={[0, (DEEP + FLOOR) / 2, FZ - 16.5]} c={MUD} />
      <G p={[0, iy, 0]}>
      <Box s={[14, TOP - FLOOR, 11]} p={[0, (TOP + FLOOR) / 2, FZ - 5.5]} c={MUD} />
      <Box s={[14, 0.02, 11]} p={[0, TOP + 0.002 + 0.05 * jig * Math.sin(t * 26), FZ - 5.5]} c={MUD3} sc={[1, 1, 1]} cast={false} />
      {jig > 0.02 ? [0, 1, 2].map((k) => { const u = fract(t * 1.6 + k / 3); return <mesh key={k} position={[4.0, TOP + 0.03, 1.6]} rotation={[-PI / 2, 0, 0]} material={mat("#6b4a2e")}><ringGeometry args={[0.4 + u * 2.6, 0.5 + u * 2.6, 24]} /></mesh>; }) : null}
      {/* pavimento da cidade (gancho e giro) */}
      {pave > 0.01 ? <Box s={[13.8, 0.06, 10.8]} p={[0, TOP + 0.03, FZ - 5.5]} sc={[Math.max(0.01, pave), 1, Math.max(0.01, pave)]} c="#d9cfbf" cast={false} /> : null}
      </G>
      {/* água da laguna em seção dos dois lados da ilha */}
      {[-11.5, 11.5].map((x) => <Box key={x} s={[9, -0.02 - FLOOR, 33]} p={[x, (FLOOR - 0.02) / 2, FZ - 16.5]} c="#5fb8e6" o={{ opacity: 0.78 }} cast={false} />)}
      {open ? <Strata /> : null}
      {/* o buraco: chão e paredes, com o filete do corte (some quando a laguna está tampada) */}
      {open ? <G>
      <Box s={[32.8, 0.4, 17]} p={[0, DEEP - 0.2, FZ + 8.5]} c="#6a4a30" />
      {[-16.2, 16.2].map((x) => <G key={x}><Box s={[0.4, TOP - DEEP, 17]} p={[x, (TOP + DEEP) / 2, FZ + 8.5]} c={MUD2} /><Box s={[0.42, 1.6, 17]} p={[x, -0.8, FZ + 8.5]} c="#5fb8e6" cast={false} /></G>)}
      <Box s={[32.8, TOP - DEEP, 0.4]} p={[0, (TOP + DEEP) / 2, FZ + 17.2]} c={MUD2} />
      {[[-16.2, FZ + 8.5, 0.12, 17], [16.2, FZ + 8.5, 0.12, 17], [0, FZ + 17.2, 32.8, 0.12]].map(([x, z, w, d], i) => <Box key={i} s={[w, 0.06, d]} p={[x, 0.06, z]} c="#ffe9a8" o={{ emissive: "#ffe9a8", ei: 0.3 }} cast={false} />)}
      </G> : null}
    </G>
  );
};
const Mainland: React.FC = () => (
  <G>
    <Box s={[600, 2.4, 278]} p={[0, 0.35 - 1.2, -22 - 139]} c={GRASS} />
    <Box s={[600, 0.1, 1.6]} p={[0, 0.36, -22.8]} c={SAND} cast={false} />
    {/* os Alpes: picos com neve */}
    {([[-44, -86, 22, 40], [-14, -96, 28, 52], [16, -88, 22, 42], [46, -92, 24, 46], [-72, -80, 18, 30], [74, -80, 18, 32], [-26, -66, 13, 17], [4, -70, 12, 15], [30, -66, 13, 18]] as const).map(([x, z, r, h], i) => (
      <G key={i}><Cone rad={r} h={h} seg={7} p={[x, h / 2, z]} c={i % 2 ? "#6f8f6a" : "#7f9a74"} o={{ flat: true }} cast={false} />
        {h > 25 ? <Cone rad={r * 0.33} h={h * 0.33} seg={7} p={[x, h * 0.835, z]} c="#f4f8fb" o={{ flat: true }} cast={false} /> : null}</G>
    ))}
  </G>
);
// o rio que desce dos Alpes até a laguna
const RIVER: V3[] = [[-19, 0, -66], [-15.6, 0, -51], [-13.9, 0, -43], [-12.8, 0, -36], [-11, 0, -29], [-10, 0, -22.2]];
const segs = (pts: V3[]) => { const L: number[] = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2])); return L; };
export const along = (pts: V3[], u: number): { p: V3; yaw: number } => {
  const L = segs(pts), d = clamp(u) * L[L.length - 1];
  let i = 1; while (i < pts.length - 1 && L[i] < d) i++;
  const a = pts[i - 1], b = pts[i], v = prog(d, L[i - 1], L[i]);
  return { p: [lerp(a[0], b[0], v), 0, lerp(a[2], b[2], v)], yaw: Math.atan2(b[0] - a[0], b[2] - a[2]) };
};
const riverX = (z: number) => { for (let i = 1; i < RIVER.length; i++) if (z <= RIVER[i][2]) return lerp(RIVER[i - 1][0], RIVER[i][0], prog(z, RIVER[i - 1][2], RIVER[i][2])); return RIVER[RIVER.length - 1][0]; };
const River: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {RIVER.slice(1).map((b, i) => { const a = RIVER[i], len = Math.hypot(b[0] - a[0], b[2] - a[2]); return <Box key={i} s={[2.8, 0.06, len + 0.6]} p={[(a[0] + b[0]) / 2, 0.37, (a[2] + b[2]) / 2]} r={[0, Math.atan2(b[0] - a[0], b[2] - a[2]), 0]} c="#4fb0e6" o={{ rough: 0.3 }} cast={false} />; })}
    {Array.from({ length: 26 }, (_, k) => { const q = along(RIVER, fract(t * 0.07 + k / 26)); return <Box key={k} s={[0.12, 0.05, 0.9]} p={[q.p[0] + (rnd(k) - 0.5) * 1.6, 0.42, q.p[2]]} r={[0, q.yaw, 0]} c="#e8f6ff" o={{ emissive: "#ffffff", ei: 0.3 }} cast={false} />; })}
  </G>
);
const FOREST: V3[] = (() => {
  const out: V3[] = [];
  for (let i = 0; out.length < 60 && i < 600; i++) {
    const x = lerp(-36, 8, rnd(i * 5 + 1)), z = lerp(-64, -38, rnd(i * 5 + 2));
    if (Math.abs(x - riverX(z)) < 2.6) continue;
    if (x > -12.6 && x < -5 && z > -48 && z < -34) continue; // as árvores que serão cortadas, o operário e a câmera
    out.push([x, 0.35, z]);
  }
  return out;
})();

/** barreira do Lido em z≈28 com 3 bocas (x -14, 0, 14) e as comportas do MOSE deitadas no fundo */
export const INLETS = [-14, 0, 14];
const Lido: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {([[-80, -17], [-11, -3], [3, 11], [17, 80]] as const).map(([a, b], i) => (
      <G key={i}><Box s={[b - a, 1.4, 4]} p={[(a + b) / 2, -0.1, 28]} c={SAND} /><Box s={[b - a - 0.6, 0.2, 2.2]} p={[(a + b) / 2, 0.7, 28.2]} c="#8cc56a" cast={false} /></G>
    ))}
    {INLETS.map((x, k) => (
      <G key={x}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = gateAng(t, k * 6 + i);
          return <G key={i} p={[x - 2.5 + i, FLOOR, 28.3]} r={[-a, 0, 0]}><Box s={[0.92, 0.28, 3.7]} p={[0, 0, 1.85]} c="#ffc81a" o={{ rough: 0.5 }} /><Box s={[0.94, 0.06, 0.3]} p={[0, 0.16, 3.6]} c="#ff7a1a" cast={false} /></G>;
        })}
        {/* ar comprimido: bolhas subindo enquanto as comportas sobem */}
        <Puffs t={t} p={[x, seaY(t), 29.6]} n={8} period={0.7} rise={0.8} size={0.35} c="#e8f6ff" drift={[0, 0, 0.4]} on={giro(t) && t > T.levanta && t < T.entradas + 0.6 ? 1 : 0} />
      </G>
    ))}
  </G>
);
/** casa dos compressores (os motores do giro): engrenagem gira e solta fumaça a partir de «esas sí» */
const Compressor: React.FC<{ t: number }> = ({ t }) => {
  const on = giro(t) && t > T.levanta - 0.2 ? 1 : 0, spin = t * (t > T.esas - 0.1 ? 6 : 1.5);
  return (
    <G p={[6.5, 0.75, 28.2]}>
      <Box s={[2.4, 1.6, 1.8]} p={[0, 0.8, 0]} c="#9aa3ad" /><Box s={[2.6, 0.2, 2.0]} p={[0, 1.7, 0]} c="#6f7a85" />
      <G p={[0, 2.0, 0]} r={[0, spin, 0]}>
        <Cyl rt={0.75} h={0.25} c="#e0662b" seg={14} />
        {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.3, 0.25, 0.3]} p={[Math.cos((i / 10) * PI * 2) * 0.88, 0, Math.sin((i / 10) * PI * 2) * 0.88]} r={[0, -(i / 10) * PI * 2, 0]} c="#e0662b" />)}
        <Cyl rt={0.2} h={0.3} c="#3a3a3a" seg={8} />
      </G>
      <Cyl rt={0.18} h={1.4} p={[0.85, 2.3, -0.5]} c="#5a6068" seg={8} />
      <Puffs t={t} p={[0.85, 3.0, -0.5]} n={7} period={1.2} rise={2.6} size={0.45} c="#e9edf0" on={on} />
      {/* tubo até a boca do meio */}
      <Pipe a={[-1.2, 0.3, 0]} b={[-6.0, 0.3, 0.2]} rad={0.14} c="#5a6068" />
    </G>
  );
};
/** ondas da maré entrando pelas bocas (e batendo nas comportas depois que sobem) */
const Tide: React.FC<{ t: number }> = ({ t }) => {
  if (!giro(t) || t < T.mareas - 0.6 || t > T.entradas + 1.2) return null;
  const blocked = ease(t, T.levanta + 0.6, T.levanta + 1.1);
  return (
    <G>
      {INLETS.map((x) => Array.from({ length: 4 }, (_, k) => {
        const u = fract(t * 0.9 + k / 4), z = blocked > 0.5 ? lerp(36, 31, u) : lerp(36, 25, u);
        return <Cone key={`${x}${k}`} rad={0.7} h={1.4} seg={3} p={[x + (k % 2 ? 0.8 : -0.8), Math.max(seaY(t), lagoonY(t)) + 0.15, z]} r={[-PI / 2, 0, 0]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.5 }} cast={false} vis={blocked < 0.5 || u < 0.9} />;
      }))}
    </G>
  );
};

// ---------------------------------------------------------------- pilotes: 23 na frente da ilha (os 7 da casa da demonstração = 15..21)
export const PX = (j: number) => 1.8 + (j - 15) * 0.55;
const RISE = 4.93; // quanto o pilote fica para fora antes de cravado (ponta encostando no barro)
const depthOf = (i: number, t: number) => DRIVE[i].hits.reduce((s, h) => s + ease(t, h - 0.03, h + 0.04) / DRIVE[i].hits.length, 0);
const demoOff = (i: number, t: number) => RISE * (1 - depthOf(i, t)) + 1.2 * (1 - ease(t, DRIVE[i].a, DRIVE[i].a + 0.16));
export const pilesDriven = (t: number) => DRIVE.filter((_, i) => depthOf(i, t) > 0.99).length;
const pileState = (j: number, t: number): { vis: boolean; off: number } => {
  if (giro(t)) return { vis: true, off: 0 };
  if (hook(t)) { if (openOf() !== "a") return { vis: true, off: 0 }; const s = -0.35 + j * 0.05; return { vis: t >= s - 0.04, off: 6 * (1 - ease(t, s, s + 0.1)) }; }
  if (t < T.venecia + 0.8) { const a = T.venecia + 0.015 * (22 - j), u = ease(t, a, a + 0.3); return { vis: u < 0.98, off: 7 * u }; }
  const i = j - 15;
  if (i >= 0 && i < 7 && t >= DRIVE[i].a) return { vis: true, off: demoOff(i, t) };
  return { vis: false, off: 0 };
};
/** brilho verde: os pilotes enterrados estão inteiros («no en este barro», «duran siglos») */
const glowAt = (t: number) => Math.max(Math.sin(PI * prog(t, T.noen - 0.1, T.noen + 1.1)), Math.sin(PI * prog(t, T.duran - 0.1, T.duran + 1.0)));
const q = (x: number, s = 0.1) => Math.round(x / s) * s;
/** «millones de troncos»: uma onda de brilho corre pelos pilotes como um contador */
const waveAt = (t: number, j: number) => { if (t < T.millones - 0.1 || t > T.clavados + 0.9) return 0; const c = lerp(-3, 26, prog(t, T.millones, T.clavados + 0.6)); return Math.max(0, 1 - Math.abs(j - c) / 2.5); };
const Piles: React.FC<{ t: number }> = ({ t }) => {
  const g0 = glowAt(t), iy = islandY(t);
  return (
    <G>
      {Array.from({ length: 23 }, (_, j) => {
        const s = pileState(j, t); if (!s.vis) return null;
        const g = q(Math.max(g0 * 0.45, waveAt(t, j) * 0.6));
        return (
          <G key={j} p={[PX(j), 0.12 + s.off + iy, FZ]}>
            <Cyl rt={0.24} h={4.4} p={[0, -2.2, 0]} c={WOODF} seg={10} o={g > 0 ? { emissive: "#9dffb0", ei: g } : undefined} />
            <Cone rad={0.24} h={0.5} seg={10} p={[0, -4.65, 0]} r={[PI, 0, 0]} c={WOODF} />
            <Cyl rt={0.245} h={0.03} p={[0, 0.0, 0]} c={WOODR} seg={10} cast={false} />
            {[-1.1, -2.6, -3.7].map((y) => <Box key={y} s={[0.04, 0.5, 0.02]} p={[0.06 * Math.sign(y + 2.6), y, 0.245]} c="#8a5a30" cast={false} />)}
          </G>
        );
      })}
    </G>
  );
};
/** o mazo do bate-estaca: sobe pela corda e cai na cabeça do pilote em cada batida (HITS), depois anda até o próximo */
export const malletAt = (t: number): { x: number; y: number } => {
  const n = HITS.findIndex((h) => h.t > t), last = HITS[HITS.length - 1];
  const nx = n < 0 ? last : HITS[n], pv = n === 0 ? null : HITS[(n < 0 ? HITS.length : n) - 1];
  const topOf = (i: number) => 0.12 + RISE * (1 - depthOf(i, t));
  const xN = PX(15 + nx.i), xP = pv ? PX(15 + pv.i) : xN, k = pv ? ease(t, pv.t + 0.05, pv.t + 0.2) : 1;
  const x = lerp(xP, xN, k), top = pv ? lerp(topOf(pv.i), topOf(nx.i), k) : topOf(nx.i);
  let lift: number;
  if (n < 0) lift = 1.4 * ease(t, last.t + 0.05, last.t + 0.4);
  else { const t0 = pv ? pv.t + 0.04 : nx.t - 0.6; lift = t < nx.t - 0.06 ? 1.4 * ease(t, t0, Math.max(t0 + 0.05, nx.t - 0.12)) : 1.4 * (1 - prog(t, nx.t - 0.06, nx.t)); }
  return { x, y: top + lift };
};
const PileDriver: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.clavan - 0.4 || t > T.cede + 0.4) return null;
  const m = malletAt(t), top: V3 = [m.x, 7.5, FZ - 0.1], hit = HITS.some((h) => t >= h.t && t < h.t + 0.12);
  // terminada a cravação, o operário puxa o bate-estaca para o lado antes de a casa descer
  return (
    <G p={[7 * ease(t, T.cede - 0.4, T.cede - 0.02), 0, 0]}>
      <Pipe a={[m.x - 1.4, TOP, FZ - 0.9]} b={top} rad={0.09} c="#7a4a2a" />
      <Pipe a={[m.x + 1.4, TOP, FZ - 0.9]} b={top} rad={0.09} c="#7a4a2a" />
      <Pipe a={[m.x, TOP, FZ - 2.8]} b={top} rad={0.09} c="#7a4a2a" />
      <Cyl rt={0.18} h={0.2} p={top} r={[0, 0, PI / 2]} c="#5a3a20" />
      <Pipe a={top} b={[m.x, m.y + 0.8, FZ]} rad={0.025} c="#e8d9a8" cast={false} />
      {t < T.cede - 0.4 ? <Pipe a={top} b={[m.x - 2.3, 1.5, -0.3]} rad={0.025} c="#e8d9a8" cast={false} /> : null}
      <G p={[m.x, m.y, FZ]}>
        <Box s={[0.9, 0.8, 0.9]} p={[0, 0.4, 0]} c="#6b4423" />
        <Box s={[0.94, 0.1, 0.94]} p={[0, 0.15, 0]} c="#4a4f55" cast={false} /><Box s={[0.94, 0.1, 0.94]} p={[0, 0.65, 0]} c="#4a4f55" cast={false} />
      </G>
      <Puffs t={t} p={[m.x, TOP + 0.05, FZ + 0.2]} n={6} period={0.45} rise={0.5} size={0.3} c="#8a6a48" on={hit ? 1 : 0} drift={[0, 0, 0.3]} />
    </G>
  );
};
/** «el barro queda apretado entre ellos»: setas espremendo o barro dos dois lados + barro escurecido entre os pilotes */
const Squeeze: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.apretado - 0.15, T.apretado + 0.25) * (1 - ease(t, T.cede + 0.8, T.cede + 1.2)); if (k <= 0.01) return null;
  const pulse = 0.35 * Math.abs(Math.sin(t * 7));
  return (
    <G>
      <Box s={[3.9, 4.9, 0.02]} p={[3.45, -2.35, FZ + 0.004]} c="#5e3f26" o={{ opacity: q(0.85 * k) }} cast={false} />
      {[-1.0, -2.4, -3.8].map((y) => (
        <G key={y}>
          <G p={[0.5 + pulse, y, FZ + 0.35]} sc={k}><Pipe a={[-0.9, 0, 0]} b={[0.6, 0, 0]} rad={0.11} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 0.6 }} /><Cone rad={0.3} h={0.6} seg={8} p={[0.8, 0, 0]} r={[0, 0, -PI / 2]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 0.6 }} /></G>
          <G p={[6.5 - pulse, y, FZ + 0.35]} sc={k}><Pipe a={[0.9, 0, 0]} b={[-0.6, 0, 0]} rad={0.11} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 0.6 }} /><Cone rad={0.3} h={0.6} seg={8} p={[-0.8, 0, 0]} r={[0, 0, PI / 2]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 0.6 }} /></G>
        </G>
      ))}
    </G>
  );
};

// ---------------------------------------------------------------- casas de Venecia
type HouseP = { x0: number; x1: number; zf: number; d: number; h: number; col: string; k: number; roof?: string; ist?: boolean };
const House: React.FC<HouseP> = ({ x0, x1, zf, d, h, col, k, roof = "#b4532a", ist = true }) => {
  if (k <= 0.01) return null;
  const w = x1 - x0, cx = (x0 + x1) / 2, b = ist ? 0.6 : 0, floors = Math.max(1, Math.floor((h - b - 0.6) / 1.25)), cols = Math.max(1, Math.floor(w / 0.95));
  return (
    <G p={[cx, TOP, zf - d / 2]} sc={[1, k, 1]}>
      {ist ? <Box s={[w + 0.04, b, d + 0.04]} p={[0, b / 2, 0]} c={ISTRIA} /> : null}
      <Box s={[w, h - b, d]} p={[0, b + (h - b) / 2, 0]} c={col} />
      {Array.from({ length: floors * cols }, (_, i) => {
        const f = Math.floor(i / cols), c = i % cols, x = -w / 2 + (c + 0.5) * (w / cols), y = b + 0.75 + f * 1.25;
        return <G key={i}><Box s={[0.38, 0.62, 0.06]} p={[x, y, d / 2 + 0.02]} c="#3a2a2a" cast={false} /><Cyl rt={0.19} h={0.06} p={[x, y + 0.31, d / 2 + 0.02]} r={[PI / 2, 0, 0]} c="#3a2a2a" seg={10} ts={PI / 2} tl={PI} cast={false} /><Box s={[0.5, 0.06, 0.12]} p={[x, y - 0.34, d / 2 + 0.04]} c="#f4efe4" cast={false} /></G>;
      })}
      <Box s={[w + 0.3, 0.18, d + 0.3]} p={[0, h + 0.09, 0]} c={roof} />
      <Cone rad={Math.max(w, d) * 0.62} h={0.8} seg={4} p={[0, h + 0.58, 0]} r={[0, PI / 4, 0]} sc={[w / Math.max(w, d), 1, d / Math.max(w, d)]} c={roof} o={{ flat: true }} />
      <Box s={[0.3, 0.6, 0.3]} p={[w * 0.3, h + 0.9, 0]} c="#e9d9c0" /><Cyl rt={0.3} rb={0.14} h={0.4} p={[w * 0.3, h + 1.35, 0]} c="#e9d9c0" seg={8} />
    </G>
  );
};
const Campanile: React.FC<{ k: number; t: number }> = ({ k, t }) => (k <= 0.01 ? null : (
  <G p={[5.6, TOP, -5.6]} sc={[1, k, 1]}>
    <Box s={[1.5, 0.6, 1.5]} p={[0, 0.3, 0]} c={ISTRIA} /><Box s={[1.4, 9.4, 1.4]} p={[0, 5.3, 0]} c="#c0533a" />
    {[0, 1, 2, 3].map((i) => <Box key={i} s={[0.08, 9.0, 0.08]} p={[Math.cos(i * PI / 2) * 0.71, 5.3, Math.sin(i * PI / 2) * 0.71]} c="#a8452f" cast={false} />)}
    {/* campanário aberto: piso, 4 pilares e teto de pedra, com o sino dentro */}
    <Box s={[1.6, 0.16, 1.6]} p={[0, 10.08, 0]} c={ISTRIA} /><Box s={[1.6, 0.16, 1.6]} p={[0, 11.32, 0]} c={ISTRIA} />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <Box key={i} s={[0.3, 1.1, 0.3]} p={[a * 0.65, 10.7, b * 0.65]} c={ISTRIA} />)}
    {/* o sino balança (abertura b: logo no 1º quadro) */}
    <G p={[0, 11.1, 0]} r={[0.7 * Math.sin(t * 7), 0, 0]}><Cone rad={0.36} h={0.55} seg={10} p={[0, -0.32, 0]} c="#d8a23a" o={{ metal: 0.5, rough: 0.35 }} cast={false} /></G>
    <Box s={[1.5, 0.9, 1.5]} p={[0, 11.85, 0]} c="#c0533a" /><Cone rad={1.1} h={2.2} seg={4} p={[0, 13.4, 0]} r={[0, PI / 4, 0]} c="#6fae8a" o={{ flat: true }} />
    <Sph rad={0.18} p={[0, 14.6, 0]} c="#ffd34a" o={{ metal: 0.4, rough: 0.3 }} />
  </G>
));
const Church: React.FC<{ k: number }> = ({ k }) => (k <= 0.01 ? null : (
  <G p={[1.6, TOP, -5.2]} sc={[1, k, 1]}>
    <Box s={[4.4, 0.5, 4.0]} p={[0, 0.25, 0]} c={ISTRIA} /><Box s={[4.0, 3.6, 3.6]} p={[0, 2.3, 0]} c="#f3efe6" />
    {[-1.2, 0, 1.2].map((x) => <G key={x}><Box s={[0.7, 1.6, 0.06]} p={[x, 1.6, 1.82]} c="#3a2a2a" cast={false} /><Cyl rt={0.35} h={0.06} p={[x, 2.4, 1.82]} r={[PI / 2, 0, 0]} c="#3a2a2a" seg={12} ts={PI / 2} tl={PI} cast={false} /></G>)}
    <Cyl rt={1.25} h={0.8} p={[0, 4.5, 0]} c="#f3efe6" seg={16} /><Sph rad={1.3} ps={0} pl={PI / 2} p={[0, 4.9, 0]} c="#9fb8a8" ws={18} hs={10} />
    <Sph rad={0.16} p={[0, 6.3, 0]} c="#ffd34a" o={{ metal: 0.4, rough: 0.3 }} />
  </G>
));
const ISLES: { p: V3; r: [number, number] }[] = [{ p: [-26, 0, -6], r: [6, 4.5] }, { p: [23, 0, -8], r: [6, 4.2] }, { p: [9, 0, -16], r: [4.2, 3] }, { p: [-24, 0, 12], r: [4.5, 3.2] }, { p: [-17, 0, -13], r: [3, 2.4] }, { p: [26, 0, 13], r: [4.5, 3] }];
const HCOL = ["#e8907a", "#f2e6cf", "#e9c46a", "#d8574a", "#f0b8a0", "#c97b5a", "#f5d9a8"];
const Isles: React.FC<{ t: number }> = ({ t }) => {
  const k = cityK(t, 0.7);
  return (
    <G>
      {ISLES.map((s, i) => (
        <G key={i} p={s.p}>
          <Sph rad={1} sc={[s.r[0], 0.3, s.r[1]]} c="#9a8a5a" ws={16} hs={8} />
          <Sph rad={1} p={[0, 0.05, 0]} sc={[s.r[0] * 0.8, 0.3, s.r[1] * 0.8]} c="#8fae58" ws={16} hs={8} cast={false} />
          {Array.from({ length: 10 }, (_, r) => <Cone key={r} rad={0.18} h={0.8} seg={4} p={[(rnd(i * 31 + r) - 0.5) * s.r[0] * 1.5, 0.45, (rnd(i * 17 + r) - 0.5) * s.r[1] * 1.4]} c="#5f9a3a" o={{ flat: true }} cast={false} />)}
          {k > 0.01 ? Array.from({ length: 6 }, (_, h) => {
            const x = (rnd(i * 11 + h) - 0.5) * s.r[0] * 1.2, z = (rnd(i * 13 + h + 3) - 0.5) * s.r[1] * 1.1, hh = lerp(2.4, 4.4, rnd(i * 7 + h)), w = lerp(1.4, 2.2, rnd(i + h * 5));
            return <G key={h} p={[x, 0.25, z]} sc={[1, Math.max(0.01, k), 1]}><Box s={[w, hh, w * 0.9]} p={[0, hh / 2, 0]} c={HCOL[(i + h) % HCOL.length]} /><Cone rad={w * 0.75} h={0.7} seg={4} p={[0, hh + 0.35, 0]} r={[0, PI / 4, 0]} c="#b4532a" o={{ flat: true }} /></G>;
          }) : null}
        </G>
      ))}
    </G>
  );
};
const CityHouses: React.FC<{ t: number }> = ({ t }) => (
  <G p={[0, islandY(t), 0]}>
    <House x0={-5.6} x1={-1.8} zf={FZ + 0.02} d={3} h={5.2} col="#e8907a" k={cityK(t, -0.2)} />
    <House x0={-1.4} x1={1.1} zf={FZ + 0.02} d={3} h={6.3} col="#d8574a" k={cityK(t, -0.05)} />
    <House x0={-6.4} x1={-2.6} zf={-1.4} d={3.2} h={4.6} col="#f2e6cf" k={cityK(t, 0.1)} />
    <House x0={-2.2} x1={0.4} zf={-1.2} d={3} h={5.4} col="#e9c46a" k={cityK(t, 0.2)} />
    <House x0={-6.4} x1={-3.0} zf={-5.2} d={2.6} h={4.0} col="#f0b8a0" k={cityK(t, 0.3)} />
    <Church k={cityK(t, 0.4)} /><Campanile k={cityK(t, 0.5)} t={t} />
  </G>
);

// ---------------------------------------------------------------- a casa da demonstração (H2): cai nos pilotes, tijolos, água salgada, Ístria
const H2 = { x0: 1.5, x1: 5.5, d: 3 };
/** quanto a parte de tijolo está levantada sobre as tábuas (0,15–0,30): 0 antes da Ístria; sobe no «entre los troncos», volta 0,7 em cima da pedra */
const upAt = (t: number) => {
  if (hook(t) || giro(t)) return 0.7;
  let u = 1.3 * ease(t, T.entre - 0.1, T.entre + 0.45);
  if (t > T.ponen + 0.55) u = lerp(1.3, 0.7, ease(t, T.ponen + 0.55, T.ponen + 0.72)) + 0.06 * Math.sin((t - T.ponen - 0.72) * 30) * (1 - prog(t, T.ponen + 0.72, T.ponen + 1.1)) * (t > T.ponen + 0.72 ? 1 : 0);
  return u;
};
const istSlide = (t: number, k: number) => (hook(t) || giro(t) ? 1 : ease(t, T.ponen - 0.08 + k * 0.16, T.ponen + 0.22 + k * 0.16));
const h2Vis = (t: number) => (hook(t) ? cityK(t, 0.05) : t < T.venecia + 0.6 ? 1 - ease(t, T.venecia, T.venecia + 0.6) : t >= T.cede - 0.01 ? 1 : 0);
const BRICKS = (() => { const out: { x: number; y: number; w: number }[] = []; for (let r = 0; r < 10; r++) { const off = r % 2 ? 0.25 : 0; for (let x = -2 - off; x < 2; x += 0.5) { const a = Math.max(-2, x), b = Math.min(2, x + 0.5); if (b - a > 0.05) out.push({ x: (a + b) / 2, y: 0.12 + r * 0.24, w: b - a - 0.03 }); } } return out; })();
const FALL = [3, 5, 9, 12, 14, 19, 22, 26, 31];
const DemoHouse: React.FC<{ t: number }> = ({ t }) => {
  const k = h2Vis(t); if (k <= 0.01) return null;
  const drop = t >= T.cede - 0.01 && !giro(t) ? (1 - ease(t, T.cede, T.cede + 0.22)) * 6 : 0, land = t > T.cede + 0.22 && !giro(t) ? Math.sin(PI * prog(t, T.cede + 0.22, T.cede + 0.5)) : 0;
  const base = 0.3 + upAt(t) + drop, cx = (H2.x0 + H2.x1) / 2, zc = FZ + 0.02 - H2.d / 2, w = H2.x1 - H2.x0;
  const wet = hook(t) || giro(t) ? 0 : ease(t, T.sube - 0.1, T.deshaciendo + 0.2) * (1 - ease(t, T.entre - 0.1, T.entre + 0.2));
  const crumbled = (i: number) => { const a = T.deshaciendo - 0.15 + FALL.indexOf(i) * 0.05; return FALL.includes(i) && t > a && t < T.entre - 0.05 ? prog(t, a, a + 1.0) : -1; };
  const salt = ease(t, T.sube + 0.3, T.deshaciendo) * (1 - ease(t, T.entre - 0.1, T.entre + 0.1)) * (hook(t) || giro(t) ? 0 : 1);
  const shine = q(Math.sin(PI * prog(t, T.blanca - 0.05, T.blanca + 0.7)) * 0.7 + Math.sin(PI * prog(t, T.estaIstria - 0.05, T.estaIstria + 0.9)) * 0.5, 0.05);
  return (
    <G p={[0, islandY(t), 0]} sc={[1, Math.max(0.01, k), 1]}>
      {/* tábuas sobre as cabeças dos pilotes */}
      <Box s={[w + 0.2, 0.15, H2.d]} p={[cx, TOP + 0.075, zc]} c="#8a5a32" />
      {Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.04, 0.15, 0.02]} p={[H2.x0 + 0.1 + i * 0.75, TOP + 0.075, FZ + 0.03]} c="#5a3a20" cast={false} />)}
      {/* pedra de Ístria: 3 blocos que entram pela direita */}
      {[0, 1, 2].map((i) => { const u = istSlide(t, i); if (u <= 0.01) return null; const x = H2.x0 + (i + 0.5) * (w / 3); return <Box key={i} s={[w / 3 - 0.03, 0.7, H2.d]} p={[x + (1 - u) * 3.6, 0.65, zc]} c={ISTRIA} o={shine > 0 ? { emissive: "#ffffff", ei: shine } : undefined} />; })}
      {/* tijolos e fachada (levantam no «entre los troncos y los ladrillos») */}
      <G p={[cx, base, zc]} sc={[1 + 0.06 * land, 1 - 0.08 * land, 1 + 0.06 * land]}>
        <Box s={[w - 0.04, 2.4, H2.d - 0.14]} p={[0, 1.2, -0.06]} c="#8f3a28" />
        {BRICKS.map((b, i) => {
          const f = crumbled(i); if (f >= 1) return null;
          const fy = f < 0 ? 0 : -5 * f * f, rz = f < 0 ? 0 : f * 2.5 * (i % 2 ? 1 : -1);
          return <Box key={i} s={[b.w, 0.21, 0.14]} p={[b.x + (f < 0 ? 0 : f * 0.6 * (i % 2 ? 1 : -1)), b.y + fy, H2.d / 2 - 0.05 + (f < 0 ? 0 : f * 0.8)]} r={[0, 0, rz]} c={i % 3 ? "#c0533a" : "#ad4632"} cast={false} />;
        })}
        {salt > 0.01 ? Array.from({ length: 16 }, (_, i) => <Box key={i} s={[0.09, 0.06, 0.02]} p={[(rnd(i * 3) - 0.5) * 3.6, 0.2 + rnd(i * 5) * 1.8 * salt, H2.d / 2 + 0.03]} c="#ffffff" cast={false} />) : null}
        {wet > 0.01 ? <Box s={[w + 0.02, 2.3 * wet, 0.05]} p={[0, (2.3 * wet) / 2, H2.d / 2 + 0.05]} c="#2f7fd8" o={{ opacity: 0.55, depthWrite: false }} cast={false} /> : null}
        <Box s={[w, 2.4, H2.d]} p={[0, 2.4 + 1.2, 0]} c="#e8b64a" />
        {[-1.2, 0, 1.2].map((x) => <G key={x}><Box s={[0.5, 0.8, 0.06]} p={[x, 3.4, H2.d / 2 + 0.02]} c="#3a2a2a" cast={false} /><Cyl rt={0.25} h={0.06} p={[x, 3.8, H2.d / 2 + 0.02]} r={[PI / 2, 0, 0]} c="#3a2a2a" seg={10} ts={PI / 2} tl={PI} cast={false} /><Box s={[0.66, 0.07, 0.14]} p={[x, 2.97, H2.d / 2 + 0.05]} c="#f4efe4" cast={false} /></G>)}
        <Box s={[w + 0.3, 0.18, H2.d + 0.3]} p={[0, 4.89, 0]} c="#b4532a" />
        <Cone rad={w * 0.62} h={0.8} seg={4} p={[0, 5.38, 0]} r={[0, PI / 4, 0]} sc={[1, 1, H2.d / w]} c="#b4532a" o={{ flat: true }} />
        <Box s={[0.3, 0.6, 0.3]} p={[1.2, 5.7, 0]} c="#e9d9c0" /><Cyl rt={0.3} rb={0.14} h={0.4} p={[1.2, 6.15, 0]} c="#e9d9c0" seg={8} />
      </G>
      {/* corda do levantamento */}
      {t > T.entre - 0.3 && t < T.ponen + 0.9 && !giro(t) ? <Pipe a={[cx, base + 6.0, zc]} b={[cx, base + 9.0, zc]} rad={0.04} c="#e8d9a8" cast={false} /> : null}
      <Puffs t={t} p={[cx, TOP + 0.1, FZ + 0.1]} n={8} period={0.5} rise={0.6} size={0.4} c="#b89a76" on={(t > T.cede + 0.2 && t < T.cede + 0.8) || (t > T.ponen + 0.7 && t < T.ponen + 1.2) ? 1 : 0} drift={[1.2, 0, 0.3]} />
    </G>
  );
};
/** gotas de água salgada subindo pelo barro: antes entram nos tijolos; depois da Ístria batem embaixo dela e voltam */
const SaltDrops: React.FC<{ t: number }> = ({ t }) => {
  const before = t > T.sube - 0.3 && t < T.entre, after = t > T.cerrada - 0.2 && t < CUTS[6];
  if (!before && !after) return null;
  return (
    <G>
      {Array.from({ length: 14 }, (_, i) => {
        const u = fract(t * 0.75 + i / 14), x = 1.8 + (i % 7) * 0.55 + 0.27;
        const y = before ? lerp(-2.6, 2.6, u) : Math.min(0.24, lerp(-2.6, 0.6, u));
        const bounce = after && lerp(-2.6, 0.6, u) > 0.24;
        return <Sph key={i} rad={0.1} p={[x, y - (bounce ? 0.25 * Math.sin(PI * prog(u, 0.88, 1)) : 0), FZ + 0.32]} sc={[1, 1.3, 1]} c="#4ab0ff" o={{ emissive: "#2f8fd8", ei: 0.5 }} cast={false} ws={8} hs={6} />;
      })}
      {after ? <Box s={[4.0, 0.05, 0.05]} p={[3.5, 0.3, FZ + 0.08]} c="#4ab0ff" o={{ emissive: "#2f8fd8", ei: 0.8 }} cast={false} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- o problema: a casa posta direto no barro afunda inclinando
const SinkHouse: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.pones - 0.05 || t > T.hunde + 2.1 || hook(t)) return null;
  const drop = (1 - ease(t, T.pones, T.encima - 0.05)) * 6, sq = Math.sin(PI * prog(t, T.encima - 0.05, T.encima + 0.25));
  const s = ease(t, T.hunde - 0.05, T.hunde + 1.9), y = drop - 3.8 * s + 0.08 * Math.sin(t * 18) * (s > 0 && s < 1 ? 1 : 0), rz = 0.5 * ease(t, T.hunde - 0.05, T.hunde + 0.8) + 0.06 * Math.sin(t * 11) * s;
  return (
    <G>
      <G p={[4.0, TOP + y, FZ + 0.02 - 1.1]} r={[0, 0, rz]} sc={[1 + 0.1 * sq, 1 - 0.14 * sq, 1]}>
        <Box s={[2.6, 2.2, 2.2]} p={[0, 1.1, 0]} c="#c86a4a" />
        {[-0.65, 0.65].map((x) => <Box key={x} s={[0.4, 0.6, 0.06]} p={[x, 1.35, 1.12]} c="#3a2a2a" cast={false} />)}
        <Box s={[0.5, 0.9, 0.06]} p={[0, 0.45, 1.12]} c="#5a3a20" cast={false} />
        <Cone rad={1.9} h={1.0} seg={4} p={[0, 2.7, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.85]} c="#b4532a" o={{ flat: true }} />
      </G>
      <Puffs t={t} p={[4.0, TOP, 1.9]} n={8} period={0.6} rise={0.7} size={0.35} c="#6b4a2e" on={t > T.hunde && t < T.hunde + 2.0 ? 1 : 0} drift={[0, 0, 0.2]} />
    </G>
  );
};

// ---------------------------------------------------------------- materiais: «solo madera, piedra, ladrillo y brazos»
const Materials: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.nohay || t > T.cede) return null;
  const k = (a: number) => clamp(outBack(prog(t, a - 0.05, a + 0.25)), 0, 1.2);
  const km = k(T.madera), kp = k(T.piedra), kl = k(T.ladrillo);
  return (
    <G>
      {km > 0.01 ? <G p={[-4.6, TOP, 1.2]} sc={km}>{[[-0.3, 0.22], [0.3, 0.22], [0, 0.62]].map(([x, y], i) => <G key={i}><Cyl rt={0.22} h={2.6} p={[x, y, 0]} r={[PI / 2, 0, 0]} c={WOODF} seg={10} /><Cyl rt={0.225} h={0.03} p={[x, y, 1.3]} r={[PI / 2, 0, 0]} c={WOODR} seg={10} cast={false} /></G>)}</G> : null}
      {kp > 0.01 ? <G p={[-3.0, TOP, 1.9]} sc={kp}><Box s={[1.0, 0.8, 0.8]} p={[0, 0.4, 0]} c="#b8b2a6" /><Box s={[0.7, 0.5, 0.6]} p={[0.15, 1.05, 0]} r={[0, 0.3, 0]} c="#a39d91" /></G> : null}
      {kl > 0.01 ? <G p={[-1.5, TOP, 1.4]} sc={kl}><Box s={[1.2, 0.12, 0.9]} p={[0, 0.06, 0]} c="#8a5a32" />{Array.from({ length: 12 }, (_, i) => <Box key={i} s={[0.5, 0.2, 0.25]} p={[-0.3 + (i % 2) * 0.6, 0.22 + Math.floor(i / 4) * 0.21, -0.3 + (Math.floor(i / 2) % 2) * 0.32]} c={i % 3 ? "#c0533a" : "#ad4632"} />)}</G> : null}
    </G>
  );
};

// ---------------------------------------------------------------- Alpes: árvores cortadas → balsa → rio → laguna
const FELL: V3[] = [[-11.7, 0.35, -46.4], [-11.4, 0.35, -45.1], [-11.2, 0.35, -43.8], [-11.0, 0.35, -42.5], [-10.9, 0.35, -41.2], [-10.7, 0.35, -39.9]];
const fellAt = (k: number) => T.talan + 0.05 + k * 0.16;
const RAFT0: V3 = [-13.9, 0.42, -43];
const RAFT_PATH: V3[] = [[-13.9, 0, -43], [-12.8, 0, -36], [-11, 0, -29], [-10, 0, -22.2], [-8.9, 0, -18.6], [-8.3, 0, -16.6]];
/** a balsa: parada onde se forma; desce um pouco no «bajan»; depois do corte 4 já perto da boca do rio, entra na laguna até a estaca */
export const raftAt = (t: number): { p: V3; yaw: number } => {
  let u = 0;
  // «los bajan por los ríos hasta la laguna»: desce o rio inteiro até a boca no corte 4; depois o rio a leva até a estaca
  if (t >= CUTS[3]) { const v = prog(t, CUTS[3], T.p3 + 0.1); u = lerp(0.7, 1, 1 - (1 - v) * (1 - v)); }
  else if (t >= T.bajan) u = 0.7 * ease(t, T.bajan, CUTS[3]);
  const a = along(RAFT_PATH, u), z = a.p[2], y = z < -22.6 ? 0.42 : z > -21.6 ? 0.07 : lerp(0.42, 0.07, prog(z, -22.6, -21.6));
  return { p: [a.p[0], y + 0.04 * Math.sin(t * 2.6), z], yaw: t < T.bajan ? 0 : lerp(0, a.yaw, ease(t, T.bajan, T.bajan + 0.4)) };
};
const Logs: React.FC<{ t: number }> = ({ t }) => {
  const standing = hook(t) || giro(t) || t < T.talan;
  const stumps = <G>{FELL.map((b, k) => <Cyl key={k} rt={0.25} h={0.3} p={[b[0], b[1] + 0.15, b[2]]} c={WOODR} seg={10} />)}</G>;
  if (!standing && t > T.pudre + 1.2) return stumps;
  const formed = !standing && t >= T.balsas + 0.3, r = raftAt(t), rope = standing ? 0 : ease(t, T.balsas - 0.1, T.balsas + 0.2);
  if (formed) return (
    <G>{stumps}<G p={r.p} r={[0, r.yaw, 0]}>
      {Array.from({ length: 6 }, (_, k) => <G key={k}><Cyl rt={0.24} h={3.2} p={[(k - 2.5) * 0.5, 0, 0]} r={[PI / 2, 0, 0]} c={WOODF} seg={10} /><Cyl rt={0.245} h={0.03} p={[(k - 2.5) * 0.5, 0, 1.6]} r={[PI / 2, 0, 0]} c={WOODR} seg={10} cast={false} /></G>)}
      {[-1.1, 1.1].map((z) => <Box key={z} s={[3.1, 0.1, 0.14]} p={[0, 0.22, z]} c="#e8d9a8" cast={false} />)}
      <Puffs t={t} p={[0, -0.05, -1.8]} n={6} period={0.6} rise={0.15} size={0.16} c="#ffffff" drift={[0, 0, -0.8]} on={t > T.bajan ? 1 : 0} />
    </G></G>
  );
  return (
    <G>
      {FELL.map((b, k) => {
        const th = standing ? 0 : (PI / 2) * sstep(prog(t, fellAt(k), fellAt(k) + 0.32)), bounce = 0.05 * Math.sin(PI * prog(t, fellAt(k) + 0.32, fellAt(k) + 0.55));
        const leaf = standing ? 1 : 1 - ease(t, T.atan - 0.3, T.atan + 0.1), m = standing ? 0 : ease(t, T.atan - 0.15 + k * 0.06, T.balsas + 0.25);
        const c0: V3 = [b[0], b[1] + 1.6 * Math.cos(th) + bounce, b[2] + 1.6 * Math.sin(th)], c1: V3 = [RAFT0[0] + (k - 2.5) * 0.5, RAFT0[1], RAFT0[2]];
        const c: V3 = [lerp(c0[0], c1[0], m), lerp(c0[1], c1[1], m) + 0.6 * Math.sin(PI * m), lerp(c0[2], c1[2], m)];
        return (
          <G key={k}>
            <G p={c} r={[th, 0, 0]}>
              <Cyl rt={0.24} h={3.2} c={WOODF} seg={10} />
              {leaf > 0.01 ? <G sc={Math.max(0.01, leaf)}><Cone rad={1.2} h={1.8} p={[0, 1.6, 0]} c="#2f7a3a" seg={7} o={{ flat: true }} /><Cone rad={0.9} h={1.5} p={[0, 2.5, 0]} c="#3a8f44" seg={7} o={{ flat: true }} /></G> : null}
            </G>
            {th < 0.05 ? null : <Cyl rt={0.25} h={0.3} p={[b[0], b[1] + 0.15, b[2]]} c={WOODR} seg={10} />}
          </G>
        );
      })}
      {rope > 0.01 ? [-1.1, 1.1].map((z) => <Box key={z} s={[3.1 * rope, 0.1, 0.14]} p={[RAFT0[0], RAFT0[1] + 0.22, RAFT0[2] + z]} c="#e8d9a8" cast={false} />) : null}
      <Puffs t={t} p={[-11.0, 0.5, -43]} n={6} period={0.5} rise={0.5} size={0.25} c="#d8c8a8" on={t > T.talan && t < T.atan ? 1 : 0} />
    </G>
  );
};

// ---------------------------------------------------------------- estacas (paline): a da boca do rio apodrece e desmancha; a da face mostra
// a parte de cima podre e a de baixo, enterrada no barro, inteira
const P1: V3 = [-7.4, 0, -15.0];
const Mush: React.FC<{ p: V3; s: number; c?: string }> = ({ p, s, c = "#e8c27a" }) => (s <= 0.01 ? null : (
  <G p={p} sc={s}><Cyl rt={0.04} h={0.16} p={[0, 0.08, 0]} c="#f2ead8" seg={6} cast={false} /><Sph rad={0.14} ps={0} pl={PI / 2} p={[0, 0.15, 0]} c={c} ws={10} hs={6} cast={false} /></G>
));
const rotCol = (u: number) => { const a = new THREE.Color(WOODF), b = new THREE.Color("#5a5534"); return "#" + a.lerp(b, q(u, 0.1)).getHexString(); };
const PoleRiver: React.FC<{ t: number }> = ({ t }) => {
  if (hook(t)) return null;
  const fresh = giro(t), rot = fresh ? 0 : ease(t, T.p3 + 0.4, T.pudre), crum = fresh ? 0 : ease(t, T.pudre - 0.05, T.pudre + 0.45);
  const top = lerp(2.9, 0.35, crum), ly = lagoonY(t);
  return (
    <G p={[P1[0], 0, P1[2]]}>
      <Cyl rt={0.22} h={top + 1.6} p={[0, (top - 1.6) / 2, 0]} c={rotCol(rot)} seg={10} />
      {crum < 0.5 ? [2.1, 2.5].map((y) => <Cyl key={y} rt={0.225} h={0.18} p={[0, y, 0]} c={rot > 0.5 ? "#7a5a3a" : "#d8323a"} seg={10} cast={false} />) : null}
      {[[0.2, 0.6, 0.6], [-0.2, 1.1, 1.2], [0.18, 1.6, 1.9], [-0.15, 2.0, 2.5]].map(([, y, r], i) => <G key={i} r={[0, r, 0]}><Mush p={[0.2, y, 0]} s={y < top ? ease(t, T.pudre - 0.45 + i * 0.07, T.pudre - 0.2 + i * 0.07) * (fresh ? 0 : 1) : 0} /></G>)}
      {/* pedaços que caem na água */}
      {crum > 0.01 && crum < 1 ? [0, 1, 2, 3].map((i) => { const u = prog(t, T.pudre + i * 0.08, T.pudre + 0.5 + i * 0.08); return u <= 0 || u >= 1 ? null : <Box key={i} s={[0.3, 0.45, 0.3]} p={[(i - 1.5) * 0.3 + u * (i - 1.5) * 0.8, 2.6 - i * 0.4 - 3.0 * u * u, u * 0.5]} r={[u * 3, 0, u * 2]} c={rotCol(0.8)} cast={false} />; }) : null}
      <Puffs t={t} p={[0, ly, 0.3]} n={8} period={0.5} rise={0.9} size={0.5} c="#e8f6ff" on={t > T.pudre + 0.2 && t < T.pudre + 0.9 ? 1 : 0} />
      {/* a corda da balsa amarrada na estaca */}
      {t > T.p3 - 0.4 && t < T.pudre + 0.1 && !giro(t) ? (() => { const r = raftAt(t); return <Pipe a={[0, 1.2, 0]} b={[r.p[0] - P1[0], r.p[1] + 0.3, r.p[2] - P1[2] + 1.0]} rad={0.03} c="#e8d9a8" cast={false} />; })() : null}
    </G>
  );
};
export const POLE2_X = 9.6;
const rot2At = (t: number) => (hook(t) || giro(t) ? 0 : ease(t, T.hongos - 0.15, T.abajo));
const PoleSection: React.FC<{ t: number }> = ({ t }) => {
  const r = rot2At(t), crum = hook(t) || giro(t) ? 0 : ease(t, T.oxigeno + 0.5, T.abajo + 0.4), top = lerp(2.6, -0.5, crum), g = q(glowAt(t)) * 0.45;
  return (
    <G p={[POLE2_X, 0, FZ]}>
      {/* parte enterrada no barro: inteira */}
      <Cyl rt={0.26} h={2.6} p={[0, FLOOR - 1.3, 0]} c={WOODF} seg={10} o={g > 0 ? { emissive: "#9dffb0", ei: g } : undefined} />
      <Cone rad={0.26} h={0.5} seg={10} p={[0, FLOOR - 2.85, 0]} r={[PI, 0, 0]} c={WOODF} />
      {/* parte na água e no ar: apodrece */}
      <Cyl rt={0.26 - 0.05 * r} h={top - FLOOR} p={[0, (top + FLOOR) / 2, 0]} c={rotCol(r)} seg={10} />
      {crum < 0.3 ? [1.8, 2.2].map((y) => <Cyl key={y} rt={0.265} h={0.16} p={[0, y, 0]} c={r > 0.5 ? "#7a5a3a" : "#d8323a"} seg={10} cast={false} />) : null}
      {[-1.2, -0.6, 0.0, 0.6, 1.1, 1.6, 2.0, -0.9].map((y, i) => <G key={i} r={[0, -0.25 - i * 0.33, 0]}><Mush p={[0.24, y, 0]} s={y < top - 0.1 ? 1.3 * ease(t, T.hongos - 0.05 + i * 0.07, T.hongos + 0.25 + i * 0.07) * (r > 0 ? 1 : 0) : 0} c={i % 2 ? "#e8c27a" : "#d98a4a"} /></G>)}
      {crum > 0.01 && crum < 1 ? [0, 1, 2, 3, 4].map((i) => { const u = prog(t, T.oxigeno + 0.5 + i * 0.25, T.oxigeno + 1.3 + i * 0.25); return u <= 0 || u >= 1 ? null : <Box key={i} s={[0.32, 0.4, 0.3]} p={[(i % 2 ? 0.3 : -0.3) + u * (i % 2 ? 0.9 : -0.9), 2.4 - i * 0.55 - 1.8 * u * u, 0.3 + u * 0.6]} r={[u * 2, 0, u * 3]} c={rotCol(0.9)} cast={false} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- O₂ (bolhas riscadas no barro) e bactérias lentas
const useO2 = (crossed: boolean) => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.beginPath(); g.arc(64, 64, 54, 0, PI * 2); g.fillStyle = "rgba(200,238,255,0.92)"; g.fill(); g.lineWidth = 9; g.strokeStyle = "#ffffff"; g.stroke();
  g.fillStyle = "#16577f"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "bold 64px sans-serif"; g.fillText("O", 56, 64); g.font = "bold 36px sans-serif"; g.fillText("2", 90, 84);
  if (crossed) { g.lineCap = "round"; g.strokeStyle = "#14202b"; g.lineWidth = 22; g.beginPath(); g.moveTo(22, 22); g.lineTo(106, 106); g.stroke(); g.strokeStyle = "#ff2d2d"; g.lineWidth = 13; g.stroke(); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}, [crossed]);
const Oxygen: React.FC<{ t: number }> = ({ t }) => {
  const o2 = useO2(false), x2 = useO2(true);
  if (t < T.oxigeno - 0.2 || t > T.duran || hook(t) || giro(t)) return null;
  const attract = ease(t, T.oxigeno, T.oxigeno + 1.0), dive = ease(t, T.abajo - 0.1, T.casiNoHay + 0.4);
  return (
    <G>
      {Array.from({ length: 9 }, (_, i) => {
        const bx = POLE2_X + (rnd(i * 3) - 0.5) * 3.2, by = lerp(-1.2, 2.2, rnd(i * 3 + 1)), s = 0.55 * clamp(outBack(prog(t, T.oxigeno - 0.1 + i * 0.05, T.oxigeno + 0.2 + i * 0.05)), 0, 1.2);
        const x = lerp(bx, POLE2_X + (bx > POLE2_X ? 0.5 : -0.5), attract * 0.7) + 0.08 * Math.sin(t * 3 + i), y = lerp(by + 0.12 * Math.sin(t * 2.4 + i * 1.7), -2.4 - rnd(i) * 1.2, dive * clamp(1.4 - i * 0.08));
        const under = y < FLOOR - 0.1, fade = under ? 1 - prog(t, T.casiNoHay + 0.3, T.casiNoHay + 1.0) : 1;
        if (s <= 0.01 || fade <= 0.01) return null;
        return <sprite key={i} position={[x, y, FZ + 0.6]} scale={[s, s, 1]}><spriteMaterial map={under ? x2 : o2} transparent opacity={fade} depthWrite={false} /></sprite>;
      })}
      {/* no barro: o oxigênio que não chega, riscado */}
      {[[8.0, -2.4], [10.9, -2.2], [8.6, -3.6], [11.0, -3.8], [9.7, -4.6]].map(([x, y], i) => { const s = 0.5 * clamp(outBack(prog(t, T.casiNoHay - 0.05 + i * 0.08, T.casiNoHay + 0.25 + i * 0.08)), 0, 1.2) * (1 - ease(t, T.bacterias + 0.6, T.duran)); return s <= 0.01 ? null : <sprite key={`x${i}`} position={[x, y, FZ + 0.5]} scale={[s, s, 1]}><spriteMaterial map={x2} transparent depthWrite={false} /></sprite>; })}
    </G>
  );
};
const Bacteria: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.bacterias - 0.2 || t > T.p4 + 0.3 || hook(t) || giro(t)) return null;
  const k = clamp(outBack(prog(t, T.bacterias - 0.1, T.bacterias + 0.25)), 0, 1.2), dt = t - T.bacterias;
  return (
    <G>
      {[[POLE2_X + 0.2, -2.0, 1], [POLE2_X - 0.18, -2.8, -1], [POLE2_X + 0.15, -3.6, 1], [PX(20) + 0.18, -1.6, -1], [PX(19) - 0.15, -2.9, 1], [PX(17) + 0.16, -2.2, 1], [PX(16) - 0.14, -3.8, -1]].map(([x, y, d], i) => (
        <G key={i} p={[x, y + d * 0.05 * dt, FZ + 0.3]} r={[0, 0, PI / 2 + 0.25 * Math.sin(t * 5 + i)]} sc={k}>
          <Cyl rt={0.07} h={0.18} c="#62d45a" seg={8} cast={false} /><Sph rad={0.07} p={[0, 0.09, 0]} c="#62d45a" ws={8} hs={6} cast={false} /><Sph rad={0.07} p={[0, -0.09, 0]} c="#4fbf48" ws={8} hs={6} cast={false} />
          <Sph rad={0.022} p={[0.03, 0.1, 0.055]} c="#14202b" ws={6} hs={4} cast={false} /><Sph rad={0.022} p={[-0.03, 0.1, 0.055]} c="#14202b" ws={6} hs={4} cast={false} />
        </G>
      ))}
    </G>
  );
};

// ---------------------------------------------------------------- góndola (gancho e giro); na abertura b ela cruza o quadro na frente da ilha
const gondolaB = (t: number) => openOf() === "b" && t < T.debajo;
export const gondolaAt = (t: number): V3 => (giro(t) ? [-10.2, lagoonY(t) + 0.06, -10 + 6 * prog(t, GIRO, GIRO + 10)] : gondolaB(t) ? [lerp(-13, 11, prog(t, 0.2, 2.6)), 0.06, 7.5] : [-9.8, 0.06, -12 + 11 * prog(t, 0, 7.4)]);
/** de que lado da góndola fica o gondoleiro (na popa) */
export const gondolaStern = (t: number): V3 => (gondolaB(t) ? [-1.2, 0, 0] : [0, 0, -1.2]);
const Gondola: React.FC<{ t: number }> = ({ t }) => {
  if (!hook(t) && !giro(t) && t > CUTS[0]) return null;
  const p = gondolaAt(t);
  return (
    <G p={p} r={[0, gondolaB(t) ? PI / 2 : 0, 0]}>
      <Box s={[0.9, 0.35, 4.2]} p={[0, 0.12, 0]} c="#1c1c22" /><Box s={[0.5, 0.5, 0.3]} p={[0, 0.4, 2.1]} r={[-0.5, 0, 0]} c="#1c1c22" /><Box s={[0.4, 0.6, 0.4]} p={[0, 0.45, -2.1]} r={[0.5, 0, 0]} c="#1c1c22" />
      <Box s={[0.2, 0.5, 0.08]} p={[0, 0.55, 2.3]} c="#d8d8d8" o={{ metal: 0.5, rough: 0.3 }} />
      <Pipe a={[0.4, 0.3, -1.5]} b={[0.9, -0.6, -2.6]} rad={0.04} c="#7a4a2a" />
      {gondolaB(t) ? <Puffs t={t} p={[0, 0, -2.2]} n={6} period={0.4} rise={0.2} size={0.2} c="#ffffff" drift={[0, 0, -1.2]} on={1} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- abertura b: pombos que saem do campanário no 1º quadro
const Pigeons: React.FC<{ t: number }> = ({ t }) => {
  if (openOf() !== "b" || t > T.debajo) return null;
  return (
    <G>
      {Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * PI * 2 + rnd(i) * 0.5, u = t + 0.25 + rnd(i + 7) * 0.2, r = 1.0 + 4.2 * u, flap = 0.9 * Math.sin(t * 34 + i * 2);
        const p: V3 = [5.6 + Math.cos(a) * r, TOP + 10.9 + 1.6 * u + 0.4 * Math.sin(u * 5 + i), -5.6 + Math.sin(a) * r];
        return (
          <G key={i} p={p} r={[0, -a, 0]}>
            <Sph rad={0.13} sc={[1.6, 0.9, 0.9]} c={i % 3 ? "#c9ced6" : "#8e96a3"} ws={8} hs={6} cast={false} />
            <G r={[flap, 0, 0]}><Box s={[0.2, 0.03, 0.42]} p={[0, 0, 0.22]} c="#e7eaee" cast={false} /></G>
            <G r={[-flap, 0, 0]}><Box s={[0.2, 0.03, 0.42]} p={[0, 0, -0.22]} c="#e7eaee" cast={false} /></G>
          </G>
        );
      })}
    </G>
  );
};
// ---------------------------------------------------------------- abertura c: linhas de velocidade, a floresta de pilotes e o splash
/** os pilotes de baixo da ilha inteira (só na queda da abertura c): a cidade cai sobre um bosque de troncos */
const StiltForest: React.FC<{ t: number }> = ({ t }) => {
  const meshes = useMemo(() => {
    const cyl = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.22, 2.75, 8), mat(WOODF), 210);
    const tip = new THREE.InstancedMesh(new THREE.ConeGeometry(0.22, 0.45, 8), mat(WOODF), 210), o = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < 21; i++) for (let j = 0; j < 10; j++) {
      const x = -6.4 + i * 0.64, z = -7.4 + j * 1.04;
      // mesma ponta dos pilotes da frente (y −4,78 relativo à ilha)
      o.rotation.set(0, 0, 0); o.position.set(x, FLOOR - 1.375, z); o.updateMatrix(); cyl.setMatrixAt(k, o.matrix);
      o.position.set(x, -4.555, z); o.rotation.set(PI, 0, 0); o.updateMatrix(); tip.setMatrixAt(k, o.matrix); k++;
    }
    return [cyl, tip];
  }, []);
  if (openOf() !== "c" || t >= SETTLE) return null;
  return <G p={[0, islandY(t), 0]}><primitive object={meshes[0]} /><primitive object={meshes[1]} /></G>;
};
const SPEED: V3[] = Array.from({ length: 16 }, (_, i) => [lerp(-6.5, 6.5, rnd(i * 5 + 1)), lerp(7.5, 12.5, rnd(i * 5 + 2)), lerp(-7.5, 2.5, rnd(i * 5 + 3))]);
const Splash: React.FC<{ t: number }> = ({ t }) => {
  if (openOf() !== "c" || t > T.debajo) return null;
  const iy = islandY(t), fallK = t < IMPACT ? 1 - prog(t, IMPACT - 0.08, IMPACT) : 0;
  // borrifo baixo onde os pilotes entram (sobe no máx. ~1,3: a base das casas está a ≥4,9 nessa hora)
  const spray: V3[] = [[-6.6, 0, 3.4], [-3.3, 0, 3.5], [0, 0, 3.5], [3.3, 0, 3.5], [6.6, 0, 3.4], [-7.4, 0, -2.5], [7.4, 0, -2.5]];
  return (
    <G>
      {fallK > 0.01 ? <G p={[0, iy, 0]}>{SPEED.map((p, i) => <Box key={i} s={[0.2, lerp(3, 5.5, rnd(i + 40)), 0.2]} p={p} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.8, opacity: q(0.9 * fallK, 0.25), depthWrite: false }} cast={false} />)}</G> : null}
      {spray.map((p, i) => <Puffs key={i} t={t} p={p} n={5} period={0.5} rise={1.1} size={0.5} c="#ffffff" drift={[Math.sign(p[0]) * 0.5, 0, 0.6]} on={t > IMPACT - 0.02 && t < IMPACT + 0.35 ? 1 : 0} />)}
      {[IMPACT, BASE_HIT].map((a, i) => { const v = prog(t, a, a + 1.3); return v <= 0 || v >= 1 ? null : (
        <mesh key={i} position={[0, 0.05, -2.5]} rotation={[-PI / 2, 0, 0]} scale={[1 + 1.4 * v, (1 + 1.4 * v) * 0.8, 1]} material={mat("#ffffff", { emissive: "#ffffff", ei: 0.4, opacity: q(1 - v, 0.1), depthWrite: false })}><ringGeometry args={[8.4, 9.0, 48]} /></mesh>); })}
    </G>
  );
};
// ---------------------------------------------------------------- «en la laguna no crecen árboles»: a muda que o operário planta murcha e cai
const BARENA: V3 = [-6.5, 0, -11.5];
const Sapling: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUTS[2] || t > T.b2 || giro(t)) return null;
  const k = clamp(outBack(prog(t, T.p2 + 0.25, T.p2 + 0.55)), 0, 1.2), wilt = ease(t, T.arboles, T.arboles + 0.6);
  return (
    <G p={[BARENA[0] + 0.3, 0.2, BARENA[2] - 0.3]} r={[0, 0, 1.35 * wilt]} sc={Math.max(0.01, k)}>
      <Cyl rt={0.06} h={1.0} p={[0, 0.5, 0]} c="#7a5a3a" seg={6} />
      <Sph rad={0.45} p={[0, 1.15, 0]} sc={[1, 1 - 0.4 * wilt, 1]} c={wilt > 0.5 ? "#9a8a3a" : "#4fa83a"} ws={10} hs={8} />
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a8ee0" mid="#8cc6f0" low="#eef6f8" />
    <Clouds t={t} n={8} y={44} />
    <Mainland /><River t={t} /><Trees spots={FOREST} c={["#2f7a3a", "#3a8f44"]} />
    <Lagoon t={t} /><Section t={t} />
    {/* na abertura c a câmera fica além do Lido (de longe, para caber a ilha inteira): Lido e compressores saem do quadro */}
    {openOf() === "c" && t < T.debajo ? null : <><Lido t={t} /><Compressor t={t} /><Tide t={t} /></>}<Isles t={t} />
    <Piles t={t} /><PileDriver t={t} /><Squeeze t={t} /><Pigeons t={t} /><Splash t={t} /><StiltForest t={t} /><Sapling t={t} />
    <Sph rad={1} p={BARENA} sc={[1.7, 0.22, 1.3]} c="#a08a5a" ws={14} hs={8} />
    <CityHouses t={t} /><DemoHouse t={t} /><SaltDrops t={t} /><SinkHouse t={t} /><Materials t={t} />
    <Logs t={t} /><PoleRiver t={t} /><PoleSection t={t} /><Oxygen t={t} /><Bacteria t={t} /><Gondola t={t} />
  </>
);
