export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          gps_accuracy: number | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          metadata: Json | null
          recipients: Json | null
          status: string
          trial_signup_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          gps_accuracy?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          metadata?: Json | null
          recipients?: Json | null
          status?: string
          trial_signup_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          gps_accuracy?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          metadata?: Json | null
          recipients?: Json | null
          status?: string
          trial_signup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_logs_trial_signup_id_fkey"
            columns: ["trial_signup_id"]
            isOneToOne: false
            referencedRelation: "trial_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          nombre: string
          parentesco: string
          telefono: string
          trial_signup_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          parentesco: string
          telefono: string
          trial_signup_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          parentesco?: string
          telefono?: string
          trial_signup_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trial_signups: {
        Row: {
          created_at: string
          direccion: string | null
          email: string
          id: string
          last_payment_at: string | null
          nombre: string
          onboarding_completed: boolean
          payment_status: string
          periodo: string
          plan: string
          purchase_mode: string
          renewal_date: string | null
          subscription_status: string
          telefono: string
          trial_active: boolean
          trial_end: string
          updated_at: string
          webpay_amount: number | null
          webpay_authorization_code: string | null
          webpay_buy_order: string | null
          webpay_environment: string | null
          webpay_response_code: number | null
          webpay_session_id: string | null
          webpay_token: string | null
          whatsapp_activated: boolean
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email: string
          id?: string
          last_payment_at?: string | null
          nombre: string
          onboarding_completed?: boolean
          payment_status?: string
          periodo?: string
          plan?: string
          purchase_mode?: string
          renewal_date?: string | null
          subscription_status?: string
          telefono: string
          trial_active?: boolean
          trial_end?: string
          updated_at?: string
          webpay_amount?: number | null
          webpay_authorization_code?: string | null
          webpay_buy_order?: string | null
          webpay_environment?: string | null
          webpay_response_code?: number | null
          webpay_session_id?: string | null
          webpay_token?: string | null
          whatsapp_activated?: boolean
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string
          id?: string
          last_payment_at?: string | null
          nombre?: string
          onboarding_completed?: boolean
          payment_status?: string
          periodo?: string
          plan?: string
          purchase_mode?: string
          renewal_date?: string | null
          subscription_status?: string
          telefono?: string
          trial_active?: boolean
          trial_end?: string
          updated_at?: string
          webpay_amount?: number | null
          webpay_authorization_code?: string | null
          webpay_buy_order?: string | null
          webpay_environment?: string | null
          webpay_response_code?: number | null
          webpay_session_id?: string | null
          webpay_token?: string | null
          whatsapp_activated?: boolean
        }
        Relationships: []
      }
      user_pins: {
        Row: {
          created_at: string
          pin_hash: string
          trial_signup_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          pin_hash: string
          trial_signup_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          pin_hash?: string
          trial_signup_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      webpay_transactions: {
        Row: {
          amount: number
          authorization_code: string | null
          buy_order: string
          card_last4: string | null
          created_at: string
          environment: string
          id: string
          payment_type_code: string | null
          raw_response: Json | null
          response_code: number | null
          session_id: string | null
          status: string
          token: string | null
          trial_signup_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          buy_order: string
          card_last4?: string | null
          created_at?: string
          environment?: string
          id?: string
          payment_type_code?: string | null
          raw_response?: Json | null
          response_code?: number | null
          session_id?: string | null
          status?: string
          token?: string | null
          trial_signup_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          buy_order?: string
          card_last4?: string | null
          created_at?: string
          environment?: string
          id?: string
          payment_type_code?: string | null
          raw_response?: Json | null
          response_code?: number | null
          session_id?: string | null
          status?: string
          token?: string | null
          trial_signup_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webpay_transactions_trial_signup_id_fkey"
            columns: ["trial_signup_id"]
            isOneToOne: false
            referencedRelation: "trial_signups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
