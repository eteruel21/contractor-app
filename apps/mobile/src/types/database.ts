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
      client_addresses: {
        Row: {
          address: string
          client_id: string
          company_id: string
          created_at: string
          district: string | null
          id: string
          is_primary: boolean
          label: string
          latitude: number | null
          longitude: number | null
          province: string | null
          reference: string | null
          township: string | null
          updated_at: string
        }
        Insert: {
          address: string
          client_id: string
          company_id: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          province?: string | null
          reference?: string | null
          township?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          client_id?: string
          company_id?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          province?: string | null
          reference?: string | null
          township?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_fk"
            columns: ["client_id", "company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_fk"
            columns: ["client_id", "company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          business_name: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          company_id: string
          created_at: string
          created_by: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          secondary_phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_name?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_id: string
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_name?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          company_id?: string
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          created_by: string
          currency_code: string
          email: string | null
          id: string
          invoice_prefix: string
          legal_name: string | null
          logo_url: string | null
          name: string
          payment_prefix: string
          phone: string | null
          project_prefix: string
          quotation_prefix: string
          receipt_prefix: string
          tax_id: string | null
          tax_rate: number
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          created_by: string
          currency_code?: string
          email?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          payment_prefix?: string
          phone?: string | null
          project_prefix?: string
          quotation_prefix?: string
          receipt_prefix?: string
          tax_id?: string | null
          tax_rate?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          created_by?: string
          currency_code?: string
          email?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          payment_prefix?: string
          phone?: string | null
          project_prefix?: string
          quotation_prefix?: string
          receipt_prefix?: string
          tax_id?: string | null
          tax_rate?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["company_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["company_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          company_id: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          company_id: string
          current_number: number
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          last_reset_year: number | null
          padding: number
          prefix: string
          updated_at: string
          yearly_reset: boolean
        }
        Insert: {
          company_id: string
          current_number?: number
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          last_reset_year?: number | null
          padding?: number
          prefix: string
          updated_at?: string
          yearly_reset?: boolean
        }
        Update: {
          company_id?: string
          current_number?: number
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          last_reset_year?: number | null
          padding?: number
          prefix?: string
          updated_at?: string
          yearly_reset?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "document_sequences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_member_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_company_user_fk"
            columns: ["company_id", "user_id"]
            isOneToOne: false
            referencedRelation: "company_members"
            referencedColumns: ["company_id", "user_id"]
          },
          {
            foreignKeyName: "project_members_project_fk"
            columns: ["project_id", "company_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end_date: string | null
          address_id: string | null
          budget_estimate: number
          client_id: string
          company_id: string
          contract_value: number
          created_at: string
          created_by: string | null
          description: string | null
          estimated_end_date: string | null
          id: string
          name: string
          progress_percentage: number
          project_code: string | null
          project_manager_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          address_id?: string | null
          budget_estimate?: number
          client_id: string
          company_id: string
          contract_value?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_end_date?: string | null
          id?: string
          name: string
          progress_percentage?: number
          project_code?: string | null
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          address_id?: string | null
          budget_estimate?: number
          client_id?: string
          company_id?: string
          contract_value?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_end_date?: string | null
          id?: string
          name?: string
          progress_percentage?: number
          project_code?: string | null
          project_manager_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_address_fk"
            columns: ["address_id", "client_id", "company_id"]
            isOneToOne: false
            referencedRelation: "client_addresses"
            referencedColumns: ["id", "client_id", "company_id"]
          },
          {
            foreignKeyName: "projects_client_fk"
            columns: ["client_id", "company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company: {
        Args: {
          company_email?: string
          company_name: string
          company_phone?: string
        }
        Returns: string
      }
      is_company_admin: {
        Args: { requested_company_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { requested_company_id: string }
        Returns: boolean
      }
      is_company_owner: {
        Args: { requested_company_id: string }
        Returns: boolean
      }
      next_document_number: {
        Args: {
          requested_company_id: string
          requested_document_type: Database["public"]["Enums"]["document_type"]
        }
        Returns: string
      }
    }
    Enums: {
      client_type: "person" | "business"
      company_role:
        | "owner"
        | "admin"
        | "member"
        | "supervisor"
        | "sales"
        | "estimator"
      document_type: "budget" | "invoice" | "receipt" | "project" | "payment"
      project_member_role: "manager" | "supervisor" | "worker" | "viewer"
      project_status:
        | "lead"
        | "inspection"
        | "quoted"
        | "approved"
        | "in_progress"
        | "paused"
        | "completed"
        | "cancelled"
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
    Enums: {
      client_type: ["person", "business"],
      company_role: [
        "owner",
        "admin",
        "member",
        "supervisor",
        "sales",
        "estimator",
      ],
      document_type: ["budget", "invoice", "receipt", "project", "payment"],
      project_member_role: ["manager", "supervisor", "worker", "viewer"],
      project_status: [
        "lead",
        "inspection",
        "quoted",
        "approved",
        "in_progress",
        "paused",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
