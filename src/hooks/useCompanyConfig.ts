import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { COMPANY_CONFIG } from '@/config/company';

interface CompanyMetrics {
  students_count: number;
  success_rate: number;
  experience_years: number;
  average_rating: number;
  certifications_count: number;
}

interface CompanyContent {
  hero_highlight_text: string;
  hero_secondary_text: string;
  hero_background_url?: string;
  about_name: string;
  about_history: string;
  trainer_image_url?: string;
  trainer_cref_display: string;
  contact_whatsapp?: string;
  contact_email?: string;
  about_experience_years: number;
}

interface Specialty {
  id: string;
  name: string;
}

interface EducationItem {
  id: string;
  institution: string;
  course: string;
  year: number | null;
  type: 'GRADUATION' | 'CERTIFICATION' | 'COURSE' | 'WORKSHOP' | 'SPECIALIZATION';
  order_index: number;
}

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  highlight: boolean;
  active: boolean;
  order_index: number;
}

interface Testimonial {
  id: string;
  client_name: string;
  testimonial_text: string;
  rating: number;
  result_achieved: string;
  client_photo_url?: string;
  active: boolean;
  order_index: number;
}

interface GalleryCategory {
  id: string;
  name: string;
  order_index: number;
}

interface GalleryImage {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  image_url: string;
  order_index: number;
}

export const useCompanyConfig = () => {
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [content, setContent] = useState<CompanyContent | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      const companyId = COMPANY_CONFIG.COMPANY_ID;
      
      try {
        // Buscar métricas
        const { data: metricsData } = await supabase
          .from('metrics')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();

        if (metricsData) {
          setMetrics(metricsData);
        }

        // Buscar conteúdo da landing page
        const { data: contentData } = await supabase
          .from('landing_page_content')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();

        if (contentData) {
          setContent(contentData);
        }

        // Buscar especialidades
        const { data: specialtiesData } = await supabase
          .from('specialties')
          .select('id, name')
          .eq('company_id', companyId)
          .order('order_index');

        if (specialtiesData) {
          setSpecialties(specialtiesData);
        }

        // Buscar itens de educação
        const { data: educationData } = await supabase
          .from('education_items')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (educationData) {
          setEducationItems(educationData);
        }

        // Buscar planos de serviço
        const { data: plansData } = await supabase
          .from('service_plans')
          .select('*')
          .eq('company_id', companyId)
          .eq('active', true)
          .order('order_index');

        if (plansData) {
          const formattedPlans = plansData.map(plan => ({
            ...plan,
            features: Array.isArray(plan.features) 
              ? (plan.features as string[])
              : []
          })) as ServicePlan[];
          setServicePlans(formattedPlans);
        }

        // Buscar depoimentos
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('company_id', companyId)
          .eq('active', true)
          .order('order_index');

        if (testimonialsData) {
          setTestimonials(testimonialsData);
        }

        // Buscar categorias da galeria
        const { data: categoriesData } = await supabase
          .from('gallery_categories')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (categoriesData) {
          setGalleryCategories(categoriesData);
        }

        // Buscar imagens da galeria
        const { data: imagesData } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (imagesData) {
          setGalleryImages(imagesData);
        }

      } catch (error) {
        // Silently handle errors
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  return { 
    metrics, 
    content, 
    specialties, 
    educationItems, 
    servicePlans, 
    testimonials, 
    galleryCategories,
    galleryImages,
    isLoading,
    companyId: COMPANY_CONFIG.COMPANY_ID
  };
};
