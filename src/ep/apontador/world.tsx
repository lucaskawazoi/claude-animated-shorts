// Mundo do episódio «apontador» (Mundo em Peças, MEP25): o que tem dentro de um apontador de bolso.
// Uma carteira escolar de brinquedo: o lápis gigante deitado, o bloquinho com a face da câmera (+z) de vidro para ver o furo-guia,
// o cone, a lâmina de raspão, a fenda por onde sai a raspa em sanfona e o furinho do fim do cone. Depois o apontador de manivela
// (o lápis parado, dois cortadores em espiral girando em volta) e, na conta, o quadro-negro com 1847 e a fábrica de lápis.
// Tamanhos do apontador em unidades U (1 U ≈ 0,6 cm); o grupo inteiro é ampliado por K.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { T } from "./cues";

const PI = Math.PI;
export const K = 1.8; // ampliação do apontador de bolso
export const AY = 1.3 * K; // altura do eixo do lápis
export const SIDE: V3 = [11, 0, 7]; // onde o operário fala, na carteira
export const MP: V3 = [-26, 0, 0]; // o apontador de manivela
export const M2: V3 = [MP[0] + 8.5, 0, 6.5]; // o operário no de manivela
export const FP: V3 = [70, 0, -40]; // a fábrica de lápis
export const F2: V3 = [FP[0] + 9, 0, FP[2] + 12]; // o operário na fábrica

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const pulse = (t: number, a: number, b: number) => (t > a && t < b ? 0.55 + 0.45 * Math.sin((t - a) * 7) : 0);
const hookOn = (t: number) => t < T.monta - 0.05;

/** textura de texto em canvas (placas e quadro-negro) */
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

// ---------------------------------------------------------------- o lápis (eixo x, ponta para -x), em U
const BODY = 9, R = 0.45, RG = 0.15;
/** ponta = tronco de cone de comprimento lc; cut corta a pontinha (ponta quebrada) */
const Pencil: React.FC<{ tipX: number; lc: number; spin: number; cut?: number; wob?: number }> = ({ tipX, lc, spin, cut = 0, wob = 0 }) => {
  const rTip = R * cut, lw = lc * (1 - cut), lg = (lw * (RG - rTip)) / Math.max(1e-3, R - rTip);
  return (
    <G p={[tipX + lc * cut, 1.3, 0]} r={[0, 0, wob]}>
      <G r={[spin, 0, 0]}>
        {/* ponta de madeira e grafite (tronco: rt na ponta, rb no ombro) */}
        <Cyl rt={rTip} rb={R} h={lw} p={[lw / 2, 0, 0]} r={[0, 0, PI / 2]} c="#e9c08a" seg={24} />
        {RG > rTip ? <Cyl rt={rTip * 1.04} rb={RG * 1.04} h={lg} p={[lg / 2, 0, 0]} r={[0, 0, PI / 2]} c="#2b2b30" seg={18} /> : null}
        {/* corpo amarelo com uma faixa (para ver o lápis girar), anel e borracha */}
        <Cyl rt={R} h={BODY} p={[lw + BODY / 2, 0, 0]} r={[0, 0, PI / 2]} c="#ffc61a" seg={24} />
        <Box s={[BODY * 0.55, 0.09, 0.2]} p={[lw + BODY * 0.45, R - 0.02, 0]} c="#1f6b3a" cast={false} />
        <Cyl rt={R * 1.03} h={0.7} p={[lw + BODY + 0.35, 0, 0]} r={[0, 0, PI / 2]} c="#c9ced4" seg={20} o={{ metal: 0.5, rough: 0.35 }} />
        <Cyl rt={R} h={0.8} p={[lw + BODY + 1.1, 0, 0]} r={[0, 0, PI / 2]} c="#f28fa8" seg={20} />
      </G>
    </G>
  );
};

/** estado do lápis no bloquinho em cada instante */
const SHOULDER = 0.4; // onde o cone do bloco tem o raio do lápis: ombro + ponta = encostado
const pencilAt = (t: number) => {
  const sharp = ease(t, T.gira + 0.3, T.sanfona + 1.4);
  let lc = lerp(0.25, 1.8, sharp), tipX = SHOULDER - lc, spin = t * 2.2, wob = 0, cut = 0;
  if (hookOn(t)) { // gancho: o lápis rombudo gira na frente; no «bloquinho» entra e sai apontado
    const inn = ease(t, T.bloquinho + 0.3, T.bora - 0.2);
    lc = lerp(0.25, 1.8, ease(t, T.semMotor, T.bora - 0.2)); tipX = lerp(4.6, SHOULDER - lc, inn); spin = t * (t > T.bloquinho ? 6 : 1.6);
    return { lc, tipX, spin, wob, cut };
  }
  if (t < T.gira) { // montagem: entra no furo e para no começo do cone; balança no «se o lápis balança»
    const inn = ease(t, T.furo + 0.2, T.furo + 1.2);
    tipX = lerp(4.6, SHOULDER - lc, inn);
    wob = t > T.balanca && t < T.chefe1 - 0.2 ? 0.07 * Math.sin((t - T.balanca) * 13) * (1 - ease(t, T.chefe1 - 0.8, T.chefe1 - 0.2)) : 0;
    spin = t > T.soSegura && t < T.z1 ? t * 5 : t * 0.4;
  }
  if (t > T.gira && t < T.z2) spin = t * 7;
  if (t > T.quebrou - 0.05) { cut = 0.25; tipX = SHOULDER - lc + 0.15; spin = 0; } // a pontinha ficou lá dentro
  if (t > T.diaInteiro) { cut = 0; tipX = SHOULDER - lc; }
  return { lc, tipX, spin, wob, cut };
};

// ---------------------------------------------------------------- o bloquinho (prisma), em U
const Block: React.FC<{ t: number }> = ({ t }) => {
  const sh = hookOn(t) ? pk(t, T.bloquinho, 0.45) : pk(t, T.monta, 0.45);
  const glass = hookOn(t) ? ease(t, T.bloquinho + 0.5, T.bloquinho + 1.1) : ease(t, T.monta + 0.5, T.furo);
  const hole = hookOn(t) ? 1 : ease(t, T.furo, T.furo + 0.4);
  const cone = hookOn(t) ? 1 : ease(t, T.cone2, T.cone2 + 0.5);
  const bladeIn = hookOn(t) ? 1 : ease(t, T.lamina + 0.1, T.lamina + 0.9);
  const hiHole = pulse(t, T.furo, T.balanca), hiCone = pulse(t, T.cone2, T.lamina), hiEdge = pulse(t, T.raspao, T.z1), hiSlot = pulse(t, T.fenda, T.gira + 0.4), hiExit = pulse(t, T.furinho, T.sair + 0.4);
  const loose = t > T.balanca && t < T.chefe1 ? 1 : 0; // o furo frouxo (o «se balança») aparece como anel vermelho
  return (
    <G sc={Math.max(0.001, sh)}>
      {/* carcaça: face de trás opaca, face da câmera e tampa viram vidro */}
      <Box s={[4, 2.6, 0.2]} p={[0, 1.3, -1.1]} c="#d6402f" o={{ rough: 0.45 }} />
      <Box s={[4, 0.2, 2.4]} p={[0, 0.1, 0]} c="#d6402f" o={{ rough: 0.45 }} />
      <Box s={[4, 0.2, 2.4]} p={[0, 2.5, 0]} c="#d6402f" o={{ rough: 0.45, opacity: lerp(1, 0.18, glass), depthWrite: glass < 0.5 }} cast={false} />
      <Box s={[4, 2.6, 0.2]} p={[0, 1.3, 1.1]} c="#e2584a" o={{ rough: 0.3, opacity: lerp(1, 0.16, glass), depthWrite: glass < 0.5 }} cast={false} />
      <Box s={[0.2, 2.6, 2.4]} p={[-1.9, 1.3, 0]} c="#c4382a" o={{ opacity: lerp(1, 0.3, glass), depthWrite: glass < 0.5 }} cast={false} />
      <Box s={[0.2, 2.6, 2.4]} p={[1.9, 1.3, 0]} c="#c4382a" o={{ opacity: lerp(1, 0.3, glass), depthWrite: glass < 0.5 }} cast={false} />
      {/* frisos de pegada no topo */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => <Box key={x} s={[0.12, 0.06, 2.2]} p={[x, 2.63, 0]} c="#b8301f" cast={false} vis={glass < 0.5} />)}
      {/* furo-guia: cilindro do tamanho do lápis */}
      <Cyl rt={0.5} h={1.4} p={[1.3, 1.3, 0]} r={[0, 0, PI / 2]} c="#3a3f47" open o={{ opacity: 0.55 * hole, side: "double", emissive: "#ffd23f", ei: 1.4 * hiHole, depthWrite: false }} cast={false} vis={hole > 0.02} />
      <Cyl rt={0.62} h={0.06} p={[2.0, 1.3, 0]} r={[0, 0, PI / 2]} c="#ff3b30" open o={{ emissive: "#ff3b30", ei: 1.2, side: "double" }} cast={false} vis={loose > 0} />
      {/* o cone que dá a ponta (ponta para -x) */}
      <Cone rad={0.5} h={2.0} p={[-0.4, 1.3, 0]} r={[0, 0, PI / 2]} c="#2f343b" seg={28} o={{ opacity: 0.45 * cone, side: "double", emissive: "#ff9d2e", ei: 1.5 * hiCone, depthWrite: false }} cast={false} vis={cone > 0.02} />
      {/* furinho no fim do cone (a ponta quebrada sai por aqui) */}
      <Cyl rt={0.12} h={0.6} p={[-1.7, 1.3, 0]} r={[0, 0, PI / 2]} c="#1b1e22" o={{ emissive: "#ffd23f", ei: 2 * hiExit }} cast={false} vis={cone > 0.5} />
      {/* a lâmina: placa de aço deitada em cima do cone (sem tapar a vista), o fio encostando de raspão na linha de cima do cone */}
      <G p={[-0.4, 1.56 + 2.4 * (1 - bladeIn), 0]} r={[0, 0, 0.245]}>
        <Box s={[2.1, 0.05, 1.0]} p={[0, 0, -0.5]} c="#cfd6dd" o={{ metal: 0.7, rough: 0.25 }} />
        <Box s={[2.1, 0.07, 0.07]} p={[0, 0, 0.0]} c="#ffffff" o={{ emissive: "#9fe7ff", ei: 0.4 + 2.2 * hiEdge }} cast={false} />
        <Cyl rt={0.14} h={0.08} p={[0, 0.05, -0.7]} c="#9aa3ab" seg={12} o={{ metal: 0.6 }} cast={false} />
        <Box s={[0.2, 0.02, 0.03]} p={[0, 0.1, -0.7]} c="#5b636b" cast={false} />
      </G>
      {/* a fenda ao longo da lâmina, na tampa */}
      <Box s={[2.0, 0.03, 0.18]} p={[-0.4, 2.61, 0.12]} c="#15181c" o={{ emissive: "#ffd23f", ei: 1.8 * hiSlot }} cast={false} vis={bladeIn > 0.9} />
    </G>
  );
};

// ---------------------------------------------------------------- a raspa em sanfona (sai da fenda e se enrola)
const Shaving: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.gira || t > T.quebrou - 0.05) return null;
  const n = Math.floor(lerp(0, 34, prog(t, T.gira + 0.3, T.sanfona + 1.4)));
  return (
    <G p={[-0.3, 1.75, 0.12]}>
      {Array.from({ length: n }, (_, k) => {
        const th = k * 0.34, rr = 0.28 + 0.006 * k; // ponytail: uma espiral apertada de lâminas finas = a fita em sanfona
        return (
          <G key={k} p={[rr * Math.sin(th), 0.05 * k, rr * (1 - Math.cos(th)) + 0.03 * k]} r={[0, th, 0.18 * Math.sin(k * 0.9)]}>
            <Box s={[0.44, 0.03, 0.22]} c={k % 2 ? "#e8c08c" : "#dcae76"} cast={false} />
            <Box s={[0.44, 0.035, 0.045]} p={[0, 0.003, 0.11]} c="#ffc61a" cast={false} />
          </G>
        );
      })}
    </G>
  );
};

/** raspas soltas entupindo o cone (o «a raspa vai pra onde?») */
const Jam: React.FC<{ t: number }> = ({ t }) => {
  const k = t > T.ondeRaspa && t < T.fenda + 0.4 ? ease(t, T.ondeRaspa, T.ondeRaspa + 0.6) : 0;
  if (k <= 0) return null;
  return <G>{Array.from({ length: 14 }, (_, i) => <Box key={i} s={[0.18, 0.04, 0.12].map((v) => v * k) as V3} p={[-1.1 + rnd(i) * 1.4, 1.3 + (rnd(i + 3) - 0.5) * 0.5, (rnd(i + 7) - 0.5) * 0.5]} r={[rnd(i) * 3, rnd(i + 1) * 3, 0]} c="#d9a868" cast={false} />)}</G>;
};

/** a pontinha quebrada: fica presa no fim do cone e sai pelo furinho */
const BrokenTip: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.quebrou || t > T.diaInteiro) return null;
  const out = ease(t, T.sair + 0.2, T.sair + 1.0), fall = ease(t, T.sair + 0.9, T.sair + 1.4);
  const x = lerp(-1.25, -2.5, out) - 0.4 * fall, y = lerp(1.3, 0.12, fall * fall);
  return (
    <G p={[x, y, 0]} r={[0, 0, PI / 2 + fall * 1.2]}>
      <Cone rad={0.11} h={0.45} c="#2b2b30" seg={14} o={{ emissive: "#ff3b30", ei: t < T.furinho ? pulse(t, T.presa, T.furinho) : 0 }} />
    </G>
  );
};

/** lascas da ponta quando o lápis balança */
const Chips: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.quebra || t > T.quebra + 1.2) return null;
  const u = prog(t, T.quebra, T.quebra + 1.2);
  return <G>{[0, 1, 2].map((i) => <Box key={i} s={[0.12, 0.1, 0.1]} p={[SHOULDER - 0.4 + i * 0.1, 1.3 + 1.2 * u - 2.4 * u * u, 0.4 + u * (0.5 + i * 0.3)]} r={[u * 6, u * 4, 0]} c="#2b2b30" cast={false} />)}</G>;
};

// ---------------------------------------------------------------- o apontador de manivela (planetário), em U
const K2 = 1.7;
const Cutter: React.FC<{ phase: number; spin: number }> = ({ phase, spin }) => (
  <G r={[phase, 0, 0]}>
    <G p={[-0.1, 0.52, 0]} r={[0, 0, -0.245]}>
      <G r={[spin, 0, 0]}>
        <Cyl rt={0.26} h={2.1} r={[0, 0, PI / 2]} c="#aab3bc" seg={18} o={{ metal: 0.7, rough: 0.3 }} />
        {Array.from({ length: 4 }, (_, h) => Array.from({ length: 10 }, (_, j) => {
          const a = (h * PI) / 2 + j * 0.62;
          return <Box key={`${h}${j}`} s={[0.2, 0.05, 0.07]} p={[-0.95 + j * 0.21, 0.27 * Math.cos(a), 0.27 * Math.sin(a)]} r={[a, 0, 0]} c="#e8eef3" o={{ metal: 0.6 }} cast={false} />;
        }))}
      </G>
    </G>
  </G>
);
const Crank: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.diaInteiro - 0.3 || t > T.conta + 0.2) return null;
  const sh = pk(t, T.manivela, 0.5), run = t > T.cortadores ? (t - T.cortadores) * 6 : 0;
  const lc = lerp(0.25, 1.8, ease(t, T.cortadores + 0.3, T.agoraSim - 0.2));
  return (
    <G p={MP} sc={K2}>
      <G sc={Math.max(0.001, sh)}>
        {/* base e caixa de vidro */}
        <Box s={[4.6, 0.3, 3.2]} p={[0, 0.15, 0]} c="#2f5fb3" />
        <Box s={[3.6, 2.4, 2.6]} p={[0, 1.5, 0]} c="#7fb2ff" o={{ opacity: 0.2, depthWrite: false }} cast={false} />
        <Box s={[0.25, 2.4, 2.6]} p={[-1.9, 1.5, 0]} c="#2f5fb3" />
        {/* manivela: eixo no -x, gira em torno do eixo do lápis */}
        <G p={[-2.15, 1.3, 0]} r={[run, 0, 0]}>
          <Box s={[0.2, 1.6, 0.25]} p={[0, 0.7, 0]} c="#2f5fb3" />
          <Cyl rt={0.18} h={0.7} p={[-0.35, 1.45, 0]} r={[0, 0, PI / 2]} c="#ffd23f" seg={12} />
        </G>
        {/* os dois cortadores em espiral orbitando o lápis parado */}
        <G p={[-0.2, 1.3, 0]}><Cutter phase={run * 0.5} spin={run * 2.2} /><Cutter phase={run * 0.5 + PI} spin={run * 2.2} /></G>
        <Pencil tipX={0.6 - lc} lc={lc} spin={0} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- a sala: carteira, parede, quadro-negro
const Room: React.FC<{ t: number }> = ({ t }) => {
  const y1847 = pk(t, T.ano, 0.45);
  return (
    <>
      <Box s={[260, 0.2, 160]} p={[0, -0.1, -40]} c="#d9a86c" cast={false} />
      {Array.from({ length: 26 }, (_, i) => <Box key={i} s={[0.06, 0.01, 160]} p={[-130 + i * 10, 0.01, -40]} c="#c08f55" cast={false} />)}
      <Box s={[260, 40, 0.4]} p={[0, 20, -18]} c="#f3e3c3" cast={false} />
      {/* quadro-negro */}
      <Box s={[26, 11, 0.3]} p={[0, 9.5, -17.6]} c="#7a5230" cast={false} />
      <Box s={[24.6, 9.8, 0.2]} p={[0, 9.5, -17.4]} c="#244a36" cast={false} />
      <G vis={y1847 > 0.01 && t < T.fabrica}>
        <G p={[0, 10.2, -17.2]} sc={Math.max(0.001, y1847)}>
          <TextPlane lines={[["1847", "#f4f1ea", 150]]} p={[0, 0, 0]} w={12} h={4} bg="#244a36" glow={0.35} />
        </G>
        <G p={[0, 6.8, -17.2]} sc={Math.max(0.001, pk(t, T.nobre, 0.4))}>
          <TextPlane lines={[["UM NOBRE FRANCÊS", "#ffe08a", 54]]} p={[0, 0, 0]} w={12} h={1.6} bg="#244a36" glow={0.35} />
        </G>
      </G>
      {/* lápis de cor de enfeite na carteira, para escala */}
      {[0, 1, 2].map((i) => <G key={i} p={[16 + i * 1.6, 0.4, -6 - i * 1.2]} r={[0, 0.5 + i * 0.3, 0]}><Cyl rt={0.4} h={7} r={[0, 0, PI / 2]} c={["#3b82f6", "#22c55e", "#ef4444"][i]} seg={10} /></G>)}
    </>
  );
};

// ---------------------------------------------------------------- a fábrica de lápis (São Carlos)
const Factory: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.fabrica - 0.5 || t > T.voce - 0.2) return null;
  const flow = ((t - T.fabrica) * 1.6) % 1, pile = ease(t, T.bilhoes, T.dez);
  const nDez = t > T.dez ? Math.min(10, Math.floor((t - T.dez) * 7) + 1) : 0;
  return (
    <G p={FP}>
      <Box s={[300, 0.2, 300]} p={[0, -0.05, 0]} c="#8fcf6a" cast={false} />
      <Box s={[400, 160, 1]} p={[0, 40, -120]} c="#8cc8ff" cast={false} />
      {/* galpão com telhado em serra */}
      <Box s={[22, 7, 12]} p={[0, 3.5, -4]} c="#e9e4da" />
      {[-8, -3, 2, 7].map((x) => <Cone key={x} rad={3.2} h={2.6} p={[x, 8.3, -4]} r={[0, PI / 4, 0]} c="#9aa3ab" seg={4} o={{ flat: true }} />)}
      <Cyl rt={0.9} h={9} p={[9, 11, -8]} c="#b0552f" seg={12} />
      <Puffs t={t} p={[9, 15.5, -8]} n={6} period={2.4} rise={6} size={1.0} c="#eeeeee" />
      <Box s={[5, 4.2, 0.2]} p={[0, 2.1, 2.05]} c="#3a3f47" />
      <TextPlane lines={[["SÃO CARLOS · SP", "#ffffff", 64]]} p={[0, 6.2, 2.1]} w={11} h={1.6} bg="#1f6b3a" glow={0.5} />
      {/* esteira com lápis saindo da porta */}
      <Box s={[3, 0.5, 18]} p={[0, 0.6, 11]} c="#3a3f47" />
      {Array.from({ length: 12 }, (_, k) => (
        <G key={k} p={[0, 1.25, 2.5 + (k + flow) * 1.45]}><Cyl rt={0.25} h={2.6} r={[0, 0, PI / 2]} c="#ffc61a" seg={8} /></G>
      ))}
      {/* o monte de lápis crescendo */}
      <G p={[-8, 0, 14]} sc={Math.max(0.001, pile)}>
        {Array.from({ length: 40 }, (_, k) => <G key={k} p={[(rnd(k) - 0.5) * 5, 0.3 + rnd(k + 2) * 2.2 * (1 - Math.abs(rnd(k) - 0.5) * 1.6), (rnd(k + 5) - 0.5) * 4]} r={[0, rnd(k + 1) * PI, rnd(k + 9) * 0.4]}><Cyl rt={0.25} h={2.6} r={[0, 0, PI / 2]} c={k % 5 ? "#ffc61a" : "#f28fa8"} seg={8} /></G>)}
      </G>
      {/* dez lápis em pé, um a um, ao lado do operário */}
      {Array.from({ length: nDez }, (_, k) => (
        <G key={k} p={[F2[0] - FP[0] + 2.2 + k * 0.75, 1.6, F2[2] - FP[2] - 0.5]} sc={Math.max(0.001, pk(t, T.dez + k / 7, 0.3))}>
          <Cyl rt={0.28} h={2.8} c="#ffc61a" seg={8} /><Cone rad={0.28} h={0.5} p={[0, 1.65, 0]} c="#e9c08a" seg={8} />
        </G>
      ))}
    </G>
  );
};

/** cone fantasma no gancho: «a ponta é um cone» */
const Ghost: React.FC<{ t: number }> = ({ t }) => {
  const k = t > T.cone && t < T.bloquinho + 0.2 ? ease(t, T.cone, T.cone + 0.4) * (1 - ease(t, T.bloquinho - 0.1, T.bloquinho + 0.2)) : 0;
  if (k <= 0) return null;
  return <Cone rad={0.45} h={1.8} p={[4.6 - 0.9 + 0.25, 1.3, 0]} r={[0, 0, PI / 2]} c="#ff9d2e" seg={24} o={{ opacity: 0.55 * k, emissive: "#ff9d2e", ei: 0.8, depthWrite: false }} cast={false} />;
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const P = pencilAt(t), fab = t > T.fabrica - 0.1 && t < T.voce - 0.3;
  const desk = t < T.diaInteiro + 0.2 || (t > T.conta - 0.3 && t < T.fabrica) || t > T.voce - 0.5;
  return (
    <>
      {fab ? null : <Room t={t} />}
      {desk ? (
        <G sc={K}>
          <Block t={t} />
          <Pencil tipX={P.tipX} lc={P.lc} spin={P.spin} cut={P.cut} wob={P.wob} />
          <Ghost t={t} /><Shaving t={t} /><Jam t={t} /><BrokenTip t={t} /><Chips t={t} />
        </G>
      ) : null}
      <Crank t={t} />
      <Factory t={t} />
    </>
  );
};
export { clamp };
