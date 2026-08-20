import React, { useState, useMemo } from "react";
import {
  Scissors,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Sprout,
  Leaf,
  Flower2,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Flame,
  Droplets,
} from "lucide-react";
import { PlantEntry } from "../types";
import {
  calculateHarvestEstimation,
  ContainerType,
  PropagationType,
  SunExposureType,
  HarvestEstimationResult,
  PhenologicalMilestone,
} from "../utils/harvestEstimator";
import confetti from "canvas-confetti";

interface HarvestEstimatorWidgetProps {
  dataPlantio: string;
  species?: PlantEntry | null;
  customPlantName?: string;
  onChangePlantingDate?: (newDate: string) => void;
  onApplyToNotes?: (formattedText: string) => void;
  onScheduleHarvestEvent?: (estimation: HarvestEstimationResult) => void;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const HarvestEstimatorWidget: React.FC<HarvestEstimatorWidgetProps> = ({
  dataPlantio,
  species,
  customPlantName,
  onChangePlantingDate,
  onApplyToNotes,
  onScheduleHarvestEvent,
  defaultExpanded = true,
  compact = false,
}) => {
  const [propagationType, setPropagationType] = useState<PropagationType>("muda");
  const [sunExposure, setSunExposure] = useState<SunExposureType>("sol_pleno");
  const [containerType, setContainerType] = useState<ContainerType>("canteiro_solo");
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("harvest_point");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Calculate live estimation
  const estimation: HarvestEstimationResult = useMemo(() => {
    return calculateHarvestEstimation({
      dataPlantio: dataPlantio || new Date().toISOString().split("T")[0],
      propagationType,
      sunExposure,
      containerType,
      customSpeciesName: customPlantName,
      species,
    });
  }, [dataPlantio, propagationType, sunExposure, containerType, customPlantName, species]);

  const handleApplyNotes = () => {
    if (!onApplyToNotes) return;

    const formatted = `[Previsão de Colheita Almanaque]
• Data Estimada de Maturação: ${estimation.formattedEstimatedDate} (${estimation.totalEstimatedDays} dias de ciclo)
• Janela Lunar Ideal: ${estimation.nearestOptimalLunarWindow.phaseName} (${estimation.nearestOptimalLunarWindow.formattedRange})
• Parte Vegetal: ${estimation.targetPart}
• Horário Recomendado: ${estimation.bestHarvestTime}
• Método: ${estimation.harvestTechnique}`;

    onApplyToNotes(formatted);
    setCopiedSuccess(true);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ["#2d7a32", "#a4d495", "#d97706"],
    });
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleScheduleEvent = () => {
    if (onScheduleHarvestEvent) {
      onScheduleHarvestEvent(estimation);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#2d7a32", "#e5ca78"],
      });
    }
  };

  // Quick date pickers
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split("T")[0];
    if (onChangePlantingDate) {
      onChangePlantingDate(dateStr);
    }
  };

  return (
    <div
      id="harvest-estimator-widget"
      className="rounded-2xl bg-gradient-to-b from-[#f8f5ee] to-[#f2ebe0] border border-[#d8ccb4] shadow-md overflow-hidden transition-all text-[#2e2619]"
    >
      {/* Header Banner with Interactive Expand/Collapse */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3.5 sm:p-4 bg-[#ece3d1] hover:bg-[#e4d8c2] border-b border-[#ded2bc] flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#284229] text-[#a4d495] flex items-center justify-center shadow-xs">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif-botanic text-sm sm:text-base font-bold text-[#1f3020]">
                Estimativa da Data de Colheita
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a4d495] text-[#143316]">
                IA Botânica
              </span>
            </div>
            <p className="text-[11px] text-[#635742] font-narrative">
              Calculada a partir do ciclo de maturação e fase lunar ideal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-semibold text-[#73654d] block">Previsão</span>
            <span className="text-xs font-bold font-serif-botanic text-[#284229]">
              {estimation.formattedEstimatedDate}
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg bg-[#ded3bc] hover:bg-[#cfc3aa] text-[#4d402d] transition-colors"
            title={isExpanded ? "Recolher simulador" : "Expandir simulador"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs animate-fadeIn">
          {/* Quick Summary Pill & Countdown */}
          <div className="p-3.5 rounded-xl bg-[#284229] text-[#f7f5ee] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#a4d495]" />
                <span className="text-[11px] font-semibold text-[#bfe4b7] uppercase tracking-wider">
                  Primeira Colheita Esperada:
                </span>
              </div>
              <div className="font-serif-botanic text-lg sm:text-xl font-bold text-[#f7f4ec] flex items-center gap-2">
                <span>{estimation.formattedEstimatedDate}</span>
                <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-md bg-[#38593a] text-[#d4f2cc] border border-[#527d55]">
                  {estimation.isReadyNow
                    ? "✨ Pronta para colher!"
                    : `em ${estimation.daysRemaining} dias`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1b2d1c] px-3 py-2 rounded-xl border border-[#345436] shrink-0">
              <span className="text-xl">{estimation.idealMoonIcon}</span>
              <div>
                <span className="text-[10px] text-[#9fc797] block">Lua Recomendada:</span>
                <span className="font-semibold text-xs text-[#e8f5e5]">
                  {estimation.idealLunarPhase}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cultivation Modifiers */}
          <div className="space-y-3 p-3.5 rounded-xl bg-white/70 border border-[#e3d7c3]">
            <span className="font-bold text-[#3d3322] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              Ajustar Parâmetros de Cultivo para Precisão:
            </span>

            {/* 1. Propagation Method */}
            <div>
              <label className="text-[11px] font-semibold text-[#61543e] block mb-1.5">
                Origem do Plantio:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPropagationType("semente")}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    propagationType === "semente"
                      ? "bg-[#284229] text-[#f7f4ee] border-[#284229] shadow-xs"
                      : "bg-[#f5efe3] hover:bg-[#ebe2d0] text-[#4d402d] border-[#ded4be]"
                  }`}
                >
                  <span className="font-semibold text-[11px] flex items-center gap-1">
                    🌱 Sementes
                  </span>
                  <span className={`text-[10px] mt-1 ${propagationType === "semente" ? "text-[#a4d495]" : "text-[#7a6b54]"}`}>
                    +18 a 25 dias (germinação)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPropagationType("muda")}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    propagationType === "muda"
                      ? "bg-[#284229] text-[#f7f4ee] border-[#284229] shadow-xs"
                      : "bg-[#f5efe3] hover:bg-[#ebe2d0] text-[#4d402d] border-[#ded4be]"
                  }`}
                >
                  <span className="font-semibold text-[11px] flex items-center gap-1">
                    🌿 Muda Jovem
                  </span>
                  <span className={`text-[10px] mt-1 ${propagationType === "muda" ? "text-[#a4d495]" : "text-[#7a6b54]"}`}>
                    Ciclo padrão da espécie
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPropagationType("planta_adulta")}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    propagationType === "planta_adulta"
                      ? "bg-[#284229] text-[#f7f4ee] border-[#284229] shadow-xs"
                      : "bg-[#f5efe3] hover:bg-[#ebe2d0] text-[#4d402d] border-[#ded4be]"
                  }`}
                >
                  <span className="font-semibold text-[11px] flex items-center gap-1">
                    🪴 Vaso Estabelecido
                  </span>
                  <span className={`text-[10px] mt-1 ${propagationType === "planta_adulta" ? "text-[#a4d495]" : "text-[#7a6b54]"}`}>
                    -15 dias (brotação ativa)
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Sun & Container in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#eee5d5]">
              {/* Sun exposure */}
              <div>
                <label className="text-[11px] font-semibold text-[#61543e] block mb-1">
                  Exposição Solar Prevista:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSunExposure("sol_pleno")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      sunExposure === "sol_pleno"
                        ? "bg-[#fdf4dc] text-[#92400e] border-[#f59e0b]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    ☀️ Sol Pleno
                  </button>

                  <button
                    type="button"
                    onClick={() => setSunExposure("meia_sombra")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      sunExposure === "meia_sombra"
                        ? "bg-[#fdf4dc] text-[#92400e] border-[#f59e0b]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    ⛅ Meia-Sombra
                  </button>

                  <button
                    type="button"
                    onClick={() => setSunExposure("sombra")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      sunExposure === "sombra"
                        ? "bg-[#fdf4dc] text-[#92400e] border-[#f59e0b]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    🌤️ Sombra
                  </button>
                </div>
              </div>

              {/* Container type */}
              <div>
                <label className="text-[11px] font-semibold text-[#61543e] block mb-1">
                  Recipiente / Solo:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setContainerType("canteiro_solo")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      containerType === "canteiro_solo"
                        ? "bg-[#eaf4e6] text-[#1c4d1e] border-[#5b9e53]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    🌱 Canteiro
                  </button>

                  <button
                    type="button"
                    onClick={() => setContainerType("vaso_medio")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      containerType === "vaso_medio"
                        ? "bg-[#eaf4e6] text-[#1c4d1e] border-[#5b9e53]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    🪴 Vaso Médio
                  </button>

                  <button
                    type="button"
                    onClick={() => setContainerType("vaso_pequeno")}
                    className={`py-1 px-1.5 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
                      containerType === "vaso_pequeno"
                        ? "bg-[#eaf4e6] text-[#1c4d1e] border-[#5b9e53]"
                        : "bg-[#f5efe3] text-[#5e513b] border-[#ded4be]"
                    }`}
                  >
                    🥣 Cuia/Pequeno
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Planting Date Adjusters */}
            {onChangePlantingDate && (
              <div className="pt-2 border-t border-[#eee5d5] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#6b5d46]">Testar data de plantio:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-2 py-0.5 rounded-md bg-[#ede4d2] hover:bg-[#ded2bd] text-[10px] font-medium text-[#4f422e] cursor-pointer"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-7)}
                    className="px-2 py-0.5 rounded-md bg-[#ede4d2] hover:bg-[#ded2bd] text-[10px] font-medium text-[#4f422e] cursor-pointer"
                  >
                    1 sem. atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(-30)}
                    className="px-2 py-0.5 rounded-md bg-[#ede4d2] hover:bg-[#ded2bd] text-[10px] font-medium text-[#4f422e] cursor-pointer"
                  >
                    1 mês atrás
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lunar Window Highlight Card */}
          <div className="p-3.5 rounded-xl bg-[#fdfbe9] border border-[#e8dda8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#453612] flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-[#d97706]" />
                Janela Lunar Mais Favorável para Colher {estimation.targetPart}:
              </span>
              <span className="text-[11px] font-bold text-[#b45309] bg-[#fae8b2] px-2 py-0.5 rounded-md">
                {estimation.nearestOptimalLunarWindow.formattedRange}
              </span>
            </div>

            <p className="text-[11px] text-[#6b582b] font-narrative leading-relaxed">
              <strong className="text-[#3b2d0e]">{estimation.nearestOptimalLunarWindow.phaseName}:</strong>{" "}
              {estimation.nearestOptimalLunarWindow.lunarExplanation}
            </p>
          </div>

          {/* Phenological Milestones Interactive Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b301e] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#284229]" />
                Linha do Tempo de Maturação ({estimation.totalEstimatedDays} dias totais):
              </span>
              <span className="text-[10px] text-[#706148]">Clique nas etapas para detalhes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {estimation.milestones.map((m, idx) => {
                const isSelected = selectedMilestoneId === m.stageId;
                return (
                  <div
                    key={m.stageId}
                    onClick={() => setSelectedMilestoneId(m.stageId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#284229] text-[#f7f5ee] border-[#284229] shadow-md scale-101"
                        : "bg-white/80 hover:bg-[#faf4e8] text-[#3d321f] border-[#ded4be]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? "bg-[#3f6341] text-[#bde8b5]" : "bg-[#ebe0cb] text-[#544630]"
                      }`}>
                        Etapa {idx + 1}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? "text-[#a4d495]" : "text-[#7a6b54]"}`}>
                        Dia {m.startDay}-{m.endDay}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs truncate">{m.stageName}</h5>
                    <span className={`text-[10px] block mt-0.5 truncate ${
                      isSelected ? "text-[#e0f2dc]" : "text-[#73634b]"
                    }`}>
                      Previsto: {m.estimatedStartDate} a {m.estimatedEndDate}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Milestone Detail Box */}
            {selectedMilestoneId && (
              <div className="p-3.5 rounded-xl bg-white/90 border border-[#c4dbbe] space-y-1.5 text-xs animate-fadeIn">
                {(() => {
                  const curr = estimation.milestones.find((m) => m.stageId === selectedMilestoneId);
                  if (!curr) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-[#e5f0e1] pb-1.5">
                        <span className="font-bold text-[#1a4218] flex items-center gap-1.5">
                          <Sprout className="w-3.5 h-3.5 text-[#2d7a32]" />
                          {curr.stageName} ({curr.stageSubtitle})
                        </span>
                        <span className="text-[10px] font-semibold text-[#2d7a32] bg-[#e3f4de] px-2 py-0.5 rounded-md">
                          Período: {curr.estimatedStartDate} a {curr.estimatedEndDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#364d33] font-narrative">{curr.description}</p>
                      <div className="p-2 rounded-lg bg-[#f2f8f0] border border-[#d8edd3] text-[11px] text-[#1c4519]">
                        <strong>Manejo Recomendado:</strong> {curr.botanicalCare}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Harvest Botanical Protocol Checklist */}
          <div className="p-3.5 rounded-xl bg-white/70 border border-[#ded5c2] space-y-2">
            <span className="font-bold text-[#2e2516] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#284229]" />
              Sinais Visuais de Ponto Ideal de Colheita:
            </span>

            <ul className="space-y-1 text-[11px] text-[#4d402d]">
              {estimation.harvestIndicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#2d7a32] font-bold mt-0.5">•</span>
                  <span>{ind}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#ede4d2] text-[11px]">
              <div className="bg-[#fcfaf5] p-2 rounded-lg border border-[#e5dac5]">
                <strong className="text-[#3b301f] block mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#b45309]" />
                  Horário de Maior Potência:
                </strong>
                <span className="text-[#695a43]">{estimation.bestHarvestTime}</span>
              </div>

              <div className="bg-[#fcfaf5] p-2 rounded-lg border border-[#e5dac5]">
                <strong className="text-[#3b301f] block mb-0.5 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-[#2d7a32]" />
                  Técnica de Corte:
                </strong>
                <span className="text-[#695a43]">{estimation.harvestTechnique}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons to Apply or Schedule */}
          <div className="pt-2 border-t border-[#ded3bd] flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-[#706047]">
              Tipo de Colheita:{" "}
              <strong className="text-[#284229]">
                {estimation.isContinuousHarvest ? "Contínua (podas de estímulo)" : "Ciclo Único"}
              </strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onApplyToNotes && (
                <button
                  type="button"
                  onClick={handleApplyNotes}
                  className="px-3 py-1.5 rounded-xl bg-[#284229] hover:bg-[#1b2d1c] text-[#f7f5ee] text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#a4d495]" />
                      <span>Previsão Inserida!</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3.5 h-3.5 text-[#a4d495]" />
                      <span>Inserir nas Anotações</span>
                    </>
                  )}
                </button>
              )}

              {onScheduleHarvestEvent && (
                <button
                  type="button"
                  onClick={handleScheduleEvent}
                  className="px-3 py-1.5 rounded-xl bg-[#e5ca78] hover:bg-[#d8ba60] text-[#33240d] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Agendar no Calendário</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
