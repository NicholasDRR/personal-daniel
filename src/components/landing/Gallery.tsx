
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

export const Gallery = () => {
  const { galleryCategories, galleryImages, isLoading } = useCompanyConfig();
  const [activeFilter, setActiveFilter] = useState("todas");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Usar dados do admin
  const categories = [
    { id: "todas", label: "Todas", count: galleryImages.length },
    ...galleryCategories.map(cat => ({
      id: cat.id,
      label: cat.name,
      count: galleryImages.filter(img => img.category_id === cat.id).length
    }))
  ];

  const images = galleryImages.map(img => ({
    id: img.id,
    src: img.image_url,
    category: img.category_id || "sem-categoria",
    title: img.title,
    description: img.description || ""
  }));

  const filteredImages = activeFilter === "todas" 
    ? images 
    : images.filter(image => image.category === activeFilter);

  if (isLoading) {
    return (
      <section id="galeria" className="py-20 bg-grafite">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vermelho-ativo"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="py-10 md:py-20 bg-grafite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Minha
            <span className="block text-vermelho-ativo">
              Galeria
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Conheça meu trabalho, transformações dos alunos e o espaço onde acontece a magia
          </p>
        </div>

        {/* Filter buttons */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 px-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeFilter === category.id ? "default" : "outline"}
                onClick={() => setActiveFilter(category.id)}
                className={`px-2 sm:px-3 md:px-6 py-2 rounded-full font-medium transition-all text-xs sm:text-sm md:text-sm whitespace-nowrap ${
                  activeFilter === category.id
                    ? "bg-vermelho-ativo text-white shadow-lg hover:bg-red-600"
                    : "bg-white/20 text-white hover:bg-white/30 border-white/30"
                }`}
              >
                <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                <span className="truncate">{category.label}</span>
                <span className="ml-1 md:ml-2 text-xs bg-black/20 text-white px-1 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        )}

        {/* Images grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 text-white">
                    <h3 className="font-semibold text-sm md:text-lg mb-1">{image.title}</h3>
                    <p className="text-xs md:text-sm text-gray-200 line-clamp-2">{image.description}</p>
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-grafite px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                    {categories.find(cat => cat.id === image.category)?.label || "Sem categoria"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-300 text-lg">Nenhuma imagem encontrada nesta categoria.</p>
          </div>
        )}

        {/* Image modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-8 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              <img
                src={selectedImage}
                alt="Galeria"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
