// MEP13 — Do eucalipto ao papel. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, find } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  sete: find("com uns sete anos", 0, 0.1), anos: find("sete anos"), anos4: find("sete anos") + 0.45, metade: find("cerca de metade"), nem: find("nem virou papel"), entao: find("entao virou"), que: find("o que", 0, 0.05),
  flor: find("a floresta plantada"), tora: find("vira tora"), cam: find("no caminhao"),
  soque1: find("so que a casca", 0, 0.1), suja: find("suja a polpa"), z1: z(0), a1: an(0),
  ai2: find("ai a tora gira"), tambor: find("num tambor"), arranca: find("arranca a casca"), descT: find("esse e o descascador"),
  depois: find("depois uma maquina"), lascas: find("em lascas"), picT: find("essa e a picadora"),
  soque2: find("so que as fibras", 0, 0.1), colad: find("vem coladas"), lign: find("com lignina"), z2: z(1), a2: an(1),
  ai3: find("ai as lascas"), panela: find("panela de pressao"), quente: find("com agua quente"), quim: find("produtos quimicos"), cola: find("a cola se dissolve"), soltam: find("as fibras se soltam"), digT: find("esse e o digestor"),
  soque3: find("so que a massa", 0, 0.1), marrom: find("sai marrom"), z3: z(2), a3: an(2),
  ent2: find("entao a massa"), lavada: find("e lavada"), clar: find("e clareada"), torT: find("essa e a torre"),
  mas4: find("mas essa polpa", 0, 0.1), agua: find("quase so agua"), folha: find("agua nao vira folha"), z4: z(3), a4: an(3),
  ai4: find("ai muitas vezes"), outra: find("em outra fabrica"), tela: find("numa tela que anda"), rolos: find("rolos prensam"), cilin: find("cilindros quentes"), bobina: find("sai uma bobina"), maqT: find("essa e a maquina de papel"),
  soque5: find("so que la atras", 0, 0.1), caldo: find("um caldo escuro"), licor: find("o licor preto cheio"), cheio: find("cheio de lignina"), quim2: find("e de produtos quimicos"), z5: z(4), a5: an(4),
  ai5: find("ai o licor preto queima"), queima: find("queima numa caldeira"), fogo: find("o fogo faz vapor"), turb: find("gira a turbina"), energia: find("gera a propria energia"),
  varias: find("em varias fabricas"), sobra: find("ainda sobra"), vender: find("pra vender"), casca: find("a casca vai"), comb: find("tambem vira combustivel"), maior: find("e a maior parte"), quimB: find("dos produtos quimicos"), volta: find("volta pro digestor"), calT: find("essa e a caldeira de recuperacao"),
  agoraSim: find("agora sim"), zerou: find("sim zerou"), brasil: find("o brasil fez"), ton: find("toneladas de celulose"), ano: find("em dois mil"), mostra: find("mostra pra quem"), pensar: find("sem pensar"),
  end: DURATION_S,
};

