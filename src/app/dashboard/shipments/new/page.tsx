import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CreateShipmentForm } from './create-shipment-form'

export default async function NewShipmentPage() {
  const supabase = await createClient()

  // Fetch master data for dropdowns
  const [
    { data: companies },
    { data: recipients },
    { data: locations }
  ] = await Promise.all([
    supabase.from('companies').select('id, company_name, tracking_identifier_type').eq('status', 'ACTIVE'),
    supabase.from('recipients').select('id, name'),
    supabase.from('locations').select('id, name, city').eq('status', 'ACTIVE')
  ])

  return (
    <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/shipments" 
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Create Shipment</h1>
          <p className="mt-0.5 text-xs md:text-sm text-gray-500">Add a new shipment to the system.</p>
        </div>
      </div>

      <CreateShipmentForm 
        companies={companies}
        recipients={recipients}
        locations={locations}
      />
    </div>
  )
}
