interface Partner {
  name: string;
  url: string;
  logoPath: string;
  altText?: string;
  customStyle?: React.CSSProperties;
  maxHeight?: string;
}

export default function Partners() {
  // Lista de parceiros com caminhos para as imagens de logo
  const partners: Partner[] = [
    {
      name: "Raybestos",
      url: "https://www.raybestospowertrain.com/",
      logoPath: "/partners/raybestos.webp",
      altText: "Logo da Raybestos",
      maxHeight: "55px",
      customStyle: {
        maxWidth: "140px"
      }
    },
    {
      name: "TCRA",
      url: "https://tcraonline.com/",
      logoPath: "/partners/tcra.webp",
      altText: "Logo da TCRA",
      maxHeight: "70px"
    },
    {
      name: "Allomatic",
      url: "https://www.allomatic.com/",
      logoPath: "/partners/allomatic.webp",
      altText: "Logo da Allomatic",
      maxHeight: "40px",
      customStyle: {
        maxWidth: "140px"
      }
    },
    {
      name: "Tricomponent",
      url: "https://tricomponent.com/",
      logoPath: "/partners/tricomponent.webp",
      altText: "Logo da Tricomponent",
      maxHeight: "60px"
    },
    {
      name: "Touver",
      url: "https://www.touvertreinamentos.com.br/",
      logoPath: "/partners/touver.webp",
      altText: "Logo da Touver",
      maxHeight: "55px",
      customStyle: {
        maxWidth: "140px"
      }
    },
    {
      name: "Sonnax",
      url: "https://www.sonnax.com/",
      logoPath: "/partners/sonnax.svg",
      altText: "Logo da Sonnax",
      maxHeight: "90px"
    },
    {
      name: "TRANStec",
      url: "https://transtec.com/",
      logoPath: "/partners/transtec.webp",
      altText: "Logo da TRANStec",
      maxHeight: "70px"
    },
    {
      name: "Valeo",
      url: "https://www.valeoservice.com.br/pt-br",
      logoPath: "/partners/valeo.webp",
      altText: "Logo da Valeo",
      maxHeight: "55px",
      customStyle: {
        maxWidth: "160px"
      }
    },
    {
      name: "Alto USA",
      url: "https://www.altousa.com/",
      logoPath: "/partners/alto.webp",
      altText: "Logo da Alto USA",
      maxHeight: "70px"
    }
  ];

  return (
    <section id="parceiros" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 overflow-hidden">
      {/* Background decorative elements - responsive sizing */}
      <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/5 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-primary/3 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Geometric patterns for subtle visual interest - hidden on mobile */}
      <div className="absolute top-1/4 right-1/4 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 opacity-5 hidden sm:block">
        <div className="w-full h-full border-2 border-white rotate-12 rounded-lg"></div>
      </div>
      <div className="absolute top-3/4 left-1/4 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 opacity-5 hidden sm:block">
        <div className="w-full h-full border-2 border-primary rotate-45 rounded-full"></div>
      </div>
      
      {/* Floating dots pattern - reduced on mobile */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10 hidden xs:block">
        <div className="absolute top-32 right-20 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></div>
        <div className="absolute top-48 left-32 w-1 h-1 bg-primary rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full"></div>
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-primary rounded-full"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wide">Parceiros</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 font-montserrat relative leading-tight px-2">
            Nossos 
            <span className="text-primary relative block sm:inline">
              {" "}Parceiros
              {/* Subtle underline accent */}
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-white/20 via-primary/50 to-white/20 rounded-full transform scale-x-75"></div>
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto px-2">
            Trabalhamos com os melhores parceiros do mercado para garantir a qualidade dos nossos serviços.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {partners.map((partner) => {
            return (
              <a 
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                title={partner.name}
                data-testid={`partner-link-${partner.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Card shadow background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/20 rounded-xl md:rounded-2xl transform rotate-1"></div>
                
                <div className="relative bg-slate-800/80 backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl border border-slate-700/50 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 flex items-center justify-center h-20 sm:h-22 md:h-24 lg:h-26">
                  <div className="w-full flex items-center justify-center">
                    <img 
                      src={partner.logoPath} 
                      alt={partner.altText || partner.name} 
                      className="max-w-[70%] sm:max-w-[80%] md:max-w-[90%] lg:max-w-full h-auto transition-all duration-300 group-hover:brightness-125 group-hover:scale-105 filter brightness-110"
                      style={{
                        maxHeight: partner.maxHeight || "60px",
                        userSelect: "none",
                        pointerEvents: "none",
                        ...partner.customStyle,
                      }}
                      draggable="false"
                      loading="lazy"
                    />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}