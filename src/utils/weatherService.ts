import { UserPlant, PlantEntry } from "../types";

export interface WeatherData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  todayMax: number;
  todayMin: number;
  precipitationProb: number;
  dailyForecast: {
    date: string;
    dayOfWeek: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    weatherIcon: string;
    precipitationProb: number;
    frostRisk: boolean;
    heatRisk: boolean;
  }[];
  alerts: WeatherPlantAlert[];
  fetchedAt: string;
}

export interface WeatherPlantAlert {
  id: string;
  type: "frost" | "heat" | "rain" | "dry";
  severity: "critical" | "warning" | "info";
  title: string;
  temperatureNotice: string;
  description: string;
  affectedPlants: {
    userPlantId: string;
    plantName: string;
    scientificName?: string;
    reason: string;
  }[];
  actionPlan: string[];
}

export const POPULAR_CITIES = [
  { name: "São Paulo", region: "SP", country: "Brasil", lat: -23.5505, lon: -46.6333 },
  { name: "Curitiba", region: "PR", country: "Brasil", lat: -25.4284, lon: -49.2733 },
  { name: "Porto Alegre", region: "RS", country: "Brasil", lat: -30.0346, lon: -51.2177 },
  { name: "Belo Horizonte", region: "MG", country: "Brasil", lat: -19.9208, lon: -43.9378 },
  { name: "Rio de Janeiro", region: "RJ", country: "Brasil", lat: -22.9068, lon: -43.1729 },
  { name: "Brasília", region: "DF", country: "Brasil", lat: -15.7975, lon: -47.8919 },
  { name: "Salvador", region: "BA", country: "Brasil", lat: -12.9777, lon: -38.5016 },
  { name: "Manaus", region: "AM", country: "Brasil", lat: -3.1190, lon: -60.0217 },
  { name: "Lisboa", region: "Lisboa", country: "Portugal", lat: 38.7223, lon: -9.1393 },
];

export function interpretWmoCode(code: number): { description: string; icon: string } {
  switch (code) {
    case 0:
      return { description: "Céu Limpo", icon: "☀️" };
    case 1:
    case 2:
      return { description: "Parcialmente Nublado", icon: "⛅" };
    case 3:
      return { description: "Encoberto / Nublado", icon: "☁️" };
    case 45:
    case 48:
      return { description: "Nevoeiro / Névoa Úmida", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { description: "Garoa / Chuvisco", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { description: "Chuva Contínua", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { description: "Precipitação de Neve / Geada", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { description: "Pancadas de Chuva", icon: "🌦️" };
    case 95:
    case 96:
    case 99:
      return { description: "Tempestade com Raios", icon: "⛈️" };
    default:
      return { description: "Tempo Estável", icon: "🌤️" };
  }
}

/**
 * Evaluates plant risks based on current and forecasted weather for registered garden plants
 */
export function analyzeGardenWeatherAlerts(
  garden: UserPlant[],
  allSpecies: PlantEntry[],
  currentTemp: number,
  todayMax: number,
  todayMin: number,
  humidity: number,
  uvIndex: number,
  precipProb: number
): WeatherPlantAlert[] {
  const alerts: WeatherPlantAlert[] = [];

  // Helper to find species
  const getSpeciesForUserPlant = (p: UserPlant) => {
    return allSpecies.find(
      (s) => s.id === p.especieId || s.nomePopular.toLowerCase() === p.nomePersonalizado.toLowerCase()
    );
  };

  // 1. RISK OF FROST / SEVERE COLD (todayMin <= 4°C)
  if (todayMin <= 4) {
    const affectedPlants = garden.map((p) => {
      const species = getSpeciesForUserPlant(p);
      const name = (species?.nomePopular || p.nomePersonalizado).toLowerCase();
      const isTropical =
        species?.categoria === "Suculentas" ||
        species?.categoria === "PANCs" ||
        species?.origem?.toLowerCase().includes("brasil") ||
        species?.origem?.toLowerCase().includes("tropical") ||
        species?.origem?.toLowerCase().includes("amazônia") ||
        name.includes("monstera") ||
        name.includes("manjericão") ||
        name.includes("guaco") ||
        name.includes("ora-pro-nóbis") ||
        name.includes("pimenta") ||
        name.includes("aloe");

      return {
        userPlantId: p.id,
        plantName: p.nomePersonalizado,
        scientificName: species?.nomeCientifico || p.nomeCientifico,
        reason: isTropical
          ? "Espécie tropical/sensível ao frio: risco alto de necrose celular nas folhas e paralisação de seiva."
          : "Sensível a baixas temperaturas noturnas na raiz.",
      };
    });

    alerts.push({
      id: "frost-alert",
      type: "frost",
      severity: todayMin <= 2 ? "critical" : "warning",
      title: todayMin <= 0 ? "Alerta Crítico de Geada Iminente" : "Risco de Frio Intenso & Geada Noturna",
      temperatureNotice: `Mínima prevista de ${Math.round(todayMin)}°C nas próximas horas`,
      description:
        "O ar polar e as temperaturas baixas podem congelar o orvalho na superfície foliar, rompendo as membranas das células vegetais.",
      affectedPlants,
      actionPlan: [
        "Recolha vasos móveis para dentro de casa ou sob varandas protegidas antes do cair da noite.",
        "Cubra canteiros fixos com tecido de algodão, esteiras de palha ou TNT (nunca use plástico colado às folhas).",
        "Não regue no final da tarde ou à noite; a água gelada acumulada acelera o congelamento radicular.",
        "Mantenha o solo coberto com palhada seca ou casca de pinus para isolamento térmico.",
      ],
    });
  }

  // 2. RISK OF HEATWAVE / THERMAL STRESS (todayMax >= 31°C or UV >= 8)
  if (todayMax >= 31 || (todayMax >= 29 && uvIndex >= 8)) {
    const affectedPlants = garden.map((p) => {
      const species = getSpeciesForUserPlant(p);
      const name = (species?.nomePopular || p.nomePersonalizado).toLowerCase();
      const isSensitiveToHeat =
        species?.luminosidade?.includes("Sombra") ||
        species?.luminosidade?.includes("Meia-Sombra") ||
        name.includes("hortelã") ||
        name.includes("camomila") ||
        name.includes("samambaia") ||
        name.includes("avenca") ||
        name.includes("calathea") ||
        name.includes("alface") ||
        name.includes("rúcula");

      return {
        userPlantId: p.id,
        plantName: p.nomePersonalizado,
        scientificName: species?.nomeCientifico || p.nomeCientifico,
        reason: isSensitiveToHeat
          ? "Folhagem fina e tenra com alta taxa de evapotranspiração: risco de desidratação e queima solar."
          : "Demanda alta de água devido à radiação ultravioleta intensa.",
      };
    });

    alerts.push({
      id: "heat-alert",
      type: "heat",
      severity: todayMax >= 35 || uvIndex >= 10 ? "critical" : "warning",
      title: todayMax >= 35 ? "Alerta Crítico de Onda de Calor Extremo" : "Alerta de Estresse Térmico & Radiação Alta",
      temperatureNotice: `Máxima de ${Math.round(todayMax)}°C com índice UV ${uvIndex.toFixed(0)}`,
      description:
        "O calor intenso aumenta drasticamente a perda hídrica das folhas. Plantas em vasos pequenos podem ter o substrato superaquecido.",
      affectedPlants,
      actionPlan: [
        "Realize regas profundas no início da manhã (antes das 8h) para garantir hidratação antes do pico solar.",
        "Mova plantas de meia-sombra para locais protegidos do sol direto do meio-dia (das 11h às 15h).",
        "Borrife água ao redor dos vasos para aumentar a umidade relativa do ar (evite borrifar água nas folhas sob sol direto).",
        "Adicione uma camada de cobertura morta (folhas secas ou serragem) para reter a umidade do solo.",
      ],
    });
  }

  // 3. RISK OF EXTREME DRY AIR (humidity < 30%)
  if (humidity < 30 && todayMax > 25) {
    alerts.push({
      id: "dry-alert",
      type: "dry",
      severity: "warning",
      title: "Alerta de Baixa Umidade do Ar",
      temperatureNotice: `Umidade relativa em ${humidity}% (ar seco)`,
      description:
        "O ar excessivamente seco resseca as pontas das folhas e atrai ácaros e cochonilhas para o herbanário.",
      affectedPlants: garden.map((p) => ({
        userPlantId: p.id,
        plantName: p.nomePersonalizado,
        reason: "Susceptível ao ressecamento de brotos novos.",
      })),
      actionPlan: [
        "Agrupe os vasos para criar um microclima úmido coletivo.",
        "Utilize pratos com pedriscos e água sob os vasos (sem deixar o fundo do vaso em contato com a água).",
        "Evite podas drásticas durante períodos de seca severa.",
      ],
    });
  }

  // 4. RISK OF TORRENTIAL RAIN / STORMS (precipProb >= 80%)
  if (precipProb >= 80) {
    const sensitiveToRot = garden.filter((p) => {
      const species = getSpeciesForUserPlant(p);
      const name = (species?.nomePopular || p.nomePersonalizado).toLowerCase();
      return (
        species?.categoria === "Suculentas" ||
        name.includes("alecrim") ||
        name.includes("lavanda") ||
        name.includes("cacto") ||
        name.includes("camomila")
      );
    });

    if (sensitiveToRot.length > 0) {
      alerts.push({
        id: "rain-alert",
        type: "rain",
        severity: "info",
        title: "Alerta de Chuvas Torrenciais",
        temperatureNotice: `Probabilidade de precipitação em ${precipProb}%`,
        description:
          "Excesso de água contínua pode asfixiar as raízes de ervas mediterrâneas e suculentas.",
        affectedPlants: sensitiveToRot.map((p) => ({
          userPlantId: p.id,
          plantName: p.nomePersonalizado,
          reason: "Raízes sensíveis ao apodrecimento por encharcamento.",
        })),
        actionPlan: [
          "Verifique se os pratinhos estão escoando livremente e descarte água acumulada.",
          "Proteja vasos de barro com ervas mediterrâneas sob beirais ou áreas cobertas.",
        ],
      });
    }
  }

  return alerts;
}

/**
 * Fetches real-time weather from Open-Meteo API
 */
export async function fetchLocalWeather(
  latitude: number,
  longitude: number,
  city = "Minha Localização",
  region = "",
  country = "Brasil"
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao obter dados meteorológicos: status ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;
  const daily = data.daily;

  const currentWmo = interpretWmoCode(current.weather_code || 0);

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const dailyForecast = (daily.time || []).slice(0, 5).map((timeStr: string, idx: number) => {
    const d = new Date(timeStr + "T12:00:00");
    const code = daily.weather_code[idx] || 0;
    const maxT = daily.temperature_2m_max[idx] || 25;
    const minT = daily.temperature_2m_min[idx] || 15;
    const prob = daily.precipitation_probability_max[idx] || 0;
    const wmo = interpretWmoCode(code);

    return {
      date: timeStr,
      dayOfWeek: idx === 0 ? "Hoje" : daysOfWeek[d.getDay()],
      tempMax: Math.round(maxT),
      tempMin: Math.round(minT),
      weatherCode: code,
      weatherIcon: wmo.icon,
      precipitationProb: prob,
      frostRisk: minT <= 4,
      heatRisk: maxT >= 32,
    };
  });

  return {
    city,
    region,
    country,
    latitude,
    longitude,
    currentTemp: Math.round(current.temperature_2m),
    apparentTemp: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    uvIndex: current.uv_index || 0,
    weatherCode: current.weather_code,
    weatherDescription: currentWmo.description,
    weatherIcon: currentWmo.icon,
    todayMax: Math.round(daily.temperature_2m_max[0] || current.temperature_2m),
    todayMin: Math.round(daily.temperature_2m_min[0] || current.temperature_2m),
    precipitationProb: daily.precipitation_probability_max[0] || 0,
    dailyForecast,
    alerts: [], // will be calculated with the user's garden
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Searches cities using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<
  { name: string; region: string; country: string; lat: number; lon: number }[]
> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=pt&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: any) => ({
      name: r.name,
      region: r.admin1 || "",
      country: r.country || "",
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err) {
    console.error("Erro na busca de cidades:", err);
    return [];
  }
}
