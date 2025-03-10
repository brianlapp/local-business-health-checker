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
      businesses: {
        Row: {
          cms: string | null
          gtmetrix_report_url: string | null
          gtmetrix_score: number | null
          id: string
          last_checked: string | null
          last_gtmetrix_scan: string | null
          last_lighthouse_scan: string | null
          lighthouse_report_url: string | null
          lighthouse_score: number | null
          name: string
          score: number | null
          speed_score: number | null
          website: string
        }
        Insert: {
          cms?: string | null
          gtmetrix_report_url?: string | null
          gtmetrix_score?: number | null
          id?: string
          last_checked?: string | null
          last_gtmetrix_scan?: string | null
          last_lighthouse_scan?: string | null
          lighthouse_report_url?: string | null
          lighthouse_score?: number | null
          name: string
          score?: number | null
          speed_score?: number | null
          website: string
        }
        Update: {
          cms?: string | null
          gtmetrix_report_url?: string | null
          gtmetrix_score?: number | null
          id?: string
          last_checked?: string | null
          last_gtmetrix_scan?: string | null
          last_lighthouse_scan?: string | null
          lighthouse_report_url?: string | null
          lighthouse_score?: number | null
          name?: string
          score?: number | null
          speed_score?: number | null
          website?: string
        }
        Relationships: []
      }
      gtmetrix_usage: {
        Row: {
          id: string
          last_updated: string
          month: string
          scans_limit: number
          scans_used: number
        }
        Insert: {
          id?: string
          last_updated?: string
          month: string
          scans_limit?: number
          scans_used?: number
        }
        Update: {
          id?: string
          last_updated?: string
          month?: string
          scans_limit?: number
          scans_used?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
