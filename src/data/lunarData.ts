import { LunarPhaseInfo } from "../types";

export interface MonthlyGuide {
  mes: string;
  estacao: string;
  destaques: string[];
  oQueSemear: string[];
  oQueColher: string[];
  manejos: string[];
  dicaTradicional: string;
}

// Astronomical calculation of current moon phase
export function getAstronomicalMoonPhase(targetDate = new Date()): {
  phaseKey: "nova" | "crescente" | "cheia" | "minguante";
  phaseName: "Lua Nova" | "Lua Quarto Crescente" | "Lua Cheia" | "Lua Quarto Minguante";
  illumination: number;
  ageDays: number;
  icon: string;
} {
  // Known reference new moon: Jan 11, 2024 at 11:57 UTC
  const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const current = targetDate.getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000; // in ms
  
  const diff = current - knownNewMoon;
  const cycle = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const ageDays = (cycle / synodicMonth) * 29.53058867;

  // Illumination calculation (approximate cosine)
  const illumination = Math.round((1 - Math.cos((ageDays / 29.53058867) * 2 * Math.PI)) * 50);

  if (ageDays < 3.69 || ageDays >= 25.84) {
    return {
      phaseKey: "nova",
      phaseName: "Lua Nova",
      illumination,
      ageDays: Math.round(ageDays * 10) / 10,
      icon: "🌑"
    };
  } else if (ageDays < 11.07) {
    return {
      phaseKey: "crescente",
      phaseName: "Lua Quarto Crescente",
      illumination,
      ageDays: Math.round(ageDays * 10) / 10,
      icon: "🌓"
    };
  } else if (ageDays < 18.45) {
    return {
      phaseKey: "cheia",
      phaseName: "Lua Cheia",
      illumination,
      ageDays: Math.round(ageDays * 10) / 10,
      icon: "🌕"
    };
  } else {
    return {
      phaseKey: "minguante",
      phaseName: "Lua Quarto Minguante",
      illumination,
      ageDays: Math.round(ageDays * 10) / 10,
      icon: "🌗"
    };
  }
}

export const LUNAR_PHASES_DETAILS: Record<string, LunarPhaseInfo> = {
  nova: {
    nome: "Lua Nova",
    icone: "🌑",
    iluminacao: 0,
    influenciaSeiva: "A força gravitacional combinada da Lua e Sol atrai a seiva para a base do tronco, colo e raízes. A planta entra em um repouso sutil e restauração subterrânea.",
    focoPlantio: [
      "Árvores florestais e mudas com torrão fechado",
      "Sementes de germinação lenta e casca dura (milho, feijão)",
      "Plantas para adubação verde e cobertura de solo",
      "Replantio de mudas perenes e estacas lenhosas"
    ],
    focoManejo: [
      "Aplicação de biofertilizantes e adubo no solo (a absorção radicular está no ápice)",
      "Capina e controle mecânico de ervas invasoras",
      "Eliminação de pragas de solo",
      "Preparo de canteiros e aeração da terra"
    ],
    evitarNestaFase: [
      "Colheita de folhas medicinais aromáticas (seiva recolhida)",
      "Regas em excesso sobre a folhagem",
      "Podas que estimulem brotação imediata"
    ],
    proverbio: "Na Lua Nova, a terra descansa e a raiz sonha com as profundezas."
  },
  crescente: {
    nome: "Lua Quarto Crescente",
    icone: "🌓",
    iluminacao: 50,
    influenciaSeiva: "A luminosidade noturna aumenta e a seiva começa a subir com vigor pelo caule, acelerando o desenvolvimento foliar, a expansão de brotos e a fotossíntese.",
    focoPlantio: [
      "Hortaliças de folha (alface, rúcula, espinafre, couve, bertalha)",
      "Ervas aromáticas e medicinais (alecrim, manjericão, hortelã, salsa)",
      "Frutíferas e legumes que frutificam acima do solo (tomate, pimentão, berinjela, morango)",
      "Enxertia e transplante de mudas jovens"
    ],
    focoManejo: [
      "Regas generosas (a taxa de evapotranspiração aumenta)",
      "Adubação foliar orgânica com biofertilizantes líquidos",
      "Desbaste de brotos ladrões para direcionar o vigor",
      "Semeadura em sementeiras"
    ],
    evitarNestaFase: [
      "Podas drásticas de ramos lenhosos (a planta perde muita seiva)",
      "Colheita de raízes e tubérculos (ficarão menos aromáticos e mais fibrosos)"
    ],
    proverbio: "O que cresce para o céu, na Lua Crescente encontra o seu véu."
  },
  cheia: {
    nome: "Lua Cheia",
    icone: "🌕",
    iluminacao: 100,
    influenciaSeiva: "A seiva atinge seu ponto mais alto nas extremidades dos ramos, flores e frutos. A atividade fotossintética noturna atinge o pico sob a luz lunar refletida.",
    focoPlantio: [
      "Flores ornamentais e sementes de rápido vigor",
      "Frutíferas que florescem abundantemente",
      "Milho, abóbora e melancia"
    ],
    focoManejo: [
      "Colheita de ervas aromáticas para chás e fitoterapia (máxima concentração de óleos essenciais)",
      "Colheita de frutos suculentos (maior teor de açúcares naturais e perfume)",
      "Polinização manual de espécies raras",
      "Observação e proteção contra lagartas noturnas que são atraídas pela luz"
    ],
    evitarNestaFase: [
      "Qualquer tipo de corte ou poda cirúrgica (risco de infecção e perda de vigor)",
      "Transplante de raízes sensíveis",
      "Adubação química de liberação rápida"
    ],
    proverbio: "Lua Cheia no firmamento, o remédio da folha ganha seu maior talento."
  },
  minguante: {
    nome: "Lua Quarto Minguante",
    icone: "🌗",
    iluminacao: 50,
    influenciaSeiva: "A luz declina e a seiva começa a migrar de volta para as raízes e caules subterrâneos. A casca se fortalece e a madeira endurece.",
    focoPlantio: [
      "Raízes, tubérculos e bulbos (cenoura, beterraba, gengibre, cúrcuma, alho, cebola, batata-doce, rabanete)",
      "Plantio de sementes para dormência inicial sadia",
      "Mudas de estacas que precisam enraizar primeiro"
    ],
    focoManejo: [
      "Podas de limpeza, condução e formação (cicatrização ultra rápida)",
      "Colheita de raízes medicinais (gengibre, cúrcuma, espinheira-santa)",
      "Corte de madeira e bambu para construção (menor risco de carunchos e brocas)",
      "Controle natural de pragas e fungos (calda de sabão, cinzas e enxofre)"
    ],
    evitarNestaFase: [
      "Semear folhosas precoces que possam espigar antes da hora",
      "Colheita de flores delicadas para conservação fresca"
    ],
    proverbio: "Na Minguante corta o galho e colhe a raiz, para ver teu jardim sempre feliz."
  }
};

export const MONTHLY_CALENDAR: MonthlyGuide[] = [
  {
    mes: "Janeiro",
    estacao: "Verão",
    destaques: ["Calor e chuvas intensas", "Pico de crescimento vegetativo", "Atenção a fungos em dias abafados"],
    oQueSemear: ["Manjericão", "Ora-pro-nóbis", "Quiabo", "Abóbora", "Capim-Limão", "Girassol"],
    oQueColher: ["Hortelã", "Milho verde", "Tomates de verão", "Pitanga", "Jabuticaba"],
    manejos: ["Mulching (cobertura morta) para reter umidade e evitar aquecimento das raízes", "Regas sempre nas primeiras horas da manhã"],
    dicaTradicional: "Janeiro molhado, ano abençoado no roçado."
  },
  {
    mes: "Fevereiro",
    estacao: "Verão",
    destaques: ["Maturação de sementes", "Época nobre para compostagem acelerada"],
    oQueSemear: ["Pimentas", "Alecrim (estaquia)", "Cebolinha", "Salsa", "Couve"],
    oQueColher: ["Frutos maduros", "Erva-cidreira", "Camomila", "Maracujá"],
    manejos: ["Monitorar pulgões e cochonilhas; aplicar calda de sabão neutro ao entardecer"],
    dicaTradicional: "Fevereiro quente traz colheita excelente."
  },
  {
    mes: "Março",
    estacao: "Transição Verão / Outono",
    destaques: ["Equinócio de Outono", "Dias mais amenos", "Excelente para preparar canteiros de inverno"],
    oQueSemear: ["Espinafre", "Beterraba", "Rabanete", "Cenoura", "Rúcula", "Ervilha"],
    oQueColher: ["Gengibre", "Cúrcuma", "Abóboras curadas", "Flores de Lavanda"],
    manejos: ["Iniciar podas de galhos secos após a colheita de verão", "Incorporação de composto orgânico maduro"],
    dicaTradicional: "Em Março, a terra respira e o solo se prepara para o descanso nobre."
  },
  {
    mes: "Abril",
    estacao: "Outono",
    destaques: ["Umidade amena", "Diminuição das chuvas", "Tempo perfeito para ervas medicinais perenes"],
    oQueSemear: ["Brócolis", "Couve-flor", "Camomila", "Alho", "Cebola", "Calêndula"],
    oQueColher: ["Guaco para secagem", "Batata-doce", "Mandioca"],
    manejos: ["Reduzir ligeiramente a frequência de rega para evitar apodrecimento", "Adubação com cinzas de madeira para floração"],
    dicaTradicional: "Quem semeia no outono colhe a saúde no inverno."
  },
  {
    mes: "Maio",
    estacao: "Outono",
    destaques: ["Noites frescas", "Menos pragas ativas", "Semeadura de raízes medicinais"],
    oQueSemear: ["Alho roxo", "Cenoura de inverno", "Ervilha torta", "Sálvia", "Tomilho"],
    oQueColher: ["Espinheira-Santa", "Capim-Santo", "Mandioca de mesa"],
    manejos: ["Proteção contra ventos frios nas mudas jovens", "Revolvimento suave do solo para arejar as raízes"],
    dicaTradicional: "Maio de orvalho forte enche o pomar de sorte."
  },
  {
    mes: "Junho",
    estacao: "Início do Inverno",
    destaques: ["Solstício de Inverno", "Menor incidência de luz solar", "Dormência de muitas espécies"],
    oQueSemear: ["Rúcula", "Agrião d'água", "Mostarda", "Ervilhas", "Trigo para germinar"],
    oQueColher: ["Cítricos (Laranjas, Tangerinas, Limões)", "Gengibre maduro", "Cúrcuma"],
    manejos: ["Podas drásticas de frutíferas de clima temperado (videiras, figueiras, macieiras)", "Regas apenas no meio da manhã"],
    dicaTradicional: "No inverno, o fogo da planta desce para o coração da raiz."
  },
  {
    mes: "Julho",
    estacao: "Inverno",
    destaques: ["Frio intenso no Centro-Sul", "Período ideal para enxertia e podas estruturais"],
    oQueSemear: ["Alfaces de inverno", "Rabanetes", "Beterrabas", "Cebolinhas", "Flores de Amor-Perfeito"],
    oQueColher: ["Couve manteiga crocante", "Brócolis", "Folhas secas de Guaco"],
    manejos: ["Evitar molhar as folhas ao final da tarde para prevenir geadas e fungos", "Proteger suculentas de excesso de umidade"],
    dicaTradicional: "Julho frio e seco fortalece a madeira e cura o tronco oco."
  },
  {
    mes: "Agosto",
    estacao: "Final do Inverno",
    destaques: ["Tempo seco", "Primeiros sinais de brotação de primavera", "Florada do Ipê-Amarelo"],
    oQueSemear: ["Tomate", "Pimentão", "Manjericão em sementeira", "Melão", "Flores melíferas"],
    oQueColher: ["Alho", "Cebola curada", "Cítricos tardios"],
    manejos: ["Limpeza geral de vasos", "Troca de substrato de plantas ornamentais de interior", "Adubação com torta de mamona ou húmus"],
    dicaTradicional: "Agosto sopra o vento que acorda as sementes no solo sedento."
  },
  {
    mes: "Setembro",
    estacao: "Primavera",
    destaques: ["Equinócio de Primavera", "Despertar botânico em massa", "Retorno dos polinizadores"],
    oQueSemear: ["Todas as ervas aromáticas", "Ora-pro-nóbis", "Flores comestíveis (Capuchinha, Amor-Perfeito)", "Abobrinha"],
    oQueColher: ["Flores de Camomila", "Folhas tenras de Primavera", "Morangos"],
    manejos: ["Intensificar adubação orgânica líquida", "Aumentar a rega conforme a temperatura sobe", "Instalar estacas de suporte"],
    dicaTradicional: "Setembro florido, ano inteiro nutrido."
  },
  {
    mes: "Outubro",
    estacao: "Primavera",
    destaques: ["Chuvas da primavera", "Brotações vigorosas", "Época áurea para estaquia"],
    oQueSemear: ["Milho doce", "Feijão de vagem", "Pimentas ornamentais", "Jiló", "Melancia"],
    oQueColher: ["Morangos doces", "Sálvia", "Tomilho", "Hortelã fresca"],
    manejos: ["Monitoramento diário de lagartas e besouros", "Espalhar cobertura morta vegetal fresca"],
    dicaTradicional: "Outubro chuvoso faz o pomar viçoso."
  },
  {
    mes: "Novembro",
    estacao: "Primavera / Pré-Verão",
    destaques: ["Calor crescente", "Frutificação acelerada", "Floração de árvores nativas"],
    oQueSemear: ["Abóbora menina", "Quiabo", "Maracujá doce", "Girassol gigante", "Taioba"],
    oQueColher: ["Jabuticaba", "Amoras silvestres", "Couve", "Alecrim"],
    manejos: ["Tutoramento de ramos pesados com frutos", "Aplicação preventiva de óleo de neem nas folhas"],
    dicaTradicional: "Novembro quente e iluminado traz o cesto bem pesado."
  },
  {
    mes: "Dezembro",
    estacao: "Verão",
    destaques: ["Solstício de Verão", "Dias mais longos do ano", "Abundância de flores e frutos tropicais"],
    oQueSemear: ["Manjericão roxo", "Capim-Limão", "Pimentas nucleares", "Beldroega", "Feijão guandu"],
    oQueColher: ["Manga", "Pitanga", "Jabuticaba", "Ervas frescas para ceias de fim de ano"],
    manejos: ["Garantir regas regulares nos horários frescos", "Sombra temporária para mudas recém-transplantadas"],
    dicaTradicional: "Dezembro de sol e flor fecha o ciclo com amor e vigor."
  }
];

export const BOTANICAL_PROVERBS = [
  "A planta não tem pressa para florescer, mas nunca perde o tempo da primavera.",
  "Regar na hora certa é dar à raiz a bênção da água; regar em excesso é tirar o ar que ela respira.",
  "Quem conhece a folha do mato nunca caminha desamparado na floresta.",
  "A terra viva tem cheiro de floresta úmida e o coração de quem cuida.",
  "Na Lua Crescente até o broto tímido ganha coragem de subir.",
  "As raízes mais fortes crescem no silêncio da terra escura.",
  "Colha a erva pela manhã com o orvalho seco, e a tua xícara terá a essência do sol.",
  "O melhor adubo que uma horta pode receber é o olhar diário do seu cuidador."
];
