
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X } from "lucide-react";

interface GalleryImage {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
}

interface ImageEditFormProps {
  image: GalleryImage;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ImageEditForm = ({ image, onSuccess, onCancel }: ImageEditFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: image.title,
    description: image.description || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite um título.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
        })
        .eq('id', image.id);

      if (error) throw error;

      toast({
        title: "Imagem atualizada!",
        description: "As informações da imagem foram atualizadas.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating image:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Editar Imagem</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <img
            src={image.image_url}
            alt={image.title}
            className="w-full h-32 object-cover rounded-lg border"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Título *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite um título para a imagem"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite uma descrição (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
