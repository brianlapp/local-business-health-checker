
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          website: string
          score: number | null
          cms: string | null
          speed_score: number | null
          last_checked: string | null
        }
        Insert: {
          id?: string
          name: string
          website: string
          score?: number | null
          cms?: string | null
          speed_score?: number | null
          last_checked?: string | null
        }
        Update: {
          id?: string
          name?: string
          website?: string
          score?: number | null
          cms?: string | null
          speed_score?: number | null
          last_checked?: string | null
        }
      }
      outreach: {
        Row: {
          id: string
          business_id: string | null
          email_status: string | null
          last_contacted: string | null
        }
        Insert: {
          id?: string
          business_id?: string | null
          email_status?: string | null
          last_contacted?: string | null
        }
        Update: {
          id?: string
          business_id?: string | null
          email_status?: string | null
          last_contacted?: string | null
        }
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
  }
}
