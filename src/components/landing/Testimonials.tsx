
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

// Função para gerar avatar com iniciais
const generateAvatar = (name: string) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Cores baseadas no hash do nome para consistência
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const colorIndex = name.length % colors.length;
  
  return { initials, colorClass: colors[colorIndex] };
};

export const Testimonials = () => {
  const { testimonials, isLoading } = useCompanyConfig();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-vermelho-ativo fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const renderClientAvatar = (testimonial: any) => {
    if (testimonial.client_photo_url) {
      return (
        <img
          src={testimonial.client_photo_url}
          alt={testimonial.client_name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }

    const avatar = generateAvatar(testimonial.client_name);
    return (
      <div className={`w-12 h-12 rounded-full ${avatar.colorClass} flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200`}>
        {avatar.initials}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section id="depoimentos" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vermelho-ativo"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-grafite mb-6">
            O que Meus Alunos
            <span className="block text-vermelho-ativo">
              Dizem
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Depoimentos reais de pessoas que transformaram suas vidas com meu acompanhamento
          </p>
        </div>

        {/* Testimonials grid */}
        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-gray-100"
              >
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-vermelho-ativo/30" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating || 5)}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.testimonial_text}"
                  </p>

                  {/* Client info */}
                  <div className="flex items-center space-x-4">
                    {renderClientAvatar(testimonial)}
                    <div>
                      <h4 className="font-semibold text-grafite">
                        {testimonial.client_name}
                      </h4>
                    </div>
                  </div>

                  {/* Result badge */}
                  {testimonial.result_achieved && (
                    <div className="mt-4 inline-block bg-verde-energia/10 text-verde-energia px-3 py-1 rounded-full text-sm font-medium">
                      ✅ {testimonial.result_achieved}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Nenhum depoimento configurado.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-cinza-claro rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-grafite mb-4">
              Quer ser o próximo depoimento de sucesso?
            </h3>
            <p className="text-gray-600 mb-6">
              Comece sua transformação hoje mesmo e junte-se aos nossos alunos satisfeitos!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-vermelho-ativo hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Começar Agora
              </button>
              <button className="border border-vermelho-ativo text-vermelho-ativo hover:bg-vermelho-ativo hover:text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Ver Mais Depoimentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
