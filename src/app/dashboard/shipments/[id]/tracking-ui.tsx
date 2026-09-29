'use client'

import { useState, useTransition, FormEvent } from 'react'
import { CheckCircle2, Clock, Package, Plane, RotateCcw, Truck } from 'lucide-react'
import { createTrackingEvent } from '../actions'
import type { Database } from '@/types/database.types'

import type { LucideIcon } from 'lucide-react'

type TrackingEvent = Database['public']['Tables']['tracking_events']['Row'] & { location?: { name: string } | null }
type Location = Pick<Database['public']['Tables']['locations']['Row'], 'id' | 'name'>

const STATUS_CONFIG: Record<string, { label: string, icon: LucideIcon, color: string }> = {
  'DE': { label: 'Data Entry', icon: Clock, color: 'text-slate-400 bg-slate-100 border-slate-200' },
  'ST': { label: 'Warehouse', icon: Package, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  'AR': { label: 'Arrival at Airport', icon: Plane, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  'OD': { label: 'On Delivery', icon: Truck, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  'OK': { label: 'Successfully Delivered', icon: CheckCircle2, color: 'text-green-500 bg-green-50 border-green-200' },
  'RT': { label: 'Return', icon: RotateCcw, color: 'text-red-500 bg-red-50 border-red-200' },
}

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  if (!events || events.length === 0) return null

  // Sort events newest first
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
      <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Tracking History</h2>
      <div className="relative space-y-0 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
        {sortedEvents.map((event, index) => {
          const config = STATUS_CONFIG[event.status] || STATUS_CONFIG['DE']
          const isLatest = index === 0

          return (
            <div key={event.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white shrink-0 z-10 ${isLatest ? config.color.split(' ')[0] : 'text-gray-400 border-gray-300'}`} style={{ borderColor: isLatest && config.color.includes('border-') ? 'currentColor' : '' }}>
                <div className={`w-2 h-2 rounded-full ${isLatest ? config.color.replace('text-', 'bg-').split(' ')[0] : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold text-sm ${isLatest ? config.color.split(' ')[0] : 'text-gray-700'}`}>{config.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isLatest ? config.color : 'bg-gray-100 text-gray-500'}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                  {(event.station || event.location?.name) && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 text-center text-gray-300">├</span>
                      <span className="font-medium text-gray-700">{event.station || event.location?.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 text-center text-gray-300">├</span>
                    <span>{new Date(event.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {event.comment && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <span className="w-3 text-center text-gray-300">└</span>
                      <span className="text-gray-600">{event.comment}</span>
                    </div>
                  )}
                </div>
                
                {(event.reason_code || event.reason_note) && (
                  <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100 ml-4.5">
                    {event.reason_code && <span className="font-semibold block">Code: {event.reason_code}</span>}
                    {event.reason_note && <span>{event.reason_note}</span>}
                  </div>
                )}
                
                {(event.photo_url || event.signature_url) && (
                  <div className="mt-2 flex gap-2 overflow-x-auto ml-4.5">
                    {event.photo_url && (
                      <div className="relative group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={event.photo_url} alt="Proof" className="h-14 w-14 object-cover rounded border border-gray-200" />
                      </div>
                    )}
                    {event.signature_url && (
                      <div className="relative group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={event.signature_url} alt="Signature" className="h-14 w-14 object-contain bg-white rounded border border-gray-200" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AddTrackingEventForm({ shipmentId, currentStatus, locations }: { shipmentId: string, currentStatus: string, locations: Location[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  // Determine allowed next statuses
  const nextStatuses = []
  if (currentStatus === 'DE') nextStatuses.push('ST')
  if (currentStatus === 'ST') nextStatuses.push('AR')
  if (currentStatus === 'AR') nextStatuses.push('OD')
  if (currentStatus === 'OD') {
    nextStatuses.push('OK')
    nextStatuses.push('RT')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('shipment_id', shipmentId)

    startTransition(async () => {
      const result = await createTrackingEvent(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setStatus('')
        // Reset form
        form.reset()
      }
    })
  }

  if (nextStatuses.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm mt-6">
      <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Add Tracking Update</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Next Status *</label>
            <select
              id="status"
              name="status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              {nextStatuses.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label} ({s})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700">Date & Time *</label>
            <input
              type="datetime-local"
              id="timestamp"
              name="timestamp"
              required
              defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Fields based on status */}
        {status && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">Location</label>
                <select
                  id="location_id"
                  name="location_id"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Location (Optional)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="station" className="block text-sm font-medium text-gray-700">Station / Detail</label>
                <input
                  type="text"
                  id="station"
                  name="station"
                  placeholder="e.g. Mataram Ncs"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
              <input
                type="text"
                id="comment"
                name="comment"
                placeholder="Optional notes about this update"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {status === 'RT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50/50 p-4 rounded-lg border border-red-100">
                <div>
                  <label htmlFor="reason_code" className="block text-sm font-medium text-red-900">Reason Code *</label>
                  <input
                    type="text"
                    id="reason_code"
                    name="reason_code"
                    required
                    placeholder="e.g. R01"
                    className="mt-1 block w-full rounded-md border border-red-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="reason_note" className="block text-sm font-medium text-red-900">Reason Note</label>
                  <input
                    type="text"
                    id="reason_note"
                    name="reason_note"
                    placeholder="e.g. Address not found"
                    className="mt-1 block w-full rounded-md border border-red-300 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            {(status === 'OK' || status === 'AR') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    placeholder="e.g. -8.6167812"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    placeholder="e.g. 116.1169707"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {status === 'OK' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700">Photo URL</label>
                  <input
                    type="url"
                    id="photo_url"
                    name="photo_url"
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="signature_url" className="block text-sm font-medium text-gray-700">Signature URL</label>
                  <input
                    type="url"
                    id="signature_url"
                    name="signature_url"
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || !status}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Tracking Update'}
          </button>
        </div>
      </form>
    </div>
  )
}
