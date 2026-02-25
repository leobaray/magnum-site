export interface Service {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  benefits: string[];
}

export const services: Service[] = [
  {
    id: 1,
    title: "Retífica Completa de Conversores",
    description: "Recondicionamento completo de conversores de torque para todos os tipos de veículos, incluindo carros de passeio, caminhões e máquinas pesadas.",
    imageUrl: "/products/retifica_completa.webp",
    benefits: [
      "Diagnóstico computadorizado",
      "Remanufatura total de componentes",
      "Garantia de 6 meses",
    ],
  },
  {
    id: 2,
    title: "Orçamento Rápido",
    description: "Diagnóstico técnico e orçamento em apenas 1-2 dias, com análise detalhada do seu conversor de torque usando equipamentos especializados.",
    imageUrl: "/products/orcamento_rapido.webp",
    benefits: [
      "Avaliação técnica gratuita",
      "Resposta em até 2 dias úteis",
      "Sem compromisso",
    ],
  },
  {
    id: 3,
    title: "Substituição de Componentes",
    description: "Troca de peças danificadas utilizando componentes de parceiros premium como Raybestos, Sonnax e Tricomponent, com garantia de 6 meses.",
    imageUrl: "/products/substituicao_componentes.webp",
    benefits: [
      "Peças originais de parceiros premium",
      "Compatibilidade 100% garantida",
      "Instalação profissional",
    ],
  },
];
