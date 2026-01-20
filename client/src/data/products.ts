import { Product } from "@shared/schema";

// Dados iniciais para desenvolvimento
export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Conversor de Torque GM 6L80",
    description: "Conversor recondicionado para transmissão automática GM 6L80",
    carModel: "Chevrolet Camaro",
    transmission: "GM 6L80",
    motorization: "6.2L V8",
    year: "2016-2020",
    imageUrl: "/products/sample-converter.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Conversor ZF 8HP70",
    description: "Conversor de torque recondicionado para transmissão ZF 8HP70",
    carModel: "BMW Série 5",
    transmission: "ZF 8HP70",
    motorization: "3.0L Turbo",
    year: "2018-2022",
    imageUrl: "/products/sample-converter.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Conversor Aisin TF-80SC",
    description: "Conversor recondicionado para transmissão automática Aisin TF-80SC",
    carModel: "Volvo XC60",
    transmission: "Aisin TF-80SC",
    motorization: "2.0L T5",
    year: "2015-2017",
    imageUrl: "/products/sample-converter.jpg",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Conversor JATCO JF011E",
    description: "Conversor recondicionado para transmissão automática JATCO JF011E",
    carModel: "Nissan Sentra",
    transmission: "JATCO JF011E",
    motorization: "1.8L",
    year: "2013-2018",
    imageUrl: "/products/sample-converter.jpg",
    createdAt: new Date().toISOString()
  }
];
