import React, { useState, useMemo } from "react";
import { 
  Sprout, 
  Droplets, 
  Plus, 
  Calendar, 
  MapPin, 
  Trash2, 
  Check, 
  Heart, 
  Edit3, 
  AlertCircle, 
  Sparkles, 
  BookOpen,
  X,
  Scissors,
  Activity,
  Layers,
  Ruler,
  Printer,
  Camera,
  FileText,
  Award,
  TrendingUp
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry, FieldJournalEntry, ScheduledFertilization } from "../types";
import { GardenHealthChart } from "./GardenHealthChart";
import { GardenEfficiencyReport } from "./GardenEfficiencyReport";
import { FertilizationCalendar } from "./FertilizationCalendar";
import { HarvestCalendar } from "./HarvestCalendar";
import { PlantingBedPlanner } from "./PlantingBedPlanner";
import { PlantGrowthStageIndicator, PlantGrowthImageBadge } from "./PlantGrowthStageIndicator";
import { PrintablePlantCards } from "./PrintablePlantCards";
import { FieldJournalView } from "./FieldJournalView";
import { HarvestEstimatorWidget } from "./HarvestEstimatorWidget";
import { getPlantHarvestRecommendation } from "../utils/harvestPlanner";

interface MyGardenViewProps {
  garden: UserPlant[];
  journalEntries?: FieldJournalEntry[];
  scheduledFertilizations?: ScheduledFertilization[];
  onWaterPlant: (plantId: string) => void;
  onRemovePlant: (plantId: string) => void;
  onUpdateNotes: (plantId: string, notes: string) => void;
  onUpdateStatus?: (plantId: string, newStatus: UserPlant["estadoSaude"]) => void;
  onUpdateFertilizationDate?: (plantId: string, dateIso: string) => void;
  onAddNewCustomPlant: (newPlant: Omit<UserPlant, "id">) => void;
  onAddJournalEntry?: (entry: FieldJournalEntry) => void;
  onUpdateJournalEntry?: (entry: FieldJournalEntry) => void;
  onDeleteJournalEntry?: (entryId: string) => void;
  onAddScheduledFertilization?: (schedule: ScheduledFertilization) => void;
  onUpdateScheduledFertilization?: (schedule: ScheduledFertilization) => void;
  onDeleteScheduledFertilization?: (scheduleId: string) => void;
  allSpecies: PlantEntry[];
  onSelectPlantModal: (plant: PlantEntry) => void;
}

export const MyGardenView: React.FC<MyGardenViewProps> = ({
  garden,
  journalEntries = [],
  scheduledFertilizations = [],
  onWaterPlant,
  onRemovePlant,
  onUpdateNotes,
  onUpdateStatus,
  onUpdateFertilizationDate,
  onAddNewCustomPlant,
  onAddJournalEntry,
  onUpdateJournalEntry,
  onDeleteJournalEntry,
  onAddScheduledFertilization,
  onUpdateScheduledFertilization,
  onDeleteScheduledFertilization,
  allSpecies,
  onSelectPlantModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [wateringFilter, setWateringFilter] = useState<"all" | "urgent" | "ok">("all");
  const [activeSubView, setActiveSubView] = useState<"plantas" | "diario" | "colheitas" | "planejador" | "adubacao" | "vitalidade" | "eficiencia" | "cartoes">("plantas");
  const [selectedPrintPlantId, setSelectedPrintPlantId] = useState<string | null>(null);
  const [selectedJournalPlantId, setSelectedJournalPlantId] = useState<string | null>(null);
  const [selectedFertilizationPlantId, setSelectedFertilizationPlantId] = useState<string | null>(null);
  const [selectedEstimatorPlantId, setSelectedEstimatorPlantId] = useState<string | null>(null);

  // New Plant Form State
  const [formData, setFormData] = useState({
    nomePersonalizado: "",
    especieId: "",
    nomeCientifico: "",
    dataPlantio: new Date().toISOString().split("T")[0],
    frequenciaDiasRega: 3,
    localizacao: "Varanda / Jardim",
    estadoSaude: "Vigorosa" as UserPlant["estadoSaude"],
    anotacoes: "",
    imagemUrl: "",
  });

  const handleSpeciesChange = (speciesId: string) => {
    const selected = allSpecies.find((s) => s.id === speciesId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        especieId: selected.id,
        nomePersonalizado: prev.nomePersonalizado || selected.nomePopular,
        nomeCientifico: selected.nomeCientifico,
        imagemUrl: selected.imagemUrl,
        frequenciaDiasRega: selected.frequenciaRega.includes("Diária")
          ? 1
          : selected.frequenciaRega.includes("2 a 3")
          ? 3
          : selected.frequenciaRega.includes("1 vez")
          ? 7
          : 14,
      }));
    }
  };

  const handleSubmitNewPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomePersonalizado.trim()) return;

    onAddNewCustomPlant({
      nomePersonalizado: formData.nomePersonalizado.trim(),
      especieId: formData.especieId || undefined,
      nomeCientifico: formData.nomeCientifico || undefined,
      dataPlantio: formData.dataPlantio || new Date().toISOString().split("T")[0],
      ultimaRega: new Date().toISOString().split("T")[0],
      frequenciaDiasRega: Number(formData.frequenciaDiasRega) || 3,
      localizacao: formData.localizacao || "Jardim",
      estadoSaude: formData.estadoSaude,
      anotacoes: formData.anotacoes || "Planta catalogada no herbanário pessoal.",
      imagemUrl: formData.imagemUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    });

    setIsAddModalOpen(false);
    setFormData({
      nomePersonalizado: "",
      especieId: "",
      nomeCientifico: "",
      dataPlantio: new Date().toISOString().split("T")[0],
      frequenciaDiasRega: 3,
      localizacao: "Varanda / Jardim",
      estadoSaude: "Vigorosa",
      anotacoes: "",
      imagemUrl: "",
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#386634", "#84ab7b", "#f7f2e4"],
    });
  };

  const getWateringStatus = (plant: UserPlant) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWatered = new Date(plant.ultimaRega);
    lastWatered.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - lastWatered.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const daysRemaining = plant.frequenciaDiasRega - diffDays;
    const hydrationPct = Math.max(
      0,
      Math.min(100, Math.round(((plant.frequenciaDiasRega - diffDays) / (plant.frequenciaDiasRega || 1)) * 100))
    );

    if (diffDays === 0) {
      return {
        text: "Regada hoje ✓",
        isUrgent: false,
        isToday: true,
        diffDays,
        daysRemaining: plant.frequenciaDiasRega,
        hydrationPct: 100,
        severity: "ok" as const,
      };
    } else if (daysRemaining < 0) {
      const daysOverdue = Math.abs(daysRemaining);
      return {
        text: `Rega atrasada! (${daysOverdue} dia${daysOverdue > 1 ? "s" : ""} de atraso)`,
        isUrgent: true,
        isToday: false,
        diffDays,
        daysRemaining,
        hydrationPct: 0,
        severity: "critical" as const,
      };
    } else if (daysRemaining === 0) {
      return {
        text: "Rega necessária hoje!",
        isUrgent: true,
        isToday: false,
        diffDays,
        daysRemaining: 0,
        hydrationPct: 15,
        severity: "due" as const,
      };
    } else {
      return {
        text: `Próxima rega em ${daysRemaining} dia${daysRemaining > 1 ? "s" : ""}`,
        isUrgent: false,
        isToday: false,
        diffDays,
        daysRemaining,
        hydrationPct,
        severity: "ok" as const,
      };
    }
  };

  const handleWaterClick = (plantId: string) => {
    onWaterPlant(plantId);
    confetti({
      particleCount: 35,
      spread: 40,
      origin: { y: 0.8 },
      colors: ["#4588ba", "#6ebbe6", "#a8ddf5"],
    });
  };

  const handleWaterAllUrgent = () => {
    const urgentList = garden.filter((p) => getWateringStatus(p).isUrgent);
    urgentList.forEach((p) => onWaterPlant(p.id));
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#bbf7d0"],
    });
  };

  const urgentPlants = garden.filter((p) => getWateringStatus(p).isUrgent);
  const urgentCount = urgentPlants.length;
  const okCount = garden.length - urgentCount;

  const harvestRecommendations = garden.map((p) => getPlantHarvestRecommendation(p, allSpecies));
  const readyToHarvestCount = harvestRecommendations.filter((r) => r.isHarvestable && r.currentMoonIsOptimal && r.isMature).length;
  const totalHarvestableCount = harvestRecommendations.filter((r) => r.isHarvestable).length;

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const dueFertilizationsCount = useMemo(() => {
    return scheduledFertilizations.filter(
      (s) => s.status === "Atrasada" || (s.status !== "Concluída" && s.dataAgendada <= todayStr)
    ).length;
  }, [scheduledFertilizations, todayStr]);

  const filteredGarden = garden.filter((plant) => {
    const st = getWateringStatus(plant);
    if (wateringFilter === "urgent") return st.isUrgent;
    if (wateringFilter === "ok") return !st.isUrgent;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Garden Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#233825] via-[#2f4931] to-[#1c2c1c] text-[#f7f3e8] p-6 sm:p-10 border border-[#3e5e3f] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18291a] text-[#bce3b2] text-xs font-semibold uppercase tracking-wider border border-[#375939]">
              <Sprout className="w-3.5 h-3.5" />
              <span>Diário de Cultivo & Herbanário Pessoal</span>
            </div>

            <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight text-[#f4efe4]">
              Meu Jardim Vivo
            </h1>

            <p className="text-sm sm:text-base text-[#d8cfbe] font-narrative leading-relaxed">
              Monitore a rotina de rega, datas de plantio, histórico de podas, nutrição do solo e datas ideais de colheita medicinal.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => {
                setSelectedPrintPlantId(null);
                setActiveSubView("cartoes");
              }}
              className="px-4 py-3 rounded-2xl bg-[#375239] hover:bg-[#436445] text-[#f7f5ee] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-[#527754] cursor-pointer whitespace-nowrap"
              title="Gerar cartões e etiquetas imprimíveis para as plantas"
            >
              <Printer className="w-4 h-4 text-[#a4d495]" />
              <span>Imprimir Cartões</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#a4d495] hover:bg-[#b8e5aa] text-[#19331a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Plantar Nova Espécie</span>
            </button>
          </div>
        </div>
      </div>

      {/* Garden Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0ebd9] p-1.5 rounded-2xl border border-[#ded4be] shadow-2xs">
        <button
          onClick={() => setActiveSubView("plantas")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "plantas"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Sprout className={`w-4 h-4 ${activeSubView === "plantas" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Minhas Plantas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubView === "plantas" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
          }`}>
            {garden.length}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedJournalPlantId(null);
            setActiveSubView("diario");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "diario"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Camera className={`w-4 h-4 ${activeSubView === "diario" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Diário de Campo</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubView === "diario" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
          }`}>
            {journalEntries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubView("colheitas")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "colheitas"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Scissors className={`w-4 h-4 ${activeSubView === "colheitas" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Colheitas Lunares</span>
          {readyToHarvestCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e5ca78] text-[#33240d] animate-pulse">
              {readyToHarvestCount} hoje!
            </span>
          ) : totalHarvestableCount > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubView === "colheitas" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
            }`}>
              {totalHarvestableCount}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveSubView("planejador")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "planejador"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Ruler className={`w-4 h-4 ${activeSubView === "planejador" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Planejador de Canteiros</span>
        </button>

        <button
          onClick={() => {
            setSelectedFertilizationPlantId(null);
            setActiveSubView("adubacao");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "adubacao"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeSubView === "adubacao" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Adubação & Solo</span>
          {dueFertilizationsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6983b] text-[#ffffff] animate-pulse">
              {dueFertilizationsCount} alerta(s)
            </span>
          ) : scheduledFertilizations.length > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubView === "adubacao" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
            }`}>
              {scheduledFertilizations.filter((s) => s.status !== "Concluída").length}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveSubView("vitalidade")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "vitalidade"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Activity className={`w-4 h-4 ${activeSubView === "vitalidade" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Monitor de Saúde</span>
        </button>

        <button
          onClick={() => setActiveSubView("eficiencia")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "eficiencia"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Award className={`w-4 h-4 ${activeSubView === "eficiencia" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Relatório de Eficiência</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeSubView === "eficiencia" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
          }`}>
            Novo
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedPrintPlantId(null);
            setActiveSubView("cartoes");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeSubView === "cartoes"
              ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
              : "text-[#544834] hover:bg-[#e4dcce]"
          }`}
        >
          <Printer className={`w-4 h-4 ${activeSubView === "cartoes" ? "text-[#a4d495]" : "text-[#7a6b54]"}`} />
          <span>Cartões Imprimíveis</span>
        </button>
      </div>

      {/* SubViews Rendering */}
      {/* SubView: Diário de Campo */}
      {activeSubView === "diario" && (
        <FieldJournalView
          garden={garden}
          allSpecies={allSpecies}
          entries={journalEntries}
          onAddEntry={(entry) => {
            if (onAddJournalEntry) onAddJournalEntry(entry);
          }}
          onUpdateEntry={(entry) => {
            if (onUpdateJournalEntry) onUpdateJournalEntry(entry);
          }}
          onDeleteEntry={(entryId) => {
            if (onDeleteJournalEntry) onDeleteJournalEntry(entryId);
          }}
          onUpdatePlantStatus={onUpdateStatus}
          onScheduleBioSpray={(plantId, plantName, sprayName, notes) => {
            if (onAddScheduledFertilization) {
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + 1);
              onAddScheduledFertilization({
                id: `bio-spray-${Date.now()}`,
                userPlantId: plantId,
                plantName: plantName,
                dataAgendada: nextDate.toISOString().split("T")[0],
                horaAgendada: "17:30",
                tipoAdubo: sprayName,
                modoAplicacao: "Pulverização foliar ao entardecer (Controle Biológico)",
                dosagem: "Conforme laudo fitossanitário da IA",
                faseLunarRecomendada: "Lua Minguante",
                observacoes: notes || "Controle biológico preventivo gerado pela IA no Diário de Campo",
                status: "Pendente",
                criadoEm: new Date().toISOString(),
              });
            }
          }}
          initialSelectedPlantId={selectedJournalPlantId}
          onClose={() => {
            setSelectedJournalPlantId(null);
            setActiveSubView("plantas");
          }}
        />
      )}

      {/* SubView: Cartões Imprimíveis */}
      {activeSubView === "cartoes" && (
        <PrintablePlantCards
          garden={garden}
          allSpecies={allSpecies}
          initialSelectedPlantId={selectedPrintPlantId}
          onClose={() => {
            setSelectedPrintPlantId(null);
            setActiveSubView("plantas");
          }}
          onSelectPlantModal={onSelectPlantModal}
        />
      )}

      {/* SubView: Colheitas Lunares */}
      {activeSubView === "colheitas" && (
        <HarvestCalendar
          garden={garden}
          allSpecies={allSpecies}
          onSelectPlantModal={onSelectPlantModal}
          onUpdateNotes={onUpdateNotes}
        />
      )}

      {/* SubView: Planejador de Canteiros & Espaçamento */}
      {activeSubView === "planejador" && (
        <PlantingBedPlanner
          allSpecies={allSpecies}
          garden={garden}
          onAddPlannedPlantToGarden={(plant, notes) => {
            onAddNewCustomPlant({
              nomePersonalizado: plant.nomePopular,
              especieId: plant.id,
              nomeCientifico: plant.nomeCientifico,
              dataPlantio: new Date().toISOString().split("T")[0],
              ultimaRega: new Date().toISOString().split("T")[0],
              frequenciaDiasRega: 4,
              localizacao: "Canteiro Planejado",
              estadoSaude: "Vigorosa",
              anotacoes: notes || `Espaçamento calculado no planejador de canteiros.`,
              imagemUrl: plant.imagemUrl,
            });
          }}
          onSelectPlantModal={onSelectPlantModal}
        />
      )}

      {/* SubView: Adubação & Fertilização */}
      {activeSubView === "adubacao" && (
        <FertilizationCalendar
          garden={garden}
          allSpecies={allSpecies}
          scheduledFertilizations={scheduledFertilizations}
          onAddScheduledFertilization={onAddScheduledFertilization}
          onUpdateScheduledFertilization={onUpdateScheduledFertilization}
          onDeleteScheduledFertilization={onDeleteScheduledFertilization}
          onUpdateFertilizationDate={onUpdateFertilizationDate}
          initialSelectedPlantId={selectedFertilizationPlantId}
        />
      )}

      {/* SubView: Vitalidade e Gráficos */}
      {activeSubView === "vitalidade" && (
        <GardenHealthChart 
          garden={garden} 
          allSpecies={allSpecies}
          onUpdatePlantStatus={onUpdateStatus}
          onUpdateFertilizationDate={onUpdateFertilizationDate}
        />
      )}

      {/* SubView: Relatório de Eficiência do Jardim */}
      {activeSubView === "eficiencia" && (
        <GardenEfficiencyReport
          garden={garden}
          allSpecies={allSpecies}
          journalEntries={journalEntries}
          scheduledFertilizations={scheduledFertilizations}
          onWaterPlant={onWaterPlant}
          onUpdateFertilizationDate={onUpdateFertilizationDate}
          onUpdatePlantStatus={onUpdateStatus}
        />
      )}

      {/* SubView: Minhas Plantas (Default) */}
      {activeSubView === "plantas" && (
        garden.length === 0 ? (
          <div className="text-center py-16 bg-[#f7f2e7] rounded-3xl border border-[#ded5c2] p-8 space-y-4">
            <Sprout className="w-14 h-14 text-[#8a7c64] mx-auto opacity-70" />
            <h3 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#3d3527]">
              Seu herbanário ainda está vazio
            </h3>
            <p className="text-sm text-[#665a45] max-w-md mx-auto font-narrative">
              Explore a <strong>Enciclopédia Botânica</strong> para adicionar espécies ao seu jardim ou clique no botão acima para cadastrar sua primeira planta!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f4ee] text-xs font-semibold transition-colors cursor-pointer"
            >
              Adicionar Minha Primeira Planta
            </button>
          </div>
        ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Recharts Health State & Fertilization Line Chart Monitor */}
              <GardenHealthChart 
                garden={garden} 
                allSpecies={allSpecies}
                onUpdatePlantStatus={onUpdateStatus}
                onUpdateFertilizationDate={onUpdateFertilizationDate}
              />

              {/* Urgent Watering Visual Alert Banner */}
              {urgentCount > 0 && (
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#fae8e4] via-[#fdf2f0] to-[#f7dfdb] border-2 border-[#e07565] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-[#c93b28] text-white shrink-0 shadow-sm animate-bounce">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#8c2214]">
                          Aviso de Irrigação Pendente
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c93b28] text-white">
                          {urgentCount} {urgentCount === 1 ? "planta" : "plantas"}
                        </span>
                      </div>
                      <h3 className="font-serif-botanic text-lg sm:text-xl font-bold text-[#451610]">
                        {urgentCount === 1
                          ? "Uma planta do seu herbanário precisa de rega urgente hoje!"
                          : `${urgentCount} plantas do seu herbanário atingiram ou ultrapassaram o ciclo de rega!`}
                      </h3>
                      <p className="text-xs text-[#733026] font-narrative">
                        Mantenha a hidratação das raízes para preservar o vigor celular e a absorção de nutrientes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleWaterAllUrgent}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c93b28] hover:bg-[#a82a19] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 cursor-pointer whitespace-nowrap"
                    >
                      <Droplets className="w-4 h-4" />
                      <span>Regar Todas ({urgentCount})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section Heading & Watering Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h2 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                    Espécimes Plantados ({garden.length})
                  </h2>
                  <p className="text-xs text-[#6e624e] font-narrative">
                    Acompanhe as regas, nível de hidratação e anotações de manejo diário.
                  </p>
                </div>

                {/* Watering Status Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#ede4d2] p-1 rounded-2xl border border-[#d6ccb8] self-start sm:self-auto">
                  <button
                    onClick={() => setWateringFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      wateringFilter === "all"
                        ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                        : "text-[#594d3a] hover:bg-[#ded4be]"
                    }`}
                  >
                    Todas ({garden.length})
                  </button>
                  <button
                    onClick={() => setWateringFilter("urgent")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      wateringFilter === "urgent"
                        ? "bg-[#c93b28] text-white shadow-xs"
                        : "text-[#8c291c] hover:bg-[#fad8d3]"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Regas Pendentes ({urgentCount})</span>
                  </button>
                  <button
                    onClick={() => setWateringFilter("ok")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      wateringFilter === "ok"
                        ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                        : "text-[#594d3a] hover:bg-[#ded4be]"
                    }`}
                  >
                    Hidratadas ({okCount})
                  </button>
                </div>
              </div>

          {/* Garden Plant Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarden.map((plant) => {
              const status = getWateringStatus(plant);
              const isEditing = editingPlantId === plant.id;
              const originalSpecimen = plant.especieId
                ? allSpecies.find((s) => s.id === plant.especieId)
                : null;

              return (
                <div
                  key={plant.id}
                  className={`bg-[#faf7f2] rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                    status.isUrgent
                      ? "border-2 border-[#d9534f] ring-3 ring-[#d9534f]/20 shadow-md shadow-[#d9534f]/10"
                      : "border border-[#ded5c2]"
                  }`}
                >
                  {/* Header Image Plate */}
                  <div className="relative h-48 bg-[#ebe4d3] overflow-hidden">
                    <img
                      src={
                        plant.imagemUrl ||
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={plant.nomePersonalizado}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Health State Badge / Select */}
                    <div className="absolute top-3 left-3">
                      {onUpdateStatus ? (
                        <select
                          value={plant.estadoSaude}
                          onChange={(e) =>
                            onUpdateStatus(plant.id, e.target.value as UserPlant["estadoSaude"])
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border focus:outline-hidden backdrop-blur-md ${
                            plant.estadoSaude === "Vigorosa"
                              ? "bg-[#254d24]/90 text-[#bce8b7] border-[#3e753c]"
                              : plant.estadoSaude === "Estável"
                              ? "bg-[#453c25]/90 text-[#e8dbb7] border-[#6b5d3a]"
                              : "bg-[#542823]/90 text-[#f5bfb8] border-[#7d3f37]"
                          }`}
                          title="Alterar estado de saúde"
                        >
                          <option value="Vigorosa" className="bg-[#254d24] text-white">● Vigorosa</option>
                          <option value="Estável" className="bg-[#453c25] text-white">● Estável</option>
                          <option value="Necessita Atenção" className="bg-[#542823] text-white">● Necessita Atenção</option>
                          <option value="Em Recuperação" className="bg-[#214354] text-white">● Em Recuperação</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            plant.estadoSaude === "Vigorosa"
                              ? "bg-[#254d24]/90 text-[#bce8b7] border border-[#3e753c]"
                              : plant.estadoSaude === "Estável"
                              ? "bg-[#453c25]/90 text-[#e8dbb7] border border-[#6b5d3a]"
                              : "bg-[#542823]/90 text-[#f5bfb8] border border-[#7d3f37]"
                          }`}
                        >
                          ● {plant.estadoSaude}
                        </span>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => onRemovePlant(plant.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-[#852c21] text-white transition-colors cursor-pointer"
                      title="Remover do herbanário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Growth Stage Badge Over Image */}
                    <div className="absolute top-3 right-12 flex items-center gap-1.5">
                      <PlantGrowthImageBadge dataPlantio={plant.dataPlantio} />
                      {status.isUrgent && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d93829] text-white border border-[#ff8f82] shadow-sm flex items-center gap-1 animate-pulse">
                          <Droplets className="w-3 h-3" />
                          Rega Urgente
                        </span>
                      )}
                    </div>

                    {/* Plant Names */}
                    <div className="absolute bottom-3 left-3 right-3 text-[#fbf8f2]">
                      <h3 className="font-serif-botanic text-2xl font-bold leading-tight">
                        {plant.nomePersonalizado}
                      </h3>
                      {plant.nomeCientifico && (
                        <p className="text-xs text-[#dcd2be] font-narrative italic">
                          {plant.nomeCientifico}
                        </p>
                      )}
                    </div>
                  </div>

                {/* Plant Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Plant Location & Date planted */}
                    <div className="flex items-center justify-between text-xs text-[#6e624d]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#3b6637]" />
                        {plant.localizacao}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#3b6637]" />
                        Desde {new Date(plant.dataPlantio).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {/* Animated Botanical Growth Stage Indicator */}
                    <PlantGrowthStageIndicator
                      dataPlantio={plant.dataPlantio}
                      plantSpecies={originalSpecimen}
                      nomePlanta={plant.nomePersonalizado}
                    />

                    {/* Hydration Bar & Watering Status Card */}
                    <div
                      className={`p-3.5 rounded-2xl space-y-2 border transition-all ${
                        status.isUrgent
                          ? "bg-[#faeee9] border-[#e89082]"
                          : "bg-[#f2ece0] border-[#ded5c2]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Droplets
                            className={`w-4 h-4 ${
                              status.isUrgent
                                ? "text-[#c93b28] animate-bounce"
                                : "text-[#2e7d32]"
                            }`}
                          />
                          <span className="text-[11px] font-bold tracking-wider uppercase font-cinzel text-[#4a3f2d]">
                            {status.isUrgent ? "Alerta de Rega" : "Ciclo de Rega"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            status.isUrgent
                              ? "text-[#c93b28] animate-pulse"
                              : "text-[#2a4d28]"
                          }`}
                        >
                          {status.text}
                        </span>
                      </div>

                      {/* Soil Hydration Progress Meter */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#706450] font-mono">
                          <span>Umidade do substrato estimada</span>
                          <span className="font-bold">{status.hydrationPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#dfd4be] overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              status.hydrationPct <= 20
                                ? "bg-[#c93b28]"
                                : status.hydrationPct <= 50
                                ? "bg-[#d4a017]"
                                : "bg-[#367d39]"
                            }`}
                            style={{ width: `${status.hydrationPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#7a6d59]">
                        <span>Frequência: a cada {plant.frequenciaDiasRega} dias</span>
                        <span>Última rega: {new Date(plant.ultimaRega).toLocaleDateString("pt-BR")}</span>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleWaterClick(plant.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 ${
                            status.isUrgent
                              ? "bg-[#c93b28] hover:bg-[#a82a19] text-white shadow-md"
                              : status.isToday
                              ? "bg-[#d8edd3] text-[#1c401d]"
                              : "bg-[#2b688c] hover:bg-[#1f506e] text-white"
                          }`}
                        >
                          <Droplets className="w-4 h-4" />
                          <span>{status.isToday ? "Regada hoje ✓ (Regar Novamente)" : "Regar Agora"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Notes & Journaling */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#63553e]">
                          Caderno de Notas
                        </span>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              onUpdateNotes(plant.id, tempNotes);
                              setEditingPlantId(null);
                            } else {
                              setTempNotes(plant.anotacoes);
                              setEditingPlantId(plant.id);
                            }
                          }}
                          className="text-[11px] text-[#345c32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isEditing ? "Salvar" : "Editar"}</span>
                        </button>
                      </div>

                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden resize-none"
                        />
                      ) : (
                        <p className="text-xs text-[#4f4433] font-narrative bg-[#f7f2e7] p-2.5 rounded-xl border border-[#ded5c2] leading-relaxed">
                          {plant.anotacoes || "Nenhuma anotação registrada ainda."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Specimen Sheet link, Journal & Print Card Actions */}
                  <div className="pt-2 border-t border-[#ebe3d3] flex flex-wrap items-center justify-between gap-1.5">
                    {originalSpecimen ? (
                      <button
                        onClick={() => onSelectPlantModal(originalSpecimen)}
                        className="py-1.5 px-2 text-xs text-[#31572f] font-semibold hover:underline flex items-center gap-1 cursor-pointer truncate"
                        title="Abrir monografia botânica completa"
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Ver Ficha</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedFertilizationPlantId(plant.id);
                          setActiveSubView("adubacao");
                        }}
                        className="py-1.5 px-2 rounded-lg bg-[#fbf3e4] hover:bg-[#f3e4c8] text-xs text-[#704618] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        title="Agendar ou ver adubações para esta planta"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#a86824]" />
                        <span>Adubar</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedJournalPlantId(plant.id);
                          setActiveSubView("diario");
                        }}
                        className="py-1.5 px-2 rounded-lg bg-[#e2eedf] hover:bg-[#d0e5cc] text-xs text-[#1c4d1e] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        title="Registrar observação no Diário de Campo para esta planta"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#285e2b]" />
                        <span>Diário</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPrintPlantId(plant.id);
                          setActiveSubView("cartoes");
                        }}
                        className="py-1.5 px-2 rounded-lg bg-[#ede4d2] hover:bg-[#dfd4bd] text-xs text-[#423727] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        title="Gerar e imprimir cartão de instrução para esta planta"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#2d592a]" />
                        <span>Cartão</span>
                      </button>

                      <button
                        onClick={() => setSelectedEstimatorPlantId(plant.id)}
                        className="py-1.5 px-2 rounded-lg bg-[#fef8e7] hover:bg-[#faeed0] text-xs text-[#854d0e] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 border border-[#fde68a]"
                        title="Simular e estimar data de colheita e janela lunar para este espécime"
                      >
                        <Scissors className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>Colheita</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ))}

      {/* Add New Plant Modal with Embedded Interactive Harvest Estimator */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#faf7f2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#ded5c2] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ded5c2] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e3f0df] text-[#224f21] text-[11px] font-semibold mb-1">
                  <Sprout className="w-3.5 h-3.5 text-[#2d7a32]" />
                  <span>Novo Registro Botânico</span>
                </div>
                <h3 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
                  Plantar Nova Espécie no Herbanário
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewPlant} className="space-y-5">
              {/* Preset species selector */}
              <div>
                <label className="text-xs font-bold text-[#423625] block mb-1">
                  Vincular a uma Espécie da Enciclopédia Botânica
                </label>
                <select
                  value={formData.especieId}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
                >
                  <option value="">-- Cadastrar planta personalizada ou herbácea livre --</option>
                  {allSpecies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomePopular} ({s.nomeCientifico}) • {s.categoria} [{s.ciclo}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Plant Name & Planting Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#423625] block mb-1">
                    Nome da Planta ou Apelido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alecrim do Canteiro Norte, Camomila..."
                    value={formData.nomePersonalizado}
                    onChange={(e) =>
                      setFormData({ ...formData, nomePersonalizado: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#423625] block mb-1">
                    Data do Plantio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dataPlantio}
                    onChange={(e) =>
                      setFormData({ ...formData, dataPlantio: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              {/* INTERACTIVE HARVEST ESTIMATOR WIDGET */}
              <div className="space-y-1.5">
                <HarvestEstimatorWidget
                  dataPlantio={formData.dataPlantio}
                  species={allSpecies.find((s) => s.id === formData.especieId)}
                  customPlantName={formData.nomePersonalizado}
                  onChangePlantingDate={(newDate) =>
                    setFormData((prev) => ({ ...prev, dataPlantio: newDate }))
                  }
                  onApplyToNotes={(formattedText) => {
                    setFormData((prev) => ({
                      ...prev,
                      anotacoes: prev.anotacoes
                        ? `${prev.anotacoes}\n\n${formattedText}`
                        : formattedText,
                    }));
                  }}
                  onScheduleHarvestEvent={(est) => {
                    if (onAddScheduledFertilization) {
                      onAddScheduledFertilization({
                        id: `harvest-plan-${Date.now()}`,
                        userPlantId: `temp-${Date.now()}`,
                        plantName: formData.nomePersonalizado || "Nova Planta",
                        dataAgendada: est.estimatedHarvestDate,
                        horaAgendada: "08:30",
                        tipoAdubo: `Colheita: ${est.targetPart}`,
                        modoAplicacao: `Colheita na ${est.nearestOptimalLunarWindow.phaseName} (${est.bestHarvestTime})`,
                        dosagem: est.harvestTechnique,
                        faseLunarRecomendada: est.idealLunarPhase,
                        observacoes: `Estimativa gerada pelo Almanaque: ${est.activePrinciplesFocus}`,
                        status: "Pendente",
                        criadoEm: new Date().toISOString(),
                      });
                    }
                  }}
                  defaultExpanded={true}
                />
              </div>

              {/* Location & Watering Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#544834] block mb-1">
                    Localização no Jardim
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Varanda, Canteiro 1, Janela"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#544834] block mb-1">
                    Intervalo de Rega (Dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.frequenciaDiasRega}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequenciaDiasRega: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Health State */}
              <div>
                <label className="text-xs font-semibold text-[#544834] block mb-1">
                  Estado Inicial de Saúde
                </label>
                <select
                  value={formData.estadoSaude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estadoSaude: e.target.value as UserPlant["estadoSaude"],
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
                >
                  <option value="Vigorosa">Vigorosa (Brotando e sadia)</option>
                  <option value="Estável">Estável (Sem alterações)</option>
                  <option value="Necessita Atenção">Necessita Atenção (Manchas ou pragas)</option>
                  <option value="Em Recuperação">Em Recuperação (Após poda/adubo)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#544834] block mb-1">
                  Anotações Iniciais do Diário
                </label>
                <textarea
                  rows={3}
                  placeholder="Tipo de substrato, notas de plantio, previsão de colheita inserida..."
                  value={formData.anotacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, anotacoes: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden resize-none font-narrative"
                />
              </div>

              <div className="pt-4 border-t border-[#ded5c2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#ede5d5] hover:bg-[#ded4bf] text-xs font-semibold text-[#524633] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#284229] hover:bg-[#192f1a] text-xs font-bold text-[#f7f5ee] cursor-pointer shadow-md hover:scale-102 transition-all"
                >
                  Confirmar Plantio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDALONE HARVEST ESTIMATOR MODAL FOR EXISTING PLANTS */}
      {selectedEstimatorPlantId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          {(() => {
            const plant = garden.find((p) => p.id === selectedEstimatorPlantId);
            if (!plant) return null;
            const species = allSpecies.find(
              (s) => s.id === plant.especieId || s.nomePopular.toLowerCase() === plant.nomePersonalizado.toLowerCase()
            );

            return (
              <div className="bg-[#faf7f2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#ded5c2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#ded5c2] pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={plant.imagemUrl || species?.imagemUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80"}
                      alt={plant.nomePersonalizado}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#c5b89e]"
                    />
                    <div>
                      <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                        {plant.nomePersonalizado}
                      </h3>
                      <p className="text-xs text-[#6e5f49] italic font-narrative">
                        {plant.nomeCientifico || species?.nomeCientifico || "Espécie herbácea"} • Plantada em{" "}
                        {new Date(plant.dataPlantio).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEstimatorPlantId(null)}
                    className="p-1.5 rounded-xl bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <HarvestEstimatorWidget
                  dataPlantio={plant.dataPlantio}
                  species={species}
                  customPlantName={plant.nomePersonalizado}
                  onApplyToNotes={(formattedText) => {
                    const updated = plant.anotacoes ? `${plant.anotacoes}\n\n${formattedText}` : formattedText;
                    onUpdateNotes(plant.id, updated);
                  }}
                  onScheduleHarvestEvent={(est) => {
                    if (onAddScheduledFertilization) {
                      onAddScheduledFertilization({
                        id: `harvest-plan-${Date.now()}`,
                        userPlantId: plant.id,
                        plantName: plant.nomePersonalizado,
                        dataAgendada: est.estimatedHarvestDate,
                        horaAgendada: "08:30",
                        tipoAdubo: `Colheita: ${est.targetPart}`,
                        modoAplicacao: `Colheita na ${est.nearestOptimalLunarWindow.phaseName} (${est.bestHarvestTime})`,
                        dosagem: est.harvestTechnique,
                        faseLunarRecomendada: est.idealLunarPhase,
                        observacoes: `Estimativa calculada pelo Almanaque: ${est.activePrinciplesFocus}`,
                        status: "Pendente",
                        criadoEm: new Date().toISOString(),
                      });
                    }
                  }}
                  defaultExpanded={true}
                />

                <div className="pt-3 border-t border-[#ded5c2] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedEstimatorPlantId(null)}
                    className="px-5 py-2 rounded-xl bg-[#284229] hover:bg-[#192f1a] text-xs font-semibold text-[#f7f5ee] cursor-pointer"
                  >
                    Fechar Simulador
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
