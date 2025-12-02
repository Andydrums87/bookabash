import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI
const SCOPES = [
  "Calendars.Read",
  "offline_access",
  "User.Read",
  "Calendars.ReadWrite"
].join(" ")

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

    // Extract actual userId if using wizard format (wizard-{userId}:supplier:{supplierId})
    let actualUserId = userId
    if (userId.startsWith('wizard-')) {
      const match = userId.match(/^wizard-([^:]+):supplier:/)
      if (match) {
        actualUserId = match[1]
      }
    }

    // Validate actualUserId matches authenticated user
    if (actualUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Store the full userId in state parameter (base64 encoded) - preserving wizard format if present
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64')

    // Microsoft OAuth authorization URL
    const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")
    authUrl.searchParams.append("client_id", MICROSOFT_CLIENT_ID)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", MICROSOFT_REDIRECT_URI)
    authUrl.searchParams.append("response_mode", "query")
    authUrl.searchParams.append("scope", SCOPES)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("prompt", "consent")

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error("Outlook auth initiation error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Outlook authorization" },
      { status: 500 }
    )
  }
}