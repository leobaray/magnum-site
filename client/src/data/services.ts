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
  {
    id: 4,
    title: "Técnicas Exclusivas",
    description: "Utilizamos métodos de abertura e reparo patenteados que permitem acessar e consertar componentes que outras empresas não conseguem manipular.",
    imageUrl: "/products/conversor_01.jpg"
  },
  {
    id: 5,
    title: "Atendimento a Toda Frota",
    description: "Serviços para conversores de veículos leves, caminhões, ônibus, maquinário pesado e agrícola, com experiência em todas as marcas do mercado.",
    imageUrl: "/products/conversor_02.jpg"
  },
  {
    id: 6,
    title: "Finalização Rápida",
    description: "Após aprovação do orçamento, concluímos o serviço em apenas 3-4 dias, devolvendo seu conversor pronto para reinstalação com desempenho garantido.",
    imageUrl: "/products/transmissao_01.jpg"
  }
];
