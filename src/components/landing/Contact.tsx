import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

export const Contact = () => {
  const { content, companyId } = useCompanyConfig();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há um bloqueio salvo
    const savedBlock = localStorage.getItem('form_block');
    if (savedBlock) {
      const { timestamp } = JSON.parse(savedBlock);
      const now = Date.now();
      const threeMinutes = 3 * 60 * 1000;
      const diff = now - timestamp;
      
      if (diff < threeMinutes) {
        setIsBlocked(true);
        setTimeLeft(Math.ceil((threeMinutes - diff) / 1000));
      } else {
        localStorage.removeItem('form_block');
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBlocked && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('form_block');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBlocked, timeLeft]);

  const validateForm = (data: typeof formData) => {
    const newErrors: {[key: string]: string} = {};

    if (!data.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    } else if (data.name.trim().length > 100) {
      newErrors.name = "Nome deve ter no máximo 100 caracteres";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Email inválido";
    }

    if (data.phone && !/^[\d\s\(\)\-\+]+$/.test(data.phone)) {
      newErrors.phone = "Telefone inválido";
    }

    if (!data.email && !data.phone) {
      newErrors.contact = "Forneça pelo menos email ou telefone";
    }

    if (!data.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (data.message.trim().length < 10) {
      newErrors.message = "Mensagem deve ter pelo menos 10 caracteres";
    } else if (data.message.trim().length > 1000) {
      newErrors.message = "Mensagem deve ter no máximo 1000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 ? {} : newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isBlocked) return;

    // Validar formulário
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar número de leads existentes
      const [chatbotResponse, contactResponse] = await Promise.all([
        supabase
          .from('chatbot_leads')
          .select('*')
          .eq('company_id', companyId),
        supabase
          .from('contact_form_leads')
          .select('*')
          .eq('company_id', companyId)
      ]);

      // Log dos erros se houver
      if (chatbotResponse.error) {
        console.error("Erro na consulta de chatbot leads:", chatbotResponse.error);
        throw chatbotResponse.error;
      }
      if (contactResponse.error) {
        console.error("Erro na consulta de contact leads:", contactResponse.error);
        throw contactResponse.error;
      }


      const chatbotCount = (chatbotResponse.data || []).length;
      const contactCount = (contactResponse.data || []).length;

      const totalLeads = chatbotCount + contactCount;

      let shouldSaveToDatabase = totalLeads < 25;

      // Enviar email (sempre enviar, independente do limite)
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          message: formData.message.trim(),
          companyId: companyId
        }
      });

      // Salvar no banco apenas se estiver dentro do limite
      let databaseError = null;
      if (shouldSaveToDatabase) {
        const { error } = await supabase
          .from('contact_form_leads')
          .insert({
            company_id: companyId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,
            status: 'NEW',
            contacted: false
          });
        
        databaseError = error;
      }

      if (emailError) {
        if (shouldSaveToDatabase && !databaseError) {
          toast({
            title: "Mensagem recebida!",
            description: "Seu contato foi registrado. O email pode ter falhado, mas sua mensagem foi salva.",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao enviar email. Tente novamente.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Mensagem enviada!",
          description: "Entrarei em contato em breve. Obrigado!",
        });

        // Bloquear o formulário por 3 minutos
        setIsBlocked(true);
        setTimeLeft(1); // 3 minutos em segundos
        localStorage.setItem('form_block', JSON.stringify({ timestamp: Date.now() }));
      }
      
      // Limpar formulário
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});

    } catch (error: any) {
      // Tentar identificar o tipo de erro
      let errorMessage = "Erro ao enviar mensagem. Tente novamente.";
      
      if (error.message?.includes('CORS')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Erro de rede. Tente novamente em alguns segundos.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (name === 'email' || name === 'phone') {
      setErrors(prev => ({ ...prev, contact: "" }));
    }
  };

  return (
    <section id="contato" className="py-20 bg-cinza-claro">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-grafite mb-6">
            Entre em
            <span className="block text-vermelho-ativo">
              Contato
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pronto para começar sua transformação? Vamos conversar sobre seus objetivos!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-grafite mb-6">Vamos conversar!</h3>
              <p className="text-gray-700 mb-8">
                Entre em contato para agendar sua avaliação gratuita e dar o primeiro passo 
                rumo aos seus objetivos.
              </p>
            </div>

            {/* Contact items */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-vermelho-ativo rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-grafite">WhatsApp</div>
                  <div className="text-gray-700">
                    {content?.contact_whatsapp || "(11) 99999-9999"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-vermelho-ativo rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-grafite">E-mail</div>
                  <div className="text-gray-700">
                    {content?.contact_email || "contato@exemplo.com"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-vermelho-ativo rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-grafite">Localização</div>
                  <div className="text-gray-700">São Paulo, SP</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-vermelho-ativo rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-grafite">Horário de Atendimento</div>
                  <div className="text-gray-700">Seg-Sex: 6h às 22h | Sáb: 6h às 18h</div>
                </div>
              </div>
            </div>

            {/* CTA para WhatsApp */}
            <div className="bg-grafite backdrop-blur-sm rounded-2xl p-6 border border-gray-300">
              <h4 className="text-lg font-semibold text-white mb-3">
                Prefere falar diretamente?
              </h4>
              <p className="text-gray-300 mb-4">
                Clique no botão abaixo para uma conversa rápida pelo WhatsApp
              </p>
              <Button 
                className="w-full bg-verde-energia hover:bg-green-600 text-white"
                onClick={() => {
                  const whatsapp = content?.contact_whatsapp || "5511999999999";
                  window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}`, '_blank');
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Chamar no WhatsApp
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-grafite mb-6">Envie uma mensagem</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`border-gray-300 text-grafite placeholder:text-gray-500 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Seu melhor e-mail"
                  value={formData.email}
                  onChange={handleChange}
                  className={`border-gray-300 text-grafite placeholder:text-gray-500 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Seu WhatsApp (opcional)"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`border-gray-300 text-grafite placeholder:text-gray-500 ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact}</p>
              )}

              <div>
                <Textarea
                  name="message"
                  placeholder="Conte-me sobre seus objetivos..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`border-gray-300 text-grafite placeholder:text-gray-500 resize-none ${
                    errors.message ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/1000 caracteres
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isBlocked}
                className={`w-full font-semibold py-3 ${
                  isBlocked 
                    ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                    : 'bg-vermelho-ativo hover:bg-red-600'
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : isBlocked ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Aguarde {timeLeft}s
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>

              {isBlocked && (
                <p className="text-sm text-gray-500 text-center">
                  Por favor, aguarde {timeLeft} segundos antes de enviar outro formulário.
                </p>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                Suas informações estão seguras e não serão compartilhadas.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
