
import { Award, Clock, Star, Users } from "lucide-react";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

export const Metrics = () => {
  const { metrics, isLoading } = useCompanyConfig();

  if (isLoading) {
    return (
      <section className="py-20 bg-cinza-claro relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Carregando...</div>
        </div>
      </section>
    );
  }

  // Se não há métricas, não renderizar a seção
  if (!metrics) {
    return null;
  }

  const metricsData = [
    {
      icon: <Users className="h-8 w-8" />,
      value: `${metrics.students_count}+`,
      label: "Alunos Transformados",
      description: "Pessoas que mudaram de vida",
      color: "bg-blue-500"
    },
    {
      icon: <Star className="h-8 w-8" />,
      value: `${metrics.success_rate}%`,
      label: "Taxa de Sucesso",
      description: "Dos alunos alcançam seus objetivos",
      color: "bg-vermelho-ativo"
    },
    {
      icon: <Award className="h-8 w-8" />,
      value: `${metrics.average_rating}`,
      label: "Nota Média",
      description: "Avaliação dos meus alunos",
      color: "bg-verde-energia"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      value: `${metrics.experience_years}+`,
      label: "Anos de Experiência",
      description: "Dedicados à transformação de vidas",
      color: "bg-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-cinza-claro relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-grafite mb-6">
            Resultados que
            <span className="block text-vermelho-ativo">
              Falam por Si
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Números que comprovam a eficácia do meu método de treinamento
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metricsData.map((metric, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${metric.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {metric.icon}
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-grafite mb-2 group-hover:text-vermelho-ativo transition-colors duration-300">
                {metric.value}
              </div>
              
              <div className="text-xl font-semibold text-gray-700 mb-2">
                {metric.label}
              </div>
              
              <p className="text-gray-600 text-sm">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <div className="bg-grafite backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-300">
            <div className="grid md:grid-cols-3 gap-8 text-white">
              <div>
                <div className="text-2xl font-bold text-vermelho-ativo mb-2">100%</div>
                <div className="text-sm">Garantia de Satisfação</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-vermelho-ativo mb-2">24/7</div>
                <div className="text-sm">Suporte WhatsApp</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-vermelho-ativo mb-2">CREF</div>
                <div className="text-sm">Profissional Certificado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
