import React, { useState } from "react";
import { 
  Sprout, 
  Leaf, 
  Flower2, 
  Trees, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  HelpCircle, 
  Info,
  Clock,
  CheckCircle2
} from "lucide-react";
import { UserPlant, PlantEntry } from "../types";

export interface GrowthStageInfo {
  stageKey: "seedling" | "vegetative" | "flowering" | "mature";
  stageIndex: number; // 1 to 4
  stageName: string;
  stageSubtitle: string;
  daysElapsed: number;
  progressPercentage: number; // 0 to 100
  daysToNextStage: number | null;
  nextStageName: string | null;
  biologicalDescription: string;
  careRecommendation: string;
  scaleFactor: number; // For visual size animation
  themeColor: string;
  accentBadgeBg: string;
  accentBadgeText: string;
}

/**
 * Calculates the growth stage information from the planting date
 */
export function calculateGrowthStage(dataPlantio: string, plantSpecies?: PlantEntry | null): GrowthStageInfo {
  const plantDate = new Date(dataPlantio);
  const now = new Date();
  
  // Difference in calendar days
  const diffTime = Math.max(0, now.getTime() - plantDate.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Stage 1: Plântula / Broto Inicial (0 - 14 dias)
  if (daysElapsed <= 14) {
    const progress = Math.min(100, Math.round((daysElapsed / 14) * 25));
    return {
      stageKey: "seedling",
      stageIndex: 1,
      stageName: "Plântula & Broto",
      stageSubtitle: "Fase de Enraizamento e Emissão de Folhas Iniciais",
      daysElapsed,
      progressPercentage: progress,
      daysToNextStage: 15 - daysElapsed,
      nextStageName: "Crescimento Vegetativo",
      biologicalDescription: "O espécime está fixando as raízes no substrato e desenvolvendo seus primeiros nós foliares.",
      careRecommendation: "Mantenha o substrato levemente úmido sem encharcar. Evite sol escaldante direto do meio-dia.",
      scaleFactor: 0.75,
      themeColor: "#5b9e53",
      accentBadgeBg: "#e3f0e0",
      accentBadgeText: "#254a20",
    };
  }

  // Stage 2: Crescimento Vegetativo (15 - 45 dias)
  if (daysElapsed <= 45) {
    const stageDays = daysElapsed - 14;
    const progress = Math.min(100, Math.round(25 + (stageDays / 31) * 25));
    return {
      stageKey: "vegetative",
      stageIndex: 2,
      stageName: "Crescimento Vegetativo",
      stageSubtitle: "Expansão de Folhagem & Fotossíntese Ativa",
      daysElapsed,
      progressPercentage: progress,
      daysToNextStage: 46 - daysElapsed,
      nextStageName: "Floração & Vigor",
      biologicalDescription: "Intensa atividade de crescimento celular, alongamento de ramos e espessamento do caule principal.",
      careRecommendation: "Excelente momento para adubação orgânica rica em nitrogênio (húmus de minhoca, biofertilizante).",
      scaleFactor: 0.9,
      themeColor: "#328236",
      accentBadgeBg: "#daf0d8",
      accentBadgeText: "#18451b",
    };
  }

  // Stage 3: Pré-Maturação & Floração (46 - 90 dias)
  if (daysElapsed <= 90) {
    const stageDays = daysElapsed - 45;
    const progress = Math.min(100, Math.round(50 + (stageDays / 45) * 25));
    return {
      stageKey: "flowering",
      stageIndex: 3,
      stageName: "Floração & Vigor",
      stageSubtitle: "Desenvolvimento de Botões & Óleos Essenciais",
      daysElapsed,
      progressPercentage: progress,
      daysToNextStage: 91 - daysElapsed,
      nextStageName: "Maturidade Plena",
      biologicalDescription: "A planta atinge robustez estrutural e inicia a formação de flores, cálices e terpenos aromáticos concentrados.",
      careRecommendation: "Favoreça nutrientes ricos em fósforo e potássio (cinzas de madeira ou farinha de ossos vegetal).",
      scaleFactor: 1.05,
      themeColor: "#b87c2c",
      accentBadgeBg: "#fcedd7",
      accentBadgeText: "#5e3a09",
    };
  }

  // Stage 4: Maturidade Plena & Perenidade (> 90 dias)
  const maturityBonus = Math.min(25, Math.floor((daysElapsed - 90) / 10));
  return {
    stageKey: "mature",
    stageIndex: 4,
    stageName: "Maturidade Plena",
    stageSubtitle: "Espécime Adulto Apto para Colheitas Perenes",
    daysElapsed,
    progressPercentage: Math.min(100, 75 + maturityBonus),
    daysToNextStage: null,
    nextStageName: null,
    biologicalDescription: "Espécime adulto em equilíbrio biológico e plena concentração de compostos fitoterápicos e medicinais.",
    careRecommendation: "Realize podas de rejuvenescimento e colheitas lunares periódicas para estimular novas brotações.",
    scaleFactor: 1.15,
    themeColor: "#284a27",
    accentBadgeBg: "#d5ebd3",
    accentBadgeText: "#123013",
  };
}

interface PlantGrowthStageProps {
  dataPlantio: string;
  plantSpecies?: PlantEntry | null;
  nomePlanta: string;
}

export const PlantGrowthStageIndicator: React.FC<PlantGrowthStageProps> = ({
  dataPlantio,
  plantSpecies,
  nomePlanta,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const stage = calculateGrowthStage(dataPlantio, plantSpecies);

  return (
    <div className="space-y-2">
      {/* Main Growth Stage Card Bar */}
      <div 
        onClick={() => setIsDetailOpen(!isDetailOpen)}
        className="p-3 rounded-2xl bg-[#f2ecdf] border border-[#ded4be] hover:border-[#c2b59b] transition-all cursor-pointer space-y-2 shadow-2xs group"
        title="Clique para ver os detalhes botânicos do estágio de crescimento"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Animated Plant Stage Graphic */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-white/80 border border-[#d6ccb8] shadow-2xs">
              {stage.stageKey === "seedling" && (
                <span className="inline-block transition-transform duration-700 animate-plant-breathe text-[#4a8a44]">
                  <Sprout className="w-4 h-4" />
                </span>
              )}
              {stage.stageKey === "vegetative" && (
                <span className="inline-block transition-transform duration-700 animate-plant-sway text-[#2f7d34]">
                  <Leaf className="w-4 h-4" />
                </span>
              )}
              {stage.stageKey === "flowering" && (
                <span className="inline-block transition-transform duration-700 text-[#b5761e] animate-spin-slow">
                  <Flower2 className="w-4 h-4" />
                </span>
              )}
              {stage.stageKey === "mature" && (
                <span className="inline-block transition-transform duration-700 text-[#254f24] animate-plant-breathe">
                  <Trees className="w-4 h-4" />
                </span>
              )}

              {/* Little growing ping dot */}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52944b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3b7a34]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#473c2a]">
                  Estágio {stage.stageIndex} de 4:
                </span>
                <span className="font-semibold text-xs text-[#243d22]">
                  {stage.stageName}
                </span>
              </div>
              <span className="text-[10px] text-[#70634f] font-mono block">
                {stage.daysElapsed === 0 
                  ? "Plantada hoje 🌱" 
                  : stage.daysElapsed === 1 
                  ? "1 dia de cultivo" 
                  : `${stage.daysElapsed} dias de cultivo`}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-[#355431] bg-white/70 px-2 py-0.5 rounded-md border border-[#d6ccb8]">
              {stage.progressPercentage}%
            </span>
          </div>
        </div>

        {/* 4-Step Milestone Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-[#dfd3bc] overflow-hidden flex p-0.5 gap-0.5">
            {[1, 2, 3, 4].map((step) => {
              const isFilled = stage.stageIndex >= step;
              const isCurrent = stage.stageIndex === step;
              return (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all duration-700 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#599e52] to-[#3a7534] shadow-xs animate-pulse"
                      : isFilled
                      ? "bg-[#336130]"
                      : "bg-[#cfc2a9]/50"
                  }`}
                />
              );
            })}
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[10px] text-[#786b57]">
            <span className="truncate max-w-[200px] italic">
              {stage.daysToNextStage 
                ? `Próxima fase em ${stage.daysToNextStage} dias` 
                : "Atingiu maturidade plena"}
            </span>
            <span className="text-[#3b6338] font-semibold flex items-center gap-0.5 group-hover:underline">
              <span>{isDetailOpen ? "Menos" : "Detalhes"}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isDetailOpen ? "rotate-90" : ""}`} />
            </span>
          </div>
        </div>
      </div>

      {/* Accordion / Popover biological details */}
      {isDetailOpen && (
        <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#dcd1bb] space-y-2.5 text-xs text-[#4a3e2d] animate-fadeIn shadow-2xs">
          <div className="flex items-start justify-between gap-2 border-b border-[#ebd7b5] pb-2">
            <div>
              <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#355932] block">
                Fisiologia do Cultivo ({stage.stageName})
              </span>
              <p className="text-[11px] text-[#695d48] font-narrative italic">
                {stage.stageSubtitle}
              </p>
            </div>
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{ backgroundColor: stage.accentBadgeBg, color: stage.accentBadgeText }}
            >
              Fase {stage.stageIndex}/4
            </span>
          </div>

          <p className="text-[11px] font-narrative leading-relaxed text-[#4f4331]">
            {stage.biologicalDescription}
          </p>

          <div className="p-2.5 rounded-xl bg-[#f2ebdc] border border-[#ded2bd] space-y-1">
            <span className="font-semibold text-[11px] text-[#2c4728] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#b37e29]" />
              Manejo Recomendado Para Esta Fase:
            </span>
            <p className="text-[11px] font-narrative text-[#5c4e3a] leading-relaxed">
              {stage.careRecommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Visual badge to display directly over the plant photo
 */
export const PlantGrowthImageBadge: React.FC<{ dataPlantio: string }> = ({ dataPlantio }) => {
  const stage = calculateGrowthStage(dataPlantio);

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm transition-all hover:scale-105"
      style={{
        backgroundColor: `${stage.themeColor}dd`,
        borderColor: "rgba(255, 255, 255, 0.4)",
        color: "#ffffff",
      }}
      title={`Cultivo: ${stage.daysElapsed} dias decorridos (${stage.stageName})`}
    >
      {/* Micro Animated Icon with organic sway */}
      <span className="relative flex items-center justify-center">
        {stage.stageKey === "seedling" && (
          <Sprout className="w-3.5 h-3.5 text-[#cbf5c4] animate-plant-breathe" />
        )}
        {stage.stageKey === "vegetative" && (
          <Leaf className="w-3.5 h-3.5 text-[#d5f7ce] animate-plant-sway" />
        )}
        {stage.stageKey === "flowering" && (
          <Flower2 className="w-3.5 h-3.5 text-[#ffeaab] animate-spin-slow" />
        )}
        {stage.stageKey === "mature" && (
          <Trees className="w-3.5 h-3.5 text-[#c5f0c0] animate-plant-breathe" />
        )}
      </span>

      <span>
        {stage.daysElapsed <= 1 ? "Broto" : `${stage.daysElapsed}d`} • {stage.stageName.split(" ")[0]}
      </span>
    </div>
  );
};
