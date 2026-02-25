import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatTaxId(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function validateCPF(val: string): boolean {
  const d = val.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i);
  let r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  if (r !== +d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  return r === +d[10];
}

function validateCNPJ(val: string): boolean {
  const d = val.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (len: number) => {
    const w = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = d.slice(0, len).split("").reduce((acc, v, i) => acc + +v * w[i], 0);
    const rem = s % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  return calc(12) === +d[12] && calc(13) === +d[13];
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  taxId: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 11) return validateCPF(val);
    if (digits.length === 14) return validateCNPJ(val);
    return false;
  }, { message: "CPF ou CNPJ inválido" }),
  subject: z.string().min(1, { message: "Selecione um assunto" }),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      taxId: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const subjectMap: Record<string, string> = {
        orcamento: "Orçamento",
        duvida: "Dúvida Técnica",
        agendamento: "Agendamento",
        outro: "Outro",
      };
      const subjectLabel = subjectMap[data.subject] ?? data.subject;
      const messageText = `${subjectLabel}\n\n${data.message}\n\n${data.name}\n${data.email}\n${data.taxId}`;
      const whatsappNumber = "554135036828";
      const encoded = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
      window.open(whatsappUrl, "_blank");
      toast({
        title: "Abrindo WhatsApp",
        description: "Sua mensagem será enviada via WhatsApp.",
        variant: "default",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao preparar mensagem",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 xl:pt-24 xl:pb-28 bg-gradient-to-br from-gray-50 via-white to-slate-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-400/3 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-montserrat relative leading-tight">
            Entre em
            <span className="text-primary relative block sm:inline">
              {" "}Contato
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-primary to-gray-300 rounded-full transform scale-x-75"></div>
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Estamos prontos para atender suas necessidades e esclarecer quaisquer dúvidas.
            Entre em contato através dos nossos canais ou envie sua mensagem.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-gray-500/2 rounded-3xl transform rotate-1"></div>

          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Contact Information Side */}
              <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 filter blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 filter blur-xl"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 mb-4 bg-[#ffffff33]">
                      <span className="font-semibold text-xs uppercase tracking-wide text-[#ffffff]">Contato Direto</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat">
                      Informações de Contato
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Estamos prontos para atender sua necessidade. Entre em contato pelos nossos canais:
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="group flex items-start p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                        <Phone className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 font-montserrat text-white">Telefone/WhatsApp</h4>
                        <p><a href="https://wa.me/554135036828" className="text-gray-300 hover:text-white hover:underline transition-colors text-sm">(41) 3503-6828</a></p>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                        <Mail className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 font-montserrat text-white">E-mail</h4>
                        <p className="text-gray-300 text-sm">contato@magnumtorque.com.br</p>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                        <MapPin className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 font-montserrat text-white">Endereço</h4>
                        <p className="text-gray-300 text-sm">Rua Irmã Maria Lucia Roland, 403 - Hauer</p>
                        <p className="text-gray-300 text-sm">Curitiba - PR, 81610-090</p>
                      </div>
                    </div>

                    <div className="group flex items-start p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                        <Clock className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 font-montserrat text-white">Horário de Atendimento</h4>
                        <p className="text-gray-300 text-sm">Segunda a Sexta: 8h às 18h</p>
                        <p className="text-gray-300 text-sm">Sem fechamento para almoço</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="lg:w-3/5 p-8 md:p-12">
                <div className="mb-8">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <span className="text-primary font-semibold text-xs uppercase tracking-wide">Formulário de Contato</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                    Envie sua Mensagem
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 font-medium">Nome Completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Seu nome"
                                className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary transition-all duration-300 rounded-xl py-3"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 font-medium">E-mail</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary transition-all duration-300 rounded-xl py-3"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 font-medium">CPF/CNPJ</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                                className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary transition-all duration-300 rounded-xl py-3"
                                {...field}
                                onChange={(e) => field.onChange(formatTaxId(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 font-medium">Assunto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary transition-all duration-300 rounded-xl py-3">
                                <SelectValue placeholder="Selecione um assunto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="orcamento">Orçamento</SelectItem>
                              <SelectItem value="duvida">Dúvida Técnica</SelectItem>
                              <SelectItem value="agendamento">Agendamento</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-900 font-medium">Mensagem</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite sua mensagem aqui..."
                              className="bg-gray-50/50 border-gray-200 focus:bg-white focus:border-primary transition-all duration-300 rounded-xl resize-none min-h-[120px]"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                        disabled={isSubmitting}
                        data-testid="button-submit-contact"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Enviando...
                          </span>
                        ) : (
                          "Enviar Mensagem"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
