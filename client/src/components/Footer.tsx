import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Users, Briefcase, Send } from "lucide-react";
import { SiTiktok, SiWhatsapp } from "react-icons/si";
import { handleAnchorClick } from "@/utils/scroll";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (location === '/catalogo' || location === '/produtos') {
      window.location.href = `/#${sectionId}`;
    } else {
      handleAnchorClick(e, sectionId);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-6">
              <p className="font-montserrat font-bold text-2xl text-white">Magnum Torque Retifica</p>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Especialistas em retífica e recondicionamento de conversores de torque há mais de 10 anos, atendendo todo o Brasil com técnicas exclusivas de reparo.
            </p>
            <div className="flex space-x-5">
              <a href="https://www.facebook.com/magnumtorque" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#1877F2] transition-colors duration-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/magnumtorque" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#E1306C] transition-colors duration-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.tiktok.com/@magnumtorque" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-300">
                <SiTiktok className="h-6 w-6" />
              </a>
              <a href="https://wa.me/554135036828" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#25D366] transition-colors duration-300">
                <SiWhatsapp className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 font-montserrat text-white">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><a href="#inicio" onClick={(e) => handleNavigationClick(e, 'inicio')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Início</a></li>
              <li><a href="#servicos" onClick={(e) => handleNavigationClick(e, 'servicos')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Serviços</a></li>
              <li><a href="#produtos" onClick={(e) => handleNavigationClick(e, 'produtos')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Produtos</a></li>
              <li><a href="#parceiros" onClick={(e) => handleNavigationClick(e, 'parceiros')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Parceiros</a></li>
              <li><a href="#sobre" onClick={(e) => handleNavigationClick(e, 'sobre')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Sobre Nós</a></li>
              <li><a href="#depoimentos" onClick={(e) => handleNavigationClick(e, 'depoimentos')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Depoimentos</a></li>
              <li><a href="#contato" onClick={(e) => handleNavigationClick(e, 'contato')} className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Contato</a></li>
              <li><Link to="/privacidade" className="text-gray-300 hover:text-white transition-colors duration-300 inline-block py-1">Política de Privacidade</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 font-montserrat text-white">Contato</h3>
            <ul className="space-y-4">
              <li className="flex">
                <MapPin className="text-primary h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Rua Irmã Maria Lucia Roland, 403 - Hauer, Curitiba - PR, 81610-090</span>
              </li>
              <li className="flex">
                <Phone className="text-primary h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <a href="https://wa.me/554135036828" className="text-gray-300 hover:text-white">(41) 3503-6828 (Telefone/WhatsApp)</a>
              </li>
              <li className="flex">
                <Mail className="text-primary h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">contato@magnumtorque.com.br</span>
              </li>
              <li className="flex">
                <Clock className="text-primary h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Segunda a Sexta: 8h às 18h<br/>Sem fechamento para almoço</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 font-montserrat text-white">Trabalhe Conosco</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Quer fazer parte da nossa equipe? Envie seu currículo e venha trabalhar conosco!
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trabalhe Conosco
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 font-montserrat flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Trabalhe Conosco
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    A Magnum Torque está sempre em busca de novos talentos para fazer parte da nossa equipe!
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Valorizamos profissionais dedicados, com vontade de aprender e crescer no ramo automotivo. Se você tem paixão por mecânica e quer trabalhar em uma empresa sólida com mais de 10 anos de experiência, queremos conhecer você!
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Envie seu currículo para nosso e-mail e entraremos em contato.
                  </p>
                  
                  <a 
                    href="mailto:contato@magnumtorque.com.br?subject=Currículo - Trabalhe Conosco"
                    className="w-full mt-4 inline-block"
                  >
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                      <Send className="h-5 w-5" />
                      Enviar E-mail
                    </Button>
                  </a>
                  
                  <p className="text-center text-sm text-gray-500 mt-2">
                    contato@magnumtorque.com.br
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Magnum Torque Retifica LTDA. Todos os direitos reservados.</p>
          <p className="mt-2">
            <Link to="/privacidade" className="hover:text-white transition-colors duration-300">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
