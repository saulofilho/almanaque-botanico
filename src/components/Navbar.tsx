import React from "react";
import { 
  Sprout, 
  Moon, 
  Sparkles, 
  FlaskConical, 
  HeartHandshake, 
  BookOpen, 
  MessageSquareQuote,
  Sun,
  Compass,
  Image as ImageIcon
} from "lucide-react";
import { getAstronomicalMoonPhase } from "../data/lunarData";

export type NavTab = "enciclopedia" | "lunar" | "consultorio" | "botica" | "meujardim" | "mestre";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  gardenCount: number;
  onOpenOnboarding?: () => void;
  onOpenWallpapers?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  gardenCount,
  onOpenOnboarding,
  onOpenWallpapers,
}) => {
  const moonInfo = getAstronomicalMoonPhase();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: "enciclopedia", label: "Herbário & Espécies", icon: BookOpen },
    { id: "lunar", label: "Almanaque Lunar", icon: Moon },
    { id: "consultorio", label: "Scanner & Diagnóstico IA", icon: Sparkles },
    { id: "botica", label: "Botica & Fitoterapia", icon: FlaskConical },
    { id: "meujardim", label: "Meu Herbanário", icon: Sprout, badge: gardenCount },
    { id: "mestre", label: "Mestre Botânico", icon: MessageSquareQuote },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e2dcce] shadow-xs">
      {/* Top Banner with Almanac Date & Moon Phase */}
      <div className="bg-[#243825] text-[#e8dfcf] px-4 py-1.5 text-xs font-medium border-b border-[#1b2b1c]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#82a775] animate-pulse"></span>
            <span className="font-cinzel tracking-wider uppercase text-[11px] text-[#c9dec0]">
              Almanaque Botânico Perpétuo
            </span>
            <span className="hidden sm:inline text-[#8da388]">•</span>
            <span className="hidden sm:inline text-[#d5cbb6]">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <button
            onClick={() => setActiveTab("lunar")}
            className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1b2c1d] hover:bg-[#2e4730] transition-colors border border-[#3a553c] text-xs text-[#e8dfcf]"
            title="Ver orientações de plantio para a fase lunar atual"
          >
            <span className="text-sm">{moonInfo.icon}</span>
            <span className="font-semibold text-[#f0e6d6]">{moonInfo.phaseName}</span>
            <span className="text-[#a4bca0]">({moonInfo.illumination}% iluminada)</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab("enciclopedia")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f4f2f] to-[#1f3620] flex items-center justify-center text-[#e9e2d3] shadow-md border border-[#487348] group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-[#98c58b]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-botanic text-2xl font-bold tracking-tight text-[#1e2e1f]">
                  Almanaque Botânico
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e8e2d3] text-[#4d5e49] border border-[#d2c9b6]">
                  Edição 2026
                </span>
              </div>
              <p className="text-[11px] text-[#6b6251] font-narrative italic hidden sm:block">
                Enciclopédia de Cultivo, Fitoterapia Tradicional & Diagnóstico
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#ede8dc]/80 p-1 rounded-xl border border-[#ded5c2]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all relative ${
                    isActive
                      ? "bg-[#284229] text-[#f7f4ee] shadow-sm"
                      : "text-[#4b5545] hover:text-[#1e2e1f] hover:bg-[#e4ddcd]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#a4d495]" : "text-[#6b7c65]"}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-[#a4d495] text-[#1c301d]" : "bg-[#284229] text-[#f7f4ee]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {onOpenWallpapers && (
              <button
                onClick={onOpenWallpapers}
                id="btn-open-wallpapers"
                title="Abrir Galeria de Wallpapers Artísticos"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#544835] hover:text-[#284229] hover:bg-[#e4ddcd] transition-all ml-1 border-l border-[#ded5c2] pl-2.5 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-[#8a7657]" />
                <span className="font-cinzel text-[11px]">Wallpapers</span>
              </button>
            )}

            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                id="btn-open-onboarding"
                title="Abrir Guia Interativo do Almanaque"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#544835] hover:text-[#284229] hover:bg-[#e4ddcd] transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#8a7657]" />
                <span className="font-cinzel text-[11px]">Guia</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Nav Scrollable Strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-[#e8e2d4]">
          {onOpenWallpapers && (
            <button
              onClick={onOpenWallpapers}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#e8e0ce] text-[#4d402e] border border-[#d6cbba] whitespace-nowrap flex-shrink-0"
              title="Galeria de Wallpapers"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#284229]" />
              <span>Wallpapers</span>
            </button>
          )}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#e8e0ce] text-[#4d402e] border border-[#d6cbba] whitespace-nowrap flex-shrink-0"
              title="Abrir Guia do Usuário"
            >
              <Compass className="w-3.5 h-3.5 text-[#284229]" />
              <span>Guia</span>
            </button>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                    : "bg-[#eee8dc] text-[#4b5545] border border-[#ded6c4]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#a4d495]" : "text-[#6b7c65]"}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#a4d495] text-[#1c301d] text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
