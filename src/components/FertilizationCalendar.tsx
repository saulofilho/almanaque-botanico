import React, { useState, useMemo } from "react";
import {
  Calendar,
  Sparkles,
  Leaf,
  Sun,
  CloudRain,
  Wind,
  Snowflake,
  Check,
  AlertCircle,
  HelpCircle,
  FlaskConical,
  Sprout,
  CheckCircle2,
  Clock,
  Droplets
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry } from "../types";

interface FertilizationCalendarProps {
  garden: UserPlant[];
  allSpecies: PlantEntry[];
  onUpdateFertilizationDate?: (plantId: string, dateIso: string) => void;
}

// Current Season Calculation (Southern Hemisphere / Brazil)
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Primavera: 22 Set a 21 Dez
  // Verão: 21 Dez a 20 Mar
  // Outono: 20 Mar a 21 Jun
  // Inverno: 21 Jun a 22 Set
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) {
    return {
      nome: "Primavera",
      icone: Sprout,
      meses: "Setembro a Dezembro",
      clima: "Brotamento intenso, floração e retomada do metabolismo vegetal.",
      focoNutricional: "Alta demanda de Nitrogênio (N) para folhas novas e Fósforo (P) para raízes e floração.",
      frequenciaGeral: "A cada 15 a 30 dias",
      aduboRecomendado: "Húmus de minhoca, biofertilizante de folhas verdes e bokashi.",
    };
  } else if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 20)) {
    return {
      nome: "Verão",
      icone: Sun,
      meses: "Dezembro a Março",
      clima: "Calor intenso, crescimento rápido, alta evapotranspiração e maturação.",
      focoNutricional: "Potássio (K) para tolerância térmica e firmeza celular; matéria orgânica para retenção de umidade.",
      frequenciaGeral: "A cada 20 a 30 dias (nas horas frescas da manhã)",
      aduboRecomendado: "Biofertilizante de casca de banana (K), cobertura morta orgânica e chorume bem diluído (1:10).",
    };
  } else if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return {
      nome: "Outono",
      icone: Wind,
      meses: "Março a Junho",
      clima: "Temperaturas amenas, redução fotoperiódica e fortalecimento de caules.",
      focoNutricional: "Fósforo e Cálcio para lignificação de ramos e fortalecimento do sistema radicular antes do frio.",
      frequenciaGeral: "A cada 45 dias (reduzir adubação nitrogenada)",
      aduboRecomendado: "Farinha de ossos, casca de ovo calcinada moída e composto orgânico maduro.",
    };
  } else {
    return {
      nome: "Inverno",
      icone: Snowflake,
      meses: "Junho a Setembro",
      clima: "Dormência / repouso vegetativo, metabolismo lento da seiva.",
      focoNutricional: "Proteger os microrganismos do solo. Suspender adubos solúveis de rápida liberação.",
      frequenciaGeral: "A cada 60 a 90 dias (ou suspender para suculentas)",
      aduboRecomendado: "Cobertura morta (mulching com palha/folhas secas) e esterco bem curtido na borda dos vasos.",
    };
  }
};

const SEASONS_DATA = [
  {
    nome: "Primavera",
    icone: Sprout,
    meses: "Set - Dez",
    foco: "Nitrogênio & Fósforo (Brotamento e Floração)",
    dica: "Época de ouro para renovar os substratos e aplicar bokashi ou húmus de minhoca.",
  },
  {
    nome: "Verão",
    icone: Sun,
    meses: "Dez - Mar",
    foco: "Potássio & Retenção Hídrica (Vigor e Frutos)",
    dica: "Adube somente no início da manhã ou entardecer. Use casca de banana fermentada.",
  },
  {
    nome: "Outono",
    icone: Wind,
    meses: "Mar - Jun",
    foco: "Cálcio & Enraizamento (Fortalecimento celular)",
    dica: "Reduza o nitrogênio. Aplique farinha de casca de ovo para preparar a planta para o frio.",
  },
  {
    nome: "Inverno",
    icone: Snowflake,
    meses: "Jun - Set",
    foco: "Cobertura Morta & Proteção do Solo (Repouso)",
    dica: "Suspenda adubação foliar. Proteja o solo com palhada seca contra o ressecamento do vento.",
  },
];

export const FertilizationCalendar: React.FC<FertilizationCalendarProps> = ({
  garden,
  allSpecies,
  onUpdateFertilizationDate,
}) => {
  const currentSeason = useMemo(() => getCurrentSeason(), []);
  const [selectedSeasonTab, setSelectedSeasonTab] = useState<string>("atual");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Todas");
  const [showRecipesModal, setShowRecipesModal] = useState<boolean>(false);

  // Derive nutritional recommendation per plant in the user's garden
  const plantNutritionList = useMemo(() => {
    return garden.map((plant) => {
      const spec = plant.especieId ? allSpecies.find((s) => s.id === plant.especieId) : null;
      const categoria = spec?.categoria || "Horta & Ervas";

      // Recommended interval in days
      let frequenciaDias = 30;
      let aduboPrincipal = "Composto Orgânico + Húmus de Minhoca";
      let modoAplicacao = "Incorporar 2 colheres rasas na camada superficial do solo a cada 30 dias.";
      let nutrienteChave = "N-P-K Equilibrado (Matéria Orgânica Viva)";
      let doseRecomendada = "1 a 2 colheres de sopa por vaso médio (5L)";

      if (categoria === "Horta & Ervas") {
        frequenciaDias = currentSeason.nome === "Primavera" || currentSeason.nome === "Verão" ? 20 : 40;
        aduboPrincipal = "Húmus de Minhoca + Biofertilizante Líquido (10%)";
        modoAplicacao = "Rega quinzenal com biofertilizante ou adubação de superfície mensal.";
        nutrienteChave = "Nitrogênio orgânico & Matéria Fúlvica";
        doseRecomendada = "50ml de calda diluída por vaso na rega";
      } else if (categoria === "Medicinal") {
        frequenciaDias = 30;
        aduboPrincipal = "Esterco de Aves curtido + Cinzas Vegetais + Casca de Ovo";
        modoAplicacao = "Polvilhar cinzas de lenha (1 colher de chá) e composto ao redor da planta.";
        nutrienteChave = "Potássio, Fósforo e Minerais Traço (sem excesso de sais)";
        doseRecomendada = "1 colher de sopa de composto + 1 pitada de cinzas";
      } else if (categoria === "Suculentas") {
        frequenciaDias = currentSeason.nome === "Inverno" ? 90 : 60;
        aduboPrincipal = "Farinha de Casca de Ovo Calcinada + Farinha de Ossos";
        modoAplicacao = "Adubação esparsa a cada 2 meses na primavera/verão. Suspender no inverno.";
        nutrienteChave = "Cálcio & Fósforo (Evitar excesso de nitrogênio)";
        doseRecomendada = "1 colher de café na borda do vaso";
      } else if (categoria === "Ornamental") {
        frequenciaDias = 45;
        aduboPrincipal = "Bokashi Orgânico + Extrato de Algas / Torta de Mamona";
        modoAplicacao = "Espalhar bokashi na borda do vaso e regar em seguida para ativar leveduras.";
        nutrienteChave = "Micronutrientes quelatizados & Magnésio";
        doseRecomendada = "1 colher de sopa de bokashi a cada 45 dias";
      } else if (categoria === "Árvores Nativas") {
        frequenciaDias = 90;
        aduboPrincipal = "Esterco Bovino Curtido + Cobertura Morta Espessa";
        modoAplicacao = "Adubação em coroa na projeção da copa, coberta por 5cm de folhas secas.";
        nutrienteChave = "Matéria Orgânica Estrutural & Humina";
        doseRecomendada = "500g a 1kg por muda na projeção dos galhos";
      }

      // Calculate days since last fertilization
      const lastFertilized = plant.ultimaAdubacao ? new Date(plant.ultimaAdubacao) : new Date(plant.dataPlantio);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastFertilized.setHours(0, 0, 0, 0);
      const diffDays = Math.max(0, Math.floor((today.getTime() - lastFertilized.getTime()) / (1000 * 60 * 60 * 24)));
      const daysRemaining = frequenciaDias - diffDays;
      const isDue = daysRemaining <= 0;

      return {
        plant,
        spec,
        categoria,
        frequenciaDias,
        aduboPrincipal,
        modoAplicacao,
        nutrienteChave,
        doseRecomendada,
        lastFertilizedStr: lastFertilized.toLocaleDateString("pt-BR"),
        diffDays,
        daysRemaining,
        isDue,
      };
    });
  }, [garden, allSpecies, currentSeason]);

  const filteredNutritionList = useMemo(() => {
    return plantNutritionList.filter((item) => {
      if (selectedCategoryFilter === "Todas") return true;
      return item.categoria === selectedCategoryFilter;
    });
  }, [plantNutritionList, selectedCategoryFilter]);

  const dueFertilizationCount = plantNutritionList.filter((p) => p.isDue).length;

  const handleMarkFertilized = (plantId: string) => {
    const todayIso = new Date().toISOString().split("T")[0];
    if (onUpdateFertilizationDate) {
      onUpdateFertilizationDate(plantId, todayIso);
    }
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.75 },
      colors: ["#795548", "#8d6e63", "#a4d495", "#81c784"],
    });
  };

  const SeasonIcon = currentSeason.icone;

  return (
    <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-5 sm:p-8 shadow-xs space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ded5c2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#284229] text-[#a4d495]">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
              Calendário de Adubação Sazonal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#665a45] font-narrative">
            Cronograma ecológico de reposição de nutrientes do solo adaptado às estações do ano e às exigências de cada espécie.
          </p>
        </div>

        {/* Action Button: Organic Fertilizers Recipes */}
        <button
          onClick={() => setShowRecipesModal((prev) => !prev)}
          className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1c301d] text-[#f7f5ee] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <FlaskConical className="w-3.5 h-3.5 text-[#a4d495]" />
          <span>{showRecipesModal ? "Ocultar Fórmulas" : "Receitas de Adubos Caseiros"}</span>
        </button>
      </div>

      {/* Current Season Botanical Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#293d2b] to-[#1a281c] text-[#f4efe4] border border-[#3e5e3f] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1d2d1f] text-[#a4d495] border border-[#3c5c3e]">
              <SeasonIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-cinzel font-bold tracking-widest text-[#a8dca2] block">
                Estação Atual no Hemisfério Sul
              </span>
              <h3 className="font-serif-botanic text-2xl font-bold text-[#f7f5ee]">
                {currentSeason.nome} ({currentSeason.meses})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#1b2b1d] border border-[#3d5f3f] text-xs text-[#cceec4] font-medium">
              Ciclo: {currentSeason.frequenciaGeral}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#3b573d] text-xs text-[#dcd2c1]">
          <div className="space-y-1">
            <span className="font-semibold text-[#a4d495] block">Dinâmica da Seiva & Clima:</span>
            <p className="font-narrative leading-relaxed">{currentSeason.clima}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-[#a4d495] block">Diretriz Nutricional Recomendada:</span>
            <p className="font-narrative leading-relaxed">{currentSeason.focoNutricional}</p>
          </div>
        </div>
      </div>

      {/* 4 Seasons Overview Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold font-cinzel uppercase tracking-wider text-[#544834] block">
          Visão Geral do Ciclo dos 4 Períodos Sazonais
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SEASONS_DATA.map((s) => {
            const IconC = s.icone;
            const isCurrent = s.nome === currentSeason.nome;
            return (
              <div
                key={s.nome}
                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  isCurrent
                    ? "bg-[#faf7f2] border-[#2e5429] ring-2 ring-[#2e5429]/20 shadow-xs"
                    : "bg-[#faf7f2] border-[#ded5c2]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#1f2d1e]">
                    <IconC className="w-3.5 h-3.5 text-[#3b6637]" />
                    <span>{s.nome}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#786b55]">{s.meses}</span>
                </div>
                <p className="text-[11px] font-semibold text-[#3b6637]">{s.foco}</p>
                <p className="text-[11px] text-[#635540] font-narrative leading-snug">{s.dica}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organic Fertilizers Recipes Drawer / Box */}
      {showRecipesModal && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#faf7f2] border-2 border-[#3c633a]/40 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#284e24] flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Preparo de Adubos e Biofertilizantes Caseiros
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5">
              <h4 className="font-bold text-[#20311f] flex items-center gap-1.5">
                🍌 Calda de Banana (Potássio Puro)
              </h4>
              <p className="text-[#594e3c] font-narrative leading-relaxed">
                Ferva 3 cascas de banana picadas em 1L de água por 5 minutos. Deixe esfriar, coe e dilua em mais 1L de água. Regue as plantas a cada 15 dias para estimular floração e raízes vigorosas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5">
              <h4 className="font-bold text-[#20311f] flex items-center gap-1.5">
                🥚 Farinha de Casca de Ovo (Cálcio)
              </h4>
              <p className="text-[#594e3c] font-narrative leading-relaxed">
                Lave e seque as cascas de ovo ao sol. Toste levemente na frigideira e triture no liquidificador até virar pó fino. Adicione 1 colher de chá no substrato para fortalecer as paredes celulares.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5">
              <h4 className="font-bold text-[#20311f] flex items-center gap-1.5">
                🪵 Calda de Cinzas de Madeira (Minerais)
              </h4>
              <p className="text-[#594e3c] font-narrative leading-relaxed">
                Misture 1 colher de sopa de cinzas de lenha pura (sem sal/gordura) em 1L de água. Deixe descansar 24h. Aplique no solo para equilibrar a acidez e fornecer potássio e micronutrientes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Garden Plants Specific Fertilizer Schedule */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
              Cronograma Individual das Suas Plantas ({garden.length})
            </h3>
            <p className="text-xs text-[#6e624e] font-narrative">
              Recomendações e status de reposição mineral para cada vaso do seu herbanário.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-[#ede4d2] p-1 rounded-2xl border border-[#d6ccb8]">
            {["Todas", "Horta & Ervas", "Medicinal", "Ornamental", "Suculentas"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? "bg-[#284229] text-[#f7f5ee] shadow-xs"
                    : "text-[#544833] hover:bg-[#ded4bf]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Plants Nutrient Schedule Grid */}
        {filteredNutritionList.length === 0 ? (
          <div className="text-center py-8 bg-[#faf7f2] rounded-2xl border border-[#ded5c2] p-6 text-xs text-[#665943]">
            Nenhuma planta cadastrada nessa categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNutritionList.map((item) => {
              const {
                plant,
                categoria,
                frequenciaDias,
                aduboPrincipal,
                modoAplicacao,
                nutrienteChave,
                doseRecomendada,
                lastFertilizedStr,
                diffDays,
                daysRemaining,
                isDue,
              } = item;

              return (
                <div
                  key={plant.id}
                  className={`bg-[#faf7f2] rounded-2xl border p-5 transition-all space-y-3 flex flex-col justify-between ${
                    isDue
                      ? "border-[#c7772c] ring-2 ring-[#c7772c]/20 shadow-xs"
                      : "border-[#ded5c2] shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={plant.imagemUrl}
                          alt={plant.nomePersonalizado}
                          className="w-12 h-12 rounded-xl object-cover border border-[#d6ccb8] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono bg-[#284229] text-[#ccebc5]">
                            {categoria}
                          </span>
                          <h4 className="font-serif-botanic text-lg font-bold text-[#1a2b1b] leading-tight mt-0.5">
                            {plant.nomePersonalizado}
                          </h4>
                          {plant.nomeCientifico && (
                            <p className="text-[11px] text-[#695d49] italic font-narrative">
                              {plant.nomeCientifico}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDue
                            ? "bg-[#fbece0] text-[#9c5211] border border-[#f0c29e]"
                            : "bg-[#edf6eb] text-[#2c6128] border border-[#c4e3be]"
                        }`}
                      >
                        {isDue ? "⚠️ Adubação Recomendada" : `Em ${daysRemaining} dia(s)`}
                      </span>
                    </div>

                    {/* Nutrition Prescription Details */}
                    <div className="p-3 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5 text-xs text-[#453927]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#233522] flex items-center gap-1">
                          <Sprout className="w-3.5 h-3.5 text-[#3b6637]" />
                          {aduboPrincipal}
                        </span>
                        <span className="text-[10px] font-mono text-[#6e604d]">
                          A cada {frequenciaDias} dias
                        </span>
                      </div>
                      <p className="text-[#594d3a] font-narrative leading-snug">
                        <strong>Modo de Aplicação:</strong> {modoAplicacao}
                      </p>
                      <p className="text-[11px] text-[#635541]">
                        <strong>Dose:</strong> {doseRecomendada} • <strong>Foco:</strong> {nutrienteChave}
                      </p>
                    </div>

                    {/* Historic Tracking Info */}
                    <div className="flex items-center justify-between text-[11px] text-[#706450] font-mono">
                      <span>Última adubação: {lastFertilizedStr}</span>
                      <span>(há {diffDays} dias)</span>
                    </div>
                  </div>

                  {/* Mark Fertilized Action Button */}
                  <div className="pt-2 border-t border-[#ebe3d2]">
                    <button
                      onClick={() => handleMarkFertilized(plant.id)}
                      className="w-full py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f5ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#a4d495]" />
                      <span>Registrar Adubação Feita Hoje</span>
                    </button>
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
