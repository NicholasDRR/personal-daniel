
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, CreditCard, AlertTriangle } from "lucide-react";
import { PaymentsSectionManager } from "./sections/PaymentsSectionManager";

interface PaymentOnlyDashboardProps {
  onLogout: () => void;
}

export const PaymentOnlyDashboard = ({ onLogout }: PaymentOnlyDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-red-600" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-red-600">
                  Renovar Assinatura
                </h1>
                <p className="text-gray-600 text-sm">
                  Renove sua assinatura para acessar todas as funcionalidades
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

      {/* Aviso de assinatura expirada */}
      <div className="px-4 py-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Assinatura Expirada</h3>
                <p className="text-red-700 text-sm">
                  Sua assinatura expirou. Renove agora para recuperar o acesso completo ao painel admin e manter sua landing page ativa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo de pagamentos */}
      <div className="px-4 py-6 md:px-6 md:py-8">
        <Card className="w-full">
          <CardContent className="p-4 md:p-6">
            <PaymentsSectionManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
