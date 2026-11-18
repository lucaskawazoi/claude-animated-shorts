// Qual das três aberturas (0 a 3 s) está ligada: "A" de cima, mergulhando no buraco remendado; "B" atrás do carro que cai
// no buraco; "C" a rua inteira, do alto, fechando no buraco. Troca por uma constante aqui, ou por PROPS='{"open":"B"}' no render.
import { getInputProps } from "remotion";
export const OPENING: "A" | "B" | "C" = "B";
export const openId = (): "A" | "B" | "C" => { try { const o = (getInputProps() as { open?: string }).open; if (o === "A" || o === "B" || o === "C") return o; } catch { /* sem props */ } return OPENING; };
export const OPEN_END = 3.0; // aqui as três voltam ao mesmo plano largo da rua
