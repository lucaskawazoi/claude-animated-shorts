// Contrato de um episódio: tudo o que muda de um vídeo para outro mora em src/ep/<slug>/ e cumpre este tipo.
import type React from "react";
import type { Shot } from "./cam";
import type { HudData } from "./hud";
import type { WorkerState } from "./story";
import type { Costume } from "./worker";

export type Env = { bg: string; fog: string; fogNear: number; fogFar: number; hemiSky: string; hemiGround: string; hemiI: number; sun: string; sunI: number };
export type Episode = {
  SHOTS: Shot[]; // planos: t0 de cada um = um corte duro (CUTS) ou passagem contínua
  DYN: number[]; // dinamismo da câmera nas 11 janelas da régua (WINS)
  WORKER: [number, WorkerState][];
  COSTUME: Costume;
  HUD: HudData;
  World: React.FC<{ t: number }>;
  ENV: Env;
  EXPOSURE: number[]; // curva de exposição por 0,25 s (scripts/exposure_fit.py); vazia = 1
  SFX: [string, number, number][]; // efeito, instante (s), ganho (dB) — lido pela mixagem
};
