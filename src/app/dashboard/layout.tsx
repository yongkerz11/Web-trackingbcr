import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Package, Bell, Search } from 'lucide-react'
import { SidebarNav, MobileNav } from './nav-links'

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
          <SidebarNav />
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

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* MOBILE HEADER */}
        <header className="flex h-14 shrink-0 items-center justify-between bg-[#0B1220] px-4 lg:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">LogisticsPro</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-[#0B1220]" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* TOPBAR DESKTOP */}
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white/50 px-8 backdrop-blur-sm lg:flex sticky top-0 z-20">
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
        
        <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-[68px] items-center justify-around border-t border-gray-200 bg-white px-2 pb-safe pt-1 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] lg:hidden">
          <MobileNav />
        </nav>
      </div>
    </div>
  )
}
