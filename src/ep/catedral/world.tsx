// Mundo do E8: Notre-Dame de brinquedo na Île de la Cité. Nave ao longo de x (fachada oeste em x=-13, abside em x=16),
// paredes em z=±4,5 (altura 13), 7 tramos de 4. Praça (parvis) a oeste com as demonstrações (igreja românica, arcos)
// e os carpinteiros do fim; o Sena em z=±24. A obra cresce com a história: arcos, abóbada pesada, nervuras, arcobotantes,
// grua de roda, vitrais e rosácea; no fim o telhado e a flecha, o incêndio de 2019 e as vigas refeitas a machado.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Puffs, Sky, Trees } from "../../toy/scenery";
import { COSTUMES, Worker, poseOf } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.paris - 0.12;
const ST = "#e9e1cf", ST2 = "#d8cdb5", DARK = "#2a2630", ROOF = "#5b6670", OAK = "#b07a42";
const X0 = -12, X1 = 16, ZW = 4.5, HW = 13, BAYS = 7, BW = 4;
const bayX = (i: number) => X0 + i * BW;

// ---------------------------------------------------------------- arcos (redondo ou ogival) como polígono extrudado
const archShape = (S: number, th: number, pointed: boolean, n = 14) => {
  const pts: [number, number][] = [];
  if (pointed) {
    const Ro = S + th, ao = Math.acos(-S / (2 * Ro));
    for (let i = 0; i <= n; i++) { const a = lerp(PI, ao, i / n); pts.push([S / 2 + Ro * Math.cos(a), Ro * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = lerp(PI, ao, i / n); pts.push([-(S / 2 + Ro * Math.cos(a)), Ro * Math.sin(a)]); }
    const ai = (2 * PI) / 3;
    for (let i = 0; i <= n; i++) { const a = lerp(PI, ai, i / n); pts.push([-(S / 2 + S * Math.cos(a)), S * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = lerp(PI, ai, i / n); pts.push([S / 2 + S * Math.cos(a), S * Math.sin(a)]); }
  } else {
    for (let i = 0; i <= n * 2; i++) { const a = lerp(PI, 0, i / (n * 2)); pts.push([(S / 2 + th) * Math.cos(a), (S / 2 + th) * Math.sin(a)]); }
    for (let i = 0; i <= n * 2; i++) { const a = lerp(0, PI, i / (n * 2)); pts.push([(S / 2) * Math.cos(a), (S / 2) * Math.sin(a)]); }
  }
  const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s;
};
/** abertura em arco ogival (silhueta cheia): janela, portal */
const lancet = (w: number, h: number) => {
  const s = new THREE.Shape(), r = w, cy = h - w * Math.sin(PI / 3);
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, cy);
  s.absarc(-w / 2, cy, r, 0, PI / 3, false); s.absarc(w / 2, cy, r, (2 * PI) / 3, PI, false); s.lineTo(-w / 2, 0); return s;
};
const Arch: React.FC<{ S: number; th: number; pointed: boolean; d: number; c: string; p?: V3; r?: V3; sc?: V3 | number }> = ({ S, th, pointed, d, c, p, r, sc }) => {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(archShape(S, th, pointed), { depth: d, bevelEnabled: false }), [S, th, pointed, d]);
  return <G p={p} r={r} sc={sc}><mesh geometry={geo} position={[0, 0, -d / 2]} castShadow receiveShadow material={mat(c)} /></G>;
};
const Lancet: React.FC<{ w: number; h: number; c: string; p?: V3; r?: V3; o?: object; vis?: boolean }> = ({ w, h, c, p, r, o, vis = true }) => {
  const geo = useMemo(() => new THREE.ShapeGeometry(lancet(w, h), 8), [w, h]);
  return <mesh geometry={geo} position={p} rotation={r} visible={vis} material={mat(c, { side: "double", ...(o ?? {}) })} />;
};

// ---------------------------------------------------------------- ilha, Sena, casas de Paris
const City: React.FC = () => {
  const hs = useMemo(() => Array.from({ length: 70 }, (_, i) => { const side = i % 2 ? 1 : -1; return { x: lerp(-90, 80, rnd(i * 3 + 1)), z: side * lerp(32, 70, rnd(i * 3 + 2)), w: lerp(4, 7, rnd(i + 3)), h: lerp(5, 9, rnd(i + 9)) }; }), []);
  return (
    <G>
      <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#7fae5a")}><planeGeometry args={[600, 600]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0, 0.03, s * 24]} rotation={[-PI / 2, 0, 0]} material={mat("#4f8fc0", { rough: 0.35 })}><planeGeometry args={[400, 10]} /></mesh>)}
      <mesh position={[-6, 0.02, 0]} rotation={[-PI / 2, 0, 0]} receiveShadow material={mat("#d6d0c4")}><planeGeometry args={[70, 38]} /></mesh>
      {hs.map((q, i) => <G key={i} p={[q.x, 0, q.z]}><Box s={[q.w, q.h, q.w * 0.9]} p={[0, q.h / 2, 0]} c={i % 3 ? "#efe6d6" : "#e6dcc6"} /><Cone rad={q.w * 0.72} h={2.2} seg={4} p={[0, q.h + 1.1, 0]} r={[0, PI / 4, 0]} sc={[1, 1, 0.9]} c="#5d6b7a" /></G>)}
      <Trees spots={[[-40, 0, 14], [-40, 0, -14], [26, 0, 14], [26, 0, -14], [30, 0, 0], [-44, 0, 0]]} c={["#3f9446", "#58ad52"]} />
    </G>
  );
};

// ---------------------------------------------------------------- demonstrações na praça
/** igreja românica: abóbada redonda empurra as paredes para fora; muros grossos, janelas pequenas */
const ROMAN = { x: -30, z: 11 };
const Romanesque: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.paris && t < T.b1 + 0.8)) return null;
  const k = ease(t, T.quieren - 0.3, T.luz), tilt = ease(t, T.empuja, T.fuera1 + 0.4) * (1 - ease(t, T.por, T.gruesos)), thick = ease(t, T.gruesos - 0.3, T.gruesos + 0.4), small = ease(t, T.pequenas - 0.3, T.pequenas + 0.3);
  const th = lerp(0.6, 1.7, thick);
  return (
    <G p={[ROMAN.x, 0, ROMAN.z]} sc={[1, Math.max(0.01, k), 1]}>
      {[-1, 1].map((s) => <G key={s} p={[0, 0, s * (2.2 + th / 2)]} r={[s * 0.12 * tilt, 0, 0]}>
        <Box s={[7, 4, th]} p={[0, 2, 0]} c={ST2} />
        {[-2, 0, 2].map((x) => <Box key={x} s={[lerp(1.1, 0.35, small), lerp(1.6, 0.7, small), th + 0.04]} p={[x, 2.4, 0]} c={DARK} cast={false} />)}
      </G>)}
      <Arch S={4.4 + th} th={0.7} pointed={false} d={7} c={ST} p={[0, 4, 0]} r={[0, PI / 2, 0]} />
      {tilt > 0.05 ? [-1, 1].map((s) => <Cone key={s} rad={0.5} h={1.6} seg={8} p={[0, 4.4, s * (4.4 + 1.2 * tilt)]} r={[s * PI / 2, 0, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.8 }} cast={false} />) : null}
    </G>
  );
};
/** arco redondo x arco ogival lado a lado; setas mostram para onde vai o peso */
const DEMO = { x: -30, z: -7 };
const ArchDemo: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.b1 - 0.3 && t < T.p2 + 1.2)) return null;
  const kr = ease(t, T.b1, T.c1), kp = ease(t, T.arco - 0.2, T.arco + 0.5), arr = ease(t, T.abajo - 0.2, T.abajo + 0.3);
  return (
    <G p={[DEMO.x, 0, DEMO.z]}>
      <G p={[-4, 0, 0]} sc={[1, Math.max(0.01, kr), 1]}>
        <Box s={[0.9, 3.4, 1.1]} p={[-2.45, 1.7, 0]} c={ST2} /><Box s={[0.9, 3.4, 1.1]} p={[2.45, 1.7, 0]} c={ST2} />
        <Arch S={4} th={0.9} pointed={false} d={1.1} c={ST} p={[0, 3.4, 0]} />
        {arr > 0.02 ? [-1, 1].map((s) => <Cone key={s} rad={0.42} h={1.8 * arr} seg={8} p={[s * 3.9, 3.6, 0.7]} r={[0, 0, -s * PI / 2]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.8 }} cast={false} />) : null}
      </G>
      <G p={[4, 0, 0]} sc={[1, Math.max(0.01, kp), 1]}>
        <Box s={[0.9, 3.4, 1.1]} p={[-2.45, 1.7, 0]} c={ST2} /><Box s={[0.9, 3.4, 1.1]} p={[2.45, 1.7, 0]} c={ST2} />
        <Arch S={4} th={0.9} pointed d={1.1} c={ST} p={[0, 3.4, 0]} />
        {arr > 0.02 ? [-1, 1].map((s) => <G key={s}><Cone rad={0.5} h={2.2 * arr} seg={8} p={[s * 2.45, 1.4, 0.8]} r={[PI, 0, 0]} c="#3fcf6a" o={{ emissive: "#1fa84a", ei: 0.7 }} cast={false} /><Cone rad={0.25} h={0.7 * arr} seg={8} p={[s * 3.3, 3.6, 0.8]} r={[0, 0, -s * PI / 2]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.6 }} cast={false} /></G>) : null}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- a catedral que cresce
const wallsK = (t: number) => (built(t) ? 1 : ease(t, T.p2 - 0.4, T.toneladas));
const slabK = (t: number) => (built(t) ? 0 : ease(t, T.p2, T.toneladas) * (1 - ease(t, T.nervios - 0.2, T.nervios + 0.3)));
const ribK = (t: number) => (built(t) ? 1 : ease(t, T.nervios - 0.2, T.cruzan + 0.4));
const lean = (t: number) => (built(t) ? 0 : ease(t, T.empujando - 0.3, T.empujando + 0.5) * (1 - ease(t, T.brazos, T.sostienen + 0.4)));
const buttK = (t: number, i: number) => (built(t) ? 1 : ease(t, T.brazos - 0.2 + i * 0.15, T.brazos + 0.3 + i * 0.15));
export const openK = (t: number) => (built(t) ? 1 : ease(t, T.abrir - 0.2, T.vidrio + 0.2));
const leadK = (t: number) => (built(t) ? 1 : ease(t, T.plomo - 0.2, T.plomo + 0.4));
const roseK = (t: number) => (built(t) ? 1 : ease(t, T.roseton - 0.3, T.trece));
export const roofK = (t: number) => (built(t) || t > T.y2019 - 1.6 ? 1 : 0);
const burn = (t: number) => ease(t, T.incendio - 0.2, T.destruyo + 0.3);
const gone = (t: number) => ease(t, T.destruyo + 0.2, T.rehacer);
const trussK = (t: number, i: number) => ease(t, T.hacha + i * 0.18, T.hacha + 0.5 + i * 0.18);
const GLASS = ["#2f5fd0", "#d8352a", "#2fa85a", "#e8b030", "#7a3fc0"];

const Nave: React.FC<{ t: number }> = ({ t }) => {
  const k = wallsK(t); if (k <= 0.01) return null;
  const h = HW * k, ln = lean(t), op = openK(t), ld = leadK(t);
  return (
    <G>
      {[-1, 1].map((s) => (
        <G key={s} p={[0, 0, s * ZW]} r={[s * 0.05 * ln, 0, 0]}>
          {/* parede: embaixo inteira; em cima painéis entre pilares que se abrem em vitral */}
          <Box s={[X1 - X0, Math.min(h, 7), 1]} p={[(X0 + X1) / 2, Math.min(h, 7) / 2, 0]} c={ST} />
          {h > 7 ? Array.from({ length: BAYS }, (_, i) => {
            const cx = bayX(i) + BW / 2, hh = h - 7;
            return (
              <G key={i}>
                <Box s={[0.9, hh, 1.1]} p={[bayX(i), 7 + hh / 2, 0]} c={ST2} />
                <Box s={[BW - 0.9, hh * (1 - op * 0.82), 1]} p={[cx, 7 + (hh * (1 - op * 0.82)) / 2 + hh * op * 0.82 * 0, 0]} c={ST} vis={op < 0.99} />
                {op > 0.02 ? <G p={[cx, 7.4, 0]}>
                  {[-1, 1].map((f) => <G key={f} p={[0, 0, f * 0.52]} r={[0, f > 0 ? 0 : PI, 0]}>
                    <Lancet w={2.6} h={4.6 * op} c={GLASS[i % 5]} o={{ emissive: GLASS[i % 5], ei: 0.55 }} />
                    {ld > 0.02 ? <G p={[0, 0, 0.02]}>{[1.1, 2.2, 3.3].map((y) => <Box key={y} s={[2.6 * ld, 0.07, 0.02]} p={[0, y, 0]} c="#2a2630" cast={false} />)}<Box s={[0.07, 4.2 * ld, 0.02]} p={[0, 2.1, 0]} c="#2a2630" cast={false} /></G> : null}
                  </G>)}
                </G> : null}
              </G>
            );
          }) : null}
          {h > 7 ? <Box s={[0.9, h - 7, 1.1]} p={[X1, 7 + (h - 7) / 2, 0]} c={ST2} /> : null}
          {/* janelas pequenas embaixo (a parede "românica" que ainda escurece o interior) */}
          {Array.from({ length: BAYS }, (_, i) => <Box key={i} s={[0.6, 1.4, 1.04]} p={[bayX(i) + BW / 2, 3.6, 0]} c={DARK} cast={false} vis={h > 4} />)}
          {/* cracks com a abóbada pesada */}
          {slabK(t) > 0.5 && t > T.toneladas ? [[-6, 10, 0.6], [2, 8.5, -0.5], [10, 11, 0.7]].map(([x, y, r], j) => <Box key={j} s={[2.4, 0.1, 0.06]} p={[x, y, s * 0.53]} r={[0, 0, r]} c="#1c1410" cast={false} />) : null}
          {ln > 0.05 ? [-6, 2, 10].map((x) => <Cone key={x} rad={0.6} h={2.2 * ln} seg={8} p={[x, 12.4, s * 1.8]} r={[s * PI / 2, 0, 0]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 0.8 }} cast={false} />) : null}
        </G>
      ))}
      {/* abside semicircular */}
      <Cyl rt={ZW + 0.5} h={h} seg={14} p={[X1, h / 2, 0]} c={ST} ts={0} tl={PI} r={[0, PI / 2, 0]} open />
      {/* piso */}
      <Box s={[X1 - X0, 0.12, ZW * 2]} p={[(X0 + X1) / 2, 0.06, 0]} c="#cfc6b2" />
      {/* pilares internos */}
      {Array.from({ length: BAYS + 1 }, (_, i) => [-1, 1].map((s) => <Cyl key={i + "" + s} rt={0.45} h={h * 0.86} p={[bayX(i), (h * 0.86) / 2, s * (ZW - 0.9)]} c={ST2} seg={10} />))}
    </G>
  );
};
/** abóbada: primeiro um bloco pesado; depois nervuras cruzadas + panos leves */
const Vault: React.FC<{ t: number }> = ({ t }) => {
  const sk = slabK(t), rk = ribK(t), glow = ease(t, T.pilares - 1.0, T.pilares) * (1 - ease(t, T.cruceria + 0.6, T.p3));
  const y0 = HW - 1.6, yA = HW + 2.2;
  return (
    <G>
      {sk > 0.01 ? <Box s={[X1 - X0, 2.6, ZW * 2 + 0.8]} p={[(X0 + X1) / 2, HW + 1.3 + (1 - sk) * 8, 0]} c="#6f7176" /> : null}
      {rk > 0.01 ? Array.from({ length: BAYS }, (_, i) => {
        const a = bayX(i), b = a + BW, m = a + BW / 2, c = glow > 0.05 ? "#ffd04a" : ST2, o = glow > 0.05 ? { emissive: "#ffb000", ei: glow } : undefined;
        const A: V3 = [m, y0 + (yA - y0) * rk, 0];
        return (
          <G key={i}>
            {([[a, -1], [a, 1], [b, -1], [b, 1]] as [number, number][]).map(([x, s], j) => <Pipe key={j} a={[x, y0, s * (ZW - 0.6)]} b={A} rad={0.16} c={c} o={o} seg={6} />)}
            <Pipe a={[a, y0, -(ZW - 0.6)]} b={[a, yA - 0.6, 0]} rad={0.15} c={ST2} seg={6} /><Pipe a={[a, y0, ZW - 0.6]} b={[a, yA - 0.6, 0]} rad={0.15} c={ST2} seg={6} />
            {rk > 0.7 ? [-1, 1].map((s) => <Box key={s} s={[BW, 0.18, ZW + 0.3]} p={[m, (y0 + yA) / 2 + 0.25, s * (ZW / 2)]} r={[s * 0.62, 0, 0]} c="#efe8d8" />) : null}
          </G>
        );
      }) : null}
    </G>
  );
};
/** arcobotantes: pilar externo + braço inclinado até o topo da parede */
const Buttresses: React.FC<{ t: number }> = ({ t }) => (
  <G>{Array.from({ length: BAYS + 1 }, (_, i) => { const k = buttK(t, i); if (k <= 0.01) return null; const x = bayX(i);
    return [-1, 1].map((s) => <G key={i + "" + s} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[1.2, 8, 1.4]} p={[x, 4, s * 10]} c={ST2} /><Cone rad={0.6} h={1.5} seg={4} p={[x, 8.75, s * 10]} r={[0, PI / 4, 0]} c={ST2} />
      <Pipe a={[x, 7.4, s * 9.4]} b={[x, 12.2, s * (ZW + 0.5)]} rad={0.36} c={ST} seg={6} />
      <Pipe a={[x, 5.4, s * 9.4]} b={[x, 9.4, s * (ZW + 0.5)]} rad={0.26} c={ST} seg={6} />
    </G>); })}</G>
);
/** fachada oeste: duas torres de topo plano, rosácea, três portais */
const Facade: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) || t > T.roseton - 0.4 ? 1 : 0, rk = roseK(t); if (!k) return null;
  return (
    <G p={[X0 - 1.2, 0, 0]}>
      <Box s={[2.4, 17, 10]} p={[0, 8.5, 0]} c={ST} />
      {[-1, 1].map((s) => <G key={s} p={[0, 0, s * 7.2]}><Box s={[5, 23, 5]} p={[0, 11.5, 0]} c={ST} /><Box s={[5.4, 0.7, 5.4]} p={[0, 23.2, 0]} c={ST2} />
        {[16, 19.5].map((y) => <Lancet key={y} w={0.9} h={3} c={DARK} p={[-2.52, y, 0]} r={[0, -PI / 2, 0]} />)}</G>)}
      {[-3, 0, 3].map((z) => <Lancet key={z} w={z ? 1.8 : 2.4} h={z ? 3.6 : 4.4} c="#4a3b2e" p={[-1.22, 0.2, z]} r={[0, -PI / 2, 0]} />)}
      <Box s={[2.5, 0.5, 18]} p={[0, 6.4, 0]} c={ST2} />
      {/* rosácea: vista dos dois lados */}
      {[-1, 1].map((f) => <G key={f} p={[f * 1.22, 11, 0]} r={[0, f * PI / 2, 0]} sc={Math.max(0.01, rk)}>
        <mesh material={mat("#2a2630", { side: "double" })}><circleGeometry args={[3.0, 32]} /></mesh>
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * PI * 2; return <mesh key={i} position={[Math.cos(a) * 1.95, Math.sin(a) * 1.95, 0.02]} material={mat(GLASS[i % 5], { side: "double", emissive: GLASS[i % 5], ei: 0.6 })}><circleGeometry args={[0.72, 12]} /></mesh>; })}
        <mesh position={[0, 0, 0.02]} material={mat("#e8b030", { side: "double", emissive: "#e8b030", ei: 0.7 })}><circleGeometry args={[0.9, 16]} /></mesh>
      </G>)}
    </G>
  );
};
/** telhado de chumbo + flecha; queima em 2019; armação de carvalho refeita */
const Roof: React.FC<{ t: number }> = ({ t }) => {
  if (!roofK(t)) return null;
  const br = burn(t), gn = gone(t), spireFall = ease(t, T.destruyo - 0.1, T.destruyo + 0.9), c = br > 0.5 ? "#2a2522" : ROOF;
  return (
    <G>
      {gn < 0.98 ? [-1, 1].map((s) => <Box key={s} s={[X1 - X0 + 1, 0.4, 6.4]} p={[(X0 + X1) / 2, HW + 2.6 - gn * 1.5, s * 2.5]} r={[-s * 0.72, 0, 0]} sc={[1, 1, 1 - gn * 0.7]} c={c} />) : null}
      {/* flecha */}
      {spireFall < 0.98 ? <G p={[6, HW + 4.6, 0]} r={[0, 0, spireFall * 1.4]}><G p={[0, -spireFall * 5, 0]}><Cyl rt={0.9} rb={1.1} h={3} seg={8} p={[0, 1.5, 0]} c={ROOF} /><Cone rad={0.9} h={9} seg={8} p={[0, 7.5, 0]} c={c} /></G></G> : null}
      {br > 0.02 && t < T.labrar ? Array.from({ length: 9 }, (_, i) => <G key={i} p={[X0 + 2 + i * 3, HW + 4.2, (rnd(i) - 0.5) * 2]}>
        <Cone rad={1.0 * br} h={3.4 * br * (1 + 0.2 * Math.sin(t * 13 + i))} seg={6} p={[0, 1.4, 0]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 1.8 }} cast={false} />
        <Cone rad={0.55 * br} h={2.0 * br} seg={6} p={[0, 0.9, 0]} c="#ffe066" o={{ emissive: "#ffd000", ei: 1.8 }} cast={false} />
        <Puffs t={t} p={[0, 3, 0]} n={6} period={2.4} rise={16} size={2.2} c="#4a4a4a" o={i * 0.17} drift={[2, 0, 1]} />
      </G>) : null}
      {/* armação nova de carvalho */}
      {Array.from({ length: BAYS * 2 + 1 }, (_, i) => { const k = trussK(t, i); if (k <= 0.01) return null; const x = X0 + i * 2;
        return <G key={i} p={[x, HW + 0.6, 0]} sc={[1, Math.max(0.01, k), 1]}>
          <Pipe a={[0, 0, -ZW]} b={[0, 5.2, 0]} rad={0.16} c={OAK} seg={5} /><Pipe a={[0, 0, ZW]} b={[0, 5.2, 0]} rad={0.16} c={OAK} seg={5} /><Pipe a={[0, 0, -ZW]} b={[0, 0, ZW]} rad={0.15} c={OAK} seg={5} /><Pipe a={[0, 0, 0]} b={[0, 5.2, 0]} rad={0.12} c={OAK} seg={5} />
        </G>; })}
      {t > T.hacha ? <Pipe a={[X0, HW + 5.8, 0]} b={[X0 + ease(t, T.hacha, T.ochocientos + 0.8) * (X1 - X0), HW + 5.8, 0]} rad={0.15} c={OAK} seg={5} /> : null}
    </G>
  );
};
/** grua de roda no alto da parede sul: dois homens andam dentro, a corda enrola, a pedra sobe */
const CRANE = { x: 2, z: ZW + 0.6 };
const Crane: React.FC<{ t: number }> = ({ t }) => {
  if (!(t > T.p4 - 0.3 && t < T.p5 + 0.3)) return null;
  const k = ease(t, T.rueda - 0.3, T.rueda + 0.5), spin = (t - T.rueda) * 1.4, lift = ease(t, T.paso, T.grua - 0.2);
  const by = lerp(0.6, HW + 1.2, lift);
  return (
    <G>
      <G p={[CRANE.x, HW, CRANE.z - 0.6]} sc={Math.max(0.01, k)}>
        <Box s={[0.4, 3.6, 0.4]} p={[-1.2, 1.8, -1.4]} c={OAK} /><Box s={[0.4, 3.6, 0.4]} p={[1.2, 1.8, -1.4]} c={OAK} /><Box s={[3, 0.3, 0.3]} p={[0, 3.6, -1.4]} c={OAK} />
        <G p={[0, 2.4, -1.4]} r={[0, 0, -spin]}>
          {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * PI * 2; return <Box key={i} s={[0.95, 0.18, 1.6]} p={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0]} r={[0, 0, a + PI / 2]} c={i % 2 ? OAK : "#9a6a38"} />; })}
          {[0, 1, 2, 3].map((i) => <Box key={i} s={[4.4, 0.12, 0.12]} r={[0, 0, (i * PI) / 4]} c="#7a4a2a" />)}
          <Cyl rt={0.3} h={2.2} r={[PI / 2, 0, 0]} c="#6b4423" seg={8} />
        </G>
        {[-0.5, 0.5].map((x, i) => <Worker key={i} p={[x, 0.3, -1.4]} yaw={-PI / 2} pose={poseOf("walk", t * 1.3 + i)} t={t} c={COSTUMES.mason} scale={0.75} mustache={false} />)}
        {/* lança sobre a borda */}
        <Pipe a={[0, 3.6, -1.4]} b={[0, 4.4, 3.4]} rad={0.18} c={OAK} seg={6} />
      </G>
      {k > 0.5 ? <Pipe a={[CRANE.x, HW + 4.4, CRANE.z + 2.8]} b={[CRANE.x, by + 0.9, CRANE.z + 2.8]} rad={0.04} c="#3a2a1a" seg={4} cast={false} /> : null}
      {k > 0.3 ? <Box s={[1.6, 1.2, 1.4]} p={[CRANE.x, by, CRANE.z + 2.8]} r={[0, Math.sin(t * 2) * 0.1, 0]} c={ST2} /> : null}
    </G>
  );
};
/** feixes de luz colorida entrando quando os vitrais abrem */
const Beams: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.vidrio, T.plomo) * (t < T.y2019 ? 1 : 0); if (k <= 0.01) return null;
  return <G>{Array.from({ length: BAYS }, (_, i) => [-1, 1].map((s) => <Box key={i + "" + s} s={[2.0, 0.3, 9]} p={[bayX(i) + BW / 2, 6.6, -s * 0.4]} r={[s * 0.62, 0, 0]} c={GLASS[i % 5]} cast={false} recv={false} o={{ emissive: GLASS[i % 5], ei: 0.6, opacity: 0.22 * k, depthWrite: false }} />))}</G>;
};
/** carpinteiros a machado na praça: toras viram vigas */
const Carpenters: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.rehacer - 0.3) return null;
  return (
    <G p={[-26, 0, 8]}>
      {[0, 1, 2].map((i) => { const hewn = ease(t, T.labrar + i * 0.5, T.labrar + i * 0.5 + 0.6);
        return <G key={i} p={[0, 0, i * 2.6]}>
          <Box s={[0.6, 0.5, 0.6]} p={[-2.2, 0.25, 0]} c="#6b4423" /><Box s={[0.6, 0.5, 0.6]} p={[2.2, 0.25, 0]} c="#6b4423" />
          {hewn < 0.5 ? <Cyl rt={0.45} h={6} seg={9} p={[0, 0.95, 0]} r={[0, 0, PI / 2]} c="#8a5a32" /> : <Box s={[6, 0.8, 0.8]} p={[0, 0.9, 0]} c={OAK} />}
          <Worker p={[0.6 - i * 0.6, 0, 1.1]} yaw={PI} pose={poseOf("chisel", t * 1.1 + i * 0.4)} t={t} c={COSTUMES.mason} prop="hammer" scale={1.05} mustache={i === 1} />
          {Array.from({ length: 4 }, (_, j) => { const u = fract(t * 2 + j / 4 + i * 0.3); return <Box key={j} s={[0.12, 0.05, 0.08]} p={[0.6 - i * 0.6 + (rnd(j) - 0.5), 1.0 + u * 1.2 - u * u * 1.6, 0.6 + u * 0.8]} r={[u * 5, u * 3, 0]} c="#e0b070" cast={false} />; })}
        </G>; })}
    </G>
  );
};
/** fantasma do construtor que pôs a primeira pedra (no gancho) */
const Ghost: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.quienes, T.quienes + 0.4) * (1 - ease(t, T.nunca + 0.8, T.vitrales0)); if (k <= 0.01) return null;
  return <G><Worker p={[X0 - 6, 0, 7]} yaw={0.9} pose={poseOf("present", t)} t={t} c={{ ...COSTUMES.mason, top: "#c9c9c9", kilt: "#c9c9c9", bottom: "#b0b0b0", skin: "#d8d8d8" }} scale={1.3 * k} /><Box s={[1.2, 0.8, 0.9]} p={[X0 - 4.6, 0.4, 7.6]} c={ST2} /></G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#3a86d8" mid="#8cc3ee" low="#f0f2f2" />
    <Clouds t={t} n={8} y={34} />
    <City />
    <Romanesque t={t} /><ArchDemo t={t} />
    <Nave t={t} /><Vault t={t} /><Buttresses t={t} /><Facade t={t} /><Roof t={t} /><Crane t={t} />
    <Carpenters t={t} /><Ghost t={t} />
  </>
);
