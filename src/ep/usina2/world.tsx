// Mundo do MEP14 (A usina, parte 2): a usina do ep. 1 à esquerda, depois o caldo segue pelo tratamento, evaporação, cozimento, centrífuga, dorna, destilaria, a conta e a vinhaça.
import React from "react";
import { Box, G } from "../../toy/kit";
import { Clouds, Ground, Hills, Sky } from "../../toy/scenery";
import { Boiler, CaldoTank, CaneField, Clarifier, GlassTank, HomeTruck, Lavoura, Mill, RotaryFilter, TortaPile } from "./stations1";
import { Centrifuge, Dorna, Evaporator, Outputs, Pan, Still } from "./stations2";
import { Bagaco, Beacons, Bio, Conta, Puddle, SoilField, Vinhaca } from "./stations3";

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2477d8" mid="#62aef0" low="#d6ecff" />
    <Box s={[1500, 0.1, 700]} p={[250, -0.06, 0]} c="#4f9a3a" cast={false} />
    <Hills c={["#4f9a3e", "#5aa846"]} z={-150} n={44} x0={-110} flat={0.6} />
    <Clouds t={t} n={9} y={34} />
    <Ground g={{ base: "#4f9a3a", patch: ["#58a741", "#478f33", "#62ae48"], blade: "#3f8a2d", x: [-110, 560], z: [-70, 70], nBlades: 700 }} />
    <Box s={[700, 0.1, 9]} p={[220, 0.05, 9.5]} c="#b49b72" cast={false} />
    {Array.from({ length: 46 }, (_, i) => <Box key={i} s={[4, 0.12, 0.4]} p={[-110 + i * 15, 0.1, 9.5]} c="#f2e2b8" cast={false} />)}
    <CaneField t={t} /><Mill t={t} /><Boiler t={t} /><CaldoTank t={t} /><HomeTruck t={t} />
    <Clarifier t={t} /><RotaryFilter t={t} /><TortaPile t={t} /><Lavoura t={t} /><GlassTank t={t} />
    <Evaporator t={t} /><Pan t={t} /><Centrifuge t={t} /><Outputs t={t} /><Dorna t={t} /><Still t={t} />
    <Conta t={t} /><Bagaco t={t} /><Vinhaca t={t} /><Puddle t={t} /><SoilField t={t} /><Bio t={t} /><Beacons t={t} />
    <G />
  </>
);
