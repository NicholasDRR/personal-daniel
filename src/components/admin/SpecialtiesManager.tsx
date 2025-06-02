
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";

interface Specialty {
  id: string;
  name: string;
  order_index: number;
}

export const SpecialtiesManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  useEffect(() => {
    if (companyId) {
      loadSpecialties();
    }
  }, [companyId]);

  const loadSpecialties = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('company_id', companyId)
        .order('order_index');

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error: any) {
      console.error('Error loading specialties:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar especialidades.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = async () => {
    if (!newSpecialty.trim() || !companyId) return;

    try {
      const maxOrder = Math.max(...specialties.map(s => s.order_index), 0);
      
      const { data, error } = await supabase
        .from('specialties')
        .insert({
          company_id: companyId,
          name: newSpecialty.trim(),
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      setSpecialties([...specialties, data]);
      setNewSpecialty("");

      toast({
        title: "Especialidade adicionada!",
        description: "Nova especialidade foi criada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error adding specialty:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar especialidade.",
        variant: "destructive",
      });
    }
  };

  const updateSpecialty = (id: string, field: keyof Specialty, value: string | number) => {
    setSpecialties(specialties.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const deleteSpecialty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('specialties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSpecialties(specialties.filter(s => s.id !== id));

      toast({
        title: "Especialidade removida!",
        description: "A especialidade foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting specialty:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover especialidade.",
        variant: "destructive",
      });
    }
  };

  const saveSpecialties = async () => {
    setIsSaving(true);
    try {
      const updates = specialties.map(specialty => ({
        id: specialty.id,
        name: specialty.name,
        order_index: specialty.order_index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('specialties')
          .update({ name: update.name, order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Especialidades salvas!",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving specialties:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar especialidades.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const moveSpecialty = (fromIndex: number, toIndex: number) => {
    const newSpecialties = [...specialties];
    const [movedItem] = newSpecialties.splice(fromIndex, 1);
    newSpecialties.splice(toIndex, 0, movedItem);
    
    // Reordenar índices
    const reordered = newSpecialties.map((item, index) => ({
      ...item,
      order_index: index + 1
    }));
    
    setSpecialties(reordered);
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

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">✨ Sobre as Especialidades</h3>
        <p className="text-blue-800 text-sm">
          As especialidades aparecem na seção "Conheça Seu Personal Trainer" da landing page. 
          Você pode adicionar quantas especialidades quiser e elas aparecerão dinamicamente na página.
        </p>
      </div>

      {/* Adicionar nova especialidade */}
      <div className="flex gap-2">
        <Input
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          placeholder="Digite uma nova especialidade"
          onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
        />
        <Button onClick={addSpecialty} disabled={!newSpecialty.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Lista de especialidades */}
      <div className="space-y-3">
        {specialties.map((specialty, index) => (
          <div key={specialty.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
            <div className="flex items-center gap-2 cursor-move">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 min-w-[2rem]">
                {index + 1}
              </span>
            </div>
            
            <Input
              value={specialty.name}
              onChange={(e) => updateSpecialty(specialty.id, 'name', e.target.value)}
              className="flex-1"
            />
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveSpecialty(index, Math.max(0, index - 1))}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveSpecialty(index, Math.min(specialties.length - 1, index + 1))}
                disabled={index === specialties.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteSpecialty(specialty.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {specialties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma especialidade cadastrada.</p>
          <p className="text-sm">Adicione sua primeira especialidade acima.</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={saveSpecialties}
          disabled={isSaving || specialties.length === 0}
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
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
