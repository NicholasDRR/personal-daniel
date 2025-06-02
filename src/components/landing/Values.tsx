
import { Heart, Shield, Target, Trophy, Users, Zap } from "lucide-react";

export const Values = () => {
  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Foco em Resultados",
      description: "Cada treino é planejado para te levar mais perto dos seus objetivos"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Cuidado Personalizado",
      description: "Atendimento individual respeitando suas limitações e potencialidades"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Segurança Sempre",
      description: "Técnicas corretas e progressão gradual para evitar lesões"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Excelência",
      description: "Busca constante pela melhor versão de cada aluno"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Suporte Completo",
      description: "Acompanhamento contínuo dentro e fora da academia"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Motivação",
      description: "Energia positiva para te manter focado na jornada"
    }
  ];

  return (
    <section className="py-20 bg-grafite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meus
            <span className="block text-vermelho-ativo">
              Valores
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Princípios que guiam meu trabalho e garantem os melhores resultados para meus alunos
          </p>
        </div>

        {/* Values grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20"
            >
              <div className="w-16 h-16 bg-vermelho-ativo rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                {value.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {value.title}
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
