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
      budget_items: {
        Row: {
          budget_id: string
          calculation_run_id: string | null
          catalog_item_id: string | null
          company_id: string
          created_at: string
          description: string
          discount_percentage: number
          id: string
          item_type: Database["public"]["Enums"]["budget_item_type"]
          notes: string | null
          quantity: number
          section_id: string | null
          sort_order: number
          subtotal: number
          taxable: boolean
          unit_cost: number
          unit_name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          budget_id: string
          calculation_run_id?: string | null
          catalog_item_id?: string | null
          company_id: string
          created_at?: string
          description: string
          discount_percentage?: number
          id?: string
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          notes?: string | null
          quantity?: number
          section_id?: string | null
          sort_order?: number
          subtotal?: number
          taxable?: boolean
          unit_cost?: number
          unit_name?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          budget_id?: string
          calculation_run_id?: string | null
          catalog_item_id?: string | null
          company_id?: string
          created_at?: string
          description?: string
          discount_percentage?: number
          id?: string
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          notes?: string | null
          quantity?: number
          section_id?: string | null
          sort_order?: number
          subtotal?: number
          taxable?: boolean
          unit_cost?: number
          unit_name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_fk"
            columns: ["budget_id", "company_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "budget_items_catalog_item_fk"
            columns: ["catalog_item_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "budget_items_section_fk"
            columns: ["section_id", "budget_id", "company_id"]
            isOneToOne: false
            referencedRelation: "budget_sections"
            referencedColumns: ["id", "budget_id", "company_id"]
          },
        ]
      }
      budget_sections: {
        Row: {
          budget_id: string
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          budget_id: string
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          budget_id?: string
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_sections_budget_fk"
            columns: ["budget_id", "company_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      budget_versions: {
        Row: {
          budget_id: string
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          snapshot_data: Json
          version_number: number
        }
        Insert: {
          budget_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_data?: Json
          version_number: number
        }
        Update: {
          budget_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot_data?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_versions_budget_fk"
            columns: ["budget_id", "company_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          budget_number: string
          client_id: string
          company_id: string
          created_at: string
          created_by: string | null
          currency_code: string
          description: string | null
          discount_amount: number
          discount_type: Database["public"]["Enums"]["budget_discount_type"]
          discount_value: number
          id: string
          notes: string | null
          project_id: string
          status: Database["public"]["Enums"]["budget_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          terms: string | null
          title: string
          total: number
          updated_at: string
          valid_until: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          budget_number: string
          client_id: string
          company_id: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          discount_amount?: number
          discount_type?: Database["public"]["Enums"]["budget_discount_type"]
          discount_value?: number
          id?: string
          notes?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["budget_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          budget_number?: string
          client_id?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string
          description?: string | null
          discount_amount?: number
          discount_type?: Database["public"]["Enums"]["budget_discount_type"]
          discount_value?: number
          id?: string
          notes?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["budget_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          terms?: string | null
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_client_fk"
            columns: ["client_id", "company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "budgets_project_fk"
            columns: ["project_id", "company_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      catalog_categories: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_categories_parent_fk"
            columns: ["parent_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          active: boolean
          category_id: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          item_type: Database["public"]["Enums"]["catalog_item_type"]
          name: string
          sale_price: number
          sku: string | null
          unit_cost: number
          unit_id: string
          updated_at: string
          waste_percentage: number
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["catalog_item_type"]
          name: string
          sale_price?: number
          sku?: string | null
          unit_cost?: number
          unit_id: string
          updated_at?: string
          waste_percentage?: number
        }
        Update: {
          active?: boolean
          category_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["catalog_item_type"]
          name?: string
          sale_price?: number
          sku?: string | null
          unit_cost?: number
          unit_id?: string
          updated_at?: string
          waste_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_fk"
            columns: ["category_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "catalog_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_items_unit_fk"
            columns: ["unit_id", "company_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      catalog_price_history: {
        Row: {
          catalog_item_id: string
          changed_by: string | null
          company_id: string
          created_at: string
          effective_at: string
          id: string
          notes: string | null
          sale_price: number
          source: string | null
          unit_cost: number
        }
        Insert: {
          catalog_item_id: string
          changed_by?: string | null
          company_id: string
          created_at?: string
          effective_at?: string
          id?: string
          notes?: string | null
          sale_price: number
          source?: string | null
          unit_cost: number
        }
        Update: {
          catalog_item_id?: string
          changed_by?: string | null
          company_id?: string
          created_at?: string
          effective_at?: string
          id?: string
          notes?: string | null
          sale_price?: number
          source?: string | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_price_history_item_fk"
            columns: ["catalog_item_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      catalog_yields: {
        Row: {
          active: boolean
          catalog_item_id: string
          company_id: string
          created_at: string
          crew_size: number
          id: string
          labor_hours: number
          name: string
          notes: string | null
          output_quantity: number
          output_unit_id: string
          updated_at: string
          waste_percentage: number
        }
        Insert: {
          active?: boolean
          catalog_item_id: string
          company_id: string
          created_at?: string
          crew_size?: number
          id?: string
          labor_hours?: number
          name: string
          notes?: string | null
          output_quantity?: number
          output_unit_id: string
          updated_at?: string
          waste_percentage?: number
        }
        Update: {
          active?: boolean
          catalog_item_id?: string
          company_id?: string
          created_at?: string
          crew_size?: number
          id?: string
          labor_hours?: number
          name?: string
          notes?: string | null
          output_quantity?: number
          output_unit_id?: string
          updated_at?: string
          waste_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_yields_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_yields_item_fk"
            columns: ["catalog_item_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "catalog_yields_output_unit_fk"
            columns: ["output_unit_id", "company_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          role: Database["public"]["Enums"]["global_user_role"]
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          role?: Database["public"]["Enums"]["global_user_role"]
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          role?: Database["public"]["Enums"]["global_user_role"]
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
      supplier_prices: {
        Row: {
          catalog_item_id: string
          company_id: string
          created_at: string
          currency_code: string
          effective_date: string
          expires_at: string | null
          id: string
          notes: string | null
          price: number
          supplier_id: string
        }
        Insert: {
          catalog_item_id: string
          company_id: string
          created_at?: string
          currency_code?: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          price?: number
          supplier_id: string
        }
        Update: {
          catalog_item_id?: string
          company_id?: string
          created_at?: string
          currency_code?: string
          effective_date?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          price?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_prices_catalog_item_fk"
            columns: ["catalog_item_id", "company_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "supplier_prices_supplier_fk"
            columns: ["supplier_id", "company_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          company_id: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          company_id: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          company_id?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          active: boolean
          code: string
          company_id: string
          conversion_factor: number
          created_at: string
          id: string
          name: string
          symbol: string
          unit_type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          company_id: string
          conversion_factor?: number
          created_at?: string
          id?: string
          name: string
          symbol: string
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          company_id?: string
          conversion_factor?: number
          created_at?: string
          id?: string
          name?: string
          symbol?: string
          unit_type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      effective_platform_catalog_prices: {
        Row: {
          active: boolean | null
          category_name: string | null
          code: string | null
          default_sale_price: number | null
          default_unit_cost: number | null
          default_waste_percentage: number | null
          description: string | null
          has_override: boolean | null
          id: string | null
          item_type: Database["public"]["Enums"]["catalog_item_type"] | null
          name: string | null
          override_updated_at: string | null
          sale_price: number | null
          sku: string | null
          unit_cost: number | null
          unit_name: string | null
          unit_symbol: string | null
          updated_at: string | null
          waste_percentage: number | null
        }
        Relationships: []
      }
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
      create_project_budget: {
        Args: {
          budget_title?: string
          requested_company_id: string
          requested_project_id: string
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
      recalculate_budget_totals: {
        Args: { requested_budget_id: string; requested_company_id: string }
        Returns: undefined
      }
      reset_personal_catalog_pricing: {
        Args: { requested_item_id: string }
        Returns: undefined
      }
      seed_default_catalog: {
        Args: { requested_company_id: string }
        Returns: undefined
      }
      seed_default_units: {
        Args: { requested_company_id: string }
        Returns: undefined
      }
      set_personal_catalog_pricing: {
        Args: {
          requested_item_id: string
          requested_sale_price: number
          requested_unit_cost: number
          requested_waste_percentage: number
        }
        Returns: undefined
      }
    }
    Enums: {
      budget_discount_type: "none" | "percent" | "fixed"
      budget_item_type:
        | "material"
        | "labor"
        | "equipment"
        | "service"
        | "subcontract"
        | "manual"
      budget_status:
        | "draft"
        | "sent"
        | "viewed"
        | "approved"
        | "rejected"
        | "expired"
        | "cancelled"
      catalog_item_type:
        | "material"
        | "labor"
        | "equipment"
        | "service"
        | "subcontract"
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
      unit_type:
        | "length"
        | "area"
        | "volume"
        | "weight"
        | "unit"
        | "time"
        | "package"
        | "service"
      global_user_role: "super_admin" | "contractor" | "client"
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
      budget_discount_type: ["none", "percent", "fixed"],
      budget_item_type: [
        "material",
        "labor",
        "equipment",
        "service",
        "subcontract",
        "manual",
      ],
      budget_status: [
        "draft",
        "sent",
        "viewed",
        "approved",
        "rejected",
        "expired",
        "cancelled",
      ],
      catalog_item_type: [
        "material",
        "labor",
        "equipment",
        "service",
        "subcontract",
      ],
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
      unit_type: [
        "length",
        "area",
        "volume",
        "weight",
        "unit",
        "time",
        "package",
        "service",
      ],
    },
  },
} as const
