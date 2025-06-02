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

export const useCompanyData = () => {
  const companyId = COMPANY_CONFIG.COMPANY_ID;
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
      try {

        // Buscar métricas
        const { data: metricsData, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (metricsError && metricsError.code !== 'PGRST116') {
          console.error('Error loading metrics:', metricsError);
        } else if (metricsData) {
          setMetrics(metricsData);
        }

        // Buscar conteúdo da landing page
        const { data: contentData, error: contentError } = await supabase
          .from('landing_page_content')
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (contentError && contentError.code !== 'PGRST116') {
          console.error('Error loading content:', contentError);
        } else if (contentData) {
          setContent(contentData);
        } else {
          console.log('No content found for company:', companyId);
        }

        // Buscar especialidades
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('specialties')
          .select('id, name')
          .eq('company_id', companyId)
          .order('order_index');

        if (specialtiesError) {
          console.error('Error loading specialties:', specialtiesError);
        } else if (specialtiesData) {
          setSpecialties(specialtiesData);
        }

        // Buscar itens de educação
        const { data: educationData, error: educationError } = await supabase
          .from('education_items')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (educationError) {
          console.error('Error loading education items:', educationError);
        } else if (educationData) {
          setEducationItems(educationData);
        }

        // Buscar planos de serviço
        const { data: plansData, error: plansError } = await supabase
          .from('service_plans')
          .select('*')
          .eq('company_id', companyId)
          .eq('active', true)
          .order('order_index');

        if (plansError) {
          console.error('Error loading service plans:', plansError);
        } else if (plansData) {
          const formattedPlans = plansData.map(plan => ({
            ...plan,
            features: Array.isArray(plan.features) 
              ? (plan.features as string[])
              : []
          })) as ServicePlan[];
          setServicePlans(formattedPlans);
        }

        // Buscar depoimentos
        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('company_id', companyId)
          .eq('active', true)
          .order('order_index');

        if (testimonialsError) {
          console.error('Error loading testimonials:', testimonialsError);
        } else if (testimonialsData) {
          setTestimonials(testimonialsData);
        }

        // Buscar categorias da galeria
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('gallery_categories')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (categoriesError) {
          console.error('Error loading gallery categories:', categoriesError);
        } else if (categoriesData) {
          setGalleryCategories(categoriesData);
        }

        // Buscar imagens da galeria
        const { data: imagesData, error: imagesError } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('company_id', companyId)
          .order('order_index');

        if (imagesError) {
          console.error('Error loading gallery images:', imagesError);
        } else if (imagesData) {
          setGalleryImages(imagesData);
        }

      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  return { 
    metrics, 
    content, 
    specialties, 
    educationItems, 
    servicePlans, 
    testimonials, 
    galleryCategories,
    galleryImages,
    isLoading
  };
};
