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
  const shipment_date = formData.get('shipment_date') as string
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
