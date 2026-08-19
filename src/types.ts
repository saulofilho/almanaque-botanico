export interface PlantEntry {
  id: string;
  nomePopular: string;
  nomeCientifico: string;
  familia: string;
  categoria: "Medicinal" | "Ornamental" | "Horta & Ervas" | "Árvores Nativas" | "PANCs" | "Suculentas";
  origem: string;
  luminosidade: "Sol Pleno" | "Meia-Sombra" | "Sombra" | "Sol Pleno ou Meia-Sombra";
  frequenciaRega: "Diária" | "2 a 3 vezes/semana" | "1 vez/semana" | "Rara (solo seco)";
  dificuldade: "Fácil" | "Médio" | "Avançado";
  ciclo: "Anual" | "Perene" | "Bienal";
  epocaPlantio: string;
  faseLunarIdeal: "Lua Nova" | "Lua Crescente" | "Lua Cheia" | "Lua Minguante";
  solo: string;
  phIdeal: string;
  beneficiosMedicinais?: string[];
  usosFitoterapicos?: {
    beneficio: string;
    modoPreparo: string;
    dosagem: string;
    contraindicacao?: string;
  }[];
  culinaria?: string;
  toxicidade: "Não Tóxica (Pet-Friendly)" | "Atenção: Tóxica para pets" | "Tóxica (Manuseio com cuidado)" | "Comestível Segura";
  imagemUrl: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  dicaAlmanaque: string;
  pragasComuns: string[];
}

export interface LunarPhaseInfo {
  nome: "Lua Nova" | "Lua Quarto Crescente" | "Lua Cheia" | "Lua Quarto Minguante";
  icone: string;
  iluminacao: number; // 0 to 100%
  influenciaSeiva: string;
  focoPlantio: string[];
  focoManejo: string[];
  evitarNestaFase: string[];
  proverbio: string;
}

export interface HealthLogEntry {
  data: string; // "YYYY-MM-DD"
  estadoSaude: "Vigorosa" | "Estável" | "Necessita Atenção" | "Em Recuperação";
  nota?: string;
}

export interface UserPlant {
  id: string;
  nomePersonalizado: string;
  especieId?: string;
  nomeCientifico?: string;
  dataPlantio: string;
  ultimaRega: string;
  frequenciaDiasRega: number;
  ultimaAdubacao?: string;
  localizacao: string; // Ex: "Varanda Sul", "Jardim de Inverno", "Cozinha"
  estadoSaude: "Vigorosa" | "Estável" | "Necessita Atenção" | "Em Recuperação";
  historicoSaude?: HealthLogEntry[];
  anotacoes: string;
  imagemUrl?: string;
}

export interface HerbalRecipe {
  id: string;
  titulo: string;
  tipo: "Chá / Infusão" | "Decocção" | "Xarope Natural" | "Banho de Ervas" | "Cataplasma / Pomada" | "Biofertilizante Orgânico" | "Defensivo Natural";
  categoriaBeneficio: "Calmante & Sono" | "Digestão & Fígado" | "Imunidade & Respiração" | "Pele & Cicatrização" | "Jardim & Solo" | "Energia & Vitalidade";
  tempoPreparo: string;
  dificuldade: "Fácil" | "Média";
  ervasPrincipais: string[];
  ingredientes: string[];
  passoAPasso: string[];
  posologia: string;
  contraindicacoes?: string;
  segredoAlmanaque: string;
}

export interface PlantDiagnosisResult {
  nomePopular: string;
  nomeCientifico: string;
  familia?: string;
  confianca: string;
  diagnosticoSaude: string;
  estadoGeral: string;
  sintomasObservados: string[];
  tratamentoOrganico: string[];
  guiaCultivo?: {
    luminosidade: string;
    frequenciaRega: string;
    tipoDeSolo: string;
    adubacao: string;
    poda: string;
  };
  propriedadesMedicinais?: string[];
  toxicidade?: string;
  dicaAlmanaque: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
