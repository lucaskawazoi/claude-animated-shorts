// Mundo do MEP13 (Mundo em Peças): do eucalipto ao papel. Eixo x = caminho da madeira (floresta 0 → descascador 100 → picadora 150 → digestor 220 →
// torre 296 → outra fábrica (máquina de papel) 366+); a caldeira de recuperação, a turbina e a cidade ficam atrás (z = -50), ao lado do digestor.
import React from "react";
import { Box, Cone, Cyl, G, Sph, ease, rnd, lerp } from "../../toy/kit";
import { Clouds, Ground, Hills, Sky } from "../../toy/scenery";
import { T } from "./anchors";
import { OpenA, OpenC } from "./hook";
import { Reactions } from "./reactions";
import { openId } from "./opening";
import { PI, SplitLogGate } from "./world-gate";
import { BlackPipe, BlackTank, Bleach, Bucket, Chipper, Debarker, Digester, DirtPuffs, Forest, Macro, Truck, WaterTank } from "./stations1";
import { BaleTruck, BarkBoiler, Boiler, BoilerPipes, ChemLoop, PaperMachine, PlantLights, Pylons, Town, Turbine } from "./stations2";

const BEAC: [number, number][] = [[0, -26], [100, 0], [150, 0], [220, 0], [296, 0], [420, 0], [478, 0], [220, -50], [380, -68]];
const Beacons: React.FC<{ t: number }> = ({ t }) => (
  t < T.ton ? null : <G>
    {BEAC.map(([x, z], i) => { const k = ease(t, T.ton + 0.3 + i * 0.4, T.ton + 0.75 + i * 0.4); return k > 0.01 ? <G key={i} p={[x, 0, z]}>
      <Cyl rt={2.4} h={110 * k} p={[0, 55 * k, 0]} c="#3cff70" seg={10} cast={false} o={{ opacity: 0.6, depthWrite: false, emissive: "#2cff6a", ei: 1.4 }} />
      <Sph rad={7 * k} p={[0, 110 * k, 0]} c="#9bffb0" ws={10} hs={8} cast={false} o={{ emissive: "#2cff6a", ei: 1.4 }} />
    </G> : null; })}
  </G>
);

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2477d8" mid="#62aef0" low="#d6ecff" />
    <Hills c={["#4f9a3e", "#5aa846"]} z={-150} n={40} x0={-100} flat={0.6} />
    <Clouds t={t} n={9} y={34} />
    <Ground g={{ base: "#4f9a3a", patch: ["#58a741", "#478f33", "#62ae48"], blade: "#3f8a2d", x: [-70, 520], z: [-70, 60], nBlades: 700 }} />
    {/* estrada de terra ao longo da fábrica */}
    <Box s={[640, 0.1, 10]} p={[230, 0.05, 9]} c="#b49b72" cast={false} />
    {Array.from({ length: 40 }, (_, i) => <Box key={i} s={[4, 0.12, 0.4]} p={[-60 + i * 15, 0.1, 9]} c="#f2e2b8" cast={false} />)}
    <Forest t={t} />
    <OpenA t={t} />
    <OpenC t={t} />
    <SplitLogGate t={t} />
    <Truck t={t} />
    <Bucket t={t} />
    <DirtPuffs t={t} />
    <Debarker t={t} />
    <Chipper t={t} />
    <Macro t={t} />
    <Digester t={t} />
    <BlackTank t={t} />
    <BlackPipe t={t} />
    <Bleach t={t} />
    <WaterTank t={t} />
    <BaleTruck t={t} />
    <PaperMachine t={t} />
    <Boiler t={t} />
    <BoilerPipes t={t} />
    <Turbine t={t} />
    <PlantLights t={t} />
    <Pylons t={t} />
    <Town t={t} />
    <BarkBoiler t={t} />
    <ChemLoop t={t} />
    <Beacons t={t} />
    <Reactions t={t} />
  </>
);
