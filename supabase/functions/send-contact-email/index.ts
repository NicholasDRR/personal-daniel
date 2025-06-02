import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting: máximo 1 email a cada 3 minutos por IP
const rateLimitMap = new Map<string, { timestamp: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const threeMinutes = 3 * 60 * 1000; // 3 minutos em milissegundos
  
  const existing = rateLimitMap.get(ip);
  
  // Se não existe registro ou já passou o tempo de espera
  if (!existing || now - existing.timestamp > threeMinutes) {
    rateLimitMap.set(ip, { timestamp: now });
    return true;
  }
  
  // Calcula quanto tempo falta para poder enviar novamente
  const timeLeft = Math.ceil((threeMinutes - (now - existing.timestamp)) / 1000);
  console.log(`Rate limit active for IP ${ip}. Time left: ${timeLeft} seconds`);
  return false;
};

interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  companyId: string;
  token?: string; // Token de verificação
}

const validateInput = (data: ContactFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validação básica dos campos
  if (!data.name || data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.push("Nome deve ter entre 2 e 100 caracteres");
  }
  
  if (data.email) {
    // Validação mais rigorosa de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Email inválido");
    }
  }
  
  if (data.phone) {
    // Remove caracteres não numéricos e verifica o comprimento
    const phoneNumbers = data.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      errors.push("Telefone inválido");
    }
  }
  
  if (!data.message || data.message.trim().length < 10 || data.message.trim().length > 1000) {
    errors.push("Mensagem deve ter entre 10 e 1000 caracteres");
  }
  
  // Verifica se há links ou URLs suspeitos na mensagem
  const suspiciousPatterns = [
    /http[s]?:\/\//i,
    /www\./i,
    /\[url=/i,
    /\.com/i,
    /\.net/i,
    /\.org/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(data.message))) {
    errors.push("Mensagem não pode conter links");
  }
  
  if (!data.email && !data.phone) {
    errors.push("É necessário fornecer pelo menos email ou telefone");
  }
  
  if (!data.companyId) {
    errors.push("ID da empresa é obrigatório");
  }
  
  // Verifica se há caracteres suspeitos ou scripts
  const suspiciousContent = /<[^>]*>|javascript:|data:|vbscript:|onload=|onerror=/i;
  if (suspiciousContent.test(data.name) || 
      suspiciousContent.test(data.message) || 
      (data.email && suspiciousContent.test(data.email)) ||
      (data.phone && suspiciousContent.test(data.phone))) {
    errors.push("Conteúdo inválido detectado");
  }
  
  return { isValid: errors.length === 0, errors };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing contact email request");
  
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

    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    console.log(`Request from IP: ${clientIP}`);
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      const existing = rateLimitMap.get(clientIP);
      const timeLeft = Math.ceil((3 * 60 * 1000 - (Date.now() - (existing?.timestamp || 0))) / 1000);
      
      return new Response(
        JSON.stringify({ 
          error: `Por favor, aguarde ${timeLeft} segundos antes de enviar outro formulário.` 
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
            "Retry-After": "180"
          },
        }
      );
    }

    const data: ContactFormData = await req.json();
    console.log("Received data:", { ...data, message: "[REDACTED]" });
    
    const validation = validateInput(data);
    if (!validation.isValid) {
      console.log("Validation failed:", validation.errors);
      return new Response(
        JSON.stringify({ error: validation.errors.join(", ") }),
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

    console.log("Fetching company data for:", data.companyId);
    const { data: companyData, error: companyError } = await supabase
      .from('landing_page_content')
      .select('contact_email, about_name')
      .eq('company_id', data.companyId)
      .maybeSingle();

    if (companyError) {
      console.error('Error fetching company data:', companyError);
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

    console.log("Company email found:", companyData.contact_email);

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
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #495057; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0; color: #dc2626;">🎯 Novo Lead - Formulário de Contato</h2>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Recebido em ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">Nome:</div>
                <div>${data.name}</div>
              </div>
              
              ${data.email ? `
              <div class="field">
                <div class="label">Email:</div>
                <div><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              ` : ''}
              
              ${data.phone ? `
              <div class="field">
                <div class="label">Telefone:</div>
                <div><a href="tel:${data.phone}">${data.phone}</a></div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="label">Mensagem:</div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${data.message}</div>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>📊 Ações recomendadas:</strong></p>
              <ul>
                <li>Responder em até 24 horas para melhor conversão</li>
                <li>Personalizar a resposta com base nos objetivos mencionados</li>
                <li>Oferecer avaliação gratuita se aplicável</li>
              </ul>
              
              <p style="margin-top: 20px;">
                Este email foi gerado automaticamente pelo formulário de contato da sua landing page.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", companyData.contact_email);
    const emailResponse = await resend.emails.send({
      from: "Seu Negócio Online <contato@seunegocioonline.net>",
      to: [companyData.contact_email],
      subject: `🎯 Novo Lead: ${data.name} - Formulário de Contato`,
      html: emailHtml,
      replyTo: data.email || undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email enviado com sucesso" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
