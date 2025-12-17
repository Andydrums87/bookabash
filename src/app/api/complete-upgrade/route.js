import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { partyDatabaseBackend } from '@/utils/partyDatabaseBackend'

export async function POST(request) {
  try {
    const {
      partyId,
      supplierType,
      updatedData,
      paymentIntentId
    } = await request.json()

    console.log('🔄 Completing upgrade:', {
      partyId,
      supplierType,
      paymentIntentId,
      hasUpdatedData: !!updatedData,
      supplierIdFromData: updatedData?.supplier?.id,
      supplierIdFromContext: updatedData?._editContext?.supplierId,
      hasTotalPrice: !!updatedData?.totalPrice,
      hasPackage: !!updatedData?.package
    })

    // Validate required fields
    if (!partyId || !supplierType || !updatedData) {
      return NextResponse.json(
        { error: 'Missing required fields: partyId, supplierType, updatedData' },
        { status: 400 }
      )
    }

    // 1. Update the booked supplier using the backend function
    console.log('📝 Calling updateBookedSupplier with:', {
      partyId,
      supplierType,
      supplierInData: !!updatedData.supplier,
      supplierId: updatedData.supplier?.id,
      packageInData: !!updatedData.package,
      packageName: updatedData.package?.name,
      totalPrice: updatedData.totalPrice
    })

    const result = await partyDatabaseBackend.updateBookedSupplier(
      partyId,
      supplierType,
      updatedData
    )

    console.log('📝 updateBookedSupplier result:', result)

    if (!result.success) {
      console.error('❌ Failed to update booked supplier:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to update supplier' },
        { status: 500 }
      )
    }

    console.log('✅ Supplier updated successfully:', {
      changes: result.changes,
      hasMajorChanges: result.hasMajorChanges
    })

    // 2. Get party details for notifications
    const { data: party, error: partyError } = await supabaseAdmin
      .from('parties')
      .select(`
        *,
        users:user_id (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', partyId)
      .single()

    if (partyError) {
      console.warn('⚠️ Could not fetch party for notifications:', partyError)
    }

    // 3. Get supplier email for notification
    let supplierId = updatedData.supplier?.id || updatedData._editContext?.supplierId
    let supplierEmail = null
    let supplierBusinessName = null

    console.log('🔍 Looking for supplier with ID:', supplierId)

    // If no supplier ID, try to find enquiry by party_id and supplier_category
    if (!supplierId && partyId && supplierType) {
      console.log('🔍 No supplier ID, trying to find enquiry by category:', supplierType)
      const { data: enquiry } = await supabaseAdmin
        .from('enquiries')
        .select('supplier_id')
        .eq('party_id', partyId)
        .eq('supplier_category', supplierType)
        .single()

      if (enquiry?.supplier_id) {
        supplierId = enquiry.supplier_id
        console.log('✅ Found supplier ID from enquiry:', supplierId)
      }
    }

    if (supplierId) {
      const { data: supplier, error: supplierError } = await supabaseAdmin
        .from('suppliers')
        .select('business_name, data')
        .eq('id', supplierId)
        .single()

      console.log('🔍 Supplier lookup result:', {
        found: !!supplier,
        hasData: !!supplier?.data,
        error: supplierError?.message
      })

      if (supplier) {
        // Email is stored in data.owner.email
        supplierEmail = supplier.data?.owner?.email || supplier.data?.email
        supplierBusinessName = supplier.business_name
        console.log('📧 Supplier email found:', supplierEmail)
      }
    } else {
      console.warn('⚠️ No supplier ID found - cannot send notification or update enquiry')
    }

    // 4. Send supplier notification email if there are changes
    if (result.changes?.length > 0 && supplierEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://partysnap.co.uk'

        await fetch(`${baseUrl}/api/email/booking-updated`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplierEmail,
            supplierName: supplierBusinessName,
            customerName: party?.users?.first_name || 'Customer',
            childName: party?.child_name || 'Child',
            theme: party?.theme || 'themed',
            partyDate: party?.date,
            changes: result.changes,
            dashboardLink: `${baseUrl}/suppliers/dashboard`
          })
        })

        console.log('📧 Supplier notification email sent')
      } catch (emailError) {
        console.warn('⚠️ Failed to send supplier notification:', emailError)
        // Don't fail the request if email fails
      }
    }

    // 5. Record the upgrade payment in payment history if paymentIntentId provided
    if (paymentIntentId && party) {
      const editContext = updatedData._editContext || {}
      const originalPrice = editContext.originalPrice || 0
      const newPrice = editContext.newPrice || updatedData.totalPrice || 0
      const upgradeAmount = newPrice - originalPrice

      // Update the enquiry with upgraded status
      if (supplierId) {
        await supabaseAdmin
          .from('enquiries')
          .update({
            upgrade_payment_id: paymentIntentId,
            upgrade_amount: upgradeAmount,
            upgraded_at: new Date().toISOString()
          })
          .eq('party_id', partyId)
          .eq('supplier_id', supplierId)
      }
    }

    return NextResponse.json({
      success: true,
      changes: result.changes,
      message: 'Upgrade completed successfully'
    })

  } catch (error) {
    console.error('❌ Error completing upgrade:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete upgrade' },
      { status: 500 }
    )
  }
}
