import { PlantEntry } from "../types";
import { getAstronomicalMoonPhase } from "../data/lunarData";
import { calculateUpcomingLunarWindows, getHarvestPartAndMaturity, HarvestWindow } from "./harvestPlanner";

export type PropagationType = "semente" | "muda" | "planta_adulta";
export type SunExposureType = "sol_pleno" | "meia_sombra" | "sombra";
export type ContainerType = "canteiro_solo" | "vaso_medio" | "vaso_pequeno";

export interface HarvestEstimationFactors {
  dataPlantio: string; // "YYYY-MM-DD"
  propagationType: PropagationType;
  sunExposure: SunExposureType;
  containerType: ContainerType;
  customSpeciesName?: string;
  species?: PlantEntry | null;
}

export interface PhenologicalMilestone {
  stageId: string;
  stageName: string;
  stageSubtitle: string;
  startDay: number;
  endDay: number;
  estimatedStartDate: string;
  estimatedEndDate: string;
  description: string;
  botanicalCare: string;
  iconName: "seed" | "sprout" | "leaf" | "flower" | "scissors";
}

export interface HarvestEstimationResult {
  baseSpeciesName: string;
  scientificName: string;
  category: string;
  targetPart: "Folhas & Ramos" | "Flores & Inflorescências" | "Frutos & Sementes" | "Raízes & Rizomas";
  idealLunarPhase: "Lua Crescente" | "Lua Cheia" | "Lua Minguante";
  idealLunarPhaseKey: "crescente" | "cheia" | "minguante";
  idealMoonIcon: string;
  
  // Day Calculations
  baseMaturityDays: number;
  propagationModifierDays: number;
  sunModifierDays: number;
  containerModifierDays: number;
  totalEstimatedDays: number;
  
  // Date Results
  plantingDate: string;
  estimatedHarvestDate: string; // "YYYY-MM-DD"
  formattedEstimatedDate: string; // "15 de Outubro de 2026"
  daysRemaining: number;
  isReadyNow: boolean;
  progressPercent: number;
  
  // Lunar Window
  nearestOptimalLunarWindow: {
    startDate: string;
    endDate: string;
    formattedRange: string;
    phaseName: string;
    phaseIcon: string;
    lunarExplanation: string;
  };

  // Phenological Milestones
  milestones: PhenologicalMilestone[];
  
  // Botanical Harvesting Protocol
  harvestIndicators: string[];
  bestHarvestTime: string;
  harvestTechnique: string;
  activePrinciplesFocus: string;
  preservationTip: string;
  isContinuousHarvest: boolean; // Se permite colheita contínua (ex: ervas) ou única (ex: raízes/bulbos)
}

/**
 * Calculates comprehensive harvest estimation from species, planting date, and cultivation parameters
 */
export function calculateHarvestEstimation(factors: HarvestEstimationFactors): HarvestEstimationResult {
  const {
    dataPlantio,
    propagationType,
    sunExposure,
    containerType,
    customSpeciesName = "",
    species,
  } = factors;

  const plantName = customSpeciesName || species?.nomePopular || "Espécie Herbácea";
  const scientificName = species?.nomeCientifico || (customSpeciesName ? "Planta do Jardim" : "Cultivo Geral");
  const category = species?.categoria || "Horta & Ervas";

  // Base species harvest characteristics
  const partInfo = getHarvestPartAndMaturity(species || undefined, plantName);
  let baseDays = partInfo.maturityDays;

  // Species-specific fine-tuning
  const lowerName = plantName.toLowerCase();
  if (lowerName.includes("manjericão") || lowerName.includes("manjericao")) {
    baseDays = 40;
  } else if (lowerName.includes("hortelã") || lowerName.includes("hortela") || lowerName.includes("menta")) {
    baseDays = 35;
  } else if (lowerName.includes("salsa") || lowerName.includes("cebolinha") || lowerName.includes("coentro")) {
    baseDays = 45;
  } else if (lowerName.includes("alecrim")) {
    baseDays = 50;
  } else if (lowerName.includes("lavanda")) {
    baseDays = 75;
  } else if (lowerName.includes("camomila")) {
    baseDays = 60;
  } else if (lowerName.includes("ora-pro-nóbis") || lowerName.includes("ora pro nobis")) {
    baseDays = 45;
  } else if (lowerName.includes("gengibre") || lowerName.includes("cúrcuma") || lowerName.includes("curcuma")) {
    baseDays = 150;
  } else if (lowerName.includes("tomate") || lowerName.includes("pimenta")) {
    baseDays = 80;
  }

  // 1. Propagation Modifier
  let propMod = 0;
  if (propagationType === "semente") {
    // Sementes demoram mais pela fase de quebra de dormência e germinação
    propMod = baseDays > 90 ? +25 : +18;
  } else if (propagationType === "planta_adulta") {
    // Planta já estabelecida em vaso maior
    propMod = -Math.min(15, Math.round(baseDays * 0.25));
  } else {
    // Muda padrão
    propMod = 0;
  }

  // 2. Sunlight Modifier
  let sunMod = 0;
  if (sunExposure === "sol_pleno") {
    // Fotossíntese acelerada
    sunMod = -Math.round(baseDays * 0.08);
  } else if (sunExposure === "sombra") {
    // Desenvolvimento vegetativo mais lento
    sunMod = +Math.round(baseDays * 0.15);
  }

  // 3. Container Modifier
  let containerMod = 0;
  if (containerType === "canteiro_solo") {
    // Raízes se expandem com máximo vigor
    containerMod = -Math.round(baseDays * 0.05);
  } else if (containerType === "vaso_pequeno") {
    // Restrição de substrato pode atrasar porte ou adiantar floração precoce
    containerMod = +Math.round(baseDays * 0.08);
  }

  const totalDays = Math.max(15, baseDays + propMod + sunMod + containerMod);

  // Calculate dates
  const plantingDateObj = new Date(dataPlantio || new Date().toISOString().split("T")[0]);
  const estimatedHarvestDateObj = new Date(plantingDateObj.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const estimatedHarvestDate = estimatedHarvestDateObj.toISOString().split("T")[0];

  const now = new Date();
  const diffFromToday = estimatedHarvestDateObj.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffFromToday / (1000 * 60 * 60 * 24));
  const isReadyNow = daysRemaining <= 0;

  // Elapsed progress
  const timeElapsed = Math.max(0, now.getTime() - plantingDateObj.getTime());
  const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

  // Format estimated date in pt-BR
  const formattedEstimatedDate = estimatedHarvestDateObj.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate Nearest Optimal Lunar Window around the estimated harvest date
  const candidateWindows = calculateUpcomingLunarWindows(
    new Date(estimatedHarvestDateObj.getTime() - 14 * 24 * 60 * 60 * 1000)
  );

  const matchingWindow = candidateWindows.find((w) => w.phaseKey === partInfo.idealPhaseKey) || candidateWindows[0];

  const moonIconMap = {
    crescente: "🌓",
    cheia: "🌕",
    minguante: "🌗",
    nova: "🌑",
  };

  const lunarExplanationMap = {
    crescente: "A seiva sobe com vigor em direção aos ramos e folhas, potencializando minerais e clorofila.",
    cheia: "Ápice da atração gravitacional e luminosidade noturna: concentração máxima de óleos essenciais nas flores e frutos.",
    minguante: "A seiva reflui para as raízes e rizomas, favorecendo a densidade de princípios ativos subterrâneos e a conservação pós-colheita.",
  };

  // Generate 3-step Phenological Milestones
  const stage1End = Math.round(totalDays * 0.28);
  const stage2End = Math.round(totalDays * 0.75);

  const stage1StartDateObj = plantingDateObj;
  const stage1EndDateObj = new Date(plantingDateObj.getTime() + stage1End * 24 * 60 * 60 * 1000);
  const stage2StartDateObj = stage1EndDateObj;
  const stage2EndDateObj = new Date(plantingDateObj.getTime() + stage2End * 24 * 60 * 60 * 1000);
  const stage3StartDateObj = stage2EndDateObj;
  const stage3EndDateObj = estimatedHarvestDateObj;

  const formatDateShort = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

  const isContinuous =
    partInfo.targetPart === "Folhas & Ramos" ||
    lowerName.includes("manjericão") ||
    lowerName.includes("hortelã") ||
    lowerName.includes("alecrim") ||
    lowerName.includes("ora-pro-nóbis");

  const milestones: PhenologicalMilestone[] = [
    {
      stageId: "establishment",
      stageName: "Enraizamento & Fixação",
      stageSubtitle: "Fase de Adaptação do Sistema Radicular",
      startDay: 0,
      endDay: stage1End,
      estimatedStartDate: formatDateShort(stage1StartDateObj),
      estimatedEndDate: formatDateShort(stage1EndDateObj),
      description:
        propagationType === "semente"
          ? "Rompimento do tegumento, emissão da radícula e surgimento dos cotilédones iniciais."
          : "Emissão de radicelas absorventes e adaptação ao novo substrato do canteiro ou vaso.",
      botanicalCare: "Manter o substrato úmido com regas suaves (sem jatos fortes) e proteger de insolação extrema nas primeiras duas semanas.",
      iconName: "sprout",
    },
    {
      stageId: "vegetative",
      stageName: "Desenvolvimento Vegetativo",
      stageSubtitle: "Expansão de Ramos & Fotossíntese Ativa",
      startDay: stage1End + 1,
      endDay: stage2End,
      estimatedStartDate: formatDateShort(stage2StartDateObj),
      estimatedEndDate: formatDateShort(stage2EndDateObj),
      description:
        partInfo.targetPart === "Raízes & Rizomas"
          ? "Acúmulo intenso de fotoassimilados que serão translocados para a reserva subterrânea."
          : "Espessamento do caule, brotação lateral vigorosa e diferenciação de gemas apicais.",
      botanicalCare: "Adubar com matéria orgânica rica em nitrogênio e fósforo (húmus de minhoca ou biofertilizante) na Lua Crescente.",
      iconName: "leaf",
    },
    {
      stageId: "harvest_point",
      stageName: "Maturação & Ponto de Colheita",
      stageSubtitle: `Ápice de Potência Medicinal (${partInfo.idealPhase})`,
      startDay: stage2End + 1,
      endDay: totalDays,
      estimatedStartDate: formatDateShort(stage3StartDateObj),
      estimatedEndDate: formatDateShort(stage3EndDateObj),
      description:
        partInfo.targetPart === "Flores & Inflorescências"
          ? "Abertura dos botões florais com máximo acúmulo de néctar aromático e flavonoides."
          : partInfo.targetPart === "Raízes & Rizomas"
          ? "Amadurecimento dos rizomas com recolhimento da seiva na fase minguante."
          : "Folhas basais e intermediárias túrgidas, ricas em óleos essenciais e aroma característico.",
      botanicalCare: `Colher na ${partInfo.idealPhase} preferencialmente pela manhã após a evaporação do orvalho. ${
        isContinuous ? "Realize podas de colheita periódicas para estimular novas brotações laterais." : "Colha toda a touceira ou desenterre os rizomas com cuidado."
      }`,
      iconName: "scissors",
    },
  ];

  // Specific botanical indicators
  const harvestIndicators: string[] = [];
  if (partInfo.targetPart === "Folhas & Ramos") {
    harvestIndicators.push("Mínimo de 4 a 6 pares de folhas bem desenvolvidas.");
    harvestIndicators.push("Aroma aromático marcante ao friccionar suavemente a folha.");
    harvestIndicators.push("Folhas de coloração verde viva sem sinais de descoloração ou pragas.");
  } else if (partInfo.targetPart === "Flores & Inflorescências") {
    harvestIndicators.push("Cerca de 70% dos botões da inflorescência abertos.");
    harvestIndicators.push("Pétalas firmes e brilhantes, sem sinais de murchamento.");
    harvestIndicators.push("Presença evidente de pólen e perfume intenso pela manhã.");
  } else if (partInfo.targetPart === "Raízes & Rizomas") {
    harvestIndicators.push("Folhagem aérea começa a amarelar e secar naturalmente.");
    harvestIndicators.push("Ciclo vegetativo completado com reservas consolidadas.");
    harvestIndicators.push("Solo levemente afofado na base para não quebrar os rizomas.");
  } else {
    harvestIndicators.push("Frutos com coloração típica e aroma característico consolidado.");
    harvestIndicators.push("Desprendimento fácil da haste com leve rotação manual.");
  }

  return {
    baseSpeciesName: plantName,
    scientificName,
    category,
    targetPart: partInfo.targetPart,
    idealLunarPhase: partInfo.idealPhase,
    idealLunarPhaseKey: partInfo.idealPhaseKey,
    idealMoonIcon: moonIconMap[partInfo.idealPhaseKey] || "🌓",
    baseMaturityDays: baseDays,
    propagationModifierDays: propMod,
    sunModifierDays: sunMod,
    containerModifierDays: containerMod,
    totalEstimatedDays: totalDays,
    plantingDate: dataPlantio,
    estimatedHarvestDate,
    formattedEstimatedDate,
    daysRemaining,
    isReadyNow,
    progressPercent,
    nearestOptimalLunarWindow: {
      startDate: matchingWindow.startDate,
      endDate: matchingWindow.endDate,
      formattedRange: matchingWindow.formattedRange,
      phaseName: matchingWindow.phaseName,
      phaseIcon: matchingWindow.phaseIcon,
      lunarExplanation: lunarExplanationMap[partInfo.idealPhaseKey] || "Fluxo ideal de seiva vegetal.",
    },
    milestones,
    harvestIndicators,
    bestHarvestTime: partInfo.bestTime,
    harvestTechnique:
      isContinuous
        ? "Corte apical a 45º com tesoura afiada e esterilizada, cerca de 1cm acima do nó foliar."
        : "Corte na base rente ao solo ou extração cuidadosa com garfo de jardinagem.",
    activePrinciplesFocus: partInfo.activeFocus,
    preservationTip: partInfo.preservation,
    isContinuousHarvest: isContinuous,
  };
}
