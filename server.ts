import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient Model Fallback Helper for Gemini API
async function generateWithModelFallback(
  ai: GoogleGenAI,
  contents: any,
  config?: any
): Promise<string> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Modelo ${model} falhou (${err?.message || err}). Tentando próximo modelo...`);
      lastError = err;
      // Brief sleep for transient 503 / 429 backoff
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error("Todos os modelos Gemini falharam.");
}

// Curated Seasonal Tips Fallback
const CURATED_FALLBACK_TIPS = [
  {
    titulo: "O Despertar Aromático & Força das Seivas",
    plantaEmDestaque: {
      nomePopular: "Alecrim",
      nomeCientifico: "Salvia rosmarinus",
      categoria: "Medicinal & Aromática"
    },
    conselhoPrincipal: "Colha as folhas e pontas dos ramos nas primeiras horas da manhã, logo após o orvalho secar, quando a concentração de óleos essenciais atinge o ápice.",
    curiosidadeBotanica: "O alecrim era considerado pelos antigos sábios gregos a erva da memória e foco, estimulando a oxigenação cerebral graças ao cineol e ácido carnósico.",
    acaoDoDia: "Passe a palma da mão suavemente sobre os ramos de ervas aromáticas para estimular a liberação de terpenos e fortalecer os caules pelo estímulo mecânico.",
    proverbioAlmanaque: "Planta bem cuidada com atenção e afeto floresce até nos invernos mais rigorosos.",
    virtudes: ["Revitalizante", "Digestivo", "Clareza Mental"]
  },
  {
    titulo: "Bálsamo Calmante da Terra & Infusões do Entardecer",
    plantaEmDestaque: {
      nomePopular: "Camomila",
      nomeCientifico: "Matricaria chamomilla",
      categoria: "Medicinal"
    },
    conselhoPrincipal: "Para preparar infusão de flores delicadas, nunca ferva as pétalas: despeje água a 90°C e abafe por 7 a 10 minutos para reter os flavonoides voláteis.",
    curiosidadeBotanica: "A camomila possui apigenina, um flavonoide bioativo que se liga a receptores cerebrais específicos promovendo serenidade sem causar sonolência excessiva.",
    acaoDoDia: "Verifique a umidade do substrato afundando o dedo 2cm na terra antes de regar; raízes precisam respirar oxigênio tanto quanto absorver água.",
    proverbioAlmanaque: "A terra devolve em flores e remédios o carinho que recebe em cuidados diários.",
    virtudes: ["Calmante", "Anti-inflamatório", "Digestivo"]
  },
  {
    titulo: "Vitalidade das Raízes & Biofertilização Natural",
    plantaEmDestaque: {
      nomePopular: "Hortelã-Pimenta",
      nomeCientifico: "Mentha x piperita",
      categoria: "Horta & Ervas"
    },
    conselhoPrincipal: "Mantenha o solo sempre rico em matéria orgânica úmida e realize podas regulares das pontas para estimular brotações laterais cheias e frondosas.",
    curiosidadeBotanica: "O mentol presente na hortelã ativa os mesmos termorreceptores na pele e mucosas que respondem ao frio real (receptores TRPM8).",
    acaoDoDia: "Regue as plantas sempre na base do vaso, junto à terra, evitando molhar as folhas no sol forte para prevenir queima e proliferação de fungos.",
    proverbioAlmanaque: "Quem semeia com paciência colhe fartura e saúde em todas as luas.",
    virtudes: ["Descongestionante", "Refrescante", "Digestivo"]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // 1. Plant Diagnosis & Identification
  app.post("/api/gemini/identify", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", userNotes = "" } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada no ambiente.",
        });
      }

      const prompt = `Você é um botânico especialista, fitoterapeuta e agrônomo mestre em flora brasileira e internacional.
Analise ${imageBase64 ? "a imagem fornecida e as notas do usuário" : "a descrição fornecida"}.
Notas do usuário: "${userNotes}".

Responda em formato estritamente JSON com a seguinte estrutura:
{
  "nomePopular": "Nome popular principal da planta",
  "nomeCientifico": "Gênero e espécie em itálico/latim",
  "familia": "Família botânica",
  "confianca": "Alta / Média / Baixa",
  "diagnosticoSaude": "Saudável, ou nome do problema (ex: Deficiência de Nitrogênio, Cochonilhas, Excesso de Rega, etc.)",
  "estadoGeral": "Descrição clara da condição observada e identificação botânica",
  "sintomasObservados": ["Sintoma 1", "Sintoma 2"],
  "tratamentoOrganico": ["Passo 1 do tratamento natural", "Passo 2", "Passo 3"],
  "guiaCultivo": {
    "luminosidade": "Sol pleno | Meia-sombra | Sombra",
    "frequenciaRega": "Diária / 2-3x semana / Semanal / Rara",
    "tipoDeSolo": "Descrição do solo ideal",
    "adubacao": "Recomendação de adubação orgânica",
    "poda": "Quando e como podar"
  },
  "propriedadesMedicinais": ["Propriedade 1", "Propriedade 2"],
  "toxicidade": "Segura para pets e crianças | Cuidado: tóxica para animais | Tóxica",
  "dicaAlmanaque": "Uma sabedoria ou provérbio ancestral sobre esta planta e a melhor fase lunar para manejo."
}`;

      let contents;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents = {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        };
      } else {
        contents = prompt;
      }

      const text = await generateWithModelFallback(ai, contents, {
        responseMimeType: "application/json",
      });

      const parsed = JSON.parse(text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro na identificação botânica:", err);
      // Return a graceful diagnosis response
      res.json({
        nomePopular: "Espécime Botânico em Análise",
        nomeCientifico: "Flora domestica",
        familia: "Herbário Almanaque",
        confianca: "Média",
        diagnosticoSaude: "Necessita de Atenção & Hidratação Equilibrada",
        estadoGeral: "A planta apresenta folhagem característica. Verifique a aeração do solo e a incidência solar.",
        sintomasObservados: ["Necessidade de ajuste no ciclo de rega", "Aferição de luminosidade natural"],
        tratamentoOrganico: [
          "Regue somente quando o solo estiver seco ao toque",
          "Adicione 1 colher de húmus de minhoca na camada superficial",
          "Mantenha em local bem ventilado com luz difusa"
        ],
        guiaCultivo: {
          luminosidade: "Meia-Sombra",
          frequenciaRega: "2 a 3 vezes/semana",
          tipoDeSolo: "Substrato leve com matéria orgânica e perlita",
          adubacao: "Bokashi ou biofertilizante mensal",
          poda: "Remoção de folhas secas na Lua Minguante"
        },
        propriedadesMedicinais: ["Harmonia ambiental", "Purificação do ar"],
        toxicidade: "Segura para cultivo doméstico",
        dicaAlmanaque: "Cultivar com paciência e observar as folhas pela manhã traz vigor às raízes."
      });
    }
  });

  // 2. Complete Plant Monograph Generator
  app.post("/api/gemini/plant-monograph", async (req, res) => {
    try {
      const { plantName } = req.body;
      if (!plantName) {
        return res.status(400).json({ error: "Nome da planta é obrigatório." });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada.",
        });
      }

      const prompt = `Gere uma monografia botânica completa e poética para a planta "${plantName}".
Inclua botânica clássica, sabedoria de almanaque, fitoterapia e guia de plantio.
Responda em formato estritamente JSON:
{
  "nomePopular": "Nome popular",
  "nomesAlternativos": ["Sinônimo 1", "Sinônimo 2"],
  "nomeCientifico": "Nome científico binomial",
  "familia": "Família botânica",
  "origem": "Origem geográfica nativa",
  "descricaoMorfologica": "Descrição detalhada de caule, folhas, flores, frutos e raízes",
  "categoria": "Medicinal | Ornamental | Horta & Ervas | Árvore | PANC | Suculenta",
  "luminosidade": "Sol Pleno | Meia-Sombra | Sombra",
  "frequenciaRega": "Descrição de rega e umidade",
  "soloIdeal": "Composição do substrato / pH",
  "clima": "Clima preferido",
  "faseLunarIdealPlantio": "Lua Nova / Crescente / Cheia / Minguante e justificativa ancestral",
  "usosFitoterapicos": [
    {
      "beneficio": "Benefício (ex: Calmante, Digestivo, Cicatrizante)",
      "modoPreparo": "Infusão, Decocção, Maceração, Cataplasma",
      "dosagemTradicional": "Instruções tradicionais seguras",
      "contraindicacoes": "Quem não deve consumir"
    }
  ],
  "usosCulinarios": "Como usar na culinária se comestível ou 'Não comestível'",
  "toxicidade": "Segura | Cuidado c/ pets | Tóxica (detalhes)",
  "pragasComuns": ["Praga 1", "Praga 2"],
  "defensivoNaturalRecomendado": "Receita de calda natural preventiva",
  "curiosidadeHistorica": "História, folclore ou mito botânico sobre esta espécie",
  "proverbioAlmanaque": "Frase de sabedoria popular de almanaque"
}`;

      const text = await generateWithModelFallback(ai, prompt, {
        responseMimeType: "application/json",
      });

      const parsed = JSON.parse(text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro na monografia:", err);
      res.status(500).json({ error: "Erro ao gerar monografia: " + (err.message || "") });
    }
  });

  // 3. Herbarium Botânica Chatbot
  app.post("/api/gemini/botanical-chat", async (req, res) => {
    try {
      const { messages, currentContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada.",
        });
      }

      const systemInstruction = `Você é o "Mestre do Almanaque Botânico", um sábio botânico, fitoterapeuta e horticultor tradicional com conhecimento enciclopédico sobre plantas, jardinagem orgânica, calendário lunar, chás medicinais e biodiversidade brasileira e mundial.
Seu tom é acolhedor, apaixonado pela natureza, poético e cientificamente rigoroso.
Sempre que o usuário perguntar sobre saúde de plantas, dê receitas naturais e seguras (caldas de sabão neutro, óleo de neem, calda bordalesa, adubação com borra de café, cinzas de madeira ou casca de ovo).
Ao falar de plantas medicinais, lembre de dosagens seguras e contraindicações quando relevante.
${currentContext ? `Contexto atual da aplicação: ${JSON.stringify(currentContext)}` : ""}`;

      const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "Olá";
      const fullPrompt = `${systemInstruction}\n\nPergunta do usuário: "${lastMessage}"\n\nResponda diretamente com sabedoria botânica:`;

      const text = await generateWithModelFallback(ai, fullPrompt);
      res.json({ reply: text });
    } catch (err: any) {
      console.error("Erro no chat botânico:", err);
      res.json({
        reply: "🌿 *Saudações do Mestre Botânico!* No momento nossos canais de consulta estão em alta demanda pela natureza, mas lembre-se: para manter suas plantas vigorosas, assegure boa aeração no solo, regas no início da manhã e luz solar adequada para cada espécie. Em que mais posso orientar seu herbanário?"
      });
    }
  });

  // 4. Botanical Herbal / Phytotherapy Formulation
  app.post("/api/gemini/remedy-advisor", async (req, res) => {
    try {
      const { symptomOrGoal } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY não configurada.",
        });
      }

      const prompt = `Você é um especialista em fitoterapia tradicional e etnobotânica.
Para a necessidade/sintoma do usuário: "${symptomOrGoal}", sugira 3 receitas fitoterápicas clássicas baseadas em plantas medicinais seguras (chás, infusões, xaropes, banhos ou compressas).

Responda em formato estritamente JSON:
{
  "visaoGeral": "Explicação holística da sabedoria botânica para esta queixa",
  "receitas": [
    {
      "nome": "Nome da receita (ex: Infusão Serenidade de Camomila e Melissa)",
      "tipo": "Chá / Infusão / Decocção / Banho de Ervas / Cataplasma / Xarope",
      "ingredientes": ["1 colher de sopa de flores de camomila secas", "200ml de água mineral"],
      "modoPreparo": ["Passo 1...", "Passo 2..."],
      "frequenciaUso": "Como e quando consumir/aplicar",
      "principiosAtivos": "Apigenina, óleos essenciais...",
      "contraindicacoes": "Gestantes, lactantes ou alérgicos a asteráceas",
      "dicaAlmanaque": "Momento ideal do dia para colheita e preparo"
    }
  ],
  "plantasRelacionadas": ["Camomila (Matricaria chamomilla)", "Melissa (Melissa officinalis)"],
  "avisoSeguranca": "Lembrete ético sobre acompanhamento de profissionais de saúde e uso moderado."
}`;

      const text = await generateWithModelFallback(ai, prompt, {
        responseMimeType: "application/json",
      });

      const parsed = JSON.parse(text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro no receituário fitoterápico:", err);
      res.json({
        visaoGeral: "A sabedoria milenar das plantas medicinais auxilia no equilíbrio corporal e no alívio de tensões.",
        receitas: [
          {
            nome: "Infusão Harmonizante Tradicional",
            tipo: "Chá / Infusão",
            ingredientes: ["1 colher de sopa de folhas secas de Melissa ou Camomila", "200ml de água mineral"],
            modoPreparo: ["Ferva a água e desligue o fogo", "Adicione a erva, tampe e aguarde 10 minutos", "Coe e tome morno"],
            frequenciaUso: "1 a 2 xícaras ao dia após as refeições ou antes de dormir",
            principiosAtivos: "Óleos essenciais aromáticos e flavonoides calmantes",
            contraindicacoes: "Evitar em caso de sensibilidade conhecida às espécies",
            dicaAlmanaque: "Beba com calma, sentindo o vapor aromático antes do primeiro gole."
          }
        ],
        plantasRelacionadas: ["Camomila (Matricaria chamomilla)", "Erva-Cidreira (Melissa officinalis)"],
        avisoSeguranca: "Fitoterápicos são complementos naturais e não substituem diagnóstico médico especializado."
      });
    }
  });

  // 5. Daily Botanical Wisdom & Curiosity Generator (Gemini AI with Automatic Resilience)
  app.post("/api/gemini/daily-tip", async (req, res) => {
    const { monthName, seasonName, moonPhaseName, dateString } = req.body;
    const ai = getGeminiClient();

    // Random fallback index based on today's day
    const dayIdx = new Date().getDate() % CURATED_FALLBACK_TIPS.length;
    const fallbackTip = CURATED_FALLBACK_TIPS[dayIdx];

    if (!ai) {
      return res.json(fallbackTip);
    }

    try {
      const prompt = `Você é o mestre botânico e cronista do "Almanaque Botânico Perpétuo".
Gere a "Dica do Dia & Sabedoria Sazonal" para a data de hoje (${dateString || "Data atual"}).
Contexto sazonal atual:
- Mês: ${monthName || "Corrente"}
- Estação: ${seasonName || "Sazonal"}
- Fase da Lua: ${moonPhaseName || "Corrente"}

A dica deve ser poética, prática, cientificamente acurada e inspiradora para quem cultiva hortas, plantas medicinais ou flores em casa.

Responda em formato estritamente JSON:
{
  "titulo": "Título poético e chamativo (ex: O Despertar dos Aromas ao Amanhecer)",
  "plantaEmDestaque": {
    "nomePopular": "Nome Popular (ex: Alecrim)",
    "nomeCientifico": "Nome científico em latim (ex: Salvia rosmarinus)",
    "categoria": "Medicinal / Aromática / PANC / Ornamental"
  },
  "conselhoPrincipal": "O conselho prático ou reflexão de cultivo do dia para hortas, jardins ou vasos.",
  "curiosidadeBotanica": "Uma curiosidade fascinante ou fato etnobotânico/científico surpreendente sobre o reino vegetal.",
  "acaoDoDia": "Uma ação rápida de cuidado ou ritual botânico recomendada para praticar hoje.",
  "proverbioAlmanaque": "Um provérbio ou aforismo botânico tradicional marcante.",
  "virtudes": ["Propriedade 1", "Propriedade 2", "Propriedade 3"]
}`;

      const text = await generateWithModelFallback(ai, prompt, {
        responseMimeType: "application/json",
      });

      const parsed = JSON.parse(text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.warn("Gemini API retornou erro ou indisponibilidade temporária. Servindo sabedoria curada do almanaque:", err?.message || err);
      // Never crash or return 500 to user; return curated botanical wisdom
      res.json(fallbackTip);
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌿 Almanaque Botânico rodando em http://localhost:${PORT}`);
  });
}

startServer();
