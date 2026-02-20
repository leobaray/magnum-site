import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <p className="text-8xl font-bold text-primary mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Página não encontrada</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Página anterior
            </button>
          </Button>
        </div>
      </div>
    </div>
  );
}
