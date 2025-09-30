import { NextResponse } from "next/server"

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI
const SCOPES = [
  "Calendars.Read",
  "offline_access",
  "User.Read"
].join(" ")

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Store userId in state parameter (base64 encoded)
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