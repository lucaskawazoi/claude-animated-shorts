// Episódio «rua» v2 — por que o buraco da sua rua volta, e a conta. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
// v2 (Lucas, 18/11 14h15–14h18): bordão «Resolveu? Ainda não.» no lugar de «Zerou?», voz mais solta e a camada de custo.
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
const prob = (n: number) => find("chefe", n, 0.1), deixa = (n: number) => find("deixa comigo", n);
export const T = {
  buraco: find("esse buraco"), tapado: find("tapado tres vezes"), camada: find("camada por camada"),
  terra: find("embaixo de tudo"), rolo: find("apertada pelo rolo"), pedra: find("pedra britada"), espalha: find("que espalha"), asfalto: find("e por cima"), cinco: find("uns cinco"),
  prob1: prob(0), racha: find("racham o asfalto"), chuva: find("a chuva entra"), trinca: find("pela trinca"), deixa1: deixa(0), meio: find("mais alta no meio"), guia: find("ate a guia"), sarjeta: find("corre pela sarjeta"),
  z1: z(0), a1: an(0),
  prob2: prob(1), enche: find("a sarjeta enche"), alaga: find("alaga a esquina"), deixa2: deixa(1), boca: find("a boca de lobo"), galeria: find("pra galeria"), rio: find("ate o rio"), pato: find("lembra do pato"), praia: find("em cidade de praia"), mar: find("o mar pode voltar"),
  z2: z(1), a2: an(1),
  prob3: prob(2), amolece: find("amolece a pedra"), caminhao: find("passa o caminhao"), eixo: find("um eixo carregado"), carros: find("milhares de carros"), cede: find("a base cede"), quebra: find("o asfalto quebra"), buraco2: find("abre o buraco"),
  deixa3: deixa(2), massa: find("massa fria"), pisa: find("e pisa"), tapa: find("esse e o tapaburaco"),
  z3: z(2), a3: an(2),
  voltou: find("o buraco voltou"), capa: find("tapou so a capa"), mole: find("continua mole"), deixa4: deixa(3), corta: find("corta um retangulo"), tira: find("tira o estragado"), firme: find("chao firme"),
  refaz: find("refaz e compacta"), compacta: find("compacta a base"), quente: find("asfalto quente"), remendo: find("esse e o remendo"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  conta: find("e a conta"), tonelada: find("uma tonelada"), quinhentos: find("uns quinhentos"), oito: find("uns oito"), medir: find("tem que medir"), auditoria: find("uma auditoria"), pagaram: find("pagaram cinco"),
  quemPaga: find("quem paga"), quemEscolhe: find("quem escolhe"), qual: find("qual buraco"), comenta: find("comenta ai"),
  end: DURATION_S,
};
/** quando as bordas do remendo ficam seladas (não é dito; acontece no fim do asfalto quente) */
export const SELA = T.remendo - 0.5;

/** cortes secos: um onde a HISTÓRIA vira (camada, problema, solução, «Resolveu?», a conta), quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  3.0, T.camada, T.terra, T.pedra, T.asfalto, T.cinco, T.prob1, T.racha, T.trinca, T.meio, T.sarjeta, T.z1,
  T.prob2, T.alaga, T.boca, T.galeria, T.pato, T.mar, T.z2,
  T.prob3, T.caminhao, T.eixo, T.cede, T.buraco2, T.massa, T.pisa, T.z3,
  T.voltou, T.capa, T.corta, T.tira, T.refaz, T.quente, T.remendo, T.agoraSim,
  T.conta, T.oito, T.medir, T.quemPaga, T.quemEscolhe, T.qual,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.prob1, T.prob2, T.prob3, T.voltou]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.guia, T.sarjeta, T.boca, T.galeria, T.tapa, T.remendo]) S.push(["ding", a + 0.05, -10]);
S.push(
  ["thud", T.buraco + 0.6, -9], ["splash", T.buraco + 0.75, -11], ["rewind", T.camada, -12],
  ["dig", T.terra + 0.1, -13], ["thud", T.rolo + 0.2, -12], ["gravel", T.pedra, -11], ["gravel", T.pedra + 0.5, -13], ["pour", T.asfalto + 0.1, -12], ["steam", T.asfalto + 0.4, -15], ["tick", T.cinco + 0.2, -12],
  ["crack", T.racha + 0.1, -10], ["rain", T.chuva - 0.3, -16], ["drip", T.trinca + 0.2, -12], ["slide", T.meio + 0.2, -13], ["stream", T.sarjeta, -14],
  ["fill", T.enche, -13], ["wave", T.alaga, -12], ["drain", T.boca + 0.3, -11], ["gush", T.galeria, -12], ["quack", T.pato + 0.55, -12], ["wave", T.mar, -15], ["rubber", T.mar + 0.9, -13],
  ["squelch", T.amolece + 0.2, -12], ["mud", T.amolece + 0.9, -13], ["horn", T.caminhao + 0.1, -14], ["beep", T.caminhao + 0.6, -15], ["beep", T.caminhao + 1.2, -15], ["beep", T.eixo + 0.3, -15], ["beep", T.eixo + 0.9, -15],
  ["quake", T.eixo, -13], ["creak", T.cede, -12], ["crack", T.quebra, -8], ["stone", T.quebra + 0.2, -11],
  ["pour", T.massa, -11], ["thud", T.pisa + 0.1, -10], ["thud", T.pisa + 0.4, -11],
  ["thud", T.voltou + 0.35, -10], ["splash", T.voltou + 0.45, -12], ["sad", T.capa, -16],
  ["drill", T.corta, -14], ["scrape", T.tira, -12], ["dig", T.firme, -13], ["gravel", T.refaz, -12], ["thud", T.compacta, -12], ["thud", T.compacta + 0.25, -13], ["thud", T.compacta + 0.5, -13],
  ["pourmetal", T.quente, -13], ["sizzle", T.quente + 0.3, -15], ["steam", T.quente + 0.5, -14],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10],
  ["thud", T.tonelada + 0.3, -10], ["coins", T.quinhentos, -13], ["pour", T.oito, -13], ["tick", T.medir + 0.3, -12], ["tick", T.medir + 0.6, -12], ["stamp", T.pagaram, -12],
  ["coins", T.quemPaga, -14], ["pop", T.quemEscolhe + 0.3, -13], ["pop", T.qual, -11],
);
export const SFX = S;
