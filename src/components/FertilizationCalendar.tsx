import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
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
  Droplets,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarCheck,
  RotateCcw,
  Info,
  Layers,
  ArrowRight,
  BookmarkPlus,
  Send
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry, ScheduledFertilization } from "../types";

interface FertilizationCalendarProps {
  garden: UserPlant[];
  allSpecies: PlantEntry[];
  scheduledFertilizations?: ScheduledFertilization[];
  onAddScheduledFertilization?: (schedule: ScheduledFertilization) => void;
  onUpdateScheduledFertilization?: (schedule: ScheduledFertilization) => void;
  onDeleteScheduledFertilization?: (scheduleId: string) => void;
  onUpdateFertilizationDate?: (plantId: string, dateIso: string) => void;
  initialSelectedPlantId?: string | null;
}

// Preset Organic Fertilizers with recommended instructions & dosages
const FERTILIZER_PRESETS = [
  {
    nome: "Bokashi Orgânico Fermentado",
    tipo: "Composto Fermentado",
    nutriente: "Nitrogênio, Micronutrientes e Microrganismos Eficientes",
    dose: "1 a 2 colheres de sopa por vaso (5L)",
    modo: "Incorporação leve na borda do vaso",
    faseLunar: "Lua Nova ou Crescente",
    indicacao: "Todas as plantas, renovação da microbiota do solo.",
  },
  {
    nome: "Húmus de Minhoca Puro",
    tipo: "Matéria Orgânica Viva",
    nutriente: "Ácidos fúlvicos, húmicos e Nitrogênio suave",
    dose: "2 a 3 colheres de sopa na superfície",
    modo: "Cobertura superficial e rega em seguida",
    faseLunar: "Lua Crescente",
    indicacao: "Hortaliças, folhagens tropicais e plantas em vaso.",
  },
  {
    nome: "Calda de Casca de Banana (K)",
    tipo: "Biofertilizante Líquido",
    nutriente: "Potássio (K), Fósforo e Magnésio",
    dose: "100ml de calda diluída (1:10) por vaso",
    modo: "Fertirrigação no início da manhã",
    faseLunar: "Lua Cheia",
    indicacao: "Plantas com flores, frutos, alecrim e lavanda.",
  },
  {
    nome: "Farinha de Casca de Ovo Calcinada (Ca)",
    tipo: "Mineral Orgânico",
    nutriente: "Cálcio (Ca) e Carbonatos",
    dose: "1 colher de chá na borda do vaso",
    modo: "Incorporação rasa no solo",
    faseLunar: "Lua Minguante ou Nova",
    indicacao: "Tomates, pimentas, suculentas e prevenção de podridão apical.",
  },
  {
    nome: "Cinzas de Lenha Pura (K + Minerais)",
    tipo: "Corretivo & Nutriente",
    nutriente: "Potássio, Fósforo, Cálcio e Silício",
    dose: "1 colher de café polvilhada no solo",
    modo: "Polvilhamento com rega subsequente",
    faseLunar: "Lua Minguante",
    indicacao: "Ervas aromáticas e correção de solos excessivamente ácidos.",
  },
  {
    nome: "Esterco Bovino/Aves Bem Curtido",
    tipo: "Adubo Orgânico Pesado",
    nutriente: "Nitrogênio orgânico concentrado e Fósforo",
    dose: "1 a 2 colheres de sopa bem misturadas",
    modo: "Incorporação em coroa na borda (longe do caule)",
    faseLunar: "Lua Nova",
    indicacao: "Árvores nativas, arbustos e canteiros no chão.",
  },
  {
    nome: "Biofertilizante Foliar de Algas / Ervas",
    tipo: "Adubo Foliar",
    nutriente: "Micronutrientes quelatizados e Fitohormônios",
    dose: "Pulverização fina sobre as folhas",
    modo: "Pulverização foliar nas primeiras horas do dia",
    faseLunar: "Lua Crescente",
    indicacao: "Plantas em brotação, orquídeas e folhagens exigentes.",
  },
  {
    nome: "Farinha de Ossos / Fosfatagem Orgânica",
    tipo: "Fósforo de Liberação Lenta",
    nutriente: "Fósforo (P) e Cálcio (Ca)",
    dose: "1 colher de sopa por vaso médio",
    modo: "Incorporação profunda antes do plantio ou na borda",
    faseLunar: "Lua Minguante",
    indicacao: "Fortalecimento radicular e florações intensas.",
  },
];

// Current Season Calculation (Southern Hemisphere / Brazil)
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

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
  scheduledFertilizations = [],
  onAddScheduledFertilization,
  onUpdateScheduledFertilization,
  onDeleteScheduledFertilization,
  onUpdateFertilizationDate,
  initialSelectedPlantId,
}) => {
  const currentSeason = useMemo(() => getCurrentSeason(), []);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<"agenda" | "calendario" | "sazonal" | "receitas">("agenda");
  const [filterStatus, setFilterStatus] = useState<"todos" | "hoje" | "pendentes" | "concluidas">("todos");
  const [filterPlantId, setFilterPlantId] = useState<string>("all");

  // Modal / Form state for Scheduling
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledFertilization | null>(null);

  // Calendar View month navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(todayStr);

  // Browser notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [notificationSentMessage, setNotificationSentMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userPlantId: initialSelectedPlantId || (garden[0]?.id || "general"),
    dataAgendada: todayStr,
    horaAgendada: "08:00",
    tipoAdubo: FERTILIZER_PRESETS[0].nome,
    modoAplicacao: FERTILIZER_PRESETS[0].modo,
    dosagem: FERTILIZER_PRESETS[0].dose,
    faseLunarRecomendada: FERTILIZER_PRESETS[0].faseLunar,
    observacoes: "",
  });

  // Calculate status for each schedule (Today, Pending, Overdue, Completed)
  const schedulesWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return scheduledFertilizations.map((item) => {
      if (item.status === "Concluída") {
        return item;
      }
      const itemDate = new Date(item.dataAgendada + "T00:00:00");
      itemDate.setHours(0, 0, 0, 0);

      let calculatedStatus: "Pendente" | "Concluída" | "Atrasada" = "Pendente";
      if (itemDate.getTime() < today.getTime()) {
        calculatedStatus = "Atrasada";
      }

      return {
        ...item,
        status: calculatedStatus,
      };
    });
  }, [scheduledFertilizations]);

  // Due today / overdue count
  const dueTodaySchedules = useMemo(() => {
    return schedulesWithStatus.filter(
      (s) => s.status !== "Concluída" && s.dataAgendada === todayStr
    );
  }, [schedulesWithStatus, todayStr]);

  const overdueSchedules = useMemo(() => {
    return schedulesWithStatus.filter((s) => s.status === "Atrasada");
  }, [schedulesWithStatus]);

  const pendingSchedules = useMemo(() => {
    return schedulesWithStatus.filter((s) => s.status === "Pendente" || s.status === "Atrasada");
  }, [schedulesWithStatus]);

  const completedSchedules = useMemo(() => {
    return schedulesWithStatus.filter((s) => s.status === "Concluída");
  }, [schedulesWithStatus]);

  // Filtered schedules for Agenda list view
  const filteredSchedules = useMemo(() => {
    return schedulesWithStatus.filter((item) => {
      // Plant Filter
      if (filterPlantId !== "all" && item.userPlantId !== filterPlantId) {
        return false;
      }

      // Status Filter
      if (filterStatus === "hoje") {
        return (item.dataAgendada === todayStr && item.status !== "Concluída") || item.status === "Atrasada";
      }
      if (filterStatus === "pendentes") {
        return item.status === "Pendente" || item.status === "Atrasada";
      }
      if (filterStatus === "concluidas") {
        return item.status === "Concluída";
      }
      return true;
    }).sort((a, b) => {
      // Sort: Overdue & Today first, then closest date, completed last
      if (a.status === "Concluída" && b.status !== "Concluída") return 1;
      if (a.status !== "Concluída" && b.status === "Concluída") return -1;
      return a.dataAgendada.localeCompare(b.dataAgendada);
    });
  }, [schedulesWithStatus, filterPlantId, filterStatus, todayStr]);

  // Request browser notifications
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          new Notification("🌱 Almanaque Botânico", {
            body: "Notificações de adubação ativadas! Avisaremos quando suas plantas precisarem de nutrientes.",
            icon: "/favicon.ico",
          });
          setNotificationSentMessage("Notificações do navegador ativadas com sucesso!");
          setTimeout(() => setNotificationSentMessage(null), 4000);
        }
      } catch (err) {
        console.warn("Permissão de notificação negada ou não suportada", err);
      }
    }
  };

  // Quick action: Complete fertilization
  const handleCompleteSchedule = (schedule: ScheduledFertilization) => {
    const completionDate = todayStr;
    const updated: ScheduledFertilization = {
      ...schedule,
      status: "Concluída",
      concluidaEm: completionDate,
    };

    if (onUpdateScheduledFertilization) {
      onUpdateScheduledFertilization(updated);
    }

    // Update plant's `ultimaAdubacao` in the garden
    if (schedule.userPlantId && schedule.userPlantId !== "general" && onUpdateFertilizationDate) {
      onUpdateFertilizationDate(schedule.userPlantId, completionDate);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#2d592a", "#81c784", "#a4d495", "#8d6e63", "#ffb74d"],
    });
  };

  // Quick action: Reschedule / Delay
  const handleDelaySchedule = (schedule: ScheduledFertilization, daysToAdd: number) => {
    const current = new Date(schedule.dataAgendada + "T00:00:00");
    current.setDate(current.getDate() + daysToAdd);
    const newDateStr = current.toISOString().split("T")[0];

    const updated: ScheduledFertilization = {
      ...schedule,
      dataAgendada: newDateStr,
      status: "Pendente",
    };

    if (onUpdateScheduledFertilization) {
      onUpdateScheduledFertilization(updated);
    }
  };

  // Open modal for new schedule
  const handleOpenNewScheduleModal = (plantId?: string, preset?: (typeof FERTILIZER_PRESETS)[0]) => {
    const targetPlantId = plantId || (garden[0]?.id || "general");
    const targetPlant = garden.find((p) => p.id === targetPlantId);
    const defaultPreset = preset || FERTILIZER_PRESETS[0];

    setFormData({
      userPlantId: targetPlantId,
      dataAgendada: todayStr,
      horaAgendada: "08:00",
      tipoAdubo: defaultPreset.nome,
      modoAplicacao: defaultPreset.modo,
      dosagem: defaultPreset.dose,
      faseLunarRecomendada: defaultPreset.faseLunar,
      observacoes: targetPlant ? `Adubação periódica para ${targetPlant.nomePersonalizado}.` : "",
    });
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  // Handle Preset Selection in Form
  const handleSelectPreset = (presetName: string) => {
    const preset = FERTILIZER_PRESETS.find((p) => p.nome === presetName);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        tipoAdubo: preset.nome,
        modoAplicacao: preset.modo,
        dosagem: preset.dose,
        faseLunarRecomendada: preset.faseLunar,
      }));
    }
  };

  // Quick date offset setter
  const handleSetDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({
      ...prev,
      dataAgendada: d.toISOString().split("T")[0],
    }));
  };

  // Save Schedule (Create or Update)
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    let plantName = "Canteiro Coletivo / Todo o Jardim";
    if (formData.userPlantId !== "general") {
      const p = garden.find((g) => g.id === formData.userPlantId);
      if (p) plantName = p.nomePersonalizado;
    }

    if (editingSchedule) {
      const updated: ScheduledFertilization = {
        ...editingSchedule,
        userPlantId: formData.userPlantId,
        plantName,
        dataAgendada: formData.dataAgendada,
        horaAgendada: formData.horaAgendada,
        tipoAdubo: formData.tipoAdubo,
        modoAplicacao: formData.modoAplicacao,
        dosagem: formData.dosagem,
        faseLunarRecomendada: formData.faseLunarRecomendada,
        observacoes: formData.observacoes,
      };
      if (onUpdateScheduledFertilization) {
        onUpdateScheduledFertilization(updated);
      }
    } else {
      const newSchedule: ScheduledFertilization = {
        id: `fert-sched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userPlantId: formData.userPlantId,
        plantName,
        dataAgendada: formData.dataAgendada,
        horaAgendada: formData.horaAgendada,
        tipoAdubo: formData.tipoAdubo,
        modoAplicacao: formData.modoAplicacao,
        dosagem: formData.dosagem,
        faseLunarRecomendada: formData.faseLunarRecomendada,
        observacoes: formData.observacoes,
        status: "Pendente",
        criadoEm: new Date().toISOString(),
      };
      if (onAddScheduledFertilization) {
        onAddScheduledFertilization(newSchedule);
      }
    }

    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  // Calendar Day Generation
  const calendarMonthDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Blank padding before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthFormatted = String(month + 1).padStart(2, "0");
      const dayFormatted = String(day).padStart(2, "0");
      const dateIso = `${year}-${monthFormatted}-${dayFormatted}`;
      days.push(dateIso);
    }
    return days;
  }, [currentCalendarDate]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-4 sm:p-7 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ded5c2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#284229] text-[#a4d495] shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
                Calendário de Adubação e Fertilização
              </h2>
              <p className="text-xs sm:text-sm text-[#665a45] font-narrative">
                Agendamento de reposição de nutrientes, alertas de manejo ecológico e fórmulas biofertilizantes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {notificationPermission !== "granted" && (
            <button
              onClick={handleRequestNotificationPermission}
              className="px-3.5 py-2 rounded-xl bg-[#ede4d2] hover:bg-[#ded4be] text-[#423727] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#d6ccb8]"
              title="Ativar lembretes do navegador"
            >
              <Bell className="w-3.5 h-3.5 text-[#2d592a]" />
              <span>Ativar Alertas no Navegador</span>
            </button>
          )}

          <button
            onClick={() => handleOpenNewScheduleModal()}
            className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#a4d495]" />
            <span>Agendar Nova Adubação</span>
          </button>
        </div>
      </div>

      {/* Notification Feedback Toast (if triggered) */}
      {notificationSentMessage && (
        <div className="p-3 rounded-xl bg-[#edf6eb] border border-[#a4d495] text-xs text-[#1c4d1e] font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#285e2b]" />
          <span>{notificationSentMessage}</span>
        </div>
      )}

      {/* In-App Notification Center: Overdue or Due Today Alerts */}
      {(dueTodaySchedules.length > 0 || overdueSchedules.length > 0) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fff4e6] to-[#faedd9] border-2 border-[#e6983b] shadow-xs space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebd3b5] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#c7772c] text-[#ffffff] animate-pulse">
                <BellRing className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-serif-botanic text-base sm:text-lg font-bold text-[#693910]">
                  {overdueSchedules.length > 0 && dueTodaySchedules.length > 0
                    ? `Atenção: ${dueTodaySchedules.length} adubação(ões) para hoje e ${overdueSchedules.length} atrasada(s)!`
                    : overdueSchedules.length > 0
                    ? `Atenção: ${overdueSchedules.length} adubação(ões) pendente(s) com data vencida!`
                    : `Lembrete: ${dueTodaySchedules.length} adubação(ões) programada(s) para hoje!`}
                </h4>
                <p className="text-[11px] text-[#7a4918]">
                  Mantenha a nutrição equilibrada do seu herbanário para evitar estresse foliar e perda de floração.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#fde1c3] text-[#82440f] text-[10px] font-bold uppercase tracking-wider font-mono shrink-0">
              Notificação Ativa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...overdueSchedules, ...dueTodaySchedules].slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bg-[#ffffff]/90 rounded-xl p-3 border border-[#ebd3b5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-serif-botanic font-bold text-sm text-[#2b2114] truncate">
                      {item.plantName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.status === "Atrasada"
                          ? "bg-[#fbece0] text-[#9c5211]"
                          : "bg-[#edf6eb] text-[#2c6128]"
                      }`}
                    >
                      {item.status === "Atrasada" ? "Atrasada" : "Para Hoje"}
                    </span>
                  </div>
                  <p className="text-xs text-[#524430] font-medium flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-[#3b6637] shrink-0" />
                    <span>{item.tipoAdubo}</span>
                  </p>
                  {item.dosagem && (
                    <p className="text-[10px] text-[#786b57]">Dose: {item.dosagem}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCompleteSchedule(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Marcar como adubada hoje"
                  >
                    <Check className="w-3 h-3 text-[#a4d495]" />
                    <span>Concluir</span>
                  </button>

                  <button
                    onClick={() => handleDelaySchedule(item, 3)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#ede4d2] hover:bg-[#ded4be] text-[#544834] text-xs font-medium transition-colors cursor-pointer"
                    title="Adiar por 3 dias"
                  >
                    +3 dias
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ded5c2] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#ede4d2] p-1.5 rounded-2xl border border-[#d6ccb8]">
          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "agenda"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#544834] hover:bg-[#dfd5c2]"
            }`}
          >
            <List className="w-4 h-4" />
            <span>Agenda de Fertilizações</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "agenda" ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ded4be] text-[#544834]"
              }`}
            >
              {pendingSchedules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("calendario")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "calendario"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#544834] hover:bg-[#dfd5c2]"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Visão Mensal</span>
          </button>

          <button
            onClick={() => setActiveTab("sazonal")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "sazonal"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#544834] hover:bg-[#dfd5c2]"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Ciclo Sazonal ({currentSeason.nome})</span>
          </button>

          <button
            onClick={() => setActiveTab("receitas")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "receitas"
                ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                : "text-[#544834] hover:bg-[#dfd5c2]"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Fórmulas & Receitas Caseiras</span>
          </button>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#665a45]">
          <span className="px-2.5 py-1 rounded-lg bg-[#ede4d2] border border-[#d6ccb8]">
            Total: <strong>{scheduledFertilizations.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#e2f0e0] border border-[#b6deb2] text-[#245422]">
            Concluídas: <strong>{completedSchedules.length}</strong>
          </span>
        </div>
      </div>

      {/* TAB 1: AGENDA LIST VIEW */}
      {activeTab === "agenda" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf7f2] p-3 rounded-2xl border border-[#ded5c2]">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: "todos", label: "Todas", count: scheduledFertilizations.length },
                { id: "hoje", label: "Hoje & Atrasadas", count: dueTodaySchedules.length + overdueSchedules.length },
                { id: "pendentes", label: "Pendentes", count: pendingSchedules.length },
                { id: "concluidas", label: "Concluídas", count: completedSchedules.length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === f.id
                      ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                      : "text-[#635541] hover:bg-[#ede4d2]"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterStatus === f.id ? "bg-[#a4d495] text-[#1a331c]" : "bg-[#ede4d2] text-[#70624d]"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Plant Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#7a6c55]" />
              <select
                value={filterPlantId}
                onChange={(e) => setFilterPlantId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#ede4d2] border border-[#d6ccb8] text-xs font-medium text-[#403525] focus:outline-none focus:ring-1 focus:ring-[#284229] cursor-pointer"
              >
                <option value="all">Todas as Plantas do Jardim</option>
                <option value="general">Canteiro Coletivo / Geral</option>
                {garden.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomePersonalizado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Schedules */}
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12 bg-[#faf7f2] rounded-2xl border border-[#ded5c2] p-6 space-y-3">
              <CalendarCheck className="w-12 h-12 text-[#8c7e68] mx-auto opacity-60" />
              <h4 className="font-serif-botanic text-xl font-bold text-[#3d3324]">
                Nenhuma adubação encontrada neste filtro
              </h4>
              <p className="text-xs text-[#695d4b] max-w-md mx-auto font-narrative">
                Agende a próxima reposição de nutrientes para garantir vigor foliar, florescimento e saúde de suas plantas.
              </p>
              <button
                onClick={() => handleOpenNewScheduleModal()}
                className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold transition-colors cursor-pointer"
              >
                Agendar Fertilização
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchedules.map((schedule) => {
                const plant = garden.find((g) => g.id === schedule.userPlantId);
                const isCompleted = schedule.status === "Concluída";
                const isOverdue = schedule.status === "Atrasada";
                const isToday = schedule.dataAgendada === todayStr && !isCompleted;

                // Format display date
                const [year, month, day] = schedule.dataAgendada.split("-");
                const formattedDate = `${day}/${month}/${year}`;

                return (
                  <div
                    key={schedule.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 flex flex-col justify-between ${
                      isCompleted
                        ? "bg-[#f2efe6]/70 border-[#ded5c2] opacity-80"
                        : isOverdue
                        ? "bg-[#faf7f2] border-[#e6983b] ring-2 ring-[#e6983b]/20 shadow-xs"
                        : isToday
                        ? "bg-[#faf7f2] border-[#2e5429] ring-2 ring-[#2e5429]/20 shadow-xs"
                        : "bg-[#faf7f2] border-[#ded5c2] shadow-xs"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Date, Status & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-xl text-center min-w-[50px] border ${
                              isCompleted
                                ? "bg-[#ded4be] text-[#544834] border-[#cfc4ac]"
                                : isOverdue
                                ? "bg-[#fbece0] text-[#9c5211] border-[#f0c29e]"
                                : isToday
                                ? "bg-[#284229] text-[#a4d495] border-[#1d331e]"
                                : "bg-[#ede4d2] text-[#332817] border-[#dbd0b9]"
                            }`}
                          >
                            <span className="block text-[10px] font-bold uppercase font-mono leading-none">
                              {monthNames[parseInt(month, 10) - 1]?.slice(0, 3)}
                            </span>
                            <span className="block text-lg font-bold font-serif-botanic leading-tight">
                              {day}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-serif-botanic text-lg font-bold text-[#1f2d1e] leading-tight">
                                {schedule.plantName}
                              </h4>
                              {plant?.localizacao && (
                                <span className="text-[10px] text-[#736652] font-mono">
                                  • {plant.localizacao}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#285226] flex items-center gap-1 mt-0.5">
                              <Sprout className="w-3.5 h-3.5" />
                              <span>{schedule.tipoAdubo}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-[#e2eedf] text-[#1c4d1e] border border-[#bcd6b8]"
                                : isOverdue
                                ? "bg-[#fbece0] text-[#9c5211] border border-[#f0c29e] animate-pulse"
                                : isToday
                                ? "bg-[#e2eedf] text-[#1c4d1e] border border-[#a4d495]"
                                : "bg-[#ede4d2] text-[#544834] border border-[#d6ccb8]"
                            }`}
                          >
                            {isCompleted
                              ? `Concluída em ${schedule.concluidaEm || formattedDate}`
                              : isOverdue
                              ? "⚠️ Vencida"
                              : isToday
                              ? "🔔 Hoje"
                              : `Prevista para ${formattedDate}`}
                          </span>
                        </div>
                      </div>

                      {/* Nutrient Application Details */}
                      <div className="p-3 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-1.5 text-xs text-[#423624]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>
                            <strong>Modo:</strong> {schedule.modoAplicacao}
                          </span>
                          {schedule.faseLunarRecomendada && (
                            <span className="px-2 py-0.5 rounded-md bg-[#ede4d2] text-[#524430] font-medium font-mono text-[10px]">
                              🌙 {schedule.faseLunarRecomendada}
                            </span>
                          )}
                        </div>

                        {schedule.dosagem && (
                          <p className="text-[11px] text-[#5c4f3d]">
                            <strong>Dosagem:</strong> {schedule.dosagem}
                          </p>
                        )}

                        {schedule.observacoes && (
                          <p className="text-[11px] text-[#6b5f4d] italic font-narrative pt-1 border-t border-[#ded5c2]">
                            "{schedule.observacoes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="pt-2 border-t border-[#ebe3d2] flex items-center justify-between gap-2">
                      {!isCompleted ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <button
                            onClick={() => handleCompleteSchedule(schedule)}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 text-[#a4d495]" />
                            <span>Marcar como Concluída</span>
                          </button>

                          <button
                            onClick={() => handleDelaySchedule(schedule, 7)}
                            className="py-2 px-2.5 rounded-xl bg-[#ede4d2] hover:bg-[#ded4be] text-[#544834] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            title="Adiar por 7 dias"
                          >
                            +7d
                          </button>

                          {onDeleteScheduledFertilization && (
                            <button
                              onClick={() => onDeleteScheduledFertilization(schedule.id)}
                              className="p-2 rounded-xl text-[#9c4a4a] hover:bg-[#fae6e6] transition-colors cursor-pointer shrink-0"
                              title="Remover agendamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-xs text-[#524430]">
                          <span className="flex items-center gap-1 text-[#285e2b] font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-[#357539]" />
                            Nutrição realizada com sucesso!
                          </span>

                          {onDeleteScheduledFertilization && (
                            <button
                              onClick={() => onDeleteScheduledFertilization(schedule.id)}
                              className="p-1.5 rounded-lg text-[#857560] hover:text-[#9c4a4a] transition-colors cursor-pointer"
                              title="Excluir histórico"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR GRID VIEW */}
      {activeTab === "calendario" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Calendar Month Selector */}
          <div className="flex items-center justify-between bg-[#faf7f2] p-4 rounded-2xl border border-[#ded5c2]">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#ede4d2] hover:bg-[#dfd5c2] text-[#403525] transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
                {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#ede4d2] hover:bg-[#dfd5c2] text-[#403525] transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentCalendarDate(new Date());
                setSelectedCalendarDay(todayStr);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#ede4d2] hover:bg-[#dfd5c2] text-[#403525] text-xs font-semibold transition-colors cursor-pointer"
            >
              Mês Atual
            </button>
          </div>

          {/* Calendar Day Grid */}
          <div className="bg-[#faf7f2] p-4 rounded-3xl border border-[#ded5c2] space-y-2">
            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center font-cinzel font-bold text-[11px] text-[#736551] pb-2 border-b border-[#ded5c2]">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarMonthDays.map((dateIso, idx) => {
                if (!dateIso) {
                  return <div key={`blank-${idx}`} className="p-2 min-h-[70px] rounded-xl bg-transparent" />;
                }

                const dayNumber = parseInt(dateIso.split("-")[2], 10);
                const daySchedules = schedulesWithStatus.filter((s) => s.dataAgendada === dateIso);
                const isToday = dateIso === todayStr;
                const isSelected = dateIso === selectedCalendarDay;
                const hasPending = daySchedules.some((s) => s.status === "Pendente" || s.status === "Atrasada");
                const hasCompleted = daySchedules.some((s) => s.status === "Concluída");

                return (
                  <div
                    key={dateIso}
                    onClick={() => setSelectedCalendarDay(dateIso)}
                    className={`p-2 min-h-[75px] sm:min-h-[85px] rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#284229] text-[#f7f5ee] border-[#1b301c] shadow-xs"
                        : isToday
                        ? "bg-[#edf6eb] border-[#81c784] text-[#1c4d1e]"
                        : daySchedules.length > 0
                        ? "bg-[#f5efe3] border-[#d6ccb8] text-[#2b2114]"
                        : "bg-[#ffffff]/60 border-[#ebe3d2] text-[#5e513e] hover:bg-[#ede4d2]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${isSelected ? "text-[#a4d495]" : ""}`}>
                        {dayNumber}
                      </span>
                      {isToday && (
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1 rounded ${
                          isSelected ? "bg-[#a4d495] text-[#142e17]" : "bg-[#284229] text-[#ccebc5]"
                        }`}>
                          Hoje
                        </span>
                      )}
                    </div>

                    {/* Schedule Dots & Badges */}
                    {daySchedules.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        {daySchedules.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                              isSelected
                                ? "bg-[#1c301d] text-[#cceec4]"
                                : s.status === "Concluída"
                                ? "bg-[#ded4be] text-[#4f4331] line-through"
                                : "bg-[#284229] text-[#e8f5e6]"
                            }`}
                            title={`${s.plantName}: ${s.tipoAdubo}`}
                          >
                            🌿 {s.plantName}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <span className={`text-[8px] font-bold ${isSelected ? "text-[#a4d495]" : "text-[#5e523f]"}`}>
                            +{daySchedules.length - 2} mais
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Drawer */}
          {selectedCalendarDay && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#ded5c2] pb-2.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#284229]" />
                  <h4 className="font-serif-botanic text-lg font-bold text-[#1f2e1f]">
                    Eventos de Adubação para {selectedCalendarDay.split("-").reverse().join("/")}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      dataAgendada: selectedCalendarDay,
                    }));
                    setIsScheduleModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#a4d495]" />
                  <span>Adicionar nesta data</span>
                </button>
              </div>

              {schedulesWithStatus.filter((s) => s.dataAgendada === selectedCalendarDay).length === 0 ? (
                <p className="text-xs text-[#70634e] italic py-3 font-narrative">
                  Nenhuma adubação programada para este dia. Clique no botão acima para agendar.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedulesWithStatus
                    .filter((s) => s.dataAgendada === selectedCalendarDay)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#f5efe3] p-3.5 rounded-xl border border-[#ded5c2] flex items-center justify-between gap-3"
                      >
                        <div>
                          <h5 className="font-bold text-sm text-[#1f2d1e]">{item.plantName}</h5>
                          <p className="text-xs text-[#403422]">{item.tipoAdubo}</p>
                          <p className="text-[11px] text-[#695d4a]">{item.modoAplicacao}</p>
                        </div>

                        {item.status !== "Concluída" ? (
                          <button
                            onClick={() => handleCompleteSchedule(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-[#a4d495]" />
                            <span>Concluir</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-[#2b6329] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Feita
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEASONAL NUTRITION GUIDE */}
      {activeTab === "sazonal" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Current Season Botanical Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#293d2b] to-[#1a281c] text-[#f4efe4] border border-[#3e5e3f] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#1d2d1f] text-[#a4d495] border border-[#3c5c3e]">
                  {React.createElement(currentSeason.icone, { className: "w-6 h-6" })}
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
          <div className="space-y-3">
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
                    className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                      isCurrent
                        ? "bg-[#faf7f2] border-[#2e5429] ring-2 ring-[#2e5429]/20 shadow-xs"
                        : "bg-[#faf7f2] border-[#ded5c2]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#1f2d1e]">
                        <IconC className="w-4 h-4 text-[#3b6637]" />
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
        </div>
      )}

      {/* TAB 4: HOMEMADE ORGANIC RECIPES */}
      {activeTab === "receitas" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-botanic text-xl font-bold text-[#1f2e1f]">
                Guia de Adubos & Biofertilizantes Artesanais
              </h3>
              <p className="text-xs text-[#635742] font-narrative">
                Fórmulas sustentáveis preparadas com resíduos orgânicos e insumos minerais naturais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FERTILIZER_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-2.5 flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-[#284229] text-[#ccebc5]">
                      {preset.tipo}
                    </span>
                    <span className="text-[10px] font-mono text-[#7a6d57]">🌙 {preset.faseLunar}</span>
                  </div>

                  <h4 className="font-serif-botanic text-base font-bold text-[#1a2b1b]">
                    {preset.nome}
                  </h4>

                  <p className="text-xs text-[#524430] font-medium">
                    <strong>Nutrientes:</strong> {preset.nutriente}
                  </p>
                  <p className="text-xs text-[#5c4f3d] font-narrative">
                    <strong>Aplicação:</strong> {preset.modo}
                  </p>
                  <p className="text-[11px] text-[#695d4a]">
                    <strong>Dose sugerida:</strong> {preset.dose}
                  </p>
                  <p className="text-[11px] text-[#2c5428] italic font-narrative pt-1 border-t border-[#ded5c2]">
                    💡 {preset.indicacao}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenNewScheduleModal(undefined, preset)}
                  className="w-full py-2 px-3 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2 shadow-xs"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-[#a4d495]" />
                  <span>Agendar com esta Fórmula</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL / DRAWER */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#f5efe3] border-2 border-[#3b5937] rounded-3xl w-full max-w-xl shadow-2xl p-5 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#ded5c2] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#284229] text-[#a4d495]">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
                  {editingSchedule ? "Editar Agendamento de Adubação" : "Agendar Nova Fertilização"}
                </h3>
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#ede4d2] hover:bg-[#dfd4bd] text-[#544834] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Plant Selection */}
              <div className="space-y-1">
                <label className="font-bold text-[#382e1e] block">
                  Selecione a Planta ou Canteiro *
                </label>
                <select
                  value={formData.userPlantId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userPlantId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs font-semibold text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                >
                  <option value="general">🌾 Canteiro Coletivo / Todo o Jardim</option>
                  {garden.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      🪴 {plant.nomePersonalizado} ({plant.localizacao})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time with Quick Shortcut Buttons */}
              <div className="space-y-2">
                <label className="font-bold text-[#382e1e] block">
                  Data Prevista & Horário *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      required
                      value={formData.dataAgendada}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dataAgendada: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs font-mono font-bold text-[#233522] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.horaAgendada}
                      onChange={(e) => setFormData((prev) => ({ ...prev, horaAgendada: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs font-mono text-[#233522] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                    />
                  </div>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#706450] font-semibold mr-1">Atalhos:</span>
                  {[
                    { label: "Hoje", days: 0 },
                    { label: "+3 dias", days: 3 },
                    { label: "+7 dias", days: 7 },
                    { label: "+15 dias", days: 15 },
                    { label: "+30 dias", days: 30 },
                    { label: "+60 dias", days: 60 },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.label}
                      onClick={() => handleSetDateOffset(s.days)}
                      className="px-2.5 py-1 rounded-lg bg-[#ede4d2] hover:bg-[#ded4be] text-[10px] font-semibold text-[#453825] transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fertilizer Preset Selector */}
              <div className="space-y-1">
                <label className="font-bold text-[#382e1e] block">
                  Tipo de Adubo / Biofertilizante *
                </label>
                <select
                  value={formData.tipoAdubo}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs font-semibold text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                >
                  {FERTILIZER_PRESETS.map((p, idx) => (
                    <option key={idx} value={p.nome}>
                      🌱 {p.nome} ({p.tipo})
                    </option>
                  ))}
                  <option value="Composto Orgânico Caseiro">🍂 Composto Orgânico Caseiro</option>
                  <option value="NPK Mineral 10-10-10">🧪 NPK Mineral 10-10-10</option>
                  <option value="Outro Adubo Personalizado">✨ Outro Adubo Personalizado</option>
                </select>
              </div>

              {/* Application Method & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#382e1e] block">Modo de Aplicação</label>
                  <input
                    type="text"
                    value={formData.modoAplicacao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, modoAplicacao: e.target.value }))}
                    placeholder="Ex: Incorporação na borda do vaso"
                    className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#382e1e] block">Dosagem Recomendada</label>
                  <input
                    type="text"
                    value={formData.dosagem}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dosagem: e.target.value }))}
                    placeholder="Ex: 2 colheres de sopa"
                    className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                  />
                </div>
              </div>

              {/* Recommended Lunar Phase */}
              <div className="space-y-1">
                <label className="font-bold text-[#382e1e] block">Fase Lunar Sugerida</label>
                <select
                  value={formData.faseLunarRecomendada}
                  onChange={(e) => setFormData((prev) => ({ ...prev, faseLunarRecomendada: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                >
                  <option value="Lua Crescente">🌙 Lua Crescente (Brotamento e Adubos Foliares)</option>
                  <option value="Lua Cheia">🌕 Lua Cheia (Floração e Maturação de Frutos)</option>
                  <option value="Lua Minguante">🌘 Lua Minguante (Enraizamento e Minerais no Solo)</option>
                  <option value="Lua Nova">🌑 Lua Nova (Descanso e Microrganismos)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-[#382e1e] block">Observações / Recomendações Especiais</label>
                <textarea
                  rows={2}
                  value={formData.observacoes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Ex: Regar abundantemente após a aplicação para ativação dos nutrientes."
                  className="w-full px-3 py-2 rounded-xl bg-[#faf7f2] border border-[#ded5c2] text-xs text-[#283827] focus:outline-none focus:ring-2 focus:ring-[#284229]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ded5c2]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#ede4d2] hover:bg-[#ded4be] text-[#544834] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1c] text-[#f7f5ee] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#a4d495]" />
                  <span>Salvar Agendamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
