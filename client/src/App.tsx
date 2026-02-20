import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import CookieBanner from "@/components/CookieBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

// Carregamento sob demanda — reduz o bundle inicial da landing page
const Admin      = lazy(() => import("@/pages/Admin"));
const Catalogo   = lazy(() => import("@/pages/Catalogo"));
const Login      = lazy(() => import("@/pages/Login"));
const Privacidade = lazy(() => import("@/pages/Privacidade"));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/admin">
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route path="/produtos" component={Catalogo} />
        <Route path="/catalogo" component={Catalogo} />
        <Route path="/privacidade" component={Privacidade} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <ScrollToTop />
        <CookieBanner />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
