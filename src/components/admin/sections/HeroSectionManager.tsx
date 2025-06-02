
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";
import { HeroBackgroundManager } from "./HeroBackgroundManager";

interface HeroContent {
  hero_highlight_text: string;
  hero_secondary_text: string;
}

export const HeroSectionManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [content, setContent] = useState<HeroContent>({
    hero_highlight_text: "",
    hero_secondary_text: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        .select('hero_highlight_text, hero_secondary_text')
        .eq('company_id', companyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      }
    } catch (error: any) {
      console.error('Error loading hero content:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdo do hero.",
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
        title: "Hero atualizado!",
        description: "O conteúdo da seção hero foi salvo.",
      });
    } catch (error: any) {
      console.error('Error saving hero content:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conteúdo do hero.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Seção Hero</h3>
        <p className="text-blue-800 text-sm">
          Esta é a primeira seção que os visitantes veem. Configure o texto principal, secundário e a imagem de fundo que aparece no banner inicial.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Texto Principal *
          </label>
          <Input
            value={content.hero_highlight_text}
            onChange={(e) => setContent(prev => ({ ...prev, hero_highlight_text: e.target.value }))}
            placeholder="Ex: Transforme Seu Corpo e Vida"
            className="w-full h-12 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Texto Secundário *
          </label>
          <Textarea
            value={content.hero_secondary_text}
            onChange={(e) => setContent(prev => ({ ...prev, hero_secondary_text: e.target.value }))}
            placeholder="Ex: Treinos personalizados, acompanhamento profissional e resultados garantidos..."
            rows={4}
            className="w-full text-base resize-none"
          />
        </div>

        {/* Gerenciamento de Background */}
        <div className="border-t pt-6">
          <HeroBackgroundManager />
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={saveContent}
          disabled={isSaving}
          className="w-full h-12 bg-vermelho-ativo hover:bg-vermelho-ativo/90 text-white text-base font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
