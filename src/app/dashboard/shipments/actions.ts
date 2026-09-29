'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShipment(formData: FormData) {
  const supabase = await createClient()

  // Extract variables
  const awb = formData.get('awb') as string
  const no_dlv = formData.get('no_dlv') as string || null
  const company_id = formData.get('company_id') as string
  const recipient_id = formData.get('recipient_id') as string
  const origin_location_id = formData.get('origin_location_id') as string
  const destination_location_id = formData.get('destination_location_id') as string
  const description = formData.get('description') as string || null
  const package_count = parseInt(formData.get('package_count') as string || '1', 10)
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
  const shipment_date = formData.get('shipment_date') as string || new Date().toISOString().split('T')[0]
  const expected_delivery_date = formData.get('expected_delivery_date') as string || null
  const notes = formData.get('notes') as string || null

  const data = {
    awb,
    no_dlv,
    company_id,
    recipient_id,
    origin_location_id,
    destination_location_id,
    description,
    package_count,
    weight,
    shipment_date,
    expected_delivery_date,
    notes,
    current_status: 'DE'
  }

  const { error } = await supabase.from('shipments').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/shipments')
  return { success: true }
}

export async function deleteShipment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('shipments').delete().eq('id', id)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/shipments')
  return { success: true }
}

export async function createTrackingEvent(formData: FormData) {
  const supabase = await createClient()
  
  const shipment_id = formData.get('shipment_id') as string
  const status = formData.get('status') as string
  let timestampStr = formData.get('timestamp') as string
  
  if (!timestampStr) {
    timestampStr = new Date().toISOString()
  } else {
    // If it's a local datetime without timezone, append Z or user's offset (we'll just use what is passed, assuming it's valid ISO)
    if (timestampStr.length === 16) { // YYYY-MM-DDTHH:mm
      timestampStr = new Date(timestampStr).toISOString()
    }
  }

  const location_id = formData.get('location_id') as string || null
  const station = formData.get('station') as string || null
  const comment = formData.get('comment') as string || null
  const reason_code = formData.get('reason_code') as string || null
  const reason_note = formData.get('reason_note') as string || null
  
  const latStr = formData.get('latitude') as string
  const lngStr = formData.get('longitude') as string
  const latitude = latStr ? parseFloat(latStr) : null
  const longitude = lngStr ? parseFloat(lngStr) : null
  
  const photo_url = formData.get('photo_url') as string || null
  const signature_url = formData.get('signature_url') as string || null

  const { error } = await supabase.rpc('add_tracking_event', {
    p_shipment_id: shipment_id,
    p_status: status,
    p_timestamp: timestampStr,
    p_location_id: location_id,
    p_station: station,
    p_comment: comment,
    p_reason_code: reason_code,
    p_reason_note: reason_note,
    p_latitude: latitude,
    p_longitude: longitude,
    p_photo_url: photo_url,
    p_signature_url: signature_url
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/shipments/${shipment_id}`)
  revalidatePath('/dashboard/shipments')
  return { success: true }
}
