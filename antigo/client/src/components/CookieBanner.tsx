import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-2xl transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-label="Aviso de cookies"
    >
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
          Usamos cookies essenciais para o funcionamento do site (autenticação de sessão) e carregamos fontes
          do Google Fonts. Ao continuar, você concorda com nossa{" "}
          <Link
            href="/privacidade"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Entendido
          </button>
          <button
            onClick={accept}
            className="text-gray-400 hover:text-white transition-colors p-1 focus:outline-none"
            aria-label="Fechar aviso"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
