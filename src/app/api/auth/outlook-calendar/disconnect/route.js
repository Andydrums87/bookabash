import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

async function deleteOutlookWebhook(accessToken, subscriptionId) {
  try {
    await fetch(
      `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }
    )
  } catch (error) {
    console.error('Failed to delete Outlook webhook:', error)
  }
}

export async function POST(request) {
  try {
    // Require Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Validate session with Supabase
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Validate userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all suppliers for this user
    const { data: suppliers, error: fetchError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("auth_user_id", userId)

    if (fetchError || !suppliers || suppliers.length === 0) {
      throw new Error("No suppliers found for user")
    }

    const primaryBusiness = suppliers.find(s => s.is_primary || s.data?.isPrimary)

    if (!primaryBusiness) {
      throw new Error("No primary business found")
    }

    // Delete webhook subscription if exists
    if (primaryBusiness.data?.outlookCalendarSync?.subscriptionId) {
      const outlookTokens = primaryBusiness.data.outlookTokens
      if (outlookTokens?.accessToken) {
        await deleteOutlookWebhook(
          outlookTokens.accessToken, 
          primaryBusiness.data.outlookCalendarSync.subscriptionId
        )
      }
    }

    // Remove Outlook sync data from ALL suppliers (primary + themed)
    for (const supplier of suppliers) {
      const updatedData = {
        ...supplier.data,
        outlookCalendarSync: {
          connected: false,
        },
        outlookTokens: null,
      }

      await supabase
        .from("suppliers")
        .update({ 
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq("id", supplier.id)
      
      console.log(`Disconnected Outlook from: ${supplier.data?.name}`)
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