import { Zap, Shield, Award } from "lucide-react";

export default function About() {
  return (
    <section id="sobre" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
      {/* Background decorative elements - mais sutis e responsivos */}
      <div className="absolute top-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/2 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-56 sm:w-72 md:w-80 h-56 sm:h-72 md:h-80 bg-orange-400/2 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      {/* Geometric patterns - responsivos e sutis */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 opacity-3">
        <div className="w-full h-full border border-primary rotate-45 rounded-lg"></div>
      </div>
      <div className="hidden sm:block absolute top-3/4 right-1/4 w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 opacity-3">
        <div className="w-full h-full border border-orange-400 rotate-12 rounded-full"></div>
      </div>
      {/* Floating dots pattern - apenas em telas maiores */}
      <div className="hidden md:block absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-primary rounded-full"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-orange-400 rounded-full"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-orange-400 rounded-full"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header - otimizado para mobile */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {/* Badge compacto */}
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wide">Sobre Nós</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight font-montserrat text-gray-900 mb-4 sm:mb-6 relative">
            Conheça a 
            <span className="text-primary relative block sm:inline">
              {" "}Magnum Torque
              {/* Subtle underline accent - responsivo */}
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-gray-300 via-primary to-gray-300 rounded-full transform scale-x-75"></div>
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto px-2">
            Pioneiros no Brasil em retífica de conversores de torque com técnicas exclusivas.
          </p>
        </div>

        {/* Layout compacto em 2 colunas como antes, mas organizado */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* Coluna Esquerda - Informações da Empresa */}
          <div className="space-y-6">
            
            {/* Card da História - mais compacto */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-orange-400/3 rounded-2xl transform rotate-1"></div>
              <div className="relative bg-white p-5 sm:p-6 md:p-7 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-montserrat mb-1">Nossa História</h3>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-orange-400 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Com mais de <span className="font-bold text-primary">10 anos de experiência</span>, a Magnum Torque desenvolveu métodos únicos para reparar conversores considerados irreparáveis por outras empresas. 
                </p>
              </div>
            </div>

            {/* Cards de Diferenciais - layout horizontal compacto */}
            <div className="space-y-4">
              <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">Técnicas Exclusivas</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Métodos únicos desenvolvidos por nossa equipe</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">Garantia Estendida</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">6 meses de garantia em todos os serviços</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Estatísticas e Imagem */}
          <div className="space-y-6">
            
            {/* Grid de Estatísticas - mais compacto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 font-montserrat group-hover:scale-110 transition-transform duration-300">10+</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Anos</div>
              </div>
              
              <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 font-montserrat group-hover:scale-110 transition-transform duration-300">3-5</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Dias</div>
              </div>
              
              <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 font-montserrat group-hover:scale-110 transition-transform duration-300">6</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Meses de garantia</div>
              </div>
              
              <div className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 font-montserrat group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Sucesso</div>
              </div>
            </div>

            {/* Imagem do Produto - visível em tablets e desktop */}
            <div className="hidden sm:block">
              <div className="relative h-48 md:h-56 lg:h-64 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <img 
                  src="/logo_10anos.webp" 
                  alt="Magnum Torque - 10 Anos" 
                  className="max-w-full max-h-full object-contain p-4"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  width={526}
                  height={327}
                  data-testid="product-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
