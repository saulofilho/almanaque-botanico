import React, { useState } from "react";
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
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPlant, PlantEntry } from "../types";

interface MyGardenViewProps {
  garden: UserPlant[];
  onWaterPlant: (plantId: string) => void;
  onRemovePlant: (plantId: string) => void;
  onUpdateNotes: (plantId: string, notes: string) => void;
  onAddNewCustomPlant: (newPlant: Omit<UserPlant, "id">) => void;
  allSpecies: PlantEntry[];
  onSelectPlantModal: (plant: PlantEntry) => void;
}

export const MyGardenView: React.FC<MyGardenViewProps> = ({
  garden,
  onWaterPlant,
  onRemovePlant,
  onUpdateNotes,
  onAddNewCustomPlant,
  allSpecies,
  onSelectPlantModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  // New Plant Form State
  const [formData, setFormData] = useState({
    nomePersonalizado: "",
    especieId: "",
    nomeCientifico: "",
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
      dataPlantio: new Date().toISOString().split("T")[0],
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
    const lastWatered = new Date(plant.ultimaRega);
    const diffTime = Math.abs(today.getTime() - lastWatered.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = plant.frequenciaDiasRega - diffDays;

    if (diffDays === 0) {
      return { text: "Regada hoje ✓", isUrgent: false, isToday: true };
    } else if (daysRemaining <= 0) {
      return { text: `Rega necessária! (há ${diffDays} dias)`, isUrgent: true, isToday: false };
    } else {
      return { text: `Próxima rega em ${daysRemaining} dia(s)`, isUrgent: false, isToday: false };
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
              Monitore a rotina de rega, datas de plantio, histórico de podas e anotações de crescimento de todas as espécies que você cuida.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#a4d495] hover:bg-[#b8e5aa] text-[#19331a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Plantar Nova Espécie</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {garden.length === 0 ? (
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
        /* Garden Plant Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garden.map((plant) => {
            const status = getWateringStatus(plant);
            const isEditing = editingPlantId === plant.id;
            const originalSpecimen = plant.especieId
              ? allSpecies.find((s) => s.id === plant.especieId)
              : null;

            return (
              <div
                key={plant.id}
                className="bg-[#faf7f2] rounded-3xl border border-[#ded5c2] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
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

                  {/* Health State Badge */}
                  <div className="absolute top-3 left-3">
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
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onRemovePlant(plant.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-[#852c21] text-white transition-colors cursor-pointer"
                    title="Remover do herbanário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

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

                    {/* Watering Status Pill & Quick Water Button */}
                    <div className="p-3.5 rounded-2xl bg-[#f2ece0] border border-[#ded5c2] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#706450] block">
                          Status de Rega
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            status.isUrgent
                              ? "text-[#a32e1f] font-bold animate-pulse"
                              : "text-[#2a4d28]"
                          }`}
                        >
                          {status.text}
                        </span>
                      </div>

                      <button
                        onClick={() => handleWaterClick(plant.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          status.isToday
                            ? "bg-[#d8edd3] text-[#1c401d]"
                            : "bg-[#2b688c] hover:bg-[#1f506e] text-white"
                        }`}
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Regar</span>
                      </button>
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

                  {/* Specimen Sheet link if exists */}
                  {originalSpecimen && (
                    <div className="pt-2 border-t border-[#ebe3d3]">
                      <button
                        onClick={() => onSelectPlantModal(originalSpecimen)}
                        className="w-full py-1.5 text-xs text-[#31572f] font-semibold hover:underline flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Ver Monografia Completa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Plant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#faf7f2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ded5c2] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ded5c2] pb-4">
              <h3 className="font-serif-botanic text-2xl font-bold text-[#1f2e1f]">
                Plantar Nova Espécie no Herbanário
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg bg-[#eee6d5] hover:bg-[#ded4bf] text-[#4f4330] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewPlant} className="space-y-4">
              {/* Preset species selector */}
              <div>
                <label className="text-xs font-semibold text-[#544834] block mb-1">
                  Vincular a uma Espécie do Herbário (Opcional)
                </label>
                <select
                  value={formData.especieId}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
                >
                  <option value="">-- Cadastrar planta personalizada --</option>
                  {allSpecies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomePopular} ({s.nomeCientifico})
                    </option>
                  ))}
                </select>
              </div>

              {/* Plant Name */}
              <div>
                <label className="text-xs font-semibold text-[#544834] block mb-1">
                  Nome da Planta ou Apelido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alecrim do Canteiro Norte, Minha Monstera..."
                  value={formData.nomePersonalizado}
                  onChange={(e) =>
                    setFormData({ ...formData, nomePersonalizado: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden"
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
                    placeholder="Ex: Varanda, Janela da Cozinha"
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
                  Estado Geral de Saúde
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
                  Anotações Iniciais
                </label>
                <textarea
                  rows={3}
                  placeholder="Data de germinação, tipo de terra usada, adubo inicial..."
                  value={formData.anotacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, anotacoes: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#f5efe3] border border-[#d6ccb8] text-xs text-[#2c3328] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[#ded5c2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#ede5d5] hover:bg-[#ded4bf] text-xs font-semibold text-[#524633] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#284229] hover:bg-[#192f1a] text-xs font-semibold text-[#f7f5ee] cursor-pointer"
                >
                  Confirmar Plantio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
