// Mundo do episódio «lixo» (Mundo em Peças, MEP23): o caminhão de lixo compactador e a parede lá dentro que anda.
// Uma rua de brinquedo: casas ao fundo, sacos na calçada, o caminhão parado de lado (cabine em -x, boca em +x). A parede do
// lado da câmera (+z) vira vidro, para ver a pá que varre a boca e a placa azul (a placa ejetora) que recua a cada pá de lixo.
// Quando enche, longe dali, o aterro (manta, tratamento, gás que acende a luz) e,
// mais longe, o lixão (o «nem sempre é aqui» da conta, sugerido pela imagem).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Quad, Sph, V3, clamp, ease, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Puffs, Sky } from "../../toy/scenery";
import { T } from "./cues";
import { COSTUMES, Worker, poseOf } from "../../toy/worker";

const PI = Math.PI;
const COLETOR = { ...COSTUMES.worker, top: "#ff7a1a", bottom: "#2b2f36", hat: "cap" as const, hatC: "#ff7a1a" };

// caminhão (coordenadas locais): caixa de X0 a X1, boca de X1 a XH
export const X0 = -2.5, X1 = 5.5, XH = 7.7, YB = 1.7, YT = 5.3, ZW = 1.8;
export const SIDE: V3 = [10.6, 0, 3.4]; // onde o operário fala
export const AT: V3 = [160, 0, 0]; // o aterro
export const LX: V3 = [160, 0, -110]; // o lixão
const CURB = -5.6;
const BAG = ["#2b2f36", "#1f3b2a", "#3a3f45", "#2a2f4a"];

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const arc = (a: V3, b: V3, u: number, h: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(u * PI), lerp(a[2], b[2], u)];
const hookOn = (t: number) => t < T.monta - 0.05; // no gancho o caminhão está pronto

/** textura de texto em canvas (placas) */
const useTextTex = (lines: [string, string, number][], w = 512, h = 160, bg = "#f7f3e8") => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach(([txt, col, px], i) => { g.fillStyle = col; g.font = `bold ${px}px Arial, sans-serif`; g.fillText(txt, w / 2, (h * (i + 0.5)) / lines.length + 4); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}, []); // eslint-disable-line react-hooks/exhaustive-deps
const TextPlane: React.FC<{ lines: [string, string, number][]; p: V3; w: number; h: number; r?: V3; bg?: string; glow?: number }> = ({ lines, p, w, h, r, bg, glow = 0.35 }) => {
  const tex = useTextTex(lines, 512, Math.round((512 * h) / w), bg);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: glow }), [tex, glow]);
  return <mesh position={p} rotation={r} material={m}><planeGeometry args={[w, h]} /></mesh>;
};

const Bag: React.FC<{ p: V3; s?: number; k: number; sq?: number }> = ({ p, s = 1, k, sq = 0 }) => (
  <G p={p} r={[0, rnd(k) * PI, 0]}>
    <Sph rad={0.42 * s} sc={[1 - 0.35 * sq, 0.85 - 0.25 * sq, 1]} c={BAG[k % 4]} o={{ rough: 0.5 }} cast={false} />
    <Cone rad={0.12 * s} h={0.25 * s} p={[0, 0.38 * s * (0.85 - 0.25 * sq), 0]} c={BAG[k % 4]} seg={5} cast={false} />
  </G>
);

// ---------------------------------------------------------------- a rua
const Street: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      <Box s={[600, 0.2, 400]} p={[0, -0.1, -150]} c="#86c95a" cast={false} />
      <Box s={[90, 0.06, 9]} p={[0, 0.03, 0]} c="#3a3d42" cast={false} />
      {Array.from({ length: 15 }, (_, i) => <Box key={i} s={[2.2, 0.01, 0.25]} p={[-42 + i * 6, 0.07, 3.1]} c="#f2f2f2" cast={false} />)}
      <Box s={[90, 0.3, 3]} p={[0, 0.15, -6]} c="#c9cdd1" />
      <Box s={[90, 0.3, 3]} p={[0, 0.15, 6]} c="#c9cdd1" />
      {/* casas ao fundo */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = -24 + i * 7, c = ["#f2c14e", "#ef8a5b", "#9fd0ff", "#b6e08a", "#f4f1ea", "#e7a6c8", "#f2c14e", "#9fd0ff"][i];
        return (
          <G key={i} p={[x, 0.3, -12]}>
            <Box s={[5.6, 4.2, 5]} p={[0, 2.1, 0]} c={c} />
            <Cone rad={4.3} h={2.2} p={[0, 5.3, 0]} r={[0, PI / 4, 0]} c="#c0503a" seg={4} o={{ flat: true }} />
            <Box s={[1.2, 2.2, 0.1]} p={[-1.2, 1.1, 2.52]} c="#7a4a2a" />
            <Box s={[1.4, 1.2, 0.1]} p={[1.2, 2.4, 2.52]} c="#bfe6ff" />
          </G>
        );
      })}
      {/* sacos na calçada, esperando */}
      {Array.from({ length: 10 }, (_, i) => <Bag key={i} k={i + 20} p={[-14 + i * 2.6 + rnd(i) * 0.8, 0.7, CURB + rnd(i + 4) * 0.6]} s={0.9} />)}
    </>
  );
};

// ---------------------------------------------------------------- o caminhão compactador
/** quanto da caixa já está cheio de lixo apertado (0 a 0,9): a placa recua a cada pá */
const STEP0 = () => T.colada + 0.6, NSTEP = 5;
export const fillAt = (t: number) => {
  if (hookOn(t)) return 0.55 * ease(t, 2.4, T.bora);
  if (t < STEP0()) return t < T.pa ? 0 : 0.06;
  const n = (t - STEP0()) / 1.5, k = Math.min(NSTEP, Math.floor(n) + ease(n - Math.floor(n), 0.45, 0.8)); // um degrau por ciclo da pá
  return 0.06 + 0.84 * (k / NSTEP);
};
const PER = 1.5; // um ciclo da pá (a partir de «começa colada», em fase com os degraus da placa)
const cyc = (t: number) => (t < T.pa || t > T.fimPa ? -1 : t < T.colada + 0.6 ? ((t - T.pa) % PER) / PER : ((t - T.colada - 0.6) % PER + PER) % PER / PER);
/** a pá (placa compactadora): gira descendo na boca (0–0,45), puxa para dentro (0,45–0,8), volta para cima */
const blade = (c: number) => {
  if (c < 0) return { rot: -1.0, dx: 0 };
  if (c < 0.45) return { rot: lerp(-1.0, 0.75, ease(c, 0, 0.45)), dx: 0 };
  if (c < 0.8) return { rot: 0.75, dx: -1.4 * ease(c, 0.45, 0.8) };
  return { rot: lerp(0.75, -1.0, ease(c, 0.8, 1)), dx: -1.4 * (1 - ease(c, 0.8, 1)) };
};

const Truck: React.FC<{ t: number; p: V3; mode: "rua" | "aterro" }> = ({ t, p, mode }) => {
  const rua = mode === "rua";
  // montagem peça por peça (no gancho, já montado)
  const a = (t0: number) => (hookOn(t) || !rua ? 1 : pk(t, t0, 0.45));
  const sChassi = a(T.monta), sCab = a(T.cabine), sCaixa = a(T.caixa), sBoca = a(T.boca);
  const glass = rua ? (hookOn(t) ? ease(t, 1.2, 2.2) : ease(t, T.ar - 0.4, T.ar + 0.2)) : 1;
  // a placa ejetora: na rua recua com o enchimento; no aterro anda de volta e empurra tudo para fora
  const f = rua ? fillAt(t) : 0.9;
  const push = rua ? 0 : ease(t, T.deVolta + 0.2, T.deVolta + 2.6);
  const xe = rua ? lerp(X1 - 0.6, X0 + 0.3, f) : lerp(X0 + 0.3, X1 + 0.2, push);
  const hi = (rua && ((t > T.parede0 - 0.1 && t < T.monta) || (t > T.parede - 0.1 && t < T.cabe + 1.2))) || (!rua && t > T.deVolta && t < T.deVolta + 2.8) ? 0.6 + 0.4 * Math.sin((t - T.parede) * 6) : 0;
  // no aterro a boca levanta (gira para cima em torno da dobradiça de cima)
  const lift = rua ? 0 : ease(t, T.levanta + 0.1, T.levanta + 0.9);
  const c = rua ? cyc(t) : -1, bl = blade(c);
  // lixo apertado entre a placa e a boca: quantos sacos e quão espremidos
  const nIn = rua ? Math.round(lerp(0, 46, clamp(f / 0.9))) : 46;
  const loose = rua ? ease(t, T.ar + 0.1, T.ar + 1.2) * (1 - ease(t, T.pa - 0.2, T.pa + 0.1)) : 0; // o «saco solto é quase tudo ar»
  return (
    <G p={p}>
      {/* chassi e rodas */}
      <G sc={Math.max(0.001, sChassi)}>
        <Box s={[13.5, 0.5, 2.6]} p={[0.6, 1.25, 0]} c="#2b2f36" />
        {[-4.4, 2.0, 3.9].flatMap((x) => [-1, 1].map((s) => (
          <G key={`${x}${s}`} p={[x, 0.9, s * 1.55]}>
            <Cyl rt={0.9} h={0.7} r={[PI / 2, 0, 0]} c="#1d1e21" seg={16} />
            <Cyl rt={0.45} h={0.74} r={[PI / 2, 0, 0]} c="#d4d9de" seg={12} o={{ metal: 0.3 }} />
          </G>
        )))}
      </G>
      {/* cabine */}
      <G sc={Math.max(0.001, sCab)} p={[-4.3, 0, 0]}>
        <Box s={[3.0, 3.0, 3.4]} p={[0, 3.0, 0]} c="#f4f6f8" />
        <Box s={[0.1, 1.2, 3.0]} p={[-1.52, 3.6, 0]} c="#bfe6ff" o={{ opacity: 0.85 }} cast={false} />
        <Box s={[1.6, 1.0, 0.1]} p={[-0.4, 3.6, 1.72]} c="#bfe6ff" o={{ opacity: 0.85 }} cast={false} />
        <Box s={[3.02, 0.5, 3.42]} p={[0, 1.8, 0]} c="#1f8a4c" />
        <Box s={[0.6, 0.35, 1.2]} p={[0, 4.7, 0]} c="#ffb000" o={{ emissive: "#ff8a00", ei: 0.6 * (0.5 + 0.5 * Math.sin(t * 8)) }} cast={false} />
      </G>
      {/* caixa: fundo, teto, parede de trás (-z) e a do lado da câmera, que vira vidro */}
      <G sc={Math.max(0.001, sCaixa)} p={[(X0 + X1) / 2, 0, 0]}>
        <Box s={[X1 - X0, 0.25, ZW * 2]} p={[0, YB, 0]} c="#1f8a4c" />
        <Box s={[X1 - X0, 0.25, ZW * 2]} p={[0, YT, 0]} c="#1f8a4c" />
        <Box s={[0.3, YT - YB, ZW * 2]} p={[-(X1 - X0) / 2, (YB + YT) / 2, 0]} c="#1a7340" />
        <Box s={[X1 - X0, YT - YB, 0.2]} p={[0, (YB + YT) / 2, -ZW]} c="#1a7340" />
        <Box s={[X1 - X0, YT - YB, 0.2]} p={[0, (YB + YT) / 2, ZW]} c="#1f8a4c" o={{ opacity: 1 - 0.85 * glass, depthWrite: glass < 0.5 }} cast={glass < 0.5} />
        {/* frisos que seguem visíveis no vidro (a caixa não some) */}
        {[-(X1 - X0) / 2, 0, (X1 - X0) / 2].map((x) => <Box key={x} s={[0.18, YT - YB, 0.24]} p={[x, (YB + YT) / 2, ZW + 0.02]} c="#156b38" />)}
        <G vis={rua && glass < 0.5}><TextPlane lines={[["COLETA", "#ffffff", 70]]} p={[0, (YB + YT) / 2, ZW + 0.12]} w={3.2} h={0.9} bg="#1f8a4c" glow={0.3} /></G>
      </G>
      {/* a placa ejetora (azul) e o cilindro que a segura */}
      <G vis={sCaixa > 0.6}>
        <Box s={[0.25, YT - YB - 0.3, ZW * 2 - 0.3]} p={[xe, (YB + YT) / 2, 0]} c="#2f7fe0" o={{ emissive: "#5aa8ff", ei: 0.9 * hi }} />
        <Cyl rt={0.18} h={Math.max(0.1, xe - X0)} p={[(X0 + xe) / 2, (YB + YT) / 2, 0]} r={[0, 0, PI / 2]} c="#c8ced4" o={{ metal: 0.6, rough: 0.3 }} seg={10} />
        {/* o lixo apertado */}
        {Array.from({ length: nIn }, (_, k) => {
          const u = rnd(k + 1), v = rnd(k + 51), w = rnd(k + 91);
          const x = rua ? lerp(X1 - 0.35, xe + 0.45, u) : lerp(X1 - 0.35, xe + 0.45, u) + (push > 0 ? 9 * ease(t, T.deVolta + 0.6 + u * 1.2, T.deVolta + 2.6) * u : 0);
          const fall = rua || x < X1 + 0.3 ? 0 : -Math.min(YB, (x - X1) * 0.8);
          return <Bag key={k} k={k} p={[x, YB + 0.45 + v * (YT - YB - 0.9) + fall, -ZW + 0.45 + w * (ZW * 2 - 0.9)]} s={0.85} sq={0.8} />;
        })}
        {/* saco solto (antes da pá): a caixa «cheia» de pouco lixo */}
        {loose > 0.01 ? [[4.6, 0, 0.5], [3.0, 0, -0.8], [1.2, 0, 0.6], [-0.6, 0, -0.5], [3.8, 1, 0], [0.4, 1, 0.3], [-1.6, 0, 0.7]].map(([x, up, z], k) => <Bag key={`l${k}`} k={k + 7} p={[x, YB + 0.7 + up * 1.4, z]} s={1.5 * loose} />) : null}
      </G>
      {/* a boca (tremonha) com a pá; no aterro levanta inteira */}
      <G sc={Math.max(0.001, sBoca)} p={[X1, YT, 0]} r={[0, 0, lift * 1.1]}>
        <G p={[-X1, -YT, 0]}>
          <Box s={[XH - X1, 0.25, ZW * 2 + 0.2]} p={[(X1 + XH) / 2, 1.1, 0]} c="#1a7340" />
          <Box s={[XH - X1, 4.2, 0.2]} p={[(X1 + XH) / 2, 3.0, -ZW - 0.1]} c="#1f8a4c" />
          <Box s={[XH - X1, 4.2, 0.2]} p={[(X1 + XH) / 2, 3.0, ZW + 0.1]} c="#1f8a4c" o={{ opacity: 1 - 0.7 * glass }} />
          <Box s={[0.25, 1.4, ZW * 2 + 0.2]} p={[XH, 1.75, 0]} c="#156b38" />
          <Box s={[XH - X1 + 0.2, 0.3, ZW * 2 + 0.4]} p={[(X1 + XH) / 2, YT, 0]} c="#156b38" />
          {/* faixas refletivas e luzes */}
          {[-1.4, 1.4].map((z) => <Box key={z} s={[0.1, 0.5, 0.5]} p={[XH + 0.13, 2.1, z]} c="#ff3030" o={{ emissive: "#ff3030", ei: 0.8 }} cast={false} />)}
          {/* a pá: gira descendo e puxa o lixo para dentro */}
          <G p={[X1 + 1.5 + bl.dx, 3.9, 0]} r={[0, 0, bl.rot]}>
            <Box s={[0.18, 2.3, ZW * 2 - 0.3]} p={[0, -1.15, 0]} c="#ffcf2a" o={{ emissive: "#ffb000", ei: rua && t > T.pa && t < T.pa + 3 ? 0.5 : 0 }} />
            <Cyl rt={0.12} h={1.2} p={[0.5, -0.3, ZW - 0.3]} r={[0, 0, 0.9]} c="#c8ced4" o={{ metal: 0.6 }} seg={8} />
          </G>
          {/* sacos na boca, empurrados pela pá a cada ciclo */}
          {rua && c >= 0 && c < 0.8 ? [0, 1].map((k) => <Bag key={k} k={k + Math.floor((t - T.pa) / PER) * 2} p={[X1 + 1.1 - (c > 0.45 ? 1.6 * ease(c, 0.45, 0.8) : 0) + k * 0.4, 1.7 + k * 0.5, (k - 0.5) * 1.2]} s={1.1} sq={c > 0.45 ? 0.6 : 0} />) : null}
        </G>
      </G>
    </G>
  );
};

/** o caminhão chega devagar no gancho e para (a rua inteira aparece pronta no quadro 0) */
const truckPos = (t: number): V3 => [lerp(-6, 0, ease(t, 0, 2.2)), 0, 0];

// ---------------------------------------------------------------- o coletor que joga os sacos na boca
const Coletor: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.boca + 0.3 || t > T.aterro) return null; // ponytail: o coletor sai com a rua
  const c = cyc(t), p: V3 = [9.0, 0.3, -1.6];
  const throwing = c > 0.75 || (c >= 0 && c < 0.05);
  const bagU = c > 0.75 ? prog(c, 0.75, 1) : -1;
  return (
    <>
      <Worker p={p} yaw={-PI / 2 - 0.4} pose={poseOf(throwing ? "pour" : "idle", t)} t={t} scale={1.15} c={COLETOR} mustache={false} />
      {bagU >= 0 ? <Bag k={Math.floor(t / PER) * 2 + 3} p={arc([8.7, 1.8, -1.4], [X1 + 1.0, 2.2, -0.4], bagU, 1.6)} s={1.0} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- o aterro: manta, células de lixo, chorume para tratamento, gás que vira luz
const Aterro: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.aterro - 0.5 || t > T.lixao + 0.3) return null;
  const manta = t > T.manta - 0.1 && t < T.manta + 2.4 ? 0.6 + 0.4 * Math.sin((t - T.manta) * 7) : 0;
  const trat = ease(t, T.tratamento - 0.4, T.tratamento + 0.6);
  const gas = 0.5 * ease(t, T.apodrece + 0.4, T.apodrece + 1.2) + 0.5 * ease(t, T.gas, T.gas + 0.6), caldo = ease(t, T.apodrece + 0.6, T.manta + 0.4), luz = ease(t, T.luz - 0.1, T.luz + 0.4);
  return (
    <G p={AT}>
      <Box s={[90, 0.2, 70]} p={[0, -0.05, -10]} c="#b9a37a" cast={false} />
      {/* a manta preta no fundo da vala, depois a camada de lixo coberta de terra */}
      <Box s={[30, 0.25, 22]} p={[-8, 0.15, -14]} c="#16181b" o={{ emissive: "#3a6cff", ei: 0.5 * manta }} />
      <Box s={[28, 2.6, 20]} p={[-8, 1.55, -14]} c="#6e6252" />
      {Array.from({ length: 24 }, (_, k) => <Bag key={k} k={k + 200} p={[-20 + (k % 8) * 3.3, 3.0, -22 + Math.floor(k / 8) * 6]} s={1.2} sq={0.7} />)}
      <Box s={[28, 0.6, 7]} p={[-8, 3.1, -21]} c="#9a7a4a" />
      {/* o caldo escuro que escorre do lixo e para em cima da manta */}
      <G vis={caldo > 0.01}><Box s={[29.2 * caldo + 0.01, 0.06, 21.2]} p={[-8, 0.3, -14]} c="#2a2414" o={{ rough: 0.2, metal: 0.2 }} cast={false} /></G>
      {/* drenos de gás saindo do lixo, com a chama/fumaça */}
      {[-16, -8, 0].map((x, i) => (
        <G key={x} p={[x, 0, -14]}>
          <Cyl rt={0.3} h={5.6} p={[0, 2.8, 0]} c="#9aa3ab" seg={10} />
          <Cyl rt={0.45} h={0.3} p={[0, 5.7, 0]} c="#6f767d" seg={10} />
          {gas > 0.05 ? <Puffs t={t + i} p={[0, 6.0, 0]} n={5} period={1.6} rise={3} size={0.5 * gas} c="#dfe6ea" /> : null}
        </G>
      ))}
      {/* o gás vai por um cano até o gerador, que acende a lâmpada e a casinha */}
      <Box s={[17, 0.35, 0.35]} p={[-7.5, 5.9, -14]} c="#9aa3ab" />
      <G p={[6, 0, -14]}>
        <Box s={[4.2, 3.0, 3.2]} p={[0, 1.5, 0]} c="#3d7be0" />
        <Box s={[1.2, 0.8, 0.1]} p={[0, 2.2, 1.62]} c="#14202b" />
        <Box s={[0.9, 0.3, 0.12]} p={[0, 2.2, 1.66]} c="#5cff7a" o={{ emissive: "#5cff7a", ei: luz }} cast={false} />
        <Cyl rt={0.08} h={6} p={[3.5, 3, 0]} c="#7a5a3a" seg={6} />
        <Box s={[6, 0.06, 0.06]} p={[6.5, 5.6, 0]} c="#2b2f36" cast={false} />
        <G p={[9.5, 0, 0]}>
          <Box s={[3.2, 2.6, 3]} p={[0, 1.3, 0]} c="#f2c14e" />
          <Cone rad={2.5} h={1.4} p={[0, 3.3, 0]} r={[0, PI / 4, 0]} c="#c0503a" seg={4} o={{ flat: true }} />
          <Box s={[1.1, 0.9, 0.1]} p={[0, 1.5, 1.52]} c={luz > 0.5 ? "#fff3a0" : "#5a6b7a"} o={{ emissive: "#ffe066", ei: 1.6 * luz }} cast={false} />
          <Sph rad={0.35} p={[0, 4.5, 1.6]} c="#fff3a0" o={{ emissive: "#ffe066", ei: 2.2 * luz }} cast={false} />
        </G>
      </G>
      {/* gotas de caldo escorrendo pela borda do lixo até a manta */}
      {caldo > 0.01 ? Array.from({ length: 10 }, (_, k) => { const ph = (t * 0.9 + k / 10) % 1; return <Sph key={`d${k}`} rad={0.22} sc={[1, 1.6, 1]} p={[-21.5 + k * 2.9, lerp(2.8, 0.45, ph), -3.6]} c="#3b2f14" cast={false} />; }) : null}
      {/* o caldo correndo pela calha até a lagoa */}
      {trat > 0.05 ? Array.from({ length: 8 }, (_, k) => { const ph = (t * 0.8 + k / 8) % 1; return <Sph key={`c${k}`} rad={0.3} p={[8, 0.55, lerp(-8, 4, ph)]} c="#3b2f14" cast={false} />; }) : null}
      <Box s={[9, 0.3, 0.6]} p={[3.5, 0.25, -3]} c="#9aa3ab" vis={trat > 0.05} />
      {/* o chorume vai por um cano até a lagoa de tratamento */}
      <Box s={[0.3, 0.3, 12]} p={[8, 0.3, -2]} c="#9aa3ab" vis={trat > 0.05} />
      <G p={[8, 0.1, 6]}>
        <Box s={[8, 0.3, 5]} c="#8a8f94" />
        <Box s={[7.2, 0.1, 4.2]} p={[0, 0.2, 0]} c={trat > 0.5 ? "#4fb8a0" : "#3b3220"} cast={false} />
        <G vis={trat > 0.05}><TextPlane lines={[["TRATAMENTO", "#ffffff", 60]]} p={[0, 1.6, 2.6]} w={4} h={0.8} bg="#14202b" glow={0.5} /></G>
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- o lixão: monte sem manta, fumaça e urubus (a conta sugere, não acusa)
const Lixao: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.lixao - 0.5) return null;
  return (
    <G p={LX}>
      <Box s={[80, 0.2, 60]} p={[0, -0.05, 0]} c="#a08a62" cast={false} />
      <Cone rad={12} h={6} p={[0, 3, -6]} c="#5a5040" seg={9} o={{ flat: true }} />
      {Array.from({ length: 30 }, (_, k) => { const a = rnd(k) * PI * 2, r = 2 + rnd(k + 9) * 9; return <Bag key={k} k={k + 300} p={[Math.cos(a) * r, 0.5 + (1 - r / 12) * 4, -6 + Math.sin(a) * r]} s={1.1} />; })}
      <Puffs t={t} p={[2, 6, -6]} n={7} period={2.6} rise={7} size={1.1} c="#8d8a84" />
      <Puffs t={t + 1.1} p={[-4, 4.5, -3]} n={5} period={2.2} rise={6} size={0.9} c="#9a968f" />
      {/* urubus girando */}
      {[0, 1, 2].map((k) => { const a = t * 0.9 + k * 2.1; return (
        <G key={k} p={[Math.cos(a) * 6, 11 + k, -6 + Math.sin(a) * 6]} r={[0, -a, 0]}>
          <Box s={[1.4, 0.08, 0.3]} r={[0, 0, 0.35]} p={[-0.6, 0, 0]} c="#1c1c1c" cast={false} />
          <Box s={[1.4, 0.08, 0.3]} r={[0, 0, -0.35]} p={[0.6, 0, 0]} c="#1c1c1c" cast={false} />
        </G>); })}
      {/* chorume escorrendo no chão, sem manta */}
      <Cyl rt={7} h={0.03} p={[6, 0.06, 4]} c="#2a2414" seg={20} cast={false} />
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
    <Hills c={["#6fbe58", "#7ccb62"]} z={-150} n={30} x0={-120} flat={0.6} />
    <Clouds t={t} n={9} y={36} />
    {t < T.aterro + 0.2 || (t > T.servico - 0.4 && t < T.onde) || t > T.voce - 0.5 ? (
      <>
        <Street t={t} />
        <Truck t={t} p={truckPos(t)} mode="rua" />
        <Coletor t={t} />
      </>
    ) : null}
    <Aterro t={t} />
    {t > T.aterro - 0.5 && t < T.apodrece ? <Truck t={t} p={[AT[0] - 34, 0, AT[2] - 14]} mode="aterro" /> : null}
    <Lixao t={t} />
  </>
);
