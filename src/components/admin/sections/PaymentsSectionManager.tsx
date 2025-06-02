
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle, XCircle, ExternalLink, RefreshCw, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PaymentsSectionManager = () => {
  const { subscription, isLoading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Função para determinar o status da assinatura
  const getSubscriptionStatus = () => {
    if (!subscription) return { type: 'none', label: 'Verificando...', color: 'gray' };
    
    if (!subscription.stripe_subscription_id) {
      return { type: 'none', label: 'Sem Assinatura', color: 'gray' };
    }

    const status = subscription.stripe_subscription_status;
    const hasInvoiceUrl = !!subscription.hosted_invoice_url;

    switch (status) {
      case 'active':
        return { type: 'active', label: 'Ativo', color: 'green' };
      case 'trialing':
        return { type: 'active', label: 'Período de Teste', color: 'blue' };
      case 'past_due':
        return { 
          type: 'payment_required', 
          label: hasInvoiceUrl ? 'Pagamento Pendente' : 'Vencida', 
          color: hasInvoiceUrl ? 'yellow' : 'red' 
        };
      case 'incomplete':
        return { 
          type: 'payment_required', 
          label: hasInvoiceUrl ? 'Pagamento Incompleto' : 'Incompleta', 
          color: hasInvoiceUrl ? 'yellow' : 'red' 
        };
      case 'unpaid':
        return { 
          type: 'payment_required', 
          label: hasInvoiceUrl ? 'Não Pago' : 'Não Pago', 
          color: hasInvoiceUrl ? 'yellow' : 'red' 
        };
      case 'canceled':
        return { type: 'canceled', label: 'Cancelada', color: 'red' };
      case 'incomplete_expired':
        return { type: 'expired', label: 'Expirada', color: 'red' };
      default:
        return { type: 'unknown', label: status || 'Desconhecido', color: 'gray' };
    }
  };

  // Função para renderizar os botões de ação principais
  const renderMainActionButtons = () => {
    if (!subscription || !subscription.stripe_subscription_id) {
      // Caso 1: Nenhuma assinatura existe
      return (
        <Button onClick={createCheckout} className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Assinar Agora
        </Button>
      );
    }

    const status = subscription.stripe_subscription_status;
    const hostedInvoiceUrl = subscription.hosted_invoice_url;

    // Caso 2: Tem assinatura com fatura pendente
    if ((status === "past_due" || status === "incomplete" || status === "unpaid") && hostedInvoiceUrl) {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.open(hostedInvoiceUrl, '_blank')}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <CreditCard className="h-4 w-4" />
            Pagar Fatura Pendente
          </Button>
          <Button 
            onClick={openCustomerPortal} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Gerenciar Assinatura
          </Button>
        </div>
      );
    }

    // Caso 3: Tem assinatura com problema, mas sem URL de fatura
    if (status === "past_due" || status === "incomplete" || status === "unpaid") {
      return (
        <Button 
          onClick={openCustomerPortal} 
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Atualizar Pagamento
        </Button>
      );
    }

    // Caso 4: Assinatura ativa ou em trial
    if (status === "active" || status === "trialing") {
      return (
        <Button onClick={openCustomerPortal} className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Gerenciar Assinatura
        </Button>
      );
    }

    // Caso 5: Outros status (canceled, expired, etc.)
    return (
      <Button onClick={createCheckout} className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Criar Nova Assinatura
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-grafite">Pagamentos</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando informações...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-grafite">Pagamentos</h2>
        </div>
        <Button
          onClick={checkSubscription}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Status
        </Button>
      </div>

      {/* Alerta para problemas de pagamento */}
      {subscriptionStatus.type === 'payment_required' && subscription?.hosted_invoice_url && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Pagamento Pendente</h3>
                <p className="text-yellow-700 text-sm">
                  Sua assinatura tem uma fatura pendente. Clique no botão abaixo para efetuar o pagamento e manter sua assinatura ativa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Seu Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Plano Premium</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(subscription?.monthly_value || 250)}
                <span className="text-sm font-normal text-gray-600">/mês</span>
              </p>
            </div>
            <Badge 
              variant={
                subscriptionStatus.color === 'green' ? "default" : 
                subscriptionStatus.color === 'yellow' ? "secondary" : 
                "destructive"
              }
              className="flex items-center gap-1"
            >
              {subscriptionStatus.color === 'green' && <CheckCircle className="h-4 w-4" />}
              {subscriptionStatus.color === 'yellow' && <AlertTriangle className="h-4 w-4" />}
              {(subscriptionStatus.color === 'red' || subscriptionStatus.color === 'gray') && <XCircle className="h-4 w-4" />}
              {subscriptionStatus.label}
            </Badge>
          </div>

          {subscription?.subscription_end && subscription.subscribed && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Próximo vencimento: {formatDate(subscription.subscription_end)}
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            {renderMainActionButtons()}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <Badge variant={subscriptionStatus.color === 'green' ? "default" : "secondary"}>
                {subscriptionStatus.label}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Valor Mensal</span>
              <span className="font-semibold">
                {formatCurrency(subscription?.monthly_value || 250)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Modalidade</span>
              <span className="font-semibold">Mensal</span>
            </div>

            {subscription?.subscription_end && (
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Próximo Vencimento</span>
                <span className="font-semibold">
                  {formatDate(subscription.subscription_end)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
