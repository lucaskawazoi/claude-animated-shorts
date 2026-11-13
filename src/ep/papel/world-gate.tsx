// As duas execuções do tronco serrado: a da abertura B (0 s) e a do «metade nem virou papel».
import React from "react";
import { T } from "./anchors";
import { openId } from "./opening";
import { SplitLog } from "./stations1";
export { PI } from "./parts";
export const LOGP: [number, number, number] = [-14, 0, 30];
export const SplitLogGate: React.FC<{ t: number }> = ({ t }) => (
  <>
    {openId() === "B" ? <SplitLog t={t} t0={0.05} p={LOGP} /> : null}
    <SplitLog t={t} t0={T.metade - 0.1} p={LOGP} />
  </>
);
