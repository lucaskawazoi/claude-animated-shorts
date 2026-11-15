// MEP14 — A usina, parte 2. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, find } from "../../toy/cues";

export const T = {
  comentarios: find("nos comentarios"), faltou: find("faltou o acucar"), parte: find("parte dois"),
  na: find("na usina"), caldo: find("o caldo nao"), direto: find("direto pro"), alcool: find("pro alcool"),
  primeiro: find("primeiro ele"), limpo: find("e limpo"), lodo: find("o lodo"), filtro: find("do filtro"), torta: find("a torta de filtro"), adubo: find("adubo pra lavoura"), lavoura: find("pra lavoura"),
  prob1: find("chefe tem um probleminha", 0, 0.05), agua: find("quase so agua"), deixa1: find("deixa comigo", 0),
  evap: find("o evaporador"), ferve: find("ferve a agua"), xarope: find("vira xarope"),
  cozedor: find("no cozedor"), engrossa: find("engrossa"), crist: find("e cristaliza"),
  centr: find("a centrifuga"), gira: find("gira"), fica: find("o acucar fica"), melaco: find("escorre o melaco"),
  prob2: find("chefe tem um probleminha", 1, 0.05), ainda: find("o melaco ainda"), naoCrist: find("que nao cristaliza"), deixa2: find("deixa comigo", 1),
  dorna: find("pra dorna"), parteCaldo: find("parte do caldo"), levedura: find("a levedura"), come: find("come"), faz: find("faz alcool"),
  porIsso: find("por isso o acucar"), antes: find("antes do alcool"), quem: find("quem so faz"), destil: find("e destilaria"),
  conta: find("e a conta"), oitenta: find("oitenta e cinco"), numa: find("numa destilaria"), media: find("na media do"), metade: find("metade vai pro acucar"), quarenta: find("quarenta litros"), sessenta: find("sessenta e seis"),
  ja: find("ja o bagaco"), conferiu: find("conferiu"), quinhentas: find("quinhentas toneladas"), cento: find("cento e quarenta"),
  vinhaca: find("e a vinhaca"), dez: find("dez a treze"), acida: find("ela e acida"), cheira: find("cheira forte"), mosca: find("mal manejada"), criam: find("cria mosca"),
  porIsso2: find("por isso a dose"), potassio: find("pelo potassio"), petr: find("petrificar"), nao: find("solo nao"), compacta: find("o que compacta"), caminhao: find("caminhaotanque"), biogas: find("fazer biogas"),
  parabens: find("parabens chefe"), completa: find("agora a usina"), que: find("que outra fabrica"), comenta: find("comenta ai"),
  end: DURATION_S,
};
