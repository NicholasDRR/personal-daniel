
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";

export const HeroBackgroundManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadBackgroundUrl();
    }
  }, [companyId]);

  const loadBackgroundUrl = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('hero_background_url')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.hero_background_url) {
        setBackgroundUrl(data.hero_background_url);
      }
    } catch (error: any) {
      console.error('Error loading background:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !companyId) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload para o storage
      const fileName = `hero-bg-${companyId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(`backgrounds/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(`backgrounds/${fileName}`);

      // Usar UPSERT para evitar erro de constraint violation
      const { error: upsertError } = await supabase
        .from('landing_page_content')
        .upsert({
          company_id: companyId,
          hero_background_url: publicUrl
        }, {
          onConflict: 'company_id'
        });

      if (upsertError) throw upsertError;

      setBackgroundUrl(publicUrl);

      toast({
        title: "Background atualizado!",
        description: "A imagem de fundo do Hero foi alterada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error uploading background:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackground = async () => {
    if (!companyId) return;

    try {
      const { error } = await supabase
        .from('landing_page_content')
        .upsert({
          company_id: companyId,
          hero_background_url: null
        }, {
          onConflict: 'company_id'
        });

      if (error) throw error;

      setBackgroundUrl("");

      toast({
        title: "Background removido!",
        description: "O fundo padrão será usado na seção Hero.",
      });
    } catch (error: any) {
      console.error('Error removing background:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover background.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingCompanyId || isLoading) {
    return (
      <div className="flex items-center justify-center p-4 md:p-8">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Imagem de Fundo do Hero
        </label>
        
        {backgroundUrl && (
          <div className="mb-4">
            <img
              src={backgroundUrl}
              alt="Background do Hero"
              className="w-full max-h-32 md:max-h-40 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="hero-background"
          />
          <label
            htmlFor="hero-background"
            className="inline-flex items-center justify-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm md:text-base"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            <span className="truncate">
              {backgroundUrl ? 'Alterar Background' : 'Adicionar Background'}
            </span>
          </label>
          
          {backgroundUrl && (
            <Button
              variant="outline"
              onClick={removeBackground}
              className="text-red-600 hover:text-red-700 text-sm md:text-base px-3 md:px-4"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="truncate">Usar Padrão</span>
            </Button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Recomendado: 1920x1080px ou maior. Máximo 5MB. Formatos: JPG, PNG, WebP
        </p>
      </div>
    </div>
  );
};
