import { useState, useRef, useEffect, useContext } from "react";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { COMPANY_CONFIG } from "@/config/company";
import { ChatBotContext } from "@/contexts/ChatBotContext";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface ChatStep {
  id: string;
  question: string;
  type: "text" | "number" | "select";
  options?: string[];
  field: string;
}

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  highlight: boolean;
  active: boolean;
  order_index: number;
}

export const ChatBot = () => {
  const { toast } = useToast();
  const { isOpen, selectedPlan, closeChatBot, openChatWithPlan } = useContext(ChatBotContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<any>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [trainerName, setTrainerName] = useState<string>("João");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const RATE_LIMIT_SECONDS = 300;
  const RATE_LIMIT_KEY = "chatbot_rate_limit_timestamp";

  const initializeRateLimit = () => {
    const lastSubmission = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmission) {
      const lastTime = parseInt(lastSubmission, 10);
      const currentTime = Date.now();
      const secondsElapsed = Math.floor((currentTime - lastTime) / 1000);
      if (secondsElapsed < RATE_LIMIT_SECONDS) {
        setIsRateLimited(true);
        setRemainingSeconds(RATE_LIMIT_SECONDS - secondsElapsed);
      } else {
        setIsRateLimited(false);
        setRemainingSeconds(0);
        localStorage.removeItem(RATE_LIMIT_KEY);
      }
    }
  };

  useEffect(() => {
    loadCompanyData();
    initializeRateLimit();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: plansData } = await supabase
        .from("service_plans")
        .select("*")
        .eq("company_id", COMPANY_CONFIG.COMPANY_ID)
        .eq("active", true)
        .order("order_index");

      if (plansData) {
        const formattedPlans = plansData.map((plan) => ({
          ...plan,
          features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
        })) as ServicePlan[];
        setServicePlans(formattedPlans);
      }

      const { data: contentData } = await supabase
        .from("landing_page_content")
        .select("about_name")
        .eq("company_id", COMPANY_CONFIG.COMPANY_ID)
        .maybeSingle();

      if (contentData?.about_name) {
        setTrainerName(contentData.about_name);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    }
  };

  const welcomeMessages = [
    {
      content: selectedPlan
        ? `Olá! 👋 Vi que você se interessou pelo ${selectedPlan.name}! Que ótima escolha! Vamos personalizar esse plano para você?`
        : `Olá! 👋 Sou o assistente virtual do ${trainerName} e estou aqui para te ajudar a encontrar o plano perfeito para seus objetivos!`,
      delay: 500,
    },
    {
      content: selectedPlan
        ? "Para criar um plano personalizado, preciso conhecer um pouco sobre você. Vamos começarJon começar? 😊"
        : "Vou fazer algumas perguntas para entender melhor seus objetivos e recomendar o melhor plano. Vamos começar? 😊",
      delay: 2000,
    },
    {
      content: "Primeiro, qual é o seu nome?",
      delay: 3500,
    },
  ];

  const chatSteps: ChatStep[] = [
    {
      id: "name",
      question: "Primeiro, qual é o seu nome?",
      type: "text",
      field: "name",
    },
    {
      id: "age",
      question: "Prazer em conhecê-lo! Quantos anos você tem?",
      type: "number",
      field: "age",
    },
    {
      id: "height",
      question: "Qual sua altura? (exemplo: 1.75)",
      type: "number",
      field: "height",
    },
    {
      id: "weight",
      question: "E seu peso atual? (exemplo: 70)",
      type: "number",
      field: "weight",
    },
    {
      id: "goal",
      question: "Qual seu principal objetivo?",
      type: "select",
      options: ["Emagrecimento", "Ganho de massa muscular", "Condicionamento físico", "Fortalecimento", "Reabilitação"],
      field: "goal",
    },
    {
      id: "experience",
      question: "Há quanto tempo pratica exercícios?",
      type: "select",
      options: ["Nunca pratiquei", "Menos de 6 meses", "6 meses a 1 ano", "1 a 2 anos", "Mais de 2 anos"],
      field: "experience",
    },
    {
      id: "preference",
      question: "Onde prefere treinar?",
      type: "select",
      options: ["Academia", "Em casa", "Ao ar livre", "Tanto faz"],
      field: "preference",
    },
    {
      id: "time",
      question: "Quanto tempo por dia pode dedicar aos treinos?",
      type: "select",
      options: ["30 minutos", "1 hora", "1 hora e 30 minutos", "2 horas ou mais"],
      field: "time",
    },
    {
      id: "budget",
      question: "Qual faixa de investimento considera adequada?",
      type: "select",
      options: ["Até R$ 200", "R$ 200 a R$ 350", "R$ 350 a R$ 500", "Acima de R$ 500"],
      field: "budget",
    },
    {
      id: "whatsapp",
      question: "Perfeito! Para enviarmos mais detalhes, qual seu WhatsApp?",
      type: "text",
      field: "whatsapp",
    },
    {
      id: "email",
      question: "E seu melhor e-mail?",
      type: "text",
      field: "email",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setCurrentStep(0);
      setUserData({});
      setIsRateLimited(false);
      setRemainingSeconds(0);

      welcomeMessages.forEach((message, index) => {
        setTimeout(() => {
          addMessage(message.content, "bot");
          if (index === welcomeMessages.length - 1) {
            setIsTyping(false);
          } else {
            setIsTyping(true);
          }
        }, message.delay);
      });
    }
  }, [isOpen, selectedPlan, trainerName]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === "user") {
      simulateTyping();
    }
  }, [messages]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRateLimited && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRateLimited, remainingSeconds]);

  const addMessage = (content: string, type: "bot" | "user") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateTyping = () => {
    setIsTyping(true);
    const typingTime = Math.random() * 1000 + 500;
    setTimeout(() => {
      setIsTyping(false);
    }, typingTime);
  };

  const sanitizeInput = (value: string): string => {
    return value.replace(/[<>{}]/g, "").trim();
  };

  const formatInput = (value: string, field: string): string => {
    switch (field) {
      case "height":
      case "weight":
        let cleaned = value.replace(/[^0-9,.]/g, "").replace(",", ".");
        const decimals = field === "weight" ? 1 : 2;
        const parts = cleaned.split(".");
        if (parts.length > 1) {
          cleaned = `${parts[0]}.${parts[1].slice(0, decimals)}`;
        }
        return cleaned;

      case "whatsapp":
        let phone = value.replace(/\D/g, "");
        if (phone.length > 2) {
          phone = `+55 ${phone.slice(2, 4)} ${phone.slice(4, 9)}-${phone.slice(9, 13)}`;
        } else if (phone.length > 0) {
          phone = `+55 ${phone.slice(2)}`;
        }
        return phone;

      default:
        return value;
    }
  };

  const validateInput = (value: string, field: string): { isValid: boolean; error: string } => {
    switch (field) {
      case "name":
        const nameRegex = /^[a-zA-ZÀ-ÿ\s-]{2,}$/;
        if (!nameRegex.test(value)) {
          return { isValid: false, error: "Por favor, insira um nome válido (mínimo 2 caracteres, apenas letras, espaços ou hífens)." };
        }
        return { isValid: true, error: "" };

      case "age":
        const age = parseInt(value);
        if (isNaN(age) || age < 10 || age > 120) {
          return { isValid: false, error: "A idade deve ser um número entre 10 e 120 anos." };
        }
        return { isValid: true, error: "" };

      case "height":
        const height = parseFloat(value.replace(",", "."));
        if (isNaN(height) || height < 1.0 || height > 2.5) {
          return { isValid: false, error: "A altura deve ser um número entre 1.00 e 2.50 metros." };
        }
        return { isValid: true, error: "" };

      case "weight":
        const weight = parseFloat(value.replace(",", "."));
        if (isNaN(weight) || weight < 30 || weight > 300) {
          return { isValid: false, error: "O peso deve ser um número entre 30 e 300 kg." };
        }
        return { isValid: true, error: "" };

      case "whatsapp":
        const phoneRegex = /^\+55\s?\d{2}\s?9\d{4}-?\d{4}$/;
        if (!phoneRegex.test(value)) {
          return { isValid: false, error: "Por favor, insira um número de WhatsApp válido (exemplo: +5511987654321)." };
        }
        return { isValid: true, error: "" };

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, error: "Por favor, insira um email válido." };
        }
        return { isValid: true, error: "" };

      default:
        return { isValid: true, error: "" };
    }
  };

  const saveChatbotLead = async (finalUserData: any, recommendedPlan?: ServicePlan) => {
    if (isRateLimited) {
      toast({
        title: "Aguarde",
        description: `Por favor, aguarde ${remainingSeconds} segundos antes de enviar novamente.`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const sanitizedData = {
      ...finalUserData,
      name: sanitizeInput(finalUserData.name),
      email: sanitizeInput(finalUserData.email),
      whatsapp: sanitizeInput(finalUserData.whatsapp),
    };

    try {
      const height = parseFloat(sanitizedData.height);
      const weight = parseFloat(sanitizedData.weight);
      const bmi = height > 0 ? weight / (height * height) : null;

      let enhancedNotes = `Dados coletados via chatbot. Tempo preferido: ${sanitizedData.time || "Não informado"}. Orçamento: ${sanitizedData.budget || "Não informado"}.`;

      if (selectedPlan) {
        enhancedNotes += ` Plano selecionado: ${selectedPlan.name}`;
      }

      if (recommendedPlan) {
        enhancedNotes += ` Plano recomendado: ${recommendedPlan.name} (R$ ${recommendedPlan.price})`;
      }

      const leadData = {
        company_id: COMPANY_CONFIG.COMPANY_ID,
        name: sanitizedData.name || null,
        contact_whatsapp: sanitizedData.whatsapp || null,
        contact_email: sanitizedData.email || null,
        age: parseInt(sanitizedData.age) || null,
        height: height || null,
        weight: weight || null,
        bmi: bmi,
        gender: null,
        primary_goal: sanitizedData.goal || null,
        experience_level: sanitizedData.experience || null,
        workout_preference: sanitizedData.preference || null,
        current_sports: [],
        selected_plan_id: selectedPlan?.id || recommendedPlan?.id || null,
        steps_completed: chatSteps.length,
        total_steps: chatSteps.length,
        completion_rate: 100,
        conversion_status: "NEW" as const,
        notes: enhancedNotes,
      };

      const { data: testData, error: testError } = await supabase
        .from("chatbot_leads")
        .select("count")
        .limit(1);

      if (testError) {
        console.error("%c[CHATBOT ERROR - TESTE DE CONEXÃO]", "background: #ef4444; color: white; padding: 2px 5px; border-radius: 3px;", testError);
        throw new Error(`Erro no teste de conexão: ${testError.message}`);
      }

      const { data, error: dbError } = await supabase
        .from("chatbot_leads")
        .insert(leadData)
        .select()
        .single();

      if (dbError) {
        console.error("%c[CHATBOT ERROR - INSERÇÃO]", "background: #ef4444; color: white; padding: 2px 5px; border-radius: 3px;", {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code,
        });
        throw dbError;
      }

      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      setIsRateLimited(true);
      setRemainingSeconds(RATE_LIMIT_SECONDS);

      await handleSuccessfulSave(data, sanitizedData, recommendedPlan);
    } catch (error: any) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro ao salvar dados",
        description: `Erro: ${error.message || "Erro desconhecido"}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessfulSave = async (data: any, finalUserData: any, recommendedPlan?: ServicePlan) => {

    try {
      const emailData = {
        name: finalUserData.name,
        email: finalUserData.email || null,
        whatsapp: finalUserData.whatsapp || null,
        age: parseInt(finalUserData.age) || null,
        height: parseFloat(finalUserData.height) || null,
        weight: parseFloat(finalUserData.weight) || null,
        goal: finalUserData.goal || null,
        experience: finalUserData.experience || null,
        preference: finalUserData.preference || null,
        time: finalUserData.time || null,
        budget: finalUserData.budget || null,
        selectedPlan: selectedPlan ? { name: selectedPlan.name, price: selectedPlan.price } : null,
        recommendedPlan: recommendedPlan ? { name: recommendedPlan.name, price: recommendedPlan.price } : null,
        companyId: COMPANY_CONFIG.COMPANY_ID,
      };


      const { error: emailError } = await supabase.functions.invoke("send-chatbot-lead-email", {
        body: emailData,
      });

      if (emailError) {
        console.error("Error sending chatbot lead email:", emailError);
      } else {
        console.log("Chatbot lead email sent successfully");
      }
    } catch (emailError) {
      console.error("Error in email sending process:", emailError);
    }

    toast({
      title: "Dados salvos!",
      description: "Suas informações foram registradas com sucesso.",
    });
  };

  const handleStart = () => {
    openChatWithPlan(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInput(e.target.value, currentStepData.field);
    setCurrentInput(formattedValue);
  };

  const handleSendMessage = async (value?: string) => {
    const input = value || currentInput.trim();
    if (!input) return;

    const currentStepData = chatSteps[currentStep];
    const validation = validateInput(input, currentStepData.field);

    if (!validation.isValid) {
      toast({
        title: "Entrada inválida",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    addMessage(input, "user");
    setCurrentInput("");

    setUserData((prev) => ({ ...prev, [currentStepData.field]: input }));

    simulateTyping();

    try {
      if (currentStep < chatSteps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        addMessage(chatSteps[nextStep].question, "bot");
      } else {
        await handleEndConversation(input);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getRecommendedPlan = (budget: string): ServicePlan | null => {
    if (servicePlans.length === 0) return null;

    let minPrice = 0;
    let maxPrice = Infinity;

    switch (budget) {
      case "Até R$ 200":
        maxPrice = 200;
        break;
      case "R$ 200 a R$ 350":
        minPrice = 200;
        maxPrice = 350;
        break;
      case "R$ 350 a R$ 500":
        minPrice = 350;
        maxPrice = 500;
        break;
      case "Acima de R$ 500":
        minPrice = 500;
        break;
    }

    const plansInBudget = servicePlans.filter((plan) => plan.price >= minPrice && plan.price <= maxPrice);

    if (plansInBudget.length > 0) {
      const highlightedPlan = plansInBudget.find((plan) => plan.highlight);
      return highlightedPlan || plansInBudget[0];
    }

    if (maxPrice < Infinity) {
      return servicePlans.reduce((cheapest, plan) => (plan.price < cheapest.price ? plan : cheapest));
    } else {
      const highlightedPlan = servicePlans.find((plan) => plan.highlight);
      return highlightedPlan || servicePlans.reduce((expensive, plan) => (plan.price > expensive.price ? plan : expensive));
    }
  };

  const handleEndConversation = async (email: string) => {
    try {
      const finalUserData = { ...userData, email };
      const planToRecommend = selectedPlan || getRecommendedPlan(finalUserData.budget);

      await saveChatbotLead(finalUserData, planToRecommend);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      addMessage(
        `${selectedPlan ? "Ótimo! Você escolheu o" : "Baseado no seu perfil, recomendo o"} ${planToRecommend?.name || "nosso melhor plano"}! 🎯\n\nEm breve o ${trainerName} entrará em contato via WhatsApp para conversarmos sobre seu plano personalizado.`,
        "bot"
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      addMessage("Obrigado por usar nosso assistente! Sua transformação começa agora! 💪", "bot");

      await new Promise((resolve) => setTimeout(resolve, 3000));
      const planName = planToRecommend ? planToRecommend.name : "nossos planos de treino";
      const whatsappMessage = `Olá ${trainerName}! Acabei de preencher o formulário no seu site. Meu nome é ${finalUserData.name} e gostaria de saber mais sobre ${planName}.`;
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
    } catch (error) {
      console.error("Error in handleEndConversation:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar o chat. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const currentStepData = chatSteps[currentStep];

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end space-y-2 z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs animate-bounce">
            <p className="text-sm text-gray-700">
              {selectedPlan ? `👋 Quer saber mais sobre o ${selectedPlan.name}?` : "👋 Quer ajuda para escolher o melhor plano?"}
            </p>
          </div>
          <Button
            onClick={handleStart}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-vermelho-ativo to-blue-600 hover:from-vermelho-ativo/90 hover:to-blue-600/90 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
          >
            <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </Button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] sm:h-[600px] sm:max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100">
          <div className="bg-gradient-to-r from-vermelho-ativo to-blue-600 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Assistente PersonalFit</h3>
                <p className="text-xs sm:text-sm opacity-90">{isSaving ? "Salvando dados..." : "Online agora"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChatBot}
              className="text-white hover:bg-white/20 p-1 sm:p-2"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-vermelho-ativo text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {message.type === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${
                      message.type === "user" ? "bg-vermelho-ativo text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {(isTyping || isSaving) && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {currentStep < chatSteps.length && !isSaving && !isRateLimited && (
            <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
              {currentStepData?.type === "select" ? (
                <div className="space-y-2">
                  {currentStepData.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleSendMessage(option)}
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs sm:text-sm hover:bg-vermelho-ativo hover:text-white hover:border-vermelho-ativo"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      currentStepData.field === "whatsapp"
                        ? "Ex: +55 11 98765-4321"
                        : currentStepData.field === "height"
                        ? "Ex: 1.75"
                        : currentStepData.field === "weight"
                        ? "Ex: 74.5"
                        : "Digite sua resposta..."
                    }
                    className="flex-1 text-xs sm:text-sm"
                    type="text"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentInput.trim()}
                    className="bg-vermelho-ativo hover:bg-vermelho-ativo/90 p-2 sm:p-3"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {(isSaving || isRateLimited) && (
            <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0 bg-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-600">
                {isSaving ? "Salvando dados..." : `Aguarde ${remainingSeconds} segundos para enviar novamente`}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};