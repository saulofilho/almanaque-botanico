import React, { useState } from "react";
import { 
  Download, 
  Eye, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  X, 
  Check, 
  Share2, 
  ExternalLink,
  Layers,
  Image as ImageIcon
} from "lucide-react";
import confetti from "canvas-confetti";

// Imported generated assets
import moonGardenImg from "../assets/images/botanical_moon_garden_1787164191249.jpg";
import apothecaryImg from "../assets/images/herbal_apothecary_flora_1787164207491.jpg";
import tropicalImg from "../assets/images/tropical_rainforest_flora_1787164220375.jpg";
import conservatoryImg from "../assets/images/greenhouse_conservatory_1787164233902.jpg";

export interface WallpaperItem {
  id: string;
  title: string;
  subtitle: string;
  format: "mobile" | "desktop";
  dimensions: string;
  aspectRatio: string;
  description: string;
  palette: string[];
  imageUrl: string;
  tags: string[];
}

export const BOTANICAL_WALLPAPERS: WallpaperItem[] = [
  {
    id: "moon-garden",
    title: "Jardim Lunar Noturno",
    subtitle: "Flores da lua, samambaias prateadas e luz estelar",
    format: "mobile",
    dimensions: "1080 × 1920 px (9:16)",
    aspectRatio: "aspect-[9/16]",
    description: "Ilustração botânica vintage nobre com paleta esmeralda e toques de ouro antigo, inspirada nos ciclos da lua cheia.",
    palette: ["#1c2e20", "#3d5a40", "#d4b886", "#141d16"],
    imageUrl: moonGardenImg,
    tags: ["Nocturno", "Fase Lunar", "Celular", "Vintage"]
  },
  {
    id: "apothecary-flora",
    title: "Herbário da Botica Tradicional",
    subtitle: "Camomila, alecrim, eucalipto e sálvia em aquarela",
    format: "mobile",
    dimensions: "1080 × 1920 px (9:16)",
    aspectRatio: "aspect-[9/16]",
    description: "Composição artística em papel pergaminho com ervas medicinais clássicas e textura natural de aquarela botânica.",
    palette: ["#f5ede0", "#526e4f", "#e6bc5c", "#70563b"],
    imageUrl: apothecaryImg,
    tags: ["Fitoterapia", "Ervas", "Celular", "Aquarela"]
  },
  {
    id: "tropical-sanctuary",
    title: "Santuário Tropical & Costela-de-Adão",
    subtitle: "Monstera deliciosa, orquídeas e raios solares",
    format: "mobile",
    dimensions: "1080 × 1920 px (9:16)",
    aspectRatio: "aspect-[9/16]",
    description: "Pintura a óleo botânica com verdes profundos e luz matinal atravessando a copa de uma estufa equatorial.",
    palette: ["#0f2818", "#245030", "#78a870", "#e0b04c"],
    imageUrl: tropicalImg,
    tags: ["Tropical", "Monstera", "Celular", "Arte Clássica"]
  },
  {
    id: "conservatory-panorama",
    title: "Estufa Real do Conservatório",
    subtitle: "Cúpulas de vidro, árvores cítricas e herbanário",
    format: "desktop",
    dimensions: "1920 × 1080 px (16:9)",
    aspectRatio: "aspect-[16/9]",
    description: "Litografia panorâmica de um jardim botânico imperial durante a hora de ouro, perfeito para telas de computador e tablets.",
    palette: ["#2d4030", "#cbb387", "#849e7b", "#4a3525"],
    imageUrl: conservatoryImg,
    tags: ["Panorâmico", "Desktop", "Estufa", "Arquitetura"]
  }
];

interface WallpaperGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WallpaperGallery: React.FC<WallpaperGalleryProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<"all" | "mobile" | "desktop">("all");
  const [previewWallpaper, setPreviewWallpaper] = useState<WallpaperItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredWallpapers = BOTANICAL_WALLPAPERS.filter((w) => {
    if (selectedFormat === "all") return true;
    return w.format === selectedFormat;
  });

  const handleDownload = async (wallpaper: WallpaperItem) => {
    setDownloadingId(wallpaper.id);

    try {
      // Create download trigger
      const link = document.createElement("a");
      link.href = wallpaper.imageUrl;
      link.download = `Almanaque_Botanico_${wallpaper.id}_wallpaper.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#284229", "#d4b886", "#84ab7b"],
      });
    } catch (e) {
      console.error("Erro ao baixar wallpaper:", e);
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#faf7f2] rounded-3xl max-w-5xl w-full border border-[#ded5c2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f2ecde] border-b border-[#e2d8c3] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#284229] text-[#f7f4ee] shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
                  Galeria de Wallpapers Botânicos
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#284229] text-[#e8eedf]">
                  Arte Exclusiva
                </span>
              </div>
              <p className="text-xs text-[#6b6250] font-narrative">
                Ilustrações de alta definição para decorar a tela do seu celular, tablet ou computador.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#615542] hover:bg-[#e4dcce] hover:text-[#231e16] transition-colors cursor-pointer"
            title="Fechar Galeria"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="px-6 py-3 bg-[#ebe4d4] border-b border-[#ded4bf] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#dfd6c2] p-1 rounded-xl">
            <button
              onClick={() => setSelectedFormat("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "all"
                  ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                  : "text-[#4d412d] hover:bg-[#d4caa6]"
              }`}
            >
              Todos ({BOTANICAL_WALLPAPERS.length})
            </button>
            <button
              onClick={() => setSelectedFormat("mobile")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "mobile"
                  ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                  : "text-[#4d412d] hover:bg-[#d4caa6]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular / Retrato</span>
            </button>
            <button
              onClick={() => setSelectedFormat("desktop")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFormat === "desktop"
                  ? "bg-[#284229] text-[#f7f4ee] shadow-2xs"
                  : "text-[#4d412d] hover:bg-[#d4caa6]"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop / Panorâmico</span>
            </button>
          </div>

          <span className="text-xs text-[#6e604c] font-cinzel hidden sm:inline">
            Arte gerada em alta fidelidade
          </span>
        </div>

        {/* Wallpaper Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className="group rounded-2xl bg-[#f4eee2] border border-[#ded5c2] overflow-hidden flex flex-col hover:border-[#b8a78c] hover:shadow-lg transition-all"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative overflow-hidden bg-[#1f2820] aspect-[3/4] sm:aspect-[9/16] cursor-pointer">
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onClick={() => setPreviewWallpaper(wallpaper)}
                  />

                  {/* Format Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[#f5f1e8] text-[10px] font-semibold border border-white/15">
                    {wallpaper.format === "mobile" ? (
                      <Smartphone className="w-3 h-3 text-[#a4d495]" />
                    ) : (
                      <Monitor className="w-3 h-3 text-[#d4b886]" />
                    )}
                    <span>{wallpaper.format === "mobile" ? "Celular" : "Desktop"}</span>
                  </div>

                  {/* Hover Overlay with Preview & Download */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                    <button
                      onClick={() => setPreviewWallpaper(wallpaper)}
                      className="flex-1 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/30 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar</span>
                    </button>
                    <button
                      onClick={() => handleDownload(wallpaper)}
                      className="p-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] text-white text-xs font-semibold flex items-center justify-center transition-all shadow-md cursor-pointer"
                      title="Baixar Imagem"
                    >
                      {downloadingId === wallpaper.id ? (
                        <Check className="w-4 h-4 text-[#a4d495]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif-botanic text-base font-bold text-[#1f2e1f] leading-snug">
                      {wallpaper.title}
                    </h3>
                    <p className="text-xs text-[#6e614d] font-narrative line-clamp-2 mt-0.5">
                      {wallpaper.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e2d8c3] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#7a6d59]">
                      {wallpaper.dimensions}
                    </span>

                    <button
                      onClick={() => handleDownload(wallpaper)}
                      className="px-3 py-1.5 rounded-lg bg-[#284229] hover:bg-[#1a2f1b] text-[#f7f4ee] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer with Instructions */}
        <div className="px-6 py-4 bg-[#f2ecde] border-t border-[#e2d8c3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#635542]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8a7657]" />
            <span>
              <strong>Dica de uso:</strong> Após baixar o arquivo, abra a galeria de fotos do seu aparelho e selecione <em>"Definir como imagem de fundo"</em>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#e4dcce] hover:bg-[#d8cebe] text-[#3d3324] font-semibold transition-colors cursor-pointer"
          >
            Fechar Galeria
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Preview Modal */}
      {previewWallpaper && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewWallpaper(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewWallpaper(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Fechar Visualização"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Preview Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={previewWallpaper.imageUrl}
                alt={previewWallpaper.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
            </div>

            {/* Bottom Floating Bar */}
            <div className="bg-[#1f2b1f]/95 backdrop-blur-md border border-white/15 px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 max-w-lg w-full text-white">
              <div>
                <h4 className="font-serif-botanic text-sm font-bold text-[#f7f3e8]">
                  {previewWallpaper.title}
                </h4>
                <p className="text-xs text-[#a8bda5]">
                  {previewWallpaper.dimensions}
                </p>
              </div>

              <button
                onClick={() => handleDownload(previewWallpaper)}
                className="px-4 py-2 rounded-xl bg-[#84ab7b] hover:bg-[#97c28d] text-[#162918] font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar em Alta Resolução</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
