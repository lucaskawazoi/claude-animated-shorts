// Mundo do MEP5 (Mundo em Peças): Itaipu de brinquedo. Tudo é função do tempo t (sem estado).
// Eixo x = rio (corre para +x). Vale entre o planalto da esquerda (z < LZ) e o da direita (z > RZ), fundo do vale y=0.
// Rio em z∈[-8,8]; morro de rocha (x∈[-40,40], z∈[8,22]) cortado pelo canal de desvio (z∈[12,18]).
// Barragem em x∈[-2,2] de LZ a RZ: principal (LZ..22), vertedouro (22..32), lateral (32..RZ). Lago a montante (x<-2).
import React, { useMemo } from "react";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, rnd, sstep } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const H = 12, LZ = -14, RZ = 40;
const CONC = "#abb3b1", CONC2 = "#959d9b", ROCK = "#9d7c52", ROCK2 = "#8a6a44", WATER = "#2f8fd2", WATER2 = "#3a97d6";
const GROUND: GroundPal = { base: "#7cc94a", patch: ["#6fbe40", "#8ad457", "#74c246"], blade: "#4fa82e", flowers: ["#ffe14a", "#ffffff", "#ff8fb1"], x: [-90, 100], z: [-60, 70], nBlades: 420 };

/** o vídeo abre na usina pronta (gancho) e corta para o rio virgem no 1º corte */
export const built = (t: number) => t < T.mas - 0.1;
const st = (t: number) => {
  const B = built(t);
  const dam = B ? 1 : clamp(ease(t, T.leito, T.essaBarragem) - 0.65 * ease(t, T.volta, T.volta + 0.8) + 0.65 * ease(t, T.gela + 0.3, T.semTrincar));
  return {
    B, dam,
    dig: B ? 1 : ease(t, T.cava, T.desvia + 0.4),
    divert: B ? 1 : ease(t, T.desvia, T.esseCanal),
    heat: B ? 0 : ease(t, T.esquenta, T.racha) * (1 - ease(t, T.volta, T.volta + 0.5)),
    crack: B ? 0 : ease(t, T.racha, T.racha + 0.5) * (1 - ease(t, T.volta, T.volta + 0.6)),
    ice: B ? 0 : ease(t, T.gela - 0.4, T.gela + 0.2) * (1 - ease(t, T.p3 - 0.5, T.p3)),
    lake: B ? H - 2 : lerp(0, H - 2, ease(t, T.p3 - 0.4, T.lampada)) + 1.5 * ease(t, T.ameaca - 0.6, T.escorregador) - 1.5 * ease(t, T.vertedouro, T.quarenta + 0.5),
    pipes: B ? 1 : ease(t, T.tubos, T.despenca),
    pipeFlow: B ? 1 : ease(t, T.despenca, T.gira),
    spinV: B ? 1 : ease(t, T.gira - 0.3, T.gira + 0.6),
    lights: B ? 1 : ease(t, T.gerador, T.casaForca),
    house: B ? 1 : ease(t, T.tubos - 0.4, T.tubos + 0.4),
    storm: B ? 0 : ease(t, T.p4 - 0.3, T.p4 + 0.6) * (1 - ease(t, T.vertedouro, T.quarenta + 0.8)),
    spill: B ? 1 : ease(t, T.escorregador, T.vertedouro),
    spillFlow: B ? 1 : ease(t, T.vertedouro - 0.1, T.vertedouro + 0.5),
    bump: B ? 0 : ease(t, T.p5 - 0.3, T.p5 + 0.3) * (1 - ease(t, T.soPraEles, T.soPraEles + 0.6)),
    ladder: B ? 1 : ease(t, T.soPraEles, T.piracema),
    fishUp: B ? 1 : ease(t, T.piracema - 0.8, T.piracema),
  };
};

// ---------------------------------------------------------------- água que corre: faixa azul com traços que andam (eixo x)
const Flow: React.FC<{ x0: number; x1: number; z: number; y: number; w: number; t: number; on?: number; speed?: number; c?: string }> = ({ x0, x1, z, y, w, t, on = 1, speed = 2.4, c = WATER2 }) => {
  if (on <= 0.01) return null;
  const L = x1 - x0, n = Math.max(3, Math.floor((L * w) / 6));
  return (
    <G p={[x0, y, z]}>
      <Box s={[L, 0.1, w]} p={[L / 2, 0, 0]} c={c} cast={false} o={{ rough: 0.25 }} sc={[1, 1, Math.max(0.01, on)]} />
      {Array.from({ length: n }, (_, i) => { const u = fract(rnd(i) + (t * speed) / L); return <Box key={i} s={[1.2, 0.04, 0.12]} p={[u * L, 0.07, (rnd(i + 9) - 0.5) * w * 0.8 * on]} c="#eaf7ff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.35 }} />; })}
    </G>
  );
};

// ---------------------------------------------------------------- relevo
const Plateau: React.FC<{ z0: number; z1: number }> = ({ z0, z1 }) => (
  <G>
    <Box s={[260, H, z1 - z0]} p={[0, H / 2, (z0 + z1) / 2]} c={ROCK} cast={false} />
    <Box s={[260, 0.3, z1 - z0]} p={[0, H + 0.15, (z0 + z1) / 2]} c="#7cc94a" cast={false} />
  </G>
);
/** morro de rocha com o canal de desvio sendo cavado (o corte desce do topo até o fundo) */
const Hill: React.FC<{ dig: number }> = ({ dig }) => {
  const HH = 9, cut = HH * (1 - dig);
  const slab = (x0: number, x1: number, z0: number, z1: number, h: number, c = ROCK2, top = "#86cf52") => h <= 0.02 ? null : (
    <G><Box s={[x1 - x0, h, z1 - z0]} p={[(x0 + x1) / 2, h / 2, (z0 + z1) / 2]} c={c} /><Box s={[x1 - x0, 0.25, z1 - z0]} p={[(x0 + x1) / 2, h + 0.12, (z0 + z1) / 2]} c={top} cast={false} /></G>);
  return (
    <G>
      {slab(-34, 34, 8, 12, 3.5)}{slab(-40, 40, 18, 22, HH)}
      {/* faixa do canal + as duas bocas (ligam o canal ao rio) */}
      {slab(-40, 40, 12, 18, cut, "#7a5530", dig > 0.05 ? "#b08a5a" : "#86cf52")}
      {slab(-40, -34, 8, 12, cut, "#7a5530", dig > 0.05 ? "#b08a5a" : "#86cf52")}{slab(34, 40, 8, 12, cut, "#7a5530", dig > 0.05 ? "#b08a5a" : "#86cf52")}
    </G>
  );
};

// ---------------------------------------------------------------- barragem em blocos de lego (sobem em degraus)
const NB = 27; // blocos de 2 m em z, de LZ a RZ
const zOf = (i: number) => LZ + 1 + i * 2;
const isSpill = (z: number) => z > 22 && z < 32;
const Dam: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => {
  const heatC = s.heat > 0.02 ? "#e0866a" : CONC;
  return (
    <G>
      {Array.from({ length: NB }, (_, i) => {
        const z = zOf(i), h = H * sstep(clamp(s.dam * 1.3 - 0.3 * rnd(i * 3))) * (isSpill(z) ? lerp(1, 0.84, s.spill) : 1);
        if (h < 0.05) return null;
        const cool = s.ice > 0.05 && s.dam < 0.999;
        return (
          <G key={i}>
            <Box s={[3.2, h, 1.92]} p={[-0.4, h / 2, z]} c={cool ? "#b8d4e6" : s.heat > 0.02 ? (i % 2 ? heatC : "#d97a5e") : i % 2 ? CONC : CONC2} o={s.heat > 0.02 ? { emissive: "#ff3a10", ei: 0.55 * s.heat } : {}} />
            {/* contraforte (a barragem de Itaipu é oca, apoiada em contrafortes) */}
            {!isSpill(z) ? <Box s={[3.4, h * 0.9, 0.7]} p={[2.3, h * 0.45, z]} r={[0, 0, 0.28]} c={CONC2} /> : null}
          </G>
        );
      })}
      {/* passarela no topo quando pronta */}
      <Box s={[3.4, 0.4, RZ - LZ]} p={[-0.4, H + 0.2, (LZ + RZ) / 2]} c="#d8dcdb" vis={s.dam > 0.995} />
      {/* rachaduras: zigue-zague escuro na face de jusante */}
      <G vis={s.crack > 0.02}>
        {[-6, 2, 10, 17].map((z0, k) => Array.from({ length: 6 }, (_, j) => <Box key={k * 9 + j} s={[0.16, 1.9 * s.crack, 0.34]} p={[1.3, H * 0.2 + j * 1.5, z0 + (j % 2 ? 0.5 : -0.5)]} r={[(j % 2 ? 0.5 : -0.5), 0, 0]} c="#140a06" cast={false} />))}
      </G>
      <Puffs t={t} p={[1.5, H * 0.6, 4]} n={8} period={1.6} rise={5} size={1.0} c="#f2f2f2" on={s.heat} drift={[2, 0, 0]} />
      <Puffs t={t} p={[1.5, H * 0.6, 14]} n={8} period={1.8} rise={5} size={0.9} c="#f2f2f2" on={s.heat} drift={[2, 0, 1]} o={0.4} />
    </G>
  );
};

// ---------------------------------------------------------------- vertedouro: comportas + rampa + espuma
const Spillway: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => {
  if (s.spill <= 0.01) return null;
  const L = 30, ang = Math.atan2(H * 0.82, L), len = Math.hypot(L, H * 0.82) * s.spill;
  return (
    <G>
      <G p={[1.2, H * 0.82, 27]} r={[0, 0, -ang]}><Box s={[len, 0.5, 9.4]} p={[len / 2, -0.25, 0]} c={CONC} />
        <Box s={[len, 1.2, 0.4]} p={[len / 2, 0.4, -4.8]} c={CONC2} /><Box s={[len, 1.2, 0.4]} p={[len / 2, 0.4, 4.8]} c={CONC2} />
        {/* água branca descendo */}
        {s.spillFlow > 0.01 ? Array.from({ length: 40 }, (_, i) => { const u = fract(t * 0.9 + rnd(i)); return <Box key={i} s={[2.2, 0.25, 1.6]} p={[u * len, 0.25, (rnd(i + 5) - 0.5) * 8]} c={i % 3 ? "#e8f6ff" : "#7cc8ff"} cast={false} o={{ emissive: "#ffffff", ei: 0.35 }} sc={[1, 1, s.spillFlow]} />; }) : null}
      </G>
      {/* comportas laranja no topo */}
      {Array.from({ length: 4 }, (_, k) => <Box key={k} s={[0.6, 2.2 - 1.6 * s.spillFlow, 1.9]} p={[-1.8, H * 0.84 + 1.1 + 1.2 * s.spillFlow, 23.4 + k * 2.4]} c="#ff8a1a" />)}
      {/* poço de dissipação e o jato */}
      <Box s={[10, 0.4, 10]} p={[34, 0.2, 27]} c={WATER} cast={false} vis={s.spill > 0.95} />
      <Puffs t={t} p={[31, 0.6, 27]} n={16} period={1.0} rise={3.5 * s.spillFlow} size={0.9 * s.spillFlow} c="#ffffff" on={s.spillFlow} drift={[4, 0, 0]} />
      <Flow x0={36} x1={60} z={20} y={0.2} w={7} t={t} on={s.spillFlow} speed={4} />
    </G>
  );
};

// ---------------------------------------------------------------- tubulações na face de jusante, casa de força em corte, turbina
const NP = 7;
const Powerhouse: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => {
  if (s.house <= 0.01) return null;
  const rot = s.B ? t * 6 : Math.max(0, t - T.gira + 0.3) * 6 * s.spinV;
  return (
    <G>
      {/* tubos gigantes descendo pela face (marca de Itaipu) */}
      {Array.from({ length: NP }, (_, k) => {
        const z = -6 + k * 2, a: V3 = [1.6, H - 1.5, z], len = Math.hypot(5.5, H - 4.5) * s.pipes, ang = Math.atan2(H - 4.5, 5.5);
        return (
          <G key={k} p={a} r={[0, 0, -ang]}>
            <Cyl rt={0.62} h={len} p={[len / 2, 0, 0]} r={[0, 0, PI / 2]} c="#c9cfcd" seg={10} />
            {s.pipeFlow > 0.01 ? Array.from({ length: 4 }, (_, j) => { const u = fract(t * 1.6 + j / 4 + k * 0.13); return <Sph key={j} rad={0.4} p={[u * len, 0.62, 0]} c="#7cc8ff" cast={false} o={{ emissive: "#3aa0ff", ei: 0.5 }} sc={s.pipeFlow} ws={8} hs={6} />; }) : null}
          </G>
        );
      })}
      {/* prédio da casa de força, aberto em corte na frente (z>0) */}
      <G sc={[1, Math.max(0.01, s.house), 1]}>
        <Box s={[6.4, 5, 15]} p={[9.6, 2.5, -1]} c="#e9ecea" />
        <Box s={[6.6, 0.5, 15.2]} p={[9.6, 5.2, -1]} c="#ff8a1a" />
        {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[0.1, 1.2, 1.4]} p={[12.85, 3.2, -6.5 + k * 2.2]} c={s.lights > 0.5 ? "#ffe680" : "#5b6670"} o={s.lights > 0.5 ? { emissive: "#ffcf3a", ei: 0.8 * s.lights } : {}} cast={false} />)}
      </G>
      {/* turbina e gerador numa caixa de vidro no pé da casa de força */}
      <G p={[15.6, 0, 0]} vis={s.house > 0.9}>
        <Box s={[4.6, 6.4, 5.2]} p={[0, 3.2, 0]} c="#bfe6ff" o={{ opacity: 0.22 }} cast={false} /><Box s={[4.8, 0.4, 5.4]} p={[0, 6.6, 0]} c="#ff8a1a" />
        <G p={[0, 1.5, 0]} r={[0, rot, 0]}>
          <Cyl rt={1.6} h={0.5} c="#ffd400" seg={14} />
          {Array.from({ length: 8 }, (_, k) => <Box key={k} s={[1.7, 0.7, 0.18]} p={[Math.cos((k / 8) * PI * 2) * 1.2, 0.1, Math.sin((k / 8) * PI * 2) * 1.2]} r={[0.5, -(k / 8) * PI * 2, 0]} c="#e0b400" />)}
        </G>
        <Cyl rt={0.25} h={2.6} p={[0, 3.0, 0]} c="#5b6670" seg={8} />
        <G p={[0, 4.6, 0]} r={[0, rot * 0.5, 0]}><Cyl rt={1.5} h={1.6} c="#e0262b" seg={14} /><Box s={[0.3, 1.7, 3.2]} c="#a81c20" /></G>
        {/* faíscas de energia saindo do gerador */}
        {s.lights > 0.05 ? Array.from({ length: 6 }, (_, k) => { const u = fract(t * 2 + k / 6); return <Box key={k} s={[0.5, 0.12, 0.12]} p={[Math.cos(k) * (1.8 + u * 2), 4.8 + u * 2.4, Math.sin(k) * (1.8 + u * 2)]} r={[0, k, 0.8]} c="#fff27a" o={{ emissive: "#ffe000", ei: 1.2 }} cast={false} sc={1 - u} />; }) : null}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- linhas de transmissão até a cidade (planalto da esquerda)
const TOWERS: V3[] = [[16, H, -20], [30, H, -24], [44, H, -28], [58, H, -32]];
const Grid: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => (
  <G vis={s.house > 0.9}>
    {TOWERS.map((p, i) => (
      <G key={i} p={p}>
        <Cone rad={1.4} h={8} seg={4} p={[0, 4, 0]} c="#6b7680" o={{ flat: true }} />
        <Box s={[4.4, 0.25, 0.25]} p={[0, 6.8, 0]} c="#6b7680" />
      </G>
    ))}
    {TOWERS.slice(0, -1).map((p, i) => { const q = TOWERS[i + 1], dx = q[0] - p[0], dz = q[2] - p[2], L = Math.hypot(dx, dz);
      return <G key={i} p={[(p[0] + q[0]) / 2, H + 6.6, (p[2] + q[2]) / 2]} r={[0, -Math.atan2(dz, dx), 0]}>
        <Box s={[L, 0.08, 0.08]} p={[0, 0, 1.9]} c={s.lights > 0.5 ? "#fff27a" : "#333"} o={s.lights > 0.5 ? { emissive: "#ffd000", ei: 0.9 * s.lights } : {}} cast={false} />
        <Box s={[L, 0.08, 0.08]} p={[0, 0, -1.9]} c={s.lights > 0.5 ? "#fff27a" : "#333"} o={s.lights > 0.5 ? { emissive: "#ffd000", ei: 0.9 * s.lights } : {}} cast={false} />
        {s.lights > 0.05 ? <Sph rad={0.35} p={[lerp(-L / 2, L / 2, fract(t * 0.8 + i * 0.3)), 0, 0]} c="#fff27a" o={{ emissive: "#ffe000", ei: 1.4 }} cast={false} ws={8} hs={6} /> : null}
      </G>; })}
  </G>
);
const City: React.FC<{ s: ReturnType<typeof st> }> = ({ s }) => {
  const houses = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ p: [64 + (i % 5) * 5 + rnd(i) * 1.5, H, -44 + Math.floor(i / 5) * 6 + rnd(i + 3)] as V3, w: 2.8 + rnd(i + 5) * 1.4, h: 2.4 + rnd(i + 8) * 3 })), []);
  return (
    <G>
      {houses.map((q, i) => (
        <G key={i} p={q.p}>
          <Box s={[q.w, q.h, 3]} p={[0, q.h / 2, 0]} c={["#f1e6d0", "#ffd9a8", "#cfe6ff", "#ffc2c2"][i % 4]} />
          <Cone rad={Math.max(q.w, 3) * 0.75} h={1.2} seg={4} p={[0, q.h + 0.6, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.75]} c="#c4553a" />
          <Box s={[0.8, 0.8, 0.1]} p={[0, q.h * 0.55, 1.52]} c={s.lights > rnd(i) ? "#ffe680" : "#3b4a5a"} o={s.lights > rnd(i) ? { emissive: "#ffcf3a", ei: 1.0 } : {}} cast={false} />
        </G>
      ))}
    </G>
  );
};

// ---------------------------------------------------------------- frio: fábrica de gelo + betoneira; teleférico de concreto
const IceWorks: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => (
  <G p={[-10, H, -24]} vis={s.ice > 0.01}>
    <Box s={[6, 4, 5]} p={[0, 2, 0]} c="#f4fbff" sc={[1, Math.max(0.01, s.ice), 1]} /><Box s={[6.4, 0.6, 5.4]} p={[0, 4.2 * s.ice, 0]} c="#4ab8ff" />
    <Box s={[1.4, 1.4, 0.1]} p={[0, 2.4, 2.55]} c="#4ab8ff" o={{ emissive: "#4ab8ff", ei: 0.5 }} cast={false} />
    {/* esteira de gelo até a betoneira */}
    <Box s={[8, 0.3, 1.4]} p={[6.5, 1.0, 3.5]} r={[0, -0.5, 0]} c="#5b6670" />
    {Array.from({ length: 7 }, (_, i) => { const u = fract(t * 0.7 + i / 7); return <Sph key={i} rad={0.45} p={[3 + u * 7, 1.55, 1.8 + u * 3.6]} r={[u * 3, u * 2, 0]} c={u > 0.5 ? "#a9c8dc" : "#9a9f9c"} o={{ flat: true }} ws={6} hs={4} cast={false} />; })}
    <G p={[11, 2.4, 6.5]} r={[0, 0, 0.5]}><G r={[t * 3, 0, 0]}><Cyl rt={1.2} rb={1.6} h={3.4} r={[0, 0, PI / 2]} c="#ff8a1a" seg={10} /><Box s={[3.2, 0.25, 0.25]} p={[0, 1.45, 0]} c="#e05a00" /></G></G>
    <Puffs t={t} p={[11, 3.5, 6.5]} n={6} period={2.2} rise={3} size={0.6} c="#e8f6ff" />
  </G>
);
const Cableway: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => {
  const on = s.B ? 0 : ease(t, T.leito - 0.5, T.leito) * (1 - ease(t, T.p3 - 0.6, T.p3));
  if (on <= 0.01) return null;
  const z = lerp(LZ + 2, 30, 0.5 + 0.5 * Math.sin(t * 0.9)), y = H + 9 - 3 * Math.abs(Math.sin(t * 1.8));
  return (
    <G>
      <Box s={[0.8, 12, 0.8]} p={[0, H + 6, LZ - 4]} c="#ff8a1a" /><Box s={[0.8, 12, 0.8]} p={[0, H + 6, RZ + 4]} c="#ff8a1a" />
      <Box s={[0.08, 0.08, RZ - LZ + 8]} p={[0, H + 11.8, (LZ + RZ) / 2]} c="#333" cast={false} />
      <Box s={[0.05, H + 11.8 - y, 0.05]} p={[0, (H + 11.8 + y) / 2, z]} c="#333" cast={false} />
      <Cyl rt={0.9} rb={0.6} h={1.3} p={[0, y, z]} c={s.ice > 0.3 ? "#9fd3f0" : "#5b6670"} seg={10} />
    </G>
  );
};

// ---------------------------------------------------------------- chuva, peixes e o Canal da Piracema
const Storm: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on <= 0.01) return null;
  return (
    <G>
      {Array.from({ length: 9 }, (_, i) => <G key={i} p={[-40 + i * 7 + Math.sin(t * 0.5 + i) * 2, 28 + rnd(i) * 4, -6 + rnd(i + 2) * 30]} sc={on}><Sph rad={5} c="#6b7680" cast={false} /><Sph rad={4} p={[5, -1, 0]} c="#5b6670" cast={false} /></G>)}
      {Array.from({ length: 90 }, (_, i) => { const u = fract(t * 1.8 + rnd(i)); return <Box key={i} s={[0.06, 1.4, 0.06]} p={[-50 + rnd(i + 1) * 70, 26 - u * 24, -10 + rnd(i + 2) * 45]} c="#cfe9ff" cast={false} recv={false} sc={on} />; })}
    </G>
  );
};
const Fish: React.FC<{ p: V3; t: number; ph: number; s?: number }> = ({ p, t, ph, s = 1 }) => (
  <G p={p} r={[0, 0, Math.sin(t * 6 + ph) * 0.4]} sc={s}><Sph rad={0.5} sc={[1.6, 0.8, 0.6]} c="#ff8a3a" ws={10} hs={8} /><Cone rad={0.4} h={0.6} seg={3} p={[-0.9, 0, 0]} r={[0, 0, PI / 2]} c="#ff6a1a" /><Sph rad={0.08} p={[0.55, 0.12, 0.28]} c="#111" cast={false} ws={6} hs={4} /></G>
);
const NL = 9;
const ladderStep = (k: number): V3 => [24 - k * 3.4, 0.6 + k * ((H - 2.6) / (NL - 1)), -11];
const Piracema: React.FC<{ t: number; s: ReturnType<typeof st> }> = ({ t, s }) => (
  <G>
    {/* peixes batendo no paredão */}
    {s.bump > 0.01 ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 0.9 + i / 6), x = lerp(9, 3.2, Math.min(1, u * 1.4)), y = 1 + 3.5 * Math.sin(Math.min(1, u * 1.4) * PI); return <Fish key={i} p={[x + 10, y, -5 + i * 2]} t={t} ph={i} s={s.bump * 1.4} />; }) : null}
    {/* escada de piscinas subindo pela margem até o lago */}
    {Array.from({ length: NL }, (_, k) => {
      const u = clamp(s.ladder * NL - k); if (u <= 0.01) return null;
      const p = ladderStep(k);
      return (
        <G key={k} p={p}>
          <Box s={[3.4, p[1], 4]} p={[0, -p[1] / 2, 0]} c={CONC2} />
          <Box s={[3.6, 0.6, 4.2]} p={[0, 0.0, 0]} c={CONC} sc={[1, 1, 1]} />
          <Box s={[3.0, 0.2, 3.4]} p={[0, 0.35, 0]} c={WATER2} cast={false} o={{ rough: 0.2 }} sc={[u, 1, 1]} />
        </G>
      );
    })}
    {s.fishUp > 0.01 ? Array.from({ length: 7 }, (_, i) => { const u = fract(t * 0.25 + i / 7), k = u * (NL - 1), a = ladderStep(Math.floor(k)), b = ladderStep(Math.min(NL - 1, Math.floor(k) + 1)), f = fract(k); return <Fish key={i} p={[lerp(a[0], b[0], f), lerp(a[1], b[1], f) + 1.0 + Math.sin(f * PI) * 1.3, -11 + (rnd(i) - 0.5) * 2]} t={t} ph={i} s={0.8 * s.fishUp} />; }) : null}
  </G>
);

// ---------------------------------------------------------------- operários de fundo (canteiro)
const crew = (t: number, x: number, y: number, z: number, n: number, pose: PoseName) => Array.from({ length: n }, (_, i) => ({ p: [x + Math.cos(i * 2.1) * 2.2, y, z + Math.sin(i * 1.7) * 1.0] as V3, yaw: i * 1.3, pose, ph: i * 0.37 }));

// bandeiras de brinquedo na fronteira: Brasil (margem esquerda, z<0) e Paraguai (margem direita)
const Flag: React.FC<{ p: V3; t: number; br: boolean }> = ({ p, t, br }) => (
  <G p={p}>
    <Cyl rt={0.12} h={7} p={[0, 3.5, 0]} c="#e9ecea" seg={6} />
    <G p={[1.9, 6.0, 0]} r={[0, Math.sin(t * 2.4) * 0.12, 0]}>
      {br ? <>
        <Box s={[3.6, 2.4, 0.12]} c="#1e9e46" /><Box s={[1.9, 1.9, 0.14]} r={[0, 0, PI / 4]} sc={[1, 0.62, 1]} c="#ffd400" /><Cyl rt={0.55} h={0.18} r={[PI / 2, 0, 0]} c="#1f3fa8" seg={14} />
      </> : <>
        <Box s={[3.6, 0.8, 0.12]} p={[0, 0.8, 0]} c="#d52b1e" /><Box s={[3.6, 0.8, 0.12]} c="#ffffff" /><Box s={[3.6, 0.8, 0.12]} p={[0, -0.8, 0]} c="#0038a8" />
      </>}
    </G>
  </G>
);

export const World: React.FC<{ t: number }> = ({ t }) => {
  const s = st(t);
  const dryU = s.divert; // trecho entre as ensecadeiras seca
  return (
    <>
      <Sky top={s.storm > 0.3 ? "#5f7da0" : "#2f86e8"} mid={s.storm > 0.3 ? "#8aa2bd" : "#7cc0f7"} low="#e9f5ff" />
      <Ground g={GROUND} />
      <Plateau z0={-80} z1={LZ} /><Plateau z0={RZ} z1={100} />
      <Clouds t={t} n={8} y={34} />
      <Flag p={[-26, H, -18]} t={t} br /><Flag p={[-26, H, 44]} t={t} br={false} />
      <Trees spots={[[-30, H, -22], [-46, H, -30], [-20, H, -40], [8, H, -36], [-60, H, 50], [-30, H, 48], [10, H, 52], [-52, 0, 30], [-70, 0, -2], [80, 0, 30], [-24, 9, 20], [-12, 9, 21]]} />
      {/* leito do rio (areia) e a água */}
      <Box s={[260, 0.06, 16]} p={[0, 0.03, 0]} c="#c9a46a" cast={false} />
      <Flow x0={-130} x1={-14} z={0} y={0.25} w={16} t={t} />
      <Flow x0={-14} x1={14} z={0} y={0.25} w={16} t={t} on={1 - dryU} />
      <Flow x0={14} x1={130} z={0} y={0.25} w={16} t={t} />
      {/* ensecadeiras (montes de terra) que fecham o trecho seco */}
      {[-14, 14].map((x) => <Box key={x} s={[3, 2.6 * dryU, 16]} p={[x, 1.3 * dryU, 0]} c="#8a6a44" vis={dryU > 0.02 && s.dam < 0.999} />)}
      <Hill dig={s.dig} />
      {/* água no canal de desvio */}
      <Flow x0={-40} x1={40} z={15} y={0.3} w={6} t={t} on={s.divert * (1 - (s.lake > 2 ? 1 : 0))} speed={3.2} />
      <Dam t={t} s={s} />
      <Spillway t={t} s={s} />
      {/* o lago (sobe atrás da barragem) */}
      {s.lake > 0.3 ? <G>
        <Box s={[130, s.lake, RZ - LZ]} p={[-67, s.lake / 2, (LZ + RZ) / 2]} c={WATER} o={{ rough: 0.18 }} cast={false} />
        {Array.from({ length: 26 }, (_, i) => { const u = fract(rnd(i) + t * 0.05); return <Box key={i} s={[2.2, 0.05, 0.14]} p={[-120 + u * 115, s.lake + 0.05, LZ + 2 + rnd(i + 4) * (RZ - LZ - 4)]} c="#eaf7ff" cast={false} recv={false} o={{ emissive: "#ffffff", ei: 0.3 }} />; })}
      </G> : null}
      <Powerhouse t={t} s={s} />
      <Grid t={t} s={s} /><City s={s} />
      <IceWorks t={t} s={s} /><Cableway t={t} s={s} />
      <Storm t={t} on={s.storm} />
      <Piracema t={t} s={s} />
      {/* canteiro: equipes cavando e concretando */}
      <Crowd list={crew(t, -20, 9, 20.4, 4, "chisel")} t={t} c={COSTUMES.mep} vis={!s.B && t > T.cava - 0.3 && t < T.esseCanal + 1} scale={1.2} />
      <Crowd list={crew(t, 7, 0, -10.5, 3, "point")} t={t} c={COSTUMES.mep} vis={!s.B && t > T.leito && t < T.p3} scale={1.2} />
      <Puffs t={t} p={[-10, 9, 15]} n={6} period={1.5} rise={3} size={0.8 * (s.dig > 0.02 && s.dig < 0.98 ? 1 : 0)} c="#c9a46a" />
    </>
  );
};
