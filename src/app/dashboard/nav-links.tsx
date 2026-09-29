'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, MapPin, Package, Settings, ScanLine, Menu } from 'lucide-react'

export function SidebarNav() {
  const pathname = usePathname()

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
      ]
    },
    {
      title: 'Master Data',
      items: [
        { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
        { name: 'Vendors', href: '/dashboard/vendors', icon: Users },
        { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
        { name: 'Recipients', href: '/dashboard/recipients', icon: Users },
      ]
    }
  ]

  return (
    <>
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">{group.title}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href)
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive 
                    ? "flex items-center gap-3 rounded-lg bg-blue-600/10 px-3 py-2.5 text-sm font-medium text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent transition-colors"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
      <div>
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">System</p>
        <div className="space-y-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 cursor-not-allowed opacity-50 transition-colors border border-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </div>
      </div>
    </>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  const mobileItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
  ]

  return (
    <>
      {mobileItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href)
          
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive
              ? "flex flex-col items-center justify-center w-16 h-full gap-1 text-blue-600"
              : "flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-slate-900 transition-colors"
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}
      
      <div className="relative -top-4 flex flex-col items-center justify-center">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white transition-transform active:scale-95 opacity-50 cursor-not-allowed">
          <ScanLine className="h-5 w-5" />
        </button>
        <span className="text-[10px] font-medium text-slate-500 mt-1">Scan</span>
      </div>
      <Link href="/dashboard/companies" className="flex flex-col items-center justify-center w-16 h-full gap-1 text-slate-500 hover:text-slate-900 transition-colors">
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium">More</span>
      </Link>
    </>
  )
}
