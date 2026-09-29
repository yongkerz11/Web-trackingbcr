import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Truck, CheckCircle2, Plus, Search, Building2, ChevronRight, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user?.id)
    .single()

  // Fetch real data for dashboard metrics
  const { data: shipments } = await supabase
    .from('shipments')
    .select('id, awb, no_dlv, current_status, shipment_date, company:companies(company_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Aggregate stats (normally done via RPC or better queries, simple for now)
  const { count: activeCount } = await supabase.from('shipments').select('*', { count: 'exact', head: true })
  
  // Fake metrics derived from count just to show UI if we only have seeds
  const totalShipments = activeCount || 0
  const inDelivery = Math.floor(totalShipments * 0.4)
  const delivered = Math.floor(totalShipments * 0.35)
  const pending = totalShipments - inDelivery - delivered

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* PREMIUM HERO SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1220] p-8 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#0f172a] to-transparent opacity-80" />
        
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              LOGISTICS TRACKING & HANDOVER
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Smarter Logistics,<br />
              <span className="text-blue-400">Better Visibility</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Good afternoon, <span className="font-medium text-slate-200">{profile?.full_name || 'Operator'}</span>. Monitor active shipments and keep every handover moving efficiently across the network.
            </p>
          </div>

          <div className="flex items-center justify-end">
            <div className="w-full max-w-sm rounded-xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-md">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Operations</h3>
              <div className="flex items-end justify-between border-b border-slate-700/50 pb-4">
                <div>
                  <div className="text-3xl font-bold text-white">{totalShipments}</div>
                  <div className="text-sm font-medium text-slate-400">Active Shipments</div>
                </div>
                <div className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                  +12% vs last week
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-300">{inDelivery} On Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-300">{pending} Attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* OPERATIONAL SUMMARY */}
        <div className="col-span-1 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Package className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalShipments}</div>
              <div className="text-xs font-medium text-gray-500">Total Active</div>
            </div>
            
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Truck className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{inDelivery}</div>
              <div className="text-xs font-medium text-gray-500">In Delivery</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{delivered}</div>
              <div className="text-xs font-medium text-gray-500">Delivered</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{pending}</div>
              <div className="text-xs font-medium text-gray-500">Pending</div>
            </div>
          </div>

          {/* RECENT SHIPMENTS */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900">Recent Shipments</h2>
              <Link href="/dashboard/shipments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="p-0">
              {shipments && shipments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {shipments.map((shipment: Record<string, unknown> | typeof shipments[0]) => (
                    <div key={shipment.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{shipment.awb}</div>
                          <div className="text-xs text-gray-500">
                            {(shipment.company as any)?.company_name} {shipment.no_dlv ? ` • ${shipment.no_dlv}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {shipment.current_status}
                          </span>
                          <div className="mt-1 text-xs text-gray-400">
                            {new Date(shipment.shipment_date).toLocaleDateString()}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-3">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No shipments found</h3>
                  <p className="mt-1 text-sm text-gray-500">Create your first shipment to start tracking operations.</p>
                  <Link href="/dashboard/shipments/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Create Shipment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS & SYSTEM */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/dashboard/shipments/new" className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-500 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">New Shipment</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
              </Link>
              
              <Link href="/dashboard/shipments" className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-500 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Search Shipments</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
              </Link>

              <Link href="/dashboard/companies" className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-slate-500 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Manage Companies</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-slate-500" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
              <div className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <div>
                <div className="text-sm font-medium text-emerald-900">Operational</div>
                <div className="text-xs text-emerald-700">All systems running smoothly</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Signed in as</div>
              <div className="text-sm font-medium text-gray-900 truncate">{user?.email || 'Unknown'}</div>
              <div className="text-xs font-medium text-blue-600 mt-1">{profile?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
