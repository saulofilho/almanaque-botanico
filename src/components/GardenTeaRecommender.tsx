import React, { useState, useMemo } from "react";
import { 
  CupSoda, 
  Sparkles, 
  Leaf, 
  Check, 
  Clock, 
  Heart, 
  AlertCircle, 
  Sprout, 
  Filter, 
  ChevronRight, 
  FlaskConical, 
  Sun, 
  Moon, 
  Coffee, 
  Plus, 
  BookOpen,
  HelpCircle,
  Flame,
  CheckCircle2,
  Compass,
  ArrowUpRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry } from "../types";
import { 
  GardenTeaRecipe, 
  GardenTeaMatch, 
  analyzeGardenTeaMatches, 
  blendCustomGardenHarvest, 
  TEA_HERBS_CATALOG,
  CustomBlendSynergy
} from "../utils/gardenTeaRecommender";

interface GardenTeaRecommenderProps {
  garden: UserPlant[];
  allSpecies: PlantEntry[];
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

export const GardenTeaRecommender: React.FC<GardenTeaRecommenderProps> = ({
  garden,
  allSpecies,
  onSelectPlantModal,
}) => {
  const [activeTab, setActiveTab] = useState<"recomendados" | "alquimia" | "farmacia">("recomendados");
  const [filterAvailability, setFilterAvailability] = useState<"todas" | "completas" | "quasela">("todas");
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<GardenTeaMatch | null>(null);
  
  // Custom Harvest Blender State
  const [selectedGardenPlantIds, setSelectedGardenPlantIds] = useState<string[]>(() => {
    // Default select up to 2 garden plants
    return garden.slice(0, 2).map((p) => p.id);
  });
  const [preparedTeasCount, setPreparedTeasCount] = useState<number>(0);

  // Compute all matches against the user's garden
  const teaMatches: GardenTeaMatch[] = useMemo(() => {
    return analyzeGardenTeaMatches(garden, allSpecies);
  }, [garden, allSpecies]);

  const readyToBrewCount = teaMatches.filter((m) => m.isFullyAvailable).length;

  const filteredMatches = teaMatches.filter((m) => {
    if (filterAvailability === "completas") return m.isFullyAvailable;
    if (filterAvailability === "quasela") return !m.isFullyAvailable && m.availableCount > 0;
    return true;
  });

  // Identify garden plants eligible for tea
  const gardenTeaPlants = useMemo(() => {
    return garden.filter((p) => {
      const species = allSpecies.find((s) => s.id === p.especieId);
      const name = (species?.nomePopular || p.nomePersonalizado).toLowerCase();
      return (
        species?.categoria === "Medicinal" ||
        species?.categoria === "Horta & Ervas" ||
        species?.categoria === "PANCs" ||
        name.includes("lavanda") ||
        name.includes("alecrim") ||
        name.includes("hortelã") ||
        name.includes("manjericão") ||
        name.includes("camomila") ||
        name.includes("guaco") ||
        name.includes("boldo") ||
        name.includes("capim") ||
        name.includes("cidreira") ||
        name.includes("ora-pro-nóbis")
      );
    });
  }, [garden, allSpecies]);

  // Compute custom blend synergy
  const customSynergy: CustomBlendSynergy | null = useMemo(() => {
    const selectedSpeciesIds = selectedGardenPlantIds
      .map((id) => {
        const p = garden.find((g) => g.id === id);
        return p?.especieId || "";
      })
      .filter(Boolean);

    return blendCustomGardenHarvest(selectedSpeciesIds, allSpecies);
  }, [selectedGardenPlantIds, garden, allSpecies]);

  const handleToggleGardenPlantSelection = (plantId: string) => {
    if (selectedGardenPlantIds.includes(plantId)) {
      setSelectedGardenPlantIds(selectedGardenPlantIds.filter((id) => id !== plantId));
    } else {
      setSelectedGardenPlantIds([...selectedGardenPlantIds, plantId]);
    }
  };

  const handleCelebrateTeaBrewed = (recipeTitle: string) => {
    setPreparedTeasCount((prev) => prev + 1);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#3b6338", "#a4d495", "#e8c374", "#b07340"],
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#233a25] via-[#2f4a30] to-[#1c2c1c] text-[#f7f5ee] border border-[#3e5f3f] shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
          <CupSoda className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18291a] text-[#bce3b2] text-xs font-semibold uppercase tracking-wider border border-[#375939]">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Farmácia Viva & Alquimia das Ervas</span>
          </div>

          <h2 className="font-serif-botanic text-2xl sm:text-4xl font-bold leading-tight text-[#fbf8f0]">
            Recomendador de Chás do Meu Jardim
          </h2>

          <p className="text-xs sm:text-sm text-[#ded4bf] font-narrative leading-relaxed">
            Descubra receitas ancestrais e tisanas terapêuticas que você pode preparar agora mesmo utilizando as plantas colhidas do seu próprio herbanário.
          </p>

          {/* Quick Stat Pill */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-[#355236] text-[#e3f4df] border border-[#486e49] font-medium flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-[#a3d495]" />
              <strong>{gardenTeaPlants.length}</strong> plantas medicinais no seu jardim
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#e5ca78] text-[#33240d] font-bold flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#69480a]" />
              <strong>{readyToBrewCount}</strong> receitas 100% disponíveis hoje!
            </span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => setActiveTab("recomendados")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "recomendados"
                  ? "bg-[#faf7f2] text-[#1f2f20] shadow-xs"
                  : "bg-[#345236] hover:bg-[#3f6341] text-[#ded6c5]"
              }`}
            >
              Misturas Recomendadas
            </button>
            <button
              onClick={() => setActiveTab("alquimia")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "alquimia"
                  ? "bg-[#faf7f2] text-[#1f2f20] shadow-xs"
                  : "bg-[#345236] hover:bg-[#3f6341] text-[#ded6c5]"
              }`}
            >
              Alquimia da Minha Colheita
            </button>
            <button
              onClick={() => setActiveTab("farmacia")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "farmacia"
                  ? "bg-[#faf7f2] text-[#1f2f20] shadow-xs"
                  : "bg-[#345236] hover:bg-[#3f6341] text-[#ded6c5]"
              }`}
            >
              Ervas Medicinais Cultivadas
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Recomendados com Base no Jardim */}
      {activeTab === "recomendados" && (
        <div className="space-y-6">
          {/* Availability Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#faf7f2] p-3 sm:p-4 rounded-2xl border border-[#ded5c2]">
            <div className="flex items-center gap-1.5 text-xs text-[#524430] font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#3b6338]" />
              <span>Filtrar por Disponibilidade:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterAvailability("todas")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filterAvailability === "todas"
                    ? "bg-[#284229] text-[#f7f5ee] font-bold"
                    : "bg-[#ede5d4] text-[#4f4330] hover:bg-[#ded4be]"
                }`}
              >
                Todas ({teaMatches.length})
              </button>
              <button
                onClick={() => setFilterAvailability("completas")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  filterAvailability === "completas"
                    ? "bg-[#284229] text-[#f7f5ee] font-bold"
                    : "bg-[#ede5d4] text-[#4f4330] hover:bg-[#ded4be]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#d4ad48]" />
                100% no Jardim ({readyToBrewCount})
              </button>
              <button
                onClick={() => setFilterAvailability("quasela")}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  filterAvailability === "quasela"
                    ? "bg-[#284229] text-[#f7f5ee] font-bold"
                    : "bg-[#ede5d4] text-[#4f4330] hover:bg-[#ded4be]"
                }`}
              >
                Quase Lá / Faltando 1 ({teaMatches.length - readyToBrewCount})
              </button>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              const { recipe, isFullyAvailable, matchPercentage, availablePlants, missingHerbs } = match;

              return (
                <div
                  key={recipe.id}
                  className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between transition-all hover:shadow-md ${
                    isFullyAvailable
                      ? "bg-[#fbf9f4] border-[#b4d6ae] shadow-xs ring-1 ring-[#8bbd83]/30"
                      : "bg-[#faf7f2] border-[#ded5c2]"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge & Timing */}
                    <div className="flex items-start justify-between gap-2">
                      {isFullyAvailable ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e3efe0] text-[#244723] border border-[#aed4a7] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3b6b38]" />
                          100% no seu Jardim
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ede5d4] text-[#5c4d37] border border-[#d6ccb8]">
                          {match.availableCount} de {match.totalRequired} ervas ({matchPercentage}%)
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#ede5d4] text-[#544633]">
                        {recipe.objetivoTerapeutico}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="font-serif-botanic text-lg font-bold text-[#233321] leading-snug">
                        {recipe.titulo}
                      </h3>
                      <p className="text-xs text-[#6e5f48] font-narrative mt-1 leading-relaxed">
                        {recipe.subtitulo}
                      </p>
                    </div>

                    {/* Plant Ingredients in Garden vs Missing */}
                    <div className="space-y-2 pt-2 border-t border-[#ebe2d0]">
                      <span className="text-[11px] font-bold uppercase tracking-wider font-cinzel text-[#365033] block">
                        Ingredientes da Mistura:
                      </span>

                      <div className="space-y-1.5">
                        {recipe.ingredientesObrigatorios.map((ing, idx) => {
                          const userMatch = availablePlants.find(
                            (p) => p.matchedHerbName === ing.nomeErva
                          );

                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 ${
                                userMatch
                                  ? "bg-[#eef5eb] text-[#244523] border border-[#bcdcb7]"
                                  : "bg-[#f5efe3] text-[#70624d] border border-dashed border-[#d8ccb8]"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {userMatch ? (
                                  <Check className="w-3.5 h-3.5 text-[#3b6b38] shrink-0" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-[#8f7e65] shrink-0" />
                                )}
                                <span className="font-semibold truncate">{ing.nomeErva}</span>
                                {userMatch && (
                                  <span className="text-[10px] text-[#4d694c] truncate italic">
                                    ({userMatch.userPlant.nomePersonalizado})
                                  </span>
                                )}
                              </div>

                              <span className="text-[10px] text-[#695c47] shrink-0">
                                {ing.quantidadeSugerida.split("(")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proportions and Timing */}
                    <div className="p-3 rounded-2xl bg-[#f5eee0] border border-[#ded5c0] space-y-1.5 text-xs text-[#524430]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-[#3b6338] font-semibold">
                          <Clock className="w-3 h-3" /> {recipe.tempoPreparo}
                        </span>
                        <span className="font-medium text-[#735933]">
                          {recipe.melhorHorario}
                        </span>
                      </div>
                      <p className="text-[11px] italic font-narrative text-[#61523d]">
                        Proporção: {recipe.proporcoesRecomendadas}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-[#ebe2d0] flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedRecipeDetail(match)}
                      className="text-xs font-bold text-[#274526] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Ver Modo de Preparo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCelebrateTeaBrewed(recipe.titulo)}
                      className="px-3 py-1.5 rounded-xl bg-[#284229] hover:bg-[#1c301d] text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                      title="Registrar que você preparou esta infusão"
                    >
                      <CupSoda className="w-3.5 h-3.5 text-[#a4d495]" />
                      <span>Degustar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Alquimia da Minha Colheita (Custom Harvest Blender) */}
      {activeTab === "alquimia" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Select Garden Harvest (5 cols) */}
          <div className="lg:col-span-5 bg-[#faf7f2] p-5 sm:p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-5">
            <div>
              <h3 className="font-serif-botanic text-lg font-bold text-[#233321] flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#355933]" />
                1. O Que Você Colheu Hoje?
              </h3>
              <p className="text-xs text-[#6e5f48] font-narrative mt-1">
                Selecione as ervas do seu jardim para calcular a sinergia dos princípios ativos e a proporção harmônica da infusão.
              </p>
            </div>

            {gardenTeaPlants.length === 0 ? (
              <div className="text-center py-8 bg-[#f5eee0] rounded-2xl border border-dashed border-[#d8ccb6] p-4 text-xs text-[#6e5f49]">
                Você ainda não possui plantas medicinais ou ervas aromáticas cadastradas no Meu Jardim. Adicione Alecrim, Lavanda ou Hortelã para testar!
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {gardenTeaPlants.map((plant) => {
                  const isSelected = selectedGardenPlantIds.includes(plant.id);
                  const species = allSpecies.find((s) => s.id === plant.especieId);

                  return (
                    <button
                      key={plant.id}
                      onClick={() => handleToggleGardenPlantSelection(plant.id)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        isSelected
                          ? "bg-[#e5eee1] border-[#81b87b] shadow-2xs text-[#244422]"
                          : "bg-[#f5efe3] border-[#ded5c2] hover:bg-[#eae1cd] text-[#423625]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#325b30] text-white border-[#274925]"
                              : "bg-white border-[#c9bfa9]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <span className="font-bold block truncate">{plant.nomePersonalizado}</span>
                          <span className="text-[11px] text-[#695d48] italic truncate">
                            {species?.nomeCientifico || plant.nomeCientifico || "Erva Medicinal"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/70 border border-[#d6ccb8] text-[#574936] shrink-0 font-medium">
                        {plant.estadoSaude}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#eee5d3] border border-[#d8ccb6] text-xs text-[#524430] flex items-center justify-between">
              <span>Plantas selecionadas:</span>
              <strong className="font-mono text-[#233521] text-sm">
                {selectedGardenPlantIds.length} ervas
              </strong>
            </div>
          </div>

          {/* Right Column: Custom Blend Formula (7 cols) */}
          <div className="lg:col-span-7 bg-[#faf7f2] p-6 sm:p-8 rounded-3xl border border-[#ded5c2] shadow-xs space-y-6">
            {!customSynergy ? (
              <div className="text-center py-12 space-y-3">
                <CupSoda className="w-12 h-12 text-[#8c7e68] mx-auto opacity-60" />
                <h4 className="font-serif-botanic text-lg font-bold text-[#3d3224]">
                  Selecione ao menos uma erva da sua colheita
                </h4>
                <p className="text-xs text-[#6e5f49] max-w-sm mx-auto font-narrative">
                  O alquimista botânico calculará a proporção de folhas, a temperatura ideal da água e os benefícios terapêuticos combinados.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                {/* Header of Formula */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ded5c2] pb-4">
                  <div>
                    <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#355733] block">
                      Fórmula Fitoterápica Personalizada
                    </span>
                    <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#233321]">
                      {customSynergy.primaryObjective}
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-[#e5eee1] text-[#274d26] border border-[#bedbb7] text-xs font-bold flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    {customSynergy.bestTimeOfDay}
                  </span>
                </div>

                {/* Narrative description */}
                <p className="text-xs sm:text-sm text-[#4f412e] font-narrative leading-relaxed">
                  {customSynergy.synergyDescription}
                </p>

                {/* Suggested Proportions Grid */}
                <div className="space-y-2">
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#365033] block">
                    Proporção Recomendada da Mistura:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customSynergy.recommendedProportions.map((prop, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#f5eee0] border border-[#ded5c0] text-xs flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-[#2b3d29]">{prop.herb}</span>
                        <span className="text-[11px] font-mono text-[#785c34] font-semibold">
                          {prop.proportion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infusion Temperature & Active Principles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-[#eee5d3] border border-[#d8ccb6]">
                    <span className="text-[10px] uppercase font-bold text-[#695c47] block">Temperatura</span>
                    <span className="font-bold text-[#233521] text-sm">{customSynergy.idealTemperature}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#eee5d3] border border-[#d8ccb6]">
                    <span className="text-[10px] uppercase font-bold text-[#695c47] block">Tempo de Infusão</span>
                    <span className="font-bold text-[#233521] text-sm">{customSynergy.idealInfusionTime}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#eee5d3] border border-[#d8ccb6] col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-[#695c47] block">Princípios Voláteis</span>
                    <span className="font-semibold text-[#233521] text-[11px] truncate block">
                      {customSynergy.activeCompounds.slice(0, 2).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Step by step Brewing */}
                <div className="p-4 rounded-2xl bg-[#f5eee1] border border-[#ded5c0] space-y-2 text-xs">
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2b4429] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#d46533]" />
                    Ritual de Preparo da Infusão
                  </span>
                  <ol className="space-y-1.5 text-xs text-[#4d3e2d] list-decimal list-inside font-narrative">
                    {customSynergy.brewingStepByStep.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleCelebrateTeaBrewed("Fórmula da Colheita")}
                    className="px-5 py-2.5 rounded-2xl bg-[#284229] hover:bg-[#1b2e1c] text-xs font-bold text-[#f7f5ee] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <CupSoda className="w-4 h-4 text-[#a3d495]" />
                    <span>Preparar Esta Infusão Agora</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Farmácia Viva das Ervas Cultivadas */}
      {activeTab === "farmacia" && (
        <div className="bg-[#faf7f2] p-6 sm:p-8 rounded-3xl border border-[#ded5c2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-botanic text-xl font-bold text-[#233321]">
                Farmácia Viva: Ervas e Chás do Seu Herbanário
              </h3>
              <p className="text-xs text-[#6e5f48] font-narrative">
                Guia das propriedades ativas, sabor e infusão de cada espécime medicinal presente no seu jardim.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gardenTeaPlants.map((plant) => {
              const species = allSpecies.find((s) => s.id === plant.especieId);
              const profile = TEA_HERBS_CATALOG[species?.id || ""] || {
                perfilSabor: "Aromático / Herbal",
                temperaturaAgua: "90°C",
                tempoInfusao: "7 a 10 min",
                propriedadesPrincipais: species?.beneficiosMedicinais?.slice(0, 3) || ["Medicinal", "Revigorante"],
                parteUsada: "Folhas",
              };

              return (
                <div
                  key={plant.id}
                  className="p-4 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-[#233321] text-sm">
                          {plant.nomePersonalizado}
                        </h4>
                        <span className="text-[11px] text-[#6e5f48] italic">
                          {species?.nomeCientifico || plant.nomeCientifico || "Planta Medicinal"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#e3d7c3] text-[#4a3c2a] text-[10px] font-semibold">
                        {plant.localizacao}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#544633]">
                      <p>
                        <strong>Perfil de Sabor:</strong> {profile.perfilSabor}
                      </p>
                      <p>
                        <strong>Parte Utilizada:</strong> {profile.parteUsada}
                      </p>
                      <p>
                        <strong>Água & Infusão:</strong> {profile.temperaturaAgua} • {profile.tempoInfusao}
                      </p>
                    </div>

                    {/* Properties Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {profile.propriedadesPrincipais.map((prop, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/80 border border-[#d6ccb8] text-[10px] text-[#365033] font-medium"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>

                  {species && onSelectPlantModal && (
                    <button
                      onClick={() => onSelectPlantModal(species)}
                      className="text-[11px] font-bold text-[#274526] hover:underline cursor-pointer pt-2 border-t border-[#ded5c2] flex items-center justify-between"
                    >
                      <span>Monografia Completa no Herbário</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#faf7f2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ded5c2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#ded5c2] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e5eee1] text-[#254b24]">
                  {selectedRecipeDetail.recipe.objetivoTerapeutico}
                </span>
                <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f] mt-1">
                  {selectedRecipeDetail.recipe.titulo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecipeDetail(null)}
                className="p-1.5 rounded-xl bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#544633] font-narrative leading-relaxed">
              {selectedRecipeDetail.recipe.subtitulo}
            </p>

            {/* Ingredients */}
            <div className="space-y-2">
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2d4529] block">
                Ingredientes & Ervas Necessárias:
              </span>
              <ul className="space-y-1.5 text-xs text-[#4d3e2d]">
                {selectedRecipeDetail.recipe.ingredientesObrigatorios.map((ing, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-[#f2ecde] border border-[#ded4be] flex items-center justify-between">
                    <span className="font-bold text-[#233321]">{ing.nomeErva}</span>
                    <span className="text-[11px] text-[#6e5f48]">{ing.quantidadeSugerida}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step */}
            <div className="space-y-2">
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2d4529] block">
                Passo a Passo da Infusão:
              </span>
              <ol className="space-y-1.5 text-xs text-[#4d3e2d] list-decimal list-inside font-narrative leading-relaxed">
                {selectedRecipeDetail.recipe.modoPreparo.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Secret of the Almanac */}
            <div className="p-4 rounded-2xl bg-[#f5eee1] border border-[#ded5c0] space-y-1 text-xs">
              <span className="font-bold text-[#2b4429] flex items-center gap-1.5 font-cinzel uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#3b6b38]" />
                Segredo Fitoterápico do Almanaque
              </span>
              <p className="font-narrative leading-relaxed text-[#524330]">
                {selectedRecipeDetail.recipe.segredoAlmanaque}
              </p>
            </div>

            {selectedRecipeDetail.recipe.contraindicacoes && (
              <div className="p-3 rounded-xl bg-[#fcf0ed] border border-[#f0c2bb] text-[11px] text-[#822a20] space-y-0.5">
                <strong>Precaução / Contraindicações:</strong>
                <p>{selectedRecipeDetail.recipe.contraindicacoes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-[#6e5f48] italic">
                {selectedRecipeDetail.recipe.melhorHorario}
              </span>

              <button
                onClick={() => {
                  handleCelebrateTeaBrewed(selectedRecipeDetail.recipe.titulo);
                  setSelectedRecipeDetail(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] text-xs font-bold text-[#f7f5ee] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CupSoda className="w-4 h-4 text-[#a3d495]" />
                <span>Degustar Chá</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
