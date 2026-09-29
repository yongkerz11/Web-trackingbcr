import { createClient } from '@/lib/supabase/server'
import { Search, Plus, MoreHorizontal, Package, ChevronRight } from 'lucide-react'
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
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Shipments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage active shipments and shipment identifiers.</p>
        </div>
        <Link 
          href="/dashboard/shipments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Shipment
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search AWB, No DLV, company, recipient..."
              className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-white text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Identifiers</th>
                <th className="px-6 py-4 font-semibold">Company & Recipient</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Destination</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Ship Date</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-slate-100 p-3 mb-3">
                        <Package className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">No shipments found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or create a new shipment.</p>
                      <Link href="/dashboard/shipments/new" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        <Plus className="h-4 w-4" />
                        Create Shipment
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                shipments?.map((shipment: Record<string, unknown> | typeof shipments[0]) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{shipment.awb}</div>
                      {shipment.no_dlv && (
                        <div className="text-gray-500 text-xs mt-1">No DLV: {shipment.no_dlv}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{shipment.company?.company_name || '-'}</div>
                      <div className="text-gray-500 text-xs mt-1">{shipment.recipient?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="font-medium text-gray-900">{shipment.destination?.city || '-'}</div>
                      <div className="text-gray-500 text-xs mt-1">{shipment.destination?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {new Date(shipment.shipment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                        {shipment.current_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/dashboard/shipments/${shipment.id}`}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST VIEW */}
        <div className="md:hidden divide-y divide-gray-100">
          {shipments?.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-full bg-slate-100 p-3 mb-3">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No shipments found</h3>
                <p className="mt-1 text-xs text-gray-500">Try adjusting your search or create a new shipment.</p>
              </div>
            </div>
          ) : (
            shipments?.map((shipment: Record<string, unknown> | typeof shipments[0]) => (
              <Link key={shipment.id} href={`/dashboard/shipments/${shipment.id}`} className="block p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-gray-900">{shipment.awb}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">{shipment.company?.tracking_identifier_type || 'DE'}</div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    {shipment.current_status}
                  </span>
                </div>
                {shipment.no_dlv && (
                  <div className="text-xs text-gray-600 mb-2 font-medium">No DLV: {shipment.no_dlv}</div>
                )}
                <div className="text-xs text-gray-700 mb-1">{shipment.company?.company_name || '-'}</div>
                <div className="text-[11px] text-gray-500">{shipment.recipient?.name || '-'}</div>
                
                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1">
                    <span>{new Date(shipment.shipment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    Details <ChevronRight className="h-3 w-3 ml-0.5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
