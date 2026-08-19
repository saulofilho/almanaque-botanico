import React, { useState } from "react";
import { 
  Moon, 
  Sun, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Sprout, 
  Scissors, 
  Droplets, 
  AlertCircle, 
  Compass,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { 
  getAstronomicalMoonPhase, 
  LUNAR_PHASES_DETAILS, 
  MONTHLY_CALENDAR, 
  BOTANICAL_PROVERBS 
} from "../data/lunarData";

export const LunarCalendarView: React.FC = () => {
  const currentMoon = getAstronomicalMoonPhase();
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<string>(currentMoon.phaseKey);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(new Date().getMonth());
  const [proverbIdx, setProverbIdx] = useState<number>(0);

  const activePhaseInfo = LUNAR_PHASES_DETAILS[selectedPhaseKey] || LUNAR_PHASES_DETAILS.crescente;
  const currentMonthData = MONTHLY_CALENDAR[selectedMonthIdx];

  const handleNextProverb = () => {
    setProverbIdx((prev) => (prev + 1) % BOTANICAL_PROVERBS.length);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Hero Lunar Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1b261c] via-[#243526] to-[#121c13] text-[#f7f2e4] p-6 sm:p-10 border border-[#375239] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(168,212,156,0.18),transparent_70%)] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142015] text-[#b4dfab] text-xs font-semibold uppercase tracking-wider border border-[#355237]">
              <Moon className="w-3.5 h-3.5" />
              <span>Astronomia & Sabedoria Popular dos Ciclos Lunares</span>
            </div>

            <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight text-[#f4efe4]">
              Almanaque Lunar & Calendário das Estações
            </h1>

            <p className="text-sm sm:text-base text-[#d8cfbe] font-narrative leading-relaxed">
              Descubra como a força gravitacional da Lua orienta o fluxo da seiva nas plantas. Saiba exatamente o que semear, podar, adubar ou colher na fase lunar de hoje.
            </p>

            {/* Current Real-time Astronomical Moon badge */}
            <div className="p-4 rounded-2xl bg-[#142215]/90 border border-[#39573b] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentMoon.icon}</span>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#a0c596] font-mono block">
                    Fase Astronômica Atual
                  </span>
                  <span className="text-base font-bold text-[#f7f5ee]">
                    {currentMoon.phaseName} ({currentMoon.illumination}% iluminada)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhaseKey(currentMoon.phaseKey)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2e4730] hover:bg-[#3d5e3f] text-xs font-semibold text-[#f0e8d8] transition-colors whitespace-nowrap cursor-pointer"
              >
                Ver Manejo de Hoje
              </button>
            </div>
          </div>

          {/* Interactive Moon Phase Sphere Card */}
          <div className="lg:col-span-5 bg-[#142015]/80 p-6 rounded-3xl border border-[#334e35] shadow-inner text-center space-y-4">
            <div className="text-6xl animate-pulse drop-shadow-md">
              {activePhaseInfo.icone}
            </div>
            <div>
              <h2 className="font-serif-botanic text-2xl font-bold text-[#f2ede4]">
                {activePhaseInfo.nome}
              </h2>
              <p className="text-xs text-[#a0c596] font-narrative italic mt-1">
                "{activePhaseInfo.proverbio}"
              </p>
            </div>

            {/* Phase Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0e160e] rounded-2xl border border-[#2b422d]">
              {(["nova", "crescente", "cheia", "minguante"] as const).map((key) => {
                const info = LUNAR_PHASES_DETAILS[key];
                const isSelected = selectedPhaseKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPhaseKey(key)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#2f4931] text-[#b8e8b0] shadow-sm"
                        : "text-[#8d9e8b] hover:text-[#f7f4ee] hover:bg-[#1a281c]"
                    }`}
                  >
                    <span className="block text-sm mb-0.5">{info.icone}</span>
                    <span className="text-[10px] truncate block capitalize">{key}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sap Circulation & In-Depth Phase Guide */}
      <div className="bg-[#f5efe3] rounded-3xl p-6 sm:p-8 border border-[#ded5c2] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ded5c2] pb-4">
          <div>
            <h2 className="font-serif-botanic text-2xl font-bold text-[#233322]">
              Dinâmica da Seiva & Guia Prático para {activePhaseInfo.nome}
            </h2>
            <p className="text-xs text-[#6e634e] font-narrative">
              Influência gravitacional sobre folhas, frutos, caules e raízes.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#ebe2d0] text-[#4f4330] font-mono border border-[#d6ccb8] self-start sm:self-auto">
            Iluminação: ~{activePhaseInfo.iluminacao}%
          </span>
        </div>

        {/* Sap Dynamic Explanation Box */}
        <div className="p-5 rounded-2xl bg-[#ede5d5] border border-[#d9cdb8] flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-[#456b3e] shrink-0 mt-0.5" />
          <p className="text-sm text-[#383125] font-narrative leading-relaxed">
            <strong>Movimento da Seiva:</strong> {activePhaseInfo.influenciaSeiva}
          </p>
        </div>

        {/* 3 Pillars of Lunar Gardening */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. What to Plant */}
          <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#dcd1bc] space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#2e572b] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#386b35]" />
              O Que Semear & Plantar
            </h3>
            <ul className="space-y-2">
              {activePhaseInfo.focoPlantio.map((item, idx) => (
                <li key={idx} className="text-xs text-[#453c2e] flex items-start gap-2">
                  <span className="text-[#386b35] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. What to Manage/Prune/Fertilize */}
          <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#dcd1bc] space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#544321] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#8a6822]" />
              Manejos, Podas & Adubação
            </h3>
            <ul className="space-y-2">
              {activePhaseInfo.focoManejo.map((item, idx) => (
                <li key={idx} className="text-xs text-[#453c2e] flex items-start gap-2">
                  <span className="text-[#8a6822] font-bold">◈</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. What to Avoid */}
          <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#dcd1bc] space-y-3">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#7a2e21] flex items-center gap-2">
              <XCircle className="w-4 h-4 text-[#a63c29]" />
              O Que Evitar Nesta Fase
            </h3>
            <ul className="space-y-2">
              {activePhaseInfo.evitarNestaFase.map((item, idx) => (
                <li key={idx} className="text-xs text-[#6e352b] flex items-start gap-2">
                  <span className="text-[#a63c29] font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 12-Month Sowing & Harvesting Agricultural Guide */}
      <div className="bg-[#f5efe3] rounded-3xl p-6 sm:p-8 border border-[#ded5c2] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded5c2] pb-4">
          <div>
            <h2 className="font-serif-botanic text-2xl font-bold text-[#233322] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#375735]" />
              Calendário Agrícola Perpétuo Mês a Mês
            </h2>
            <p className="text-xs text-[#6e634e] font-narrative">
              Guia sazonal de semeadura, colheita e tratos culturais ao longo do ano.
            </p>
          </div>

          {/* Month Selector Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {MONTHLY_CALENDAR.map((m, idx) => (
              <button
                key={m.mes}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMonthIdx === idx
                    ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                    : "bg-[#eae1cf] text-[#5c503b] hover:bg-[#dfd4be]"
                }`}
              >
                {m.mes.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Month Detailed Card */}
        <div className="p-6 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-cinzel text-[#4e6e4a] font-bold">
                Estação: {currentMonthData.estacao}
              </span>
              <h3 className="font-serif-botanic text-3xl font-bold text-[#1f2e1f]">
                {currentMonthData.mes} no Jardim & Horta
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-[#ede4d2] border border-[#ded4bf] text-xs text-[#4b402e] font-serif-botanic italic">
              "{currentMonthData.dicaTradicional}"
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* O Que Semear */}
            <div className="p-4 rounded-xl bg-[#f0ebd9] border border-[#ded4bf] space-y-2">
              <h4 className="font-semibold text-xs text-[#2c5229] flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-[#3c6b37]" />
                O Que Semear em {currentMonthData.mes}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentMonthData.oQueSemear.map((plant, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#faf7f2] text-[#342e23] text-xs font-medium border border-[#ded4bf]"
                  >
                    🌱 {plant}
                  </span>
                ))}
              </div>
            </div>

            {/* O Que Colher */}
            <div className="p-4 rounded-xl bg-[#f0ebd9] border border-[#ded4bf] space-y-2">
              <h4 className="font-semibold text-xs text-[#634e26] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-[#9c782b]" />
                O Que Colher em {currentMonthData.mes}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentMonthData.oQueColher.map((plant, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#faf7f2] text-[#342e23] text-xs font-medium border border-[#ded4bf]"
                  >
                    🧺 {plant}
                  </span>
                ))}
              </div>
            </div>

            {/* Manutenção & Cuidados */}
            <div className="p-4 rounded-xl bg-[#f0ebd9] border border-[#ded4bf] space-y-2">
              <h4 className="font-semibold text-xs text-[#524430] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#3b6b7a]" />
                Tratos Culturais do Mês
              </h4>
              <ul className="space-y-1.5">
                {currentMonthData.manejos.map((manejo, i) => (
                  <li key={i} className="text-xs text-[#4a3f2f] leading-relaxed">
                    • {manejo}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ancestral Almanac Proverbs Interactive Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#243825] to-[#182819] text-[#f7f2e6] border border-[#3b573c] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[11px] uppercase font-cinzel tracking-widest text-[#9bc88d] block">
            Provérbio do Almanaque Botânico Perpétuo
          </span>
          <p className="text-base sm:text-lg font-serif-botanic italic text-[#ebe2ce] max-w-2xl">
            "{BOTANICAL_PROVERBS[proverbIdx]}"
          </p>
        </div>
        <button
          onClick={handleNextProverb}
          className="px-4 py-2.5 rounded-xl bg-[#324f33] hover:bg-[#436b44] text-xs font-semibold text-[#f7f4ee] border border-[#496e4a] transition-all cursor-pointer whitespace-nowrap"
        >
          Outro Provérbio ✨
        </button>
      </div>
    </div>
  );
};
