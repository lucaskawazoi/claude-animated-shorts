// Mundo do MEP8 (Mundo em Peças): o tatuzão da Linha 6-Laranja, em corte. Tudo é função do tempo t (sem estado).
// O plano z=0 corta o chão ao meio: a terra fica em z<0 e vemos a máquina e o túnel pela metade, como num aquário.
// Túnel no eixo x a y=YT; rua em cima (y=GY); a outra linha de metrô cruza em z (círculo no corte) em x=XL1.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Crowd } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { T } from "./cues";

const PI = Math.PI;
export const GY = 34, YT = 10, R = 3.3, XL1 = 30, X0 = -46;
const SOIL = ["#9a6a3e", "#b07a46", "#8a5a32", "#c08a52", "#7a5030"], WATERC = "#4ab8ff", CONC = "#c4c9c7", CONC2 = "#a9b0ae";

export const built = (t: number) => t < CUTS[0];
/** posição da roda de corte: anda do poço (X0) até depois da outra linha; no gancho, a máquina pronta no meio */
export const xH = (t: number) => (built(t) ? 6 : lerp(X0, 46, clamp((t - T.cava) / (T.end - T.cava))));
const st = (t: number) => {
  const B = built(t);
  return {
    B,
    trench: B ? 0 : ease(t, T.rua - 0.3, T.rua + 0.5) * (1 - ease(t, T.cava - 0.2, T.cava + 0.4)),
    collapse: B ? 0 : ease(t, T.desmorona - 0.1, T.desmorona + 0.8) * (1 - ease(t, T.volta, T.volta + 0.9)),
    shield: B ? 1 : ease(t, T.escudo - 0.2, T.escudo + 0.4),
    rings: B ? 1 : ease(t, T.braco, T.tunel),
    push: B ? 0 : ease(t, T.frente, T.frente + 0.6) * (1 - ease(t, T.apertada + 0.6, T.camara)),
    sag: B ? 0 : ease(t, T.afundar - 0.2, T.afundar + 0.6) * (1 - ease(t, T.apertada + 0.4, T.camara)),
    chamber: B ? 1 : ease(t, T.apertada - 0.2, T.apertada + 0.8),
    pile: B ? 0 : ease(t, T.arranca + 0.2, T.parafuso) * (1 - ease(t, T.esteira, T.rosca + 0.5)),
    screw: B ? 1 : ease(t, T.parafuso - 0.2, T.parafuso + 0.4),
    belt: B ? 1 : ease(t, T.esteira - 0.2, T.esteira + 0.4),
    gap: B ? 0 : ease(t, T.fresta, T.fresta + 0.6) * (1 - ease(t, T.argamassa, T.anda)),
    grout: B ? 1 : ease(t, T.argamassa, T.anda),
    closed: B ? 0 : ease(t, T.estacao, T.estacao + 0.5) * (1 - ease(t, T.agoraSim, T.agoraSim + 0.6)),
  };
};
type S = ReturnType<typeof st>;

// ---------------------------------------------------------------- terra em camadas, com o furo do túnel até a roda
const Soil: React.FC<{ t: number; s: S; xh: number }> = ({ s, xh }) => {
  const bands = [[0, 4], [4, YT - R], [YT + R, 17], [17, 22], [22, 27], [27, GY - 1.2]];
  return (
    <G>
      {bands.map(([y0, y1], i) => <Box key={i} s={[260, y1 - y0, 50]} p={[0, (y0 + y1) / 2, -25]} c={SOIL[i % SOIL.length]} cast={false} />)}
      {/* lençol de água (faixa azul dentro da terra) */}
      <Box s={[260, 1.6, 0.2]} p={[0, 18.5, 0.06]} c={WATERC} o={{ opacity: 0.55 }} cast={false} recv={false} />
      {/* faixa do túnel: terra ainda não cavada à frente da roda; atrás, só a metade do fundo */}
      <Box s={[Math.max(0.1, 130 - xh), 2 * R, 50]} p={[(xh + 130) / 2, YT, -25]} c={SOIL[1]} cast={false} />
      <Box s={[Math.max(0.1, xh + 130), 2 * R, 50 - R]} p={[(xh - 130) / 2, YT, -25 - R / 2]} c={SOIL[1]} cast={false} />
      {/* pedrinhas e raízes na face cortada */}
      {Array.from({ length: 60 }, (_, i) => <Sph key={i} rad={0.25 + rnd(i) * 0.35} p={[-100 + rnd(i + 1) * 200, 1 + rnd(i + 2) * (GY - 3), 0.05]} sc={[1, 0.7, 0.3]} c={i % 3 ? "#6b4a2a" : "#9a9f9c"} cast={false} ws={6} hs={4} vis={Math.abs(1 + rnd(i + 2) * (GY - 3) - YT) > R + 0.4} />)}
      {/* terra que desaba atrás da roda quando ainda não há escudo */}
      {s.collapse > 0.01 ? Array.from({ length: 22 }, (_, i) => { const x = xh - 1.5 - rnd(i) * 9, fall = clamp(s.collapse * 1.6 - rnd(i + 3) * 0.6); return <Box key={i} s={[1.3, 1.1, 1.6]} p={[x, lerp(YT + R + 0.5, YT - R + 0.6 + rnd(i + 5) * 2.4, fall), -1 + rnd(i + 7) * 1.5]} r={[rnd(i) * 2, rnd(i + 1) * 2, fall * 1.5]} c={SOIL[i % 3]} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- a rua em cima: asfalto, calçada, prédios, carros; a vala; o afundamento
const Street: React.FC<{ t: number; s: S; xh: number }> = ({ t, s, xh }) => {
  const blds = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: -100 + i * 9.5 + rnd(i) * 2, h: 6 + rnd(i + 3) * 16, w: 6 + rnd(i + 5) * 2.5, c: ["#e8d6b6", "#cfe6ff", "#ffd9a8", "#f1e6d0", "#ffc2c2", "#d8dcdb"][i % 6] })), []);
  const sagAt = (x: number) => s.sag * 1.6 * Math.max(0, 1 - Math.abs(x - (xh + 2)) / 7);
  return (
    <G>
      {/* asfalto em trechos (para poder afundar sobre a roda) */}
      {Array.from({ length: 52 }, (_, i) => { const x = -128 + i * 5 + 2.5; return <G key={i}><Box s={[5.02, 1.2, 12]} p={[x, GY - 0.6 - sagAt(x), -6]} c="#4a4f55" cast={false} /><Box s={[5.02, 0.12, 0.3]} p={[x, GY + 0.02 - sagAt(x), -6]} c={i % 2 ? "#ffffff" : "#4a4f55"} cast={false} /></G>; })}
      <Box s={[260, 1.4, 4]} p={[0, GY - 0.5, -14]} c="#c9cfcd" cast={false} />
      {blds.map((b, i) => <G key={i} p={[b.x, GY, -22]}><Box s={[b.w, b.h, 8]} p={[0, b.h / 2, 0]} c={b.c} />
        {Array.from({ length: Math.floor(b.h / 3) }, (_, k) => <Box key={k} s={[b.w * 0.7, 0.9, 0.1]} p={[0, 2 + k * 3, 4.06]} c="#5b8fc4" cast={false} />)}</G>)}
      {/* carros andando (param quando a vala abre a rua) */}
      {Array.from({ length: 10 }, (_, i) => { const jam = s.trench, x = lerp(-90 + fract(rnd(i) + t * 0.025) * 180, -24 - i * 5.2, jam), lane = i % 2 ? -3.2 : -8.8, dip = sagAt(x);
        return <G key={i} p={[x, GY + 0.05 - dip, lane]} r={[0, 0, dip > 0.3 ? -0.25 : 0]}><Box s={[3.4, 1.1, 1.8]} p={[0, 0.75, 0]} c={["#e0262b", "#2f6fb0", "#ffd400", "#ffffff", "#2fa84f"][i % 5]} /><Box s={[1.8, 0.8, 1.6]} p={[-0.2, 1.6, 0]} c="#bfe6ff" />
          {[-1.1, 1.1].map((dx) => [-0.9, 0.9].map((dz) => <Cyl key={`${dx}${dz}`} rt={0.35} h={0.25} p={[dx, 0.35, dz]} r={[PI / 2, 0, 0]} c="#222" seg={8} cast={false} />))}</G>; })}
      {/* vala a céu aberto: a rua inteira aberta, com máquina e cones */}
      {s.trench > 0.01 ? <G>
        <Box s={[40 * s.trench, 8, 12.2]} p={[-6, GY - 4, -6]} c="#5a3a20" cast={false} />
        <Box s={[40 * s.trench, 0.4, 12.4]} p={[-6, GY - 0.1, -6]} c="#7a5030" cast={false} />
        {Array.from({ length: 8 }, (_, i) => <Cone key={i} rad={0.5} h={1.3} seg={6} p={[-26 + i * 6 * s.trench, GY + 0.65, -0.6]} c="#ff8a1a" />)}
        <G p={[-2, GY, -4]}><Box s={[4, 2, 3]} p={[0, 1.2, 0]} c="#ffd400" /><Box s={[0.5, 6, 0.5]} p={[2.2, 3.6, 0]} r={[0, 0, -0.6]} c="#e0b400" /></G>
      </G> : null}
      <Trees spots={[[-70, GY, -16], [-40, GY, -16], [-10, GY, -16], [20, GY, -16], [52, GY, -16], [80, GY, -16]]} />
    </G>
  );
};

// ---------------------------------------------------------------- a outra linha de metrô (cruza o corte) e a estação em cima
const OtherLine: React.FC<{ t: number; s: S }> = ({ t, s }) => (
  <G>
    <Cyl rt={2.3} h={0.3} p={[XL1, 27.2, 0.1]} r={[PI / 2, 0, 0]} c="#3b4a5a" seg={24} cast={false} />
    <Cyl rt={2.0} h={0.32} p={[XL1, 27.2, 0.12]} r={[PI / 2, 0, 0]} c="#bfe6ff" seg={24} cast={false} />
    {/* o trem passando (visto de frente no corte) */}
    <G vis={s.closed < 0.5 && fract(t * 0.25) < 0.5}><Box s={[2.6, 2.4, 0.3]} p={[XL1, 27.1, 0.2]} c="#2f6fb0" cast={false} /><Box s={[1.8, 0.8, 0.32]} p={[XL1, 27.6, 0.25]} c="#e9f6ff" cast={false} /></G>
    <G p={[XL1, GY, -12]}>
      <Box s={[9, 4, 5]} p={[0, 2, 0]} c="#e9ecea" /><Box s={[9.4, 0.5, 5.4]} p={[0, 4.2, 0]} c="#1f3fa8" />
      <Box s={[2.4, 2.4, 0.2]} p={[0, 5.6, 2]} c="#1f3fa8" /><Box s={[0.5, 1.6, 0.25]} p={[-0.5, 5.6, 2.05]} c="#ffffff" /><Box s={[0.5, 1.6, 0.25]} p={[0.5, 5.6, 2.05]} c="#ffffff" />
      {s.closed > 0.01 ? <G p={[0, 1.2, 3.2]} sc={[1, Math.max(0.01, s.closed), 1]}><Box s={[8, 0.4, 0.3]} c="#e0262b" /><Box s={[8, 0.4, 0.3]} p={[0, 0.8, 0]} c="#ffffff" /><Box s={[0.3, 2, 0.3]} p={[-4, -0.2, 0]} c="#5b6670" /><Box s={[0.3, 2, 0.3]} p={[4, -0.2, 0]} c="#5b6670" /></G> : null}
    </G>
  </G>
);

// ---------------------------------------------------------------- o tatuzão: roda, escudo (metade do fundo), câmara, rosca, braço, anéis, esteira
const half = (r: number, len: number, c: string, x: number, o = {}) => (
  <mesh position={[x, YT, 0]} rotation={[0, 0, PI / 2]} castShadow receiveShadow material={mat(c, { side: "double", ...o })}>
    <cylinderGeometry args={[r, r, len, 28, 1, true, PI / 2, PI]} />
  </mesh>
);
const TBM: React.FC<{ t: number; s: S; xh: number }> = ({ t, s, xh }) => {
  const spin = t * 1.6, SH = 9;
  return (
    <G>
      {/* roda de corte */}
      <G p={[xh, YT, 0]} r={[spin, 0, 0]}>
        <Cyl rt={R} h={0.6} r={[0, 0, PI / 2]} c="#ffb000" seg={28} />
        {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[0.8, 2 * R - 0.4, 0.5]} p={[0.45, 0, 0]} r={[(k * PI) / 6, 0, 0]} c="#e07a00" />)}
        {Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * PI * 2, rr = 0.8 + (k % 3) * 0.9; return <Cyl key={k} rt={0.28} h={0.35} p={[0.85, Math.cos(a) * rr, Math.sin(a) * rr]} r={[0, 0, PI / 2]} c="#5b6670" seg={8} />; })}
      </G>
      {/* faíscas e terra soltando na frente */}
      {Array.from({ length: 8 }, (_, i) => { const u = fract(t * 1.5 + i / 8); return <Box key={i} s={[0.4, 0.4, 0.4]} p={[xh + 0.9 + u * 0.6, YT + (rnd(i) - 0.5) * 5, 0.5 + rnd(i + 2)]} r={[u * 4, u * 3, 0]} c={SOIL[i % 3]} sc={1 - u} cast={false} />; })}
      {/* escudo de aço: só a metade do fundo, para ver por dentro */}
      <G vis={s.shield > 0.01}>{half(R - 0.05, SH * s.shield, "#8a95a0", xh - 0.3 - (SH * s.shield) / 2, { metal: 0.35, rough: 0.4 })}</G>
      {/* parede da câmara e a terra apertada na frente */}
      <Box s={[0.4, 2 * R - 0.4, 0.5]} p={[xh - 2.2, YT, -1.6]} c="#5b6670" />
      <mesh position={[xh - 1.1, YT, 0]} rotation={[0, 0, PI / 2]} material={mat("#7a5030")}><cylinderGeometry args={[R - 0.15, R - 0.15, Math.max(0.05, 1.7 * s.chamber), 24, 1, false, PI / 2, PI]} /></mesh>
      {/* setas: a terra e a água empurrando (vermelhas) e a câmara empurrando de volta (verdes) */}
      {s.push > 0.01 ? [-2, 0, 2].map((dy, i) => <Cone key={i} rad={0.6} h={1.6} seg={6} p={[xh + 3.4 - fract(t * 1.3 + i * 0.3) * 1.5, YT + dy, 0.8]} r={[0, 0, PI / 2]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.6 }} sc={s.push} cast={false} />) : null}
      {s.chamber > 0.5 && s.chamber < 1.0 || (t > T.apertada && t < T.camara + 1.2) ? [-2, 0, 2].map((dy, i) => <Cone key={i} rad={0.6} h={1.6} seg={6} p={[xh + 1.2 + fract(t * 1.3 + i * 0.3) * 1.5, YT + dy, 0.8]} r={[0, 0, -PI / 2]} c="#2fd14f" o={{ emissive: "#1aa83a", ei: 0.6 }} cast={false} />) : null}
      {/* rosca sem fim: tubo inclinado da câmara para trás, com a hélice girando */}
      <G p={[xh - 6.2, YT - 1.2, -0.6]} r={[0, 0, 0.22]} vis={s.screw > 0.01}>
        <Cyl rt={0.55} h={7.5 * s.screw} r={[0, 0, PI / 2]} c="#bfe6ff" o={{ opacity: 0.35 }} seg={12} cast={false} />
        {Array.from({ length: 14 }, (_, k) => <Box key={k} s={[0.12, 0.95, 0.22]} p={[-3.4 + k * 0.5, 0, 0]} r={[k * 0.9 + t * 6, 0, 0]} c="#ffd400" vis={k * 0.5 < 7 * s.screw} />)}
      </G>
      {/* braço montador girando com uma aduela na mão */}
      <G p={[xh - SH + 0.6, YT, -0.4]} r={[s.rings > 0.01 && s.rings < 1 ? t * 2.4 : (s.B ? t * 0.8 : 0), 0, 0]} vis={s.shield > 0.5}>
        <Box s={[0.5, 0.5, 0.5]} c="#ff8a1a" /><Box s={[0.4, R - 0.8, 0.4]} p={[0, (R - 0.8) / 2, 0]} c="#ff8a1a" />
        <Box s={[1.0, 0.5, 2.0]} p={[0, R - 0.55, 0]} c={CONC} vis={s.rings > 0.01} />
      </G>
      {/* operários dentro da máquina */}
      <Crowd list={[{ p: [xh - 13, YT - R + 0.5, -0.8] as V3, yaw: PI / 2, pose: "point", ph: 0 }, { p: [xh - 16, YT - R + 0.5, -1.4] as V3, yaw: -PI / 2, pose: "present", ph: 0.6 }]} t={t} c={COSTUMES.mep} vis={s.belt > 0.5} scale={0.9} />
    </G>
  );
};

/** anéis de concreto (metade do fundo) atrás do escudo, a fresta e a argamassa */
const Lining: React.FC<{ t: number; s: S; xh: number }> = ({ s, xh }) => {
  const tail = xh - 9.3, n = Math.max(0, Math.floor((tail - X0) / 1.0));
  const shown = Math.min(n, Math.floor(n * s.rings + (s.rings > 0.99 ? 0 : Math.min(n, 3) * s.rings)));
  const len = shown * 1.0;
  if (s.rings <= 0.01 || len <= 0.1) return null;
  return (
    <G>
      {half(R - 0.35, len, CONC, tail - len / 2)}
      {Array.from({ length: Math.min(shown, 80) }, (_, k) => <mesh key={k} position={[tail - 0.5 - k, YT, 0]} rotation={[0, 0, PI / 2]} material={mat(k % 2 ? CONC2 : "#8f9694", { side: "double" })}><cylinderGeometry args={[R - 0.33, R - 0.33, 0.08, 28, 1, true, PI / 2, PI]} /></mesh>)}
      {/* fresta entre o anel e a terra: faixa escura; a argamassa a preenche de cinza */}
      {half(R - 0.06, len, s.gap > 0.02 ? "#2a1a0e" : s.grout > 0.02 ? "#7d8582" : SOIL[1], tail - len / 2)}
      {/* trilho e piso */}
      <Box s={[len, 0.3, 2.2]} p={[tail - len / 2, YT - R + 0.6, -0.6]} c="#6b7680" />
    </G>
  );
};

/** esteira levando a terra para trás até o poço, e o guindaste que tira a terra para os caminhões */
const Belt: React.FC<{ t: number; s: S; xh: number }> = ({ t, s, xh }) => {
  if (s.belt <= 0.01) return null;
  const x1 = xh - 3, x0 = X0 - 2, L = x1 - x0;
  return (
    <G>
      <Box s={[L, 0.25, 1.2]} p={[(x0 + x1) / 2, YT + 0.6, -1.2]} c="#2b2f33" sc={[1, 1, s.belt]} />
      {Array.from({ length: Math.min(60, Math.floor(L / 1.6)) }, (_, i) => { const u = fract(i / Math.floor(L / 1.6) - t * 0.08); return <Sph key={i} rad={0.4} p={[x1 - u * L, YT + 1.0, -1.2]} sc={[1.2, 0.7, 1]} c={SOIL[i % 3]} ws={6} hs={4} cast={false} />; })}
      {/* poço vertical e caçamba subindo */}
      <Box s={[6, GY, 0.4]} p={[X0 - 4, GY / 2, -3]} c="#8a95a0" cast={false} />
      <G p={[X0 - 4, YT + 2 + fract(t * 0.2) * (GY - YT), -1]}><Box s={[2.2, 1.6, 1.6]} c="#ffd400" /><Sph rad={0.8} p={[0, 0.9, 0]} sc={[1.2, 0.6, 1]} c={SOIL[0]} /></G>
      <G p={[X0 - 6, GY, -6]}><Box s={[5, 2.4, 2.6]} p={[0, 1.6, 0]} c="#ff8a1a" /><Box s={[2, 2, 2.4]} p={[3.2, 1.4, 0]} c="#e0262b" /><Sph rad={1.2} p={[0, 3.2, 0]} sc={[1.6, 0.6, 1]} c={SOIL[0]} /></G>
    </G>
  );
};

/** terra amontoando dentro do túnel quando ainda não há rosca e esteira */
const Pile: React.FC<{ s: S; xh: number }> = ({ s, xh }) => s.pile <= 0.01 ? null : (
  <G>{Array.from({ length: 18 }, (_, i) => <Sph key={i} rad={0.7 + rnd(i) * 0.5} p={[xh - 3 - rnd(i + 1) * 7, YT - R + 0.6 + rnd(i + 2) * 3.4 * s.pile, -1 + rnd(i + 3) * 1.4]} sc={[s.pile, s.pile * 0.8, s.pile]} c={SOIL[i % 3]} ws={7} hs={5} o={{ flat: true }} />)}</G>
);

export const World: React.FC<{ t: number }> = ({ t }) => {
  const s = st(t), xh = xH(t);
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Clouds t={t} n={8} y={52} />
      <Soil t={t} s={s} xh={xh} />
      <Street t={t} s={s} xh={xh} />
      <OtherLine t={t} s={s} />
      <TBM t={t} s={s} xh={xh} />
      <Lining t={t} s={s} xh={xh} />
      <Belt t={t} s={s} xh={xh} />
      <Pile s={s} xh={xh} />
      {/* poço de partida */}
      <Box s={[0.4, GY - YT, 6]} p={[X0 - 1.2, (GY + YT) / 2 + 1.5, -3]} c="#8a95a0" cast={false} />
    </>
  );
};
void THREE;
