import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Search, Filter } from "lucide-react";
import { Product } from "@shared/schema";
import { sampleProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { scrollToSection } from "@/utils/scroll";

export default function ProductCatalog() {
  // Estado para os filtros
  const [selectedCarModel, setSelectedCarModel] = useState<string>("all");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("all");
  const [selectedMotorization, setSelectedMotorization] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Query para buscar todos os produtos (ou filtrados)
  const { data: products = [] } = useQuery({
    queryKey: ["products", selectedCarModel, selectedTransmission, selectedMotorization, selectedYear],
    // Na versão final, isso buscaria da API baseado nos filtros
    queryFn: async () => {
      // Utiliza dados de amostra para desenvolvimento
      return sampleProducts;
    }
  });

  // Query para buscar os modelos de carro disponíveis
  const { data: carModels = [] } = useQuery({
    queryKey: ["carModels"],
    queryFn: async () => {
      // Utiliza dados de amostra para obter modelos de carro únicos
      return Array.from(new Set(sampleProducts.map(product => product.carModel)));
    }
  });

  // Queries para opções de filtro dependentes
  const { data: transmissions = [] } = useQuery({
    queryKey: ["transmissions", selectedCarModel],
    queryFn: async () => {
      if (selectedCarModel === "all") return [];
      // Filtra transmissões baseado no modelo de carro selecionado
      return Array.from(new Set(
        sampleProducts
          .filter(p => p.carModel === selectedCarModel)
          .map(p => p.transmission)
      ));
    },
    enabled: selectedCarModel !== "all"
  });

  const { data: motorizations = [] } = useQuery({
    queryKey: ["motorizations", selectedCarModel, selectedTransmission],
    queryFn: async () => {
      if (selectedCarModel === "all" || selectedTransmission === "all") return [];
      // Filtra motorizações baseado no modelo e transmissão selecionados
      return Array.from(new Set(
        sampleProducts
          .filter(p => p.carModel === selectedCarModel && p.transmission === selectedTransmission)
          .map(p => p.motorization)
      ));
    },
    enabled: selectedCarModel !== "all" && selectedTransmission !== "all"
  });

  const { data: years = [] } = useQuery({
    queryKey: ["years", selectedCarModel, selectedTransmission, selectedMotorization],
    queryFn: async () => {
      if (selectedCarModel === "all" || selectedTransmission === "all" || selectedMotorization === "all") return [];
      // Filtra anos baseado em todos os filtros anteriores
      return Array.from(new Set(
        sampleProducts
          .filter(p => 
            p.carModel === selectedCarModel && 
            p.transmission === selectedTransmission &&
            p.motorization === selectedMotorization
          )
          .map(p => p.year)
      ));
    },
    enabled: selectedCarModel !== "all" && selectedTransmission !== "all" && selectedMotorization !== "all"
  });

  // Reset filtros dependentes quando um filtro superior muda
  useEffect(() => {
    if (selectedCarModel === "all") {
      setSelectedTransmission("all");
      setSelectedMotorization("all");
      setSelectedYear("all");
    }
  }, [selectedCarModel]);

  useEffect(() => {
    if (selectedTransmission === "all") {
      setSelectedMotorization("all");
      setSelectedYear("all");
    }
  }, [selectedTransmission]);

  useEffect(() => {
    if (selectedMotorization === "all") {
      setSelectedYear("all");
    }
  }, [selectedMotorization]);

  // Filtrar produtos baseado em todos os filtros
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCarModel = selectedCarModel === "all" || product.carModel === selectedCarModel;
    const matchesTransmission = selectedTransmission === "all" || product.transmission === selectedTransmission;
    const matchesMotorization = selectedMotorization === "all" || product.motorization === selectedMotorization;
    const matchesYear = selectedYear === "all" || product.year === selectedYear;
    
    return matchesSearch && matchesCarModel && matchesTransmission && matchesMotorization && matchesYear;
  });

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSelectedCarModel("all");
    setSelectedTransmission("all");
    setSelectedMotorization("all");
    setSelectedYear("all");
    setSearchTerm("");
  };

  return (
    <section id="produtos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 font-montserrat">
            Nosso Catálogo de Conversores
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Encontre o conversor de torque ideal para seu veículo. Nossa equipe especializada 
            oferece uma ampla variedade de conversores recondicionados com qualidade superior.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold flex items-center">
              <Filter className="h-5 w-5 mr-2 text-[#BA1F37]" /> 
              Filtrar Produtos
            </h3>
            
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Modelo do Carro</label>
              <Select
                value={selectedCarModel}
                onValueChange={(value) => setSelectedCarModel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os modelos</SelectItem>
                  {carModels.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transmissão</label>
              <Select
                value={selectedTransmission}
                onValueChange={(value) => setSelectedTransmission(value)}
                disabled={selectedCarModel === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a transmissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as transmissões</SelectItem>
                  {transmissions.map((transmission) => (
                    <SelectItem key={transmission} value={transmission}>{transmission}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Motorização</label>
              <Select
                value={selectedMotorization}
                onValueChange={(value) => setSelectedMotorization(value)}
                disabled={selectedTransmission === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a motorização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as motorizações</SelectItem>
                  {motorizations.map((motorization) => (
                    <SelectItem key={motorization} value={motorization}>{motorization}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <Select
                value={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
                disabled={selectedMotorization === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="text-sm"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Mostra filtros ativos */}
        {(selectedCarModel !== "all" || selectedTransmission !== "all" || selectedMotorization !== "all" || selectedYear !== "all") && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Filtros ativos:</span>
              {selectedCarModel !== "all" && (
                <Badge variant="outline" className="bg-blue-50">
                  Modelo: {selectedCarModel}
                </Badge>
              )}
              {selectedTransmission !== "all" && (
                <Badge variant="outline" className="bg-blue-50">
                  Transmissão: {selectedTransmission}
                </Badge>
              )}
              {selectedMotorization !== "all" && (
                <Badge variant="outline" className="bg-blue-50">
                  Motorização: {selectedMotorization}
                </Badge>
              )}
              {selectedYear !== "all" && (
                <Badge variant="outline" className="bg-blue-50">
                  Ano: {selectedYear}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar seus filtros ou limpar a busca para ver mais produtos.
            </p>
            <Button onClick={clearFilters} variant="outline">Limpar Filtros</Button>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500 text-sm">
            Imagem não disponível
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-xl">{product.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-gray-50 text-xs">
            {product.carModel}
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-xs">
            {product.transmission}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-gray-600">
          {product.description}
        </CardDescription>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Motorização:</span>
            <span className="text-sm text-gray-700">{product.motorization}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Ano:</span>
            <span className="text-sm text-gray-700">{product.year}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button 
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("contato");
          }}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#BA1F37] hover:bg-[#D43552] text-white rounded-md font-medium transition-colors duration-200"
        >
          <MessageSquare className="mr-2 h-4 w-4" /> 
          Solicitar Orçamento
        </button>
      </CardFooter>
    </Card>
  );
}