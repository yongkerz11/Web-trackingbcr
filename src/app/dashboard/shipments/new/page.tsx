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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/shipments" 
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Create Shipment</h1>
          <p className="mt-1 text-sm text-gray-500">Add a new shipment to the system.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-8">
          
          {/* Company & Identifiers */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Shipment Identity</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                  Company / Collaborator *
                </label>
                <select
                  id="company_id"
                  name="company_id"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                >
                  <option value="">Select recipient...</option>
                  {recipients?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Routing */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Routing</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="origin_location_id" className="block text-sm font-medium text-gray-700">
                  Origin *
                </label>
                <select
                  id="origin_location_id"
                  name="origin_location_id"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                >
                  <option value="">Select origin...</option>
                  {locations?.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="destination_location_id" className="block text-sm font-medium text-gray-700">
                  Destination *
                </label>
                <select
                  id="destination_location_id"
                  name="destination_location_id"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                >
                  <option value="">Select destination...</option>
                  {locations?.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Package Details */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Package Details</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="e.g. Electronics, Documents"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="package_count" className="block text-sm font-medium text-gray-700">
                  Package Count *
                </label>
                <input
                  type="number"
                  id="package_count"
                  name="package_count"
                  min="1"
                  defaultValue="1"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  step="0.01"
                  min="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Planning */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Schedule & Notes</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="shipment_date" className="block text-sm font-medium text-gray-700">
                  Shipment Date *
                </label>
                <input
                  type="date"
                  id="shipment_date"
                  name="shipment_date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  id="expected_delivery_date"
                  name="expected_delivery_date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link 
              href="/dashboard/shipments"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
            >
              Save Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
