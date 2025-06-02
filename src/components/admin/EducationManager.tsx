import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EducationItem {
  id: string;
  institution: string;
  course: string;
  year: number | null;
  type: 'GRADUATION' | 'CERTIFICATION' | 'COURSE' | 'WORKSHOP' | 'SPECIALIZATION';
  order_index: number;
}

const typeLabels = {
  GRADUATION: 'Graduação',
  CERTIFICATION: 'Certificação',
  COURSE: 'Curso',
  WORKSHOP: 'Workshop',
  SPECIALIZATION: 'Especialização',
};

const typeColors = {
  GRADUATION: 'bg-blue-100 text-blue-800',
  CERTIFICATION: 'bg-green-100 text-green-800',
  COURSE: 'bg-purple-100 text-purple-800',
  WORKSHOP: 'bg-orange-100 text-orange-800',
  SPECIALIZATION: 'bg-red-100 text-red-800',
};

export const EducationManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<EducationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadEducationItems();
  }, []);

  const loadEducationItems = async () => {
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
        .from('education_items')
        .select('*')
        .eq('company_id', companyData.company_id)
        .order('order_index');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading education items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens de educação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewItem = () => {
    const newItem: EducationItem = {
      id: '',
      institution: '',
      course: '',
      year: null,
      type: 'COURSE',
      order_index: items.length + 1,
    };
    setEditingItem(newItem);
    setIsCreating(true);
  };

  const saveItem = async (item: EducationItem) => {
    try {
      // Obter company_id do usuário atual
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
          .from('education_items')
          .insert({
            company_id: companyData.company_id,
            institution: item.institution,
            course: item.course,
            year: item.year,
            type: item.type,
            order_index: item.order_index,
          });

        if (error) throw error;
        
        toast({
          title: "Item criado!",
          description: "Novo item de educação foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('education_items')
          .update({
            institution: item.institution,
            course: item.course,
            year: item.year,
            type: item.type,
            order_index: item.order_index,
          })
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: "Item atualizado!",
          description: "Item de educação foi atualizado com sucesso.",
        });
      }

      setEditingItem(null);
      setIsCreating(false);
      loadEducationItems();
    } catch (error: any) {
      console.error('Error saving education item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('education_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item excluído!",
        description: "Item de educação foi excluído com sucesso.",
      });

      loadEducationItems();
    } catch (error: any) {
      console.error('Error deleting education item:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir item.",
        variant: "destructive",
      });
    }
  };

  const updateEditingItem = (field: keyof EducationItem, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
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
        <h2 className="text-2xl font-bold text-preto-grafite">Educação e Certificações</h2>
        <Button
          onClick={createNewItem}
          className="bg-vermelho-ativo hover:bg-vermelho-ativo/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {editingItem && (
        <Card className="border-2 border-vermelho-ativo">
          <CardHeader>
            <CardTitle className="text-preto-grafite">
              {isCreating ? 'Criar Novo Item' : 'Editar Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Instituição
                </label>
                <Input
                  value={editingItem.institution}
                  onChange={(e) => updateEditingItem('institution', e.target.value)}
                  placeholder="Universidade Federal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Curso/Certificação
                </label>
                <Input
                  value={editingItem.course}
                  onChange={(e) => updateEditingItem('course', e.target.value)}
                  placeholder="Educação Física"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Tipo
                </label>
                <Select
                  value={editingItem.type}
                  onValueChange={(value) => updateEditingItem('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRADUATION">Graduação</SelectItem>
                    <SelectItem value="CERTIFICATION">Certificação</SelectItem>
                    <SelectItem value="COURSE">Curso</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="SPECIALIZATION">Especialização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Ano
                </label>
                <Input
                  type="number"
                  value={editingItem.year || ''}
                  onChange={(e) => updateEditingItem('year', parseInt(e.target.value) || null)}
                  placeholder="2023"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => saveItem(editingItem)}
                className="bg-verde-energia hover:bg-verde-energia/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
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
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-preto-grafite" />
                    <span className={`text-xs px-2 py-1 rounded ${typeColors[item.type]}`}>
                      {typeLabels[item.type]}
                    </span>
                    {item.year && (
                      <span className="text-sm text-gray-500">{item.year}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg text-preto-grafite">
                    {item.course}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{item.institution}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
