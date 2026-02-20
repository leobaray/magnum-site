import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Package } from "lucide-react";
import { memo } from "react";

const Products = memo(() => {
  return (
    <section id="produtos" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 bg-gradient-to-br from-gray-50 via-white to-slate-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/2 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gray-400/3 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Geometric patterns */}
      <div className="absolute top-1/4 right-1/3 w-40 h-40 opacity-2">
        <div className="w-full h-full border border-primary/30 rotate-12 rounded-2xl"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 opacity-2">
        <div className="w-full h-full border border-gray-400/30 rotate-45 rounded-full"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 opacity-4">
        <div className="absolute top-24 right-40 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-48 left-24 w-2 h-2 bg-gray-500 rounded-full"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-24 left-40 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Centered Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Package className="w-4 h-4 text-primary mr-2" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Catálogo de Produtos</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-montserrat relative leading-tight">
            Peças para 
            <span className="text-primary relative block sm:inline">
              {" "}Transmissão
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-primary to-gray-300 rounded-full transform scale-x-75"></div>
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
            Fornecemos componentes de alta qualidade para transmissões automáticas de diversas marcas e modelos, 
            garantindo performance e durabilidade em cada peça.
          </p>
          
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="default" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-10 py-4 text-lg shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 rounded-xl">
              <Link to="/produtos" className="flex items-center gap-3">
                Ver Catálogo Completo <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <div className="flex items-center text-gray-600 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Produtos sempre disponíveis
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Products;
