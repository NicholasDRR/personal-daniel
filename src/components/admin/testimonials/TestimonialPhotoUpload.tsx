
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, User } from "lucide-react";

interface TestimonialPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  clientName: string;
}

export const TestimonialPhotoUpload = ({ 
  currentPhotoUrl, 
  onPhotoChange, 
  clientName 
}: TestimonialPhotoUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial_${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL da imagem
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      const newPhotoUrl = urlData.publicUrl;
      setPreviewUrl(newPhotoUrl);
      onPhotoChange(newPhotoUrl);

      toast({
        title: "Foto enviada!",
        description: "A foto do cliente foi enviada com sucesso.",
      });

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
  };

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

  const renderPreview = () => {
    if (previewUrl) {
      return (
        <div className="relative">
          <img
            src={previewUrl}
            alt={clientName}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemovePhoto}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (clientName) {
      const avatar = generateAvatar(clientName);
      return (
        <div className={`w-20 h-20 rounded-full ${avatar.colorClass} flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200`}>
          {avatar.initials}
        </div>
      );
    }

    return (
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-gray-300">
        <User className="h-8 w-8" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto do Cliente
      </label>
      
      <div className="flex items-center gap-4">
        {renderPreview()}
        
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="testimonial-photo-upload"
            disabled={isUploading}
          />
          <label htmlFor="testimonial-photo-upload">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Enviando..." : previewUrl ? "Trocar Foto" : "Enviar Foto"}
              </span>
            </Button>
          </label>
          
          <p className="text-xs text-gray-500 mt-1">
            Formatos aceitos: JPG, PNG. Máximo 5MB.
          </p>
        </div>
      </div>
    </div>
  );
};
