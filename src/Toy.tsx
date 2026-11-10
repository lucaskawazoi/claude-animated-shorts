// Composição "ToyShort": mundo 3D de brinquedo (three.js dentro do Remotion) + painel de jogo em DOM por cima.
// Áudio NÃO entra aqui: o render sai mudo e o mix (voz + sons + música) é colado com ffmpeg (ver scripts/mux.sh).
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { FPS, T } from "./toy/cues";
import { G, V3, clamp, ease, lerp, prog, rnd } from "./toy/kit";
import { Clouds, CaneField, Ground, HOUSES, Hills, PoleLine, Sky, Town, Trees } from "./toy/scenery";
import { Boiler, CarGag, Canal, Column, Dorna, Mill, Pile, Truck, Turbine, pileGrow, truckX } from "./toy/stations";
import { Worker, blendPose, poseOf } from "./toy/worker";
import { camAt, workerAt } from "./toy/story";
import { Hud } from "./toy/hud";

type Props = { cam?: { pos: V3; look: V3; fov?: number; roll?: number }; t?: number; hud?: boolean; captions?: boolean };

const TREES: V3[] = [
  ...Array.from({ length: 26 }, (_, i): V3 => [-54 + i * 6.4 + rnd(i) * 3, 0, -13 - rnd(i + 30) * 10]),
  ...Array.from({ length: 10 }, (_, i): V3 => [-40 + i * 16 + rnd(i + 5) * 6, 0, 22 + rnd(i + 60) * 5]),
  [-12.5, 0, -9.5], [29.5, 0, 3.4], [47.5, 0, -8.2], [-17, 0, 14],
];

const Scene: React.FC<{ t: number; ov?: Props["cam"] }> = ({ t, ov }) => {
  const { camera } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const c = ov ? { pos: ov.pos, look: ov.look, fov: ov.fov ?? 55, roll: ov.roll ?? 0 } : camAt(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = c.fov; cam.aspect = 1080 / 1920; cam.near = 0.3; cam.far = 900;
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ((c.roll * Math.PI) / 180); cam.updateProjectionMatrix();
  useLayoutEffect(() => {
    const l = sun.current; if (!l) return;
    // o sol segue o ponto de interesse: sombra nítida só onde a câmera olha
    const f = new THREE.Vector3(c.look[0] * 0.8 + c.pos[0] * 0.2, 0, c.look[2] * 0.8 + c.pos[2] * 0.2);
    l.position.set(f.x - 14, 30, f.z + 20); l.target.position.copy(f); l.target.updateMatrixWorld();
    const s = l.shadow.camera; s.left = -24; s.right = 24; s.top = 24; s.bottom = -24; s.near = 1; s.far = 90; s.updateProjectionMatrix();
  });

  // estado derivado do tempo
  const w = workerAt(t);
  const pose = blendPose(poseOf(w.prev ?? w.pose, t), poseOf(w.pose, t), w.u ?? 1);
  if (w.mv) { pose.hop += 0.11 * Math.abs(Math.sin(t * 13)); pose.lean = 0.05; }
  const tilt = ease(t, T.moenda - 0.2, T.moenda + 1.2) * 0.62, load = 1 - ease(t, T.moenda + 0.6, T.moenda + 6.5);
  const grow = 1 + 0.4 * ease(t, T.canais + 5, T.essaFert + 1.5), wet = ease(t, T.canais + 4.2, T.canais + 7.5);
  const lit = HOUSES.map((_, i) => ease(t, T.casas + 0.1 + i * 0.28, T.casas + 0.3 + i * 0.28));
  const flow = ease(t, T.vende, T.vende + 0.8);
  const x2 = lerp(-37, -31, ease(t, T.end - 2.4, T.end + 0.2));

  return (
    <>
      <fog attach="fog" args={["#dff1ff", 140, 520]} />
      <hemisphereLight args={["#dff0ff", "#79c24a", 1.25]} />
      <ambientLight intensity={0.25} />
      <directionalLight ref={sun} intensity={2.7} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04} />
      <Sky /><Ground /><Hills /><Trees spots={TREES} /><Clouds t={t} />
      <CaneField grow={grow} wet={wet} />
      <Truck x={truckX(t)} tilt={tilt} load={load} t={t} />
      <Truck x={x2} t={t} />
      <Mill t={t} /><Pile g={pileGrow(t)} /><Boiler t={t} /><Turbine t={t} /><CarGag t={t} />
      <Dorna t={t} /><Column t={t} /><Canal t={t} />
      <PoleLine t={t} flow={flow} /><Town lit={lit} />
      <Worker p={w.p} yaw={w.yaw} pose={pose} t={t} scale={w.scale ?? 1.25} />
    </>
  );
};

export const Toy: React.FC = () => {
  const frame = useCurrentFrame();
  const ip = getInputProps() as Props;
  const t = ip.t ?? frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#9fd0ff" }}>
      <ThreeCanvas width={1080} height={1920} shadows={{ type: THREE.PCFSoftShadowMap }} gl={{ antialias: true, toneMapping: THREE.NoToneMapping }} camera={{ fov: 55, near: 0.3, far: 900, position: [0, 3, 10] }}>
        <Scene t={t} ov={ip.cam} />
      </ThreeCanvas>
      {ip.hud === false ? null : <Hud t={t} captions={ip.captions !== false} />}
    </AbsoluteFill>
  );
};
export { G, clamp, prog };
