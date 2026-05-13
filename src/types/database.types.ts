export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointment_status_history: {
        Row: {
          appointment_id: string;
          changed_at: string;
          changed_by: string | null;
          from_status:
            | Database["public"]["Enums"]["appointment_status_t"]
            | null;
          id: string;
          reason: string | null;
          to_status: Database["public"]["Enums"]["appointment_status_t"];
        };
        Insert: {
          appointment_id: string;
          changed_at?: string;
          changed_by?: string | null;
          from_status?:
            | Database["public"]["Enums"]["appointment_status_t"]
            | null;
          id?: string;
          reason?: string | null;
          to_status: Database["public"]["Enums"]["appointment_status_t"];
        };
        Update: {
          appointment_id?: string;
          changed_at?: string;
          changed_by?: string | null;
          from_status?:
            | Database["public"]["Enums"]["appointment_status_t"]
            | null;
          id?: string;
          reason?: string | null;
          to_status?: Database["public"]["Enums"]["appointment_status_t"];
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          business_id: string;
          created_at: string;
          created_by: string | null;
          customer_id: string;
          deposit_cents: number;
          ends_at: string;
          id: string;
          internal_notes: string | null;
          notes: string | null;
          reminder_sent_at: string | null;
          service_id: string;
          source: Database["public"]["Enums"]["appointment_source_t"];
          staff_id: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status_t"];
          updated_at: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          created_by?: string | null;
          customer_id: string;
          deposit_cents?: number;
          ends_at: string;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          reminder_sent_at?: string | null;
          service_id: string;
          source?: Database["public"]["Enums"]["appointment_source_t"];
          staff_id?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status_t"];
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string;
          deposit_cents?: number;
          ends_at?: string;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          reminder_sent_at?: string | null;
          service_id?: string;
          source?: Database["public"]["Enums"]["appointment_source_t"];
          staff_id?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status_t"];
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          business_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          ip: string | null;
          metadata: Json | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          business_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          business_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      business_hours: {
        Row: {
          business_id: string;
          closes_at: string;
          created_at: string;
          day_of_week: number;
          id: string;
          is_closed: boolean;
          opens_at: string;
        };
        Insert: {
          business_id: string;
          closes_at: string;
          created_at?: string;
          day_of_week: number;
          id?: string;
          is_closed?: boolean;
          opens_at: string;
        };
        Update: {
          business_id?: string;
          closes_at?: string;
          created_at?: string;
          day_of_week?: number;
          id?: string;
          is_closed?: boolean;
          opens_at?: string;
        };
        Relationships: [];
      };
      business_invitations: {
        Row: {
          accepted_at: string | null;
          business_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          role: Database["public"]["Enums"]["business_role"];
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          business_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          role?: Database["public"]["Enums"]["business_role"];
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          business_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          role?: Database["public"]["Enums"]["business_role"];
          token?: string;
        };
        Relationships: [];
      };
      business_users: {
        Row: {
          accepted_at: string | null;
          business_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["business_role"];
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          business_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role: Database["public"]["Enums"]["business_role"];
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          business_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["business_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          address: string | null;
          booking_policy: string | null;
          city: string | null;
          country: string;
          cover_url: string | null;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          deposit_policy: string | null;
          district: string | null;
          id: string;
          instagram: string | null;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          owner_id: string;
          plan: string;
          slug: string;
          subscription_status: Database["public"]["Enums"]["subscription_status_t"];
          timezone: string;
          trial_ends_at: string | null;
          updated_at: string;
          whatsapp_phone: string | null;
        };
        Insert: {
          address?: string | null;
          booking_policy?: string | null;
          city?: string | null;
          country?: string;
          cover_url?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          deposit_policy?: string | null;
          district?: string | null;
          id?: string;
          instagram?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          owner_id: string;
          plan?: string;
          slug: string;
          subscription_status?: Database["public"]["Enums"]["subscription_status_t"];
          timezone?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
          whatsapp_phone?: string | null;
        };
        Update: {
          address?: string | null;
          booking_policy?: string | null;
          city?: string | null;
          country?: string;
          cover_url?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          deposit_policy?: string | null;
          district?: string | null;
          id?: string;
          instagram?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          owner_id?: string;
          plan?: string;
          slug?: string;
          subscription_status?: Database["public"]["Enums"]["subscription_status_t"];
          timezone?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
          whatsapp_phone?: string | null;
        };
        Relationships: [];
      };
      cash_sessions: {
        Row: {
          business_id: string;
          closed_at: string | null;
          closed_by: string | null;
          closing_cents: number | null;
          created_at: string;
          difference_cents: number | null;
          expected_cents: number | null;
          id: string;
          notes: string | null;
          opened_at: string;
          opened_by: string;
          opening_cents: number;
          status: Database["public"]["Enums"]["cash_session_status_t"];
        };
        Insert: {
          business_id: string;
          closed_at?: string | null;
          closed_by?: string | null;
          closing_cents?: number | null;
          created_at?: string;
          difference_cents?: number | null;
          expected_cents?: number | null;
          id?: string;
          notes?: string | null;
          opened_at?: string;
          opened_by: string;
          opening_cents?: number;
          status?: Database["public"]["Enums"]["cash_session_status_t"];
        };
        Update: {
          business_id?: string;
          closed_at?: string | null;
          closed_by?: string | null;
          closing_cents?: number | null;
          created_at?: string;
          difference_cents?: number | null;
          expected_cents?: number | null;
          id?: string;
          notes?: string | null;
          opened_at?: string;
          opened_by?: string;
          opening_cents?: number;
          status?: Database["public"]["Enums"]["cash_session_status_t"];
        };
        Relationships: [];
      };
      customers: {
        Row: {
          allergies: string | null;
          birthday: string | null;
          business_id: string;
          created_at: string;
          district: string | null;
          email: string | null;
          first_visit_at: string | null;
          id: string;
          instagram: string | null;
          last_visit_at: string | null;
          name: string;
          notes: string | null;
          phone: string | null;
          status: Database["public"]["Enums"]["customer_status_t"];
          total_spent_cents: number;
          total_visits: number;
          updated_at: string;
        };
        Insert: {
          allergies?: string | null;
          birthday?: string | null;
          business_id: string;
          created_at?: string;
          district?: string | null;
          email?: string | null;
          first_visit_at?: string | null;
          id?: string;
          instagram?: string | null;
          last_visit_at?: string | null;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["customer_status_t"];
          total_spent_cents?: number;
          total_visits?: number;
          updated_at?: string;
        };
        Update: {
          allergies?: string | null;
          birthday?: string | null;
          business_id?: string;
          created_at?: string;
          district?: string | null;
          email?: string | null;
          first_visit_at?: string | null;
          id?: string;
          instagram?: string | null;
          last_visit_at?: string | null;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: Database["public"]["Enums"]["customer_status_t"];
          total_spent_cents?: number;
          total_visits?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount_cents: number;
          business_id: string;
          cash_session_id: string | null;
          category: string;
          created_by: string | null;
          description: string | null;
          id: string;
          paid_at: string;
        };
        Insert: {
          amount_cents: number;
          business_id: string;
          cash_session_id?: string | null;
          category: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          paid_at?: string;
        };
        Update: {
          amount_cents?: number;
          business_id?: string;
          cash_session_id?: string | null;
          category?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          paid_at?: string;
        };
        Relationships: [];
      };
      notification_queue: {
        Row: {
          appointment_id: string | null;
          business_id: string;
          created_at: string;
          customer_id: string | null;
          error_message: string | null;
          id: string;
          payload: Json;
          scheduled_for: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["notification_status_t"];
          target_email: string | null;
          target_phone: string | null;
          type: Database["public"]["Enums"]["notification_type_t"];
        };
        Insert: {
          appointment_id?: string | null;
          business_id: string;
          created_at?: string;
          customer_id?: string | null;
          error_message?: string | null;
          id?: string;
          payload?: Json;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status_t"];
          target_email?: string | null;
          target_phone?: string | null;
          type: Database["public"]["Enums"]["notification_type_t"];
        };
        Update: {
          appointment_id?: string | null;
          business_id?: string;
          created_at?: string;
          customer_id?: string | null;
          error_message?: string | null;
          id?: string;
          payload?: Json;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status_t"];
          target_email?: string | null;
          target_phone?: string | null;
          type?: Database["public"]["Enums"]["notification_type_t"];
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_cents: number;
          id: string;
          method: Database["public"]["Enums"]["payment_method_t"];
          paid_at: string;
          reference: string | null;
          sale_id: string;
        };
        Insert: {
          amount_cents: number;
          id?: string;
          method: Database["public"]["Enums"]["payment_method_t"];
          paid_at?: string;
          reference?: string | null;
          sale_id: string;
        };
        Update: {
          amount_cents?: number;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method_t"];
          paid_at?: string;
          reference?: string | null;
          sale_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_business_id: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_business_id?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_business_id?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reserved_slugs: {
        Row: { slug: string };
        Insert: { slug: string };
        Update: { slug?: string };
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          name: string;
          qty: number;
          sale_id: string;
          service_id: string | null;
          staff_id: string | null;
          subtotal_cents: number;
          unit_price_cents: number;
        };
        Insert: {
          id?: string;
          name: string;
          qty?: number;
          sale_id: string;
          service_id?: string | null;
          staff_id?: string | null;
          subtotal_cents: number;
          unit_price_cents: number;
        };
        Update: {
          id?: string;
          name?: string;
          qty?: number;
          sale_id?: string;
          service_id?: string | null;
          staff_id?: string | null;
          subtotal_cents?: number;
          unit_price_cents?: number;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          appointment_id: string | null;
          business_id: string;
          cash_session_id: string | null;
          created_at: string;
          created_by: string | null;
          customer_id: string | null;
          discount_cents: number;
          id: string;
          notes: string | null;
          sale_type: Database["public"]["Enums"]["sale_type_t"];
          tip_cents: number;
          total_cents: number;
        };
        Insert: {
          appointment_id?: string | null;
          business_id: string;
          cash_session_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string | null;
          discount_cents?: number;
          id?: string;
          notes?: string | null;
          sale_type?: Database["public"]["Enums"]["sale_type_t"];
          tip_cents?: number;
          total_cents: number;
        };
        Update: {
          appointment_id?: string | null;
          business_id?: string;
          cash_session_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          customer_id?: string | null;
          discount_cents?: number;
          id?: string;
          notes?: string | null;
          sale_type?: Database["public"]["Enums"]["sale_type_t"];
          tip_cents?: number;
          total_cents?: number;
        };
        Relationships: [];
      };
      service_staff: {
        Row: { service_id: string; staff_id: string };
        Insert: { service_id: string; staff_id: string };
        Update: { service_id?: string; staff_id?: string };
        Relationships: [];
      };
      service_templates: {
        Row: {
          category: string;
          default_duration_minutes: number;
          default_price_cents: number;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          category: string;
          default_duration_minutes: number;
          default_price_cents: number;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          category?: string;
          default_duration_minutes?: number;
          default_price_cents?: number;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          buffer_minutes: number;
          business_id: string;
          category: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          price_cents: number;
          requires_staff_selection: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          buffer_minutes?: number;
          business_id: string;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          price_cents: number;
          requires_staff_selection?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          buffer_minutes?: number;
          business_id?: string;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          price_cents?: number;
          requires_staff_selection?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          bio: string | null;
          business_id: string;
          color: string | null;
          commission_pct: number | null;
          created_at: string;
          display_name: string;
          id: string;
          instagram: string | null;
          is_bookable: boolean;
          photo_url: string | null;
          role_label: string | null;
          sort_order: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          bio?: string | null;
          business_id: string;
          color?: string | null;
          commission_pct?: number | null;
          created_at?: string;
          display_name: string;
          id?: string;
          instagram?: string | null;
          is_bookable?: boolean;
          photo_url?: string | null;
          role_label?: string | null;
          sort_order?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          bio?: string | null;
          business_id?: string;
          color?: string | null;
          commission_pct?: number | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          instagram?: string | null;
          is_bookable?: boolean;
          photo_url?: string | null;
          role_label?: string | null;
          sort_order?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      staff_hours: {
        Row: {
          closes_at: string;
          created_at: string;
          day_of_week: number;
          id: string;
          is_closed: boolean;
          opens_at: string;
          staff_id: string;
        };
        Insert: {
          closes_at: string;
          created_at?: string;
          day_of_week: number;
          id?: string;
          is_closed?: boolean;
          opens_at: string;
          staff_id: string;
        };
        Update: {
          closes_at?: string;
          created_at?: string;
          day_of_week?: number;
          id?: string;
          is_closed?: boolean;
          opens_at?: string;
          staff_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      compute_customer_status: {
        Args: { p_last_visit: string; p_total_visits: number };
        Returns: Database["public"]["Enums"]["customer_status_t"];
      };
      current_business_id: { Args: never; Returns: string };
      current_business_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["business_role"];
      };
      has_role: {
        Args: { required: Database["public"]["Enums"]["business_role"] };
        Returns: boolean;
      };
      user_business_ids: { Args: never; Returns: string[] };
    };
    Enums: {
      appointment_source_t: "public" | "dashboard" | "walkin";
      appointment_status_t:
        | "requested"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show";
      business_role: "owner" | "receptionist" | "staff";
      cash_session_status_t: "open" | "closed";
      customer_status_t: "new" | "active" | "frequent" | "inactive";
      notification_status_t: "pending" | "sent" | "failed" | "cancelled";
      notification_type_t:
        | "reminder"
        | "birthday"
        | "retoque"
        | "campaign"
        | "system";
      payment_method_t: "cash" | "yape" | "plin" | "transfer" | "pos" | "other";
      sale_type_t: "appointment" | "walkin" | "product";
      subscription_status_t: "trial" | "active" | "past_due" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type BusinessRole = Database["public"]["Enums"]["business_role"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status_t"];
export type CustomerStatus = Database["public"]["Enums"]["customer_status_t"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method_t"];
export type CashSessionStatus =
  Database["public"]["Enums"]["cash_session_status_t"];
export type SaleType = Database["public"]["Enums"]["sale_type_t"];
