import React, { useState } from "react";
import { 
  Sprout, 
  Moon, 
  Sparkles, 
  FlaskConical, 
  BookOpen, 
  Droplets, 
  Calendar, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Heart,
  BarChart3,
  Bot
} from "lucide-react";
import confetti from "canvas-confetti";
import { NavTab } from "./Navbar";

export const STORAGE_KEY_ONBOARDING = "almanaque_onboarding_completed_v1";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

interface OnboardingStep {
  id: string;
  tabId?: NavTab;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  highlights: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    text: string;
  }[];
  actionLabel?: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      tag: "Boas-vindas ao Almanaque",
      title: "Seu Compêndio Vivo de Botânica & Sabedoria Natural",
      subtitle: "Unindo conhecimento ancestral e inteligência artificial",
      description:
        "O Almanaque Botânico foi concebido para jardineiros, entusiastas de fitoterapia e amantes da natureza que buscam cultivar com respeito aos ciclos da Terra e rigor botânico.",
      icon: Compass,
      accentColor: "#284229",
      badgeBg: "bg-[#284229] text-[#f7f4ee]",
      highlights: [
        {
          icon: BookOpen,
          title: "Herbário Enciclopédico",
          text: "Monografias detalhadas de dezenas de espécies medicinais e ornamentais.",
        },
        {
          icon: Moon,
          title: "Sintonia Lunar",
          text: "Calendário astronômico com os melhores momentos de plantio, poda e colheita.",
        },
        {
          icon: Sparkles,
          title: "Diagnóstico Inteligente",
          text: "Identificação botânica e consultor fitoterápico com tecnologia Gemini AI.",
        },
      ],
    },
    {
      id: "enciclopedia",
      tabId: "enciclopedia",
      tag: "Recurso 1 • Herbário & Espécies",
      title: "Enciclopédia & Monografias Botânicas",
      subtitle: "Fichas técnicas, propriedades medicinais e cultivo",
      description:
        "Navegue por espécies catalogadas, pesquise por nomes científicos ou populares, filtre por categorias (Medicinais, Hortas, Suculentas) e adicione espécimes ao seu jardim com apenas um clique.",
      icon: BookOpen,
      accentColor: "#2c4c2d",
      badgeBg: "bg-[#e2edd8] text-[#204022]",
      highlights: [
        {
          icon: Sprout,
          title: "Fichas Completas",
          text: "Luminosidade ideal, pH do solo, regas e partes utilizadas.",
        },
        {
          icon: Heart,
          title: "Guia de Segurança",
          text: "Avisos claros de toxicidade para pets e crianças em cada planta.",
        },
        {
          icon: Sparkles,
          title: "Gerador de Monografias IA",
          text: "Catalogação automática de qualquer nova planta sob demanda.",
        },
      ],
      actionLabel: "Explorar Herbário",
    },
    {
      id: "lunar",
      tabId: "lunar",
      tag: "Recurso 2 • Ritmo Cósmico",
      title: "Almanaque Lunar de Cultivo",
      subtitle: "A influência gravitacional e luminosa na seiva vegetal",
      description:
        "Descubra a fase lunar em tempo real calculada astronomicamente. Saiba exatamente quando a seiva sobe para as folhas ou desce para as raízes para maximizar o sucesso do seu plantio.",
      icon: Moon,
      accentColor: "#394867",
      badgeBg: "bg-[#e0e8f5] text-[#1c2e4a]",
      highlights: [
        {
          icon: Calendar,
          title: "Guia Mês a Mês",
          text: "Tarefas sazonais para as 4 estações do ano e clima brasileiro.",
        },
        {
          icon: Droplets,
          title: "Manejo por Fase",
          text: "Orientações para semeadura de raízes (Minguante) e folhosas (Crescente).",
        },
        {
          icon: ShieldCheck,
          title: "Provérbios Tradicionais",
          text: "Sabedoria ancestral consolidada de agricultores e botânicos.",
        },
      ],
      actionLabel: "Ver Calendário Lunar",
    },
    {
      id: "consultorio",
      tabId: "consultorio",
      tag: "Recurso 3 • Visão Computacional",
      title: "Scanner & Diagnóstico por IA",
      subtitle: "Identifique pragas e deficiências em segundos",
      description:
        "Envie uma foto da sua planta ou descreva os sintomas observados (folhas amareladas, manchas, pragas). A inteligência artificial analisa o quadro e prescreve tratamentos 100% orgânicos.",
      icon: Sparkles,
      accentColor: "#5c4015",
      badgeBg: "bg-[#fcf0d9] text-[#5e3b08]",
      highlights: [
        {
          icon: Bot,
          title: "Diagnóstico Rápido",
          text: "Reconhece espécies e identifica pragas como cochonilhas, ácaros e fungos.",
        },
        {
          icon: FlaskConical,
          title: "Caldas Naturais",
          text: "Receitas de defensivos caseiros (neem, calda bordalesa, sabão neutro).",
        },
        {
          icon: Sprout,
          title: "Salvar no Jardim",
          text: "Adicione a planta identificada diretamente ao seu Herbanário.",
        },
      ],
      actionLabel: "Abrir Scanner Botânico",
    },
    {
      id: "botica",
      tabId: "botica",
      tag: "Recurso 4 • Fitoterapia Tradicional",
      title: "A Botica & Dicionário Terapêutico",
      subtitle: "O poder medicinal das plantas em suas mãos",
      description:
        "Consulte receitas milenares de chás, tinturas, cataplasmas e óleos. Utilize o Dicionário de Propriedades para encontrar ervas para ansiedade, digestão, sono e imunidade com segurança.",
      icon: FlaskConical,
      accentColor: "#42283b",
      badgeBg: "bg-[#f5e3ef] text-[#421d39]",
      highlights: [
        {
          icon: Heart,
          title: "Filtro por Benefício",
          text: "Encontre plantas calmantes, digestivas, cicatrizantes e anti-inflamatórias.",
        },
        {
          icon: FlaskConical,
          title: "Métodos de Extração",
          text: "Instruções passo a passo de infusão, decocção e maceração correta.",
        },
        {
          icon: ShieldCheck,
          title: "Contraindicações",
          text: "Orientações sobre dosagens seguras e alertas para gestantes e crianças.",
        },
      ],
      actionLabel: "Acessar a Botica",
    },
    {
      id: "meujardim",
      tabId: "meujardim",
      tag: "Recurso 5 • Herbanário & Cuidados",
      title: "Meu Jardim, Regas & Calendário de Adubação",
      subtitle: "Acompanhamento diário da saúde do seu cultivo",
      description:
        "Gerencie todas as suas plantas em um só lugar. Receba alertas de irrigação atrasada, visualize gráficos de vitalidade e siga o cronograma sazonal de adubação orgânica.",
      icon: Sprout,
      accentColor: "#1d3821",
      badgeBg: "bg-[#e2eedf] text-[#1c3a21]",
      highlights: [
        {
          icon: Droplets,
          title: "Alertas de Rega",
          text: "Banners visuais de irrigação pendente e botão de rega em lote.",
        },
        {
          icon: BarChart3,
          title: "Gráfico de Vitalidade",
          text: "Acompanhe a distribuição e evolução do estado de saúde das suas plantas.",
        },
        {
          icon: Calendar,
          title: "Cronograma de Adubação",
          text: "Recomendações sazonais de nutrientes e biofertilizantes caseiros.",
        },
      ],
      actionLabel: "Ir para Meu Herbanário",
    },
  ];

  const handleFinish = (targetTab?: NavTab) => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY_ONBOARDING, "true");
      } catch (e) {
        console.warn("Erro ao salvar preferência de onboarding", e);
      }
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#284229", "#84ab7b", "#fae8b4", "#cfa751"],
    });

    onClose();

    if (targetTab) {
      onNavigateTab(targetTab);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#faf7f2] rounded-3xl max-w-2xl w-full border border-[#ded5c2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#f2ecde] border-b border-[#e2d8c3] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#284229] text-[#f7f4ee] shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#354832] block">
                Guia do Explorador Botânico
              </span>
              <span className="text-[11px] text-[#6b6250]">
                Passo {currentStep + 1} de {steps.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step indicator pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-[#284229]"
                      : "w-2 bg-[#d4c8b2] hover:bg-[#b0a289]"
                  }`}
                  title={`Ir para o passo ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleFinish()}
              className="p-1.5 rounded-lg text-[#615542] hover:bg-[#e4dcce] hover:text-[#231e16] transition-colors cursor-pointer"
              title="Fechar guia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Tag & Title */}
          <div className="space-y-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-cinzel ${current.badgeBg}`}
            >
              {current.tag}
            </span>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-[#ede6d6] text-[#284229] border border-[#dcd3bf] shrink-0 mt-1 shadow-xs hidden sm:flex">
                <StepIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f] leading-tight">
                  {current.title}
                </h2>
                <p className="text-sm font-semibold text-[#665a46] font-narrative mt-0.5">
                  {current.subtitle}
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#4d4231] font-narrative leading-relaxed pt-1">
              {current.description}
            </p>
          </div>

          {/* Highlights Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.highlights.map((h, i) => {
              const HIcon = h.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#f4eee2] border border-[#ded5c2] space-y-1.5 transition-all hover:bg-[#efe7d8] hover:border-[#cfc3ad]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#e5dcce] text-[#2b442c] flex items-center justify-center mb-2 shadow-2xs">
                    <HIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-cinzel text-xs font-bold text-[#273826]">
                    {h.title}
                  </h4>
                  <p className="text-[11px] text-[#615542] leading-relaxed">
                    {h.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Direct Navigation Button if Step corresponds to a Tab */}
          {current.tabId && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ece5d5] to-[#f4ede1] border border-[#dcd2be] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#524430] font-cinzel">
                  Deseja começar por aqui?
                </span>
                <p className="text-xs text-[#6e614d]">
                  Você pode pular direto para esta funcionalidade agora mesmo.
                </p>
              </div>
              <button
                onClick={() => handleFinish(current.tabId)}
                className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1c331d] text-[#f7f4ee] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>{current.actionLabel || "Explorar agora"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#f2ecde] border-t border-[#e2d8c3] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Do not show again checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#594d39]">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-[#c2b69f] text-[#284229] focus:ring-0 cursor-pointer"
            />
            <span>Não exibir automaticamente ao iniciar</span>
          </label>

          {/* Pagination Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-[#cdc2ad] bg-[#f8f4ed] hover:bg-[#ebe2d3] text-[#4d412e] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={() => handleFinish()}
              className="px-3 py-2 text-xs text-[#6e614d] hover:text-[#284229] font-medium transition-colors cursor-pointer"
            >
              Pular Guia
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f4ee] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? "Concluir & Explorar" : "Próximo Passo"}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
