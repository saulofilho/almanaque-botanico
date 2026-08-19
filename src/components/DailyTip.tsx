import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  Calendar, 
  Moon, 
  Sprout, 
  Leaf, 
  Loader2,
  CheckCircle2,
  Lightbulb,
  HeartHandshake
} from "lucide-react";
import { PlantEntry } from "../types";
import { getAstronomicalMoonPhase, MONTHLY_CALENDAR } from "../data/lunarData";

const STORAGE_KEY_DAILY_TIP = "almanaque_botanico_gemini_daily_tip_v1";

export interface GeminiDailyTipData {
  titulo: string;
  plantaEmDestaque?: {
    nomePopular: string;
    nomeCientifico: string;
    categoria?: string;
  };
  conselhoPrincipal: string;
  curiosidadeBotanica: string;
  acaoDoDia: string;
  proverbioAlmanaque: string;
  virtudes?: string[];
}

interface DailyTipProps {
  plants: PlantEntry[];
  onSelectPlant?: (plant: PlantEntry) => void;
}

export const DailyTip: React.FC<DailyTipProps> = ({ plants, onSelectPlant }) => {
  const [dailyTip, setDailyTip] = useState<GeminiDailyTipData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  const todayDateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const currentMoon = getAstronomicalMoonPhase();
  const currentMonthIdx = new Date().getMonth();
  const currentMonth = MONTHLY_CALENDAR[currentMonthIdx];

  // Helper to construct a curated fallback tip if API is unreachable
  const getCuratedFallbackTip = (): GeminiDailyTipData => {
    const defaultPlant = plants[new Date().getDate() % (plants.length || 1)] || plants[0];
    return {
      titulo: `A Sabedoria das Plantas em ${currentMonth.mes}`,
      plantaEmDestaque: {
        nomePopular: defaultPlant?.nomePopular || "Alecrim",
        nomeCientifico: defaultPlant?.nomeCientifico || "Salvia rosmarinus",
        categoria: defaultPlant?.categoria || "Medicinal",
      },
      conselhoPrincipal: defaultPlant?.dicaAlmanaque || "Observe o ritmo das regas e sintonize seu cultivo com a luz solar da estação.",
      curiosidadeBotanica: `No mês de ${currentMonth.mes}, a transição sazonal estimula a circulação da seiva. As plantas aromáticas acumulam mais princípios ativos em suas folhas jovens.`,
      acaoDoDia: `Dedique 5 minutos para afofar a terra superficial dos vasos e conferir a umidade com a ponta dos dedos.`,
      proverbioAlmanaque: "Planta cuidada com atenção e afeto floresce até nos invernos mais rigorosos.",
      virtudes: defaultPlant?.beneficiosMedicinais || ["Vitalidade", "Aroma", "Equilíbrio"],
    };
  };

  const fetchAiDailyTip = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      const response = await fetch("/api/gemini/daily-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateString: new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          monthName: currentMonth.mes,
          seasonName: currentMonth.estacao,
          moonPhaseName: currentMoon.phaseName,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na resposta do servidor Gemini.");
      }

      const data: GeminiDailyTipData = await response.json();

      if (data && data.titulo) {
        // Save to localStorage for today
        try {
          localStorage.setItem(
            STORAGE_KEY_DAILY_TIP,
            JSON.stringify({
              date: todayDateStr,
              tip: data,
            })
          );
        } catch (e) {
          console.warn("Falha ao salvar dica diária no localStorage", e);
        }

        setDailyTip(data);
        setIsFromCache(false);
      } else {
        const fallback = getCuratedFallbackTip();
        setDailyTip(fallback);
      }
    } catch (err: any) {
      console.warn("Utilizando sabedoria sazonal do almanaque local:", err?.message || err);
      if (!dailyTip) {
        const fallback = getCuratedFallbackTip();
        setDailyTip(fallback);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load from localStorage on mount, or fetch if not present / old date
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DAILY_TIP);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayDateStr && parsed.tip && parsed.tip.titulo) {
          setDailyTip(parsed.tip);
          setIsFromCache(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Erro ao ler cache da dica do dia", e);
    }

    // If no valid cache for today, generate with Gemini API
    fetchAiDailyTip(false);
  }, []);

  const matchingCatalogPlant = dailyTip?.plantaEmDestaque
    ? plants.find(
        (p) =>
          p.nomePopular.toLowerCase().includes(dailyTip.plantaEmDestaque!.nomePopular.toLowerCase()) ||
          dailyTip.plantaEmDestaque!.nomePopular.toLowerCase().includes(p.nomePopular.toLowerCase())
      ) || plants[0]
    : plants[0];

  if (!dailyTip && isLoading) {
    return (
      <div className="rounded-3xl bg-[#f5eee0] border-2 border-[#d8cdb6] p-8 text-center space-y-3 shadow-md animate-pulse">
        <div className="w-10 h-10 rounded-full bg-[#284229] flex items-center justify-center text-[#9ed38f] mx-auto">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <h3 className="font-serif-botanic text-xl font-bold text-[#233322]">
          Consultando o Oráculo Botânico com Gemini IA...
        </h3>
        <p className="text-xs text-[#736650] font-narrative">
          Gerando a sabedoria sazonal e conselho de cultivo para o dia de hoje.
        </p>
      </div>
    );
  }

  const tip = dailyTip || getCuratedFallbackTip();

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#f6eee1] via-[#faf5ec] to-[#eee4d0] border-2 border-[#d8cdb6] p-5 sm:p-7 shadow-md overflow-hidden animate-fadeIn">
      {/* Botanical Decorative Watermark Icon */}
      <div className="absolute right-4 -bottom-6 text-[#243825]/5 pointer-events-none select-none">
        <Leaf className="w-56 h-56" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded2bd] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#284229] text-[#b8f0aa] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#443826]">
                  Dica do Dia & Sabedoria Sazonal IA
                </span>
                {isFromCache ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#dcecd8] text-[#245222] border border-[#b2d9ab] hidden sm:inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Salva para hoje
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#e8deca] text-[#544833] border border-[#d6c7af] hidden sm:inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#396336]" />
                    Gerada com Gemini
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#786b53] font-narrative">
                Almanaque Botânico • {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAiDailyTip(true)}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl bg-[#e8dfcb] hover:bg-[#dcd0b8] disabled:opacity-50 text-xs font-semibold text-[#483d2a] border border-[#d2c5ab] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Gerar nova reflexão com Gemini IA"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3b6338]" />
                  <span>Consultando IA...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#3b6338]" />
                  <span>Gerar Nova Dica IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Title, Main Advice & Curiosity */}
          <div className="lg:col-span-8 space-y-3">
            {/* Title & Plant Spotlight */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {tip.plantaEmDestaque && (
                  <>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#243825] text-[#d6f0cf] text-[11px] font-bold tracking-wider uppercase font-mono">
                      {tip.plantaEmDestaque.categoria || "Botânica"}
                    </span>
                    <span className="text-xs font-semibold text-[#30452d]">
                      {tip.plantaEmDestaque.nomePopular}{" "}
                      <span className="text-[#6e634e] italic font-narrative">
                        ({tip.plantaEmDestaque.nomeCientifico})
                      </span>
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1a2b1b] leading-snug">
                {tip.titulo}
              </h2>
            </div>

            {/* Main Advice Box */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] shadow-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-[#bf7b1b] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#3b3223] font-narrative leading-relaxed">
                  <strong>Conselho de Cultivo:</strong> {tip.conselhoPrincipal}
                </p>
              </div>

              {/* Curiosity / Botanical fact */}
              {tip.curiosidadeBotanica && (
                <div className="pt-2 border-t border-[#ede5d5] text-xs text-[#524632] flex items-start gap-2">
                  <span className="text-sm">🌱</span>
                  <p className="font-narrative leading-relaxed">
                    <strong>Curiosidade do Reino Vegetal:</strong> {tip.curiosidadeBotanica}
                  </p>
                </div>
              )}
            </div>

            {/* Virtues or tags */}
            {tip.virtudes && tip.virtudes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#524632]">
                <span className="text-[11px] font-semibold text-[#665741]">Virtudes da Sabedoria:</span>
                {tip.virtudes.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#eee7d8] text-[11px] text-[#423725] font-medium border border-[#ded4bf]">
                    🌿 {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Today's Action & Season / Lunar Context */}
          <div className="lg:col-span-4 space-y-3">
            {/* Today's Practical Action */}
            <div className="p-4 rounded-2xl bg-[#f0ebd9] border-2 border-[#d9ceb9] space-y-2 text-xs">
              <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-[#355931] flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#3b6b37]" />
                Ação do Dia no Jardim
              </span>
              <p className="text-xs text-[#423625] font-narrative leading-relaxed">
                {tip.acaoDoDia}
              </p>
            </div>

            {/* Seasonal & Lunar Context Card */}
            <div className="p-4 rounded-2xl bg-[#ede5d5] border border-[#dbceb7] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#382e1e]">
                <span className="font-bold font-cinzel uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#3b6338]" />
                  {currentMonth.mes} ({currentMonth.estacao})
                </span>
                <span className="font-mono text-[11px] text-[#4f6b4a] flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  {currentMoon.phaseName}
                </span>
              </div>

              {/* Traditional Proverb */}
              <p className="text-[11px] text-[#544835] font-serif-botanic italic border-t border-[#dfd2be] pt-2 leading-relaxed">
                "{tip.proverbioAlmanaque}"
              </p>

              {onSelectPlant && matchingCatalogPlant && (
                <button
                  onClick={() => onSelectPlant(matchingCatalogPlant)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f5ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Consultar Espécie no Herbário</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
