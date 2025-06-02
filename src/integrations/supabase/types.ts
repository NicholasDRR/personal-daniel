export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          company_id: string
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"] | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_path: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"] | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"] | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_emails: {
        Row: {
          company_id: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authorized_emails_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_tracking: {
        Row: {
          company_id: string
          created_at: string
          id: string
          session_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          session_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          session_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_leads: {
        Row: {
          age: number | null
          bmi: number | null
          chat_duration: number | null
          company_id: string
          completion_rate: number | null
          contact_email: string | null
          contact_whatsapp: string | null
          conversion_status:
            | Database["public"]["Enums"]["conversion_status"]
            | null
          created_at: string
          current_sports: Json | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          experience_level: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          height: number | null
          id: string
          ip_address: unknown | null
          name: string | null
          notes: string | null
          primary_goal: string | null
          selected_plan_id: string | null
          steps_completed: number | null
          total_steps: number | null
          updated_at: string
          weight: number | null
          workout_preference: string | null
        }
        Insert: {
          age?: number | null
          bmi?: number | null
          chat_duration?: number | null
          company_id: string
          completion_rate?: number | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          conversion_status?:
            | Database["public"]["Enums"]["conversion_status"]
            | null
          created_at?: string
          current_sports?: Json | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          experience_level?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          height?: number | null
          id?: string
          ip_address?: unknown | null
          name?: string | null
          notes?: string | null
          primary_goal?: string | null
          selected_plan_id?: string | null
          steps_completed?: number | null
          total_steps?: number | null
          updated_at?: string
          weight?: number | null
          workout_preference?: string | null
        }
        Update: {
          age?: number | null
          bmi?: number | null
          chat_duration?: number | null
          company_id?: string
          completion_rate?: number | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          conversion_status?:
            | Database["public"]["Enums"]["conversion_status"]
            | null
          created_at?: string
          current_sports?: Json | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          experience_level?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          height?: number | null
          id?: string
          ip_address?: unknown | null
          name?: string | null
          notes?: string | null
          primary_goal?: string | null
          selected_plan_id?: string | null
          steps_completed?: number | null
          total_steps?: number | null
          updated_at?: string
          weight?: number | null
          workout_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_leads_selected_plan_id_fkey"
            columns: ["selected_plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_form_leads: {
        Row: {
          company_id: string
          contacted: boolean | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          referrer: string | null
          status: Database["public"]["Enums"]["conversion_status"] | null
          updated_at: string
        }
        Insert: {
          company_id: string
          contacted?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          status?: Database["public"]["Enums"]["conversion_status"] | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          contacted?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          status?: Database["public"]["Enums"]["conversion_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_form_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      education_items: {
        Row: {
          company_id: string
          course: string
          created_at: string
          id: string
          institution: string
          order_index: number | null
          type: Database["public"]["Enums"]["education_item_type"]
          updated_at: string
          year: number | null
        }
        Insert: {
          company_id: string
          course: string
          created_at?: string
          id?: string
          institution: string
          order_index?: number | null
          type: Database["public"]["Enums"]["education_item_type"]
          updated_at?: string
          year?: number | null
        }
        Update: {
          company_id?: string
          course?: string
          created_at?: string
          id?: string
          institution?: string
          order_index?: number | null
          type?: Database["public"]["Enums"]["education_item_type"]
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "education_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_categories: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          category_id: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_content: {
        Row: {
          about_cref: string | null
          about_experience_years: number | null
          about_history: string | null
          about_name: string | null
          about_specialties: Json | null
          company_id: string
          contact_address: string | null
          contact_email: string | null
          contact_latitude: number | null
          contact_longitude: number | null
          contact_whatsapp: string | null
          created_at: string
          hero_background_url: string | null
          hero_cta_link: string | null
          hero_cta_text: string | null
          hero_highlight_text: string | null
          hero_secondary_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          primary_color: string | null
          secondary_color: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_youtube: string | null
          trainer_cref_display: string | null
          trainer_image_url: string | null
          updated_at: string
          values: Json | null
        }
        Insert: {
          about_cref?: string | null
          about_experience_years?: number | null
          about_history?: string | null
          about_name?: string | null
          about_specialties?: Json | null
          company_id: string
          contact_address?: string | null
          contact_email?: string | null
          contact_latitude?: number | null
          contact_longitude?: number | null
          contact_whatsapp?: string | null
          created_at?: string
          hero_background_url?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_highlight_text?: string | null
          hero_secondary_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          trainer_cref_display?: string | null
          trainer_image_url?: string | null
          updated_at?: string
          values?: Json | null
        }
        Update: {
          about_cref?: string | null
          about_experience_years?: number | null
          about_history?: string | null
          about_name?: string | null
          about_specialties?: Json | null
          company_id?: string
          contact_address?: string | null
          contact_email?: string | null
          contact_latitude?: number | null
          contact_longitude?: number | null
          contact_whatsapp?: string | null
          created_at?: string
          hero_background_url?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_highlight_text?: string | null
          hero_secondary_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          trainer_cref_display?: string | null
          trainer_image_url?: string | null
          updated_at?: string
          values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_content_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          average_rating: number | null
          certifications_count: number | null
          company_id: string
          created_at: string | null
          experience_years: number | null
          id: string
          students_count: number | null
          success_rate: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          certifications_count?: number | null
          company_id: string
          created_at?: string | null
          experience_years?: number | null
          id?: string
          students_count?: number | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          certifications_count?: number | null
          company_id?: string
          created_at?: string | null
          experience_years?: number | null
          id?: string
          students_count?: number | null
          success_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          active: boolean | null
          company_id: string
          created_at: string
          description: string | null
          features: Json | null
          highlight: boolean | null
          id: string
          name: string
          order_index: number | null
          price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          company_id: string
          created_at?: string
          description?: string | null
          features?: Json | null
          highlight?: boolean | null
          id?: string
          name: string
          order_index?: number | null
          price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          company_id?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          highlight?: boolean | null
          id?: string
          name?: string
          order_index?: number | null
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specialties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          monthly_value: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_status: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          monthly_value?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          monthly_value?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_status?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean | null
          client_name: string
          client_photo_url: string | null
          company_id: string
          created_at: string
          id: string
          order_index: number | null
          rating: number | null
          result_achieved: string | null
          testimonial_text: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          client_name: string
          client_photo_url?: string | null
          company_id: string
          created_at?: string
          id?: string
          order_index?: number | null
          rating?: number | null
          result_achieved?: string | null
          testimonial_text: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          client_name?: string
          client_photo_url?: string | null
          company_id?: string
          created_at?: string
          id?: string
          order_index?: number | null
          rating?: number | null
          result_achieved?: string | null
          testimonial_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_page_view: {
        Args: {
          profile_slug: string
          visitor_id: string
          is_unique?: boolean
          device_info?: Json
        }
        Returns: undefined
      }
      track_chatbot_interaction: {
        Args: { profile_slug: string; is_completion?: boolean }
        Returns: undefined
      }
      track_cta_click: {
        Args: {
          profile_slug: string
          cta_type: string
          social_platform?: string
        }
        Returns: undefined
      }
      update_lead_score: {
        Args: { conversation_id: string; score_increment: number }
        Returns: undefined
      }
    }
    Enums: {
      bot_personality: "friendly" | "professional" | "motivational"
      conversation_status: "ACTIVE" | "COMPLETED" | "ABANDONED" | "SPAM"
      conversion_status:
        | "NEW"
        | "CONTACTED"
        | "NEGOTIATING"
        | "CONVERTED"
        | "LOST"
      device_type: "DESKTOP" | "MOBILE" | "TABLET"
      education_item_type:
        | "GRADUATION"
        | "CERTIFICATION"
        | "COURSE"
        | "WORKSHOP"
        | "SPECIALIZATION"
      gallery_image_category:
        | "PROFESSIONAL"
        | "TRANSFORMATIONS"
        | "WORKSPACE"
        | "CERTIFICATES"
        | "HERO"
      gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
      message_sender: "USER" | "BOT" | "ADMIN"
      message_type: "text" | "quick_reply" | "form"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bot_personality: ["friendly", "professional", "motivational"],
      conversation_status: ["ACTIVE", "COMPLETED", "ABANDONED", "SPAM"],
      conversion_status: [
        "NEW",
        "CONTACTED",
        "NEGOTIATING",
        "CONVERTED",
        "LOST",
      ],
      device_type: ["DESKTOP", "MOBILE", "TABLET"],
      education_item_type: [
        "GRADUATION",
        "CERTIFICATION",
        "COURSE",
        "WORKSHOP",
        "SPECIALIZATION",
      ],
      gallery_image_category: [
        "PROFESSIONAL",
        "TRANSFORMATIONS",
        "WORKSPACE",
        "CERTIFICATES",
        "HERO",
      ],
      gender: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
      message_sender: ["USER", "BOT", "ADMIN"],
      message_type: ["text", "quick_reply", "form"],
    },
  },
} as const
