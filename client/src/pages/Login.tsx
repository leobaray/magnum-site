import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";

const loginFormSchema = z.object({
  username: z.string().min(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function Login() {
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o painel administrativo...",
      });
    } catch (error: any) {
      setLoginError(error.message || "Falha na autenticação. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5">
          <div className="w-full h-full border border-white/20 rounded-full"></div>
          <div className="absolute inset-8 border border-white/10 rounded-full"></div>
          <div className="absolute inset-16 border border-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Back to site link */}
      <div className="relative z-10 p-4 sm:p-6">
        <Link href="/">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative z-10">
        {/* Logo and title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30 mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-montserrat">
            Magnum <span className="text-primary">Torque</span>
          </h1>
          <p className="text-gray-400">Painel Administrativo</p>
        </div>
        
        {/* Login card */}
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center text-white">Acesso Restrito</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {loginError && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Usuário</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <Input 
                            placeholder="Digite seu usuário" 
                            autoComplete="username" 
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                            className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Entrar no Sistema
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <div className="flex items-center text-sm text-gray-500">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Conexão segura e criptografada
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 sm:p-6 text-center">
        <p className="text-sm text-gray-600">
          © 2026 Magnum Torque Retífica LTDA. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
