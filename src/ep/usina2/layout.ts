// MEP14 — mapa da usina. Eixo x = caminho do caldo (usina do ep. 1 → filtro → lavoura → evaporador → cozedor → centrífuga → dorna → destilaria → conta → vinhaça → biodigestor). z+ = lado da câmera.
import type { V3 } from "../../toy/kit";
export const L = {
  cane: [-70, 0, -8] as V3, mill: [-50, 0, -4] as V3, boiler: [-31, 0, -4] as V3, tank: [-12, 0, 3] as V3,
  clar: [8, 0, -1] as V3, filt: [32, 0, -2] as V3, pile: [47, 0, 3] as V3, lav: [76, 0, 0] as V3,
  glass: [106, 0, 3] as V3, evap: [126, 0, -1] as V3, pan: [156, 0, -1] as V3, cent: [186, 0, -1] as V3, barrel: [204, 0, 5] as V3, dorna: [232, 0, -2] as V3, still: [268, 0, -3] as V3,
  conta: [304, 0, 0] as V3, bagaco: [338, 0, 0] as V3, vin: [372, 0, -2] as V3, field: [412, 0, 4] as V3, bio: [466, 0, -6] as V3, home: [-12, 0, 30] as V3,
};
