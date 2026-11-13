// Qual das três aberturas (os 2 primeiros segundos) este render usa: PROPS='{"open":"b"}' no render.mjs (padrão "c", escolhida pelo crítico em 13/11).
// Fora do navegador (bun: checagens, mixagem) vale a variável OPEN.
import { getInputProps } from "remotion";
export type Open = "a" | "b" | "c";
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const raw = typeof window === "undefined" ? env?.OPEN : (getInputProps() as { open?: string }).open;
export const OPEN: Open = raw === "a" || raw === "b" ? raw : "c";
