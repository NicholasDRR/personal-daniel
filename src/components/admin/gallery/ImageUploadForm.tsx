
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploadFormProps {
  categoryId: string;
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
  maxOrder: number;
}

export const ImageUploadForm = ({ categoryId, companyId, onSuccess, onCancel, maxOrder }: ImageUploadFormProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma imagem e digite um título.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload para Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Obter URL da imagem
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Salvar no banco
      const { error } = await supabase
        .from('gallery_images')
        .insert({
          company_id: companyId,
          category_id: categoryId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          image_url: urlData.publicUrl,
          order_index: maxOrder + 1
        });

      if (error) throw error;

      toast({
        title: "Imagem adicionada!",
        description: "A imagem foi enviada e adicionada à galeria.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Adicionar Nova Imagem</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Imagem *
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
