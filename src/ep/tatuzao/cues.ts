// MEP8 — O tatuzão (Linha 6-Laranja, São Paulo). Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  duas: find("duas mil"), cento: find("cento e nove"), sp: find("debaixo de sao paulo"), voce: find("voce quer um"),
  mas: find("mas se voce", 0, 0.1), rua: find("abre a rua"), para: find("a cidade para"), cava: find("ai voce cava"), roda: find("uma roda"), tatuzao: find("esse e o tatuzao"),
  z1: z(0), a1: an(0),
  terra: find("a terra que fica", 0, 0.1), desmorona: find("desmorona"), volta: find("entao volta tudo"), escudo: find("escudo de aco"),
  braco: find("um braco"), nove: find("nove pecas"), sessenta: find("sessenta toneladas"), tunel: find("esse e o tunel"),
  z2: z(1), a2: an(1),
  frente: find("la na frente", 0, 0.1), afundar: find("pode afundar"), apertada: find("terra apertada"), camara: find("essa e a camara"),
  z3: z(2), a3: an(2),
  arranca: find("a maquina arranca", 0, 0.1), parafuso: find("um parafuso"), esteira: find("numa esteira"), rosca: find("essa e a rosca"),
  z4: z(3), a4: an(3),
  fresta: find("entre o anel", 0, 0.1), argamassa: find("injeta argamassa"), anda: find("enquanto a maquina"),
  z5: z(4), a5: an(4),
  caminho: find("no caminho", 0, 0.1), estacao: find("fecha a estacao"), vinte: find("vinte e quatro"),
  agoraSim: find("agora sim"), nove2: find("quase nove"), so: find("uma maquina so"), manda: find("manda pra quem"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.mas, T.terra, T.frente, T.arranca, T.fresta, T.caminho]) S.push(["alert", a + 0.05, -12]);
S.push(["rewind", T.volta - 0.05, -12]);
for (const a of [T.tatuzao, T.tunel, T.camara, T.rosca]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.duas, T.cento, T.nove, T.sessenta, T.vinte]) S.push(["pop", a, -12]);
S.push(["dig", 0.3, -14], ["horn", T.para, -10], ["horn", T.para + 0.5, -13], ["dig", T.cava + 0.3, -11], ["chisel", T.roda, -13],
  ["landslide", T.desmorona, -10], ["clank", T.escudo, -11], ["thud", T.braco + 0.6, -11], ["thud", T.nove, -12], ["stone", T.sessenta, -13],
  ["river", T.frente + 0.3, -14], ["crack", T.afundar, -10], ["mud", T.apertada, -12], ["drag", T.arranca + 0.3, -13], ["clack", T.parafuso + 0.3, -12], ["gravel", T.esteira, -13],
  ["concrete", T.argamassa, -11], ["train", T.caminho + 0.4, -12], ["gavel", T.estacao + 0.3, -12], ["quake", T.vinte, -14],
  ["fanfare", T.agoraSim - 0.05, -6], ["confetti", T.nove2, -10], ["cheer", T.so, -13]);
export const SFX = S;
