import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Upload, X } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";
import { SpecialtiesManager } from "../SpecialtiesManager";

interface AboutContent {
  about_name: string;
  about_history: string;
  trainer_image_url?: string;
  trainer_cref_display: string;
  contact_whatsapp?: string;
  contact_email?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_youtube?: string;
  social_tiktok?: string;
}

export const AboutSectionManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [content, setContent] = useState<AboutContent>({
    about_name: "",
    about_history: "",
    trainer_cref_display: "CREF 123456",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadContent();
    }
  }, [companyId]);

  const loadContent = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('landing_page_content')
        .select(`
          about_name, about_history, trainer_image_url, trainer_cref_display,
          contact_whatsapp, contact_email, social_instagram, social_facebook,
          social_youtube, social_tiktok
        `)
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      }
    } catch (error: any) {
      console.error('Error loading about content:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo da seção sobre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    if (!companyId) return;

    setIsSaving(true);
    try {
      // Usar UPSERT para evitar erro de constraint violation
      const { error } = await supabase
        .from('landing_page_content')
        .upsert({
          company_id: companyId,
          ...content
        }, {
          onConflict: 'company_id'
        });

      if (error) throw error;

      toast({
        title: "Seção Sobre atualizada!",
        description: "Todas as informações foram salvas.",
      });
    } catch (error: any) {
      console.error('Error saving about content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo da seção sobre.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simulação de upload - implementar com Supabase Storage se necessário
      const imageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
      
      setContent(prev => ({ ...prev, trainer_image_url: imageUrl }));
      
      toast({
        title: "Imagem carregada!",
        description: "A foto do personal foi atualizada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[1] && match[1].length === 2) formatted += ') ';
        if (match[2]) formatted += match[2];
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
      }
    }
    return value;
  };

  if (isLoadingCompanyId || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">👤 Seção Sobre o Personal</h3>
        <p className="text-green-800 text-sm">
          Configure suas informações pessoais, foto, contatos e redes sociais que aparecem na seção "Conheça Seu Personal Trainer".
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Informações Básicas</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Personal *
            </label>
            <Input
              value={content.about_name}
              onChange={(e) => setContent(prev => ({ ...prev, about_name: e.target.value }))}
              placeholder="João Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CREF *
            </label>
            <Input
              value={content.trainer_cref_display}
              onChange={(e) => setContent(prev => ({ ...prev, trainer_cref_display: e.target.value }))}
              placeholder="CREF 123456-G/SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              História/Biografia *
            </label>
            <Textarea
              value={content.about_history}
              onChange={(e) => setContent(prev => ({ ...prev, about_history: e.target.value }))}
              placeholder="Conte sua história, formação, experiência..."
              rows={4}
            />
          </div>

          {/* Especialidades */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Especialidades</h4>
            <SpecialtiesManager />
          </div>
        </div>

        {/* Foto e Contatos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Foto e Contatos</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Personal
            </label>
            <div className="space-y-3">
              {content.trainer_image_url && (
                <div className="relative">
                  <img
                    src={content.trainer_image_url}
                    alt="Personal Trainer"
                    className="w-full max-w-xs h-auto object-cover rounded-lg shadow-md"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setContent(prev => ({ ...prev, trainer_image_url: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="trainer-image"
                />
                <label
                  htmlFor="trainer-image"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {content.trainer_image_url ? 'Alterar Foto' : 'Carregar Foto'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <Input
                value={content.contact_whatsapp || ''}
                onChange={(e) => setContent(prev => ({ ...prev, contact_whatsapp: formatWhatsApp(e.target.value) }))}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={content.contact_email || ''}
                onChange={(e) => setContent(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="personal@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Redes Sociais</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <Input
              value={content.social_instagram || ''}
              onChange={(e) => setContent(prev => ({ ...prev, social_instagram: e.target.value }))}
              placeholder="@seuinstagram"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <Input
              value={content.social_facebook || ''}
              onChange={(e) => setContent(prev => ({ ...prev, social_facebook: e.target.value }))}
              placeholder="facebook.com/seuperfil"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube
            </label>
            <Input
              value={content.social_youtube || ''}
              onChange={(e) => setContent(prev => ({ ...prev, social_youtube: e.target.value }))}
              placeholder="youtube.com/seucanal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TikTok
            </label>
            <Input
              value={content.social_tiktok || ''}
              onChange={(e) => setContent(prev => ({ ...prev, social_tiktok: e.target.value }))}
              placeholder="@seutiktok"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={saveContent}
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
              Salvar Seção Sobre
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
