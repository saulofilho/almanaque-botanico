import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { EncyclopediaView } from "./components/EncyclopediaView";
import { LunarCalendarView } from "./components/LunarCalendarView";
import { DoctorScannerView } from "./components/DoctorScannerView";
import { ApothecaryView } from "./components/ApothecaryView";
import { MyGardenView } from "./components/MyGardenView";
import { BotanistChatView } from "./components/BotanistChatView";
import { PlantModal } from "./components/PlantModal";
import { OnboardingModal, STORAGE_KEY_ONBOARDING } from "./components/OnboardingModal";
import { WallpaperGallery } from "./components/WallpaperGallery";
import { BotanicalWeatherWidget } from "./components/BotanicalWeatherWidget";
import { BOTANICAL_PLANTS } from "./data/plants";
import { PlantEntry, UserPlant } from "./types";
import { Sprout, Heart, Leaf, ShieldCheck, Moon, Sparkles, Compass, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";

const STORAGE_KEY_GARDEN = "almanaque_botanico_my_garden_v1";
const STORAGE_KEY_CATALOG = "almanaque_botanico_extra_catalog_v1";

const INITIAL_GARDEN_PLANTS: UserPlant[] = [
  {
    id: "garden-lavanda",
    nomePersonalizado: "Lavanda do Parapeito",
    especieId: "lavanda-officinalis",
    nomeCientifico: "Lavandula angustifolia",
    dataPlantio: "2026-06-10",
    ultimaRega: new Date().toISOString().split("T")[0],
    frequenciaDiasRega: 7,
    localizacao: "Varanda Sul",
    estadoSaude: "Vigorosa",
    anotacoes: "Floresceu lindamente na última Lua Cheia. Ramos perfumados!",
    imagemUrl: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "garden-alecrim",
    nomePersonalizado: "Alecrim da Cozinha",
    especieId: "alecrim-rosmarinus",
    nomeCientifico: "Salvia rosmarinus",
    dataPlantio: "2026-05-15",
    ultimaRega: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    frequenciaDiasRega: 5,
    localizacao: "Janela Ensolarada",
    estadoSaude: "Vigorosa",
    anotacoes: "Podado na lua minguante para encorpar. Muito aromático.",
    imagemUrl: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "garden-orapronobis",
    nomePersonalizado: "Ora-pro-nóbis do Canteiro",
    especieId: "ora-pro-nobis",
    nomeCientifico: "Pereskia aculeata",
    dataPlantio: "2026-07-01",
    ultimaRega: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    frequenciaDiasRega: 3,
    localizacao: "Cerca Viva",
    estadoSaude: "Vigorosa",
    anotacoes: "Colheita de folhas jovens para suco verde semanal.",
    imagemUrl: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("enciclopedia");
  const [selectedPlantForModal, setSelectedPlantForModal] = useState<PlantEntry | null>(null);
  const [isWallpapersOpen, setIsWallpapersOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY_ONBOARDING);
      return !completed; // Open by default if not completed yet
    } catch {
      return false;
    }
  });

  // Catalog State
  const [plantsCatalog, setPlantsCatalog] = useState<PlantEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...BOTANICAL_PLANTS, ...parsed];
      }
    } catch (e) {
      console.warn("Erro ao ler catálogo extra do localStorage", e);
    }
    return BOTANICAL_PLANTS;
  });

  // User Garden State
  const [garden, setGarden] = useState<UserPlant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GARDEN);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Erro ao ler jardim do localStorage", e);
    }
    return INITIAL_GARDEN_PLANTS;
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync Garden to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GARDEN, JSON.stringify(garden));
    } catch (e) {
      console.warn("Erro ao salvar jardim no localStorage", e);
    }
  }, [garden]);

  const gardenPlantIds = new Set(
    garden.map((p) => p.especieId).filter(Boolean) as string[]
  );

  const handleAddToGarden = (
    plant: PlantEntry,
    status: UserPlant["estadoSaude"] = "Vigorosa"
  ) => {
    const isAlready = garden.some((p) => p.especieId === plant.id);
    if (isAlready) {
      showToast(`"${plant.nomePopular}" já está no seu Herbanário!`);
      return;
    }

    const freqDays = plant.frequenciaRega.includes("Diária")
      ? 1
      : plant.frequenciaRega.includes("2 a 3")
      ? 3
      : plant.frequenciaRega.includes("1 vez")
      ? 7
      : 14;

    const newPlant: UserPlant = {
      id: `garden-${plant.id}-${Date.now()}`,
      nomePersonalizado: plant.nomePopular,
      especieId: plant.id,
      nomeCientifico: plant.nomeCientifico,
      dataPlantio: new Date().toISOString().split("T")[0],
      ultimaRega: new Date().toISOString().split("T")[0],
      frequenciaDiasRega: freqDays,
      localizacao: "Jardim / Vaso Principal",
      estadoSaude: status,
      anotacoes: `Adicionada a partir da ficha botânica. Luminosidade: ${plant.luminosidade}.`,
      imagemUrl: plant.imagemUrl,
    };

    setGarden((prev) => [newPlant, ...prev]);
    showToast(`🌿 "${plant.nomePopular}" foi adicionada com sucesso ao seu Herbanário!`);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.75 },
      colors: ["#386634", "#84ab7b", "#fae8b4"],
    });
  };

  const handleWaterPlant = (plantId: string) => {
    setGarden((prev) =>
      prev.map((p) =>
        p.id === plantId
          ? { ...p, ultimaRega: new Date().toISOString().split("T")[0] }
          : p
      )
    );
    showToast("💧 Rega registrada hoje!");
  };

  const handleRemovePlant = (plantId: string) => {
    const item = garden.find((p) => p.id === plantId);
    setGarden((prev) => prev.filter((p) => p.id !== plantId));
    if (item) {
      showToast(`Planta "${item.nomePersonalizado}" removida do jardim.`);
    }
  };

  const handleUpdateNotes = (plantId: string, notes: string) => {
    setGarden((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, anotacoes: notes } : p))
    );
    showToast("📝 Anotação de manejo salva!");
  };

  const handleUpdatePlantStatus = (plantId: string, newStatus: UserPlant["estadoSaude"]) => {
    setGarden((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, estadoSaude: newStatus } : p))
    );
    showToast(`Estado de saúde atualizado para "${newStatus}"!`);
  };

  const handleUpdateFertilizationDate = (plantId: string, dateIso: string) => {
    setGarden((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, ultimaAdubacao: dateIso } : p))
    );
    showToast("🍂 Adubação registrada com sucesso!");
  };

  const handleAddNewCustomPlant = (newPlantData: Omit<UserPlant, "id">) => {
    const newPlant: UserPlant = {
      ...newPlantData,
      id: `custom-${Date.now()}`,
    };
    setGarden((prev) => [newPlant, ...prev]);
    showToast(`🌱 "${newPlant.nomePersonalizado}" cadastrada no seu Herbanário!`);
  };

  const handleAddNewAiPlant = (newPlant: PlantEntry) => {
    setPlantsCatalog((prev) => {
      const updated = [newPlant, ...prev];
      try {
        const extraOnly = updated.filter(
          (p) => !BOTANICAL_PLANTS.some((bp) => bp.id === p.id)
        );
        localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(extraOnly));
      } catch (e) {
        console.warn("Erro ao salvar catálogo extra", e);
      }
      return updated;
    });
    showToast(`✨ Monografia de "${newPlant.nomePopular}" catalogada no herbário!`);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2c3328] flex flex-col botanical-pattern">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gardenCount={garden.length}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenWallpapers={() => setIsWallpapersOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {activeTab === "enciclopedia" && (
          <EncyclopediaView
            plants={plantsCatalog}
            onSelectPlant={(plant) => setSelectedPlantForModal(plant)}
            onAddToGarden={handleAddToGarden}
            gardenPlantIds={gardenPlantIds}
            onAddNewAiPlant={handleAddNewAiPlant}
          />
        )}

        {activeTab === "lunar" && <LunarCalendarView />}

        {activeTab === "consultorio" && (
          <DoctorScannerView
            onAddDiagnosedToGarden={(plant, status) => {
              handleAddToGarden(plant, status);
              setActiveTab("meujardim");
            }}
          />
        )}

        {activeTab === "botica" && (
          <ApothecaryView
            plants={plantsCatalog}
            onSelectPlantModal={(plant) => setSelectedPlantForModal(plant)}
          />
        )}

        {activeTab === "meujardim" && (
          <MyGardenView
            garden={garden}
            onWaterPlant={handleWaterPlant}
            onRemovePlant={handleRemovePlant}
            onUpdateNotes={handleUpdateNotes}
            onUpdateStatus={handleUpdatePlantStatus}
            onUpdateFertilizationDate={handleUpdateFertilizationDate}
            onAddNewCustomPlant={handleAddNewCustomPlant}
            allSpecies={plantsCatalog}
            onSelectPlantModal={(plant) => setSelectedPlantForModal(plant)}
          />
        )}

        {activeTab === "mestre" && <BotanistChatView />}
      </main>

      {/* Plant Monograph Sheet Modal */}
      {selectedPlantForModal && (
        <PlantModal
          plant={selectedPlantForModal}
          onClose={() => setSelectedPlantForModal(null)}
          onAddToGarden={handleAddToGarden}
          isInGarden={gardenPlantIds.has(selectedPlantForModal.id)}
        />
      )}

      {/* Interactive Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsOnboardingOpen(false);
        }}
      />

      {/* Botanical Wallpaper Gallery Modal */}
      <WallpaperGallery
        isOpen={isWallpapersOpen}
        onClose={() => setIsWallpapersOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-[#243825] text-[#f7f4ee] px-5 py-3 rounded-2xl shadow-xl border border-[#3e5f3f] flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <span className="text-base">🌿</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Botanical Footer */}
      <footer className="bg-[#1e2d1f] text-[#ded6c5] border-t border-[#314a33] mt-16 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Sprout className="w-5 h-5 text-[#91c584]" />
              <span className="font-serif-botanic text-xl font-bold text-[#f7f3e8]">
                Almanaque Botânico Perpétuo
              </span>
            </div>
            <p className="text-xs text-[#a0947e] font-narrative">
              Tradição vegetal, ritmos astronômicos e sabedoria medicinal desde 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs text-[#b8ab92]">
            <button
              onClick={() => setIsWallpapersOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2b422d] hover:bg-[#38553a] text-[#f0f7ec] border border-[#486b4a] transition-all cursor-pointer font-medium shadow-2xs"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#a4d495]" />
              <span>Wallpapers Botânicos</span>
            </button>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#283e29] hover:bg-[#345136] text-[#e0eed9] border border-[#3f5f41] transition-all cursor-pointer font-medium"
            >
              <Compass className="w-3.5 h-3.5 text-[#91c584]" />
              <span>Guia do Usuário</span>
            </button>
            <button
              onClick={() => setActiveTab("enciclopedia")}
              className="hover:text-[#f7f3e8] transition-colors cursor-pointer"
            >
              Herbário
            </button>
            <button
              onClick={() => setActiveTab("lunar")}
              className="hover:text-[#f7f3e8] transition-colors cursor-pointer"
            >
              Fases da Lua
            </button>
            <button
              onClick={() => setActiveTab("consultorio")}
              className="hover:text-[#f7f3e8] transition-colors cursor-pointer"
            >
              Scanner IA
            </button>
            <button
              onClick={() => setActiveTab("botica")}
              className="hover:text-[#f7f3e8] transition-colors cursor-pointer"
            >
              Botica & Chás
            </button>
            <button
              onClick={() => setActiveTab("meujardim")}
              className="hover:text-[#f7f3e8] transition-colors cursor-pointer"
            >
              Meu Herbanário
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
