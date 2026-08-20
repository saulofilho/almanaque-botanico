import { FieldJournalEntry } from "../types";

export const SAMPLE_FIELD_JOURNAL: FieldJournalEntry[] = [
  {
    id: "journal-1",
    userPlantId: "1", // Alegrim do Campo / Alecrim
    plantName: "Alecrim da Varanda",
    data: "2026-08-18",
    hora: "09:30",
    categoria: "Mudança Foliar & Sintomas",
    severidade: "Moderada",
    titulo: "Amarelecimento e pontas secas nas folhas basais",
    descricao: "Notei que as ramificações inferiores estão perdendo a coloração verde escura e algumas folhas caíram. O solo estava ligeiramente úmido mesmo 3 dias após a última rega.",
    fotos: [
      "https://images.unsplash.com/photo-1515586000433-a557d3836078?auto=format&fit=crop&w=600&q=80"
    ],
    acaoTomada: "Espaçada a frequência de rega para 7 dias, revolvido o substrato na superfície para aeração e adicionado um punhado de areia grossa na borda do vaso.",
    statusResolucao: "Em Acompanhamento",
    faseLunar: "Lua Quarto Crescente",
    temperaturaClima: "Ensolarado • 26°C",
    tags: ["rega", "drenagem", "folhas-amarelas"],
    criadoEm: "2026-08-18T09:30:00.000Z"
  },
  {
    id: "journal-2",
    userPlantId: "3", // Manjericão
    plantName: "Manjericão Sagrado / Alfavaca",
    data: "2026-08-15",
    hora: "16:45",
    categoria: "Pragas & Insetos",
    severidade: "Leve",
    titulo: "Início de cochonilhas algodonosas nas axilas foliares",
    descricao: "Identificados pequenos agregados brancos parecidos com algodão nas junções das hastes jovens. Não há danos graves na folhagem principal ainda.",
    fotos: [
      "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=600&q=80"
    ],
    acaoTomada: "Remoção manual com haste de algodão embebida em álcool 70% diluído e borrifada calda de sabão de coco neutro com óleo de neem a 1% ao entardecer.",
    statusResolucao: "Resolvido",
    faseLunar: "Lua Nova",
    temperaturaClima: "Parcialmente nublado • 23°C",
    tags: ["cochonilha", "defensivo-natural", "neem"],
    criadoEm: "2026-08-15T16:45:00.000Z"
  },
  {
    id: "journal-3",
    userPlantId: "2", // Lavanda
    plantName: "Lavanda Francesa",
    data: "2026-08-12",
    hora: "10:15",
    categoria: "Brotamento & Floração",
    severidade: "Positiva",
    titulo: "Emissão de novas espigas florais e brotos vigorosos",
    descricao: "Após a adubação com casca de ovo e biofertilizante de banana, surgiram 4 novos pendúnculos florais com aroma pronunciado de óleos essenciais.",
    fotos: [
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80"
    ],
    acaoTomada: "Mantida exposição direta ao sol da manhã (6h) e aplicado composto orgânico superficial para suporte à floração.",
    statusResolucao: "Observação Contínua",
    faseLunar: "Lua Cheia",
    temperaturaClima: "Céu limpo • 28°C",
    tags: ["floração", "óleos-essenciais", "vigor"],
    criadoEm: "2026-08-12T10:15:00.000Z"
  }
];
