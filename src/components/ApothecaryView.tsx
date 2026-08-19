import React, { useState } from "react";
import { 
  FlaskConical, 
  Sparkles, 
  Leaf, 
  Flame, 
  Droplets, 
  AlertCircle, 
  Clock, 
  Heart, 
  BookOpen, 
  Check, 
  Loader2, 
  Compass,
  Sprout
} from "lucide-react";
import { HerbalRecipe, PlantEntry } from "../types";
import { HERBAL_RECIPES } from "../data/recipes";
import { BOTANICAL_PLANTS } from "../data/plants";
import { PropertyDictionary } from "./PropertyDictionary";

const RECIPE_CATEGORIES = [
  "Todas",
  "Calmante & Sono",
  "Digestão & Fígado",
  "Imunidade & Respiração",
  "Jardim & Solo"
] as const;

interface ApothecaryViewProps {
  plants?: PlantEntry[];
  onSelectPlantModal?: (plant: PlantEntry) => void;
}

export const ApothecaryView: React.FC<ApothecaryViewProps> = ({
  plants = BOTANICAL_PLANTS,
  onSelectPlantModal,
}) => {
  const [recipes, setRecipes] = useState<HerbalRecipe[]>(HERBAL_RECIPES);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [activeRecipe, setActiveRecipe] = useState<HerbalRecipe | null>(null);

  // AI Fitotherapy Advisor State
  const [userGoalInput, setUserGoalInput] = useState("");
  const [isGeneratingBlend, setIsGeneratingBlend] = useState(false);
  const [customAiBlendResult, setCustomAiBlendResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredRecipes = recipes.filter((r) => {
    return selectedCategory === "Todas" || r.categoriaBeneficio === selectedCategory;
  });

  const handleGenerateCustomBlend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGoalInput.trim()) return;

    setIsGeneratingBlend(true);
    setAiError(null);
    setCustomAiBlendResult(null);

    try {
      const response = await fetch("/api/gemini/remedy-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomOrGoal: userGoalInput.trim() }),
      });

      if (!response.ok) {
        throw new Error("Erro na formulação de fitoterapia.");
      }

      const data = await response.json();
      setCustomAiBlendResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError("Não foi possível gerar a fórmula no momento. Tente novamente.");
    } finally {
      setIsGeneratingBlend(false);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Hero Apothecary Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#233825] via-[#2f4931] to-[#1c2c1c] text-[#f7f3e8] p-6 sm:p-10 border border-[#3e5e3f] shadow-xl">
        <div className="max-w-3xl space-y-3 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18291a] text-[#bce3b2] text-xs font-semibold uppercase tracking-wider border border-[#375939]">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Farmácia Viva, Chás Medicinais & Biofertilizantes</span>
          </div>

          <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight text-[#f4efe4]">
            Botica Natural & Fitoterapia Ancestral
          </h1>

          <p className="text-sm sm:text-base text-[#d8cfbe] font-narrative leading-relaxed">
            Aprenda a extrair os princípios ativos curativos das plantas em infusões, decocções, xaropes e elixires, além de formular caldas nutritivas e defensivos orgânicos para o solo.
          </p>
        </div>
      </div>

      {/* AI Herbalist Formulator Box */}
      <div className="bg-[#f5efe3] p-6 sm:p-8 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#284229] flex items-center justify-center text-[#9ed38f]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-botanic text-xl sm:text-2xl font-bold text-[#1f2e1f]">
              Consultor de Fitoterapia & Misturas de Ervas com IA
            </h2>
            <p className="text-xs text-[#6e624e] font-narrative">
              Diga o que você sente ou o que deseja tratar para receber formulações personalizadas com dosagem segura.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateCustomBlend} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Ex: 'Insônia com agitação noturna', 'Digestão pesada e azia', 'Biofertilizante para floração de orquídeas'..."
              value={userGoalInput}
              onChange={(e) => setUserGoalInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-sm text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#406343]"
            />
            <button
              type="submit"
              disabled={isGeneratingBlend || !userGoalInput.trim()}
              className="px-6 py-3 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] disabled:opacity-50 text-[#f7f5ee] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              {isGeneratingBlend ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#a4d495]" />
                  <span>Formulando Elixir...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#a4d495]" />
                  <span>Formular Receita Botânica</span>
                </>
              )}
            </button>
          </div>
          {aiError && (
            <p className="text-xs text-[#b83b27] font-medium">⚠️ {aiError}</p>
          )}
        </form>

        {/* AI Custom Blend Output */}
        {customAiBlendResult && (
          <div className="mt-6 p-6 rounded-2xl bg-[#faf7f2] border-2 border-[#3c633a] space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] font-bold font-cinzel uppercase tracking-wider text-[#355e32] block">
                Prescrição Fitoterápica Personalizada
              </span>
              <h3 className="font-serif-botanic text-2xl font-bold text-[#1a2b1b] mt-1">
                {userGoalInput}
              </h3>
              <p className="text-xs text-[#524837] font-narrative italic mt-1 leading-relaxed">
                {customAiBlendResult.visaoGeral}
              </p>
            </div>

            <div className="space-y-4">
              {customAiBlendResult.receitas?.map((rec: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#f5efe3] border border-[#ded5c2] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm text-[#1e2e1f]">
                      🍵 {rec.nome}
                    </h4>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ebe1ce] text-[#544834] font-medium">
                      {rec.tipo}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#453c2e]">
                    <p>
                      <strong>Ingredientes:</strong> {rec.ingredientes?.join(", ")}
                    </p>
                    <p>
                      <strong>Modo de Preparo:</strong> {rec.modoPreparo?.join(" ")}
                    </p>
                    <p>
                      <strong>Posologia:</strong> {rec.frequenciaUso}
                    </p>
                    {rec.contraindicacoes && (
                      <p className="text-[#854527] bg-[#fae8e1] px-2 py-0.5 rounded">
                        ⚠️ <strong>Precaução:</strong> {rec.contraindicacoes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {customAiBlendResult.avisoSeguranca && (
              <p className="text-[11px] text-[#73654f] font-narrative italic text-center">
                ℹ️ {customAiBlendResult.avisoSeguranca}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dicionário de Propriedades Medicinais & Métodos de Extração */}
      <PropertyDictionary
        plants={plants}
        onSelectPlantModal={onSelectPlantModal}
      />

      {/* Category Pills for Curated Recipes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-botanic text-2xl sm:text-3xl font-bold text-[#1f2e1f]">
            Caderno de Fórmulas do Almanaque
          </h2>
          <span className="text-xs text-[#6e624e]">
            {filteredRecipes.length} receitas registradas
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {RECIPE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#284229] text-[#f7f4ee] shadow-xs"
                  : "bg-[#eee6d5] text-[#544937] hover:bg-[#ded4bf] border border-[#d2c7b0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Recipes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-[#faf7f2] rounded-2xl border border-[#ded5c2] p-6 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#edf4e8] text-[#2c5927] border border-[#c6dfbf]">
                  {recipe.categoriaBeneficio}
                </span>
                <span className="text-xs text-[#786b55] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {recipe.tempoPreparo}
                </span>
              </div>

              <h3 className="font-serif-botanic text-xl font-bold text-[#1d2d1e] leading-snug">
                {recipe.titulo}
              </h3>

              <div className="flex flex-wrap gap-1">
                {recipe.ervasPrincipais.map((erva, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#ede4d2] text-[#4d4231] font-medium"
                  >
                    🌿 {erva}
                  </span>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#f5efe3] border border-[#e2d8c3] space-y-1.5 text-xs text-[#453d30]">
                <p className="font-semibold text-[#2b2419]">Ingredientes:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  {recipe.ingredientes.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 text-xs text-[#453d30]">
                <p className="font-semibold text-[#2b2419]">Modo de Preparo:</p>
                <ol className="space-y-1 list-decimal list-inside leading-relaxed font-narrative">
                  {recipe.passoAPasso.map((passo, i) => (
                    <li key={i}>{passo}</li>
                  ))}
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-[#ede5d5] text-xs space-y-1 text-[#423727]">
                <p>
                  <strong>Posologia:</strong> {recipe.posologia}
                </p>
                {recipe.contraindicacoes && (
                  <p className="text-[#8c4021]">
                    <strong>Atenção:</strong> {recipe.contraindicacoes}
                  </p>
                )}
              </div>
            </div>

            {/* Secret of the Almanac */}
            <div className="pt-3 border-t border-[#ebe3d3] text-[11px] text-[#5c6b57] font-serif-botanic italic">
              ✨ Segredo do Almanaque: "{recipe.segredoAlmanaque}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
