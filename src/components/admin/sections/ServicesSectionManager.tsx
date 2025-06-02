
import { ServicePlansManager } from "../ServicePlansManager";

export const ServicesSectionManager = () => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-900 mb-2">💼 Planos de Serviço</h3>
        <p className="text-indigo-800 text-sm">
          Configure os planos de treino que você oferece, preços e características de cada modalidade.
        </p>
      </div>
      <div className="min-h-[400px]">
        <ServicePlansManager />
      </div>
    </div>
  );
};
