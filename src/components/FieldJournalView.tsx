import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Camera, 
  UploadCloud, 
  X, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sprout, 
  Leaf, 
  Bug, 
  Droplets, 
  Sun, 
  Scissors, 
  FlaskConical, 
  Calendar, 
  Clock, 
  MapPin, 
  Moon, 
  Filter, 
  Plus, 
  Search, 
  Maximize2, 
  RefreshCw, 
  FileText, 
  Check, 
  Tag, 
  ShieldCheck, 
  HeartHandshake,
  HelpCircle,
  FlipHorizontal,
  ChevronDown,
  Printer
} from "lucide-react";
import { UserPlant, FieldJournalEntry, FieldObservationCategory, FieldObservationSeverity, PlantEntry } from "../types";
import { getAstronomicalMoonPhase } from "../data/lunarData";
import confetti from "canvas-confetti";

interface FieldJournalViewProps {
  garden: UserPlant[];
  allSpecies?: PlantEntry[];
  entries: FieldJournalEntry[];
  onAddEntry: (entry: FieldJournalEntry) => void;
  onUpdateEntry: (entry: FieldJournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdatePlantStatus?: (plantId: string, newStatus: UserPlant["estadoSaude"]) => void;
  initialSelectedPlantId?: string | null;
  onClose?: () => void;
}

const CATEGORY_CONFIG: Record<
  FieldObservationCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }
> = {
  "Pragas & Insetos": {
    label: "Pragas & Insetos",
    icon: Bug,
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  "Mudança Foliar & Sintomas": {
    label: "Mudança Foliar & Sintomas",
    icon: Leaf,
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
  },
  "Brotamento & Floração": {
    label: "Brotamento & Floração",
    icon: Sprout,
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  "Poda & Manejo": {
    label: "Poda & Manejo",
    icon: Scissors,
    color: "#4338ca",
    bg: "#eef2ff",
    border: "#c7d2fe",
  },
  "Adubação & Nutrição": {
    label: "Adubação & Nutrição",
    icon: FlaskConical,
    color: "#a16207",
    bg: "#fefce8",
    border: "#fef08a",
  },
  "Clima & Ambiente": {
    label: "Clima & Ambiente",
    icon: Sun,
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  "Rega & Drenagem": {
    label: "Rega & Drenagem",
    icon: Droplets,
    color: "#0e7490",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
  "Colheita & Secagem": {
    label: "Colheita & Secagem",
    icon: Sparkles,
    color: "#7e22ce",
    bg: "#faf5ff",
    border: "#e9d5ff",
  },
  Geral: {
    label: "Observação Geral",
    icon: FileText,
    color: "#475569",
    bg: "#f8fafc",
    border: "#e2e8f0",
  },
};

const SEVERITY_CONFIG: Record<
  FieldObservationSeverity,
  { label: string; badgeClass: string; dotColor: string }
> = {
  Positiva: {
    label: "🌿 Vigor / Crescimento Positivo",
    badgeClass: "bg-[#e2f0df] text-[#20521e] border-[#b2d9ad]",
    dotColor: "#2d7a32",
  },
  Leve: {
    label: "🟡 Alerta Leve / Inicial",
    badgeClass: "bg-[#fef9c3] text-[#854d0e] border-[#fef08a]",
    dotColor: "#ca8a04",
  },
  Moderada: {
    label: "🟠 Moderada / Requer Atenção",
    badgeClass: "bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]",
    dotColor: "#ea580c",
  },
  Crítica: {
    label: "🔴 Crítica / Ação Imediata",
    badgeClass: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]",
    dotColor: "#dc2626",
  },
};

export const FieldJournalView: React.FC<FieldJournalViewProps> = ({
  garden,
  allSpecies = [],
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onUpdatePlantStatus,
  initialSelectedPlantId = null,
  onClose,
}) => {
  // View states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [filterPlantId, setFilterPlantId] = useState<string>(initialSelectedPlantId || "all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  // Form State
  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialSelectedPlantId || (garden[0]?.id || ""));
  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [entryTime, setEntryTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [category, setCategory] = useState<FieldObservationCategory>("Mudança Foliar & Sintomas");
  const [severity, setSeverity] = useState<FieldObservationSeverity>("Moderada");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [actionTaken, setActionTaken] = useState<string>("");
  const [resolutionStatus, setResolutionStatus] = useState<"Em Acompanhamento" | "Resolvido" | "Observação Contínua">("Em Acompanhamento");
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [syncPlantHealth, setSyncPlantHealth] = useState<boolean>(true);
  const [suggestedHealthStatus, setSuggestedHealthStatus] = useState<UserPlant["estadoSaude"]>("Necessita Atenção");

  // Camera Stream States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentMoon = useMemo(() => getAstronomicalMoonPhase(), []);

  // Update selected plant if initialSelectedPlantId changes
  useEffect(() => {
    if (initialSelectedPlantId) {
      setSelectedPlantId(initialSelectedPlantId);
      setFilterPlantId(initialSelectedPlantId);
      setIsFormOpen(true);
    }
  }, [initialSelectedPlantId]);

  // Adjust suggested health status when severity changes
  useEffect(() => {
    if (severity === "Positiva") {
      setSuggestedHealthStatus("Vigorosa");
    } else if (severity === "Leve") {
      setSuggestedHealthStatus("Estável");
    } else if (severity === "Moderada") {
      setSuggestedHealthStatus("Necessita Atenção");
    } else if (severity === "Crítica") {
      setSuggestedHealthStatus("Necessita Atenção");
    }
  }, [severity]);

  // Handle Camera initialization & teardown
  const startCamera = async (facingMode: "environment" | "user" = cameraFacingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não suportada neste navegador ou ambiente.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn("Video play error:", e));
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Permissão de acesso à câmera foi negada no navegador."
          : "Não foi possível iniciar o vídeo da câmera. Você pode anexar arquivos de foto abaixo."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAttachedPhotos((prev) => [dataUrl, ...prev]);

        // Flash feedback
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
          colors: ["#ffffff", "#a4d495"],
        });
      }
    } catch (e) {
      console.error("Erro ao capturar foto:", e);
    }
  };

  const handleFlipCamera = () => {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAttachedPhotos((prev) => [reader.result as string, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            setAttachedPhotos((prev) => [reader.result as string, ...prev]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Por favor, preencha o título e a descrição da observação de campo.");
      return;
    }

    const linkedPlant = garden.find((p) => p.id === selectedPlantId);

    const newEntry: FieldJournalEntry = {
      id: `journal-${Date.now()}`,
      userPlantId: selectedPlantId === "general" ? undefined : selectedPlantId,
      plantName: selectedPlantId === "general" ? "Jardim Geral / Canteiro Coletivo" : linkedPlant?.nomePersonalizado || "Espécime",
      data: entryDate,
      hora: entryTime,
      categoria: category,
      severidade: severity,
      titulo: title.trim(),
      descricao: description.trim(),
      fotos: attachedPhotos,
      acaoTomada: actionTaken.trim() || undefined,
      statusResolucao: resolutionStatus,
      faseLunar: `${currentMoon.phaseName}`,
      temperaturaClima: "Registro de Campo do Jardineiro",
      tags: [category.toLowerCase().replace(/\s+/g, "-"), severity.toLowerCase()],
      criadoEm: new Date().toISOString(),
    };

    onAddEntry(newEntry);

    // If option to update plant health is checked
    if (syncPlantHealth && selectedPlantId !== "general" && onUpdatePlantStatus && linkedPlant) {
      onUpdatePlantStatus(selectedPlantId, suggestedHealthStatus);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#2d7a32", "#a4d495", "#d97706"],
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setActionTaken("");
    setAttachedPhotos([]);
    setIsFormOpen(false);
    stopCamera();
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchPlant =
        filterPlantId === "all"
          ? true
          : filterPlantId === "general"
          ? !entry.userPlantId
          : entry.userPlantId === filterPlantId;

      const matchCategory = filterCategory === "all" || entry.categoria === filterCategory;
      const matchSeverity = filterSeverity === "all" || entry.severidade === filterSeverity;

      const matchSearch =
        !searchQuery.trim() ||
        entry.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.plantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.acaoTomada?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPlant && matchCategory && matchSeverity && matchSearch;
    });
  }, [entries, filterPlantId, filterCategory, filterSeverity, searchQuery]);

  // Statistics
  const totalLogs = entries.length;
  const pendingCases = entries.filter((e) => e.statusResolucao === "Em Acompanhamento").length;
  const pestAlerts = entries.filter((e) => e.categoria === "Pragas & Insetos").length;
  const photosCount = entries.reduce((acc, e) => acc + (e.fotos?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ded5c2] pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#284229] flex items-center justify-center text-[#9ed38f] shrink-0 shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-[10px] font-bold uppercase tracking-widest text-[#406343]">
                  Caderno de Campo & Observações
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e3d8c1] text-[#4d402e] font-semibold">
                  {totalLogs} registros fotográficos
                </span>
              </div>
              <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
                Diário de Campo do Jardineiro
              </h2>
              <p className="text-xs text-[#6e624e] font-narrative max-w-2xl mt-0.5">
                Registre anomalias, aparecimento de pragas, brotações e respostas aos tratamentos orgânicos com fotos da câmera e acompanhamento contínuo por espécime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#e6ddcc] hover:bg-[#d8ccb8] text-[#544834] font-semibold text-xs transition-colors cursor-pointer"
              >
                Voltar ao Jardim
              </button>
            )}

            <button
              onClick={() => {
                setIsFormOpen((prev) => !prev);
                if (isFormOpen) stopCamera();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#284229] hover:bg-[#192c1a] text-[#f7f5ee] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105"
            >
              {isFormOpen ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Fechar Formulário</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#a4d495]" />
                  <span>Nova Observação de Campo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
            <span className="text-[11px] font-semibold text-[#665a44] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#2d7a32]" />
              Total de Observações
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif-botanic text-[#2e6e32]">{totalLogs}</span>
              <span className="text-[10px] text-[#556950]">registros</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
            <span className="text-[11px] font-semibold text-[#665a44] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              Em Acompanhamento
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif-botanic text-[#b45309]">{pendingCases}</span>
              <span className="text-[10px] text-[#854d0e]">casos abertos</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
            <span className="text-[11px] font-semibold text-[#665a44] flex items-center gap-1">
              <Bug className="w-3.5 h-3.5 text-[#dc2626]" />
              Alertas de Pragas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif-botanic text-[#991b1b]">{pestAlerts}</span>
              <span className="text-[10px] text-[#b91c1c]">ocorrências</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#ded5c2] space-y-1">
            <span className="text-[11px] font-semibold text-[#665a44] flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-[#2563eb]" />
              Fotos Catalogadas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-serif-botanic text-[#1e40af]">{photosCount}</span>
              <span className="text-[10px] text-[#3b82f6]">imagens</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW OBSERVATION FORM / MODAL CARD */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitEntry}
          className="bg-[#faf7f2] rounded-3xl border-2 border-[#2d7a32] p-5 sm:p-7 shadow-md space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#ded5c2] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#284229] text-[#a4d495]">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-botanic text-xl font-bold text-[#1f2e1f]">
                  Novo Registro no Diário de Campo
                </h3>
                <p className="text-xs text-[#6e624e] font-narrative">
                  Fotografe ou descreva o que você observou no seu jardim hoje.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                stopCamera();
              }}
              className="text-xs text-[#706450] hover:text-[#2c2214] font-medium"
            >
              Cancelar ✕
            </button>
          </div>

          {/* Plant & Category Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Linked Plant Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#4d402f] flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#2d592b]" />
                Vincular a uma Planta:
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
              >
                <option value="general">🌳 Jardim Geral / Canteiro Coletivo</option>
                {garden.map((p) => (
                  <option key={p.id} value={p.id}>
                    🌿 {p.nomePersonalizado} ({p.localizacao || "Vaso"})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#4d402f] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#b5802d]" />
                Categoria da Ocorrência:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FieldObservationCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
              >
                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity / Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#4d402f] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
                Grau de Severidade / Vigor:
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FieldObservationSeverity)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
              >
                {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
                  <option key={sev} value={sev}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#4d402f] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#3b6338]" />
                Data & Hora:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-2/3 px-3 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
                />
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-1/3 px-2 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Title & Detailed Observation */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4d402f]">
                Título Curto da Observação: <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Pequenos pontos brancos nas axilas das folhas ou broto florindo com vigor..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs sm:text-sm text-[#2c3328] focus:outline-hidden focus:border-[#284229]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4d402f]">
                Descrição e Sintomas Notados: <span className="text-red-600">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descreva o que você notou: folhas amareladas, bordas secas, presença de insetos, textura do solo, umidade, ou crescimento de novos ramos..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs sm:text-sm text-[#2c3328] font-narrative focus:outline-hidden focus:border-[#284229]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4d402f] flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#2d7a32]" />
                Ação Tomada / Manejo ou Tratamento Aplicado: (Opcional)
              </label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Ex: Pulverizada calda de sabão de coco com óleo de neem 1%, podadas folhas secas, ou regado com biofertilizante..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#d6ccb8] text-xs sm:text-sm text-[#2c3328] focus:outline-hidden focus:border-[#284229]"
              />
            </div>
          </div>

          {/* Camera & Photo Attachment Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#f2ecdf] border border-[#dcd2be] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ded5c2] pb-3">
              <div>
                <span className="font-semibold text-xs text-[#382f20] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#284229]" />
                  Anexar Fotos da Câmera ou Arquivo:
                </span>
                <span className="text-[11px] text-[#6b5e49] font-narrative">
                  Capture detalhes das folhas, pragas ou brotos para manter o histórico visual.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isCameraActive) {
                      stopCamera();
                    } else {
                      startCamera();
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isCameraActive
                      ? "bg-[#b91c1c] text-white"
                      : "bg-[#284229] hover:bg-[#192c1a] text-white"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isCameraActive ? "Desativar Câmera" : "Abrir Câmera ao Vivo"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#e6ddcc] hover:bg-[#d9ceb9] text-[#4f4330] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Live Camera Viewfinder */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#284229] shadow-md max-w-lg mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-72 object-cover"
                />

                {/* Viewfinder Target Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border border-white/40 rounded-2xl flex items-center justify-center">
                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                      Foco Botânico
                    </span>
                  </div>
                </div>

                {/* Camera Action Floating Toolbar */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4 px-4">
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                    title="Alternar Câmera Frontal / Traseira"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-5 py-2.5 rounded-full bg-[#a4d495] hover:bg-[#b8e8a7] text-[#163017] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                    title="Fechar Câmera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Drag and Drop Zone if no photos and camera inactive */}
            {!isCameraActive && attachedPhotos.length === 0 && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropFiles}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#cdbfab] rounded-2xl p-6 text-center space-y-2 bg-[#faf6ed] hover:bg-[#f3edd9] transition-colors cursor-pointer"
              >
                <UploadCloud className="w-8 h-8 text-[#8c7b64] mx-auto opacity-70" />
                <p className="text-xs text-[#4f4330] font-medium">
                  Clique para anexar fotos ou arraste imagens aqui
                </p>
                <p className="text-[10px] text-[#7d6f5a]">
                  Suporta JPG, PNG, WEBP tiradas pelo celular ou câmera.
                </p>
              </div>
            )}

            {/* Attached Photos Preview Grid */}
            {attachedPhotos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#594d3a]">
                  <span className="font-semibold">{attachedPhotos.length} foto(s) anexada(s):</span>
                  <button
                    type="button"
                    onClick={() => setAttachedPhotos([])}
                    className="text-[11px] text-[#b91c1c] hover:underline"
                  >
                    Remover todas
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {attachedPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden aspect-square border border-[#d6ccb8] bg-[#e6ddcc] shadow-2xs"
                    >
                      <img
                        src={photoUrl}
                        alt={`Foto de campo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingPhotoUrl(photoUrl)}
                          className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-[#2c3328] transition-colors"
                          title="Ampliar foto"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plant Health State Sync & Resolution Option */}
          <div className="p-4 rounded-2xl bg-[#faf6ed] border border-[#ded5c2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            {selectedPlantId !== "general" ? (
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#4a3e2e]">
                <input
                  type="checkbox"
                  checked={syncPlantHealth}
                  onChange={(e) => setSyncPlantHealth(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#284229] focus:ring-[#284229]"
                />
                <span>
                  Sincronizar e atualizar o estado de saúde desta planta no <strong>Meu Jardim</strong> para:
                </span>
                {syncPlantHealth && (
                  <select
                    value={suggestedHealthStatus}
                    onChange={(e) => setSuggestedHealthStatus(e.target.value as any)}
                    className="ml-1 px-2.5 py-1 rounded-lg bg-white border border-[#d6ccb8] font-semibold text-xs text-[#2c3328]"
                  >
                    <option value="Vigorosa">🌿 Vigorosa</option>
                    <option value="Estável">🌾 Estável</option>
                    <option value="Necessita Atenção">⚠️ Necessita Atenção</option>
                    <option value="Em Recuperação">💧 Em Recuperação</option>
                  </select>
                )}
              </label>
            ) : (
              <span className="text-[11px] text-[#6b5e49] font-narrative">
                🌕 Fase Lunar no Registro: <strong>{currentMoon.phaseName}</strong> ({currentMoon.illumination}% iluminada)
              </span>
            )}

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-[#544834]">Status:</label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d6ccb8] text-xs font-semibold text-[#2c3328]"
              >
                <option value="Em Acompanhamento">⏳ Em Acompanhamento</option>
                <option value="Resolvido">✅ Resolvido</option>
                <option value="Observação Contínua">🔍 Observação Contínua</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ded5c2]">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                stopCamera();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#e6ddcc] hover:bg-[#d9ceb9] text-[#544834] font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#284229] hover:bg-[#192c1a] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#a4d495]" />
              <span>Salvar no Diário de Campo</span>
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-[#faf7f2] rounded-2xl p-4 border border-[#ded5c2] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#7a6d57] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por sintoma, praga, planta..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plant Filter */}
          <select
            value={filterPlantId}
            onChange={(e) => setFilterPlantId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
          >
            <option value="all">Todas as Plantas ({entries.length})</option>
            <option value="general">🌳 Jardim Geral / Canteiro</option>
            {garden.map((p) => (
              <option key={p.id} value={p.id}>
                🌿 {p.nomePersonalizado}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
          >
            <option value="all">Todas as Categorias</option>
            {Object.keys(CATEGORY_CONFIG).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#d6ccb8] text-xs text-[#2c3328] font-medium focus:outline-hidden"
          >
            <option value="all">Todas as Severidades</option>
            {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
              <option key={sev} value={sev}>
                {cfg.label}
              </option>
            ))}
          </select>

          {(filterPlantId !== "all" || filterCategory !== "all" || filterSeverity !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setFilterPlantId("all");
                setFilterCategory("all");
                setFilterSeverity("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-[#b91c1c] hover:underline font-medium px-2 py-1"
            >
              Limpar Filtros ✕
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE FEED OF OBSERVATIONS */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-[#faf7f2] rounded-3xl border border-[#ded5c2] p-8 space-y-3">
          <Camera className="w-12 h-12 text-[#8a7c64] mx-auto opacity-70" />
          <h3 className="font-serif-botanic text-2xl font-bold text-[#3d3527]">
            Nenhuma observação encontrada
          </h3>
          <p className="text-xs text-[#665a45] font-narrative max-w-md mx-auto">
            {searchQuery || filterCategory !== "all" || filterPlantId !== "all"
              ? "Tente ajustar os filtros ou termo de busca acima."
              : "Clique no botão 'Nova Observação de Campo' para registrar sua primeira foto e anotação botânica!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const catCfg = CATEGORY_CONFIG[entry.categoria] || CATEGORY_CONFIG.Geral;
            const CatIcon = catCfg.icon;
            const sevCfg = SEVERITY_CONFIG[entry.severidade] || SEVERITY_CONFIG.Moderada;
            const linkedPlant = garden.find((p) => p.id === entry.userPlantId);

            return (
              <div
                key={entry.id}
                className="bg-[#faf7f2] rounded-3xl border border-[#ded5c2] p-5 sm:p-6 shadow-xs hover:border-[#b8cbb4] transition-all space-y-4"
              >
                {/* Top Entry Metadata Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebd8bc] pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Pill */}
                    <span
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border"
                      style={{
                        backgroundColor: catCfg.bg,
                        color: catCfg.color,
                        borderColor: catCfg.border,
                      }}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{entry.categoria}</span>
                    </span>

                    {/* Severity Pill */}
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${sevCfg.badgeClass}`}>
                      {sevCfg.label}
                    </span>

                    {/* Resolution Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        entry.statusResolucao === "Resolvido"
                          ? "bg-[#e2f0df] text-[#24521f]"
                          : entry.statusResolucao === "Em Acompanhamento"
                          ? "bg-[#fef3c7] text-[#92400e]"
                          : "bg-[#e0e7ff] text-[#3730a3]"
                      }`}
                    >
                      {entry.statusResolucao === "Resolvido" ? "✓ Resolvido" : `● ${entry.statusResolucao}`}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-3 text-xs text-[#706450]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#3b6338]" />
                      <span>{new Date(entry.data).toLocaleDateString("pt-BR")}</span>
                      {entry.hora && <span>às {entry.hora}</span>}
                    </div>

                    {entry.faseLunar && (
                      <div className="hidden sm:flex items-center gap-1 bg-[#ede4d2] px-2 py-0.5 rounded-md text-[11px] text-[#4f4330]">
                        <Moon className="w-3 h-3 text-[#7854a8]" />
                        <span>{entry.faseLunar}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plant Name & Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#285e2b]">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>
                      Espécime Vinculado:{" "}
                      <strong className="text-[#193b1b] underline">
                        {entry.plantName || linkedPlant?.nomePersonalizado || "Jardim Geral"}
                      </strong>
                    </span>
                    {linkedPlant?.localizacao && (
                      <span className="text-[#786b58] font-normal text-[11px]">
                        • {linkedPlant.localizacao}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
                    {entry.titulo}
                  </h3>

                  <p className="text-xs sm:text-sm font-narrative text-[#3d3322] leading-relaxed">
                    {entry.descricao}
                  </p>
                </div>

                {/* Attached Photo Gallery */}
                {entry.fotos && entry.fotos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#665a44] block">
                      Evidências Fotográficas da Ocorrência ({entry.fotos.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {entry.fotos.map((photoUrl, photoIdx) => (
                        <div
                          key={photoIdx}
                          onClick={() => setViewingPhotoUrl(photoUrl)}
                          className="relative group rounded-2xl overflow-hidden aspect-square border border-[#d6ccb8] bg-[#e6ddcc] shadow-2xs cursor-pointer"
                        >
                          <img
                            src={photoUrl}
                            alt={`Registro ${photoIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Taken Box */}
                {entry.acaoTomada && (
                  <div className="p-3.5 rounded-2xl bg-[#f2ebdc] border border-[#ded2bc] flex items-start gap-2.5 text-xs">
                    <HeartHandshake className="w-4 h-4 text-[#2d7a32] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#2b2215] block">
                        Tratamento & Manejo Realizado:
                      </span>
                      <p className="font-narrative text-[#4a3f2d] mt-0.5 leading-relaxed">
                        {entry.acaoTomada}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Toolbar with Quick Status Toggle and Delete */}
                <div className="pt-2 border-t border-[#ebd8bc] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#706450]">Atualizar Resolução:</span>
                    <button
                      onClick={() => {
                        const nextStatus =
                          entry.statusResolucao === "Em Acompanhamento" ? "Resolvido" : "Em Acompanhamento";
                        onUpdateEntry({ ...entry, statusResolucao: nextStatus });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#e8decd] hover:bg-[#dad0bd] text-[#423727] font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      {entry.statusResolucao === "Resolvido" ? "Reabrir Caso" : "Marcar como Resolvido ✓"}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Deseja remover este registro do diário de campo?")) {
                        onDeleteEntry(entry.id);
                      }
                    }}
                    className="text-[11px] text-[#b91c1c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Registro</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN PHOTO ZOOM MODAL */}
      {viewingPhotoUrl && (
        <div
          onClick={() => setViewingPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-[#1a1f18] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-black/60 flex items-center justify-between text-white text-xs">
              <span className="font-mono">Visualização Fotográfica de Campo</span>
              <button
                onClick={() => setViewingPhotoUrl(null)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex-1 flex items-center justify-center overflow-auto">
              <img
                src={viewingPhotoUrl}
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
