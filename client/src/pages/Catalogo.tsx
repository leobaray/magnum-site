import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, Search, Filter, Sliders, ChevronDown, ChevronRight, MessageSquare, Car, Settings, Calendar, Gauge, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { Link } from "wouter";

export default function Catalogo() {
  useScrollToTop();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    carModel: string | null;
    transmission: string | null;
    motorization: string | null;
    year: string | null;
  }>({
    carModel: null,
    transmission: null,
    motorization: null,
    year: null,
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const hasActiveFilters = Object.values(filters).some(Boolean);
      
      if (!hasActiveFilters) {
        return await apiRequest("/api/products");
      } else {
        const queryParams = new URLSearchParams();
        if (filters.carModel) queryParams.append("carModel", filters.carModel);
        if (filters.transmission) queryParams.append("transmission", filters.transmission);
        if (filters.motorization) queryParams.append("motorization", filters.motorization);
        if (filters.year) queryParams.append("year", filters.year);
        
        return await apiRequest(`/api/products/filter?${queryParams.toString()}`);
      }
    }
  });
  
  const { data: carModels = [] } = useQuery({
    queryKey: ["/api/filters/car-models"],
    queryFn: async () => {
      return await apiRequest("/api/filters/car-models");
    }
  });
  
  const { data: transmissions = [] } = useQuery({
    queryKey: ["/api/filters/transmissions", filters.carModel],
    queryFn: async () => {
      if (!filters.carModel) return [];
      return await apiRequest(`/api/filters/transmissions/${encodeURIComponent(filters.carModel)}`);
    },
    enabled: !!filters.carModel
  });
  
  const { data: motorizations = [] } = useQuery({
    queryKey: ["/api/filters/motorizations", filters.carModel, filters.transmission],
    queryFn: async () => {
      if (!filters.carModel || !filters.transmission) return [];
      return await apiRequest(`/api/filters/motorizations/${encodeURIComponent(filters.carModel)}/${encodeURIComponent(filters.transmission)}`);
    },
    enabled: !!filters.carModel && !!filters.transmission
  });
  
  const { data: years = [] } = useQuery({
    queryKey: ["/api/filters/years", filters.carModel, filters.transmission, filters.motorization],
    queryFn: async () => {
      if (!filters.carModel || !filters.transmission || !filters.motorization) return [];
      return await apiRequest(`/api/filters/years/${encodeURIComponent(filters.carModel)}/${encodeURIComponent(filters.transmission)}/${encodeURIComponent(filters.motorization)}`);
    },
    enabled: !!filters.carModel && !!filters.transmission && !!filters.motorization
  });
  
  const filteredProducts = searchTerm 
    ? products.filter((product: Product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.carModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.transmission?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
  
  const clearAllFilters = () => {
    setFilters({
      carModel: null,
      transmission: null,
      motorization: null,
      year: null,
    });
    setSearchTerm("");
  };

  const clearFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      newFilters[filterType] = null;
      
      if (filterType === 'carModel') {
        newFilters.transmission = null;
        newFilters.motorization = null;
        newFilters.year = null;
      } else if (filterType === 'transmission') {
        newFilters.motorization = null;
        newFilters.year = null;
      } else if (filterType === 'motorization') {
        newFilters.year = null;
      }
      
      return newFilters;
    });
  };
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Package className="w-4 h-4 text-primary mr-2" />
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">Catálogo</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-montserrat leading-tight">
              Nossos <span className="text-primary">Conversores</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Encontre o conversor de torque ideal para seu veículo. Qualidade superior com garantia de 6 meses.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por modelo, transmissão..."
                  className="w-full pl-12 pr-12 py-4 h-14 text-base bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:bg-white/15 focus:border-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>{products.length} produtos disponíveis</span>
              </div>
              <div className="hidden sm:flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                <span>Garantia de 6 meses</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="lg:grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-900 to-slate-800 text-white p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Filter className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Filtros</h2>
                        <p className="text-xs text-gray-400">Refine sua busca</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="bg-primary text-white text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="lg:hidden h-8 w-8 text-white hover:bg-white/10" 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className={`p-4 sm:p-6 space-y-6 ${!isFilterOpen ? 'hidden lg:block' : ''}`}>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="w-full text-sm border-dashed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Filtros ({activeFilterCount})
                    </Button>
                  )}
                  
                  {/* Car Model Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <h3 className="font-medium text-gray-900">Modelo do Veículo</h3>
                      </div>
                      {filters.carModel && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-gray-400 hover:text-gray-600" 
                          onClick={() => clearFilter('carModel')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {carModels.length === 0 ? (
                        <p className="text-sm text-gray-500 italic py-2">Nenhum modelo disponível</p>
                      ) : (
                        carModels.map((model: string) => (
                          <button
                            key={model}
                            onClick={() => setFilters({...filters, carModel: model, transmission: null, motorization: null, year: null})}
                            className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-all ${
                              filters.carModel === model 
                                ? 'bg-primary text-white shadow-md' 
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span>{model}</span>
                            {filters.carModel === model && <Check className="h-4 w-4" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Transmission Filter */}
                  {filters.carModel && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            <h3 className="font-medium text-gray-900">Transmissão</h3>
                          </div>
                          {filters.transmission && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400 hover:text-gray-600" 
                              onClick={() => clearFilter('transmission')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {transmissions.map((transmission: string) => (
                            <button
                              key={transmission}
                              onClick={() => setFilters({...filters, transmission, motorization: null, year: null})}
                              className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-all ${
                                filters.transmission === transmission 
                                  ? 'bg-primary text-white shadow-md' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <span>{transmission}</span>
                              {filters.transmission === transmission && <Check className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Motorization Filter */}
                  {filters.transmission && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-primary" />
                            <h3 className="font-medium text-gray-900">Motorização</h3>
                          </div>
                          {filters.motorization && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400 hover:text-gray-600" 
                              onClick={() => clearFilter('motorization')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {motorizations.map((motor: string) => (
                            <button
                              key={motor}
                              onClick={() => setFilters({...filters, motorization: motor, year: null})}
                              className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-all ${
                                filters.motorization === motor 
                                  ? 'bg-primary text-white shadow-md' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <span>{motor}</span>
                              {filters.motorization === motor && <Check className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Year Filter */}
                  {filters.motorization && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <h3 className="font-medium text-gray-900">Ano</h3>
                          </div>
                          {filters.year && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400 hover:text-gray-600" 
                              onClick={() => clearFilter('year')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {years.map((year: string) => (
                            <button
                              key={year}
                              onClick={() => setFilters({...filters, year})}
                              className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-all ${
                                filters.year === year 
                                  ? 'bg-primary text-white shadow-md' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <span>{year}</span>
                              {filters.year === year && <Check className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* CTA Card */}
              <Card className="mt-6 border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden hidden lg:block">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Não encontrou?</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Entre em contato e solicite um orçamento personalizado.
                  </p>
                  <Link href="/#contato">
                    <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Fale Conosco
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeFilterCount > 0 || searchTerm ? 'Resultados' : 'Todos os Produtos'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              </div>
              
              {/* Active Filters Pills */}
              {(activeFilterCount > 0 || searchTerm) && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
                      Busca: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-primary">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.carModel && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
                      {filters.carModel}
                      <button onClick={() => clearFilter('carModel')} className="ml-1 hover:text-primary/70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.transmission && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary gap-1">
                      {filters.transmission}
                      <button onClick={() => clearFilter('transmission')} className="ml-1 hover:text-primary/70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-6 text-gray-500 font-medium">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Sliders className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    {activeFilterCount > 0 || searchTerm
                      ? "Tente remover alguns filtros ou modificar sua pesquisa para encontrar mais produtos."
                      : "Não há produtos disponíveis no momento. Volte em breve!"}
                  </p>
                  {(activeFilterCount > 0 || searchTerm) && (
                    <Button onClick={clearAllFilters} variant="default" className="bg-primary hover:bg-primary/90">
                      <X className="h-4 w-4 mr-2" />
                      Limpar todos os filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product: Product) => (
                  <Card 
                    key={product.id} 
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                      <img 
                        src={product.imageUrl || "/products/sample-converter.jpg"} 
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/sample-converter.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className="bg-primary text-white text-xs font-medium shadow-lg">
                          {product.carModel}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="p-4 pb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0 space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Settings className="h-3.5 w-3.5 text-primary/70" />
                          <span className="truncate">{product.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Gauge className="h-3.5 w-3.5 text-primary/70" />
                          <span className="truncate">{product.motorization}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
                          <Calendar className="h-3.5 w-3.5 text-primary/70" />
                          <span>Ano: {product.year}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0">
                      <Link href="/#contato" className="w-full">
                        <Button className="w-full bg-gray-900 hover:bg-primary text-white transition-colors group/btn">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Solicitar Orçamento
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile CTA */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-gray-900 to-slate-800 text-white overflow-hidden lg:hidden">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">Não encontrou o que procura?</h3>
            <p className="text-sm text-white/80 mb-4">
              Nossa equipe pode ajudar a encontrar o conversor ideal para seu veículo.
            </p>
            <Link href="/#contato">
              <Button variant="secondary" className="bg-primary text-white hover:bg-primary/90 border-0">
                <MessageSquare className="h-4 w-4 mr-2" />
                Fale Conosco
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
