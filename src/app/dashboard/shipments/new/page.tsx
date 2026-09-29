import { createClient } from '@/lib/supabase/server'
import { createShipment } from '../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

  // Wrap the server action to handle redirect on success
  const handleSubmit = async (formData: FormData) => {
    'use server'
    const result = await createShipment(formData)
    if (result?.success) {
      redirect('/dashboard/shipments')
    }
    // Simple error handling could go here
  }

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

      <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Company & Identifiers */}
          <section>
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Shipment Identity</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                  Company / Collaborator *
                </label>
                <select
                  id="company_id"
                  name="company_id"
                  required
                  className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                >
                  <option value="">Select company...</option>
                  {companies?.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name} ({c.tracking_identifier_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="awb" className="block text-sm font-medium text-gray-700">
                  AWB *
                </label>
                <input
                  type="text"
                  id="awb"
                  name="awb"
                  required
                  placeholder="e.g. 3110190278971"
                  className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="no_dlv" className="block text-sm font-medium text-gray-700">
                  No DLV <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="no_dlv"
                  name="no_dlv"
                  placeholder="e.g. 0685/PR.DLV/08/2025"
                  className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="recipient_id" className="block text-sm font-medium text-gray-700">
                  Recipient *
                </label>
                <select
                  id="recipient_id"
                  name="recipient_id"
                  required
                  className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                >
                  <option value="">Select recipient...</option>
                  {recipients?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* MOCK RELATION & COURIER - Hidden Inputs for Required DB Fields */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="relation_name" className="block text-sm font-medium text-gray-700">
                Relation
              </label>
              <input
                type="text"
                id="relation_name"
                name="relation_name"
                placeholder="e.g. Staff/Pegawai"
                className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="courier_name" className="block text-sm font-medium text-gray-700">
                Courier
              </label>
              <input
                type="text"
                id="courier_name"
                name="courier_name"
                placeholder="e.g. NCS"
                className="mt-1.5 block w-full h-11 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* We must keep required DB fields as hidden inputs to prevent action failures */}
          {locations && locations.length > 0 && (
            <>
              <input type="hidden" name="origin_location_id" value={locations[0].id} />
              <input type="hidden" name="destination_location_id" value={locations[0].id} />
            </>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
            <Link 
              href="/dashboard/shipments"
              className="flex h-12 sm:h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors w-full sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex h-12 sm:h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors w-full sm:w-auto"
            >
              Save Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
