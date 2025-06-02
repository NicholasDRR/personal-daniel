
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyId = () => {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCompanyId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          const { data, error } = await supabase
            .from('authorized_emails')
            .select('company_id')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Error fetching company_id:', error);
          } else {
            setCompanyId(data?.company_id || null);
          }
        }
      } catch (error) {
        console.error('Error getting company_id:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCompanyId();
  }, []);

  return { companyId, isLoading };
};
