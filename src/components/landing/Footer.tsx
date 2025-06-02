
import { Heart, Instagram, Facebook, Youtube } from "lucide-react";
import { useCompanyData } from "@/hooks/useCompanyData";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { content } = useCompanyData();
  
  const brandName = content?.about_name || "PersonalFit";

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
              {brandName}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Transformando vidas através do exercício físico há mais de 8 anos. 
              Sua melhor versão está a um treino de distância.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#sobre" className="text-gray-400 hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#servicos" className="text-gray-400 hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#depoimentos" className="text-gray-400 hover:text-white transition-colors">Depoimentos</a></li>
              <li><a href="#galeria" className="text-gray-400 hover:text-white transition-colors">Galeria</a></li>
              <li><a href="#contato" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li>{content?.contact_whatsapp || "(11) 99999-9999"}</li>
              <li>{content?.contact_email || "joao@personalfit.com"}</li>
              <li>Rua das Fitness, 123<br />São Paulo/SP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {brandName}. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
            Feito com <Heart className="h-4 w-4 mx-1 text-red-500" /> para transformar vidas
          </p>
        </div>
      </div>
    </footer>
  );
};
