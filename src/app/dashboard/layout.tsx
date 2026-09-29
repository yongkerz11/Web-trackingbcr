import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Building2, Users, MapPin, Package, Settings, Bell, Search } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="hidden w-[260px] flex-col border-r border-[#1E293B] bg-[#0B1220] md:flex">
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LogisticsPro</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6 scrollbar-none">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Operations</p>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-blue-600/10 px-3 py-2.5 text-sm font-medium text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/dashboard/shipments" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                <Package className="h-4 w-4" />
                Shipments
              </Link>
            </div>
          </div>
          
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Master Data</p>
            <div className="space-y-1">
              <Link href="/dashboard/companies" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                <Building2 className="h-4 w-4" />
                Companies
              </Link>
              <Link href="/dashboard/vendors" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                <Users className="h-4 w-4" />
                Vendors
              </Link>
              <Link href="/dashboard/locations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                <MapPin className="h-4 w-4" />
                Locations
              </Link>
              <Link href="/dashboard/recipients" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors">
                <Users className="h-4 w-4" />
                Recipients
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">System</p>
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 cursor-not-allowed opacity-50 transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </div>
            </div>
          </div>
        </nav>
        
        <div className="border-t border-[#1E293B] p-4 bg-[#0B1220]">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-300 ring-1 ring-slate-700">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-200">{profile?.full_name || user.email}</p>
              <p className="truncate text-xs text-slate-500">{profile?.role}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* MOBILE HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between bg-[#0B1220] px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LogisticsPro</span>
          </div>
          <button className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </header>

        {/* TOPBAR DESKTOP */}
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/50 px-8 backdrop-blur-sm md:flex">
          <div className="flex max-w-md flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20">
            <Search className="h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search AWB, No DLV, company, recipient..." 
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
