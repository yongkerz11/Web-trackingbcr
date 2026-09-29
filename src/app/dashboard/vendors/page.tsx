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
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">Manage external logistics/delivery partners.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search vendors..."
            className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 hidden md:table-cell">Service Type</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        vendor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
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
