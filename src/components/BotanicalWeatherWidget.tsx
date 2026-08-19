import React, { useState, useEffect } from "react";
import { 
  CloudSun, 
  ThermometerSnowflake, 
  Flame, 
  Droplets, 
  Wind, 
  Sun, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X,
  Compass,
  Sprout,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { UserPlant, PlantEntry } from "../types";
import { 
  WeatherData, 
  WeatherPlantAlert, 
  POPULAR_CITIES, 
  fetchLocalWeather, 
  analyzeGardenWeatherAlerts,
  searchCities
} from "../utils/weatherService";

const STORAGE_KEY_WEATHER_CITY = "almanaque_botanico_weather_city_v1";

interface BotanicalWeatherWidgetProps {
  garden: UserPlant[];
  allSpecies: PlantEntry[];
  onOpenGardenTab?: () => void;
}

export const BotanicalWeatherWidget: React.FC<BotanicalWeatherWidgetProps> = ({
  garden,
  allSpecies,
  onOpenGardenTab,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCitySearchOpen, setIsCitySearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeAlertModal, setActiveAlertModal] = useState<WeatherPlantAlert | null>(null);

  // Selected City Coordinates
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEATHER_CITY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_CITIES[0]; // Default to São Paulo
  });

  // Load weather when location changes
  const loadWeather = async (loc = selectedLocation) => {
    setLoading(true);
    try {
      const data = await fetchLocalWeather(loc.lat, loc.lon, loc.name, loc.region, loc.country);
      setWeather(data);
    } catch (err) {
      console.error("Erro ao carregar clima:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation]);

  // Try Auto Geolocation on mount if user hasn't explicitly saved a custom city
  useEffect(() => {
    const hasCustomCity = localStorage.getItem(STORAGE_KEY_WEATHER_CITY);
    if (!hasCustomCity && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const userLoc = {
            name: "Localização Atual",
            region: "",
            country: "Brasil",
            lat,
            lon,
          };
          setSelectedLocation(userLoc);
          try {
            localStorage.setItem(STORAGE_KEY_WEATHER_CITY, JSON.stringify(userLoc));
          } catch {}
        },
        () => {
          // If denied, fallback to default São Paulo
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Compute live garden alerts whenever weather or garden changes
  const alerts = weather
    ? analyzeGardenWeatherAlerts(
        garden,
        allSpecies,
        weather.currentTemp,
        weather.todayMax,
        weather.todayMin,
        weather.humidity,
        weather.uvIndex,
        weather.precipitationProb
      )
    : [];

  const frostAlert = alerts.find((a) => a.type === "frost");
  const heatAlert = alerts.find((a) => a.type === "heat");
  const primaryCriticalAlert = frostAlert || heatAlert || alerts[0];

  const handleSelectCity = (city: { name: string; region: string; country: string; lat: number; lon: number }) => {
    setSelectedLocation(city);
    try {
      localStorage.setItem(STORAGE_KEY_WEATHER_CITY, JSON.stringify(city));
    } catch {}
    setIsCitySearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchQueryChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      const results = await searchCities(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            name: "Meu Local (GPS)",
            region: "",
            country: "Brasil",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          handleSelectCity(userLoc);
        },
        () => {
          alert("Não foi possível acessar a localização GPS. Selecione uma cidade manualmente.");
        }
      );
    }
  };

  if (!weather && loading) {
    return (
      <div className="bg-[#f2ece0] border border-[#ded4bf] rounded-2xl p-3 px-4 flex items-center justify-between animate-pulse text-xs text-[#61533e]">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-[#8a7a60]" />
          <span>Consultando previsão meteorológica e riscos botânicos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-[#fbf9f5] border-[#ded4be] shadow-xs overflow-hidden transition-all">
      {/* Top Condensed Bar */}
      <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#fbf8f2] via-[#faf6ee] to-[#f4eee0]">
        {/* Left: Location & Current Weather */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          {/* City Selector Button */}
          <button
            onClick={() => setIsCitySearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ede5d4] hover:bg-[#ded4be] text-[#3e3423] font-semibold border border-[#d8cdb8] transition-all cursor-pointer shadow-2xs"
            title="Alterar cidade"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3b6338]" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate">{selectedLocation.name}</span>
            <ChevronDown className="w-3 h-3 text-[#706149]" />
          </button>

          {/* Current Temp and Icon */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl leading-none">{weather?.weatherIcon}</span>
            <span className="font-serif-botanic text-lg sm:text-xl font-bold text-[#1f2d1e]">
              {weather?.currentTemp}°C
            </span>
            <span className="text-xs text-[#6e604a] font-narrative hidden sm:inline">
              {weather?.weatherDescription}
            </span>
          </div>

          {/* Thermal Range (Min/Max) */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#574b38] bg-[#eee6d5] px-2.5 py-1 rounded-lg border border-[#ded5c2]">
            <span className="text-[#326194]">↓ {weather?.todayMin}°C</span>
            <span className="text-[#a88243]">/</span>
            <span className="text-[#b84a2a]">↑ {weather?.todayMax}°C</span>
          </div>

          {/* Humidity & UV */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-[#635540]">
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#40748a]" />
              {weather?.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-[#b07823]" />
              UV {weather?.uvIndex?.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Right: Garden Plant Alert Highlights & Expand Action */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {/* Active Risk Banner */}
          {primaryCriticalAlert ? (
            <button
              onClick={() => setActiveAlertModal(primaryCriticalAlert)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs animate-pulse ${
                primaryCriticalAlert.type === "frost"
                  ? "bg-[#d9483b] text-white border border-[#b83226]"
                  : "bg-[#d9682b] text-white border border-[#b8501c]"
              }`}
            >
              {primaryCriticalAlert.type === "frost" ? (
                <ThermometerSnowflake className="w-3.5 h-3.5" />
              ) : (
                <Flame className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                {primaryCriticalAlert.title} ({primaryCriticalAlert.temperatureNotice})
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e5eee1] text-[#284f27] border border-[#c4dcbd] text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5 text-[#3b6b38]" />
              <span>Clima Favorável para o Herbanário</span>
            </div>
          )}

          {/* Expand / Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[#ede5d4] hover:bg-[#ded4be] text-[#4f422e] transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title={isExpanded ? "Recolher detalhes" : "Ver previsão estendida e cuidados"}
          >
            <span className="hidden sm:inline">{isExpanded ? "Ocultar" : "Previsão & Alertas"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Forecast & Plant Protection Advice Panel */}
      {isExpanded && weather && (
        <div className="p-4 sm:p-6 border-t border-[#ded5c2] bg-[#f8f5ee] space-y-6 animate-fadeIn">
          {/* Active Alerts List with Garden Protection Rules */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#a83626]" />
                <h4 className="font-serif-botanic text-base font-bold text-[#2d2215]">
                  Recomendações de Proteção para Suas Plantas
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      alert.type === "frost"
                        ? "bg-[#fff5f5] border-[#f0b4ae]"
                        : alert.type === "heat"
                        ? "bg-[#fff8f0] border-[#f5cc98]"
                        : "bg-[#f2f8fc] border-[#bcd9ed]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {alert.type === "frost" ? "❄️" : alert.type === "heat" ? "🔥" : "💧"}
                        </span>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-[#3d2516]">
                            {alert.title}
                          </h5>
                          <span className="text-[11px] font-semibold text-[#874b22]">
                            {alert.temperatureNotice}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 border text-[#52331c]">
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#5c4735] font-narrative leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Action Plan */}
                    <div className="p-3 rounded-xl bg-white/90 border border-[#e8dac7] space-y-1.5 text-xs">
                      <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#355431] block">
                        Ações Imediatas no Jardim:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#4a3b2b]">
                        {alert.actionPlan.map((action, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#3b6637] font-bold">✓</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Affected Garden Plants Count */}
                    {garden.length > 0 && (
                      <div className="text-[11px] text-[#634e3a] flex items-center justify-between pt-1 border-t border-[#ebdecb]">
                        <span>
                          <strong>{garden.length}</strong> plantas cadastradas sob monitoramento
                        </span>
                        <button
                          onClick={() => setActiveAlertModal(alert)}
                          className="text-[11px] font-bold text-[#2b4c29] hover:underline cursor-pointer"
                        >
                          Ver detalhes das espécies →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5-Day Botanical Weather Forecast Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6e5f48]">
              <span className="font-cinzel font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#3b4c37]">
                <Calendar className="w-3.5 h-3.5" />
                Previsão dos Próximos 5 Dias & Riscos Vegetais
              </span>
              <span className="text-[11px] italic">Atualizado em tempo real via satélite</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {weather.dailyForecast.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                    day.frostRisk
                      ? "bg-[#fceeed] border-[#e8a29b]"
                      : day.heatRisk
                      ? "bg-[#fcf3e8] border-[#ebd0a7]"
                      : "bg-[#faf7f0] border-[#ded5c2]"
                  }`}
                >
                  <span className="font-bold text-xs text-[#2c382b] block">{day.dayOfWeek}</span>
                  <span className="text-2xl block">{day.weatherIcon}</span>
                  
                  <div className="text-xs font-mono font-bold text-[#3b3225]">
                    <span className="text-[#b34024]">{day.tempMax}°</span>
                    <span className="text-[#968369] mx-1">/</span>
                    <span className="text-[#2b6094]">{day.tempMin}°</span>
                  </div>

                  <div className="text-[10px] text-[#5e513e] flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-[#3f6e87]" />
                    <span>{day.precipitationProb}%</span>
                  </div>

                  {/* Warning Pill */}
                  {day.frostRisk && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#d9483b] text-white">
                      ❄️ Geada
                    </span>
                  )}
                  {day.heatRisk && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#d9682b] text-white">
                      🔥 Calor
                    </span>
                  )}
                  {!day.frostRisk && !day.heatRisk && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[#e4ede1] text-[#2c4e2b]">
                      🌿 Estável
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* City Search & Selection Modal */}
      {isCitySearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#faf7f2] rounded-3xl max-w-md w-full p-6 border border-[#ded5c2] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#ded5c2] pb-3">
              <div className="flex items-center gap-2 text-[#284229]">
                <MapPin className="w-5 h-5" />
                <h3 className="font-serif-botanic text-xl font-bold text-[#1f2e1f]">
                  Definir Localização do Jardim
                </h3>
              </div>
              <button
                onClick={() => setIsCitySearchOpen(false)}
                className="p-1 rounded-lg bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Detection Button */}
            <button
              onClick={handleUseGps}
              className="w-full py-2.5 px-4 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] text-[#f7f5ee] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 text-[#a4d495]" />
              <span>Detectar Meu Local Atual via GPS</span>
            </button>

            {/* Manual City Search Bar */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#574936] block">
                Ou pesquise por cidade:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8a7b63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: Curitiba, Florianópolis, Petrópolis, Porto..."
                  value={searchQuery}
                  onChange={(e) => handleSearchQueryChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#3b6338]"
                />
              </div>

              {/* Dynamic Results */}
              {searchResults.length > 0 && (
                <div className="max-h-44 overflow-y-auto space-y-1 bg-[#f5efe3] p-1.5 rounded-xl border border-[#d6ccb8]">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCity(r)}
                      className="w-full text-left p-2 rounded-lg hover:bg-[#eae1cd] text-xs text-[#2d2417] flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-[11px] text-[#78674e]">
                        {r.region ? `${r.region}, ` : ""}{r.country}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Presets */}
            <div className="space-y-2 pt-2 border-t border-[#ded5c2]">
              <span className="text-[11px] font-semibold text-[#665741] uppercase tracking-wider block">
                Cidades Frequentes:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    className="p-2 rounded-xl bg-[#ede5d5] hover:bg-[#ded4be] text-[#3e3423] text-left text-xs font-medium border border-[#d8cdb8] transition-colors cursor-pointer"
                  >
                    <span className="font-semibold block truncate">{c.name}</span>
                    <span className="text-[10px] text-[#70624c] block">{c.region} - {c.country}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {activeAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#faf7f2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ded5c2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ded5c2] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {activeAlertModal.type === "frost" ? "❄️" : "🔥"}
                </span>
                <div>
                  <h3 className="font-serif-botanic text-xl font-bold text-[#1f2e1f]">
                    {activeAlertModal.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#8f4b23]">
                    {activeAlertModal.temperatureNotice}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlertModal(null)}
                className="p-1 rounded-lg bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#544633] font-narrative leading-relaxed">
              {activeAlertModal.description}
            </p>

            {/* Plants in User's Garden */}
            <div className="space-y-2">
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2d4529] block">
                Plantas do Seu Herbanário em Atenção ({garden.length}):
              </span>
              {garden.length === 0 ? (
                <p className="text-xs text-[#70624d] italic bg-[#f3eddf] p-3 rounded-xl">
                  Nenhuma planta cadastrada no momento. Adicione suas espécies ao Meu Jardim para alertas individualizados.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {garden.map((p) => {
                    const species = allSpecies.find(
                      (s) => s.id === p.especieId || s.nomePopular.toLowerCase() === p.nomePersonalizado.toLowerCase()
                    );
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-[#f2ecde] border border-[#ded4be] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#233321] block">
                            {p.nomePersonalizado}
                          </span>
                          <span className="text-[11px] text-[#695b47] italic">
                            {p.nomeCientifico || species?.nomeCientifico || "Herbácea"} • {p.localizacao}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e3d7c3] text-[#4a3c2a] shrink-0">
                          {p.estadoSaude}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Checklist */}
            <div className="p-4 rounded-2xl bg-[#f5eee1] border border-[#ded5c0] space-y-2 text-xs">
              <span className="font-bold text-[#2b4429] flex items-center gap-1.5 text-xs uppercase tracking-wider font-cinzel">
                <ShieldCheck className="w-4 h-4 text-[#355e33]" />
                Guia de Sobrevivência Vegetal
              </span>
              <ul className="space-y-1.5 text-xs text-[#4d3e2d]">
                {activeAlertModal.actionPlan.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#3b6637] font-bold">✓</span>
                    <span className="font-narrative leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveAlertModal(null)}
                className="px-5 py-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] text-xs font-semibold text-[#f7f5ee] cursor-pointer"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
