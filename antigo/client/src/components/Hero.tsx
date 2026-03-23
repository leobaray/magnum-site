import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Search, Wrench, ShieldCheck } from "lucide-react";
import { scrollToSection } from "@/utils/scroll";
import { Link } from "wouter";

export default function Hero() {

  return (
    <section id="inicio" className="relative overflow-hidden min-h-[100vh] sm:min-h-[92vh] flex items-center">
      {/* Background gradient with overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary/80"></div>

      {/* Logo background - only for desktop/large screens */}
      <div
        className="hidden lg:block absolute inset-0 z-1 opacity-10 lg:opacity-15 xl:opacity-18 bg-no-repeat bg-contain"
        style={{
          backgroundImage: `url(/logo_magnum_final.webp)`,
          backgroundSize: '1200px 700px',
          backgroundPosition: 'left 3% center',
          filter: 'blur(0.2px) saturate(0.9)'
        }}
      ></div>

      {/* Background pattern with geometric shapes - simplified on mobile */}
      <div className="absolute inset-0 z-2 opacity-4 sm:opacity-8 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:24px_24px] sm:bg-[length:32px_32px]"></div>
      <div className="absolute inset-0 z-2 opacity-3 sm:opacity-6 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] sm:bg-[size:120px_120px]"></div>

      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-primary via-orange-400 to-primary z-20"></div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 lg:py-32 relative z-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Left column with text content */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="bg-white/20 text-white rounded-full px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold inline-flex items-center backdrop-blur-sm border border-white/30 shadow-lg">
                  <Star size={14} className="mr-1 sm:mr-2 fill-current" /> Atendimento especializado
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] font-montserrat text-white drop-shadow-lg">
                <span className="text-primary">Especialistas</span> em<br className="block sm:hidden" /> Retífica de<br className="hidden sm:block" /> <span className="text-primary">Conversores</span><br className="block" /> de Torque
              </h1>

              <p className="text-base sm:text-lg md:text-xl mt-6 sm:mt-8 text-gray-200 max-w-xl leading-relaxed">
                Soluções completas para manutenção e reparo de conversores de torque com qualidade superior e garantia de excelência.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contato");
                }}
                className="bg-primary hover:bg-primary/90 transition-all duration-300 text-white font-semibold px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-7 rounded-lg shadow-xl h-auto transform hover:scale-105 text-sm sm:text-base flex items-center justify-center"
                aria-label="Entre em contato conosco"
              >
                Entre em Contato
                <ChevronRight size={18} className="ml-2" />
              </Button>
              <Link href="/produtos">
                <Button
                  variant="outline"
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-300 text-white border-white/25 hover:border-white/40 font-medium px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-7 rounded-lg shadow-xl h-auto transform hover:scale-105 text-sm sm:text-base flex items-center justify-center w-full"
                  aria-label="Conheça nossos produtos disponíveis"
                >
                  Nossos Produtos
                </Button>
              </Link>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-white/10">
              <div className="text-gray-300 space-y-2 text-sm sm:text-base">
                <p className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 sm:mr-3"></span>Orçamento rápido em até 2 dias úteis</p>
                <p className="flex items-center"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 sm:mr-3"></span>Serviço completo em até 4 dias úteis após aprovação</p>
              </div>
            </div>
          </div>

          {/* Right column with feature cards - hidden on mobile for better focus */}
          <div className="hidden lg:block relative">
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-gradient-to-br from-primary/15 to-transparent rounded-full filter blur-3xl"></div>

            <div className="relative bg-white/15 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl mb-6 transform hover:scale-[1.02] transition-all duration-500 hover:bg-white/20">
              <div className="p-2.5 bg-primary/25 rounded-full w-fit mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-montserrat">Diagnóstico Preciso</h3>
              <p className="text-gray-200 leading-relaxed text-sm">Utilizamos tecnologia avançada para identificar com precisão os problemas do seu conversor.</p>
            </div>

            <div className="relative bg-white/15 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl ml-12 mb-6 transform hover:scale-[1.02] transition-all duration-500 hover:bg-white/20">
              <div className="p-2.5 bg-primary/25 rounded-full w-fit mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-montserrat">Remanufatura Completa</h3>
              <p className="text-gray-200 leading-relaxed text-sm">Renovamos todas as peças garantindo o desempenho original do seu conversor.</p>
            </div>

            <div className="relative bg-white/15 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl ml-6 transform hover:scale-[1.02] transition-all duration-500 hover:bg-white/20">
              <div className="p-2.5 bg-primary/25 rounded-full w-fit mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-montserrat">Garantia de Qualidade</h3>
              <p className="text-gray-200 leading-relaxed text-sm">Todos os serviços acompanham garantia e testes rigorosos de desempenho.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements - simplified on mobile */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-900/50 to-transparent z-5"></div>
      <div className="absolute bottom-8 sm:bottom-16 right-8 sm:right-16 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-primary/8 rounded-full filter blur-3xl"></div>
      <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-20 sm:w-30 md:w-40 h-20 sm:h-30 md:h-40 bg-orange-400/5 rounded-full filter blur-2xl"></div>
    </section>
  );
}
