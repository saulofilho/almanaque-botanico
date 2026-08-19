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

  // 1. Plant Diagnosis & Identification with Gemini 3.7 Flash
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

      let response;
      if (imageBase64) {
        // Strip data url prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: "application/json",
          },
        });
      } else {
        response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
      }

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro na identificação botânica:", err);
      res.status(500).json({
        error: "Falha ao processar análise botânica: " + (err.message || "Erro desconhecido"),
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro na monografia:", err);
      res.status(500).json({ error: "Erro ao gerar monografia: " + (err.message || "") });
    }
  });

  // 3. Herbarium Botânica Chatbot (Pergunte ao Mestre Botânico)
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

      const chat = ai.chats.create({
        model: "gemini-3.7-flash",
        config: {
          systemInstruction,
        },
      });

      // Send the latest message
      const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "Olá";
      const response = await chat.sendMessage({ message: lastMessage });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Erro no chat botânico:", err);
      res.status(500).json({ error: "Erro ao consultar o Mestre Botânico: " + (err.message || "") });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Erro no receituário fitoterápico:", err);
      res.status(500).json({ error: "Erro ao gerar receitas botânicas: " + (err.message || "") });
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
