import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { scrollToSection as utilScrollToSection } from "@/utils/scroll";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [location] = useLocation();

  // Função para rolar suavemente para as seções
  const scrollToSection = (sectionId: string) => {
    utilScrollToSection(sectionId, 60); // Ajustado para 60px para posicionamento mais próximo do topo
    
    // Atualiza a seção ativa
    setActiveSection(sectionId);
    
    // Fecha o menu mobile após a navegação
    setIsMenuOpen(false);
  };

  // Detecta a seção ativa durante a rolagem
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Detecta qual seção está visível
      const sections = [
        "inicio", 
        "sobre", 
        "servicos", 
        "produtos", 
        "depoimentos", 
        "parceiros", 
        "contato"
      ];

      const headerHeight = 60; // Altura aproximada do header com alguma margem
      let currentSection = "inicio";
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight && rect.bottom > headerHeight) {
            currentSection = section;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Classes para links ativos e inativos
  const navLinkClass = (section: string) => {
    const baseClass = "font-medium transition duration-300 relative py-2";
    const activeClass = "text-primary font-semibold";
    const inactiveClass = "text-gray-700 hover:text-primary";
    
    return `${baseClass} ${activeSection === section ? activeClass : inactiveClass}`;
  };

  // Componente de indicador para link ativo
  const ActiveIndicator = () => (
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
  );

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg backdrop-blur-sm bg-white/95" : ""}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {location === "/" ? (
          <a 
            href="#inicio" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("inicio");
            }}
            className="flex items-center"
          >
            <h1 className="font-montserrat text-2xl font-bold text-gray-900">
              Magnum <span className="text-primary">Torque</span>
            </h1>
          </a>
        ) : (
          <Link to="/" className="flex items-center">
            <h1 className="font-montserrat text-2xl font-bold text-gray-900">
              Magnum <span className="text-primary">Torque</span>
            </h1>
          </Link>
        )}
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden p-2 rounded-full hover:bg-gray-100 text-primary focus:outline-none transition duration-200"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {location === "/" ? (
            <>
              <a 
                href="#inicio" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("inicio");
                }}
                className={`${navLinkClass("inicio")} group`}
              >
                Início
                {activeSection === "inicio" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                {activeSection !== "inicio" && <ActiveIndicator />}
              </a>
              
              <a 
                href="#servicos" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("servicos");
                }}
                className={`${navLinkClass("servicos")} group`}
              >
                Serviços
                {activeSection === "servicos" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                {activeSection !== "servicos" && <ActiveIndicator />}
              </a>
              
              <Link 
                to="/catalogo"
                className={`${navLinkClass("produtos")} group`}
              >
                Produtos
                <ActiveIndicator />
              </Link>
              
              <a 
                href="#parceiros" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("parceiros");
                }}
                className={`${navLinkClass("parceiros")} group`}
              >
                Parceiros
                {activeSection === "parceiros" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                {activeSection !== "parceiros" && <ActiveIndicator />}
              </a>
              
              <a 
                href="#sobre" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("sobre");
                }}
                className={`${navLinkClass("sobre")} group`}
              >
                Sobre
                {activeSection === "sobre" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                {activeSection !== "sobre" && <ActiveIndicator />}
              </a>
              
              <a 
                href="#depoimentos" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("depoimentos");
                }}
                className={`${navLinkClass("depoimentos")} group`}
              >
                Depoimentos
                {activeSection === "depoimentos" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>}
                {activeSection !== "depoimentos" && <ActiveIndicator />}
              </a>
              
              <Button 
                asChild 
                variant="default" 
                className={`bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-md hover:shadow-lg ${activeSection === "contato" ? "ring-2 ring-primary/30" : ""}`}
              >
                <a 
                  href="#contato" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contato");
                  }}
                >
                  Entre em Contato
                </a>
              </Button>
            </>
          ) : (
            <>
              <Link to="/" className="text-primary font-medium hover:text-secondary transition duration-300">Início</Link>
              <Link to="/#servicos" className="text-primary font-medium hover:text-secondary transition duration-300">Serviços</Link>
              <Link to="/catalogo" className="text-primary font-medium hover:text-secondary transition duration-300">Produtos</Link>
              <Link to="/#parceiros" className="text-primary font-medium hover:text-secondary transition duration-300">Parceiros</Link>
              <Link to="/#sobre" className="text-primary font-medium hover:text-secondary transition duration-300">Sobre</Link>
              <Link to="/#depoimentos" className="text-primary font-medium hover:text-secondary transition duration-300">Depoimentos</Link>
              <Button asChild variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg">
                <Link to="/#contato">Entre em Contato</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-6 px-6 shadow-lg rounded-b-xl">
          {location === "/" ? (
            <>
              <a 
                href="#inicio" 
                className={`block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${activeSection === "inicio" ? "bg-gray-100 text-primary" : "text-gray-800"}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("inicio");
                }}
              >
                Início
              </a>
              <a 
                href="#servicos" 
                className={`block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${activeSection === "servicos" ? "bg-gray-100 text-primary" : "text-gray-800"}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("servicos");
                }}
              >
                Serviços
              </a>
              <Link 
                to="/catalogo"
                className="block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 text-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <a 
                href="#parceiros" 
                className={`block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${activeSection === "parceiros" ? "bg-gray-100 text-primary" : "text-gray-800"}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("parceiros");
                }}
              >
                Parceiros
              </a>
              <a 
                href="#sobre" 
                className={`block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${activeSection === "sobre" ? "bg-gray-100 text-primary" : "text-gray-800"}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("sobre");
                }}
              >
                Sobre
              </a>
              <a 
                href="#depoimentos" 
                className={`block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${activeSection === "depoimentos" ? "bg-gray-100 text-primary" : "text-gray-800"}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("depoimentos");
                }}
              >
                Depoimentos
              </a>
              <Button 
                asChild 
                variant="default" 
                className={`w-full mt-2 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg ${activeSection === "contato" ? "ring-2 ring-primary/30" : ""}`}
              >
                <a 
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("contato");
                  }}
                >
                  Entre em Contato
                </a>
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/#servicos" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Serviços
              </Link>
              <Link 
                to="/catalogo" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                to="/#parceiros" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Parceiros
              </Link>
              <Link 
                to="/#sobre" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                to="/#depoimentos" 
                className="block py-3 px-3 my-1 rounded-lg text-gray-800 font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Depoimentos
              </Link>
              <Button asChild variant="default" className="w-full mt-2 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg">
                <Link 
                  to="/#contato"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entre em Contato
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
