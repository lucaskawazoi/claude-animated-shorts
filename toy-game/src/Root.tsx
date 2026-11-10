import { Composition } from 'remotion';
import { Main } from './Main';
import { DURATION, FPS } from './lib';
export const Root = () => (
  <Composition id="Canal" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
