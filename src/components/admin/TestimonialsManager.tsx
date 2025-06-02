import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TestimonialPhotoUpload } from "./testimonials/TestimonialPhotoUpload";

interface Testimonial {
  id: string;
  client_name: string;
  testimonial_text: string;
  rating: number;
  result_achieved: string;
  client_photo_url?: string;
  active: boolean;
  order_index: number;
}

export const TestimonialsManager = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
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
        .from('testimonials')
        .select('*')
        .eq('company_id', companyData.company_id)
        .order('order_index');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      console.error('Error loading testimonials:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar depoimentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: '',
      client_name: '',
      testimonial_text: '',
      rating: 5,
      result_achieved: '',
      client_photo_url: '',
      active: true,
      order_index: testimonials.length + 1,
    };
    setEditingTestimonial(newTestimonial);
    setIsCreating(true);
  };

  const saveTestimonial = async (testimonial: Testimonial) => {
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
          .from('testimonials')
          .insert({
            company_id: companyData.company_id,
            client_name: testimonial.client_name,
            testimonial_text: testimonial.testimonial_text,
            rating: testimonial.rating,
            result_achieved: testimonial.result_achieved,
            client_photo_url: testimonial.client_photo_url || null,
            active: testimonial.active,
            order_index: testimonial.order_index,
          });

        if (error) throw error;
        
        toast({
          title: "Depoimento criado!",
          description: "Novo depoimento foi criado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .update({
            client_name: testimonial.client_name,
            testimonial_text: testimonial.testimonial_text,
            rating: testimonial.rating,
            result_achieved: testimonial.result_achieved,
            client_photo_url: testimonial.client_photo_url || null,
            active: testimonial.active,
            order_index: testimonial.order_index,
          })
          .eq('id', testimonial.id);

        if (error) throw error;

        toast({
          title: "Depoimento atualizado!",
          description: "Depoimento foi atualizado com sucesso.",
        });
      }

      setEditingTestimonial(null);
      setIsCreating(false);
      loadTestimonials();
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar depoimento.",
        variant: "destructive",
      });
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) throw error;

      toast({
        title: "Depoimento excluído!",
        description: "Depoimento foi excluído com sucesso.",
      });

      loadTestimonials();
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir depoimento.",
        variant: "destructive",
      });
    }
  };

  const updateEditingTestimonial = (field: keyof Testimonial, value: any) => {
    if (!editingTestimonial) return;
    setEditingTestimonial({ ...editingTestimonial, [field]: value });
  };

  // Função para gerar avatar com iniciais
  const generateAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name.length % colors.length;
    
    return { initials, colorClass: colors[colorIndex] };
  };

  const renderClientAvatar = (testimonial: Testimonial) => {
    if (testimonial.client_photo_url) {
      return (
        <img
          src={testimonial.client_photo_url}
          alt={testimonial.client_name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }

    if (testimonial.client_name) {
      const avatar = generateAvatar(testimonial.client_name);
      return (
        <div className={`w-12 h-12 rounded-full ${avatar.colorClass} flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200`}>
          {avatar.initials}
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-gray-200">
        ?
      </div>
    );
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
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
        <h2 className="text-2xl font-bold text-preto-grafite">Depoimentos</h2>
        <Button
          onClick={createNewTestimonial}
          className="bg-vermelho-ativo hover:bg-vermelho-ativo/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Depoimento
        </Button>
      </div>

      {editingTestimonial && (
        <Card className="border-2 border-vermelho-ativo">
          <CardHeader>
            <CardTitle className="text-preto-grafite">
              {isCreating ? 'Criar Novo Depoimento' : 'Editar Depoimento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Nome do Cliente
                </label>
                <Input
                  value={editingTestimonial.client_name}
                  onChange={(e) => updateEditingTestimonial('client_name', e.target.value)}
                  placeholder="Maria Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-preto-grafite mb-2">
                  Resultado Alcançado
                </label>
                <Input
                  value={editingTestimonial.result_achieved}
                  onChange={(e) => updateEditingTestimonial('result_achieved', e.target.value)}
                  placeholder="Perda de 15kg"
                />
              </div>
            </div>

            <TestimonialPhotoUpload
              currentPhotoUrl={editingTestimonial.client_photo_url}
              onPhotoChange={(photoUrl) => updateEditingTestimonial('client_photo_url', photoUrl)}
              clientName={editingTestimonial.client_name}
            />

            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Depoimento
              </label>
              <Textarea
                value={editingTestimonial.testimonial_text}
                onChange={(e) => updateEditingTestimonial('testimonial_text', e.target.value)}
                placeholder="Escreva o depoimento aqui..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Avaliação
              </label>
              {renderStars(editingTestimonial.rating, true, (rating) => updateEditingTestimonial('rating', rating))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={editingTestimonial.active}
                onCheckedChange={(checked) => updateEditingTestimonial('active', checked)}
              />
              <label htmlFor="active" className="text-sm">Ativo</label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => saveTestimonial(editingTestimonial)}
                className="bg-verde-energia hover:bg-verde-energia/90 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTestimonial(null);
                  setIsCreating(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-preto-grafite">
                    {testimonial.client_name}
                  </CardTitle>
                  {renderStars(testimonial.rating)}
                  {testimonial.result_achieved && (
                    <p className="text-sm text-verde-energia font-medium mt-1">
                      {testimonial.result_achieved}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingTestimonial(testimonial)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteTestimonial(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                {renderClientAvatar(testimonial)}
                <div>
                  <h4 className="font-semibold text-preto-grafite">
                    {testimonial.client_name}
                  </h4>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.testimonial_text}"</p>
              {!testimonial.active && (
                <div className="text-center">
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
