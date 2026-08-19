import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Sun, 
  Droplets, 
  Plus, 
  BookOpen, 
  Heart, 
  BookmarkPlus, 
  ShieldCheck, 
  Compass,
  Check,
  Loader2,
  RefreshCw
} from "lucide-react";
import { PlantEntry } from "../types";
import { CATEGORIES } from "../data/plants";

interface EncyclopediaViewProps {
  plants: PlantEntry[];
  onSelectPlant: (plant: PlantEntry) => void;
  onAddToGarden: (plant: PlantEntry) => void;
  gardenPlantIds: Set<string>;
  onAddNewAiPlant: (plant: PlantEntry) => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
  plants,
  onSelectPlant,
  onAddToGarden,
  gardenPlantIds,
  onAddNewAiPlant,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedLight, setSelectedLight] = useState<string>("Todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Todas");
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);

  // AI Plant Generation State
  const [isGeneratingAiPlant, setIsGeneratingAiPlant] = useState(false);
  const [aiPlantInput, setAiPlantInput] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch =
        plant.nomePopular.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.nomeCientifico.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.familia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.beneficiosMedicinais?.some((b) =>
          b.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "Todas" || plant.categoria === selectedCategory;

      const matchesLight =
        selectedLight === "Todas" || plant.luminosidade.includes(selectedLight);

      const matchesDifficulty =
        selectedDifficulty === "Todas" || plant.dificuldade === selectedDifficulty;

      const matchesPet =
        !petFriendlyOnly ||
        plant.toxicidade.includes("Pet-Friendly") ||
        plant.toxicidade.includes("Comestível");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLight &&
        matchesDifficulty &&
        matchesPet
      );
    });
  }, [
    plants,
    searchQuery,
    selectedCategory,
    selectedLight,
    selectedDifficulty,
    petFriendlyOnly,
  ]);

  const handleGenerateAiPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPlantInput.trim()) return;

    setIsGeneratingAiPlant(true);
    setAiError(null);
    setAiSuccessMsg(null);

    try {
      const response = await fetch("/api/gemini/plant-monograph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantName: aiPlantInput.trim() }),
      });

      if (!response.ok) {
        throw new Error("Erro na geração da monografia.");
      }

      const data = await response.json();
      
      const newPlant: PlantEntry = {
        id: `ai-plant-${Date.now()}`,
        nomePopular: data.nomePopular || aiPlantInput.trim(),
        nomeCientifico: data.nomeCientifico || "Espécie botânica",
        familia: data.familia || "Não classificada",
        categoria: (data.categoria as any) || "Medicinal",
        origem: data.origem || "Global",
        luminosidade: (data.luminosidade as any) || "Sol Pleno ou Meia-Sombra",
        frequenciaRega: (data.frequenciaRega as any) || "2 a 3 vezes/semana",
        dificuldade: "Fácil",
        ciclo: "Perene",
        epocaPlantio: "Primavera",
        faseLunarIdeal: (data.faseLunarIdealPlantio as any)?.includes("Cheia") ? "Lua Cheia" : "Lua Crescente",
        solo: data.soloIdeal || "Solo rico e bem drenado",
        phIdeal: "6.0 - 7.0",
        beneficiosMedicinais: data.usosFitoterapicos?.map((u: any) => u.beneficio) || ["Uso tradicional"],
        usosFitoterapicos: data.usosFitoterapicos?.map((u: any) => ({
          beneficio: u.beneficio,
          modoPreparo: u.modoPreparo,
          dosagem: u.dosagemTradicional || "1 xícara ao dia",
          contraindicacao: u.contraindicacoes
        })),
        culinaria: data.usosCulinarios,
        toxicidade: (data.toxicidade as any) || "Não Tóxica (Pet-Friendly)",
        imagemUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
        descricaoCurta: data.descricaoMorfologica?.slice(0, 140) + "..." || "Planta catalogada via sabedoria botânica.",
        descricaoCompleta: data.descricaoMorfologica || "Monografia completa da espécie.",
        dicaAlmanaque: data.proverbioAlmanaque || data.curiosidadeHistorica || "Cultive com carinho e observe as fases lunares.",
        pragasComuns: data.pragasComuns || ["Pulgões", "Cochonilhas"]
      };

      onAddNewAiPlant(newPlant);
      setAiSuccessMsg(`Ficha de "${newPlant.nomePopular}" gerada com sucesso e adicionada ao herbário!`);
      setAiPlantInput("");
      onSelectPlant(newPlant);
    } catch (err: any) {
      console.error(err);
      setAiError("Não foi possível gerar a ficha botânica no momento. Verifique a chave ou tente outro nome.");
    } finally {
      setIsGeneratingAiPlant(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Herbarium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#233825] via-[#2f4931] to-[#1c2c1c] text-[#f7f3e8] p-6 sm:p-10 border border-[#3e5e3f] shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(155,200,141,0.15),transparent_70%)] pointer-events-none"></div>
        
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2b1d] text-[#b8deb0] text-xs font-semibold uppercase tracking-wider border border-[#3c593d]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Grande Herbário Digital & Enciclopédia</span>
          </div>

          <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-[#f4efe4]">
            Sabedoria Botânica, Nomes Científicos & Fitoterapia Ancestral
          </h1>

          <p className="text-sm sm:text-base text-[#d8cfbe] font-narrative leading-relaxed">
            Consulte fichas completas de cultivo, propriedades medicinais, toxicidade para pets, solo ideal e a fase da lua mais favorável para o plantio e colheita de cada espécie.
          </p>

          {/* Quick AI Plant Generator Bar */}
          <form onSubmit={handleGenerateAiPlant} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2 bg-[#1b2a1c]/90 p-2 rounded-2xl border border-[#3e5e40] shadow-md">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Sparkles className="w-4 h-4 text-[#a6d899] shrink-0" />
                <input
                  type="text"
                  placeholder="Não achou uma planta? Digite qualquer espécie (ex: Pitanga, Cúrcuma, Neem)..."
                  value={aiPlantInput}
                  onChange={(e) => setAiPlantInput(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-[#f7f4ec] placeholder-[#9ca797] focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isGeneratingAiPlant || !aiPlantInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#3c633a] hover:bg-[#4b7a48] disabled:opacity-50 text-xs sm:text-sm font-semibold text-[#f7f5ef] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                {isGeneratingAiPlant ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#c6e8bb]" />
                    <span>Catalogando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c6e8bb]" />
                    <span>Gerar Ficha com IA</span>
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="text-xs text-[#ff9e80] mt-2 font-medium">⚠️ {aiError}</p>
            )}
            {aiSuccessMsg && (
              <p className="text-xs text-[#b8f0aa] mt-2 font-medium">✨ {aiSuccessMsg}</p>
            )}
          </form>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#f5efe3] p-5 sm:p-6 rounded-2xl border border-[#ded5c2] shadow-xs space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#887b64] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome popular, nome científico (ex: Salvia, Lavandula), família ou benefício (calmante, gastrite)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-sm text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#406343]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c7f69] hover:text-[#2c3328] px-2 py-1 bg-[#ede6d5] rounded-md"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-cinzel font-bold tracking-wider text-[#544937] uppercase">
              Categorias Botânicas
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                    : "bg-[#eae2d0] text-[#544937] hover:bg-[#ded4bf] border border-[#d2c7b0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Dropdowns & Toggles */}
        <div className="pt-2 border-t border-[#e2d8c3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Luminosity filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#695d48] font-medium">Luz:</span>
              <select
                value={selectedLight}
                onChange={(e) => setSelectedLight(e.target.value)}
                className="bg-[#faf7f2] border border-[#d6ccb8] rounded-lg px-2.5 py-1 text-xs text-[#3d3425] focus:outline-hidden"
              >
                <option value="Todas">Todas as luminâncias</option>
                <option value="Sol Pleno">Sol Pleno</option>
                <option value="Meia-Sombra">Meia-Sombra</option>
                <option value="Sombra">Sombra</option>
              </select>
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#695d48] font-medium">Cultivo:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-[#faf7f2] border border-[#d6ccb8] rounded-lg px-2.5 py-1 text-xs text-[#3d3425] focus:outline-hidden"
              >
                <option value="Todas">Todas dificuldades</option>
                <option value="Fácil">Fácil (Iniciante)</option>
                <option value="Médio">Médio</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>

          {/* Pet Friendly Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={petFriendlyOnly}
              onChange={(e) => setPetFriendlyOnly(e.target.checked)}
              className="rounded-sm text-[#3c633a] focus:ring-[#3c633a] w-4 h-4"
            />
            <span className="font-semibold text-[#4f4330] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3b7538]" />
              Apenas Seguras para Pets
            </span>
          </label>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#6e624e] px-1">
        <span>
          Exibindo <strong>{filteredPlants.length}</strong> de {plants.length} espécies catalogadas
        </span>
        {(searchQuery || selectedCategory !== "Todas" || selectedLight !== "Todas" || petFriendlyOnly) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Todas");
              setSelectedLight("Todas");
              setSelectedDifficulty("Todas");
              setPetFriendlyOnly(false);
            }}
            className="text-[#3b5e39] font-semibold hover:underline cursor-pointer"
          >
            Redefinir Filtros
          </button>
        )}
      </div>

      {/* Plant Grid */}
      {filteredPlants.length === 0 ? (
        <div className="text-center py-16 bg-[#f7f2e7] rounded-3xl border border-[#ded5c2] p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-[#998b72] mx-auto opacity-70" />
          <h3 className="font-serif-botanic text-2xl font-bold text-[#3d3527]">
            Nenhuma espécie encontrada para estes critérios
          </h3>
          <p className="text-sm text-[#665a45] max-w-md mx-auto font-narrative">
            Tente buscar com termos mais amplos ou use o botão <strong>"Gerar Ficha com IA"</strong> no topo da página para catalogar qualquer planta!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => {
            const inGarden = gardenPlantIds.has(plant.id);
            return (
              <div
                key={plant.id}
                id={`plant-card-${plant.id}`}
                onClick={() => onSelectPlant(plant)}
                className="group relative bg-[#faf7f2] rounded-2xl border border-[#ded5c2] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
              >
                {/* Plant Thumbnail Image Plate */}
                <div className="relative h-52 overflow-hidden bg-[#ebe4d3]">
                  <img
                    src={plant.imagemUrl}
                    alt={plant.nomePopular}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#243825]/90 text-[#d2e8cb] backdrop-blur-xs border border-[#3e5f3f]">
                      {plant.categoria}
                    </span>
                  </div>

                  {/* Quick Add to Garden Button on Image */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToGarden(plant);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                      inGarden
                        ? "bg-[#284229] text-[#b8f0aa]"
                        : "bg-black/40 hover:bg-[#284229] text-white"
                    }`}
                    title={inGarden ? "Já está no seu jardim" : "Adicionar ao Meu Jardim"}
                  >
                    {inGarden ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 left-3 right-3 text-[#fbf8f2]">
                    <h3 className="font-serif-botanic text-xl font-bold leading-snug drop-shadow-xs">
                      {plant.nomePopular}
                    </h3>
                    <p className="text-xs text-[#dcd2be] font-narrative italic font-medium">
                      {plant.nomeCientifico}
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#524838] font-narrative leading-relaxed line-clamp-2">
                    {plant.descricaoCurta}
                  </p>

                  {/* Care Matrix Icons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ebe3d3] text-[11px] text-[#5e533e]">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#bf7c20] shrink-0" />
                      <span className="truncate">{plant.luminosidade}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-[#2b7294] shrink-0" />
                      <span className="truncate">{plant.frequenciaRega}</span>
                    </div>
                  </div>

                  {/* Tags / Medicinal Badges */}
                  {plant.beneficiosMedicinais && plant.beneficiosMedicinais.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {plant.beneficiosMedicinais.slice(0, 2).map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#ede4d2] text-[#4d4231] text-[10px] font-medium"
                        >
                          🌿 {b}
                        </span>
                      ))}
                      {plant.beneficiosMedicinais.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#ede4d2] text-[#695d47] text-[10px]">
                          +{plant.beneficiosMedicinais.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-2 border-t border-[#ebe3d3] flex items-center justify-between">
                    <span className="text-[11px] text-[#736854] font-mono">
                      Lua: {plant.faseLunarIdeal}
                    </span>
                    <span className="text-xs font-semibold text-[#2f4f2f] group-hover:underline flex items-center gap-1">
                      Ver Monografia →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
