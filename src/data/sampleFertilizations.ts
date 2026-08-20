import { ScheduledFertilization } from "../types";

// Helper to get ISO date string offset from today
const getOffsetDateIso = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

export const SAMPLE_FERTILIZATIONS: ScheduledFertilization[] = [
  {
    id: "fert-sched-1",
    userPlantId: "garden-lavanda",
    plantName: "Lavanda do Parapeito",
    dataAgendada: getOffsetDateIso(0), // HOJE (due today)
    horaAgendada: "08:30",
    tipoAdubo: "Farinha de Casca de Ovo + Cinzas",
    modoAplicacao: "Incorporação leve na borda do vaso",
    dosagem: "1 colher de chá na superfície",
    faseLunarRecomendada: "Lua Crescente",
    observacoes: "Reforço de cálcio e potássio para estimular floração e espessamento dos caules.",
    status: "Pendente",
    criadoEm: "2026-08-10T10:00:00Z"
  },
  {
    id: "fert-sched-2",
    userPlantId: "garden-alecrim",
    plantName: "Alecrim da Cozinha",
    dataAgendada: getOffsetDateIso(3), // Em 3 dias
    horaAgendada: "09:00",
    tipoAdubo: "Biofertilizante de Casca de Banana (K)",
    modoAplicacao: "Fertirrigação diluída (1:10)",
    dosagem: "100ml na água da rega matinal",
    faseLunarRecomendada: "Lua Cheia",
    observacoes: "Estimular o aroma dos óleos essenciais com potássio orgânico.",
    status: "Pendente",
    criadoEm: "2026-08-12T14:20:00Z"
  },
  {
    id: "fert-sched-3",
    userPlantId: "garden-orapronobis",
    plantName: "Ora-pro-nóbis do Canteiro",
    dataAgendada: getOffsetDateIso(-2), // Atrasada (overdue)
    horaAgendada: "07:30",
    tipoAdubo: "Bokashi Orgânico Fermentado",
    modoAplicacao: "Incorporação em coroa na base",
    dosagem: "2 colheres de sopa",
    faseLunarRecomendada: "Lua Nova",
    observacoes: "Reposição de nitrogênio e microrganismos eficientes para brotação vigorosa das folhas.",
    status: "Atrasada",
    criadoEm: "2026-08-01T09:15:00Z"
  },
  {
    id: "fert-sched-4",
    userPlantId: "garden-costeladeadao",
    plantName: "Costela-de-Adão da Sala",
    dataAgendada: getOffsetDateIso(12), // Em 12 dias
    horaAgendada: "10:00",
    tipoAdubo: "Húmus de Minhoca Puro",
    modoAplicacao: "Camada de cobertura superficial (mulch vivo)",
    dosagem: "3 colheres de sopa",
    faseLunarRecomendada: "Lua Crescente",
    observacoes: "Manter folhas verdes escuras brilhantes e fenestras bem recortadas.",
    status: "Pendente",
    criadoEm: "2026-08-15T11:00:00Z"
  },
  {
    id: "fert-sched-5",
    userPlantId: "garden-alecrim",
    plantName: "Alecrim da Cozinha",
    dataAgendada: getOffsetDateIso(-18),
    horaAgendada: "08:00",
    tipoAdubo: "Composto Orgânico Maduro",
    modoAplicacao: "Adubação superficial",
    dosagem: "1 colher de sopa",
    faseLunarRecomendada: "Lua Minguante",
    observacoes: "Adubação realizada após a poda de formação.",
    status: "Concluída",
    concluidaEm: getOffsetDateIso(-18),
    criadoEm: "2026-07-28T08:00:00Z"
  }
];
