/**
 * Database types generated from the database schema
 * These types represent the structure of your Supabase database tables
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      daily_duas: {
        Row: {
          id: number
          date: number
          month: number
          library_id: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          date: number
          month: number
          library_id: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          date?: number
          month?: number
          library_id?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      data: {
        Row: {
          id: number
          key: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      library: {
        Row: {
          id: number
          name: string
          description: string | null
          audio_url: string | null
          pdf_url: string | null
          youtube_url: string | null
          album: string | null
          metadata: Json | null
          tags: string[] | null
          categories: string[] | null
          search_text: string | null
          search_vector: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          audio_url?: string | null
          pdf_url?: string | null
          youtube_url?: string | null
          album?: string | null
          metadata?: Json | null
          tags?: string[] | null
          categories?: string[] | null
          search_text?: string | null
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          audio_url?: string | null
          pdf_url?: string | null
          youtube_url?: string | null
          album?: string | null
          metadata?: Json | null
          tags?: string[] | null
          categories?: string[] | null
          search_text?: string | null
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      location: {
        Row: {
          id: number
          type: "city" | "state" | "country" | "region" | "spot" | "other"
          city: string
          country: string
          latitude: number
          longitude: number
          timezone: string
          state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          type: "city" | "state" | "country" | "region" | "spot" | "other"
          city: string
          country: string
          latitude: number
          longitude: number
          timezone: string
          state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          type?: "city" | "state" | "country" | "region" | "spot" | "other"
          city?: string
          country?: string
          latitude?: number
          longitude?: number
          timezone?: string
          state?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      miqaat: {
        Row: {
          id: number
          name: string
          description: string | null
          date: number | null
          month: number | null
          location: string | null
          type: string | null
          date_night: number | null
          month_night: number | null
          priority: number | null
          important: boolean | null
          phase: "DAY" | "NIGHT"
          created_at: string
          updated_at: string
          html: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          date?: number | null
          month?: number | null
          location?: string | null
          type?: string | null
          date_night?: number | null
          month_night?: number | null
          priority?: number | null
          important?: boolean | null
          phase?: "DAY" | "NIGHT"
          created_at?: string
          updated_at?: string
          html?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          date?: number | null
          month?: number | null
          location?: string | null
          type?: string | null
          date_night?: number | null
          month_night?: number | null
          priority?: number | null
          important?: boolean | null
          phase?: "DAY" | "NIGHT"
          created_at?: string
          updated_at?: string
          html?: string | null
        }
      }
      miqaat_library: {
        Row: {
          miqaat_id: number
          library_id: number
          assigned_at: string | null
        }
        Insert: {
          miqaat_id: number
          library_id: number
          assigned_at?: string | null
        }
        Update: {
          miqaat_id?: number
          library_id?: number
          assigned_at?: string | null
        }
      }
      tasbeeh: {
        Row: {
          id: number
          name: string
          text: string | null
          arabic_text: string | null
          image: string | null
          audio: string | null
          description: string | null
          count: number | null
          type: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          text?: string | null
          arabic_text?: string | null
          image?: string | null
          audio?: string | null
          description?: string | null
          count?: number | null
          type: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          text?: string | null
          arabic_text?: string | null
          image?: string | null
          audio?: string | null
          description?: string | null
          count?: number | null
          type?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user: {
        Row: {
          id: number
          created_at: string
          name: string | null
          phone_number: string | null
          country: string | null
          email: string | null
          unverfied_email: string | null
          roles: string[]
          status: string | null
        }
        Insert: {
          created_at?: string
          name?: string | null
          phone_number?: string | null
          country?: string | null
          email?: string | null
          unverfied_email?: string | null
          roles?: string[]
          status?: string | null
        }
        Update: {
          created_at?: string
          name?: string | null
          phone_number?: string | null
          country?: string | null
          email?: string | null
          unverfied_email?: string | null
          roles?: string[]
          status?: string | null
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
