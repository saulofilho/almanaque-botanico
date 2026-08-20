import React, { useState, useMemo, useRef } from "react";
import { 
  Printer, 
  Download, 
  Scissors, 
  Sun, 
  Droplets, 
  Sprout, 
  Moon, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Grid, 
  Layout, 
  Check, 
  RotateCcw, 
  SlidersHorizontal,
  Leaf,
  Heart,
  Tag,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { UserPlant, PlantEntry } from "../types";
import { BOTANICAL_PLANTS } from "../data/plants";

interface PrintablePlantCardsProps {
  garden: UserPlant[];
  allSpecies?: PlantEntry[];
  initialSelectedPlantId?: string | null;
  onClose?: () => void;
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

type CardFormat = "postcard" | "tags" | "dossier";
type CardTheme = "classic" | "modern" | "eco";

export const PrintablePlantCards: React.FC<PrintablePlantCardsProps> = ({
  garden,
  allSpecies = BOTANICAL_PLANTS,
  initialSelectedPlantId = null,
  onClose,
  onSelectPlantModal,
}) => {
  // Selected plants to print
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(() => {
    if (initialSelectedPlantId) return [initialSelectedPlantId];
    return garden.map((p) => p.id);
  });

  // Print Configuration
  const [cardFormat, setCardFormat] = useState<CardFormat>("postcard");
  const [cardTheme, setCardTheme] = useState<CardTheme>("classic");
  const [includeCutLines, setIncludeCutLines] = useState<boolean>(true);
  const [includeAlmanacTip, setIncludeAlmanacTip] = useState<boolean>(true);
  const [includeToxicity, setIncludeToxicity] = useState<boolean>(true);
  const [includeUserNotes, setIncludeUserNotes] = useState<boolean>(true);
  const [includePlantAge, setIncludePlantAge] = useState<boolean>(true);
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Extract unique locations from garden
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    garden.forEach((p) => {
      if (p.localizacao) locSet.add(p.localizacao);
    });
    return Array.from(locSet);
  }, [garden]);

  // Filtered list of plants based on selection and location
  const activePlantsToPrint = useMemo(() => {
    return garden.filter((p) => {
      const isSelected = selectedPlantIds.includes(p.id);
      const matchesLocation = filterLocation === "all" || p.localizacao === filterLocation;
      return isSelected && matchesLocation;
    });
  }, [garden, selectedPlantIds, filterLocation]);

  // Helper to find encyclopedia data for a user plant
  const getEncyclopediaData = (userPlant: UserPlant): PlantEntry => {
    if (userPlant.especieId) {
      const match = allSpecies.find((s) => s.id === userPlant.especieId);
      if (match) return match;
    }
    // Match by scientific or popular name
    const fallbackMatch = allSpecies.find(
      (s) =>
        s.nomeCientifico.toLowerCase() === (userPlant.nomeCientifico || "").toLowerCase() ||
        s.nomePopular.toLowerCase() === userPlant.nomePersonalizado.toLowerCase()
    );
    if (fallbackMatch) return fallbackMatch;

    // Default template if custom unknown plant
    return {
      id: userPlant.id,
      nomePopular: userPlant.nomePersonalizado,
      nomeCientifico: userPlant.nomeCientifico || "Plantae herba",
      familia: "Herbanário Particular",
      categoria: "Horta & Ervas",
      origem: "Cultivo Doméstico",
      luminosidade: "Sol Pleno ou Meia-Sombra",
      frequenciaRega: userPlant.frequenciaDiasRega <= 2 ? "Diária" : "2 a 3 vezes/semana",
      dificuldade: "Fácil",
      ciclo: "Perene",
      epocaPlantio: "Ano todo",
      faseLunarIdeal: "Lua Crescente",
      solo: "Rico em matéria orgânica, bem drenável",
      phIdeal: "6.0 - 6.8",
      toxicidade: "Não Tóxica (Pet-Friendly)",
      imagemUrl: userPlant.imagemUrl || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
      descricaoCurta: "Espécime cultivado no herbanário com cuidados dedicados de rega e nutrição.",
      descricaoCompleta: "Planta catalogada no jardim pessoal para acompanhamento de manejo e bem-estar botânico.",
      dicaAlmanaque: "Mantenha o solo aerado e regue preferencialmente nas primeiras horas da manhã.",
      pragasComuns: ["Pulgões", "Cochonilhas"],
    };
  };

  const handleToggleSelectAll = () => {
    if (selectedPlantIds.length === garden.length) {
      setSelectedPlantIds([]);
    } else {
      setSelectedPlantIds(garden.map((p) => p.id));
    }
  };

  const handleTogglePlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateDaysSince = (dateIso: string) => {
    const d = new Date(dateIso);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - d.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Interactive Controls Header (Hidden in Print) */}
      <div className="no-print bg-[#f5efe3] p-5 sm:p-7 rounded-3xl border border-[#ded5c2] shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ded5c2] pb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#284229] flex items-center justify-center text-[#9ed38f] shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-[#406343]">
                  Impressão & Herbanário Físico
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e3d8c1] text-[#4d402e] font-semibold">
                  {activePlantsToPrint.length} de {garden.length} plantas selecionadas
                </span>
              </div>
              <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
                Cartões de Instrução & Etiquetas Imprimíveis
              </h2>
              <p className="text-xs text-[#6e624e] font-narrative max-w-2xl mt-0.5">
                Gere cartões com resumo de cuidados, necessidades de sol e rega a partir da ficha da enciclopédia para recortar, plastificar ou fixar nos seus vasos e canteiros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#e6ddcc] hover:bg-[#d8ccb8] text-[#544834] font-semibold text-xs transition-colors cursor-pointer"
              >
                Voltar ao Jardim
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={activePlantsToPrint.length === 0}
              className="px-6 py-2.5 rounded-xl bg-[#284229] hover:bg-[#192c1a] disabled:opacity-50 text-[#f7f5ee] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#a4d495]" />
              <span>Imprimir Cartões (PDF / Papel)</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Format Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-[#4d402f] flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-[#2d592b]" />
              Formato de Impressão:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#ede4d2] p-1 rounded-2xl border border-[#d6ccb8]">
              <button
                onClick={() => setCardFormat("postcard")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardFormat === "postcard"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span className="block font-medium">Postal / A6</span>
                <span className="text-[9px] opacity-80">2 por folha</span>
              </button>

              <button
                onClick={() => setCardFormat("tags")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardFormat === "tags"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span className="block font-medium">Etiquetas</span>
                <span className="text-[9px] opacity-80">4 por folha</span>
              </button>

              <button
                onClick={() => setCardFormat("dossier")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardFormat === "dossier"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span className="block font-medium">Dossiê A4</span>
                <span className="text-[9px] opacity-80">Completo</span>
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-[#4d402f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#b5802d]" />
              Estilo Visual:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#ede4d2] p-1 rounded-2xl border border-[#d6ccb8]">
              <button
                onClick={() => setCardTheme("classic")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardTheme === "classic"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span>Pergaminho</span>
              </button>

              <button
                onClick={() => setCardTheme("modern")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardTheme === "modern"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span>Minimalista</span>
              </button>

              <button
                onClick={() => setCardTheme("eco")}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  cardTheme === "eco"
                    ? "bg-[#284229] text-white shadow-xs"
                    : "text-[#544834] hover:bg-[#ded4be]"
                }`}
              >
                <span>Econômico P&B</span>
              </button>
            </div>
          </div>

          {/* Plant Location Filter */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-[#4d402f] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#3b6338]" />
              Filtrar por Canteiro / Local:
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
            >
              <option value="all">Todas as localizações ({garden.length} plantas)</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox Options & Plant Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#ded5c2] text-xs">
          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 text-[#4f4332]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCutLines}
                onChange={(e) => setIncludeCutLines(e.target.checked)}
                className="w-4 h-4 rounded-sm text-[#284229] focus:ring-[#284229]"
              />
              <span className="flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5" />
                Linhas de Corte (✂️)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAlmanacTip}
                onChange={(e) => setIncludeAlmanacTip(e.target.checked)}
                className="w-4 h-4 rounded-sm text-[#284229] focus:ring-[#284229]"
              />
              <span>Segredo do Almanaque</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeToxicity}
                onChange={(e) => setIncludeToxicity(e.target.checked)}
                className="w-4 h-4 rounded-sm text-[#284229] focus:ring-[#284229]"
              />
              <span>Segurança Pet</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeUserNotes}
                onChange={(e) => setIncludeUserNotes(e.target.checked)}
                className="w-4 h-4 rounded-sm text-[#284229] focus:ring-[#284229]"
              />
              <span>Minhas Anotações</span>
            </label>
          </div>

          {/* Select all toggle button */}
          <button
            onClick={handleToggleSelectAll}
            className="text-[11px] font-semibold text-[#2f5e2d] hover:underline cursor-pointer"
          >
            {selectedPlantIds.length === garden.length ? "Desmarcar Todas" : "Selecionar Todas"}
          </button>
        </div>

        {/* Plant selector chips list */}
        <div className="flex flex-wrap gap-2 pt-2">
          {garden.map((plant) => {
            const isSelected = selectedPlantIds.includes(plant.id);
            return (
              <button
                key={plant.id}
                onClick={() => handleTogglePlant(plant.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#284229] text-[#f7f5ee] border-[#284229] shadow-2xs"
                    : "bg-[#faf7f2] text-[#635643] border-[#ded4be] hover:bg-[#eae2cf]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                    isSelected ? "bg-[#a4d495] text-[#192e1a]" : "bg-[#ded4be] text-transparent"
                  }`}
                >
                  ✓
                </div>
                <span>{plant.nomePersonalizado}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Printable Area - Rendered on Screen as Preview & Printable via Print CSS */}
      <div 
        ref={printAreaRef}
        id="printable-cards-container"
        className={`print-container ${cardTheme === "eco" ? "theme-eco" : cardTheme === "modern" ? "theme-modern" : "theme-classic"}`}
      >
        {activePlantsToPrint.length === 0 ? (
          <div className="text-center py-16 bg-[#f7f2e7] rounded-3xl border border-[#ded5c2] p-8 space-y-3">
            <Sprout className="w-12 h-12 text-[#8a7c64] mx-auto opacity-70" />
            <h3 className="font-serif-botanic text-2xl font-bold text-[#3d3527]">
              Nenhuma planta selecionada para impressão
            </h3>
            <p className="text-xs text-[#665a45] font-narrative">
              Marque as espécies acima que você deseja incluir no lote de impressão de cartões.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              cardFormat === "tags"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 print-grid-tags"
                : cardFormat === "postcard"
                ? "grid-cols-1 md:grid-cols-2 print-grid-postcards"
                : "grid-cols-1 print-grid-dossier"
            }`}
          >
            {activePlantsToPrint.map((userPlant, idx) => {
              const enc = getEncyclopediaData(userPlant);
              const daysSince = calculateDaysSince(userPlant.dataPlantio);

              return (
                <div
                  key={userPlant.id}
                  className={`relative rounded-3xl border-2 transition-all print-card-item page-break-avoid flex flex-col justify-between overflow-hidden ${
                    cardTheme === "eco"
                      ? "bg-white border-black text-black shadow-none"
                      : cardTheme === "modern"
                      ? "bg-[#ffffff] border-[#cbd5e1] text-[#1e293b] shadow-sm"
                      : "bg-[#fdfaf5] border-[#284229] text-[#2c3328] shadow-xs"
                  } ${includeCutLines ? "border-dashed" : "border-solid"} ${
                    cardFormat === "tags" ? "p-4 sm:p-5" : cardFormat === "postcard" ? "p-6" : "p-8"
                  }`}
                >
                  {/* Scissors Cut Mark Indicator */}
                  {includeCutLines && (
                    <div className="absolute top-1 right-2 text-[10px] text-[#998b76] flex items-center gap-1 font-mono select-none opacity-60">
                      <Scissors className="w-3 h-3" />
                      <span>corte aqui</span>
                    </div>
                  )}

                  {/* Card Content Top Section */}
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="flex items-start justify-between gap-3 border-b border-[#ded5c2] pb-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              cardTheme === "eco"
                                ? "border border-black text-black"
                                : "bg-[#edf4e8] text-[#255220] border border-[#c1deba]"
                            }`}
                          >
                            {enc.categoria}
                          </span>
                          {userPlant.localizacao && (
                            <span className="text-[10px] text-[#706450] flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3" />
                              {userPlant.localizacao}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif-botanic text-2xl sm:text-3xl font-bold leading-tight">
                          {userPlant.nomePersonalizado}
                        </h3>

                        <p className="text-xs italic font-serif-botanic text-[#546b4e]">
                          {enc.nomeCientifico} • Família: {enc.familia}
                        </p>
                      </div>

                      {/* Plant Image / Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#d6ccb8] shrink-0 bg-[#eee7d8] shadow-2xs">
                        <img
                          src={userPlant.imagemUrl || enc.imagemUrl}
                          alt={userPlant.nomePersonalizado}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Vital Requirements Grid (Sun, Water, Soil, Moon) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* Sun */}
                      <div
                        className={`p-2.5 rounded-2xl border flex flex-col justify-between space-y-1 ${
                          cardTheme === "eco"
                            ? "bg-white border-black"
                            : "bg-[#faf5eb] border-[#e8ddc9]"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#92540e]">
                          <Sun className="w-3.5 h-3.5" />
                          <span>Luz & Sol</span>
                        </div>
                        <span className="font-semibold text-xs leading-snug text-[#382f21]">
                          {enc.luminosidade}
                        </span>
                      </div>

                      {/* Water */}
                      <div
                        className={`p-2.5 rounded-2xl border flex flex-col justify-between space-y-1 ${
                          cardTheme === "eco"
                            ? "bg-white border-black"
                            : "bg-[#edf7fd] border-[#c8e3f6]"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#1d6aa3]">
                          <Droplets className="w-3.5 h-3.5" />
                          <span>Rega</span>
                        </div>
                        <span className="font-semibold text-xs leading-snug text-[#183952]">
                          A cada {userPlant.frequenciaDiasRega} {userPlant.frequenciaDiasRega === 1 ? "dia" : "dias"}
                        </span>
                      </div>

                      {/* Soil & pH */}
                      <div
                        className={`p-2.5 rounded-2xl border flex flex-col justify-between space-y-1 ${
                          cardTheme === "eco"
                            ? "bg-white border-black"
                            : "bg-[#f2efe9] border-[#ded7ca]"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#453724]">
                          <Sprout className="w-3.5 h-3.5" />
                          <span>Solo & pH</span>
                        </div>
                        <span className="font-medium text-[11px] leading-tight text-[#3b3223] truncate" title={enc.solo}>
                          pH {enc.phIdeal}
                        </span>
                      </div>

                      {/* Lunar & Cycle */}
                      <div
                        className={`p-2.5 rounded-2xl border flex flex-col justify-between space-y-1 ${
                          cardTheme === "eco"
                            ? "bg-white border-black"
                            : "bg-[#f5eefb] border-[#e0cbf2]"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#622a94]">
                          <Moon className="w-3.5 h-3.5" />
                          <span>Lua / Ciclo</span>
                        </div>
                        <span className="font-medium text-[11px] leading-tight text-[#381e52]">
                          {enc.faseLunarIdeal} • {enc.ciclo}
                        </span>
                      </div>
                    </div>

                    {/* Care & Maintenance Summary */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#355731] block">
                        Instruções de Manejo & Cuidados:
                      </span>
                      <p className="text-xs font-narrative leading-relaxed text-[#3d3323]">
                        {enc.descricaoCurta}
                      </p>
                    </div>

                    {/* Dossier or Detailed Section if Postcard / Dossier */}
                    {cardFormat !== "tags" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        {/* Medicinal / Culinary Uses */}
                        <div className="p-3 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-1">
                          <span className="font-bold text-[#2a4528] flex items-center gap-1 text-[11px]">
                            <Heart className="w-3 h-3 text-[#2a4528]" />
                            Usos & Benefícios:
                          </span>
                          <p className="text-[11px] text-[#4f4230] leading-relaxed">
                            {enc.beneficiosMedicinais?.slice(0, 3).join(", ") ||
                              enc.culinaria ||
                              "Uso ornamental e equilíbrio ecológico do herbanário."}
                          </p>
                        </div>

                        {/* Common Pests and Prevention */}
                        <div className="p-3 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-1">
                          <span className="font-bold text-[#6b3e1f] flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3 h-3 text-[#6b3e1f]" />
                            Prevenção de Pragas:
                          </span>
                          <p className="text-[11px] text-[#4f4230] leading-relaxed">
                            Atenta a: {enc.pragasComuns?.join(", ") || "Lagartas e pulgões"}. Pulverizar calda de fumo ou óleo de neem preventivo.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Almanac Tip Box */}
                    {includeAlmanacTip && enc.dicaAlmanaque && (
                      <div
                        className={`p-3 rounded-2xl text-xs space-y-0.5 border ${
                          cardTheme === "eco"
                            ? "bg-white border-black"
                            : "bg-[#faf6ed] border-[#e5d8be]"
                        }`}
                      >
                        <span className="font-cinzel text-[10px] font-bold text-[#825316] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#b37c22]" />
                          Segredo do Almanaque Botânico:
                        </span>
                        <p className="text-xs font-narrative italic text-[#4a3f2d] leading-relaxed">
                          "{enc.dicaAlmanaque}"
                        </p>
                      </div>
                    )}

                    {/* Toxicity & Pet Safety */}
                    {includeToxicity && (
                      <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white/70 border border-[#ded4be]">
                        <div className="flex items-center gap-1.5 font-medium text-[#423727]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#285e2b]" />
                          <span>Segurança / Toxicidade:</span>
                        </div>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            enc.toxicidade.includes("Não Tóxica") || enc.toxicidade.includes("Comestível")
                              ? "bg-[#e2f0df] text-[#24521f]"
                              : "bg-[#fae6e3] text-[#8c2214]"
                          }`}
                        >
                          {enc.toxicidade}
                        </span>
                      </div>
                    )}

                    {/* Custom User Notes */}
                    {includeUserNotes && userPlant.anotacoes && (
                      <div className="p-2.5 rounded-xl bg-[#f2ebdc] border border-[#ded2bd] text-[11px] text-[#4f4230] space-y-0.5">
                        <span className="font-semibold text-[#302619] block">
                          📝 Notas do Jardineiro:
                        </span>
                        <p className="italic font-narrative">{userPlant.anotacoes}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-3 mt-4 border-t border-[#e2d8c3] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#786b57]">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel uppercase tracking-wider font-bold text-[#2d472c]">
                        Almanaque das Plantas
                      </span>
                      <span>•</span>
                      {includePlantAge && userPlant.dataPlantio && (
                        <span>
                          Plantada em: {userPlant.dataPlantio} ({daysSince} dias)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#3d6939]" />
                      <span>{userPlant.estadoSaude}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
