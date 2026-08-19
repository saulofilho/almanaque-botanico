import { UserPlant, PlantEntry } from "../types";
import { getAstronomicalMoonPhase } from "../data/lunarData";

export interface HarvestWindow {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  formattedRange: string;
  phaseName: "Lua Nova" | "Lua Quarto Crescente" | "Lua Cheia" | "Lua Quarto Minguante";
  phaseKey: "nova" | "crescente" | "cheia" | "minguante";
  phaseIcon: string;
  isPeakOptimal: boolean;
  motive: string;
}

export interface HarvestRecommendation {
  userPlantId: string;
  userPlantName: string;
  scientificName: string;
  species?: PlantEntry;
  isHarvestable: boolean;
  category: string;
  targetPart: "Folhas & Ramos" | "Flores & Inflorescências" | "Frutos & Sementes" | "Raízes & Rizomas";
  idealPhase: "Lua Crescente" | "Lua Cheia" | "Lua Minguante" | "Lua Nova";
  idealPhaseKey: "crescente" | "cheia" | "minguante" | "nova";
  plantAgeDays: number;
  maturityMinDays: number;
  isMature: boolean;
  maturityPercentage: number;
  currentMoonIsOptimal: boolean;
  currentMoonName: string;
  currentMoonIcon: string;
  nextWindows: HarvestWindow[];
  bestTimeOfDay: string;
  activeCompoundsFocus: string;
  botanicalRule: string;
  preservationTip: string;
}

/**
 * Heuristics to determine target harvestable part and minimum maturity days
 */
export function getHarvestPartAndMaturity(species?: PlantEntry, plantName = ""): {
  targetPart: "Folhas & Ramos" | "Flores & Inflorescências" | "Frutos & Sementes" | "Raízes & Rizomas";
  maturityDays: number;
  idealPhase: "Lua Crescente" | "Lua Cheia" | "Lua Minguante";
  idealPhaseKey: "crescente" | "cheia" | "minguante";
  activeFocus: string;
  bestTime: string;
  rule: string;
  preservation: string;
} {
  const name = (species?.nomePopular || plantName).toLowerCase();
  const sci = (species?.nomeCientifico || "").toLowerCase();

  // Roots & Rhizomes
  if (
    name.includes("gengibre") ||
    name.includes("cúrcuma") ||
    name.includes("curcuma") ||
    name.includes("alho") ||
    name.includes("cebola") ||
    name.includes("cenoura") ||
    name.includes("rabanete") ||
    sci.includes("zingiber") ||
    sci.includes("curcuma")
  ) {
    return {
      targetPart: "Raízes & Rizomas",
      maturityDays: 120,
      idealPhase: "Lua Minguante",
      idealPhaseKey: "minguante",
      activeFocus: "Concentração máxima de óleos essenciais pesados, amidos e princípios curativos no subsolo.",
      bestTime: "Final da tarde ou manhã cedo, com solo levemente úmido para facilitar a extração sem danificar as raízes.",
      rule: "Na Lua Minguante, a seiva desce em direção à raiz. Não colha em luas de fluxo ascendente para não perder potência.",
      preservation: "Lave bem, seque à sombra e armazene em local seco, fresco e arejado, ou congele em fatias.",
    };
  }

  // Flowers & Inflorescences
  if (
    name.includes("lavanda") ||
    name.includes("camomila") ||
    name.includes("calêndula") ||
    name.includes("calendula") ||
    name.includes("hibisco") ||
    name.includes("jasmim") ||
    name.includes("marcela") ||
    sci.includes("lavandula") ||
    sci.includes("matricaria") ||
    sci.includes("calendula")
  ) {
    return {
      targetPart: "Flores & Inflorescências",
      maturityDays: 60,
      idealPhase: "Lua Cheia",
      idealPhaseKey: "cheia",
      activeFocus: "Ápice de terpenos voláteis, flavonoides e néctar aromático nos cálices florais.",
      bestTime: "Meio da manhã (9h às 11h), logo após o orvalho secar e antes que o sol forte evapore os óleos essenciais.",
      rule: "A Lua Cheia exerce a máxima atração gravitacional nos fluidos das flores. Colha quando 70% dos botões estiverem abertos.",
      preservation: "Desidrate em telas suspensas em ambiente escuro, seco e ventilado. Guarde em vidros herméticos âmbar.",
    };
  }

  // Fruits & Seeds
  if (
    name.includes("pimenta") ||
    name.includes("tomate") ||
    name.includes("maracujá") ||
    name.includes("erva-doce") ||
    name.includes("anis") ||
    name.includes("coentro semente")
  ) {
    return {
      targetPart: "Frutos & Sementes",
      maturityDays: 75,
      idealPhase: "Lua Cheia",
      idealPhaseKey: "cheia",
      activeFocus: "Ponto ideal de açúcares, compostos aromáticos e capsaicina/antioxidantes.",
      bestTime: "Final da tarde (16h às 18h) com frutos firmes e túrgidos.",
      rule: "Frutos para consumo imediato ganham doçura e suculência na Lua Cheia. Para guardar sementes matrizes, colha no final da Minguante.",
      preservation: "Consuma fresco ou faça conservas em azeite/vinagre de maçã e desidratação em temperatura branda.",
    };
  }

  // General Leaves, Herbs, Shoots & PANCs (Alecrim, Manjericão, Hortelã, Ora-pro-nóbis, Guaco, Boldo, etc.)
  return {
    targetPart: "Folhas & Ramos",
    maturityDays: 30,
    idealPhase: "Lua Crescente",
    idealPhaseKey: "crescente",
    activeFocus: "Máxima circulação de seiva rica em minerais, clorofila fresca e óleos aromáticos nas folhas.",
    bestTime: "Início da manhã (8h às 10h), assim que o sol nascente secar as gotas de orvalho noturno.",
    rule: "A seiva sobe vigorosamente da raiz para a copa durante a Lua Crescente. Corte os ramos com tesoura afiada a 45º, sem arrancar a planta.",
    preservation: "Para chás e defumações: amarre pequenos maços com barbante de algodão e pendure de cabeça para baixo em local sombreado.",
  };
}

/**
 * Computes upcoming 4 lunar phase periods over the next 45 days
 */
export function calculateUpcomingLunarWindows(baseDate = new Date()): HarvestWindow[] {
  const windows: HarvestWindow[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Track consecutive days grouped by lunar phase
  let currentGroupPhase: "nova" | "crescente" | "cheia" | "minguante" | null = null;
  let currentGroupStart: Date | null = null;
  let currentGroupEnd: Date | null = null;

  for (let i = 0; i <= 45; i++) {
    const day = new Date(baseDate.getTime() + i * oneDay);
    const info = getAstronomicalMoonPhase(day);

    if (info.phaseKey !== currentGroupPhase) {
      if (currentGroupPhase && currentGroupStart && currentGroupEnd) {
        const startStr = currentGroupStart.toISOString().split("T")[0];
        const endStr = currentGroupEnd.toISOString().split("T")[0];
        
        const phaseNameMap = {
          nova: "Lua Nova",
          crescente: "Lua Quarto Crescente",
          cheia: "Lua Cheia",
          minguante: "Lua Quarto Minguante"
        } as const;

        const iconMap = {
          nova: "🌑",
          crescente: "🌓",
          cheia: "🌕",
          minguante: "🌗"
        };

        const motiveMap = {
          crescente: "Seiva em ascensão: excelente para folhas, ervas aromáticas e brotos verdes.",
          cheia: "Ápice de luminosidade: perfeita para flores medicinais e frutos suculentos.",
          minguante: "Seiva em recolhimento: ideal para raízes, rizomas e colheita para secagem.",
          nova: "Repouso vegetativo: melhor evitar colheita de folhas para não estressar a planta."
        };

        const formatOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
        const formattedRange = `${currentGroupStart.toLocaleDateString("pt-BR", formatOptions)} a ${currentGroupEnd.toLocaleDateString("pt-BR", formatOptions)}`;

        windows.push({
          startDate: startStr,
          endDate: endStr,
          formattedRange,
          phaseName: phaseNameMap[currentGroupPhase],
          phaseKey: currentGroupPhase,
          phaseIcon: iconMap[currentGroupPhase],
          isPeakOptimal: false, // will be evaluated per plant
          motive: motiveMap[currentGroupPhase]
        });
      }
      currentGroupPhase = info.phaseKey;
      currentGroupStart = day;
      currentGroupEnd = day;
    } else {
      currentGroupEnd = day;
    }
  }

  return windows.slice(0, 5); // Return next 4-5 phase windows
}

/**
 * Generate full harvest recommendation for a user plant
 */
export function getPlantHarvestRecommendation(
  userPlant: UserPlant,
  allSpecies: PlantEntry[],
  currentDate = new Date()
): HarvestRecommendation {
  const species = allSpecies.find(
    (s) => s.id === userPlant.especieId || s.nomePopular.toLowerCase() === userPlant.nomePersonalizado.toLowerCase()
  );

  const plantDate = new Date(userPlant.dataPlantio || currentDate.toISOString().split("T")[0]);
  const diffTime = Math.max(0, currentDate.getTime() - plantDate.getTime());
  const plantAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isHarvestable = Boolean(
    species?.categoria === "Medicinal" ||
    species?.categoria === "Horta & Ervas" ||
    species?.categoria === "PANCs" ||
    species?.culinaria ||
    species?.beneficiosMedicinais?.length ||
    userPlant.anotacoes?.toLowerCase().includes("chá") ||
    userPlant.anotacoes?.toLowerCase().includes("colheita")
  );

  const partInfo = getHarvestPartAndMaturity(species, userPlant.nomePersonalizado);
  const isMature = plantAgeDays >= partInfo.maturityDays;
  const maturityPercentage = Math.min(100, Math.round((plantAgeDays / partInfo.maturityDays) * 100));

  const currentMoon = getAstronomicalMoonPhase(currentDate);
  const currentMoonIsOptimal = currentMoon.phaseKey === partInfo.idealPhaseKey;

  const rawWindows = calculateUpcomingLunarWindows(currentDate);
  const nextWindows = rawWindows.map((w) => ({
    ...w,
    isPeakOptimal: w.phaseKey === partInfo.idealPhaseKey
  }));

  return {
    userPlantId: userPlant.id,
    userPlantName: userPlant.nomePersonalizado,
    scientificName: userPlant.nomeCientifico || species?.nomeCientifico || "Espécie herbácea",
    species,
    isHarvestable,
    category: species?.categoria || "Horta & Ervas",
    targetPart: partInfo.targetPart,
    idealPhase: partInfo.idealPhase,
    idealPhaseKey: partInfo.idealPhaseKey,
    plantAgeDays,
    maturityMinDays: partInfo.maturityDays,
    isMature,
    maturityPercentage,
    currentMoonIsOptimal,
    currentMoonName: currentMoon.phaseName,
    currentMoonIcon: currentMoon.icon,
    nextWindows,
    bestTimeOfDay: partInfo.bestTime,
    activeCompoundsFocus: partInfo.activeFocus,
    botanicalRule: partInfo.rule,
    preservationTip: partInfo.preservation,
  };
}
