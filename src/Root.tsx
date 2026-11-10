import React from "react";
import { Composition } from "remotion";
import { ThreeCanvas } from "@remotion/three";

const Smoke: React.FC = () => (
  <ThreeCanvas width={1080} height={1920} camera={{ position: [3, 3, 5], fov: 40 }} shadows>
    <ambientLight intensity={0.6} />
    <directionalLight position={[4, 6, 3]} intensity={2} castShadow />
    <mesh castShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#ff8a00" flatShading /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial color="#6fcf3a" /></mesh>
  </ThreeCanvas>
);

export const Root: React.FC = () => (
  <Composition id="ToyShort" component={Smoke} durationInFrames={30} fps={30} width={1080} height={1920} />
);
