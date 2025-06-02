
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatbotLeadData {
  name: string;
  email?: string;
  whatsapp?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
  experience?: string;
  preference?: string;
  time?: string;
  budget?: string;
  selectedPlan?: {
    name: string;
    price: number;
  };
  recommendedPlan?: {
    name: string;
    price: number;
  };
  companyId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing chatbot lead email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    const data: ChatbotLeadData = await req.json();
    console.log("Received chatbot data:", { ...data, name: data.name });
    
    if (!data.companyId) {
      console.error("Company ID not provided");
      return new Response(
        JSON.stringify({ error: "ID da empresa é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Fetching company data for chatbot lead:", data.companyId);
    const { data: companyData, error: companyError } = await supabase
      .from('landing_page_content')
      .select('contact_email, about_name')
      .eq('company_id', data.companyId)
      .maybeSingle();

    if (companyError) {
      console.error('Error fetching company data for chatbot:', companyError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!companyData || !companyData.contact_email) {
      console.error('No company data or contact email found for company:', data.companyId);
      return new Response(
        JSON.stringify({ error: "Email de destino não configurado" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Company email found for chatbot:", companyData.contact_email);

    const planInfo = data.selectedPlan || data.recommendedPlan;
    const bmi = data.height && data.weight ? (data.weight / (data.height * data.height)).toFixed(1) : null;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #495057; }
            .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #2196f3;">🤖 Novo Lead - Chatbot Assistente</h2>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Recebido em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3 style="color: #495057; margin-bottom: 15px;">📝 Informações Pessoais</h3>
                <div class="field">
                  <span class="label">Nome:</span> ${data.name}
                </div>
                ${data.email ? `<div class="field"><span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a></div>` : ''}
                ${data.whatsapp ? `<div class="field"><span class="label">WhatsApp:</span> <a href="https://wa.me/${data.whatsapp.replace(/\D/g, '')}">${data.whatsapp}</a></div>` : ''}
                ${data.age ? `<div class="field"><span class="label">Idade:</span> ${data.age} anos</div>` : ''}
              </div>

              ${data.height || data.weight ? `
              <div class="section">
                <h3 style="color: #495057; margin-bottom: 15px;">📊 Dados Físicos</h3>
                ${data.height ? `<div class="field"><span class="label">Altura:</span> ${data.height}m</div>` : ''}
                ${data.weight ? `<div class="field"><span class="label">Peso:</span> ${data.weight}kg</div>` : ''}
                ${bmi ? `<div class="field"><span class="label">IMC:</span> ${bmi}</div>` : ''}
              </div>
              ` : ''}

              <div class="section">
                <h3 style="color: #495057; margin-bottom: 15px;">🎯 Objetivos e Preferências</h3>
                ${data.goal ? `<div class="field"><span class="label">Objetivo Principal:</span> ${data.goal}</div>` : ''}
                ${data.experience ? `<div class="field"><span class="label">Experiência:</span> ${data.experience}</div>` : ''}
                ${data.preference ? `<div class="field"><span class="label">Preferência de Local:</span> ${data.preference}</div>` : ''}
                ${data.time ? `<div class="field"><span class="label">Tempo Disponível:</span> ${data.time}</div>` : ''}
                ${data.budget ? `<div class="field"><span class="label">Orçamento:</span> ${data.budget}</div>` : ''}
              </div>

              ${planInfo ? `
              <div class="highlight">
                <h3 style="color: #2196f3; margin-bottom: 15px;">💎 ${data.selectedPlan ? 'Plano Selecionado' : 'Plano Recomendado'}</h3>
                <div class="field">
                  <span class="label">Plano:</span> ${planInfo.name}
                </div>
                <div class="field">
                  <span class="label">Valor:</span> R$ ${planInfo.price}
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p><strong>🚀 Próximos Passos Recomendados:</strong></p>
              <ul>
                <li>Entrar em contato via WhatsApp em até 2 horas</li>
                <li>Agendar avaliação física gratuita</li>
                <li>Apresentar proposta personalizada baseada no perfil</li>
                <li>Explicar benefícios específicos do plano ${data.selectedPlan ? 'selecionado' : 'recomendado'}</li>
              </ul>
              
              <p style="margin-top: 20px;">
                <strong>Lead Score:</strong> Alto (Completou 100% do questionário via chatbot)
              </p>
              
              <p>
                Este email foi gerado automaticamente pelo chatbot assistente da sua landing page.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending chatbot email to:", companyData.contact_email);
    const emailResponse = await resend.emails.send({
      from: "Chatbot Assistant <onboarding@resend.dev>",
      to: [companyData.contact_email],
      subject: `🤖 Novo Lead Qualificado: ${data.name} - Chatbot`,
      html: emailHtml,
      replyTo: data.email || undefined,
    });

    console.log("Chatbot lead email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email do lead enviado com sucesso" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-chatbot-lead-email function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
