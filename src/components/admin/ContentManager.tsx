
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, ImageIcon, Upload } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";

interface LandingPageContent {
  hero_highlight_text: string;
  hero_secondary_text: string;
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

export const ContentManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [content, setContent] = useState<LandingPageContent>({
    hero_highlight_text: "Transforme Seu Corpo e Vida",
    hero_secondary_text: "Treinos personalizados, acompanhamento profissional e resultados garantidos. Sua melhor versão está a um clique de distância.",
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
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo.",
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
      const { error } = await supabase
        .from('landing_page_content')
        .upsert({
          company_id: companyId,
          ...content
        });

      if (error) throw error;

      toast({
        title: "Conteúdo salvo!",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulação de upload - aqui você implementaria o upload real
    setIsUploading(true);
    try {
      // Por enquanto, vamos usar uma URL de exemplo
      const imageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
      
      setContent({ ...content, trainer_image_url: imageUrl });
      
      toast({
        title: "Imagem carregada!",
        description: "A imagem foi carregada com sucesso.",
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
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
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

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsApp(value);
    setContent({ ...content, contact_whatsapp: formatted });
  };

  const updateContent = (field: keyof LandingPageContent, value: string | number) => {
    setContent({ ...content, [field]: value });
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
      {/* Seção Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-preto-grafite">Seção Hero (Principal)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              Texto Principal
            </label>
            <Input
              value={content.hero_highlight_text}
              onChange={(e) => updateContent('hero_highlight_text', e.target.value)}
              placeholder="Transforme Seu Corpo e Vida"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              Texto Secundário
            </label>
            <Textarea
              value={content.hero_secondary_text}
              onChange={(e) => updateContent('hero_secondary_text', e.target.value)}
              placeholder="Treinos personalizados, acompanhamento profissional..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção Sobre */}
      <Card>
        <CardHeader>
          <CardTitle className="text-preto-grafite">Seção Sobre o Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              Nome do Personal
            </label>
            <Input
              value={content.about_name}
              onChange={(e) => updateContent('about_name', e.target.value)}
              placeholder="João Silva"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              CREF (como aparece na página)
            </label>
            <Input
              value={content.trainer_cref_display}
              onChange={(e) => updateContent('trainer_cref_display', e.target.value)}
              placeholder="CREF 123456-G/SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              História/Biografia
            </label>
            <Textarea
              value={content.about_history}
              onChange={(e) => updateContent('about_history', e.target.value)}
              placeholder="Conte sua história, formação, experiência..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-preto-grafite mb-2">
              Foto do Personal Trainer
            </label>
            <div className="space-y-3">
              {content.trainer_image_url && (
                <div className="relative">
                  <img
                    src={content.trainer_image_url}
                    alt="Personal Trainer"
                    className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
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
                {content.trainer_image_url && (
                  <Button
                    variant="outline"
                    onClick={() => updateContent('trainer_image_url', '')}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-preto-grafite">Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                WhatsApp
              </label>
              <Input
                value={content.contact_whatsapp || ''}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite apenas números, a formatação será aplicada automaticamente
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Email
              </label>
              <Input
                type="email"
                value={content.contact_email || ''}
                onChange={(e) => updateContent('contact_email', e.target.value)}
                placeholder="personal@email.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redes Sociais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-preto-grafite">Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Instagram
              </label>
              <Input
                value={content.social_instagram || ''}
                onChange={(e) => updateContent('social_instagram', e.target.value)}
                placeholder="@seuinstagram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                Facebook
              </label>
              <Input
                value={content.social_facebook || ''}
                onChange={(e) => updateContent('social_facebook', e.target.value)}
                placeholder="facebook.com/seuperfil"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                YouTube
              </label>
              <Input
                value={content.social_youtube || ''}
                onChange={(e) => updateContent('social_youtube', e.target.value)}
                placeholder="youtube.com/seucanal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-preto-grafite mb-2">
                TikTok
              </label>
              <Input
                value={content.social_tiktok || ''}
                onChange={(e) => updateContent('social_tiktok', e.target.value)}
                placeholder="@seutiktok"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
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
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
