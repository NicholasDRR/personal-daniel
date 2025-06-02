import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Loader2, FolderPlus, Image as ImageIcon, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyId } from "@/hooks/useCompanyId";
import { ImageUploadForm } from "./gallery/ImageUploadForm";
import { ImageEditForm } from "./gallery/ImageEditForm";

interface Category {
  id: string;
  name: string;
  order_index: number;
}

interface GalleryImage {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
}

export const GalleryManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;

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

      const [categoriesData, imagesData] = await Promise.all([
        supabase.from('gallery_categories')
          .select('*')
          .eq('company_id', companyData.company_id)
          .order('order_index'),
        supabase.from('gallery_images')
          .select('*')
          .eq('company_id', companyData.company_id)
          .order('order_index')
      ]);

      if (categoriesData.error) throw categoriesData.error;
      if (imagesData.error) throw imagesData.error;

      setCategories(categoriesData.data || []);
      setImages(imagesData.data || []);
      
      if (categoriesData.data && categoriesData.data.length > 0) {
        setSelectedCategory(categoriesData.data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading gallery data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da galeria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !companyId) return;

    try {
      const maxOrder = Math.max(...categories.map(c => c.order_index), 0);
      
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert({
          company_id: companyId,
          name: newCategoryName.trim(),
          order_index: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setNewCategoryName("");
      
      if (!selectedCategory) {
        setSelectedCategory(data.id);
      }

      toast({
        title: "Categoria criada!",
        description: "Nova categoria foi adicionada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      // Verificar se há imagens nesta categoria
      const categoryImages = images.filter(img => img.category_id === categoryId);
      
      if (categoryImages.length > 0) {
        toast({
          title: "Categoria não pode ser removida",
          description: "Remova todas as imagens desta categoria primeiro.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('gallery_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryId));
      
      if (selectedCategory === categoryId) {
        setSelectedCategory(categories.find(c => c.id !== categoryId)?.id || "");
      }

      toast({
        title: "Categoria removida!",
        description: "A categoria foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria.",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Remover do banco
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Remover do storage
      const filePath = imageUrl.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('gallery')
          .remove([`gallery/${filePath}`]);
      }

      setImages(images.filter(img => img.id !== imageId));

      toast({
        title: "Imagem removida!",
        description: "A imagem foi removida da galeria.",
      });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover imagem.",
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadData(); // Recarregar dados
  };

  const handleEditSuccess = () => {
    setEditingImage(null);
    loadData(); // Recarregar dados
  };

  if (isLoadingCompanyId || isLoading) {
    return (
      <div className="flex items-center justify-center p-4 md:p-8">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="text-center p-4 md:p-8">
        <p className="text-gray-600">Erro ao carregar empresa.</p>
      </div>
    );
  }

  const filteredImages = images.filter(img => img.category_id === selectedCategory);
  const maxOrder = Math.max(...filteredImages.map(img => img.order_index), 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">🖼️ Sobre a Galeria</h3>
        <p className="text-blue-800 text-xs md:text-sm">
          Organize suas imagens em categorias (Ex: Transformações, Workspace, Certificados). 
          As imagens aparecerão na seção "Minha Galeria" da landing page.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="text-xs md:text-sm">Categorias</TabsTrigger>
          <TabsTrigger value="images" className="text-xs md:text-sm">Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Categorias da Galeria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adicionar categoria */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  className="text-sm md:text-base"
                />
                <Button 
                  onClick={addCategory} 
                  disabled={!newCategoryName.trim()}
                  className="shrink-0 text-sm md:text-base px-3 md:px-4"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Criar Categoria</span>
                  <span className="sm:hidden">Criar</span>
                </Button>
              </div>

              {/* Lista de categorias */}
              <div className="grid gap-2 md:gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{category.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {images.filter(img => img.category_id === category.id).length} imagens
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <FolderPlus className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm md:text-base">Nenhuma categoria criada.</p>
                  <p className="text-xs md:text-sm">Crie sua primeira categoria acima.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Imagens da Galeria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.length > 0 && (
                <>
                  {/* Seletor de categoria e botão adicionar */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm font-medium whitespace-nowrap">Categoria:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded px-2 py-1 text-sm flex-1 min-w-0"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={() => setShowUploadForm(true)}
                      className="shrink-0 text-sm md:text-base px-3 md:px-4"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Adicionar Imagem</span>
                      <span className="sm:hidden">Adicionar</span>
                    </Button>
                  </div>

                  {/* Grid de imagens - Layout responsivo melhorado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="bg-white border rounded-lg overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover"
                        />
                        <div className="p-2 md:p-3">
                          <h3 className="font-medium text-xs md:text-sm mb-1 line-clamp-1">{image.title}</h3>
                          {image.description && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{image.description}</p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingImage(image)}
                              className="flex-1 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteImage(image.id, image.image_url)}
                              className="flex-1 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredImages.length === 0 && selectedCategory && (
                    <div className="text-center py-6 md:py-8 text-gray-500">
                      <ImageIcon className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm md:text-base">Nenhuma imagem nesta categoria.</p>
                      <p className="text-xs md:text-sm">Clique em "Adicionar Imagem" acima.</p>
                    </div>
                  )}
                </>
              )}

              {categories.length === 0 && (
                <div className="text-center py-6 md:py-8 text-gray-500">
                  <FolderPlus className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm md:text-base">Você precisa criar uma categoria primeiro.</p>
                  <p className="text-xs md:text-sm">Acesse a aba "Categorias".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de upload */}
      {showUploadForm && selectedCategory && companyId && (
        <ImageUploadForm
          categoryId={selectedCategory}
          companyId={companyId}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
          maxOrder={maxOrder}
        />
      )}

      {/* Modal de edição */}
      {editingImage && (
        <ImageEditForm
          image={editingImage}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </div>
  );
};
