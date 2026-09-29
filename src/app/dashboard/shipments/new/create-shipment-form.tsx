'use client'

import { useState, useTransition, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createShipment } from '../actions'

import type { Database } from '@/types/database.types'

type Company = Database['public']['Tables']['companies']['Row']
type Recipient = Database['public']['Tables']['recipients']['Row']
type Location = Database['public']['Tables']['locations']['Row']

export function CreateShipmentForm({ 
  companies, 
  recipients, 
  locations 
}: { 
  companies: Pick<Company, 'id' | 'company_name' | 'tracking_identifier_type'>[] | null, 
  recipients: Pick<Recipient, 'id' | 'name'>[] | null, 
  locations: Pick<Location, 'id' | 'name' | 'city'>[] | null 
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createShipment(formData)
      if (result?.error) {
        // If the error contains 'new row violates row-level security', format it nicely
        if (result.error.includes('row-level security')) {
          setError('You do not have permission to create shipments. Only Operators and Admins can create shipments.')
        } else {
          setError(result.error)
        }
      } else {
        router.push('/dashboard/shipments')
      }
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        
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
            disabled={isPending}
            className="flex h-12 sm:h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Shipment'}
          </button>
        </div>
      </form>
    </div>
  )
}
