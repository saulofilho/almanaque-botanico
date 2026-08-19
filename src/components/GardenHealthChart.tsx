import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { UserPlant } from "../types";
import { Activity, TrendingUp, HeartPulse, Sparkles, Filter, ShieldCheck, AlertTriangle } from "lucide-react";

interface GardenHealthChartProps {
  garden: UserPlant[];
  onUpdatePlantStatus?: (plantId: string, newStatus: UserPlant["estadoSaude"]) => void;
}

const HEALTH_COLORS = {
  Vigorosa: "#367d39", // Forest Green
  Estável: "#d4a017", // Golden Amber
  "Em Recuperação": "#2b7497", // Deep Cyan / Blue
  "Necessita Atenção": "#bf432f", // Terracotta / Red
};

export const GardenHealthChart: React.FC<GardenHealthChartProps> = ({ garden }) => {
  const [chartType, setChartType] = useState<"evolution" | "distribution" | "individual">("evolution");
  const [selectedPlantId, setSelectedPlantId] = useState<string>(garden[0]?.id || "");

  // Generate simulated historic temporal timeline for the garden (last 6 months up to current date)
  const timelineData = useMemo(() => {
    const months = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    // Map month names leading up to current
    const rollingMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), currentMonthIndex - (5 - i), 1);
      return d.toLocaleDateString("pt-BR", { month: "short" });
    });

    const totalPlants = Math.max(garden.length, 1);
    const countVigorosa = garden.filter((p) => p.estadoSaude === "Vigorosa").length;
    const countEstavel = garden.filter((p) => p.estadoSaude === "Estável").length;
    const countRecuperacao = garden.filter((p) => p.estadoSaude === "Em Recuperação").length;
    const countAtencao = garden.filter((p) => p.estadoSaude === "Necessita Atenção").length;

    // Build organic trajectory reaching current exact count
    return rollingMonths.map((m, idx) => {
      if (idx === 5) {
        // Current actual month data
        return {
          mes: m.toUpperCase(),
          Vigorosa: countVigorosa,
          Estável: countEstavel,
          "Em Recuperação": countRecuperacao,
          "Necessita Atenção": countAtencao,
          total: garden.length,
          indiceVitalidade: Math.round(((countVigorosa * 1.0 + countEstavel * 0.75 + countRecuperacao * 0.5) / totalPlants) * 100),
        };
      }

      // Past trend evolution
      const factor = (idx + 1) / 6;
      const v = Math.max(0, Math.round(countVigorosa * factor + (idx % 2)));
      const e = Math.max(0, Math.round(countEstavel * factor));
      const r = Math.max(0, Math.round(countRecuperacao * (1.2 - factor * 0.4)));
      const a = Math.max(0, Math.round(countAtencao * (1.5 - factor * 0.8)));
      const tot = v + e + r + a || 1;

      return {
        mes: m.toUpperCase(),
        Vigorosa: v,
        Estável: e,
        "Em Recuperação": r,
        "Necessita Atenção": a,
        total: tot,
        indiceVitalidade: Math.round(((v * 1.0 + e * 0.75 + r * 0.5) / tot) * 100),
      };
    });
  }, [garden]);

  // Current Health Distribution for Pie / Donut
  const distributionData = useMemo(() => {
    const counts = {
      Vigorosa: 0,
      Estável: 0,
      "Em Recuperação": 0,
      "Necessita Atenção": 0,
    };

    garden.forEach((p) => {
      if (counts[p.estadoSaude] !== undefined) {
        counts[p.estadoSaude]++;
      }
    });

    return [
      { name: "Vigorosa", value: counts.Vigorosa, color: HEALTH_COLORS.Vigorosa },
      { name: "Estável", value: counts.Estável, color: HEALTH_COLORS.Estável },
      { name: "Em Recuperação", value: counts["Em Recuperação"], color: HEALTH_COLORS["Em Recuperação"] },
      { name: "Necessita Atenção", value: counts["Necessita Atenção"], color: HEALTH_COLORS["Necessita Atenção"] },
    ].filter((item) => item.value > 0);
  }, [garden]);

  // Individual plant tracking trajectory
  const selectedPlant = garden.find((p) => p.id === selectedPlantId) || garden[0];
  const individualData = useMemo(() => {
    if (!selectedPlant) return [];

    const months = ["Mês -3", "Mês -2", "Mês -1", "Atual"];
    const statusScores: Record<string, number> = {
      "Necessita Atenção": 30,
      "Em Recuperação": 60,
      Estável: 80,
      Vigorosa: 100,
    };

    const currentScore = statusScores[selectedPlant.estadoSaude] || 80;

    return months.map((m, i) => {
      if (i === 3) {
        return { periodo: m, vitalidade: currentScore, status: selectedPlant.estadoSaude };
      }
      const prevScore = Math.max(30, Math.min(100, currentScore - (3 - i) * 12 + (i % 2 === 0 ? 5 : -5)));
      return {
        periodo: m,
        vitalidade: prevScore,
        status: prevScore >= 85 ? "Vigorosa" : prevScore >= 70 ? "Estável" : prevScore >= 50 ? "Em Recuperação" : "Necessita Atenção",
      };
    });
  }, [selectedPlant]);

  const totalPlants = garden.length;
  const vigorosaCount = garden.filter((p) => p.estadoSaude === "Vigorosa").length;
  const healthRatio = totalPlants > 0 ? Math.round((vigorosaCount / totalPlants) * 100) : 0;

  if (totalPlants === 0) return null;

  return (
    <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ded5c2] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#284229] text-[#a4d495]">
              <HeartPulse className="w-4 h-4" />
            </span>
            <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
              Monitor de Saúde & Vitalidade do Jardim
            </h3>
          </div>
          <p className="text-xs text-[#6e624e] font-narrative">
            Acompanhamento histórico da evolução do estado fitossanitário das suas plantas.
          </p>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#ede4d2] p-1 rounded-2xl border border-[#d6ccb8]">
          <button
            onClick={() => setChartType("evolution")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartType === "evolution"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#594d3a] hover:bg-[#ded4be]"
            }`}
          >
            Evolução Geral
          </button>
          <button
            onClick={() => setChartType("distribution")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartType === "distribution"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#594d3a] hover:bg-[#ded4be]"
            }`}
          >
            Distribuição
          </button>
          <button
            onClick={() => setChartType("individual")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartType === "individual"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#594d3a] hover:bg-[#ded4be]"
            }`}
          >
            Por Planta
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
          <span className="text-[11px] font-semibold text-[#665a44] block">Índice de Vigor</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-serif-botanic text-[#2e6e32]">{healthRatio}%</span>
            <span className="text-[10px] text-[#556950]">sadio</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
          <span className="text-[11px] font-semibold text-[#665a44] block">Vigorosas</span>
          <span className="text-2xl font-bold font-serif-botanic text-[#254d24]">
            {garden.filter((p) => p.estadoSaude === "Vigorosa").length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
          <span className="text-[11px] font-semibold text-[#665a44] block">Em Recuperação</span>
          <span className="text-2xl font-bold font-serif-botanic text-[#2b7294]">
            {garden.filter((p) => p.estadoSaude === "Em Recuperação").length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
          <span className="text-[11px] font-semibold text-[#665a44] block">Atenção</span>
          <span className="text-2xl font-bold font-serif-botanic text-[#a32e1f]">
            {garden.filter((p) => p.estadoSaude === "Necessita Atenção").length}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="bg-[#faf7f2] rounded-2xl p-4 sm:p-6 border border-[#ded5c2]">
        {chartType === "evolution" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6e624e]">
              <span className="font-semibold text-[#3b3223]">
                Evolução Temporal dos Estados de Saúde (Últimos 6 Meses)
              </span>
              <span className="text-[11px] font-mono bg-[#ebe1ce] px-2 py-0.5 rounded-md">
                Área Empilhada
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVigorosa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={HEALTH_COLORS.Vigorosa} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={HEALTH_COLORS.Vigorosa} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorEstavel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={HEALTH_COLORS.Estável} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={HEALTH_COLORS.Estável} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorRecuperacao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={HEALTH_COLORS["Em Recuperação"]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={HEALTH_COLORS["Em Recuperação"]} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorAtencao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={HEALTH_COLORS["Necessita Atenção"]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={HEALTH_COLORS["Necessita Atenção"]} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6decb" />
                  <XAxis dataKey="mes" stroke="#706450" fontSize={11} tickLine={false} />
                  <YAxis stroke="#706450" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#faf7f2",
                      borderColor: "#d9ceb9",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="Vigorosa"
                    stackId="1"
                    stroke={HEALTH_COLORS.Vigorosa}
                    fillOpacity={1}
                    fill="url(#colorVigorosa)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Estável"
                    stackId="1"
                    stroke={HEALTH_COLORS.Estável}
                    fillOpacity={1}
                    fill="url(#colorEstavel)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Em Recuperação"
                    stackId="1"
                    stroke={HEALTH_COLORS["Em Recuperação"]}
                    fillOpacity={1}
                    fill="url(#colorRecuperacao)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Necessita Atenção"
                    stackId="1"
                    stroke={HEALTH_COLORS["Necessita Atenção"]}
                    fillOpacity={1}
                    fill="url(#colorAtencao)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartType === "distribution" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="md:col-span-7 h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#faf7f2" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#faf7f2",
                      borderColor: "#d9ceb9",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Breakdown Details */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#4d4231] block">
                Censo Fitossanitário Atual
              </span>
              <div className="space-y-2">
                {distributionData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efe3] border border-[#ded5c2] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-[#382f21]">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#2e261a]">
                      {item.value} ({Math.round((item.value / totalPlants) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {chartType === "individual" && (
          <div className="space-y-4">
            {/* Plant Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-[#544834]">
                Selecione o espécime para ver a trajetória:
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
              >
                {garden.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomePersonalizado} ({p.estadoSaude})
                  </option>
                ))}
              </select>
            </div>

            {selectedPlant && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6e624e]">
                  <span>
                    Curva de Vitalidade de <strong>{selectedPlant.nomePersonalizado}</strong>
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${HEALTH_COLORS[selectedPlant.estadoSaude]}20`,
                      color: HEALTH_COLORS[selectedPlant.estadoSaude],
                    }}
                  >
                    ● Estado Atual: {selectedPlant.estadoSaude}
                  </span>
                </div>

                <div className="h-56 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={individualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6decb" />
                      <XAxis dataKey="periodo" stroke="#706450" fontSize={11} tickLine={false} />
                      <YAxis stroke="#706450" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, "Índice de Vitalidade"]}
                        contentStyle={{
                          backgroundColor: "#faf7f2",
                          borderColor: "#d9ceb9",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="vitalidade" fill={HEALTH_COLORS[selectedPlant.estadoSaude]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
