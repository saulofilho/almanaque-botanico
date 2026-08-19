import React, { useState } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  Camera, 
  Leaf, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Sun, 
  Sprout, 
  ShieldCheck, 
  Loader2, 
  X, 
  BookmarkPlus,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { PlantDiagnosisResult, PlantEntry } from "../types";

interface DoctorScannerViewProps {
  onAddDiagnosedToGarden: (plant: PlantEntry, status: "Necessita Atenção" | "Em Recuperação") => void;
}

const SAMPLE_DIAGNOSIS_CASES = [
  {
    title: "Cochonilhas Algodonosas",
    notes: "Apareceram pequenos pontinhos brancos que parecem algodão grudados nas axilas das folhas e caule.",
  },
  {
    title: "Folhas Amareladas com Nervuras Verdes (Clorose)",
    notes: "As folhas novas estão nascendo bem amarelas, mas as nervuras continuam verdes. As folhas velhas parecem normais.",
  },
  {
    title: "Oídio (Pó Branco nas Folhas)",
    notes: "Uma fina camada branca que parece farinha ou talco cobriu a parte de cima das folhas de manjericão.",
  },
  {
    title: "Folhas Murchas e Solo Encharcado",
    notes: "As folhas estão amolecidas e caídas, as pontas estão marrons escuras e a terra do vaso não seca há dias.",
  },
];

export const DoctorScannerView: React.FC<DoctorScannerViewProps> = ({
  onAddDiagnosedToGarden,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [userNotes, setUserNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<PlantDiagnosisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setImagePreview(res);
      setImageBase64(res);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setImagePreview(res);
      setImageBase64(res);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imageBase64 && !userNotes.trim()) {
      setErrorMessage("Por favor, envie uma foto ou descreva os sintomas da planta.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setDiagnosisResult(null);
    setSavedSuccess(false);

    try {
      const response = await fetch("/api/gemini/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          userNotes: userNotes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na análise da planta.");
      }

      const data = await response.json();
      setDiagnosisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Falha ao comunicar com o modelo botânico. Verifique a conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGarden = () => {
    if (!diagnosisResult) return;

    const plant: PlantEntry = {
      id: `diagnosed-${Date.now()}`,
      nomePopular: diagnosisResult.nomePopular || "Planta em Tratamento",
      nomeCientifico: diagnosisResult.nomeCientifico || "Espécie",
      familia: diagnosisResult.familia || "Geral",
      categoria: "Medicinal",
      origem: "Jardim",
      luminosidade: (diagnosisResult.guiaCultivo?.luminosidade as any) || "Meia-Sombra",
      frequenciaRega: (diagnosisResult.guiaCultivo?.frequenciaRega as any) || "2 a 3 vezes/semana",
      dificuldade: "Médio",
      ciclo: "Perene",
      epocaPlantio: "Primavera",
      faseLunarIdeal: "Lua Minguante",
      solo: diagnosisResult.guiaCultivo?.tipoDeSolo || "Solo drenável",
      phIdeal: "6.5",
      beneficiosMedicinais: diagnosisResult.propriedadesMedicinais,
      toxicidade: (diagnosisResult.toxicidade as any) || "Não Tóxica (Pet-Friendly)",
      imagemUrl: imagePreview || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      descricaoCurta: `Diagnóstico: ${diagnosisResult.diagnosticoSaude}.`,
      descricaoCompleta: diagnosisResult.estadoGeral,
      dicaAlmanaque: diagnosisResult.dicaAlmanaque,
      pragasComuns: diagnosisResult.sintomasObservados || ["Tratamento Ativo"]
    };

    onAddDiagnosedToGarden(plant, "Em Recuperação");
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Doctor Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#233825] via-[#2d4930] to-[#1c2c1d] text-[#f7f3e8] p-6 sm:p-10 border border-[#3e5e40] shadow-xl">
        <div className="max-w-3xl space-y-3 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172518] text-[#bce3b2] text-xs font-semibold uppercase tracking-wider border border-[#375939]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inteligência Botânica Multimodal com Gemini 3.7 Flash</span>
          </div>

          <h1 className="font-serif-botanic text-3xl sm:text-5xl font-bold leading-tight text-[#f4efe4]">
            Consultório & Scanner Botânico IA
          </h1>

          <p className="text-sm sm:text-base text-[#d8cfbe] font-narrative leading-relaxed">
            Fotografe qualquer planta para identificação imediata ou descreva manchas, pragas e folhas caídas para receber um protocolo de <strong>tratamento 100% orgânico e biológico</strong>.
          </p>
        </div>
      </div>

      {/* Input Section (Upload & Description) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Upload Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#f5efe3] p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#4d4231] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#436e3f]" />
              1. Foto da Planta ou Folha (Opcional)
            </h3>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#3c633a] bg-black/10">
                <img
                  src={imagePreview}
                  alt="Prévia da planta"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#c7bea8] hover:border-[#3c633a] bg-[#faf7f2] rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#eee6d5] flex items-center justify-center text-[#594d3a]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#322c22]">
                    Arraste uma foto aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-[#706450] font-narrative mt-0.5">
                    Aceita JPG, PNG, WEBP (folhas, caule, flores ou vaso inteiro)
                  </p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] text-xs font-semibold text-[#f7f5ee] cursor-pointer transition-colors">
                  <span>Escolher Imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Quick Pre-Set Diagnosis Samples */}
          <div className="bg-[#f5efe3] p-5 rounded-2xl border border-[#ded5c2] space-y-2.5">
            <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#635640] block">
              💡 Exemplos Rápidos de Queixas Botânicas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_DIAGNOSIS_CASES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserNotes(sample.notes)}
                  className="text-left p-2.5 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d3] border border-[#ded5c2] transition-colors text-xs space-y-0.5 cursor-pointer"
                >
                  <span className="font-semibold text-[#29422a] block">
                    {sample.title}
                  </span>
                  <span className="text-[11px] text-[#695c47] line-clamp-1">
                    {sample.notes}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Symptom Description & Submit */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="bg-[#f5efe3] p-6 rounded-3xl border border-[#ded5c2] shadow-xs space-y-4 flex-1">
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#4d4231] flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#436e3f]" />
              2. Descrição dos Sintomas & Ambiente
            </h3>

            <textarea
              rows={6}
              placeholder="Descreva o que está acontecendo: Cor das folhas, frequência de rega, se pega sol direto, se há pontinhos brancos ou teias, tempo em que começou..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-sm text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#406343] resize-none"
            />

            <div className="p-3.5 rounded-xl bg-[#ede5d5] border border-[#d9cdb8] flex items-start gap-2.5 text-xs text-[#524633]">
              <HelpCircle className="w-4 h-4 text-[#497046] shrink-0 mt-0.5" />
              <span>
                <strong>Dica do Botânico:</strong> Quanto mais detalhes você incluir (ambiente interno ou externo, tipo de vaso e rega), mais preciso será o tratamento orgânico.
              </span>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="space-y-2">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (!imageBase64 && !userNotes.trim())}
              className="w-full py-4 px-6 rounded-2xl bg-[#284229] hover:bg-[#1a2e1b] disabled:opacity-50 text-[#f7f5ee] font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#a4d495]" />
                  <span>Analisando Planta com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#a4d495]" />
                  <span>Diagnosticar e Obter Tratamento Orgânico</span>
                </>
              )}
            </button>

            {errorMessage && (
              <p className="text-xs text-[#b83b27] bg-[#fbe7e4] p-3 rounded-xl border border-[#f0c3bc] text-center font-medium">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Diagnosis Report Output */}
      {diagnosisResult && (
        <div className="bg-[#faf7f2] rounded-3xl p-6 sm:p-10 border-2 border-[#3c633a] shadow-xl space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded5c2] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4edcf] text-[#225220] border border-[#a2d499]">
                  Diagnóstico Concluído
                </span>
                <span className="text-xs text-[#706450] font-mono">
                  Confiança: {diagnosisResult.confianca}
                </span>
              </div>
              <h2 className="font-serif-botanic text-3xl sm:text-4xl font-bold text-[#1a291b] mt-1.5">
                {diagnosisResult.nomePopular}
              </h2>
              <p className="text-sm text-[#546b4e] font-narrative italic">
                {diagnosisResult.nomeCientifico} {diagnosisResult.familia ? `• Família ${diagnosisResult.familia}` : ""}
              </p>
            </div>

            {/* Save to Garden button */}
            <button
              onClick={handleSaveToGarden}
              disabled={savedSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                savedSuccess
                  ? "bg-[#d8edd3] text-[#1e3c20] border border-[#a6d19d]"
                  : "bg-[#284229] hover:bg-[#1b2f1c] text-[#f7f4ee] shadow-sm"
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2e6e32]" />
                  <span>Salva no Herbanário!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Adicionar Planta em Tratamento</span>
                </>
              )}
            </button>
          </div>

          {/* Condition & Health State Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 p-5 rounded-2xl bg-[#f5efe3] border border-[#ded5c2] space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#9e7024]" />
                <h3 className="font-semibold text-sm text-[#382f21]">
                  Quadro Clínico: <span className="text-[#854d19]">{diagnosisResult.diagnosticoSaude}</span>
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#4d4231] font-narrative leading-relaxed">
                {diagnosisResult.estadoGeral}
              </p>

              {/* Observed Symptoms Checklist */}
              {diagnosisResult.sintomasObservados && (
                <div className="pt-2">
                  <span className="text-[11px] uppercase font-cinzel font-bold text-[#63553e] block mb-1.5">
                    Sintomas Identificados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosisResult.sintomasObservados.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#ebe1ce] text-[#4f4330] font-medium"
                      >
                        🔍 {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Cultivation Prescriptions */}
            {diagnosisResult.guiaCultivo && (
              <div className="md:col-span-4 p-5 rounded-2xl bg-[#f0ebd9] border border-[#ded4bf] space-y-3 text-xs text-[#423726]">
                <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#3c5e39]">
                  🌿 Manejo Recomendado
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold block text-[#2c2417]">Luminosidade:</span>
                    <span>{diagnosisResult.guiaCultivo.luminosidade}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-[#2c2417]">Rega:</span>
                    <span>{diagnosisResult.guiaCultivo.frequenciaRega}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-[#2c2417]">Solo / Substrato:</span>
                    <span>{diagnosisResult.guiaCultivo.tipoDeSolo}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organic Step-by-Step Treatment Plan */}
          <div className="p-6 rounded-2xl bg-[#edf5eb] border-2 border-[#b5dbad] space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#2d6b28]" />
              <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1e471b]">
                Protocolo de Tratamento 100% Orgânico & Natural
              </h3>
            </div>

            <ol className="space-y-3">
              {diagnosisResult.tratamentoOrganico?.map((passo, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#253d23]">
                  <span className="w-6 h-6 rounded-full bg-[#284229] text-[#f7f4ee] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{passo}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Almanac Proverb & Lunar Tip for Recovery */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#243825] to-[#182819] text-[#f7f2e6] border border-[#3b573c] space-y-1.5 shadow-md">
            <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#9bc88d] block">
              Conselho do Almanaque para a Recuperação
            </span>
            <p className="text-sm font-serif-botanic italic text-[#ebe2ce] leading-relaxed">
              "{diagnosisResult.dicaAlmanaque}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
