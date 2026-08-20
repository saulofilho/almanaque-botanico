import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  CloudRain,
  Compass,
  ArrowRight,
  Info,
  Calendar,
  Heart,
  RefreshCw
} from "lucide-react";
import { PlantEntry, UserPlant } from "../types";
import { WeatherData, fetchLocalWeather, POPULAR_CITIES } from "../utils/weatherService";

const STORAGE_KEY_WEATHER_CITY = "almanaque_botanico_weather_city_v1";

export interface AdaptiveTip {
  id: string;
  title: string;
  category: "Luminosidade" | "Rega & Hidratação" | "Proteção Térmica" | "Nutrição & Solo" | "Sanidade & Poda";
  urgency: "alta" | "media" | "preventiva";
  iconName: "sun" | "droplets" | "wind" | "thermometer" | "shield" | "flame" | "rain";
  action: string;
  scientificReason: string;
  applied?: boolean;
}

interface AdaptiveCareTipsProps {
  plant: PlantEntry;
  userPlant?: UserPlant | null;
  weather?: WeatherData | null;
  onWaterPlant?: (plantId: string) => void;
  onUpdatePlantHealth?: (plantId: string, health: UserPlant["estadoSaude"]) => void;
}

export const AdaptiveCareTips: React.FC<AdaptiveCareTipsProps> = ({
  plant,
  userPlant,
  weather: initialWeather,
  onWaterPlant,
  onUpdatePlantHealth,
}) => {
  const [localWeather, setLocalWeather] = useState<WeatherData | null>(initialWeather || null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(!initialWeather);
  const [selectedHealth, setSelectedHealth] = useState<UserPlant["estadoSaude"]>(
    userPlant?.estadoSaude || "Vigorosa"
  );
  const [completedTips, setCompletedTips] = useState<Record<string, boolean>>({});
  const [activeWeatherSim, setActiveWeatherSim] = useState<"real" | "calor" | "chuva" | "frio" | "seco">("real");

  // Keep selectedHealth in sync if userPlant prop changes
  useEffect(() => {
    if (userPlant?.estadoSaude) {
      setSelectedHealth(userPlant.estadoSaude);
    }
  }, [userPlant?.estadoSaude]);

  // Load weather if not provided
  useEffect(() => {
    if (initialWeather) {
      setLocalWeather(initialWeather);
      setIsLoadingWeather(false);
      return;
    }

    let isMounted = true;
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        let city = POPULAR_CITIES[0];
        const saved = localStorage.getItem(STORAGE_KEY_WEATHER_CITY);
        if (saved) {
          try {
            city = JSON.parse(saved);
          } catch {}
        }
        const data = await fetchLocalWeather(city.lat, city.lon, city.name, city.region, city.country);
        if (isMounted) {
          setLocalWeather(data);
        }
      } catch (e) {
        console.warn("Não foi possível carregar clima local para dicas adaptativas:", e);
      } finally {
        if (isMounted) setIsLoadingWeather(false);
      }
    };

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [initialWeather]);

  // Computed or simulated weather values
  const effectiveWeather = useMemo(() => {
    const base = localWeather || {
      city: "São Paulo",
      region: "SP",
      country: "Brasil",
      currentTemp: 24,
      todayMax: 27,
      todayMin: 18,
      humidity: 60,
      uvIndex: 6,
      precipitationProb: 20,
      windSpeed: 12,
      weatherDescription: "Tempo Estável",
      weatherIcon: "🌤️",
    };

    if (activeWeatherSim === "calor") {
      return {
        ...base,
        currentTemp: 33,
        todayMax: 35,
        todayMin: 23,
        humidity: 35,
        uvIndex: 10,
        precipitationProb: 10,
        weatherDescription: "Onda de Calor Intenso",
        weatherIcon: "🔥",
      };
    } else if (activeWeatherSim === "chuva") {
      return {
        ...base,
        currentTemp: 19,
        todayMax: 21,
        todayMin: 16,
        humidity: 88,
        uvIndex: 2,
        precipitationProb: 90,
        weatherDescription: "Chuva Contínua & Alta Umidade",
        weatherIcon: "🌧️",
      };
    } else if (activeWeatherSim === "frio") {
      return {
        ...base,
        currentTemp: 9,
        todayMax: 14,
        todayMin: 3,
        humidity: 75,
        uvIndex: 3,
        precipitationProb: 15,
        weatherDescription: "Frente Fria com Risco Noturno",
        weatherIcon: "❄️",
      };
    } else if (activeWeatherSim === "seco") {
      return {
        ...base,
        currentTemp: 29,
        todayMax: 30,
        todayMin: 17,
        humidity: 22,
        uvIndex: 8,
        precipitationProb: 0,
        weatherDescription: "Ar Muito Seco & Vento",
        weatherIcon: "💨",
      };
    }

    return base;
  }, [localWeather, activeWeatherSim]);

  // Adaptive Tips Generation Engine
  const generatedTips = useMemo(() => {
    const tips: AdaptiveTip[] = [];
    const pName = plant.nomePopular.toLowerCase();
    const isSucculent = plant.categoria === "Suculentas" || pName.includes("aloe") || pName.includes("suculenta") || pName.includes("cacto");
    const isHerb = plant.categoria === "Horta & Ervas" || plant.categoria === "Medicinal";
    const prefersShade = plant.luminosidade.includes("Sombra") || plant.luminosidade.includes("Meia-Sombra");
    const prefersFullSun = plant.luminosidade.includes("Sol Pleno");

    const tempMax = effectiveWeather.todayMax;
    const tempMin = effectiveWeather.todayMin;
    const humidity = effectiveWeather.humidity;
    const uv = effectiveWeather.uvIndex;
    const rainProb = effectiveWeather.precipitationProb;

    // 1. SOLAR & LUMINOSITY ADAPTATION
    if ((uv >= 7 || tempMax >= 30) && prefersShade) {
      tips.push({
        id: "shade-extra-heat",
        title: "Sombra extra e proteção solar hoje",
        category: "Luminosidade",
        urgency: "alta",
        iconName: "sun",
        action: "Mova o vaso para debaixo de um beiral, pergolado ou posicione-o sob luz filtrada entre as 10h e 15h.",
        scientificReason: `${plant.nomePopular} tem folhas tenras de meia-sombra. O índice UV de ${uv} e máxima de ${tempMax}°C podem causar fotooxidação e escaldadura celular irreversível no limbo foliar.`,
      });
    } else if (uv >= 9 && selectedHealth === "Em Recuperação") {
      tips.push({
        id: "recovery-shade",
        title: "Luz suave filtrada para recuperação",
        category: "Luminosidade",
        urgency: "alta",
        iconName: "sun",
        action: "Evite qualquer exposição solar direta no meio do dia; mantenha em claridade indireta.",
        scientificReason: "Plantas em recuperação estressam suas rotas de reparo celular se forem forçadas a fotossintetizar sob radiação máxima.",
      });
    } else if (rainProb >= 70 && prefersFullSun) {
      tips.push({
        id: "sun-rainy-light",
        title: "Aproveitamento máximo de luz difusa",
        category: "Luminosidade",
        urgency: "preventiva",
        iconName: "sun",
        action: "Aproxime o vaso da borda externa da varanda ou janela mais iluminada para absorver claridade entre as chuvas.",
        scientificReason: "Espécies de sol pleno reduzem a imunidade natural quando passam múltiplos dias consecutivos sob baixa taxa de fotossíntese.",
      });
    }

    // 2. WATERING & HYDRATION MICRO-SCHEDULE
    if (tempMax >= 28 && !isSucculent) {
      tips.push({
        id: "watering-morning",
        title: "Rega leve pela manhã (antes das 8h)",
        category: "Rega & Hidratação",
        urgency: "alta",
        iconName: "droplets",
        action: "Umedeça o substrato logo nas primeiras horas do dia, aplicando a água diretamente na terra.",
        scientificReason: `Com máxima de ${tempMax}°C, a água aplicada ao amanhecer hidrata as raízes antes do estresse térmico, sem que a água do vaso cozinhe ou evapore instantaneamente.`,
      });
    } else if (humidity < 30 && tempMax > 24) {
      tips.push({
        id: "dry-air-misting",
        title: "Nebulização ambiental periférica",
        category: "Rega & Hidratação",
        urgency: "media",
        iconName: "wind",
        action: "Borrife água ao redor dos vasos e no piso próximo (evite borrifar as folhas se houver sol incidindo).",
        scientificReason: `A umidade relativa em ${humidity}% acelera a perda de água por transpiração estomática, induzindo o enrolamento foliar defensivo.`,
      });
    } else if (rainProb >= 75 || humidity >= 85) {
      tips.push({
        id: "avoid-wet-leaves",
        title: "Evitar molhar a folhagem & suspender rega",
        category: "Rega & Hidratação",
        urgency: "media",
        iconName: "rain",
        action: "Não regue hoje caso a terra ainda esteja fresca. Se chover, proteja os vasos de respingos contínuos.",
        scientificReason: `Com umidade em ${humidity}%, gotas paradas sobre as folhas criam o microclima ideal para germinação de esporos de fungos como oídio e ferrugem.`,
      });
    } else if (isSucculent && rainProb >= 50) {
      tips.push({
        id: "succulent-rain-guard",
        title: "Proteger raízes de encharcamento",
        category: "Rega & Hidratação",
        urgency: "alta",
        iconName: "rain",
        action: "Verifique se o prato do vaso não tem água estagnada e mantenha o solo seco.",
        scientificReason: "Suculentas e ervas mediterrâneas sofrem asfixia radicular rápida em substrato saturado por mais de 24 horas.",
      });
    }

    // 3. THERMAL PROTECTION (Cold & Frost / Extreme Heat)
    if (tempMin <= 6) {
      tips.push({
        id: "cold-frost-guard",
        title: "Abrigo térmico noturno obrigatório",
        category: "Proteção Térmica",
        urgency: "alta",
        iconName: "thermometer",
        action: "Recolha o vaso para dentro de casa ou cubra a base do canteiro com tecido de algodão ou TNT antes do anoitecer.",
        scientificReason: `A temperatura mínima prevista de ${tempMin}°C pode congelar o orvalho na epiderme vegetal e congelar a seiva nos vasos condutores.`,
      });
    } else if (tempMax >= 32) {
      tips.push({
        id: "mulching-heat",
        title: "Aplicar cobertura morta no substrato",
        category: "Proteção Térmica",
        urgency: "media",
        iconName: "flame",
        action: "Adicione uma camada de 2 cm de folhas secas, casca de pinus triturada ou serragem sobre a terra do vaso.",
        scientificReason: "O 'mulching' reduz a temperatura da zona radicular em até 4°C e retém a umidade necessária para a planta não abortar brotos.",
      });
    }

    // 4. PLANT HEALTH STATE CONTINGENCIES
    if (selectedHealth === "Necessita Atenção" || selectedHealth === "Em Recuperação") {
      tips.push({
        id: "health-adjuvant-pause",
        title: "Pausa em adubações concentradas",
        category: "Nutrição & Solo",
        urgency: "alta",
        iconName: "shield",
        action: "Não aplique NPK mineral ou adubos fortes hoje. Utilize apenas rega com água desclorada ou biofertilizante ultradiluído.",
        scientificReason: "Raízes debilitadas têm baixa capacidade de troca catiônica e podem sofrer queimadura salina severa com adubações convencionais.",
      });

      tips.push({
        id: "health-sanitary-prune",
        title: "Poda de limpeza & alívio energético",
        category: "Sanidade & Poda",
        urgency: "media",
        iconName: "shield",
        action: "Corte com tesoura esterilizada apenas folhas totalmente amareladas ou secas na base do pecíolo.",
        scientificReason: "Eliminar partes mortas cessa a drenagem inútil de reservas e reduz vetores para patógenos oportunistas.",
      });
    } else if (selectedHealth === "Vigorosa" && isHerb && tempMax <= 29 && uv <= 7) {
      tips.push({
        id: "harvest-morning-prime",
        title: "Momento ótimo para colheita foliar",
        category: "Sanidade & Poda",
        urgency: "preventiva",
        iconName: "sun",
        action: "Se desejar colher para chás ou tempero, faça-o pela manhã assim que o orvalho secar.",
        scientificReason: "Com a planta em estado vigoroso e temperatura amena, a concentração de óleos essenciais e princípios ativos voláteis nas folhas atinge o ápice matinal.",
      });
    }

    // 5. PEST & AERATION PREVENTION
    if (humidity >= 80 && tempMax >= 26) {
      tips.push({
        id: "aeration-pests",
        title: "Espaçamento & circulação de ar",
        category: "Sanidade & Poda",
        urgency: "preventiva",
        iconName: "wind",
        action: "Afaste este vaso de outras plantas vizinhas em pelo menos 15 cm para permitir a passagem da brisa.",
        scientificReason: "O microclima abafado e quente entre folhagens densas é o principal gatilho para infestação de cochonilhas de carapaça e fungos.",
      });
    }

    // Always ensure at least 2 clear tailored tips even in mild neutral weather
    if (tips.length < 2) {
      tips.push({
        id: "steady-aeration",
        title: "Inspeção do substrato e aeração",
        category: "Nutrição & Solo",
        urgency: "preventiva",
        iconName: "shield",
        action: "Afofe delicadamente a camada superficial da terra com um palito ou garfo de jardim sem machucar as raízes.",
        scientificReason: "A terra oxigenada estimula a microbiota benéfica do solo e favorece a absorção hídrica equilibrada.",
      });
    }

    return tips;
  }, [plant, selectedHealth, effectiveWeather]);

  const toggleTipCompleted = (tipId: string) => {
    setCompletedTips((prev) => ({
      ...prev,
      [tipId]: !prev[tipId],
    }));
  };

  const handleApplyHealthChange = (newHealth: UserPlant["estadoSaude"]) => {
    setSelectedHealth(newHealth);
    if (userPlant && onUpdatePlantHealth) {
      onUpdatePlantHealth(userPlant.id, newHealth);
    }
  };

  const completedCount = generatedTips.filter((t) => completedTips[t.id]).length;
  const progressPercent = Math.round((completedCount / (generatedTips.length || 1)) * 100);

  const getUrgencyBadge = (urgency: AdaptiveTip["urgency"]) => {
    switch (urgency) {
      case "alta":
        return {
          label: "Ação Imediata",
          bg: "bg-[#fbeae6] text-[#a03623] border-[#f4c2b8]",
          icon: <Flame className="w-3 h-3 text-[#d14328]" />,
        };
      case "media":
        return {
          label: "Atenção Hoje",
          bg: "bg-[#fcf3dc] text-[#855716] border-[#f5de9f]",
          icon: <AlertTriangle className="w-3 h-3 text-[#c27d19]" />,
        };
      default:
        return {
          label: "Manejo Preventivo",
          bg: "bg-[#eaf4e5] text-[#2c6126] border-[#c4e4ba]",
          icon: <ShieldCheck className="w-3 h-3 text-[#3d8335]" />,
        };
    }
  };

  const renderTipIcon = (iconName: AdaptiveTip["iconName"]) => {
    switch (iconName) {
      case "sun":
        return <Sun className="w-4 h-4 text-[#cf801d]" />;
      case "droplets":
        return <Droplets className="w-4 h-4 text-[#2b7596]" />;
      case "wind":
        return <Wind className="w-4 h-4 text-[#5f7480]" />;
      case "thermometer":
        return <Thermometer className="w-4 h-4 text-[#8a3b8c]" />;
      case "flame":
        return <Flame className="w-4 h-4 text-[#d94827]" />;
      case "rain":
        return <CloudRain className="w-4 h-4 text-[#26698a]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#3e7839]" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#f8f5ee] border-2 border-[#ded5c2] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Botanical Ornament */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5dcce]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#284229] text-[#bde0b4]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#1f3020] uppercase tracking-wider">
              Dicas de Manejo Adaptativo
            </h3>
          </div>
          <p className="text-xs text-[#6e614d] font-narrative italic mt-0.5">
            Micro-ações personalizadas calibrando a vitalidade vegetal ao clima local de hoje.
          </p>
        </div>

        {/* Progress pill if tips completed */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eae3d2] text-[#4d4233] border border-[#d6cbba] flex items-center gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${completedCount > 0 ? "text-[#347831]" : "text-[#8c7e68]"}`} />
            <span>{completedCount} de {generatedTips.length} aplicadas</span>
          </div>
        </div>
      </div>

      {/* Synthesis Context Matrix (Health + Local Climate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Plant Health State Box */}
        <div className="p-3 rounded-xl bg-[#f0ebd9] border border-[#dcd1be] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#544837] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#8c3d31]" />
              Estado de Vitalidade
            </span>
            {userPlant ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#dfd6c2] text-[#3d3425] font-semibold">
                No Seu Jardim
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#dfd6c2] text-[#3d3425]">
                Modo Simulação
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["Vigorosa", "Estável", "Necessita Atenção", "Em Recuperação"] as const).map((health) => {
              const isActive = selectedHealth === health;
              let activeStyle = "bg-[#284229] text-[#f7f4ee] border-[#1d301e] shadow-2xs";
              if (health === "Necessita Atenção") activeStyle = "bg-[#a65626] text-[#ffffff] border-[#783c17]";
              if (health === "Em Recuperação") activeStyle = "bg-[#544b82] text-[#ffffff] border-[#3b3461]";

              return (
                <button
                  key={health}
                  onClick={() => handleApplyHealthChange(health)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? activeStyle
                      : "bg-[#faf6ee] text-[#594d3a] border-[#ded4bf] hover:bg-[#e7dfcb]"
                  }`}
                >
                  {health === "Vigorosa" && "🌿 "}
                  {health === "Estável" && "🌱 "}
                  {health === "Necessita Atenção" && "⚠️ "}
                  {health === "Em Recuperação" && "🩹 "}
                  {health}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Weather Synthesis Box */}
        <div className="p-3 rounded-xl bg-[#f0ebd9] border border-[#dcd1be] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#544837] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#30593b]" />
              Clima Local Detectado
            </span>
            <span className="text-[10px] text-[#6b5f4c] font-medium">
              📍 {effectiveWeather.city}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#faf6ee] p-2 rounded-lg border border-[#ded5c2] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">{effectiveWeather.weatherIcon}</span>
              <div>
                <span className="font-bold text-[#1f2d1e] block text-sm">
                  {effectiveWeather.currentTemp}°C
                  <span className="text-[11px] font-normal text-[#695d4b] ml-1">
                    (Min {effectiveWeather.todayMin}° / Max {effectiveWeather.todayMax}°)
                  </span>
                </span>
                <span className="text-[11px] text-[#695e4d] block">
                  {effectiveWeather.weatherDescription}
                </span>
              </div>
            </div>

            <div className="text-right space-y-0.5 font-mono text-[11px] text-[#4d4233]">
              <div>💧 {effectiveWeather.humidity}% umid.</div>
              <div>☀️ UV {effectiveWeather.uvIndex}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Climate Simulation Bar for testing different weather conditions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="text-[11px] font-semibold text-[#736550] mr-1">
          Testar cenários climáticos:
        </span>
        <button
          onClick={() => setActiveWeatherSim("real")}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            activeWeatherSim === "real"
              ? "bg-[#284229] text-[#f7f4ee] border-[#203621]"
              : "bg-[#ebe4d3] text-[#544734] border-[#d8cdb8] hover:bg-[#ded4bf]"
          }`}
        >
          📍 Clima Real
        </button>
        <button
          onClick={() => setActiveWeatherSim("calor")}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            activeWeatherSim === "calor"
              ? "bg-[#ba4c20] text-[#ffffff] border-[#913b18]"
              : "bg-[#ebe4d3] text-[#544734] border-[#d8cdb8] hover:bg-[#ded4bf]"
          }`}
        >
          🔥 Calor 35°C (UV 10)
        </button>
        <button
          onClick={() => setActiveWeatherSim("chuva")}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            activeWeatherSim === "chuva"
              ? "bg-[#2b688c] text-[#ffffff] border-[#1d4d69]"
              : "bg-[#ebe4d3] text-[#544734] border-[#d8cdb8] hover:bg-[#ded4bf]"
          }`}
        >
          🌧️ Chuva & Alta Umidade
        </button>
        <button
          onClick={() => setActiveWeatherSim("frio")}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            activeWeatherSim === "frio"
              ? "bg-[#3e5f7a] text-[#ffffff] border-[#2b4459]"
              : "bg-[#ebe4d3] text-[#544734] border-[#d8cdb8] hover:bg-[#ded4bf]"
          }`}
        >
          ❄️ Frio 3°C Noturno
        </button>
        <button
          onClick={() => setActiveWeatherSim("seco")}
          className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
            activeWeatherSim === "seco"
              ? "bg-[#7d6139] text-[#ffffff] border-[#5e492b]"
              : "bg-[#ebe4d3] text-[#544734] border-[#d8cdb8] hover:bg-[#ded4bf]"
          }`}
        >
          💨 Vento & Ar Seco 22%
        </button>
      </div>

      {/* List of Dynamic Adaptive Tips */}
      <div className="space-y-2.5 pt-1">
        {generatedTips.map((tip) => {
          const isDone = !!completedTips[tip.id];
          const badge = getUrgencyBadge(tip.urgency);

          return (
            <div
              key={tip.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isDone
                  ? "bg-[#f2efe6] border-[#cfc4b0] opacity-80"
                  : tip.urgency === "alta"
                  ? "bg-[#fffaf7] border-[#f0cfc7] shadow-2xs"
                  : "bg-[#faf6ee] border-[#ded5c2]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Action Completion Checkbox */}
                  <button
                    onClick={() => toggleTipCompleted(tip.id)}
                    className="mt-0.5 p-1 rounded-md hover:bg-[#eae1cd] text-[#386634] transition-colors cursor-pointer shrink-0"
                    title={isDone ? "Desmarcar ação" : "Marcar como realizada"}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#2e6e32]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#9e907a] hover:text-[#427a3c]" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1 rounded-md bg-[#eee7d8] border border-[#ddd3be]">
                        {renderTipIcon(tip.iconName)}
                      </span>
                      <h4 className={`text-sm font-bold ${isDone ? "line-through text-[#6e6350]" : "text-[#1f2e1f]"}`}>
                        {tip.title}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    {/* Action Guideline */}
                    <p className="text-xs font-semibold text-[#3b3225] font-narrative pt-0.5">
                      👉 <strong>Ação recomendada:</strong> {tip.action}
                    </p>

                    {/* Scientific Rationale */}
                    <div className="p-2.5 rounded-lg bg-[#f0ebd9] border border-[#e2d8c3] text-[11px] text-[#544937] leading-relaxed mt-1.5 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#5e7052] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#302619]">Fundamento Botânico:</strong> {tip.scientificReason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Bar for Garden plants */}
      {userPlant && onWaterPlant && (
        <div className="pt-2 border-t border-[#e5dcce] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#695d4a] font-narrative italic">
            Última rega registrada em {userPlant.ultimaRega || "não informada"}.
          </span>
          <button
            onClick={() => onWaterPlant(userPlant.id)}
            className="px-3 py-1.5 rounded-lg bg-[#2b7294] hover:bg-[#1e5873] text-[#ffffff] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Registrar Rega Hoje</span>
          </button>
        </div>
      )}
    </div>
  );
};
