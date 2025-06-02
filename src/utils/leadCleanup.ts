import { supabase } from '@/integrations/supabase/client';

const SIX_MONTHS_IN_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 meses em milissegundos

export const cleanupOldLeads = async (companyId: string) => {
  try {
    const sixMonthsAgo = new Date(Date.now() - SIX_MONTHS_IN_MS).toISOString();

    // Limpar leads do chatbot
    const { error: chatbotError } = await supabase
      .from('chatbot_leads')
      .delete()
      .eq('company_id', companyId)
      .lt('created_at', sixMonthsAgo)
      .neq('conversion_status', 'CONVERTED');

    if (chatbotError) {
      console.error('Erro ao limpar leads do chatbot:', chatbotError);
      throw chatbotError;
    }

    // Limpar leads do formulário de contato
    const { error: contactError } = await supabase
      .from('contact_form_leads')
      .delete()
      .eq('company_id', companyId)
      .lt('created_at', sixMonthsAgo)
      .neq('status', 'CONVERTED');

    if (contactError) {
      console.error('Erro ao limpar leads do formulário:', contactError);
      throw contactError;
    }

    return {
      success: true,
      message: 'Leads antigos foram limpos com sucesso'
    };
  } catch (error) {
    console.error('Erro na limpeza de leads:', error);
    return {
      success: false,
      message: 'Erro ao limpar leads antigos'
    };
  }
}; 