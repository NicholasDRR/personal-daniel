
import { MetricsManager } from "../MetricsManager";

export const MetricsSectionManager = () => {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-900 mb-2">📊 Métricas e Estatísticas</h3>
        <p className="text-orange-800 text-sm">
          Configure as estatísticas que aparecem nas seções Hero, About e Metrics da sua landing page.
          Exemplos: Número de alunos transformados, anos de experiência, taxa de sucesso, etc.
        </p>
      </div>
      <div className="min-h-[400px]">
        <MetricsManager />
      </div>
    </div>
  );
};
