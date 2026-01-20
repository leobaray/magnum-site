export interface Testimonial {
  id: number;
  name: string;
  company: string;
  content: string;
  rating: number;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Edevan Ferrarezi",
    company: "Cliente",
    content: "Tive o prazer de conhecer a empresa e acompanhar com detalhes o trabalho por eles desenvolvido. Gostei muito da transparência e honestidade e qualidade no trabalho que fazem. Parabéns a toda equipe!",
    rating: 5,
    initials: "EF"
  },
  {
    id: 2,
    name: "Carlos H. de Seixas",
    company: "Cliente",
    content: "Fiz uma consulta por telefone, e fui muito bem atendido, com respostas claras, técnicas e cordiais...",
    rating: 5,
    initials: "CS"
  },
  {
    id: 3,
    name: "Agnaldo Durant",
    company: "Cliente",
    content: "Sempre muito prestativos e respeitosos com o cliente. Super recomendo!",
    rating: 5,
    initials: "AD"
  },
  {
    id: 4,
    name: "Geson Junior Soares",
    company: "Cliente",
    content: "Serviço de primeira qualidade e preço justo, ótimo atendimento!",
    rating: 5,
    initials: "GS"
  },
  {
    id: 5,
    name: "Mauricio Negrão",
    company: "Cliente",
    content: "Pessoal muito atencioso e educado, o serviço é top, estou satisfeito.",
    rating: 5,
    initials: "MN"
  },
  {
    id: 6,
    name: "Marcos Paulo Vicari",
    company: "Cliente",
    content: "Ótimo atendimento, trabalho de qualidade e preço justo.",
    rating: 5,
    initials: "MV"
  },
  {
    id: 7,
    name: "Jean Borges",
    company: "Cliente",
    content: "Ótimo atendimento. Parabéns a toda equipe.",
    rating: 5,
    initials: "JB"
  }
];
