import React, { useState, useMemo } from "react";
import { 
  Ruler, 
  Layers, 
  Grid, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Info, 
  Plus, 
  Trash2, 
  Sprout, 
  Sun, 
  Maximize2, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen
} from "lucide-react";
import confetti from "canvas-confetti";
import { PlantEntry, UserPlant } from "../types";
import { 
  BedDimensions, 
  SpeciesSpacingProfile, 
  BOTANICAL_SPACING_DB, 
  getSpeciesSpacingProfile, 
  calculateBedPlan 
} from "../utils/bedSpacingPlanner";

interface PlantingBedPlannerProps {
  allSpecies: PlantEntry[];
  garden: UserPlant[];
  onAddPlannedPlantToGarden?: (plant: PlantEntry, customNotes?: string) => void;
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

const PRESET_BEDS: { name: string; dims: BedDimensions; desc: string; icon: string }[] = [
  {
    name: "Canteiro de Chão Padrão",
    dims: { lengthCm: 200, widthCm: 80, depthCm: 35, shape: "retangular" },
    desc: "2,0m × 0,8m • Ideal para horta de chão com acesso fácil pelos dois lados",
    icon: "🌱",
  },
  {
    name: "Canteiro Quadrado (Square Foot)",
    dims: { lengthCm: 120, widthCm: 120, depthCm: 30, shape: "quadrado" },
    desc: "1,2m × 1,2m • Otimizado para cultivo intensivo em módulos de 30cm",
    icon: "🟩",
  },
  {
    name: "Floreira Longa de Varanda",
    dims: { lengthCm: 100, widthCm: 30, depthCm: 25, shape: "floreira" },
    desc: "1,0m × 0,3m • Perfeito para parapeitos, sacadas e ervas aromáticas",
    icon: "🪴",
  },
  {
    name: "Canteiro Elevado Ergonômico",
    dims: { lengthCm: 150, widthCm: 70, depthCm: 45, shape: "retangular" },
    desc: "1,5m × 0,7m • Canteiro de madeira com profundidade extra para raízes",
    icon: "🪵",
  },
];

export const PlantingBedPlanner: React.FC<PlantingBedPlannerProps> = ({
  allSpecies,
  garden,
  onAddPlannedPlantToGarden,
  onSelectPlantModal,
}) => {
  const [dimensions, setDimensions] = useState<BedDimensions>(PRESET_BEDS[0].dims);
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>([
    "alecrim-rosmarinus",
    "manjericao-basilico",
    "camomila-chamomilla",
  ]);
  const [searchCatalogQuery, setSearchCatalogQuery] = useState<string>("");
  const [activeViewTab, setActiveViewTab] = useState<"simulador" | "guia">("simulador");

  // Map selected IDs to profiles
  const selectedProfiles: SpeciesSpacingProfile[] = useMemo(() => {
    return selectedSpeciesIds.map((id) => {
      const sp = allSpecies.find((s) => s.id === id);
      return getSpeciesSpacingProfile(sp, id);
    });
  }, [selectedSpeciesIds, allSpecies]);

  // Bed plan calculation
  const planResult = useMemo(() => {
    return calculateBedPlan(dimensions, selectedProfiles);
  }, [dimensions, selectedProfiles]);

  const handleAddSpeciesToPlan = (speciesId: string) => {
    if (!selectedSpeciesIds.includes(speciesId)) {
      setSelectedSpeciesIds([...selectedSpeciesIds, speciesId]);
    }
  };

  const handleRemoveSpeciesFromPlan = (speciesId: string) => {
    setSelectedSpeciesIds(selectedSpeciesIds.filter((id) => id !== speciesId));
  };

  const handleApplyPreset = (preset: (typeof PRESET_BEDS)[0]) => {
    setDimensions(preset.dims);
  };

  const handleExportPlanToGarden = () => {
    if (onAddPlannedPlantToGarden) {
      selectedProfiles.forEach((profile) => {
        const spec = allSpecies.find((s) => s.id === profile.id);
        if (spec) {
          onAddPlannedPlantToGarden(
            spec,
            `Planejado no Canteiro (${dimensions.lengthCm}x${dimensions.widthCm}cm). Espaçamento: ${profile.espacamentoPlantasCm}cm entre mudas.`
          );
        }
      });
    }
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b6338", "#a4d495", "#e8c374", "#d48148"],
    });
  };

  // Filter catalog
  const filteredCatalog = allSpecies.filter(
    (s) =>
      s.nomePopular.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
      s.nomeCientifico.toLowerCase().includes(searchCatalogQuery.toLowerCase()) ||
      s.categoria.toLowerCase().includes(searchCatalogQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#243a25] via-[#2d472e] to-[#1e2f20] text-[#f7f5ee] border border-[#3e5f3f] shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Ruler className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3e5e3f]/80 text-[#d8f0d2] text-xs font-semibold uppercase tracking-wider border border-[#527d54]">
            <Ruler className="w-3.5 h-3.5" />
            <span>Calculadora Agronômica de Espaçamento</span>
          </div>

          <h2 className="font-serif-botanic text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#fdfbf7]">
            Planejador de Canteiros & Consórcio Botânico
          </h2>

          <p className="text-xs sm:text-sm text-[#ded4bf] font-narrative leading-relaxed">
            Calcule as distâncias ideais entre mudas no canteiro ou floreira com base no diâmetro da copa e altura adulta catalogados na enciclopédia. Evite sobreposição de raízes, sombreamento indesejado e combine plantas companheiras.
          </p>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveViewTab("simulador")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === "simulador"
                  ? "bg-[#faf7f2] text-[#1f2f20] shadow-sm"
                  : "bg-[#335035] hover:bg-[#3d5e3f] text-[#ded6c5]"
              }`}
            >
              Simulador Visual de Canteiro
            </button>
            <button
              onClick={() => setActiveViewTab("guia")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === "guia"
                  ? "bg-[#faf7f2] text-[#1f2f20] shadow-sm"
                  : "bg-[#335035] hover:bg-[#3d5e3f] text-[#ded6c5]"
              }`}
            >
              Tabela de Espaçamento do Herbário
            </button>
          </div>
        </div>
      </div>

      {activeViewTab === "simulador" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Bed Configuration & Species Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Bed Presets */}
            <div className="bg-[#faf7f2] p-5 sm:p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4">
              <h3 className="font-serif-botanic text-lg font-bold text-[#233321] flex items-center gap-2">
                <Grid className="w-4 h-4 text-[#355933]" />
                1. Dimensões do Canteiro / Vaso
              </h3>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_BEDS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between text-xs ${
                      dimensions.lengthCm === p.dims.lengthCm &&
                      dimensions.widthCm === p.dims.widthCm
                        ? "bg-[#ebf3e8] border-[#81b87b] shadow-2xs"
                        : "bg-[#f5efe3] border-[#ded5c2] hover:bg-[#eae1cd]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-[#273825]">
                      <span>{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-[#695d49] mt-1 leading-snug">
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Sliders */}
              <div className="pt-2 border-t border-[#ebe2d0] space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-[#4f422e] mb-1">
                    <span>Comprimento (X):</span>
                    <span className="font-mono text-[#2b4429] font-bold">{dimensions.lengthCm} cm ({(dimensions.lengthCm / 100).toFixed(1)}m)</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="400"
                    step="10"
                    value={dimensions.lengthCm}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, lengthCm: Number(e.target.value) })
                    }
                    className="w-full accent-[#355b33] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-[#4f422e] mb-1">
                    <span>Largura (Y):</span>
                    <span className="font-mono text-[#2b4429] font-bold">{dimensions.widthCm} cm ({(dimensions.widthCm / 100).toFixed(1)}m)</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={dimensions.widthCm}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, widthCm: Number(e.target.value) })
                    }
                    className="w-full accent-[#355b33] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-[#4f422e] mb-1">
                    <span>Profundidade Útil do Solo (Z):</span>
                    <span className="font-mono text-[#2b4429] font-bold">{dimensions.depthCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    step="5"
                    value={dimensions.depthCm}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, depthCm: Number(e.target.value) })
                    }
                    className="w-full accent-[#355b33] cursor-pointer"
                  />
                </div>
              </div>

              {/* Area and Volume Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#eee5d3] border border-[#d8ccb6]">
                  <span className="text-[10px] uppercase font-bold text-[#695c47] block">Área Total</span>
                  <span className="font-mono text-sm font-bold text-[#233521]">{planResult.bedAreaM2} m²</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#eee5d3] border border-[#d8ccb6]">
                  <span className="text-[10px] uppercase font-bold text-[#695c47] block">Volume Substrato</span>
                  <span className="font-mono text-sm font-bold text-[#233521]">{planResult.bedVolumeLiters} Litros</span>
                </div>
              </div>
            </div>

            {/* 2. Selected Species in Plan */}
            <div className="bg-[#faf7f2] p-5 sm:p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-botanic text-lg font-bold text-[#233321] flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-[#355933]" />
                  2. Espécies no Consórcio ({selectedProfiles.length})
                </h3>
              </div>

              {selectedProfiles.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-[#f5eee0] border border-dashed border-[#d8ccb6] text-xs text-[#70624c]">
                  Selecione espécies abaixo para simular o espaçamento deste canteiro.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedProfiles.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-3 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#243522] block">{sp.nomePopular}</span>
                        <span className="text-[11px] text-[#695c46] italic">
                          Copa: {sp.envergaduraCm}cm • Altura: {sp.alturaAdultoCm}cm • Espaçamento: {sp.espacamentoPlantasCm}cm
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSpeciesFromPlan(sp.id)}
                        className="p-1.5 rounded-lg bg-[#ebd9d7] hover:bg-[#dfc4c1] text-[#822b22] transition-colors cursor-pointer"
                        title="Remover do canteiro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add species from Catalog */}
              <div className="pt-2 border-t border-[#ebe2d0] space-y-2">
                <label className="text-xs font-semibold text-[#544733] block">
                  Adicionar espécie do herbário ao canteiro:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8c7e68] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar espécies por nome..."
                    value={searchCatalogQuery}
                    onChange={(e) => setSearchCatalogQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] placeholder-[#968b75] focus:outline-hidden"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 bg-[#f5efe3] p-1.5 rounded-xl border border-[#d6ccb8]">
                  {filteredCatalog.slice(0, 10).map((plant) => {
                    const isAdded = selectedSpeciesIds.includes(plant.id);
                    return (
                      <button
                        key={plant.id}
                        disabled={isAdded}
                        onClick={() => handleAddSpeciesToPlan(plant.id)}
                        className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isAdded
                            ? "bg-[#e5eee1] text-[#3b6338] opacity-60 cursor-default"
                            : "hover:bg-[#eae0cb] text-[#2c3529]"
                        }`}
                      >
                        <span className="font-medium">{plant.nomePopular}</span>
                        {isAdded ? (
                          <span className="text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> No Canteiro
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#355b33] flex items-center gap-0.5">
                            <Plus className="w-3 h-3" /> Adicionar
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Simulated Layout & Companion Analysis (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Bed Grid Simulation */}
            <div className="bg-[#faf7f2] p-5 sm:p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif-botanic text-lg font-bold text-[#233321] flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-[#355933]" />
                    Visualização em Escala do Canteiro
                  </h3>
                  <p className="text-xs text-[#6e604b] font-narrative">
                    Círculos representam a envergadura da copa e área radicular no estágio adulto.
                  </p>
                </div>

                {/* Capacity Status Badge */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    planResult.densityEvaluation === "ideal"
                      ? "bg-[#e5eee1] text-[#2c522b] border-[#bad8b4]"
                      : planResult.densityEvaluation === "superlotado"
                      ? "bg-[#fceeed] text-[#9c2f24] border-[#e8a49c]"
                      : "bg-[#f4efe3] text-[#6b5839] border-[#ded5c0]"
                  }`}
                >
                  {planResult.densityEvaluation === "ideal" && "🌿 Densidade Balanceada"}
                  {planResult.densityEvaluation === "superlotado" && "⚠️ Risco de Superlotação"}
                  {planResult.densityEvaluation === "folgado" && "🌱 Espaço Disponível"}
                  <span className="font-mono text-[11px]">
                    ({selectedProfiles.length} / máx {planResult.maxCapacityPlants} plantas)
                  </span>
                </div>
              </div>

              {/* Simulated Bed Canvas */}
              <div className="p-4 rounded-2xl bg-[#eee5d3] border-2 border-dashed border-[#c9bba2] flex flex-col items-center justify-center overflow-x-auto min-h-[220px]">
                {/* Scale Frame representation */}
                <div
                  className="bg-[#3b2b1b] rounded-2xl p-3 shadow-inner relative border-4 border-[#573f27] flex flex-wrap items-center justify-around gap-3 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(60, (dimensions.lengthCm / 200) * 80))}%`,
                    minHeight: `${Math.max(140, (dimensions.widthCm / 100) * 120)}px`,
                  }}
                >
                  {/* Compass / Solar Indicator */}
                  <div className="absolute top-1.5 right-2 text-[9px] font-bold text-[#b5a38a] flex items-center gap-1 bg-[#2b1f14]/80 px-1.5 py-0.5 rounded-md">
                    <Sun className="w-3 h-3 text-[#f0c24f]" />
                    <span>Norte Solar (Fundo)</span>
                  </div>

                  {selectedProfiles.length === 0 ? (
                    <div className="text-center text-xs text-[#c9bba4] italic py-6">
                      Canteiro vazio. Adicione espécies para ver a projeção.
                    </div>
                  ) : (
                    selectedProfiles.map((sp, idx) => (
                      <div
                        key={idx}
                        className="group relative flex flex-col items-center justify-center m-1.5 transition-transform hover:scale-105"
                      >
                        {/* Circle of canopy */}
                        <div
                          className="rounded-full flex items-center justify-center border-2 border-white/60 shadow-md text-white font-bold text-xs relative"
                          style={{
                            width: `${Math.max(48, Math.min(88, sp.envergaduraCm * 1.1))}px`,
                            height: `${Math.max(48, Math.min(88, sp.envergaduraCm * 1.1))}px`,
                            backgroundColor:
                              sp.categoria === "Medicinal"
                                ? "#385e3a"
                                : sp.categoria === "PANCs"
                                ? "#85582e"
                                : sp.categoria === "Suculentas"
                                ? "#2e6878"
                                : "#4b6b33",
                          }}
                        >
                          <span className="text-[10px] text-center px-1 truncate max-w-full drop-shadow-xs">
                            {sp.nomePopular.split(" ")[0]}
                          </span>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-20 bg-[#1e2d1f] text-[#f7f5ee] text-[10px] p-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-[#48634a]">
                          <span className="font-bold block">{sp.nomePopular}</span>
                          <span>Copa: Ø{sp.envergaduraCm}cm • Altura: {sp.alturaAdultoCm}cm</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recommendations & Agronomic Tips */}
              <div className="p-4 rounded-2xl bg-[#f5eee1] border border-[#ded5c0] space-y-2 text-xs">
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2b4429] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3b6b38]" />
                  Parecer Agronômico do Almanaque
                </span>
                <ul className="space-y-1.5 text-xs text-[#4d3e2d]">
                  {planResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#3b6637] font-bold">✓</span>
                      <span className="font-narrative leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Companion / Antagonism Report */}
              {(planResult.companionReport.beneficialPairs.length > 0 ||
                planResult.companionReport.conflictPairs.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {planResult.companionReport.beneficialPairs.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#ebf3e8] border border-[#aed4a7] text-xs space-y-1">
                      <span className="font-bold text-[#234522] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3b6938]" />
                        Consórcios Favoráveis:
                      </span>
                      {planResult.companionReport.beneficialPairs.map((p, i) => (
                        <p key={i} className="text-[11px] text-[#345433]">
                          • {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {planResult.companionReport.conflictPairs.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#fceeed] border border-[#e8a29b] text-xs space-y-1">
                      <span className="font-bold text-[#8a241a] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#8a241a]" />
                        Atenção a Conflitos:
                      </span>
                      {planResult.companionReport.conflictPairs.map((p, i) => (
                        <p key={i} className="text-[11px] text-[#701f17]">
                          • {p}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Save / Export to Garden Action */}
              {selectedProfiles.length > 0 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleExportPlanToGarden}
                    className="px-5 py-2.5 rounded-2xl bg-[#284229] hover:bg-[#1a2f1b] text-xs font-bold text-[#f7f5ee] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Sprout className="w-4 h-4 text-[#a3d495]" />
                    <span>Transpor Planejamento para o Meu Jardim</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Reference Table View: Quick Spacing Guide */
        <div className="bg-[#faf7f2] p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-botanic text-xl font-bold text-[#233321]">
                Guia de Espaçamento & Porte Adulto das Espécies
              </h3>
              <p className="text-xs text-[#6e5f48] font-narrative">
                Consulte as dimensões biológicas, estratificação de luz e consórcios recomendados para cada planta.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#ded5c2] text-[#4f422d] font-cinzel uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Espécie</th>
                  <th className="py-3 px-3">Altura Adulta</th>
                  <th className="py-3 px-3">Envergadura (Copa)</th>
                  <th className="py-3 px-3">Espaçamento Entre Mudas</th>
                  <th className="py-3 px-3">Vaso Mínimo</th>
                  <th className="py-3 px-3">Plantas Companheiras</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe1cf]">
                {allSpecies.map((plant) => {
                  const profile = getSpeciesSpacingProfile(plant);
                  return (
                    <tr key={plant.id} className="hover:bg-[#f3ede0] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#243522] block">{plant.nomePopular}</span>
                        <span className="text-[11px] text-[#695d48] italic">{plant.nomeCientifico}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#2c3d2a]">
                        {profile.alturaAdultoCm} cm
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#2c3d2a]">
                        Ø {profile.envergaduraCm} cm
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#355b33]">
                        {profile.espacamentoPlantasCm} cm
                      </td>
                      <td className="py-3 px-3 font-mono text-[#574936]">
                        {profile.profundidadeMinimaVasoCm} cm
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#4f422e]">
                        {profile.plantasCompanheiras.join(", ") || "Espécie neutra"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            handleAddSpeciesToPlan(plant.id);
                            setActiveViewTab("simulador");
                          }}
                          className="px-3 py-1 rounded-xl bg-[#2b442a] hover:bg-[#1e301e] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Simular
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
