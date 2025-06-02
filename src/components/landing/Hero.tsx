import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

export const Hero = () => {
  const { metrics, content, isLoading } = useCompanyConfig();

  const scrollToServices = () => {
    const element = document.getElementById('servicos');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTestimonials = () => {
    const element = document.getElementById('depoimentos');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grafite pt-16">
        <div className="text-white">Carregando...</div>
      </section>
    );
  }

  // Se não há dados, não renderizar a seção
  if (!content) {
    return null;
  }

  // URL de background personalizada ou padrão
  const backgroundUrl = content.hero_background_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grafite pt-20">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${backgroundUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-grafite/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-verde-energia rounded-full mr-2 animate-pulse"></span>
              CREF {content.trainer_cref_display}
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {content.hero_highlight_text}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {content.hero_secondary_text}
          </p>

          {/* Stats */}
          {metrics && (
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-vermelho-ativo">
                  {metrics.students_count}+
                </div>
                <div className="text-sm text-gray-300">Alunos Transformados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-vermelho-ativo">
                  {metrics.success_rate}%
                </div>
                <div className="text-sm text-gray-300">Taxa de Sucesso</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-vermelho-ativo">
                  {metrics.experience_years}+
                </div>
                <div className="text-sm text-gray-300">Anos de Experiência</div>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={scrollToServices}
              size="lg"
              className="bg-vermelho-ativo hover:bg-red-600 text-white font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Começar Minha Transformação
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToTestimonials}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-verde-energia hover:border-verde-energia px-8 py-4 rounded-full transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Depoimentos
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center animate-bounce">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
