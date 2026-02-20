export interface Service {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export const services: Service[] = [
  {
    id: 1,
    title: "Retífica Completa de Conversores",
    description: "Recondicionamento completo de conversores de torque para todos os tipos de veículos, incluindo carros de passeio, caminhões e máquinas pesadas.",
    imageUrl: "/products/retifica_completa.webp"
  },
  {
    id: 2,
    title: "Orçamento Rápido",
    description: "Diagnóstico técnico e orçamento em apenas 1-2 dias, com análise detalhada do seu conversor de torque usando equipamentos especializados.",
    imageUrl: "/products/orcamento_rapido.webp"
  },
  {
    id: 3,
    title: "Substituição de Componentes",
    description: "Troca de peças danificadas utilizando componentes de parceiros premium como Raybestos, Sonnax e Tricomponent, com garantia de 6 meses.",
    imageUrl: "/products/substituicao_componentes.webp"
  },
];
