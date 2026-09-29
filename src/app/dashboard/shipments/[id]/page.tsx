import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar } from 'lucide-react'

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
      vendor:vendors!vendor_id (vendor_name)
    `)
    .eq('id', params.id)
    .single()

  if (!shipment) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/shipments" 
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {shipment.awb}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {shipment.current_status}
              </span>
              <span>•</span>
              <span>Data Entry</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Identifiers & Parties */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Identifiers</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">AWB</dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.awb}</dd>
              </div>
              {shipment.no_dlv && (
                <div>
                  <dt className="text-gray-500">No DLV</dt>
                  <dd className="mt-1 font-medium text-gray-900">{shipment.no_dlv}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Parties</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Company / Collaborator</dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.company?.company_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Recipient</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  <div className="font-semibold">{shipment.recipient?.name}</div>
                  <div className="text-gray-500 mt-1">{shipment.recipient?.phone}</div>
                  <div className="text-gray-500 mt-1">
                    {shipment.recipient?.address && `${shipment.recipient.address}, `}
                    {shipment.recipient?.city}
                  </div>
                </dd>
              </div>
              {shipment.vendor && (
                <div>
                  <dt className="text-gray-500">External Vendor</dt>
                  <dd className="mt-1 font-medium text-gray-900">{shipment.vendor.vendor_name}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Routing & Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Routing</h2>
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-gray-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 h-2 w-2 rounded-full bg-gray-300 ring-4 ring-white" />
                <div className="text-sm font-medium text-gray-900">Origin</div>
                <div className="text-sm text-gray-500">{shipment.origin?.name} - {shipment.origin?.city}</div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div className="text-sm font-medium text-gray-900">Destination</div>
                <div className="text-sm text-gray-500">{shipment.destination?.name} - {shipment.destination?.city}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Package & Planning</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <dt className="flex items-center gap-2 text-gray-500">
                  <Package className="h-4 w-4" />
                  Description
                </dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.description || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Quantity</dt>
                <dd className="mt-1 font-medium text-gray-900">{shipment.package_count} package(s)</dd>
              </div>
              <div>
                <dt className="text-gray-500">Weight</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {shipment.weight ? `${shipment.weight} ${shipment.weight_unit}` : '-'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Shipment Date
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {new Date(shipment.shipment_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Expected Delivery
                </dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {shipment.expected_delivery_date ? new Date(shipment.expected_delivery_date).toLocaleDateString() : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Notes */}
        {shipment.notes && (
          <div className="col-span-1 md:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{shipment.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
