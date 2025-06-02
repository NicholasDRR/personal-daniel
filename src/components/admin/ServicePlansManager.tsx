import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  highlight: boolean;
  active: boolean;
  order_index: number;
}

export const ServicePlansManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      // Get company_id from current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error('Usuário não autenticado');

      const { data: companyData, error: companyError } = await supabase
        .from('authorized_emails')
        .select('company_id')
        .eq('email', userData.user.email)
        .single();

      if (companyError || !companyData) throw new Error('Company ID não encontrado');

      const { data, error } = await supabase
        .from('service_plans')
        .select('*')
        .eq('company_id', companyData.company_id)
        .order('order_index');

      if (error) throw error;
      
      // Convert Json to string[] for features and ensure proper typing
      const formattedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? (plan.features as string[])
          : []
      })) as ServicePlan[];
      
      setPlans(formattedPlans);
    } catch (error: any) {
      console.error('Error loading plans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos de serviço.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPlan = () => {
    const newPlan: ServicePlan = {
      id: '',
      name: '',
      description: '',
      price: 0,
      features: [''],
      highlight: false,
      active: true,
      order_index: plans.length + 1,
    };
    setEditingPlan(newPlan);
    setIsCreating(true);
  };

  const savePlan = async (plan: ServicePlan) => {
    try {
      // Get company_id from current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error('Usuário não autenticado');

      const { data: companyData, error: companyError } = await supabase
        .from('authorized_emails')
        .select('company_id')
        .eq('email', userData.user.email)
        .single();

      if (companyError || !companyData) throw new Error('Company ID não encontrado');

      if (isCreating) {
        const { error } = await supabase
          .from('service_plans')
          .insert({
            company_id: companyData.company_id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            features: plan.features.filter(f => f.trim()),
            highlight: plan.highlight,
            active: plan.active,
            order_index: plan.order_index,
          });

        if (error) throw error;
        
        toast({
          title: "Plano criado!",
          description: "Novo plano de serviço foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('service_plans')
          .update({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            features: plan.features.filter(f => f.trim()),
            highlight: plan.highlight,
            active: plan.active,
            order_index: plan.order_index,
          })
          .eq('id', plan.id);

        if (error) throw error;

        toast({
          title: "Plano atualizado!",
          description: "Plano de serviço foi atualizado com sucesso.",
        });
      }

      setEditingPlan(null);
      setIsCreating(false);
      loadPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano.",
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('service_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Plano excluído!",
        description: "Plano de serviço foi excluído com sucesso.",
      });

      loadPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano.",
        variant: "destructive",
      });
    }
  };

  const updateEditingPlan = (field: keyof ServicePlan, value: any) => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, [field]: value });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = value;
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    const newFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({
      ...editingPlan,
      features: newFeatures
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vermelho-ativo"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-preto-grafite">Planos de Serviço</h2>
        <Button
          onClick={createNewPlan}
          className="bg-vermelho-ativo hover:bg-vermelho-ativo/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {editingPlan && (
        <Card className="border-2 border-vermelho-ativo">
          <CardHeader>
            <CardTitle className="text-preto-grafite">
              {isCreating ? 'Criar Novo Plano' : 'Editar Plano'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Nome do Plano
                </label>
                <Input
                  value={editingPlan.name}
                  onChange={(e) => updateEditingPlan('name', e.target.value)}
                  placeholder="Plano Premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingPlan.price}
                  onChange={(e) => updateEditingPlan('price', parseFloat(e.target.value) || 0)}
                  placeholder="299.99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Descrição
              </label>
              <Textarea
                value={editingPlan.description}
                onChange={(e) => updateEditingPlan('description', e.target.value)}
                placeholder="Descrição do plano..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Características
              </label>
              <div className="space-y-2">
                {editingPlan.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Digite uma característica..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Característica
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="highlight"
                  checked={editingPlan.highlight}
                  onCheckedChange={(checked) => updateEditingPlan('highlight', checked)}
                />
                <label htmlFor="highlight" className="text-sm">Destacar plano</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={editingPlan.active}
                  onCheckedChange={(checked) => updateEditingPlan('active', checked)}
                />
                <label htmlFor="active" className="text-sm">Ativo</label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => savePlan(editingPlan)}
                className="bg-verde-energia hover:bg-verde-energia/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreating(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.highlight ? 'ring-2 ring-vermelho-ativo' : ''}`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-vermelho-ativo text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Destaque
                </div>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-preto-grafite flex justify-between items-start">
                <div>
                  <h3 className="text-xl">{plan.name}</h3>
                  <p className="text-2xl font-bold text-vermelho-ativo">
                    R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-verde-energia rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
              {!plan.active && (
                <div className="mt-4 text-center">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Inativo
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
