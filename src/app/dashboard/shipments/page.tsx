import { createClient } from '@/lib/supabase/server'
import { Search, Plus, MoreHorizontal, Package } from 'lucide-react'
import Link from 'next/link'

export default async function ShipmentsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const supabase = await createClient()

  let query = supabase
    .from('shipments')
    .select(`
      *,
      company:companies!company_id (company_name, tracking_identifier_type),
      recipient:recipients!recipient_id (name),
      destination:locations!destination_location_id (name, city)
    `)
    .order('created_at', { ascending: false })
  
  if (q) {
    query = query.or(`awb.ilike.%${q}%,no_dlv.ilike.%${q}%`)
  }

  const { data: shipments } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all shipments and waybills.</p>
        </div>
        <Link 
          href="/dashboard/shipments/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Shipment
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search AWB or No DLV..."
            className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Identifiers</th>
                <th className="px-6 py-4">Company & Recipient</th>
                <th className="px-6 py-4 hidden sm:table-cell">Destination</th>
                <th className="px-6 py-4 hidden sm:table-cell">Ship Date</th>
                <th className="px-6 py-4 hidden md:table-cell">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300 mb-2" />
                      <p>No shipments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shipments?.map((shipment: Record<string, unknown> | typeof shipments[0]) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{shipment.awb}</div>
                      {shipment.no_dlv && (
                        <div className="text-gray-400 text-xs mt-1">No DLV: {shipment.no_dlv}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{shipment.company?.company_name || '-'}</div>
                      <div className="text-gray-500 text-xs mt-1">{shipment.recipient?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="font-medium">{shipment.destination?.city || '-'}</div>
                      <div className="text-gray-400 text-xs mt-1">{shipment.destination?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {new Date(shipment.shipment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {shipment.current_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
