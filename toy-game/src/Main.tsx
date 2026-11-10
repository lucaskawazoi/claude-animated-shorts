// Composição: céu + mundo three.js (mapa na abertura, depois a ilha do canal) + painel de jogo em DOM.
import { useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FPS, shotName } from './lib';
import { Level } from './Level';
import { MapSet } from './MapSet';
import { Hud } from './Hud';
import { camAt } from './cams';

const Rig = ({ t }: { t: number }) => {
  const { camera, scene } = useThree();
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight('#fff6e8', 2.2);
    l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
    const c = l.shadow.camera as THREE.OrthographicCamera; c.left = -22; c.right = 22; c.top = 22; c.bottom = -22; c.near = 1; c.far = 160;
    return l;
  }, []);
  useLayoutEffect(() => { scene.add(light, light.target); return () => { scene.remove(light, light.target); }; }, [scene, light]);
  const r = camAt(t);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.copy(r.p); cam.fov = r.fov; cam.near = 0.1; cam.far = 600;
  cam.up.set(Math.sin(r.roll * Math.PI / 180), Math.cos(r.roll * Math.PI / 180), 0);
  cam.lookAt(r.c); cam.updateProjectionMatrix();
  light.target.position.copy(r.c); light.position.copy(r.c).add(new THREE.Vector3(-26, 48, 30));
  light.target.updateMatrixWorld();
  return null;
};

const Sky = () => {
  const m = useMemo(() => new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: {},
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vp; void main(){ float h = clamp(vp.y*1.6, 0.0, 1.0); vec3 top = vec3(0.36,0.66,0.95); vec3 low = vec3(0.86,0.94,1.0); gl_FragColor = vec4(mix(low, top, pow(h,0.8)),1.0); }' }), []);
  return <mesh material={m}><sphereGeometry args={[400, 24, 16]} /></mesh>;
};

export const Main = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [h] = useState(() => delayRender('fonte'));
  useLayoutEffect(() => {
    const f = new FontFace('Lilita', `url(${staticFile('fonts/LilitaOne-Regular.ttf')})`);
    f.load().then(ff => { document.fonts.add(ff); continueRender(h); });
  }, [h]);
  const map = shotName(t) === 'map';
  return (
    <AbsoluteFill style={{ background: '#bfe3ff' }}>
      <ThreeCanvas width={1080} height={1920} shadows flat gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFSoftShadowMap; }}>
        <Rig t={t} />
        <Sky />
        <fog attach="fog" args={['#dceeff', 60, 220]} />
        <hemisphereLight args={['#e6f4ff', '#5d9e3f', 1.0]} />
        <ambientLight intensity={0.25} />
        {map ? <MapSet t={t} /> : <Level t={t} />}
      </ThreeCanvas>
      <Hud t={t} />
    </AbsoluteFill>
  );
};
