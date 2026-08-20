import { PlantEntry, UserPlant } from "../types";

export interface BedDimensions {
  widthCm: number;  // Largura (ex: 80 cm)
  lengthCm: number; // Comprimento (ex: 200 cm)
  depthCm: number;  // Profundidade (ex: 30 cm)
  shape: "retangular" | "quadrado" | "floreira" | "espiral";
}

export interface SpeciesSpacingProfile {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  categoria: string;
  alturaAdultoCm: number;        // Altura média adulta em cm
  envergaduraCm: number;         // Diâmetro da copa em cm
  espacamentoPlantasCm: number;  // Distância recomendada entre mudas
  espacamentoLinhasCm: number;   // Distância entre linhas de cultivo
  profundidadeMinimaVasoCm: number;
  estratoSolar: "Baixo (Térreo)" | "Médio (Sub-bosque)" | "Alto (Emergente)" | "Trepadeira";
  plantasCompanheiras: string[];
  plantasAntagonicas: string[];
  dicaConsorciacao: string;
}

export const BOTANICAL_SPACING_DB: Record<string, SpeciesSpacingProfile> = {
  "lavanda-officinalis": {
    id: "lavanda-officinalis",
    nomePopular: "Lavanda (Alfazema)",
    nomeCientifico: "Lavandula angustifolia",
    categoria: "Medicinal",
    alturaAdultoCm: 60,
    envergaduraCm: 50,
    espacamentoPlantasCm: 45,
    espacamentoLinhasCm: 60,
    profundidadeMinimaVasoCm: 30,
    estratoSolar: "Médio (Sub-bosque)",
    plantasCompanheiras: ["Alecrim", "Tomilho", "Sálvia", "Rosas"],
    plantasAntagonicas: ["Hortelã", "Samambaias", "Plantas que exigem solo úmido"],
    dicaConsorciacao: "Excelente para bordaduras ensolaradas. Atrai polinizadores e afasta pulgões de plantas vizinhas.",
  },
  "alecrim-rosmarinus": {
    id: "alecrim-rosmarinus",
    nomePopular: "Alecrim",
    nomeCientifico: "Salvia rosmarinus",
    categoria: "Medicinal",
    alturaAdultoCm: 90,
    envergaduraCm: 70,
    espacamentoPlantasCm: 60,
    espacamentoLinhasCm: 80,
    profundidadeMinimaVasoCm: 35,
    estratoSolar: "Alto (Emergente)",
    plantasCompanheiras: ["Sálvia", "Tomilho", "Lavanda", "Cenoura"],
    plantasAntagonicas: ["Hortelã", "Manjericão (exige muita água)"],
    dicaConsorciacao: "Plante no fundo do canteiro voltado para o sul para não sombrear ervas de menor porte.",
  },
  "manjericao-basilico": {
    id: "manjericao-basilico",
    nomePopular: "Manjericão Doce",
    nomeCientifico: "Ocimum basilicum",
    categoria: "Horta & Ervas",
    alturaAdultoCm: 50,
    envergaduraCm: 40,
    espacamentoPlantasCm: 30,
    espacamentoLinhasCm: 40,
    profundidadeMinimaVasoCm: 20,
    estratoSolar: "Médio (Sub-bosque)",
    plantasCompanheiras: ["Tomate", "Pimenta", "Orégano", "Camomila"],
    plantasAntagonicas: ["Arruda", "Alecrim"],
    dicaConsorciacao: "O consórcio clássico com tomate e pimenta repele moscas brancas e melhora o sabor das folhas.",
  },
  "hortela-piperita": {
    id: "hortela-piperita",
    nomePopular: "Hortelã-Pimenta",
    nomeCientifico: "Mentha x piperita",
    categoria: "Horta & Ervas",
    alturaAdultoCm: 40,
    envergaduraCm: 60,
    espacamentoPlantasCm: 35,
    espacamentoLinhasCm: 40,
    profundidadeMinimaVasoCm: 20,
    estratoSolar: "Baixo (Térreo)",
    plantasCompanheiras: ["Repolho", "Couve", "Brócolis"],
    plantasAntagonicas: ["Alecrim", "Lavanda", "Camomila"],
    dicaConsorciacao: "Raiz estolonífera muito invasiva. Plante em vaso delimitado ou recipiente próprio dentro do canteiro para não sufocar outras espécies.",
  },
  "camomila-chamomilla": {
    id: "camomila-chamomilla",
    nomePopular: "Camomila",
    nomeCientifico: "Matricaria chamomilla",
    categoria: "Medicinal",
    alturaAdultoCm: 45,
    envergaduraCm: 30,
    espacamentoPlantasCm: 25,
    espacamentoLinhasCm: 30,
    profundidadeMinimaVasoCm: 15,
    estratoSolar: "Médio (Sub-bosque)",
    plantasCompanheiras: ["Manjericão", "Cebola", "Repolho", "Hortelã"],
    plantasAntagonicas: [],
    dicaConsorciacao: "Conhecida como a 'médica das plantas', enriquece o solo com enxofre e fósforo e previne infecções fúngicas.",
  },
  "ora-pro-nobis": {
    id: "ora-pro-nobis",
    nomePopular: "Ora-pro-nóbis",
    nomeCientifico: "Pereskia aculeata",
    categoria: "PANCs",
    alturaAdultoCm: 200,
    envergaduraCm: 120,
    espacamentoPlantasCm: 100,
    espacamentoLinhasCm: 150,
    profundidadeMinimaVasoCm: 45,
    estratoSolar: "Trepadeira",
    plantasCompanheiras: ["Milho", "Girassol", "Alecrim"],
    plantasAntagonicas: ["Hortaliças de folha tenra muito próximas"],
    dicaConsorciacao: "Requer cerca, mourão ou treliça firme. Conduza os ramos espinhosos para cima para liberar a área de solo.",
  },
  "guaco-mikania": {
    id: "guaco-mikania",
    nomePopular: "Guaco (Erva das Serpentes)",
    nomeCientifico: "Mikania glomerata",
    categoria: "Medicinal",
    alturaAdultoCm: 250,
    envergaduraCm: 100,
    espacamentoPlantasCm: 90,
    espacamentoLinhasCm: 120,
    profundidadeMinimaVasoCm: 40,
    estratoSolar: "Trepadeira",
    plantasCompanheiras: ["Árvores de apoio", "Gengibre", "Cúrcuma"],
    plantasAntagonicas: [],
    dicaConsorciacao: "Trepadeira nativa da Mata Atlântica; prospera com sol na copa e sombra úmida na base das raízes.",
  },
  "boldo-barbatus": {
    id: "boldo-barbatus",
    nomePopular: "Boldo-Brasileiro",
    nomeCientifico: "Plectranthus barbatus",
    categoria: "Medicinal",
    alturaAdultoCm: 120,
    envergaduraCm: 80,
    espacamentoPlantasCm: 70,
    espacamentoLinhasCm: 90,
    profundidadeMinimaVasoCm: 35,
    estratoSolar: "Alto (Emergente)",
    plantasCompanheiras: ["Alecrim", "Capim-Limão"],
    plantasAntagonicas: [],
    dicaConsorciacao: "Arbusto vigoroso e aveludado. Tolera sol forte e protege canteiros menores contra ventos.",
  },
  "capim-limao": {
    id: "capim-limao",
    nomePopular: "Capim-Limão (Cidreira)",
    nomeCientifico: "Cymbopogon citratus",
    categoria: "Medicinal",
    alturaAdultoCm: 100,
    envergaduraCm: 70,
    espacamentoPlantasCm: 60,
    espacamentoLinhasCm: 80,
    profundidadeMinimaVasoCm: 35,
    estratoSolar: "Alto (Emergente)",
    plantasCompanheiras: ["Boldo", "Erva-Doce"],
    plantasAntagonicas: [],
    dicaConsorciacao: "Forma touceiras densas. Excelente barreira natural contra erosão e repelente de insetos.",
  }
};

/**
 * Returns a fallback profile if species is not in predefined DB
 */
export function getSpeciesSpacingProfile(species?: PlantEntry, customName = ""): SpeciesSpacingProfile {
  if (species && BOTANICAL_SPACING_DB[species.id]) {
    return BOTANICAL_SPACING_DB[species.id];
  }

  const name = (species?.nomePopular || customName).toLowerCase();
  const sci = (species?.nomeCientifico || "").toLowerCase();

  // Root plants
  if (name.includes("gengibre") || name.includes("cúrcuma") || sci.includes("curcuma") || sci.includes("zingiber")) {
    return {
      id: species?.id || "raiz-padrao",
      nomePopular: species?.nomePopular || customName || "Rizoma Medicinal",
      nomeCientifico: species?.nomeCientifico || "Zingiberaceae",
      categoria: "Medicinal",
      alturaAdultoCm: 70,
      envergaduraCm: 45,
      espacamentoPlantasCm: 35,
      espacamentoLinhasCm: 50,
      profundidadeMinimaVasoCm: 35,
      estratoSolar: "Médio (Sub-bosque)",
      plantasCompanheiras: ["Guaco", "Árvores de sombra"],
      plantasAntagonicas: [],
      dicaConsorciacao: "Aprecia solo fofo, rico em húmus e meia-sombra. O rizoma se desenvolve lateralmente.",
    };
  }

  // Succulents
  if (species?.categoria === "Suculentas" || name.includes("suculenta") || name.includes("aloe") || name.includes("babosa")) {
    return {
      id: species?.id || "suculenta-padrao",
      nomePopular: species?.nomePopular || customName || "Babosa / Suculenta",
      nomeCientifico: species?.nomeCientifico || "Aloe vera",
      categoria: "Suculentas",
      alturaAdultoCm: 60,
      envergaduraCm: 50,
      espacamentoPlantasCm: 40,
      espacamentoLinhasCm: 50,
      profundidadeMinimaVasoCm: 25,
      estratoSolar: "Médio (Sub-bosque)",
      plantasCompanheiras: ["Lavanda", "Alecrim", "Cactos"],
      plantasAntagonicas: ["Plantas de brejo e alta umidade"],
      dicaConsorciacao: "Solo arenoso e sol pleno. Deixe espaço para os brotos-filhotes laterais que nascem da base.",
    };
  }

  // Default compact herb / green
  return {
    id: species?.id || "erva-padrao",
    nomePopular: species?.nomePopular || customName || "Espécime Herbáceo",
    nomeCientifico: species?.nomeCientifico || "Plantae",
    categoria: species?.categoria || "Horta & Ervas",
    alturaAdultoCm: 45,
    envergaduraCm: 35,
    espacamentoPlantasCm: 30,
    espacamentoLinhasCm: 40,
    profundidadeMinimaVasoCm: 20,
    estratoSolar: "Médio (Sub-bosque)",
    plantasCompanheiras: ["Camomila", "Manjericão"],
    plantasAntagonicas: [],
    dicaConsorciacao: "Mantenha o solo úmido e realize adubação orgânica bimestral.",
  };
}

export interface BedPlanResult {
  bedDimensions: BedDimensions;
  bedAreaM2: number;
  bedVolumeLiters: number;
  selectedSpecies: SpeciesSpacingProfile[];
  maxCapacityPlants: number;
  densityEvaluation: "ideal" | "folgado" | "superlotado";
  recommendations: string[];
  companionReport: {
    beneficialPairs: string[];
    conflictPairs: string[];
  };
}

/**
 * Calculates optimal bed capacity and layout suggestions
 */
export function calculateBedPlan(
  dimensions: BedDimensions,
  selectedSpecies: SpeciesSpacingProfile[]
): BedPlanResult {
  const widthM = dimensions.widthCm / 100;
  const lengthM = dimensions.lengthCm / 100;
  const depthM = dimensions.depthCm / 100;
  const bedAreaM2 = Number((widthM * lengthM).toFixed(2));
  const bedVolumeLiters = Math.round(widthM * lengthM * depthM * 1000);

  if (selectedSpecies.length === 0) {
    return {
      bedDimensions: dimensions,
      bedAreaM2,
      bedVolumeLiters,
      selectedSpecies: [],
      maxCapacityPlants: 0,
      densityEvaluation: "folgado",
      recommendations: ["Selecione espécies no herbário para calcular o arranjo."],
      companionReport: { beneficialPairs: [], conflictPairs: [] },
    };
  }

  // Average spacing required per plant (in m^2)
  const avgSpacingRadiusM =
    selectedSpecies.reduce((acc, s) => acc + s.espacamentoPlantasCm / 200, 0) / selectedSpecies.length;
  const avgPlantAreaM2 = Math.PI * Math.pow(avgSpacingRadiusM, 2);

  const maxCapacityPlants = Math.max(1, Math.floor(bedAreaM2 / (avgPlantAreaM2 * 0.85)));

  let densityEvaluation: "ideal" | "folgado" | "superlotado" = "ideal";
  if (selectedSpecies.length > maxCapacityPlants) {
    densityEvaluation = "superlotado";
  } else if (selectedSpecies.length < Math.max(1, Math.floor(maxCapacityPlants * 0.5))) {
    densityEvaluation = "folgado";
  }

  // Companion analysis
  const beneficialPairs: string[] = [];
  const conflictPairs: string[] = [];

  for (let i = 0; i < selectedSpecies.length; i++) {
    for (let j = i + 1; j < selectedSpecies.length; j++) {
      const a = selectedSpecies[i];
      const b = selectedSpecies[j];

      // Check beneficial
      if (
        a.plantasCompanheiras.some((c) => b.nomePopular.toLowerCase().includes(c.toLowerCase())) ||
        b.plantasCompanheiras.some((c) => a.nomePopular.toLowerCase().includes(c.toLowerCase()))
      ) {
        beneficialPairs.push(`${a.nomePopular} + ${b.nomePopular}: Consórcio harmônico benéfico`);
      }

      // Check conflict
      if (
        a.plantasAntagonicas.some((c) => b.nomePopular.toLowerCase().includes(c.toLowerCase())) ||
        b.plantasAntagonicas.some((c) => a.nomePopular.toLowerCase().includes(c.toLowerCase()))
      ) {
        conflictPairs.push(`${a.nomePopular} ⚠️ ${b.nomePopular}: Antagonismo de solo/luz ou raízes invasivas`);
      }
    }
  }

  const recommendations: string[] = [];

  // Height stratification tip
  const tallSpecies = selectedSpecies.filter((s) => s.alturaAdultoCm >= 70 || s.estratoSolar === "Trepadeira");
  const lowSpecies = selectedSpecies.filter((s) => s.alturaAdultoCm < 45);

  if (tallSpecies.length > 0 && lowSpecies.length > 0) {
    recommendations.push(
      `Posicione espécies altas (${tallSpecies.map((s) => s.nomePopular).join(", ")}) ao norte/fundo do canteiro para não projetar sombra sobre as espécies baixas (${lowSpecies.map((s) => s.nomePopular).join(", ")}).`
    );
  }

  // Depth tip
  const maxDepthNeeded = Math.max(...selectedSpecies.map((s) => s.profundidadeMinimaVasoCm));
  if (dimensions.depthCm < maxDepthNeeded) {
    recommendations.push(
      `A profundidade atual (${dimensions.depthCm}cm) é menor que os ${maxDepthNeeded}cm exigidos para o pleno desenvolvimento radicular de algumas espécies selecionadas.`
    );
  } else {
    recommendations.push(
      `Profundidade de ${dimensions.depthCm}cm adequada para suportar todo o volume radicular estimado (${bedVolumeLiters}L de terra).`
    );
  }

  // Invasive mint check
  if (selectedSpecies.some((s) => s.nomePopular.toLowerCase().includes("hortelã"))) {
    recommendations.push(
      "Atenção: A Hortelã possui estolões agressivos; isole suas raízes com vaso furado no fundo enterrado no canteiro."
    );
  }

  return {
    bedDimensions: dimensions,
    bedAreaM2,
    bedVolumeLiters,
    selectedSpecies,
    maxCapacityPlants,
    densityEvaluation,
    recommendations,
    companionReport: {
      beneficialPairs,
      conflictPairs,
    },
  };
}
