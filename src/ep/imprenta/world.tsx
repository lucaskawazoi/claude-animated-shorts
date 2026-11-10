// Mundo do E4: a oficina de Gutenberg em Maguncia, em corte (sem a parede da frente), e a cidade/vinhas do Reno em volta.
// Estações ao longo de x dentro da oficina (chão y=0, fundo z=-6, frente aberta z=2):
// copista (-14) → caixa de tipos + forma (-8) → fundição (-1) → tinta (5.5) → prensa (11.5) → Bíblias (15.5). Prensa de uva lá fora (30, 0, 8).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Hills, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Crowd, Worker, poseOf, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
const WOOD = "#9a6a3a", WOOD2 = "#7a4e2a", PLASTER = "#f3ead8", BEAM = "#5a3a22";
const GROUND: GroundPal = { base: "#86c94e", patch: ["#7cc046", "#93d35c", "#80c24a"], blade: "#58a832", flowers: ["#ffe14a", "#ffffff"], x: [-70, 80], z: [-40, 50], nBlades: 380 };

// ---------------------------------------------------------------- textura de página: duas colunas de texto gótico + inicial vermelha (como a B42)
const usePageTex = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 160;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f7f0dc"; g.fillRect(0, 0, 128, 160);
  g.fillStyle = "#1c1612";
  for (let col = 0; col < 2; col++) for (let r = 0; r < 21; r++) { const w = 46 - (rnd(r * 7 + col) > 0.85 ? 18 : 0); g.fillRect(10 + col * 58, 12 + r * 6.6, w, 3.6); }
  g.fillStyle = "#c22a1e"; g.fillRect(10, 12, 12, 14);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}, []);
const Page: React.FC<{ p: V3; r?: V3; s?: number; tex: THREE.Texture; vis?: boolean }> = ({ p, r = [-PI / 2, 0, 0], s = 1, tex, vis = true }) => (
  <mesh position={p} rotation={r} scale={[s, s, s]} visible={vis} material={useMemo(() => new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }), [tex])}><planeGeometry args={[0.8, 1.0]} /></mesh>
);

// ---------------------------------------------------------------- a oficina (casa enxaimel em corte) e a cidade
const Workshop: React.FC = () => (
  <G>
    <Box s={[38, 0.3, 9]} p={[0, 0.15, -2]} c="#b88a58" />
    {Array.from({ length: 19 }, (_, i) => <Box key={i} s={[0.06, 0.32, 9]} p={[-18 + i * 2, 0.16, -2]} c="#8a6236" cast={false} />)}
    <Box s={[38, 6, 0.4]} p={[0, 3, -6.5]} c={PLASTER} />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.35, 6, 0.1]} p={[-18 + i * 4, 3, -6.25]} c={BEAM} cast={false} />)}
    <Box s={[38, 0.35, 0.1]} p={[0, 2.8, -6.25]} c={BEAM} cast={false} /><Box s={[38, 0.35, 0.1]} p={[0, 5.8, -6.25]} c={BEAM} cast={false} />
    {Array.from({ length: 9 }, (_, i) => <Box key={i} s={[0.25, 3.6, 0.1]} p={[-16 + i * 4, 4.3, -6.24]} r={[0, 0, 0.6 * (i % 2 ? 1 : -1)]} c={BEAM} cast={false} />)}
    <Box s={[0.4, 6, 9]} p={[-19, 3, -2]} c={PLASTER} /><Box s={[0.4, 6, 9]} p={[19, 3, -2]} c={PLASTER} />
    {/* telhado só sobre a metade de trás, para a câmera ver dentro */}
    <G p={[0, 6.0, -4.2]} r={[0.55, 0, 0]}><Box s={[39, 0.3, 5.4]} c="#a8432e" /></G>
    {/* janelas com vidro de chumbo no fundo */}
    {[-10, 2, 8].map((x, i) => <Box key={i} s={[1.6, 1.6, 0.12]} p={[x, 3.6, -6.25]} c="#9fd3ff" o={{ emissive: "#cfe9ff", ei: 0.35 }} cast={false} />)}
  </G>
);
const Town: React.FC<{ t: number }> = ({ t }) => {
  const houses = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ p: [-34 + i * 5.2 + rnd(i) * 1.5, 0, -16 - rnd(i + 3) * 8] as V3, w: 3.6, h: 4 + rnd(i + 5) * 3 })), []);
  return (
    <G>
      {houses.map((q, i) => (
        <G key={i} p={q.p}>
          <Box s={[q.w, q.h, 3.4]} p={[0, q.h / 2, 0]} c={i % 2 ? "#f2e6cf" : "#efdcc0"} />
          {[0.3, 0.7].map((f, k) => <Box key={k} s={[q.w + 0.05, 0.18, 3.45]} p={[0, q.h * f, 0]} c={BEAM} cast={false} />)}
          <Cone rad={q.w * 0.82} h={2.6} seg={4} p={[0, q.h + 1.3, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.9]} c={i % 3 ? "#a8432e" : "#5a6a7a"} />
        </G>
      ))}
      {/* a catedral de Maguncia (arenito vermelho) ao fundo */}
      <G p={[-30, 0, -34]}>
        <Box s={[10, 9, 7]} p={[0, 4.5, 0]} c="#b5544a" /><Box s={[3.2, 18, 3.2]} p={[-3.5, 9, 0]} c="#a84a40" /><Box s={[3.2, 18, 3.2]} p={[3.5, 9, 0]} c="#a84a40" />
        <Cone rad={2.4} h={4} seg={8} p={[-3.5, 20, 0]} c="#3f6a5a" /><Cone rad={2.4} h={4} seg={8} p={[3.5, 20, 0]} c="#3f6a5a" />
      </G>
      <Puffs t={t} p={[-12, 9, -18]} n={4} period={4} rise={4} size={0.5} c="#eeeeee" />
    </G>
  );
};
/** vinhas do Reno: colina com fileiras de parreiras, o rio e a prensa de uva */
const Vineyard: React.FC<{ t: number }> = ({ t }) => {
  const press = ease(t, T.uvas - 0.2, T.rin + 0.3), juice = ease(t, T.uvas, T.rin + 0.5);
  return (
    <G>
      <mesh position={[40, -0.2, 40]} rotation={[-PI / 2, 0, 0]} material={mat("#3a97d6", { rough: 0.25 })}><planeGeometry args={[200, 14]} /></mesh>
      {Array.from({ length: 8 }, (_, r) => <G key={r}>{Array.from({ length: 10 }, (_, c) => <G key={c} p={[22 + c * 1.6, 0, 14 + r * 1.8]}><Cyl rt={0.05} h={1.2} p={[0, 0.6, 0]} c={WOOD2} seg={5} /><Sph rad={0.5} p={[0, 1.2, 0]} sc={[1, 0.7, 1]} c="#4f9a32" ws={8} hs={6} /><Sph rad={0.14} p={[0.25, 0.95, 0.2]} c="#6a2a7a" ws={6} hs={4} /></G>)}</G>)}
      {/* prensa de uva: a mesma ideia do parafuso */}
      <G p={[29, 0, 9]}>
        <Box s={[0.4, 3.6, 0.4]} p={[-1.1, 1.8, 0]} c={WOOD2} /><Box s={[0.4, 3.6, 0.4]} p={[1.1, 1.8, 0]} c={WOOD2} /><Box s={[2.8, 0.45, 0.6]} p={[0, 3.5, 0]} c={WOOD2} />
        <Cyl rt={0.16} h={2.0} p={[0, 2.5 - 0.6 * press, 0]} c="#b58a52" seg={8} /><Box s={[1.8, 0.25, 1.4]} p={[0, 1.4 - 0.6 * press, 0]} c={WOOD} />
        <Cyl rt={1.0} h={0.7} p={[0, 0.35, 0]} c={WOOD} seg={14} />
        {Array.from({ length: 12 }, (_, i) => <Sph key={i} rad={0.16} p={[(rnd(i) - 0.5) * 1.4, 0.75 + 0.3 * (1 - press) * rnd(i + 2), (rnd(i + 4) - 0.5) * 1.0]} c="#6a2a7a" ws={6} hs={4} />)}
        <Box s={[0.3, 0.1, 1.4]} p={[0, 0.25, 1.3]} c={WOOD} /><Cyl rt={0.5} h={0.5} p={[0, 0.25, 2.2]} c={WOOD2} seg={12} /><Cyl rt={0.45} h={0.05} p={[0, 0.45, 2.2]} c="#7a1a3a" seg={12} vis={juice > 0.2} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- estações
const Copyist: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => (
  <G p={[-14, 0.3, -2.5]}>
    <Box s={[1.8, 1.1, 1.2]} p={[0, 0.55, 0]} c={WOOD} /><Box s={[1.9, 0.12, 1.3]} p={[0, 1.18, 0]} r={[0.35, 0, 0]} c={WOOD2} />
    <Page p={[-0.42, 1.3, 0.02]} r={[-PI / 2 + 0.35, 0, 0]} tex={tex} /><Page p={[0.42, 1.3, 0.02]} r={[-PI / 2 + 0.35, 0, 0]} tex={tex} />
    <Cyl rt={0.08} h={0.5} p={[0.95, 1.5, -0.3]} c="#f2efe6" seg={6} /><Sph rad={0.07} p={[0.95, 1.8, -0.3]} c="#ffcc33" o={{ emissive: "#ffaa00", ei: 2 }} cast={false} />
    <Worker p={[0, -0.3, 1.25]} yaw={PI} pose={poseOf("read", t)} t={t} c={{ ...COSTUMES.rome, top: "#6b4a2a", kilt: "#6b4a2a", kiltLen: 0.62, hat: "none", hatC: "#000" }} mustache={false} scale={1.1} />
  </G>
);
const typesIn = (t: number) => ease(t, T.ordenan - 0.2, T.imprimen);
const typesBack = (t: number) => ease(t, T.usar - 0.1, T.tipos);
const Case: React.FC<{ t: number }> = ({ t }) => {
  const many = ease(t, T.trescientos - 0.2, T.unidas + 0.6);
  const cols = ["#c8ccd2", "#aeb4bc", "#d9b45a", "#c22a1e", "#5b8ad6"];
  return (
    <G p={[-8.5, 0.3, -4.6]}>
      <Box s={[3.6, 1.6, 0.9]} p={[0, 0.8, 0]} c={WOOD2} />
      <G p={[0, 2.0, 0.1]} r={[-0.55, 0, 0]}>
        <Box s={[3.6, 0.15, 1.8]} c={WOOD} />
        {Array.from({ length: 12 }, (_, i) => Array.from({ length: 5 }, (_, j) => <Box key={`${i}${j}`} s={[0.22, 0.08, 0.22]} p={[-1.5 + i * 0.27, 0.1, -0.7 + j * 0.34]} c={cols[(i + j) % 2]} cast={false} />))}
        {/* «casi trescientos tipos»: a caixa enche de tipos diferentes */}
        {many > 0.01 ? Array.from({ length: 60 }, (_, k) => <Box key={k} s={[0.16, 0.14, 0.16]} p={[-1.6 + (k % 15) * 0.23, 0.18 + 0.1 * (1 - many) * 5, -0.75 + Math.floor(k / 15) * 0.4]} sc={many} c={cols[k % 5]} cast={false} />) : null}
      </G>
    </G>
  );
};
/** a forma (página de tipos) na pedra; letras voam da caixa para a forma e voltam */
const Forme: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => {
  const inn = typesIn(t), back = typesBack(t), inked = ease(t, T.tinta, T.espesa + 0.3), wet = ease(t, T.agua, T.resbala) * (1 - ease(t, T.b3, T.tinta));
  const printed = ease(t, T.imprimen, T.imprimen + 0.5);
  return (
    <G p={[-5.5, 0.3, -1.6]}>
      <Box s={[2.2, 1.0, 1.6]} p={[0, 0.5, 0]} c="#9a9488" />
      {Array.from({ length: 24 }, (_, k) => {
        const i = k % 6, j = Math.floor(k / 6), dest: V3 = [-0.6 + i * 0.24, 1.08, -0.4 + j * 0.24], src: V3 = [-3 + (k % 12) * 0.27, 2.3, -2.9];
        const u = clamp(inn * 1.4 - (k / 24) * 0.4), r = back;
        const p: V3 = [lerp(lerp(src[0], dest[0], u), src[0], r), lerp(lerp(src[1], dest[1], u), src[1], r) + Math.sin(u * PI) * 0.8, lerp(lerp(src[2], dest[2], u), src[2], r)];
        return <Box key={k} s={[0.2, 0.16, 0.2]} p={p} c={inked > 0.5 ? "#2a2622" : "#b8bec6"} vis={u > 0.01 && r < 0.99} cast={false} />;
      })}
      <Page p={[0, 1.2 + 0.5 * (1 - printed), 0]} tex={tex} vis={printed > 0.01 && back < 0.99} s={0.8} />
      {/* tinta de água: gotas azuis que escorrem; tinta de óleo: camada preta brilhante */}
      {Array.from({ length: 8 }, (_, k) => { const u = fract(t * 0.9 + k / 8); return <Sph key={k} rad={0.07} p={[-0.6 + (k % 4) * 0.4 + u * 0.8, 1.15 - u * u * 1.1, -0.3 + Math.floor(k / 4) * 0.5]} c="#4aa8ff" vis={wet > 0.3} cast={false} ws={6} hs={4} />; })}
      <Box s={[1.5 * inked + 0.001, 0.02, 1.0]} p={[0, 1.16, 0]} c="#141010" o={{ rough: 0.2 }} cast={false} vis={inked > 0.01} />
    </G>
  );
};
const Foundry: React.FC<{ t: number }> = ({ t }) => {
  const pour = ease(t, T.viertes - 0.2, T.viertes + 0.4) * (1 - ease(t, T.enfria, T.enfria + 0.4));
  const n = Math.floor(18 * ease(t, T.sale - 0.3, T.esteMolde + 0.6)) + (t > T.p2 ? 18 : 0);
  return (
    <G p={[-0.8, 0.3, -3.6]}>
      <Box s={[2.0, 1.6, 1.6]} p={[0, 0.8, 0]} c="#a85a3a" /><Box s={[0.8, 0.5, 0.1]} p={[0, 0.6, 0.81]} c="#ff8a1a" o={{ emissive: "#ff6a00", ei: 2.2 }} cast={false} />
      <Cyl rt={0.45} rb={0.35} h={0.5} p={[0, 1.85, 0]} c="#555" seg={10} /><Cyl rt={0.4} h={0.05} p={[0, 2.08, 0]} c="#ffb84a" o={{ emissive: "#ff8a00", ei: 2 }} seg={10} cast={false} />
      <Puffs t={t} p={[0, 2.2, 0]} n={5} period={2.2} rise={2.2} size={0.25} c="#d8d8d8" />
      {/* mesa com o molde de mão e a pilha de letras idênticas */}
      <G p={[2.0, 0, 1.6]}>
        <Box s={[2.2, 1.0, 1.2]} p={[0, 0.5, 0]} c={WOOD} />
        <Box s={[0.5, 0.4, 0.4]} p={[-0.5, 1.2, 0]} c="#7a4e2a" /><Box s={[0.12, 0.12, 0.12]} p={[-0.5, 1.45, 0]} c="#ffb84a" o={{ emissive: "#ff8a00", ei: 1.5 * pour }} vis={pour > 0.05} cast={false} />
        {Array.from({ length: n }, (_, k) => <Box key={k} s={[0.16, 0.13, 0.16]} p={[0.15 + (k % 6) * 0.17, 1.07 + Math.floor(k / 18) * 0.14, -0.35 + (Math.floor(k / 6) % 3) * 0.2]} c="#b8bec6" cast={false} />)}
      </G>
    </G>
  );
};
const Ink: React.FC<{ t: number }> = ({ t }) => (
  <G p={[5.0, 0.3, -3.2]}>
    <Box s={[1.8, 1.0, 1.2]} p={[0, 0.5, 0]} c={WOOD} /><Box s={[1.0, 0.1, 0.8]} p={[0, 1.05, 0]} c="#3a3a3a" />
    <Box s={[0.9, 0.04, 0.7]} p={[0, 1.12, 0]} c="#0e0b0a" o={{ rough: 0.15 }} vis={t > T.tinta - 0.1} cast={false} />
    <Cyl rt={0.18} h={0.3} p={[-0.6, 1.15, 0.3]} c="#4aa8ff" seg={8} vis={t > T.p2 && t < T.tinta} />
    {[-0.35, 0.35].map((dx, i) => <G key={i} p={[dx, 1.35 + 0.15 * Math.abs(Math.sin(t * 6 + i)) * (t > T.tinta && t < T.estaTinta ? 1 : 0), 0.2]}><Sph rad={0.2} c="#3a2a1e" ws={8} hs={6} /><Cyl rt={0.05} h={0.5} p={[0, 0.3, 0]} c={WOOD2} seg={5} /></G>)}
  </G>
);
/** a prensa de parafuso: o operário puxa a barra, a platina desce, a folha sai impressa */
export const pressCycle = (t: number) => (t > T.prensa && t < T.giro ? 0.5 + 0.5 * Math.sin((t - T.prensa) * 3.2 - PI / 2) : 0);
const Press: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => {
  const taken = ease(t, T.quedo - 0.1, T.quedo + 1.2), d = pressCycle(t);
  return (
    <G p={[11.5 + 9 * taken, 0.3, -3.0]}>
      <Box s={[0.5, 4.4, 0.5]} p={[-1.3, 2.2, 0]} c={WOOD2} /><Box s={[0.5, 4.4, 0.5]} p={[1.3, 2.2, 0]} c={WOOD2} />
      <Box s={[3.2, 0.5, 0.7]} p={[0, 4.2, 0]} c={WOOD2} /><Box s={[3.2, 0.4, 0.7]} p={[0, 3.2, 0]} c={WOOD2} />
      <Cyl rt={0.18} h={1.4} p={[0, 2.6 - 0.25 * d, 0]} c="#c9a36a" seg={10} />
      {Array.from({ length: 5 }, (_, k) => <Cyl key={k} rt={0.22} h={0.05} p={[0, 2.1 + k * 0.22 - 0.25 * d, 0]} r={[0.25, 0, 0]} c="#9a7a4a" seg={10} cast={false} />)}
      <Box s={[2.0, 0.08, 0.12]} p={[0.9, 2.3 - 0.25 * d, 0.2]} r={[0, -0.6 + 1.0 * d, 0]} c={WOOD2} />
      <Box s={[1.6, 0.25, 1.2]} p={[0, 1.75 - 0.3 * d, 0]} c={WOOD} />
      <Box s={[2.4, 0.9, 2.2]} p={[0, 0.45, 0.5]} c={WOOD} /><Box s={[1.4, 0.1, 1.0]} p={[0, 0.95, 0.2]} c="#2a2622" />
      <Page p={[0, 1.02, 0.2]} tex={tex} vis={t > T.estaPrensa - 0.4 && t < T.giro} s={0.95} />
    </G>
  );
};
/** Bíblias empilhando (180) e varais de folhas secando; a pilha vai embora com o Fust */
const Bibles: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => {
  const hook = t < T.maguncia, n = hook ? Math.floor(36 * ease(t, T.gutenberg, T.ciento + 0.5)) : Math.floor(36 * ease(t, T.estaPrensa, T.giro));
  const taken = ease(t, T.quedo - 0.1, T.quedo + 1.2);
  const sheets = Math.floor(14 * ease(t, T.prensa, T.trescientos));
  return (
    <G>
      <G p={[15.8 + 10 * taken, 0.3, -2.0]}>
        <Box s={[2.4, 1.0, 1.6]} p={[0, 0.5, 0]} c={WOOD} />
        {Array.from({ length: n }, (_, k) => <Box key={k} s={[0.62, 0.22, 0.85]} p={[-0.7 + (k % 3) * 0.7, 1.12 + Math.floor(k / 3) * 0.23, 0]} c={k % 2 ? "#7a2a22" : "#8a3a2a"} />)}
      </G>
      {Array.from({ length: sheets }, (_, k) => <Page key={k} p={[-12 + k * 2.2, 4.6, -3.4]} r={[0, 0, 0]} tex={tex} s={0.9} />)}
      <Box s={[32, 0.04, 0.04]} p={[0, 5.1, -3.4]} c="#d9c9a4" cast={false} vis={sheets > 0} />
    </G>
  );
};
/** Johann Fust: casaco vermelho, chapéu preto, corrente de ouro; sacos de moedas */
const Fust: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.fortuna - 0.5 || t > T.cambio + 0.5) return null;
  const x = lerp(26, 19.5, ease(t, T.fortuna, T.prestado)) + 6 * ease(t, T.quedo, T.quedo + 1.4);
  const pose: PoseName = t > T.gano ? "cheer" : t > T.prestado ? "present" : "walk";
  return (
    <G>
      <Worker p={[x, 0.3, 0.2]} yaw={-PI / 2 + 0.4} pose={poseOf(pose, t)} t={t} c={{ skin: "#e8b48c", top: "#b8202a", bottom: "#2a2a3a", kilt: "#b8202a", kiltLen: 0.7, hat: "cap", hatC: "#151515", boot: "#151515", belt: "#e8c24a", sleeves: true }} scale={1.3} />
      {[0, 1].map((k) => <Sph key={k} rad={0.32} p={[x - 1.0 - k * 0.7, 0.62, 0.9]} c="#c9a24a" ws={8} hs={6} vis={t > T.prestado - 0.2 && t < T.gano} />)}
    </G>
  );
};
/** o martelo do juiz cai sobre a mesa */
const Gavel: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.juicio - 0.3 || t > T.quedo + 1.5) return null;
  const hit = Math.abs(Math.sin(clamp((t - T.gano + 0.25) * 6, 0, PI)));
  return (
    <G p={[6, 0.3, 0.6]}>
      <Box s={[2.4, 1.0, 1.2]} p={[0, 0.5, 0]} c="#5a3a22" />
      <G p={[0.2, 1.0, 0]} r={[0, 0, -0.9 * hit]}><Cyl rt={0.05} h={0.9} p={[0.45, 0.2, 0]} r={[0, 0, PI / 2]} c={WOOD} seg={6} /><Cyl rt={0.16} h={0.45} p={[0.9, 0.2, 0]} c="#3a2414" seg={8} /></G>
      <Box s={[0.7, 0.04, 0.9]} p={[-0.5, 1.03, 0]} c="#f1e3b5" cast={false} />
    </G>
  );
};
/** hoje: a Bíblia numa vitrine de museu */
const Museum: React.FC<{ t: number; tex: THREE.Texture }> = ({ t, tex }) => {
  const k = ease(t, T.hoy - 0.2, T.hoy + 0.6); if (k <= 0.01) return null;
  return (
    <G p={[0, 0.3, 0.8]} sc={k}>
      <Box s={[1.6, 1.2, 1.2]} p={[0, 0.6, 0]} c="#2f3e56" />
      <Page p={[-0.36, 1.32, 0]} r={[-PI / 2 + 0.25, 0, 0.05]} tex={tex} s={0.9} /><Page p={[0.36, 1.32, 0]} r={[-PI / 2 + 0.25, 0, -0.05]} tex={tex} s={0.9} />
      <Box s={[1.5, 1.0, 1.1]} p={[0, 1.75, 0]} c="#cfefff" o={{ opacity: 0.25, depthWrite: false }} cast={false} />
      <Sph rad={0.2} p={[0, 2.6, 0]} c="#ffe27a" o={{ emissive: "#ffd000", ei: 1.6 }} cast={false} />
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const tex = usePageTex();
  return (
    <>
      <Sky top="#2f86e8" mid="#86c4f5" low="#eef3fa" />
      <Ground g={GROUND} />
      <Hills c={["#5fae3e", "#6fbf48"]} z={-70} />
      <Clouds t={t} n={8} />
      <Town t={t} /><Workshop /><Vineyard t={t} />
      <Trees spots={[[-24, 0, 8], [-28, 0, 4], [22, 0, -6], [36, 0, -10], [-40, 0, -8]]} />
      <Copyist t={t} tex={tex} /><Case t={t} /><Forme t={t} tex={tex} /><Foundry t={t} /><Ink t={t} /><Press t={t} tex={tex} /><Bibles t={t} tex={tex} />
      <Fust t={t} /><Gavel t={t} /><Museum t={t} tex={tex} />
    </>
  );
};
export { Crowd };
