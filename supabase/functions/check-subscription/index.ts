
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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar cliente no Stripe com busca mais ampla
    logStep("Searching for Stripe customer with expanded search");
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 100 // Aumentar limite para garantir que encontramos o cliente
    });
    
    logStep("Customer search result", { 
      found: customers.data.length, 
      searchEmail: user.email,
      customers: customers.data.map(c => ({ 
        id: c.id, 
        email: c.email,
        created: c.created 
      }))
    });
    
    if (customers.data.length === 0) {
      // Buscar por email parcial como fallback
      logStep("No exact email match, trying broader search");
      const allCustomers = await stripe.customers.list({ limit: 100 });
      const matchingCustomers = allCustomers.data.filter(c => 
        c.email && c.email.toLowerCase().includes(user.email.toLowerCase())
      );
      
      logStep("Broader search result", {
        totalCustomers: allCustomers.data.length,
        matchingCustomers: matchingCustomers.map(c => ({ id: c.id, email: c.email }))
      });
      
      if (matchingCustomers.length === 0) {
        logStep("No customer found after all searches, updating unsubscribed state");
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        return new Response(JSON.stringify({ 
          subscribed: false,
          stripe_subscription_id: null,
          stripe_subscription_status: null,
          payment_intent_status: null,
          hosted_invoice_url: null,
          subscription_tier: null,
          subscription_end: null,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const customerId = customers.data.length > 0 ? customers.data[0].id : null;
    if (!customerId) {
      throw new Error("Customer ID not found");
    }
    logStep("Found Stripe customer", { customerId });

    // Buscar TODAS as assinaturas do cliente (ativas e inativas)
    logStep("Searching for all subscriptions");
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100, // Buscar todas
      expand: ["data.latest_invoice", "data.latest_invoice.payment_intent"],
    });

    logStep("All subscriptions found", { 
      count: allSubscriptions.data.length,
      subscriptions: allSubscriptions.data.map(sub => ({ 
        id: sub.id, 
        status: sub.status,
        current_period_end: sub.current_period_end,
        latest_invoice_id: sub.latest_invoice ? (typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice.id) : null
      }))
    });

    let subscribed = false;
    let subscriptionTier: string | null = null;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;
    let stripeSubscriptionStatus: string | null = null;
    let paymentIntentStatus: string | null = null;
    let hostedInvoiceUrl: string | null = null;

    if (allSubscriptions.data.length > 0) {
      // Ordenar assinaturas por prioridade de status
      const statusPriority = ["active", "trialing", "past_due", "incomplete", "unpaid", "canceled", "incomplete_expired"];
      const sortedSubscriptions = allSubscriptions.data.sort((a, b) => {
        const aPriority = statusPriority.indexOf(a.status);
        const bPriority = statusPriority.indexOf(b.status);
        if (aPriority === -1) return 1; // status desconhecido vai para o final
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });

      const subscription = sortedSubscriptions[0];
      stripeSubscriptionId = subscription.id;
      stripeSubscriptionStatus = subscription.status;
      
      logStep("Processing subscription", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        current_period_end: subscription.current_period_end
      });

      // Determinar se está subscrito baseado no status
      if (["active", "trialing", "past_due", "incomplete", "unpaid"].includes(subscription.status)) {
        subscribed = ["active", "trialing"].includes(subscription.status);
        subscriptionEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        // Determinar o tier da assinatura
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0]?.price?.id;
          if (priceId) {
            try {
              const price = await stripe.prices.retrieve(priceId);
              const amount = price.unit_amount || 0;
              if (amount <= 999) {
                subscriptionTier = "Basic";
              } else if (amount <= 1999) {
                subscriptionTier = "Premium";
              } else {
                subscriptionTier = "Enterprise";
              }
              logStep("Determined subscription tier", { priceId, amount, tier: subscriptionTier });
            } catch (priceError) {
              logStep("Error retrieving price, using default tier", { priceId, error: priceError.message });
              subscriptionTier = "Premium";
            }
          } else {
            subscriptionTier = "Premium";
          }
        } else {
          subscriptionTier = "Premium";
        }

        // Para assinaturas com problemas de pagamento, buscar faturas pendentes
        if (["past_due", "incomplete", "unpaid"].includes(subscription.status)) {
          logStep("Subscription has payment issues, searching for pending invoices");
          
          // Verificar latest_invoice primeiro
          if (subscription.latest_invoice) {
            const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
            logStep("Latest invoice found", {
              id: latestInvoice.id,
              status: latestInvoice.status,
              hosted_invoice_url: latestInvoice.hosted_invoice_url
            });
            
            if (latestInvoice.hosted_invoice_url) {
              hostedInvoiceUrl = latestInvoice.hosted_invoice_url;
            }
            
            // Verificar payment intent
            if (latestInvoice.payment_intent) {
              if (typeof latestInvoice.payment_intent === 'object') {
                paymentIntentStatus = (latestInvoice.payment_intent as Stripe.PaymentIntent).status || null;
              } else if (typeof latestInvoice.payment_intent === 'string') {
                try {
                  const pi = await stripe.paymentIntents.retrieve(latestInvoice.payment_intent);
                  paymentIntentStatus = pi.status;
                } catch (piError) {
                  logStep("Error retrieving payment intent", { error: piError.message });
                }
              }
            }
          }

          // Se não encontrou URL na latest_invoice, buscar faturas em aberto
          if (!hostedInvoiceUrl) {
            logStep("No hosted URL in latest invoice, searching for open invoices");
            try {
              const openInvoices = await stripe.invoices.list({
                customer: customerId,
                subscription: subscription.id,
                status: "open",
                limit: 10,
              });
              
              logStep("Open invoices found", {
                count: openInvoices.data.length,
                invoices: openInvoices.data.map(inv => ({
                  id: inv.id,
                  status: inv.status,
                  hosted_invoice_url: inv.hosted_invoice_url
                }))
              });
              
              if (openInvoices.data.length > 0) {
                const openInvoice = openInvoices.data[0];
                hostedInvoiceUrl = openInvoice.hosted_invoice_url;
                logStep("Using open invoice URL", { invoiceId: openInvoice.id, url: hostedInvoiceUrl });
              }
            } catch (invoiceError) {
              logStep("Error searching for open invoices", { error: invoiceError.message });
            }
          }

          // Se ainda não encontrou, buscar faturas draft
          if (!hostedInvoiceUrl) {
            logStep("No open invoices, searching for draft invoices");
            try {
              const draftInvoices = await stripe.invoices.list({
                customer: customerId,
                subscription: subscription.id,
                status: "draft",
                limit: 10,
              });
              
              if (draftInvoices.data.length > 0) {
                const draftInvoice = draftInvoices.data[0];
                hostedInvoiceUrl = draftInvoice.hosted_invoice_url;
                logStep("Using draft invoice URL", { invoiceId: draftInvoice.id, url: hostedInvoiceUrl });
              }
            } catch (draftError) {
              logStep("Error searching for draft invoices", { error: draftError.message });
            }
          }

          // Se ainda não encontrou, buscar qualquer fatura do customer
          if (!hostedInvoiceUrl) {
            logStep("No subscription invoices, searching for any customer invoices");
            try {
              const anyInvoices = await stripe.invoices.list({
                customer: customerId,
                limit: 10,
              });
              
              const pendingInvoice = anyInvoices.data.find(inv => 
                ["open", "draft"].includes(inv.status) && inv.hosted_invoice_url
              );
              
              if (pendingInvoice) {
                hostedInvoiceUrl = pendingInvoice.hosted_invoice_url;
                logStep("Using any pending invoice URL", { invoiceId: pendingInvoice.id, url: hostedInvoiceUrl });
              }
            } catch (anyInvoiceError) {
              logStep("Error searching for any invoices", { error: anyInvoiceError.message });
            }
          }
        }
      } else {
        logStep("Subscription status not actionable", { status: subscription.status });
        subscribed = false;
      }
    } else {
      logStep("No subscriptions found for customer");
    }

    // Atualizar banco de dados
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: subscribed,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_subscription_status: stripeSubscriptionStatus,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    const responseData = {
      subscribed: subscribed,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_subscription_status: stripeSubscriptionStatus,
      payment_intent_status: paymentIntentStatus,
      hosted_invoice_url: hostedInvoiceUrl,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
    };

    logStep("Final response data", responseData);
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
