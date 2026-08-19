import { HerbalRecipe } from "../types";

export const HERBAL_RECIPES: HerbalRecipe[] = [
  {
    id: "infusao-calmante-ancestral",
    titulo: "Infusão Serenidade Ancestral (Camomila, Melissa e Lavanda)",
    tipo: "Chá / Infusão",
    categoriaBeneficio: "Calmante & Sono",
    tempoPreparo: "10 minutos",
    dificuldade: "Fácil",
    ervasPrincipais: ["Camomila (flores)", "Melissa / Erva-Cidreira (folhas)", "Lavanda (flores secas)"],
    ingredientes: [
      "1 colher de sopa de flores de camomila secas",
      "1 colher de sobremesa de folhas de melissa frescas ou secas",
      "1/2 colher de chá de flores de lavanda culinária",
      "300ml de água mineral fervente",
      "1 colher de café de mel silvestre (opcional)"
    ],
    passoAPasso: [
      "Ferva a água mineral e desligue o fogo assim que surgirem as primeiras bolhas.",
      "Coloque as ervas no bule ou infusor de vidro/cerâmica.",
      "Despeje a água quente sobre as ervas para liberar os óleos essenciais sem queimar as pétalas.",
      "Tampe imediatamente o recipiente para não perder os compostos voláteis (linalol e camazuleno).",
      "Deixe em infusão por 8 a 10 minutos.",
      "Coe com delicadeza e adoce levemente se desejar."
    ],
    posologia: "Tomar 1 xícara morna 40 minutos antes de dormir em ambiente calmo e com pouca luz.",
    contraindicacoes: "Pessoas com alergia conhecida a plantas da família Asteraceae ou em uso de sedativos pesados.",
    segredoAlmanaque: "Prepare este chá na Lua Cheia ou Minguante para potencializar o relaxamento e acalmar o fluxo de pensamentos noturnos."
  },
  {
    id: "xarope-guaco-mel-propolis",
    titulo: "Xarope Dourado de Guaco, Própolis e Gengibre",
    tipo: "Xarope Natural",
    categoriaBeneficio: "Imunidade & Respiração",
    tempoPreparo: "25 minutos",
    dificuldade: "Média",
    ervasPrincipais: ["Guaco (folhas frescas)", "Gengibre (rizoma fresco)", "Extrato de Própolis Verde"],
    ingredientes: [
      "10 folhas frescas e lavadas de Guaco",
      "1 pedaço de 3cm de gengibre fresco ralado",
      "300ml de água filtrada",
      "250g de mel puro de abelha silvestre",
      "15 gotas de extrato de própolis verde"
    ],
    passoAPasso: [
      "Pique as folhas de guaco com as mãos para liberar as glândulas de cumarina.",
      "Coloque a água, as folhas e o gengibre em uma panela esmaltada ou de inox.",
      "Leve ao fogo brando e deixe ferver por 15 minutos até reduzir pela metade.",
      "Coe ainda quente, pressionando as folhas para extrair todo o caldo concentrado.",
      "Aguarde amornar (cerca de 40°C) e incorpore o mel e o própolis, misturando vigorosamente.",
      "Guarde em vidro escuro esterilizado na geladeira (validade de até 30 dias)."
    ],
    posologia: "Adultos: 1 colher de sopa 3 vezes ao dia. Crianças acima de 2 anos: 1 colher de chá 2 a 3 vezes ao dia.",
    contraindicacoes: "Contraindicado para diabéticos descompensados, gestantes e menores de 1 ano (devido ao mel).",
    segredoAlmanaque: "O guaco colhido após o meio-dia concentra mais cumarina em seus tecidos vegetais, tornando o xarope mais expectorante."
  },
  {
    id: "elixir-digestivo-tres-mentas",
    titulo: "Elixir Digestivo de Três Folhas (Boldo, Hortelã e Carqueja)",
    tipo: "Chá / Infusão",
    categoriaBeneficio: "Digestão & Fígado",
    tempoPreparo: "7 minutos",
    dificuldade: "Fácil",
    ervasPrincipais: ["Boldo-do-Chile ou Boldo-da-Terra", "Hortelã-Pimenta", "Carqueja Doce"],
    ingredientes: [
      "1 folha média de boldo fresca ou seca",
      "4 folhas frescas de hortelã-pimenta",
      "1 ramo pequeno de carqueja doce",
      "250ml de água quente (não fervente, cerca de 85°C)"
    ],
    passoAPasso: [
      "Amasse levemente as folhas no fundo da caneca para romper as vesículas aromáticas.",
      "Despeje a água quente sobre as folhas.",
      "Mantenha abafado por 6 minutos.",
      "Coe e tome imediatamente sem adoçar, permitindo que os princípios amargos estimulem as enzimas hepáticas e biliares."
    ],
    posologia: "1 xícara pequena logo após refeições pesadas ou ao primeiro sinal de estufamento gástrico.",
    contraindicacoes: "Obstrução de vias biliares, cálculos vesiculares avançados ou durante a gestação.",
    segredoAlmanaque: "O sabor amargo é um bioindicador natural que avisa ao fígado e vesícula para produzirem suco biliar purificante."
  },
  {
    id: "calda-neem-sabao-organico",
    titulo: "Calda de Sabão de Coco com Óleo de Neem (Defensivo Natural)",
    tipo: "Defensivo Natural",
    categoriaBeneficio: "Jardim & Solo",
    tempoPreparo: "10 minutos",
    dificuldade: "Fácil",
    ervasPrincipais: ["Óleo de Neem puro prensado a frio", "Sabão de coco 100% vegetal"],
    ingredientes: [
      "5ml (1 colher de chá) de óleo de neem puro",
      "5ml de sabão de coco líquido neutro (ou 1 colher de raspas dissolvidas em água morna)",
      "1 litro de água desclorada ou água de chuva",
      "1 borrifador limpo"
    ],
    passoAPasso: [
      "Misture primeiro o sabão de coco com o óleo de neem em um copo com 50ml de água morna para emulsionar perfeitamente o óleo.",
      "Despeje a emulsão na garrafa de 1 litro com o restante da água fria.",
      "Agite energicamente para que a solução fique leitosa e homogênea.",
      "Borrife na face superior e principalmente inferior das folhas infestadas."
    ],
    posologia: "Preventivo: 1 vez a cada 15 dias. Corretivo (infestação ativa de pulgões, cochonilhas ou ácaros): a cada 4 dias por 3 aplicações consecutivas.",
    contraindicacoes: "NUNCA aplique sob sol forte ou calor intenso (risco de queimar as folhas). Aplique sempre no final da tarde.",
    segredoAlmanaque: "O óleo de neem interrompe o ciclo reprodutivo e hormonal das pragas sem prejudicar joaninhas ou abelhas se aplicado ao entardecer."
  },
  {
    id: "biofertilizante-potassio-banana",
    titulo: "Elixir Floral de Potássio & Fósforo (Casca de Banana e Cinzas)",
    tipo: "Biofertilizante Orgânico",
    categoriaBeneficio: "Jardim & Solo",
    tempoPreparo: "3 dias (fermentação suave)",
    dificuldade: "Fácil",
    ervasPrincipais: ["Cascas de banana orgânicas", "Cinzas de lareira ou fogão a lenha", "Cascas de ovos secas trituradas"],
    ingredientes: [
      "Cascas de 4 bananas maduras picadas",
      "1 colher de sopa cheia de cinzas de madeira vegetal não tratada",
      "Cascas secas de 3 ovos moídas até virar farinha",
      "2 litros de água limpa"
    ],
    passoAPasso: [
      "Pique as cascas de banana e coloque em um jarro com 1,5L de água.",
      "Deixe descansar em local sombreado coberto com pano por 48 horas.",
      "Bata no liquidificador junto com as cascas e a farinha de ovos.",
      "Acrescente a colher de cinzas e coe o líquido grosso.",
      "Dilua 1 parte desse concentrado em 2 partes de água limpa antes de regar o solo."
    ],
    posologia: "Regar o solo ao redor do caule a cada 15 dias durante a época de floração e formação de frutos.",
    contraindicacoes: "Não armazenar fechado hermeticamente por mais de 5 dias pois fermenta e gera gases.",
    segredoAlmanaque: "O potássio orgânico da casca de banana é absorvido pelas raízes na Lua Nova e Crescente, enchendo as plantas de flores coloridas e frutos suculentos."
  },
  {
    id: "cha-cavalinha-antifungico",
    titulo: "Chá Protetor de Cavalinha Rico em Silício (Anti-Fúngico Vegetal)",
    tipo: "Biofertilizante Orgânico",
    categoriaBeneficio: "Jardim & Solo",
    tempoPreparo: "20 minutos",
    dificuldade: "Fácil",
    ervasPrincipais: ["Cavalinha (Equisetum arvense fresca ou desidratada)"],
    ingredientes: [
      "50g de cavalinha fresca ou 20g de cavalinha seca",
      "1 litro de água mineral ou filtrada",
      "1 borrifador fino"
    ],
    passoAPasso: [
      "Ferva a cavalinha na água por 15 minutos em fogo baixo (decocção).",
      "Deixe esfriar completamente com a panela tampada.",
      "Coe em pano fino e coloque no borrifador.",
      "Borrife sobre plantas com tendência a oídio, míldio, ferrugem ou manchas pretas nas folhas."
    ],
    posologia: "Borrife semanalmente como escudo biológico fortalecedor de parede celular.",
    contraindicacoes: "Uso 100% seguro para plantas ornamentais, hortas e pomares.",
    segredoAlmanaque: "A cavalinha é a planta mais rica em silício do reino vegetal. O silício cria uma micro-armadura mineral nas células das folhas, impedindo que os fungos consigam penetrar seus micélios."
  }
];
