
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, AlertTriangle } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface SubscriptionBlockerProps {
  children: React.ReactNode;
  showBlocked?: boolean;
  message?: string;
  onPaymentClick?: () => void;
}

export const SubscriptionBlocker = ({ 
  children, 
  showBlocked = true,
  message = "Sua assinatura expirou. Renove para continuar acessando.",
  onPaymentClick
}: SubscriptionBlockerProps) => {
  const { isSubscribed, isLoading, checkSubscription } = useSubscriptionContext();

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando status da assinatura...</p>
        </div>
      </div>
    );
  }

  if (!isSubscribed && showBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Acesso Bloqueado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">{message}</p>
            </div>
            
            <p className="text-gray-600">
              Para continuar usando nossos serviços, é necessário manter sua assinatura ativa.
            </p>
            
            {onPaymentClick && (
              <Button 
                onClick={onPaymentClick}
                className="w-full flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Renovar Assinatura
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={checkSubscription}
              className="w-full"
            >
              Verificar Status
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
