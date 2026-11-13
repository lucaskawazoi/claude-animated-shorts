// Mundo do E7: Alexandria de brinquedo. Mar (y=0) ao norte; costa da cidade em z>12 (terra no topo y=0,6); ilha de Faros
// alongada (x -34..22, z -26..-16) com a torre na ponta leste (16,-21); o Heptastadion liga a ilha à cidade em x=-8 e
// separa dois portos. Rochas escondidas, navios, a noite (luz baixa + céu escuro), a fortaleza de Qaitbay e faros de hoje.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, prog, rnd, sstep } from "../../toy/kit";
import { Clouds, Palms, Puffs, Sky } from "../../toy/scenery";
import { Horse } from "../../toy/horse";
import { BEAM0, BEAM_W, CUTS, HOIST, IMPACT, LOST, T, WINS } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.alejandria - 0.12;
export const TOP = 0.6;
const SAND = "#e6d3a3", STONE = "#efe6cf", STONE2 = "#d9ccb0", SEA = "#2f86c8";
export const TW = { x: 16, z: -21 };
// noite em rampa LINEAR de ~3,4 s: com 1,9 s em smootherstep a régua via um corte aos 57,5 s (o céu passa de mais claro a
// mais escuro que a torre dentro de ~1 s e ela lê como fusão)
export const night = (t: number) => prog(t, T.p4 - 1.0, T.b4 + 0.7) * (1 - ease(t, T.fuegoT + 0.2, T.p5 + 1.6));
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
// pré-crítica de ritmo: 11,2–14,3 s era mar vazio → as rochas furam a água UMA A UMA (as do quadro primeiro), com respingo
const ROCK_T = [12.55, 12.0, 13.1, 13.65, 14.2, 14.2, 14.2, 14.2].map((x) => x - 12.2 + T.costa);
const Rocks: React.FC<{ t: number }> = ({ t }) => {
  if (built(t)) return null;
  const g = ease(t, T.rocas - 0.1, T.rocas + 0.3) * (1 - ease(t, T.b1, T.b1 + 0.6));
  return <G>{ROCKS.map(([x, z], i) => { const u = t - ROCK_T[i], up = ease(u, 0, 0.35), y = lerp(-1.6, -0.55, up) + 0.18 * Math.sin(PI * clamp(u / 0.5));
    return <G key={i}>
      <Sph rad={1.3} p={[x, y, z]} sc={[1.4, 0.55, 1]} c="#4a5560" o={{ emissive: "#ff2a1a", ei: g * 1.3 }} ws={8} hs={6} vis={up > 0.01} />
      {u > 0 && u < 0.9 ? <mesh position={[x, 0.06, z]} rotation={[-PI / 2, 0, 0]} scale={[1 + 3.5 * u, 1 + 3.5 * u, 1]} material={mat("#ffffff", { opacity: Math.round(10 * 0.9 * (1 - u / 0.9)) / 10, depthWrite: false, emissive: "#ffffff", ei: 0.4 })}><ringGeometry args={[1.5, 2.0, 24]} /></mesh> : null}
      <Burst t={t} t0={ROCK_T[i]} o={[x, 0.2, z]} n={8} life={0.8} c="#ffffff" size={0.3} speed={1.6} up={4} seed={i * 5} />
    </G>; })}</G>;
};
/** galera de brinquedo; frente = +x local. tilt = proa para cima, roll = adernar, crack = rachadura no casco, pilot = braço do piloto (0 baixo → 1 apontando) */
const Ship: React.FC<{ p: V3; yaw: number; t: number; tilt?: number; roll?: number; sink?: number; sail?: string; crack?: number; pilot?: number }> = ({ p, yaw, t, tilt = 0, roll = 0, sink = 0, sail = "#f5efe0", crack = 0, pilot }) => (
  <G p={[p[0], p[1] + 0.08 * Math.sin(t * 2 + p[0]) - sink, p[2]]} r={[0, yaw, 0]}>
    <G r={[roll, 0, tilt + 0.03 * Math.sin(t * 1.6 + p[2])]}>
      <Box s={[4.2, 0.9, 1.5]} p={[0, 0.35, 0]} c="#8a5a32" /><Cone rad={0.78} h={1.4} seg={4} p={[2.75, 0.4, 0]} r={[0, 0, -PI / 2]} sc={[1, 1, 1]} c="#8a5a32" />
      <Box s={[0.9, 0.9, 1.5]} p={[-2.1, 0.9, 0]} c="#7a4a2a" /><Box s={[4.4, 0.12, 1.6]} p={[0, 0.84, 0]} c="#c08a4a" cast={false} />
      <Cyl rt={0.08} h={4.4} p={[0.2, 3.0, 0]} c="#6b4423" seg={6} />
      <Box s={[0.08, 2.6, 3.2]} p={[0.3, 3.2, 0]} c={sail} /><Box s={[0.09, 0.4, 3.22]} p={[0.3, 3.4, 0]} c="#c8553d" cast={false} />
      {crack > 0.01 ? [-1, 1].map((s) => <G key={s} p={[1.7, 0.4, s * 0.78]} sc={[crack, 1, 1]}>
        <Box s={[0.8, 0.12, 0.05]} p={[-0.22, 0.13, 0]} r={[0, 0, 0.75]} c="#1e140c" cast={false} />
        <Box s={[0.75, 0.12, 0.05]} p={[0.25, -0.1, 0]} r={[0, 0, -0.7]} c="#1e140c" cast={false} />
      </G>) : null}
      {pilot !== undefined ? <G p={[-1.35, 0.9, 0]}>
        <Cyl rt={0.2} rb={0.27} h={0.72} p={[0, 0.36, 0]} c="#2f6fb0" seg={10} />
        <Sph rad={0.22} p={[0, 0.95, 0]} c="#d9a878" ws={10} hs={8} /><Cyl rt={0.24} rb={0.26} h={0.16} p={[0, 1.13, 0]} c="#c8553d" seg={10} />
        <G p={[0.02, 0.62, -0.26]} r={[0, 0, lerp(-1.35, 0.6, pilot)]}><Box s={[0.66, 0.13, 0.13]} p={[0.32, 0, 0]} c="#2f6fb0" /></G>
      </G> : null}
    </G>
  </G>
);
const sail = (t: number, a: number, b: number, from: V3, to: V3) => { const u = clamp((t - a) / (b - a)); return [lerp(from[0], to[0], u), 0, lerp(from[2], to[2], u)] as V3; };
/** estouro no instante t0: pedaços saem de o, sobem e caem (somem sob o mar opaco) */
const Burst: React.FC<{ t: number; t0: number; o: V3; n: number; life: number; c: string; size: number; speed: number; up: number; box?: boolean; seed?: number }> = ({ t, t0, o, n, life, c, size, speed, up, box, seed = 0 }) => {
  const u = t - t0; if (u <= 0 || u >= life) return null;
  return <G p={o}>{Array.from({ length: n }, (_, i) => {
    const a = rnd(i + seed) * PI * 2, sp = speed * (0.5 + rnd(i + seed + 7)), vy = up * (0.6 + 0.8 * rnd(i + seed + 3));
    const p: V3 = [Math.cos(a) * sp * u, vy * u - 4.9 * u * u, Math.sin(a) * sp * u];
    return box ? <Box key={i} s={[0.9 * size, 0.14 * size, 0.3 * size]} p={p} r={[u * 7 * rnd(i + 1), u * 5, u * 9 * rnd(i + 2)]} c={c} cast={false} />
      : <Sph key={i} rad={Math.max(0.01, size * (1 - 0.7 * u / life))} p={p} c={c} cast={false} ws={8} hs={6} o={{ rough: 1 }} />;
  })}</G>;
};
// o navio que bate: anda até a rocha escondida, PARA de uma vez, a proa sobe, racha, recua, aderna e afunda um pouco
const HIT: V3 = [-18.6, 0, -8.2], HIT_YAW = -0.16, HEAD: V3 = [Math.cos(HIT_YAW), 0, -Math.sin(HIT_YAW)];
const BOW: V3 = [HIT[0] + HEAD[0] * 3.2, 0.45, HIT[2] + HEAD[2] * 3.2];
const CrashShip: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.alejandria && t < T.b2)) return null;
  const u = t - IMPACT, back = u > 0 ? 0.5 * Math.sin(PI * clamp(u / 0.45)) : 0;
  const p: V3 = u <= 0 ? sail(t, T.alejandria, IMPACT, [-60, 0, -15], HIT) : [HIT[0] - HEAD[0] * back, 0, HIT[2] - HEAD[2] * back];
  const tilt = u <= 0 ? 0 : u < 0.1 ? 0.34 * sstep(u / 0.1) : 0.34 * (1 - 0.45 * ease(u, 0.1, 0.8));
  return (
    <G>
      <Ship p={p} yaw={HIT_YAW} t={t} tilt={tilt} roll={-0.42 * ease(u, 0.25, 1.5) - 0.3 * ease(u, 1.8, 4.6)} sink={0.55 * ease(u, 0.3, 2.0) + 0.8 * ease(u, 1.8, 4.6)} crack={ease(u, 0, 0.12)} />
      <Burst t={t} t0={IMPACT} o={BOW} n={14} life={1.1} c="#ffffff" size={0.42} speed={2.2} up={5.5} />
      <Burst t={t} t0={IMPACT} o={BOW} n={7} life={1.3} c="#8a5a32" size={1} speed={3.2} up={5} box seed={11} />
    </G>
  );
};
/** o navio dos pilotos (plano 4): cruza NA FRENTE da torre (esq.→dir. na tela) e, quando «los pilotos saben», vira e vai
 *  direto para ela (pré-crítica de ritmo: 24–28,5 s era a torre parada atrás de um navio que só se afastava) */
const PX: V3 = [29.6, 0, -64.1], PR: V3 = [-0.952, 0, -0.305], PC = T.pilotos - 0.5; // cruzamento diante da base; PR = direita da tela
const PA: V3 = [PX[0] - 8 * PR[0], 0, PX[2] - 8 * PR[2]], PB: V3 = [PX[0] + 4 * PR[0], 0, PX[2] + 4 * PR[2]], PD: V3 = [20, 0, -46];
const pilotPath = (t: number): [V3, number] => {
  if (t < PC) return [sail(t, WINS[3] - 0.05, PC, PA, PX), Math.atan2(-PR[2], PR[0])];
  const u = clamp((t - PC) / (CUTS[2] - PC)), a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
  const p: V3 = [a * PX[0] + b * PB[0] + c * PD[0], 0, a * PX[2] + b * PB[2] + c * PD[2]];
  const d = [2 * (1 - u) * (PB[0] - PX[0]) + 2 * u * (PD[0] - PB[0]), 2 * (1 - u) * (PB[2] - PX[2]) + 2 * u * (PD[2] - PB[2])];
  return [p, Math.atan2(-d[1], d[0])];
};
const PilotShip: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > WINS[3] - 0.05 && t < CUTS[2])) return null;
  const [p, yaw] = pilotPath(t);
  return <Ship p={p} yaw={yaw} t={t} sail="#f2e2b0" pilot={ease(t, T.pilotos - 0.1, T.pilotos + 0.35)} />;
};
/** o alto da torre ingênua pisca como sinal de jogo desde «se ve antes que la costa» (antes do marcador dos pilotos) */
const Ping: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.pilotos - 1.1, k = ease(t, t0, t0 + 0.3) * (1 - ease(t, T.torreT + 0.3, T.torreT + 0.8)); if (k <= 0.01) return null;
  const ph = fract((t - t0) / 0.7), blink = fract((t - t0) / 0.35) < 0.5 ? 1 : 0.35;
  return <G p={[TW.x, TOP + 34 + 1.2, TW.z]}>
    <Sph rad={1.3 * k} c="#ffd34a" cast={false} recv={false} o={{ emissive: "#ffb000", ei: 2 * blink }} ws={12} hs={8} />
    <Sph rad={1.5 + 6 * ph} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffd34a", ei: 1, opacity: Math.round(10 * 0.6 * (1 - ph) * k) / 10, depthWrite: false }} ws={14} hs={10} />
  </G>;
};
/** marcador de destino de jogo sobre a torre, quando «los pilotos saben hacia dónde ir» */
const Waypoint: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.pilotos + 0.1, T.pilotos + 0.45) * (1 - ease(t, T.torreT + 0.3, T.torreT + 0.8)); if (k <= 0.01) return null;
  return <G p={[TW.x, 39.5 + 0.6 * Math.sin(t * 4), TW.z]} r={[PI, t * 2.2, 0]} sc={k}><Cone rad={2.6} h={4} seg={4} c="#ffd34a" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /></G>;
};
/** névoa baixa sobre a costa, só enquanto a câmera está ao longe no mar: a torre aparece antes da costa */
const Haze: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, WINS[3] + 0.05, WINS[3] + 0.6) * (1 - ease(t, T.torreT + 0.05, T.torreT + 0.55)); if (k <= 0.01) return null;
  return <Box s={[460, 9, 12]} p={[0, 4.5, 6]} c="#e4eff3" cast={false} recv={false} o={{ opacity: 0.94 * k, depthWrite: false, emissive: "#e4eff3", ei: 0.35 }} />;
};
/** «de noche»: o facho do fogo gira; cada barquinho ao longe acende a lanterna quando o facho passa e vira para a torre */
export const beamPhi = (t: number) => 0.915 + BEAM_W * (t - BEAM0);
const NB: [number, number, number][] = [[0.62, 28, 2.4], [0.74, 40, -1.9], [0.86, 46, 0.6], [0.98, 34, 3.4], [1.10, 24, -0.4]]; // azimute, distância, proa antes
const NightBoats: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.fuego && t < T.p5 + 0.6)) return null;
  return <G>{NB.map(([ph, d, y0], i) => {
    const tl = BEAM0 + (ph - 0.915) / BEAM_W, lit = ease(t, tl, tl + 0.2), turn = ease(t, tl + 0.1, tl + 0.8), go = Math.max(0, t - tl - 0.5);
    const r = d - 3.2 * go * ease(t, tl + 0.5, tl + 1.2), yawTo = ph + PI, yaw = lerp(y0 + 0.25 * Math.sin(t * 0.9 + i), yawTo, turn);
    const p: V3 = [TW.x + r * Math.cos(ph), 0, TW.z - r * Math.sin(ph)];
    return <G key={i}>
      <Ship p={p} yaw={yaw} t={t + i} />
      <G p={[p[0], 4.9, p[2]]} vis={lit > 0.01}>
        <Sph rad={0.45} c="#ffd34a" cast={false} recv={false} o={{ emissive: "#ffb000", ei: 2.2 }} ws={10} hs={8} />
        <Sph rad={1.6 * lit} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffd34a", ei: 1, opacity: 0.4, depthWrite: false }} ws={12} hs={8} />
      </G>
    </G>; })}</G>;
};
/** gag final: o barquinho perdido roda sem rumo; o marcador de jogo acende sobre a ilha e ele vai direto (callback dos pilotos) */
const LC: V3 = [-3.5, 0, -4.5], LD: V3 = [7, 0, -14.8];
const LostBoat: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.faros) return null;
  const spin = t < LOST[0] ? 0.6 * (t - T.faros) : 0.6 * (LOST[0] - T.faros) + 6.5 * (Math.min(t, LOST[1]) - LOST[0]);
  const a = spin, cp: V3 = [LC[0] + 1.6 * Math.cos(a), 0, LC[2] - 1.6 * Math.sin(a)], cy = a + PI / 2;
  const go = ease(t, LOST[1] + 0.05, LOST[1] + 1.1), dirY = Math.atan2(-(LD[2] - LC[2]), LD[0] - LC[0]);
  const p: V3 = t < LOST[1] ? cp : [lerp(cp[0], LD[0], go), 0, lerp(cp[2], LD[2], go)];
  const yaw = t < LOST[1] ? cy : lerp(cy, cy + (((dirY - cy) % (2 * PI)) + 3 * PI) % (2 * PI) - PI, ease(t, LOST[1], LOST[1] + 0.25));
  const arm = t < LOST[1] ? 0.5 + 0.5 * Math.sin(t * 11) : 1;
  const mk = ease(t, LOST[1] - 0.05, LOST[1] + 0.25);
  return <G>
    <Ship p={p} yaw={yaw} t={t} sail="#f2e2b0" pilot={arm} tilt={0.06 * Math.sin(t * 9) * (t < LOST[1] ? 1 : 0)} />
    {mk > 0.01 ? <G p={[LD[0], 6.5 + 0.5 * Math.sin(t * 4), LD[2] - 0.7]} r={[PI, t * 2.2, 0]} sc={mk}><Cone rad={1.6} h={2.6} seg={4} c="#ffd34a" o={{ emissive: "#ffb000", ei: 0.9 }} cast={false} /></G> : null}
  </G>;
};
const Ships: React.FC<{ t: number }> = ({ t }) => {
  return (
    <G>
      {built(t) ? <Ship p={[4, 0, -10]} yaw={0.4} t={t} /> : null}
      {/* pré-crítica de ritmo: 7–10,8 s casas paradas → um navio cruza a baía enquanto o operário aponta o mar */}
      {t > T.alejandria && t < CUTS[0] + 0.1 ? <Ship p={sail(t, T.alejandria + 0.2, CUTS[0], [24, 0, 2.6], [-16, 0, -2.2])} yaw={Math.atan2(4.8, -40)} t={t} sail="#e8d27a" /> : null}
      <CrashShip t={t} /><PilotShip t={t} /><NightBoats t={t} /><LostBoat t={t} />
      {t > T.une && t < T.p3 + 0.5 ? <><Ship p={sail(t, T.une, T.hepta + 0.6, [34, 0, -8], [2, 0, 4])} yaw={PI + 0.3} t={t} /><Ship p={sail(t, T.une, T.hepta + 0.6, [-54, 0, -8], [-20, 0, 4])} yaw={-0.3} t={t} sail="#e8d27a" /></> : null}
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
// pré-crítica: 18–21 s era o banco de areia vazio → a torre começa a subir já no «¡con ingenio!»
const naiveK = (t: number) => (built(t) ? 0 : ease(t, T.c1 - 0.2, T.torre + 1.0) * (1 - ease(t, T.b3, T.tres)));
export const cutK = (t: number) => (t > T.b5 - 0.2 && t < T.terremotos + 0.6 ? 1 : 0);
export const fireK = (t: number) => (built(t) ? 1 : ease(t, T.fuego, T.cima)) * (1 - ease(t, T.terremotos + 0.3, T.ruinas - 0.4));
const Tower: React.FC<{ t: number }> = ({ t }) => {
  const nk = naiveK(t), sway = ease(t, T.viento - 0.4, T.viento + 0.3) * (1 - ease(t, T.b3, T.b3 + 0.4));
  const k1 = tierK(t, T.abajo), k2 = tierK(t, T.medio), k3 = tierK(t, T.arriba), cut = cutK(t), q = quake(t);
  const fall = ease(t, T.peor - 0.2, T.ruinas), rubble = ease(t, T.ruinas - 0.3, T.ruinas + 0.3) * (1 - ease(t, T.piedras, T.fortaleza + 0.4));
  const fk = fireK(t), y1 = TOP + H1, y2 = y1 + H2, y3 = y2 + H3;
  // pré-crítica: a ruína (85–87 s) lia como bola de pedra → fica um TOCO do piso 1 com topo quebrado e rachaduras, até a fortaleza
  const stump = 1 - fall * 0.6, fortK = ease(t, T.fortaleza - 0.4, T.pie), broken = ease(t, T.peor, T.ruinas - 0.2) * (1 - fortK);
  const sh: V3 = [q * 0.25 * Math.sin(t * 41), 0, q * 0.2 * Math.sin(t * 33)];
  return (
    <G p={[TW.x + sh[0], 0, TW.z + sh[2]]}>
      {nk > 0.01 ? <G r={[0, 0, 0.05 * sway * Math.sin(t * 3.2)]}>
        <Box s={[7, 34 * nk, 7]} p={[0, TOP + 17 * nk, 0]} c={STONE} />
        {sway > 0.3 ? [[-1.2, 10, 0.5], [0.8, 18, -0.4], [-0.4, 25, 0.7]].map(([x, y, r], i) => <Box key={i} s={[3.2, 0.12, 0.08]} p={[x, y, 3.53]} r={[0, 0, r]} c="#3a2a1a" cast={false} />) : null}
      </G> : null}
      {/* piso 1 quadrado (paredes separadas: a da frente some no corte da rampa) */}
      {k1 > 0.01 && fortK < 0.999 ? <G sc={[1, Math.max(0.01, k1 * stump * (1 - fortK)), 1]}>
        <Box s={[10, H1, 0.8]} p={[0, TOP + H1 / 2, -4.6]} c={cut > 0.5 ? "#a99a7c" : STONE} /><Box s={[0.8, H1, 10]} p={[-4.6, TOP + H1 / 2, 0]} c={STONE} /><Box s={[0.8, H1, 10]} p={[4.6, TOP + H1 / 2, 0]} c={STONE} />
        <Box s={[10, H1, 0.8]} p={[0, TOP + H1 / 2, 4.6]} c={STONE} vis={cut < 0.5} />
        {cut < 0.5 ? [4, 8, 12].map((y) => <Box key={y} s={[0.6, 1.0, 0.1]} p={[0, TOP + y, 5.02]} c="#3a3020" cast={false} />) : null}
        <Box s={[10.6, 0.6, 10.6]} p={[0, TOP + H1, 0]} c={STONE2} vis={broken < 0.5} />
        {broken >= 0.5 ? null : Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * PI * 2; return <Box key={i} s={[1, 0.9, 1]} p={[Math.round(Math.cos(a)) * 4.8, TOP + H1 + 0.7, Math.round(Math.sin(a)) * 4.8]} c={STONE2} />; })}
        <Ramp t={t} on={cut} />
        {broken > 0.01 ? [[0, 5.0, 0], [5.0, 0, PI / 2]].map(([x, z, ry], j) => <G key={j} p={[x, 0, z]} r={[0, ry, 0]}>
          {[[-2.6, 5, 0.9], [-1.9, 7.6, -0.7], [-2.2, 10.3, 0.8], [2.1, 3.6, -0.8], [2.7, 6.4, 0.7], [2.2, 9.6, -0.6], [0.4, 12.6, 0.5]].map(([cx, cy, cr], i) =>
            <Box key={i} s={[2.4 * broken, 0.22, 0.12]} p={[cx, TOP + cy, 0.04]} r={[0, 0, cr]} c="#3a2a1a" cast={false} />)}
        </G>) : null}
      </G> : null}
      {broken > 0.01 ? <G p={[0, (TOP + H1) * stump * (1 - fortK) * k1, 0]}>
        {[[-4.6, -4.6, 3.2], [-1.5, -4.6, 1.4], [1.8, -4.6, 2.4], [4.6, -4.6, 1.0], [4.6, -1.2, 2.8], [4.6, 2.2, 0.8], [4.6, 4.6, 2.0], [1.4, 4.6, 0.6], [-2.0, 4.6, 1.8], [-4.6, 4.6, 1.1], [-4.6, 1.2, 2.5], [-4.6, -1.8, 0.7]].map(([x, z, h], i) =>
          <Box key={i} s={[x === 4.6 || x === -4.6 ? 0.8 : 2.6, h * broken, z === 4.6 || z === -4.6 ? 0.8 : 2.6]} p={[x, (h * broken) / 2, z]} r={[0, 0, (rnd(i + 21) - 0.5) * 0.25]} c={i % 2 ? STONE : STONE2} />)}
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
      <Puffs t={t} p={[0, TOP + 4, 0]} n={6} period={1.4} rise={9} size={0.8} c="#f7f2e8" on={ease(t, T.peor, T.ruinas) * (1 - ease(t, T.piedras, T.fortaleza))} drift={[2.4, 0, 1.6]} />
    </G>
  );
};
/** rampa em espiral LISA por dentro do piso 1 (uma faixa contínua com mureta, não placas soltas: a v2 lia como escada),
 *  com dois cavaleiros lado a lado subindo, cada um com um feixe de lenha na garupa */
export const R_IN = 1.0, R_OUT = 4.1, PITCH = 3.9, TH0 = -PI / 2;
const TURNS = 3.8, SEGS = 190;
export const rampH = (th: number) => 0.3 + ((th - TH0) * PITCH) / (PI * 2);
export const RIDE0 = T.rampa + 1.3, OMEGA = (PI * 2) / 4.1; // ~76,5 s: entram na base; uma volta a cada 4,1 s
export const rideTh = (t: number) => TH0 + 0.15 + OMEGA * Math.max(0, t - RIDE0);
const helix = (strips: [number, number, number, number][]) => {
  const pos: number[] = [], idx: number[] = [], n = SEGS + 1;
  strips.forEach(([r1, d1, r2, d2]) => { for (let i = 0; i < n; i++) { const th = TH0 + (i / SEGS) * TURNS * PI * 2, h = rampH(th);
    pos.push(r1 * Math.cos(th), h + d1, -r1 * Math.sin(th), r2 * Math.cos(th), h + d2, -r2 * Math.sin(th)); } });
  for (let i = 0; i < SEGS; i++) strips.forEach((_, s) => { const a = s * n * 2 + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); });
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return { g, per: strips.length * 6 };
};
const Ramp: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const body = useMemo(() => helix([[R_IN, 0, R_OUT, 0], [R_OUT, -0.4, R_IN, -0.4], [R_OUT, 0, R_OUT, -0.4], [R_IN, -0.4, R_IN, 0]]), []);
  const wall = useMemo(() => helix([[R_OUT, 0.65, R_OUT, 0], [R_OUT - 0.2, 0, R_OUT - 0.2, 0.65], [R_OUT - 0.2, 0.65, R_OUT, 0.65]]), []);
  if (on < 0.5) return null;
  const grow = ease(t, T.dentro - 0.2, T.rampa + 1.2), segs = Math.floor(grow * SEGS);
  body.g.setDrawRange(0, segs * body.per); wall.g.setDrawRange(0, segs * wall.per);
  const rk = ease(t, RIDE0 - 0.1, RIDE0 + 0.35);
  return (
    <G p={[0, TOP, 0]}>
      <Cyl rt={R_IN - 0.2} h={H1} p={[0, H1 / 2, 0]} c="#9c8f74" seg={18} />
      <Box s={[8.6, 0.2, 8.6]} p={[0, 0.1, 0]} c="#cbbd9c" />
      {segs > 0 ? <><mesh geometry={body.g} material={mat("#f3e6c8")} castShadow receiveShadow /><mesh geometry={wall.g} material={mat("#c4ad84")} castShadow receiveShadow /></> : null}
      {rk > 0.01 ? [2.15, 3.4].map((r, j) => { const th = rideTh(t), bob = Math.abs(Math.sin((t + j * 0.4) * 11)) * 0.14;
        return <G key={j} p={[r * Math.cos(th), rampH(th), -r * Math.sin(th)]} r={[0, th + PI / 2, Math.atan(PITCH / (PI * 2 * r))]} sc={rk}>
          <Horse p={[0, 0, 0]} yaw={0} t={t + j * 0.4} c={j ? "#6b3e22" : "#c9a06a"} rider={j ? "#2f6fb0" : "#c8553d"} speed={11} />
          <G p={[-0.85, 1.8 + bob, 0]}>
            {[[0.13, 0], [-0.13, 0], [0, 0.2]].map(([x, y], k) => <Cyl key={k} rt={0.13} h={0.95} p={[x, y, 0]} r={[PI / 2, 0, 0]} c="#7a5a2a" seg={8} />)}
            <Box s={[0.09, 0.42, 0.99]} p={[0, 0.08, 0]} c="#3a2a1a" cast={false} />
          </G>
        </G>; }) : null}
    </G>
  );
};
/** pegadas dos três pisos no chão da ilha (o plano de cima do corte 4): quadrado > octógono > círculo, «cada uno más estrecho» */
const Footprints: React.FC<{ t: number }> = ({ t }) => {
  if (built(t) || t < T.tres || t > T.pisosT + 1) return null;
  const rings: [number, number, number, number, number, number][] = [ // interno, externo, lados, ângulo inicial, quando aparece, piso que cobre
    [6.36, 7.07, 4, PI / 4, T.estrecho - 0.45, tierK(t, T.abajo)], [3.45, 4.0, 8, 0, T.estrecho - 0.15, tierK(t, T.medio)], [1.95, 2.45, 32, 0, T.estrecho + 0.15, tierK(t, T.arriba)]];
  return <G p={[TW.x, TOP + 0.05, TW.z]}>{rings.map(([a, b, s, th, t0, done], i) => { const k = ease(t, t0, t0 + 0.35) * (1 - ease(done, 0.55, 0.95)); if (k <= 0.01) return null;
    return <mesh key={i} rotation={[-PI / 2, 0, 0]} scale={[k, k, 1]} material={mat("#3fd0ff", { emissive: "#1aa0ff", ei: 0.8 })}><ringGeometry args={[a, b, s, 1, th]} /></mesh>; })}</G>;
};
/** «que el viento rodea en vez de golpear de frente»: faixas de vento que se dividem em volta do tambor redondo, até o corte 5 */
const R_D = 2.75;
const zFlow = (c: number, x: number) => Math.sign(c) * Math.sqrt(c * c + R_D * R_D * Math.exp(-((x / (1.25 * R_D)) ** 2)));
const LANES = [-4.2, -3.0, -1.9, -0.9, 0.9, 1.9, 3.0, 4.2];
/** fita fina no plano horizontal seguindo uma linha de vento (o caminho inteiro fica desenhado, fraco) */
const flowRibbon = (c: number) => {
  const pos: number[] = [], idx: number[] = [], N = 48, w = 0.13;
  for (let i = 0; i <= N; i++) { const x = lerp(-13, 13, i / N), z = zFlow(c, x), dz = (zFlow(c, x + 0.05) - zFlow(c, x - 0.05)) / 0.1, l = Math.hypot(1, dz);
    pos.push(x + (dz / l) * w, 0, z - (1 / l) * w, x - (dz / l) * w, 0, z + (1 / l) * w); }
  for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
};
const WindAround: React.FC<{ t: number }> = ({ t }) => {
  const ribbons = useMemo(() => LANES.map(flowRibbon), []);
  const k = ease(t, T.rodea - 0.4, T.rodea) * (t < CUTS[4] ? 1 : 0); if (k <= 0.01) return null;
  const y = TOP + H1 + H2 + H3 / 2 - 0.4;
  return <G p={[TW.x, y, TW.z]}>
    {ribbons.map((g, i) => <mesh key={i} geometry={g} material={mat("#ffffff", { emissive: "#ffffff", ei: 0.6, opacity: 0.4 * k, depthWrite: false, side: "double" })} />)}
    {LANES.flatMap((c, i) => [0, 1].map((j) => {
      const u = fract(t * 0.6 + j / 2 + rnd(i * 7) * 0.5), x = lerp(-13, 13, u), z = zFlow(c, x), dz = (zFlow(c, x + 0.05) - zFlow(c, x - 0.05)) / 0.1;
      const f = Math.min(1, u * 6, (1 - u) * 6) * k;
      return <Box key={`${i}-${j}`} s={[3.2 * f + 0.01, 0.2, 0.3]} p={[x, 0.05, z]} r={[0, Math.atan2(-dz, 1), 0]} c="#ffffff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.9, opacity: 0.95, depthWrite: false }} />;
    }))}
  </G>;
};
/** o guincho: viga no alto, roldana, corda até o obreiro; o feixe de lenha sobe aos puxões (6 puxadas) os ~100 m */
const HZ = 6.4, HTOP = TOP + H1 + H2 + H3;
export const hoistFrac = (t: number) => { const u = prog(t, HOIST[0], HOIST[1]), K = 6, k = Math.min(K - 1e-6, u * K), f = Math.floor(k); return (f + sstep(Math.min(1, (k - f) * 1.6))) / K; };
const Hoist: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p5 - 0.2 && t < CUTS[5])) return null;
  const y = lerp(1.0, HTOP - 2.2, hoistFrac(t)), sw = 0.1 * Math.sin(t * 3.1) * (y > 1.2 ? 1 : 0);
  return (
    <G p={[TW.x, 0, TW.z]}>
      <Box s={[0.4, 0.4, 5.9]} p={[0, HTOP + 0.25, 1.0 + 5.9 / 2]} c="#7a5a32" />
      <Cyl rt={0.45} h={0.3} p={[0, HTOP - 0.15, HZ]} r={[0, 0, PI / 2]} c="#5a3a1a" seg={12} />
      <Cyl rt={0.05} h={HTOP - 0.6 - (y + 0.75)} p={[0, (HTOP - 0.6 + y + 0.75) / 2, HZ]} c="#d8c49a" seg={5} cast={false} />
      <Pipe a={[0, HTOP - 0.6, HZ + 0.3]} b={[0.6, 2.2, 11.3]} rad={0.05} c="#d8c49a" seg={5} cast={false} />
      <G p={[0, y, HZ]} r={[sw, 0, 0.5 * sw]}>
        {[[0, 0, -0.27], [0, 0, 0.27], [0, 0.44, 0]].map(([a, b, c], k) => <Cyl key={k} rt={0.28} h={1.7} p={[a, b, c]} r={[0, 0, PI / 2]} c="#7a5a2a" seg={8} />)}
        <Box s={[0.12, 0.95, 1.05]} p={[0.45, 0.2, 0]} c="#3a2a1a" cast={false} /><Box s={[0.12, 0.95, 1.05]} p={[-0.45, 0.2, 0]} c="#3a2a1a" cast={false} />
      </G>
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
      <Sph rad={1.8} p={[0, 9.0, 0]} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffd34a", ei: 1, opacity: 0.35, depthWrite: false }} ws={10} hs={8} />
      {/* facho girando: o final não fica parado (crítico da v2: ~7 s quase sem movimento) */}
      <G p={[0, 9.0, 0]} r={[0, t * 1.8 + i * 1.3, 0]}><Cone rad={1.6} h={14} seg={10} p={[7.4, 0, 0]} r={[0, 0, PI / 2]} c="#fff4b0" cast={false} recv={false} o={{ emissive: "#ffe680", ei: 1.3, opacity: 0.5, depthWrite: false }} /></G></G>; })}</G>
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
  if (!(t > T.p5 - 0.2 && t < CUTS[5])) return null;
  return <G>{[0, 1, 2].map((i) => <G key={i} p={[TW.x - 3 + i * 1.6, TOP, TW.z + 6.4 + (i % 2) * 0.6]}><Cyl rt={0.35} h={1.4} p={[0, 0.7, 0]} r={[PI / 2, 0, 0.2 * i]} c="#7a5a2a" seg={8} /><Cyl rt={0.36} h={0.12} p={[0, 0.7, 0.4]} r={[PI / 2, 0, 0]} c="#c9a24a" seg={8} /></G>)}</G>;
};
/** o facho: do fogo até o mar (~50 m adiante), girando; uma mancha de luz corre na água (pré-crítica: 62–67 s parado) */
const BEAM_D = 50, BEAM_Y = TOP + H1 + H2 + H3 + 1.2, BEAM_TILT = Math.atan(BEAM_Y / BEAM_D), BEAM_L = Math.hypot(BEAM_D, BEAM_Y);
const Beam: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.round(10 * fireK(t) * night(t)) / 10; if (k <= 0.01 || built(t)) return null;
  const ph = beamPhi(t);
  return <G>
    <G p={[TW.x, BEAM_Y, TW.z]} r={[0, ph, -BEAM_TILT]}>
      <Cone rad={8} h={BEAM_L} seg={20} p={[BEAM_L / 2, 0, 0]} r={[0, 0, PI / 2]} c="#fff4b0" cast={false} recv={false} o={{ emissive: "#ffe680", ei: 1.2, opacity: 0.26 * k, depthWrite: false }} />
    </G>
    <mesh position={[TW.x + BEAM_D * Math.cos(ph), 0.08, TW.z - BEAM_D * Math.sin(ph)]} rotation={[-PI / 2, 0, ph]} material={mat("#fff2b0", { emissive: "#ffe680", ei: 1, opacity: 0.45 * k, depthWrite: false })}><circleGeometry args={[8, 28]} /></mesh>
  </G>;
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
    <Land /><City /><Rocks t={t} /><Ships t={t} /><Dike t={t} /><Haze t={t} /><Waypoint t={t} />
    <Tower t={t} /><Beam t={t} /><Ping t={t} /><Footprints t={t} /><Fort t={t} /><Modern t={t} /><Building t={t} /><Fuel t={t} /><Hoist t={t} /><Gulls t={t} /><Wind t={t} /><WindAround t={t} />
  </>
);
