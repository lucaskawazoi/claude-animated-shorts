// Mundo do E3: o Coliseu de brinquedo no vale entre as colinas de Roma. Tudo é função do tempo t (sem estado).
// Planta elíptica no centro (0,0,0): fachada A×B = 13×10,5; arena a×b = 4,6×3,7 a y=1,4 (pódio); topo da fachada y=12.
// Ordem: lago de Nero → esvazia → anel de concreto → pilares e 3 andares de arcos + ático → público → velário → hipogeu → ruína de hoje.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, fract, lerp, mat, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Hills, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const A = 13, B = 10.5, AR = 4.6, BR = 3.7, FLOOR = 1.4, TOP = 12;
const TRAV = "#eadcc0", TRAV2 = "#d8c7a4";
const GROUND: GroundPal = { base: "#8fcf55", patch: ["#84c84c", "#9bd664", "#7fbf48"], blade: "#5aa832", flowers: ["#ffffff", "#ffe14a"], x: [-80, 80], z: [-60, 60], nBlades: 380 };
const ell = (rx: number, rz: number, a: number, y = 0): V3 => [rx * Math.cos(a), y, rz * Math.sin(a)];

// ---------------------------------------------------------------- estados por tempo
export const built = (t: number) => t < T.roma - 0.12;            // gancho: o Coliseu pronto, com público
const ruin = (t: number) => t > T.hoy - 0.1;                        // hoje: falta mais de meia fachada
const lakeAt = (t: number) => (built(t) ? 0 : 1 - ease(t, T.vacian, T.llenan + 0.2));
const ringAt = (t: number) => (built(t) ? 1 : ease(t, T.llenan, T.cimientos));
const piersAt = (t: number) => (built(t) ? 1 : ease(t, T.pilares - 0.1, T.pilares + 0.9));
const tierAt = (t: number, k: number) => (built(t) ? 1 : ease(t, T.arcos - 0.4 + k * 0.45, T.arcos + 0.2 + k * 0.45));
const seatsAt = (t: number) => (built(t) || ruin(t) ? 0 : 0) + (built(t) ? 1 : ease(t, T.vomitorios - 0.4, T.p4));
const sailAt = (t: number) => (ruin(t) ? 0 : ease(t, T.toldo, T.esteVelario));
const pitAt = (t: number) => (ruin(t) ? 1 : ease(t, T.excava, T.excava + 1.0));

// ---------------------------------------------------------------- texturas: arcada com aberturas em arco (alpha), arquibancada em degraus
const useArcTex = (attic = false) => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = TRAV; g.fillRect(0, 0, 128, 128);
  g.fillStyle = TRAV2; g.fillRect(0, 0, 14, 128); g.fillRect(114, 0, 14, 128); g.fillRect(0, 112, 128, 16); g.fillRect(0, 0, 128, 8);
  g.globalCompositeOperation = "destination-out";
  if (attic) { g.fillRect(52, 40, 24, 30); }
  else { g.beginPath(); g.moveTo(28, 112); g.lineTo(28, 52); g.arc(64, 52, 36, PI, 0); g.lineTo(100, 112); g.closePath(); g.fill(); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(attic ? 40 : 80, 1); return tx;
}, [attic]);
const useStepTex = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 8; cv.height = 64;
  const g = cv.getContext("2d")!;
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#e4d3ad" : "#f6ead0"; g.fillRect(0, i * 4, 8, 4); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapT = THREE.RepeatWrapping; return tx;
}, []);

/** um anel de parede elíptica (cilindro aberto achatado), com fração da volta (ruína) */
const Wall: React.FC<{ rx: number; rz: number; y0: number; h: number; tex?: THREE.Texture; c?: string; frac?: number; grow?: number; start?: number }> = ({ rx, rz, y0, h, tex, c = TRAV, frac = 1, grow = 1, start = 0 }) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: tex ? "#ffffff" : c, map: tex ?? null, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 }), [tex, c]);
  if (grow <= 0.01) return null;
  return (
    <mesh position={[0, y0 + (h * grow) / 2, 0]} scale={[rx, grow, rz]} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[1, 1, h, 96, 1, true, start, frac * PI * 2]} />
    </mesh>
  );
};

// ---------------------------------------------------------------- o anfiteatro
const Amphi: React.FC<{ t: number }> = ({ t }) => {
  const arc = useArcTex(false), att = useArcTex(true), steps = useStepTex();
  const seatMat = useMemo(() => new THREE.MeshStandardMaterial({ map: steps, side: THREE.DoubleSide, roughness: 0.9 }), [steps]);
  const R = ruin(t), piers = piersAt(t), ring = ringAt(t);
  const fr = R ? 0.42 : 1, st = R ? PI * 0.58 : 0; // hoje: só o trecho norte da fachada externa fica em pé
  const cav = tierAt(t, 0);
  return (
    <G>
      {/* anel de concreto da fundação (sobe do buraco do lago) */}
      <mesh position={[0, -0.6, 0]} rotation={[-PI / 2, 0, 0]} scale={[1, 1, Math.max(0.01, ring)]} receiveShadow castShadow material={mat("#9a9a94")} visible={ring > 0.01}>
        <extrudeGeometry args={[(() => { const s = new THREE.Shape(); s.absellipse(0, 0, A + 0.6, B + 0.6, 0, PI * 2, false, 0); const h = new THREE.Path(); h.absellipse(0, 0, AR - 0.4, BR - 0.4, 0, PI * 2, true, 0); s.holes.push(h); return s; })(), { depth: 2.0, bevelEnabled: false, curveSegments: 48 }]} />
      </mesh>
      {/* pilares de travertino antes das arcadas */}
      {piers > 0.01 && tierAt(t, 0) < 0.99 ? Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * PI * 2, p = ell(A, B, a); return <Box key={i} s={[0.9, 3.2 * piers, 1.2]} p={[p[0], FLOOR - 0.4 + 1.6 * piers, p[2]]} r={[0, -a, 0]} c={TRAV2} />; }) : null}
      {/* fachada: 3 andares de arcos + ático; parede interna (o 2º anel) */}
      {[0, 1, 2].map((k) => <Wall key={k} rx={A} rz={B} y0={0.4 + k * 3.2} h={3.2} tex={arc} grow={tierAt(t, k)} frac={k === 0 ? 1 : fr} start={k === 0 ? 0 : st} />)}
      <Wall rx={A} rz={B} y0={10.0} h={2.0} tex={att} grow={tierAt(t, 3)} frac={fr} start={st} />
      <Wall rx={A - 1.8} rz={B - 1.8} y0={0.4} h={6.4} tex={arc} grow={tierAt(t, 1)} />
      {/* arquibancada: tronco de cone elíptico em degraus, da arena até o topo */}
      {cav > 0.01 ? (
        <mesh position={[0, FLOOR + 4.3 * cav, 0]} scale={[1, cav, 0.82]} material={seatMat} receiveShadow>
          <cylinderGeometry args={[A - 1.6, AR + 0.5, 8.6, 64, 1, true]} />
        </mesh>) : null}
      {/* muro do pódio da arena */}
      <Wall rx={AR + 0.3} rz={BR + 0.3} y0={0} h={FLOOR + 0.6} c="#c9b590" grow={Math.max(ring, built(t) ? 1 : 0)} />
    </G>
  );
};

// ---------------------------------------------------------------- piso da arena e hipogeu
const Arena: React.FC<{ t: number }> = ({ t }) => {
  const ring = ringAt(t); if (ring < 0.5) return null;
  const pit = pitAt(t), lift = ease(t, T.suben - 0.6, T.suben + 0.6), lion = ease(t, T.suben, T.suben + 0.8);
  const workers = Array.from({ length: 4 }, (_, i) => { const a = t * 1.4 + (i / 4) * PI * 2; return { p: [1.4 + Math.cos(a) * 0.9, 0.05, 1.2 + Math.sin(a) * 0.9] as V3, yaw: -a, pose: "pull" as PoseName, ph: i * 0.3 }; });
  return (
    <G>
      {/* metade de trás do piso fica; a da frente desliza para revelar o subsolo */}
      <mesh position={[0, FLOOR, 0]} rotation={[-PI / 2, 0, 0]} scale={[AR, BR, 1]} receiveShadow material={mat("#e8cf98")}><circleGeometry args={[1, 48, 0, PI]} /></mesh>
      <mesh position={[0, FLOOR, -3.0 * pit]} rotation={[-PI / 2, 0, 0]} scale={[AR, BR, 1]} receiveShadow material={mat("#e8cf98")} visible={pit < 0.99}><circleGeometry args={[1, 48, PI, PI]} /></mesh>
      {[[-1.6, 0.8], [0, 1.6], [1.6, 0.8], [-0.8, -1.4], [0.8, -1.4]].map(([x, z], i) => <Box key={i} s={[0.7, 0.03, 0.7]} p={[x, FLOOR + 0.02, z]} c="#7a5a34" cast={false} vis={pit < 0.99 || z < 0} />)}
      {/* subsolo: chão de pedra, corredores, elevador com leão, cabrestante */}
      <G vis={pit > 0.01}>
        <mesh position={[0, 0.03, 0]} rotation={[-PI / 2, 0, 0]} scale={[AR, BR, 1]} material={mat("#8a7e6c")}><circleGeometry args={[1, 40]} /></mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((x, i) => <Box key={i} s={[0.3, FLOOR, 5.6]} p={[x, FLOOR / 2, 0]} c="#b5a283" />)}
        <Box s={[7.6, FLOOR, 0.3]} p={[0, FLOOR / 2, -0.4]} c="#b5a283" />
        <G p={[0, 0.1 + (FLOOR - 0.05) * lift, 1.6]}>
          <Box s={[0.9, 0.08, 0.9]} c="#8a5a2e" />
          {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, z], i) => <Box key={i} s={[0.06, 1.0, 0.06]} p={[x, 0.5, z]} c="#6b4423" />)}
          <G p={[0, 0.05, lion * 1.2]} vis={t > T.monta}>
            <Box s={[0.75, 0.42, 0.38]} p={[0, 0.5, 0]} c="#d9a24e" /><Sph rad={0.3} p={[0.42, 0.68, 0]} c="#a5582a" ws={10} hs={8} /><Sph rad={0.17} p={[0.55, 0.66, 0]} c="#d9a24e" ws={8} hs={6} />
            {[[-0.25, -0.12], [-0.25, 0.12], [0.25, -0.12], [0.25, 0.12]].map(([x, z], i) => <Cyl key={i} rt={0.06} h={0.32} p={[x, 0.16, z]} c="#c8913f" seg={5} />)}
          </G>
        </G>
        <Cyl rt={0.3} h={0.8} p={[1.4, 0.45, 1.2]} c="#7a4a26" seg={8} />
        <Crowd list={workers} t={t} c={COSTUMES.rome} scale={0.55} vis={t > T.domiciano && !ruin(t)} />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- público: assentos e gente entrando pelas portas
const Spectators: React.FC<{ t: number }> = ({ t }) => {
  const N = 700;
  const seated = useMemo(() => {
    const cols = ["#e94b3c", "#3c8de9", "#f2c14e", "#ffffff", "#5cbf5c", "#b05cd6", "#f08a3c"];
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.42, 0.28), new THREE.MeshStandardMaterial({ color: "#ffffff" }), N), o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const f = 0.08 + 0.86 * rnd(i * 3 + 1), a = rnd(i * 3 + 2) * PI * 2, rx = lerp(AR + 0.5, A - 1.6, f), rz = lerp(AR + 0.5, A - 1.6, f) * 0.82;
      o.position.set(rx * Math.cos(a) * 0.98, FLOOR + 8.6 * f + 0.25, rz * Math.sin(a) * 0.98); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, new THREE.Color(cols[i % cols.length]));
    }
    m.castShadow = false; m.frustumCulled = false; return m;
  }, []);
  const k = ruin(t) ? 0 : seatsAt(t); seated.count = Math.floor(N * k);
  return <primitive object={seated} />;
};
/** gente chegando: primeiro tudo numa porta só (o atasco), depois espalhada pelas 76 portas numeradas */
const Arrivals: React.FC<{ t: number }> = ({ t }) => {
  const on = t > T.p3 - 0.3 && t < T.vomitorios + 1.0; if (!on) return null;
  const spread = ease(t, T.setenta - 0.2, T.ficha + 0.5);
  const cols = ["#e94b3c", "#3c8de9", "#f2c14e", "#ffffff", "#5cbf5c", "#b05cd6"];
  return (
    <G>
      {Array.from({ length: 90 }, (_, i) => {
        const gateA = (i / 90) * PI * 2 * spread + (1 - spread) * (PI / 2), gate = ell(A + 0.6, B + 0.6, gateA);
        const u = spread > 0.5 ? fract(t * 0.35 + rnd(i)) : 0.2 + 0.8 * rnd(i) * (1 - ease(t, T.p3, T.atasco) * 0.6);
        const out: V3 = [gate[0] * 1.9 + (rnd(i + 5) - 0.5) * 4 * (1 - spread), 0, gate[2] * 1.9 + (rnd(i + 9) - 0.5) * 3 * (1 - spread)];
        const p: V3 = [lerp(out[0], gate[0], u), 0.3 + 0.05 * Math.abs(Math.sin(t * 9 + i)), lerp(out[2], gate[2], u)];
        return <Box key={i} s={[0.3, 0.55, 0.3]} p={p} c={cols[i % cols.length]} cast={false} />;
      })}
    </G>
  );
};

// ---------------------------------------------------------------- velário: mastros no topo, cordas e lona listrada que avança para o centro
const useSailTex = () => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = 64; cv.height = 4;
  const g = cv.getContext("2d")!; for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f6efe0" : "#d9473a"; g.fillRect(i * 8, 0, 8, 4); }
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(10, 1); return tx;
}, []);
const Velarium: React.FC<{ t: number }> = ({ t }) => {
  const tex = useSailTex(), u = sailAt(t), masts = ruin(t) ? 0 : ease(t, T.toldo - 0.6, T.toldo + 0.2);
  const sm = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }), [tex]);
  const rin = lerp(1, 0.42, u);
  const sailors = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * PI * 2 + 0.3, p = ell(A - 0.6, B - 0.6, a, TOP); return { p, yaw: -a + PI / 2, pose: "pull" as PoseName, ph: i * 0.2 }; });
  return (
    <G>
      {masts > 0.01 ? Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * PI * 2, p = ell(A - 0.2, B - 0.2, a); return <Cyl key={i} rt={0.06} h={3.2 * masts} p={[p[0], TOP + 1.6 * masts, p[2]]} c="#7a4e2a" seg={5} cast={false} />; }) : null}
      {u > 0.01 ? <mesh position={[0, TOP + 2.4 - 0.6 * (1 - rin), 0]} scale={[A - 0.2, 1, B - 0.2]} material={sm} castShadow><cylinderGeometry args={[1, rin, 1.2 * (1 - rin) + 0.01, 64, 1, true]} /></mesh> : null}
      <Crowd list={sailors} t={t} c={{ ...COSTUMES.rome, top: "#2f6fb0", kilt: "#2f6fb0" }} scale={0.8} vis={t > T.toldo - 0.5 && t < T.p5} />
    </G>
  );
};

// ---------------------------------------------------------------- o lago de Nero (antes) e a cidade em volta
const Lake: React.FC<{ t: number }> = ({ t }) => {
  const k = lakeAt(t), pit = !built(t) && ringAt(t) < 0.99 ? 1 : 0;
  return (
    <G>
      <mesh position={[0, 0.03, 0]} rotation={[-PI / 2, 0, 0]} scale={[A + 1.5, B + 1.5, 1]} material={mat("#7a5a3a")} visible={pit > 0}><circleGeometry args={[1, 48]} /></mesh>
      <mesh position={[0, 0.06 + 0.1 * k, 0]} rotation={[-PI / 2, 0, 0]} scale={[(A + 1.4) * Math.max(0.01, k), (B + 1.4) * Math.max(0.01, k), 1]} material={mat("#3a97d6", { rough: 0.2 })} visible={k > 0.01}><circleGeometry args={[1, 48]} /></mesh>
      {k > 0.05 ? Array.from({ length: 16 }, (_, i) => { const a = rnd(i) * PI * 2, r = 0.2 + 0.7 * rnd(i + 3); return <Box key={i} s={[1.2, 0.03, 0.1]} p={[Math.cos(a + t * 0.05) * r * A * k, 0.2, Math.sin(a + t * 0.05) * r * B * k]} c="#eaf7ff" cast={false} o={{ emissive: "#ffffff", ei: 0.3 }} />; }) : null}
      {/* barquinho de recreio do imperador */}
      <G p={[3 * Math.sin(t * 0.3), 0.25, 2 * Math.cos(t * 0.3)]} vis={k > 0.5}><Box s={[2.2, 0.4, 0.9]} c="#b8743a" /><Box s={[0.8, 0.8, 0.7]} p={[0, 0.6, 0]} c="#d94a3a" /></G>
      {/* pórtico da casa de Nero na margem */}
      <G p={[0, 0, -15]} vis={!built(t) && t < T.pilares}>
        <Box s={[14, 0.5, 3]} p={[0, 0.25, 0]} c="#efe6d2" /><Box s={[14, 0.6, 3]} p={[0, 3.6, 0]} c="#efe6d2" />
        {Array.from({ length: 8 }, (_, i) => <Cyl key={i} rt={0.25} h={3} p={[-6.3 + i * 1.8, 1.9, 1.0]} c="#ffffff" seg={10} />)}
      </G>
    </G>
  );
};
const Rome: React.FC<{ t: number }> = ({ t }) => {
  const bld = useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * PI * 2 + rnd(i) * 0.2, r = 36 + rnd(i + 4) * 10;
    return { p: [Math.cos(a) * r * 1.2, 0, Math.sin(a) * r] as V3, w: 3 + rnd(i + 2) * 3, h: 2.5 + rnd(i + 3) * 4, d: 3 + rnd(i + 6) * 2, yaw: -a };
  }), []);
  return (
    <G>
      <mesh position={[0, 0.02, 0]} rotation={[-PI / 2, 0, 0]} scale={[A + 6, B + 6, 1]} receiveShadow material={mat("#d6ccb8")}><circleGeometry args={[1, 48]} /></mesh>
      {bld.map((q, i) => (
        <G key={i} p={q.p} r={[0, q.yaw, 0]}>
          <Box s={[q.w, q.h, q.d]} p={[0, q.h / 2, 0]} c={i % 3 ? "#f1e3c8" : "#e7cfa8"} />
          <Cone rad={Math.max(q.w, q.d) * 0.72} h={1.3} seg={4} p={[0, q.h + 0.65, 0]} r={[0, PI / 4, 0]} sc={[1, 1, q.d / q.w]} c="#c4553a" />
        </G>
      ))}
      {/* pinheiros-mansos (copa achatada) */}
      {Array.from({ length: 14 }, (_, i) => { const a = rnd(i + 30) * PI * 2, r = 30 + rnd(i + 31) * 12; return (
        <G key={i} p={[Math.cos(a) * r * 1.2, 0, Math.sin(a) * r]}><Cyl rt={0.18} rb={0.25} h={4} p={[0, 2, 0]} c="#7a4a2a" seg={6} /><Sph rad={2.2} p={[0, 4.4, 0]} sc={[1, 0.45, 1]} c="#3f8f3a" ws={10} hs={6} /></G>); })}
      <Puffs t={t} p={[24, 6, -20]} n={4} period={4} rise={4} size={0.5} c="#eeeeee" />
    </G>
  );
};

/** terremoto e saque (hoje): blocos caem do trecho que falta */
const Debris: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.terremotos - 0.2 || t > T.sigue + 0.5) return null;
  return <G>{Array.from({ length: 10 }, (_, i) => { const a = PI * (1.1 + rnd(i) * 0.8), p = ell(A, B, a), u = fract((t - T.terremotos) * 0.7 + rnd(i + 2)); return <Box key={i} s={[0.8, 0.6, 0.6]} p={[p[0] * (1 + 0.3 * u), 10 - 10 * u * u, p[2] * (1 + 0.3 * u)]} r={[u * 3, u * 2, 0]} c={TRAV2} />; })}</G>;
};
const Party: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.inaugura - 0.1, T.inaugura + 0.4) * (1 - ease(t, T.p5 - 0.3, T.p5 + 0.3)); if (on <= 0.01) return null;
  const cols = ["#ffd400", "#ff4a6b", "#4ab8ff", "#5cff7a", "#ffffff"];
  return <G>{Array.from({ length: 40 }, (_, i) => { const u = fract(t * 0.4 + rnd(i)); return <Box key={i} s={[0.25, 0.04, 0.25]} p={[(rnd(i + 1) - 0.5) * 2 * A, TOP + 6 - u * 10, (rnd(i + 2) - 0.5) * 2 * B]} r={[u * 9, u * 7, 0]} c={cols[i % 5]} cast={false} o={{ emissive: cols[i % 5], ei: 0.3 }} />; })}</G>;
};

// ---------------------------------------------------------------- demonstração: o arco leva o peso aos pilares (roteiro v2)
// ponytail: um arco de brinquedo na frente da obra, só durante a frase «el arco desvía el peso hacia los pilares»
const LOAD_P: V3 = [11, 0, 16.5], LOAD_YAW = 0.588;
const LoadDemo: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.arcos, T.arcos + 0.8) * (1 - ease(t, T.p3 - 0.6, T.p3)); if (k <= 0.01) return null;
  const w = ease(t, T.reparten - 0.5, T.reparten + 0.1), f = ease(t, T.reparten + 0.1, T.reparten + 1.4), g = ease(t, T.reparten + 1.2, T.reparten + 2.3);
  const R = 2.6, th = 0.9, H = 3.6, rm = R + th / 2;
  const red = { emissive: "#ff2a1a", ei: 0.8 }, green = { emissive: "#1fa84a", ei: 0.7 };
  return (
    <G p={LOAD_P} r={[0, LOAD_YAW, 0]} sc={[1, Math.max(0.01, k), 1]}>
      {[-1, 1].map((s) => <Box key={s} s={[th + 0.1, H, 1.0]} p={[s * rm, H / 2, 0]} c={TRAV2} />)}
      {Array.from({ length: 9 }, (_, i) => { const a = (PI * (i + 0.5)) / 9; return <Box key={i} s={[th, 0.95, 1.0]} p={[rm * Math.cos(a), H + rm * Math.sin(a), 0]} r={[0, 0, a - PI / 2]} c={i === 4 ? "#f3e6c4" : TRAV} />; })}
      <Box s={[1.8, 1.1, 1.1]} p={[0, H + R + th + 0.55 + (1 - w) * 5, 0]} c="#6d6a64" vis={w > 0.01} />
      {[1, -1].map((s) => [0.42, 0.27, 0.12].map((u, j) => { const a = PI * u, on = f > j / 3; return on ? <Cone key={`${s}${j}`} rad={0.38} h={1.1} seg={8} p={[s * (rm + 0.75) * Math.cos(a), H + (rm + 0.75) * Math.sin(a), 0.7]} r={[0, 0, s > 0 ? PI + a : PI - a]} c="#ff3b30" o={red} cast={false} /> : null; }))}
      {[-1, 1].map((s) => [0.7, 0.3].map((u, j) => g > j / 2 ? <Cone key={`g${s}${j}`} rad={0.42} h={1.1} seg={8} p={[s * (rm + 0.9), H * u, 0.7]} r={[PI, 0, 0]} c="#3fcf6a" o={green} cast={false} /> : null))}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2f86e8" mid="#86c4f5" low="#f2f0e6" />
    <Ground g={GROUND} />
    <Hills c={["#6fbf48", "#5fae3e"]} z={-70} />
    <Clouds t={t} n={7} />
    <Rome t={t} /><Lake t={t} />
    <Amphi t={t} /><Arena t={t} /><Spectators t={t} /><Arrivals t={t} /><Velarium t={t} />
    <Debris t={t} /><Party t={t} /><LoadDemo t={t} />
  </>
);
export { clamp };
