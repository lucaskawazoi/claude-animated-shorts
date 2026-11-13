// MEP13 papel — qual das três aberturas (0 a OPEN_END) está ligada: "A" folha que amassa e vira eucalipto, "B" tronco serrado (metade vira papel, metade some em fumaça),
// "C" voo para fora do caderno: as linhas da página viram fileiras de eucalipto. Troca por uma constante, ou por PROPS='{"open":"B"}' no render.
import { getInputProps } from "remotion";
export const OPENING: "A" | "B" | "C" = "A";
export const openId = (): "A" | "B" | "C" => { try { const o = (getInputProps() as { open?: string }).open; if (o === "A" || o === "B" || o === "C") return o; } catch { /* sem props */ } return OPENING; };
export const OPEN_END = 3.0; // aqui as três voltam ao mesmo plano da floresta
