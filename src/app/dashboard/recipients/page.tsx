import { createClient } from '@/lib/supabase/server'
import { Recipient } from '@/types'
import { Search, Plus, MoreHorizontal } from 'lucide-react'

export default async function RecipientsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q || ''
  const supabase = await createClient()

  let query = supabase.from('recipients').select('*').order('created_at', { ascending: false })
  
  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`)
  }

  const { data: recipients } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recipients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage shipment recipients.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Add Recipient
        </button>
      </div>

      <div className="flex items-center gap-4">
        <form className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search recipients..."
            className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 hidden sm:table-cell">City</th>
                <th className="px-6 py-4 hidden md:table-cell">Country</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipients?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No recipients found.
                  </td>
                </tr>
              ) : (
                recipients?.map((recipient: Recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{recipient.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{recipient.phone || '-'}</div>
                      <div className="text-gray-400">{recipient.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {recipient.city || '-'}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {recipient.country || '-'}
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
