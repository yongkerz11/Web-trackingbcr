import { createClient } from '@/lib/supabase/server'
import { Vendor } from '@/types'
import { Search, Plus, MoreHorizontal } from 'lucide-react'

export default async function VendorsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const supabase = await createClient()

  let query = supabase.from('vendors').select('*').order('created_at', { ascending: false })
  
  if (q) {
    query = query.or(`vendor_code.ilike.%${q}%,vendor_name.ilike.%${q}%,contact_person.ilike.%${q}%`)
  }

  const { data: vendors } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage external logistics and delivery partners.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search vendors..."
              className="h-9 w-full rounded-md border border-gray-300 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-white text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Vendor</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Service Type</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                vendors?.map((vendor: Vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                      <div className="text-gray-500">{vendor.vendor_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{vendor.contact_person || '-'}</div>
                      <div className="text-gray-400">{vendor.email || vendor.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {vendor.service_type?.replace('_', ' ') || '-'}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-700 ring-slate-200'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST VIEW */}
        <div className="md:hidden divide-y divide-gray-100">
          {vendors?.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              No vendors found.
            </div>
          ) : (
            vendors?.map((vendor: Vendor) => (
              <div key={vendor.id} className="block p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{vendor.vendor_name}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">{vendor.vendor_code}</div>
                  </div>
                  <button className="p-1 -mr-1 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                
                {vendor.contact_person && (
                  <div className="text-xs text-gray-700 mb-2">
                    {vendor.contact_person}
                    <span className="text-gray-400 block mt-0.5">{vendor.email || vendor.phone || ''}</span>
                  </div>
                )}
                
                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                    vendor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-700 ring-slate-200'
                  }`}>
                    {vendor.status}
                  </span>
                  {vendor.service_type && (
                    <span className="text-gray-500">{vendor.service_type.replace('_', ' ')}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
