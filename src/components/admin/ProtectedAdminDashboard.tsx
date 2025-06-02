
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { AdminDashboard } from './AdminDashboard';
import { PaymentOnlyDashboard } from './PaymentOnlyDashboard';
import { useEffect } from 'react';

interface ProtectedAdminDashboardProps {
  onLogout: () => void;
}

export const ProtectedAdminDashboard = ({ onLogout }: ProtectedAdminDashboardProps) => {
  const { isSubscribed, isLoading, checkSubscription } = useSubscriptionContext();

  // Verificar assinatura periodicamente para detectar mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscription();
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(interval);
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

  // Se não tem assinatura, mostra apenas a tela de pagamentos
  if (!isSubscribed) {
    return <PaymentOnlyDashboard onLogout={onLogout} />;
  }

  // Se tem assinatura, mostra o dashboard completo
  return <AdminDashboard onLogout={onLogout} />;
};
