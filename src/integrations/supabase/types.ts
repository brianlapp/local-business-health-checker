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
      agency_client_relationships: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string | null
          discovered_at: string | null
          id: string
          relationship_type: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          relationship_type?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          relationship_type?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          created_at: string | null
          id: string
          last_scan_run: string | null
          next_scheduled_scan: string | null
          scan_interval: string | null
          scanning_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_scan_run?: string | null
          next_scheduled_scan?: string | null
          scan_interval?: string | null
          scanning_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_scan_run?: string | null
          next_scheduled_scan?: string | null
          scan_interval?: string | null
          scanning_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          cms: string | null
          created_at: string | null
          gtmetrix_report_url: string | null
          gtmetrix_score: number | null
          id: string
          industry: string | null
          is_agency: boolean | null
          is_mobile_friendly: boolean | null
          last_checked: string | null
          last_gtmetrix_scan: string | null
          last_lighthouse_scan: string | null
          lighthouse_report_url: string | null
          lighthouse_score: number | null
          location: string | null
          name: string
          opportunity_calculated_at: string | null
          opportunity_score: number | null
          score: number | null
          speed_score: number | null
          status: string | null
          updated_at: string | null
          website: string
        }
        Insert: {
          cms?: string | null
          created_at?: string | null
          gtmetrix_report_url?: string | null
          gtmetrix_score?: number | null
          id?: string
          industry?: string | null
          is_agency?: boolean | null
          is_mobile_friendly?: boolean | null
          last_checked?: string | null
          last_gtmetrix_scan?: string | null
          last_lighthouse_scan?: string | null
          lighthouse_report_url?: string | null
          lighthouse_score?: number | null
          location?: string | null
          name: string
          opportunity_calculated_at?: string | null
          opportunity_score?: number | null
          score?: number | null
          speed_score?: number | null
          status?: string | null
          updated_at?: string | null
          website: string
        }
        Update: {
          cms?: string | null
          created_at?: string | null
          gtmetrix_report_url?: string | null
          gtmetrix_score?: number | null
          id?: string
          industry?: string | null
          is_agency?: boolean | null
          is_mobile_friendly?: boolean | null
          last_checked?: string | null
          last_gtmetrix_scan?: string | null
          last_lighthouse_scan?: string | null
          lighthouse_report_url?: string | null
          lighthouse_score?: number | null
          location?: string | null
          name?: string
          opportunity_calculated_at?: string | null
          opportunity_score?: number | null
          score?: number | null
          speed_score?: number | null
          status?: string | null
          updated_at?: string | null
          website?: string
        }
        Relationships: []
      }
      gtmetrix_usage: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string
          month: string
          reset_date: string | null
          scans_limit: number
          scans_used: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string
          month: string
          reset_date?: string | null
          scans_limit?: number
          scans_used?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string
          month?: string
          reset_date?: string | null
          scans_limit?: number
          scans_used?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      local_businesses: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          current_provider: string | null
          follow_up_date: string | null
          id: string
          improvement_opportunities: string[] | null
          last_contacted_at: string | null
          name: string
          notes: string | null
          potential_value: number | null
          status: string | null
          technology_stack: string[] | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          website_last_updated: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          current_provider?: string | null
          follow_up_date?: string | null
          id?: string
          improvement_opportunities?: string[] | null
          last_contacted_at?: string | null
          name: string
          notes?: string | null
          potential_value?: number | null
          status?: string | null
          technology_stack?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          website_last_updated?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          current_provider?: string | null
          follow_up_date?: string | null
          id?: string
          improvement_opportunities?: string[] | null
          last_contacted_at?: string | null
          name?: string
          notes?: string | null
          potential_value?: number | null
          status?: string | null
          technology_stack?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
          website_last_updated?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          client_name: string | null
          client_website: string | null
          contact_info: Json | null
          created_at: string | null
          currency: string | null
          description: string | null
          discovered_at: string | null
          follow_up_date: string | null
          id: string
          is_priority: boolean | null
          is_remote: boolean | null
          last_contact_at: string | null
          location: string | null
          notes: string | null
          proposal_sent_at: string | null
          score: number | null
          skills: string[] | null
          source: string
          source_id: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          client_name?: string | null
          client_website?: string | null
          contact_info?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discovered_at?: string | null
          follow_up_date?: string | null
          id?: string
          is_priority?: boolean | null
          is_remote?: boolean | null
          last_contact_at?: string | null
          location?: string | null
          notes?: string | null
          proposal_sent_at?: string | null
          score?: number | null
          skills?: string[] | null
          source: string
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          client_name?: string | null
          client_website?: string | null
          contact_info?: Json | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discovered_at?: string | null
          follow_up_date?: string | null
          id?: string
          is_priority?: boolean | null
          is_remote?: boolean | null
          last_contact_at?: string | null
          location?: string | null
          notes?: string | null
          proposal_sent_at?: string | null
          score?: number | null
          skills?: string[] | null
          source?: string
          source_id?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      outreach: {
        Row: {
          business_id: string | null
          email_status: string | null
          id: string
          last_contacted: string | null
        }
        Insert: {
          business_id?: string | null
          email_status?: string | null
          id?: string
          last_contacted?: string | null
        }
        Update: {
          business_id?: string | null
          email_status?: string | null
          id?: string
          last_contacted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          agency_id: string | null
          business_id: string | null
          content: string
          created_at: string | null
          id: string
          message_type: string
          opened_at: string | null
          opportunity_id: string | null
          replied_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          business_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          opened_at?: string | null
          opportunity_id?: string | null
          replied_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          business_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          opened_at?: string | null
          opportunity_id?: string | null
          replied_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "recruitment_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "local_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          highlights: string[] | null
          id: string
          image_url: string | null
          project_url: string | null
          tags: string[] | null
          technologies: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      proposal_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      recruitment_agencies: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contacted_at: string | null
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          specialty: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          specialty?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          specialty?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      scan_queue: {
        Row: {
          business_id: string | null
          completed_at: string | null
          created_at: string | null
          error: string | null
          id: string
          priority: string
          result: Json | null
          scan_type: string
          started_at: string | null
          status: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          priority?: string
          result?: Json | null
          scan_type: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          priority?: string
          result?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_queue_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_data: {
        Row: {
          created_at: string | null
          id: string
          opportunity_created: boolean | null
          processed: boolean | null
          processed_at: string | null
          raw_data: Json
          source: string
          source_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          opportunity_created?: boolean | null
          processed?: boolean | null
          processed_at?: string | null
          raw_data: Json
          source: string
          source_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          opportunity_created?: boolean | null
          processed?: boolean | null
          processed_at?: string | null
          raw_data?: Json
          source?: string
          source_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string
          full_name: string | null
          github_url: string | null
          headline: string | null
          hourly_rate: number | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          resume_url: string | null
          skills: string[] | null
          timezone: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          github_url?: string | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_all_businesses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      toggle_scanning_schedule: {
        Args: {
          enabled_param: boolean
        }
        Returns: boolean
      }
      update_next_scan_time: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
