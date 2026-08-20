import React, { useState, useEffect } from "react";
import {
  Bug,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Moon,
  Leaf,
  Droplets,
  Sprout,
  X,
  Printer,
  RefreshCw,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Maximize2,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { UserPlant, FieldJournalEntry, PlantEntry, JournalPestAnalysisReport, PestPatternAnalysisItem } from "../types";
import confetti from "canvas-confetti";

interface PestPatternAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  garden: UserPlant[];
  allSpecies?: PlantEntry[];
  entries: FieldJournalEntry[];
  initialPlantId?: string | null;
  onScheduleBioSpray?: (plantId: string, plantName: string, sprayName: string, notes?: string) => void;
  onAddJournalEntry?: (entry: FieldJournalEntry) => void;
}

export const PestPatternAnalysisModal: React.FC<PestPatternAnalysisModalProps> = ({
  isOpen,
  onClose,
  garden,
  allSpecies = [],
  entries,
  initialPlantId = null,
  onScheduleBioSpray,
  onAddJournalEntry,
}) => {
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>(initialPlantId || "all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<JournalPestAnalysisReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);
  const [scheduledSuccessMsg, setScheduledSuccessMsg] = useState<string | null>(null);

  // Sync initial plant if opened for specific plant
  useEffect(() => {
    if (initialPlantId) {
      setSelectedPlantFilter(initialPlantId);
    }
  }, [initialPlantId]);

  const runAnalysis = async (plantId: string = selectedPlantFilter) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const filteredEntries =
        plantId === "all"
          ? entries
          : plantId === "general"
          ? entries.filter((e) => !e.userPlantId)
          : entries.filter((e) => e.userPlantId === plantId);

      const targetPlant = plantId !== "all" ? garden.find((p) => p.id === plantId) : null;

      const response = await fetch("/api/gemini/field-journal-pest-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: filteredEntries,
          garden,
          selectedPlantId: plantId,
          selectedPlantName: targetPlant?.nomePersonalizado || "Geral",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com a IA de Fitossanidade.");
      }

      const data: JournalPestAnalysisReport = await response.json();
      setReport(data);

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#2d7a32", "#a4d495", "#d97706"],
      });
    } catch (err: any) {
      console.error("Erro ao gerar análise de pragas:", err);
      setErrorMsg("Não foi possível concluir a análise via IA no momento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically on first open or when plant filter changes
  useEffect(() => {
    if (isOpen && !report) {
      runAnalysis(selectedPlantFilter);
    }
  }, [isOpen]);

  const handleFilterChange = (newPlantId: string) => {
    setSelectedPlantFilter(newPlantId);
    runAnalysis(newPlantId);
  };

  const handleScheduleRecipe = (pattern: PestPatternAnalysisItem, recipeName: string) => {
    const targetPlantName = pattern.plantasAfetadas[0] || (selectedPlantFilter !== "all" ? garden.find(p => p.id === selectedPlantFilter)?.nomePersonalizado : "Jardim Geral") || "Jardim Geral";
    const targetPlantId = garden.find(p => p.nomePersonalizado === targetPlantName)?.id || (selectedPlantFilter !== "all" ? selectedPlantFilter : "general");

    if (onScheduleBioSpray) {
      onScheduleBioSpray(
        targetPlantId,
        targetPlantName,
        recipeName,
        `Aplicação preventiva recomendada pela IA para controle de ${pattern.pragaOuPatogeno}`
      );
      setScheduledSuccessMsg(`Agendamento de "${recipeName}" adicionado ao Calendário de Manejo!`);
      setTimeout(() => setScheduledSuccessMsg(null), 4000);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ["#2d7a32", "#a4d495"],
      });
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#faf7f2] rounded-3xl border border-[#ded5c2] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#284229] text-[#f7f5ee] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3c5d3e] shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1e331f] border border-[#a4d495]/30 flex items-center justify-center text-[#a4d495] shrink-0 shadow-inner">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-[#a4d495]">
                  Camada de Inteligência Fitossanitária
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e331f] text-[#bde3b1] border border-[#a4d495]/20 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#facc15]" />
                  IA Botânica
                </span>
              </div>
              <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-white">
                Análise de Padrões de Pragas & Controle Biológico
              </h2>
              <p className="text-xs text-[#d3e6ce] font-narrative max-w-2xl mt-0.5">
                Mapeamento de reinfestações através das fotos e registros do Diário de Campo, com prescrição de inimigos naturais e caldas bio-específicas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              onClick={handlePrintReport}
              className="p-2.5 rounded-xl bg-[#1e331f] hover:bg-[#152516] text-[#d3e6ce] hover:text-white transition-colors cursor-pointer"
              title="Imprimir / Exportar Laudo Fitossanitário"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => runAnalysis(selectedPlantFilter)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#345836] hover:bg-[#28462a] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#a4d495]" : ""}`} />
              <span>{isLoading ? "Analisando..." : "Reanalisar"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1e331f] hover:bg-[#152516] text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {scheduledSuccessMsg && (
          <div className="bg-[#e2f0df] text-[#1c4519] border-b border-[#b7dfb1] px-6 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2d7a32]" />
              {scheduledSuccessMsg}
            </span>
            <button onClick={() => setScheduledSuccessMsg(null)} className="text-[#2d7a32] hover:underline">
              ✕
            </button>
          </div>
        )}

        {/* Sub-header Filter Toolbar */}
        <div className="px-5 sm:px-6 py-3 bg-[#f2ebdc] border-b border-[#ded5c2] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#4d402f] flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-[#284229]" />
              Escopo da Análise:
            </span>
            <select
              value={selectedPlantFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#d6ccb8] text-xs font-semibold text-[#2c3328] focus:outline-hidden"
            >
              <option value="all">🌿 Todo o Jardim ({entries.length} registros)</option>
              <option value="general">🌳 Jardim Geral / Canteiro</option>
              {garden.map((p) => (
                <option key={p.id} value={p.id}>
                  🌱 {p.nomePersonalizado} ({p.localizacao || "Vaso"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#6b5e48]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#b45309]" />
              Última Varredura: <strong>{report?.dataAnalise ? new Date(report.dataAnalise).toLocaleDateString("pt-BR") : "Hoje"}</strong>
            </span>
            {report?.faseLunarRecomendadaManejo && (
              <span className="hidden sm:flex items-center gap-1 bg-[#e7ddc8] px-2 py-0.5 rounded-md font-semibold text-[#423727]">
                <Moon className="w-3 h-3 text-[#7854a8]" />
                Manejo Lunar Recomendado
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {isLoading ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#284229] border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                  Inspecionando Fotos & Histórico Fitossanitário...
                </h3>
                <p className="text-xs text-[#6e624e] font-narrative max-w-md mx-auto">
                  A IA Botânica está cruzando registros visuais, padrões de reinfestação por espécie e sintetizando formulações biológicas sob medida.
                </p>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-6 rounded-3xl bg-[#fef2f2] border border-[#fecaca] text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-[#dc2626] mx-auto" />
              <h3 className="font-serif-botanic text-xl font-bold text-[#991b1b]">
                Falha ao Carregar Diagnóstico de Pragas
              </h3>
              <p className="text-xs text-[#7f1d1d]">{errorMsg}</p>
              <button
                onClick={() => runAnalysis(selectedPlantFilter)}
                className="px-4 py-2 rounded-xl bg-[#991b1b] text-white text-xs font-semibold hover:bg-[#7f1d1d] transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : report ? (
            <>
              {/* Executive Overview Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#f5efe3] border border-[#ded5c2] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded5c2] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      report.nivelRiscoJardim === "Crítico"
                        ? "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]"
                        : report.nivelRiscoJardim === "Alto"
                        ? "bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]"
                        : report.nivelRiscoJardim === "Moderado"
                        ? "bg-[#fef9c3] text-[#854d0e] border-[#fef08a]"
                        : "bg-[#e2f0df] text-[#24521f] border-[#b2d9ad]"
                    }`}>
                      Risco Fitossanitário: {report.nivelRiscoJardim}
                    </span>

                    <span className="text-xs text-[#5e523f] font-semibold">
                      {report.totalFotosAnalisadas} fotos analisadas • {report.padroesDetectados.length} padrão(ões) mapeados
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3b6338]">
                    <ShieldCheck className="w-4 h-4 text-[#2d7a32]" />
                    <span>Controle Biológico Sem Agrotóxicos</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#3d3322] font-narrative leading-relaxed">
                  {report.resumoGeral}
                </p>

                {/* Lunar Advice Card */}
                {report.faseLunarRecomendadaManejo && (
                  <div className="p-3.5 rounded-2xl bg-[#ede4d2] border border-[#d6ccb8] flex items-start gap-3 text-xs">
                    <Moon className="w-4 h-4 text-[#7854a8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#382d1c] block">
                        Diretriz Lunar para Aplicações & Podas de Limpeza:
                      </span>
                      <p className="text-[#594d3a] font-narrative mt-0.5">
                        {report.faseLunarRecomendadaManejo}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: DETECTED RECURRENT PEST PATTERNS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f] flex items-center gap-2">
                    <Bug className="w-5 h-5 text-[#b91c1c]" />
                    Padrões Recorrentes & Métodos de Controle Específicos
                  </h3>
                  <span className="text-xs text-[#6e624e]">
                    {report.padroesDetectados.length} pragas / desequilíbrios
                  </span>
                </div>

                {report.padroesDetectados.length === 0 ? (
                  <div className="p-8 text-center bg-[#faf7f2] rounded-3xl border border-[#ded5c2] space-y-2">
                    <ShieldCheck className="w-12 h-12 text-[#2d7a32] mx-auto opacity-70" />
                    <h4 className="font-serif-botanic text-xl font-bold text-[#2e5e2f]">
                      Nenhum padrão crítico de reinfestação detectado!
                    </h4>
                    <p className="text-xs text-[#6e624e] font-narrative max-w-md mx-auto">
                      Seu diário indica equilíbrio fitossanitário positivo. Continue monitorando as folhas e aplicando biofertilizantes orgânicos regularmente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {report.padroesDetectados.map((pattern, pIdx) => {
                      // Find relevant photos from journal matching this pattern
                      const relevantEntries = entries.filter((e) =>
                        pattern.plantasAfetadas.includes(e.plantName || "") ||
                        e.titulo.toLowerCase().includes(pattern.pragaOuPatogeno.toLowerCase()) ||
                        e.descricao.toLowerCase().includes(pattern.pragaOuPatogeno.toLowerCase())
                      );
                      const matchingPhotos = relevantEntries.flatMap((e) => e.fotos || []).slice(0, 4);

                      return (
                        <div
                          key={pIdx}
                          className="bg-white rounded-3xl border-2 border-[#d9ceb9] hover:border-[#284229] p-5 sm:p-7 shadow-sm space-y-6 transition-all"
                        >
                          {/* Pattern Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#ebd8bc] pb-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold uppercase tracking-wider ${
                                  pattern.taxaRecorrencia === "Recorrente Crítica" || pattern.taxaRecorrencia === "Frequente"
                                    ? "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]"
                                    : "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"
                                }`}>
                                  Recorrência: {pattern.taxaRecorrencia}
                                </span>

                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f3ede0] text-[#544834] font-semibold">
                                  {pattern.frequenciaOcorrencias} incidente(s) mapeado(s)
                                </span>
                              </div>

                              <h4 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                                {pattern.pragaOuPatogeno}
                              </h4>
                              {pattern.nomeCientificoPraga && (
                                <span className="text-xs text-[#706450] italic font-serif">
                                  Taxonomia: {pattern.nomeCientificoPraga}
                                </span>
                              )}
                            </div>

                            {/* Affected Plants Tags */}
                            <div className="sm:text-right space-y-1">
                              <span className="text-[11px] font-semibold text-[#665a44] block">
                                Espécies & Plantas Afetadas:
                              </span>
                              <div className="flex flex-wrap sm:justify-end gap-1.5">
                                {pattern.plantasAfetadas.map((pl, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-xl bg-[#eaf3e7] text-[#24521f] text-xs font-semibold border border-[#bfe2b7]"
                                  >
                                    🌱 {pl}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Visual Signatures & Photo Evidence Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left: Symptoms & Predisposing Factors */}
                            <div className="lg:col-span-2 space-y-3.5 text-xs">
                              {/* Photo Diagnosis Note */}
                              {pattern.diagnosticoVisualFotos && (
                                <div className="p-3.5 rounded-2xl bg-[#faf6ed] border border-[#ded5c2] space-y-1">
                                  <span className="font-semibold text-[#382f20] flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-[#2d7a32]" />
                                    Laudo Visual das Evidências Fotográficas:
                                  </span>
                                  <p className="font-narrative text-[#544834] leading-relaxed">
                                    {pattern.diagnosticoVisualFotos}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Symptoms */}
                                <div className="p-3.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] space-y-1.5">
                                  <span className="font-semibold text-[#9a3412] flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Sintomas Detectados nas Folhas:
                                  </span>
                                  <ul className="space-y-1 text-[#7c2d12] font-narrative">
                                    {pattern.sintomasVisuaisDetectados.map((s, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-[#ea580c] font-bold">•</span>
                                        <span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Predisposing Factors */}
                                <div className="p-3.5 rounded-2xl bg-[#fefce8] border border-[#fef08a] space-y-1.5">
                                  <span className="font-semibold text-[#854d0e] flex items-center gap-1">
                                    <Droplets className="w-3.5 h-3.5" />
                                    Fatores do Ambiente que Favorecem:
                                  </span>
                                  <ul className="space-y-1 text-[#713f12] font-narrative">
                                    {pattern.fatoresPropiciosIdentificados.map((f, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-[#ca8a04] font-bold">•</span>
                                        <span>{f}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Right: Attached Photos Thumbnails */}
                            <div className="p-3.5 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-2">
                              <span className="text-[11px] font-semibold text-[#544834] block">
                                Fotos Catalogadas no Diário:
                              </span>
                              {matchingPhotos.length === 0 ? (
                                <div className="text-center py-6 text-[11px] text-[#786b58] font-narrative">
                                  Nenhuma foto anexada nos registros desta praga ainda.
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {matchingPhotos.map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      onClick={() => setZoomedPhotoUrl(imgUrl)}
                                      className="relative group rounded-xl overflow-hidden aspect-square border border-[#d6ccb8] bg-[#e6ddcc] cursor-pointer"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Evidência ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Maximize2 className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* SECTION: SPECIFIC BIOLOGICAL CONTROL METHODS */}
                          <div className="space-y-4 pt-3 border-t border-[#ebd8bc]">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#2d7a32]" />
                              <h5 className="font-serif-botanic text-lg font-bold text-[#1f2e1f]">
                                Prescrição de Controle Biológico Específico para a Espécie
                              </h5>
                            </div>

                            {/* 4 Pillars of Biological Control */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Pillar 1: Natural Predators / Beneficial Insects */}
                              <div className="p-4 rounded-2xl bg-[#eaf4e7] border border-[#c1e2b9] space-y-2">
                                <span className="font-semibold text-[#24521f] flex items-center gap-1.5 text-xs">
                                  🐞 Inimigos Naturais & Predadores Benéficos:
                                </span>
                                <ul className="space-y-1.5 text-[#1b4317] font-narrative">
                                  {pattern.metodosControleBiologico.inimigosNaturais.map((pred, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2d7a32] shrink-0 mt-0.5" />
                                      <span>{pred}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Pillar 2: Companion & Repellent Plants */}
                              <div className="p-4 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] space-y-2">
                                <span className="font-semibold text-[#0369a1] flex items-center gap-1.5 text-xs">
                                  🌿 Plantas Companheiras & Barreiras Repelentes:
                                </span>
                                <ul className="space-y-1.5 text-[#075985] font-narrative">
                                  {pattern.metodosControleBiologico.plantasRepelentesCompanheiras.map((pl, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <Leaf className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                                      <span>{pl}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Pillar 3: Cultural Preventive Practices */}
                              <div className="p-4 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] space-y-2 md:col-span-2">
                                <span className="font-semibold text-[#7e22ce] flex items-center gap-1.5 text-xs">
                                  ✂️ Manejo Cultural & Podas Fitossanitárias:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#6b21a8] font-narrative">
                                  {pattern.metodosControleBiologico.manejoCulturalPreventivo.map((m, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-[#e9d5ff]">
                                      <span className="text-[#a855f7] font-bold">✓</span>
                                      <span>{m}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Pillar 4: Bio-recipes & Organic Sprays (Actionable Cards) */}
                            {pattern.metodosControleBiologico.biopreparadosECaldas.length > 0 && (
                              <div className="space-y-3 pt-2">
                                <span className="text-xs font-bold text-[#4d402f] flex items-center gap-1.5">
                                  <FlaskConical className="w-4 h-4 text-[#a16207]" />
                                  Receitas Caseiras de Caldas & Bioinseticidas Recomendadas:
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {pattern.metodosControleBiologico.biopreparadosECaldas.map((recipe, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="p-4 rounded-2xl bg-[#faf6ed] border border-[#ded5c2] space-y-3 flex flex-col justify-between"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <h6 className="font-serif-botanic text-sm font-bold text-[#1f2e1f]">
                                            {recipe.nome}
                                          </h6>
                                          <span className="px-2 py-0.5 rounded-md bg-[#e3d7c1] text-[10px] font-semibold text-[#4f4330] shrink-0">
                                            100% Orgânica
                                          </span>
                                        </div>

                                        {/* Ingredients */}
                                        <div className="space-y-1">
                                          <span className="text-[11px] font-semibold text-[#665a44] block">
                                            Ingredientes:
                                          </span>
                                          <ul className="text-[11px] text-[#4d402f] space-y-0.5 font-narrative">
                                            {recipe.ingredientes.map((ing, iIdx) => (
                                              <li key={iIdx} className="flex items-center gap-1">
                                                <span className="text-[#2d7a32]">•</span>
                                                <span>{ing}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>

                                        {/* Preparation */}
                                        <div className="space-y-1">
                                          <span className="text-[11px] font-semibold text-[#665a44] block">
                                            Modo de Preparo & Aplicação:
                                          </span>
                                          <p className="text-[11px] text-[#544834] font-narrative leading-relaxed">
                                            {recipe.modoPreparo}
                                          </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#6b5e48] pt-1 border-t border-[#ebd8bc]">
                                          <span>⏰ Frequência: <strong>{recipe.frequenciaAplicacao}</strong></span>
                                          <span>☀️ Horário: <strong>{recipe.horarioIdeal}</strong></span>
                                        </div>
                                      </div>

                                      {/* Quick Action Button */}
                                      {onScheduleBioSpray && (
                                        <button
                                          onClick={() => handleScheduleRecipe(pattern, recipe.nome)}
                                          className="w-full mt-2 py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#182c19] text-[#f7f5ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                                        >
                                          <Calendar className="w-3.5 h-3.5 text-[#a4d495]" />
                                          <span>Agendar Aplicação desta Calda</span>
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Prevention Timeline (Cronograma) */}
                            {pattern.cronogramaPrevencao && pattern.cronogramaPrevencao.length > 0 && (
                              <div className="p-4 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-2 text-xs">
                                <span className="font-semibold text-[#382f20] flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                                  Cronograma de Ação & Bloqueio de Reinfestação:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                  {pattern.cronogramaPrevencao.map((step, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="p-2.5 rounded-xl bg-white border border-[#ded5c2] space-y-1 shadow-2xs"
                                    >
                                      <span className="font-bold text-[11px] text-[#284229] block">
                                        {step.fase}
                                      </span>
                                      <p className="text-[11px] text-[#544834] font-narrative leading-relaxed">
                                        {step.acao}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Master Almanac Botanical Advice Card */}
              {report.conselhoMestreAlmanaque && (
                <div className="p-5 sm:p-6 rounded-3xl bg-[#284229] text-[#f7f5ee] border border-[#3d5e3f] shadow-md space-y-2">
                  <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-[#a4d495]">
                    Sabedoria Ancestral do Mestre do Almanaque
                  </span>
                  <blockquote className="font-serif-botanic text-lg sm:text-xl italic text-white leading-relaxed">
                    "{report.conselhoMestreAlmanaque}"
                  </blockquote>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#f2ebdc] border-t border-[#ded5c2] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-[#6b5e49] font-narrative">
            🌱 Prescrições botânicas 100% orgânicas em conformidade com os ciclos biológicos e lunares.
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#284229] hover:bg-[#182c19] text-white font-semibold transition-colors cursor-pointer"
          >
            Fechar Relatório
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Zoom */}
      {zoomedPhotoUrl && (
        <div
          onClick={() => setZoomedPhotoUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#1a1f18] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-black/60 flex items-center justify-between text-white text-xs">
              <span className="font-mono">Evidência Fotográfica de Campo</span>
              <button
                onClick={() => setZoomedPhotoUrl(null)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex-1 flex items-center justify-center overflow-auto">
              <img
                src={zoomedPhotoUrl}
                alt="Foto em tela cheia"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
