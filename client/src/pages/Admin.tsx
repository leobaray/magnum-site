import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductAdmin } from "@/components/ProductAdmin";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Package2, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Home,
  ChevronRight
} from "lucide-react";

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("produtos");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    { id: "produtos", label: "Produtos", icon: <Package2 className="h-5 w-5" />, description: "Gerenciar catálogo" },
    { id: "configuracoes", label: "Configurações", icon: <Settings className="h-5 w-5" />, description: "Ajustes do sistema" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "produtos":
        return <ProductAdmin />;
      case "configuracoes":
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ajuste as configurações gerais do painel administrativo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Informações da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-500 mb-1">Nome da Empresa</p>
                      <p className="font-semibold text-gray-900">Magnum Torque Retífica LTDA</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-500 mb-1">Endereço</p>
                      <p className="font-semibold text-gray-900">Rua das Indústrias, 789 - Belo Horizonte, MG</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                      <p className="font-semibold text-gray-900">(31) 3333-4444</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">contato@magnumtorque.com.br</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Segurança
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">Proteção de Acesso</p>
                        <p className="text-sm text-gray-500">
                          O sistema está protegido com autenticação segura
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <ProductAdmin />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-slate-800 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src="/logo_10anos.webp" alt="Magnum Torque" className="h-8 w-auto" />
            <span className="font-bold text-white">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white shadow-xl rounded-b-xl" onClick={(e) => e.stopPropagation()}>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-xs ${activeTab === item.id ? "text-white/70" : "text-gray-500"}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
              <Separator className="my-4" />
              <Link href="/">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Voltar ao Site</span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair do Sistema</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-gray-900 to-slate-800 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center justify-center border-b border-white/10">
            <img src="/logo_10anos.webp" alt="Magnum Torque" className="h-14 w-auto" />
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                    <div className="flex-1 text-left">
                      <p>{item.label}</p>
                      <p className={`text-xs ${activeTab === item.id ? "text-white/70" : "text-gray-500"}`}>
                        {item.description}
                      </p>
                    </div>
                    {activeTab === item.id && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            
            <Separator className="my-4 bg-white/10" />
            
            {/* Back to site */}
            <Link href="/">
              <button className="w-full group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                <Home className="h-5 w-5" />
                <span>Voltar ao Site</span>
              </button>
            </Link>
            
            {/* User info and logout */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                  <p className="text-xs text-gray-400">Administrador</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-3 justify-start text-gray-300 hover:text-white hover:bg-red-500/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair do Sistema
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="py-6 lg:py-10">
          {/* Mobile top padding for fixed header */}
          <div className="h-16 lg:hidden"></div>
          
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Painel Administrativo</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 mt-1">
                {activeTab === "produtos" 
                  ? "Adicione, edite ou remova produtos do catálogo" 
                  : "Gerencie as configurações do sistema"}
              </p>
            </div>
            
            {/* Content */}
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
