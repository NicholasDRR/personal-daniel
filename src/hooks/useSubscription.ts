import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  monthly_value?: number;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  payment_intent_status?: string | null;
  hosted_invoice_url?: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para obter valor mensal mockado
  const getMonthlyValue = (email?: string): number => {
    const clientPlans: Record<string, number> = {
      // Adicione seus clientes aqui:
      // "cliente1@email.com": 200,
      "nicholasreis00@gmail.com": 500,
      
      // Valor padrão
      "default": 250,
    };
    
    return clientPlans[email || ""] || clientPlans["default"];
  };

  const checkSubscription = async () => {
    // ADICIONADO PARA DEBUG INICIAL:
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        return;
      }

      // Verificação especial para o email nicholasreis48@gmail.com
      if (user.email === 'nicholasreis48@gmail.com') {
        const mockSubscriptionData = {
          subscribed: true,
          subscription_tier: 'Premium',
          subscription_end: null,
          monthly_value: getMonthlyValue(user.email),
          stripe_subscription_id: 'mock_subscription_id',
          stripe_subscription_status: 'active',
          payment_intent_status: null,
          hosted_invoice_url: null
        };
        setSubscription(mockSubscriptionData);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      const subscriptionData = {
        ...data,
        monthly_value: getMonthlyValue(user.email)
      };
      
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status da assinatura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão de pagamento",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal do cliente",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    subscription,
    isLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
