import { ArrowRight, Clock, Shield, Award, Zap, Users, Wrench } from "lucide-react";
import { services } from "@/data/services";
import { scrollToSection } from "@/utils/scroll";
import { memo, useCallback } from "react";

const Services = memo(() => {
  const serviceIcons = [Wrench, Clock, Shield, Zap, Users, Award];
  
  const handleQuoteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection("contato");
  }, []);
  
  return (
    <section id="servicos" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 bg-white overflow-hidden">
      {/* Background decorative elements - subtle and professional */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/2 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-500/3 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Geometric patterns for subtle visual interest */}
      <div className="absolute top-1/4 right-1/3 w-32 h-32 opacity-3">
        <div className="w-full h-full border border-primary/20 rotate-12 rounded-lg"></div>
      </div>
      <div className="absolute bottom-1/3 left-1/4 w-24 h-24 opacity-3">
        <div className="w-full h-full border border-gray-400/20 rotate-45 rounded-full"></div>
      </div>
      
      {/* Floating dots pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-32 w-2 h-2 bg-primary rounded-full"></div>
        <div className="absolute top-40 left-20 w-1 h-1 bg-gray-500 rounded-full"></div>
        <div className="absolute bottom-32 right-1/4 w-1.5 h-1.5 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-1 h-1 bg-gray-500 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header - Compacto no mobile */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Wrench className="w-4 h-4 text-primary mr-2" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Nossos Serviços</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 font-montserrat relative leading-tight">
            Soluções 
            <span className="text-primary relative block sm:inline">
              {" "}Especializadas
              {/* Subtle underline accent */}
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-gray-300 via-primary to-gray-300 rounded-full transform scale-x-75"></div>
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4">
            Técnicas exclusivas e resultados comprovados para todos os tipos de conversores de torque.
          </p>
        </div>

        {/* Services Grid - gap menor no mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {services.map((service, index) => {
            const IconComponent = serviceIcons[index % serviceIcons.length];
            return (
              <div 
                key={service.id}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card shadow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-gray-500/3 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 h-full flex flex-col">
                  {/* Image section with overlay - reduzido para mobile */}
                  <div className="relative h-32 sm:h-40 md:h-48 lg:h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/40 z-10"></div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
                        <IconComponent className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                      </div>
                    </div>
                    <img 
                      src={service.imageUrl}
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Content section - padding reduzido no mobile */}
                  <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col flex-1">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-montserrat mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                        {service.title}
                      </h3>
                      <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-primary rounded-full"></div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-1">
                      {service.description}
                    </p>
                    
                    {/* Features/Benefits list - compacto no mobile */}
                    <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary rounded-full mr-2 sm:mr-3"></div>
                        Garantia de 6 meses
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary rounded-full mr-2 sm:mr-3"></div>
                        Técnicas exclusivas
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary rounded-full mr-2 sm:mr-3"></div>
                        Orçamento personalizado
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleQuoteClick}
                      className="inline-flex items-center w-full justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg border border-primary/20 hover:border-primary mt-auto text-sm sm:text-base"
                      data-testid={`button-service-${service.id}`}
                    >
                      Solicitar Orçamento
                      <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        

      </div>
    </section>
  );
});

export default Services;
