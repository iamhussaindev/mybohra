/**
 * AUTO-GENERATED — DO NOT EDIT
 *
 * Source of truth: mybohra-dashboard/supabase/migrations/
 * Regenerate: cd mybohra-dashboard && npm run db:sync
 *
 * Generated: 2026-06-18T16:18:57.304Z
 */

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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      business: {
        Row: {
          address: string | null
          business_name: string
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          logo: string | null
          phone: string | null
          postal_code: string | null
          rating_average: number | null
          rating_count: number | null
          slug: string
          state: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          view_count: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          logo?: string | null
          phone?: string | null
          postal_code?: string | null
          rating_average?: number | null
          rating_count?: number | null
          slug: string
          state?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          view_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          logo?: string | null
          phone?: string | null
          postal_code?: string | null
          rating_average?: number | null
          rating_count?: number | null
          slug?: string
          state?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          view_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      business_category: {
        Row: {
          business_id: string
          category_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          business_id: string
          category_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          business_id?: string
          category_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_category_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_category_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      business_media: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          order: number | null
          type: string
          url: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order?: number | null
          type: string
          url: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          order?: number | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_media_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      business_review: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_review_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscription: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string
          business_id: string
          created_at: string | null
          end_date: string | null
          id: string
          plan_id: string
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle: string
          business_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string
          business_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_subscription_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscription_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      category: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order: number | null
          parent_id: string | null
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order?: number | null
          parent_id?: string | null
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order?: number | null
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_duas: {
        Row: {
          created_at: string
          date: number
          id: number
          library_id: number
          month: number
          note: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: number
          id?: number
          library_id: number
          month: number
          note?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: number
          id?: number
          library_id?: number
          month?: number
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_daus_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "library"
            referencedColumns: ["id"]
          },
        ]
      }
      data: {
        Row: {
          created_at: string
          id: number
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          app_version: string | null
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          device_id: string
          device_ip: unknown
          id: string
          last_seen_at: string | null
          location_updated_at: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          os_version: string | null
          platform: string | null
          platform_version: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          device_id: string
          device_ip?: unknown
          id?: string
          last_seen_at?: string | null
          location_updated_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          os_version?: string | null
          platform?: string | null
          platform_version?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          device_id?: string
          device_ip?: unknown
          id?: string
          last_seen_at?: string | null
          location_updated_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          os_version?: string | null
          platform?: string | null
          platform_version?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      library: {
        Row: {
          album: Database["public"]["Enums"]["album_enum"] | null
          audio_url: string | null
          categories: string[] | null
          created_at: string
          description: string | null
          id: number
          metadata: Json | null
          name: string
          pdf_url: string | null
          pdf_view_count: number | null
          search_text: string | null
          search_vector: unknown
          tags: string[] | null
          updated_at: string
          view_count: number | null
          youtube_id: number | null
          youtube_url: string | null
        }
        Insert: {
          album?: Database["public"]["Enums"]["album_enum"] | null
          audio_url?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: number
          metadata?: Json | null
          name: string
          pdf_url?: string | null
          pdf_view_count?: number | null
          search_text?: string | null
          search_vector?: unknown
          tags?: string[] | null
          updated_at?: string
          view_count?: number | null
          youtube_id?: number | null
          youtube_url?: string | null
        }
        Update: {
          album?: Database["public"]["Enums"]["album_enum"] | null
          audio_url?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: number
          metadata?: Json | null
          name?: string
          pdf_url?: string | null
          pdf_view_count?: number | null
          search_text?: string | null
          search_vector?: unknown
          tags?: string[] | null
          updated_at?: string
          view_count?: number | null
          youtube_id?: number | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_youtube_id_fkey"
            columns: ["youtube_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          city: string
          country: string
          created_at: string
          id: number
          latitude: number
          longitude: number
          state: string | null
          timezone: string
          type: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: number
          latitude: number
          longitude: number
          state?: string | null
          timezone: string
          type: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: number
          latitude?: number
          longitude?: number
          state?: string | null
          timezone?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      masjid: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          location_id: number | null
          map_link: string | null
          mazaar_id: string | null
          name: string
          photos: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: number | null
          map_link?: string | null
          mazaar_id?: string | null
          name: string
          photos?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: number | null
          map_link?: string | null
          mazaar_id?: string | null
          name?: string
          photos?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "masjid_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "masjid_mazaar_id_fkey"
            columns: ["mazaar_id"]
            isOneToOne: false
            referencedRelation: "mazaars"
            referencedColumns: ["id"]
          },
        ]
      }
      mazaar_musafirkhana: {
        Row: {
          created_at: string | null
          id: string
          mazaar_id: string
          musafirkhana_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mazaar_id: string
          musafirkhana_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mazaar_id?: string
          musafirkhana_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mazaar_musafirkhana_mazaar_id_fkey"
            columns: ["mazaar_id"]
            isOneToOne: false
            referencedRelation: "mazaars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mazaar_musafirkhana_musafirkhana_id_fkey"
            columns: ["musafirkhana_id"]
            isOneToOne: false
            referencedRelation: "musafirkhana"
            referencedColumns: ["id"]
          },
        ]
      }
      mazaar_ziyarat: {
        Row: {
          created_at: string | null
          id: string
          mazaar_id: string
          ziyarat_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mazaar_id: string
          ziyarat_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mazaar_id?: string
          ziyarat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mazaar_dai_duat_dai_duat_id_fkey"
            columns: ["ziyarat_id"]
            isOneToOne: false
            referencedRelation: "ziyarat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mazaar_dai_duat_mazaar_id_fkey"
            columns: ["mazaar_id"]
            isOneToOne: false
            referencedRelation: "mazaars"
            referencedColumns: ["id"]
          },
        ]
      }
      mazaars: {
        Row: {
          contact: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lat: number | null
          lng: number | null
          location_id: number | null
          name: string
          photos: string[] | null
          social_media: string[] | null
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_id?: number | null
          name: string
          photos?: string[] | null
          social_media?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_id?: number | null
          name?: string
          photos?: string[] | null
          social_media?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mazaars_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      miqaat: {
        Row: {
          created_at: string
          date: number | null
          date_night: number | null
          description: string | null
          html: string | null
          id: number
          image: string | null
          important: boolean | null
          location: string | null
          month: number | null
          month_night: number | null
          name: string
          phase: Database["public"]["Enums"]["phase_enum"]
          priority: number | null
          type: Database["public"]["Enums"]["miqaat_type_enum"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: number | null
          date_night?: number | null
          description?: string | null
          html?: string | null
          id?: number
          image?: string | null
          important?: boolean | null
          location?: string | null
          month?: number | null
          month_night?: number | null
          name: string
          phase?: Database["public"]["Enums"]["phase_enum"]
          priority?: number | null
          type?: Database["public"]["Enums"]["miqaat_type_enum"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: number | null
          date_night?: number | null
          description?: string | null
          html?: string | null
          id?: number
          image?: string | null
          important?: boolean | null
          location?: string | null
          month?: number | null
          month_night?: number | null
          name?: string
          phase?: Database["public"]["Enums"]["phase_enum"]
          priority?: number | null
          type?: Database["public"]["Enums"]["miqaat_type_enum"] | null
          updated_at?: string
        }
        Relationships: []
      }
      miqaat_library: {
        Row: {
          assigned_at: string | null
          library_id: number
          miqaat_id: number
        }
        Insert: {
          assigned_at?: string | null
          library_id: number
          miqaat_id: number
        }
        Update: {
          assigned_at?: string | null
          library_id?: number
          miqaat_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "miqaat_library_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miqaat_library_miqaat_id_fkey"
            columns: ["miqaat_id"]
            isOneToOne: false
            referencedRelation: "miqaat"
            referencedColumns: ["id"]
          },
        ]
      }
      miqaat_ziyarat: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          miqaat_id: number
          ziyarat_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          miqaat_id: number
          ziyarat_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          miqaat_id?: number
          ziyarat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miqaat_dai_duat_dai_duat_id_fkey"
            columns: ["ziyarat_id"]
            isOneToOne: false
            referencedRelation: "ziyarat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miqaat_dai_duat_miqaat_id_fkey"
            columns: ["miqaat_id"]
            isOneToOne: false
            referencedRelation: "miqaat"
            referencedColumns: ["id"]
          },
        ]
      }
      musafirkhana: {
        Row: {
          address: string | null
          city: string | null
          contact_person_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          info: string | null
          lat: number | null
          lng: number | null
          map_link: string | null
          name: string
          phone: string | null
          photos: string[] | null
          total_rooms: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          info?: string | null
          lat?: number | null
          lng?: number | null
          map_link?: string | null
          name: string
          phone?: string | null
          photos?: string[] | null
          total_rooms?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          info?: string | null
          lat?: number | null
          lng?: number | null
          map_link?: string | null
          name?: string
          phone?: string | null
          photos?: string[] | null
          total_rooms?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      nearby_places: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          mazaar_id: string
          name: string
          photos: string[] | null
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          mazaar_id: string
          name: string
          photos?: string[] | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          mazaar_id?: string
          name?: string
          photos?: string[] | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nearby_places_mazaar_id_fkey"
            columns: ["mazaar_id"]
            isOneToOne: false
            referencedRelation: "mazaars"
            referencedColumns: ["id"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number
          business_subscription_id: string
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          payment_gateway_id: string | null
          payment_method: string
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          business_subscription_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_gateway_id?: string | null
          payment_method: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          business_subscription_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payment_gateway_id?: string | null
          payment_method?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_business_subscription_id_fkey"
            columns: ["business_subscription_id"]
            isOneToOne: false
            referencedRelation: "business_subscription"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          business_id: string
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          is_product: boolean | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          business_id: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_product?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          business_id?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_product?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          attributes: Json | null
          colors: string[] | null
          compare_at_price: number | null
          created_at: string | null
          currency: string | null
          dimensions: Json | null
          id: string
          post_id: string
          price: number | null
          sizes: string[] | null
          sku: string | null
          stock_quantity: number | null
          stock_status: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          attributes?: Json | null
          colors?: string[] | null
          compare_at_price?: number | null
          created_at?: string | null
          currency?: string | null
          dimensions?: Json | null
          id?: string
          post_id: string
          price?: number | null
          sizes?: string[] | null
          sku?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          attributes?: Json | null
          colors?: string[] | null
          compare_at_price?: number | null
          created_at?: string | null
          currency?: string | null
          dimensions?: Json | null
          id?: string
          post_id?: string
          price?: number | null
          sizes?: string[] | null
          sku?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_details_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_events: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string | null
          creator_device_id: string | null
          event_type: Database["public"]["Enums"]["rsvp_event_type"]
          host_label: string
          host_mode: Database["public"]["Enums"]["rsvp_host_mode"]
          id: string
          linked_miqaat_id: number | null
          message: string | null
          scheduled_at: string
          slug: string
          title: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          creator_device_id?: string | null
          event_type: Database["public"]["Enums"]["rsvp_event_type"]
          host_label?: string
          host_mode: Database["public"]["Enums"]["rsvp_host_mode"]
          id?: string
          linked_miqaat_id?: number | null
          message?: string | null
          scheduled_at: string
          slug: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          creator_device_id?: string | null
          event_type?: Database["public"]["Enums"]["rsvp_event_type"]
          host_label?: string
          host_mode?: Database["public"]["Enums"]["rsvp_host_mode"]
          id?: string
          linked_miqaat_id?: number | null
          message?: string | null
          scheduled_at?: string
          slug?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_events_linked_miqaat_id_fkey"
            columns: ["linked_miqaat_id"]
            isOneToOne: false
            referencedRelation: "miqaat"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_responses: {
        Row: {
          created_at: string
          event_id: string
          guest_name: string | null
          headcount: number
          id: string
          responder_user_id: string | null
          status: Database["public"]["Enums"]["rsvp_response_status"]
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_name?: string | null
          headcount?: number
          id?: string
          responder_user_id?: string | null
          status: Database["public"]["Enums"]["rsvp_response_status"]
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_name?: string | null
          headcount?: number
          id?: string
          responder_user_id?: string | null
          status?: Database["public"]["Enums"]["rsvp_response_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "rsvp_events"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plan: {
        Row: {
          created_at: string | null
          description: string | null
          has_analytics: boolean | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          product_limit: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          has_analytics?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          product_limit?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          has_analytics?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          product_limit?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasbeeh: {
        Row: {
          arabic_text: string | null
          audio: string | null
          count: number | null
          created_at: string
          description: string | null
          id: number
          image: string | null
          name: string
          tags: string[] | null
          text: string | null
          type: Database["public"]["Enums"]["tasbeeh_type_enum"]
          updated_at: string
        }
        Insert: {
          arabic_text?: string | null
          audio?: string | null
          count?: number | null
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          name: string
          tags?: string[] | null
          text?: string | null
          type: Database["public"]["Enums"]["tasbeeh_type_enum"]
          updated_at?: string
        }
        Update: {
          arabic_text?: string | null
          audio?: string | null
          count?: number | null
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          name?: string
          tags?: string[] | null
          text?: string | null
          type?: Database["public"]["Enums"]["tasbeeh_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          id: number
          name: string | null
          phone_number: string | null
          roles: string[]
          status: string | null
          unverfied_email: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone_number?: string | null
          roles?: string[]
          status?: string | null
          unverfied_email?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone_number?: string | null
          roles?: string[]
          status?: string | null
          unverfied_email?: string | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          categories: string[] | null
          channel_handle: string | null
          channel_url: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: number
          library_id: number | null
          tags: string[] | null
          thumbnail: string | null
          thumbnail_default: string | null
          thumbnail_high: string | null
          thumbnail_maxres: string | null
          thumbnail_medium: string | null
          thumbnail_standard: string | null
          title: string
          updated_at: string
          upload_date: string | null
          url: string
          video_id: string
          view_count: number | null
        }
        Insert: {
          categories?: string[] | null
          channel_handle?: string | null
          channel_url?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: number
          library_id?: number | null
          tags?: string[] | null
          thumbnail?: string | null
          thumbnail_default?: string | null
          thumbnail_high?: string | null
          thumbnail_maxres?: string | null
          thumbnail_medium?: string | null
          thumbnail_standard?: string | null
          title: string
          updated_at?: string
          upload_date?: string | null
          url: string
          video_id: string
          view_count?: number | null
        }
        Update: {
          categories?: string[] | null
          channel_handle?: string | null
          channel_url?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: number
          library_id?: number | null
          tags?: string[] | null
          thumbnail?: string | null
          thumbnail_default?: string | null
          thumbnail_high?: string | null
          thumbnail_maxres?: string | null
          thumbnail_medium?: string | null
          thumbnail_standard?: string | null
          title?: string
          updated_at?: string
          upload_date?: string | null
          url?: string
          video_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "library"
            referencedColumns: ["id"]
          },
        ]
      }
      ziyarat: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          created_by: string | null
          history: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          photos: string[] | null
          rank: Database["public"]["Enums"]["dai_rank_enum"] | null
          updated_at: string | null
          updated_by: string | null
          year: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          history?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          photos?: string[] | null
          rank?: Database["public"]["Enums"]["dai_rank_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          history?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          photos?: string[] | null
          rank?: Database["public"]["Enums"]["dai_rank_enum"] | null
          updated_at?: string | null
          updated_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: { Args: { sql: string }; Returns: Json }
      get_distinct_albums:
        | {
            Args: never
            Returns: {
              album: string
              count: number
            }[]
          }
        | {
            Args: { filter_audio_only?: number }
            Returns: {
              album: string
              count: number
            }[]
          }
      get_library_items_for_date_month: {
        Args: { p_date: number; p_month: number }
        Returns: {
          description: string
          library_id: number
          name: string
          source: string
        }[]
      }
      get_next_location_id: { Args: never; Returns: number }
      increment_library_pdf_view_count: {
        Args: { p_id: number }
        Returns: undefined
      }
      increment_library_view_count: {
        Args: { p_id: number }
        Returns: undefined
      }
      increment_pdf_view_count: {
        Args: { library_id: number }
        Returns: undefined
      }
      search_library: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          album: string
          audio_url: string
          categories: string[]
          created_at: string
          description: string
          id: number
          metadata: Json
          name: string
          pdf_url: string
          search_text: string
          similarity: number
          tags: string[]
          updated_at: string
          youtube_url: string
        }[]
      }
      search_library_v1: {
        Args: {
          limit_results?: number
          offset_results?: number
          search_album?: Database["public"]["Enums"]["album_enum"]
          search_categories?: string[]
          search_query: string
          search_tags?: string[]
        }
        Returns: {
          album: Database["public"]["Enums"]["album_enum"]
          audio_url: string
          categories: string[]
          created_at: string
          description: string
          id: number
          match_type: string
          metadata: Json
          name: string
          pdf_url: string
          relevance_score: number
          tags: string[]
          updated_at: string
          youtube_id: number
          youtube_url: string
        }[]
      }
      search_youtube_videos: {
        Args: { limit_results?: number; search_query: string }
        Returns: {
          duration: number
          thumbnail: string
          thumbnail_default: string
          thumbnail_high: string
          thumbnail_maxres: string
          thumbnail_medium: string
          thumbnail_standard: string
          title: string
          video_id: string
          view_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      simple_search_library: {
        Args: { limit_results?: number; search_query: string }
        Returns: {
          description: string
          id: number
          name: string
          relevance_score: number
          tags: string[]
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      album_enum:
        | "MADEH"
        | "NOHA"
        | "SALAAM"
        | "ILTEJA"
        | "QURAN"
        | "DUA"
        | "MUNAJAAT"
        | "MANQABAT"
        | "NAAT"
        | "RASA"
        | "QASIDA"
        | "NASIHAT"
      dai_rank_enum:
        | "HUDUD_FOZALA"
        | "HINDUSTAN_DUAT_MUTLAQEEN"
        | "YEMEN_DUAT_MUTLAQEEN"
        | "ATABAAT_AALIYAH"
      miqaat_type_enum:
        | "URS"
        | "MILAD"
        | "WASHEQ"
        | "PEHLI_RAAT"
        | "SHAHADAT"
        | "ASHARA"
        | "IMPORTANT_NIGHT"
        | "EID"
        | "OTHER"
      phase_enum: "DAY" | "NIGHT"
      rsvp_event_type: "miqaat" | "darees" | "majlis" | "shadi" | "birthday"
      rsvp_host_mode: "jamaat" | "individual"
      rsvp_response_status: "yes" | "no" | "maybe"
      tasbeeh_type_enum: "MISC" | "DEENI" | "OTHER"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      album_enum: [
        "MADEH",
        "NOHA",
        "SALAAM",
        "ILTEJA",
        "QURAN",
        "DUA",
        "MUNAJAAT",
        "MANQABAT",
        "NAAT",
        "RASA",
        "QASIDA",
        "NASIHAT",
      ],
      dai_rank_enum: [
        "HUDUD_FOZALA",
        "HINDUSTAN_DUAT_MUTLAQEEN",
        "YEMEN_DUAT_MUTLAQEEN",
        "ATABAAT_AALIYAH",
      ],
      miqaat_type_enum: [
        "URS",
        "MILAD",
        "WASHEQ",
        "PEHLI_RAAT",
        "SHAHADAT",
        "ASHARA",
        "IMPORTANT_NIGHT",
        "EID",
        "OTHER",
      ],
      phase_enum: ["DAY", "NIGHT"],
      rsvp_event_type: ["miqaat", "darees", "majlis", "shadi", "birthday"],
      rsvp_host_mode: ["jamaat", "individual"],
      rsvp_response_status: ["yes", "no", "maybe"],
      tasbeeh_type_enum: ["MISC", "DEENI", "OTHER"],
    },
  },
} as const
