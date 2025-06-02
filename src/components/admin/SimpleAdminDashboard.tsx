
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, CreditCard, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentsSectionManager } from "./sections/PaymentsSectionManager";

interface SimpleAdminDashboardProps {
  onLogout: () => void;
}

export const SimpleAdminDashboard = ({ onLogout }: SimpleAdminDashboardProps) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkSubscription = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setIsSubscribed(data?.subscribed || false);
      
      toast({
        title: "Status verificado",
        description: data?.subscribed ? "Assinatura ativa" : "Assinatura inativa",
      });
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status da assinatura",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const createCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão de pagamento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  Painel Admin
                </h1>
                <p className="text-gray-600 text-sm">
                  Gerencie sua assinatura
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Status da Assinatura */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status da Assinatura
              {isSubscribed === true && <CheckCircle className="h-5 w-5 text-green-600" />}
              {isSubscribed === false && <XCircle className="h-5 w-5 text-red-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isSubscribed ? 'text-green-600' : 'text-red-600'}`}>
                  {isSubscribed === null ? 'Verificando...' : 
                   isSubscribed ? 'Ativo' : 'Inativo'}
                </p>
                <p className="text-sm text-gray-600">
                  {isSubscribed ? 
                    'Sua assinatura está ativa e todas as funcionalidades estão disponíveis' : 
                    'Sua assinatura está inativa. Renove para acessar todas as funcionalidades'}
                </p>
              </div>
              <Button
                onClick={checkSubscription}
                disabled={isChecking}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Atualizar Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Pagamentos */}
        <Card>
          <CardContent className="p-6">
            <PaymentsSectionManager />
          </CardContent>
        </Card>

        {/* Botão de Pagamento se não estiver ativo */}
        {isSubscribed === false && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-red-800 mb-2">Renovar Assinatura</h3>
              <p className="text-red-700 text-sm mb-4">
                Renove sua assinatura para acessar todas as funcionalidades
              </p>
              <Button onClick={createCheckout} className="bg-red-600 hover:bg-red-700">
                Renovar Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
