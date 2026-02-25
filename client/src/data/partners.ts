export interface Partner {
  name: string;
  url: string;
  logoPath: string;
  altText?: string;
  customStyle?: React.CSSProperties;
  maxHeight?: string;
}

export const partners: Partner[] = [
  {
    name: "Raybestos",
    url: "https://www.raybestospowertrain.com/",
    logoPath: "/partners/raybestos.webp",
    altText: "Logo da Raybestos",
    maxHeight: "55px",
    customStyle: { maxWidth: "140px" },
  },
  {
    name: "TCRA",
    url: "https://tcraonline.com/",
    logoPath: "/partners/tcra.webp",
    altText: "Logo da TCRA",
    maxHeight: "70px",
  },
  {
    name: "Allomatic",
    url: "https://www.allomatic.com/",
    logoPath: "/partners/allomatic.webp",
    altText: "Logo da Allomatic",
    maxHeight: "40px",
    customStyle: { maxWidth: "140px" },
  },
  {
    name: "Tricomponent",
    url: "https://tricomponent.com/",
    logoPath: "/partners/tricomponent.webp",
    altText: "Logo da Tricomponent",
    maxHeight: "60px",
  },
  {
    name: "Touver",
    url: "https://www.touvertreinamentos.com.br/",
    logoPath: "/partners/touver.webp",
    altText: "Logo da Touver",
    maxHeight: "55px",
    customStyle: { maxWidth: "140px" },
  },
  {
    name: "Sonnax",
    url: "https://www.sonnax.com/",
    logoPath: "/partners/sonnax.svg",
    altText: "Logo da Sonnax",
    maxHeight: "90px",
  },
  {
    name: "TRANStec",
    url: "https://transtec.com/",
    logoPath: "/partners/transtec.webp",
    altText: "Logo da TRANStec",
    maxHeight: "70px",
  },
  {
    name: "Valeo",
    url: "https://www.valeoservice.com.br/pt-br",
    logoPath: "/partners/valeo.webp",
    altText: "Logo da Valeo",
    maxHeight: "55px",
    customStyle: { maxWidth: "160px" },
  },
  {
    name: "Alto USA",
    url: "https://www.altousa.com/",
    logoPath: "/partners/alto.webp",
    altText: "Logo da Alto USA",
    maxHeight: "70px",
  },
];
