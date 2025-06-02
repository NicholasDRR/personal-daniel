
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { content, isLoading } = useCompanyConfig();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  // Usar o nome real do banco de dados ou fallback
  const brandName = content?.about_name || "Personal Trainer";

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">{brandName}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('servicos')}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Serviços
              </button>
              <button
                onClick={() => scrollToSection('depoimentos')}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection('galeria')}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Galeria
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Contato
              </button>
            </div>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              onClick={() => scrollToSection('contato')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Começar Agora
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              <button
                onClick={() => scrollToSection('sobre')}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('servicos')}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
              >
                Serviços
              </button>
              <button
                onClick={() => scrollToSection('depoimentos')}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection('galeria')}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
              >
                Galeria
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium w-full text-left"
              >
                Contato
              </button>
              <div className="pt-2">
                <Button
                  onClick={() => scrollToSection('contato')}
                  className="bg-primary hover:bg-primary/90 text-white w-full py-2 rounded-lg font-medium"
                >
                  Começar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
