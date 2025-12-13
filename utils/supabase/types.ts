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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'super_admin'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      event_categories: {
        Row: {
          id: number
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          is_active?: boolean
          updated_at?: string
        }
      }

      events: {
        Row: {
          id: string
          // Basic Information
          title: string
          description: string | null
          
          // Date & Time
          event_date: string | null
          event_time: string | null
          
          // Event Details - UPDATED: category_id instead of category
          category_id: number | null
          custom_category: string | null
          organizer: string | null
          location: string | null
          
          // Media & Assets
          cover_image_url: string | null
          
          // Event Configuration
          max_photos: number
          expected_attendees: number | null
          allow_photo_upload: boolean
          is_public: boolean
          is_active: boolean
          
          // Security & Tracking
          ip_address: string | null
          
          // Ownership - UPDATED: can be null due to ON DELETE SET NULL
          created_by: string | null
          
          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          // Basic Information
          title: string
          description?: string | null
          
          // Date & Time
          event_date?: string | null
          event_time?: string | null
          
          // Event Details - UPDATED
          category_id?: number | null
          custom_category?: string | null
          organizer?: string | null
          location?: string | null
          
          // Media & Assets
          cover_image_url?: string | null
          
          // Event Configuration
          max_photos?: number
          expected_attendees?: number | null
          allow_photo_upload?: boolean
          is_public?: boolean
          is_active?: boolean
          
          // Security & Tracking
          ip_address?: string | null
          
          // Ownership - UPDATED
          created_by?: string | null
          
          // Timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          category_id?: number | null  // UPDATED
          custom_category?: string | null
          organizer?: string | null
          location?: string | null
          cover_image_url?: string | null
          max_photos?: number
          expected_attendees?: number | null
          allow_photo_upload?: boolean
          is_public?: boolean
          is_active?: boolean
          ip_address?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_category_id_fkey"  // NEW RELATIONSHIP
            columns: ["category_id"]
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      
      event_codes: {
        Row: {
          id: string
          event_id: string | null  // UPDATED: can be null due to ON DELETE SET NULL
          code: string
          qr_code_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null  // UPDATED
          code: string
          qr_code_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null  // UPDATED
          code?: string
          qr_code_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_codes_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
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