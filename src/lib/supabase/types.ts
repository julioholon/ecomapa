export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type EcopointStatus = 'pending' | 'validated' | 'rejected'
export type DonationStatus = 'pending' | 'completed' | 'failed'

export interface Database {
  public: {
    Tables: {
      ecopoints: {
        Row: {
          id: string
          name: string
          description: string | null
          email: string
          location: unknown // PostGIS geography type
          category: string[]
          address: Json | null
          contact: Json | null
          images: string[] | null
          status: EcopointStatus
          owner_id: string | null
          validated_by: string | null
          validated_at: string | null
          imported_from: string | null
          imported_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          email: string
          location: unknown
          category: string[]
          address?: Json | null
          contact?: Json | null
          images?: string[] | null
          status?: EcopointStatus
          owner_id?: string | null
          validated_by?: string | null
          validated_at?: string | null
          imported_from?: string | null
          imported_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          email?: string
          location?: unknown
          category?: string[]
          address?: Json | null
          contact?: Json | null
          images?: string[] | null
          status?: EcopointStatus
          owner_id?: string | null
          validated_by?: string | null
          validated_at?: string | null
          imported_from?: string | null
          imported_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          slug?: string
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          ecopoint_id: string
          user_id: string
          amount: number
          payment_id: string | null
          status: DonationStatus
          created_at: string
        }
        Insert: {
          id?: string
          ecopoint_id: string
          user_id: string
          amount: number
          payment_id?: string | null
          status?: DonationStatus
          created_at?: string
        }
        Update: {
          id?: string
          ecopoint_id?: string
          user_id?: string
          amount?: number
          payment_id?: string | null
          status?: DonationStatus
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          ecopoint_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ecopoint_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ecopoint_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      user_reputation: {
        Row: {
          user_id: string
          points: number
          donations_count: number
          reviews_count: number
          badges: Json | null
          updated_at: string
        }
        Insert: {
          user_id: string
          points?: number
          donations_count?: number
          reviews_count?: number
          badges?: Json | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          points?: number
          donations_count?: number
          reviews_count?: number
          badges?: Json | null
          updated_at?: string
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
      ecopoint_status: EcopointStatus
      donation_status: DonationStatus
    }
  }
}

// Helper types
export type Ecopoint = Database['public']['Tables']['ecopoints']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type UserReputation = Database['public']['Tables']['user_reputation']['Row']
