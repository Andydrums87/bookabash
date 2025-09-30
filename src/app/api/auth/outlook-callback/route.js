import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL(`/suppliers/dashboard?error=outlook_auth_failed`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/suppliers/dashboard?error=missing_params`, request.url)
      )
    }

    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          code: code,
          redirect_uri: MICROSOFT_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    )

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed")
    }

    const tokens = await tokenResponse.json()

    // Get user's primary calendar ID
    const calendarResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/calendar",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    const calendar = await calendarResponse.json()

    // Find the primary supplier business for this user
    const { data: suppliers, error: fetchError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("auth_user_id", userId)

    if (fetchError || !suppliers || suppliers.length === 0) {
      throw new Error("No supplier found for user")
    }

    const primaryBusiness = suppliers.find(s => s.data?.isPrimary) || suppliers[0]

    // Store tokens in supplier data
    const updatedData = {
      ...primaryBusiness.data,
      outlookCalendarSync: {
        connected: true,
        calendarId: calendar.id,
        email: calendar.owner?.address,
        lastSync: new Date().toISOString(),
      },
      outlookTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      },
    }

    const { error: updateError } = await supabase
      .from("suppliers")
      .update({ 
        data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq("id", primaryBusiness.id)

    if (updateError) {
      throw new Error("Failed to save tokens")
    }

    return NextResponse.redirect(
      new URL("/suppliers/dashboard?outlook_connected=true", request.url)
    )
  } catch (error) {
    console.error("Outlook callback error:", error)
    return NextResponse.redirect(
      new URL(`/suppliers/dashboard?error=outlook_connection_failed`, request.url)
    )
  }
}