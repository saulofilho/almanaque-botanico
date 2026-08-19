import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  Leaf, 
  Flame, 
  Droplets, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Info, 
  HelpCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { PlantEntry } from "../types";

interface PropertyDictionaryProps {
  plants: PlantEntry[];
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

// Therapeutic Benefit Filters
const BENEFIT_TAGS = [
  "Todos",
  "Calmante",
  "Digestivo",
  "Anti-inflamatório",
  "Cicatrizante",
  "Respiratório & Imunidade",
  "Detox & Fígado",
  "Antisséptico & Pele",
] as const;

// Preparation Method Filters
const PREPARATION_METHODS = [
  { id: "todos", label: "Todas as Formas", icon: Sparkles },
  { id: "infusao", label: "Infusão (Chá)", icon: Droplets, desc: "Para folhas finas e flores aromáticas. Despeje água fervente e abafe por 5-10 min." },
  { id: "decoccao", label: "Decocção", icon: Flame, desc: "Para raízes, cascas e rizomas. Ferva em fogo brando de 10 a 15 min." },
  { id: "compressa", label: "Compressa / Cataplasma", icon: Leaf, desc: "Para uso tópico. Folhas maceradas ou pano embebido no chá morno aplicados na pele." },
  { id: "oleo", label: "Óleo Macerado / Unguento", icon: Sparkles, desc: "Extração dos princípios lipofílicos em azeite vegetal para massagem ou cicatrização." },
  { id: "banho", label: "Banho de Ervas & Inalação", icon: Droplets, desc: "Absorção cutânea e inalação de vapores medicinais calmantes ou descongestionantes." },
] as const;

export const PropertyDictionary: React.FC<PropertyDictionaryProps> = ({
  plants,
  onSelectPlantModal,
}) => {
  const [selectedBenefit, setSelectedBenefit] = useState<string>("Todos");
  const [selectedMethod, setSelectedMethod] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMethodGuide, setShowMethodGuide] = useState<boolean>(false);

  // Extract plants that have medicinal benefits or fitotherapic uses
  const medicinalPlants = useMemo(() => {
    return plants.filter((p) => {
      const hasBenefits = (p.beneficiosMedicinais && p.beneficiosMedicinais.length > 0) ||
        (p.usosFitoterapicos && p.usosFitoterapicos.length > 0) ||
        p.categoria === "Medicinal";
      return hasBenefits;
    });
  }, [plants]);

  // Filtered List
  const filteredPlants = useMemo(() => {
    return medicinalPlants.filter((plant) => {
      // 1. Benefit Filter
      const matchesBenefit =
        selectedBenefit === "Todos" ||
        plant.beneficiosMedicinais?.some((b) =>
          b.toLowerCase().includes(selectedBenefit.toLowerCase().split(" ")[0])
        ) ||
        plant.usosFitoterapicos?.some((u) =>
          u.beneficio.toLowerCase().includes(selectedBenefit.toLowerCase().split(" ")[0])
        );

      // 2. Method Filter
      const matchesMethod =
        selectedMethod === "todos" ||
        plant.usosFitoterapicos?.some((u) => {
          const prep = u.modoPreparo.toLowerCase();
          if (selectedMethod === "infusao") return prep.includes("infus") || prep.includes("chá") || prep.includes("abaf");
          if (selectedMethod === "decoccao") return prep.includes("decoc") || prep.includes("ferv");
          if (selectedMethod === "compressa") return prep.includes("compress") || prep.includes("cataplasma") || prep.includes("tópico");
          if (selectedMethod === "oleo") return prep.includes("óleo") || prep.includes("azeite") || prep.includes("macerad") || prep.includes("unguento");
          if (selectedMethod === "banho") return prep.includes("banho") || prep.includes("inala") || prep.includes("vapor");
          return true;
        });

      // 3. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        plant.nomePopular.toLowerCase().includes(q) ||
        plant.nomeCientifico.toLowerCase().includes(q) ||
        plant.beneficiosMedicinais?.some((b) => b.toLowerCase().includes(q)) ||
        plant.usosFitoterapicos?.some((u) =>
          u.beneficio.toLowerCase().includes(q) || u.modoPreparo.toLowerCase().includes(q)
        );

      return matchesBenefit && matchesMethod && matchesQuery;
    });
  }, [medicinalPlants, selectedBenefit, selectedMethod, searchQuery]);

  return (
    <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-5 sm:p-8 shadow-xs space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ded5c2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#284229] text-[#b8f0aa]">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
              Dicionário de Propriedades & Métodos de Preparo
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#665a45] font-narrative">
            Explore as virtudes terapêuticas, formas corretas de extração de princípios ativos e dosagens seguras do herbário tradicional.
          </p>
        </div>

        {/* Toggle Extraction Methods Guide */}
        <button
          onClick={() => setShowMethodGuide((prev) => !prev)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap ${
            showMethodGuide
              ? "bg-[#284229] text-[#f7f5ee]"
              : "bg-[#e8dec9] text-[#4f422e] hover:bg-[#ded2ba] border border-[#d2c4aa]"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showMethodGuide ? "Ocultar Guia de Métodos" : "Guia Prático de Extrações"}</span>
        </button>
      </div>

      {/* Expandable Extraction Methods Guide Box */}
      {showMethodGuide && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#faf7f2] border-2 border-[#3c633a]/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#2e5229] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Guia Prático: Como Preparar Cada Tipo de Planta
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREPARATION_METHODS.filter((m) => m.id !== "todos").map((m) => {
              const IconComp = m.icon;
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-[#233522]">
                    <IconComp className="w-4 h-4 text-[#3c6838]" />
                    <span>{m.label}</span>
                  </div>
                  <p className="text-[#594d3a] font-narrative leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a7d67] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por benefício (ex: ansiedade, gastrite, cicatrização), nome da planta ou modo de preparo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-xs sm:text-sm text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#406343]"
          />
        </div>

        {/* Benefit filter chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold font-cinzel uppercase tracking-wider text-[#544733] flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#396336]" />
            Filtrar por Benefício Terapêutico:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BENEFIT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedBenefit(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedBenefit === tag
                    ? "bg-[#284229] text-[#f7f5ee] shadow-xs"
                    : "bg-[#e8dfcc] text-[#524531] hover:bg-[#ded3bc] border border-[#d2c4aa]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Preparation method filter buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold font-cinzel uppercase tracking-wider text-[#544733] flex items-center gap-1">
            <Droplets className="w-3 h-3 text-[#396336]" />
            Filtrar por Método de Preparo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PREPARATION_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedMethod === m.id
                    ? "bg-[#254226] text-[#e8f5e3] border border-[#3e693f] shadow-xs"
                    : "bg-[#ece4d3] text-[#544733] hover:bg-[#ded4be] border border-[#d4c7af]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#6e614c] pt-2 border-t border-[#ded5c2]">
        <span>
          Exibindo <strong>{filteredPlants.length}</strong> plantas medicinais catalogadas
        </span>
        {(selectedBenefit !== "Todos" || selectedMethod !== "todos" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedBenefit("Todos");
              setSelectedMethod("todos");
              setSearchQuery("");
            }}
            className="text-[#872d1f] hover:underline font-semibold cursor-pointer"
          >
            Limpar Filtros ✕
          </button>
        )}
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div className="text-center py-12 bg-[#faf7f2] rounded-2xl border border-[#ded5c2] p-6 space-y-2">
          <Leaf className="w-10 h-10 text-[#9c8e76] mx-auto opacity-70" />
          <h3 className="font-serif-botanic text-lg font-bold text-[#3d3323]">
            Nenhuma espécie encontrada com esses critérios
          </h3>
          <p className="text-xs text-[#6e614c] font-narrative">
            Tente selecionar outro benefício terapêutico ou limpar a busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="bg-[#faf7f2] rounded-2xl border border-[#ded5c2] p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with thumbnail & names */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={plant.imagemUrl}
                    alt={plant.nomePopular}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#d6ccb8] shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-[#284229] text-[#d6f0cf]">
                        {plant.categoria}
                      </span>
                      {plant.toxicidade.includes("Não Tóxica") && (
                        <span className="text-[10px] text-[#2d5c28] bg-[#e3f2df] px-1.5 py-0.5 rounded font-medium border border-[#c4e3be]">
                          Pet-Safe ✓
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif-botanic text-xl font-bold text-[#1a2b1b] leading-tight">
                      {plant.nomePopular}
                    </h3>
                    <p className="text-xs text-[#6e614c] italic font-narrative">
                      {plant.nomeCientifico}
                    </p>
                  </div>
                </div>

                {/* Medicinal Benefits Tags */}
                {plant.beneficiosMedicinais && plant.beneficiosMedicinais.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#635541]">
                      Virtudes & Propriedades Curativas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {plant.beneficiosMedicinais.map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#eee6d5] text-[#3d3322] text-[11px] font-medium border border-[#ded2bc]"
                        >
                          🌿 {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phytotherapic Preparation & Dosages */}
                {plant.usosFitoterapicos && plant.usosFitoterapicos.length > 0 ? (
                  <div className="p-3.5 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-2 text-xs">
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#2e5429] flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-[#3b6b37]" />
                      Receituário de Preparo & Posologia:
                    </span>
                    {plant.usosFitoterapicos.map((uso, idx) => (
                      <div key={idx} className="space-y-1 text-[#423727] text-xs border-t border-[#e8decb] pt-2 first:border-0 first:pt-0">
                        <p>
                          <strong>Ação:</strong> {uso.beneficio}
                        </p>
                        <p>
                          <strong>Modo de Preparo:</strong> {uso.modoPreparo}
                        </p>
                        <p>
                          <strong>Dosagem Segura:</strong> {uso.dosagem}
                        </p>
                        {uso.contraindicacao && (
                          <p className="text-[#8a3321] text-[11px] bg-[#f7ebe6] p-1.5 rounded border border-[#eed4cc]">
                            ⚠️ <strong>Contraindicação:</strong> {uso.contraindicacao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#f5efe3] border border-[#ded5c2] text-xs text-[#594d3a] font-narrative">
                    <strong>Preparo Tradicional:</strong> {plant.dicaAlmanaque}
                  </div>
                )}
              </div>

              {/* Action: Open full monograph modal */}
              {onSelectPlantModal && (
                <button
                  onClick={() => onSelectPlantModal(plant)}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f5ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver Ficha Botânica Completa</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
