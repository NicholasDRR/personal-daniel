import { Check, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useContext } from "react";
import { ChatBotContext } from "@/contexts/ChatBotContext";

export const Services = () => {
  const { servicePlans, isLoading } = useCompanyConfig();
  const { openChatWithPlan } = useContext(ChatBotContext);

  const scrollToContact = () => {
    const element = document.getElementById('contato');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const getIcon = (index: number) => {
    const icons = [
      <Zap className="h-6 w-6" />,
      <Crown className="h-6 w-6" />,
      <Star className="h-6 w-6" />
    ];
    return icons[index % icons.length];
  };

  const getColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-yellow-500 to-orange-500",
      "from-purple-500 to-purple-600"
    ];
    return colors[index % colors.length];
  };

  const handleChoosePlan = (plan: any) => {
    openChatWithPlan(plan);
  };

  if (isLoading) {
    return (
      <section id="servicos" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Carregando...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-grafite mb-6">
            Meus
            <span className="block text-vermelho-ativo">
              Serviços
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para sua jornada de transformação. 
            Todos incluem treinos personalizados e acompanhamento profissional.
          </p>
        </div>

        {/* Plans grid */}
        {servicePlans.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {servicePlans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.highlight
                    ? "ring-2 ring-vermelho-ativo shadow-xl scale-105"
                    : "hover:shadow-lg"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-vermelho-ativo text-center py-2">
                      <span className="text-white font-semibold text-sm">
                        🔥 MAIS POPULAR
                      </span>
                    </div>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.highlight ? "pt-12" : "pt-8"}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getColor(index)} flex items-center justify-center text-white`}>
                    {getIcon(index)}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-grafite mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-grafite">
                      R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-lg text-gray-600">/mês</span>
                  </div>
                  
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-verde-energia mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleChoosePlan(plan)}
                    className="w-full py-3 font-semibold transition-all bg-vermelho-ativo hover:bg-red-600 text-white"
                  >
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Nenhum plano de serviço configurado.</p>
          </div>
        )}

        {/* CTA section */}
        <div className="text-center mt-16">
          <div className="bg-grafite rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">
              Não sabe qual plano escolher?
            </h3>
            <p className="text-gray-300 mb-6">
              Converse comigo e vou te ajudar a encontrar o plano perfeito para seus objetivos!
            </p>
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-vermelho-ativo hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold"
            >
              Falar com Personal Trainer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
