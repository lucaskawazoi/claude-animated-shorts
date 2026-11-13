// Mundo do MEP10 (Mundo em Peças): a viagem da latinha amassada até a prateleira, numa cadeia de brinquedo.
// Eixo x = caminho da lata: prateleira A (x≈-100) → catador e caminhão (-88..-52) → prensa (-34) → trituradora (0) →
// forno descascador (26..58) → forno de fusão e lingote (70..104) → laminador (122) → linha de latas (150..180) → prateleira B (200).
import React, { useMemo } from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Hills, Puffs, Sky, Trees } from "../../toy/scenery";
import { Worker, poseOf } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
const PAINT = ["#e6322b", "#2f7fe0", "#27b04a", "#ff9a1a", "#9a4be0", "#ffd400", "#ff5fa2", "#19c2c2"];
const SILVER = "#d3d9de", STEEL = "#8d98a3", DARK = "#2b2f36", CONC = "#bcc3c7", CONC2 = "#a2aab0", GLASS = "#bfe6ff";
const GROUND: GroundPal = { base: "#7cc94a", patch: ["#6fbe40", "#8ad457", "#74c246"], blade: "#4fa82e", flowers: ["#ffe14a", "#ffffff", "#ff8fb1"], x: [-140, 250], z: [-70, 70], nBlades: 520 };

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const spr = (t: number, t0: number, a = 0.3, k = 6, w = 20) => (t < t0 ? 0 : a * Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0)));
const pw = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const mixc = (a: string, b: string, u: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], clamp(u))).toString(16).padStart(2, "0")).join(""); };

// ---------------------------------------------------------------- latinha e amassada
const Can: React.FC<{ p: V3; r?: V3; sc?: V3 | number; paint?: string; h?: number; rad?: number; lid?: boolean; vis?: boolean }> = ({ p, r, sc, paint = PAINT[0], h = 2.2, rad = 0.9, lid = true, vis = true }) => (
  <G p={p} r={r} sc={sc} vis={vis}>
    <Cyl rt={rad} h={h} p={[0, h / 2, 0]} c={paint} seg={14} o={{ metal: 0.3, rough: 0.35 }} />
    <Cyl rt={rad * 1.012} h={h * 0.26} p={[0, h * 0.5, 0]} c="#ffffff" seg={14} cast={false} />
    {lid ? <><Cyl rt={rad * 0.8} rb={rad} h={0.16} p={[0, h + 0.08, 0]} c={SILVER} seg={14} o={{ metal: 0.6, rough: 0.25 }} /><Cyl rt={rad * 0.72} h={0.05} p={[0, h + 0.17, 0]} c="#eef2f5" seg={14} o={{ metal: 0.7, rough: 0.2 }} /></> : null}
  </G>
);
const Crushed: React.FC<{ p: V3; i: number; sc?: number }> = ({ p, i, sc = 1 }) => (
  <G p={p} r={[rnd(i) * 0.8, rnd(i + 2) * 6, rnd(i + 4) * 0.8]} sc={sc}>
    <Box s={[1.7, 0.6, 1.3]} c={PAINT[i % PAINT.length]} o={{ metal: 0.3 }} />
    <Box s={[0.6, 0.62, 1.32]} p={[0.2, 0, 0]} c={SILVER} cast={false} />
  </G>
);

// ---------------------------------------------------------------- prateleira (cabe a de 100 latinhas e a de chegada)
const Shelf: React.FC<{ p: V3; w: number; rows: number; shelfH: number; children?: React.ReactNode; awning?: boolean }> = ({ p, w, rows, shelfH, children, awning }) => (
  <G p={p}>
    <Box s={[w, rows * shelfH + 1.5, 0.8]} p={[0, (rows * shelfH + 1.5) / 2, -2.6]} c="#f4efe4" />
    {Array.from({ length: rows }, (_, k) => <Box key={k} s={[w, 0.45, 5.4]} p={[0, k * shelfH + 0.25, 0]} c="#c98f52" />)}
    {[-1, 1].map((s) => <Box key={s} s={[0.7, rows * shelfH + 1.5, 5.4]} p={[s * (w / 2 + 0.35), (rows * shelfH + 1.5) / 2, 0]} c="#9b6a3a" />)}
    {awning ? Array.from({ length: 12 }, (_, k) => <Box key={k} s={[w / 12 + 0.04, 0.4, 6.4]} p={[-w / 2 + (k + 0.5) * (w / 12), rows * shelfH + 2.6, 0.3]} r={[0.16, 0, 0]} c={k % 2 ? "#ffffff" : "#e0262b"} />) : null}
    {children}
  </G>
);
const ShelfWall: React.FC<{ t: number }> = ({ t }) => {
  // 100 latinhas: onda verde nas 97 que voltam (a que sai é a 54), 3 ficam sem brilho
  const dull = [12, 47, 83];
  return (
    <Shelf p={[-100, 0, 0]} w={39} rows={5} shelfH={3.3}>
      {Array.from({ length: 100 }, (_, i) => {
        const row = Math.floor(i / 20), col = i % 20, u = ease(t, T.noventa + 0.2 + (i / 100) * 2.2, T.noventa + 0.7 + (i / 100) * 2.2);
        const gone = i === 54 && t > T.viagem + 0.15;
        const isDull = dull.includes(i), lit = isDull ? 0 : u;
        return <G key={i} p={[-18 + col * 1.9, row * 3.3 + 0.5, 0.3]} r={[0, lit * PI * 2, 0]} sc={0.78 * (1 + 0.2 * Math.sin(lit * PI))} vis={!gone}>
          <Can p={[0, 0, 0]} paint={isDull ? "#7d8288" : mixc(PAINT[i % 6], "#2fe06a", lit * 0.35)} />
          {lit > 0.02 ? <Cyl rt={1.05} h={0.12} p={[0, 0.02, 0]} c="#46ff7a" o={{ emissive: "#2cff6a", ei: 0.9 }} cast={false} seg={14} sc={[lit, 1, lit]} /> : null}
        </G>;
      })}
    </Shelf>
  );
};

// ---------------------------------------------------------------- esteiras e peças
const Belt: React.FC<{ a: number; b: number; t: number; y?: number; w?: number; z?: number; spd?: number; legs?: boolean }> = ({ a, b, t, y = 1.3, w = 3.4, z = 0, spd = 2.4, legs = true }) => (
  <G>
    <Box s={[b - a, 0.5, w]} p={[(a + b) / 2, y, z]} c={DARK} />
    {Array.from({ length: Math.floor((b - a) / 1.6) }, (_, i) => <Box key={i} s={[0.2, 0.06, w * 0.96]} p={[a + ((i * 1.6 + t * spd) % (b - a)), y + 0.27, z]} c="#4a515c" cast={false} />)}
    {[-1, 1].map((s) => <Box key={s} s={[b - a, 0.35, 0.2]} p={[(a + b) / 2, y + 0.4, z + s * (w / 2 + 0.1)]} c="#e7b312" />)}
    {legs ? Array.from({ length: Math.max(2, Math.floor((b - a) / 7)) }, (_, i) => <Box key={i} s={[0.4, y, w + 0.4]} p={[a + 1 + i * ((b - a - 2) / Math.max(1, Math.max(2, Math.floor((b - a) / 7)) - 1)), y / 2 - 0.2, z]} c={STEEL} />) : null}
  </G>
);
const Glass: React.FC<{ s: V3; p: V3; o?: number }> = ({ s, p, o = 0.16 }) => <Box s={s} p={p} c={GLASS} o={{ opacity: o }} cast={false} />;
const Sparks: React.FC<{ t: number; p: V3; n?: number; on: number; spread?: number; g?: number; c?: string }> = ({ t, p, n = 14, on, spread = 3, g = 9, c = "#ffd23a" }) => (
  <G p={p} vis={on > 0.01}>
    {Array.from({ length: n }, (_, i) => {
      const per = 0.9 + rnd(i) * 0.5, u = fract(t / per + rnd(i + 7)), tt = u * per, vx = (rnd(i + 1) - 0.5) * spread * 2, vy = 3 + rnd(i + 2) * 5, vz = (rnd(i + 3) - 0.5) * spread;
      return <Box key={i} s={[0.2, 0.2, 0.2]} p={[vx * tt, vy * tt - 0.5 * g * tt * tt, vz * tt]} r={[tt * 5, tt * 4, 0]} sc={on * (1 - u * 0.7)} c={c} o={{ emissive: c, ei: 1.2 }} cast={false} />;
    })}
  </G>
);
const Flame: React.FC<{ t: number; p: V3; s?: number; ph?: number }> = ({ t, p, s = 1, ph = 0 }) => {
  const f = 1 + 0.22 * Math.sin(t * 17 + ph) + 0.1 * Math.sin(t * 29 + ph * 2), w = 1 + 0.12 * Math.sin(t * 23 + ph);
  return (
    <G p={p} sc={[s * w, s * f, s * w]}>
      <Cone rad={0.75} h={2.4} seg={7} p={[0, 1.2, 0]} c="#ff4a10" o={{ emissive: "#ff3a08", ei: 1 }} cast={false} />
      <Cone rad={0.5} h={1.8} seg={7} p={[0.1, 0.9, 0.1]} c="#ff9a1a" o={{ emissive: "#ff8a10", ei: 1.2 }} cast={false} />
      <Cone rad={0.28} h={1.1} seg={6} p={[0, 0.55, 0.15]} c="#ffe066" o={{ emissive: "#ffd23a", ei: 1.4 }} cast={false} />
    </G>
  );
};
const Arrow: React.FC<{ p: V3; r?: V3; s?: number; c?: string }> = ({ p, r, s = 1, c = "#ff6a1a" }) => (
  <G p={p} r={r} sc={s}><Cyl rt={0.16} h={1.1} p={[0, -0.55, 0]} c={c} seg={6} o={{ emissive: c, ei: 0.9 }} cast={false} /><Cone rad={0.5} h={0.9} seg={6} p={[0, 0.2, 0]} c={c} o={{ emissive: c, ei: 0.9 }} cast={false} /></G>
);
const pad = (x: number, w: number, d = 18): React.ReactNode => <Box s={[w, 0.3, d]} p={[x, 0.15, 0]} c={CONC} cast={false} />;

// ---------------------------------------------------------------- 1. catador, carrinho e o caminhão que enche de ar
const Truck: React.FC<{ t: number }> = ({ t }) => {
  const air = clamp(pk(t, T.ar - 0.9, 0.9), 0, 1.25), full = ease(t, T.caminhao + 0.6, T.so + 0.2), tilt = ease(t, T.aperta - 0.1, T.aperta + 1.0) * (1 - ease(t, T.prensa + 0.6, T.prensa + 1.4));
  const sag = 0.18 * air + spr(t, T.ar + 0.2, 0.12, 5, 16);
  const n = Math.round(24 * full);
  return (
    <G p={[-52, 0, 0]}>
      {/* chassi e rodas */}
      <Box s={[13, 0.9, 5.2]} p={[0, 1.5 - sag, 0]} c="#3a3f47" />
      {[-4.4, -1.2, 4.2].map((x, i) => [-1, 1].map((s) => <G key={`${i}${s}`} p={[x, 1.1 - sag * 0.5, s * 2.7]} r={[0, 0, t * 0.0]}><Cyl rt={1.1} h={0.8} r={[PI / 2, 0, 0]} c="#1b1d22" seg={12} sc={[1 + 0.1 * air, 1 - 0.12 * air, 1]} /><Cyl rt={0.5} h={0.85} r={[PI / 2, 0, 0]} c="#c9cfd3" seg={8} /></G>))}
      {/* cabine à esquerda (o caminhão olha para -x) */}
      <G p={[-5.4, 0, 0]}>
        <Box s={[3.6, 3.4, 4.8]} p={[0, 3.0 - sag, 0]} c="#e6322b" />
        <Box s={[0.2, 1.5, 4.0]} p={[-1.85, 3.6 - sag, 0]} c="#bfe6ff" o={{ metal: 0.3, rough: 0.2 }} />
        <Box s={[0.4, 0.5, 4.2]} p={[-1.9, 1.7 - sag, 0]} c="#2b2f36" />
      </G>
      {/* caçamba que tomba para a prensa (dobradiça atrás) */}
      <G p={[6.2, 2.0 - sag, 0]} r={[0, 0, -tilt * 0.62]}>
        <G p={[-6.2, 0, 0]}>
          <Box s={[9, 0.4, 5]} p={[0, 0.2, 0]} c="#c9cfd3" />
          <Box s={[0.4, 3, 5]} p={[-4.4, 1.7, 0]} c="#c9cfd3" /><Box s={[0.4, 3, 5]} p={[4.4, 1.7, 0]} c="#c9cfd3" vis={tilt < 0.2} /><Box s={[9, 3, 0.3]} p={[0, 1.7, -2.5]} c="#c9cfd3" />
          <Glass s={[9, 3, 0.15]} p={[0, 1.7, 2.5]} o={0.18} />
          {Array.from({ length: 24 }, (_, i) => i < n && tilt < 0.4 ? <Crushed key={i} i={i} p={[-3.4 + (i % 6) * 1.35 * (1 + 0.5 * air), 0.8 + Math.floor(i / 6) * 0.65 * (1 + 1.3 * air) + 0.15 * Math.sin(t * 5 + i) * air, -1.5 + ((i * 7) % 4) * 1.0]} sc={pk(t, T.caminhao + 0.5 + i * 0.05, 0.3)} /> : null)}
        </G>
      </G>
      {/* o ar: uma bolha enorme que incha a caçamba com sobra */}
      <G p={[1.8, 4.2 - sag, 0]} vis={air > 0.01}>
        <Sph rad={1} sc={[5.9 * air, 3.3 * air, 3.2 * air]} c="#9fd8ff" o={{ opacity: 0.42, rough: 0.1, emissive: "#6fc0ff", ei: 0.25 }} cast={false} ws={18} hs={12} />
        <Sph rad={1} sc={[4.6 * air, 2.1 * air, 2.4 * air]} p={[0.3, 0.5, 0]} c="#ffffff" o={{ opacity: 0.18 }} cast={false} ws={14} hs={10} />
      </G>
      {air > 0.4 ? Array.from({ length: 7 }, (_, i) => { const u = fract(t * 0.8 + i / 7); return <Sph key={i} rad={0.5 + rnd(i) * 0.4} p={[-2 + i * 1.1 + Math.sin(t * 4 + i) * 0.4, 6 + u * 9, (rnd(i + 3) - 0.5) * 5]} c="#e9f6ff" o={{ opacity: 0.55 * (1 - u) }} cast={false} ws={10} hs={7} sc={air} />; }) : null}
    </G>
  );
};
const Catador: React.FC<{ t: number }> = ({ t }) => {
  const walk = ease(t, T.catador - 0.3, T.caminhao + 0.5), x = lerp(-90, -61, walk), moving = walk > 0.01 && walk < 0.99;
  const pose = poseOf(moving ? "walk" : "pull", t), dump = ease(t, T.caminhao + 0.4, T.caminhao + 1.2);
  const carts = Math.round(14 * (1 - dump));
  return (
    <G>
      {/* a rua */}
      <Box s={[84, 0.12, 10]} p={[-72, 0.06, 9.5]} c="#5d646c" cast={false} /><Box s={[84, 0.13, 0.4]} p={[-72, 0.08, 9.5]} c="#f0d84a" cast={false} />
      {/* lixeira com latinhas e sacos */}
      <G p={[-94, 0, 8]}><Cyl rt={1.8} rb={1.5} h={3.2} p={[0, 1.6, 0]} c="#3f6f8f" seg={12} /><Cyl rt={1.9} h={0.3} p={[0, 3.3, 0]} c="#33566e" seg={12} /></G>
      <Worker p={[x, 0, 5.6]} yaw={PI / 2 - 0.1} pose={pose} t={t} scale={1.25} c={{ skin: "#b9784b", top: "#2fa84f", bottom: "#4a4f6b", hat: "cap", hatC: "#e0262b", boot: "#3a2b24", sleeves: true, scarf: false, mustache: false }} />
      {/* carrinho de mão cheio de latas amassadas e sacos */}
      <G p={[x + 3.2, 0, 5.6]} r={[0, 0, spr(t, T.caminhao + 0.4, 0.05)]}>
        <Box s={[3.6, 0.25, 2.8]} p={[0, 1.3, 0]} c="#3a3f47" /><Box s={[3.6, 1.4, 0.2]} p={[0, 1.9, 1.4]} c="#9aa3ab" /><Box s={[3.6, 1.4, 0.2]} p={[0, 1.9, -1.4]} c="#9aa3ab" /><Box s={[0.2, 1.4, 2.8]} p={[1.8, 1.9, 0]} c="#9aa3ab" />
        <Cyl rt={0.75} h={0.3} r={[PI / 2, 0, 0]} p={[0.9, 0.75, 1.6]} c="#1b1d22" seg={10} /><Cyl rt={0.75} h={0.3} r={[PI / 2, 0, 0]} p={[0.9, 0.75, -1.6]} c="#1b1d22" seg={10} />
        {Array.from({ length: 14 }, (_, i) => i < carts ? <Crushed key={i} i={i + 40} p={[-1.2 + (i % 4) * 0.8, 1.9 + Math.floor(i / 4) * 0.5, -0.9 + (i % 3) * 0.9]} sc={0.8} /> : null)}
        <Box s={[2.2, 1.0, 1.8]} p={[-0.2, 2.9, 0]} c="#2f7fe0" vis={carts > 2} />
      </G>
    </G>
  );
};
// A latinha-heroína: salta da prateleira e cai amassada na rua
const Hero: React.FC<{ t: number }> = ({ t }) => {
  const a = T.viagem + 0.15, u = prog(t, a, a + 1.25);
  if (t < a || t > T.catador + 1.4) return null;
  const x = lerp(-100 + (54 % 20) * 1.9 - 18 + 0.0, -88, u), y = lerp(3.3 * 2 + 0.5, 0.5, u * u) + Math.sin(u * PI) * 7;
  const hit = u >= 1, sq = hit ? Math.max(0.3, 1 - ease(t, a + 1.25, a + 1.4) * 0.72 + spr(t, a + 1.4, 0.2, 8, 24)) : 1;
  const scoop = ease(t, T.catador + 0.1, T.catador + 1.1);
  return <Can p={[lerp(x, -86.5, scoop), y + scoop * 2.2, lerp(0.3, 5.6, hit ? 1 : u * u)]} r={[hit ? 0 : u * 12, 0, hit ? 1.2 : u * 5]} sc={hit ? [1.4 - sq * 0.4, sq, 1.2] : 0.9} paint={PAINT[0]} />;
};

// ---------------------------------------------------------------- 2. prensa: aperta tudo num fardo
const Baler: React.FC<{ t: number }> = ({ t }) => {
  const ram = ease(t, T.aperta + 1.45, T.aperta + 1.85), back = ease(t, T.prensa + 1.0, T.prensa + 1.8);
  const rx = lerp(-4.2, 0.8, ram) - back * 5, sq = ram > 0.98 && back < 0.01 ? spr(t, T.aperta + 1.85, 0.07, 9, 26) : 0;
  const bale = ease(t, T.aperta + 1.9, T.prensa + 1.9), out = ease(t, T.sujeira + 0.8, T.tritura + 0.3);
  const fall = (i: number) => clamp(prog(t, T.aperta + 0.3 + i * 0.1, T.aperta + 1.15 + i * 0.1));
  return (
    <G p={[-34, 0, 0]} sc={[1 - sq * 0.6, 1 + sq * 0.5, 1]}>
      <Box s={[13, 0.5, 8]} p={[0, 0.5, 0]} c={CONC2} />
      {/* caixa de aço com frente de vidro */}
      <Box s={[11, 0.5, 6]} p={[0, 1.0, 0]} c="#2f5f9e" /><Box s={[11, 5.5, 0.5]} p={[0, 3.9, -3]} c="#2f6fb0" /><Box s={[11, 0.8, 6.4]} p={[0, 6.8, 0]} c="#2f6fb0" />
      <Box s={[0.5, 5.5, 6]} p={[5.6, 3.9, 0]} c="#2f6fb0" vis={ram < 0.5 || true} />
      <Glass s={[11, 5.5, 0.15]} p={[0, 3.9, 3]} o={0.2} />
      {/* funil por cima (a boca onde a caçamba despeja) */}
      <Cyl rt={4.8} rb={1.9} h={3.2} seg={4} p={[-3.4, 8.9, 0]} r={[0, PI / 4, 0]} c="#ffd84a" o={{ emissive: "#ffc21a", ei: 0.35 }} />
      {/* pistão que empurra */}
      <G p={[rx - 0.5, 0, 0]}><Box s={[0.7, 5.0, 5.6]} p={[0, 3.6, 0]} c="#e0262b" /><Box s={[4.0, 1.2, 1.2]} p={[-2.2, 3.6, 0]} c={STEEL} /></G>
      {/* latas amassadas que caem do caminhão */}
      {Array.from({ length: 16 }, (_, i) => { const u = fall(i); return u > 0 && u < 1 ? <Crushed key={i} i={i + 5} p={[lerp(-7.4, -3.4 + (rnd(i) - 0.5) * 3, u), lerp(6.5, 1.9, u * u) + Math.sin(u * PI) * 3, lerp(0, (rnd(i + 1) - 0.5) * 3, u)]} /> : null; })}
      {/* fardo pronto: pacote de latas amassadas com ferro, plástico e sujeira à mostra */}
      <G p={[lerp(2.2, 14, out), 1.6, 0]} sc={[Math.max(0.01, 0.4 + bale * 0.6), Math.max(0.01, 0.25 + bale * 0.75), Math.max(0.01, 0.9 + 0.1 * bale)]} vis={bale > 0.01 && t < T.tritura + 0.35}>
        <Box s={[4.2, 3.4, 3.4]} p={[0, 1.7, 0]} c="#8f9aa4" o={{ metal: 0.4 }} />
        {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[4.25, 0.35, 3.45]} p={[0, 0.5 + i * 0.4, 0]} c={PAINT[i % 8]} cast={false} />)}
        {[-1.2, 1.2].map((x) => <Box key={x} s={[0.18, 3.5, 3.55]} p={[x, 1.7, 0]} c="#2b2f36" />)}
        <Cyl rt={0.14} h={3.4} r={[0, 0, PI / 2 - 0.3]} p={[0.2, 2.9 * pk(t, T.ferro, 0.3) + 0.2, 1.75]} c="#4a4f55" seg={6} vis={t > T.ferro - 0.3} sc={pk(t, T.ferro, 0.3)} />
        <Cyl rt={0.45} h={1.8} r={[0, 0, PI / 2 + 0.2]} p={[-0.6, 3.5, 1.7]} c="#7cd0ff" seg={10} o={{ opacity: 0.85 }} vis={t > T.plastico - 0.1} sc={pk(t, T.plastico, 0.3)} />
        <Sph rad={0.8} p={[-1.4, 3.5, -1.1]} c="#6b4a28" sc={[pk(t, T.sujeira, 0.3), 0.6 * pk(t, T.sujeira, 0.3), pk(t, T.sujeira, 0.3)]} ws={8} hs={6} vis={t > T.sujeira - 0.1} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- 3. trituradora com ímã
const Shredder: React.FC<{ t: number }> = ({ t }) => {
  const run = ease(t, T.tritura + 0.8, T.cacos), mag = ease(t, T.iman + 0.2, T.iman + 0.55), release = 0;
  const iron = [0, 1, 2, 3, 4, 5];
  const chips = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ c: PAINT[i % 8], y: rnd(i), z: (rnd(i + 3) - 0.5) * 2.4, o: rnd(i + 8) })), []);
  const dropIn = (i: number) => ease(t, T.cacos + 0.1 + i * 0.05, T.cacos + 1.0 + i * 0.05);
  return (
    <G p={[0, 0, 0]}>
      <Box s={[14, 0.5, 10]} p={[0, 0.3, 0]} c={CONC2} />
      {/* casco azul com frente de vidro e dois tambores com dentes */}
      <Box s={[10, 6.5, 0.5]} p={[0, 4.2, -3.4]} c="#2f7fe0" /><Box s={[0.5, 6.5, 7]} p={[-5, 4.2, 0]} c="#2f7fe0" /><Box s={[0.5, 6.5, 7]} p={[5, 4.2, 0]} c="#2f7fe0" /><Box s={[10.4, 0.6, 7]} p={[0, 7.6, 0]} c="#256fc8" /><Box s={[10, 1.0, 7]} p={[0, 1.2, 0]} c="#256fc8" />
      <Glass s={[10, 6.5, 0.15]} p={[0, 4.2, 3.4]} o={0.16} />
      {[-1.9, 1.9].map((x, k) => (
        <G key={k} p={[x, 3.6, 0]} r={[0, 0, (k ? -1 : 1) * t * (0.8 + 7 * run)]}>
          <Cyl rt={1.5} h={6} r={[PI / 2, 0, 0]} c="#59636d" seg={12} />
          {Array.from({ length: 8 }, (_, j) => <Box key={j} s={[0.5, 0.9, 5.6]} p={[Math.cos(j * PI / 4) * 1.9, Math.sin(j * PI / 4) * 1.9, 0]} r={[0, 0, j * PI / 4]} c="#e7b312" />)}
        </G>
      ))}
      <Cyl rt={5.4} rb={2.4} h={3.2} seg={4} p={[0, 9.4, 0]} r={[0, PI / 4, 0]} c="#ffcf4a" o={{ emissive: "#ffb21a", ei: 0.35 }} />
      {/* fardo que chega e cacos que saem pela calha */}
      <Box s={[3.2, 0.6, 3.4]} p={[0, 0.0, 0]} c="#2f7fe0" vis={false} />
      <G p={[0, 0, 0]} vis={t > T.tritura + 0.3 && t < T.cacos + 0.6}>
        <Box s={[4.2, 3.4, 3.4]} p={[lerp(-20, 0, ease(t, T.tritura + 0.3, T.tritura + 1.4)), lerp(3.3, 9.2, ease(t, T.tritura + 1.2, T.tritura + 1.6)) - ease(t, T.tritura + 1.6, T.cacos + 0.4) * 5.5, 0]} sc={1 - ease(t, T.tritura + 1.1, T.cacos + 0.3) * 0.95} c="#8f9aa4" o={{ metal: 0.4 }} />
      </G>
      <Pipe a={[5, 1.6, 0]} b={[8, 1.9, 0]} rad={0.2} c={STEEL} />
      <Belt a={-27} b={-5} t={t} y={1.3} w={3.4} legs={false} />
      <Belt a={5} b={28} t={t} y={1.9} w={3.4} />
      {/* cacos pintados na esteira (somem no forno) */}
      {chips.map((q, i) => { const u = dropIn(i % 24), x = 6 + ((t - T.cacos - i * 0.07) * 3.2 % 22 + 22) % 22; return t > T.cacos + 0.1 && i < 52 ? <Box key={i} s={[0.7, 0.18, 0.55]} p={[x, 2.4 + 0.5 * (1 - u) + (x < 10 ? 2 * (1 - u) : 0), q.z]} r={[q.o * 4, q.o * 6, 0]} sc={u} c={q.c} cast={false} /> : null; })}
      {/* ferro na esteira, que sobe para o ímã */}
      {iron.map((i) => { const u = ease(t, T.iman + 0.35 + i * 0.05, T.iman + 0.7 + i * 0.05), p0: V3 = [8.5 + i * 1.2, 2.4, (rnd(i) - 0.5) * 2.2], p1: V3 = [11 + (i % 3) * 0.7 - 0.6, 7.2 - (i % 2) * 0.5, (rnd(i + 2) - 0.5) * 1.4];
        return t > T.cacos + 0.3 ? <Box key={i} s={[0.28, 0.28, 1.4 + (i % 3) * 0.3]} p={[lerp(p0[0], p1[0], outBack(u)), lerp(p0[1], p1[1], outBack(u)) + (u > 0.99 ? 0.12 * Math.sin(t * 20 + i) : 0), lerp(p0[2], p1[2], u)]} r={[0, i, u * 3]} c="#3b4047" o={{ metal: 0.6 }} /> : null; })}
      {/* o prego que é puxado de dentro da trituradora, atravessando o quadro */}
      {t > T.iman + 0.1 && t < T.iman + 0.8 ? (() => { const u = prog(t, T.iman + 0.2, T.iman + 0.55); return <G p={[lerp(1, 11, u), lerp(5.4, 7.6, u) + Math.sin(u * PI) * 3.5, lerp(3.6, 0, u)]} r={[0, 0, u * 8 + 0.3]}><Cyl rt={0.14} h={2.6} c="#4a4f55" seg={6} /><Cyl rt={0.36} h={0.16} p={[0, 1.3, 0]} c="#4a4f55" seg={8} /></G>; })() : null}
      {/* ímã vermelho em ferradura */}
      <G p={[11, 8.4 + 0.18 * Math.sin(t * 4) + 0.5 * spr(t, T.iman + 0.55, 0.5, 6, 24), 0]}>
        <Box s={[0.8, 3.0, 0.8]} p={[0, 2.4, 0]} c={STEEL} />
        <Box s={[3.6, 1.0, 1.6]} p={[0, 0.6, 0]} c="#e0262b" /><Box s={[1.0, 1.0, 1.6]} p={[-1.3, -0.2, 0]} c="#e0262b" /><Box s={[1.0, 1.0, 1.6]} p={[1.3, -0.2, 0]} c="#e0262b" />
        <Box s={[1.0, 0.35, 1.62]} p={[-1.3, -0.85, 0]} c={SILVER} /><Box s={[1.0, 0.35, 1.62]} p={[1.3, -0.85, 0]} c={SILVER} />
        {mag > 0.01 ? [0, 1, 2].map((k) => <Cyl key={k} rt={0.5 + k * 0.5} h={0.05} p={[0, -1.1 - k * 0.1, 0]} c="#4ac8ff" o={{ opacity: 0.45 * (1 - fract(t * 1.6 + k / 3)), emissive: "#4ac8ff", ei: 0.9 }} sc={[1 + fract(t * 1.6 + k / 3), 1, 1 + fract(t * 1.6 + k / 3)]} cast={false} seg={14} />) : null}
      </G>
      {/* o fogo que estraga o metal pintado */}
      <G p={[18, 2.0, 1.2]} vis={t > T.queimaTinta - 0.3 && t < T.z3 + 0.2} sc={pk(t, T.queimaTinta - 0.3, 0.4)}>
        <Flame t={t} p={[0, 0, 0]} s={0.9} ph={3} />
        {[0, 1, 2, 3, 4].map((i) => <Sph key={i} rad={0.5} p={[-2 + i * 1.0, 0.5 + 0.2 * Math.sin(t * 5 + i), (rnd(i) - 0.5) * 1.6]} c={mixc("#6b4a28", "#2a2320", ease(t, T.queimaTinta + 0.4, T.queimaTinta + 1.8))} sc={[1, 0.55, 1]} ws={8} hs={6} cast={false} />)}
        <Puffs t={t} p={[0, 2.6, 0]} n={6} period={1.2} rise={4} size={1.0} c="#33363b" on={ease(t, T.queimaTinta + 0.2, T.queimaTinta + 1.0)} drift={[0.5, 0, 0]} />
      </G>
      {/* poeira quando tritura */}
      <Puffs t={t} p={[0, 8.6, 0]} n={7} period={1.0} rise={3} size={0.9} c="#e9edf0" on={pw(t, T.tritura + 0.9, T.trit + 1.5)} drift={[1, 0, 0]} />
    </G>
  );
};

// ---------------------------------------------------------------- 4. forno descascador: a tinta queima e o calor esquenta os cacos que vêm atrás
export const KILN_A = 28, KILN_B = 58;
const Kiln: React.FC<{ t: number }> = ({ t }) => {
  const heat = ease(t, T.tintaQ, T.calor + 0.8), fuel = ease(t, T.combust - 0.2, T.combust + 0.5), burn = ease(t, T.forno, T.forno + 1.2);
  const chips = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ c: PAINT[i % 8], z: (rnd(i + 3) - 0.5) * 2.6, o: rnd(i + 8) })), []);
  const midX = 44, L = KILN_B - KILN_A, cx = (KILN_A + KILN_B) / 2;
  return (
    <G>
      <Box s={[L + 6, 0.5, 11]} p={[cx, 0.4, 0]} c={CONC2} />
      {/* corte do forno: base de tijolo, fundo escuro, chão que brilha, frente de vidro, costelas de aço */}
      <Box s={[L, 1.4, 6.6]} p={[cx, 1.1, 0]} c="#9b4a38" />
      <Box s={[L, 5.8, 0.5]} p={[cx, 4.7, -3.2]} c="#4a2d28" o={{ emissive: "#ff4a10", ei: 0.12 * burn }} />
      <Box s={[L - 1, 0.2, 5.8]} p={[cx, 1.9, 0]} c="#ff7a1a" o={{ emissive: "#ff4a10", ei: 0.9 * burn }} cast={false} />
      <Glass s={[L, 5.8, 0.15]} p={[cx, 4.7, 3.2]} o={0.1} />
      {Array.from({ length: 7 }, (_, i) => <G key={i} p={[KILN_A + 0.5 + i * (L - 1) / 6, 0, 0]}><Box s={[0.7, 6.4, 0.7]} p={[0, 4.9, -3.2]} c="#6a3a30" /><Box s={[0.7, 0.7, 6.9]} p={[0, 8.0, 0]} c="#6a3a30" /><Box s={[0.7, 6.4, 0.7]} p={[0, 4.9, 3.2]} c="#6a3a30" /></G>)}
      <Belt a={KILN_A - 5} b={KILN_B + 4} t={t} y={2.3} w={3.0} legs={false} spd={2.2} />
      {/* chaminé */}
      <Cyl rt={1.3} rb={1.7} h={9} p={[KILN_B - 5, 11, -4.4]} c="#8c4332" seg={12} />
      <Puffs t={t} p={[KILN_B - 5, 15.8, -4.4]} n={8} period={2.4} rise={7} size={1.5} c="#6a6f75" on={heat * 0.9} drift={[2.5, 0, 0]} />
      {/* chamas do queimador dos dois lados da esteira */}
      {Array.from({ length: 9 }, (_, i) => <Flame key={i} t={t} p={[KILN_A + 4 + i * 3.1, 1.9, i % 2 ? 2.4 : -2.4]} s={(0.55 + 0.45 * burn + 0.45 * fuel) * 0.85 * burn} ph={i} />)}
      {/* cacos andando: pintados na entrada, brilhando no meio, prateados na saída */}
      {chips.map((q, i) => { const x = KILN_A - 4 + (((t - T.cacos) * 2.2 + i * 0.7) % (L + 6) + (L + 6)) % (L + 6), k = (x - KILN_A) / L, glow = clamp(1 - Math.abs(k - 0.55) * 3.2) * heat, col = k < 0.25 ? q.c : mixc(mixc(q.c, "#ffffff", 0.5), SILVER, clamp((k - 0.2) * 4));
        return t > T.cacos ? <Box key={i} s={[0.7, 0.18, 0.55]} p={[x, 2.75 + 0.09 * Math.sin(t * 6 + i), q.z]} r={[q.o * 4, q.o * 6, 0]} c={glow > 0.3 ? mixc(col, "#ff7a2a", glow * 0.8) : col} o={glow > 0.3 ? { emissive: "#ff5a14", ei: glow * 0.8 } : undefined} cast={false} /> : null; })}
      {/* fumaça da tinta que vira setas de calor, apontando de volta para os cacos que entram */}
      <Puffs t={t} p={[midX, 3.4, 0.4]} n={6} period={1.6} rise={2.8} size={0.9} c="#3d4147" on={ease(t, T.tintaQ, T.tintaQ + 0.6) * (1 - ease(t, T.calor + 0.5, T.calor + 1.4))} drift={[0, 0, 0]} />
      {Array.from({ length: 9 }, (_, i) => { const u = fract(t * 0.55 + i / 9), row = i % 3, on = ease(t, T.calor - 0.1, T.calor + 0.5), pulse = 1 + 0.35 * fuel * Math.sin(t * 14 + i), x = lerp(midX + 6, KILN_A + 2, u);
        return <Arrow key={i} p={[x, 4.0 + row * 0.9 + 0.5 * Math.sin(u * PI), -1.4 + row * 1.4]} r={[0, 0, PI / 2]} s={on * pulse * (0.7 + 0.7 * Math.sin(u * PI))} c={fuel > 0.3 ? "#ffc21a" : "#ff6a1a"} />; })}
      {/* gotas de tinta viram combustível: caem na chama e ela cresce */}
      {fuel > 0.01 && fuel < 1.01 ? Array.from({ length: 6 }, (_, i) => { const u = fract(t * 1.3 + i / 6); return <Sph key={i} rad={0.32} p={[midX - 4 + i * 1.6, 5.4 - u * 3.2, 0.3]} c={PAINT[i]} cast={false} ws={8} hs={6} sc={fuel} o={{ emissive: PAINT[i], ei: 0.5 }} />; }) : null}
      <Sparks t={t} p={[midX, 2.4, 2.4]} n={14} on={fuel * 0.9} spread={2.5} />
    </G>
  );
};

// ---------------------------------------------------------------- 5. forno de fusão e o lingote
export const FURN: V3 = [72, 0, 0];
const SP = 84.6, ING = 88.5; // bico do forno; ponta esquerda do lingote
const Furnace: React.FC<{ t: number }> = ({ t }) => {
  const feed = ease(t, T.derretem - 0.2, T.derretem + 1.6), glow = ease(t, T.derretem + 0.6, T.fusao), pour = ease(t, T.lingote - 0.4, T.lingote + 0.6) * (1 - ease(t, T.lingote + 2.6, T.lingote + 3.2));
  const tip = 0.5 * ease(t, T.lingote - 0.5, T.lingote + 0.4) * (1 - ease(t, T.lingote + 2.5, T.lingote + 3.3));
  const grow = ease(t, T.lingote + 0.1, T.lingote + 2.8), land = pk(t, T.lingote + 2.6, 0.5) - 1 + 1, cool = ease(t, T.lingote + 2.5, T.tijolao + 2.4);
  return (
    <G>
      <Box s={[48, 0.5, 18]} p={[84, 0.4, 0]} c={CONC2} />
      {/* rampa que leva os cacos limpos até a boca do forno */}
      <Belt a={KILN_B + 2} b={62} t={t} y={2.3} w={3.0} legs={false} />
      <Pipe a={[61, 2.5, 0]} b={[75, 11.2, 0]} rad={1.5} c="#3a3f47" />
      {t > T.derretem - 0.4 ? Array.from({ length: 12 }, (_, i) => { const u = fract(t * 0.35 + i / 12); return <Box key={i} s={[0.7, 0.18, 0.55]} p={[lerp(61, 75, u), lerp(3.2, 12.2, u), (rnd(i) - 0.5) * 2.2]} r={[rnd(i) * 3, rnd(i + 4) * 5, 0]} c={SILVER} o={{ metal: 0.4 }} cast={false} />; }) : null}
      {/* forno: barril de tijolo com boca de fogo e bico de vazamento */}
      <G p={[FURN[0] + 4, 0, 0]} sc={[1 + spr(t, T.fusao, 0.03, 6, 20), 1 + spr(t, T.fusao, 0.05, 6, 20), 1]}>
        <G r={[0, 0, -tip]} p={[0, 5.5, 0]}>
          <Cyl rt={6.4} rb={5.8} h={9} p={[0, 0, 0]} c="#b0563f" seg={18} />
          <Cyl rt={6.6} h={0.8} p={[0, 4.4, 0]} c="#6a6f75" seg={18} /><Cyl rt={6.6} h={0.6} p={[0, -1.5, 0]} c="#6a6f75" seg={18} />
          <Cyl rt={5.0} h={0.3} p={[0, 4.6, 0]} c={mixc("#4a3a30", "#ff8a1a", glow)} o={{ emissive: "#ff5a14", ei: 0.2 + 1.0 * glow }} seg={18} />
          <Box s={[2.6, 2.2, 1.4]} p={[0, -0.4, 6.0]} c={mixc("#3a2a24", "#ffb21a", glow)} o={{ emissive: "#ff6a14", ei: 0.1 + 1.3 * glow }} />
          <Box s={[1.4, 1.0, 2.8]} p={[6.6, 3.2, 0]} c={mixc("#6a6f75", "#ff8a1a", pour)} o={{ emissive: "#ff5a14", ei: pour }} />
        </G>
        <Box s={[10, 2.0, 10]} p={[0, 1.0, 0]} c="#6a6f75" />
        {t > T.derretem && t < T.fusao + 2 ? <Flame t={t} p={[0, 9.8, 0]} s={1.4 * (feed + 0.2)} ph={2} /> : null}
        <Puffs t={t} p={[0, 10, 0]} n={7} period={2} rise={6} size={1.6} c="#7a7f86" on={glow * 0.8} drift={[1, 0, 0]} />
      </G>
      <Sparks t={t} p={[FURN[0] + 4, 10, 0]} n={20} on={feed * (1 - ease(t, T.lingote, T.lingote + 1)) + pour * 0.0} spread={4} />
      {/* canal de vazamento e molde: o lingote cresce a partir da ponta esquerda */}
      <Pipe a={[SP - 0.5, 3.4, 0]} b={[ING + 1, 3.0, 0]} rad={0.45} c={mixc("#8a8f95", "#ffb21a", pour)} o={{ emissive: "#ff6a14", ei: pour * 1.2 }} />
      {pour > 0.01 ? <Cyl rt={0.4} h={2.4} p={[ING + 1, 1.8, 0]} c="#ffc21a" o={{ emissive: "#ff8a14", ei: 1.4 }} cast={false} seg={8} sc={[pour, 1, pour]} /> : null}
      <Sparks t={t} p={[ING + 1, 2.0, 0]} n={18} on={pour} spread={3.2} c="#ffe066" />
      <Box s={[22, 1.4, 9]} p={[ING + 9.5, 0.9, 0]} c="#59636d" />
      {/* o lingote (um tijolão de metal) */}
      <G p={[ING, 1.6, 0]} sc={[Math.max(0.01, grow), 1 - 0.12 * spr(t, T.lingote + 2.6, 1, 6, 20), 1]} vis={grow > 0.01 && t < T.rolos + 0.15}>
        <Box s={[19, 5.2, 7.6]} p={[9.5, 2.6 + spr(t, T.lingote + 2.8, 0.6, 5, 17), 0]} c={mixc("#ff9a1a", "#9aa3ab", cool)} o={{ metal: 0.4 * cool, emissive: "#ff5a14", ei: 1.1 * (1 - cool) }} />
      </G>
      <Can p={[ING + 6, 0.3, 8.2]} sc={1.0} vis={t > T.tijolao - 0.2} paint={PAINT[1]} r={[0, 0.6, 0]} />
    </G>
  );
};

// ---------------------------------------------------------------- 6. laminador: o lingote vira chapa fininha e enrolada
export const MILL_X = 118;
const Mill: React.FC<{ t: number }> = ({ t }) => {
  const e = ease(t, T.rolos + 0.1, T.rolos + 3.3), tail = ease(t, T.rolos + 1.4, T.lamin + 0.6), xf = lerp(108, 142, e), xt = lerp(ING, 134, tail);
  const segs: [number, number, number][] = [[-999, MILL_X - 9, 5.2], [MILL_X - 9, MILL_X, 3.0], [MILL_X, MILL_X + 9, 1.4], [MILL_X + 9, 999, 0.22]];
  const coilR = 0.9 + 2.6 * ease(t, T.rolos + 1.6, T.lamin + 0.4);
  return (
    <G>
      <Box s={[50, 0.5, 18]} p={[132, 0.4, 0]} c={CONC2} />
      {/* mesa de rolos */}
      {Array.from({ length: 10 }, (_, i) => <Cyl key={i} rt={0.5} h={7} r={[PI / 2, 0, 0]} p={[110 + i * 3, 1.0, 0]} c={STEEL} seg={8} />)}
      {segs.map(([a, b, th], k) => { const lo = Math.max(a, xt), hi = Math.min(b, xf); return hi - lo > 0.05 && t > T.rolos - 0.2 ? <Box key={k} s={[hi - lo, th, k === 3 ? 6.4 : 7]} p={[(lo + hi) / 2, 1.6 + th / 2, 0]} c={mixc("#ffa43a", "#c7cfd6", clamp(0.4 + k * 0.3))} o={{ metal: 0.45, emissive: "#ff5a14", ei: Math.max(0, 0.7 - k * 0.3) }} /> : null; })}
      {/* três cadeiras de rolos, cada uma aperta mais */}
      {[MILL_X - 9, MILL_X, MILL_X + 9].map((x, k) => {
        const gap = [2.6, 1.3, 0.3][k], s = spr(t, T.rolos + 0.9 + k * 1.1, 0.2, 7, 22) * 0.25;
        return (
          <G key={k} p={[x, 0, 0]} sc={[1, 1 + s, 1]}>
            {[-4.4, 4.4].map((z) => <Box key={z} s={[1.6, 12, 0.9]} p={[0, 6.6, z]} c="#e0262b" />)}
            <Box s={[2.4, 1.2, 9.6]} p={[0, 12.6, 0]} c="#c01d22" />
            <G p={[0, 1.8 + 2.5 + gap / 2 + 1.5, 0]} r={[0, 0, -t * 4]}><Cyl rt={1.9} h={7.4} r={[PI / 2, 0, 0]} c="#aab4be" seg={14} o={{ metal: 0.5, rough: 0.3 }} /></G>
            <G p={[0, 1.8 + 2.5 - gap / 2 - 1.2 - 1.4 + 0.3, 0]} r={[0, 0, t * 4]}><Cyl rt={1.9} h={7.4} r={[PI / 2, 0, 0]} c="#aab4be" seg={14} o={{ metal: 0.5, rough: 0.3 }} /></G>
          </G>
        );
      })}
      <Sparks t={t} p={[MILL_X - 9, 4.5, 4]} n={14} on={pw(t, T.rolos + 0.6, T.rolos + 3.2)} spread={3} />
      {/* bobina: a chapa fininha enrola */}
      <G p={[142, 0.2 + coilR + 1.2, 0]} r={[0, 0, -t * 3]} vis={t > T.rolos + 1.4}>
        <Cyl rt={coilR} h={6.4} r={[PI / 2, 0, 0]} c="#c7cfd6" seg={20} o={{ metal: 0.5, rough: 0.3 }} />
        <Cyl rt={0.7} h={6.7} r={[PI / 2, 0, 0]} c="#59636d" seg={10} />
      </G>
      <Box s={[3, 1.2, 8]} p={[142, 0.9, 0]} c="#59636d" />
    </G>
  );
};

// ---------------------------------------------------------------- 7. linha de latas: disco → copo → lata esticada → pintada → cheia → prateleira
const LX = [152, 155, 160, 166, 172, 178, 184], LS = [0, 1.0, 2.6, 4.4, 6.4, 8.2, 9.4];
const NC = 10, GAP = 0.36;
const SH_X = 202, SH_Y = 3.5; // prateleira B (cada nível a cada 3,3)
const CanLine: React.FC<{ t: number }> = ({ t }) => {
  const press = (t0: number) => spr(t, t0, 0.18, 7, 26);
  const strip = ease(t, T.discos - 0.6, T.discos + 0.2);
  return (
    <G>
      <Box s={[44, 0.5, 18]} p={[168, 0.4, 0]} c={CONC2} />
      <Belt a={150} b={188} t={t} y={1.3} w={3.2} legs={true} spd={3.2} />
      {/* faixa de chapa vinda da bobina entra na prensa de discos */}
      <Box s={[strip * 5 + 0.01, 0.12, 5]} p={[146 + (strip * 5) / 2 + 3, 2.1, 0]} c="#c7cfd6" o={{ metal: 0.5 }} vis={t > T.discos - 0.6} />
      {/* prensa de corte: martelo desce e sai o disco */}
      <G p={[155, 0, 0]}><Box s={[4, 11, 0.8]} p={[0, 5.5, -3.6]} c="#2f6fb0" /><Box s={[4, 1.6, 7.6]} p={[0, 10.4, 0]} c="#2f6fb0" />
        <G p={[0, 7.4 - 3.0 * Math.max(0, Math.sin(Math.max(0, t - T.discos) * 3.2 * PI) ** 4) * pw(t, T.discos - 0.3, T.molde), 0]}><Cyl rt={1.3} h={2.4} c={STEEL} seg={14} /><Cyl rt={0.35} h={3.6} p={[0, 2.8, 0]} c={STEEL} seg={8} /></G></G>
      {/* prensa do copo */}
      <G p={[160, 0, 0]}><Box s={[4, 11, 0.8]} p={[0, 5.5, -3.6]} c="#c01d22" /><Box s={[4, 1.6, 7.6]} p={[0, 10.4, 0]} c="#e0262b" />
        <G p={[0, 7.6 - 3.4 * Math.max(0, Math.sin(Math.max(0, t - T.molde) * 2.6 * PI) ** 4) * pw(t, T.molde - 0.3, T.esticam + 2), 0]}><Cyl rt={0.9} h={3} c={SILVER} seg={14} o={{ metal: 0.6 }} /><Cyl rt={0.35} h={3.4} p={[0, 3, 0]} c={STEEL} seg={8} /></G>
        <Cyl rt={1.6} rb={1.9} h={1.3} p={[0, 2.2, 0]} c={STEEL} seg={14} /></G>
      {/* anéis que esticam a parede */}
      <G p={[166, 0, 0]}><Box s={[5, 11, 0.8]} p={[0, 5.5, -3.6]} c="#d09a0a" /><Box s={[5, 1.6, 7.6]} p={[0, 10.4, 0]} c="#e7b312" />
        {[0, 1, 2].map((k) => <Cyl key={k} rt={1.7 - k * 0.1} h={0.55} p={[k * 0.6 - 0.6, 3.2, 0]} r={[0, 0, PI / 2]} c="#59636d" seg={14} o={{ metal: 0.5 }} />)}
        <G p={[0, 7.8 - 3.0 * Math.max(0, Math.sin(Math.max(0, t - T.esticam) * 3 * PI) ** 4) * pw(t, T.esticam - 0.3, T.pintam), 0]}><Cyl rt={0.75} h={3.4} c={STEEL} seg={10} /></G></G>
      {/* cabine de tinta: sopra spray colorido */}
      <G p={[172, 0, 0]}>
        <Box s={[5.2, 8, 0.5]} p={[0, 4.6, -3.6]} c="#7a3fd0" /><Box s={[5.8, 0.7, 7.6]} p={[0, 8.9, 0]} c="#6a2fc0" /><Glass s={[5.2, 8, 0.15]} p={[0, 4.6, 3.6]} o={0.12} />
        {Array.from({ length: 16 }, (_, i) => { const u = fract(t * 2.2 + rnd(i)); return <Sph key={i} rad={0.22} p={[(rnd(i + 1) - 0.5) * 3.4, 8 - u * 5.6, 0.2 + (rnd(i + 2) - 0.5) * 2.6]} c={PAINT[i % 6]} o={{ emissive: PAINT[i % 6], ei: 0.5, opacity: 0.85 }} cast={false} sc={pw(t, T.pintam - 1.4, T.pintam + 1.5) * 1} ws={6} hs={4} />; })}
      </G>
      {/* bico de enchimento */}
      <G p={[178, 0, 0]}><Box s={[3.6, 11, 0.8]} p={[0, 5.5, -3.6]} c="#19a0a0" /><Box s={[3.6, 1.6, 7.6]} p={[0, 10.4, 0]} c="#19a0a0" />
        <Cyl rt={0.4} h={4.2} p={[0, 7.6, 0]} c={SILVER} seg={8} />
        <Cyl rt={0.2} h={3.6 * pw(t, T.pintam + 0.6, T.pintam + 2.2) + 0.01} p={[0, 5.6, 0]} c="#4ab8ff" seg={6} o={{ emissive: "#4ab8ff", ei: 0.5 }} cast={false} /></G>
      {/* as latas: cada uma anda pela linha e muda de forma */}
      {Array.from({ length: NC }, (_, i) => {
        const s = t - (T.discos + 0.55 + i * GAP) + 0.0, lane = (i % 2 ? 1 : -1) * 0.7;
        if (s < 0.5) return null;
        const seg = LS.findIndex((v, k) => s >= v && s < (LS[k + 1] ?? 99)), k = seg < 0 ? LS.length - 1 : seg;
        const u = k < LS.length - 1 ? ease(s, LS[k], LS[k + 1]) : 1;
        const x = k < LS.length - 1 ? lerp(LX[k], LX[k + 1], u) : LX[LX.length - 1];
        const pop0 = pk(t, T.discos + 0.55 + i * GAP + 0.5, 0.3);
        // forma ao longo do tempo da própria lata
        const cup = ease(s, 2.6, 3.6), iron = ease(s, 4.6, 6.0), paint = ease(s, 6.1, 7.1), lid = pk(s, 8.4, 0.3);
        const h = lerp(0.12, 0.9, cup) + (2.2 - 0.9) * iron, rad = lerp(1.1, 0.85, cup * 0.8 + iron * 0.2);
        const col = mixc("#c7cfd6", PAINT[i % 6], paint);
        // voo para a prateleira
        const fl = prog(t, T.discos + 0.55 + i * GAP + LS[6], T.discos + 0.55 + i * GAP + LS[6] + 2.0), tgt: V3 = [SH_X - 10.5 + (i % 10) * 2.1, SH_Y + 0.3, 0.2];
        const fx = lerp(184, tgt[0], fl), fy = lerp(1.9, tgt[1], fl) + Math.sin(fl * PI) * 9, fz = lerp(lane, tgt[2], fl);
        const landed = fl >= 1, bounce = landed ? Math.max(0, 0.45 * Math.exp(-6 * (t - (T.discos + 0.55 + i * GAP + LS[6] + 2.0))) * Math.abs(Math.sin(18 * (t - (T.discos + 0.55 + i * GAP + LS[6] + 2.0))))) : 0;
        const flying = fl > 0;
        return <Can key={i} p={flying ? [fx, fy + bounce + (landed && t > T.agoraSim ? 1.1 * Math.max(0, Math.sin((t - T.agoraSim) * 7 + i * 0.7)) ** 2 : 0), fz] : [x, 1.6 + (k >= 2 && k <= 3 ? 0.0 : 0), lane]} r={flying && !landed ? [fl * 9, 0, fl * 6] : [0, 0, 0]} sc={flying ? 0.9 : [pop0, pop0, pop0]} paint={col} h={h} rad={rad} lid={lid > 0.05 || s > 8.5} vis />;
      })}
    </G>
  );
};
const ShelfB: React.FC<{ t: number }> = ({ t }) => (
  <Shelf p={[SH_X, 0, 0]} w={26} rows={3} shelfH={3.3} awning>
    {Array.from({ length: 9 }, (_, i) => <Box key={i} s={[1.6, 2.2, 1.4]} p={[-11 + (i % 9) * 2.6, 3.3 + 1.35, -1.6]} c={["#f4b8c8", "#b8d8f4", "#f4e7b0"][i % 3]} />)}
  </Shelf>
);

// ---------------------------------------------------------------- mundo
export const World: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Ground g={GROUND} />
      <Hills c={["#6fbe58", "#7ccb62"]} z={-110} n={24} x0={-140} flat={0.6} />
      <Clouds t={t} n={9} y={34} />
      <Trees spots={[[-70, 0, -22], [-104, 0, 20], [-120, 0, -16], [-20, 0, -22], [14, 0, 20], [60, 0, -18], [96, 0, 22], [130, 0, -22], [186, 0, 22], [226, 0, -18], [-48, 0, 24], [64, 0, 24], [150, 0, 24]]} />
      <ShelfWall t={t} />
      <Hero t={t} />
      <Catador t={t} />
      <Truck t={t} />
      {pad(-34, 14)}
      <Baler t={t} />
      <Shredder t={t} />
      <Kiln t={t} />
      <Furnace t={t} />
      <Mill t={t} />
      <CanLine t={t} />
      <ShelfB t={t} />
    </>
  );
};
