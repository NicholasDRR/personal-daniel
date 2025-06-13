import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { COMPANY_CONFIG } from '@/config/company';

interface SimpleSubscriptionCheckProps {
  children: React.ReactNode;
}

export const SimpleSubscriptionCheck = ({ children }: SimpleSubscriptionCheckProps) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompanySubscription = async () => {
      try {
        
        // Buscar o email autorizado para esta empresa
        const { data: authorizedEmail, error: emailError } = await supabase
          .from('authorized_emails')
          .select('email')
          .eq('company_id', COMPANY_CONFIG.COMPANY_ID)
          .maybeSingle();


        if (emailError) {
          console.error('Erro ao buscar email autorizado:', emailError);
          setIsSubscribed(false);
          setIsLoading(false);
          return;
        }

        if (!authorizedEmail) {
          console.error('Empresa não encontrada ou sem email autorizado');
          setIsSubscribed(false);
          setIsLoading(false);
          return;
        }

        // Verificação especial para o email nicholasreis48@gmail.com
        if (authorizedEmail.email === 'nicholasreis48@gmail.com' || authorizedEmail.email === 'nicholasreis01@gmail.com') {
          setIsSubscribed(true);
          setIsLoading(false);
          return;
        }

        const { data: subscriber, error: subError } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_end, stripe_subscription_status, stripe_subscription_id, updated_at')
          .eq('email', authorizedEmail.email)
          .maybeSingle();


        if (subError) {
          console.error('Erro ao buscar assinatura:', subError);
          setIsSubscribed(false);
        } else if (!subscriber) {
          console.error('Assinatura não encontrada para email:', authorizedEmail.email);
          setIsSubscribed(false);
        } else {
          // Verificar se a assinatura está ativa considerando diferentes status
          const hasActiveStatus = subscriber.stripe_subscription_status && 
            ['active', 'trialing', 'past_due', 'incomplete', 'unpaid'].includes(subscriber.stripe_subscription_status);
          
          const isNotExpired = !subscriber.subscription_end || 
            new Date(subscriber.subscription_end) > new Date();
          
          const isActive = subscriber.subscribed && hasActiveStatus && isNotExpired;
          
          
          setIsSubscribed(isActive);
        }

      } catch (error) {
        console.error('Erro na verificação:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCompanySubscription();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Verificando...</div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>🔒</div>
          
          <h1 style={{
            color: '#dc3545',
            marginBottom: '15px',
            fontSize: '24px'
          }}>
            Página Não Disponível
          </h1>
          
          <p style={{
            color: '#6c757d',
            marginBottom: '25px',
            lineHeight: '1.5'
          }}>
            Esta página está temporariamente indisponível.<br/>
            O proprietário precisa renovar a assinatura.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
