
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";

interface Metrics {
  id: string;
  students_count: number;
  success_rate: number;
  experience_years: number;
  average_rating: number;
  certifications_count: number;
}

export const MetricsManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadMetrics();
    }
  }, [companyId]);

  const loadMetrics = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMetrics(data);
      } else {
        // Criar métricas padrão se não existir
        const { data: newMetrics, error: createError } = await supabase
          .from('metrics')
          .insert({
            company_id: companyId,
            students_count: 500,
            success_rate: 95,
            experience_years: 8,
            average_rating: 4.9,
            certifications_count: 15
          })
          .select()
          .single();

        if (createError) throw createError;
        setMetrics(newMetrics);
      }
    } catch (error: any) {
      console.error('Error loading metrics:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar métricas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!metrics) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('metrics')
        .update({
          students_count: metrics.students_count,
          success_rate: metrics.success_rate,
          experience_years: metrics.experience_years,
          average_rating: metrics.average_rating,
          certifications_count: metrics.certifications_count,
        })
        .eq('id', metrics.id);

      if (error) throw error;

      toast({
        title: "Métricas salvas!",
        description: "As métricas foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving metrics:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar métricas.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof Metrics, value: number) => {
    if (!metrics) return;
    setMetrics({ ...metrics, [field]: value });
  };

  if (isLoadingCompanyId || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Erro ao carregar empresa.</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Erro ao carregar métricas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-preto-grafite mb-2">
            Número de Alunos Transformados
          </label>
          <Input
            type="number"
            value={metrics.students_count}
            onChange={(e) => updateField('students_count', parseInt(e.target.value) || 0)}
            placeholder="500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Aparece nas seções Hero, About e Metrics
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-preto-grafite mb-2">
            Taxa de Sucesso (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={metrics.success_rate}
            onChange={(e) => updateField('success_rate', parseInt(e.target.value) || 0)}
            placeholder="95"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-preto-grafite mb-2">
            Anos de Experiência
          </label>
          <Input
            type="number"
            value={metrics.experience_years}
            onChange={(e) => updateField('experience_years', parseInt(e.target.value) || 0)}
            placeholder="8"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-preto-grafite mb-2">
            Nota Média (1-5)
          </label>
          <Input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={metrics.average_rating}
            onChange={(e) => updateField('average_rating', parseFloat(e.target.value) || 0)}
            placeholder="4.9"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-preto-grafite mb-2">
            Número de Certificações
          </label>
          <Input
            type="number"
            value={metrics.certifications_count}
            onChange={(e) => updateField('certifications_count', parseInt(e.target.value) || 0)}
            placeholder="15"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Onde essas métricas aparecem:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>Seção Hero:</strong> Alunos, Taxa de Sucesso, Anos de Experiência</li>
          <li>• <strong>Seção About:</strong> Número de Alunos na foto do personal</li>
          <li>• <strong>Seção Metrics:</strong> Todas as métricas são exibidas</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-vermelho-ativo hover:bg-vermelho-ativo/90 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Métricas
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
