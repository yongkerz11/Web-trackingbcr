import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { TrackingTimeline, AddTrackingEventForm } from './tracking-ui'

export default async function ShipmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: shipment } = await supabase
    .from('shipments')
    .select(`
      *,
      company:companies!company_id (company_name, tracking_identifier_type),
      recipient:recipients!recipient_id (name, phone, address, city),
      origin:locations!origin_location_id (name, city),
      destination:locations!destination_location_id (name, city),
      vendor:vendors!vendor_id (vendor_name),
      tracking_events (*, location:locations!location_id (name))
    `)
    .eq('id', params.id)
    .single()
    
  const { data: locations } = await supabase.from('locations').select('id, name').order('name')

  if (!shipment) {
    notFound()
  }

  // Find latest event for Current Tracking State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestEvent = shipment.tracking_events?.sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]

  return (
    <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
      {/* MOBILE-FIRST HEADER */}
      <div className="flex items-start md:items-center gap-3">
        <Link 
          href="/dashboard/shipments" 
          className="mt-0.5 md:mt-0 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
            {shipment.awb}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] md:text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20 uppercase tracking-wider">
              {shipment.current_status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[1fr_400px]">
        {/* MAIN COLUMN */}
        <div className="space-y-4 md:space-y-6">
          
          {/* CURRENT TRACKING STATE */}
          <div className="rounded-xl border border-gray-200 bg-blue-50/30 p-4 md:p-5 shadow-sm">
            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">Current Tracking State</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="font-semibold text-gray-900 text-sm">{shipment.current_status}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                <div className="font-semibold text-gray-900 text-sm">
                  {latestEvent ? new Date(latestEvent.timestamp).toLocaleString() : new Date(shipment.shipment_date).toLocaleString()}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">Station</div>
                <div className="font-semibold text-gray-900 text-sm">{latestEvent?.station || latestEvent?.location?.name || 'System'}</div>
              </div>
            </div>
          </div>

          {/* SHIPMENT IDENTITY */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Shipment Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">AWB</div>
                <div className="font-semibold text-gray-900">{shipment.awb}</div>
              </div>
              {shipment.no_dlv && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">No DLV</div>
                  <div className="font-semibold text-gray-900">{shipment.no_dlv}</div>
                </div>
              )}
              <div className="sm:col-span-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Company</div>
                <div className="font-semibold text-gray-900 uppercase">{shipment.company?.company_name}</div>
              </div>
              <div className="sm:col-span-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Recipient</div>
                <div className="font-semibold text-gray-900 uppercase">{shipment.recipient?.name}</div>
                {shipment.recipient?.phone && <div className="text-gray-500 text-xs mt-0.5">{shipment.recipient.phone}</div>}
              </div>
            </div>
          </div>

        </div>

        {/* Tracking Engine UI */}
        <div className="space-y-4 md:space-y-6">
          <TrackingTimeline events={shipment.tracking_events || []} />
          
          <AddTrackingEventForm 
            shipmentId={shipment.id} 
            currentStatus={shipment.current_status} 
            locations={locations || []} 
          />
        </div>
      </div>
    </div>
  )
}
