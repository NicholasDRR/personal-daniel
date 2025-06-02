
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cliente plans mockados - VOCÊ PODE ALTERAR AQUI
const getClientMonthlyValue = (email: string): number => {
  const clientPlans: Record<string, number> = {
    // Exemplos - adicione seus clientes aqui:
    // "cliente1@email.com": 20000, // R$ 200 em centavos
    // "cliente2@email.com": 35000, // R$ 350 em centavos
    // "cliente3@email.com": 15000, // R$ 150 em centavos
    
    // Para teste, qualquer email terá valor padrão
    "default": 25000, // R$ 250 padrão
  };
  
  return clientPlans[email] || clientPlans["default"];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Verificar se o usuário já é cliente da Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Verificar se já tem QUALQUER assinatura (ativa, vencida, cancelada, etc.)
      // Incluindo past_due, unpaid, incomplete, trialing, etc.
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 5, // Buscar as últimas 5 assinaturas
      });
      
      if (allSubscriptions.data.length > 0) {
        console.log('User has existing subscription(s), redirecting to customer portal');
        console.log('Subscription statuses:', allSubscriptions.data.map(sub => ({ id: sub.id, status: sub.status })));
        
        // Se já tem qualquer assinatura, redirecionar para Customer Portal
        // O Customer Portal permite pagar faturas pendentes, cancelar, reativar, etc.
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${req.headers.get("origin")}/admin`,
        });
        
        return new Response(JSON.stringify({ 
          url: portalSession.url,
          message: "Redirecionando para gerenciar sua assinatura existente"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // Se chegou aqui, não tem nenhuma assinatura (nem ativa nem vencida)
    // Então pode criar uma nova
    console.log('No existing subscription found, creating new subscription for user:', user.email);
    
    // Get monthly value for this client
    const monthlyValueCents = getClientMonthlyValue(user.email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: "Plano Mensal Premium",
              description: "Acesso completo ao painel administrativo e recursos premium"
            },
            unit_amount: monthlyValueCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/admin?payment=success`,
      cancel_url: `${req.headers.get("origin")}/admin?payment=cancelled`,
      locale: "pt-BR",
      
      // Personalizar mensagens
      custom_text: {
        submit: {
          message: "Sua assinatura será renovada automaticamente todo mês. Você pode cancelar a qualquer momento."
        }
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
