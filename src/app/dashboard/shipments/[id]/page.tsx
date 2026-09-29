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

  return (
    <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/shipments" 
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
              {shipment.awb}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                {shipment.current_status}
              </span>
              <span>•</span>
              <span>Data Entry</span>
            </div>
            {shipment.no_dlv && (
              <div className="mt-2 text-sm text-gray-500">
                No DLV: {shipment.no_dlv}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        {/* Shipment Details */}
        <div className="space-y-4 md:space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-gray-100">Shipment</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Company / Shipper</dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.company?.company_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Recipient</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  <div className="font-semibold">{shipment.recipient?.name}</div>
                  <div className="text-gray-500 mt-0.5">{shipment.recipient?.phone}</div>
                </dd>
              </div>
              {/* Mock fields for relation & courier since DB lacks them */}
              <div>
                <dt className="text-gray-500">Relation</dt>
                <dd className="mt-1 font-medium text-gray-900">—</dd>
              </div>
              <div>
                <dt className="text-gray-500">Courier</dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.vendor?.vendor_name || '—'}</dd>
              </div>
            </dl>
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
