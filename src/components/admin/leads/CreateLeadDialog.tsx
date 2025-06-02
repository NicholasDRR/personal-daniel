import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/hooks/useSmartToast";
import { useAutoSave } from "@/hooks/useAutoSave";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Check, RefreshCw, X } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

interface CreateLeadDialogProps {
  onLeadCreated: () => void;
}

export const CreateLeadDialog = ({ onLeadCreated }: CreateLeadDialogProps) => {
  const { showToast } = useSmartToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leadType, setLeadType] = useState<'chatbot' | 'contact'>('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    age: '',
    height: '',
    weight: '',
    primary_goal: '',
    experience_level: '',
    workout_preference: '',
    notes: ''
  });

  // Auto-save do formulário
  const { restoreData, clearSavedData, hasSavedData, discardDraft } = useAutoSave({
    data: { formData, leadType },
    key: 'create_lead_form',
    onRestore: (savedData) => {
      setFormData(savedData.formData);
      setLeadType(savedData.leadType);
    },
    enabled: isOpen,
  });

  // Restaurar dados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      restoreData();
    }
  }, [isOpen, restoreData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      age: '',
      height: '',
      weight: '',
      primary_goal: '',
      experience_level: '',
      workout_preference: '',
      notes: ''
    });
    setLeadType('contact');
    clearSavedData(); // Limpar dados salvos
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (leadType === 'contact') {
        const { error } = await supabase
          .from('contact_form_leads')
          .insert({
            company_id: COMPANY_CONFIG.COMPANY_ID,
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            message: formData.message || null,
            status: 'NEW',
            contacted: false,
            notes: formData.notes || null
          });

        if (error) throw error;
      } else {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);
        const bmi = height > 0 && weight > 0 ? weight / (height * height) : null;

        const { error } = await supabase
          .from('chatbot_leads')
          .insert({
            company_id: COMPANY_CONFIG.COMPANY_ID,
            name: formData.name,
            contact_email: formData.email || null,
            contact_whatsapp: formData.phone || null,
            age: parseInt(formData.age) || null,
            height: height || null,
            weight: weight || null,
            bmi: bmi,
            primary_goal: formData.primary_goal || null,
            experience_level: formData.experience_level || null,
            workout_preference: formData.workout_preference || null,
            conversion_status: 'NEW',
            steps_completed: 0,
            total_steps: 8,
            completion_rate: 0,
            current_sports: [],
            notes: formData.notes || null
          });

        if (error) throw error;
      }

      showToast({
        title: "Lead criado!",
        description: "Lead foi criado com sucesso.",
      });

      resetForm();
      setIsOpen(false);
      onLeadCreated();
    } catch (error: any) {
      showToast({
        title: "Erro",
        description: "Erro ao criar lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-vermelho-ativo hover:bg-vermelho-ativo/90">
          <Plus className="h-4 w-4 mr-2" />
          Criar Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Criar Novo Lead</DialogTitle>
            {hasSavedData() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discardDraft}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Descartar rascunho
              </Button>
            )}
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leadType">Tipo de Lead</Label>
            <Select value={leadType} onValueChange={(value: 'chatbot' | 'contact') => setLeadType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Formulário de Contato</SelectItem>
                <SelectItem value="chatbot">Chatbot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            {leadType === 'chatbot' && (
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
            )}
          </div>

          {leadType === 'chatbot' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Altura (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="1.75"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="70"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="primary_goal">Objetivo Principal</Label>
                <Select value={formData.primary_goal} onValueChange={(value) => handleInputChange('primary_goal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="Ganho de massa muscular">Ganho de massa muscular</SelectItem>
                    <SelectItem value="Condicionamento físico">Condicionamento físico</SelectItem>
                    <SelectItem value="Fortalecimento">Fortalecimento</SelectItem>
                    <SelectItem value="Reabilitação">Reabilitação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_level">Nível de Experiência</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nunca pratiquei">Nunca pratiquei</SelectItem>
                      <SelectItem value="Menos de 6 meses">Menos de 6 meses</SelectItem>
                      <SelectItem value="6 meses a 1 ano">6 meses a 1 ano</SelectItem>
                      <SelectItem value="1 a 2 anos">1 a 2 anos</SelectItem>
                      <SelectItem value="Mais de 2 anos">Mais de 2 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workout_preference">Preferência de Treino</Label>
                  <Select value={formData.workout_preference} onValueChange={(value) => handleInputChange('workout_preference', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Onde prefere treinar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academia">Academia</SelectItem>
                      <SelectItem value="Em casa">Em casa</SelectItem>
                      <SelectItem value="Ao ar livre">Ao ar livre</SelectItem>
                      <SelectItem value="Tanto faz">Tanto faz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {leadType === 'contact' && (
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Mensagem do lead..."
                className="min-h-[100px]"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionais sobre o lead..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.name}
              className="bg-verde-energia hover:bg-verde-energia/90"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Criar Lead
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
