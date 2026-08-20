import { UserPlant, PlantEntry } from "../types";

export interface TeaHerbProfile {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  parteUsada: "Folhas" | "Flores" | "Ramos & Folhas" | "Rizoma / Raiz" | "Sementes";
  perfilSabor: "Aromático / Refrescante" | "Floral & Adocicado" | "Herbal & Estimulante" | "Amargo / Digestivo" | "Cítrico & Suave" | "Picante & Quente";
  propriedadesPrincipais: string[];
  compostosAtivos: string[];
  temperaturaAgua: string;
  tempoInfusao: string;
  funcaoNaMistura: "Erva Base (Volume)" | "Erva Ativa (Terapêutica)" | "Erva Aromática (Sabor)" | "Erva Harmonizadora";
}

export interface GardenTeaRecipe {
  id: string;
  titulo: string;
  subtitulo: string;
  objetivoTerapeutico: "Calmante & Sono" | "Digestão & Fígado" | "Foco & Disposição" | "Imunidade & Respiração" | "Relaxamento Muscular" | "Detox & Depurativo";
  tempoPreparo: string;
  dificuldade: "Fácil" | "Média";
  melhorHorario: "Manhã (Despertar)" | "Após o Almoço" | "Tarde (Revigorar)" | "Noite (Antes de Dormir)" | "Qualquer Horário";
  ingredientesObrigatorios: {
    nomeErva: string;
    sinonimos: string[];
    quantidadeSugerida: string;
    frescaOuSeca: string;
  }[];
  ingredientesOpcionais?: {
    nomeErva: string;
    quantidadeSugerida: string;
  }[];
  modoPreparo: string[];
  segredoAlmanaque: string;
  proporcoesRecomendadas: string;
  contraindicacoes?: string;
}

export interface GardenTeaMatch {
  recipe: GardenTeaRecipe;
  totalRequired: number;
  availableCount: number;
  matchPercentage: number;
  availablePlants: {
    userPlant: UserPlant;
    matchedHerbName: string;
  }[];
  missingHerbs: string[];
  isFullyAvailable: boolean;
}

export const TEA_HERBS_CATALOG: Record<string, TeaHerbProfile> = {
  "lavanda-officinalis": {
    id: "lavanda-officinalis",
    nomePopular: "Lavanda",
    nomeCientifico: "Lavandula angustifolia",
    parteUsada: "Flores",
    perfilSabor: "Floral & Adocicado",
    propriedadesPrincipais: ["Calmante", "Ansiolítico", "Relaxante muscular", "Indutor do sono"],
    compostosAtivos: ["Linalol", "Acetato de linalila", "Flavonoides"],
    temperaturaAgua: "90°C (não fervente)",
    tempoInfusao: "5 a 8 minutos com tampa",
    funcaoNaMistura: "Erva Harmonizadora",
  },
  "alecrim-rosmarinus": {
    id: "alecrim-rosmarinus",
    nomePopular: "Alecrim",
    nomeCientifico: "Salvia rosmarinus",
    parteUsada: "Ramos & Folhas",
    perfilSabor: "Herbal & Estimulante",
    propriedadesPrincipais: ["Tônico cerebral", "Foco mental", "Circulatório", "Digestivo leve"],
    compostosAtivos: ["Ácido rosmarínico", "1,8-Cineol", "Cânfora"],
    temperaturaAgua: "95°C",
    tempoInfusao: "7 a 10 minutos com tampa",
    funcaoNaMistura: "Erva Ativa (Terapêutica)",
  },
  "hortela-piperita": {
    id: "hortela-piperita",
    nomePopular: "Hortelã",
    nomeCientifico: "Mentha x piperita",
    parteUsada: "Folhas",
    perfilSabor: "Aromático / Refrescante",
    propriedadesPrincipais: ["Digestivo", "Descongestionante", "Espasmolítico", "Refrescante"],
    compostosAtivos: ["Mentol", "Mentona", "Limoneno"],
    temperaturaAgua: "85°C a 90°C",
    tempoInfusao: "5 a 7 minutos com tampa",
    funcaoNaMistura: "Erva Base (Volume)",
  },
  "manjericao-basilico": {
    id: "manjericao-basilico",
    nomePopular: "Manjericão",
    nomeCientifico: "Ocimum basilicum",
    parteUsada: "Folhas",
    perfilSabor: "Aromático / Refrescante",
    propriedadesPrincipais: ["Anti-estresse", "Antioxidante", "Digestivo", "Alívio de tensão cefálica"],
    compostosAtivos: ["Eugenol", "Linalol", "Estragol"],
    temperaturaAgua: "90°C",
    tempoInfusao: "6 a 8 minutos com tampa",
    funcaoNaMistura: "Erva Aromática (Sabor)",
  },
  "camomila-chamomilla": {
    id: "camomila-chamomilla",
    nomePopular: "Camomila",
    nomeCientifico: "Matricaria chamomilla",
    parteUsada: "Flores",
    perfilSabor: "Floral & Adocicado",
    propriedadesPrincipais: ["Calmante", "Anti-inflamatório gástrico", "Sedativo suave"],
    compostosAtivos: ["Apigenina", "Camazuleno", "Bisabolol"],
    temperaturaAgua: "90°C",
    tempoInfusao: "8 a 10 minutos com tampa",
    funcaoNaMistura: "Erva Base (Volume)",
  },
  "guaco-mikania": {
    id: "guaco-mikania",
    nomePopular: "Guaco",
    nomeCientifico: "Mikania glomerata",
    parteUsada: "Folhas",
    perfilSabor: "Herbal & Estimulante",
    propriedadesPrincipais: ["Expectorante", "Broncodilatador", "Calmante de tosse"],
    compostosAtivos: ["Cumarina", "Diterpenos cauranos"],
    temperaturaAgua: "100°C (ou fervura leve de 3 min)",
    tempoInfusao: "10 minutos abafado",
    funcaoNaMistura: "Erva Ativa (Terapêutica)",
  },
  "boldo-barbatus": {
    id: "boldo-barbatus",
    nomePopular: "Boldo",
    nomeCientifico: "Plectranthus barbatus",
    parteUsada: "Folhas",
    perfilSabor: "Amargo / Digestivo",
    propriedadesPrincipais: ["Hepatoprotetor", "Digestivo", "Estimulante biliar", "Alívio de azia"],
    compostosAtivos: ["Barbatusina", "Forskoline", "Flavonoides"],
    temperaturaAgua: "80°C a 85°C (não ferver)",
    tempoInfusao: "5 a 7 minutos com tampa",
    funcaoNaMistura: "Erva Ativa (Terapêutica)",
  },
  "capim-limao": {
    id: "capim-limao",
    nomePopular: "Capim-Limão / Cidreira",
    nomeCientifico: "Cymbopogon citratus",
    parteUsada: "Folhas",
    perfilSabor: "Cítrico & Suave",
    propriedadesPrincipais: ["Calmante", "Antiespasmódico", "Hipotensor suave", "Digestivo"],
    compostosAtivos: ["Citral", "Mirceno", "Geraniol"],
    temperaturaAgua: "95°C",
    tempoInfusao: "8 a 10 minutos com tampa",
    funcaoNaMistura: "Erva Base (Volume)",
  },
  "ora-pro-nobis": {
    id: "ora-pro-nobis",
    nomePopular: "Ora-pro-nóbis",
    nomeCientifico: "Pereskia aculeata",
    parteUsada: "Folhas",
    perfilSabor: "Herbal & Estimulante",
    propriedadesPrincipais: ["Nutritivo", "Rico em mucilagens", "Protetor da mucosa gástrica"],
    compostosAtivos: ["Mucilagens", "Flavonoides", "Proteínas vegetais"],
    temperaturaAgua: "90°C",
    tempoInfusao: "5 a 8 minutos",
    funcaoNaMistura: "Erva Harmonizadora",
  }
};

export const MASTER_GARDEN_TEA_RECIPES: GardenTeaRecipe[] = [
  {
    id: "cha-foco-vitalidade-matinal",
    titulo: "Chá Despertar do Pensamento (Alecrim & Hortelã)",
    subtitulo: "Estímulo à cognição, clareza mental e oxigenação cerebral sem cafeína",
    objetivoTerapeutico: "Foco & Disposição",
    tempoPreparo: "8 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Manhã (Despertar)",
    ingredientesObrigatorios: [
      {
        nomeErva: "Alecrim",
        sinonimos: ["alecrim", "rosmarinus", "salvia rosmarinus"],
        quantidadeSugerida: "1 ramo pequeno fresco (ou 1 colher de chá seco)",
        frescaOuSeca: "Fresco ou Seco",
      },
      {
        nomeErva: "Hortelã",
        sinonimos: ["hortelã", "hortela", "mentha", "menta"],
        quantidadeSugerida: "4 a 6 folhas frescas",
        frescaOuSeca: "Fresco",
      }
    ],
    ingredientesOpcionais: [
      { nomeErva: "Rodela fina de limão fresco", quantidadeSugerida: "1 rodela" },
      { nomeErva: "Mel silvestre cru", quantidadeSugerida: "1/2 colher de café" }
    ],
    proporcoesRecomendadas: "2 partes de Hortelã para 1 parte de Alecrim",
    modoPreparo: [
      "Aqueça 300ml de água mineral até o início da fervura (95°C) e apague a chama.",
      "Amasse levemente as folhas de hortelã e o alecrim entre os dedos para quebrar as glândulas aromáticas de cineol e mentol.",
      "Deposite no bule, despeje a água quente e tampe imediatamente.",
      "Mantenha em infusão por 7 minutos.",
      "Coe e tome logo ao acordar ou antes de estudos/trabalho intensivo."
    ],
    segredoAlmanaque: "O alecrim contém ácido rosmarínico e cineol, que aumentam o fluxo sanguíneo nas artérias cerebrais, enquanto a hortelã traz frescor e dissipa a névoa mental matinal.",
    contraindicacoes: "Evitar após as 18h por ser revigorante. Pessoas com hipertensão não controlada devem usar alecrim com moderação."
  },
  {
    id: "infusao-sonhos-serenos",
    titulo: "Tisana Serenidade & Bons Sonhos (Camomila & Lavanda)",
    subtitulo: "Relaxamento profundo da musculatura e pacificação do fluxo de pensamentos",
    objetivoTerapeutico: "Calmante & Sono",
    tempoPreparo: "10 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Noite (Antes de Dormir)",
    ingredientesObrigatorios: [
      {
        nomeErva: "Camomila",
        sinonimos: ["camomila", "matricaria", "chamomilla"],
        quantidadeSugerida: "1 colher de sopa de flores",
        frescaOuSeca: "Seca ou Fresca",
      },
      {
        nomeErva: "Lavanda",
        sinonimos: ["lavanda", "alfazema", "lavandula"],
        quantidadeSugerida: "1/2 colher de chá de flores",
        frescaOuSeca: "Seca ou Fresca",
      }
    ],
    ingredientesOpcionais: [
      { nomeErva: "Capim-Limão ou Melissa", quantidadeSugerida: "3 folhas picadas" }
    ],
    proporcoesRecomendadas: "3 partes de Camomila para 1/2 parte de Lavanda",
    modoPreparo: [
      "Ferva a água e aguarde 1 minuto para baixar a temperatura para cerca de 90°C (não queimar os óleos delicados da flor).",
      "Adicione as flores no infusor e verta a água quente.",
      "Tampe muito bem com tampa ou pires por 8 a 10 minutos.",
      "Coe e tome morno 40 minutos antes de dormir, em meia-luz e sem telas."
    ],
    segredoAlmanaque: "A apigenina da camomila se liga aos receptores GABA no cérebro, enquanto o linalol da lavanda reduz a frequência cardíaca e a pressão arterial de repouso.",
    contraindicacoes: "Não indicado para pessoas com alergia conhecida a flores da família Asteraceae."
  },
  {
    id: "elixir-digestao-desintoxicacao",
    titulo: "Elixir Digestivo de Harmonia Gástrica (Boldo & Hortelã)",
    subtitulo: "Desinflamação gástrica, estímulo biliar e alívio imediato de estufamento",
    objetivoTerapeutico: "Digestão & Fígado",
    tempoPreparo: "6 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Após o Almoço",
    ingredientesObrigatorios: [
      {
        nomeErva: "Boldo",
        sinonimos: ["boldo", "plectranthus", "boldo-da-terra", "boldo-brasileiro"],
        quantidadeSugerida: "1 folha média fresca ou seca",
        frescaOuSeca: "Fresco ou Seco",
      },
      {
        nomeErva: "Hortelã",
        sinonimos: ["hortelã", "hortela", "mentha", "menta"],
        quantidadeSugerida: "5 folhas frescas",
        frescaOuSeca: "Fresco",
      }
    ],
    proporcoesRecomendadas: "1 folha de Boldo para 5 folhas de Hortelã",
    modoPreparo: [
      "Rasgue as folhas com as mãos e coloque no fundo da xícara.",
      "Despeje água quente (cerca de 85°C) sem ferver para não extrair amargor excessivo.",
      "Abrafe por apenas 5 minutos.",
      "Retire as folhas e beba sem adoçar logo após refeições gordurosas ou pesadas."
    ],
    segredoAlmanaque: "O princípio amargo da barbatusina ativa os receptores gustativos linguais que enviam sinal imediato à vesícula para liberar bile desengordurante.",
    contraindicacoes: "Contraindicado em casos de cálculos biliares com obstrução dos ductos e durante a gravidez."
  },
  {
    id: "tisana-respiratoria-guaco-hortela",
    titulo: "Tisana Peitoral & Alívio Pulmonar (Guaco & Hortelã)",
    subtitulo: "Abertura dos brônquios, fluidificação de secreções e alívio da tosse seca",
    objetivoTerapeutico: "Imunidade & Respiração",
    tempoPreparo: "12 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Tarde (Revigorar)",
    ingredientesObrigatorios: [
      {
        nomeErva: "Guaco",
        sinonimos: ["guaco", "mikania", "mikania glomerata"],
        quantidadeSugerida: "3 a 4 folhas frescas picadas",
        frescaOuSeca: "Fresco",
      },
      {
        nomeErva: "Hortelã",
        sinonimos: ["hortelã", "hortela", "mentha", "menta"],
        quantidadeSugerida: "4 folhas frescas",
        frescaOuSeca: "Fresco",
      }
    ],
    ingredientesOpcionais: [
      { nomeErva: "Gengibre ralado", quantidadeSugerida: "1 fatia fina" },
      { nomeErva: "Mel puro de abelha", quantidadeSugerida: "1 colher de chá" }
    ],
    proporcoesRecomendadas: "2 partes de Guaco para 2 partes de Hortelã",
    modoPreparo: [
      "Coloque as folhas de guaco picadas na água e deixe ferver em fogo brando por 3 minutos (leve decocção para extrair a cumarina).",
      "Apague o fogo e adicione as folhas frescas de hortelã.",
      "Tampe e deixe em infusão por mais 7 minutos.",
      "Coe e adoce com mel se for para alívio de tosse."
    ],
    segredoAlmanaque: "A cumarina do guaco relaxa a musculatura lisa traqueal e brônquica, enquanto o mentol da hortelã estimula os receptores de frio nas vias aéreas, facilitando a respiração profunda.",
    contraindicacoes: "Evitar em pacientes em uso de anticoagulantes (devido à cumarina)."
  },
  {
    id: "cha-paz-cidreira-manjericao",
    titulo: "Infusão Serenidade do Coração (Capim-Limão & Manjericão)",
    subtitulo: "Alívio do estresse do fim de tarde, relaxamento do plexo solar e clareza emocional",
    objetivoTerapeutico: "Calmante & Sono",
    tempoPreparo: "8 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Tarde (Revigorar)",
    ingredientesObrigatorios: [
      {
        nomeErva: "Capim-Limão",
        sinonimos: ["capim-limão", "capim limao", "cidreira", "cymbopogon"],
        quantidadeSugerida: "1 folha longa picada em pedaços de 2cm",
        frescaOuSeca: "Fresco ou Seco",
      },
      {
        nomeErva: "Manjericão",
        sinonimos: ["manjericão", "manjericao", "ocimum", "basilico"],
        quantidadeSugerida: "4 a 5 folhas frescas",
        frescaOuSeca: "Fresco",
      }
    ],
    proporcoesRecomendadas: "2 partes de Capim-Limão para 1 parte de Manjericão",
    modoPreparo: [
      "Pique o capim-limão com tesoura para expor as fibras ricas em citral.",
      "Despeje água a 95°C sobre as folhas em um bule tampado.",
      "Deixe em infusão por 8 minutos.",
      "Aprecie o aroma cítrico-herbal antes de beber."
    ],
    segredoAlmanaque: "O eugenol do manjericão combate a inflamação neural do estresse crônico enquanto o citral reduz a excitabilidade cardíaca.",
    contraindicacoes: "Pessoas com hipotensão severa devem consumir em doses amenas."
  },
  {
    id: "cha-imuno-mucilagens-orapronobis-alecrim",
    titulo: "Tisana Fortalecedora (Ora-pro-nóbis, Alecrim & Hortelã)",
    subtitulo: "Proteção biológica, reposição de minerais e fortalecimento da vitalidade diária",
    objetivoTerapeutico: "Imunidade & Respiração",
    tempoPreparo: "10 minutos",
    dificuldade: "Fácil",
    melhorHorario: "Manhã (Despertar)",
    ingredientesObrigatorios: [
      {
        nomeErva: "Ora-pro-nóbis",
        sinonimos: ["ora-pro-nóbis", "ora pro nobis", "pereskia"],
        quantidadeSugerida: "3 folhas tenras lavadas e rasgadas",
        frescaOuSeca: "Fresco",
      },
      {
        nomeErva: "Alecrim",
        sinonimos: ["alecrim", "salvia rosmarinus"],
        quantidadeSugerida: "1 pequeno ramo",
        frescaOuSeca: "Fresco",
      }
    ],
    ingredientesOpcionais: [
      { nomeErva: "Hortelã fresca", quantidadeSugerida: "3 folhas" }
    ],
    proporcoesRecomendadas: "3 folhas de Ora-pro-nóbis + 1 ramo de Alecrim",
    modoPreparo: [
      "Rasgue as folhas de ora-pro-nóbis para liberar suas mucilagens nutritivas.",
      "Despeje água a 90°C e tampe por 8 minutos.",
      "Coe e tome pela manhã."
    ],
    segredoAlmanaque: "As mucilagens solúveis da ora-pro-nóbis revestem o trato digestivo, melhorando a absorção de fitoquímicos e fortalecendo a barreira imunológica intestinal.",
    contraindicacoes: "Geralmente seguro para todas as faixas etárias."
  }
];

/**
 * Evaluates all tea recipes against the user's garden plants
 */
export function analyzeGardenTeaMatches(
  garden: UserPlant[],
  allSpecies: PlantEntry[]
): GardenTeaMatch[] {
  // Build a set of normalized names and species IDs present in the garden
  const gardenHerbs = garden.map((p) => {
    const species = allSpecies.find(
      (s) => s.id === p.especieId || s.nomePopular.toLowerCase() === p.nomePersonalizado.toLowerCase()
    );
    const names = [
      p.nomePersonalizado.toLowerCase(),
      p.nomeCientifico?.toLowerCase() || "",
      species?.nomePopular?.toLowerCase() || "",
      species?.nomeCientifico?.toLowerCase() || "",
      species?.id || "",
    ].filter(Boolean);

    return {
      plant: p,
      species,
      searchTerms: names,
    };
  });

  const matches: GardenTeaMatch[] = MASTER_GARDEN_TEA_RECIPES.map((recipe) => {
    const availablePlants: { userPlant: UserPlant; matchedHerbName: string }[] = [];
    const missingHerbs: string[] = [];

    recipe.ingredientesObrigatorios.forEach((ing) => {
      // Check if any garden plant matches any synonyms
      const matched = gardenHerbs.find((g) => {
        return ing.sinonimos.some((syn) =>
          g.searchTerms.some((term) => term.includes(syn.toLowerCase()))
        );
      });

      if (matched) {
        availablePlants.push({
          userPlant: matched.plant,
          matchedHerbName: ing.nomeErva,
        });
      } else {
        missingHerbs.push(ing.nomeErva);
      }
    });

    const totalRequired = recipe.ingredientesObrigatorios.length;
    const availableCount = availablePlants.length;
    const matchPercentage = Math.round((availableCount / totalRequired) * 100);
    const isFullyAvailable = availableCount === totalRequired;

    return {
      recipe,
      totalRequired,
      availableCount,
      matchPercentage,
      availablePlants,
      missingHerbs,
      isFullyAvailable,
    };
  });

  // Sort by match percentage descending (100% first, then partial matches)
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export interface CustomBlendSynergy {
  selectedHerbs: TeaHerbProfile[];
  primaryObjective: string;
  synergyDescription: string;
  recommendedProportions: { herb: string; proportion: string }[];
  idealTemperature: string;
  idealInfusionTime: string;
  bestTimeOfDay: string;
  activeCompounds: string[];
  brewingStepByStep: string[];
}

/**
 * Creates a dynamic customized herbal synergy for any custom combination of herbs picked from garden
 */
export function blendCustomGardenHarvest(
  selectedHerbIds: string[],
  allSpecies: PlantEntry[]
): CustomBlendSynergy | null {
  if (selectedHerbIds.length === 0) return null;

  const selectedHerbs: TeaHerbProfile[] = selectedHerbIds
    .map((id) => {
      if (TEA_HERBS_CATALOG[id]) return TEA_HERBS_CATALOG[id];

      const sp = allSpecies.find((s) => s.id === id);
      if (sp) {
        return {
          id: sp.id,
          nomePopular: sp.nomePopular,
          nomeCientifico: sp.nomeCientifico,
          parteUsada: "Folhas" as const,
          perfilSabor: "Herbal & Estimulante" as const,
          propriedadesPrincipais: sp.beneficiosMedicinais?.slice(0, 3) || ["Terapêutico", "Revigorante"],
          compostosAtivos: ["Flavonoides", "Óleos Essenciais", "Taninos"],
          temperaturaAgua: "90°C",
          tempoInfusao: "7 a 10 minutos",
          funcaoNaMistura: "Erva Ativa (Terapêutica)" as const,
        };
      }
      return null;
    })
    .filter(Boolean) as TeaHerbProfile[];

  if (selectedHerbs.length === 0) return null;

  // Determine synergy
  const names = selectedHerbs.map((h) => h.nomePopular.toLowerCase());
  const hasCalming = names.some((n) => n.includes("lavanda") || n.includes("camomila") || n.includes("cidreira") || n.includes("manjericão"));
  const hasStimulant = names.some((n) => n.includes("alecrim") || n.includes("gengibre"));
  const hasDigestive = names.some((n) => n.includes("hortelã") || n.includes("boldo") || n.includes("manjericão"));
  const hasRespiratory = names.some((n) => n.includes("guaco") || n.includes("hortelã"));

  let primaryObjective = "Equilíbrio & Vitalidade Holística";
  let bestTimeOfDay = "Tarde (Revigorar)";

  if (hasStimulant && !hasCalming) {
    primaryObjective = "Foco Mental, Clareza & Tônico Matinal";
    bestTimeOfDay = "Manhã (Despertar)";
  } else if (hasCalming && !hasStimulant) {
    primaryObjective = "Relaxamento Nervoso, Anti-Estresse & Sono";
    bestTimeOfDay = "Noite (Antes de Dormir)";
  } else if (hasDigestive && !hasStimulant) {
    primaryObjective = "Harmonia Gastrointestinal & Conforto Digestivo";
    bestTimeOfDay = "Após o Almoço";
  } else if (hasRespiratory) {
    primaryObjective = "Desobstrução das Vias Aéreas & Conforto Peitoral";
    bestTimeOfDay = "Tarde ou Noite";
  }

  // Active compounds combined
  const activeCompounds = Array.from(new Set(selectedHerbs.flatMap((h) => h.compostosAtivos)));

  // Proportions
  const recommendedProportions = selectedHerbs.map((h, idx) => {
    if (idx === 0) return { herb: h.nomePopular, proportion: "2 partes (Base estrutural)" };
    if (idx === 1) return { herb: h.nomePopular, proportion: "1 parte (Ativo modulador)" };
    return { herb: h.nomePopular, proportion: "1/2 parte (Aroma & Sinergia)" };
  });

  const synergyDescription = `Esta combinação une o potencial de ${selectedHerbs.map((h) => h.nomePopular).join(", ")}. A alquimia entre os compostos voláteis (${activeCompounds.slice(0, 4).join(", ")}) cria uma ação fitoterápica balanceada, minimizando irritações gástricas e potencializando o efeito terapêutico desejado.`;

  const brewingStepByStep = [
    `Colha as folhas e flores frescas do seu jardim, preferencialmente pela manhã após a evaporação do orvalho.`,
    `Aqueça 300ml de água mineral até ${selectedHerbs[0].temperaturaAgua} (evite fervura violenta para não volatizar os óleos essenciais).`,
    `Amasse levemente as folhas entre as pontas dos dedos para romper os tricomas glandulares aromáticos.`,
    `Deposite a mistura no bule, despeje a água quente e abafe imediatamente com tampa por ${selectedHerbs[0].tempoInfusao}.`,
    `Coe delicadamente e consuma morno, aproveitando a aromaterapia emanada pela fumaça do chá.`
  ];

  return {
    selectedHerbs,
    primaryObjective,
    synergyDescription,
    recommendedProportions,
    idealTemperature: selectedHerbs[0].temperaturaAgua,
    idealInfusionTime: selectedHerbs[0].tempoInfusao,
    bestTimeOfDay,
    activeCompounds,
    brewingStepByStep,
  };
}
