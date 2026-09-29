import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Building2, Users, MapPin } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-bold tracking-tight text-gray-900">LogisticsPro</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Operations</p>
            <div className="mt-2 space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </div>
          </div>
          <div className="mb-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Master Data</p>
            <div className="mt-2 space-y-1">
              <Link href="/dashboard/companies" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Building2 className="h-5 w-5 text-gray-400" />
                Companies
              </Link>
              <Link href="/dashboard/vendors" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Users className="h-5 w-5 text-gray-400" />
                Vendors
              </Link>
              <Link href="/dashboard/locations" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <MapPin className="h-5 w-5 text-gray-400" />
                Locations
              </Link>
              <Link href="/dashboard/recipients" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Users className="h-5 w-5 text-gray-400" />
                Recipients
              </Link>
            </div>
          </div>
        </nav>
        <div className="border-t border-gray-200 p-4">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <LogOut className="h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <span className="text-lg font-bold tracking-tight text-gray-900">LogisticsPro</span>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
