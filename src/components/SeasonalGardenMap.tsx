import React, { useState, useMemo } from "react";
import { 
  Sun, 
  Moon, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Info, 
  Plus, 
  Check, 
  ArrowRight, 
  Compass, 
  Layers, 
  Flower2, 
  Leaf, 
  Palette, 
  HelpCircle, 
  Sprout, 
  TreePine, 
  Maximize2, 
  Eye,
  Sliders,
  Award,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { PlantEntry, UserPlant } from "../types";
import { 
  SeasonKey, 
  SEASON_METADATA, 
  BOTANICAL_SEASONAL_PROFILES, 
  PlantSeasonalProfile, 
  getPlantSeasonalProfile, 
  getCurrentSeasonHemisphereSouth 
} from "../data/seasonalPlantData";

interface SeasonalGardenMapProps {
  allSpecies: PlantEntry[];
  garden: UserPlant[];
  onAddToGarden?: (plant: PlantEntry) => void;
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

export const SeasonalGardenMap: React.FC<SeasonalGardenMapProps> = ({
  allSpecies,
  garden,
  onAddToGarden,
  onSelectPlantModal,
}) => {
  // Current calendar real-world season
  const currentActualSeason = useMemo(() => getCurrentSeasonHemisphereSouth(), []);

  // Selected simulated season
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey>(currentActualSeason);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"mapa" | "o_que_plantar" | "ciencia_cores" | "calendario_floracao">("mapa");

  // Selected plant for deep seasonal modal / inspection
  const [inspectedPlantId, setInspectedPlantId] = useState<string>("lavanda-officinalis");

  // Filter for "O que plantar"
  const [purposeFilter, setPurposeFilter] = useState<string>("todos");
  const [lightingFilter, setLightingFilter] = useState<string>("todos");

  // Interactive garden map state: user placed plants in garden zones
  const [zonePlantMapping, setZonePlantMapping] = useState<{ [zoneId: string]: string[] }>({
    sol_aberto: ["lavanda-officinalis", "alecrim-rosmarinus", "babosa-aloe-vera"],
    meia_sombra_copa: ["jabuticabeira-plinia", "guaco-mikania"],
    vaso_varanda: ["hortela-mentha", "camomila-recutita"],
    cerca_perimetro: ["ora-pro-nobis", "ipe-amarelo"],
  });

  // Convert all available species to seasonal profiles
  const allProfiles: PlantSeasonalProfile[] = useMemo(() => {
    return allSpecies.map((sp) => getPlantSeasonalProfile(sp, sp.nomePopular));
  }, [allSpecies]);

  // The inspected profile
  const inspectedProfile = useMemo(() => {
    const fromList = allProfiles.find((p) => p.plantId === inspectedPlantId);
    if (fromList) return fromList;
    const sp = allSpecies.find((s) => s.id === inspectedPlantId);
    return getPlantSeasonalProfile(sp, sp?.nomePopular || inspectedPlantId);
  }, [inspectedPlantId, allProfiles, allSpecies]);

  const activeSeasonMeta = SEASON_METADATA[selectedSeason];

  // Recommendations for "O que plantar" in the selected season
  const seasonalPlantingRecommendations = useMemo(() => {
    return allProfiles.filter((p) => {
      const matchSeason = p.melhoresEstacoesParaPlantar.includes(selectedSeason);
      const matchPurpose =
        purposeFilter === "todos" ||
        p.objetivoJardim.some((obj) => obj.toLowerCase().includes(purposeFilter.toLowerCase()));
      const matchLight =
        lightingFilter === "todos" ||
        p.luminosidade.toLowerCase().includes(lightingFilter.toLowerCase());

      return matchSeason && matchPurpose && matchLight;
    });
  }, [allProfiles, selectedSeason, purposeFilter, lightingFilter]);

  const handlePlaceInZone = (zoneKey: string, plantId: string) => {
    setZonePlantMapping((prev) => {
      const currentList = prev[zoneKey] || [];
      if (currentList.includes(plantId)) return prev;
      return {
        ...prev,
        [zoneKey]: [...currentList, plantId],
      };
    });
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
      colors: ["#68a357", "#d4bb6e", "#375939"],
    });
  };

  const handleRemoveFromZone = (zoneKey: string, plantId: string) => {
    setZonePlantMapping((prev) => ({
      ...prev,
      [zoneKey]: (prev[zoneKey] || []).filter((id) => id !== plantId),
    }));
  };

  const gardenZones = [
    {
      id: "sol_aberto",
      name: "Canteiro de Sol Pleno (Canteiro Central)",
      description: "6+ horas de sol direto diário • Solo rico, drenado e aerado.",
      icon: "☀️",
      recommendedPortes: "Ervas aromáticas, lavandas, sálvias e alecrim.",
      bgStyle:
        selectedSeason === "verao"
          ? "bg-[#fff7ed] border-[#fed7aa]"
          : selectedSeason === "inverno"
          ? "bg-[#f1f5f9] border-[#cbd5e1]"
          : selectedSeason === "outono"
          ? "bg-[#fef3c7] border-[#fde68a]"
          : "bg-[#f0fdf4] border-[#bbf7d0]",
    },
    {
      id: "meia_sombra_copa",
      name: "Zona de Meia-Sombra (Sob Copas & Árvores)",
      description: "Sol filtrado matinal ou 3 a 4 horas de luminosidade indireta.",
      icon: "🌳",
      recommendedPortes: "Frutíferas nativas, guacos, espinheira-santa e samambaias.",
      bgStyle:
        selectedSeason === "verao"
          ? "bg-[#fefce8] border-[#fef08a]"
          : selectedSeason === "inverno"
          ? "bg-[#f8fafc] border-[#e2e8f0]"
          : selectedSeason === "outono"
          ? "bg-[#fffbeb] border-[#fde68a]"
          : "bg-[#ecfdf5] border-[#a7f3d0]",
    },
    {
      id: "vaso_varanda",
      name: "Jardineira de Vasos & Parapeito",
      description: "Cultivo controlado em vasos de cerâmica e jardineiras suspensas.",
      icon: "🪴",
      recommendedPortes: "Hortelã em vaso isolado, camomila, calêndula e chás de xícara.",
      bgStyle:
        selectedSeason === "verao"
          ? "bg-[#fffbeb] border-[#fef3c7]"
          : selectedSeason === "inverno"
          ? "bg-[#f1f5f9] border-[#e2e8f0]"
          : selectedSeason === "outono"
          ? "bg-[#fff7ed] border-[#ffedd5]"
          : "bg-[#f0fdf4] border-[#dcfce7]",
    },
    {
      id: "cerca_perimetro",
      name: "Cerca-Viva & Perímetro do Jardim",
      description: "Suporte para trepadeiras, barreira de vento e abrigo de pássaros.",
      icon: "🧱",
      recommendedPortes: "Ora-pro-nóbis vigorosa, maracujazeiros, ipês e arbustos de divisa.",
      bgStyle:
        selectedSeason === "verao"
          ? "bg-[#fef9c3] border-[#fef08a]"
          : selectedSeason === "inverno"
          ? "bg-[#f3f4f6] border-[#d1d5db]"
          : selectedSeason === "outono"
          ? "bg-[#fef3c7] border-[#fde047]"
          : "bg-[#dcfce7] border-[#86efac]",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner with Seasonal Weather Simulator */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${activeSeasonMeta.bgGradient} border border-[#ded5c2] shadow-xl p-6 sm:p-10 transition-all duration-700`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#284229] text-[#e8f5e6] text-xs font-semibold uppercase tracking-wider shadow-xs">
              <Compass className="w-3.5 h-3.5 text-[#98c58b]" />
              <span>Simulador Fenológico & Paisagismo Sazonal</span>
            </div>

            <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight text-[#1c2e1d]">
              As 4 Estações do Jardim Vivo
            </h1>

            <p className="text-sm sm:text-base text-[#4f4330] font-narrative leading-relaxed">
              Descubra <strong className="text-[#1c2e1d]">o que plantar em cada época</strong>, veja{" "}
              <strong className="text-[#1c2e1d]">quando cada espécie floresce</strong> e aprenda{" "}
              <strong className="text-[#1c2e1d]">que cores as folhas e flores assumem</strong> ao longo do ano
              conforme a planta muda com o clima!
            </p>
          </div>

          {/* Interactive Season Switcher Widget */}
          <div className="bg-[#ffffff]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#d6ccb8] shadow-md flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#73634c]">
                Estação Simulada no Jardim:
              </span>
              {selectedSeason === currentActualSeason && (
                <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-bold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                  Estação Atual
                </span>
              )}
            </div>

            {/* Season buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["primavera", "verao", "outono", "inverno"] as SeasonKey[]).map((sk) => {
                const meta = SEASON_METADATA[sk];
                const isSelected = selectedSeason === sk;
                return (
                  <button
                    key={sk}
                    onClick={() => setSelectedSeason(sk)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#243c26] text-[#f7f5ee] border-[#182c19] shadow-md scale-103"
                        : "bg-[#f5efe3] hover:bg-[#ebd9bd] text-[#52442f] border-[#ded4be]"
                    }`}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <span className="capitalize">{meta.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-[#6b5c46] flex items-center gap-1.5 border-t border-[#ebd9bd] pt-2">
              <Info className="w-3.5 h-3.5 text-[#3b6637] shrink-0" />
              <span>{activeSeasonMeta.monthsPt} • {activeSeasonMeta.atmosphereTip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0ebd9] p-1.5 rounded-2xl border border-[#ded4be] shadow-2xs">
        <button
          onClick={() => setActiveTab("mapa")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "mapa"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Layers className="w-4 h-4 text-[#a4d495]" />
          <span>Mapinha Interativo do Jardim</span>
        </button>

        <button
          onClick={() => setActiveTab("o_que_plantar")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "o_que_plantar"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Sprout className="w-4 h-4 text-[#a4d495]" />
          <span>O que Plantar Nesta Estação ({activeSeasonMeta.name})</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a4d495] text-[#19331a]">
            {seasonalPlantingRecommendations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("calendario_floracao")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "calendario_floracao"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Flower2 className="w-4 h-4 text-[#a4d495]" />
          <span>Quando Vai Florescer? (Calendário)</span>
        </button>

        <button
          onClick={() => setActiveTab("ciencia_cores")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "ciencia_cores"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Palette className="w-4 h-4 text-[#a4d495]" />
          <span>Por que a Planta Muda de Cor?</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: O MAPINHA INTERATIVO DAS 4 ESTAÇÕES */}
      {/* ========================================================================= */}
      {activeTab === "mapa" && (
        <div className="space-y-6">
          {/* Map Header Instructions */}
          <div className="bg-[#faf7f2] p-5 rounded-2xl border border-[#ded5c2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeSeasonMeta.icon}</span>
                <h3 className="font-serif-botanic text-lg sm:text-xl font-bold text-[#1f2e1f]">
                  Mapa Visual dos Canteiros na {activeSeasonMeta.name}
                </h3>
              </div>
              <p className="text-xs text-[#6e5f49] font-narrative">
                Ao mudar a estação acima, as plantas no mapa mudam de cor, exibem floração e adaptam suas folhas!
                Clique em qualquer planta para ver sua paleta cromática detalhada.
              </p>
            </div>

            {/* Quick filter by species list to inspect */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#544834] whitespace-nowrap">Inspecionar:</span>
              <select
                value={inspectedPlantId}
                onChange={(e) => setInspectedPlantId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs font-semibold text-[#2c3328] focus:outline-hidden"
              >
                {allProfiles.map((p) => (
                  <option key={p.plantId} value={p.plantId}>
                    {p.nomePopular} ({p.categoria})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Garden Map Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Map Canvas with Zones */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gardenZones.map((zone) => {
                  const plantIdsInZone = zonePlantMapping[zone.id] || [];

                  return (
                    <div
                      key={zone.id}
                      className={`p-5 rounded-3xl border-2 transition-all duration-500 shadow-sm flex flex-col justify-between space-y-4 ${zone.bgStyle}`}
                    >
                      {/* Zone Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{zone.icon}</span>
                            <h4 className="font-serif-botanic text-base font-bold text-[#1c2e1d]">
                              {zone.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#695b47] leading-relaxed">
                            {zone.description}
                          </p>
                        </div>
                      </div>

                      {/* Plants Planted in this Zone */}
                      <div className="space-y-2 min-h-[140px] bg-[#ffffff]/60 backdrop-blur-xs p-3 rounded-2xl border border-[#000000]/5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#635541]">
                          <span>Espécimes Plantados ({plantIdsInZone.length})</span>
                          <span className="italic text-[#70806a]">Transformação na {activeSeasonMeta.name}</span>
                        </div>

                        {plantIdsInZone.length === 0 ? (
                          <div className="py-6 text-center text-xs text-[#8c7e68] italic">
                            Nenhuma espécie posicionada neste canteiro ainda.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {plantIdsInZone.map((pid) => {
                              const profile = allProfiles.find((p) => p.plantId === pid) || getPlantSeasonalProfile(null, pid);
                              const seasonApp = profile.seasons[selectedSeason];
                              const isInspected = inspectedPlantId === profile.plantId;

                              return (
                                <div
                                  key={pid}
                                  onClick={() => setInspectedPlantId(profile.plantId)}
                                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs group ${
                                    isInspected
                                      ? "bg-[#233b24] text-[#f7f5ee] border-[#182c19] ring-2 ring-[#77b26c]"
                                      : "bg-[#ffffff] hover:bg-[#faf6ee] text-[#2c3328] border-[#ded4be]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Color Avatar Swatch showing leaf & flower color */}
                                    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[#000000]/15 shadow-inner"
                                         style={{ backgroundColor: seasonApp.foliageHex }}>
                                      {seasonApp.hasFlowers && (
                                        <span
                                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm border border-[#ffffff]"
                                          style={{ backgroundColor: seasonApp.flowerHex || "#f472b6" }}
                                          title={`Em floração: ${seasonApp.flowerColorName}`}
                                        >
                                          🌸
                                        </span>
                                      )}
                                      {seasonApp.hasFruits && (
                                        <span
                                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm border border-[#ffffff]"
                                          style={{ backgroundColor: seasonApp.fruitHex || "#eab308" }}
                                          title={`Com frutos: ${seasonApp.fruitColorName}`}
                                        >
                                          🍇
                                        </span>
                                      )}
                                      <Leaf className={`w-4 h-4 ${isInspected ? "text-[#ffffff]" : "text-[#ffffff]"}`} />
                                    </div>

                                    <div className="min-w-0">
                                      <h5 className="text-xs font-bold truncate leading-tight">
                                        {profile.nomePopular}
                                      </h5>
                                      <p className={`text-[10px] truncate ${isInspected ? "text-[#a4d495]" : "text-[#70624c]"}`}>
                                        {seasonApp.stageLabel}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFromZone(zone.id, pid);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-red-600 hover:bg-red-50 p-1 rounded-md transition-opacity"
                                    title="Remover do canteiro"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Add Plant to Zone dropdown */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#000000]/5">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handlePlaceInZone(zone.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          defaultValue=""
                          className="w-full p-2 rounded-xl bg-[#ffffff]/90 border border-[#d6ccb8] text-[11px] text-[#2c3328] font-semibold focus:outline-hidden"
                        >
                          <option value="" disabled>
                            + Adicionar espécie neste canteiro...
                          </option>
                          {allProfiles.map((p) => (
                            <option key={p.plantId} value={p.plantId}>
                              {p.nomePopular} ({p.porte})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Cols: Deep Seasonal Spectrum & Botanical Morphology of Selected Plant */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#faf7f2] p-5 sm:p-6 rounded-3xl border border-[#ded5c2] shadow-md space-y-5">
                <div className="border-b border-[#e6dcce] pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#284229] text-[#e8f5e6] text-[10px] font-bold uppercase mb-2">
                    <Eye className="w-3 h-3 text-[#98c58b]" />
                    <span>Raio-X Fenológico & Cromático</span>
                  </div>

                  <h3 className="font-serif-botanic text-2xl font-bold text-[#1c2e1d]">
                    {inspectedProfile.nomePopular}
                  </h3>
                  <p className="text-xs text-[#6e5f49] italic font-narrative">
                    {inspectedProfile.nomeCientifico} • {inspectedProfile.categoria}
                  </p>
                </div>

                {/* Active Season Preview Card for the Inspected Plant */}
                {(() => {
                  const currentApp = inspectedProfile.seasons[selectedSeason];
                  return (
                    <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#d9ceba] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{activeSeasonMeta.icon}</span>
                          <span className="text-xs font-bold text-[#233a24] uppercase tracking-wider">
                            Na {activeSeasonMeta.name}:
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e3f2dc] text-[#224f21]">
                          {currentApp.stageLabel}
                        </span>
                      </div>

                      {/* Color Swatch Display */}
                      <div className="p-3 rounded-xl bg-[#f8f5ee] border border-[#e8ded0] space-y-2">
                        <div className="text-[11px] font-bold text-[#453725] flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#3b6637]" />
                          <span>Paleta Cromática Desta Estação:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Foliage Swatch */}
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#ded4be]">
                            <span
                              className="w-4 h-4 rounded-full border border-[#000000]/20 shadow-inner"
                              style={{ backgroundColor: currentApp.foliageHex }}
                            ></span>
                            <span className="text-[11px] font-semibold text-[#2c3328]">
                              {currentApp.foliageColorName}
                            </span>
                          </div>

                          {/* Flower Swatch if blooming */}
                          {currentApp.hasFlowers && (
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#ded4be]">
                              <span
                                className="w-4 h-4 rounded-full border border-[#000000]/20 shadow-inner"
                                style={{ backgroundColor: currentApp.flowerHex || "#f472b6" }}
                              ></span>
                              <span className="text-[11px] font-semibold text-[#8b3d68]">
                                🌸 {currentApp.flowerColorName}
                              </span>
                            </div>
                          )}

                          {/* Fruit Swatch */}
                          {currentApp.hasFruits && (
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#ded4be]">
                              <span
                                className="w-4 h-4 rounded-full border border-[#000000]/20 shadow-inner"
                                style={{ backgroundColor: currentApp.fruitHex || "#eab308" }}
                              ></span>
                              <span className="text-[11px] font-semibold text-[#b45309]">
                                🍇 {currentApp.fruitColorName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#4f4330] font-narrative leading-relaxed">
                        {currentApp.visualDescription}
                      </p>

                      <div className="text-[11px] bg-[#edf6eb] p-2.5 rounded-xl border border-[#cbe3c6] text-[#224f21] font-medium">
                        <strong>Manejo Recomendado:</strong> {currentApp.botanicalCare}
                      </div>
                    </div>
                  );
                })()}

                {/* 4 Seasons Color Evolution Strip */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#73634c] block">
                    Transformação Morfológica nos 12 Meses:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["primavera", "verao", "outono", "inverno"] as SeasonKey[]).map((sk) => {
                      const app = inspectedProfile.seasons[sk];
                      const isCur = selectedSeason === sk;

                      return (
                        <div
                          key={sk}
                          onClick={() => setSelectedSeason(sk)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isCur
                              ? "bg-[#284229] text-[#f7f5ee] border-[#182c19] ring-2 ring-[#85b97c]"
                              : "bg-[#ffffff] text-[#4d402e] border-[#ded4be] hover:bg-[#f6eee0]"
                          }`}
                        >
                          <div
                            className="w-full h-5 rounded-md mb-1 border border-[#000000]/15"
                            style={{ backgroundColor: app.foliageHex }}
                          ></div>
                          <span className="text-[10px] font-bold block capitalize">
                            {SEASON_METADATA[sk].icon} {sk}
                          </span>
                          <span className={`text-[9px] block truncate ${isCur ? "text-[#a4d495]" : "text-[#73634c]"}`}>
                            {app.hasFlowers ? "🌸 Florindo" : app.hasFruits ? "🍇 Frutos" : "🌿 Folhas"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Why it changes color explanation callout */}
                <div className="p-3.5 rounded-2xl bg-[#f5efe3] border border-[#d6ccb8] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#3d3223]">
                    <Sparkles className="w-3.5 h-3.5 text-[#3b6637]" />
                    <span>Por que ela muda de cor?</span>
                  </div>
                  <p className="text-[11px] text-[#544834] leading-relaxed font-narrative">
                    {inspectedProfile.porQueMudaDeCor}
                  </p>
                </div>

                {/* Companions & Spacing */}
                <div className="space-y-1.5 text-[11px] text-[#544834]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3d3223]">Espaçamento recomendado:</span>
                    <span>{inspectedProfile.espacamentoRecomendadoCm} cm</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#3d3223]">Companheiras de Canteiro: </span>
                    <span>{inspectedProfile.plantasCompanheiras.join(", ") || "Espécie rústica e adaptável."}</span>
                  </div>
                </div>

                {/* Action button */}
                {onAddToGarden && (
                  <button
                    onClick={() => {
                      const spec = allSpecies.find((s) => s.id === inspectedProfile.plantId);
                      if (spec) {
                        onAddToGarden(spec);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#284229] hover:bg-[#182c19] text-[#f7f5ee] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Plantar no Meu Herbanário</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: O QUE PLANTAR NESTA ESTAÇÃO */}
      {/* ========================================================================= */}
      {activeTab === "o_que_plantar" && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="bg-[#faf7f2] p-6 rounded-3xl border border-[#ded5c2] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] text-xs font-bold mb-1">
                  <span>{activeSeasonMeta.icon} Plantio na {activeSeasonMeta.name}</span>
                </div>
                <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                  Guia Estratégico: O que Colocar no Solo Agora
                </h3>
                <p className="text-xs text-[#6e5f49] font-narrative">
                  Espécies com taxa de germinação máxima e enraizamento vigoroso durante a {activeSeasonMeta.name}.
                </p>
              </div>

              {/* Season switcher quick chips */}
              <div className="flex items-center gap-1.5 bg-[#f0ebd9] p-1 rounded-xl border border-[#ded4be]">
                {(["primavera", "verao", "outono", "inverno"] as SeasonKey[]).map((sk) => (
                  <button
                    key={sk}
                    onClick={() => setSelectedSeason(sk)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSeason === sk
                        ? "bg-[#284229] text-[#f7f5ee] shadow-xs"
                        : "text-[#544834] hover:bg-[#e4dcce]"
                    }`}
                  >
                    {SEASON_METADATA[sk].icon} {SEASON_METADATA[sk].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#ded5c2]">
              <div>
                <label className="text-[11px] font-bold text-[#453725] block mb-1">
                  Filtrar por Finalidade do Canteiro:
                </label>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] font-semibold focus:outline-hidden"
                >
                  <option value="todos">Todos os Objetivos (Farmácia, Aromas, Polinizadores...)</option>
                  <option value="Medicinal">Farmácia Viva & Chás Medicinais</option>
                  <option value="Culinária">Ervas Culinárias & Aromáticas</option>
                  <option value="Polinizadores">Flores Atraentes de Polinizadores</option>
                  <option value="Sombreamento">Sombreamento, Cercas & Árvores</option>
                  <option value="Forração">Vasos, Parapeitos & Forrações</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#453725] block mb-1">
                  Filtrar por Luminosidade Disponível:
                </label>
                <select
                  value={lightingFilter}
                  onChange={(e) => setLightingFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] font-semibold focus:outline-hidden"
                >
                  <option value="todos">Todas as Luminosidades</option>
                  <option value="Sol Pleno">Sol Pleno (6+ horas de sol direto)</option>
                  <option value="Meia-Sombra">Meia-Sombra (Luz filtrada)</option>
                  <option value="Sombra">Sombra Luminosa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {seasonalPlantingRecommendations.length === 0 ? (
            <div className="p-12 text-center bg-[#faf7f2] rounded-3xl border border-[#ded5c2] space-y-3">
              <Sprout className="w-12 h-12 text-[#99b79f] mx-auto" />
              <h4 className="font-serif-botanic text-lg font-bold text-[#233a24]">
                Nenhuma espécie encontrada com esses filtros
              </h4>
              <p className="text-xs text-[#6e5f49]">
                Tente redefinir os filtros de objetivo ou luminosidade para ver outras espécies recomendadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {seasonalPlantingRecommendations.map((profile) => {
                const spec = allSpecies.find((s) => s.id === profile.plantId);
                const seasonApp = profile.seasons[selectedSeason];

                return (
                  <div
                    key={profile.plantId}
                    className="bg-[#faf7f2] rounded-3xl border border-[#ded5c2] p-5 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      {/* Image and Header */}
                      <div className="flex items-start gap-3">
                        <img
                          src={spec?.imagemUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"}
                          alt={profile.nomePopular}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#c5b89e] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#e3f0df] text-[#224f21] text-[10px] font-bold">
                              {profile.categoria}
                            </span>
                            <span className="text-[10px] text-[#6b5c46]">
                              {profile.luminosidade}
                            </span>
                          </div>
                          <h4 className="font-serif-botanic text-lg font-bold text-[#1f2e1f] truncate leading-tight mt-0.5">
                            {profile.nomePopular}
                          </h4>
                          <p className="text-[11px] text-[#6e5f49] italic truncate">
                            {profile.nomeCientifico}
                          </p>
                        </div>
                      </div>

                      {/* Phenology in this season */}
                      <div className="p-3 rounded-2xl bg-[#ffffff] border border-[#e8ded0] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#453725]">Comportamento na {activeSeasonMeta.name}:</span>
                          <span className="font-semibold text-[#284229]">{seasonApp.stageLabel}</span>
                        </div>

                        {/* Color palette */}
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-[#6e5f49]">Cores:</span>
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#000000]/20"
                            style={{ backgroundColor: seasonApp.foliageHex }}
                            title={`Folhagem: ${seasonApp.foliageColorName}`}
                          ></span>
                          <span className="text-[#3d3223] font-medium truncate">{seasonApp.foliageColorName}</span>
                          {seasonApp.hasFlowers && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-[#000000]/20 ml-1"
                              style={{ backgroundColor: seasonApp.flowerHex || "#f472b6" }}
                              title={`Flores: ${seasonApp.flowerColorName}`}
                            ></span>
                          )}
                        </div>
                      </div>

                      {/* Planting tips */}
                      <p className="text-xs text-[#544834] font-narrative leading-relaxed">
                        {profile.quandoPlantarDescricao}
                      </p>

                      {/* Companions */}
                      <div className="text-[11px] text-[#544834] bg-[#f5efe3] p-2.5 rounded-xl border border-[#d6ccb8]">
                        <strong className="text-[#2b3b2c]">Companheiras de Canteiro:</strong>{" "}
                        {profile.plantasCompanheiras.join(", ") || "Excelente adaptação individual."}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#ded5c2] flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setInspectedPlantId(profile.plantId);
                          setActiveTab("mapa");
                        }}
                        className="py-2 px-3 rounded-xl bg-[#ede5d5] hover:bg-[#ded4bf] text-xs font-bold text-[#4d402e] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver no Mapa</span>
                      </button>

                      {onAddToGarden && spec && (
                        <button
                          onClick={() => onAddToGarden(spec)}
                          className="py-2 px-4 rounded-xl bg-[#284229] hover:bg-[#182c19] text-xs font-bold text-[#f7f5ee] flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Plantar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CALENDÁRIO ANUAL DE FLORAÇÃO */}
      {/* ========================================================================= */}
      {activeTab === "calendario_floracao" && (
        <div className="space-y-6">
          <div className="bg-[#faf7f2] p-6 rounded-3xl border border-[#ded5c2] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Flower2 className="w-5 h-5 text-[#2d592a]" />
              <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                Calendário Fenológico dos 12 Meses: Quando Cada Planta Vai Florescer?
              </h3>
            </div>
            <p className="text-xs text-[#6e5f49] font-narrative leading-relaxed">
              O florescimento é acionado pelo fotoperíodo (horas diárias de sol), temperatura e alternância hídrica.
              Acompanhe a linha do tempo de floração e cores para planejar um jardim florido o ano inteiro!
            </p>
          </div>

          {/* 12 Months Timeline Matrix */}
          <div className="bg-[#faf7f2] rounded-3xl border border-[#ded5c2] p-6 shadow-md overflow-x-auto">
            <div className="min-w-[700px] space-y-4">
              {/* Header with months */}
              <div className="grid grid-cols-12 gap-1 pb-2 border-b border-[#ded5c2] text-center text-xs font-bold text-[#453725]">
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, idx) => {
                  const currentMonthIdx = new Date().getMonth();
                  const isCurrent = idx === currentMonthIdx;
                  return (
                    <div
                      key={m}
                      className={`py-1.5 rounded-lg ${
                        isCurrent ? "bg-[#284229] text-[#f7f5ee] ring-2 ring-[#85b97c]" : "bg-[#f0ebd9]"
                      }`}
                    >
                      <span>{m}</span>
                      {isCurrent && <span className="block text-[8px] font-normal">Mês Atual</span>}
                    </div>
                  );
                })}
              </div>

              {/* Plant Rows */}
              <div className="space-y-3">
                {allProfiles.map((p) => {
                  return (
                    <div
                      key={p.plantId}
                      className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#e8ded0] space-y-2 hover:border-[#b4c8af] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1f2e1f]">{p.nomePopular}</span>
                          <span className="text-[10px] text-[#70624c] italic">({p.nomeCientifico})</span>
                        </div>
                        <div className="text-[11px] text-[#4d402e]">
                          <strong>Pico de Floração:</strong>{" "}
                          <span className="capitalize font-semibold text-[#284229]">
                            {SEASON_METADATA[p.estacaoPicoFloracao].icon} {SEASON_METADATA[p.estacaoPicoFloracao].name}
                          </span>
                        </div>
                      </div>

                      {/* Month bars */}
                      <div className="grid grid-cols-12 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNum) => {
                          const isBlooming = p.mesesFloracao.includes(monthNum);
                          return (
                            <div
                              key={monthNum}
                              className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                isBlooming
                                  ? "bg-[#8b5cf6] text-[#ffffff] shadow-xs"
                                  : "bg-[#f5efe3] text-[#b0a28b]"
                              }`}
                              title={isBlooming ? `${p.nomePopular}: Em Floração Ativa no mês ${monthNum}` : "Fase Vegetativa / Repouso"}
                            >
                              {isBlooming ? "🌸" : "—"}
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-[#635541] font-narrative">
                        <strong className="text-[#384a39]">Gatilho Botânico:</strong> {p.gatilhoFloracao} — {p.descricaoFloracao}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CIÊNCIA BOTÂNICA - POR QUE A PLANTA MUDA DE COR? */}
      {/* ========================================================================= */}
      {activeTab === "ciencia_cores" && (
        <div className="space-y-6">
          <div className="bg-[#faf7f2] p-6 rounded-3xl border border-[#ded5c2] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#2d592a]" />
              <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                A Alquimia dos Pigmentos: Por Que as Plantas Mudam de Cor no Ano?
              </h3>
            </div>
            <p className="text-xs text-[#6e5f49] font-narrative leading-relaxed">
              As plantas não mudam de cor por mero capricho estético: cada tonalidade representa uma resposta bioquímica
              essencial para sobreviver ao frio, atrair polinizadores específicos ou se proteger contra a radiação solar ardente.
            </p>
          </div>

          {/* 4 Pigment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Clorofila */}
            <div className="p-5 rounded-3xl bg-[#f0fdf4] border border-[#bbf7d0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#22c55e] text-[#ffffff] flex items-center justify-center font-bold text-lg shadow-sm">
                🌿
              </div>
              <h4 className="font-serif-botanic text-lg font-bold text-[#14532d]">
                1. Clorofila (Tons Verdes)
              </h4>
              <p className="text-xs text-[#166534] font-narrative leading-relaxed">
                Dominante na <strong>Primavera e no Verão</strong>. Captura a luz solar para a fotossíntese.
                Quando a temperatura cai e os dias encurtam, a planta reabsorve a clorofila para estocar nutrientes na raiz,
                revelando os outros pigmentos que estavam escondidos.
              </p>
              <div className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] p-2 rounded-xl">
                Exemplos: Folhas tenras de manjericão, alecrim e guaco em pleno vigor.
              </div>
            </div>

            {/* Antocianinas */}
            <div className="p-5 rounded-3xl bg-[#faf5ff] border border-[#e9d5ff] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#a855f7] text-[#ffffff] flex items-center justify-center font-bold text-lg shadow-sm">
                🌸
              </div>
              <h4 className="font-serif-botanic text-lg font-bold text-[#581c87]">
                2. Antocianinas (Lilás, Roxo & Vinho)
              </h4>
              <p className="text-xs text-[#6b21a8] font-narrative leading-relaxed">
                Atuam como o <strong>"protetor solar e anticongelante"</strong> da planta.
                Surgem intensamente em brotos novos para proteger o DNA vegetal contra raios UV, e no <strong>Inverno</strong> para
                impedir que a seiva congele nas folhas durante noites gélidas.
              </p>
              <div className="text-[10px] font-bold text-[#7e22ce] bg-[#f3e8ff] p-2 rounded-xl">
                Exemplos: Flores da lavanda, pontas arroxeadas da hortelã no frio e brotos de jabuticabeira.
              </div>
            </div>

            {/* Carotenoides */}
            <div className="p-5 rounded-3xl bg-[#fffbeb] border border-[#fde68a] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f59e0b] text-[#ffffff] flex items-center justify-center font-bold text-lg shadow-sm">
                ☀️
              </div>
              <h4 className="font-serif-botanic text-lg font-bold text-[#78350f]">
                3. Carotenoides (Amarelo & Laranja)
              </h4>
              <p className="text-xs text-[#92400e] font-narrative leading-relaxed">
                Resistentes e perenes, são responsáveis pelo amarelo e laranja brilhante das flores e frutos maduros.
                No <strong>Outono</strong>, quando a clorofila verde se degrada, os carotenoides criam as folhagens douradas deslumbrantes.
              </p>
              <div className="text-[10px] font-bold text-[#b45309] bg-[#fef3c7] p-2 rounded-xl">
                Exemplos: Flores do Ipê-amarelo, miolo da camomila e frutos da ora-pro-nóbis.
              </div>
            </div>

            {/* Taninos & Lignina */}
            <div className="p-5 rounded-3xl bg-[#fef3c7] border border-[#fed7aa] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#b45309] text-[#ffffff] flex items-center justify-center font-bold text-lg shadow-sm">
                🍂
              </div>
              <h4 className="font-serif-botanic text-lg font-bold text-[#451a03]">
                4. Taninos (Bronze & Tons Terrosos)
              </h4>
              <p className="text-xs text-[#78350f] font-narrative leading-relaxed">
                Compostos amargos e adstringentes que protegem a madeira e os ramos lenhosos no <strong>Inverno</strong> contra fungos,
                bactérias e herbívoros enquanto a planta descansa em repouso vegetativo.
              </p>
              <div className="text-[10px] font-bold text-[#9a3412] bg-[#ffedd5] p-2 rounded-xl">
                Exemplos: Troncos descamados da jabuticabeira e hastes lenhosas maduras de alecrim e lavanda.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
