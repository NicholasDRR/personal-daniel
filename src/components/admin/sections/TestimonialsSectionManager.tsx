
import { TestimonialsManager } from "../TestimonialsManager";

export const TestimonialsSectionManager = () => {
  return (
    <div className="space-y-6">
      <div className="bg-pink-50 p-4 rounded-lg">
        <h3 className="font-semibold text-pink-900 mb-2">💬 Depoimentos de Clientes</h3>
        <p className="text-pink-800 text-sm">
          Adicione depoimentos dos seus clientes com fotos para transmitir confiança e mostrar seus resultados.
        </p>
      </div>
      <div className="min-h-[400px]">
        <TestimonialsManager />
      </div>
    </div>
  );
};
