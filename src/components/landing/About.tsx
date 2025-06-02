
import { Award, Clock, Users, Zap } from "lucide-react";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

const typeLabels = {
  GRADUATION: 'Graduação',
  CERTIFICATION: 'Certificação',
  COURSE: 'Curso',
  WORKSHOP: 'Workshop',
  SPECIALIZATION: 'Especialização',
};

export const About = () => {
  const { metrics, content, specialties, educationItems, isLoading } = useCompanyConfig();

  if (isLoading) {
    return (
      <section id="sobre" className="py-20 bg-cinza-claro">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Carregando...</div>
        </div>
      </section>
    );
  }

  // Se não há dados, não renderizar a seção
  if (!content) {
    return null;
  }

  return (
    <section id="sobre" className="py-20 bg-cinza-claro">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={content.trainer_image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                alt="Personal Trainer"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Info cards moved outside the image */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-6 w-6 text-verde-energia" />
                  <div>
                    <div className="font-bold text-grafite">CREF {content.trainer_cref_display}</div>
                    <div className="text-sm text-gray-600">Certificado</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-verde-energia" />
                  <div>
                    <div className="font-bold text-grafite">{metrics?.students_count || 0}+ Alunos</div>
                    <div className="text-sm text-gray-600">Transformados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-grafite mb-6">
                Conheça Seu
                <span className="block text-vermelho-ativo">
                  Personal Trainer
                </span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {content.about_history}
              </p>
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-grafite">Especialidades</h3>
                <div className="space-y-3 md:space-y-0 md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {specialties.map((specialty) => (
                    <div key={specialty.id} className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-verde-energia flex-shrink-0" />
                      <span className="text-gray-700">{specialty.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educationItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-grafite">Formação</h3>
                <div className="space-y-3">
                  {educationItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-verde-energia rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-grafite">{item.course} - {item.institution}</div>
                        <div className="text-sm text-gray-600">
                          {typeLabels[item.type]} {item.year && `• ${item.year}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats */}
            {metrics && (
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-300">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-verde-energia mx-auto mb-2" />
                  <div className="text-2xl font-bold text-grafite">{metrics.experience_years}+</div>
                  <div className="text-sm text-gray-600">Anos de Experiência</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-verde-energia mx-auto mb-2" />
                  <div className="text-2xl font-bold text-grafite">{metrics.certifications_count}+</div>
                  <div className="text-sm text-gray-600">Certificações</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
