
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  subscription: any;
  checkSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { subscription, isLoading, checkSubscription } = useSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(subscription?.subscribed || false);
  }, [subscription]);

  // Verificar status quando o usuário faz login/logout
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkSubscription();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Escutar mudanças na tabela subscribers em tempo real
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) return;

      const subscription = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'subscribers',
            filter: `email=eq.${user.email}`
          },
          (payload) => {
            console.log('Subscription updated:', payload);
            // Aguardar um pouco e verificar novamente para garantir que os dados estão atualizados
            setTimeout(() => {
              checkSubscription();
            }, 1000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    setupRealtimeSubscription();
  }, [checkSubscription]);

  const value = {
    isSubscribed,
    isLoading,
    subscription,
    checkSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
