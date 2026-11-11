// MEP6 — A água do rio ao copo. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  litros: find("trinta e tres mil"), estacao: find("uma so estacao"), barrento0: find("num rio barrento"), voce: find("voce quer levar"),
  so: find("so que o rio", 0, 0.1), galho: find("traz galho"), grade: find("uma grade"), captacao: find("essa e a captacao"),
  z1: z(0), a1: an(0),
  marrom: find("a agua continua", 0, 0.1), fininho: find("barro fininho"), produto: find("um produto"), flocos: find("em flocos"), quieta: find("agua quieta"), afundam: find("pesam e afundam"), decantador: find("esse e o decantador"),
  z2: z(1), a2: an(1),
  miuda: find("ainda sobra", 0, 0.1), camadas: find("por camadas"), peneira: find("uma peneira gigante"), filtro: find("esse e o filtro"),
  z3: z(2), a3: an(2),
  entope: find("o filtro entope", 0, 0.1), volta: find("entao volta tudo"), debaixo: find("de baixo pra cima"), lava: find("lava a areia"),
  parece: find("a agua parece", 0, 0.1), microbio: find("tem microbio"), cloro: find("poe cloro"), fluor: find("e fluor"),
  z4: z(3), a4: an(3),
  longe: find("a sua casa", 0, 0.1), bombeia: find("voce bombeia"), desce: find("ela desce"), reservatorio: find("esse e o reservatorio"),
  z5: z(4), a5: an(4),
  caminho: find("no caminho", 0, 0.1), tiquinho: find("um tiquinho"), ultima: find("a ultima torneira"),
  agoraSim: find("agora sim"), copo: find("ate o seu copo", 1), manda: find("manda pra quem"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.so, T.marrom, T.miuda, T.entope, T.parece, T.longe, T.caminho]) S.push(["alert", a + 0.05, -12]);
S.push(["rewind", T.volta - 0.05, -12]);
for (const a of [T.captacao, T.decantador, T.filtro, T.reservatorio]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.litros, T.galho]) S.push(["pop", a, -12]);
S.push(["river", 0.2, -14], ["stream", T.so + 0.2, -14], ["clank", T.grade + 0.1, -11], ["pour", T.produto + 0.2, -12], ["drip", T.flocos, -12], ["sink", T.afundam, -11],
  ["gravel", T.camadas, -13], ["drain", T.entope + 0.3, -12], ["gush", T.debaixo, -11], ["splash", T.lava, -13],
  ["sizzle", T.cloro + 0.1, -13], ["pop", T.cloro + 0.4, -13], ["pop", T.cloro + 0.7, -14], ["train", T.bombeia, -15], ["fill", T.bombeia + 0.5, -12], ["waterfall", T.desce, -14],
  ["crack", T.caminho + 0.3, -12], ["pop", T.tiquinho + 0.6, -13],
  ["fanfare", T.agoraSim - 0.05, -6], ["pour", T.agoraSim + 0.6, -11], ["confetti", T.copo, -10]);
export const SFX = S;
