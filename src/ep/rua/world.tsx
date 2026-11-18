// Mundo do episódio «rua» (Mundo em Peças): por que o buraco da sua rua volta. Uma rua de brinquedo em corte.
// A rua corre ao longo de z (do fundo, z=ZB, até a face do corte, z=FRONT); o corte mostra, em x, calçada | guia | sarjeta |
// pista abaulada | sarjeta | guia | calçada, e por baixo as camadas (asfalto, base, sub-base, terra), a galeria da chuva
// (círculo grande à esquerda) e o cano do esgoto (círculo pequeno à direita, «outro cano»). O buraco fica rente ao corte
// (x=PX), para a base mole aparecer na face. Espessuras exageradas (é brinquedo); o número de verdade vai no painel.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Puffs, Sky } from "../../toy/scenery";
import { SELA, T } from "./cues";
import { OPEN_END, openId } from "./opening";

const PI = Math.PI;
export const FRONT = 8; // face do corte
export const ZB = -88; // fim da rua (muro sobre o córrego)
export const PX = 2.6, PZ = 6.3; // centro do buraco
const HW = 6.8; // meia pista
const CROWN = 0.4; // abaulamento (exagerado)
const TOPE = 0.05; // cota da borda da pista
export const top = (x: number) => (Math.abs(x) <= HW ? TOPE + CROWN * (1 - (x / HW) ** 2) : TOPE);
export const ASF = 0.45, BASE_B = -1.7, SUB_B = -2.9, SUBL_B = -4.3; // espessura do asfalto e fundos das camadas
const ASPH = "#34373c", ASPH2 = "#1d1e21", BASEC = "#9aa0a6", SUBC = "#c2b8a3", SUBLC = "#8a5a2b", SOIL = "#b07b43", CONC = "#c9cdd1", WATER = "#4fb8ff", MUD = "#6b4a2a";
export const GX = -7.4, GY = -7.0, GR = 1.6; // galeria
const EX = 4.6, EY = -6.2, ER = 0.8; // esgoto
export const BX = -8.1, BZ = 1.6; // boca de lobo

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const mixc = (a: string, b: string, u: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], clamp(u))).toString(16).padStart(2, "0")).join(""); };
const hookOn = (t: number) => t < T.camada; // no gancho a rua está pronta (e esburacada)

// ---------------------------------------------------------------- camadas (corte em x, extrudado ao longo de z)
const N = 40;
const slab = (topF: (x: number) => number, botF: (x: number) => number, x0: number, x1: number) => {
  const up: THREE.Vector2[] = [], dn: THREE.Vector2[] = [];
  for (let i = 0; i <= N; i++) { const x = lerp(x0, x1, i / N); up.push(new THREE.Vector2(x, topF(x))); dn.push(new THREE.Vector2(x, botF(x))); }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape([...up, ...dn.reverse()]), { depth: FRONT - ZB, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, ZB); return g;
};
const LAYERS: { g: () => THREE.BufferGeometry; c: string; yb: number }[] = [
  { g: () => slab(() => SUB_B, () => SUBL_B, -9.2, 9.2), c: SUBLC, yb: SUBL_B }, // 0 terra apertada (subleito)
  { g: () => slab(() => BASE_B, () => SUB_B, -8.6, 8.6), c: SUBC, yb: SUB_B }, // 1 sub-base
  { g: () => slab((x) => (Math.abs(x) <= HW ? top(x) - ASF : TOPE - ASF), () => BASE_B, -8.6, 8.6), c: BASEC, yb: BASE_B }, // 2 base de pedra britada
  { g: () => slab((x) => top(x), (x) => top(x) - ASF, -HW, HW), c: ASPH, yb: TOPE - ASF }, // 3 asfalto
];
/** quanto cada camada está montada (0 a 1): inteira no gancho, desmonta de cima para baixo em «camada por camada», remonta na história */
export const layerU = (i: number, t: number) => {
  if (t < T.camada) return 1;
  if (t < T.terra) return 1 - ease(t, T.camada + 0.12 * (3 - i), T.camada + 0.12 * (3 - i) + 0.35);
  const at = [T.terra, T.pedra, T.pedra + 0.45, T.asfalto][i];
  return ease(t, at, at + 0.55);
};
const Layers: React.FC<{ t: number }> = ({ t }) => {
  const geos = useMemo(() => LAYERS.map((l) => l.g()), []);
  const mats = useMemo(() => LAYERS.map((l) => new THREE.MeshStandardMaterial({ color: l.c, roughness: 0.92 })), []);
  return (
    <>
      {LAYERS.map((l, i) => {
        const u = layerU(i, t);
        return u < 0.002 ? null : (
          <group key={i} position={[0, l.yb, 0]} scale={[1, u, 1]}>
            <mesh geometry={geos[i]} material={mats[i]} position={[0, -l.yb, 0]} receiveShadow castShadow />
          </group>
        );
      })}
      {/* pedrinhas da base e da sub-base na face do corte */}
      {Array.from({ length: 46 }, (_, k) => {
        const sub = k % 2 === 0, u = layerU(sub ? 1 : 2, t), x = -8.2 + rnd(k * 3.1) * 16.4, y = sub ? lerp(SUB_B + 0.25, BASE_B - 0.25, rnd(k * 7.7)) : lerp(BASE_B + 0.25, -0.75, rnd(k * 5.3));
        return u < 0.95 ? null : <Sph key={k} rad={0.17 + 0.1 * rnd(k)} p={[x, y, FRONT + 0.04]} sc={[1, 0.75, 0.3]} c={sub ? "#a39882" : "#7f868d"} ws={6} hs={4} cast={false} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- chão, calçada, guia, sarjeta, casas, árvores
const Ground: React.FC<{ t: number }> = ({ t }) => {
  const cu = hookOn(t) ? 1 : t < T.meio ? 1 - ease(t, T.camada, T.camada + 0.4) : ease(t, T.meio, T.meio + 0.45);
  const L = FRONT - ZB, MZ = (FRONT + ZB) / 2;
  return (
    <>
      <Box s={[120, 12, L]} p={[0, SUBL_B - 6, MZ]} c={SOIL} cast={false} />
      {[-1, 1].map((s) => (
        <G key={s}>
          <Box s={[50, 4.75, L]} p={[s * (9.2 + 25), SUBL_B + 2.375, MZ]} c={SOIL} cast={false} />
          <Box s={[50, 0.25, L]} p={[s * (9.2 + 25), 0.57, MZ]} c="#79c64c" cast={false} />
          <Box s={[4.4, 0.18, L]} p={[s * 11.4, 0.6, MZ]} c="#d8d2c4" />
          <Box s={[0.6, 0.62 * cu + 0.001, L]} p={[s * 8.9, 0.31 * cu + TOPE, MZ]} c={CONC} />
          <Box s={[1.25, 0.12 * cu + 0.001, L]} p={[s * 7.95, TOPE + 0.02, MZ]} c="#b5bbc0" cast={false} />
        </G>
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const s = i % 2 ? 1 : -1, z = -78 + Math.floor(i / 2) * 11, c = ["#ffd9a0", "#ffb3a7", "#b8e0ff", "#d6f0b0", "#f6c1e8", "#fff0a0", "#c8d4ff", "#ffcf8a"][i % 8];
        return (
          <G key={i} p={[s * 20, 0.6, z]}>
            <Box s={[6, 4, 6]} p={[0, 2, 0]} c={c} />
            <Cone rad={4.8} h={2.6} seg={4} p={[0, 5.3, 0]} r={[0, PI / 4, 0]} c="#e8892b" o={{ flat: true }} />
            <Box s={[0.1, 1.2, 1.2]} p={[-s * 3.02, 2.4, 1.2]} c="#fff1a0" cast={false} />
            <Box s={[0.1, 2, 1.1]} p={[-s * 3.02, 1, -1.4]} c="#8a5a32" cast={false} />
          </G>
        );
      })}
      {[[-15, 2], [15, -6], [-15, -30], [15, -40], [-15, -62], [15, -70]].map(([x, z], i) => (
        <G key={i} p={[x, 0.6, z]} sc={1.3}><Cyl rt={0.25} h={1.8} p={[0, 0.9, 0]} c="#7a4a2a" seg={6} /><Cone rad={1.6} h={2.6} p={[0, 2.9, 0]} c="#3fae2c" seg={6} o={{ flat: true }} /></G>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- galeria da chuva, esgoto, boca de lobo, saída no córrego (com o bico de pato)
const Drain: React.FC<{ t: number }> = ({ t }) => {
  const hk = hookOn(t) ? 1 : 0;
  const grow = Math.max(hk, ease(t, T.galeria - 0.3, T.galeria + 1.2)), len = Math.max(0.01, (FRONT - ZB) * grow), z0 = FRONT - len;
  const boca = Math.max(hk, pk(t, T.boca, 0.45));
  const fill = ease(t, T.boca + 0.2, T.galeria + 0.4) * (1 - ease(t, T.pato + 2.2, T.pato + 3.2)), down = t > T.boca && t < T.pato + 2.5;
  return (
    <>
      <G p={[GX, GY, 0]} vis={grow > 0.01}>
        <Cyl rt={GR} h={len} r={[PI / 2, 0, 0]} p={[0, 0, z0 + len / 2]} c="#a9b0b6" seg={24} open o={{ side: "double" }} />
        <Cyl rt={GR + 0.3} h={0.3} r={[PI / 2, 0, 0]} p={[0, 0, FRONT - 0.15]} c={CONC} seg={24} />
        <Cyl rt={GR - 0.02} h={0.02} r={[PI / 2, 0, 0]} p={[0, 0, FRONT + 0.01]} c="#2a2e33" seg={24} cast={false} />
        {fill > 0.01 ? <Box s={[GR * 1.7, GR * 1.1 * fill, len]} p={[0, -GR + GR * 0.55 * fill + 0.08, z0 + len / 2]} c={WATER} o={{ opacity: 0.85 }} cast={false} /> : null}
        {fill > 0.2 ? [0, 1, 2, 3].map((k) => <Cone key={k} rad={0.35} h={0.8} seg={8} r={[-PI / 2, 0, 0]} p={[0, -GR + 0.6, FRONT - 2 - ((t * 9 + k * 6) % 24)]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.4 }} cast={false} />) : null}
      </G>
      <G p={[EX, EY, 0]}>
        <Cyl rt={ER} h={FRONT - ZB} r={[PI / 2, 0, 0]} p={[0, 0, (FRONT + ZB) / 2]} c="#c46a3a" seg={18} />
        <Cyl rt={ER - 0.12} h={0.02} r={[PI / 2, 0, 0]} p={[0, 0, FRONT + 0.01]} c="#3b2616" seg={18} cast={false} />
      </G>
      <G p={[BX, 0, BZ]} sc={[1, Math.max(0.001, boca), 1]}>
        <Box s={[0.12, 0.42, 2.2]} p={[-0.62, 0.32, 0]} c="#16181b" cast={false} />
        {[0, 1, 2, 3, 4].map((k) => <Box key={k} s={[1.1, 0.06, 0.12]} p={[0.15, TOPE + 0.13, -0.8 + k * 0.4]} c="#3a3f45" cast={false} />)}
        <Box s={[1.3, 3.6, 2.4]} p={[0, -2.0, 0]} c="#565c63" o={{ opacity: 0.55, depthWrite: false }} cast={false} />
      </G>
      {boca > 0.5 ? <Cyl rt={0.45} h={GY + GR + 3.6} p={[BX, (-3.6 + GY + GR) / 2, BZ]} c="#9aa3ab" seg={10} o={{ opacity: 0.6, depthWrite: false }} cast={false} /> : null}
      {down ? [0, 1, 2, 3, 4].map((k) => { const u = (t * 2.2 + k * 0.2) % 1; return <Sph key={k} rad={0.28} p={[BX, lerp(-0.2, GY + GR - 0.2, u), BZ]} c={WATER} ws={6} hs={4} cast={false} />; }) : null}
      <Box s={[60, 12, 1.5]} p={[0, -4, ZB - 0.75]} c="#b9bfc4" />
      <Box s={[120, 0.2, 60]} p={[0, -8.3 + 0.5 * ease(t, T.mar - 0.2, T.mar + 0.8), ZB - 31]} c="#3aa0d8" o={{ opacity: 0.9 }} cast={false} />
      <G p={[GX, GY, ZB - 1.5]} r={[-PI / 2, 0, 0]} sc={[1, 1, 0.45]}>
        <Cone rad={GR * 0.95} h={2.4} seg={18} p={[0, 1.2, 0]} c="#1f1f22" o={{ rough: 0.6 }} />
      </G>
    </>
  );
};

// ---------------------------------------------------------------- chuva e água (pista, sarjeta, esquina)
const Rain: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.chuva - 0.4, T.chuva) * (1 - ease(t, T.galeria, T.galeria + 0.8));
  if (on < 0.02) return null;
  return (
    <G>
      {Array.from({ length: 150 }, (_, k) => {
        const x = -14 + rnd(k * 1.7) * 28, z = -30 + rnd(k * 2.9) * 38, y = 18 - ((t * 22 + rnd(k * 4.1) * 18) % 18);
        return <Box key={k} s={[0.05, 0.7, 0.05]} p={[x, y, z]} c="#a8dcff" o={{ opacity: 0.8 * on }} cast={false} />;
      })}
    </G>
  );
};
const Water: React.FC<{ t: number }> = ({ t }) => {
  const film = ease(t, T.chuva, T.chuva + 1) * (1 - ease(t, T.meio + 0.2, T.meio + 1.0));
  const slide = t > T.meio && t < T.alaga;
  const gut = ease(t, T.meio + 0.4, T.enche + 0.6) * (1 - ease(t, T.boca + 0.3, T.boca + 1.4));
  const flood = ease(t, T.enche, T.alaga + 0.5) * (1 - ease(t, T.boca + 0.2, T.boca + 1.6));
  return (
    <G>
      {film > 0.01 ? <Box s={[HW * 2, 0.04, 30]} p={[0, top(0) + 0.04, -7]} c={WATER} o={{ opacity: 0.5 * film, depthWrite: false }} cast={false} /> : null}
      {slide ? [-1, 1].flatMap((s) => [0, 1, 2].map((k) => {
        const u = ((t - T.meio) * 0.9 + k / 3) % 1, x = s * lerp(0.6, HW - 0.4, u);
        return <Cone key={`${s}${k}`} rad={0.35} h={0.9} seg={8} r={[0, 0, -s * PI / 2]} p={[x, top(x) + 0.35, FRONT - 1.2 - k * 5]} c="#ffffff" o={{ emissive: "#9fe4ff", ei: 0.6 }} cast={false} />;
      })) : null}
      {gut > 0.01 ? [-1, 1].map((s) => <Box key={s} s={[1.2, 0.3 * gut, FRONT - ZB]} p={[s * 7.95, TOPE + 0.1 + 0.15 * gut, (FRONT + ZB) / 2]} c={WATER} o={{ opacity: 0.85 }} cast={false} />) : null}
      {flood > 0.01 ? <Box s={[17.6, 0.75 * flood, 34]} p={[0, TOPE + 0.375 * flood, -9]} c={WATER} o={{ opacity: 0.72, depthWrite: false }} cast={false} /> : null}
      {flood > 0.05 && t > T.boca ? <Cyl rt={1.3 * flood} rb={0.2} h={0.6} p={[BX, TOPE + 0.5 * flood, BZ]} c="#ffffff" seg={14} o={{ opacity: 0.6, depthWrite: false }} cast={false} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- trinca, água entrando, base mole, buraco, tapa-buraco, remendo profundo
export const RX = 2.1, RZ0 = PZ - 2.3; // retângulo do remendo profundo (vai até a face do corte)
const Pothole: React.FC<{ t: number }> = ({ t }) => {
  const y0 = top(PX) + 0.02, hook = t < T.camada + 0.2;
  const crack = !hook && t > T.racha ? ease(t, T.racha, T.racha + 0.8) : 0;
  const seep = !hook && ((t > T.trinca && t < T.meio) || (t > T.amolece - 0.4 && t < T.caminhao));
  const mud = hook ? 1 : ease(t, T.trinca + 0.3, T.amolece + 0.6) * (1 - ease(t, T.tira, T.tira + 0.4));
  const holeOpen = hook ? 1 : Math.max(ease(t, T.quebra, T.quebra + 0.3) * (1 - ease(t, T.massa, T.massa + 0.4)), ease(t, T.voltou + 0.3, T.voltou + 0.7) * (1 - ease(t, T.corta, T.corta + 0.2)));
  const sag = !hook && t > T.cede - 0.2 && t < T.quebra + 0.1 ? 0.25 * ease(t, T.cede - 0.2, T.quebra) : 0;
  const massa = !hook ? pk(t, T.massa, 0.5) * (1 - ease(t, T.corta, T.corta + 0.2)) : 0, flat = ease(t, T.pisa, T.pisa + 0.5), sink = ease(t, T.voltou + 0.2, T.voltou + 0.7);
  const cut = !hook ? ease(t, T.corta, T.corta + 0.9) : 0, pit = ease(t, T.tira, T.tira + 0.6) * (1 - ease(t, T.refaz, T.compacta)), lift = ease(t, T.tira, T.tira + 0.9);
  const newBase = ease(t, T.refaz, T.refaz + 0.8), hot = ease(t, T.quente, T.quente + 0.7), seal = ease(t, SELA, SELA + 0.5);
  const pitDepth = (SUB_B - y0) * pit; // negativo
  const lineC = seal > 0.1 ? "#e9c46a" : "#ffffff";
  return (
    <G>
      {hook ? [2.4, 1.95, 1.55].map((r, k) => <Cyl key={k} rt={r} h={0.04} p={[PX, y0 + 0.01 * k, PZ]} c={["#4a4d52", "#26282b", "#3c3f44"][k]} seg={22} cast={false} />) : null}
      {crack > 0.01 && t < T.corta ? Array.from({ length: 9 }, (_, k) => {
        const a = (k / 9) * PI * 2 + rnd(k) * 0.5, l = (0.8 + rnd(k * 3) * 1.1) * crack;
        return <Box key={k} s={[l, 0.03, 0.07]} p={[PX + Math.cos(a) * l * 0.5, y0 + 0.02, PZ + Math.sin(a) * l * 0.5]} r={[0, -a, 0]} c="#0d0e10" cast={false} />;
      }) : null}
      {seep ? [0, 1, 2, 3].map((k) => { const u = (t * 1.4 + k * 0.25) % 1; return <Sph key={k} rad={0.16} p={[PX + (k - 1.5) * 0.35, lerp(y0, BASE_B + 0.2, u), FRONT + 0.06]} c={WATER} ws={6} hs={4} cast={false} />; }) : null}
      {mud > 0.01 ? <Sph rad={1.0} p={[PX, (BASE_B - ASF) / 2 + 0.1, FRONT + 0.03]} sc={[1.9 * mud, 0.75 * mud, 0.12]} c={mixc(MUD, "#4a6f8f", 0.35 + 0.15 * Math.sin(t * 4))} ws={12} hs={8} cast={false} /> : null}
      {sag > 0.01 ? <Cyl rt={1.6} h={0.05} p={[PX, y0 - sag, PZ]} c={ASPH2} seg={20} cast={false} /> : null}
      {holeOpen > 0.01 ? (
        <G>
          <Cyl rt={1.25 * holeOpen} h={0.05} p={[PX, y0 + 0.01, PZ]} c="#0b0b0c" seg={18} cast={false} />
          <Cyl rt={0.95 * holeOpen} h={0.04} p={[PX, y0 + 0.03, PZ]} c={mixc(WATER, MUD, 0.45)} seg={16} o={{ opacity: 0.85 }} cast={false} />
          {Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * PI * 2; return <Box key={k} s={[0.35, 0.18, 0.3]} p={[PX + Math.cos(a) * 1.35 * holeOpen, y0 + 0.06, PZ + Math.sin(a) * 1.35 * holeOpen]} r={[rnd(k), a, rnd(k + 2)]} c={ASPH} cast={false} />; })}
          <Box s={[2.3 * holeOpen, ASF + 0.05, 0.05]} p={[PX, y0 - ASF / 2, FRONT + 0.05]} c="#0b0b0c" cast={false} />
        </G>
      ) : null}
      {!hook && t > T.quebra && t < T.quebra + 1.2 ? Array.from({ length: 8 }, (_, k) => { const u = t - T.quebra, a = (k / 8) * PI * 2; return <Box key={k} s={[0.3, 0.15, 0.25]} p={[PX + Math.cos(a) * (0.6 + u * 2), y0 + 2.4 * u - 4 * u * u + 0.1, PZ + Math.sin(a) * (0.6 + u * 2)]} r={[u * 9 + k, u * 7, k]} c={ASPH} cast={false} />; }) : null}
      {massa > 0.01 ? (
        <G p={[PX, y0 - 0.25 * sink, PZ]}>
          <Cone rad={1.35} h={lerp(0.9, 0.12, flat)} seg={14} p={[0, lerp(0.45, 0.06, flat), 0]} sc={massa} c={mixc("#141416", "#2b2c30", sink)} o={{ rough: 0.35 }} cast={false} />
          {sink > 0.3 ? Array.from({ length: 5 }, (_, k) => <Box key={k} s={[1.1, 0.03, 0.06]} p={[0, 0.16, 0]} r={[0, (k / 5) * PI, 0]} c="#000000" cast={false} />) : null}
        </G>
      ) : null}
      {cut > 0.01 ? (
        <G>
          {[RZ0, FRONT - 0.05].map((z, k) => <Box key={k} s={[RX * 2 * cut, 0.04, 0.06]} p={[PX, y0 + 0.05, z]} c={lineC} o={{ emissive: lineC, ei: 0.4 }} cast={false} />)}
          {[-1, 1].map((s) => <Box key={s} s={[0.06, 0.04, (FRONT - RZ0) * cut]} p={[PX + s * RX, y0 + 0.05, (FRONT + RZ0) / 2]} c={lineC} o={{ emissive: lineC, ei: 0.4 }} cast={false} />)}
        </G>
      ) : null}
      {t > T.corta && t < T.tira ? <G p={[PX - RX + 2 * RX * prog(t, T.corta, T.tira), y0 + 0.5, RZ0]}><Cyl rt={0.55} h={0.08} r={[0, 0, PI / 2]} c="#c7ced4" seg={16} /><Puffs t={t} p={[0, 0, 0]} n={5} period={0.5} rise={1} size={0.2} c="#ffe08a" /></G> : null}
      {lift > 0.01 && lift < 0.999 ? <Box s={[RX * 2, y0 - SUB_B, FRONT - RZ0]} p={[PX, (y0 + SUB_B) / 2 + 9 * lift, (FRONT + RZ0) / 2 - 6 * lift]} r={[0.4 * lift, 0, 0.2 * lift]} c={MUD} /> : null}
      {pit > 0.01 ? (
        <G>
          <Box s={[RX * 2, 0.04, FRONT - RZ0]} p={[PX, y0 + 0.02, (FRONT + RZ0) / 2]} c="#1a120b" cast={false} />
          <Box s={[RX * 2, -pitDepth, 0.05]} p={[PX, y0 + pitDepth / 2, FRONT + 0.05]} c="#2a1c10" cast={false} />
        </G>
      ) : null}
      {newBase > 0.01 ? <Box s={[RX * 2 - 0.05, (y0 - ASF - SUB_B) * newBase, FRONT - RZ0 + 0.06]} p={[PX, SUB_B + ((y0 - ASF - SUB_B) * newBase) / 2, (FRONT + RZ0) / 2 + 0.03]} c="#8d949b" /> : null}
      {hot > 0.01 ? <Box s={[RX * 2 - 0.05, ASF * hot + 0.02, FRONT - RZ0 + 0.06]} p={[PX, y0 - ASF + (ASF * hot) / 2 + 0.01, (FRONT + RZ0) / 2 + 0.03]} c={mixc("#101012", ASPH, ease(t, SELA, T.agoraSim))} o={{ rough: 0.3 }} /> : null}
      {hot > 0.2 && t < SELA + 1 ? <Puffs t={t} p={[PX, y0 + 0.2, PZ - 0.5]} n={8} period={1.4} rise={3} size={0.5} c="#f4f4f4" /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- máquinas e carros
const Roller: React.FC<{ t: number; t0: number; feet?: boolean }> = ({ t, t0, feet = false }) => {
  if (t < t0 - 0.2 || t > t0 + 2.6) return null;
  const z = lerp(-26, FRONT + 6, prog(t, t0 - 0.2, t0 + 2.6)), y = feet ? SUB_B + 1.0 : top(0) + 1.0;
  return (
    <G p={[-1.5, y, z]}>
      <Cyl rt={1.0} h={3.4} r={[0, 0, PI / 2]} c={feet ? "#e8b923" : "#9aa3ab"} seg={18} />
      {feet ? Array.from({ length: 24 }, (_, k) => { const a = (k / 8) * PI * 2 - z, xk = -1.3 + (k % 3) * 1.3; return <Box key={k} s={[0.25, 0.35, 0.25]} p={[xk, Math.sin(a) * 1.1, Math.cos(a) * 1.1]} r={[-a, 0, 0]} c="#c99a16" cast={false} />; }) : null}
      <Box s={[3.2, 1.6, 3.2]} p={[0, 1.2, -2.6]} c="#ffcf2a" />
      <Box s={[1.8, 1.3, 1.6]} p={[0, 2.6, -2.8]} c="#bfe6ff" o={{ opacity: 0.7 }} />
      <Cyl rt={0.8} h={3.2} r={[0, 0, PI / 2]} p={[0, -0.2, -4.4]} c="#2b2f36" seg={14} />
    </G>
  );
};
const Truck: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.caminhao - 0.4 || t > T.quebra + 1.6) return null;
  const z = PZ + 4.2 + (t - T.cede) * 10, bump = t > T.cede - 0.15 && t < T.quebra + 0.3 ? 0.18 * Math.sin((t - T.cede) * 26) : 0;
  return (
    <G p={[PX - 1.7, top(PX) + 0.9 + bump, z]}>
      <Box s={[3.6, 3.2, 7.2]} p={[0, 2.2, -2.0]} c="#3d7be0" />
      <Box s={[3.4, 2.6, 2.6]} p={[0, 1.9, 3.0]} c="#e0262b" />
      <Box s={[3.0, 1.0, 0.1]} p={[0, 2.6, 4.32]} c="#bfe6ff" o={{ opacity: 0.8 }} cast={false} />
      {[-4.2, 0.4, 2.8].flatMap((zz) => [-1, 1].map((s) => <Cyl key={`${zz}${s}`} rt={0.9} h={0.7} r={[0, 0, PI / 2]} p={[s * 1.7, 0, zz]} c="#1d1e21" seg={14} />))}
      {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[1, 0.9, 1.4]} p={[-1 + (k % 3), 4.2 + Math.floor(k / 3) * 0.9, -2 + (k % 2)]} c="#c99a5b" />)}
    </G>
  );
};
/** carro que vai de z0 a z1 entre t0 e t1 e quica quando a roda passa no buraco (se cai) */
const Car: React.FC<{ t: number; t0: number; t1: number; z0: number; z1: number; c: string; falls?: boolean }> = ({ t, t0, t1, z0, z1, c, falls = false }) => {
  if (t < t0 || t > t1) return null;
  const z = lerp(z0, z1, prog(t, t0, t1)), at = t0 + ((PZ - z0) / (z1 - z0)) * (t1 - t0);
  const b = falls && t > at - 0.05 && t < at + 0.55 ? Math.sin(prog(t, at - 0.05, at + 0.55) * PI) : 0;
  return (
    <G p={[PX, top(PX) + 0.55 - 0.35 * b * (t < at + 0.2 ? 1 : -1.4), z]} r={[b * 0.25, 0, b * 0.08]}>
      <Box s={[2.2, 0.9, 4.2]} p={[0, 0.4, 0]} c={c} />
      <Box s={[1.9, 0.8, 2.2]} p={[0, 1.2, -0.2]} c="#dff2ff" o={{ opacity: 0.85 }} />
      {[-1.4, 1.4].flatMap((zz) => [-1, 1].map((s) => <Cyl key={`${zz}${s}`} rt={0.42} h={0.35} r={[0, 0, PI / 2]} p={[s * 1.1, -0.05, zz]} c="#1d1e21" seg={12} />))}
      {falls && t > at && t < at + 0.8 ? <Puffs t={t} p={[0, -0.4, 0.6]} n={6} period={0.6} rise={1.5} size={0.35} c="#9fd8ff" /> : null}
    </G>
  );
};
const Compactor: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.compacta - 0.2 || t > T.quente) return null;
  const hop = Math.abs(Math.sin((t - T.compacta) * 18)) * 0.25;
  return <G p={[PX, top(PX) - ASF + 0.1 + hop, PZ]}><Box s={[1.4, 0.2, 1.4]} c="#e8b923" /><Box s={[0.8, 0.8, 0.8]} p={[0, 0.5, 0]} c="#3a3f45" /><Cyl rt={0.06} h={1.6} p={[0, 1.4, -0.4]} r={[0.5, 0, 0]} c="#2b2f36" seg={6} /></G>;
};

// ---------------------------------------------------------------- mundo
export const World: React.FC<{ t: number }> = ({ t }) => {
  const open = openId(), c0 = open === "B" ? 0 : 0.6;
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Hills c={["#6fbe58", "#7ccb62"]} z={-150} n={30} x0={-120} flat={0.6} />
      <Clouds t={t} n={9} y={36} />
      <Ground t={t} />
      <Layers t={t} />
      <Drain t={t} />
      <Water t={t} />
      <Rain t={t} />
      <Pothole t={t} />
      <Roller t={t} t0={T.terra + 0.2} feet />
      <Roller t={t} t0={T.asfalto + 0.3} />
      <Truck t={t} />
      <Compactor t={t} />
      <Car t={t} t0={c0} t1={OPEN_END + 0.6} z0={-24} z1={FRONT + 10} c="#ff7a1a" falls />
      <Car t={t} t0={T.voltou - 0.6} t1={T.voltou + 1.6} z0={-14} z1={FRONT + 8} c="#2fcf6a" falls />
      <Car t={t} t0={T.agoraSim - 0.6} t1={T.agoraSim + 2.4} z0={-22} z1={FRONT + 10} c="#ff7a1a" />
    </>
  );
};
