export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'VIEWER'
      user_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      record_status: 'ACTIVE' | 'INACTIVE'
      vendor_service_type: 'LAST_MILE' | 'AIR_CARGO' | 'SEA_CARGO' | 'LOCAL_DELIVERY' | 'OTHER'
      location_type: 'WAREHOUSE' | 'AIRPORT' | 'PORT' | 'VENDOR_LOCATION' | 'OTHER'
    }
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          status: Database['public']['Enums']['user_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          status?: Database['public']['Enums']['user_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          status?: Database['public']['Enums']['user_status']
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          company_code: string
          company_name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          status: Database['public']['Enums']['record_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_code: string
          company_name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_code?: string
          company_name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          vendor_code: string
          vendor_name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          service_type: Database['public']['Enums']['vendor_service_type'] | null
          status: Database['public']['Enums']['record_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_code: string
          vendor_name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          service_type?: Database['public']['Enums']['vendor_service_type'] | null
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_code?: string
          vendor_name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          service_type?: Database['public']['Enums']['vendor_service_type'] | null
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          type: Database['public']['Enums']['location_type'] | null
          address: string | null
          city: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          radius: number | null
          is_internal: boolean
          status: Database['public']['Enums']['record_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: Database['public']['Enums']['location_type'] | null
          address?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          radius?: number | null
          is_internal?: boolean
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: Database['public']['Enums']['location_type'] | null
          address?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          radius?: number | null
          is_internal?: boolean
          status?: Database['public']['Enums']['record_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipients: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          country: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
