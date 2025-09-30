import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Find the primary supplier business
    const { data: suppliers, error: fetchError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("auth_user_id", userId)

    if (fetchError || !suppliers || suppliers.length === 0) {
      throw new Error("No supplier found for user")
    }

    const primaryBusiness = suppliers.find(s => s.data?.isPrimary) || suppliers[0]

    // Remove Outlook sync data
    const updatedData = {
      ...primaryBusiness.data,
      outlookCalendarSync: {
        connected: false,
      },
      outlookTokens: null,
    }

    const { error: updateError } = await supabase
      .from("suppliers")
      .update({ 
        data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq("id", primaryBusiness.id)

    if (updateError) {
      throw new Error("Failed to disconnect Outlook")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Outlook disconnect error:", error)
    return NextResponse.json(
      { error: "Failed to disconnect Outlook calendar" },
      { status: 500 }
    )
  }
}