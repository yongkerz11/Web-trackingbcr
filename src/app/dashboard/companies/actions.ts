'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCompany(formData: FormData) {
  const supabase = await createClient()

  const data = {
    company_code: formData.get('company_code') as string,
    company_name: formData.get('company_name') as string,
    contact_person: formData.get('contact_person') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    address: formData.get('address') as string,
    status: (formData.get('status') as string) || 'ACTIVE',
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase.from('companies').insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/companies')
  return { success: true }
}

export async function deleteCompany(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('companies').delete().eq('id', id)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/companies')
  return { success: true }
}
