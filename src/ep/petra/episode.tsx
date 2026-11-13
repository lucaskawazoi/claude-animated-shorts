// E9 — Petra (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { CamState, K, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, pop, win } from "../../toy/hud";
import { V3, clamp, lerp, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T, XCUTS, XT } from "./cues";
import { World, canalRider, canalY, cutY, runX } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const PI = Math.PI;

// ritmo 13/11 (pré-crítica por quadros): 4 cortes extras (XCUTS) e o W3 viram cortes; nenhum a menos de 0,5 s da régua
const [X1, X4a, X4b, X4c] = XCUTS;
// shot 4d: a câmera vai atrás do operário que escorrega canal abaixo e freia quando ele voa para a fonte
// a câmera fica para trás 1,6 u/s (o operário vai ficando menor e o canal à frente aparece): quadros de segundo em segundo diferem
const VR = (canalRider(T.ciudad)[0] - canalRider(XT.slip)[0]) / (T.ciudad - XT.slip) - 1.6;
const ride = (t: number): CamState => {
  const tau = clamp(t - T.ciudad, 0, 1), s = clamp(t - XT.slip, 0, T.ciudad - XT.slip);
  const x = t < T.ciudad ? canalRider(t)[0] - 7.5 - 1.6 * s : canalRider(T.ciudad)[0] - 7.5 - 1.6 * s + VR * (tau - tau * tau / 2);
  const lk: V3 = [x + 11.5 + 1.6 * s, canalY(x + 11.5 + 1.6 * s) + 0.6, 1.9], u = sstep(tau);
  return { pos: [x, canalY(x + 7.5) + 3.4 + 0.5 * s, 0.2], look: [lerp(lk[0], 9, u), lerp(lk[1], 0.8, u), lerp(lk[2], 1.0, u)], fov: 54, roll: 0 };
};
const R1 = ride(T.ciudad + 1);
const TAIL4 = [K(T.ciudad + 1, R1.pos, R1.look, 54, 0), K(T.canalesT, [-4, 9, 0.2], [8, 0.5, 1.5], 54, 0), K(C4 - 0.05, [-3.5, 10.5, 0.2], [8, 0.5, 1.5], 54, 0)];

const SHOTS: Shot[] = [
  // gancho: o operário foge de um camelo pelo Siq, de frente para a câmera que recua (movimento desde o quadro 0)
  { name: "gancho: fugindo do camelo no Siq", t0: 0, keys: [], fn: (t) => { const x = runX(t); return { pos: [x + 10.5, 3.3, 0.4], look: [x - 1.5, 2.0, -0.1], fov: 54, roll: 0 }; } },
  // contraplano: de trás, os dois saem do Siq na praça cheia; a câmera já vem andando (chave antes do corte) e sobe até o ⏪
  { name: "saem do Siq: a praça cheia e o Tesouro → ⏪ rocha bruta, caravana", t0: X1, keys: [
    K(X1 - 1.0, [-27.4, 2.21, -0.83], [-5.48, 3.22, -0.02], 54, 0), K(T.petra + 0.3, [-1, 13, -1.5], [8, 3, 2], 56, 0),
    K(T.nohay, [9, 10, -8], [4, 2, 3], 54, 0), K(C1 - 0.05, [9.5, 10, -8.5], [3, 2, 3], 54, 0)] },
  // dentro do Siq olhando a entrada: a caravana do incenso vem, chove, a riada entra e arrasa as bancas; a câmera recua
  // à frente da onda e sobe; na pergunta a água volta (⏪) e a câmera mostra a boca do Siq onde vai a presa
  { name: "caravana no Siq → chuva → a riada arrasa → pergunta", t0: C1, keys: [
    K(C1, [-29, 5.6, -0.9], [-46, 2.6, 0.3], 54, 2), K(T.p1, [-30.5, 5.8, -0.9], [-46, 3.2, 0.3], 54, 0), K(T.agua1 + 0.6, [-30, 5.6, -0.8], [-47, 2.0, 0], 54, 0),
    K(T.riada, [-24, 6.0, -0.6], [-40, 1.2, 0], 56, 0), K(T.arrasa + 0.25, [-14, 8.5, -0.5], [-28, 0.8, -0.3], 58, 0),
    K(T.b1 + 0.2, [-18, 15.5, -0.5], [-36, 1.0, 0], 56, 0), K(T.c1, [-36, 12.5, -0.5], [-50, 1.4, 1.2], 54, 0), K(C2 - 0.05, [-37, 12, -0.5], [-50, 1.4, 1.2], 54, 0)] },
  // a presa sobe de perto, em fiadas, com os pedreiros
  { name: "presa de perto subindo em fiadas", t0: C2, keys: [
    K(C2, [-60, 4.6, 3.0], [-48.5, 1.8, 0], 52, -2), K(W3 - 0.05, [-60.4, 5.0, 3.4], [-49.5, 1.8, -0.5], 52, 0)] },
  // corte (W3): do sul, alto — a riada desce o uádi enquanto cavam o túnel em raio-x; bate na presa, entra no túnel, sai longe
  { name: "a riada desce o uádi × o túnel sendo cavado → choca, túnel, lejos → se pierde", t0: W3, keys: [
    K(W3, [-53, 32, 44], [-54, 0, -8], 56, 0), K(T.choca - 0.1, [-56, 16, 16], [-52, 0, -3], 56, 0),
    K(T.porTunel + 0.2, [-58, 20, 12], [-55, 0, -14], 56, 0), K(T.lejos + 0.5, [-58, 26, 9], [-54, 0, -26], 60, 0), K(T.tunelT + 0.4, [-56, 22, 0], [-53, 0, -30], 58, 0),
    K(T.p2 + 0.5, [-47, 15, -14], [-51, 0, -40], 56, 0), K(C3 - 0.05, [-46.8, 14.6, -14.6], [-51, 0, -41], 56, 0)] },
  // o operário já cavando o canal (de frente), a água descendo atrás dele; o carimbo passa por cima
  { name: "o operário cava o canal, a água atrás", t0: C3, keys: [
    K(C3, [-36.5, 7.2, 0.1], [-47.5, 6.4, 2.0], 54, 2), K(X4a - 0.05, [-35.0, 7.4, 0.2], [-46.6, 6.3, 2.0], 54, 0)] },
  // corte: de trás dele, o sulco corre a parede do desfiladeiro (canales tallados en las paredes)
  { name: "o sulco corre a parede", t0: X4a, keys: [
    K(X4a, [-53, 11.5, -0.8], [-33, 3.2, 2.0], 54, 0), K(X4b - 0.05, [-51.5, 11.8, -0.8], [-28, 3.0, 2.0], 54, 0)] },
  // corte: os tubos de barro na parede norte
  { name: "tubos de barro", t0: X4b, keys: [
    K(X4b, [-53, 6.2, 1.6], [-40, 2.8, -2.2], 54, 0), K(X4c - 0.05, [-51.5, 6.3, 1.6], [-38, 2.6, -2.2], 54, 0)] },
  // corte: «siempre en bajada» — a água empurra o operário, ele escorrega canal abaixo até a cidade e cai na fonte (gag)
  { name: "escorrega canal abaixo → cai na fonte → estos son los canales", t0: X4c, keys: TAIL4, fn: (t) => (t < T.ciudad + 1 ? ride(t) : keyed(TAIL4, t)) },
  // a fonte enche de areia (de perto) → o decantador sobe no caminho → em corte: a água para, a areia desce
  { name: "areia na fonte → decantador em corte de perto", t0: C4, keys: [
    K(C4, [7.6, 4.0, -5.2], [9.0, 0.6, 1.0], 52, 2), K(T.arena + 0.5, [7.9, 3.6, -4.6], [9.0, 0.5, 1.0], 52, 0),
    K(T.estanques, [4.4, 3.6, -5.8], [4.3, 0.8, 1.4], 54, 0), K(T.detiene, [4.25, 3.0, -5.0], [4.2, 0.75, 1.6], 54, 0),
    K(T.fondo, [4.2, 2.0, -4.6], [4.2, 0.8, 1.6], 54, 0), K(W6, [4.3, 2.0, -4.5], [4.3, 0.8, 1.6], 54, 0), K(C5 - 0.05, [4.9, 2.1, -4.4], [4.6, 0.85, 1.6], 54, 0)] },
  // de cima: a água limpa sai e enche a fonte → verão: a fonte seca → cisternas cavadas, chuva, tampa, uso → a fachada não dá do chão
  { name: "água limpa → verão seco → cisternas → a fachada não dá do chão", t0: C5, keys: [
    K(C5, [5.6, 9.6, -2.2], [6.4, 0.5, 1.3], 52, 2), K(T.limpia + 0.5, [5.8, 9.2, -2.6], [6.8, 0.5, 1.2], 52, 0),
    K(T.decantadores + 0.3, [4.6, 6.2, -5.4], [6.6, 0.6, 1.3], 54, 0), K(T.p4 + 0.3, [7.4, 3.4, -4.0], [9.0, 0.6, 1.0], 54, 0),
    // no ⏪ já se vê a cisterna da direita sendo cavada pelo operário (a parede do «sin tanques» não fica vazia)
    K(T.meses + 0.6, [7.8, 3.0, -3.4], [9.0, 0.4, 1.0], 54, 0), K(T.b4 + 0.4, [6.6, 4.0, -5.0], [6.9, 3.2, 6.9], 56, 0), K(T.c4 + 0.4, [6.4, 4.1, -5.2], [6.7, 3.3, 6.9], 56, 0), // segura na cisterna sendo cavada
    K(T.cisternas, [5.0, 5.6, -7.0], [2.6, 4.6, 6.9], 56, 0), K(T.cavadas + 0.5, [5.5, 6.8, -9.0], [3.0, 6.0, 7.0], 58, 0),
    // uma cisterna de perto, com a boca no quadro: a chuva enche, transborda no operário, a tampa fecha (sombra), ele tira água no verão
    K(T.recogen - 0.3, [6.2, 4.4, -1.6], [6.2, 3.8, 6.93], 54, 0), K(T.sombra + 0.1, [6.0, 4.6, -1.8], [6.2, 4.2, 6.93], 54, 0),
    K(T.paraVerano + 0.3, [6.6, 3.8, -1.4], [6.6, 3.0, 6.93], 54, 0), K(T.cisternasT + 0.3, [4.6, 5.6, -6.5], [3.0, 4.4, 6.9], 56, 0),
    // a falésia inteira com o operário pequenininho na escada curta: a escala é o problema
    K(T.p5 + 0.6, [2.6, 3.5, -6.5], [13, 9, 2], 66, 0), K(T.suelo, [3.0, 3.0, -5.5], [12.5, 7, 2.5], 64, 0), K(C6 - 0.05, [3.1, 3.0, -5.4], [12.5, 7.2, 2.5], 64, 0)] },
  // a câmera desce junto com o nível do corte, de perto, girando um pouco (paralaxe): de cima para baixo; abre no Tesouro
  { name: "esculpindo o Tesouro de cima para baixo", t0: C6, keys: [
    K(C6, [3.0, 25.5, -8], [14, 21, -0.5], 56, -2), K(T.arriba + 0.66, [3.5, 20, -7.5], [14, 16.8, -0.5], 56, 0),
    K(T.roca + 0.2, [4.0, 17.2, -7.0], [14, 13.9, -0.5], 56, 0), K(T.piso + 0.3, [4.5, 15.2, -6.5], [14, 11.9, -0.5], 56, 0),
    K(T.bajando + 0.45, [4.8, 11.6, -6.0], [14, 8.4, -0.5], 56, 0), K(T.tesoro, [3.4, 9, -3.6], [15.5, 10, 0], 68, 0), K(C7 - 0.05, [3.2, 9.2, -3.8], [15.5, 10.3, 0], 68, 0)] },
  // a fachada de baixo → 363: as cisternas racham e jorram, o canal parte → a fonte seca → a caravana sai → a praça esvazia
  { name: "a fachada → 363: terremoto rompe cisternas e canal → caravana sai → praça vazia → o Tesouro", t0: C7, keys: [
    K(C7, [8.5, 1.4, -2.2], [16, 11, 0], 64, 2), K(T.fachadaT + 0.8, [7.6, 1.9, -3.6], [16, 11.5, 0], 62, 0),
    K(T.y363 + 0.6, [5.5, 4.8, -5.2], [4.4, 3.8, 6.9], 56, 0), K(T.rompio + 0.2, [6.0, 4.3, -2.6], [5.4, 3.4, 6.9], 54, 0),
    K(T.canalesR + 0.1, [3.0, 4.0, -2.0], [-3.5, 2.4, 2.0], 54, 0), K(T.suagua, [4.6, 3.8, -3.6], [9, 0.6, 1.0], 54, 0),
    K(T.comercio + 0.2, [12.5, 4.6, -4.4], [-2, 2, -0.5], 54, 0), K(T.vaciando, [3.5, 7.5, -7.0], [11, 1, 1.5], 56, 0),
    K(W10, [3.4, 7.6, -7.2], [11, 1.2, 1.5], 56, 0), K(T.end, [4, 8, -6.5], [16, 10, 0], 56, 0)] },
];
// câmera na mão por janela da régua: baixa nos closes (uma deriva de 3 unidades num close a 6 tira o assunto do quadro)
const DYN = [4.2, 0.7, 2.0, 1.8, 0.3, 0.3, 0.9, 1.2, 0.3, 1.0, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([runX(T.petra - 0.12), 0, 0], PI / 2, "alarm", { follow: (t) => [runX(t), 0, 0] })], // gancho: foge do camelo
  [T.petra, S([4, 0, -4], 0.4, "present")],
  [T.hace, S([4, 0, -4], 0.9, "point")],
  [C1, S([-46, 4.0, -2.0], PI / 2, "present")],           // no ressalto da parede, a caravana passa embaixo
  [T.riada, S([-46, 4.0, -2.0], -PI / 2, "alarm")],
  [T.b1, S([-46, 4.0, -2.0], 0.4, "think")],
  [C2, S([-45, 0, -33], -1.2, "present")],               // na saída do túnel, longe da água
  [T.tunel, S([-45, 0, -33], -2.0, "point")],
  [T.lejos + 0.2, S([-45, 0, -33], -2.0, "cheer")],
  [T.p2, S([-45, 0, -33], -2.4, "think")],
  [C3, S(canalRider(XT.slip - 0.01), PI / 2, "chisel", { follow: canalRider })], // em pé no canal, cavando
  [XT.slip, S(canalRider(T.ciudad + 1), -PI / 2, "alarm", { follow: canalRider })], // a água empurra: escorrega de costas até a fonte
  [T.ciudad + 1, S([9, 0.32, 1.0], -1.2, "cheer")],         // dentro da fonte
  [T.p3, S([10.0, 0, 4.4], PI, "alarm")],
  [T.estanques, S([3.0, 0, 4.4], PI, "point")],           // atrás do decantador, de lado
  [XT.spl + 0.25, S([3.0, 0, 4.4], PI, "alarm")],          // a lama espirra na cara dele
  [T.detiene + 0.5, S([3.0, 0, 4.4], PI, "think")],
  [T.fondo - 0.2, S([2.3, 0, 3.4], PI + 0.3, "point")],    // vai ver a areia descer (de lado: fora da pill)
  [T.limpia, S([2.3, 0, 3.4], PI + 0.3, "cheer")],
  [T.p4, S([11.4, 0, 4.2], -2.6, "alarm")],
  [T.b4 + 0.3, S([7.9, 0, 5.9], -PI / 2, "chisel")],       // já cava a cisterna da direita
  [T.cisternas, S([8.9, 0, 5.6], -2.0, "point")],
  [T.recogen, S([6.9, 0, 6.1], -2.8, "think")],            // embaixo da cisterna enchendo
  [T.guardan + 0.05, S([6.9, 0, 6.1], -2.8, "alarm")],     // transbordou nele
  [T.paraVerano - 0.2, S([7.9, 0, 6.3], -0.6, "pull", { prop: "jar" })], // tira água da cisterna no verão
  [T.cisternasT, S([8.9, 0, 5.2], -2.4, "cheer")],
  [T.p5, S([10.6, 0, 3.8], PI / 2, "alarm")],
  [T.gigante + 0.3, S([11.0, 2.2, 3.0], PI / 2, "chisel")], // na escada curta
  [T.suelo + 0.3, S([10.0, 0, 3.6], PI / 2, "alarm")],     // a escada cai
  [C6, S([12.4, 0, -4.8], PI / 2, "chisel", { follow: (t) => [12.4, cutY(t), -4.8] })], // em cima do bloco, descendo com o corte
  [T.tesoro, S([10.8, 0, -4.2], -2.0, "cheer")],
  [C7, S([10.6, 0, -4.0], -2.2, "present")],
  [T.terremoto, S([9.6, 0, 5.0], -2.6, "alarm")],
  [T.comercio, S([9.6, 0, 5.0], -1.6, "think")],
  [T.vaciando, S([2.5, 0, 4.2], -0.6, "think")],
  [T.mandaselo, S([2.5, 0, 4.2], 0.6, "present")],
];

/** o sol do verão no painel (ícone de clima do jogo): aparece no «en verano» e de novo no «para el verano» */
const SunIcon: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.max(win(t, T.verano - 0.1, T.b4 + 0.5, 0.2), win(t, T.paraVerano - 0.1, T.cisternasT, 0.2)); if (k <= 0) return null;
  const s = pop(t, t < T.b4 + 1 ? T.verano - 0.1 : T.paraVerano - 0.1, 0.35);
  return (
    <div style={{ position: "absolute", left: 800, top: 290, width: 240, height: 240, opacity: k, transform: `scale(${s})` }}>
      <svg viewBox="0 0 100 100" width="240" height="240">
        <g transform={`rotate(${t * 40} 50 50)`}>{Array.from({ length: 10 }, (_, i) => <path key={i} d="M50 4 L56 20 L44 20 Z" fill="#ffb000" stroke="#3a2300" strokeWidth="3" strokeLinejoin="round" transform={`rotate(${i * 36} 50 50)`} />)}</g>
        <circle cx="50" cy="50" r="25" fill="#ffd400" stroke="#3a2300" strokeWidth="5" />
      </svg>
    </div>
  );
};

// valores fixos (nada de contador subindo: número intermediário na tela parece fato — crítico do E6 v2)
const hud: HudData = {
  pills: [
    { a: T.casi, b: T.veinte - 0.1, label: "LLUVIA", value: () => "CASI NADA", y: 440, tone: "red" },
    { a: T.veinte, b: T.petra - 0.1, label: "PERSONAS", value: () => "~20.000", y: 440, tone: "gold" },
    { a: T.hace, b: T.nohay - 0.1, label: "HACE", value: () => "~2000 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.nabateos - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.nabateos, b: T.p1 - 0.1, label: "RUTAS", value: () => "DEL INCIENSO", y: 440, tone: "gold" },
    { a: T.riada, b: T.b1 - 0.1, label: "RIADA", value: () => "ARRASA TODO", y: 440, tone: "red" },
    { a: T.noventa, b: T.manda - 0.1, label: "TÚNEL", value: () => "~90 m", y: 440, tone: "green" },
    { a: T.p2 + 0.5, b: T.b2 - 0.1, label: "AGUA", value: () => "SE PIERDE", y: 440, tone: "red" },
    { a: T.tubos, b: T.siempre - 0.1, label: "TUBOS", value: () => "BARRO COCIDO", y: 440, tone: "green" },
    { a: T.siempre, b: T.llevan - 0.1, label: "CANAL", value: () => "EN BAJADA", y: 440, tone: "green" },
    { a: T.llevan, b: T.canalesT - 0.1, label: "SIN BOMBAS", value: () => "GRAVEDAD", y: 440, tone: "green" },
    { a: T.p3 + 0.3, b: T.b3 - 0.1, label: "AGUA", value: () => "CON ARENA", y: 440, tone: "red" },
    { a: T.pesada, b: T.decantadores, label: "ARENA", value: () => "AL FONDO", y: 440, tone: "green" },
    { a: T.meses, b: T.b4 - 0.1, label: "SIN LLUVIA", value: () => "MESES", y: 440, tone: "red" },
    { a: T.cisternas, b: T.cisternasT, label: "CISTERNAS", value: () => "CIENTOS", y: 440, tone: "green" },
    { a: T.suelo, b: T.b5 - 0.1, label: "DESDE EL SUELO", value: () => "IMPOSIBLE", y: 440, tone: "red" },
    { a: T.arriba, b: T.tesoro - 0.1, label: "TALLADO", value: () => "ARRIBA → ABAJO", y: 440, tone: "green" },
    { a: T.cuarenta, b: T.fachadaT, label: "EL TESORO", value: () => "~40 m", y: 440, tone: "gold" },
    { a: T.y363, b: T.terremoto - 0.1, label: "AÑO", value: () => "363", y: 440, tone: "red" },
    { a: T.rompio, b: T.canalesR - 0.1, label: "CISTERNAS", value: () => "ROTAS", y: 440, tone: "red" },
    { a: T.canalesR, b: T.comercio - 0.1, label: "CANALES", value: () => "ROTOS", y: 440, tone: "red" },
    { a: T.comercio, b: T.vaciando - 0.1, label: "COMERCIO", value: () => "OTRAS RUTAS", y: 440, tone: "red" },
    { a: T.vaciando, b: T.mandaselo - 0.1, label: "CIUDAD", value: () => "SE VACÍA", y: 440, tone: "red" },
  ],
  titles: [
    { a: T.tunelT, text: "EL TÚNEL" }, { a: T.canalesT, text: "CANALES" }, { a: T.decantadores, text: "DECANTADORES" },
    { a: T.cisternasT, text: "CISTERNAS" }, { a: T.fachadaT, text: "LA FACHADA" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.petra, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.arrasa, T.b1 - 0.1], [T.suelo, T.b5 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN MÁQUINAS"], [T.b2, T.c2, "SIN BOMBAS"], [T.b4, T.c4, "SIN TANQUES"]],
  reward: { a: T.mandaselo, len: T.end - T.mandaselo, top: "EL TESORO SIGUE AHÍ", big: () => "+2000 AÑOS", sub: "SIN UN SOLO MOTOR" },
  Extra: SunIcon,
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.nabateo, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#f4ecdc", fogNear: 130, fogFar: 560, hemiSky: "#f6f9ff", hemiGround: "#ecc49c", hemiI: 1.75, sun: "#fff2d6", sunI: 2.9 },
};
