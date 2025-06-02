import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Cliente plans mockados - VOCÊ PODE ALTERAR AQUI
const getClientMonthlyValue = (email: string): number => {
  const clientPlans: Record<string, number> = {
    // Exemplos - adicione seus clientes aqui:
    // "cliente1@email.com": 20000, // R$ 200 em centavos
    // "cliente2@email.com": 35000, // R$ 350 em centavos
    // "cliente3@email.com": 15000, // R$ 150 em centavos
    "nicholasreis00@gmail.com": 50000, // R$ 500 em centavos
    
    // Para teste, qualquer email terá valor padrão
    "default": 25000, // R$ 250 padrão
  };
  
  return clientPlans[email] || clientPlans["default"];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logStep("Function started");

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Authenticating user");
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Verificar se o usuário já é cliente da Stripe
    logStep("Searching for Stripe customer");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
      
      // Verificar se já tem QUALQUER assinatura
      logStep("Checking for existing subscriptions");
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 5,
      });
      
      if (allSubscriptions.data.length > 0) {
        logStep("Found existing subscriptions", { 
          count: allSubscriptions.data.length,
          subscriptions: allSubscriptions.data.map(sub => ({ 
            id: sub.id, 
            status: sub.status 
          }))
        });
        
        // Se já tem qualquer assinatura, redirecionar para Customer Portal
        logStep("Creating customer portal session");
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${req.headers.get("origin")}/admin`,
        });
        
        logStep("Redirecting to customer portal", { url: portalSession.url });
        return new Response(JSON.stringify({ 
          url: portalSession.url,
          message: "Redirecionando para gerenciar sua assinatura existente"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    // Se chegou aqui, não tem nenhuma assinatura
    logStep("No existing subscription found, creating new checkout session");
    
    // Get monthly value for this client
    const monthlyValueCents = getClientMonthlyValue(user.email);
    logStep("Monthly value calculated", { email: user.email, monthlyValueCents });

    logStep("Creating checkout session");
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
      custom_text: {
        submit: {
          message: "Sua assinatura será renovada automaticamente todo mês. Você pode cancelar a qualquer momento."
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
