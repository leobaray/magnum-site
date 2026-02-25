import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { scrollToSection as utilScrollToSection } from "@/utils/scroll";

type SectionItem = { label: string; section: string };
type LinkItem = { label: string; href: string };
type NavItem = SectionItem | LinkItem;

const NAV_ITEMS: NavItem[] = [
  { label: "Início",       section: "inicio" },
  { label: "Serviços",     section: "servicos" },
  { label: "Produtos",     href: "/produtos" },
  { label: "Parceiros",    section: "parceiros" },
  { label: "Sobre",        section: "sobre" },
  { label: "Depoimentos",  section: "depoimentos" },
];

const PENDING_SECTION_KEY = "pendingSection";

function isSectionItem(item: NavItem): item is SectionItem {
  return "section" in item;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [location, setLocation] = useLocation();

  const isHome = location === "/";

  // Quando a home monta, verifica se há seção pendente para scroll
  useEffect(() => {
    if (!isHome) return;
    const pending = sessionStorage.getItem(PENDING_SECTION_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_SECTION_KEY);
      // Aguarda o DOM renderizar antes de fazer scroll
      requestAnimationFrame(() => {
        setTimeout(() => utilScrollToSection(pending, 60), 50);
      });
    }
  }, [isHome]);

  const navigateToSection = (sectionId: string) => {
    utilScrollToSection(sectionId, 60);
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  // Navega para uma seção da home — direto se já estiver lá, client-side se não
  const goToHomeSection = (sectionId: string) => {
    if (isHome) {
      navigateToSection(sectionId);
    } else {
      sessionStorage.setItem(PENDING_SECTION_KEY, sectionId);
      setLocation("/");
    }
    setIsMenuOpen(false);
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (!isSectionItem(item)) return;
    e.preventDefault();
    goToHomeSection(item.section);
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (!isHome) return; // Só rastreia seções na home
      const sectionIds = NAV_ITEMS.filter(isSectionItem).map((i) => i.section);
      const offset = 60;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          if (top <= offset && bottom > offset) {
            setActiveSection(id);
            return;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isActive = (item: NavItem) => {
    if (!isSectionItem(item)) return location === item.href;
    return isHome && activeSection === item.section;
  };

  const DesktopNavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const cls = `font-medium transition duration-300 relative py-2 group ${
      active ? "text-primary font-semibold" : "text-gray-700 hover:text-primary"
    }`;
    const indicator = (
      <span
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    );
    if (!isSectionItem(item)) {
      return (
        <Link to={item.href} className={cls}>
          {item.label}
          {indicator}
        </Link>
      );
    }
    return (
      <a href={`#${item.section}`} className={cls} onClick={(e) => handleItemClick(e, item)}>
        {item.label}
        {indicator}
      </a>
    );
  };

  const MobileNavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const cls = `block py-3 px-3 my-1 rounded-lg font-medium hover:bg-gray-100 hover:text-primary transition-all duration-200 ${
      active ? "bg-gray-100 text-primary" : "text-gray-800"
    }`;
    if (!isSectionItem(item)) {
      return (
        <Link to={item.href} className={cls} onClick={() => setIsMenuOpen(false)}>
          {item.label}
        </Link>
      );
    }
    return (
      <a href={`#${item.section}`} className={cls} onClick={(e) => handleItemClick(e, item)}>
        {item.label}
      </a>
    );
  };

  const ContactButton = ({ mobile = false }: { mobile?: boolean }) => (
    <Button
      asChild
      variant="default"
      className={`bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-md hover:shadow-lg ${
        mobile ? "w-full mt-2" : ""
      } ${isHome && activeSection === "contato" ? "ring-2 ring-primary/30" : ""}`}
    >
      <a
        href="#contato"
        onClick={(e) => {
          e.preventDefault();
          goToHomeSection("contato");
        }}
      >
        Entre em Contato
      </a>
    </Button>
  );

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg backdrop-blur-sm bg-white/95" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo — client-side navigation, sem reload */}
        <Link
          to="/"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              navigateToSection("inicio");
            }
          }}
          className="flex items-center"
        >
          <span className="font-montserrat text-2xl font-bold text-gray-900">
            Magnum <span className="text-primary">Torque</span>
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-full hover:bg-gray-100 text-primary focus:outline-none transition duration-200"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_ITEMS.map((item) => (
            <DesktopNavItem key={item.label} item={item} />
          ))}
          <ContactButton />
        </nav>
      </div>

      {/* Mobile nav */}
      <div
        className={`md:hidden bg-white px-6 shadow-lg rounded-b-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-[520px] pb-6 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.label} item={item} />
        ))}
        <ContactButton mobile />
      </div>
    </header>
  );
}
