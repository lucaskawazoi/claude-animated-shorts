// Qual das três aberturas (0 a ~3 s) está ligada: "A" mapa que acende, "B" mergulho pelo cano, "C" vaso gigante.
// Troca por uma constante aqui, ou por PROPS='{"open":"B"}' no render (para os stills de comparação).
import { getInputProps } from "remotion";
export const OPENING: "A" | "B" | "C" = "A";
export const openId = (): "A" | "B" | "C" => { try { const o = (getInputProps() as { open?: string }).open; if (o === "A" || o === "B" || o === "C") return o; } catch { /* sem props */ } return OPENING; };
export const OPEN_END = 3.2; // aqui as três voltam ao mesmo plano do mapa
