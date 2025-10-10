

import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { googleCalendarSync } = await request.json()

    // Get current user
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabaseClient.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get supplier data
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .eq('is_primary', true)
      .single()

    if (fetchError || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // Update supplier with new sync settings
    const updatedData = {
      ...supplier.data,
      googleCalendarSync: {
        ...supplier.data.googleCalendarSync,
        ...googleCalendarSync
      },
      updatedAt: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ data: updatedData })
      .eq('id', supplier.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}