import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Home, User, Trophy, GraduationCap, Settings, MessageSquare, Image, Users, BarChart3, Menu, ArrowLeft, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeroSectionManager } from "./sections/HeroSectionManager";
import { AboutSectionManager } from "./sections/AboutSectionManager";
import { MetricsSectionManager } from "./sections/MetricsSectionManager";
import { EducationSectionManager } from "./sections/EducationSectionManager";
import { ServicesSectionManager } from "./sections/ServicesSectionManager";
import { TestimonialsSectionManager } from "./sections/TestimonialsSectionManager";
import { GallerySectionManager } from "./sections/GallerySectionManager";
import { LeadsManager } from "./LeadsManager";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { PaymentsSectionManager } from "./sections/PaymentsSectionManager";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { isSubscribed } = useSubscriptionContext();
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar a última aba do localStorage, ou usar "hero" como padrão
    const savedTab = localStorage.getItem('admin_active_tab');
    // Se não estiver inscrito, força a aba de pagamentos
    if (!isSubscribed) return "payments";
    // Se estiver inscrito, usa a aba salva ou o padrão
    return savedTab || "hero";
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Salvar a aba ativa no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "hero", label: "Hero", icon: Home, requiresSubscription: true },
    { id: "about", label: "Sobre", icon: User, requiresSubscription: true },
    { id: "metrics", label: "Métricas", icon: Trophy, requiresSubscription: true },
    { id: "education", label: "Formação", icon: GraduationCap, requiresSubscription: true },
    { id: "services", label: "Serviços", icon: Settings, requiresSubscription: true },
    { id: "testimonials", label: "Depoimentos", icon: MessageSquare, requiresSubscription: true },
    { id: "gallery", label: "Galeria", icon: Image, requiresSubscription: true },
    { id: "payments", label: "Pagamentos", icon: CreditCard, requiresSubscription: false },
    { id: "leads", label: "Leads", icon: Users, requiresSubscription: true },
    { id: "analytics", label: "Analytics", icon: BarChart3, requiresSubscription: true },
  ];

  // Filtrar as tabs baseado na assinatura
  const availableTabs = tabs.filter(tab => 
    !tab.requiresSubscription || (tab.requiresSubscription && isSubscribed)
  );

  const getCurrentTabLabel = () => {
    return availableTabs.find(tab => tab.id === activeTab)?.label || "Painel Admin";
  };

  const handleTabChange = (tabId: string) => {
    // Se não estiver inscrito, só permite mudar para a aba de pagamentos
    if (!isSubscribed && tabId !== "payments") {
      return;
    }
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    // Se não estiver inscrito, força mostrar apenas a seção de pagamentos
    if (!isSubscribed) {
      return <PaymentsSectionManager />;
    }

    switch (activeTab) {
      case "hero":
        return <HeroSectionManager />;
      case "about":
        return <AboutSectionManager />;
      case "metrics":
        return <MetricsSectionManager />;
      case "education":
        return <EducationSectionManager />;
      case "services":
        return <ServicesSectionManager />;
      case "testimonials":
        return <TestimonialsSectionManager />;
      case "gallery":
        return <GallerySectionManager />;
      case "payments":
        return <PaymentsSectionManager />;
      case "leads":
        return <LeadsManager />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return <HeroSectionManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header fixo */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-10 w-10 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-preto-grafite truncate">
                  {getCurrentTabLabel()}
                </h1>
                {!isMobile && (
                  <p className="text-gray-600 text-sm">
                    Gerencie o conteúdo da sua landing page
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {!isMobile && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu lateral overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-45"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu lateral */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-preto-grafite">Menu Admin</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
            {availableTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`
                  w-full justify-start h-12 text-left
                  ${activeTab === tab.id ? 'bg-vermelho-ativo text-white' : 'hover:bg-gray-100'}
                  ${!isSubscribed && tab.requiresSubscription ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleTabChange(tab.id)}
                disabled={!isSubscribed && tab.requiresSubscription}
              >
                <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {!isSubscribed && tab.requiresSubscription && (
                  <span className="ml-auto text-xs text-red-500">🔒</span>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="px-4 py-6 md:px-6 md:py-8">
        <Card className="w-full">
          <CardContent className="p-4 md:p-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
