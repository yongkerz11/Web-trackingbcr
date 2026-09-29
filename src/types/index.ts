import { Database } from './database.types'

export type Role = Database['public']['Enums']['user_role']
export type RecordStatus = Database['public']['Enums']['record_status']
export type VendorServiceType = Database['public']['Enums']['vendor_service_type']
export type LocationType = Database['public']['Enums']['location_type']

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: Role
  status: Database['public']['Enums']['user_status']
  created_at: string
  updated_at: string
}

export type Company = Database['public']['Tables']['companies']['Row']
export type Vendor = Database['public']['Tables']['vendors']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Recipient = Database['public']['Tables']['recipients']['Row']
