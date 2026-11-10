import React from "react";
import { Composition } from "remotion";
import { Toy } from "./Toy";
import { FPS, TOTAL_FRAMES } from "./toy/cues";

export const Root: React.FC = () => (
  <Composition id="ToyShort" component={Toy} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
