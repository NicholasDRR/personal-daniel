
import { GalleryManager } from "../GalleryManager";

export const GallerySectionManager = () => {
  return (
    <div className="space-y-6">
      <div className="bg-teal-50 p-4 rounded-lg">
        <h3 className="font-semibold text-teal-900 mb-2">🖼️ Galeria de Imagens</h3>
        <p className="text-teal-800 text-sm">
          Organize suas imagens em categorias para mostrar transformações, seu espaço de trabalho, certificados e mais.
        </p>
      </div>
      <div className="min-h-[400px]">
        <GalleryManager />
      </div>
    </div>
  );
};
