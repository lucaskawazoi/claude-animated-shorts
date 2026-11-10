// Composição "ToyShort": mundo 3D de brinquedo (three.js dentro do Remotion) + painel de jogo em DOM por cima.
// O episódio (src/ep/current.ts) traz mundo, câmera, operário, painel e luz. O render sai mudo; o som entra no mix.
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EP } from "./ep/current";
import { FPS } from "./toy/cues";
import { V3, lerp } from "./toy/kit";
import { Worker, blendPose, poseOf } from "./toy/worker";
import { camAt, workerAt } from "./toy/story";
import { Hud } from "./toy/hud";

type Props = { exposure?: boolean; cam?: { pos: V3; look: V3; fov?: number; roll?: number }; t?: number; hud?: boolean; captions?: boolean };

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
    const s = l.shadow.camera; s.left = -28; s.right = 28; s.top = 28; s.bottom = -28; s.near = 1; s.far = 100; s.updateProjectionMatrix();
  });
  const w = workerAt(t), e = EP.ENV;
  const pose = blendPose(poseOf(w.prev ?? w.pose, t), poseOf(w.pose, t), w.u ?? 1);
  if (w.mv) { pose.hop += 0.11 * Math.abs(Math.sin(t * 13)); pose.lean = 0.08; }
  return (
    <>
      <fog attach="fog" args={[e.fog, e.fogNear, e.fogFar]} />
      <hemisphereLight args={[e.hemiSky, e.hemiGround, e.hemiI]} />
      <ambientLight intensity={0.25} />
      <directionalLight ref={sun} intensity={e.sunI} color={e.sun} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04} />
      <EP.World t={t} />
      <Worker p={w.p} yaw={w.yaw} pose={pose} t={t} scale={w.scale ?? 1.25} c={EP.COSTUME} prop={w.prop} />
    </>
  );
};

const exposureAt = (t: number) => {
  const E = EP.EXPOSURE; if (!E.length) return 1;
  const x = t / 0.25, i = Math.min(E.length - 1, Math.max(0, Math.floor(x))), j = Math.min(E.length - 1, i + 1);
  return lerp(E[i], E[j], x - Math.floor(x));
};

export const Toy: React.FC = () => {
  const frame = useCurrentFrame();
  const ip = getInputProps() as Props;
  const t = ip.t ?? frame / FPS;
  return (
    <AbsoluteFill style={{ background: EP.ENV.bg }}>
      <div style={{ position: "absolute", inset: 0, filter: ip.exposure === false ? undefined : `brightness(${exposureAt(t)})` }}>
        <ThreeCanvas width={1080} height={1920} shadows={{ type: THREE.PCFSoftShadowMap }} gl={{ antialias: true, toneMapping: THREE.NoToneMapping }} camera={{ fov: 55, near: 0.3, far: 900, position: [0, 3, 10] }}>
          <Scene t={t} ov={ip.cam} />
        </ThreeCanvas>
      </div>
      {ip.hud === false ? null : <Hud t={t} captions={ip.captions !== false} />}
    </AbsoluteFill>
  );
};
