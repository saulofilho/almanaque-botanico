import React, { useState } from "react";
import { 
  Scissors, 
  Moon, 
  Sparkles, 
  Clock, 
  Calendar, 
  Sprout, 
  CheckCircle2, 
  Filter, 
  Info, 
  Sun, 
  Droplets, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Flower2,
  Leaf,
  Layers,
  Heart
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry } from "../types";
import { 
  getPlantHarvestRecommendation, 
  HarvestRecommendation,
  calculateUpcomingLunarWindows,
  HarvestWindow
} from "../utils/harvestPlanner";
import { getAstronomicalMoonPhase } from "../data/lunarData";

interface HarvestCalendarProps {
  garden: UserPlant[];
  allSpecies: PlantEntry[];
  onSelectPlantModal?: (plant: PlantEntry) => void;
  onUpdateNotes?: (plantId: string, notes: string) => void;
}

export const HarvestCalendar: React.FC<HarvestCalendarProps> = ({
  garden,
  allSpecies,
  onSelectPlantModal,
  onUpdateNotes,
}) => {
  const [filterPart, setFilterPart] = useState<string>("all");
  const [onlyReadyNow, setOnlyReadyNow] = useState<boolean>(false);
  const [selectedPlantDetails, setSelectedPlantDetails] = useState<HarvestRecommendation | null>(null);
  const [harvestSuccessId, setHarvestSuccessId] = useState<string | null>(null);

  const currentMoon = getAstronomicalMoonPhase();
  const upcomingGeneralWindows = calculateUpcomingLunarWindows();

  // Compute recommendations for all garden plants
  const recommendations: HarvestRecommendation[] = garden
    .map((p) => getPlantHarvestRecommendation(p, allSpecies))
    .filter((r) => r.isHarvestable);

  const filteredRecommendations = recommendations.filter((r) => {
    if (onlyReadyNow && !r.currentMoonIsOptimal) return false;
    if (filterPart === "folhas" && r.targetPart !== "Folhas & Ramos") return false;
    if (filterPart === "flores" && r.targetPart !== "Flores & Inflorescências") return false;
    if (filterPart === "raizes" && r.targetPart !== "Raízes & Rizomas") return false;
    if (filterPart === "frutos" && r.targetPart !== "Frutos & Sementes") return false;
    return true;
  });

  const readyNowCount = recommendations.filter((r) => r.currentMoonIsOptimal && r.isMature).length;

  const handleRecordHarvest = (rec: HarvestRecommendation) => {
    const todayStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const harvestLog = `[Colheita realizada em ${todayStr} na ${currentMoon.phaseName} - ${rec.targetPart}]`;
    
    const plant = garden.find((p) => p.id === rec.userPlantId);
    if (plant && onUpdateNotes) {
      const updatedNotes = plant.anotacoes ? `${plant.anotacoes}\n${harvestLog}` : harvestLog;
      onUpdateNotes(rec.userPlantId, updatedNotes);
    }

    setHarvestSuccessId(rec.userPlantId);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#284229", "#d4b886", "#84ab7b", "#fae8b4"],
    });

    setTimeout(() => {
      setHarvestSuccessId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Current Lunar Influence on Harvest */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1e3020] via-[#2a452d] to-[#192b1b] text-[#f7f3e8] p-6 sm:p-8 border border-[#3e5f40] shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162618] text-[#a4d495] text-xs font-semibold uppercase tracking-wider border border-[#345736]">
              <Scissors className="w-3.5 h-3.5" />
              <span>Guia de Colheitas Lunares & Medicinais</span>
            </div>

            <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#f5efe3]">
              Sincronia Cósmica: Datas & Horários Ideais de Colheita
            </h2>

            <p className="text-xs sm:text-sm text-[#d4cbba] font-narrative leading-relaxed">
              O fluxo de água, seiva e óleos essenciais na planta responde diretamente à atração gravitacional e luminosa da Lua. Colher na fase e no horário correto maximiza os princípios ativos terapêuticos e o sabor medicinal.
            </p>

            {/* Current Phase Quick Status */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="px-3 py-1.5 rounded-xl bg-[#1b2c1d] border border-[#3f5f41] flex items-center gap-2 text-xs">
                <span className="text-base">{currentMoon.icon}</span>
                <span className="font-bold text-[#e8dfcf]">{currentMoon.phaseName} Hoje</span>
                <span className="text-[#9fc095]">({currentMoon.illumination}%)</span>
              </div>

              {readyNowCount > 0 ? (
                <div className="px-3 py-1.5 rounded-xl bg-[#84ab7b]/20 border border-[#84ab7b]/50 text-[#c8e8bd] text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e5ca78]" />
                  <span>{readyNowCount} planta(s) em momento ideal de colheita agora!</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-[#ffffff]/10 text-[#d8cebe] text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#b2a28b]" />
                  <span>Aguardando próximas janelas lunares ótimas</span>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming General Lunar Timeline */}
          <div className="bg-[#152316]/90 p-4 rounded-2xl border border-[#355237] space-y-2.5 shrink-0 lg:w-72">
            <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-[#9fc095] block">
              Próximas Janelas Lunares
            </span>
            <div className="space-y-1.5">
              {upcomingGeneralWindows.slice(0, 3).map((w, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#1d2f1e] border border-[#2b442d] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{w.phaseIcon}</span>
                    <span className="font-semibold text-[#f0e8dc] text-[11px]">{w.phaseName}</span>
                  </div>
                  <span className="text-[10px] text-[#a8bfa5] font-mono">{w.formattedRange}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-[#f5efe3] p-4 sm:p-5 rounded-2xl border border-[#ded5c2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterPart("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterPart === "all"
                ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                : "bg-[#e8e1cf] text-[#4d402d] hover:bg-[#ded5c2]"
            }`}
          >
            Todas ({recommendations.length})
          </button>
          <button
            onClick={() => setFilterPart("folhas")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterPart === "folhas"
                ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                : "bg-[#e8e1cf] text-[#4d402d] hover:bg-[#ded5c2]"
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-[#3b6b38]" />
            <span>Folhas & Ramos</span>
          </button>
          <button
            onClick={() => setFilterPart("flores")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterPart === "flores"
                ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                : "bg-[#e8e1cf] text-[#4d402d] hover:bg-[#ded5c2]"
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-[#8f4a7c]" />
            <span>Flores</span>
          </button>
          <button
            onClick={() => setFilterPart("raizes")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterPart === "raizes"
                ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                : "bg-[#e8e1cf] text-[#4d402d] hover:bg-[#ded5c2]"
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-[#735028]" />
            <span>Raízes & Rizomas</span>
          </button>
        </div>

        {/* Toggle ready today */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-[#4a3f2d] bg-[#eae2d0] px-3 py-2 rounded-xl border border-[#d6cbba]">
          <input
            type="checkbox"
            checked={onlyReadyNow}
            onChange={(e) => setOnlyReadyNow(e.target.checked)}
            className="rounded border-[#bdae93] text-[#284229] focus:ring-0 cursor-pointer"
          />
          <Sparkles className="w-3.5 h-3.5 text-[#8a7238]" />
          <span>Somente favoráveis na Lua atual</span>
        </label>
      </div>

      {/* Recommendations Card Grid */}
      {filteredRecommendations.length === 0 ? (
        <div className="bg-[#f6f1e6] border-2 border-dashed border-[#dcd3bf] rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#eae0cd] text-[#695c47] flex items-center justify-center mx-auto">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="font-serif-botanic text-xl font-bold text-[#2d382b]">
            Nenhuma planta encontrada para este filtro
          </h3>
          <p className="text-xs sm:text-sm text-[#6e614d] font-narrative max-w-md mx-auto">
            Adicione plantas medicinais, aromáticas ou de horta ao seu Herbanário (como Alecrim, Lavanda, Camomila ou Ora-pro-nóbis) para receber sugestões de colheita personalizadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec) => {
            const isReadyNow = rec.currentMoonIsOptimal;
            const optimalWindow = rec.nextWindows.find((w) => w.isPeakOptimal) || rec.nextWindows[0];

            return (
              <div
                key={rec.userPlantId}
                className={`rounded-3xl bg-[#faf7f2] border transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  isReadyNow
                    ? "border-[#82a877] ring-2 ring-[#82a877]/30 bg-gradient-to-b from-[#f7faf5] to-[#faf7f2]"
                    : "border-[#dfd6c4] hover:border-[#c5b8a0]"
                }`}
              >
                {/* Header: Name, Target Part & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rec.species?.imagemUrl ? (
                        <img
                          src={rec.species.imagemUrl}
                          alt={rec.userPlantName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-[#ded5c2] shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#e5ded0] text-[#284229] flex items-center justify-center font-bold text-lg shrink-0">
                          🌿
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif-botanic text-lg sm:text-xl font-bold text-[#1f2e1f]">
                            {rec.userPlantName}
                          </h3>
                        </div>
                        <p className="text-xs text-[#6e614d] font-narrative italic">
                          {rec.scientificName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-cinzel bg-[#e8e1cf] text-[#3e3423] border border-[#d6ccb8]">
                        {rec.targetPart}
                      </span>
                      {isReadyNow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#84ab7b] text-[#132b16] flex items-center gap-1 shadow-2xs animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          <span>Lua Ideal Agora</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#eee6d6] text-[#635541]">
                          Ideal: {rec.idealPhase}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Maturity Progress Bar based on Plant Age */}
                  <div className="p-3.5 rounded-2xl bg-[#f2ece0] border border-[#ded5c2] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#574a37]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#3b6338]" />
                        <strong>Idade do cultivo:</strong> {rec.plantAgeDays} dias desde o plantio
                      </span>
                      <span className="font-bold text-[#284229]">
                        {rec.isMature ? "Maturidade Atingida" : `Em desenvolvimento (${rec.maturityPercentage}%)`}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#ded4c0] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rec.isMature ? "bg-[#3e6b3b]" : "bg-[#c49f47]"
                        }`}
                        style={{ width: `${rec.maturityPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Recommended Next Harvest Window */}
                  <div className="p-4 rounded-2xl bg-[#ebe3d3] border border-[#d8cdb8] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-[#354832] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Moon className="w-3.5 h-3.5 text-[#2f4931]" />
                        Próxima Janela Recomendada
                      </span>
                      <span className="font-mono text-xs font-bold text-[#203622] bg-[#f8f5ee] px-2 py-0.5 rounded-md border border-[#d2c7b2]">
                        {optimalWindow.phaseIcon} {optimalWindow.formattedRange}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#524531] font-narrative leading-relaxed">
                      {rec.botanicalRule}
                    </p>
                  </div>

                  {/* Best Time of Day & Active Principle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1">
                      <span className="font-semibold text-[#544733] flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#9e7631]" />
                        Melhor Horário
                      </span>
                      <p className="text-[11px] text-[#635542] leading-tight font-narrative">
                        {rec.bestTimeOfDay}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1">
                      <span className="font-semibold text-[#544733] flex items-center gap-1 text-[11px]">
                        <Droplets className="w-3.5 h-3.5 text-[#40683d]" />
                        Princípio Ativo
                      </span>
                      <p className="text-[11px] text-[#635542] leading-tight font-narrative">
                        {rec.activeCompoundsFocus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions: Record Harvest & View Details */}
                <div className="pt-3 border-t border-[#e2d8c3] flex flex-wrap items-center justify-between gap-2">
                  {rec.species && onSelectPlantModal && (
                    <button
                      onClick={() => onSelectPlantModal(rec.species!)}
                      className="px-3 py-1.5 text-xs text-[#5e513e] hover:text-[#284229] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Monografia</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {harvestSuccessId === rec.userPlantId ? (
                      <div className="px-4 py-2 rounded-xl bg-[#284229] text-[#f7f4ee] text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#a4d495]" />
                        <span>Colheita Registrada!</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRecordHarvest(rec)}
                        className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f4ee] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Registrar colheita no histórico desta planta"
                      >
                        <Scissors className="w-3.5 h-3.5 text-[#a4d495]" />
                        <span>Registrar Colheita</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botanical Harvesting Tips & Preservation Card */}
      <div className="rounded-3xl bg-[#efe8db] border border-[#dbd0bc] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#284229]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-serif-botanic text-lg sm:text-xl font-bold text-[#1f2e1f]">
            Regras de Ouro do Almanaque para a Colheita Medicinal
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ddd3be] space-y-1.5">
            <span className="font-cinzel text-xs font-bold text-[#2a4428] block">
              1. Instrumentos Esterilizados
            </span>
            <p className="text-[#594d3a] font-narrative leading-relaxed">
              Use tesouras de poda bem afiadas e limpas com álcool 70%. Cortes limpos em ângulo de 45º cicatrizam rapidamente e evitam entrada de fungos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ddd3be] space-y-1.5">
            <span className="font-cinzel text-xs font-bold text-[#2a4428] block">
              2. Regra dos 30%
            </span>
            <p className="text-[#594d3a] font-narrative leading-relaxed">
              Nunca colha mais de um terço (30%) da folhagem de uma planta de uma só vez, permitindo que a fotossíntese continue nutrindo a raiz.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ddd3be] space-y-1.5">
            <span className="font-cinzel text-xs font-bold text-[#2a4428] block">
              3. Secagem à Sombra
            </span>
            <p className="text-[#594d3a] font-narrative leading-relaxed">
              Nunca seque ervas diretamente sob o sol forte, pois a radiação UV degrada flavonoides e evapora óleos essenciais. Seque em local escuro e ventilado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
