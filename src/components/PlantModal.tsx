import React from "react";
import { 
  X, 
  Sun, 
  Droplets, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  FlaskConical, 
  Moon, 
  Sprout, 
  Share2, 
  Printer, 
  Compass,
  BookmarkPlus,
  Check
} from "lucide-react";
import { PlantEntry, UserPlant } from "../types";
import { AdaptiveCareTips } from "./AdaptiveCareTips";

interface PlantModalProps {
  plant: PlantEntry | null;
  onClose: () => void;
  onAddToGarden: (plant: PlantEntry) => void;
  isInGarden: boolean;
  userPlant?: UserPlant | null;
  onWaterPlant?: (plantId: string) => void;
  onUpdatePlantHealth?: (plantId: string, health: UserPlant["estadoSaude"]) => void;
}

export const PlantModal: React.FC<PlantModalProps> = ({
  plant,
  onClose,
  onAddToGarden,
  isInGarden,
  userPlant,
  onWaterPlant,
  onUpdatePlantHealth,
}) => {
  if (!plant) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#faf7f2] rounded-2xl shadow-2xl border border-[#ded5c4] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar with Botanic Foil Accent */}
        <div className="bg-[#243825] text-[#f2ede4] px-6 py-4 flex items-center justify-between border-b border-[#364e37]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#375439] text-[#bce3b0] border border-[#4d704f]">
              {plant.categoria}
            </span>
            <span className="text-xs text-[#c0b49f] font-narrative italic hidden sm:inline">
              Ficha Monográfica • Família {plant.familia}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-[#2e4730] hover:bg-[#3d5e3f] text-[#ded6c5] transition-colors"
              title="Imprimir Ficha do Herbário"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#2e4730] hover:bg-[#3d5e3f] text-[#ded6c5] transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 print:p-0">
          {/* Top Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Plant Image & Specimen Plate */}
            <div className="md:col-span-5 relative group">
              <div className="relative rounded-xl overflow-hidden shadow-md border-2 border-[#ded5c2] bg-[#f0ebd9]">
                <img
                  src={plant.imagemUrl}
                  alt={plant.nomePopular}
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-[#f7f5ee]">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#d6e8ce] block">
                    Espécime Botânico
                  </span>
                  <span className="text-sm font-semibold truncate block">
                    {plant.nomePopular}
                  </span>
                </div>
              </div>

              {/* Add to Garden CTA below image */}
              <button
                onClick={() => onAddToGarden(plant)}
                className={`w-full mt-3 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isInGarden
                    ? "bg-[#d8edd3] text-[#1e3c20] border border-[#a6d19d]"
                    : "bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f4ee]"
                }`}
              >
                {isInGarden ? (
                  <>
                    <Check className="w-4 h-4 text-[#2e6e32]" />
                    <span>Planta no seu Herbanário</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Adicionar ao Meu Herbanário</span>
                  </>
                )}
              </button>
            </div>

            {/* Plant Taxonomy & Intro Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h1 className="font-serif-botanic text-3xl sm:text-4xl font-bold text-[#1a291b] leading-tight">
                  {plant.nomePopular}
                </h1>
                <p className="text-lg text-[#556950] font-narrative italic font-medium mt-0.5">
                  {plant.nomeCientifico}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#eee7d8] text-[#5c5443] font-medium border border-[#ded5c2]">
                    Família: <strong>{plant.familia}</strong>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#eee7d8] text-[#5c5443] font-medium border border-[#ded5c2]">
                    Origem: <strong>{plant.origem}</strong>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#eee7d8] text-[#5c5443] font-medium border border-[#ded5c2]">
                    Ciclo: <strong>{plant.ciclo}</strong>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f3ede1] border border-[#e2d8c3] text-[#3d362b]">
                <p className="text-sm font-narrative leading-relaxed text-[#40382d]">
                  {plant.descricaoCompleta}
                </p>
              </div>

              {/* Toxicity & Safety Badge */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#efe9dc] border border-[#ded4bf]">
                <ShieldAlert className="w-5 h-5 text-[#856526] shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-[#5a481c] block">
                    Segurança & Toxicidade
                  </span>
                  <span className="text-xs text-[#6e5a2b] font-medium">
                    {plant.toxicidade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cultivation Matrix Cards */}
          <div>
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#3c4a37] mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#4a7346]" />
              Guia Prático de Cultivo & Manejo
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Luminosity */}
              <div className="p-3.5 rounded-xl bg-[#f4eee2] border border-[#ded5c2] space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#665a44]">
                  <Sun className="w-4 h-4 text-[#bf7c20]" />
                  <span>Luz Solar</span>
                </div>
                <p className="text-sm font-bold text-[#233322]">{plant.luminosidade}</p>
              </div>

              {/* Watering */}
              <div className="p-3.5 rounded-xl bg-[#f4eee2] border border-[#ded5c2] space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#665a44]">
                  <Droplets className="w-4 h-4 text-[#2b7294]" />
                  <span>Rega</span>
                </div>
                <p className="text-sm font-bold text-[#233322]">{plant.frequenciaRega}</p>
              </div>

              {/* Lunar Phase */}
              <div className="p-3.5 rounded-xl bg-[#f4eee2] border border-[#ded5c2] space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#665a44]">
                  <Moon className="w-4 h-4 text-[#5e4b85]" />
                  <span>Fase Lunar</span>
                </div>
                <p className="text-sm font-bold text-[#233322]">{plant.faseLunarIdeal}</p>
              </div>

              {/* Planting Season */}
              <div className="p-3.5 rounded-xl bg-[#f4eee2] border border-[#ded5c2] space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#665a44]">
                  <Clock className="w-4 h-4 text-[#456b3e]" />
                  <span>Época de Plantio</span>
                </div>
                <p className="text-sm font-bold text-[#233322]">{plant.epocaPlantio}</p>
              </div>
            </div>

            {/* Soil & pH specifics */}
            <div className="mt-3 p-3.5 rounded-xl bg-[#ede5d5] border border-[#d9ceb9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#4b4334]">
              <div>
                <span className="font-semibold text-[#2f2719]">Solo & Substrato: </span>
                <span>{plant.solo}</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#dfd4c0] text-[#332b1d] font-mono font-medium">
                pH ideal: {plant.phIdeal}
              </div>
            </div>
          </div>

          {/* Dicas de Manejo Adaptativo (Saúde da Planta + Clima Local) */}
          <AdaptiveCareTips
            plant={plant}
            userPlant={userPlant}
            onWaterPlant={onWaterPlant}
            onUpdatePlantHealth={onUpdatePlantHealth}
          />

          {/* Phytotherapy & Medicinal Benefits */}
          {plant.usosFitoterapicos && plant.usosFitoterapicos.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#3c4a37] flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#376b3a]" />
                Farmácia Viva & Receituário Tradicional
              </h3>

              <div className="space-y-2.5">
                {plant.usosFitoterapicos.map((uso, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded3be] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-[#1e2e1f]">
                        🌿 {uso.beneficio}
                      </h4>
                    </div>
                    <p className="text-xs text-[#453e32] font-narrative">
                      <strong>Modo de Preparo:</strong> {uso.modoPreparo}
                    </p>
                    <p className="text-xs text-[#52493b]">
                      <strong>Posologia:</strong> {uso.dosagem}
                    </p>
                    {uso.contraindicacao && (
                      <p className="text-[11px] text-[#824424] bg-[#f8e6de] px-2 py-1 rounded border border-[#f0c8b6]">
                        ⚠️ <strong>Atenção:</strong> {uso.contraindicacao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Culinary Usage if present */}
          {plant.culinaria && (
            <div className="p-4 rounded-xl bg-[#edf4e8] border border-[#cbe0c5] space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#345e2c] flex items-center gap-1.5">
                🍽️ Uso Culinário & Gastronomia
              </h4>
              <p className="text-xs text-[#394a34] font-narrative">
                {plant.culinaria}
              </p>
            </div>
          )}

          {/* Pests & Natural Care */}
          {plant.pragasComuns && plant.pragasComuns.length > 0 && (
            <div className="p-4 rounded-xl bg-[#f7f2e7] border border-[#e4dccb] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#63553e] flex items-center gap-1.5">
                🐛 Pragas Comuns & Manejo Biológico
              </h4>
              <div className="flex flex-wrap gap-2">
                {plant.pragasComuns.map((praga, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#ebe1ce] text-[#4f4330] font-medium"
                  >
                    {praga}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Almanac Proverb & Sacred Wisdom */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#243825] to-[#182819] text-[#f7f2e6] border border-[#3b573c] space-y-1.5 shadow-md">
            <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#9bc88d] block">
              Sabedoria do Almanaque Perpétuo
            </span>
            <p className="text-sm font-serif-botanic italic text-[#ebe2ce] leading-relaxed">
              "{plant.dicaAlmanaque}"
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f0ebd9] border-t border-[#ded5c2] flex items-center justify-between">
          <span className="text-xs text-[#706450] font-narrative italic">
            Herbarium Botanicum • Consulta Digital
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#284229] hover:bg-[#1b2e1c] text-[#f4efe4] text-xs font-semibold transition-colors"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
