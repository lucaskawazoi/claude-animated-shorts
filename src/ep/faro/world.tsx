// Mundo do E7: Alexandria de brinquedo. Mar (y=0) ao norte; costa da cidade em z>12 (terra no topo y=0,6); ilha de Faros
// alongada (x -34..22, z -26..-16) com a torre na ponta leste (16,-21); o Heptastadion liga a ilha à cidade em x=-8 e
// separa dois portos. Rochas escondidas, navios, a noite (luz baixa + céu escuro), a fortaleza de Qaitbay e faros de hoje.
import React, { useMemo } from "react";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Palms, Puffs, Sky } from "../../toy/scenery";
import { Horse } from "../../toy/horse";
import { T } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.alejandria - 0.12;
export const TOP = 0.6;
const SAND = "#e6d3a3", STONE = "#efe6cf", STONE2 = "#d9ccb0", SEA = "#2f86c8";
export const TW = { x: 16, z: -21 };
export const night = (t: number) => ease(t, T.p4 - 0.3, T.p4 + 1.6) * (1 - ease(t, T.fuegoT + 0.2, T.p5 + 1.6));
const quake = (t: number) => (t > T.peor && t < T.piedras ? 1 - ease(t, T.ruinas, T.piedras) : 0);

// ---------------------------------------------------------------- terra, mar, ilha, cidade
const Land: React.FC = () => (
  <G>
    <mesh position={[0, 0, -40]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(SEA, { rough: 0.35 })}><planeGeometry args={[700, 400]} /></mesh>
    <Box s={[400, 1.2, 120]} p={[0, 0, 74]} c={SAND} />
    <Box s={[400, 0.05, 2.2]} p={[0, 0.03, 13.1]} c="#bfe6f2" cast={false} />
    <Box s={[56, 1.2, 9]} p={[-6, 0, -21]} c={SAND} /><Cyl rt={4.5} h={1.2} p={[-34, 0, -21]} c={SAND} seg={14} /><Cyl rt={5.5} h={1.2} p={[20, 0, -21]} c={SAND} seg={14} />
    <Box s={[60, 0.05, 11]} p={[-6, 0.02, -21]} c="#bfe6f2" cast={false} />
  </G>
);
const City: React.FC = () => {
  const hs = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: lerp(-70, 60, rnd(i * 3 + 1)), z: lerp(18, 50, rnd(i * 3 + 2)), w: lerp(2.5, 5, rnd(i * 3 + 3)), h: lerp(1.6, 4, rnd(i + 7)) })).filter((q) => Math.abs(q.x + 8) > 4.5 && Math.abs(q.x + 20) > 6), []);
  return (
    <G>
      {hs.map((q, i) => <G key={i} p={[q.x, TOP, q.z]}><Box s={[q.w, q.h, q.w * 0.8]} p={[0, q.h / 2, 0]} c={i % 3 ? "#f4efe2" : "#efe0c4"} /><Box s={[q.w * 0.3, 0.6, 0.1]} p={[0, q.h * 0.45, q.w * 0.4 + 0.02]} c="#6a4a2a" cast={false} /></G>)}
      {/* templo de colunas na beira */}
      <G p={[-20, TOP, 22]}>
        <Box s={[10, 0.6, 6]} p={[0, 0.3, 0]} c={STONE2} />
        {Array.from({ length: 6 }, (_, i) => <Cyl key={i} rt={0.32} h={3.6} p={[-4 + i * 1.6, 2.4, 2.4]} c={STONE} seg={10} />)}
        <Box s={[10, 3.6, 4]} p={[0, 2.4, -0.8]} c={STONE} /><Cone rad={6.4} h={1.6} seg={4} p={[0, 5.0, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.6]} c="#d9ccb0" />
      </G>
      <Palms spots={[[-30, TOP, 16], [-12, TOP, 17], [2, TOP, 16.5], [10, TOP, 18], [24, TOP, 16], [-40, TOP, 18]]} t={0} />
    </G>
  );
};
/** rochas escondidas: quase na flor d'água; brilham de vermelho quando o narrador fala delas */
const ROCKS: [number, number][] = [[-16, -8], [-26, -12], [-4, -11], [26, -8], [30, -32], [-40, -30], [6, -33], [-50, -6]];
const Rocks: React.FC<{ t: number }> = ({ t }) => {
  const g = ease(t, T.rocas - 0.1, T.rocas + 0.3) * (1 - ease(t, T.b1, T.b1 + 0.6));
  return <G>{ROCKS.map(([x, z], i) => <Sph key={i} rad={1.3} p={[x, -0.55, z]} sc={[1.4, 0.55, 1]} c="#4a5560" o={{ emissive: "#ff2a1a", ei: g * 1.3 }} ws={8} hs={6} />)}</G>;
};
/** galera de brinquedo; frente = +x local */
const Ship: React.FC<{ p: V3; yaw: number; t: number; tilt?: number; sink?: number; sail?: string }> = ({ p, yaw, t, tilt = 0, sink = 0, sail = "#f5efe0" }) => (
  <G p={[p[0], p[1] + 0.08 * Math.sin(t * 2 + p[0]) - sink, p[2]]} r={[0, yaw, tilt + 0.03 * Math.sin(t * 1.6 + p[2])]}>
    <Box s={[4.2, 0.9, 1.5]} p={[0, 0.35, 0]} c="#8a5a32" /><Cone rad={0.78} h={1.4} seg={4} p={[2.75, 0.4, 0]} r={[0, 0, -PI / 2]} sc={[1, 1, 1]} c="#8a5a32" />
    <Box s={[0.9, 0.9, 1.5]} p={[-2.1, 0.9, 0]} c="#7a4a2a" /><Box s={[4.4, 0.12, 1.6]} p={[0, 0.84, 0]} c="#c08a4a" cast={false} />
    <Cyl rt={0.08} h={4.4} p={[0.2, 3.0, 0]} c="#6b4423" seg={6} />
    <Box s={[0.08, 2.6, 3.2]} p={[0.3, 3.2, 0]} c={sail} /><Box s={[0.09, 0.4, 3.22]} p={[0.3, 3.4, 0]} c="#c8553d" cast={false} />
  </G>
);
const sail = (t: number, a: number, b: number, from: V3, to: V3) => { const u = clamp((t - a) / (b - a)); return [lerp(from[0], to[0], u), 0, lerp(from[2], to[2], u)] as V3; };
const Ships: React.FC<{ t: number }> = ({ t }) => {
  const crash = ease(t, T.barcos + 0.3, T.barcos + 1.0);
  return (
    <G>
      {built(t) ? <Ship p={[4, 0, -10]} yaw={0.4} t={t} /> : null}
      {t > T.alejandria && t < T.b2 ? <Ship p={t < T.barcos + 0.4 ? sail(t, T.alejandria, T.barcos + 0.4, [-60, 0, -15], [-18.2, 0, -8]) : [-18.2, 0, -8]} yaw={-0.15} t={t} tilt={0.35 * crash} sink={0.5 * crash} /> : null}
      {t > T.une && t < T.p3 + 0.5 ? <><Ship p={sail(t, T.une, T.hepta + 0.6, [34, 0, -8], [2, 0, 4])} yaw={PI + 0.3} t={t} /><Ship p={sail(t, T.une, T.hepta + 0.6, [-54, 0, -8], [-20, 0, 4])} yaw={-0.3} t={t} sail="#e8d27a" /></> : null}
      {t > T.nadie - 0.5 && t < T.p5 + 1 ? <Ship p={t < T.fuego ? sail(t, T.nadie - 0.5, T.fuego, [66, 0, 30], [64, 0, 28]) : sail(t, T.fuego, T.p5 + 1, [64, 0, 28], [46, 0, 13])} yaw={t < T.fuego ? 2.0 + 0.6 * Math.sin(t * 2) : 2.47} t={t} /> : null}
      {t > T.pie ? <Ship p={sail(t, T.pie, T.end, [40, 0, -14], [26, 0, -10])} yaw={PI} t={t} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- o Heptastadion: blocos saindo da cidade até a ilha
const DIKE = { x: -8, z0: 12, z1: -16.5 };
const Dike: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.dique, T.une + 0.6); if (k <= 0.01) return null;
  const L = (DIKE.z0 - DIKE.z1) * k, harb = ease(t, T.puertos - 0.1, T.puertos + 0.4) * (1 - ease(t, T.hepta + 0.8, T.p3 + 0.5));
  return (
    <G>
      <Box s={[3.6, 1.0, L]} p={[DIKE.x, 0.1, DIKE.z0 - L / 2]} c={STONE2} />
      {Array.from({ length: Math.floor(L / 2) }, (_, i) => <Box key={i} s={[3.7, 0.08, 0.1]} p={[DIKE.x, 0.62, DIKE.z0 - 1 - i * 2]} c="#bfae8c" cast={false} />)}
      {harb > 0.01 ? [-1, 1].map((s) => <mesh key={s} position={[DIKE.x + s * 11, 0.06, -2]} rotation={[-PI / 2, 0, 0]} material={mat(s > 0 ? "#7fe0a0" : "#ffd75a", { opacity: 0.45 * harb, depthWrite: false })}><circleGeometry args={[8, 24]} /></mesh>) : null}
    </G>
  );
};

// ---------------------------------------------------------------- a torre: primeiro um bloco ingênuo; depois três pisos que afinam
export const H1 = 16, H2 = 10, H3 = 6;
const tierK = (t: number, a: number) => (built(t) ? 1 : t < T.b3 ? 0 : ease(t, a - 0.3, a + 0.4));
const naiveK = (t: number) => (built(t) ? 0 : ease(t, T.torre, T.torre + 1.3) * (1 - ease(t, T.b3, T.tres)));
export const cutK = (t: number) => (t > T.b5 - 0.2 && t < T.terremotos + 0.6 ? 1 : 0);
export const fireK = (t: number) => (built(t) ? 1 : ease(t, T.fuego, T.cima)) * (1 - ease(t, T.terremotos + 0.3, T.ruinas - 0.4));
const Tower: React.FC<{ t: number }> = ({ t }) => {
  const nk = naiveK(t), sway = ease(t, T.viento - 0.4, T.viento + 0.3) * (1 - ease(t, T.b3, T.b3 + 0.4));
  const k1 = tierK(t, T.abajo), k2 = tierK(t, T.medio), k3 = tierK(t, T.arriba), cut = cutK(t), q = quake(t);
  const fall = ease(t, T.peor - 0.2, T.ruinas), rubble = ease(t, T.ruinas - 0.3, T.ruinas + 0.3) * (1 - ease(t, T.piedras, T.fortaleza + 0.4));
  const fk = fireK(t), y1 = TOP + H1, y2 = y1 + H2, y3 = y2 + H3;
  const sh: V3 = [q * 0.25 * Math.sin(t * 41), 0, q * 0.2 * Math.sin(t * 33)];
  return (
    <G p={[TW.x + sh[0], 0, TW.z + sh[2]]}>
      {nk > 0.01 ? <G r={[0, 0, 0.05 * sway * Math.sin(t * 3.2)]}>
        <Box s={[7, 34 * nk, 7]} p={[0, TOP + 17 * nk, 0]} c={STONE} />
        {sway > 0.3 ? [[-1.2, 10, 0.5], [0.8, 18, -0.4], [-0.4, 25, 0.7]].map(([x, y, r], i) => <Box key={i} s={[3.2, 0.12, 0.08]} p={[x, y, 3.53]} r={[0, 0, r]} c="#3a2a1a" cast={false} />) : null}
      </G> : null}
      {/* piso 1 quadrado (paredes separadas: a da frente some no corte da rampa) */}
      {k1 > 0.01 && fall < 0.999 ? <G sc={[1, Math.max(0.01, k1 * (1 - fall * 0.85)), 1]}>
        <Box s={[10, H1, 0.8]} p={[0, TOP + H1 / 2, -4.6]} c={cut > 0.5 ? "#a99a7c" : STONE} /><Box s={[0.8, H1, 10]} p={[-4.6, TOP + H1 / 2, 0]} c={STONE} /><Box s={[0.8, H1, 10]} p={[4.6, TOP + H1 / 2, 0]} c={STONE} />
        <Box s={[10, H1, 0.8]} p={[0, TOP + H1 / 2, 4.6]} c={STONE} vis={cut < 0.5} />
        {cut < 0.5 ? [4, 8, 12].map((y) => <Box key={y} s={[0.6, 1.0, 0.1]} p={[0, TOP + y, 5.02]} c="#3a3020" cast={false} />) : null}
        <Box s={[10.6, 0.6, 10.6]} p={[0, TOP + H1, 0]} c={STONE2} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * PI * 2; return <Box key={i} s={[1, 0.9, 1]} p={[Math.round(Math.cos(a)) * 4.8, TOP + H1 + 0.7, Math.round(Math.sin(a)) * 4.8]} c={STONE2} />; })}
        <Ramp t={t} on={cut} />
      </G> : null}
      {/* pisos 2 e 3 */}
      <G p={[fall * 9, -fall * 22, fall * 3]} r={[0, 0, -fall * 1.3]} vis={fall < 0.98}>
        {k2 > 0.01 ? <Cyl rt={3.7} rb={3.9} h={H2 * k2} seg={8} p={[0, y1 + (H2 * k2) / 2, 0]} c={STONE2} /> : null}
        {k3 > 0.01 ? <Cyl rt={2.1} rb={2.3} h={H3 * k3} seg={16} p={[0, y2 + (H3 * k3) / 2, 0]} c={STONE} /> : null}
        {k3 > 0.9 ? <G p={[0, y3, 0]}>
          {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * PI * 2; return <Cyl key={i} rt={0.18} h={2.2} p={[Math.cos(a) * 1.6, 1.1, Math.sin(a) * 1.6]} c={STONE2} seg={6} />; })}
          <Cone rad={2.2} h={1.4} seg={16} p={[0, 2.9, 0]} c={STONE2} /><Cyl rt={0.35} h={1.4} p={[0, 4.2, 0]} c="#c9a24a" seg={8} /><Sph rad={0.45} p={[0, 5.1, 0]} c="#c9a24a" />
          <G vis={fk > 0.01}>
            <Cone rad={0.9 * fk} h={1.8 * fk * (1 + 0.12 * Math.sin(t * 15))} seg={7} p={[0, 1.1, 0]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 2 }} cast={false} />
            <Cone rad={0.5 * fk} h={1.1 * fk} seg={7} p={[0, 0.8, 0]} c="#ffe066" o={{ emissive: "#ffd000", ei: 2 }} cast={false} />
            <Sph rad={3.4 + 2.6 * night(t)} p={[0, 1.2, 0]} c="#ffb040" cast={false} recv={false} o={{ emissive: "#ff9a20", ei: 1.4, opacity: (0.12 + 0.3 * night(t)) * fk, depthWrite: false }} ws={14} hs={10} />
          </G>
        </G> : null}
      </G>
      {rubble > 0.01 ? Array.from({ length: 18 }, (_, i) => <Box key={i} s={[1.6, 1.0, 1.2]} p={[(rnd(i) - 0.5) * 12, TOP + 0.4 + (i % 3) * 0.7 * rubble, (rnd(i + 5) - 0.5) * 10]} r={[rnd(i + 1), rnd(i + 2) * 2, rnd(i + 3)]} sc={Math.max(0.01, rubble)} c={i % 2 ? STONE : STONE2} />) : null}
      <Puffs t={t} p={[0, TOP, 0]} n={10} period={1.8} rise={8} size={3} c="#e8dcc0" on={ease(t, T.peor, T.ruinas) * (1 - ease(t, T.piedras, T.fortaleza))} drift={[0, 0, 2]} />
    </G>
  );
};
/** rampa em espiral por dentro do piso 1, com dois cavaleiros lado a lado subindo */
const N_R = 44, R_IN = 2.0, R_OUT = 4.0, STEP = (PI * 2) / 11, RISE = 0.34;
const Ramp: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on < 0.5) return null;
  const grow = ease(t, T.dentro - 0.2, T.rampa + 1.2), ride = clamp((t - T.viajero) / 6);
  return (
    <G p={[0, TOP, 0]}>
      <Box s={[3.6, H1, 3.6]} p={[0, H1 / 2, 0]} c="#9c8f74" />
      <Box s={[8.6, 0.2, 8.6]} p={[0, 0.1, 0]} c="#cbbd9c" />
      {Array.from({ length: N_R }, (_, i) => { if (i / N_R > grow) return null; const a = i * STEP;
        return <G key={i} p={[0, 0.3 + i * RISE, 0]} r={[0, -a, 0]}><Box s={[R_OUT - R_IN + 0.2, 0.3, 1.25]} p={[(R_IN + R_OUT) / 2 + 0.2, 0, 0]} c="#f6eedb" /><Box s={[0.18, 0.5, 1.25]} p={[R_OUT + 0.2, 0.3, 0]} c="#b8a888" /></G>; })}
      {t > T.viajero - 0.3 ? [R_IN + 0.5, R_OUT - 0.4].map((r, j) => { const s = 4 + ride * 18, a = s * STEP; return <G key={j} p={[0, 0.42 + s * RISE, 0]} r={[0, -a, 0]}><Horse p={[r + 0.2, 0, 0]} yaw={-PI / 2} t={t + j * 0.4} c={j ? "#6b3e22" : "#c9a06a"} rider={j ? "#2f6fb0" : "#c8553d"} speed={10} /></G>; }) : null}
    </G>
  );
};
/** a fortaleza de Qaitbay que sobe no mesmo lugar, com as pedras do farol */
const Fort: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.fortaleza - 0.4, T.pie); if (k <= 0.01) return null;
  const C = "#e3cf9e";
  return (
    <G p={[TW.x, TOP, TW.z]} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[16, 3.2, 0.9]} p={[0, 1.6, 7.5]} c={C} /><Box s={[16, 3.2, 0.9]} p={[0, 1.6, -7.5]} c={C} /><Box s={[0.9, 3.2, 16]} p={[7.5, 1.6, 0]} c={C} /><Box s={[0.9, 3.2, 16]} p={[-7.5, 1.6, 0]} c={C} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => <Cyl key={i} rt={1.3} h={4.2} p={[a * 7.5, 2.1, b * 7.5]} c={C} seg={12} />)}
      <Box s={[7, 6.5, 7]} p={[0, 3.25, 0]} c="#ead8ab" />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b], i) => <Cyl key={i} rt={1.1} h={7.6} p={[a * 3.5, 3.8, b * 3.5]} c={C} seg={12} />)}
      {Array.from({ length: 6 }, (_, i) => <Box key={i} s={[0.7, 0.6, 0.7]} p={[-2.6 + i * 1.04, 6.8, 3.4]} c={C} />)}
      <Cyl rt={0.5} h={2.2} p={[0, 7.6, 0]} c={C} seg={10} /><Sph rad={0.55} p={[0, 8.8, 0]} c={C} />
      <Box s={[1.4, 2.2, 0.2]} p={[0, 1.1, 3.56]} c="#4a3a2a" cast={false} />
    </G>
  );
};
/** faros de hoje que acendem pelo mundo: a palavra ficou */
const MODERN: V3[] = [[-16, 0, -36], [14, 0, -46], [-4, 0, -60], [30, 0, -34], [-30, 0, -52], [24, 0, -62]];
const Modern: React.FC<{ t: number }> = ({ t }) => (
  <G>{MODERN.map((p, i) => { const k = ease(t, T.nombre2 + i * 0.25, T.nombre2 + i * 0.25 + 0.5); if (k <= 0.01) return null;
    return <G key={i} p={p} sc={k * 1.9}><Cyl rt={3} h={1.4} p={[0, 0.2, 0]} c="#8a8f94" seg={10} />{[0, 1, 2, 3].map((j) => <Cyl key={j} rt={1.05 - j * 0.1} rb={1.15 - j * 0.1} h={1.8} p={[0, 1.8 + j * 1.8, 0]} c={j % 2 ? "#ffffff" : "#d8352a"} seg={12} />)}
      <Cyl rt={0.75} h={1.0} p={[0, 9.0, 0]} c="#ffe9a0" o={{ emissive: "#ffd34a", ei: 1.4 }} seg={10} /><Cone rad={0.95} h={0.8} seg={12} p={[0, 9.9, 0]} c="#d8352a" />
      <Sph rad={1.8} p={[0, 9.0, 0]} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffd34a", ei: 1, opacity: 0.35, depthWrite: false }} ws={10} hs={8} /></G>; })}</G>
);
/** prédio de 30 andares, só no gancho, ao lado da torre (comparação de altura) */
const Building: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 0.15, T.treinta + 0.4) * (1 - ease(t, T.construido - 0.1, T.construido + 0.4)); if (k <= 0.01) return null;
  return (
    <G p={[TW.x + 11, TOP, TW.z + 2]} sc={[1, k, 1]}>
      <Box s={[6, 33, 6]} p={[0, 16.5, 0]} c="#8fa4b8" o={{ rough: 0.3, metal: 0.2 }} />
      {Array.from({ length: 15 }, (_, i) => <Box key={i} s={[6.04, 0.25, 6.04]} p={[0, 1.6 + i * 2.15, 0]} c="#e6edf3" cast={false} />)}
    </G>
  );
};
/** obreiros carregando combustível (feixes) até a porta */
const Fuel: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p5 - 0.2 && t < T.b5 + 0.3)) return null;
  return <G>{[0, 1, 2].map((i) => <G key={i} p={[TW.x - 3 + i * 1.6, TOP, TW.z + 6.4 + (i % 2) * 0.6]}><Cyl rt={0.35} h={1.4} p={[0, 0.7, 0]} r={[PI / 2, 0, 0.2 * i]} c="#7a5a2a" seg={8} /><Cyl rt={0.36} h={0.12} p={[0, 0.7, 0.4]} r={[PI / 2, 0, 0]} c="#c9a24a" seg={8} /></G>)}</G>;
};
const Night: React.FC<{ t: number }> = ({ t }) => {
  const n = night(t); if (n <= 0.01) return null;
  return (
    <G>
      <mesh><sphereGeometry args={[560, 24, 16]} /><meshBasicMaterial color="#1a2a5a" side={1} transparent opacity={0.72 * n} fog={false} depthWrite={false} /></mesh>
      {Array.from({ length: 40 }, (_, i) => <Sph key={i} rad={1.2} p={[lerp(-300, 300, rnd(i)), lerp(80, 260, rnd(i + 3)), -420 + rnd(i + 7) * 60]} c="#ffffff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 1.5 * n, opacity: n, depthWrite: false }} ws={4} hs={3} />)}
    </G>
  );
};
const Gulls: React.FC<{ t: number }> = ({ t }) => (
  <G>{[0, 1, 2].map((i) => { const a = t * 0.5 + i * 2.1, f = Math.sin(t * 8 + i); return <G key={i} p={[TW.x + Math.cos(a) * 14, 24 + i * 3, TW.z + Math.sin(a) * 10]} r={[0, -a, 0]}><Box s={[0.5, 0.15, 0.2]} c="#ffffff" cast={false} /><Box s={[0.1, 0.05, 0.9]} p={[0, 0.1, 0.45]} r={[f * 0.5, 0, 0]} c="#f2f2f2" cast={false} /><Box s={[0.1, 0.05, 0.9]} p={[0, 0.1, -0.45]} r={[-f * 0.5, 0, 0]} c="#f2f2f2" cast={false} /></G>; })}</G>
);
const Wind: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.viento - 0.4, T.viento) * (1 - ease(t, T.b3, T.b3 + 0.3)); if (k <= 0.01) return null;
  return <G>{Array.from({ length: 14 }, (_, i) => { const u = fract(t * 1.2 + rnd(i)); return <Box key={i} s={[6 * k, 0.08, 0.08]} p={[lerp(-14, 40, u), 6 + rnd(i + 1) * 26, TW.z + 6 + rnd(i + 2) * 6]} c="#ffffff" cast={false} recv={false} o={{ opacity: 0.8, emissive: "#ffffff", ei: 0.6, depthWrite: false }} />; })}</G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a8ee0" mid="#8fc8f0" low="#f2f6f4" />
    <Night t={t} />
    <Clouds t={t} n={7} y={36} />
    <Land /><City /><Rocks t={t} /><Ships t={t} /><Dike t={t} />
    <Tower t={t} /><Fort t={t} /><Modern t={t} /><Building t={t} /><Fuel t={t} /><Gulls t={t} /><Wind t={t} />
  </>
);
